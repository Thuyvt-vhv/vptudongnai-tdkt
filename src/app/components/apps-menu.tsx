import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Layers, Settings, BarChart3, X, Activity, Clock, Server, HelpCircle } from "lucide-react";

interface AppItem {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  badge?: string;
}

const APP_ITEMS: AppItem[] = [
  {
    id: "Phân quyền",
    label: "Phân quyền",
    desc: "Người dùng, vai trò & ma trận quyền",
    icon: ShieldCheck,
    color: "#1C5FBE",
    bg: "#ddeafc",
  },
  {
    id: "Design System",
    label: "Design System",
    desc: "Component library & design tokens",
    icon: Layers,
    color: "#7d5a10",
    bg: "#fdf3d9",
    badge: "DS",
  },
  {
    id: "Cấu hình đơn vị",
    label: "Cấu hình",
    desc: "Tham số hệ thống & đơn vị tổ chức",
    icon: Settings,
    color: "#5a5040",
    bg: "#eef2f8",
  },
  {
    id: "Phân tích thi đua",
    label: "Phân tích AI",
    desc: "Báo cáo thống kê & AI insights",
    icon: BarChart3,
    color: "#166534",
    bg: "#dcfce7",
    badge: "AI",
  },
  {
    id: "SLA Monitor",
    label: "SLA Monitor",
    desc: "Theo dõi deadline & vi phạm SLA",
    icon: Activity,
    color: "#b45309",
    bg: "#fef3c7",
    badge: "2",
  },
  {
    id: "Audit Log",
    label: "Audit Log",
    desc: "Nhật ký bất biến hệ thống",
    icon: Clock,
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    id: "Hệ thống",
    label: "Hệ thống",
    desc: "System health & monitoring",
    icon: Server,
    color: "#0891b2",
    bg: "#e0f2fe",
  },
  {
    id: "Trung tâm hỗ trợ",
    label: "Hỗ trợ",
    desc: "Hướng dẫn sử dụng & câu hỏi thường gặp",
    icon: HelpCircle,
    color: "#166534",
    bg: "#dcfce7",
  },
];

/* ─── Grid icon (4 chấm kiểu Google) ────────────────────────────── */
function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="currentColor" className={className} aria-hidden>
      <rect x="1"  y="1"  width="6" height="6" rx="1.2"/>
      <rect x="11" y="1"  width="6" height="6" rx="1.2"/>
      <rect x="1"  y="11" width="6" height="6" rx="1.2"/>
      <rect x="11" y="11" width="6" height="6" rx="1.2"/>
    </svg>
  );
}

/* ─── AppsMenu component ─────────────────────────────────────────── */
export function AppsMenu({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const isAppActive = APP_ITEMS.some(a => a.id === active);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Ứng dụng hệ thống"
        aria-expanded={open}
        className="relative flex items-center justify-center size-10 rounded-[8px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#1C5FBE]/50"
        style={{
          background: open || isAppActive ? "#ddeafc" : "transparent",
          color:      open || isAppActive ? "#1C5FBE" : "#635647",
        }}
        title="Ứng dụng hệ thống"
      >
        <GridIcon className="size-[18px]" />
        {/* active dot */}
        {isAppActive && !open && (
          <span className="absolute bottom-1.5 right-1.5 size-1.5 rounded-full bg-[#1C5FBE]" />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[300px] rounded-2xl border shadow-2xl overflow-hidden z-50"
          style={{
            background: "white",
            borderColor: "#e2e8f0",
            boxShadow: "0 8px 32px rgba(11,20,38,0.14), 0 2px 8px rgba(11,20,38,0.06)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "#eef2f8", background: "#f4f7fb" }}
          >
            <div className="flex items-center gap-2">
              <GridIcon className="size-4 text-[#635647]" />
              <span
                className="text-[13px] tracking-wide uppercase"
                style={{ color: "#635647", fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Ứng dụng hệ thống
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="size-6 flex items-center justify-center rounded-md hover:bg-[#e2e8f0] transition-colors text-[#635647]"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* App grid — 2×2 */}
          <div className="grid grid-cols-2 gap-2 p-3">
            {APP_ITEMS.map(app => {
              const Icon = app.icon;
              const isCurrent = active === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => handleSelect(app.id)}
                  className="flex flex-col items-start gap-2.5 p-3 rounded-xl text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#1C5FBE]/50"
                  style={{
                    background: isCurrent ? app.bg : "#f4f7fb",
                    border: `1.5px solid ${isCurrent ? app.color + "40" : "#eef2f8"}`,
                  }}
                >
                  {/* Icon box */}
                  <div
                    className="size-10 rounded-[10px] grid place-items-center shrink-0"
                    style={{ background: app.bg }}
                  >
                    <Icon className="size-5" style={{ color: app.color }} strokeWidth={1.7} />
                  </div>

                  <div className="w-full min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="text-[13px] truncate"
                        style={{
                          color: isCurrent ? app.color : "#0b1426",
                          fontWeight: isCurrent ? 600 : 500,
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {app.label}
                      </span>
                      {app.badge && (
                        <span
                          className="text-[13px] px-1.5 py-px rounded-full shrink-0"
                          style={{ background: app.bg, color: app.color, fontWeight: 600 }}
                        >
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[13px] leading-snug"
                      style={{ color: "#635647", fontFamily: "var(--font-sans)" }}
                    >
                      {app.desc}
                    </p>
                  </div>

                  {/* active indicator */}
                  {isCurrent && (
                    <div
                      className="w-full h-0.5 rounded-full mt-auto"
                      style={{ background: app.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-2.5 border-t text-center"
            style={{ borderColor: "#eef2f8", background: "#f4f7fb" }}
          >
            <p className="text-[13px]" style={{ color: "#6b5e47", fontFamily: "var(--font-sans)" }}>
              Phiên bản 1.0.0 · VPTU Đồng Nai © 2026
            </p>
          </div>
        </div>
      )}
    </div>
  );
}