import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MessageSquare, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatHistory } from "@/hooks/use-chat-history";
import { isDemoMode } from "@/lib/api";
import { announcements, resources, topics } from "@/lib/fixtures";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — CampusPilot" },
      {
        name: "description",
        content:
          "CampusPilot helps students find answers about admissions, fees, courses, exams, timetables and campus facilities.",
      },
      { property: "og:title", content: "CampusPilot — Your campus, simplified." },
      {
        property: "og:description",
        content: "Ask a question and get campus guidance on admissions, fees, courses and more.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const { conversations } = useChatHistory();

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    void navigate({ to: "/assistant", search: { q: trimmed, c: undefined } });
  };

  return (
    <AppShell title="Overview" description="Your campus, simplified.">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="surface-card p-6 lg:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            How can we help you today?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask about admissions, fees, courses, exams, timetable or facilities.
            {isDemoMode ? " Demo answers use sample content, not official policy." : null}
          </p>
          <form
            className="mt-5 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <label htmlFor="overview-question" className="sr-only">
              Your question
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="overview-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. How do I pay my semester fees?"
                className="h-12 rounded-xl pl-9 text-base"
              />
            </div>
            <Button type="submit" className="h-12 rounded-xl px-5" disabled={!question.trim()}>
              Ask assistant
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-foreground">Browse by topic</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => ask(topic.question)}
                className="surface-card group p-4 text-left transition-colors hover:border-primary/40"
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{topic.title}</span>
                  <ArrowRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-1.5 block text-xs text-muted-foreground">{topic.blurb}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="surface-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageSquare className="size-4 text-primary" aria-hidden="true" />
              Recent conversations
            </h3>
            {conversations.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                No conversations yet. Ask a question above to start one.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {conversations.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => void navigate({ to: "/assistant", search: { q: undefined, c: c.id } })}
                      className="w-full rounded-xl border border-border px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40"
                    >
                      <span className="line-clamp-1">{c.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {c.messages.length} message{c.messages.length === 1 ? "" : "s"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">Saved on this device only.</p>
          </section>

          <section className="surface-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-teal" aria-hidden="true" />
              Announcements
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Sample
              </span>
            </h3>
            <ul className="mt-3 space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{a.date}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="surface-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Quick resources</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {resources.slice(0, 4).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => void navigate({ to: "/resources", search: { q: r.title } })}
                className="rounded-xl border border-border px-3 py-2.5 text-left transition-colors hover:border-primary/40"
              >
                <span className="text-sm font-medium text-foreground">{r.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{r.category}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
