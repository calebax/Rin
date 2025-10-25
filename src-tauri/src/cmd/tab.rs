use super::CmdResult;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, State};
use uuid::Uuid;

use crate::cmd::StringifyErr;
use crate::core::tab::{Tab, TabManager, TabNavigation};

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
    tm.switch_tab(&app, &window_label, tab_uuid)?;

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
    tm.close_tab(&app, &window_label, tab_uuid)?;

    Ok(())
}

#[tauri::command]
pub async fn navigate_tab_cmd(
    app: AppHandle,
    window_label: String,
    tab_id: String,
    url: Option<String>,
    tm: State<'_, Arc<Mutex<TabManager>>>,
) -> CmdResult {
    let tab_uuid = Uuid::parse_str(&tab_id).map_err(|e| e.to_string())?;

    let action = match url {
        Some(u) => TabNavigation::NavigateTo(u),
        None => TabNavigation::Reload,
    };

    let mut tm = tm.lock().unwrap();
    tm.navigate(&app, &window_label, tab_uuid, action)
        .stringify_err()?;

    Ok(())
}

#[tauri::command]
pub async fn tab_history_cmd(
    app: AppHandle,
    window_label: String,
    tab_id: String,
    action: i8, // -1: 后退, 0: 刷新, 1: 前进
    tm: State<'_, Arc<Mutex<TabManager>>>,
) -> CmdResult {
    let tab_uuid = Uuid::parse_str(&tab_id).map_err(|e| e.to_string())?;
    let mut tm = tm.lock().unwrap();

    let nav_action = match action {
        -1 => TabNavigation::Back,
        0 => TabNavigation::Reload,
        1 => TabNavigation::Forward,
        _ => return Err("Invalid navigation action".into()),
    };

    tm.navigate(&app, &window_label, tab_uuid, nav_action)
        .stringify_err()?;

    Ok(())
}
