use anyhow::Result;
use rbatis::RBatis;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;

use super::pagination::{PaginationFilter, FilterBuilder, PaginationQuery, PaginationResult};

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
    /// 分页参数
    #[serde(flatten)]
    pub pagination: PaginationQuery,
    /// 标签筛选，可以多个标签
    pub tags: Option<Vec<String>>,
    /// 分类筛选
    pub category: Option<String>,
    /// 完成状态筛选
    pub is_done: Option<bool>,
}

/// Todo分页结果
pub type TodoListResult = PaginationResult<Todo>;

/// Todo分页筛选器
pub struct TodoPaginationFilter {
    pub tags: Option<Vec<String>>,
    pub category: Option<String>,
    pub is_done: Option<bool>,
}

/// 已删除Todo分页筛选器
pub struct DeletedTodoPaginationFilter {
    pub tags: Option<Vec<String>>,
    pub category: Option<String>,
    pub is_done: Option<bool>,
}

impl PaginationFilter for TodoPaginationFilter {
    fn table_name(&self) -> &str {
        "todos"
    }
    
    fn primary_key(&self) -> &str {
        "id"
    }
    
    fn build_filter(&self) -> FilterBuilder {
        let mut builder = FilterBuilder::new()
            .eq("is_deleted", 0); // 默认只查询未删除的记录
        
        if let Some(category) = &self.category {
            builder = builder.eq("category", category.as_str());
        }
        
        if let Some(is_done) = self.is_done {
            builder = builder.eq("is_done", if is_done { 1 } else { 0 });
        }
        
        // 标签筛选需要特殊处理，因为涉及多表关联
        if let Some(tags) = &self.tags {
            if !tags.is_empty() {
                // 这里我们使用子查询来处理标签筛选
                let placeholders = tags.iter().map(|_| "?").collect::<Vec<_>>().join(",");
                let subquery = format!(
                    "id IN (SELECT DISTINCT todo_id FROM todo_tags tt 
                     INNER JOIN tags t ON tt.tag_id = t.id 
                     WHERE t.name IN ({}))",
                    placeholders
                );
                builder = builder.custom(subquery, tags.clone());
            }
        }
        
        builder
    }
    
    fn valid_sort_fields(&self) -> Vec<&str> {
        vec!["created_at", "updated_at", "title", "date"]
    }
    
    fn default_sort_field(&self) -> &str {
        "created_at"
    }
}

impl PaginationFilter for DeletedTodoPaginationFilter {
    fn table_name(&self) -> &str {
        "todos"
    }
    
    fn primary_key(&self) -> &str {
        "id"
    }
    
    fn build_filter(&self) -> FilterBuilder {
        let mut builder = FilterBuilder::new()
            .eq("is_deleted", 1); // 只查询已删除的记录
        
        if let Some(category) = &self.category {
            builder = builder.eq("category", category.as_str());
        }
        
        if let Some(is_done) = self.is_done {
            builder = builder.eq("is_done", if is_done { 1 } else { 0 });
        }
        
        // 标签筛选需要特殊处理，因为涉及多表关联
        if let Some(tags) = &self.tags {
            if !tags.is_empty() {
                // 这里我们使用子查询来处理标签筛选
                let placeholders = tags.iter().map(|_| "?").collect::<Vec<_>>().join(",");
                let subquery = format!(
                    "id IN (SELECT DISTINCT todo_id FROM todo_tags tt 
                     INNER JOIN tags t ON tt.tag_id = t.id 
                     WHERE t.name IN ({}))",
                    placeholders
                );
                builder = builder.custom(subquery, tags.clone());
            }
        }
        
        builder
    }
    
    fn valid_sort_fields(&self) -> Vec<&str> {
        vec!["created_at", "updated_at", "title", "date"]
    }
    
    fn default_sort_field(&self) -> &str {
        "created_at"
    }
}

impl Default for TodoListQuery {
    fn default() -> Self {
        Self {
            pagination: PaginationQuery::default(),
            tags: None,
            category: None,
            is_done: None,
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