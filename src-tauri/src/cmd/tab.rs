use crate::cmd::CmdResult;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, State};
use uuid::Uuid;

use crate::core::tab::{Tab, TabManager};

#[tauri::command]
pub fn get_tab_info_list_cmd(
    window_label: String,
    tab_manager: State<'_, Arc<Mutex<TabManager>>>,
) -> CmdResult<Vec<Tab>> {
    let tabs = (*tab_manager)
        .lock()
        .unwrap()
        .get_tab_info_list(window_label);
    Ok(tabs)
}

#[tauri::command]
pub async fn create_tab_cmd(
    app: AppHandle,
    window_label: String,
    url: String,
    name: String,
    tm: State<'_, Arc<Mutex<TabManager>>>,
) -> CmdResult<String> {
    let mut tm = tm.lock().unwrap();
    let tab_id = tm.create_tab(&app, &window_label, &url, &name)?;
    Ok(tab_id.to_string())
}

#[tauri::command]
pub async fn switch_tab_cmd(
    app: AppHandle,
    window_label: String,
    tab_id: String,
    tm: State<'_, Arc<Mutex<TabManager>>>,
) -> CmdResult {
    let tab_uuid = Uuid::parse_str(&tab_id).map_err(|e| e.to_string())?;

    let mut tm = tm.lock().unwrap();
    tm.switch_tab(&app, &window_label, tab_uuid).unwrap();

    Ok(())
}

#[tauri::command]
pub async fn close_tab_cmd(
    app: AppHandle,
    window_label: String,
    tab_id: String,
    tm: State<'_, Arc<Mutex<TabManager>>>,
) -> CmdResult {
    let tab_uuid = Uuid::parse_str(&tab_id).map_err(|e| e.to_string())?;

    let mut tm = tm.lock().unwrap();
    tm.close_tab(&app, &window_label, tab_uuid).unwrap();

    Ok(())
}
