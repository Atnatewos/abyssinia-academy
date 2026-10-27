/**
 * @fileoverview Admin Administrator Detail Page (Stub)
 *
 * Placeholder for the administrator detail + permissions management page.
 *
 * Path: apps/web/pages/admin/admins/[id]/index.jsx
 */
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import AdminComingSoon from '../../../../components/admin/AdminComingSoon';
import { useLanguage } from '../../../../context/LanguageContext';

const AdminAdminDetailPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={t.admin?.comingSoon?.viewAdmin || 'Administrator Details'} />
      <AdminLayout
        title={t.admin?.comingSoon?.viewAdmin || 'Administrator Details'}
        subtitle={t.admin?.comingSoon?.subtitle || 'This feature is coming soon'}
      >
        <AdminComingSoon
          titleKey="viewAdmin"
          backHref="/admin/admins"
          backLabel="backToAdmins"
        />
      </AdminLayout>
    </>
  );
};

export default AdminAdminDetailPage;