import { useState } from "react";
import {
  FileText, Download, Eye, Printer, CheckCircle2,
  Calendar, BarChart2, Users, Award, Clock, Building2,
  Loader2, FileSpreadsheet, File, ChevronRight, Settings,
  Filter, AlertCircle, Star, Sparkles, RefreshCw, X,
  TrendingUp, Shield, BookOpen,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface ReportTemplate {
  id: string;
  code: string;
  title: string;
  desc: string;
  canCu: string;
  icon: typeof FileText;
  color: string;
  bg: string;
  roles: ("quản trị hệ thống" | "lãnh đạo cấp cao" | "hội đồng" | "lãnh đạo đơn vị" | "cá nhân")[];
  outputs: ("pdf" | "excel" | "word")[];
  params: ReportParam[];
}
interface ReportParam {
  key: string;
  label: string;
  type: "select" | "daterange" | "multiselect" | "text";
  options?: string[];
  required: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   REPORT TEMPLATES
═══════════════════════════════════════════════════════════════ */
const REPORTS: ReportTemplate[] = [
  {
    id: "bc-tdkt-tong-ket",
    code: "Mẫu 08a/08b",
    title: "Báo cáo Tổng kết TĐKT hàng năm",
    desc: "BC tổng hợp kết quả thi đua khen thưởng theo Mẫu 08a (cá nhân) và 08b (tập thể) ban hành kèm TT 15/2025/TT-BNV",
    canCu: "Điều 34 TT 15/2025/TT-BNV",
    icon: BarChart2,
    color: "#1C5FBE",
    bg: "#ddeafc",
    roles: ["quản trị hệ thống", "lãnh đạo cấp cao", "hội đồng", "lãnh đạo đơn vị"],
    outputs: ["pdf", "excel", "word"],
    params: [
      { key: "nam", label: "Năm báo cáo", type: "select", options: ["2026", "2025", "2024", "2023"], required: true },
      { key: "donVi", label: "Đơn vị", type: "select", options: ["Toàn tỉnh", "Sở GD&ĐT", "Sở Y tế", "VP Tỉnh ủy", "Công an Tỉnh"], required: true },
      { key: "loaiHinh", label: "Loại hình", type: "select", options: ["Cả hai", "Cá nhân", "Tập thể"], required: false },
    ],
  },
  {
    id: "bc-de-nghi-nha-nuoc",
    code: "Mẫu 09",
    title: "BC Thành tích đề nghị khen thưởng Nhà nước",
    desc: "Hồ sơ tổng hợp tóm tắt thành tích đề nghị Huân chương/Bằng khen Thủ tướng/Chính phủ, kèm danh sách trích ngang",
    canCu: "Điều 42 NĐ 152/2025/NĐ-CP + Mẫu 09 TT 15/2025/TT-BNV",
    icon: Award,
    color: "#c8102e",
    bg: "#fee2e2",
    roles: ["quản trị hệ thống", "lãnh đạo cấp cao", "hội đồng"],
    outputs: ["pdf", "word"],
    params: [
      { key: "loaiHuanChuong", label: "Loại khen thưởng", type: "select", options: ["Huân chương LĐ hạng Ba", "Huân chương LĐ hạng Nhì", "Bằng khen Thủ tướng", "Bằng khen Chính phủ"], required: true },
      { key: "kyXet", label: "Kỳ xét", type: "select", options: ["Kỳ 1/2026", "Kỳ 2/2025", "Kỳ 1/2025"], required: true },
    ],
  },
  {
    id: "bc-phan-loai",
    code: "Mẫu 10",
    title: "BC Phân loại danh hiệu theo đơn vị",
    desc: "Thống kê số lượng danh hiệu TĐKT theo từng đơn vị, phân loại cấp khen, so sánh năm trước",
    canCu: "Điều 35 TT 15/2025/TT-BNV",
    icon: BarChart2,
    color: "#166534",
    bg: "#dcfce7",
    roles: ["quản trị hệ thống", "lãnh đạo cấp cao", "hội đồng"],
    outputs: ["pdf", "excel"],
    params: [
      { key: "tuNam", label: "Từ năm", type: "select", options: ["2026", "2025", "2024", "2023"], required: true },
      { key: "denNam", label: "Đến năm", type: "select", options: ["2026", "2025", "2024", "2023"], required: true },
      { key: "nhom", label: "Nhóm đơn vị", type: "select", options: ["Tất cả", "Sở/Ban/Ngành", "UBND Huyện/TP", "Doanh nghiệp"], required: false },
    ],
  },
  {
    id: "bc-sla",
    code: "Mẫu 11",
    title: "BC Tiến độ xử lý hồ sơ (SLA)",
    desc: "Báo cáo tỷ lệ xử lý đúng hạn, các vi phạm SLA theo từng giai đoạn quy trình, so sánh đơn vị",
    canCu: "Điều 36 TT 15/2025/TT-BNV",
    icon: Clock,
    color: "#b45309",
    bg: "#fef3c7",
    roles: ["quản trị hệ thống", "hội đồng"],
    outputs: ["pdf", "excel"],
    params: [
      { key: "quy", label: "Quý/kỳ", type: "select", options: ["Q1 2026", "Q4 2025", "Q3 2025", "Q2 2025"], required: true },
      { key: "boPhan", label: "Bộ phận", type: "select", options: ["Toàn bộ", "Phòng TĐKT", "Hội đồng", "Lãnh đạo"], required: false },
    ],
  },
  {
    id: "bc-lich-su",
    code: "Mẫu 12",
    title: "BC Lịch sử khen thưởng cá nhân",
    desc: "Trích xuất toàn bộ lịch sử khen thưởng của một cán bộ/đơn vị dưới dạng hồ sơ lý lịch TĐKT chính thức",
    canCu: "Điều 37 TT 15/2025/TT-BNV",
    icon: Users,
    color: "#7c3aed",
    bg: "#f5f3ff",
    roles: ["quản trị hệ thống", "hội đồng", "lãnh đạo đơn vị", "cá nhân"],
    outputs: ["pdf", "word"],
    params: [
      { key: "maCanBo", label: "Cán bộ / Đơn vị", type: "text", required: true },
      { key: "tuNam", label: "Từ năm", type: "select", options: ["2026", "2025", "2024", "2023", "2020", "Tất cả"], required: false },
    ],
  },
  {
    id: "bc-phong-trao",
    code: "Mẫu 13",
    title: "BC Kết quả Phong trào Thi đua",
    desc: "Báo cáo tổng kết một phong trào: số tham gia, % hoàn thành chỉ tiêu, bảng xếp hạng, đề xuất khen thưởng",
    canCu: "Điều 18 Luật TĐKT 2022",
    icon: Star,
    color: "#8a6400",
    bg: "#ffffff",
    roles: ["quản trị hệ thống", "lãnh đạo cấp cao", "hội đồng"],
    outputs: ["pdf", "excel"],
    params: [
      { key: "phongTrao", label: "Phong trào", type: "select", options: ["Lao động giỏi 2026", "Sáng tạo KT 2025–2026", "Đơn vị văn hóa 2025"], required: true },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   REPORT PREVIEW MOCK
═══════════════════════════════════════════════════════════════ */
function ReportPreview({ report, params, onClose }: { report: ReportTemplate; params: Record<string, string>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-[760px] max-h-[90vh] flex flex-col rounded-[16px] overflow-hidden shadow-2xl" style={{ background: "white" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e2e8f0]" style={{ background: "#ffffff" }}>
          <div className="size-9 rounded-[8px] flex items-center justify-center" style={{ background: report.bg }}>
            <report.icon className="size-5" style={{ color: report.color }} />
          </div>
          <div className="flex-1">
            <span className="text-[13px]" style={{ color: report.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>{report.code}</span>
            <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{report.title}</h3>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-[#eef2f8]">
            <X className="size-4 text-[#635647]" />
          </button>
        </div>
        {/* Page mock */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[600px] mx-auto border border-[#e2e8f0] rounded-[8px] p-8 space-y-5" style={{ background: "white" }}>
            {/* Document header */}
            <div className="text-center border-b border-[#e2e8f0] pb-5">
              <div className="text-[13px] uppercase tracking-widest text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)" }}>UBND TỈNH ĐỒNG NAI</div>
              <div className="text-[13px] text-[#635647] mb-3">Số: {report.code}/BC-TĐKT/{params.nam || "2026"}</div>
              <h2 className="text-[18px] text-[#0b1426] uppercase" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{report.title}</h2>
              <div className="text-[13px] text-[#5a5040] mt-2">
                {Object.entries(params).map(([k, v]) => v).filter(Boolean).join(" · ")}
              </div>
            </div>
            {/* Mock content */}
            <div className="space-y-3 text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
              <p className="font-bold text-[#0b1426]">I. KẾT QUẢ TỔNG HỢP</p>
              <div className="grid grid-cols-3 gap-3">
                {[["Tổng hồ sơ", "124"], ["Đã hoàn thành", "112"], ["Tỷ lệ đúng hạn", "97.2%"]].map(([k, v]) => (
                  <div key={k} className="rounded-[8px] p-3 text-center" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{v}</div>
                    <div className="text-[13px] text-[#635647]">{k}</div>
                  </div>
                ))}
              </div>
              <p className="font-bold text-[#0b1426] pt-2">II. DANH SÁCH CHI TIẾT</p>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[#eef2f8]">
                  <span className="text-[#635647] w-5">{i}.</span>
                  <div className="flex-1">
                    <div className="h-2 rounded bg-[#e2e8f0] w-3/4 mb-1" />
                    <div className="h-2 rounded bg-[#eef2f8] w-1/2" />
                  </div>
                  <span className="text-[13px] text-[#6b5e47]">Page {i}</span>
                </div>
              ))}
              <p className="text-[13px] text-[#6b5e47] italic text-center pt-4">— Xem đầy đủ nội dung trong file xuất —</p>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e2e8f0] flex gap-2" style={{ background: "#ffffff" }}>
          {report.outputs.map(fmt => {
            const cfg = { pdf: { icon: File, l: "Xuất PDF", c: "#c8102e" }, excel: { icon: FileSpreadsheet, l: "Xuất Excel", c: "#166534" }, word: { icon: FileText, l: "Xuất Word", c: "#1C5FBE" } }[fmt];
            return (
              <button key={fmt} className="flex items-center gap-2 px-4 py-2 rounded-[6px] text-[13px] text-white"
                style={{ background: cfg.c, fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                <cfg.icon className="size-4" />{cfg.l}
              </button>
            );
          })}
          <button onClick={onClose} className="ml-auto px-4 py-2 rounded-[6px] border border-[#e2e8f0] text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REPORT CARD
═══════════════════════════════════════════════════════════════ */
function ReportCard({ report, user, onGenerate }: { report: ReportTemplate; user: LoginUser; onGenerate: () => void }) {
  const [params, setParams] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const canAccess = report.roles.includes(user.role);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    setGenerating(false);
    setDone(true);
    onGenerate();
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <div className="rounded-[12px] border border-[#e2e8f0] overflow-hidden" style={{ background: "white", opacity: canAccess ? 1 : 0.5 }}>
      {/* Top accent */}
      <div className="h-1" style={{ background: `linear-gradient(to right,${report.color},${report.color}66)` }} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="size-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: report.bg }}>
            <report.icon className="size-5" style={{ color: report.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[13px] px-2 py-0.5 rounded" style={{ background: report.bg, color: report.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>{report.code}</span>
              {!canAccess && <span className="text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)" }}>Không có quyền</span>}
            </div>
            <h3 className="text-[14px] text-[#0b1426] leading-snug" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{report.title}</h3>
          </div>
        </div>
        <p className="text-[13px] text-[#635647] mb-3 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>{report.desc}</p>
        <div className="flex items-center gap-1.5 text-[13px] text-[#5a5040] mb-4" style={{ fontFamily: "var(--font-sans)" }}>
          <Shield className="size-3.5 text-[#1C5FBE]" />{report.canCu}
        </div>
        {/* Params */}
        {canAccess && (
          <div className="space-y-2 mb-4">
            {report.params.map(p => (
              <div key={p.key}>
                <label className="block text-[13px] uppercase tracking-wider text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  {p.label}{p.required && <span className="text-[#c8102e] ml-0.5">*</span>}
                </label>
                {p.type === "select" ? (
                  <select value={params[p.key] || ""} onChange={e => setParams(pr => ({ ...pr, [p.key]: e.target.value }))}
                    className="w-full px-2 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none focus:border-[#1C5FBE]"
                    style={{ height: 34, fontFamily: "var(--font-sans)" }}>
                    <option value="">-- Chọn {p.label} --</option>
                    {p.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input value={params[p.key] || ""} onChange={e => setParams(pr => ({ ...pr, [p.key]: e.target.value }))}
                    placeholder={`Nhập ${p.label.toLowerCase()}...`}
                    className="w-full px-2 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none focus:border-[#1C5FBE]"
                    style={{ height: 34, fontFamily: "var(--font-sans)" }} />
                )}
              </div>
            ))}
          </div>
        )}
        {/* Output format badges */}
        <div className="flex items-center gap-1.5 mb-4">
          {report.outputs.map(fmt => {
            const cfg = { pdf: { l: "PDF", c: "#c8102e" }, excel: { l: "Excel", c: "#166534" }, word: { l: "Word", c: "#1C5FBE" } }[fmt];
            return <span key={fmt} className="text-[13px] px-1.5 py-0.5 rounded border" style={{ color: cfg.c, borderColor: cfg.c + "40", background: cfg.c + "10", fontFamily: "var(--font-sans)", fontWeight: 700 }}>{cfg.l}</span>;
          })}
        </div>
        {/* Actions */}
        {canAccess && (
          <div className="flex gap-2">
            <button onClick={handleGenerate} disabled={generating || done}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] text-[13px] text-white transition-all"
              style={{ background: done ? "#166534" : report.color, fontFamily: "var(--font-sans)", fontWeight: 600 }}>
              {generating ? <Loader2 className="size-4 animate-spin" /> : done ? <CheckCircle2 className="size-4" /> : <Download className="size-4" />}
              {generating ? "Đang tạo..." : done ? "Đã tạo xong!" : "Tạo báo cáo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function BaoCaoPage({ user }: { user: LoginUser }) {
  const { theme } = useTheme();
  const [preview, setPreview] = useState<ReportTemplate | null>(null);
  const [filter, setFilter] = useState("all");
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const filtered = REPORTS.filter(r => filter === "all" || r.roles.includes(filter as any));

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>
      {preview && (
        <ReportPreview report={preview} params={{}} onClose={() => setPreview(null)} />
      )}
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0] shrink-0" style={{ background: "white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <FileText className="size-5 text-[#8a6400]" />
          </div>
          <div>
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Báo cáo tổng hợp</h1>
            <p className="text-[13px] text-[#635647]">{REPORTS.length} mẫu báo cáo · PDF / Excel / Word · Căn cứ TT 15/2025/TT-BNV</p>
          </div>
          <div className="ml-auto">
            {lastGenerated && (
              <div className="flex items-center gap-2 text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>
                <CheckCircle2 className="size-4" />Đã tạo lúc {lastGenerated}
              </div>
            )}
          </div>
        </div>
        {/* Stats */}
        <div className="flex gap-3 mb-4">
          {[
            { l: "Báo cáo định kỳ", v: "3", c: "#1C5FBE", bg: "#ddeafc" },
            { l: "Báo cáo chuyên đề", v: "3", c: "#166534", bg: "#dcfce7" },
            { l: "Xuất lần cuối", v: "Hôm nay", c: "#8a6400", bg: "#ffffff" },
            { l: "Tổng lần xuất (tháng)", v: "47", c: "#7c3aed", bg: "#f5f3ff" },
          ].map(s => (
            <div key={s.l} className="flex items-center gap-2 px-3 py-1.5 rounded-[8px]" style={{ background: s.bg }}>
              <span className="text-[18px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: s.c }}>{s.v}</span>
              <span className="text-[13px]" style={{ color: s.c, fontFamily: "var(--font-sans)" }}>{s.l}</span>
            </div>
          ))}
        </div>
        {/* Filter */}
        <div className="flex gap-1">
          {[["all", "Tất cả"], ["admin", "Admin"], ["leader", "Lãnh đạo"], ["council", "Hội đồng"], ["manager", "Đơn vị"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className="px-3 py-1.5 rounded-[6px] border text-[13px] transition-all"
              style={{ background: filter === k ? "#0b1426" : "white", color: filter === k ? "white" : "#5a5040", borderColor: filter === k ? "#0b1426" : "#e2e8f0", fontFamily: "var(--font-sans)", fontWeight: filter === k ? 700 : 400 }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-5">
          {filtered.map(r => (
            <ReportCard key={r.id} report={r} user={user}
              onGenerate={() => setLastGenerated(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }))} />
          ))}
        </div>
        {/* Bottom note */}
        <div className="mt-6 p-4 rounded-[10px] border border-[#e2e8f0] flex items-start gap-3" style={{ background: "white" }}>
          <AlertCircle className="size-4 text-[#1C5FBE] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#5a5040] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
            Tất cả báo cáo được tạo tự động từ dữ liệu hệ thống, đảm bảo tính nhất quán và đúng mẫu theo quy định.
            Báo cáo PDF được ký số CA trước khi gửi cơ quan cấp trên.
            <span className="text-[#1C5FBE] ml-1">Lưu ý: Vui lòng kiểm tra dữ liệu đầu vào trước khi xuất báo cáo chính thức.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
