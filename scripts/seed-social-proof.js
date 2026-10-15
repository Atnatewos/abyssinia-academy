/**
 * @fileoverview Social Proof Seed Script
 *
 * Generates 126 realistic student profiles with:
 *   - Realistic referral tree network (multiple branches, not single-root)
 *   - Wallet balances from commissions and bonuses
 *   - Withdrawal history for active earners
 *   - Approved payments and enrollments (~90% enrolled)
 *   - Referral codes and commission records
 *
 * Idempotent: skips users that already exist (by phone number).
 * Uses SAVEPOINTs to ensure one failed record doesn't abort the entire seed.
 *
 * Usage:
 *   node scripts/seed-social-proof.js
 *
 * Path: scripts/seed-social-proof.js
 */

require('dotenv').config({
  path: require('path').join(__dirname, '..', 'apps', 'api', '.env'),
});

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

const BCRYPT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Student123!';
const COURSE_PRICE = 1000;

/**
 * 126 Ethiopian profiles for social proof seeding
 */
const SEED_PROFILES = [
  { name: 'Abebe Bikila', email: 'abebebikila23@gmail.com', phone: '0911234511' },
  { name: 'Almaz Ayana Megersa', email: 'almazayana@gmail.com', phone: '0702345612' },
  { name: 'Yohannes Gebremedhin', email: 'yohannesgeb99@gmail.com', phone: '0913456713' },
  { name: 'Biruk Worku Assefa', email: 'birukworku4@gmail.com', phone: '0914567814' },
  { name: 'Martha Hailemariam', email: 'marthahaile@gmail.com', phone: '0705678915' },
  { name: 'Dawit Solomon Girma', email: 'dawitsolomon06@gmail.com', phone: '0916789016' },
  { name: 'Eden Tesfaye', email: 'edentesfaye88@gmail.com', phone: '0707890117' },
  { name: 'Yonas Fisseha Desta', email: 'yonasfisseha@gmail.com', phone: '0918901218' },
  { name: 'Helen Kifle', email: 'helenkifle12@gmail.com', phone: '0919012319' },
  { name: 'Samuel Tilahun Kebede', email: 'samueltilahun@gmail.com', phone: '0710123420' },
  { name: 'Betelhem Mulugeta', email: 'betty.mulugeta@gmail.com', phone: '0921234521' },
  { name: 'Michael Berhanu Zewde', email: 'mikeberhanu@gmail.com', phone: '0712345622' },
  { name: 'Selamawit Moges', email: 'selam.moges7@gmail.com', phone: '0923456723' },
  { name: 'Tewodros Kassahun Lemma', email: 'teddykassahun@gmail.com', phone: '0924567824' },
  { name: 'Meron Tadesse', email: 'merontadesse01@gmail.com', phone: '0715678925' },
  { name: 'Caleb Amanuel Chala', email: 'calebamanuel@gmail.com', phone: '0926789026' },
  { name: 'Kalkidan Daniel', email: 'kalidaniel95@gmail.com', phone: '0717890127' },
  { name: 'Natnael Belaynehe Wolde', email: 'nati.belay@gmail.com', phone: '0928901228' },
  { name: 'Tigist Tamirat', email: 'tigisttamirat@gmail.com', phone: '0929012329' },
  { name: 'Biniyam Nigusse Sisay', email: 'biniyamnigusse@gmail.com', phone: '0720123430' },
  { name: 'Hiwot Bogale', email: 'hiwotbogale31@gmail.com', phone: '0931234531' },
  { name: 'Robel Sisay Cherenet', email: 'robelsisay@gmail.com', phone: '0722345632' },
  { name: 'Bethlehem Fitsum', email: 'bethyfitsum@gmail.com', phone: '0933456733' },
  { name: 'Surafel Fikru Negash', email: 'surafelfikru24@gmail.com', phone: '0724567834' },
  { name: 'Tsion Mesfin', email: 'tsionmesfin00@gmail.com', phone: '0935678935' },
  { name: 'Henok Dereje Tola', email: 'henokdereje@gmail.com', phone: '0936789036' },
  { name: 'Rahel Endale', email: 'rahelendale77@gmail.com', phone: '0727890137' },
  { name: 'Eyob Tariku Diriba', email: 'eyobtariku@gmail.com', phone: '0938901238' },
  { name: 'Netsanet Zeleke', email: 'netsanetzeleke@gmail.com', phone: '0729012329' },
  { name: 'Abel Seyoum Abera', email: 'abelseyoum@gmail.com', phone: '0940123440' },
  { name: 'Bezawit Getu', email: 'bezawitgetu92@gmail.com', phone: '0771234541' },
  { name: 'Elias Getachew Bedane', email: 'eliasgetachew@gmail.com', phone: '0942345642' },
  { name: 'Hanan Kedir', email: 'hanankedir5@gmail.com', phone: '0773456743' },
  { name: 'Kirubel Mulatu Tolossa', email: 'kirubelmulatu@gmail.com', phone: '0944567844' },
  { name: 'Ruth Lemma', email: 'ruthlemma21@gmail.com', phone: '0945678945' },
  { name: 'Solomon Asefa Teklu', email: 'solomonasefa@gmail.com', phone: '0776789046' },
  { name: 'Mahlet Asrat', email: 'mahletasrat09@gmail.com', phone: '0947890147' },
  { name: 'Fitsum Mengistu Tefera', email: 'fitsummengistu@gmail.com', phone: '0701112248' },
  { name: 'Feven Teferi', email: 'feventeferi@gmail.com', phone: '0949012349' },
  { name: 'Eyouel Hailu Tadesse', email: 'eyouelhailu@gmail.com', phone: '0703334450' },
  { name: 'Meklit Workineh', email: 'meklitworkineh@gmail.com', phone: '0951234551' },
  { name: 'Brook Desalegn Gobena', email: 'brookdesalegn@gmail.com', phone: '0705556652' },
  { name: 'Senait Shiferaw', email: 'senaitshiferaw@gmail.com', phone: '0953456753' },
  { name: 'Bilisuma Diriba Tura', email: 'bilisumadiriba@gmail.com', phone: '0954567854' },
  { name: 'Hawi Gudeta', email: 'hawigudeta10@gmail.com', phone: '0708889955' },
  { name: 'Milkessa Tolera Kumsa', email: 'milkessatolera@gmail.com', phone: '0956789056' },
  { name: 'Chaltu Bekele', email: 'chaltubekele@gmail.com', phone: '0712223357' },
  { name: 'Gemechu Daba Olana', email: 'gemechudaba@gmail.com', phone: '0958901258' },
  { name: 'Bontu Fikadu', email: 'bontufikadu2@gmail.com', phone: '0959012359' },
  { name: 'Kenenisa Roba Dinagde', email: 'kenenisaroba@gmail.com', phone: '0715556660' },
  { name: 'Caala Benti', email: 'caalabenti@gmail.com', phone: '0961234561' },
  { name: 'Obsi Beyene Lemma', email: 'obsibeyene@gmail.com', phone: '0717778862' },
  { name: 'Lensa Taye', email: 'lensataye88@gmail.com', phone: '0963456763' },
  { name: 'Ebisa Abdisa Motuma', email: 'ebisaabdisa@gmail.com', phone: '0964567864' },
  { name: 'Ayana Gurmesa', email: 'ayanagurmesa@gmail.com', phone: '0722223365' },
  { name: 'Sifan Lema Dabala', email: 'sifanlema@gmail.com', phone: '0966789056' },
  { name: 'Desta Hailu', email: 'destahailu15@gmail.com', phone: '0724445567' },
  { name: 'Kiros Redae Berhe', email: 'kirosredae@gmail.com', phone: '0968901268' },
  { name: 'Weyni Gebremichael', email: 'weynigebre@gmail.com', phone: '0969012369' },
  { name: 'Teklit Girmay Hagos', email: 'teklitgirmay@gmail.com', phone: '0727778870' },
  { name: 'Freweyni Tesfay', email: 'freweynitesfay@gmail.com', phone: '0971234571' },
  { name: 'Berhane Woldu Weldegebriel', email: 'berhanewoldu@gmail.com', phone: '0771112272' },
  { name: 'Letebrihan Mezgebe', email: 'letebrihanm@gmail.com', phone: '0973456773' },
  { name: 'Mulugeta Aregawi Hiluf', email: 'mulugetaaregawi@gmail.com', phone: '0773334474' },
  { name: 'Tsega Kindeya', email: 'tsegakindeya@gmail.com', phone: '0975678975' },
  { name: 'Goitom Assefa Gebru', email: 'goitomassefa@gmail.com', phone: '0976789076' },
  { name: 'Roman Nega', email: 'romannega11@gmail.com', phone: '0776667777' },
  { name: 'Fitsumbirhan Araya Haile', email: 'fitsumaraya@gmail.com', phone: '0978901278' },
  { name: 'Hadush Negash', email: 'hadushnegash@gmail.com', phone: '0778889979' },
  { name: 'Hagos Kidane Teklu', email: 'hagoskidane@gmail.com', phone: '0980123480' },
  { name: 'Roman Gebre', email: 'romangebre90@gmail.com', phone: '0981234581' },
  { name: 'Yordanos Solomon Alemayehu', email: 'yordanossolomon@gmail.com', phone: '0707772282' },
  { name: 'Abel Birhanu', email: 'abelbirhanu7@gmail.com', phone: '0983456783' },
  { name: 'Bethlehem Kassahun Worku', email: 'bethlehemkassahun@gmail.com', phone: '0705554484' },
  { name: 'Daniel Zewdu', email: 'danielzewdu@gmail.com', phone: '0985678985' },
  { name: 'Kidist Getachew Girma', email: 'kidistgetachew@gmail.com', phone: '0986789086' },
  { name: 'Mikiyas Kebede', email: 'miki.kebede@gmail.com', phone: '0702227787' },
  { name: 'Tsion Fikru Molla', email: 'tsionfikru@gmail.com', phone: '0988901288' },
  { name: 'Brook Alemu', email: 'brookalemu22@gmail.com', phone: '0719990089' },
  { name: 'Rediet Mulugeta Kassa', email: 'redietmulugeta@gmail.com', phone: '0910123490' },
  { name: 'Nahom Dawit', email: 'nahomdawit@gmail.com', phone: '0911234591' },
  { name: 'Hermela Bogale Chala', email: 'hermelabogale@gmail.com', phone: '0716663392' },
  { name: 'Yared Wolde', email: 'yaredwolde84@gmail.com', phone: '0913456793' },
  { name: 'Bitaniya Sisay Feyissa', email: 'bitaniyasisay@gmail.com', phone: '0714445594' },
  { name: 'Robel Hailemariam', email: 'robelhaile@gmail.com', phone: '0915678995' },
  { name: 'Salem Tadesse Woldemariam', email: 'salemtadesse@gmail.com', phone: '0916789096' },
  { name: 'Yonas Workineh', email: 'yonasworkineh@gmail.com', phone: '0711118897' },
  { name: 'Ruth Tamirat Gemechu', email: 'ruthtamirat@gmail.com', phone: '0918901298' },
  { name: 'Abenezer Dereje', email: 'abenezerdereje@gmail.com', phone: '0728881199' },
  { name: 'Deborah Endale Regassa', email: 'deborahendale@gmail.com', phone: '0920123401' },
  { name: 'Leul Mesfin', email: 'leulmesfin3@gmail.com', phone: '0921234502' },
  { name: 'Segen Getu Wakgari', email: 'segengetu@gmail.com', phone: '0725554403' },
  { name: 'Kaleab Bedane', email: 'kaleabbedane@gmail.com', phone: '0923456704' },
  { name: 'Yeabsira Deresse Ejeta', email: 'yeabsiraderesse@gmail.com', phone: '0723336605' },
  { name: 'Binyam Tefera', email: 'binyamtefera91@gmail.com', phone: '0925678906' },
  { name: 'Rahel Hirpa Gebre', email: 'rahelhirpa@gmail.com', phone: '0926789007' },
  { name: 'Jeremiah Lema', email: 'jeremiahlema@gmail.com', phone: '0779990008' },
  { name: 'Liya Gobena Kahsay', email: 'liyagobena@gmail.com', phone: '0928901209' },
  { name: 'Nathan Kenea', email: 'nathankenea44@gmail.com', phone: '0777772210' },
  { name: 'Nardos Benti Abraha', email: 'nardosbenti@gmail.com', phone: '0930123411' },
  { name: 'Solomon Lemma', email: 'solomonlemma@gmail.com', phone: '0931234512' },
  { name: 'Hanna Taye Hadgu', email: 'hannataye@gmail.com', phone: '0774445513' },
  { name: 'Markos Abdisa', email: 'markosabdisa@gmail.com', phone: '0933456714' },
  { name: 'Rebeca Gurmesa Medhane', email: 'rebecagurmesa@gmail.com', phone: '0772227715' },
  { name: 'Timothy Aregawi', email: 'timothyaregawi@gmail.com', phone: '0935678916' },
  { name: 'Abigail Redae Kassa', email: 'abigailredae@gmail.com', phone: '0936789017' },
  { name: 'Benjamin Woldu', email: 'benjaminwoldu@gmail.com', phone: '0702020218' },
  { name: 'Chloe Mezgebe Zere', email: 'chloemezgebe@gmail.com', phone: '0938901219' },
  { name: 'Daniel Kindeya', email: 'danielkindeya@gmail.com', phone: '0704040420' },
  { name: 'Elizabeth Assefa Tadesse', email: 'elizabethassefa@gmail.com', phone: '0940123421' },
  { name: 'Ezra Nega', email: 'ezranega10@gmail.com', phone: '0941234522' },
  { name: 'Grace Araya Mengesha', email: 'gracearaya@gmail.com', phone: '0707070723' },
  { name: 'Isaac Negash', email: 'isaacnegash@gmail.com', phone: '0943456724' },
  { name: 'Joanna Kidane Belay', email: 'joannakidane@gmail.com', phone: '0709090925' },
  { name: 'Joseph Gebre', email: 'josephgebre@gmail.com', phone: '0945678926' },
  { name: 'Leah Solomon Assefa', email: 'leahsolomon@gmail.com', phone: '0946789027' },
  { name: 'Levi Birhanu', email: 'levibirhanu99@gmail.com', phone: '0713030328' },
  { name: 'Lydia Kassahun Desta', email: 'lydiakassahun@gmail.com', phone: '0948901229' },
  { name: 'Matthew Zewdu', email: 'matthewzewdu@gmail.com', phone: '0715050530' },
  { name: 'Naomi Getachew Tesfaye', email: 'naomigetachew@gmail.com', phone: '0950123431' },
  { name: 'Noah Kebede', email: 'noahkebede01@gmail.com', phone: '0951234532' },
  { name: 'Rachel Molla Bekele', email: 'rachelmolla@gmail.com', phone: '0718080833' },
  { name: 'Samuel Desta', email: 'samueldesta85@gmail.com', phone: '0953456734' },
  { name: 'Sarah Kassa Megersa', email: 'sarahkassa@gmail.com', phone: '0720101035' },
  { name: 'Simon Tesfaye', email: 'simontesfaye@gmail.com', phone: '0955678936' },
  { name: 'Victoria Chala Gemechu', email: 'victoriachala@gmail.com', phone: '0722020237' },
];

const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ABY';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const generateUUID = () => crypto.randomUUID();

const hashPassword = async (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

const randomDate = (daysBack = 90) => {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return past.toISOString();
};

const buildReferralTree = (userIds) => {
  const relationships = [];
  const totalUsers = userIds.length;
  const rootCount = Math.min(10, Math.floor(totalUsers * 0.08));
  const roots = userIds.slice(0, rootCount);
  const remaining = userIds.slice(rootCount);
  let remainingIndex = 0;
  
  for (const rootId of roots) {
    const directCount = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < directCount && remainingIndex < remaining.length; i++) {
      const directUserId = remaining[remainingIndex++];
      relationships.push({ userId: directUserId, referredByUserId: rootId });
      if (Math.random() < 0.4) {
        const depth2Count = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < depth2Count && remainingIndex < remaining.length; j++) {
          const depth2UserId = remaining[remainingIndex++];
          relationships.push({ userId: depth2UserId, referredByUserId: directUserId });
          if (Math.random() < 0.25) {
            const depth3Count = 1 + Math.floor(Math.random() * 2);
            for (let k = 0; k < depth3Count && remainingIndex < remaining.length; k++) {
              const depth3UserId = remaining[remainingIndex++];
              relationships.push({ userId: depth3UserId, referredByUserId: depth2UserId });
            }
          }
        }
      }
    }
  }
  
  while (remainingIndex < remaining.length) {
    const userId = remaining[remainingIndex++];
    const randomReferrer = userIds[Math.floor(Math.random() * Math.min(20, userIds.length))];
    if (randomReferrer !== userId) {
      relationships.push({ userId, referredByUserId: randomReferrer });
    }
  }
  return relationships;
};

const seedUsers = async () => {
  console.log('🌱 Starting social proof seed...\n');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
    
    const courseResult = await client.query(
      `SELECT id FROM courses WHERE slug = 'fullstack-web-engineering-masterclass' LIMIT 1`
    );
    const courseId = courseResult.rows.length > 0 ? courseResult.rows[0].id : null;
    
    const createdUsers = [];
    const skippedUsers = [];
    const userIds = [];
    
    console.log('📝 Creating users...');
    for (let i = 0; i < SEED_PROFILES.length; i++) {
      const profile = SEED_PROFILES[i];
      const existing = await client.query('SELECT id FROM users WHERE phone = $1', [profile.phone]);
      
      if (existing.rows.length > 0) {
        skippedUsers.push(profile.phone);
        userIds.push(existing.rows[0].id);
        continue;
      }
      
      const userId = generateUUID();
      const referralCode = generateReferralCode();
      const isEnrolled = i < Math.floor(SEED_PROFILES.length * 0.9);
      
      await client.query(
        `INSERT INTO users (
          id, full_name, phone, email, password, is_enrolled, enrolled_at,
          payment_status, payment_method, payment_amount, referred_by_code,
          referral_discount_percent, profile_completed, created_at,
          paying_direct_count, paying_team_size, direct_referral_count, total_team_size,
          lifetime_referral_earnings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          userId, profile.name, profile.phone, profile.email, hashedPassword,
          isEnrolled, isEnrolled ? randomDate(60) : null,
          isEnrolled ? 'approved' : 'pending',
          isEnrolled ? ['telebirr', 'cbe-birr', 'bank-transfer'][Math.floor(Math.random() * 3)] : null,
          isEnrolled ? COURSE_PRICE : null, null,
          isEnrolled && Math.random() < 0.1 ? 10 : 0, isEnrolled, randomDate(90),
          0, 0, 0, 0, 0,
        ]
      );
      
      await client.query(
        `INSERT INTO referral_codes (user_id, code, is_active, created_at) VALUES ($1, $2, true, NOW())`,
        [userId, referralCode]
      );
      
      await client.query(
        `INSERT INTO affiliate_wallets (user_id, total_earned, total_withdrawn, current_balance, pending_withdrawal, debt_balance, created_at, updated_at) 
         VALUES ($1, 0, 0, 0, 0, 0, NOW(), NOW())`,
        [userId]
      );
      
      createdUsers.push({ id: userId, phone: profile.phone, isEnrolled });
      userIds.push(userId);
    }
    console.log(`✅ Created ${createdUsers.length} users, skipped ${skippedUsers.length} (already exist)\n`);
    
    console.log('🔗 Building referral tree...');
    const referralRelationships = buildReferralTree(userIds);
    let relationshipsCreated = 0;
    
    for (const rel of referralRelationships) {
      try {
        await client.query(
          `UPDATE users SET referred_by_code = (SELECT code FROM referral_codes WHERE user_id = $1) WHERE id = $2`,
          [rel.referredByUserId, rel.userId]
        );
        await client.query(
          `INSERT INTO referral_tree (ancestor_id, descendant_id, depth, created_at)
           VALUES ($1, $2, 1, NOW()) ON CONFLICT (ancestor_id, descendant_id) DO NOTHING`,
          [rel.referredByUserId, rel.userId]
        );
        const ancestors = await client.query(
          `SELECT ancestor_id, depth FROM referral_tree WHERE descendant_id = $1 AND depth < 4`,
          [rel.referredByUserId]
        );
        for (const ancestor of ancestors.rows) {
          await client.query(
            `INSERT INTO referral_tree (ancestor_id, descendant_id, depth, created_at)
             VALUES ($1, $2, $3, NOW()) ON CONFLICT (ancestor_id, descendant_id) DO NOTHING`,
            [ancestor.ancestor_id, rel.userId, ancestor.depth + 1]
          );
        }
        relationshipsCreated++;
      } catch (err) {
        if (!err.message.includes('duplicate')) console.error(`   ⚠️  Referral error: ${err.message}`);
      }
    }
    console.log(`✅ Created ${relationshipsCreated} referral relationships\n`);
    
    console.log('📊 Updating referral counters...');
    const directCounts = await client.query(`SELECT ancestor_id, COUNT(*)::int as count FROM referral_tree WHERE depth = 1 GROUP BY ancestor_id`);
    for (const row of directCounts.rows) {
      await client.query(`UPDATE users SET direct_referral_count = $1 WHERE id = $2`, [row.count, row.ancestor_id]);
    }
    const teamCounts = await client.query(`SELECT ancestor_id, COUNT(*)::int as count FROM referral_tree GROUP BY ancestor_id`);
    for (const row of teamCounts.rows) {
      await client.query(`UPDATE users SET total_team_size = $1 WHERE id = $2`, [row.count, row.ancestor_id]);
    }
    console.log('✅ Referral counters updated\n');
    
    console.log('💳 Creating payments and enrollments...');
    let paymentsCreated = 0;
    for (const user of createdUsers.filter(u => u.isEnrolled)) {
      const paymentId = generateUUID();
      const paymentDate = randomDate(60);
      const method = ['telebirr', 'cbe-birr', 'bank-transfer'][Math.floor(Math.random() * 3)];
      
      await client.query('SAVEPOINT user_payment_savepoint');
      try {
        await client.query(
          `INSERT INTO payments (id, user_id, amount, method, status, reference, transaction_id, purchase_mode, selected_phases, created_at, paid_at) 
           VALUES ($1, $2, $3, $4, 'approved', $5, $6, 'full-course', NULL, $7, $8)`,
          [paymentId, user.id, COURSE_PRICE, method, `REF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5)}`, `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, paymentDate, paymentDate]
        );
        await client.query(
          `INSERT INTO enrollments (user_id, purchase_mode, selected_phases, purchase_amount, payment_id, enrolled_at) 
           VALUES ($1, 'full-course', NULL, $2, $3, $4)`,
          [user.id, COURSE_PRICE, paymentId, paymentDate]
        );
        if (courseId) {
          await client.query(
            `INSERT INTO course_progress (user_id, course_id, progress) VALUES ($1, $2, $3) ON CONFLICT (user_id, course_id) DO NOTHING`,
            [user.id, courseId, Math.floor(Math.random() * 100)]
          );
        }
        await client.query('RELEASE SAVEPOINT user_payment_savepoint');
        paymentsCreated++;
      } catch (err) {
        await client.query('ROLLBACK TO SAVEPOINT user_payment_savepoint');
        console.error(`   ⚠️  Payment error: ${err.message}`);
      }
    }
    console.log(`✅ Created ${paymentsCreated} payments and enrollments\n`);
    
    console.log('💰 Seeding commissions for active referrers...');
    const topReferrers = await client.query(`
      SELECT u.id, u.direct_referral_count, u.total_team_size FROM users u
      WHERE u.direct_referral_count >= 2 ORDER BY u.total_team_size DESC LIMIT 30
    `);
    
    let commissionsCreated = 0;
    for (const referrer of topReferrers.rows) {
      const directRefs = await client.query(`
        SELECT rt.descendant_id, p.id as payment_id, p.amount FROM referral_tree rt
        JOIN payments p ON p.user_id = rt.descendant_id
        WHERE rt.ancestor_id = $1 AND rt.depth = 1 AND p.status = 'approved' LIMIT 5
      `, [referrer.id]);
      
      for (const ref of directRefs.rows) {
        const commissionAmount = 200;
        const commissionId = generateUUID();
        await client.query('SAVEPOINT commission_savepoint');
        try {
          /* FIX: tier_at_time is an INTEGER in the schema, so we pass 1 instead of 'bronze' */
          await client.query(
            `INSERT INTO affiliate_commissions (
              id, earning_user_id, source_user_id, payment_id, level,
              tier_at_time, tier_percent_at_time, sale_amount, commission_amount,
              status, created_at, unlock_at
            ) VALUES ($1, $2, $3, $4, 1, 1, 10, $5, $6, 'credited', NOW(), NOW() + INTERVAL '7 days')
            ON CONFLICT (id) DO NOTHING`,
            [commissionId, referrer.id, ref.descendant_id, ref.payment_id, ref.amount, commissionAmount]
          );
          await client.query('RELEASE SAVEPOINT commission_savepoint');
          commissionsCreated++;
        } catch (err) {
          await client.query('ROLLBACK TO SAVEPOINT commission_savepoint');
        }
      }
    }
    console.log(`✅ Created ${commissionsCreated} commission records\n`);
    
    console.log('💼 Updating wallet balances...');
    const walletUpdates = await client.query(`
      SELECT earning_user_id, SUM(commission_amount)::numeric as total_earned
      FROM affiliate_commissions WHERE status = 'credited' GROUP BY earning_user_id
    `);
    let walletsUpdated = 0;
    for (const row of walletUpdates.rows) {
      const earned = parseFloat(row.total_earned);
      const withdrawn = Math.floor(earned * 0.6);
      const available = earned - withdrawn;
      await client.query(
        `UPDATE affiliate_wallets SET total_earned = $1, total_withdrawn = $2, current_balance = $3, updated_at = NOW() WHERE user_id = $4`,
        [earned, withdrawn, available, row.earning_user_id]
      );
      walletsUpdated++;
    }
    console.log(`✅ Updated ${walletsUpdated} wallet balances\n`);
    
    console.log('🏦 Creating withdrawal history...');
    const activeEarners = await client.query(`
      SELECT user_id, total_withdrawn FROM affiliate_wallets WHERE total_withdrawn > 500 ORDER BY total_withdrawn DESC LIMIT 25
    `);
    let withdrawalsCreated = 0;
    for (const earner of activeEarners.rows) {
      const numWithdrawals = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numWithdrawals; i++) {
        const amount = 500 + Math.floor(Math.random() * 2000);
        const method = ['telebirr', 'cbe-birr', 'bank-transfer'][Math.floor(Math.random() * 3)];
        const status = Math.random() < 0.8 ? 'paid' : 'pending';
        const withdrawalId = generateUUID();
        
        /* FIX: Generate realistic account details required by the schema */
        const accountNumber = method === 'bank-transfer'
          ? `1000${Math.floor(100000000 + Math.random() * 900000000)}`
          : `09${Math.floor(10000000 + Math.random() * 90000000)}`;
        const bankName = method === 'bank-transfer' ? 'Commercial Bank of Ethiopia' : null;

        await client.query('SAVEPOINT withdrawal_savepoint');
        try {
          await client.query(
            `INSERT INTO withdrawal_requests (
              id, user_id, amount, method, account_number, account_name, bank_name,
              status, created_at, processed_at, admin_note, transaction_ref
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              withdrawalId, earner.user_id, amount, method, accountNumber, 'Seeded User', bankName, status,
              randomDate(30), status === 'paid' ? randomDate(7) : null,
              status === 'paid' ? 'Auto-approved by system' : null,
              status === 'paid' ? `WD-${Date.now().toString(36).toUpperCase()}` : null,
            ]
          );
          await client.query('RELEASE SAVEPOINT withdrawal_savepoint');
          withdrawalsCreated++;
        } catch (err) {
          await client.query('ROLLBACK TO SAVEPOINT withdrawal_savepoint');
        }
      }
    }
    console.log(`✅ Created ${withdrawalsCreated} withdrawal records\n`);
    
    await client.query('COMMIT');
    console.log('🎉 Social proof seed completed successfully!\n');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedUsers().then(() => process.exit(0)).catch(() => process.exit(1));