import { useState } from "react";
import {
  X, Award, CheckCircle2, Clock, AlertTriangle, XCircle,
  FileText, Download, Paperclip, MessageSquare, Send,
  ThumbsUp, ThumbsDown, ChevronRight, Sparkles, User,
  Building2, Calendar, Hash, Tag, Star, Shield,
  ArrowRight, MoreHorizontal, Edit3, Flag, Printer,
  Eye, TrendingUp, CheckCheck, History, Circle,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
export interface HoSoMeta {
  id: string;          // NS-2026-0147
  ten: string;         // Nguyễn Văn An
  danhHieu: string;    // Chiến sĩ thi đua toàn quốc
  donVi: string;
  namDeNghi: number;
  currentStep: number; // 0-4
  status: "pending" | "in_review" | "voting" | "signed" | "issued" | "rejected";
  slaStatus: "ok" | "warning" | "overdue";
  slaRemain: string;
  aiScore: number;     // 0-100
  aiEligible: boolean;
  aiFlags: string[];
}

/* ─── Demo hồ sơ ────────────────────────────────────────────── */
const DEMO_HOSOSO: HoSoMeta[] = [
  {
    id:"NS-2026-0147", ten:"Nguyễn Văn An", danhHieu:"Chiến sĩ thi đua toàn quốc",
    donVi:"Sở Giáo dục và Đào tạo Đồng Nai", namDeNghi:2026,
    currentStep:3, status:"signed", slaStatus:"overdue", slaRemain:"Quá hạn 0 ngày",
    aiScore:94, aiEligible:true, aiFlags:[],
  },
  {
    id:"NS-2026-0153", ten:"Vũ Đức Khoa", danhHieu:"Chiến sĩ thi đua cơ sở",
    donVi:"Sở Tài nguyên và Môi trường", namDeNghi:2026,
    currentStep:2, status:"voting", slaStatus:"ok", slaRemain:"Còn 5 ngày",
    aiScore:81, aiEligible:true, aiFlags:["Thiếu minh chứng đề tài NCKH"],
  },
  {
    id:"NS-2026-0142", ten:"Trần Thị Bích", danhHieu:"Bằng khen UBND tỉnh",
    donVi:"Ban Tổ chức Tỉnh ủy", namDeNghi:2026,
    currentStep:3, status:"signed", slaStatus:"warning", slaRemain:"Còn 1 ngày",
    aiScore:76, aiEligible:true, aiFlags:["Kiểm tra lại mã số CBCC"],
  },
  {
    id:"NS-2026-0160", ten:"Nguyễn Đình Hùng", danhHieu:"Chiến sĩ thi đua cơ sở",
    donVi:"Sở Công Thương", namDeNghi:2026,
    currentStep:0, status:"pending", slaStatus:"ok", slaRemain:"Còn 12 ngày",
    aiScore:89, aiEligible:true, aiFlags:[],
  },
];

const STEPS = [
  { label:"Tạo & Nộp",      sublabel:"Hoàn thiện hồ sơ" },
  { label:"Thẩm định",      sublabel:"Hội đồng cơ sở" },
  { label:"Bỏ phiếu HĐ",   sublabel:"Hội đồng cấp tỉnh" },
  { label:"Ký số",          sublabel:"Lãnh đạo phê duyệt" },
  { label:"Ban hành QĐ",    sublabel:"Quyết định chính thức" },
];

const STATUS_CFG = {
  pending:   { label:"Đang chờ xử lý",    color:"#b45309", bg:"#fef9ec", border:"#fde68a" },
  in_review: { label:"Đang thẩm định",     color:"#1C5FBE", bg:"#f0f4ff", border:"#bfdbfe" },
  voting:    { label:"Đang bỏ phiếu",     color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
  signed:    { label:"Đã ký số",          color:"#166534", bg:"#dcfce7", border:"#86efac" },
  issued:    { label:"Đã ban hành QĐ",   color:"#166534", bg:"#dcfce7", border:"#86efac" },
  rejected:  { label:"Bị từ chối",        color:"#c8102e", bg:"#fff5f5", border:"#fca5a5" },
};

/* ─── Mock history events ─────────────────────────────────── */
const HISTORY_EVENTS = [
  { time:"23/04/2026 · 14:35", actor:"Nguyễn Thị Mai (Hội đồng)", action:"Ký số điện tử CA",          type:"sign"    },
  { time:"22/04/2026 · 10:20", actor:"Trần Văn Bình (Hội đồng)",  action:"Bỏ phiếu: Thông qua",       type:"vote"    },
  { time:"21/04/2026 · 09:15", actor:"Trợ lý AI",                 action:"Xác nhận đủ điều kiện · AI Score 94",type:"ai" },
  { time:"18/04/2026 · 16:50", actor:"Lê Hồng Vân (Cán bộ ĐV)",  action:"Nộp hồ sơ lên Hội đồng",   type:"submit"  },
  { time:"15/04/2026 · 08:30", actor:"Nguyễn Văn An",             action:"Tạo hồ sơ đề nghị",         type:"create"  },
];

const ATTACHMENTS = [
  { name:"Đơn đề nghị khen thưởng (Mẫu 1a).pdf",   size:"124 KB", type:"pdf"  },
  { name:"Báo cáo thành tích cá nhân 2023-2025.docx",size:"256 KB", type:"doc" },
  { name:"Minh chứng đề tài NCKH cấp tỉnh.pdf",    size:"2.1 MB", type:"pdf"  },
  { name:"Xác nhận chấp hành PL - BTC Tỉnh ủy.pdf", size:"88 KB", type:"pdf" },
];

const COMMENTS = [
  { author:"Trần Văn Bình", role:"Hội đồng", time:"22/04/2026", text:"Hồ sơ đầy đủ, thành tích rõ ràng. Đề nghị thông qua.", avatar:"TB" },
  { author:"Phạm Thị Lan",  role:"Thư ký HĐ", time:"21/04/2026", text:"Đã đối chiếu với danh sách trùng lặp, không phát hiện trường hợp trùng.", avatar:"PL" },
];

/* ═══════════════════════════════════════════════════════════════
   WORKFLOW STEPPER
═══════════════════════════════════════════════════════════════ */
function WorkflowStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative flex items-start gap-0 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const done   = i < currentStep;
        const active = i === currentStep;
        const future = i > currentStep;
        return (
          <div key={i} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1.5 min-w-[88px]">
              {/* Circle */}
              <div className={`size-8 rounded-full flex items-center justify-center border-2 transition-all ${
                done   ? "bg-[#166534] border-[#166534]" :
                active ? "bg-[#1C5FBE] border-[#1C5FBE] shadow-[0_0_0_3px_rgba(28,95,190,0.2)]" :
                         "bg-white border-[#d1d5db]"
              }`}>
                {done ? (
                  <CheckCheck className="size-4 text-white" />
                ) : active ? (
                  <span className="text-[13px] text-white" style={{ fontFamily:"JetBrains Mono,monospace", fontWeight:700 }}>{i+1}</span>
                ) : (
                  <Circle className="size-3 text-[#d1d5db]" />
                )}
              </div>
              {/* Label */}
              <div className="text-center">
                <div className={`text-[13px] leading-tight ${active ? "text-[#1C5FBE]" : done ? "text-[#166534]" : "text-slate-700"}`}
                  style={{ fontFamily: "var(--font-sans)", fontWeight: active || done ? 700 : 400 }}>
                  {s.label}
                </div>
                <div className="text-[13px] text-slate-600 mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>{s.sublabel}</div>
              </div>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="w-8 h-[2px] mb-6 shrink-0" style={{ background: i < currentStep ? "#166534" : "#e2e8f0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AI PANEL
═══════════════════════════════════════════════════════════════ */
function AIPanel({ hs }: { hs: HoSoMeta }) {
  const scoreColor = hs.aiScore >= 90 ? "#166534" : hs.aiScore >= 70 ? "#b45309" : "#c8102e";
  const scoreBg    = hs.aiScore >= 90 ? "#dcfce7" : hs.aiScore >= 70 ? "#fef9ec" : "#fff5f5";
  return (
    <div className="rounded-[10px] border p-4" style={{ background:"#faf5ff", borderColor:"#ddd6fe" }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-4 text-[#7c3aed]" />
        <span className="text-[13px] text-[#7c3aed]" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>Phân tích Trợ lý AI</span>
      </div>
      {/* Score ring */}
      <div className="flex items-center gap-4 mb-3">
        <div className="relative size-14 shrink-0">
          <svg viewBox="0 0 56 56" className="size-14 -rotate-90">
            <circle cx="28" cy="28" r="22" fill="none" stroke="#ede9fe" strokeWidth="5"/>
            <circle cx="28" cy="28" r="22" fill="none" stroke={scoreColor} strokeWidth="5"
              strokeDasharray={`${2*Math.PI*22}`}
              strokeDashoffset={`${2*Math.PI*22*(1-hs.aiScore/100)}`}
              strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[13px]" style={{ fontFamily:"JetBrains Mono,monospace", fontWeight:700, color:scoreColor }}>{hs.aiScore}</span>
          </div>
        </div>
        <div>
          <div className="text-[13px] text-slate-900 mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
            {hs.aiEligible ? "✅ Đủ điều kiện" : "❌ Chưa đủ điều kiện"}
          </div>
          <div className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
            Đối chiếu Luật TĐKT 2022, Điều 23-28; NĐ 152/2025/NĐ-CP, Điều 11
          </div>
        </div>
      </div>
      {/* Flags */}
      {hs.aiFlags.length === 0 ? (
        <div className="flex items-center gap-1.5 text-[13px] text-[#166534]">
          <CheckCircle2 className="size-3.5"/>Không phát hiện vấn đề
        </div>
      ) : (
        <div className="space-y-1">
          {hs.aiFlags.map((f,i) => (
            <div key={i} className="flex items-center gap-1.5 text-[13px] text-[#b45309]">
              <AlertTriangle className="size-3.5 shrink-0"/>
              <span style={{ fontFamily: "var(--font-sans)" }}>{f}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DRAWER
═══════════════════════════════════════════════════════════════ */
export function HoSoDetailDrawer({
  hoSoId,
  onClose,
  user,
  onNavigate,
}: {
  hoSoId: string | null;
  onClose: () => void;
  user: LoginUser;
  onNavigate?: (m: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"detail"|"history"|"files"|"comments">("detail");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(COMMENTS);

  const hs = DEMO_HOSOSO.find(h => h.id === hoSoId) ?? DEMO_HOSOSO[0];
  if (!hoSoId) return null;

  const statusCfg = STATUS_CFG[hs.status];
  const slaColor  = hs.slaStatus === "overdue" ? "#c8102e" : hs.slaStatus === "warning" ? "#b45309" : "#166534";

  const canSign    = user.role === "lãnh đạo cấp cao" || user.role === "quản trị hệ thống";
  const canApprove = user.role === "hội đồng" || user.role === "quản trị hệ thống";

  const submitComment = () => {
    if (!comment.trim()) return;
    setComments(p => [{
      author: user.name.split(" ").slice(-2).join(" "),
      role: user.roleLabel,
      time: "Vừa xong",
      text: comment.trim(),
      avatar: user.initials,
    }, ...p]);
    setComment("");
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[70]" style={{ background:"rgba(11,20,38,0.35)", backdropFilter:"blur(2px)" }} onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 bottom-0 z-[71] flex flex-col overflow-hidden shadow-2xl"
        style={{ width:"520px", background:"white", borderLeft:"1px solid #e2e8f0" }}>

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] shrink-0" style={{ background:"var(--color-paper)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-[13px] px-2 py-0.5 rounded" style={{ background:"#e2e8f0", color:"#5a5040", fontFamily:"JetBrains Mono,monospace" }}>{hs.id}</code>
                <span className="text-[13px] px-2 py-0.5 rounded border" style={{ background:statusCfg.bg, color:statusCfg.color, borderColor:statusCfg.border, fontFamily: "var(--font-sans)", fontWeight:600 }}>
                  {statusCfg.label}
                </span>
                <span className="text-[13px] px-2 py-0.5 rounded" style={{ color:slaColor, background:`${slaColor}14`, fontFamily:"JetBrains Mono,monospace", fontWeight:700 }}>
                  ⏱ {hs.slaRemain}
                </span>
              </div>
              <h2 className="text-[18px] text-slate-900 truncate" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>{hs.ten}</h2>
              <p className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>{hs.danhHieu}</p>
            </div>
            <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-[#f4f7fb] shrink-0 transition-colors">
              <X className="size-4 text-slate-700"/>
            </button>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-3 text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
            <span className="flex items-center gap-1"><Building2 className="size-3.5"/>{hs.donVi.split(" ").slice(0,4).join(" ")}…</span>
            <span className="flex items-center gap-1"><Calendar className="size-3.5"/>Năm {hs.namDeNghi}</span>
            <span className="flex items-center gap-1"><TrendingUp className="size-3.5"/>AI: {hs.aiScore}/100</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-[#e2e8f0] shrink-0 px-2">
          {([
            ["detail",   "Chi tiết",    FileText    ],
            ["history",  "Lịch sử",     History     ],
            ["files",    "Tài liệu",    Paperclip   ],
            ["comments", "Bình luận",   MessageSquare],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-4 py-3 text-[13px] border-b-2 transition-all"
              style={{
                fontFamily: "var(--font-sans)", fontWeight: activeTab === id ? 700 : 500,
                borderColor: activeTab === id ? "#1C5FBE" : "transparent",
                color: activeTab === id ? "#1C5FBE" : "#635647",
              }}>
              <Icon className="size-3.5"/>
              {label}
              {id === "comments" && comments.length > 0 && (
                <span className="text-[13px] px-1.5 py-0.5 rounded-full"
                  style={{ background:"#1C5FBE", color:"white", fontFamily:"JetBrains Mono,monospace" }}>
                  {comments.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          {/* DETAIL TAB */}
          {activeTab === "detail" && (
            <div className="p-5 space-y-5">
              {/* Workflow */}
              <div>
                <h3 className="text-[13px] uppercase tracking-wider text-slate-700 mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>Quy trình xử lý</h3>
                <WorkflowStepper currentStep={hs.currentStep} />
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon:User,       label:"Cá nhân",       value:hs.ten },
                  { icon:Building2,  label:"Đơn vị",        value:hs.donVi.split(" ").slice(0,5).join(" ") },
                  { icon:Tag,        label:"Danh hiệu",     value:hs.danhHieu },
                  { icon:Calendar,   label:"Năm đề nghị",   value:`${hs.namDeNghi}` },
                  { icon:Hash,       label:"Mã hồ sơ",      value:hs.id },
                  { icon:Star,       label:"Điểm AI",       value:`${hs.aiScore}/100` },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="p-3 rounded-[8px]" style={{ background:"#ffffff", border:"1px solid #e2e8f0" }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="size-3.5 text-slate-700"/>
                        <span className="text-[13px] uppercase tracking-wider text-slate-700" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>{f.label}</span>
                      </div>
                      <div className="text-[13px] text-slate-900 truncate" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{f.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* AI Panel */}
              <AIPanel hs={hs} />

              {/* Legal basis */}
              <div className="p-3 rounded-[8px]" style={{ background:"#f0f4ff", border:"1px solid #bfdbfe" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="size-4 text-[#1C5FBE]"/>
                  <span className="text-[13px] text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>Căn cứ pháp lý</span>
                </div>
                <ul className="space-y-1">
                  {["Luật TĐKT 2022, Điều 23 – Điều kiện CSTĐT","NĐ 152/2025/NĐ-CP, Điều 11 – Hình thức khen thưởng","TT 15/2025/TT-BNV – Mẫu biểu hồ sơ"].map(t => (
                    <li key={t} className="text-[13px] text-[#1C5FBE] flex items-start gap-1.5">
                      <ArrowRight className="size-3 mt-0.5 shrink-0"/>
                      <span style={{ fontFamily: "var(--font-sans)" }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="p-5">
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-[#e2e8f0]" />
                <div className="space-y-4">
                  {HISTORY_EVENTS.map((ev, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className={`size-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                        ev.type==="sign"?"bg-[#dcfce7] border-[#86efac]":
                        ev.type==="vote"?"bg-[#f5f3ff] border-[#ddd6fe]":
                        ev.type==="ai"?"bg-[#faf5ff] border-[#c4b5fd]":
                        ev.type==="submit"?"bg-[#f0f4ff] border-[#bfdbfe]":
                        "bg-[#ffffff] border-[#e2e8f0]"
                      }`}>
                        {ev.type==="sign"   && <CheckCheck className="size-3.5 text-[#166534]"/>}
                        {ev.type==="vote"   && <ThumbsUp className="size-3.5 text-[#7c3aed]"/>}
                        {ev.type==="ai"     && <Sparkles className="size-3.5 text-[#7c3aed]"/>}
                        {ev.type==="submit" && <ArrowRight className="size-3.5 text-[#1C5FBE]"/>}
                        {ev.type==="create" && <Edit3 className="size-3.5 text-slate-700"/>}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{ev.action}</div>
                        <div className="text-[13px] text-slate-700 mt-0.5">
                          <span>{ev.actor}</span>
                          <span className="mx-1.5">·</span>
                          <span style={{ fontFamily:"JetBrains Mono,monospace" }}>{ev.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FILES TAB */}
          {activeTab === "files" && (
            <div className="p-5 space-y-2">
              <p className="text-[13px] text-slate-700 mb-3" style={{ fontFamily: "var(--font-sans)" }}>
                {ATTACHMENTS.length} tài liệu đính kèm · Tổng dung lượng ~2.6 MB
              </p>
              {ATTACHMENTS.map((f,i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-[8px] hover:bg-[#f4f7fb] transition-colors"
                  style={{ border:"1px solid #e2e8f0" }}>
                  <div className={`size-9 rounded-[6px] flex items-center justify-center text-[13px] font-bold shrink-0 ${
                    f.type==="pdf"?"bg-[#fee2e2] text-[#c8102e]":"bg-[#dbeafe] text-[#1C5FBE]"
                  }`} style={{ fontFamily:"JetBrains Mono,monospace" }}>
                    {f.type.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-slate-900 truncate" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{f.name}</div>
                    <div className="text-[13px] text-slate-700">{f.size}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="size-7 rounded flex items-center justify-center hover:bg-[#e2e8f0] transition-colors">
                      <Eye className="size-3.5 text-slate-700"/>
                    </button>
                    <button className="size-7 rounded flex items-center justify-center hover:bg-[#e2e8f0] transition-colors">
                      <Download className="size-3.5 text-slate-700"/>
                    </button>
                  </div>
                </div>
              ))}
              <button className="mt-2 w-full flex items-center justify-center gap-2 p-3 rounded-[8px] border-2 border-dashed border-[#d1d5db] text-[13px] text-slate-700 hover:border-[#1C5FBE] hover:text-[#1C5FBE] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}>
                + Đính kèm tài liệu
              </button>
            </div>
          )}

          {/* COMMENTS TAB */}
          {activeTab === "comments" && (
            <div className="p-5">
              <div className="space-y-3 mb-4">
                {comments.map((c,i) => (
                  <div key={i} className="flex gap-3">
                    <div className="size-8 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
                      style={{ background:"linear-gradient(135deg,#1C5FBE,#7c3aed)", fontFamily: "var(--font-sans)", fontWeight:700 }}>
                      {c.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>{c.author}</span>
                        <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#f0f4ff", color:"#1C5FBE", fontFamily: "var(--font-sans)" }}>{c.role}</span>
                        <span className="text-[13px] text-slate-600" style={{ fontFamily:"JetBrains Mono,monospace" }}>{c.time}</span>
                      </div>
                      <div className="text-[13px] text-slate-700 leading-relaxed p-2.5 rounded-[8px]"
                        style={{ background:"#ffffff", border:"1px solid #e2e8f0", fontFamily: "var(--font-sans)" }}>
                        {c.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Input */}
              <div className="flex gap-2">
                <div className="size-8 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
                  style={{ background:`linear-gradient(135deg,${user.avatarFrom},${user.avatarTo})`, fontFamily: "var(--font-sans)", fontWeight:700 }}>
                  {user.initials}
                </div>
                <div className="flex-1 flex gap-2">
                  <textarea value={comment} onChange={e=>setComment(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitComment();}}}
                    placeholder="Ghi chú, bình luận… (Enter để gửi)"
                    rows={2}
                    className="flex-1 resize-none border border-[#d1d5db] rounded-[8px] px-3 py-2 text-[13px] text-slate-900 outline-none focus:border-[#1C5FBE] transition-colors"
                    style={{ fontFamily: "var(--font-sans)" }}/>
                  <button onClick={submitComment} disabled={!comment.trim()}
                    className="size-9 rounded-[8px] flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                    style={{ background:"linear-gradient(135deg,#1C5FBE,#1752a8)" }}>
                    <Send className="size-4 text-white"/>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Action footer ── */}
        <div className="px-5 py-4 border-t border-[#e2e8f0] shrink-0 flex items-center gap-2.5" style={{ background:"var(--color-paper)" }}>
          {canSign && hs.status === "signed" && (
            <button onClick={()=>{onNavigate?.("Ký số & Phê duyệt"); onClose();}}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-[8px] text-[13px] text-white flex-1"
              style={{ background:"linear-gradient(135deg,#166534,#14532d)", fontFamily: "var(--font-sans)", fontWeight:700 }}>
              <CheckCircle2 className="size-4"/>Đến trang Ký số
            </button>
          )}
          {canApprove && (hs.status === "in_review" || hs.status === "voting") && (
            <>
              <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-[8px] text-[13px] text-white flex-1"
                style={{ background:"linear-gradient(135deg,#166534,#14532d)", fontFamily: "var(--font-sans)", fontWeight:700 }}>
                <ThumbsUp className="size-4"/>Đồng ý thông qua
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-[8px] text-[13px] text-[#c8102e] border border-[#fca5a5] hover:bg-[#fff5f5] transition-colors"
                style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
                <ThumbsDown className="size-4"/>Từ chối
              </button>
            </>
          )}
          <button onClick={()=>{onNavigate?.("Trợ lý AI"); onClose();}}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-[8px] text-[13px] border border-[#ddd6fe] hover:bg-[#faf5ff] transition-colors"
            style={{ color:"#7c3aed", fontFamily: "var(--font-sans)", fontWeight:600 }}>
            <Sparkles className="size-4"/>Hỏi AI
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-[8px] text-[13px] border border-[#e2e8f0] hover:bg-[#f4f7fb] transition-colors"
            style={{ color:"#5a5040", fontFamily: "var(--font-sans)" }}>
            <Printer className="size-4"/>In
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT: helper to open from any page
═══════════════════════════════════════════════════════════════ */
export { DEMO_HOSOSO };
