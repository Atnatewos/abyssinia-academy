/**
 * @fileoverview Sub-Resellers List
 *
 * Renders the list of sub-resellers under the current reseller. Includes
 * an "Invite Sub-Reseller" button that opens the invite modal, and a
 * remove button on each row.
 *
 * Path: apps/web/components/reseller/SubResellersList.jsx
 */

import React, { useState } from 'react';
import { Users, UserPlus, Trash2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Button from '../shared/Button';
import SubResellerInviteModal from './SubResellerInviteModal';

/**
 * SubResellersList — Table of sub-resellers + invite modal.
 *
 * @param {object} props
 * @param {object[]} props.subResellers
 * @param {object} props.limits - { currentCount, maxAllowed }
 * @param {object} props.config - Invite modal config (share range, default price)
 * @param {boolean} props.loading
 * @param {string|null} props.error
 * @param {Function} props.onInvite - (identifier, share) => Promise<{ success, message? }>
 * @param {Function} props.onRemove - (id) => Promise<{ success, message? }>
 * @param {boolean} props.inviting
 * @param {string|null} props.inviteError
 * @param {Function} props.onRefetch
 */
const SubResellersList = ({
  subResellers,
  limits,
  config,
  loading,
  error,
  onInvite,
  onRemove,
  inviting,
  inviteError,
  onRefetch,
}) => {
  const { t } = useLanguage();
  const toast = useToast();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const currentCount = limits?.currentCount || 0;
  const maxAllowed = limits?.maxAllowed || 0;
  const atLimit = maxAllowed > 0 && currentCount >= maxAllowed;

  const handleRemove = async (id, displayName) => {
    if (
      !window.confirm(
        (
          t.reseller?.subResellers?.removeConfirm ||
          'Are you sure you want to remove {name}? They will no longer be able to sell under you.'
        ).replace('{name}', displayName || 'this sub-reseller')
      )
    ) {
      return;
    }

    setRemovingId(id);
    const result = await onRemove(id);
    if (result?.success) {
      toast.success(
        t.reseller?.subResellers?.removed || 'Sub-reseller removed.'
      );
    } else {
      toast.error(result?.message || 'Failed to remove sub-reseller.');
    }
    setRemovingId(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header with count + invite button */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-accent" />
            <h3 className="text-base font-extrabold text-text-main">
              {t.reseller?.subResellers?.listTitle || 'Your Sub-Resellers'}
            </h3>
            <span className="text-xs text-text-muted">
              ({currentCount} / {maxAllowed})
            </span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            disabled={atLimit}
          >
            <UserPlus size={14} />
            {atLimit
              ? (t.reseller?.subResellers?.limitReached || 'Limit reached').replace(
                  '{max}',
                  String(maxAllowed)
                )
              : t.reseller?.subResellers?.inviteButton || 'Invite Sub-Reseller'}
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-7 h-7 border-[3px] border-border-medium border-t-accent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 p-4 rounded-lg bg-error/8 border border-error/20">
            <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-sm text-error font-semibold">{error}</span>
              <button
                type="button"
                onClick={onRefetch}
                className="text-xs font-bold text-error underline self-start"
              >
                {t.common?.retry || 'Retry'}
              </button>
            </div>
          </div>
        ) : subResellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
              <Users size={28} />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <p className="text-sm font-bold text-text-main">
                {t.reseller?.subResellers?.empty || 'You have no sub-resellers yet.'}
              </p>
              <p className="text-xs text-text-muted">
                {t.reseller?.subResellers?.emptyHint ||
                  'Invite someone to sell for you. You decide how much of your share they get.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              disabled={atLimit}
            >
              <UserPlus size={14} />
              {t.reseller?.subResellers?.inviteButton || 'Invite Sub-Reseller'}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left py-3 px-3 text-2xs font-bold uppercase tracking-wider text-text-muted">
                    {t.reseller?.subResellers?.name || 'Name'}
                  </th>
                  <th className="text-center py-3 px-3 text-2xs font-bold uppercase tracking-wider text-text-muted">
                    {t.reseller?.subResellers?.theyEarn || 'Their Share'}
                  </th>
                  <th className="text-right py-3 px-3 text-2xs font-bold uppercase tracking-wider text-text-muted">
                    {t.reseller?.subResellers?.youKeep || 'You Keep'}
                  </th>
                  <th className="text-right py-3 px-3 text-2xs font-bold uppercase tracking-wider text-text-muted">
                    {t.reseller?.subResellers?.since || 'Since'}
                  </th>
                  <th className="text-right py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {subResellers.map((sub) => {
                  const theirShare = Number(sub.subSharePercent || 0);
                  const yourShare = 100 - theirShare;
                  const isRemoving = removingId === sub.id;
                  return (
                    <tr
                      key={sub.id}
                      className="border-b border-border-light/50 hover:bg-bg-ghost-hover transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-text-main">
                            {sub.displayName || 'Unknown'}
                          </span>
                          <span className="text-2xs text-text-dim font-mono">
                            {sub.resellerCode}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-1 rounded text-2xs font-bold bg-success/10 text-success">
                          {theirShare}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-block px-2 py-1 rounded text-2xs font-bold bg-accent/10 text-accent">
                          {yourShare}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-xs text-text-muted whitespace-nowrap">
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemove(sub.id, sub.displayName)}
                          disabled={isRemoving}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-error/10 text-error hover:bg-error hover:text-white transition-colors disabled:opacity-30"
                          title={t.reseller?.subResellers?.remove || 'Remove'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SubResellerInviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        config={config}
        onInvite={onInvite}
        inviting={inviting}
        inviteError={inviteError}
      />
    </>
  );
};

export default SubResellersList;
