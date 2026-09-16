import { createContext, useContext } from "react";

// Demo-only kill switch: a client-side context standing in for a real
// server-side feature flag system (LaunchDarkly/GrowthBook/etc).
export const CopilotFlagsContext = createContext(null);

export const DEFAULT_FLAGS = {
  release1: true,
  release2: true,
  release3: true,
  simulateUnavailable: false,
};

// Suggestions ignored twice in a row stop showing for the rest of the
// session, per the spec's "frequency reduction" management rule.
export const MAX_SUGGESTION_DISMISSALS = 2;

export function useCopilotFlags() {
  const ctx = useContext(CopilotFlagsContext);
  if (!ctx) {
    throw new Error("useCopilotFlags must be used within a CopilotFlagsProvider");
  }
  return ctx;
}
