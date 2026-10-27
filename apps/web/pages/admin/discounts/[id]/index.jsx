/**
 * @fileoverview Admin Discount Code Detail Page (Stub)
 *
 * Placeholder for the discount detail view (usage stats, redemption log).
 *
 * Path: apps/web/pages/admin/discounts/[id]/index.jsx
 */
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import AdminComingSoon from '../../../../components/admin/AdminComingSoon';
import { useLanguage } from '../../../../context/LanguageContext';

const AdminDiscountDetailPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={t.admin?.comingSoon?.viewDiscount || 'Discount Details'} />
      <AdminLayout
        title={t.admin?.comingSoon?.viewDiscount || 'Discount Details'}
        subtitle={t.admin?.comingSoon?.subtitle || 'This feature is coming soon'}
      >
        <AdminComingSoon
          titleKey="viewDiscount"
          backHref="/admin/discounts"
          backLabel="backToDiscounts"
        />
      </AdminLayout>
    </>
  );
};

export default AdminDiscountDetailPage;