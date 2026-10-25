/**
 * @fileoverview Agent Code Input Component
 *
 * Input field with apply/remove functionality and validation feedback.
 * Mirrors DiscountCodeInput so the checkout experience is consistent.
 *
 * Behavior:
 *   - Buyer enters an agent code
 *   - Validates against /api/agents/validate
 *   - On success: shows agent name + commission structure, calls onAgentApplied
 *   - On failure: shows inline error
 *
 * This component is feature-flag gated — renders nothing when
 * AGENTS_ENABLED=false in the environment.
 *
 * ALL display text from i18n → t.agents.*
 *
 * Path: apps/web/components/agents/AgentCodeInput.jsx
 */

import React, { useState, useCallback } from 'react';
import { UserCheck, X, Check, Loader } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { isAgentsEnabled } from '../../lib/config';
import useAgentCode from '../../hooks/useAgentCode';

/**
 * AgentCodeInput — Allows buyers to enter and apply an agent code.
 *
 * @param {object} props
 * @param {function} props.onAgentApplied - Callback when agent code is applied
 * @param {function} props.onAgentRemoved - Callback when agent code is removed
 * @param {string} props.initialCode - Optional pre-filled agent code
 */
const AgentCodeInput = ({
  onAgentApplied,
  onAgentRemoved,
  initialCode = '',
}) => {
  const { t } = useLanguage();
  const {
    code,
    agentData,
    isApplied,
    isValidating,
    validationError,
    validateCode,
    applyCode,
    removeCode,
  } = useAgentCode();

  const [inputValue, setInputValue] = useState(initialCode);

  /* Feature flag — render nothing when agents are disabled */
  if (!isAgentsEnabled()) return null;

  /**
   * Handle the apply button click.
   */
  const handleApply = useCallback(async () => {
    if (!inputValue.trim()) return;

    const result = await validateCode(inputValue.trim());

    if (result.success && result.data) {
      applyCode(result.data.code || inputValue.trim().toUpperCase());
      if (onAgentApplied) {
        onAgentApplied(result.data);
      }
    }
  }, [inputValue, validateCode, applyCode, onAgentApplied]);

  /**
   * Handle the remove button click.
   */
  const handleRemove = useCallback(() => {
    removeCode();
    setInputValue('');
    if (onAgentRemoved) {
      onAgentRemoved();
    }
  }, [removeCode, onAgentRemoved]);

  /**
   * Handle Enter key press.
   */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApply();
      }
    },
    [handleApply]
  );

  /* ── Applied state ── */
  if (isApplied && agentData) {
    const commissionDisplay =
      agentData.displayText ||
      (agentData.commissionType === 'percentage'
        ? `${agentData.commissionValue}% ${t.agents?.percentageCommission || 'per sale'}`
        : `${agentData.commissionValue} ${t.agents?.fixedCommission || 'ETB per sale'}`);

    return (
      <div className="agent-code-input applied">
        <div className="agent-code-applied-badge">
          <Check size={14} />
          <span>
            {(t.agents?.agentCodeApplied || 'Agent code applied: {code}').replace(
              '{code}',
              code
            )}
          </span>
        </div>
        <div className="agent-code-applied-amount">
          <span className="agent-code-applied-info">
            {agentData.agentName} · {commissionDisplay}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="agent-code-remove-btn"
            title={t.agents?.agentDiscount || 'Remove agent code'}
            aria-label="Remove agent code"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Input state ── */
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
          {isValidating ? (
            <Loader size={14} className="animate-spin" />
          ) : (
            t.discounts?.applyCode || 'Apply'
          )}
        </button>
      </div>

      {validationError && <p className="agent-code-error">{validationError}</p>}
    </div>
  );
};

export default AgentCodeInput;