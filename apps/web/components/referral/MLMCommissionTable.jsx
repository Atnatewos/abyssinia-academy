/**
 * @fileoverview MLM Commission Table
 *
 * Paginated table showing commission earning history with level
 * filtering, status badges, and unlock date display.
 *
 * Path: apps/web/components/referral/MLMCommissionTable.jsx
 */

import React, { useState, useMemo } from 'react';
import { Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LEVEL_COLORS = {
  1: '#f59e0b',
  2: '#3b82f6',
  3: '#8b5cf6',
  4: '#6b7280',
};

/**
 * Formats an ISO date string to a human-readable locale string.
 * @param {string} isoDate
 * @returns {string}
 */
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

const MLMCommissionTable = ({ commissions, pagination, loading, onPageChange }) => {
  const { t } = useLanguage();
  const [levelFilter, setLevelFilter] = useState('all');

  const filteredCommissions = useMemo(() => {
    if (levelFilter === 'all') return commissions;
    return commissions.filter((c) => c.level === Number(levelFilter));
  }, [commissions, levelFilter]);

  const isUnlocked = (commission) => {
    if (!commission.unlockAt) return true;
    return new Date(commission.unlockAt) <= new Date();
  };

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;

  return (
    <div className="glass-card mlm-commission-table">
      <div className="mlm-table-header">
        <h3 className="mlm-section-title">
          {t.referrals?.mlm?.commissions?.title || 'Commission History'}
        </h3>
        <div className="mlm-level-filter">
          {['all', 1, 2, 3, 4].map((level) => (
            <button
              key={level}
              type="button"
              className={`mlm-filter-btn ${levelFilter === String(level) ? 'active' : ''}`}
              onClick={() => setLevelFilter(String(level))}
            >
              {level === 'all' ? (t.referrals?.mlm?.commissions?.allLevels || 'All') : `L${level}`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mlm-table-loading"><div className="spinner spinner-sm" /></div>
      ) : filteredCommissions.length === 0 ? (
        <div className="mlm-empty-state">
          <p>{t.referrals?.mlm?.commissions?.empty || 'No commissions yet. Share your link to start earning!'}</p>
        </div>
      ) : (
        <>
          <div className="mlm-table-scroll">
            <table className="mlm-table">
              <thead>
                <tr>
                  <th>{t.referrals?.mlm?.commissions?.date || 'Date'}</th>
                  <th>{t.referrals?.mlm?.commissions?.source || 'From'}</th>
                  <th>{t.referrals?.mlm?.commissions?.level || 'Level'}</th>
                  <th>{t.referrals?.mlm?.commissions?.amount || 'Amount'}</th>
                  <th>{t.referrals?.mlm?.commissions?.status || 'Status'}</th>
                  <th>{t.referrals?.mlm?.commissions?.unlocks || 'Unlocks'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommissions.map((commission) => {
                  const unlocked = isUnlocked(commission);
                  const levelColor = LEVEL_COLORS[commission.level] || LEVEL_COLORS[4];
                  return (
                    <tr key={commission.id}>
                      <td className="mlm-cell-date">{formatDate(commission.createdAt)}</td>
                      <td className="mlm-cell-source">{commission.sourceUserName || '—'}</td>
                      <td>
                        <span className="mlm-level-badge" style={{ backgroundColor: `${levelColor}18`, color: levelColor }}>
                          L{commission.level}
                        </span>
                      </td>
                      <td className="mlm-cell-amount">{commission.commissionAmount} ETB</td>
                      <td>
                        <span className={`mlm-status-badge ${unlocked ? 'unlocked' : 'locked'}`}>
                          {unlocked ? <Unlock size={12} /> : <Lock size={12} />}
                          {unlocked
                            ? (t.referrals?.mlm?.commissions?.available || 'Available')
                            : (t.referrals?.mlm?.commissions?.locked || 'Locked')}
                        </span>
                      </td>
                      <td className="mlm-cell-date">{unlocked ? '—' : formatDate(commission.unlockAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mlm-pagination">
              <button type="button" className="mlm-pagination-btn" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span className="mlm-pagination-info">
                {t.referrals?.mlm?.commissions?.page || 'Page'} {currentPage} / {totalPages}
              </span>
              <button type="button" className="mlm-pagination-btn" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MLMCommissionTable;