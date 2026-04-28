import { useState, useRef, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  GripVertical, Sparkles, AlertTriangle, Clock, CheckCheck,
  MoreHorizontal, Eye, MessageSquare, ArrowRight, Filter,
  ChevronDown, RefreshCw, Maximize2, Award, User, Building2,
  Circle, CheckCircle2, FileSignature, Gavel, FileText,
  TrendingUp, Users, Plus,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type ColId = "draft" | "review" | "voting" | "signing" | "issued";

interface KanbanCard {
  id: string;
  col: ColId;
  ten: string;
  danhHieu: string;
  donVi: string;
  aiScore: number;
  aiOk: boolean;
  aiFlag?: string;
  sla: "ok" | "warning" | "overdue";
  slaText: string;
  priority: "normal" | "high" | "critical";
  comments: number;
  namDeNghi: number;
  from: string;
  to: string;
}

/* ─── Mock data ─────────────────────────────────────────────── */
const INITIAL_CARDS: KanbanCard[] = [
  // Draft
  { id:"K001", col:"draft",   ten:"Phạm Văn Hoàng",  danhHieu:"CSTĐCS",            donVi:"Sở Y tế",          aiScore:82, aiOk:true,  sla:"ok",      slaText:"Còn 10 ngày", priority:"normal",   comments:0, namDeNghi:2026, from:"#1C5FBE",to:"#7c3aed" },
  { id:"K002", col:"draft",   ten:"Lê Thị Lan",      danhHieu:"Bằng khen UBND",    donVi:"UBND huyện Biên Hòa",aiScore:67,aiOk:false, sla:"ok",      slaText:"Còn 8 ngày",  priority:"normal",   comments:1, namDeNghi:2026, from:"#166534",to:"#15803d" },
  { id:"K003", col:"draft",   ten:"Trần Đức Minh",   danhHieu:"LĐTT cấp tỉnh",     donVi:"Sở Công Thương",   aiScore:91, aiOk:true,  sla:"ok",      slaText:"Còn 14 ngày", priority:"normal",   comments:0, namDeNghi:2026, from:"#8a6400",to:"#b45309" },
  // Review
  { id:"K004", col:"review",  ten:"Nguyễn Thị Hoa",  danhHieu:"CSTĐT",             donVi:"Sở GDĐT",          aiScore:88, aiOk:true,  sla:"warning", slaText:"Còn 2 ngày",  priority:"high",     comments:3, namDeNghi:2026, from:"#7c3aed",to:"#6d28d9" },
  { id:"K005", col:"review",  ten:"Vũ Minh Tuấn",    danhHieu:"CSTĐCS",            donVi:"Sở TN&MT",         aiScore:75, aiOk:true,  sla:"ok",      slaText:"Còn 5 ngày",  priority:"normal",   comments:2, namDeNghi:2026, from:"#1C5FBE",to:"#1752a8" },
  { id:"K006", col:"review",  ten:"Ngô Thị Bạch",    danhHieu:"HCL hạng Ba",       donVi:"Ban TC Tỉnh ủy",   aiScore:93, aiOk:true,  sla:"ok",      slaText:"Còn 7 ngày",  priority:"normal",   comments:1, namDeNghi:2026, from:"#166534",to:"#14532d" },
  // Voting
  { id:"K007", col:"voting",  ten:"Vũ Đức Khoa",     danhHieu:"CSTĐCS",            donVi:"Sở TN&MT",         aiScore:81, aiOk:true,  aiFlag:"Thiếu MK NCKH", sla:"ok", slaText:"Còn 5 ngày", priority:"normal", comments:4, namDeNghi:2026, from:"#166534",to:"#0b7c52" },
  { id:"K008", col:"voting",  ten:"Đặng Hoài Nam",   danhHieu:"BKCP",              donVi:"Sở Nội vụ",        aiScore:85, aiOk:true,  sla:"ok",      slaText:"Còn 4 ngày",  priority:"normal",   comments:2, namDeNghi:2026, from:"#c8102e",to:"#9b1c1c" },
  // Signing
  { id:"K009", col:"signing", ten:"Nguyễn Văn An",   danhHieu:"CSTĐT",             donVi:"Sở GDĐT",          aiScore:94, aiOk:true,  sla:"overdue", slaText:"Quá hạn!",    priority:"critical", comments:2, namDeNghi:2026, from:"#1C5FBE",to:"#7c3aed" },
  { id:"K010", col:"signing", ten:"Trần Thị Bích",   danhHieu:"BKCP",              donVi:"Ban TC Tỉnh ủy",   aiScore:76, aiOk:true,  sla:"warning", slaText:"Còn 1 ngày",  priority:"high",     comments:1, namDeNghi:2026, from:"#c8102e",to:"#9b1c1c" },
  // Issued
  { id:"K011", col:"issued",  ten:"Lê Văn Dũng",     danhHieu:"CSTĐCS",            donVi:"Sở Tài chính",     aiScore:88, aiOk:true,  sla:"ok",      slaText:"Hoàn thành",  priority:"normal",   comments:0, namDeNghi:2026, from:"#166534",to:"#14532d" },
  { id:"K012", col:"issued",  ten:"Nguyễn Hồng Hạnh",danhHieu:"LĐTT cấp tỉnh",    donVi:"Sở Tư pháp",       aiScore:79, aiOk:true,  sla:"ok",      slaText:"Hoàn thành",  priority:"normal",   comments:0, namDeNghi:2026, from:"#7c3aed",to:"#5b21b6" },
];

/* ─── Column config ─────────────────────────────────────────── */
interface ColConfig {
  id: ColId;
  label: string;
  sublabel: string;
  icon: typeof Circle;
  color: string;
  bg: string;
  border: string;
  limit?: number;
}

const COLS: ColConfig[] = [
  { id:"draft",   label:"Tạo & Nộp",      sublabel:"Chờ chuyển thẩm định", icon:FileText,       color:"#5a5040", bg:"#ffffff", border:"#e2e8f0" },
  { id:"review",  label:"Thẩm định",       sublabel:"Hội đồng cơ sở",       icon:Users,          color:"#1C5FBE", bg:"#f0f4ff", border:"#bfdbfe" },
  { id:"voting",  label:"Bỏ phiếu HĐ",    sublabel:"Hội đồng cấp tỉnh",    icon:Gavel,          color:"#7c3aed", bg:"#faf5ff", border:"#ddd6fe" },
  { id:"signing", label:"Ký số",           sublabel:"Lãnh đạo phê duyệt",   icon:FileSignature,  color:"#b45309", bg:"#fef9ec", border:"#fde68a" },
  { id:"issued",  label:"Ban hành QĐ",     sublabel:"Hoàn tất",             icon:CheckCheck,     color:"#166534", bg:"#dcfce7", border:"#86efac" },
];

/* ═══════════════════════════════════════════════════════════════
   DRAG ITEM TYPE
═══════════════════════════════════════════════════════════════ */
const ITEM_TYPE = "KANBAN_CARD";

/* ═══════════════════════════════════════════════════════════════
   CARD COMPONENT
═══════════════════════════════════════════════════════════════ */
function KCard({ card, onMove }: { card: KanbanCard; onMove: (id: string, col: ColId) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: card.id, fromCol: card.col },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  drag(ref);

  const slaColor = card.sla === "overdue" ? "#c8102e" : card.sla === "warning" ? "#b45309" : "#166534";
  const scoreColor = card.aiScore >= 90 ? "#166534" : card.aiScore >= 75 ? "#b45309" : "#c8102e";
  const priorityStyle = card.priority === "critical"
    ? { borderLeft: "3px solid #c8102e" }
    : card.priority === "high"
    ? { borderLeft: "3px solid #b45309" }
    : { borderLeft: "3px solid transparent" };

  return (
    <div ref={ref}
      className="rounded-[10px] border bg-white select-none transition-all hover:shadow-md"
      style={{
        ...priorityStyle,
        borderColor: "#e2e8f0",
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        boxShadow: isDragging ? "none" : "0 1px 4px rgba(0,0,0,0.05)",
      }}>
      <div className="p-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="size-7 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
              style={{ background: `linear-gradient(135deg,${card.from},${card.to})`, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {card.ten.split(" ").slice(-1)[0][0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{card.ten}</div>
              <div className="text-[13px] text-[#635647] truncate" style={{ fontFamily: "var(--font-sans)" }}>{card.donVi.split(" ").slice(0, 3).join(" ")}</div>
            </div>
          </div>
          <GripVertical className="size-3.5 text-[#d1d5db] shrink-0 mt-1 cursor-grab" />
        </div>

        {/* Danh hiệu tag */}
        <div className="mb-2">
          <span className="text-[13px] px-2 py-0.5 rounded-full" style={{ background: "#f0f4ff", color: "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            {card.danhHieu}
          </span>
        </div>

        {/* AI + SLA row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* AI score mini ring */}
            <div className="relative size-7">
              <svg viewBox="0 0 28 28" className="size-7 -rotate-90">
                <circle cx="14" cy="14" r="10" fill="none" stroke="#eef2f8" strokeWidth="3" />
                <circle cx="14" cy="14" r="10" fill="none" stroke={scoreColor} strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 10}`}
                  strokeDashoffset={`${2 * Math.PI * 10 * (1 - card.aiScore / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px]" style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, color: scoreColor }}>{card.aiScore}</span>
              </div>
            </div>
            {card.aiFlag && <AlertTriangle className="size-3 text-[#b45309]" title={card.aiFlag} />}
            {!card.aiFlag && card.aiOk && <Sparkles className="size-3 text-[#7c3aed]" />}
          </div>

          <div className="flex items-center gap-2">
            {card.comments > 0 && (
              <div className="flex items-center gap-0.5 text-[13px] text-[#635647]">
                <MessageSquare className="size-3" />{card.comments}
              </div>
            )}
            <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ color: slaColor, background: `${slaColor}14`, fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}>
              {card.slaText}
            </span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="border-t border-[#f4f7fb] px-3 py-1.5 flex items-center gap-2">
        <button className="flex items-center gap-1 text-[13px] text-[#635647] hover:text-[#1C5FBE] transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
          <Eye className="size-3" />Xem
        </button>
        <span className="text-[#d1d5db]">·</span>
        <button className="flex items-center gap-1 text-[13px] text-[#7c3aed] hover:text-[#5b21b6] transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
          <Sparkles className="size-3" />AI
        </button>
        {/* Move right shortcut */}
        {card.col !== "issued" && (
          <>
            <span className="text-[#d1d5db] ml-auto">·</span>
            <button
              onClick={() => {
                const nextCol = COLS[COLS.findIndex(c => c.id === card.col) + 1]?.id;
                if (nextCol) onMove(card.id, nextCol);
              }}
              className="flex items-center gap-1 text-[13px] text-[#166534] hover:text-[#14532d] transition-colors"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
              <ArrowRight className="size-3" />Chuyển tiếp
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COLUMN COMPONENT
═══════════════════════════════════════════════════════════════ */
function KColumn({
  col, cards, onMove,
}: {
  col: ColConfig;
  cards: KanbanCard[];
  onMove: (id: string, toCol: ColId) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: string; fromCol: ColId }) => {
      if (item.fromCol !== col.id) onMove(item.id, col.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  drop(ref);

  const urgentCount = cards.filter(c => c.sla !== "ok").length;
  const ColIcon = col.icon;

  return (
    <div className="flex flex-col shrink-0 rounded-[12px] overflow-hidden transition-all"
      style={{
        width: collapsed ? 48 : 260,
        background: col.bg,
        border: `1.5px solid ${isOver && canDrop ? col.color : col.border}`,
        boxShadow: isOver && canDrop ? `0 0 0 2px ${col.color}40` : "none",
        transition: "width 0.25s ease, box-shadow 0.2s",
      }}>

      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3 border-b"
        style={{ borderColor: col.border, background: `${col.color}10` }}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2">
              <div className="size-6 rounded flex items-center justify-center" style={{ background: `${col.color}20` }}>
                <ColIcon className="size-3.5" style={{ color: col.color }} />
              </div>
              <div>
                <div className="text-[13px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: col.color }}>{col.label}</div>
                <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{col.sublabel}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-5 rounded-full flex items-center justify-center text-[13px] text-white"
                style={{ background: col.color, fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}>
                {cards.length}
              </span>
              {urgentCount > 0 && (
                <span className="size-4 rounded-full flex items-center justify-center text-[13px] text-white bg-[#c8102e]"
                  style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}>
                  {urgentCount}
                </span>
              )}
              <button onClick={() => setCollapsed(true)} className="size-5 rounded flex items-center justify-center hover:bg-white/60 transition-colors">
                <Maximize2 className="size-3 text-[#635647]" />
              </button>
            </div>
          </>
        ) : (
          <button onClick={() => setCollapsed(false)} className="flex flex-col items-center gap-1.5 w-full py-1">
            <ColIcon className="size-4" style={{ color: col.color }} />
            <span className="text-[13px] text-center" style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, color: col.color, writingMode: "vertical-lr" }}>
              {col.label} ({cards.length})
            </span>
          </button>
        )}
      </div>

      {/* Cards */}
      {!collapsed && (
        <div ref={ref} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]"
          style={{ background: isOver && canDrop ? `${col.color}06` : "transparent" }}>
          {cards.map(card => (
            <KCard key={card.id} card={card} onMove={onMove} />
          ))}
          {cards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50">
              <ColIcon className="size-8" style={{ color: col.color }} />
              <span className="text-[13px] text-center text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                Kéo hồ sơ vào đây
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function KanbanPage({ user }: { user: LoginUser }) {
  const [cards, setCards] = useState<KanbanCard[]>(INITIAL_CARDS);
  const [filterSLA, setFilterSLA] = useState<"all" | "ok" | "warning" | "overdue">("all");
  const [filterUnit, setFilterUnit] = useState("all");

  const moveCard = useCallback((id: string, toCol: ColId) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, col: toCol } : c));
  }, []);

  const visibleCards = cards.filter(c => {
    if (filterSLA !== "all" && c.sla !== filterSLA) return false;
    if (filterUnit !== "all" && !c.donVi.toLowerCase().includes(filterUnit.toLowerCase())) return false;
    return true;
  });

  const totalCards  = cards.length;
  const urgentCards = cards.filter(c => c.sla !== "ok").length;
  const doneCards   = cards.filter(c => c.col === "issued").length;

  const units = Array.from(new Set(cards.map(c => c.donVi.split(" ").slice(0,2).join(" "))));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col overflow-hidden" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>

        {/* Header */}
        <div className="px-8 py-4 border-b border-[#e2e8f0] flex items-center justify-between shrink-0" style={{ background: "white" }}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Bảng Kanban Hồ sơ</h1>
              <span className="text-[13px] px-2 py-0.5 rounded-full text-white" style={{ background: "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 700 }}>Live</span>
            </div>
            <div className="flex items-center gap-4 text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              <span><span style={{ fontWeight: 700, color: "#0b1426" }}>{totalCards}</span> hồ sơ</span>
              <span className="flex items-center gap-1"><AlertTriangle className="size-3.5 text-[#b45309]" /><span style={{ fontWeight: 700, color: "#b45309" }}>{urgentCards}</span> cần xử lý gấp</span>
              <span className="flex items-center gap-1"><CheckCheck className="size-3.5 text-[#166534]" /><span style={{ fontWeight: 700, color: "#166534" }}>{doneCards}</span> đã ban hành</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-[8px] border border-[#e2e8f0]" style={{ background: "#ffffff" }}>
              {([["all","Tất cả"],["ok","Đúng hạn"],["warning","Sắp trễ"],["overdue","Quá hạn"]] as const).map(([v,l]) => (
                <button key={v} onClick={() => setFilterSLA(v)}
                  className="px-2.5 py-1.5 rounded-[6px] text-[13px] transition-all"
                  style={{
                    background: filterSLA === v ? "white" : "transparent",
                    color: filterSLA === v ? (v === "overdue" ? "#c8102e" : v === "warning" ? "#b45309" : "#0b1426") : "#635647",
                    fontFamily: "var(--font-sans)", fontWeight: filterSLA === v ? 700 : 400,
                    boxShadow: filterSLA === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}>
                  {l}
                </button>
              ))}
            </div>

            <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)}
              className="border border-[#e2e8f0] rounded-[8px] px-3 py-2 text-[13px] text-[#0b1426] bg-white outline-none focus:border-[#1C5FBE] transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}>
              <option value="all">Tất cả đơn vị</option>
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>

            <button onClick={() => setCards(INITIAL_CARDS)} className="size-9 rounded-[8px] border border-[#e2e8f0] flex items-center justify-center hover:bg-[#f4f7fb] transition-colors" title="Làm mới">
              <RefreshCw className="size-4 text-[#635647]" />
            </button>
          </div>
        </div>

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex gap-4 h-full min-w-max">
            {COLS.map(col => (
              <KColumn
                key={col.id}
                col={col}
                cards={visibleCards.filter(c => c.col === col.id)}
                onMove={moveCard}
              />
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-8 py-2.5 border-t border-[#eef2f8] flex items-center gap-4 shrink-0" style={{ background: "#ffffff" }}>
          <span className="flex items-center gap-1.5 text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>
            <GripVertical className="size-3.5" />Kéo thả để chuyển bước quy trình
          </span>
          <span className="text-[#d1d5db]">·</span>
          <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>
            Click <strong>Chuyển tiếp</strong> để nhanh chóng đẩy hồ sơ sang bước tiếp theo
          </span>
          <span className="text-[#d1d5db] ml-auto">·</span>
          <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>
            Năm công tác: 2026 · Tổng {INITIAL_CARDS.length} hồ sơ
          </span>
        </div>
      </div>
    </DndProvider>
  );
}
