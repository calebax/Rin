use objc2::msg_send;
use objc2_web_kit::WKWebView;
use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::sync::RwLock;
use tauri::{AppHandle, LogicalPosition, LogicalSize, Manager, Webview};
/// 获取指定窗口的 scale factor
pub fn get_window_scale_factor(app: &AppHandle, window_label: &str) -> Option<f64> {
    app.get_window(window_label)
        .and_then(|w| w.scale_factor().ok())
}

pub fn set_webview_properties(
    view: &Webview,
    position: LogicalPosition<f64>,
    size: LogicalSize<f64>,
) {
    if let Err(e) = view.set_position(position) {
        eprintln!("[Webview:position] Failed to set view position: {}", e);
    }
    if let Err(e) = view.set_size(size) {
        eprintln!("[Webview:size] Failed to set view size: {}", e);
    }
}

pub fn get_sidebar_width(window_label: &str) -> f64 {
    sidebar_manager_read().get_width(window_label)
}

#[cfg(target_os = "macos")]
pub unsafe fn set_webview_corner_radius(webview: *const std::ffi::c_void, radius: f64) {
    let view: &WKWebView = &*(webview as *const WKWebView);
    // layer() 返回 Option<Retained<CALayer>> ,需要解包
    if let Some(layer) = view.layer() {
        // layer.setCornerRadius(8.0);
        // layer.setMasksToBounds(true);

        //使用 msg_send! 动态调用
        let _: () = msg_send![&*layer, setCornerRadius: radius];
        let _: () = msg_send![&*layer, setMasksToBounds: true];
    }
}

#[derive(Debug, Clone)]
pub struct SidebarState {
    pub width: f64,
}

#[derive(Default)]
pub struct SidebarManager {
    map: HashMap<String, SidebarState>,
}

impl SidebarManager {
    const DEFAULT_WIDTH: f64 = 205.0;

    // pub fn get(&self, window_label: &str) -> SidebarState {
    //     self.map.get(window_label).cloned().unwrap_or(SidebarState {
    //         width: Self::DEFAULT_WIDTH,
    //     })
    // }

    pub fn set(&mut self, window_label: &str, state: SidebarState) {
        self.map.insert(window_label.to_string(), state);
    }

    pub fn get_width(&self, window_label: &str) -> f64 {
        self.map
            .get(window_label)
            .map(|s| s.width)
            .unwrap_or(Self::DEFAULT_WIDTH)
    }

    pub fn update_width(&mut self, window_label: &str, width: f64) {
        if let Some(state) = self.map.get_mut(window_label) {
            state.width = width;
        }
    }
}

// 全局单例
pub static SIDEBAR_MANAGER: Lazy<RwLock<SidebarManager>> =
    Lazy::new(|| RwLock::new(SidebarManager::default()));

// 返回写锁
pub fn sidebar_manager() -> std::sync::RwLockWriteGuard<'static, SidebarManager> {
    SIDEBAR_MANAGER.write().unwrap()
}

// 返回读锁
pub fn sidebar_manager_read() -> std::sync::RwLockReadGuard<'static, SidebarManager> {
    SIDEBAR_MANAGER.read().unwrap()
}
