/**
 * @fileoverview Realistic Ethiopian Network Seeder — Batched & Fast
 *
 * Populates the platform with a realistic 4-level MLM network using the
 * 126 Ethiopian name/email/phone roster provided by the operator.
 *
 * SPEED OPTIMIZATIONS:
 *   - Bulk multi-row INSERT for users (1 query per level, not per user)
 *   - Parallel referral tree builds (batches of 10)
 *   - Parallel commission distribution (batches of 15)
 *   - Parallel bonus awarding (batches of 20)
 *   - All bulk operations use a single connection to Neon when possible
 *
 * Volume profile:
 *   - Purchase rate: 85% of users buy
 *   - Unlock rate:   80% of commissions/bonuses unlocked
 *   - Withdrawals:   10 pending · 8 paid · 3 rejected
 *   - Amounts:       3x–6x minimum withdrawal
 *
 * Non-destructive: everything is tagged with TEST_PHONE_PREFIX ('999')
 * and TEST_EMAIL_DOMAIN ('test.abyssinia.local') so `clean` never
 * touches real users.
 *
 * Usage:
 *   node tools/seed-realistic.js seed            # full seed + unlock
 *   node tools/seed-realistic.js seed --locked   # keep 7-day lock
 *   node tools/seed-realistic.js report          # dump current state
 *   node tools/seed-realistic.js clean           # remove all seed data
 *
 * Path: tools/seed-realistic.js
 */

const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'api', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sharedConfig = require('../packages/shared/config');
const mlm = require('../packages/shared/mlm');
const referralConfig = sharedConfig.referrals;
const paymentsConfig = sharedConfig.payments;

/* ── Tagging ─────────────────────────────────────────────────────────── */
const TEST_PASSWORD = 'MlmTest@123!';
const TEST_PASSWORD_HASH = bcrypt.hashSync(TEST_PASSWORD, 10);
const TEST_PHONE_PREFIX = '999';
const TEST_EMAIL_DOMAIN = 'test.abyssinia.local';

/* ── Config-derived (zero hardcoding) ────────────────────────────────── */
const FULL_PRICE = paymentsConfig.pricing.fullCourse.amountETB;
const REFERRED_PRICE = paymentsConfig.pricing.fullCourse.referredAmountETB;
const MIN_WITHDRAWAL = referralConfig.withdrawal.minimumAmountETB;
const UNLOCK_DELAY_DAYS = referralConfig.commissionStructure.unlockDelayDays;

/* ── Network shape ───────────────────────────────────────────────────── */
const ROOT_COUNT = 3;
const L1_PER_ROOT_MIN = 5;
const L1_PER_ROOT_MAX = 8;
const L2_PER_PARENT_MIN = 2;
const L2_PER_PARENT_MAX = 3;
const L3_PER_PARENT_MIN = 1;
const L3_PER_PARENT_MAX = 2;
const L4_PER_PARENT_MIN = 1;
const L4_PER_PARENT_MAX = 1;

/* ── Volume profile (BOOSTED) ────────────────────────────────────────── */
const PURCHASE_RATE = 0.85;
const UNLOCK_RATE = 0.80;
const PENDING_WITHDRAWALS = 10;
const PAID_WITHDRAWALS = 8;
const REJECTED_WITHDRAWALS = 3;
const WITHDRAWAL_MULTIPLIER_MIN = 3;
const WITHDRAWAL_MULTIPLIER_MAX = 6;

/* ── Parallel batch sizes (tuned for Neon) ───────────────────────────── */
const TREE_BATCH = 10;
const PURCHASE_BATCH = 15;
const BONUS_BATCH = 20;

/* ── Ethiopian roster (126 users) ────────────────────────────────────── */
const ROSTER = [
  { name: 'Abebe Bikila', email: 'abebebikila23', phone: '0911234511' },
  { name: 'Almaz Ayana Megersa', email: 'almazayana', phone: '0702345612' },
  { name: 'Yohannes Gebremedhin', email: 'yohannesgeb99', phone: '0913456713' },
  { name: 'Biruk Worku Assefa', email: 'birukworku4', phone: '0914567814' },
  { name: 'Martha Hailemariam', email: 'marthahaile', phone: '0705678915' },
  { name: 'Dawit Solomon Girma', email: 'dawitsolomon06', phone: '0916789016' },
  { name: 'Eden Tesfaye', email: 'edentesfaye88', phone: '0707890117' },
  { name: 'Yonas Fisseha Desta', email: 'yonasfisseha', phone: '0918901218' },
  { name: 'Helen Kifle', email: 'helenkifle12', phone: '0919012319' },
  { name: 'Samuel Tilahun Kebede', email: 'samueltilahun', phone: '0710123420' },
  { name: 'Betelhem Mulugeta', email: 'betty.mulugeta', phone: '0921234521' },
  { name: 'Michael Berhanu Zewde', email: 'mikeberhanu', phone: '0712345622' },
  { name: 'Selamawit Moges', email: 'selam.moges7', phone: '0923456723' },
  { name: 'Tewodros Kassahun Lemma', email: 'teddykassahun', phone: '0924567824' },
  { name: 'Meron Tadesse', email: 'merontadesse01', phone: '0715678925' },
  { name: 'Caleb Amanuel Chala', email: 'calebamanuel', phone: '0926789026' },
  { name: 'Kalkidan Daniel', email: 'kalidaniel95', phone: '0717890127' },
  { name: 'Natnael Belaynehe Wolde', email: 'nati.belay', phone: '0928901228' },
  { name: 'Tigist Tamirat', email: 'tigisttamirat', phone: '0929012329' },
  { name: 'Biniyam Nigusse Sisay', email: 'biniyamnigusse', phone: '0720123430' },
  { name: 'Hiwot Bogale', email: 'hiwotbogale31', phone: '0931234531' },
  { name: 'Robel Sisay Cherenet', email: 'robelsisay', phone: '0722345632' },
  { name: 'Bethlehem Fitsum', email: 'bethyfitsum', phone: '0933456733' },
  { name: 'Surafel Fikru Negash', email: 'surafelfikru24', phone: '0724567834' },
  { name: 'Tsion Mesfin', email: 'tsionmesfin00', phone: '0935678935' },
  { name: 'Henok Dereje Tola', email: 'henokdereje', phone: '0936789036' },
  { name: 'Rahel Endale', email: 'rahelendale77', phone: '0727890137' },
  { name: 'Eyob Tariku Diriba', email: 'eyobtariku', phone: '0938901238' },
  { name: 'Netsanet Zeleke', email: 'netsanetzeleke', phone: '0729012329' },
  { name: 'Abel Seyoum Abera', email: 'abelseyoum', phone: '0940123440' },
  { name: 'Bezawit Getu', email: 'bezawitgetu92', phone: '0771234541' },
  { name: 'Elias Getachew Bedane', email: 'eliasgetachew', phone: '0942345642' },
  { name: 'Hanan Kedir', email: 'hanankedir5', phone: '0773456743' },
  { name: 'Kirubel Mulatu Tolossa', email: 'kirubelmulatu', phone: '0944567844' },
  { name: 'Ruth Lemma', email: 'ruthlemma21', phone: '0945678945' },
  { name: 'Solomon Asefa Teklu', email: 'solomonasefa', phone: '0776789046' },
  { name: 'Mahlet Asrat', email: 'mahletasrat09', phone: '0947890147' },
  { name: 'Fitsum Mengistu Tefera', email: 'fitsummengistu', phone: '0701112248' },
  { name: 'Feven Teferi', email: 'feventeferi', phone: '0949012349' },
  { name: 'Eyouel Hailu Tadesse', email: 'eyouelhailu', phone: '0703334450' },
  { name: 'Meklit Workineh', email: 'meklitworkineh', phone: '0951234551' },
  { name: 'Brook Desalegn Gobena', email: 'brookdesalegn', phone: '0705556652' },
  { name: 'Senait Shiferaw', email: 'senaitshiferaw', phone: '0953456753' },
  { name: 'Bilisuma Diriba Tura', email: 'bilisumadiriba', phone: '0954567854' },
  { name: 'Hawi Gudeta', email: 'hawigudeta10', phone: '0708889955' },
  { name: 'Milkessa Tolera Kumsa', email: 'milkessatolera', phone: '0956789056' },
  { name: 'Chaltu Bekele', email: 'chaltubekele', phone: '0712223357' },
  { name: 'Gemechu Daba Olana', email: 'gemechudaba', phone: '0958901258' },
  { name: 'Bontu Fikadu', email: 'bontufikadu2', phone: '0959012359' },
  { name: 'Kenenisa Roba Dinagde', email: 'kenenisaroba', phone: '0715556660' },
  { name: 'Caala Benti', email: 'caalabenti', phone: '0961234561' },
  { name: 'Obsi Beyene Lemma', email: 'obsibeyene', phone: '0717778862' },
  { name: 'Lensa Taye', email: 'lensataye88', phone: '0963456763' },
  { name: 'Ebisa Abdisa Motuma', email: 'ebisaabdisa', phone: '0964567864' },
  { name: 'Ayana Gurmesa', email: 'ayanagurmesa', phone: '0722223365' },
  { name: 'Sifan Lema Dabala', email: 'sifanlema', phone: '0966789056' },
  { name: 'Desta Hailu', email: 'destahailu15', phone: '0724445567' },
  { name: 'Kiros Redae Berhe', email: 'kirosredae', phone: '0968901268' },
  { name: 'Weyni Gebremichael', email: 'weynigebre', phone: '0969012369' },
  { name: 'Teklit Girmay Hagos', email: 'teklitgirmay', phone: '0727778870' },
  { name: 'Freweyni Tesfay', email: 'freweynitesfay', phone: '0971234571' },
  { name: 'Berhane Woldu Weldegebriel', email: 'berhanewoldu', phone: '0771112272' },
  { name: 'Letebrihan Mezgebe', email: 'letebrihanm', phone: '0973456773' },
  { name: 'Mulugeta Aregawi Hiluf', email: 'mulugetaaregawi', phone: '0773334474' },
  { name: 'Tsega Kindeya', email: 'tsegakindeya', phone: '0975678975' },
  { name: 'Goitom Assefa Gebru', email: 'goitomassefa', phone: '0976789076' },
  { name: 'Roman Nega', email: 'romannega11', phone: '0776667777' },
  { name: 'Fitsumbirhan Araya Haile', email: 'fitsumaraya', phone: '0978901278' },
  { name: 'Hadush Negash', email: 'hadushnegash', phone: '0778889979' },
  { name: 'Hagos Kidane Teklu', email: 'hagoskidane', phone: '0980123480' },
  { name: 'Roman Gebre', email: 'romangebre90', phone: '0981234581' },
  { name: 'Yordanos Solomon Alemayehu', email: 'yordanossolomon', phone: '0707772282' },
  { name: 'Abel Birhanu', email: 'abelbirhanu7', phone: '0983456783' },
  { name: 'Bethlehem Kassahun Worku', email: 'bethlehemkassahun', phone: '0705554484' },
  { name: 'Daniel Zewdu', email: 'danielzewdu', phone: '0985678985' },
  { name: 'Kidist Getachew Girma', email: 'kidistgetachew', phone: '0986789086' },
  { name: 'Mikiyas Kebede', email: 'miki.kebede', phone: '0702227787' },
  { name: 'Tsion Fikru Molla', email: 'tsionfikru', phone: '0988901288' },
  { name: 'Brook Alemu', email: 'brookalemu22', phone: '0719990089' },
  { name: 'Rediet Mulugeta Kassa', email: 'redietmulugeta', phone: '0910123490' },
  { name: 'Nahom Dawit', email: 'nahomdawit', phone: '0911234591' },
  { name: 'Hermela Bogale Chala', email: 'hermelabogale', phone: '0716663392' },
  { name: 'Yared Wolde', email: 'yaredwolde84', phone: '0913456793' },
  { name: 'Bitaniya Sisay Feyissa', email: 'bitaniyasisay', phone: '0714445594' },
  { name: 'Robel Hailemariam', email: 'robelhaile', phone: '0915678995' },
  { name: 'Salem Tadesse Woldemariam', email: 'salemtadesse', phone: '0916789096' },
  { name: 'Yonas Workineh', email: 'yonasworkineh', phone: '0711118897' },
  { name: 'Ruth Tamirat Gemechu', email: 'ruthtamirat', phone: '0918901298' },
  { name: 'Abenezer Dereje', email: 'abenezerdereje', phone: '0728881199' },
  { name: 'Deborah Endale Regassa', email: 'deborahendale', phone: '0920123401' },
  { name: 'Leul Mesfin', email: 'leulmesfin3', phone: '0921234502' },
  { name: 'Segen Getu Wakgari', email: 'segengetu', phone: '0725554403' },
  { name: 'Kaleab Bedane', email: 'kaleabbedane', phone: '0923456704' },
  { name: 'Yeabsira Deresse Ejeta', email: 'yeabsiraderesse', phone: '0723336605' },
  { name: 'Binyam Tefera', email: 'binyamtefera91', phone: '0925678906' },
  { name: 'Rahel Hirpa Gebre', email: 'rahelhirpa', phone: '0926789007' },
  { name: 'Jeremiah Lema', email: 'jeremiahlema', phone: '0779990008' },
  { name: 'Liya Gobena Kahsay', email: 'liyagobena', phone: '0928901209' },
  { name: 'Nathan Kenea', email: 'nathankenea44', phone: '0777772210' },
  { name: 'Nardos Benti Abraha', email: 'nardosbenti', phone: '0930123411' },
  { name: 'Solomon Lemma', email: 'solomonlemma', phone: '0931234512' },
  { name: 'Hanna Taye Hadgu', email: 'hannataye', phone: '0774445513' },
  { name: 'Markos Abdisa', email: 'markosabdisa', phone: '0933456714' },
  { name: 'Rebeca Gurmesa Medhane', email: 'rebecagurmesa', phone: '0772227715' },
  { name: 'Timothy Aregawi', email: 'timothyaregawi', phone: '0935678916' },
  { name: 'Abigail Redae Kassa', email: 'abigailredae', phone: '0936789017' },
  { name: 'Benjamin Woldu', email: 'benjaminwoldu', phone: '0702020218' },
  { name: 'Chloe Mezgebe Zere', email: 'chloemezgebe', phone: '0938901219' },
  { name: 'Daniel Kindeya', email: 'danielkindeya', phone: '0704040420' },
  { name: 'Elizabeth Assefa Tadesse', email: 'elizabethassefa', phone: '0940123421' },
  { name: 'Ezra Nega', email: 'ezranega10', phone: '0941234522' },
  { name: 'Grace Araya Mengesha', email: 'gracearaya', phone: '0707070723' },
  { name: 'Isaac Negash', email: 'isaacnegash', phone: '0943456724' },
  { name: 'Joanna Kidane Belay', email: 'joannakidane', phone: '0709090925' },
  { name: 'Joseph Gebre', email: 'josephgebre', phone: '0945678926' },
  { name: 'Leah Solomon Assefa', email: 'leahsolomon', phone: '0946789027' },
  { name: 'Levi Birhanu', email: 'levibirhanu99', phone: '0713030328' },
  { name: 'Lydia Kassahun Desta', email: 'lydiakassahun', phone: '0948901229' },
  { name: 'Matthew Zewdu', email: 'matthewzewdu', phone: '0715050530' },
  { name: 'Naomi Getachew Tesfaye', email: 'naomigetachew', phone: '0950123431' },
  { name: 'Noah Kebede', email: 'noahkebede01', phone: '0951234532' },
  { name: 'Rachel Molla Bekele', email: 'rachelmolla', phone: '0718080833' },
  { name: 'Samuel Desta', email: 'samueldesta85', phone: '0953456734' },
  { name: 'Sarah Kassa Megersa', email: 'sarahkassa', phone: '0720101035' },
  { name: 'Simon Tesfaye', email: 'simontesfaye', phone: '0955678936' },
  { name: 'Victoria Chala Gemechu', email: 'victoriachala', phone: '0722020237' },
];

/* ── DB pool with tuned settings for fast seeding ────────────────────── */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
  max: 20,                      /* Allow many concurrent queries */
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};

/**
 * Deterministic pseudo-random in [min, max] based on a seed.
 * @param {number} seed
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const seededRange = (seed, min, max) => {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return min + Math.floor(frac * (max - min + 1));
};

/**
 * Chunk an array into batches of a given size.
 * @template T
 * @param {T[]} arr
 * @param {number} size
 * @returns {T[][]}
 */
const chunk = (arr, size) => {
  const batches = [];
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size));
  }
  return batches;
};

/* ============================================================================
 * BULK USER CREATION
 * ========================================================================== */

/**
 * Create N users in a single multi-row INSERT. Returns created ids in order.
 * Also inserts wallets in a single multi-row INSERT.
 *
 * @param {number} count - Number of roster entries to consume
 * @returns {Promise<Array<{id, name, email, phone}>>}
 */
const bulkCreateUsers = async (count) => {
  if (count <= 0) return [];
  const slice = ROSTER.slice(globalThis.__rosterIndex || 0, (globalThis.__rosterIndex || 0) + count);
  globalThis.__rosterIndex = (globalThis.__rosterIndex || 0) + count;

  const params = [];
  const placeholders = [];
  let p = 1;

  for (const entry of slice) {
    const nameIdx = p++;
    const phoneIdx = p++;
    const emailIdx = p++;
    const passIdx = p++;
    placeholders.push(`($${nameIdx}, $${phoneIdx}, $${emailIdx}, $${passIdx}, TRUE)`);
    params.push(
      entry.name,
      `${TEST_PHONE_PREFIX}${entry.phone}`,
      `${entry.email}@${TEST_EMAIL_DOMAIN}`,
      TEST_PASSWORD_HASH
    );
  }

  const sql = `
    INSERT INTO users (full_name, phone, email, password, is_enrolled)
    VALUES ${placeholders.join(', ')}
    RETURNING id, full_name, phone, email
  `;

  const result = await pool.query(sql, params);

  /* Bulk-insert wallets */
  const userIds = result.rows.map((r) => r.id);
  const walletPlaceholders = userIds.map((_, i) => `($${i + 1})`).join(', ');
  await pool.query(
    `INSERT INTO affiliate_wallets (user_id) VALUES ${walletPlaceholders}
     ON CONFLICT (user_id) DO NOTHING`,
    userIds
  );

  return result.rows.map((row, i) => ({
    id: row.id,
    name: slice[i].name,
    email: `${slice[i].email}@${TEST_EMAIL_DOMAIN}`,
    phone: `${TEST_PHONE_PREFIX}${slice[i].phone}`,
  }));
};

/**
 * Helper: reorder [name, phone, email] triples for the parameterized insert.
 * @param {string[]} names
 * @param {string[]} phones
 * @param {string[]} emails
 * @returns {string[]}
 */
const interleave = (names, phones, emails) => {
  const out = [];
  for (let i = 0; i < names.length; i++) {
    out.push(names[i], phones[i], emails[i]);
  }
  return out;
};

/* ============================================================================
 * TREE BUILDER (parallelized)
 * ========================================================================== */

/**
 * Build referral tree entries for a batch of (child, parent) pairs in
 * parallel. Uses the real `buildReferralTree` engine per pair.
 *
 * @param {Array<{childId: string, parentId: string, label: string}>} pairs
 */
const buildTreesInParallel = async (pairs) => {
  const batches = chunk(pairs, TREE_BATCH);
  for (const batch of batches) {
    await Promise.all(
      batch.map(({ childId, parentId }) =>
        mlm.buildReferralTree(db, referralConfig, childId, parentId)
      )
    );
  }
};

/* ============================================================================
 * NETWORK BUILD
 * ========================================================================== */

/**
 * Build the full 4-level network using the roster in order.
 *
 * @returns {Promise<Array<{id, name, email, phone, depth, parentId}>>}
 */
const buildNetwork = async () => {
  console.log('\n🏗️  Building realistic 4-level network (batched)...\n');
  globalThis.__rosterIndex = 0;

  const users = [];

  /* Roots */
  const roots = await bulkCreateUsers(ROOT_COUNT);
  roots.forEach((u) => users.push({ ...u, depth: 0, parentId: null }));
  console.log(`   • ${ROOT_COUNT} root users created`);

  /* Compute branch counts so we know how many to allocate per level */
  const l1Counts = roots.map((_, idx) =>
    seededRange(idx + 1, L1_PER_ROOT_MIN, L1_PER_ROOT_MAX)
  );
  const totalL1 = l1Counts.reduce((a, b) => a + b, 0);
  const level1 = await bulkCreateUsers(totalL1);

  /* Assign parents and build tree in parallel */
  const l1Pairs = [];
  let l1Cursor = 0;
  for (let r = 0; r < roots.length; r++) {
    for (let i = 0; i < l1Counts[r]; i++) {
      const child = level1[l1Cursor++];
      l1Pairs.push({ childId: child.id, parentId: roots[r].id });
    }
  }
  await buildTreesInParallel(l1Pairs);

  /* Attach depth and parentId */
  l1Cursor = 0;
  for (let r = 0; r < roots.length; r++) {
    for (let i = 0; i < l1Counts[r]; i++) {
      const child = level1[l1Cursor++];
      const entry = { ...child, depth: 1, parentId: roots[r].id };
      users.push(entry);
      level1[l1Cursor - 1] = entry; /* mutate in place */
    }
  }
  console.log(`   • Level 1: ${level1.length} users`);

  /* Level 2 */
  const l2Counts = level1.map((_, idx) =>
    seededRange(idx + 100, L2_PER_PARENT_MIN, L2_PER_PARENT_MAX)
  );
  const totalL2 = Math.min(
    l2Counts.reduce((a, b) => a + b, 0),
    ROSTER.length - globalThis.__rosterIndex
  );
  const level2 = await bulkCreateUsers(totalL2);

  const l2Pairs = [];
  let l2Cursor = 0;
  for (let p = 0; p < level1.length && l2Cursor < level2.length; p++) {
    for (let i = 0; i < l2Counts[p] && l2Cursor < level2.length; i++) {
      l2Pairs.push({ childId: level2[l2Cursor].id, parentId: level1[p].id });
      const entry = { ...level2[l2Cursor], depth: 2, parentId: level1[p].id };
      users.push(entry);
      level2[l2Cursor] = entry;
      l2Cursor++;
    }
  }
  await buildTreesInParallel(l2Pairs);
  console.log(`   • Level 2: ${l2Pairs.length} users`);

  /* Level 3 */
  const l3Counts = level2.map((_, idx) =>
    seededRange(idx + 200, L3_PER_PARENT_MIN, L3_PER_PARENT_MAX)
  );
  const totalL3 = Math.min(
    l3Counts.reduce((a, b) => a + b, 0),
    ROSTER.length - globalThis.__rosterIndex
  );
  const level3 = await bulkCreateUsers(totalL3);

  const l3Pairs = [];
  let l3Cursor = 0;
  for (let p = 0; p < level2.length && l3Cursor < level3.length; p++) {
    for (let i = 0; i < l3Counts[p] && l3Cursor < level3.length; i++) {
      l3Pairs.push({ childId: level3[l3Cursor].id, parentId: level2[p].id });
      const entry = { ...level3[l3Cursor], depth: 3, parentId: level2[p].id };
      users.push(entry);
      level3[l3Cursor] = entry;
      l3Cursor++;
    }
  }
  await buildTreesInParallel(l3Pairs);
  console.log(`   • Level 3: ${l3Pairs.length} users`);

  /* Level 4 */
  const l4Counts = level3.map((_, idx) =>
    seededRange(idx + 300, L4_PER_PARENT_MIN, L4_PER_PARENT_MAX)
  );
  const totalL4 = Math.min(
    l4Counts.reduce((a, b) => a + b, 0),
    ROSTER.length - globalThis.__rosterIndex
  );
  const level4 = await bulkCreateUsers(totalL4);

  const l4Pairs = [];
  let l4Cursor = 0;
  for (let p = 0; p < level3.length && l4Cursor < level4.length; p++) {
    for (let i = 0; i < l4Counts[p] && l4Cursor < level4.length; i++) {
      l4Pairs.push({ childId: level4[l4Cursor].id, parentId: level3[p].id });
      const entry = { ...level4[l4Cursor], depth: 4, parentId: level3[p].id };
      users.push(entry);
      level4[l4Cursor] = entry;
      l4Cursor++;
    }
  }
  await buildTreesInParallel(l4Pairs);
  console.log(`   • Level 4: ${l4Pairs.length} users`);

  console.log(`   • Total network: ${users.length} users`);
  return users;
};

/* ============================================================================
 * PURCHASES + COMMISSIONS (parallel)
 * ========================================================================== */

/**
 * Create one approved payment + distribute commissions.
 *
 * @param {object} buyer
 * @param {number} seq
 */
const runPurchase = async (buyer, seq) => {
  const amount = buyer.depth > 0 ? REFERRED_PRICE : FULL_PRICE;

  const payment = await pool.query(
    `INSERT INTO payments
       (user_id, amount, method, status, reference, purchase_mode, paid_at)
     VALUES ($1, $2, 'telebirr', 'approved', $3, 'full-course', NOW())
     RETURNING id`,
    [buyer.id, amount, `SEED-${String(seq).padStart(4, '0')}`]
  );

  return mlm.distributeCommissions(
    db,
    referralConfig,
    buyer.id,
    payment.rows[0].id,
    amount
  );
};

/**
 * Run purchases for ~85% of the network in parallel batches.
 *
 * @param {Array} users
 */
const runAllPurchases = async (users) => {
  console.log('\n💳 Processing purchases (parallel batches)...\n');

  const buyers = users.filter(
    (_, idx) => seededRange(idx + 500, 1, 100) <= PURCHASE_RATE * 100
  );
  console.log(
    `   • ${buyers.length} of ${users.length} users will purchase (${Math.round(PURCHASE_RATE * 100)}% conversion)`
  );

  const batches = chunk(buyers, PURCHASE_BATCH);
  let processed = 0;

  for (const batch of batches) {
    await Promise.all(
      batch.map((user, off) => runPurchase(user, processed + off + 1))
    );
    processed += batch.length;
    if (processed % 30 === 0 || processed === buyers.length) {
      console.log(`   • ${processed}/${buyers.length} purchases distributed`);
    }
  }
};

/* ============================================================================
 * BONUSES (parallel, 2 passes)
 * ========================================================================== */

/**
 * Award bonuses for every user via the real bonus engine, twice (to catch
 * thresholds that become reachable after the first pass).
 *
 * @param {Array} users
 */
const awardAllBonuses = async (users) => {
  console.log('\n🎁 Awarding bonuses (parallel, 2 passes)...');

  for (let pass = 0; pass < 2; pass++) {
    const batches = chunk(users, BONUS_BATCH);
    for (const batch of batches) {
      await Promise.all(
        batch.map((u) =>
          mlm.awardEligibleBonuses(db, referralConfig, u.id).catch((err) => {
            console.error(`   ⚠️  Bonus for ${u.name}: ${err.message}`);
          })
        )
      );
    }
  }

  const bonusCount = await pool.query(
    `SELECT COUNT(*)::int AS count FROM referral_bonuses
     WHERE user_id IN (SELECT id FROM users WHERE phone LIKE $1)`,
    [`${TEST_PHONE_PREFIX}%`]
  );
  console.log(`   • ${bonusCount.rows[0].count} bonus rows awarded`);
};

/* ============================================================================
 * UNLOCK
 * ========================================================================== */

/**
 * Detect whether unlock_at on affiliate_commissions is a generated column.
 * @returns {Promise<boolean>}
 */
const isCommissionUnlockGenerated = async () => {
  const result = await pool.query(
    `SELECT attgenerated FROM pg_attribute
     WHERE attrelid = 'affiliate_commissions'::regclass AND attname = 'unlock_at'`
  );
  return result.rows[0]?.attgenerated === 's';
};

/**
 * Back-date a deterministic slice of commissions so they unlock.
 * @param {boolean} generated
 */
const unlockCommissionSlice = async (generated) => {
  console.log(`\n🔓 Unlocking ~${Math.round(UNLOCK_RATE * 100)}% of commissions...`);

  const userFilter = `(SELECT id FROM users WHERE phone LIKE '${TEST_PHONE_PREFIX}%')`;

  if (generated) {
    await pool.query(
      `UPDATE affiliate_commissions
       SET created_at = created_at - INTERVAL '${UNLOCK_DELAY_DAYS + 1} days'
       WHERE earning_user_id IN ${userFilter}
         AND status = 'credited'
         AND (abs(hashtext(id::text)) % 100) < $1`,
      [UNLOCK_RATE * 100]
    );
  } else {
    await pool.query(
      `UPDATE affiliate_commissions
       SET unlock_at = NOW() - INTERVAL '1 day'
       WHERE earning_user_id IN ${userFilter}
         AND status = 'credited'
         AND (abs(hashtext(id::text)) % 100) < $1`,
      [UNLOCK_RATE * 100]
    );
  }

  await pool.query(
    `UPDATE referral_bonuses
     SET unlock_at = NOW() - INTERVAL '1 day'
     WHERE user_id IN ${userFilter}
       AND status = 'credited'
       AND (abs(hashtext(id::text)) % 100) < $1`,
    [UNLOCK_RATE * 100]
  );

  const unlockedCommissions = await pool.query(
    `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
     FROM affiliate_commissions
     WHERE earning_user_id IN ${userFilter}
       AND status = 'credited' AND unlock_at <= NOW()`
  );
  const unlockedBonuses = await pool.query(
    `SELECT COALESCE(SUM(amount), 0)::numeric AS total
     FROM referral_bonuses
     WHERE user_id IN ${userFilter}
       AND status = 'credited' AND unlock_at <= NOW()`
  );

  console.log(`   • ${unlockedCommissions.rows[0].total} ETB commissions unlocked`);
  console.log(`   • ${unlockedBonuses.rows[0].total} ETB bonuses unlocked`);
};

/* ============================================================================
 * WITHDRAWALS
 * ========================================================================== */

/**
 * Plant sample withdrawal requests across all statuses with boosted amounts.
 * @param {Array} users
 */
const seedWithdrawalSamples = async (users) => {
  console.log('\n💸 Planting withdrawal samples...');

  const eligibleUsers = await pool.query(
    `SELECT u.id, u.full_name AS name, u.phone, w.current_balance
     FROM users u
     JOIN affiliate_wallets w ON w.user_id = u.id
     WHERE u.phone LIKE $1
       AND w.current_balance >= $2
     ORDER BY w.current_balance DESC
     LIMIT 40`,
    [`${TEST_PHONE_PREFIX}%`, MIN_WITHDRAWAL * WITHDRAWAL_MULTIPLIER_MIN]
  );

  const candidates = eligibleUsers.rows;
  if (candidates.length === 0) {
    console.log('   ⚠️  No users with sufficient balance — skipping withdrawals');
    return;
  }

  let cursor = 0;

  /* PENDING */
  const pendingCount = Math.min(PENDING_WITHDRAWALS, candidates.length - cursor);
  for (let i = 0; i < pendingCount; i++, cursor++) {
    const user = candidates[cursor];
    const multiplier = seededRange(
      i + 700,
      WITHDRAWAL_MULTIPLIER_MIN,
      WITHDRAWAL_MULTIPLIER_MAX
    );
    const amount = MIN_WITHDRAWAL * multiplier;

    await pool.query(
      `UPDATE affiliate_wallets
       SET current_balance = current_balance - $2,
           pending_withdrawal = pending_withdrawal + $2
       WHERE user_id = $1`,
      [user.id, amount]
    );

    await pool.query(
      `INSERT INTO withdrawal_requests
         (user_id, amount, method, account_number, account_name, status)
       VALUES ($1, $2, 'telebirr', $3, $4, 'pending')`,
      [user.id, amount, user.phone, user.name]
    );
  }
  console.log(`   • ${pendingCount} PENDING withdrawals (admin queue)`);

  /* PAID */
  const paidCount = Math.min(PAID_WITHDRAWALS, candidates.length - cursor);
  for (let i = 0; i < paidCount; i++, cursor++) {
    const user = candidates[cursor];
    const multiplier = seededRange(
      i + 800,
      WITHDRAWAL_MULTIPLIER_MIN,
      WITHDRAWAL_MULTIPLIER_MAX
    );
    const amount = MIN_WITHDRAWAL * multiplier;

    await pool.query(
      `UPDATE affiliate_wallets
       SET current_balance = current_balance - $2,
           total_withdrawn = total_withdrawn + $2
       WHERE user_id = $1`,
      [user.id, amount]
    );

    await pool.query(
      `INSERT INTO withdrawal_requests
         (user_id, amount, method, account_number, account_name, status,
          processed_at, transaction_ref, admin_note)
       VALUES ($1, $2, 'cbe-birr', $3, $4, 'paid',
               NOW() - INTERVAL '3 days', $5, 'Seeded payout')`,
      [user.id, amount, user.phone, user.name, `SEED-TX-${String(i + 1).padStart(4, '0')}`]
    );
  }
  console.log(`   • ${paidCount} PAID withdrawals (student history)`);

  /* REJECTED */
  const rejectedCount = Math.min(REJECTED_WITHDRAWALS, candidates.length - cursor);
  for (let i = 0; i < rejectedCount; i++, cursor++) {
    const user = candidates[cursor];
    const amount = MIN_WITHDRAWAL * 2;

    await pool.query(
      `INSERT INTO withdrawal_requests
         (user_id, amount, method, account_number, account_name, status,
          processed_at, admin_note)
       VALUES ($1, $2, 'bank-transfer', $3, $4, 'rejected',
               NOW() - INTERVAL '5 days', 'Account details invalid')`,
      [user.id, amount, user.phone, user.name]
    );
  }
  console.log(`   • ${rejectedCount} REJECTED withdrawals (audit trail)`);
};

/* ============================================================================
 * REPORT & CLEAN
 * ========================================================================== */

/**
 * Print the current state of the seed network.
 */
const printReport = async () => {
  const rows = await pool.query(
    `SELECT u.full_name, u.phone, rc.code,
            COALESCE(w.current_balance, 0)::numeric AS balance,
            COALESCE(w.pending_withdrawal, 0)::numeric AS pending,
            COALESCE(w.total_withdrawn, 0)::numeric AS withdrawn,
            u.direct_referral_count AS directs,
            u.total_team_size AS team,
            u.paying_direct_count AS paying_directs,
            u.paying_team_size AS paying_team,
            (SELECT COALESCE(SUM(commission_amount), 0) FROM affiliate_commissions c
              WHERE c.earning_user_id = u.id AND c.status = 'credited'
                AND c.unlock_at <= NOW())::numeric AS unlocked,
            (SELECT COALESCE(SUM(amount), 0) FROM referral_bonuses b
              WHERE b.user_id = u.id AND b.status = 'credited')::numeric AS bonuses
     FROM users u
     LEFT JOIN referral_codes rc ON rc.user_id = u.id
     LEFT JOIN affiliate_wallets w ON w.user_id = u.id
     WHERE u.phone LIKE $1 OR u.email LIKE $2
     ORDER BY unlocked DESC
     LIMIT 25`,
    [`${TEST_PHONE_PREFIX}%`, `%@${TEST_EMAIL_DOMAIN}`]
  );

  console.log('\n📊 Top 25 seeded users by unlocked commission:\n');
  console.table(
    rows.rows.map((r) => ({
      user: r.full_name,
      phone: r.phone,
      code: r.code || '—',
      unlocked: parseFloat(r.unlocked),
      bonuses: parseFloat(r.bonuses),
      balance: parseFloat(r.balance),
      pending: parseFloat(r.pending),
      withdrawn: parseFloat(r.withdrawn),
      directs: r.directs,
      team: r.team,
      paying_d: r.paying_directs,
      paying_t: r.paying_team,
    }))
  );

  const totals = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM users WHERE phone LIKE $1) AS user_count,
       (SELECT COUNT(*)::int FROM affiliate_commissions c
          WHERE c.earning_user_id IN (SELECT id FROM users WHERE phone LIKE $1)
            AND c.status = 'credited') AS commission_count,
       (SELECT COUNT(*)::int FROM referral_bonuses b
          WHERE b.user_id IN (SELECT id FROM users WHERE phone LIKE $1)
            AND b.status = 'credited') AS bonus_count,
       (SELECT COUNT(*)::int FROM withdrawal_requests w
          WHERE w.user_id IN (SELECT id FROM users WHERE phone LIKE $1)) AS withdrawal_count,
       (SELECT COALESCE(SUM(commission_amount), 0)::numeric FROM affiliate_commissions c
          WHERE c.earning_user_id IN (SELECT id FROM users WHERE phone LIKE $1)
            AND c.status = 'credited') AS total_commission_etb,
       (SELECT COALESCE(SUM(amount), 0)::numeric FROM referral_bonuses b
          WHERE b.user_id IN (SELECT id FROM users WHERE phone LIKE $1)
            AND b.status = 'credited') AS total_bonus_etb,
       (SELECT COALESCE(SUM(total_withdrawn), 0)::numeric FROM affiliate_wallets w
          WHERE w.user_id IN (SELECT id FROM users WHERE phone LIKE $1)) AS total_withdrawn_etb`,
    [`${TEST_PHONE_PREFIX}%`]
  );

  console.log('\n🔢 Totals:');
  console.log(totals.rows[0]);
  console.log(`\n🔑 Login with any phone above + password ${TEST_PASSWORD}`);
  console.log('🧹 Cleanup: node tools/seed-realistic.js clean\n');
};

/**
 * Delete every trace of seeded data in FK-safe order.
 */
const cleanTestData = async () => {
  console.log('\n🧹 Cleaning all seeded data...\n');

  const userFilter = `(SELECT id FROM users WHERE phone LIKE '${TEST_PHONE_PREFIX}%' OR email LIKE '%@${TEST_EMAIL_DOMAIN}')`;

  const steps = [
    `DELETE FROM referral_tree WHERE ancestor_id IN ${userFilter} OR descendant_id IN ${userFilter}`,
    `DELETE FROM affiliate_commissions WHERE earning_user_id IN ${userFilter} OR source_user_id IN ${userFilter}`,
    `DELETE FROM referral_bonuses WHERE user_id IN ${userFilter}`,
    `DELETE FROM withdrawal_requests WHERE user_id IN ${userFilter}`,
    `DELETE FROM referral_monthly_stats WHERE user_id IN ${userFilter}`,
    `DELETE FROM referral_codes WHERE user_id IN ${userFilter}`,
    `DELETE FROM completed_lessons WHERE user_id IN ${userFilter}`,
    `DELETE FROM course_progress WHERE user_id IN ${userFilter}`,
    `DELETE FROM enrollments WHERE user_id IN ${userFilter}`,
    `DELETE FROM payments WHERE user_id IN ${userFilter}`,
    `DELETE FROM affiliate_wallets WHERE user_id IN ${userFilter}`,
    `DELETE FROM users WHERE phone LIKE '${TEST_PHONE_PREFIX}%' OR email LIKE '%@${TEST_EMAIL_DOMAIN}'`,
  ];

  for (const sql of steps) {
    const result = await pool.query(sql);
    if (result.rowCount > 0) {
      console.log(`   • ${result.rowCount} row(s): ${sql.split(' FROM ')[1].split(' WHERE')[0]}`);
    }
  }

  await pool.query(
    `UPDATE referral_platform_monthly p
     SET total_payout = COALESCE(
       (SELECT SUM(total_payout) FROM referral_monthly_stats m WHERE m.month = p.month), 0)`
  );

  console.log('\n✅ Seed data removed. Real users untouched.\n');
};

/* ============================================================================
 * ENTRY POINT
 * ========================================================================== */

const main = async () => {
  const [command, ...flags] = process.argv.slice(2);
  const keepLocked = flags.includes('--locked');
  const startTime = Date.now();

  try {
    if (command === 'clean') {
      await cleanTestData();
    } else if (command === 'report') {
      await printReport();
    } else if (command === 'seed') {
      const existing = await pool.query(
        `SELECT COUNT(*)::int AS count FROM users WHERE phone LIKE $1`,
        [`${TEST_PHONE_PREFIX}%`]
      );
      if (existing.rows[0].count > 0) {
        console.log('⚠️  Seeded users already exist. Run: node tools/seed-realistic.js clean');
        return;
      }

      const users = await buildNetwork();
      await runAllPurchases(users);
      await awardAllBonuses(users);

      if (!keepLocked) {
        const generated = await isCommissionUnlockGenerated();
        await unlockCommissionSlice(generated);
      } else {
        console.log(`\n🔒 Keeping ${UNLOCK_DELAY_DAYS}-day lock intact (--locked)`);
      }

      await seedWithdrawalSamples(users);
      await printReport();

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`🎉 Seed complete in ${elapsed}s. Log in as any user above and explore!`);
      console.log('   • Student dashboards: /profile/referrals');
      console.log('   • Admin payout queue: /admin/referrals/mlm/withdrawals');
      console.log('   • Admin MLM stats:    /admin/referrals/mlm/stats');
    } else {
      console.log('Usage: node tools/seed-realistic.js <seed|report|clean> [--locked]');
    }
  } catch (error) {
    console.error('\n❌ Seeder error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

main();