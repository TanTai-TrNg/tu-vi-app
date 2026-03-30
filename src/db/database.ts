// ==========================================
// Khởi tạo SQLite database + chạy migrations tự động
// Để thêm bảng/cột mới: tạo file mới trong migrations/
// VD: 002_add_tags.sql, 003_new_table.sql ...
// ==========================================

import Database, { type Database as DatabaseType } from "better-sqlite3"
import path from "node:path"
import { fileURLToPath } from "node:url"
import fs from "node:fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.TUVI_DB_PATH
    ? path.resolve(process.env.TUVI_DB_PATH)
    : path.join(__dirname, "..", "..", "storage", "tuvi.db")
const MIGRATIONS_DIR = path.join(__dirname, "migrations")

// Đảm bảo thư mục storage tồn tại
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

const db = Database(DB_PATH)
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")   // Bật foreign key constraint

// ==========================================
// Hệ thống Migration tự động
// ==========================================

// Bảng theo dõi migration nào đã chạy rồi
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name      TEXT PRIMARY KEY,
    appliedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

// Đọc tất cả file .sql trong migrations/, chạy theo thứ tự tên file
const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()   // sort() đảm bảo chạy đúng thứ tự: 001, 002, 003...

for (const file of migrationFiles) {
    // Kiểm tra migration này đã chạy chưa
    const already = db.prepare("SELECT 1 FROM _migrations WHERE name = ?").get(file)
    if (already) continue   // Đã chạy rồi → bỏ qua

    // Đọc và chạy file SQL
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8")
    db.exec(sql)

    // Đánh dấu đã chạy
    db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file)
    console.error(`[DB] Applied migration: ${file}`)
}

export default db as DatabaseType
