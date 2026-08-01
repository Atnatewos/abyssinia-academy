/**
 * @fileoverview Database Seeder
 * Seeds initial data for development
 * Path: apps/api/src/database/seeds/seed.js
 */
// ✅ FIXED: Go up 3 levels to reach apps/api/.env
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const bcrypt = require('bcryptjs');
const { query, testConnection } = require('../pool');

/**
 * Seed the database with initial data
 */
const seedDatabase = async () => {
  try {
    await testConnection();
    console.log('🌱 Starting database seed...');

    // Check if admin already exists
    const existingAdmin = await query(
      'SELECT id FROM admins WHERE username = $1',
      ['admin']
    );

    if (existingAdmin.rows.length === 0) {
      // Create default admin
      const hashedPassword = await bcrypt.hash('admin2026', 12);
      await query(
        `INSERT INTO admins (username, email, password, role)
         VALUES ($1, $2, $3, $4)`,
        ['admin', 'admin@abyssinia.academy', hashedPassword, 'superadmin']
      );
      console.log('✅ Default admin created (username: admin, password: admin2026)');
    } else {
      console.log('ℹ️ Admin already exists, skipping...');
    }

    // Check if courses already exist
    const existingCourses = await query('SELECT COUNT(*) FROM courses');
    if (parseInt(existingCourses.rows[0].count, 10) === 0) {
      // Create Full-Stack course
      const courseResult = await query(
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
          'Code2'
        ]
      );
      const courseId = courseResult.rows[0].id;

      // Create Phase 1
      const phaseResult = await query(
        `INSERT INTO phases (course_id, phase_number, title, title_am, subtitle, subtitle_am, description, color, duration, icon)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          courseId, 1,
          'Foundations of Modern Web Architecture',
          'የዘመናዊ ዌብ አርክቴክቸር መሰረቶች',
          'HTML5, CSS3, Modern UI/UX Layouts & Git Enterprise Workflow',
          'HTML5፣ CSS3፣ Flexbox፣ CSS Grid እና የGit ኮድ አስተዳደር',
          'Build an unshakeable foundation in semantic HTML5, fluid layouts, modern Flexbox and Grid, mobile responsiveness, and collaborative Git version control.',
          'from-amber-500 to-yellow-400',
          '4 Weeks',
          'Code2'
        ]
      );
      const phaseId = phaseResult.rows[0].id;

      // Create outcomes for Phase 1
      await query(
        `INSERT INTO outcomes (phase_id, text, order_index) VALUES
         ($1, 'Semantic HTML5 & Web Accessibility (a11y)', 1),
         ($1, 'Responsive CSS Flexbox & Multi-dimensional CSS Grid', 2),
         ($1, 'Professional Git branching, pull requests, and GitHub workflows', 3)`,
        [phaseId]
      );

      // Create Week 1
      const weekResult = await query(
        `INSERT INTO weeks (phase_id, week_number, title, title_am)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [phaseId, 1, 'HTML5 Semantics & Web Mechanics', 'HTML5 እና የዌብ አሰራር መሰረቶች']
      );
      const weekId = weekResult.rows[0].id;

      // Create Lesson 1
      const lessonResult = await query(
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
          1
        ]
      );
      const lessonId = lessonResult.rows[0].id;

      // Create sessions for Lesson 1
      await query(
        `INSERT INTO sessions (lesson_id, name, time, order_index) VALUES
         ($1, '01. Client-Server Architecture Overview', '00:00', 1),
         ($1, '02. HTML5 Semantic Elements Demystified', '14:20', 2),
         ($1, '03. Accessibility (a11y) Best Practices', '30:15', 3)`,
        [lessonId]
      );

      // Create resources for Lesson 1
      await query(
        `INSERT INTO resources (lesson_id, name, type, order_index) VALUES
         ($1, 'HTML5_Architecture_CheatSheet.pdf', 'pdf', 1),
         ($1, 'Semantic_Layout_Starter.zip', 'zip', 2)`,
        [lessonId]
      );

      console.log('✅ Sample course created with Phase 1, Week 1, Lesson 1');
    } else {
      console.log('ℹ️ Courses already exist, skipping...');
    }

    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();