import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Landmark, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { itemImage, naira, totals, whatsappUrl } from "@/lib/menu";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sommies Kitchen" },
      { name: "description", content: "Review your order and pay online or check out via WhatsApp." },
      { property: "og:title", content: "Checkout — Sommies Kitchen" },
      { property: "og:description", content: "Pay by card, transfer or send your order on WhatsApp." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { lines, address, setAddress, user, clear } = useStore();
  const [name, setName] = useState("");
  const [pay, setPay] = useState<"card" | "transfer">("card");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const t = totals(lines);

  async function save(type: "Online" | "WhatsApp") {
    if (!user) return false;
    const { error } = await supabase.from("orders").insert({
      user_id: user.id, items: lines, total_amount: Math.round(t.total), delivery_address: address,
      checkout_type: type, payment_status: type === "Online" ? "paid" : "pending",
    });
    if (error) { toast.error("Could not save order"); return false; }
    return true;
  }

  async function payOnline() {
    if (!user) { toast("Please sign in to pay online"); navigate({ to: "/auth" }); return; }
    if (!address.trim()) return toast.error("Add a delivery address");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1200)); // payment preview
    const ok = await save("Online");
    setBusy(false);
    if (ok) { clear(); toast.success("Payment received — your order is being prepared!"); navigate({ to: "/dashboard" }); }
  }

  async function viaWhatsApp() {
    if (!address.trim()) return toast.error("Add a delivery address");
    const url = whatsappUrl(lines, address, name || undefined);
    window.open(url, "_blank");
    if (user && (await save("WhatsApp"))) { clear(); toast.success("Order sent! Track it in your dashboard."); }
  }

  if (!lines.length) return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Your cart is empty</h1>
      <Button asChild className="mt-6 rounded-full"><Link to="/menu">Browse the menu</Link></Button>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold">Checkout</h1>
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <h2 className="text-xl font-bold">Delivery details</h2>
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          <Textarea placeholder="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} />
        </section>
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <h2 className="text-xl font-bold">Payment</h2>
          <div className="grid grid-cols-2 gap-3">
            {([["card", CreditCard, "Card"], ["transfer", Landmark, "Bank transfer"]] as const).map(([k, I, l]) => (
              <button key={k} onClick={() => setPay(k)} className={`flex items-center gap-2 rounded-2xl border p-4 font-semibold ${pay === k ? "border-primary bg-accent" : ""}`}><I className="size-5 text-primary" />{l}</button>
            ))}
          </div>
          {pay === "card" ? (
            <div className="grid grid-cols-2 gap-3">
              <Input className="col-span-2" placeholder="Card number 4242 4242 4242 4242" />
              <Input placeholder="MM/YY" /><Input placeholder="CVC" />
            </div>
          ) : (
            <div className="rounded-2xl bg-muted p-4 text-sm">Transfer <b>{naira(t.total)}</b> to <b>Sommies Kitchen · 0123456789 · Demo Bank</b></div>
          )}
          <p className="text-xs text-muted-foreground">Payment preview — no real charge is made.</p>
          <Button disabled={busy} className="h-12 w-full rounded-full text-base" onClick={payOnline}>{busy ? "Processing…" : `Pay ${naira(t.total)}`}</Button>
          <div className="relative py-2 text-center text-xs text-muted-foreground"><span className="bg-card px-2">or</span></div>
          <Button variant="outline" className="h-12 w-full rounded-full border-success text-base text-success hover:bg-success/10" onClick={viaWhatsApp}>
            <MessageCircle />Order & Checkout via WhatsApp
          </Button>
        </section>
      </div>
      <aside className="h-fit space-y-4 rounded-3xl border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="text-xl font-bold">Order summary</h2>
        {lines.map((l) => (
          <div key={l.key} className="flex gap-3 text-sm">
            <img src={itemImage(l.image)} alt="" className="size-12 rounded-xl object-cover" />
            <div className="flex-1"><div className="font-semibold">{l.qty}× {l.title}</div><div className="text-xs text-muted-foreground">{[l.protein, ...l.sides].filter(Boolean).join(", ")}</div></div>
            <div className="font-semibold">{naira(l.unitPrice * l.qty)}</div>
          </div>
        ))}
        <div className="space-y-1 border-t pt-3 text-sm">
          <Row k="Subtotal" v={naira(t.subtotal)} /><Row k="Delivery fee" v={naira(t.delivery)} /><Row k="VAT (7.5%)" v={naira(t.tax)} />
          <div className="flex justify-between pt-2 text-lg font-bold"><span>Total</span><span className="text-primary">{naira(t.total)}</span></div>
        </div>
      </aside>
    </div>
  );
}
const Row = ({ k, v }: { k: string; v: string }) => <div className="flex justify-between text-muted-foreground"><span>{k}</span><span>{v}</span></div>;
