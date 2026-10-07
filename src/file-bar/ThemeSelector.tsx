import { XIcon } from "lucide-react";
import { AppSettings, useSettings } from "../store/useSettings";

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
];

export function ThemeSelector({ onCloseTriggered }: { onCloseTriggered: () => void }) {
  const [selectedTheme, setSelectedTheme] = useSettings(AppSettings.THEME);
  const changeTheme = (theme: string) => {
    setSelectedTheme(theme);
  };

  return (
    <div className="flex items-center justify-center gap-1 absolute top-0 left-0 w-full h-full">
      <div className="bg-base-100 border-1 border-base-300 p-4 rounded-md flex flex-col gap-2 relative shadow">
        <button className="btn btn-ghost btn-xs absolute top-2 right-2">
          <XIcon size={16} onClick={onCloseTriggered} />
        </button>
        <div>Theme</div>
        <div className="flex gap-2 items-center">
          <div className="bg-base-100 grid shrink-0 grid-cols-2 gap-2 rounded-md p-2 shadow-sm">
            <div className="bg-base-content size-2 rounded-full"></div>
            <div className="bg-primary size-2 rounded-full"></div>
            <div className="bg-secondary size-2 rounded-full"></div>
            <div className="bg-accent size-2 rounded-full"></div>
          </div>
          <select
            className="select theme-controller"
            value={selectedTheme}
            onChange={(e) => changeTheme(e.target.value)}
          >
            {themes.map((t, i) => (
              <option key={i} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
