/* ═══════════════════════════════════════════════════════════════════
   HO SO CONFIG — Checklist thành phần hồ sơ thi đua khen thưởng
   Căn cứ: TT 12/2019/TT-BNV, TT 15/2025/TT-BNV, TT 08/2017/TT-BNV,
           TT 118/2025/TT-BTC (hồ sơ tài chính)
═══════════════════════════════════════════════════════════════════ */

export type SubjectType = "ca_nhan" | "tap_the" | "ca_hai";
export type MinhChungLoai = "van_ban" | "anh_minh_chung" | "bang_diem" | "bien_ban" | "chung_chi" | "khac";

export interface MinhChung {
  id: string;
  ten: string;                          // "Quyết định bổ nhiệm"
  loai: MinhChungLoai;
  batBuoc: boolean;
  daNop: boolean;
  ngayNop?: string;
  ghiChu?: string;
}

export interface HoSoRequirement {
  id: string;
  ten: string;                          // "Tờ khai thành tích (Mẫu 01/TT15)"
  tenMau?: string;                      // "Mẫu 01/TT15"
  moTa: string;
  batBuoc: boolean;
  loaiDoiTuong: SubjectType[];
  canCu: string;
  nhomHoSo: "to_khai" | "thanh_tich" | "ly_lich" | "minh_chung" | "tai_chinh" | "noi_bo";
  hdApDung: string[];                   // danh hiệu áp dụng, "all" = tất cả
}

export const HO_SO_REQUIREMENTS: HoSoRequirement[] = [
  /* ── TỜ KHAI ─────────────────────────────────────────────────── */
  {
    id: "hs-tk-01",
    ten: "Tờ khai thành tích cá nhân",
    tenMau: "Mẫu 01/TT15",
    moTa: "Tờ khai theo mẫu chuẩn, ghi đầy đủ thông tin cá nhân, thành tích nổi bật, hình thức đề nghị.",
    batBuoc: true,
    loaiDoiTuong: ["ca_nhan"],
    canCu: "Điều 6, TT 15/2025/TT-BNV",
    nhomHoSo: "to_khai",
    hdApDung: ["all"],
  },
  {
    id: "hs-tk-02",
    ten: "Tờ khai thành tích tập thể",
    tenMau: "Mẫu 02/TT15",
    moTa: "Tờ khai theo mẫu chuẩn cho tập thể, ghi đầy đủ tên đơn vị, thành tích chung, hình thức đề nghị.",
    batBuoc: true,
    loaiDoiTuong: ["tap_the"],
    canCu: "Điều 7, TT 15/2025/TT-BNV",
    nhomHoSo: "to_khai",
    hdApDung: ["all"],
  },

  /* ── BÁO CÁO THÀNH TÍCH ──────────────────────────────────────── */
  {
    id: "hs-bctt-01",
    ten: "Báo cáo thành tích cá nhân (tóm tắt, không quá 1000 từ)",
    moTa: "Nêu rõ thành tích nổi bật trong kỳ thi đua, số liệu cụ thể, kết quả vượt định mức. Theo cấu trúc: Bối cảnh → Hành động → Kết quả.",
    batBuoc: true,
    loaiDoiTuong: ["ca_nhan"],
    canCu: "Điều 7, TT 12/2019/TT-BNV; Điều 5, TT 08/2017/TT-BNV",
    nhomHoSo: "thanh_tich",
    hdApDung: ["all"],
  },
  {
    id: "hs-bctt-02",
    ten: "Báo cáo thành tích tập thể (tóm tắt, không quá 1500 từ)",
    moTa: "Trình bày thành tích tập thể: số lượng CSTĐ, sáng kiến, doanh thu/sản lượng vượt kế hoạch. Kèm số liệu minh chứng.",
    batBuoc: true,
    loaiDoiTuong: ["tap_the"],
    canCu: "Điều 7, TT 12/2019/TT-BNV; Điều 5, TT 08/2017/TT-BNV",
    nhomHoSo: "thanh_tich",
    hdApDung: ["all"],
  },
  {
    id: "hs-bctt-03",
    ten: "Báo cáo thành tích mở rộng (toàn bộ, kèm số liệu thống kê)",
    moTa: "Báo cáo chi tiết đầy đủ, bắt buộc với Huân chương, Anh hùng. Gồm: quá trình công tác, thành tích từng năm, danh sách sáng kiến.",
    batBuoc: false,
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    canCu: "Điều 5, TT 08/2017/TT-BNV",
    nhomHoSo: "thanh_tich",
    hdApDung: ["anh-hung-ld", "huan-chuong-ld-1", "huan-chuong-ld-2", "huan-chuong-ld-3"],
  },

  /* ── LÝ LỊCH & NHÂN THÂN ──────────────────────────────────────── */
  {
    id: "hs-ll-01",
    ten: "Sơ yếu lý lịch có xác nhận của cơ quan",
    moTa: "Sơ yếu lý lịch theo mẫu 2C (Ban TCTW), có chữ ký và đóng dấu xác nhận của Thủ trưởng cơ quan.",
    batBuoc: true,
    loaiDoiTuong: ["ca_nhan"],
    canCu: "Điều 8, TT 12/2019/TT-BNV",
    nhomHoSo: "ly_lich",
    hdApDung: ["all"],
  },
  {
    id: "hs-ll-02",
    ten: "Bản sao quyết định bổ nhiệm/hợp đồng lao động",
    moTa: "Bản sao có chứng thực quyết định bổ nhiệm chức vụ hiện tại hoặc hợp đồng lao động còn hiệu lực.",
    batBuoc: true,
    loaiDoiTuong: ["ca_nhan"],
    canCu: "Điều 6, TT 12/2019/TT-BNV",
    nhomHoSo: "ly_lich",
    hdApDung: ["all"],
  },
  {
    id: "hs-ll-03",
    ten: "Giấy xác nhận không vi phạm kỷ luật",
    moTa: "Xác nhận của cơ quan, đơn vị về việc không bị kỷ luật từ mức cảnh cáo trở lên trong kỳ xét.",
    batBuoc: true,
    loaiDoiTuong: ["ca_nhan"],
    canCu: "Điều 5 khoản 2 NĐ 152/2025/NĐ-CP",
    nhomHoSo: "ly_lich",
    hdApDung: ["all"],
  },

  /* ── MINH CHỨNG ─────────────────────────────────────────────── */
  {
    id: "hs-mc-01",
    ten: "Minh chứng thành tích (văn bản, giải thưởng, bằng sáng kiến...)",
    moTa: "Các tài liệu, văn bản chứng minh thành tích nêu trong báo cáo. Mỗi thành tích lớn cần ít nhất 1 minh chứng.",
    batBuoc: false,
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    canCu: "Điều 9, TT 12/2019/TT-BNV",
    nhomHoSo: "minh_chung",
    hdApDung: ["all"],
  },
  {
    id: "hs-mc-02",
    ten: "Quyết định/Bằng công nhận sáng kiến (nếu có)",
    moTa: "Bản sao quyết định công nhận sáng kiến của Hội đồng sáng kiến đơn vị hoặc cấp trên.",
    batBuoc: false,
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    canCu: "Luật TĐKT 2022 Điều 22 khoản 2; Điều 9 TT 12/2019",
    nhomHoSo: "minh_chung",
    hdApDung: ["cstd-co-so", "cstd-cap-tinh", "cstd-toan-quoc"],
  },
  {
    id: "hs-mc-03",
    ten: "Ảnh chụp hoạt động/sản phẩm (nếu cần thiết)",
    moTa: "Ảnh minh họa hoạt động thi đua, sản phẩm, công trình. Tối đa 5 ảnh, có chú thích.",
    batBuoc: false,
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    canCu: "Điều 9, TT 12/2019/TT-BNV",
    nhomHoSo: "minh_chung",
    hdApDung: ["all"],
  },

  /* ── NỘI BỘ — TẬP THỂ ───────────────────────────────────────── */
  {
    id: "hs-nb-01",
    ten: "Biên bản họp bình xét thi đua nội bộ",
    moTa: "Biên bản cuộc họp bình xét thi đua của tập thể, ghi rõ số người dự, kết quả bỏ phiếu, danh sách đề cử. Ký tên Chủ trì và Thư ký.",
    batBuoc: true,
    loaiDoiTuong: ["tap_the"],
    canCu: "Điều 10, TT 12/2019/TT-BNV; Điều 5, TT 03/2018/TT-BNV",
    nhomHoSo: "noi_bo",
    hdApDung: ["all"],
  },
  {
    id: "hs-nb-02",
    ten: "Danh sách trích ngang người được đề nghị khen thưởng",
    tenMau: "Mẫu Phụ lục TT08",
    moTa: "Danh sách đề nghị theo mẫu chuẩn: STT, họ tên, chức vụ, đơn vị, hình thức đề nghị, thành tích tóm tắt.",
    batBuoc: true,
    loaiDoiTuong: ["tap_the"],
    canCu: "Điều 7, TT 08/2017/TT-BNV",
    nhomHoSo: "noi_bo",
    hdApDung: ["all"],
  },

  /* ── TÀI CHÍNH (khi có tiền thưởng từ NSNN) ─────────────────── */
  {
    id: "hs-tc-01",
    ten: "Dự toán kinh phí khen thưởng",
    moTa: "Bảng dự toán kinh phí chi tiết: tổng số người, hình thức khen, đơn giá, tổng kinh phí, nguồn ngân sách. Theo TT 28/2025/TT-BTC.",
    batBuoc: false,
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    canCu: "Điều 3, TT 28/2025/TT-BTC",
    nhomHoSo: "tai_chinh",
    hdApDung: ["huan-chuong-ld-1", "huan-chuong-ld-2", "huan-chuong-ld-3", "co-thi-dua-chinh-phu", "bang-khen-thu-tuong"],
  },
  {
    id: "hs-tc-02",
    ten: "Chứng từ thanh toán/quyết toán kinh phí (sau khi trao tặng)",
    moTa: "Chứng từ kế toán chứng minh việc chi trả tiền thưởng, nguồn ngân sách. Lưu cùng hồ sơ khen thưởng.",
    batBuoc: false,
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    canCu: "Điều 8, TT 28/2025/TT-BTC; Điều 10, TT 118/2025/TT-BTC",
    nhomHoSo: "tai_chinh",
    hdApDung: ["huan-chuong-ld-1", "huan-chuong-ld-2", "anh-hung-ld", "co-thi-dua-chinh-phu"],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
═══════════════════════════════════════════════════════════════════ */

export function getRequirementsForSubject(
  subject: SubjectType,
  rewardId?: string
): HoSoRequirement[] {
  return HO_SO_REQUIREMENTS.filter(r => {
    const subjectMatch = r.loaiDoiTuong.includes(subject) || r.loaiDoiTuong.includes("ca_hai");
    if (!rewardId) return subjectMatch;
    const rewardMatch = r.hdApDung.includes("all") || r.hdApDung.includes(rewardId);
    return subjectMatch && rewardMatch;
  });
}

export function getMandatoryRequirements(subject: SubjectType): HoSoRequirement[] {
  return getRequirementsForSubject(subject).filter(r => r.batBuoc);
}

export function createEmptyMinhChung(req: HoSoRequirement): MinhChung {
  return {
    id: req.id,
    ten: req.ten,
    loai: req.nhomHoSo === "minh_chung" ? "van_ban" : "van_ban",
    batBuoc: req.batBuoc,
    daNop: false,
  };
}

export function validateMinhChung(
  minhChung: MinhChung[],
  subject: SubjectType,
  rewardId?: string
): { valid: boolean; missing: string[]; warnings: string[] } {
  const required = getMandatoryRequirements(subject);
  const nopIds = minhChung.filter(m => m.daNop).map(m => m.id);
  const missing = required.filter(r => !nopIds.includes(r.id)).map(r => r.ten);

  const warnings: string[] = [];
  const bctt = minhChung.find(m => m.id.startsWith("hs-bctt"));
  if (!bctt?.daNop) {
    warnings.push("Chưa có báo cáo thành tích — đây là tài liệu quan trọng nhất trong hồ sơ");
  }

  return { valid: missing.length === 0, missing, warnings };
}

export const NHOM_HO_SO_LABELS: Record<HoSoRequirement["nhomHoSo"], string> = {
  to_khai:    "Tờ khai",
  thanh_tich: "Báo cáo thành tích",
  ly_lich:    "Lý lịch & nhân thân",
  minh_chung: "Minh chứng",
  tai_chinh:  "Tài chính",
  noi_bo:     "Nội bộ đơn vị",
};
