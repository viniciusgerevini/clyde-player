import { createContext } from "react";
import { LazyStore } from "@tauri-apps/plugin-store";

interface IAppContext {
  store: LazyStore;
}

export const AppContext = createContext<IAppContext>({} as any);
