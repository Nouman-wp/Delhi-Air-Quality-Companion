import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { sendChatMessage } from "../../services/api/chat.api";
import { useUserLocation } from "../../contexts/LocationContext";
import { Loader } from "../common/Loader";
import type { ChatTurn } from "../../types";

const SUGGESTIONS = [
  "Should I go for a run right now?",
  "Is it safe for my child to play outside?",
  "Should I wear an N95 mask today?",
  "Can I open my windows?",
];

export function ChatPanel() {
  const { coords } = useUserLocation();
  const [history, setHistory] = useState<ChatTurn[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm your AirWise health companion. Ask me anything about air quality, outdoor activity, or how to protect yourself today.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  async function handleSend(message: string) {
    if (!message.trim() || loading) return;
    const nextHistory: ChatTurn[] = [...history, { role: "user", content: message }];
    setHistory(nextHistory);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await sendChatMessage({ message, history: nextHistory.slice(-10), location: coords });
      setHistory((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach the server. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-6 py-6 space-y-5">
        {history.map((turn, idx) => (
          <ChatMessage key={idx} turn={turn} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 pl-11 text-white/40 text-sm">
            <Loader size={14} /> Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {history.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 md:px-6 pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="rounded-full border border-border bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs text-white/70 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2.5 border-t border-border/60 p-4 md:p-6"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about air quality, exercise, or health…"
          className="flex-1 rounded-xl border border-border bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-accent/60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 transition-colors"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
