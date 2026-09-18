import { useDialogueFileHandler, ParseState } from "../file/useFileHandler";
import { PlayerActionBar } from "./action-bar";
import { Interpreter, DialogueOptions, DialogueLine, DialogueEnd } from "@clyde-lang/interpreter";
import { useEffect, useMemo, useRef, useState } from "react";
import { BugIcon, CircleCheckIcon, CircleXIcon, CircleDashedIcon, CircleDotIcon } from 'lucide-react';
import { UnexpectedTokenError } from "@clyde-lang/parser";

interface PlayerParams {
  dialoguePath: string;
  onParseFinished: (status: ParseState) => void;
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

type DialogueEntry =
  | DialogueEnd
  | DialogueLine
  | DialogueOptions
  | DialogueEvent
  | DialogueAutoSelection;

export function Player({ dialoguePath, onParseFinished }: PlayerParams) {
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
  }, [parsedDoc]);

  const isDialogueAvailable = currentDialoguePath !== "";
  const parseState = fileHandler.getParseState();

  const blocks = useMemo(() => {
    return parsedDoc.blocks.map(b => b.name);
  }, [parsedDoc.blocks]);

  // TODO is parsing / background parsing
  // TODO meta styling
  // TODO debug panel

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
      addToEntries({ type: "event", text: "Dialogue Loaded" });
    }
    resetToDefault();
  }, [parsedDoc]);

  useEffect(() => {
    onParseFinished(parseState);
  }, [parseState])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
  };

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

  const onToggleDebugPanel = () => {};

  const onBlockSelected = (blockName: string) => {
    interpreter.start(blockName);
    resetToDefault();
    addToEntries({ type: "event", text: `Block selected: ${blockName === "" ? "Default" : blockName }` });
  }

  const onOptionSelected = (optionIndex: number) => {
    if (!isWaitingForChoice) {
      return;
    }

    setIsWaitingForChoice(false);
    interpreter.choose(optionIndex);
    next();
  };

  return (
    <div className="flex flex-col grow overflow-hidden">
      <PlayerActionBar
        isDialogueAvailable={isDialogueAvailable}
        hasDialogueEnded={hasEnded}
        blocks={blocks}
        onBlockSelected={onBlockSelected}
        onRestart={onRestart}
        onNext={onNext}
        onForward={onForward}
        onAutoMode={onAutoMode}
        onClearMemory={onClearMemory}
      />
      <div className="grow flex flex-col gap-2 overflow-y-auto scroll-smooth" onClick={onNext}>
        {entries.map((e) => {
          return <DialogueBubble content={e} onOptionSelected={onOptionSelected} />;
        })}
        <div ref={bottomRef}></div>
      </div>
      <div className="flex gap-1 items-center">
        <div className="grow">
          <DialogueParsingStatus status={fileHandler.getParseState()} error={parseError} />
        </div>

        <div className="tooltip" data-tip="Toggle debug panel">
          <button className="btn btn-ghost" onClick={onToggleDebugPanel}>
            <BugIcon size={16}/>
          </button>
        </div>

      </div>
    </div>
  );
}


function DialogueParsingStatus({status, error} : { status: ParseState, error: Error | UnexpectedTokenError | undefined }) {
  if (status === ParseState.NOT_PARSED) {
    return <div className="flex items-center text-neutral" title="Not Parsed"><CircleDashedIcon size={16} /></div>;
  }

  if (status === ParseState.PARSED) {
    return <div className="flex items-center text-success" title="Parsing successful"><CircleCheckIcon size={16} /> </div>;
  }

  if (status === ParseState.PARSE_ERROR) {
    return <div className="flex items-center gap-2 text-error truncate" title={`parsing error: ${error?.message || ''}`}>
      <CircleXIcon size={16}/>
      { error ? error.message : "Parse error" }
    </div>;
  }

  return <div className="flex items-center text-warning" title="Parsing..."><CircleDotIcon size={16} /></div>;
}

function DialogueBubble({
  content,
  onOptionSelected,
  selection = -1,
}: {
  content: DialogueEntry;
  onOptionSelected: (optionIndex: number) => void;
  selection?: number;
}) {
  const [selectedOption, setOptionSelected] = useState(selection);

  if (content.type === "end") {
    return <div className="bg-warning/50 text-warning-content font-bold rounded-box p-5 flex items-center justify-center">
      Dialogue Ended
    </div>;
  }

  if (content.type === "event") {
    return <div className="bg-info/50 text-info-content font-bold rounded-box p-5 flex items-center justify-center">{content.text}</div>;
  }

  if (content.type === "selection") {
    return (
      <DialogueBubble
        content={content.content}
        onOptionSelected={onOptionSelected}
        selection={content.selection}
      />
    );
  }

  return (
    <div className="bg-base-300 rounded-box p-5 flex flex-col gap-2">
      {content.speaker && <div className="font-bold">{content.speaker}</div>}
      <div>{content.text}</div>
      {content.type === "options" && (
        <ul>
          {content.options.map((o, i) => {
            return (
              <li key={i}>
                <button
                  className={selectedOption === i ? "btn btn-ghost text-base-content font-bold" : "btn btn-ghost"}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOptionSelected(i);
                    onOptionSelected(i);
                  }}
                  disabled={selectedOption > -1}
                >
                  {i + 1}. {o.text}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {(content.id || content.tags) && (
        <div className="text-base-content/70 text-right">
          {content.id && `id: ${content.id} `}
          {content.tags && content.tags.map((t) => `#${t} `)}
        </div>
      )}
    </div>
  );
}
