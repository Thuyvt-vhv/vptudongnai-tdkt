/**
 * user-dashboard.tsx
 * Dashboard cá nhân dành riêng cho vai trò "user" (cán bộ cá nhân)
 * - Chào mừng + điểm thi đua gauge
 * - AI gợi ý danh hiệu tôi đủ điều kiện
 * - Hồ sơ của tôi (mini list + trạng thái)
 * - Phong trào đang tham gia
 * - Timeline thông báo
 * - Quick actions
 */
import { useState, useEffect } from "react";
import {
  Award, Sparkles, CheckCircle2, AlertTriangle, Clock, ArrowRight,
  Bell, ChevronRight, Star, Building2, TrendingUp, FileText,
  MessageSquare, Megaphone, Trophy, Users, Plus, RefreshCw,
  Target, Zap, Shield, BookOpen, CheckCheck,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { TaoHoSoWizard } from "./tao-ho-so-wizard";

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
interface AISuggestion {
  danhHieu: string; capBac: string; score: number; ok: boolean; note?: string; color: string; bg: string;
}
const AI_SUGGESTIONS: AISuggestion[] = [
  { danhHieu:"Chiến sĩ thi đua cơ sở",  capBac:"Cấp cơ sở", score:91, ok:true,  color:"#166534", bg:"#dcfce7" },
  { danhHieu:"Bằng khen UBND Tỉnh",     capBac:"Cấp tỉnh",  score:85, ok:true,  color:"#8a6400", bg:"#fef9ec" },
  { danhHieu:"Chiến sĩ thi đua cấp Tỉnh",capBac:"Cấp tỉnh", score:68, ok:false, note:"Cần thêm 1 năm CSTĐ CS", color:"#1C5FBE", bg:"#f0f4ff" },
];

interface MyHoSoMini {
  code: string; danhHieu: string; status: string; statusColor: string; statusBg: string; updated: string; step: number;
}
const MY_HO_SO: MyHoSoMini[] = [
  { code:"TĐKT-2026-047", danhHieu:"Bằng khen UBND Tỉnh",       status:"Chờ ký số",         statusColor:"#8a6400", statusBg:"#fef9ec", updated:"18/04/2026", step:4 },
  { code:"TĐKT-2026-039", danhHieu:"Chiến sĩ thi đua cơ sở",    status:"Yêu cầu bổ sung",   statusColor:"#b45309", statusBg:"#fff7ed", updated:"23/04/2026", step:2 },
  { code:"TĐKT-2025-118", danhHieu:"Lao động tiên tiến",         status:"Hoàn thành ✓",       statusColor:"#166534", statusBg:"#dcfce7", updated:"28/02/2025", step:5 },
];

interface PhongTraoItem {
  id: string; ten: string; batDau: string; ketThuc: string; progress: number; color: string;
}
const MY_PHONG_TRAO: PhongTraoItem[] = [
  { id:"pt1", ten:"Đổi mới sáng tạo 2026", batDau:"01/01/2026", ketThuc:"30/11/2026", progress:35, color:"#1C5FBE" },
  { id:"pt2", ten:"Lao động giỏi, lao động sáng tạo", batDau:"01/03/2026", ketThuc:"31/08/2026", progress:62, color:"#166534" },
];

interface Notification {
  id: string; type: "info" | "warning" | "success"; text: string; time: string; link?: string;
}
const NOTIFICATIONS: Notification[] = [
  { id:"n1", type:"warning", text:"Hồ sơ TĐKT-2026-039 yêu cầu bổ sung trước 07/05/2026.", time:"Hôm nay 09:15" },
  { id:"n2", type:"info",    text:"Hồ sơ TĐKT-2026-047 đang chờ lãnh đạo ký số. AI Score: 92/100.", time:"Hôm qua 16:30" },
  { id:"n3", type:"success", text:"Phong trào 'Lao động giỏi' đã ghi nhận 3 sáng kiến của bạn.", time:"23/04/2026" },
  { id:"n4", type:"info",    text:"Điểm thi đua tháng 4/2026 của bạn: 94/100 — Xếp loại Xuất sắc.", time:"20/04/2026" },
];

const NOTIF_COLOR: Record<string, string> = { info:"#1C5FBE", warning:"#b45309", success:"#166534" };
const NOTIF_BG:    Record<string, string> = { info:"#f0f4ff", warning:"#fff7ed", success:"#f0fdf4" };

/* ═══════════════════════════════════════════════════════════════
   SCORE GAUGE
═══════════════════════════════════════════════════════════════ */
function ScoreGauge({ score, label }: { score: number; label: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const step = score / 40;
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(score, cur + step);
      setDisplayed(Math.round(cur));
      if (cur >= score) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [score]);

  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-32">
        <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#eef2f8" strokeWidth="10" />
          <circle cx="60" cy="60" r={r} fill="none"
            stroke={score >= 85 ? "#166534" : score >= 70 ? "#b45309" : "#c8102e"}
            strokeWidth="10"
            strokeDasharray={`${circ}`}
            strokeDashoffset={`${circ - dash}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.05s" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, lineHeight: 1 }}>{displayed}</span>
          <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>/100</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{label}</div>
        <div className="text-[13px] text-[#635647]">Điểm thi đua 2026</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export function UserDashboard({ user, onNavigate }: { user: LoginUser; onNavigate: (page: string) => void }) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visibleNotif = NOTIFICATIONS.filter(n => !dismissed.includes(n.id));
  const userName = user.name || "Nguyễn Văn Minh";
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>
      {wizardOpen && (
        <TaoHoSoWizard
          user={user}
          onClose={() => setWizardOpen(false)}
          onDone={code => { setNewCode(code); setWizardOpen(false); }}
        />
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden px-8 py-10"
        style={{ background: "linear-gradient(135deg,#0b1426 0%,#1a2744 50%,#1C5FBE 100%)" }}>
        {/* decorative */}
        <div className="absolute top-0 right-0 size-72 opacity-10 rounded-full"
          style={{ background: "radial-gradient(circle,#8a6400,transparent)", transform: "translate(20%,-30%)" }} />
        <div className="absolute bottom-0 left-0 size-48 opacity-10 rounded-full"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent)", transform: "translate(-30%,30%)" }} />

        <div className="relative z-10 flex items-start justify-between gap-8">
          <div className="flex-1">
            <p className="text-[13px] uppercase tracking-widest text-white/50 mb-1" style={{ fontFamily: "var(--font-sans)" }}>
              {greeting}
            </p>
            <h1 className="text-[24px] text-white mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {userName}
            </h1>
            <p className="text-[13px] text-white/60 mb-6" style={{ fontFamily: "var(--font-sans)" }}>
              Cán bộ · Sở Nội vụ Đồng Nai · Năm công tác 2026
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { label:"Hồ sơ đang xử lý", value:"2", color:"#bfdbfe" },
                { label:"Phong trào tham gia", value:"2", color:"#bbf7d0" },
                { label:"Khen thưởng đã nhận", value:"3", color:"#fde68a" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-[8px]"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <span className="text-[18px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: s.color }}>{s.value}</span>
                  <span className="text-[13px] text-white/60">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <div className="flex items-center gap-3">
              <button onClick={() => setWizardOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-[13px] text-white"
                style={{ background: "linear-gradient(135deg,#8a6400,#b45309)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                <Plus className="size-4" />Tạo hồ sơ đề nghị khen thưởng
              </button>
              <button onClick={() => onNavigate("Đề nghị khen thưởng")}
                className="flex items-center gap-2 px-4 py-3 rounded-[10px] text-[13px] text-white/80 hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,0.25)", fontFamily: "var(--font-sans)" }}>
                Theo dõi hồ sơ <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Score Gauge */}
          <div className="shrink-0 bg-white/10 rounded-[16px] p-5 backdrop-blur-sm" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
            <ScoreGauge score={94} label="Xuất sắc" />
          </div>
        </div>
      </div>

      {/* New code banner */}
      {newCode && (
        <div className="mx-8 mt-4 p-4 rounded-[12px] flex items-center gap-3" style={{ background: "#f0fdf4", border: "2px solid #86efac" }}>
          <CheckCircle2 className="size-5 text-[#166534]" />
          <span className="flex-1 text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            Hồ sơ <code style={{ fontFamily: "JetBrains Mono,monospace" }}>{newCode}</code> đã được nộp thành công!
          </span>
          <button onClick={() => setNewCode(null)} className="text-[#166534] hover:opacity-70">✕</button>
        </div>
      )}

      {/* Main grid */}
      <div className="px-8 py-6 grid grid-cols-3 gap-5">

        {/* ─── LEFT: AI Gợi ý + Hồ sơ ─────────────────────── */}
        <div className="col-span-2 space-y-5">

          {/* AI Eligibility */}
          <div className="rounded-[14px] border border-[#e2e8f0] overflow-hidden" style={{ background: "white" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #eef2f8" }}>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#7c3aed]" />
                <h2 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>AI gợi ý danh hiệu phù hợp</h2>
              </div>
              <span className="text-[13px] px-2 py-1 rounded-full bg-[#f5f3ff] text-[#7c3aed]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Dựa trên hồ sơ của bạn</span>
            </div>
            <div className="p-4 space-y-3">
              {AI_SUGGESTIONS.map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-[10px] border transition-all hover:shadow-sm cursor-pointer"
                  style={{ borderColor: s.ok ? "#e2e8f0" : "#f5e3c8", background: s.ok ? "#fafaf9" : "#fffbf5" }}>
                  {/* Score ring */}
                  <div className="relative size-12 shrink-0">
                    <svg viewBox="0 0 48 48" className="size-12 -rotate-90">
                      <circle cx="24" cy="24" r="19" fill="none" stroke="#eef2f8" strokeWidth="4" />
                      <circle cx="24" cy="24" r="19" fill="none"
                        stroke={s.score >= 80 ? s.color : "#b45309"}
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 19}`}
                        strokeDashoffset={`${2 * Math.PI * 19 * (1 - s.score / 100)}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[13px]" style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, color: s.color }}>{s.score}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{s.danhHieu}</h3>
                      <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background: s.bg, color: s.color, fontFamily: "var(--font-sans)" }}>{s.capBac}</span>
                    </div>
                    {s.ok
                      ? <div className="flex items-center gap-1 text-[13px] text-[#166534]"><CheckCircle2 className="size-3" />Đủ điều kiện — Có thể đề nghị ngay</div>
                      : <div className="flex items-center gap-1 text-[13px] text-[#b45309]"><AlertTriangle className="size-3" />{s.note}</div>}
                  </div>
                  {s.ok && (
                    <button onClick={() => setWizardOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[13px] text-white shrink-0"
                      style={{ background: s.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                      <Plus className="size-3.5" />Tạo hồ sơ
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* My Hồ sơ */}
          <div className="rounded-[14px] border border-[#e2e8f0] overflow-hidden" style={{ background: "white" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #eef2f8" }}>
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-[#1C5FBE]" />
                <h2 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Hồ sơ của tôi</h2>
              </div>
              <button onClick={() => onNavigate("Đề nghị khen thưởng")}
                className="flex items-center gap-1 text-[13px] text-[#1C5FBE] hover:text-[#1752a8]"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                Xem tất cả <ChevronRight className="size-3.5" />
              </button>
            </div>
            <div className="divide-y divide-[#f4f7fb]">
              {MY_HO_SO.map((h, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 hover:bg-[#fafaf9] transition-colors cursor-pointer"
                  onClick={() => onNavigate("Đề nghị khen thưởng")}>
                  {/* Step progress mini */}
                  <div className="flex gap-0.5 items-center shrink-0">
                    {[1,2,3,4,5].map(s => (
                      <div key={s} className="w-4 h-1.5 rounded-full"
                        style={{ background: h.step >= s ? h.statusColor : "#e2e8f0" }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <code className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "JetBrains Mono,monospace" }}>{h.code}</code>
                      <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background: h.statusBg, color: h.statusColor, fontFamily: "var(--font-sans)", fontWeight: 700 }}>{h.status}</span>
                    </div>
                    <div className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{h.danhHieu}</div>
                  </div>
                  <div className="text-[13px] text-[#6b5e47] shrink-0" style={{ fontFamily: "JetBrains Mono,monospace" }}>{h.updated}</div>
                  <ChevronRight className="size-4 text-[#d1d5db]" />
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[#f4f7fb]">
              <button onClick={() => setWizardOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] border-2 border-dashed border-[#d1d5db] text-[13px] text-[#635647] hover:border-[#1C5FBE] hover:text-[#1C5FBE] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}>
                <Plus className="size-4" />Tạo hồ sơ mới
              </button>
            </div>
          </div>

          {/* Phong trào tham gia */}
          <div className="rounded-[14px] border border-[#e2e8f0] overflow-hidden" style={{ background: "white" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #eef2f8" }}>
              <div className="flex items-center gap-2">
                <Megaphone className="size-4 text-[#8a6400]" />
                <h2 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Phong trào đang tham gia</h2>
              </div>
              <button onClick={() => onNavigate("Phong trào thi đua")}
                className="flex items-center gap-1 text-[13px] text-[#8a6400]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                Xem tất cả <ChevronRight className="size-3.5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {MY_PHONG_TRAO.map(pt => (
                <div key={pt.id} className="p-4 rounded-[10px]" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{pt.ten}</h3>
                      <p className="text-[13px] text-[#635647]">{pt.batDau} – {pt.ketThuc}</p>
                    </div>
                    <span className="text-[14px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: pt.color }}>{pt.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pt.progress}%`, background: pt.color }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[13px] text-[#635647]">
                    <span>Tiến độ thực hiện</span>
                    <button className="flex items-center gap-1 text-[#1C5FBE] hover:text-[#1752a8]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                      Ghi nhận kết quả <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Notifications + Quick Actions ─────────── */}
        <div className="space-y-5">

          {/* Thông báo */}
          <div className="rounded-[14px] border border-[#e2e8f0] overflow-hidden" style={{ background: "white" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #eef2f8" }}>
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-[#c8102e]" />
                <h2 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Thông báo</h2>
                {visibleNotif.filter(n => n.type === "warning").length > 0 && (
                  <span className="size-5 rounded-full bg-[#c8102e] text-white text-[13px] flex items-center justify-center"
                    style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}>
                    {visibleNotif.filter(n => n.type === "warning").length}
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 space-y-2">
              {visibleNotif.map(n => (
                <div key={n.id} className="p-3 rounded-[8px] flex gap-3"
                  style={{ background: NOTIF_BG[n.type], border: `1px solid ${NOTIF_COLOR[n.type]}20` }}>
                  <div className="size-1.5 rounded-full mt-1.5 shrink-0" style={{ background: NOTIF_COLOR[n.type] }} />
                  <div className="flex-1">
                    <p className="text-[13px] text-[#0b1426] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>{n.text}</p>
                    <p className="text-[13px] text-[#6b5e47] mt-1" style={{ fontFamily: "JetBrains Mono,monospace" }}>{n.time}</p>
                  </div>
                  <button onClick={() => setDismissed(d => [...d, n.id])} className="text-[#d1d5db] hover:text-[#635647] text-[14px] leading-none shrink-0">✕</button>
                </div>
              ))}
              {visibleNotif.length === 0 && (
                <p className="text-center text-[13px] text-[#6b5e47] py-4" style={{ fontFamily: "var(--font-sans)" }}>Không có thông báo mới</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-[14px] border border-[#e2e8f0] overflow-hidden" style={{ background: "white" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #eef2f8" }}>
              <h2 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Thao tác nhanh</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { icon:Plus,        label:"Tạo hồ sơ mới",        action:() => setWizardOpen(true), color:"#1C5FBE", bg:"#f0f4ff" },
                { icon:FileText,    label:"Theo dõi hồ sơ",        action:() => onNavigate("Đề nghị khen thưởng"), color:"#7c3aed", bg:"#f5f3ff" },
                { icon:Megaphone,   label:"Đăng ký phong trào",    action:() => onNavigate("Phong trào thi đua"), color:"#8a6400", bg:"#fef9ec" },
                { icon:Sparkles,    label:"Hỏi AI Tố Nga",         action:() => onNavigate("Trợ lý AI Tố Nga"), color:"#7c3aed", bg:"#f5f3ff" },
                { icon:Trophy,      label:"Bảng xếp hạng",         action:() => onNavigate("Bảng xếp hạng"), color:"#c8102e", bg:"#fff1f0" },
                { icon:BookOpen,    label:"Trung tâm hỗ trợ",      action:() => onNavigate("Trung tâm hỗ trợ"), color:"#166534", bg:"#f0fdf4" },
              ].map((qa) => {
                const Icon = qa.icon;
                return (
                  <button key={qa.label} onClick={qa.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:shadow-sm transition-all text-left"
                    style={{ background: qa.bg, border: "none" }}>
                    <div className="size-7 rounded-[6px] flex items-center justify-center" style={{ background: `${qa.color}20` }}>
                      <Icon className="size-3.5" style={{ color: qa.color }} />
                    </div>
                    <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{qa.label}</span>
                    <ChevronRight className="size-3.5 text-[#d1d5db] ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legal reminder */}
          <div className="rounded-[14px] p-4" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="size-4 text-[#8a6400]" />
              <span className="text-[13px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Nhắc nhở pháp lý</span>
            </div>
            <p className="text-[13px] text-white/60 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
              Thời hạn nộp hồ sơ TĐKT thường xuyên năm 2026: <strong className="text-white">30/06/2026</strong>. Đảm bảo hồ sơ đầy đủ theo TT 15/2025/TT-BNV.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
