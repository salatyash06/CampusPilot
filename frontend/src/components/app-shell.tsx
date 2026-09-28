import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Moon,
  Settings as SettingsIcon,
  Sun,
  GraduationCap,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/theme-provider";
import { isDemoMode } from "@/lib/api";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/assistant", label: "AI Assistant", icon: MessageSquare },
  { to: "/resources", label: "Campus Resources", icon: BookOpen },
  { to: "/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {navItems.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3 px-1 py-1">
        <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <GraduationCap className="size-5" aria-hidden="true" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-sidebar-foreground">CampusPilot</span>
          <span className="text-xs text-sidebar-foreground/60">Your campus, simplified.</span>
        </span>
      </Link>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto rounded-xl border border-sidebar-border p-3 text-xs text-sidebar-foreground/70">
        {isDemoMode ? (
          <>
            <p className="font-medium text-sidebar-foreground">Demo mode</p>
            <p className="mt-1">Answers come from local sample content, not official records.</p>
          </>
        ) : (
          <>
            <p className="font-medium text-sidebar-foreground">Connected</p>
            <p className="mt-1">Answers come from the configured assistant service.</p>
          </>
        )}
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-xl"
      aria-label={resolved === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
    >
      {resolved === "dark" ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}

export function AppShell({
  title,
  description,
  children,
  contentClassName,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-[248px] shrink-0 bg-sidebar lg:block">
        <div className="sticky top-0 h-dvh">
          <SidebarContent />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl lg:hidden" aria-label="Open navigation">
                <Menu className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-none bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {isDemoMode ? (
            <span className="hidden rounded-full border border-teal/40 bg-teal-soft px-3 py-1 text-xs font-medium text-foreground sm:inline">
              Demo mode
            </span>
          ) : null}
          <ThemeToggle />
          <div className="flex items-center gap-2 rounded-xl border border-border px-2 py-1.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
              SD
            </span>
            <span className="hidden text-xs font-medium text-foreground sm:inline">Student demo</span>
          </div>
        </header>

        <main className={cn("min-w-0 flex-1 px-4 py-6 lg:px-8", contentClassName)}>{children}</main>
      </div>
    </div>
  );
}
