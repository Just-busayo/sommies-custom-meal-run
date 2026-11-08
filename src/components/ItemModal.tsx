import { useState } from "react";
import { Minus, Plus, Phone } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { itemImage, naira, type MenuItem } from "@/lib/menu";
import { PHONE_CONTACTS } from "@/lib/kitchen";
import { useStore } from "@/lib/store";

export function ItemModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  return <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
      {item && <Body key={item.id} item={item} onClose={onClose} />}
    </DialogContent>
  </Dialog>;
}

function Body({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { add, setCartOpen } = useStore();
  const [selection, setSelection] = useState(0);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);
  const portion = item.portion_options[selection];
  const unquoted = item.price_on_request || !portion;
  return <>
    <img src={itemImage(item.image_url)} alt={item.title} className="h-48 w-full object-cover sm:rounded-t-lg" />
    <div className="space-y-5 p-6 pt-2">
      <DialogHeader><DialogTitle className="font-display text-2xl">{item.title}</DialogTitle><DialogDescription>{item.description}</DialogDescription></DialogHeader>
      {unquoted ? <div className="space-y-3">
        <p className="text-lg font-bold text-primary">Price on request</p>
        {PHONE_CONTACTS.map(phone => <Button key={phone} asChild variant="outline" className="w-full"><a href={`tel:${phone}`}><Phone className="size-4" />{phone}</a></Button>)}
      </div> : <>
        <fieldset><legend className="mb-2 font-semibold">Portion size & included protein</legend>
          <div className="space-y-2">{item.portion_options.map((option, index) => <label key={`${option.size}-${option.includes}`} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${selection === index ? "border-primary bg-accent" : ""}`}>
            <input type="radio" name="portion" checked={selection === index} onChange={() => setSelection(index)} aria-label={`${option.size}, ${option.includes}, ${naira(option.price)}`} className="mt-1 shrink-0 accent-primary" />
            <span className="min-w-0 flex-1"><span className="font-semibold">{option.size}</span><span className="block text-xs text-muted-foreground">{option.includes}</span></span>
            <span className="shrink-0 font-bold">{naira(option.price)}</span>
          </label>)}</div>
        </fieldset>
        <div><h4 className="mb-2 font-semibold">Special instructions</h4><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Less pepper, no onions" maxLength={200} /></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border p-1">
            <Button size="icon" variant="ghost" aria-label="Decrease quantity" className="size-8 rounded-full" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="size-4" /></Button>
            <span className="w-6 text-center font-semibold">{qty}</span>
            <Button size="icon" variant="ghost" aria-label="Increase quantity" className="size-8 rounded-full" onClick={() => setQty(qty + 1)}><Plus className="size-4" /></Button>
          </div>
          <Button className="h-11 flex-1 rounded-full" disabled={!item.is_available} onClick={() => {
            if (!portion || item.price_on_request) return;
            add({ itemId: item.id, title: item.title, image: item.image_url ?? "", unitPrice: portion.price, qty, portion: portion.size, protein: portion.includes, sides: [], notes: notes.trim() || undefined });
            toast.success(`${item.title} added to cart`, { action: { label: "View cart", onClick: () => setCartOpen(true) } });
            onClose();
          }}>Add {naira(portion.price * qty)}</Button>
        </div>
      </>}
    </div>
  </>;
}
