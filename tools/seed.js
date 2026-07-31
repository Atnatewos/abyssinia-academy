/**
 * @fileoverview Database Seed Runner
 * Seeds initial admin user and sample course data into Neon PostgreSQL
 * Path: tools/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', 'apps', 'api', '.env') });

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const seedDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seed...');
    console.log(`🔗 Connected to: ${process.env.DB_HOST}`);

    await client.query('BEGIN');

    const adminCheck = await client.query(
      'SELECT id FROM admins WHERE username = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin2026', 12);

      await client.query(
        `INSERT INTO admins (username, email, password, role)
         VALUES ($1, $2, $3, $4)`,
        ['admin', 'admin@abyssinia.academy', hashedPassword, 'superadmin']
      );

      console.log('✅ Admin user created:');
      console.log('   Username: admin');
      console.log('   Password: admin2026');
      console.log('   Role: superadmin');
    } else {
      console.log('ℹ️  Admin user already exists, skipping...');
    }

    const coursesCheck = await client.query('SELECT COUNT(*) FROM courses');

    if (parseInt(coursesCheck.rows[0].count, 10) === 0) {
      const courseResult = await client.query(
        `INSERT INTO courses (slug, title, title_am, description, description_am, level, duration, badge, icon)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          'fullstack-web-engineering-masterclass',
          'Full-Stack Web Engineering Masterclass',
          'የፉል-ስታክ ዌብ ሶፍትዌር ማስተርክላስ',
          'Complete roadmap to master modern frontend, robust Node.js backend architectures, databases, Next.js, and cloud deployments.',
          'ከፊት ለፊት ዲዛይን እስከ ጀርባ አፕሊኬሽኖች፣ ዳታቤዝ እና የደመና ሰርቨሮች መጫን የሚያስችል የተቀናጀ ትምህርት።',
          'Beginner to Advanced',
          '20+ Weeks',
          'Most Popular',
          'Code2',
        ]
      );

      const courseId = courseResult.rows[0].id;
      console.log('✅ Course created: Full-Stack Web Engineering Masterclass');

      const phaseResult = await client.query(
        `INSERT INTO phases (course_id, phase_number, title, title_am, subtitle, subtitle_am, description, color, duration, icon)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          courseId,
          1,
          'Foundations of Modern Web Architecture',
          'የዘመናዊ ዌብ አርክቴክቸር መሰረቶች',
          'HTML5, CSS3, Modern UI/UX Layouts & Git Enterprise Workflow',
          'HTML5፣ CSS3፣ Flexbox፣ CSS Grid እና የGit ኮድ አስተዳደር',
          'Build an unshakeable foundation in semantic HTML5, fluid layouts, modern Flexbox and Grid, mobile responsiveness, and collaborative Git version control.',
          'from-amber-500 to-yellow-400',
          '4 Weeks',
          'Code2',
        ]
      );

      const phaseId = phaseResult.rows[0].id;
      console.log('✅ Phase 1 created: Foundations of Modern Web Architecture');

      await client.query(
        `INSERT INTO outcomes (phase_id, text, order_index)
         VALUES
           ($1, 'Semantic HTML5 & Web Accessibility (a11y)', 1),
           ($1, 'Responsive CSS Flexbox & Multi-dimensional CSS Grid', 2),
           ($1, 'Professional Git branching, pull requests, and GitHub workflows', 3)`,
        [phaseId]
      );

      console.log('✅ Outcomes created (3)');

      const weekResult = await client.query(
        `INSERT INTO weeks (phase_id, week_number, title, title_am)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          phaseId,
          1,
          'HTML5 Semantics & Web Mechanics',
          'HTML5 እና የዌብ አሰራር መሰረቶች',
        ]
      );

      const weekId = weekResult.rows[0].id;
      console.log('✅ Week 1 created: HTML5 Semantics & Web Mechanics');

      const lessonResult = await client.query(
        `INSERT INTO lessons (week_id, title, title_am, duration, youtube_id, is_free_preview, notes, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          weekId,
          'How the Web Works & Semantic HTML Architecture',
          'ዌብ እንዴት እንደሚሰራ እና የHTML5 አወቃቀር',
          '45 mins',
          'pQN-pnXPaVg',
          true,
          'In this session, we lay down how HTTP requests flow and how semantic HTML tags help SEO and accessibility.',
          1,
        ]
      );

      const lessonId = lessonResult.rows[0].id;
      console.log('✅ Lesson 1 created (FREE PREVIEW)');

      await client.query(
        `INSERT INTO sessions (lesson_id, name, time, order_index)
         VALUES
           ($1, '01. Client-Server Architecture Overview', '00:00', 1),
           ($1, '02. HTML5 Semantic Elements Demystified', '14:20', 2),
           ($1, '03. Accessibility (a11y) Best Practices', '30:15', 3)`,
        [lessonId]
      );

      console.log('✅ Sessions created (3)');

      await client.query(
        `INSERT INTO resources (lesson_id, name, type, order_index)
         VALUES
           ($1, 'HTML5_Architecture_CheatSheet.pdf', 'pdf', 1),
           ($1, 'Semantic_Layout_Starter.zip', 'zip', 2)`,
        [lessonId]
      );

      console.log('✅ Resources created (2)');
    } else {
      console.log('ℹ️  Courses already exist, skipping...');
    }

    await client.query('COMMIT');

    const statsResult = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM admins) as admins,
        (SELECT COUNT(*) FROM courses) as courses,
        (SELECT COUNT(*) FROM phases) as phases,
        (SELECT COUNT(*) FROM weeks) as weeks,
        (SELECT COUNT(*) FROM lessons) as lessons,
        (SELECT COUNT(*) FROM sessions) as sessions,
        (SELECT COUNT(*) FROM resources) as resources,
        (SELECT COUNT(*) FROM outcomes) as outcomes
    `);

    const stats = statsResult.rows[0];
    console.log('\n📊 Database Summary:');
    console.log(`   Admins:    ${stats.admins}`);
    console.log(`   Courses:   ${stats.courses}`);
    console.log(`   Phases:    ${stats.phases}`);
    console.log(`   Weeks:     ${stats.weeks}`);
    console.log(`   Lessons:   ${stats.lessons}`);
    console.log(`   Sessions:  ${stats.sessions}`);
    console.log(`   Resources: ${stats.resources}`);
    console.log(`   Outcomes:  ${stats.outcomes}`);
    console.log('\n🎉 Database seeding complete!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));