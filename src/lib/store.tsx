import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { CartLine } from "./menu";
import { DELIVERY_ZONE } from "./kitchen";

type Store = {
  lines: CartLine[];
  add: (l: Omit<CartLine, "key">) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  address: string;
  setAddress: (a: string) => void;
  user: User | null;
  dark: boolean;
  toggleDark: () => void;
};
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [address, setAddress] = useState(DELIVERY_ZONE);
  const [user, setUser] = useState<User | null>(null);
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem("sk_cart_v2"); if (c) setLines(JSON.parse(c));
      const a = localStorage.getItem("sk_addr_futo"); if (a) setAddress(a);
      const d = localStorage.getItem("sk_dark");
      setDark(d ? d === "1" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch { /* ignore */ }
    setReady(true);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("sk_cart_v2", JSON.stringify(lines)); }, [lines, ready]);
  useEffect(() => { if (ready) localStorage.setItem("sk_addr_futo", address); }, [address, ready]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    if (ready) localStorage.setItem("sk_dark", dark ? "1" : "0");
  }, [dark, ready]);

  const add: Store["add"] = (l) => {
    const key = [l.itemId, l.portion ?? "", l.protein ?? "", [...l.sides].sort().join("+"), l.notes ?? ""].join("|");
    setLines((prev) => {
      const ex = prev.find((p) => p.key === key);
      if (ex) return prev.map((p) => (p.key === key ? { ...p, qty: p.qty + l.qty } : p));
      return [...prev, { ...l, key }];
    });
  };
  const setQty = (key: string, qty: number) =>
    setLines((prev) => (qty <= 0 ? prev.filter((p) => p.key !== key) : prev.map((p) => (p.key === key ? { ...p, qty } : p))));

  return (
    <Ctx.Provider value={{ lines, add, setQty, clear: () => setLines([]), cartOpen, setCartOpen, address, setAddress, user, dark, toggleDark: () => setDark((d) => !d) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
