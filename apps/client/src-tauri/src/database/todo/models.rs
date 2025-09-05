use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub date: Option<i64>,
    pub repeat: String,
    pub end_repeat_type: Option<String>,
    pub end_repeat_date: Option<i64>,
    pub remaining_count: Option<i32>,
    pub content: String,
    pub tags: Vec<String>,
    pub category: Option<String>,
    pub is_done: bool,
    pub is_deleted: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateTodo {
    pub title: String,
    pub date: Option<i64>,
    pub repeat: String,
    pub end_repeat_type: Option<String>,
    pub end_repeat_date: Option<i64>,
    pub remaining_count: Option<i32>,
    pub content: String,
    pub tags: Vec<String>,
    pub category: Option<String>,
    pub is_done: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UpdateTodo {
    pub id: String,
    pub title: Option<String>,
    pub date: Option<i64>,
    pub repeat: Option<String>,
    pub end_repeat_type: Option<String>,
    pub end_repeat_date: Option<i64>,
    pub remaining_count: Option<i32>,
    pub content: Option<String>,
    pub tags: Option<Vec<String>>,
    pub category: Option<String>,
    pub is_done: Option<bool>,
    pub is_deleted: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub use_count: i32,
}

impl Todo {
    pub fn new(create_todo: CreateTodo) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title: create_todo.title,
            date: create_todo.date,
            repeat: create_todo.repeat,
            end_repeat_type: create_todo.end_repeat_type,
            end_repeat_date: create_todo.end_repeat_date,
            remaining_count: create_todo.remaining_count,
            content: create_todo.content,
            tags: create_todo.tags,
            category: create_todo.category,
            is_done: create_todo.is_done,
            is_deleted: false,
            created_at: now,
            updated_at: now,
        }
    }
}

impl Tag {
    pub fn new(name: String) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            created_at: now,
            use_count: 0, // 这个字段不会存储到数据库，只在查询时动态计算
        }
    }
}
