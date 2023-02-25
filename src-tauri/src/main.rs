#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use anni_repo::{
    library::AlbumFolderInfo,
    prelude::{Album, JsonAlbum},
};
use anni_workspace::{
    AnniWorkspace, ExtractedAlbumInfo, UntrackedWorkspaceAlbum, WorkspaceAlbum, WorkspaceError,
};
use serde::Serialize;
use std::{
    borrow::Cow,
    fs::{self, File},
    io::Write,
    num::NonZeroU8,
    path::{Path, PathBuf},
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
    body: String,
}

#[tauri::command]
fn read_album_file(path: &str) -> JsonAlbum {
    let content = fs::read_to_string(path).unwrap();
    let album = Album::from_str(&content).unwrap();
    let album_json = JsonAlbum::from(album);
    return album_json;
}

#[tauri::command]
fn write_album_file(path: &str, album_json_str: &str) -> Result<(), Error> {
    let album_json = JsonAlbum::from_str(album_json_str).unwrap();
    let album = Album::try_from(album_json).unwrap();
    let album_serialized_text = toml_edit::easy::to_string_pretty(&album).unwrap();
    fs::write(path, album_serialized_text)?;
    Ok(())
}

#[tauri::command]
fn write_text_file_append(path: &str, content: &str) -> Result<(), Error> {
    let mut file = File::options()
        .create(true)
        .append(true)
        .open(path)
        .unwrap();
    file.write_all(content.as_bytes())?;
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
            "workspace_status_change",
            Payload {
                body: workspace_path.to_str().unwrap().into(),
            },
        )
        .unwrap();
    Ok(())
}

#[derive(Serialize)]
struct WorkspaceDiscCopy {
    index: usize,
    path: PathBuf,
    cover: PathBuf,
    tracks: Vec<PathBuf>,
}

#[tauri::command]
fn commit_album_prepare(
    workspace_path: &str,
    album_path: &str,
) -> Result<Vec<WorkspaceDiscCopy>, Error> {
    let workspace = AnniWorkspace::find(Path::new(workspace_path))?;
    let mut discs_result: Vec<WorkspaceDiscCopy> = Vec::new();

    let untracked_album = workspace.get_untracked_album_overview(&album_path)?;

    for (_, disc) in untracked_album.discs.into_iter().enumerate() {
        discs_result.push(WorkspaceDiscCopy {
            index: disc.index,
            path: disc.path.clone(),
            cover: disc.cover.clone(),
            tracks: disc.tracks.clone(),
        })
    }

    return Ok(discs_result);
}

#[tauri::command]
fn commit_album(
    window: tauri::Window,
    workspace_path: &str,
    album_path: &str,
) -> Result<(), Error> {
    let workspace = AnniWorkspace::find(Path::new(workspace_path))?;
    let validator = |_album: &UntrackedWorkspaceAlbum| -> bool {
        return true;
    };
    workspace.commit(&album_path, Some(validator))?;
    workspace.import_tags(
        &album_path,
        |folder_name| {
            let AlbumFolderInfo {
                release_date,
                catalog,
                title,
                edition,
                ..
            } = AlbumFolderInfo::from_str(&folder_name).ok()?;
            Some(ExtractedAlbumInfo {
                title: Cow::Owned(title),
                edition: edition.map(|e| Cow::Owned(e)),
                catalog: Cow::Owned(catalog),
                release_date,
            })
        },
        false,
    )?;
    window
        .emit(
            "workspace_status_change",
            Payload {
                body: workspace_path.into(),
            },
        )
        .unwrap();
    Ok(())
}

#[tauri::command]
fn publish_album(
    window: tauri::Window,
    workspace_path: &str,
    album_path: &str,
) -> Result<(), Error> {
    let workspace = AnniWorkspace::find(Path::new(workspace_path))?;
    workspace.apply_tags(&album_path)?;
    workspace.publish(album_path, false)?;
    window
        .emit(
            "workspace_status_change",
            Payload {
                body: workspace_path.into(),
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
            commit_album_prepare,
            commit_album,
            publish_album
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
