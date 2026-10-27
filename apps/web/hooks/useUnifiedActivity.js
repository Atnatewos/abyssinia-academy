/**
 * @fileoverview Unified Activity Hook
 *
 * Fetches both MLM and Agent commission histories, merges them into
 * a single timeline, and sorts by most recent.
 *
 * Path: apps/web/hooks/useUnifiedActivity.js
 */

import { useState, useEffect } from 'react';
import apiClient from '../lib/api';

const useUnifiedActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [mlmRes, agentRes] = await Promise.all([
          apiClient.get('/referrals/mlm/commissions?limit=10'),
          apiClient.get('/agents/commissions?limit=10')
        ]);

        if (!mounted) return;

        const mlmItems = (mlmRes.data?.commissions || []).map(c => ({
          id: `mlm-${c.id}`,
          type: 'MLM',
          title: c.sourceUserName || 'Network Referral',
          amount: c.commissionAmount,
          date: c.createdAt,
          level: c.level
        }));

        const agentItems = (agentRes.data?.commissions || []).map(c => ({
          id: `agent-${c.id}`,
          type: 'Agent',
          title: c.sourceUserName || 'Direct Sale',
          amount: c.commissionAmount,
          date: c.paidAt || c.createdAt,
        }));

        // Merge and sort descending by date
        const merged = [...mlmItems, ...agentItems]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5); // Only show latest 5 in the overview

        setActivities(merged);
      } catch (err) {
        console.error('Failed to load unified activity:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();

    return () => { mounted = false; };
  }, []);

  return { activities, loading };
};

export default useUnifiedActivity;