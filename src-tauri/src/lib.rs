use crate::core::{layout, setup, tab};

use std::sync::{Arc, Mutex};

mod core;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 管理 TabManager 状态
        // .manage(tab::TabManager::new())
        .manage(Arc::new(Mutex::new(tab::TabManager::new())))
        // 注册命令
        .invoke_handler(tauri::generate_handler![
            tab::create_tab_cmd,
            tab::switch_tab_cmd,
            tab::close_tab_cmd,
            tab::get_tab_info_list_cmd,
            layout::get_sidebar_width_cmd
        ])
        .setup(setup::init)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
