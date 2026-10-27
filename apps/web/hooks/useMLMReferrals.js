/**
 * @fileoverview MLM Referrals Data Hook (Money Model v2)
 *
 * Central data-fetching hook for the 4-level MLM referral system.
 * Manages dashboard stats, commission history, downline tree,
 * bonus progress, and withdrawal lifecycle.
 *
 * IMPORTANT — response shape:
 *   The axios interceptor in lib/api.js already unwraps `response.data`,
 *   so every call below resolves directly to the JSON body:
 *   { success: boolean, message?: string, data: {...} }
 *   We therefore read `response.success` and `response.data` — never
 *   double-destructure.
 *
 * Path: apps/web/hooks/useMLMReferrals.js
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const useMLMReferrals = () => {
  const { user, isAuthenticated } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  const [commissions, setCommissions] = useState([]);
  const [commissionsPagination, setCommissionsPagination] = useState({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [commissionsSummary, setCommissionsSummary] = useState({
    unlocked: 0, locked: 0, thisMonth: 0,
  });
  const [commissionsLoading, setCommissionsLoading] = useState(false);

  const [tree, setTree] = useState([]);
  const [treeTotal, setTreeTotal] = useState(0);
  const [treeLoading, setTreeLoading] = useState(false);

  const [bonuses, setBonuses] = useState([]);
  const [bonusSummary, setBonusSummary] = useState(null);
  const [bonusesLoading, setBonusesLoading] = useState(false);

  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsPagination, setWithdrawalsPagination] = useState({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [withdrawalSubmitting, setWithdrawalSubmitting] = useState(false);

  /* Fetch: Full dashboard payload */
  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const response = await api.get('/referrals/mlm/dashboard');
      if (response && response.success) {
        setDashboard(response.data);
      } else {
        setDashboardError(response?.message || 'Failed to load dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load dashboard';
      setDashboardError(message);
    } finally {
      setDashboardLoading(false);
    }
  }, [isAuthenticated]);

  /* Fetch: Commission history (paginated) */
  const fetchCommissions = useCallback(async (page = 1) => {
    if (!isAuthenticated) return;
    setCommissionsLoading(true);
    try {
      const response = await api.get('/referrals/mlm/commissions', {
        params: { page, limit: 20 },
      });
      if (response && response.success) {
        setCommissions(response.data?.commissions || []);
        setCommissionsPagination(response.data?.pagination || {});
        setCommissionsSummary(response.data?.summary || { unlocked: 0, locked: 0, thisMonth: 0 });
      }
    } catch {
      /* Silent fail */
    } finally {
      setCommissionsLoading(false);
    }
  }, [isAuthenticated]);

  /* Fetch: Downline tree */
  const fetchTree = useCallback(async () => {
    if (!isAuthenticated) return;
    setTreeLoading(true);
    try {
      const response = await api.get('/referrals/mlm/tree');
      if (response && response.success) {
        setTree(response.data?.tree || []);
        setTreeTotal(response.data?.totalDescendants || 0);
      }
    } catch {
      /* Silent fail */
    } finally {
      setTreeLoading(false);
    }
  }, [isAuthenticated]);

  /* Fetch: Bonus history + per-category summary */
  const fetchBonuses = useCallback(async () => {
    if (!isAuthenticated) return;
    setBonusesLoading(true);
    try {
      const response = await api.get('/referrals/mlm/bonuses');
      if (response && response.success) {
        setBonuses(response.data?.bonuses || []);
        setBonusSummary(response.data?.summary || null);
      }
    } catch {
      /* Silent fail */
    } finally {
      setBonusesLoading(false);
    }
  }, [isAuthenticated]);

  /* Fetch: Withdrawal history (paginated) */
  const fetchWithdrawals = useCallback(async (page = 1) => {
    if (!isAuthenticated) return;
    setWithdrawalsLoading(true);
    try {
      const response = await api.get('/referrals/mlm/withdrawals', {
        params: { page, limit: 20 },
      });
      if (response && response.success) {
        setWithdrawals(response.data?.withdrawals || []);
        setWithdrawalsPagination(response.data?.pagination || {});
      }
    } catch {
      /* Silent fail */
    } finally {
      setWithdrawalsLoading(false);
    }
  }, [isAuthenticated]);

  /* Action: Submit withdrawal request */
  const requestWithdrawal = useCallback(async (payload) => {
    setWithdrawalSubmitting(true);
    try {
      const response = await api.post('/referrals/mlm/withdrawals', payload);
      if (response && response.success) {
        await Promise.all([fetchWithdrawals(), fetchDashboard()]);
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Withdrawal request failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Withdrawal request failed';
      return { success: false, message };
    } finally {
      setWithdrawalSubmitting(false);
    }
  }, [fetchWithdrawals, fetchDashboard]);

  /* Action: Refresh all data */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchDashboard(),
      fetchCommissions(),
      fetchTree(),
      fetchBonuses(),
      fetchWithdrawals(),
    ]);
  }, [fetchDashboard, fetchCommissions, fetchTree, fetchBonuses, fetchWithdrawals]);

  /* Initial load */
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
      fetchCommissions();
      fetchTree();
      fetchBonuses();
      fetchWithdrawals();
    }
  }, [isAuthenticated, fetchDashboard, fetchCommissions, fetchTree, fetchBonuses, fetchWithdrawals]);

  return {
    dashboard,
    dashboardLoading,
    dashboardError,
    fetchDashboard,

    commissions,
    commissionsPagination,
    commissionsSummary,
    commissionsLoading,
    fetchCommissions,

    tree,
    treeTotal,
    treeLoading,
    fetchTree,

    bonuses,
    bonusSummary,
    bonusesLoading,
    fetchBonuses,

    withdrawals,
    withdrawalsPagination,
    withdrawalsLoading,
    withdrawalSubmitting,
    fetchWithdrawals,
    requestWithdrawal,

    refreshAll,
  };
};

export default useMLMReferrals;