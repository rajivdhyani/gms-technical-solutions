-- Adds programme kind (course vs internship) and a human duration label.
ALTER TABLE courses ADD COLUMN kind TEXT NOT NULL DEFAULT 'course';
ALTER TABLE courses ADD COLUMN duration_label TEXT;
