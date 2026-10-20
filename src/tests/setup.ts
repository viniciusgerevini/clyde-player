import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

beforeEach(() => {
  // set a fixed timezone so timestamp conversions do not
  // fail on CI or other machines with different timezones
  vi.stubEnv("TZ", "America/Toronto");
});

afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
});
