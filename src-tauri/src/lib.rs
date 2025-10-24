use crate::core::{setup, tab};
use std::sync::{Arc, Mutex};

mod cmd;
mod core;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 管理 TabManager 状态
        // .manage(tab::TabManager::new())
        .manage(Arc::new(Mutex::new(tab::TabManager::new())))
        // 注册命令
        .invoke_handler(tauri::generate_handler![
            cmd::create_tab_cmd,
            cmd::switch_tab_cmd,
            cmd::close_tab_cmd,
            cmd::get_tab_info_list_cmd,
            cmd::get_sidebar_width_cmd
        ])
        .setup(setup::init)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
