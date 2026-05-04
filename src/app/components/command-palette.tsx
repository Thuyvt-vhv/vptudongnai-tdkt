import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, LayoutDashboard, Trophy, BarChart3, Award, Megaphone,
  Gavel, FileSignature, ClipboardList, ScrollText, Users, Archive,
  ShieldCheck, FileText, Sparkles, BookOpen, Activity, Map, Building2,
  Clock, Server, Bell, ArrowRight, Command, Hash, User, Zap,
  Star, ChevronRight, X,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type ItemType = "module" | "hososo" | "canbo" | "quyetdinh" | "action";

interface PaletteItem {
  id: string;
  type: ItemType;
  label: string;
  sublabel?: string;
  icon: typeof Search;
  color: string;
  target?: string; // module to navigate to
  keywords?: string[];
}

/* ═══════════════════════════════════════════════════════════════
   DATA CATALOG
═══════════════════════════════════════════════════════════════ */
const MODULE_ITEMS: PaletteItem[] = [
  { id:"m1",  type:"module", label:"Bảng điều hành",       sublabel:"Tổng quan hệ thống",          icon:LayoutDashboard, color:"#0b1426", target:"Bảng điều hành" },
  { id:"m2",  type:"module", label:"Bảng xếp hạng",        sublabel:"Live · Realtime",              icon:Trophy,          color:"#8a6400", target:"Bảng xếp hạng",        keywords:["ranking","xep hang"] },
  { id:"m3",  type:"module", label:"Phân tích thi đua",    sublabel:"AI Analytics",                 icon:BarChart3,       color:"#7c3aed", target:"Phân tích thi đua",    keywords:["analytics","phan tich"] },
  { id:"m4",  type:"module", label:"Phong trào thi đua",   sublabel:"Quản lý phong trào",           icon:Trophy,          color:"#c8102e", target:"Phong trào thi đua",   keywords:["phong trao","movement"] },
  { id:"m5",  type:"module", label:"Đề nghị khen thưởng",  sublabel:"47 hồ sơ đang xử lý",        icon:Award,           color:"#1C5FBE", target:"Đề nghị khen thưởng",  keywords:["de nghi","ho so","khen thuong"] },
  { id:"m6",  type:"module", label:"Lấy ý kiến công khai", sublabel:"3 đợt đang mở",               icon:Megaphone,       color:"#166534", target:"Lấy ý kiến công khai", keywords:["y kien","lay y kien","public"] },
  { id:"m7",  type:"module", label:"Hội đồng xét duyệt",   sublabel:"Phiên HD-2026-04 sắp diễn ra",icon:Gavel,           color:"#0b1426", target:"Hội đồng xét duyệt",   keywords:["hoi dong","xet duyet","council"] },
  { id:"m8",  type:"module", label:"Ký số & Phê duyệt",    sublabel:"8 hồ sơ chờ ký",              icon:FileSignature,   color:"#1C5FBE", target:"Ký số & Phê duyệt",    keywords:["ky so","phe duyet","sign"] },
  { id:"m9",  type:"module", label:"Chấm điểm & Bình xét", sublabel:"Đánh giá tiêu chí",           icon:ClipboardList,   color:"#b45309", target:"Chấm điểm & Bình xét", keywords:["cham diem","binh xet","score"] },
  { id:"m10", type:"module", label:"Quyết định khen thưởng",sublabel:"Tra cứu quyết định",         icon:ScrollText,      color:"#166534", target:"Quyết định khen thưởng",keywords:["quyet dinh","decision"] },
  { id:"m11", type:"module", label:"Hồ sơ cán bộ",         sublabel:"AI Eligibility Check",        icon:Users,           color:"#1C5FBE", target:"Hồ sơ cán bộ",         keywords:["ho so can bo","staff","profile"] },
  { id:"m12", type:"module", label:"Kho huân – huy chương",sublabel:"Danh mục danh hiệu",          icon:Archive,         color:"#8a6400", target:"Kho huân – huy chương", keywords:["huan chuong","huy chuong","medal","kho"] },
  { id:"m13", type:"module", label:"Lịch sử khen thưởng",  sublabel:"Tra cứu lịch sử",             icon:ShieldCheck,     color:"#166534", target:"Lịch sử khen thưởng",  keywords:["lich su","history"] },
  { id:"m14", type:"module", label:"Báo cáo tổng hợp",     sublabel:"Xuất PDF/Excel/Word",         icon:FileText,        color:"#0b1426", target:"Báo cáo tổng hợp",     keywords:["bao cao","report","xuat"] },
  { id:"m15", type:"module", label:"Trợ lý AI",     sublabel:"Hỏi đáp & Gợi ý AI",         icon:Sparkles,        color:"#7c3aed", target:"Trợ lý AI",     keywords:["ai","tro ly","to nga","chatbot"] },
  { id:"m16", type:"module", label:"Mẫu biểu TT 15/2025",  sublabel:"23 biểu mẫu chính thức",     icon:BookOpen,        color:"#0b1426", target:"Mẫu biểu TT 15/2025",  keywords:["mau bieu","form","thong tu"] },
  { id:"m17", type:"module", label:"SLA Monitor",          sublabel:"2 vi phạm đang xử lý",        icon:Activity,        color:"#c8102e", target:"SLA Monitor",           keywords:["sla","monitor","deadline"] },
  { id:"m18", type:"module", label:"Thông báo",            sublabel:"3 chưa đọc",                  icon:Bell,            color:"#1C5FBE", target:"Thông báo",             keywords:["thong bao","notification"] },
  { id:"m19", type:"module", label:"Audit Log",            sublabel:"Nhật ký hệ thống",            icon:ShieldCheck,     color:"#0b1426", target:"Audit Log",             keywords:["audit","log","nhat ky"] },
  { id:"m20", type:"module", label:"Hệ thống",             sublabel:"Cài đặt & Quản trị",          icon:Server,          color:"#5a5040", target:"Hệ thống",              keywords:["he thong","system","cai dat"] },
  { id:"m21", type:"module", label:"Thời gian hoạt động",  sublabel:"Activity timeline",           icon:Clock,           color:"#0b1426", target:"Thời gian hoạt động",  keywords:["thoi gian","activity","timeline"] },
];

const HOSOSO_ITEMS: PaletteItem[] = [
  { id:"hs1", type:"hososo", label:"NS-2026-0147 · Nguyễn Văn An",   sublabel:"CSTĐT · Đang chờ ký số",       icon:Award, color:"#c8102e", target:"Ký số & Phê duyệt", keywords:["0147","nguyen van an","cstdt"] },
  { id:"hs2", type:"hososo", label:"NS-2026-0153 · Vũ Đức Khoa",     sublabel:"CSTĐCS · Đang thẩm định",      icon:Award, color:"#b45309", target:"Chấm điểm & Bình xét", keywords:["0153","vu duc khoa","cstdcs"] },
  { id:"hs3", type:"hososo", label:"NS-2026-0142 · Trần Thị Bích",   sublabel:"Bằng khen UBND · SLA cảnh báo",icon:Award, color:"#b45309", target:"Ký số & Phê duyệt", keywords:["0142","tran thi bich","bang khen"] },
  { id:"hs4", type:"hososo", label:"NS-2026-0160 · Nguyễn Đình Hùng",sublabel:"CSTĐCS · Vừa tạo",            icon:Award, color:"#166534", target:"Đề nghị khen thưởng", keywords:["0160","nguyen dinh hung"] },
  { id:"hs5", type:"hososo", label:"NS-2026-0148 · Cá nhân",         sublabel:"CSTĐCS · Đang bỏ phiếu",       icon:Award, color:"#1C5FBE", target:"Đề nghị khen thưởng", keywords:["0148"] },
];

const CANBO_ITEMS: PaletteItem[] = [
  { id:"cb1", type:"canbo", label:"Nguyễn Văn An",   sublabel:"Chuyên viên · Sở GDĐT · AI: Đủ ĐK CSTĐT",icon:User, color:"#1C5FBE", target:"Hồ sơ cán bộ", keywords:["nguyen van an","so gddt"] },
  { id:"cb2", type:"canbo", label:"Lê Thị Hoa",      sublabel:"Kế toán trưởng · Sở TN&MT",              icon:User, color:"#166534", target:"Hồ sơ cán bộ", keywords:["le thi hoa","so tnmt"] },
  { id:"cb3", type:"canbo", label:"Trần Văn Bình",   sublabel:"Kỹ sư · Sở Xây dựng · AI: Đủ ĐK",       icon:User, color:"#7c3aed", target:"Hồ sơ cán bộ", keywords:["tran van binh","so xay dung"] },
  { id:"cb4", type:"canbo", label:"Vũ Đức Khoa",     sublabel:"Chuyên viên · Sở TN&MT",                 icon:User, color:"#0b1426", target:"Hồ sơ cán bộ", keywords:["vu duc khoa"] },
];

const QUYETDINH_ITEMS: PaletteItem[] = [
  { id:"qd1", type:"quyetdinh", label:"QĐ-2026-0140 · CSTĐT Nguyễn Văn Minh",sublabel:"Đã ký số · 22/04/2026", icon:ScrollText, color:"#166534", target:"Quyết định khen thưởng", keywords:["0140","nguyen van minh"] },
  { id:"qd2", type:"quyetdinh", label:"QĐ-2026-0088 · CSTĐCS năm 2025",       sublabel:"Đã ban hành · 15/01/2026",icon:ScrollText, color:"#0b1426", target:"Quyết định khen thưởng", keywords:["0088","cstdcs 2025"] },
];

const ACTION_ITEMS: PaletteItem[] = [
  { id:"ac1", type:"action", label:"Tạo hồ sơ khen thưởng mới",   sublabel:"Mở form đề nghị",        icon:Zap, color:"#1C5FBE", target:"Đề nghị khen thưởng", keywords:["tao ho so","new","moi"] },
  { id:"ac2", type:"action", label:"Kiểm tra SLA vi phạm",         sublabel:"Mở SLA Monitor",         icon:Activity, color:"#c8102e", target:"SLA Monitor", keywords:["sla","vi pham"] },
  { id:"ac3", type:"action", label:"Hỏi Trợ lý AI",        sublabel:"Chat AI",                icon:Sparkles, color:"#7c3aed", target:"Trợ lý AI", keywords:["hoi ai","chat"] },
  { id:"ac4", type:"action", label:"Xem thông báo chưa đọc",      sublabel:"3 thông báo mới",        icon:Bell, color:"#b45309", target:"Thông báo", keywords:["thong bao","unread"] },
  { id:"ac5", type:"action", label:"Xuất báo cáo tháng",          sublabel:"PDF / Excel / Word",     icon:FileText, color:"#166534", target:"Báo cáo tổng hợp", keywords:["xuat bao cao","export"] },
];

const ALL_ITEMS = [...ACTION_ITEMS, ...MODULE_ITEMS, ...HOSOSO_ITEMS, ...CANBO_ITEMS, ...QUYETDINH_ITEMS];

const TYPE_LABEL: Record<ItemType, string> = {
  action:     "Hành động nhanh",
  module:     "Module",
  hososo:     "Hồ sơ",
  canbo:      "Cán bộ",
  quyetdinh:  "Quyết định",
};

const TYPE_ORDER: ItemType[] = ["action", "module", "hososo", "canbo", "quyetdinh"];

/* ═══════════════════════════════════════════════════════════════
   FUZZY MATCH
═══════════════════════════════════════════════════════════════ */
function normalize(s: string) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function matches(item: PaletteItem, q: string): boolean {
  if (!q) return true;
  const nq = normalize(q);
  const haystack = [item.label, item.sublabel ?? "", ...(item.keywords ?? [])].map(normalize).join(" ");
  return nq.split(" ").every(word => haystack.includes(word));
}

/* ═══════════════════════════════════════════════════════════════
   RECENT (persisted in memory for the session)
═══════════════════════════════════════════════════════════════ */
const sessionRecent: string[] = [];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export function CommandPalette({
  open,
  onClose,
  onNavigate,
  user,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (m: string) => void;
  user: LoginUser;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) onClose(); // toggled from parent
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const filtered = query
    ? ALL_ITEMS.filter(i => matches(i, query))
    : [...ACTION_ITEMS.slice(0, 3), ...MODULE_ITEMS.slice(0, 5)];

  // Group by type
  const grouped: Partial<Record<ItemType, PaletteItem[]>> = {};
  for (const item of filtered) {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type]!.push(item);
  }

  // Flat list for keyboard nav
  const flat = TYPE_ORDER.flatMap(t => grouped[t] ?? []);

  const handleSelect = useCallback((item: PaletteItem) => {
    if (!sessionRecent.includes(item.id)) sessionRecent.unshift(item.id);
    if (sessionRecent.length > 5) sessionRecent.pop();
    if (item.target) {
      onNavigate(item.target);
    }
    onClose();
  }, [onNavigate, onClose]);

  // Arrow key nav
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === "Enter" && flat[cursor]) { handleSelect(flat[cursor]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, flat, cursor, handleSelect]);

  // Scroll cursor into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`) as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(11,20,38,0.55)", backdropFilter: "blur(4px)" }} />

      {/* Panel */}
      <div
        className="relative w-full max-w-[640px] rounded-[16px] overflow-hidden shadow-2xl"
        style={{ background: "white", border: "1px solid #e2e8f0" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e2e8f0]">
          <Search className="size-5 text-slate-700 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); }}
            placeholder="Tìm module, hồ sơ, cán bộ, quyết định���"
            className="flex-1 text-[14px] text-slate-900 outline-none placeholder:text-slate-600 bg-transparent"
            style={{ fontFamily: "var(--font-sans)" }}
          />
          <div className="flex items-center gap-1 shrink-0">
            {query && (
              <button onClick={() => setQuery("")} className="size-6 rounded flex items-center justify-center hover:bg-[#eef2f8]">
                <X className="size-3.5 text-slate-700" />
              </button>
            )}
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#e2e8f0] text-[13px] text-slate-700"
              style={{ fontFamily: "JetBrains Mono, monospace", background: "#ffffff" }}>
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[440px] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <Search className="size-8 text-slate-400" />
              <p className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
                Không tìm thấy "{query}"
              </p>
              <button onClick={() => { onNavigate("Trợ lý AI"); onClose(); }}
                className="mt-2 flex items-center gap-1.5 text-[13px] text-[#7c3aed] hover:underline"
                style={{ fontFamily: "var(--font-sans)" }}>
                <Sparkles className="size-3.5" />Hỏi Trợ lý AI về "{query}"
              </button>
            </div>
          ) : (
            TYPE_ORDER.map(type => {
              const items = grouped[type];
              if (!items || items.length === 0) return null;
              return (
                <div key={type} className="mb-1">
                  {/* Group header */}
                  <div className="px-2 py-1.5 flex items-center gap-2">
                    <span className="text-[13px] uppercase tracking-widest text-slate-600"
                      style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                      {TYPE_LABEL[type]}
                    </span>
                    <div className="flex-1 h-px bg-[#eef2f8]" />
                  </div>
                  {/* Items */}
                  {items.map(item => {
                    const idx = flat.indexOf(item);
                    const Icon = item.icon;
                    const isActive = idx === cursor;
                    return (
                      <button
                        key={item.id}
                        data-idx={idx}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setCursor(idx)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-left transition-all group"
                        style={{ background: isActive ? "#f0f4ff" : "transparent" }}
                      >
                        <div className="size-8 rounded-[8px] flex items-center justify-center shrink-0"
                          style={{ background: isActive ? `${item.color}20` : "#f4f7fb", transition: "background 0.15s" }}>
                          <Icon className="size-4" style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-slate-900 truncate"
                            style={{ fontFamily: "var(--font-sans)", fontWeight: isActive ? 600 : 500 }}>
                            {item.label}
                          </div>
                          {item.sublabel && (
                            <div className="text-[13px] text-slate-700 truncate" style={{ fontFamily: "var(--font-sans)" }}>
                              {item.sublabel}
                            </div>
                          )}
                        </div>
                        <ChevronRight className={`size-4 transition-all ${isActive ? "opacity-100 text-[#1C5FBE]" : "opacity-0"}`} />
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[#eef2f8] flex items-center gap-4" style={{ background: "#ffffff" }}>
          <div className="flex items-center gap-3 text-[13px] text-slate-600" style={{ fontFamily: "var(--font-sans)" }}>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-[#e2e8f0] bg-white" style={{ fontFamily: "JetBrains Mono, monospace" }}>↑↓</kbd>
              Điều hướng
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-[#e2e8f0] bg-white" style={{ fontFamily: "JetBrains Mono, monospace" }}>↵</kbd>
              Chọn
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-[#e2e8f0] bg-white" style={{ fontFamily: "JetBrains Mono, monospace" }}>ESC</kbd>
              Đóng
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[13px] text-slate-600">
            <Command className="size-3" />
            <span style={{ fontFamily: "var(--font-sans)" }}>K để mở bất kỳ lúc nào</span>
          </div>
        </div>
      </div>
    </div>
  );
}
