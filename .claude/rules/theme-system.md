---
description: Hệ thống theme màu sắc — ThemeProvider, CSS custom properties
globs: src/app/components/theme-context.tsx, src/styles/theme.css, src/app/components/theme-switcher.tsx
alwaysApply: false
---

`src/app/components/theme-context.tsx` defines `ThemeProvider` and `useTheme`. There are 8 built-in color themes stored as `THEMES[]`.

- Active theme is persisted to `localStorage` under key `"vq-theme"`
- Themes apply by calling `applyTheme()`, which sets CSS custom properties on `:root`
- Key custom properties: `--color-primary-btn`, `--color-paper`, `--color-sidebar-bg`, `--color-gold`, `--color-primary-tint`

**Never hardcode brand colors inline.** Always use CSS variables (e.g. `var(--color-primary-btn)`) or Tailwind classes that map to them, so that all 8 themes work correctly.
