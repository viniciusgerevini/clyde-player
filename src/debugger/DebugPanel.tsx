import { useEffect, useMemo, useRef, useState } from "react";
import { PencilIcon, SaveIcon, SquarePlusIcon, TrashIcon, XIcon } from "lucide-react";
import { InterpreterInstance, EventType } from "@clyde-lang/interpreter";

interface DebugPanelParams {
  interpreter: InterpreterInstance;
  isDialogueAvailable: boolean;
}

export function DebugPanel({ interpreter, isDialogueAvailable }: DebugPanelParams) {
  const variablesRef = useRef<VariablesList>({});
  const [variables, setVariables] = useState<VariablesList>({});

  // TODO implement external variables
  const externalVariables: VariablesList =  {
    "banana": { type: "string", value: "123" },
  };

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
        value: vars[v]
      }
    }
    variablesRef.current = list;
    setVariables({...list});

    interpreter.on(EventType.VARIABLE_CHANGED, onVariableChanged);

    return () => {
      interpreter.off(EventType.VARIABLE_CHANGED, onVariableChanged);
    };
  }, [interpreter]);

  const onVariableChanged = (params: { name: string, value: any }) => {
    if (typeof params.value === "undefined") {
      delete variablesRef.current[params.name];
    } else {
      variablesRef.current[params.name] = {
        type: typeof params.value,
        value: params.value
      };
    }
    setVariables({...variablesRef.current});
  };


  const onVariableUpdate = (params: { name: string; value: any; type: string}) => {
    interpreter.setVariable(params.name, params.value);
  };

  const onVariableDeleted = (name: string) => {
    interpreter.setVariable(name, undefined);
  };

  // TODO save external variables
  // TODO load external variables to  dialogue when loaded
  return <div className="min-h-30 flex gap-2 h-full overflow-hidden">
    <div className="w-2/3">
      <div className="tabs tabs-lift p-2 h-full">
        <input type="radio" name="variables_tabs" className="tab" aria-label="Variables" />
        <VariableTabContent variables={variables} onChange={onVariableUpdate} onDeleted={onVariableDeleted} isEnabled={isDialogueAvailable}/>
        <input type="radio" name="variables_tabs" className="tab" aria-label="External variables" defaultChecked />
        <VariableTabContent
          variables={externalVariables}
          onChange={() => {}}
          onDeleted={() => {}}
          isEnabled={isDialogueAvailable}
        />
      </div>
    </div>
    <div className="w-1/3">
      history
    </div>
  </div>;
}

type VariablesList = Record<string, { type: string; value: any }>;

// TODO add new variable
function VariableTabContent({ variables, onChange, onDeleted, isEnabled }: {
  variables: VariablesList,
  onChange: (params: { name: string; value: any; type: string}) => void; 
  onDeleted: (name: string) => void;
  isEnabled: boolean;
}) {
  const [isAddingNew, setIsAddingNew] = useState(false);

  const content = useMemo(() => {
    return Object.keys(variables).map((variableName) => <VariableRow
      key={variableName}
      variableName={variableName}
      variableValue={variables[variableName].value}
      variableType={variables[variableName].type}
      onChange={onChange}
      onDeleted={onDeleted}
    />);
  }, [variables])

  return <div className="tab-content bg-base-100 border-base-300 p-2 overflow-y-auto">
      <div className="flex justify-end z-10">
        <button
          className="btn btn-sm btn-ghost"
        disabled={isAddingNew || !isEnabled} onClick={() => setIsAddingNew(true)}><SquarePlusIcon size={16} /></button>
      </div>
      <div className="flex overflow-y-auto">
        <div className="grid grid-cols-4 w-full">
          {isAddingNew && <VariableRow 
            variableName={""}
            variableValue={""}
            variableType={"string"}
            onChange={(c) => { setIsAddingNew(false); onChange(c);}}
            onDeleted={() => { setIsAddingNew(false) }}
            isNew={true}
          />}
          {content}
        </div>
      </div>
  </div>;
}

interface VariableRowParams {
  variableName: string;
  variableValue: any;
  variableType: string;
  isNew?: boolean;
  onChange: (params: { name: string; value: any; type: string }) => void;
  onDeleted: (name: string) => void;
}

const variableTypes = [ "Boolean", "Number", "String" ];

function VariableRow({variableName, variableValue, variableType, isNew, onChange, onDeleted }: VariableRowParams) {
  const [name, setName] = useState(variableName);
  const [value, setValue] = useState(variableValue);
  const [varType, setVarType] = useState(variableType);
  const [isEditing, setIsEditing] = useState(isNew)

  const cancelChanges = () => {
    if (isNew) {
      onDeleted(variableName);
      return;
    }
    setIsEditing(false);
    setName(variableName);
    setVarType(variableType);
    setValue(variableValue);
  }

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

  return <>
    <div className="p-1 flex items-center">
      { isEditing ? (
        <input
          type="text"
          placeholder="Variable name"
          className="input validator"
          pattern="[A-Za-z][A-Za-z0-9_]*"
          value={name}
          required
          onChange={(e) => { setName(e.target.value) }} />
      ) : (<>
          {name}
        </>)}
    </div>
    <div className="p-1 flex items-center">
      { isEditing ? (
        <select className="select" value={varType} onChange={(e) => onValueTypeChange(e.target.value)}>
          { variableTypes.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
        </select>
      ) : <VariableTypeBadge variableType={varType} />
      }
    </div>
    <div className="p-1 flex items-center">
      { isEditing ? (
        <VariableRowValue variableType={varType} variableValue={value} onChange={(v) => {
          setValue(v);
        }} />
      ) : <code>{varType === "boolean" ? (value ? "True" : "False") : value}</code>
      }
    </div>
    <div className="p-1 flex gap-1 items-center justify-end">
      { isEditing ? (<>
        <button className="btn btn-sm" aria-label="Save changes" title="Save changes" onClick={saveChanges}>
          <SaveIcon size={16}/>
        </button>
        <button className="btn btn-sm" onClick={() => cancelChanges()} aria-label="Cancel changes" title="Cancel changes"><XIcon size={16}/></button>

      </>) : (<>
          <button className="btn btn-sm" aria-label="Edit variable" title="Edit variable" onClick={() => setIsEditing(true)}>
            <PencilIcon size={16}/>
          </button>
          <button className="btn btn-sm" aria-label="Delete variable" title="Delete variable" onClick={deleteVariable}>
            <TrashIcon size={16}/>
          </button>
      </>)}
    </div>
  </>;
}


function VariableTypeBadge({variableType}: {variableType: string}) {
  if (variableType === "boolean") {
    return <div className="badge badge-success" title="Boolean">B</div>;
  }

  if (variableType === "number") {
    return <div className="badge badge-info" title="Number">N</div>;
  }

  return <div className="badge badge-warning" title="String">S</div>;
}

function VariableRowValue({variableType, variableValue, onChange} : { variableType: string, variableValue: any, onChange: (value: any) => void; }) {
  if (variableType === "boolean") {
    return <input
      type="checkbox"
      checked={variableValue}
      className="checkbox"
      onChange={(e) => onChange(e.target.checked)} />;
  }

  if (variableType === "number") {
    return <input
      type="number"
      value={variableValue}
      className="input validator"
      onChange={(e) => onChange(Number(e.target.value))}
    />;
  }

  return <input
    type="text"
    placeholder="Value"
    className="input"
    value={variableValue}
    onChange={(e) => onChange(e.target.value)}
  />
}

