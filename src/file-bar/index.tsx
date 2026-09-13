import { useState } from "react";
import "./FileBar.css";
import { open } from "@tauri-apps/plugin-dialog";
// import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

// const configToml = await readTextFile('config.toml', {
//   baseDir: BaseDirectory.AppConfig,
// });
//
interface FileBarParams {
  onFileOpen: (filePath: string) => void;
}
export function FileBar({ onFileOpen }: FileBarParams) {
  const [openFilePath, setOpenFilePath] = useState("");

  const openFile = async () => {
    const file = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "DialogueFile",
          extensions: ["clyde"],
        },
      ],
    });

    if (!file) {
      return;
    }

    setOpenFilePath(file);

    onFileOpen(file);
  };

  return (
    <div className="file-bar">
      <div className="status">S</div>
      <div className="filename">{openFilePath}</div>
      <button className="file-menu" onClick={openFile}>
        Open
      </button>
    </div>
  );
}
