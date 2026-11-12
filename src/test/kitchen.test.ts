import { describe, it, expect } from "vitest";
import { CONFIRMED_MENU, RICE_PORTIONS, SOUP_PORTIONS, STEW_PORTIONS, DELIVERY_ZONE, PHONE_CONTACTS, WHATSAPP_NUMBER } from "@/lib/kitchen";

describe("Confirmed kitchen price list", () => {
  it.each([
    ["1 liter", "3 spiced beef", 9500],
    ["1.5 liters", "Big sized chicken", 15000],
    ["1.5 liters", "Without chicken", 10000],
    ["2 liters", "4–5 pcs spiced chicken", 17000],
    ["2 liters", "Turkey", 21000],
    ["2.4 liters", "Big sized chicken and turkey", 25500],
    ["3 liters", "Beef & 6 pcs chicken", 30000],
    ["4 liters", "5 big pieces of turkey", 36000],
  ])("rice %s with %s costs %s", (size, includes, price) => {
    expect(RICE_PORTIONS.find(p => p.size === size && p.includes === includes)?.price).toBe(price);
  });
  it.each([["1 liter",15000],["1.5 liters",20000],["2 liters",28000],["2.4 liters",35000],["3 liters",45000],["4 liters",50500]])("stew %s costs %s", (size, price) => {
    expect(STEW_PORTIONS.find(p => p.size === size)?.price).toBe(price);
  });
  it.each([["1 liter",18000],["1.5 liters",22000],["2 liters",30000],["2.4 liters",36000],["3 liters",40000],["4 liters",50000]])("soup %s costs %s", (size, price) => {
    expect(SOUP_PORTIONS.find(p => p.size === size)?.price).toBe(price);
  });
  it.each(["Coconut rice", "Asun rice", "Giz dodo", "Abacha", "Peppered ponmo", "Moi moi", "Fish sauce"])("%s has no invented price", title => {
    expect(CONFIRMED_MENU.find(i => i.title === title)?.portions).toEqual([]);
  });
  it("uses FUTO delivery", () => { expect(DELIVERY_ZONE).toBe("FUTO and its environs"); });
  it("keeps confirmed numbers as phone contacts", () => { expect(PHONE_CONTACTS).toEqual(["07086883952", "07072465126"]); });
  it("does not assign a WhatsApp number", () => { expect(WHATSAPP_NUMBER).toBeNull(); });
});