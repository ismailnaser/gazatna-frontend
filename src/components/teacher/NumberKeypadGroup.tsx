"use client";

import { createContext, useContext, useMemo, useState } from "react";

type NumberKeypadGroupContextValue = {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
};

const NumberKeypadGroupContext = createContext<NumberKeypadGroupContextValue | null>(null);

export function NumberKeypadGroup({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const value = useMemo(() => ({ activeId, setActiveId }), [activeId]);

  return (
    <NumberKeypadGroupContext.Provider value={value}>{children}</NumberKeypadGroupContext.Provider>
  );
}

export function useNumberKeypadGroup() {
  return useContext(NumberKeypadGroupContext);
}
