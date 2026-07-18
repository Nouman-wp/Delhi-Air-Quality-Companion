import type { LucideIcon } from "lucide-react";
import { scoreColor, scoreLabel } from "../../utils/scores";
import { GlassCard } from "../common/GlassCard";

interface ScoreCardProps {
  title: string;
  icon: LucideIcon;
  score: number;
}

export function ScoreCard({ title, icon: Icon, score }: ScoreCardProps) {
  const color = scoreColor(score);

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Icon size={16} />
          {title}
        </div>
        <span className="text-xs font-medium" style={{ color }}>
          {scoreLabel(score)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-3xl font-bold" style={{ color }}>
          {score}
        </span>
        <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
        </div>
      </div>
    </GlassCard>
  );
}
