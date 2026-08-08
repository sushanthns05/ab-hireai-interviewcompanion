import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex max-w-3xl flex-col items-center gap-8">
        {/* Eyebrow */}
        <p className="font-mono text-sm uppercase tracking-[0.5em] text-primary">ABTALKS</p>

        {/* Hero Title */}
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          THE <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">INTERVIEW AGENT</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          An adaptive technical interviewer for enterprise engineering cohorts. Experience AI-driven
          technical evaluations based on real mission history.
        </p>

        {/* Call to Action */}
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex h-14 items-center justify-center bg-primary px-8 text-lg font-semibold uppercase tracking-wider text-primary-foreground shadow-[0_0_20px_oklch(0.79_0.18_184.11/0.5)] transition-all hover:scale-105 hover:shadow-[0_0_30px_oklch(0.79_0.18_184.11/0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Initialize Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
