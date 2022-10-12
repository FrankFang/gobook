CREATE TABLE IF NOT EXISTS books (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name text,
  author text,
  summary text,
  cover text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME,
  deleted_at DATETIME
);
CREATE TABLE IF NOT EXISTS chapters (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name text,
  book_id INTEGER DEFAULT 0,
  parent_id INTEGER DEFAULT 0,
  sequence float DEFAULT 0,
  content text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME,
  deleted_at DATETIME
);
CREATE TABLE IF NOT EXISTS images (
  id  INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER DEFAULT 0,
  chapter_id INTEGER DEFAULT 0,
  slug text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME,
  deleted_at DATETIME
);
CREATE TABLE IF NOT EXISTS covers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER DEFAULT 0,
  slug text,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME,
  deleted_at DATETIME
);

