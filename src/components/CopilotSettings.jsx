import { useCopilotFlags } from "../copilot/flagsContext";

const TOGGLES = [
  { key: "release1", label: "Suggestion proactive (R1)" },
  { key: "release2", label: "Recherche conversationnelle (R2)" },
  { key: "release3", label: "Coordination groupe (R3)" },
  { key: "simulateUnavailable", label: "Simuler plat suggéré indisponible" },
];

export default function CopilotSettings() {
  const { flags, toggle } = useCopilotFlags();

  return (
    <details className="copilot-settings">
      <summary className="copilot-settings-summary">⚙️ Copilot (démo)</summary>
      <div className="copilot-settings-panel">
        {TOGGLES.map(({ key, label }) => (
          <label key={key} className="copilot-settings-row">
            <input type="checkbox" checked={flags[key]} onChange={() => toggle(key)} />
            {label}
          </label>
        ))}
        <span className="copilot-settings-note">Kill switch simulé — pas de config serveur.</span>
      </div>
    </details>
  );
}
