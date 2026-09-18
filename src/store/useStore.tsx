import { useContext } from "react";
import { AppContext } from "../AppContext";
import { LazyStore } from "@tauri-apps/plugin-store";

export function useStore(): LazyStore {
  const context = useContext(AppContext);
  return context.store;
}
