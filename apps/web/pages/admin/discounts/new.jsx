/**
 * @fileoverview Admin Discount Code Create Page (Stub)
 *
 * Placeholder for the discount code creation form.
 *
 * Path: apps/web/pages/admin/discounts/new.jsx
 */
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminComingSoon from '../../../components/admin/AdminComingSoon';
import { useLanguage } from '../../../context/LanguageContext';

const AdminDiscountNewPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={t.admin?.comingSoon?.addDiscount || 'New Discount Code'} />
      <AdminLayout
        title={t.admin?.comingSoon?.addDiscount || 'New Discount Code'}
        subtitle={t.admin?.comingSoon?.subtitle || 'This feature is coming soon'}
      >
        <AdminComingSoon
          titleKey="addDiscount"
          backHref="/admin/discounts"
          backLabel="backToDiscounts"
        />
      </AdminLayout>
    </>
  );
};

export default AdminDiscountNewPage;