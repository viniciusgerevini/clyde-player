import { useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { FileBar } from "./file-bar";
import { Player } from "./player/player";
import { ParseState } from "./file/useFileHandler";

// c-n - next line
// c-j c-k options
// <c-y> accept
// <c-r> restart
// c-p poltergeist
// c-b debugger
function App() {
  const [dialogueFilePath, setDialogueFilePath] = useState("");
  const [dialogueStatus, setDialogueStatus] = useState<ParseState>(ParseState.NOT_PARSED);

  const onFileOpen = (filePath: string) => {
    setDialogueFilePath(filePath);
  };

  return (
    <main className="h-full flex flex-col gap-1">
      <FileBar onFileOpen={onFileOpen} dialogueStatus={dialogueStatus} />
      <Player dialoguePath={dialogueFilePath} onParseFinished={ (status) => setDialogueStatus(status)} />
    </main>
  );
}

export default App;
