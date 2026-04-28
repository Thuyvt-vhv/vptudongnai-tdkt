---
description: Luồng nghiệp vụ Phong trào Thi đua Khen thưởng — FSM 12 trạng thái, phân quyền chuyển bước, căn cứ pháp lý
globs: src/app/components/phong-trao-page.tsx
alwaysApply: false
---

# Luồng nghiệp vụ Phong trào Thi đua Khen thưởng

File chính: `src/app/components/phong-trao-page.tsx`

---

## 1. Finite State Machine — 12 trạng thái

```
draft → submitted → approved → published
      → active → submission_closed
      → unit_review → council_review → final_approval
      → decision_issued → public → archived
```

`nextState()` luôn tịnh tiến tuyến tính theo `STATE_ORDER[]`. Không có nhánh rẽ hay rollback ngoại trừ nút "Trả về chỉnh sửa" ở trạng thái `submitted` (chuyển thẳng về `draft`).

---

## 2. Bốn giai đoạn (PHASES)

| Phase | Các trạng thái | Màu |
|-------|---------------|-----|
| 0 — Phát động | `draft`, `submitted`, `approved`, `published` | `#1C5FBE` |
| 1 — Triển khai | `active`, `submission_closed` | `#166534` |
| 2 — Xét duyệt | `unit_review`, `council_review`, `final_approval` | `#7c3aed` |
| 3 — Ban hành & Lưu trữ | `decision_issued`, `public`, `archived` | `#b45309` |

---

## 3. Chi tiết từng trạng thái

### Phase 0 — Phát động

#### `draft` — Soạn thảo
- **Người thực hiện:** Người tạo phong trào
- **Nghiệp vụ:** Điền đầy đủ checklist 8 mục (tên, mục tiêu, đối tượng, tiêu chí ≥3, ngày bắt đầu/kết thúc, hạn nộp, hình thức khen thưởng, căn cứ pháp lý ≥2)
- **Điều kiện chuyển bước:** `ready = true` (tất cả 8 mục hoàn thành)
- **Căn cứ:** Nội bộ

#### `submitted` — Trình phê duyệt
- **Người thực hiện:** Hội đồng TĐKT
- **Nghiệp vụ:** Thẩm tra tính hợp lệ; có thể Phê duyệt (→ `approved`) hoặc Trả về chỉnh sửa (→ `draft`)
- **Căn cứ:** NĐ 152/2025/NĐ-CP ngày 14/6/2025 (thay thế NĐ 98/2023/NĐ-CP)

#### `approved` — Đã phê duyệt
- **Người thực hiện:** Lãnh đạo cấp cao, Quản trị hệ thống *(leaderOnly — người tạo không được)*
- **Nghiệp vụ:** Chuẩn bị ban hành; cấu hình kênh thông báo (4 kênh có thể bật/tắt)
- **Căn cứ:** Điều 18 Luật TĐKT

#### `published` — Ban hành / Công bố
- **Người thực hiện:** Người tạo, Lãnh đạo cấp cao, Quản trị hệ thống
- **Nghiệp vụ:** Ký ban hành, gửi thông báo tới tất cả đơn vị
- **Căn cứ:** TT 01/2024

---

### Phase 1 — Triển khai

#### `active` — Đang triển khai
- **Người thực hiện — 3 luồng song song:**
  1. **Manager** (`canTransition = true`): xem dashboard tổng (đơn vị đã/chưa đăng ký), nhắc nhở hàng loạt, đóng nhận hồ sơ sớm
  2. **Lãnh đạo đơn vị** (`role === "lãnh đạo đơn vị"`): điền form đăng ký đơn vị, nhấn "Xác nhận đăng ký" → màn hình xác nhận thành công
  3. **Cá nhân** (`role === "cá nhân"`): điền form đăng ký cá nhân (họ tên, danh hiệu, thành tích), nhấn "Gửi đăng ký" → màn hình xác nhận thành công
- **Điều kiện chuyển bước:** Hết hạn tự động hoặc manager đóng sớm
- **Căn cứ:** Luật TĐKT 2022

#### `submission_closed` — Hết hạn nộp hồ sơ
- **Người thực hiện:** Người tạo, Lãnh đạo cấp cao, Quản trị hệ thống
- **Nghiệp vụ:** Tổng kết giai đoạn đăng ký (4 checklist); xuất danh sách hồ sơ
- **Căn cứ:** Theo kế hoạch

---

### Phase 2 — Xét duyệt

#### `unit_review` — Thẩm định cấp cơ sở
- **Người thực hiện — 2 nhóm:**
  1. **canReviewUnit** (`canTransition || role === "lãnh đạo đơn vị"`): thấy nút ThumbsUp/ThumbsDown cho từng hồ sơ `da_nop`, toggle quyết định Duyệt/Trả lại với visual feedback (nền xanh/đỏ, badge cập nhật real-time)
  2. **canMove** (chỉ người có quyền chuyển bước): thấy nút "Chuyển Hội đồng xét duyệt" — bị disabled cho đến khi `allReviewed = true` (không còn hồ sơ pending)
- **Logic `effectiveStatus(p)`:** local `unitDecisions[p.id]` ghi đè `p.hoSoStatus` trong UI; badge + màu nền row + InfoCards đều phản chiếu quyết định thực tế
- **Căn cứ:** Khoản 2 Điều 55 Luật TĐKT

#### `council_review` — Hội đồng xét duyệt
- **Người thực hiện:** Hội đồng TĐKT, Lãnh đạo cấp cao, Quản trị hệ thống
- **Nghiệp vụ:** Bỏ phiếu kín cho từng candidate (`da_duyet`) — toggle Tán thành / Không tán thành
- **Ngưỡng thông qua:** `passThreshold = Math.ceil(totalVoters * 2/3)` = `Math.ceil(7 * 2/3)` = **5 phiếu** *(totalVoters cố định = 7 thành viên HĐ)*
- **`allVoted`:** `candidates.length > 0 && Object.keys(votes).length === candidates.length` — phải bỏ phiếu HẾT trước khi chuyển bước
- **Điều kiện chuyển bước:** `disabled={!allVoted}`
- **Căn cứ:** Điều 56, 57 Luật TĐKT

#### `final_approval` — Trình lãnh đạo duyệt
- **Người thực hiện:** Lãnh đạo cấp cao, Quản trị hệ thống *(leaderOnly — người tạo không được)*
- **Nghiệp vụ:** Xem danh sách đề nghị khen thưởng đã qua HĐ; nhập ý kiến lãnh đạo; ký duyệt ban hành Quyết định
- **Căn cứ:** Điều 57 Luật TĐKT 2022

---

### Phase 3 — Ban hành & Lưu trữ

#### `decision_issued` — Đã ban hành QĐ
- **Người thực hiện:** Người tạo, Lãnh đạo cấp cao, Quản trị hệ thống
- **Nghiệp vụ:** Hiển thị Quyết định khen thưởng (có ký số CA); danh sách được khen thưởng; tải/in QĐ
- **Căn cứ:** NĐ 130/2018/NĐ-CP và Luật TĐKT 2022

#### `public` — Công bố kết quả
- **Người thực hiện:** Người tạo, Lãnh đạo cấp cao, Quản trị hệ thống
- **Nghiệp vụ:** Công bố kết quả chính thức, hiển thị bảng xếp hạng cuối cùng
- **Căn cứ:** Điều 5 NĐ 98/2023

#### `archived` — Lưu trữ
- **Trạng thái cuối — không thể chuyển bước tiếp**
- **Nghiệp vụ:** Toàn bộ tài liệu lưu trữ 20 năm
- **Căn cứ:** NĐ 30/2020/NĐ-CP

---

## 4. Ma trận phân quyền chuyển bước (`canTransition`)

| Role | Trạng thái được chuyển |
|------|------------------------|
| `"lãnh đạo cấp cao"` | Tất cả (trừ `archived`) |
| `"quản trị hệ thống"` | Tất cả (trừ `archived`) |
| `"hội đồng"` | `submitted`, `unit_review`, `council_review` |
| Người tạo (`user.id === c.creatorId`) | Tất cả **trừ** `leaderOnly = ["approved", "final_approval", "decision_issued"]` |
| `"lãnh đạo đơn vị"` | Không chuyển bước; chỉ thẩm định hồ sơ trong `unit_review` (`canReviewUnit`) |
| `"cá nhân"` | Không chuyển bước; chỉ đăng ký tham gia trong `active` |

> `isViewOnly(user, c)` = `!canTransition && (role === "lãnh đạo đơn vị" || role === "cá nhân")` → hiển thị banner "Chỉ xem"

---

## 5. Quy tắc navigation sau khi chuyển bước

- **KHÔNG thoát về danh sách** sau khi transition. `onBack()` chỉ được gọi khi user bấm "← Danh sách".
- `PhongTraoPage` truyền `onTransition={(id, ns) => handleTransition(id, ns)}` — không gọi `setDetail(null)`.
- `detail` vẫn giữ nguyên id; `live = campaigns.find(x => x.id === detail.id)` tự đọc state mới sau khi `campaigns` được cập nhật.
- `StepWorkspacePanel` được mount thường trực bằng `display:none` thay vì unmount khi chuyển tab — giữ nguyên `votes`, `unitDecisions`, `regForm` state.

---

## 6. Audit log

Mỗi lần `handleTransition` được gọi, một `AuditEntry` được push vào `c.auditLog`:
```ts
{ id, action: nextStateLabel(c), actor: user.name, role: ..., time: now, detail: "Chuyển trạng thái → ...", state: newState }
```
Hiển thị trong tab "Lịch sử hoạt động" của `CampaignDetailView`.

---

## 7. Scoring / Tiêu chí chấm điểm

- `DEFAULT_CRITERIA`: 5 tiêu chí, tổng 100 điểm (40 + 20 + 20 + 10 + 10)
- `Participant.score`: điểm tổng của từng cá nhân/tập thể
- `UnitScore`: điểm chấm của từng đơn vị theo từng tiêu chí, có rank
- Hiển thị trong tab "Bảng xếp hạng" (`ScoringTab`)
