/**
 * @fileoverview MLM Level Explanation
 *
 * Visual explanation of how the 4-level commission system works.
 * Supports both inline rendering and modal popup mode (via isOpen/onClose props).
 *
 * Path: apps/web/components/referral/MLMLevelExplanation.jsx
 */
import React, { useMemo } from 'react';
import { ArrowDown, User, Users, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getCommissionStructure } from '../../lib/config';

const MLMLevelExplanation = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const commissionConfig = useMemo(() => getCommissionStructure(), []);
  const levelAmounts = commissionConfig?.levelAmounts || [200, 150, 100, 50];
  const maxLevels = commissionConfig?.maxLevels || 4;
  
  const exampleNames = [
    t.referrals?.mlm?.howItWorks?.exampleYou || 'You (Abebe)',
    t.referrals?.mlm?.howItWorks?.exampleLevel1 || 'Betty',
    t.referrals?.mlm?.howItWorks?.exampleLevel2 || 'Abel',
    t.referrals?.mlm?.howItWorks?.exampleLevel3 || 'Dawit',
    t.referrals?.mlm?.howItWorks?.exampleLevel4 || 'Helen',
  ];

  const levels = Array.from({ length: maxLevels }, (_, index) => ({
    level: index + 1,
    amount: levelAmounts[index] || 0,
    name: exampleNames[index + 1] || `Level ${index + 1}`,
  }));

  const isModal = isOpen !== undefined;

  const content = (
    <div className={`glass-card mlm-level-explanation ${isModal ? 'mlm-explanation-modal' : ''}`}>
      {isModal && (
        <div className="mlm-explanation-modal-header">
          <div className="mlm-explanation-modal-icon">
            <Users size={22} />
          </div>
          <div className="mlm-explanation-modal-title-group">
            <h3 className="mlm-explanation-modal-title">
              {t.referrals?.mlm?.howItWorks?.title || 'How the 4-Level System Works'}
            </h3>
            <p className="mlm-explanation-modal-subtitle">
              {t.referrals?.mlm?.howItWorks?.description ||
                'When someone in your network makes a purchase, you and up to 3 people above you earn commissions.'}
            </p>
          </div>
          <button type="button" className="mlm-explanation-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
      )}

      {!isModal && (
        <>
          <h3 className="mlm-section-title">
            {t.referrals?.mlm?.howItWorks?.title || 'How the 4-Level System Works'}
          </h3>
          <p className="mlm-section-subtitle">
            {t.referrals?.mlm?.howItWorks?.description ||
              'When someone in your network makes a purchase, you and up to 3 people above you earn commissions.'}
          </p>
        </>
      )}

      <div className="mlm-level-chain">
        <div className="mlm-level-node mlm-level-you">
          <div className="mlm-level-avatar mlm-avatar-primary">
            <User size={20} />
          </div>
          <div className="mlm-level-info">
            <span className="mlm-level-name">{exampleNames[0]}</span>
            <span className="mlm-level-role">
              {t.referrals?.mlm?.howItWorks?.youEarn || 'You earn from all 4 levels below'}
            </span>
          </div>
        </div>
        
        {levels.map((level) => (
          <React.Fragment key={level.level}>
            <div className="mlm-level-connector">
              <ArrowDown size={16} />
            </div>
            <div className="mlm-level-node">
              <div className={`mlm-level-avatar mlm-avatar-level-${level.level}`}>
                <Users size={18} />
              </div>
              <div className="mlm-level-info">
                <span className="mlm-level-name">{level.name}</span>
                <span className="mlm-level-tag">
                  {t.referrals?.mlm?.howItWorks?.[`level${level.level}`] || `Level ${level.level}`}
                </span>
              </div>
              <div className="mlm-level-amount">
                <span className="mlm-amount-value">{level.amount} ETB</span>
                <span className="mlm-amount-label">
                  {t.referrals?.mlm?.howItWorks?.perSale || 'per sale'}
                </span>
              </div>
            </div>
          </React.Fragment>
        ))}
        
        <div className="mlm-level-connector">
          <ArrowDown size={16} />
        </div>
        <div className="mlm-level-node mlm-level-disabled">
          <div className="mlm-level-avatar mlm-avatar-disabled">
            <Users size={18} />
          </div>
          <div className="mlm-level-info">
            <span className="mlm-level-name">
              {t.referrals?.mlm?.howItWorks?.beyondLevel4 || 'Level 5+'}
            </span>
            <span className="mlm-level-tag mlm-tag-disabled">
              {t.referrals?.mlm?.howItWorks?.noCommission || 'No commission'}
            </span>
          </div>
        </div>
      </div>

      <div className="mlm-level-summary">
        <div className="mlm-summary-item">
          <span className="mlm-summary-label">
            {t.referrals?.mlm?.howItWorks?.totalPerSale || 'Total commission per sale'}
          </span>
          <span className="mlm-summary-value">
            {(commissionConfig?.totalPerSale || levelAmounts.reduce((sum, amount) => sum + amount, 0))} ETB
          </span>
        </div>
        <div className="mlm-summary-item">
          <span className="mlm-summary-label">
            {t.referrals?.mlm?.howItWorks?.unlockPeriod || 'Unlock period'}
          </span>
          <span className="mlm-summary-value">
            {commissionConfig?.unlockDelayDays || 7} {t.referrals?.mlm?.howItWorks?.days || 'days'}
          </span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    if (!isOpen) return null;
    return (
      <div className="checkout-modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
        <div className="checkout-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default MLMLevelExplanation;