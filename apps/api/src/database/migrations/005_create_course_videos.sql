-- ============================================================================
-- Migration: Course Videos Table
-- Stores course intro/overview recordings managed from admin panel.
-- Same structure as discussion_videos — separate table for separate content.
-- sort_order controls display order. New videos get sort_order = 0 (first).
-- Path: apps/api/src/database/migrations/005_create_course_videos.sql
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS course_videos (
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

CREATE INDEX IF NOT EXISTS idx_course_videos_sort ON course_videos(sort_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_videos_active ON course_videos(is_active);

COMMIT;