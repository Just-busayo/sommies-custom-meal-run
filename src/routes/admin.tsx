import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import {
  ChefHat,
  Bike,
  PackageCheck,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  Utensils,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  MapPin,
  Check,
  AlertCircle,
  Edit2,
  Trash2,
  TrendingUp,
  ShieldCheck,
  LogOut,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { naira, itemImage, type CartLine, DELIVERY_FEE, TAX_RATE, WHATSAPP_NUMBER } from "@/lib/menu";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Staff & Kitchen Admin Portal — Sommies Kitchen" },
      { name: "description", content: "Sommies Kitchen kitchen and order management portal." },
      { property: "og:title", content: "Staff & Kitchen Admin Portal — Sommies Kitchen" },
    ],
  }),
  component: AdminPageWrapper,
});

type OrderItem = {
  id: string;
  user_id: string;
  items: unknown;
  total_amount: number;
  payment_status: string;
  order_status: string;
  delivery_address: string;
  checkout_type: string;
  created_at: string;
};

type MenuItemRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  is_available: boolean;
  rating: number;
  prep_minutes: number;
};

type CategoryRow = {
  id: string;
  name: string;
  icon: string | null;
  sort: number;
};

const ORDER_STATUS_STEPS = ["Received", "Preparing", "Out for Delivery", "Delivered"];

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Delivered":
      return "default";
    case "Out for Delivery":
      return "secondary";
    case "Preparing":
      return "outline";
    default:
      return "outline";
  }
}

/**
 * Main Controller that gates access:
 * If logged in -> Renders the Kitchen Admin Dashboard
 * If NOT logged in -> Renders the dedicated Admin Login Form
 */
function AdminPageWrapper() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    // Check active auth state
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user ?? null);
      setCheckingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleAdminSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    setCurrentUser(null);
    toast.success("Signed out of Admin Portal");
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <RefreshCw className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Checking admin session…</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AdminLoginForm onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return <AdminDashboard user={currentUser} onSignOut={handleAdminSignOut} />;
}

/**
 * Dedicated Admin / Staff Login Screen
 */
function AdminLoginForm({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (mode === "in") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      setLoading(false);

      if (error) {
        toast.error(error.message || "Invalid credentials. If this is your first time, click 'Set up new admin account' below.");
        return;
      }

      if (data.user) {
        toast.success("Welcome back to Sommies Kitchen Admin Portal");
        onLoginSuccess(data.user);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim() || "Kitchen Admin",
            role: "admin",
          },
        },
      });

      setLoading(false);

      if (error) {
        toast.error(error.message || "Failed to create admin credentials");
        return;
      }

      if (data.user) {
        toast.success("Admin account created! Logging into dashboard…");
        onLoginSuccess(data.user);
      } else {
        toast.info("Please check your email to confirm your account, then sign in.");
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border bg-card p-8 shadow-warm">
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <ChefHat className="size-8" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <ShieldCheck className="size-3.5" /> Staff & Kitchen Portal
          </div>
          <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
            {mode === "in" ? "Kitchen Admin Login" : "Set Up Admin Account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "in"
              ? "Sign in with your staff email and password to manage orders & menu."
              : "Register your kitchen staff/management credentials to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === "up" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Staff Name</label>
              <Input
                placeholder="e.g. Sommie / Head Chef"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-2xl"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Staff Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="admin@sommieskitchen.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-2xl pl-10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              {mode === "in" ? "Admin Password" : "Create Password (min. 6 characters)"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 rounded-2xl pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl text-base font-bold shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="size-4 animate-spin" /> Verifying…
              </span>
            ) : mode === "in" ? (
              <span className="flex items-center gap-2">
                Sign In to Dashboard <ArrowRight className="size-4" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create & Access Dashboard <ArrowRight className="size-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
          Protected Area · Authorized Sommies Kitchen Personnel Only ·{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "in" ? "First time?" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Dedicated Admin / Kitchen Operations Dashboard
 */
function AdminDashboard({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const qc = useQueryClient();

  // Active tab
  const [activeTab, setActiveTab] = useState("orders");

  // Orders State & Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Menu State & Filters
  const [menuSearch, setMenuSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Dish Dialog Modal State
  const [isDishDialogOpen, setIsDishDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItemRow | null>(null);
  const [dishForm, setDishForm] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    prep_minutes: "30",
    image_url: "jollof",
    is_available: true,
  });

  // Fetch Orders
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
    isRefetching: isOrdersRefetching,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OrderItem[];
    },
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort");
      if (error) throw error;
      return (data ?? []) as CategoryRow[];
    },
  });

  // Fetch Menu Items
  const {
    data: menuItems = [],
    isLoading: isMenuLoading,
    refetch: refetchMenu,
    isRefetching: isMenuRefetching,
  } = useQuery({
    queryKey: ["admin-menu"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("title");
      if (error) throw error;
      return (data ?? []).map((i) => ({
        ...i,
        price: Number(i.price),
        rating: Number(i.rating),
      })) as MenuItemRow[];
    },
  });

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalRev = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const activeCount = orders.filter((o) => o.order_status !== "Delivered").length;
    const availableDishes = menuItems.filter((m) => m.is_available).length;
    return {
      totalRev,
      activeCount,
      totalOrders: orders.length,
      availableDishes,
      totalDishes: menuItems.length,
    };
  }, [orders, menuItems]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.order_status !== statusFilter) return false;
      if (orderSearch) {
        const query = orderSearch.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(query);
        const matchesAddress = o.delivery_address?.toLowerCase().includes(query);
        const matchesType = o.checkout_type?.toLowerCase().includes(query);
        return matchesId || matchesAddress || matchesType;
      }
      return true;
    });
  }, [orders, statusFilter, orderSearch]);

  // Filtered Menu Items
  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      if (categoryFilter !== "all" && item.category_id !== categoryFilter) return false;
      if (menuSearch) {
        const q = menuSearch.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [menuItems, categoryFilter, menuSearch]);

  // Update Order Status Handler
  async function handleUpdateOrderStatus(orderId: string, nextStatus: string) {
    // Optimistic UI update
    qc.setQueryData<OrderItem[]>(["admin-orders"], (old) =>
      old ? old.map((o) => (o.id === orderId ? { ...o, order_status: nextStatus } : o)) : []
    );

    const { error } = await supabase
      .from("orders")
      .update({ order_status: nextStatus })
      .eq("id", orderId);

    if (error) {
      toast.error(`Could not update status: ${error.message}`);
      refetchOrders();
    } else {
      toast.success(`Order marked as "${nextStatus}"`);
      qc.invalidateQueries({ queryKey: ["orders"] });
    }
  }

  // Toggle Dish Availability
  async function handleToggleAvailability(item: MenuItemRow) {
    const newStatus = !item.is_available;
    // Optimistic update
    qc.setQueryData<MenuItemRow[]>(["admin-menu"], (old) =>
      old ? old.map((m) => (m.id === item.id ? { ...m, is_available: newStatus } : m)) : []
    );

    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: newStatus })
      .eq("id", item.id);

    if (error) {
      toast.error(`Failed to update item: ${error.message}`);
      refetchMenu();
    } else {
      toast.success(`${item.title} marked as ${newStatus ? "Available" : "Sold Out"}`);
      qc.invalidateQueries({ queryKey: ["menu"] });
    }
  }

  // Open Dish Modal (Add / Edit)
  function handleOpenDishModal(dish?: MenuItemRow) {
    if (dish) {
      setEditingDish(dish);
      setDishForm({
        title: dish.title,
        description: dish.description ?? "",
        price: dish.price.toString(),
        category_id: dish.category_id ?? categories[0]?.id ?? "",
        prep_minutes: dish.prep_minutes?.toString() ?? "30",
        image_url: dish.image_url ?? "jollof",
        is_available: dish.is_available,
      });
    } else {
      setEditingDish(null);
      setDishForm({
        title: "",
        description: "",
        price: "4500",
        category_id: categories[0]?.id ?? "",
        prep_minutes: "30",
        image_url: "jollof",
        is_available: true,
      });
    }
    setIsDishDialogOpen(true);
  }

  // Save Dish (Add or Update)
  async function handleSaveDish() {
    if (!dishForm.title.trim()) {
      toast.error("Please provide a dish title");
      return;
    }
    const numPrice = parseFloat(dishForm.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const payload = {
      title: dishForm.title.trim(),
      description: dishForm.description.trim() || null,
      price: numPrice,
      category_id: dishForm.category_id || null,
      prep_minutes: parseInt(dishForm.prep_minutes) || 30,
      image_url: dishForm.image_url.trim() || "jollof",
      is_available: dishForm.is_available,
    };

    if (editingDish) {
      const { error } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", editingDish.id);
      if (error) {
        toast.error(`Could not update dish: ${error.message}`);
        return;
      }
      toast.success("Dish updated successfully!");
    } else {
      const { error } = await supabase.from("menu_items").insert(payload);
      if (error) {
        toast.error(`Could not create dish: ${error.message}`);
        return;
      }
      toast.success("New dish added to menu!");
    }

    setIsDishDialogOpen(false);
    refetchMenu();
    qc.invalidateQueries({ queryKey: ["menu"] });
  }

  // Delete Dish
  async function handleDeleteDish(dish: MenuItemRow) {
    if (!confirm(`Are you sure you want to delete "${dish.title}"?`)) return;

    const { error } = await supabase.from("menu_items").delete().eq("id", dish.id);
    if (error) {
      toast.error(`Could not delete dish: ${error.message}`);
    } else {
      toast.success(`${dish.title} removed from menu`);
      refetchMenu();
      qc.invalidateQueries({ queryKey: ["menu"] });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" /> Kitchen Admin Portal
            </span>
            <span className="text-xs text-muted-foreground">Admin: {user.email}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Kitchen Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor incoming orders, advance fulfillment status, and maintain menu dish inventory.
          </p>
        </div>

        {/* Dedicated Admin Sign Out */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-full text-sm font-semibold border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={onSignOut}
          >
            <LogOut className="size-4 mr-1.5" /> Admin Sign Out
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Orders</span>
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bike className="size-4" />
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold">{metrics.activeCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">Pending delivery</p>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
            <span className="grid size-8 place-items-center rounded-xl bg-secondary/10 text-secondary">
              <ShoppingBag className="size-4" />
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold">{metrics.totalOrders}</div>
          <p className="mt-1 text-xs text-muted-foreground">Lifetime placed orders</p>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Revenue</span>
            <span className="grid size-8 place-items-center rounded-xl bg-success/15 text-success">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-success">
            {naira(metrics.totalRev)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">From online and WhatsApp orders</p>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Dishes In Stock</span>
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <ChefHat className="size-4" />
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold">
            {metrics.availableDishes} <span className="text-sm font-normal text-muted-foreground">/ {metrics.totalDishes}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Available on live menu</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <TabsList className="h-11 rounded-full p-1 bg-muted/80">
            <TabsTrigger value="orders" className="rounded-full px-5 font-semibold">
              <ShoppingBag className="size-4 mr-2" /> Live Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="menu" className="rounded-full px-5 font-semibold">
              <ChefHat className="size-4 mr-2" /> Menu Items ({menuItems.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full px-5 font-semibold">
              <SlidersHorizontal className="size-4 mr-2" /> Kitchen Settings
            </TabsTrigger>
          </TabsList>

          {activeTab === "orders" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchOrders()}
              disabled={isOrdersRefetching}
              className="rounded-full self-start sm:self-auto"
            >
              <RefreshCw className={`size-3.5 mr-1.5 ${isOrdersRefetching ? "animate-spin" : ""}`} />
              Refresh Orders
            </Button>
          )}

          {activeTab === "menu" && (
            <Button
              onClick={() => handleOpenDishModal()}
              className="rounded-full self-start sm:self-auto"
            >
              <Plus className="size-4 mr-1.5" /> Add New Dish
            </Button>
          )}
        </div>

        {/* -------------------- TAB 1: ORDERS -------------------- */}
        <TabsContent value="orders" className="mt-6 space-y-4">
          {/* Orders Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID or delivery address…"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="h-11 rounded-full pl-9"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {["all", ...ORDER_STATUS_STEPS].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    statusFilter === st
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card hover:border-primary text-muted-foreground"
                  }`}
                >
                  {st === "all" ? "All Orders" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {isOrdersLoading ? (
            <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground">
              <RefreshCw className="mx-auto size-6 animate-spin mb-2 text-primary" />
              Loading live orders…
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground">
              <ShoppingBag className="mx-auto size-8 mb-2 opacity-50" />
              No orders found matching the filter criteria.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((o) => {
                const items = (o.items as unknown as CartLine[]) ?? [];
                const currentIdx = ORDER_STATUS_STEPS.indexOf(o.order_status);
                const isDelivered = o.order_status === "Delivered";

                return (
                  <div
                    key={o.id}
                    className="rounded-3xl border bg-card p-6 shadow-xs transition hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display font-bold text-lg">
                            Order #{o.id.slice(0, 8).toUpperCase()}
                          </span>
                          <Badge variant={getStatusBadgeVariant(o.order_status)}>
                            {o.order_status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {o.checkout_type === "WhatsApp" ? (
                              <span className="flex items-center gap-1 text-success">
                                <MessageCircle className="size-3" /> WhatsApp
                              </span>
                            ) : (
                              "Online Checkout"
                            )}
                          </Badge>
                          <Badge
                            variant={o.payment_status === "paid" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            Payment: {o.payment_status}
                          </Badge>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" /> {new Date(o.created_at).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5 text-primary" />
                            {o.delivery_address || "No address provided"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-display text-2xl font-bold text-primary">
                          {naira(Number(o.total_amount))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {items.reduce((s, i) => s + (i.qty || 1), 0)} items total
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items Detail */}
                    <div className="mt-4 rounded-2xl bg-muted/50 p-4">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Items in this order:
                      </div>
                      <div className="divide-y divide-border/60">
                        {items.map((it, idx) => (
                          <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between">
                            <div>
                              <div className="text-sm font-semibold">
                                <span className="text-primary font-bold mr-1.5">{it.qty}×</span>
                                {it.title}
                              </div>
                              {(it.protein || (it.sides && it.sides.length > 0) || it.notes) && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {[
                                    it.protein && `Protein: ${it.protein}`,
                                    it.sides && it.sides.length > 0 && `Sides: ${it.sides.join(", ")}`,
                                    it.notes && `Note: "${it.notes}"`,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {naira(Number(it.unitPrice) * (it.qty || 1))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Stepper Progression */}
                    <div className="mt-5 pt-4 border-t flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        <span className="text-muted-foreground font-medium mr-1">Progress:</span>
                        {ORDER_STATUS_STEPS.map((step, idx) => {
                          const isActive = idx <= currentIdx;
                          return (
                            <button
                              key={step}
                              onClick={() => handleUpdateOrderStatus(o.id, step)}
                              className={`flex items-center gap-1 rounded-full px-3 py-1 font-semibold transition ${
                                o.order_status === step
                                  ? "bg-primary text-primary-foreground shadow-xs"
                                  : isActive
                                  ? "bg-primary/20 text-foreground hover:bg-primary/30"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {isActive && <Check className="size-3" />}
                              {step}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Next Stage Action */}
                      {!isDelivered && currentIdx < ORDER_STATUS_STEPS.length - 1 && (
                        <Button
                          size="sm"
                          className="rounded-full self-end md:self-auto font-semibold"
                          onClick={() =>
                            handleUpdateOrderStatus(o.id, ORDER_STATUS_STEPS[currentIdx + 1]!)
                          }
                        >
                          Advance to &quot;{ORDER_STATUS_STEPS[currentIdx + 1]}&quot;
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* -------------------- TAB 2: MENU ITEMS -------------------- */}
        <TabsContent value="menu" className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search menu dishes by name or ingredients…"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="h-11 rounded-full pl-9"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  categoryFilter === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card hover:border-primary text-muted-foreground"
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    categoryFilter === c.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card hover:border-primary text-muted-foreground"
                  }`}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          {isMenuLoading ? (
            <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground">
              <RefreshCw className="mx-auto size-6 animate-spin mb-2 text-primary" />
              Loading kitchen menu…
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMenu.map((item) => {
                const category = categories.find((c) => c.id === item.category_id);
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col justify-between rounded-3xl border bg-card p-5 transition shadow-xs ${
                      !item.is_available ? "opacity-60 bg-muted/20" : ""
                    }`}
                  >
                    <div>
                      <div className="relative mb-3 h-40 overflow-hidden rounded-2xl bg-muted">
                        <img
                          src={itemImage(item.image_url)}
                          alt={item.title}
                          className="size-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          {category && (
                            <Badge variant="secondary" className="backdrop-blur bg-background/80 text-xs">
                              {category.icon} {category.name}
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={item.is_available ? "default" : "destructive"}
                            className="text-xs shadow-xs"
                          >
                            {item.is_available ? "In Stock" : "Sold Out"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-bold text-lg leading-tight">{item.title}</h3>
                        <div className="font-display text-lg font-extrabold text-primary shrink-0">
                          {naira(item.price)}
                        </div>
                      </div>

                      {item.description && (
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-primary" /> {item.prep_minutes} mins prep
                        </span>
                        <span>⭐ {item.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_available}
                          onCheckedChange={() => handleToggleAvailability(item)}
                          id={`avail-${item.id}`}
                        />
                        <label
                          htmlFor={`avail-${item.id}`}
                          className="text-xs font-semibold cursor-pointer select-none"
                        >
                          {item.is_available ? "Available" : "Sold out"}
                        </label>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full"
                          onClick={() => handleOpenDishModal(item)}
                          title="Edit Dish"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteDish(item)}
                          title="Delete Dish"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* -------------------- TAB 3: SETTINGS -------------------- */}
        <TabsContent value="settings" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
              <h3 className="font-display font-bold text-xl">Ordering & Pricing Config</h3>
              <p className="text-sm text-muted-foreground">
                Current constants configured for customer checkout calculations:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                  <div>
                    <div className="font-semibold text-sm">Delivery Fee</div>
                    <div className="text-xs text-muted-foreground">Applied across all delivery zones</div>
                  </div>
                  <div className="font-display font-bold text-lg text-primary">{naira(DELIVERY_FEE)}</div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                  <div>
                    <div className="font-semibold text-sm">VAT / Consumption Tax</div>
                    <div className="text-xs text-muted-foreground">Standard Lagos state rate</div>
                  </div>
                  <div className="font-display font-bold text-lg">{(TAX_RATE * 100).toFixed(1)}%</div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                  <div>
                    <div className="font-semibold text-sm">Connected WhatsApp Line</div>
                    <div className="text-xs text-muted-foreground">Receives formatted orders directly</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-success">+{WHATSAPP_NUMBER}</span>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noreferrer"
                      className="grid size-8 place-items-center rounded-full bg-success/15 text-success hover:bg-success/25"
                    >
                      <MessageCircle className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
              <h3 className="font-display font-bold text-xl">Menu Categories</h3>
              <p className="text-sm text-muted-foreground">
                Active food & beverage categories in Sommies Kitchen:
              </p>

              <div className="space-y-2 pt-2">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3 bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {menuItems.filter((i) => i.category_id === c.id).length} dishes listed
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">Sort: #{c.sort}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dish Add / Edit Dialog */}
      <Dialog open={isDishDialogOpen} onOpenChange={setIsDishDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editingDish ? "Edit Dish" : "Add New Dish"}
            </DialogTitle>
            <DialogDescription>
              {editingDish
                ? "Update pricing, preparation time or availability for this dish."
                : "Enter details for the new dish to appear on Sommies Kitchen menu."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Dish Title *</label>
              <Input
                placeholder="e.g. Asun Spicy Goat Meat"
                value={dishForm.title}
                onChange={(e) => setDishForm({ ...dishForm, title: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Price (₦) *</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={dishForm.price}
                  onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Prep Time (mins)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={dishForm.prep_minutes}
                  onChange={(e) => setDishForm({ ...dishForm, prep_minutes: e.target.value })}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <Select
                value={dishForm.category_id}
                onValueChange={(val) => setDishForm({ ...dishForm, category_id: val })}
              >
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Image Thumbnail</label>
              <Select
                value={dishForm.image_url}
                onValueChange={(val) => setDishForm({ ...dishForm, image_url: val })}
              >
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Select image style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jollof">🍚 Jollof / Platter style</SelectItem>
                  <SelectItem value="friedrice">🌾 Fried / Native rice style</SelectItem>
                  <SelectItem value="chicken">🍗 Grill / Suya style</SelectItem>
                  <SelectItem value="drinks">🥤 Cold Drinks / Chapman</SelectItem>
                  <SelectItem value="okra">🍲 Seafood Okra / Soup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Textarea
                placeholder="Delicious description of ingredients and taste…"
                value={dishForm.description}
                onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                className="mt-1 rounded-xl resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <div className="text-sm font-semibold">Available on Menu</div>
                <div className="text-xs text-muted-foreground">Customers can order this dish</div>
              </div>
              <Switch
                checked={dishForm.is_available}
                onCheckedChange={(checked) => setDishForm({ ...dishForm, is_available: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDishDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDish} className="rounded-full">
              {editingDish ? "Save Changes" : "Create Dish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

