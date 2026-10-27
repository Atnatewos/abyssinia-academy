/**
 * @fileoverview Admin Agents Page
 * View, search, and manage agent commission settings.
 *
 * Path: apps/web/pages/admin/agents/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search, Briefcase, Edit, X, Save, UserCheck, ShieldAlert } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

const AdminAgentsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    commissionType: 'fixed',
    commissionValue: 500,
    isActive: true,
  });

  const fetchAgents = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiClient.get(`/admin/agents?${params.toString()}`);
      if (response.success) {
        setAgents(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load agents');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load agents');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, router, toast]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      commissionType: agent.commissionType || 'fixed',
      commissionValue: agent.commissionValue || 500,
      isActive: agent.settingsActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await apiClient.patch(`/admin/agents/${editingAgent.userId}/settings`, {
        commissionType: formData.commissionType,
        commissionValue: Number(formData.commissionValue),
        isActive: formData.isActive,
      });

      if (response.success) {
        toast.success('Agent settings updated.');
        fetchAgents();
        setShowModal(false);
      } else {
        toast.error(response.message || 'Failed to update.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update agent.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const renderShimmerRow = (index) => (
    <div key={`shimmer-${index}`} className="admin-table-row">
      <div className="admin-table-info">
        <div className="admin-table-info-top">
          <div className="admin-table-avatar shimmer" />
          <div className="admin-table-name-block">
            <span className="admin-table-name shimmer" style={{ width: '60%', height: '0.875rem' }} />
            <span className="admin-table-sub shimmer" style={{ width: '40%', height: '0.75rem' }} />
          </div>
          <span className="status-badge shimmer" style={{ width: '4rem', height: '1.25rem' }} />
        </div>
        <p className="admin-table-meta">
          <span className="shimmer" style={{ display: 'inline-block', width: '8rem', height: '0.75rem' }} />
        </p>
      </div>
      <div className="admin-table-actions-wrapper">
        <div className="admin-table-meta-col">
          <span className="shimmer" style={{ width: '6rem', height: '0.75rem' }} />
        </div>
        <div className="admin-table-action-btns">
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead title="Agent Management" />
      <AdminLayout title="Agent Management" subtitle="Configure agent commission rates and view performance">
        
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or code..."
            />
          </div>
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Agents</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-table-wrapper">
            {Array.from({ length: 6 }).map((_, i) => renderShimmerRow(i))}
          </div>
        ) : agents.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <h3 className="empty-state-title">No Agents Found</h3>
            <p className="empty-state-desc">
              {searchTerm || statusFilter !== 'all'
                ? 'No agents match your filters.'
                : 'No agents have been provisioned yet.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            {agents.map((agent) => (
              <div key={agent.userId} className="admin-table-row">
                <div className="admin-table-info">
                  <div className="admin-table-info-top">
                    <div className="admin-table-avatar" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent-gold)' }}>
                      {agent.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="admin-table-name-block">
                      <span className="admin-table-name">{agent.fullName || 'Unknown'}</span>
                      <span className="admin-table-sub">{agent.email || agent.phone || '—'}</span>
                    </div>
                    <span className={`status-badge ${agent.settingsActive ? 'approved' : 'rejected'}`}>
                      {agent.settingsActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <p className="admin-table-meta">
                    Code: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>{agent.agentCode || '—'}</span>
                    {' · '}
                    Rate: <strong style={{ color: '#fff' }}>{agent.commissionType === 'percentage' ? `${agent.commissionValue}%` : `${agent.commissionValue} ETB`}</strong>
                  </p>
                </div>

                <div className="admin-table-actions-wrapper">
                  <div className="admin-table-meta-col">
                    <span>Sales: {agent.totalSales}</span>
                    <span>Earned: {agent.totalEarned} ETB</span>
                  </div>
                  <div className="admin-table-action-btns">
                    <button
                      onClick={() => handleEdit(agent)}
                      className="admin-action-btn view"
                      title="Edit Settings"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>

      {/* Edit Modal */}
      {showModal && (
        <div className="checkout-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="checkout-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '28rem' }}>
            <button className="checkout-modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            <div className="checkout-modal-header">
              <h2 className="checkout-modal-title">Edit Agent Settings</h2>
            </div>
            <div className="checkout-modal-body">
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div className="profile-form-field">
                  <label>Agent Name</label>
                  <input type="text" value={editingAgent?.fullName || ''} disabled className="profile-form-input" />
                </div>

                <div className="admin-form-row">
                  <div className="profile-form-field">
                    <label>Commission Type</label>
                    <select
                      value={formData.commissionType}
                      onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                      className="admin-select"
                      style={{ width: '100%' }}
                    >
                      <option value="fixed">Fixed Amount (ETB)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div className="profile-form-field">
                    <label>Commission Value</label>
                    <input
                      type="number"
                      value={formData.commissionValue}
                      onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                      className="profile-form-input"
                      min="0"
                      max={formData.commissionType === 'percentage' ? 100 : 10000}
                    />
                  </div>
                </div>

                <div className="profile-form-field">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="admin-checkbox"
                    />
                    <span>Agent account is active (can earn commissions)</span>
                  </label>
                </div>

                <button type="submit" disabled={saving} className="profile-form-submit">
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAgentsPage;