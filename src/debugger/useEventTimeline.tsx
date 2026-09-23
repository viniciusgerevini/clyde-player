import { useRef, useState } from "react";

export enum TimelineEventTitles {
  BLOCK_SELECTED = "block selected",
  DIALOGUE_ENDED = "dialogue ended",
  DIALOGUE_LOADED = "dialogue loaded",
  EVENT_TRIGGERED = "event triggered",
  VARIABLE_CHANGED = "variable changed",
}

export interface TimelineEvent {
  timestamp: number;
  title: string;
  description?: string;
}

export function useEventTimeline() {
  const eventsRef = useRef<TimelineEvent[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  return {
    events,
    addEventToTimeline(event: TimelineEvent) {
      eventsRef.current.unshift(event);
      setEvents([...eventsRef.current]);
    },
    clearTimelineEvents() {
      eventsRef.current = [];
      setEvents([]);
    },
  };
}
