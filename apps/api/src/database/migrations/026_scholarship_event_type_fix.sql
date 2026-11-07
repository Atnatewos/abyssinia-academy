/**
 * Migration: 026_scholarship_event_type_fix.sql
 *
 * The scholarship_application_events.event_type CHECK constraint was
 * created with a fixed list of allowed values. The verify-payment flow
 * introduced a new event type 'payment_verified' which is not in that
 * list — causing the audit insert to fail and roll back the entire
 * payment verification transaction.
 *
 * This migration drops the old constraint and replaces it with an
 * expanded list that includes every event type currently emitted by
 * lib/scholarships/service.js:
 *
 *   submitted            — applicant applied
 *   approved             — admin granted the scholarship
 *   pending_payment      — admin approved but fee not yet paid (legacy)
 *   payment_received     — fee approved, enrollment created (legacy)
 *   payment_verified     — admin confirmed payment arrived (pay-at-apply)
 *   rejected             — admin declined (with refund if fee paid)
 *   rejected_with_refund — admin declined after fee was paid
 *   revoked              — previously approved, now revoked
 *   withdrawn            — applicant withdrew
 *   refund_completed     — admin marked the refund as completed
 *   reviewed             — generic review event (legacy)
 *   noted                — admin left an internal note
 *
 * Path: apps/api/src/database/migrations/026_scholarship_event_type_fix.sql
 */

-- Drop the old CHECK constraint
ALTER TABLE scholarship_application_events
  DROP CONSTRAINT IF EXISTS scholarship_application_events_event_type_check;

-- Re-add with the full expanded list
ALTER TABLE scholarship_application_events
  ADD CONSTRAINT scholarship_application_events_event_type_check
  CHECK (event_type IN (
    'submitted',
    'approved',
    'pending_payment',
    'payment_received',
    'payment_verified',
    'rejected',
    'rejected_with_refund',
    'revoked',
    'withdrawn',
    'refund_completed',
    'reviewed',
    'noted'
  ));