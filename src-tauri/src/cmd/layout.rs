use super::CmdResult;
use crate::core::layout::get_sidebar_width;
use tauri::AppHandle;

/// 对外暴露获取侧栏宽度
#[tauri::command]
pub async fn get_sidebar_width_cmd(_app: AppHandle, window_label: String) -> CmdResult<f64> {
    Ok(get_sidebar_width(&window_label))
}
