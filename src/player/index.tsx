import { useDialogueFileHandler } from "../file/useFileHandler";
import { PlayerActionBar } from "./action-bar";
import { Interpreter, DialogueOptions, DialogueLine, DialogueEnd } from "@clyde-lang/interpreter";
import "./Player.css";
import { useEffect, useMemo, useRef, useState } from "react";

interface PlayerParams {
  dialoguePath: string;
}

interface DialogueEvent {
  type: "event";
  text: string;
}

interface DialogueAutoSelection {
  type: "selection";
  content: DialogueOptions;
  selection: number;
}

type DialogueEntry = DialogueEnd | DialogueLine | DialogueOptions | DialogueEvent | DialogueAutoSelection;

export function Player({dialoguePath}: PlayerParams) {
  const [currentDialoguePath, setCurrentDialoguePath] = useState("");
  const [entries, setEntries] = useState<DialogueEntry[]>([]);
  const [isWaitingForChoice, setIsWaitingForChoice] = useState<boolean>(false);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const fileHandler = useDialogueFileHandler(dialoguePath);
  const bottomRef = useRef<null | HTMLDivElement>(null);

  const parsedDoc = fileHandler.getParsedDocument();
  const parseError = fileHandler.getParseError();
  const interpreter = useMemo(() => {
    return Interpreter(parsedDoc);
  }, [parsedDoc])

  const isDialogueAvailable = currentDialoguePath !== "";

  // TODO is parsing / background parsing

  useEffect(() => {
    scrollToBottom();
  }, [entries]);

  useEffect(() => {
    if (currentDialoguePath !== dialoguePath) {
      setCurrentDialoguePath(dialoguePath);
      setEntries([]);
      resetToDefault();
    }
  }, [dialoguePath]);


  useEffect(() => {
    if (currentDialoguePath !== "" && currentDialoguePath === dialoguePath) {
      addToEntries({ type: "event", text: "Dialogue Loaded"});
    }
    resetToDefault();
  }, [parsedDoc]);

  // TODO block selection
  //
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addToEntries = (entry: DialogueEntry | DialogueEntry[]) => {
    const n = entries.concat(entry);
    setEntries(n);
  };

  const resetToDefault = () => {
    setHasEnded(false);
    setIsWaitingForChoice(false);
  };

  const onRestart = () => {
    interpreter.start();
    setEntries([]);
    resetToDefault();
  };

  const onNext = () => {
    if (!isDialogueAvailable || isWaitingForChoice || hasEnded) {
      return;
    }
    next();
  };

  const next = () => {
    const content = interpreter.getContent();
    addToEntries(content);
    handleContent(content);
  };

  const handleContent = (content: DialogueEntry) => {
    if (content.type === "options") {
      setIsWaitingForChoice(true);
    } else if (content.type === "end") {
      setHasEnded(true);
    }
  }

  const onForward = () => {
    if (!isDialogueAvailable || isWaitingForChoice || hasEnded) {
      return;
    }
    let type = "line";
    const newEntries: DialogueEntry[] = [];
   
    while (type === "line") {
      const content = interpreter.getContent();
      newEntries.push(content);
      handleContent(content);
      type = content.type;
    }
    addToEntries(newEntries);
  };

  const onAutoMode = () => {
    if (!isDialogueAvailable || hasEnded) {
      return;
    }

    let type = "line";
    const newEntries: DialogueEntry[] = [];
   
    while (type !== "end") {
      const content = interpreter.getContent();

      if (content.type === "options") {
        const choice = Math.floor(Math.random() * content.options.length);
        interpreter.choose(choice);
        newEntries.push({
          type: "selection",
          content,
          selection: choice,
        });
      } else {
        newEntries.push(content);
      }
      type = content.type;
    }
    addToEntries(newEntries);
    setHasEnded(true);
  };

  const onClearMemory = () => {
    interpreter.clearData();
    interpreter.start();
    resetToDefault();
    setEntries([]);
  };

  const onToggleDebugPanel = () => {

  };

  const onOptionSelected = (optionIndex: number) => {
    if (!isWaitingForChoice) {
      return;
    }

    setIsWaitingForChoice(false);
    interpreter.choose(optionIndex);
    next();
  };

  return <div className="player-container">
    <PlayerActionBar
      isDialogueAvailable={isDialogueAvailable}
      onRestart={onRestart}
      onNext={onNext}
      onForward={onForward}
      onAutoMode={onAutoMode}
      onClearMemory={onClearMemory}
      onToggleDebugPanel={onToggleDebugPanel}
    />
    <div className="dialogue-entries" onClick={onNext}>
      {entries.map((e) => {
        return <DialogueBubble content={e} onOptionSelected={onOptionSelected} />
      })}
      <div ref={bottomRef}></div>
    </div>
    <div className="player-status">Status</div>
  </div>;
}

function DialogueBubble({ content, onOptionSelected, selection = -1 } : { content: DialogueEntry, onOptionSelected: (optionIndex: number) => void, selection?: number }) {
  const [selectedOption, setOptionSelected ] = useState(selection);

  if (content.type === "end") {
    return <div className="dialogue-entry end">Dialogue Ended</div>;
  }

  if (content.type === "event") {
    return <div className="dialogue-entry event">{content.text}</div>;
  }

  if (content.type === "selection") {
    return <DialogueBubble content={content.content} onOptionSelected={onOptionSelected} selection={content.selection} />;
  }

  return <div className="dialogue-entry">
    {content.speaker && <div className="speaker">{content.speaker}</div>}
    <div className="dialogue-text">
      {content.text}
    </div>
    { content.type === "options" && (
      <ul>
        {
          content.options.map((o, i) => {
            return (<li key={i}>
              <button
                className={selectedOption === i ? "selected" : ''}
                onClick={(event) => {
                  event.stopPropagation();
                  setOptionSelected(i);
                  onOptionSelected(i);
                }}
                disabled={selectedOption > -1}
              >{i+1}. {o.text}</button>
            </li>);
          })
        }
      </ul>
    )}
    { (content.id || content.tags) && <div className="metadata">
      { content.id && (`id: ${content.id} `) }
      { content.tags && content.tags.map(t => `#${t} `) }
    </div>}
  </div>;
}
