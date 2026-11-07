-- ============================================================================
-- Migration: 023_scholarship_learn_more.sql
--
-- Adds "Learn More" content to scholarship campaigns. Two complementary
-- columns:
--
--   learn_more_content TEXT
--     Long-form rich content (markdown or plain text) rendered inline on
--     the campaign detail page in an expandable section. Admin can paste
--     a full "About this scholarship" narrative — requirements, timeline,
--     selection criteria, contact info, anything.
--
--   learn_more_url VARCHAR(500)
--     Optional external link (Notion doc, Google Doc, external CMS page).
--     If set, the detail page renders an additional "Read full details →"
--     link that opens in a new tab.
--
-- Both columns are optional. Admin can use either, both, or neither.
-- Empty values are rendered as "no learn more section" with no UI noise.
--
-- Idempotent: uses IF NOT EXISTS so it's safe to re-run.
--
-- Path: apps/api/src/database/migrations/023_scholarship_learn_more.sql
-- ============================================================================

BEGIN;

ALTER TABLE scholarship_campaigns
  ADD COLUMN IF NOT EXISTS learn_more_content TEXT,
  ADD COLUMN IF NOT EXISTS learn_more_url VARCHAR(500);

COMMENT ON COLUMN scholarship_campaigns.learn_more_content IS $$
Long-form "Learn More" content rendered inline on the campaign detail
page. Admin can paste requirements, timeline, criteria, FAQ, contact
info — anything. Supports plain text; newlines preserved on render.
$$;

COMMENT ON COLUMN scholarship_campaigns.learn_more_url IS $$
Optional external link for the campaign's full details (Notion, Google
Doc, CMS page). If set, the detail page renders a "Read full details →"
link that opens in a new tab. Independent of learn_more_content.
$$;

COMMIT;