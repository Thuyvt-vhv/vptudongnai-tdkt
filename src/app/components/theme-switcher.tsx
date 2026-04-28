import { Palette, Check, X, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { THEMES, useTheme } from "./theme-context";

/* ─── Mini colour preview strip ─────────────────────────────────── */
function ThemePreview({ theme, active }: { theme: typeof THEMES[0]; active: boolean }) {
  return (
    <button
      onClick={() => {}}
      className="group relative rounded-xl overflow-hidden border-2 text-left w-full transition-all duration-150"
      style={{
        borderColor: active ? theme.primary : "#e2e8f0",
        boxShadow: active
          ? `0 0 0 3px rgba(${theme.primaryRgb}, 0.15), 0 4px 12px rgba(${theme.primaryRgb}, 0.18)`
          : "0 1px 3px rgba(11,20,38,0.06)",
      }}
    >
      {/* Top band: sidebar strip + content area */}
      <div className="h-[52px] flex relative overflow-hidden">
        {/* Sidebar mini-strip */}
        <div
          className="w-[14px] flex flex-col items-center pt-2 gap-[3px] shrink-0"
          style={{ background: theme.sidebarBg }}
        >
          {/* Star icon dot */}
          <div className="size-2 rounded-sm" style={{ background: theme.gold, opacity: 0.9 }} />
          {/* Nav dots */}
          {[1,1,0.4,0.4,0.4].map((op, i) => (
            <div key={i} className="w-[8px] h-[2px] rounded-full"
              style={{ background: i === 0 ? theme.primary : "rgba(255,255,255,0.4)", opacity: op }} />
          ))}
        </div>
        {/* Content: primary + gold + tint */}
        <div className="flex-1 relative" style={{ background: theme.primary }}>
          {/* Mock button */}
          <div className="absolute bottom-2 left-2 h-4 rounded px-2 flex items-center"
            style={{ background: "rgba(255,255,255,0.22)" }}>
            <div className="w-7 h-1.5 rounded-full bg-white/70" />
          </div>
        </div>
        <div className="w-7" style={{ background: theme.gold }}>
          <div className="h-full flex items-center justify-center opacity-60">
            <Sparkles className="size-3 text-white" />
          </div>
        </div>
        <div className="w-5" style={{ background: theme.tint }} />
      </div>

      {/* Label */}
      <div className="px-3 py-2" style={{ background: theme.paperBg }}>
        <p className="text-[13px] leading-tight truncate" style={{ color: "#0b1426", fontWeight: 600 }}>
          {theme.name}
        </p>
        <p className="text-[13px] leading-tight truncate mt-0.5" style={{ color: "#635647" }}>
          {theme.desc}
        </p>
      </div>

      {/* Active checkmark */}
      {active && (
        <div
          className="absolute top-1.5 right-1.5 size-5 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.primary }}
        >
          <Check className="size-3 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `rgba(${theme.primaryRgb}, 0.06)` }}
      />
    </button>
  );
}

/* ─── Switcher button + panel ────────────────────────────────────── */
export function ThemeSwitcherButton() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen]       = useState(false);
  const [preview, setPreview] = useState<typeof THEMES[0] | null>(null);
  const panelRef              = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPreview(null);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const activeTheme = preview ?? theme;

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        className="btn-icon"
        aria-label="Chọn giao diện màu sắc"
        title="Giao diện màu sắc"
        onClick={() => { setOpen(v => !v); setPreview(null); }}
        style={open ? { background: theme.tint, color: theme.primary } : undefined}
      >
        <Palette className="size-[18px]" strokeWidth={1.6} />
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[500px] rounded-2xl border overflow-hidden z-50"
          style={{
            background: "#fff",
            borderColor: "#e2e8f0",
            boxShadow: "0 20px 40px -8px rgba(11,20,38,0.18), 0 4px 12px rgba(11,20,38,0.08)",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "#eef2f8", background: "#ffffff" }}
          >
            <div className="flex items-center gap-3">
              {/* Color dot cluster */}
              <div className="flex items-center -space-x-1">
                {["#1C5FBE","#B91C1C","#0F766E","#6D28D9"].map((c,i) => (
                  <div key={i} className="size-4 rounded-full border-2 border-white"
                    style={{ background: c, zIndex: 4 - i }} />
                ))}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>
                  Giao diện màu sắc
                </p>
                <p className="text-[13px] text-[#635647]">
                  Đang dùng: <span className="font-semibold" style={{ color: theme.primary }}>{theme.name}</span>
                </p>
              </div>
            </div>
            <button className="btn-icon size-7 rounded" onClick={() => { setOpen(false); setPreview(null); }}>
              <X className="size-3.5" />
            </button>
          </div>

          {/* Theme grid */}
          <div className="p-4 grid grid-cols-4 gap-3">
            {THEMES.map(t => (
              <div
                key={t.id}
                onMouseEnter={() => setPreview(t)}
                onMouseLeave={() => setPreview(null)}
                onClick={() => { setTheme(t); setPreview(null); }}
                className="cursor-pointer"
              >
                <ThemePreview theme={t} active={theme.id === t.id} />
              </div>
            ))}
          </div>

          {/* Live preview bar */}
          <div
            className="mx-4 mb-4 rounded-xl overflow-hidden border transition-all duration-300"
            style={{ borderColor: activeTheme.tint }}
          >
            <div className="flex items-center gap-3 px-4 py-3"
              style={{ background: activeTheme.paperBg }}>
              {/* Mini mockup */}
              <div className="flex items-center gap-2 flex-1">
                <div className="size-7 rounded-lg flex items-center justify-center"
                  style={{ background: activeTheme.tint }}>
                  <div className="size-3 rounded-sm" style={{ background: activeTheme.primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-2 w-24 rounded-full mb-1.5" style={{ background: activeTheme.primary, opacity: 0.9 }} />
                  <div className="h-1.5 w-16 rounded-full" style={{ background: activeTheme.tint }} />
                </div>
              </div>
              {/* Buttons preview */}
              <div className="flex items-center gap-2">
                <div className="h-7 px-3 rounded-lg text-white text-[13px] font-semibold flex items-center"
                  style={{ background: activeTheme.primary }}>
                  Xác nhận
                </div>
                <div className="h-7 px-3 rounded-lg text-[13px] font-semibold flex items-center"
                  style={{ background: activeTheme.gold, color: "#fff" }}>
                  <Sparkles className="size-3 mr-1" /> AI
                </div>
              </div>
              {/* Theme info */}
              <div className="text-right">
                <p className="text-[13px] font-semibold" style={{ color: activeTheme.primary }}>
                  {activeTheme.name}
                </p>
                <p className="text-[13px]" style={{ color: "#635647" }}>
                  {preview ? "Xem trước" : "Đang dùng"}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 border-t flex items-center justify-between"
            style={{ borderColor: "#eef2f8", background: "#ffffff" }}
          >
            <div className="flex items-center gap-1.5">
              {/* Current palette dots */}
              <div className="size-3 rounded-full" style={{ background: theme.primary }} />
              <div className="size-3 rounded-full" style={{ background: theme.gold }} />
              <div className="size-3 rounded-full border" style={{ background: theme.tint, borderColor: "#e2e8f0" }} />
              <p className="text-[13px] text-[#635647] ml-1">
                {theme.desc}
              </p>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => { setOpen(false); setPreview(null); }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}