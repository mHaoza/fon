use crate::database::todo::schema::{TagSchema, TodoSchema};
use crate::database::{
    todo::{CreateTodo, Todo, UpdateTodo},
    Database,
};
use anyhow::Result;
use std::sync::Arc;

pub struct TodoRepository {
    db: Arc<Database>,
}

impl TodoRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn add_todo(&self, create_todo: CreateTodo) -> Result<Todo> {
        let todo = Todo::new(create_todo);
        let conn = self.db.get_connection();
        TodoSchema::insert(&conn, &todo)?;
        Ok(todo)
    }

    pub fn get_all_todos(&self) -> Result<Vec<Todo>> {
        let conn = self.db.get_connection();
        let todos = TodoSchema::find_all(&conn)?;
        Ok(todos)
    }

    pub fn get_todo_by_id(&self, id: &str) -> Result<Option<Todo>> {
        let conn = self.db.get_connection();
        let todo = TodoSchema::find_by_id(&conn, id)?;
        Ok(todo)
    }

    pub fn update_todo(&self, update_todo: UpdateTodo) -> Result<()> {
        let conn = self.db.get_connection();
        TodoSchema::update(&conn, &update_todo)?;
        Ok(())
    }

    pub fn delete_todo(&self, id: &str) -> Result<()> {
        let conn = self.db.get_connection();
        TodoSchema::delete(&conn, id)?;
        Ok(())
    }

    pub fn get_all_tags(&self) -> Result<Vec<String>> {
        let conn = self.db.get_connection();
        let tags = TagSchema::get_all_tags(&conn)?;
        Ok(tags)
    }
}
