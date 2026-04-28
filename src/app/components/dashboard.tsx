/**
 * dashboard.tsx · VPTU Đồng Nai v4 — "Hall of Fame" Edition
 * Palette: Navy #1C5FBE · Đỏ son #c8102e · Vàng #8a6400 · Paper #f4f7fb
 */
import { useState, useEffect } from "react";
import {
  Flame, TrendingUp, TrendingDown, Medal, AlertCircle, ArrowUpRight,
  FileSignature, Award, Clock, CheckCircle2, Sparkles, ChevronRight,
  Users, BarChart3, Shield, AlertTriangle, Star, Zap, Bell,
  ClipboardList, Gavel, Settings, Activity, Radio,
} from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import type { LoginUser } from "./login-page";

/* ─── Shared data ─────────────────────────────────────────── */
const trendData = [
  { m: "T9",  proposals: 88,  approved: 72 },
  { m: "T10", proposals: 95,  approved: 79 },
  { m: "T11", proposals: 102, approved: 86 },
  { m: "T12", proposals: 118, approved: 97 },
  { m: "T1",  proposals: 42,  approved: 30 },
  { m: "T2",  proposals: 58,  approved: 41 },
  { m: "T3",  proposals: 71,  approved: 55 },
  { m: "T4",  proposals: 63,  approved: 52 },
];
const units = [
  { name: "Sở Giáo dục & Đào tạo",  score: 94.2, prev: 91.8, medal: "gold",   rank: 1 },
  { name: "Sở Y tế",                 score: 92.6, prev: 92.1, medal: "gold",   rank: 2 },
  { name: "Sở Giao thông Vận tải",   score: 89.4, prev: 86.7, medal: "silver", rank: 3 },
  { name: "Sở Tài chính",            score: 87.1, prev: 88.3, medal: "silver", rank: 4 },
  { name: "Sở Nông nghiệp & PTNT",   score: 84.8, prev: 82.2, medal: "bronze", rank: 5 },
  { name: "Sở Công Thương",          score: 81.3, prev: 79.5, medal: null,     rank: 6 },
];
const pipeline = [
  { stage: "Đơn vị đề nghị",    count: 47, pct: 100, color: "#1C5FBE" },
  { stage: "Hội đồng sơ duyệt", count: 31, pct: 66,  color: "#7c6d2a" },
  { stage: "Thẩm định TĐKT",    count: 18, pct: 38,  color: "#c8102e" },
  { stage: "Phê duyệt",         count: 9,  pct: 19,  color: "#0f7a3e" },
];
const feed = [
  { type:"approve", text:"NS-2026-0147 được ký số bởi Lãnh đạo",         time:"2 phút",  color:"#0f7a3e" },
  { type:"submit",  text:"NS-2026-0155 vừa được Sở Y tế nộp lên",        time:"8 phút",  color:"#1C5FBE" },
  { type:"alert",   text:"SLA NS-2026-0142 còn 4 giờ — cần xử lý khẩn",  time:"15 phút", color:"#c8102e" },
  { type:"ai",      text:"AI phát hiện NS-2026-0151 trùng 89% với 2025",  time:"22 phút", color:"#8a6400" },
  { type:"approve", text:"Phong trào QII/2026 được phê duyệt chính thức", time:"1 giờ",   color:"#0f7a3e" },
  { type:"submit",  text:"Hội đồng hoàn tất biên bản phiên HD-2026-03",   time:"2 giờ",   color:"#1C5FBE" },
];

/* ─── Role config ─────────────────────────────────────────── */
const ROLE_CONFIG: Record<string, {
  subtitle: string; progress: number; progressLabel: string;
  kpis: { label: string; value: string; numVal: number; delta: string; up: boolean; icon: typeof Flame; accent: string; module: string; spark: number[] }[];
  tasks: { icon: typeof Flame; text: string; action: string; module: string; urgent?: boolean }[];
  quickStats: { label: string; value: string; color: string }[];
}> = {
  user: {
    subtitle: "Theo dõi tiến trình đề nghị khen thưởng của bạn",
    progress: 87, progressLabel: "Điểm thi đua",
    kpis: [
      { label:"Hồ sơ đang xử lý",  value:"2",    numVal:2,    delta:"+1",    up:true,  icon:FileSignature, accent:"#1C5FBE", module:"Đề nghị khen thưởng", spark:[1,2,1,3,2,1,2,2] },
      { label:"Đã được khen thưởng",value:"3",    numVal:3,    delta:"+1",    up:true,  icon:Award,         accent:"#8a6400", module:"Lịch sử khen thưởng", spark:[1,1,2,2,2,3,3,3] },
      { label:"Điểm thi đua",       value:"87.4", numVal:87.4, delta:"+2.1",  up:true,  icon:Star,          accent:"#c8102e", module:"Phong trào thi đua",  spark:[80,82,83,83,85,84,86,87] },
      { label:"Phong trào tham gia",value:"4",    numVal:4,    delta:"+1",    up:true,  icon:Flame,         accent:"#0f7a3e", module:"Phong trào thi đua",  spark:[2,2,3,3,3,4,3,4] },
    ],
    tasks: [
      { icon:AlertTriangle, text:"Hồ sơ NS-2026-0148 cần bổ sung minh chứng",    action:"Bổ sung ngay", module:"Đề nghị khen thưởng", urgent:true },
      { icon:Clock,         text:"Hạn nộp đợt 2/2026: còn 67 ngày (30/06/2026)", action:"Tạo hồ sơ",    module:"Đề nghị khen thưởng" },
      { icon:Bell,          text:"Hồ sơ NS-2026-0141 đang chờ bỏ phiếu HĐ",      action:"Theo dõi",     module:"Đề nghị khen thưởng" },
    ],
    quickStats: [
      { label:"CSTĐ cơ sở", value:"2×",   color:"#8a6400" },
      { label:"Bằng khen",  value:"1",    color:"#c8102e" },
      { label:"Năm liên tục",value:"5",   color:"#1C5FBE" },
    ],
  },
  manager: {
    subtitle: "Quản lý thi đua khen thưởng của đơn vị",
    progress: 74, progressLabel: "Chỉ tiêu đơn vị",
    kpis: [
      { label:"Cán bộ đơn vị",       value:"86",  numVal:86,  delta:"+5",   up:true,  icon:Users,         accent:"#1C5FBE", module:"Hồ sơ cán bộ",        spark:[72,74,76,78,80,82,84,86] },
      { label:"Đề nghị đang xử lý",  value:"6",   numVal:6,   delta:"+3",   up:false, icon:FileSignature, accent:"#c8102e", module:"Đề nghị khen thưởng", spark:[2,3,4,3,5,4,6,6] },
      { label:"Tỉ lệ hoàn thành KH", value:"74%", numVal:74,  delta:"+6%",  up:true,  icon:BarChart3,     accent:"#0f7a3e", module:"Phân tích thi đua",   spark:[60,63,65,66,68,70,72,74] },
      { label:"Đủ điều kiện CSTĐCS", value:"3",   numVal:3,   delta:"mới",  up:true,  icon:Award,         accent:"#8a6400", module:"Hồ sơ cán bộ",        spark:[1,1,1,2,2,2,3,3] },
    ],
    tasks: [
      { icon:AlertTriangle, text:"1 hồ sơ đã thẩm định – cần trình lên HĐ",     action:"Trình lên",    module:"Đề nghị khen thưởng", urgent:true },
      { icon:Users,         text:"3 cán bộ đủ điều kiện chưa có đề nghị 2026",  action:"Lập đề nghị",  module:"Hồ sơ cán bộ" },
      { icon:BarChart3,     text:"Báo cáo thi đua đơn vị tháng 4 chưa nộp",     action:"Lập báo cáo",  module:"Báo cáo tổng hợp" },
    ],
    quickStats: [
      { label:"Xếp hạng",  value:"#3",   color:"#8a6400" },
      { label:"Điểm ĐV",   value:"89.4", color:"#1C5FBE" },
      { label:"Cờ thi đua",value:"1",    color:"#c8102e" },
    ],
  },
  council: {
    subtitle: "Thẩm định và bỏ phiếu hồ sơ khen thưởng",
    progress: 58, progressLabel: "Tiến độ phiên",
    kpis: [
      { label:"Hồ sơ chờ thẩm định", value:"47", numVal:47, delta:"+12",   up:false, icon:ClipboardList, accent:"#1C5FBE", module:"Đề nghị khen thưởng", spark:[30,35,38,40,42,44,45,47] },
      { label:"Quá hạn SLA",         value:"3",  numVal:3,  delta:"+1",    up:false, icon:AlertTriangle, accent:"#c8102e", module:"SLA Monitor",         spark:[1,2,2,3,2,2,3,3] },
      { label:"Đã thẩm định (T4)",   value:"29", numVal:29, delta:"+7",    up:true,  icon:CheckCircle2,  accent:"#0f7a3e", module:"Đề nghị khen thưởng", spark:[10,14,17,19,22,24,27,29] },
      { label:"Phiên họp tiếp theo", value:"3",  numVal:3,  delta:"ngày",  up:true,  icon:Gavel,         accent:"#8a6400", module:"Hội đồng xét duyệt",  spark:[7,6,5,5,4,4,3,3] },
    ],
    tasks: [
      { icon:AlertTriangle, text:"3 hồ sơ sắp trễ deadline – SLA còn ≤2 ngày",    action:"Xử lý ngay",  module:"Đề nghị khen thưởng", urgent:true },
      { icon:ClipboardList, text:"2 hồ sơ mới được phân công cho bạn",              action:"Tiếp nhận",   module:"Đề nghị khen thưởng" },
      { icon:Gavel,         text:"Phiên HĐ-2026-04 dự kiến 28/04 · cần chuẩn bị", action:"Xem biên bản",module:"Hội đồng xét duyệt" },
      { icon:BarChart3,     text:"Báo cáo tháng 4/2026 chưa nộp",                  action:"Lập báo cáo", module:"Báo cáo tổng hợp" },
    ],
    quickStats: [
      { label:"Đồng thuận",   value:"91%",      color:"#0f7a3e" },
      { label:"TB thẩm định", value:"2.4 ngày", color:"#1C5FBE" },
      { label:"HC đề xuất",   value:"7",        color:"#8a6400" },
    ],
  },
  leader: {
    subtitle: "Phê duyệt, ký số và chỉ đạo thi đua toàn tỉnh",
    progress: 68, progressLabel: "Chỉ tiêu tỉnh",
    kpis: [
      { label:"Chờ ký số",           value:"8",   numVal:8,   delta:"+3",  up:false, icon:FileSignature, accent:"#c8102e", module:"Ký số & Phê duyệt",  spark:[5,6,6,7,6,7,8,8] },
      { label:"Đã ký (tháng 4)",     value:"23",  numVal:23,  delta:"+5",  up:true,  icon:CheckCircle2,  accent:"#0f7a3e", module:"Ký số & Phê duyệt",  spark:[10,13,15,17,18,20,22,23] },
      { label:"Phong trào triển khai",value:"12", numVal:12,  delta:"+3",  up:true,  icon:Flame,         accent:"#8a6400", module:"Phong trào thi đua",  spark:[7,8,9,9,10,10,11,12] },
      { label:"Đơn vị đạt chỉ tiêu", value:"18/26", numVal:18, delta:"+2",  up:true,  icon:CheckCircle2,  accent:"#0f7a3e", module:"Bảng xếp hạng",      spark:[12,13,14,14,15,16,17,18] },
    ],
    tasks: [
      { icon:AlertTriangle, text:"2 trong 8 quyết định khen thưởng đã quá hạn ký số", action:"Ký ngay",    module:"Ký số & Phê duyệt",   urgent:true },
      { icon:FileSignature, text:"Tờ trình tổng hợp Q1/2026 cần phê duyệt",       action:"Xem tờ trình", module:"Đề nghị khen thưởng" },
      { icon:Flame,         text:"1 phong trào mới chờ phê duyệt phát động",      action:"Phê duyệt",    module:"Phong trào thi đua" },
    ],
    quickStats: [
      { label:"Khen thưởng",  value:"1.284", color:"#8a6400" },
      { label:"Huân chương",  value:"47",    color:"#c8102e" },
      { label:"Bằng khen CP", value:"312",   color:"#1C5FBE" },
    ],
  },
  admin: {
    subtitle: "Giám sát toàn bộ hoạt động, bảo mật và hiệu năng",
    progress: 99.8, progressLabel: "Uptime",
    kpis: [
      { label:"Tổng người dùng",  value:"1.247", numVal:1247, delta:"+23",    up:true,  icon:Users,        accent:"#1C5FBE", module:"Phân quyền",          spark:[1180,1195,1210,1220,1228,1235,1242,1247] },
      { label:"Hồ sơ xử lý",     value:"47",    numVal:47,   delta:"+12",    up:true,  icon:ClipboardList,accent:"#8a6400", module:"Đề nghị khen thưởng", spark:[25,30,35,38,40,43,45,47] },
      { label:"Sự kiện bảo mật",  value:"8",     numVal:8,    delta:"+2",     up:false, icon:Shield,       accent:"#c8102e", module:"Audit Log",           spark:[3,4,5,6,6,7,7,8] },
      { label:"Phiên đăng nhập",  value:"312",   numVal:312,  delta:"+47",   up:true,  icon:Zap,          accent:"#0f7a3e", module:"Audit Log",           spark:[220,240,255,270,280,295,305,312] },
    ],
    tasks: [
      { icon:Shield,   text:"5 lần đăng nhập thất bại từ IP 203.0.1.55",        action:"Kiểm tra",    module:"Audit Log",      urgent:true },
      { icon:Users,    text:"3 tài khoản mới chờ phân quyền & kích hoạt",       action:"Phân quyền",  module:"Phân quyền" },
      { icon:Settings, text:"Cập nhật danh mục đơn vị năm 2026 chưa hoàn tất", action:"Cập nhật",    module:"Cấu hình đơn vị" },
    ],
    quickStats: [
      { label:"Backup",    value:"3 ngày", color:"#c8102e" },
      { label:"DB size",   value:"2.4 GB", color:"#1C5FBE" },
      { label:"Response",  value:"142 ms", color:"#0f7a3e" },
    ],
  },
};

/* ═══ Animated counter ════════════════════════════════════════ */
function useCounter(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return val;
}

/* ═══ Sparkline SVG ═══════════════════════════════════════════ */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 28, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const area = `M ${pts.join(" L ")} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`;
  const line = `M ${pts.join(" L ")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#","")})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1].split(",")[0]} cy={pts[pts.length-1].split(",")[1]}
        r={2.5} fill={color} />
    </svg>
  );
}

/* ═══ KPI Card with Sparkline ════════════════════════════════ */
function KpiCard({ label, value, numVal, delta, up, icon: Icon, accent, module: mod, spark, onClick }: {
  label: string; value: string; numVal: number; delta: string; up: boolean;
  icon: typeof Flame; accent: string; module: string; spark: number[]; onClick?: () => void;
}) {
  const count = useCounter(numVal);
  const displayVal = value.includes("%") ? `${count}%` : value.includes(".") && numVal < 100 ? value : count.toLocaleString("vi-VN");

  return (
    <button onClick={onClick}
      className="relative bg-white rounded-[14px] p-5 text-left w-full group overflow-hidden transition-all duration-200"
      style={{ border: "1px solid #dde3ec", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px -8px ${accent}30, 0 2px 8px rgba(0,0,0,0.06)`; (e.currentTarget as HTMLElement).style.borderColor = `${accent}50`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "#dde3ec"; }}>

      {/* Large bg glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top right, ${accent}08, transparent 70%)` }} />
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

      <div className="relative flex items-start justify-between">
        <div className="size-10 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: `${accent}12`, border: `1px solid ${accent}22` }}>
          <Icon className="size-[18px]" strokeWidth={1.8} style={{ color: accent }} />
        </div>
        <Sparkline data={spark} color={accent} />
      </div>

      <div className="relative mt-3">
        <div className="text-[13px] uppercase tracking-[0.08em] text-[#635647]"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
          {label}
        </div>
        <div className="flex items-end gap-2 mt-1">
          <div className="text-[24px] leading-none" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: "#0b1426" }}>
            {displayVal}
          </div>
          <span className={`flex items-center gap-0.5 text-[13px] px-1.5 py-0.5 rounded-full mb-0.5 leading-none`}
            style={{ fontFamily: "JetBrains Mono", fontWeight: 700, background: up ? "rgba(15,122,62,0.1)" : "rgba(200,16,46,0.1)", color: up ? "#0f7a3e" : "#c8102e" }}>
            {up ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
            {delta}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ═══ Trend Chart ═════════════════════════════════════════════ */
function TrendChart() {
  const w = 600, h = 200, pad = { l: 36, r: 16, t: 12, b: 28 };
  const max = 130;
  const xs = trendData.map((_, i) => pad.l + (i / (trendData.length - 1)) * (w - pad.l - pad.r));
  const yFor = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  const pathFor = (k: "proposals" | "approved") => trendData.map((d, i) => `${i === 0 ? "M" : "L"} ${xs[i].toFixed(1)} ${yFor(d[k]).toFixed(1)}`).join(" ");
  const areaFor = (k: "proposals" | "approved") =>
    `${pathFor(k)} L ${xs[xs.length-1].toFixed(1)} ${h-pad.b} L ${xs[0].toFixed(1)} ${h-pad.b} Z`;
  const yTicks = [0, 30, 60, 90, 120];
  const lastP = trendData[trendData.length - 1];

  return (
    <div className="h-[200px] w-full relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1C5FBE" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#1C5FBE" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#c8102e" stopOpacity={0.2}  />
            <stop offset="100%" stopColor="#c8102e" stopOpacity={0}    />
          </linearGradient>
        </defs>
        {yTicks.map(t => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={yFor(t)} y2={yFor(t)} stroke="#e8eef5" strokeWidth={1} strokeDasharray="4 3" />
            <text x={pad.l - 8} y={yFor(t) + 4} textAnchor="end" fontSize="10" fill="#74654a" fontFamily="JetBrains Mono">{t}</text>
          </g>
        ))}
        <path d={areaFor("proposals")} fill="url(#tg1)" />
        <path d={pathFor("proposals")} fill="none" stroke="#1C5FBE" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={areaFor("approved")} fill="url(#tg2)" />
        <path d={pathFor("approved")} fill="none" stroke="#c8102e" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots for last point */}
        <circle cx={xs[xs.length-1]} cy={yFor(lastP.proposals)} r={4} fill="white" stroke="#1C5FBE" strokeWidth={2} />
        <circle cx={xs[xs.length-1]} cy={yFor(lastP.approved)}  r={4} fill="white" stroke="#c8102e" strokeWidth={2} />
        {/* Month labels */}
        {trendData.map((d, i) => (
          <text key={d.m} x={xs[i]} y={h - 8} textAnchor="middle" fontSize="11" fill="#74654a" fontFamily="Google Sans">{d.m}</text>
        ))}
      </svg>
    </div>
  );
}

/* ═══ Funnel Pipeline ═════════════════════════════════════════ */
function FunnelPipeline({ onNavigate }: { onNavigate: (m: string) => void }) {
  return (
    <div className="bg-white rounded-[14px] p-5" style={{ border: "1px solid #dde3ec" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#0b1426" }}>
            Quy trình hồ sơ
          </h3>
          <p className="text-[13px] mt-0.5" style={{ color: "#635647", fontFamily: "var(--font-sans)" }}>Đang lưu chuyển realtime</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
          style={{ background: "rgba(200,16,46,0.08)" }}>
          <span className="size-1.5 rounded-full animate-pulse" style={{ background: "#c8102e" }} />
          <span className="text-[13px]" style={{ color: "#c8102e", fontFamily: "JetBrains Mono", fontWeight: 700 }}>LIVE</span>
        </div>
      </div>

      {/* Funnel */}
      <div className="space-y-1.5">
        {pipeline.map((p, i) => {
          const trapW = 100 - i * 14; // shrinks each step
          return (
            <div key={p.stage} className="relative">
              {/* Funnel trapezoid shape via border-radius trick */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative overflow-hidden rounded-[6px]" style={{ height: 36 }}>
                  <div className="absolute inset-y-0 left-0 rounded-[6px] flex items-center px-3 transition-all"
                    style={{ width: `${trapW}%`, background: `${p.color}18`, border: `1px solid ${p.color}30` }}>
                    <span className="text-[11.5px] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight: 600, color: p.color }}>
                      {p.stage}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right w-8">
                  <span className="text-[14px] leading-none" style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: p.color }}>
                    {p.count}
                  </span>
                </div>
              </div>
              {/* Connector arrow */}
              {i < pipeline.length - 1 && (
                <div className="flex justify-center mt-0.5 mb-0.5">
                  <div className="w-0 h-0" style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `6px solid ${p.color}40` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Conversion rate */}
      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid #eef2f8" }}>
        <span className="text-[13px]" style={{ fontFamily: "var(--font-sans)", color: "#635647" }}>Tỉ lệ phê duyệt</span>
        <span className="text-[13px]" style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: "#0f7a3e" }}>
          {((pipeline[3].count / pipeline[0].count) * 100).toFixed(0)}%
        </span>
      </div>

      <button onClick={() => onNavigate("Đề nghị khen thưởng")}
        className="mt-3 w-full h-8 rounded-[7px] text-[13px] flex items-center justify-center gap-1.5 transition-colors"
        style={{ background: "rgba(28,95,190,0.06)", border: "1px solid rgba(28,95,190,0.15)", color: "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 600 }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(28,95,190,0.12)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(28,95,190,0.06)"; }}>
        Xem toàn bộ hồ sơ <ChevronRight className="size-3" />
      </button>
    </div>
  );
}

/* ═══ Deadline Card ═══════════════════════════════════════════ */
const DEADLINES = [
  { label:"Ký số NS-2026-0152",     date:"25/04", daysLeft:0,  color:"#c8102e", icon:FileSignature },
  { label:"Thẩm định NS-2026-0153", date:"27/04", daysLeft:2,  color:"#b45309", icon:ClipboardList },
  { label:"Phiên họp HĐ-2026-04",   date:"28/04", daysLeft:3,  color:"#1C5FBE", icon:Gavel        },
  { label:"Báo cáo tháng 4",        date:"30/04", daysLeft:5,  color:"#0f7a3e", icon:BarChart3     },
];
function DeadlineCard({ onNavigate }: { onNavigate: (m: string) => void }) {
  return (
    <div className="bg-white rounded-[14px] p-5" style={{ border: "1px solid #dde3ec" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#0b1426" }}>Hạn chót sắp đến</h3>
        <span className="text-[13px] px-2 py-0.5 rounded-full" style={{ background: "rgba(200,16,46,0.09)", color: "#c8102e", fontFamily: "JetBrains Mono", fontWeight: 700 }}>
          2 khẩn
        </span>
      </div>
      <div className="space-y-1.5">
        {DEADLINES.map(d => {
          const DIcon = d.icon;
          return (
            <button key={d.label} onClick={() => onNavigate("Đề nghị khen thưởng")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-left transition-all"
              style={{ background: "#ffffff", border: `1px solid ${d.color}18` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${d.color}08`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#ffffff"; }}>
              <div className="size-7 rounded-[6px] flex items-center justify-center shrink-0"
                style={{ background: `${d.color}12` }}>
                <DIcon className="size-3.5" strokeWidth={1.8} style={{ color: d.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight: 500, color: "#0b1426" }}>{d.label}</div>
                <div className="text-[13px]" style={{ color: "#74654a" }}>{d.date}</div>
              </div>
              <div className="shrink-0 min-w-[42px] text-right">
                <div className="text-[13px] leading-none" style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: d.daysLeft === 0 ? "#c8102e" : d.color }}>
                  {d.daysLeft === 0 ? "HÔM NAY" : `${d.daysLeft}d`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ Medal Podium ════════════════════════════════════════════ */
function MedalPodium({ onNavigate }: { onNavigate: (m: string) => void }) {
  const top3 = units.slice(0, 3);
  const order = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
  const heights = [80, 110, 60];
  const medalColors = { gold: "#8a6400", silver: "#4f5d6e", bronze: "#cd7f45" } as Record<string, string>;
  const medals = ["🥈", "🥇", "🥉"];
  const labels = ["Nhì", "Nhất", "Ba"];

  return (
    <div className="bg-white rounded-[14px] p-5" style={{ border: "1px solid #dde3ec" }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#0b1426" }}>
            Bảng xếp hạng thi đua
          </h3>
          <p className="text-[13px] mt-0.5" style={{ fontFamily: "var(--font-sans)", color: "#635647" }}>
            Khối Sở ban ngành · AI chấm 14 tiêu chí
          </p>
        </div>
        <button onClick={() => onNavigate("Bảng xếp hạng")}
          className="text-[13px] px-2.5 py-1.5 rounded-[7px] flex items-center gap-1 transition-colors"
          style={{ color: "#c8102e", fontFamily: "var(--font-sans)", fontWeight: 600 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(200,16,46,0.07)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          Xem tất cả <ChevronRight className="size-3" />
        </button>
      </div>

      {/* Podium visual */}
      <div className="flex items-end justify-center gap-3 mb-6">
        {order.map((u, i) => {
          const mc = medalColors[u.medal || "bronze"];
          return (
            <div key={u.name} className="flex flex-col items-center gap-2 flex-1">
              {/* Name + score above podium */}
              <div className="text-center">
                <div className="text-[18px] mb-1">{medals[i]}</div>
                <div className="text-[13px] leading-tight text-center px-1"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600, color: "#0b1426" }}>
                  {u.name.replace("Sở ", "")}
                </div>
                <div className="text-[13px] mt-1" style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: mc }}>
                  {u.score}
                </div>
              </div>
              {/* Podium block */}
              <div className="w-full rounded-t-[8px] flex items-center justify-center"
                style={{ height: heights[i], background: `linear-gradient(180deg, ${mc}22, ${mc}10)`, border: `1px solid ${mc}40`, borderBottom: "none" }}>
                <span className="text-[18px] font-bold" style={{ fontFamily: "var(--font-sans)", color: mc, opacity: 0.6 }}>
                  {labels[i]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Remaining units */}
      <div className="space-y-1">
        {units.slice(3).map((u, i) => (
          <div key={u.name} className="flex items-center gap-3 px-3 py-2 rounded-[7px] hover:bg-[#f4f7fb] transition-colors cursor-pointer"
            onClick={() => onNavigate("Bảng xếp hạng")}>
            <span className="w-5 text-center text-[13px]" style={{ fontFamily: "var(--font-sans)", fontStyle: "italic", color: "#74654a" }}>{i + 4}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] truncate" style={{ fontFamily: "var(--font-sans)", color: "#3d3020" }}>{u.name}</div>
              <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: "#eef2f8" }}>
                <div className="h-full rounded-full" style={{ width: `${u.score}%`, background: "#c4b89a" }} />
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[13px]" style={{ fontFamily: "JetBrains Mono", fontWeight: 600, color: "#0b1426" }}>{u.score}</div>
              <div className="text-[13px]" style={{ color: u.score >= u.prev ? "#0f7a3e" : "#c8102e" }}>
                {u.score >= u.prev ? "▲" : "▼"}{Math.abs(u.score - u.prev).toFixed(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ Activity Feed ═══════════════════════════════════════════ */
function ActivityFeed({ onNavigate }: { onNavigate: (m: string) => void }) {
  const icons = { approve: CheckCircle2, submit: FileSignature, alert: AlertTriangle, ai: Sparkles };
  return (
    <div className="bg-white rounded-[14px] p-5 flex flex-col" style={{ border: "1px solid #dde3ec" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#0b1426" }}>
            Hoạt động gần đây
          </h3>
          <p className="text-[13px] mt-0.5" style={{ color: "#635647", fontFamily: "var(--font-sans)" }}>Cập nhật theo thời gian thực</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: "rgba(15,122,62,0.08)" }}>
          <Radio className="size-3" style={{ color: "#0f7a3e" }} />
          <span className="text-[13px]" style={{ color: "#0f7a3e", fontFamily: "JetBrains Mono", fontWeight: 700 }}>LIVE</span>
        </div>
      </div>

      <div className="relative flex-1">
        {/* Vertical line */}
        <div className="absolute left-[13px] top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, #dde3ec, transparent)" }} />

        <div className="space-y-3">
          {feed.map((f, i) => {
            const FIcon = icons[f.type as keyof typeof icons] || Bell;
            return (
              <div key={i} className="flex items-start gap-3 pl-1">
                <div className="size-[26px] rounded-full flex items-center justify-center shrink-0 z-10"
                  style={{ background: `${f.color}15`, border: `1.5px solid ${f.color}30` }}>
                  <FIcon className="size-3" strokeWidth={2} style={{ color: f.color }} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[13px] leading-snug" style={{ fontFamily: "var(--font-sans)", color: "#2d2010", fontWeight: 400 }}>
                    {f.text}
                  </p>
                  <span className="text-[13px] mt-0.5 block" style={{ color: "#74654a", fontFamily: "JetBrains Mono" }}>
                    {f.time} trước
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={() => onNavigate("Dòng thời gian")}
        className="mt-4 w-full h-8 rounded-[7px] text-[13px] flex items-center justify-center gap-1.5 transition-colors"
        style={{ background: "#f4f7fb", border: "1px solid #dde3ec", color: "#5a4e3c", fontFamily: "var(--font-sans)", fontWeight: 600 }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#eef2f8"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f4f7fb"; }}>
        Xem dòng thời gian đầy đủ <ChevronRight className="size-3" />
      </button>
    </div>
  );
}

/* ═══ Task Panel — white theme, vertical list ════════════════ */
function TaskPanel({ cfg, onNavigate }: { cfg: typeof ROLE_CONFIG["user"]; onNavigate: (m: string) => void }) {
  const urgent = cfg.tasks.filter(t => t.urgent).length;
  return (
    <div className="bg-white rounded-[14px] overflow-hidden flex flex-col h-full"
      style={{ border: "1px solid #dde3ec", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 shrink-0"
        style={{ borderBottom: "1px solid #eef2f8" }}>
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "#0b1426" }}>
            <Zap className="size-3 text-white" />
          </div>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#0b1426" }}>
            Việc cần làm hôm nay
          </span>
          {urgent > 0 && (
            <div className="size-5 rounded-full flex items-center justify-center text-white leading-none"
              style={{ background: "#c8102e", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 11 }}>
              {urgent}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {cfg.quickStats.slice(0, 2).map(s => (
            <span key={s.label} className="text-[12px] px-2 py-0.5 rounded-full"
              style={{ background: `${s.color}12`, color: s.color, fontFamily: "JetBrains Mono", fontWeight: 700, border: `1px solid ${s.color}25` }}>
              {s.value}
            </span>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1">
        {cfg.tasks.map((t, i) => {
          const TIcon = t.icon;
          return (
            <div key={i} className="flex items-start gap-3 px-5 py-4 transition-colors"
              style={{
                borderLeft: `3px solid ${t.urgent ? "#c8102e" : "#1C5FBE"}`,
                borderBottom: i < cfg.tasks.length - 1 ? "1px solid #f0f4f8" : "none",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8faff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
              <div className="size-8 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: t.urgent ? "rgba(200,16,46,0.08)" : "rgba(28,95,190,0.07)",
                  border: t.urgent ? "1px solid rgba(200,16,46,0.15)" : "1px solid rgba(28,95,190,0.12)",
                }}>
                <TIcon className="size-3.5" strokeWidth={1.8} style={{ color: t.urgent ? "#c8102e" : "#1C5FBE" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-snug"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: t.urgent ? 600 : 400, color: "#0b1426" }}>
                  {t.text}
                </p>
                <button onClick={() => onNavigate(t.module)}
                  className="mt-1.5 text-[12px] inline-flex items-center gap-1"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: t.urgent ? "#c8102e" : "#1C5FBE" }}>
                  {t.action} <ArrowUpRight className="size-3" />
                </button>
              </div>
              {t.urgent && (
                <span className="shrink-0 self-start text-[10.5px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(200,16,46,0.08)", color: "#c8102e", fontFamily: "var(--font-sans)", fontWeight: 700, border: "1px solid rgba(200,16,46,0.15)" }}>
                  Khẩn
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer — remaining quick stat */}
      <div className="px-5 py-3 flex items-center gap-2 shrink-0"
        style={{ borderTop: "1px solid #eef2f8", background: "#f8faff" }}>
        {cfg.quickStats.slice(2).map(s => (
          <span key={s.label} className="text-[12px] px-2 py-0.5 rounded-full"
            style={{ background: `${s.color}12`, color: s.color, fontFamily: "JetBrains Mono", fontWeight: 700, border: `1px solid ${s.color}25` }}>
            {s.label}: {s.value}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══ MAIN DASHBOARD ══════════════════════════════════════════ */
export function Dashboard({ user, onNavigate }: { user?: LoginUser; onNavigate?: (m: string) => void }) {
  const nav = onNavigate ?? (() => {});
  const roleKey = user?.role ?? "council";
  const cfg = ROLE_CONFIG[roleKey] ?? ROLE_CONFIG["council"];
  const displayName = user?.name?.split(" ").slice(-1)[0] ?? "Bạn";
  const todayStr = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="p-6 space-y-4 max-w-[1600px]">

      {/* ══ ROW 1: Hero (4/12) + KPI 2×2 (8/12) ══════════════ */}
      <div className="grid grid-cols-12 gap-4 items-stretch">

        {/* Hero card */}
        <div className="col-span-4 rounded-[14px] overflow-hidden flex flex-col"
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 24px rgba(11,20,38,0.06), 0 1px 4px rgba(11,20,38,0.04)",
          }}>
          <div className="h-[3px] w-full shrink-0"
            style={{ background: "linear-gradient(90deg, #c8102e 0%, #1C5FBE 50%, #8a6400 100%)" }} />

          <div className="flex-1 flex flex-col p-6 gap-4">
            {/* Greeting */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                style={{ background: "#fef3c7", border: "1px solid #fcd34d" }}>
                <Flame className="size-3" style={{ color: "#b45309" }} />
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#92400e" }}>
                  Đợt thi đua Quý II / 2026
                </span>
              </div>
              <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 22, color: "#0b1426", lineHeight: 1.25, marginBottom: 4 }}>
                Xin chào, <span style={{ color: "#1C5FBE" }}>{displayName}</span> 👋
              </h1>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "#94a3b8", marginBottom: 6 }}>{todayStr}</p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#5a6474", lineHeight: 1.6 }}>
                {cfg.subtitle}
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2">
              <button onClick={() => nav("Đề nghị khen thưởng")}
                className="btn btn-primary btn-md inline-flex items-center justify-center gap-2 w-full"
                style={{ fontFamily: "var(--font-sans)" }}>
                <Award className="size-3.5" /> Đề nghị khen thưởng
              </button>
              <button onClick={() => nav("Phong trào thi đua")}
                className="btn btn-secondary btn-md inline-flex items-center justify-center gap-1.5 w-full"
                style={{ fontFamily: "var(--font-sans)" }}>
                Phong trào <ArrowUpRight className="size-3.5" />
              </button>
            </div>

            {/* Progress ring + quick stats */}
            <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid #eef2f8", marginTop: "auto" }}>
              <div className="relative shrink-0">
                <RadialBarChart width={90} height={90} innerRadius="62%" outerRadius="96%"
                  data={[{ v: cfg.progress, fill: "#1C5FBE" }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "#e2e8f0" }} dataKey="v" cornerRadius={8} />
                </RadialBarChart>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 17, color: "#1C5FBE", lineHeight: 1 }}>
                      {cfg.progress}<span style={{ fontSize: 10 }}>%</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: 8, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 3 }}>
                      {cfg.progressLabel}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {cfg.quickStats.map(s => (
                  <div key={s.label} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
                    style={{ background: "#f4f7fb" }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#4f5d6e" }}>{s.label}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 13, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2×2 grid */}
        <div className="col-span-8 grid grid-cols-2 gap-4">
          {cfg.kpis.map(k => (
            <KpiCard key={k.label} {...k} onClick={() => nav(k.module)} />
          ))}
        </div>
      </div>

      {/* ══ ROW 2: Trend chart (7/12) + Task panel (5/12) ══════ */}
      <div className="grid grid-cols-12 gap-4 items-stretch">

        {/* Trend chart */}
        <div className="col-span-7 bg-white rounded-[14px] p-5 flex flex-col" style={{ border: "1px solid #dde3ec" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#0b1426" }}>
                Xu hướng đề nghị & phê duyệt
              </h3>
              <p className="text-[13px] mt-0.5" style={{ fontFamily: "var(--font-sans)", color: "#635647" }}>
                T9/2025–T4/2026 · thực tế · so cùng kỳ năm trước
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[{ color: "#1C5FBE", label: "Đề nghị" }, { color: "#c8102e", label: "Đã duyệt" }].map(l => (
                <span key={l.label} className="flex items-center gap-1.5 text-[13px]" style={{ fontFamily: "var(--font-sans)", color: l.color }}>
                  <span className="size-2 rounded-full inline-block" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <TrendChart />
          <div className="mt-4 pt-4 grid grid-cols-3 gap-4" style={{ borderTop: "1px solid #eef2f8" }}>
            {[
              { label: "Tổng đề nghị T4/26", value: "63",  color: "#1C5FBE", delta: "−8 so T3" },
              { label: "Tổng phê duyệt T4/26", value: "52", color: "#c8102e", delta: "−3 so T3" },
              { label: "Tỉ lệ phê duyệt",   value: "83%", color: "#0f7a3e", delta: "−1% so T3" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-[18px] leading-none" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: s.color }}>{s.value}</div>
                <div className="text-[13px] mt-0.5" style={{ fontFamily: "var(--font-sans)", color: "#635647" }}>{s.label}</div>
                <div className="text-[13px] mt-0.5" style={{ fontFamily: "JetBrains Mono", color: "#74654a" }}>{s.delta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Task panel */}
        <div className="col-span-5">
          <TaskPanel cfg={cfg} onNavigate={nav} />
        </div>
      </div>

      {/* ══ ROW 3: Medal (5) + Activity (4) + Funnel+Deadline (3) ══ */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5">
          <MedalPodium onNavigate={nav} />
        </div>
        <div className="col-span-4">
          <ActivityFeed onNavigate={nav} />
        </div>
        <div className="col-span-3 space-y-4">
          <FunnelPipeline onNavigate={nav} />
          <DeadlineCard onNavigate={nav} />
        </div>
      </div>

      {/* ══ ROW 4: AI Insight ═════════════════════════════════════ */}
      <div className="relative rounded-[14px] overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f0f6ff, #e8f0ff)", border: "1px solid rgba(212,168,75,0.35)" }}>
        <div className="absolute top-0 right-0 size-32 opacity-[0.05] pointer-events-none"
          style={{ background: "radial-gradient(circle, #8a6400, transparent 70%)" }} />

        <div className="relative flex items-start gap-5 p-6">
          <div className="size-11 rounded-[12px] flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #0a1628, #1C5FBE)", boxShadow: "0 4px 16px rgba(28,95,190,0.3)" }}>
            <Sparkles className="size-5" style={{ color: "#8a6400" }} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "#0b1426" }}>
                Trợ lý AI Tố Nga gợi ý
              </span>
              <span className="px-2 py-0.5 rounded text-[13px] text-white tracking-wider uppercase"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 700, background: "#1C5FBE" }}>Beta</span>
            </div>
            <p className="text-[13.5px] leading-relaxed" style={{ fontFamily: "var(--font-sans)", color: "#4a3f2a" }}>
              Phát hiện <strong style={{ color: "#0b1426" }}>7 cá nhân</strong> có thành tích vượt chuẩn "Chiến sĩ thi đua cơ sở" 3 năm liên tiếp — đủ điều kiện đề nghị{" "}
              <em style={{ color: "#7a5a10" }}>Chiến sĩ thi đua cấp Tỉnh</em>.{" "}
              Đồng thời cảnh báo <strong style={{ color: "#c8102e" }}>2 hồ sơ trùng lặp</strong> tại Sở Giáo dục (độ tương đồng 89%).
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => nav("Trợ lý AI Tố Nga")}
                className="flex items-center gap-2 h-8 px-4 rounded-[7px] text-[12.5px] text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #0a1628, #1C5FBE)", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                <Sparkles className="size-3" style={{ color: "#8a6400" }} /> Xem phân tích
              </button>
              <button onClick={() => nav("Hồ sơ cán bộ")}
                className="flex items-center gap-2 h-8 px-4 rounded-[7px] text-[12.5px] transition-all"
                style={{ background: "rgba(212,168,75,0.12)", border: "1px solid rgba(212,168,75,0.35)", color: "#7a5a10", fontFamily: "var(--font-sans)", fontWeight: 600 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(212,168,75,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(212,168,75,0.12)"; }}>
                Xem hồ sơ đủ điều kiện
              </button>
            </div>
          </div>

          <div className="shrink-0 hidden lg:flex flex-col items-center gap-2">
            <div className="size-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(212,168,75,0.12)", border: "1.5px solid rgba(212,168,75,0.3)" }}>
              <svg viewBox="0 0 24 24" className="size-8" fill="#8a6400">
                <path d="M12 2l2.39 6.95H22l-6.2 4.5 2.4 7.05L12 16l-6.2 4.5 2.4-7.05L2 8.95h7.61z" />
              </svg>
            </div>
            <span className="text-[13px] text-center" style={{ color: "rgba(212,168,75,0.6)", fontFamily: "var(--font-sans)" }}>
              7 đề xuất
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
