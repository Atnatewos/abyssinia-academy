/**
 * Migration: Admin Audit & Enhanced Admin System
 * Creates admin_audit_logs, admin_login_history tables.
 * Adds is_active, last_ip, permissions columns to admins table.
 * Path: apps/api/src/database/migrations/006_add_admin_audit_system.sql
 */

-- ============================================================================
-- ADMIN AUDIT LOGS TABLE
-- Records every admin action for security and compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (

    /*
     * Primary key
     */
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /*
     * Which admin performed the action
     */
    admin_id UUID REFERENCES admins(id),

    /*
     * The action performed (e.g., 'payment.approve', 'user.edit', 'discount.create')
     */
    action VARCHAR(100) NOT NULL,

    /*
     * What type of entity was affected ('payment', 'user', 'discount', 'course', etc.)
     */
    target_type VARCHAR(50),

    /*
     * The ID of the affected entity
     */
    target_id UUID,

    /*
     * Additional context stored as JSON (old values, new values, etc.)
     */
    details JSONB DEFAULT '{}',

    /*
     * IP address of the admin
     */
    ip_address VARCHAR(45),

    /*
     * Browser user agent
     */
    user_agent TEXT,

    /*
     * When the action occurred
     */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON admin_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON admin_audit_logs(created_at);

-- ============================================================================
-- ADMIN LOGIN HISTORY TABLE
-- Tracks all login attempts (successful and failed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_login_history (

    /*
     * Primary key
     */
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    /*
     * Which admin attempted to log in (NULL if username not found)
     */
    admin_id UUID REFERENCES admins(id),

    /*
     * Whether the login was successful
     */
    success BOOLEAN DEFAULT false,

    /*
     * IP address of the login attempt
     */
    ip_address VARCHAR(45),

    /*
     * Browser user agent
     */
    user_agent TEXT,

    /*
     * When the attempt occurred
     */
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_login_history_admin ON admin_login_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_login_history_attempted ON admin_login_history(attempted_at);

-- ============================================================================
-- ADMINS TABLE — Add Enhanced Columns
-- ============================================================================

/*
 * Whether the admin account is active
 */
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

/*
 * Last IP address used by this admin
 */
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS last_ip VARCHAR(45);

/*
 * Granular permissions stored as JSON
 * Example: { "payments": ["view", "approve"], "users": ["view", "edit"], "discounts": ["manage"] }
 * NULL or empty = full access (for backward compatibility)
 */
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';