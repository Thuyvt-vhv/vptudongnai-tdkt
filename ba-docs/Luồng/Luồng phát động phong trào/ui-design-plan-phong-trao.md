# Kế hoạch Thiết kế Giao diện — Phong trào Thi đua

**Hệ thống:** VPTU Đồng Nai — Thi đua Khen thưởng  
**Phiên bản:** 1.0  
**Ngày:** 2026-04-29  
**Người viết:** UI/UX Design Analyst  
**Căn cứ:** User Story v1.0 · phong-trao-page.tsx (5496 dòng) · phong-trao-workflow.md

---

## I. Đánh giá hiện trạng (As-Is Assessment)

### 1.1 Những gì đã hoàn thiện tốt

| Component | Dòng code | Đánh giá |
|---|---|---|
| `FullStateTimeline` — 4 phases, 13 states stepper | 757–860 | ✅ Tốt — phase labels + state nodes, active highlight |
| `CampaignStatsBar` — KPI bar (đơn vị, hồ sơ, tỷ lệ, thời gian) | 476–552 | ✅ Tốt — progress bars, countdown, canCu |
| `ReadinessPanel` — kiểm tra tiền điều kiện trước chuyển bước | 448–474 | ✅ Tốt — 3 cấp: error/warning/info |
| `HoSoDrawer` — checklist thành phần hồ sơ TT 15/2025 | 1182–1337 | ✅ Tốt — group by nhóm, progress bar, mandatory validation |
| `UnitSubmissionTracker` — theo dõi nộp hồ sơ theo đơn vị | 554–752 | ✅ Tốt — search, filter, pagination, nhắc nhở |
| `LegalWarningBanner` — phát hiện văn bản hết hạn | 865–893 | ✅ Tốt — tích hợp legal-registry |
| `OverviewTab` — tổng quan phong trào | 898–1177 | ✅ Tốt — 3-column grid, criteria expandable |
| `ParticipantsTab` — danh sách hồ sơ, filter, table | 1342–1499 | ✅ Tốt — filter pills, rank medals, score bars |
| `ScoringTab` — bảng xếp hạng leaderboard | 1504–1660 | ✅ Tốt — criteria stacked bars, expandable detail |
| `StepWorkspacePanel` cho `council_review` — bỏ phiếu kín | 3137–3431 | ✅ Tốt — quorum check, toggle tán thành/không |
| `StepWorkspacePanel` cho `final_approval` — CA Token | 3432–3607 | ✅ Tốt — DEMO badge, mock stamp |

### 1.2 Những gì còn thiếu hoặc yếu

| # | Vấn đề | Vị trí | Mức độ |
|---|---|---|---|
| **UI-01** | Draft state không hiển thị "lý do trả về" nổi bật khi campaign bị reject từ `submitted` | Line 2084–2172 | 🔴 High |
| **UI-02** | `nextStateLabel` thiếu mapping cho `public_consultation` → nút chuyển bước hiển thị rỗng | Line 319–327 | 🔴 High |
| **UI-03** | Nút chuyển bước ở top bar (line 4517–4552) không chạy `ReadinessCheck` trước — chỉ có confirm dialog đơn giản | Line 4529–4545 | 🔴 High |
| **UI-04** | Tab `history` và `kinh_phi` hiển thị cho mọi role — LĐDV và CN không nên thấy | Line 4455–4461 | 🔴 High |
| **UI-05** | Màn hình `submitted` (line 2173+) không preview đầy đủ kế hoạch — HĐ thiếu context | Line 2173–2264 | 🟡 Medium |
| **UI-06** | Nút "Ban hành" ở state `approved` bị disable nhưng không có tooltip/banner giải thích | Line 2265–2420 | 🟡 Medium |
| **UI-07** | Campaign list cards thiếu thông tin hành động cụ thể — người dùng không biết cần làm gì tiếp | Line 5380+ | 🟡 Medium |
| **UI-08** | `public_consultation` state: form gửi ý kiến của CN/LĐDV không có preview trước khi submit | Line 2967–3136 | 🟡 Medium |
| **UI-09** | `decision_issued` state: thiếu section "Tải QĐ" dành riêng cho CN (người được khen thưởng) | Line 3608–3788 | 🟡 Medium |
| **UI-10** | Không có màn hình "Tạo phong trào mới" riêng biệt — modal `showCreate` nhưng chưa confirm toàn bộ form | Line 5307 | 🟡 Medium |
| **UI-11** | Màn hình `active` cho CN: form đăng ký cá nhân không có bước xác nhận trước submit | Line 2481+ | 🟡 Medium |
| **UI-12** | Audit log timestamps trong mock data vẫn hardcode (VD: "05/12/2025") thay vì dynamic | Line 183–220 | 🟡 Medium |
| **UI-13** | Không có trạng thái empty state đẹp khi phong trào mới tạo ở `draft` (không có gợi ý bước tiếp theo) | Line 2084+ | 🟢 Low |
| **UI-14** | Sidebar collapse (line 4476) không có visual indicator rõ ràng khi ở trạng thái thu | Line 4476–4481 | 🟢 Low |

---

## II. Kiến trúc Màn hình

```
PhongTraoPage
├── [LIST VIEW]  CampaignListView
│   ├── Header: title + "Phát động phong trào" button
│   ├── Filter bar: search + phase tabs + dropdowns
│   ├── Stats summary row (tổng phong trào theo phase)
│   └── Campaign cards (grid hoặc list)
│
├── [CREATE]  CreateCampaignModal / DrawerForm
│   ├── Step 1: Thông tin cơ bản (tên, loại, đối tượng, thời gian)
│   ├── Step 2: Tiêu chí chấm điểm (criteria builder)
│   ├── Step 3: Hình thức khen thưởng + căn cứ pháp lý
│   └── Checklist readiness (8 mục)
│
└── [DETAIL VIEW]  CampaignDetailView
    ├── Sticky Top Bar (back + state badge + name + KPIs + action button)
    ├── FullStateTimeline (phase stepper)
    ├── CampaignStatsBar (KPI bar)
    │
    ├── [MAIN PANEL — 2/3]
    │   ├── Tabs: Tổng quan | Hồ sơ | Xếp hạng | Kinh phí* | Lịch sử*
    │   │   (* ẩn với LĐDV và CN)
    │   └── Tab content
    │
    └── [RIGHT SIDEBAR — 1/3]  StepWorkspacePanel
        ├── View-only banner (LĐDV/CN ở state không phù hợp)
        ├── Rejection reason banner (draft state, sau khi bị trả về)
        ├── State-specific workspace
        └── ReadinessCheck + action button
```

---

## III. Kế hoạch hoàn thiện từng màn hình

---

### Màn hình 1: Danh sách phong trào (CampaignListView)

**Trạng thái hiện tại:** Đã có search, filter phase, dropdown đơn vị/loại/năm, campaign cards  
**Cần hoàn thiện:**

#### M1-A: Campaign Card — thêm "Action Call" rõ ràng theo role

```
┌─────────────────────────────────────────────────────┐
│  [URGENT]  PT-2026-001  · 🔵 Đang triển khai       │
│  Thi đua Chào mừng 50 năm Giải phóng miền Nam       │
│                                                      │
│  ████████░░  117/121 đơn vị  │  6 hồ sơ  │  7 ngày │
│                                                      │
│  📌 Việc cần làm của bạn:                           │
│  [LĐDV] Đơn vị bạn chưa đăng ký tham gia  →  Đăng ký│
│  [CN]   Hạn nộp hồ sơ còn 7 ngày           →  Nộp hồ sơ│
│  [HĐ]   2 hồ sơ chờ thẩm định             →  Xem ngay│
└─────────────────────────────────────────────────────┘
```

**Spec:**
- Thêm section `"Việc cần làm"` (Action Call) ở cuối mỗi card — computed từ role + state + participant status
- Nếu `user.role === "cá nhân"`: kiểm tra xem user đã đăng ký chưa → badge "Chưa đăng ký" + nút
- Nếu `user.role === "lãnh đạo đơn vị"`: đếm số hồ sơ chờ duyệt trong đơn vị của mình
- Nếu `user.role === "hội đồng"`: đếm số hồ sơ chờ HĐ thẩm định

#### M1-B: Summary stats row trên list

```
  Đang triển khai   Xét duyệt    Tổng kết    Lưu trữ
       [2]              [1]          [1]         [1]
```

Hiển thị tổng số phong trào theo phase — clickable để filter nhanh.

#### M1-C: Empty state khi filter không có kết quả

Thay vì list trống, hiện illustration + text gợi ý rõ ràng.

---

### Màn hình 2: Tạo phong trào mới (CreateCampaignModal)

**Trạng thái hiện tại:** Có `showCreate` state ở line 5307, nhưng CreateCampaignModal được implement ở cuối file — cần xem xét flow  
**Cần hoàn thiện:**

#### M2-A: Stepper 3 bước (thay vì scroll dài)

```
  [1] Thông tin cơ bản  →  [2] Tiêu chí & Khen thưởng  →  [3] Xem lại & Tạo
```

- **Bước 1:** Tên, mã code (auto), loại phong trào, cấp độ, đối tượng, thời gian (4 fields: bắt đầu, kết thúc, hạn nộp, lãnh đạo phụ trách), ghi chú
- **Bước 2:** Criteria builder (thêm/xóa tiêu chí, điểm tối đa, hiển thị tổng điểm realtime), Awards picker từ REWARD_CATALOG, căn cứ pháp lý (suggestions từ legal-registry)
- **Bước 3:** Preview đầy đủ + Checklist 8 mục readiness → nút "Tạo bản thảo"

#### M2-B: Readiness checklist realtime

```
  ✅ 1. Tên phong trào
  ✅ 2. Mục tiêu
  ⭕ 3. Đối tượng tham gia
  ✅ 4. Tiêu chí (3 / 3 tối thiểu)
  ✅ 5. Ngày bắt đầu / kết thúc
  ⭕ 6. Hạn nộp hồ sơ
  ✅ 7. Hình thức khen thưởng (2 hình thức)
  ⭕ 8. Căn cứ pháp lý (1 / 2 tối thiểu)

  [2 mục chưa hoàn thành]  ← nút "Trình phê duyệt" disabled
```

#### M2-C: Total score validator

Hiển thị tổng điểm tiêu chí realtime với màu: xanh (= 100), vàng (< 100 hoặc > 100)

```
  Tổng điểm: 90/100  ⚠️ Tổng điểm nên bằng 100
```

---

### Màn hình 3: Xem chi tiết — Sticky Top Bar

**Trạng thái hiện tại:** Có tên, state badge, KPIs, action button  
**Cần hoàn thiện:**

#### M3-A: Tích hợp ReadinessCheck vào action button (FIX UI-03)

Hiện tại (line 4529–4545): chỉ confirm dialog đơn giản. Cần:

```
Khi click "Trình phê duyệt":
1. Chạy checkTransitionReadiness(c, currentOpts)
2. Nếu có warnings → mở Popover hiển thị ReadinessPanel
3. Nếu canProceed = false → button disabled với tooltip
4. Nếu canProceed = true → hiện confirm "Xác nhận?"
```

**Visual spec:**
```
  [Trình phê duyệt ▼]
  ┌────────────────────────────────┐
  │ ℹ️ Hồ sơ soạn thảo đầy đủ     │
  │    sẵn sàng trình HĐ TĐKT     │
  │                                │
  │    [Hủy]    [✓ Xác nhận gửi]  │
  └────────────────────────────────┘
```

#### M3-B: FIX nextStateLabel thiếu `public_consultation` (FIX UI-02)

Thêm vào map:
```ts
public_consultation: "Chuyển Hội đồng xét duyệt",
unit_review: "Mở lấy ý kiến công khai",
```

#### M3-C: Role-based tab visibility (FIX UI-04)

```ts
const TABS = [
  { key:"overview",     label:"Tổng quan",  icon:Info,      roles:"all" },
  { key:"participants", label:"Hồ sơ",       icon:Users,     roles:"all" },
  { key:"scoring",      label:"Xếp hạng",   icon:BarChart2, roles:"all" },
  { key:"kinh_phi",     label:"Kinh phí",   icon:Hash,
    roles:["lãnh đạo cấp cao","quản trị hệ thống","hội đồng"] },
  { key:"history",      label:"Lịch sử",    icon:FileText,
    roles:["lãnh đạo cấp cao","quản trị hệ thống","hội đồng"] },
];
// Lọc tabs theo role trước khi render
const visibleTabs = TABS.filter(t => t.roles === "all" || t.roles.includes(user.role));
```

---

### Màn hình 4: Workspace — Draft State (Soạn thảo)

**Trạng thái hiện tại:** Có checklist 8 mục, nút "Trình phê duyệt"  
**Cần hoàn thiện:**

#### M4-A: Rejection reason banner nổi bật (FIX UI-01)

Khi phong trào từng ở `submitted` và bị trả về `draft`, hiển thị banner ở đầu workspace:

```
┌──────────────────────────────────────────────────────┐
│ ↩ Trả về chỉnh sửa                      10/03/2026  │
│ Người duyệt: Lê Hoàng Nam · Hội đồng TĐKT            │
│                                                        │
│ Lý do: "Thiếu căn cứ pháp lý NĐ 152/2025/NĐ-CP.     │
│ Cần bổ sung ít nhất 2 văn bản quy phạm pháp luật     │
│ liên quan đến hình thức khen thưởng đề nghị."         │
└──────────────────────────────────────────────────────┘
```

**Logic detect:** Tìm `auditLog.filter(a => a.state === "draft")` và lấy entry gần nhất có `action` chứa "Trả về" hoặc "chỉnh sửa".

**Visual:** Border `#fcd34d`, background `#fef9ec`, icon `RotateCcw` màu `#b45309`.

#### M4-B: Checklist với inline edit

Mỗi mục checklist khi ⭕ → hiển thị inline hint hướng dẫn điền gì:

```
  ⭕ Căn cứ pháp lý (tối thiểu 2 văn bản)
     → Gợi ý: Luật TĐKT 2022 · NĐ 152/2025/NĐ-CP
     [+ Thêm căn cứ pháp lý]
```

---

### Màn hình 5: Workspace — Submitted State (Trình phê duyệt)

**Trạng thái hiện tại:** Hiển thị thông tin cơ bản + nút Duyệt/Trả về  
**Cần hoàn thiện:**

#### M5-A: Full preview dạng "document view" cho HĐ (FIX UI-05)

HĐ cần xem đủ thông tin trước khi quyết định. Thiết kế dạng "preview card" cuộn được:

```
┌─────────────────────────────────────────────────────┐
│  📄 KẾ HOẠCH PHONG TRÀO THI ĐUA                     │
│  Số: PT-2026-001                                     │
│  ─────────────────────────────                       │
│  Tên phong trào: Thi đua Chào mừng...               │
│  Đối tượng: Tất cả CBCCVC tỉnh Đồng Nai             │
│  Thời gian: 01/01/2026 – 30/04/2026                  │
│                                                      │
│  MỤC TIÊU:                                           │
│  [nội dung đầy đủ]                                   │
│                                                      │
│  TIÊU CHÍ CHẤM ĐIỂM (tổng 100 điểm):               │
│  1. Hoàn thành nhiệm vụ    40đ                       │
│  2. Phong trào thi đua     20đ                       │
│  ...                                                 │
│                                                      │
│  HÌNH THỨC KHEN THƯỞNG DỰ KIẾN:                     │
│  · Cờ thi đua Chính phủ                              │
│  · Bằng khen Thủ tướng                              │
│                                                      │
│  CĂN CỨ PHÁP LÝ:                                    │
│  · Luật TĐKT 2022                                    │
│  · NĐ 152/2025/NĐ-CP                                │
└─────────────────────────────────────────────────────┘
```

#### M5-B: Nút "Trả về" bắt buộc có lý do

Khi click "Trả về chỉnh sửa":

```
  Modal: "Lý do trả về"
  ┌────────────────────────────────────────┐
  │ Nhập lý do cụ thể để người tạo biết   │
  │ cần chỉnh sửa gì:                     │
  │ ┌──────────────────────────────────┐   │
  │ │ [textarea, min 20 ký tự]         │   │
  │ └──────────────────────────────────┘   │
  │ Còn lại: 20 ký tự tối thiểu            │
  │                     [Hủy] [Gửi về]    │
  └────────────────────────────────────────┘
```

---

### Màn hình 6: Workspace — Approved State (Phê duyệt kinh phí)

**Trạng thái hiện tại:** Có form chọn nguồn kinh phí  
**Cần hoàn thiện:**

#### M6-A: Block rõ ràng với tooltip (FIX UI-06)

Khi `nguonKinhPhi` chưa xác nhận, thay vì chỉ disable nút "Ban hành", hiển thị:

```
┌──────────────────────────────────────────────────┐
│ ⚠️  Bước này bắt buộc trước khi Ban hành          │
│     Lãnh đạo phải xác nhận nguồn kinh phí        │
│     theo Điều 73 Luật NSNN 2015.                 │
│                                                   │
│  Nguồn kinh phí:  [dropdown: NSNN / Quỹ TĐKT /  │
│                    Đơn vị tự chi]                 │
│  Tổng mức KP dự kiến: [input VNĐ]                │
│                                                   │
│  [✓ Xác nhận kinh phí]  ← sau đó mới unlock      │
│                            nút "Ban hành"         │
└──────────────────────────────────────────────────┘
```

#### M6-B: Badge sau khi xác nhận

Sau khi confirm kinh phí, hiển thị badge trong top bar:

```
  💰 NSNN · 120.000.000 ₫  [đã duyệt ✓]
```

---

### Màn hình 7: Workspace — Published State (Ban hành & Công bố)

**Trạng thái hiện tại:** Có notification channel toggles  
**Cần hoàn thiện:**

#### M7-A: Preview văn bản phát động

Thêm section "Xem trước văn bản phát động" trước khi ban hành:

```
  [Xem trước văn bản]  [📄 Tải bản nháp PDF]
  ┌──────────────────────────────────────────┐
  │     UBND TỈNH ĐỒNG NAI                  │
  │         ───────                          │
  │   QUYẾT ĐỊNH PHÁT ĐỘNG PHONG TRÀO       │
  │          THI ĐUA                         │
  │ Số: .../QĐ-UBND                         │
  │ Ngày: [ngày hôm nay]                    │
  │ ...                                      │
  └──────────────────────────────────────────┘
```

#### M7-B: Cảnh báo khi tắt hết kênh thông báo (FIX EC-05-2)

Khi tất cả 4 kênh bị tắt, hiển thị inline warning:

```
  ⚠️  Không có kênh thông báo nào được bật.
      Đơn vị và cá nhân sẽ không nhận được thông báo phát động.
      [Bật tất cả]
```

---

### Màn hình 8: Workspace — Active State (Đang triển khai)

**Trạng thái hiện tại:** Có 3 luồng — Manager dashboard, LĐDV form, CN form  
**Cần hoàn thiện:**

#### M8-A: CN registration form — thêm review step (FIX UI-11)

Hiện tại CN submit thẳng → cần thêm "Xem lại thông tin":

```
Bước 1: Điền form (họ tên, chức vụ, đơn vị, danh hiệu, thành tích)
           ↓ click "Tiếp theo"
Bước 2: Review card
  ┌────────────────────────────────────┐
  │ Xác nhận thông tin đăng ký        │
  │ ─────────────────────────          │
  │ Họ tên: Nguyễn Văn A              │
  │ Đơn vị: Sở GD&ĐT                 │
  │ Danh hiệu: Chiến sĩ thi đua cơ sở │
  │ Thành tích: [tóm tắt]             │
  │                                    │
  │  [Quay lại sửa]  [✓ Xác nhận gửi] │
  └────────────────────────────────────┘
           ↓ submit thành công
Bước 3: Success screen với mã hồ sơ + hướng dẫn bước tiếp
```

#### M8-B: Manager dashboard — thêm "Nhắc hàng loạt theo nhóm"

Bổ sung button "Nhắc tất cả đơn vị chưa đăng ký" với select-all checkbox trong UnitSubmissionTracker.

---

### Màn hình 9: Workspace — Public Consultation State (Lấy ý kiến công khai)

**Trạng thái hiện tại:** Timer 30 ngày, comment feed, form gửi ý kiến  
**Cần hoàn thiện:**

#### M9-A: CN/LĐDV comment form — thêm preview trước submit (FIX UI-08)

```
Nhập ý kiến → [Xem trước] → [Gửi ý kiến]
           ↓
  Preview:
  ┌────────────────────────────────────┐
  │ Ý kiến của: Nguyễn Văn A          │
  │ Ngày: 29/04/2026                  │
  │ Nội dung: [nội dung ý kiến]       │
  │                                    │
  │  [Sửa lại]  [✓ Gửi chính thức]   │
  └────────────────────────────────────┘
```

#### M9-B: Timer progress bar + milestone markers

```
Ngày bắt đầu    15 ngày    30 ngày (tối thiểu)
     │              │              │
     ▼              ▼              ▼
 ████████████░░░░░░░░░░░░░░░░░░░░
 [Ngày 15/30]    Còn 15 ngày
```

---

### Màn hình 10: Workspace — Decision Issued & Public State

**Trạng thái hiện tại:** Hiển thị QĐ, danh sách được khen  
**Cần hoàn thiện:**

#### M10-A: Section "Tải QĐ cá nhân" cho CN (FIX UI-09)

Khi role là `cá nhân` và user có trong `participants` (được khen thưởng):

```
┌──────────────────────────────────────────────────┐
│ 🏆  Chúc mừng! Bạn được khen thưởng             │
│                                                   │
│  Danh hiệu: Chiến sĩ thi đua cơ sở 2026         │
│  Quyết định: 15/QĐ-UBND ngày 20/04/2026          │
│                                                   │
│  [📄 Tải Quyết định PDF]  [✓ Xác nhận đã nhận]  │
└──────────────────────────────────────────────────┘
```

#### M10-B: Admin receipt tracking table

LĐCC/QTHT xem được ai đã xác nhận, ai chưa (hiện đã có ở state `public`, cần maintain).

---

## IV. Thứ tự ưu tiên triển khai

### Sprint 1 — Critical Fixes (1–2 ngày)

| # | Việc cần làm | File | US | Gap |
|---|---|---|---|---|
| S1-1 | Fix `nextStateLabel` thiếu `public_consultation` | phong-trao-page.tsx:319 | US-07 | UI-02 |
| S1-2 | Tab visibility theo role (ẩn `kinh_phi` và `history` với LĐDV/CN) | phong-trao-page.tsx:4455 | US-09 | UI-04 |
| S1-3 | Tích hợp ReadinessCheck vào top bar action button | phong-trao-page.tsx:4529 | US-07 | UI-03 |
| S1-4 | Rejection reason banner trong draft workspace | phong-trao-page.tsx:2084 | US-01 | UI-01 |

### Sprint 2 — UX Improvements (2–3 ngày)

| # | Việc cần làm | File | US | Gap |
|---|---|---|---|---|
| S2-1 | Block + tooltip giải thích khi "Ban hành" chưa có kinh phí | phong-trao-page.tsx:2265 | US-04 | UI-06 |
| S2-2 | Full preview document view ở submitted state | phong-trao-page.tsx:2173 | US-03 | UI-05 |
| S2-3 | Modal "Lý do trả về" bắt buộc min 20 ký tự | phong-trao-page.tsx:2173 | US-03 | GAP-01 |
| S2-4 | CN registration review step (xem lại trước submit) | phong-trao-page.tsx:2481 | US-09 | UI-11 |
| S2-5 | Action call section trong campaign list card | phong-trao-page.tsx:5380+ | US-06 | UI-07 |

### Sprint 3 — Feature Completions (3–4 ngày)

| # | Việc cần làm | File | US | Gap |
|---|---|---|---|---|
| S3-1 | CN "Tải QĐ + Xác nhận nhận" section trong decision_issued | phong-trao-page.tsx:3608 | US-09 | UI-09 |
| S3-2 | Comment preview step trong public_consultation | phong-trao-page.tsx:2967 | US-08 | UI-08 |
| S3-3 | Summary stats row trên danh sách phong trào | phong-trao-page.tsx:5380 | US-06 | UI-07 |
| S3-4 | Stepper 3 bước cho CreateCampaignModal | phong-trao-page.tsx:5307 | US-01 | UI-10 |
| S3-5 | Preview văn bản phát động trước ban hành | phong-trao-page.tsx:2421 | US-05 | — |

### Sprint 4 — Polish (1–2 ngày)

| # | Việc cần làm | File | US | Gap |
|---|---|---|---|---|
| S4-1 | Campaign card "Action Call" per role | phong-trao-page.tsx:5380 | US-06 | UI-07 |
| S4-2 | Empty state khi filter không kết quả | phong-trao-page.tsx:5380 | US-06 | UI-13 |
| S4-3 | Timer progress bar với milestone markers | phong-trao-page.tsx:2967 | US-07 | — |
| S4-4 | Chuẩn hóa audit log timestamps | phong-trao-page.tsx:183 | US-08 | UI-12 |

---

## V. Wireframe chính — CampaignDetailView Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [← Danh sách] [⊞]  [● Đang triển khai]  Thi đua Chào mừng 50 năm │
│                       117/121 đơn vị │ 6 hồ sơ │ 7 ngày            │
│                                         [📄 PDF]  [→ Đóng nhận HS]│
├─────────────────────────────────────────────────────────────────────┤
│   [✅ Phát động]  ──►  [🟢 Triển khai]  ──►  [⚪ Xét duyệt]  ──►  [⚪ Tổng kết] │
│    Nháp│Trình│Duyệt│Công bố   Triển khai│Đóng nộp   Thẩm định…     Ban hành…   │
├─────────────────────────────────────────────────────────────────────┤
│ ● Triển khai · Luật TĐKT 2022 │ 117/121 đơn vị │ 6 hồ sơ, 4 duyệt │ 7 ngày ▓▓▓░│
├──────────────────────────────────────────┬──────────────────────────┤
│                                          │  WORKSPACE (1/3)         │
│  [Tổng quan][Hồ sơ (6)][Xếp hạng]       │                          │
│                                          │  📋 Theo dõi đăng ký    │
│  ┌──────────────────┐  ┌──────────────┐  │  ████████░░ 117/121      │
│  │ Mục tiêu         │  │ Tiến độ tham │  │  [Nhắc tất cả]          │
│  │ phong trào       │  │ gia: 97%     │  │                          │
│  │ [nội dung]       │  │     ◉ 97%    │  │  ─────────────────────  │
│  └──────────────────┘  │  117/121     │  │                          │
│                        └──────────────┘  │  ⚠️ Còn 7 ngày hạn nộp  │
│  ┌──────────────────────────────────┐    │  hồ sơ. 4 đơn vị chưa   │
│  │ Tiêu chí chấm điểm (100 điểm) ▼ │    │  nộp.                   │
│  └──────────────────────────────────┘    │                          │
│                                          │  [Đóng nhận hồ sơ sớm] │
│  ┌──────────────────────────────────┐    │                          │
│  │ Hình thức khen thưởng dự kiến   │    │  [ReadinessCheck]        │
│  └──────────────────────────────────┘    │  ⚠️ Chỉ 97% đơn vị đã  │
│                                          │  đăng ký. Cân nhắc chờ. │
└──────────────────────────────────────────┴──────────────────────────┘
```

---

## VI. Design Tokens (màu sắc & typography)

### Palette theo role

| Role | Background | Border | Text |
|---|---|---|---|
| Lãnh đạo cấp cao | `#ddeafc` | `#1C5FBE` | `#0b1426` |
| Hội đồng TĐKT | `#f5f3ff` | `#7c3aed` | `#0b1426` |
| Lãnh đạo đơn vị | `#dcfce7` | `#166534` | `#0b1426` |
| Cá nhân / Tập thể | `#fef9ec` | `#b45309` | `#0b1426` |
| Quản trị hệ thống | `#f3f4f6` | `#374151` | `#0b1426` |

### Palette theo trạng thái chuyển bước

| Loại | Background | Border | Icon |
|---|---|---|---|
| Error (block) | `#fef2f2` | `#fca5a5` | 🚫 đỏ |
| Warning (proceed nhưng cảnh báo) | `#fffbeb` | `#fcd34d` | ⚠️ vàng |
| Info (ok) | `#eff6ff` | `#93c5fd` | ℹ️ xanh |
| Rejection reason | `#fef9ec` | `#fcd34d` | ↩️ cam |

### Typography

- **Font chính:** `Be Vietnam Pro` (`var(--font-sans)`)
- **Heading:** 18px bold, color `#0b1426`
- **Sub-heading:** 14px semibold, color `#0b1426`
- **Body:** 13px regular, color `#374151`
- **Caption:** 12px regular, color `#635647`
- **Badge/code:** `JetBrains Mono`, 11–12px

---

## VII. Definition of Done cho kế hoạch thiết kế

Mỗi sprint item được coi là **Done** khi:

- [ ] UI match wireframe / spec trong tài liệu này
- [ ] Tất cả 5 role được test thủ công (LĐCC, QTHT, HĐ, LĐDV, CN)
- [ ] Không có TypeScript error mới
- [ ] ReadinessPanel block đúng khi thiếu điều kiện
- [ ] Role-based visibility đúng (tab, button, form)
- [ ] Responsive trên viewport ≥ 1280px
- [ ] Không vi phạm design tokens (không hardcode màu ngoài palette)
