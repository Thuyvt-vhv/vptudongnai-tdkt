import { useState } from "react";
import {
  PenLine, Send, CheckCircle2, Megaphone, Building2, User, Upload,
  ClipboardCheck, Search, Globe, Gavel, FileSignature,
  Trophy, Star, Archive, ArrowRight, ChevronRight,
  ChevronUp, Flag, AlertCircle, BookOpen, GitMerge, Layers,
  RotateCcw, Play, CheckCheck, X, Network,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";
import { BpmnPhongTraoPage } from "./bpmn-phong-trao-page";

/* ─── Types ─────────────────────────────────────────────────── */
type RoleKey = "lãnh đạo cấp cao" | "quản trị hệ thống" | "hội đồng" | "lãnh đạo đơn vị" | "cá nhân";
type PhaseId = 0 | 1 | 2 | 3;
type ViewMode = "flow" | "sequence" | "bpmn";

interface Step {
  id: number;
  phaseId: PhaseId;
  role: RoleKey;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  next?: number[];
  rejectTo?: number;
  rejectLabel?: string;
  canCu?: string;
  status: "done" | "partial" | "missing";
}

/* ─── Data ─────────────────────────────────────────────────── */
const PHASES: { id: PhaseId; label: string; color: string; bg: string; border: string }[] = [
  { id: 0, label: "Phát động",             color: "#1C5FBE", bg: "#ddeafc", border: "#93c5fd" },
  { id: 1, label: "Triển khai & Đăng ký",  color: "#166534", bg: "#dcfce7", border: "#86efac" },
  { id: 2, label: "Thẩm định & Xét duyệt", color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
  { id: 3, label: "Ban hành & Lưu trữ",    color: "#b45309", bg: "#fef3c7", border: "#fcd34d" },
];

const ROLE_META: Record<RoleKey, { color: string; bg: string; border: string; short: string; emoji: string }> = {
  "lãnh đạo cấp cao":  { color: "#1C5FBE", bg: "#ddeafc", border: "#93c5fd", short: "LĐCC", emoji: "👑" },
  "quản trị hệ thống": { color: "#0e7490", bg: "#e0f2fe", border: "#67e8f9", short: "QTHT", emoji: "⚙️" },
  "hội đồng":          { color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd", short: "HĐ",   emoji: "⚖️" },
  "lãnh đạo đơn vị":   { color: "#166534", bg: "#dcfce7", border: "#86efac", short: "LĐĐV", emoji: "🏢" },
  "cá nhân":           { color: "#b45309", bg: "#fef3c7", border: "#fcd34d", short: "CN",   emoji: "👤" },
};

const ROLES: RoleKey[] = [
  "lãnh đạo cấp cao", "hội đồng", "lãnh đạo đơn vị", "cá nhân", "quản trị hệ thống",
];

const STEPS: Step[] = [
  // Phase 0
  { id: 1,  phaseId: 0, role: "lãnh đạo cấp cao", title: "Soạn thảo phong trào",   icon: PenLine,       next: [2],     canCu: "Điều 18 Luật TĐKT 2022",        status: "done",
    desc: "Tạo kế hoạch phong trào: mục tiêu, tiêu chí, thời gian, đối tượng, hình thức khen thưởng dự kiến." },
  { id: 2,  phaseId: 0, role: "lãnh đạo cấp cao", title: "Trình phê duyệt",         icon: Send,          next: [3],     canCu: "NĐ 152/2025/NĐ-CP Điều 6",       status: "done",
    desc: "Trình kế hoạch phong trào lên Hội đồng TĐKT để thẩm tra nội dung, đối chiếu tiêu chí pháp lý trước khi ban hành." },
  { id: 3,  phaseId: 0, role: "hội đồng",          title: "Phê duyệt kế hoạch",     icon: CheckCircle2,  next: [4],     canCu: "Điều 23 NĐ 152/2025/NĐ-CP",            status: "done",
    rejectTo: 1, rejectLabel: "Yêu cầu chỉnh sửa → Bước 1",
    desc: "Thư ký Hội đồng TĐKT thẩm tra tính hợp lệ, đối chiếu tiêu chí pháp lý; phê duyệt hoặc yêu cầu chỉnh sửa và trả về." },
  { id: 4,  phaseId: 0, role: "lãnh đạo cấp cao", title: "Ban hành & Công bố",      icon: Megaphone,     next: [5, 6],  canCu: "TT 15/2025/TT-BNV",             status: "done",
    desc: "Ký ban hành văn bản phát động, gửi thông báo đến toàn bộ đơn vị và cá nhân liên quan qua hệ thống." },

  // Phase 1
  { id: 5,  phaseId: 1, role: "lãnh đạo đơn vị",  title: "Đăng ký đơn vị",         icon: Building2,     next: [8],     canCu: "Khoản 1 Điều 6 Luật TĐKT",     status: "done",
    desc: "Lãnh đạo đơn vị đăng ký tham gia phong trào; phổ biến kế hoạch đến toàn bộ cán bộ, viên chức." },
  { id: 6,  phaseId: 1, role: "cá nhân",           title: "Đăng ký cá nhân",         icon: User,          next: [7],     canCu: "Điều 23 NĐ 152/2025/NĐ-CP",            status: "done",
    desc: "Cá nhân / tập thể đăng ký tham gia, lựa chọn danh hiệu đề nghị xét duyệt (CSTĐCS, LĐTT, Bằng khen…)." },
  { id: 7,  phaseId: 1, role: "cá nhân",           title: "Nộp hồ sơ",               icon: Upload,        next: [8],     canCu: "TT 15/2025/TT-BNV Phụ lục 3",  status: "done",
    desc: "Chuẩn bị và nộp đầy đủ hồ sơ minh chứng; kiểm tra AI tự động phát hiện thiếu sót trước khi nộp." },
  { id: 8,  phaseId: 1, role: "lãnh đạo đơn vị",  title: "Duyệt hồ sơ cơ sở",      icon: ClipboardCheck,next: [9],     canCu: "Khoản 2 Điều 55 Luật TĐKT",    status: "done",
    rejectTo: 7, rejectLabel: "Hồ sơ chưa đủ → trả lại Bước 7",
    desc: "Xem xét, phê duyệt hồ sơ của cán bộ; trả lại nếu thiếu minh chứng; gửi hồ sơ đạt yêu cầu lên Phòng TĐKT." },

  // Phase 2
  { id: 9,  phaseId: 2, role: "hội đồng",          title: "Tiếp nhận & Phân loại",  icon: Search,        next: [10],    canCu: "Điều 55 Luật TĐKT 2022",        status: "done",
    rejectTo: 8, rejectLabel: "Thiếu điều kiện hình thức → trả về Bước 8",
    desc: "Thư ký Hội đồng tiếp nhận hồ sơ, kiểm tra đủ điều kiện hình thức, phân loại theo danh hiệu đề nghị." },
  { id: 10, phaseId: 2, role: "hội đồng",          title: "Thẩm định nội dung",      icon: CheckCheck,    next: [11],    canCu: "Điều 55–56 Luật TĐKT 2022",     status: "done",
    rejectTo: 8, rejectLabel: "Không đủ tiêu chí → trả về Bước 8",
    desc: "Hội đồng thẩm định chi tiết hồ sơ: chấm điểm tiêu chí, kiểm tra COI tự động, lập danh sách đủ điều kiện." },
  { id: 11, phaseId: 2, role: "lãnh đạo cấp cao", title: "Lấy ý kiến công khai",    icon: Globe,         next: [12],    canCu: "Điều 56 Luật TĐKT 2022",        status: "partial",
    rejectTo: 10, rejectLabel: "Có phản ánh hợp lệ → xem xét lại Bước 10",
    desc: "Mở cổng lấy ý kiến công khai tối thiểu 30 ngày; tiếp nhận và xử lý phản ánh hợp lệ trước khi chuyển HĐ bình xét." },
  { id: 12, phaseId: 2, role: "hội đồng",          title: "Bình xét Hội đồng",       icon: Gavel,         next: [13],    canCu: "Điều 57 Luật TĐKT 2022",        status: "done",
    rejectTo: 9, rejectLabel: "Không đủ 2/3 phiếu → hồ sơ rút, thông báo đơn vị",
    desc: "Hội đồng TĐKT họp, bỏ phiếu kín — hồ sơ thông qua khi ≥ 2/3 tổng số thành viên tán thành; lập biên bản kết quả." },
  { id: 13, phaseId: 2, role: "lãnh đạo cấp cao", title: "Trình ký lãnh đạo",       icon: CheckCircle2,  next: [14],    canCu: "Điều 58 Luật TĐKT 2022",        status: "done",
    desc: "Trình danh sách đề nghị khen thưởng đã được Hội đồng thống nhất lên lãnh đạo có thẩm quyền để ký duyệt chính thức." },

  // Phase 3
  { id: 14, phaseId: 3, role: "lãnh đạo cấp cao", title: "Ký số quyết định",        icon: FileSignature,  next: [15],   canCu: "NĐ 130/2018/NĐ-CP",             status: "done",
    desc: "Ký số CA ban hành Quyết định khen thưởng chính thức; có giá trị pháp lý theo Luật GDĐT 2023." },
  { id: 15, phaseId: 3, role: "lãnh đạo cấp cao", title: "Công bố kết quả",         icon: Trophy,         next: [16],   canCu: "Điều 5 NĐ 152/2025/NĐ-CP",             status: "done",
    desc: "Lãnh đạo ký thông báo kết quả; gửi quyết định đến cá nhân / tập thể được khen thưởng qua hệ thống." },
  { id: 16, phaseId: 3, role: "cá nhân",           title: "Nhận kết quả",             icon: Star,           next: [17],   canCu: "Luật TĐKT 2022",                status: "partial",
    desc: "Cá nhân / tập thể nhận Quyết định khen thưởng; kết quả cập nhật tự động vào hồ sơ cán bộ điện tử." },
  { id: 17, phaseId: 3, role: "quản trị hệ thống", title: "Lưu trữ hồ sơ",          icon: Archive,                      canCu: "NĐ 30/2020/NĐ-CP",              status: "done",
    desc: "Lưu trữ toàn bộ hồ sơ khen thưởng (biên bản, quyết định, minh chứng) theo thời hạn bảo quản quy định." },
];

/* ─── Flow View ─────────────────────────────────────────────── */
function FlowView({ selectedStep, onSelect }: {
  selectedStep: Step | null; onSelect: (s: Step) => void;
}) {
  const phases = PHASES.map(p => ({
    ...p,
    steps: STEPS.filter(s => s.phaseId === p.id),
  }));

  return (
    <div className="overflow-x-auto pb-2">
      <div style={{ minWidth: 900 }}>
        {/* Phase header row */}
        <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {PHASES.map((p, i) => (
            <div key={p.id} className="rounded-[10px] px-4 py-2.5 flex items-center gap-2"
              style={{ background: p.bg, border: `1.5px solid ${p.border}` }}>
              <span className="size-6 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
                style={{ background: p.color, fontWeight: 700 }}>{i + 1}</span>
              <span className="text-[13px]" style={{ color: p.color, fontWeight: 700 }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Swimlane rows */}
        {ROLES.map(role => {
          const rm = ROLE_META[role];
          const hasAny = STEPS.some(s => s.role === role);
          if (!hasAny) return null;
          return (
            <div key={role} className="flex gap-0 mb-2">
              {/* Role label */}
              <div className="shrink-0 flex items-center gap-2 rounded-[10px] px-3 mr-3"
                style={{ width: 148, background: `${rm.bg}`, border: `1.5px solid ${rm.border}`, minHeight: 64 }}>
                <span className="text-[18px]">{rm.emoji}</span>
                <div>
                  <div className="text-[13px] leading-tight" style={{ color: rm.color, fontWeight: 700 }}>{role}</div>
                  <div className="text-[13px] opacity-60" style={{ color: rm.color }}>{rm.short}</div>
                </div>
              </div>

              {/* Phase cells */}
              <div className="flex-1 grid gap-3" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
                {PHASES.map(phase => {
                  const steps = STEPS.filter(s => s.role === role && s.phaseId === phase.id);
                  return (
                    <div key={phase.id} className="flex flex-col gap-2 justify-center"
                      style={{ minHeight: 64, padding: "6px 0" }}>
                      {steps.length === 0 ? (
                        <div className="rounded-[8px] border-dashed border h-10 flex items-center justify-center"
                          style={{ borderColor: "#e0dbd0" }}>
                          <span className="text-[13px] text-[#ccc5b8]">—</span>
                        </div>
                      ) : steps.map(step => {
                        const isSelected = selectedStep?.id === step.id;
                        const rejectStep = step.rejectTo != null ? STEPS.find(s => s.id === step.rejectTo) : null;
                        const Icon = step.icon;
                        const statusDot = step.status === "done" ? "#166534" : step.status === "partial" ? "#b45309" : "#c8102e";
                        return (
                          <div key={step.id} className="relative">
                            <button
                              onClick={() => onSelect(step)}
                              className="w-full text-left rounded-[10px] border-2 transition-all hover:shadow-md"
                              style={{
                                borderColor: isSelected ? rm.color : rm.border,
                                background: isSelected ? rm.bg : "white",
                                boxShadow: isSelected ? `0 0 0 3px ${rm.color}30` : "0 1px 3px rgba(0,0,0,0.06)",
                              }}>
                              {/* Top accent */}
                              <div className="h-1 rounded-t-[8px]" style={{ background: `linear-gradient(to right,${rm.color},${rm.color}88)` }} />
                              <div className="px-2.5 py-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <div className="size-5 rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
                                    style={{ background: rm.color, fontWeight: 700 }}>{step.id}</div>
                                  <span className="size-1.5 rounded-full shrink-0 ml-auto" style={{ background: statusDot }} />
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <Icon className="size-3.5 shrink-0 mt-0.5" style={{ color: rm.color }} />
                                  <span className="text-[13px] leading-tight" style={{ fontWeight: 700, color: "#0b1426" }}>
                                    {step.title}
                                  </span>
                                </div>
                                {/* Next arrows */}
                                {step.next && (
                                  <div className="flex items-center gap-1 mt-1.5 text-[13px]" style={{ color: rm.color }}>
                                    <ArrowRight className="size-3" />
                                    <span>→ Bước {step.next.join(", ")}</span>
                                  </div>
                                )}
                                {/* Reject path */}
                                {rejectStep && (
                                  <div className="flex items-center gap-1 mt-0.5 text-[13px]" style={{ color: "#c8102e" }}>
                                    <RotateCcw className="size-3" />
                                    <span>↩ Từ chối → #{rejectStep.id}</span>
                                  </div>
                                )}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Phase connectors legend */}
        <div className="flex items-center gap-6 mt-4 px-1">
          <div className="flex items-center gap-2 text-[13px] text-[#5a5040]">
            <ArrowRight className="size-3.5 text-[#1C5FBE]" />
            <span>Luồng duyệt tiếp theo</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#5a5040]">
            <RotateCcw className="size-3.5 text-[#c8102e]" />
            <span>Từ chối / Trả về</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#5a5040]">
            <span className="size-2 rounded-full bg-[#166534]" />
            <span>Đã triển khai</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#5a5040]">
            <span className="size-2 rounded-full bg-[#b45309]" />
            <span>Một phần</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#5a5040]">
            <span className="size-2 rounded-full bg-[#c8102e]" />
            <span>Chưa có</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sequence Flow View ─────────────────────────────────────── */
function SequenceView({ selectedStep, onSelect }: {
  selectedStep: Step | null; onSelect: (s: Step) => void;
}) {
  return (
    <div className="space-y-0">
      {STEPS.map((step, idx) => {
        const rm = ROLE_META[step.role];
        const phase = PHASES[step.phaseId];
        const isPhaseStart = idx === 0 || STEPS[idx - 1].phaseId !== step.phaseId;
        const isPhaseEnd = idx === STEPS.length - 1 || STEPS[idx + 1].phaseId !== step.phaseId;
        const rejectStep = step.rejectTo != null ? STEPS.find(s => s.id === step.rejectTo) : null;
        const Icon = step.icon;
        const isSelected = selectedStep?.id === step.id;

        return (
          <div key={step.id}>
            {isPhaseStart && (
              <div className="flex items-center gap-3 py-3">
                <div className="flex-1 h-px" style={{ background: `${phase.color}30` }} />
                <div className="text-[13px] uppercase tracking-widest px-3 py-1 rounded-full shrink-0"
                  style={{ background: phase.bg, color: phase.color, border: `1px solid ${phase.border}`, fontWeight: 700 }}>
                  {phase.label}
                </div>
                <div className="flex-1 h-px" style={{ background: `${phase.color}30` }} />
              </div>
            )}

            <div className="flex gap-3 items-stretch">
              {/* Step node + vertical connector */}
              <div className="flex flex-col items-center" style={{ width: 40 }}>
                <button
                  onClick={() => onSelect(step)}
                  className="size-10 rounded-full flex items-center justify-center text-white text-[13px] shrink-0 transition-all hover:scale-110 z-10 border-2"
                  style={{
                    background: rm.color,
                    fontWeight: 700,
                    borderColor: isSelected ? "white" : rm.color,
                    boxShadow: isSelected ? `0 0 0 3px ${rm.color}` : `0 2px 8px ${rm.color}40`,
                  }}>
                  {step.id}
                </button>
                {!isPhaseEnd && (
                  <div className="w-px flex-1 my-1" style={{ background: `${rm.color}40`, minHeight: 16 }} />
                )}
              </div>

              {/* Card */}
              <div className="flex-1 pb-2">
                <button
                  onClick={() => onSelect(step)}
                  className="w-full text-left rounded-[12px] border-2 transition-all hover:shadow-md"
                  style={{
                    borderColor: isSelected ? rm.color : "#e2e8f0",
                    background: isSelected ? rm.bg : "white",
                    boxShadow: isSelected ? `0 0 0 3px ${rm.color}20` : undefined,
                  }}>
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="size-4 shrink-0" style={{ color: rm.color }} />
                      <span className="text-[13px] text-[#0b1426]" style={{ fontWeight: 700 }}>{step.title}</span>
                      <span className="ml-auto text-[13px] px-2 py-0.5 rounded-full"
                        style={{ background: rm.bg, color: rm.color, border: `1px solid ${rm.border}`, fontWeight: 600 }}>
                        {rm.emoji} {rm.short}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#5a5040] leading-relaxed">{step.desc}</p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {step.next && (
                        <span className="flex items-center gap-1 text-[13px]" style={{ color: rm.color }}>
                          <ArrowRight className="size-3" />
                          Duyệt → Bước {step.next.join(", ")}
                        </span>
                      )}
                      {rejectStep && (
                        <span className="flex items-center gap-1 text-[13px]" style={{ color: "#c8102e" }}>
                          <RotateCcw className="size-3" />
                          Từ chối → #{rejectStep.id} {rejectStep.title}
                        </span>
                      )}
                      <span className="ml-auto text-[13px]" style={{
                        color: step.status === "done" ? "#166534" : step.status === "partial" ? "#b45309" : "#c8102e",
                        fontWeight: 600,
                      }}>
                        {step.status === "done" ? "✅ Triển khai" : step.status === "partial" ? "⚠️ Một phần" : "❌ Chưa có"}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Detail Panel ─────────────────────────────────────────── */
function DetailPanel({ step, onClose, onNavigate }: {
  step: Step; onClose: () => void; onNavigate: (s: Step) => void;
}) {
  const rm = ROLE_META[step.role];
  const rejectStep = step.rejectTo != null ? STEPS.find(s => s.id === step.rejectTo) : null;
  const Icon = step.icon;

  return (
    <div className="mt-4 rounded-[14px] border-2 overflow-hidden" style={{ borderColor: rm.color }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-start gap-4"
        style={{ background: `linear-gradient(135deg,${rm.color}18,${rm.bg})` }}>
        <div className="size-12 rounded-[12px] flex items-center justify-center shrink-0 text-white"
          style={{ background: `linear-gradient(135deg,${rm.color},${rm.color}cc)` }}>
          <Icon className="size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[13px] px-2 py-0.5 rounded-full text-white"
              style={{ background: PHASES[step.phaseId].color, fontWeight: 700 }}>
              Giai đoạn {step.phaseId + 1} · {PHASES[step.phaseId].label}
            </span>
            <span className="text-[13px] px-2 py-0.5 rounded-full"
              style={{ background: rm.bg, color: rm.color, border: `1px solid ${rm.border}`, fontWeight: 700 }}>
              {rm.emoji} {step.role}
            </span>
          </div>
          <h3 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            Bước {step.id}: {step.title}
          </h3>
          <p className="text-[13px] text-[#5a5040] leading-relaxed mt-1">{step.desc}</p>
        </div>
        <button onClick={onClose}
          className="size-8 rounded-lg flex items-center justify-center hover:bg-black/5 shrink-0">
          <X className="size-4 text-[#635647]" />
        </button>
      </div>

      {/* Info row */}
      <div className="px-5 py-3 grid grid-cols-2 gap-4 border-t" style={{ borderColor: `${rm.color}25` }}>
        {/* Căn cứ */}
        {step.canCu && (
          <div className="flex items-start gap-2">
            <BookOpen className="size-4 text-[#635647] shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] uppercase tracking-wide text-[#635647] mb-0.5 font-bold">Căn cứ pháp lý</div>
              <div className="text-[13px] text-[#0b1426] font-semibold">{step.canCu}</div>
            </div>
          </div>
        )}

        {/* Trạng thái */}
        <div className="flex items-start gap-2">
          <Flag className="size-4 shrink-0 mt-0.5"
            style={{ color: step.status === "done" ? "#166534" : step.status === "partial" ? "#b45309" : "#c8102e" }} />
          <div>
            <div className="text-[13px] uppercase tracking-wide text-[#635647] mb-0.5 font-bold">Trạng thái</div>
            <div className="text-[13px] font-bold"
              style={{ color: step.status === "done" ? "#166534" : step.status === "partial" ? "#b45309" : "#c8102e" }}>
              {step.status === "done" ? "✅ Đã triển khai đầy đủ" : step.status === "partial" ? "⚠️ Triển khai một phần" : "❌ Chưa triển khai"}
            </div>
          </div>
        </div>

        {/* Chuyển tiếp */}
        {step.next && step.next.length > 0 && (
          <div className="flex items-start gap-2">
            <ArrowRight className="size-4 shrink-0 mt-0.5" style={{ color: rm.color }} />
            <div>
              <div className="text-[13px] uppercase tracking-wide text-[#635647] mb-0.5 font-bold">Duyệt → Chuyển đến</div>
              <div className="flex flex-wrap gap-1.5">
                {step.next.map(nid => {
                  const ns = STEPS.find(s => s.id === nid);
                  if (!ns) return null;
                  const nrm = ROLE_META[ns.role];
                  return (
                    <button key={nid} onClick={() => onNavigate(ns)}
                      className="text-[13px] px-2.5 py-1 rounded-full border font-semibold hover:shadow-sm transition-all"
                      style={{ background: nrm.bg, color: nrm.color, borderColor: nrm.border }}>
                      #{nid} {ns.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Từ chối */}
        {rejectStep && (
          <div className="flex items-start gap-2">
            <RotateCcw className="size-4 shrink-0 mt-0.5 text-[#c8102e]" />
            <div>
              <div className="text-[13px] uppercase tracking-wide mb-0.5 font-bold text-[#c8102e]">Từ chối → Trả về</div>
              <button onClick={() => onNavigate(rejectStep)}
                className="text-[13px] px-2.5 py-1 rounded-full border font-semibold hover:shadow-sm transition-all"
                style={{ background: "#fee2e2", color: "#c8102e", borderColor: "#fca5a5" }}>
                #{rejectStep.id} {rejectStep.title}
              </button>
              {step.rejectLabel && (
                <p className="text-[13px] mt-1 text-[#c8102e] opacity-80">{step.rejectLabel}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export function LuongNghiepVuPage({ user }: { user: LoginUser }) {
  useTheme();
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("flow");

  const toggleStep = (step: Step) =>
    setSelectedStep(prev => prev?.id === step.id ? null : step);

  const statusCount = {
    done:    STEPS.filter(s => s.status === "done").length,
    partial: STEPS.filter(s => s.status === "partial").length,
    missing: STEPS.filter(s => s.status === "missing").length,
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-paper)", fontFamily: "var(--font-sans)" }}>
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-0">
        <div className="flex items-start gap-4 mb-5">
          <div className="size-12 rounded-[12px] flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <GitMerge className="size-6 text-[#8a6400]" />
          </div>
          <div className="flex-1">
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Luồng Nghiệp vụ: Phát động Phong trào
            </h1>
            <p className="text-[13px] text-[#5a5040] mt-0.5">
              5 vai trò · 4 giai đoạn · 17 bước · Có nhánh từ chối & trả về
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-[10px] border overflow-hidden shrink-0"
            style={{ borderColor: "#e0dbd0" }}>
            {([
              { key: "flow",     label: "Sơ đồ làn",  icon: Layers },
              { key: "sequence", label: "Tuần tự",    icon: Play },
              { key: "bpmn",     label: "BPMN",       icon: Network },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key}
                onClick={() => setViewMode(key as ViewMode)}
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] transition-all"
                style={{
                  background: viewMode === key ? "#0b1426" : "white",
                  color: viewMode === key ? "white" : "#5a5040",
                  fontWeight: viewMode === key ? 700 : 500,
                }}>
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {[
            { label: "Tổng bước",       value: STEPS.length,          color: "#0b1426", bg: "#f5f3ee" },
            { label: "Đã triển khai",   value: statusCount.done,      color: "#166534", bg: "#dcfce7" },
            { label: "Một phần",        value: statusCount.partial,   color: "#b45309", bg: "#fef3c7" },
            { label: "Chưa có",         value: statusCount.missing,   color: "#c8102e", bg: "#fee2e2" },
            { label: "Nhánh từ chối",   value: STEPS.filter(s => s.rejectTo).length, color: "#c8102e", bg: "#fee2e2" },
          ].map(s => (
            <div key={s.label} className="rounded-[10px] px-4 py-3 text-center"
              style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
              <div className="text-[18px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
              <div className="text-[13px]" style={{ color: s.color, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Role pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {ROLES.map(role => {
            const rm = ROLE_META[role];
            const count = STEPS.filter(s => s.role === role).length;
            return (
              <div key={role} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px]"
                style={{ background: rm.bg, borderColor: rm.border, color: rm.color, fontWeight: 600 }}>
                <span>{rm.emoji}</span>
                <span>{role}</span>
                <span className="opacity-50 font-normal">· {count} bước</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-8">
        {viewMode === "bpmn" ? (
          <BpmnPhongTraoPage user={user} />
        ) : (
          <>
            {/* ── Main flow view ── */}
            <div className="rounded-[14px] border p-5 mb-4" style={{ background: "white", borderColor: "#e2e8f0" }}>
              {viewMode === "flow"
                ? <FlowView selectedStep={selectedStep} onSelect={toggleStep} />
                : <SequenceView selectedStep={selectedStep} onSelect={toggleStep} />
              }
            </div>

            {/* ── Detail panel (click any step) ── */}
            {selectedStep && (
              <DetailPanel
                step={selectedStep}
                onClose={() => setSelectedStep(null)}
                onNavigate={setSelectedStep}
              />
            )}

            {/* ── Gaps & Recommendations ── */}
        <div className="mt-6 rounded-[14px] border overflow-hidden" style={{ borderColor: "#fcd34d" }}>
          <div className="px-5 py-4 border-b flex items-center gap-3" style={{ background: "#fef9ec", borderColor: "#fcd34d" }}>
            <AlertCircle className="size-5 text-[#b45309]" />
            <h3 className="text-[14px] text-[#92400e]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Đánh giá & Đề xuất hoàn thiện
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {[
              {
                step: "Bước 11 — Lấy ý kiến công khai (LĐCC)",
                issue: "Trang lấy ý kiến công khai chưa liên kết với phong trào cụ thể và chưa có cơ chế đóng tự động sau 30 ngày.",
                fix: "Tích hợp nút 'Mở lấy ý kiến' từ phong-trao-page khi campaign ở trạng thái unit_review; tự động chuyển sang council_review sau khi hết hạn và không có phản ánh tồn đọng.",
                color: "#b45309", bg: "#fef9ec", border: "#fcd34d",
              },
              {
                step: "Bước 16 — Nhận kết quả (Cá nhân)",
                issue: "Dashboard cá nhân chưa hiển thị kết quả khen thưởng và liên kết đến Quyết định đã ban hành.",
                fix: "Bổ sung widget 'Kết quả khen thưởng của tôi' vào UserDashboard; liên kết đến ky-so-page để xem và tải QĐ đã ký số.",
                color: "#b45309", bg: "#fef9ec", border: "#fcd34d",
              },
              {
                step: "Liên kết Phong trào ↔ Đề nghị khen thưởng",
                issue: "phong-trao-page và de-nghi-khen-thuong-page hoạt động độc lập; hồ sơ đề nghị không có trường campaignId để truy vết nguồn gốc phong trào.",
                fix: "Thêm trường campaignId vào Nomination; cho phép tạo đề nghị trực tiếp từ màn hình chi tiết phong trào để tự động liên kết và lọc danh sách.",
                color: "#c2410c", bg: "#fff7ed", border: "#fdba74",
              },
            ].map((r, i) => (
              <div key={i} className="rounded-[10px] border p-4" style={{ background: r.bg, borderColor: r.border }}>
                <div className="text-[13px] mb-1 font-bold" style={{ color: r.color }}>{r.step}</div>
                <div className="text-[13px] text-[#5a5040] mb-2">
                  <span className="font-bold">Vấn đề:</span> {r.issue}
                </div>
                <div className="flex items-start gap-2 text-[13px]" style={{ color: r.color }}>
                  <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
                  <span><span className="font-bold">Đề xuất:</span> {r.fix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
