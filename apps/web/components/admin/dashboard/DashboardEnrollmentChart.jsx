/**
 * @fileoverview Dashboard Enrollment Chart Component
 * Displays weekly new enrollments as a bar chart.
 * Path: apps/web/components/admin/dashboard/DashboardEnrollmentChart.jsx
 */

import React, { useMemo } from 'react';
import { UserPlus } from 'lucide-react';

/**
 * DashboardEnrollmentChart — Simple CSS bar chart for weekly enrollments.
 *
 * @param {object} props
 * @param {object} props.data - Enrollment data from API { weeks: [], counts: [] }
 */
const DashboardEnrollmentChart = ({ data = null }) => {
  const chartData = useMemo(() => {
    if (!data || !data.weeks || !data.counts) {
      return { weeks: [], counts: [], maxCount: 0, totalEnrollments: 0 };
    }

    const maxCount = Math.max(...data.counts, 1);
    const totalEnrollments = data.counts.reduce((sum, val) => sum + val, 0);

    return {
      weeks: data.weeks,
      counts: data.counts,
      maxCount,
      totalEnrollments,
    };
  }, [data]);

  if (chartData.weeks.length === 0) {
    return (
      <div className="admin-chart-card">
        <div className="admin-chart-header">
          <UserPlus size={18} />
          <h3 className="admin-chart-title">New Enrollments (Last 8 Weeks)</h3>
        </div>
        <div className="admin-chart-empty">
          <p>No enrollment data available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <UserPlus size={18} />
        <h3 className="admin-chart-title">New Enrollments (Last 8 Weeks)</h3>
        <span className="admin-chart-total">
          {chartData.totalEnrollments} total
        </span>
      </div>

      {/* Bar Chart */}
      <div className="admin-bar-chart">
        {chartData.weeks.map((week, index) => {
          const count = chartData.counts[index] || 0;
          const heightPercent = Math.round((count / chartData.maxCount) * 100);

          return (
            <div key={index} className="admin-bar-item">
              <div className="admin-bar-value">{count > 0 ? count : ''}</div>
              <div className="admin-bar-wrapper">
                <div
                  className="admin-bar-fill enrollment"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <div className="admin-bar-label">{week}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardEnrollmentChart;