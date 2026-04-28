import { useState, useEffect, useRef } from "react";
import {
  Trophy, TrendingUp, TrendingDown, Minus, Star,
  ChevronDown, Award, Users, User, Filter, RefreshCw,
  Crown, Medal, Sparkles, BarChart2, Building2,
  ArrowUp, ArrowDown, Download, Search, Zap,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES & DATA
═══════════════════════════════════════════════════════════════ */
type RankType = "ca_nhan" | "tap_the";
type PhongTrao =
  | "Lao động giỏi 2026"
  | "Sáng tạo Kỹ thuật 2025–2026"
  | "Đơn vị văn hóa 2025";

interface RankEntry {
  id: string;
  rank: number;
  prevRank: number;
  name: string;
  unit: string;
  chucVu?: string;
  score: number;
  prevScore: number;
  diem: { label: string; v: number; max: number; color: string }[];
  awards: string[];
  type: RankType;
  dong?: boolean; // co dong hang
}

function makeScore(base: number, offset: number) {
  return Math.min(100, Math.max(55, base + offset + (Math.random() - 0.5) * 0.4));
}

const PHONG_TRAO_LIST: PhongTrao[] = [
  "Lao động giỏi 2026",
  "Sáng tạo Kỹ thuật 2025–2026",
  "Đơn vị văn hóa 2025",
];

const BASE_DATA: Omit<RankEntry, "score" | "prevScore" | "rank" | "prevRank">[] = [
  {
    id: "p1", name: "Nguyễn Văn An", unit: "VP Tỉnh ủy", chucVu: "Phó Trưởng phòng", type: "ca_nhan",
    diem: [{ label: "Kỷ luật", v: 97, max: 100, color: "#1C5FBE" }, { label: "Hiệu quả", v: 95, max: 100, color: "#166534" }, { label: "Sáng tạo", v: 91, max: 100, color: "#8a6400" }],
    awards: ["CSTĐ cơ sở 3 năm liên tiếp"],
  },
  {
    id: "p2", name: "Trần Thị Bích", unit: "Sở Y tế", chucVu: "Trưởng Khoa Nội", type: "ca_nhan",
    diem: [{ label: "Kỷ luật", v: 98, max: 100, color: "#1C5FBE" }, { label: "Hiệu quả", v: 93, max: 100, color: "#166534" }, { label: "Sáng tạo", v: 89, max: 100, color: "#8a6400" }],
    awards: ["Bằng khen Bộ Y tế 2024"],
  },
  {
    id: "p3", name: "Phạm Minh Tuấn", unit: "Sở GTVT", chucVu: "Kỹ sư trưởng", type: "ca_nhan",
    diem: [{ label: "Kỷ luật", v: 94, max: 100, color: "#1C5FBE" }, { label: "Hiệu quả", v: 92, max: 100, color: "#166534" }, { label: "Sáng tạo", v: 93, max: 100, color: "#8a6400" }],
    awards: [],
  },
  {
    id: "p4", name: "Lê Thị Thanh Xuân", unit: "Sở GD&ĐT", chucVu: "Phó Giám đốc", type: "ca_nhan",
    diem: [{ label: "Kỷ luật", v: 92, max: 100, color: "#1C5FBE" }, { label: "Hiệu quả", v: 91, max: 100, color: "#166534" }, { label: "Sáng tạo", v: 88, max: 100, color: "#8a6400" }],
    awards: ["CSTĐ cấp Tỉnh 2023"],
  },
  {
    id: "p5", name: "Đinh Công Sơn", unit: "Sở TT&TT", chucVu: "Kỹ sư CNTT", type: "ca_nhan",
    diem: [{ label: "Kỷ luật", v: 90, max: 100, color: "#1C5FBE" }, { label: "Hiệu quả", v: 88, max: 100, color: "#166534" }, { label: "Sáng tạo", v: 95, max: 100, color: "#8a6400" }],
    awards: [],
  },
  {
    id: "p6", name: "Võ Hoàng Linh", unit: "Ban TC TU", chucVu: "Chuyên viên", type: "ca_nhan",
    diem: [{ label: "Kỷ luật", v: 95, max: 100, color: "#1C5FBE" }, { label: "Hiệu quả", v: 86, max: 100, color: "#166534" }, { label: "Sáng tạo", v: 82, max: 100, color: "#8a6400" }],
    awards: [],
  },
  {
    id: "p7", name: "Bùi Đức Nam", unit: "Sở KH&ĐT", chucVu: "Trưởng phòng", type: "ca_nhan",
    diem: [{ label: "Kỷ luật", v: 89, max: 100, color: "#1C5FBE" }, { label: "Hiệu quả", v: 85, max: 100, color: "#166534" }, { label: "Sáng tạo", v: 84, max: 100, color: "#8a6400" }],
    awards: [],
  },
  {
    id: "p8", name: "Nguyễn Thị Hồng", unit: "Sở LĐ-TB&XH", chucVu: "Phó Trưởng phòng", type: "ca_nhan",
    diem: [{ label: "Kỷ luật", v: 86, max: 100, color: "#1C5FBE" }, { label: "Hiệu quả", v: 87, max: 100, color: "#166534" }, { label: "Sáng tạo", v: 80, max: 100, color: "#8a6400" }],
    awards: [],
  },
  // Tập thể
  {
    id: "tt1", name: "Phòng Tổng hợp VP", unit: "VP Tỉnh ủy", type: "tap_the",
    diem: [{ label: "Kỷ luật", v: 98, max: 100, color: "#1C5FBE" }, { label: "Hoàn thành", v: 97, max: 100, color: "#166534" }, { label: "Sáng kiến", v: 92, max: 100, color: "#8a6400" }],
    awards: ["Tập thể LĐXS 4 năm liên tục"],
  },
  {
    id: "tt2", name: "Sở GD&ĐT ĐN", unit: "Tỉnh Đồng Nai", type: "tap_the",
    diem: [{ label: "Kỷ luật", v: 97, max: 100, color: "#1C5FBE" }, { label: "Hoàn thành", v: 95, max: 100, color: "#166534" }, { label: "Sáng kiến", v: 90, max: 100, color: "#8a6400" }],
    awards: ["Cờ thi đua Chính phủ 2025"],
  },
  {
    id: "tt3", name: "BV Đa khoa Đồng Nai", unit: "Sở Y tế", type: "tap_the",
    diem: [{ label: "Kỷ luật", v: 95, max: 100, color: "#1C5FBE" }, { label: "Hoàn thành", v: 96, max: 100, color: "#166534" }, { label: "Sáng kiến", v: 88, max: 100, color: "#8a6400" }],
    awards: [],
  },
  {
    id: "tt4", name: "Khoa Nhi BV Nhi ĐN", unit: "Sở Y tế", type: "tap_the",
    diem: [{ label: "Kỷ luật", v: 92, max: 100, color: "#1C5FBE" }, { label: "Hoàn thành", v: 93, max: 100, color: "#166534" }, { label: "Sáng kiến", v: 86, max: 100, color: "#8a6400" }],
    awards: [],
  },
  {
    id: "tt5", name: "Phòng CS Kinh tế CA", unit: "Công an Tỉnh", type: "tap_the",
    diem: [{ label: "Kỷ luật", v: 96, max: 100, color: "#1C5FBE" }, { label: "Hoàn thành", v: 89, max: 100, color: "#166534" }, { label: "Sáng kiến", v: 82, max: 100, color: "#8a6400" }],
    awards: [],
  },
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
    ...entry,
    rank: idx + 1,
    prevRank: prevSorted.findIndex(p => p.id === entry.id) + 1,
  }));
}

/* ═══════════════════════════════════════════════════════════════
   PODIUM
═══════════════════════════════════════════════════════════════ */
function Podium({ top3 }: { top3: RankEntry[] }) {
  const [first, second, third] = top3;
  const heights = [160, 120, 100];
  const order = [second, first, third];
  const orderRanks = [2, 1, 3];
  const orderHeights = [heights[1], heights[0], heights[2]];
  const medalColors = ["#C0C0C0", "#8a6400", "#CD7F32"];
  const bgColors = ["rgba(192,192,192,0.15)", "rgba(212,168,75,0.2)", "rgba(205,127,50,0.15)"];

  return (
    <div className="flex items-end justify-center gap-3 pb-4 pt-2">
      {order.map((entry, i) => {
        if (!entry) return null;
        const rankIdx = orderRanks[i] - 1;
        const h = orderHeights[i];
        const mColor = medalColors[i];
        const bg = bgColors[i];
        const isFirst = orderRanks[i] === 1;
        return (
          <div key={entry.id} className="flex flex-col items-center gap-2" style={{ width: 140 }}>
            {/* Crown for 1st */}
            {isFirst && <Crown className="size-6 text-[#8a6400] mb-1" style={{ filter: "drop-shadow(0 0 8px #8a6400)" }} />}
            {/* Avatar */}
            <div className="size-14 rounded-full flex items-center justify-center text-[18px] text-white"
              style={{ background: `linear-gradient(135deg,${mColor},${mColor}88)`, fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18 }}>
              {entry.name.charAt(0)}
            </div>
            <div className="text-center">
              <div className="text-[13px] text-[#0b1426] leading-tight" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{entry.name}</div>
              <div className="text-[13px] text-[#635647]">{entry.unit}</div>
              <div className="text-[14px] mt-1" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: mColor }}>{entry.score.toFixed(1)}</div>
            </div>
            {/* Podium block */}
            <div className="w-full rounded-t-[8px] flex items-center justify-center"
              style={{ height: h, background: `linear-gradient(180deg,${bg},rgba(255,255,255,0.02))`, border: `2px solid ${mColor}30`, borderBottom: "none" }}>
              <span className="text-[24px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: mColor, opacity: 0.7 }}>{orderRanks[i]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RANK ROW
═══════════════════════════════════════════════════════════════ */
function RankRow({ entry, tick }: { entry: RankEntry; tick: number }) {
  const delta = entry.prevRank - entry.rank; // positive = moved up
  const scoreDelta = entry.score - entry.prevScore;
  const isTop3 = entry.rank <= 3;
  const medalColor = ["#8a6400", "#C0C0C0", "#CD7F32"][entry.rank - 1] ?? null;

  return (
    <tr className="border-b border-[#eef2f8] hover:bg-[#f4f7fb] transition-colors">
      {/* Rank */}
      <td className="pl-5 pr-3 py-3 w-14">
        <div className="flex items-center gap-1.5">
          {medalColor ? (
            <div className="size-8 rounded-full flex items-center justify-center text-[13px] text-white"
              style={{ background: `linear-gradient(135deg,${medalColor},${medalColor}aa)`, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {entry.rank}
            </div>
          ) : (
            <span className="size-8 flex items-center justify-center text-[13px] text-[#635647]"
              style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
              {entry.rank}
            </span>
          )}
          <div className="flex flex-col items-center">
            {delta > 0 && <ArrowUp className="size-3 text-[#166534]" />}
            {delta < 0 && <ArrowDown className="size-3 text-[#c8102e]" />}
            {delta === 0 && <Minus className="size-3 text-[#d1d5db]" />}
            {delta !== 0 && (
              <span className="text-[13px]" style={{ color: delta > 0 ? "#166534" : "#c8102e", fontFamily: "JetBrains Mono, monospace" }}>
                {Math.abs(delta)}
              </span>
            )}
          </div>
        </div>
      </td>
      {/* Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-full flex items-center justify-center text-[13px] text-white shrink-0"
            style={{ background: `linear-gradient(135deg,${isTop3 ? medalColor! : "#1C5FBE"},${isTop3 ? medalColor + "aa" : "#1a2744"})`, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            {entry.name.charAt(0)}
          </div>
          <div>
            <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{entry.name}</div>
            {entry.chucVu && <div className="text-[13px] text-[#635647]">{entry.chucVu}</div>}
          </div>
        </div>
      </td>
      {/* Unit */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5 text-[13px] text-[#5a5040]">
          <Building2 className="size-3.5 shrink-0 text-[#6b5e47]" />{entry.unit}
        </div>
      </td>
      {/* Score bars */}
      <td className="px-3 py-3 min-w-[180px]">
        <div className="space-y-1">
          {entry.diem.map(d => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="text-[13px] text-[#6b5e47] w-14 text-right shrink-0" style={{ fontFamily: "var(--font-sans)" }}>{d.label}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#eef2f8" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.v}%`, background: d.color }} />
              </div>
              <span className="text-[13px] w-7 shrink-0" style={{ fontFamily: "JetBrains Mono, monospace", color: d.color }}>{d.v}</span>
            </div>
          ))}
        </div>
      </td>
      {/* Total score */}
      <td className="px-3 py-3 text-right">
        <div className="flex flex-col items-end">
          <span className="text-[18px] leading-none" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: isTop3 ? medalColor! : "#0b1426" }}>
            {entry.score.toFixed(1)}
          </span>
          <div className={`flex items-center gap-0.5 text-[13px] ${scoreDelta >= 0 ? "text-[#166534]" : "text-[#c8102e]"}`}>
            {scoreDelta > 0 ? <TrendingUp className="size-3" /> : scoreDelta < 0 ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
            <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{scoreDelta > 0 ? "+" : ""}{scoreDelta.toFixed(1)}</span>
          </div>
        </div>
      </td>
      {/* Awards */}
      <td className="px-3 pr-5 py-3">
        {entry.awards.length > 0 ? (
          <span className="flex items-center gap-1 text-[13px] text-[#8a6400]" style={{ fontFamily: "var(--font-sans)" }}>
            <Star className="size-3 fill-[#8a6400]" />{entry.awards[0]}
          </span>
        ) : (
          <span className="text-[13px] text-[#d1ccc0]" style={{ fontFamily: "var(--font-sans)" }}>—</span>
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

  // Simulate realtime updates every 8s
  useEffect(() => {
    const t = setInterval(() => {
      setTick(p => p + 1);
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const data = buildRankData(tick, type).filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.unit.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  const lastUpdate = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0] shrink-0" style={{ background: "linear-gradient(to bottom,#0b1426,#1a2744)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-11 rounded-[12px] flex items-center justify-center" style={{ background: "rgba(212,168,75,0.2)" }}>
            <Trophy className="size-6 text-[#8a6400]" />
          </div>
          <div>
            <h1 className="text-[18px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Bảng Xếp hạng Thi đua
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`size-2 rounded-full ${pulse ? "bg-[#4ade80]" : "bg-[#4ade80]"} transition-all`}
                style={{ boxShadow: pulse ? "0 0 8px #4ade80" : "none" }} />
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }}>
                Realtime · Cập nhật lúc {lastUpdate} · Tự động refresh 8s
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[13px]"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)" }}>
              <Download className="size-3.5" />Xuất Excel
            </button>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] transition-all ${pulse ? "bg-[#4ade80]/20 border border-[#4ade80]/40" : "border border-white/10"}`}
              style={{ color: pulse ? "#4ade80" : "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans)" }}>
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
              className="pl-3 pr-8 border rounded-[6px] text-[13px] appearance-none text-white outline-none"
              style={{ height: 34, background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans)" }}>
              {PHONG_TRAO_LIST.map(p => <option key={p} value={p} style={{ background: "#0b1426" }}>{p}</option>)}
            </select>
            <ChevronDown className="size-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
          {/* Type toggle */}
          <div className="flex rounded-[6px] overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
            {([["ca_nhan", User, "Cá nhân"], ["tap_the", Users, "Tập thể"]] as const).map(([k, Icon, l]) => (
              <button key={k} onClick={() => setType(k)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] transition-colors"
                style={{ background: type === k ? "#8a6400" : "rgba(255,255,255,0.05)", color: type === k ? "white" : "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)", fontWeight: type === k ? 700 : 400 }}>
                <Icon className="size-3.5" />{l}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.35)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, đơn vị..."
              className="pl-8 pr-3 border rounded-[6px] text-[13px] text-white placeholder-white/30 outline-none"
              style={{ height: 34, width: 200, background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans)" }} />
          </div>
          <span className="ml-auto text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>{data.length} {type === "ca_nhan" ? "cá nhân" : "tập thể"}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Podium */}
        {!search && top3.length >= 3 && (
          <div className="border-b border-[#e2e8f0] px-6 py-2" style={{ background: "linear-gradient(to bottom,#1a2744,#0b1426)" }}>
            <Podium top3={top3} />
          </div>
        )}

        {/* Table */}
        <div style={{ background: "white" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#e2e8f0]" style={{ background: "#ffffff" }}>
                {["Hạng", "Họ tên / Tập thể", "Đơn vị", "Điểm thành phần", "Tổng điểm", "Thành tích"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[13px] uppercase tracking-wider text-[#635647]"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(e => <RankRow key={e.id} entry={e} tick={tick} />)}
            </tbody>
          </table>

          {data.length === 0 && (
            <div className="flex flex-col items-center py-16 gap-3">
              <Trophy className="size-12 text-[#d1ccc0]" />
              <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Không tìm thấy kết quả phù hợp</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-t border-[#e2e8f0] flex items-center gap-4" style={{ background: "#ffffff" }}>
          {[["#8a6400", "Hạng Nhất"], ["#C0C0C0", "Hạng Nhì"], ["#CD7F32", "Hạng Ba"]].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5 text-[13px] text-[#635647]">
              <div className="size-3 rounded-full" style={{ background: c as string }} />{l}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-[13px] text-[#166534] ml-2">
            <ArrowUp className="size-3" />Thứ hạng tăng
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-[#c8102e]">
            <ArrowDown className="size-3" />Thứ hạng giảm
          </div>
          <span className="ml-auto text-[13px] text-[#6b5e47]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            Phong trào: {phongTrao} · Kỳ: 2026
          </span>
        </div>
      </div>
    </div>
  );
}
