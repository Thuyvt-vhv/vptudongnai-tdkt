---
description: Quy ước viết page components và cách quản lý dữ liệu
globs: src/app/components/**-page.tsx
alwaysApply: false
---

All page components live in `src/app/components/` and follow the naming convention `<slug>-page.tsx`.

**Pattern:**
- Each page receives at minimum `user: LoginUser` as a prop
- Pages are fully self-contained — state, mock data, and sub-components are all local to the file
- There is no shared data store, context, or API layer; all data is hardcoded mock data within each component

When creating a new page:
1. Create `src/app/components/<slug>-page.tsx` exporting a named component
2. Add a `case "<Module Label>":` in `renderMain()` in `src/app/App.tsx`
3. Add the nav item in `NAV_CONFIG` in `src/app/components/sidebar.tsx` with appropriate `roles`
