/**
 * @fileoverview Cart Hook
 * Manages phase selection state with prerequisite validation
 * Path: apps/web/hooks/useCart.js
 */

import { useState, useCallback, useMemo } from 'react';
import { getPurchasablePhases } from '../lib/config';

/**
 * Custom hook for managing phase selection cart
 * Handles prerequisite validation — prevents selecting advanced phases
 * without their required foundation phases
 *
 * @returns {object} Cart state and actions
 */
const useCart = () => {
  const [selectedPhases, setSelectedPhases] = useState([]);

  /*
   * All phases available for purchase from config
   */
  const allPhases = useMemo(() => getPurchasablePhases(), []);

  /**
   * Check if a phase can be selected based on currently selected phases
   * A phase is selectable if all its prerequisites are already selected
   *
   * @param {string} phaseId - Phase ID to check
   * @returns {object} { canSelect: boolean, missingPrerequisites: string[] }
   */
  const canSelectPhase = useCallback((phaseId) => {
    const phase = allPhases.find((p) => p.id === phaseId);
    if (!phase || !phase.prerequisites || phase.prerequisites.length === 0) {
      return { canSelect: true, missingPrerequisites: [] };
    }

    const missing = phase.prerequisites.filter(
      (prereqId) => !selectedPhases.includes(prereqId)
    );

    return {
      canSelect: missing.length === 0,
      missingPrerequisites: missing,
    };
  }, [allPhases, selectedPhases]);

  /**
   * Toggle a phase in/out of the cart
   * Automatically deselects dependent phases when a prerequisite is removed
   *
   * @param {string} phaseId - Phase ID to toggle
   */
  const togglePhase = useCallback((phaseId) => {
    setSelectedPhases((prev) => {
      const isSelected = prev.includes(phaseId);

      if (isSelected) {
        /*
         * When deselecting a phase, also deselect any phases
         * that depend on this one as a prerequisite
         */
        const dependentsToRemove = allPhases.filter((p) =>
          p.prerequisites && p.prerequisites.includes(phaseId)
        ).map((p) => p.id);

        return prev.filter((id) => id !== phaseId && !dependentsToRemove.includes(id));
      }

      /*
       * When selecting, just add if prerequisites are met
       */
      const { canSelect } = canSelectPhase(phaseId);
      if (canSelect) {
        return [...prev, phaseId];
      }
      return prev;
    });
  }, [allPhases, canSelectPhase]);

  /**
   * Select all phases (full course mode)
   */
  const selectAllPhases = useCallback(() => {
    const allIds = allPhases.map((p) => p.id);
    setSelectedPhases(allIds);
  }, [allPhases]);

  /**
   * Clear all selected phases
   */
  const clearCart = useCallback(() => {
    setSelectedPhases([]);
  }, []);

  /**
   * Check if a phase is currently selected
   * @param {string} phaseId - Phase ID
   * @returns {boolean}
   */
  const isPhaseSelected = useCallback((phaseId) => {
    return selectedPhases.includes(phaseId);
  }, [selectedPhases]);

  /**
   * Get the full phase objects for currently selected phases
   */
  const selectedPhaseObjects = useMemo(() => {
    return allPhases.filter((p) => selectedPhases.includes(p.id));
  }, [allPhases, selectedPhases]);

  return {
    selectedPhases,
    selectedPhaseObjects,
    allPhases,
    togglePhase,
    selectAllPhases,
    clearCart,
    isPhaseSelected,
    canSelectPhase,
  };
};

export default useCart;