-- ================================================================
--   EduWallet v3 - Complete MySQL Database Schema
--   Project : Students Note Sharing Portal
--   Version : 3.0
--
--   HOW TO RUN:
--   1. Open MySQL Workbench
--   2. File → Open SQL Script → select this file
--   3. Press Ctrl+Shift+Enter  (Run All)
-- ================================================================

CREATE DATABASE IF NOT EXISTS eduwallet_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eduwallet_db;

-- ── TABLE 1: users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('admin','student') DEFAULT 'student',
  avatar     VARCHAR(255) DEFAULT NULL,
  is_active  TINYINT(1)   DEFAULT 1,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── TABLE 2: groups_table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groups_table (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  subject     VARCHAR(100),
  invite_code VARCHAR(20)  NOT NULL UNIQUE,
  created_by  INT          NOT NULL,
  is_active   TINYINT(1)   DEFAULT 1,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ── TABLE 3: group_members ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_members (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  group_id  INT NOT NULL,
  user_id   INT NOT NULL,
  role      ENUM('admin','member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_member (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)        ON DELETE CASCADE
);

-- ── TABLE 4: notes ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id             INT          AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  subject        VARCHAR(100),
  unit_tags      VARCHAR(255),
  file_path      VARCHAR(500) NOT NULL,
  file_name      VARCHAR(255) NOT NULL,
  file_type      VARCHAR(50),
  file_size      INT,
  extracted_text LONGTEXT,
  uploaded_by    INT          NOT NULL,
  group_id       INT          DEFAULT NULL,
  is_deleted     TINYINT(1)   DEFAULT 0,
  deleted_at     TIMESTAMP    NULL,
  download_count INT          DEFAULT 0,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)        ON DELETE CASCADE,
  FOREIGN KEY (group_id)    REFERENCES groups_table(id)  ON DELETE SET NULL
);

-- ── TABLE 5: saved_notes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_notes (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT NOT NULL,
  note_id  INT NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_save (user_id, note_id),
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (note_id) REFERENCES notes(id)  ON DELETE CASCADE
);

-- ── TABLE 6: comments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         INT  AUTO_INCREMENT PRIMARY KEY,
  note_id    INT  NOT NULL,
  user_id    INT  NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── TABLE 7: notifications ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT,
  is_read    TINYINT(1)   DEFAULT 0,
  type       VARCHAR(50)  DEFAULT 'info',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── TABLE 8: messages (Private 1-to-1 chat) ──────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              INT          AUTO_INCREMENT PRIMARY KEY,
  sender_id       INT          NOT NULL,
  receiver_id     INT          NOT NULL,
  content         TEXT         NOT NULL,
  note_id         INT          DEFAULT NULL,
  conversation_id VARCHAR(100) NOT NULL,
  is_read         TINYINT(1)   DEFAULT 0,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (note_id)     REFERENCES notes(id) ON DELETE SET NULL,
  INDEX idx_conversation (conversation_id),
  INDEX idx_receiver_read (receiver_id, is_read)
);

-- ── TABLE 9: ai_chats ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_chats (
  id         INT  AUTO_INCREMENT PRIMARY KEY,
  user_id    INT  NOT NULL,
  note_id    INT  DEFAULT NULL,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL
);

-- ── TABLE 10: ai_cache ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_cache (
  id         INT         AUTO_INCREMENT PRIMARY KEY,
  note_id    INT         NOT NULL,
  type       VARCHAR(50) DEFAULT 'summary',
  content    TEXT        NOT NULL,
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cache (note_id, type),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- ── INDEXES ──────────────────────────────────────────────────────
CREATE INDEX idx_notes_subject   ON notes(subject);
CREATE INDEX idx_notes_deleted   ON notes(is_deleted);
CREATE INDEX idx_notes_group     ON notes(group_id);
CREATE INDEX idx_notes_uploader  ON notes(uploaded_by);
CREATE INDEX idx_notes_created   ON notes(created_at);
CREATE INDEX idx_comments_note   ON comments(note_id);
CREATE INDEX idx_saved_user      ON saved_notes(user_id);
CREATE INDEX idx_notif_user      ON notifications(user_id, is_read);
CREATE INDEX idx_members_group   ON group_members(group_id);
CREATE INDEX idx_ai_note         ON ai_chats(note_id, user_id);

-- ================================================================
--  DEFAULT ADMIN ACCOUNT
--  Email   : admin@eduwallet.com
--  Password: admin123
-- ================================================================
INSERT IGNORE INTO users (name, email, password, role, is_active) VALUES
(
  'Admin User',
  'admin@eduwallet.com',
  '$2a$12$bMgbjzyuRyYdb8d97gWCO.1nrPZseLm0ZcX7iC5m7Hq2aW1Sw.ZHC',
  'admin',
  1
);

-- ================================================================
--  VERIFY
-- ================================================================
SELECT TABLE_NAME as 'Table' FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'eduwallet_db' ORDER BY TABLE_NAME;

SELECT '✅ EduWallet v3 Database ready!' AS Status;
SELECT 'Admin Email: admin@eduwallet.com' AS Login;
SELECT 'Admin Password: admin123' AS Password;
