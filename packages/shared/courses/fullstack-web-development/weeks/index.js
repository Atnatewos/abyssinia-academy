/**
 * @fileoverview Week Aggregator
 * Exports all weeks keyed by week number for easy lookup
 * Path: packages/shared/courses/fullstack-web-development/weeks/index.js
 */

const weeks = {
  1: require('./week-01'),
  2: require('./week-02'),
  3: require('./week-03'),
  4: require('./week-04'),
  5: require('./week-05'),
  6: require('./week-06'),
};

module.exports = weeks;