---
description: Các overlay toàn cục được quản lý bởi App.tsx
globs: src/app/App.tsx
alwaysApply: false
---

`App.tsx` owns several app-wide overlays rendered unconditionally at the root level:

| Component | Trigger |
|---|---|
| `CommandPalette` | `Ctrl/Cmd+K` |
| `HoSoDetailDrawer` | Programmatic via `drawerHoSoId` state |
| `PrintPreviewModal` | `Ctrl/Cmd+P` |
| `ChangelogModal` | `Ctrl/Cmd+Shift+?` |
| `ShortcutsOverlay` | `?` |
| `OnboardingPanel` + `OnboardingBadge` | Fixed bottom-right corner |

All overlay open/close state is managed in `App.tsx`. To open an overlay from a page component, pass a callback prop down (e.g. `onNavigate`, `onOpenCmd`) — do not lift overlay state into page components.
