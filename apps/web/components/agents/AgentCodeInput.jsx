/**
 * @fileoverview Agent Code Input Component
 *
 * Three display states:
 *   1. Locked     — buyer registered via agent link; agent shown and
 *                   cannot be removed or changed
 *   2. Applied    — buyer manually entered an agent code (removable)
 *   3. Empty      — no agent code; user can type one
 *
 * React Rules of Hooks
 * ────────────────────
 * Every hook call in this component MUST run unconditionally on every
 * render. The `isAgentsEnabled()` check that hides this component when
 * the agent system is disabled therefore runs AFTER all hooks, not
 * before. Calling hooks below a conditional return would crash React
 * the moment that condition flipped.
 *
 * Path: apps/web/components/agents/AgentCodeInput.jsx
 */

import React, { useState, useCallback, useEffect } from 'react';
import { UserCheck, X, Check, Loader, Lock, Briefcase } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { isAgentsEnabled } from '../../lib/config';
import useAgentCode from '../../hooks/useAgentCode';

const AgentCodeInput = ({
  onAgentApplied,
  onAgentRemoved,
  initialCode = '',
  initialAgentName = '',
  isLocked = false,
}) => {
  const { t } = useLanguage();

  /*
   * Every hook below must execute on every render — see file header
   * for the React Rules of Hooks rationale.
   */
  const {
    code,
    agentData,
    isApplied,
    isValidating,
    validationError,
    validateCode,
    applyCode,
    applyPrevalidated,
    removeCode,
  } = useAgentCode();

  const [inputValue, setInputValue] = useState('');
  const [autoApplyDone, setAutoApplyDone] = useState(false);

  /*
   * If a locked agent code was passed in (from registration attribution),
   * apply it immediately and notify the parent so the submit payload can
   * include the correct attribution. Runs exactly once thanks to the
   * autoApplyDone guard.
   */
  useEffect(() => {
    if (autoApplyDone) return;
    if (!initialCode || !isLocked) return;
    if (isApplied) return;

    setAutoApplyDone(true);
    applyPrevalidated({
      code: initialCode,
      agentName: initialAgentName || 'Registered Agent',
    });

    if (onAgentApplied) {
      onAgentApplied({
        code: initialCode.toUpperCase(),
        agentName: initialAgentName || 'Registered Agent',
        agentUserId: null,
      });
    }
  }, [
    initialCode,
    initialAgentName,
    isLocked,
    isApplied,
    autoApplyDone,
    applyPrevalidated,
    onAgentApplied,
  ]);

  /**
   * Handle Apply button click (manual flow).
   */
  const handleApply = useCallback(async () => {
    if (!inputValue.trim() || isValidating) return;

    const result = await validateCode(inputValue.trim());
    if (result.success && result.data) {
      applyCode(result.data.code, result.data);
      if (onAgentApplied) onAgentApplied(result.data);
    }
  }, [inputValue, isValidating, validateCode, applyCode, onAgentApplied]);

  /**
   * Handle remove button (only available in non-locked state).
   */
  const handleRemove = useCallback(() => {
    if (isLocked) return;
    removeCode();
    setInputValue('');
    if (onAgentRemoved) onAgentRemoved();
  }, [isLocked, removeCode, onAgentRemoved]);

  /**
   * Apply on Enter key inside the input.
   */
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleApply();
      }
    },
    [handleApply]
  );

  /*
   * ── Conditional rendering (AFTER all hooks) ──
   * These early returns are safe because no hook is called below them.
   */

  if (!isAgentsEnabled()) return null;

  /* ── State: Applied / Locked ── */
  if (isApplied && (agentData || code)) {
    const displayName = agentData?.agentName || initialAgentName || 'Registered Agent';
    const displayCode = code || initialCode;
    const LockIcon = isLocked ? Lock : Check;
    const labelText = isLocked
      ? (
          t.agents?.invitedByAgent ||
          'Invited by agent: {name} ({code})'
        )
          .replace('{name}', displayName)
          .replace('{code}', displayCode)
      : (
          t.agents?.agentCodeApplied ||
          'Agent code applied: {code}'
        ).replace('{code}', displayCode);

    return (
      <div className={`agent-code-input applied ${isLocked ? 'locked' : ''}`}>
        <div className="agent-code-applied-badge">
          <LockIcon size={14} />
          <span>{labelText}</span>
        </div>
        <div className="agent-code-applied-amount">
          <span className="agent-code-applied-info">
            <Briefcase size={12} style={{ marginRight: 6, opacity: 0.7 }} />
            {displayName}
          </span>
          {!isLocked && (
            <button
              type="button"
              onClick={handleRemove}
              className="agent-code-remove-btn"
              title={t.agents?.removeAgentCode || ''}
              aria-label={t.agents?.removeAgentCode || 'Remove agent code'}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── State: Validating ── */
  if (isValidating) {
    return (
      <div className="agent-code-input">
        <div className="agent-code-input-row">
          <div className="agent-code-input-field">
            <Loader size={14} className="animate-spin" />
            <span style={{ marginLeft: 8, color: 'var(--text-dim)' }}>
              {t.agents?.validatingAgent || 'Validating agent code...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ── State: Empty / Manual entry ── */
  return (
    <div className="agent-code-input">
      <label className="agent-code-input-label">
        {t.agents?.haveAgentCode || 'Have an agent code?'}
      </label>

      <div className="agent-code-input-row">
        <div className="agent-code-input-field">
          <UserCheck size={14} className="agent-code-input-icon" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder={t.agents?.enterAgentCode || 'Enter Agent Code'}
            className="agent-code-input-text"
            disabled={isValidating}
            maxLength={20}
            autoComplete="off"
            autoCapitalize="characters"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={isValidating || !inputValue.trim()}
          className="agent-code-apply-btn"
        >
          {t.discounts?.applyCode || 'Apply'}
        </button>
      </div>

      {validationError && (
        <p className="agent-code-error">{validationError}</p>
      )}
    </div>
  );
};

export default AgentCodeInput;