import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bike, Flame, Star, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";
import grill from "@/assets/grill.jpg";
import drinks from "@/assets/drinks.jpg";
import { menuQuery, type MenuItem } from "@/lib/menu";
import { FoodCard } from "@/components/FoodCard";
import { ItemModal } from "@/components/ItemModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sommies Kitchen — Fresh Nigerian Food Delivered Fast" },
      { name: "description", content: "Smoky jollof, peppered grills and chilled zobo, cooked fresh and delivered hot across Lagos." },
      { property: "og:title", content: "Sommies Kitchen — Fresh Nigerian Food Delivered Fast" },
      { property: "og:description", content: "Smoky jollof, peppered grills and chilled zobo, delivered hot across Lagos." },
    ],
  }),
  component: Index,
});

const highlights = [
  { icon: Bike, title: "Lightning delivery", text: "Hot at your door in 30–45 minutes." },
  { icon: Leaf, title: "Freshly prepared", text: "Cooked to order, never reheated." },
  { icon: Flame, title: "Top-rated dishes", text: "Our jollof has a 4.9★ average." },
  { icon: Star, title: "Loved by 10k+", text: "Real reviews from real food lovers." },
];
const reviews = [
  { name: "Tolu A.", text: "The smoky jollof tastes exactly like party rice. Arrived piping hot!" },
  { name: "Chidi O.", text: "Suya was spicy and perfect. Ordering on WhatsApp was super easy." },
  { name: "Amaka E.", text: "Combo platter fed the whole family. Sommies is now our Friday ritual." },
];

function Index() {
  const { data } = useQuery(menuQuery);
  const [open, setOpen] = useState<MenuItem | null>(null);
  const top = (data?.items ?? []).slice().sort((a, b) => b.rating - a.rating).slice(0, 4);
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">🔥 Now delivering across Lagos</span>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Naija comfort food, <span className="text-primary">delivered hot.</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Sommies Kitchen cooks smoky jollof, flame-grilled proteins and home-style specials fresh every day — and gets them to you fast.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-13 rounded-full px-8 text-base shadow-warm"><Link to="/menu">Order Now <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-13 rounded-full px-8 text-base"><Link to="/menu">See menu</Link></Button>
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="Smoky jollof rice with plantain and grilled chicken" width={1536} height={1024} className="aspect-[4/3] w-full rounded-[2.5rem] object-cover shadow-warm" />
          <img src={grill} alt="" loading="lazy" className="absolute -bottom-6 -left-6 hidden size-36 rounded-3xl border-4 border-background object-cover md:block" />
          <img src={drinks} alt="" loading="lazy" className="absolute -right-4 -top-6 hidden size-28 rounded-3xl border-4 border-background object-cover md:block" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <div key={h.title} className="rounded-3xl bg-muted p-6">
            <h.icon className="mb-3 size-8 text-primary" />
            <h3 className="text-lg font-bold">{h.title}</h3>
            <p className="text-sm text-muted-foreground">{h.text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-extrabold md:text-4xl">Top-rated dishes</h2>
          <Link to="/menu" className="text-sm font-semibold text-primary">View all →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((i) => <FoodCard key={i.id} item={i} onOpen={() => setOpen(i)} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-3xl font-extrabold md:text-4xl">What customers say</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.name} className="rounded-3xl border bg-card p-6">
              <div className="mb-3 flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-primary text-primary" />)}</div>
              <p className="mb-4">"{r.text}"</p>
              <p className="text-sm font-semibold text-muted-foreground">— {r.name}</p>
            </div>
          ))}
        </div>
      </section>
      <ItemModal item={open} onClose={() => setOpen(null)} />
    </>
  );
}
