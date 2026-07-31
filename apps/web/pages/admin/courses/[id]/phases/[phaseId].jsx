import React from 'react';
import { useRouter } from 'next/router';
import SEOHead from '../../../../../components/shared/SEOHead';

/**
 * Admin Phase Detail Page
 * Placeholder for managing a specific phase within a course
 */
export default function AdminPhaseDetailPage() {
  const router = useRouter();
  const { id, phaseId } = router.query;

  return (
    <>
      <SEOHead title="Phase Details - Admin" />
      <div className="admin-layout">
        <main className="admin-main">
          <header className="admin-header">
            <div>
              <h1 className="admin-header-title">Phase Details</h1>
              <p className="admin-header-subtitle">
                Managing phase {phaseId || 'Loading...'} in course {id || 'Loading...'}
              </p>
            </div>
          </header>
          <div className="admin-content">
            <div className="empty-state">
              <p className="empty-state-desc">Phase detail management is under development.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}