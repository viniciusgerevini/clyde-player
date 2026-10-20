import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readTextFile, stat } from "@tauri-apps/plugin-fs";
import { LazyStore } from "@tauri-apps/plugin-store";
import { AppContext } from "../AppContext";
import { createTestStore } from "../tests/testStore";
import { Player, PlayerParams } from "./Player";
import { mockIPC } from "@tauri-apps/api/mocks";
import { ParseState } from "../file/useFileHandler";
import { AppSettings } from "../store/useSettings";
import { DEBUG_PANEL_TEST_ID, PLAYER_ENTRIES_CONTAINER_TEST_ID } from "../tests/testIdentifiers";

import { Group } from "react-resizable-panels";

// this does not behave well in jsdom
vi.mock("react-resizable-panels", () => ({
  Group: vi.fn().mockImplementation(({ children, props }: any) => <div {...props}>{children}</div>),
  Panel: ({ children, props }: any) => <div {...props}>{children}</div>,
  Separator: ({ children, props }: any) => <div {...props}>{children}</div>,
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(),
  stat: vi.fn(),
}));

describe("Player", () => {
  let readTextFileStub = vi.mocked(readTextFile);
  let statStub = vi.mocked(stat);
  let store: LazyStore;
  let variablesStore: LazyStore;

  const renderPlayer = (
    { dialoguePath = "", onParseFinished = vi.fn() }: Partial<PlayerParams> | undefined = {
      dialoguePath: "fake_dialogue_path",
      onParseFinished: vi.fn(),
    },
  ) => {
    return render(
      playerWithContext({
        dialoguePath,
        onParseFinished,
      }),
    );
  };

  const playerWithContext = (params: PlayerParams) => {
    return (
      <AppContext value={{ store, variablesStore }}>
        <Player {...params} />
      </AppContext>
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

    readTextFileStub.mockResolvedValue("");
  });

  it("loads with an empty state", async () => {
    renderPlayer({ dialoguePath: "" });

    expect(screen.getByTitle("Not parsed")).toBeInTheDocument();
    expect(screen.getByLabelText("Next line")).toBeDisabled();
    expect(screen.getByLabelText("Restart")).toBeDisabled();
    expect(screen.getByLabelText("Forward to next choice")).toBeDisabled();
    expect(screen.getByLabelText("Poltergeist (auto-mode)")).toBeDisabled();
    expect(screen.getByLabelText("Clear memory")).toBeDisabled();
  });

  it("loads player with dialogue", async () => {
    readTextFileStub.mockResolvedValue("This is my first test dialogue");

    renderPlayer();

    expect(screen.getByLabelText("Next line")).not.toBeDisabled();
    expect(screen.getByLabelText("Restart")).not.toBeDisabled();
    expect(screen.getByLabelText("Forward to next choice")).not.toBeDisabled();
    expect(screen.getByLabelText("Poltergeist (auto-mode)")).not.toBeDisabled();
    expect(screen.getByLabelText("Clear memory")).not.toBeDisabled();

    // wait for parsing
    await waitFor(() => {
      expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
    });
  });

  it("gets next line when clicking entries container", async () => {
    readTextFileStub.mockResolvedValue("This is my first test dialogue");

    renderPlayer();

    // wait for parsing
    await waitFor(() => {
      expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

    expect(screen.getByText("This is my first test dialogue")).toBeInTheDocument();
  });

  it("renders speaker", async () => {
    readTextFileStub.mockResolvedValue("vini: hello there");

    renderPlayer();

    // wait for parsing
    await waitFor(() => {
      expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

    expect(screen.getByText("hello there")).toBeInTheDocument();
    expect(screen.getByText("vini")).toBeInTheDocument();
  });

  it("notifies parse finished when parse state changes", async () => {
    readTextFileStub.mockResolvedValue("This is my first test dialogue");

    const onParseFinished = vi.fn();

    renderPlayer({ dialoguePath: "fake_dialogue_path", onParseFinished });

    // wait for parsing
    await waitFor(() => {
      expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
    });

    expect(onParseFinished).toHaveBeenCalledWith(ParseState.PARSED);
  });

  it("shows and notifies parsing error", async () => {
    readTextFileStub.mockResolvedValue("this: dialogue is wrong: ahe");

    const onParseFinished = vi.fn();

    renderPlayer({ dialoguePath: "fake_dialogue_path", onParseFinished });

    // wait for parsing
    await waitFor(() => {
      expect(onParseFinished).toHaveBeenCalledWith(ParseState.PARSE_ERROR);
    });

    expect(screen.getByTitle(/parsing error: Unexpected token*/)).toBeInTheDocument();
  });

  it("fetches and updates external variables", async () => {
    readTextFileStub.mockResolvedValue("{set @test = 1}{ @test == 1 } this dialogue");

    const onParseFinished = vi.fn();

    renderPlayer({ dialoguePath: "fake_dialogue_path", onParseFinished });

    // wait for parsing
    await waitFor(() => {
      expect(onParseFinished).toHaveBeenCalledWith(ParseState.PARSED);
    });

    await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

    expect(variablesStore.set).toHaveBeenCalledWith("test", 1);
    // this entry proves fetching is working
    expect(screen.getByText("this dialogue"));
  });

  it("loads and clears on path change dialogue on path change", async () => {
    readTextFileStub.mockResolvedValue("This is a line");

    const onParseFinished = vi.fn();

    const { rerender } = renderPlayer({ dialoguePath: "fake_dialogue_path", onParseFinished });

    await waitFor(() => {
      expect(onParseFinished).toHaveBeenCalledWith(ParseState.PARSED);
    });

    await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

    expect(screen.getByText("This is a line")).toBeInTheDocument();

    rerender(
      playerWithContext({ dialoguePath: "another_dialogue_path", onParseFinished: vi.fn() }),
    );

    expect(screen.queryByText("This is a line")).not.toBeInTheDocument();
  });

  it("reloads dialogue when file changes", async () => {
    readTextFileStub.mockResolvedValue("This is a line");

    const onParseFinished = vi.fn();

    renderPlayer({ dialoguePath: "fake_dialogue_path", onParseFinished });

    await waitFor(() => {
      expect(onParseFinished).toHaveBeenCalledWith(ParseState.PARSED);
    });

    readTextFileStub.mockResolvedValue("This is a new line");

    statStub.mockResolvedValue({
      mtime: new Date(Date.now() + 1000),
    } as any);

    onParseFinished.mockClear();

    await waitFor(() => {
      // waiting for dialogue to load a second time
      expect(screen.getAllByText("Dialogue Loaded")).toHaveLength(2);
    });

    await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

    expect(screen.getByText("This is a new line")).toBeInTheDocument();
  });

  it("reschedule dialogue reload when file changes check fails", async () => {
    readTextFileStub.mockResolvedValue("This is a line");

    const onParseFinished = vi.fn();

    renderPlayer({ dialoguePath: "fake_dialogue_path", onParseFinished });

    await waitFor(() => {
      expect(onParseFinished).toHaveBeenCalledWith(ParseState.PARSED);
    });

    readTextFileStub.mockResolvedValue("This is a new line");

    statStub.mockRejectedValueOnce(new Error("Expected test error")).mockResolvedValueOnce({
      mtime: new Date(Date.now() + 1000),
    } as any);

    onParseFinished.mockClear();

    await waitFor(
      () => {
        // waiting for dialogue to load a second time
        expect(screen.getAllByText("Dialogue Loaded")).toHaveLength(2);
      },
      { timeout: 1500 },
    );

    await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

    expect(screen.getByText("This is a new line")).toBeInTheDocument();
  });

  it("does not reload dialogue when file check does not return a modification time", async () => {
    readTextFileStub.mockResolvedValue("This is a line");

    const onParseFinished = vi.fn();

    renderPlayer({ dialoguePath: "fake_dialogue_path", onParseFinished });

    await waitFor(() => {
      expect(onParseFinished).toHaveBeenCalledWith(ParseState.PARSED);
    });

    readTextFileStub.mockResolvedValue("This is a new line");

    statStub.mockResolvedValue({
      mtime: undefined,
    } as any);

    await new Promise((r) => setTimeout(r, 600));

    expect(screen.getAllByText("Dialogue Loaded")).toHaveLength(1);
  });

  describe("Action bar", () => {
    it("gets next line when clicking next", async () => {
      readTextFileStub.mockResolvedValue(
        "This is my first test dialogue\nThis is my second line\n",
      );

      renderPlayer();

      // wait for parsing
      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByText("This is my first test dialogue")).toBeInTheDocument();
      expect(screen.queryByText("This is my second line")).not.toBeInTheDocument();

      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByText("This is my second line")).toBeInTheDocument();
    });

    it("executes till next options when clicking forward", async () => {
      readTextFileStub.mockResolvedValue(`
This is my first test dialogue
This is my second line
These are options
  *= yes
  *= no
This line is after, so it shouldn't be there
`);

      renderPlayer();

      // wait for parsing
      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByLabelText("Forward to next choice"));

      expect(screen.getByText("This is my first test dialogue")).toBeInTheDocument();
      expect(screen.getByText("This is my second line")).toBeInTheDocument();
      expect(screen.getByText("These are options")).toBeInTheDocument();
      expect(
        screen.queryByText("This line is after, so it shouldn't be there"),
      ).not.toBeInTheDocument();
    });

    it("executes till end when clicking poltergeist", async () => {
      readTextFileStub.mockResolvedValue(`
This is my first test dialogue
This is my second line
These are options
  *= yes
  *= no
This line is after and poltergeist will get here
`);

      renderPlayer();

      // wait for parsing
      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByLabelText("Poltergeist (auto-mode)"));

      expect(screen.getByText("This is my first test dialogue")).toBeInTheDocument();
      expect(screen.getByText("This is my second line")).toBeInTheDocument();
      expect(screen.getByText("These are options")).toBeInTheDocument();
      expect(
        screen.getByText("This line is after and poltergeist will get here"),
      ).toBeInTheDocument();
    });

    it("clears dialogue memory", async () => {
      readTextFileStub.mockResolvedValue(`
{ set test ?= 0 }
This variable is only empty the first time %test%
{ set test += 1 }
`);

      renderPlayer();

      // wait for parsing
      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByText("This variable is only empty the first time 0")).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText("Next line"));
      await userEvent.click(screen.getByLabelText("Restart"));
      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByText("This variable is only empty the first time 1")).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText("Restart"));
      await userEvent.click(screen.getByLabelText("Clear memory"));
      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByText("This variable is only empty the first time 0")).toBeInTheDocument();
      expect(
        screen.queryByText("This variable is only empty the first time 1"),
      ).not.toBeInTheDocument();
    });

    it("changes selected block", async () => {
      readTextFileStub.mockResolvedValue(`
This is the default block

== b1
this is block 1

== b2
this is block 2

== b3 
this is block 3
`);

      renderPlayer();

      // wait for parsing
      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      screen.getByLabelText("Select default block");
      screen.getByLabelText("Select block b1");
      screen.getByLabelText("Select block b2");
      screen.getByLabelText("Select block b3");
      await userEvent.click(screen.getByLabelText("Select block b2"));
      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByText("Block selected: b2")).toBeInTheDocument();
      expect(screen.getByText("this is block 2")).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText("Select default block"));
      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByText("Block selected: Default")).toBeInTheDocument();
      expect(screen.getByText("This is the default block")).toBeInTheDocument();
    });

    it("toggles watch file", async () => {
      const fileWatchToggleLabel = "Toggle watch for file changes";
      readTextFileStub.mockResolvedValue("This is the original dialogue\n");

      renderPlayer();

      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      expect(screen.getByLabelText(fileWatchToggleLabel)).toBeChecked();

      await userEvent.click(screen.getByLabelText(fileWatchToggleLabel));

      expect(screen.getByLabelText(fileWatchToggleLabel)).not.toBeChecked();
      expect(store.set).toHaveBeenCalledWith(AppSettings.WATCH_FILE, false);

      // update file
      statStub.mockResolvedValue({
        mtime: new Date(Date.now() + 1000),
      } as any);

      readTextFileStub.mockResolvedValue("This is new content");

      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getAllByText("Dialogue Loaded")).toHaveLength(1);
      expect(screen.getByText("This is the original dialogue")).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText(fileWatchToggleLabel));
      expect(store.set).toHaveBeenCalledWith(AppSettings.WATCH_FILE, true);

      await waitFor(() => {
        // waiting for dialogue to load a second time
        expect(screen.getAllByText("Dialogue Loaded")).toHaveLength(2);
      });

      await userEvent.click(screen.getByLabelText("Next line"));
      expect(screen.getByText("This is new content")).toBeInTheDocument();
    });

    it("does not reload when same content", async () => {
      readTextFileStub.mockResolvedValue("This is the original dialogue\n");

      renderPlayer();

      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      // update file
      statStub.mockResolvedValue({
        mtime: new Date(Date.now() + 1000),
      } as any);

      await new Promise((r) => setTimeout(r, 500));

      expect(screen.getAllByText("Dialogue Loaded")).toHaveLength(1);
    });

    it("toggles multibubble", async () => {
      const multiBubbleToggleLabel = "Toggle multi-bubble mode";
      readTextFileStub.mockResolvedValue("First line\nSecond line\nThird line\nFourth line");

      renderPlayer();

      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByLabelText("Next line"));
      await userEvent.click(screen.getByLabelText("Next line"));
      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByText("First line")).toBeInTheDocument();
      expect(screen.getByText("Second line")).toBeInTheDocument();
      expect(screen.getByText("Third line")).toBeInTheDocument();

      expect(screen.getByLabelText(multiBubbleToggleLabel)).toBeChecked();
      await userEvent.click(screen.getByLabelText(multiBubbleToggleLabel));
      expect(screen.getByLabelText(multiBubbleToggleLabel)).not.toBeChecked();
      expect(store.set).toHaveBeenCalledWith(AppSettings.MULTI_BUBBLE, false);

      expect(screen.queryByText("First line")).not.toBeInTheDocument();
      expect(screen.queryByText("Second line")).not.toBeInTheDocument();
      expect(screen.getByText("Third line")).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.queryByText("Third line")).not.toBeInTheDocument();
      expect(screen.queryByText("Fourth line")).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText(multiBubbleToggleLabel));
      expect(screen.getByLabelText(multiBubbleToggleLabel)).toBeChecked();
      expect(store.set).toHaveBeenCalledWith(AppSettings.MULTI_BUBBLE, true);

      expect(screen.getByText("First line")).toBeInTheDocument();
      expect(screen.getByText("Second line")).toBeInTheDocument();
      expect(screen.getByText("Third line")).toBeInTheDocument();
      expect(screen.getByText("Fourth line")).toBeInTheDocument();
    });

    it("toggles metadata", async () => {
      const metadataToggleLabel = "Toggle show metadata";
      readTextFileStub.mockResolvedValue(`
Tags and ids #tag1 $id123
Only tags #tag1 #tag2
Only id $abc
Nothing
`);

      renderPlayer();

      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByLabelText("Next line"));
      await userEvent.click(screen.getByLabelText("Next line"));
      await userEvent.click(screen.getByLabelText("Next line"));
      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByLabelText(metadataToggleLabel)).not.toBeChecked();
      expect(screen.queryByText("id: id123 #tag1")).not.toBeInTheDocument();

      await userEvent.click(screen.getByLabelText(metadataToggleLabel));

      expect(screen.getByLabelText(metadataToggleLabel)).toBeChecked();
      expect(store.set).toHaveBeenCalledWith(AppSettings.SHOW_METADATA, true);

      expect(screen.getByText("id: id123 #tag1")).toBeInTheDocument();
      expect(screen.getByText("#tag1 #tag2")).toBeInTheDocument();
      expect(screen.getByText("id: abc")).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText(metadataToggleLabel));
      expect(screen.queryByText("id: id123 #tag1")).not.toBeInTheDocument();
    });

    it("opens theme selector and select theme", async () => {
      renderPlayer();

      // open
      expect(screen.queryByLabelText("App Theme Selector")).not.toBeInTheDocument();
      await userEvent.click(screen.getByLabelText("Open theme selector"));
      expect(screen.getByLabelText("App Theme Selector")).toBeInTheDocument();

      //select
      await userEvent.selectOptions(
        screen.getByLabelText("App Theme Selector"),
        screen.getByRole("option", { name: "lemonade" }),
      );
      expect(store.set).toHaveBeenCalledWith(AppSettings.THEME, "lemonade");

      // close
      await userEvent.click(screen.getByLabelText("Close theme selector"));
      expect(screen.queryByLabelText("App Theme Selector")).not.toBeInTheDocument();
    });

    it("opens about modal", async () => {
      renderPlayer();

      const modalTrigger = screen.getByLabelText("Open about modal");

      // Daisy UI modal does not follow idiomatic react contracts
      // so working it around for testing
      const getElementSpy = vi.spyOn(document, "getElementById");
      const showModalMock = vi.fn();
      getElementSpy.mockImplementationOnce((id) => {
        if (id === "aboutModal") {
          return { showModal: showModalMock } as any;
        }
      });

      await userEvent.click(modalTrigger);

      expect(getElementSpy).toHaveBeenCalledWith("aboutModal");
      expect(showModalMock).toHaveBeenCalled();
    });

    it("disable buttons when waiting for options", async () => {
      readTextFileStub.mockResolvedValue(`
These are options
  *= yes
  *= no
This line is after, so it shouldn't be there
`);

      renderPlayer();

      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByLabelText("Restart")).toBeEnabled();
      expect(screen.getByLabelText("Poltergeist (auto-mode)")).toBeEnabled();
      expect(screen.getByLabelText("Clear memory")).toBeEnabled();

      expect(screen.getByLabelText("Next line")).toBeDisabled();
      expect(screen.getByLabelText("Forward to next choice")).toBeDisabled();
    });

    it("disable buttons when dialogue ended", async () => {
      readTextFileStub.mockResolvedValue(`This line the only line`);

      renderPlayer();

      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByLabelText("Next line"));
      await userEvent.click(screen.getByLabelText("Next line"));

      expect(screen.getByText(/dialogue ended/i)).toBeInTheDocument();

      expect(screen.getByLabelText("Restart")).toBeEnabled();
      expect(screen.getByLabelText("Clear memory")).toBeEnabled();

      expect(screen.getByLabelText("Next line")).toBeDisabled();
      expect(screen.getByLabelText("Forward to next choice")).toBeDisabled();
      expect(screen.getByLabelText("Poltergeist (auto-mode)")).toBeDisabled();
    });
  });

  describe("Options/Branches", () => {
    it("selects dialogue option on click", async () => {
      readTextFileStub.mockResolvedValue(`
A dialogue line
options
  * yes
    answer for first option
  * no
    answer for second option
another line after options
`);

      renderPlayer();

      // wait for parsing
      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

      expect(screen.getByText("A dialogue line")).toBeInTheDocument();

      await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

      expect(screen.getByText("options")).toBeInTheDocument();
      expect(screen.getByText("1. yes")).toBeEnabled();
      expect(screen.getByText("2. no")).toBeEnabled();

      await userEvent.click(screen.getByText("1. yes"));

      expect(screen.getByText("answer for first option")).toBeInTheDocument();
      expect(screen.queryByText("answer for second option")).not.toBeInTheDocument();

      expect(screen.getByText("1. yes")).toBeDisabled();
      expect(screen.getByText("1. yes").classList.contains("font-bold")).toBe(true);
      expect(screen.getByText("2. no")).toBeDisabled();
      expect(screen.getByText("2. no").classList.contains("font-bold")).toBe(false);

      await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));
      expect(screen.getByText("another line after options")).toBeInTheDocument();
    });

    it("does not move forward when requesting next line when waiting for option selection", async () => {
      readTextFileStub.mockResolvedValue(`
options
  * yes
    answer for first option
  * no
    answer for second option
another line after options
`);

      renderPlayer();

      // wait for parsing
      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

      expect(screen.getByText("options")).toBeInTheDocument();
      expect(screen.getByText("1. yes")).toBeEnabled();
      expect(screen.getByText("2. no")).toBeEnabled();

      await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

      expect(screen.queryByText("answer for first option")).not.toBeInTheDocument();
      expect(screen.queryByText("answer for second option")).not.toBeInTheDocument();
      expect(screen.queryByText("another line after options")).not.toBeInTheDocument();

      await userEvent.click(screen.getByText("2. no"));

      expect(screen.getByText("answer for second option")).toBeInTheDocument();
    });

    it("clicking poltergeist mode works even when waiting for options", async () => {
      readTextFileStub.mockResolvedValue(`
options
  * yes
    answer for first option
  * no
    answer for second option
another line after options
`);

      renderPlayer();

      // wait for parsing
      await waitFor(() => {
        expect(screen.getByTitle("Parsing successful")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId(PLAYER_ENTRIES_CONTAINER_TEST_ID));

      expect(screen.getByText("options")).toBeInTheDocument();
      expect(screen.getByText("1. yes")).toBeEnabled();
      expect(screen.getByText("2. no")).toBeEnabled();

      await userEvent.click(screen.getByLabelText("Poltergeist (auto-mode)"));

      expect(screen.getByText(/answer for */)).toBeInTheDocument();
      expect(screen.getByText(/dialogue ended/i)).toBeInTheDocument();

      expect(screen.getAllByText("1. yes")).toHaveLength(2);
      // unfortunately poltergeist mode leaves an outdated entry for options
      // when started from an option. Confirming clicking the entry does not fail
      await userEvent.click(screen.getAllByText("1. yes")[0]);
      // confirms it's still rendered
      expect(screen.getByText(/dialogue ended/i)).toBeInTheDocument();
    });
  });

  describe("debug panel", () => {
    it("toggles debug panel", async () => {
      renderPlayer();

      expect(screen.queryByTestId(DEBUG_PANEL_TEST_ID)).not.toBeInTheDocument();

      await userEvent.click(screen.getByLabelText("Toggle debug panel"));

      expect(screen.getByTestId(DEBUG_PANEL_TEST_ID)).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText("Toggle debug panel"));

      expect(screen.queryByTestId(DEBUG_PANEL_TEST_ID)).not.toBeInTheDocument();
    });

    //  TODO test debugger are receiving events
  });

  describe("panel resize", () => {
    it("loads default sizes when configuration was persisted", async () => {
      const fakeConfig = { fake: "config" };

      vi.mocked(store.get).mockImplementation(async (cfg) => {
        if (cfg === AppSettings.PLAYER_DEBUGGER_LAYOUT) {
          return JSON.stringify(fakeConfig);
        }
      });
      renderPlayer();

      // wait a bit because settings are returned async
      await new Promise((r) => setTimeout(r, 500));

      const group = vi.mocked(Group);

      expect(group.mock.lastCall).toEqual(
        expect.arrayContaining([expect.objectContaining({ defaultLayout: fakeConfig })]),
      );
    });

    it("handles wrong persisted values gracefully", async () => {
      const fakeConfig = "this is not a valid json";

      vi.mocked(store.get).mockImplementation(async (cfg) => {
        if (cfg === AppSettings.PLAYER_DEBUGGER_LAYOUT) {
          return fakeConfig;
        }
      });
      renderPlayer();

      // wait a bit because settings are returned async
      await new Promise((r) => setTimeout(r, 500));

      expect(screen.getByTitle("Not parsed")).toBeInTheDocument();
    });

    it("persists layout changes when from a user interaction", async () => {
      renderPlayer();

      const group = vi.mocked(Group);
      const layoutCallback = group.mock.lastCall![0].onLayoutChanged;

      // fake config
      const newLayout = { g: 1 };

      act(() => {
        layoutCallback!(newLayout, { isUserInteraction: true });
      });

      expect(store.set).toHaveBeenCalledWith(
        AppSettings.PLAYER_DEBUGGER_LAYOUT,
        JSON.stringify(newLayout),
      );
    });

    it("does not persist layout changes when not from a user interaction", async () => {
      renderPlayer();

      const group = vi.mocked(Group);
      const layoutCallback = group.mock.lastCall![0].onLayoutChanged;

      // fake config
      const newLayout = { g: 1 };

      act(() => {
        layoutCallback!(newLayout, { isUserInteraction: false });
      });

      expect(store.set).not.toHaveBeenCalledWith(
        AppSettings.PLAYER_DEBUGGER_LAYOUT,
        JSON.stringify(newLayout),
      );
    });
  });
});
