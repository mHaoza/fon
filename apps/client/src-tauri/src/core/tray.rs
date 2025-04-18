use anyhow::{Ok, Result};
use tauri::{
    menu::{MenuEvent, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Wry,
};

use crate::utils::resolve;

pub struct Tray {}

impl Tray {
    pub fn create_tray(app_handle: &AppHandle) -> Result<()> {
        let tray = TrayIconBuilder::new()
            .icon(app_handle.default_window_icon().unwrap().clone())
            .show_menu_on_left_click(false)
            .tooltip("Fon")
            .build(app_handle)?;

        tray.set_menu(Some(create_tray_menu(app_handle)?))?;

        tray.on_tray_icon_event(|_, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Down,
                ..
            } = event
            {
                resolve::create_main_window();
            }
        });

        tray.on_menu_event(on_menu_event);

        Ok(())
    }
}

fn create_tray_menu(app: &AppHandle) -> Result<tauri::menu::Menu<Wry>> {
    let quit = &MenuItem::with_id(app, "quit", "退出", true, Some("Quit the application")).unwrap();
    let menu = tauri::menu::MenuBuilder::new(app)
        .items(&[quit])
        .build()
        .unwrap();

    Ok(menu)
}

fn on_menu_event(app_handle: &AppHandle, event: MenuEvent) {
    match event.id.as_ref() {
        "quit" => {
            app_handle.exit(0);
        }
        _ => {}
    }
}
