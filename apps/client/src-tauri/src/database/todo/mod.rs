use anyhow::Result;
use rbatis::RBatis;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;

pub mod repository;
pub use repository::TodoRepository;

/// 数据库实体 - Todo表
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TodoEntity {
    pub id: String,
    pub title: String,
    pub date: Option<i64>,
    pub repeat: String,
    pub end_repeat_type: Option<String>,
    pub end_repeat_date: Option<i64>,
    pub remaining_count: Option<i64>,
    pub content: String,
    pub category: Option<String>,
    pub is_done: i64,  // SQLite BOOLEAN 存储为 INTEGER
    pub is_deleted: i64,  // SQLite BOOLEAN 存储为 INTEGER
    pub created_at: i64,
    pub updated_at: i64,
}

/// 数据库实体 - Tag表
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagEntity {
    pub id: String,
    pub name: String,
    pub created_at: i64,
}

/// 数据库实体 - TodoTag关联表
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TodoTagEntity {
    pub todo_id: String,
    pub tag_id: String,
}

/// 业务模型 - Todo
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub date: Option<i64>,
    pub repeat: String,
    pub end_repeat_type: Option<String>,
    pub end_repeat_date: Option<i64>,
    pub remaining_count: Option<i64>,
    pub content: String,
    pub tags: Vec<String>,
    pub category: Option<String>,
    pub is_done: bool,
    pub is_deleted: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

/// 业务模型 - Tag
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub created_at: i64,
}

/// 创建Todo请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTodo {
    pub title: String,
    pub date: Option<i64>,
    pub repeat: String,
    pub end_repeat_type: Option<String>,
    pub end_repeat_date: Option<i64>,
    pub remaining_count: Option<i64>,
    pub content: String,
    pub tags: Vec<String>,
    pub category: Option<String>,
    pub is_done: bool,
    pub is_deleted: bool,
}

/// 更新Todo请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTodo {
    pub id: String,
    pub title: Option<String>,
    pub date: Option<i64>,
    pub repeat: Option<String>,
    pub end_repeat_type: Option<String>,
    pub end_repeat_date: Option<i64>,
    pub remaining_count: Option<i64>,
    pub content: Option<String>,
    pub tags: Option<Vec<String>>,
    pub category: Option<String>,
    pub is_done: Option<bool>,
    pub is_deleted: Option<bool>,
}

/// Todo列表查询参数
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TodoListQuery {
    /// 页码
    pub page: Option<u32>,
    /// 每页大小
    pub page_size: Option<u32>,
    /// 标签筛选，可以多个标签
    pub tags: Option<Vec<String>>,
    /// 分类筛选
    pub category: Option<String>,
    /// 完成状态筛选
    pub is_done: Option<bool>,
    /// 排序字段，可选值：created_at, updated_at, title, date
    pub sort_by: Option<String>,
    /// 排序方向，asc 或 desc，默认desc
    pub sort_order: Option<String>,
}

/// 分页结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TodoListResult {
    /// 数据列表
    pub data: Vec<Todo>,
    /// 总记录数
    pub total: u32,
    /// 当前页码
    pub page: u32,
    /// 每页大小
    pub page_size: u32,
    /// 总页数
    pub total_pages: u32,
}

impl Default for TodoListQuery {
    fn default() -> Self {
        Self {
            page: None,  // 不提供默认分页
            page_size: None,  // 不提供默认分页
            tags: None,
            category: None,
            is_done: None,
            sort_by: Some("created_at".to_string()),
            sort_order: Some("desc".to_string()),
        }
    }
}

impl Todo {
    /// 从实体和标签列表创建Todo业务模型
    pub fn from_entity_with_tags(entity: TodoEntity, tags: Vec<String>) -> Self {
        Self {
            id: entity.id,
            title: entity.title,
            date: entity.date,
            repeat: entity.repeat,
            end_repeat_type: entity.end_repeat_type,
            end_repeat_date: entity.end_repeat_date,
            remaining_count: entity.remaining_count,
            content: entity.content,
            tags,
            category: entity.category,
            is_done: entity.is_done != 0,
            is_deleted: entity.is_deleted != 0,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    }
    
    /// 转换为数据库实体
    pub fn to_entity(&self) -> TodoEntity {
        TodoEntity {
            id: self.id.clone(),
            title: self.title.clone(),
            date: self.date,
            repeat: self.repeat.clone(),
            end_repeat_type: self.end_repeat_type.clone(),
            end_repeat_date: self.end_repeat_date,
            remaining_count: self.remaining_count,
            content: self.content.clone(),
            category: self.category.clone(),
            is_done: if self.is_done { 1 } else { 0 },
            is_deleted: if self.is_deleted { 1 } else { 0 },
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

impl CreateTodo {
    /// 转换为Todo业务模型
    pub fn to_todo(self) -> Todo {
        let now = Utc::now().timestamp();
        Todo {
            id: Uuid::new_v4().to_string(),
            title: self.title,
            date: self.date,
            repeat: self.repeat,
            end_repeat_type: self.end_repeat_type,
            end_repeat_date: self.end_repeat_date,
            remaining_count: self.remaining_count,
            content: self.content,
            tags: self.tags,
            category: self.category,
            is_done: self.is_done,
            is_deleted: self.is_deleted,
            created_at: now,
            updated_at: now,
        }
    }
}

impl Tag {
    /// 从实体创建Tag业务模型
    pub fn from_entity(entity: TagEntity) -> Self {
        Self {
            id: entity.id,
            name: entity.name,
            created_at: entity.created_at,
        }
    }
    
    /// 转换为数据库实体
    pub fn to_entity(&self) -> TagEntity {
        TagEntity {
            id: self.id.clone(),
            name: self.name.clone(),
            created_at: self.created_at,
        }
    }
    
    /// 创建新Tag
    pub fn new(name: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            created_at: Utc::now().timestamp(),
        }
    }
}

/// 初始化数据库表
pub async fn init_tables(rb: &RBatis) -> Result<()> {
    // 创建todos表
    let create_todos_sql = r#"
        CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            date INTEGER,
            repeat TEXT NOT NULL DEFAULT 'never',
            end_repeat_type TEXT,
            end_repeat_date INTEGER,
            remaining_count INTEGER,
            content TEXT NOT NULL DEFAULT '',
            category TEXT,
            is_done INTEGER NOT NULL DEFAULT 0,
            is_deleted INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    "#;
    
    rb.exec(create_todos_sql, vec![]).await?;
    
    // 创建tags表
    let create_tags_sql = r#"
        CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            created_at INTEGER NOT NULL
        )
    "#;
    
    rb.exec(create_tags_sql, vec![]).await?;
    
    // 创建todo_tags关联表
    let create_todo_tags_sql = r#"
        CREATE TABLE IF NOT EXISTS todo_tags (
            todo_id TEXT NOT NULL,
            tag_id TEXT NOT NULL,
            PRIMARY KEY (todo_id, tag_id),
            FOREIGN KEY (todo_id) REFERENCES todos (id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
        )
    "#;
    
    rb.exec(create_todo_tags_sql, vec![]).await?;
    
    Ok(())
}