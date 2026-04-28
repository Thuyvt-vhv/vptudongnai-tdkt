# Tài liệu nghiệp vụ — Luồng Phát động Phong trào Thi đua

**Hệ thống:** VPTU Đồng Nai — Thi đua Khen thưởng  
**Phiên bản:** 1.0  
**Ngày cập nhật:** 2026-04-28  
**Người viết:** Business Analyst  

---

## 1. Tổng quan

Luồng **Phát động Phong trào Thi đua** mô tả toàn bộ quy trình từ khi soạn thảo kế hoạch phong trào cho đến khi ban hành quyết định khen thưởng và lưu trữ hồ sơ.

| Thuộc tính | Giá trị |
|---|---|
| Tổng số bước | 17 |
| Số giai đoạn | 4 |
| Số vai trò tham gia | 5 |
| Có nhánh từ chối / trả về | Có (6 điểm) |

---

## 2. Vai trò tham gia

| Vai trò | Viết tắt | Giai đoạn tham gia | Trách nhiệm chính |
|---|---|---|---|
| Lãnh đạo cấp cao | LĐCC | 0, 2, 3 | Phát động, ký duyệt, công bố kết quả |
| Hội đồng TĐKT | HĐ | 0, 2 | Phê duyệt kế hoạch, thẩm định, bình xét |
| Lãnh đạo đơn vị | LĐDV | 1, 2 | Đăng ký đơn vị, duyệt hồ sơ cơ sở |
| Cá nhân / Tập thể | CN | 1, 3 | Đăng ký tham gia, nộp hồ sơ, nhận kết quả |
| Quản trị hệ thống | QTHT | 3 | Lưu trữ hồ sơ sau quyết định |

---

## 3. Sơ đồ luồng tổng thể

```
[LĐCC] Bước 1 — Soạn thảo phong trào
    ↓
[LĐCC] Bước 2 — Trình phê duyệt
    ↓
[HĐ]   Bước 3 — Phê duyệt kế hoạch ──✗──► Bước 1 (yêu cầu chỉnh sửa)
    ↓ ✓
[LĐCC] Bước 4 — Ban hành & Công bố
    ↓               ↓
[LĐDV] Bước 5    [CN] Bước 6 — Đăng ký cá nhân
Đăng ký đơn vị       ↓
    ↓           [CN] Bước 7 — Nộp hồ sơ ◄──✗── (Bước 8 trả lại)
    ↓               ↓
    └──────────►[LĐDV] Bước 8 — Duyệt hồ sơ cơ sở ──✗──► Bước 7
                    ↓ ✓
               [HĐ] Bước 9 — Tiếp nhận & Phân loại ──✗──► Bước 8
                    ↓ ✓
               [HĐ] Bước 10 — Thẩm định nội dung ──✗──► Bước 8
                    ↓ ✓
               [LĐCC] Bước 11 — Lấy ý kiến công khai ──✗──► Bước 10
                    ↓ ✓
               [HĐ] Bước 12 — Bình xét Hội đồng ──✗──► Rút hồ sơ
                    ↓ ✓ (≥ 2/3 phiếu)
               [LĐCC] Bước 13 — Trình ký lãnh đạo
                    ↓
               [LĐCC] Bước 14 — Ký số quyết định
                    ↓
               [LĐCC] Bước 15 — Công bố kết quả
                    ↓
               [CN]   Bước 16 — Nhận kết quả
                    ↓
               [QTHT] Bước 17 — Lưu trữ hồ sơ
```

---

## 4. Chi tiết từng giai đoạn

---

### Giai đoạn 0 — Phát động

> **Mục tiêu:** Xây dựng và ban hành kế hoạch phong trào thi đua hợp lệ.

#### Bước 1 — Soạn thảo phong trào

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Lãnh đạo cấp cao |
| **Đầu vào** | — |
| **Đầu ra** | Bản thảo kế hoạch phong trào |
| **Mô tả** | Tạo kế hoạch phong trào: mục tiêu, tiêu chí, thời gian, đối tượng, hình thức khen thưởng dự kiến. |
| **Căn cứ pháp lý** | Điều 18 Luật TĐKT 2022 |
| **Luồng tiếp theo** | → Bước 2 |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 2 — Trình phê duyệt

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Lãnh đạo cấp cao |
| **Đầu vào** | Bản thảo kế hoạch phong trào |
| **Đầu ra** | Hồ sơ trình Hội đồng TĐKT |
| **Mô tả** | Trình kế hoạch phong trào lên Hội đồng TĐKT để thẩm tra nội dung, đối chiếu tiêu chí pháp lý trước khi ban hành. |
| **Căn cứ pháp lý** | NĐ 152/2025/NĐ-CP Điều 6 |
| **Luồng tiếp theo** | → Bước 3 |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 3 — Phê duyệt kế hoạch

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Hội đồng TĐKT |
| **Đầu vào** | Hồ sơ trình phê duyệt |
| **Đầu ra** | Kế hoạch được phê duyệt hoặc yêu cầu chỉnh sửa |
| **Mô tả** | Thư ký Hội đồng TĐKT thẩm tra tính hợp lệ, đối chiếu tiêu chí pháp lý; phê duyệt hoặc yêu cầu chỉnh sửa và trả về. |
| **Căn cứ pháp lý** | Điều 23 NĐ 152/2025/NĐ-CP |
| **Luồng tiếp theo** | ✓ Duyệt → Bước 4 |
| **Nhánh từ chối** | ✗ Yêu cầu chỉnh sửa → **Bước 1** |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 4 — Ban hành & Công bố

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Lãnh đạo cấp cao |
| **Đầu vào** | Kế hoạch đã được phê duyệt |
| **Đầu ra** | Văn bản phát động; thông báo gửi toàn bộ đơn vị |
| **Mô tả** | Ký ban hành văn bản phát động, gửi thông báo đến toàn bộ đơn vị và cá nhân liên quan qua hệ thống. |
| **Căn cứ pháp lý** | TT 15/2025/TT-BNV |
| **Luồng tiếp theo** | → Bước 5 (song song) & → Bước 6 (song song) |
| **Ghi chú** | Bước 4 kích hoạt đồng thời hai luồng song song: đơn vị đăng ký (Bước 5) và cá nhân đăng ký (Bước 6). |
| **Trạng thái triển khai** | Đã triển khai |

---

### Giai đoạn 1 — Triển khai & Đăng ký

> **Mục tiêu:** Thu thập đăng ký tham gia và hồ sơ minh chứng từ đơn vị và cá nhân.

> **Lưu ý:** Giai đoạn này có **2 luồng song song** khởi động từ Bước 4:
> - **Luồng đơn vị:** Bước 5 → Bước 8
> - **Luồng cá nhân:** Bước 6 → Bước 7 → Bước 8

#### Bước 5 — Đăng ký đơn vị *(song song với Bước 6)*

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Lãnh đạo đơn vị |
| **Đầu vào** | Thông báo phát động từ Bước 4 |
| **Đầu ra** | Xác nhận đăng ký tham gia của đơn vị |
| **Mô tả** | Lãnh đạo đơn vị đăng ký tham gia phong trào; phổ biến kế hoạch đến toàn bộ cán bộ, viên chức. |
| **Căn cứ pháp lý** | Khoản 1 Điều 6 Luật TĐKT |
| **Luồng tiếp theo** | → Bước 8 |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 6 — Đăng ký cá nhân *(song song với Bước 5)*

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Cá nhân / Tập thể |
| **Đầu vào** | Thông báo phát động từ Bước 4 |
| **Đầu ra** | Xác nhận đăng ký; danh hiệu đề nghị xét duyệt được chọn |
| **Mô tả** | Cá nhân / tập thể đăng ký tham gia, lựa chọn danh hiệu đề nghị xét duyệt (CSTĐCS, LĐTT, Bằng khen…). |
| **Căn cứ pháp lý** | Điều 23 NĐ 152/2025/NĐ-CP |
| **Luồng tiếp theo** | → Bước 7 |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 7 — Nộp hồ sơ

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Cá nhân / Tập thể |
| **Đầu vào** | Xác nhận đăng ký; hồ sơ minh chứng |
| **Đầu ra** | Hồ sơ điện tử đầy đủ trên hệ thống |
| **Mô tả** | Chuẩn bị và nộp đầy đủ hồ sơ minh chứng; kiểm tra AI tự động phát hiện thiếu sót trước khi nộp. |
| **Căn cứ pháp lý** | TT 15/2025/TT-BNV Phụ lục 3 |
| **Luồng tiếp theo** | → Bước 8 |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 8 — Duyệt hồ sơ cơ sở

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Lãnh đạo đơn vị |
| **Đầu vào** | Hồ sơ từ Bước 5 (đơn vị) và Bước 7 (cá nhân) |
| **Đầu ra** | Hồ sơ được phê duyệt chuyển lên Phòng TĐKT |
| **Mô tả** | Xem xét, phê duyệt hồ sơ của cán bộ; trả lại nếu thiếu minh chứng; gửi hồ sơ đạt yêu cầu lên Phòng TĐKT. |
| **Căn cứ pháp lý** | Khoản 2 Điều 55 Luật TĐKT |
| **Luồng tiếp theo** | ✓ Duyệt → Bước 9 |
| **Nhánh từ chối** | ✗ Hồ sơ chưa đủ → **Bước 7** |
| **Trạng thái triển khai** | Đã triển khai |

---

### Giai đoạn 2 — Thẩm định & Xét duyệt

> **Mục tiêu:** Hội đồng TĐKT thẩm định chuyên sâu, lấy ý kiến công khai và bình xét chính thức.

#### Bước 9 — Tiếp nhận & Phân loại

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Hội đồng TĐKT (Thư ký) |
| **Đầu vào** | Hồ sơ đã duyệt cơ sở từ Bước 8 |
| **Đầu ra** | Danh sách hồ sơ được phân loại theo danh hiệu |
| **Mô tả** | Thư ký Hội đồng tiếp nhận hồ sơ, kiểm tra đủ điều kiện hình thức, phân loại theo danh hiệu đề nghị. |
| **Căn cứ pháp lý** | Điều 55 Luật TĐKT 2022 |
| **Luồng tiếp theo** | ✓ Đủ điều kiện hình thức → Bước 10 |
| **Nhánh từ chối** | ✗ Thiếu điều kiện hình thức → **Bước 8** |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 10 — Thẩm định nội dung

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Hội đồng TĐKT |
| **Đầu vào** | Danh sách hồ sơ đã phân loại từ Bước 9 |
| **Đầu ra** | Danh sách đủ điều kiện; kết quả chấm điểm |
| **Mô tả** | Hội đồng thẩm định chi tiết hồ sơ: chấm điểm tiêu chí, kiểm tra COI tự động, lập danh sách đủ điều kiện. |
| **Căn cứ pháp lý** | Điều 55–56 Luật TĐKT 2022 |
| **Luồng tiếp theo** | ✓ Đủ tiêu chí → Bước 11 |
| **Nhánh từ chối** | ✗ Không đủ tiêu chí → **Bước 8** |
| **Ghi chú** | Đầu ra của bước này (danh sách đủ điều kiện) là đầu vào bắt buộc để thực hiện Bước 11 (lấy ý kiến công khai). |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 11 — Lấy ý kiến công khai

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Lãnh đạo cấp cao |
| **Đầu vào** | Danh sách đủ điều kiện từ Bước 10 |
| **Đầu ra** | Tổng hợp ý kiến công khai; danh sách xử lý phản ánh |
| **Mô tả** | Mở cổng lấy ý kiến công khai tối thiểu 30 ngày; tiếp nhận và xử lý phản ánh hợp lệ trước khi chuyển HĐ bình xét. |
| **Căn cứ pháp lý** | Điều 56 Luật TĐKT 2022 |
| **Thời hạn** | Tối thiểu 30 ngày |
| **Luồng tiếp theo** | ✓ Không có phản ánh hợp lệ / Đã xử lý → Bước 12 |
| **Nhánh từ chối** | ✗ Có phản ánh hợp lệ → **Bước 10** (xem xét lại) |
| **Trạng thái triển khai** | Một phần |

#### Bước 12 — Bình xét Hội đồng

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Hội đồng TĐKT |
| **Đầu vào** | Danh sách + kết quả ý kiến công khai từ Bước 11 |
| **Đầu ra** | Biên bản họp Hội đồng; danh sách thông qua |
| **Mô tả** | Hội đồng TĐKT họp, bỏ phiếu kín — hồ sơ thông qua khi ≥ 2/3 tổng số thành viên tán thành; lập biên bản kết quả. |
| **Căn cứ pháp lý** | Điều 57 Luật TĐKT 2022 |
| **Ngưỡng thông qua** | ≥ 2/3 tổng số thành viên Hội đồng tán thành |
| **Luồng tiếp theo** | ✓ Đủ phiếu → Bước 13 |
| **Nhánh từ chối** | ✗ Không đủ 2/3 phiếu → Rút hồ sơ, thông báo đơn vị |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 13 — Trình ký lãnh đạo

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Lãnh đạo cấp cao |
| **Đầu vào** | Biên bản Hội đồng; danh sách đề nghị khen thưởng |
| **Đầu ra** | Hồ sơ trình ký chính thức |
| **Mô tả** | Trình danh sách đề nghị khen thưởng đã được Hội đồng thống nhất lên lãnh đạo có thẩm quyền để ký duyệt chính thức. |
| **Căn cứ pháp lý** | Điều 58 Luật TĐKT 2022 |
| **Luồng tiếp theo** | → Bước 14 |
| **Trạng thái triển khai** | Đã triển khai |

---

### Giai đoạn 3 — Ban hành & Lưu trữ

> **Mục tiêu:** Ban hành quyết định khen thưởng có giá trị pháp lý, công bố kết quả và lưu trữ toàn bộ hồ sơ.

#### Bước 14 — Ký số quyết định

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Lãnh đạo cấp cao |
| **Đầu vào** | Hồ sơ trình ký từ Bước 13 |
| **Đầu ra** | Quyết định khen thưởng có ký số CA |
| **Mô tả** | Ký số CA ban hành Quyết định khen thưởng chính thức; có giá trị pháp lý theo Luật GDĐT 2023. |
| **Căn cứ pháp lý** | NĐ 130/2018/NĐ-CP |
| **Luồng tiếp theo** | → Bước 15 |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 15 — Công bố kết quả

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Lãnh đạo cấp cao |
| **Đầu vào** | Quyết định khen thưởng đã ký số |
| **Đầu ra** | Thông báo kết quả; quyết định gửi đến người được khen thưởng |
| **Mô tả** | Lãnh đạo ký thông báo kết quả; gửi quyết định đến cá nhân / tập thể được khen thưởng qua hệ thống. |
| **Căn cứ pháp lý** | Điều 5 NĐ 152/2025/NĐ-CP |
| **Luồng tiếp theo** | → Bước 16 |
| **Trạng thái triển khai** | Đã triển khai |

#### Bước 16 — Nhận kết quả

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Cá nhân / Tập thể |
| **Đầu vào** | Thông báo kết quả từ Bước 15 |
| **Đầu ra** | Xác nhận nhận quyết định; hồ sơ cán bộ điện tử được cập nhật |
| **Mô tả** | Cá nhân / tập thể nhận Quyết định khen thưởng; kết quả cập nhật tự động vào hồ sơ cán bộ điện tử. |
| **Căn cứ pháp lý** | Luật TĐKT 2022 |
| **Luồng tiếp theo** | → Bước 17 |
| **Trạng thái triển khai** | Một phần |

#### Bước 17 — Lưu trữ hồ sơ

| Trường | Nội dung |
|---|---|
| **Vai trò thực hiện** | Quản trị hệ thống |
| **Đầu vào** | Toàn bộ hồ sơ phong trào (biên bản, quyết định, minh chứng) |
| **Đầu ra** | Hồ sơ lưu trữ điện tử theo thời hạn bảo quản |
| **Mô tả** | Lưu trữ toàn bộ hồ sơ khen thưởng (biên bản, quyết định, minh chứng) theo thời hạn bảo quản quy định. |
| **Căn cứ pháp lý** | NĐ 30/2020/NĐ-CP |
| **Luồng tiếp theo** | — (Kết thúc) |
| **Trạng thái triển khai** | Đã triển khai |

---

## 5. Bảng tổng hợp nhánh từ chối / trả về

| Bước | Điều kiện từ chối | Trả về bước |
|---|---|---|
| 3 — Phê duyệt kế hoạch | Yêu cầu chỉnh sửa nội dung | Bước 1 |
| 8 — Duyệt hồ sơ cơ sở | Hồ sơ chưa đủ minh chứng | Bước 7 |
| 9 — Tiếp nhận & Phân loại | Thiếu điều kiện hình thức | Bước 8 |
| 10 — Thẩm định nội dung | Không đủ tiêu chí xét duyệt | Bước 8 |
| 11 — Lấy ý kiến công khai | Có phản ánh hợp lệ cần xem xét lại | Bước 10 |
| 12 — Bình xét Hội đồng | Không đủ 2/3 phiếu tán thành | Rút hồ sơ khỏi đợt xét |

---

## 6. Trạng thái triển khai trên hệ thống

| Trạng thái | Số bước | Danh sách |
|---|---|---|
| **Đã triển khai** | 15 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 17 |
| **Một phần** | 2 | 11 (Lấy ý kiến công khai), 16 (Nhận kết quả) |
| **Chưa có** | 0 | — |

---

## 7. Căn cứ pháp lý tổng hợp

| Văn bản | Điều khoản áp dụng |
|---|---|
| Luật Thi đua, Khen thưởng 2022 | Điều 6, 18, 55, 56, 57, 58 |
| NĐ 152/2025/NĐ-CP ngày 14/6/2025 | Điều 6, 23 (thay thế NĐ 98/2023) |
| TT 15/2025/TT-BNV | Mẫu biểu hồ sơ, Phụ lục 3 (thay thế TT 01/2024) |
| NĐ 130/2018/NĐ-CP | Ký số CA, chứng thực điện tử |
| Luật Giao dịch điện tử 2023 | Giá trị pháp lý chữ ký số |
| NĐ 30/2020/NĐ-CP | Thể thức, kỹ thuật trình bày & lưu trữ văn bản |

---

## 8. Ghi chú triển khai

- **Bước 4** kích hoạt **đồng thời** hai luồng (Bước 5 và Bước 6). Hệ thống cần xử lý concurrency tại điểm hội tụ Bước 8 — chỉ chuyển lên Bước 9 sau khi cả hai luồng hoàn thành.
- **Bước 11** (Lấy ý kiến công khai) có thời hạn tối thiểu **30 ngày** theo luật — cần tích hợp bộ đếm thời gian và cảnh báo SLA.
- **Bước 12** yêu cầu bỏ phiếu kín điện tử: hệ thống phải đảm bảo tính bất biến của phiếu bầu và ghi nhật ký audit đầy đủ.
- Kết quả Bước 16 (Nhận kết quả) cần đồng bộ tự động sang module **Hồ sơ cán bộ điện tử**.
