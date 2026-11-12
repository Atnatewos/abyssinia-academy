// /**
//  * @fileoverview Admin Controller
//  *
//  * Handles dashboard statistics, student management, and course creation /
//  * update. Every mutating endpoint validates its input against a strict
//  * allow-list — unknown fields are rejected rather than silently ignored.
//  *
//  * Path: apps/api/src/controllers/admin.controller.js
//  */

// const usersDb = require('../database/queries/users');
// const paymentsDb = require('../database/queries/payments');
// const courseService = require('../services/course.service');
// const {
//   getPagination,
//   buildPaginatedResponse,
// } = require('../utils/helpers');
// const { BadRequestError } = require('../utils/errors');

// /* ============================================================================
//  * DASHBOARD
//  * ============================================================================ */

// const getDashboardStats = async (req, res, next) => {
//   try {
//     const [userStats, pendingPaymentsCount, totalRevenue] = await Promise.all([
//       usersDb.getUserStats(),
//       paymentsDb.getPendingPaymentsCount(),
//       paymentsDb.getTotalRevenue(),
//     ]);

//     res.json({
//       success: true,
//       data: {
//         totalStudents: parseInt(userStats.total_users, 10),
//         enrolledStudents: parseInt(userStats.enrolled_users, 10),
//         pendingPayments: pendingPaymentsCount,
//         approvedPayments: parseInt(userStats.approved_payments, 10),
//         rejectedPayments: parseInt(userStats.rejected_payments, 10),
//         totalRevenue,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /* ============================================================================
//  * STUDENTS
//  * ============================================================================ */

// const getAllStudents = async (req, res, next) => {
//   try {
//     const { page, limit, search } = req.query;
//     const pagination = getPagination(page, limit);

//     const result = search
//       ? await usersDb.searchUsers(search, pagination.limit, pagination.offset)
//       : await usersDb.getAllUsers(pagination.limit, pagination.offset);

//     res.json(buildPaginatedResponse(result.users, result.total, pagination));
//   } catch (error) {
//     next(error);
//   }
// };

// const getStudentById = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const user = await usersDb.findUserById(id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'Student not found.',
//       });
//     }

//     const payment = await paymentsDb.getUserPayment(id);

//     res.json({
//       success: true,
//       data: {
//         student: user,
//         payment: payment || null,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /* ============================================================================
//  * COURSES — CREATE / UPDATE
//  * ============================================================================ */

// /**
//  * Validate and normalize a course write payload.
//  * Rejects unknown fields so a typo doesn't silently vanish.
//  *
//  * @param {object} body - Raw request body
//  * @param {object} options
//  * @param {boolean} options.partial - Allow missing fields (update mode)
//  * @returns {object} Normalized payload ready for the DB layer
//  */
// const normalizeCoursePayload = (body, { partial }) => {
//   const allowed = [
//     'slug',
//     'title',
//     'titleAm',
//     'description',
//     'descriptionAm',
//     'level',
//     'duration',
//     'badge',
//     'icon',
//     'thumbnailUrl',
//     'priceEtb',
//     'isPublished',
//     'orderIndex',
//   ];

//   const unknown = Object.keys(body).filter((k) => !allowed.includes(k));
//   if (unknown.length > 0) {
//     throw new BadRequestError(
//       `Unknown field(s) in request: ${unknown.join(', ')}`
//     );
//   }

//   const payload = {};

//   if (!partial || body.slug !== undefined) {
//     if (!body.slug || typeof body.slug !== 'string') {
//       throw new BadRequestError('slug is required and must be a string.');
//     }
//     if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
//       throw new BadRequestError(
//         'slug must be lowercase alphanumeric words separated by hyphens.'
//       );
//     }
//     payload.slug = body.slug;
//   }

//   if (!partial || body.title !== undefined) {
//     if (!body.title || typeof body.title !== 'string') {
//       throw new BadRequestError('title is required and must be a string.');
//     }
//     payload.title = body.title.trim();
//   }

//   if (!partial || body.description !== undefined) {
//     if (!body.description || typeof body.description !== 'string') {
//       throw new BadRequestError(
//         'description is required and must be a string.'
//       );
//     }
//     payload.description = body.description.trim();
//   }

//   if (!partial || body.level !== undefined) {
//     if (!body.level || typeof body.level !== 'string') {
//       throw new BadRequestError('level is required and must be a string.');
//     }
//     payload.level = body.level.trim();
//   }

//   if (!partial || body.duration !== undefined) {
//     if (!body.duration || typeof body.duration !== 'string') {
//       throw new BadRequestError('duration is required and must be a string.');
//     }
//     payload.duration = body.duration.trim();
//   }

//   /* Optional strings — accept null explicitly to clear */
//   for (const field of ['titleAm', 'descriptionAm', 'badge', 'icon', 'thumbnailUrl']) {
//     if (body[field] !== undefined) {
//       payload[field] =
//         body[field] === null ? null : String(body[field]).trim() || null;
//     }
//   }

//   /* priceEtb — must be a non-negative number or null */
//   if (body.priceEtb !== undefined) {
//     if (body.priceEtb === null) {
//       payload.priceEtb = null;
//     } else {
//       const num = Number(body.priceEtb);
//       if (!Number.isFinite(num) || num < 0) {
//         throw new BadRequestError(
//           'priceEtb must be a non-negative number or null.'
//         );
//       }
//       payload.priceEtb = Math.round(num * 100) / 100;
//     }
//   }

//   if (body.isPublished !== undefined) {
//     payload.isPublished = Boolean(body.isPublished);
//   }

//   if (body.orderIndex !== undefined) {
//     const idx = Number(body.orderIndex);
//     if (!Number.isInteger(idx) || idx < 0) {
//       throw new BadRequestError(
//         'orderIndex must be a non-negative integer.'
//       );
//     }
//     payload.orderIndex = idx;
//   }

//   return payload;
// };

// const createCourse = async (req, res, next) => {
//   try {
//     const payload = normalizeCoursePayload(req.body, { partial: false });

//     if (req.file) {
//       payload.thumbnailUrl = req.file.path;
//     }

//     const course = await courseService.createCourse(payload);

//     res.status(201).json({
//       success: true,
//       message: 'Course created successfully.',
//       data: { course },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const updateCourse = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const payload = normalizeCoursePayload(req.body, { partial: true });

//     if (req.file) {
//       payload.thumbnailUrl = req.file.path;
//     }

//     const course = await courseService.updateCourse(id, payload);

//     res.json({
//       success: true,
//       message: 'Course updated successfully.',
//       data: { course },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   getDashboardStats,
//   getAllStudents,
//   getStudentById,
//   createCourse,
//   updateCourse,
// };




/**
 * @fileoverview Admin Controller
 *
 * Request handlers for the admin surface: dashboard stats, student
 * management, and full course/phase/week/lesson CRUD.
 *
 * Course-related handlers (create, update, delete, publish toggle) sit
 * here because they use admin-specific query paths that include drafts.
 * The public course controller only returns published content.
 *
 * Every mutating handler validates its input. Controllers are thin —
 * business rules live in the service layer, SQL lives in the query layer.
 *
 * Path: apps/api/src/controllers/admin.controller.js
 */

const usersDb = require('../database/queries/users');
const paymentsDb = require('../database/queries/payments');
const coursesDb = require('../database/queries/courses');
const courseService = require('../services/course.service');
const {
  getPagination,
  buildPaginatedResponse,
} = require('../utils/helpers');
const { BadRequestError, NotFoundError } = require('../utils/errors');

/* ============================================================================
 * DASHBOARD
 * ============================================================================ */

const getDashboardStats = async (req, res, next) => {
  try {
    const [userStats, pendingPaymentsCount, totalRevenue] = await Promise.all([
      usersDb.getUserStats(),
      paymentsDb.getPendingPaymentsCount(),
      paymentsDb.getTotalRevenue(),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: parseInt(userStats.total_users, 10),
        enrolledStudents: parseInt(userStats.enrolled_users, 10),
        pendingPayments: pendingPaymentsCount,
        approvedPayments: parseInt(userStats.approved_payments, 10),
        rejectedPayments: parseInt(userStats.rejected_payments, 10),
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * STUDENTS
 * ============================================================================ */

const getAllStudents = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const pagination = getPagination(page, limit);

    const result = search
      ? await usersDb.searchUsers(search, pagination.limit, pagination.offset)
      : await usersDb.getAllUsers(pagination.limit, pagination.offset);

    res.json(buildPaginatedResponse(result.users, result.total, pagination));
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await usersDb.findUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    const payment = await paymentsDb.getUserPayment(id);

    res.json({
      success: true,
      data: {
        student: user,
        payment: payment || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * COURSES — VALIDATION
 * ============================================================================ */

/**
 * Validate and normalize a course write payload.
 * Rejects unknown fields so a typo doesn't silently vanish.
 *
 * @param {object} body - Raw request body
 * @param {object} options
 * @param {boolean} options.partial - Allow missing fields (update mode)
 * @returns {object} Normalized payload ready for the DB layer
 */
const normalizeCoursePayload = (body, { partial }) => {
  const allowed = [
    'slug',
    'title',
    'titleAm',
    'description',
    'descriptionAm',
    'level',
    'duration',
    'badge',
    'icon',
    'thumbnailUrl',
    'priceEtb',
    'isPublished',
    'orderIndex',
  ];

  const unknown = Object.keys(body).filter((k) => !allowed.includes(k));
  if (unknown.length > 0) {
    throw new BadRequestError(
      `Unknown field(s) in request: ${unknown.join(', ')}`
    );
  }

  const payload = {};

  if (!partial || body.slug !== undefined) {
    if (!body.slug || typeof body.slug !== 'string') {
      throw new BadRequestError('slug is required and must be a string.');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
      throw new BadRequestError(
        'slug must be lowercase alphanumeric words separated by hyphens.'
      );
    }
    payload.slug = body.slug;
  }

  if (!partial || body.title !== undefined) {
    if (!body.title || typeof body.title !== 'string') {
      throw new BadRequestError('title is required and must be a string.');
    }
    payload.title = body.title.trim();
  }

  if (!partial || body.description !== undefined) {
    if (!body.description || typeof body.description !== 'string') {
      throw new BadRequestError(
        'description is required and must be a string.'
      );
    }
    payload.description = body.description.trim();
  }

  if (!partial || body.level !== undefined) {
    if (!body.level || typeof body.level !== 'string') {
      throw new BadRequestError('level is required and must be a string.');
    }
    payload.level = body.level.trim();
  }

  if (!partial || body.duration !== undefined) {
    if (!body.duration || typeof body.duration !== 'string') {
      throw new BadRequestError('duration is required and must be a string.');
    }
    payload.duration = body.duration.trim();
  }

  /* Optional strings — accept null explicitly to clear */
  for (const field of [
    'titleAm',
    'descriptionAm',
    'badge',
    'icon',
    'thumbnailUrl',
  ]) {
    if (body[field] !== undefined) {
      payload[field] =
        body[field] === null ? null : String(body[field]).trim() || null;
    }
  }

  /* priceEtb — must be a non-negative number or null */
  if (body.priceEtb !== undefined) {
    if (body.priceEtb === null) {
      payload.priceEtb = null;
    } else {
      const num = Number(body.priceEtb);
      if (!Number.isFinite(num) || num < 0) {
        throw new BadRequestError(
          'priceEtb must be a non-negative number or null.'
        );
      }
      payload.priceEtb = Math.round(num * 100) / 100;
    }
  }

  if (body.isPublished !== undefined) {
    payload.isPublished = Boolean(body.isPublished);
  }

  if (body.orderIndex !== undefined) {
    const idx = Number(body.orderIndex);
    if (!Number.isInteger(idx) || idx < 0) {
      throw new BadRequestError(
        'orderIndex must be a non-negative integer.'
      );
    }
    payload.orderIndex = idx;
  }

  return payload;
};

/* ============================================================================
 * COURSES — HANDLERS
 * ============================================================================ */

/**
 * GET /api/admin/courses
 * List all courses (published and drafts) with optional search/level filter.
 */
const getAllCourses = async (req, res, next) => {
  try {
    const { search = '', level = '' } = req.query;
    const courses = await coursesDb.getAllCoursesForAdmin({ search, level });
    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/courses/:id
 * Full course detail with nested phases, weeks, lessons, sessions, resources.
 * Includes unpublished content so admins can edit drafts.
 */
const getCourseDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await coursesDb.getCourseByIdWithCurriculum(id);
    if (!course) {
      throw new NotFoundError('Course not found.');
    }
    res.json({
      success: true,
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/courses
 * Create a new course.
 */
const createCourse = async (req, res, next) => {
  try {
    const payload = normalizeCoursePayload(req.body, { partial: false });

    if (req.file) {
      payload.thumbnailUrl = req.file.path;
    }

    const course = await courseService.createCourse(payload);

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/courses/:id
 * Update a course. Only fields present are changed; nulls clear.
 */
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = normalizeCoursePayload(req.body, { partial: true });

    if (req.file) {
      payload.thumbnailUrl = req.file.path;
    }

    const course = await courseService.updateCourse(id, payload);

    res.json({
      success: true,
      message: 'Course updated successfully.',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/courses/:id
 * Delete a course. Cascades to phases/weeks/lessons/enrollments at DB level.
 */
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await coursesDb.deleteCourse(id);
    if (!deleted) {
      throw new NotFoundError('Course not found.');
    }
    res.json({
      success: true,
      message: 'Course deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/courses/:id/publish
 * Toggle a course's publish state. Body: { isPublished: boolean }.
 */
const setCoursePublishState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      throw new BadRequestError('isPublished must be a boolean.');
    }

    const updated = await courseService.updateCourse(id, { isPublished });
    if (!updated) {
      throw new NotFoundError('Course not found.');
    }

    res.json({
      success: true,
      message: `Course ${
        isPublished ? 'published' : 'unpublished'
      } successfully.`,
      data: { course: updated },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  /* Dashboard */
  getDashboardStats,
  /* Students */
  getAllStudents,
  getStudentById,
  /* Courses */
  getAllCourses,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  setCoursePublishState,
};