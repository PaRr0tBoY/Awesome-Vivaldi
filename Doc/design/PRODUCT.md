# PRODUCT.md

## Register

product

## Users

**Power users**: Familiar with Vivaldi's advanced features, pursuing visual polish and workflow efficiency. They don't write CSS/JS but expect out-of-the-box mods that work seamlessly together.

**Developers**: Vivaldi mod community contributors who need clean code structure, reusable CSS variables, and modular JS architecture for secondary development and forks.

## Product Purpose

Reshape Vivaldi's UI into The Browser Company's design language — as if TBC acquired Vivaldi and shipped it themselves. Preserve Vivaldi's feature depth (sidebar, panels, tab stacks, workspaces) and carry Dia's warm details on Arc's restrained skeleton.

Core tension: Vivaldi is feature-rich, TBC is minimalist. The value isn't removing features — it's using spatial hierarchy, motion rhythm, and visual density to make complex features *feel simple*.

## Brand Personality

Warm, organic, human.

- **Warm**: Not a cold tool interface but a workspace with warmth. Warmer hues, soft rounded corners, breathing spacing.
- **Organic**: Transitions flow naturally, nothing abrupt. Elements relate as if grown, not assembled.
- **Human**: Actions have feedback, states have expression. The user *feels* the interface responding.

Reference frame: Arc Browser's restrained skeleton + Dia Browser's warm details.

## Anti-references

- **Glassmorphism abuse**: `backdrop-filter: blur` everywhere with no purpose. Only use when truly needed for layer separation.
- **Gradient text**: `background-clip: text` rainbow headings. Cheap feel, don't use.
- **Over-animation**: Bounce, elastic, everywhere. Motion should breathe, not juggle.
- **SaaS template feel**: Identical card grids, big number stats, sidebar+topbar. This isn't a dashboard, it's a browser.

## Design Principles

1. **Complex features, simple feel**: Vivaldi's feature depth is a strength, not a burden. Use spatial hierarchy and visual density to make multi-panel/tab-stack/workspace feel lightweight.
2. **Design language consistency**: Each mod isn't an independent hack but a component of a unified design system. CSS-variable-driven, theme-aware.
3. **Native browser feel**: Mods should look like Vivaldi built them, not third-party injection. Animation durations, border radii, and spacing rhythms must harmonize with Vivaldi's base style.
4. **Progressive enhancement**: Basic mods (spacing, declutter) work out of the box; advanced mods (VividPeek, VividPlayer) require user opt-in. No forcing.
5. **Developer-friendly**: CSS variables overridable, JS modules independently usable, code structure self-documenting.

## Accessibility

- `prefers-reduced-motion`: All animations degrade via `prefers-reduced-motion`
- Color contrast: Text contrast ratio >= 4.5:1 in dark themes
- Keyboard accessible: All interactive mods have keyboard alternatives
