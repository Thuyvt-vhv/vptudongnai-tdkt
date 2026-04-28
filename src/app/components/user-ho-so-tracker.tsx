/**
 * user-ho-so-tracker.tsx
 * Trang theo dõi hồ sơ của cá nhân user:
 * - List hồ sơ của mình với trạng thái
 * - Timeline chi tiết theo từng hồ sơ
 * - Nhận xét / phản hồi từ thẩm định viên
 * - "Bổ sung hồ sơ" khi bị yêu cầu
 * - Xem kết quả khi hoàn thành
 */
import { useState } from "react";
import {
  FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Eye, Upload, MessageSquare, Award,
  Download, Plus, Sparkles, ArrowRight, CheckCheck,
  AlertTriangle, FileSignature, Gavel, Star,
  X, Send, Loader2, RefreshCw, Building2,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { TaoHoSoWizard } from "./tao-ho-so-wizard";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type TrackStatus = "nhap" | "da_nop" | "dang_tham_dinh" | "yeu_cau_bo_sung" | "cho_binh_xet" | "da_binh_xet" | "cho_ky_so" | "hoan_thanh" | "tu_choi";

interface TimelineEvent {
  date: string;
  actor: string;
  role: string;
  event: string;
  note?: string;
  type: "info" | "warning" | "success" | "error" | "action";
}

interface MyHoSo {
  id: string;
  code: string;
  danhHieu: string;
  capBac: string;
  status: TrackStatus;
  submittedDate: string;
  updatedDate: string;
  slaDeadline: string;
  slaOk: boolean;
  handler?: string;
  handlerUnit?: string;
  timeline: TimelineEvent[];
  yeuCauBoSung?: string;
  documents: { ten: string; uploaded: boolean }[];
  aiScore: number;
  quyetDinhCode?: string;
}

/* ─── Mock data (user's own hồ sơ) ─────────────────────────── */
const MY_HO_SO: MyHoSo[] = [
  {
    id:"1", code:"TĐKT-2026-047", danhHieu:"Bằng khen UBND Tỉnh", capBac:"Cấp tỉnh",
    status:"cho_ky_so", submittedDate:"15/03/2026", updatedDate:"18/04/2026",
    slaDeadline:"25/04/2026", slaOk:false,
    handler:"Lê Hoàng Nam", handlerUnit:"Phòng TĐKT – Sở Nội vụ",
    aiScore:92,
    documents:[
      { ten:"Sơ yếu lý lịch (Mẫu 2-BNV)", uploaded:true },
      { ten:"Báo cáo thành tích", uploaded:true },
      { ten:"Bảng điểm thi đua 2 năm", uploaded:true },
      { ten:"Tờ trình đề nghị (Mẫu 12-BNV)", uploaded:true },
    ],
    timeline:[
      { date:"15/03/2026", actor:"Bản thân", role:"Cán bộ",   event:"Nộp hồ sơ lên Đơn vị",        type:"info" },
      { date:"17/03/2026", actor:"Nguyễn Thị Mai", role:"Cán bộ phụ trách",  event:"Đơn vị xác nhận và chuyển Phòng TĐKT", type:"success" },
      { date:"22/03/2026", actor:"Võ Minh Tuấn", role:"Chuyên viên TĐKT",  event:"Tiếp nhận hồ sơ – bắt đầu thẩm định", type:"info" },
      { date:"05/04/2026", actor:"Võ Minh Tuấn", role:"Chuyên viên",  event:"Thẩm định hoàn tất – đủ điều kiện",    type:"success", note:"AI score 92/100. Hồ sơ đầy đủ, thành tích đạt tiêu chuẩn." },
      { date:"10/04/2026", actor:"HĐTĐKT Tỉnh", role:"Hội đồng",  event:"Đưa vào chương trình họp HĐ tháng 4",  type:"info" },
      { date:"15/04/2026", actor:"HĐTĐKT Tỉnh", role:"Hội đồng",  event:"Bỏ phiếu kết quả: 9/9 đồng ý",         type:"success" },
      { date:"18/04/2026", actor:"Lê Hoàng Nam", role:"Trưởng phòng TĐKT",  event:"Trình lãnh đạo ký số",                 type:"info" },
    ],
  },
  {
    id:"2", code:"TĐKT-2026-039", danhHieu:"Chiến sĩ thi đua cơ sở", capBac:"Cấp cơ sở",
    status:"yeu_cau_bo_sung", submittedDate:"22/04/2026", updatedDate:"23/04/2026",
    slaDeadline:"07/05/2026", slaOk:true,
    handler:"Võ Minh Tuấn", handlerUnit:"Phòng TĐKT – Sở Nội vụ",
    aiScore:74,
    yeuCauBoSung:"Cần bổ sung minh chứng sáng kiến được công nhận cấp cơ sở năm 2025 và bảng điểm thi đua năm 2024. Thời hạn bổ sung: 07/05/2026.",
    documents:[
      { ten:"Sơ yếu lý lịch (Mẫu 2-BNV)", uploaded:true },
      { ten:"Báo cáo thành tích", uploaded:true },
      { ten:"Sáng kiến cấp cơ sở", uploaded:false },
      { ten:"Bảng điểm thi đua 2024", uploaded:false },
    ],
    timeline:[
      { date:"22/04/2026", actor:"Bản thân", role:"Cán bộ",   event:"Nộp hồ sơ lên Đơn vị",         type:"info" },
      { date:"22/04/2026", actor:"Nguyễn Thị Mai", role:"Cán bộ phụ trách",  event:"Đơn vị chuyển Phòng TĐKT",      type:"success" },
      { date:"23/04/2026", actor:"Võ Minh Tuấn", role:"Chuyên viên TĐKT",  event:"Yêu cầu bổ sung hồ sơ",        type:"warning", note:"Cần bổ sung minh chứng sáng kiến cấp cơ sở 2025 và bảng điểm 2024." },
    ],
  },
  {
    id:"3", code:"TĐKT-2025-118", danhHieu:"Lao động tiên tiến", capBac:"Cấp cơ sở",
    status:"hoan_thanh", submittedDate:"10/01/2025", updatedDate:"28/02/2025",
    slaDeadline:"15/02/2025", slaOk:true,
    handler:"Lê Hoàng Nam", handlerUnit:"Phòng TĐKT",
    aiScore:95, quyetDinhCode:"QĐ-TĐKT-2025-118",
    documents:[
      { ten:"Sơ yếu lý lịch", uploaded:true },
      { ten:"Báo cáo thành tích", uploaded:true },
    ],
    timeline:[
      { date:"10/01/2025", actor:"Bản thân",        role:"Cán bộ",          event:"Nộp hồ sơ",                    type:"info" },
      { date:"12/01/2025", actor:"Nguyễn Thị Mai",  role:"Cán bộ phụ trách",event:"Đơn vị xác nhận",              type:"success" },
      { date:"18/01/2025", actor:"Võ Minh Tuấn",    role:"Chuyên viên",     event:"Thẩm định xong – đạt",         type:"success" },
      { date:"25/01/2025", actor:"HĐTĐKT",          role:"Hội đồng",        event:"Bình xét thông qua",            type:"success" },
      { date:"28/02/2025", actor:"Phó CT UBND",     role:"Lãnh đạo",        event:"Ký QĐ tặng danh hiệu LĐTT",    type:"success", note:"QĐ-TĐKT-2025-118" },
    ],
  },
];

/* ─── Status config ─────────────────────────────────────────── */
const SCONFIG: Record<TrackStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  nhap:             { label:"Bản nháp",          color:"#5a5040", bg:"#eef2f8", icon:FileText },
  da_nop:           { label:"Đã nộp",            color:"#0891b2", bg:"#e0f2fe", icon:Send },
  dang_tham_dinh:   { label:"Đang thẩm định",    color:"#b45309", bg:"#fef3c7", icon:Clock },
  yeu_cau_bo_sung:  { label:"Yêu cầu bổ sung",   color:"#c2410c", bg:"#fff7ed", icon:AlertCircle },
  cho_binh_xet:     { label:"Chờ bình xét HĐ",   color:"#7c3aed", bg:"#f5f3ff", icon:Gavel },
  da_binh_xet:      { label:"Đã bình xét",        color:"#047857", bg:"#d1fae5", icon:CheckCircle2 },
  cho_ky_so:        { label:"Chờ ký số",          color:"#8a6400", bg:"#fef9ec", icon:FileSignature },
  hoan_thanh:       { label:"Hoàn thành",         color:"#166534", bg:"#dcfce7", icon:Award },
  tu_choi:          { label:"Không được duyệt",   color:"#9f1239", bg:"#fee2e2", icon:XCircle },
};

const WORKFLOW_STEPS: { label: string; statuses: TrackStatus[] }[] = [
  { label:"Nộp hồ sơ",     statuses:["nhap","da_nop"] },
  { label:"Thẩm định",      statuses:["dang_tham_dinh","yeu_cau_bo_sung"] },
  { label:"Bình xét HĐ",   statuses:["cho_binh_xet","da_binh_xet"] },
  { label:"Ký số",          statuses:["cho_ky_so"] },
  { label:"Ban hành QĐ",   statuses:["hoan_thanh"] },
];

function getWorkflowStep(status: TrackStatus): number {
  if (status === "tu_choi") return -1;
  return WORKFLOW_STEPS.findIndex(s => s.statuses.includes(status));
}

/* ─── Timeline event icons ─────────────────────────────────── */
const EVENT_ICON: Record<string, typeof Clock> = {
  info: Clock, success: CheckCircle2, warning: AlertTriangle, error: XCircle, action: ArrowRight,
};
const EVENT_COLOR: Record<string, string> = {
  info: "#1C5FBE", success: "#166534", warning: "#b45309", error: "#c8102e", action: "#7c3aed",
};

/* ═══════════════════════════════════════════════════════════════
   DETAIL PANEL
═══════════════════════════════════════════════════════════════ */
function HoSoDetail({ hs, onClose }: { hs: MyHoSo; onClose: () => void }) {
  const [tab, setTab] = useState<"timeline" | "docs" | "bosung">(
    hs.status === "yeu_cau_bo_sung" ? "bosung" : "timeline"
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [docs, setDocs] = useState(hs.documents);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);

  const sc = SCONFIG[hs.status];
  const StatusIcon = sc.icon;
  const wfStep = getWorkflowStep(hs.status);
  const rejected = hs.status === "tu_choi";
  const finished = hs.status === "hoan_thanh";

  const handleUpload = (ten: string) => {
    setUploading(ten);
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.ten === ten ? { ...d, uploaded: true } : d));
      setUploading(null);
    }, 1500);
  };

  const handleSend = () => {
    if (!reply.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setReply("");
  };

  return (
    <div className="fixed inset-0 z-40 flex" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="ml-auto h-full w-[640px] flex flex-col shadow-2xl overflow-hidden" style={{ background: "white" }}>
        {/* Header */}
        <div className="p-6 shrink-0" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-[13px]" style={{ fontFamily: "JetBrains Mono, monospace", color: "#8a6400", fontWeight: 700 }}>{hs.code}</code>
                <span className="px-2 py-0.5 rounded-full text-[13px]" style={{ background: sc.bg, color: sc.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  {sc.label}
                </span>
              </div>
              <h2 className="text-[18px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{hs.danhHieu}</h2>
              <p className="text-[13px] text-white/50 mt-1">{hs.capBac} · Nộp ngày {hs.submittedDate}</p>
            </div>
            <button onClick={onClose} className="size-8 rounded-[8px] flex items-center justify-center hover:bg-white/10">
              <X className="size-4 text-white/60" />
            </button>
          </div>

          {/* Workflow stepper */}
          {!rejected && (
            <div className="flex items-center gap-0">
              {WORKFLOW_STEPS.map((ws, i) => {
                const done    = wfStep > i;
                const current = wfStep === i;
                return (
                  <div key={ws.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className="size-6 rounded-full flex items-center justify-center text-[13px] transition-all"
                        style={{ background: done ? "#166534" : current ? "#1C5FBE" : "rgba(255,255,255,0.1)", color: "white", fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}>
                        {done ? <Check className="size-3" /> : i + 1}
                      </div>
                      <span className="text-[13px] text-center"
                        style={{ fontFamily: "var(--font-sans)", color: done || current ? "white" : "rgba(255,255,255,0.4)", fontWeight: current ? 700 : 400 }}>
                        {ws.label}
                      </span>
                    </div>
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <div className="flex-1 h-px mt-[-10px] mx-1" style={{ background: done ? "#166534" : "rgba(255,255,255,0.15)" }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {rejected && (
            <div className="flex items-center gap-2 p-3 rounded-[8px]" style={{ background: "#7f1d1d40" }}>
              <XCircle className="size-4 text-[#f87171]" />
              <span className="text-[13px] text-[#f87171]">Hồ sơ không được duyệt</span>
            </div>
          )}

          {finished && (
            <div className="flex items-center gap-2 p-3 rounded-[8px]" style={{ background: "#14532d40" }}>
              <Award className="size-4 text-[#4ade80]" />
              <span className="text-[13px] text-[#4ade80]">Danh hiệu đã được ban hành · {hs.quyetDinhCode}</span>
            </div>
          )}
        </div>

        {/* Urgent bổ sung banner */}
        {hs.status === "yeu_cau_bo_sung" && (
          <div className="px-6 py-3 flex items-center gap-3 shrink-0" style={{ background: "#fff7ed", borderBottom: "2px solid #fde68a" }}>
            <AlertCircle className="size-5 text-[#b45309] shrink-0" />
            <p className="text-[13px] text-[#92400e] flex-1" style={{ fontFamily: "var(--font-sans)" }}>
              <strong>Cần hành động:</strong> Thẩm định viên yêu cầu bổ sung hồ sơ. Hạn cuối: <strong>{hs.slaDeadline}</strong>.
            </p>
            <button onClick={() => setTab("bosung")}
              className="px-3 py-1.5 rounded-[7px] text-[13px] text-white shrink-0"
              style={{ background: "#b45309", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Bổ sung ngay
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#e2e8f0] shrink-0" style={{ background: "#ffffff" }}>
          {([
            ["timeline", "Dòng thời gian"],
            ["docs", `Tài liệu (${docs.filter(d => d.uploaded).length}/${docs.length})`],
            ...(hs.status === "yeu_cau_bo_sung" ? [["bosung", "Bổ sung hồ sơ 📎"]] : []),
          ] as [string, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              className="flex-1 py-2.5 text-[13px] border-b-2 transition-colors"
              style={{
                borderColor: tab === k ? "#1C5FBE" : "transparent",
                color: tab === k ? "#1C5FBE" : "#635647",
                fontFamily: "var(--font-sans)", fontWeight: tab === k ? 700 : 400,
              }}>
              {l}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Timeline */}
          {tab === "timeline" && (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-[#e2e8f0]" />
              <div className="space-y-5">
                {hs.timeline.map((ev, i) => {
                  const Icon = EVENT_ICON[ev.type];
                  const color = EVENT_COLOR[ev.type];
                  return (
                    <div key={i} className="flex gap-4 pl-12 relative">
                      <div className="absolute left-3 top-0 size-5 rounded-full flex items-center justify-center"
                        style={{ background: `${color}20`, border: `1.5px solid ${color}` }}>
                        <Icon className="size-3" style={{ color }} />
                      </div>
                      <div className="flex-1 rounded-[10px] border p-3.5" style={{ background: "white", borderColor: "#e2e8f0" }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{ev.event}</span>
                          </div>
                          <span className="text-[13px] text-[#6b5e47] shrink-0" style={{ fontFamily: "JetBrains Mono, monospace" }}>{ev.date}</span>
                        </div>
                        <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                          {ev.actor} · <span className="italic">{ev.role}</span>
                        </div>
                        {ev.note && (
                          <div className="mt-2 p-2 rounded-[6px] text-[13px] text-[#5a5040]"
                            style={{ background: "#ffffff", fontFamily: "var(--font-sans)", border: "1px solid #e2e8f0" }}>
                            {ev.note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Current step waiting */}
                {!finished && !rejected && (
                  <div className="flex gap-4 pl-12 relative">
                    <div className="absolute left-3 top-0 size-5 rounded-full flex items-center justify-center border-2 border-dashed border-[#d1d5db]">
                      <Clock className="size-2.5 text-[#d1d5db]" />
                    </div>
                    <div className="flex-1 rounded-[10px] border border-dashed border-[#d1d5db] p-3 text-center">
                      <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>Đang chờ bước tiếp theo…</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Docs */}
          {tab === "docs" && (
            <div className="space-y-3">
              {docs.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-[10px] border"
                  style={{ borderColor: d.uploaded ? "#86efac" : "#e2e8f0", background: d.uploaded ? "#f0fdf4" : "white" }}>
                  <FileText className="size-5 shrink-0" style={{ color: d.uploaded ? "#166534" : "#635647" }} />
                  <span className="flex-1 text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{d.ten}</span>
                  {d.uploaded
                    ? <span className="flex items-center gap-1 text-[13px] text-[#166534]"><CheckCircle2 className="size-3.5" />Đã tải</span>
                    : <span className="text-[13px] text-[#b45309]">Chưa tải</span>}
                  {d.uploaded && <button className="text-[13px] text-[#1C5FBE] flex items-center gap-1"><Download className="size-3.5" />Tải</button>}
                </div>
              ))}
            </div>
          )}

          {/* Bổ sung */}
          {tab === "bosung" && (
            <div className="space-y-5">
              {/* Yêu cầu */}
              <div className="p-4 rounded-[12px]" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="size-4 text-[#ea580c]" />
                  <span className="text-[13px] text-[#9a3412]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Yêu cầu từ thẩm định viên</span>
                </div>
                <p className="text-[13px] text-[#92400e]" style={{ fontFamily: "var(--font-sans)", lineHeight: 1.6 }}>{hs.yeuCauBoSung}</p>
                <div className="mt-2 text-[13px] text-[#b45309]">· Thẩm định viên: {hs.handler} ({hs.handlerUnit})</div>
                <div className="mt-0.5 text-[13px] text-[#b45309]">· Hạn cuối bổ sung: <strong>{hs.slaDeadline}</strong></div>
              </div>

              {/* Upload docs */}
              <div>
                <h3 className="text-[13px] text-[#0b1426] mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Tải lên tài liệu bổ sung</h3>
                <div className="space-y-2">
                  {docs.filter(d => !d.uploaded).map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-[10px] border" style={{ borderColor: "#e2e8f0", background: "white" }}>
                      <FileText className="size-5 text-[#635647] shrink-0" />
                      <span className="flex-1 text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{d.ten}</span>
                      <button onClick={() => handleUpload(d.ten)}
                        disabled={uploading === d.ten}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[13px] text-white"
                        style={{ background: uploading === d.ten ? "#4f5d6e" : "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                        {uploading === d.ten ? <><Loader2 className="size-3 animate-spin" />Đang tải…</> : <><Upload className="size-3" />Tải lên</>}
                      </button>
                    </div>
                  ))}
                  {docs.filter(d => !d.uploaded).length === 0 && (
                    <div className="p-4 rounded-[10px] flex items-center gap-2" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
                      <CheckCircle2 className="size-5 text-[#166534]" />
                      <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Tất cả tài liệu đã được tải lên!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reply / ghi chú */}
              <div>
                <h3 className="text-[13px] text-[#0b1426] mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Gửi ghi chú cho thẩm định viên</h3>
                <textarea value={reply} onChange={e => setReply(e.target.value)}
                  rows={3}
                  placeholder="Giải thích, lưu ý hoặc câu hỏi gửi thẩm định viên..."
                  className="w-full px-4 py-3 border border-[#e2e8f0] rounded-[10px] text-[13px] outline-none focus:border-[#1C5FBE] resize-none"
                  style={{ fontFamily: "var(--font-sans)", background: "#fafaf9" }} />
                {sent && <p className="text-[13px] text-[#166534] mt-1">✅ Ghi chú đã được gửi.</p>}
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={handleSend}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] text-white"
                    style={{ background: "#0b1426", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                    <Send className="size-3.5" />Gửi ghi chú
                  </button>
                </div>
              </div>

              {/* Submit supplement */}
              <button
                className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] text-[13px] text-white"
                style={{ background: "linear-gradient(135deg,#b45309,#b45309)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                <ArrowRight className="size-4" />Nộp bổ sung hồ sơ chính thức
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
function Check({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>;
}

export function UserHoSoTracker({ user, onNavigate }: { user: LoginUser; onNavigate: (page: string) => void }) {
  const [hoSoList, setHoSoList] = useState(MY_HO_SO);
  const [selected, setSelected] = useState<MyHoSo | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);

  const urgent = hoSoList.filter(h => h.status === "yeu_cau_bo_sung");
  const done   = hoSoList.filter(h => h.status === "hoan_thanh");
  const inProg = hoSoList.filter(h => !["hoan_thanh","tu_choi","nhap"].includes(h.status));

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>
      {selected && <HoSoDetail hs={selected} onClose={() => setSelected(null)} />}
      {wizardOpen && (
        <TaoHoSoWizard
          user={user}
          onClose={() => setWizardOpen(false)}
          onDone={code => { setNewCode(code); setWizardOpen(false); }}
        />
      )}

      {/* Header */}
      <div className="px-8 py-5 border-b border-[#e2e8f0] flex items-center justify-between shrink-0" style={{ background: "white" }}>
        <div>
          <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Hồ sơ của tôi</h1>
          <p className="text-[13px] text-[#635647]">Theo dõi tiến trình xét duyệt · Cập nhật {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
        <button onClick={() => setWizardOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] text-white"
          style={{ background: "linear-gradient(135deg,#1C5FBE,#1752a8)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
          <Plus className="size-4" />Tạo hồ sơ mới
        </button>
      </div>

      {/* Stats */}
      <div className="px-8 py-4 grid grid-cols-4 gap-4 border-b border-[#e2e8f0] shrink-0" style={{ background: "white" }}>
        {[
          { l:"Tổng hồ sơ",     v:hoSoList.length, color:"#0b1426", bg:"#ffffff" },
          { l:"Đang xử lý",     v:inProg.length,   color:"#1C5FBE", bg:"#f0f4ff" },
          { l:"Cần bổ sung",    v:urgent.length,   color:"#b45309", bg:"#fef9ec" },
          { l:"Đã hoàn thành",  v:done.length,     color:"#166534", bg:"#dcfce7" },
        ].map(s => (
          <div key={s.l} className="rounded-[10px] px-4 py-3 flex items-center gap-3" style={{ background: s.bg }}>
            <span className="text-[24px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: s.color }}>{s.v}</span>
            <span className="text-[13px]" style={{ fontFamily: "var(--font-sans)", color: s.color }}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* New code banner */}
      {newCode && (
        <div className="mx-8 mt-4 p-4 rounded-[12px] flex items-center gap-3" style={{ background: "#f0fdf4", border: "2px solid #86efac" }}>
          <CheckCircle2 className="size-5 text-[#166534]" />
          <span className="flex-1 text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            Hồ sơ <code style={{ fontFamily: "JetBrains Mono,monospace" }}>{newCode}</code> đã được nộp thành công!
          </span>
          <button onClick={() => setNewCode(null)}><X className="size-4 text-[#166534]" /></button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Urgent first */}
        {urgent.length > 0 && (
          <div className="mb-6">
            <p className="text-[13px] uppercase tracking-widest text-[#b45309] mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              ⚠ Cần bổ sung ngay
            </p>
            <div className="space-y-3">
              {urgent.map(hs => (
                <HoSoCard key={hs.id} hs={hs} onClick={() => setSelected(hs)} />
              ))}
            </div>
          </div>
        )}

        {/* In progress */}
        {inProg.length > 0 && (
          <div className="mb-6">
            <p className="text-[13px] uppercase tracking-widest text-[#1C5FBE] mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Đang xử lý
            </p>
            <div className="space-y-3">
              {inProg.map(hs => (
                <HoSoCard key={hs.id} hs={hs} onClick={() => setSelected(hs)} />
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {done.length > 0 && (
          <div>
            <p className="text-[13px] uppercase tracking-widest text-[#166534] mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Đã hoàn thành
            </p>
            <div className="space-y-3">
              {done.map(hs => (
                <HoSoCard key={hs.id} hs={hs} onClick={() => setSelected(hs)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── HoSo Card ─────────────────────────────────────────────── */
function HoSoCard({ hs, onClick }: { hs: MyHoSo; onClick: () => void }) {
  const sc = SCONFIG[hs.status];
  const StatusIcon = sc.icon;
  const wfStep = getWorkflowStep(hs.status);

  return (
    <div onClick={onClick}
      className="rounded-[12px] border bg-white p-5 hover:shadow-md transition-all cursor-pointer hover:border-[#1C5FBE]/40"
      style={{
        borderColor: hs.status === "yeu_cau_bo_sung" ? "#fed7aa" : hs.status === "hoan_thanh" ? "#86efac" : "#e2e8f0",
        borderLeft: hs.status === "yeu_cau_bo_sung" ? "3px solid #b45309" : hs.status === "hoan_thanh" ? "3px solid #166534" : "3px solid #e2e8f0",
      }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <code className="text-[13px] text-[#635647]" style={{ fontFamily: "JetBrains Mono, monospace" }}>{hs.code}</code>
            <span className="px-2 py-0.5 rounded-full text-[13px]"
              style={{ background: sc.bg, color: sc.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              <span className="flex items-center gap-1"><StatusIcon className="size-2.5" />{sc.label}</span>
            </span>
            {hs.status === "yeu_cau_bo_sung" && (
              <span className="text-[13px] animate-pulse" style={{ color: "#b45309", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                Hạn: {hs.slaDeadline}
              </span>
            )}
          </div>
          <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{hs.danhHieu}</h3>
          <div className="flex items-center gap-3 mt-1 text-[13px] text-[#635647]">
            <span>{hs.capBac}</span>
            <span>·</span>
            <span>Cập nhật {hs.updatedDate}</span>
            {hs.handler && <><span>·</span><span className="flex items-center gap-1"><Building2 className="size-3"/>{hs.handler}</span></>}
          </div>
        </div>

        {/* AI score */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="relative size-12">
            <svg viewBox="0 0 48 48" className="size-12 -rotate-90">
              <circle cx="24" cy="24" r="19" fill="none" stroke="#eef2f8" strokeWidth="4" />
              <circle cx="24" cy="24" r="19" fill="none"
                stroke={hs.aiScore >= 85 ? "#166534" : hs.aiScore >= 70 ? "#b45309" : "#c8102e"}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 19}`}
                strokeDashoffset={`${2 * Math.PI * 19 * (1 - hs.aiScore / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[13px]" style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, color: hs.aiScore >= 85 ? "#166534" : hs.aiScore >= 70 ? "#b45309" : "#c8102e" }}>
                {hs.aiScore}
              </span>
            </div>
          </div>
          <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>AI Score</span>
        </div>
      </div>

      {/* Mini workflow bar */}
      {hs.status !== "tu_choi" && (
        <div className="mt-3 flex items-center gap-1">
          {WORKFLOW_STEPS.map((ws, i) => {
            const done = wfStep > i;
            const cur  = wfStep === i;
            return (
              <div key={ws.label} className="flex items-center flex-1 gap-1">
                <div className="h-1.5 flex-1 rounded-full transition-all"
                  style={{ background: done ? "#166534" : cur ? "#1C5FBE" : "#e2e8f0" }} />
              </div>
            );
          })}
          <span className="text-[13px] ml-1 text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Bước {wfStep + 1}/5
          </span>
        </div>
      )}

      <div className="flex items-center justify-end mt-3">
        <span className="flex items-center gap-1 text-[13px] text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          Xem chi tiết <ChevronRight className="size-3.5" />
        </span>
      </div>
    </div>
  );
}
