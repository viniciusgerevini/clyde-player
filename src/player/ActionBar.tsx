import { useState } from "react";

import {
  ChevronDownIcon,
  PlayIcon,
  DatabaseBackupIcon,
  FastForwardIcon,
  RotateCcwIcon,
  GhostIcon,
  EllipsisVerticalIcon,
} from "lucide-react";
import { AppSettings, useSettings } from "../store/useSettings";
import { ThemeSelector } from "../file-bar/ThemeSelector";

interface PlayerActionBarParams {
  isDialogueAvailable: boolean;
  hasDialogueEnded: boolean;
  blocks: string[];
  onRestart: () => void;
  onNext: () => void;
  onForward: () => void;
  onAutoMode: () => void;
  onClearMemory: () => void;
  onBlockSelected: (blockName: string) => void;
}

export function PlayerActionBar({
  isDialogueAvailable,
  hasDialogueEnded,
  blocks,
  onRestart,
  onNext,
  onForward,
  onAutoMode,
  onClearMemory,
  onBlockSelected,
}: PlayerActionBarParams) {
  const [selectedBlock, setSelectedBlock] = useState("");

  const onBlockSelectChanged = (blockName: string) => {
    (document.activeElement as any)?.blur();
    setSelectedBlock(blockName);
    onBlockSelected(blockName);
  };

  return (
    <div className="flex gap-1 mb-1">
      <div className="flex grow">
        <div className="dropdown dropdown-start grow">
          <div tabIndex={0} role="button" className="btn w-full flex items-center">
            <div className="grow text-left">{selectedBlock || "Default"}</div>{" "}
            <ChevronDownIcon className="size-6" />
          </div>
          <ul
            tabIndex={-1}
            className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
          >
            <li
              key="default"
              className={selectedBlock === "" ? "font-bold" : ""}
              onClick={() => onBlockSelectChanged("")}
            >
              <a>Default</a>
            </li>
            {blocks.map((b) => (
              <li
                key={b}
                className={selectedBlock === b ? "font-bold" : ""}
                onClick={() => onBlockSelectChanged(b)}
              >
                <a>{b}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="tooltip" data-tip="Restart">
        <button className="btn" onClick={onRestart} disabled={!isDialogueAvailable}>
          <RotateCcwIcon size={16} />
        </button>
      </div>

      <div className="tooltip" data-tip="Next line">
        <button
          className="btn"
          onClick={onNext}
          disabled={!isDialogueAvailable || hasDialogueEnded}
        >
          <PlayIcon size={16} />
        </button>
      </div>

      <div className="tooltip" data-tip="Forward to next choice">
        <button
          className="btn"
          onClick={onForward}
          disabled={!isDialogueAvailable || hasDialogueEnded}
        >
          <FastForwardIcon size={16} />
        </button>
      </div>

      <div className="tooltip" data-tip="Poltergeist (auto-mode)">
        <button
          className="btn"
          onClick={onAutoMode}
          disabled={!isDialogueAvailable || hasDialogueEnded}
        >
          <GhostIcon size={16} />
        </button>
      </div>

      <div className="tooltip" data-tip="Clear memory">
        <button className="btn" onClick={onClearMemory} disabled={!isDialogueAvailable}>
          <DatabaseBackupIcon size={16} />
        </button>
      </div>
      <SettingsDropdown />
    </div>
  );
}

function SettingsDropdown() {
  const [watchFile, setWatchFile] = useSettings(AppSettings.WATCH_FILE);
  const [isMultiBubble, setMultiBubble] = useSettings(AppSettings.MULTI_BUBBLE);
  const [showMetadata, setShowMetadata] = useSettings(AppSettings.SHOW_METADATA);

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn">
        <EllipsisVerticalIcon />
      </div>
      <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 p-2 shadow-sm">
        <li className="border-b-1 border-base-300">
          <label className="label text-base-content gap-2">
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={watchFile}
              onChange={(e) => setWatchFile(e.target.checked)}
            />
            Watch for file changes
          </label>
        </li>
        <li>
          <label className="label text-base-content gap-2">
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={isMultiBubble}
              onChange={(e) => setMultiBubble(e.target.checked)}
            />
            Toggle multi-bubble mode
          </label>
        </li>
        <li className="border-b-1 border-base-300">
          <label className="label text-base-content gap-2">
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={showMetadata}
              onChange={(e) => setShowMetadata(e.target.checked)}
            />
            Show metadata
          </label>
        </li>
        <li className="pt-2">
          <ThemeSelector />
        </li>
      </ul>
    </div>
  );
}
