import { useCallback, useEffect, useState } from "react";
import { useStore } from "./store";

export enum AppSettings {
  WATCH_FILE = "watch_files",
  MULTI_BUBBLE = "multi_bubble",
  SHOW_METADATA = "show_metadata",
}

type SettingsType = {
  [AppSettings.WATCH_FILE]: boolean;
  [AppSettings.MULTI_BUBBLE]: boolean;
  [AppSettings.SHOW_METADATA]: boolean;
};

const settingDefaultValue: Record<AppSettings, any> = {
  [AppSettings.WATCH_FILE]: true,
  [AppSettings.MULTI_BUBBLE]: true,
  [AppSettings.SHOW_METADATA]: false,
};

export function useSettings<T extends AppSettings>(
  setting: T,
): [value: SettingsType[T], (value: SettingsType[T]) => void] {
  const store = useStore();
  const [settingValue, setSettingValue] = useState<SettingsType[T]>(settingDefaultValue[setting]);

  const persistValue = async (value: SettingsType[T]) => {
    await store.set(setting, value);
    setSettingValue(value);
  };

  const setSetting = useCallback((value: SettingsType[T]): void => {
    persistValue(value);
  }, []);

  useEffect(() => {
    const refresh = async () => {
      const result = await store.get<SettingsType[T]>(setting);
      setSettingValue(result ?? settingDefaultValue[setting]);
    };

    let unregister: () => void;
    let wasOffloaded: boolean = false;

    (async () => {
      unregister = await store.onKeyChange(setting, (value: SettingsType[T] | undefined): void => {
        if (value === undefined) {
          return;
        }
        setSettingValue(value);
      });

      if (wasOffloaded) {
        if (unregister) {
          unregister();
        }
      }

      refresh();
    })();

    return () => {
      wasOffloaded = true;
      if (unregister) {
        unregister();
      }
    };
  }, []);

  return [settingValue, setSetting];
}
