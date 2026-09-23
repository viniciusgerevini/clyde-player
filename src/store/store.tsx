import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import { LazyStore } from "@tauri-apps/plugin-store";

export function useStore(): LazyStore {
  const context = useContext(AppContext);
  return context.store;
}

export function useVariablesStore(): LazyStore {
  const context = useContext(AppContext);
  return context.variablesStore;
}

const RECENT_FILES_KEY = "recent_files";

export function useRecentOpenedFiles(): {
  recentFiles: string[];
  addRecentFile(filePath: string): void;
} {
  const store = useStore();
  const [recentOpenedFiles, setRecentOpenedFiles] = useState<string[]>([]);

  const refreshFiles = async () => {
    const result = await store.get<string[]>(RECENT_FILES_KEY);
    setRecentOpenedFiles(result || []);
  };

  const updateOpenedFiles = async (openedFiles: string[]) => {
    await store.set(RECENT_FILES_KEY, openedFiles);
  };

  const addRecentFile = (filePath: string) => {
    const index = recentOpenedFiles.indexOf(filePath);

    if (index > -1) {
      recentOpenedFiles.splice(index, 1);
    } else if (recentOpenedFiles.length > 9) {
      recentOpenedFiles.pop();
    }

    const newArray = [filePath, ...recentOpenedFiles];
    setRecentOpenedFiles(newArray);
    updateOpenedFiles(newArray);
  };

  useEffect(() => {
    refreshFiles();
  }, []);

  return { recentFiles: recentOpenedFiles, addRecentFile };
}
