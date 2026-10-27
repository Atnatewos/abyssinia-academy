/**
 * @fileoverview Admin Discount Code Edit Page (Stub)
 *
 * Placeholder for the discount edit form.
 *
 * Path: apps/web/pages/admin/discounts/[id]/edit.jsx
 */
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import AdminComingSoon from '../../../../components/admin/AdminComingSoon';
import { useLanguage } from '../../../../context/LanguageContext';

const AdminDiscountEditPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={t.admin?.comingSoon?.editDiscount || 'Edit Discount Code'} />
      <AdminLayout
        title={t.admin?.comingSoon?.editDiscount || 'Edit Discount Code'}
        subtitle={t.admin?.comingSoon?.subtitle || 'This feature is coming soon'}
      >
        <AdminComingSoon
          titleKey="editDiscount"
          backHref="/admin/discounts"
          backLabel="backToDiscounts"
        />
      </AdminLayout>
    </>
  );
};

export default AdminDiscountEditPage;