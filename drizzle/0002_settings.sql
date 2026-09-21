-- Site-wide settings the admin panel can change at runtime.
-- Key/value rather than a column per setting, so adding the next one
-- needs no migration.
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'indigo');
