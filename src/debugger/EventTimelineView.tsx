import {
  CheckIcon,
  DatabaseBackupIcon,
  MessageCircleCheckIcon,
  PowerIcon,
  RotateCcwIcon,
  SparkleIcon,
  SquareMousePointerIcon,
  VariableIcon,
} from "lucide-react";
import { TimelineEvent, TimelineEventTitles } from "./useEventTimeline";

export function EventTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ul className="timeline timeline-vertical">
      {events.map((e, i) => {
        return (
          <li
            key={`${e.timestamp}${e.title}${e.description}${i}`}
            data-testid={`${e.timestamp}${e.title}`}
          >
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

      {events.length > 0 && (
        <li>
          <hr />
          <div className="timeline-middle">
            <EventIcon title="start" />
          </div>
        </li>
      )}
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

  if (
    title === TimelineEventTitles.VARIABLE_CHANGED ||
    title === TimelineEventTitles.EXTERNAL_VARIABLE_CHANGED
  ) {
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

  if (title === TimelineEventTitles.CLEAR_MEMORY) {
    icon = <DatabaseBackupIcon size={iconSize} />;
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
