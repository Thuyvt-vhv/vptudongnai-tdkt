import { useState, useEffect } from "react";
import {
  Trophy, TrendingUp, TrendingDown, Minus, Star,
  ChevronDown, Users, User, Download, Search, Zap,
  Crown, ArrowUp, ArrowDown, Building2, Sparkles,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES & DATA
═══════════════════════════════════════════════════════════════ */
type RankType = "ca_nhan" | "tap_the";
type PhongTrao = "Lao động giỏi 2026" | "Sáng tạo Kỹ thuật 2025–2026" | "Đơn vị văn hóa 2025";

interface RankEntry {
  id: string; rank: number; prevRank: number;
  name: string; unit: string; chucVu?: string;
  score: number; prevScore: number;
  diem: { label: string; v: number; max: number; color: string }[];
  awards: string[]; type: RankType;
}

function makeScore(base: number, offset: number) {
  return Math.min(100, Math.max(55, base + offset + (Math.random() - 0.5) * 0.4));
}

const PHONG_TRAO_LIST: PhongTrao[] = [
  "Lao động giỏi 2026", "Sáng tạo Kỹ thuật 2025–2026", "Đơn vị văn hóa 2025",
];

const BASE_DATA: Omit<RankEntry, "score" | "prevScore" | "rank" | "prevRank">[] = [
  { id:"p1", name:"Nguyễn Văn An",      unit:"VP Tỉnh ủy",    chucVu:"Phó Trưởng phòng",  type:"ca_nhan", diem:[{label:"Kỷ luật",v:97,max:100,color:"#1C5FBE"},{label:"Hiệu quả",v:95,max:100,color:"#059669"},{label:"Sáng tạo",v:91,max:100,color:"#d97706"}], awards:["CSTĐ cơ sở 3 năm liên tiếp"] },
  { id:"p2", name:"Trần Thị Bích",      unit:"Sở Y tế",        chucVu:"Trưởng Khoa Nội",   type:"ca_nhan", diem:[{label:"Kỷ luật",v:98,max:100,color:"#1C5FBE"},{label:"Hiệu quả",v:93,max:100,color:"#059669"},{label:"Sáng tạo",v:89,max:100,color:"#d97706"}], awards:["Bằng khen Bộ Y tế 2024"] },
  { id:"p3", name:"Phạm Minh Tuấn",     unit:"Sở GTVT",        chucVu:"Kỹ sư trưởng",      type:"ca_nhan", diem:[{label:"Kỷ luật",v:94,max:100,color:"#1C5FBE"},{label:"Hiệu quả",v:92,max:100,color:"#059669"},{label:"Sáng tạo",v:93,max:100,color:"#d97706"}], awards:[] },
  { id:"p4", name:"Lê Thị Thanh Xuân",  unit:"Sở GD&ĐT",       chucVu:"Phó Giám đốc",      type:"ca_nhan", diem:[{label:"Kỷ luật",v:92,max:100,color:"#1C5FBE"},{label:"Hiệu quả",v:91,max:100,color:"#059669"},{label:"Sáng tạo",v:88,max:100,color:"#d97706"}], awards:["CSTĐ cấp Tỉnh 2023"] },
  { id:"p5", name:"Đinh Công Sơn",      unit:"Sở TT&TT",       chucVu:"Kỹ sư CNTT",        type:"ca_nhan", diem:[{label:"Kỷ luật",v:90,max:100,color:"#1C5FBE"},{label:"Hiệu quả",v:88,max:100,color:"#059669"},{label:"Sáng tạo",v:95,max:100,color:"#d97706"}], awards:[] },
  { id:"p6", name:"Võ Hoàng Linh",      unit:"Ban TC TU",       chucVu:"Chuyên viên",        type:"ca_nhan", diem:[{label:"Kỷ luật",v:95,max:100,color:"#1C5FBE"},{label:"Hiệu quả",v:86,max:100,color:"#059669"},{label:"Sáng tạo",v:82,max:100,color:"#d97706"}], awards:[] },
  { id:"p7", name:"Bùi Đức Nam",        unit:"Sở KH&ĐT",       chucVu:"Trưởng phòng",      type:"ca_nhan", diem:[{label:"Kỷ luật",v:89,max:100,color:"#1C5FBE"},{label:"Hiệu quả",v:85,max:100,color:"#059669"},{label:"Sáng tạo",v:84,max:100,color:"#d97706"}], awards:[] },
  { id:"p8", name:"Nguyễn Thị Hồng",   unit:"Sở LĐ-TB&XH",   chucVu:"Phó Trưởng phòng", type:"ca_nhan", diem:[{label:"Kỷ luật",v:86,max:100,color:"#1C5FBE"},{label:"Hiệu quả",v:87,max:100,color:"#059669"},{label:"Sáng tạo",v:80,max:100,color:"#d97706"}], awards:[] },
  { id:"tt1", name:"Phòng Tổng hợp VP",    unit:"VP Tỉnh ủy",    type:"tap_the", diem:[{label:"Kỷ luật",v:98,max:100,color:"#1C5FBE"},{label:"Hoàn thành",v:97,max:100,color:"#059669"},{label:"Sáng kiến",v:92,max:100,color:"#d97706"}], awards:["Tập thể LĐXS 4 năm liên tục"] },
  { id:"tt2", name:"Sở GD&ĐT ĐN",         unit:"Tỉnh Đồng Nai", type:"tap_the", diem:[{label:"Kỷ luật",v:97,max:100,color:"#1C5FBE"},{label:"Hoàn thành",v:95,max:100,color:"#059669"},{label:"Sáng kiến",v:90,max:100,color:"#d97706"}], awards:["Cờ thi đua Chính phủ 2025"] },
  { id:"tt3", name:"BV Đa khoa Đồng Nai",  unit:"Sở Y tế",       type:"tap_the", diem:[{label:"Kỷ luật",v:95,max:100,color:"#1C5FBE"},{label:"Hoàn thành",v:96,max:100,color:"#059669"},{label:"Sáng kiến",v:88,max:100,color:"#d97706"}], awards:[] },
  { id:"tt4", name:"Khoa Nhi BV Nhi ĐN",   unit:"Sở Y tế",       type:"tap_the", diem:[{label:"Kỷ luật",v:92,max:100,color:"#1C5FBE"},{label:"Hoàn thành",v:93,max:100,color:"#059669"},{label:"Sáng kiến",v:86,max:100,color:"#d97706"}], awards:[] },
  { id:"tt5", name:"Phòng CS Kinh tế CA",  unit:"Công an Tỉnh",  type:"tap_the", diem:[{label:"Kỷ luật",v:96,max:100,color:"#1C5FBE"},{label:"Hoàn thành",v:89,max:100,color:"#059669"},{label:"Sáng kiến",v:82,max:100,color:"#d97706"}], awards:[] },
];

function buildRankData(seed: number, type: RankType): RankEntry[] {
  const base = BASE_DATA.filter(d => d.type === type);
  const scored = base.map((d, i) => ({
    ...d,
    score: parseFloat(makeScore(93 - i * 2, seed * 0.1).toFixed(2)),
    prevScore: parseFloat(makeScore(93 - i * 2, (seed - 1) * 0.1).toFixed(2)),
  }));
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const prevSorted = [...scored].sort((a, b) => b.prevScore - a.prevScore);
  return sorted.map((entry, idx) => ({
    ...entry, rank: idx + 1,
    prevRank: prevSorted.findIndex(p => p.id === entry.id) + 1,
  }));
}

/* ─── Rank color palette ──────────────────────────────────── */
const RANK_PALETTE: Record<number, { grad: string; text: string; glow: string; accent: string; badge: string }> = {
  1: { grad: "linear-gradient(135deg,#f59e0b,#b45309)", text: "#fff", glow: "rgba(245,158,11,0.45)", accent: "#f59e0b", badge: "#fef3c7" },
  2: { grad: "linear-gradient(135deg,#6366f1,#4338ca)", text: "#fff", glow: "rgba(99,102,241,0.35)", accent: "#6366f1", badge: "#ede9fe" },
  3: { grad: "linear-gradient(135deg,#f97316,#c2410c)", text: "#fff", glow: "rgba(249,115,22,0.35)", accent: "#f97316", badge: "#ffedd5" },
};
const RANK_LABELS = ["", "👑 Hạng Nhất", "🥈 Hạng Nhì", "🥉 Hạng Ba"];

/* ═══════════════════════════════════════════════════════════════
   PODIUM
═══════════════════════════════════════════════════════════════ */
function Podium({ top3 }: { top3: RankEntry[] }) {
  if (top3.length < 3) return null;
  const [first, second, third] = [top3[0], top3[1], top3[2]];
  // order: 2nd left, 1st center, 3rd right
  const slots = [
    { entry: second, rank: 2, lift: 20 },
    { entry: first,  rank: 1, lift: 0  },
    { entry: third,  rank: 3, lift: 36 },
  ];

  return (
    <div className="relative overflow-hidden px-8 pt-10 pb-8"
      style={{ background: "linear-gradient(135deg,#eff6ff 0%,#f5f3ff 45%,#fefce8 100%)" }}>

      {/* Background decoration blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle,#f59e0b,transparent 70%)" }} />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle,#c8102e,transparent 70%)" }} />
        {/* Stars / sparkle dots */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: i % 3 === 0 ? 6 : 4, height: i % 3 === 0 ? 6 : 4,
              left: `${8 + i * 7.5}%`, top: `${15 + (i % 4) * 18}%`,
              background: ["#f59e0b","#6366f1","#f97316","#1C5FBE"][i % 4],
              opacity: 0.3 + (i % 3) * 0.15,
            }} />
        ))}
      </div>

      {/* Cards */}
      <div className="relative flex items-end justify-center gap-5">
        {slots.map(({ entry, rank, lift }) => {
          const pal = RANK_PALETTE[rank];
          const isFirst = rank === 1;
          return (
            <div key={entry.id} className="flex flex-col items-center"
              style={{ width: isFirst ? 226 : 196, transform: `translateY(${lift}px)` }}>

              {/* Crown glow for #1 */}
              {isFirst && (
                <div className="relative mb-2 flex justify-center">
                  <div className="absolute size-12 rounded-full blur-xl opacity-60"
                    style={{ background: pal.accent, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                  <Crown className="relative size-8" style={{ color: pal.accent, filter: `drop-shadow(0 0 10px ${pal.accent})` }} />
                </div>
              )}

              {/* Card */}
              <div className="relative w-full rounded-2xl overflow-hidden"
                style={{
                  background: pal.grad,
                  boxShadow: `0 ${isFirst ? 28 : 16}px ${isFirst ? 72 : 44}px ${pal.glow}, 0 4px 16px rgba(0,0,0,0.12)`,
                  border: "1.5px solid rgba(255,255,255,0.3)",
                }}>

                {/* Inner decoration */}
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
                  style={{ background: "rgba(255,255,255,0.12)" }} />
                <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: "rgba(255,255,255,0.08)" }} />

                <div className="relative p-5 flex flex-col items-center gap-3">
                  {/* Avatar */}
                  <div className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0"
                    style={{
                      width: isFirst ? 68 : 58, height: isFirst ? 68 : 58,
                      fontSize: isFirst ? 24 : 20,
                      background: "rgba(255,255,255,0.22)",
                      border: "3px solid rgba(255,255,255,0.55)",
                      fontFamily: "var(--font-sans)",
                      backdropFilter: "blur(4px)",
                    }}>
                    {entry.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <div className="font-bold text-white leading-tight" style={{ fontSize: isFirst ? 14 : 13, fontFamily: "var(--font-sans)" }}>
                      {entry.name}
                    </div>
                    <div className="text-white/70 mt-0.5" style={{ fontSize: 12 }}>{entry.unit}</div>
                    {entry.chucVu && (
                      <div className="text-white/50 mt-0.5" style={{ fontSize: 11 }}>{entry.chucVu}</div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <div className="font-extrabold text-white leading-none"
                      style={{ fontSize: isFirst ? 38 : 30, fontFamily: "JetBrains Mono, monospace", textShadow: "0 2px 16px rgba(0,0,0,0.2)" }}>
                      {entry.score.toFixed(1)}
                    </div>
                    <div className="text-white/55 uppercase tracking-widest mt-1" style={{ fontSize: 10 }}>Tổng điểm</div>
                  </div>

                  {/* Rank label pill */}
                  <div className="px-3 py-1 rounded-full font-bold text-white"
                    style={{ fontSize: 11, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(4px)" }}>
                    {RANK_LABELS[rank]}
                  </div>

                  {/* Awards */}
                  {entry.awards[0] && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.15)", fontSize: 11, color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-sans)" }}>
                      <Star className="size-3 fill-white text-white" />{entry.awards[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RANK ROW
═══════════════════════════════════════════════════════════════ */
function RankRow({ entry }: { entry: RankEntry }) {
  const delta = entry.prevRank - entry.rank;
  const scoreDelta = +(entry.score - entry.prevScore).toFixed(2);
  const isTop3 = entry.rank <= 3;
  const pal = RANK_PALETTE[entry.rank];

  return (
    <tr className="border-b border-[#f0f4f8] transition-all duration-150 group"
      style={{ background: isTop3 ? `${pal.accent}09` : "white" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isTop3 ? `${pal.accent}14` : "#f8faff"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isTop3 ? `${pal.accent}09` : "white"; }}>

      {/* Rank + trend */}
      <td className="pl-0 pr-3 py-3 w-20"
        style={{ borderLeft: `4px solid ${isTop3 ? pal.accent : "transparent"}` }}>
        <div className="flex items-center gap-2 pl-3">
          {isTop3 ? (
            <div className="size-9 rounded-full flex items-center justify-center font-extrabold text-white shrink-0"
              style={{ background: pal.grad, fontFamily: "var(--font-sans)", fontSize: 14, boxShadow: `0 4px 12px ${pal.glow}` }}>
              {entry.rank}
            </div>
          ) : (
            <div className="size-9 flex items-center justify-center font-bold shrink-0"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: entry.rank <= 6 ? "#0b1426" : "#94a3b8" }}>
              {entry.rank}
            </div>
          )}
          <div className="flex flex-col items-center gap-0.5">
            {delta > 0 && <><ArrowUp className="size-3" style={{ color: "#059669" }} /><span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "#059669" }}>{delta}</span></>}
            {delta < 0 && <><ArrowDown className="size-3" style={{ color: "#c8102e" }} /><span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "#c8102e" }}>{Math.abs(delta)}</span></>}
            {delta === 0 && <Minus className="size-3 text-[#cbd5e1]" />}
          </div>
        </div>
      </td>

      {/* Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-full flex items-center justify-center font-bold text-white shrink-0"
            style={{ background: isTop3 ? pal.grad : "linear-gradient(135deg,#1C5FBE,#1a2744)", fontSize: 13, fontFamily: "var(--font-sans)" }}>
            {entry.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold" style={{ fontSize: 13, color: "#0b1426", fontFamily: "var(--font-sans)" }}>{entry.name}</div>
            {entry.chucVu && <div style={{ fontSize: 12, color: "#94a3b8" }}>{entry.chucVu}</div>}
          </div>
        </div>
      </td>

      {/* Unit */}
      <td className="px-3 py-3 max-w-[140px]">
        <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#5a6474" }}>
          <Building2 className="size-3.5 shrink-0 text-[#94a3b8]" />
          <span className="truncate">{entry.unit}</span>
        </div>
      </td>

      {/* Score bars */}
      <td className="px-3 py-3 min-w-[200px]">
        <div className="space-y-1.5">
          {entry.diem.map(d => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="w-16 text-right shrink-0" style={{ fontSize: 11, color: "#94a3b8", fontFamily: "var(--font-sans)" }}>{d.label}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${d.v}%`, background: d.color }} />
              </div>
              <span className="w-6 shrink-0 font-bold" style={{ fontSize: 11, fontFamily: "JetBrains Mono,monospace", color: d.color }}>{d.v}</span>
            </div>
          ))}
        </div>
      </td>

      {/* Total score */}
      <td className="px-3 py-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <span className="font-extrabold leading-none"
            style={{ fontSize: 20, fontFamily: "var(--font-sans)", color: isTop3 ? pal.accent : "#0b1426" }}>
            {entry.score.toFixed(1)}
          </span>
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-bold"
            style={{
              fontSize: 11, fontFamily: "JetBrains Mono,monospace",
              background: scoreDelta >= 0 ? "rgba(5,150,105,0.1)" : "rgba(200,16,46,0.1)",
              color: scoreDelta >= 0 ? "#059669" : "#c8102e",
            }}>
            {scoreDelta > 0 ? <TrendingUp className="size-2.5" /> : scoreDelta < 0 ? <TrendingDown className="size-2.5" /> : <Minus className="size-2.5" />}
            {scoreDelta > 0 ? "+" : ""}{scoreDelta.toFixed(1)}
          </span>
        </div>
      </td>

      {/* Awards */}
      <td className="px-3 pr-5 py-3">
        {entry.awards.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium"
            style={{ fontSize: 12, background: "#fef3c7", color: "#92400e", fontFamily: "var(--font-sans)", border: "1px solid #fde68a" }}>
            <Star className="size-3 fill-[#f59e0b] text-[#f59e0b]" />{entry.awards[0]}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#e2e8f0" }}>—</span>
        )}
      </td>
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function BangXepHangPage({ user }: { user: LoginUser }) {
  const [type, setType] = useState<RankType>("ca_nhan");
  const [phongTrao, setPhongTrao] = useState<PhongTrao>("Lao động giỏi 2026");
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTick(p => p + 1); setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const data = buildRankData(tick, type).filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.unit.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = data.slice(0, 3);
  const lastUpdate = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#f8faff", fontFamily: "var(--font-sans)" }}>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <div className="shrink-0" style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        {/* Top accent bar */}
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#c8102e 0%,#1C5FBE 35%,#6366f1 65%,#f59e0b 100%)" }} />

        <div className="px-6 pt-4 pb-4">
          <div className="flex items-center gap-3 mb-4">
            {/* Icon */}
            <div className="size-11 rounded-[12px] flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", boxShadow: "0 4px 16px rgba(245,158,11,0.35)" }}>
              <Trophy className="size-5 text-white" />
            </div>

            <div>
              <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 20, color: "#0b1426" }}>
                Bảng Xếp hạng Thi đua
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="size-2 rounded-full"
                  style={{ background: "#22c55e", boxShadow: pulse ? "0 0 8px #22c55e" : "none", transition: "box-shadow 0.3s" }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Realtime · Cập nhật lúc {lastUpdate} · Tự động refresh 8s
                </span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button className="flex items-center gap-1.5 h-8 px-3 rounded-[7px] text-[13px] transition-colors"
                style={{ border: "1px solid #e2e8f0", color: "#5a6474", fontFamily: "var(--font-sans)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1C5FBE"; (e.currentTarget as HTMLElement).style.color = "#1C5FBE"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.color = "#5a6474"; }}>
                <Download className="size-3.5" /> Xuất Excel
              </button>
              <div className={`flex items-center gap-1.5 h-8 px-3 rounded-[7px] text-[13px] transition-all`}
                style={{
                  border: `1px solid ${pulse ? "#bbf7d0" : "#e2e8f0"}`,
                  background: pulse ? "#f0fdf4" : "white",
                  color: pulse ? "#059669" : "#94a3b8",
                  fontFamily: "var(--font-sans)",
                }}>
                <Zap className="size-3.5" />
                {pulse ? "Đang cập nhật..." : "Đang theo dõi"}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Phong trao */}
            <div className="relative">
              <select value={phongTrao} onChange={e => setPhongTrao(e.target.value as PhongTrao)}
                className="pl-3 pr-8 border rounded-[7px] text-[13px] appearance-none outline-none transition-colors"
                style={{ height: 34, borderColor: "#e2e8f0", background: "#f8faff", color: "#0b1426", fontFamily: "var(--font-sans)" }}>
                {PHONG_TRAO_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown className="size-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            </div>

            {/* Type toggle */}
            <div className="flex rounded-[7px] overflow-hidden p-0.5 gap-0.5"
              style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
              {([["ca_nhan", User, "Cá nhân"], ["tap_the", Users, "Tập thể"]] as const).map(([k, Icon, l]) => (
                <button key={k} onClick={() => setType(k)}
                  className="flex items-center gap-1.5 px-4 h-[28px] text-[13px] rounded-[5px] transition-all"
                  style={{
                    background: type === k ? "#ffffff" : "transparent",
                    color: type === k ? "#0b1426" : "#94a3b8",
                    fontWeight: type === k ? 600 : 400,
                    fontFamily: "var(--font-sans)",
                    boxShadow: type === k ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  }}>
                  <Icon className="size-3.5" />{l}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, đơn vị..."
                className="pl-8 pr-3 rounded-[7px] text-[13px] outline-none transition-colors"
                style={{ height: 34, width: 200, border: "1px solid #e2e8f0", background: "#f8faff", color: "#0b1426", fontFamily: "var(--font-sans)" }}
                onFocus={e => { e.target.style.borderColor = "#1C5FBE"; e.target.style.boxShadow = "0 0 0 3px rgba(28,95,190,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
            </div>

            <span className="ml-auto" style={{ fontSize: 12, color: "#94a3b8" }}>
              {data.length} {type === "ca_nhan" ? "cá nhân" : "tập thể"}
            </span>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ═════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">

        {/* Podium */}
        {!search && top3.length >= 3 && (
          <Podium top3={top3} />
        )}

        {/* Table */}
        <div className="mx-4 my-4 rounded-[14px] overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(11,20,38,0.05)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8faff", borderBottom: "2px solid #e2e8f0" }}>
                {["Hạng", "Họ tên / Tập thể", "Đơn vị", "Điểm thành phần", "Tổng điểm", "Thành tích"].map(h => (
                  <th key={h} className="px-3 py-3 text-left uppercase tracking-wider"
                    style={{ fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 700, color: "#64748b", letterSpacing: "0.08em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(e => <RankRow key={e.id} entry={e} />)}
            </tbody>
          </table>

          {data.length === 0 && (
            <div className="flex flex-col items-center py-16 gap-3">
              <Trophy className="size-12 text-[#e2e8f0]" />
              <p style={{ fontSize: 13, color: "#94a3b8", fontFamily: "var(--font-sans)" }}>Không tìm thấy kết quả phù hợp</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mx-4 mb-4 px-5 py-3 rounded-[10px] flex items-center gap-5 flex-wrap"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
          {[
            { color: RANK_PALETTE[1].accent, label: "Hạng Nhất" },
            { color: RANK_PALETTE[2].accent, label: "Hạng Nhì" },
            { color: RANK_PALETTE[3].accent, label: "Hạng Ba" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#5a6474" }}>
              <div className="size-3 rounded-full" style={{ background: color }} />{label}
            </div>
          ))}
          <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#059669" }}>
            <ArrowUp className="size-3" />Thứ hạng tăng
          </div>
          <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#c8102e" }}>
            <ArrowDown className="size-3" />Thứ hạng giảm
          </div>
          <span className="ml-auto" style={{ fontSize: 11, color: "#94a3b8", fontFamily: "JetBrains Mono, monospace" }}>
            {phongTrao} · Kỳ 2026
          </span>
        </div>
      </div>
    </div>
  );
}
