import { demoChatResponse } from "./fixtures";
import type { ChatResponse } from "./types";

/**
 * All network access for CampusPilot lives here.
 *
 * If VITE_API_BASE_URL is unset the app runs in clearly labelled Demo mode and
 * answers from local fixtures. If it IS set, the real API is used and failures
 * surface as errors — there is never a silent fallback to demo content.
 */

const rawBase = (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.trim();
export const apiBaseUrl = rawBase && rawBase.length > 0 ? rawBase.replace(/\/$/, "") : null;
export const isDemoMode = apiBaseUrl === null;

export const CHAT_TIMEOUT_MS = 180_000;

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function isChatResponse(value: unknown): value is ChatResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v["answer"] !== "string") return false;
  if (v["sources"] !== undefined && !Array.isArray(v["sources"])) return false;
  return true;
}

export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  if (isDemoMode) return false;
  try {
    const res = await fetch(`${apiBaseUrl}/health`, { signal: signal ?? null });
    if (!res.ok) return false;
    const body = (await res.json()) as { status?: string };
    return body.status === "ok";
  } catch {
    return false;
  }
}

export async function sendChatMessage(
  message: string,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    return demoChatResponse(message);
  }

  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), CHAT_TIMEOUT_MS);
  const onAbort = () => timeoutController.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(`${apiBaseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: timeoutController.signal,
    });

    if (!res.ok) {
      throw new ApiError(`The assistant service returned an error (${res.status}).`);
    }

    const data: unknown = await res.json();
    if (!isChatResponse(data)) {
      throw new ApiError("The assistant service returned an unexpected response.");
    }

    return {
      answer: data.answer,
      sources: Array.isArray(data.sources) ? data.sources : [],
      mode: data.mode ?? "retrieval",
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      if (signal?.aborted) throw error;
      throw new ApiError("The request took longer than 180 seconds and was stopped.");
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError("Could not reach the assistant service. Check your connection.");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
