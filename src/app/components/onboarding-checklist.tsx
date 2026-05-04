import { useState } from "react";
import {
  CheckCircle2, Circle, ChevronRight, X, Sparkles, Trophy,
  Users, FileText, Award, BarChart2, Zap, BookOpen,
  Star, ArrowRight, Gift, Crown,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface CheckItem {
  id: string;
  icon: typeof Circle;
  label: string;
  desc: string;
  target: string;
  xp: number;
}

/* ═══════════════════════════════════════════════════════════════
   DATA
═════════════════════════════════════════════���═════════════════ */
const TASKS_BY_ROLE: Record<string, CheckItem[]> = {
  "cá nhân": [
    { id:"t1", icon:FileText,  label:"Tạo hồ sơ đề nghị đầu tiên",   desc:"Gửi đề nghị khen thưởng cho bản thân hoặc đồng nghiệp",         target:"Đề nghị khen thưởng", xp:50 },
    { id:"t2", icon:Trophy,    label:"Xem bảng xếp hạng thi đua",     desc:"Theo dõi thứ hạng của bạn trong phong trào",                    target:"Bảng xếp hạng",       xp:10 },
    { id:"t3", icon:Sparkles,  label:"Hỏi Trợ lý AI",          desc:"Đặt câu hỏi về điều kiện khen thưởng",                          target:"Trợ lý AI",    xp:20 },
    { id:"t4", icon:BookOpen,  label:"Xem mẫu biểu TT 15/2025",       desc:"Tải về các biểu mẫu chính thức",                                target:"Mẫu biểu TT 15/2025", xp:10 },
    { id:"t5", icon:Award,     label:"Tra cứu lịch sử khen thưởng",   desc:"Xem các khen thưởng đã nhận trong quá khứ",                     target:"Lịch sử khen thưởng", xp:10 },
  ],
  "lãnh đạo đơn vị": [
    { id:"t1", icon:Users,     label:"Kiểm tra hồ sơ cán bộ đơn vị",  desc:"Xem AI gợi ý cán bộ đủ điều kiện khen thưởng",                  target:"Hồ sơ cán bộ",        xp:40 },
    { id:"t2", icon:FileText,  label:"Tạo hồ sơ khen thưởng đầu tiên",desc:"Đề nghị khen thưởng cho cán bộ đơn vị",                         target:"Đề nghị khen thưởng", xp:50 },
    { id:"t3", icon:BarChart2, label:"Xem Phân tích thi đua đơn vị",  desc:"Theo dõi hiệu quả phong trào thi đua",                          target:"Phân tích thi đua",   xp:20 },
    { id:"t4", icon:Trophy,    label:"Theo dõi bảng xếp hạng",        desc:"So sánh đơn vị với các đơn vị khác",                            target:"Bảng xếp hạng",       xp:10 },
    { id:"t5", icon:Sparkles,  label:"Dùng AI Eligibility Check",     desc:"AI kiểm tra điều kiện cán bộ theo Luật TĐKT",                    target:"Hồ sơ cán bộ",        xp:30 },
  ],
  "hội đồng": [
    { id:"t1", icon:Award,     label:"Thẩm định hồ sơ đầu tiên",      desc:"Chấm điểm và đánh giá hồ sơ được phân công",                    target:"Chấm điểm & Bình xét",xp:50 },
    { id:"t2", icon:Users,     label:"Tham gia phiên Hội đồng",        desc:"Bỏ phiếu trong phiên xét duyệt",                                target:"Hội đồng xét duyệt",  xp:40 },
    { id:"t3", icon:Sparkles,  label:"Kiểm tra AI duplicate detection",desc:"AI phát hiện hồ sơ trùng lặp",                                  target:"Đề nghị khen thưởng", xp:20 },
    { id:"t4", icon:BarChart2, label:"Xem Phân tích thi đua",         desc:"Thống kê tổng quan phong trào",                                  target:"Phân tích thi đua",   xp:10 },
    { id:"t5", icon:FileText,  label:"Xuất báo cáo tháng",            desc:"Tạo báo cáo tổng hợp TĐKT",                                     target:"Báo cáo tổng hợp",    xp:20 },
  ],
  "lãnh đạo cấp cao": [
    { id:"t1", icon:Award,     label:"Ký số hồ sơ đầu tiên",          desc:"Phê duyệt quyết định khen thưởng bằng chữ ký số CA",             target:"Ký số & Phê duyệt",   xp:50 },
    { id:"t2", icon:Trophy,    label:"Xem Bảng xếp hạng toàn tỉnh",   desc:"Theo dõi kết quả thi đua tổng hợp",                             target:"Bảng xếp hạng",       xp:10 },
    { id:"t3", icon:BarChart2, label:"Xem Phân tích AI thi đua",      desc:"Báo cáo thông minh từ Trợ lý AI",                                target:"Phân tích thi đua",   xp:30 },
    { id:"t4", icon:FileText,  label:"Phê duyệt phong trào mới",      desc:"Phê duyệt phát động phong trào thi đua",                        target:"Phong trào thi đua",  xp:30 },
    { id:"t5", icon:Sparkles,  label:"Hỏi Trợ lý AI",          desc:"Tư vấn chính sách khen thưởng",                                 target:"Trợ lý AI",    xp:20 },
  ],
  "quản trị hệ thống": [
    { id:"t1", icon:Users,     label:"Phân quyền tài khoản đầu tiên", desc:"Tạo và phân quyền người dùng mới",                               target:"Phân quyền",          xp:40 },
    { id:"t2", icon:Zap,       label:"Cấu hình SLA cho đơn vị",       desc:"Thiết lập thời hạn xử lý theo nghiệp vụ",                       target:"Cấu hình đơn vị",     xp:50 },
    { id:"t3", icon:BarChart2, label:"Xem Audit Log hệ thống",        desc:"Kiểm tra nhật ký an toàn thông tin",                            target:"Audit Log",           xp:20 },
    { id:"t4", icon:Award,     label:"Kiểm tra SLA Monitor",          desc:"Theo dõi vi phạm SLA toàn hệ thống",                            target:"SLA Monitor",         xp:20 },
    { id:"t5", icon:Sparkles,  label:"Cấu hình Trợ lý AI",            desc:"Tuỳ chỉnh ngưỡng gợi ý và phát hiện trùng lặp",                 target:"Hệ thống",            xp:30 },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   FLOATING BADGE
═══════════════════════════════════════════════════════════════ */
export function OnboardingBadge({
  user,
  onOpen,
  completedIds,
}: {
  user: LoginUser;
  onOpen: () => void;
  completedIds: string[];
}) {
  const tasks = TASKS_BY_ROLE[user.role] ?? TASKS_BY_ROLE["cá nhân"];
  const done = tasks.filter(t => completedIds.includes(t.id)).length;
  const pct = Math.round((done / tasks.length) * 100);

  if (pct === 100) return null;

  return (
    <button onClick={onOpen}
      className="flex items-center gap-2 px-3 py-2 rounded-[10px] border shadow-md hover:shadow-lg transition-all"
      style={{ background: "white", borderColor: "#e2e8f0" }}>
      <div className="relative size-8">
        <svg className="size-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="13" fill="none" stroke="#eef2f8" strokeWidth="3" />
          <circle cx="16" cy="16" r="13" fill="none" stroke="#1C5FBE" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 13}`}
            strokeDashoffset={`${2 * Math.PI * 13 * (1 - pct / 100)}`}
            strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[13px] text-[#1C5FBE]"
          style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>{pct}%</span>
      </div>
      <div className="text-left">
        <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Bắt đầu nhanh</div>
        <div className="text-[13px] text-slate-700">{done}/{tasks.length} hoàn thành</div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHECKLIST PANEL (slide-out from bottom-right)
═══════════════════════════════════════════════════════════════ */
export function OnboardingPanel({
  user,
  open,
  onClose,
  onNavigate,
  completedIds,
  onComplete,
}: {
  user: LoginUser;
  open: boolean;
  onClose: () => void;
  onNavigate: (m: string) => void;
  completedIds: string[];
  onComplete: (id: string) => void;
}) {
  const tasks = TASKS_BY_ROLE[user.role] ?? TASKS_BY_ROLE["cá nhân"];
  const done = tasks.filter(t => completedIds.includes(t.id)).length;
  const pct = Math.round((done / tasks.length) * 100);
  const totalXP = tasks.filter(t => completedIds.includes(t.id)).reduce((s, t) => s + t.xp, 0);
  const maxXP = tasks.reduce((s, t) => s + t.xp, 0);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      <div className="fixed bottom-20 right-6 z-[91] w-[380px] rounded-[16px] border shadow-2xl overflow-hidden"
        style={{ background: "white", borderColor: "#e2e8f0" }}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e2e8f0]" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift className="size-5 text-[#8a6400]" />
              <span className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                Bắt đầu với VPTU Đồng Nai
              </span>
            </div>
            <button onClick={onClose} className="size-7 rounded-full flex items-center justify-center hover:bg-white/10">
              <X className="size-4 text-white/60" />
            </button>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg,#8a6400,#ffd27a)" }} />
            </div>
            <span className="text-[13px] text-[#ffd27a] shrink-0" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
              {done}/{tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="size-3.5 text-[#8a6400]" />
            <span className="text-[13px] text-white/70" style={{ fontFamily: "var(--font-sans)" }}>
              {totalXP} / {maxXP} XP tích lũy
            </span>
          </div>
        </div>

        {/* Tasks */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-[#f4f7fb]">
          {tasks.map(task => {
            const isCompleted = completedIds.includes(task.id);
            const Icon = task.icon;
            return (
              <div key={task.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-[#ffffff] transition-colors cursor-pointer group"
                onClick={() => {
                  if (!isCompleted) onComplete(task.id);
                  onNavigate(task.target);
                  onClose();
                }}>
                <div className="mt-0.5 shrink-0">
                  {isCompleted
                    ? <CheckCircle2 className="size-5 text-[#166534]" />
                    : <Circle className="size-5 text-slate-400 group-hover:text-[#1C5FBE] transition-colors" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[13px] ${isCompleted ? "text-slate-700 line-through" : "text-slate-900"}`}
                      style={{ fontFamily: "var(--font-sans)", fontWeight: isCompleted ? 400 : 600 }}>
                      {task.label}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                    {task.desc}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="text-[13px] px-1.5 py-0.5 rounded"
                    style={{ background: isCompleted ? "#dcfce7" : "#ffffff", color: isCompleted ? "#166534" : "#8a6400", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
                    +{task.xp}xp
                  </span>
                  {!isCompleted && <ChevronRight className="size-3.5 text-slate-400 group-hover:text-[#1C5FBE] transition-colors" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {pct === 100 ? (
          <div className="px-5 py-4 flex items-center gap-3" style={{ background: "#dcfce7", borderTop: "1px solid #86efac" }}>
            <Crown className="size-6 text-[#8a6400]" />
            <div>
              <div className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                Xuất sắc! Bạn đã hoàn thành tất cả!
              </div>
              <div className="text-[13px] text-[#166534]/70">Đạt huy hiệu "Người mới xuất sắc" · {maxXP} XP</div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-3 border-t border-[#eef2f8] flex items-center justify-between" style={{ background: "#ffffff" }}>
            <span className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
              {tasks.length - done} nhiệm vụ còn lại
            </span>
            <button onClick={onClose} className="text-[13px] text-slate-700 hover:text-slate-900 transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}>
              Ẩn tạm thời
            </button>
          </div>
        )}
      </div>
    </>
  );
}