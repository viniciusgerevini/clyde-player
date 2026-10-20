import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, getByText, getByTitle, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DebugPanel, DebugPanelParams } from "./DebugPanel";
import { Interpreter } from "@clyde-lang/interpreter";
import { ClydeDocumentRoot, parse } from "@clyde-lang/parser";
import { LazyStore } from "@tauri-apps/plugin-store";
import { AppContext } from "../AppContext";
import { createTestStore } from "../tests/testStore";
import { TimelineEventTitles } from "./useEventTimeline";
import { EventType } from "@clyde-lang/interpreter";

// this does not behave well in jsdom
vi.mock("react-resizable-panels", () => ({
  Group: ({ children, props }: any) => <div {...props}>{children}</div>,
  Panel: ({ children, props }: any) => <div {...props}>{children}</div>,
  Separator: ({ children, props }: any) => <div {...props}>{children}</div>,
}));

describe("DebugPanel", () => {
  let store: LazyStore;
  let variablesStore: LazyStore;

  const renderDebugPanel = ({
    interpreter = Interpreter(new ClydeDocumentRoot()),
    isDialogueAvailable = true,
    addEventToTimeline = vi.fn(),
    clearMemoryFlag = 0,
    events = [],
  }: Partial<DebugPanelParams>) => {
    return render(
      debugPanelWithContext({
        interpreter,
        isDialogueAvailable,
        addEventToTimeline,
        clearMemoryFlag,
        events,
      }),
    );
  };

  const debugPanelWithContext = (params: DebugPanelParams) => {
    return (
      <AppContext value={{ store, variablesStore }}>
        <DebugPanel {...params} />
      </AppContext>
    );
  };

  beforeEach(() => {
    store = createTestStore();
    variablesStore = createTestStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders initial empty state and setup listeners", async () => {
    const interpreter = Interpreter(new ClydeDocumentRoot());

    const onSpy = vi.spyOn(interpreter, "on");
    const offSpy = vi.spyOn(interpreter, "off");

    renderDebugPanel({ interpreter });

    expect(screen.getByLabelText("History")).toBeChecked();
    expect(screen.getByLabelText("Variables")).toBeChecked();
    expect(screen.getByLabelText("External variables")).not.toBeChecked();

    expect(onSpy).toHaveBeenCalledWith(EventType.VARIABLE_CHANGED, expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith(EventType.EVENT_TRIGGERED, expect.any(Function));
    expect(offSpy).not.toHaveBeenCalled();
  });

  it("renders existing variables", async () => {
    const interpreter = Interpreter(new ClydeDocumentRoot());
    interpreter.setVariable("test_string", "hello");
    interpreter.setVariable("test_boolean", true);
    interpreter.setVariable("test_number", 1234);
    interpreter.setVariable("test_undefined", undefined); // should not be included in the list

    renderDebugPanel({ interpreter });

    expect(screen.getByLabelText("Variables")).toBeChecked();

    const stringVar = screen.getByText("test_string");
    const numberVar = screen.getByText("test_number");
    const booleanVar = screen.getByText("test_boolean");

    expect(stringVar).toBeInTheDocument();
    expect(getByText(stringVar.parentElement!, "hello")).toBeInTheDocument();
    expect(getByTitle(stringVar.parentElement!, "String")).toBeInTheDocument();

    expect(numberVar).toBeInTheDocument();
    expect(getByText(numberVar.parentElement!, "1234")).toBeInTheDocument();
    expect(getByTitle(numberVar.parentElement!, "Number")).toBeInTheDocument();

    expect(booleanVar).toBeInTheDocument();
    expect(getByText(booleanVar.parentElement!, "True")).toBeInTheDocument();
    expect(getByTitle(booleanVar.parentElement!, "Boolean")).toBeInTheDocument();

    expect(screen.queryByText("test_undefined")).not.toBeInTheDocument();
  });

  it("renders existing external variables", async () => {
    vi.mocked(variablesStore.entries).mockResolvedValue([
      ["test_string", "hello"],
      ["test_boolean", true],
      ["test_number", 1234],
      ["test_undefined", undefined],
    ]);

    renderDebugPanel({});

    // wait as this is loaded asyncronously
    await waitFor(() => {
      screen.getByText("test_string");
    });

    const stringVar = screen.getByText("test_string");
    const numberVar = screen.getByText("test_number");
    const booleanVar = screen.getByText("test_boolean");

    expect(stringVar).toBeInTheDocument();
    expect(getByText(stringVar.parentElement!, "hello")).toBeInTheDocument();
    expect(getByTitle(stringVar.parentElement!, "String")).toBeInTheDocument();

    expect(numberVar).toBeInTheDocument();
    expect(getByText(numberVar.parentElement!, "1234")).toBeInTheDocument();
    expect(getByTitle(numberVar.parentElement!, "Number")).toBeInTheDocument();

    expect(booleanVar).toBeInTheDocument();
    expect(getByText(booleanVar.parentElement!, "True")).toBeInTheDocument();
    expect(getByTitle(booleanVar.parentElement!, "Boolean")).toBeInTheDocument();

    expect(screen.queryByText("test_undefined")).not.toBeInTheDocument();
  });

  it("renders existing events", async () => {
    const events = [
      { timestamp: 1792099267696, title: TimelineEventTitles.CLEAR_MEMORY },
      { timestamp: 1792099268697, title: TimelineEventTitles.BLOCK_SELECTED },
      { timestamp: 1792099287698, title: TimelineEventTitles.DIALOGUE_ENDED },
      { timestamp: 1792099567699, title: TimelineEventTitles.DIALOGUE_LOADED },
      { timestamp: 1892100267700, title: TimelineEventTitles.EVENT_TRIGGERED },
      { timestamp: 1892100367700, title: TimelineEventTitles.VARIABLE_CHANGED },
      { timestamp: 1892100467700, title: TimelineEventTitles.EXTERNAL_VARIABLE_CHANGED },
      { timestamp: 1892100567700, title: "Some other event" },
      { timestamp: 1892100667700, title: "Another event", description: "with description" },
    ];

    renderDebugPanel({ events });

    const expectations = [
      { time: "2026-10-15 17:21:07", icon: "lucide-database-backup" },
      { time: "2026-10-15 17:21:08", icon: "lucide-inspect" },
      { time: "2026-10-15 17:21:27", icon: "lucide-message-circle-check" },
      { time: "2026-10-15 17:26:07", icon: "lucide-rotate-ccw" },
      { time: "2029-12-16 02:24:27", icon: "lucide-sparkle" },
      { time: "2029-12-16 02:26:07", icon: "lucide-variable" },
      { time: "2029-12-16 02:27:47", icon: "lucide-variable" },
      { time: "2029-12-16 02:29:27", icon: "lucide-check" },
      { time: "2029-12-16 02:31:07", icon: "lucide-check" },
    ];

    let index = 0;
    for (let event of events) {
      const line = screen.getByTestId(`${event.timestamp}${event.title}`);
      const time = line.getElementsByClassName("timeline-start")[0];
      const icon = line.getElementsByClassName("timeline-middle")[0];
      const text = line.getElementsByClassName("timeline-end")[0];

      expect(time.innerHTML).toEqual(expectations[index].time);
      expect(icon.getElementsByClassName(expectations[index].icon)).toHaveLength(1);

      if (event.description) {
        expect(text.innerHTML).toEqual(
          `<span class="font-semibold">${event.title}</span> | ${event.description}`,
        );
      } else {
        expect(text.innerHTML).toEqual(`<span class="font-semibold">${event.title}</span>`);
      }

      index += 1;
    }
  });

  it("re setup interpreter listeners when interpreter changes", async () => {
    const interpreter = Interpreter(new ClydeDocumentRoot());
    const anotherInterpreter = Interpreter(new ClydeDocumentRoot());

    const onSpy = vi.spyOn(interpreter, "on");
    const offSpy = vi.spyOn(interpreter, "off");
    const anotherInterpreterOnSpy = vi.spyOn(anotherInterpreter, "on");
    const anotherInterpreterOffSpy = vi.spyOn(anotherInterpreter, "off");

    const { rerender } = renderDebugPanel({ interpreter });

    rerender(
      debugPanelWithContext({
        interpreter: anotherInterpreter,
        isDialogueAvailable: true,
        addEventToTimeline: vi.fn(),
        clearMemoryFlag: 0,
        events: [],
      }),
    );

    expect(onSpy).toHaveBeenCalledWith(EventType.VARIABLE_CHANGED, expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith(EventType.EVENT_TRIGGERED, expect.any(Function));
    expect(offSpy).toHaveBeenCalledWith(EventType.VARIABLE_CHANGED, expect.any(Function));
    expect(offSpy).toHaveBeenCalledWith(EventType.EVENT_TRIGGERED, expect.any(Function));

    expect(anotherInterpreterOnSpy).toHaveBeenCalledWith(
      EventType.VARIABLE_CHANGED,
      expect.any(Function),
    );
    expect(anotherInterpreterOnSpy).toHaveBeenCalledWith(
      EventType.EVENT_TRIGGERED,
      expect.any(Function),
    );
    expect(anotherInterpreterOffSpy).not.toHaveBeenCalled();
  });

  it("re setup interpreter listeners when clearMemoryFlag changes", async () => {
    const interpreter = Interpreter(new ClydeDocumentRoot());

    const onSpy = vi.spyOn(interpreter, "on");
    const offSpy = vi.spyOn(interpreter, "off");

    const { rerender } = renderDebugPanel({ interpreter });

    rerender(
      debugPanelWithContext({
        interpreter,
        isDialogueAvailable: true,
        addEventToTimeline: vi.fn(),
        clearMemoryFlag: 1,
        events: [],
      }),
    );

    expect(onSpy).toHaveBeenCalledWith(EventType.VARIABLE_CHANGED, expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith(EventType.EVENT_TRIGGERED, expect.any(Function));
    expect(offSpy).toHaveBeenCalledWith(EventType.VARIABLE_CHANGED, expect.any(Function));
    expect(offSpy).toHaveBeenCalledWith(EventType.EVENT_TRIGGERED, expect.any(Function));

    expect(onSpy).toHaveBeenCalledTimes(4);
    expect(offSpy).toHaveBeenCalledTimes(2);
  });

  it("updates variables on interpreter variable change", async () => {
    vi.useFakeTimers();

    const interpreter = Interpreter(new ClydeDocumentRoot());
    const addEventToTimelineStub = vi.fn();
    interpreter.setVariable("var_1", true);
    interpreter.setVariable("var_2", true);

    renderDebugPanel({ interpreter, addEventToTimeline: addEventToTimelineStub });

    // sanity check variables are present
    expect(screen.queryByText("var_1")).toBeInTheDocument();
    expect(screen.queryByText("var_2")).toBeInTheDocument();

    act(() => {
      interpreter.setVariable("var_1", false);
      interpreter.setVariable("var_2", undefined); // remove var
    });

    expect(addEventToTimelineStub).toHaveBeenCalledWith({
      timestamp: Date.now(),
      title: TimelineEventTitles.VARIABLE_CHANGED,
      description: `name: var_1, value: false`,
    });

    expect(addEventToTimelineStub).toHaveBeenCalledWith({
      timestamp: Date.now(),
      title: TimelineEventTitles.VARIABLE_CHANGED,
      description: `name: var_2, value: undefined`,
    });

    const var1 = screen.getByText("var_1");

    expect(var1).toBeInTheDocument();
    expect(getByText(var1.parentElement!, "False")).toBeInTheDocument();

    // make sure var_2 was removed from list
    expect(screen.queryByText("var_2")).not.toBeInTheDocument();
  });

  it("calls addEventToTimeline when event triggered", async () => {
    vi.useFakeTimers();

    const doc = parse(
      "{trigger my_event } hehe\n{trigger another_event('param1', 'param2') } hoho",
    );
    const interpreter = Interpreter(doc);
    const addEventToTimelineStub = vi.fn();

    renderDebugPanel({ interpreter, addEventToTimeline: addEventToTimelineStub });

    act(() => {
      interpreter.getContent();
      interpreter.getContent();
    });

    expect(addEventToTimelineStub).toHaveBeenCalledWith({
      timestamp: Date.now(),
      title: TimelineEventTitles.EVENT_TRIGGERED,
      description: `name: my_event `,
    });

    expect(addEventToTimelineStub).toHaveBeenCalledWith({
      timestamp: Date.now(),
      title: TimelineEventTitles.EVENT_TRIGGERED,
      description: `name: another_event , parameters: param1,param2`,
    });
  });

  describe("Variables", () => {
    it("adds new variable", async () => {
      const interpreter = Interpreter(new ClydeDocumentRoot());

      renderDebugPanel({ interpreter });

      const addVariableButton = screen.getByTitle("Add variable");

      await userEvent.click(addVariableButton);

      // disable button while editing
      expect(addVariableButton).toBeDisabled();

      // fill information
      await userEvent.type(screen.getByPlaceholderText("Variable name"), "my_new_var");
      await userEvent.selectOptions(
        screen.getByLabelText("Variable type"),
        screen.getByRole("option", { name: "Boolean" }),
      );
      await userEvent.click(screen.getByLabelText("Variable value"));

      // save
      await userEvent.click(screen.getByLabelText("Save changes"));

      expect(interpreter.getVariable("my_new_var")).toBe(true);
      expect(addVariableButton).not.toBeDisabled();
    });

    it("adds number variable to exercise number field", async () => {
      const interpreter = Interpreter(new ClydeDocumentRoot());

      renderDebugPanel({ interpreter });

      const addVariableButton = screen.getByTitle("Add variable");

      await userEvent.click(addVariableButton);

      // disable button while editing
      expect(addVariableButton).toBeDisabled();

      // fill information
      await userEvent.type(screen.getByPlaceholderText("Variable name"), "my_other_new_var");
      await userEvent.selectOptions(
        screen.getByLabelText("Variable type"),
        screen.getByRole("option", { name: "Number" }),
      );
      await userEvent.type(screen.getByLabelText("Variable value"), "123");

      // save
      await userEvent.click(screen.getByLabelText("Save changes"));

      expect(interpreter.getVariable("my_other_new_var")).toBe(123);
      expect(addVariableButton).not.toBeDisabled();
    });

    it("updates existing variable", async () => {
      const interpreter = Interpreter(new ClydeDocumentRoot());
      interpreter.setVariable("existing", "old value");

      renderDebugPanel({ interpreter });

      const editVariableButton = screen.getByLabelText("Edit variable existing");
      await userEvent.click(editVariableButton);

      await userEvent.clear(screen.getByLabelText("Variable value"));
      await userEvent.type(screen.getByLabelText("Variable value"), "new value");

      // save
      await userEvent.click(screen.getByLabelText("Save changes"));

      expect(interpreter.getVariable("existing")).toBe("new value");
      expect(editVariableButton).toBeInTheDocument();
    });

    it("discard variable value when changing type to number but value is NaN", async () => {
      const interpreter = Interpreter(new ClydeDocumentRoot());
      interpreter.setVariable("existing", "old value");

      renderDebugPanel({ interpreter });

      const editVariableButton = screen.getByLabelText("Edit variable existing");
      await userEvent.click(editVariableButton);

      await userEvent.selectOptions(
        screen.getByLabelText("Variable type"),
        screen.getByRole("option", { name: "Number" }),
      );

      // save
      await userEvent.click(screen.getByLabelText("Save changes"));

      expect(interpreter.getVariable("existing")).toBe(undefined);
    });

    it("sets values to false changing type to boolean", async () => {
      const interpreter = Interpreter(new ClydeDocumentRoot());
      interpreter.setVariable("existing", "old value");

      renderDebugPanel({ interpreter });

      const editVariableButton = screen.getByLabelText("Edit variable existing");
      await userEvent.click(editVariableButton);

      await userEvent.selectOptions(
        screen.getByLabelText("Variable type"),
        screen.getByRole("option", { name: "Boolean" }),
      );

      // save
      await userEvent.click(screen.getByLabelText("Save changes"));

      expect(interpreter.getVariable("existing")).toBe(false);
    });

    it("changes type to string without changing value", async () => {
      const interpreter = Interpreter(new ClydeDocumentRoot());
      interpreter.setVariable("existing", 123);

      renderDebugPanel({ interpreter });

      const editVariableButton = screen.getByLabelText("Edit variable existing");
      await userEvent.click(editVariableButton);

      await userEvent.selectOptions(
        screen.getByLabelText("Variable type"),
        screen.getByRole("option", { name: "String" }),
      );

      // save
      await userEvent.click(screen.getByLabelText("Save changes"));

      expect(interpreter.getVariable("existing")).toBe(123);
    });

    it("deletes existing variable", async () => {
      const interpreter = Interpreter(new ClydeDocumentRoot());
      interpreter.setVariable("this_will_be_removed", "old value");

      renderDebugPanel({ interpreter });

      const deleteVariableButton = screen.getByLabelText("Delete variable this_will_be_removed");
      await userEvent.click(deleteVariableButton);

      expect(interpreter.getVariable("this_will_be_removed")).toBe(undefined);
      expect(screen.queryByText("this_will_be_removed")).not.toBeInTheDocument();
    });

    it("cancels updates when clicking the cancel button", async () => {
      const interpreter = Interpreter(new ClydeDocumentRoot());
      interpreter.setVariable("existing", "old value");

      renderDebugPanel({ interpreter });

      const editVariableButton = screen.getByLabelText("Edit variable existing");
      await userEvent.click(editVariableButton);

      await userEvent.clear(screen.getByLabelText("Variable value"));
      await userEvent.type(screen.getByLabelText("Variable value"), "new value");

      await userEvent.click(screen.getByLabelText("Cancel changes"));

      expect(interpreter.getVariable("existing")).toBe("old value");
      expect(editVariableButton).toBeInTheDocument();
    });

    it("cancels new variable creation when clicking the cancel button", async () => {
      const interpreter = Interpreter(new ClydeDocumentRoot());

      renderDebugPanel({ interpreter });

      const addVariableButton = screen.getByTitle("Add variable");
      await userEvent.click(addVariableButton);

      // disable button while editing
      expect(addVariableButton).toBeDisabled();

      await userEvent.clear(screen.getByLabelText("Variable value"));
      await userEvent.type(screen.getByLabelText("Variable value"), "new value");

      await userEvent.click(screen.getByLabelText("Cancel changes"));

      expect(addVariableButton).not.toBeDisabled();
    });

    it("does not save variable with empty name", async () => {
      const interpreter = Interpreter(new ClydeDocumentRoot());

      renderDebugPanel({ interpreter });

      const addVariableButton = screen.getByTitle("Add variable");

      await userEvent.click(addVariableButton);

      // disable button while editing
      expect(addVariableButton).toBeDisabled();

      // fill information
      await userEvent.selectOptions(
        screen.getByLabelText("Variable type"),
        screen.getByRole("option", { name: "Boolean" }),
      );
      await userEvent.click(screen.getByLabelText("Variable value"));

      // save
      await userEvent.click(screen.getByLabelText("Save changes"));

      expect(addVariableButton).toBeDisabled();
    });

    // TODO on type change to number, set as undefined if NAN
  });

  describe("External variables", () => {
    it("adds new external variable", async () => {
      renderDebugPanel({});

      const addVariableButton = screen.getByTitle("Add external variable");

      await userEvent.click(addVariableButton);

      // disable button while editing
      expect(addVariableButton).toBeDisabled();

      // fill information
      await userEvent.type(screen.getByPlaceholderText("Variable name"), "my_new_var");
      await userEvent.selectOptions(
        screen.getByLabelText("Variable type"),
        screen.getByRole("option", { name: "Boolean" }),
      );
      await userEvent.click(screen.getByLabelText("Variable value"));

      // save
      await userEvent.click(screen.getByLabelText("Save changes"));

      expect(variablesStore.set).toHaveBeenCalledWith("my_new_var", true);
      expect(addVariableButton).not.toBeDisabled();
    });

    it("updates existing variable", async () => {
      vi.mocked(variablesStore.entries).mockResolvedValue([["existing", "old_value"]]);

      renderDebugPanel({});

      // wait as this is loaded asyncronously
      await waitFor(() => {
        screen.getByText("existing");
      });

      const editVariableButton = screen.getByLabelText("Edit variable existing");
      await userEvent.click(editVariableButton);

      await userEvent.clear(screen.getByLabelText("Variable value"));
      await userEvent.type(screen.getByLabelText("Variable value"), "new value");

      // save
      await userEvent.click(screen.getByLabelText("Save changes"));

      expect(variablesStore.set).toHaveBeenCalledWith("existing", "new value");
      expect(editVariableButton).toBeInTheDocument();
    });

    it("deletes existing variable", async () => {
      vi.mocked(variablesStore.entries).mockResolvedValue([["this_will_be_removed", "old_value"]]);

      renderDebugPanel({});

      // wait as this is loaded asyncronously
      await waitFor(() => {
        screen.getByText("this_will_be_removed");
      });

      const deleteVariableButton = screen.getByLabelText("Delete variable this_will_be_removed");
      await userEvent.click(deleteVariableButton);

      expect(variablesStore.delete).toHaveBeenCalledWith("this_will_be_removed");
    });
    // save undefined

    it("remove variable when saving undefined", async () => {
      vi.mocked(variablesStore.entries).mockResolvedValue([["this_will_be_removed", "old_value"]]);

      renderDebugPanel({});

      // wait as this is loaded asyncronously
      await waitFor(() => {
        screen.getByText("this_will_be_removed");
      });

      expect(screen.getByText("this_will_be_removed")).toBeInTheDocument();

      const editVariableButton = screen.getByLabelText("Edit variable this_will_be_removed");
      await userEvent.click(editVariableButton);

      // setting to number will force undefined due to NaN value
      await userEvent.selectOptions(
        screen.getByLabelText("Variable type"),
        screen.getByRole("option", { name: "Number" }),
      );

      // save
      await userEvent.click(screen.getByLabelText("Save changes"));

      expect(screen.queryByText("this_will_be_removed")).not.toBeInTheDocument();
    });
  });
});
