/**
 * @fileoverview Admin Discussion Edit Page (Stub)
 *
 * Placeholder for the discussion video edit form.
 *
 * Path: apps/web/pages/admin/discussions/[id]/edit.jsx
 */
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import AdminComingSoon from '../../../../components/admin/AdminComingSoon';
import { useLanguage } from '../../../../context/LanguageContext';

const AdminDiscussionEditPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={t.admin?.comingSoon?.editDiscussion || 'Edit Discussion'} />
      <AdminLayout
        title={t.admin?.comingSoon?.editDiscussion || 'Edit Discussion'}
        subtitle={t.admin?.comingSoon?.subtitle || 'This feature is coming soon'}
      >
        <AdminComingSoon
          titleKey="editDiscussion"
          backHref="/admin/discussions"
          backLabel="backToDiscussions"
        />
      </AdminLayout>
    </>
  );
};

export default AdminDiscussionEditPage;