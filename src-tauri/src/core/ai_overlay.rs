use crate::core::layout::{get_sidebar_width, get_window_scale_factor, set_window_properties};
use tauri::{AppHandle, Manager};

const TAB_MARGIN: f64 = 10.0;
const MARGIN: f64 = 12.0;
const MAX_WIDTH: f64 = 960.0;
const HEIGHT: f64 = 100.0;

pub fn overlay_resized(app: &AppHandle, window_label: &str) {
    let overlay_label = format!("{}-ai-overlay", window_label);
    let window = app.get_window(window_label).unwrap();
    // 计算位置和尺寸
    let window_position = window.inner_position().unwrap();
    let window_size = window.inner_size().unwrap();
    let scale_factor = get_window_scale_factor(app, window_label).unwrap();

    let sidebar = get_sidebar_width(window_label);
    let screen_width = window_size.width as f64 / scale_factor;

    let overlay_width = (screen_width - sidebar - 2.0 * (MARGIN + TAB_MARGIN)).min(MAX_WIDTH);
    let x = window_position.x as f64 / scale_factor
        + sidebar
        + TAB_MARGIN
        + MARGIN
        + (screen_width - sidebar - 2.0 * (MARGIN + TAB_MARGIN) - overlay_width) / 2.0;
    let y = window_position.y as f64 / scale_factor + window_size.height as f64 / scale_factor
        - HEIGHT
        - MARGIN;
    let position = tauri::LogicalPosition::new(x, y);
    let size = tauri::LogicalSize::new(overlay_width, HEIGHT);

    let overlay_window = window.get_window(&overlay_label).unwrap();

    set_window_properties(&overlay_window, position, size);
}
