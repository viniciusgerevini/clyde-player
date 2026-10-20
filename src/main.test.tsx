import { describe, it, expect, vi } from "vitest";
import { AppSettings } from "./store/useSettings";

import "./main";

vi.mock("react-dom/client", () => ({
  default: {
    createRoot: vi.fn().mockReturnValue({ render: vi.fn() }),
  },
}));

vi.mock(import("@tauri-apps/plugin-store"), async (importOriginal) => {
  const mod = await importOriginal();
  vi.spyOn(mod.LazyStore.prototype, "get").mockImplementation(async (key) => {
    if (key === AppSettings.THEME) {
      return "some-fake-theme";
    }
  });

  return {
    ...mod,
  };
});

describe("Main", () => {
  it("load theme on startup", () => {
    expect(document.querySelector("html")?.getAttribute("data-theme")).toEqual("some-fake-theme");
  });
});
