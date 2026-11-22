// /**
//  * @fileoverview Admin Courses List Page
//  *
//  * Lists all courses (published + drafts). Shows each course's own price
//  * when set, or "— Uses global pricing" when it falls back to the platform
//  * default. Every label uses i18n — zero hardcoded strings.
//  *
//  * Path: apps/web/pages/admin/courses/index.jsx
//  */
// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/router';
// import { Search, Edit, Trash2, Eye, BookOpen, Plus } from 'lucide-react';
// import SEOHead from '../../../components/shared/SEOHead';
// import AdminLayout from '../../../components/admin/AdminLayout';
// import { useLanguage } from '../../../context/LanguageContext';
// import { useToast } from '../../../context/ToastContext';
// import apiClient from '../../../lib/api';
// import { getItem } from '../../../lib/storage';

// const AdminCoursesPage = () => {
//   const router = useRouter();
//   const { t } = useLanguage();
//   const toast = useToast();

//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [levelFilter, setLevelFilter] = useState('all');
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   const fetchCourses = useCallback(async () => {
//     const token = getItem('admin_token');
//     if (!token) {
//       router.push('/admin/login');
//       return;
//     }

//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (levelFilter !== 'all') params.append('level', levelFilter);
//       if (searchTerm) params.append('search', searchTerm);

//       const response = await apiClient.get(`/admin/courses?${params.toString()}`);
//       if (response && response.success) {
//         setCourses(response.data || []);
//       } else {
//         toast.error(response.message || t.admin?.courses?.toasts?.loadFailed);
//       }
//     } catch (err) {
//       if (err?.response?.status === 401) {
//         router.push('/admin/login');
//       } else {
//         toast.error(t.admin?.courses?.toasts?.loadFailed);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [levelFilter, searchTerm, router, toast, t]);

//   useEffect(() => {
//     fetchCourses();
//   }, [fetchCourses]);

//   const handleDelete = async (courseId) => {
//     try {
//       const response = await apiClient.delete(`/admin/courses/${courseId}`);
//       if (response.success) {
//         toast.success(t.admin?.courses?.toasts?.deleted);
//         setDeleteConfirm(null);
//         fetchCourses();
//       } else if (!response.cancelled) {
//         toast.error(response.message || t.admin?.courses?.toasts?.deleteFailed);
//       }
//     } catch {
//       toast.error(t.admin?.courses?.toasts?.deleteFailed);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '—';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const renderShimmerRow = (index) => (
//     <div key={`shimmer-${index}`} className="admin-table-row">
//       <div className="admin-table-info">
//         <div className="admin-table-info-top">
//           <div className="admin-table-avatar course shimmer" />
//           <div className="admin-table-name-block">
//             <span
//               className="admin-table-name shimmer"
//               style={{ width: '65%', height: '0.875rem' }}
//             />
//             <span
//               className="admin-table-sub shimmer"
//               style={{ width: '80%', height: '0.75rem' }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   /* ── Price display: course-specific price or "— Uses global pricing" ── */
//   const renderPriceMeta = (course) => {
//     if (course.price_etb != null && Number(course.price_etb) > 0) {
//       return (t.admin?.courses?.priceDisplay?.custom || '{amount} ETB').replace(
//         '{amount}',
//         Number(course.price_etb).toLocaleString()
//       );
//     }
//     return t.admin?.courses?.priceDisplay?.global || '— Uses global pricing';
//   };

//   return (
//     <>
//       <SEOHead title={t.admin?.courses?.pageTitle || 'Courses Management'} />
//       <AdminLayout
//         title={t.admin?.courses?.pageTitle || 'Courses Management'}
//         subtitle={
//           t.admin?.courses?.pageSubtitle || 'Manage course catalog and content'
//         }
//       >
//         <div className="admin-toolbar">
//           <div className="admin-search">
//             <Search size={16} />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder={
//                 t.admin?.courses?.searchPlaceholder || 'Search courses...'
//               }
//             />
//           </div>
//           <select
//             className="admin-filter-select"
//             value={levelFilter}
//             onChange={(e) => setLevelFilter(e.target.value)}
//           >
//             <option value="all">
//               {t.admin?.courses?.allLevels || 'All Levels'}
//             </option>
//             <option value="Beginner">
//               {t.admin?.courses?.levels?.beginner || 'Beginner'}
//             </option>
//             <option value="Intermediate">
//               {t.admin?.courses?.levels?.intermediate || 'Intermediate'}
//             </option>
//             <option value="Advanced">
//               {t.admin?.courses?.levels?.advanced || 'Advanced'}
//             </option>
//           </select>
//           <button
//             className="admin-toolbar-btn primary"
//             onClick={() => router.push('/admin/courses/new')}
//           >
//             <Plus size={16} />
//             <span>{t.admin?.courses?.newCourseBtn || 'New Course'}</span>
//           </button>
//         </div>

//         {loading ? (
//           <div className="admin-table-wrapper">
//             {Array.from({ length: 5 }).map((_, i) => renderShimmerRow(i))}
//           </div>
//         ) : courses.length === 0 ? (
//           <div className="empty-state">
//             <p className="empty-state-desc">
//               {searchTerm || levelFilter !== 'all'
//                 ? t.admin?.courses?.empty?.noSearchResults ||
//                   'No courses match your filters.'
//                 : t.admin?.courses?.empty?.noCourses ||
//                   'No courses created yet.'}
//             </p>
//           </div>
//         ) : (
//           <div className="admin-table-wrapper">
//             {courses.map((course) => (
//               <div key={course.id} className="admin-table-row">
//                 <div className="admin-table-info">
//                   <div className="admin-table-info-top">
//                     <div className="admin-table-avatar course">
//                       <BookOpen size={16} />
//                     </div>
//                     <div className="admin-table-name-block">
//                       <span className="admin-table-name">
//                         {course.title || 'Untitled'}
//                       </span>
//                       <span className="admin-table-sub">
//                         {course.description?.slice(0, 80) || '—'}
//                         {(course.description?.length || 0) > 80 ? '...' : ''}
//                       </span>
//                     </div>
//                     {course.level && (
//                       <span className="phase-badge">{course.level}</span>
//                     )}
//                     {course.badge && (
//                       <span className="role-badge role-admin">
//                         {course.badge}
//                       </span>
//                     )}
//                   </div>
//                   <p className="admin-table-meta">
//                     {course.duration || '—'} · {renderPriceMeta(course)} ·{' '}
//                     {(t.admin?.courses?.meta?.status || 'Status')}:{' '}
//                     {course.is_published
//                       ? t.admin?.courses?.fields?.published || 'Published'
//                       : t.admin?.courses?.fields?.draft || 'Draft'}
//                   </p>
//                 </div>

//                 <div className="admin-table-actions-wrapper">
//                   <div className="admin-table-action-btns">
//                     <button
//                       onClick={() => router.push(`/admin/courses/${course.id}`)}
//                       className="admin-action-btn view"
//                       title={t.admin?.courses?.actions?.viewWeeks || 'View'}
//                     >
//                       <Eye size={16} />
//                     </button>
//                     <button
//                       onClick={() =>
//                         router.push(`/admin/courses/${course.id}/edit`)
//                       }
//                       className="admin-action-btn edit"
//                       title={t.admin?.courses?.actions?.edit || 'Edit'}
//                     >
//                       <Edit size={16} />
//                     </button>
//                     <button
//                       onClick={() => setDeleteConfirm(course.id)}
//                       className="admin-action-btn reject"
//                       title={t.admin?.courses?.actions?.delete || 'Delete'}
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {deleteConfirm && (
//           <div
//             className="modal-overlay"
//             onClick={() => setDeleteConfirm(null)}
//           >
//             <div
//               className="modal-content"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <h3>{t.admin?.courses?.actions?.delete || 'Delete'}?</h3>
//               <p>
//                 {t.admin?.courses?.empty?.noCourses
//                   ? 'This action cannot be undone.'
//                   : 'This action cannot be undone.'}
//               </p>
//               <div className="modal-actions">
//                 <button
//                   className="btn-secondary"
//                   onClick={() => setDeleteConfirm(null)}
//                 >
//                   {t.admin?.courses?.actions?.cancel || 'Cancel'}
//                 </button>
//                 <button
//                   className="btn-danger"
//                   onClick={() => handleDelete(deleteConfirm)}
//                 >
//                   {t.admin?.courses?.actions?.delete || 'Delete'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </AdminLayout>
//     </>
//   );
// };

// export default AdminCoursesPage;











/**
 * @fileoverview Admin Courses List
 *
 * Course catalog management on the shared admin primitives. Search is
 * debounced; level filtering and fetching run through useAdminQuery.
 * Deletion routes through useAdminMutation with a styled confirmation
 * dialog — no bespoke modal markup remains.
 *
 * Backend note: curriculum CRUD lives on Express (/admin/courses*) per
 * the dual-backend routing contract in lib/api.js. This page consumes
 * that surface unchanged; consolidation happens in Wave 6.
 *
 * Path: apps/web/pages/admin/courses/index.jsx
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Eye, Edit, Trash2, BookOpen, Plus } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminToolbar from '../../../components/admin/ui/AdminToolbar';
import AdminBadge from '../../../components/admin/ui/AdminBadge';
import AdminButton from '../../../components/admin/ui/AdminButton';
import { AdminRowList } from '../../../components/admin/ui/AdminTable';
import { AdminSelect } from '../../../components/admin/ui/AdminInput';
import { useLanguage } from '../../../context/LanguageContext';
import useAdminQuery, {
  useDebouncedValue,
} from '../../../lib/admin/useAdminQuery';
import useAdminMutation from '../../../lib/admin/useAdminMutation';
import { resolveLabel, interpolate } from '../../../lib/admin/labels';

/** Maximum description length shown in the row subtitle. */
const DESCRIPTION_PREVIEW_LENGTH = 80;

const AdminCoursesPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { mutate, busy } = useAdminMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const debouncedSearch = useDebouncedValue(searchTerm);
  const label = (key) => resolveLabel(t, key);
  const emDash = label('admin.common.labels.emDash');

  const { data: courses, loading, refetch } = useAdminQuery({
    url: () => {
      const params = new URLSearchParams();
      if (levelFilter !== 'all') params.append('level', levelFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);
      return `/admin/courses?${params.toString()}`;
    },
    deps: [levelFilter, debouncedSearch],
    initialData: [],
    errorKey: 'admin.courses.toasts.loadFailed',
  });

  /**
   * Delete a course after styled confirmation, then refresh the list.
   */
  const handleDelete = async (courseId) => {
    setDeletingId(courseId);
    await mutate({
      method: 'delete',
      url: `/admin/courses/${courseId}`,
      confirm: {
        title: label('admin.common.confirm.deleteTitle'),
        message: label('admin.common.confirm.deleteMessage'),
        confirmText: label('admin.courses.actions.delete'),
        variant: 'danger',
      },
      successKey: 'admin.courses.toasts.deleted',
      errorKey: 'admin.courses.toasts.deleteFailed',
      onSuccess: refetch,
    });
    setDeletingId(null);
  };

  /**
   * Price display: course-specific price or the global-pricing notice.
   */
  const renderPriceMeta = (course) => {
    const price = Number(course.price_etb);
    if (course.price_etb != null && price > 0) {
      return interpolate(label('admin.courses.priceDisplay.custom'), {
        amount: price.toLocaleString(),
      });
    }
    return label('admin.courses.priceDisplay.global');
  };

  const levelOptions = [
    { value: 'all', label: label('admin.courses.allLevels') },
    { value: 'Beginner', label: label('admin.courses.levels.beginner') },
    { value: 'Intermediate', label: label('admin.courses.levels.intermediate') },
    { value: 'Advanced', label: label('admin.courses.levels.advanced') },
  ];

  const hasActiveFilters = Boolean(debouncedSearch) || levelFilter !== 'all';

  return (
    <>
      <SEOHead title={label('admin.courses.pageTitle')} />
      <AdminLayout
        title={label('admin.courses.pageTitle')}
        subtitle={label('admin.courses.pageSubtitle')}
      >
        <AdminToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={label('admin.courses.searchPlaceholder')}
          filters={
            <AdminSelect
              options={levelOptions}
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              aria-label={label('admin.courses.fields.level')}
              className="w-auto min-w-[10rem]"
            />
          }
          actions={
            <AdminButton
              variant="primary"
              onClick={() => router.push('/admin/courses/new')}
            >
              <Plus size={16} aria-hidden="true" />
              {label('admin.courses.newCourseBtn')}
            </AdminButton>
          }
        />

        <AdminRowList
          loading={loading}
          items={courses || []}
          keyOf={(course) => course.id}
          emptyIcon={BookOpen}
          emptyTitle={
            hasActiveFilters
              ? label('admin.courses.empty.noSearchResults')
              : label('admin.courses.empty.noCourses')
          }
          renderItem={(course) => {
            const description = course.description || '';
            const preview =
              description.length > DESCRIPTION_PREVIEW_LENGTH
                ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}…`
                : description || emDash;
            const publishStatus = course.is_published ? 'published' : 'draft';

            return (
              <>
                {/* Identity + meta */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-10 h-10 shrink-0 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <BookOpen size={16} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="text-sm font-bold text-text-main truncate">
                        {course.title || emDash}
                      </span>
                      {course.level && (
                        <AdminBadge tone="neutral">{course.level}</AdminBadge>
                      )}
                      {course.badge && (
                        <AdminBadge tone="warning">{course.badge}</AdminBadge>
                      )}
                      <AdminBadge status={publishStatus}>
                        {label(`admin.courses.fields.${publishStatus}`)}
                      </AdminBadge>
                    </div>
                    <span className="text-xs text-text-muted truncate">{preview}</span>
                    <span className="text-2xs text-text-dim truncate">
                      {course.duration || emDash} · {renderPriceMeta(course)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  <AdminButton
                    variant="secondary"
                    iconOnly
                    onClick={() => router.push(`/admin/courses/${course.id}`)}
                    aria-label={label('admin.courses.actions.viewWeeks')}
                    title={label('admin.courses.actions.viewWeeks')}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </AdminButton>
                  <AdminButton
                    variant="secondary"
                    iconOnly
                    onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                    aria-label={label('admin.courses.actions.edit')}
                    title={label('admin.courses.actions.edit')}
                  >
                    <Edit size={16} aria-hidden="true" />
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    iconOnly
                    loading={busy && deletingId === course.id}
                    onClick={() => handleDelete(course.id)}
                    aria-label={label('admin.courses.actions.delete')}
                    title={label('admin.courses.actions.delete')}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </AdminButton>
                </div>
              </>
            );
          }}
        />
      </AdminLayout>
    </>
  );
};

export default AdminCoursesPage;