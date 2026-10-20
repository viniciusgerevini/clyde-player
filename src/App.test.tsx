import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readTextFile, stat } from "@tauri-apps/plugin-fs";
import { LazyStore } from "@tauri-apps/plugin-store";
import { AppContext } from "./AppContext";
import { createTestStore } from "./tests/testStore";
import { mockIPC } from "@tauri-apps/api/mocks";
import App from "./App";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";

// this does not behave well in jsdom
vi.mock("react-resizable-panels", () => ({
  Group: ({ children, props }: any) => <div {...props}>{children}</div>,
  Panel: ({ children, props }: any) => <div {...props}>{children}</div>,
  Separator: ({ children, props }: any) => <div {...props}>{children}</div>,
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(),
  stat: vi.fn(),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));

vi.mock("@tauri-apps/api/path", () => ({
  basename: vi.fn().mockImplementation((p: string) => p.split("/")[p.length - 1]),
}));

describe("App", () => {
  let readTextFileStub = vi.mocked(readTextFile);
  let statStub = vi.mocked(stat);
  let getCurrentWindowStub = vi.mocked(getCurrentWindow);
  let store: LazyStore;
  let variablesStore: LazyStore;

  let windowShowStub: Mock;
  let windowFocusStub: Mock;

  const renderApp = () => {
    return render(
      <AppContext value={{ store, variablesStore }}>
        <App />
      </AppContext>,
    );
  };

  beforeEach(() => {
    store = createTestStore();
    variablesStore = createTestStore();

    // scroll into view is not available in JSDOM
    window.HTMLElement.prototype.scrollIntoView ??= vi.fn();

    mockIPC((_cmd, _args) => {
      return;
    });

    // only defining what the player cares about
    statStub.mockResolvedValue({
      mtime: new Date(),
    } as any);

    readTextFileStub.mockResolvedValue("Fake dialogue");

    windowShowStub = vi.fn();
    windowFocusStub = vi.fn();

    getCurrentWindowStub.mockClear();
    getCurrentWindowStub.mockReturnValue({
      show: windowShowStub,
      setFocus: windowFocusStub,
    } as any);

    vi.mocked(open).mockClear();
  });

  it("renders app with theme and make window visible", async () => {
    renderApp();
    expect(screen.getByText("No dialogue file open")).toBeInTheDocument();
    expect(screen.getByTitle("Not parsed")).toBeInTheDocument();

    await waitFor(() => {
      expect(getCurrentWindowStub).toHaveBeenCalled();
    });

    expect(document.querySelector("html")?.getAttribute("data-theme")).toEqual("light");
    expect(windowShowStub).toHaveBeenCalled();
    expect(windowFocusStub).toHaveBeenCalled();
  });

  it("open new file", async () => {
    renderApp();
    const filePath = "/some/file.clyde";
    vi.mocked(open).mockResolvedValue(filePath);
    await userEvent.click(screen.getByLabelText("File menu"));
    await userEvent.click(screen.getByLabelText("Open dialogue file"));

    const fileField = screen.getByLabelText("Open file name");

    expect(fileField.title).toBe(filePath);
    expect(screen.getByLabelText(`Recent file ${filePath}`)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
    });
  });

  it("aborts when canceled opening new file", async () => {
    renderApp();
    vi.mocked(open).mockResolvedValue(undefined); // undefined when canceled
    await userEvent.click(screen.getByLabelText("File menu"));
    await userEvent.click(screen.getByLabelText("Open dialogue file"));

    expect(screen.getByText("No dialogue file open")).toBeInTheDocument();
  });

  it("open from recent files", async () => {
    vi.mocked(store.get).mockImplementation(async (key) => {
      if (key === "recent_files") {
        return ["/some/file.clyde", "/another/file.clyde"];
      }
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByLabelText(`Recent file /some/file.clyde`)).toBeInTheDocument();
      expect(screen.getByLabelText(`Recent file /another/file.clyde`)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText(`Recent file /another/file.clyde`));

    await waitFor(() => {
      expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
    });

    // confirm opened file became first in the list
    expect(store.set).toHaveBeenCalledWith("recent_files", [
      "/another/file.clyde",
      "/some/file.clyde",
    ]);
  });

  it("keeps a maximum of 10 recent files in the list", async () => {
    vi.mocked(store.get).mockImplementation(async (key) => {
      if (key === "recent_files") {
        return [
          "/some/file1.clyde",
          "/some/file2.clyde",
          "/some/file3.clyde",
          "/some/file4.clyde",
          "/some/file5.clyde",
          "/some/file6.clyde",
          "/some/file7.clyde",
          "/some/file8.clyde",
          "/some/file9.clyde",
          "/some/file10.clyde",
        ];
      }
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByLabelText(`Recent file /some/file1.clyde`)).toBeInTheDocument();
    });

    const filePath = "/some/new_file.clyde";
    vi.mocked(open).mockResolvedValue(filePath);
    await userEvent.click(screen.getByLabelText("File menu"));
    await userEvent.click(screen.getByLabelText("Open dialogue file"));

    await waitFor(() => {
      expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
    });

    // confirm opened file became first in the list
    expect(store.set).toHaveBeenCalledWith("recent_files", [
      "/some/new_file.clyde",
      "/some/file1.clyde",
      "/some/file2.clyde",
      "/some/file3.clyde",
      "/some/file4.clyde",
      "/some/file5.clyde",
      "/some/file6.clyde",
      "/some/file7.clyde",
      "/some/file8.clyde",
      "/some/file9.clyde",
    ]);
  });

  it("shows error badge when dialogue fails parsing", async () => {
    readTextFileStub.mockResolvedValue("failed:dialogue:");
    renderApp();
    const filePath = "/some/file.clyde";
    vi.mocked(open).mockResolvedValue(filePath);
    await userEvent.click(screen.getByLabelText("File menu"));
    await userEvent.click(screen.getByLabelText("Open dialogue file"));

    const fileField = screen.getByLabelText("Open file name");

    expect(fileField.title).toBe(filePath);
    expect(screen.getByLabelText(`Recent file ${filePath}`)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTitle(/parsing error: Unexpected token*/)).toBeInTheDocument();
      expect(screen.getByLabelText("Dialogue status badge: error")).toBeInTheDocument();
    });
  });
});
