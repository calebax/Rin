use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

use tauri::{AppHandle, LogicalPosition, LogicalSize, Manager, State, Window};

use crate::core::layout::{
    get_sidebar_width, get_window_scale_factor, set_webview_corner_radius, set_webview_properties,
};
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
    /// 根据window_label获取当前tab列表
    pub fn get_tab_info_list(&self, _window_label: String) -> Vec<Tab> {
        self.tabs.values().cloned().collect()
    }

    pub fn create_tab(
        &mut self,
        app: &AppHandle,
        window_label: &str,
        search_query: &str,
        name: &str,
    ) -> Result<Uuid, String> {
        // 获取宿主 Window
        let window: Window = app.get_window(window_label).ok_or("Window not found")?;
        // 生成 TabId
        let tab_id = self.gen_id();

        // 获取窗口尺寸
        let window_size = window.inner_size().map_err(|e| e.to_string())?;
        let scale_factor = get_window_scale_factor(app, window_label).unwrap();
        let sidebar_width = get_sidebar_width(window_label);
        let (position, size) =
            calc_webview_geometry(&tab_id, window_size, scale_factor, sidebar_width);

        let webview_builder = create_webview_builder(app, &tab_id, search_query);
        let _ = window
            .add_child(webview_builder, position, size)
            .map_err(|e| e.to_string())
            .inspect(|wv| {
                let _ = wv.with_webview(|webview| {
                    #[cfg(target_os = "macos")]
                    unsafe {
                        set_webview_corner_radius(webview.inner(), 12.0);
                    }
                });

                let _ = wv.hide();
            });
        // 准备 Tab 数据
        let new_tab = Tab {
            id: tab_id,
            space_id: tab_id, // TODO: 这里可能要改
            folder_id: None,
            name: name.to_string(),
            url: search_query.to_string(),
            favicon: None,
            index: self.tabs.len(),
            is_pinned: false,
            is_active: false,
        };
        self.tabs.insert(tab_id, new_tab);
        println!("Created tab with id: {}", tab_id);

        Ok(tab_id)
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
                let _ = webview.set_focus();
            } else {
                return Err("WebView not found".into());
            }
        }

        Ok(tab_id)
    }

    pub fn close_tab(
        &mut self,
        app: &AppHandle,
        window_label: &str,
        tab_id: Uuid,
    ) -> Result<(), String> {
        let window: Window = app.get_window(window_label).ok_or("Window not found")?;

        if let Some(webview) = window.get_webview(&tab_id.to_string()) {
            let _ = webview.close();
        }

        self.tabs.remove(&tab_id);
        self.active_tab_ids.retain(|id| *id != tab_id);

        let mut tab_list: Vec<_> = self.tabs.values_mut().collect();
        tab_list.sort_by_key(|t| t.index);
        for (new_index, tab) in tab_list.iter_mut().enumerate() {
            tab.index = new_index;
        }

        Ok(())
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
    tm: State<'_, Arc<Mutex<TabManager>>>,
) -> Result<String, String> {
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
) -> Result<(), String> {
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
) -> Result<(), String> {
    let tab_uuid = Uuid::parse_str(&tab_id).map_err(|e| e.to_string())?;

    let mut tm = tm.lock().unwrap();
    tm.close_tab(&app, &window_label, tab_uuid).unwrap();

    Ok(())
}
