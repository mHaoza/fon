use crate::database::{
    todo::{CreateTodo, TodoRepository, UpdateTodo},
    Database,
};
use anyhow::Result;
use serde_json::Value;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub async fn add_todo(
    todo_data: CreateTodo,
    db: State<'_, Arc<Database>>,
) -> Result<Value, String> {
    let repository = TodoRepository::new(db.inner().clone());
    let todo = repository.add_todo(todo_data).map_err(|e| e.to_string())?;
    Ok(serde_json::to_value(todo).map_err(|e| e.to_string())?)
}

#[tauri::command]
pub async fn get_todo_list(db: State<'_, Arc<Database>>) -> Result<Value, String> {
    let repository = TodoRepository::new(db.inner().clone());
    let todos = repository.get_todo_list().map_err(|e| e.to_string())?;
    Ok(serde_json::to_value(todos).map_err(|e| e.to_string())?)
}

#[tauri::command]
pub async fn get_todo_by_id(id: String, db: State<'_, Arc<Database>>) -> Result<Value, String> {
    let repository = TodoRepository::new(db.inner().clone());
    let todo = repository.get_todo_by_id(&id).map_err(|e| e.to_string())?;
    Ok(serde_json::to_value(todo).map_err(|e| e.to_string())?)
}

#[tauri::command]
pub async fn update_todo(
    update_data: UpdateTodo,
    db: State<'_, Arc<Database>>,
) -> Result<(), String> {
    let repository = TodoRepository::new(db.inner().clone());
    repository
        .update_todo(update_data)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_todo(id: String, db: State<'_, Arc<Database>>) -> Result<(), String> {
    let repository = TodoRepository::new(db.inner().clone());
    repository.delete_todo(&id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_all_tags(db: State<'_, Arc<Database>>) -> Result<Value, String> {
    let repository = TodoRepository::new(db.inner().clone());
    let tags = repository.get_all_tags().map_err(|e| e.to_string())?;
    Ok(serde_json::to_value(tags).map_err(|e| e.to_string())?)
}
