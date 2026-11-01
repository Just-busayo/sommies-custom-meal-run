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
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    cat: typeof s.cat === "string" && s.cat ? s.cat : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Menu — Sommies Kitchen" },
      { name: "description", content: "Browse rice dishes, grills & sides, drinks and specials from Sommies Kitchen." },
      { property: "og:title", content: "Menu — Sommies Kitchen" },
      { property: "og:description", content: "Rice dishes, grills, drinks and chef specials — order online or on WhatsApp." },
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
    if (price === "lt3" && i.price >= 3000) return false;
    if (price === "3to6" && (i.price < 3000 || i.price > 6000)) return false;
    if (price === "gt6" && i.price <= 6000) return false;
    return true;
  }), [data, q, cat, price]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-extrabold md:text-5xl">Our menu</h1>
      <p className="mt-2 text-muted-foreground">Tap any dish to customise it.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => navigate({ search: (s) => ({ ...s, q: e.target.value || undefined }), replace: true })} placeholder="Search dishes" className="h-11 rounded-full pl-9" />
        </div>
        <Select value={price} onValueChange={setPrice}>
          <SelectTrigger className="h-11 rounded-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any price</SelectItem>
            <SelectItem value="lt3">Under ₦3,000</SelectItem>
            <SelectItem value="3to6">₦3,000 – ₦6,000</SelectItem>
            <SelectItem value="gt6">Over ₦6,000</SelectItem>
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
