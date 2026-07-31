import React from 'react';
import SEOHead from '../../../components/shared/SEOHead';

/**
 * Admin New Course Page
 * Placeholder for course creation functionality
 */
export default function AdminNewCoursePage() {
  return (
    <>
      <SEOHead title="New Course - Admin" />
      <div className="admin-layout">
        <main className="admin-main">
          <header className="admin-header">
            <div>
              <h1 className="admin-header-title">Create New Course</h1>
              <p className="admin-header-subtitle">Add a new course to the academy catalog.</p>
            </div>
          </header>
          <div className="admin-content">
            <div className="empty-state">
              <p className="empty-state-desc">Course creation form is under development.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}