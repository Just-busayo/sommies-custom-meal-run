CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text, phone_number text, delivery_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, icon text, sort int NOT NULL DEFAULT 0);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, description text,
  price numeric NOT NULL, category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url text, is_available boolean NOT NULL DEFAULT true,
  rating numeric NOT NULL DEFAULT 4.5, prep_minutes int NOT NULL DEFAULT 30
);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read menu" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  items jsonb NOT NULL, total_amount numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending', order_status text NOT NULL DEFAULT 'Received',
  delivery_address text NOT NULL, checkout_type text NOT NULL DEFAULT 'Online',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders select" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND order_status = 'Received');

INSERT INTO public.categories (id, name, icon, sort) VALUES
('11111111-0000-0000-0000-000000000001','Rice Dishes','🍚',1),
('11111111-0000-0000-0000-000000000002','Grills & Sides','🍗',2),
('11111111-0000-0000-0000-000000000003','Drinks','🥤',3),
('11111111-0000-0000-0000-000000000004','Specials','⭐',4);

INSERT INTO public.menu_items (title, description, price, category_id, image_url, rating, prep_minutes) VALUES
('Smoky Party Jollof','Firewood-style jollof rice with fried plantain and coleslaw.',4500,'11111111-0000-0000-0000-000000000001','jollof',4.9,30),
('Native Fried Rice','Colourful fried rice with liver, prawns and mixed veg.',4800,'11111111-0000-0000-0000-000000000001','friedrice',4.7,30),
('Ofada Rice & Ayamase','Local ofada rice with spicy green pepper sauce and assorted meat.',5500,'11111111-0000-0000-0000-000000000001','ofada',4.8,35),
('Peppered Grilled Chicken','Quarter chicken marinated overnight and flame grilled.',3500,'11111111-0000-0000-0000-000000000002','chicken',4.8,25),
('Suya Beef Skewers','Spicy suya-spiced beef with onions and yaji.',3000,'11111111-0000-0000-0000-000000000002','suya',4.9,20),
('Fried Plantain (Dodo)','Sweet ripe plantain, golden fried.',1200,'11111111-0000-0000-0000-000000000002','dodo',4.6,10),
('Chilled Zobo','Hibiscus drink with ginger and pineapple.',1000,'11111111-0000-0000-0000-000000000003','zobo',4.7,5),
('Fresh Chapman','Classic Nigerian Chapman cocktail (non-alcoholic).',1500,'11111111-0000-0000-0000-000000000003','chapman',4.6,5),
('Sommies Combo Platter','Jollof, fried rice, chicken, suya, dodo and a drink — for two.',12000,'11111111-0000-0000-0000-000000000004','platter',5.0,40),
('Seafood Okra & Swallow','Rich okra soup loaded with prawns and fish, with eba or semo.',7500,'11111111-0000-0000-0000-000000000004','okra',4.8,40);