use serde::Serialize;
use tauri::webview::{NewWindowFeatures, NewWindowResponse, WebviewBuilder};
use tauri::{AppHandle, Emitter, Runtime, Url, WebviewUrl};
use uuid::Uuid;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct TabUpdate {
    tab_id: String,
    title: String,
    url: Url,
    event: String,
}

pub fn create_webview_builder<R: Runtime>(
    app: &AppHandle,
    tab_id: &Uuid,
    url: &str,
) -> WebviewBuilder<R> {
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

    let parsed_url_clone = parsed_url.clone();
    let webview_builder =
        WebviewBuilder::new(&tab_id.to_string(), WebviewUrl::External(parsed_url_clone))
            .user_agent(get_desktop_user_agent().as_str())
            .on_document_title_changed({
                let app = app.clone();
                let parsed_url = parsed_url.clone();
                move |webview, new_title| {
                    println!("新标题: {}", new_title);

                    let payload = TabUpdate {
                        tab_id: webview.label().to_string(),
                        title: new_title,
                        url: parsed_url.clone(),
                        event: "titleChanged".to_string(),
                    };

                    // TODO 临时实现，后续统一规划tab状态与浏览历史，tab推送事件也可采用window.emit
                    app.emit("tab_update", payload).unwrap();
                }
            })
            .on_page_load({
                let app = app.clone();
                move |webview, pagleload| {
                    println!("页面加载: {:?}", pagleload);

                    let payload = TabUpdate {
                        tab_id: webview.label().to_string(),
                        title: "".to_string(),
                        url: pagleload.url().clone(),
                        event: format!("{:?}", pagleload.event()),
                    };

                    app.emit("tab_update", payload).unwrap();
                }
            })
            .on_new_window(|url: Url, features: NewWindowFeatures| {
                println!("页面请求打开新窗口: {}", url);
                println!("窗口特性: {:#?}", features);

                NewWindowResponse::Allow
            });

    webview_builder
}

/// 生成跨平台桌面浏览器 User-Agent
fn get_desktop_user_agent() -> String {
    // // 默认 WebKit 内核版本
    // let webkit_version = "537.36";
    // // Chrome 版本号（可以定期更新或保持兼容性）
    // let chrome_version = "121.0.0.0";

    // // 根据目标操作系统生成平台信息
    // let platform_info = if cfg!(target_os = "windows") {
    //     "Windows NT 10.0; Win64; x64"
    // } else if cfg!(target_os = "macos") {
    //     "Macintosh; Intel Mac OS X 10_15_7"
    // } else if cfg!(target_os = "linux") {
    //     "X11; Linux x86_64"
    // } else {
    //     "Unknown"
    // };
    // format!(
    //     "Mozilla/5.0 ({}) AppleWebKit/{} (KHTML, like Gecko) Chrome/{} Safari/{}",
    //     platform_info, webkit_version, chrome_version, webkit_version
    // )
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36".to_string()
}
