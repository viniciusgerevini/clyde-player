
interface PlayerActionBarParams {
  isDialogueAvailable: boolean;
  onRestart: () => void;
  onNext: () => void;
  onForward: () => void;
  onAutoMode: () => void;
  onClearMemory: () => void;
  onToggleDebugPanel: () => void;
}

export function PlayerActionBar({ isDialogueAvailable, onRestart, onNext, onForward, onAutoMode, onClearMemory, onToggleDebugPanel}: PlayerActionBarParams) {
  return <div>
    <select disabled={!isDialogueAvailable}></select>
    <button onClick={onRestart} disabled={!isDialogueAvailable}>Restart</button>
    <button onClick={onNext} disabled={!isDialogueAvailable}>Next</button>
    <button onClick={onForward} disabled={!isDialogueAvailable}>Forward</button>
    <button onClick={onAutoMode} disabled={!isDialogueAvailable}>Poltergeist</button>
    <button onClick={onClearMemory} disabled={!isDialogueAvailable}>Clear memory</button>
    <button onClick={onToggleDebugPanel}>Toggle debug panel</button>
    <button>More</button>
  </div>;
}
