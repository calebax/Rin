use std::sync::{Arc, Mutex};
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::{
    window::Effect, window::EffectsBuilder, App, Manager, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder, WindowEvent,
};

use crate::core::tab::{create_tab, TabManager};

/// setup
pub fn init(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    if cfg!(debug_assertions) {
        app.handle().plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )?;
    }

    // 初始化窗口
    // let main_window = app.get_window("main").unwrap();
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
        .effects(vec![Effect::HudWindow, Effect::Acrylic, Effect::Mica])
        .radius(12.)
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

    let tab_id = create_tab(&app.handle(), "main", "https://v2.tauri.app", "Tauri").unwrap();

    let tab_manager = app.state::<Arc<Mutex<TabManager>>>();
    {
        let mut tm = tab_manager.lock().unwrap();
        tm.switch_tab(&app.handle(), "main", tab_id).unwrap();
    }

    let _ = create_tab(
        app.handle(),
        "main",
        "http://duckduckgo.com?q=Hello",
        "DuckDuckGo",
    );

    // window.add_child(
    //     WebviewBuilder::new("main-app", WebviewUrl::App(Default::default())).auto_resize(),
    //     tauri::LogicalPosition::new(0., 0.),
    //     tauri::LogicalSize::new(800., 600.),
    // )?;

    Ok(window)
}
