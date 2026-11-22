// /**
//  * @fileoverview Admin Users Page
//  *
//  * User management with debounced search and status/role filters.
//  * Filter values mirror the API contract:
//  *   role:   all | user | referrer
//  *   status: all | enrolled | registered | banned
//  *
//  * Toast and router identities are accessed through refs so context
//  * re-renders never retrigger the fetch effect. A sequence counter
//  * discards stale responses when filters change mid-flight.
//  *
//  * Path: apps/web/pages/admin/users/index.jsx
//  */

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useRouter } from 'next/router';
// import { Search, Eye, Shield, User } from 'lucide-react';
// import SEOHead from '../../../components/shared/SEOHead';
// import AdminLayout from '../../../components/admin/AdminLayout';
// import { useLanguage } from '../../../context/LanguageContext';
// import { useToast } from '../../../context/ToastContext';
// import apiClient from '../../../lib/api';
// import { getItem } from '../../../lib/storage';

// const SEARCH_DEBOUNCE_MS = 300;

// /**
//  * Map a derived user status to its semantic badge class.
//  * @param {string} status
//  * @returns {string}
//  */
// const getStatusClass = (status) => {
//   if (status === 'enrolled' || status === 'active') return 'status-badge approved';
//   if (status === 'registered') return 'status-badge registered';
//   if (status === 'suspended' || status === 'banned') return 'status-badge rejected';
//   return 'status-badge pending';
// };

// const AdminUsersPage = () => {
//   const router = useRouter();
//   const { t } = useLanguage();
//   const toast = useToast();

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearch, setDebouncedSearch] = useState('');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState('all');

//   const toastRef = useRef(toast);
//   toastRef.current = toast;
//   const routerRef = useRef(router);
//   routerRef.current = router;
//   const requestSeqRef = useRef(0);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(searchTerm);
//     }, SEARCH_DEBOUNCE_MS);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const fetchUsers = useCallback(async () => {
//     const token = getItem('admin_token');
//     if (!token) {
//       routerRef.current.push('/admin/login');
//       return;
//     }

//     const seq = ++requestSeqRef.current;
//     setLoading(true);

//     try {
//       const params = new URLSearchParams();
//       if (roleFilter !== 'all') params.append('role', roleFilter);
//       if (statusFilter !== 'all') params.append('status', statusFilter);
//       if (debouncedSearch) params.append('search', debouncedSearch);

//       const response = await apiClient.get(`/admin/users?${params.toString()}`);

//       if (seq !== requestSeqRef.current) return;

//       if (response.success) {
//         setUsers(response.data || []);
//       } else {
//         toastRef.current.error(response.message || 'Failed to load users');
//       }
//     } catch (err) {
//       if (seq !== requestSeqRef.current) return;
//       if (err?.response?.status === 401) {
//         routerRef.current.push('/admin/login');
//       } else {
//         toastRef.current.error('Failed to load users');
//       }
//     } finally {
//       if (seq === requestSeqRef.current) {
//         setLoading(false);
//       }
//     }
//   }, [roleFilter, statusFilter, debouncedSearch]);

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   const getRoleIcon = (role) => {
//     if (role === 'admin') return <Shield size={12} />;
//     return <User size={12} />;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '—';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   /**
//    * Inline shimmer row — reuses the real admin-table classes so loading
//    * rows inherit identical padding, typography, and badge geometry.
//    */
//   const renderShimmerRow = (index) => (
//     <div key={`shimmer-${index}`} className="admin-table-row">
//       <div className="admin-table-info">
//         <div className="admin-table-info-top">
//           <div className="admin-table-avatar shimmer" />
//           <div className="admin-table-name-block">
//             <span className="admin-table-name shimmer" style={{ width: '55%', height: '0.875rem' }} />
//             <span className="admin-table-sub shimmer" style={{ width: '35%', height: '0.75rem' }} />
//           </div>
//           <span className="role-badge shimmer" style={{ width: '3.5rem', height: '1.25rem' }} />
//           <span className="status-badge shimmer" style={{ width: '4rem', height: '1.25rem' }} />
//         </div>
//         <p className="admin-table-meta">
//           <span className="shimmer" style={{ display: 'inline-block', width: '12rem', height: '0.75rem' }} />
//         </p>
//       </div>
//       <div className="admin-table-actions-wrapper">
//         <div className="admin-table-meta-col">
//           <span className="shimmer" style={{ width: '5rem', height: '0.75rem' }} />
//           <span className="shimmer" style={{ width: '5rem', height: '0.75rem' }} />
//         </div>
//         <div className="admin-table-action-btns">
//           <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       <SEOHead title="Users Management" />
//       <AdminLayout
//         title={t.admin?.users?.title || 'Users Management'}
//         subtitle="View and manage all platform users"
//       >
//         <div className="admin-toolbar">
//           <div className="admin-search">
//             <Search size={16} />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search by name, email, or phone..."
//             />
//           </div>
//           <select
//             className="admin-filter-select"
//             value={roleFilter}
//             onChange={(e) => setRoleFilter(e.target.value)}
//           >
//             <option value="all">All Roles</option>
//             <option value="user">Students</option>
//             <option value="referrer">Referrers</option>
//           </select>
//           <select
//             className="admin-filter-select"
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             <option value="all">All Statuses</option>
//             <option value="enrolled">Enrolled</option>
//             <option value="registered">Registered</option>
//             <option value="banned">Banned</option>
//           </select>
//         </div>

//         {loading ? (
//           <div className="admin-table-wrapper">
//             {Array.from({ length: 6 }).map((_, i) => renderShimmerRow(i))}
//           </div>
//         ) : users.length === 0 ? (
//           <div className="empty-state">
//             <p className="empty-state-desc">
//               {debouncedSearch || roleFilter !== 'all' || statusFilter !== 'all'
//                 ? 'No users match your filters.'
//                 : 'No users found.'}
//             </p>
//           </div>
//         ) : (
//           <div className="admin-table-wrapper">
//             {users.map((user) => (
//               <div key={user.id} className="admin-table-row">
//                 <div className="admin-table-info">
//                   <div className="admin-table-info-top">
//                     <div className="admin-table-avatar">
//                       {(user.name || user.full_name || '?').charAt(0).toUpperCase()}
//                     </div>
//                     <div className="admin-table-name-block">
//                       <span className="admin-table-name">
//                         {user.name || user.full_name || 'Unknown'} {getRoleIcon(user.role)}
//                       </span>
//                       <span className="admin-table-sub">{user.email || '—'}</span>
//                     </div>
//                     <span className={`role-badge role-${user.role || 'user'}`}>
//                       {user.role || 'user'}
//                     </span>
//                     <span className={getStatusClass(user.status)}>
//                       {user.status || 'registered'}
//                     </span>
//                   </div>
//                   <p className="admin-table-meta">
//                     Phone: {user.phone || 'N/A'} · Joined: {formatDate(user.created_at)}
//                   </p>
//                 </div>
//                 <div className="admin-table-actions-wrapper">
//                   <div className="admin-table-meta-col">
//                     <span>Referrals: {user.referral_count || 0}</span>
//                     <span>Last active: {formatDate(user.last_active_at)}</span>
//                   </div>
//                   <div className="admin-table-action-btns">
//                     <button
//                       onClick={() => router.push(`/admin/users/${user.id}`)}
//                       className="admin-action-btn view"
//                       title="View details"
//                     >
//                       <Eye size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </AdminLayout>
//     </>
//   );
// };

// export default AdminUsersPage;


















/**
 * @fileoverview Admin Users List
 *
 * User management on the shared admin primitives. Search is debounced
 * through useDebouncedValue; filtering and fetching run through
 * useAdminQuery, which owns auth gating, stale-response guards, and
 * 401 redirects — the page itself holds no fetch lifecycle code.
 *
 * Filter values mirror the API contract:
 *   role:   all | user | referrer
 *   status: all | enrolled | registered | banned
 *
 * Path: apps/web/pages/admin/users/index.jsx
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Eye, Users as UsersIcon, Shield, User } from 'lucide-react';
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
import { resolveLabel } from '../../../lib/admin/labels';

/**
 * Role icon for the identity line.
 * @param {string} role
 */
const RoleIcon = ({ role }) =>
  role === 'admin' ? (
    <Shield size={12} className="shrink-0 text-accent" aria-hidden="true" />
  ) : (
    <User size={12} className="shrink-0 text-text-dim" aria-hidden="true" />
  );

const AdminUsersPage = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearch = useDebouncedValue(searchTerm);
  const label = (key) => resolveLabel(t, key);
  const emDash = label('admin.common.labels.emDash');

  const { data: users, loading } = useAdminQuery({
    url: () => {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);
      return `/admin/users?${params.toString()}`;
    },
    deps: [roleFilter, statusFilter, debouncedSearch],
    initialData: [],
    errorKey: 'admin.users.loadFailed',
  });

  const formatDate = (value) => {
    if (!value) return emDash;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return emDash;
    return parsed.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) || roleFilter !== 'all' || statusFilter !== 'all';

  const roleOptions = [
    { value: 'all', label: label('admin.users.filters.allRoles') },
    { value: 'user', label: label('admin.users.filters.students') },
    { value: 'referrer', label: label('admin.users.filters.referrers') },
  ];

  const statusOptions = [
    { value: 'all', label: label('admin.common.filters.allStatuses') },
    { value: 'enrolled', label: label('admin.users.filters.enrolled') },
    { value: 'registered', label: label('admin.users.filters.registered') },
    { value: 'banned', label: label('admin.users.filters.banned') },
  ];

  return (
    <>
      <SEOHead title={label('admin.users.title')} />
      <AdminLayout
        title={label('admin.users.title')}
        subtitle={label('admin.users.subtitle')}
      >
        <AdminToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={label('admin.users.searchPlaceholder')}
          filters={
            <>
              <AdminSelect
                options={roleOptions}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label={label('admin.common.filters.role')}
                className="w-auto min-w-[9rem]"
              />
              <AdminSelect
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label={label('admin.common.filters.status')}
                className="w-auto min-w-[9rem]"
              />
            </>
          }
        />

        <AdminRowList
          loading={loading}
          items={users || []}
          keyOf={(user) => user.id}
          emptyIcon={UsersIcon}
          emptyTitle={label('admin.users.emptyTitle')}
          emptyDescription={
            hasActiveFilters ? label('admin.users.emptyFiltered') : undefined
          }
          renderItem={(user) => {
            const displayName = user.name || user.full_name || emDash;
            const status = user.status || 'registered';

            return (
              <>
                {/* Identity + meta */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-10 h-10 shrink-0 rounded-full bg-info/10 text-info flex items-center justify-center text-base font-extrabold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-text-main truncate">
                        {displayName}
                        <RoleIcon role={user.role} />
                      </span>
                      <AdminBadge tone="neutral">{user.role || 'user'}</AdminBadge>
                      <AdminBadge status={status}>
                        {label(`admin.common.statuses.${status}`) || status}
                      </AdminBadge>
                    </div>
                    <span className="text-xs text-text-muted truncate">
                      {user.email || emDash}
                    </span>
                    <span className="text-2xs text-text-dim truncate">
                      {label('admin.users.meta.phone')}: {user.phone || emDash} ·{' '}
                      {label('admin.users.meta.joined')}: {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>

                {/* Metrics + action */}
                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <div className="flex flex-col gap-0.5 text-2xs text-text-muted md:text-right">
                    <span>
                      {label('admin.users.meta.referrals')}: {user.referral_count || 0}
                    </span>
                    <span>
                      {label('admin.users.meta.lastActive')}:{' '}
                      {formatDate(user.last_active_at)}
                    </span>
                  </div>
                  <AdminButton
                    variant="secondary"
                    size="md"
                    iconOnly
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    aria-label={label('admin.users.viewDetails')}
                    title={label('admin.users.viewDetails')}
                  >
                    <Eye size={16} aria-hidden="true" />
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

export default AdminUsersPage;