import { useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
import "./reset.css";
import "./App.css";
import { FileBar } from "./file-bar";
import { Player } from "./player";

// TODO open file,
// TODO get file content
// TODO parse file
// TODO parse error display
// TODO interpreter
// TODO file panel (show text? Syntax highlighting?)

function App() {
  const [dialogueFilePath, setDialogueFilePath] = useState("");

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  const onFileOpen = (filePath: string) => {
    setDialogueFilePath(filePath);
  };

  return (
    <main className="container">
      <FileBar onFileOpen={onFileOpen} />
      <Player dialoguePath={dialogueFilePath} />
    </main>
  );
}

export default App;
