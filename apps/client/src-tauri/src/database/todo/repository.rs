use std::sync::Arc;
use anyhow::Result;
use rbatis::RBatis;
use rbs::value;
use chrono::Utc;

use super::{Todo, Tag, CreateTodo, UpdateTodo, TodoEntity, TagEntity, TodoListQuery, TodoListResult};

/// Todo数据访问层
pub struct TodoRepository {
    rb: Arc<RBatis>,
}

impl TodoRepository {
    /// 创建新的TodoRepository实例
    pub fn new(rb: Arc<RBatis>) -> Self {
        Self { rb }
    }
    
    /// 添加新的Todo
    pub async fn add_todo(&self, create_todo: CreateTodo) -> Result<Todo> {
        let todo = create_todo.to_todo();
        let entity = todo.to_entity();
        
        // 插入todo记录
        let sql = r#"
            INSERT INTO todos (id, title, date, repeat, end_repeat_type, end_repeat_date, 
                             remaining_count, content, category, is_done, is_deleted, 
                             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;
        
        self.rb.exec(sql, vec![
            value!(entity.id),
            value!(entity.title),
            value!(entity.date),
            value!(entity.repeat),
            value!(entity.end_repeat_type),
            value!(entity.end_repeat_date),
            value!(entity.remaining_count),
            value!(entity.content),
            value!(entity.category),
            value!(entity.is_done),
            value!(entity.is_deleted),
            value!(entity.created_at),
            value!(entity.updated_at),
        ]).await?;
        
        // 处理标签
        self.sync_todo_tags(&todo.id, &todo.tags).await?;
        
        Ok(todo)
    }
    
    /// 获取Todo列表
    pub async fn get_todo_list(&self) -> Result<Vec<Todo>> {
        let sql = "SELECT * FROM todos WHERE is_deleted = 0 ORDER BY created_at DESC";
        let entities: Vec<TodoEntity> = self.rb.query_decode(sql, vec![]).await?;
        
        let mut todos = Vec::new();
        for entity in entities {
            let tags = self.get_todo_tags(&entity.id).await?;
            todos.push(Todo::from_entity_with_tags(entity, tags));
        }
        
        Ok(todos)
    }
    
    /// 带分页和筛选的获取Todo列表
    pub async fn get_todo_list_with_filter(&self, query: TodoListQuery) -> Result<TodoListResult> {
        // 判断是否需要分页
        let use_pagination = query.page.is_some() || query.page_size.is_some();
        
        let sort_by = query.sort_by.unwrap_or_else(|| "created_at".to_string());
        let sort_order = query.sort_order.unwrap_or_else(|| "desc".to_string());
        
        // 验证排序字段
        let valid_sort_fields = ["created_at", "updated_at", "title", "date", "is_done"];
        let sort_field = if valid_sort_fields.contains(&sort_by.as_str()) {
            sort_by
        } else {
            "created_at".to_string()
        };
        
        // 验证排序方向
        let order = if sort_order.to_lowercase() == "asc" { "ASC" } else { "DESC" };
        
        // 构建基础查询条件
        let mut where_clauses = vec!["t.is_deleted = 0"];
        let mut params = Vec::new();
        
        // 添加完成状态筛选
        if let Some(is_done) = query.is_done {
            where_clauses.push("t.is_done = ?");
            params.push(value!(if is_done { 1 } else { 0 }));
        }
        
        // 添加分类筛选
        if let Some(category) = &query.category {
            where_clauses.push("t.category = ?");
            params.push(value!(category));
        }
        
        // 构建标签筛选查询
        let (main_sql_base, count_sql) = if let Some(tags) = &query.tags {
            if !tags.is_empty() {
                // 使用标签筛选的查询
                let tag_placeholders = tags.iter().map(|_| "?").collect::<Vec<_>>().join(",");
                for tag in tags {
                    params.push(value!(tag));
                }
                
                let where_clause = where_clauses.join(" AND ");
                
                let main_sql_base = format!(
                    r#"
                    SELECT DISTINCT t.* FROM todos t
                    INNER JOIN todo_tags tt ON t.id = tt.todo_id
                    INNER JOIN tags tag ON tt.tag_id = tag.id
                    WHERE {} AND tag.name IN ({})
                    GROUP BY t.id
                    HAVING COUNT(DISTINCT tag.name) = ?
                    ORDER BY t.{} {}
                    "#,
                    where_clause, tag_placeholders, sort_field, order
                );
                
                let count_sql = format!(
                    r#"
                    SELECT COUNT(DISTINCT t.id) as count FROM todos t
                    INNER JOIN todo_tags tt ON t.id = tt.todo_id
                    INNER JOIN tags tag ON tt.tag_id = tag.id
                    WHERE {} AND tag.name IN ({})
                    GROUP BY t.id
                    HAVING COUNT(DISTINCT tag.name) = ?
                    "#,
                    where_clause, tag_placeholders
                );
                
                (main_sql_base, count_sql)
            } else {
                // 没有标签筛选的普通查询
                let where_clause = where_clauses.join(" AND ");
                
                let main_sql_base = format!(
                    "SELECT t.* FROM todos t WHERE {} ORDER BY t.{} {}",
                    where_clause, sort_field, order
                );
                
                let count_sql = format!(
                    "SELECT COUNT(*) as count FROM todos t WHERE {}",
                    where_clause
                );
                
                (main_sql_base, count_sql)
            }
        } else {
            // 没有标签筛选的普通查询
            let where_clause = where_clauses.join(" AND ");
            
            let main_sql_base = format!(
                "SELECT t.* FROM todos t WHERE {} ORDER BY t.{} {}",
                where_clause, sort_field, order
            );
            
            let count_sql = format!(
                "SELECT COUNT(*) as count FROM todos t WHERE {}",
                where_clause
            );
            
            (main_sql_base, count_sql)
        };
        
        // 执行总数查询
        let mut count_params = params.clone();
        if let Some(tags) = &query.tags {
            if !tags.is_empty() {
                count_params.push(value!(tags.len() as i64));
            }
        }
        
        let count_result: Vec<serde_json::Value> = self.rb.query_decode(&count_sql, count_params).await?;
        let total = if let Some(tags) = &query.tags {
            if !tags.is_empty() {
                // 对于标签筛选，需要计算符合条件的组数
                count_result.len() as u32
            } else {
                count_result.first()
                    .and_then(|row| row.get("count"))
                    .and_then(|v| v.as_i64())
                    .unwrap_or(0) as u32
            }
        } else {
            count_result.first()
                .and_then(|row| row.get("count"))
                .and_then(|v| v.as_i64())
                .unwrap_or(0) as u32
        };
        
        // 构建最终的查询SQL
        let (main_sql, page, page_size, total_pages) = if use_pagination {
            // 使用分页
            let page = query.page.unwrap_or(1).max(1);
            let page_size = query.page_size.unwrap_or(20).min(100).max(1); // 限制最大100
            
            let main_sql = format!("{} LIMIT ? OFFSET ?", main_sql_base);
            let total_pages = if total == 0 { 1 } else { (total + page_size - 1) / page_size };
            
            (main_sql, page, page_size, total_pages)
        } else {
            // 不分页，查询所有数据
            (main_sql_base, 1, total, 1)
        };
        
        // 执行主查询
        if let Some(tags) = &query.tags {
            if !tags.is_empty() {
                params.push(value!(tags.len() as i64));
            }
        }
        
        if use_pagination {
            let page_size_for_query = if use_pagination { query.page_size.unwrap_or(20) } else { total };
            let offset = if use_pagination { (query.page.unwrap_or(1) - 1) * page_size_for_query } else { 0 };
            params.push(value!(page_size_for_query));
            params.push(value!(offset));
        }
        
        let entities: Vec<TodoEntity> = self.rb.query_decode(&main_sql, params).await?;
        
        // 获取每个Todo的标签
        let mut todos = Vec::new();
        for entity in entities {
            let tags = self.get_todo_tags(&entity.id).await?;
            todos.push(Todo::from_entity_with_tags(entity, tags));
        }
        
        Ok(TodoListResult {
            data: todos,
            total,
            page,
            page_size,
            total_pages,
        })
    }
    
    /// 根据ID获取Todo
    pub async fn get_todo_by_id(&self, id: &str) -> Result<Option<Todo>> {
        let sql = "SELECT * FROM todos WHERE id = ? AND is_deleted = 0";
        let entities: Vec<TodoEntity> = self.rb.query_decode(sql, vec![value!(id)]).await?;
        
        if let Some(entity) = entities.into_iter().next() {
            let tags = self.get_todo_tags(&entity.id).await?;
            Ok(Some(Todo::from_entity_with_tags(entity, tags)))
        } else {
            Ok(None)
        }
    }
    
    /// 更新Todo
    pub async fn update_todo(&self, update_todo: UpdateTodo) -> Result<()> {
        let todo_id = update_todo.id.clone();
        let mut set_clauses = Vec::new();
        let mut params = Vec::new();
        
        if let Some(title) = &update_todo.title {
            set_clauses.push("title = ?");
            params.push(value!(title));
        }
        if let Some(date) = update_todo.date {
            set_clauses.push("date = ?");
            params.push(value!(date));
        }
        if let Some(repeat) = &update_todo.repeat {
            set_clauses.push("repeat = ?");
            params.push(value!(repeat));
        }
        if let Some(end_repeat_type) = &update_todo.end_repeat_type {
            set_clauses.push("end_repeat_type = ?");
            params.push(value!(end_repeat_type));
        }
        if let Some(end_repeat_date) = update_todo.end_repeat_date {
            set_clauses.push("end_repeat_date = ?");
            params.push(value!(end_repeat_date));
        }
        if let Some(remaining_count) = update_todo.remaining_count {
            set_clauses.push("remaining_count = ?");
            params.push(value!(remaining_count));
        }
        if let Some(content) = &update_todo.content {
            set_clauses.push("content = ?");
            params.push(value!(content));
        }
        if let Some(category) = &update_todo.category {
            set_clauses.push("category = ?");
            params.push(value!(category));
        }
        if let Some(is_done) = update_todo.is_done {
            set_clauses.push("is_done = ?");
            params.push(value!(if is_done { 1 } else { 0 }));
        }
        if let Some(is_deleted) = update_todo.is_deleted {
            set_clauses.push("is_deleted = ?");
            params.push(value!(if is_deleted { 1 } else { 0 }));
        }
        
        if !set_clauses.is_empty() {
            // 总是更新 updated_at
            set_clauses.push("updated_at = ?");
            params.push(value!(Utc::now().timestamp()));
            
            let sql = format!("UPDATE todos SET {} WHERE id = ?", set_clauses.join(", "));
            params.push(value!(&todo_id));
            
            self.rb.exec(&sql, params).await?;
        }
        
        // 更新标签关联
        if let Some(tags) = update_todo.tags {
            self.sync_todo_tags(&todo_id, &tags).await?;
        }
        
        Ok(())
    }
    
    /// 删除Todo（软删除）
    pub async fn delete_todo(&self, id: &str) -> Result<()> {
        let sql = "UPDATE todos SET is_deleted = 1, updated_at = ? WHERE id = ?";
        self.rb.exec(sql, vec![
            value!(Utc::now().timestamp()),
            value!(id)
        ]).await?;
        
        Ok(())
    }
    
    /// 永久删除Todo
    pub async fn permanently_delete_todo(&self, id: &str) -> Result<()> {
        // 先删除关联的标签
        let delete_tags_sql = "DELETE FROM todo_tags WHERE todo_id = ?";
        self.rb.exec(delete_tags_sql, vec![value!(id)]).await?;
        
        // 删除todo记录
        let delete_todo_sql = "DELETE FROM todos WHERE id = ?";
        self.rb.exec(delete_todo_sql, vec![value!(id)]).await?;
        
        Ok(())
    }
    
    /// 获取标签列表
    pub async fn get_tag_list(&self) -> Result<Vec<Tag>> {
        let sql = "SELECT * FROM tags ORDER BY name ASC";
        let entities: Vec<TagEntity> = self.rb.query_decode(sql, vec![]).await?;
        
        Ok(entities.into_iter().map(Tag::from_entity).collect())
    }
    
    /// 根据名称获取或创建标签
    pub async fn get_or_create_tag(&self, name: &str) -> Result<Tag> {
        // 先尝试查找现有标签
        let sql = "SELECT * FROM tags WHERE name = ?";
        let entities: Vec<TagEntity> = self.rb.query_decode(sql, vec![value!(name)]).await?;
        
        if let Some(entity) = entities.into_iter().next() {
            Ok(Tag::from_entity(entity))
        } else {
            // 创建新标签
            let tag = Tag::new(name.to_string());
            let entity = tag.to_entity();
            
            let insert_sql = "INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?)";
            self.rb.exec(insert_sql, vec![
                value!(entity.id),
                value!(entity.name),
                value!(entity.created_at),
            ]).await?;
            
            Ok(tag)
        }
    }
    
    /// 删除标签
    pub async fn delete_tag(&self, id: &str) -> Result<()> {
        // 先删除所有使用该标签的关联
        let delete_todo_tags_sql = "DELETE FROM todo_tags WHERE tag_id = ?";
        self.rb.exec(delete_todo_tags_sql, vec![value!(id)]).await?;
        
        // 删除标签
        let delete_tag_sql = "DELETE FROM tags WHERE id = ?";
        self.rb.exec(delete_tag_sql, vec![value!(id)]).await?;
        
        Ok(())
    }
    
    /// 获取Todo的标签列表
    async fn get_todo_tags(&self, todo_id: &str) -> Result<Vec<String>> {
        let sql = r#"
            SELECT t.name FROM tags t
            INNER JOIN todo_tags tt ON t.id = tt.tag_id
            WHERE tt.todo_id = ?
            ORDER BY t.name ASC
        "#;
        
        let rows: Vec<serde_json::Value> = self.rb.query_decode(sql, vec![value!(todo_id)]).await?;
        let tags: Vec<String> = rows.into_iter()
            .filter_map(|row| row.get("name").and_then(|v| v.as_str()).map(|s| s.to_string()))
            .collect();
        
        Ok(tags)
    }
    
    /// 同步Todo的标签关联
    async fn sync_todo_tags(&self, todo_id: &str, tags: &[String]) -> Result<()> {
        // 删除现有的标签关联
        let delete_sql = "DELETE FROM todo_tags WHERE todo_id = ?";
        self.rb.exec(delete_sql, vec![value!(todo_id)]).await?;
        
        // 添加新的标签关联
        for tag_name in tags {
            let tag = self.get_or_create_tag(tag_name).await?;
            
            let insert_sql = "INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)";
            self.rb.exec(insert_sql, vec![
                value!(todo_id),
                value!(tag.id),
            ]).await?;
        }
        
        Ok(())
    }
}