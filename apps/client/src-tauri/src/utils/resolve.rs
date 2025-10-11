use tauri::{App, Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, ShortcutState};

use crate::core::{handle, tray};

pub async fn resolve_setup(app: &mut App) {
    let app_handle = app.app_handle();
    let _ = tray::Tray::create_tray(app_handle);
    handle::Handle::global().init(app.app_handle());

    create_main_window();

    let app_handle = handle::Handle::global().app_handle().unwrap();
    let _ = app_handle.global_shortcut().on_shortcut(
        "alt+shift+o",
        move |_app_handle, hotkey, event| {
            if event.state == ShortcutState::Pressed {
                if hotkey.key == Code::KeyO {
                    toggle_main_window();
                }
            }
        },
    );
}

pub fn toggle_main_window() {
    let app_handle = handle::Handle::global().app_handle().unwrap();

    if let Some(window) = app_handle.get_webview_window("main") {
        if window.is_focused().unwrap_or(false) {
            let _ = window.hide();
            return
        }
    }

    create_main_window();
}

/** 创建主窗口 */
pub fn create_main_window() {
    let app_handle = handle::Handle::global().app_handle().unwrap();

    if let Some(window) = app_handle.get_webview_window("main") {
        if window.is_minimized().unwrap_or(false) {
            let _ = window.unminimize();
        }
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.emit("show", ());
        return;
    };

    tauri::async_runtime::spawn(async move {
        let window = tauri::WebviewWindowBuilder::new(
            &app_handle,
            "main",
            tauri::WebviewUrl::App("/main".into()),
        )
        .title("main") // 窗口标题
        .inner_size(1200.0, 800.0) // 窗口大小
        // .min_inner_size(900.0, 700.0) // 最小窗口大小
        .decorations(false) // 是否有边框
        .maximizable(true) // 最大化
        .transparent(true) // 透明
        .visible(false)
        .shadow(true)
        .build()
        .unwrap();

        let _ = window.show();
        let _ = window.set_focus();
    });
}
