import type { Conversation } from "./types";

export const THEME_KEY = "campuspilot.theme";
export const HISTORY_KEY = "campuspilot.history";

export type ThemeChoice = "light" | "dark" | "system";

export function readConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Conversation[];
  } catch {
    return [];
  }
}

export function writeConversations(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(conversations));
  } catch {
    /* storage unavailable — history simply is not persisted */
  }
}

export function clearConversations() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
