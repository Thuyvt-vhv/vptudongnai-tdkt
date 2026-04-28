/* ═══════════════════════════════════════════════════════════════════
   REWARD CATALOG — Danh mục hình thức khen thưởng & mức tiền thưởng
   Căn cứ: NĐ 152/2025/NĐ-CP, TT 28/2025/TT-BTC, TT 118/2025/TT-BTC
═══════════════════════════════════════════════════════════════════ */

export type RewardLevel =
  | "nha_nuoc"    // Nhà nước: Huân chương, danh hiệu Nhà nước, Anh hùng
  | "chinh_phu"   // Chính phủ: Cờ thi đua CP, Bằng khen Thủ tướng
  | "bo_nganh"    // Bộ/Ngành: Cờ thi đua Bộ, Bằng khen Bộ
  | "tinh"        // Tỉnh: Cờ thi đua tỉnh, Bằng khen UBND tỉnh
  | "so_huyen"    // Sở/Huyện: Cờ thi đua Sở, Bằng khen GĐ Sở
  | "co_so";      // Cơ sở: Giấy khen, CSTĐ cơ sở

export type RewardType =
  | "huan_chuong"
  | "danh_hieu_nn"   // Anh hùng, Nhà giáo ND/ƯT...
  | "co_thi_dua"
  | "bang_khen"
  | "giay_khen"
  | "danh_hieu_td";  // CSTĐ, Lao động tiên tiến

export type SubjectType = "ca_nhan" | "tap_the" | "ca_hai";
export type NguonKinhPhi = "ngan_sach_nn" | "quy_thi_dua" | "don_vi_tu_chi";

export interface RewardForm {
  id: string;
  ten: string;
  tenViet: string;                  // tên viết tắt hiển thị trên badge
  level: RewardLevel;
  type: RewardType;
  tienThuong: number;               // VND, 0 nếu không có tiền thưởng
  nguonKinhPhi: NguonKinhPhi;
  canCuThuong: string;              // "Điều X NĐ 152/2025/NĐ-CP"
  canCuTien: string;                // "Điều X TT 28/2025/TT-BTC"
  loaiDoiTuong: SubjectType[];
  dieuKienMin: {
    namCongTacMin?: number;         // số năm công tác tối thiểu
    soCSTDLienTiep?: number;        // số lần CSTĐ cơ sở liên tiếp
    soNamLDTT?: number;             // số năm Lao động tiên tiến
    yeuCauKhac?: string;
  };
  moTa: string;
}

export const REWARD_CATALOG: RewardForm[] = [
  /* ── DANH HIỆU NHÀ NƯỚC ──────────────────────────────────────── */
  {
    id: "anh-hung-ld",
    ten: "Anh hùng Lao động",
    tenViet: "Anh hùng LD",
    level: "nha_nuoc",
    type: "danh_hieu_nn",
    tienThuong: 3000000,
    nguonKinhPhi: "ngan_sach_nn",
    canCuThuong: "Điều 63, 64 Luật TĐKT 2022; Điều 45 NĐ 152/2025/NĐ-CP",
    canCuTien: "Điều 5 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    dieuKienMin: { namCongTacMin: 20, soCSTDLienTiep: 5, yeuCauKhac: "Được HĐ TĐKT TW đề nghị, ≥90% HĐ nhất trí" },
    moTa: "Danh hiệu cao quý nhất do Chủ tịch nước phong tặng. Yêu cầu thành tích đặc biệt xuất sắc.",
  },
  {
    id: "nha-giao-nd",
    ten: "Nhà giáo Nhân dân",
    tenViet: "Nhà giáo ND",
    level: "nha_nuoc",
    type: "danh_hieu_nn",
    tienThuong: 3000000,
    nguonKinhPhi: "ngan_sach_nn",
    canCuThuong: "Điều 68 Luật TĐKT 2022; TT 07/2026/TT-BGDĐT",
    canCuTien: "Điều 5 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan"],
    dieuKienMin: { namCongTacMin: 25, soCSTDLienTiep: 6, yeuCauKhac: "Đã được Nhà giáo Ưu tú; ngành GD" },
    moTa: "Danh hiệu nhà nước cao nhất ngành Giáo dục. Tặng cho nhà giáo có đóng góp đặc biệt.",
  },
  {
    id: "nha-giao-ut",
    ten: "Nhà giáo Ưu tú",
    tenViet: "Nhà giáo ƯT",
    level: "nha_nuoc",
    type: "danh_hieu_nn",
    tienThuong: 2000000,
    nguonKinhPhi: "ngan_sach_nn",
    canCuThuong: "Điều 68 Luật TĐKT 2022; TT 07/2026/TT-BGDĐT",
    canCuTien: "Điều 5 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan"],
    dieuKienMin: { namCongTacMin: 15, soCSTDLienTiep: 4, yeuCauKhac: "Ngành GD; đóng góp xuất sắc" },
    moTa: "Danh hiệu tặng cho nhà giáo có thành tích xuất sắc, có đóng góp lớn cho sự nghiệp GD.",
  },

  /* ── HUÂN CHƯƠNG ─────────────────────────────────────────────── */
  {
    id: "huan-chuong-ld-1",
    ten: "Huân chương Lao động hạng Nhất",
    tenViet: "HC Lao động H1",
    level: "nha_nuoc",
    type: "huan_chuong",
    tienThuong: 1500000,
    nguonKinhPhi: "ngan_sach_nn",
    canCuThuong: "Điều 44 Luật TĐKT 2022; Điều 45 NĐ 152/2025/NĐ-CP",
    canCuTien: "Điều 5 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    dieuKienMin: { namCongTacMin: 15, soCSTDLienTiep: 3, yeuCauKhac: "Đã có Huân chương Lao động H2" },
    moTa: "Huân chương cao nhất trong hệ thống Huân chương Lao động, xét sau khi đã có H2.",
  },
  {
    id: "huan-chuong-ld-2",
    ten: "Huân chương Lao động hạng Nhì",
    tenViet: "HC Lao động H2",
    level: "nha_nuoc",
    type: "huan_chuong",
    tienThuong: 1200000,
    nguonKinhPhi: "ngan_sach_nn",
    canCuThuong: "Điều 44 Luật TĐKT 2022; NĐ 152/2025/NĐ-CP",
    canCuTien: "Điều 5 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    dieuKienMin: { namCongTacMin: 10, soCSTDLienTiep: 2, yeuCauKhac: "Đã có Huân chương Lao động H3" },
    moTa: "Xét cho cá nhân/tập thể đã có Huân chương Lao động hạng Ba.",
  },
  {
    id: "huan-chuong-ld-3",
    ten: "Huân chương Lao động hạng Ba",
    tenViet: "HC Lao động H3",
    level: "nha_nuoc",
    type: "huan_chuong",
    tienThuong: 1000000,
    nguonKinhPhi: "ngan_sach_nn",
    canCuThuong: "Điều 44 Luật TĐKT 2022; NĐ 152/2025/NĐ-CP",
    canCuTien: "Điều 5 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    dieuKienMin: { namCongTacMin: 5, soCSTDLienTiep: 1, yeuCauKhac: "Có 3 năm CSTĐ tỉnh liên tiếp" },
    moTa: "Huân chương khởi đầu, dành cho cá nhân/tập thể có thành tích xuất sắc liên tục.",
  },

  /* ── CỜ THI ĐUA ─────────────────────────────────────────────── */
  {
    id: "co-thi-dua-chinh-phu",
    ten: "Cờ thi đua Chính phủ",
    tenViet: "Cờ thi đua CP",
    level: "chinh_phu",
    type: "co_thi_dua",
    tienThuong: 500000,
    nguonKinhPhi: "ngan_sach_nn",
    canCuThuong: "Điều 33 khoản 5 NĐ 152/2025/NĐ-CP",
    canCuTien: "Điều 6 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    dieuKienMin: { namCongTacMin: 5, soCSTDLienTiep: 3, yeuCauKhac: "≥80% HĐ nhất trí; dẫn đầu phong trào cấp quốc gia" },
    moTa: "Cờ thi đua cao nhất do Thủ tướng Chính phủ tặng cho đơn vị dẫn đầu toàn quốc.",
  },
  {
    id: "co-thi-dua-tinh",
    ten: "Cờ thi đua UBND Tỉnh",
    tenViet: "Cờ UBND Tỉnh",
    level: "tinh",
    type: "co_thi_dua",
    tienThuong: 200000,
    nguonKinhPhi: "quy_thi_dua",
    canCuThuong: "Điều 36 Luật TĐKT 2022; NĐ 152/2025/NĐ-CP Chương IV",
    canCuTien: "Điều 6 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    dieuKienMin: { namCongTacMin: 3, soCSTDLienTiep: 2, yeuCauKhac: "Dẫn đầu phong trào cấp tỉnh" },
    moTa: "Cờ thi đua tặng cho đơn vị dẫn đầu phong trào thi đua trong tỉnh.",
  },

  /* ── BẰNG KHEN ──────────────────────────────────────────────── */
  {
    id: "bang-khen-thu-tuong",
    ten: "Bằng khen Thủ tướng Chính phủ",
    tenViet: "BK Thủ tướng",
    level: "chinh_phu",
    type: "bang_khen",
    tienThuong: 300000,
    nguonKinhPhi: "ngan_sach_nn",
    canCuThuong: "Điều 74 Luật TĐKT 2022; NĐ 152/2025/NĐ-CP",
    canCuTien: "Điều 6 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    dieuKienMin: { namCongTacMin: 5, soCSTDLienTiep: 2, yeuCauKhac: "Thành tích xuất sắc cấp quốc gia" },
    moTa: "Bằng khen do Thủ tướng tặng cho cá nhân/tập thể có thành tích đặc biệt xuất sắc.",
  },
  {
    id: "bang-khen-ubnd-tinh",
    ten: "Bằng khen Chủ tịch UBND Tỉnh",
    tenViet: "BK UBND Tỉnh",
    level: "tinh",
    type: "bang_khen",
    tienThuong: 150000,
    nguonKinhPhi: "quy_thi_dua",
    canCuThuong: "Điều 74 Luật TĐKT 2022; NĐ 152/2025/NĐ-CP Chương IV",
    canCuTien: "Điều 6 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    dieuKienMin: { namCongTacMin: 3, soCSTDLienTiep: 1 },
    moTa: "Bằng khen tặng cho cá nhân/tập thể có thành tích xuất sắc trong tỉnh.",
  },
  {
    id: "bang-khen-giam-doc-so",
    ten: "Bằng khen Giám đốc Sở/Ngành",
    tenViet: "BK Giám đốc Sở",
    level: "so_huyen",
    type: "bang_khen",
    tienThuong: 100000,
    nguonKinhPhi: "don_vi_tu_chi",
    canCuThuong: "Điều 74 Luật TĐKT 2022; TT 15/2025/TT-BNV",
    canCuTien: "Điều 7 TT 118/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    dieuKienMin: { namCongTacMin: 2 },
    moTa: "Bằng khen cấp Sở/Ngành tặng cho cá nhân/tập thể xuất sắc trong đơn vị.",
  },

  /* ── DANH HIỆU THI ĐUA ──────────────────────────────────────── */
  {
    id: "cstd-toan-quoc",
    ten: "Chiến sĩ thi đua toàn quốc",
    tenViet: "CSTĐ Toàn quốc",
    level: "nha_nuoc",
    type: "danh_hieu_td",
    tienThuong: 2000000,
    nguonKinhPhi: "ngan_sach_nn",
    canCuThuong: "Điều 22 khoản 5 Luật TĐKT 2022; Điều 45 NĐ 152/2025/NĐ-CP",
    canCuTien: "Điều 5 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan"],
    dieuKienMin: { soCSTDLienTiep: 3, yeuCauKhac: "Đã là CSTĐ Bộ/ngành/tỉnh 3 lần liên tiếp; ≥90% HĐ TW nhất trí" },
    moTa: "Danh hiệu tặng cho cá nhân tiêu biểu nhất toàn quốc trong phong trào thi đua.",
  },
  {
    id: "cstd-cap-tinh",
    ten: "Chiến sĩ thi đua cấp Tỉnh",
    tenViet: "CSTĐ Tỉnh",
    level: "tinh",
    type: "danh_hieu_td",
    tienThuong: 500000,
    nguonKinhPhi: "quy_thi_dua",
    canCuThuong: "Điều 22 khoản 3 Luật TĐKT 2022; NĐ 152/2025/NĐ-CP",
    canCuTien: "Điều 6 TT 28/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan"],
    dieuKienMin: { soCSTDLienTiep: 3, yeuCauKhac: "Đã là CSTĐ cơ sở 3 lần liên tiếp" },
    moTa: "Tặng cho cá nhân tiêu biểu nhất trong phong trào thi đua cấp tỉnh.",
  },
  {
    id: "cstd-co-so",
    ten: "Chiến sĩ thi đua cơ sở",
    tenViet: "CSTĐ cơ sở",
    level: "co_so",
    type: "danh_hieu_td",
    tienThuong: 200000,
    nguonKinhPhi: "don_vi_tu_chi",
    canCuThuong: "Điều 22 khoản 1 Luật TĐKT 2022; Điều 6 NĐ 152/2025/NĐ-CP",
    canCuTien: "Điều 7 TT 118/2025/TT-BTC",
    loaiDoiTuong: ["ca_nhan"],
    dieuKienMin: { soNamLDTT: 3, yeuCauKhac: "Hoàn thành xuất sắc nhiệm vụ; có sáng kiến" },
    moTa: "Danh hiệu phổ biến nhất, tặng cho cá nhân xuất sắc trong đơn vị cơ sở.",
  },
  {
    id: "lao-dong-tien-tien",
    ten: "Lao động tiên tiến",
    tenViet: "LĐTT",
    level: "co_so",
    type: "danh_hieu_td",
    tienThuong: 0,
    nguonKinhPhi: "don_vi_tu_chi",
    canCuThuong: "Điều 24 Luật TĐKT 2022; Điều 7 NĐ 152/2025/NĐ-CP",
    canCuTien: "",
    loaiDoiTuong: ["ca_nhan"],
    dieuKienMin: { yeuCauKhac: "Hoàn thành tốt nhiệm vụ; có đạo đức tốt; tham gia thi đua" },
    moTa: "Danh hiệu cơ bản dành cho người lao động hoàn thành tốt nhiệm vụ trong năm.",
  },

  /* ── GIẤY KHEN ──────────────────────────────────────────────── */
  {
    id: "giay-khen-don-vi",
    ten: "Giấy khen Thủ trưởng đơn vị",
    tenViet: "Giấy khen",
    level: "co_so",
    type: "giay_khen",
    tienThuong: 0,
    nguonKinhPhi: "don_vi_tu_chi",
    canCuThuong: "Điều 74 Luật TĐKT 2022; TT 15/2025/TT-BNV",
    canCuTien: "",
    loaiDoiTuong: ["ca_nhan", "tap_the"],
    dieuKienMin: {},
    moTa: "Hình thức khen thưởng đơn giản nhất, do Thủ trưởng đơn vị ký tặng.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
═══════════════════════════════════════════════════════════════════ */

export function getRewardById(id: string): RewardForm | undefined {
  return REWARD_CATALOG.find(r => r.id === id);
}

export function getRewardByName(ten: string): RewardForm | undefined {
  return REWARD_CATALOG.find(r =>
    r.ten === ten || r.tenViet === ten || ten.includes(r.tenViet)
  );
}

export function getRewardsByLevel(level: RewardLevel): RewardForm[] {
  return REWARD_CATALOG.filter(r => r.level === level);
}

export function getRewardsBySubject(subject: SubjectType): RewardForm[] {
  return REWARD_CATALOG.filter(r =>
    r.loaiDoiTuong.includes(subject) || r.loaiDoiTuong.includes("ca_hai" as SubjectType)
  );
}

export function calcTotalThuong(rewardIds: string[]): number {
  return rewardIds.reduce((sum, id) => {
    const r = getRewardById(id);
    return sum + (r?.tienThuong ?? 0);
  }, 0);
}

export function formatTienThuong(amount: number): string {
  if (amount === 0) return "Không có tiền thưởng";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function getNguonKinhPhiLabel(nguon: NguonKinhPhi): string {
  const labels: Record<NguonKinhPhi, string> = {
    ngan_sach_nn: "Ngân sách Nhà nước",
    quy_thi_dua:  "Quỹ Thi đua - Khen thưởng",
    don_vi_tu_chi:"Đơn vị tự chi",
  };
  return labels[nguon];
}
