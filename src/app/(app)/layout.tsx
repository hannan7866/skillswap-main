import { AppHeader } from "@/components/layout/header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-background text-foreground antialiased relative selection:bg-primary/25 selection:text-primary">
      {/* Antigravity Deep Space Ambient Mesh Glow (Vibrant Cyan & Ocean Teal) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2BBBD7]/12 via-[#218DAE]/8 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Floating Sticky Header */}
      <AppHeader />

      {/* Main Content Area filling remaining space */}
      <main className="flex-1 w-full container mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Grounded Footer */}
      <footer className="py-6 border-t border-border/40 bg-card/40 backdrop-blur-md mt-auto">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2BBBD7] shadow-[0_0_8px_#2BBBD7] animate-pulse" />
            <span className="font-heading font-semibold text-foreground">SkillSwap</span>
            <span className="hidden sm:inline">— Cashless Peer-to-Peer Time Banking</span>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SkillSwap. Future Perfect Edition.
          </div>
        </div>
      </footer>
    </div>
  );
}

