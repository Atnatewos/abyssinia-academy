/**
 * @fileoverview Admin Course Video Create Page (Stub)
 *
 * Placeholder for the video upload/create form. Routes here from the
 * "Add Video" button on /admin/course-videos. Renders the shared
 * AdminComingSoon workspace stub with shimmer preview.
 *
 * Path: apps/web/pages/admin/course-videos/new.jsx
 */
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminComingSoon from '../../../components/admin/AdminComingSoon';
import { useLanguage } from '../../../context/LanguageContext';

const AdminCourseVideoNewPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={t.admin?.comingSoon?.addVideo || 'Add Video'} />
      <AdminLayout
        title={t.admin?.comingSoon?.addVideo || 'Add Video'}
        subtitle={t.admin?.comingSoon?.subtitle || 'This feature is coming soon'}
      >
        <AdminComingSoon
          titleKey="addVideo"
          backHref="/admin/course-videos"
          backLabel="backToVideos"
        />
      </AdminLayout>
    </>
  );
};

export default AdminCourseVideoNewPage;