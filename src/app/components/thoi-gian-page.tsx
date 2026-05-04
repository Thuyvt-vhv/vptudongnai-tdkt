import { useState, useEffect } from "react";
import {
  Clock, Activity, LogIn, LogOut, FileText, Award,
  Shield, Edit3, Eye, CheckCircle2, AlertTriangle,
  Download, Filter, Search, Calendar, User,
  BarChart2, TrendingUp, Zap, Cpu, Server,
  ChevronDown, Building2, RefreshCw, Star,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type ActionType =
  | "login" | "logout" | "view" | "create" | "edit" | "approve"
  | "sign" | "export" | "ai" | "system";

interface ActivityEntry {
  id: string;
  time: string;
  timestamp: number;
  type: ActionType;
  title: string;
  detail: string;
  module: string;
  ip?: string;
  duration?: string; // session duration or action time
}

interface SessionDay {
  date: string;
  entries: ActivityEntry[];
  totalTime: string;
  activeTime: string;
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const ACTIVITY_BY_ROLE: Record<string, ActivityEntry[]> = {
  "lãnh đạo cấp cao": [
    { id:"a1", time:"08:17", timestamp: Date.now() - 3*60*60*1000, type:"login", title:"Đăng nhập hệ thống", detail:"Đăng nhập thành công từ trình duyệt Chrome 124", module:"Hệ thống", ip:"203.113.4.82", duration:"" },
    { id:"a2", time:"08:22", timestamp: Date.now() - 2.9*60*60*1000, type:"view", title:"Xem Bảng điều hành", detail:"Xem tổng quan 47 hồ sơ, 8 SLA cảnh báo", module:"Bảng điều hành", duration:"5 phút" },
    { id:"a3", time:"08:27", timestamp: Date.now() - 2.8*60*60*1000, type:"sign", title:"Ký số NS-2026-0140", detail:"Ký số CA thành công · Quyết định CSTĐT Nguyễn Văn Minh", module:"Ký số & Phê duyệt", duration:"2 phút" },
    { id:"a4", time:"08:31", timestamp: Date.now() - 2.6*60*60*1000, type:"sign", title:"Ký số NS-2026-0141", detail:"Ký số CA thành công · Bằng khen UBND Tỉnh – Lê Thị Hương", module:"Ký số & Phê duyệt", duration:"1 phút" },
    { id:"a5", time:"09:00", timestamp: Date.now() - 2.3*60*60*1000, type:"view", title:"Xem Hội đồng xét duyệt", detail:"Đọc biên bản phiên HD-2026-03 (18 trang)", module:"Hội đồng xét duyệt", duration:"22 phút" },
    { id:"a6", time:"09:45", timestamp: Date.now() - 1.5*60*60*1000, type:"approve", title:"Phê duyệt phong trào mới", detail:"Duyệt Phong trào Sáng tạo CNTT 2026 – 42 đơn vị tham gia", module:"Phong trào thi đua", duration:"8 phút" },
    { id:"a7", time:"10:15", timestamp: Date.now() - 1*60*60*1000, type:"ai", title:"Hỏi Trợ lý AI", detail:"Câu hỏi: \"Điều kiện đề nghị Huân chương LĐ hạng Nhì là gì?\"", module:"Trợ lý AI", duration:"3 phút" },
    { id:"a8", time:"10:42", timestamp: Date.now() - 0.5*60*60*1000, type:"export", title:"Xuất báo cáo tháng 4", detail:"Xuất Mẫu 08a/08b (PDF) – 47 hồ sơ · 2.3MB", module:"Báo cáo tổng hợp", duration:"< 1 phút" },
    { id:"a9", time:"11:05", timestamp: Date.now() - 10*60*1000, type:"view", title:"Xem SLA Monitor", detail:"Kiểm tra 2 vi phạm SLA: NS-2026-0147, NS-2026-0142", module:"SLA Monitor", duration:"7 phút" },
  ],
  "hội đồng": [
    { id:"c1", time:"07:55", timestamp: Date.now() - 4*60*60*1000, type:"login", title:"Đăng nhập hệ thống", detail:"Đăng nhập thành công", module:"Hệ thống", ip:"118.68.91.23" },
    { id:"c2", time:"08:05", timestamp: Date.now() - 3.8*60*60*1000, type:"view", title:"Xem hồ sơ NS-2026-0153", detail:"Đọc hồ sơ CSTĐCS Vũ Đức Khoa đầy đủ", module:"Đề nghị khen thưởng", duration:"18 phút" },
    { id:"c3", time:"08:23", timestamp: Date.now() - 3.4*60*60*1000, type:"edit", title:"Chấm điểm NS-2026-0153", detail:"Nhập điểm: Kỷ luật 95, Hiệu quả 91, Sáng tạo 88 · Đề nghị: Đạt", module:"Chấm điểm & Bình xét", duration:"12 phút" },
    { id:"c4", time:"08:40", timestamp: Date.now() - 3.2*60*60*1000, type:"view", title:"Xem hồ sơ NS-2026-0154", detail:"Đọc hồ sơ Bằng khen UBND Tỉnh – Trần Thị Hoa", module:"Đề nghị khen thưởng", duration:"14 phút" },
    { id:"c5", time:"09:15", timestamp: Date.now() - 2.7*60*60*1000, type:"ai", title:"AI phát hiện trùng lặp", detail:"AI báo: NS-2026-0152 trùng 89% NS-2025-0234. Đánh dấu cần xem xét.", module:"Trợ lý AI", duration:"5 phút" },
    { id:"c6", time:"10:00", timestamp: Date.now() - 2*60*60*1000, type:"approve", title:"Biểu quyết NS-2026-0141", detail:"Bỏ phiếu: Đồng ý · Kết quả hội đồng: 7/9 thông qua", module:"Hội đồng xét duyệt", duration:"3 phút" },
    { id:"c7", time:"10:30", timestamp: Date.now() - 1.5*60*60*1000, type:"export", title:"Tải biên bản phiên HD-2026-03", detail:"File PDF biên bản 8 trang đã tải về", module:"Hội đồng xét duyệt", duration:"< 1 phút" },
  ],
  "lãnh đạo đơn vị": [
    { id:"m1", time:"08:30", timestamp: Date.now() - 3*60*60*1000, type:"login", title:"Đăng nhập hệ thống", detail:"Đăng nhập thành công", module:"Hệ thống", ip:"192.168.1.44" },
    { id:"m2", time:"08:35", timestamp: Date.now() - 2.9*60*60*1000, type:"create", title:"Tạo hồ sơ NS-2026-0160", detail:"Khởi tạo hồ sơ CSTĐCS Nguyễn Đình Hùng – Sở TN&MT", module:"Đề nghị khen thưởng", duration:"20 phút" },
    { id:"m3", time:"09:00", timestamp: Date.now() - 2.5*60*60*1000, type:"view", title:"Xem bảng xếp hạng", detail:"Đơn vị xếp hạng 3/18 – Phong trào Lao động giỏi 2026", module:"Bảng xếp hạng", duration:"5 phút" },
    { id:"m4", time:"09:10", timestamp: Date.now() - 2.3*60*60*1000, type:"ai", title:"AI gợi ý 3 cán bộ đủ ĐK", detail:"Xem kết quả AI: Lê Thị Hoa, Trần Văn Bình, Nguyễn Minh Quang", module:"Hồ sơ cán bộ", duration:"10 phút" },
    { id:"m5", time:"09:45", timestamp: Date.now() - 2*60*60*1000, type:"edit", title:"Cập nhật tiến độ phong trào", detail:"Cập nhật tiến độ T4/2026: Kỷ luật 94%, Hiệu quả 88%", module:"Phong trào thi đua", duration:"7 phút" },
    { id:"m6", time:"10:20", timestamp: Date.now() - 1.5*60*60*1000, type:"view", title:"Xem lịch sử khen thưởng", detail:"Tra cứu lịch sử 5 năm của đơn vị (2021–2026)", module:"Lịch sử khen thưởng", duration:"8 phút" },
  ],
  "cá nhân": [
    { id:"u1", time:"09:00", timestamp: Date.now() - 3*60*60*1000, type:"login", title:"Đăng nhập hệ thống", detail:"Đăng nhập thành công", module:"Hệ thống", ip:"27.65.144.12" },
    { id:"u2", time:"09:05", timestamp: Date.now() - 2.9*60*60*1000, type:"view", title:"Xem tiến độ hồ sơ", detail:"NS-2026-0148: Đang thẩm định · Bước 3/5", module:"Đề nghị khen thưởng", duration:"5 phút" },
    { id:"u3", time:"09:15", timestamp: Date.now() - 2.7*60*60*1000, type:"view", title:"Xem Bảng xếp hạng", detail:"Cá nhân xếp thứ 12/87 – Phong trào Lao động giỏi 2026", module:"Bảng xếp hạng", duration:"4 phút" },
    { id:"u4", time:"09:30", timestamp: Date.now() - 2.5*60*60*1000, type:"edit", title:"Cập nhật tiến độ thi đua", detail:"Cập nhật chỉ tiêu tháng 4: Hoàn thành 94%", module:"Phong trào thi đua", duration:"6 phút" },
    { id:"u5", time:"10:00", timestamp: Date.now() - 2*60*60*1000, type:"view", title:"Đọc quyết định khen thưởng", detail:"Xem quyết định QĐ-2026-0088 – CSTĐ cơ sở năm 2025", module:"Quyết định khen thưởng", duration:"5 phút" },
  ],
  "quản trị hệ thống": [
    { id:"ad1", time:"07:30", timestamp: Date.now() - 5*60*60*1000, type:"login", title:"Đăng nhập hệ thống", detail:"Đăng nhập Admin thành công · MFA xác thực", module:"Hệ thống", ip:"10.0.0.1" },
    { id:"ad2", time:"07:35", timestamp: Date.now() - 4.9*60*60*1000, type:"system", title:"Kiểm tra Health Dashboard", detail:"CPU 34%, RAM 68%, SLA 97.2% – Tất cả bình thường", module:"Hệ thống", duration:"10 phút" },
    { id:"ad3", time:"07:50", timestamp: Date.now() - 4.6*60*60*1000, type:"view", title:"Review Audit Log", detail:"Xem 247 sự kiện trong 24h qua – 2 cảnh báo bảo mật", module:"Audit Log", duration:"15 phút" },
    { id:"ad4", time:"08:15", timestamp: Date.now() - 4.2*60*60*1000, type:"edit", title:"Cấu hình SLA mới", detail:"Cập nhật SLA Ký số: 3 ngày → 2 ngày làm việc", module:"Cấu hình đơn vị", duration:"5 phút" },
    { id:"ad5", time:"08:30", timestamp: Date.now() - 4*60*60*1000, type:"system", title:"Chặn IP nghi ngờ", detail:"IP 203.0.1.55 – 5 lần đăng nhập thất bại. Đã block.", module:"Hệ thống", duration:"< 1 phút" },
    { id:"ad6", time:"09:00", timestamp: Date.now() - 3.5*60*60*1000, type:"create", title:"Thêm tài khoản mới", detail:"Tạo 3 tài khoản: Sở TN&MT (2 manager, 1 user)", module:"Phân quyền", duration:"12 phút" },
    { id:"ad7", time:"10:00", timestamp: Date.now() - 2.5*60*60*1000, type:"export", title:"Xuất Audit Report tháng 4", detail:"PDF 48 trang · 1.8MB · Gửi tới Ban Bí thư", module:"Audit Log", duration:"2 phút" },
    { id:"ad8", time:"10:30", timestamp: Date.now() - 2*60*60*1000, type:"view", title:"Xem SLA Monitor", detail:"Tổng hợp vi phạm: 2 case critical, 3 warning", module:"SLA Monitor", duration:"8 phút" },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   ACTION HELPERS
═══════════════════════════════════════════════════════════════ */
const ACTION_CFG: Record<ActionType, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  login:   { label:"Đăng nhập",  color:"#166534", bg:"#dcfce7", icon:LogIn       },
  logout:  { label:"Đăng xuất",  color:"#635647", bg:"#f4f7fb", icon:LogOut      },
  view:    { label:"Xem",        color:"#1C5FBE", bg:"#ddeafc", icon:Eye         },
  create:  { label:"Tạo mới",    color:"#8a6400", bg:"#ffffff", icon:FileText    },
  edit:    { label:"Chỉnh sửa",  color:"#b45309", bg:"#fef3c7", icon:Edit3       },
  approve: { label:"Phê duyệt",  color:"#166534", bg:"#dcfce7", icon:CheckCircle2},
  sign:    { label:"Ký số",      color:"#1C5FBE", bg:"#ddeafc", icon:Award       },
  export:  { label:"Xuất file",  color:"#7c3aed", bg:"#f5f3ff", icon:Download    },
  ai:      { label:"Dùng AI",    color:"#7c3aed", bg:"#f5f3ff", icon:Zap         },
  system:  { label:"Hệ thống",   color:"#b45309", bg:"#fef3c7", icon:Server      },
};

/* ═══════════════════════════════════════════════════════════════
   ACTIVITY TIMELINE ITEM
═══════════════════════════════════════════════════════════════ */
function ActivityItem({ entry, isLast }: { entry: ActivityEntry; isLast: boolean }) {
  const cfg = ACTION_CFG[entry.type];
  const Icon = cfg.icon;
  return (
    <div className="flex gap-4 relative">
      {/* Line */}
      {!isLast && <div className="absolute left-[22px] top-11 bottom-0 w-px" style={{ background: "#e2e8f0" }} />}
      {/* Icon node */}
      <div className="size-11 rounded-full flex items-center justify-center shrink-0 border-2"
        style={{ background: cfg.bg, borderColor: "white", boxShadow: `0 0 0 2px ${cfg.color}30` }}>
        <Icon className="size-5" style={{ color: cfg.color }} />
      </div>
      {/* Content */}
      <div className="flex-1 pb-5 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                {entry.title}
              </span>
              <span className="text-[13px] px-1.5 py-0.5 rounded"
                style={{ background: cfg.bg, color: cfg.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                {cfg.label}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[13px] text-slate-900" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
              {entry.time}
            </div>
            {entry.duration && (
              <div className="text-[13px] text-slate-600">{entry.duration}</div>
            )}
          </div>
        </div>
        <p className="text-[13px] text-slate-700 leading-relaxed mb-1" style={{ fontFamily: "var(--font-sans)" }}>
          {entry.detail}
        </p>
        <div className="flex items-center gap-3 text-[13px] text-slate-600" style={{ fontFamily: "var(--font-sans)" }}>
          <span className="flex items-center gap-1"><Building2 className="size-3" />{entry.module}</span>
          {entry.ip && <span className="flex items-center gap-1"><Shield className="size-3" />IP: {entry.ip}</span>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEATMAP (Weekly)
═══════════════════════════════════════════════════════════════ */
function WeeklyHeatmap() {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const days = ["T2", "T3", "T4", "T5", "T6"];
  const heat: number[][] = days.map(() =>
    hours.map(() => Math.random())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] uppercase tracking-wider text-slate-700" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Mức độ hoạt động trong tuần</span>
      </div>
      <div className="flex gap-1">
        {/* Y-axis */}
        <div className="flex flex-col justify-between mr-1" style={{ height: 5 * 20 + 4 * 2 }}>
          {days.map(d => <span key={d} className="text-[13px] text-slate-600 h-5 flex items-center" style={{ fontFamily: "var(--font-sans)" }}>{d}</span>)}
        </div>
        {/* Grid */}
        <div className="flex gap-1 flex-col">
          {days.map((d, di) => (
            <div key={d} className="flex gap-1">
              {hours.map((h, hi) => {
                const v = heat[di][hi];
                return (
                  <div key={h} title={`${d} ${h}:00 – ${Math.round(v * 100)}% hoạt động`}
                    className="size-5 rounded-[3px] cursor-pointer hover:ring-2 hover:ring-[#1C5FBE]/40 transition-all"
                    style={{ background: v < 0.2 ? "#eef2f8" : v < 0.5 ? "#93c5fd" : v < 0.75 ? "#3b82f6" : "#1C5FBE" }} />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* X-axis */}
      <div className="flex gap-1 mt-1 ml-7">
        {hours.map(h => <span key={h} className="text-[13px] text-slate-600 w-5 text-center" style={{ fontFamily: "var(--font-sans)" }}>{h}</span>)}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[13px] text-slate-600">
        <span>Thấp</span>
        {["#eef2f8", "#93c5fd", "#3b82f6", "#1C5FBE"].map(c => <div key={c} className="size-3 rounded-[2px]" style={{ background: c }} />)}
        <span>Cao</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function ThoiGianPage({ user }: { user: LoginUser }) {
  const entries = ACTIVITY_BY_ROLE[user.role] ?? ACTIVITY_BY_ROLE["cá nhân"];
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ActionType | "all">("all");

  const filtered = entries.filter(e => {
    if (filterType !== "all" && e.type !== filterType) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.module.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Stats
  const loginCount = entries.filter(e => e.type === "login").length;
  const signCount = entries.filter(e => e.type === "sign").length;
  const createCount = entries.filter(e => e.type === "create").length;
  const aiCount = entries.filter(e => e.type === "ai").length;

  const sessionStart = entries[0]?.time ?? "08:00";
  const sessionLast = entries[entries.length - 1]?.time ?? "11:00";

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0] shrink-0" style={{ background: "white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <Activity className="size-5 text-[#8a6400]" />
          </div>
          <div>
            <h1 className="text-[18px] text-slate-900" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Thời gian hoạt động
            </h1>
            <p className="text-[13px] text-slate-700">
              {user.name} · Hôm nay {sessionStart}–{sessionLast} · {entries.length} hoạt động ghi nhận
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#e2e8f0] text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
              <Download className="size-3.5" />Xuất lịch sử
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[
            { label: "Phiên đăng nhập", v: loginCount, c: "#166534", bg: "#dcfce7", icon: LogIn },
            { label: "Hồ sơ ký số", v: signCount, c: "#1C5FBE", bg: "#ddeafc", icon: Award },
            { label: "Hồ sơ tạo mới", v: createCount, c: "#8a6400", bg: "#ffffff", icon: FileText },
            { label: "Phiên dùng AI", v: aiCount, c: "#7c3aed", bg: "#f5f3ff", icon: Zap },
            { label: "Tổng hoạt động", v: entries.length, c: "#0b1426", bg: "#f4f7fb", icon: BarChart2 },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-[10px] p-3 flex items-center gap-2.5" style={{ background: s.bg, border: `1px solid ${s.c}20` }}>
                <div className="size-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "white" }}>
                  <Icon className="size-4" style={{ color: s.c }} />
                </div>
                <div>
                  <div className="text-[18px] leading-none" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div className="text-[13px] uppercase tracking-wider text-slate-700">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter row */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-700" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm hoạt động..."
              className="pl-7 pr-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none focus:border-[#1C5FBE]"
              style={{ height: 32, width: 200, fontFamily: "var(--font-sans)" }} />
          </div>
          <div className="flex gap-1 flex-wrap">
            {(["all", "login", "view", "create", "edit", "approve", "sign", "export", "ai", "system"] as const).map(t => {
              if (t === "all") return (
                <button key="all" onClick={() => setFilterType("all")}
                  className="px-2.5 py-1 rounded-[5px] border text-[13px] transition-all"
                  style={{ background: filterType === "all" ? "#0b1426" : "white", color: filterType === "all" ? "white" : "#5a5040", borderColor: filterType === "all" ? "#0b1426" : "#e2e8f0", fontFamily: "var(--font-sans)", fontWeight: filterType === "all" ? 700 : 400 }}>
                  Tất cả
                </button>
              );
              const cfg = ACTION_CFG[t];
              return (
                <button key={t} onClick={() => setFilterType(filterType === t ? "all" : t)}
                  className="px-2.5 py-1 rounded-[5px] border text-[13px] transition-all"
                  style={{ background: filterType === t ? cfg.bg : "white", color: filterType === t ? cfg.color : "#5a5040", borderColor: filterType === t ? cfg.color : "#e2e8f0", fontFamily: "var(--font-sans)", fontWeight: filterType === t ? 700 : 400 }}>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-0">
          {/* Timeline */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl">
              {/* Date header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="size-9 rounded-full flex items-center justify-center" style={{ background: "#0b1426" }}>
                  <Calendar className="size-4 text-[#8a6400]" />
                </div>
                <div>
                  <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                    Thứ Sáu, 25/04/2026
                  </div>
                  <div className="text-[13px] text-slate-700">{filtered.length} hoạt động · Phiên làm việc: {sessionStart} → {sessionLast}</div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-2">
                  <Clock className="size-10 text-slate-400" />
                  <p className="text-[13px] text-slate-700">Không có hoạt động phù hợp</p>
                </div>
              ) : (
                <div>
                  {filtered.map((e, i) => (
                    <ActivityItem key={e.id} entry={e} isLast={i === filtered.length - 1} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: heatmap + summary */}
          <div className="w-72 shrink-0 border-l border-[#e2e8f0] p-5 space-y-5" style={{ background: "white" }}>
            {/* Weekly heatmap */}
            <div className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background: "#ffffff" }}>
              <WeeklyHeatmap />
            </div>

            {/* Module breakdown */}
            <div>
              <h3 className="text-[13px] uppercase tracking-wider text-slate-700 mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                Phân bổ theo module
              </h3>
              {Object.entries(
                entries.reduce<Record<string, number>>((acc, e) => {
                  acc[e.module] = (acc[e.module] || 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([mod, cnt]) => {
                const pct = Math.round((cnt / entries.length) * 100);
                return (
                  <div key={mod} className="mb-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[13px] text-slate-700 truncate" style={{ fontFamily: "var(--font-sans)" }}>{mod}</span>
                      <span className="text-[13px] text-slate-900 shrink-0" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>{cnt}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#eef2f8" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(to right,#1C5FBE,#4a90d9)" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Session info */}
            <div className="rounded-[10px] border border-[#e2e8f0] p-4 space-y-2.5" style={{ background: "#ffffff" }}>
              <h3 className="text-[13px] uppercase tracking-wider text-slate-700" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Phiên hiện tại</h3>
              {[
                ["Đăng nhập lúc", entries[0]?.time ?? "—"],
                ["Hoạt động cuối", entries[entries.length - 1]?.time ?? "—"],
                ["IP kết nối", entries[0]?.ip ?? "—"],
                ["Thiết bị", "Chrome 124, Windows 11"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-2">
                  <span className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>{k}</span>
                  <span className="text-[13px] text-slate-900 text-right" style={{ fontFamily: "JetBrains Mono, monospace" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
