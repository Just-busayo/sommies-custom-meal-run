import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { itemImage, naira, totals } from "@/lib/menu";
import { useStore } from "@/lib/store";

export function CartDrawer() {
  const { lines, setQty, cartOpen, setCartOpen } = useStore();
  const t = totals(lines);
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader><SheetTitle className="font-display text-2xl">Your cart</SheetTitle></SheetHeader>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingBag className="size-12" />
            <p>Your cart is empty</p>
            <Button asChild className="rounded-full" onClick={() => setCartOpen(false)}><Link to="/menu">Browse menu</Link></Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4">
              {lines.map((l) => (
                <div key={l.key} className="flex gap-3 rounded-2xl border p-3">
                  <img src={itemImage(l.image)} alt="" className="size-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{l.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {[l.portion, l.protein, ...l.sides].filter(Boolean).join(", ")}{l.notes ? ` · "${l.notes}"` : ""}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="size-7 rounded-full" onClick={() => setQty(l.key, l.qty - 1)}>
                          {l.qty === 1 ? <Trash2 className="size-3" /> : <Minus className="size-3" />}
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                        <Button size="icon" variant="outline" className="size-7 rounded-full" onClick={() => setQty(l.key, l.qty + 1)}><Plus className="size-3" /></Button>
                      </div>
                      <span className="font-semibold">{naira(l.unitPrice * l.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t p-4">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{naira(t.subtotal)}</span></div>
              <div className="flex justify-between text-sm text-muted-foreground"><span>Delivery & VAT at checkout</span></div>
              <Button asChild className="h-12 w-full rounded-full text-base" onClick={() => setCartOpen(false)}>
                <Link to="/checkout">Checkout · {naira(t.subtotal)}</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
