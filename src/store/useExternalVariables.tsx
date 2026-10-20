import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useVariablesStore } from "./store";

type VariablesList = Record<string, { type: string; value: any }>;

export function useExternalVariables(): {
  externalVariablesRef: RefObject<VariablesList>;
  allVariables: VariablesList;
  setVariable: (name: string, value: any) => void;
  // getVariable: (name: string) => any;
  removeVariable: (name: string) => void;
} {
  const store = useVariablesStore();

  const externalVariablesRef = useRef<VariablesList>({});
  const [allVariables, setAllVariables] = useState<VariablesList>({});

  const setVariable = useCallback((name: string, value: any) => {
    externalVariablesRef.current[name] = {
      type: typeof value,
      value: value,
    };
    store.set(name, value);
  }, []);

  const removeVariable = useCallback((name: string) => {
    store.delete(name);
  }, []);

  // const getVariable = useCallback(
  //   (name: string): any => {
  //     return allVariables[name]?.value;
  //   },
  //   [allVariables],
  // );

  useEffect(() => {
    const refresh = async () => {
      const result = await store.entries();

      externalVariablesRef.current = {};

      for (var e of result) {
        const [k, v] = e;

        if (typeof v === "undefined") {
          continue;
        }
        externalVariablesRef.current[k] = {
          type: typeof v,
          value: v,
        };
      }

      setAllVariables({ ...externalVariablesRef.current });
    };

    refresh();

    let unregister: () => void;
    let wasOffloaded: boolean = false;

    (async () => {
      unregister = await store.onChange((key: string, value: any) => {
        if (typeof value === "undefined") {
          delete externalVariablesRef.current[key];
        } else {
          externalVariablesRef.current[key] = {
            type: typeof value,
            value,
          };
        }
        setAllVariables({ ...externalVariablesRef.current });
      });

      if (wasOffloaded) {
        if (unregister) {
          unregister();
        }
      }
    })();

    return () => {
      wasOffloaded = true;
      if (unregister) {
        unregister();
      }
    };
  }, []);

  return {
    externalVariablesRef,
    allVariables,
    setVariable,
    // getVariable,
    removeVariable,
  };
}
