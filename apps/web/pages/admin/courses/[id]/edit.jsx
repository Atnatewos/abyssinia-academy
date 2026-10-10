/**
 * @fileoverview Admin Course Edit Page (Stub)
 *
 * Placeholder for the full course edit form. Routes here from the
 * Edit button on /admin/courses. Once the full form is built, replace
 * this file with the complete CRUD UI.
 *
 * Path: apps/web/pages/admin/courses/[id]/edit.jsx
 */
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import AdminComingSoon from '../../../../components/admin/AdminComingSoon';
import { useLanguage } from '../../../../context/LanguageContext';

const AdminCourseEditPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={t.admin?.comingSoon?.editCourse || 'Edit Course'} />
      <AdminLayout
        title={t.admin?.comingSoon?.editCourse || 'Edit Course'}
        subtitle={t.admin?.comingSoon?.subtitle || 'This feature is coming soon'}
      >
        <AdminComingSoon
          titleKey="editCourse"
          backHref="/admin/courses"
          backLabel="backToCourses"
        />
      </AdminLayout>
    </>
  );
};

export default AdminCourseEditPage;