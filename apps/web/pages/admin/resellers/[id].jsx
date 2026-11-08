/**
 * @fileoverview Admin Reseller Detail Page
 *
 * Route: /admin/resellers/[id]
 *
 * Shows a single reseller's full profile, stats, recent sales, and
 * sub-resellers. Superadmin can edit price / share / status.
 *
 * Path: apps/web/pages/admin/resellers/[id].jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  Store,
  User,
  Phone,
  Mail,
  Calendar,
  Wallet,
  TrendingUp,
  ShoppingBag,
  Users,
  Pencil,
  Loader,
  AlertCircle,
  CheckCircle2,
  Ban,
  Unlock,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';

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

const AdminResellerDetailPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const { id } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [editPrice, setEditPrice] = useState('');
  const [editShare, setEditShare] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/admin/resellers/${id}`);
      if (response?.success && response.data) {
        setData(response.data);
        setEditPrice(String(response.data.reseller.customPrice || ''));
        setEditShare(String(response.data.reseller.subSharePercent || ''));
      } else {
        setError(response?.message || 'Failed to load reseller.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load reseller.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      if (Number(editPrice) !== data.reseller.customPrice) {
        payload.customPrice = Number(editPrice);
      }
      if (Number(editShare) !== data.reseller.subSharePercent) {
        payload.subSharePercent = Number(editShare);
      }

      if (Object.keys(payload).length === 0) {
        setEditing(false);
        setSaving(false);
        return;
      }

      const response = await apiClient.patch(`/admin/resellers/${id}`, payload);
      if (response?.success) {
        toast.success('Reseller updated successfully.');
        setEditing(false);
        await fetchData();
      } else {
        toast.error(response?.message || 'Failed to update reseller.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update reseller.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;

    setSaving(true);
    try {
      const response = await apiClient.patch(`/admin/resellers/${id}`, { status: newStatus });
      if (response?.success) {
        toast.success(`Reseller status set to ${newStatus}.`);
        await fetchData();
      } else {
        toast.error(response?.message || 'Failed to update status.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <SEOHead title="Reseller Detail" />
        <AdminLayout title="Reseller Detail" subtitle="Loading...">
          <div className="flex justify-center items-center py-24">
            <div className="w-7 h-7 border-[3px] border-border-medium border-t-accent rounded-full animate-spin" />
          </div>
        </AdminLayout>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <SEOHead title="Reseller Detail" />
        <AdminLayout title="Reseller Detail" subtitle="Error">
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle size={40} className="text-error" />
            <p className="text-sm text-error font-semibold">{error || 'Not found'}</p>
            <Link
              href="/admin/resellers"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Resellers
            </Link>
          </div>
        </AdminLayout>
      </>
    );
  }

  const { reseller, stats, recentSales, subResellers } = data;
  const isActive = reseller.status === 'active';

  return (
    <>
      <SEOHead title={`Reseller: ${reseller.fullName}`} />
      <AdminLayout title="Reseller Detail" subtitle={reseller.resellerCode}>
        {/* Back link */}
        <Link
          href="/admin/resellers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Resellers
        </Link>

        {/* ── Profile header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-bg-card-solid border border-border-light mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-xl font-extrabold shrink-0">
              {reseller.fullName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <h2 className="text-xl font-extrabold text-text-main">
                {reseller.fullName}
              </h2>
              <span className="font-mono text-xs font-bold text-accent">
                {reseller.resellerCode}
              </span>
              <div className="flex items-center gap-3 text-2xs text-text-muted flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Phone size={10} />
                  {reseller.phone}
                </span>
                {reseller.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail size={10} />
                    {reseller.email}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar size={10} />
                  Joined {formatDate(reseller.joinedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${
                isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}
            >
              {reseller.status}
            </span>

            {isActive ? (
              <button
                type="button"
                onClick={() => handleStatusChange('suspended')}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error/10 text-error text-xs font-bold hover:bg-error hover:text-white transition-colors disabled:opacity-30"
              >
                <Ban size={12} />
                Suspend
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStatusChange('active')}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-bold hover:bg-success hover:text-white transition-colors disabled:opacity-30"
              >
                <Unlock size={12} />
                Reactivate
              </button>
            )}
          </div>
        </div>

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-bg-card-solid border border-border-light">
            <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
              Total Sales
            </span>
            <span className="text-lg font-extrabold text-text-main">
              {stats.totalSales}
            </span>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-bg-card-solid border border-border-light">
            <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
              Total Volume
            </span>
            <span className="text-lg font-extrabold text-text-main">
              {formatETB(stats.totalVolume)} ETB
            </span>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-bg-card-solid border border-success/30 bg-success/5">
            <span className="text-2xs font-bold uppercase tracking-wider text-success">
              Total Earnings
            </span>
            <span className="text-lg font-extrabold text-success">
              {formatETB(stats.totalEarnings)} ETB
            </span>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-bg-card-solid border border-border-light">
            <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
              Locked
            </span>
            <span className="text-lg font-extrabold text-warning">
              {formatETB(stats.lockedEarnings)} ETB
            </span>
          </div>
        </div>

        {/* ── Edit section ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-bg-card-solid border border-border-light">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-text-main">Pricing</span>
                <span className="text-xs text-text-muted">Custom price and share</span>
              </div>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-medium text-xs font-bold text-text-muted hover:border-accent/40 hover:text-accent transition-colors"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-2xs font-bold uppercase text-text-muted">
                    Custom Price (800 – 5000 ETB)
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-bg-input border border-border-medium text-sm font-bold text-text-main outline-none focus:border-accent"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-2xs font-bold uppercase text-text-muted">
                    Sub-Share % (10 – 70)
                  </label>
                  <input
                    type="number"
                    value={editShare}
                    onChange={(e) => setEditShare(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-bg-input border border-border-medium text-sm font-bold text-text-main outline-none focus:border-accent"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditPrice(String(reseller.customPrice || ''));
                      setEditShare(String(reseller.subSharePercent || ''));
                    }}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg border border-border-medium text-xs font-bold text-text-muted hover:bg-bg-ghost-hover transition-colors disabled:opacity-30"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors disabled:opacity-30"
                  >
                    {saving ? <Loader size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Price</span>
                  <span className="text-base font-extrabold text-text-main">
                    {formatETB(reseller.customPrice)} ETB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Share</span>
                  <span className="text-base font-extrabold text-accent">
                    {Number(reseller.subSharePercent).toFixed(0)}%
                  </span>
                </div>
                {reseller.parent && (
                  <div className="flex justify-between items-center pt-2 border-t border-border-light">
                    <span className="text-xs text-text-muted">Parent</span>
                    <span className="text-sm font-bold text-text-main">
                      {reseller.parent.fullName} ({reseller.parent.resellerCode})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-bg-card-solid border border-border-light">
            <span className="text-sm font-bold text-text-main">
              Sub-Resellers ({subResellers.length})
            </span>
            {subResellers.length === 0 ? (
              <p className="text-xs text-text-muted">No sub-resellers.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {subResellers.map((s) => (
                  <Link
                    key={s.resellerId}
                    href={`/admin/resellers/${s.resellerId}`}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-bg-ghost-hover transition-colors"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-text-main truncate">
                        {s.fullName}
                      </span>
                      <span className="font-mono text-2xs text-text-dim">
                        {s.resellerCode}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-accent shrink-0">
                      {Number(s.subSharePercent).toFixed(0)}%
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent sales ── */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-bg-card-solid border border-border-light">
          <span className="text-sm font-bold text-text-main">Recent Sales (last 10)</span>
          {recentSales.length === 0 ? (
            <p className="text-xs text-text-muted">No sales yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left py-2 px-2 text-2xs font-bold uppercase text-text-muted">Date</th>
                    <th className="text-left py-2 px-2 text-2xs font-bold uppercase text-text-muted">Buyer</th>
                    <th className="text-right py-2 px-2 text-2xs font-bold uppercase text-text-muted">Price</th>
                    <th className="text-right py-2 px-2 text-2xs font-bold uppercase text-text-muted">Earned</th>
                    <th className="text-center py-2 px-2 text-2xs font-bold uppercase text-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((s) => (
                    <tr key={s.id} className="border-b border-border-light/50">
                      <td className="py-2 px-2 text-xs text-text-muted">{formatDate(s.createdAt)}</td>
                      <td className="py-2 px-2 text-sm font-semibold text-text-main">{s.buyerName}</td>
                      <td className="py-2 px-2 text-right text-sm text-text-main">{formatETB(s.retailPrice)}</td>
                      <td className="py-2 px-2 text-right text-sm font-bold text-success">{formatETB(s.earnings)}</td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-2xs font-bold ${
                            s.status === 'refunded'
                              ? 'bg-error/10 text-error'
                              : s.isLocked
                                ? 'bg-warning/10 text-warning'
                                : 'bg-success/10 text-success'
                          }`}
                        >
                          {s.status === 'refunded' ? 'Refunded' : s.isLocked ? 'Locked' : 'Paid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminResellerDetailPage;