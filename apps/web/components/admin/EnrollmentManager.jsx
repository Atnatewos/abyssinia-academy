/**
 * @fileoverview Enrollment Manager Component
 * Admin UI for managing student enrollment — full cancel, mode switch,
 * and individual phase toggling.
 * 
 * Features:
 * - View current enrollment status at a glance
 * - Switch between full-course and individual-phases mode
 * - Toggle individual phases on/off with checkboxes
 * - Cancel entire enrollment with confirmation
 * - Audit trail: all changes logged server-side
 * 
 * Path: apps/web/components/admin/EnrollmentManager.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Shield,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';

/**
 * Phase definitions sourced from the shared phases config
 * Each phase has an id, number, and title for display
 */
const ALL_PHASES = [
  { id: 'phase-1', number: 1, title: 'Building static websites using HTML, CSS & Bootstrap' },
  { id: 'phase-2', number: 2, title: 'Learn coding with JavaScript' },
  { id: 'phase-3', number: 3, title: 'Node, Express, MySql and React.js' },
  { id: 'phase-4', number: 4, title: 'The Project Phase - Building Fullstack Applications' },
  { id: 'phase-5', number: 5, title: 'Abe Garage Project - Building Fullstack Application' },
];

/**
 * EnrollmentManager — Complete enrollment control panel for a single student
 * 
 * @param {object} props
 * @param {string} props.userId - UUID of the student
 * @param {Function} [props.onEnrollmentChanged] - Callback after enrollment changes
 */
const EnrollmentManager = ({ userId, onEnrollmentChanged }) => {
  const toast = useToast();

  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [purchaseMode, setPurchaseMode] = useState('full-course');
  const [selectedPhases, setSelectedPhases] = useState([]);

  /**
   * Fetch current enrollment data from the API
   */
  const fetchEnrollment = useCallback(async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const response = await apiClient.get(`/admin/enrollments/${userId}`);

      if (response && response.success) {
        const data = response.data;

        if (data.hasEnrollment && data.enrollment) {
          setEnrollment(data.enrollment);
          setPurchaseMode(data.enrollment.purchaseMode || 'full-course');
          setSelectedPhases(data.enrollment.selectedPhases || []);
        } else {
          setEnrollment(null);
          setPurchaseMode('full-course');
          setSelectedPhases([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch enrollment:', error);
      toast.error('Failed to load enrollment data.');
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  /**
   * Toggle a phase on/off in the selected phases array
   */
  const handleTogglePhase = (phaseId) => {
    setSelectedPhases((prev) => {
      if (prev.includes(phaseId)) {
        return prev.filter((p) => p !== phaseId);
      }
      return [...prev, phaseId];
    });
  };

  /**
   * Save enrollment changes to the server
   */
  const handleSaveEnrollment = async () => {
    if (selectedPhases.length === 0 && purchaseMode === 'individual-phases') {
      toast.error('Please select at least one phase for individual-phases mode.');
      return;
    }

    setSaving(true);

    try {
      const response = await apiClient.put(`/admin/enrollments/${userId}`, {
        purchaseMode,
        selectedPhases: purchaseMode === 'individual-phases' ? selectedPhases : null,
      });

      if (response && response.success) {
        toast.success(response.message || 'Enrollment updated successfully.');
        setEnrollment(response.data.enrollment);
        if (onEnrollmentChanged) onEnrollmentChanged();
      } else {
        toast.error(response?.message || 'Failed to update enrollment.');
      }
    } catch (error) {
      console.error('Failed to save enrollment:', error);
      toast.error(error?.response?.data?.message || 'Failed to update enrollment.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cancel the entire enrollment
   */
  const handleCancelEnrollment = async () => {
    setSaving(true);

    try {
      const response = await apiClient.delete(`/admin/enrollments/${userId}`);

      if (response && response.success) {
        toast.success(response.message || 'Enrollment cancelled.');
        setEnrollment(null);
        setPurchaseMode('full-course');
        setSelectedPhases([]);
        setShowCancelConfirm(false);
        if (onEnrollmentChanged) onEnrollmentChanged();
      } else {
        toast.error(response?.message || 'Failed to cancel enrollment.');
      }
    } catch (error) {
      console.error('Failed to cancel enrollment:', error);
      toast.error('Failed to cancel enrollment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-detail-section">
        <div className="spinner" style={{ marginTop: '1rem' }}>
          <div className="spinner-circle" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-detail-section">
      <div className="admin-detail-section-header">
        <h4 className="admin-detail-section-title">
          <Layers size={16} />
          Enrollment Management
        </h4>
        <button
          className="admin-action-btn refresh"
          onClick={fetchEnrollment}
          title="Refresh enrollment data"
          disabled={loading}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Current Enrollment Status */}
      {enrollment ? (
        <div className="admin-enrollment-status">
          <div className="admin-enrollment-badge-row">
            {enrollment.purchaseMode === 'full-course' ? (
              <span className="enrollment-badge full-course">
                <Shield size={14} />
                Full Course
              </span>
            ) : (
              <span className="enrollment-badge individual">
                <Layers size={14} />
                {enrollment.selectedPhases?.length || 0} Phase(s)
              </span>
            )}
            <span className="enrollment-date">
              Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ) : (
        <div className="admin-enrollment-empty">
          <XCircle size={20} style={{ color: 'var(--text-dim)' }} />
          <p>This student is not currently enrolled.</p>
        </div>
      )}

      {/* Enrollment Editor */}
      <div className="admin-enrollment-editor">
        {/* Purchase Mode Selector */}
        <div className="admin-form-group">
          <label className="admin-form-label">Purchase Mode</label>
          <div className="admin-radio-group">
            <label className={`admin-radio-card ${purchaseMode === 'full-course' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="purchaseMode"
                value="full-course"
                checked={purchaseMode === 'full-course'}
                onChange={() => setPurchaseMode('full-course')}
              />
              <div className="admin-radio-content">
                <BookOpen size={18} />
                <div>
                  <span className="admin-radio-title">Full Course</span>
                  <span className="admin-radio-desc">Access to all 5 phases</span>
                </div>
              </div>
            </label>

            <label className={`admin-radio-card ${purchaseMode === 'individual-phases' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="purchaseMode"
                value="individual-phases"
                checked={purchaseMode === 'individual-phases'}
                onChange={() => setPurchaseMode('individual-phases')}
              />
              <div className="admin-radio-content">
                <Layers size={18} />
                <div>
                  <span className="admin-radio-title">Individual Phases</span>
                  <span className="admin-radio-desc">Select specific phases</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Phase Checkboxes (visible in individual-phases mode) */}
        {purchaseMode === 'individual-phases' && (
          <div className="admin-form-group">
            <label className="admin-form-label">
              Select Phases ({selectedPhases.length} selected)
            </label>
            <div className="admin-phase-checkboxes">
              {ALL_PHASES.map((phase) => {
                const isSelected = selectedPhases.includes(phase.id);
                return (
                  <label
                    key={phase.id}
                    className={`admin-phase-checkbox ${isSelected ? 'checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePhase(phase.id)}
                    />
                    <div className="admin-phase-checkbox-content">
                      <span className="admin-phase-checkbox-number">Phase {phase.number}</span>
                      <span className="admin-phase-checkbox-title">{phase.title}</span>
                    </div>
                    {isSelected ? (
                      <CheckCircle size={16} className="phase-check-icon checked" />
                    ) : (
                      <div className="phase-check-icon unchecked" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="admin-enrollment-actions">
          <button
            className="admin-btn primary"
            onClick={handleSaveEnrollment}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="spinner-circle-sm" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                {enrollment ? 'Update Enrollment' : 'Create Enrollment'}
              </>
            )}
          </button>

          {enrollment && (
            <button
              className="admin-btn danger"
              onClick={() => setShowCancelConfirm(true)}
              disabled={saving}
            >
              <Trash2 size={16} />
              Cancel Enrollment
            </button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="admin-confirm-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="admin-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-icon danger">
              <AlertTriangle size={24} />
            </div>
            <h3 className="admin-confirm-title">Cancel Enrollment?</h3>
            <p className="admin-confirm-desc">
              This will remove all course access for this student. Their progress data will be preserved
              but they will no longer be able to access any course content.
            </p>
            <div className="admin-confirm-actions">
              <button
                className="admin-btn secondary"
                onClick={() => setShowCancelConfirm(false)}
                disabled={saving}
              >
                Keep Enrollment
              </button>
              <button
                className="admin-btn danger"
                onClick={handleCancelEnrollment}
                disabled={saving}
              >
                {saving ? 'Cancelling...' : 'Yes, Cancel Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManager;