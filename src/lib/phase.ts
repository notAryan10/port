import { useSyncExternalStore } from "react";

export type Phase = "intro" | "world";

let phase: Phase = "intro";
const listeners = new Set<() => void>();

export function getPhase(): Phase {
  return phase;
}

export function setPhase(next: Phase) {
  if (next === phase) return;
  phase = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reactive phase for components that should mount/unmount on transition. */
export function usePhase(): Phase {
  return useSyncExternalStore(subscribe, getPhase, () => "intro");
}
