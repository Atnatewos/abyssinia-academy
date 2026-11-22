// /**
//  * @fileoverview Admin Discount Codes Page — Card-Based Management
//  *
//  * Full CRUD in a single page with a slide-over modal. Auto-generates
//  * unambiguous discount codes, provides copy-to-clipboard, shows usage
//  * progress bars and status badges, and renders strict eligibility
//  * labels (Full Course Only, Phase-Specific, or All).
//  *
//  * All destructive actions route through the shared confirmation dialog.
//  *
//  * Path: apps/web/pages/admin/discounts/index.jsx
//  */

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/router';
// import {
//   Tag,
//   Plus,
//   Edit,
//   Trash2,
//   Search,
//   Copy,
//   Check,
//   Users,
//   Calendar,
//   Sparkles,
//   X,
//   Save,
//   RefreshCw,
//   Shield,
//   Layers,
// } from 'lucide-react';
// import SEOHead from '../../../components/shared/SEOHead';
// import AdminLayout from '../../../components/admin/AdminLayout';
// import { useLanguage } from '../../../context/LanguageContext';
// import { useToast } from '../../../context/ToastContext';
// import { useConfirm } from '../../../components/shared/ConfirmProvider';
// import apiClient from '../../../lib/api';
// import { getItem } from '../../../lib/storage';
// import { getPurchasablePhases, getDiscountCodeValidation } from '../../../lib/config';

// /**
//  * Generates a cryptographically random discount code using an
//  * unambiguous character set (no 0/O/1/I/L) so it can be dictated
//  * over the phone without transcription errors.
//  *
//  * @returns {string} A new code in the configured prefix format.
//  */
// const generateCode = () => {
//   const validation = getDiscountCodeValidation();
//   const prefix = validation?.codePrefix || '';
//   const length = Number(validation?.generatedLength) || 6;
//   const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
//   let result = prefix;
//   for (let i = 0; i < length; i += 1) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return result;
// };

// /**
//  * Copies text to the clipboard, falling back to a temporary textarea
//  * when the modern Clipboard API is unavailable.
//  *
//  * @param {string} text
//  * @returns {Promise<boolean>}
//  */
// const copyToClipboard = async (text) => {
//   try {
//     await navigator.clipboard.writeText(text);
//     return true;
//   } catch {
//     const textarea = document.createElement('textarea');
//     textarea.value = text;
//     textarea.style.position = 'fixed';
//     textarea.style.opacity = '0';
//     document.body.appendChild(textarea);
//     textarea.select();
//     document.execCommand('copy');
//     document.body.removeChild(textarea);
//     return true;
//   }
// };

// /**
//  * Builds a human-readable eligibility label with icon + accent color.
//  *
//  * @param {object} discount
//  * @param {object} labels - i18n eligibility copy
//  * @returns {{ text: string, icon: Function, color: string }}
//  */
// const getEligibilityLabel = (discount, labels) => {
//   const hasPhases =
//     Array.isArray(discount.eligible_phases) && discount.eligible_phases.length > 0;
//   const fullCourse = discount.eligible_for_full_course;
//   const phaseList = hasPhases
//     ? discount.eligible_phases.map((p) => p.replace('phase-', '')).join(', ')
//     : '';

//   if (fullCourse && !hasPhases) {
//     return { text: labels.fullCourseOnly, icon: Shield, color: 'var(--color-info)' };
//   }
//   if (!fullCourse && hasPhases) {
//     return {
//       text: (labels.phasesTemplate || '').replace('{list}', phaseList),
//       icon: Layers,
//       color: 'var(--accent-gold)',
//     };
//   }
//   if (fullCourse && hasPhases) {
//     return {
//       text: (labels.fullCourseAndPhasesTemplate || '').replace('{list}', phaseList),
//       icon: Layers,
//       color: 'var(--color-success)',
//     };
//   }
//   return { text: labels.allPurchases, icon: Tag, color: 'var(--text-dim)' };
// };

// const AdminDiscountsPage = () => {
//   const router = useRouter();
//   const { t } = useLanguage();
//   const toast = useToast();
//   const confirm = useConfirm();

//   const [discounts, setDiscounts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [showModal, setShowModal] = useState(false);
//   const [editingCode, setEditingCode] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [copiedCode, setCopiedCode] = useState(null);
//   const [errors, setErrors] = useState({});

//   const copy = t.discounts || {};
//   const adminCopy = t.admin?.discounts || {};
//   const phaseOptions = getPurchasablePhases();

//   const emptyForm = {
//     code: '',
//     type: 'percentage',
//     value: '',
//     maxTotalUses: 100,
//     maxUsesPerUser: 1,
//     minPurchaseAmount: 0,
//     eligibleForFullCourse: true,
//     eligiblePhases: [],
//     firstTimeOnly: false,
//     validFrom: '',
//     validUntil: '',
//     description: '',
//     status: 'active',
//   };

//   const [formData, setFormData] = useState(emptyForm);

//   const fetchDiscounts = useCallback(async () => {
//     const token = getItem('admin_token');
//     if (!token) {
//       router.push('/admin/login');
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await apiClient.get('/admin/discounts');
//       if (response && response.success) {
//         setDiscounts(response.data || []);
//       }
//     } catch (error) {
//       if (error?.response?.status === 401) {
//         router.push('/admin/login');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   useEffect(() => {
//     fetchDiscounts();
//   }, [fetchDiscounts]);

//   const handleCreate = () => {
//     setEditingCode(null);
//     setFormData({ ...emptyForm, code: generateCode() });
//     setErrors({});
//     setShowModal(true);
//   };

//   const handleEdit = (code) => {
//     setEditingCode(code);
//     setFormData({
//       code: code.code || '',
//       type: code.type || 'percentage',
//       value: code.value?.toString() || '',
//       maxTotalUses: code.max_total_uses ?? 100,
//       maxUsesPerUser: code.max_uses_per_user ?? 1,
//       minPurchaseAmount: code.min_purchase_amount ?? 0,
//       eligibleForFullCourse: code.eligible_for_full_course ?? true,
//       eligiblePhases: code.eligible_phases || [],
//       firstTimeOnly: code.first_time_only ?? false,
//       validFrom: code.valid_from ? code.valid_from.split('T')[0] : '',
//       validUntil: code.valid_until ? code.valid_until.split('T')[0] : '',
//       description: code.description || '',
//       status: code.status || 'active',
//     });
//     setErrors({});
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingCode(null);
//   };

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors((prev) => ({ ...prev, [field]: '' }));
//     }
//   };

//   const handleTogglePhase = (phaseId) => {
//     setFormData((prev) => ({
//       ...prev,
//       eligiblePhases: prev.eligiblePhases.includes(phaseId)
//         ? prev.eligiblePhases.filter((p) => p !== phaseId)
//         : [...prev.eligiblePhases, phaseId],
//     }));
//   };

//   const handleRegenerateCode = () =>
//     setFormData((prev) => ({ ...prev, code: generateCode() }));

//   const validateForm = () => {
//     const nextErrors = {};
//     if (!formData.code.trim()) nextErrors.code = copy.codeRequired;
//     if (!formData.value || Number(formData.value) <= 0) {
//       nextErrors.value = copy.valueRequired;
//     }
//     if (formData.type === 'percentage' && Number(formData.value) > 100) {
//       nextErrors.value = (copy.valueTooHigh || '').replace('{max}', '100');
//     }
//     setErrors(nextErrors);
//     return Object.keys(nextErrors).length === 0;
//   };

//   const handleSave = async (event) => {
//     event.preventDefault();
//     if (!validateForm()) return;

//     setSaving(true);
//     try {
//       const payload = {
//         code: formData.code.trim().toUpperCase(),
//         type: formData.type,
//         value: Number(formData.value),
//         maxTotalUses: Number(formData.maxTotalUses),
//         maxUsesPerUser: Number(formData.maxUsesPerUser),
//         minPurchaseAmount: Number(formData.minPurchaseAmount),
//         eligibleForFullCourse: formData.eligibleForFullCourse,
//         eligiblePhases:
//           formData.eligiblePhases.length > 0 ? formData.eligiblePhases : null,
//         firstTimeOnly: formData.firstTimeOnly,
//         validFrom: formData.validFrom || null,
//         validUntil: formData.validUntil || null,
//         description: formData.description.trim() || null,
//         status: formData.status,
//       };

//       const response = editingCode
//         ? await apiClient.put(`/admin/discounts/${editingCode.id}`, payload)
//         : await apiClient.post('/admin/discounts', payload);

//       if (response && response.success) {
//         toast.success(editingCode ? copy.formUpdated : copy.formCreated);
//         fetchDiscounts();
//         handleCloseModal();
//       } else if (!response?.cancelled) {
//         toast.error(response?.message || adminCopy.saveFailed);
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || adminCopy.saveFailed);
//     } finally {
//       setSaving(false);
//     }
//   };

//   /**
//    * Delete a discount code after explicit confirmation through the
//    * shared dialog. The API client's own interceptor is bypassed here
//    * because this handler already owns the confirmation UX.
//    */
//   const handleDelete = async (id) => {
//     const confirmed = await confirm({
//       title: adminCopy.deleteConfirmTitle,
//       message: adminCopy.deleteConfirmMessage,
//       confirmText: copy.adminDelete,
//       variant: 'danger',
//     });
//     if (!confirmed) return;

//     try {
//       const response = await apiClient.delete(`/admin/discounts/${id}`, {
//         _confirm: null,
//       });
//       if (response && response.success) {
//         toast.success(copy.formDeleted);
//         fetchDiscounts();
//       } else if (!response?.cancelled) {
//         toast.error(response?.message || adminCopy.deleteFailed);
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || adminCopy.deleteFailed);
//     }
//   };

//   const handleCopyCode = async (code) => {
//     const success = await copyToClipboard(code);
//     if (success) {
//       setCopiedCode(code);
//       toast.success(copy.codeApplied);
//       setTimeout(() => setCopiedCode(null), 2000);
//     }
//   };

//   const filteredDiscounts = discounts.filter((discount) => {
//     if (statusFilter === 'active' && discount.status !== 'active') return false;
//     if (statusFilter === 'paused' && discount.status !== 'paused') return false;
//     if (statusFilter === 'disabled' && discount.status !== 'disabled') return false;
//     if (
//       statusFilter === 'expired' &&
//       (!discount.valid_until || new Date(discount.valid_until) > new Date())
//     ) {
//       return false;
//     }
//     if (!searchTerm) return true;
//     const term = searchTerm.toLowerCase();
//     return (
//       discount.code?.toLowerCase().includes(term) ||
//       discount.description?.toLowerCase().includes(term)
//     );
//   });

//   const getUsagePercent = (discount) => {
//     if (!discount.max_total_uses || discount.max_total_uses === 0) return 0;
//     return Math.min(
//       100,
//       Math.round((discount.current_total_uses / discount.max_total_uses) * 100)
//     );
//   };

//   const isExpired = (discount) =>
//     Boolean(discount.valid_until) && new Date(discount.valid_until) < new Date();

//   return (
//     <>
//       <SEOHead title={copy.adminTitle} />
//       <AdminLayout title={copy.adminTitle} subtitle={adminCopy.pageSubtitle}>
//         <div className="admin-toolbar">
//           <div className="admin-search">
//             <Search size={16} />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder={adminCopy.searchPlaceholder}
//             />
//           </div>
//           <div className="admin-filter-group">
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="admin-select"
//             >
//               <option value="all">{adminCopy.filterAll}</option>
//               <option value="active">{copy.adminActive}</option>
//               <option value="paused">{copy.adminPaused}</option>
//               <option value="disabled">{copy.adminDisabled}</option>
//               <option value="expired">{adminCopy.filterExpired}</option>
//             </select>
//           </div>
//           <button type="button" className="admin-toolbar-btn" onClick={handleCreate}>
//             <Plus size={16} />
//             <span>{adminCopy.generateBtn}</span>
//           </button>
//         </div>

//         {loading ? (
//           <div className="spinner">
//             <div className="spinner-circle" />
//           </div>
//         ) : filteredDiscounts.length > 0 ? (
//           <div className="admin-table-wrapper">
//             {filteredDiscounts.map((discount) => {
//               const usagePercent = getUsagePercent(discount);
//               const expired = isExpired(discount);
//               const eligibility = getEligibilityLabel(
//                 discount,
//                 adminCopy.eligibility || {}
//               );
//               const EligibilityIcon = eligibility.icon;

//               return (
//                 <div key={discount.id} className="admin-discount-card">
//                   <div className="admin-discount-card-header">
//                     <div className="admin-discount-card-identity">
//                       <button
//                         type="button"
//                         onClick={() => handleCopyCode(discount.code)}
//                         className="admin-discount-code-btn"
//                       >
//                         {discount.code}
//                         {copiedCode === discount.code ? (
//                           <Check size={14} />
//                         ) : (
//                           <Copy size={14} />
//                         )}
//                       </button>
//                       <span className="phase-badge">
//                         {discount.type === 'percentage'
//                           ? `${discount.value}%`
//                           : `${discount.value} ETB`}
//                       </span>
//                       <span
//                         className="role-badge"
//                         style={{ color: eligibility.color }}
//                       >
//                         <EligibilityIcon size={11} />
//                         {eligibility.text}
//                       </span>
//                     </div>
//                     <div className="admin-table-action-btns">
//                       <span
//                         className={`status-badge ${
//                           expired
//                             ? 'rejected'
//                             : discount.status === 'active'
//                             ? 'approved'
//                             : 'pending'
//                         }`}
//                       >
//                         {expired ? adminCopy.filterExpired : discount.status}
//                       </span>
//                       <button
//                         type="button"
//                         className="admin-action-btn view"
//                         title={copy.adminEdit}
//                         onClick={() => handleEdit(discount)}
//                       >
//                         <Edit size={16} />
//                       </button>
//                       <button
//                         type="button"
//                         className="admin-action-btn reject"
//                         title={copy.adminDelete}
//                         onClick={() => handleDelete(discount.id)}
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </div>

//                   {discount.max_total_uses > 0 && (
//                     <div className="admin-discount-usage">
//                       <div className="admin-discount-usage-labels">
//                         <span>
//                           <Users size={11} /> {discount.current_total_uses} /{' '}
//                           {discount.max_total_uses}
//                         </span>
//                         <span>{usagePercent}%</span>
//                       </div>
//                       <div className="admin-discount-usage-track">
//                         <div
//                           className="admin-discount-usage-fill"
//                           style={{ width: `${usagePercent}%` }}
//                         />
//                       </div>
//                     </div>
//                   )}

//                   <div className="admin-table-meta">
//                     {discount.description && <span>{discount.description}</span>}
//                     {discount.valid_until && (
//                       <span>
//                         <Calendar size={11} />{' '}
//                         {new Date(discount.valid_until).toLocaleDateString()}
//                       </span>
//                     )}
//                     {discount.min_purchase_amount > 0 && (
//                       <span>
//                         {adminCopy.minPurchase}:{' '}
//                         {Number(discount.min_purchase_amount).toLocaleString()} ETB
//                       </span>
//                     )}
//                     {discount.first_time_only && (
//                       <span>{copy.formFirstTimeOnly}</span>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="empty-state">
//             <Tag size={48} />
//             <h3 className="empty-state-title">{copy.adminTitle}</h3>
//             <p className="empty-state-desc">
//               {searchTerm || statusFilter !== 'all'
//                 ? adminCopy.emptyFiltered
//                 : adminCopy.emptyAll}
//             </p>
//           </div>
//         )}
//       </AdminLayout>

//       {showModal && (
//         <div className="checkout-modal-overlay" onClick={handleCloseModal}>
//           <div
//             className="checkout-modal-container admin-discount-modal"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               type="button"
//               className="checkout-modal-close"
//               onClick={handleCloseModal}
//               aria-label={copy.close}
//             >
//               <X size={20} />
//             </button>
//             <div className="checkout-modal-header">
//               <h2 className="checkout-modal-title">
//                 <Sparkles size={18} />
//                 {editingCode ? copy.adminEdit : adminCopy.generateBtn}
//               </h2>
//             </div>
//             <div className="checkout-modal-body">
//               <form onSubmit={handleSave} className="admin-discount-form">
//                 <div className="profile-form-field">
//                   <label htmlFor="discount-code">{copy.formCode}</label>
//                   <div className="admin-discount-code-row">
//                     <input
//                       id="discount-code"
//                       type="text"
//                       value={formData.code}
//                       onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
//                       className={`profile-form-input ${errors.code ? 'error' : ''}`}
//                       maxLength={20}
//                     />
//                     {!editingCode && (
//                       <button
//                         type="button"
//                         onClick={handleRegenerateCode}
//                         className="admin-btn secondary"
//                       >
//                         <RefreshCw size={14} />
//                         {adminCopy.regenerate}
//                       </button>
//                     )}
//                   </div>
//                   {errors.code && (
//                     <p className="profile-form-field-error">{errors.code}</p>
//                   )}
//                 </div>

//                 <div className="admin-form-row">
//                   <div className="profile-form-field">
//                     <label htmlFor="discount-type">{copy.formType}</label>
//                     <select
//                       id="discount-type"
//                       value={formData.type}
//                       onChange={(e) => handleChange('type', e.target.value)}
//                       className="admin-select"
//                     >
//                       <option value="percentage">{copy.adminPercentage}</option>
//                       <option value="fixed_amount">{copy.adminFixedAmount}</option>
//                     </select>
//                   </div>
//                   <div className="profile-form-field">
//                     <label htmlFor="discount-value">{copy.formValue}</label>
//                     <input
//                       id="discount-value"
//                       type="number"
//                       value={formData.value}
//                       onChange={(e) => handleChange('value', e.target.value)}
//                       className={`profile-form-input ${errors.value ? 'error' : ''}`}
//                       min="0"
//                       max={formData.type === 'percentage' ? '100' : undefined}
//                     />
//                     {errors.value && (
//                       <p className="profile-form-field-error">{errors.value}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="admin-form-row">
//                   <div className="profile-form-field">
//                     <label htmlFor="discount-max-total">{copy.formMaxUses}</label>
//                     <input
//                       id="discount-max-total"
//                       type="number"
//                       value={formData.maxTotalUses}
//                       onChange={(e) => handleChange('maxTotalUses', e.target.value)}
//                       className="profile-form-input"
//                       min="0"
//                     />
//                   </div>
//                   <div className="profile-form-field">
//                     <label htmlFor="discount-max-user">{copy.formMaxUsesPerUser}</label>
//                     <input
//                       id="discount-max-user"
//                       type="number"
//                       value={formData.maxUsesPerUser}
//                       onChange={(e) => handleChange('maxUsesPerUser', e.target.value)}
//                       className="profile-form-input"
//                       min="0"
//                     />
//                   </div>
//                 </div>

//                 <div className="profile-form-field">
//                   <label htmlFor="discount-min-purchase">{copy.formMinPurchase}</label>
//                   <input
//                     id="discount-min-purchase"
//                     type="number"
//                     value={formData.minPurchaseAmount}
//                     onChange={(e) => handleChange('minPurchaseAmount', e.target.value)}
//                     className="profile-form-input"
//                     min="0"
//                   />
//                 </div>

//                 <div className="profile-form-field">
//                   <label className="admin-checkbox-label">
//                     <input
//                       type="checkbox"
//                       checked={formData.eligibleForFullCourse}
//                       onChange={(e) =>
//                         handleChange('eligibleForFullCourse', e.target.checked)
//                       }
//                       className="admin-checkbox"
//                     />
//                     <span>{copy.formFullCourse}</span>
//                   </label>
//                   <label className="admin-checkbox-label">
//                     <input
//                       type="checkbox"
//                       checked={formData.firstTimeOnly}
//                       onChange={(e) => handleChange('firstTimeOnly', e.target.checked)}
//                       className="admin-checkbox"
//                     />
//                     <span>{copy.formFirstTimeOnly}</span>
//                   </label>
//                 </div>

//                 <div className="profile-form-field">
//                   <label>{copy.formSpecificPhases}</label>
//                   <div className="admin-discount-phase-grid">
//                     {phaseOptions.map((phase) => {
//                       const selected = formData.eligiblePhases.includes(phase.id);
//                       return (
//                         <button
//                           key={phase.id}
//                           type="button"
//                           onClick={() => handleTogglePhase(phase.id)}
//                           className={`admin-discount-phase-chip ${selected ? 'selected' : ''}`}
//                         >
//                           {selected && <Check size={12} />}
//                           {phase.title || phase.id}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div className="admin-form-row">
//                   <div className="profile-form-field">
//                     <label htmlFor="discount-valid-from">{copy.formValidFrom}</label>
//                     <input
//                       id="discount-valid-from"
//                       type="date"
//                       value={formData.validFrom}
//                       onChange={(e) => handleChange('validFrom', e.target.value)}
//                       className="profile-form-input"
//                     />
//                   </div>
//                   <div className="profile-form-field">
//                     <label htmlFor="discount-valid-until">{copy.formValidUntil}</label>
//                     <input
//                       id="discount-valid-until"
//                       type="date"
//                       value={formData.validUntil}
//                       onChange={(e) => handleChange('validUntil', e.target.value)}
//                       className="profile-form-input"
//                     />
//                   </div>
//                 </div>

//                 <div className="profile-form-field">
//                   <label htmlFor="discount-status">{copy.formStatus}</label>
//                   <select
//                     id="discount-status"
//                     value={formData.status}
//                     onChange={(e) => handleChange('status', e.target.value)}
//                     className="admin-select"
//                   >
//                     <option value="active">{copy.adminActive}</option>
//                     <option value="paused">{copy.adminPaused}</option>
//                     <option value="disabled">{copy.adminDisabled}</option>
//                   </select>
//                 </div>

//                 <div className="profile-form-field">
//                   <label htmlFor="discount-description">{copy.formDescription}</label>
//                   <textarea
//                     id="discount-description"
//                     value={formData.description}
//                     onChange={(e) => handleChange('description', e.target.value)}
//                     className="profile-form-input"
//                     rows={2}
//                   />
//                 </div>

//                 <button type="submit" disabled={saving} className="profile-form-submit">
//                   <Save size={16} />
//                   <span>{saving ? copy.formSaving : copy.formSave}</span>
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AdminDiscountsPage;
















/**
 * @fileoverview Admin Discount Codes
 *
 * Full CRUD on the shared admin primitives. Codes are generated from an
 * unambiguous alphabet (no 0/O/1/I/L) so they can be dictated over the
 * phone without transcription errors; prefix and length resolve from
 * the shared discount config.
 *
 * Data lifecycle runs through useAdminQuery / useAdminMutation, so auth
 * gating, stale-response guards, styled confirmations, and toast
 * feedback are centralized — this page holds no fetch boilerplate.
 *
 * All copy resolves from admin.discounts.* / discounts.* / admin.common.*;
 * every visual value flows through the Tailwind token bridge.
 *
 * Path: apps/web/pages/admin/discounts/index.jsx
 */

import { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Users,
  Calendar,
  RefreshCw,
  Shield,
  Layers,
  Save,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminToolbar from '../../../components/admin/ui/AdminToolbar';
import AdminBadge from '../../../components/admin/ui/AdminBadge';
import AdminButton from '../../../components/admin/ui/AdminButton';
import AdminCard from '../../../components/admin/ui/AdminCard';
import AdminModal from '../../../components/admin/ui/AdminModal';
import AdminEmptyState from '../../../components/admin/ui/AdminEmptyState';
import { AdminRowSkeleton } from '../../../components/admin/ui/AdminSkeleton';
import {
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminCheckbox,
} from '../../../components/admin/ui/AdminInput';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import useAdminQuery, {
  useDebouncedValue,
} from '../../../lib/admin/useAdminQuery';
import useAdminMutation from '../../../lib/admin/useAdminMutation';
import { resolveLabel, interpolate } from '../../../lib/admin/labels';
import {
  getPurchasablePhases,
  getDiscountCodeValidation,
} from '../../../lib/config';

/** Unambiguous alphabet for human-dictated codes. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Maximum characters accepted in a manually entered code. */
const CODE_MAX_LENGTH = 20;

/** Usage percentage above which the progress bar shifts to warning. */
const USAGE_WARNING_THRESHOLD = 80;

/**
 * Generate a random discount code using the configured prefix/length.
 * @returns {string}
 */
const generateCode = () => {
  const validation = getDiscountCodeValidation();
  const prefix = validation?.codePrefix || '';
  const length = Number(validation?.generatedLength) || 6;
  let result = prefix;
  for (let i = 0; i < length; i += 1) {
    result += CODE_ALPHABET.charAt(Math.floor(Math.random() * CODE_ALPHABET.length));
  }
  return result;
};

/**
 * Copy text to the clipboard with a legacy fallback for non-secure contexts.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.className = 'fixed opacity-0 pointer-events-none';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
};

/** Blank form state shared by create and reset-after-save flows. */
const EMPTY_FORM = Object.freeze({
  code: '',
  type: 'percentage',
  value: '',
  maxTotalUses: 100,
  maxUsesPerUser: 1,
  minPurchaseAmount: 0,
  eligibleForFullCourse: true,
  eligiblePhases: [],
  firstTimeOnly: false,
  validFrom: '',
  validUntil: '',
  description: '',
  status: 'active',
});

/**
 * Map a discount row to form state for editing.
 * @param {object} code
 * @returns {object}
 */
const toFormState = (code) => ({
  code: code.code || '',
  type: code.type || 'percentage',
  value: code.value?.toString() || '',
  maxTotalUses: code.max_total_uses ?? EMPTY_FORM.maxTotalUses,
  maxUsesPerUser: code.max_uses_per_user ?? EMPTY_FORM.maxUsesPerUser,
  minPurchaseAmount: code.min_purchase_amount ?? 0,
  eligibleForFullCourse: code.eligible_for_full_course ?? true,
  eligiblePhases: Array.isArray(code.eligible_phases) ? code.eligible_phases : [],
  firstTimeOnly: code.first_time_only ?? false,
  validFrom: code.valid_from ? String(code.valid_from).split('T')[0] : '',
  validUntil: code.valid_until ? String(code.valid_until).split('T')[0] : '',
  description: code.description || '',
  status: code.status || 'active',
});

const AdminDiscountsPage = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const { mutate, busy } = useAdminMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [copiedCode, setCopiedCode] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const debouncedSearch = useDebouncedValue(searchTerm);
  const label = (key) => resolveLabel(t, key);
  const withValues = (key, values) => interpolate(label(key), values);

  const phaseOptions = getPurchasablePhases();
  const currency = label('admin.common.labels.currency');

  const { data: discounts, loading, refetch } = useAdminQuery({
    url: '/admin/discounts',
    initialData: [],
    errorKey: 'admin.common.toasts.loadFailed',
  });

  /**
   * Eligibility descriptor: icon + semantic tone + resolved label.
   * @param {object} discount
   */
  const eligibilityOf = (discount) => {
    const phases = Array.isArray(discount.eligible_phases)
      ? discount.eligible_phases
      : [];
    const hasPhases = phases.length > 0;
    const fullCourse = Boolean(discount.eligible_for_full_course);
    const list = phases.map((p) => String(p).replace('phase-', '')).join(', ');

    if (fullCourse && !hasPhases) {
      return {
        text: label('admin.discounts.eligibility.fullCourseOnly'),
        icon: Shield,
        tone: 'info',
      };
    }
    if (!fullCourse && hasPhases) {
      return {
        text: withValues('admin.discounts.eligibility.phasesTemplate', { list }),
        icon: Layers,
        tone: 'warning',
      };
    }
    if (fullCourse && hasPhases) {
      return {
        text: withValues('admin.discounts.eligibility.fullCourseAndPhasesTemplate', { list }),
        icon: Layers,
        tone: 'success',
      };
    }
    return {
      text: label('admin.discounts.eligibility.allPurchases'),
      icon: Tag,
      tone: 'neutral',
    };
  };

  const isExpired = (discount) =>
    Boolean(discount.valid_until) && new Date(discount.valid_until) < new Date();

  const usagePercent = (discount) => {
    const max = Number(discount.max_total_uses) || 0;
    if (max <= 0) return 0;
    return Math.min(
      100,
      Math.round(((Number(discount.current_total_uses) || 0) / max) * 100)
    );
  };

  const filteredDiscounts = useMemo(() => {
    const rows = discounts || [];
    const term = debouncedSearch.toLowerCase();

    return rows.filter((discount) => {
      if (statusFilter === 'expired') {
        if (!isExpired(discount)) return false;
      } else if (statusFilter !== 'all' && discount.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      return (
        discount.code?.toLowerCase().includes(term) ||
        discount.description?.toLowerCase().includes(term)
      );
    });
  }, [discounts, statusFilter, debouncedSearch]);

  /* ── Form lifecycle ── */

  const openCreate = () => {
    setEditingCode(null);
    setFormData({ ...EMPTY_FORM, code: generateCode() });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (code) => {
    setEditingCode(code);
    setFormData(toFormState(code));
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCode(null);
  };

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const togglePhase = (phaseId) => {
    setFormData((prev) => ({
      ...prev,
      eligiblePhases: prev.eligiblePhases.includes(phaseId)
        ? prev.eligiblePhases.filter((p) => p !== phaseId)
        : [...prev.eligiblePhases, phaseId],
    }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.code.trim()) {
      nextErrors.code = label('admin.discounts.validation.codeRequired');
    }
    const numericValue = Number(formData.value);
    if (!formData.value || !Number.isFinite(numericValue) || numericValue <= 0) {
      nextErrors.value = label('admin.discounts.validation.valueRequired');
    } else if (formData.type === 'percentage' && numericValue > 100) {
      nextErrors.value = label('admin.discounts.validation.valueTooHigh');
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      code: formData.code.trim().toUpperCase(),
      type: formData.type,
      value: Number(formData.value),
      maxTotalUses: Number(formData.maxTotalUses),
      maxUsesPerUser: Number(formData.maxUsesPerUser),
      minPurchaseAmount: Number(formData.minPurchaseAmount),
      eligibleForFullCourse: formData.eligibleForFullCourse,
      eligiblePhases:
        formData.eligiblePhases.length > 0 ? formData.eligiblePhases : null,
      firstTimeOnly: formData.firstTimeOnly,
      validFrom: formData.validFrom || null,
      validUntil: formData.validUntil || null,
      description: formData.description.trim() || null,
      status: formData.status,
    };

    const response = await mutate({
      method: editingCode ? 'put' : 'post',
      url: editingCode
        ? `/admin/discounts/${editingCode.id}`
        : '/admin/discounts',
      payload,
      successKey: editingCode
        ? 'admin.discounts.updated'
        : 'admin.discounts.created',
      errorKey: 'admin.discounts.saveFailed',
      onSuccess: () => {
        refetch();
        closeModal();
      },
    });

    if (!response) return;
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await mutate({
      method: 'delete',
      url: `/admin/discounts/${id}`,
      confirm: {
        title: label('admin.discounts.deleteConfirmTitle'),
        message: label('admin.discounts.deleteConfirmMessage'),
        confirmText: label('admin.common.actions.delete'),
        variant: 'danger',
      },
      successKey: 'admin.discounts.deleted',
      errorKey: 'admin.discounts.deleteFailed',
      onSuccess: refetch,
    });
    setDeletingId(null);
  };

  const handleCopy = async (code) => {
    const ok = await copyToClipboard(code);
    if (!ok) return;
    setCopiedCode(code);
    toast.success(label('admin.discounts.copied'));
    setTimeout(() => setCopiedCode(null), 2000);
  };

  /* ── Filter options ── */

  const statusOptions = [
    { value: 'all', label: label('admin.discounts.filterAll') },
    { value: 'active', label: label('admin.common.statuses.active') },
    { value: 'paused', label: label('admin.common.statuses.paused') },
    { value: 'disabled', label: label('admin.common.statuses.disabled') },
    { value: 'expired', label: label('admin.discounts.filterExpired') },
  ];

  const formStatusOptions = statusOptions.filter((opt) => opt.value !== 'all' && opt.value !== 'expired');

  const typeOptions = [
    { value: 'percentage', label: label('discounts.adminPercentage') },
    { value: 'fixed_amount', label: label('discounts.adminFixedAmount') },
  ];

  const hasActiveFilters = Boolean(debouncedSearch) || statusFilter !== 'all';

  return (
    <>
      <SEOHead title={label('discounts.adminTitle')} />
      <AdminLayout
        title={label('discounts.adminTitle')}
        subtitle={label('admin.discounts.pageSubtitle')}
      >
        <AdminToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={label('admin.discounts.searchPlaceholder')}
          filters={
            <AdminSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={label('admin.common.filters.status')}
              className="w-auto min-w-[9rem]"
            />
          }
          actions={
            <AdminButton variant="primary" onClick={openCreate}>
              <Plus size={16} aria-hidden="true" />
              {label('admin.discounts.generateBtn')}
            </AdminButton>
          }
        />

        {loading ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <AdminRowSkeleton key={`discount-skeleton-${i}`} />
            ))}
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <AdminEmptyState
            icon={Tag}
            title={label('discounts.adminTitle')}
            description={
              hasActiveFilters
                ? label('admin.discounts.emptyFiltered')
                : label('admin.discounts.emptyAll')
            }
            action={
              !hasActiveFilters ? (
                <AdminButton variant="primary" onClick={openCreate}>
                  <Plus size={16} aria-hidden="true" />
                  {label('admin.discounts.generateBtn')}
                </AdminButton>
              ) : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredDiscounts.map((discount) => {
              const expired = isExpired(discount);
              const percent = usagePercent(discount);
              const eligibility = eligibilityOf(discount);
              const EligibilityIcon = eligibility.icon;
              const maxUses = Number(discount.max_total_uses) || 0;
              const usedCount = Number(discount.current_total_uses) || 0;
              const displayStatus = expired ? 'expired' : discount.status;

              const valueLabel =
                discount.type === 'percentage'
                  ? withValues('admin.discounts.valuePercent', { value: discount.value })
                  : withValues('admin.discounts.valueFixed', { value: discount.value });

              return (
                <AdminCard key={discount.id} hover className="flex flex-col gap-3 p-5">
                  {/* Identity row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(discount.code)}
                        title={label('admin.common.actions.copy')}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-solid border-accent/25 text-accent font-mono text-base font-bold tracking-wide cursor-pointer transition-colors duration-fast hover:bg-accent/20"
                      >
                        {discount.code}
                        {copiedCode === discount.code ? (
                          <Check size={14} className="text-success" aria-hidden="true" />
                        ) : (
                          <Copy size={14} aria-hidden="true" />
                        )}
                      </button>

                      <AdminBadge tone={discount.type === 'percentage' ? 'info' : 'warning'}>
                        {valueLabel}
                      </AdminBadge>

                      <AdminBadge tone={eligibility.tone}>
                        <EligibilityIcon size={11} aria-hidden="true" />
                        {eligibility.text}
                      </AdminBadge>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <AdminBadge status={displayStatus}>
                        {label(`admin.common.statuses.${displayStatus}`) || displayStatus}
                      </AdminBadge>
                      <AdminButton
                        variant="secondary"
                        iconOnly
                        onClick={() => openEdit(discount)}
                        aria-label={label('admin.common.actions.edit')}
                        title={label('admin.common.actions.edit')}
                      >
                        <Edit size={16} aria-hidden="true" />
                      </AdminButton>
                      <AdminButton
                        variant="danger"
                        iconOnly
                        loading={busy && deletingId === discount.id}
                        onClick={() => handleDelete(discount.id)}
                        aria-label={label('admin.common.actions.delete')}
                        title={label('admin.common.actions.delete')}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </AdminButton>
                    </div>
                  </div>

                  {/* Usage progress */}
                  {maxUses > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-2xs text-text-dim">
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={11} aria-hidden="true" />
                          {withValues('admin.discounts.usesLabel', {
                            used: usedCount,
                            max: maxUses,
                          })}
                        </span>
                        <span
                          className={
                            percent > USAGE_WARNING_THRESHOLD
                              ? 'font-bold text-error'
                              : 'font-semibold'
                          }
                        >
                          {percent}%
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-1.5 rounded-full bg-border-light overflow-hidden"
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-slower motion-reduce:transition-none ${
                            percent > USAGE_WARNING_THRESHOLD
                              ? 'bg-gradient-to-r from-warning to-error'
                              : 'bg-gradient-to-r from-accent to-accent-light'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-2xs text-text-dim">
                    {discount.description && <span>{discount.description}</span>}
                    {discount.valid_until && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={11} aria-hidden="true" />
                        {label('admin.discounts.expires')}{' '}
                        {new Date(discount.valid_until).toLocaleDateString()}
                      </span>
                    )}
                    {Number(discount.min_purchase_amount) > 0 && (
                      <span>
                        {label('admin.discounts.minPurchase')}:{' '}
                        {Number(discount.min_purchase_amount).toLocaleString()} {currency}
                      </span>
                    )}
                    {discount.first_time_only && (
                      <span>{label('admin.discounts.firstTimeOnly')}</span>
                    )}
                    {maxUses <= 0 && <span>{label('admin.discounts.unlimitedUses')}</span>}
                  </div>
                </AdminCard>
              );
            })}
          </div>
        )}
      </AdminLayout>

      {/* Create / edit modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          editingCode
            ? label('admin.discounts.editTitle')
            : label('admin.discounts.createTitle')
        }
        size="lg"
        closeLabel={label('admin.common.actions.close')}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Code + regenerate */}
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <AdminInput
                label={label('discounts.formCode')}
                value={formData.code}
                onChange={(e) => setField('code', e.target.value.toUpperCase())}
                error={errors.code}
                maxLength={CODE_MAX_LENGTH}
                className="font-mono tracking-wider"
                required
              />
            </div>
            {!editingCode && (
              <AdminButton
                variant="secondary"
                onClick={() => setField('code', generateCode())}
                className="shrink-0"
              >
                <RefreshCw size={14} aria-hidden="true" />
                {label('admin.discounts.regenerate')}
              </AdminButton>
            )}
          </div>

          {/* Type + value */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminSelect
              label={label('discounts.formType')}
              options={typeOptions}
              value={formData.type}
              onChange={(e) => setField('type', e.target.value)}
            />
            <AdminInput
              label={label('discounts.formValue')}
              type="number"
              min="0"
              max={formData.type === 'percentage' ? '100' : undefined}
              value={formData.value}
              onChange={(e) => setField('value', e.target.value)}
              error={errors.value}
              required
            />
          </div>

          {/* Usage limits */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminInput
              label={label('admin.discounts.maxTotalUsesLabel')}
              type="number"
              min="0"
              value={formData.maxTotalUses}
              onChange={(e) => setField('maxTotalUses', e.target.value)}
            />
            <AdminInput
              label={label('admin.discounts.maxPerUserLabel')}
              type="number"
              min="0"
              value={formData.maxUsesPerUser}
              onChange={(e) => setField('maxUsesPerUser', e.target.value)}
            />
          </div>

          <AdminInput
            label={label('admin.discounts.minPurchaseLabel')}
            type="number"
            min="0"
            value={formData.minPurchaseAmount}
            onChange={(e) => setField('minPurchaseAmount', e.target.value)}
          />

          {/* Eligibility toggles */}
          <div className="flex flex-col gap-2.5">
            <AdminCheckbox
              label={label('admin.discounts.eligibleFullCourse')}
              checked={formData.eligibleForFullCourse}
              onChange={(e) => setField('eligibleForFullCourse', e.target.checked)}
            />
            <AdminCheckbox
              label={label('admin.discounts.firstTimeOnly')}
              checked={formData.firstTimeOnly}
              onChange={(e) => setField('firstTimeOnly', e.target.checked)}
            />
          </div>

          {/* Phase chips */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-accent">
              {label('admin.discounts.eligiblePhases')}
            </span>
            <p className="m-0 text-2xs text-text-dim">
              {label('admin.discounts.eligiblePhasesHint')}
            </p>
            <div className="flex flex-wrap gap-2">
              {phaseOptions.map((phase) => {
                const selected = formData.eligiblePhases.includes(phase.id);
                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => togglePhase(phase.id)}
                    aria-pressed={selected}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-solid text-xs font-semibold font-sans cursor-pointer transition-colors duration-fast ${
                      selected
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border-light bg-transparent text-text-dim hover:border-border-hover hover:text-text-main'
                    }`}
                  >
                    {selected && <Check size={12} aria-hidden="true" />}
                    {phase.title || phase.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validity window */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminInput
              label={label('discounts.formValidFrom')}
              type="date"
              value={formData.validFrom}
              onChange={(e) => setField('validFrom', e.target.value)}
            />
            <AdminInput
              label={label('discounts.formValidUntil')}
              type="date"
              value={formData.validUntil}
              onChange={(e) => setField('validUntil', e.target.value)}
            />
          </div>

          <AdminSelect
            label={label('discounts.formStatus')}
            options={formStatusOptions}
            value={formData.status}
            onChange={(e) => setField('status', e.target.value)}
          />

          <AdminTextarea
            label={label('discounts.formDescription')}
            rows={2}
            value={formData.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder={label('admin.discounts.descriptionPlaceholder')}
            maxLength={500}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-solid border-border-light">
            <AdminButton variant="secondary" onClick={closeModal}>
              {label('admin.common.actions.cancel')}
            </AdminButton>
            <AdminButton type="submit" variant="primary" loading={busy}>
              <Save size={16} aria-hidden="true" />
              {editingCode
                ? label('admin.discounts.updateBtn')
                : label('admin.discounts.createBtn')}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </>
  );
};

export default AdminDiscountsPage;