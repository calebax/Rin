use tauri::{App, Manager, WindowEvent};

use crate::core::tab::{create_tab_internal, tab_resized};

/// setup
pub fn init(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    if cfg!(debug_assertions) {
        app.handle().plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )?;
    }

    let main_window = app.get_window("main").unwrap();
    let window_label = main_window.label().to_string();
    let handle_clone = app.handle().clone();

    create_tab_internal(
        &handle_clone,
        &window_label,
        "https://v2.tauri.app",
        "Tauri",
    )?;

    main_window.on_window_event(move |event| {
        if let WindowEvent::Resized(size) = event {
            tab_resized(&handle_clone, &window_label);
        }
    });

    Ok(())
}
