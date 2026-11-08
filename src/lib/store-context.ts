import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { CartLine } from "./menu";

export type Store = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "key">) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  address: string;
  setAddress: (address: string) => void;
  user: User | null;
  dark: boolean;
  toggleDark: () => void;
};

// Retain identity when Vite replaces modules while a provider is mounted.
export const StoreContext =
  (import.meta.hot?.data.storeContext as React.Context<Store | null> | undefined) ??
  createContext<Store | null>(null);

if (import.meta.hot) import.meta.hot.data.storeContext = StoreContext;

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore outside provider");
  return store;
}