import { useEffect, useRef } from "react";
import { stat } from "@tauri-apps/plugin-fs";

interface UseWatchFileParams {
  filePath: string;
  callback: () => void;
  waitTime?: number;
  skip?: boolean;
}

export function useWatchFile({ filePath, callback, waitTime = 500, skip = false}: UseWatchFileParams) {
  const changeTime = useRef(-1);

  useEffect(() => {
    changeTime.current = -1;

    if (filePath === "" || skip) {
      return;
    }

    let timeout = -1;
    const scheduleTimeout = () => {
      timeout = setTimeout(async () => {
        try {
          const fileInfo = await stat(filePath)
          if (fileInfo.mtime && changeTime.current !== fileInfo.mtime.getTime()) {
            changeTime.current = fileInfo.mtime.getTime();
            callback();
          }
        } catch (e) {
          console.error("File watcher failed", e);
        }
        scheduleTimeout();
      }, waitTime);
    };

    scheduleTimeout();

    return () => {
      if (timeout != -1) {
        clearTimeout(timeout);
      }
    };
  }, [filePath, callback, waitTime, skip]);
};
