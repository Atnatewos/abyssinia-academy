/**
 * @fileoverview 404 Not Found Page
 * Custom error page for unmatched routes
 * Path: apps/web/pages/404.jsx
 */

import Link from 'next/link';
import PageLayout from '../components/shared/PageLayout';

/**
 * NotFoundPage - Custom 404 page
 */
const NotFoundPage = () => {
  return (
    <PageLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem' }}>
        <div className="empty-state">
          <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>404</h1>
          <h3 className="empty-state-title">Page Not Found</h3>
          <p className="empty-state-desc" style={{ marginBottom: '1.5rem' }}>
            The page you are looking for does not exist or has been moved.
          </p>
          <Link href="/" className="pricing-btn" style={{ display: 'inline-flex' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFoundPage;