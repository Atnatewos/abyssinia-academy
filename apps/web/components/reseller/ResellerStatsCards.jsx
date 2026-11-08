/**
 * @fileoverview Reseller Stats Cards
 *
 * Four hero metrics for the reseller dashboard:
 *   1. Available balance (unlocked, withdrawable)
 *   2. Locked balance (still within 7-day window)
 *   3. Total earned (lifetime)
 *   4. Total sales count
 *
 * Tailwind-only. Matches the visual rhythm of MLMStatsCards but uses
 * reseller-specific copy and colors.
 *
 * Path: apps/web/components/reseller/ResellerStatsCards.jsx
 */

import React from 'react';
import { Wallet, Lock, Trophy, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Format a number as ETB with thousands separators.
 *
 * @param {number} value
 * @returns {string}
 */
const formatETB = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const ResellerStatsCards = ({ dashboard }) => {
  const { t } = useLanguage();

  const wallet = dashboard?.wallet || {};
  const sales = dashboard?.sales || {};

  const availableNow = Number(wallet.availableNow || 0);
  const lockedAmount = Number(wallet.lockedAmount || 0);
  const totalEarned = Number(wallet.totalEarned || 0);
  const totalSales = Number(sales.totalCount || 0);

  const cards = [
    {
      id: 'available',
      icon: Wallet,
      label: t.reseller?.stats?.availableBalance || 'Available Balance',
      value: `${formatETB(availableNow)} ETB`,
      sublabel: t.reseller?.stats?.readyToWithdraw || 'Ready to withdraw',
      accent: '#10b981',
      hero: true,
    },
    {
      id: 'locked',
      icon: Lock,
      label: t.reseller?.stats?.lockedAmount || 'Locked (7 days)',
      value: `${formatETB(lockedAmount)} ETB`,
      sublabel: t.reseller?.stats?.unlocksSoon || 'Unlocks soon',
      accent: '#f59e0b',
    },
    {
      id: 'earned',
      icon: Trophy,
      label: t.reseller?.stats?.totalEarned || 'Total Earned',
      value: `${formatETB(totalEarned)} ETB`,
      sublabel: t.reseller?.stats?.lifetime || 'Lifetime',
      accent: '#8b5cf6',
    },
    {
      id: 'sales',
      icon: ShoppingBag,
      label: t.reseller?.stats?.totalSales || 'Total Sales',
      value: formatETB(totalSales),
      sublabel: t.reseller?.stats?.salesThisMonth?.replace(
        '{count}',
        String(sales.thisMonthCount || 0)
      ) || `${sales.thisMonthCount || 0} this month`,
      accent: '#3b82f6',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`
              flex flex-col gap-3 p-5 rounded-2xl
              bg-bg-card-solid border border-border-light
              transition-all duration-200
              hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow-gold-sm
              ${card.hero ? 'col-span-2 lg:col-span-1 border-success/30 bg-success/5' : ''}
            `}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
              style={{
                background: `${card.accent}20`,
                color: card.accent,
              }}
            >
              <Icon size={20} />
            </div>

            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
                {card.label}
              </span>
              <span
                className="text-xl font-extrabold truncate"
                style={{ color: card.hero ? '#10b981' : 'var(--text-main)' }}
              >
                {card.value}
              </span>
              <span className="text-2xs text-text-dim truncate">
                {card.sublabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResellerStatsCards;