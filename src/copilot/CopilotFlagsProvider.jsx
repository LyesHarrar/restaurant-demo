import { useState } from "react";
import { CopilotFlagsContext, DEFAULT_FLAGS } from "./flagsContext";

export function CopilotFlagsProvider({ children }) {
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [dismissCount, setDismissCount] = useState(0);

  function toggle(key) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function registerSuggestionDismiss() {
    setDismissCount((count) => count + 1);
  }

  return (
    <CopilotFlagsContext.Provider
      value={{ flags, toggle, dismissCount, registerSuggestionDismiss }}
    >
      {children}
    </CopilotFlagsContext.Provider>
  );
}
