use tauri::{webview::WebviewBuilder, Runtime, WebviewUrl};
use uuid::Uuid;

pub fn create_webview_builder<R: Runtime>(tab_id: &Uuid, url: &str) -> WebviewBuilder<R> {
    let parsed_url = match url.parse::<url::Url>() {
        Ok(u) => u,
        Err(e) => {
            eprintln!(
                "Warning: invalid URL '{}', using default https://example.com. Error: {}",
                url, e
            );
            url::Url::parse("https://example.com").unwrap()
        }
    };

    let webview_builder =
        WebviewBuilder::new(&tab_id.to_string(), WebviewUrl::External(parsed_url))
            .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
    webview_builder
}

/// 生成跨平台桌面浏览器 User-Agent
fn get_desktop_user_agent() -> String {
    // 默认 WebKit 内核版本
    let webkit_version = "537.36";

    // 根据目标操作系统生成平台信息
    let platform_info = if cfg!(target_os = "windows") {
        "Windows NT 10.0; Win64; x64"
    } else if cfg!(target_os = "macos") {
        "Macintosh; Intel Mac OS X 10_15_7"
    } else if cfg!(target_os = "linux") {
        "X11; Linux x86_64"
    } else {
        "Unknown"
    };

    // Chrome 版本号（可以定期更新或保持兼容性）
    let chrome_version = "121.0.0.0";

    format!(
        "Mozilla/5.0 ({}) AppleWebKit/{} (KHTML, like Gecko) Chrome/{} Safari/{}",
        platform_info, webkit_version, chrome_version, webkit_version
    )
}
