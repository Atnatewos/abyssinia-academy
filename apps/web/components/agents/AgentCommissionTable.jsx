/**
 * @fileoverview Agent Commission Table
 *
 * Paginated table for agent commission history.
 * Mirrors MLMCommissionTable but without lock windows (agents pay instantly).
 *
 * Path: apps/web/components/agents/AgentCommissionTable.jsx
 */

import React from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

const AgentCommissionTable = ({ commissions, pagination, loading, onPageChange }) => {
  const { t } = useLanguage();

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;

  return (
    <div className="glass-card mlm-commission-table">
      <div className="mlm-table-header">
        <h3 className="mlm-section-title">
          {t.agents?.commissionHistory || 'Agent Commission History'}
        </h3>
      </div>

      {loading ? (
        <div className="mlm-table-loading"><div className="spinner spinner-sm" /></div>
      ) : commissions.length === 0 ? (
        <div className="mlm-empty-state">
          <p>{t.agents?.empty || 'No agent commissions yet. Share your link to start earning!'}</p>
        </div>
      ) : (
        <>
          <div className="mlm-table-scroll">
            <table className="mlm-table">
              <thead>
                <tr>
                  <th>{t.agents?.date || 'Date'}</th>
                  <th>{t.agents?.source || 'From'}</th>
                  <th>{t.agents?.type || 'Type'}</th>
                  <th>{t.agents?.amount || 'Amount'}</th>
                  <th>{t.agents?.status || 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td className="mlm-cell-date">{formatDate(c.paidAt || c.createdAt)}</td>
                    <td className="mlm-cell-source">{c.sourceUserName || 'Anonymous'}</td>
                    <td>
                      <span className="mlm-level-badge" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                        {c.commissionType === 'percentage' ? `${c.percentageRate}%` : 'Fixed'}
                      </span>
                    </td>
                    <td className="mlm-cell-amount">{c.commissionAmount} ETB</td>
                    <td>
                      <span className="mlm-status-badge unlocked">
                        <CheckCircle2 size={12} />
                        {t.agents?.paid || 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mlm-pagination">
              <button type="button" className="mlm-pagination-btn" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span className="mlm-pagination-info">
                {t.agents?.page || 'Page'} {currentPage} / {totalPages}
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

export default AgentCommissionTable;