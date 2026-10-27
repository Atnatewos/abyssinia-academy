/**
 * @fileoverview Admin Stats Cards Component
 * Dashboard overview statistics
 * Path: apps/web/components/admin/StatsCards.jsx
 */

import { Users, CreditCard, Clock, DollarSign } from 'lucide-react';

/**
 * StatsCards - Grid of statistics cards for the admin dashboard
 * @param {object} props
 * @param {object} props.stats - Statistics data object
 */
const StatsCards = ({ stats = {} }) => {
  const cards = [
    {
      label: 'Total Students',
      value: stats.totalStudents || 0,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
    },
    {
      label: 'Enrolled Students',
      value: stats.enrolledStudents || 0,
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      label: 'Pending Payments',
      value: stats.pendingPayments || 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      label: 'Total Revenue',
      value: `${(stats.totalRevenue || 0).toLocaleString()} ETB`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      isCurrency: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;

        return (
          <div
            key={index}
            className="glass-card rounded-2xl p-6 border-amber-500/20 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <IconComponent className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {card.label}
            </p>
            <p className={`text-2xl font-extrabold text-slate-900 dark:text-white mt-1 ${card.isCurrency ? 'text-sm' : ''}`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;