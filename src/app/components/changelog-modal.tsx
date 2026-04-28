import { useState } from "react";
import {
  X, Sparkles, Zap, Shield, BarChart3, Bell, Clock,
  LayoutDashboard, Search, Settings, Gift, Trophy,
  ChevronRight, Star, CheckCircle2, ArrowRight,
  Command, Fingerprint, Globe, Activity,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
interface ChangeItem {
  type: "new" | "improved" | "fix" | "security";
  text: string;
}
interface Version {
  version: string;
  date: string;
  title: string;
  highlight: string;
  icon: typeof Sparkles;
  color: string;
  changes: ChangeItem[];
  isLatest?: boolean;
}

const VERSIONS: Version[] = [
  {
    version: "2.5.0",
    date: "24/04/2026",
    title: "Command Center & Personalization",
    highlight: "Command Palette toàn cục, Cài đặt tài khoản đầy đủ, Onboarding Checklist theo vai trò và Chi tiết Hồ sơ Drawer.",
    icon: Command,
    color: "#1C5FBE",
    isLatest: true,
    changes: [
      { type:"new",      text:"⌘K Command Palette — tìm kiếm toàn cục với fuzzy search tiếng Việt, nhóm kết quả theo loại" },
      { type:"new",      text:"Cài đặt tài khoản — 5 tab: Hồ sơ, Bảo mật (MFA, phiên đăng nhập), Thông báo, Giao diện, Dữ liệu" },
      { type:"new",      text:"Onboarding Checklist — hướng dẫn khởi đầu theo từng vai trò với hệ thống XP tích lũy" },
      { type:"new",      text:"Hồ sơ Detail Drawer — xem đầy đủ workflow stepper, AI phân tích, lịch sử, tài liệu, bình luận" },
      { type:"new",      text:"Changelog & Keyboard Shortcuts Overlay (phím ?)" },
      { type:"improved", text:"Topbar: click Search bar mở Command Palette, menu người dùng thêm Cài đặt và Thời gian" },
      { type:"improved", text:"Sidebar: thêm Cài đặt tài khoản vào nhóm Hệ thống cho tất cả vai trò" },
    ],
  },
  {
    version: "2.4.0",
    date: "18/04/2026",
    title: "Notification Hub & Activity Timeline",
    highlight: "Trung tâm Thông báo phân loại 6 loại, Timeline hoạt động cá nhân với session tracking và weekly heatmap.",
    icon: Bell,
    color: "#b45309",
    changes: [
      { type:"new",      text:"Trang Thông báo — 6 loại phân loại, action link điều hướng trực tiếp tới module liên quan" },
      { type:"new",      text:"Thời gian hoạt động — session timeline 7 ngày, weekly heatmap, phân tích giờ cao điểm" },
      { type:"new",      text:"Dashboard v2 — Deadline Countdown widget, KPI cards navigable, Leaderboard live" },
      { type:"improved", text:"Topbar notification bell: filter theo loại, mark all as read, badge count theo role" },
      { type:"fix",      text:"Sửa lỗi import Flame (lucide-react) trong Dashboard gây crash" },
    ],
  },
  {
    version: "2.3.0",
    date: "10/04/2026",
    title: "AI Analytics & SLA Enforcement",
    highlight: "Phân tích AI thi đua toàn diện, SLA Monitor với cảnh báo realtime, Audit Log bảo mật.",
    icon: Sparkles,
    color: "#7c3aed",
    changes: [
      { type:"new",      text:"Phân tích thi đua — biểu đồ AI-powered: xu hướng, phân bổ đơn vị, KPI tổng hợp" },
      { type:"new",      text:"SLA Monitor — bảng theo dõi vi phạm, cảnh báo email/SMS, escalation path" },
      { type:"new",      text:"Audit Log — nhật ký an ninh đầy đủ theo NIST CSF, xuất CSV/PDF" },
      { type:"new",      text:"Trợ lý AI Tố Nga v2 — chat theo context hồ sơ, gợi ý tự động điều khoản pháp lý" },
      { type:"security", text:"Mã hóa AES-256 cho tài liệu đính kèm" },
    ],
  },
  {
    version: "2.2.0",
    date: "28/03/2026",
    title: "Digital Signature & Council",
    highlight: "Ký số tích hợp CA, Hội đồng xét duyệt với bỏ phiếu realtime, Quyết định tự động.",
    icon: Shield,
    color: "#166534",
    changes: [
      { type:"new",      text:"Ký số & Phê duyệt — luồng ký CA tích hợp, xác thực token USB, chữ ký điện tử có giá trị pháp lý" },
      { type:"new",      text:"Hội đồng xét duyệt — phiên họp số, bỏ phiếu realtime, biên bản tự động" },
      { type:"new",      text:"Quyết định khen thưởng — tra cứu, xuất PDF chuẩn Nhà nước, QR code xác thực" },
      { type:"improved", text:"Chấm điểm — thêm bộ tiêu chí tùy chỉnh theo đơn vị, lịch sử điểm" },
    ],
  },
  {
    version: "2.0.0",
    date: "01/03/2026",
    title: "VPTU Đồng Nai — Phát hành chính thức",
    highlight: "Ra mắt hệ thống TĐKT thế hệ mới, thay thế quy trình giấy tờ truyền thống.",
    icon: Trophy,
    color: "#8a6400",
    changes: [
      { type:"new",      text:"5 vai trò: user, manager, council, leader, admin với phân quyền granular" },
      { type:"new",      text:"Phong trào thi đua — quản lý phát động, đăng ký, đánh giá kết quả" },
      { type:"new",      text:"Đề nghị khen thưởng — workflow số, AI eligibility check tự động" },
      { type:"new",      text:"Bảng xếp hạng realtime — phong trào, cá nhân, đơn vị" },
      { type:"new",      text:"Kho huân – huy chương — danh mục 120 hình thức khen thưởng theo Luật TĐKT 2022" },
      { type:"new",      text:"Mẫu biểu TT 15/2025/TT-BNV — 23 biểu mẫu chính thức" },
    ],
  },
];

const TYPE_CFG = {
  new:      { label:"Mới",      bg:"#dcfce7", color:"#166534" },
  improved: { label:"Cải tiến", bg:"#dbeafe", color:"#1C5FBE" },
  fix:      { label:"Sửa lỗi", bg:"#fef9ec", color:"#b45309" },
  security: { label:"Bảo mật", bg:"#fce7f3", color:"#9d174d" },
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export function ChangelogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState("2.5.0");

  if (!open) return null;

  const ver = VERSIONS.find(v => v.version === selected) ?? VERSIONS[0];
  const Icon = ver.icon;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background:"rgba(11,20,38,0.5)", backdropFilter:"blur(4px)" }}/>

      <div className="relative flex overflow-hidden rounded-[16px] shadow-2xl border border-[#e2e8f0]"
        style={{ width:860, maxWidth:"95vw", maxHeight:"85vh", background:"white" }}
        onClick={e=>e.stopPropagation()}>

        {/* ── Left: version list ── */}
        <div className="w-[220px] shrink-0 flex flex-col border-r border-[#e2e8f0]" style={{ background:"#f8fafc" }}>
          <div className="px-5 py-4 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-[#8a6400]"/>
              <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>Có gì mới</span>
            </div>
            <p className="text-[13px] text-[#635647] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>VPTU Đồng Nai Changelog</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {VERSIONS.map(v => {
              const VIcon = v.icon;
              const isSelected = selected === v.version;
              return (
                <button key={v.version} onClick={()=>setSelected(v.version)}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-[8px] text-left transition-all"
                  style={{ background: isSelected ? "white" : "transparent", boxShadow: isSelected ? "0 1px 6px rgba(0,0,0,0.06)" : "none" }}>
                  <div className="size-7 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background:`${v.color}18` }}>
                    <VIcon className="size-3.5" style={{ color:v.color }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] text-[#0b1426]"
                        style={{ fontFamily:"JetBrains Mono,monospace", fontWeight:isSelected?700:500 }}>
                        v{v.version}
                      </span>
                      {v.isLatest && (
                        <span className="text-[13px] px-1.5 py-0.5 rounded-full text-white"
                          style={{ background:"#1C5FBE", fontFamily: "var(--font-sans)", fontWeight:700 }}>
                          MỚI
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{v.date}</div>
                  </div>
                  {isSelected && <ChevronRight className="size-3.5 text-[#1C5FBE] shrink-0 mt-1"/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: detail ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-8 py-5 border-b border-[#e2e8f0] flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-[10px] flex items-center justify-center"
                style={{ background:`${ver.color}15` }}>
                <Icon className="size-6" style={{ color:ver.color }}/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
                    {ver.title}
                  </h2>
                  {ver.isLatest && (
                    <span className="animate-pulse size-2.5 rounded-full" style={{ background:"#1C5FBE" }}/>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-[13px] text-[#5a5040]" style={{ fontFamily:"JetBrains Mono,monospace" }}>v{ver.version}</code>
                  <span className="text-[#6b5e47]">·</span>
                  <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Phát hành {ver.date}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-[#f4f7fb] transition-colors">
              <X className="size-4 text-[#635647]"/>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Highlight */}
            <div className="rounded-[10px] p-4 mb-5" style={{ background:`${ver.color}0d`, border:`1px solid ${ver.color}30` }}>
              <p className="text-[13px] leading-relaxed" style={{ color:ver.color, fontFamily: "var(--font-sans)", fontWeight:500 }}>
                {ver.highlight}
              </p>
            </div>

            {/* Changes */}
            <h3 className="text-[13px] uppercase tracking-wider text-[#635647] mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
              Chi tiết thay đổi ({ver.changes.length})
            </h3>
            <div className="space-y-2">
              {ver.changes.map((c,i) => {
                const cfg = TYPE_CFG[c.type];
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-[8px]"
                    style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                    <span className="text-[13px] px-2 py-1 rounded shrink-0 mt-0.5"
                      style={{ background:cfg.bg, color:cfg.color, fontFamily: "var(--font-sans)", fontWeight:700 }}>
                      {cfg.label}
                    </span>
                    <span className="text-[13px] text-[#0b1426] leading-relaxed flex-1" style={{ fontFamily: "var(--font-sans)" }}>
                      {c.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-[#e2e8f0] flex items-center justify-between" style={{ background:"#f8fafc" }}>
            <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              VPTU Đồng Nai · Thi đua Khen thưởng · Tỉnh ủy Đồng Nai
            </div>
            <button onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] text-white transition-colors"
              style={{ background:"linear-gradient(135deg,#1C5FBE,#1752a8)", fontFamily: "var(--font-sans)", fontWeight:600 }}>
              Đóng <X className="size-3.5"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}