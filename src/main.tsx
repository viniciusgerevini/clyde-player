import { LazyStore } from "@tauri-apps/plugin-store";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppContext } from "./AppContext";

const store = new LazyStore("store.json", { autoSave: true });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppContext value={{ store }}>
      <App />
    </AppContext>
  </React.StrictMode>,
);
