import { LazyStore } from "@tauri-apps/plugin-store";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppContext } from "./AppContext";
import { AppSettings } from "./store/useSettings";

const store = new LazyStore("store.json", { autoSave: true });

store.get(AppSettings.THEME).then((value) => {
  if (value) {
    document.querySelector("html")?.setAttribute("data-theme", value as any);
  }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppContext value={{ store }}>
      <App />
    </AppContext>
  </React.StrictMode>,
);
