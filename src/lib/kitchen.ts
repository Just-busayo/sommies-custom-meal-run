export const DELIVERY_ZONE = "FUTO and its environs";
export const PHONE_CONTACTS = ["07086883952", "07072465126"] as const;
export const WHATSAPP_NUMBER: string | null = null;

export type Portion = { size: string; includes: string; price: number };
export const RICE_PORTIONS: Portion[] = [
  { size: "1 liter", includes: "3 spiced beef", price: 9500 },
  { size: "1.5 liters", includes: "Big sized chicken", price: 15000 },
  { size: "1.5 liters", includes: "Without chicken", price: 10000 },
  { size: "2 liters", includes: "4–5 pcs spiced chicken", price: 17000 },
  { size: "2 liters", includes: "Turkey", price: 21000 },
  { size: "2.4 liters", includes: "Big sized chicken and turkey", price: 25500 },
  { size: "3 liters", includes: "Beef & 6 pcs chicken", price: 30000 },
  { size: "4 liters", includes: "5 big pieces of turkey", price: 36000 },
];
export const STEW_PORTIONS: Portion[] = [
  { size: "1 liter", includes: "Beef, chicken, turkey", price: 15000 },
  { size: "1.5 liters", includes: "Beef, chicken, turkey", price: 20000 },
  { size: "2 liters", includes: "Beef, chicken, turkey", price: 28000 },
  { size: "2.4 liters", includes: "Beef, chicken, turkey", price: 35000 },
  { size: "3 liters", includes: "Beef, chicken, turkey", price: 45000 },
  { size: "4 liters", includes: "Beef, chicken, turkey", price: 50500 },
];
export const SOUP_PORTIONS: Portion[] = [
  { size: "1 liter", includes: "Assorted protein: beef, ponmo, fish, etc", price: 18000 },
  { size: "1.5 liters", includes: "Assorted protein: beef, ponmo, fish, etc", price: 22000 },
  { size: "2 liters", includes: "Assorted protein: beef, ponmo, fish, etc", price: 30000 },
  { size: "2.4 liters", includes: "Assorted protein: beef, ponmo, fish, etc", price: 36000 },
  { size: "3 liters", includes: "Assorted protein: beef, ponmo, fish, etc", price: 40000 },
  { size: "4 liters", includes: "Assorted protein: beef, ponmo, fish, etc", price: 50000 },
];
export const CONFIRMED_MENU = [
  { title: "Jollof rice", category: "Rice", image: "jollof", portions: RICE_PORTIONS },
  { title: "Fried rice", category: "Rice", image: "friedrice", portions: RICE_PORTIONS },
  { title: "Coconut rice", category: "Rice", image: "friedrice", portions: [] },
  { title: "Asun rice", category: "Rice", image: "jollof", portions: [] },
  ...["Egusi soup", "Banga soup", "Ogbono soup", "Vegetable soup", "Pepper soup", "Oha soup"].map(title => ({ title, category: "Soup", image: "soup", portions: SOUP_PORTIONS })),
  ...["Giz dodo", "Abacha", "Assorted meat stew", "Peppered ponmo", "Moi moi", "Fish sauce"].map(title => ({ title, category: "Other orders", image: "stew", portions: title === "Assorted meat stew" ? STEW_PORTIONS : [] })),
];