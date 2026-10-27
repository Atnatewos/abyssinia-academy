/**
 * @fileoverview Countdown Timer Hook
 * Manages countdown state with config-driven duration, messages, and color thresholds
 * Path: apps/web/hooks/useCountdownTimer.js
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getCountdownTimerConfig } from '../lib/config';

/**
 * Custom hook for countdown timer with config-driven behavior
 * Reads duration, messages, and color thresholds from payments.config.js
 *
 * @returns {object} Timer state and formatted display values
 */
const useCountdownTimer = () => {
  const config = useMemo(() => getCountdownTimerConfig(), []);
  const durationSeconds = useMemo(() => (config.durationMinutes || 15) * 60, [config]);
  const colors = useMemo(() => config.colors || {}, [config]);
  const warningThreshold = useMemo(() => (config.warningThresholdPercent || 30) / 100, [config]);
  const dangerThreshold = useMemo(() => (config.dangerThresholdPercent || 10) / 100, [config]);

  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef(null);

  /*
   * Start the countdown on mount
   */
  useEffect(() => {
    if (!config.enabled || durationSeconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [config.enabled, durationSeconds]);

  /*
   * Format remaining time as MM:SS
   */
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      total: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
  }, [remainingSeconds]);

  /*
   * Determine current color based on remaining time percentage
   */
  const currentColor = useMemo(() => {
    if (isExpired) return colors.expired || '#6b7280';
    const percentRemaining = remainingSeconds / durationSeconds;
    if (percentRemaining <= dangerThreshold) return colors.danger || '#ef4444';
    if (percentRemaining <= warningThreshold) return colors.warning || '#fbbf24';
    return colors.normal || '#f59e0b';
  }, [remainingSeconds, durationSeconds, isExpired, colors, dangerThreshold, warningThreshold]);

  /*
   * Percentage remaining for progress bar
   */
  const percentRemaining = useMemo(() => {
    return Math.round((remainingSeconds / durationSeconds) * 100);
  }, [remainingSeconds, durationSeconds]);

  return {
    isEnabled: config.enabled !== false,
    remainingSeconds,
    isExpired,
    formattedTime,
    currentColor,
    percentRemaining,
    messages: config.messages || {},
    durationMinutes: config.durationMinutes || 15,
  };
};

export default useCountdownTimer;