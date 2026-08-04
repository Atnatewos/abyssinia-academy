/**
 * @fileoverview Admin Settings Page
 * Platform configuration interface.
 * Path: apps/web/pages/admin/settings/index.jsx
 */

import { Settings } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';

/**
 * AdminSettingsPage — Platform settings overview.
 */
const AdminSettingsPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title="Settings" />
      <AdminLayout
        title={t.admin?.settings || 'Settings'}
        subtitle="Platform configuration and preferences"
      >
        <div className="admin-settings-grid">
          {/* General Settings Card */}
          <div className="admin-settings-card">
            <Settings size={24} />
            <h3>General Settings</h3>
            <p>Platform name, tagline, contact info, social links</p>
            <span className="admin-settings-status">Coming Soon</span>
          </div>

          {/* Pricing Settings Card */}
          <div className="admin-settings-card">
            <Settings size={24} />
            <h3>Pricing Settings</h3>
            <p>Edit course prices, bulk discounts, and payment options</p>
            <span className="admin-settings-status">Coming Soon</span>
          </div>

          {/* Payment Methods Card */}
          <div className="admin-settings-card">
            <Settings size={24} />
            <h3>Payment Methods</h3>
            <p>Toggle payment methods and edit account details</p>
            <span className="admin-settings-status">Coming Soon</span>
          </div>

          {/* Referral Settings Card */}
          <div className="admin-settings-card">
            <Settings size={24} />
            <h3>Referral Settings</h3>
            <p>Edit tier thresholds, credit percentages, commission rates</p>
            <span className="admin-settings-status">Coming Soon</span>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminSettingsPage;