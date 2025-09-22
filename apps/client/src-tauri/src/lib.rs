pub mod cmds;
pub mod core;
pub mod database;
pub mod feat;
pub mod utils;
use tauri::Manager;
use std::sync::Arc;

use crate::utils::resolve;
use crate::database::{Database, DatabaseState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app.get_webview_window("main")
                       .expect("no main window")
                       .set_focus();
        }))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {

            tauri::async_runtime::block_on(async move {
                // 初始化数据库
                let database = Database::new().await
                    .expect("Failed to initialize database");
                
                // 将数据库状态添加到应用管理中
                app.manage(DatabaseState {
                    db: Arc::new(database),
                });
                
                resolve::resolve_setup(app).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 注册web端调用rust端方法
            database::commands::init_database,
            database::commands::add_todo,
            database::commands::get_todo_list,
            database::commands::get_deleted_todo_list,
            database::commands::get_todo_by_id,
            database::commands::update_todo,
            database::commands::delete_todo,
            database::commands::permanently_delete_todo,
            database::commands::get_tag_list,
            database::commands::get_or_create_tag,
            database::commands::delete_tag,
        ]);

    let app = builder
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    // 拦截关闭事件，使应用最小化到托盘
    app.run(|app_handle, e| match e {
        tauri::RunEvent::ExitRequested { api, code, .. } => {
            if code.is_none() {
                api.prevent_exit();
                return;
            }
        }
        tauri::RunEvent::WindowEvent { label, event, .. } => {
            if label == "main" {
                match event {
                    tauri::WindowEvent::CloseRequested { api, .. } => {
                        api.prevent_close();

                        let window = app_handle.get_webview_window("main").unwrap();
                        let _ = window.hide();
                    }
                    _ => {}
                }
            }
        }
        _ => {}
    })
}
