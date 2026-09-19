//use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        //.setup(|app| {
        //    //let main_window = app.get_webview_window("main").unwrap();
        //    //let store = app.store("store.json")?;
        //    //let value = store.get("theme");
        //    //// this is getting the right theme
        //    //// i need a way to pass the value to the html before it loads
        //    //if let Some(theme) = value {
        //    //    println!("{:?}", theme.as_str()); // {"value":5}
        //    //    //main_window.eval("console.log('yeah')");
        //    //}
        //    Ok(())
        //})
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
