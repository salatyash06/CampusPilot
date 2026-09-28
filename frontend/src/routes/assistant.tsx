import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Copy,
  FileText,
  History,
  Loader2,
  Plus,
  Search,
  SendHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { titleFromMessage, useChatHistory } from "@/hooks/use-chat-history";
import { isDemoMode, sendChatMessage } from "@/lib/api";
import { suggestedQuestions } from "@/lib/fixtures";
import { Markdown } from "@/lib/markdown";
import { newId } from "@/lib/storage";
import type { ChatMessage, ChatSource, Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    c: typeof search["c"] === "string" ? search["c"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "AI Assistant — CampusPilot" },
      {
        name: "description",
        content: "Ask the CampusPilot assistant a campus question and see the sources behind each answer.",
      },
      { property: "og:title", content: "AI Assistant — CampusPilot" },
      {
        property: "og:description",
        content: "Ask one question at a time and review the sources behind every answer.",
      },
    ],
  }),
  component: AssistantPage,
});

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 rounded-lg px-2 text-xs text-muted-foreground"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Could not copy to clipboard.");
        }
      }}
      aria-label="Copy response"
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function SourceList({ sources }: { sources: ChatSource[] }) {
  if (sources.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No sources were returned for the latest answer.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {sources.map((s) => (
        <li key={s.id} className="rounded-xl border border-border p-3">
          <p className="flex items-start gap-2 text-sm font-medium text-foreground">
            <FileText className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
            <span className="break-words">{s.title}</span>
          </p>
          <p className="mt-1.5 text-xs break-words text-muted-foreground">{s.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}

function AssistantPage() {
  const { q, c } = Route.useSearch();
  const {
    conversations,
    loaded,
    createConversation,
    upsertConversation,
    deleteConversation,
    clearAll,
  } = useChatHistory();

  const [active, setActive] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [failedQuestion, setFailedQuestion] = useState<string | null>(null);
  const [historyQuery, setHistoryQuery] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const activeRef = useRef<Conversation | null>(null);
  const autoSentRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Cancel any in-flight request when leaving the page.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!loaded || active) return;
    const existing = c ? conversations.find((x) => x.id === c) : undefined;
    setActive(existing ?? createConversation());
  }, [loaded, active, c, conversations, createConversation]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const base = activeRef.current ?? createConversation();
    const userMessage: ChatMessage = {
      id: newId(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    const withUser: Conversation = {
      ...base,
      title: base.messages.length === 0 ? titleFromMessage(userMessage) : base.title,
      updatedAt: Date.now(),
      messages: [...base.messages, userMessage],
    };
    setActive(withUser);
    activeRef.current = withUser;
    upsertConversation(withUser);
    setInput("");
    setFailedQuestion(null);
    setPending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await sendChatMessage(trimmed, controller.signal);
      const assistantMessage: ChatMessage = {
        id: newId(),
        role: "assistant",
        content: response.answer,
        createdAt: Date.now(),
        sources: response.sources,
        mode: response.mode,
      };
      const next: Conversation = {
        ...withUser,
        updatedAt: Date.now(),
        messages: [...withUser.messages, assistantMessage],
      };
      setActive(next);
      activeRef.current = next;
      upsertConversation(next);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const message =
        error instanceof Error ? error.message : "Something went wrong sending your question.";
      const errorMessage: ChatMessage = {
        id: newId(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        error: message,
      };
      const next: Conversation = {
        ...withUser,
        updatedAt: Date.now(),
        messages: [...withUser.messages, errorMessage],
      };
      setActive(next);
      activeRef.current = next;
      upsertConversation(next);
      setFailedQuestion(trimmed);
    } finally {
      setPending(false);
      abortRef.current = null;
    }
  };

  // A question passed from another page is asked once.
  useEffect(() => {
    if (!loaded || !active || !q || autoSentRef.current) return;
    autoSentRef.current = true;
    void send(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, active, q]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [active?.messages.length, pending]);

  const latestSources = useMemo(() => {
    const messages = active?.messages ?? [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]!;
      if (m.role === "assistant" && m.sources) return m.sources;
    }
    return [];
  }, [active]);

  const filteredHistory = useMemo(() => {
    const needle = historyQuery.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(needle) ||
        conv.messages.some((m) => m.content.toLowerCase().includes(needle)),
    );
  }, [conversations, historyQuery]);

  const startNew = () => {
    abortRef.current?.abort();
    const fresh = createConversation();
    setActive(fresh);
    activeRef.current = fresh;
    setInput("");
    setFailedQuestion(null);
  };

  const historyPanel = (
    <div className="flex h-full flex-col gap-3">
      <div className="relative">
        <label htmlFor="history-search" className="sr-only">
          Search history
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="history-search"
          value={historyQuery}
          onChange={(e) => setHistoryQuery(e.target.value)}
          placeholder="Search conversations"
          className="h-10 rounded-xl pl-9"
        />
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground">No saved conversations.</p>
        ) : (
          filteredHistory.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2",
                active?.id === conv.id ? "border-primary/50 bg-primary-soft" : "border-border",
              )}
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  abortRef.current?.abort();
                  setActive(conv);
                  activeRef.current = conv;
                }}
              >
                <span className="line-clamp-1 text-sm text-foreground">{conv.title}</span>
                <span className="text-[11px] text-muted-foreground">{formatTime(conv.updatedAt)}</span>
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground"
                    aria-label={`Delete conversation ${conv.title}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      It will be removed from this device permanently.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        deleteConversation(conv.id);
                        if (active?.id === conv.id) startNew();
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}
      </div>
      {conversations.length > 0 ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="rounded-xl text-destructive">
              <Trash2 className="size-4" aria-hidden="true" />
              Clear all history
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all chat history?</AlertDialogTitle>
              <AlertDialogDescription>
                Every saved conversation on this device is removed. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  clearAll();
                  startNew();
                }}
              >
                Clear history
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
      <p className="text-[11px] text-muted-foreground">Saved on this device.</p>
    </div>
  );

  const messages = active?.messages ?? [];

  return (
    <AppShell
      title="AI Assistant"
      description="Each question is answered independently — there is no conversational memory."
      contentClassName="p-0 lg:p-0"
    >
      <div className="flex min-h-[calc(100dvh-65px)] flex-col xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 lg:px-8">
            <Button variant="outline" className="rounded-xl" onClick={startNew}>
              <Plus className="size-4" aria-hidden="true" />
              New conversation
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  <History className="size-4" aria-hidden="true" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[320px] flex-col gap-4 p-4">
                <SheetTitle>Conversation history</SheetTitle>
                {historyPanel}
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-xl xl:hidden">
                  <FileText className="size-4" aria-hidden="true" />
                  Sources
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] p-4">
                <SheetTitle className="mb-3">Sources</SheetTitle>
                <SourceList sources={latestSources} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.length === 0 && !pending ? (
                <div className="surface-card p-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    Ask about anything on campus
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isDemoMode
                      ? "Demo mode answers from a small set of sample documents. Nothing here is official policy."
                      : "Answers come from the configured assistant service."}
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {suggestedQuestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void send(s)}
                        className="rounded-xl border border-border px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">
                      <p className="break-words whitespace-pre-wrap">{m.content}</p>
                      <p className="mt-1 text-[11px] text-primary-foreground/70">
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-start">
                    <div className="surface-card w-full max-w-[95%] p-4">
                      {m.error ? (
                        <div className="space-y-3">
                          <p className="flex items-start gap-2 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            {m.error}
                          </p>
                          {failedQuestion ? (
                            <Button
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => void send(failedQuestion)}
                              disabled={pending}
                            >
                              Retry
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        <>
                          <Markdown content={m.content} />
                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
                            <span className="text-[11px] text-muted-foreground">
                              {formatTime(m.createdAt)}
                              {m.mode ? ` · ${m.mode}` : ""}
                              {m.sources && m.sources.length > 0
                                ? ` · ${m.sources.length} source${m.sources.length === 1 ? "" : "s"}`
                                : ""}
                            </span>
                            <CopyButton text={m.content} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ),
              )}

              {pending ? (
                <div className="surface-card flex items-center gap-2 p-4 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span role="status">Looking for an answer…</span>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-8">
            <form
              className="mx-auto flex max-w-3xl items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <label htmlFor="composer" className="sr-only">
                Your question
              </label>
              <Textarea
                id="composer"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder="Ask a question… (Enter to send, Shift+Enter for a new line)"
                className="max-h-40 min-h-11 flex-1 resize-none rounded-xl"
              />
              <Button
                type="submit"
                className="h-11 rounded-xl px-4"
                disabled={pending || input.trim().length === 0}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <SendHorizontal className="size-4" aria-hidden="true" />
                )}
                <span className="sr-only sm:not-sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>

        <aside className="hidden w-[320px] shrink-0 border-l border-border px-4 py-6 xl:block">
          <div className="sticky top-24">
            <h2 className="text-sm font-semibold text-foreground">Sources</h2>
            <p className="mt-1 mb-3 text-xs text-muted-foreground">
              Shown exactly as returned for the latest answer.
            </p>
            <SourceList sources={latestSources} />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
