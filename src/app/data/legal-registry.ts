/* ═══════════════════════════════════════════════════════════════════
   LEGAL REGISTRY — Nguồn sự thật duy nhất cho căn cứ pháp lý TĐKT
   Cập nhật: NĐ 152/2025/NĐ-CP thay NĐ 98/2023; TT 15/2025 thay TT 01/2024
═══════════════════════════════════════════════════════════════════ */

export type LegalDocType = "luat" | "nghi_dinh" | "thong_tu" | "quyet_dinh" | "nghi_quyet";
export type Sector = "chung" | "giao_duc" | "cong_an" | "tai_chinh" | "y_te" | "nong_nghiep" | "xay_dung";

export interface LegalDoc {
  id: string;
  so: string;
  ten: string;
  type: LegalDocType;
  sectors: Sector[];
  hieuluc: boolean;
  thayThe?: string;       // id văn bản bị thay thế
  ngayBanHanh: string;
  ngayHieuLuc: string;
  coQuan: string;
  tomTat: string;
  dieuKhoanQuanTrong: { dieu: string; noidung: string }[];
}

export const LEGAL_DOCS: LegalDoc[] = [
  /* ── LUẬT ─────────────────────────────────────────────────────── */
  {
    id: "luat-tdkt-2022",
    so: "Luật TĐKT 2022",
    ten: "Luật Thi đua, Khen thưởng số 06/2022/QH15",
    type: "luat",
    sectors: ["chung"],
    hieuluc: true,
    ngayBanHanh: "2022-06-15",
    ngayHieuLuc: "2024-01-01",
    coQuan: "Quốc hội",
    tomTat: "Luật nền tảng quy định nguyên tắc, hình thức, tiêu chuẩn, thẩm quyền và trình tự xét tặng danh hiệu thi đua và hình thức khen thưởng.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 6", noidung: "Nguyên tắc thi đua" },
      { dieu: "Điều 10", noidung: "Nội dung phong trào thi đua" },
      { dieu: "Điều 18", noidung: "Thẩm quyền quyết định khen thưởng" },
      { dieu: "Điều 22", noidung: "Tiêu chuẩn danh hiệu thi đua đối với cá nhân" },
      { dieu: "Điều 23", noidung: "Tiêu chuẩn danh hiệu thi đua đối với tập thể" },
      { dieu: "Điều 55", noidung: "Trình tự, thủ tục xét tặng" },
      { dieu: "Điều 56", noidung: "Hội đồng Thi đua - Khen thưởng" },
      { dieu: "Điều 57", noidung: "Thẩm quyền ký quyết định khen thưởng" },
      { dieu: "Điều 58", noidung: "Trao tặng và đón nhận danh hiệu" },
      { dieu: "Điều 13", noidung: "Công khai kết quả thi đua khen thưởng" },
    ],
  },
  {
    id: "luat-luu-tru-2011",
    so: "Luật Lưu trữ 2011",
    ten: "Luật Lưu trữ số 01/2011/QH13",
    type: "luat",
    sectors: ["chung"],
    hieuluc: true,
    ngayBanHanh: "2011-11-11",
    ngayHieuLuc: "2012-07-01",
    coQuan: "Quốc hội",
    tomTat: "Quy định về hoạt động lưu trữ, thời hạn bảo quản tài liệu. Áp dụng cho hồ sơ thi đua khen thưởng tại trạng thái archived.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 17", noidung: "Thời hạn bảo quản tài liệu lưu trữ" },
      { dieu: "Điều 18", noidung: "Tiêu hủy tài liệu hết giá trị lưu trữ" },
    ],
  },

  /* ── NGHỊ ĐỊNH ─────────────────────────────────────────────────── */
  {
    id: "nd-152-2025",
    so: "NĐ 152/2025/NĐ-CP",
    ten: "Nghị định 152/2025/NĐ-CP ngày 14/6/2025 quy định chi tiết và hướng dẫn thi hành Luật TĐKT 2022",
    type: "nghi_dinh",
    sectors: ["chung"],
    hieuluc: true,
    thayThe: "nd-98-2023",
    ngayBanHanh: "2025-06-14",
    ngayHieuLuc: "2025-07-01",
    coQuan: "Chính phủ",
    tomTat: "Nghị định thay thế NĐ 98/2023. Quy định chi tiết tiêu chuẩn, hồ sơ, thủ tục xét tặng danh hiệu thi đua và hình thức khen thưởng.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 3", noidung: "Nguyên tắc xét tặng danh hiệu" },
      { dieu: "Điều 5", noidung: "Điều kiện xét tặng" },
      { dieu: "Điều 6", noidung: "Tiêu chuẩn danh hiệu Chiến sĩ thi đua cơ sở" },
      { dieu: "Điều 7", noidung: "Tiêu chuẩn danh hiệu Chiến sĩ thi đua cấp Bộ, ngành, tỉnh" },
      { dieu: "Điều 23", noidung: "Thủ tục hồ sơ đề nghị khen thưởng cấp tỉnh" },
      { dieu: "Điều 28", noidung: "Trình tự xét, đề nghị khen thưởng cấp cơ sở" },
      { dieu: "Điều 29", noidung: "Yêu cầu trao tặng danh hiệu, hình thức khen thưởng" },
      { dieu: "Điều 33 khoản 5", noidung: "Ngưỡng thông qua Cờ thi đua Chính phủ: ≥80% HĐ nhất trí" },
      { dieu: "Điều 44", noidung: "Công khai cá nhân, tập thể được đề nghị khen thưởng" },
      { dieu: "Điều 45", noidung: "Hội đồng TĐKT Trung ương: 2/3 dự họp, 90% thông qua Anh hùng/CSTĐTQ" },
    ],
  },
  {
    id: "nd-98-2023",
    so: "NĐ 98/2023/NĐ-CP",
    ten: "Nghị định 98/2023/NĐ-CP quy định chi tiết thi hành một số điều của Luật TĐKT",
    type: "nghi_dinh",
    sectors: ["chung"],
    hieuluc: false,
    ngayBanHanh: "2023-12-31",
    ngayHieuLuc: "2024-01-01",
    coQuan: "Chính phủ",
    tomTat: "ĐÃ HẾT HIỆU LỰC — thay thế bởi NĐ 152/2025/NĐ-CP từ 01/7/2025.",
    dieuKhoanQuanTrong: [],
  },
  {
    id: "nd-130-2018",
    so: "NĐ 130/2018/NĐ-CP",
    ten: "Nghị định 130/2018/NĐ-CP về chữ ký số và dịch vụ chứng thực chữ ký số",
    type: "nghi_dinh",
    sectors: ["chung"],
    hieuluc: true,
    ngayBanHanh: "2018-09-27",
    ngayHieuLuc: "2018-11-15",
    coQuan: "Chính phủ",
    tomTat: "Quy định về chữ ký số CA, xác thực điện tử trên văn bản quyết định khen thưởng. Áp dụng tại trạng thái decision_issued.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 8", noidung: "Giá trị pháp lý của chữ ký số" },
      { dieu: "Điều 22", noidung: "Dịch vụ chứng thực chữ ký số công cộng" },
    ],
  },
  {
    id: "nd-30-2020",
    so: "NĐ 30/2020/NĐ-CP",
    ten: "Nghị định 30/2020/NĐ-CP về công tác văn thư",
    type: "nghi_dinh",
    sectors: ["chung"],
    hieuluc: true,
    ngayBanHanh: "2020-03-05",
    ngayHieuLuc: "2020-03-05",
    coQuan: "Chính phủ",
    tomTat: "Quy định về công tác văn thư, lưu trữ hồ sơ thi đua khen thưởng 20 năm tại trạng thái archived.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 26", noidung: "Quản lý và lưu trữ văn bản điện tử" },
      { dieu: "Điều 31", noidung: "Thời hạn bảo quản hồ sơ" },
    ],
  },

  /* ── THÔNG TƯ BNV ──────────────────────────────────────────────── */
  {
    id: "tt-15-2025-bnv",
    so: "TT 15/2025/TT-BNV",
    ten: "Thông tư 15/2025/TT-BNV ngày 04/8/2025 hướng dẫn nghiệp vụ công tác thi đua khen thưởng",
    type: "thong_tu",
    sectors: ["chung"],
    hieuluc: true,
    thayThe: "tt-01-2024-bnv",
    ngayBanHanh: "2025-08-04",
    ngayHieuLuc: "2025-08-05",
    coQuan: "Bộ Nội vụ",
    tomTat: "Thông tư core thay thế TT 01/2024. Hướng dẫn quy trình thi đua, mẫu hồ sơ, phân cấp phân quyền, tổ chức triển khai phong trào.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 3", noidung: "Quy trình phát động phong trào thi đua" },
      { dieu: "Điều 6", noidung: "Mẫu 01/TT15 — Tờ khai thành tích cá nhân" },
      { dieu: "Điều 7", noidung: "Mẫu 02/TT15 — Tờ khai thành tích tập thể" },
      { dieu: "Điều 8", noidung: "Mẫu 03/TT15 — Tờ trình đề nghị khen thưởng" },
      { dieu: "Điều 9", noidung: "Mẫu 04/TT15 — Biên bản họp Hội đồng" },
      { dieu: "Điều 12", noidung: "Phân cấp thẩm quyền xét duyệt" },
    ],
  },
  {
    id: "tt-01-2024-bnv",
    so: "TT 01/2024/TT-BNV",
    ten: "Thông tư 01/2024/TT-BNV về mẫu hồ sơ thi đua khen thưởng",
    type: "thong_tu",
    sectors: ["chung"],
    hieuluc: false,
    ngayBanHanh: "2024-01-15",
    ngayHieuLuc: "2024-03-01",
    coQuan: "Bộ Nội vụ",
    tomTat: "ĐÃ HẾT HIỆU LỰC — thay thế bởi TT 15/2025/TT-BNV từ 05/8/2025.",
    dieuKhoanQuanTrong: [],
  },
  {
    id: "tt-20-2025-bnv",
    so: "TT 20/2025/TT-BNV",
    ten: "Thông tư 20/2025/TT-BNV hướng dẫn về tổ chức bộ máy và biên chế thực hiện công tác TĐKT",
    type: "thong_tu",
    sectors: ["chung"],
    hieuluc: true,
    ngayBanHanh: "2025-09-01",
    ngayHieuLuc: "2025-10-15",
    coQuan: "Bộ Nội vụ",
    tomTat: "Hướng dẫn về tổ chức bộ máy hội đồng TĐKT các cấp, vị trí việc làm chuyên trách công tác TĐKT.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 4", noidung: "Cơ cấu tổ chức Hội đồng TĐKT cấp tỉnh" },
      { dieu: "Điều 7", noidung: "Nhiệm vụ và quyền hạn cơ quan thường trực TĐKT" },
    ],
  },
  {
    id: "tt-05-2020-bnv",
    so: "TT 05/2020/TT-BNV",
    ten: "Thông tư 05/2020/TT-BNV hướng dẫn về công tác tổng kết thi đua khen thưởng",
    type: "thong_tu",
    sectors: ["chung"],
    hieuluc: true,
    ngayBanHanh: "2020-11-10",
    ngayHieuLuc: "2021-01-01",
    coQuan: "Bộ Nội vụ",
    tomTat: "Quy định về cách phát động phong trào, đánh giá kết quả, tổng kết thi đua cuối năm/giai đoạn.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 3", noidung: "Yêu cầu báo cáo tổng kết thi đua" },
      { dieu: "Điều 5", noidung: "Nội dung đánh giá kết quả phong trào" },
      { dieu: "Điều 8", noidung: "Biểu mẫu báo cáo tổng kết" },
    ],
  },
  {
    id: "tt-12-2019-bnv",
    so: "TT 12/2019/TT-BNV",
    ten: "Thông tư 12/2019/TT-BNV về chuẩn hóa và quản lý hồ sơ thi đua khen thưởng",
    type: "thong_tu",
    sectors: ["chung"],
    hieuluc: true,
    ngayBanHanh: "2019-11-04",
    ngayHieuLuc: "2020-01-01",
    coQuan: "Bộ Nội vụ",
    tomTat: "Quy định về chuẩn hóa thành phần hồ sơ, định dạng tài liệu, checklist kiểm tra hồ sơ hợp lệ.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 6", noidung: "Thành phần hồ sơ đề nghị khen thưởng cá nhân" },
      { dieu: "Điều 7", noidung: "Nội dung báo cáo thành tích" },
      { dieu: "Điều 8", noidung: "Yêu cầu về sơ yếu lý lịch" },
      { dieu: "Điều 9", noidung: "Minh chứng và tài liệu kèm theo" },
      { dieu: "Điều 10", noidung: "Thành phần hồ sơ tập thể, biên bản họp nội bộ" },
    ],
  },
  {
    id: "tt-08-2017-bnv",
    so: "TT 08/2017/TT-BNV",
    ten: "Thông tư 08/2017/TT-BNV quy định về tờ trình, báo cáo thành tích, danh sách đề nghị khen thưởng",
    type: "thong_tu",
    sectors: ["chung"],
    hieuluc: true,
    ngayBanHanh: "2017-12-26",
    ngayHieuLuc: "2018-02-15",
    coQuan: "Bộ Nội vụ",
    tomTat: "Quy định mẫu tờ trình, cấu trúc báo cáo thành tích, biểu mẫu danh sách đề nghị khen thưởng. Bổ sung bởi TT 15/2025 về mẫu biểu.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 3", noidung: "Cấu trúc tờ trình đề nghị khen thưởng" },
      { dieu: "Điều 5", noidung: "Nội dung báo cáo thành tích (cá nhân/tập thể)" },
      { dieu: "Điều 7", noidung: "Biểu mẫu danh sách đề nghị khen thưởng" },
    ],
  },
  {
    id: "tt-03-2018-bnv",
    so: "TT 03/2018/TT-BNV",
    ten: "Thông tư 03/2018/TT-BNV quy định về hội đồng xét duyệt và quy trình họp",
    type: "thong_tu",
    sectors: ["chung"],
    hieuluc: true,
    ngayBanHanh: "2018-03-08",
    ngayHieuLuc: "2018-05-01",
    coQuan: "Bộ Nội vụ",
    tomTat: "Quy định về cơ cấu, thành phần, điều kiện họp hợp lệ và trình tự bỏ phiếu của Hội đồng TĐKT.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 4", noidung: "Thành phần Hội đồng TĐKT cơ sở (tối thiểu 5 thành viên)" },
      { dieu: "Điều 5", noidung: "Điều kiện họp hợp lệ: ≥2/3 tổng số thành viên có mặt" },
      { dieu: "Điều 6", noidung: "Nguyên tắc bỏ phiếu kín, không ủy quyền" },
      { dieu: "Điều 7", noidung: "Biên bản họp Hội đồng phải lập ngay sau phiên họp" },
      { dieu: "Điều 8", noidung: "Ngưỡng thông qua: ≥2/3 số thành viên dự họp nhất trí" },
    ],
  },

  /* ── THÔNG TƯ NGÀNH ────────────────────────────────────────────── */
  {
    id: "tt-07-2026-bgddt",
    so: "TT 07/2026/TT-BGDĐT",
    ten: "Thông tư 07/2026/TT-BGDĐT ngày 15/2/2026 về thi đua khen thưởng ngành Giáo dục và Đào tạo",
    type: "thong_tu",
    sectors: ["giao_duc"],
    hieuluc: true,
    ngayBanHanh: "2026-02-15",
    ngayHieuLuc: "2026-04-02",
    coQuan: "Bộ Giáo dục và Đào tạo",
    tomTat: "Quy định tiêu chí thi đua, hình thức khen thưởng đặc thù ngành GD&ĐT. Bộ tiêu chí riêng cho giáo viên, cán bộ quản lý giáo dục.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 5 khoản 2", noidung: "Tiêu chí chất lượng giảng dạy (35 điểm)" },
      { dieu: "Điều 5 khoản 3", noidung: "Tiêu chí đổi mới phương pháp dạy học (25 điểm)" },
      { dieu: "Điều 5 khoản 4", noidung: "Tiêu chí kết quả học sinh (20 điểm)" },
      { dieu: "Điều 5 khoản 5", noidung: "Tiêu chí đạo đức nhà giáo (10 điểm)" },
      { dieu: "Điều 7", noidung: "Danh hiệu Nhà giáo Ưu tú, Nhà giáo Nhân dân" },
    ],
  },
  {
    id: "tt-22-2025-bca",
    so: "TT 22/2025/TT-BCA",
    ten: "Thông tư 22/2025/TT-BCA về thi đua khen thưởng trong Công an nhân dân",
    type: "thong_tu",
    sectors: ["cong_an"],
    hieuluc: true,
    ngayBanHanh: "2025-10-01",
    ngayHieuLuc: "2025-11-15",
    coQuan: "Bộ Công an",
    tomTat: "Quy định tiêu chí, hình thức thi đua khen thưởng đặc thù ngành Công an. Có tiêu chí về hoàn thành nhiệm vụ chiến đấu, phòng chống tội phạm.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 4", noidung: "Tiêu chí hoàn thành nhiệm vụ chiến đấu (45 điểm)" },
      { dieu: "Điều 5", noidung: "Tiêu chí phòng chống tội phạm (25 điểm)" },
      { dieu: "Điều 6", noidung: "Tiêu chí kỷ luật và điều lệnh (20 điểm)" },
      { dieu: "Điều 7", noidung: "Tiêu chí công tác chính trị tư tưởng (10 điểm)" },
    ],
  },
  {
    id: "tt-118-2025-btc",
    so: "TT 118/2025/TT-BTC",
    ten: "Thông tư 118/2025/TT-BTC về thi đua khen thưởng ngành Tài chính và mức kinh phí khen thưởng",
    type: "thong_tu",
    sectors: ["tai_chinh"],
    hieuluc: true,
    ngayBanHanh: "2025-11-01",
    ngayHieuLuc: "2026-01-01",
    coQuan: "Bộ Tài chính",
    tomTat: "Quy định tiêu chí thi đua ngành Tài chính và hướng dẫn kinh phí khen thưởng, nguồn ngân sách chi trả tiền thưởng.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 3 khoản 1", noidung: "Tiêu chí hoàn thành dự toán ngân sách (40 điểm)" },
      { dieu: "Điều 4", noidung: "Tiêu chí quản lý tài chính công (25 điểm)" },
      { dieu: "Điều 5", noidung: "Tiêu chí cải cách hành chính tài chính (20 điểm)" },
      { dieu: "Điều 6 khoản 2", noidung: "Tiêu chí đạo đức nghề nghiệp (15 điểm)" },
      { dieu: "Điều 10", noidung: "Nguồn kinh phí khen thưởng từ Quỹ thi đua" },
    ],
  },
  {
    id: "tt-28-2025-btc",
    so: "TT 28/2025/TT-BTC",
    ten: "Thông tư 28/2025/TT-BTC hướng dẫn lập dự toán, sử dụng và quyết toán kinh phí khen thưởng",
    type: "thong_tu",
    sectors: ["tai_chinh", "chung"],
    hieuluc: true,
    ngayBanHanh: "2025-05-15",
    ngayHieuLuc: "2025-07-01",
    coQuan: "Bộ Tài chính",
    tomTat: "Hướng dẫn lập dự toán và quyết toán nguồn kinh phí từ ngân sách nhà nước cho hoạt động khen thưởng các cấp.",
    dieuKhoanQuanTrong: [
      { dieu: "Điều 3", noidung: "Nguồn kinh phí khen thưởng: ngân sách NN và quỹ đơn vị" },
      { dieu: "Điều 5", noidung: "Mức tiền thưởng Huân chương Lao động các hạng" },
      { dieu: "Điều 6", noidung: "Mức tiền thưởng Bằng khen Thủ tướng, Chủ tịch UBND" },
      { dieu: "Điều 8", noidung: "Quyết toán kinh phí khen thưởng cuối năm" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
═══════════════════════════════════════════════════════════════════ */

export function getValidDocs(): LegalDoc[] {
  return LEGAL_DOCS.filter(d => d.hieuluc);
}

export function getDocById(id: string): LegalDoc | undefined {
  return LEGAL_DOCS.find(d => d.id === id);
}

export function getDocsBySector(sector: Sector): LegalDoc[] {
  return LEGAL_DOCS.filter(d => d.hieuluc && d.sectors.includes(sector));
}

export function detectExpiredDocs(canCuPhapLy: string[]): string[] {
  const expiredDocs = LEGAL_DOCS.filter(d => !d.hieuluc);
  return canCuPhapLy.filter(cu =>
    expiredDocs.some(d =>
      cu.includes(d.so.replace("/NĐ-CP","").replace("/TT-BNV","").trim()) ||
      cu.includes(d.so)
    )
  );
}

export function getReplacementDoc(expiredSo: string): LegalDoc | undefined {
  const expired = LEGAL_DOCS.find(d =>
    !d.hieuluc && (expiredSo.includes(d.so) || d.so.includes(expiredSo.split(" ")[0]))
  );
  if (!expired) return undefined;
  return LEGAL_DOCS.find(d => d.id === expired.thayThe);
}

type CampaignType = "toan_quoc" | "cap_bo" | "toan_tinh" | "cap_so" | "cap_huyen" | "co_so";
type SectorId = "chung" | "giao_duc" | "cong_an" | "tai_chinh" | "y_te" | "nong_nghiep" | "xay_dung";

export function suggestLegalBases(type: CampaignType, sector: SectorId): string[] {
  const base = [
    "Luật TĐKT 2022",
    "NĐ 152/2025/NĐ-CP",
    "TT 15/2025/TT-BNV",
  ];

  const sectorExtra: Partial<Record<SectorId, string[]>> = {
    giao_duc:  ["TT 07/2026/TT-BGDĐT"],
    cong_an:   ["TT 22/2025/TT-BCA"],
    tai_chinh: ["TT 118/2025/TT-BTC", "TT 28/2025/TT-BTC"],
  };

  const typeExtra: Partial<Record<CampaignType, string[]>> = {
    toan_quoc: ["NĐ 152/2025/NĐ-CP Chương III"],
    cap_bo:    ["NĐ 152/2025/NĐ-CP Chương IV"],
    toan_tinh: ["NĐ 152/2025/NĐ-CP Chương IV"],
    cap_so:    ["TT 15/2025/TT-BNV Phần II"],
    cap_huyen: ["TT 15/2025/TT-BNV Phần III"],
    co_so:     ["TT 15/2025/TT-BNV Phần IV"],
  };

  const combined = [
    ...base,
    ...(sectorExtra[sector] ?? []),
    ...(typeExtra[type] ?? []),
  ];

  // deduplicate
  return [...new Set(combined)];
}
