# Phân tích User Story — Luồng Phát động Phong trào & Xem chi tiết

**Hệ thống:** VPTU Đồng Nai — Thi đua Khen thưởng  
**Phiên bản:** 1.0  
**Ngày:** 2026-04-29  
**Người viết:** Business Analyst  
**Căn cứ:** Luật TĐKT 2022 · NĐ 152/2025/NĐ-CP · TT 15/2025/TT-BNV

---

## I. Epic Map

```
EPIC-01  Phát động phong trào (Phase 0 — 5 bước)
  ├─ US-01  Soạn thảo kế hoạch phong trào
  ├─ US-02  Trình phê duyệt
  ├─ US-03  Phê duyệt / Từ chối kế hoạch (Hội đồng TĐKT)
  ├─ US-04  Phê duyệt nguồn kinh phí
  └─ US-05  Ban hành & Công bố

EPIC-02  Xem chi tiết phong trào
  ├─ US-06  Xem tổng quan phong trào (mọi vai trò)
  ├─ US-07  Xem tiến trình trạng thái (timeline / stepper)
  ├─ US-08  Xem lịch sử hoạt động (audit log)
  └─ US-09  Xem theo quyền — nội dung hiển thị khác nhau theo role
```

---

## II. EPIC-01 — Phát động phong trào

---

### US-01 · Soạn thảo kế hoạch phong trào

> **As a** Lãnh đạo cấp cao (người tạo phong trào),  
> **I want to** khởi tạo bản thảo kế hoạch phong trào với đầy đủ 8 mục thông tin bắt buộc,  
> **So that** tôi có thể trình Hội đồng TĐKT phê duyệt đúng quy trình pháp lý.

#### Acceptance Criteria

| # | Tiêu chí | Loại |
|---|---|---|
| AC-01-1 | Màn hình tạo phong trào có 8 trường bắt buộc: tên, mục tiêu, đối tượng, tiêu chí (≥3), ngày bắt đầu/kết thúc, hạn nộp hồ sơ, hình thức khen thưởng, căn cứ pháp lý (≥2). | Must have |
| AC-01-2 | Checklist realtime: mỗi mục hiển thị ✅/⭕ ngay khi người dùng điền; nút "Trình phê duyệt" bị disabled cho đến khi `ready = true` (8/8 hoàn thành). | Must have |
| AC-01-3 | Trường "Tiêu chí" cho phép thêm tối đa 10 tiêu chí, mỗi tiêu chí có: tên, điểm tối đa, căn cứ pháp lý. Tổng điểm phải bằng 100 — hiển thị cảnh báo nếu lệch. | Must have |
| AC-01-4 | Trường "Căn cứ pháp lý" gợi ý tự động từ legal-registry (phát hiện văn bản hết hạn, đề xuất thay thế). | Should have |
| AC-01-5 | Hệ thống tự sinh mã phong trào theo định dạng `PT-YYYY-NNN`. | Must have |
| AC-01-6 | Bản thảo được lưu tự động (auto-save) mỗi 60 giây; trạng thái là `draft`. | Should have |
| AC-01-7 | Chỉ người tạo và LĐCC/QTHT mới thấy nút "Trình phê duyệt"; vai trò khác thấy banner "Chỉ xem". | Must have |

#### Business Rules

| # | Quy tắc | Căn cứ |
|---|---|---|
| BR-01-1 | `ngayNopHoSo` phải < `ngayKetThuc` — validate tại client và server. | Logic nghiệp vụ |
| BR-01-2 | `ngayBatDau` không được là ngày trong quá khứ khi tạo mới. | Logic nghiệp vụ |
| BR-01-3 | Mỗi phong trào phải có ít nhất 1 hình thức khen thưởng từ `REWARD_CATALOG`. | Điều 18 Luật TĐKT 2022 |

#### Edge Cases

| # | Tình huống | Xử lý |
|---|---|---|
| EC-01-1 | Người dùng rời trang khi chưa lưu | Hiện modal xác nhận "Bạn có muốn lưu bản nháp không?" |
| EC-01-2 | Phong trào trùng tên trong cùng năm | Cảnh báo (không chặn), để người dùng quyết định |
| EC-01-3 | Tổng điểm tiêu chí ≠ 100 | Cảnh báo màu vàng, không block submit |

---

### US-02 · Trình phê duyệt

> **As a** Lãnh đạo cấp cao (người tạo phong trào),  
> **I want to** trình bản thảo phong trào lên Hội đồng TĐKT để thẩm tra,  
> **So that** kế hoạch được kiểm tra tính hợp lệ trước khi ban hành.

#### Acceptance Criteria

| # | Tiêu chí | Loại |
|---|---|---|
| AC-02-1 | Nút "Trình phê duyệt" chỉ active khi `ready = true` (8/8 mục hoàn thành). | Must have |
| AC-02-2 | Khi bấm "Trình phê duyệt": trạng thái chuyển `draft → submitted`; ghi audit log với actor, thời gian, state. | Must have |
| AC-02-3 | Hệ thống tự động gửi thông báo đến tất cả thành viên Hội đồng TĐKT. | Should have |
| AC-02-4 | Sau khi trình, người tạo chỉ được **xem** — không được chỉnh sửa cho đến khi bị trả về `draft`. | Must have |
| AC-02-5 | Hiển thị banner trạng thái "Đã trình — đang chờ Hội đồng TĐKT thẩm tra" với timestamp. | Must have |

#### Business Rules

| # | Quy tắc | Căn cứ |
|---|---|---|
| BR-02-1 | Chỉ người tạo (`creatorId`) hoặc LĐCC/QTHT mới được thực hiện bước này. | Ma trận phân quyền |
| BR-02-2 | Không thể trình lại nếu đang ở trạng thái `submitted` — tránh duplicate submission. | Logic nghiệp vụ |

---

### US-03 · Phê duyệt / Từ chối kế hoạch (Hội đồng TĐKT)

> **As a** thành viên Hội đồng TĐKT,  
> **I want to** thẩm tra và phê duyệt hoặc trả về kế hoạch phong trào,  
> **So that** chỉ những phong trào đúng pháp lý mới được ban hành.

#### Acceptance Criteria

| # | Tiêu chí | Loại |
|---|---|---|
| AC-03-1 | Tại trạng thái `submitted`, role `hội đồng`/LĐCC/QTHT thấy 2 nút: **"Phê duyệt"** và **"Trả về chỉnh sửa"**. | Must have |
| AC-03-2 | Khi "Phê duyệt": trạng thái chuyển `submitted → approved`; ghi audit log. | Must have |
| AC-03-3 | Khi "Trả về chỉnh sửa": bắt buộc nhập lý do (textarea, tối thiểu 20 ký tự); trạng thái về `draft`; người tạo nhận thông báo kèm lý do. | Must have |
| AC-03-4 | Màn hình `submitted` hiển thị đầy đủ preview kế hoạch (không edit) để HĐ đọc và quyết định. | Must have |
| AC-03-5 | Lý do trả về được lưu vào audit log và hiển thị nổi bật trong màn hình `draft` của người tạo (banner màu vàng). | Must have |

#### Business Rules

| # | Quy tắc | Căn cứ |
|---|---|---|
| BR-03-1 | Thư ký Hội đồng là người thực hiện thẩm tra hình thức. | Điều 23 NĐ 152/2025/NĐ-CP |
| BR-03-2 | Phê duyệt kế hoạch là quyết định của Thư ký HĐ — không cần bỏ phiếu (quorum check không áp dụng ở bước này). | Logic nghiệp vụ |

#### Edge Cases

| # | Tình huống | Xử lý |
|---|---|---|
| EC-03-1 | LĐCC bấm "Phê duyệt" trực tiếp mà không qua HĐ | Hợp lệ theo phân quyền; ghi log rõ "Duyệt bởi LĐCC — bỏ qua thẩm tra HĐ" |

---

### US-04 · Phê duyệt nguồn kinh phí

> **As a** Lãnh đạo cấp cao,  
> **I want to** xác nhận nguồn và tổng mức kinh phí cho phong trào,  
> **So that** đảm bảo có ngân sách hợp lệ trước khi ban hành theo Luật NSNN 2015.

#### Acceptance Criteria

| # | Tiêu chí | Loại |
|---|---|---|
| AC-04-1 | Tại trạng thái `approved`, hiển thị form chọn nguồn kinh phí: **NSNN / Quỹ TĐKT / Đơn vị tự chi** (dropdown, có thể chọn nhiều). | Must have |
| AC-04-2 | Nhập tổng mức kinh phí dự kiến (số, đơn vị VNĐ); hiển thị gợi ý dựa trên loại hình thức khen thưởng đã chọn (lấy từ `REWARD_CATALOG`). | Should have |
| AC-04-3 | Nút "Ban hành & Công bố" bị **block hoàn toàn** nếu `nguonKinhPhi` và `tongKinhPhi` chưa được điền và xác nhận. | Must have |
| AC-04-4 | Sau khi phê duyệt kinh phí: hiển thị badge "Kinh phí đã duyệt — [số tiền] · [nguồn]" ở header màn hình chi tiết. | Should have |
| AC-04-5 | Chỉ LĐCC và QTHT được thực hiện bước này (`leaderOnly`). Người tạo (không phải LĐCC) không thấy form này. | Must have |

#### Business Rules

| # | Quy tắc | Căn cứ |
|---|---|---|
| BR-04-1 | Kinh phí khen thưởng từ NSNN phải được cấp thẩm quyền phê duyệt trước khi chi. | Điều 73 Luật NSNN 2015 |
| BR-04-2 | Hệ thống chỉ ghi nhận thông tin kinh phí và block luồng nếu thiếu — không validate tính hợp lệ tài chính thực tế (ngoài scope). | Logic nghiệp vụ |

---

### US-05 · Ban hành & Công bố phong trào

> **As a** Lãnh đạo cấp cao,  
> **I want to** chính thức ban hành phong trào và gửi thông báo đến tất cả đơn vị,  
> **So that** mọi cán bộ, đơn vị biết phong trào đã bắt đầu và có thể đăng ký tham gia.

#### Acceptance Criteria

| # | Tiêu chí | Loại |
|---|---|---|
| AC-05-1 | Tại trạng thái `approved`, LĐCC/QTHT thấy nút "Ban hành & Công bố". Nút bị disabled nếu chưa xác nhận kinh phí (US-04). | Must have |
| AC-05-2 | Khi ban hành: trạng thái chuyển `approved → published`; ghi audit log; phong trào hiển thị trong danh sách công khai. | Must have |
| AC-05-3 | Màn hình cấu hình thông báo: 4 kênh có thể bật/tắt độc lập — **Email / SMS / Cổng thông tin / Thông báo nội bộ**. Mặc định: bật tất cả. | Should have |
| AC-05-4 | Hệ thống hiển thị preview văn bản phát động (PDF/HTML) trước khi ký. | Should have |
| AC-05-5 | Sau khi ban hành: trạng thái tự động chuyển `published → active` ngay nếu `ngayBatDau` ≤ hôm nay, hoặc theo lịch nếu chưa đến ngày. | Must have |

#### Business Rules

| # | Quy tắc | Căn cứ |
|---|---|---|
| BR-05-1 | Văn bản phát động phải có số hiệu và ngày ký. | TT 15/2025/TT-BNV |
| BR-05-2 | Bước này kích hoạt **đồng thời** 2 luồng song song: Bước 6 (đơn vị đăng ký) và Bước 7 (cá nhân đăng ký). | Bước 5 — sơ đồ luồng |

#### Edge Cases

| # | Tình huống | Xử lý |
|---|---|---|
| EC-05-1 | `ngayBatDau` đã qua khi ban hành | Tự chuyển sang `active` ngay lập tức; log "Kích hoạt tức thời" |
| EC-05-2 | Tất cả kênh thông báo bị tắt | Modal cảnh báo "Không có kênh thông báo nào — bạn có chắc chắn không?" |

---

## III. EPIC-02 — Xem chi tiết phong trào

---

### US-06 · Xem tổng quan phong trào

> **As a** bất kỳ người dùng đã đăng nhập,  
> **I want to** xem thông tin tổng quan của một phong trào,  
> **So that** tôi nắm được tên, mục tiêu, thời gian, tiến độ đăng ký và trạng thái hiện tại.

#### Acceptance Criteria

| # | Tiêu chí | Loại |
|---|---|---|
| AC-06-1 | Header chi tiết hiển thị: tên phong trào, mã code, badge trạng thái (màu theo state), phase hiện tại, URGENT badge nếu `urgent = true`. | Must have |
| AC-06-2 | KPI cards: tổng đơn vị tham gia / đã đăng ký, số hồ sơ đã nộp / đã duyệt, ngày hết hạn nộp + countdown (x ngày còn lại). | Must have |
| AC-06-3 | Hiển thị đầy đủ: mục tiêu, đối tượng, thời gian thực hiện, lãnh đạo phụ trách, đơn vị phụ trách, nguồn kinh phí (nếu đã duyệt). | Must have |
| AC-06-4 | Danh sách tiêu chí chấm điểm: tên, điểm tối đa, căn cứ pháp lý, mô tả — dạng expandable. | Should have |
| AC-06-5 | Danh sách căn cứ pháp lý: phát hiện và cảnh báo văn bản hết hạn (từ `legal-registry`), gợi ý văn bản thay thế. | Should have |

---

### US-07 · Xem tiến trình trạng thái (State Stepper)

> **As a** người dùng xem chi tiết phong trào,  
> **I want to** thấy rõ phong trào đang ở bước nào trong toàn bộ 13 trạng thái,  
> **So that** tôi biết được tiến độ tổng thể và bước tiếp theo cần làm.

#### Acceptance Criteria

| # | Tiêu chí | Loại |
|---|---|---|
| AC-07-1 | Phase stepper ngang (4 phases): mỗi phase hiển thị tên, màu, trạng thái (done ✅ / active 🔵 / pending ⚪). | Must have |
| AC-07-2 | State stepper dọc trong phase hiện tại: mỗi state có icon, label, short-label, màu đặc trưng. State hiện tại được highlight. | Must have |
| AC-07-3 | State hiện tại hiển thị: ngày bắt đầu (từ audit log), căn cứ pháp lý (`canCu`), người thực hiện (từ audit log). | Should have |
| AC-07-4 | Với state `public_consultation`: hiển thị progress bar % thời gian 30 ngày đã trôi qua; màu đỏ nếu chưa đủ, xanh nếu đủ. | Must have |
| AC-07-5 | Nút chuyển bước ("Chuyển sang [bước tiếp theo]") chỉ hiện với người có `canTransition = true` và hiển thị `ReadinessCheck` trước khi cho phép. | Must have |

---

### US-08 · Xem lịch sử hoạt động (Audit Log)

> **As a** người dùng có quyền (LĐCC / QTHT / HĐ),  
> **I want to** xem toàn bộ lịch sử thay đổi trạng thái và hành động trên phong trào,  
> **So that** tôi có thể tra cứu ai đã làm gì và khi nào, phục vụ kiểm toán và giải trình.

#### Acceptance Criteria

| # | Tiêu chí | Loại |
|---|---|---|
| AC-08-1 | Tab "Lịch sử hoạt động" hiển thị timeline dọc, mỗi entry gồm: icon hành động, tên hành động, actor (tên + vai trò), thời gian, mô tả chi tiết, state tại thời điểm. | Must have |
| AC-08-2 | Thời gian audit log là thời gian thực tế khi hành động xảy ra (`nowFmt()`) — không được hardcode. | Must have |
| AC-08-3 | Mỗi lần chuyển trạng thái tự động tạo 1 `AuditEntry` với đầy đủ: `action`, `actor`, `role`, `time`, `detail`, `state`. | Must have |
| AC-08-4 | Filter audit log theo: loại hành động / vai trò actor / khoảng thời gian. | Could have |
| AC-08-5 | Audit log là **bất biến** — không có nút xóa hay chỉnh sửa, kể cả QTHT. | Must have |

---

### US-09 · Xem chi tiết theo quyền — nội dung khác nhau theo role

> **As a** người dùng với vai trò cụ thể,  
> **I want to** chỉ thấy thông tin và hành động phù hợp với vai trò của mình,  
> **So that** giao diện không gây nhầm lẫn và bảo mật dữ liệu nhạy cảm được đảm bảo.

#### Ma trận hiển thị theo role

| Thành phần UI | LĐCC | QTHT | HĐ | LĐDV | CN |
|---|:---:|:---:|:---:|:---:|:---:|
| Nút chuyển bước | ✅ | ✅ | ¹ | ❌ | ❌ |
| Banner "Chỉ xem" | ❌ | ❌ | ❌ | ✅ | ✅ |
| Tab workspace thẩm định | ✅ | ✅ | ✅ | ²  | ❌ |
| Form đăng ký cá nhân | ❌ | ❌ | ❌ | ❌ | ³ |
| Form đăng ký đơn vị | ❌ | ❌ | ❌ | ³  | ❌ |
| Panel bỏ phiếu kín (HĐ) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Thống kê & bảng xếp hạng | ✅ | ✅ | ✅ | ✅ | ⁴ |
| Tab lịch sử hoạt động | ✅ | ✅ | ✅ | ❌ | ❌ |
| Thông tin kinh phí | ✅ | ✅ | ✅ | ❌ | ❌ |

> ¹ HĐ chỉ chuyển bước tại: `submitted`, `unit_review`, `council_review`  
> ² LĐDV chỉ thấy workspace thẩm định tại state `unit_review`  
> ³ Chỉ khả dụng khi phong trào ở state `active`  
> ⁴ CN chỉ thấy kết quả công khai sau khi phong trào ở state `public`

#### Acceptance Criteria

| # | Tiêu chí | Loại |
|---|---|---|
| AC-09-1 | LĐDV và CN ở state không phù hợp vai trò: hiển thị banner "Chỉ xem — Bạn không có quyền thực hiện hành động ở giai đoạn này". | Must have |
| AC-09-2 | CN tại `active`: thấy form đăng ký cá nhân đầy đủ (họ tên, danh hiệu, thành tích); sau submit thấy màn hình xác nhận thành công. | Must have |
| AC-09-3 | LĐDV tại `active`: thấy form đăng ký đơn vị; sau submit thấy confirmation và danh sách cán bộ cần chuẩn bị hồ sơ. | Must have |
| AC-09-4 | Thông tin kinh phí (`tongKinhPhi`, `nguonKinhPhi`) chỉ hiển thị cho LĐCC, QTHT, HĐ — LĐDV và CN không thấy. | Must have |
| AC-09-5 | Tab "Lịch sử hoạt động" chỉ render với LĐCC, QTHT, HĐ. LĐDV và CN không thấy tab này. | Should have |

---

## IV. Gap Analysis

| # | Gap | Mô tả | US liên quan | Ưu tiên |
|---|---|---|---|---|
| GAP-01 | Lý do trả về chưa nổi bật | Lý do "Trả về chỉnh sửa" (US-03) chưa được hiển thị nổi bật trong màn hình `draft` — người tạo không biết cần sửa gì. | US-03 · AC-03-5 | High |
| GAP-02 | Block ban hành thiếu giải thích | Nút "Ban hành" không giải thích rõ tại sao bị disabled khi thiếu kinh phí — chỉ disable không có tooltip. | US-05 · AC-04-3 | High |
| GAP-03 | Audit log không nhất quán | Mock data cũ dùng string hardcode; logic mới dùng `nowFmt()` — cần chuẩn hóa toàn bộ. | US-08 · AC-08-2 | Medium |
| GAP-04 | Thông báo ban hành chưa thực | 4 kênh thông báo tại Bước 5 là UI shell — chưa gửi thực tế đến CN/LĐDV. | US-05 · AC-05-3 | Medium |
| GAP-05 | Preview kế hoạch tại `submitted` thiếu | Màn hình `submitted` không có preview đầy đủ kế hoạch — HĐ phải xem ở tab khác. | US-03 · AC-03-4 | Medium |
| GAP-06 | Không có auto-save | Bản thảo `draft` không có auto-save — mất dữ liệu nếu refresh trang. | US-01 · AC-01-6 | Low |
| GAP-07 | CN/LĐDV mù hoàn toàn về lịch sử | Audit log bị ẩn với CN và LĐDV — không có cách nào xem lịch sử liên quan đến hồ sơ của mình. | US-09 · AC-09-5 | Low |

---

## V. Definition of Done (DoD)

Một user story được coi là **Done** khi:

- [ ] Tất cả AC "Must have" pass trên staging
- [ ] Role matrix (US-09) được kiểm thử với đủ 5 role: LĐCC, QTHT, HĐ, LĐDV, CN
- [ ] Audit log ghi đúng actor + timestamp thực tế (không hardcode)
- [ ] Chuyển bước đúng FSM (`STATE_ORDER`) — không nhảy cóc trạng thái
- [ ] `ReadinessCheck` block đúng khi thiếu điều kiện tiên quyết
- [ ] Không có TypeScript error liên quan đến thay đổi
- [ ] Căn cứ pháp lý được gắn đúng với từng AC

---

## VI. Căn cứ pháp lý tổng hợp

| Văn bản | Áp dụng tại |
|---|---|
| Luật Thi đua, Khen thưởng 2022 — Điều 18 | US-01 (tạo phong trào), US-04 (kinh phí) |
| NĐ 152/2025/NĐ-CP — Điều 6, 23 | US-02 (trình duyệt), US-03 (HĐ thẩm tra) |
| Luật Ngân sách Nhà nước 2015 — Điều 73 | US-04 (phê duyệt kinh phí) |
| TT 15/2025/TT-BNV | US-05 (ban hành văn bản) |
| NĐ 130/2018/NĐ-CP | US-05 (ký số) |
| Luật Giao dịch điện tử 2023 | US-05 (giá trị pháp lý chữ ký số) |
| NĐ 30/2020/NĐ-CP | US-08 (lưu trữ audit log) |
