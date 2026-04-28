import { useState, useRef } from "react";
import {
  Trophy, Calendar, Users, Plus, ChevronRight, CheckCircle2, Clock,
  AlertCircle, Star, BarChart2, FileText, Shield, ChevronDown,
  ChevronUp, ArrowRight, Download, PenLine, CheckCheck, Megaphone,
  BookOpen, Scale, Lock, ClipboardCheck, Gavel, Globe, Archive,
  Search, User, Info, Timer, Flag, Medal, ChevronLeft, Send,
  TrendingUp, Target, Building2, Layers, Hash,
  ThumbsUp, ThumbsDown, Clipboard, Award, Printer,
  MessageSquare, Eye, FileCheck, Vote, Pen, RotateCcw,
  ListChecks, Sparkles, CircleDot, Stamp, X, Check,
  ClipboardList, BarChart3,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";
import { DsButton } from "./ds-button";
import type { SectorId } from "@/app/data/sector-criteria";
import { getCriteriaForSector, SECTOR_LABELS } from "@/app/data/sector-criteria";
import type { MinhChung, HoSoRequirement } from "@/app/data/ho-so-config";
import { getRequirementsForSubject, createEmptyMinhChung, validateMinhChung, NHOM_HO_SO_LABELS } from "@/app/data/ho-so-config";
import { detectExpiredDocs, getReplacementDoc, suggestLegalBases } from "@/app/data/legal-registry";
import { REWARD_CATALOG, getRewardByName, formatTienThuong, getNguonKinhPhiLabel } from "@/app/data/reward-catalog";
import type { NguonKinhPhi } from "@/app/data/reward-catalog";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */
type CampaignState =
  | "draft" | "submitted" | "approved" | "published"
  | "active" | "submission_closed"
  | "unit_review" | "council_review" | "final_approval"
  | "decision_issued" | "public" | "archived";

type CampaignType = "toan_quoc" | "cap_bo" | "toan_tinh" | "cap_so" | "cap_huyen" | "co_so";
type SubjectType  = "ca_nhan" | "tap_the" | "ca_hai";

interface ScoreCriteria { id: string; name: string; maxScore: number; canCu: string; mota: string; }
interface UnitScore     { unitId: string; unitName: string; scores: Record<string,number>; total: number; rank: number; status: "da_cham"|"chua_cham"; ghiChu: string; }

interface Participant {
  id: string; name: string; type: "ca_nhan"|"tap_the"; donVi: string;
  position?: string; hoSoStatus: "chua_nop"|"da_nop"|"da_duyet"|"tra_lai";
  nopLuc: string; score?: number; rank?: number;
  // Phase 0 — hồ sơ đầy đủ
  minhChung?: MinhChung[];
  baoHoaThanhTich?: string;
  hinhThucDeNghi?: string;
  tienThuongDuKien?: number;
  hoSoHopLe?: boolean;
  lyDoTraLai?: string;
  nguoiXuLy?: string;
}

interface CouncilMinutes {
  id: string; soHieu: string; ngayHop: string; diaDiem: string;
  tongSoThanhVien: number; soMatThiet: number;
  chuToa: string; thuKy: string;
  noiDungBanHanh: string;
  ketQua: { tongHoSo: number; soThongQua: number; soKhongThongQua: number; soHoanLai: number; };
  ghiChu: string; canCuPhapLy: string[]; signed: boolean;
}

interface TransitionWarning {
  level: "error" | "warning" | "info";
  message: string;
  canProceed: boolean;
}

interface AuditEntry    { id: string; action: string; actor: string; role: string; time: string; detail: string; state: CampaignState; }

interface Campaign {
  id: string; code: string; name: string;
  type: CampaignType; subjectType: SubjectType;
  state: CampaignState; level: string;
  mucTieu: string; doiTuong: string;
  tieuChi: ScoreCriteria[];
  ngayBatDau: string; ngayKetThuc: string; ngayNopHoSo: string;
  period: string; leader: string; donViPhuTrach: string;
  awards: string[]; totalUnits: number; joinedUnits: number;
  participants: Participant[]; unitScores: UnitScore[];
  auditLog: AuditEntry[];
  canCuPhapLy: string[]; ghiChu: string; urgent: boolean;
  creatorId: number;
  // Phase 0 — fields mới
  sector?: SectorId;
  rewardForms?: { formId: string; soLuong: number }[];
  tongKinhPhi?: number;
  nguonKinhPhi?: string;
  quorumRequired?: number;
  quorumActual?: number;
  baoHoaThanhTich?: string;
  taiLieuTongKet?: string;
  minutes?: CouncilMinutes;
}

/* ═══════════════════════════════════════════════════════════════════
   STATE CONFIG
═══════════════════════════════════════════════════════════════════ */
const STATE_CFG: Record<CampaignState, {
  label: string; short: string;
  color: string; bg: string; border: string;
  phase: 0|1|2|3; icon: typeof Clock; canCu: string;
}> = {
  draft:             { label:"Soạn thảo",           short:"Nháp",       color:"#5a5040", bg:"#eef2f8", border:"#d9d1bd", phase:0, icon:PenLine,       canCu:"Nội bộ" },
  submitted:         { label:"Trình phê duyệt",      short:"Đã trình",   color:"#0e7490", bg:"#e0f2fe", border:"#67e8f9", phase:0, icon:Send,           canCu:"NĐ 152/2025/NĐ-CP" },
  approved:          { label:"Đã phê duyệt",         short:"Duyệt",      color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd", phase:0, icon:CheckCircle2,   canCu:"Điều 18 Luật TĐKT" },
  published:         { label:"Ban hành / Công bố",   short:"Công bố",    color:"#4338ca", bg:"#e0e7ff", border:"#a5b4fc", phase:0, icon:Megaphone,      canCu:"TT 15/2025/TT-BNV" },
  active:            { label:"Đang triển khai",       short:"Triển khai", color:"#166534", bg:"#dcfce7", border:"#86efac", phase:1, icon:Flag,           canCu:"Luật TĐKT 2022" },
  submission_closed: { label:"Hết hạn nộp hồ sơ",   short:"Đóng nộp",   color:"#b45309", bg:"#fef3c7", border:"#fcd34d", phase:1, icon:Lock,           canCu:"Theo kế hoạch" },
  unit_review:       { label:"Thẩm định cấp cơ sở", short:"Thẩm định",  color:"#c2410c", bg:"#fff7ed", border:"#fdba74", phase:2, icon:ClipboardCheck, canCu:"Khoản 2 Điều 55" },
  council_review:    { label:"Hội đồng xét duyệt",  short:"HĐ xét",     color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd", phase:2, icon:Gavel,          canCu:"Điều 56 Luật TĐKT" },
  final_approval:    { label:"Trình lãnh đạo duyệt",short:"Trình ký",    color:"#9f1239", bg:"#fee2e2", border:"#fca5a5", phase:2, icon:CheckCheck,     canCu:"Điều 57 Luật TĐKT" },
  decision_issued:   { label:"Đã ban hành QĐ",       short:"Ban QĐ",     color:"#0f7a3e", bg:"#d1fae5", border:"#6ee7b7", phase:3, icon:FileText,       canCu:"TT 15/2025/TT-BNV" },
  public:            { label:"Công bố",               short:"Công bố",    color:"#0e7490", bg:"#cffafe", border:"#67e8f9", phase:3, icon:Globe,          canCu:"Điều 44 NĐ 152/2025/NĐ-CP" },
  archived:          { label:"Tổng kết",              short:"Tổng kết",   color:"#374151", bg:"#f3f4f6", border:"#d1d5db", phase:3, icon:Archive,        canCu:"NĐ 30/2020/NĐ-CP" },
};

const STATE_ORDER: CampaignState[] = [
  "draft","submitted","approved","published",
  "active","submission_closed",
  "unit_review","council_review","final_approval",
  "decision_issued","public","archived",
];

const PHASES = [
  { label:"Phát động",          color:"#1C5FBE", darkColor:"#0d3d8a", states:["draft","submitted","approved","published"] as CampaignState[] },
  { label:"Triển khai",         color:"#166534", darkColor:"#0a3d20", states:["active","submission_closed"] as CampaignState[] },
  { label:"Xét duyệt",          color:"#7c3aed", darkColor:"#4c1d95", states:["unit_review","council_review","final_approval"] as CampaignState[] },
  { label:"Tổng kết", color:"#b45309", darkColor:"#6b2d04", states:["decision_issued","public","archived"] as CampaignState[] },
];

const TYPE_LABELS: Record<CampaignType,string> = {
  toan_quoc:"Toàn quốc", cap_bo:"Cấp Bộ", toan_tinh:"Toàn tỉnh",
  cap_so:"Cấp Sở/Ngành", cap_huyen:"Cấp Huyện", co_so:"Cơ sở",
};
const SUBJECT_LABELS: Record<SubjectType,string> = {
  ca_nhan:"Cá nhân", tap_the:"Tập thể", ca_hai:"Cá nhân & Tập thể",
};

const DEFAULT_CRITERIA: ScoreCriteria[] = [
  { id:"c1", name:"Hoàn thành nhiệm vụ chuyên môn",   maxScore:40, canCu:"Điều 10 NĐ 152/2025/NĐ-CP",  mota:"Đánh giá mức độ hoàn thành nhiệm vụ được giao trong năm." },
  { id:"c2", name:"Phong trào thi đua nội bộ",         maxScore:20, canCu:"Điều 12 Luật TĐKT",   mota:"Số lượng và chất lượng phong trào thi đua được phát động." },
  { id:"c3", name:"Sáng kiến & cải tiến quy trình",    maxScore:20, canCu:"Luật TĐKT 2022",       mota:"Số lượng sáng kiến được công nhận và áp dụng thực tế." },
  { id:"c4", name:"Đạo đức, lối sống, tác phong",      maxScore:10, canCu:"Điều 20 Luật cán bộ", mota:"Đánh giá phẩm chất đạo đức, không vi phạm kỷ luật." },
  { id:"c5", name:"Công tác Đảng & đoàn thể",         maxScore:10, canCu:"Quy định TW Đảng",    mota:"Tham gia tích cực công tác Đảng, đoàn thanh niên, công đoàn." },
];

/* ═════════════════════════════���═════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════════ */
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id:"PT-001", code:"PT-2026-001", urgent:true,
    name:"Thi đua Chào mừng 50 năm Giải phóng miền Nam",
    type:"toan_tinh", subjectType:"ca_hai", state:"active", level:"Toàn tỉnh",
    mucTieu:"Phát huy truyền thống cách mạng hào hùng, thi đua lập thành tích xuất sắc chào mừng kỷ niệm 50 năm Ngày giải phóng hoàn toàn miền Nam, thống nhất đất nước (30/4/1975 – 30/4/2025). Góp phần xây dựng tỉnh Đồng Nai phát triển toàn diện, bền vững.",
    doiTuong:"Tất cả cán bộ, công chức, viên chức và người lao động toàn tỉnh Đồng Nai. Ưu tiên các tập thể và cá nhân có thành tích xuất sắc trong các lĩnh vực kinh tế, văn hóa, giáo dục, y tế, an ninh quốc phòng.",
    tieuChi:DEFAULT_CRITERIA,
    ngayBatDau:"2026-01-01", ngayKetThuc:"2026-04-30", ngayNopHoSo:"2026-04-20",
    period:"01/01/2026 – 30/04/2026", leader:"Lê Hoàng Nam", donViPhuTrach:"Văn phòng UBND Tỉnh",
    awards:["Cờ thi đua Chính phủ","Bằng khen Thủ tướng","Bằng khen Chủ tịch UBND Tỉnh","Chiến sĩ thi đua Toàn quốc"],
    totalUnits:121, joinedUnits:117,
    canCuPhapLy:["Luật TĐKT 2022","Khoản 1 Điều 23 NĐ 152/2025/NĐ-CP","TT 15/2025/TT-BNV"],
    ghiChu:"Ưu tiên cao. Hạn nộp hồ sơ 20/04/2026.", creatorId: 5,
    participants:[
      {id:"p1",name:"Lê Thị Thanh Xuân",type:"ca_nhan",donVi:"Sở GD&ĐT",position:"Phó Giám đốc",hoSoStatus:"da_duyet",nopLuc:"2026-04-10",score:94,rank:1},
      {id:"p2",name:"Phòng CSGT CA Tỉnh",type:"tap_the",donVi:"Công an Tỉnh",hoSoStatus:"da_duyet",nopLuc:"2026-04-12",score:91,rank:2},
      {id:"p3",name:"Nguyễn Phú Trọng Khoa",type:"ca_nhan",donVi:"BV Đa khoa Đồng Nai",position:"Bác sĩ CKI",hoSoStatus:"da_nop",nopLuc:"2026-04-15",score:88,rank:3},
      {id:"p4",name:"Chi bộ Sở Tài chính",type:"tap_the",donVi:"Sở Tài chính",hoSoStatus:"da_nop",nopLuc:"2026-04-16",score:85,rank:4},
      {id:"p5",name:"Trần Thị Kim Oanh",type:"ca_nhan",donVi:"THPT Lương Thế Vinh",position:"Giáo viên",hoSoStatus:"tra_lai",nopLuc:"2026-04-17"},
      {id:"p6",name:"Sở Kế hoạch & Đầu tư",type:"tap_the",donVi:"UBND Tỉnh",hoSoStatus:"chua_nop",nopLuc:""},
    ],
    unitScores:[
      {unitId:"u1",unitName:"Sở GD&ĐT",scores:{c1:38,c2:18,c3:18,c4:10,c5:10},total:94,rank:1,status:"da_cham",ghiChu:""},
      {unitId:"u2",unitName:"Công an Tỉnh",scores:{c1:37,c2:17,c3:17,c4:10,c5:10},total:91,rank:2,status:"da_cham",ghiChu:""},
      {unitId:"u3",unitName:"BV Đa khoa ĐN",scores:{c1:35,c2:16,c3:17,c4:10,c5:10},total:88,rank:3,status:"da_cham",ghiChu:""},
      {unitId:"u4",unitName:"Sở Tài chính",scores:{c1:34,c2:15,c3:16,c4:10,c5:10},total:85,rank:4,status:"da_cham",ghiChu:""},
      {unitId:"u5",unitName:"Sở KHCN",scores:{c1:30,c2:14,c3:15,c4:9,c5:9},total:77,rank:5,status:"da_cham",ghiChu:""},
      {unitId:"u6",unitName:"Ban QLKCN",scores:{c1:0,c2:0,c3:0,c4:0,c5:0},total:0,rank:0,status:"chua_cham",ghiChu:"Đơn vị chưa nộp hồ sơ"},
    ],
    auditLog:[
      {id:"a1",action:"Tạo phong trào",actor:"Võ Minh Tuấn",role:"Chuyên viên",time:"05/12/2025",detail:"Khởi tạo kế hoạch phong trào thi đua chào mừng 50 năm 30/4",state:"draft"},
      {id:"a2",action:"Trình phê duyệt",actor:"Võ Minh Tuấn",role:"Chuyên viên",time:"10/12/2025",detail:"Trình Trưởng phòng TĐKT phê duyệt nội dung kế hoạch phát động",state:"submitted"},
      {id:"a3",action:"Phê duyệt phát động",actor:"Lê Hoàng Nam",role:"Trưởng phòng",time:"15/12/2025",detail:"Đồng ý phát động. Nội dung đúng quy định, đủ căn cứ pháp lý.",state:"approved"},
      {id:"a4",action:"Ban hành Quyết định",actor:"Nguyễn Văn Thắng",role:"Lãnh đạo VP",time:"01/01/2026",detail:"Ký ban hành Quyết định số 01/QĐ-UBND phát động phong trào thi đua",state:"published"},
      {id:"a5",action:"Khởi động triển khai",actor:"Hệ thống",role:"Auto",time:"01/01/2026",detail:"Phong trào chính thức bắt đầu, mở cổng tiếp nhận hồ sơ tham gia",state:"active"},
    ],
  },
  {
    id:"PT-002", code:"PT-2026-002", urgent:false,
    name:"Đổi mới sáng tạo trong dạy và học 2025–2026",
    type:"cap_so", subjectType:"ca_hai", state:"council_review", level:"Cấp Bộ/Sở",
    mucTieu:"Khuyến khích giáo viên, học sinh ứng dụng CNTT, đổi mới phương pháp giảng dạy, tạo bước chuyển biến mạnh mẽ trong giáo dục – đào tạo toàn tỉnh.",
    doiTuong:"Giáo viên, giảng viên, học sinh, sinh viên trong hệ thống giáo dục tỉnh Đồng Nai.",
    tieuChi:DEFAULT_CRITERIA,
    ngayBatDau:"2025-09-01", ngayKetThuc:"2026-05-31", ngayNopHoSo:"2026-05-15",
    period:"01/09/2025 – 31/05/2026", leader:"Trưởng phòng TĐKT – Sở GD&ĐT", donViPhuTrach:"Sở GD&ĐT",
    awards:["Chiến sĩ thi đua cấp Bộ","Bằng khen Bộ GD&ĐT","Bằng khen Giám đốc Sở"],
    totalUnits:28, joinedUnits:28,
    canCuPhapLy:["Điều 56 Luật TĐKT 2022","Điều 38 NĐ 152/2025/NĐ-CP","TT 15/2025/TT-BNV","TT 07/2026/TT-BGDĐT"],
    ghiChu:"Đang họp Hội đồng xét duyệt. Dự kiến hoàn thành 15/05/2026.", creatorId: 5,
    participants:[
      {id:"p7",name:"Đinh Công Sơn",type:"ca_nhan",donVi:"THPT Chuyên LTV",position:"GV CNTT",hoSoStatus:"da_duyet",nopLuc:"2026-05-02",score:96,rank:1},
      {id:"p8",name:"Tổ Toán – THPT LQĐ",type:"tap_the",donVi:"THPT Lê Quý Đôn",hoSoStatus:"da_duyet",nopLuc:"2026-05-03",score:92,rank:2},
    ],
    unitScores:[
      {unitId:"u7",unitName:"THPT Chuyên LTV",scores:{c1:38,c2:19,c3:19,c4:10,c5:10},total:96,rank:1,status:"da_cham",ghiChu:""},
      {unitId:"u8",unitName:"THPT Lê Quý Đôn",scores:{c1:36,c2:18,c3:18,c4:10,c5:10},total:92,rank:2,status:"da_cham",ghiChu:""},
      {unitId:"u9",unitName:"THCS Nguyễn Du",scores:{c1:34,c2:16,c3:15,c4:9,c5:9},total:83,rank:3,status:"da_cham",ghiChu:""},
    ],
    auditLog:[
      {id:"b1",action:"Tạo phong trào",actor:"Phòng TĐKT Sở GD",role:"Chuyên viên",time:"15/08/2025",detail:"Khởi tạo kế hoạch phong trào năm học 2025–2026",state:"draft"},
      {id:"b2",action:"Ban hành QĐ phát động",actor:"Giám đốc Sở GD",role:"Lãnh đạo",time:"01/09/2025",detail:"Ký QĐ 42/QĐ-SGDĐT phát động phong trào",state:"published"},
      {id:"b3",action:"Đóng nhận hồ sơ",actor:"Hệ thống",role:"Auto",time:"15/05/2026",detail:"Hết hạn nộp hồ sơ tham gia phong trào",state:"submission_closed"},
      {id:"b4",action:"Bắt đầu thẩm định cơ sở",actor:"Lê Hoàng Nam",role:"Trưởng phòng",time:"16/05/2026",detail:"Mở vòng thẩm định cấp cơ sở, giao chuyên viên phụ trách",state:"unit_review"},
      {id:"b5",action:"Họp Hội đồng xét duyệt",actor:"Lê Hoàng Nam",role:"Trưởng phòng",time:"20/05/2026",detail:"Hội đồng TĐKT họp phiên xét duyệt kết quả cuối",state:"council_review"},
    ],
  },
  {
    id:"PT-003", code:"PT-2026-003", urgent:false,
    name:"An toàn giao thông – Vì hạnh phúc mọi nhà",
    type:"toan_tinh", subjectType:"tap_the", state:"decision_issued", level:"Cấp tỉnh",
    mucTieu:"Giảm thiểu tai nạn giao thông, xây dựng văn hóa giao thông an toàn trong cộng đồng tỉnh Đồng Nai.",
    doiTuong:"Lực lượng CSGT, đội kiểm tra ATGT các cấp tỉnh Đồng Nai.",
    tieuChi:DEFAULT_CRITERIA,
    ngayBatDau:"2026-01-01", ngayKetThuc:"2026-03-31", ngayNopHoSo:"2026-03-20",
    period:"01/01/2026 – 31/03/2026", leader:"Đại tá Trần Văn Bình", donViPhuTrach:"Công an Tỉnh",
    awards:["Cờ thi đua Chính phủ","Bằng khen Bộ CA","Giấy khen Giám đốc CA"],
    totalUnits:15, joinedUnits:15,
    canCuPhapLy:["Luật TĐKT 2022","NĐ 152/2025/NĐ-CP","TT 15/2025/TT-BNV","TT 22/2025/TT-BCA"],
    ghiChu:"QĐ số 15/QĐ-UBND đã ký ngày 20/04/2026.", creatorId: 1,
    participants:[
      {id:"p9",name:"Phòng CSGT CA Tỉnh",type:"tap_the",donVi:"CA Tỉnh",hoSoStatus:"da_duyet",nopLuc:"2026-03-18",score:97,rank:1},
      {id:"p10",name:"Đội CSND – CA TP. Biên Hòa",type:"tap_the",donVi:"CA TP. Biên Hòa",hoSoStatus:"da_duyet",nopLuc:"2026-03-19",score:93,rank:2},
    ],
    unitScores:[
      {unitId:"u10",unitName:"CA Tỉnh (CSGT)",scores:{c1:39,c2:19,c3:19,c4:10,c5:10},total:97,rank:1,status:"da_cham",ghiChu:""},
      {unitId:"u11",unitName:"CA TP. Biên Hòa",scores:{c1:37,c2:18,c3:18,c4:10,c5:10},total:93,rank:2,status:"da_cham",ghiChu:""},
    ],
    auditLog:[
      {id:"c1",action:"Ban hành QĐ khen thưởng",actor:"Chủ tịch UBND Tỉnh",role:"Lãnh đạo VP",time:"20/04/2026",detail:"Ký Quyết định 15/QĐ-UBND khen thưởng các tập thể xuất sắc",state:"decision_issued"},
    ],
  },
  {
    id:"PT-004", code:"PT-2026-004", urgent:false,
    name:"Chuyển đổi số trong hành chính công 2026",
    type:"toan_tinh", subjectType:"ca_hai", state:"draft", level:"Toàn tỉnh",
    mucTieu:"Thúc đẩy chuyển đổi số, cải thiện chỉ số DTI cấp tỉnh.",
    doiTuong:"Cán bộ, công chức, viên chức tại các sở, ban, ngành, UBND các huyện.",
    tieuChi:DEFAULT_CRITERIA,
    ngayBatDau:"2026-05-01", ngayKetThuc:"2026-12-31", ngayNopHoSo:"2026-11-30",
    period:"01/05/2026 – 31/12/2026", leader:"Võ Minh Tuấn", donViPhuTrach:"Sở TT&TT",
    awards:["Cờ thi đua UBND Tỉnh","Bằng khen Chủ tịch UBND","Chiến sĩ thi đua cấp Tỉnh"],
    totalUnits:65, joinedUnits:0,
    canCuPhapLy:["Nghị quyết 52-NQ/TW","Điều 18 Luật TĐKT 2022","NĐ 152/2025/NĐ-CP","TT 15/2025/TT-BNV"],
    ghiChu:"Đang hoàn thiện tiêu chí, chờ trình lãnh đạo duyệt.", creatorId: 5,
    participants:[], unitScores:[],
    auditLog:[{id:"d1",action:"Tạo phong trào",actor:"Võ Minh Tuấn",role:"Chuyên viên",time:"22/04/2026",detail:"Khởi tạo kế hoạch phong trào CĐS 2026",state:"draft"}],
  },
  {
    id:"PT-005", code:"PT-2025-005", urgent:false,
    name:"Thi đua Xây dựng Đảng trong sạch vững mạnh",
    type:"toan_tinh", subjectType:"ca_hai", state:"archived", level:"Toàn tỉnh",
    mucTieu:"Xây dựng Đảng bộ tỉnh trong sạch, vững mạnh, nâng cao năng lực lãnh đạo.",
    doiTuong:"Toàn thể đảng viên, cán bộ, công chức trong hệ thống chính trị tỉnh Đồng Nai.",
    tieuChi:DEFAULT_CRITERIA,
    ngayBatDau:"2025-01-01", ngayKetThuc:"2025-12-31", ngayNopHoSo:"2025-11-30",
    period:"01/01/2025 – 31/12/2025", leader:"Tỉnh ủy Đồng Nai", donViPhuTrach:"Ban Tổ chức Tỉnh ủy",
    awards:["Cờ thi đua Chính phủ","Bằng khen TW Đảng","Bằng khen Tỉnh ủy"],
    totalUnits:121, joinedUnits:121,
    canCuPhapLy:["Luật TĐKT 2022","NĐ 30/2020/NĐ-CP"],
    ghiChu:"Đã lưu trữ. Hồ sơ đầy đủ.", creatorId: 5,
    participants:[], unitScores:[],
    auditLog:[{id:"e1",action:"Tổng kết phong trào",actor:"Hệ thống",role:"Auto",time:"31/01/2026",detail:"Hoàn tất tổng kết và lưu trữ toàn bộ hồ sơ phong trào năm 2025",state:"archived"}],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */
const today = new Date("2026-04-23");
function daysLeft(d: string) { return Math.max(0, Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000)); }
function fmtDate(s: string) { if (!s) return "–"; const [y,m,d] = s.split("-"); return `${d}/${m}/${y}`; }
function stateIndex(s: CampaignState) { return STATE_ORDER.indexOf(s); }
function getPhaseOf(s: CampaignState) { return PHASES.find(p => p.states.includes(s))!; }

function canTransition(user: LoginUser, c: Campaign): boolean {
  if (c.state === "archived") return false;
  // Lãnh đạo cấp cao luôn có quyền chuyển bước
  if (user.role === "lãnh đạo cấp cao") return true;
  // Quản trị hệ thống có quyền chuyển bước (thay thế khi LĐCC gặp sự cố)
  if (user.role === "quản trị hệ thống") return true;
  // Hội đồng TĐKT có quyền chuyển bước ở các giai đoạn thẩm định/xét duyệt
  if (user.role === "hội đồng") {
    const councilStates: CampaignState[] = ["submitted", "unit_review", "council_review"];
    return councilStates.includes(c.state);
  }
  // Người tạo phong trào có quyền chuyển bước (trừ các bước ký số cần thẩm quyền đặc biệt)
  if (user.id === c.creatorId) {
    const leaderOnly: CampaignState[] = ["approved", "final_approval", "decision_issued"];
    return !leaderOnly.includes(c.state);
  }
  return false;
}

function canReviewUnit(user: LoginUser, c: Campaign): boolean {
  if (c.state !== "unit_review") return false;
  return canTransition(user, c) || user.role === "lãnh đạo đơn vị";
}

// Các role chỉ được xem lịch sử, không chuyển bước
function isViewOnly(user: LoginUser, c: Campaign): boolean {
  return !canTransition(user, c) && (user.role === "lãnh đạo đơn vị" || user.role === "cá nhân");
}
function nextStateLabel(c: Campaign): string {
  const map: Partial<Record<CampaignState,string>> = {
    draft:"Trình phê duyệt", submitted:"Phê duyệt phát động", approved:"Ban hành & Công bố",
    published:"Bắt đầu triển khai", active:"Đóng nhận hồ sơ", submission_closed:"Mở thẩm định cơ sở",
    unit_review:"Chuyển Hội đồng xét", council_review:"Trình lãnh đạo duyệt",
    final_approval:"Ban hành Quyết định", decision_issued:"Công bố", public:"Tổng kết",
  };
  return map[c.state] ?? "";
}
function nextState(s: CampaignState): CampaignState {
  const i = STATE_ORDER.indexOf(s);
  return (i >= 0 && i < STATE_ORDER.length-1) ? STATE_ORDER[i+1] : s;
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 8 — SMART READINESS CHECKER
═══════════════════════════════════════════════════════════════════ */
interface ReadinessOpts {
  draftReady?: boolean;
  draftMissing?: number;
  allReviewed?: boolean;
  pendingCount?: number;
  approvedCount?: number;
  submittedCount?: number;
  allVoted?: boolean;
  yesVotes?: number;
  noVotes?: number;
  passThreshold?: number;
  quorumMet?: boolean;
  sigConfirmed?: boolean;
  minutesSigned?: boolean;
  joinPct?: number;
}

function checkTransitionReadiness(c: Campaign, opts: ReadinessOpts = {}): TransitionWarning[] {
  const warnings: TransitionWarning[] = [];
  const s = c.state;

  if (s === "draft") {
    if (!opts.draftReady) {
      warnings.push({ level:"error", message:`Còn ${opts.draftMissing ?? 0} mục chưa hoàn thiện trong checklist soạn thảo`, canProceed:false });
    } else {
      warnings.push({ level:"info", message:"Hồ sơ soạn thảo đầy đủ — sẵn sàng trình Hội đồng TĐKT", canProceed:true });
    }
  }

  if (s === "active") {
    const pct = opts.joinPct ?? 0;
    if (pct < 50) {
      warnings.push({ level:"warning", message:`Chỉ ${pct}% đơn vị đã đăng ký. Đóng sớm có thể bỏ sót nhiều đơn vị.`, canProceed:true });
    } else if (pct < 80) {
      warnings.push({ level:"info", message:`${pct}% đơn vị đã đăng ký. Cân nhắc chờ thêm trước khi đóng.`, canProceed:true });
    }
    if ((opts.submittedCount ?? 0) === 0) {
      warnings.push({ level:"warning", message:"Chưa có hồ sơ nào được nộp. Đóng sớm sẽ không có hồ sơ chuyển thẩm định.", canProceed:true });
    }
  }

  if (s === "submission_closed") {
    if ((opts.submittedCount ?? 0) === 0) {
      warnings.push({ level:"error", message:"Không có hồ sơ nào được nộp. Không thể mở thẩm định khi chưa có hồ sơ.", canProceed:false });
    } else {
      warnings.push({ level:"info", message:`${opts.submittedCount} hồ sơ sẽ được chuyển sang vòng thẩm định cấp cơ sở`, canProceed:true });
    }
  }

  if (s === "unit_review") {
    if (!opts.allReviewed) {
      warnings.push({ level:"error", message:`Còn ${opts.pendingCount ?? "?"} hồ sơ chưa thẩm định. Phải xét hết trước khi chuyển Hội đồng.`, canProceed:false });
    } else {
      const approved = opts.approvedCount ?? 0;
      const total    = (opts.approvedCount ?? 0) + (opts.pendingCount ?? 0);
      if (approved === 0) {
        warnings.push({ level:"warning", message:"Tất cả hồ sơ đều bị trả lại. Xác nhận chuyển Hội đồng mà không có hồ sơ nào được duyệt?", canProceed:true });
      } else {
        warnings.push({ level:"info", message:`${approved}/${total} hồ sơ được duyệt — sẵn sàng chuyển Hội đồng xét duyệt`, canProceed:true });
      }
    }
  }

  if (s === "council_review") {
    if (!opts.quorumMet) {
      warnings.push({ level:"error", message:"Số thành viên tham dự chưa đạt túc số (≥ 2/3 tổng thành viên). Không hợp lệ để biểu quyết.", canProceed:false });
    }
    if (!opts.allVoted) {
      warnings.push({ level:"error", message:"Còn thành viên Hội đồng chưa bỏ phiếu. Phải bỏ phiếu đầy đủ trước khi kết thúc phiên.", canProceed:false });
    }
    if (opts.allVoted && !opts.minutesSigned) {
      warnings.push({ level:"warning", message:"Biên bản họp chưa được ký xác nhận — cần ký trước khi chuyển bước.", canProceed:true });
    }
    if (opts.allVoted && opts.quorumMet) {
      const yes = opts.yesVotes ?? 0;
      const thr = opts.passThreshold ?? 5;
      if (yes < thr) {
        warnings.push({ level:"warning", message:`Số phiếu tán thành (${yes}) chưa đạt ngưỡng thông qua (${thr}). Hồ sơ có thể bị hoàn lại.`, canProceed:true });
      } else {
        warnings.push({ level:"info", message:`${yes} phiếu tán thành — đạt ngưỡng thông qua (${thr}). Sẵn sàng trình lãnh đạo ký duyệt.`, canProceed:true });
      }
    }
  }

  if (s === "final_approval") {
    if (!opts.sigConfirmed) {
      warnings.push({ level:"error", message:"Chưa xác thực chữ ký số CA Token. Lãnh đạo phải ký điện tử trước khi ban hành Quyết định.", canProceed:false });
    } else {
      warnings.push({ level:"info", message:"Đã xác thực chữ ký số — Quyết định khen thưởng sẵn sàng ban hành chính thức.", canProceed:true });
    }
  }

  return warnings;
}

/* ── ReadinessPanel ─────────────────────────────────────────────── */
function ReadinessPanel({ warnings, compact = false }: { warnings: TransitionWarning[]; compact?: boolean }) {
  if (warnings.length === 0) return null;
  const cfg = {
    error:   { bg:"#fef2f2", border:"#fca5a5", icon:"🚫", labelColor:"#991b1b", textColor:"#7f1d1d" },
    warning: { bg:"#fffbeb", border:"#fcd34d", icon:"⚠️", labelColor:"#92400e", textColor:"#78350f" },
    info:    { bg:"#eff6ff", border:"#93c5fd", icon:"ℹ️", labelColor:"#1e40af", textColor:"#1e3a8a" },
  };
  return (
    <div className={`space-y-2 ${compact ? "" : "mb-1"}`}>
      {warnings.map((w, i) => {
        const c = cfg[w.level];
        return (
          <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-[10px] border text-[13px]"
            style={{ background:c.bg, borderColor:c.border, fontFamily: "var(--font-sans)" }}>
            <span className="text-[14px] mt-0.5 shrink-0">{c.icon}</span>
            <span style={{ color:c.textColor }}>{w.message}</span>
            {!w.canProceed && (
              <span className="ml-auto shrink-0 px-2 py-0.5 rounded-full text-[13px] font-bold"
                style={{ background:c.border, color:c.labelColor }}>Bắt buộc</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── CampaignStatsBar ──────────────────────────────────────────── */
function CampaignStatsBar({ c }: { c: Campaign }) {
  const submittedCount = c.participants.filter(p => p.hoSoStatus === "da_nop" || p.hoSoStatus === "da_duyet").length;
  const approvedCount  = c.participants.filter(p => p.hoSoStatus === "da_duyet").length;
  const joinPct  = c.totalUnits ? Math.round(c.joinedUnits / c.totalUnits * 100) : 0;
  const submitPct = submittedCount > 0 && c.participants.length > 0
    ? Math.round(approvedCount / submittedCount * 100) : 0;
  const left = daysLeft(c.ngayKetThuc);
  const scfg = STATE_CFG[c.state];

  const items = [
    {
      label: "Đơn vị tham gia",
      value: `${c.joinedUnits}/${c.totalUnits}`,
      sub: `${joinPct}%`,
      pct: joinPct,
      color: "#166534",
      barBg: "#dcfce7",
    },
    {
      label: "Hồ sơ đã nộp",
      value: `${submittedCount}`,
      sub: `${approvedCount} được duyệt`,
      pct: submittedCount > 0 ? Math.round(approvedCount / submittedCount * 100) : 0,
      color: "#1C5FBE",
      barBg: "#ddeafc",
    },
    {
      label: "Tỷ lệ thông qua",
      value: `${submitPct}%`,
      sub: approvedCount > 0 ? `${approvedCount} hồ sơ` : "Chưa có",
      pct: submitPct,
      color: "#0f7a3e",
      barBg: "#d1fae5",
    },
    {
      label: "Thời gian còn lại",
      value: left > 0 ? `${left} ngày` : "Đã kết thúc",
      sub: fmtDate(c.ngayKetThuc),
      pct: null,
      color: left <= 7 ? "#c8102e" : left <= 30 ? "#b45309" : "#374151",
      barBg: "#f3f4f6",
    },
  ];

  return (
    <div className="px-8 py-3 border-b flex items-center gap-0 overflow-x-auto"
      style={{ background:"#fafaf9", borderColor:"var(--color-line)" }}>
      {/* State pill */}
      <div className="flex items-center gap-2 pr-4 border-r mr-4 shrink-0" style={{ borderColor:"#e2e8f0" }}>
        <div className="size-2 rounded-full animate-pulse" style={{ background:scfg.color, animationPlayState: c.state === "active" ? "running" : "paused" }} />
        <span className="text-[13px] font-semibold" style={{ color:scfg.color, fontFamily: "var(--font-sans)" }}>{scfg.short}</span>
        <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>· {scfg.canCu}</span>
      </div>
      {/* KPI items */}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 pr-6 mr-2 shrink-0">
          {i > 0 && <div className="h-8 w-px bg-[#e2e8f0] -ml-2 mr-4" />}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[14px] font-bold" style={{ color:item.color, fontFamily: "var(--font-sans)" }}>{item.value}</span>
              <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{item.sub}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {item.pct !== null && (
                <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background:item.barBg }}>
                  <div className="h-full rounded-full transition-all" style={{ width:`${item.pct}%`, background:item.color }} />
                </div>
              )}
              <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>{item.label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── UnitSubmissionTracker ─────────────────────────────────────── */
const MOCK_UNIT_NAMES = [
  "Sở GD&ĐT","Sở Y tế","Sở Tài chính","Sở KHCN","Sở TN&MT","Sở Tư pháp",
  "Sở LĐTB&XH","Sở Nội vụ","Sở Xây dựng","Sở GTVT","Sở NN&PTNT","Sở TT&TT",
  "Công an Tỉnh","Bộ CHQS Tỉnh","BV Đa khoa ĐN","BHXH Tỉnh","Cục Thuế Tỉnh",
  "KBNN Tỉnh","Tòa án ND Tỉnh","Viện KSND Tỉnh",
];

type UnitStatus = "da_nop" | "da_duyet" | "chua_nop" | "tre_han";

interface UnitTrackItem {
  id: string; name: string; status: UnitStatus;
  soHoSo: number; soThanhVien: number; ngayNop?: string; ghiChu?: string;
}

function buildUnitTrack(c: Campaign): UnitTrackItem[] {
  const unitMap = new Map<string, UnitTrackItem>();
  c.participants.forEach(p => {
    if (!unitMap.has(p.donVi)) {
      const status: UnitStatus = (p.hoSoStatus === "da_duyet") ? "da_duyet"
        : (p.hoSoStatus === "da_nop") ? "da_nop" : "chua_nop";
      unitMap.set(p.donVi, { id:p.donVi, name:p.donVi, status, soHoSo:1, soThanhVien:1, ngayNop:p.nopLuc||undefined });
    } else {
      const u = unitMap.get(p.donVi)!;
      u.soHoSo++;
      u.soThanhVien++;
      if (p.hoSoStatus === "da_duyet") u.status = "da_duyet";
      else if (p.hoSoStatus === "da_nop" && u.status === "chua_nop") u.status = "da_nop";
    }
  });
  const remaining = c.totalUnits - unitMap.size;
  for (let i = 0; i < Math.min(remaining, MOCK_UNIT_NAMES.length); i++) {
    const n = MOCK_UNIT_NAMES[i];
    if (!unitMap.has(n)) {
      const isLate = i % 5 === 0;
      unitMap.set(n, { id:n, name:n, status:isLate ? "tre_han" : "chua_nop", soHoSo:0, soThanhVien:0 });
    }
  }
  return Array.from(unitMap.values()).sort((a,b) => {
    const order = { da_duyet:0, da_nop:1, chua_nop:2, tre_han:3 };
    return order[a.status] - order[b.status];
  });
}

const UNIT_STATUS_CFG: Record<UnitStatus,{ label:string; color:string; bg:string; border:string; dot:string }> = {
  da_duyet: { label:"Đã được duyệt", color:"#0f7a3e", bg:"#d1fae5", border:"#6ee7b7", dot:"#0f7a3e" },
  da_nop:   { label:"Đã nộp",        color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd", dot:"#1C5FBE" },
  chua_nop: { label:"Chưa nộp",      color:"#635647", bg:"#eef2f8", border:"#d9d1bd", dot:"#635647" },
  tre_han:  { label:"Trễ hạn",       color:"#c8102e", bg:"#fee2e2", border:"#fca5a5", dot:"#c8102e" },
};

function UnitSubmissionTracker({ c, deadline }: { c: Campaign; deadline: string }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|UnitStatus>("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  const units = buildUnitTrack(c);
  const filtered = units.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.status === filter;
    return matchSearch && matchFilter;
  });
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const counts = {
    da_duyet: units.filter(u => u.status === "da_duyet").length,
    da_nop:   units.filter(u => u.status === "da_nop").length,
    chua_nop: units.filter(u => u.status === "chua_nop").length,
    tre_han:  units.filter(u => u.status === "tre_han").length,
  };
  const doneTotal = counts.da_duyet + counts.da_nop;
  const pct = units.length > 0 ? Math.round(doneTotal / units.length * 100) : 0;

  return (
    <div className="rounded-[12px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b flex items-center justify-between"
        style={{ background:"var(--color-paper)", borderColor:"var(--color-line)" }}>
        <div className="flex items-center gap-3">
          <Building2 className="size-4 text-[#166534]" />
          <span className="text-[13px] text-[#0b1426]"
            style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
            Theo dõi nộp hồ sơ — {units.length} đơn vị
          </span>
          <span className="text-[13px] px-2 py-0.5 rounded-full"
            style={{ background:"#dcfce7", color:"#166534", fontFamily: "var(--font-sans)", fontWeight:600 }}>
            {pct}% hoàn thành
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-[#635647]" />
            <input
              className="h-8 pl-7 pr-3 rounded-[6px] border text-[13px] outline-none focus:border-[#1C5FBE]"
              style={{ borderColor:"var(--color-line)", fontFamily: "var(--font-sans)", width:160 }}
              placeholder="Tìm đơn vị..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          <DsButton variant="secondary" size="sm"><Send className="size-3" />Nhắc tất cả</DsButton>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full flex">
        <div className="h-full bg-[#0f7a3e] transition-all" style={{ width:`${units.length > 0 ? counts.da_duyet/units.length*100 : 0}%` }} />
        <div className="h-full bg-[#1C5FBE] transition-all" style={{ width:`${units.length > 0 ? counts.da_nop/units.length*100 : 0}%` }} />
        <div className="h-full bg-[#c8102e] transition-all" style={{ width:`${units.length > 0 ? counts.tre_han/units.length*100 : 0}%` }} />
        <div className="h-full flex-1 bg-[#e2e8f0]" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0 px-5 pt-2 pb-0 border-b" style={{ borderColor:"var(--color-line)" }}>
        {(["all","da_duyet","da_nop","chua_nop","tre_han"] as const).map(f => {
          const label = f === "all" ? `Tất cả (${units.length})` :
            `${UNIT_STATUS_CFG[f].label} (${counts[f]})`;
          const active = filter === f;
          const fColor = f === "all" ? "#1C5FBE" : UNIT_STATUS_CFG[f].color;
          return (
            <button key={f}
              onClick={() => { setFilter(f); setPage(0); }}
              className="px-3 py-2 text-[13px] border-b-2 transition-colors"
              style={{
                fontFamily: "var(--font-sans)", background:"transparent",
                borderBottomColor: active ? fColor : "transparent",
                color: active ? fColor : "#635647",
                fontWeight: active ? 600 : 400,
              }}>
              {label}
            </button>
          );
        })}
        <span className="ml-auto text-[13px] text-[#635647] pb-2" style={{ fontFamily: "var(--font-sans)" }}>
          Hạn: {fmtDate(deadline)}
        </span>
      </div>

      {/* Table */}
      <div className="divide-y" style={{ divideColor:"#eef2f8" }}>
        {paged.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Không tìm thấy đơn vị nào
          </div>
        ) : paged.map((u, i) => {
          const scfg = UNIT_STATUS_CFG[u.status];
          return (
            <div key={u.id} className="px-5 py-3 flex items-center gap-4 hover:bg-[#fafaf9] transition-colors">
              <div className="w-6 text-[13px] text-[#6b5e47] text-center shrink-0"
                style={{ fontFamily: "var(--font-sans)" }}>{page * PAGE_SIZE + i + 1}</div>
              <div className="size-7 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold"
                style={{ background:scfg.bg, color:scfg.color }}>
                {u.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>{u.name}</div>
                {u.ngayNop && <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Nộp: {fmtDate(u.ngayNop)}</div>}
              </div>
              {u.soHoSo > 0 && (
                <div className="text-[13px] text-[#5a5040] shrink-0" style={{ fontFamily: "var(--font-sans)" }}>
                  {u.soHoSo} hồ sơ
                </div>
              )}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="size-1.5 rounded-full" style={{ background:scfg.dot }} />
                <span className="text-[13px] px-2 py-0.5 rounded-full border"
                  style={{ background:scfg.bg, color:scfg.color, borderColor:scfg.border, fontFamily: "var(--font-sans)", fontWeight:500 }}>
                  {scfg.label}
                </span>
              </div>
              {u.status === "chua_nop" || u.status === "tre_han" ? (
                <DsButton variant="secondary" size="sm" className="shrink-0"><Send className="size-3" />Nhắc</DsButton>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t flex items-center justify-between"
          style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
          <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length}
          </span>
          <div className="flex gap-1">
            <DsButton variant="secondary" size="sm" onClick={() => setPage(p => Math.max(0,p-1))} disabled={page === 0}>
              <ChevronLeft className="size-3" />
            </DsButton>
            <DsButton variant="secondary" size="sm" onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page >= totalPages-1}>
              <ChevronRight className="size-3" />
            </DsButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FULL-SCREEN STATE TIMELINE
═══════════════════════════════════════════════════════════════════ */
function FullStateTimeline({ state }: { state: CampaignState }) {
  const curIdx = stateIndex(state);

  return (
    <div className="px-8 pt-5 pb-6 bg-white border-b" style={{ borderColor:"var(--color-line)" }}>

      {/* ── Phase labels ── */}
      <div className="flex items-center mb-4">
        {PHASES.map((phase, pi) => {
          const phaseComplete = phase.states.every(s => stateIndex(s) < curIdx);
          const phaseActive   = phase.states.includes(state);
          return (
            <div key={pi} className="flex justify-center" style={{ flex: phase.states.length }}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[13px] font-semibold whitespace-nowrap"
                style={{
                  background: phaseComplete ? "#dcfce7" : phaseActive ? phase.color : "#eef2f8",
                  color:      phaseComplete ? "#166534" : phaseActive ? "#fff"      : "#635647",
                }}>
                {phaseComplete && <Check className="size-2.5" strokeWidth={2.5} />}
                {phaseActive   && <div className="size-1.5 rounded-full bg-white/70 animate-pulse" />}
                {phase.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Nodes row ── */}
      <div className="flex items-center">
        {PHASES.map((phase, pi) => {
          const phaseComplete = phase.states.every(s => stateIndex(s) < curIdx);
          const prevComplete  = pi > 0 && PHASES[pi-1].states.every(s => stateIndex(s) < curIdx);

          return (
            <div key={pi} className="flex items-center" style={{ flex: phase.states.length }}>

              {/* Inter-phase gap connector — wider để tách biệt */}
              {pi > 0 && (
                <div className="shrink-0 mx-2" style={{
                  width: 24, height: 1.5,
                  background: prevComplete ? "#16a34a" : "#d1d5db",
                }} />
              )}

              {/* Nodes trong phase */}
              <div className="flex items-center flex-1">
                {phase.states.map((s, si) => {
                  const sc     = STATE_CFG[s];
                  const isDone = stateIndex(s) < curIdx;
                  const isCur  = s === state;
                  const Icon   = sc.icon;

                  return (
                    <div key={s} className="flex items-center flex-1 min-w-0">
                      {si > 0 && (
                        <div className="flex-1 mx-0.5" style={{
                          height: isDone ? 1.5 : 1,
                          background: isDone ? "#16a34a" : "#d1d5db",
                        }} />
                      )}

                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <div className="rounded-full flex items-center justify-center shrink-0"
                          style={{
                            width: 28, height: 28,
                            background: isDone ? "#16a34a" : isCur ? phase.color : "#f3f4f6",
                            border: `1.5px solid ${isDone ? "#16a34a" : isCur ? phase.color : "#e2e8f0"}`,
                            boxShadow: isCur ? `0 0 0 3px ${phase.color}22` : "none",
                          }}>
                          {isDone
                            ? <Check className="size-3.5 text-white" strokeWidth={2.5} />
                            : <Icon className="size-3" style={{ color: isCur ? "#fff" : "#b0b8c4" }} />
                          }
                        </div>
                        <div style={{ width: 56 }}>
                          <p className="text-[9.5px] leading-tight text-center"
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontWeight: isCur ? 700 : isDone ? 500 : 400,
                              color: isCur ? phase.color : isDone ? "#166534" : "#4f5d6e",
                            }}>
                            {sc.short}
                          </p>
                          {isCur && (
                            <p className="mt-0.5 text-center">
                              <span className="inline-block text-[8px] px-1 py-px rounded-full font-semibold"
                                style={{ background: phase.color + "18", color: phase.color }}>
                                Hiện tại
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LEGAL WARNING BANNER
═══════════════════════════════════════════════════════════════════ */
function LegalWarningBanner({ canCuPhapLy }: { canCuPhapLy: string[] }) {
  const expired = detectExpiredDocs(canCuPhapLy);
  if (expired.length === 0) return null;

  const suggestions = expired.map(e => {
    const replacement = getReplacementDoc(e);
    return replacement ? `${e} → ${replacement.so}` : e;
  });

  return (
    <div className="flex items-start gap-3 p-3 rounded-[8px] border mb-4"
      style={{ background:"#fff7ed", borderColor:"#fdba74" }}>
      <AlertCircle className="size-4 text-[#c2410c] shrink-0 mt-0.5" />
      <div className="min-w-0">
        <div className="text-[13px] text-[#c2410c]" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
          {expired.length} văn bản pháp lý đã hết hiệu lực
        </div>
        <div className="text-[13px] text-[#c2410c] mt-1 space-y-0.5">
          {suggestions.map((s, i) => (
            <div key={i}>· {s}</div>
          ))}
        </div>
        <div className="text-[13px] text-[#9a3412] mt-1.5">
          Vui lòng cập nhật căn cứ pháp lý trong tab Tổng quan để đảm bảo tính pháp lý của hồ sơ.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   OVERVIEW TAB
═══════════════════════════════════════════════════════════════════ */
function OverviewTab({ c }: { c: Campaign }) {
  const { theme } = useTheme();
  const [expandCriteria, setExpandCriteria] = useState(false);
  const joinPct = c.totalUnits ? Math.round(c.joinedUnits / c.totalUnits * 100) : 0;
  const left    = daysLeft(c.ngayKetThuc);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* LEFT 2/3 */}
      <div className="col-span-2 space-y-5">
        <LegalWarningBanner canCuPhapLy={c.canCuPhapLy} />
        {/* Mission */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          <div className="px-5 py-3 border-b flex items-center gap-2"
            style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
            <Target className="size-4" style={{ color:theme.primary }} />
            <span className="text-[14px] text-[#0b1426]"
              style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>Mục tiêu phong trào</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-[14px] text-[#0b1426] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
              {c.mucTieu}
            </p>
          </div>
        </div>

        {/* Target audience */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          <div className="px-5 py-3 border-b flex items-center gap-2"
            style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
            <Users className="size-4" style={{ color:theme.primary }} />
            <span className="text-[14px] text-[#0b1426]"
              style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>Đối tượng tham gia</span>
            <span className="ml-auto text-[13px] px-2 py-0.5 rounded bg-[#eef2f8] text-[#5a5040]"
              style={{ fontFamily: "var(--font-sans)" }}>{SUBJECT_LABELS[c.subjectType]}</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-[14px] text-[#0b1426] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
              {c.doiTuong}
            </p>
          </div>
        </div>

        {/* Scoring criteria */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          <button
            className="w-full px-5 py-3 border-b flex items-center gap-2 hover:bg-[#f8fafc] transition-colors"
            style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}
            onClick={() => setExpandCriteria(!expandCriteria)}>
            <Scale className="size-4" style={{ color:theme.primary }} />
            <span className="text-[14px] text-[#0b1426]"
              style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
              Bộ tiêu chí chấm điểm
            </span>
            {c.sector && c.sector !== "chung" && (
              <span className="text-[13px] px-2 py-0.5 rounded-full border"
                style={{ borderColor:"#7c3aed40", background:"#faf5ff", color:"#7c3aed", fontFamily: "var(--font-sans)" }}>
                {SECTOR_LABELS[c.sector]}
              </span>
            )}
            <span className="ml-auto text-[13px] px-2 py-0.5 rounded"
              style={{ background:theme.tint, color:theme.primary, fontFamily: "var(--font-sans)" }}>
              Tổng {c.tieuChi.reduce((s,t)=>s+t.maxScore,0)} điểm
            </span>
            {expandCriteria
              ? <ChevronUp className="size-4 text-[#635647] ml-1" />
              : <ChevronDown className="size-4 text-[#635647] ml-1" />}
          </button>
          {expandCriteria && (
            <div className="divide-y" style={{ borderColor:"var(--color-line)" }}>
              {c.tieuChi.map((t, i) => {
                const colors = ["#1C5FBE","#0f7a3e","#7c3aed","#b45309","#9f1239"];
                const col = colors[i % colors.length];
                return (
                  <div key={t.id} className="px-5 py-3.5 flex items-start gap-4">
                    <div className="size-8 rounded-full flex items-center justify-center shrink-0 text-white text-[13px]"
                      style={{ background:col, fontFamily: "var(--font-sans)", fontWeight:700 }}>
                      {t.maxScore}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-[#0b1426]"
                        style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{t.name}</div>
                      <div className="text-[13px] text-[#635647] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                        {t.mota}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-[13px]"
                      style={{ color:col, fontFamily: "var(--font-sans)" }}>
                      <BookOpen className="size-3" />{t.canCu}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!expandCriteria && (
            <div className="px-5 py-3 flex flex-wrap gap-2">
              {c.tieuChi.map((t, i) => {
                const colors = ["#1C5FBE","#0f7a3e","#7c3aed","#b45309","#9f1239"];
                const col = colors[i % colors.length];
                return (
                  <div key={t.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border"
                    style={{ borderColor:col+"30", background:col+"08" }}>
                    <div className="size-5 rounded-full flex items-center justify-center text-[13px] text-white shrink-0"
                      style={{ background:col, fontFamily: "var(--font-sans)", fontWeight:700 }}>
                      {t.maxScore}
                    </div>
                    <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{t.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Awards */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          <div className="px-5 py-3 border-b flex items-center gap-2"
            style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
            <Trophy className="size-4" style={{ color:"#8a6400" }} />
            <span className="text-[14px] text-[#0b1426]"
              style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>Hình thức khen thưởng dự kiến</span>
          </div>
          <div className="px-5 py-4 flex flex-wrap gap-2.5">
            {c.awards.map((a, i) => (
              <div key={a} className="flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] border"
                style={{ background:"#fdf3d9", borderColor:"#f0dba0" }}>
                <div className="size-6 rounded-full flex items-center justify-center"
                  style={{ background:"#8a6400" }}>
                  <span className="text-[13px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
                    {i+1}
                  </span>
                </div>
                <span className="text-[13px] text-[#7d4a00]" style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>
                  {a}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT sidebar 1/3 */}
      <div className="space-y-4">
        {/* Participation donut */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          <div className="px-4 py-3 border-b"
            style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
            <span className="text-[13px] text-[#0b1426]"
              style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>Tiến độ tham gia</span>
          </div>
          <div className="px-4 py-5 flex flex-col items-center">
            {/* Simple ring progress */}
            <div className="relative size-28">
              <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#eef2f8" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={joinPct === 100 ? "#16a34a" : theme.primary}
                  strokeWidth="12"
                  strokeDasharray={`${joinPct * 3.14} 314`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[24px]"
                  style={{ fontFamily: "var(--font-sans)", fontWeight:700,
                    color:joinPct===100?"#16a34a":theme.primary, lineHeight:1 }}>
                  {joinPct}%
                </div>
                <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>tham gia</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-[18px] text-[#0b1426]"
                style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
                {c.joinedUnits}/{c.totalUnits}
              </div>
              <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                đơn vị/cá nhân đã tham gia
              </div>
            </div>
          </div>
        </div>

        {/* Timeline info */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
              Thời gian
            </span>
          </div>
          <div className="p-4 space-y-3">
            {[
              { icon:Flag,     label:"Ngày bắt đầu",  v:fmtDate(c.ngayBatDau), color:"#166534" },
              { icon:Lock,     label:"Hạn nộp hồ sơ", v:fmtDate(c.ngayNopHoSo), color:"#b45309" },
              { icon:Archive,  label:"Ngày kết thúc",  v:fmtDate(c.ngayKetThuc), color:"#374151" },
            ].map(row => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="size-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background:row.color+"15" }}>
                    <Icon className="size-3.5" style={{ color:row.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{row.label}</div>
                    <div className="text-[13px] text-[#0b1426]"
                      style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{row.v}</div>
                  </div>
                </div>
              );
            })}
            {left > 0 && c.state !== "archived" && (
              <div className="mt-2 rounded-[6px] p-2.5 flex items-center gap-2"
                style={{ background:left<=7?"#fee2e2":left<=14?"#fef3c7":"#dcfce7",
                  border:`1px solid ${left<=7?"#fca5a5":left<=14?"#fcd34d":"#86efac"}` }}>
                <Timer className="size-3.5" style={{ color:left<=7?"#c8102e":left<=14?"#b45309":"#166534" }} />
                <span className="text-[13px]"
                  style={{ color:left<=7?"#9f1239":left<=14?"#92400e":"#166534", fontFamily: "var(--font-sans)", fontWeight:600 }}>
                  Còn {left} ngày nữa
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
              Đơn vị phụ trách
            </span>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <User className="size-3.5 text-[#635647]" />
              <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>
                {c.leader}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="size-3.5 text-[#635647]" />
              <span className="text-[13px] text-[#4a5568]" style={{ fontFamily: "var(--font-sans)" }}>
                {c.donViPhuTrach}
              </span>
            </div>
          </div>
        </div>

        {/* Legal basis */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"#1C5FBE30", background:"#f0f6ff" }}>
          <div className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor:"#1C5FBE20" }}>
            <BookOpen className="size-3.5 text-[#1C5FBE]" />
            <span className="text-[13px] text-[#1a4fa0]"
              style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>Căn cứ pháp lý</span>
          </div>
          <div className="p-4 space-y-2">
            {c.canCuPhapLy.map(p => (
              <div key={p} className="flex items-start gap-2">
                <div className="size-1.5 rounded-full mt-1.5 shrink-0" style={{ background:"#1C5FBE" }} />
                <span className="text-[13px] text-[#1a4fa0] leading-relaxed"
                  style={{ fontFamily: "var(--font-sans)" }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {c.ghiChu && (
          <div className="rounded-[8px] border p-3 flex items-start gap-2"
            style={{ borderColor:"#fcd34d", background:"#fef9c3" }}>
            <Info className="size-3.5 mt-0.5 shrink-0 text-[#b45309]" />
            <p className="text-[13px] text-[#92400e] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
              {c.ghiChu}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HO SO DRAWER — Checklist thành phần hồ sơ theo TT 12/2019 + TT 15/2025
═══════════════════════════════════════════════════════════════════ */
function HoSoDrawer({ p, onClose }: { p: Participant; onClose: () => void }) {
  const subject = p.type === "ca_nhan" ? "ca_nhan" : "tap_the";
  const requirements = getRequirementsForSubject(subject);
  const [docs, setDocs] = useState<MinhChung[]>(() =>
    p.minhChung && p.minhChung.length > 0
      ? p.minhChung
      : requirements.map(r => createEmptyMinhChung(r))
  );

  const toggle = (id: string) =>
    setDocs(prev => prev.map(d =>
      d.id === id ? { ...d, daNop: !d.daNop, ngayNop: !d.daNop ? new Date().toISOString().slice(0, 10) : undefined } : d
    ));

  const validation = validateMinhChung(docs, subject);
  const nopCount    = docs.filter(d => d.daNop).length;
  const batBuocNop  = docs.filter(d => d.batBuoc && d.daNop).length;
  const batBuocAll  = docs.filter(d => d.batBuoc).length;
  const pct         = Math.round((batBuocNop / Math.max(batBuocAll, 1)) * 100);

  const grouped = (Object.entries(NHOM_HO_SO_LABELS) as [HoSoRequirement["nhomHoSo"], string][])
    .map(([key, label]) => ({
      key, label,
      items: docs.filter(d => {
        const req = requirements.find(r => r.id === d.id);
        return req?.nhomHoSo === key;
      }),
    }))
    .filter(g => g.items.length > 0);

  const nhomColors: Record<HoSoRequirement["nhomHoSo"], string> = {
    to_khai: "#1C5FBE", thanh_tich: "#166534", ly_lich: "#7c3aed",
    minh_chung: "#b45309", tai_chinh: "#0891b2", noi_bo: "#9f1239",
  };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(11,20,38,0.45)" }} onClick={onClose}>
      <div className="ml-auto w-full max-w-[480px] h-full bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--color-line)", background: "var(--color-paper)" }}>
          <div className="size-9 rounded-[6px] bg-[#dbeafe] flex items-center justify-center shrink-0">
            <FileCheck className="size-4 text-[#1a4fa0]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)" }}>{p.name}</div>
            <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              {p.donVi} · {p.type === "ca_nhan" ? "Cá nhân" : "Tập thể"} · TT 12/2019 + TT 15/2025/TT-BNV
            </div>
          </div>
          <button className="size-7 rounded-[4px] flex items-center justify-center hover:bg-[#eef2f8] text-[#635647]" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>

        {/* Validation summary */}
        <div className="px-5 py-3 border-b space-y-2" style={{ borderColor: "var(--color-line)" }}>
          <div className="flex items-center justify-between text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <span className="text-[#0b1426] font-semibold">Bắt buộc: {batBuocNop}/{batBuocAll}</span>
            <span className="text-[#635647]">Tổng đã nộp: {nopCount}/{docs.length}</span>
            <span className={`font-semibold ${validation.valid ? "text-[#166534]" : "text-[#c2410c]"}`}>
              {pct}% hoàn chỉnh
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#eef2f8] overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: validation.valid ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#dc2626" }} />
          </div>
          {validation.missing.length > 0 && (
            <div className="flex items-start gap-1.5 p-2 rounded-[6px] border" style={{ background: "#fff7ed", borderColor: "#fdba74" }}>
              <AlertCircle className="size-3.5 text-[#c2410c] shrink-0 mt-0.5" />
              <div className="text-[13px] text-[#c2410c]" style={{ fontFamily: "var(--font-sans)" }}>
                <strong>Còn thiếu {validation.missing.length} tài liệu bắt buộc:</strong>{" "}
                {validation.missing.join("; ")}
              </div>
            </div>
          )}
          {validation.valid && (
            <div className="flex items-center gap-1.5 p-2 rounded-[6px] border" style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
              <CheckCircle2 className="size-3.5 text-[#166534]" />
              <span className="text-[13px] text-[#166534] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                Hồ sơ đầy đủ thành phần bắt buộc
              </span>
            </div>
          )}
        </div>

        {/* Grouped requirements */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {grouped.map(g => (
            <div key={g.key}>
              <div className="flex items-center gap-2 mb-2">
                <div className="size-1.5 rounded-full shrink-0" style={{ background: nhomColors[g.key] }} />
                <span className="text-[13px] font-semibold uppercase tracking-wide"
                  style={{ color: nhomColors[g.key], fontFamily: "var(--font-sans)" }}>{g.label}</span>
                <div className="flex-1 h-px" style={{ background: nhomColors[g.key] + "30" }} />
                <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                  {g.items.filter(d => d.daNop).length}/{g.items.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {g.items.map(d => {
                  const req = requirements.find(r => r.id === d.id)!;
                  return (
                    <label key={d.id}
                      className="flex items-start gap-3 p-2.5 rounded-[6px] border cursor-pointer transition-colors"
                      style={{ borderColor: d.daNop ? nhomColors[g.key] + "40" : "var(--color-line)", background: d.daNop ? nhomColors[g.key] + "06" : "#fff" }}>
                      <input type="checkbox" className="mt-0.5 shrink-0 size-3.5" checked={d.daNop} onChange={() => toggle(d.id)}
                        style={{ accentColor: nhomColors[g.key] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: d.batBuoc ? 600 : 400 }}>
                            {d.ten}
                          </span>
                          {req.tenMau && (
                            <span className="text-[13px] px-1.5 py-px rounded"
                              style={{ background: nhomColors[g.key] + "15", color: nhomColors[g.key], fontFamily: "var(--font-sans)" }}>
                              {req.tenMau}
                            </span>
                          )}
                          {d.batBuoc && (
                            <span className="text-[13px] px-1 py-px rounded bg-[#fee2e2] text-[#9f1239]"
                              style={{ fontFamily: "var(--font-sans)" }}>bắt buộc</span>
                          )}
                        </div>
                        <div className="text-[13px] text-[#635647] mt-0.5 leading-snug" style={{ fontFamily: "var(--font-sans)" }}>
                          {req.moTa}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <BookOpen className="size-3 text-[#635647]" />
                          <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{req.canCu}</span>
                        </div>
                        {d.daNop && d.ngayNop && (
                          <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>
                            Đã nộp {fmtDate(d.ngayNop)}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--color-line)", background: "var(--color-paper)" }}>
          <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Căn cứ: TT 12/2019/TT-BNV · TT 15/2025/TT-BNV · TT 08/2017/TT-BNV
          </span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PARTICIPANTS TAB
═══════════════════════════════════════════════════════════════════ */
function ParticipantsTab({ c }: { c: Campaign }) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<"all"|"da_duyet"|"da_nop"|"chua_nop"|"tra_lai">("all");
  const [hoSoOpen, setHoSoOpen] = useState<Participant | null>(null);

  const hsCfg: Record<string,{label:string;color:string;bg:string;border:string}> = {
    chua_nop: {label:"Chưa nộp",  color:"#c2410c",bg:"#fff7ed",border:"#fdba74"},
    da_nop:   {label:"Đã nộp",    color:"#1a4fa0",bg:"#dbeafe",border:"#93c5fd"},
    da_duyet: {label:"Đã duyệt",  color:"#166534",bg:"#dcfce7",border:"#86efac"},
    tra_lai:  {label:"Trả lại",   color:"#9f1239",bg:"#fee2e2",border:"#fca5a5"},
  };

  const counts = Object.fromEntries(
    Object.keys(hsCfg).map(k => [k, c.participants.filter(p=>p.hoSoStatus===k).length])
  );
  const displayed = filter === "all" ? c.participants : c.participants.filter(p=>p.hoSoStatus===filter);

  if (!c.participants.length) return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <Users className="size-12 text-[#e2e8f0]" />
      <p className="text-[14px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
        Chưa có hồ sơ tham gia. Phong trào sẽ mở nhận hồ sơ khi được phát động chính thức.
      </p>
    </div>
  );

  return (<>
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={()=>setFilter("all")}
          className="px-3 h-8 rounded-[6px] text-[13px] border transition-all"
          style={{ borderColor:filter==="all"?theme.primary:"var(--color-line)",
            background:filter==="all"?theme.tint:"#fff",
            color:filter==="all"?theme.primary:"#4a5568",
            fontFamily: "var(--font-sans)", fontWeight:filter==="all"?600:400 }}>
          Tất cả ({c.participants.length})
        </button>
        {(Object.entries(hsCfg) as [string, typeof hsCfg[string]][]).map(([key, cfg]) => (
          <button key={key} onClick={()=>setFilter(key as any)}
            className="flex items-center gap-1.5 px-3 h-8 rounded-[6px] text-[13px] border transition-all"
            style={{ borderColor:filter===key?cfg.color:cfg.border,
              background:filter===key?cfg.bg:"#fff",
              color:filter===key?cfg.color:"#4a5568",
              fontFamily: "var(--font-sans)" }}>
            {cfg.label}
            <span className="size-4 rounded-full flex items-center justify-center text-[13px]"
              style={{ background:filter===key?cfg.color+"20":"#eef2f8", color:cfg.color }}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Warning for pending */}
      {counts.chua_nop > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-[8px] border"
          style={{ background:"#fff7ed", borderColor:"#fdba74" }}>
          <AlertCircle className="size-4 text-[#c2410c] shrink-0" />
          <span className="text-[13px] text-[#c2410c]" style={{ fontFamily: "var(--font-sans)" }}>
            <strong>{counts.chua_nop} đơn vị/cá nhân</strong> chưa nộp hồ sơ trước hạn {fmtDate(c.ngayNopHoSo)}.
          </span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:"var(--color-paper)" }}>
              {["Hạng","Tên cá nhân / tập thể","Đơn vị","Loại","Nộp lúc","Điểm","Trạng thái",""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[13px] uppercase tracking-wide text-[#635647] border-b"
                  style={{ borderColor:"var(--color-line)", fontFamily: "var(--font-sans)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((p, idx) => {
              const hs = hsCfg[p.hoSoStatus];
              const isTop3 = (p.rank ?? 99) <= 3;
              const medalColors = ["#8a6400","#4f5d6e","#cd7c3b"];
              return (
                <tr key={p.id} className="border-b hover:bg-[#f8fafc] transition-colors"
                  style={{ borderColor:"var(--color-line)" }}>
                  <td className="px-4 py-3">
                    {p.rank ? (
                      <div className="size-7 rounded-full flex items-center justify-center text-[13px] text-white"
                        style={{ background:isTop3?medalColors[p.rank-1]:"#e5e7eb",
                          color:isTop3?"#fff":"#6b7280",
                          fontFamily: "var(--font-sans)", fontWeight:700 }}>
                        {p.rank}
                      </div>
                    ) : <span className="text-[13px] text-[#635647]">–</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] text-[#0b1426]"
                      style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>{p.name}</div>
                    {p.position && (
                      <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{p.position}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#4a5568]" style={{ fontFamily: "var(--font-sans)" }}>
                    {p.donVi}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] px-2 py-0.5 rounded border`}
                      style={{ color:p.type==="ca_nhan"?"#1a4fa0":"#92400e",
                        background:p.type==="ca_nhan"?"#dbeafe":"#fde8cc",
                        borderColor:p.type==="ca_nhan"?"#93c5fd":"#fdba74",
                        fontFamily: "var(--font-sans)" }}>
                      {p.type==="ca_nhan" ? "Cá nhân" : "Tập thể"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                    {p.nopLuc ? fmtDate(p.nopLuc) : "–"}
                  </td>
                  <td className="px-4 py-3">
                    {p.score !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="text-[14px]"
                          style={{ fontFamily: "var(--font-sans)", fontWeight:700,
                            color:p.score>=90?"#0f7a3e":p.score>=75?theme.primary:"#c2410c" }}>
                          {p.score}
                        </div>
                        <div className="flex-1 w-16 h-1.5 rounded-full bg-[#eef2f8] overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{ width:`${p.score}%`,
                              background:p.score>=90?"#16a34a":p.score>=75?theme.primary:"#dc2626" }} />
                        </div>
                      </div>
                    ) : <span className="text-[13px] text-[#635647]">–</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] px-2 py-0.5 rounded border"
                      style={{ color:hs.color, background:hs.bg, borderColor:hs.border, fontFamily: "var(--font-sans)", fontWeight:500 }}>
                      {hs.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(p.hoSoStatus === "da_nop" || p.hoSoStatus === "da_duyet") && (
                      <button
                        onClick={() => setHoSoOpen(p)}
                        className="flex items-center gap-1 px-2.5 h-7 rounded-[5px] border text-[13px] transition-colors hover:bg-[#dbeafe]"
                        style={{ borderColor:"#93c5fd", color:"#1a4fa0", background:"#eff6ff", fontFamily: "var(--font-sans)" }}>
                        <FileCheck className="size-3" />Hồ sơ
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    {hoSoOpen && <HoSoDrawer p={hoSoOpen} onClose={() => setHoSoOpen(null)} />}
  </>);
}

/* ═══════════════════════════════════════════════════════════════════
   SCORING TAB (Leaderboard)
═══════════════════════════════════════════════════════════════════ */
function ScoringTab({ c }: { c: Campaign }) {
  const { theme } = useTheme();
  const [expandId, setExpandId] = useState<string|null>(null);
  const maxScore = c.tieuChi.reduce((s,t)=>s+t.maxScore,0);
  const criteriaColors = ["#1C5FBE","#0f7a3e","#7c3aed","#b45309","#9f1239"];

  if (!c.unitScores.length) return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <BarChart2 className="size-12 text-[#e2e8f0]" />
      <p className="text-[14px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
        Chưa có dữ liệu chấm điểm. Giai đoạn này sẽ bắt đầu sau khi hội đồng xét duyệt.
      </p>
    </div>
  );

  const sorted = [...c.unitScores].sort((a,b) => b.total - a.total);

  return (
    <div className="space-y-5">
      {/* Criteria legend */}
      <div className="rounded-[10px] border p-4" style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="size-4" style={{ color:theme.primary }} />
          <span className="text-[13px] text-[#0b1426]"
            style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
            Bộ tiêu chí — Tổng {maxScore} điểm (Điều 10 NĐ 152/2025/NĐ-CP)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {c.tieuChi.map((t,i) => (
            <div key={t.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border"
              style={{ borderColor:criteriaColors[i]+"40", background:criteriaColors[i]+"08" }}>
              <div className="size-4 rounded-full flex items-center justify-center text-[13px] text-white"
                style={{ background:criteriaColors[i], fontFamily: "var(--font-sans)", fontWeight:700 }}>
                {t.maxScore}
              </div>
              <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{t.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {sorted.map((u, idx) => {
          const pct     = maxScore ? u.total / maxScore : 0;
          const isOpen  = expandId === u.unitId;
          const isTop3  = idx < 3;
          const medalBg = idx===0?"#fdf3d9":idx===1?"#f3f4f6":idx===2?"#fff7ed":"#f8fafc";
          const medalFg = idx===0?"#7d4a00":idx===1?"#374151":idx===2?"#92400e":"#5a5040";
          const scoreColor = pct>=0.9?"#0f7a3e":pct>=0.75?theme.primary:"#c2410c";

          return (
            <div key={u.unitId}
              className="rounded-[10px] border overflow-hidden transition-shadow hover:shadow-sm"
              style={{ borderColor: u.status==="chua_cham"?"#fcd34d":isTop3?"#d9d1bd":"var(--color-line)" }}>
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#f8fafc]"
                onClick={() => setExpandId(isOpen ? null : u.unitId)}>

                {/* Rank medal */}
                <div className="size-10 rounded-full flex items-center justify-center shrink-0 text-[14px]"
                  style={{ background:medalBg, fontFamily: "var(--font-sans)", fontWeight:700, color:medalFg }}>
                  {u.status==="chua_cham" ? "–" : idx+1}
                </div>

                {/* Name + bars */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[14px] text-[#0b1426]"
                      style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{u.unitName}</span>
                    {u.status==="chua_cham" && (
                      <span className="text-[13px] px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]"
                        style={{ fontFamily: "var(--font-sans)" }}>Chưa chấm</span>
                    )}
                    {idx===0 && u.status==="da_cham" && (
                      <span className="flex items-center gap-1 text-[13px] px-2 py-0.5 rounded bg-[#fdf3d9] text-[#7d4a00] border border-[#f0dba0]"
                        style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
                        <Medal className="size-3" style={{ color:"#8a6400" }} />Dẫn đầu
                      </span>
                    )}
                  </div>
                  {u.status==="da_cham" && (
                    <div className="flex items-center gap-1.5">
                      {c.tieuChi.map((t,ti) => (
                        <div key={t.id} className="relative" style={{ width:`${(t.maxScore/maxScore)*100}%`, minWidth:20 }}>
                          <div className="h-2 rounded-sm overflow-hidden bg-[#eef2f8]">
                            <div className="h-full rounded-sm"
                              style={{ width:`${(u.scores[t.id]??0)/t.maxScore*100}%`, background:criteriaColors[ti] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div className="shrink-0 text-right">
                  {u.status==="da_cham" ? (
                    <>
                      <div className="text-[24px]"
                        style={{ fontFamily: "var(--font-sans)", fontWeight:700, color:scoreColor, lineHeight:1 }}>
                        {u.total}
                      </div>
                      <div className="text-[13px]"
                        style={{ color:scoreColor, fontFamily: "var(--font-sans)" }}>
                        / {maxScore} · {Math.round(pct*100)}%
                      </div>
                    </>
                  ) : (
                    <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>–</span>
                  )}
                </div>

                {isOpen
                  ? <ChevronUp className="size-4 text-[#635647] shrink-0" />
                  : <ChevronDown className="size-4 text-[#635647] shrink-0" />}
              </button>

              {/* Expanded detail */}
              {isOpen && u.status==="da_cham" && (
                <div className="px-5 pb-5 pt-0 border-t" style={{ borderColor:"var(--color-line)" }}>
                  <div className="grid grid-cols-5 gap-3 pt-4">
                    {c.tieuChi.map((t,ti) => {
                      const val = u.scores[t.id] ?? 0;
                      const p   = val / t.maxScore;
                      const cc  = criteriaColors[ti];
                      return (
                        <div key={t.id} className="rounded-[8px] border p-3 text-center"
                          style={{ borderColor:cc+"30", background:cc+"05" }}>
                          <div className="text-[13px] text-[#635647] mb-2 leading-tight"
                            style={{ fontFamily: "var(--font-sans)" }}>{t.name}</div>
                          <div className="text-[18px]"
                            style={{ fontFamily: "var(--font-sans)", fontWeight:700,
                              color:p>=0.9?"#0f7a3e":p>=0.75?cc:"#c2410c", lineHeight:1 }}>
                            {val}
                          </div>
                          <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>/{t.maxScore}</div>
                          <div className="mt-2 h-1.5 rounded-full bg-[#eef2f8] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width:`${p*100}%`, background:cc }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {u.ghiChu && (
                    <p className="mt-3 text-[13px] text-[#635647] italic" style={{ fontFamily: "var(--font-sans)" }}>
                      Ghi chú: {u.ghiChu}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HISTORY TAB
═══════════════════════════════════════════════════════════════════ */
function HistoryTab({ c }: { c: Campaign }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-[8px] bg-[#ddeafc] border border-[#1C5FBE30]">
        <Shield className="size-4 text-[#1C5FBE] shrink-0" />
        <p className="text-[13px] text-[#1a4fa0]" style={{ fontFamily: "var(--font-sans)" }}>
          Toàn bộ thao tác được ghi nhận — tuân thủ yêu cầu truy vết, kiểm tra theo NĐ 30/2020/NĐ-CP và TT 15/2025/TT-BNV.
        </p>
      </div>

      {!c.auditLog.length ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FileText className="size-10 text-[#e2e8f0]" />
          <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Chưa có lịch sử hoạt động</p>
        </div>
      ) : (
        <div className="relative pl-6 max-w-3xl">
          <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-[#e2e8f0]" />
          {[...c.auditLog].reverse().map((e) => {
            const sc = STATE_CFG[e.state];
            const phase = getPhaseOf(e.state);
            const Icon  = sc.icon;
            return (
              <div key={e.id} className="relative mb-5 last:mb-0">
                {/* Node */}
                <div className="absolute -left-[21px] size-5 rounded-full border-2 border-white flex items-center justify-center mt-1"
                  style={{ background:sc.color }}>
                  <Icon className="size-2.5 text-white" />
                </div>
                <div className="rounded-[10px] border bg-white overflow-hidden"
                  style={{ borderColor:"var(--color-line)" }}>
                  <div className="px-4 py-3 flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[14px] text-[#0b1426]"
                          style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{e.action}</span>
                        <span className="text-[13px] px-2 py-0.5 rounded border"
                          style={{ color:sc.color, background:sc.bg, borderColor:sc.border, fontFamily: "var(--font-sans)", fontWeight:500 }}>
                          {sc.label}
                        </span>
                        <span className="text-[13px] px-1.5 py-0.5 rounded text-white"
                          style={{ background:phase.color, fontFamily: "var(--font-sans)" }}>
                          {phase.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#4a5568] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                        {e.detail}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[13px] text-[#0b1426]"
                        style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>{e.actor}</div>
                      <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                        {e.role}
                      </div>
                      <div className="text-[13px] text-[#635647] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                        {e.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP WORKSPACE PANEL
═══════════════════════════════════════════════════════════════════ */
function SectionHeader({ icon: Icon, title, sub, color }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string; sub?: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="size-10 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}>
        <Icon className="size-5" style={{ color }} />
      </div>
      <div>
        <h2 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{title}</h2>
        {sub && <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{sub}</p>}
      </div>
    </div>
  );
}

function CheckRow({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b last:border-b-0" style={{ borderColor: "#eef2f8" }}>
      <div className={`size-5 rounded-full flex items-center justify-center shrink-0`}
        style={{ background: done ? "#dcfce7" : "#eef2f8", border: `1.5px solid ${done ? "#86efac" : "#d1ccc0"}` }}>
        {done ? <CheckCircle2 className="size-3 text-[#166534]" /> : <CircleDot className="size-3 text-[#b8b0a0]" />}
      </div>
      <span className="text-[13px]" style={{ color: done ? "#0b1426" : "#635647", fontFamily: "var(--font-sans)", fontDecoration: done ? "none" : "none" }}>
        {text}
      </span>
    </div>
  );
}

function InfoCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }) {
  return (
    <div className="rounded-[10px] border p-4" style={{ borderColor: `${color}30`, background: `${color}08` }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="size-3.5" style={{ color }} />
        <span className="text-[13px] uppercase tracking-wide" style={{ color, fontWeight: 700, fontFamily: "var(--font-sans)" }}>{label}</span>
      </div>
      <div className="text-[18px]" style={{ color: "#0b1426", fontFamily: "var(--font-sans)", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function RoleBadge({ role, canAct }: { role: string; canAct: boolean }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border`}
      style={{
        background: canAct ? "#dcfce7" : "#f3f4f6",
        borderColor: canAct ? "#86efac" : "#d1d5db",
        color: canAct ? "#166534" : "#6b7280",
        fontFamily: "var(--font-sans)", fontWeight: 600,
      }}>
      {canAct ? <CheckCircle2 className="size-3" /> : <Eye className="size-3" />}
      {role} · {canAct ? "Có thể thao tác" : "Chỉ xem"}
    </div>
  );
}

/* ─── PersonalStatusBanner — hồ sơ tracker cho vai trò "cá nhân" ── */
function PersonalStatusBanner({ c, myP, danh_hieu, hoTen, indivDone }: {
  c: Campaign; myP: Participant | null;
  danh_hieu: string; hoTen: string; indivDone: boolean;
}) {
  const STATE_IDX: Partial<Record<CampaignState, number>> = {
    draft:0, submitted:1, approved:2, published:3,
    active:4, submission_closed:5,
    unit_review:6, council_review:7, final_approval:8,
    decision_issued:9, public:10, archived:11,
  };
  const si = STATE_IDX[c.state] ?? 0;
  const registered  = indivDone || !!myP;
  const submitted   = registered && myP?.hoSoStatus !== "chua_nop";
  const unitDone    = si >= 7 || myP?.hoSoStatus === "da_duyet";
  const councilDone = si >= 8;
  const hasResult   = si >= 9;

  const steps = [
    { label: "Đăng ký",      done: registered },
    { label: "Nộp hồ sơ",    done: !!submitted },
    { label: "Thẩm định CS", done: !!unitDone },
    { label: "Hội đồng xét", done: councilDone },
    { label: "Kết quả",      done: hasResult },
  ];
  const activeStep = steps.findIndex(s => !s.done);

  const statusColor = myP?.hoSoStatus === "da_duyet" ? "#166534"
    : myP?.hoSoStatus === "tra_lai" ? "#c8102e"
    : myP?.hoSoStatus === "da_nop"  ? "#1C5FBE"
    : registered ? "#b45309" : "#635647";
  const statusLabel = myP?.hoSoStatus === "da_duyet" ? "Được duyệt ✅"
    : myP?.hoSoStatus === "tra_lai" ? "Trả lại ❌"
    : myP?.hoSoStatus === "da_nop"  ? "Chờ thẩm định ⏳"
    : registered ? "Đã đăng ký" : "Chưa đăng ký";

  return (
    <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#fcd34d" }}>
      <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: "#fefce8", borderColor: "#fcd34d" }}>
        <User className="size-4 text-[#92400e]" />
        <span className="text-[13px] text-[#92400e] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
          Theo dõi hồ sơ — {hoTen}
        </span>
        <span className="ml-auto text-[13px] px-2.5 py-0.5 rounded-full font-semibold"
          style={{ background: statusColor + "20", color: statusColor, border: `1px solid ${statusColor}40` }}>
          {statusLabel}
        </span>
      </div>
      <div className="px-5 py-4" style={{ background: "#fefce8" }}>
        {/* Stepper */}
        <div className="flex items-center mb-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="size-6 rounded-full flex items-center justify-center text-[13px]"
                  style={{
                    background: s.done ? "#166534" : i === activeStep ? "#fcd34d" : "#e2e8f0",
                    color: s.done ? "white" : i === activeStep ? "#92400e" : "#4f5d6e",
                    fontWeight: 700,
                    border: i === activeStep ? "2px solid #b45309" : "none",
                  }}>
                  {s.done ? "✓" : i + 1}
                </div>
                <span className="text-[13px] text-center whitespace-nowrap"
                  style={{ fontFamily: "var(--font-sans)", color: s.done ? "#166534" : i === activeStep ? "#92400e" : "#4f5d6e", fontWeight: s.done || i === activeStep ? 600 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1.5 mt-[-10px] rounded-full"
                  style={{ background: s.done && steps[i + 1].done ? "#166534" : s.done ? "#bbf7d0" : "#e2e8f0" }} />
              )}
            </div>
          ))}
        </div>
        {/* Info row */}
        <div className="flex flex-wrap gap-4 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
          <span className="text-[#635647]">Danh hiệu: <strong className="text-[#0b1426]">{danh_hieu}</strong></span>
          {myP && <span className="text-[#635647]">Đơn vị: <strong className="text-[#0b1426]">{myP.donVi}</strong></span>}
          {myP?.score !== undefined && (
            <span style={{ color: myP.score >= 90 ? "#0f7a3e" : "#b45309" }}>
              Điểm: <strong>{myP.score}</strong>
            </span>
          )}
          {hasResult && myP?.hoSoStatus === "da_duyet" && (
            <span className="px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac" }}>
              🎉 Được khen thưởng
            </span>
          )}
          {myP?.hoSoStatus === "tra_lai" && myP.lyDoTraLai && (
            <span style={{ color: "#c8102e" }}>Lý do: <em>{myP.lyDoTraLai}</em></span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── UnitLeaderContextPanel — dashboard đơn vị cho "lãnh đạo đơn vị" */
function UnitLeaderContextPanel({ c, user, unitDecisions }: {
  c: Campaign; user: LoginUser;
  unitDecisions: Record<string, "approved" | "rejected">;
}) {
  const unitMembers = c.participants.filter(p => p.donVi === (user.unit || ""));
  const display = unitMembers.length > 0 ? unitMembers : c.participants.slice(0, 3);
  const getEff = (p: Participant) =>
    unitDecisions[p.id] === "approved" ? "da_duyet"
    : unitDecisions[p.id] === "rejected" ? "tra_lai"
    : p.hoSoStatus;

  const approved = display.filter(p => getEff(p) === "da_duyet").length;
  const pending  = display.filter(p => getEff(p) === "da_nop").length;

  const sCfg: Record<string, { label: string; color: string; bg: string }> = {
    da_duyet: { label: "✅ Được duyệt",    color: "#166534", bg: "#f0fdf4" },
    da_nop:   { label: "⏳ Chờ thẩm định", color: "#1a4fa0", bg: "#eff6ff" },
    tra_lai:  { label: "❌ Trả lại",       color: "#9f1239", bg: "#fff1f2" },
    chua_nop: { label: "○ Chưa nộp",      color: "#6b7280", bg: "white"   },
  };

  return (
    <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#86efac" }}>
      <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
        <Building2 className="size-4 text-[#166534]" />
        <span className="text-[13px] text-[#166534] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
          {user.unit || "Đơn vị"} — Theo dõi hồ sơ thành viên
        </span>
        <div className="ml-auto flex gap-2">
          <span className="text-[13px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#bbf7d0", color: "#166534" }}>
            {approved}/{display.length} được duyệt
          </span>
          {pending > 0 && (
            <span className="text-[13px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#dbeafe", color: "#1a4fa0" }}>
              {pending} đang chờ
            </span>
          )}
        </div>
      </div>
      <div className="px-5 py-3 grid grid-cols-3 gap-2" style={{ background: "#f0fdf4" }}>
        {[
          { label: "Đã nộp",   val: display.filter(p => p.hoSoStatus !== "chua_nop").length, color: "#1C5FBE", bg: "#dbeafe" },
          { label: "Đã duyệt", val: approved, color: "#166534", bg: "#dcfce7" },
          { label: "Chờ xét",  val: pending, color: pending > 0 ? "#c2410c" : "#635647", bg: pending > 0 ? "#fff7ed" : "#f4f7fb" },
        ].map(k => (
          <div key={k.label} className="text-center py-2 rounded-[8px]" style={{ background: k.bg }}>
            <div className="text-[18px] font-bold" style={{ color: k.color, fontFamily: "var(--font-sans)" }}>{k.val}</div>
            <div className="text-[13px]" style={{ color: k.color, fontFamily: "var(--font-sans)" }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div className="divide-y" style={{ borderColor: "#bbf7d0" }}>
        {display.slice(0, 5).map(p => {
          const eff = getEff(p);
          const sc = sCfg[eff] ?? sCfg.chua_nop;
          return (
            <div key={p.id} className="px-5 py-2.5 flex items-center gap-3" style={{ background: sc.bg }}>
              <div className="size-7 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
                style={{ background: "#166534", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                {p.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#0b1426] truncate">{p.name}</div>
                <div className="text-[13px] text-[#635647]">{p.hinhThucDeNghi || "CSTĐCS"}</div>
              </div>
              {p.score !== undefined && (
                <span className="text-[13px] font-bold shrink-0" style={{ color: p.score >= 90 ? "#0f7a3e" : "#b45309", fontFamily: "var(--font-sans)" }}>{p.score}</span>
              )}
              <span className="text-[13px] font-semibold shrink-0" style={{ color: sc.color }}>{sc.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── AdminHealthBar — tóm tắt sức khỏe chiến dịch cho Admin ──── */
function AdminHealthBar({ c }: { c: Campaign }) {
  const submittedCnt = c.participants.filter(p => p.hoSoStatus !== "chua_nop").length;
  const approvedCnt  = c.participants.filter(p => p.hoSoStatus === "da_duyet").length;
  const auditCnt     = c.auditLog.length;
  const pct = c.participants.length > 0 ? Math.round(submittedCnt / c.participants.length * 100) : 0;
  return (
    <div className="rounded-[10px] border px-5 py-3 flex items-center gap-6 flex-wrap"
      style={{ borderColor: "#0891b2", background: "#ecfeff" }}>
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-[#0891b2]" />
        <span className="text-[13px] font-semibold text-[#0e7490]" style={{ fontFamily: "var(--font-sans)" }}>Quản trị · Theo dõi hệ thống</span>
      </div>
      {[
        { label: "Hồ sơ nộp", val: `${submittedCnt}/${c.participants.length} (${pct}%)`, color: "#1C5FBE" },
        { label: "Đã duyệt",  val: `${approvedCnt}`,  color: "#166534" },
        { label: "Audit log", val: `${auditCnt} bản ghi`, color: "#7c3aed" },
        { label: "Code",      val: c.code ?? "—", color: "#0891b2" },
      ].map(k => (
        <div key={k.label} className="text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
          <span className="text-[#635647]">{k.label}: </span>
          <span className="font-bold" style={{ color: k.color }}>{k.val}</span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <div className="text-[13px] text-[#0e7490]" style={{ fontFamily: "var(--font-sans)" }}>SLA: </div>
        <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: "#cffafe" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? "#0891b2" : "#f59e0b" }} />
        </div>
        <span className="text-[13px] font-bold" style={{ color: pct >= 80 ? "#0891b2" : "#b45309" }}>{pct}%</span>
      </div>
    </div>
  );
}

function StepWorkspacePanel({ c, user, onTransition, onBack, onAddParticipant }: {
  c: Campaign; user: LoginUser;
  onTransition: (id: string, ns: CampaignState) => void;
  onBack: () => void;
  onAddParticipant: (campaignId: string, p: Participant) => void;
}) {
  const { theme } = useTheme();
  const canMove = canTransition(user, c);
  const isIndividual = user.role === "cá nhân";
  const isUnitLeader = user.role === "lãnh đạo đơn vị";
  const isHighLeader = user.role === "lãnh đạo cấp cao";
  const isAdmin      = user.role === "quản trị hệ thống";
  const [note, setNote] = useState("");
  const [votes, setVotes] = useState<Record<string, "yes" | "no" | null>>({});
  const [unitDecisions, setUnitDecisions] = useState<Record<string, "approved" | "rejected">>({});
  const [registering, setRegistering] = useState(false);
  const [regDone, setRegDone] = useState(false);
  const [indivDone, setIndivDone] = useState(false);
  const [notifChannels, setNotifChannels] = useState([true, true, true, false]);
  const [regForm, setRegForm] = useState({ hoTen: user.name || "", donVi: user.unit || "", danh_hieu: "CSTĐCS", ly_do: "" });
  const [regTouched, setRegTouched] = useState<Record<string, boolean>>({});
  const regTouch = (k: string) => setRegTouched(t => ({ ...t, [k]: true }));
  const regErrs = {
    hoTen:  regForm.hoTen.trim().length < 2   ? "Vui lòng nhập họ tên (ít nhất 2 ký tự)" : null,
    donVi:  regForm.donVi.trim().length < 2   ? "Vui lòng nhập tên đơn vị (ít nhất 2 ký tự)" : null,
    ly_do:  regForm.ly_do.trim().length < 20  ? `Mô tả cần ít nhất 20 ký tự (${regForm.ly_do.trim().length}/20)` : null,
  };
  const regValid = !regErrs.hoTen && !regErrs.donVi && !regErrs.ly_do;
  const totalVotersConst = 7;
  const [quorumPresent, setQuorumPresent] = useState(c.quorumActual ?? totalVotersConst);
  const [budgetApproved, setBudgetApproved] = useState(false);
  const [budgetNguon, setBudgetNguon] = useState<NguonKinhPhi>("quy_thi_dua");
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>({});
  const [quyetToanDone, setQuyetToanDone] = useState(false);
  const [publicComments, setPublicComments] = useState<{id:string;author:string;unit:string;content:string;time:string;thumbsUp:number}[]>([
    {id:"pc1",author:"Nguyễn Văn An",unit:"Sở GD&ĐT",content:"Nhất trí với danh sách đề nghị khen thưởng. Đề nghị bổ sung thành tích phong trào thi đua tập thể vào phần thuyết minh hồ sơ.",time:"20/04/2026",thumbsUp:5},
    {id:"pc2",author:"Trần Thị Bình",unit:"Sở Y tế",content:"Các hồ sơ đã được kiểm tra kỹ lưỡng. Đề xuất cân nhắc thêm một số cá nhân có thành tích đột phá về cải tiến quy trình.",time:"21/04/2026",thumbsUp:3},
    {id:"pc3",author:"Phạm Quốc Cường",unit:"Sở GTVT",content:"Đồng ý với toàn bộ hồ sơ. Tiêu chí chấm điểm cần được làm rõ hơn trong hướng dẫn năm tới.",time:"22/04/2026",thumbsUp:2},
  ]);
  const [commentInput, setCommentInput] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [thumbedUp, setThumbedUp] = useState<Set<string>>(new Set());
  const [tongKetNote, setTongKetNote] = useState("");
  const [tongKetDone, setTongKetDone] = useState(false);
  const [minutesForm, setMinutesForm] = useState({
    soHieu: `BB-HĐTĐKT-${new Date().getFullYear()}-001`,
    ngayHop: new Date().toISOString().slice(0, 10),
    diaDiem: "Phòng họp UBND Tỉnh Đồng Nai",
    chuToa: "", thuKy: "", noiDung: "", ghiChu: "", signed: false,
  });
  const [sigPin, setSigPin] = useState("");
  const [sigConfirmed, setSigConfirmed] = useState(false);

  /* ── helper: participant record for current individual user ── */
  const myParticipant: Participant | null = isIndividual
    ? (c.participants.find(p => p.name === user.name) ?? c.participants[0] ?? null)
    : null;

  const scfg = STATE_CFG[c.state];

  const doTransition = () => {
    onTransition(c.id, nextState(c.state));
  };

  const approvedCount = c.participants.filter(p => p.hoSoStatus === "da_duyet").length;
  const submittedCount = c.participants.filter(p => p.hoSoStatus === "da_nop" || p.hoSoStatus === "da_duyet").length;
  const yesVotes = Object.values(votes).filter(v => v === "yes").length;
  const noVotes = Object.values(votes).filter(v => v === "no").length;

  /* ── DRAFT ─────────────────────────────────────────────────────── */
  if (c.state === "draft") {
    const checks = [
      { done: !!c.name && c.name.length > 5, text: "Tên phong trào đã điền đầy đủ" },
      { done: !!c.mucTieu && c.mucTieu.length > 20, text: "Mục tiêu phong trào đã mô tả rõ ràng" },
      { done: !!c.doiTuong && c.doiTuong.length > 10, text: "Đối tượng tham gia đã xác định" },
      { done: c.tieuChi.length >= 3, text: `Bộ tiêu chí chấm điểm (${c.tieuChi.length} tiêu chí)` },
      { done: !!c.ngayBatDau && !!c.ngayKetThuc, text: "Thời gian bắt đầu và kết thúc đã thiết lập" },
      { done: !!c.ngayNopHoSo, text: "Hạn nộp hồ sơ đã xác định" },
      { done: c.awards.length >= 1, text: `Hình thức khen thưởng (${c.awards.length} loại)` },
      { done: c.canCuPhapLy.length >= 2, text: `Căn cứ pháp lý (${c.canCuPhapLy.length} văn bản)` },
    ];
    const doneCount = checks.filter(c => c.done).length;
    const ready = doneCount === checks.length;

    return (
      <div className="space-y-6">
        <SectionHeader icon={PenLine} title="Soạn thảo Kế hoạch Phong trào" sub="Hoàn thiện nội dung trước khi trình phê duyệt lên Hội đồng TĐKT" color="#5a5040" />

        <div className="grid grid-cols-3 gap-4">
          <InfoCard label="Hoàn thiện" value={`${doneCount}/${checks.length}`} icon={ListChecks} color={ready ? "#166534" : "#b45309"} />
          <InfoCard label="Tiêu chí" value={`${c.tieuChi.length} tiêu chí`} icon={Scale} color="#7c3aed" />
          <InfoCard label="Khen thưởng" value={`${c.awards.length} hình thức`} icon={Award} color="#8a6400" />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
              <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Checklist soạn thảo</span>
              <span className="text-[13px] px-2 py-0.5 rounded-full" style={{ background: ready ? "#dcfce7" : "#fef3c7", color: ready ? "#166534" : "#b45309", fontWeight: 600 }}>
                {ready ? "✅ Sẵn sàng trình duyệt" : `${checks.length - doneCount} mục còn thiếu`}
              </span>
            </div>
            <div className="px-4 py-2">
              {checks.map((ck, i) => <CheckRow key={i} done={ck.done} text={ck.text} />)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
              <div className="px-4 py-3 border-b" style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
                <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Ghi chú trình duyệt</span>
              </div>
              <div className="p-4">
                <textarea
                  className="ds-input w-full" rows={4}
                  style={{ padding: "10px 12px", resize: "vertical", fontSize: 13 }}
                  placeholder="Ghi chú thêm khi trình phê duyệt (không bắt buộc)..."
                  value={note} onChange={e => setNote(e.target.value)}
                  disabled={!canMove}
                />
              </div>
            </div>

            <div className="rounded-[12px] border p-4" style={{ borderColor: "#1C5FBE30", background: "#f0f6ff" }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="size-4 text-[#1C5FBE]" />
                <span className="text-[13px] text-[#1a4fa0] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Quy trình tiếp theo</span>
              </div>
              <div className="space-y-2">
                {[
                  { step: "Hội đồng thẩm tra", desc: "Thư ký HĐ TĐKT kiểm tra tính hợp lệ" },
                  { step: "Phê duyệt kế hoạch", desc: "Hội đồng phê duyệt hoặc yêu cầu chỉnh sửa" },
                  { step: "Lãnh đạo ban hành", desc: "LĐCC ký ban hành và công bố phong trào" },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-[13px]">
                    <span className="size-4 rounded-full bg-[#1C5FBE] text-white flex items-center justify-center shrink-0 mt-0.5 text-[13px] font-bold">{i + 1}</span>
                    <div><span className="font-semibold text-[#1a4fa0]">{s.step}</span><span className="text-[#5a5040]"> — {s.desc}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <RoleBadge role={user.roleLabel || user.role} canAct={canMove} />

            {canMove && (
              <ReadinessPanel warnings={checkTransitionReadiness(c, { draftReady: ready, draftMissing: checks.length - doneCount })} />
            )}
            {canMove && (
              <DsButton variant="primary" size="lg" disabled={!ready} onClick={doTransition} className="w-full">
                <Send className="size-4" />Trình phê duyệt lên Hội đồng TĐKT
              </DsButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── SUBMITTED ─────────────────────────────────────────────────── */
  if (c.state === "submitted") {
    const isReviewer = canMove;
    return (
      <div className="space-y-6">
        <SectionHeader icon={Send} title="Đang chờ phê duyệt kế hoạch" sub="Hội đồng TĐKT thẩm tra nội dung, đối chiếu tiêu chí pháp lý" color="#0e7490" />

        <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#0e749030" }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ background: "#f0fdfe", borderBottom: "1px solid #0e749020" }}>
            <div className="size-10 rounded-full flex items-center justify-center" style={{ background: "#0e7490" }}>
              <FileText className="size-5 text-white" />
            </div>
            <div>
              <div className="text-[14px] text-[#0b1426] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Kế hoạch phong trào đã được trình</div>
              <div className="text-[13px] text-[#0e7490]" style={{ fontFamily: "var(--font-sans)" }}>
                {c.auditLog.find(a => a.state === "submitted")?.time || "Chưa rõ"} · {c.auditLog.find(a => a.state === "submitted")?.actor || "—"}
              </div>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border animate-pulse"
                style={{ background: "#e0f2fe", borderColor: "#67e8f9", color: "#0e7490", fontWeight: 600 }}>
                <Clock className="size-3.5" />Chờ Hội đồng xét
              </span>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><span className="text-[13px] text-[#635647] uppercase tracking-wide font-bold">Tên phong trào</span><p className="text-[13px] text-[#0b1426] mt-0.5 font-semibold">{c.name}</p></div>
              <div><span className="text-[13px] text-[#635647] uppercase tracking-wide font-bold">Cấp độ</span><p className="text-[13px] text-[#0b1426] mt-0.5">{c.level}</p></div>
              <div><span className="text-[13px] text-[#635647] uppercase tracking-wide font-bold">Thời gian</span><p className="text-[13px] text-[#0b1426] mt-0.5">{c.period}</p></div>
              <div><span className="text-[13px] text-[#635647] uppercase tracking-wide font-bold">Người phụ trách</span><p className="text-[13px] text-[#0b1426] mt-0.5">{c.leader}</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.canCuPhapLy.map(p => (
                <span key={p} className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[13px]"
                  style={{ background: "#ddeafc", color: "#1a4fa0", border: "1px solid #1C5FBE30" }}>
                  <BookOpen className="size-3" />{p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {isReviewer && (
          <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#7c3aed30" }}>
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: "#f5f3ff", borderColor: "#7c3aed20" }}>
              <Gavel className="size-4 text-[#7c3aed]" />
              <span className="text-[13px] text-[#7c3aed] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Hội đồng — Bảng thẩm tra</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                "Tên phong trào rõ ràng, không trùng lắp với phong trào hiện hành",
                "Mục tiêu phù hợp với định hướng của UBND Tỉnh",
                "Bộ tiêu chí đủ căn cứ pháp lý (Điều 10 NĐ 152/2025/NĐ-CP)",
                "Thời gian hợp lý, không chồng lấn với phong trào khác",
                "Hình thức khen thưởng nằm trong thẩm quyền phê duyệt",
              ].map((item, i) => <CheckRow key={i} done={true} text={item} />)}

              <div className="pt-3">
                <label className="text-[13px] font-semibold text-[#0b1426] block mb-2" style={{ fontFamily: "var(--font-sans)" }}>Ý kiến Hội đồng</label>
                <textarea className="ds-input w-full" rows={3} style={{ padding: "10px 12px", fontSize: 13, resize: "vertical" }}
                  placeholder="Ghi nhận ý kiến, điều kiện kèm theo (nếu có)..."
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>

              <div className="flex gap-3 pt-2">
                <DsButton variant="primary" size="md" className="flex-1" onClick={doTransition}>
                  <ThumbsUp className="size-4" />Phê duyệt kế hoạch
                </DsButton>
                <DsButton variant="secondary" size="md" className="flex-1" onClick={() => onTransition(c.id, "draft")}>
                  <RotateCcw className="size-4" />Trả về chỉnh sửa
                </DsButton>
              </div>
            </div>
          </div>
        )}

        {!isReviewer && (
          <div className="rounded-[12px] border p-5 flex items-center gap-4" style={{ borderColor: "#fcd34d", background: "#fef9ec" }}>
            <Clock className="size-8 text-[#b45309] shrink-0" />
            <div>
              <p className="text-[14px] text-[#92400e] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Đang chờ Hội đồng TĐKT xem xét</p>
              <p className="text-[13px] text-[#92400e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                Hội đồng sẽ thẩm tra tính hợp lệ và phê duyệt hoặc yêu cầu chỉnh sửa. Bạn sẽ nhận thông báo khi có kết quả.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── APPROVED ──────────────────────────────────────────────────── */
  if (c.state === "approved") {
    return (
      <div className="space-y-6">
        <SectionHeader icon={CheckCircle2} title="Kế hoạch đã được phê duyệt" sub="Chuẩn bị ban hành và công bố phong trào đến toàn bộ đơn vị" color="#1C5FBE" />

        <div className="rounded-[12px] border p-5 flex items-start gap-4" style={{ borderColor: "#86efac", background: "#f0fdf4" }}>
          <div className="size-12 rounded-full flex items-center justify-center shrink-0" style={{ background: "#166534" }}>
            <CheckCircle2 className="size-6 text-white" />
          </div>
          <div>
            <h3 className="text-[14px] text-[#166534] font-bold" style={{ fontFamily: "var(--font-sans)" }}>Phê duyệt thành công</h3>
            <p className="text-[13px] text-[#14532d] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
              Kế hoạch phong trào <strong>{c.name}</strong> đã được Hội đồng TĐKT phê duyệt. Lãnh đạo cấp cao có thể ký ban hành và công bố chính thức.
            </p>
          </div>
        </div>

        {/* ── PHÂN BỔ & PHÊ DUYỆT NGÂN SÁCH ──────────────────────── */}
        {(() => {
          const rewardForms = c.rewardForms ?? [];
          const tongKinhPhi = c.tongKinhPhi ?? 0;
          const mapped = c.awards.map(name => ({ name, r: getRewardByName(name), sl: rewardForms.find(rf => getRewardByName(name)?.id === rf.formId)?.soLuong ?? 0 }));
          const nguonOpts: { value: NguonKinhPhi; label: string }[] = [
            { value: "ngan_sach_nn", label: "Ngân sách Nhà nước (NSNN)" },
            { value: "quy_thi_dua",  label: "Quỹ Thi đua - Khen thưởng" },
            { value: "don_vi_tu_chi", label: "Đơn vị tự chi" },
          ];
          return (
            <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: budgetApproved ? "#86efac" : "#93c5fd" }}>
              <div className="px-5 py-3.5 border-b flex items-center gap-2"
                style={{ background: budgetApproved ? "#f0fdf4" : "#eff6ff", borderColor: budgetApproved ? "#86efac" : "#93c5fd" }}>
                <Hash className={`size-4 ${budgetApproved ? "text-[#166534]" : "text-[#1a4fa0]"}`} />
                <span className={`text-[13px] font-semibold ${budgetApproved ? "text-[#166534]" : "text-[#1a4fa0]"}`}
                  style={{ fontFamily: "var(--font-sans)" }}>
                  Phê duyệt nguồn kinh phí khen thưởng — Điều 4 TT 28/2025/TT-BTC
                </span>
                {budgetApproved && <span className="ml-auto flex items-center gap-1 text-[13px] px-2 py-0.5 rounded-full"
                  style={{ background: "#dcfce7", color: "#166534", fontFamily: "var(--font-sans)" }}>
                  <CheckCircle2 className="size-3" />Đã phê duyệt
                </span>}
              </div>
              <div className="px-5 py-4 space-y-3">
                {/* Dự toán từ wizard */}
                {(tongKinhPhi > 0 || mapped.some(m => m.sl > 0)) ? (
                  <div className="space-y-1.5">
                    <p className="text-[13px] text-[#635647] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>DỰ TOÁN SƠ BỘ (từ kế hoạch)</p>
                    {mapped.map(({ name, r, sl }) => r ? (
                      <div key={name} className="flex items-center gap-2 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                        <span className="flex-1 text-[#0b1426]">{name}</span>
                        <span className="text-[#635647]">{sl} người ×</span>
                        <span className="text-[#635647]">{formatTienThuong(r.tienThuong)}</span>
                        <span className="font-semibold text-[#0f7a3e] w-28 text-right">{formatTienThuong(r.tienThuong * sl)}</span>
                      </div>
                    ) : null)}
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--color-line)" }}>
                      <span className="text-[13px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>Tổng dự toán:</span>
                      <span className="text-[14px] font-bold text-[#0f7a3e]" style={{ fontFamily: "var(--font-sans)" }}>{formatTienThuong(tongKinhPhi)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#f59e0b]" style={{ fontFamily: "var(--font-sans)" }}>
                    Chưa có dự toán sơ bộ từ giai đoạn soạn thảo — nhập số lượng thủ công.
                  </p>
                )}
                {/* Chọn nguồn kinh phí */}
                {canMove && !budgetApproved && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[13px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>Nguồn kinh phí được phê duyệt:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {nguonOpts.map(o => (
                        <label key={o.value} className="flex items-center gap-2 p-2.5 rounded-[6px] border cursor-pointer transition-colors"
                          style={{ borderColor: budgetNguon === o.value ? theme.primary : "var(--color-line)", background: budgetNguon === o.value ? theme.tint : "#fff" }}>
                          <input type="radio" name="nguon" checked={budgetNguon === o.value}
                            onChange={() => setBudgetNguon(o.value)} className="size-3.5" style={{ accentColor: theme.primary }} />
                          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{o.label}</span>
                        </label>
                      ))}
                    </div>
                    <button onClick={() => setBudgetApproved(true)}
                      className="flex items-center gap-2 px-4 h-9 rounded-[6px] border text-[13px] font-semibold transition-all"
                      style={{ borderColor: "#166534", background: "#f0fdf4", color: "#166534", fontFamily: "var(--font-sans)" }}>
                      <CheckCircle2 className="size-4" />Phê duyệt nguồn kinh phí
                    </button>
                  </div>
                )}
                {budgetApproved && (
                  <div className="flex items-center gap-2 p-2.5 rounded-[6px] border" style={{ borderColor: "#86efac", background: "#f0fdf4" }}>
                    <CheckCircle2 className="size-4 text-[#166534]" />
                    <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>
                      Nguồn: <strong>{nguonOpts.find(o => o.value === budgetNguon)?.label}</strong> — Căn cứ: Điều 4 TT 28/2025/TT-BTC
                    </span>
                    <button className="ml-auto text-[13px] text-[#635647] underline" onClick={() => setBudgetApproved(false)}
                      style={{ fontFamily: "var(--font-sans)" }}>Sửa</button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
            <div className="px-4 py-3 border-b" style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
              <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Checklist trước ban hành</span>
            </div>
            <div className="px-4 py-2">
              {[
                { done: true, text: "Văn bản phê duyệt của Hội đồng đính kèm" },
                { done: true, text: "Quyết định phát động đã soạn thảo" },
                { done: c.awards.length > 0, text: "Hình thức khen thưởng đã xác định" },
                { done: budgetApproved, text: "Nguồn kinh phí đã được phê duyệt" },
                { done: !!c.donViPhuTrach, text: "Đơn vị phụ trách đã phân công" },
                { done: true, text: "Danh sách đơn vị nhận thông báo đã lập" },
              ].map((ck, i) => <CheckRow key={i} done={ck.done} text={ck.text} />)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
              <div className="px-4 py-3 border-b" style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
                <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Kênh thông báo khi ban hành</span>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { icon: MessageSquare, label: "Hệ thống TĐKT (tự động)" },
                  { icon: FileText, label: "Văn bản hành chính" },
                  { icon: Globe, label: "Cổng thông tin điện tử" },
                  { icon: MessageSquare, label: "Email thông báo đơn vị" },
                ].map((ch, i) => {
                  const Icon = ch.icon;
                  return (
                    <label key={i} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={notifChannels[i]}
                        onChange={e => setNotifChannels(prev => prev.map((v, j) => j === i ? e.target.checked : v))}
                        className="size-4" style={{ accentColor: theme.primary }} />
                      <Icon className="size-3.5 text-[#635647]" />
                      <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{ch.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <RoleBadge role={user.roleLabel || user.role} canAct={canMove} />
            {canMove && (
              <DsButton variant="primary" size="lg" onClick={doTransition} className="w-full">
                <Megaphone className="size-4" />Ban hành & Công bố phong trào
              </DsButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── PUBLISHED ─────────────────────────────────────────────────── */
  if (c.state === "published") {
    const daysToStart = Math.max(0, Math.ceil((new Date(c.ngayBatDau).getTime() - today.getTime()) / 86400000));
    return (
      <div className="space-y-6">
        <SectionHeader icon={Megaphone} title="Phong trào đã được ban hành & Công bố" sub="Chuẩn bị bắt đầu giai đoạn triển khai và nhận đăng ký" color="#4338ca" />

        <div className="rounded-[14px] overflow-hidden border" style={{ borderColor: "#a5b4fc" }}>
          <div className="px-6 py-5" style={{ background: "linear-gradient(135deg,#312e81,#4338ca)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="size-5 text-[#a5b4fc]" />
              <span className="text-[13px] text-[#a5b4fc] uppercase tracking-widest font-bold">Thông báo phát động chính thức</span>
            </div>
            <h3 className="text-[18px] text-white mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{c.name}</h3>
            <p className="text-[13px] text-white/70" style={{ fontFamily: "var(--font-sans)" }}>{c.mucTieu.slice(0, 120)}…</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="text-center">
                <div className="text-[24px] text-white font-bold" style={{ fontFamily: "var(--font-sans)" }}>{daysToStart}</div>
                <div className="text-[13px] text-white/60">ngày nữa bắt đầu</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <div className="text-[13px] text-white/80">{c.period}</div>
                <div className="text-[13px] text-white/50 mt-1">Hạn nộp: {fmtDate(c.ngayNopHoSo)}</div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center justify-between" style={{ background: "#e0e7ff" }}>
            <div className="flex items-center gap-2 text-[13px] text-[#3730a3]" style={{ fontFamily: "var(--font-sans)" }}>
              <Building2 className="size-3.5" />{c.donViPhuTrach} · {c.totalUnits} đơn vị trong phạm vi
            </div>
            <DsButton variant="secondary" size="sm">
              <Download className="size-3.5" />Tải thông báo PDF
            </DsButton>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {c.awards.map((a, i) => (
            <div key={a} className="rounded-[10px] border p-4 flex items-center gap-3"
              style={{ borderColor: "#f0dba0", background: "#fdf3d9" }}>
              <div className="size-8 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
                style={{ background: "#8a6400", fontFamily: "var(--font-sans)", fontWeight: 700 }}>{i + 1}</div>
              <span className="text-[13px] text-[#7d4a00]" style={{ fontFamily: "var(--font-sans)" }}>{a}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <RoleBadge role={user.roleLabel || user.role} canAct={canMove} />
          {canMove && (
            <DsButton variant="primary" size="lg" onClick={doTransition}>
              <Flag className="size-4" />Bắt đầu triển khai — Mở nhận đăng ký
            </DsButton>
          )}
        </div>
      </div>
    );
  }

  /* ── ACTIVE ────────────────────────────────────────────────────── */
  if (c.state === "active") {
    const isManager = canMove;
    const isUnit = user.role === "lãnh đạo đơn vị";
    const isIndividual = user.role === "cá nhân";
    const left = daysLeft(c.ngayNopHoSo);

    return (
      <div className="space-y-6">
        <SectionHeader icon={Flag} title="Đang triển khai — Nhận đăng ký & Hồ sơ" sub={`Hạn nộp hồ sơ: ${fmtDate(c.ngayNopHoSo)} · Còn ${left} ngày`} color="#166534" />

        {/* Manager dashboard */}
        {isManager && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <InfoCard label="Đã tham gia" value={`${c.joinedUnits}/${c.totalUnits}`} icon={Building2} color="#166534" />
              <InfoCard label="Hồ sơ đã nộp" value={`${submittedCount}`} icon={FileText} color="#1C5FBE" />
              <InfoCard label="Đã duyệt" value={`${approvedCount}`} icon={CheckCircle2} color="#0f7a3e" />
              <InfoCard label="Còn lại" value={`${left} ngày`} icon={Timer} color={left <= 7 ? "#c8102e" : "#b45309"} />
            </div>

            <UnitSubmissionTracker c={c} deadline={c.ngayNopHoSo} />

            <ReadinessPanel warnings={checkTransitionReadiness(c, {
              joinPct: c.totalUnits ? Math.round(c.joinedUnits / c.totalUnits * 100) : 0,
              submittedCount,
            })} />
            <div className="flex items-center justify-end gap-3">
              <DsButton variant="secondary" size="md"><Download className="size-4" />Xuất danh sách</DsButton>
              <DsButton variant="primary" size="md" onClick={doTransition}>
                <Lock className="size-4" />Đóng nhận hồ sơ sớm
              </DsButton>
            </div>
          </div>
        )}

        {/* Unit leader registration */}
        {isUnit && !isManager && (
          <div className="space-y-4">
            {regDone ? (
              <div className="rounded-[12px] border p-6 text-center space-y-3" style={{ borderColor: "#86efac", background: "#f0fdf4" }}>
                <CheckCircle2 className="size-12 text-[#166534] mx-auto" />
                <h3 className="text-[14px] text-[#166534] font-bold" style={{ fontFamily: "var(--font-sans)" }}>Đăng ký thành công!</h3>
                <p className="text-[13px] text-[#14532d]" style={{ fontFamily: "var(--font-sans)" }}>
                  Đơn vị <strong>{regForm.donVi}</strong> đã đăng ký tham gia. Hệ thống sẽ ghi nhận và thông báo kết quả.
                </p>
              </div>
            ) : !registering ? (
              <div className="rounded-[12px] border p-6 text-center space-y-4" style={{ borderColor: "#86efac", background: "#f0fdf4" }}>
                <Building2 className="size-12 text-[#166534] mx-auto" />
                <div>
                  <h3 className="text-[14px] text-[#166534] font-bold" style={{ fontFamily: "var(--font-sans)" }}>Đăng ký tham gia phong trào</h3>
                  <p className="text-[13px] text-[#14532d] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                    Đơn vị <strong>{user.unit}</strong> chưa đăng ký tham gia phong trào này
                  </p>
                </div>
                <DsButton variant="primary" size="md" onClick={() => setRegistering(true)}>
                  <Plus className="size-4" />Đăng ký tham gia ngay
                </DsButton>
              </div>
            ) : (
              <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#86efac" }}>
                <div className="px-5 py-4 border-b" style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
                  <span className="text-[14px] text-[#166534] font-bold" style={{ fontFamily: "var(--font-sans)" }}>Đăng ký tham gia cho đơn vị</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="ds-input-root">
                      <label className="ds-input-label ds-input-label-required">Đơn vị đăng ký</label>
                      <input className="ds-input ds-input-md" value={regForm.donVi}
                        style={regTouched.donVi && regErrs.donVi ? { borderColor: "#f87171" } : {}}
                        onChange={e => setRegForm(p => ({ ...p, donVi: e.target.value }))}
                        onBlur={() => regTouch("donVi")} />
                      {regTouched.donVi && regErrs.donVi && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{regErrs.donVi}</p>}
                    </div>
                    <div className="ds-input-root">
                      <label className="ds-input-label ds-input-label-required">Người đại diện</label>
                      <input className="ds-input ds-input-md" value={regForm.hoTen}
                        style={regTouched.hoTen && regErrs.hoTen ? { borderColor: "#f87171" } : {}}
                        onChange={e => setRegForm(p => ({ ...p, hoTen: e.target.value }))}
                        onBlur={() => regTouch("hoTen")} />
                      {regTouched.hoTen && regErrs.hoTen && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{regErrs.hoTen}</p>}
                    </div>
                  </div>
                  <div className="ds-input-root">
                    <label className="ds-input-label ds-input-label-required">Cam kết tham gia</label>
                    <textarea className="ds-input" rows={3} style={{ padding: "10px 12px", resize: "vertical", ...(regTouched.ly_do && regErrs.ly_do ? { borderColor: "#f87171" } : {}) }}
                      placeholder="Mô tả kế hoạch triển khai phong trào tại đơn vị (ít nhất 20 ký tự)..."
                      value={regForm.ly_do}
                      onChange={e => setRegForm(p => ({ ...p, ly_do: e.target.value }))}
                      onBlur={() => regTouch("ly_do")} />
                    <div className="flex items-center justify-between mt-1">
                      {regTouched.ly_do && regErrs.ly_do
                        ? <p className="text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)" }}>{regErrs.ly_do}</p>
                        : <span />}
                      <span className="text-[13px] text-[#635647] ml-auto" style={{ fontFamily: "var(--font-sans)" }}>{regForm.ly_do.trim().length}/20</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <DsButton variant="secondary" size="md" onClick={() => setRegistering(false)}>Hủy</DsButton>
                    <DsButton variant="primary" size="md" className="flex-1"
                      style={!regValid ? { opacity: 0.65 } : {}}
                      onClick={() => {
                        setRegTouched({ hoTen: true, donVi: true, ly_do: true });
                        if (!regValid) return;
                        onAddParticipant(c.id, {
                          id: `p-${Date.now()}`, name: regForm.hoTen, type: "tap_the",
                          donVi: regForm.donVi, hoSoStatus: "da_nop",
                          nopLuc: new Date().toISOString().slice(0, 10),
                        });
                        setRegistering(false); setRegDone(true);
                      }}>
                      <CheckCircle2 className="size-4" />Xác nhận đăng ký
                    </DsButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Individual registration */}
        {isIndividual && (
          <div className="space-y-4">
            {indivDone ? (
              <div className="rounded-[12px] border p-6 text-center space-y-3" style={{ borderColor: "#fcd34d", background: "#fef9ec" }}>
                <CheckCircle2 className="size-12 text-[#b45309] mx-auto" />
                <h3 className="text-[14px] text-[#92400e] font-bold" style={{ fontFamily: "var(--font-sans)" }}>Đã gửi đăng ký!</h3>
                <p className="text-[13px] text-[#92400e]" style={{ fontFamily: "var(--font-sans)" }}>
                  Hồ sơ đề nghị <strong>{regForm.danh_hieu}</strong> của <strong>{regForm.hoTen}</strong> đã được ghi nhận. Đơn vị quản lý sẽ xem xét và phê duyệt.
                </p>
              </div>
            ) : (
              <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#fcd34d" }}>
                <div className="px-5 py-4 border-b" style={{ background: "#fef9ec", borderColor: "#fcd34d" }}>
                  <span className="text-[14px] text-[#92400e] font-bold" style={{ fontFamily: "var(--font-sans)" }}>Đăng ký tham gia cá nhân</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="ds-input-root">
                      <label className="ds-input-label ds-input-label-required">Họ và tên</label>
                      <input className="ds-input ds-input-md" value={regForm.hoTen}
                        style={regTouched.hoTen && regErrs.hoTen ? { borderColor: "#f87171" } : {}}
                        onChange={e => setRegForm(p => ({ ...p, hoTen: e.target.value }))}
                        onBlur={() => regTouch("hoTen")} />
                      {regTouched.hoTen && regErrs.hoTen && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{regErrs.hoTen}</p>}
                    </div>
                    <div className="ds-input-root">
                      <label className="ds-input-label">Danh hiệu đề nghị</label>
                      <select className="ds-input ds-input-md" value={regForm.danh_hieu} onChange={e => setRegForm(p => ({ ...p, danh_hieu: e.target.value }))}>
                        <option>CSTĐCS</option><option>LĐTT</option><option>Bằng khen Chủ tịch UBND</option><option>Chiến sĩ thi đua cấp Tỉnh</option>
                      </select>
                    </div>
                  </div>
                  <div className="ds-input-root">
                    <label className="ds-input-label ds-input-label-required">Lý do đề nghị / Thành tích nổi bật</label>
                    <textarea className="ds-input" rows={4} style={{ padding: "10px 12px", resize: "vertical", ...(regTouched.ly_do && regErrs.ly_do ? { borderColor: "#f87171" } : {}) }}
                      placeholder="Mô tả thành tích nổi bật trong năm (ít nhất 20 ký tự)..."
                      value={regForm.ly_do}
                      onChange={e => setRegForm(p => ({ ...p, ly_do: e.target.value }))}
                      onBlur={() => regTouch("ly_do")} />
                    <div className="flex items-center justify-between mt-1">
                      {regTouched.ly_do && regErrs.ly_do
                        ? <p className="text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)" }}>{regErrs.ly_do}</p>
                        : <span />}
                      <span className="text-[13px] text-[#635647] ml-auto" style={{ fontFamily: "var(--font-sans)" }}>{regForm.ly_do.trim().length}/20</span>
                    </div>
                  </div>
                  <DsButton variant="primary" size="md" className="w-full"
                    style={!(regForm.hoTen.trim().length >= 2 && regForm.ly_do.trim().length >= 20) ? { opacity: 0.65 } : {}}
                    onClick={() => {
                      setRegTouched({ hoTen: true, ly_do: true });
                      if (regForm.hoTen.trim().length < 2 || regForm.ly_do.trim().length < 20) return;
                      onAddParticipant(c.id, {
                        id: `p-${Date.now()}`, name: regForm.hoTen, type: "ca_nhan",
                        donVi: user.unit || regForm.donVi || "",
                        hoSoStatus: "da_nop", nopLuc: new Date().toISOString().slice(0, 10),
                        hinhThucDeNghi: regForm.danh_hieu,
                      });
                      setIndivDone(true);
                    }}>
                    <Send className="size-4" />Gửi đăng ký tham gia
                  </DsButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ── SUBMISSION_CLOSED ─────────────────────────────────────────── */
  if (c.state === "submission_closed") {
    return (
      <div className="space-y-6">
        {isAdmin && <AdminHealthBar c={c} />}
        {isIndividual && <PersonalStatusBanner c={c} myP={myParticipant} danh_hieu={regForm.danh_hieu} hoTen={regForm.hoTen} indivDone={indivDone} />}
        {isUnitLeader && !canMove && <UnitLeaderContextPanel c={c} user={user} unitDecisions={unitDecisions} />}
        <SectionHeader icon={Lock} title="Đã đóng nhận hồ sơ" sub="Tổng kết giai đoạn đăng ký — Chuẩn bị chuyển thẩm định cấp cơ sở" color="#b45309" />

        <div className="grid grid-cols-4 gap-4">
          <InfoCard label="Tổng hồ sơ" value={`${c.participants.length}`} icon={FileText} color="#1C5FBE" />
          <InfoCard label="Đã nộp" value={`${submittedCount}`} icon={CheckCircle2} color="#166534" />
          <InfoCard label="Chưa nộp" value={`${c.participants.filter(p => p.hoSoStatus === "chua_nop").length}`} icon={AlertCircle} color="#c8102e" />
          <InfoCard label="Trả lại" value={`${c.participants.filter(p => p.hoSoStatus === "tra_lai").length}`} icon={RotateCcw} color="#b45309" />
        </div>

        <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
          <div className="px-4 py-3 border-b" style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Tổng kết giai đoạn đăng ký</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {[
              { done: c.joinedUnits > 0, text: `${c.joinedUnits}/${c.totalUnits} đơn vị đã đăng ký tham gia (${c.totalUnits > 0 ? Math.round(c.joinedUnits / c.totalUnits * 100) : 0}%)` },
              { done: submittedCount > 0, text: `${submittedCount} hồ sơ đã được nộp đúng hạn` },
              { done: approvedCount > 0, text: `${approvedCount} hồ sơ đã được lãnh đạo đơn vị phê duyệt` },
              { done: c.participants.filter(p => p.hoSoStatus === "tra_lai").length === 0, text: "Không còn hồ sơ nào ở trạng thái trả lại" },
            ].map((ck, i) => <CheckRow key={i} done={ck.done} text={ck.text} />)}
          </div>
        </div>

        {/* Kiểm tra thành phần hồ sơ trước khi chuyển thẩm định */}
        {(() => {
          const submitted = c.participants.filter(p => p.hoSoStatus === "da_nop" || p.hoSoStatus === "da_duyet");
          const validated = submitted.filter(p => p.minhChung && p.minhChung.length > 0);
          const incomplete = validated.filter(p => {
            const subject = p.type === "ca_nhan" ? "ca_nhan" : "tap_the";
            return !validateMinhChung(p.minhChung!, subject).valid;
          });
          const unverified = submitted.filter(p => !p.minhChung || p.minhChung.length === 0);
          if (submitted.length === 0) return null;
          return (
            <div className="rounded-[10px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
              <div className="px-4 py-3 border-b flex items-center gap-2"
                style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
                <ListChecks className="size-4 text-[#7c3aed]" />
                <span className="text-[13px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>
                  Kiểm tra thành phần hồ sơ trước thẩm định
                </span>
                <span className="ml-auto text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                  Căn cứ: TT 12/2019/TT-BNV · TT 15/2025/TT-BNV
                </span>
              </div>
              <div className="px-4 py-3 space-y-2">
                <CheckRow done={unverified.length === 0}
                  text={unverified.length === 0
                    ? `Tất cả ${submitted.length} hồ sơ đã được kiểm tra thành phần`
                    : `${unverified.length}/${submitted.length} hồ sơ chưa được kiểm tra thành phần (mở tab Hồ sơ để xác nhận)`} />
                <CheckRow done={incomplete.length === 0}
                  text={incomplete.length === 0
                    ? "Không có hồ sơ nào thiếu tài liệu bắt buộc"
                    : `${incomplete.length} hồ sơ thiếu tài liệu bắt buộc — cần bổ sung trước khi thẩm định`} />
                {unverified.length > 0 && (
                  <div className="flex items-start gap-2 p-2.5 rounded-[6px] border"
                    style={{ background: "#fff7ed", borderColor: "#fdba74" }}>
                    <Info className="size-3.5 text-[#c2410c] shrink-0 mt-0.5" />
                    <span className="text-[13px] text-[#c2410c]" style={{ fontFamily: "var(--font-sans)" }}>
                      Khuyến nghị: vào tab <strong>Hồ sơ tham gia</strong>, nhấn nút <strong>"Hồ sơ"</strong> ở từng dòng để xác nhận thành phần trước khi chuyển sang thẩm định.
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {canMove && <ReadinessPanel warnings={checkTransitionReadiness(c, { submittedCount })} />}
        <div className="flex items-center justify-between">
          <RoleBadge role={user.roleLabel || user.role} canAct={canMove} />
          <div className="flex gap-3">
            <DsButton variant="secondary" size="md"><Download className="size-4" />Xuất danh sách hồ sơ</DsButton>
            {canMove && (
              <DsButton variant="primary" size="md" onClick={doTransition} disabled={submittedCount === 0}>
                <ClipboardCheck className="size-4" />Mở thẩm định cấp cơ sở
              </DsButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── UNIT_REVIEW ───────────────────────────────────────────────── */
  if (c.state === "unit_review") {
    const displayList = c.participants.slice(0, 4);
    const canReview = canReviewUnit(user, c); // lãnh đạo đơn vị + tất cả role canMove

    /* Resolve effective status: local decision overrides raw hoSoStatus */
    const effectiveStatus = (p: Participant): Participant["hoSoStatus"] => {
      if (unitDecisions[p.id] === "approved") return "da_duyet";
      if (unitDecisions[p.id] === "rejected") return "tra_lai";
      return p.hoSoStatus;
    };

    const pendingCount   = displayList.filter(p => effectiveStatus(p) === "da_nop").length;
    const localApproved  = displayList.filter(p => effectiveStatus(p) === "da_duyet").length;
    const localTotal     = displayList.filter(p =>
      p.hoSoStatus === "da_nop" || p.hoSoStatus === "da_duyet"
    ).length;
    const allReviewed    = pendingCount === 0 && localTotal > 0;

    const hsCfg: Record<string, { label: string; color: string; bg: string }> = {
      da_duyet: { label: "Đã duyệt",       color: "#166534", bg: "#dcfce7" },
      da_nop:   { label: "Chờ thẩm định",  color: "#1a4fa0", bg: "#dbeafe" },
      chua_nop: { label: "Chưa nộp",       color: "#c2410c", bg: "#fff7ed" },
      tra_lai:  { label: "Trả lại",        color: "#9f1239", bg: "#fee2e2" },
    };

    return (
      <div className="space-y-6">
        {isAdmin && <AdminHealthBar c={c} />}
        {isIndividual && <PersonalStatusBanner c={c} myP={myParticipant} danh_hieu={regForm.danh_hieu} hoTen={regForm.hoTen} indivDone={indivDone} />}
        {isUnitLeader && !canMove && <UnitLeaderContextPanel c={c} user={user} unitDecisions={unitDecisions} />}

        {/* ── BƯỚC 4A: LẤY Ý KIẾN CÔNG KHAI ─────────────────────── */}
        <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#c4b5fd" }}>
          <div className="px-5 py-3.5 border-b flex items-center gap-3" style={{ background: "linear-gradient(to right, #faf5ff, #f5f3ff)", borderColor: "#c4b5fd" }}>
            <div className="size-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "#7c3aed" }}>
              <MessageSquare className="size-4 text-white" />
            </div>
            <div>
              <div className="text-[13px] text-[#6d28d9] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Bước 4 — Lấy ý kiến công khai (Điều 55 Luật TĐKT 2022)</div>
              <div className="text-[13px] text-[#8b5cf6]" style={{ fontFamily: "var(--font-sans)" }}>
                Thời gian góp ý: 15/04/2026 – 22/04/2026 · {publicComments.length} đơn vị đã phản hồi
              </div>
            </div>
            <span className="ml-auto px-2.5 py-1 rounded-full text-[13px] font-bold"
              style={{ background: "#ede9fe", color: "#7c3aed" }}>
              {publicComments.length}/{c.totalUnits > 0 ? Math.min(c.totalUnits, 12) : 12} đơn vị
            </span>
          </div>

          {/* Comment feed */}
          <div className="divide-y" style={{ borderColor: "#ede9fe" }}>
            {publicComments.map(cm => (
              <div key={cm.id} className="px-5 py-3.5 flex items-start gap-3" style={{ background: "white" }}>
                <div className="size-8 rounded-full flex items-center justify-center shrink-0 text-white text-[13px]"
                  style={{ background: "#7c3aed", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  {cm.author.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{cm.author}</span>
                    <span className="text-[13px] px-1.5 py-0.5 rounded text-[#7c3aed] bg-[#ede9fe]" style={{ fontFamily: "var(--font-sans)" }}>{cm.unit}</span>
                    <span className="text-[13px] text-[#4f5d6e] ml-auto" style={{ fontFamily: "var(--font-sans)" }}>{cm.time}</span>
                  </div>
                  <p className="text-[13px] text-[#374151] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>{cm.content}</p>
                </div>
                <button
                  className="flex items-center gap-1 px-2 py-1 rounded-[5px] border text-[13px] shrink-0 transition-all"
                  style={{ borderColor: thumbedUp.has(cm.id) ? "#7c3aed" : "#e5e7eb", background: thumbedUp.has(cm.id) ? "#ede9fe" : "white", color: thumbedUp.has(cm.id) ? "#7c3aed" : "#6b7280" }}
                  onClick={() => setThumbedUp(prev => { const next = new Set(prev); if (next.has(cm.id)) { next.delete(cm.id); setPublicComments(cs => cs.map(x => x.id===cm.id ? {...x,thumbsUp:x.thumbsUp-1} : x)); } else { next.add(cm.id); setPublicComments(cs => cs.map(x => x.id===cm.id ? {...x,thumbsUp:x.thumbsUp+1} : x)); } return next; })}>
                  <ThumbsUp className="size-3" />{cm.thumbsUp}
                </button>
              </div>
            ))}
          </div>

          {/* Submission form for unit leaders / individuals */}
          {(isUnitLeader || isIndividual) && (
            <div className="px-5 py-4 border-t" style={{ borderColor: "#c4b5fd", background: "#faf5ff" }}>
              {commentSubmitted ? (
                <div className="flex items-center gap-2 text-[13px] text-[#6d28d9]" style={{ fontFamily: "var(--font-sans)" }}>
                  <CheckCircle2 className="size-4" />Ý kiến của bạn đã được ghi nhận. Cảm ơn đã tham gia góp ý!
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[#6d28d9] uppercase tracking-wider" style={{ fontFamily: "var(--font-sans)" }}>
                    Gửi ý kiến góp ý
                  </label>
                  <textarea className="ds-input w-full" rows={2} style={{ padding:"8px 12px", fontSize: 13, resize:"vertical" }}
                    placeholder="Nhập ý kiến góp ý về danh sách đề nghị khen thưởng..."
                    value={commentInput} onChange={e => setCommentInput(e.target.value)} />
                  <DsButton variant="secondary" size="sm"
                    style={!commentInput.trim() ? { opacity:0.5 } : {}}
                    onClick={() => {
                      if (!commentInput.trim()) return;
                      setPublicComments(prev => [...prev, {
                        id:`pc-${Date.now()}`, author:user.name||"Người dùng",
                        unit:user.unit||"Đơn vị", content:commentInput.trim(),
                        time:fmtDate("2026-04-23"), thumbsUp:0,
                      }]);
                      setCommentInput(""); setCommentSubmitted(true);
                    }}>
                    <Send className="size-3" />Gửi ý kiến
                  </DsButton>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── BƯỚC 4B: THẨM ĐỊNH CẤP CƠ SỞ ──────────────────────── */}
        <SectionHeader icon={ClipboardCheck} title="Thẩm định cấp cơ sở" sub="Hội đồng tiếp nhận, phân loại và thẩm định từng hồ sơ theo tiêu chí" color="#c2410c" />

        <div className="grid grid-cols-3 gap-4">
          <InfoCard label="Cần thẩm định" value={`${pendingCount}`} icon={FileText} color="#c2410c" />
          <InfoCard label="Đã thẩm định" value={`${localApproved}`} icon={CheckCheck} color="#166534" />
          <InfoCard label="Tỷ lệ hoàn thành"
            value={localTotal > 0 ? `${Math.round((localTotal - pendingCount) / localTotal * 100)}%` : "0%"}
            icon={TrendingUp} color="#1C5FBE" />
        </div>

        <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Danh sách hồ sơ thẩm định</span>
            <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Căn cứ: Khoản 2 Điều 55 Luật TĐKT</span>
          </div>
          <div className="divide-y" style={{ borderColor: "#eef2f8" }}>
            {displayList.map(p => {
              const status = effectiveStatus(p);
              const hs = hsCfg[status];
              const isPending = p.hoSoStatus === "da_nop" && !unitDecisions[p.id];
              const isActioned = !!unitDecisions[p.id];
              return (
                <div key={p.id}
                  className="px-4 py-3.5 flex items-center gap-3 transition-colors"
                  style={{ background: isActioned ? (unitDecisions[p.id] === "approved" ? "#f0fdf4" : "#fff5f5") : "white" }}>
                  <div className="size-8 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
                    style={{ background: p.type === "ca_nhan" ? "#1C5FBE" : "#7c3aed", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                    {p.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#0b1426] font-semibold truncate">{p.name}</div>
                    <div className="text-[13px] text-[#635647]">{p.donVi} · {p.type === "ca_nhan" ? "Cá nhân" : "Tập thể"}</div>
                  </div>
                  {p.score !== undefined && (
                    <div className="text-[14px] font-bold" style={{ color: p.score >= 90 ? "#0f7a3e" : "#b45309", fontFamily: "var(--font-sans)" }}>{p.score}</div>
                  )}
                  <span className="text-[13px] px-2 py-0.5 rounded border shrink-0 transition-all"
                    style={{ color: hs.color, background: hs.bg, borderColor: hs.color + "30", fontFamily: "var(--font-sans)", fontWeight: 500 }}>
                    {hs.label}
                  </span>
                  {canReview && (isPending || isActioned) && (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => setUnitDecisions(d => {
                          const next = { ...d };
                          if (next[p.id] === "approved") delete next[p.id]; else next[p.id] = "approved";
                          return next;
                        })}
                        className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[13px] font-semibold transition-all"
                        style={{
                          border: `1px solid ${unitDecisions[p.id] === "approved" ? "#166534" : "#86efac"}`,
                          background: unitDecisions[p.id] === "approved" ? "#dcfce7" : "white",
                          color: unitDecisions[p.id] === "approved" ? "#166534" : "#86efac",
                        }}
                        title="Duyệt hồ sơ">
                        <ThumbsUp className="size-3.5" />
                        {unitDecisions[p.id] === "approved" && "Đã duyệt"}
                      </button>
                      <button
                        onClick={() => setUnitDecisions(d => {
                          const next = { ...d };
                          if (next[p.id] === "rejected") delete next[p.id]; else next[p.id] = "rejected";
                          return next;
                        })}
                        className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[13px] font-semibold transition-all"
                        style={{
                          border: `1px solid ${unitDecisions[p.id] === "rejected" ? "#c8102e" : "#fca5a5"}`,
                          background: unitDecisions[p.id] === "rejected" ? "#fee2e2" : "white",
                          color: unitDecisions[p.id] === "rejected" ? "#c8102e" : "#fca5a5",
                        }}
                        title="Trả lại hồ sơ">
                        <ThumbsDown className="size-3.5" />
                        {unitDecisions[p.id] === "rejected" && "Trả lại"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {canReview && (
            <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: "var(--color-line)", background: "var(--color-paper)" }}>
              <div className="flex-1 text-[13px]" style={{ fontFamily: "var(--font-sans)", color: allReviewed ? "#166534" : "#b45309" }}>
                {allReviewed
                  ? `✅ Đã thẩm định xong ${localTotal} hồ sơ — ${localApproved} duyệt / ${localTotal - localApproved} trả lại`
                  : `⏳ Còn ${pendingCount} hồ sơ chưa thẩm định`}
              </div>
              {!allReviewed && <span className="text-[13px] text-[#635647]">Vui lòng thẩm định hết trước khi chuyển bước</span>}
            </div>
          )}
        </div>

        {canMove && (
          <ReadinessPanel warnings={checkTransitionReadiness(c, {
            allReviewed,
            pendingCount,
            approvedCount: localApproved,
          })} />
        )}
        <div className="flex items-center justify-between">
          <RoleBadge role={user.roleLabel || user.role} canAct={canMove} />
          {canMove && (
            <DsButton variant="primary" size="md" onClick={doTransition} disabled={!allReviewed}>
              <Gavel className="size-4" />Chuyển Hội đồng xét duyệt
            </DsButton>
          )}
        </div>
      </div>
    );
  }

  /* ── COUNCIL_REVIEW ────────────────────────────────────────────── */
  if (c.state === "council_review") {
    const candidates = c.participants.filter(p => p.hoSoStatus === "da_duyet").slice(0, 4);
    const totalVoters = totalVotersConst;
    const passThreshold = Math.ceil(totalVoters * 2 / 3);
    const quorumThreshold = Math.ceil(totalVoters * 2 / 3);
    const quorumMet = quorumPresent >= quorumThreshold;
    const allVoted = candidates.length > 0 && Object.keys(votes).length === candidates.length;
    const canSign = allVoted && minutesForm.chuToa.trim() && minutesForm.thuKy.trim();

    return (
      <div className="space-y-6">
        {isAdmin && <AdminHealthBar c={c} />}
        {isIndividual && <PersonalStatusBanner c={c} myP={myParticipant} danh_hieu={regForm.danh_hieu} hoTen={regForm.hoTen} indivDone={indivDone} />}
        {isUnitLeader && !canMove && <UnitLeaderContextPanel c={c} user={user} unitDecisions={unitDecisions} />}

        {/* ── TÓM TẮT Ý KIẾN CÔNG KHAI (từ bước 4) ─────────────── */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor: "#c4b5fd" }}>
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: "#faf5ff", borderColor: "#c4b5fd" }}>
            <MessageSquare className="size-4 text-[#7c3aed]" />
            <span className="text-[13px] font-semibold text-[#6d28d9]" style={{ fontFamily: "var(--font-sans)" }}>Tóm tắt ý kiến công khai (Bước 4)</span>
            <span className="ml-auto text-[13px] px-2 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "#7c3aed", fontFamily: "var(--font-sans)" }}>
              {publicComments.length} lượt góp ý
            </span>
          </div>
          <div className="px-5 py-3 grid grid-cols-3 gap-4">
            {[
              { label:"Đơn vị đã góp ý", val:`${publicComments.length}`, color:"#7c3aed" },
              { label:"Nhất trí (lượt +1)", val:`${publicComments.reduce((s,c)=>s+c.thumbsUp,0)}`, color:"#166534" },
              { label:"Điểm trung bình", val:`${publicComments.length>0?Math.round(publicComments.reduce((s,c)=>s+c.thumbsUp,0)/publicComments.length*10)/10:0}/5`, color:"#1C5FBE" },
            ].map(k=>(
              <div key={k.label} className="text-center py-2 rounded-[8px]" style={{ background:"#f5f3ff" }}>
                <div className="text-[18px] font-bold" style={{ color:k.color, fontFamily: "var(--font-sans)" }}>{k.val}</div>
                <div className="text-[13px]" style={{ color:k.color, fontFamily: "var(--font-sans)" }}>{k.label}</div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-3">
            <p className="text-[13px] text-[#635647] italic" style={{ fontFamily: "var(--font-sans)" }}>
              Ý kiến nổi bật: "{publicComments[0]?.content?.slice(0,100)}…"
            </p>
          </div>
        </div>

        <SectionHeader icon={Gavel} title="Bước 5 — Hội đồng xét duyệt" sub="Phiên họp Hội đồng TĐKT — Bỏ phiếu kín & lập biên bản (Điều 56–57 Luật TĐKT 2022)" color="#7c3aed" />

        <div className="grid grid-cols-3 gap-4">
          <InfoCard label="Hồ sơ xét duyệt" value={`${candidates.length}`} icon={FileCheck} color="#7c3aed" />
          <InfoCard label="Tổng thành viên HĐ" value={`${totalVoters} thành viên`} icon={Users} color="#1C5FBE" />
          <InfoCard label="Ngưỡng thông qua" value={`≥ ${passThreshold} phiếu`} icon={Vote} color="#166534" />
        </div>

        {/* ── QUORUM CHECK ──────────────────────────────────────────── */}
        <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: quorumMet ? "#86efac" : "#fca5a5" }}>
          <div className="px-5 py-3.5 border-b flex items-center gap-2"
            style={{ background: quorumMet ? "#f0fdf4" : "#fff1f2", borderColor: quorumMet ? "#86efac" : "#fca5a5" }}>
            <Users className={`size-4 ${quorumMet ? "text-[#166534]" : "text-[#c8102e]"}`} />
            <span className={`text-[13px] font-semibold ${quorumMet ? "text-[#166534]" : "text-[#c8102e]"}`}
              style={{ fontFamily: "var(--font-sans)" }}>
              Kiểm tra đủ số (Quorum) — Điều 56 Luật TĐKT 2022
            </span>
            <span className="ml-auto text-[13px]" style={{ color: quorumMet ? "#166534" : "#c8102e", fontFamily: "var(--font-sans)" }}>
              {quorumMet ? "✅ Đủ số họp" : "❌ Chưa đủ số họp"}
            </span>
          </div>
          <div className="px-5 py-4 grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="text-[24px] font-bold text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)" }}>{totalVoters}</div>
              <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Tổng thành viên</div>
            </div>
            <div className="text-center">
              {canMove ? (
                <div className="flex items-center justify-center gap-2">
                  <button className="size-7 rounded-full border text-[14px] font-bold flex items-center justify-center"
                    style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                    onClick={() => setQuorumPresent(p => Math.max(0, p - 1))}>−</button>
                  <div className="text-[24px] font-bold" style={{ fontFamily: "var(--font-sans)", color: quorumMet ? "#166534" : "#c8102e" }}>{quorumPresent}</div>
                  <button className="size-7 rounded-full border text-[14px] font-bold flex items-center justify-center"
                    style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                    onClick={() => setQuorumPresent(p => Math.min(totalVoters, p + 1))}>+</button>
                </div>
              ) : (
                <div className="text-[24px] font-bold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{quorumPresent}</div>
              )}
              <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Có mặt</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-[#b45309]" style={{ fontFamily: "var(--font-sans)" }}>{totalVoters - quorumPresent}</div>
              <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Vắng mặt</div>
            </div>
          </div>
          <div className="px-5 pb-3 text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Yêu cầu tối thiểu: <strong>{quorumThreshold}/{totalVoters} thành viên có mặt</strong> mới hợp lệ để bỏ phiếu · Căn cứ: Điều 56 Luật TĐKT 2022, Điều 73 NĐ 152/2025/NĐ-CP
          </div>
        </div>

        {/* ── VOTING PANEL ──────────────────────────────────────────── */}
        {canMove && (
          <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: quorumMet ? "#c4b5fd" : "#e5e7eb", opacity: quorumMet ? 1 : 0.5 }}>
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ background: quorumMet ? "#f5f3ff" : "#f9fafb", borderColor: quorumMet ? "#c4b5fd" : "#e5e7eb" }}>
              <Vote className="size-4 text-[#7c3aed]" />
              <span className="text-[13px] text-[#7c3aed] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                Bỏ phiếu kín — {quorumMet ? "Đủ điều kiện bỏ phiếu" : "Chưa đủ số họp"}
              </span>
              <span className="ml-auto text-[13px] text-[#7c3aed]">{Object.keys(votes).length}/{candidates.length} hồ sơ đã xét</span>
            </div>
            <div className="divide-y" style={{ borderColor: "#eef2f8" }}>
              {candidates.map(p => (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-[13px] text-[#0b1426] font-semibold">{p.name}</div>
                    <div className="text-[13px] text-[#635647]">{p.donVi} · Điểm: {p.score ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={!quorumMet}
                      onClick={() => setVotes(v => ({ ...v, [p.id]: "yes" }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: votes[p.id] === "yes" ? "#dcfce7" : "white",
                        borderColor: votes[p.id] === "yes" ? "#86efac" : "#e5e7eb",
                        color: votes[p.id] === "yes" ? "#166534" : "#6b7280",
                      }}>
                      <ThumbsUp className="size-3.5" />Tán thành
                    </button>
                    <button disabled={!quorumMet}
                      onClick={() => setVotes(v => ({ ...v, [p.id]: "no" }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: votes[p.id] === "no" ? "#fee2e2" : "white",
                        borderColor: votes[p.id] === "no" ? "#fca5a5" : "#e5e7eb",
                        color: votes[p.id] === "no" ? "#c8102e" : "#6b7280",
                      }}>
                      <ThumbsDown className="size-3.5" />Không tán thành
                    </button>
                  </div>
                  {votes[p.id] && (
                    <span className="text-[13px] px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: votes[p.id] === "yes" ? "#dcfce7" : "#fee2e2", color: votes[p.id] === "yes" ? "#166534" : "#c8102e", fontFamily: "var(--font-sans)" }}>
                      {yesVotes >= passThreshold && votes[p.id] === "yes" ? "Thông qua" : votes[p.id] === "yes" ? "Tán thành" : "Không tán thành"}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {allVoted && (
              <div className="px-5 py-4 border-t" style={{ background: "#fef9ec", borderColor: "#fcd34d" }}>
                <div className="text-[13px] text-[#92400e] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                  Kết quả: {yesVotes} tán thành / {noVotes} không tán thành / {totalVoters - quorumPresent} vắng
                  {yesVotes >= passThreshold
                    ? <span className="ml-2 text-[#166534]">✅ Đủ 2/3 — Thông qua</span>
                    : <span className="ml-2 text-[#c8102e]">❌ Chưa đủ {passThreshold} phiếu</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BIÊN BẢN HỌP HỘI ĐỒNG ─────────────────────────────────── */}
        {canMove && allVoted && (
          <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#93c5fd" }}>
            <div className="px-5 py-3.5 border-b flex items-center gap-2"
              style={{ background: "#eff6ff", borderColor: "#93c5fd" }}>
              <Clipboard className="size-4 text-[#1a4fa0]" />
              <span className="text-[13px] text-[#1a4fa0] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                Biên bản họp Hội đồng TĐKT
              </span>
              {minutesForm.signed && (
                <span className="ml-auto flex items-center gap-1 text-[13px] px-2 py-0.5 rounded-full"
                  style={{ background: "#dcfce7", color: "#166534", fontFamily: "var(--font-sans)" }}>
                  <CheckCircle2 className="size-3" />Đã ký xác nhận
                </span>
              )}
              <span className="ml-auto text-[13px] text-[#6b7280]" style={{ fontFamily: "var(--font-sans)" }}>
                Căn cứ: Điều 56–57 Luật TĐKT 2022 · Điều 73–75 NĐ 152/2025/NĐ-CP
              </span>
            </div>

            {minutesForm.signed ? (
              /* Biên bản đã ký — hiển thị tóm tắt */
              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    ["Số hiệu", minutesForm.soHieu],
                    ["Ngày họp", fmtDate(minutesForm.ngayHop)],
                    ["Địa điểm", minutesForm.diaDiem],
                    ["Chủ tọa", minutesForm.chuToa],
                    ["Thư ký", minutesForm.thuKy],
                    ["Có mặt", `${quorumPresent}/${totalVoters} thành viên`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                      <span className="text-[#635647] w-20 shrink-0">{k}:</span>
                      <span className="text-[#0b1426] font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-[6px] border" style={{ borderColor: "#dcfce7", background: "#f0fdf4" }}>
                  <div className="text-[13px] text-[#166534] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                    Kết quả biểu quyết: {yesVotes} tán thành / {noVotes} không tán thành / {totalVoters - quorumPresent} vắng
                    — {candidates.filter(p => votes[p.id] === "yes").length}/{candidates.length} hồ sơ được thông qua
                  </div>
                </div>
                <button className="text-[13px] text-[#1a4fa0] underline" onClick={() => setMinutesForm(f => ({ ...f, signed: false }))}
                  style={{ fontFamily: "var(--font-sans)" }}>Sửa biên bản</button>
              </div>
            ) : (
              /* Form nhập biên bản */
              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="ds-input-root">
                    <label className="ds-input-label">Số hiệu biên bản</label>
                    <input className="ds-input ds-input-sm" value={minutesForm.soHieu}
                      onChange={e => setMinutesForm(f => ({ ...f, soHieu: e.target.value }))} />
                  </div>
                  <div className="ds-input-root">
                    <label className="ds-input-label">Ngày họp</label>
                    <input type="date" className="ds-input ds-input-sm" value={minutesForm.ngayHop}
                      onChange={e => setMinutesForm(f => ({ ...f, ngayHop: e.target.value }))} />
                  </div>
                </div>
                <div className="ds-input-root">
                  <label className="ds-input-label">Địa điểm họp</label>
                  <input className="ds-input ds-input-sm" value={minutesForm.diaDiem}
                    onChange={e => setMinutesForm(f => ({ ...f, diaDiem: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="ds-input-root">
                    <label className="ds-input-label ds-input-label-required">Chủ tọa</label>
                    <input className="ds-input ds-input-sm" placeholder="Họ tên chủ tọa..." value={minutesForm.chuToa}
                      onChange={e => setMinutesForm(f => ({ ...f, chuToa: e.target.value }))} />
                  </div>
                  <div className="ds-input-root">
                    <label className="ds-input-label ds-input-label-required">Thư ký</label>
                    <input className="ds-input ds-input-sm" placeholder="Họ tên thư ký..." value={minutesForm.thuKy}
                      onChange={e => setMinutesForm(f => ({ ...f, thuKy: e.target.value }))} />
                  </div>
                </div>
                <div className="p-3 rounded-[6px] border" style={{ borderColor: "#e9d5ff", background: "#faf5ff" }}>
                  <div className="text-[13px] text-[#7c3aed] font-semibold mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                    Kết quả biểu quyết (tự động):
                  </div>
                  <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>
                    Tán thành: <strong>{yesVotes}</strong> · Không tán thành: <strong>{noVotes}</strong> · Vắng: <strong>{totalVoters - quorumPresent}</strong>
                    &nbsp;— Ngưỡng thông qua: ≥ {passThreshold} phiếu
                  </div>
                </div>
                <div className="ds-input-root">
                  <label className="ds-input-label">Nội dung ban hành</label>
                  <textarea className="ds-input" rows={2} style={{ padding: "8px 12px" }} value={minutesForm.noiDung}
                    placeholder="Tóm tắt nội dung kết luận của Hội đồng..."
                    onChange={e => setMinutesForm(f => ({ ...f, noiDung: e.target.value }))} />
                </div>
                <div className="ds-input-root">
                  <label className="ds-input-label">Ghi chú</label>
                  <input className="ds-input ds-input-sm" value={minutesForm.ghiChu}
                    onChange={e => setMinutesForm(f => ({ ...f, ghiChu: e.target.value }))} />
                </div>
                <button
                  disabled={!canSign}
                  onClick={() => setMinutesForm(f => ({ ...f, signed: true }))}
                  className="flex items-center gap-2 px-4 h-9 rounded-[6px] border text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderColor: "#1a4fa0", background: "#eff6ff", color: "#1a4fa0", fontFamily: "var(--font-sans)" }}>
                  <Stamp className="size-4" />Ký xác nhận biên bản
                </button>
                {!canSign && (
                  <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                    Điền đầy đủ họ tên Chủ tọa và Thư ký để ký xác nhận
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {canMove && (
          <ReadinessPanel warnings={checkTransitionReadiness(c, {
            allVoted,
            quorumMet,
            yesVotes,
            noVotes,
            passThreshold,
            minutesSigned: minutesForm.signed,
          })} />
        )}
        <div className="flex items-center justify-between">
          <RoleBadge role={user.roleLabel || user.role} canAct={canMove} />
          {canMove && (
            <DsButton variant="primary" size="md" onClick={doTransition} disabled={!allVoted || !minutesForm.signed}>
              <CheckCheck className="size-4" />Trình lãnh đạo duyệt
            </DsButton>
          )}
        </div>
      </div>
    );
  }

  /* ── FINAL_APPROVAL ────────────────────────────────────────────── */
  if (c.state === "final_approval") {
    const approved = c.participants.filter(p => p.hoSoStatus === "da_duyet");
    return (
      <div className="space-y-6">
        {isAdmin && <AdminHealthBar c={c} />}
        {isIndividual && <PersonalStatusBanner c={c} myP={myParticipant} danh_hieu={regForm.danh_hieu} hoTen={regForm.hoTen} indivDone={indivDone} />}
        {isUnitLeader && !canMove && <UnitLeaderContextPanel c={c} user={user} unitDecisions={unitDecisions} />}
        <SectionHeader icon={Stamp} title="Bước 6 — Ký số & Ban hành Quyết định" sub="Danh sách đề nghị khen thưởng đã được Hội đồng thống nhất — Lãnh đạo xác thực CA Token và ban hành QĐ" color="#9f1239" />

        <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#fca5a5" }}>
          <div className="px-5 py-4 border-b flex items-center gap-3" style={{ background: "#fff1f2", borderColor: "#fca5a5" }}>
            <FileText className="size-4 text-[#9f1239]" />
            <span className="text-[13px] text-[#9f1239] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
              Danh sách đề nghị khen thưởng — {approved.length} hồ sơ
            </span>
            <span className="ml-auto text-[13px] px-2 py-0.5 rounded-full"
              style={{ background: "#fca5a5", color: "#9f1239", fontWeight: 600 }}>Đã qua Hội đồng xét duyệt</span>
          </div>
          <div className="divide-y" style={{ borderColor: "#eef2f8" }}>
            {(approved.length > 0 ? approved : c.participants.slice(0, 3)).map((p, i) => (
              <div key={p.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="size-7 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
                  style={{ background: ["#8a6400", "#4f5d6e", "#cd7c3b"][i] ?? "#6b7280", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] text-[#0b1426] font-semibold">{p.name}</div>
                  <div className="text-[13px] text-[#635647]">{p.donVi} · {p.type === "ca_nhan" ? "Cá nhân" : "Tập thể"}</div>
                </div>
                {p.score && <div className="text-[14px] font-bold text-[#0f7a3e]" style={{ fontFamily: "var(--font-sans)" }}>{p.score} điểm</div>}
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "#fca5a5", background: "#fff1f2" }}>
            <span className="text-[13px] text-[#9f1239]" style={{ fontFamily: "var(--font-sans)" }}>Căn cứ: Điều 58 Luật TĐKT 2022</span>
            <DsButton variant="secondary" size="sm"><Printer className="size-3.5" />In danh sách</DsButton>
          </div>
        </div>

        {/* Checklist chuẩn bị ban hành QĐ */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          <div className="px-4 py-3 border-b" style={{ background:"var(--color-paper)", borderColor:"var(--color-line)" }}>
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>Checklist trước ban hành Quyết định</span>
          </div>
          <div className="px-4 py-2">
            {[
              { done:true,  text:"Biên bản họp Hội đồng đã ký xác nhận (Bước 5)" },
              { done:true,  text:"Danh sách được khen thưởng đã được Hội đồng thống nhất" },
              { done:approved.length>0, text:`${approved.length} hồ sơ đủ điều kiện ban hành QĐ` },
              { done:true,  text:"Dự thảo Quyết định đã soạn thảo theo Nghị định 30/2020/NĐ-CP" },
              { done:sigConfirmed, text:`Chữ ký số CA Token của ${user.name||"Lãnh đạo cấp cao"} đã xác thực` },
            ].map((ck,i) => <CheckRow key={i} done={ck.done} text={ck.text} />)}
          </div>
          <div className="px-4 py-2.5 border-t flex items-center gap-2" style={{ borderColor:"var(--color-line)", background:"#f9fafb" }}>
            <Globe className="size-3.5 text-[#1C5FBE]" />
            <span className="text-[13px] text-[#1a4fa0]" style={{ fontFamily: "var(--font-sans)" }}>
              Sau khi ban hành, QĐ sẽ được gửi tự động đến: Cổng thông tin điện tử · Email đơn vị · Hệ thống TĐKT
            </span>
          </div>
        </div>

        {canMove && (
          <div className="space-y-3">
            {/* Leader opinion */}
            <div className="rounded-[12px] border p-4" style={{ borderColor: "#fcd34d", background: "#fef9ec" }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="size-4 text-[#b45309]" />
                <span className="text-[13px] text-[#92400e] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Xác nhận của Lãnh đạo cấp cao</span>
              </div>
              <textarea className="ds-input w-full mb-0" rows={2} style={{ padding: "10px 12px", fontSize: 13 }}
                placeholder="Ý kiến / điều kiện kèm theo của lãnh đạo (nếu có)..."
                value={note} onChange={e => setNote(e.target.value)} />
            </div>

            {/* Digital signature panel */}
            {!sigConfirmed ? (
              <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#c084fc" }}>
                <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ background: "#faf5ff", borderColor: "#c084fc" }}>
                  <Pen className="size-4 text-[#7c3aed]" />
                  <span className="text-[13px] text-[#6d28d9] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                    Ký số điện tử — CA Token
                  </span>
                  <span className="ml-auto text-[13px] px-2 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "#7c3aed", fontWeight: 600 }}>
                    Bắt buộc xác thực
                  </span>
                </div>
                <div className="p-5 space-y-3" style={{ background: "#faf5ff" }}>
                  <div className="grid grid-cols-2 gap-3 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                    {[
                      { label: "Người ký", val: user.name ?? "Lãnh đạo cấp cao" },
                      { label: "Chức vụ",  val: "Lãnh đạo cấp cao · VPTU Đồng Nai" },
                      { label: "Thời gian",val: new Date().toLocaleString("vi-VN") },
                      { label: "Thuật toán",val: "RSA-2048 · SHA-256" },
                    ].map(f => (
                      <div key={f.label} className="p-2.5 rounded-[8px]" style={{ background: "white", border: "1px solid #ede9fe" }}>
                        <div className="text-[13px] text-[#635647] uppercase tracking-wider mb-0.5">{f.label}</div>
                        <div className="text-[13px] text-[#0b1426] font-semibold">{f.val}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#6d28d9] font-semibold uppercase tracking-wider mb-1.5" style={{ fontFamily: "var(--font-sans)" }}>
                      Nhập mã PIN xác thực (CA Token)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        maxLength={6}
                        value={sigPin}
                        onChange={e => setSigPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="flex-1 px-4 border-2 rounded-[8px] text-center text-[18px] tracking-[0.5em] outline-none focus:border-[#7c3aed]"
                        style={{ height: 48, borderColor: sigPin.length === 6 ? "#7c3aed" : "#c084fc", background: "white", fontFamily: "JetBrains Mono, monospace" }}
                      />
                      <button
                        disabled={sigPin.length < 4}
                        onClick={() => { if (sigPin.length >= 4) setSigConfirmed(true); }}
                        className="px-5 rounded-[8px] text-[13px] text-white font-semibold transition-all"
                        style={{ background: sigPin.length >= 4 ? "#7c3aed" : "#d1d5db", fontFamily: "var(--font-sans)", cursor: sigPin.length >= 4 ? "pointer" : "not-allowed" }}
                      >
                        Xác thực
                      </button>
                    </div>
                    <p className="text-[13px] text-[#635647] mt-1.5" style={{ fontFamily: "var(--font-sans)" }}>
                      Nhập 4–6 chữ số PIN từ thiết bị CA Token của bạn. Demo: nhập bất kỳ 4+ số.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Confirmed signature stamp */
              <div className="rounded-[12px] border-2 overflow-hidden" style={{ borderColor: "#7c3aed" }}>
                <div className="px-6 py-5 flex items-center gap-4" style={{ background: "linear-gradient(135deg,#4c1d95,#7c3aed)" }}>
                  <div className="size-14 rounded-full border-2 border-white/40 flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <Stamp className="size-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] text-white/60 uppercase tracking-widest">ĐÃ KÝ SỐ ĐIỆN TỬ</div>
                    <div className="text-[14px] text-white font-bold" style={{ fontFamily: "var(--font-sans)" }}>{user.name ?? "Lãnh đạo cấp cao"}</div>
                    <div className="text-[13px] text-white/70" style={{ fontFamily: "var(--font-sans)" }}>{new Date().toLocaleString("vi-VN")} · RSA-2048</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] text-white/60">Mã xác thực</div>
                    <div className="text-[13px] text-white font-mono font-bold">SIG-{Date.now().toString(36).toUpperCase().slice(-8)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {canMove && (
          <ReadinessPanel warnings={checkTransitionReadiness(c, { sigConfirmed })} />
        )}
        <div className="flex items-center justify-between">
          <RoleBadge role={user.roleLabel || user.role} canAct={canMove} />
          {canMove && (
            <DsButton variant="primary" size="lg" onClick={doTransition} disabled={!sigConfirmed}>
              <Pen className="size-4" />{sigConfirmed ? "Ban hành Quyết định" : "Cần xác thực ký số"}
            </DsButton>
          )}
        </div>
      </div>
    );
  }

  /* ── DECISION_ISSUED ───────────────────────────────────────────── */
  if (c.state === "decision_issued") {
    const qdEntry = c.auditLog.find(a => a.state === "decision_issued");
    return (
      <div className="space-y-6">
        {isAdmin && <AdminHealthBar c={c} />}
        {isIndividual && <PersonalStatusBanner c={c} myP={myParticipant} danh_hieu={regForm.danh_hieu} hoTen={regForm.hoTen} indivDone={indivDone} />}
        {isUnitLeader && !canMove && <UnitLeaderContextPanel c={c} user={user} unitDecisions={unitDecisions} />}
        <SectionHeader icon={FileText} title="Bước 6 — Quyết định khen thưởng đã ban hành" sub="QĐ có hiệu lực pháp lý, đã ký số CA · Gửi đơn vị & đăng cổng TTĐT theo Điều 44 NĐ 152/2025/NĐ-CP" color="#0f7a3e" />

        <div className="rounded-[14px] overflow-hidden border-2" style={{ borderColor: "#6ee7b7" }}>
          <div className="px-6 py-5" style={{ background: "linear-gradient(135deg,#052e16,#0f7a3e)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="size-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <FileText className="size-6 text-white" />
              </div>
              <div>
                <div className="text-[13px] text-white/60 uppercase tracking-widest">QUYẾT ĐỊNH KHEN THƯỞNG</div>
                <div className="text-[14px] text-white font-bold" style={{ fontFamily: "var(--font-sans)" }}>QĐ/{c.code?.replace("PT-", "")}</div>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1.5 rounded-full text-[13px] text-white font-bold"
                  style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  ✅ Đã ký số CA
                </span>
              </div>
            </div>
            <h3 className="text-[18px] text-white mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              V/v khen thưởng kết quả {c.name}
            </h3>
            <div className="flex items-center gap-4 text-[13px] text-white/60">
              <span>Ban hành: {qdEntry?.time ?? fmtDate("2026-04-23")}</span>
              <span>Ký bởi: {qdEntry?.actor ?? c.leader}</span>
              <span>Tỉnh Đồng Nai</span>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="text-[13px] text-[#0b1426] font-semibold mb-2" style={{ fontFamily: "var(--font-sans)" }}>
              Danh sách được khen thưởng ({c.participants.filter(p => p.hoSoStatus === "da_duyet").length} cá nhân/tập thể)
            </div>
            {c.participants.filter(p => p.hoSoStatus === "da_duyet").slice(0, 3).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-[8px]"
                style={{ background: i === 0 ? "#fdf3d9" : "#f0fdf4", border: `1px solid ${i === 0 ? "#f0dba0" : "#bbf7d0"}` }}>
                <Award className="size-5 shrink-0" style={{ color: ["#8a6400", "#4f5d6e", "#cd7c3b"][i] }} />
                <div className="flex-1">
                  <div className="text-[13px] text-[#0b1426] font-semibold">{p.name}</div>
                  <div className="text-[13px] text-[#635647]">{p.donVi}</div>
                </div>
                <span className="text-[13px] px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#166534", fontWeight: 600 }}>
                  {c.awards[i] ?? "Bằng khen"}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t flex items-center gap-3" style={{ borderColor: "#d1fae5" }}>
            <DsButton variant="secondary" size="sm"><Download className="size-3.5" />Tải QĐ (PDF)</DsButton>
            <DsButton variant="secondary" size="sm"><Printer className="size-3.5" />In quyết định</DsButton>
          </div>
        </div>

        {/* ── THANH TOÁN TIỀN THƯỞNG ─────────────────────────── */}
        {(() => {
          const winners = c.participants.filter(p => p.hoSoStatus === "da_duyet");
          const totalPaid = winners.reduce((s, p) => {
            if (!paymentStatus[p.id]) return s;
            const r = p.hinhThucDeNghi ? getRewardByName(p.hinhThucDeNghi) : getRewardByName(c.awards[0] ?? "");
            return s + (r?.tienThuong ?? 0);
          }, 0);
          const totalDue = winners.reduce((s, p) => {
            const r = p.hinhThucDeNghi ? getRewardByName(p.hinhThucDeNghi) : getRewardByName(c.awards[0] ?? "");
            return s + (r?.tienThuong ?? 0);
          }, 0);
          const allPaid = winners.length > 0 && winners.every(p => paymentStatus[p.id]);
          return (
            <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: allPaid ? "#86efac" : "#fcd34d" }}>
              <div className="px-5 py-3.5 border-b flex items-center gap-2"
                style={{ background: allPaid ? "#f0fdf4" : "#fefce8", borderColor: allPaid ? "#86efac" : "#fcd34d" }}>
                <Hash className={`size-4 ${allPaid ? "text-[#166534]" : "text-[#b45309]"}`} />
                <span className={`text-[13px] font-semibold ${allPaid ? "text-[#166534]" : "text-[#92400e]"}`}
                  style={{ fontFamily: "var(--font-sans)" }}>
                  Thanh toán tiền thưởng — Điều 7 TT 28/2025/TT-BTC
                </span>
                <span className="ml-auto text-[13px]" style={{ fontFamily: "var(--font-sans)", color: allPaid ? "#166534" : "#b45309" }}>
                  Đã chi: {formatTienThuong(totalPaid)} / {formatTienThuong(totalDue)}
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--color-line)" }}>
                {winners.length === 0 ? (
                  <div className="px-5 py-4 text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Chưa có người được khen thưởng</div>
                ) : winners.map(p => {
                  const r = p.hinhThucDeNghi ? getRewardByName(p.hinhThucDeNghi) : getRewardByName(c.awards[0] ?? "");
                  const tien = r?.tienThuong ?? 0;
                  const paid = !!paymentStatus[p.id];
                  return (
                    <div key={p.id} className="px-5 py-3 flex items-center gap-3 transition-colors"
                      style={{ background: paid ? "#f0fdf4" : "white" }}>
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{p.name}</div>
                        <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{p.donVi} · {r?.tenViet ?? c.awards[0] ?? "—"}</div>
                      </div>
                      <span className="text-[14px] font-bold shrink-0"
                        style={{ fontFamily: "var(--font-sans)", color: tien > 0 ? "#0f7a3e" : "#4f5d6e" }}>
                        {tien > 0 ? formatTienThuong(tien) : "—"}
                      </span>
                      {canMove && (
                        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                          <input type="checkbox" className="size-4" checked={paid}
                            style={{ accentColor: "#166534" }}
                            onChange={() => setPaymentStatus(s => ({ ...s, [p.id]: !s[p.id] }))} />
                          <span className="text-[13px]" style={{ fontFamily: "var(--font-sans)", color: paid ? "#166534" : "#635647" }}>
                            {paid ? "Đã chi" : "Chưa chi"}
                          </span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
              {winners.length > 0 && (
                <div className="px-5 py-2.5 border-t flex items-center gap-2"
                  style={{ borderColor: "var(--color-line)", background: "var(--color-paper)" }}>
                  <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                    Căn cứ: Điều 7 TT 28/2025/TT-BTC · Điều 10 TT 118/2025/TT-BTC
                  </span>
                  {!allPaid && canMove && (
                    <button className="ml-auto text-[13px] px-3 h-7 rounded-[5px] border"
                      style={{ borderColor: "#166534", color: "#166534", background: "#f0fdf4", fontFamily: "var(--font-sans)" }}
                      onClick={() => setPaymentStatus(Object.fromEntries(winners.map(p => [p.id, true])))}>
                      Xác nhận tất cả đã chi
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Phát hành QĐ đến các kênh */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background:"var(--color-paper)", borderColor:"var(--color-line)" }}>
            <Send className="size-4 text-[#0f7a3e]" />
            <span className="text-[13px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>Phát hành & Thông báo Quyết định</span>
            <span className="ml-auto text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Căn cứ: Điều 44 NĐ 152/2025/NĐ-CP</span>
          </div>
          <div className="px-5 py-3 grid grid-cols-2 gap-3">
            {[
              { icon:Globe,       label:"Cổng thông tin điện tử",   status:"Đã đăng",    done:true  },
              { icon:FileText,    label:"Văn bản hành chính gửi đơn vị", status:"Đã gửi",done:true  },
              { icon:MessageSquare,label:"Email thông báo đơn vị",  status:"Đã gửi",     done:true  },
              { icon:Printer,     label:"Bản cứng lưu hồ sơ",       status:"Chờ in",     done:false },
            ].map(ch=>{
              const Icon=ch.icon;
              return (
                <div key={ch.label} className="flex items-center gap-3 px-4 py-2.5 rounded-[8px] border"
                  style={{ borderColor:ch.done?"#86efac":"#e5e7eb", background:ch.done?"#f0fdf4":"#f9fafb" }}>
                  <Icon className="size-4 shrink-0" style={{ color:ch.done?"#166534":"#4f5d6e" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)" }}>{ch.label}</div>
                  </div>
                  <span className="text-[13px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                    style={{ background:ch.done?"#dcfce7":"#f3f4f6", color:ch.done?"#166534":"#4f5d6e", fontFamily: "var(--font-sans)" }}>
                    {ch.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <RoleBadge role={user.roleLabel || user.role} canAct={canMove} />
          {canMove && (
            <DsButton variant="primary" size="md" onClick={doTransition}>
              <Globe className="size-4" />Công bố kết quả chính thức
            </DsButton>
          )}
        </div>
      </div>
    );
  }

  /* ── PUBLIC ────────────────────────────────────────────────────── */
  if (c.state === "public") {
    const winners = c.participants.filter(p => p.hoSoStatus === "da_duyet");
    const totalNop = c.participants.filter(p => p.hoSoStatus !== "chua_nop").length;
    const tyLeHoanthanh = c.totalUnits > 0 ? Math.round((c.joinedUnits / c.totalUnits) * 100) : 0;
    const tyLeDuyet = totalNop > 0 ? Math.round((winners.length / totalNop) * 100) : 0;
    return (
      <div className="space-y-6">
        {isAdmin && <AdminHealthBar c={c} />}
        {isIndividual && <PersonalStatusBanner c={c} myP={myParticipant} danh_hieu={regForm.danh_hieu} hoTen={regForm.hoTen} indivDone={indivDone} />}
        {isUnitLeader && !canMove && <UnitLeaderContextPanel c={c} user={user} unitDecisions={unitDecisions} />}
        <SectionHeader icon={Globe} title="Bước 7 — Tổng kết & Công bố kết quả" sub="Thông báo khen thưởng đã gửi đến toàn bộ đơn vị và cá nhân liên quan" color="#0e7490" />

        {/* ── BÁO CÁO TỔNG KẾT ── */}
        <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "#a5f3fc" }}>
          <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ background: "#ecfeff", borderColor: "#a5f3fc" }}>
            <BarChart3 className="size-4 text-[#0e7490]" />
            <span className="text-[13px] font-semibold text-[#0e7490]" style={{ fontFamily: "var(--font-sans)" }}>
              Báo cáo tổng kết giai đoạn phong trào
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-[10px] border" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
                <div className="text-[13px] text-[#6b7280] mb-1" style={{ fontFamily: "var(--font-sans)" }}>Đơn vị tham gia</div>
                <div className="text-[18px] font-bold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{c.joinedUnits}<span className="text-[14px] text-[#6b7280]">/{c.totalUnits}</span></div>
                <div className="text-[13px] text-[#0e7490] font-semibold mt-0.5">{tyLeHoanthanh}% hoàn thành</div>
              </div>
              <div className="text-center p-3 rounded-[10px] border" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
                <div className="text-[13px] text-[#6b7280] mb-1" style={{ fontFamily: "var(--font-sans)" }}>Hồ sơ đã nộp</div>
                <div className="text-[18px] font-bold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{totalNop}</div>
                <div className="text-[13px] text-[#166534] font-semibold mt-0.5">{c.participants.length} đăng ký</div>
              </div>
              <div className="text-center p-3 rounded-[10px] border" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
                <div className="text-[13px] text-[#6b7280] mb-1" style={{ fontFamily: "var(--font-sans)" }}>Được khen thưởng</div>
                <div className="text-[18px] font-bold text-[#8a6400]" style={{ fontFamily: "var(--font-sans)" }}>{winners.length}</div>
                <div className="text-[13px] text-[#b45309] font-semibold mt-0.5">{tyLeDuyet}% tỷ lệ duyệt</div>
              </div>
              <div className="text-center p-3 rounded-[10px] border" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
                <div className="text-[13px] text-[#6b7280] mb-1" style={{ fontFamily: "var(--font-sans)" }}>Ý kiến công khai</div>
                <div className="text-[18px] font-bold text-[#7c3aed]" style={{ fontFamily: "var(--font-sans)" }}>{publicComments.length}</div>
                <div className="text-[13px] text-[#7c3aed] font-semibold mt-0.5">lượt phản hồi</div>
              </div>
            </div>

            {/* So sánh mục tiêu vs thực tế */}
            <div className="rounded-[10px] border p-4 space-y-3" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
              <div className="text-[13px] font-semibold text-[#374151]" style={{ fontFamily: "var(--font-sans)" }}>Mục tiêu vs Thực tế</div>
              {[
                { label: "Đơn vị tham gia", target: c.totalUnits, actual: c.joinedUnits, color: "#0e7490" },
                { label: "Hồ sơ đề nghị", target: Math.max(c.totalUnits * 2, 8), actual: totalNop, color: "#1C5FBE" },
                { label: "Đề nghị khen thưởng", target: Math.max(c.totalUnits, 5), actual: winners.length, color: "#166534" },
              ].map(row => {
                const pct = row.target > 0 ? Math.min(Math.round((row.actual / row.target) * 100), 100) : 0;
                return (
                  <div key={row.label} className="space-y-1">
                    <div className="flex justify-between text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                      <span className="text-[#374151]">{row.label}</span>
                      <span className="font-semibold" style={{ color: row.color }}>{row.actual}/{row.target} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: row.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[14px] overflow-hidden border" style={{ borderColor: "#67e8f9" }}>
          <div className="px-6 py-5 text-center" style={{ background: "linear-gradient(135deg,#083344,#0e7490)" }}>
            <Sparkles className="size-8 text-[#67e8f9] mx-auto mb-2" />
            <h3 className="text-[18px] text-white font-bold mb-1" style={{ fontFamily: "var(--font-sans)" }}>
              🏆 Kết quả khen thưởng {c.name}
            </h3>
            <p className="text-[13px] text-white/60">{winners.length} cá nhân/tập thể được khen thưởng</p>
          </div>
          <div className="p-5">
            <div className="grid gap-3">
              {winners.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 p-4 rounded-[10px] border"
                  style={{ background: i === 0 ? "#fdf3d9" : i === 1 ? "#f3f4f6" : i === 2 ? "#fff7ed" : "#f9fafb", borderColor: i === 0 ? "#f0dba0" : "#e5e7eb" }}>
                  <div className="size-10 rounded-full flex items-center justify-center text-white text-[14px] shrink-0"
                    style={{ background: ["#8a6400", "#4f5d6e", "#cd7c3b"][i] ?? "#6b7280", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] text-[#0b1426] font-bold">{p.name}</div>
                    <div className="text-[13px] text-[#635647]">{p.donVi} · {p.position ?? (p.type === "tap_the" ? "Tập thể" : "Cá nhân")}</div>
                  </div>
                  <div className="text-right">
                    {p.score && <div className="text-[18px] font-bold text-[#0f7a3e]" style={{ fontFamily: "var(--font-sans)" }}>{p.score} điểm</div>}
                    <div className="text-[13px] text-[#635647]">{c.awards[i] ?? "Bằng khen"}</div>
                  </div>
                  <DsButton variant="secondary" size="sm"><Download className="size-3" />Giấy khen</DsButton>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <RoleBadge role={user.roleLabel || user.role} canAct={canMove} />
          {canMove && (
            <DsButton variant="primary" size="md" onClick={doTransition}>
              <Archive className="size-4" />Tổng kết phong trào
            </DsButton>
          )}
        </div>
      </div>
    );
  }

  /* ── ARCHIVED ──────────────────────────────────────────────────── */
  if (c.state === "archived") {
    return (
      <div className="space-y-6">
        <SectionHeader icon={Archive} title="Bước 7 — Tổng kết & Lưu trữ" sub="Toàn bộ tài liệu được lưu trữ theo NĐ 30/2020/NĐ-CP · Thời hạn bảo quản: 20 năm" color="#374151" />

        <div className="rounded-[12px] border p-5 flex items-start gap-4" style={{ borderColor: "#d1d5db", background: "#f9fafb" }}>
          <Archive className="size-10 text-[#6b7280] shrink-0" />
          <div>
            <h3 className="text-[14px] text-[#374151] font-bold" style={{ fontFamily: "var(--font-sans)" }}>Phong trào đã hoàn thành & Tổng kết</h3>
            <p className="text-[13px] text-[#6b7280] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
              Toàn bộ biên bản, quyết định, hồ sơ minh chứng đã được lưu trữ điện tử và bản cứng theo quy định.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <InfoCard label="Tổng hồ sơ" value={`${c.participants.length}`} icon={FileText} color="#374151" />
          <InfoCard label="Được khen thưởng" value={`${c.participants.filter(p => p.hoSoStatus === "da_duyet").length}`} icon={Trophy} color="#8a6400" />
          <InfoCard label="Đơn vị tham gia" value={`${c.joinedUnits}`} icon={Building2} color="#1C5FBE" />
          <InfoCard label="Hoạt động" value={`${c.auditLog.length}`} icon={FileCheck} color="#7c3aed" />
        </div>

        {/* ── QUYẾT TOÁN KINH PHÍ ──────────────────────────── */}
        {(() => {
          const winners = c.participants.filter(p => p.hoSoStatus === "da_duyet");
          const tongThucChi = winners.reduce((s, p) => {
            const r = p.hinhThucDeNghi ? getRewardByName(p.hinhThucDeNghi) : getRewardByName(c.awards[0] ?? "");
            return s + (r?.tienThuong ?? 0);
          }, 0);
          return (
            <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: quyetToanDone ? "#86efac" : "#c4b5fd" }}>
              <div className="px-5 py-3.5 border-b flex items-center gap-2"
                style={{ background: quyetToanDone ? "#f0fdf4" : "#faf5ff", borderColor: quyetToanDone ? "#86efac" : "#c4b5fd" }}>
                <FileCheck className={`size-4 ${quyetToanDone ? "text-[#166534]" : "text-[#7c3aed]"}`} />
                <span className={`text-[13px] font-semibold ${quyetToanDone ? "text-[#166534]" : "text-[#7c3aed]"}`}
                  style={{ fontFamily: "var(--font-sans)" }}>
                  Quyết toán kinh phí khen thưởng — Điều 8 TT 28/2025/TT-BTC
                </span>
                {quyetToanDone && <span className="ml-auto flex items-center gap-1 text-[13px] px-2 py-0.5 rounded-full"
                  style={{ background: "#dcfce7", color: "#166534", fontFamily: "var(--font-sans)" }}>
                  <CheckCircle2 className="size-3" />Đã quyết toán
                </span>}
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-[8px] border" style={{ borderColor: "#e5e7eb" }}>
                    <div className="text-[13px] text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)" }}>Số người được khen</div>
                    <div className="text-[18px] font-bold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{winners.length}</div>
                  </div>
                  <div className="text-center p-3 rounded-[8px] border" style={{ borderColor: "#e5e7eb" }}>
                    <div className="text-[13px] text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)" }}>Tổng thực chi</div>
                    <div className="text-[14px] font-bold text-[#0f7a3e]" style={{ fontFamily: "var(--font-sans)" }}>{tongThucChi > 0 ? formatTienThuong(tongThucChi) : "—"}</div>
                  </div>
                  <div className="text-center p-3 rounded-[8px] border" style={{ borderColor: "#e5e7eb" }}>
                    <div className="text-[13px] text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)" }}>So dự toán</div>
                    <div className="text-[14px] font-bold text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)" }}>
                      {c.tongKinhPhi && c.tongKinhPhi > 0
                        ? (tongThucChi <= c.tongKinhPhi ? "✅ Đúng kế hoạch" : "⚠ Vượt dự toán")
                        : "—"}
                    </div>
                  </div>
                </div>
                {!quyetToanDone ? (
                  <div className="space-y-2">
                    <p className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>
                      Xác nhận đã hoàn thành quyết toán, lưu chứng từ kế toán vào hồ sơ lưu trữ:
                    </p>
                    <button onClick={() => setQuyetToanDone(true)}
                      className="flex items-center gap-2 px-4 h-9 rounded-[6px] border text-[13px] font-semibold"
                      style={{ borderColor: "#7c3aed", background: "#faf5ff", color: "#7c3aed", fontFamily: "var(--font-sans)" }}>
                      <Stamp className="size-4" />Xác nhận đã quyết toán
                    </button>
                    <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                      Căn cứ: Điều 8 TT 28/2025/TT-BTC · Điều 10 TT 118/2025/TT-BTC · NĐ 30/2020/NĐ-CP
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-[6px] border" style={{ borderColor: "#86efac", background: "#f0fdf4" }}>
                    <CheckCircle2 className="size-4 text-[#166534]" />
                    <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>
                      Quyết toán hoàn thành · Chứng từ đã lưu trữ theo NĐ 30/2020/NĐ-CP · Thời hạn bảo quản: 20 năm
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── ĐÁNH GIÁ & BÀI HỌC KINH NGHIỆM ── */}
        <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: tongKetDone ? "#86efac" : "#d1d5db" }}>
          <div className="px-5 py-3.5 border-b flex items-center gap-2"
            style={{ background: tongKetDone ? "#f0fdf4" : "#f9fafb", borderColor: tongKetDone ? "#86efac" : "#d1d5db" }}>
            <ClipboardList className={`size-4 ${tongKetDone ? "text-[#166534]" : "text-[#374151]"}`} />
            <span className={`text-[13px] font-semibold ${tongKetDone ? "text-[#166534]" : "text-[#374151]"}`} style={{ fontFamily: "var(--font-sans)" }}>
              Đánh giá & Bài học kinh nghiệm
            </span>
            {tongKetDone && (
              <span className="ml-auto flex items-center gap-1 text-[13px] px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#166534", fontFamily: "var(--font-sans)" }}>
                <CheckCircle2 className="size-3" />Đã hoàn thành
              </span>
            )}
          </div>
          <div className="px-5 py-4 space-y-4">
            {!tongKetDone ? (
              <>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Điểm mạnh", placeholder: "Những điểm đã làm tốt trong phong trào...", color: "#166534", bg: "#f0fdf4", border: "#86efac" },
                      { label: "Hạn chế", placeholder: "Những hạn chế cần khắc phục...", color: "#b45309", bg: "#fffbeb", border: "#fcd34d" },
                    ].map(({ label, placeholder, color, bg, border }) => (
                      <div key={label} className="space-y-1.5">
                        <label className="text-[13px] font-semibold" style={{ color, fontFamily: "var(--font-sans)" }}>{label}</label>
                        <textarea rows={3} placeholder={placeholder}
                          className="w-full px-3 py-2 rounded-[8px] border text-[13px] resize-none outline-none focus:ring-1"
                          style={{ borderColor: border, background: bg, color: "#374151", fontFamily: "var(--font-sans)", focusRingColor: color }} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[#374151]" style={{ fontFamily: "var(--font-sans)" }}>
                      Kiến nghị & Đề xuất cho các phong trào tiếp theo
                    </label>
                    <textarea rows={4}
                      value={tongKetNote}
                      onChange={e => setTongKetNote(e.target.value)}
                      placeholder="Ghi các kiến nghị, đề xuất nhằm nâng cao chất lượng phong trào thi đua trong những năm tiếp theo..."
                      className="w-full px-3 py-2 rounded-[8px] border text-[13px] resize-none outline-none focus:ring-1 focus:ring-[#374151]"
                      style={{ borderColor: "#d1d5db", background: "#fff", color: "#374151", fontFamily: "var(--font-sans)" }} />
                    <p className="text-[13px] text-[#4f5d6e]" style={{ fontFamily: "var(--font-sans)" }}>{tongKetNote.length} ký tự</p>
                  </div>
                </div>
                <button onClick={() => setTongKetDone(true)}
                  className="flex items-center gap-2 px-4 h-9 rounded-[6px] border text-[13px] font-semibold"
                  style={{ borderColor: "#374151", background: "#f9fafb", color: "#374151", fontFamily: "var(--font-sans)" }}>
                  <CheckCircle2 className="size-4" />Xác nhận đã tổng kết
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-[8px] border" style={{ borderColor: "#86efac", background: "#f0fdf4" }}>
                  <CheckCircle2 className="size-4 text-[#166534] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>
                      Báo cáo tổng kết đã hoàn thành
                    </p>
                    {tongKetNote && (
                      <p className="text-[13px] text-[#374151] mt-1 whitespace-pre-line" style={{ fontFamily: "var(--font-sans)" }}>{tongKetNote}</p>
                    )}
                  </div>
                </div>
                <p className="text-[13px] text-[#4f5d6e]" style={{ fontFamily: "var(--font-sans)" }}>
                  Căn cứ: Điều 87 Luật TĐKT 2022 · NĐ 30/2020/NĐ-CP
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
          <div className="px-4 py-3 border-b" style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Tài liệu lưu trữ</span>
          </div>
          <div className="p-4 space-y-2">
            {[
              { name: `Quyết định phát động ${c.code}.pdf`, size: "2.4 MB" },
              { name: `Biên bản HĐ xét duyệt ${c.code}.pdf`, size: "1.8 MB" },
              { name: `Quyết định khen thưởng ${c.code}.pdf`, size: "3.1 MB" },
              { name: `Tổng hợp hồ sơ tham gia.xlsx`, size: "890 KB" },
              { name: `Quyết toán kinh phí khen thưởng ${c.code}.pdf`, size: "420 KB" },
              { name: `Báo cáo tổng kết phong trào ${c.code}.pdf`, size: "1.2 MB" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[8px] border" style={{ borderColor: "#e5e7eb" }}>
                <FileText className="size-4 text-[#6b7280] shrink-0" />
                <span className="flex-1 text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{f.name}</span>
                <span className="text-[13px] text-[#635647]">{f.size}</span>
                <DsButton variant="secondary" size="sm"><Download className="size-3" /></DsButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   FINANCIAL TAB — Dự toán kinh phí khen thưởng
   Căn cứ: NĐ 152/2025/NĐ-CP, TT 28/2025/TT-BTC, TT 118/2025/TT-BTC
═══════════════════════════════════════════════════════════════════ */
function FinancialTab({ c }: { c: Campaign }) {
  const { theme } = useTheme();

  /* Ánh xạ awards string → RewardForm */
  const mappedAwards = c.awards.map(name => ({ name, reward: getRewardByName(name) }));

  /* Danh sách đối tượng đã nộp / được duyệt */
  const eligibles = c.participants.filter(p =>
    p.hoSoStatus === "da_duyet" || p.hoSoStatus === "da_nop"
  );

  /* Tính tiền thưởng dự kiến cho mỗi người */
  const participantRows = eligibles.map(p => {
    const byForm = p.hinhThucDeNghi ? getRewardByName(p.hinhThucDeNghi) : undefined;
    const byType = mappedAwards.find(a =>
      a.reward && (a.reward.loaiDoiTuong.includes(p.type) || a.reward.loaiDoiTuong.includes("ca_hai"))
    )?.reward;
    const reward = byForm ?? byType;
    return { p, reward, tien: reward?.tienThuong ?? 0 };
  });

  /* Tổng kinh phí theo nguồn */
  const byNguon: Record<NguonKinhPhi, number> = {
    ngan_sach_nn: 0, quy_thi_dua: 0, don_vi_tu_chi: 0,
  };
  participantRows.forEach(r => {
    if (r.reward) byNguon[r.reward.nguonKinhPhi] += r.tien;
  });
  const grandTotal = participantRows.reduce((s, r) => s + r.tien, 0);

  /* Thống kê hình thức */
  const awardStats = mappedAwards.map(({ name, reward }) => ({
    name, reward,
    count: participantRows.filter(r => r.reward?.id === reward?.id).length,
    total: participantRows.filter(r => r.reward?.id === reward?.id).reduce((s, r) => s + r.tien, 0),
  })).filter(a => a.reward);

  const nguonColors: Record<NguonKinhPhi, { color: string; bg: string; border: string }> = {
    ngan_sach_nn: { color: "#1C5FBE", bg: "#ddeafc", border: "#93c5fd" },
    quy_thi_dua:  { color: "#166534", bg: "#dcfce7", border: "#86efac" },
    don_vi_tu_chi:{ color: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  };

  return (
    <div className="space-y-6">
      {/* InfoCards tổng kết */}
      <div className="grid grid-cols-3 gap-4">
        <InfoCard label="Đối tượng khen thưởng" value={`${eligibles.length} người/đơn vị`} icon={Users} color="#7c3aed" />
        <InfoCard label="Tổng kinh phí dự kiến" value={grandTotal > 0 ? formatTienThuong(grandTotal) : "—"} icon={Award} color="#b45309" />
        <InfoCard label="Hình thức khen" value={`${mappedAwards.filter(a=>a.reward).length} loại`} icon={Medal} color="#1C5FBE" />
      </div>

      {/* Hình thức khen thưởng */}
      <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
        <div className="px-5 py-3.5 border-b flex items-center gap-2"
          style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
          <Award className="size-4" style={{ color: theme.primary }} />
          <span className="text-[14px] font-semibold text-[#0b1426]"
            style={{ fontFamily: "var(--font-sans)" }}>Hình thức khen thưởng dự kiến</span>
          <span className="ml-auto text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Căn cứ: NĐ 152/2025/NĐ-CP · TT 28/2025/TT-BTC
          </span>
        </div>
        {mappedAwards.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Chưa chọn hình thức khen thưởng
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--color-line)" }}>
            {mappedAwards.map(({ name, reward }) => {
              const nguon = reward?.nguonKinhPhi;
              const nc = nguon ? nguonColors[nguon] : { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" };
              return (
                <div key={name} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>
                      {name}
                    </div>
                    {reward ? (
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[13px] px-2 py-0.5 rounded-full border"
                          style={{ color: nc.color, background: nc.bg, borderColor: nc.border, fontFamily: "var(--font-sans)" }}>
                          {getNguonKinhPhiLabel(reward.nguonKinhPhi)}
                        </span>
                        <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                          {reward.canCuThuong}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-[#f59e0b]" style={{ fontFamily: "var(--font-sans)" }}>
                        Không tìm thấy trong danh mục — kiểm tra lại tên hình thức
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14px] font-bold" style={{ fontFamily: "var(--font-sans)", color: reward?.tienThuong ? "#0f7a3e" : "#4f5d6e" }}>
                      {reward ? formatTienThuong(reward.tienThuong) : "—"}
                    </div>
                    {reward?.canCuTien && (
                      <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{reward.canCuTien}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chi tiết đối tượng */}
      {eligibles.length > 0 && (
        <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
          <div className="px-5 py-3.5 border-b flex items-center gap-2"
            style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
            <Users className="size-4" style={{ color: theme.primary }} />
            <span className="text-[14px] font-semibold text-[#0b1426]"
              style={{ fontFamily: "var(--font-sans)" }}>Dự toán kinh phí theo đối tượng</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--color-paper)" }}>
                {["Tên cá nhân / tập thể", "Đơn vị", "Hình thức khen", "Nguồn KP", "Tiền thưởng"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[13px] uppercase tracking-wide text-[#635647] border-b"
                    style={{ borderColor: "var(--color-line)", fontFamily: "var(--font-sans)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participantRows.map(({ p, reward, tien }) => {
                const nguon = reward?.nguonKinhPhi;
                const nc = nguon ? nguonColors[nguon] : { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" };
                return (
                  <tr key={p.id} className="border-b hover:bg-[#f8fafc] transition-colors"
                    style={{ borderColor: "var(--color-line)" }}>
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{p.name}</div>
                      {p.position && <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{p.position}</div>}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#4a5568]" style={{ fontFamily: "var(--font-sans)" }}>{p.donVi}</td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] px-2 py-0.5 rounded border"
                        style={{ color: theme.primary, background: theme.tint, borderColor: theme.primary + "30", fontFamily: "var(--font-sans)" }}>
                        {reward?.tenViet ?? p.hinhThucDeNghi ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {nguon && (
                        <span className="text-[13px] px-2 py-0.5 rounded-full border"
                          style={{ color: nc.color, background: nc.bg, borderColor: nc.border, fontFamily: "var(--font-sans)" }}>
                          {getNguonKinhPhiLabel(nguon)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[14px] font-bold"
                        style={{ fontFamily: "var(--font-sans)", color: tien > 0 ? "#0f7a3e" : "#4f5d6e" }}>
                        {tien > 0 ? formatTienThuong(tien) : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--color-paper)", borderTop: "2px solid var(--color-line)" }}>
                <td colSpan={4} className="px-4 py-3 text-[13px] font-bold text-[#0b1426]"
                  style={{ fontFamily: "var(--font-sans)" }}>TỔNG CỘNG</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[14px] font-bold text-[#0f7a3e]"
                    style={{ fontFamily: "var(--font-sans)" }}>
                    {grandTotal > 0 ? formatTienThuong(grandTotal) : "—"}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tổng hợp theo nguồn kinh phí */}
      <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
        <div className="px-5 py-3.5 border-b flex items-center gap-2"
          style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}>
          <Hash className="size-4" style={{ color: theme.primary }} />
          <span className="text-[14px] font-semibold text-[#0b1426]"
            style={{ fontFamily: "var(--font-sans)" }}>Tổng hợp theo nguồn kinh phí</span>
        </div>
        <div className="px-5 py-4 grid grid-cols-3 gap-4">
          {(Object.entries(byNguon) as [NguonKinhPhi, number][]).map(([nguon, tong]) => {
            const nc = nguonColors[nguon];
            const pct = grandTotal > 0 ? Math.round((tong / grandTotal) * 100) : 0;
            return (
              <div key={nguon} className="rounded-[10px] border p-4"
                style={{ borderColor: nc.border, background: nc.bg + "60" }}>
                <div className="text-[13px] font-semibold uppercase tracking-wide mb-2"
                  style={{ color: nc.color, fontFamily: "var(--font-sans)" }}>
                  {getNguonKinhPhiLabel(nguon)}
                </div>
                <div className="text-[18px] font-bold mb-1"
                  style={{ fontFamily: "var(--font-sans)", color: tong > 0 ? nc.color : "#4f5d6e" }}>
                  {tong > 0 ? formatTienThuong(tong) : "—"}
                </div>
                {grandTotal > 0 && tong > 0 && (
                  <>
                    <div className="w-full h-1.5 rounded-full bg-white/60 overflow-hidden mb-1">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: nc.color }} />
                    </div>
                    <div className="text-[13px]" style={{ color: nc.color, fontFamily: "var(--font-sans)" }}>{pct}% tổng kinh phí</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t flex items-center gap-2" style={{ borderColor: "var(--color-line)", background: "#f8fafc" }}>
          <BookOpen className="size-3.5 text-[#635647]" />
          <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Căn cứ: Chương VII NĐ 152/2025/NĐ-CP · Điều 3–8 TT 28/2025/TT-BTC · Điều 7–10 TT 118/2025/TT-BTC
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FULL-SCREEN DETAIL VIEW
═══════════════════════════════════════════════════════════════════ */
function CampaignDetailView({ c, user, onBack, onTransition, onAddParticipant }: {
  c: Campaign; user: LoginUser;
  onBack: () => void;
  onTransition: (id: string, s: CampaignState) => void;
  onAddParticipant: (campaignId: string, p: Participant) => void;
}) {
  const { theme } = useTheme();
  const [tab, setTab] = useState<"overview"|"participants"|"scoring"|"kinh_phi"|"history">("overview");
  const [confirming, setConfirming] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const scfg     = STATE_CFG[c.state];
  const curIdx   = stateIndex(c.state);
  const joinPct  = c.totalUnits ? Math.round(c.joinedUnits / c.totalUnits * 100) : 0;
  const left     = daysLeft(c.ngayKetThuc);
  const canMove  = canTransition(user, c);
  const viewOnly = isViewOnly(user, c);
  const nxtLabel = nextStateLabel(c);
  const isCreator = user.id === c.creatorId;
  const approvedCount = c.participants.filter(p => p.hoSoStatus === "da_duyet").length;

  const TABS = [
    { key:"overview" as const,     label:"Tổng quan",   icon:Info,      badge:null },
    { key:"participants" as const, label:"Hồ sơ",        icon:Users,     badge:c.participants.length ? `${c.participants.length}` : null },
    { key:"scoring" as const,      label:"Xếp hạng",    icon:BarChart2, badge:null },
    { key:"kinh_phi" as const,     label:"Kinh phí",    icon:Hash,      badge:null },
    { key:"history" as const,      label:"Lịch sử",     icon:FileText,  badge:`${c.auditLog.length}` },
  ];

  return (
    <div className="min-h-full flex flex-col" style={{ background:"var(--color-paper)" }}>

      {/* ── COMPACT STICKY TOP BAR ── */}
      <div className="sticky top-0 z-30 px-5 py-2.5 border-b flex items-center gap-2.5"
        style={{ background:"white", borderColor:"var(--color-line)", boxShadow:"0 1px 6px rgba(11,20,38,0.07)" }}>

        <button onClick={onBack}
          className="flex items-center gap-1 text-[13px] px-2.5 h-7 rounded-[6px] border transition-colors hover:bg-[#eef2f8] shrink-0"
          style={{ color:"#6b7280", borderColor:"var(--color-line)", fontFamily: "var(--font-sans)" }}>
          <ChevronLeft className="size-3" />Danh sách
        </button>

        <button onClick={() => setSidebarCollapsed(v => !v)}
          className="flex items-center gap-1 text-[13px] px-2 h-7 rounded-[6px] border transition-colors hover:bg-[#eef2f8] shrink-0"
          style={{ color:"#6b7280", borderColor:"var(--color-line)", fontFamily: "var(--font-sans)" }}
          title={sidebarCollapsed ? "Mở sidebar" : "Ẩn sidebar"}>
          <Layers className="size-3" />
        </button>

        <div className="h-4 w-px bg-[#e2e8f0] shrink-0" />

        {/* Status dot + label */}
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[13px] border shrink-0"
          style={{ color:scfg.color, background:scfg.bg, borderColor:scfg.border, fontFamily: "var(--font-sans)", fontWeight:600 }}>
          {c.state === "active" && <div className="size-1.5 rounded-full animate-pulse" style={{ background:scfg.color }} />}
          {scfg.label}
        </span>

        <Trophy className="size-3.5 shrink-0" style={{ color:theme.primary }} />
        <span className="text-[13px] text-[#0b1426] flex-1 min-w-0 truncate"
          style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{c.name}</span>

        {/* Quick stats inline */}
        <div className="hidden lg:flex items-center gap-4 shrink-0 border-l border-r px-4 mx-1"
          style={{ borderColor:"var(--color-line)" }}>
          <div className="flex items-center gap-1.5 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <Users className="size-3 text-[#6b7280]" />
            <span className="text-[#374151] font-semibold">{c.joinedUnits}/{c.totalUnits}</span>
            <span className="text-[#4f5d6e]">đơn vị</span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <FileText className="size-3 text-[#6b7280]" />
            <span className="text-[#374151] font-semibold">{c.participants.length}</span>
            <span className="text-[#4f5d6e]">hồ sơ</span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <Timer className="size-3 text-[#6b7280]" />
            <span className="font-semibold" style={{ color: left <= 7 ? "#c8102e" : left <= 30 ? "#b45309" : "#374151" }}>
              {left > 0 ? `${left} ngày` : "Hết hạn"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <DsButton variant="secondary" size="sm">
            <Download className="size-3" />PDF
          </DsButton>

          {viewOnly ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-[13px]"
              style={{ background:"#fff7ed", borderColor:"#fdba74", color:"#c2410c", fontFamily: "var(--font-sans)" }}>
              <Lock className="size-3" />Chỉ xem
            </div>
          ) : canMove ? (
            confirming ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] px-2.5 py-1 rounded-[6px] border"
                  style={{ background:"#fef9ec", borderColor:"#fcd34d", color:"#92400e", fontFamily: "var(--font-sans)" }}>
                  → <strong>{nxtLabel}</strong>?
                </span>
                <DsButton variant="secondary" size="sm" onClick={() => setConfirming(false)}>Hủy</DsButton>
                <DsButton variant="primary" size="sm"
                  onClick={() => { onTransition(c.id, nextState(c.state)); setConfirming(false); }}>
                  <CheckCheck className="size-3" />OK
                </DsButton>
              </div>
            ) : (
              <DsButton variant="primary" size="sm" onClick={() => setConfirming(true)}>
                <ArrowRight className="size-3" />{nxtLabel}
              </DsButton>
            )
          ) : c.state !== "archived" ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-[13px]"
              style={{ background:"#f9fafb", borderColor:"#e5e7eb", color:"#4f5d6e", fontFamily: "var(--font-sans)" }}>
              <Lock className="size-3" />Không có quyền
            </div>
          ) : null}
        </div>
      </div>

      {/* ── 2-COLUMN BODY ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT SIDEBAR ── */}
        {!sidebarCollapsed && (
          <div className="w-[232px] shrink-0 border-r flex flex-col sticky top-[45px] self-start"
            style={{ borderColor:"var(--color-line)", background:"#fafaf9",
              height:"calc(100vh - 45px)", overflowY:"auto" }}>

            {/* Campaign identity block */}
            <div className="p-4 border-b" style={{ borderColor:"var(--color-line)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="size-9 rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ background:theme.primary }}>
                  <Trophy className="size-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#4f5d6e] leading-none mb-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                    {c.code}
                  </div>
                  <div className="text-[13px] text-[#0b1426] font-semibold leading-snug truncate"
                    style={{ fontFamily: "var(--font-sans)" }}>{TYPE_LABELS[c.type]}</div>
                </div>
              </div>
              <h2 className="text-[12.5px] text-[#0b1426] leading-snug mb-3"
                style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{c.name}</h2>
              <div className="space-y-1.5">
                {[
                  { icon:Calendar, text:c.period },
                  { icon:User,     text:c.leader },
                  { icon:Building2,text:c.donViPhuTrach },
                ].map(({ icon:Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Icon className="size-3 text-[#4f5d6e] shrink-0" />
                    <span className="text-[13px] text-[#6b7280] truncate" style={{ fontFamily: "var(--font-sans)" }}>{text}</span>
                  </div>
                ))}
              </div>
              {c.urgent && (
                <div className="mt-2.5 inline-flex items-center gap-1 text-[13px] px-2 py-0.5 rounded-full"
                  style={{ background:"#fee2e2", color:"#c8102e", fontFamily: "var(--font-sans)", fontWeight:600 }}>
                  🔴 Ưu tiên cao
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="p-4 border-b space-y-3" style={{ borderColor:"var(--color-line)" }}>
              {/* Participation bar */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[13px] text-[#4f5d6e]" style={{ fontFamily: "var(--font-sans)" }}>Đơn vị tham gia</span>
                  <span className="text-[13px] font-bold text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>{c.joinedUnits}/{c.totalUnits} <span className="font-normal text-[#4f5d6e]">({joinPct}%)</span></span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-[#e5e7eb]">
                  <div className="h-full rounded-full bg-[#166534] transition-all" style={{ width:`${joinPct}%` }} />
                </div>
              </div>
              {/* Hồ sơ */}
              <div className="flex justify-between">
                <span className="text-[13px] text-[#4f5d6e]" style={{ fontFamily: "var(--font-sans)" }}>Hồ sơ đề cử</span>
                <span className="text-[13px] font-bold text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)" }}>
                  {c.participants.length} <span className="font-normal text-[#4f5d6e]">({approvedCount} duyệt)</span>
                </span>
              </div>
              {/* Thời hạn */}
              <div className="flex justify-between">
                <span className="text-[13px] text-[#4f5d6e]" style={{ fontFamily: "var(--font-sans)" }}>Thời hạn</span>
                <span className="text-[13px] font-bold" style={{ fontFamily: "var(--font-sans)", color: left <= 7 ? "#c8102e" : left <= 30 ? "#b45309" : "#374151" }}>
                  {left > 0 ? `còn ${left} ngày` : "Đã hết hạn"}
                </span>
              </div>
              {/* Awards */}
              <div className="flex justify-between">
                <span className="text-[13px] text-[#4f5d6e]" style={{ fontFamily: "var(--font-sans)" }}>Khen thưởng</span>
                <span className="text-[13px] font-bold text-[#8a6400]" style={{ fontFamily: "var(--font-sans)" }}>{c.awards.length} hình thức</span>
              </div>
            </div>

            {/* Vertical workflow stepper */}
            <div className="p-4 flex-1">
              <div className="text-[13px] text-[#4f5d6e] uppercase tracking-wider mb-3 font-semibold"
                style={{ fontFamily: "var(--font-sans)" }}>Tiến trình vòng đời</div>

              <div className="space-y-0">
                {PHASES.map((phase, pi) => {
                  const phaseComplete = phase.states.every(s => stateIndex(s) < curIdx);
                  const phaseActive   = phase.states.includes(c.state);
                  const phaseColor    = phaseComplete ? "#16a34a" : phaseActive ? phase.color : "#d1d5db";

                  return (
                    <div key={pi} className="relative">
                      {/* Phase header */}
                      <div className="flex items-center gap-2 py-1.5">
                        <div className="size-5 rounded-full flex items-center justify-center shrink-0 z-10"
                          style={{ background: phaseComplete ? "#dcfce7" : phaseActive ? phase.color : "#f3f4f6",
                            border:`1.5px solid ${phaseColor}` }}>
                          {phaseComplete
                            ? <Check className="size-2.5 text-[#166534]" strokeWidth={2.5} />
                            : <div className="size-1.5 rounded-full" style={{ background: phaseActive ? "white" : "#d1d5db" }} />}
                        </div>
                        <span className="text-[13px] font-semibold leading-tight"
                          style={{ fontFamily: "var(--font-sans)", color: phaseComplete ? "#166534" : phaseActive ? phase.color : "#4f5d6e" }}>
                          {phase.label}
                        </span>
                      </div>

                      {/* State dots under this phase */}
                      <div className="ml-[9px] pl-4 border-l pb-2"
                        style={{ borderColor: phaseComplete ? "#86efac" : phaseActive ? phase.color + "40" : "#e5e7eb" }}>
                        {phase.states.map(s => {
                          const sc    = STATE_CFG[s];
                          const isDone = stateIndex(s) < curIdx;
                          const isCur  = s === c.state;
                          const Icon  = sc.icon;

                          return (
                            <div key={s}
                              className="flex items-center gap-2 py-[3px] px-1.5 rounded-[5px] mb-0.5"
                              style={{ background: isCur ? phase.color + "12" : "transparent" }}>
                              <div className="size-[14px] rounded-full flex items-center justify-center shrink-0"
                                style={{
                                  background: isDone ? "#dcfce7" : isCur ? phase.color : "transparent",
                                  border:`1px solid ${isDone ? "#6ee7b7" : isCur ? phase.color : "#d1d5db"}`,
                                }}>
                                {isDone
                                  ? <Check className="size-2 text-[#16a34a]" strokeWidth={3} />
                                  : <Icon className="size-2" style={{ color: isCur ? "white" : "#c4c9d4" }} />}
                              </div>
                              <span className="text-[10.5px] leading-tight flex-1"
                                style={{ fontFamily: "var(--font-sans)", fontWeight: isCur ? 700 : isDone ? 500 : 400,
                                  color: isCur ? phase.color : isDone ? "#166534" : "#4f5d6e" }}>
                                {sc.short}
                              </span>
                              {isCur && (
                                <span className="text-[13px] px-1 py-px rounded-sm shrink-0"
                                  style={{ background: phase.color, color:"white", fontFamily: "var(--font-sans)", fontWeight:700 }}>
                                  ●
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Role + permission badge */}
            <div className="p-3 border-t space-y-2" style={{ borderColor:"var(--color-line)" }}>
              {viewOnly && (
                <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-[8px] border text-[13px]"
                  style={{ background:"#fff7ed", borderColor:"#fdba74", color:"#c2410c", fontFamily: "var(--font-sans)" }}>
                  <Lock className="size-3 shrink-0" />
                  <span>Chỉ xem — không có quyền chuyển bước</span>
                </div>
              )}
              {canMove && user.role === "quản trị hệ thống" && (
                <div className="flex items-start gap-1.5 px-2.5 py-2 rounded-[8px] border text-[13px]"
                  style={{ background:"#e0f2fe", borderColor:"#67e8f9", color:"#0e7490", fontFamily: "var(--font-sans)" }}>
                  <CheckCircle2 className="size-3 shrink-0 mt-0.5" />
                  <span>Quản trị hệ thống — ghi vào audit log</span>
                </div>
              )}
              {canMove && isCreator && user.role !== "lãnh đạo cấp cao" && user.role !== "quản trị hệ thống" && (
                <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-[8px] border text-[13px]"
                  style={{ background:"#dcfce7", borderColor:"#86efac", color:"#166534", fontFamily: "var(--font-sans)" }}>
                  <CheckCircle2 className="size-3 shrink-0" />
                  <span>Người tạo — có quyền chuyển bước</span>
                </div>
              )}
              <RoleBadge role={user.roleLabel || user.role} canAct={canMove} />
            </div>
          </div>
        )}

        {/* ── RIGHT CONTENT ── */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Step workspace — always visible, no tab needed */}
          <div className="px-6 pt-5 pb-0">
            {/* StepWorkspacePanel always mounted to preserve votes/form state */}
            <StepWorkspacePanel c={c} user={user} onTransition={onTransition} onBack={onBack} onAddParticipant={onAddParticipant} />
          </div>

          {/* Divider */}
          <div className="mx-6 mt-6 mb-0 border-t" style={{ borderColor:"var(--color-line)" }} />

          {/* Secondary tabs */}
          <div className="sticky top-[45px] z-10 border-b flex items-center gap-0 px-6 bg-white"
            style={{ borderColor:"var(--color-line)", boxShadow:"0 1px 3px rgba(11,20,38,0.04)" }}>
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex items-center gap-1.5 px-4 py-3 text-[13px] border-b-2 transition-all"
                  style={{ fontFamily: "var(--font-sans)", borderBottomColor: active ? theme.primary : "transparent",
                    color: active ? theme.primary : "#635647", fontWeight: active ? 600 : 400, background:"transparent" }}>
                  <Icon className="size-3.5" />
                  {t.label}
                  {t.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[13px]"
                      style={{ background: active ? theme.tint : "#eef2f8", color: active ? theme.primary : "#5a5040" }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="px-6 py-5 flex-1">
            {tab === "overview"     && <OverviewTab c={c} />}
            {tab === "participants" && <ParticipantsTab c={c} />}
            {tab === "scoring"      && <ScoringTab c={c} />}
            {tab === "kinh_phi"     && <FinancialTab c={c} />}
            {tab === "history"      && <HistoryTab c={c} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CAMPAIGN CARD (list view)
═══════════════════════════════════════════════════════════════════ */
function CampaignCard({ c, onClick, user }: { c: Campaign; onClick: () => void; user: LoginUser }) {
  const { theme } = useTheme();
  const scfg    = STATE_CFG[c.state];
  const phase   = getPhaseOf(c.state);
  const left    = daysLeft(c.ngayKetThuc);
  const joinPct = c.totalUnits ? Math.round(c.joinedUnits / c.totalUnits * 100) : 0;
  const curIdx  = stateIndex(c.state);
  const phasePct= Math.round((curIdx / (STATE_ORDER.length - 1)) * 100);
  const canRegister = c.state === "active" && !canTransition(user, c) && (user.role === "lãnh đạo đơn vị" || user.role === "cá nhân");

  return (
    <div onClick={onClick}
      className="ds-card ds-card-default ds-card-hoverable cursor-pointer flex flex-col rounded-[12px] overflow-hidden group">
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-[10px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{ background:phase.color+"18" }}>
            <Trophy className="size-5" style={{ color:phase.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[13px]"
                style={{ color:scfg.color, background:scfg.bg, borderColor:scfg.border,
                  fontFamily: "var(--font-sans)", fontWeight:500 }}>
                {c.state==="active"&&<div className="size-1 rounded-full animate-pulse" style={{ background:scfg.color }} />}
                {scfg.short}
              </span>
              <span className="text-[13px] px-1.5 py-0.5 rounded bg-[#eef2f8] text-[#635647]"
                style={{ fontFamily: "var(--font-sans)" }}>{TYPE_LABELS[c.type]}</span>
              {c.urgent&&<span className="text-[13px] text-[#c8102e]">🔴</span>}
            </div>
            <h3 className="text-[13px] text-[#0b1426] leading-snug"
              style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{c.name}</h3>
          </div>
        </div>

        {/* Workflow progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              Giai đoạn: <span style={{ color:phase.color, fontWeight:600 }}>{phase.label}</span>
            </span>
            <span style={{ color:phase.color, fontFamily: "var(--font-sans)", fontWeight:600 }}>{phasePct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#eef2f8] overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width:`${phasePct}%`, background:phase.color }} />
          </div>
        </div>

        {/* Participation */}
        {c.totalUnits > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                {c.joinedUnits}/{c.totalUnits} đơn vị tham gia
              </span>
              <span style={{ color:joinPct===100?"#0f7a3e":theme.primary, fontFamily: "var(--font-sans)", fontWeight:600 }}>
                {joinPct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#eef2f8] overflow-hidden">
              <div className="h-full rounded-full"
                style={{ width:`${joinPct}%`, background:joinPct===100?"#16a34a":theme.primary }} />
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[13px] text-[#635647]"
            style={{ fontFamily: "var(--font-sans)" }}>
            <Calendar className="size-3 shrink-0" />{c.period}
          </div>
          {(c.state==="active"||c.state==="submission_closed") && left > 0 && (
            <div className="flex items-center gap-1.5 text-[13px]"
              style={{ color:left<=7?"#c8102e":left<=14?"#b45309":"#166534", fontFamily: "var(--font-sans)", fontWeight:500 }}>
              <Timer className="size-3 shrink-0" />Còn {left} ngày nộp hồ sơ
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[13px] text-[#635647]"
            style={{ fontFamily: "var(--font-sans)" }}>
            <User className="size-3 shrink-0" />{c.leader}
          </div>
        </div>

        {/* Awards */}
        <div className="flex flex-wrap gap-1">
          {c.awards.slice(0,2).map(a => (
            <span key={a} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[13px] bg-[#fdf3d9] border border-[#f0dba0] text-[#7d4a00]"
              style={{ fontFamily: "var(--font-sans)" }}>
              <Star className="size-2.5" style={{ fill:"#8a6400",color:"#8a6400" }} />
              {a.split(" ").slice(0,4).join(" ")}
            </span>
          ))}
          {c.awards.length>2 && <span className="text-[13px] text-[#635647] self-center">+{c.awards.length-2}</span>}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t" style={{ borderColor:"var(--color-line)" }}>
          {canRegister ? (
            <button onClick={onClick}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-[8px] text-[13px] font-semibold transition-all"
              style={{ background:"#166534", color:"white", fontFamily: "var(--font-sans)" }}>
              <Plus className="size-3.5" />Đăng ký tham gia
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{c.code}</span>
              <span className="flex items-center gap-1 text-[13px] transition-colors group-hover:gap-1.5"
                style={{ color:theme.primary, fontFamily: "var(--font-sans)", fontWeight:500 }}>
                Xem chi tiết <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CREATE MODAL
═══════════════════════════════════════════════════════════════════ */
function CreateModal({ onClose, onCreate, user }: { onClose: ()=>void; onCreate: (c: Campaign)=>void; user: LoginUser }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name:"", type:"toan_tinh" as CampaignType, subjectType:"ca_hai" as SubjectType,
    sector:"chung" as SectorId,
    mucTieu:"", doiTuong:"", ngayBatDau:"2026-05-01", ngayKetThuc:"2026-12-31",
    ngayNopHoSo:"2026-11-30", leader:"", donViPhuTrach:"",
    awards:[] as string[], urgent:false,
    budget:{} as Record<string, number>,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));
  const touchAll = (keys: string[]) => setTouched(t => { const n = { ...t }; keys.forEach(k => { n[k] = true; }); return n; });

  const awardOpts = ["Cờ thi đua Chính phủ","Bằng khen Thủ tướng","Cờ thi đua UBND Tỉnh",
    "Bằng khen Chủ tịch UBND","Chiến sĩ thi đua cấp Tỉnh","Chiến sĩ thi đua cấp Bộ","Giấy khen"];
  const toggleAward = (a:string) => setForm(p=>({...p,awards:p.awards.includes(a)?p.awards.filter(x=>x!==a):[...p.awards,a]}));
  const STEPS = ["Thông tin cơ bản","Thời gian & Mục tiêu","Khen thưởng","Xác nhận"];

  /* ── validation per step ── */
  const errs: Record<string, string | null> = {
    name:          form.name.trim().length === 0 ? "Tên phong trào không được để trống" : form.name.trim().length < 5 ? "Tên phải có ít nhất 5 ký tự" : null,
    leader:        form.leader.trim().length < 2 ? "Vui lòng nhập tên người phụ trách" : null,
    donViPhuTrach: form.donViPhuTrach.trim().length < 2 ? "Vui lòng nhập đơn vị phụ trách" : null,
    mucTieu:       form.mucTieu.trim().length === 0 ? "Mục tiêu không được để trống" : form.mucTieu.trim().length < 30 ? "Mục tiêu cần ít nhất 30 ký tự" : null,
    doiTuong:      form.doiTuong.trim().length < 10 ? "Vui lòng mô tả đối tượng tham gia (ít nhất 10 ký tự)" : null,
    ngayBatDau:    !form.ngayBatDau ? "Ngày bắt đầu là bắt buộc" : null,
    ngayKetThuc:   !form.ngayKetThuc ? "Ngày kết thúc là bắt buộc" : form.ngayKetThuc <= form.ngayBatDau ? "Ngày kết thúc phải sau ngày bắt đầu" : null,
    ngayNopHoSo:   !form.ngayNopHoSo ? "Hạn nộp hồ sơ là bắt buộc" : form.ngayNopHoSo <= form.ngayBatDau ? "Hạn nộp phải sau ngày bắt đầu" : form.ngayNopHoSo > form.ngayKetThuc ? "Hạn nộp phải trước hoặc bằng ngày kết thúc" : null,
    awards:        form.awards.length === 0 ? "Chọn ít nhất 1 hình thức khen thưởng" : null,
  };
  const stepValid = [
    !errs.name && !errs.leader && !errs.donViPhuTrach,
    !errs.mucTieu && !errs.doiTuong && !errs.ngayBatDau && !errs.ngayKetThuc && !errs.ngayNopHoSo,
    !errs.awards,
    true,
  ];
  const STEP_FIELDS = [
    ["name","leader","donViPhuTrach"],
    ["mucTieu","doiTuong","ngayBatDau","ngayKetThuc","ngayNopHoSo"],
    ["awards"],
    [],
  ];
  const fieldErr = (k: string) => touched[k] ? errs[k] : null;
  const inputBorder = (k: string) => fieldErr(k) ? { borderColor: "#f87171" } : {};

  const goNext = () => {
    if (!stepValid[step]) { touchAll(STEP_FIELDS[step]); return; }
    setStep(p => p + 1);
  };

  const handleCreate = () => {
    const rawCriteria = getCriteriaForSector(form.sector);
    const tieuChi: ScoreCriteria[] = rawCriteria.map(c => ({
      id: c.id, name: c.name, maxScore: c.maxScore, canCu: c.canCu, mota: c.mota,
    }));
    const rewardForms = form.awards
      .map(name => ({ name, r: getRewardByName(name) }))
      .filter(x => x.r)
      .map(x => ({ formId: x.r!.id, soLuong: form.budget[x.name] ?? 0 }));
    const tongKinhPhi = form.awards.reduce((sum, name) => {
      const r = getRewardByName(name);
      return sum + (r?.tienThuong ?? 0) * (form.budget[name] ?? 0);
    }, 0);
    const newC: Campaign = {
      id:`PT-${Date.now()}`, code:`PT-2026-0${Math.floor(Math.random()*90)+10}`,
      name:form.name, type:form.type, subjectType:form.subjectType,
      state:"draft", level:TYPE_LABELS[form.type],
      sector: form.sector,
      mucTieu:form.mucTieu, doiTuong:form.doiTuong,
      tieuChi,
      ngayBatDau:form.ngayBatDau, ngayKetThuc:form.ngayKetThuc, ngayNopHoSo:form.ngayNopHoSo,
      period:`${fmtDate(form.ngayBatDau)} – ${fmtDate(form.ngayKetThuc)}`,
      leader:form.leader||"Chưa phân công", donViPhuTrach:form.donViPhuTrach,
      awards:form.awards, totalUnits:0, joinedUnits:0,
      participants:[], unitScores:[],
      canCuPhapLy: suggestLegalBases(form.type, form.sector),
      ghiChu:"", urgent:form.urgent, creatorId: user.id,
      rewardForms, tongKinhPhi,
      auditLog:[{id:`al-${Date.now()}`,action:"Tạo phong trào",actor:user.name||"Người dùng",role:user.roleLabel||"Chuyên viên",time:fmtDate("2026-04-23"),detail:`Khởi tạo phong trào "${form.name}"`,state:"draft"}],
    };
    onCreate(newC);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(11,20,38,0.55)" }}>
      <div className="w-full max-w-xl rounded-[12px] bg-white shadow-[var(--shadow-modal)] flex flex-col max-h-[88vh]">
        <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor:"var(--color-line)" }}>
          <div className="size-9 rounded-[6px] flex items-center justify-center" style={{ background:theme.tint }}>
            <Trophy className="size-4" style={{ color:theme.primary }} />
          </div>
          <div className="flex-1">
            <h2 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
              Phát động Phong trào mới
            </h2>
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              Bước {step+1}/{STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X className="size-4" /></button>
        </div>
        {/* Steps */}
        <div className="flex items-center gap-2 px-6 pt-4">
          {STEPS.map((_,i) => (
            <div key={i} className="flex items-center gap-1 flex-1 last:flex-none">
              <div className="size-6 rounded-full flex items-center justify-center text-[13px]"
                style={{ background:i<step?"#16a34a":i===step?theme.primary:"#e5e7eb",
                  color:"#fff", fontFamily: "var(--font-sans)", fontWeight:600 }}>
                {i<step ? "✓" : i+1}
              </div>
              {i<STEPS.length-1 && <div className="flex-1 h-px" style={{ background:i<step?"#16a34a":"#e5e7eb" }} />}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {step===0 && (<>
            <div className="ds-input-root">
              <label className="ds-input-label ds-input-label-required">Tên phong trào</label>
              <input className="ds-input ds-input-md" style={inputBorder("name")} placeholder="Nhập tên phong trào thi đua..." value={form.name}
                onChange={e=>setForm(p=>({...p,name:e.target.value}))} onBlur={()=>touch("name")} />
              {fieldErr("name") && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{fieldErr("name")}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="ds-input-root"><label className="ds-input-label">Cấp phong trào</label>
                <select className="ds-input ds-input-md" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value as CampaignType}))}>
                  {Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
              <div className="ds-input-root"><label className="ds-input-label">Đối tượng</label>
                <select className="ds-input ds-input-md" value={form.subjectType} onChange={e=>setForm(p=>({...p,subjectType:e.target.value as SubjectType}))}>
                  <option value="ca_nhan">Cá nhân</option><option value="tap_the">Tập thể</option><option value="ca_hai">Cả hai</option></select></div>
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label">Ngành / Lĩnh vực</label>
              <select className="ds-input ds-input-md" value={form.sector} onChange={e=>setForm(p=>({...p,sector:e.target.value as SectorId}))}>
                {(Object.entries(SECTOR_LABELS) as [SectorId, string][]).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {form.sector !== "chung" && (() => {
              const criteria = getCriteriaForSector(form.sector);
              return (
                <div className="rounded-[8px] border p-3 space-y-2" style={{ borderColor:"#bfdbfe", background:"#eff6ff" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="size-3.5 text-[#1d4ed8]" />
                    <span className="text-[13px] font-semibold text-[#1d4ed8]" style={{ fontFamily: "var(--font-sans)" }}>
                      Bộ tiêu chí tự động — {SECTOR_LABELS[form.sector]}
                    </span>
                    <span className="ml-auto text-[13px] text-[#1d4ed8]" style={{ fontFamily: "var(--font-sans)" }}>
                      {criteria.reduce((s,c)=>s+c.maxScore,0)} điểm
                    </span>
                  </div>
                  {criteria.map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                      <span className="size-5 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center text-[13px] shrink-0">{c.maxScore}</span>
                      <span className="text-[#0b1426] flex-1">{c.name}</span>
                      <span className="text-[#6b7280] text-[13px] shrink-0">{c.canCu.split(",").pop()?.trim()}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div className="grid grid-cols-2 gap-3">
              <div className="ds-input-root">
                <label className="ds-input-label ds-input-label-required">Người phụ trách</label>
                <input className="ds-input ds-input-md" style={inputBorder("leader")} value={form.leader}
                  onChange={e=>setForm(p=>({...p,leader:e.target.value}))} onBlur={()=>touch("leader")} placeholder="Họ tên người phụ trách" />
                {fieldErr("leader") && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{fieldErr("leader")}</p>}
              </div>
              <div className="ds-input-root">
                <label className="ds-input-label ds-input-label-required">Đơn vị phụ trách</label>
                <input className="ds-input ds-input-md" style={inputBorder("donViPhuTrach")} value={form.donViPhuTrach}
                  onChange={e=>setForm(p=>({...p,donViPhuTrach:e.target.value}))} onBlur={()=>touch("donViPhuTrach")} placeholder="Tên đơn vị chủ trì" />
                {fieldErr("donViPhuTrach") && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{fieldErr("donViPhuTrach")}</p>}
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" className="size-4" style={{ accentColor:theme.primary }} checked={form.urgent} onChange={e=>setForm(p=>({...p,urgent:e.target.checked}))} />
              <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>Đánh dấu ưu tiên</span>
            </label>
          </>)}
          {step===1 && (<>
            <div className="ds-input-root">
              <label className="ds-input-label ds-input-label-required">Mục tiêu</label>
              <textarea className="ds-input" rows={3} style={{ padding:"10px 12px", resize:"vertical", ...inputBorder("mucTieu") }}
                placeholder="Mô tả mục tiêu cụ thể của phong trào... (ít nhất 30 ký tự)"
                value={form.mucTieu} onChange={e=>setForm(p=>({...p,mucTieu:e.target.value}))} onBlur={()=>touch("mucTieu")} />
              <div className="flex items-center justify-between mt-1">
                {fieldErr("mucTieu") ? <p className="text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)" }}>{fieldErr("mucTieu")}</p> : <span/>}
                <span className="text-[13px] text-[#635647] ml-auto">{form.mucTieu.trim().length}/30</span>
              </div>
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label ds-input-label-required">Đối tượng tham gia</label>
              <textarea className="ds-input" rows={2} style={{ padding:"10px 12px", resize:"vertical", ...inputBorder("doiTuong") }}
                placeholder="Mô tả đối tượng tham gia... (ít nhất 10 ký tự)"
                value={form.doiTuong} onChange={e=>setForm(p=>({...p,doiTuong:e.target.value}))} onBlur={()=>touch("doiTuong")} />
              {fieldErr("doiTuong") && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{fieldErr("doiTuong")}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="ds-input-root">
                <label className="ds-input-label ds-input-label-required">Ngày bắt đầu</label>
                <input type="date" className="ds-input ds-input-md" style={inputBorder("ngayBatDau")} value={form.ngayBatDau}
                  onChange={e=>setForm(p=>({...p,ngayBatDau:e.target.value}))} onBlur={()=>touch("ngayBatDau")} />
                {fieldErr("ngayBatDau") && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{fieldErr("ngayBatDau")}</p>}
              </div>
              <div className="ds-input-root">
                <label className="ds-input-label ds-input-label-required">Hạn nộp hồ sơ</label>
                <input type="date" className="ds-input ds-input-md" style={inputBorder("ngayNopHoSo")} value={form.ngayNopHoSo}
                  onChange={e=>setForm(p=>({...p,ngayNopHoSo:e.target.value}))} onBlur={()=>touch("ngayNopHoSo")} />
                {fieldErr("ngayNopHoSo") && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{fieldErr("ngayNopHoSo")}</p>}
              </div>
              <div className="ds-input-root">
                <label className="ds-input-label ds-input-label-required">Ngày kết thúc</label>
                <input type="date" className="ds-input ds-input-md" style={inputBorder("ngayKetThuc")} value={form.ngayKetThuc}
                  onChange={e=>setForm(p=>({...p,ngayKetThuc:e.target.value}))} onBlur={()=>touch("ngayKetThuc")} />
                {fieldErr("ngayKetThuc") && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{fieldErr("ngayKetThuc")}</p>}
              </div>
            </div>
            {/* cross-field date summary when all valid */}
            {!errs.ngayBatDau && !errs.ngayKetThuc && !errs.ngayNopHoSo && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-[13px]" style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", fontFamily: "var(--font-sans)", color:"#166534" }}>
                <CheckCircle2 className="size-3.5 shrink-0" />
                Thời gian hợp lệ · Kéo dài {Math.ceil((new Date(form.ngayKetThuc).getTime()-new Date(form.ngayBatDau).getTime())/864e5)} ngày · Hạn nộp cách kết thúc {Math.ceil((new Date(form.ngayKetThuc).getTime()-new Date(form.ngayNopHoSo).getTime())/864e5)} ngày
              </div>
            )}
          </>)}
          {step===2 && (<div className="space-y-4">
            <div>
              <p className="text-[13px] mb-2" style={{ fontFamily: "var(--font-sans)", color: fieldErr("awards") ? "#c8102e" : "#635647" }}>
                Chọn hình thức khen thưởng sẽ áp dụng trong phong trào<span style={{ color:"#c8102e" }}> *</span>
              </p>
              {fieldErr("awards") && <p className="text-[13px] text-[#c8102e] mb-2" style={{ fontFamily: "var(--font-sans)" }}>{fieldErr("awards")}</p>}
              <div className="grid grid-cols-2 gap-2">
                {awardOpts.map(a => {
                  const r = getRewardByName(a);
                  return (
                    <label key={a} className="flex items-center gap-2.5 p-3 rounded-[6px] border cursor-pointer"
                      style={{ borderColor:form.awards.includes(a)?theme.primary:"var(--color-line)", background:form.awards.includes(a)?theme.tint:"#fff" }}>
                      <input type="checkbox" className="size-4" style={{ accentColor:theme.primary }} checked={form.awards.includes(a)} onChange={()=>toggleAward(a)} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)" }}>{a}</div>
                        {r && r.tienThuong > 0 && (
                          <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{formatTienThuong(r.tienThuong)}/người</div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            {form.awards.length > 0 && (<>
              <div className="border-t pt-3" style={{ borderColor:"var(--color-line)" }}>
                <p className="text-[13px] font-semibold text-[#0b1426] mb-2" style={{ fontFamily: "var(--font-sans)" }}>
                  Dự toán sơ bộ — nhập số lượng dự kiến:
                </p>
                <div className="space-y-2">
                  {form.awards.map(a => {
                    const r = getRewardByName(a);
                    const count = form.budget[a] ?? 0;
                    return (
                      <div key={a} className="flex items-center gap-3 px-3 py-2 rounded-[6px] border"
                        style={{ borderColor:"var(--color-line)", background:"#f8fafc" }}>
                        <span className="flex-1 text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)" }}>{a}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button className="size-6 rounded border text-[14px] flex items-center justify-center"
                            style={{ borderColor:"#e5e7eb" }}
                            onClick={() => setForm(p => ({ ...p, budget:{ ...p.budget, [a]: Math.max(0, (p.budget[a]??0)-1) } }))}>−</button>
                          <input type="number" min={0} className="w-14 text-center ds-input ds-input-sm" value={count}
                            onChange={e => setForm(p => ({ ...p, budget:{ ...p.budget, [a]: Math.max(0, parseInt(e.target.value)||0) } }))} />
                          <button className="size-6 rounded border text-[14px] flex items-center justify-center"
                            style={{ borderColor:"#e5e7eb" }}
                            onClick={() => setForm(p => ({ ...p, budget:{ ...p.budget, [a]: (p.budget[a]??0)+1 } }))}>+</button>
                        </div>
                        <span className="text-[13px] font-semibold w-28 text-right shrink-0"
                          style={{ fontFamily: "var(--font-sans)", color: r && r.tienThuong > 0 ? "#0f7a3e" : "#4f5d6e" }}>
                          {r && r.tienThuong > 0 ? formatTienThuong(r.tienThuong * count) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor:"var(--color-line)" }}>
                  <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Tổng kinh phí dự kiến</span>
                  <span className="text-[14px] font-bold text-[#0f7a3e]" style={{ fontFamily: "var(--font-sans)" }}>
                    {formatTienThuong(form.awards.reduce((s, a) => {
                      const r = getRewardByName(a);
                      return s + (r?.tienThuong ?? 0) * (form.budget[a] ?? 0);
                    }, 0))}
                  </span>
                </div>
                <p className="text-[13px] text-[#635647] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                  Căn cứ: Điều 3 TT 28/2025/TT-BTC · Chương VII NĐ 152/2025/NĐ-CP
                </p>
              </div>
            </>)}
          </div>)}
          {step===3 && (() => {
            const suggestedBases = suggestLegalBases(form.type, form.sector);
            const criteriaPreview = getCriteriaForSector(form.sector);
            const allGood = stepValid[0] && stepValid[1] && stepValid[2];
            return (
              <div className="space-y-3">
                {!allGood && (
                  <div className="rounded-[8px] p-3 border space-y-1.5" style={{ borderColor:"#fca5a5", background:"#fff1f2" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertCircle className="size-3.5 text-[#c8102e]" />
                      <span className="text-[13px] font-semibold text-[#c8102e]" style={{ fontFamily: "var(--font-sans)" }}>Vui lòng bổ sung các trường bắt buộc</span>
                    </div>
                    {Object.entries(errs).filter(([,v])=>v).map(([k,v])=>(
                      <div key={k} className="flex items-center gap-2 text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)" }}>
                        <span className="size-1.5 rounded-full bg-[#c8102e] shrink-0"/>
                        {v}
                      </div>
                    ))}
                  </div>
                )}
                <div className="rounded-[8px] p-4 bg-[#f8fafc] border space-y-2" style={{ borderColor:"var(--color-line)" }}>
                  {[
                    ["Tên", form.name||"(Chưa nhập)"],
                    ["Cấp", TYPE_LABELS[form.type]],
                    ["Ngành", SECTOR_LABELS[form.sector]],
                    ["Người phụ trách", form.leader||"(Chưa nhập)"],
                    ["Đơn vị phụ trách", form.donViPhuTrach||"(Chưa nhập)"],
                    ["Thời gian", `${fmtDate(form.ngayBatDau)} – ${fmtDate(form.ngayKetThuc)}`],
                    ["Hạn nộp HS", fmtDate(form.ngayNopHoSo)],
                    ["Khen thưởng", form.awards.length?form.awards.join(", "):"(Chưa chọn)"],
                    ["Dự toán KP", formatTienThuong(form.awards.reduce((s,a)=>s+(getRewardByName(a)?.tienThuong??0)*(form.budget[a]??0),0))],
                  ].map(([k,v])=>(
                    <div key={k} className="flex gap-2 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                      <span className="text-[#635647] w-28 shrink-0">{k}:</span>
                      <span className="text-[#0b1426]">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-[8px] border p-3 space-y-1.5" style={{ borderColor:"#d1fae5", background:"#f0fdf4" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <BookOpen className="size-3.5 text-[#166534]" />
                    <span className="text-[13px] font-semibold text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>
                      Căn cứ pháp lý sẽ áp dụng
                    </span>
                  </div>
                  {suggestedBases.map(b => (
                    <div key={b} className="flex items-center gap-2 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                      <CheckCircle2 className="size-3.5 text-[#16a34a] shrink-0" />
                      <span className="text-[#0b1426]">{b}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-[8px] border p-3 space-y-1.5" style={{ borderColor:"#e9d5ff", background:"#faf5ff" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Scale className="size-3.5 text-[#7c3aed]" />
                    <span className="text-[13px] font-semibold text-[#7c3aed]" style={{ fontFamily: "var(--font-sans)" }}>
                      Bộ tiêu chí chấm điểm ({criteriaPreview.reduce((s,c)=>s+c.maxScore,0)} điểm)
                    </span>
                  </div>
                  {criteriaPreview.map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                      <span className="size-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[13px] shrink-0 font-bold">{c.maxScore}</span>
                      <span className="text-[#0b1426] flex-1">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t"
          style={{ borderColor:"var(--color-line)", background:"#f8fafc" }}>
          <DsButton variant="secondary" size="md" onClick={()=>step>0?setStep(p=>p-1):onClose()}>
            <ChevronLeft className="size-4" />{step===0?"Hủy":"Quay lại"}
          </DsButton>
          {step<STEPS.length-1
            ? <DsButton variant="primary" size="md" onClick={goNext}>
                Tiếp theo <ChevronRight className="size-4" />
              </DsButton>
            : <DsButton variant="primary" size="md"
                disabled={!stepValid[0]||!stepValid[1]||!stepValid[2]}
                onClick={handleCreate}>
                <Trophy className="size-4" />Tạo phong trào
              </DsButton>}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export function PhongTraoPage({ user, onDetailOpen, onDetailClose }: { user: LoginUser; onDetailOpen?: () => void; onDetailClose?: () => void }) {
  const { theme } = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [detail, setDetail]       = useState<Campaign | null>(null);

  const openDetail = (c: Campaign) => { setDetail(c); onDetailOpen?.(); };
  const closeDetail = () => { setDetail(null); onDetailClose?.(); };
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch]           = useState("");
  const [filterPhase, setFilterPhase] = useState<"all"|0|1|2|3>("all");
  const [filterToChuc, setFilterToChuc]       = useState("all");
  const [filterThamGia, setFilterThamGia]     = useState("all");
  const [filterType, setFilterType]           = useState("all");
  const [filterYear, setFilterYear]           = useState("all");

  const canCreate = user.role === "hội đồng" || user.role === "quản trị hệ thống" || user.role === "lãnh đạo cấp cao" || user.role === "lãnh đạo đơn vị";

  // unique values for dropdowns
  const donViToChucOpts = Array.from(new Set(campaigns.map(c => c.donViPhuTrach).filter(Boolean)));
  const donViThamGiaOpts = Array.from(new Set(campaigns.flatMap(c => c.participants.map(p => p.donVi)).filter(Boolean)));
  const typeOpts = Array.from(new Set(campaigns.map(c => c.type)));
  const yearOpts = Array.from(new Set(campaigns.map(c => c.ngayBatDau?.slice(0,4)).filter(Boolean)));

  const filtered = campaigns.filter(c => {
    const q = search.toLowerCase();
    const matchS = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    const matchP = filterPhase==="all" || STATE_CFG[c.state].phase === filterPhase;
    const matchToChuc = filterToChuc==="all" || c.donViPhuTrach === filterToChuc;
    const matchThamGia = filterThamGia==="all" || c.participants.some(p => p.donVi === filterThamGia);
    const matchType = filterType==="all" || c.type === filterType;
    const matchYear = filterYear==="all" || c.ngayBatDau?.startsWith(filterYear);
    return matchS && matchP && matchToChuc && matchThamGia && matchType && matchYear;
  });

  const hasFilter = filterToChuc!=="all"||filterThamGia!=="all"||filterType!=="all"||filterYear!=="all"||search;
  const clearFilters = () => { setSearch(""); setFilterToChuc("all"); setFilterThamGia("all"); setFilterType("all"); setFilterYear("all"); };

  const handleTransition = (id: string, newState: CampaignState) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== id) return c;
      const entry: AuditEntry = {
        id:`al-${Date.now()}`, action:nextStateLabel(c),
        actor:user.name||"Người dùng",
        role:{"cá nhân":"Người tham gia","lãnh đạo đơn vị":"Lãnh đạo đơn vị","hội đồng":"Thành viên HĐ","lãnh đạo cấp cao":"Lãnh đạo","quản trị hệ thống":"Quản trị"}[user.role]||"Người dùng",
        time:fmtDate("2026-04-23"),
        detail:`Chuyển trạng thái → ${STATE_CFG[newState].label}`,
        state:newState,
      };
      return { ...c, state:newState, auditLog:[...c.auditLog, entry] };
    }));
  };

  const handleCreate = (c: Campaign) => {
    setCampaigns(prev => [c, ...prev]);
    setShowCreate(false);
  };

  const handleAddParticipant = (campaignId: string, p: Participant) => {
    setCampaigns(prev => prev.map(c =>
      c.id === campaignId
        ? { ...c, participants: [...c.participants, p], joinedUnits: c.joinedUnits + 1 }
        : c
    ));
  };

  // If viewing detail, render full-screen
  if (detail) {
    const live = campaigns.find(c => c.id === detail.id) ?? detail;
    return (
      <CampaignDetailView
        c={live} user={user}
        onBack={closeDetail}
        onTransition={(id, ns) => handleTransition(id, ns)}
        onAddParticipant={handleAddParticipant}
      />
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background:"var(--color-paper)" }}>
      {/* Header — giống Phân tích Thi đua */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0] shrink-0" style={{ background:"white" }}>
        {/* Title row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background:"linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <Trophy className="size-5 text-[#8a6400]" />
          </div>
          <div>
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>Phong trào Thi đua</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DsButton variant="secondary" size="md"><Download className="size-4" />Báo cáo</DsButton>
            {canCreate && (
              <DsButton variant="primary" size="md" onClick={()=>setShowCreate(true)}>
                <Plus className="size-4" />Phát động phong trào
              </DsButton>
            )}
          </div>
        </div>

        {/* Phase tabs — pill style */}
        <div className="flex gap-1 mb-3">
          <button onClick={()=>setFilterPhase("all")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] transition-all"
            style={{ fontFamily: "var(--font-sans)", background:filterPhase==="all"?"#0b1426":"transparent",
              color:filterPhase==="all"?"white":"#5a5040", fontWeight:filterPhase==="all"?700:400 }}>
            Tất cả
            <span className="px-1.5 py-0.5 rounded text-[13px]"
              style={{ background:filterPhase==="all"?"white20":"#eef2f8", color:filterPhase==="all"?"white":"#635647" }}>
              {campaigns.length}
            </span>
          </button>
          {PHASES.map((p, i) => (
            <button key={i} onClick={()=>setFilterPhase(i as 0|1|2|3)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] transition-all"
              style={{ fontFamily: "var(--font-sans)", background:filterPhase===i?p.color:"transparent",
                color:filterPhase===i?"white":"#5a5040", fontWeight:filterPhase===i?700:400 }}>
              {p.label}
              <span className="px-1.5 py-0.5 rounded text-[13px]"
                style={{ background:filterPhase===i?"rgba(255,255,255,0.2)":"#eef2f8",
                  color:filterPhase===i?"white":"#635647" }}>
                {campaigns.filter(c=>STATE_CFG[c.state].phase===i).length}
              </span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="search-bar w-56" style={{ background:"white" }}>
            <Search className="size-3.5 text-[#635647] shrink-0" />
            <input className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[#b8b0a0]"
              style={{ fontFamily: "var(--font-sans)" }}
              placeholder="Tìm kiếm phong trào..."
              value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          {[
            { label:"Đơn vị tổ chức", val:filterToChuc, set:setFilterToChuc, opts:donViToChucOpts },
            { label:"Đơn vị tham gia", val:filterThamGia, set:setFilterThamGia, opts:donViThamGiaOpts },
            { label:"Cấp phong trào", val:filterType, set:setFilterType, opts:typeOpts.map(v=>({ value:v, label:TYPE_LABELS[v as CampaignType] })) },
            { label:"Năm", val:filterYear, set:setFilterYear, opts:yearOpts },
          ].map(f => (
            <select key={f.label} value={f.val} onChange={e=>f.set(e.target.value)}
              className="h-10 px-3 pr-7 rounded-[6px] border text-[13px] outline-none appearance-none"
              style={{ fontFamily: "var(--font-sans)", borderColor:"#d1d5db", background:"white",
                color:f.val!=="all"?"#1C5FBE":"#5a5040",
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a7a5c' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat:"no-repeat", backgroundPosition:"right 8px center" }}>
              <option value="all">{f.label}</option>
              {f.opts.map((o:any) => typeof o === "string"
                ? <option key={o} value={o}>{o}</option>
                : <option key={o.value} value={o.value}>{o.label}</option>
              )}
            </select>
          ))}
          {hasFilter && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 h-10 px-3 rounded-[6px] text-[13px] border transition-colors"
              style={{ fontFamily: "var(--font-sans)", borderColor:"#fca5a5", color:"#c8102e", background:"#fff1f2" }}>
              <X className="size-3.5" />Xóa bộ lọc
            </button>
          )}
          <span className="ml-auto text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            {filtered.length}/{campaigns.length} phong trào
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="size-16 rounded-full flex items-center justify-center" style={{ background:theme.tint }}>
              <Trophy className="size-7" style={{ color:theme.primary }} />
            </div>
            <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
              Không tìm thấy phong trào
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => (
              <CampaignCard key={c.id} c={c} user={user} onClick={() => openDetail(c)} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal onClose={()=>setShowCreate(false)} onCreate={handleCreate} user={user} />
      )}
    </div>
  );
}
