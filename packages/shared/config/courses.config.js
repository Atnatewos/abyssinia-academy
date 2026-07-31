/**
 * @fileoverview Course Structure Configuration
 * Defines all courses, phases, weeks, lessons data
 * Path: packages/shared/config/courses.config.js
 */

const coursesConfig = {
  courses: [
    {
      id: 'course-fullstack-mastery',
      slug: 'fullstack-web-engineering-masterclass',
      title: 'Full-Stack Web Engineering Masterclass',
      titleAm: 'የፉል-ስታክ ዌብ ሶፍትዌር ማስተርክላስ',
      description: 'Complete roadmap to master modern frontend, robust Node.js backend architectures, databases, Next.js, and cloud deployments.',
      descriptionAm: 'ከፊት ለፊት ዲዛይን እስከ ጀርባ አፕሊኬሽኖች፣ ዳታቤዝ እና የደመና ሰርቨሮች መጫን የሚያስችል የተቀናጀ ትምህርት።',
      level: 'Beginner to Advanced',
      duration: '20+ Weeks',
      totalPhases: 5,
      badge: 'Most Popular',
      icon: 'Code2',
      isPublished: true,
    },
    {
      id: 'course-backend-devops',
      slug: 'backend-engineering-microservices',
      title: 'Backend Engineering & Microservices Architecture',
      titleAm: 'የጀርባ አፕሊኬሽን ሶፍትዌር ኢንጂነሪንግ',
      description: 'Focus purely on high-concurrency servers, distributed databases, Redis caching, gRPC, Docker container orchestration, and cloud infrastructure.',
      descriptionAm: 'በከፍተኛ ፍጥነት የሚሰሩ ሰርቨሮች፣ ዳታቤዝ አያያዝ፣ Docker እና የደመና መሰረተ ልማት ትምህርት።',
      level: 'Intermediate to Advanced',
      duration: '16 Weeks',
      totalPhases: 5,
      badge: 'Specialized',
      icon: 'Server',
      isPublished: true,
    },
  ],

  /**
   * Fetch course by slug
   * @param {string} slug - Course slug
   * @returns {object|null} Course object
   */
  getCourseBySlug(slug) {
    return this.courses.find((course) => course.slug === slug) || null;
  },

  /**
   * Fetch course by ID
   * @param {string} id - Course ID
   * @returns {object|null} Course object
   */
  getCourseById(id) {
    return this.courses.find((course) => course.id === id) || null;
  },
};

module.exports = coursesConfig;