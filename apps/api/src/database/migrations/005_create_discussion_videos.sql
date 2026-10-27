-- ============================================================================
-- Migration: Discussion Videos Table
-- Stores landing page Q&A/discussion recordings managed from admin panel.
-- sort_order controls display order. New videos get sort_order = 0 (first).
-- Path: apps/api/src/database/migrations/005_create_discussion_videos.sql
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS discussion_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    youtube_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    duration VARCHAR(20) DEFAULT '',
    thumbnail TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_discussion_videos_sort ON discussion_videos(sort_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_videos_active ON discussion_videos(is_active);

COMMIT;