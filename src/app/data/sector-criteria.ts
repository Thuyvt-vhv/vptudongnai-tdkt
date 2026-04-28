/* ═══════════════════════════════════════════════════════════════════
   SECTOR CRITERIA — Bộ tiêu chí chấm điểm theo ngành/lĩnh vực
   Căn cứ: TT 07/2026/TT-BGDĐT, TT 22/2025/TT-BCA,
           TT 118/2025/TT-BTC, TT 28/2025/TT-BTC, NĐ 152/2025/NĐ-CP
═══════════════════════════════════════════════════════════════════ */

export type SectorId =
  | "chung"
  | "giao_duc"
  | "cong_an"
  | "tai_chinh"
  | "y_te"
  | "nong_nghiep"
  | "xay_dung";

export const SECTOR_LABELS: Record<SectorId, string> = {
  chung:       "Chung (tất cả lĩnh vực)",
  giao_duc:    "Giáo dục & Đào tạo",
  cong_an:     "Công an / An ninh",
  tai_chinh:   "Tài chính / Ngân sách",
  y_te:        "Y tế",
  nong_nghiep: "Nông nghiệp & Phát triển nông thôn",
  xay_dung:    "Xây dựng & Đô thị",
};

export interface SectorScoreCriteria {
  id: string;
  name: string;
  maxScore: number;
  canCu: string;
  mota: string;
  sector: SectorId;
  required: boolean;
}

/* ── CHUNG — dùng khi không xác định ngành cụ thể ─────────────── */
const CRITERIA_CHUNG: SectorScoreCriteria[] = [
  {
    id: "c1",
    name: "Hoàn thành nhiệm vụ chuyên môn",
    maxScore: 40,
    canCu: "Điều 10 NĐ 152/2025/NĐ-CP",
    mota: "Đánh giá mức độ hoàn thành nhiệm vụ được giao trong năm, chất lượng và tiến độ công việc.",
    sector: "chung",
    required: true,
  },
  {
    id: "c2",
    name: "Phong trào thi đua nội bộ",
    maxScore: 20,
    canCu: "Điều 12 Luật TĐKT 2022",
    mota: "Số lượng và chất lượng phong trào thi đua được phát động, tỷ lệ tham gia.",
    sector: "chung",
    required: true,
  },
  {
    id: "c3",
    name: "Sáng kiến & cải tiến quy trình",
    maxScore: 20,
    canCu: "Luật TĐKT 2022 Điều 22 khoản 2",
    mota: "Số lượng sáng kiến được công nhận và áp dụng thực tế, giá trị mang lại.",
    sector: "chung",
    required: true,
  },
  {
    id: "c4",
    name: "Đạo đức, lối sống, tác phong",
    maxScore: 10,
    canCu: "Điều 20 Luật cán bộ công chức 2008 (sửa đổi 2019)",
    mota: "Đánh giá phẩm chất đạo đức, không vi phạm kỷ luật, lối sống lành mạnh.",
    sector: "chung",
    required: true,
  },
  {
    id: "c5",
    name: "Công tác Đảng & đoàn thể",
    maxScore: 10,
    canCu: "Quy định số 144-QĐ/TW của Ban Chấp hành TW",
    mota: "Tham gia tích cực công tác Đảng, đoàn thanh niên, công đoàn.",
    sector: "chung",
    required: false,
  },
];

/* ── GIÁO DỤC — theo TT 07/2026/TT-BGDĐT ─────────────────────── */
const CRITERIA_GIAO_DUC: SectorScoreCriteria[] = [
  {
    id: "gd1",
    name: "Chất lượng giảng dạy",
    maxScore: 35,
    canCu: "Điều 5 khoản 2, TT 07/2026/TT-BGDĐT",
    mota: "Chất lượng và hiệu quả hoạt động giảng dạy, kết quả đánh giá của học sinh/sinh viên.",
    sector: "giao_duc",
    required: true,
  },
  {
    id: "gd2",
    name: "Đổi mới phương pháp dạy học",
    maxScore: 25,
    canCu: "Điều 5 khoản 3, TT 07/2026/TT-BGDĐT",
    mota: "Ứng dụng CNTT, đổi mới phương pháp giảng dạy tích cực, số lượng sáng kiến GD.",
    sector: "giao_duc",
    required: true,
  },
  {
    id: "gd3",
    name: "Kết quả học sinh / học viên",
    maxScore: 20,
    canCu: "Điều 5 khoản 4, TT 07/2026/TT-BGDĐT",
    mota: "Tỷ lệ học sinh đạt loại giỏi, khá; tỷ lệ đỗ đại học; giải thưởng thi học sinh giỏi.",
    sector: "giao_duc",
    required: true,
  },
  {
    id: "gd4",
    name: "Đạo đức nhà giáo",
    maxScore: 10,
    canCu: "Điều 5 khoản 5, TT 07/2026/TT-BGDĐT",
    mota: "Chuẩn mực đạo đức nhà giáo, không vi phạm quy chế chuyên môn.",
    sector: "giao_duc",
    required: true,
  },
  {
    id: "gd5",
    name: "Công tác Đảng & đoàn thể trong trường",
    maxScore: 10,
    canCu: "Quy định TW Đảng và TT 07/2026/TT-BGDĐT",
    mota: "Tham gia công đoàn giáo dục, Đoàn thanh niên, các hoạt động xã hội.",
    sector: "giao_duc",
    required: false,
  },
];

/* ── CÔNG AN — theo TT 22/2025/TT-BCA ────────────────────────── */
const CRITERIA_CONG_AN: SectorScoreCriteria[] = [
  {
    id: "ca1",
    name: "Hoàn thành nhiệm vụ chiến đấu",
    maxScore: 45,
    canCu: "Điều 4, TT 22/2025/TT-BCA",
    mota: "Mức độ hoàn thành nhiệm vụ giữ gìn an ninh trật tự, kết quả phá án, xử lý tội phạm.",
    sector: "cong_an",
    required: true,
  },
  {
    id: "ca2",
    name: "Phòng chống tội phạm",
    maxScore: 25,
    canCu: "Điều 5, TT 22/2025/TT-BCA",
    mota: "Kết quả công tác phòng ngừa, điều tra, khám phá các loại tội phạm.",
    sector: "cong_an",
    required: true,
  },
  {
    id: "ca3",
    name: "Kỷ luật và điều lệnh",
    maxScore: 20,
    canCu: "Điều 6, TT 22/2025/TT-BCA",
    mota: "Chấp hành kỷ luật Công an nhân dân, thực hiện điều lệnh, không vi phạm pháp luật.",
    sector: "cong_an",
    required: true,
  },
  {
    id: "ca4",
    name: "Công tác chính trị tư tưởng",
    maxScore: 10,
    canCu: "Điều 7, TT 22/2025/TT-BCA",
    mota: "Tham gia học tập chính trị, giữ vững lập trường, tư tưởng vững vàng.",
    sector: "cong_an",
    required: false,
  },
];

/* ── TÀI CHÍNH — theo TT 118/2025/TT-BTC + TT 28/2025/TT-BTC ── */
const CRITERIA_TAI_CHINH: SectorScoreCriteria[] = [
  {
    id: "tc1",
    name: "Hoàn thành dự toán ngân sách",
    maxScore: 40,
    canCu: "Điều 3 khoản 1, TT 118/2025/TT-BTC",
    mota: "Mức độ hoàn thành thu, chi ngân sách theo dự toán; tiết kiệm chi thường xuyên.",
    sector: "tai_chinh",
    required: true,
  },
  {
    id: "tc2",
    name: "Quản lý tài chính công",
    maxScore: 25,
    canCu: "Điều 4, TT 28/2025/TT-BTC",
    mota: "Quản lý, sử dụng tài sản công, không thất thoát, đúng mục đích, đúng quy định.",
    sector: "tai_chinh",
    required: true,
  },
  {
    id: "tc3",
    name: "Cải cách hành chính tài chính",
    maxScore: 20,
    canCu: "Điều 5, TT 118/2025/TT-BTC",
    mota: "Đơn giản hóa thủ tục, ứng dụng CNTT trong quản lý tài chính, số hóa hồ sơ.",
    sector: "tai_chinh",
    required: true,
  },
  {
    id: "tc4",
    name: "Đạo đức nghề nghiệp",
    maxScore: 15,
    canCu: "Điều 6 khoản 2, TT 118/2025/TT-BTC",
    mota: "Liêm chính, trung thực trong hoạt động tài chính; không tham nhũng, tiêu cực.",
    sector: "tai_chinh",
    required: true,
  },
];

/* ── Y TẾ ──────────────────────────────────────────────────────── */
const CRITERIA_Y_TE: SectorScoreCriteria[] = [
  {
    id: "yt1",
    name: "Chất lượng khám chữa bệnh",
    maxScore: 40,
    canCu: "Luật TĐKT 2022, Điều 22; Luật Khám bệnh, chữa bệnh 2023",
    mota: "Chất lượng dịch vụ khám chữa bệnh, tỷ lệ điều trị thành công, không có sự cố y khoa.",
    sector: "y_te",
    required: true,
  },
  {
    id: "yt2",
    name: "An toàn người bệnh",
    maxScore: 25,
    canCu: "Luật TĐKT 2022; Thông tư 43/2018/TT-BYT",
    mota: "Tuân thủ quy trình an toàn người bệnh, không để xảy ra sự cố nghiêm trọng.",
    sector: "y_te",
    required: true,
  },
  {
    id: "yt3",
    name: "Tinh thần phục vụ người bệnh",
    maxScore: 20,
    canCu: "Luật TĐKT 2022; Chỉ thị 05-CT/TW",
    mota: "Thái độ phục vụ, hài lòng bệnh nhân, không để bệnh nhân khiếu nại có cơ sở.",
    sector: "y_te",
    required: true,
  },
  {
    id: "yt4",
    name: "Đạo đức y khoa",
    maxScore: 15,
    canCu: "Luật TĐKT 2022; Quy tắc đạo đức nghề nghiệp bác sĩ",
    mota: "Tuân thủ y đức, không lạm dụng xét nghiệm, không vụ lợi trong hành nghề.",
    sector: "y_te",
    required: true,
  },
];

/* ── NÔNG NGHIỆP ─────────────────────────────────────────────── */
const CRITERIA_NONG_NGHIEP: SectorScoreCriteria[] = [
  {
    id: "nn1",
    name: "Sản xuất nông nghiệp và kinh tế nông thôn",
    maxScore: 40,
    canCu: "Luật TĐKT 2022; NĐ 152/2025/NĐ-CP",
    mota: "Kết quả sản xuất, năng suất cây trồng vật nuôi, thu nhập bình quân nông dân.",
    sector: "nong_nghiep",
    required: true,
  },
  {
    id: "nn2",
    name: "Xây dựng nông thôn mới",
    maxScore: 25,
    canCu: "Luật TĐKT 2022; Quyết định 1600/QĐ-TTg",
    mota: "Đóng góp vào tiêu chí nông thôn mới, tỷ lệ xã đạt chuẩn.",
    sector: "nong_nghiep",
    required: true,
  },
  {
    id: "nn3",
    name: "Ứng dụng KHCN trong nông nghiệp",
    maxScore: 20,
    canCu: "Luật TĐKT 2022 Điều 22 khoản 2",
    mota: "Sáng kiến, mô hình ứng dụng KHCN, nông nghiệp thông minh, hữu cơ.",
    sector: "nong_nghiep",
    required: false,
  },
  {
    id: "nn4",
    name: "Bảo vệ môi trường nông thôn",
    maxScore: 15,
    canCu: "Luật TĐKT 2022; Luật Bảo vệ môi trường 2020",
    mota: "Xử lý rác thải nông nghiệp, bảo vệ nguồn nước, không đốt rơm rạ.",
    sector: "nong_nghiep",
    required: false,
  },
];

/* ── XÂY DỰNG ───────────────────────────────────────────────── */
const CRITERIA_XAY_DUNG: SectorScoreCriteria[] = [
  {
    id: "xd1",
    name: "Chất lượng và tiến độ công trình",
    maxScore: 40,
    canCu: "Luật TĐKT 2022; Luật Xây dựng 2014 (sửa đổi 2020)",
    mota: "Hoàn thành công trình đúng tiến độ, đảm bảo chất lượng, không có sự cố.",
    sector: "xay_dung",
    required: true,
  },
  {
    id: "xd2",
    name: "An toàn lao động trên công trường",
    maxScore: 30,
    canCu: "Luật TĐKT 2022; Luật An toàn vệ sinh lao động 2015",
    mota: "Không để xảy ra tai nạn lao động, tuân thủ quy định an toàn.",
    sector: "xay_dung",
    required: true,
  },
  {
    id: "xd3",
    name: "Sáng kiến kỹ thuật xây dựng",
    maxScore: 20,
    canCu: "Luật TĐKT 2022 Điều 22 khoản 2",
    mota: "Giải pháp kỹ thuật mới, tiết kiệm vật tư, nâng cao hiệu quả thi công.",
    sector: "xay_dung",
    required: false,
  },
  {
    id: "xd4",
    name: "Bảo vệ môi trường công trường",
    maxScore: 10,
    canCu: "Luật TĐKT 2022; NĐ 08/2022/NĐ-CP",
    mota: "Kiểm soát bụi, tiếng ồn, xử lý chất thải xây dựng đúng quy định.",
    sector: "xay_dung",
    required: false,
  },
];

/* ── MAP TỔNG HỢP ────────────────────────────────────────────── */
export const CRITERIA_BY_SECTOR: Record<SectorId, SectorScoreCriteria[]> = {
  chung:       CRITERIA_CHUNG,
  giao_duc:    CRITERIA_GIAO_DUC,
  cong_an:     CRITERIA_CONG_AN,
  tai_chinh:   CRITERIA_TAI_CHINH,
  y_te:        CRITERIA_Y_TE,
  nong_nghiep: CRITERIA_NONG_NGHIEP,
  xay_dung:    CRITERIA_XAY_DUNG,
};

export function getCriteriaForSector(sector: SectorId): SectorScoreCriteria[] {
  return CRITERIA_BY_SECTOR[sector] ?? CRITERIA_BY_SECTOR.chung;
}

export function getTotalMaxScore(sector: SectorId): number {
  return getCriteriaForSector(sector).reduce((s, c) => s + c.maxScore, 0);
}

export function getCriteriaCanCuList(sector: SectorId): string[] {
  const docs = [...new Set(getCriteriaForSector(sector).map(c => {
    const parts = c.canCu.split(",");
    return parts[parts.length - 1].trim();
  }))];
  return docs;
}
