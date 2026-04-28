import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, ChevronRight, FileText, Users, Clock, CheckCircle2,
  XCircle, AlertCircle, FileSignature, CheckCheck, Send, Eye,
  RotateCcw, Filter, Download, X, Upload, Star,
  FilePen, CalendarDays, Building2, User, Sparkles,
  MessageSquare, ChevronDown, Check
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ─── Types ─────────────────────────────────────────────────────── */
type NomStatus =
  | "nhap" | "cho_duyet" | "da_gui_phong" | "dang_tham_dinh"
  | "yeu_cau_bo_sung" | "cho_binh_xet" | "da_binh_xet"
  | "cho_ky_so" | "hoan_thanh" | "tu_choi";

interface NomComment {
  by: string; role: string; text: string; time: string;
}
interface Nomination {
  id: string; code: string; type: "ca_nhan" | "tap_the";
  subject: string; position?: string; unit: string;
  awardType: string; awardLevel: string;
  achievements: string; status: NomStatus;
  submittedBy: string; submittedById: number;
  submittedDate: string; updatedDate: string;
  documents: string[]; comments: NomComment[]; urgent: boolean;
  handler?: string;
}

/* ─── Status config ──────────────────────────────────────────────── */
const SC: Record<NomStatus, { label: string; color: string; bg: string; dot: string }> = {
  nhap:            { label: "Bản nháp",           color: "#5a5040", bg: "#eef2f8", dot: "#635647" },
  cho_duyet:       { label: "Chờ đơn vị duyệt",   color: "#0e7490", bg: "#e0f2fe", dot: "#0891b2" },
  da_gui_phong:    { label: "Đã gửi Phòng TĐKT",  color: "#4338ca", bg: "#e0e7ff", dot: "#4f46e5" },
  dang_tham_dinh:  { label: "Đang thẩm định",      color: "#b45309", bg: "#fef3c7", dot: "#b45309" },
  yeu_cau_bo_sung: { label: "Yêu cầu bổ sung",     color: "#c2410c", bg: "#fff7ed", dot: "#ea580c" },
  cho_binh_xet:    { label: "Chờ bình xét HĐ",    color: "#7c3aed", bg: "#f5f3ff", dot: "#8b5cf6" },
  da_binh_xet:     { label: "Đã bình xét",          color: "#047857", bg: "#d1fae5", dot: "#059669" },
  cho_ky_so:       { label: "Chờ ký số",            color: "#92400e", bg: "#fef3c7", dot: "#b45309" },
  hoan_thanh:      { label: "Hoàn thành",           color: "#166534", bg: "#dcfce7", dot: "#16a34a" },
  tu_choi:         { label: "Không được duyệt",     color: "#9f1239", bg: "#fee2e2", dot: "#e11d48" },
};

/* ─── SLA config (max days per status before overdue) ───────────── */
const SLA_DAYS: Partial<Record<NomStatus, number>> = {
  da_gui_phong: 3, dang_tham_dinh: 15, yeu_cau_bo_sung: 7,
  cho_binh_xet: 10, da_binh_xet: 5, cho_ky_so: 3,
};

function calcSla(nom: Nomination): { label: string; color: string; bg: string; days: number } | null {
  const limit = SLA_DAYS[nom.status];
  if (!limit) return null;
  const updated = new Date(nom.updatedDate);
  const today = new Date("2026-04-25");
  const elapsed = Math.floor((today.getTime() - updated.getTime()) / 86400000);
  const remaining = limit - elapsed;
  if (remaining < 0)
    return { label: `Quá hạn ${-remaining} ngày`, color: "#9f1239", bg: "#fee2e2", days: remaining };
  if (remaining <= Math.ceil(limit * 0.3))
    return { label: `Còn ${remaining} ngày`, color: "#92400e", bg: "#fef3c7", days: remaining };
  return { label: `Còn ${remaining} ngày`, color: "#166534", bg: "#dcfce7", days: remaining };
}

const AWARD_TYPES = [
  "Huân chương Lao động hạng Nhất", "Huân chương Lao động hạng Nhì",
  "Huân chương Lao động hạng Ba", "Bằng khen Thủ tướng Chính phủ",
  "Bằng khen Bộ/Ban/Ngành TW", "Bằng khen Chủ tịch UBND Tỉnh",
  "Chiến sĩ thi đua Toàn quốc", "Chiến sĩ thi đua cấp Bộ",
  "Chiến sĩ thi đua cấp Tỉnh", "Cờ thi đua Chính phủ",
  "Cờ thi đua UBND Tỉnh", "Giấy khen",
];

/* ─── Mock data ──────────────────────────────────────────────────── */
const initNominations: Nomination[] = [
  { id:"1", code:"TĐKT-2026-047", type:"ca_nhan", subject:"Lê Thị Thanh Xuân", position:"Phó Giám đốc", unit:"Sở Giáo dục & Đào tạo", awardType:"Bằng khen Chủ tịch UBND Tỉnh", awardLevel:"Cấp tỉnh", achievements:"Xuất sắc trong công tác quản lý, phát triển giáo dục toàn diện; hoàn thành 100% chỉ tiêu năm học 2025–2026.", status:"cho_ky_so", submittedBy:"Trần Bá Thành", submittedById:9, submittedDate:"2026-03-15", updatedDate:"2026-04-18", documents:["Tờ trình số 45.pdf","Báo cáo thành tích LTXN.docx","Sơ yếu lý lịch.pdf"], comments:[{by:"Võ Minh Tuấn",role:"Hội đồng TĐKT",text:"Hồ sơ đủ điều kiện, đã kiểm tra xác nhận thành tích.",time:"12/04/2026"},{by:"Nguyễn Văn Thắng",role:"Lãnh đạo cấp cao",text:"Đồng ý trình ký. Hồ sơ đúng quy trình.",time:"18/04/2026"}], urgent:true, handler:"Nguyễn Văn Thắng" },
  { id:"2", code:"TĐKT-2026-046", type:"tap_the", subject:"Phòng CSGT – CA Tỉnh Đồng Nai", unit:"Công an Tỉnh Đồng Nai", awardType:"Cờ thi đua Chính phủ", awardLevel:"Cấp nhà nước", achievements:"Tập thể xuất sắc, đảm bảo trật tự ATGT, giảm 18% tai nạn so với năm 2025.", status:"da_binh_xet", submittedBy:"Trần Bá Thành", submittedById:9, submittedDate:"2026-03-20", updatedDate:"2026-04-15", documents:["Tờ trình 46.pdf","Biên bản họp HĐTĐKT.pdf"], comments:[{by:"Võ Minh Tuấn",role:"Hội đồng TĐKT",text:"Kết quả bình xét: Đồng ý 9/9 thành viên.",time:"15/04/2026"}], urgent:false, handler:"Võ Minh Tuấn" },
  { id:"3", code:"TĐKT-2026-045", type:"ca_nhan", subject:"Nguyễn Phú Trọng Khoa", position:"Bác sĩ CKI", unit:"Bệnh viện Đa khoa Đồng Nai", awardType:"Chiến sĩ thi đua cấp Tỉnh", awardLevel:"Cấp tỉnh", achievements:"Hoàn thành xuất sắc nhiệm vụ khám chữa bệnh, đạt danh hiệu CSTĐ 5 năm liên tục.", status:"dang_tham_dinh", submittedBy:"Trần Bá Thành", submittedById:9, submittedDate:"2026-03-28", updatedDate:"2026-04-10", documents:["Tờ trình.pdf","Báo cáo thành tích.pdf"], comments:[], urgent:false, handler:"Võ Minh Tuấn" },
  { id:"4", code:"TĐKT-2026-044", type:"tap_the", subject:"Chi bộ Sở Tài chính", unit:"Sở Tài chính Đồng Nai", awardType:"Cờ thi đua UBND Tỉnh", awardLevel:"Cấp tỉnh", achievements:"Chi bộ trong sạch vững mạnh xuất sắc, hoàn thành tốt công tác thu ngân sách.", status:"cho_binh_xet", submittedBy:"Lê Thị Thanh Xuân", submittedById:11, submittedDate:"2026-03-10", updatedDate:"2026-04-12", documents:["Tờ trình 44.pdf"], comments:[{by:"Võ Minh Tuấn",role:"Hội đồng TĐKT",text:"Đã hoàn thành thẩm định. Đủ điều kiện xét.",time:"12/04/2026"}], urgent:false, handler:"Võ Minh Tuấn" },
  { id:"5", code:"TĐKT-2026-043", type:"ca_nhan", subject:"Trần Thị Kim Oanh", position:"Giáo viên", unit:"Trường THPT Chuyên Lương Thế Vinh", awardType:"Bằng khen Bộ/Ban/Ngành TW", awardLevel:"Cấp Bộ", achievements:"Giáo viên tiêu biểu, học sinh đạt giải quốc gia và quốc tế liên tục 3 năm.", status:"yeu_cau_bo_sung", submittedBy:"Trần Bá Thành", submittedById:9, submittedDate:"2026-04-01", updatedDate:"2026-04-19", documents:["Tờ trình.pdf"], comments:[{by:"Võ Minh Tuấn",role:"Hội đồng TĐKT",text:"Cần bổ sung minh chứng giải thưởng quốc tế và xác nhận của BGH.",time:"19/04/2026"}], urgent:true, handler:"Võ Minh Tuấn" },
  { id:"6", code:"TĐKT-2026-042", type:"ca_nhan", subject:"Phạm Hoàng Liêm", position:"Trưởng phòng", unit:"Sở Kế hoạch & Đầu tư", awardType:"Huân chương Lao động hạng Ba", awardLevel:"Cấp nhà nước", achievements:"25 năm công tác, đóng góp xuất sắc trong thu hút đầu tư FDI vào tỉnh Đồng Nai.", status:"da_gui_phong", submittedBy:"Trần Bá Thành", submittedById:9, submittedDate:"2026-04-05", updatedDate:"2026-04-22", documents:["Tờ trình số 42.pdf","Hồ sơ đề nghị.zip"], comments:[], urgent:false, handler:undefined },
  { id:"7", code:"TĐKT-2026-041", type:"tap_the", subject:"Đội CSND – CA TP. Biên Hòa", unit:"Công an TP. Biên Hòa", awardType:"Giấy khen", awardLevel:"Cấp tỉnh", achievements:"Đơn vị xuất sắc trong phòng chống tội phạm ma túy Q1/2026.", status:"hoan_thanh", submittedBy:"Trần Bá Thành", submittedById:9, submittedDate:"2026-01-10", updatedDate:"2026-02-28", documents:["QĐ-TĐKT-2026-041.pdf"], comments:[], urgent:false, handler:"Nguyễn Văn Thắng" },
  { id:"8", code:"TĐKT-2026-040", type:"ca_nhan", subject:"Võ Thị Ngọc Hà", position:"Điều dưỡng", unit:"Bệnh viện Nhi Đồng Đồng Nai", awardType:"Chiến sĩ thi đua cấp Tỉnh", awardLevel:"Cấp tỉnh", achievements:"Tận tâm chăm sóc bệnh nhi, được bệnh nhân và gia đình tín nhiệm cao.", status:"tu_choi", submittedBy:"Lê Thị Thanh Xuân", submittedById:11, submittedDate:"2026-02-01", updatedDate:"2026-03-10", documents:["Tờ trình.pdf"], comments:[{by:"Nguyễn Văn Thắng",role:"Lãnh đạo cấp cao",text:"Chưa đủ thời gian công tác tối thiểu 5 năm liên tục theo quy định.",time:"10/03/2026"}], urgent:false, handler:"Nguyễn Văn Thắng" },
  { id:"9", code:"TĐKT-2026-039", type:"ca_nhan", subject:"Đinh Công Sơn", position:"Kỹ sư CNTT", unit:"Sở Thông tin & Truyền thông", awardType:"Bằng khen Chủ tịch UBND Tỉnh", awardLevel:"Cấp tỉnh", achievements:"Chủ trì xây dựng cổng thông tin điện tử tỉnh, đạt giải thưởng CNTT 2025.", status:"nhap", submittedBy:"Trần Bá Thành", submittedById:9, submittedDate:"2026-04-22", updatedDate:"2026-04-22", documents:[], comments:[], urgent:false, handler:undefined },
  { id:"10", code:"TĐKT-2026-038", type:"tap_the", subject:"Tổ Sản xuất – Công ty TNHH Changshin", unit:"Ban Quản lý KCN Đồng Nai", awardType:"Cờ thi đua UBND Tỉnh", awardLevel:"Cấp tỉnh", achievements:"Tập thể xuất sắc doanh nghiệp FDI, đảm bảo việc làm và an sinh xã hội.", status:"cho_duyet", submittedBy:"Lê Thị Thanh Xuân", submittedById:11, submittedDate:"2026-04-18", updatedDate:"2026-04-18", documents:["Tờ trình.pdf","Thành tích.pdf"], comments:[], urgent:false, handler:undefined },
];

/* ─── Workflow stepper config ───────────────────────────────────── */
const STEPS = ["Tạo hồ sơ","Đơn vị đề nghị","Tiếp nhận","Thẩm định","Bình xét HĐ","Trình ký số","Ban hành QĐ"];
const STATUS_STEP: Record<NomStatus, number> = {
  nhap:0, cho_duyet:1, da_gui_phong:2, dang_tham_dinh:3,
  yeu_cau_bo_sung:3, cho_binh_xet:4, da_binh_xet:4,
  cho_ky_so:5, hoan_thanh:6, tu_choi:-1,
};

/* ─── Status Badge ───────────────────────────────────────────────── */
function StatusBadge({ status }: { status: NomStatus }) {
  const s = SC[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[13px] font-medium border"
      style={{ color: s.color, background: s.bg, borderColor: s.color + "30" }}>
      <span className="size-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

/* ─── SLA Chip ───────────────────────────────────────────────────── */
function SlaChip({ nom }: { nom: Nomination }) {
  const sla = calcSla(nom);
  if (!sla) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-px rounded text-[13px] font-medium"
      style={{ color: sla.color, background: sla.bg }}>
      <Clock className="size-2.5" /> {sla.label}
    </span>
  );
}

/* ─── Workflow Stepper ───────────────────────────────────────────── */
function WorkflowStepper({ status }: { status: NomStatus }) {
  const current = STATUS_STEP[status];
  const rejected = status === "tu_choi";
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = !rejected && i < current;
        const active = !rejected && i === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`size-5 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors
                ${rejected ? "bg-[#fee2e2] text-[#e11d48] border border-[#fca5a5]"
                  : done ? "bg-[#166534] text-white"
                  : active ? "border-2 text-white" : "bg-[#eef2f8] text-[#635647] border border-[#e2e8f0]"}`}
                style={active && !rejected ? { background: "var(--color-primary-btn)", borderColor: "transparent" } : undefined}>
                {done ? <CheckCheck className="size-2.5" /> : i + 1}
              </div>
              <span className={`text-[13px] mt-1 w-14 text-center leading-tight
                ${active ? "font-semibold" : "text-[#635647]"}`}
                style={active ? { color: "var(--color-primary-btn)" } : undefined}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-6 mb-4 ${done ? "bg-[#166534]" : "bg-[#e2e8f0]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Role-based action buttons ─────────────────────────────────── */
// Role mapping to actual LoginUser.role strings:
// "cá nhân"          → submitter (submit/recall/supplement)
// "lãnh đạo đơn vị"  → submitter + unit approver (cho_duyet → da_gui_phong)
// "hội đồng"         → thẩm định + bình xét
// "lãnh đạo cấp cao" → ký số
// "quản trị hệ thống"→ admin override
function ActionBar({
  nom, user, onAction
}: { nom: Nomination; user: LoginUser; onAction: (id: string, action: string) => void }) {
  const { theme } = useTheme();
  const role = user.role;
  const s = nom.status;
  const isMySubmission = nom.submittedById === user.id;

  const Btn = ({ label, variant, icon: Icon, act, disabled }: any) => (
    <button
      disabled={disabled}
      onClick={() => onAction(nom.id, act)}
      className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${variant === "primary" ? "text-white" : variant === "danger" ? "bg-[#fee2e2] text-[#c8102e] hover:bg-[#fecaca]"
          : variant === "warn" ? "bg-[#fef3c7] text-[#92400e] hover:bg-[#fde68a]"
          : "bg-[#f4f7fb] text-[#0b1426] hover:bg-[#ece6d6]"}`}
      style={variant === "primary" && !disabled ? { background: theme.primary } : undefined}
    >
      {Icon && <Icon className="size-3.5" />} {label}
    </button>
  );

  /* cá nhân: can submit their own nomination */
  if (role === "cá nhân") {
    if (!isMySubmission) return null;
    if (s === "nhap") return (
      <div className="flex gap-2">
        <Btn label="Chỉnh sửa" variant="secondary" icon={FilePen} act="edit" />
        <Btn label="Gửi đề nghị" variant="primary" icon={Send} act="submit" />
      </div>
    );
    if (s === "cho_duyet") return <div className="flex gap-2"><Btn label="Triệu hồi" variant="warn" icon={RotateCcw} act="recall" /></div>;
    if (s === "yeu_cau_bo_sung") return <div className="flex gap-2"><Btn label="Bổ sung tài liệu" variant="primary" icon={Upload} act="supplement" /></div>;
    return null;
  }

  /* lãnh đạo đơn vị: submit own + approve unit members' nominations */
  if (role === "lãnh đạo đơn vị") {
    if (s === "nhap" && isMySubmission) return (
      <div className="flex gap-2">
        <Btn label="Chỉnh sửa" variant="secondary" icon={FilePen} act="edit" />
        <Btn label="Gửi Phòng TĐKT" variant="primary" icon={Send} act="send_phong" />
      </div>
    );
    if (s === "cho_duyet") return (
      <div className="flex gap-2">
        <Btn label="Duyệt & gửi Phòng" variant="primary" icon={CheckCircle2} act="send_phong" />
        <Btn label="Trả về" variant="warn" icon={RotateCcw} act="return_submitter" />
      </div>
    );
    if (s === "yeu_cau_bo_sung" && isMySubmission) return <div className="flex gap-2"><Btn label="Bổ sung tài liệu" variant="primary" icon={Upload} act="supplement" /></div>;
    return null;
  }

  /* hội đồng: thẩm định + bình xét */
  if (role === "hội đồng") {
    if (s === "da_gui_phong") return (
      <div className="flex gap-2">
        <Btn label="Tiếp nhận thẩm định" variant="primary" icon={CheckCircle2} act="receive" />
        <Btn label="Trả về đơn vị" variant="warn" icon={RotateCcw} act="return_unit" />
      </div>
    );
    if (s === "dang_tham_dinh") return (
      <div className="flex gap-2">
        <Btn label="Chuyển bình xét HĐ" variant="primary" icon={Send} act="forward_council" />
        <Btn label="Yêu cầu bổ sung" variant="warn" icon={AlertCircle} act="request_info" />
        <Btn label="Từ chối" variant="danger" icon={XCircle} act="reject" />
      </div>
    );
    if (s === "cho_binh_xet") return (
      <div className="flex gap-2">
        <Btn label="Bình xét xong" variant="primary" icon={CheckCheck} act="binh_xet" />
        <Btn label="Từ chối bình xét" variant="danger" icon={XCircle} act="reject" />
      </div>
    );
    if (s === "da_binh_xet") return (
      <div className="flex gap-2">
        <Btn label="Trình ký số" variant="primary" icon={FileSignature} act="submit_sign" />
      </div>
    );
    return null;
  }

  /* lãnh đạo cấp cao: ký số */
  if (role === "lãnh đạo cấp cao") {
    if (s === "cho_ky_so") return (
      <div className="flex gap-2">
        <Btn label="Ký số & Ban hành" variant="primary" icon={FileSignature} act="sign" />
        <Btn label="Hoàn trả điều chỉnh" variant="warn" icon={RotateCcw} act="return_revise" />
      </div>
    );
    return null;
  }

  /* quản trị hệ thống: admin override */
  if (role === "quản trị hệ thống") {
    return (
      <div className="flex gap-2 flex-wrap">
        {s === "nhap" && <Btn label="Gửi" variant="primary" icon={Send} act="submit" />}
        {s === "cho_duyet" && <Btn label="Duyệt & gửi" variant="primary" icon={CheckCircle2} act="send_phong" />}
        {s === "da_gui_phong" && <Btn label="Tiếp nhận" variant="primary" icon={CheckCircle2} act="receive" />}
        {s === "dang_tham_dinh" && <Btn label="Chuyển bình xét" variant="primary" icon={Send} act="forward_council" />}
        {s === "cho_binh_xet" && <Btn label="Bình xét xong" variant="primary" icon={CheckCheck} act="binh_xet" />}
        {s === "da_binh_xet" && <Btn label="Trình ký số" variant="primary" icon={FileSignature} act="submit_sign" />}
        {s === "cho_ky_so" && <Btn label="Ký số" variant="primary" icon={FileSignature} act="sign" />}
        {!["hoan_thanh","tu_choi"].includes(s) && <Btn label="Từ chối" variant="danger" icon={XCircle} act="reject" />}
        <Btn label="Chỉnh sửa" variant="secondary" icon={FilePen} act="admin_edit" />
      </div>
    );
  }

  return null;
}

/* ─── Filter Dropdown ────────────────────────────────────────────── */
const STATUS_FILTER_OPTIONS: { value: NomStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "nhap", label: "Bản nháp" },
  { value: "cho_duyet", label: "Chờ đơn vị duyệt" },
  { value: "da_gui_phong", label: "Đã gửi Phòng TĐKT" },
  { value: "dang_tham_dinh", label: "Đang thẩm định" },
  { value: "yeu_cau_bo_sung", label: "Yêu cầu bổ sung" },
  { value: "cho_binh_xet", label: "Chờ bình xét HĐ" },
  { value: "da_binh_xet", label: "Đã bình xét" },
  { value: "cho_ky_so", label: "Chờ ký số" },
  { value: "hoan_thanh", label: "Hoàn thành" },
  { value: "tu_choi", label: "Không được duyệt" },
];

function FilterDropdown({
  value, onChange
}: { value: NomStatus | "all"; onChange: (v: NomStatus | "all") => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const current = STATUS_FILTER_OPTIONS.find(o => o.value === value)!;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="btn btn-sm btn-secondary gap-1.5">
        <Filter className="size-3.5" />
        {value === "all" ? "Lọc" : current.label}
        <ChevronDown className="size-3" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 z-30 w-52 bg-white rounded-xl shadow-xl border border-[#e2e8f0] py-1 overflow-hidden">
          {STATUS_FILTER_OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => { onChange(opt.value as any); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-left hover:bg-[#ffffff] transition-colors">
              {opt.label}
              {value === opt.value && <Check className="size-3.5 text-[var(--color-primary-btn)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Detail Panel ───────────────────────────────────────────────── */
function DetailPanel({
  nom, user, onClose, onAction, onAddComment
}: {
  nom: Nomination; user: LoginUser; onClose: () => void;
  onAction: (id: string, action: string) => void;
  onAddComment: (id: string, comment: NomComment) => void;
}) {
  const [tab, setTab] = useState<"info"|"docs"|"history">("info");
  const [commentText, setCommentText] = useState("");

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(nom.id, {
      by: user.name,
      role: user.role,
      text: commentText.trim(),
      time: "25/04/2026",
    });
    setCommentText("");
  };

  const sla = calcSla(nom);

  return (
    <div className="w-[440px] shrink-0 border-l border-[#e2e8f0] bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#eef2f8] bg-[#ffffff] flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[13px] font-mono text-[#635647]">{nom.code}</span>
            {nom.urgent && (
              <span className="px-1.5 py-px bg-[#fee2e2] text-[#c8102e] rounded text-[13px] font-semibold">Khẩn</span>
            )}
            {sla && (
              <span className="inline-flex items-center gap-1 px-1.5 py-px rounded text-[13px] font-medium"
                style={{ color: sla.color, background: sla.bg }}>
                <Clock className="size-2.5" /> {sla.label}
              </span>
            )}
          </div>
          <h3 className="text-[14px] font-semibold text-[#0b1426] leading-tight" style={{ fontFamily: "var(--font-sans)" }}>
            {nom.subject}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            {nom.type === "ca_nhan" ? <User className="size-3 text-[#635647]" /> : <Users className="size-3 text-[#635647]" />}
            <span className="text-[13px] text-[#635647]">{nom.position ?? "Tập thể"} · {nom.unit}</span>
          </div>
          <div className="mt-2"><StatusBadge status={nom.status} /></div>
        </div>
        <button onClick={onClose} className="btn-icon size-8 shrink-0">
          <X className="size-4" />
        </button>
      </div>

      {/* Workflow stepper */}
      <div className="px-5 py-3 border-b border-[#eef2f8] bg-white overflow-x-auto">
        <WorkflowStepper status={nom.status} />
      </div>

      {/* Tabs */}
      <div className="px-5 flex gap-4 border-b border-[#eef2f8]">
        {(["info","docs","history"] as const).map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={`py-2.5 text-[13px] border-b-2 transition-colors ${tab === t ? "border-current font-semibold" : "border-transparent text-[#635647] hover:text-[#0b1426]"}`}
            style={tab === t ? { color: "var(--color-primary-btn)", borderColor: "var(--color-primary-btn)" } : undefined}>
            { t === "info" ? "Thông tin" : t === "docs" ? `Tài liệu (${nom.documents.length})` : (
              <span className="flex items-center gap-1">
                Lịch sử
                {nom.comments.length > 0 && (
                  <span className="inline-flex items-center justify-center size-4 rounded-full text-[13px] font-bold text-white"
                    style={{ background: "var(--color-primary-btn)" }}>{nom.comments.length}</span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {tab === "info" && (
          <>
            <div className="space-y-3">
              {[
                { icon: Star, label: "Hình thức khen thưởng", value: nom.awardType },
                { icon: Building2, label: "Cấp khen thưởng", value: nom.awardLevel },
                { icon: CalendarDays, label: "Ngày đề nghị", value: nom.submittedDate },
                { icon: User, label: "Người đề nghị", value: nom.submittedBy },
                ...(nom.handler ? [{ icon: Users, label: "Người phụ trách", value: nom.handler }] : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="size-7 rounded-md bg-[#f4f7fb] grid place-items-center shrink-0 mt-0.5">
                    <Icon className="size-3.5 text-[#635647]" />
                  </div>
                  <div>
                    <p className="text-[13px] text-[#635647]">{label}</p>
                    <p className="text-[13px] text-[#0b1426] font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-[#f4f7fb] p-3">
              <p className="text-[13px] text-[#635647] mb-1 uppercase tracking-wide">Tóm tắt thành tích</p>
              <p className="text-[13px] text-[#0b1426] leading-relaxed">{nom.achievements}</p>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-[#fdf3d9] border border-[#f0dba0] p-3">
              <Sparkles className="size-3.5 text-[#b45309] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#7d4a00] leading-relaxed">
                <strong>Trợ lý AI:</strong> Hồ sơ này đạt 94/100 điểm đủ điều kiện. Thành tích khớp quy định Nghị định 152/2025/NĐ-CP.
              </p>
            </div>
          </>
        )}
        {tab === "docs" && (
          <div className="space-y-2">
            {nom.documents.length === 0 ? (
              <div className="text-center py-8 text-[13px] text-[#635647]">Chưa có tài liệu đính kèm</div>
            ) : nom.documents.map(doc => (
              <div key={doc} className="flex items-center gap-3 p-3 rounded-lg border border-[#e2e8f0] hover:bg-[#ffffff] transition-colors">
                <div className="size-8 rounded-md bg-[#fee2e2] grid place-items-center shrink-0">
                  <FileText className="size-4 text-[#c8102e]" />
                </div>
                <span className="flex-1 text-[13px] text-[#0b1426] truncate">{doc}</span>
                <button className="btn-icon size-7"><Download className="size-3.5" /></button>
              </div>
            ))}
            {(["cá nhân","lãnh đạo đơn vị","quản trị hệ thống"].includes(user.role)) && (
              <button className="w-full mt-2 h-10 border-2 border-dashed border-[#e2e8f0] rounded-lg text-[13px] text-[#635647] hover:border-[#c9bfa6] hover:bg-[#ffffff] transition-colors flex items-center justify-center gap-2">
                <Upload className="size-4" /> Thêm tài liệu
              </button>
            )}
          </div>
        )}
        {tab === "history" && (
          <div className="space-y-3">
            {nom.comments.length === 0 && (
              <div className="text-center py-6 text-[13px] text-[#635647]">
                <MessageSquare className="size-7 mx-auto mb-2 opacity-30" />
                Chưa có nhận xét
              </div>
            )}
            {nom.comments.map((c, i) => (
              <div key={i} className="flex gap-3">
                <div className="size-7 rounded-full grid place-items-center text-white text-[13px] shrink-0 mt-0.5"
                  style={{ background: "var(--color-primary-btn)" }}>
                  {c.by.split(" ").pop()?.charAt(0)}
                </div>
                <div className="flex-1 rounded-lg bg-[#f4f7fb] px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-[#0b1426]">{c.by}</span>
                    <span className="text-[13px] text-[#635647]">· {c.role}</span>
                    <span className="ml-auto text-[13px] text-[#635647]">{c.time}</span>
                  </div>
                  <p className="text-[13px] text-[#0b1426] leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}

            {/* Comment input */}
            <div className="mt-2 pt-3 border-t border-[#eef2f8]">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Thêm nhận xét hoặc ghi chú…"
                rows={3}
                className="ds-input w-full px-3 py-2 text-[13px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="btn btn-sm btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  <Send className="size-3.5" /> Gửi nhận xét
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-5 py-4 border-t border-[#eef2f8] bg-[#ffffff]">
        <ActionBar nom={nom} user={user} onAction={onAction} />
      </div>
    </div>
  );
}

/* ─── Create Modal ───────────────────────────────────────────────── */
function CreateModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    type: "ca_nhan", subject: "", position: "", unit: "", awardType: AWARD_TYPES[5], achievements: ""
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const errors: Record<string, string | null> = {
    subject:      form.subject.trim().length === 0 ? `${form.type === "ca_nhan" ? "Họ và tên" : "Tên tập thể"} không được để trống` : form.subject.trim().length < 2 ? "Phải có ít nhất 2 ký tự" : null,
    unit:         form.unit.trim().length === 0 ? "Đơn vị công tác không được để trống" : form.unit.trim().length < 2 ? "Phải có ít nhất 2 ký tự" : null,
    achievements: form.achievements.trim().length === 0 ? "Vui lòng mô tả thành tích nổi bật" : form.achievements.trim().length < 20 ? "Mô tả cần ít nhất 20 ký tự" : null,
  };
  const isValid = Object.values(errors).every(e => e === null);

  const handleSubmit = () => {
    setTouched({ subject: true, unit: true, achievements: true });
    if (isValid) onSubmit(form);
  };

  const fieldErr = (k: string) => touched[k] ? errors[k] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#eef2f8] bg-[#ffffff] flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>Tạo đề nghị khen thưởng mới</h2>
            <p className="text-[13px] text-[#635647] mt-0.5">Điền đầy đủ thông tin để lập hồ sơ đề nghị</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X className="size-4" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="ds-input-label mb-2 block">Đối tượng khen thưởng</label>
            <div className="flex gap-3">
              {(["ca_nhan","tap_the"] as const).map(t => (
                <button key={t}
                  onClick={() => set("type", t)}
                  className="flex-1 h-10 rounded-lg border-2 text-[13px] font-medium transition-colors"
                  style={form.type === t ? { borderColor: theme.primary, color: theme.primary, background: theme.tint } : { borderColor: "#e2e8f0", color: "#5a5040" }}>
                  {t === "ca_nhan" ? "👤 Cá nhân" : "👥 Tập thể"}
                </button>
              ))}
            </div>
          </div>
          <div className="ds-input-root">
            <label className="ds-input-label ds-input-label-required">{form.type === "ca_nhan" ? "Họ và tên" : "Tên tập thể"}</label>
            <input
              className="ds-input ds-input-md"
              style={fieldErr("subject") ? { borderColor: "#f87171" } : {}}
              placeholder={form.type === "ca_nhan" ? "VD: Nguyễn Văn An" : "VD: Phòng Giáo dục quận 1"}
              value={form.subject}
              onChange={e => set("subject", e.target.value)}
              onBlur={() => touch("subject")}
            />
            {fieldErr("subject") && <p className="text-[13px] text-[#c8102e] mt-1">{fieldErr("subject")}</p>}
          </div>
          {form.type === "ca_nhan" && (
            <div className="ds-input-root">
              <label className="ds-input-label">Chức vụ / Chức danh</label>
              <input className="ds-input ds-input-md" placeholder="VD: Giáo viên chủ nhiệm" value={form.position} onChange={e => set("position", e.target.value)} />
            </div>
          )}
          <div className="ds-input-root">
            <label className="ds-input-label ds-input-label-required">Đơn vị công tác</label>
            <input
              className="ds-input ds-input-md"
              style={fieldErr("unit") ? { borderColor: "#f87171" } : {}}
              placeholder="VD: Sở Giáo dục & Đào tạo"
              value={form.unit}
              onChange={e => set("unit", e.target.value)}
              onBlur={() => touch("unit")}
            />
            {fieldErr("unit") && <p className="text-[13px] text-[#c8102e] mt-1">{fieldErr("unit")}</p>}
          </div>
          <div className="ds-input-root">
            <label className="ds-input-label">Hình thức khen thưởng đề nghị</label>
            <select className="ds-input ds-input-md" value={form.awardType} onChange={e => set("awardType", e.target.value)}>
              {AWARD_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="ds-input-root">
            <label className="ds-input-label ds-input-label-required">Tóm tắt thành tích nổi bật</label>
            <textarea
              className="ds-input px-3 py-2 min-h-[90px] resize-none"
              style={fieldErr("achievements") ? { borderColor: "#f87171" } : {}}
              placeholder="Mô tả thành tích đóng góp của cá nhân/tập thể... (tối thiểu 20 ký tự)"
              value={form.achievements}
              onChange={e => set("achievements", e.target.value)}
              onBlur={() => touch("achievements")}
            />
            <div className="flex items-center justify-between mt-1">
              {fieldErr("achievements")
                ? <p className="text-[13px] text-[#c8102e]">{fieldErr("achievements")}</p>
                : <span />
              }
              <span className="text-[13px] text-[#635647] ml-auto">{form.achievements.trim().length}/20</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#eef2f8] bg-[#ffffff] flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-md btn-secondary">Huỷ</button>
          <button onClick={handleSubmit} className="btn btn-md btn-primary" style={{ opacity: isValid ? 1 : 0.65 }}>
            <Plus className="size-4" /> Tạo hồ sơ nháp
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast notification ─────────────────────────────────────────── */
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useState(() => { setTimeout(onDone, 2600); });
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-[13px] font-medium"
      style={{ background: "var(--color-primary-btn)" }}>
      <CheckCircle2 className="size-4" /> {msg}
    </div>
  );
}

/* ─── Role-aware tab config ─────────────────────────────────────── */
function getTabs(role: string) {
  if (role === "cá nhân")           return ["Của tôi","Cần bổ sung","Hoàn thành"];
  if (role === "lãnh đạo đơn vị")  return ["Của đơn vị","Cần bổ sung","Hoàn thành"];
  if (role === "lãnh đạo cấp cao") return ["Chờ ký số","Đã ký","Toàn bộ"];
  if (role === "hội đồng")         return ["Tất cả","Cần phê duyệt","Đang xử lý","Hoàn thành"];
  return ["Tất cả","Cần xử lý","Đang thẩm định","Hoàn thành"];
}

function filterByTab(noms: Nomination[], tab: string, role: string): Nomination[] {
  if (role === "lãnh đạo cấp cao") {
    if (tab === "Chờ ký số") return noms.filter(n => n.status === "cho_ky_so");
    if (tab === "Đã ký")     return noms.filter(n => n.status === "hoan_thanh");
    return noms;
  }
  if (role === "cá nhân" || role === "lãnh đạo đơn vị") {
    const mine = noms.filter(n => n.submittedBy === "Trần Bá Thành");
    if (tab === "Cần bổ sung") return mine.filter(n => n.status === "yeu_cau_bo_sung");
    if (tab === "Hoàn thành")  return mine.filter(n => n.status === "hoan_thanh");
    return mine;
  }
  if (tab === "Cần xử lý")      return noms.filter(n => ["da_gui_phong"].includes(n.status));
  if (tab === "Đang thẩm định") return noms.filter(n => ["dang_tham_dinh","yeu_cau_bo_sung"].includes(n.status));
  if (tab === "Cần phê duyệt")  return noms.filter(n => ["da_binh_xet","cho_binh_xet"].includes(n.status));
  if (tab === "Hoàn thành")     return noms.filter(n => ["hoan_thanh","tu_choi"].includes(n.status));
  if (tab === "Đang xử lý")    return noms.filter(n => ["dang_tham_dinh","cho_binh_xet","cho_ky_so"].includes(n.status));
  return noms;
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export function DeNghiKhenThuongPage({ user }: { user: LoginUser }) {
  const { theme } = useTheme();
  const [noms, setNoms]              = useState<Nomination[]>(initNominations);
  const [selectedId, setSelectedId]  = useState<string | null>(null);
  const [showCreate, setShowCreate]  = useState(false);
  const [activeTab, setActiveTab]    = useState(getTabs(user.role)[0]);
  const [search, setSearch]          = useState("");
  const [statusFilter, setStatusFilter] = useState<NomStatus | "all">("all");
  const [toast, setToast]            = useState("");

  const tabs = getTabs(user.role);
  const selected = noms.find(n => n.id === selectedId) ?? null;

  const visible = filterByTab(noms, activeTab, user.role)
    .filter(n => statusFilter === "all" || n.status === statusFilter)
    .filter(n => !search || n.subject.toLowerCase().includes(search.toLowerCase()) ||
      n.unit.toLowerCase().includes(search.toLowerCase()) ||
      n.code.toLowerCase().includes(search.toLowerCase()));

  const statusCounts = {
    total: noms.length,
    pending: noms.filter(n => ["da_gui_phong","dang_tham_dinh","yeu_cau_bo_sung","cho_binh_xet","da_binh_xet","cho_ky_so"].includes(n.status)).length,
    done: noms.filter(n => n.status === "hoan_thanh").length,
    urgent: noms.filter(n => n.urgent).length,
    overdue: noms.filter(n => { const sla = calcSla(n); return sla && sla.days < 0; }).length,
  };

  const handleAction = (id: string, action: string) => {
    const nextStatus: Record<string, NomStatus> = {
      submit: "cho_duyet",
      send_phong: "da_gui_phong",
      return_submitter: "nhap",
      return_unit: "nhap",
      recall: "nhap",
      receive: "dang_tham_dinh",
      forward_council: "cho_binh_xet",
      binh_xet: "da_binh_xet",
      convene: "da_binh_xet",
      submit_sign: "cho_ky_so",
      sign: "hoan_thanh",
      reject: "tu_choi",
      request_info: "yeu_cau_bo_sung",
      supplement: "dang_tham_dinh",
      return_revise: "da_binh_xet",
    };
    const messages: Record<string, string> = {
      submit: "Đã gửi đề nghị lên đơn vị ✓",
      send_phong: "Đã duyệt và gửi Phòng TĐKT ✓",
      return_submitter: "Đã trả về cho người đề nghị",
      return_unit: "Đã trả về đơn vị",
      recall: "Đã triệu hồi về nháp",
      receive: "Đã tiếp nhận – bắt đầu thẩm định ✓",
      forward_council: "Đã chuyển bình xét Hội đồng ✓",
      binh_xet: "Đã hoàn tất bình xét ✓",
      submit_sign: "Đã trình ký số ✓",
      sign: "🎉 Đã ký số và ban hành Quyết định!",
      reject: "Đã từ chối hồ sơ",
      request_info: "Đã gửi yêu cầu bổ sung",
      supplement: "Đã nộp bổ sung – tiếp tục thẩm định ✓",
      return_revise: "Đã hoàn trả để điều chỉnh",
    };
    if (nextStatus[action]) {
      setNoms(prev => prev.map(n => n.id === id ? { ...n, status: nextStatus[action], updatedDate: "2026-04-25" } : n));
      setToast(messages[action] ?? "Thao tác thành công");
    }
  };

  const handleAddComment = (id: string, comment: NomComment) => {
    setNoms(prev => prev.map(n => n.id === id ? { ...n, comments: [...n.comments, comment] } : n));
  };

  const handleCreate = (data: any) => {
    const newNom: Nomination = {
      id: String(noms.length + 1), code: `TĐKT-2026-${String(noms.length + 48).padStart(3,"0")}`,
      type: data.type, subject: data.subject, position: data.position || undefined,
      unit: data.unit, awardType: data.awardType, awardLevel: "Cấp tỉnh",
      achievements: data.achievements, status: "nhap",
      submittedBy: user.name, submittedById: user.id,
      submittedDate: "2026-04-25", updatedDate: "2026-04-25",
      documents: [], comments: [], urgent: false,
    };
    setNoms(prev => [newNom, ...prev]);
    setShowCreate(false);
    setToast("Đã tạo hồ sơ nháp thành công ✓");
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--color-paper)" }}>
      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-6 pb-0 bg-white border-b border-[#eef2f8]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                Đề nghị Khen thưởng
              </h2>
              <p className="text-[13px] text-[#635647] mt-0.5">Năm công tác 2026 · Tỉnh Đồng Nai</p>
            </div>
            <div className="flex items-center gap-5">
              {[
                { label: "Tổng hồ sơ",  v: statusCounts.total,   color: "#0b1426" },
                { label: "Đang xử lý",  v: statusCounts.pending, color: theme.primary },
                { label: "Hoàn thành",  v: statusCounts.done,    color: "#166534" },
                { label: "Khẩn cấp",   v: statusCounts.urgent,  color: "#c8102e" },
                ...(statusCounts.overdue > 0 ? [{ label: "Quá hạn SLA", v: statusCounts.overdue, color: "#7c3aed" }] : []),
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-[18px] leading-none font-bold" style={{ fontFamily: "var(--font-sans)", color: s.color }}>{s.v}</div>
                  <div className="text-[13px] text-[#635647] mt-0.5">{s.label}</div>
                </div>
              ))}
              {(user.role === "cá nhân" || user.role === "lãnh đạo đơn vị" || user.role === "quản trị hệ thống") && (
                <button onClick={() => setShowCreate(true)} className="btn btn-md btn-primary ml-2">
                  <Plus className="size-4" /> Tạo mới
                </button>
              )}
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t}
                onClick={() => { setActiveTab(t); setSelectedId(null); setStatusFilter("all"); }}
                className={`px-4 h-10 text-[13px] font-medium border-b-2 transition-colors rounded-t-lg ${activeTab === t ? "" : "border-transparent text-[#635647] hover:text-[#0b1426] hover:bg-[#f4f7fb]"}`}
                style={activeTab === t ? { borderColor: theme.primary, color: theme.primary } : undefined}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-8 py-3 bg-white border-b border-[#eef2f8] flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <label className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#f4f7fb] border border-[#e2e8f0] focus-within:border-[var(--color-primary-btn)] transition">
              <Search className="size-3.5 text-[#635647]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo tên, đơn vị, mã HS…"
                className="bg-transparent outline-none text-[13px] flex-1 text-[#0b1426] placeholder:text-[#635647]" />
            </label>
          </div>
          <FilterDropdown value={statusFilter} onChange={setStatusFilter} />
          {statusFilter !== "all" && (
            <button onClick={() => setStatusFilter("all")}
              className="flex items-center gap-1 text-[13px] text-[#635647] hover:text-[#0b1426]">
              <X className="size-3" /> Xóa lọc
            </button>
          )}
          <span className="text-[13px] text-[#635647] ml-auto">{visible.length} kết quả</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#eef2f8] bg-[#ffffff] sticky top-0">
                {["Mã HS","Đối tượng","Hình thức khen thưởng","Trạng thái","SLA","Ngày đề nghị",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[13px] font-semibold text-[#635647] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(n => (
                <tr key={n.id}
                  onClick={() => setSelectedId(n.id === selectedId ? null : n.id)}
                  className={`border-b border-[#eef2f8] cursor-pointer transition-colors
                    ${n.id === selectedId ? "bg-[var(--color-primary-tint)]" : "hover:bg-[#ffffff]"}`}>
                  <td className="px-4 py-3 text-[13px] font-mono text-[#635647] whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {n.urgent && <span className="size-1.5 rounded-full bg-[#c8102e] shrink-0" />}
                      {n.code}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full grid place-items-center text-white text-[13px] font-bold shrink-0"
                        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryActive})` }}>
                        {n.type === "tap_the" ? <Users className="size-3.5" /> : n.subject.split(" ").pop()?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] text-[#0b1426] font-medium truncate max-w-[180px]">{n.subject}</p>
                        <p className="text-[13px] text-[#635647] truncate max-w-[180px]">{n.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#4a5568] max-w-[160px]">
                    <span className="truncate block">{n.awardType}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={n.status} /></td>
                  <td className="px-4 py-3"><SlaChip nom={n} /></td>
                  <td className="px-4 py-3 text-[13px] text-[#635647] whitespace-nowrap">{n.submittedDate}</td>
                  <td className="px-4 py-3">
                    <button className="btn-icon size-7" onClick={e => { e.stopPropagation(); setSelectedId(n.id); }}>
                      <ChevronRight className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={7} className="text-center py-16 text-[13px] text-[#635647]">
                  <Eye className="size-8 mx-auto mb-2 opacity-30" /> Không có hồ sơ nào
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          nom={selected} user={user}
          onClose={() => setSelectedId(null)}
          onAction={handleAction}
          onAddComment={handleAddComment}
        />
      )}

      {/* Create modal */}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}

      {/* Toast */}
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
}
