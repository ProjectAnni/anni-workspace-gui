#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use anni_repo::prelude::{Album, JsonAlbum};
use anni_workspace::{AnniWorkspace, WorkspaceAlbum, WorkspaceError};
use std::{
    fs::{self, File},
    io::Write,
    num::NonZeroU8,
    path::Path,
    str::FromStr,
};
use thiserror;
use uuid::Uuid;

// create the error type that represents all errors possible in our program
#[derive(Debug, thiserror::Error)]
enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Workspace(#[from] WorkspaceError),
}

// we must manually implement serde::Serialize
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    message_type: String,
}

#[tauri::command]
fn read_album_file(path: &str) -> JsonAlbum {
    let content = fs::read_to_string(path).unwrap();
    let album = Album::from_str(&content).unwrap();
    let album_json = JsonAlbum::from(album);
    return album_json;
}

#[tauri::command]
fn write_album_file(path: &str, album_json_str: &str) -> Result<(), String> {
    let album_json = JsonAlbum::from_str(album_json_str).unwrap();
    let album = Album::try_from(album_json).unwrap();
    let album_serialized_text = toml_edit::easy::to_string_pretty(&album).unwrap();
    fs::write(path, album_serialized_text).map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
fn write_text_file_append(path: &str, content: &str) -> Result<(), String> {
    let mut file = File::options()
        .create(true)
        .append(true)
        .open(path)
        .unwrap();
    file.write_all(content.as_bytes())
        .map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_workspace_albums(workspace_path: &str) -> Result<Vec<WorkspaceAlbum>, Error> {
    let workspace = AnniWorkspace::find(Path::new(workspace_path))?;
    let albums = workspace.scan()?;
    return Ok(albums);
}

#[tauri::command]
fn create_album(
    window: tauri::Window,
    workspace: &str,
    path: &str,
    disc_num: u8,
) -> Result<(), Error> {
    let album_id = Uuid::new_v4();
    let workspace_path = Path::new(workspace);
    let album_path = Path::new(path);
    let album_disc_num = NonZeroU8::new(disc_num).unwrap_or(NonZeroU8::new(1).unwrap());
    let workspace = AnniWorkspace::find(workspace_path)?;
    workspace.create_album(&album_id, &album_path, album_disc_num)?;
    window
        .emit(
            "event-name",
            Payload {
                message_type: "workspace_status_change".into(),
            },
        )
        .unwrap();
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_album_file,
            write_album_file,
            write_text_file_append,
            get_workspace_albums,
            create_album,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
