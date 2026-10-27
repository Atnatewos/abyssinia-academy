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
  7: require('./week-07'),
  'bonus-8': require('./week-08-bonus-week'),
  8: require('./week-08'),
  9: require('./week-09'),
  10: require('./week-10'),
  11: require('./week-11'),
  12: require('./week-12'),
  13: require('./week-13'),
  'bonus-14': require('./week-14-bonus-week'),
  14: require('./week-14'),
  15: require('./week-15'),
  16: require('./week-16'),
  17: require('./week-17'),
  18: require('./week-18'),
  19: require('./week-19'),
  20: require('./week-20'),
  21: require('./week-21'),
  22: require('./week-22'),
  23: require('./week-23'),
  24: require('./week-24'),
  25: require('./week-25'),
  26: require('./week-26'),
  27: require('./week-27'),
};
module.exports = weeks;