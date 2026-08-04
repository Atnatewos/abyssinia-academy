/**
 * @fileoverview Admin Audit Logs Page
 * View admin activity and login history.
 * Path: apps/web/pages/admin/audit/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { FileText, Shield } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * AdminAuditPage — Audit log viewer.
 */
const AdminAuditPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.get('/admin/audit');
      if (response && response.success) {
        setLogs(response.data || []);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load audit logs.');
      }
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <>
      <SEOHead title="Audit Logs" />
      <AdminLayout title="Audit Logs" subtitle="Track admin activity and changes">
        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}>
            <div className="spinner-circle" />
          </div>
        ) : logs.length > 0 ? (
          <div className="admin-table-wrapper">
            {logs.map((log) => (
              <div key={log.id} className="admin-table-row">
                <div className="admin-table-info">
                  <div className="admin-table-info-top">
                    <Shield size={14} style={{ color: 'var(--accent-gold)' }} />
                    <span className="admin-table-name">{log.action}</span>
                  </div>
                  <p className="admin-table-meta">
                    {log.admin_username || 'System'} · {log.target_type} ·{' '}
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <p className="admin-table-meta" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <p className="empty-state-desc">No audit logs recorded yet.</p>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminAuditPage;