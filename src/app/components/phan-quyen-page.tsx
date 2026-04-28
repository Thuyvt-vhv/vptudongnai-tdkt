import { useState, useMemo } from "react";
import {
  ShieldCheck, ShieldAlert, Shield, Users, User, Gavel, Trophy,
  Crown, Settings, CheckCircle2, Eye, Minus, Lock, Unlock,
  ChevronRight, ChevronDown, Search, Plus, Edit2, Download,
  RefreshCw, UserPlus, X, Mail, Building2, Clock, AlertCircle,
  Info, FileText, Megaphone, FileSignature, ScrollText, BarChart2,
  Database, ClipboardCheck, Flag, Archive, MessageSquare,
  Check, ArrowRight, Hash, Star, Layers, BookOpen, Scale,
} from "lucide-react";
import { DsButton } from "./ds-button";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════════
   ROLE DEFINITIONS  (5 vai trò chuẩn)
═══════════════════════════════════════════════════════════════════ */
type RoleId = "admin" | "leader" | "council" | "manager" | "user";
type PermLevel = "full" | "own" | "view" | "cond" | "none";

interface RoleDef {
  id: RoleId;
  label: string;
  labelVi: string;
  desc: string;
  icon: typeof User;
  color: string;
  bg: string;
  border: string;
  gradient: string;
  count: number;
  level: number; // 0 = highest
  canBeAssignedBy: RoleId[];
  legalBasis: string;
}

const ROLE_DEFS: RoleDef[] = [
  {
    id: "admin",
    label: "Admin",
    labelVi: "Quản trị hệ thống",
    desc: "Toàn quyền cấu hình hệ thống, phân quyền người dùng, quản trị danh mục và kiểm tra bảo mật.",
    icon: Settings,
    color: "#0b1426",
    bg: "#e8ecf3",
    border: "#c5cdd9",
    gradient: "linear-gradient(135deg, #0b1426, #1a2744)",
    count: 2,
    level: 0,
    canBeAssignedBy: ["admin"],
    legalBasis: "Điều 8 NĐ 13/2023/NĐ-CP",
  },
  {
    id: "leader",
    label: "Leader",
    labelVi: "Lãnh đạo cấp cao",
    desc: "Phê duyệt phát động phong trào, ký số CA văn bản, ban hành quyết định khen thưởng cấp tỉnh.",
    icon: Crown,
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fcd34d",
    gradient: "linear-gradient(135deg, #92400e, #b45309)",
    count: 3,
    level: 1,
    canBeAssignedBy: ["admin"],
    legalBasis: "Điều 57 Luật TĐKT 2022",
  },
  {
    id: "council",
    label: "Council",
    labelVi: "Thành viên Hội đồng",
    desc: "Chấm điểm theo tiêu chí, biểu quyết tại phiên HĐ xét duyệt. Tự động kiêng kỵ hồ sơ đơn vị mình (COI).",
    icon: Gavel,
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    count: 7,
    level: 2,
    canBeAssignedBy: ["admin", "leader"],
    legalBasis: "Khoản 4 Điều 56 Luật TĐKT 2022",
  },
  {
    id: "manager",
    label: "Manager",
    labelVi: "Lãnh đạo đơn vị",
    desc: "Tạo và thẩm định hồ sơ đề nghị khen thưởng của đơn vị, tham gia lấy ý kiến, trình cấp trên.",
    icon: Users,
    color: "#166534",
    bg: "#dcfce7",
    border: "#86efac",
    gradient: "linear-gradient(135deg, #166534, #15803d)",
    count: 121,
    level: 3,
    canBeAssignedBy: ["admin", "leader"],
    legalBasis: "Khoản 2 Điều 55 Luật TĐKT 2022",
  },
  {
    id: "user",
    label: "User",
    labelVi: "Cá nhân / Tập thể tham gia",
    desc: "Đăng ký tham gia phong trào, nộp hồ sơ thi đua, gửi ý kiến công khai và theo dõi trạng thái hồ sơ.",
    icon: User,
    color: "#1C5FBE",
    bg: "#ddeafc",
    border: "#93c5fd",
    gradient: "linear-gradient(135deg, #1C5FBE, #1752a8)",
    count: 1450,
    level: 4,
    canBeAssignedBy: ["admin", "leader", "manager"],
    legalBasis: "Điều 12 Luật TĐKT 2022",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   PERMISSION MATRIX
═══════════════════════════════════════════════════════════════════ */
type ActionId = string;

interface PermAction {
  id: ActionId;
  label: string;
  legalNote?: string;
}

interface PermGroup {
  id: string;
  label: string;
  icon: typeof Flag;
  color: string;
  actions: PermAction[];
}

const PERM_GROUPS: PermGroup[] = [
  {
    id: "phong_trao", label: "Phong trào Thi đua", icon: Trophy, color: "#166534",
    actions: [
      { id: "pt_view",     label: "Xem danh sách phong trào" },
      { id: "pt_register", label: "Đăng ký tham gia", legalNote: "Điều 12" },
      { id: "pt_create",   label: "Tạo / soạn phong trào", legalNote: "Điều 18 Luật TĐKT" },
      { id: "pt_approve",  label: "Phê duyệt phát động", legalNote: "Điều 18" },
      { id: "pt_publish",  label: "Ban hành & Công bố", legalNote: "TT 15/2025" },
      { id: "pt_transit",  label: "Chuyển trạng thái workflow" },
    ],
  },
  {
    id: "lay_y_kien", label: "Lấy ý kiến công khai", icon: MessageSquare, color: "#1C5FBE",
    actions: [
      { id: "yk_view",    label: "Xem đợt lấy ý kiến" },
      { id: "yk_submit",  label: "Gửi ý kiến", legalNote: "Điều 17 Luật TĐKT" },
      { id: "yk_create",  label: "Tạo đợt lấy ý kiến", legalNote: "TT 15/2025" },
      { id: "yk_summary", label: "Tổng hợp biên bản", legalNote: "Khoản 3 Điều 8 TT 01" },
    ],
  },
  {
    id: "de_nghi", label: "Đề nghị Khen thưởng", icon: Star, color: "#b45309",
    actions: [
      { id: "dn_view",    label: "Xem hồ sơ đề nghị" },
      { id: "dn_create",  label: "Tạo hồ sơ đề nghị", legalNote: "Điều 45 Luật TĐKT" },
      { id: "dn_edit",    label: "Sửa hồ sơ (trước khi nộp)" },
      { id: "dn_submit",  label: "Nộp hồ sơ lên cấp trên" },
      { id: "dn_review",  label: "Thẩm định hồ sơ", legalNote: "Điều 55 Luật TĐKT" },
      { id: "dn_return",  label: "Trả lại / Yêu cầu bổ sung" },
    ],
  },
  {
    id: "hoi_dong", label: "Hội đồng Xét duyệt", icon: Gavel, color: "#7c3aed",
    actions: [
      { id: "hd_view",    label: "Xem phiên họp & điểm" },
      { id: "hd_score",   label: "Chấm điểm theo tiêu chí", legalNote: "NĐ 152/2025/NĐ-CP" },
      { id: "hd_vote",    label: "Biểu quyết thông qua", legalNote: "Điều 56 Luật TĐKT" },
      { id: "hd_chair",   label: "Chủ trì / Ban hành BB", legalNote: "Điều 56" },
    ],
  },
  {
    id: "ky_so", label: "Ký số & Phê duyệt", icon: FileSignature, color: "#9f1239",
    actions: [
      { id: "ks_view",    label: "Xem văn bản chờ ký" },
      { id: "ks_approve", label: "Phê duyệt qua workflow" },
      { id: "ks_sign",    label: "Ký số điện tử (CA)", legalNote: "Luật Giao dịch điện tử" },
    ],
  },
  {
    id: "quyet_dinh", label: "Quyết định Khen thưởng", icon: ScrollText, color: "#0f7a3e",
    actions: [
      { id: "qd_view",     label: "Xem quyết định" },
      { id: "qd_receive",  label: "Nhận QĐ (đơn vị mình)" },
      { id: "qd_generate", label: "Sinh quyết định tự động", legalNote: "TT 15/2025" },
      { id: "qd_issue",    label: "Ký ban hành QĐ chính thức", legalNote: "Điều 57 Luật TĐKT" },
    ],
  },
  {
    id: "bao_cao", label: "Báo cáo & Thống kê", icon: BarChart2, color: "#0e7490",
    actions: [
      { id: "bc_view_own", label: "Xem báo cáo đơn vị mình" },
      { id: "bc_view_all", label: "Xem tổng hợp toàn tỉnh" },
      { id: "bc_export",   label: "Xuất dữ liệu (PDF/Excel)" },
    ],
  },
  {
    id: "he_thong", label: "Hệ thống & Cấu hình", icon: Settings, color: "#374151",
    actions: [
      { id: "sys_users",   label: "Quản lý người dùng" },
      { id: "sys_roles",   label: "Phân quyền & vai trò" },
      { id: "sys_config",  label: "Cấu hình đơn vị", legalNote: "NĐ 152/2025/NĐ-CP" },
      { id: "sys_audit",   label: "Nhật ký hệ thống" },
      { id: "sys_backup",  label: "Sao lưu & Khôi phục" },
    ],
  },
];

// Permission matrix: role → action → level
const MATRIX: Record<RoleId, Record<ActionId, PermLevel>> = {
  admin: {
    pt_view:"full", pt_register:"full", pt_create:"full", pt_approve:"full", pt_publish:"full", pt_transit:"full",
    yk_view:"full", yk_submit:"full",  yk_create:"full",  yk_summary:"full",
    dn_view:"full", dn_create:"full",  dn_edit:"full",    dn_submit:"full", dn_review:"full", dn_return:"full",
    hd_view:"full", hd_score:"full",   hd_vote:"full",    hd_chair:"full",
    ks_view:"full", ks_approve:"full", ks_sign:"full",
    qd_view:"full", qd_receive:"full", qd_generate:"full", qd_issue:"full",
    bc_view_own:"full", bc_view_all:"full", bc_export:"full",
    sys_users:"full", sys_roles:"full", sys_config:"full", sys_audit:"full", sys_backup:"full",
  },
  leader: {
    pt_view:"full", pt_register:"none", pt_create:"view", pt_approve:"full", pt_publish:"full", pt_transit:"full",
    yk_view:"full", yk_submit:"full",   yk_create:"full",  yk_summary:"full",
    dn_view:"full", dn_create:"none",   dn_edit:"none",    dn_submit:"none", dn_review:"full", dn_return:"full",
    hd_view:"full", hd_score:"none",    hd_vote:"full",    hd_chair:"full",
    ks_view:"full", ks_approve:"full",  ks_sign:"full",
    qd_view:"full", qd_receive:"full",  qd_generate:"full", qd_issue:"full",
    bc_view_own:"full", bc_view_all:"full", bc_export:"full",
    sys_users:"view", sys_roles:"view", sys_config:"view", sys_audit:"view", sys_backup:"none",
  },
  council: {
    pt_view:"full",  pt_register:"none", pt_create:"none", pt_approve:"none", pt_publish:"none", pt_transit:"none",
    yk_view:"full",  yk_submit:"full",   yk_create:"none",  yk_summary:"view",
    dn_view:"full",  dn_create:"none",   dn_edit:"none",    dn_submit:"none", dn_review:"cond", dn_return:"cond",
    hd_view:"full",  hd_score:"cond",    hd_vote:"cond",    hd_chair:"none",
    ks_view:"view",  ks_approve:"none",  ks_sign:"none",
    qd_view:"view",  qd_receive:"none",  qd_generate:"none", qd_issue:"none",
    bc_view_own:"view", bc_view_all:"view", bc_export:"none",
    sys_users:"none", sys_roles:"none", sys_config:"none", sys_audit:"none", sys_backup:"none",
  },
  manager: {
    pt_view:"full",  pt_register:"full",  pt_create:"none", pt_approve:"none", pt_publish:"none", pt_transit:"none",
    yk_view:"full",  yk_submit:"full",    yk_create:"view",  yk_summary:"none",
    dn_view:"own",   dn_create:"full",    dn_edit:"own",     dn_submit:"full",  dn_review:"own",  dn_return:"own",
    hd_view:"view",  hd_score:"none",     hd_vote:"none",    hd_chair:"none",
    ks_view:"none",  ks_approve:"none",   ks_sign:"none",
    qd_view:"view",  qd_receive:"own",    qd_generate:"none", qd_issue:"none",
    bc_view_own:"full", bc_view_all:"none", bc_export:"own",
    sys_users:"none", sys_roles:"none", sys_config:"none", sys_audit:"none", sys_backup:"none",
  },
  user: {
    pt_view:"full",  pt_register:"full",  pt_create:"none", pt_approve:"none", pt_publish:"none", pt_transit:"none",
    yk_view:"view",  yk_submit:"full",    yk_create:"none",  yk_summary:"none",
    dn_view:"own",   dn_create:"own",     dn_edit:"own",     dn_submit:"own",   dn_review:"none", dn_return:"none",
    hd_view:"none",  hd_score:"none",     hd_vote:"none",    hd_chair:"none",
    ks_view:"none",  ks_approve:"none",   ks_sign:"none",
    qd_view:"own",   qd_receive:"own",    qd_generate:"none", qd_issue:"none",
    bc_view_own:"none", bc_view_all:"none", bc_export:"none",
    sys_users:"none", sys_roles:"none", sys_config:"none", sys_audit:"none", sys_backup:"none",
  },
};

/* ═══════════════════════════════════════════════════════════════════
   WORKFLOW STATE PERMISSIONS (which role triggers which transition)
═══════════════════════════════════════════════════════════════════ */
interface StatePermRow {
  state: string;
  label: string;
  color: string;
  bg: string;
  description: string;
  user: string;
  manager: string;
  council: string;
  leader: string;
  admin: string;
}

const STATE_PERMS: StatePermRow[] = [
  { state:"draft",            label:"Soạn thảo",           color:"#5a5040", bg:"#f0ece3", description:"Tạo và chỉnh sửa phong trào/hồ sơ", user:"–",         manager:"Tạo & sửa",  council:"–",          leader:"Xem",        admin:"Toàn quyền" },
  { state:"submitted",        label:"Trình phê duyệt",      color:"#0e7490", bg:"#e0f2fe", description:"Trình lên cấp có thẩm quyền",       user:"Nộp hồ sơ", manager:"Trình lên",  council:"–",          leader:"Xem",        admin:"Toàn quyền" },
  { state:"approved",         label:"Đã phê duyệt",         color:"#1C5FBE", bg:"#ddeafc", description:"Được cấp có thẩm quyền phê duyệt",   user:"Xem",       manager:"Xem",        council:"–",          leader:"✓ Phê duyệt",admin:"Toàn quyền" },
  { state:"published",        label:"Ban hành / Công bố",   color:"#4338ca", bg:"#e0e7ff", description:"Đã ban hành chính thức",             user:"Xem",       manager:"Xem",        council:"Xem",        leader:"✓ Ký ban hành",admin:"Toàn quyền" },
  { state:"active",           label:"Đang triển khai",       color:"#166534", bg:"#dcfce7", description:"Phong trào đang hoạt động",          user:"✓ Tham gia",manager:"✓ Quản lý",  council:"Xem",        leader:"Xem",        admin:"Toàn quyền" },
  { state:"submission_closed",label:"Đóng nộp hồ sơ",       color:"#b45309", bg:"#fef3c7", description:"Hết hạn tiếp nhận hồ sơ",           user:"Xem",       manager:"✓ Đóng nộp", council:"Xem",        leader:"Xem",        admin:"Toàn quyền" },
  { state:"unit_review",      label:"Thẩm định cơ sở",      color:"#c2410c", bg:"#fff7ed", description:"Thẩm định tại cấp cơ sở/đơn vị",    user:"Xem",       manager:"✓ Thẩm định",council:"Xem",        leader:"Xem",        admin:"Toàn quyền" },
  { state:"council_review",   label:"Hội đồng xét duyệt",   color:"#7c3aed", bg:"#f5f3ff", description:"HĐ TĐKT họp chấm điểm, biểu quyết", user:"–",         manager:"Xem kết quả",council:"✓ Chấm điểm\n✓ Biểu quyết\n⚠ COI", leader:"✓ Chủ trì", admin:"Toàn quyền" },
  { state:"final_approval",   label:"Trình lãnh đạo duyệt", color:"#9f1239", bg:"#fee2e2", description:"Trình ký lần cuối",                  user:"–",         manager:"Xem",        council:"–",          leader:"✓ Duyệt & ký",admin:"Toàn quyền" },
  { state:"decision_issued",  label:"Ban hành Quyết định",   color:"#0f7a3e", bg:"#d1fae5", description:"QĐ khen thưởng chính thức",          user:"Xem (nếu được KT)", manager:"✓ Nhận văn bản",council:"Xem", leader:"✓ Ký số CA",admin:"Toàn quyền" },
  { state:"public",           label:"Công bố kết quả",       color:"#0e7490", bg:"#cffafe", description:"Công khai trên cổng thông tin",       user:"Xem",       manager:"Xem",        council:"Xem",        leader:"✓ Công bố",  admin:"Toàn quyền" },
  { state:"archived",         label:"Lưu trữ",              color:"#374151", bg:"#f3f4f6", description:"Hồ sơ được lưu trữ theo quy định",   user:"Xem (hồ sơ mình)",manager:"Xem",   council:"–",          leader:"Xem",        admin:"Toàn quyền" },
];

/* ═══════════════════════════════════════════════════════════════════
   MOCK USERS
═══════════════════════════════════════════════════════════════════ */
interface AppUser {
  id: number; name: string; title: string;
  donVi: string; role: RoleId; status: "active"|"inactive";
  email: string; lastLogin: string;
}

const USERS: AppUser[] = [
  { id:1,  name:"Nguyễn Văn Thắng",      title:"Phó Chánh VP UBND Tỉnh",    donVi:"VP UBND Tỉnh",            role:"leader",  status:"active",   email:"nvthang@dongnai.gov.vn",  lastLogin:"23/04/2026 08:15" },
  { id:2,  name:"Nguyễn Văn Hùng",       title:"Chánh Văn phòng Tỉnh ủy",   donVi:"VP Tỉnh ủy",              role:"leader",  status:"active",   email:"nvhung@dongnai.gov.vn",   lastLogin:"22/04/2026 09:30" },
  { id:3,  name:"Trần Thị Mỹ Linh",      title:"Phó Chánh Văn phòng",       donVi:"VP Tỉnh ủy",              role:"leader",  status:"active",   email:"ttmlinh@dongnai.gov.vn",  lastLogin:"21/04/2026 14:10" },
  { id:4,  name:"Lê Hoàng Nam",           title:"Trưởng phòng TĐKT",         donVi:"Sở Nội vụ",               role:"council", status:"active",   email:"lhnam@dongnai.gov.vn",    lastLogin:"23/04/2026 07:55" },
  { id:5,  name:"Võ Minh Tuấn",           title:"Chuyên viên TĐKT (Thư ký)", donVi:"Sở Nội vụ",               role:"council", status:"active",   email:"vmtuan@dongnai.gov.vn",   lastLogin:"23/04/2026 08:10" },
  { id:6,  name:"Phạm Thu Hiền",          title:"Đại diện Sở GD&ĐT",         donVi:"Sở GD&ĐT",                role:"council", status:"active",   email:"pthien@soe.dongnai.gov.vn",lastLogin:"22/04/2026 10:20" },
  { id:7,  name:"Đại tá Trần Bình",       title:"Đại diện CA Tỉnh",          donVi:"Công an Tỉnh",            role:"council", status:"active",   email:"tbinh@cand.gov.vn",       lastLogin:"20/04/2026 08:00" },
  { id:8,  name:"Bùi Quang Minh",         title:"Đại diện Sở Y tế",          donVi:"Sở Y tế",                 role:"council", status:"active",   email:"bqminh@yt.dongnai.gov.vn",lastLogin:"19/04/2026 09:45" },
  { id:9,  name:"Trần Bá Thành",          title:"Lãnh đạo phụ trách TĐKT",   donVi:"Sở GD&ĐT",               role:"manager", status:"active",   email:"tbthanh@soe.dongnai.gov.vn",lastLogin:"15/04/2026 08:00" },
  { id:10, name:"Nguyễn Thị Kim Ngân",    title:"Phụ trách TĐKT",            donVi:"Sở Tài chính",            role:"manager", status:"active",   email:"ntkng@sotc.dongnai.gov.vn",lastLogin:"12/04/2026 14:55" },
  { id:11, name:"Lê Thị Thanh Xuân",      title:"Phó Giám đốc Sở",           donVi:"Sở GD&ĐT",               role:"user",    status:"active",   email:"ltxuan@soe.dongnai.gov.vn",lastLogin:"10/04/2026 08:30" },
  { id:12, name:"Nguyễn Phú Trọng Khoa",  title:"Bác sĩ CKI",                donVi:"BV Đa khoa Đồng Nai",     role:"user",    status:"active",   email:"nptkhoa@bvdk.dongnai.gov.vn",lastLogin:"08/04/2026 07:15" },
  { id:13, name:"Trần Quốc Bảo",          title:"Chuyên viên",               donVi:"Sở Nội vụ",               role:"council", status:"inactive", email:"tqbao@dongnai.gov.vn",    lastLogin:"01/04/2026 11:00" },
  { id:14, name:"Hệ thống",               title:"Quản trị viên",             donVi:"Trung tâm CNTT",          role:"admin",   status:"active",   email:"admin@dongnai.gov.vn",    lastLogin:"23/04/2026 00:01" },
  { id:15, name:"Lý Thị Lan",             title:"Đại diện LĐLĐ",             donVi:"Liên đoàn Lao động",      role:"council", status:"inactive", email:"ltlan@ld.dongnai.gov.vn", lastLogin:"18/04/2026 15:30" },
];

const AUDIT_LOG = [
  { id:1, time:"23/04 09:14", user:"Lê Hoàng Nam",    role:"Council", action:"assign",   detail:"Thêm Phạm Thu Hiền vào Hội đồng TĐKT – Phiên 2026/01" },
  { id:2, time:"22/04 16:40", user:"Nguyễn Văn Hùng", role:"Leader",  action:"delegate", detail:"Ủy quyền phê duyệt đề nghị KT → Lê Hoàng Nam (hết 30/06)" },
  { id:3, time:"21/04 10:05", user:"Nguyễn Văn Thắng", role:"Leader", action:"create",   detail:"Tạo tài khoản Manager: Nguyễn Thị Kim Ngân – Sở Tài chính" },
  { id:4, time:"20/04 15:33", user:"Admin",            role:"Admin",   action:"update",   detail:"Cập nhật quyền Council: Bổ sung thẩm định hồ sơ cấp tỉnh" },
  { id:5, time:"19/04 08:50", user:"Admin",            role:"Admin",   action:"security", detail:"Vô hiệu hoá tài khoản Trần Quốc Bảo – vắng >14 ngày" },
  { id:6, time:"18/04 11:20", user:"Trần Thị Mỹ Linh", role:"Leader", action:"delegate", detail:"Ủy quyền ký số QĐ tạm thời → Lê Hoàng Nam (hết 15/05)" },
  { id:7, time:"17/04 09:00", user:"Admin",            role:"Admin",   action:"create",   detail:"Import 45 tài khoản User từ danh sách hội nghị TĐKT" },
  { id:8, time:"16/04 13:44", user:"Admin",            role:"Admin",   action:"security", detail:"Reset MK Trần Quốc Bảo, gửi OTP qua email nội bộ" },
];

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */
const PERM_CFG: Record<PermLevel, {
  label: string; short: string;
  color: string; bg: string; border: string;
  icon: "full"|"own"|"view"|"cond"|"none";
}> = {
  full: { label:"Toàn quyền",      short:"●",  color:"#0f7a3e", bg:"#d1fae5", border:"#86efac", icon:"full" },
  own:  { label:"Dữ liệu của mình",short:"◐",  color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd", icon:"own"  },
  view: { label:"Chỉ xem",         short:"○",  color:"#0e7490", bg:"#cffafe", border:"#67e8f9", icon:"view" },
  cond: { label:"Có điều kiện",    short:"◑",  color:"#b45309", bg:"#fef3c7", border:"#fcd34d", icon:"cond" },
  none: { label:"Không có quyền",  short:"–",  color:"#d1d5db", bg:"#f9fafb", border:"#e5e7eb", icon:"none" },
};

function PermCell({ level, showLabel }: { level: PermLevel; showLabel?: boolean }) {
  const cfg = PERM_CFG[level];
  return (
    <div className="flex flex-col items-center gap-0.5">
      {level === "full" && (
        <div className="size-6 rounded-full flex items-center justify-center"
          style={{ background:"#d1fae5" }}>
          <CheckCircle2 className="size-3.5 text-[#0f7a3e]" />
        </div>
      )}
      {level === "own" && (
        <div className="size-6 rounded-full flex items-center justify-center border-2"
          style={{ background:"#ddeafc", borderColor:"#1C5FBE" }}>
          <User className="size-2.5 text-[#1C5FBE]" />
        </div>
      )}
      {level === "view" && (
        <div className="size-6 rounded-full flex items-center justify-center"
          style={{ background:"#cffafe" }}>
          <Eye className="size-3 text-[#0e7490]" />
        </div>
      )}
      {level === "cond" && (
        <div className="size-6 rounded-full flex items-center justify-center border-2 border-dashed"
          style={{ background:"#fef9c3", borderColor:"#b45309" }}>
          <AlertCircle className="size-3 text-[#b45309]" />
        </div>
      )}
      {level === "none" && (
        <div className="size-6 rounded-full flex items-center justify-center"
          style={{ background:"#f3f4f6" }}>
          <Minus className="size-3 text-[#d1d5db]" />
        </div>
      )}
      {showLabel && (
        <span className="text-[13px] leading-tight text-center"
          style={{ color:cfg.color, fontFamily: "var(--font-sans)", fontWeight:500, maxWidth:52 }}>
          {cfg.label}
        </span>
      )}
    </div>
  );
}

function RoleTag({ roleId, size="md" }: { roleId: RoleId; size?: "sm"|"md" }) {
  const r = ROLE_DEFS.find(x => x.id === roleId)!;
  const Icon = r.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded border ${size==="sm"?"px-1.5 py-0.5 text-[13px]":"px-2 py-0.5 text-[13px]"}`}
      style={{ color:r.color, background:r.bg, borderColor:r.border,
        fontFamily: "var(--font-sans)", fontWeight:500 }}>
      <Icon className={size==="sm"?"size-2.5":"size-3"} />
      {r.labelVi}
    </span>
  );
}

function AuditActionBadge({ type }: { type: string }) {
  const map: Record<string,{label:string;color:string;bg:string}> = {
    assign:   {label:"Phân vai trò", color:"#7c3aed", bg:"#f5f3ff"},
    delegate: {label:"Ủy quyền",     color:"#0f7a3e", bg:"#d1fae5"},
    create:   {label:"Tạo mới",      color:"#b45309", bg:"#fef3c7"},
    update:   {label:"Cập nhật",     color:"#0e7490", bg:"#cffafe"},
    security: {label:"Bảo mật",      color:"#9f1239", bg:"#fee2e2"},
    revoke:   {label:"Thu hồi",      color:"#c8102e", bg:"#fee2e2"},
  };
  const s = map[type] || map.update;
  return (
    <span className="text-[13px] px-2 py-0.5 rounded border"
      style={{ color:s.color, background:s.bg, borderColor:s.color+"40",
        fontFamily: "var(--font-sans)", fontWeight:600 }}>
      {s.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROLE CARDS
═══════════════════════════════════════════════════════════════════ */
function RoleCard({ role, active, onClick }: { role: RoleDef; active: boolean; onClick: () => void }) {
  const { theme } = useTheme();
  const Icon = role.icon;
  const fullCount   = Object.values(MATRIX[role.id]).filter(v => v === "full").length;
  const ownCount    = Object.values(MATRIX[role.id]).filter(v => v === "own").length;
  const condCount   = Object.values(MATRIX[role.id]).filter(v => v === "cond").length;
  const totalActions= Object.keys(MATRIX[role.id]).length;

  return (
    <button onClick={onClick}
      className="text-left rounded-[12px] border-2 overflow-hidden transition-all duration-200 hover:shadow-lg"
      style={{
        borderColor: active ? role.color : "var(--color-line)",
        background: active ? role.bg : "#fff",
        transform: active ? "translateY(-2px)" : "none",
        boxShadow: active ? `0 8px 24px ${role.color}25` : "none",
      }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-start gap-3"
        style={{ background: active ? role.gradient : "var(--color-paper)" }}>
        <div className="size-10 rounded-[8px] flex items-center justify-center shrink-0"
          style={{ background: active ? "rgba(255,255,255,0.2)" : role.bg,
            border: `1px solid ${active ? "rgba(255,255,255,0.3)" : role.border}` }}>
          <Icon className="size-5" style={{ color: active ? "#fff" : role.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[13px] uppercase tracking-widest"
              style={{ color: active ? "rgba(255,255,255,0.7)" : "#635647",
                fontFamily: "var(--font-sans)", fontWeight:600 }}>
              {role.label}
            </span>
            <span className="text-[13px] px-1.5 py-0.5 rounded-full"
              style={{ background: active ? "rgba(255,255,255,0.2)" : role.bg,
                color: active ? "#fff" : role.color, fontFamily: "var(--font-sans)" }}>
              Cấp {role.level + 1}
            </span>
          </div>
          <div className="text-[13px] leading-snug"
            style={{ fontFamily: "var(--font-sans)", fontWeight:700,
              color: active ? "#fff" : "#0b1426" }}>
            {role.labelVi}
          </div>
        </div>
        {/* Count badge */}
        <div className="shrink-0 text-right">
          <div className="text-[18px]"
            style={{ fontFamily: "var(--font-sans)", fontWeight:700,
              color: active ? "#fff" : role.color }}>
            {role.count.toLocaleString()}
          </div>
          <div className="text-[13px]"
            style={{ color: active ? "rgba(255,255,255,0.6)" : "#635647",
              fontFamily: "var(--font-sans)" }}>
            người dùng
          </div>
        </div>
      </div>

      {/* Permission summary */}
      <div className="px-4 py-3 border-t" style={{ borderColor:"var(--color-line)" }}>
        <div className="flex items-center gap-3 mb-2">
          {[
            { label:"Toàn quyền", v:fullCount, color:"#0f7a3e", bg:"#d1fae5" },
            { label:"Giới hạn",   v:ownCount+condCount, color:"#1C5FBE", bg:"#ddeafc" },
            { label:"Không có",   v:totalActions-fullCount-ownCount-condCount-Object.values(MATRIX[role.id]).filter(v=>v==="view").length, color:"#4f5d6e", bg:"#f3f4f6" },
          ].map(s => (
            <div key={s.label} className="flex-1 text-center">
              <div className="text-[14px]"
                style={{ fontFamily: "var(--font-sans)", fontWeight:700, color:s.color }}>{s.v}</div>
              <div className="text-[13px]" style={{ color:s.color, fontFamily: "var(--font-sans)" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
          <div style={{ width:`${(fullCount/totalActions)*100}%`, background:"#16a34a" }} />
          <div style={{ width:`${((ownCount+condCount)/totalActions)*100}%`, background:"#3b82f6" }} />
          <div style={{ width:`${(Object.values(MATRIX[role.id]).filter(v=>v==="view").length/totalActions)*100}%`, background:"#0e7490" }} />
          <div className="flex-1" style={{ background:"#f0ece3" }} />
        </div>
        <div className="mt-2 flex items-center gap-1 text-[13px]" style={{ color:"#635647", fontFamily: "var(--font-sans)" }}>
          <BookOpen className="size-2.5 shrink-0" />
          <span className="truncate">{role.legalBasis}</span>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PERMISSION MATRIX TAB
═══════════════════════════════════════════════════════════════════ */
function PermissionMatrix({ focusRole }: { focusRole: RoleId | null }) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState<string[]>(["phong_trao","de_nghi"]);
  const [hoverCell, setHoverCell] = useState<{row:string;role:RoleId}|null>(null);

  const roles = ROLE_DEFS;

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 p-3 rounded-[8px] bg-[#faf7f2] border"
        style={{ borderColor:"var(--color-line)" }}>
        <span className="text-[13px] uppercase tracking-wide text-[#635647]"
          style={{ fontFamily: "var(--font-sans)" }}>Chú thích:</span>
        {Object.entries(PERM_CFG).map(([k, cfg]) => (
          <div key={k} className="flex items-center gap-1.5">
            <PermCell level={k as PermLevel} />
            <span className="text-[13px] text-[#4a5568]" style={{ fontFamily: "var(--font-sans)" }}>
              {cfg.label}
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1 text-[13px] text-[#1C5FBE]"
          style={{ fontFamily: "var(--font-sans)" }}>
          <AlertCircle className="size-3 text-[#b45309]" />
          ◑ = Phụ thuộc COI/trạng thái hồ sơ
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
        {/* Header row */}
        <div className="grid border-b"
          style={{ gridTemplateColumns:"260px repeat(5, 1fr)", borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
          <div className="px-4 py-3 text-[13px] uppercase tracking-wide text-[#635647]"
            style={{ fontFamily: "var(--font-sans)" }}>Tính năng / Hành động</div>
          {roles.map(r => {
            const Icon = r.icon;
            const isFocus = focusRole === r.id;
            return (
              <div key={r.id} className="px-2 py-3 flex flex-col items-center gap-1 border-l"
                style={{ borderColor:"var(--color-line)",
                  background: isFocus ? r.bg : "transparent" }}>
                <div className="size-7 rounded-full flex items-center justify-center"
                  style={{ background: isFocus ? r.color : r.bg }}>
                  <Icon className="size-3.5" style={{ color: isFocus ? "#fff" : r.color }} />
                </div>
                <div className="text-[13px] text-center leading-tight"
                  style={{ color:isFocus?r.color:"#5a5040", fontFamily: "var(--font-sans)",
                    fontWeight:isFocus?700:500 }}>
                  {r.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Groups */}
        {PERM_GROUPS.map(group => {
          const Icon   = group.icon;
          const isOpen = expanded.includes(group.id);
          return (
            <div key={group.id} className="border-b last:border-0" style={{ borderColor:"var(--color-line)" }}>
              {/* Group header */}
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#faf7f2] transition-colors"
                onClick={() => setExpanded(p => isOpen ? p.filter(x=>x!==group.id) : [...p, group.id])}>
                <div className="size-6 rounded-[4px] flex items-center justify-center shrink-0"
                  style={{ background:group.color+"15" }}>
                  <Icon className="size-3.5" style={{ color:group.color }} />
                </div>
                <span className="text-[13px] text-[#0b1426] flex-1 text-left"
                  style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{group.label}</span>
                <div className="flex items-center gap-2 mr-2">
                  {roles.map(r => {
                    const actions = group.actions.map(a => MATRIX[r.id][a.id]);
                    const hasFull = actions.some(v => v === "full");
                    const hasAny  = actions.some(v => v !== "none");
                    return (
                      <div key={r.id} className="size-3 rounded-full"
                        style={{ background: hasFull ? r.color : hasAny ? r.color+"60" : "#e5e7eb" }}
                        title={r.labelVi} />
                    );
                  })}
                </div>
                {isOpen ? <ChevronDown className="size-3.5 text-[#635647]" /> : <ChevronRight className="size-3.5 text-[#635647]" />}
              </button>

              {/* Actions */}
              {isOpen && group.actions.map((action, ai) => (
                <div key={action.id}
                  className="grid border-t"
                  style={{ gridTemplateColumns:"260px repeat(5, 1fr)",
                    borderColor:"var(--color-line)",
                    background: ai % 2 === 0 ? "#fff" : "#faf7f2" }}>
                  <div className="px-4 py-2.5 pl-10 flex items-center gap-2">
                    <div className="size-1 rounded-full shrink-0" style={{ background:group.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-[#0b1426]"
                        style={{ fontFamily: "var(--font-sans)" }}>{action.label}</div>
                      {action.legalNote && (
                        <div className="text-[13px] text-[#635647] flex items-center gap-1"
                          style={{ fontFamily: "var(--font-sans)" }}>
                          <BookOpen className="size-2.5" />{action.legalNote}
                        </div>
                      )}
                    </div>
                  </div>
                  {roles.map(r => {
                    const level = MATRIX[r.id][action.id];
                    const isFocus = focusRole === r.id;
                    const isHover = hoverCell?.row === action.id && hoverCell?.role === r.id;
                    return (
                      <div key={r.id}
                        className="flex items-center justify-center border-l py-2 transition-colors"
                        style={{ borderColor:"var(--color-line)",
                          background: isHover ? r.bg : isFocus && level !== "none" ? r.bg+"80" : "transparent" }}
                        onMouseEnter={() => setHoverCell({row:action.id, role:r.id})}
                        onMouseLeave={() => setHoverCell(null)}>
                        <PermCell level={level} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WORKFLOW STATE PERMISSIONS TAB
═══════════════════════════════════════════════════════════════════ */
function WorkflowPermissions() {
  const { theme } = useTheme();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-[8px] bg-[#ddeafc] border border-[#1C5FBE30]">
        <Info className="size-4 text-[#1C5FBE] shrink-0" />
        <p className="text-[13px] text-[#1a4fa0]" style={{ fontFamily: "var(--font-sans)" }}>
          Mỗi trạng thái trong workflow chỉ cho phép một số vai trò nhất định thực hiện hành động.
          Điều này đảm bảo đúng nguyên tắc phân quyền theo từng giai đoạn xử lý hồ sơ.
        </p>
      </div>

      <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
        {/* Header */}
        <div className="grid border-b"
          style={{ gridTemplateColumns:"180px 1fr repeat(5, 1fr)", borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
          <div className="px-4 py-3 text-[13px] uppercase tracking-wide text-[#635647]"
            style={{ fontFamily: "var(--font-sans)" }}>Trạng thái</div>
          <div className="px-3 py-3 text-[13px] uppercase tracking-wide text-[#635647] border-l"
            style={{ borderColor:"var(--color-line)", fontFamily: "var(--font-sans)" }}>Mô tả</div>
          {ROLE_DEFS.map(r => {
            const Icon = r.icon;
            return (
              <div key={r.id} className="py-3 flex flex-col items-center gap-1 border-l"
                style={{ borderColor:"var(--color-line)" }}>
                <div className="size-6 rounded-full flex items-center justify-center"
                  style={{ background:r.bg }}>
                  <Icon className="size-3" style={{ color:r.color }} />
                </div>
                <span className="text-[13px] text-center"
                  style={{ color:r.color, fontFamily: "var(--font-sans)", fontWeight:600 }}>
                  {r.label}
                </span>
              </div>
            );
          })}
        </div>

        {STATE_PERMS.map((row, i) => (
          <div key={row.state}
            className="grid border-b last:border-0 hover:bg-[#faf7f2] transition-colors"
            style={{ gridTemplateColumns:"180px 1fr repeat(5, 1fr)",
              borderColor:"var(--color-line)",
              background: i%2===0?"#fff":"#fafafa" }}>
            <div className="px-3 py-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] border"
                style={{ color:row.color, background:row.bg, borderColor:row.color+"40",
                  fontFamily: "var(--font-sans)", fontWeight:500 }}>
                {row.label}
              </span>
            </div>
            <div className="px-3 py-3 border-l text-[13px] text-[#635647]"
              style={{ borderColor:"var(--color-line)", fontFamily: "var(--font-sans)" }}>
              {row.description}
            </div>
            {([row.user, row.manager, row.council, row.leader, row.admin] as string[]).map((cell, ci) => {
              const r = ROLE_DEFS[ci];
              const isAction = cell.startsWith("✓");
              const isCond   = cell.startsWith("⚠");
              const isNone   = cell === "–";
              return (
                <div key={ci} className="px-2 py-2.5 border-l flex items-start justify-center"
                  style={{ borderColor:"var(--color-line)" }}>
                  <div className="text-[13px] text-center leading-tight whitespace-pre-line"
                    style={{
                      color: isAction ? r.color : isCond ? "#b45309" : "#d1d5db",
                      fontFamily: "var(--font-sans)",
                      fontWeight: isAction || isCond ? 600 : 400,
                    }}>
                    {cell}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   USER MANAGEMENT TAB
═══════════════════════════════════════════════════════════════════ */
function UserManagement({ focusRole }: { focusRole: RoleId | null }) {
  const { theme } = useTheme();
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleId | "all">(focusRole ?? "all");
  const [showModal, setShowModal] = useState(false);

  const filtered = USERS.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.donVi.toLowerCase().includes(q);
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="search-bar w-64">
          <Search className="size-3.5 text-[#635647] shrink-0" />
          <input className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[#b8b0a0]"
            style={{ fontFamily: "var(--font-sans)" }}
            placeholder="Tìm người dùng, đơn vị..."
            value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {/* Role filter */}
        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={()=>setRoleFilter("all")}
            className="px-3 h-8 rounded-[6px] text-[13px] border transition-all"
            style={{ borderColor:roleFilter==="all"?"#0b1426":"var(--color-line)",
              background:roleFilter==="all"?"#0b1426":"#fff",
              color:roleFilter==="all"?"#fff":"#4a5568",
              fontFamily: "var(--font-sans)" }}>
            Tất cả ({USERS.length})
          </button>
          {ROLE_DEFS.map(r => {
            const Icon = r.icon;
            const count = USERS.filter(u=>u.role===r.id).length;
            return (
              <button key={r.id} onClick={()=>setRoleFilter(r.id)}
                className="flex items-center gap-1.5 px-3 h-8 rounded-[6px] border text-[13px] transition-all"
                style={{ borderColor:roleFilter===r.id?r.color:r.border,
                  background:roleFilter===r.id?r.bg:"#fff",
                  color:roleFilter===r.id?r.color:"#4a5568",
                  fontFamily: "var(--font-sans)", fontWeight:roleFilter===r.id?600:400 }}>
                <Icon className="size-3" style={{ color:roleFilter===r.id?r.color:"#635647" }} />
                {r.label}
                <span className="size-4 rounded-full flex items-center justify-center text-[13px]"
                  style={{ background:r.bg, color:r.color }}>{count}</span>
              </button>
            );
          })}
        </div>
        <DsButton variant="primary" size="md" className="ml-auto" onClick={()=>setShowModal(true)}>
          <UserPlus className="size-4" />Thêm người dùng
        </DsButton>
      </div>

      {/* Table */}
      <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:"var(--color-paper)" }}>
              {["Người dùng","Chức vụ","Đơn vị","Vai trò","Trạng thái","Đăng nhập gần nhất",""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[13px] uppercase tracking-wide text-[#635647] border-b"
                  style={{ borderColor:"var(--color-line)", fontFamily: "var(--font-sans)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const role = ROLE_DEFS.find(r => r.id === u.role)!;
              const Icon = role.icon;
              const initials = u.name === "Hệ thống" ? "HT"
                : u.name.split(" ").slice(-2).map(w=>w[0]).join("");
              return (
                <tr key={u.id} className="border-b hover:bg-[#faf7f2] transition-colors last:border-0"
                  style={{ borderColor:"var(--color-line)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full flex items-center justify-center shrink-0 text-[13px] text-white"
                        style={{ background:u.status==="inactive"?"#4f5d6e":role.color,
                          fontFamily: "var(--font-sans)", fontWeight:700 }}>
                        {initials}
                      </div>
                      <div>
                        <div className="text-[13px] text-[#0b1426]"
                          style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>{u.name}</div>
                        <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#4a5568]"
                    style={{ fontFamily: "var(--font-sans)" }}>{u.title}</td>
                  <td className="px-4 py-3 text-[13px] text-[#4a5568]"
                    style={{ fontFamily: "var(--font-sans)" }}>{u.donVi}</td>
                  <td className="px-4 py-3">
                    <RoleTag roleId={u.role} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] px-2 py-0.5 rounded-full border`}
                      style={{
                        color: u.status==="active"?"#166534":"#c8102e",
                        background: u.status==="active"?"#dcfce7":"#fee2e2",
                        borderColor: u.status==="active"?"#86efac":"#fca5a5",
                        fontFamily: "var(--font-sans)", fontWeight:500,
                      }}>
                      {u.status==="active" ? "Hoạt động" : "Đã vô hiệu"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#635647]"
                    style={{ fontFamily: "var(--font-sans)" }}>{u.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="btn-icon size-7 rounded"><Edit2 className="size-3.5" /></button>
                      {u.status==="active"
                        ? <button className="btn-icon size-7 rounded"><Lock className="size-3.5 text-[#c8102e]" /></button>
                        : <button className="btn-icon size-7 rounded"><Unlock className="size-3.5 text-[#0f7a3e]" /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AUDIT LOG TAB
═══════════════════════════════════════════════════════════════════ */
function AuditLog() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-[8px] bg-[#ddeafc] border border-[#1C5FBE30]">
        <ShieldCheck className="size-4 text-[#1C5FBE] shrink-0" />
        <p className="text-[13px] text-[#1a4fa0]" style={{ fontFamily: "var(--font-sans)" }}>
          Toàn bộ thay đổi phân quyền được ghi nhận và lưu trữ — tuân thủ NĐ 13/2023/NĐ-CP và NĐ 30/2020/NĐ-CP.
        </p>
      </div>
      <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
        {AUDIT_LOG.map((e, i) => {
          const roleDef = ROLE_DEFS.find(r => r.labelVi.includes(e.role) || r.label === e.role);
          return (
            <div key={e.id} className="flex items-start gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-[#faf7f2]"
              style={{ borderColor:"var(--color-line)", background:i%2===0?"#fff":"#fafafa" }}>
              <div className="size-8 rounded-full flex items-center justify-center shrink-0 text-[13px] text-white"
                style={{ background:roleDef?.color??"#635647", fontFamily: "var(--font-sans)", fontWeight:700 }}>
                {e.user === "Admin" ? "AD" : e.user.split(" ").slice(-2).map(w=>w[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[13px] text-[#0b1426]"
                    style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{e.user}</span>
                  {roleDef && <RoleTag roleId={roleDef.id} size="sm" />}
                  <AuditActionBadge type={e.action} />
                </div>
                <p className="text-[13px] text-[#4a5568]" style={{ fontFamily: "var(--font-sans)" }}>
                  {e.detail}
                </p>
              </div>
              <div className="shrink-0 text-[13px] text-[#635647]"
                style={{ fontFamily: "var(--font-sans)" }}>{e.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export function PhanQuyenPage() {
  const { theme } = useTheme();
  const [activeRole, setActiveRole] = useState<RoleId | null>(null);
  const [tab, setTab] = useState<"matrix"|"workflow"|"users"|"audit">("matrix");

  const TABS = [
    { key:"matrix"   as const, label:"Ma trận quyền",          icon:Layers },
    { key:"workflow" as const, label:"Quyền theo workflow",     icon:Flag },
    { key:"users"    as const, label:`Người dùng (${USERS.length})`, icon:Users },
    { key:"audit"    as const, label:"Nhật ký thay đổi",        icon:FileText },
  ];

  const totalUsers = ROLE_DEFS.reduce((s, r) => s + r.count, 0);

  return (
    <div className="h-full flex flex-col" style={{ background:"var(--color-paper)" }}>

      {/* ── Header ── */}
      <div className="px-8 pt-6 pb-5 border-b" style={{ borderColor:"var(--color-line)" }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="size-8 rounded-[6px] flex items-center justify-center"
                style={{ background:theme.tint }}>
                <ShieldCheck className="size-4" style={{ color:theme.primary }} />
              </div>
              <h1 className="text-[18px] text-[#0b1426]"
                style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
                Phân quyền Hệ thống
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[13px] bg-[#ddeafc] text-[#1a4fa0] border border-[#1C5FBE30]"
                style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>
                <Scale className="size-3" />5 vai trò · RBAC
              </span>
            </div>
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              Quản lý 5 vai trò chuẩn — {totalUsers.toLocaleString()} người dùng — theo Luật TĐKT 2022 & NĐ 13/2023
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DsButton variant="secondary" size="md">
              <Download className="size-4" />Xuất chính sách
            </DsButton>
            <DsButton variant="secondary" size="md">
              <RefreshCw className="size-4" />Đồng bộ AD
            </DsButton>
          </div>
        </div>

        {/* ── 5 Role Cards ── */}
        <div className="grid grid-cols-5 gap-3">
          {ROLE_DEFS.map(r => (
            <RoleCard
              key={r.id} role={r}
              active={activeRole === r.id}
              onClick={() => setActiveRole(activeRole === r.id ? null : r.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Hierarchy diagram strip ── */}
      <div className="px-8 py-4 border-b flex items-center gap-0"
        style={{ borderColor:"var(--color-line)", background:"white" }}>
        <div className="flex items-center gap-2 text-[13px] text-[#635647]"
          style={{ fontFamily: "var(--font-sans)" }}>
          <Shield className="size-3.5 text-[#635647]" />
          Cấu trúc phân cấp:
        </div>
        {ROLE_DEFS.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={r.id} className="flex items-center">
              {i > 0 && <ArrowRight className="size-3 text-[#d1d5db] mx-2" />}
              <button
                onClick={() => setActiveRole(activeRole === r.id ? null : r.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[13px] transition-all"
                style={{
                  color: activeRole === r.id ? r.color : "#5a5040",
                  background: activeRole === r.id ? r.bg : "#faf7f2",
                  borderColor: activeRole === r.id ? r.border : "var(--color-line)",
                  fontFamily: "var(--font-sans)", fontWeight: activeRole === r.id ? 600 : 400,
                }}>
                <Icon className="size-3" style={{ color: activeRole === r.id ? r.color : "#635647" }} />
                {r.labelVi}
                <span className="size-4 rounded-full flex items-center justify-center text-[13px]"
                  style={{ background:r.bg, color:r.color }}>
                  {r.count > 999 ? `${Math.round(r.count/100)/10}k` : r.count}
                </span>
              </button>
            </div>
          );
        })}
        {activeRole && (
          <button
            className="ml-4 flex items-center gap-1 text-[13px] text-[#635647] hover:text-[#c8102e] transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
            onClick={() => setActiveRole(null)}>
            <X className="size-3" />Bỏ lọc
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-0 border-b px-8"
        style={{ borderColor:"var(--color-line)", background:"white" }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={()=>setTab(t.key)}
              className="flex items-center gap-2 px-5 py-3.5 text-[13px] border-b-2 transition-all"
              style={{
                fontFamily: "var(--font-sans)",
                borderBottomColor: tab===t.key ? theme.primary : "transparent",
                color: tab===t.key ? theme.primary : "#635647",
                fontWeight: tab===t.key ? 600 : 400,
                background:"transparent",
              }}>
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {tab === "matrix"   && <PermissionMatrix focusRole={activeRole} />}
        {tab === "workflow" && <WorkflowPermissions />}
        {tab === "users"    && <UserManagement focusRole={activeRole} />}
        {tab === "audit"    && <AuditLog />}
      </div>
    </div>
  );
}


