use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};

use tauri::{
    webview::DownloadEvent, App, LogicalPosition, LogicalSize, Manager, WebviewBuilder, WebviewUrl,
    WindowBuilder, WindowEvent,
};

use crate::core::setup;
use crate::core::tab::get_active_webviews;

use crate::core::layout::{get_window_scale_factor, set_webview_properties};

mod core;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(setup::init)
        // 管理 TabManager 状态
        .manage(crate::core::tab::TabManager::new())
        // 注册命令
        .invoke_handler(tauri::generate_handler![
            crate::core::tab::create_tab,
            crate::core::tab::switch_tab,
            crate::core::tab::close_tab
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
