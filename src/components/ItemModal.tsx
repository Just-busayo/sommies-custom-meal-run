import { useState } from "react";
import { Minus, Plus, Star, Clock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { itemImage, naira, PROTEINS, SIDES, type MenuItem } from "@/lib/menu";
import { useStore } from "@/lib/store";

export function ItemModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
        {item && <Body key={item.id} item={item} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { add, setCartOpen } = useStore();
  const isDrink = item.category_id === "11111111-0000-0000-0000-000000000003";
  const [protein, setProtein] = useState<string | undefined>(isDrink ? undefined : "Chicken");
  const [sides, setSides] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);
  const unit = item.price + (PROTEINS.find((p) => p.name === protein)?.price ?? 0) +
    sides.reduce((s, n) => s + (SIDES.find((x) => x.name === n)?.price ?? 0), 0);

  return (
    <>
      <img src={itemImage(item.image_url)} alt={item.title} className="h-56 w-full object-cover sm:rounded-t-lg" />
      <div className="space-y-5 p-6 pt-2">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{item.title}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
          <div className="flex gap-4 pt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="size-4 fill-primary text-primary" />{item.rating}</span>
            <span className="flex items-center gap-1"><Clock className="size-4" />{item.prep_minutes}–{item.prep_minutes + 15} min</span>
          </div>
        </DialogHeader>
        {!isDrink && (
          <div>
            <h4 className="mb-2 font-semibold">Choice of protein</h4>
            <div className="grid grid-cols-2 gap-2">
              {PROTEINS.map((p) => (
                <button key={p.name} onClick={() => setProtein(p.name)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${protein === p.name ? "border-primary bg-accent" : "hover:border-primary/50"}`}>
                  {p.name}<span className="block text-xs text-muted-foreground">{p.price ? `+${naira(p.price)}` : "Included"}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {!isDrink && (
          <div>
            <h4 className="mb-2 font-semibold">Extra sides</h4>
            <div className="space-y-2">
              {SIDES.map((s) => (
                <label key={s.name} className="flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <Checkbox checked={sides.includes(s.name)} onCheckedChange={(c) => setSides((p) => (c ? [...p, s.name] : p.filter((x) => x !== s.name)))} />
                    {s.name}
                  </span>
                  <span className="text-muted-foreground">+{naira(s.price)}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <div>
          <h4 className="mb-2 font-semibold">Special instructions</h4>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Less pepper, no onions" maxLength={200} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border p-1">
            <Button size="icon" variant="ghost" className="size-8 rounded-full" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="size-4" /></Button>
            <span className="w-6 text-center font-semibold">{qty}</span>
            <Button size="icon" variant="ghost" className="size-8 rounded-full" onClick={() => setQty(qty + 1)}><Plus className="size-4" /></Button>
          </div>
          <Button className="h-11 flex-1 rounded-full text-base" onClick={() => {
            add({ itemId: item.id, title: item.title, image: item.image_url ?? "", unitPrice: unit, qty, protein, sides, notes: notes.trim() || undefined });
            toast.success(`${item.title} added to cart`, { action: { label: "View cart", onClick: () => setCartOpen(true) } });
            onClose();
          }}>
            Add {naira(unit * qty)}
          </Button>
        </div>
      </div>
    </>
  );
}
