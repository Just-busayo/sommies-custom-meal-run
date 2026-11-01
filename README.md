# Sommies Custom Meal Run

Build a modern, full-stack food ordering and delivery web application called "Sommies Kitchen" inspired by platforms like Chowdeck.

1. BRANDING & THEME:
- Main Accent Colors: Primary `#d38f7c` (warm terracota/peach), Secondary/Text `#553327` (deep cocoa brown).
- Theme Support: Full light mode and dark mode toggle with smooth visual transitions.
- Aesthetic: Modern, mouth-watering, clean food delivery interface with bold typography and rounded UI cards.

2. NAVIGATION & STRUCTURE:
- Header: Sticky navbar with Sommies Kitchen logo, search bar, active delivery address selector, light/dark mode toggle, cart counter icon, and Auth profile avatar/login button.
- Footer: Quick links, social media icons, operating hours, delivery zones, and a prominent "Order via WhatsApp" button.

3. CORE PAGES & VIEWS:
- Welcome / Landing Page:
  * Hero section describing Sommies Kitchen with engaging hero images, taglines, and a clear "Order Now" CTA.
  * Highlights section: Speed, freshly prepared meals, top-rated dishes, and customer reviews.
- Food Menu & Catalog:
  * Categorized grid (e.g., Rice Dishes, Grills & Sides, Drinks, Specials).
  * Food cards featuring image, title, price, estimated delivery time, ratings, and a quick "Add to Cart" button.
  * Search and filter by category or price.
- Item Details Modal: Customization options (e.g., choice of protein, extra sides, special instructions).
- Interactive Checkout Page:
  * Address entry/selection.
  * Order summary (subtotal, delivery fee, tax, total).
  * Payment options: Online payment integration preview (Card/Transfer) and a direct "Order & Checkout via WhatsApp" button that pre-formats the cart items into a structured WhatsApp message.
- User Dashboard & Order Tracking:
  * Order history, status tracker (e.g., "Received", "Preparing", "Out for Delivery"), and profile settings.

4. USER AUTHENTICATION & DATABASE (Supabase Integration):
- Supabase Auth: Email/Password login and sign-up with protected routes for user profiles and order histories.
- Database Schema Setup:
  * `profiles`: id, full_name, phone_number, delivery_address.
  * `categories`: id, name, icon.
  * `menu_items`: id, title, description, price, category_id, image_url, is_available.
  * `orders`: id, user_id, items (JSONB), total_amount, payment_status, order_status, delivery_address, checkout_type (Online vs. WhatsApp), created_at.

5. KEY USER INTERACTIONS:
- Persistent shopping cart drawer that updates subtotal dynamically.
- "Chat / Order on WhatsApp" flow that triggers `https://wa.me/[number]?text=...` pre-populating the full cart list, delivery address, and total price for easy messaging.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7a2dd4d3-d6d0-49d4-883e-c3998fa6c39a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
