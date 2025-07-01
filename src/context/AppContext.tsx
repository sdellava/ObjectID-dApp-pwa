import React, { createContext, useContext, useState, ReactNode } from "react";
import type { ObjectData } from "../types/objectData";
import { IotaClient } from "@iota/iota-sdk/dist/cjs/client";

// 👉 Tipo del contesto
interface AppContextType {
  objectData: ObjectData | null;
  setObjectData: (data: ObjectData | null) => void;
  objectID: string | null;
  setObjectID: (id: string | null) => void;
  network: string | null;
  setNetwork: (id: string | null) => void;
  credits: number;
  setCredits: (data: number) => void;
  client: IotaClient | null;
  setClient: (data: IotaClient | null) => void;
}

// 👉 Contesto iniziale con valori default (placeholder)
const AppContext = createContext<AppContextType>({
  objectData: null,
  setObjectData: () => {},
  objectID: null,
  setObjectID: () => {},
  network: null,
  setNetwork: () => {},
  credits: 0,
  setCredits: () => {},
  client: null,
  setClient: () => {},
});

// 👉 Provider: wrappa l'intera app
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [objectData, setObjectData] = useState<ObjectData | null>(null);
  const [objectID, setObjectID] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [client, setClient] = useState<IotaClient | null>(null);
  return (
    <AppContext.Provider
      value={{
        objectData,
        setObjectData,
        objectID,
        setObjectID,
        network,
        setNetwork,
        credits,
        setCredits,
        client,
        setClient,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// 👉 Hook comodo per usare il contesto
export const useAppContext = () => useContext(AppContext);
