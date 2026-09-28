/**
 * @fileoverview Migration Tracker Table
 * Records every migration file that has successfully run against this database.
 * Path: apps/api/src/database/migrations/000_create_migrations_tracker.sql
 */

CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    ran_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    source VARCHAR(50) NOT NULL DEFAULT 'cli'
);

CREATE INDEX IF NOT EXISTS idx_migrations_ran_at ON _migrations(ran_at DESC);

COMMENT ON TABLE _migrations IS
    'Immutable ledger of every migration file applied to this database. Never delete rows manually.';