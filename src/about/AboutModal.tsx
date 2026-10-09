import { openUrl } from "@tauri-apps/plugin-opener";
import { ReactNode, useEffect, useState } from "react";
import { AppSettings, useSettings } from "../store/useSettings";
import { getCurrentWindow } from "@tauri-apps/api/window";
import ClydeLogoSvg from "../assets/clyde_logo.svg";
import { getVersion } from "@tauri-apps/api/app";

export function AboutModal() {
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

  return <dialog id="aboutModal" className="modal">
    <div className="modal-box max-w-none">
      <form method="dialog">
        {/* if there is a button in form, it will close the modal */}
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>

      <div className="flex gap-2 p-2 items-center flex-col sm:flex-row sm:gap-8">
        <img src={ClydeLogoSvg} />
        <div>
          <h1 className="base-100 text-lg font-bold text-center sm:text-left">Clyde Dialogue Player</h1>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold justify-center sm:justify-start">
              v{version} <div className="badge badge-accent">beta</div>
            </div>
            <div className="flex flex-col gap-2">
              <div>
              The Clyde Dialogue Language and Clyde Player were created by <Link href="https://thisisvini.com">Vinicius Gerevini</Link>.
              </div>
              <div>
              The Clyde Logo was designed by <Link href="https://fabianemolon.com">Fabiane Molon</Link>.
              </div>
            </div>
            <div className="flex gap-2 mt-2 justify-center sm:justify-start">
              <Link href="https://thisisvini.com/clyde/en/tools/player.html">
                Player documentation
              </Link>
              <Link href="https://github.com/viniciusgerevini/clyde-player">Report issues</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </dialog>;
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
