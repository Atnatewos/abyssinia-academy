/**
 * @fileoverview API Endpoints Constants
 * Centralized API route definitions for frontend consumption
 * Path: packages/shared/constants/api-endpoints.js
 */

const API_ENDPOINTS = {
  // Auth
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    me: '/api/auth/me',
    adminLogin: '/api/auth/admin/login',
  },

  // Courses
  courses: {
    all: '/api/courses',
    bySlug: (slug) => `/api/courses/${slug}`,
    lessonById: (lessonId) => `/api/courses/lesson/${lessonId}`,
  },

  // Payments
  payments: {
    submit: '/api/payments/submit',
    status: '/api/payments/status',
  },

  // Progress
  progress: {
    completed: '/api/progress/completed',
    courseProgress: (courseId) => `/api/progress/courses/${courseId}`,
    all: '/api/progress/all',
    toggleLesson: (lessonId) => `/api/progress/lessons/${lessonId}/toggle`,
  },

  // Admin
  admin: {
    dashboard: '/api/admin/dashboard',
    payments: '/api/admin/payments',
    pendingPayments: '/api/admin/payments/pending',
    approvePayment: (id) => `/api/admin/payments/${id}/approve`,
    rejectPayment: (id) => `/api/admin/payments/${id}/reject`,
    students: '/api/admin/students',
    studentById: (id) => `/api/admin/students/${id}`,
    createCourse: '/api/admin/courses',
    updateCourse: (id) => `/api/admin/courses/${id}`,
  },

  // Health
  health: '/api/health',
};

module.exports = API_ENDPOINTS;