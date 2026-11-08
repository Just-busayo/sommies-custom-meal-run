<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Cart, theme and delivery address live in the client StoreProvider (src/lib/store.tsx, localStorage); menu/order data is read via the browser client under RLS — no server functions needed yet.
- Menu portion options and price-on-request flags come from menu_items; quoted cart lines include the chosen portion and included proteins, and unquoted dishes cannot enter paid checkout.
- Version cart storage when replacing the catalog so obsolete sample prices cannot survive in checkout.
- Keep store context identity in a separate non-component module and retain it through hot updates so mounted providers and consumers cannot disconnect during preview edits.
