/**
 * @fileoverview Dashboard Revenue Chart Component
 * Displays monthly revenue as a bar chart.
 * Path: apps/web/components/admin/dashboard/DashboardRevenueChart.jsx
 */

import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * DashboardRevenueChart — Simple CSS bar chart for monthly revenue.
 * No external chart library needed — uses pure CSS for the bars.
 *
 * @param {object} props
 * @param {object} props.data - Revenue data from API { months: [], amounts: [] }
 */
const DashboardRevenueChart = ({ data = null }) => {
  /*
   * Process the data for display
   */
  const chartData = useMemo(() => {
    if (!data || !data.months || !data.amounts) {
      return { months: [], amounts: [], maxAmount: 0, totalRevenue: 0 };
    }

    const maxAmount = Math.max(...data.amounts, 1);
    const totalRevenue = data.amounts.reduce((sum, val) => sum + val, 0);

    return {
      months: data.months,
      amounts: data.amounts,
      maxAmount,
      totalRevenue,
    };
  }, [data]);

  /*
   * If no data, show a placeholder
   */
  if (chartData.months.length === 0) {
    return (
      <div className="admin-chart-card">
        <div className="admin-chart-header">
          <TrendingUp size={18} />
          <h3 className="admin-chart-title">Revenue (Last 12 Months)</h3>
        </div>
        <div className="admin-chart-empty">
          <p>No revenue data available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <TrendingUp size={18} />
        <h3 className="admin-chart-title">Revenue (Last 12 Months)</h3>
        <span className="admin-chart-total">
          {chartData.totalRevenue.toLocaleString()} ETB
        </span>
      </div>

      {/* Bar Chart */}
      <div className="admin-bar-chart">
        {chartData.months.map((month, index) => {
          const amount = chartData.amounts[index] || 0;
          const heightPercent = Math.round((amount / chartData.maxAmount) * 100);

          return (
            <div key={index} className="admin-bar-item">
              <div className="admin-bar-value">
                {amount > 0 ? `${(amount / 1000).toFixed(1)}k` : ''}
              </div>
              <div className="admin-bar-wrapper">
                <div
                  className="admin-bar-fill"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <div className="admin-bar-label">{month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardRevenueChart;