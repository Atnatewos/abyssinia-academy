import React from 'react';
import { useRouter } from 'next/router';
import SEOHead from '../../../../../components/shared/SEOHead';

/**
 * Admin New Phase Page
 * Placeholder for adding a phase to a specific course
 */
export default function AdminNewPhasePage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <SEOHead title="New Phase - Admin" />
      <div className="admin-layout">
        <main className="admin-main">
          <header className="admin-header">
            <div>
              <h1 className="admin-header-title">Create New Phase</h1>
              <p className="admin-header-subtitle">Adding phase to course ID: {id || 'Loading...'}</p>
            </div>
          </header>
          <div className="admin-content">
            <div className="empty-state">
              <p className="empty-state-desc">Phase creation form is under development.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}