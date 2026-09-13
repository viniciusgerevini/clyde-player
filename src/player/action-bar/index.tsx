import { useState } from "react";

interface PlayerActionBarParams {
  isDialogueAvailable: boolean;
  blocks: string[];
  onRestart: () => void;
  onNext: () => void;
  onForward: () => void;
  onAutoMode: () => void;
  onClearMemory: () => void;
  onToggleDebugPanel: () => void;
  onBlockSelected: (blockName: string) => void;
}

export function PlayerActionBar({
  isDialogueAvailable,
  blocks,
  onRestart,
  onNext,
  onForward,
  onAutoMode,
  onClearMemory,
  onToggleDebugPanel,
  onBlockSelected,
}: PlayerActionBarParams) {
  const [selectedBlock, setSelectedBlock] = useState("");

  const onBlockSelectChanged = (e: any) => {
    setSelectedBlock(e.target.value);
    onBlockSelected(e.target.value);
  };

  return (
    <div>
      <select
        className="block-selector"
        disabled={!isDialogueAvailable}
        onChange={onBlockSelectChanged}
        value={selectedBlock}
      >
        <option key="default" value="">Default</option>
        { blocks.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>
      <button onClick={onRestart} disabled={!isDialogueAvailable}>
        Restart
      </button>
      <button onClick={onNext} disabled={!isDialogueAvailable}>
        Next
      </button>
      <button onClick={onForward} disabled={!isDialogueAvailable}>
        Forward
      </button>
      <button onClick={onAutoMode} disabled={!isDialogueAvailable}>
        Poltergeist
      </button>
      <button onClick={onClearMemory} disabled={!isDialogueAvailable}>
        Clear memory
      </button>
      <button onClick={onToggleDebugPanel}>Toggle debug panel</button>
      <button>More</button>
    </div>
  );
}
