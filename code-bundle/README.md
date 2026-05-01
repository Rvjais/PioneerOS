# PioneerOS — Atrium Visual Refresh

Drop-in code bundle that re-skins your existing PioneerOS app to the **Atrium** design direction (warm linen base, ember accent, Geist type, soft elevation).

## What's inside

```
src/
├── app/
│   └── globals.css               ← REPLACE your existing globals.css
├── shared/
│   └── theme/
│       └── atrium.ts             ← NEW · TS tokens for use in components
└── client/
    └── components/
        └── layout/
            └── DashboardNav.tsx  ← REPLACE your existing DashboardNav
```

## How the refresh works

The strategy is **token-driven**, not component-by-component. The new `globals.css`:

1. Defines a complete CSS-variable token system at `:root` (`--bg`, `--ink`, `--accent`, `--shadow-1`, `--r-lg`, etc).
2. Provides ready-made utility classes — `.atr-card`, `.atr-btn`, `.atr-btn-primary`, `.atr-input`, `.atr-badge`, `.atr-kbd`, `.atr-display`, etc.
3. **Re-skins legacy classes** at the bottom — every old `bg-slate-900`, `bg-blue-600`, `text-white`, dark-overlay, glow-shadow class auto-maps to Atrium equivalents. Your existing screens get the new look with **zero edits**.

## Install

```bash
# 1. From the unzipped bundle, copy files over your repo
cp code-bundle/src/app/globals.css                       src/app/globals.css
cp code-bundle/src/shared/theme/atrium.ts                src/shared/theme/atrium.ts
cp code-bundle/src/client/components/layout/DashboardNav.tsx \
   src/client/components/layout/DashboardNav.tsx

# 2. Add Geist font (Inter is already there)
npm install geist

# 3. In src/app/layout.tsx, swap the font import:
```

```tsx
// src/app/layout.tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

// replace the <body className="..."> with:
<body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
```

```bash
# 4. Run
npm run dev
```

## Using tokens in new components

**CSS approach (preferred):**
```tsx
<div style={{
  background: 'var(--bg-elev)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-lg)',
  boxShadow: 'var(--shadow-1)',
}}>...</div>
```

**Utility class approach:**
```tsx
<button className="atr-btn atr-btn-primary">Plan post</button>
<div className="atr-card p-5">…</div>
<span className="atr-badge atr-badge-accent">Review</span>
<span className="atr-caption">Awaiting review</span>
```

**TS tokens (for charts, framer-motion, conditional logic):**
```tsx
import { colors, departmentColors } from '@/shared/theme/atrium'

<Sparkline color={colors.accent} />
<Tag color={departmentColors.social}>Social</Tag>
```

## Color reference

| Role               | Token           | Hex       |
| ------------------ | --------------- | --------- |
| Page background    | `--bg`          | `#faf8f5` |
| Card / panel       | `--bg-elev`     | `#ffffff` |
| Sunken (input fill)| `--bg-sunken`   | `#f3efe8` |
| Inverse surface    | `--bg-inverse`  | `#2a251f` |
| Primary text       | `--ink`         | `#2a251f` |
| Body text          | `--ink-2`       | `#5c5448` |
| Muted text         | `--ink-3`       | `#8a8175` |
| Disabled text      | `--ink-4`       | `#b3a99a` |
| Default border     | `--line`        | `#ece7df` |
| Strong border      | `--line-strong` | `#d8d0c2` |
| **Accent (Ember)** | `--accent`      | `#c96442` |
| Accent hover       | `--accent-hover`| `#b5563a` |
| Accent soft (tint) | `--accent-soft` | `#fbeee8` |
| Success            | `--success`     | `#5a6b4a` |
| Warning            | `--warning`     | `#c08a2e` |
| Danger             | `--danger`      | `#b54838` |
| Info               | `--info`        | `#4a6b8a` |

## Typography

- **Display & UI**: Geist Sans, weight 400/500/600/700, tracking `-0.025em` on headings
- **Numbers, IDs, code, captions**: Geist Mono
- **Heading rule**: All `h1-h6` get `letter-spacing: -0.025em` and weight 600 by default

## Migration order (recommended)

1. **Day 1** — Apply this bundle. The token rewrite + legacy overrides give you ~70% of the visual refresh on every screen instantly.
2. **Week 1** — Audit the 5-10 most-visited screens (Today dashboard, Clients list, Social planner, SEO, HR). Replace ad-hoc Tailwind chains with `.atr-card` / `.atr-btn` / `.atr-input` / `.atr-badge`. Each takes ~10 min.
3. **Week 2** — Replace the other department nav components (`HRNav`, `SocialNav`, etc) using the new `DashboardNav.tsx` as a template.
4. **Ongoing** — When touching any screen, swap `text-white` → omit (it auto-resolves), swap `bg-blue-600` → omit (auto-resolves to ember), swap dark hex codes → CSS vars.

## What to leave alone

- Auth pages (`(auth)/*`) and onboarding flows already use `.dark-form` — they'll inherit the new tokens automatically through that wrapper.
- Public marketing pages — these often have their own gradient styling. Test, don't bulk-replace.

## Caveats

- The legacy override block uses `!important` to win over inline styles in old code. New code should not need it — use tokens cleanly.
- If a chart library (Recharts, etc) takes hex strings, import from `@/shared/theme/atrium`, don't hardcode.
- Some screens have hand-painted gradients (especially onboarding hero sections). Those will look different — review and re-tone individually.

## Questions / tweaks

If the ember accent reads too warm against a particular module, or if you want to swap to a cooler complementary accent for one section, edit `--accent` per-route via a wrapper:

```tsx
// app/(dashboard)/seo/layout.tsx
<div style={{ '--accent': '#5a6b4a', '--accent-soft': '#eef2e8' } as any}>
  {children}
</div>
```
