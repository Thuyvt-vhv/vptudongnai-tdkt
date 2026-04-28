import { useState, useEffect } from "react";
import { Sidebar, canAccessModule } from "./components/sidebar";
import { Topbar } from "./components/topbar";
import { Dashboard } from "./components/dashboard";
import { DsShowcase } from "./components/ds-showcase";
import { PhanQuyenPage } from "./components/phan-quyen-page";
import { LoginPage } from "./components/login-page";
import type { LoginUser } from "./components/login-page";
import { ThemeProvider } from "./components/theme-context";
import { DeNghiKhenThuongPage } from "./components/de-nghi-khen-thuong-page";
import { KySoPage } from "./components/ky-so-page";
import { PhongTraoPage } from "./components/phong-trao-page";
import { ChamDiemPage } from "./components/cham-diem-page";
import { QuyetDinhPage } from "./components/quyet-dinh-page";
import { HoSoCanBoPage } from "./components/ho-so-can-bo-page";
import { LayYKienPage } from "./components/lay-y-kien-page";
import { HoiDongPage } from "./components/hoi-dong-page";
import { KeHoachTrienKhaiPage } from "./components/ke-hoach-trien-khai-page";
import { ThietKeTongThePage } from "./components/thiet-ke-tong-the-page";
import { CauHinhDonViPage } from "./components/cau-hinh-don-vi-page";
import { PhanTichPage } from "./components/phan-tich-page";
import { KhoHuanChuongPage } from "./components/kho-huan-chuong-page";
import { LichSuKhenThuongPage } from "./components/lich-su-khen-thuong-page";
import { TroLyAIPage } from "./components/tro-ly-ai-page";
import { MauBieuPage } from "./components/mau-bieu-page";
import { AuditLogPage } from "./components/audit-log-page";
import { SLAMonitorPage } from "./components/sla-monitor-page";
import { PublicLYKPage } from "./components/public-lyk-page";
import { HeThongPage } from "./components/he-thong-page";
import { BangXepHangPage } from "./components/bang-xep-hang-page";
import { BaoCaoPage } from "./components/bao-cao-page";
import { ThongBaoPage } from "./components/thong-bao-page";
import { ThoiGianPage } from "./components/thoi-gian-page";
import { CaiDatPage } from "./components/cai-dat-page";
import { CommandPalette } from "./components/command-palette";
import { OnboardingBadge, OnboardingPanel } from "./components/onboarding-checklist";
import { HoSoDetailDrawer } from "./components/ho-so-detail-drawer";
import { ChangelogModal } from "./components/changelog-modal";
import { ShortcutsOverlay } from "./components/shortcuts-overlay";
import { LichCongTacPage } from "./components/lich-cong-tac-page";
import { SoSanhPage } from "./components/so-sanh-page";
import { PrintPreviewModal } from "./components/print-preview-modal";
import { KanbanPage } from "./components/kanban-page";
import { HelpCenterPage } from "./components/help-center-page";
import { ActivityFeedPage } from "./components/activity-feed-page";
import { LuongNghiepVuPage } from "./components/luong-nghiep-vu-page";
import { UserDashboard } from "./components/user-dashboard";
import { UserHoSoTracker } from "./components/user-ho-so-tracker";
import {
  ShieldAlert, ChevronLeft, Home,
  Crown, Gavel, Users, User, Settings,
} from "lucide-react";

/* ─── Role display meta (dùng cho access-denied) ──────────────── */
const ROLE_META_SIMPLE: Record<LoginUser["role"], {
  label: string; color: string; bg: string; icon: typeof User;
}> = {
  "quản trị hệ thống": { label:"Quản trị hệ thống", color:"#0b1426", bg:"#e8ecf3", icon:Settings },
  "lãnh đạo cấp cao":  { label:"Lãnh đạo cấp cao",  color:"#92400e", bg:"#fef3c7", icon:Crown    },
  "hội đồng":          { label:"Thành viên HĐ",     color:"#7c3aed", bg:"#f5f3ff", icon:Gavel    },
  "lãnh đạo đơn vị":   { label:"Lãnh đạo đơn vị",   color:"#166534", bg:"#dcfce7", icon:Users    },
  "cá nhân":           { label:"Cá nhân/Tập thể",   color:"#1C5FBE", bg:"#ddeafc", icon:User     },
};

/* ─── Access Denied page ──────────────────────────────────────── */
function AccessDenied({
  moduleName,
  user,
  onBack,
}: {
  moduleName: string;
  user: LoginUser;
  onBack: () => void;
}) {
  const meta = ROLE_META_SIMPLE[user.role];
  const Icon = meta.icon;

  const REQUIRED_ROLES: Record<string, string[]> = {
    "Phân tích thi đua":      ["Council", "Leader", "Admin"],
    "Hội đồng xét duyệt":     ["Council", "Leader", "Admin"],
    "Ký số & Phê duyệt":      ["Leader", "Admin"],
    "Chấm điểm & Bình xét":   ["Council", "Leader", "Admin"],
    "Hồ sơ cán bộ":           ["Council", "Manager", "Leader", "Admin"],
    "Cấu hình đơn vị":        ["Admin", "Lãnh đạo cấp cao", "Lãnh đạo đơn vị"],
    "Phân quyền":              ["Admin", "Lãnh đạo cấp cao"],
  };

  const required = REQUIRED_ROLES[moduleName] ?? ["Leader hoặc Admin"];

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-0 p-16"
      style={{ background: "var(--color-paper)" }}
    >
      <div
        className="size-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
        style={{ background: "linear-gradient(135deg,#1a2744,#0b1426)" }}
      >
        <ShieldAlert className="size-9 text-[#ffd27a]" />
      </div>
      <h2
        className="text-[24px] text-[#0b1426] mb-2 text-center"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}
      >
        Không có quyền truy cập
      </h2>
      <p
        className="text-[14px] text-[#635647] mb-8 text-center max-w-md leading-relaxed"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Trang{" "}
        <span className="text-[#0b1426]" style={{ fontWeight: 600 }}>
          {moduleName}
        </span>{" "}
        yêu cầu vai trò cao hơn. Vui lòng liên hệ Quản trị viên nếu bạn cần
        được cấp quyền.
      </p>
      <div className="flex items-center gap-4 mb-8">
        <div
          className="rounded-xl border px-5 py-4 flex flex-col items-center gap-2 min-w-[160px]"
          style={{ borderColor: meta.bg, background: meta.bg }}
        >
          <div
            className="size-10 rounded-full flex items-center justify-center"
            style={{ background: meta.color }}
          >
            <Icon className="size-5 text-white" />
          </div>
          <div className="text-center">
            <div
              className="text-[13px] uppercase tracking-wider mb-0.5"
              style={{ color: "#635647", fontFamily: "var(--font-sans)" }}
            >
              Vai trò của bạn
            </div>
            <div
              className="text-[13px]"
              style={{ color: meta.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}
            >
              {meta.label}
            </div>
          </div>
        </div>
        <div className="text-[#d1d5db] text-[24px]">→</div>
        <div
          className="rounded-xl border px-5 py-4 flex flex-col items-center gap-2 min-w-[160px]"
          style={{ borderColor: "#e2e8f0", background: "#ffffff" }}
        >
          <div
            className="size-10 rounded-full flex items-center justify-center"
            style={{ background: "#0b1426" }}
          >
            <ShieldAlert className="size-5 text-[#ffd27a]" />
          </div>
          <div className="text-center">
            <div
              className="text-[13px] uppercase tracking-wider mb-0.5"
              style={{ color: "#635647", fontFamily: "var(--font-sans)" }}
            >
              Yêu cầu
            </div>
            <div
              className="text-[13px] text-[#0b1426]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}
            >
              {required.join(" / ")}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] border text-[13px] transition-all hover:bg-[#eef2f8]"
          style={{ borderColor: "#e2e8f0", color: "#5a5040", fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          <ChevronLeft className="size-4" />Quay lại
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[13px] text-white transition-all"
          style={{ background: "linear-gradient(135deg,#1C5FBE,#1752a8)", fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          <Home className="size-4" />Bảng điều hành
        </button>
      </div>
      <p className="mt-8 text-[13px] text-[#6b5e47] text-center" style={{ fontFamily: "var(--font-sans)" }}>
        Phân quyền theo Điều 8 NĐ 13/2023/NĐ-CP · Audit log đã ghi nhận truy cập này
      </p>
    </div>
  );
}

/* ─── App shell ──────────────────────────────────────────────── */
export default function App() {
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null);
  const [active, setActive]           = useState("Bảng điều hành");
  const [prevActive, setPrevActive]   = useState("Bảng điều hành");
  const [publicLYK, setPublicLYK]     = useState(false);
  const [cmdOpen, setCmdOpen]         = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [drawerHoSoId, setDrawerHoSoId] = useState<string | null>(null);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [hideSidebar, setHideSidebar] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(v => !v);
        return;
      }
      if (e.key === "?" && !isInput) {
        setShortcutsOpen(v => !v);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "?") {
        setChangelogOpen(v => !v);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setPrintOpen(v => !v);
        return;
      }
      if (e.key === "Escape") {
        if (drawerHoSoId) { setDrawerHoSoId(null); return; }
        if (shortcutsOpen) { setShortcutsOpen(false); return; }
        if (changelogOpen) { setChangelogOpen(false); return; }
        if (cmdOpen)       { setCmdOpen(false); return; }
      }
      if (!isInput && e.key === "g") {
        const nextKey = new Promise<KeyboardEvent>((res) => {
          window.addEventListener("keydown", res, { once: true });
        });
        nextKey.then(ev => {
          if (!currentUser) return;
          const map: Record<string, string> = {
            d:"Bảng điều hành", n:"Thông báo", a:"Trợ lý AI Tố Nga",
            b:"Bảng xếp hạng", h:"Hồ sơ cán bộ", s:"SLA Monitor",
          };
          if (map[ev.key]) navigate(map[ev.key]);
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [drawerHoSoId, shortcutsOpen, changelogOpen, cmdOpen, currentUser]);

  if (publicLYK) {
    return (
      <ThemeProvider>
        <PublicLYKPage onBack={() => setPublicLYK(false)} />
      </ThemeProvider>
    );
  }

  if (!currentUser) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={setCurrentUser} onPublicLYK={() => setPublicLYK(true)} />
      </ThemeProvider>
    );
  }

  const navigate = (label: string) => {
    setPrevActive(active);
    if (label === "__cmd__") { setCmdOpen(true); return; }
    setActive(label);
    setHideSidebar(label !== "Bảng điều hành");
  };

  const navigateFromSidebar = (label: string) => {
    setPrevActive(active);
    setActive(label);
  };

  const goBack = () => {
    setActive("Bảng điều hành");
    setPrevActive("Bảng điều hành");
  };

  const isRestricted = !canAccessModule(currentUser.role, active);

  const renderMain = () => {
    if (isRestricted) {
      return <AccessDenied moduleName={active} user={currentUser} onBack={goBack} />;
    }
    // ── Role-specific overrides ──────────────────────────────
    if (currentUser.role === "cá nhân") {
      if (active === "Bảng điều hành")      return <UserDashboard user={currentUser} onNavigate={navigate} />;
      if (active === "Đề nghị khen thưởng") return <UserHoSoTracker user={currentUser} onNavigate={navigate} />;
    }

    switch (active) {
      case "Bảng điều hành":        return <Dashboard user={currentUser} onNavigate={navigate} />;
      case "Đề nghị khen thưởng":   return <DeNghiKhenThuongPage user={currentUser} />;
      case "Ký số & Phê duyệt":     return <KySoPage user={currentUser} />;
      case "Lấy ý kiến công khai":  return <LayYKienPage user={currentUser} />;
      case "Hội đồng xét duyệt":    return <HoiDongPage user={currentUser} />;
      case "Phong trào thi đua":    return <PhongTraoPage user={currentUser} onDetailOpen={() => setHideSidebar(true)} onDetailClose={() => setHideSidebar(false)} />;
      case "Chấm điểm & Bình xét":  return <ChamDiemPage user={currentUser} />;
      case "Quyết định khen thưởng":return <QuyetDinhPage user={currentUser} />;
      case "Hồ sơ cán bộ":          return <HoSoCanBoPage user={currentUser} />;
      case "Lộ trình triển khai":   return <KeHoachTrienKhaiPage user={currentUser} />;
      case "Kế hoạch Thiết kế":     return <ThietKeTongThePage user={currentUser} />;
      case "Phân quyền":            return <PhanQuyenPage />;
      case "Design System":         return <DsShowcase />;
      case "Phân tích thi đua":     return <PhanTichPage user={currentUser} />;
      case "Kho huân – huy chương": return <KhoHuanChuongPage user={currentUser} />;
      case "Lịch sử khen thưởng":   return <LichSuKhenThuongPage user={currentUser} />;
      case "Trợ lý AI Tố Nga":      return <TroLyAIPage user={currentUser} onNavigate={navigate} />;
      case "Cấu hình đơn vị":       return <CauHinhDonViPage user={currentUser} />;
      case "Mẫu biểu TT 01/2024":   return <MauBieuPage user={currentUser} />;
      case "Audit Log":             return <AuditLogPage user={currentUser} />;
      case "SLA Monitor":           return <SLAMonitorPage user={currentUser} />;
      case "Hệ thống":              return <HeThongPage user={currentUser} />;
      case "Bảng xếp hạng":         return <BangXepHangPage user={currentUser} />;
      case "Báo cáo tổng hợp":      return <BaoCaoPage user={currentUser} />;
      case "Thông báo":             return <ThongBaoPage user={currentUser} onNavigate={navigate} />;
      case "Thời gian hoạt động":   return <ThoiGianPage user={currentUser} />;
      case "Lịch công tác":         return <LichCongTacPage user={currentUser} />;
      case "So sánh hồ sơ":         return <SoSanhPage user={currentUser} />;
      case "Kanban hồ sơ":          return <KanbanPage user={currentUser} />;
      case "Trung tâm hỗ trợ":      return <HelpCenterPage user={currentUser} />;
      case "Dòng thời gian":        return <ActivityFeedPage user={currentUser} />;
      case "Luồng nghiệp vụ":       return <LuongNghiepVuPage user={currentUser} />;
      case "Cài đặt tài khoản":     return <CaiDatPage user={currentUser} />;
      default:                      return <Dashboard user={currentUser} onNavigate={navigate} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="size-full flex transition-colors duration-300"
        style={{ background:"var(--color-paper)", fontFamily: "var(--font-sans)" }}>
        {!hideSidebar && <Sidebar user={currentUser} active={active} onSelect={navigateFromSidebar} />}

        <div className="flex-1 min-w-0 flex flex-col overflow-hidden" style={{ background: "var(--color-paper)" }}>
          <Topbar
            user={currentUser}
            active={active}
            onLogout={() => { setCurrentUser(null); setActive("Bảng điều hành"); }}
            onSelectModule={navigate}
            onOpenCmd={() => setCmdOpen(true)}
            onOpenSettings={() => navigate("Cài đặt tài khoản")}
            onOpenChangelog={() => setChangelogOpen(true)}
            onOpenShortcuts={() => setShortcutsOpen(true)}
            onOpenPrint={() => setPrintOpen(true)}
            hideSidebar={hideSidebar}
            onToggleSidebar={() => setHideSidebar(v => !v)}
          />
          <main className="flex-1 overflow-y-auto">{renderMain()}</main>
        </div>

        {/* ── Global overlays ── */}
        <CommandPalette
          open={cmdOpen}
          onClose={() => setCmdOpen(false)}
          onNavigate={(m) => { navigate(m); setCmdOpen(false); }}
          user={currentUser}
        />
        <HoSoDetailDrawer
          hoSoId={drawerHoSoId}
          onClose={() => setDrawerHoSoId(null)}
          user={currentUser}
          onNavigate={navigate}
        />
        <PrintPreviewModal open={printOpen} onClose={() => setPrintOpen(false)} user={currentUser} />
        <ChangelogModal open={changelogOpen} onClose={() => setChangelogOpen(false)} />
        <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

        {/* ── Onboarding floating badge + panel ── */}
        <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-2">
          <OnboardingPanel
            user={currentUser}
            open={onboardOpen}
            onClose={() => setOnboardOpen(false)}
            onNavigate={navigate}
            completedIds={completedTasks}
            onComplete={(id) => setCompletedTasks(p => [...p, id])}
          />
          <OnboardingBadge
            user={currentUser}
            onOpen={() => setOnboardOpen(v => !v)}
            completedIds={completedTasks}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}