use tauri::{AppHandle, LogicalPosition, LogicalSize, Manager, Webview};

/// 获取指定窗口的 scale factor
pub fn get_window_scale_factor(app: &AppHandle, window_label: &str) -> Option<f64> {
    app.get_window(window_label)
        .and_then(|w| w.scale_factor().ok())
}

pub fn set_webview_properties(
    view: &Webview,
    position: LogicalPosition<f64>,
    size: LogicalSize<f64>,
) {
    if let Err(e) = view.set_position(position) {
        eprintln!("[Webview:position] Failed to set view position: {}", e);
    }
    if let Err(e) = view.set_size(size) {
        eprintln!("[Webview:size] Failed to set view size: {}", e);
    }
}

pub fn get_sidebar_width(_window_label: &str) -> f64 {
    200.0
}

// 新增：对外暴露获取侧栏宽度的 Tauri 命令
#[tauri::command]
pub async fn get_sidebar_width_cmd(_app: AppHandle, window_label: String) -> Result<f64, String> {
    Ok(get_sidebar_width(&window_label))
}
