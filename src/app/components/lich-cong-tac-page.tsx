import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Gavel, Award, Clock,
  Megaphone, Calendar, MapPin, Users, X, CheckCircle2,
  AlertTriangle, Star, Flag, Bell,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type EventType = "council" | "sla" | "ceremony" | "phong_trao" | "reminder";

interface CalEvent {
  id: string;
  date: string;           // YYYY-MM-DD
  time?: string;          // HH:MM
  title: string;
  subtitle?: string;
  type: EventType;
  location?: string;
  attendees?: number;
  allDay?: boolean;
  urgent?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   EVENT CONFIG
═══════════════════════════════════════════════════════════════ */
const EV_CFG: Record<EventType, { label: string; color: string; bg: string; border: string; icon: typeof Gavel }> = {
  council:    { label:"Phiên Hội đồng",     color:"#0b1426", bg:"#e8ecf3", border:"#c7d2e8", icon:Gavel    },
  sla:        { label:"Hạn xử lý SLA",      color:"#c8102e", bg:"#fff1f0", border:"#fca5a5", icon:Clock    },
  ceremony:   { label:"Lễ khen thưởng",     color:"#8a6400", bg:"#fdf9ec", border:"#fde68a", icon:Award    },
  phong_trao: { label:"Phong trào thi đua", color:"#166534", bg:"#dcfce7", border:"#86efac", icon:Megaphone},
  reminder:   { label:"Nhắc nhở",           color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe", icon:Bell     },
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA — April/May 2026
═══════════════════════════════════════════════════════════════ */
const EVENTS: CalEvent[] = [
  // April
  { id:"e1",  date:"2026-04-07", time:"09:00", title:"Phiên HD-2026-03",               subtitle:"Xét duyệt 12 hồ sơ CSTĐCS",           type:"council",    location:"Phòng họp A – UBND tỉnh", attendees:11 },
  { id:"e2",  date:"2026-04-15", time:"08:30", title:"Lễ trao Bằng khen UBND tỉnh",   subtitle:"Q1/2026 – 34 cá nhân, 8 tập thể",    type:"ceremony",   location:"Hội trường lớn – Tỉnh ủy",  attendees:200 },
  { id:"e3",  date:"2026-04-18",              title:"Hạn nộp hồ sơ Vòng 1",           subtitle:"Đợt CSTĐT/CSTĐCS năm 2026",          type:"sla",        allDay:true, urgent:true },
  { id:"e4",  date:"2026-04-22", time:"14:00", title:"Phát động Phong trào Đổi mới",  subtitle:"Năm chủ đề 2026–2027",                type:"phong_trao", location:"Hội trường B – Sở Nội vụ", attendees:80 },
  { id:"e5",  date:"2026-04-25", time:"10:00", title:"Họp chuẩn bị Phiên HD-2026-04", subtitle:"Thư ký HĐ + Ban Tổ chức",            type:"council",    location:"Phòng họp A", attendees:5 },
  { id:"e6",  date:"2026-04-28",              title:"Hạn ký số hồ sơ NS-2026-0147",  subtitle:"CSTĐT Nguyễn Văn An – Quá hạn",      type:"sla",        allDay:true, urgent:true },
  { id:"e7",  date:"2026-04-30", time:"09:30", title:"Nhắc: Hoàn thiện biên bản HD-2026-03", subtitle:"Gửi Sở Nội vụ trước 30/04",  type:"reminder" },

  // May
  { id:"e8",  date:"2026-05-05", time:"08:00", title:"Phiên HD-2026-04 (chính thức)", subtitle:"Xét duyệt 18 hồ sơ vòng cuối",       type:"council",    location:"Phòng họp A – UBND tỉnh", attendees:11 },
  { id:"e9",  date:"2026-05-08",              title:"Hạn thẩm định hồ sơ vòng 2",   subtitle:"13 hồ sơ phải hoàn thành",            type:"sla",        allDay:true, urgent:true },
  { id:"e10", date:"2026-05-15", time:"08:30", title:"Tổng kết Phong trào 2025",     subtitle:"Báo cáo kết quả thi đua toàn tỉnh",   type:"phong_trao", location:"Hội trường lớn", attendees:150 },
  { id:"e11", date:"2026-05-19", time:"15:00", title:"Lễ trao Huân chương Lao động", subtitle:"8 cá nhân đạt HCL các hạng",          type:"ceremony",   location:"Nhà hát tỉnh", attendees:500 },
  { id:"e12", date:"2026-05-22", time:"09:00", title:"Họp sơ kết TĐKT Q1-Q2/2026",  subtitle:"14 đơn vị báo cáo kết quả",           type:"council",    location:"Hội trường B", attendees:30 },
  { id:"e13", date:"2026-05-31",              title:"Hạn nộp báo cáo TĐKT H1/2026", subtitle:"Tất cả đơn vị phải gửi về UBND",      type:"sla",        allDay:true },
  { id:"e14", date:"2026-05-07",              title:"Nhắc: Hội đồng họp 28/04",     subtitle:"Kiểm tra danh sách tham dự",          type:"reminder" },
  { id:"e15", date:"2026-05-12", time:"14:00", title:"Phát động Phong trào Tháng 5", subtitle:"Chào mừng ngày 19/5",                 type:"phong_trao", location:"Công viên văn hóa", attendees:300 },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const MONTH_NAMES = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const DAY_NAMES   = ["CN","T2","T3","T4","T5","T6","T7"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function pad2(n: number) { return String(n).padStart(2, "0"); }
function toKey(y: number, m: number, d: number) { return `${y}-${pad2(m+1)}-${pad2(d)}`; }

/* ═══════════════════════════════════════════════════════════════
   EVENT PILL (compact for calendar cell)
═══════════════════════════════════════════════════════════════ */
function EventPill({ ev, onClick }: { ev: CalEvent; onClick: () => void }) {
  const cfg = EV_CFG[ev.type];
  return (
    <button onClick={onClick} className="w-full text-left px-1.5 py-0.5 rounded text-[13px] truncate transition-all hover:opacity-80"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: "var(--font-sans)", fontWeight: 600, lineHeight: "1.4" }}>
      {ev.urgent && "⚠ "}{ev.time && `${ev.time} · `}{ev.title}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EVENT DETAIL POPOVER
═══════════════════════════════════════════════════════════════ */
function EventDetail({ ev, onClose }: { ev: CalEvent; onClose: () => void }) {
  const cfg = EV_CFG[ev.type];
  const Icon = cfg.icon;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(11,20,38,0.35)", backdropFilter: "blur(2px)" }}/>
      <div className="relative rounded-[14px] border shadow-2xl overflow-hidden w-[400px]"
        style={{ background: "white", borderColor: "#e2e8f0" }} onClick={e => e.stopPropagation()}>
        {/* Colored top bar */}
        <div className="h-2" style={{ background: cfg.color }}/>
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-[8px] flex items-center justify-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <Icon className="size-5" style={{ color: cfg.color }}/>
              </div>
              <div>
                <span className="text-[13px] uppercase tracking-wider" style={{ color: cfg.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>{cfg.label}</span>
                {ev.urgent && <span className="ml-2 text-[13px] px-1.5 py-0.5 rounded" style={{ background: "#fff1f0", color: "#c8102e", fontFamily: "var(--font-sans)", fontWeight: 700 }}>KHẨN</span>}
              </div>
            </div>
            <button onClick={onClose} className="size-7 rounded flex items-center justify-center hover:bg-[#f4f7fb]">
              <X className="size-4 text-[#635647]"/>
            </button>
          </div>
          <h3 className="text-[14px] text-[#0b1426] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{ev.title}</h3>
          {ev.subtitle && <p className="text-[13px] text-[#5a5040] mb-3" style={{ fontFamily: "var(--font-sans)" }}>{ev.subtitle}</p>}
          <div className="space-y-2 text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
            <div className="flex items-center gap-2"><Calendar className="size-3.5 text-[#635647]"/>
              {ev.date.split("-").reverse().join("/")} {ev.time && `· ${ev.time}`}{ev.allDay && " · Cả ngày"}
            </div>
            {ev.location && <div className="flex items-center gap-2"><MapPin className="size-3.5 text-[#635647]"/>{ev.location}</div>}
            {ev.attendees && <div className="flex items-center gap-2"><Users className="size-3.5 text-[#635647]"/>{ev.attendees} người tham dự</div>}
          </div>
        </div>
        <div className="px-5 py-3 border-t border-[#eef2f8] flex gap-2" style={{ background: "#ffffff" }}>
          <button className="flex-1 py-2 rounded-[7px] text-[13px] text-white" style={{ background: cfg.color, fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            Đặt nhắc nhở
          </button>
          <button onClick={onClose} className="flex-1 py-2 rounded-[7px] border border-[#e2e8f0] text-[13px] text-[#5a5040] hover:bg-white transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UPCOMING SIDEBAR
═══════════════════════════════════════════════════════════════ */
function UpcomingSidebar({ events, onSelect }: { events: CalEvent[]; onSelect: (ev: CalEvent) => void }) {
  const today = new Date();
  const upcoming = events
    .filter(ev => new Date(ev.date) >= today)
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="w-72 shrink-0 border-l border-[#e2e8f0] flex flex-col" style={{ background: "#ffffff" }}>
      <div className="px-4 py-4 border-b border-[#e2e8f0]">
        <h3 className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Sự kiện sắp tới</h3>
        <p className="text-[13px] text-[#635647] mt-0.5">{upcoming.length} sự kiện</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {upcoming.map(ev => {
          const cfg = EV_CFG[ev.type];
          const Icon = cfg.icon;
          const d = new Date(ev.date);
          const dayNum = d.getDate();
          const mon = MONTH_NAMES[d.getMonth()];
          return (
            <button key={ev.id} onClick={() => onSelect(ev)}
              className="w-full flex gap-3 p-2.5 rounded-[8px] text-left hover:shadow-md transition-all"
              style={{ background: "white", border: `1px solid ${cfg.border}` }}>
              <div className="size-10 rounded-[7px] flex flex-col items-center justify-center shrink-0"
                style={{ background: cfg.bg }}>
                <span className="text-[14px] leading-none" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: cfg.color }}>{dayNum}</span>
                <span className="text-[13px] uppercase" style={{ color: cfg.color, fontFamily: "var(--font-sans)", fontWeight: 600 }}>{mon.replace("Tháng ","T")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon className="size-3 shrink-0" style={{ color: cfg.color }}/>
                  {ev.urgent && <span className="size-1.5 rounded-full bg-[#c8102e]"/>}
                </div>
                <div className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{ev.title}</div>
                {ev.time && <div className="text-[13px] text-[#635647]" style={{ fontFamily: "JetBrains Mono, monospace" }}>{ev.time}</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function LichCongTacPage({ user }: { user: LoginUser }) {
  const today = new Date();
  const [year,  setYear]  = useState(2026);
  const [month, setMonth] = useState(3); // 0-indexed → April
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const [filterType, setFilterType] = useState<EventType | "all">("all");

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month); // 0=Sun

  // Build cell grid (leading empty cells + day cells)
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const filteredEvents = filterType === "all" ? EVENTS : EVENTS.filter(e => e.type === filterType);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const todayKey = `${today.getFullYear()}-${pad2(today.getMonth()+1)}-${pad2(today.getDate())}`;

  // Stats
  const monthEvents = EVENTS.filter(ev => ev.date.startsWith(`${year}-${pad2(month+1)}`));
  const urgentCount = monthEvents.filter(ev => ev.urgent).length;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>
      {/* ── Header ── */}
      <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between shrink-0" style={{ background: "white" }}>
        <div>
          <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Lịch công tác & Sự kiện</h1>
          <p className="text-[13px] text-[#635647] mt-0.5">
            {monthEvents.length} sự kiện trong tháng{urgentCount > 0 && ` · ${urgentCount} khẩn cấp`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Type filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-[10px] border border-[#e2e8f0]" style={{ background: "#ffffff" }}>
            <button onClick={() => setFilterType("all")}
              className="px-3 py-1.5 rounded-[7px] text-[13px] transition-all"
              style={{ background: filterType === "all" ? "white" : "transparent", color: filterType === "all" ? "#0b1426" : "#635647", fontFamily: "var(--font-sans)", fontWeight: filterType === "all" ? 700 : 400, boxShadow: filterType === "all" ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              Tất cả
            </button>
            {(Object.keys(EV_CFG) as EventType[]).map(t => {
              const cfg = EV_CFG[t];
              const active = filterType === t;
              return (
                <button key={t} onClick={() => setFilterType(t)}
                  className="px-3 py-1.5 rounded-[7px] text-[13px] transition-all"
                  style={{ background: active ? cfg.bg : "transparent", color: active ? cfg.color : "#635647", fontFamily: "var(--font-sans)", fontWeight: active ? 700 : 400 }}>
                  {cfg.label.split(" ")[0]}
                </button>
              );
            })}
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-[8px] text-[13px] text-white"
            style={{ background: "linear-gradient(135deg,#1C5FBE,#1752a8)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            <Plus className="size-4"/>Thêm sự kiện
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Calendar ── */}
        <div className="flex-1 flex flex-col overflow-hidden p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="size-9 rounded-[8px] border border-[#e2e8f0] flex items-center justify-center hover:bg-white transition-colors">
                <ChevronLeft className="size-4 text-[#5a5040]"/>
              </button>
              <h2 className="text-[18px] text-[#0b1426] min-w-[200px] text-center" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                {MONTH_NAMES[month]} {year}
              </h2>
              <button onClick={nextMonth} className="size-9 rounded-[8px] border border-[#e2e8f0] flex items-center justify-center hover:bg-white transition-colors">
                <ChevronRight className="size-4 text-[#5a5040]"/>
              </button>
            </div>
            <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
              className="px-3 py-1.5 rounded-[7px] border border-[#e2e8f0] text-[13px] text-[#5a5040] hover:bg-white transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}>
              Hôm nay
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            {(Object.keys(EV_CFG) as EventType[]).map(t => {
              const cfg = EV_CFG[t];
              return (
                <div key={t} className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full" style={{ background: cfg.color }}/>
                  <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{cfg.label}</span>
                </div>
              );
            })}
          </div>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[13px] uppercase tracking-wider py-1.5"
                style={{ color: d === "CN" ? "#c8102e" : "#635647", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {cells.map((day, ci) => {
              if (day === null) return <div key={`empty-${ci}`} className="rounded-[8px] min-h-[90px]" style={{ background: "#f4f7fb" }}/>;
              const dateKey = toKey(year, month, day);
              const dayEvents = filteredEvents.filter(ev => ev.date === dateKey);
              const isToday   = dateKey === todayKey;
              const isSunday  = (firstDayOfMonth + day - 1) % 7 === 0;
              const hasSLA    = dayEvents.some(ev => ev.type === "sla" && ev.urgent);
              return (
                <div key={dateKey}
                  className="rounded-[8px] p-1.5 flex flex-col gap-1 transition-all hover:shadow-sm"
                  style={{
                    background: isToday ? "#f0f4ff" : "white",
                    border: `1.5px solid ${isToday ? "#bfdbfe" : "#eef2f8"}`,
                    minHeight: 90,
                  }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`size-6 rounded-full flex items-center justify-center text-[13px] ${isToday ? "text-white" : isSunday ? "text-[#c8102e]" : "text-[#5a5040]"}`}
                      style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: isToday ? 700 : 500, background: isToday ? "#1C5FBE" : "transparent" }}>
                      {day}
                    </span>
                    {hasSLA && <AlertTriangle className="size-3 text-[#c8102e]"/>}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0,2).map(ev => (
                      <EventPill key={ev.id} ev={ev} onClick={() => setSelected(ev)}/>
                    ))}
                    {dayEvents.length > 2 && (
                      <button className="text-[13px] text-[#635647] hover:text-[#1C5FBE] text-left pl-1"
                        style={{ fontFamily: "var(--font-sans)" }}>
                        +{dayEvents.length - 2} thêm
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Upcoming sidebar ── */}
        <UpcomingSidebar events={filteredEvents} onSelect={setSelected}/>
      </div>

      {/* Event detail modal */}
      {selected && <EventDetail ev={selected} onClose={() => setSelected(null)}/>}
    </div>
  );
}
