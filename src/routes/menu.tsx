import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { menuQuery, type MenuItem } from "@/lib/menu";
import { FoodCard } from "@/components/FoodCard";
import { ItemModal } from "@/components/ItemModal";

type S = { q?: string | undefined; cat?: string | undefined };
export const Route = createFileRoute("/menu")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s['q'] === "string" && s['q'] ? s['q'] : undefined,
    cat: typeof s['cat'] === "string" && s['cat'] ? s['cat'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Menu — Sommies Kitchen" },
      { name: "description", content: "Browse rice, soups and other orders with confirmed portion prices from Sommies Kitchen." },
      { property: "og:title", content: "Menu — Sommies Kitchen" },
      { property: "og:description", content: "Multi-portion meals and price-on-request dishes for FUTO and its environs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { q = "", cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/menu" });
  const { data, isLoading } = useQuery(menuQuery);
  const [price, setPrice] = useState("all");
  const [open, setOpen] = useState<MenuItem | null>(null);

  const items = useMemo(() => (data?.items ?? []).filter((i) => {
    if (cat && i.category_id !== cat) return false;
    if (q && !`${i.title} ${i.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (price !== "all" && price !== "request" && i.price_on_request) return false;
    if (price === "request" && !i.price_on_request) return false;
    if (price === "lt20" && i.price >= 20000) return false;
    if (price === "20to40" && (i.price < 20000 || i.price > 40000)) return false;
    if (price === "gt40" && i.price <= 40000) return false;
    return true;
  }), [data, q, cat, price]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-extrabold md:text-5xl">Our menu</h1>
      <p className="mt-2 text-muted-foreground">Rice, soups and other orders · FUTO and its environs</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => navigate({ search: (s) => ({ ...s, q: e.target.value || undefined }), replace: true })} placeholder="Search dishes" className="h-11 rounded-full pl-9" />
        </div>
        <Select value={price} onValueChange={setPrice}>
          <SelectTrigger className="h-11 rounded-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any price</SelectItem>
            <SelectItem value="lt20">From under ₦20,000</SelectItem>
            <SelectItem value="20to40">From ₦20,000 – ₦40,000</SelectItem>
            <SelectItem value="gt40">From over ₦40,000</SelectItem>
            <SelectItem value="request">Price on request</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {[{ id: undefined, name: "All", icon: "🍽️" }, ...(data?.categories ?? [])].map((c) => (
          <button key={c.name} onClick={() => navigate({ search: (s) => ({ ...s, cat: c.id }) })}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${cat === c.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>
      {isLoading ? <p className="py-20 text-center text-muted-foreground">Loading menu…</p> : items.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No dishes match your search.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((i) => <FoodCard key={i.id} item={i} onOpen={() => setOpen(i)} />)}
        </div>
      )}
      <ItemModal item={open} onClose={() => setOpen(null)} />
    </div>
  );
}
