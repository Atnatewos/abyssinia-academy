// /**
//  * @fileoverview Application Detail Modal (Admin)
//  *
//  * Two-column layout. Left column: applicant metadata, motivation,
//  * documents, payment proof. Right column: decision panel.
//  *
//  * Decision panel is state-aware under Model A:
//  *   - `pending` (paid campaign)      → Verify Payment button (primary)
//  *   - `pending` (free campaign)      → Approve / Reject buttons
//  *   - `payment_verified`             → Approve / Reject buttons
//  *   - `approved`                     → Revoke button
//  *   - `rejected` with refund pending → "Mark Refunded" is available only
//  *                                      from the dedicated refund queue,
//  *                                      not from this modal
//  *
//  * Path: apps/web/components/admin/scholarships/ApplicationDetailModal.jsx
//  */

// import { useCallback, useEffect, useState } from 'react';
// import {
//   CheckCircle2, XCircle, Ban, Loader2, ExternalLink, FileText,
//   Phone, Mail, Calendar, MessageSquare, Clock, Image as ImageIcon,
//   AlertCircle, ShieldCheck, RotateCcw, CreditCard, Wallet,
// } from 'lucide-react';
// import Modal from '../../shared/Modal';
// import { useLanguage } from '../../../context/LanguageContext';
// import { useToast } from '../../../context/ToastContext';
// import { useConfirm } from '../../shared/ConfirmProvider';
// import apiClient from '../../../lib/api';
// import { getScholarshipAdminConfig } from '../../../lib/config';

// const formatDateTime = (value) => {
//   if (!value) return '—';
//   try {
//     return new Date(value).toLocaleString(undefined, {
//       month: 'short', day: 'numeric', year: 'numeric',
//       hour: '2-digit', minute: '2-digit',
//     });
//   } catch {
//     return '—';
//   }
// };

// const formatDate = (value) => {
//   if (!value) return '—';
//   try {
//     return new Date(value).toLocaleDateString(undefined, {
//       month: 'short', day: 'numeric', year: 'numeric',
//     });
//   } catch {
//     return '—';
//   }
// };

// const STATUS_CONFIG = {
//   pending: {
//     label: 'Payment Under Review',
//     tone: { bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b', border: 'rgba(245,158,11,0.35)' },
//     Icon: Clock,
//     summary: 'Verify the payment to move to decision.',
//   },
//   payment_verified: {
//     label: 'Awaiting Decision',
//     tone: { bg: 'rgba(59,130,246,0.12)', fg: '#3b82f6', border: 'rgba(59,130,246,0.35)' },
//     Icon: ShieldCheck,
//     summary: 'Payment verified. Ready for a decision.',
//   },
//   approved: {
//     label: 'Approved',
//     tone: { bg: 'rgba(16,185,129,0.12)', fg: '#10b981', border: 'rgba(16,185,129,0.35)' },
//     Icon: CheckCircle2,
//     summary: 'Enrollment granted.',
//   },
//   rejected: {
//     label: 'Rejected',
//     tone: { bg: 'rgba(239,68,68,0.12)', fg: '#ef4444', border: 'rgba(239,68,68,0.35)' },
//     Icon: XCircle,
//     summary: 'Application declined. Refund queued if applicable.',
//   },
//   withdrawn: {
//     label: 'Withdrawn',
//     tone: { bg: 'var(--surface-secondary)', fg: 'var(--text-dim)', border: 'var(--border-light)' },
//     Icon: RotateCcw,
//     summary: 'Applicant withdrew. Refund queued if applicable.',
//   },
//   revoked: {
//     label: 'Revoked',
//     tone: { bg: 'rgba(239,68,68,0.12)', fg: '#ef4444', border: 'rgba(239,68,68,0.35)' },
//     Icon: Ban,
//     summary: 'Scholarship removed.',
//   },
// };

// const MetaCell = ({ icon, label, value, mono = false }) => (
//   <div className="flex items-start gap-2 min-w-0">
//     <span className="text-text-dim mt-0.5 shrink-0">{icon}</span>
//     <div className="min-w-0">
//       <p className="text-[10px] uppercase tracking-wider text-text-dim font-semibold">
//         {label}
//       </p>
//       <p className={`text-xs text-text-main break-words ${mono ? 'font-mono' : 'font-medium'}`}>
//         {value}
//       </p>
//     </div>
//   </div>
// );

// const SectionLabel = ({ children, className = '' }) => (
//   <p className={`text-[10px] font-extrabold uppercase tracking-widest text-text-dim mb-2 ${className}`}>
//     {children}
//   </p>
// );

// const ApplicationDetailModal = ({ isOpen, applicationId, onClose, onUpdated }) => {
//   const { t } = useLanguage();
//   const toast = useToast();
//   const confirm = useConfirm();
//   const adminConfig = getScholarshipAdminConfig();

//   const [application, setApplication] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [payment, setPayment] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [busy, setBusy] = useState(false);
//   const [adminNote, setAdminNote] = useState('');
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [revocationReason, setRevocationReason] = useState('');

//   useEffect(() => {
//     if (!isOpen || !applicationId) return;
//     let cancelled = false;
//     setLoading(true);
//     setAdminNote('');
//     setRejectionReason('');
//     setRevocationReason('');

//     apiClient
//       .get(`/admin/scholarships/applications/${applicationId}`)
//       .then((response) => {
//         if (cancelled) return;
//         if (response?.success) {
//           setApplication(response.data?.application || null);
//           setEvents(response.data?.events || []);
//           setPayment(response.data?.payment || null);
//         }
//       })
//       .catch((error) => {
//         if (cancelled) return;
//         toast.error(error?.response?.data?.message || 'Failed to load.');
//         onClose();
//       })
//       .finally(() => {
//         if (!cancelled) setLoading(false);
//       });

//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen, applicationId, onClose, toast]);

//   const handleVerifyPayment = useCallback(async () => {
//     if (!application) return;
//     const fee = Number(application.registration_fee_etb) || 0;
//     const method = payment?.method || 'payment';
//     const reference = payment?.reference || '—';

//     const ok = await confirm({
//       title:
//         t.scholarships?.admin?.verifyPaymentConfirmTitle ||
//         'Verify Payment Received?',
//       message: (
//         t.scholarships?.admin?.verifyPaymentConfirmBody ||
//         'Confirm that the {amount} ETB {method} payment (ref: {reference}) for this application has been received.'
//       )
//         .replace('{amount}', fee.toLocaleString())
//         .replace('{method}', method)
//         .replace('{reference}', reference),
//       confirmText:
//         t.scholarships?.admin?.verifyPaymentButton || 'Verify Payment',
//       variant: 'default',
//     });
//     if (!ok) return;

//     setBusy(true);
//     try {
//       const response = await apiClient.post(
//         `/admin/scholarships/applications/${application.id}/verify-payment`,
//         { note: adminNote || null },
//         { _confirm: null }
//       );
//       if (response?.success) {
//         toast.success(
//           t.scholarships?.admin?.paymentVerifiedSuccess ||
//             'Payment verified. Application is now awaiting a decision.'
//         );
//         if (typeof onUpdated === 'function') onUpdated();
//         onClose();
//       } else {
//         toast.error(response?.message || 'Verify failed.');
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || 'Verify failed.');
//     } finally {
//       setBusy(false);
//     }
//   }, [application, payment, adminNote, confirm, onClose, onUpdated, t, toast]);

//   const handleApprove = useCallback(async () => {
//     if (!application) return;
//     const fee = Number(application.registration_fee_etb) || 0;
//     const feeNote =
//       fee > 0
//         ? (
//             t.scholarships?.admin?.detailConfirmApproveFeeNote ||
//             'The {amount} ETB registration fee has been verified.'
//           ).replace('{amount}', fee.toLocaleString())
//         : t.scholarships?.admin?.detailConfirmApproveFreeNote ||
//           'They will receive immediate access.';

//     const ok = await confirm({
//       title:
//         t.scholarships?.admin?.detailConfirmApproveTitle ||
//         'Approve Application?',
//       message: feeNote,
//       confirmText: t.scholarships?.admin?.detailReviewButton || 'Approve',
//       variant: 'success',
//     });
//     if (!ok) return;

//     setBusy(true);
//     try {
//       const response = await apiClient.post(
//         `/admin/scholarships/applications/${application.id}/approve`,
//         { note: adminNote || null },
//         { _confirm: null }
//       );
//       if (response?.success) {
//         toast.success(
//           t.scholarships?.admin?.approveSuccess || 'Application approved.'
//         );
//         if (typeof onUpdated === 'function') onUpdated();
//         onClose();
//       } else {
//         toast.error(response?.message || 'Approve failed.');
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || 'Approve failed.');
//     } finally {
//       setBusy(false);
//     }
//   }, [application, adminNote, confirm, onClose, onUpdated, t, toast]);

//   const handleReject = useCallback(async () => {
//     if (!application) return;
//     const reason = rejectionReason.trim();
//     if (!reason) {
//       toast.error(
//         t.scholarships?.admin?.reasonRequired || 'A reason is required.'
//       );
//       return;
//     }
//     const fee = Number(application.registration_fee_etb) || 0;
//     const ok = await confirm({
//       title:
//         t.scholarships?.admin?.detailConfirmRejectTitle ||
//         'Reject Application?',
//       message: (
//         t.scholarships?.admin?.detailConfirmRejectBody ||
//         'A reason is required. The applicant will be notified and their {amount} ETB fee will be queued for refund.'
//       ).replace('{amount}', fee.toLocaleString()),
//       confirmText: t.scholarships?.admin?.detailRejectButton || 'Reject',
//       variant: 'danger',
//     });
//     if (!ok) return;

//     setBusy(true);
//     try {
//       const response = await apiClient.post(
//         `/admin/scholarships/applications/${application.id}/reject`,
//         { reason, note: adminNote || null },
//         { _confirm: null }
//       );
//       if (response?.success) {
//         toast.success(
//           t.scholarships?.admin?.rejectSuccess ||
//             'Application rejected. Refund queued.'
//         );
//         if (typeof onUpdated === 'function') onUpdated();
//         onClose();
//       } else {
//         toast.error(response?.message || 'Reject failed.');
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || 'Reject failed.');
//     } finally {
//       setBusy(false);
//     }
//   }, [application, rejectionReason, adminNote, confirm, onClose, onUpdated, t, toast]);

//   const handleRevoke = useCallback(async () => {
//     if (!application) return;
//     const reason = revocationReason.trim();
//     if (!reason) {
//       toast.error(
//         t.scholarships?.admin?.reasonRequired || 'A reason is required.'
//       );
//       return;
//     }
//     const ok = await confirm({
//       title:
//         t.scholarships?.admin?.detailConfirmRevokeTitle ||
//         'Revoke Scholarship?',
//       message:
//         t.scholarships?.admin?.detailConfirmRevokeBody ||
//         'Access will be removed. Progress is preserved for audit.',
//       confirmText: t.scholarships?.admin?.detailRevokeButton || 'Revoke',
//       variant: 'danger',
//     });
//     if (!ok) return;

//     setBusy(true);
//     try {
//       const response = await apiClient.post(
//         `/admin/scholarships/applications/${application.id}/revoke`,
//         { reason },
//         { _confirm: null }
//       );
//       if (response?.success) {
//         toast.success(
//           t.scholarships?.admin?.revokeSuccess || 'Scholarship revoked.'
//         );
//         if (typeof onUpdated === 'function') onUpdated();
//         onClose();
//       } else {
//         toast.error(response?.message || 'Revoke failed.');
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || 'Revoke failed.');
//     } finally {
//       setBusy(false);
//     }
//   }, [application, revocationReason, confirm, onClose, onUpdated, t, toast]);

//   const status = application?.status || 'pending';
//   const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
//   const StatusIcon = statusCfg.Icon;
//   const fee = Number(application?.registration_fee_etb) || 0;
//   const isPaid = fee > 0;
//   const hasVerifiedPayment = payment && payment.status === 'approved';

//   const canVerifyPayment = isPaid && status === 'pending' && payment;
//   const canApprove =
//     (isPaid && status === 'payment_verified') || (!isPaid && status === 'pending');
//   const canReject = status === 'pending' || status === 'payment_verified';
//   const canRevoke = status === 'approved' && adminConfig.allowRevocation !== false;
//   const documents = Array.isArray(application?.documents) ? application.documents : [];

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} size="xl" showClose={false}>
//       {loading ? (
//         <div className="flex justify-center items-center py-16">
//           <Loader2 size={24} className="text-accent animate-spin" />
//         </div>
//       ) : !application ? (
//         <p className="text-text-muted text-sm py-8 text-center">
//           Application not found.
//         </p>
//       ) : (
//         <div className="flex flex-col max-h-[82vh]">
//           {/* HEADER */}
//           <div className="flex items-start justify-between gap-4 p-5 border-b border-border-light shrink-0">
//             <div className="flex items-center gap-3 min-w-0">
//               <div className="w-12 h-12 rounded-full bg-accent/15 text-accent flex items-center justify-center font-extrabold text-lg shrink-0">
//                 {(application.applicant_name || 'A').charAt(0).toUpperCase()}
//               </div>
//               <div className="min-w-0">
//                 <h2 className="text-base font-extrabold text-text-main leading-tight break-words">
//                   {application.applicant_name || 'Unknown'}
//                 </h2>
//                 <p className="text-2xs text-text-muted mt-0.5 truncate">
//                   {application.campaign_name}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 shrink-0">
//               <span
//                 className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wider border"
//                 style={{
//                   background: statusCfg.tone.bg,
//                   color: statusCfg.tone.fg,
//                   borderColor: statusCfg.tone.border,
//                 }}
//               >
//                 <StatusIcon size={11} />
//                 {statusCfg.label}
//               </span>
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={busy}
//                 className="p-2 rounded-lg text-text-dim hover:text-text-main hover:bg-bg-ghost-hover transition-colors disabled:opacity-50"
//               >
//                 <XCircle size={18} />
//               </button>
//             </div>
//           </div>

//           {/* BODY */}
//           <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-5 gap-5 p-5">
//             {/* LEFT */}
//             <div className="lg:col-span-3 flex flex-col gap-5 min-w-0">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-bg-pill border border-border-light">
//                 <MetaCell icon={<Phone size={12} />} label="Phone" value={application.applicant_phone || '—'} mono />
//                 <MetaCell icon={<Mail size={12} />} label="Email" value={application.applicant_email || '—'} />
//                 <MetaCell icon={<Calendar size={12} />} label="Applied on" value={formatDate(application.created_at)} />
//                 {fee > 0 && (
//                   <MetaCell
//                     icon={<Wallet size={12} />}
//                     label="Application Fee"
//                     value={`${fee.toLocaleString()} ETB`}
//                   />
//                 )}
//               </div>

//               <div>
//                 <SectionLabel>Motivation Statement</SectionLabel>
//                 <div className="p-4 rounded-xl bg-bg-pill border border-border-light text-sm text-text-main whitespace-pre-wrap leading-loose break-words max-h-96 overflow-y-auto">
//                   {application.motivation || '—'}
//                 </div>
//               </div>

//               {documents.length > 0 && (
//                 <div>
//                   <SectionLabel>Supporting Documents · {documents.length}</SectionLabel>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                     {documents.map((doc, idx) => {
//                       const isImage = doc.mimetype?.startsWith('image/');
//                       return (
//                         <a
//                           key={idx}
//                           href={doc.url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-bg-pill border border-border-light text-xs text-text-main hover:border-accent/40 hover:bg-accent/5 transition-colors"
//                         >
//                           <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
//                             {isImage ? <ImageIcon size={14} /> : <FileText size={14} />}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className="font-semibold truncate capitalize">
//                               {doc.type?.replace(/_/g, ' ') || 'Document'}
//                             </p>
//                             <p className="text-2xs text-text-dim truncate">
//                               {isImage ? 'Image' : 'PDF'} · click to view
//                             </p>
//                           </div>
//                           <ExternalLink size={12} className="text-text-dim group-hover:text-accent shrink-0" />
//                         </a>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {fee > 0 && (
//                 <div>
//                   <SectionLabel>Payment Proof</SectionLabel>
//                   {payment ? (
//                     <div className="rounded-xl border border-border-light bg-bg-pill overflow-hidden">
//                       <div className="p-3 flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0">
//                           <CreditCard size={16} />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-xs font-bold text-text-main">
//                             {Number(payment.amount).toLocaleString()} ETB via{' '}
//                             <span className="capitalize">
//                               {(payment.method || 'unknown').replace(/-/g, ' ')}
//                             </span>
//                           </p>
//                           <p className="text-2xs text-text-dim">
//                             Status:{' '}
//                             <span className="font-bold uppercase tracking-wider">
//                               {payment.status || 'pending'}
//                             </span>
//                           </p>
//                         </div>
//                         {payment.screenshot_url && (
//                           <a
//                             href={payment.screenshot_url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-info/10 text-info border border-info/30 text-2xs font-bold hover:bg-info/20"
//                           >
//                             <ExternalLink size={10} /> Full size
//                           </a>
//                         )}
//                       </div>
//                       <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
//                         <div className="p-2 rounded-lg bg-bg-input border border-border-light">
//                           <p className="text-[10px] uppercase tracking-wider text-text-dim font-semibold">
//                             Transaction Reference
//                           </p>
//                           <p className="text-xs font-mono text-text-main truncate">
//                             {payment.reference || '—'}
//                           </p>
//                         </div>
//                         <div className="p-2 rounded-lg bg-bg-input border border-border-light">
//                           <p className="text-[10px] uppercase tracking-wider text-text-dim font-semibold">
//                             Submitted
//                           </p>
//                           <p className="text-xs font-medium text-text-main">
//                             {formatDateTime(payment.created_at || payment.paid_at)}
//                           </p>
//                         </div>
//                       </div>
//                       {payment.screenshot_url && (
//                         <a
//                           href={payment.screenshot_url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="block relative group border-t border-border-light bg-bg-input"
//                         >
//                           <img
//                             src={payment.screenshot_url}
//                             alt="Payment screenshot"
//                             className="w-full max-h-56 object-contain bg-black/20 group-hover:opacity-90 transition-opacity"
//                             loading="lazy"
//                           />
//                         </a>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 flex items-start gap-2">
//                       <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
//                       <div>
//                         <p className="text-xs font-bold text-warning">
//                           No payment on file
//                         </p>
//                         <p className="text-2xs text-text-muted mt-0.5">
//                           {t.scholarships?.admin?.noPaymentOnFile ||
//                             'Applicant has not submitted proof for the {amount} ETB fee.'}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {application.rejection_reason && (
//                 <div className="flex items-start gap-2 p-3 rounded-xl bg-error/5 border border-error/20 text-error text-xs">
//                   <AlertCircle size={14} className="shrink-0 mt-0.5" />
//                   <div>
//                     <p className="font-bold">Rejected</p>
//                     <p className="opacity-90 mt-0.5">{application.rejection_reason}</p>
//                   </div>
//                 </div>
//               )}

//               {application.revocation_reason && (
//                 <div className="flex items-start gap-2 p-3 rounded-xl bg-error/5 border border-error/20 text-error text-xs">
//                   <AlertCircle size={14} className="shrink-0 mt-0.5" />
//                   <div>
//                     <p className="font-bold">Revoked</p>
//                     <p className="opacity-90 mt-0.5">{application.revocation_reason}</p>
//                   </div>
//                 </div>
//               )}

//               {events.length > 0 && (
//                 <details open className="text-xs">
//                   <summary className="cursor-pointer text-text-muted font-bold flex items-center gap-1.5 select-none hover:text-accent">
//                     <MessageSquare size={11} /> Event history ({events.length})
//                   </summary>
//                   <div className="mt-2 flex flex-col gap-1.5">
//                     {events.map((ev) => (
//                       <div
//                         key={ev.id}
//                         className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-pill border border-border-light text-2xs"
//                       >
//                         <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
//                         <span className="font-bold text-text-main capitalize">
//                           {ev.event_type?.replace(/_/g, ' ')}
//                         </span>
//                         <span className="text-text-dim ml-auto shrink-0">
//                           {formatDateTime(ev.created_at)}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </details>
//               )}
//             </div>

//             {/* RIGHT */}
//             <div className="lg:col-span-2 flex flex-col gap-3">
//               <div
//                 className="p-3 rounded-xl border"
//                 style={{
//                   background: statusCfg.tone.bg,
//                   borderColor: statusCfg.tone.border,
//                 }}
//               >
//                 <div className="flex items-center gap-2 mb-1">
//                   <StatusIcon size={14} style={{ color: statusCfg.tone.fg }} />
//                   <p
//                     className="text-xs font-extrabold"
//                     style={{ color: statusCfg.tone.fg }}
//                   >
//                     {statusCfg.label}
//                   </p>
//                 </div>
//                 <p
//                   className="text-2xs opacity-90"
//                   style={{ color: statusCfg.tone.fg }}
//                 >
//                   {statusCfg.summary}
//                 </p>
//               </div>

//               <div className="p-4 rounded-xl bg-bg-pill border border-border-light flex flex-col gap-3">
//                 <SectionLabel className="mb-0">Decision</SectionLabel>

//                 {(status === 'pending' || status === 'payment_verified') && (
//                   <div>
//                     <label className="block text-2xs font-bold text-text-dim mb-1">
//                       Internal note (optional)
//                     </label>
//                     <textarea
//                       value={adminNote}
//                       onChange={(e) => setAdminNote(e.target.value.slice(0, 2000))}
//                       rows={2}
//                       placeholder="Visible only to admins..."
//                       className="w-full px-2.5 py-2 rounded-lg bg-bg-input border border-border-light text-2xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent resize-none"
//                     />
//                   </div>
//                 )}

//                 {canReject && (
//                   <div>
//                     <label className="block text-2xs font-bold text-error mb-1">
//                       Rejection reason<span className="text-error"> *</span>
//                     </label>
//                     <textarea
//                       value={rejectionReason}
//                       onChange={(e) =>
//                         setRejectionReason(e.target.value.slice(0, 2000))
//                       }
//                       rows={2}
//                       placeholder="Required before rejecting"
//                       className="w-full px-2.5 py-2 rounded-lg bg-bg-input border border-error/30 text-2xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-error resize-none"
//                     />
//                   </div>
//                 )}

//                 {canRevoke && (
//                   <div>
//                     <label className="block text-2xs font-bold text-error mb-1">
//                       Revocation reason<span className="text-error"> *</span>
//                     </label>
//                     <textarea
//                       value={revocationReason}
//                       onChange={(e) =>
//                         setRevocationReason(e.target.value.slice(0, 2000))
//                       }
//                       rows={2}
//                       placeholder="Required before revoking"
//                       className="w-full px-2.5 py-2 rounded-lg bg-bg-input border border-error/30 text-2xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-error resize-none"
//                     />
//                   </div>
//                 )}

//                 <div className="flex flex-col gap-2 mt-1">
//                   {canVerifyPayment && (
//                     <button
//                       type="button"
//                       onClick={handleVerifyPayment}
//                       disabled={busy}
//                       className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-info text-text-inverse text-xs font-extrabold hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
//                     >
//                       {busy ? (
//                         <Loader2 size={13} className="animate-spin" />
//                       ) : (
//                         <ShieldCheck size={13} />
//                       )}
//                       {t.scholarships?.admin?.verifyPaymentButton ||
//                         'Verify Payment'}
//                     </button>
//                   )}

//                   {canApprove && (
//                     <button
//                       type="button"
//                       onClick={handleApprove}
//                       disabled={busy}
//                       className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-success text-text-inverse text-xs font-extrabold hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
//                     >
//                       {busy ? (
//                         <Loader2 size={13} className="animate-spin" />
//                       ) : (
//                         <CheckCircle2 size={13} />
//                       )}
//                       {t.scholarships?.admin?.detailReviewButton ||
//                         'Approve Application'}
//                     </button>
//                   )}

//                   {isPaid && status === 'pending' && !hasVerifiedPayment && (
//                     <div className="p-2 rounded-lg bg-warning/5 border border-warning/20 text-2xs text-warning leading-relaxed">
//                       {t.scholarships?.admin?.waitingForPaymentHint ||
//                         'Verify the payment before approving.'}
//                     </div>
//                   )}

//                   {canReject && (
//                     <button
//                       type="button"
//                       onClick={handleReject}
//                       disabled={busy || !rejectionReason.trim()}
//                       className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-error/10 text-error border border-error/30 text-xs font-extrabold hover:bg-error/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                     >
//                       <XCircle size={13} />
//                       {t.scholarships?.admin?.detailRejectButton ||
//                         'Reject Application'}
//                     </button>
//                   )}

//                   {canRevoke && (
//                     <button
//                       type="button"
//                       onClick={handleRevoke}
//                       disabled={busy || !revocationReason.trim()}
//                       className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-error/10 text-error border border-error/30 text-xs font-extrabold hover:bg-error/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                     >
//                       <Ban size={13} />
//                       {t.scholarships?.admin?.detailRevokeButton ||
//                         'Revoke Scholarship'}
//                     </button>
//                   )}

//                   <button
//                     type="button"
//                     onClick={onClose}
//                     disabled={busy}
//                     className="w-full px-3 py-2 rounded-lg bg-bg-input text-text-muted text-xs font-bold hover:text-text-main disabled:opacity-50 transition-colors"
//                   >
//                     {t.scholarships?.admin?.formCancel || 'Close'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Modal>
//   );
// };

// export default ApplicationDetailModal;


















/**
 * @fileoverview Application Detail Modal (Admin)
 *
 * Two-column review surface built on shared admin UI primitives.
 * Left column: applicant metadata, motivation, documents, payment proof,
 * event history. Right column: state-aware decision panel.
 *
 * Decision matrix (Model A — pay-at-apply):
 *   pending + paid campaign      → Verify Payment
 *   pending + free campaign      → Approve / Reject
 *   payment_verified             → Approve / Reject
 *   approved                     → Revoke (config-gated)
 *
 * Every action routes through the styled confirmation dialog; feedback
 * flows through the toast system. All copy resolves from
 * admin.scholarships.detail.* / scholarships.admin.* i18n.
 *
 * Path: apps/web/components/admin/scholarships/ApplicationDetailModal.jsx
 */

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Ban,
  ExternalLink,
  FileText,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  Wallet,
} from 'lucide-react';
import AdminModal from '../ui/AdminModal';
import AdminButton from '../ui/AdminButton';
import AdminBadge from '../ui/AdminBadge';
import { AdminTextarea } from '../ui/AdminInput';
import { AdminSkeletonBase } from '../ui/AdminSkeleton';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../shared/ConfirmProvider';
import apiClient from '../../../lib/api';
import { resolveLabel, interpolate } from '../../../lib/admin/labels';
import { getScholarshipAdminConfig } from '../../../lib/config';

/* ── Formatting helpers ───────────────────────────────────────────── */

const formatDateTime = (value, fallback) => {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (value, fallback) => {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/* ── Status presentation map ──────────────────────────────────────── */

const STATUS_META = {
  pending: { tone: 'warning', Icon: Clock },
  payment_verified: { tone: 'info', Icon: ShieldCheck },
  approved: { tone: 'success', Icon: CheckCircle2 },
  rejected: { tone: 'error', Icon: XCircle },
  withdrawn: { tone: 'neutral', Icon: RotateCcw },
  revoked: { tone: 'error', Icon: Ban },
};

const TONE_SURFACE = {
  warning: 'bg-accent/10 border-accent/30 text-accent',
  info: 'bg-info/10 border-info/30 text-info',
  success: 'bg-success/10 border-success/30 text-success',
  error: 'bg-error/10 border-error/30 text-error',
  neutral: 'bg-surface-secondary border-border-light text-text-dim',
};

/* ── Subcomponents ────────────────────────────────────────────────── */

const MetaCell = ({ icon, label, value, mono = false }) => (
  <div className="flex items-start gap-2 min-w-0">
    <span className="text-text-dim mt-0.5 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="m-0 text-2xs uppercase tracking-wider text-text-dim font-semibold">{label}</p>
      <p className={`m-0 text-xs text-text-main break-words ${mono ? 'font-mono' : 'font-medium'}`}>
        {value}
      </p>
    </div>
  </div>
);

const SectionLabel = ({ children }) => (
  <p className="m-0 mb-2 text-2xs font-extrabold uppercase tracking-widest text-text-dim">
    {children}
  </p>
);

/* ── Main component ───────────────────────────────────────────────── */

const NOTE_MAX_LENGTH = 2000;

const ApplicationDetailModal = ({ isOpen, applicationId, onClose, onUpdated }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();
  const adminConfig = getScholarshipAdminConfig();

  const [application, setApplication] = useState(null);
  const [events, setEvents] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [revocationReason, setRevocationReason] = useState('');

  const label = (key) => resolveLabel(t, key);
  const emDash = label('admin.common.labels.emDash');
  const currency = label('admin.common.labels.currency');

  useEffect(() => {
    if (!isOpen || !applicationId) return undefined;
    let cancelled = false;
    setLoading(true);
    setAdminNote('');
    setRejectionReason('');
    setRevocationReason('');

    apiClient
      .get(`/admin/scholarships/applications/${applicationId}`)
      .then((response) => {
        if (cancelled) return;
        if (response?.success) {
          setApplication(response.data?.application || null);
          setEvents(response.data?.events || []);
          setPayment(response.data?.payment || null);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(
          error?.response?.data?.message || label('admin.scholarships.detail.loadFailed')
        );
        onClose();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, applicationId]);

  /* ── Actions ── */

  const handleVerifyPayment = useCallback(async () => {
    if (!application) return;
    const fee = Number(application.registration_fee_etb) || 0;
    const method = payment?.method || label('admin.scholarships.detail.unknownMethod');
    const reference = payment?.reference || emDash;

    const ok = await confirm({
      title: label('scholarships.admin.verifyPaymentConfirmTitle'),
      message: interpolate(label('scholarships.admin.verifyPaymentConfirmBody'), {
        amount: fee.toLocaleString(),
        method,
        reference,
      }),
      confirmText: label('scholarships.admin.verifyPaymentButton'),
      variant: 'warning',
    });
    if (!ok) return;

    setBusy(true);
    try {
      const response = await apiClient.post(
        `/admin/scholarships/applications/${application.id}/verify-payment`,
        { note: adminNote || null },
        { _confirm: null }
      );
      if (response?.success) {
        toast.success(label('scholarships.admin.paymentVerifiedSuccess'));
        if (typeof onUpdated === 'function') onUpdated();
        onClose();
      } else {
        toast.error(response?.message || label('admin.scholarships.detail.verifyFailed'));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || label('admin.scholarships.detail.verifyFailed'));
    } finally {
      setBusy(false);
    }
  }, [application, payment, adminNote, confirm, onClose, onUpdated, t, toast]);

  const handleApprove = useCallback(async () => {
    if (!application) return;
    const fee = Number(application.registration_fee_etb) || 0;
    const feeNote =
      fee > 0
        ? interpolate(label('scholarships.admin.detailConfirmApproveFeeNote'), {
            amount: fee.toLocaleString(),
          })
        : label('scholarships.admin.detailConfirmApproveFreeNote');

    const ok = await confirm({
      title: label('scholarships.admin.detailConfirmApproveTitle'),
      message: feeNote,
      confirmText: label('scholarships.admin.detailReviewButton'),
      variant: 'warning',
    });
    if (!ok) return;

    setBusy(true);
    try {
      const response = await apiClient.post(
        `/admin/scholarships/applications/${application.id}/approve`,
        { note: adminNote || null },
        { _confirm: null }
      );
      if (response?.success) {
        toast.success(label('scholarships.admin.approveSuccess'));
        if (typeof onUpdated === 'function') onUpdated();
        onClose();
      } else {
        toast.error(response?.message || label('admin.scholarships.detail.approveFailed'));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || label('admin.scholarships.detail.approveFailed'));
    } finally {
      setBusy(false);
    }
  }, [application, adminNote, confirm, onClose, onUpdated, t, toast]);

  const handleReject = useCallback(async () => {
    if (!application) return;
    const reason = rejectionReason.trim();
    if (!reason) {
      toast.error(label('scholarships.admin.reasonRequired'));
      return;
    }
    const fee = Number(application.registration_fee_etb) || 0;

    const ok = await confirm({
      title: label('scholarships.admin.detailConfirmRejectTitle'),
      message: interpolate(label('scholarships.admin.detailConfirmRejectBody'), {
        amount: fee.toLocaleString(),
      }),
      confirmText: label('scholarships.admin.detailRejectButton'),
      variant: 'danger',
    });
    if (!ok) return;

    setBusy(true);
    try {
      const response = await apiClient.post(
        `/admin/scholarships/applications/${application.id}/reject`,
        { reason, note: adminNote || null },
        { _confirm: null }
      );
      if (response?.success) {
        toast.success(label('scholarships.admin.rejectSuccess'));
        if (typeof onUpdated === 'function') onUpdated();
        onClose();
      } else {
        toast.error(response?.message || label('admin.scholarships.detail.rejectFailed'));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || label('admin.scholarships.detail.rejectFailed'));
    } finally {
      setBusy(false);
    }
  }, [application, rejectionReason, adminNote, confirm, onClose, onUpdated, t, toast]);

  const handleRevoke = useCallback(async () => {
    if (!application) return;
    const reason = revocationReason.trim();
    if (!reason) {
      toast.error(label('scholarships.admin.reasonRequired'));
      return;
    }

    const ok = await confirm({
      title: label('scholarships.admin.detailConfirmRevokeTitle'),
      message: label('scholarships.admin.detailConfirmRevokeBody'),
      confirmText: label('scholarships.admin.detailRevokeButton'),
      variant: 'danger',
    });
    if (!ok) return;

    setBusy(true);
    try {
      const response = await apiClient.post(
        `/admin/scholarships/applications/${application.id}/revoke`,
        { reason },
        { _confirm: null }
      );
      if (response?.success) {
        toast.success(label('scholarships.admin.revokeSuccess'));
        if (typeof onUpdated === 'function') onUpdated();
        onClose();
      } else {
        toast.error(response?.message || label('admin.scholarships.detail.revokeFailed'));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || label('admin.scholarships.detail.revokeFailed'));
    } finally {
      setBusy(false);
    }
  }, [application, revocationReason, confirm, onClose, onUpdated, t, toast]);

  /* ── Derived state ── */

  const status = application?.status || 'pending';
  const meta = STATUS_META[status] || STATUS_META.pending;
  const StatusIcon = meta.Icon;
  const statusLabel = label(`admin.scholarships.detail.status.${status}`);
  const statusSummary = label(`admin.scholarships.detail.summary.${status}`);

  const fee = Number(application?.registration_fee_etb) || 0;
  const isPaid = fee > 0;
  const canVerifyPayment = isPaid && status === 'pending' && Boolean(payment);
  const canApprove =
    (isPaid && status === 'payment_verified') || (!isPaid && status === 'pending');
  const canReject = status === 'pending' || status === 'payment_verified';
  const canRevoke = status === 'approved' && adminConfig.allowRevocation !== false;
  const documents = Array.isArray(application?.documents) ? application.documents : [];

  const footer = (
    <AdminButton variant="secondary" onClick={onClose} disabled={busy}>
      {label('scholarships.admin.formCancel')}
    </AdminButton>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={busy ? () => {} : onClose}
      title={label('admin.scholarships.detail.title')}
      size="xl"
      closeLabel={label('admin.common.actions.close')}
      footer={footer}
    >
      {loading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <AdminSkeletonBase className="h-16 w-full rounded-xl" />
          <AdminSkeletonBase className="h-32 w-full rounded-xl" />
          <AdminSkeletonBase className="h-24 w-full rounded-xl" />
        </div>
      ) : !application ? (
        <p className="m-0 text-text-muted text-sm py-8 text-center">
          {label('admin.scholarships.detail.notFound')}
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left column */}
          <div className="lg:col-span-3 flex flex-col gap-5 min-w-0">
            {/* Applicant header */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-accent/15 text-accent flex items-center justify-center font-extrabold text-lg shrink-0">
                {(application.applicant_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="m-0 text-base font-extrabold text-text-main leading-tight break-words">
                  {application.applicant_name || label('admin.godMode.unknownUser')}
                </h3>
                <p className="m-0 mt-0.5 text-2xs text-text-muted truncate">
                  {application.campaign_name}
                </p>
              </div>
              <AdminBadge tone={meta.tone} pulse={status === 'pending'}>
                <StatusIcon size={11} aria-hidden="true" />
                {statusLabel}
              </AdminBadge>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-bg-pill border border-solid border-border-light">
              <MetaCell
                icon={<Phone size={12} aria-hidden="true" />}
                label={label('admin.common.labels.phone')}
                value={application.applicant_phone || emDash}
                mono
              />
              <MetaCell
                icon={<Mail size={12} aria-hidden="true" />}
                label={label('admin.common.labels.email')}
                value={application.applicant_email || emDash}
              />
              <MetaCell
                icon={<Calendar size={12} aria-hidden="true" />}
                label={label('admin.scholarships.detail.appliedOn')}
                value={formatDate(application.created_at, emDash)}
              />
              {fee > 0 && (
                <MetaCell
                  icon={<Wallet size={12} aria-hidden="true" />}
                  label={label('admin.scholarships.detail.applicationFee')}
                  value={`${fee.toLocaleString()} ${currency}`}
                />
              )}
            </div>

            {/* Motivation */}
            <div>
              <SectionLabel>{label('admin.scholarships.detail.motivation')}</SectionLabel>
              <div className="p-4 rounded-xl bg-bg-pill border border-solid border-border-light text-sm text-text-main whitespace-pre-wrap leading-loose break-words max-h-96 overflow-y-auto">
                {application.motivation || emDash}
              </div>
            </div>

            {/* Documents */}
            {documents.length > 0 && (
              <div>
                <SectionLabel>
                  {interpolate(label('admin.scholarships.detail.documentsCount'), {
                    count: documents.length,
                  })}
                </SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {documents.map((doc, index) => {
                    const isImage = doc.mimetype?.startsWith('image/');
                    return (
                      <a
                        key={`${doc.type}-${index}`}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-bg-pill border border-solid border-border-light text-xs text-text-main no-underline hover:border-accent/40 hover:bg-accent/5 transition-colors duration-fast"
                      >
                        <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                          {isImage ? <ImageIcon size={14} /> : <FileText size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="m-0 font-semibold truncate capitalize">
                            {doc.type?.replace(/_/g, ' ') || label('admin.scholarships.detail.documentFallback')}
                          </p>
                          <p className="m-0 text-2xs text-text-dim truncate">
                            {isImage
                              ? label('admin.scholarships.detail.imageType')
                              : label('admin.scholarships.detail.pdfType')}{' '}
                            · {label('admin.scholarships.detail.clickToView')}
                          </p>
                        </div>
                        <ExternalLink size={12} className="text-text-dim group-hover:text-accent shrink-0" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment proof */}
            {fee > 0 && (
              <div>
                <SectionLabel>{label('admin.scholarships.detail.paymentProof')}</SectionLabel>
                {payment ? (
                  <div className="rounded-xl border border-solid border-border-light bg-bg-pill overflow-hidden">
                    <div className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0">
                        <CreditCard size={16} aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-xs font-bold text-text-main">
                          {interpolate(label('admin.scholarships.detail.viaMethod'), {
                            amount: Number(payment.amount).toLocaleString(),
                            method: (payment.method || label('admin.scholarships.detail.unknownMethod')).replace(/-/g, ' '),
                          })}
                        </p>
                        <p className="m-0 text-2xs text-text-dim">
                          {interpolate(label('admin.scholarships.detail.paymentStatus'), {
                            status: payment.status || label('admin.common.statuses.pending'),
                          })}
                        </p>
                      </div>
                      {payment.screenshot_url && (
                        <a
                          href={payment.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-info/10 text-info border border-solid border-info/30 text-2xs font-bold no-underline hover:bg-info/20 transition-colors duration-fast"
                        >
                          <ExternalLink size={10} aria-hidden="true" />
                          {label('admin.scholarships.detail.fullSize')}
                        </a>
                      )}
                    </div>
                    <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-bg-input border border-solid border-border-light">
                        <p className="m-0 text-2xs uppercase tracking-wider text-text-dim font-semibold">
                          {label('admin.scholarships.detail.transactionRef')}
                        </p>
                        <p className="m-0 text-xs font-mono text-text-main truncate">
                          {payment.reference || emDash}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-bg-input border border-solid border-border-light">
                        <p className="m-0 text-2xs uppercase tracking-wider text-text-dim font-semibold">
                          {label('admin.scholarships.detail.submitted')}
                        </p>
                        <p className="m-0 text-xs font-medium text-text-main">
                          {formatDateTime(payment.created_at || payment.paid_at, emDash)}
                        </p>
                      </div>
                    </div>
                    {payment.screenshot_url && (
                      <a
                        href={payment.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative group border-t border-solid border-border-light bg-bg-input"
                      >
                        <img
                          src={payment.screenshot_url}
                          alt={label('admin.paymentDetail.screenshot')}
                          className="w-full max-h-56 object-contain bg-bg-main/20 group-hover:opacity-90 transition-opacity duration-fast"
                          loading="lazy"
                        />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-warning/5 border border-solid border-warning/20 flex items-start gap-2">
                    <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="m-0 text-xs font-bold text-warning">
                        {label('admin.scholarships.detail.noPaymentTitle')}
                      </p>
                      <p className="m-0 mt-0.5 text-2xs text-text-muted">
                        {interpolate(label('scholarships.admin.noPaymentOnFile'), {
                          amount: fee.toLocaleString(),
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rejection / revocation reasons */}
            {application.rejection_reason && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-error/5 border border-solid border-error/20 text-error text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="m-0 font-bold">{label('admin.scholarships.detail.rejectedLabel')}</p>
                  <p className="m-0 mt-0.5 opacity-90">{application.rejection_reason}</p>
                </div>
              </div>
            )}
            {application.revocation_reason && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-error/5 border border-solid border-error/20 text-error text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="m-0 font-bold">{label('admin.scholarships.detail.revokedLabel')}</p>
                  <p className="m-0 mt-0.5 opacity-90">{application.revocation_reason}</p>
                </div>
              </div>
            )}

            {/* Event history */}
            {events.length > 0 && (
              <details open className="text-xs">
                <summary className="cursor-pointer text-text-muted font-bold flex items-center gap-1.5 select-none hover:text-accent transition-colors duration-fast">
                  <MessageSquare size={11} aria-hidden="true" />
                  {interpolate(label('admin.scholarships.detail.eventHistory'), {
                    count: events.length,
                  })}
                </summary>
                <div className="mt-2 flex flex-col gap-1.5">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-pill border border-solid border-border-light text-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                      <span className="font-bold text-text-main capitalize">
                        {event.event_type?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-text-dim ml-auto shrink-0">
                        {formatDateTime(event.created_at, emDash)}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Right column: decision panel */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className={`p-3 rounded-xl border border-solid ${TONE_SURFACE[meta.tone]}`}>
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon size={14} aria-hidden="true" />
                <p className="m-0 text-xs font-extrabold">{statusLabel}</p>
              </div>
              <p className="m-0 text-2xs opacity-90">{statusSummary}</p>
            </div>

            <div className="p-4 rounded-xl bg-bg-pill border border-solid border-border-light flex flex-col gap-3">
              <SectionLabel>{label('admin.scholarships.detail.decision')}</SectionLabel>

              {(status === 'pending' || status === 'payment_verified') && (
                <AdminTextarea
                  label={label('admin.scholarships.detail.internalNote')}
                  rows={2}
                  value={adminNote}
                  maxLength={NOTE_MAX_LENGTH}
                  placeholder={label('admin.scholarships.detail.internalNotePlaceholder')}
                  onChange={(e) => setAdminNote(e.target.value.slice(0, NOTE_MAX_LENGTH))}
                />
              )}

              {canReject && (
                <AdminTextarea
                  label={`${label('admin.scholarships.detail.rejectionReason')} *`}
                  rows={2}
                  value={rejectionReason}
                  maxLength={NOTE_MAX_LENGTH}
                  placeholder={label('admin.scholarships.detail.rejectionPlaceholder')}
                  onChange={(e) => setRejectionReason(e.target.value.slice(0, NOTE_MAX_LENGTH))}
                />
              )}

              {canRevoke && (
                <AdminTextarea
                  label={`${label('admin.scholarships.detail.revocationReason')} *`}
                  rows={2}
                  value={revocationReason}
                  maxLength={NOTE_MAX_LENGTH}
                  placeholder={label('admin.scholarships.detail.revocationPlaceholder')}
                  onChange={(e) => setRevocationReason(e.target.value.slice(0, NOTE_MAX_LENGTH))}
                />
              )}

              <div className="flex flex-col gap-2 mt-1">
                {canVerifyPayment && (
                  <AdminButton variant="primary" fullWidth loading={busy} onClick={handleVerifyPayment}>
                    <ShieldCheck size={13} aria-hidden="true" />
                    {label('scholarships.admin.verifyPaymentButton')}
                  </AdminButton>
                )}
                {canApprove && (
                  <AdminButton variant="primary" fullWidth loading={busy} onClick={handleApprove}>
                    <CheckCircle2 size={13} aria-hidden="true" />
                    {label('scholarships.admin.detailReviewButton')}
                  </AdminButton>
                )}
                {isPaid && status === 'pending' && !payment && (
                  <div className="p-2 rounded-lg bg-warning/5 border border-solid border-warning/20 text-2xs text-warning leading-relaxed">
                    {label('scholarships.admin.waitingForPaymentHint')}
                  </div>
                )}
                {canReject && (
                  <AdminButton
                    variant="danger"
                    fullWidth
                    disabled={busy || !rejectionReason.trim()}
                    onClick={handleReject}
                  >
                    <XCircle size={13} aria-hidden="true" />
                    {label('scholarships.admin.detailRejectButton')}
                  </AdminButton>
                )}
                {canRevoke && (
                  <AdminButton
                    variant="danger"
                    fullWidth
                    disabled={busy || !revocationReason.trim()}
                    onClick={handleRevoke}
                  >
                    <Ban size={13} aria-hidden="true" />
                    {label('scholarships.admin.detailRevokeButton')}
                  </AdminButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminModal>
  );
};

export default ApplicationDetailModal;