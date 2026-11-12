import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Moon, Search, ShoppingBag, Sun, User, Instagram, Facebook, Twitter, Phone, ChefHat, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStore } from "@/lib/store";
import { DELIVERY_ZONE, PHONE_CONTACTS, WHATSAPP_NUMBER } from "@/lib/kitchen";

const ZONES = [DELIVERY_ZONE];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
      <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground"><ChefHat className="size-5" /></span>
      <span>Sommies<span className="text-primary"> Kitchen</span></span>
    </Link>
  );
}

export function Header() {
  const { lines, setCartOpen, address, setAddress, dark, toggleDark, user } = useStore();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Logo />
        <Popover>
          <PopoverTrigger asChild>
            <button className="hidden items-center gap-1 rounded-full bg-muted px-3 py-2 text-sm lg:flex">
              <MapPin className="size-4 text-primary" /><span className="max-w-40 truncate">{address}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-2">
            <p className="text-sm font-semibold">Deliver to</p>
            {ZONES.map((z) => (
              <button key={z} onClick={() => setAddress(z)} className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted ${z === address ? "text-primary" : ""}`}>{z}</button>
            ))}
            <Input placeholder="Or type an address" defaultValue={ZONES.includes(address) ? "" : address} onBlur={(e) => e.target.value.trim() && setAddress(e.target.value.trim())} />
          </PopoverContent>
        </Popover>
        <form className="relative mx-auto hidden max-w-md flex-1 md:block" onSubmit={(e) => { e.preventDefault(); navigate({ to: "/menu", search: { q } }); }}>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jollof, suya, zobo..." className="rounded-full pl-9" />
        </form>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleDark} aria-label="Toggle theme">
            {dark ? <Sun /> : <Moon />}
          </Button>
          <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => setCartOpen(true)} aria-label="Cart">
            <ShoppingBag />
            {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{count}</span>}
          </Button>
          {user ? (
            <Link to="/dashboard" className="grid size-9 place-items-center rounded-full bg-secondary font-bold text-secondary-foreground" aria-label="My account">
              {(user.email ?? "U").charAt(0).toUpperCase()}
            </Link>
          ) : (
            <Button asChild size="sm" className="rounded-full"><Link to="/auth"><User className="size-4" />Login</Link></Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <div className="font-display text-2xl font-extrabold">Sommies <span className="text-primary">Kitchen</span></div>
          <p className="text-sm opacity-80">Tasty and healthy home made meals.</p>
          <div className="flex gap-3">
            {[Instagram, Facebook, Twitter].map((I, i) => (
              <a key={i} href="#" aria-label="social" className="grid size-9 place-items-center rounded-full bg-secondary-foreground/10 hover:bg-primary"><I className="size-4" /></a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-bold">Quick links</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/checkout">Checkout</Link></li>
            <li><Link to="/dashboard">My orders</Link></li>
            <li><Link to="/auth">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-bold">Delivery zones</h4>
          <p className="text-sm opacity-80">{DELIVERY_ZONE}</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold">Contact us</h4>
          {PHONE_CONTACTS.map(phone => <Button key={phone} asChild variant="outline" className="w-full rounded-full bg-secondary text-secondary-foreground"><a href={`tel:${phone}`}><Phone />{phone}</a></Button>)}
          <h4 className="mb-3 font-bold">Opening hours</h4>
          <ul className="space-y-1 text-sm opacity-80">
            <li>Mon - Fri: 9am - 9pm</li>
            <li>Saturday: 10am - 10pm</li>
            <li>Sunday: 12pm - 8pm</li>
          </ul>
          {WHATSAPP_NUMBER && (
            <Button asChild size="lg" className="w-full rounded-full bg-success text-primary-foreground hover:bg-success/90">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Sommies%20Kitchen!%20I%27d%20like%20to%20place%20an%20order.`} target="_blank" rel="noreferrer">
                <MessageCircle />Order via WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Sommies Kitchen
      </div>
    </footer>
  );
}
