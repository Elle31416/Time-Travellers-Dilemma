import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Era, Item, JudgeResult } from "./api";

type GameState = {
  era: Era | null;
  item: Item | null;
  plan: string;
  verdict: JudgeResult | null;
};

type GameContextValue = GameState & {
  setEra: (e: Era | null) => void;
  setItem: (i: Item | null) => void;
  setPlan: (p: string) => void;
  setVerdict: (v: JudgeResult | null) => void;
  reset: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [era, setEra] = useState<Era | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [plan, setPlan] = useState<string>("");
  const [verdict, setVerdict] = useState<JudgeResult | null>(null);

  const reset = () => {
    setEra(null);
    setItem(null);
    setPlan("");
    setVerdict(null);
  };

  return (
    <GameContext.Provider
      value={{ era, item, plan, verdict, setEra, setItem, setPlan, setVerdict, reset }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
