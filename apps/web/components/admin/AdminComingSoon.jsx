/**
 * @fileoverview Admin "Coming Soon" Stub Component
 *
 * Shared placeholder for admin CRUD routes that exist in navigation
 * but don't have full edit/create pages built yet. Displays:
 *   - Back button to the relevant index page
 *   - Skeleton shimmer preview of what the real page will look like
 *   - Friendly "Coming Soon" message (config-driven via i18n)
 *   - Contact support CTA for urgent admin needs
 *
 * Design choices:
 *   - Uses inline shimmer (real admin-table markup) instead of spinners
 *   - Zero hardcoded text — every label comes from i18n
 *   - Matches existing AdminLayout + back-button pattern
 *
 * Path: apps/web/components/admin/AdminComingSoon.jsx
 */
import { useRouter } from 'next/router';
import { ArrowLeft, Mail, Wrench, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * AdminComingSoon — shared stub for unfinished admin CRUD routes.
 *
 * @param {object} props
 * @param {string} props.titleKey - i18n key for page title (e.g. 'editCourse')
 * @param {string} props.backHref - Where the back button leads (e.g. '/admin/courses')
 * @param {string} props.backLabel - i18n key for back button text
 */
const AdminComingSoon = ({ titleKey, backHref, backLabel }) => {
  const router = useRouter();
  const { t } = useLanguage();

  const pageTitle = t.admin?.comingSoon?.[titleKey] || t.admin?.comingSoon?.defaultTitle || 'Feature Coming Soon';
  const backText = t.admin?.comingSoon?.[backLabel] || t.admin?.comingSoon?.defaultBack || 'Back';
  const eyebrow = t.admin?.comingSoon?.eyebrow || 'Work in Progress';
  const heading = t.admin?.comingSoon?.heading || 'This feature is being built';
  const description = t.admin?.comingSoon?.description || 'Our team is crafting a polished experience for this page. It will be available soon with full create, edit, and delete flows.';
  const contactLabel = t.admin?.comingSoon?.contactSupport || 'Need this now? Contact support';
  const supportEmail = t.admin?.comingSoon?.supportEmail || 'support@abyssinia-academy.com';

  return (
    <>
      <button className="admin-back-btn" onClick={() => router.push(backHref)}>
        <ArrowLeft size={16} />
        <span>{backText}</span>
      </button>

      <div className="admin-coming-soon">
        {/* Shimmer preview of what the real page will contain */}
        <div className="admin-coming-soon-preview">
          <div className="admin-coming-soon-toolbar">
            <span className="shimmer" style={{ width: '14rem', height: '2rem' }} />
            <span className="shimmer" style={{ width: '8rem', height: '2rem' }} />
            <span className="shimmer" style={{ width: '6rem', height: '2rem', marginLeft: 'auto' }} />
          </div>

          <div className="admin-coming-soon-rows">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`stub-shimmer-${i}`} className="admin-table-row">
                <div className="admin-table-info">
                  <div className="admin-table-info-top">
                    <div className="admin-table-avatar shimmer" />
                    <div className="admin-table-name-block">
                      <span className="admin-table-name shimmer" style={{ width: '60%', height: '0.875rem' }} />
                      <span className="admin-table-sub shimmer" style={{ width: '40%', height: '0.75rem' }} />
                    </div>
                    <span className="status-badge shimmer" style={{ width: '4rem', height: '1.25rem' }} />
                  </div>
                </div>
                <div className="admin-table-actions-wrapper">
                  <div className="admin-table-action-btns">
                    <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
                    <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
                    <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Friendly message overlay */}
        <div className="admin-coming-soon-message">
          <div className="admin-coming-soon-icon">
            <Sparkles size={32} />
          </div>
          <span className="admin-coming-soon-eyebrow">{eyebrow}</span>
          <h2 className="admin-coming-soon-title">{pageTitle}</h2>
          <p className="admin-coming-soon-description">{heading}</p>
          <p className="admin-coming-soon-detail">{description}</p>

          <div className="admin-coming-soon-actions">
            <button
              className="admin-coming-soon-btn secondary"
              onClick={() => router.push(backHref)}
            >
              <ArrowLeft size={16} />
              <span>{backText}</span>
            </button>
            <a href={`mailto:${supportEmail}`} className="admin-coming-soon-btn primary">
              <Mail size={16} />
              <span>{contactLabel}</span>
            </a>
          </div>

          <p className="admin-coming-soon-note">
            <Wrench size={12} />
            {t.admin?.comingSoon?.footerNote || 'Engineering team is on it — this page will be live in a future update.'}
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminComingSoon;