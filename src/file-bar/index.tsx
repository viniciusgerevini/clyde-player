import { useState } from "react";
import "./FileBar.css";
import { open } from "@tauri-apps/plugin-dialog";

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
      <div className="filename">{openFilePath}</div>
      <button className="file-menu" onClick={openFile}>
        Open
      </button>
    </div>
  );
}
