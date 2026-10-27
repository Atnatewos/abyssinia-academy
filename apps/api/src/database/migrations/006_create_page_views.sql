-- ============================================================================
-- Migration: Page Views Tracking
-- Simple anonymous visitor tracking — no cookies, no personal data.
-- Path: apps/api/src/database/migrations/006_create_page_views.sql
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path VARCHAR(255) NOT NULL,
    visitor_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_hash ON page_views(visitor_hash);

COMMIT;