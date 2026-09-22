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

export function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useSettings(AppSettings.THEME);
  const changeTheme = (theme: string) => {
    setSelectedTheme(theme);
  };

  return (<>
    Theme
    <div className="flex">
      <div className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
        <div className="bg-base-content size-1 rounded-full">
        </div>
        <div className="bg-primary size-1 rounded-full">
        </div>
        <div className="bg-secondary size-1 rounded-full">
        </div>
        <div className="bg-accent size-1 rounded-full">
        </div>
      </div>
    <select className="select theme-controller" value={selectedTheme} onChange={(e) => changeTheme(e.target.value)}> 
      {themes.map((t, i) => (
        <option key={i} value={t}>{t}</option>
      ))}
    </select>
    </div>
  </>)
}
