import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { StoreProvider, useStore } from "@/lib/store";
import { useStore as useStableStore } from "@/lib/store-context";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {
  getUser: async () => ({ data: { user: null } }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
} } }));
afterEach(cleanup);

function Consumer() {
  const store = useStore();
  const stable = useStableStore();
  return <button onClick={() => store.setAddress("FUTO test address")}>{stable.address}</button>;
}

it("shares the same context between provider and both consumer imports", () => {
  render(<StoreProvider><Consumer /></StoreProvider>);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button").textContent).toBe("FUTO test address");
});