/**
 * sidebar.tsx · VPTU Đồng Nai v4 — "Premium Civic" redesign
 * Navy · Đỏ son · Vàng huân chương — chuẩn Thi đua Khen thưởng
 */
import { useState } from "react";
import {
  LayoutDashboard, Award, Trophy, FileSignature, Users,
  ClipboardList, BarChart3, ScrollText, Sparkles, Settings,
  ShieldCheck, Archive, Megaphone, Gavel, Building2,
  Crown, User, Lock,
  ChevronRight, TrendingUp, Map, BookOpen,
  Activity, Server, Clock,
  FileText, Bell, Calendar, GitCompare,
  Kanban, HelpCircle, Radio,
  ChevronDown, LogOut, Zap, GitMerge,
} from "lucide-react";
import type { LoginUser } from "./login-page";

type RoleId = LoginUser["role"];

/* ═══ Role Meta ═══════════════════════════════════════════════ */
const ROLE_META: Record<RoleId, {
  label: string; color: string; bg: string;
  icon: typeof User; hint: string; hintIcon: string;
  badgeBg: string; accentColor: string;
}> = {
  "quản trị hệ thống": { label:"Quản trị",       color:"#334155", bg:"#f1f5f9", icon:Settings,  badgeBg:"#e2e8f0", accentColor:"#64748b", hint:"8 sự kiện bảo mật cần xem xét",        hintIcon:"🔐" },
  "lãnh đạo cấp cao":  { label:"Lãnh đạo",       color:"#92400e", bg:"#fef3c7", icon:Crown,      badgeBg:"#fde68a", accentColor:"#b45309", hint:"2 quyết định đang chờ ký số",           hintIcon:"✍️" },
  "hội đồng":          { label:"Hội đồng",       color:"#4c1d95", bg:"#f5f3ff", icon:Gavel,      badgeBg:"#ede9fe", accentColor:"#7c3aed", hint:"3 hồ sơ đủ điều kiện Huân chương",      hintIcon:"🏅" },
  "lãnh đạo đơn vị":   { label:"Lãnh đạo đơn vị",color:"#14532d", bg:"#f0fdf4", icon:Users,      badgeBg:"#bbf7d0", accentColor:"#16a34a", hint:"3 cán bộ đủ điều kiện CSTĐCS",         hintIcon:"⭐" },
  "cá nhân":           { label:"Cá nhân",        color:"#1e3a8a", bg:"#eff6ff", icon:User,        badgeBg:"#bfdbfe", accentColor:"#3b82f6", hint:"Hồ sơ NS-2026-0148 đang chờ bỏ phiếu", hintIcon:"📋" },
};

/* ═══ Nav Config ══════════════════════════════════════════════ */
interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  badge: string | null;
  roles: RoleId[] | "all";
  badgeByRole?: Partial<Record<RoleId, string>>;
}
interface NavGroup { group: string; items: NavItem[]; }

const NAV_CONFIG: NavGroup[] = [
  {
    group: "Tổng quan",
    items: [
      { icon: LayoutDashboard, label: "Bảng điều hành",    badge: null,   roles: "all" },
      { icon: Trophy,          label: "Bảng xếp hạng",     badge: null,   roles: "all" },
      { icon: BarChart3,       label: "Phân tích thi đua",  badge: "AI",   roles: ["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"] },
    ],
  },
  {
    group: "Nghiệp vụ",
    items: [
      { icon: Trophy,        label: "Phong trào thi đua",    badge: "5",  roles: "all",    badgeByRole:{ "cá nhân":"3", "lãnh đạo đơn vị":"3", "hội đồng":"5", "lãnh đạo cấp cao":"5", "quản trị hệ thống":"5" } },
      { icon: Award,         label: "Đề nghị khen thưởng",   badge: "47", roles: "all",    badgeByRole:{ "cá nhân":"2", "lãnh đạo đơn vị":"6", "hội đồng":"47", "lãnh đạo cấp cao":"12", "quản trị hệ thống":"47" } },
      { icon: Megaphone,     label: "Lấy ý kiến công khai",  badge: "3",  roles: "all" },
      { icon: Gavel,         label: "Hội đồng xét duyệt",    badge: "1",  roles: ["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"] },
      { icon: FileSignature, label: "Ký số & Phê duyệt",     badge: "8",  roles: ["lãnh đạo cấp cao","quản trị hệ thống"] },
      { icon: ClipboardList, label: "Chấm điểm & Bình xét",  badge: null, roles: ["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"] },
      { icon: ScrollText,    label: "Quyết định khen thưởng",badge: null, roles: "all" },
    ],
  },
  {
    group: "Dữ liệu",
    items: [
      { icon: Users,       label: "Hồ sơ cán bộ",        badge: null, roles: ["hội đồng","lãnh đạo đơn vị","lãnh đạo cấp cao","quản trị hệ thống"] },
      { icon: Archive,     label: "Kho huân – huy chương",badge: null, roles: "all" },
      { icon: ShieldCheck, label: "Lịch sử khen thưởng",  badge: null, roles: "all" },
      { icon: FileText,    label: "Báo cáo tổng hợp",     badge: null, roles: ["hội đồng","lãnh đạo cấp cao","quản trị hệ thống","lãnh đạo đơn vị"] },
      { icon: Calendar,    label: "Lịch công tác",         badge: null, roles: "all" },
      { icon: GitCompare,  label: "So sánh hồ sơ",         badge: "AI", roles: ["hội đồng","lãnh đạo cấp cao","quản trị hệ thống","lãnh đạo đơn vị"] },
      { icon: Kanban,      label: "Kanban hồ sơ",          badge: null, roles: ["hội đồng","lãnh đạo cấp cao","quản trị hệ thống","lãnh đạo đơn vị"] },
    ],
  },
  {
    group: "Hỗ trợ",
    items: [
      { icon: GitMerge,   label: "Luồng nghiệp vụ",   badge: null,   roles: "all" },
      { icon: Radio,      label: "Dòng thời gian",   badge: "Live", roles: "all" },
      { icon: HelpCircle, label: "Trung tâm hỗ trợ", badge: null,   roles: "all" },
    ],
  },
  {
    group: "Hệ thống",
    items: [
      { icon: Bell,       label: "Thông báo",          badge: "3",  roles: "all", badgeByRole:{ "quản trị hệ thống":"4", "lãnh đạo cấp cao":"3", "hội đồng":"3", "lãnh đạo đơn vị":"2", "cá nhân":"1" } },
      { icon: Sparkles,   label: "Trợ lý AI Tố Nga",   badge: "New",roles: "all" },
      { icon: BookOpen,   label: "Mẫu biểu TT 15/2025",badge: null, roles: "all" },
      { icon: Activity,   label: "SLA Monitor",         badge: "2",  roles: ["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"] },
      { icon: Map,        label: "Lộ trình triển khai",  badge: null, roles: "all" },
      { icon: BookOpen,   label: "Kế hoạch Thiết kế",   badge: null, roles: "all" },
      { icon: Building2,  label: "Cấu hình đơn vị",     badge: null, roles: ["quản trị hệ thống"] },
      { icon: ShieldCheck,label: "Audit Log",            badge: null, roles: ["quản trị hệ thống"] },
      { icon: ShieldCheck,label: "Phân quyền",           badge: null, roles: ["quản trị hệ thống"] },
      { icon: Server,     label: "Hệ thống",             badge: null, roles: ["quản trị hệ thống"] },
      { icon: Clock,      label: "Thời gian hoạt động",  badge: null, roles: "all" },
      { icon: Settings,   label: "Cài đặt tài khoản",    badge: null, roles: "all" },
    ],
  },
];

function filterNav(role: RoleId): NavGroup[] {
  return NAV_CONFIG.map(g => ({
    ...g,
    items: g.items.filter(it => it.roles === "all" || it.roles.includes(role)),
  })).filter(g => g.items.length > 0);
}
function getBadge(item: NavItem, role: RoleId): string | null {
  if (item.badgeByRole?.[role] !== undefined) return item.badgeByRole[role]!;
  return item.badge;
}

/* ─── Badge pill ────────────────────────────────────────────── */
function NavBadge({ value, active }: { value: string; active: boolean }) {
  const isLive = value === "Live";
  const isAI   = value === "AI";
  const isNew  = value === "New";
  const isSpecial = isLive || isAI || isNew;
  const num = !isSpecial ? parseInt(value) : NaN;
  const urgent = !isNaN(num) && num > 0;

  if (active) {
    return (
      <span className="flex items-center justify-center h-[17px] min-w-[17px] px-1 rounded-full text-[13px] shrink-0"
        style={{ background: "rgba(255,255,255,0.28)", color: "rgba(255,255,255,0.95)", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
        {value}
      </span>
    );
  }

  if (isLive) return (
    <span className="flex items-center gap-1 h-[17px] px-1.5 rounded text-[13px] shrink-0"
      style={{ background: "rgba(200,16,46,0.1)", color: "#c8102e", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, border: "1px solid rgba(200,16,46,0.2)" }}>
      <span className="inline-block size-1.5 rounded-full animate-pulse" style={{ background: "#c8102e" }} />
      {value}
    </span>
  );
  if (isAI) return (
    <span className="flex items-center h-[17px] px-1.5 rounded text-[13px] shrink-0"
      style={{ background: "rgba(212,168,75,0.15)", color: "#8a5e10", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, border: "1px solid rgba(212,168,75,0.3)" }}>
      AI
    </span>
  );
  if (isNew) return (
    <span className="flex items-center h-[17px] px-1.5 rounded text-[13px] shrink-0"
      style={{ background: "rgba(28,95,190,0.1)", color: "#1C5FBE", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, border: "1px solid rgba(28,95,190,0.2)" }}>
      New
    </span>
  );
  return (
    <span className="flex items-center justify-center h-[17px] min-w-[17px] px-1 rounded-full text-[13px] shrink-0"
      style={{ background: urgent ? "#c8102e" : "#e8eef5", color: urgent ? "white" : "#7a6a4e", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
      {value}
    </span>
  );
}

/* ═══ MAIN SIDEBAR ════════════════════════════════════════════ */
export function Sidebar({ user, active, onSelect }: {
  user: LoginUser; active: string; onSelect: (s: string) => void;
}) {
  const filteredNav = filterNav(user.role);
  const meta = ROLE_META[user.role];
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const initials = user.name === "Hệ thống (Admin)" ? "AD"
    : user.name.split(" ").slice(-2).map((w: string) => w[0]).join("");

  const toggleGroup = (g: string) =>
    setCollapsed(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  return (
    <aside className="w-[224px] shrink-0 flex flex-col h-full select-none"
      style={{ background: "#f4f7fb", borderRight: "1px solid #dde3ec" }}>

      {/* ── Dark brand header ──────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #0a1628 0%, #0f2040 55%, #152a52 100%)",
        borderBottom: "2px solid rgba(212,168,75,0.35)",
      }}>
        {/* Logo + name */}
        <div className="px-4 pt-5 pb-4 flex items-center gap-3">
          <div className="shrink-0 relative">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full"
              style={{ background: "rgba(200,16,46,0.35)", filter: "blur(9px)", transform: "scale(1.4)" }} />
            <div className="relative size-9 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, #e8102e, #a60d25)",
                boxShadow: "0 2px 14px rgba(200,16,46,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
                border: "1.5px solid rgba(255,255,255,0.15)",
              }}>
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" style={{ color: "white", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}>
                <path d="M12 2l2.39 6.95H22l-6.2 4.5 2.4 7.05L12 16l-6.2 4.5 2.4-7.05L2 8.95h7.61z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="leading-none" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14.5, color: "white", letterSpacing: "-0.01em" }}>
              VPTU Đồng Nai
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span style={{ fontSize: 13, color: "rgba(212,168,75,0.75)", fontFamily: "var(--font-sans)", letterSpacing: "0.05em" }}>
                Thi đua · Khen thưởng
              </span>
            </div>
          </div>
        </div>

        {/* Decorative gold accent strip */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(212,168,75,0.5) 30%, rgba(212,168,75,0.7) 50%, rgba(212,168,75,0.5) 70%, transparent 100%)" }} />
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2"
        style={{ scrollbarWidth: "none" }}>
        {filteredNav.map((g, gi) => {
          const isCollapsed = collapsed.includes(g.group);
          return (
            <div key={g.group} className={gi > 0 ? "mt-1.5" : ""}>
              {/* Group label */}
              <button onClick={() => toggleGroup(g.group)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 mb-0.5 rounded-[6px] transition-colors group"
                style={{ outline: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.5)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <span className="flex-1 text-left text-[13px] uppercase"
                  style={{ color: "#635647", fontFamily: "var(--font-sans)", fontWeight: 700, letterSpacing: "0.09em" }}>
                  {g.group}
                </span>
                {isCollapsed
                  ? <ChevronRight className="size-2.5 transition-colors" style={{ color: "#c4b89a" }} />
                  : <ChevronDown  className="size-2.5 transition-colors" style={{ color: "#c4b89a" }} />}
              </button>

              {!isCollapsed && (
                <div className="space-y-[1px]">
                  {g.items.map(it => {
                    const isActive = active === it.label;
                    const Icon     = it.icon;
                    const badge    = getBadge(it, user.role);
                    return (
                      <button key={it.label} onClick={() => onSelect(it.label)}
                        className="group w-full flex items-center gap-2 h-[32px] text-[12.5px] transition-all duration-150 outline-none rounded-[7px] relative overflow-hidden"
                        style={{
                          fontFamily: "var(--font-sans)",
                          paddingLeft: isActive ? "10px" : "10px",
                          paddingRight: "10px",
                          background: isActive
                            ? "linear-gradient(135deg, #1C5FBE 0%, #1752a8 100%)"
                            : "transparent",
                          color: isActive ? "white" : "#5a4e3c",
                          boxShadow: isActive
                            ? "0 2px 10px rgba(28,95,190,0.35), 0 1px 3px rgba(28,95,190,0.2)"
                            : "none",
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.65)";
                            (e.currentTarget as HTMLElement).style.color = "#2d1f0e";
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#5a4e3c";
                            (e.currentTarget as HTMLElement).style.boxShadow = "none";
                          }
                        }}>

                        <Icon
                          className="size-[14px] shrink-0 transition-colors ml-[4px]"
                          strokeWidth={isActive ? 2.2 : 1.7}
                          style={{ color: isActive ? "rgba(255,255,255,0.9)" : "#74654a" }}
                        />
                        <span className="flex-1 text-left truncate" style={{ fontWeight: isActive ? 600 : 400, fontSize: 13.5 }}>
                          {it.label}
                        </span>
                        {badge && <NavBadge value={badge} active={isActive} />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Divider between groups */}
              {gi < filteredNav.length - 1 && !isCollapsed && (
                <div className="mx-2 mt-2 mb-0"
                  style={{ height: 1, background: "linear-gradient(90deg, transparent, #dde3ec 25%, #dde3ec 75%, transparent)" }} />
              )}
            </div>
          );
        })}
      </nav>

      {/* ── AI hint card removed ───────────────────────────── */}
    </aside>
  );
}

/* ─── canAccessModule ───────────────────────────────────────── */
export function canAccessModule(role: RoleId, label: string): boolean {
  for (const group of NAV_CONFIG) {
    const item = group.items.find(it => it.label === label);
    if (item) return item.roles === "all" || item.roles.includes(role);
  }
  return role === "quản trị hệ thống";
}