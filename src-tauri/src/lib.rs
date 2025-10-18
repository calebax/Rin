use crate::core::{setup, tab, layout};

mod core;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(setup::init)
        // 管理 TabManager 状态
        .manage(tab::TabManager::new())
        // 注册命令
        .invoke_handler(tauri::generate_handler![
            tab::create_tab,
            tab::switch_tab,
            tab::close_tab,
            layout::get_sidebar_width_cmd
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
