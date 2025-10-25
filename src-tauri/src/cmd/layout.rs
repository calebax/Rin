use super::CmdResult;

use std::sync::{Arc, Mutex};
use tauri::{AppHandle, State};

use crate::core::layout::{get_sidebar_width, sidebar_manager};
use crate::core::tab::TabManager;

/// 对外暴露获取侧栏宽度
#[tauri::command]
pub async fn get_sidebar_width_cmd(_app: AppHandle, window_label: String) -> CmdResult<f64> {
    Ok(get_sidebar_width(&window_label))
}

#[tauri::command]
pub async fn set_sidebar_width_cmd(
    app: AppHandle,
    window_label: String,
    width: f64,
    tm: State<'_, Arc<Mutex<TabManager>>>,
) -> CmdResult<()> {
    sidebar_manager().update_width(&window_label, width);

    let tm = tm.lock().unwrap();
    tm.tab_resized(&app, &window_label);

    Ok(())
}
