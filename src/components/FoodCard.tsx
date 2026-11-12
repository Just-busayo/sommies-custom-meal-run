import { Plus, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { itemImage, naira, type MenuItem } from "@/lib/menu";

export function FoodCard({ item, onOpen }: { item: MenuItem; onOpen: () => void }) {
  return (
    <div onClick={onOpen} className="group cursor-pointer overflow-hidden rounded-3xl border bg-card transition hover:-translate-y-1 hover:shadow-warm">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={itemImage(item.image_url)} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {!item.is_available && <span className="absolute inset-0 flex items-center justify-center bg-background/70 font-semibold">Sold out</span>}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-lg font-bold">{item.title}</h3>
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{item.description}</p>
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-base font-bold text-primary">{item.price_on_request ? "Price on request" : `From ${naira(item.price)}`}</div>
            {!item.price_on_request && <div className="text-xs text-muted-foreground">1–4 liters</div>}
          </div>
          <Button size="icon" disabled={!item.is_available} className="rounded-full" aria-label={`Add ${item.title}`}
            onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            {item.price_on_request ? <Phone /> : <Plus />}
          </Button>
        </div>
      </div>
    </div>
  );
}
