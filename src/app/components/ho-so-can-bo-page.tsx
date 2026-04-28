import { useState, useEffect } from "react";
import {
  Search, User, Users, Star, Award, CalendarDays, Building2,
  Filter, Eye, ChevronRight, Trophy, TrendingUp,
  Sparkles, CheckCircle2, XCircle, AlertCircle, Clock,
  FileText, Download, X, Plus, ChevronDown, Loader2,
  Shield, Brain, BarChart2, Edit3, Phone, Mail,
  BookOpen, Briefcase, Zap,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface AwardHistory {
  type: string; year: number; level: string; qd: string; status: "confirmed" | "pending";
}
interface WorkHistory {
  period: string; chucVu: string; donVi: string; phongTrao?: string;
}
interface CanBo {
  id: string; name: string; position: string; unit: string;
  dob: string; gender: "nam" | "nu"; joinYear: number;
  score: number; phone: string; email: string;
  awards: AwardHistory[];
  workHistory: WorkHistory[];
  eligibleFor: string[];
  aiScore: number;
  note?: string;
  completeness: number; // profile completeness %
}

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const CAN_BO_LIST: CanBo[] = [
  {
    id: "1", name: "Lê Thị Thanh Xuân", position: "Phó Giám đốc", unit: "Sở Giáo dục & Đào tạo",
    dob: "15/03/1975", gender: "nu", joinYear: 1997, score: 94, phone: "0912.345.678", email: "ltxuan@gddt.dongnai.gov.vn",
    awards: [
      { type: "CSTĐ cấp Tỉnh", year: 2023, level: "Tỉnh", qd: "001/QĐ-TU-2023", status: "confirmed" },
      { type: "Bằng khen UBND Tỉnh", year: 2021, level: "Tỉnh", qd: "108/QĐ-TU-2021", status: "confirmed" },
      { type: "Bằng khen Bộ GD&ĐT", year: 2019, level: "Bộ", qd: "BK-GD-2019-114", status: "confirmed" },
    ],
    workHistory: [
      { period: "2018 – nay", chucVu: "Phó Giám đốc", donVi: "Sở GD&ĐT Đồng Nai", phongTrao: "Lao động giỏi 2026" },
      { period: "2010 – 2018", chucVu: "Trưởng phòng Giáo dục Tiểu học", donVi: "Sở GD&ĐT" },
      { period: "1997 – 2010", chucVu: "Chuyên viên", donVi: "Sở GD&ĐT Đồng Nai" },
    ],
    eligibleFor: ["CSTĐ cấp Tỉnh (năm 3)", "Huân chương LĐ hạng Ba (đủ 20 năm)"],
    aiScore: 94.2, completeness: 98, note: "Đủ 3 năm CSTĐ cơ sở; thời gian công tác 27 năm đủ điều kiện đề nghị HuânC LĐ hạng Ba.",
  },
  {
    id: "2", name: "Phạm Hoàng Liêm", position: "Trưởng phòng KH&TĐ", unit: "Sở Kế hoạch & Đầu tư",
    dob: "22/07/1970", gender: "nam", joinYear: 1993, score: 88, phone: "0987.654.321", email: "phliêm@khdt.dongnai.gov.vn",
    awards: [
      { type: "Huân chương LĐ hạng Ba", year: 2024, level: "Nhà nước", qd: "200/QĐ-CTN-2024", status: "confirmed" },
      { type: "CSTĐ cấp Tỉnh", year: 2022, level: "Tỉnh", qd: "085/QĐ-TU-2022", status: "confirmed" },
    ],
    workHistory: [
      { period: "2015 – nay", chucVu: "Trưởng phòng KH&TĐ", donVi: "Sở KH&ĐT Đồng Nai" },
      { period: "1993 – 2015", chucVu: "Chuyên viên → Phó phòng", donVi: "Sở KH&ĐT Đồng Nai" },
    ],
    eligibleFor: ["Bằng khen UBND Tỉnh"],
    aiScore: 88.4, completeness: 91,
  },
  {
    id: "3", name: "Nguyễn Phú Trọng Khoa", position: "Bác sĩ CKI", unit: "BV Đa khoa Đồng Nai",
    dob: "10/11/1980", gender: "nam", joinYear: 2005, score: 91, phone: "0939.111.222", email: "nptkhoa@bvdk.dongnai.gov.vn",
    awards: [
      { type: "CSTĐ cấp Tỉnh", year: 2024, level: "Tỉnh", qd: "047/QĐ-TU-2024", status: "confirmed" },
      { type: "Bằng khen UBND Tỉnh", year: 2022, level: "Tỉnh", qd: "109/QĐ-TU-2022", status: "confirmed" },
    ],
    workHistory: [
      { period: "2010 – nay", chucVu: "Bác sĩ CKI – Khoa Nội", donVi: "BV Đa khoa ĐN", phongTrao: "Lao động giỏi 2026" },
      { period: "2005 – 2010", chucVu: "Bác sĩ nội trú", donVi: "BV Đa khoa ĐN" },
    ],
    eligibleFor: ["CSTĐ cấp Tỉnh (năm 2)", "Bằng khen Bộ Y tế"],
    aiScore: 91.5, completeness: 95,
  },
  {
    id: "4", name: "Trần Thị Kim Oanh", position: "Giáo viên THPT", unit: "THPT Chuyên Lương Thế Vinh",
    dob: "05/09/1985", gender: "nu", joinYear: 2008, score: 87, phone: "0905.777.888", email: "ttkoanh@thptltv.edu.vn",
    awards: [
      { type: "Giáo viên dạy giỏi toàn quốc", year: 2023, level: "Quốc gia", qd: "GV-TQ-2023-041", status: "confirmed" },
      { type: "Bằng khen Bộ GD&ĐT", year: 2021, level: "Bộ", qd: "BK-GD-2021-088", status: "confirmed" },
    ],
    workHistory: [
      { period: "2014 – nay", chucVu: "GV THPT Chuyên Toán", donVi: "THPT Chuyên LTV" },
      { period: "2008 – 2014", chucVu: "Giáo viên THPT", donVi: "THPT Long Khánh" },
    ],
    eligibleFor: ["CSTĐ cơ sở (năm 3)", "Chiến sĩ thi đua cấp Tỉnh"],
    aiScore: 87.2, completeness: 85,
  },
  {
    id: "5", name: "Đinh Công Sơn", position: "Kỹ sư CNTT", unit: "Sở Thông tin & Truyền thông",
    dob: "14/04/1990", gender: "nam", joinYear: 2013, score: 80, phone: "0901.234.567", email: "dcson@stttt.dongnai.gov.vn",
    awards: [
      { type: "Bằng khen UBND Tỉnh", year: 2025, level: "Tỉnh", qd: "015/QĐ-TU-2025", status: "confirmed" },
    ],
    workHistory: [
      { period: "2017 – nay", chucVu: "Kỹ sư CNTT", donVi: "Sở TT&TT Đồng Nai" },
      { period: "2013 – 2017", chucVu: "Chuyên viên CNTT", donVi: "VP UBND Tỉnh" },
    ],
    eligibleFor: ["CSTĐ cơ sở"],
    aiScore: 80.3, completeness: 72,
  },
  {
    id: "6", name: "Võ Thị Ngọc Hà", position: "Điều dưỡng trưởng", unit: "BV Nhi Đồng Đồng Nai",
    dob: "30/01/1988", gender: "nu", joinYear: 2010, score: 76, phone: "0908.999.000", email: "vtnha@bvnhi.dongnai.gov.vn",
    awards: [],
    workHistory: [
      { period: "2015 – nay", chucVu: "Điều dưỡng trưởng Khoa A2", donVi: "BV Nhi ĐN" },
      { period: "2010 – 2015", chucVu: "Điều dưỡng viên", donVi: "BV Nhi ĐN" },
    ],
    eligibleFor: [],
    aiScore: 76.1, completeness: 61, note: "Chưa đủ điều kiện danh hiệu: cần thêm 1 năm hoàn thành xuất sắc liên tục.",
  },
];

const LEVEL_CFG: Record<string, { color: string; bg: string }> = {
  "Nhà nước": { color: "#7d5a10", bg: "#fdf3d9" },
  "Quốc gia": { color: "#6d28d9", bg: "#ede9fe" },
  "Bộ": { color: "#1C5FBE", bg: "#ddeafc" },
  "Tỉnh": { color: "#047857", bg: "#d1fae5" },
};

/* ═══════════════════════════════════════════════════════════════
   AI ELIGIBILITY PANEL
═══════════════════════════════════════════════════════════════ */
function AiEligibilityPanel({ cb, onClose }: { cb: CanBo; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1600); return () => clearTimeout(t); }, []);

  const checks = [
    { label: "Hoàn thành xuất sắc nhiệm vụ ≥ 2 năm liên tục", ok: cb.score >= 80 },
    { label: "Không vi phạm kỷ luật trong kỳ xét", ok: true },
    { label: "Có sáng kiến/đề tài khoa học được công nhận", ok: cb.score >= 85 },
    { label: "Thời gian công tác đủ theo quy định", ok: (2026 - cb.joinYear) >= 5 },
    { label: "Đã đạt danh hiệu CSTĐ cơ sở ≥ 2 năm (cho CSTĐ cấp Tỉnh)", ok: cb.awards.filter(a => a.level === "Tỉnh").length >= 2 || cb.awards.some(a => a.type.includes("CSTĐ")) },
    { label: "Hồ sơ đầy đủ, không trùng lặp với hệ thống", ok: cb.completeness >= 85 },
  ];
  const passCount = checks.filter(c => c.ok).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-[520px] rounded-[16px] overflow-hidden shadow-2xl" style={{ background: "white" }}>
        <div className="p-5" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background: "rgba(88,28,220,0.3)" }}>
              <Brain className="size-5 text-[#a78bfa]" />
            </div>
            <div>
              <h3 className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>AI kiểm tra điều kiện</h3>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }}>Đối chiếu Luật TĐKT 2022 + NĐ 152/2025/NĐ-CP</p>
            </div>
            <button onClick={onClose} className="ml-auto size-8 rounded-lg flex items-center justify-center hover:bg-white/10">
              <X className="size-4 text-white/50" />
            </button>
          </div>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="size-8 text-[#7c3aed] animate-spin" />
              <p className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>Trợ lý AI đang phân tích hồ sơ...</p>
            </div>
          ) : (
            <>
              {/* Score */}
              <div className="flex items-center gap-4 p-4 rounded-[10px] mb-4" style={{ background: cb.aiScore >= 85 ? "#dcfce7" : cb.aiScore >= 75 ? "#fef3c7" : "#fee2e2" }}>
                <div className="text-[40px] leading-none" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: cb.aiScore >= 85 ? "#166534" : cb.aiScore >= 75 ? "#b45309" : "#c8102e" }}>
                  {cb.aiScore}
                </div>
                <div>
                  <div className="text-[13px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: "#0b1426" }}>
                    {cb.aiScore >= 90 ? "Rất cao — Ưu tiên đề nghị" : cb.aiScore >= 80 ? "Tốt — Đủ điều kiện" : "Trung bình — Cần bổ sung"}
                  </div>
                  <div className="text-[13px] text-[#635647]">Điểm AI đánh giá / 100 · {passCount}/{checks.length} điều kiện đạt</div>
                </div>
              </div>
              {/* Checks */}
              <div className="space-y-2 mb-4">
                {checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-[8px]" style={{ background: c.ok ? "#f0fdf4" : "#fff5f5" }}>
                    {c.ok ? <CheckCircle2 className="size-4 text-[#166534] shrink-0" /> : <XCircle className="size-4 text-[#c8102e] shrink-0" />}
                    <span className="text-[13px]" style={{ color: c.ok ? "#166534" : "#c8102e", fontFamily: "var(--font-sans)" }}>{c.label}</span>
                  </div>
                ))}
              </div>
              {/* Eligible for */}
              {cb.eligibleFor.length > 0 ? (
                <div className="p-3 rounded-[10px] border-2 border-[#86efac] mb-3" style={{ background: "#f0fdf4" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-[#166534]" />
                    <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Đủ điều kiện đề nghị</span>
                  </div>
                  {cb.eligibleFor.map(e => (
                    <div key={e} className="flex items-center gap-2 text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>
                      <ChevronRight className="size-3.5" />{e}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-[10px] border border-[#fca5a5] mb-3" style={{ background: "#fff5f5" }}>
                  <p className="text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)" }}>Chưa đủ điều kiện đề nghị danh hiệu thi đua.</p>
                </div>
              )}
              {cb.note && (
                <div className="p-3 rounded-[8px] flex items-start gap-2" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                  <AlertCircle className="size-3.5 text-[#8a6400] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>{cb.note}</p>
                </div>
              )}
              <button onClick={onClose} className="w-full mt-3 py-2.5 rounded-[8px] text-[13px] text-white"
                style={{ background: "#0b1426", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Đóng</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE DETAIL DRAWER
═══════════════════════════════════════════════════════════════ */
function ProfileDrawer({ cb, onClose, onAICheck }: { cb: CanBo; onClose: () => void; onAICheck: () => void }) {
  const [tab, setTab] = useState<"overview" | "awards" | "work" | "docs">("overview");
  const years = 2026 - cb.joinYear;

  return (
    <div className="fixed inset-0 z-40 flex" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="ml-auto h-full w-[600px] flex flex-col shadow-2xl overflow-hidden" style={{ background: "white" }}>
        {/* Header */}
        <div className="p-5 shrink-0" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="size-14 rounded-full flex items-center justify-center text-[18px] text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#1C5FBE,#0b1426)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {cb.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-[18px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{cb.name}</h2>
              <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)" }}>{cb.position} · {cb.unit}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans)" }}>{years} năm công tác</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <div className="h-full rounded-full" style={{ width: `${cb.completeness}%`, background: cb.completeness >= 90 ? "#4ade80" : cb.completeness >= 70 ? "#fbbf24" : "#f87171" }} />
                  </div>
                  <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>{cb.completeness}% hồ sơ</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-white/10 shrink-0">
              <X className="size-4 text-white/50" />
            </button>
          </div>
          {/* AI check button */}
          <button onClick={onAICheck}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] text-[13px] text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            <Brain className="size-4" /><Sparkles className="size-3.5" />
            Kiểm tra điều kiện khen thưởng (AI)
          </button>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-[#e2e8f0] shrink-0" style={{ background: "#ffffff" }}>
          {([["overview", "Tổng quan"], ["awards", `Thành tích (${cb.awards.length})`], ["work", "Quá trình"], ["docs", "Tài liệu"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className="flex-1 py-2.5 text-[13px] border-b-2 transition-colors"
              style={{ borderColor: tab === k ? "#1C5FBE" : "transparent", color: tab === k ? "#1C5FBE" : "#635647", fontFamily: "var(--font-sans)", fontWeight: tab === k ? 700 : 400 }}>
              {l}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5" style={{ background: "#ffffff" }}>
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden" style={{ background: "white" }}>
                <div className="px-4 py-2.5 border-b border-[#e2e8f0]" style={{ background: "#f4f7fb" }}>
                  <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Thông tin cơ bản</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3 text-[13px]">
                  {[
                    ["Họ và tên", cb.name], ["Chức vụ", cb.position],
                    ["Đơn vị", cb.unit], ["Ngày sinh", cb.dob],
                    ["Giới tính", cb.gender === "nam" ? "Nam" : "Nữ"], ["Năm vào ngành", String(cb.joinYear)],
                    ["Số điện thoại", cb.phone], ["Email", cb.email],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[13px] uppercase tracking-wider text-[#635647] mb-0.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{k}</div>
                      <div className="text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Eligible */}
              {cb.eligibleFor.length > 0 && (
                <div className="rounded-[10px] border-2 border-[#86efac] p-4" style={{ background: "#f0fdf4" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-[#166534]" />
                    <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>AI: Đủ điều kiện đề nghị</span>
                  </div>
                  {cb.eligibleFor.map(e => <div key={e} className="text-[13px] text-[#166534] flex items-center gap-1.5"><ChevronRight className="size-3.5" />{e}</div>)}
                </div>
              )}
              {/* Score */}
              <div className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background: "white" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Điểm thi đua năm 2026</span>
                  <span className="text-[24px] text-[#8a6400]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{cb.score}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#eef2f8" }}>
                  <div className="h-full rounded-full" style={{ width: `${cb.score}%`, background: `linear-gradient(to right,#8a6400,#f0c040)` }} />
                </div>
              </div>
            </div>
          )}
          {tab === "awards" && (
            <div className="space-y-3">
              {cb.awards.length === 0 && (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Award className="size-10 text-[#d1ccc0]" />
                  <p className="text-[13px] text-[#635647]">Chưa có thành tích được ghi nhận</p>
                </div>
              )}
              {cb.awards.map((a, i) => {
                const lc = LEVEL_CFG[a.level] ?? { color: "#635647", bg: "#eef2f8" };
                return (
                  <div key={i} className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background: "white" }}>
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: lc.bg }}>
                        <Award className="size-5" style={{ color: lc.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{a.type}</span>
                          <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background: lc.bg, color: lc.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>{a.level}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[13px] text-[#635647]">
                          <span>Năm {a.year}</span>
                          <span>·</span>
                          <code style={{ fontFamily: "JetBrains Mono, monospace" }}>{a.qd}</code>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-[#166534]"><CheckCircle2 className="size-3" />Đã xác nhận</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {tab === "work" && (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: "#e2e8f0" }} />
              <div className="space-y-4">
                {cb.workHistory.map((w, i) => (
                  <div key={i} className="flex gap-4 pl-11 relative">
                    <div className="absolute left-3.5 top-2 size-3 rounded-full border-2" style={{ background: i === 0 ? "#1C5FBE" : "white", borderColor: "#1C5FBE" }} />
                    <div className="flex-1 rounded-[10px] border border-[#e2e8f0] p-3" style={{ background: "white" }}>
                      <div className="text-[13px] text-[#0b1426] mb-0.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{w.chucVu}</div>
                      <div className="text-[13px] text-[#5a5040]">{w.donVi}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "JetBrains Mono, monospace" }}>{w.period}</span>
                        {w.phongTrao && (
                          <span className="text-[13px] text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)" }}>📌 {w.phongTrao}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "docs" && (
            <div className="space-y-2">
              {["Lý lịch trích ngang (06-BNV)", "Bằng khen gốc scan", "Quyết định bổ nhiệm", "Bảng điểm thi đua 3 năm gần nhất"].map(d => (
                <div key={d} className="flex items-center gap-3 p-3 rounded-[8px] border border-[#e2e8f0]" style={{ background: "white" }}>
                  <FileText className="size-4 text-[#1C5FBE]" />
                  <span className="flex-1 text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{d}</span>
                  <button className="flex items-center gap-1 text-[13px] text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)" }}>
                    <Download className="size-3.5" />Tải
                  </button>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] border-2 border-dashed border-[#d1d5db] text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                <Plus className="size-4" />Tải lên tài liệu mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function HoSoCanBoPage({ user }: { user: LoginUser }) {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CanBo | null>(null);
  const [aiTarget, setAiTarget] = useState<CanBo | null>(null);
  const [filterEligible, setFilterEligible] = useState(false);

  const visible = CAN_BO_LIST.filter(cb => {
    const ms = !search || cb.name.toLowerCase().includes(search.toLowerCase()) || cb.unit.toLowerCase().includes(search.toLowerCase()) || cb.position.toLowerCase().includes(search.toLowerCase());
    const me = !filterEligible || cb.eligibleFor.length > 0;
    return ms && me;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>
      {selected && <ProfileDrawer cb={selected} onClose={() => setSelected(null)} onAICheck={() => { setAiTarget(selected); }} />}
      {aiTarget && <AiEligibilityPanel cb={aiTarget} onClose={() => setAiTarget(null)} />}

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0] shrink-0" style={{ background: "white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <Users className="size-5 text-[#8a6400]" />
          </div>
          <div>
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Hồ sơ Cán bộ</h1>
            <p className="text-[13px] text-[#635647]">Hồ sơ thi đua · AI kiểm tra điều kiện · Lịch sử khen thưởng</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setFilterEligible(f => !f)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border text-[13px] transition-all"
              style={{ background: filterEligible ? "#dcfce7" : "white", borderColor: filterEligible ? "#166534" : "#e2e8f0", color: filterEligible ? "#166534" : "#5a5040", fontFamily: "var(--font-sans)", fontWeight: filterEligible ? 700 : 400 }}>
              <Sparkles className="size-3.5" />
              {filterEligible ? "Đủ điều kiện KT" : "Lọc: Đủ ĐK KT"}
            </button>
          </div>
        </div>
        {/* Stats row */}
        <div className="flex gap-3 mb-4">
          {[
            { l: "Tổng cán bộ", v: CAN_BO_LIST.length, c: "#0b1426", bg: "#f4f7fb" },
            { l: "Đủ điều kiện KT", v: CAN_BO_LIST.filter(c => c.eligibleFor.length > 0).length, c: "#166534", bg: "#dcfce7" },
            { l: "Hồ sơ đầy đủ ≥90%", v: CAN_BO_LIST.filter(c => c.completeness >= 90).length, c: "#1C5FBE", bg: "#ddeafc" },
            { l: "Cần bổ sung", v: CAN_BO_LIST.filter(c => c.completeness < 80).length, c: "#b45309", bg: "#fef3c7" },
          ].map(s => (
            <div key={s.l} className="flex items-center gap-2 px-3 py-1.5 rounded-[8px]" style={{ background: s.bg }}>
              <span className="text-[18px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: s.c }}>{s.v}</span>
              <span className="text-[13px]" style={{ color: s.c, fontFamily: "var(--font-sans)" }}>{s.l}</span>
            </div>
          ))}
        </div>
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#635647]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, đơn vị, chức vụ..."
            className="w-full pl-9 pr-3 border border-[#d1d5db] rounded-[8px] text-[13px] outline-none focus:border-[#1C5FBE]"
            style={{ height: 38, fontFamily: "var(--font-sans)" }} />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4">
          {visible.map(cb => {
            const hasEligible = cb.eligibleFor.length > 0;
            return (
              <div key={cb.id} className="rounded-[12px] border border-[#e2e8f0] overflow-hidden hover:shadow-md transition-all hover:border-[#1C5FBE]/40 cursor-pointer" style={{ background: "white" }}
                onClick={() => setSelected(cb)}>
                {/* Top bar */}
                <div className="h-1.5" style={{ background: hasEligible ? "linear-gradient(to right,#166534,#4ade80)" : "linear-gradient(to right,#d1d5db,#e5e7eb)" }} />
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="size-12 rounded-full flex items-center justify-center text-[14px] text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#1C5FBE,#0b1426)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                      {cb.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{cb.name}</h3>
                      <p className="text-[13px] text-[#5a5040] truncate">{cb.position}</p>
                      <p className="text-[13px] text-[#635647] truncate">{cb.unit}</p>
                    </div>
                    {hasEligible && <Sparkles className="size-4 text-[#166534] shrink-0" />}
                  </div>
                  {/* Score + completeness */}
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 rounded-[6px] p-2 text-center" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                      <div className="text-[18px] text-[#8a6400]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{cb.score}</div>
                      <div className="text-[13px] text-[#635647] uppercase tracking-wider">Điểm TĐ</div>
                    </div>
                    <div className="flex-1 rounded-[6px] p-2" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] text-[#635647] uppercase tracking-wider">Hồ sơ</span>
                        <span className="text-[13px]" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: cb.completeness >= 90 ? "#166534" : cb.completeness >= 70 ? "#b45309" : "#c8102e" }}>{cb.completeness}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${cb.completeness}%`, background: cb.completeness >= 90 ? "#166534" : cb.completeness >= 70 ? "#b45309" : "#c8102e" }} />
                      </div>
                    </div>
                  </div>
                  {/* Awards */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {cb.awards.slice(0, 2).map((a, i) => {
                      const lc = LEVEL_CFG[a.level] ?? { color: "#635647", bg: "#eef2f8" };
                      return (
                        <span key={i} className="text-[13px] px-1.5 py-0.5 rounded" style={{ background: lc.bg, color: lc.color, fontFamily: "var(--font-sans)" }}>
                          {a.type.split(" ").slice(0, 3).join(" ")} {a.year}
                        </span>
                      );
                    })}
                    {cb.awards.length === 0 && <span className="text-[13px] text-[#d1ccc0]">Chưa có thành tích</span>}
                  </div>
                  {/* AI check button */}
                  <button onClick={e => { e.stopPropagation(); setAiTarget(cb); }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] border text-[13px] hover:border-[#7c3aed] hover:text-[#7c3aed] transition-colors"
                    style={{ borderColor: "#e2e8f0", color: "#635647", fontFamily: "var(--font-sans)" }}>
                    <Brain className="size-3.5" />Kiểm tra điều kiện AI
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {visible.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <User className="size-12 text-[#d1ccc0]" />
            <p className="text-[13px] text-[#635647]">Không tìm thấy cán bộ phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}