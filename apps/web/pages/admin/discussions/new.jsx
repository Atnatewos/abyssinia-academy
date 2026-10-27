/**
 * @fileoverview Admin Discussion Create Page (Stub)
 *
 * Placeholder for the discussion video creation form.
 *
 * Path: apps/web/pages/admin/discussions/new.jsx
 */
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminComingSoon from '../../../components/admin/AdminComingSoon';
import { useLanguage } from '../../../context/LanguageContext';

const AdminDiscussionNewPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={t.admin?.comingSoon?.addDiscussion || 'Add Discussion'} />
      <AdminLayout
        title={t.admin?.comingSoon?.addDiscussion || 'Add Discussion'}
        subtitle={t.admin?.comingSoon?.subtitle || 'This feature is coming soon'}
      >
        <AdminComingSoon
          titleKey="addDiscussion"
          backHref="/admin/discussions"
          backLabel="backToDiscussions"
        />
      </AdminLayout>
    </>
  );
};

export default AdminDiscussionNewPage;