-- Telegram bot support tables for admins & state

-- Store admin chats who should receive notifications
CREATE TABLE IF NOT EXISTS tg_admins (
    chat_id    TEXT PRIMARY KEY,   -- Telegram chat id (string)
    username   TEXT,
    first_name TEXT,
    created_at INTEGER             -- epoch seconds when promoted to admin
);

-- Store simple per-chat state for flows (e.g. awaiting passcode)
CREATE TABLE IF NOT EXISTS tg_state (
    chat_id    TEXT PRIMARY KEY,
    state      TEXT NOT NULL,
    updated_at INTEGER             -- epoch seconds
);
