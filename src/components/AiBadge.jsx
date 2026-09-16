export default function AiBadge({ label = "Généré par IA" }) {
  return (
    <span className="ai-badge">
      <span aria-hidden="true">✨</span>
      {label}
    </span>
  );
}
