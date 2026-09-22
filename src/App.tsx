import { useEffect, useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { FileBar } from "./file-bar";
import { Player } from "./player/Player";
import { ParseState } from "./file/useFileHandler";
import { AppSettings, useSettings } from "./store/useSettings";
import { getCurrentWindow } from "@tauri-apps/api/window";

// TODO commands
// c-n - next line
// c-j c-k options
// <c-y> accept
// <c-r> restart
// c-p poltergeist
// c-b debugger
function App() {
  const [selectedTheme] = useSettings(AppSettings.THEME);

  const [dialogueFilePath, setDialogueFilePath] = useState("");
  const [dialogueStatus, setDialogueStatus] = useState<ParseState>(ParseState.NOT_PARSED);

  useEffect(() => {
    const html = document.querySelector("html");
    html?.setAttribute("data-theme", selectedTheme);

    setTimeout(() => {
      getCurrentWindow().show();
      getCurrentWindow().setFocus();
    }, 200);
  }, [selectedTheme]);

  const onFileOpen = (filePath: string) => {
    setDialogueFilePath(filePath);
  };

  return (
    <main className="h-full flex flex-col gap-1">
      <FileBar onFileOpen={onFileOpen} dialogueStatus={dialogueStatus} />
      <Player
        dialoguePath={dialogueFilePath}
        onParseFinished={(status) => setDialogueStatus(status)}
      />
    </main>
  );
}

export default App;
