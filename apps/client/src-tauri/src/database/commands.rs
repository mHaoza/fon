use anyhow::Result;
use tauri::State;
use std::sync::Arc;

use crate::database::{Database, ApiResponse, todo::{Todo, Tag, CreateTodo, UpdateTodo, TodoListQuery, TodoListResult}};

/// 数据库状态管理
pub struct DatabaseState {
    pub db: Arc<Database>,
}

/// 初始化数据库命令
#[tauri::command]
pub async fn init_database() -> Result<ApiResponse<()>, String> {
    match Database::new().await {
        Ok(_) => Ok(ApiResponse::success(())),
        Err(e) => Ok(ApiResponse::internal_error(format!("初始化数据库失败: {}", e)))
    }
}

/// 添加Todo命令
#[tauri::command]
pub async fn add_todo(
    state: State<'_, DatabaseState>,
    create_todo: CreateTodo,
) -> Result<ApiResponse<Todo>, String> {
    let repo = state.db.todo_repository();
    match repo.add_todo(create_todo).await {
        Ok(todo) => Ok(ApiResponse::success_with_message(todo, "待办事项添加成功".to_string())),
        Err(e) => Ok(ApiResponse::internal_error(format!("添加待办事项失败: {}", e)))
    }
}

/// 获取Todo列表命令
#[tauri::command]
pub async fn get_todo_list(
    state: State<'_, DatabaseState>,
) -> Result<ApiResponse<Vec<Todo>>, String> {
    let repo = state.db.todo_repository();
    match repo.get_todo_list().await {
        Ok(todos) => Ok(ApiResponse::success(todos)),
        Err(e) => Ok(ApiResponse::internal_error(format!("获取待办事项列表失败: {}", e)))
    }
}

/// 带分页和筛选的获取Todo列表命令
#[tauri::command]
pub async fn get_todo_list_with_filter(
    state: State<'_, DatabaseState>,
    query: Option<TodoListQuery>,
) -> Result<ApiResponse<TodoListResult>, String> {
    let repo = state.db.todo_repository();
    let query = query.unwrap_or_default();
    match repo.get_todo_list_with_filter(query).await {
        Ok(result) => Ok(ApiResponse::success(result)),
        Err(e) => Ok(ApiResponse::internal_error(format!("获取待办事项列表失败: {}", e)))
    }
}

/// 根据ID获取Todo命令
#[tauri::command]
pub async fn get_todo_by_id(
    state: State<'_, DatabaseState>,
    id: String,
) -> Result<ApiResponse<Option<Todo>>, String> {
    let repo = state.db.todo_repository();
    match repo.get_todo_by_id(&id).await {
        Ok(todo) => Ok(ApiResponse::success(todo)),
        Err(e) => Ok(ApiResponse::internal_error(format!("获取待办事项失败: {}", e)))
    }
}

/// 更新Todo命令
#[tauri::command]
pub async fn update_todo(
    state: State<'_, DatabaseState>,
    update_todo: UpdateTodo,
) -> Result<ApiResponse<()>, String> {
    let repo = state.db.todo_repository();
    match repo.update_todo(update_todo).await {
        Ok(_) => Ok(ApiResponse::success_with_message((), "待办事项更新成功".to_string())),
        Err(e) => Ok(ApiResponse::internal_error(format!("更新待办事项失败: {}", e)))
    }
}

/// 删除Todo命令（软删除）
#[tauri::command]
pub async fn delete_todo(
    state: State<'_, DatabaseState>,
    id: String,
) -> Result<ApiResponse<()>, String> {
    let repo = state.db.todo_repository();
    match repo.delete_todo(&id).await {
        Ok(_) => Ok(ApiResponse::success_with_message((), "待办事项删除成功".to_string())),
        Err(e) => Ok(ApiResponse::internal_error(format!("删除待办事项失败: {}", e)))
    }
}

/// 永久删除Todo命令
#[tauri::command]
pub async fn permanently_delete_todo(
    state: State<'_, DatabaseState>,
    id: String,
) -> Result<ApiResponse<()>, String> {
    let repo = state.db.todo_repository();
    match repo.permanently_delete_todo(&id).await {
        Ok(_) => Ok(ApiResponse::success_with_message((), "待办事项永久删除成功".to_string())),
        Err(e) => Ok(ApiResponse::internal_error(format!("永久删除待办事项失败: {}", e)))
    }
}

/// 获取标签列表命令
#[tauri::command]
pub async fn get_tag_list(
    state: State<'_, DatabaseState>,
) -> Result<ApiResponse<Vec<Tag>>, String> {
    let repo = state.db.todo_repository();
    match repo.get_tag_list().await {
        Ok(tags) => Ok(ApiResponse::success(tags)),
        Err(e) => Ok(ApiResponse::internal_error(format!("获取标签列表失败: {}", e)))
    }
}

/// 获取或创建标签命令
#[tauri::command]
pub async fn get_or_create_tag(
    state: State<'_, DatabaseState>,
    name: String,
) -> Result<ApiResponse<Tag>, String> {
    let repo = state.db.todo_repository();
    match repo.get_or_create_tag(&name).await {
        Ok(tag) => Ok(ApiResponse::success_with_message(tag, "标签获取或创建成功".to_string())),
        Err(e) => Ok(ApiResponse::internal_error(format!("获取或创建标签失败: {}", e)))
    }
}

/// 删除标签命令
#[tauri::command]
pub async fn delete_tag(
    state: State<'_, DatabaseState>,
    id: String,
) -> Result<ApiResponse<()>, String> {
    let repo = state.db.todo_repository();
    match repo.delete_tag(&id).await {
        Ok(_) => Ok(ApiResponse::success_with_message((), "标签删除成功".to_string())),
        Err(e) => Ok(ApiResponse::internal_error(format!("删除标签失败: {}", e)))
    }
}