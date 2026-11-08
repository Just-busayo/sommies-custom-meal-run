import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, ChefHat, Bike, PackageCheck, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { naira, type CartLine } from "@/lib/menu";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Orders — Sommies Kitchen" },
      { name: "description", content: "Track your Sommies Kitchen orders and manage your profile." },
      { property: "og:title", content: "My Orders — Sommies Kitchen" },
      { property: "og:description", content: "Order history, live status and profile settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const STEPS = [
  { name: "Received", icon: Check },
  { name: "Preparing", icon: ChefHat },
  { name: "Out for Delivery", icon: Bike },
  { name: "Delivered", icon: PackageCheck },
];

function Dashboard() {
  const { user } = useStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const orders = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-4xl font-extrabold">My account</h1><p className="text-muted-foreground">{user?.email}</p></div>
        <Button variant="outline" className="rounded-full" onClick={signOut}><LogOut />Sign out</Button>
      </div>
      <Tabs defaultValue="orders">
        <TabsList className="rounded-full"><TabsTrigger value="orders" className="rounded-full">Orders</TabsTrigger><TabsTrigger value="profile" className="rounded-full">Profile</TabsTrigger></TabsList>
        <TabsContent value="orders" className="mt-6 space-y-4">
          {orders.isLoading && <p className="text-muted-foreground">Loading…</p>}
          {orders.data?.length === 0 && <p className="rounded-3xl border bg-card p-10 text-center text-muted-foreground">No orders yet — time to eat!</p>}
          {orders.data?.map((o) => {
            const idx = Math.max(0, STEPS.findIndex((s) => s.name === o.order_status));
            const items = (o.items as unknown as CartLine[]) ?? [];
            return (
              <div key={o.id} className="rounded-3xl border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-bold">Order #{o.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()} · {o.checkout_type} · {o.payment_status}</div>
                  </div>
                  <div className="text-xl font-bold text-primary">{naira(Number(o.total_amount))}</div>
                </div>
                <p className="mt-2 text-sm">{items.map((i) => `${i.qty}× ${i.title}`).join(", ")}</p>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {STEPS.map((s, i) => (
                    <div key={s.name} className="flex flex-col items-center gap-1 text-center">
                      <div className={`grid size-10 place-items-center rounded-full ${i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><s.icon className="size-5" /></div>
                      <span className={`text-xs ${i <= idx ? "font-semibold" : "text-muted-foreground"}`}>{s.name}</span>
                      <div className={`h-1 w-full rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
        <TabsContent value="profile" className="mt-6"><Profile /></TabsContent>
      </Tabs>
    </div>
  );
}

function Profile() {
  const { user, setAddress } = useStore();
  const [f, setF] = useState({ full_name: "", phone_number: "", delivery_address: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setF({ full_name: data.full_name ?? "", phone_number: data.phone_number ?? "", delivery_address: data.delivery_address ?? "" });
    });
  }, [user]);
  async function save() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...f });
    setBusy(false);
    if (error) { toast.error("Could not save profile"); return; }
    if (f.delivery_address) setAddress(f.delivery_address);
    toast.success("Profile saved");
  }
  return (
    <div className="max-w-lg space-y-3 rounded-3xl border bg-card p-6">
      <Input placeholder="Full name" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
      <Input placeholder="Phone number" value={f.phone_number} onChange={(e) => setF({ ...f, phone_number: e.target.value })} />
      <Input placeholder="Default delivery address" value={f.delivery_address} onChange={(e) => setF({ ...f, delivery_address: e.target.value })} />
      <Button disabled={busy} className="rounded-full" onClick={save}>{busy ? "Saving…" : "Save profile"}</Button>
    </div>
  );
}
