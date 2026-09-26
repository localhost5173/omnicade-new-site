# omnicade-site

The Omnicade marketing site — SvelteKit 5 (Svelte 5 runes +
TypeScript), fully prerendered to static files by
`@sveltejs/adapter-static`.

The design language is the cabinet's own: the palette is
`omnicade-steam-engine/data/theme.json` verbatim (bg `#07070c`, accent
`#ffcc00`, …) and the three vendored cabinet fonts (Archivo Black /
Chakra Petch / Press Start 2P). The site IS the cabinet UI.

## Dev / build

```sh
nix run .#                        # build + serve the static site on :8123
nix run .#dev                     # vite dev server (needs node_modules, see below)
nix build .#                      # static site → result/share/omnicade-site
```

Working-tree dev loop (no node on the host — node/pnpm come from the
flake devshell, same pattern as `~/omnicade-admin-dashboard`):

```sh
nix develop -c pnpm install      # once
nix develop -c pnpm run dev      # dev server
nix develop -c pnpm run check    # svelte-check (strict TS) — 0 errors expected
nix develop -c pnpm run build    # static site → build/
```

## The flake

- `packages.default` — the site as a derivation: `fetchPnpmDeps`
  (fetcherVersion 4) + `pnpmConfigHook` install, then `pnpm run
  build`. Bump any dependency → the FOD hash fails → paste the `got:`
  hash from the error.
- `apps.default` — serves the built site on `http://localhost:8123`.
- `apps.dev` — `pnpm run dev` against the working tree (refuses when
  `node_modules` is missing).
- `devShells.default` — nodejs + pnpm.

## Where things live

- `src/lib/data.ts` — ALL site content (copy, tiers, machines, tech
  rows) and its types. The pricing tiers/topups are the shipped
  `data/pricing.json`; the session flow is the engine README's
  session flow; the operator/tech claims come from omnicade-os and
  omnicade-api. Edit copy here, not in components.
- `src/lib/components/` — one component per section, `<script
  lang="ts">`. `SessionDemo` is the interactive cabinet-flow widget
  (attract → tiers → pay → countdown → running → extend → over)
  driven by Svelte 5 runes; its phases are typed via a `const` PHASE
  map.
- `src/app.css` — the design system (theme tokens, scanlines, cards,
  buttons, type).

## Verified

- `pnpm run check` (svelte-check, strict): 0 errors, 0 warnings.
- `pnpm run build` prerenders cleanly to `build/` (single page).
- Hydration + the session demo e2e-tested headlessly over CDP
  (attract → tier → 20:00 clock → extend card at zero → +5 min
  resume → low-time warn → expire → walk away → TIME SAVED).
- `nix build .#` and both `nix run` apps tested on the cabinet.
- NOTE: opening `build/index.html` over `file://` renders CSS-only —
  ES modules are CORS-blocked on file://. Serve it over HTTP.
