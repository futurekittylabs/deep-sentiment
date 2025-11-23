-- Create a simple counter table
DROP TABLE IF EXISTS counter;
CREATE TABLE IF NOT EXISTS counter (
  id INTEGER PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

-- Initialize with a single counter row
INSERT INTO counter (id, count) VALUES (1, 0);

-- Create topics table
DROP TABLE IF EXISTS topics;
CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL CHECK(length(title) <= 50),
  description TEXT NOT NULL CHECK(length(description) <= 155),
  creator_address TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
