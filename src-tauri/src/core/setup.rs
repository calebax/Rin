use std::sync::{Arc, Mutex};
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::{
    window::Effect, window::EffectsBuilder, App, Manager, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder, WindowEvent,
};

use crate::core::tab::TabManager;

/// setup
pub fn init(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    if cfg!(debug_assertions) {
        app.handle().plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )?;
    }

    let main_window = window_init(app)?;
    let window_label = main_window.label().to_string();
    let handle_clone = app.handle().clone();

    main_window.on_window_event(move |event| {
        if let WindowEvent::Resized(_size) = event {
            let tab_manager = handle_clone.state::<Arc<Mutex<TabManager>>>();
            let tm = tab_manager.lock().unwrap();
            tm.tab_resized(&handle_clone, &window_label);
        }
    });

    let le_menu = SubmenuBuilder::new(app, "Rin")
        .text("open", "Open")
        .text("quit", "Quit")
        .build()?;
    let menu = MenuBuilder::new(app).items(&[&le_menu]).build()?;
    app.set_menu(menu)?;
    app.on_menu_event(move |app_handle: &tauri::AppHandle, event| {
        println!("menu event: {:?}", event.id());

        match event.id().0.as_str() {
            "open" => {
                println!("open event");
            }
            "quit" => {
                println!("quit event");
                for window in app_handle.windows().values() {
                    let _ = window.close();
                }
            }
            _ => {
                println!("unexpected menu event");
            }
        }
    });
    Ok(())
}

fn window_init(app: &App) -> tauri::Result<WebviewWindow> {
    // 构建窗口视觉特效
    let effects = EffectsBuilder::new()
        .effects(vec![Effect::Mica, Effect::Acrylic, Effect::HudWindow])
        .radius(12.0)
        .build();

    // 构建主窗口
    let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("Le")
        .resizable(true)
        .min_inner_size(460., 400.)
        .inner_size(800., 600.)
        .center()
        .resizable(true)
        .fullscreen(false)
        .decorations(false)
        .transparent(true)
        .effects(effects)
        .build()?;

    let links = [
        ("https://github.com/calebax/Rin", "Rin Browser"),
        ("https://tauri.app/", "Tauri Docs"),
        ("http://duckduckgo.com?q=Hello", "DuckDuckGo"),
        ("https://www.bing.com", "Bing"),
        ("https://www.google.com", "Google"),
    ];

    let tab_manager = app.state::<Arc<Mutex<TabManager>>>();
    let mut tm = tab_manager.lock().unwrap();
    let mut first_tab_id = None;

    for (i, (url, name)) in links.iter().enumerate() {
        let tab_id = tm.create_tab(&app.handle(), "main", url, name).unwrap();

        if i == 0 {
            first_tab_id = Some(tab_id.clone());
        }
    }

    if let Some(tab_id) = first_tab_id {
        tm.switch_tab(&app.handle(), "main", tab_id).unwrap();
    }

    Ok(window)
}
