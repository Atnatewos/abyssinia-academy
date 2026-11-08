/**
 * @fileoverview Reseller Sales Table
 *
 * Paginated list of all reseller sales. Shows date, buyer name, price,
 * the reseller's earnings, share %, status, and unlock countdown.
 *
 * Path: apps/web/components/reseller/ResellerSalesTable.jsx
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Lock,
  Unlock,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const formatETB = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

/**
 * Get the display status for a sale row.
 * A row can be 'approved' but still locked (unlockAt in the future).
 *
 * @param {object} sale
 * @returns {{ key: string, label: string, color: string, icon: Function }}
 */
const getSaleStatus = (sale, t) => {
  if (sale.status === 'refunded') {
    return {
      key: 'refunded',
      label: t.reseller?.sales?.statusRefunded || 'Refunded',
      color: '#ef4444',
      icon: RotateCcw,
    };
  }
  if (sale.isLocked) {
    return {
      key: 'locked',
      label: t.reseller?.sales?.statusLocked || 'Locked',
      color: '#f59e0b',
      icon: Lock,
    };
  }
  return {
    key: 'unlocked',
    label: t.reseller?.sales?.statusPaid || 'Paid',
    color: '#10b981',
    icon: Unlock,
  };
};

const ResellerSalesTable = ({ sales, pagination, loading, onPageChange }) => {
  const { t } = useLanguage();

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-7 h-7 border-[3px] border-border-medium border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
          <ShoppingBag size={28} />
        </div>
        <p className="text-sm text-text-muted max-w-md">
          {t.reseller?.sales?.empty ||
            'No sales yet. Share your link to start earning!'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left py-3 px-3 text-2xs font-bold uppercase tracking-wider text-text-muted">
                {t.reseller?.sales?.date || 'Date'}
              </th>
              <th className="text-left py-3 px-3 text-2xs font-bold uppercase tracking-wider text-text-muted">
                {t.reseller?.sales?.buyer || 'Buyer'}
              </th>
              <th className="text-right py-3 px-3 text-2xs font-bold uppercase tracking-wider text-text-muted">
                {t.reseller?.sales?.price || 'Price'}
              </th>
              <th className="text-right py-3 px-3 text-2xs font-bold uppercase tracking-wider text-text-muted">
                {t.reseller?.sales?.yourEarnings || 'You Earned'}
              </th>
              <th className="text-center py-3 px-3 text-2xs font-bold uppercase tracking-wider text-text-muted">
                {t.reseller?.sales?.share || 'Share'}
              </th>
              <th className="text-right py-3 px-3 text-2xs font-bold uppercase tracking-wider text-text-muted">
                {t.reseller?.sales?.status || 'Status'}
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const status = getSaleStatus(sale, t);
              const StatusIcon = status.icon;
              return (
                <tr
                  key={sale.id}
                  className="border-b border-border-light/50 hover:bg-bg-ghost-hover transition-colors"
                >
                  <td className="py-3 px-3 text-xs text-text-muted whitespace-nowrap">
                    {formatDate(sale.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-sm font-semibold text-text-main">
                    {sale.buyerName || 'Anonymous'}
                  </td>
                  <td className="py-3 px-3 text-sm font-bold text-text-main text-right whitespace-nowrap">
                    {formatETB(sale.retailPrice)} ETB
                  </td>
                  <td className="py-3 px-3 text-sm font-extrabold text-accent text-right whitespace-nowrap">
                    {formatETB(sale.yourEarnings)} ETB
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 rounded text-2xs font-bold bg-bg-pill text-text-muted">
                      {Number(sale.sharePercent || 0).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-2xs font-bold whitespace-nowrap"
                      style={{
                        backgroundColor: `${status.color}15`,
                        color: status.color,
                      }}
                    >
                      <StatusIcon size={10} />
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border-medium text-text-main hover:bg-bg-ghost-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-text-muted">
            {t.common?.page || 'Page'} {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border-medium text-text-main hover:bg-bg-ghost-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ResellerSalesTable;