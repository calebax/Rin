use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

use tauri::{AppHandle, LogicalPosition, LogicalSize, Manager, State, Window};

use crate::core::layout::{get_sidebar_width, get_window_scale_factor, set_webview_properties};
use crate::core::webview::create_webview_builder;

const TAB_MARGIN: f64 = 10.0;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tab {
    pub id: Uuid,
    pub space_id: Uuid,
    pub folder_id: Option<Uuid>,
    pub url: String,
    pub name: String,
    pub favicon: Option<String>,
    pub index: usize,

    pub is_pinned: bool,
    pub is_active: bool,
}

// 状态管理
pub struct TabManager {
    tabs: HashMap<Uuid, Tab>,
    active_tab_ids: Vec<Uuid>,
}

impl TabManager {
    pub fn new() -> Self {
        Self {
            tabs: HashMap::new(),
            active_tab_ids: Vec::new(),
        }
    }

    pub fn switch_tab(
        &mut self,
        app: &AppHandle,
        window_label: &str,
        tab_id: Uuid,
    ) -> Result<Uuid, String> {
        let window = app.get_window(window_label).ok_or("Window not found")?;
        // 隐藏之前活跃的 tab
        for old_id in self.active_tab_ids.iter() {
            if let Some(tab) = self.tabs.get_mut(old_id) {
                tab.is_active = false;

                if let Some(webview) = window.get_webview(&old_id.to_string()) {
                    let _ = webview.hide(); // 忽略错误
                }
            }
        }

        // 设置新的 active tab
        self.active_tab_ids.clear();
        self.active_tab_ids.push(tab_id);

        self.tab_resized(app, window_label);

        // 更新目标 tab 状态
        if let Some(tab) = self.tabs.get_mut(&tab_id) {
            tab.is_active = true;

            if let Some(webview) = window.get_webview(&tab_id.to_string()) {
                let _ = webview.show();
            } else {
                return Err("WebView not found".into());
            }
        }

        Ok(tab_id)
    }

    /// 根据window_label获取当前tab列表
    pub fn get_tab_info_list(&self, _window_label: String) -> Vec<Tab> {
        self.tabs.values().cloned().collect()
    }

    fn gen_id(&self) -> Uuid {
        Uuid::new_v4()
    }

    pub fn tab_resized(&self, app: &AppHandle, window_label: &str) {
        let window = match app.get_window(window_label) {
            Some(w) => w,
            None => return, // 没找到窗口，直接返回
        };

        let window_size = window.inner_size().unwrap();
        let scale_factor = get_window_scale_factor(&app, window_label).unwrap();
        let sidebar_width = get_sidebar_width(window_label);

        for active_tab_id in self.active_tab_ids.iter() {
            let webview = window.get_webview(&active_tab_id.to_string()).unwrap();
            let (position, size) =
                calc_webview_geometry(&active_tab_id, window_size, scale_factor, sidebar_width);
            set_webview_properties(&webview, position, size);
        }
    }
}

pub fn create_tab(
    app: &AppHandle,
    window_label: &str,
    search_query: &str,
    name: &str,
) -> Result<Uuid, String> {
    // 获取 TabManager 状态
    let tab_manager = app.state::<Arc<Mutex<TabManager>>>();
    let mut tm = tab_manager.lock().unwrap();

    // 获取宿主 Window
    let window: Window = app.get_window(window_label).ok_or("Window not found")?;

    // 生成 TabId
    let tab_id = tm.gen_id();

    // 获取窗口尺寸
    let window_size = window.inner_size().map_err(|e| e.to_string())?;
    let scale_factor = get_window_scale_factor(&app, window_label).unwrap();
    let sidebar_width = get_sidebar_width(window_label);
    let (position, size) = calc_webview_geometry(&tab_id, window_size, scale_factor, sidebar_width);

    // 准备 Tab 数据（先读取 tabs.len() 获取 index）
    let index = tm.tabs.len();
    let new_tab = Tab {
        id: tab_id,
        // TODO:  spaceId
        space_id: tab_id,
        folder_id: None,
        name: name.to_string(),
        url: search_query.to_string(),
        favicon: None,
        index,
        is_pinned: false,
        is_active: true,
    };

    tm.tabs.insert(tab_id, new_tab);
    drop(tm); // 释放锁;

    let webview_builder = create_webview_builder(&tab_id, search_query);
    let _ = window
        .add_child(webview_builder, position, size)
        .map_err(|e| e.to_string())
        .inspect(|wv| {
            let _ = wv.hide(); // ✅ 忽略 Result，闭包返回 ()
        });

    println!("Created tab with id: {}", tab_id);

    Ok(tab_id)
}

fn calc_webview_geometry(
    _tab_id: &Uuid,
    window_size: tauri::PhysicalSize<u32>,
    scale_factor: f64,
    sidebar_width: f64,
) -> (LogicalPosition<f64>, LogicalSize<f64>) {
    let position = LogicalPosition::new(sidebar_width, TAB_MARGIN);
    let size = LogicalSize::new(
        window_size.width as f64 / scale_factor - sidebar_width - TAB_MARGIN,
        window_size.height as f64 / scale_factor - TAB_MARGIN * 2.0,
    );
    (position, size)
}

#[tauri::command]
pub fn get_tab_info_list_cmd(
    window_label: String,
    tab_manager: State<'_, Arc<Mutex<TabManager>>>,
) -> Vec<Tab> {
    let tabs = (*tab_manager)
        .lock()
        .unwrap()
        .get_tab_info_list(window_label);
    tabs
}

#[tauri::command]
pub async fn create_tab_cmd(
    app: AppHandle,
    window_label: String,
    url: String,
    name: String,
) -> Result<String, String> {
    let tab_id = create_tab(&app, &window_label, &url, &name)?;
    Ok(tab_id.to_string())
}

#[tauri::command]
pub async fn switch_tab_cmd(
    app: AppHandle,
    window_label: String,
    tab_id: String,
    tm: State<'_, Arc<Mutex<TabManager>>>,
) -> Result<(), String> {
    let tab_uuid = Uuid::parse_str(&tab_id).map_err(|e| e.to_string())?;

    {
        let mut tm = tm.lock().unwrap();
        tm.switch_tab(&app, &window_label, tab_uuid).unwrap();
    }
    Ok(())
}

#[tauri::command]
pub async fn close_tab_cmd(
    app: AppHandle,
    window_label: String,
    tab_id: String,
    tm: State<'_, Arc<Mutex<TabManager>>>,
) -> Result<(), String> {
    let tab_uuid = Uuid::parse_str(&tab_id).map_err(|e| e.to_string())?;
    let window = app.get_window(&window_label).ok_or("Window not found")?;

    // 先获取锁，修改 TabManager 状态
    let (next_active_tab_id, _tabs_to_update): (Option<Uuid>, Vec<Uuid>) = {
        let mut tab_manager = tm.lock().map_err(|e| e.to_string())?;

        // 获取要关闭 tab 的索引
        let closing_tab_index = tab_manager
            .tabs
            .get(&tab_uuid)
            .map(|t| t.index)
            .unwrap_or(0);

        // 移除 tab
        tab_manager.tabs.remove(&tab_uuid);

        // 移除 active_tab_ids 中的 tab
        tab_manager.active_tab_ids.retain(|id| *id != tab_uuid);

        // 找临近 tab 显示
        let next_tab_id = if tab_manager.active_tab_ids.is_empty() && !tab_manager.tabs.is_empty() {
            // 排序剩余 tabs 按 index
            let mut tab_list: Vec<_> = tab_manager.tabs.values().collect();
            tab_list.sort_by_key(|t| t.index);

            // 默认显示左边的 tab，如果没有左边就右边
            tab_list
                .iter()
                .rev()
                .find(|t| t.index < closing_tab_index)
                .or_else(|| tab_list.iter().find(|t| t.index > closing_tab_index))
                .map(|t| t.id)
        } else {
            tab_manager.active_tab_ids.first().copied()
        };

        // 重排剩余 tabs 的 index
        let mut tab_list: Vec<_> = tab_manager.tabs.values_mut().collect();
        tab_list.sort_by_key(|t| t.index);
        for (new_index, tab) in tab_list.iter_mut().enumerate() {
            tab.index = new_index;
        }

        // 返回锁外需要操作 WebView 的 tab id 列表
        (next_tab_id, tab_manager.tabs.keys().cloned().collect())
    }; // 锁在这里释放

    // 关闭被删除的 WebView
    if let Some(webview) = window.get_webview(&tab_uuid.to_string()) {
        let _ = webview.close();
    }

    // 显示下一个活跃 tab
    if let Some(active_id) = next_active_tab_id {
        if let Some(webview) = window.get_webview(&active_id.to_string()) {
            let _ = webview.show();
        }
    }

    Ok(())
}
