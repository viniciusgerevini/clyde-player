import { LazyStore } from "@tauri-apps/plugin-store";
import { vi } from "vitest";

export function createTestStore(): LazyStore {
  const entries = vi.fn().mockResolvedValue([]);
  const onChange = vi.fn();
  const onKeyChange = vi.fn();

  const setStub = vi.fn().mockImplementation((variable, value) => {
    const c = onKeyChange.mock.calls;
    if (c.length) {
      for (const listener of c) {
        if (listener[0] === variable) {
          listener[1](value);
        }
      }
    }
    const changeListeners = onChange.mock.calls;

    if (changeListeners.length) {
      for (const listener of changeListeners) {
        listener[0](variable, value);
      }
    }
  });
  const deleteStub = vi.fn();
  const getStub = vi.fn();

  return {
    entries,
    onChange,
    onKeyChange,
    set: setStub,
    delete: deleteStub,
    get: getStub,
  } as Partial<LazyStore> as LazyStore;
}
