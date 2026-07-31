/**
 * @fileoverview Admin Controller
 * Request handlers for admin dashboard and management
 * Path: apps/api/src/controllers/admin.controller.js
 */

const usersDb = require('../database/queries/users');
const paymentsDb = require('../database/queries/payments');
const courseService = require('../services/course.service');
const { getPagination, buildPaginatedResponse } = require('../utils/helpers');

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userStats = await usersDb.getUserStats();
    const pendingPaymentsCount = await paymentsDb.getPendingPaymentsCount();
    const totalRevenue = await paymentsDb.getTotalRevenue();

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

/**
 * GET /api/admin/students
 * Get all students with pagination
 */
const getAllStudents = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const pagination = getPagination(page, limit);

    let result;
    if (search) {
      result = await usersDb.searchUsers(search, pagination.limit, pagination.offset);
    } else {
      result = await usersDb.getAllUsers(pagination.limit, pagination.offset);
    }

    res.json(buildPaginatedResponse(result.users, result.total, pagination));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/students/:id
 * Get single student details
 */
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

/**
 * POST /api/admin/courses
 * Create a new course
 */
const createCourse = async (req, res, next) => {
  try {
    const courseData = {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      titleAm: req.body.titleAm,
      descriptionAm: req.body.descriptionAm,
      level: req.body.level,
      duration: req.body.duration,
      badge: req.body.badge,
      icon: req.body.icon,
      thumbnailUrl: req.file ? req.file.path : null,
    };

    const course = await courseService.createCourse(courseData);

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
 * Update a course
 */
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const courseData = {
      title: req.body.title,
      titleAm: req.body.titleAm,
      description: req.body.description,
      descriptionAm: req.body.descriptionAm,
      level: req.body.level,
      duration: req.body.duration,
      badge: req.body.badge,
      icon: req.body.icon,
      isPublished: req.body.isPublished,
      thumbnailUrl: req.file ? req.file.path : undefined,
    };

    const course = await courseService.updateCourse(id, courseData);

    res.json({
      success: true,
      message: 'Course updated successfully.',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllStudents,
  getStudentById,
  createCourse,
  updateCourse,
};