---
description: Cách điều hướng giữa các trang — không dùng React Router
globs: src/app/App.tsx, src/app/components/sidebar.tsx
alwaysApply: false
---

There is **no React Router**. All navigation is done via a single `active` state string in `src/app/App.tsx`. The `renderMain()` function is a large `switch` on that string, rendering the matching page component.

- `navigate(label)` sets `active` to the module's Vietnamese label string (e.g. `"Bảng điều hành"`, `"Đề nghị khen thưởng"`)
- To add a new page: add a `case` in `renderMain()`, add a `NavItem` entry in `NAV_CONFIG` in `sidebar.tsx`, and create the page component in `src/app/components/`
