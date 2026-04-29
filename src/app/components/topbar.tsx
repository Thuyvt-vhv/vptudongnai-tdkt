/**
 * topbar.tsx · VPTU Đồng Nai v4 — "Premium Civic" redesign
 * Glassmorphism · Refined breadcrumb · Premium search · Polished actions
 */
import { Bell, ChevronDown, Sparkles, LogOut, Clock,
  Award, FileSignature, AlertTriangle,
  Eye, Settings, Search, Printer, Keyboard,
  LayoutDashboard, PanelLeftOpen, PanelLeftClose, HelpCircle, X } from "lucide-react";
import { useState } from "react";
import type { LoginUser } from "./login-page";
import { AppsMenu } from "./apps-menu";
import { HelpCenterPage } from "./help-center-page";

interface TopbarProps {
  user: LoginUser; active: string; onLogout: () => void;
  onSelectModule: (id: string) => void; onOpenCmd?: () => void;
  onOpenSettings?: () => void; onOpenChangelog?: () => void;
  onOpenShortcuts?: () => void; onOpenPrint?: () => void;
  hideSidebar?: boolean; onToggleSidebar?: () => void;
}

interface Notif {
  id:string; type:"sla"|"approval"|"submit"|"system"|"ai";
  title:string; body:string; time:string; read:boolean; urgent?:boolean;
}

const MOCK_NOTIFS: Record<string, Notif[]> = {
  "lãnh đạo cấp cao": [
    { id:"n1", type:"sla",      title:"SLA khẩn cấp",           body:"NS-2026-0147 quá hạn ký số — cần xử lý ngay",     time:"5 phút trước",  read:false, urgent:true },
    { id:"n2", type:"sla",      title:"SLA sắp trễ",             body:"NS-2026-0142 còn 1 ngày ký số",                   time:"18 phút trước", read:false, urgent:true },
    { id:"n3", type:"approval", title:"8 hồ sơ chờ ký số",      body:"Inbox của bạn có 8 hồ sơ đang chờ chữ ký",        time:"1 giờ trước",   read:false },
    { id:"n4", type:"submit",   title:"Hội đồng kết thúc phiên", body:"HD-2026-03 biên bản đã sẵn sàng ký",              time:"2 giờ trước",   read:true },
  ],
  "hội đồng": [
    { id:"n1", type:"sla",    title:"3 hồ sơ sắp trễ deadline",  body:"Kiểm tra ngay để tránh vi phạm SLA",              time:"10 phút trước", read:false, urgent:true },
    { id:"n2", type:"submit", title:"Hồ sơ mới phân công",        body:"NS-2026-0153 đã được phân công cho bạn",          time:"45 phút trước", read:false },
    { id:"n3", type:"ai",     title:"AI phát hiện trùng lặp",     body:"NS-2026-0152 tương đồng 89% với NS-2025-0234",    time:"1 giờ trước",   read:false },
  ],
  "lãnh đạo đơn vị": [
    { id:"n1", type:"submit",   title:"Hồ sơ chuyển tiếp",    body:"NS-2026-0150 đã được HĐ tiếp nhận",           time:"30 phút trước", read:false },
    { id:"n2", type:"ai",       title:"AI gợi ý CSTĐCS",       body:"3 cán bộ đủ điều kiện đề nghị CSTĐCS 2026",   time:"2 giờ trước",   read:false },
    { id:"n3", type:"approval", title:"Yêu cầu bổ sung",       body:"NS-2026-0145 cần bổ sung minh chứng",         time:"5 giờ trước",   read:true },
  ],
  "cá nhân": [
    { id:"n1", type:"submit", title:"Hồ sơ tiến thêm 1 bước",  body:"NS-2026-0148 đang chờ bỏ phiếu HĐ",          time:"1 giờ trước",  read:false },
    { id:"n2", type:"system", title:"Dự kiến kết quả",          body:"Hồ sơ dự kiến có kết quả ngày 15/05/2026",   time:"1 ngày trước", read:true },
  ],
  "quản trị hệ thống": [
    { id:"n1", type:"sla",    title:"2 vi phạm SLA nghiêm trọng", body:"NS-2026-0147 và 0142 vượt deadline",       time:"5 phút trước",  read:false, urgent:true },
    { id:"n2", type:"system", title:"Cảnh báo bảo mật",            body:"5 lần đăng nhập thất bại từ 203.0.1.55",  time:"2 giờ trước",   read:false, urgent:true },
    { id:"n3", type:"system", title:"Backup hoàn thành",            body:"Backup 2.4GB thành công, S3 Asia-Pacific",time:"7 giờ trước",   read:true },
  ],
};

const NOTIF_ICON: Record<string, typeof Bell> = {
  sla:AlertTriangle, approval:FileSignature, submit:Award,
  system:AlertTriangle, ai:Sparkles
};
const NOTIF_COLOR: Record<string, string> = {
  sla:"#ef4444", approval:"#3b82f6", submit:"#22c55e",
  system:"#f59e0b", ai:"#8b5cf6"
};

/* ── Action icon button ─────────────────────────────────────── */
function ActionBtn({ icon: Icon, onClick, title, badge }: {
  icon: typeof Bell; onClick?: () => void; title?: string; badge?: boolean;
}) {
  return (
    <button onClick={onClick} title={title}
      className="relative size-[34px] rounded-[8px] flex items-center justify-center transition-all"
      style={{ color: "#6b7280" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "#eef2f8";
        (e.currentTarget as HTMLElement).style.color = "#1a1409";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.color = "#6b7280";
      }}>
      <Icon className="size-4" strokeWidth={1.75} />
      {badge && <span className="absolute top-1 right-1 size-[6px] rounded-full bg-blue-500 border border-white" />}
    </button>
  );
}

/* ── Notification Bell ──────────────────────────────────────── */
function NotifBell({ user, onSelectModule }: { user: LoginUser; onSelectModule: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS[user.role] ?? MOCK_NOTIFS["cá nhân"]);
  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="relative size-[34px] rounded-[8px] flex items-center justify-center transition-all"
        style={{ color: "#6b7280" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#eef2f8"; (e.currentTarget as HTMLElement).style.color = "#1a1409"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}>
        <Bell className="size-4" strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-[15px] rounded-full flex items-center justify-center text-[13px] text-white border-2 border-white"
            style={{ background: "#ef4444", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+6px)] w-[380px] rounded-[14px] overflow-hidden z-40"
            style={{ background: "white", border: "1px solid #e8ecf3", boxShadow: "0 24px 48px -12px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.05)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid #f1f5f9", background: "#ffffff" }}>
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-[#6b7280]" strokeWidth={1.75} />
                <span className="text-[13px] text-[#0f172a]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Thông báo</span>
                {unread > 0 && (
                  <span className="size-5 rounded-full flex items-center justify-center text-[13px] text-white"
                    style={{ background: "#ef4444", fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}>
                    {unread}
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))}
                  className="text-[13px] px-2.5 py-1 rounded-[6px] transition-colors hover:bg-blue-50"
                  style={{ color: "#3b82f6", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                  Đọc tất cả
                </button>
              )}
            </div>
            {/* Items */}
            <div className="max-h-[340px] overflow-y-auto">
              {notifs.map((n, i) => {
                const Icon  = NOTIF_ICON[n.type];
                const color = NOTIF_COLOR[n.type];
                return (
                  <button key={n.id} onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                    style={{ background: n.urgent && !n.read ? "#fffbf0" : n.read ? "white" : "#ffffff", borderBottom: i < notifs.length - 1 ? "1px solid #ffffff" : "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#ffffff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.urgent && !n.read ? "#fffbf0" : n.read ? "white" : "#ffffff"; }}>
                    <div className="size-8 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                      <Icon className="size-4" strokeWidth={1.75} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] truncate"
                          style={{ color: "#0f172a", fontFamily: "var(--font-sans)", fontWeight: n.read ? 400 : 600 }}>
                          {n.title}
                        </span>
                        {!n.read && <span className="size-1.5 rounded-full shrink-0" style={{ background: "#3b82f6" }} />}
                        {n.urgent && !n.read && (
                          <span className="text-[13px] px-1.5 py-px rounded-full shrink-0"
                            style={{ background: "#fee2e2", color: "#dc2626", fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}>
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: "#64748b" }}>{n.body}</p>
                      <span className="text-[13px] mt-1 block" style={{ color: "#4f5d6e", fontFamily: "var(--font-sans)" }}>{n.time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Footer */}
            <div className="px-4 py-2.5 flex justify-between items-center" style={{ borderTop: "1px solid #f1f5f9", background: "#ffffff" }}>
              <span className="text-[13px]" style={{ color: "#4f5d6e", fontFamily: "var(--font-sans)" }}>Cập nhật vừa xong</span>
              <button onClick={() => { setOpen(false); onSelectModule("Thông báo"); }}
                className="flex items-center gap-1.5 text-[13px] px-2.5 py-1 rounded-[6px] transition-colors hover:bg-blue-50"
                style={{ color: "#3b82f6", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                <Eye className="size-3.5" strokeWidth={1.75} /> Xem tất cả
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══ TOPBAR ══════════════════════════════════════════════════ */
export function Topbar({ user, active, onLogout, onSelectModule, onOpenCmd, onOpenSettings, onOpenChangelog, onOpenShortcuts, onOpenPrint, hideSidebar, onToggleSidebar }: TopbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
    <header className="shrink-0 sticky top-0 z-[70]" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>

      {/* ── Đỏ son accent top bar ───────────────────────────── */}
      <div className="h-[3px] w-full" style={{
        background: "linear-gradient(90deg, #c8102e 0%, #1C5FBE 45%, #8a6400 100%)",
      }} />

      <div className="h-[49px] flex items-center px-5 gap-3"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.03)",
        }}>


        {/* ── Sidebar toggle ─────────────────────────────────────── */}
        <button onClick={onToggleSidebar} title={hideSidebar ? "Hiện sidebar" : "Ẩn sidebar"}
          className="size-[34px] rounded-[8px] flex items-center justify-center transition-all shrink-0"
          style={{ color: "#6b7280" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#eef2f8"; (e.currentTarget as HTMLElement).style.color = "#1a1409"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}>
          {hideSidebar
            ? <PanelLeftOpen className="size-4" strokeWidth={1.75} />
            : <PanelLeftClose className="size-4" strokeWidth={1.75} />}
        </button>

        {/* ── Search ─────────────────────────────────────────────── */}
        <div className="w-[340px] mr-auto">
          <button onClick={onOpenCmd}
            className="w-full h-[34px] flex items-center gap-2.5 px-3 rounded-[9px] text-left transition-all"
            style={{ background: "#f4f7fb", border: "1px solid #e2e8f0" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c4a96a"; (e.currentTarget as HTMLElement).style.background = "#eef2f8"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.background = "#f4f7fb"; }}>
            <Search className="size-3.5 shrink-0" style={{ color: "#74654a" }} strokeWidth={2} />
            <span className="flex-1 text-[13px]" style={{ color: "#74654a", fontFamily: "var(--font-sans)" }}>
              Tìm hồ sơ, cán bộ, quyết định…
            </span>
            <div className="flex items-center gap-0.5 shrink-0">
              <kbd className="h-[18px] px-1.5 text-[13px] rounded-[4px]"
                style={{ background: "white", color: "#74654a", border: "1px solid #ddd5c0", fontFamily: "JetBrains Mono,monospace", fontWeight: 700, boxShadow: "0 1px 0 #ddd5c0" }}>⌘K</kbd>
            </div>
          </button>
        </div>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 shrink-0">

          {/* AI Button — navy + gold brand */}
          <button onClick={() => onSelectModule("Trợ lý AI")}
            className="flex items-center gap-1.5 h-[30px] px-3 mr-1 rounded-[8px] text-[11.5px] text-white transition-all hover:opacity-95 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #0f2244 0%, #1C5FBE 70%, #2470d8 100%)",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(28,95,190,0.4), 0 1px 3px rgba(28,95,190,0.2)",
              border: "1px solid rgba(212,168,75,0.25)",
            }}>
            <Sparkles className="size-3" style={{ color: "#8a6400" }} />
            <span>Trợ lý AI</span>
          </button>

          <ActionBtn icon={Printer}  onClick={onOpenPrint}      title="In tài liệu" />
          <ActionBtn icon={Keyboard} onClick={onOpenShortcuts}  title="Phím tắt" />

          <AppsMenu active={active} onSelect={onSelectModule} />
          <button onClick={() => setShowHelp(v => !v)} title="Trung tâm hỗ trợ"
            className="relative size-[34px] rounded-[8px] flex items-center justify-center transition-all"
            style={{ background: showHelp ? "#ddeafc" : "transparent", color: showHelp ? "#1C5FBE" : "#6b7280" }}
            onMouseEnter={e => { if (!showHelp) { (e.currentTarget as HTMLElement).style.background = "#eef2f8"; (e.currentTarget as HTMLElement).style.color = "#1a1409"; } }}
            onMouseLeave={e => { if (!showHelp) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6b7280"; } }}>
            <HelpCircle className="size-4" strokeWidth={1.75} />
          </button>
          <NotifBell user={user} onSelectModule={onSelectModule} />

          {/* User menu */}
          <div className="relative">
            <button onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-[9px] transition-all"
              style={{ border: showMenu ? "1px solid #e2e8f0" : "1px solid transparent" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f4f7fb"; (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = showMenu ? "#e2e8f0" : "transparent"; }}>
              {/* Avatar */}
              <div className="relative">
                <div className="size-7 rounded-full flex items-center justify-center text-[13px] text-white shrink-0"
                  style={{ background: `linear-gradient(135deg,${user.avatarFrom},${user.avatarTo})`, fontFamily: "var(--font-sans)", fontWeight: 700, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
                  {user.initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-white"
                  style={{ background: "#22c55e" }} />
              </div>
              {/* Name */}
              <div className="hidden sm:block leading-tight">
                <div className="text-[13px]" style={{ color: "#1a1409", fontFamily: "var(--font-sans)", fontWeight: 600, lineHeight: 1.2 }}>
                  {user.name.split(" ").slice(-1)[0]}
                </div>
                <div className="text-[13px]" style={{ color: "#74654a", fontFamily: "var(--font-sans)", lineHeight: 1.2 }}>
                  {user.roleLabel}
                </div>
              </div>
              <ChevronDown className={`size-3 transition-transform duration-200 ${showMenu ? "rotate-180" : ""}`}
                style={{ color: "#74654a" }} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-[65]" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-[calc(100%+6px)] w-[264px] rounded-[14px] overflow-hidden z-[66]"
                  style={{ background: "white", border: "1px solid #e2ddd3", boxShadow: "0 20px 48px -12px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.06)" }}>

                  {/* User header — navy gradient */}
                  <div className="px-4 py-4" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2244 60%, #1C5FBE 100%)", borderBottom: "2px solid rgba(212,168,75,0.3)" }}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="size-10 rounded-full flex items-center justify-center text-[13px] text-white shrink-0"
                          style={{ background: `linear-gradient(135deg,${user.avatarFrom},${user.avatarTo})`, fontFamily: "var(--font-sans)", fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.3)", border: "2px solid rgba(212,168,75,0.4)" }}>
                          {user.initials}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#0f2244]"
                          style={{ background: "#22c55e" }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] truncate" style={{ color: "white", fontFamily: "var(--font-sans)", fontWeight: 700 }}>{user.name}</p>
                        <p className="text-[13px] truncate mt-px" style={{ color: "rgba(186,210,255,0.7)", fontFamily: "var(--font-sans)" }}>{user.unit}</p>
                        <span className="inline-flex items-center mt-1.5 text-[13px] px-2 py-px rounded-full"
                          style={{ background: "rgba(212,168,75,0.2)", color: "rgba(212,168,75,0.9)", fontFamily: "var(--font-sans)", fontWeight: 700, border: "1px solid rgba(212,168,75,0.3)" }}>
                          {user.roleLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5 space-y-px">
                    <MenuRow icon={Settings}  label="Cài đặt tài khoản"    sub="Hồ sơ, bảo mật, thông báo"    onClick={() => { setShowMenu(false); onOpenSettings?.(); }} />
                    <MenuRow icon={Clock}     label="Thời gian hoạt động"   sub="Lịch sử phiên làm việc"        onClick={() => { setShowMenu(false); onSelectModule("Thời gian hoạt động"); }} />
                    <div className="h-px my-1" style={{ background: "#eef2f8" }} />
                    <MenuRow icon={LogOut}    label="Đăng xuất"             sub=""                              onClick={() => { setShowMenu(false); onLogout(); }} danger />
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 flex items-center justify-end" style={{ borderTop: "1px solid #eef2f8", background: "#ffffff" }}>
                    <span className="text-[13px] flex items-center gap-1" style={{ color: "#22c55e", fontFamily: "var(--font-sans)" }}>
                      <span className="size-1.5 rounded-full inline-block bg-green-400 animate-pulse" />
                      Hệ thống hoạt động
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* ── Help full-screen overlay ────────────────────────────── */}
    {showHelp && (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "white" }}>
        {/* Overlay topbar */}
        <div className="shrink-0 h-[52px] flex items-center justify-between px-6"
          style={{
            background: "white",
            borderBottom: "1px solid #e8ecf3",
            boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
          }}>
          {/* Left: brand + title */}
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-[9px] flex items-center justify-center shrink-0"
              style={{ background: "#ddeafc" }}>
              <HelpCircle className="size-4" style={{ color: "#1C5FBE" }} strokeWidth={1.75} />
            </div>
            <div>
              <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", fontWeight: 700, color: "#0b1426", letterSpacing: "-0.01em" }}>
                Trung tâm Hỗ trợ
              </span>
              <span className="ml-2 text-[13px]" style={{ color: "#8a9ab5", fontFamily: "var(--font-sans)" }}>
                VPTU Đồng Nai
              </span>
            </div>
          </div>

          {/* Right: close */}
          <button onClick={() => setShowHelp(false)}
            className="flex items-center gap-2 h-9 px-4 rounded-[9px] text-[13px] transition-all"
            style={{ color: "#4f5d6e", fontFamily: "var(--font-sans)", fontWeight: 600, background: "#f4f7fb", border: "1px solid #e2e8f0" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#eef2f8"; (e.currentTarget as HTMLElement).style.borderColor = "#d0d7e3"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f4f7fb"; (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}>
            <X className="size-3.5" strokeWidth={2} />
            Đóng
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto" style={{ background: "#f8fafc" }}>
          <HelpCenterPage user={user} />
        </div>
      </div>
    )}
    </>
  );
}

function MenuRow({ icon: Icon, label, sub, onClick, danger }: {
  icon: typeof Settings; label: string; sub: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[9px] text-left transition-all"
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = danger ? "#fff1f2" : "#ffffff"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      <div className="size-7 rounded-[7px] flex items-center justify-center shrink-0"
        style={{ background: danger ? "#fee2e2" : "#f1f5f9" }}>
        <Icon className="size-4" strokeWidth={1.75} style={{ color: danger ? "#ef4444" : "#64748b" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px]" style={{ color: danger ? "#ef4444" : "#1e293b", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          {label}
        </div>
        {sub && <div className="text-[13px] mt-px" style={{ color: "#4f5d6e", fontFamily: "var(--font-sans)" }}>{sub}</div>}
      </div>
    </button>
  );
}