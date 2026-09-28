import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resources } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Campus Resources — CampusPilot" },
      {
        name: "description",
        content: "Search sample academic and campus resources, from the library to exam regulations.",
      },
      { property: "og:title", content: "Campus Resources — CampusPilot" },
      {
        property: "og:description",
        content: "Search sample academic and campus resources in one place.",
      },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState(q ?? "");
  const [group, setGroup] = useState<"All" | "Academic" | "Campus">("All");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (group !== "All" && r.group !== group) return false;
      if (!needle) return true;
      return (
        r.title.toLowerCase().includes(needle) ||
        r.description.toLowerCase().includes(needle) ||
        r.category.toLowerCase().includes(needle)
      );
    });
  }, [query, group]);

  const grouped = {
    Academic: filtered.filter((r) => r.group === "Academic"),
    Campus: filtered.filter((r) => r.group === "Campus"),
  };

  return (
    <AppShell title="Campus Resources" description="Sample directory of academic and campus support.">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="resource-search" className="sr-only">
              Search resources
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="resource-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources"
              className="h-11 rounded-xl pl-9"
            />
          </div>
          <div className="flex gap-2" role="group" aria-label="Filter by group">
            {(["All", "Academic", "Campus"] as const).map((g) => (
              <Button
                key={g}
                type="button"
                variant={group === g ? "default" : "outline"}
                className="rounded-xl"
                aria-pressed={group === g}
                onClick={() => setGroup(g)}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="surface-card p-6 text-sm text-muted-foreground">
            No resources match “{query}”. Try a different search term.
          </p>
        ) : (
          (["Academic", "Campus"] as const).map((g) =>
            grouped[g].length === 0 ? null : (
              <section key={g}>
                <h2 className="text-sm font-semibold text-foreground">{g}</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {grouped[g].map((r) => (
                    <article key={r.id} className={cn("surface-card flex flex-col gap-2 p-4")}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Sample
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" aria-hidden="true" />
                        {r.location}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-1 w-fit rounded-xl"
                        onClick={() =>
                          void navigate({
                            to: "/assistant",
                            search: { q: `Tell me about ${r.title.toLowerCase()}`, c: undefined },
                          })
                        }
                      >
                        Ask assistant
                      </Button>
                    </article>
                  ))}
                </div>
              </section>
            ),
          )
        )}

        <p className="text-xs text-muted-foreground">
          All entries are demo content. Confirm details with the relevant campus office.
        </p>
      </div>
    </AppShell>
  );
}
