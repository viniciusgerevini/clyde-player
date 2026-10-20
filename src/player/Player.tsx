import { Group, Layout, LayoutChangedMeta, Panel, Separator } from "react-resizable-panels";
import { useDialogueFileHandler, ParseState } from "../file/useFileHandler";
import { PlayerActionBar } from "./ActionBar";
import { Interpreter, DialogueOptions, DialogueLine, DialogueEnd } from "@clyde-lang/interpreter";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BugIcon,
  CircleCheckIcon,
  CircleXIcon,
  CircleDashedIcon,
  GripHorizontalIcon,
} from "lucide-react";
import { UnexpectedTokenError } from "@clyde-lang/parser";
import { AppSettings, useSettings } from "../store/useSettings";
import { DebugPanel } from "../debugger/DebugPanel";
import { TimelineEventTitles, useEventTimeline } from "../debugger/useEventTimeline";
import { useExternalVariables } from "../store/useExternalVariables";

export interface PlayerParams {
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
  const [isMultiBubble] = useSettings(AppSettings.MULTI_BUBBLE);
  const [showMetadata] = useSettings(AppSettings.SHOW_METADATA);
  const [watchChanges] = useSettings(AppSettings.WATCH_FILE);
  const [isDebugPanelVisible, setDebugPannelVisible] = useSettings(AppSettings.DEBUGGER_VISIBLE);
  const [playerDebuggerLayout, setPlayerDebuggerLayout] = useSettings(
    AppSettings.PLAYER_DEBUGGER_LAYOUT,
  );
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [clearMemFlag, setClearMemFlag] = useState(0);
  const fileHandler = useDialogueFileHandler(dialoguePath, watchChanges);
  const bottomRef = useRef<null | HTMLDivElement>(null);
  const { events, addEventToTimeline, clearTimelineEvents } = useEventTimeline();

  const { externalVariablesRef, setVariable } = useExternalVariables();

  const defaultLayout = useMemo(() => {
    try {
      if (playerDebuggerLayout) {
        return JSON.parse(playerDebuggerLayout);
      }
    } catch {
      return;
    }
    return;
  }, [playerDebuggerLayout]);

  const parsedDoc = fileHandler.getParsedDocument();
  const parseError = fileHandler.getParseError();
  const interpreter = useMemo(() => {
    return Interpreter(parsedDoc);
  }, [parsedDoc]);

  const isDialogueAvailable = currentDialoguePath !== "" && !parseError;
  const parseState = fileHandler.getParseState();

  const blocks = useMemo(() => {
    return parsedDoc.blocks.map((b) => b.name);
  }, [parsedDoc.blocks]);

  useEffect(() => {
    scrollToBottom();
  }, [entries]);

  useEffect(() => {
    if (currentDialoguePath !== dialoguePath) {
      setCurrentDialoguePath(dialoguePath);
      setEntries([]);
      resetToDefault();
      clearTimelineEvents();
    }
  }, [dialoguePath]);

  useEffect(() => {
    if (currentDialoguePath !== "" && currentDialoguePath === dialoguePath) {
      addToEntries({ type: "event", text: "Dialogue Loaded" });
      addEventToTimeline({ timestamp: Date.now(), title: TimelineEventTitles.DIALOGUE_LOADED });
    }
    resetToDefault();
  }, [parsedDoc]);

  useEffect(() => {
    onParseFinished(parseState);
  }, [parseState]);

  useEffect(() => {
    interpreter.onExternalVariableFetch((name: string) => {
      return externalVariablesRef.current[name]?.value;
    });

    interpreter.onExternalVariableUpdate((name: string, value: any) => {
      setVariable(name, value);
      addEventToTimeline({
        timestamp: Date.now(),
        title: TimelineEventTitles.EXTERNAL_VARIABLE_CHANGED,
        description: `name: ${name}, value: ${value}`,
      });
    });
  }, [interpreter, setVariable]);

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
    addEventToTimeline({ timestamp: Date.now(), title: TimelineEventTitles.DIALOGUE_LOADED });
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
      addEventToTimeline({ timestamp: Date.now(), title: TimelineEventTitles.DIALOGUE_ENDED });
      setHasEnded(true);
    }
  };

  const onForward = () => {
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
    addEventToTimeline({ timestamp: Date.now(), title: TimelineEventTitles.DIALOGUE_ENDED });
  };

  const onClearMemory = () => {
    interpreter.clearData();
    interpreter.start();
    resetToDefault();
    setEntries([]);
    setClearMemFlag(Date.now());
    addEventToTimeline({ timestamp: Date.now(), title: TimelineEventTitles.CLEAR_MEMORY });
  };

  const onToggleDebugPanel = () => {
    setDebugPannelVisible(!isDebugPanelVisible);
  };

  const onBlockSelected = (blockName: string) => {
    interpreter.start(blockName);
    resetToDefault();
    addToEntries({
      type: "event",
      text: `Block selected: ${blockName === "" ? "Default" : blockName}`,
    });

    addEventToTimeline({
      timestamp: Date.now(),
      title: TimelineEventTitles.BLOCK_SELECTED,
      description: blockName,
    });
  };

  const onOptionSelected = (optionIndex: number) => {
    if (hasEnded) {
      return;
    }

    setIsWaitingForChoice(false);
    interpreter.choose(optionIndex);
    next();
  };

  const onLayoutChanged = (layout: Layout, meta: LayoutChangedMeta) => {
    if (meta.isUserInteraction) {
      setPlayerDebuggerLayout(JSON.stringify(layout));
    }
  };

  return (
    <div className="flex flex-col grow overflow-hidden">
      <Group orientation="vertical" defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
        <Panel
          id="pp"
          minSize={30}
          className="flex flex-col grow overflow-hidden"
          style={{ overflow: "hidden" }}
        >
          <PlayerActionBar
            isDialogueAvailable={isDialogueAvailable}
            hasDialogueEnded={hasEnded}
            isWaitingForChoice={isWaitingForChoice}
            blocks={blocks}
            onBlockSelected={onBlockSelected}
            onRestart={onRestart}
            onNext={onNext}
            onForward={onForward}
            onAutoMode={onAutoMode}
            onClearMemory={onClearMemory}
          />
          <div
            className="grow flex flex-col gap-2 overflow-y-auto scroll-smooth"
            onClick={onNext}
            data-testid="dialogueEntriesContainer"
          >
            {isMultiBubble &&
              entries.map((e, i) => {
                return (
                  <DialogueBubble
                    key={i}
                    content={e}
                    onOptionSelected={onOptionSelected}
                    showMetadata={showMetadata}
                  />
                );
              })}
            {!isMultiBubble && entries.length ? (
              <DialogueBubble
                content={entries[entries.length - 1]}
                onOptionSelected={onOptionSelected}
                showMetadata={showMetadata}
              />
            ) : null}
            <div ref={bottomRef}></div>
          </div>
          <div className="flex gap-1 items-center">
            <div className="grow">
              <DialogueParsingStatus status={fileHandler.getParseState()} error={parseError} />
            </div>

            <div className="tooltip" data-tip="Toggle debug panel">
              <button
                className="btn btn-ghost"
                onClick={onToggleDebugPanel}
                aria-label="Toggle debug panel"
              >
                <BugIcon size={16} />
              </button>
            </div>
          </div>
        </Panel>
        {isDebugPanelVisible && (
          <>
            <Separator className="divider p-1 m-1">
              <GripHorizontalIcon />
            </Separator>
            <Panel id="dp" defaultSize={200}>
              <DebugPanel
                interpreter={interpreter}
                isDialogueAvailable={currentDialoguePath !== ""}
                events={events}
                addEventToTimeline={addEventToTimeline}
                clearMemoryFlag={clearMemFlag}
              />
            </Panel>
          </>
        )}
      </Group>
    </div>
  );
}

function DialogueParsingStatus({
  status,
  error,
}: {
  status: ParseState;
  error: Error | UnexpectedTokenError | undefined;
}) {
  if (status === ParseState.PARSED) {
    return (
      <div className="flex items-center text-success" title="Parsing successful">
        <CircleCheckIcon size={16} />{" "}
      </div>
    );
  }

  if (status === ParseState.PARSE_ERROR) {
    const message = error!.message;
    return (
      <div
        className="flex items-center gap-2 text-error truncate"
        title={`parsing error: ${message}`}
      >
        <CircleXIcon size={16} />
        {message}
      </div>
    );
  }

  return (
    <div className="flex items-center text-neutral" title="Not parsed">
      <CircleDashedIcon size={16} />
    </div>
  );
}

function DialogueBubble({
  content,
  onOptionSelected,
  selection = -1,
  showMetadata,
}: {
  content: DialogueEntry;
  onOptionSelected: (optionIndex: number) => void;
  selection?: number;
  showMetadata: boolean;
}) {
  const [selectedOption, setOptionSelected] = useState(selection);

  if (content.type === "end") {
    return (
      <div className="bg-warning/50 text-warning-content font-bold rounded-box p-5 flex items-center justify-center">
        Dialogue Ended
      </div>
    );
  }

  if (content.type === "event") {
    return (
      <div className="bg-info/50 text-info-content font-bold rounded-box p-5 flex items-center justify-center">
        {content.text}
      </div>
    );
  }

  if (content.type === "selection") {
    return (
      <DialogueBubble
        content={content.content}
        onOptionSelected={onOptionSelected}
        selection={content.selection}
        showMetadata={showMetadata}
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
                  className={
                    selectedOption === i
                      ? "btn btn-ghost text-base-content font-bold"
                      : "btn btn-ghost"
                  }
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
      {showMetadata && (content.id || content.tags) && (
        <div className="text-base-content/70 text-right">
          {content.id && `id: ${content.id} `}
          {content.tags && content.tags.map((t) => `#${t} `)}
        </div>
      )}
    </div>
  );
}
