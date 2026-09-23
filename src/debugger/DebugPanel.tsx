import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import {
  CheckIcon,
  GripVerticalIcon,
  MessageCircleCheckIcon,
  PencilIcon,
  PowerIcon,
  RotateCcwIcon,
  SaveIcon,
  SparkleIcon,
  SquareMousePointerIcon,
  SquarePlusIcon,
  TrashIcon,
  VariableIcon,
  XIcon,
} from "lucide-react";
import { InterpreterInstance, EventType } from "@clyde-lang/interpreter";
import { TimelineEvent, TimelineEventTitles } from "./useEventTimeline";
import { useExternalVariables } from "../store/useExternalVariables";

interface DebugPanelParams {
  interpreter: InterpreterInstance;
  isDialogueAvailable: boolean;
  events: TimelineEvent[];
  addEventToTimeline: (event: TimelineEvent) => void;
}

// TODO fix grid (fields overlapping)
export function DebugPanel({
  interpreter,
  isDialogueAvailable,
  events,
  addEventToTimeline,
}: DebugPanelParams) {
  const variablesRef = useRef<VariablesList>({});
  const [variables, setVariables] = useState<VariablesList>({});

  const {
    allVariables: externalVariables,
    setVariable: setExternalVariable,
    removeVariable: removeExternalVariable,
  } = useExternalVariables();

  useEffect(() => {
    const data = interpreter.getData();
    const vars = data.variables;

    const list: VariablesList = {};

    for (const v in vars) {
      const t = typeof vars[v];

      if (t === "undefined") {
        continue;
      }

      list[v] = {
        type: t,
        value: vars[v],
      };
    }
    variablesRef.current = list;
    setVariables({ ...list });

    interpreter.on(EventType.VARIABLE_CHANGED, onVariableChanged);
    interpreter.on(EventType.EVENT_TRIGGERED, onEventTriggered);

    return () => {
      interpreter.off(EventType.VARIABLE_CHANGED, onVariableChanged);
      interpreter.off(EventType.EVENT_TRIGGERED, onEventTriggered);
    };
  }, [interpreter]);

  const onVariableChanged = (params: { name: string; value: any }) => {
    if (typeof params.value === "undefined") {
      delete variablesRef.current[params.name];
    } else {
      variablesRef.current[params.name] = {
        type: typeof params.value,
        value: params.value,
      };
    }
    setVariables({ ...variablesRef.current });
    addEventToTimeline({
      timestamp: Date.now(),
      title: TimelineEventTitles.VARIABLE_CHANGED,
      description: `name: ${params.name}, value: ${params.value}`,
    });
  };

  const onEventTriggered = (params: any) => {
    addEventToTimeline({
      timestamp: Date.now(),
      title: TimelineEventTitles.EVENT_TRIGGERED,
      description: `name: ${params.name} ${params.parameters?.length ? `, parameters: ${params.parameters.join(",")}` : ""}`,
    });
  };

  const onVariableUpdate = (params: { name: string; value: any; type: string }) => {
    interpreter.setVariable(params.name, params.value);
  };

  const onVariableDeleted = (name: string) => {
    interpreter.setVariable(name, undefined);
  };

  const onExternalVariableUpdate = (params: { name: string; value: any; type: string }) => {
    setExternalVariable(params.name, params.value);
  };

  const onExternalVariableDeleted = (name: string) => {
    removeExternalVariable(name);
  };

  return (
    <div className="min-h-30 h-full overflow-hidden">
      <Group id="dbgs" orientation="horizontal">
        <Panel id="dbl">
          <div className="flex flex-col overflow-hidden">
            <div className="tabs tabs-lift p-2 h-full">
              <input
                type="radio"
                name="variables_tabs"
                className="tab"
                aria-label="Variables"
                defaultChecked
              />
              <VariableTabContent
                variables={variables}
                onChange={onVariableUpdate}
                onDeleted={onVariableDeleted}
                isEnabled={isDialogueAvailable}
              />
              <input
                type="radio"
                name="variables_tabs"
                className="tab"
                aria-label="External variables"
              />
              <VariableTabContent
                variables={externalVariables}
                onChange={onExternalVariableUpdate}
                onDeleted={onExternalVariableDeleted}
                isEnabled={true}
              />
            </div>
          </div>
        </Panel>

        <Separator className="divider divider-horizontal p-1 m-1">
          <GripVerticalIcon />
        </Separator>
        <Panel id="dpr">
          <div className="tabs tabs-lift p-2 h-full">
            <input
              type="radio"
              name="history_tabs"
              className="tab"
              aria-label="History"
              defaultChecked
            />
            <div className="tab-content bg-base-100 border-base-300 p-2 overflow-y-auto pt-5">
              <EventTimeline events={events} />
            </div>
          </div>
        </Panel>
      </Group>
    </div>
  );
}

type VariablesList = Record<string, { type: string; value: any }>;

function VariableTabContent({
  variables,
  onChange,
  onDeleted,
  isEnabled,
}: {
  variables: VariablesList;
  onChange: (params: { name: string; value: any; type: string }) => void;
  onDeleted: (name: string) => void;
  isEnabled: boolean;
}) {
  const [isAddingNew, setIsAddingNew] = useState(false);

  const content = useMemo(() => {
    return Object.keys(variables).map((variableName) => (
      <VariableRow
        key={variableName}
        variableName={variableName}
        variableValue={variables[variableName].value}
        variableType={variables[variableName].type}
        onChange={onChange}
        onDeleted={onDeleted}
      />
    ));
  }, [variables]);

  return (
    <div className="tab-content bg-base-100 border-base-300 p-2 overflow-y-auto">
      <div className="flex justify-end z-10">
        <button
          className="btn btn-sm btn-ghost"
          disabled={isAddingNew || !isEnabled}
          onClick={() => setIsAddingNew(true)}
        >
          <SquarePlusIcon size={16} />
        </button>
      </div>
      <div className="flex overflow-y-auto">
        <div className="grid grid-cols-4 w-full">
          {isAddingNew && (
            <VariableRow
              variableName={""}
              variableValue={""}
              variableType={"string"}
              onChange={(c) => {
                setIsAddingNew(false);
                onChange(c);
              }}
              onDeleted={() => {
                setIsAddingNew(false);
              }}
              isNew={true}
            />
          )}
          {content}
        </div>
      </div>
    </div>
  );
}

interface VariableRowParams {
  variableName: string;
  variableValue: any;
  variableType: string;
  isNew?: boolean;
  onChange: (params: { name: string; value: any; type: string }) => void;
  onDeleted: (name: string) => void;
}

const variableTypes = ["Boolean", "Number", "String"];

function VariableRow({
  variableName,
  variableValue,
  variableType,
  isNew,
  onChange,
  onDeleted,
}: VariableRowParams) {
  const [name, setName] = useState(variableName);
  const [value, setValue] = useState(variableValue);
  const [varType, setVarType] = useState(variableType);
  const [isEditing, setIsEditing] = useState(isNew);

  useEffect(() => {
    setVarType(variableType);
    setValue(variableValue);
  }, [variableValue]);

  const cancelChanges = () => {
    if (isNew) {
      onDeleted(variableName);
      return;
    }
    setIsEditing(false);
    setName(variableName);
    setVarType(variableType);
    setValue(variableValue);
  };

  const saveChanges = () => {
    if (name === "") {
      return;
    }
    if (name !== variableName) {
      onDeleted(variableName);
    }
    onChange({
      name,
      value,
      type: varType,
    });
    setIsEditing(false);
  };

  const deleteVariable = () => {
    onDeleted(variableName);
  };

  const onValueTypeChange = (t: string) => {
    if (t === "number") {
      if (isNaN(value)) {
        setValue(undefined);
      }
    } else if (t === "boolean") {
      setValue(false);
    }
    setVarType(t);
  };

  return (
    <>
      <div className="p-1 flex items-center">
        {isEditing ? (
          <input
            type="text"
            placeholder="Variable name"
            className="input validator"
            pattern="[A-Za-z][A-Za-z0-9_]*"
            value={name}
            required
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        ) : (
          <>{name}</>
        )}
      </div>
      <div className="p-1 flex items-center">
        {isEditing ? (
          <select
            className="select"
            value={varType}
            onChange={(e) => onValueTypeChange(e.target.value)}
          >
            {variableTypes.map((o) => (
              <option key={o} value={o.toLowerCase()}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <VariableTypeBadge variableType={varType} />
        )}
      </div>
      <div className="p-1 flex items-center">
        {isEditing ? (
          <VariableRowValue
            variableType={varType}
            variableValue={value}
            onChange={(v) => {
              setValue(v);
            }}
          />
        ) : (
          <code>{varType === "boolean" ? (value ? "True" : "False") : value}</code>
        )}
      </div>
      <div className="p-1 flex gap-1 items-center justify-end">
        {isEditing ? (
          <>
            <button
              className="btn btn-sm"
              aria-label="Save changes"
              title="Save changes"
              onClick={saveChanges}
            >
              <SaveIcon size={16} />
            </button>
            <button
              className="btn btn-sm"
              onClick={() => cancelChanges()}
              aria-label="Cancel changes"
              title="Cancel changes"
            >
              <XIcon size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-sm"
              aria-label="Edit variable"
              title="Edit variable"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon size={16} />
            </button>
            <button
              className="btn btn-sm"
              aria-label="Delete variable"
              title="Delete variable"
              onClick={deleteVariable}
            >
              <TrashIcon size={16} />
            </button>
          </>
        )}
      </div>
    </>
  );
}

function VariableTypeBadge({ variableType }: { variableType: string }) {
  if (variableType === "boolean") {
    return (
      <div className="badge badge-success" title="Boolean">
        B
      </div>
    );
  }

  if (variableType === "number") {
    return (
      <div className="badge badge-info" title="Number">
        N
      </div>
    );
  }

  return (
    <div className="badge badge-warning" title="String">
      S
    </div>
  );
}

function VariableRowValue({
  variableType,
  variableValue,
  onChange,
}: {
  variableType: string;
  variableValue: any;
  onChange: (value: any) => void;
}) {
  if (variableType === "boolean") {
    return (
      <input
        type="checkbox"
        checked={variableValue}
        className="checkbox"
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }

  if (variableType === "number") {
    return (
      <input
        type="number"
        value={variableValue}
        className="input validator"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }

  return (
    <input
      type="text"
      placeholder="Value"
      className="input"
      value={variableValue}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function EventTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ul className="timeline timeline-vertical">
      {events.map((e, i) => {
        return (
          <li key={`${e.timestamp}${e.title}${e.description}`}>
            {i > 0 && <hr />}
            <div className="timeline-start text-xs">
              <EventDate timestamp={e.timestamp} />
            </div>
            <div className="timeline-middle">
              <EventIcon title={e.title} />
            </div>
            <div className="timeline-end timeline-box">
              <span className="font-semibold">{e.title}</span>
              {e.description ? ` | ${e.description}` : ""}
            </div>
            <hr />
          </li>
        );
      })}

      <li>
        <hr />
        <div className="timeline-middle">
          <EventIcon title="start" />
        </div>
      </li>
    </ul>
  );
}

function EventDate({ timestamp }: { timestamp: number }) {
  const date = new Date(timestamp);

  const dateParts = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
  ];

  const hourParts = [
    date.getHours().toString().padStart(2, "0"),
    date.getMinutes().toString().padStart(2, "0"),
    date.getSeconds().toString().padStart(2, "0"),
  ];

  return <>{`${dateParts.join("-")} ${hourParts.join(":")}`}</>;
}

function EventIcon({ title }: { title: string }) {
  const iconSize = 10;
  let icon = <CheckIcon size={iconSize} />;
  if (title === TimelineEventTitles.EVENT_TRIGGERED) {
    icon = <SparkleIcon size={iconSize} />;
  }

  if (title === TimelineEventTitles.VARIABLE_CHANGED || title === TimelineEventTitles.EXTERNAL_VARIABLE_CHANGED) {
    icon = <VariableIcon size={iconSize} />;
  }

  if (title === TimelineEventTitles.BLOCK_SELECTED) {
    icon = <SquareMousePointerIcon size={iconSize} />;
  }

  if (title === TimelineEventTitles.DIALOGUE_ENDED) {
    icon = <MessageCircleCheckIcon size={iconSize} />;
  }

  if (title === TimelineEventTitles.DIALOGUE_LOADED) {
    icon = <RotateCcwIcon size={iconSize} />;
  }

  if (title === "start") {
    icon = <PowerIcon size={iconSize} />;
  }

  return (
    <div className="p-1 bg-neutral text-neutral-content rounded-full" title={title}>
      {icon}
    </div>
  );
}
