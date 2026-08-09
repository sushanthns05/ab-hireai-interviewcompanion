import { CheckCircle2, Circle, LucideIcon } from "lucide-react";

export type Stage = {
  id: string;
  label: string;
  status: "complete" | "current" | "upcoming";
};

interface StageProgressProps {
  stages: Stage[];
}

export function StageProgress({ stages }: StageProgressProps) {
  return (
    <div className="w-full bg-card border-b border-border py-4 px-6 mb-6 rounded-3xl shadow-sm">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {stages.map((stage, index) => {
          const isComplete = stage.status === "complete";
          const isCurrent = stage.status === "current";
          const isUpcoming = stage.status === "upcoming";

          return (
            <div key={stage.id} className="flex items-center flex-1 last:flex-none group">
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={`size-8 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isComplete ? "bg-primary border-primary text-white" : ""}
                    ${isCurrent ? "border-primary bg-background text-primary" : ""}
                    ${isUpcoming ? "border-muted bg-background text-muted-foreground" : ""}
                  `}
                >
                  {isComplete ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`absolute top-10 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors
                    ${isCurrent ? "text-primary" : ""}
                    ${isComplete ? "text-foreground" : ""}
                    ${isUpcoming ? "text-muted-foreground" : ""}
                  `}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connecting Line */}
              {index < stages.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 relative -top-2.5">
                  <div className="absolute inset-0 bg-muted" />
                  <div
                    className="absolute inset-y-0 left-0 bg-primary transition-all duration-1000"
                    style={{ width: isComplete ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
