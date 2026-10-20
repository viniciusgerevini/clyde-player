import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { TimelineEvent, TimelineEventTitles, useEventTimeline } from "./useEventTimeline";

describe("useEventTimeline", () => {
  it("adds events", async () => {
    const { result } = renderHook(() => useEventTimeline());

    const event1: TimelineEvent = {
      timestamp: Date.now(),
      title: TimelineEventTitles.DIALOGUE_LOADED,
    };
    const event2: TimelineEvent = {
      timestamp: Date.now(),
      title: TimelineEventTitles.DIALOGUE_ENDED,
    };

    expect(result.current.events).toHaveLength(0);

    act(() => {
      result.current.addEventToTimeline(event1);
      result.current.addEventToTimeline(event2);
    });

    expect(result.current.events).toEqual([event2, event1]);
  });

  it("clears event list", async () => {
    const { result } = renderHook(() => useEventTimeline());

    const event1: TimelineEvent = {
      timestamp: Date.now(),
      title: TimelineEventTitles.DIALOGUE_LOADED,
    };

    expect(result.current.events).toHaveLength(0);

    act(() => {
      result.current.addEventToTimeline(event1);
    });

    expect(result.current.events).toHaveLength(1);

    act(() => {
      result.current.clearTimelineEvents();
    });

    expect(result.current.events).toHaveLength(0);
  });
});
