use anyhow::Result;
use tauri::State;
use std::sync::Arc;

use crate::database::{Database, todo::{Todo, Tag, CreateTodo, UpdateTodo, TodoListQuery, TodoListResult}};

/// 数据库状态管理
pub struct DatabaseState {
    pub db: Arc<Database>,
}

/// 初始化数据库命令
#[tauri::command]
pub async fn init_database() -> Result<(), String> {
    Database::new().await.map_err(|e| e.to_string())?;
    Ok(())
}

/// 添加Todo命令
#[tauri::command]
pub async fn add_todo(
    state: State<'_, DatabaseState>,
    create_todo: CreateTodo,
) -> Result<Todo, String> {
    let repo = state.db.todo_repository();
    repo.add_todo(create_todo).await.map_err(|e| e.to_string())
}

/// 获取Todo列表命令
#[tauri::command]
pub async fn get_todo_list(
    state: State<'_, DatabaseState>,
) -> Result<Vec<Todo>, String> {
    let repo = state.db.todo_repository();
    repo.get_todo_list().await.map_err(|e| e.to_string())
}

/// 带分页和筛选的获取Todo列表命令
#[tauri::command]
pub async fn get_todo_list_with_filter(
    state: State<'_, DatabaseState>,
    query: Option<TodoListQuery>,
) -> Result<TodoListResult, String> {
    let repo = state.db.todo_repository();
    let query = query.unwrap_or_default();
    repo.get_todo_list_with_filter(query).await.map_err(|e| e.to_string())
}

/// 根据ID获取Todo命令
#[tauri::command]
pub async fn get_todo_by_id(
    state: State<'_, DatabaseState>,
    id: String,
) -> Result<Option<Todo>, String> {
    let repo = state.db.todo_repository();
    repo.get_todo_by_id(&id).await.map_err(|e| e.to_string())
}

/// 更新Todo命令
#[tauri::command]
pub async fn update_todo(
    state: State<'_, DatabaseState>,
    update_todo: UpdateTodo,
) -> Result<(), String> {
    let repo = state.db.todo_repository();
    repo.update_todo(update_todo).await.map_err(|e| e.to_string())
}

/// 删除Todo命令（软删除）
#[tauri::command]
pub async fn delete_todo(
    state: State<'_, DatabaseState>,
    id: String,
) -> Result<(), String> {
    let repo = state.db.todo_repository();
    repo.delete_todo(&id).await.map_err(|e| e.to_string())
}

/// 永久删除Todo命令
#[tauri::command]
pub async fn permanently_delete_todo(
    state: State<'_, DatabaseState>,
    id: String,
) -> Result<(), String> {
    let repo = state.db.todo_repository();
    repo.permanently_delete_todo(&id).await.map_err(|e| e.to_string())
}

/// 获取标签列表命令
#[tauri::command]
pub async fn get_tag_list(
    state: State<'_, DatabaseState>,
) -> Result<Vec<Tag>, String> {
    let repo = state.db.todo_repository();
    repo.get_tag_list().await.map_err(|e| e.to_string())
}

/// 获取或创建标签命令
#[tauri::command]
pub async fn get_or_create_tag(
    state: State<'_, DatabaseState>,
    name: String,
) -> Result<Tag, String> {
    let repo = state.db.todo_repository();
    repo.get_or_create_tag(&name).await.map_err(|e| e.to_string())
}

/// 删除标签命令
#[tauri::command]
pub async fn delete_tag(
    state: State<'_, DatabaseState>,
    id: String,
) -> Result<(), String> {
    let repo = state.db.todo_repository();
    repo.delete_tag(&id).await.map_err(|e| e.to_string())
}