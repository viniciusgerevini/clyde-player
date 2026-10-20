import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { basename } from "@tauri-apps/api/path";
import { FolderOpenIcon, CircleCheckIcon, CircleXIcon, CircleDashedIcon } from "lucide-react";
import { ParseState } from "../file/useFileHandler";
import { useRecentOpenedFiles } from "../store/store";

interface FileBarParams {
  onFileOpen: (filePath: string) => void;
  dialogueStatus: ParseState;
}

export function FileBar({ onFileOpen, dialogueStatus }: FileBarParams) {
  const [openFilePath, setOpenFilePath] = useState("");
  const { recentFiles, addRecentFile } = useRecentOpenedFiles();

  const openFile = async () => {
    (document.activeElement as any)?.blur();

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
    addRecentFile(file);
  };

  const openRecentFile = (file: string) => {
    (document.activeElement as any)?.blur();
    setOpenFilePath(file);
    onFileOpen(file);
    addRecentFile(file);
  };

  return (
    <div className="flex gap-1">
      <div
        className="bg-base-200 rounded-box border border-base-300 grow flex items-center p-2 truncate gap-3"
        title={openFilePath}
        aria-label="Open file name"
      >
        <DialogueStatusBadge status={dialogueStatus} />
        {openFilePath ? <FileName filePath={openFilePath} /> : "No dialogue file open"}
      </div>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn" aria-label="File menu">
          <FolderOpenIcon size={16} />
        </div>
        <ul
          tabIndex={-1}
          className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          <li className="border-b-1 border-base-300">
            <button className="file-menu" onClick={openFile} aria-label="Open dialogue file">
              Open...
            </button>
          </li>
          {recentFiles.map((r, i) => (
            <li className="truncate" key={i} title={r}>
              <button
                className="file-menu"
                onClick={() => openRecentFile(r)}
                aria-label={`Recent file ${r}`}
              >
                <FileName filePath={r} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FileName({ filePath }: { filePath: string }) {
  const [name, setName] = useState("");

  const reloadName = async () => {
    const n = await basename(filePath);
    setName(n);
  };

  useEffect(() => {
    reloadName();
  }, [filePath]);

  return <>{name}</>;
}

function DialogueStatusBadge({ status }: { status: ParseState }) {
  if (status === ParseState.PARSED) {
    return (
      <CircleCheckIcon
        size={16}
        className="text-success"
        aria-label="Dialogue status badge: parsed"
      />
    );
  }

  if (status === ParseState.PARSE_ERROR) {
    return (
      <CircleXIcon size={16} className="text-error" aria-label="Dialogue status badge: error" />
    );
  }

  return (
    <CircleDashedIcon
      size={16}
      className="text-neutral"
      aria-label="Dialogue status badge: not parsed"
    />
  );
}
