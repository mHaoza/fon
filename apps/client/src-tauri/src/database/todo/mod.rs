pub mod models;
pub mod repository;
pub mod schema;

use crate::database::Database;
use rusqlite::Connection;
use std::sync::Arc;

// 重新导出主要的类型和功能
pub use models::{CreateTodo, Tag, Todo, UpdateTodo};
pub use repository::TodoRepository;
pub use schema::{TagSchema, TodoSchema};

impl Database {
    pub fn todo_repository(&self) -> TodoRepository {
        TodoRepository::new(Arc::new(self.clone()))
    }
}

/// 初始化todo领域相关的数据库表
pub fn init_tables(conn: &Connection) -> rusqlite::Result<()> {
    // 创建todos表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            date INTEGER,
            repeat TEXT NOT NULL DEFAULT 'never',
            end_repeat_type TEXT,
            end_repeat_date INTEGER,
            remaining_count INTEGER,
            content TEXT NOT NULL DEFAULT '',
            category TEXT,
            is_done BOOLEAN NOT NULL DEFAULT 0,
            is_deleted BOOLEAN NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )",
        [],
    )?;

    // 为现有数据库添加is_deleted字段（如果不存在）
    // let _ = conn.execute(
    //     "ALTER TABLE todos ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT 0",
    //     [],
    // );

    // 创建tags表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            created_at INTEGER NOT NULL
        )",
        [],
    )?;

    // 创建todo_tags关联表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS todo_tags (
            todo_id TEXT NOT NULL,
            tag_id TEXT NOT NULL,
            PRIMARY KEY (todo_id, tag_id),
            FOREIGN KEY (todo_id) REFERENCES todos (id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
        )",
        [],
    )?;

    Ok(())
}
