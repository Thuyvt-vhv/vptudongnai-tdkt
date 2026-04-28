# Review: Luồng Phát động Phong trào — Tài liệu vs. Implementation

**Ngày review:** 2026-04-28  
**Reviewer:** Business Analyst  
**Phạm vi:** So sánh tài liệu `luong-phat-dong-phong-trao.md` (17 bước, nguồn từ `luong-nghiep-vu-page.tsx`)  
với implementation thực tế trong `phong-trao-page.tsx` (12 trạng thái FSM)

---

## 1. Ánh xạ 17 bước → 12 trạng thái FSM

| Bước (tài liệu) | Tên bước | Trạng thái FSM | Ghi chú ánh xạ |
|---|---|---|---|
| Bước 1 | Soạn thảo phong trào | `draft` | 1:1 |
| Bước 2 | Trình phê duyệt | `draft` → `submitted` | Hành động chuyển trạng thái |
| Bước 3 | Phê duyệt kế hoạch | `submitted` | Hội đồng xử lý trong trạng thái này |
| Bước 4 | Ban hành & Công bố | `approved` → `published` | `approved` có thêm phê duyệt kinh phí (không có trong tài liệu) |
| Bước 5 | Đăng ký đơn vị | `active` | Luồng song song — LĐDV |
| Bước 6 | Đăng ký cá nhân | `active` | Luồng song song — Cá nhân |
| Bước 7 | Nộp hồ sơ | `active` | Cá nhân nộp trong trạng thái `active` |
| Bước 8 | Duyệt hồ sơ cơ sở | `active` + `submission_closed` | **⚠️ Bị tách đôi** — xem Issue #1 |
| Bước 9 | Tiếp nhận & Phân loại | `unit_review` | **⚠️ Sai vai trò** — xem Issue #2 |
| Bước 10 | Thẩm định nội dung | `unit_review` | **⚠️ Sai vai trò** — xem Issue #2 |
| Bước 11 | Lấy ý kiến công khai | Sub-panel trong `unit_review` | **❌ Thiếu trạng thái riêng** — xem Issue #3 |
| Bước 12 | Bình xét Hội đồng | `council_review` | ✅ Đúng |
| Bước 13 | Trình ký lãnh đạo | `final_approval` | ✅ Gộp vào final_approval (chấp nhận được) |
| Bước 14 | Ký số quyết định | `final_approval` | ✅ Gộp vào final_approval (chấp nhận được) |
| Bước 15 | Công bố kết quả | `decision_issued` → `public` | ✅ Đúng |
| Bước 16 | Nhận kết quả | `public` (ẩn) | **⚠️ Chưa có tracking** — xem Issue #4 |
| Bước 17 | Lưu trữ hồ sơ | `archived` | ✅ Đúng |

---

## 2. Tổng kết kết quả review

| Kết quả | Số bước | Danh sách bước |
|---|---|---|
| ✅ Đúng | 9 | 1, 2, 3, 6, 7, 12, 13+14, 15, 17 |
| ⚠️ Sai lệch nhỏ / thiếu tính năng | 4 | 4, 8, 9+10, 16 |
| ❌ Sai lệch lớn / vi phạm pháp lý | 1 | 11 |

---

## 3. Chi tiết các vấn đề phát hiện

---

### Issue #1 — Bước 8: Duyệt hồ sơ cơ sở bị tách đôi

**Mức độ:** ⚠️ Sai lệch nhỏ

**Tài liệu nói:**  
Bước 8 (Lãnh đạo đơn vị duyệt hồ sơ cơ sở) xảy ra trong Phase 1, **sau khi cá nhân nộp hồ sơ (Bước 7)**, trước khi chuyển lên Hội đồng. Có nhánh reject về Bước 7.

**Implementation thực tế:**  
Trong trạng thái `active`: Lãnh đạo đơn vị thấy form đăng ký và có thể duyệt. Nhưng không có nút "duyệt hồ sơ từng cá nhân" rõ ràng ở đây.  
Trong trạng thái `unit_review`: Có panel "Thẩm định cấp cơ sở" với nút Duyệt/Trả lại từng hồ sơ — đây mới là nơi lãnh đạo đơn vị thực sự duyệt.  
→ **Bước 8 thực chất đang nằm trong `unit_review` (Phase 2), không phải Phase 1 như tài liệu.**

**Rủi ro:**  
Lãnh đạo đơn vị không có bước rõ ràng để duyệt hồ sơ trong Phase 1 trước khi nộp lên Hội đồng. Hồ sơ nộp xong là có thể đóng nhận ngay → bỏ qua bước duyệt cơ sở.

**Đề xuất:**  
Trong trạng thái `submission_closed`, bổ sung panel "Duyệt sơ bộ hồ sơ đơn vị" cho LĐDV trước khi chuyển sang `unit_review`.

---

### Issue #2 — Bước 9, 10: Sai vai trò thực hiện trong unit_review

**Mức độ:** ⚠️ Sai lệch nhỏ (logic đúng nhưng nhãn/vai trò sai)

**Tài liệu nói:**  
- Bước 9 (Tiếp nhận & Phân loại): Do **Hội đồng TĐKT (Thư ký)** thực hiện  
- Bước 10 (Thẩm định nội dung): Do **Hội đồng TĐKT** thực hiện, lập danh sách đủ điều kiện

**Implementation thực tế (`unit_review` state):**  
- Vai trò được phép duyệt (`canReviewUnit`): `canTransition || role === "lãnh đạo đơn vị"`  
- Thực chất LĐDV là người duyệt hồ sơ trong `unit_review`, không phải Hội đồng  
- Hội đồng chỉ có quyền chuyển trạng thái (`canMove`) không phải duyệt từng hồ sơ

**Nhận định:**  
Về mặt nghiệp vụ, tên trạng thái `unit_review` = "Thẩm định cấp cơ sở" → đây là tầng LĐDV duyệt, **không phải** tầng Hội đồng thẩm định. Bước 9-10 trong tài liệu (Hội đồng thẩm định) chưa được implement thành trạng thái riêng — đang bị gộp/nhầm vai với `unit_review`.

**Đề xuất:**  
Làm rõ phân tầng:
- `unit_review` = LĐDV duyệt sơ bộ (Bước 8 tài liệu)
- Cần thêm trạng thái `hd_review` hoặc sub-step để Hội đồng tiếp nhận & thẩm định (Bước 9-10)

---

### Issue #3 — Bước 11: Lấy ý kiến công khai không có trạng thái riêng ❌

**Mức độ:** ❌ Sai lệch lớn — **có thể vi phạm Điều 56 Luật TĐKT 2022**

**Tài liệu nói:**  
Bước 11 là bước **độc lập**, do Lãnh đạo cấp cao thực hiện:
- Mở cổng lấy ý kiến công khai **tối thiểu 30 ngày**
- Tiếp nhận và xử lý phản ánh hợp lệ
- Có nhánh reject về Bước 10 nếu có phản ánh hợp lệ
- Căn cứ: **Điều 56 Luật TĐKT 2022** (bắt buộc)

**Implementation thực tế:**  
Bước 11 được implement như một **sub-panel nhỏ bên trong `unit_review`** (gọi là "Bước 4A: Public Opinion Collection"):
- Là một khu vực comment feed, không phải trạng thái riêng
- **Không có đồng hồ đếm 30 ngày**
- Không có cơ chế block chuyển trạng thái khi chưa đủ 30 ngày
- Không có luồng "trả về Bước 10" khi có phản ánh hợp lệ
- Không phân biệt ai có quyền xử lý phản ánh

**Rủi ro pháp lý:**  
Điều 56 Luật TĐKT 2022 quy định đây là bước **bắt buộc** với thời hạn tối thiểu 30 ngày. Nếu bị bỏ qua hoặc không đảm bảo thời hạn, quyết định khen thưởng có thể bị khiếu kiện/hủy.

**Đề xuất ưu tiên cao:**  
1. Tách `unit_review` thành 2 trạng thái: `unit_review` và `public_consultation`
2. `public_consultation` cần: timer 30 ngày, block chuyển bước nếu chưa đủ thời gian, panel xử lý phản ánh cho LĐCC, nhánh reject về `unit_review`

---

### Issue #4 — Bước 16: Cá nhân nhận kết quả chưa có tracking

**Mức độ:** ⚠️ Thiếu tính năng

**Tài liệu nói:**  
Bước 16 (Cá nhân nhận kết quả): Cá nhân / tập thể nhận QĐ khen thưởng, kết quả **cập nhật tự động vào hồ sơ cán bộ điện tử**.

**Implementation thực tế:**  
- Trạng thái `public` hiển thị danh sách người được khen thưởng (winner showcase)
- Trạng thái `decision_issued` có payment tracking (đã thanh toán / chưa thanh toán)
- **Không có bước/hành động rõ ràng để cá nhân xác nhận nhận QĐ**
- **Không có tích hợp với module Hồ sơ cán bộ điện tử** (dữ liệu mock, không đồng bộ)

**Đề xuất:**  
Trong trạng thái `public`, bổ sung:
- Danh sách người được khen chưa xác nhận nhận QĐ
- Nút "Xác nhận đã nhận" cho tài khoản cá nhân
- Trigger đồng bộ sang module Hồ sơ cán bộ

---

### Issue #5 — Trạng thái `approved`: có bước phê duyệt kinh phí không có trong tài liệu

**Mức độ:** ⚠️ Tài liệu thiếu, implementation đúng

**Tài liệu nói:**  
Bước 3 → Bước 4 (trực tiếp): Hội đồng duyệt xong thì ban hành ngay.

**Implementation thực tế:**  
Trạng thái `approved` có thêm:
- Panel chọn nguồn kinh phí (NSNN / Quỹ TĐKT / Đơn vị tự chi)
- Nút "Phê duyệt nguồn kinh phí" → `budgetApproved = true`
- Nút "Ban hành" **bị disabled** nếu chưa phê duyệt kinh phí

**Nhận định:**  
Implementation đúng về nghiệp vụ (cần duyệt kinh phí trước khi ban hành), nhưng **tài liệu chưa mô tả bước này**. Cần cập nhật tài liệu.

---

### Issue #6 — Audit log: timestamp hardcode

**Mức độ:** ⚠️ Kỹ thuật

**Phát hiện:**  
Trong `handleTransition`, timestamp tất cả audit entry đều hardcode `fmtDate("2026-04-23")` thay vì `new Date()`.

**Rủi ro:**  
Nhật ký audit log không phản ánh thời gian thực. Vi phạm yêu cầu "truy vết theo NĐ 30/2020/NĐ-CP" mà chính hệ thống tuyên bố tuân thủ.

**Sửa:**  
```typescript
time: fmtDate(new Date().toISOString().slice(0,10))
// hoặc
time: new Date().toLocaleDateString("vi-VN")
```

---

### Issue #7 — Ký số CA: chỉ là client-side mock

**Mức độ:** ⚠️ Kỹ thuật / Demo

**Phát hiện:**  
Nút "Xác thực CA Token" trong `final_approval` chỉ set `setSigConfirmed(true)` — không có backend validation, không gọi API ký số thực.

**Nhận định:**  
Chấp nhận được ở giai đoạn demo/prototype. Cần ghi chú rõ là mock để tránh hiểu nhầm khi bàn giao.

---

## 4. Bảng điểm từng bước (Pass/Fail)

| Bước | Tên | Có trong implementation | Đúng vai trò | Đúng điều kiện chuyển bước | Đúng căn cứ PL | Kết quả |
|---|---|---|---|---|---|---|
| 1 | Soạn thảo | ✅ (`draft`) | ✅ LĐCC | ✅ Checklist 8 mục | ✅ Điều 18 LTĐKT | **PASS** |
| 2 | Trình phê duyệt | ✅ (`draft`→`submitted`) | ✅ LĐCC | ✅ | ✅ NĐ 152/2025 | **PASS** |
| 3 | Phê duyệt kế hoạch | ✅ (`submitted`) | ✅ HĐ | ✅ Approve/Reject về draft | ✅ | **PASS** |
| 4 | Ban hành & Công bố | ✅ (`approved`→`published`) | ✅ LĐCC | ⚠️ Có thêm bước kinh phí chưa có trong tài liệu | ✅ | **PARTIAL** |
| 5 | Đăng ký đơn vị | ✅ (`active` - LĐDV flow) | ✅ LĐDV | ✅ | ✅ | **PASS** |
| 6 | Đăng ký cá nhân | ✅ (`active` - CN flow) | ✅ CN | ✅ | ✅ | **PASS** |
| 7 | Nộp hồ sơ | ✅ (`active`) | ✅ CN | ✅ AI check | ✅ | **PASS** |
| 8 | Duyệt hồ sơ cơ sở | ⚠️ Bị đặt sai phase | ⚠️ LĐDV duyệt trong `unit_review` chứ không phải Phase 1 | ⚠️ Thiếu reject về Bước 7 rõ ràng | ✅ | **PARTIAL** |
| 9 | Tiếp nhận & Phân loại | ⚠️ Gộp vào `unit_review` | ❌ LĐDV làm thay HĐ Thư ký | ⚠️ | ⚠️ | **PARTIAL** |
| 10 | Thẩm định nội dung | ⚠️ Gộp vào `unit_review` | ❌ LĐDV làm thay HĐ | ⚠️ | ⚠️ | **PARTIAL** |
| 11 | Lấy ý kiến công khai | ❌ Chỉ là sub-panel comment | ❌ Không có quy trình LĐCC xử lý | ❌ Không có timer 30 ngày | ❌ Vi phạm Điều 56 LTĐKT | **FAIL** |
| 12 | Bình xét Hội đồng | ✅ (`council_review`) | ✅ HĐ | ✅ ≥2/3 + quorum + minutesSigned | ✅ Điều 57 | **PASS** |
| 13 | Trình ký lãnh đạo | ✅ (gộp `final_approval`) | ✅ LĐCC | ✅ | ✅ Điều 58 | **PASS** |
| 14 | Ký số quyết định | ✅ (mock, `final_approval`) | ✅ LĐCC | ✅ sigConfirmed | ⚠️ Mock only | **PASS (demo)** |
| 15 | Công bố kết quả | ✅ (`decision_issued`→`public`) | ✅ LĐCC | ✅ | ✅ | **PASS** |
| 16 | Nhận kết quả | ⚠️ Ẩn trong `public` | ⚠️ CN không có action | ❌ Không sync hồ sơ cán bộ | ⚠️ | **PARTIAL** |
| 17 | Lưu trữ hồ sơ | ✅ (`archived`) | ✅ QTHT | ✅ | ✅ NĐ 30/2020 | **PASS** |

**Tổng kết: 10 PASS / 5 PARTIAL / 1 FAIL (Bước 11)**

---

## 5. Ưu tiên xử lý

| Ưu tiên | Issue | Lý do |
|---|---|---|
| 🔴 P1 | Issue #3 — Bước 11 thiếu trạng thái + 30 ngày | Vi phạm Điều 56 Luật TĐKT 2022 — rủi ro pháp lý |
| 🔴 P1 | Issue #6 — Timestamp hardcode trong audit log | Nhật ký không hợp lệ theo NĐ 30/2020 |
| 🟡 P2 | Issue #1 — Bước 8 sai phase | Nghiệp vụ thiếu bước duyệt cơ sở trước khi lên HĐ |
| 🟡 P2 | Issue #2 — Bước 9-10 sai vai trò | HĐ Thư ký tiếp nhận chưa được implement |
| 🟢 P3 | Issue #4 — Bước 16 thiếu tracking | Thiếu tính năng, chưa đồng bộ hồ sơ cán bộ |
| 🟢 P3 | Issue #5 — Tài liệu thiếu bước kinh phí | Cần cập nhật tài liệu, implementation đúng |
| 🟢 P3 | Issue #7 — Ký số mock | Chấp nhận giai đoạn demo, cần ghi chú |
