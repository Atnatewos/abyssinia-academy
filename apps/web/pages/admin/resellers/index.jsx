/**
 * @fileoverview Admin Resellers List Page
 *
 * Route: /admin/resellers
 *
 * Paginated list of all resellers with search, status filter, and
 * aggregate stats. Click a row to open the detail page.
 *
 * Path: apps/web/pages/admin/resellers/index.jsx
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Search,
  Store,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import useAdminResellers from '../../../hooks/useAdminResellers';

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

const AdminResellersPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { resellers, pagination, loading, error, fetchPage, refetch } =
    useAdminResellers({ search: '', status: 'all' });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPage(1, { search: searchInput.trim(), status: statusFilter });
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    fetchPage(1, { search: searchInput.trim(), status: newStatus });
  };

  const totalEarnings = resellers.reduce((sum, r) => sum + r.totalEarnings, 0);
  const totalSales = resellers.reduce((sum, r) => sum + r.totalSales, 0);

  return (
    <>
      <SEOHead title="Resellers Management" />
      <AdminLayout
        title="Resellers Management"
        subtitle="Manage reseller accounts, monitor earnings, and audit sales"
      >
        {/* ── Stats row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-card-solid border border-border-light">
            <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
              <Store size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
                Total Resellers
              </span>
              <span className="text-xl font-extrabold text-text-main">
                {pagination?.total || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-card-solid border border-border-light">
            <div className="w-10 h-10 rounded-lg bg-success/15 text-success flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
                Page Earnings
              </span>
              <span className="text-xl font-extrabold text-success">
                {formatETB(totalEarnings)} ETB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-card-solid border border-border-light">
            <div className="w-10 h-10 rounded-lg bg-info/15 text-info flex items-center justify-center">
              <Users size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
                Page Sales
              </span>
              <span className="text-xl font-extrabold text-text-main">
                {totalSales}
              </span>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-input border border-border-medium focus-within:border-accent">
            <Search size={16} className="text-text-dim shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, phone, email, or code..."
              className="flex-1 bg-transparent border-0 outline-none text-sm text-text-main"
            />
            <button
              type="submit"
              className="text-xs font-bold text-accent hover:text-accent-light transition-colors"
            >
              Search
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-4 py-2.5 rounded-xl bg-bg-input border border-border-medium text-sm font-semibold text-text-main outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-medium text-xs font-bold text-text-muted hover:border-accent/40 hover:text-accent transition-colors disabled:opacity-30"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-7 h-7 border-[3px] border-border-medium border-t-accent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 p-4 rounded-xl bg-error/10 border border-error/20">
            <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-sm text-error font-semibold">{error}</span>
              <button
                type="button"
                onClick={refetch}
                className="text-xs font-bold text-error underline self-start"
              >
                Retry
              </button>
            </div>
          </div>
        ) : resellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
              <Store size={28} />
            </div>
            <p className="text-sm text-text-muted">
              {searchInput || statusFilter !== 'all'
                ? 'No resellers match your filters.'
                : 'No resellers found.'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-bg-input border-b border-border-medium">
                    <th className="text-left py-3 px-4 text-2xs font-bold uppercase tracking-wider text-text-muted">Reseller</th>
                    <th className="text-left py-3 px-4 text-2xs font-bold uppercase tracking-wider text-text-muted">Code</th>
                    <th className="text-right py-3 px-4 text-2xs font-bold uppercase tracking-wider text-text-muted">Price</th>
                    <th className="text-center py-3 px-4 text-2xs font-bold uppercase tracking-wider text-text-muted">Share</th>
                    <th className="text-right py-3 px-4 text-2xs font-bold uppercase tracking-wider text-text-muted">Sales</th>
                    <th className="text-right py-3 px-4 text-2xs font-bold uppercase tracking-wider text-text-muted">Earnings</th>
                    <th className="text-center py-3 px-4 text-2xs font-bold uppercase tracking-wider text-text-muted">Status</th>
                    <th className="text-right py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {resellers.map((r) => (
                    <tr
                      key={r.resellerId}
                      onClick={() => router.push(`/admin/resellers/${r.resellerId}`)}
                      className="border-b border-border-light/50 hover:bg-bg-ghost-hover transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-text-main">
                            {r.fullName || 'Unknown'}
                          </span>
                          <span className="text-2xs text-text-muted">
                            {r.phone}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-accent">
                          {r.resellerCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-text-main whitespace-nowrap">
                        {formatETB(r.customPrice)} ETB
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 rounded text-2xs font-bold bg-accent/10 text-accent">
                          {Number(r.subSharePercent).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-text-main">
                        {r.totalSales}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-extrabold text-success whitespace-nowrap">
                        {formatETB(r.totalEarnings)} ETB
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-2xs font-bold ${
                            r.status === 'active'
                              ? 'bg-success/10 text-success'
                              : r.status === 'suspended'
                                ? 'bg-error/10 text-error'
                                : 'bg-text-dim/10 text-text-dim'
                          }`}
                        >
                          {r.status || 'unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/resellers/${r.resellerId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-accent/10 text-accent hover:bg-accent hover:text-text-inverse transition-colors"
                        >
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              disabled={!pagination.hasPrev}
              onClick={() =>
                fetchPage(pagination.page - 1, {
                  search: searchInput.trim(),
                  status: statusFilter,
                })
              }
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border-medium text-text-main hover:bg-bg-ghost-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-text-muted">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNext}
              onClick={() =>
                fetchPage(pagination.page + 1, {
                  search: searchInput.trim(),
                  status: statusFilter,
                })
              }
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border-medium text-text-main hover:bg-bg-ghost-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminResellersPage;