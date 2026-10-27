import React from 'react';
import { useRouter } from 'next/router';
import SEOHead from '../../../../components/shared/SEOHead';

/**
 * Admin Course Detail Page
 * Placeholder for managing a specific course
 */
export default function AdminCourseDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <SEOHead title="Course Details - Admin" />
      <div className="admin-layout">
        <main className="admin-main">
          <header className="admin-header">
            <div>
              <h1 className="admin-header-title">Course Details</h1>
              <p className="admin-header-subtitle">Managing course ID: {id || 'Loading...'}</p>
            </div>
          </header>
          <div className="admin-content">
            <div className="empty-state">
              <p className="empty-state-desc">Course detail management is under development.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}