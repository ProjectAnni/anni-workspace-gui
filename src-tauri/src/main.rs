#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use anni_repo::prelude::{Album, JsonAlbum};
use std::{fs, str::FromStr};

#[tauri::command]
fn read_album_file(path: &str) -> JsonAlbum {
    let content = fs::read_to_string(path).unwrap();
    let album = Album::from_str(&content).unwrap();
    let album_json = JsonAlbum::from(album);
    return album_json;
}

#[tauri::command]
fn write_album_file(path: &str, album_json_str: &str) {
    let album_json = JsonAlbum::from_str(album_json_str).unwrap();
    let album = Album::try_from(album_json).unwrap();
    let album_serialized_text = toml_edit::easy::to_string_pretty(&album).unwrap();
    fs::write(path, album_serialized_text).expect("failed to write album file");
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_album_file, write_album_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
