import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { faqs } from "@/lib/fixtures";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — CampusPilot" },
      {
        name: "description",
        content: "Common student questions about admissions, fees, exams, courses and facilities.",
      },
      { property: "og:title", content: "FAQs — CampusPilot" },
      {
        property: "og:description",
        content: "Browse common student questions and ask the assistant for more detail.",
      },
    ],
  }),
  component: FaqsPage,
});

function FaqsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(needle) ||
        f.answer.toLowerCase().includes(needle) ||
        f.category.toLowerCase().includes(needle),
    );
  }, [query]);

  const categories = Array.from(new Set(filtered.map((f) => f.category)));

  return (
    <AppShell title="FAQs" description="Sample answers to frequently asked student questions.">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="surface-card p-4">
          <label htmlFor="faq-search" className="sr-only">
            Search FAQs
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="faq-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions"
              className="h-11 rounded-xl pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="surface-card p-6 text-sm text-muted-foreground">
            Nothing matched “{query}”. You can still ask the assistant directly.
          </p>
        ) : (
          categories.map((category) => (
            <section key={category} className="surface-card p-4">
              <h2 className="px-1 text-sm font-semibold text-foreground">{category}</h2>
              <Accordion type="single" collapsible className="mt-1">
                {filtered
                  .filter((f) => f.category === category)
                  .map((f) => (
                    <AccordionItem key={f.id} value={f.id}>
                      <AccordionTrigger className="text-left text-sm">{f.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground">{f.answer}</p>
                        <Button
                          variant="outline"
                          className="mt-3 rounded-xl"
                          onClick={() =>
                            void navigate({ to: "/assistant", search: { q: f.question, c: undefined } })
                          }
                        >
                          Ask assistant
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
}
