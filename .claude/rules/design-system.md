---
description: Design system — CSS utility classes, Shadcn/ui components, font và alias
globs: src/styles/theme.css, src/app/components/ui/**, src/app/components/ds-*.tsx
alwaysApply: false
---

## CSS utility classes (preferred primitives)

Defined in `src/styles/theme.css` under `@layer components`:

| Class | Usage |
|---|---|
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-dark` | Buttons |
| `.btn-sm`, `.btn-md`, `.btn-lg` | Button sizes |
| `.ds-input`, `.ds-input-sm/md/lg` | Input fields |
| `.badge`, `.badge-neutral/primary/success/warning/error/gold/info` | Status badges |
| `.ds-card`, `.ds-card-default/elevated/flat` | Cards |
| `.ds-card-p-sm/md/lg`, `.ds-card-header`, `.ds-card-body`, `.ds-card-footer` | Card sections |

Use these classes before reaching for raw Tailwind or inline styles.

## Shadcn/ui components

Located in `src/app/components/ui/`. Use for complex interactive primitives: Dialog, DropdownMenu, Select, Popover, Sheet, Tabs, etc.

## Path alias

`@` maps to `src/` — use `@/app/components/...` for imports.

## Fonts

The primary UI font is `Be Vietnam Pro` (all body/UI text). Loaded via `src/styles/fonts.css`.
