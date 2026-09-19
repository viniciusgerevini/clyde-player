import { useState } from "react";
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

  // return (
  //   <div className="dropdown dropdown-end">
  //     <div tabIndex={0} role="button" className="btn">
  //       Open
  //     </div>
  //     <ul
  //       tabIndex={-1}
  //       className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 shadow-sm max-h-[calc(100vh-8.6rem)] overflow-y-auto flex flex-nowrap"
  //     >
  //       {themes.map((t, i) => (
  //         <li key={i} title={t}>
  //           <input
  //             type="radio"
  //             name="theme-buttons"
  //             className="btn theme-controller join-item"
  //             aria-label={t}
  //             value={t}
  //           />
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );
}
//     <div className="bg-base-100 group-hover:border-base-content/20 border-base-content/10 grid shrink-0 grid-cols-2 gap-0.5 rounded-md border p-1 transition-colors">
//       <div className="bg-base-content size-1 rounded-full">
//       </div>
//       <div className="bg-primary size-1 rounded-full">
//       </div>
//       <div className="bg-secondary size-1 rounded-full">
//       </div>
//       <div className="bg-accent size-1 rounded-full">
//       </div>
//     </div>
//     <svg width="12px" height="12px" className="mt-px hidden size-2 fill-current opacity-60 sm:inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
//       <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z">
//       </path>
//     </svg>
//   </button>
//   <div popover="" id="theme-change" className="dropdown dropdown-end bg-base-200 text-base-content rounded-box top-px h-122 max-h-[calc(100vh-8.6rem)] overflow-y-auto border-(length:--border) border-white/5 shadow-2xl outline-(length:--border) outline-black/5 mt-6">
//     <ul className="menu w-56">
//       <li className="menu-title text-xs">
//         Theme</li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="light" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="light" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             light</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="dark" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="dark" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             dark</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="cupcake" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="cupcake" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             cupcake</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="bumblebee" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="bumblebee" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             bumblebee</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="emerald" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="emerald" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             emerald</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="corporate" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="corporate" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             corporate</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="synthwave" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="synthwave" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             synthwave</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="retro" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="retro" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             retro</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="cyberpunk" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="cyberpunk" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             cyberpunk</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="valentine" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="valentine" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             valentine</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="halloween" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="halloween" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             halloween</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="garden" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="garden" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             garden</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="forest" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="forest" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             forest</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="aqua" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="aqua" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             aqua</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="lofi" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="lofi" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             lofi</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2 [&amp;_svg]:visible" data-set-theme="pastel" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="pastel" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             pastel</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="fantasy" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="fantasy" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             fantasy</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="wireframe" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="wireframe" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             wireframe</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="black" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="black" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             black</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="luxury" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="luxury" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             luxury</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="dracula" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="dracula" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             dracula</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="cmyk" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="cmyk" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             cmyk</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="autumn" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="autumn" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             autumn</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="business" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="business" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             business</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="acid" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="acid" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             acid</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="lemonade" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="lemonade" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             lemonade</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="night" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="night" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             night</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="coffee" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="coffee" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             coffee</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="winter" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="winter" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             winter</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="dim" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="dim" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             dim</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="nord" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="nord" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             nord</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="sunset" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="sunset" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             sunset</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="caramellatte" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="caramellatte" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             caramellatte</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="abyss" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="abyss" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             abyss</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//       <li>
//         <button className="gap-3 px-2" data-set-theme="silk" data-act-class="[&amp;_svg]:visible">
//           <div data-theme="silk" className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm">
//             <div className="bg-base-content size-1 rounded-full">
//             </div>
//             <div className="bg-primary size-1 rounded-full">
//             </div>
//             <div className="bg-secondary size-1 rounded-full">
//             </div>
//             <div className="bg-accent size-1 rounded-full">
//             </div>
//           </div>
//           <div className="w-32 truncate">
//             silk</div>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="invisible h-3 w-3 shrink-0">
//             <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
//             </path>
//           </svg>
//         </button>
//       </li>
//     </ul>
//   </div>
// </div>;
