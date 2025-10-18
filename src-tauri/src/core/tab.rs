use std::collections::HashMap;
use std::sync::Mutex;
use uuid::Uuid;

use tauri::webview::WebviewBuilder;
use tauri::{AppHandle, LogicalPosition, LogicalSize, Manager, State, Webview, WebviewUrl, Window};

use crate::core::layout::{get_sidebar_width, get_window_scale_factor, set_webview_properties};

const TAB_MARGIN: f64 = 10.0;

// 存储WebView元数据
#[derive(Debug, Clone)]
struct Tab {
    id: String,
    title: String,
    url: String,
    is_active: bool,
}

// 状态管理
pub struct TabManager {
    tabs: Mutex<HashMap<String, Tab>>,
    active_tab_id: Mutex<Option<String>>,
}

impl TabManager {
    pub fn new() -> Self {
        Self {
            tabs: Mutex::new(HashMap::new()),
            active_tab_id: Mutex::new(None),
        }
    }

    fn gen_id(&self) -> String {
        Uuid::new_v4().to_string()
    }
}

pub fn get_active_webviews(app: &AppHandle, window_label: String) -> Vec<Webview> {
    // 获取主窗口
    let main_window = match app.get_window(&window_label) {
        Some(w) => w,
        None => return vec![], // 没找到窗口，返回空数组
    };

    // 获取全局 TabManager
    let tab_manager = app.state::<TabManager>();

    let tabs = tab_manager.tabs.lock().unwrap();
    let active_id = tab_manager.active_tab_id.lock().unwrap();

    let mut result = Vec::new();

    if let Some(active_tab_id) = active_id.as_ref() {
        // 确保 tab 在 tab_manager 里存在
        if tabs.contains_key(active_tab_id) {
            // 通过主窗口获取 WebView
            if let Some(webview) = main_window.get_webview(active_tab_id) {
                result.push(webview);
            }
        }
    }

    result
}

pub fn tab_resized(app: &AppHandle, window_label: &str) {
    let window = match app.get_window(window_label) {
        Some(w) => w,
        None => return, // 没找到窗口，直接返回
    };

    let window_size = window.inner_size().unwrap();
    let scale_factor = get_window_scale_factor(&app, window_label).unwrap();
    let sidebar_width = get_sidebar_width(window_label);

    get_active_webviews(&app, window_label.to_string())
        .iter()
        .for_each(|webview| {
            let (position, size) =
                calc_webview_geometry(&webview.label(), window_size, scale_factor, sidebar_width);
            set_webview_properties(webview, position, size);
        });
}

pub fn create_tab_internal(
    app: &AppHandle,
    window_label: &str,
    url: &str,
    title: &str,
) -> Result<String, String> {
    // 获取 TabManager 状态
    let tab_manager: State<TabManager> = app.state::<TabManager>();

    // 获取宿主 Window
    let window: Window = app.get_window(window_label).ok_or("Window not found")?;
    let tab_id = tab_manager.gen_id();

    // 获取窗口尺寸
    let window_size = window.inner_size().map_err(|e| e.to_string())?;
    let scale_factor = get_window_scale_factor(&app, window_label).unwrap();
    let sidebar_width = get_sidebar_width(window_label);

    let (position, size) = calc_webview_geometry(&tab_id, window_size, scale_factor, sidebar_width);

    // 创建 WebView
    let _webview = window
        .add_child(
            WebviewBuilder::new(
                &tab_id,
                WebviewUrl::External(url.parse::<url::Url>().map_err(|e| e.to_string())?),
            ),
            position,
            size,
        )
        .map_err(|e| e.to_string())?;

    // 存储 tab 信息
    {
        let mut tabs = tab_manager.tabs.lock().unwrap();
        tabs.insert(
            tab_id.clone(),
            Tab {
                id: tab_id.clone(),
                title: title.to_string(),
                url: url.to_string(),
                is_active: true,
            },
        );
    }

    // 更新 active_tab_id
    {
        let mut active = tab_manager.active_tab_id.lock().unwrap();
        *active = Some(tab_id.clone());
    }

    println!("Created tab with id: {}", tab_id);

    Ok(tab_id)
}

fn calc_webview_geometry(
    _tab_id: &str,
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
pub async fn create_tab(
    app: AppHandle,
    window_label: String,
    url: String,
    title: String,
) -> Result<String, String> {
    create_tab_internal(&app, &window_label, &url, &title)
}

#[tauri::command]
pub async fn switch_tab(
    app: AppHandle,
    window_label: String,
    tab_id: String,
    tab_manager: State<'_, TabManager>,
) -> Result<(), String> {
    let window = app.get_window(&window_label).ok_or("Window not found")?;
    let mut tabs = tab_manager.tabs.lock().map_err(|e| e.to_string())?;

    // 更新活跃状态
    if let Some(active_id) = tab_manager.active_tab_id.lock().unwrap().clone() {
        if let Some(tab) = tabs.get_mut(&active_id) {
            tab.is_active = false;
            // 隐藏当前WebView
            if let Some(webview) = window.get_webview(&active_id) {
                webview.hide().map_err(|e| e.to_string())?;
            }
        }
    }

    // 显示目标WebView
    if let Some(tab) = tabs.get_mut(&tab_id) {
        tab.is_active = true;
        {
            let mut active = tab_manager.active_tab_id.lock().unwrap();
            *active = Some(tab_id.clone());
        }

        tab_resized(&app, &window_label);
    }

    Ok(())
}

#[tauri::command]
pub async fn close_tab(
    app: AppHandle,
    window_label: String,
    tab_id: String,
    tab_manager: State<'_, TabManager>,
) -> Result<(), String> {
    let window = app.get_window(&window_label).ok_or("Window not found")?;

    // 关闭并移除 WebView
    if let Some(webview) = window.get_webview(&tab_id) {
        webview.close().map_err(|e| e.to_string())?;
    }

    // 从状态管理中移除
    let mut tabs = tab_manager.tabs.lock().map_err(|e| e.to_string())?;
    tabs.remove(&tab_id);

    // 如果关闭的是活跃标签，切换到第一个标签
    {
        let mut active = tab_manager.active_tab_id.lock().unwrap();
        if active.as_deref() == Some(&tab_id) {
            if let Some(first_tab_id) = tabs.keys().next().cloned() {
                *active = Some(first_tab_id.clone());
                if let Some(webview) = window.get_webview(&first_tab_id) {
                    webview.show().map_err(|e| e.to_string())?;
                }
            } else {
                *active = None;
            }
        }
    }

    Ok(())
}
