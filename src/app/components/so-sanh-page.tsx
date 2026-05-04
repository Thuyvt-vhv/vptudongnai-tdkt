import { useState } from "react";
import {
  GitCompare, ChevronDown, Sparkles, CheckCircle2, XCircle,
  AlertTriangle, Trophy, Award, User, Building2, Calendar,
  Star, ArrowRight, Plus, X, TrendingUp, Shield, Minus,
  BarChart3, Hash, Tag,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface HoSoFull {
  id: string;
  ten: string;
  danhHieu: string;
  donVi: string;
  chucVu: string;
  namSinh: number;
  namVaoNganh: number;
  namCongTacHienTai: number;
  soNamCSTD: number;
  aiScore: number;
  aiEligible: boolean;
  aiFlags: string[];
  status: string;
  statusColor: string;
  slaStatus: "ok" | "warning" | "overdue";
  tongDiem: number;
  tienTichCaNhan: string[];
  canCuPhapLy: string[];
  avatarFrom: string;
  avatarTo: string;
}

/* ─── Demo data ─────────────────────────────────────────────── */
const DEMO_HOSOSO: HoSoFull[] = [
  {
    id:"NS-2026-0147", ten:"Nguyễn Văn An",    danhHieu:"CSTĐ Toàn quốc",  donVi:"Sở GDĐT",     chucVu:"Chuyên viên",
    namSinh:1985, namVaoNganh:2010, namCongTacHienTai:16, soNamCSTD:5,
    aiScore:94, aiEligible:true, aiFlags:[],
    status:"Chờ ký số", statusColor:"#1C5FBE",
    slaStatus:"overdue", tongDiem:92,
    tienTichCaNhan:["CSTĐCS 2021-2025 (5 năm liên tiếp)","Đề tài NCKH cấp tỉnh 2023","Sáng kiến kinh nghiệm xuất sắc 2024"],
    canCuPhapLy:["Điều 23 Luật TĐKT 2022","Điều 11 NĐ 152/2025/NĐ-CP"],
    avatarFrom:"#1C5FBE", avatarTo:"#7c3aed",
  },
  {
    id:"NS-2026-0153", ten:"Vũ Đức Khoa",      danhHieu:"CSTĐ Cơ sở",      donVi:"Sở TN&MT",    chucVu:"Chuyên viên chính",
    namSinh:1982, namVaoNganh:2008, namCongTacHienTai:18, soNamCSTD:3,
    aiScore:81, aiEligible:true, aiFlags:["Thiếu minh chứng NCKH"],
    status:"Đang thẩm định", statusColor:"#b45309",
    slaStatus:"ok", tongDiem:79,
    tienTichCaNhan:["CSTĐCS 2023-2025 (3 năm)","Bằng khen Bộ 2022","Hoàn thành xuất sắc nhiệm vụ 2024"],
    canCuPhapLy:["Điều 24 Luật TĐKT 2022","Điều 12 NĐ 152/2025/NĐ-CP"],
    avatarFrom:"#166534", avatarTo:"#0b7c52",
  },
  {
    id:"NS-2026-0142", ten:"Trần Thị Bích",    danhHieu:"Bằng khen UBND tỉnh",donVi:"Ban TC Tỉnh ủy",chucVu:"Phó Trưởng ban",
    namSinh:1979, namVaoNganh:2003, namCongTacHienTai:23, soNamCSTD:7,
    aiScore:76, aiEligible:true, aiFlags:["Kiểm tra lại mã số CBCC"],
    status:"Chờ ký số", statusColor:"#1C5FBE",
    slaStatus:"warning", tongDiem:84,
    tienTichCaNhan:["LĐTT cấp Tỉnh 2020-2025","Bằng khen UBND 2023","Đảng viên đủ tư cách 2024"],
    canCuPhapLy:["Điều 26 Luật TĐKT 2022","Điều 15 NĐ 152/2025/NĐ-CP"],
    avatarFrom:"#c8102e", avatarTo:"#9b1c1c",
  },
  {
    id:"NS-2026-0160", ten:"Nguyễn Đình Hùng", danhHieu:"CSTĐ Cơ sở",      donVi:"Sở Công Thương",chucVu:"Trưởng phòng",
    namSinh:1988, namVaoNganh:2012, namCongTacHienTai:14, soNamCSTD:3,
    aiScore:89, aiEligible:true, aiFlags:[],
    status:"Vừa tạo", statusColor:"#166534",
    slaStatus:"ok", tongDiem:87,
    tienTichCaNhan:["CSTĐCS 2023-2025","Giải nhì Hội thi Tay nghề 2024","Đề án chuyển đổi số đơn vị"],
    canCuPhapLy:["Điều 24 Luật TĐKT 2022","Điều 12 NĐ 152/2025/NĐ-CP"],
    avatarFrom:"#7c3aed", avatarTo:"#5b21b6",
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPARISON CRITERIA
═══════════════════════════════════════════════════════════════ */
interface Criterion {
  key: keyof HoSoFull | "slaLabel" | "eligibleLabel";
  label: string;
  render: (hs: HoSoFull) => string | number;
  compare?: (a: HoSoFull, b: HoSoFull) => "better" | "worse" | "equal";
}

const CRITERIA: { group: string; items: Criterion[] }[] = [
  {
    group: "Thông tin cơ bản",
    items: [
      { key:"ten",               label:"Họ và tên",             render: h => h.ten },
      { key:"danhHieu",          label:"Danh hiệu đề nghị",     render: h => h.danhHieu },
      { key:"donVi",             label:"Đơn vị",                render: h => h.donVi },
      { key:"chucVu",            label:"Chức vụ",               render: h => h.chucVu },
      { key:"namSinh",           label:"Năm sinh",              render: h => h.namSinh },
    ],
  },
  {
    group: "Kinh nghiệm & Thâm niên",
    items: [
      { key:"namVaoNganh",       label:"Năm vào ngành",         render: h => h.namVaoNganh },
      { key:"namCongTacHienTai", label:"Năm công tác",          render: h => `${h.namCongTacHienTai} năm`, compare: (a,b) => a.namCongTacHienTai > b.namCongTacHienTai ? "better" : a.namCongTacHienTai < b.namCongTacHienTai ? "worse" : "equal" },
      { key:"soNamCSTD",         label:"Số năm CSTĐCS liên tiếp",render: h => `${h.soNamCSTD} năm`,       compare: (a,b) => a.soNamCSTD > b.soNamCSTD ? "better" : a.soNamCSTD < b.soNamCSTD ? "worse" : "equal" },
    ],
  },
  {
    group: "Đánh giá AI & Điểm số",
    items: [
      { key:"aiScore",           label:"Điểm Trợ lý AI",        render: h => `${h.aiScore}/100`,          compare: (a,b) => a.aiScore > b.aiScore ? "better" : a.aiScore < b.aiScore ? "worse" : "equal" },
      { key:"tongDiem",          label:"Tổng điểm chấm",        render: h => `${h.tongDiem}/100`,         compare: (a,b) => a.tongDiem > b.tongDiem ? "better" : a.tongDiem < b.tongDiem ? "worse" : "equal" },
      { key:"eligibleLabel",     label:"Đủ điều kiện",          render: h => h.aiEligible ? "✅ Đủ điều kiện" : "❌ Chưa đủ" },
    ],
  },
  {
    group: "Trạng thái hồ sơ",
    items: [
      { key:"status",            label:"Trạng thái",            render: h => h.status },
      { key:"slaLabel",          label:"SLA",                   render: h => h.slaStatus === "overdue" ? "⚠ Quá hạn" : h.slaStatus === "warning" ? "⚠ Sắp hết hạn" : "✓ Đúng hạn" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   SELECTOR DROPDOWN
═══════════════════════════════════════════════════════════════ */
function HoSoSelector({ value, onChange, excluded }: {
  value: HoSoFull | null;
  onChange: (hs: HoSoFull | null) => void;
  excluded: string[];
}) {
  const [open, setOpen] = useState(false);
  const options = DEMO_HOSOSO.filter(h => !excluded.includes(h.id));

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-[10px] border text-left transition-all hover:border-[#1C5FBE]"
        style={{ background: value ? "white" : "#ffffff", borderColor: value ? "#bfdbfe" : "#e2e8f0" }}>
        {value ? (
          <>
            <div className="size-9 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
              style={{ background: `linear-gradient(135deg,${value.avatarFrom},${value.avatarTo})`, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {value.ten.split(" ").slice(-1)[0][0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{value.ten}</div>
              <div className="text-[13px] text-[#635647] truncate">{value.id} · {value.danhHieu}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); onChange(null); }} className="shrink-0 hover:text-[#c8102e]">
              <X className="size-4 text-[#635647]"/>
            </button>
          </>
        ) : (
          <>
            <div className="size-9 rounded-full border-2 border-dashed border-[#d1d5db] flex items-center justify-center shrink-0">
              <Plus className="size-4 text-[#635647]"/>
            </div>
            <span className="text-[13px] text-[#6b5e47] flex-1" style={{ fontFamily: "var(--font-sans)" }}>Chọn hồ sơ để so sánh…</span>
            <ChevronDown className="size-4 text-[#635647]"/>
          </>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)}/>
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 rounded-[10px] border border-[#e2e8f0] shadow-xl overflow-hidden"
            style={{ background: "white" }}>
            {options.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-[#635647]">Không còn hồ sơ để chọn</div>
            ) : options.map(hs => (
              <button key={hs.id} onClick={() => { onChange(hs); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f4f7fb] transition-colors">
                <div className="size-8 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
                  style={{ background: `linear-gradient(135deg,${hs.avatarFrom},${hs.avatarTo})`, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  {hs.ten.split(" ").slice(-1)[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{hs.ten}</div>
                  <div className="text-[13px] text-[#635647]">{hs.id} · {hs.danhHieu}</div>
                </div>
                <span className="text-[13px] shrink-0" style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, color: hs.aiScore >= 90 ? "#166534" : hs.aiScore >= 75 ? "#b45309" : "#c8102e" }}>
                  AI {hs.aiScore}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCORE BAR
═══════════════════════════════════════════════════════════════ */
function ScoreBar({ score, max = 100, color }: { score: number; max?: number; color: string }) {
  const pct = (score / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-[#eef2f8]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }}/>
      </div>
      <span className="text-[13px] w-8 text-right" style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, color }}>{score}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AI RECOMMENDATION
═══════════════════════════════════════════════════════════════ */
function AIRecommendation({ cols }: { cols: (HoSoFull | null)[] }) {
  const filled = cols.filter(Boolean) as HoSoFull[];
  if (filled.length < 2) return null;
  const winner = filled.reduce((best, cur) => cur.aiScore > best.aiScore ? cur : best, filled[0]);
  return (
    <div className="mt-6 rounded-[12px] p-5" style={{ background: "linear-gradient(135deg,#f5f0ff,#ede9fe)", border: "1px solid #ddd6fe" }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-5 text-[#7c3aed]"/>
        <span className="text-[14px] text-[#7c3aed]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Trợ lý AI Khuyến nghị</span>
      </div>
      <p className="text-[13px] text-[#0b1426] leading-relaxed mb-3" style={{ fontFamily: "var(--font-sans)" }}>
        Dựa trên đánh giá tổng hợp {filled.length} hồ sơ, AI nhận thấy:{" "}
        <strong>{winner.ten}</strong> (AI Score: {winner.aiScore}/100) có hồ sơ mạnh nhất với{" "}
        {winner.soNamCSTD} năm CSTĐCS liên tiếp và {winner.namCongTacHienTai} năm công tác.{" "}
        {winner.aiFlags.length === 0 ? "Không có vấn đề gì cần lưu ý." : `Lưu ý: ${winner.aiFlags.join(", ")}.`}
      </p>
      <div className="flex flex-wrap gap-2">
        {filled.map(h => (
          <div key={h.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px]"
            style={{ background: h.id === winner.id ? "#7c3aed" : "white", border: `1px solid ${h.id === winner.id ? "#7c3aed" : "#e2e8f0"}` }}>
            {h.id === winner.id && <Trophy className="size-3.5 text-white"/>}
            <span className="text-[13px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: h.id === winner.id ? "white" : "#5a5040" }}>
              {h.ten.split(" ").slice(-2).join(" ")}
            </span>
            <span className="text-[13px]" style={{ fontFamily: "JetBrains Mono,monospace", color: h.id === winner.id ? "rgba(255,255,255,0.8)" : "#635647" }}>
              {h.aiScore}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[13px] text-[#7c3aed]/70 mt-3" style={{ fontFamily: "var(--font-sans)" }}>
        Căn cứ: Luật TĐKT 2022, NĐ 152/2025/NĐ-CP, TT 15/2025/TT-BNV · Kết quả chỉ mang tính tham khảo
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function SoSanhPage({ user }: { user: LoginUser }) {
  const [cols, setCols] = useState<(HoSoFull | null)[]>([DEMO_HOSOSO[0], DEMO_HOSOSO[1], null]);

  const setCol = (i: number, hs: HoSoFull | null) => {
    setCols(p => { const n = [...p]; n[i] = hs; return n; });
  };

  const filledCols = cols.filter(Boolean) as HoSoFull[];
  const excludedIds = cols.filter(Boolean).map(h => h!.id);

  // For a given criterion, find which column has the best value
  const getBestColIdx = (crit: Criterion) => {
    if (!crit.compare || filledCols.length < 2) return null;
    let bestIdx = 0;
    for (let i = 1; i < cols.length; i++) {
      if (!cols[i] || !cols[bestIdx]) continue;
      if (crit.compare(cols[i]!, cols[bestIdx]!) === "better") bestIdx = i;
    }
    return bestIdx;
  };

  const colColors = ["#1C5FBE", "#166534", "#7c3aed"];

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GitCompare className="size-5 text-[#1C5FBE]"/>
              <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>So sánh & Đối chiếu Hồ sơ</h1>
            </div>
            <p className="text-[13px] text-[#635647]">So sánh tối đa 3 hồ sơ đồng thời · Trợ lý AI khuyến nghị ưu tiên</p>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            <Shield className="size-4"/>
            Đối chiếu Luật TĐKT 2022
          </div>
        </div>

        {/* Column selectors */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {cols.map((col, i) => (
            <div key={i}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="size-2 rounded-full" style={{ background: colColors[i] }}/>
                <span className="text-[13px] uppercase tracking-wider text-[#635647]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  Hồ sơ {i+1}
                </span>
              </div>
              <HoSoSelector
                value={col}
                onChange={hs => setCol(i, hs)}
                excluded={excludedIds.filter(id => id !== col?.id)}
              />
            </div>
          ))}
        </div>

        {/* Score overview */}
        {filledCols.length >= 2 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {cols.map((col, i) => col ? (
              <div key={i} className="rounded-[12px] border p-4"
                style={{ background: "white", borderColor: `${colColors[i]}40`, borderTopWidth: 3, borderTopColor: colColors[i] }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="size-10 rounded-full flex items-center justify-center text-white text-[13px]"
                    style={{ background: `linear-gradient(135deg,${col.avatarFrom},${col.avatarTo})`, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                    {col.ten.split(" ").slice(-1)[0][0]}
                  </div>
                  <div>
                    <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{col.ten}</div>
                    <div className="text-[13px] text-[#635647]">{col.id}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[13px] mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                      <span className="text-[#635647]">Điểm AI</span>
                      <span style={{ color: colColors[i], fontWeight: 700 }}>{col.aiScore}/100</span>
                    </div>
                    <ScoreBar score={col.aiScore} color={colColors[i]}/>
                  </div>
                  <div>
                    <div className="flex justify-between text-[13px] mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                      <span className="text-[#635647]">Tổng điểm chấm</span>
                      <span style={{ color: colColors[i], fontWeight: 700 }}>{col.tongDiem}/100</span>
                    </div>
                    <ScoreBar score={col.tongDiem} color={colColors[i]}/>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  {col.aiEligible
                    ? <CheckCircle2 className="size-4 text-[#166534]"/>
                    : <XCircle className="size-4 text-[#c8102e]"/>}
                  <span className="text-[13px]" style={{ fontFamily: "var(--font-sans)", color: col.aiEligible ? "#166534" : "#c8102e", fontWeight: 600 }}>
                    {col.aiEligible ? "Đủ điều kiện" : "Chưa đủ điều kiện"}
                  </span>
                </div>
                {col.aiFlags.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {col.aiFlags.map((f,fi) => (
                      <div key={fi} className="flex items-center gap-1 text-[13px] text-[#b45309]">
                        <AlertTriangle className="size-3 shrink-0"/>
                        <span style={{ fontFamily: "var(--font-sans)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div key={i} className="rounded-[12px] border-2 border-dashed border-[#e2e8f0] p-4 flex flex-col items-center justify-center min-h-[160px] text-center">
                <Plus className="size-8 text-[#d1d5db] mb-2"/>
                <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>Chọn hồ sơ thứ {i+1}</span>
              </div>
            ))}
          </div>
        )}

        {/* Detail comparison table */}
        {filledCols.length >= 2 && (
          <div className="rounded-[12px] border border-[#e2e8f0] overflow-hidden" style={{ background: "white" }}>
            {/* Table header */}
            <div className="grid border-b border-[#e2e8f0]" style={{ gridTemplateColumns: "200px repeat(3, 1fr)", background: "#ffffff" }}>
              <div className="px-4 py-3 text-[13px] uppercase tracking-wider text-[#635647]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                Tiêu chí
              </div>
              {cols.map((col, i) => (
                <div key={i} className="px-4 py-3 border-l border-[#eef2f8]">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full" style={{ background: colColors[i] }}/>
                    <span className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight: col ? 700 : 400 }}>
                      {col ? col.ten.split(" ").slice(-2).join(" ") : <span className="text-[#6b5e47]">—</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Criteria rows */}
            {CRITERIA.map(group => (
              <div key={group.group}>
                {/* Group header */}
                <div className="px-4 py-2 border-b border-[#eef2f8]" style={{ background: "#ffffff" }}>
                  <span className="text-[13px] uppercase tracking-wider text-[#635647]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                    {group.group}
                  </span>
                </div>
                {group.items.map(crit => {
                  const bestIdx = getBestColIdx(crit);
                  return (
                    <div key={String(crit.key)} className="grid border-b border-[#f4f7fb] last:border-0 hover:bg-[#ffffff] transition-colors"
                      style={{ gridTemplateColumns: "200px repeat(3, 1fr)" }}>
                      <div className="px-4 py-3">
                        <span className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{crit.label}</span>
                      </div>
                      {cols.map((col, i) => {
                        const isBest = bestIdx === i && col !== null;
                        const val = col ? String(crit.render(col)) : null;
                        return (
                          <div key={i} className="px-4 py-3 border-l border-[#f4f7fb] flex items-center gap-1.5">
                            {!col ? (
                              <Minus className="size-4 text-[#d1d5db]"/>
                            ) : (
                              <>
                                <span className={`text-[13px] ${isBest ? `font-bold` : ""}`}
                                  style={{ fontFamily: "var(--font-sans)", color: isBest ? colColors[i] : "#0b1426", fontWeight: isBest ? 700 : 400 }}>
                                  {val}
                                </span>
                                {isBest && <TrendingUp className="size-3.5" style={{ color: colColors[i] }}/>}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Thành tích */}
            <div>
              <div className="px-4 py-2 border-b border-[#eef2f8]" style={{ background: "#ffffff" }}>
                <span className="text-[13px] uppercase tracking-wider text-[#635647]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Thành tích nổi bật</span>
              </div>
              <div className="grid border-b border-[#f4f7fb]" style={{ gridTemplateColumns: "200px repeat(3, 1fr)" }}>
                <div className="px-4 py-3"><span className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Danh sách thành tích</span></div>
                {cols.map((col, i) => (
                  <div key={i} className="px-4 py-3 border-l border-[#f4f7fb]">
                    {col ? (
                      <ul className="space-y-1">
                        {col.tienTichCaNhan.map((t, ti) => (
                          <li key={ti} className="flex items-start gap-1.5 text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
                            <Star className="size-3 text-[#8a6400] shrink-0 mt-0.5"/>
                            {t}
                          </li>
                        ))}
                      </ul>
                    ) : <Minus className="size-4 text-[#d1d5db]"/>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filledCols.length < 2 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <GitCompare className="size-16 text-[#d1d5db]"/>
            <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Chọn ít nhất 2 hồ sơ để bắt đầu so sánh
            </h3>
            <p className="text-[13px] text-[#635647] text-center max-w-sm" style={{ fontFamily: "var(--font-sans)" }}>
              Trợ lý AI sẽ phân tích và khuyến nghị hồ sơ nào nên được ưu tiên dựa trên tiêu chí Luật TĐKT 2022.
            </p>
          </div>
        )}

        {/* AI Recommendation */}
        <AIRecommendation cols={cols}/>
      </div>
    </div>
  );
}
