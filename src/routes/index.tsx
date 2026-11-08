import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChefHat, Users, Utensils, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";
import { menuQuery, type MenuItem } from "@/lib/menu";
import { FoodCard } from "@/components/FoodCard";
import { ItemModal } from "@/components/ItemModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sommies Kitchen — Home Made Meals in FUTO" },
      { name: "description", content: "Tasty and healthy home made meals, batch cooking, catering and family meals for FUTO and its environs." },
      { property: "og:title", content: "Sommies Kitchen — Home Made Meals in FUTO" },
      { property: "og:description", content: "Rice, soups and assorted meat stew for FUTO and its environs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const highlights = [
  { icon: ChefHat, title: "Batch cooking / multi-portion meals" },
  { icon: Users, title: "Small group catering quantity" },
  { icon: Utensils, title: "Family size meals" },
];

function Index() {
  const { data } = useQuery(menuQuery);
  const [open, setOpen] = useState<MenuItem | null>(null);
  const top = (data?.items ?? []).filter(i => !i.price_on_request).slice(0, 4);
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="Jollof rice with plantain and chicken" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-background/85" />
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-14 md:py-20">
          <span className="inline-flex rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">FUTO and its environs</span>
          <h1 className="max-w-2xl text-5xl font-extrabold leading-tight md:text-7xl">Sommies <span className="text-primary">Kitchen</span></h1>
          <p className="max-w-xl text-xl font-semibold">Tasty and healthy home made meals</p>
          <p className="text-muted-foreground">Order - payment - delivery</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-13 rounded-full px-8 text-base shadow-warm"><Link to="/menu">Order Now <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-13 rounded-full px-8 text-base"><Link to="/menu">See menu</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((h) => (
          <div key={h.title} className="rounded-3xl bg-muted p-6">
            <h.icon className="mb-3 size-8 text-primary" />
            <h3 className="text-lg font-bold">{h.title}</h3>
            
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-extrabold md:text-4xl">Rice, soups & stew</h2>
          <Link to="/menu" className="text-sm font-semibold text-primary">View all →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((i) => <FoodCard key={i.id} item={i} onOpen={() => setOpen(i)} />)}
        </div>
      </section>

      <ItemModal item={open} onClose={() => setOpen(null)} />
    </>
  );
}
