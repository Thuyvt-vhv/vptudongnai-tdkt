---
description: Hệ thống xác thực và phân quyền theo vai trò
globs: src/app/components/login-page.tsx, src/app/components/sidebar.tsx, src/app/App.tsx
alwaysApply: false
---

Authentication is simulated — `src/app/components/login-page.tsx` exports `LoginUser` (the core user type) and a list of demo accounts. There is no real backend auth.

**5 roles:** `"quản trị hệ thống"` | `"lãnh đạo cấp cao"` | `"hội đồng"` | `"lãnh đạo đơn vị"` | `"cá nhân"`

Access control is enforced by `canAccessModule(role, moduleName)` in `sidebar.tsx`, which maps module label strings to allowed roles. Restricted access renders `<AccessDenied>` in `App.tsx`.

The `user` role gets different dashboard/tracker views than other roles for the same modules (`UserDashboard`, `UserHoSoTracker` instead of the default `Dashboard` / `DeNghiKhenThuongPage`).

Always pass `user: LoginUser` as a prop to page components and respect the role when rendering content.
