import React, { createContext, useContext, useState, ReactNode } from "react";
import type { ObjectData } from "../types/objectData";

// 👉 Tipo del contesto
interface AppContextType {
  objectData: ObjectData | null;
  setObjectData: (data: ObjectData | null) => void;
  objectID: string | null;
  setObjectID: (id: string | null) => void;
  network: string | null;
  setNetwork: (id: string | null) => void;
}

// 👉 Contesto iniziale con valori default (placeholder)
const AppContext = createContext<AppContextType>({
  objectData: null,
  setObjectData: () => {},
  objectID: null,
  setObjectID: () => {},
  network: null,
  setNetwork: () => {},
});

// 👉 Provider: wrappa l'intera app
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [objectData, setObjectData] = useState<ObjectData | null>(null);
  const [objectID, setObjectID] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  return (
    <AppContext.Provider value={{ objectData, setObjectData, objectID, setObjectID, network, setNetwork }}>
      {children}
    </AppContext.Provider>
  );
};

// 👉 Hook comodo per usare il contesto
export const useAppContext = () => useContext(AppContext);
