use crate::database::todo::models::{Tag, Todo, UpdateTodo};
use rusqlite::{params, Connection, Result, Row};

pub struct TodoSchema;

impl TodoSchema {
    pub fn insert(conn: &Connection, todo: &Todo) -> Result<()> {
        conn.execute(
            "INSERT INTO todos (
                id, title, date, repeat, end_repeat_type, end_repeat_date, 
                remaining_count, content, category, is_done, is_deleted, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                todo.id,
                todo.title,
                todo.date,
                todo.repeat,
                todo.end_repeat_type,
                todo.end_repeat_date,
                todo.remaining_count,
                todo.content,
                todo.category,
                todo.is_done,
                todo.is_deleted,
                todo.created_at,
                todo.updated_at,
            ],
        )?;

        // 插入标签关联
        for tag_name in &todo.tags {
            Self::insert_todo_tag(conn, &todo.id, tag_name)?;
        }

        Ok(())
    }

    // 查除了已删除之外的所有的 todo
    pub fn find_todo_list(con: &Connection) -> Result<Vec<Todo>> {
        let mut stmt = con.prepare(
            "SELECT id, title, date, repeat, end_repeat_type, end_repeat_date, 
                    remaining_count, content, category, is_done, is_deleted, created_at, updated_at 
             FROM todos WHERE is_deleted = 0 ORDER BY created_at DESC",
        )?;

        let todo_iter = stmt.query_map([], |row| {
            let todo = Self::row_to_todo(row)?;
            Ok(todo)
        })?;

        let mut todos = Vec::new();
        for todo_result in todo_iter {
            let mut todo = todo_result?;
            // 获取标签
            todo.tags = Self::get_todo_tags(con, &todo.id)?;
            todos.push(todo);
        }

        Ok(todos)
    }

    // 根据标签筛选todo列表
    pub fn find_todo_list_by_tag(con: &Connection, tag_name: &str) -> Result<Vec<Todo>> {
        let mut stmt = con.prepare(
            "SELECT DISTINCT t.id, t.title, t.date, t.repeat, t.end_repeat_type, t.end_repeat_date, 
                    t.remaining_count, t.content, t.category, t.is_done, t.is_deleted, t.created_at, t.updated_at 
             FROM todos t
             INNER JOIN todo_tags tt ON t.id = tt.todo_id
             INNER JOIN tags tg ON tt.tag_id = tg.id
             WHERE t.is_deleted = 0 AND tg.name = ?
             ORDER BY t.created_at DESC",
        )?;

        let todo_iter = stmt.query_map(params![tag_name], |row| {
            let todo = Self::row_to_todo(row)?;
            Ok(todo)
        })?;

        let mut todos = Vec::new();
        for todo_result in todo_iter {
            let mut todo = todo_result?;
            // 获取标签
            todo.tags = Self::get_todo_tags(con, &todo.id)?;
            todos.push(todo);
        }

        Ok(todos)
    }

    pub fn find_by_id(conn: &Connection, id: &str) -> Result<Option<Todo>> {
        let mut stmt = conn.prepare(
            "SELECT id, title, date, repeat, end_repeat_type, end_repeat_date, 
                    remaining_count, content, category, is_done, is_deleted, created_at, updated_at 
             FROM todos WHERE id = ?",
        )?;

        let mut todo_iter = stmt.query_map(params![id], |row| {
            let todo = Self::row_to_todo(row)?;
            Ok(todo)
        })?;

        if let Some(todo_result) = todo_iter.next() {
            let mut todo = todo_result?;
            todo.tags = Self::get_todo_tags(conn, &todo.id)?;
            Ok(Some(todo))
        } else {
            Ok(None)
        }
    }

    pub fn update(conn: &Connection, update_todo: &UpdateTodo) -> Result<()> {
        let mut update_fields = Vec::new();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(title) = &update_todo.title {
            update_fields.push("title = ?");
            params.push(Box::new(title.clone()));
        }
        if let Some(date) = &update_todo.date {
            update_fields.push("date = ?");
            params.push(Box::new(*date));
        }
        if let Some(repeat) = &update_todo.repeat {
            update_fields.push("repeat = ?");
            params.push(Box::new(repeat.clone()));
        }
        if let Some(end_repeat_type) = &update_todo.end_repeat_type {
            update_fields.push("end_repeat_type = ?");
            params.push(Box::new(end_repeat_type.clone()));
        }
        if let Some(end_repeat_date) = &update_todo.end_repeat_date {
            update_fields.push("end_repeat_date = ?");
            params.push(Box::new(*end_repeat_date));
        }
        if let Some(remaining_count) = &update_todo.remaining_count {
            update_fields.push("remaining_count = ?");
            params.push(Box::new(*remaining_count));
        }
        if let Some(content) = &update_todo.content {
            update_fields.push("content = ?");
            params.push(Box::new(content.clone()));
        }
        if let Some(category) = &update_todo.category {
            update_fields.push("category = ?");
            params.push(Box::new(category.clone()));
        }
        if let Some(is_done) = &update_todo.is_done {
            update_fields.push("is_done = ?");
            params.push(Box::new(*is_done));
        }
        if let Some(is_deleted) = &update_todo.is_deleted {
            update_fields.push("is_deleted = ?");
            params.push(Box::new(*is_deleted));
        }

        if update_fields.is_empty() {
            return Ok(());
        }

        update_fields.push("updated_at = ?");
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        params.push(Box::new(now));

        let sql = format!("UPDATE todos SET {} WHERE id = ?", update_fields.join(", "));
        params.push(Box::new(update_todo.id.clone()));

        // 将 Box<dyn ToSql> 转换为 &dyn ToSql 的切片
        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();
        conn.execute(&sql, rusqlite::params_from_iter(param_refs))?;

        // 更新标签
        if let Some(tags) = &update_todo.tags {
            // 删除旧的标签关联
            conn.execute(
                "DELETE FROM todo_tags WHERE todo_id = ?",
                params![update_todo.id],
            )?;
            // 插入新的标签关联
            for tag_name in tags {
                Self::insert_todo_tag(conn, &update_todo.id, tag_name)?;
            }
        }

        Ok(())
    }

    pub fn delete(conn: &Connection, id: &str) -> Result<()> {
        conn.execute("DELETE FROM todos WHERE id = ?", params![id])?;
        Ok(())
    }

    fn row_to_todo(row: &Row) -> Result<Todo> {
        Ok(Todo {
            id: row.get(0)?,
            title: row.get(1)?,
            date: row.get(2)?,
            repeat: row.get(3)?,
            end_repeat_type: row.get(4)?,
            end_repeat_date: row.get(5)?,
            remaining_count: row.get(6)?,
            content: row.get(7)?,
            category: row.get(8)?,
            is_done: row.get(9)?,
            is_deleted: row.get(10)?,
            created_at: row.get(11)?,
            updated_at: row.get(12)?,
            tags: Vec::new(), // 将在外部填充
        })
    }

    fn insert_todo_tag(conn: &Connection, todo_id: &str, tag_name: &str) -> Result<()> {
        // 确保标签存在
        let tag_id = TagSchema::get_or_create_tag_id(conn, tag_name)?;

        // 插入关联
        conn.execute(
            "INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)",
            params![todo_id, tag_id],
        )?;

        Ok(())
    }

    fn get_todo_tags(conn: &Connection, todo_id: &str) -> Result<Vec<String>> {
        let mut stmt = conn.prepare(
            "SELECT t.name FROM tags t 
             INNER JOIN todo_tags tt ON t.id = tt.tag_id 
             WHERE tt.todo_id = ?",
        )?;

        let tag_iter = stmt.query_map(params![todo_id], |row| Ok(row.get(0)?))?;

        let mut tags = Vec::new();
        for tag_result in tag_iter {
            tags.push(tag_result?);
        }

        Ok(tags)
    }
}

pub struct TagSchema;

impl TagSchema {
    pub fn get_or_create_tag_id(conn: &Connection, tag_name: &str) -> Result<String> {
        // 先尝试查找现有标签
        let mut stmt = conn.prepare("SELECT id FROM tags WHERE name = ?")?;
        let mut rows = stmt.query(params![tag_name])?;

        if let Some(row) = rows.next()? {
            Ok(row.get(0)?)
        } else {
            // 创建新标签
            let tag = Tag::new(tag_name.to_string());
            conn.execute(
                "INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?)",
                params![tag.id, tag.name, tag.created_at],
            )?;
            Ok(tag.id)
        }
    }

    pub fn get_tag_list(conn: &Connection) -> Result<Vec<Tag>> {
        let mut stmt = conn.prepare(
            "SELECT t.id, t.name, t.created_at, COUNT(CASE WHEN td.is_deleted = 0 THEN tt.todo_id END) as use_count 
             FROM tags t 
             LEFT JOIN todo_tags tt ON t.id = tt.tag_id 
             LEFT JOIN todos td ON tt.todo_id = td.id 
             GROUP BY t.id, t.name, t.created_at 
             ORDER BY t.name"
        )?;
        
        let tag_iter = stmt.query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                use_count: row.get(3)?,
            })
        })?;

        let mut tags = Vec::new();
        for tag_result in tag_iter {
            tags.push(tag_result?);
        }

        Ok(tags)
    }
}
