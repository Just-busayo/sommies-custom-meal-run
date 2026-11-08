import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import hero from "@/assets/hero.jpg";
import grill from "@/assets/grill.jpg";
import rice from "@/assets/rice.jpg";
import drinks from "@/assets/drinks.jpg";
import { WHATSAPP_NUMBER, type Portion } from "./kitchen";
import type { Json } from "@/integrations/supabase/types";
export { WHATSAPP_NUMBER } from "./kitchen";

// Replace with the kitchen's real WhatsApp number (international format, digits only).
export const WHATSAPP_NUMBER = "2347086883952";
export const DELIVERY_FEE = 1500;
export const TAX_RATE = 0.075;

const imageMap: Record<string, string> = {
  jollof: hero, platter: hero, okra: hero, dodo: hero,
  friedrice: rice, ofada: rice,
  chicken: grill, suya: grill,
  zobo: drinks, chapman: drinks,
};
export const itemImage = (key: string | null) =>
  key && key.startsWith("http") ? key : imageMap[key ?? ""] ?? hero;

export const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

export type MenuItem = {
  id: string; title: string; description: string | null; price: number;
  category_id: string | null; image_url: string | null; is_available: boolean;
  rating: number; prep_minutes: number;
  portion_options: Portion[]; price_on_request: boolean;
};
export type Category = { id: string; name: string; icon: string | null; sort: number };

export function parsePortions(value: Json): Portion[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(option => {
    if (!option || typeof option !== "object" || Array.isArray(option)) return [];
    const { size, includes, price } = option;
    if (typeof size !== "string" || typeof includes !== "string" || typeof price !== "number" || price <= 0) return [];
    return [{ size, includes, price }];
  });
}

export const menuQuery = queryOptions({
  queryKey: ["menu"],
  queryFn: async () => {
    const [c, m] = await Promise.all([
      supabase.from("categories").select("*").order("sort"),
      supabase.from("menu_items").select("*").eq("retired", false).order("title"),
    ]);
    if (c.error) throw c.error;
    if (m.error) throw m.error;
    return {
      categories: c.data.filter(category => m.data?.some(item => item.category_id === category.id)) as Category[],
      items: (m.data ?? []).map((i) => ({ ...i, price: Number(i.price), rating: Number(i.rating), portion_options: parsePortions(i.portion_options) })),
    };
  },
});

export type CartLine = {
  key: string; itemId: string; title: string; image: string; unitPrice: number;
  qty: number; portion?: string; protein?: string | undefined; sides: string[]; notes?: string | undefined;
};

export function totals(lines: CartLine[]) {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const delivery = lines.length ? DELIVERY_FEE : 0;
  const tax = subtotal * TAX_RATE;
  return { subtotal, delivery, tax, total: subtotal + delivery + tax };
}

export function whatsappUrl(lines: CartLine[], address: string, name?: string) {
  if (!WHATSAPP_NUMBER) return null;
  const t = totals(lines);
  const body = [
    "🍽️ *New Order — Sommies Kitchen*",
    name ? `Name: ${name}` : null,
    "",
    ...lines.map((l, i) => {
      const extra = [l.portion && `Portion: ${l.portion}`, l.protein && `Protein: ${l.protein}`, l.sides.length && `Sides: ${l.sides.join(", ")}`, l.notes && `Note: ${l.notes}`]
        .filter(Boolean).join(" | ");
      return `${i + 1}. ${l.qty}x ${l.title} — ${naira(l.unitPrice * l.qty)}${extra ? `\n   ${extra}` : ""}`;
    }),
    "",
    `Subtotal: ${naira(t.subtotal)}`,
    `Delivery: ${naira(t.delivery)}`,
    `VAT (7.5%): ${naira(t.tax)}`,
    `*Total: ${naira(t.total)}*`,
    "",
    `📍 Delivery address: ${address || "(not provided)"}`,
  ].filter((x) => x !== null).join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
}
