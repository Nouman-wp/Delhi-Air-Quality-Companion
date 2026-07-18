import clsx from "clsx";
import { Wind, User2 } from "lucide-react";
import type { ChatTurn } from "../../types";

export function ChatMessage({ turn }: { turn: ChatTurn }) {
  const isUser = turn.role === "user";

  return (
    <div className={clsx("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={clsx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-white/10" : "bg-accent/20"
        )}
      >
        {isUser ? <User2 size={15} /> : <Wind size={15} className="text-accent" />}
      </div>
      <div
        className={clsx(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isUser ? "bg-accent text-white rounded-tr-sm" : "glass rounded-tl-sm"
        )}
      >
        {turn.content}
      </div>
    </div>
  );
}
