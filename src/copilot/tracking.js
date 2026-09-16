// Demo-only analytics stub — logs the events described in the spec's
// tracking table instead of sending them to a real analytics backend.
export function trackEvent(name, properties = {}) {
  console.log(`[copilot:track] ${name}`, properties);
}
