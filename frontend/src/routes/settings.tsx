import { createFileRoute } from "@tanstack/react-router";
import { Monitor, Moon, Sun, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useTheme } from "@/components/theme-provider";
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
import { useChatHistory } from "@/hooks/use-chat-history";
import { apiBaseUrl, isDemoMode } from "@/lib/api";
import type { ThemeChoice } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CampusPilot" },
      {
        name: "description",
        content: "Choose your CampusPilot theme and clear chat history stored on this device.",
      },
      { property: "og:title", content: "Settings — CampusPilot" },
      {
        property: "og:description",
        content: "Theme preferences and local data controls for CampusPilot.",
      },
    ],
  }),
  component: SettingsPage,
});

const themeOptions: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { conversations, clearAll } = useChatHistory();
  const [cleared, setCleared] = useState(false);

  return (
    <AppShell title="Settings" description="Preferences stored on this device.">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your theme choice is saved on this device.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Theme">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                  theme === value
                    ? "border-primary bg-primary-soft text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Local data</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Chat history is saved on this device only — it is never uploaded, and no credentials are
            stored. You currently have {conversations.length} saved conversation
            {conversations.length === 1 ? "" : "s"}.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="mt-4 rounded-xl text-destructive"
                disabled={conversations.length === 0}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Clear chat history
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all chat history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes every saved conversation from this device. It cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearAll();
                    setCleared(true);
                  }}
                >
                  Clear history
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {cleared ? (
            <p className="mt-3 text-xs text-teal" role="status">
              Chat history cleared from this device.
            </p>
          ) : null}
        </section>

        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Assistant service</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isDemoMode
              ? "No service configured, so CampusPilot runs in demo mode using local sample content."
              : `Connected to ${apiBaseUrl}. Answers come from that service.`}
          </p>
        </section>
      </div>
    </AppShell>
  );
}
