/**
 * @fileoverview Admin Course Video Edit Page (Stub)
 *
 * Placeholder for the video edit form. Routes here from the Edit
 * button on /admin/course-videos.
 *
 * Path: apps/web/pages/admin/course-videos/[id]/edit.jsx
 */
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import AdminComingSoon from '../../../../components/admin/AdminComingSoon';
import { useLanguage } from '../../../../context/LanguageContext';

const AdminCourseVideoEditPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={t.admin?.comingSoon?.editVideo || 'Edit Video'} />
      <AdminLayout
        title={t.admin?.comingSoon?.editVideo || 'Edit Video'}
        subtitle={t.admin?.comingSoon?.subtitle || 'This feature is coming soon'}
      >
        <AdminComingSoon
          titleKey="editVideo"
          backHref="/admin/course-videos"
          backLabel="backToVideos"
        />
      </AdminLayout>
    </>
  );
};

export default AdminCourseVideoEditPage;