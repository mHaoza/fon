use tauri::{App, Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, ShortcutState};

use crate::core::{handle, tray};

pub async fn resolve_setup(app: &mut App) {
    let app_handle = app.app_handle();
    let _ = tray::Tray::create_tray(app_handle);
    handle::Handle::global().init(app.app_handle());

    create_main_window();
    register_shortcuts();
}

/** 注册全局快捷键 */
fn register_shortcuts() {
    let app_handle = handle::Handle::global().app_handle().unwrap();
    
    // Alt+Shift+O 切换显示/隐藏主窗口
    let _ = app_handle.global_shortcut().on_shortcut(
        "alt+shift+o",
        move |_app_handle, hotkey, event| {
            if event.state == ShortcutState::Pressed && hotkey.key == Code::KeyO {
                toggle_main_window();
            }
        },
    );

    // ESC 隐藏主窗口（仅当窗口聚焦时）
    let _ = app_handle.global_shortcut().on_shortcut(
        "Escape",
        move |_app_handle, hotkey, event| {
            if event.state == ShortcutState::Pressed && hotkey.key == Code::Escape {
                hide_main_window_if_focused();
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

/** 如果主窗口聚焦则隐藏 */
pub fn hide_main_window_if_focused() {
    let app_handle = handle::Handle::global().app_handle().unwrap();
    
    if let Some(window) = app_handle.get_webview_window("main") {
        if window.is_focused().unwrap_or(false) {
            let _ = window.hide();
        }
    }
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
            tauri::WebviewUrl::App("/main/todo/all".into()),
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
