use tauri::{App, LogicalPosition, LogicalSize, Manager, WindowEvent};

use crate::core::tab::{create_tab_internal, get_active_webviews};

use crate::core::layout::{get_window_scale_factor, set_webview_properties};

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
    let handle_clone = app.handle().clone();

    create_tab_internal(&handle_clone, "main", "https://v2.tauri.app", "Tauri")?;

    // 克隆到闭包中使用的 Window
    main_window.on_window_event(move |event| {
        if let WindowEvent::Resized(size) = event {
            // 与创建时保持一致的布局参数
            let sidebar_width = 200.0;
            let tabbar_height = 30.0;

            let active_webviews = get_active_webviews(&handle_clone, "main".to_string());

            let scale_factor = get_window_scale_factor(&handle_clone, "main").unwrap();

            // 调整当前活跃 WebView 的位置与大小
            for webview in active_webviews.iter() {
                // 定义位置和大小
                let position = LogicalPosition::new(sidebar_width, tabbar_height);
                let size = LogicalSize::new(
                    size.width as f64 / scale_factor - sidebar_width,
                    size.height as f64 / scale_factor - tabbar_height,
                );

                // 调用前面封装的函数设置属性
                set_webview_properties(webview, position, size);
            }
        }
    });

    Ok(())
}
