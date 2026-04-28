# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm i          # install dependencies
npm run dev    # start dev server at http://localhost:5173
npm run build  # production build
```

> Note: The project uses `pnpm-workspace.yaml` but `pnpm` may not be installed. Use `npm` instead.

## Architecture

This is a **single-page React + Vite + Tailwind CSS** application — a "Thi đua Khen thưởng" (Emulation & Commendation) management system for a Vietnamese provincial government office (VPTU Đồng Nai).

### Navigation model

There is **no React Router**. All navigation is done via a single `active` state string in [src/app/App.tsx](src/app/App.tsx). The `renderMain()` function is a large `switch` on that string, rendering the matching page component. `navigate(label)` sets `active` to the module's Vietnamese label string (e.g. `"Bảng điều hành"`, `"Đề nghị khen thưởng"`).

### Auth & roles

Authentication is simulated — [src/app/components/login-page.tsx](src/app/components/login-page.tsx) exports `LoginUser` (the core user type) and a list of demo accounts. There are 5 roles: `admin`, `leader`, `council`, `manager`, `user`. Access control is enforced by `canAccessModule(role, moduleName)` in [src/app/components/sidebar.tsx](src/app/components/sidebar.tsx), which maps module label strings to allowed roles. Restricted access renders `<AccessDenied>` in `App.tsx`. The `user` role gets different dashboard/tracker views than other roles for the same modules.

### Theme system

[src/app/components/theme-context.tsx](src/app/components/theme-context.tsx) defines `ThemeProvider` and `useTheme`. There are 8 built-in color themes (stored as `THEMES[]`). Active theme is persisted to `localStorage` under key `"vq-theme"`. Themes work by calling `applyTheme()` which sets CSS custom properties on `:root` (e.g. `--color-primary-btn`, `--color-paper`, `--color-sidebar-bg`). The full custom property system is defined in [src/styles/theme.css](src/styles/theme.css).

### Design system

Custom CSS utility classes (`.btn`, `.btn-primary`, `.ds-input`, `.badge`, `.ds-card`, etc.) are defined in [src/styles/theme.css](src/styles/theme.css) — these are the preferred styling primitives alongside Tailwind. Shadcn/ui components live in [src/app/components/ui/](src/app/components/ui/) and are used for complex primitives (dialogs, dropdowns, etc.). The `@` alias maps to `src/`.

### Global overlays

`App.tsx` owns several app-wide overlays rendered unconditionally:
- `CommandPalette` — `Ctrl/Cmd+K`
- `HoSoDetailDrawer` — side drawer for file details
- `PrintPreviewModal` — `Ctrl/Cmd+P`
- `ChangelogModal` — `Ctrl/Cmd+Shift+?`
- `ShortcutsOverlay` — `?`
- `OnboardingPanel` + `OnboardingBadge` — fixed bottom-right

### Page components

All page components live in [src/app/components/](src/app/components/) and follow the naming convention `<slug>-page.tsx`. Each receives at minimum `user: LoginUser` as a prop. Pages are self-contained — all their state, data, and sub-components are local to the file (no shared data store or API layer; all data is hardcoded mock data within each component).

### Fonts

The app uses `Be Vietnam Pro`, loaded in [src/styles/fonts.css](src/styles/fonts.css).
