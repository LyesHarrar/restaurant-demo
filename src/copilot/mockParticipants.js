import { dishes } from "../data";

const byId = (id) => dishes.find((d) => d.id === id);

// Demo-only fictional colleagues, each with a "usual" dish. Camille starts
// pre-confirmed (simulating she already confirmed via Slack); Inès is left
// unconfirmed on purpose to demonstrate the exclusion-on-close rule.
export const initialColleagues = [
  { id: "p1", name: "Camille", dish: byId(9), confirmed: true },
  { id: "p2", name: "Yanis", dish: byId(7), confirmed: false },
  { id: "p3", name: "Inès", dish: byId(4), confirmed: false },
];
