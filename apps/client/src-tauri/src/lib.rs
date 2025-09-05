pub mod cmds;
pub mod core;
pub mod database;
pub mod feat;
pub mod utils;
use std::sync::Arc;
use tauri::Manager;

use crate::database::Database;
use crate::utils::resolve;

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
            // 初始化数据库
            let app_handle = app.handle();
            let db = Database::new(&app_handle).expect("Failed to initialize database");
            let db = Arc::new(db);
            app.manage(db);

            tauri::async_runtime::block_on(async move {
                resolve::resolve_setup(app).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 注册web端调用rust端方法
            cmds::greet,
            cmds::add_todo,
            cmds::get_todo_list,
            cmds::get_todo_by_id,
            cmds::update_todo,
            cmds::delete_todo,
            cmds::get_tag_list,
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
