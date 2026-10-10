"use client";

import { createContext, useContext, useMemo, useState } from "react";

const ScreenRailContext = createContext(null);

export function ScreenRailProvider({ children }) {
  const [rail, setRail] = useState(null);
  const value = useMemo(() => ({ rail, setRail }), [rail]);
  return <ScreenRailContext.Provider value={value}>{children}</ScreenRailContext.Provider>;
}

export function useScreenRail() {
  return useContext(ScreenRailContext);
}

function Block({ block, jump, compact }) {
  const done = block.items.filter((item) => item.done).length;
  const review = block.id === "review";

  return (
    <div className={compact ? "min-w-[148px]" : ""}>
      <p className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
        <span>{block.label}</span>
        {review ? null : <span>{done}/{block.items.length}</span>}
      </p>
      {review ? (
        <button
          type="button"
          onClick={() => jump(block.id, 0)}
          className={`mt-2 w-full rounded-xl px-3 py-2 text-left text-sm font-medium ${block.items[0]?.current ? "bg-[#0e7c74] text-white" : "bg-white/10 text-white/80 hover:bg-white/15"}`}
        >
          {block.items[0]?.done ? "Ready to submit" : "Review answers"}
        </button>
      ) : (
        <div className={`mt-2 grid gap-1.5 ${compact ? "grid-cols-5" : "grid-cols-5"}`}>
          {block.items.map((item) => (
            <button
              key={item.index}
              type="button"
              onClick={() => jump(block.id, item.index)}
              className={`h-8 rounded-lg text-xs font-semibold ${
                item.current
                  ? "bg-[#0e7c74] text-white"
                  : item.done
                    ? "bg-white/15 text-white"
                    : "border border-white/15 text-white/55 hover:border-white/40 hover:text-white"
              }`}
            >
              {item.index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScreenRail({ placement = "side" }) {
  const ctx = useContext(ScreenRailContext);
  const rail = ctx?.rail;
  if (!rail) return null;

  if (placement === "top") {
    return (
      <div className="overflow-x-auto border-t border-white/10 bg-[#0c1c33] px-4 py-3 lg:hidden">
        <div className="flex gap-4">
          {rail.blocks.map((block) => (
            <Block key={block.id} block={block} jump={rail.jump} compact />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-5">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8ee0d6]">This screen</p>
      <p className="mt-1 truncate px-3 text-sm text-white/70">{rail.jobTitle}</p>
      <div className="mt-4 space-y-4 px-1">
        {rail.blocks.map((block) => (
          <Block key={block.id} block={block} jump={rail.jump} />
        ))}
      </div>
    </div>
  );
}
