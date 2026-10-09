import { LazyStore } from "@tauri-apps/plugin-store";
import { openUrl } from "@tauri-apps/plugin-opener";
import React, { ReactNode, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import { AppContext } from "./AppContext";
import { AppSettings, useSettings } from "./store/useSettings";
import { getCurrentWindow } from "@tauri-apps/api/window";
import ClydeLogoSvg from "./assets/clyde_logo.svg";
import { getVersion } from "@tauri-apps/api/app";

const store = new LazyStore("store.json", { autoSave: true });
const variablesStore = new LazyStore("variables.json", { autoSave: true });

store.get(AppSettings.THEME).then((value) => {
  if (value) {
    document.querySelector("html")?.setAttribute("data-theme", value as any);
  }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppContext value={{ store, variablesStore }}>
      <About />
    </AppContext>
  </React.StrictMode>,
);

function About() {
  const [selectedTheme] = useSettings(AppSettings.THEME);
  const [version, setVersion] = useState("0.0.0");

  useEffect(() => {
    const html = document.querySelector("html");
    html?.setAttribute("data-theme", selectedTheme);

    setTimeout(() => {
      getCurrentWindow().show();
    }, 200);
  }, [selectedTheme]);

  useEffect(() => {
    getVersion().then((v) => {
      setVersion(v);
    });
  }, []);

  return (
    <div className="flex gap-4 p-4">
      <img src={ClydeLogoSvg} />
      <div>
        <h1 className="base-100 text-lg font-bold">Clyde Dialogue Player</h1>
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            v{version} <div className="badge badge-accent">beta</div>
          </div>
          <div>
            The Clyde Dialogue Language and Clyde Player were created by Vinicius Gerevini (
            <Link href="https://thisisvini.com">thisisvini.com</Link>) and distributed under the MIT
            license.
            <br />
            The Clyde Logo was designed by Fabiane Molon (
            <Link href="https://fabianemolon.com">fabianemolon.com</Link>).
          </div>
          <div className="flex gap-2">
            <Link href="https://thisisvini.com/clyde/en/tools/player.html">
              Player documentation
            </Link>
            <Link href="https://github.com/viniciusgerevini/clyde-player">Report issues</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Link({ href, children }: { href: string; children: ReactNode }) {
  const openLink = () => {
    openUrl(href);
  };
  return (
    <button className="underline text-primary cursor-pointer" onClick={openLink}>
      {children}
    </button>
  );
}
