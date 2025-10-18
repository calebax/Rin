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

pub fn get_sidebar_width(window_label: &str) -> f64 {
    200.0
}
