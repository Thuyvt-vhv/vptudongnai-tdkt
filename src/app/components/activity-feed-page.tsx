import { useState, useEffect, useRef } from "react";
import {
  Activity, Filter, RefreshCw, Download, Users, Award,
  Gavel, FileSignature, Megaphone, Sparkles, CheckCircle2,
  AlertTriangle, Clock, ThumbsUp, MessageSquare, Star,
  ChevronDown, X, Bell, Building2, User, ArrowRight,
  Radio, TrendingUp, Hash,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type EventKind = "submit" | "vote" | "sign" | "phong_trao" | "ai" | "sla" | "award";

interface Reaction { emoji: string; count: number; reacted: boolean; }
interface ActivityEvent {
  id: string;
  time: string;               // ISO string
  timeLabel: string;
  kind: EventKind;
  actor: string;
  actorRole: string;
  actorInitials: string;
  actorFrom: string;
  actorTo: string;
  title: string;
  body: string;
  tag?: string;
  tagColor?: string;
  important?: boolean;
  reactions: Reaction[];
  comments: number;
  donVi?: string;
}

/* ─── Mock data ─────────────────────────────────────────────── */
const MOCK_EVENTS: ActivityEvent[] = [
  {
    id:"a01", time:"2026-04-24T14:35:00", timeLabel:"14:35 hôm nay", kind:"sign",
    actor:"Nguyễn Thanh Bình", actorRole:"Phó CT UBND tỉnh", actorInitials:"NB",
    actorFrom:"#0b1426", actorTo:"#1a2744",
    title:"Ký số Quyết định khen thưởng",
    body:"QĐ-2026-0147 tặng danh hiệu CSTĐT cho Nguyễn Văn An (Sở GDĐT) đã được ký số CA hợp lệ.",
    tag:"QĐ-2026-0147", tagColor:"#166534", important:true,
    reactions:[{emoji:"✅",count:8,reacted:false},{emoji:"🎉",count:5,reacted:false},{emoji:"👍",count:12,reacted:true}],
    comments:3, donVi:"UBND tỉnh Đồng Nai",
  },
  {
    id:"a02", time:"2026-04-24T10:20:00", timeLabel:"10:20 hôm nay", kind:"vote",
    actor:"Trần Văn Bình", actorRole:"Thành viên HĐ", actorInitials:"TB",
    actorFrom:"#7c3aed", actorTo:"#5b21b6",
    title:"Bỏ phiếu thông qua hồ sơ",
    body:"Phiên HD-2026-04: Bỏ phiếu thông qua 18/20 hồ sơ đề nghị danh hiệu CSTĐCS và LĐTT cấp tỉnh.",
    tag:"HD-2026-04", tagColor:"#7c3aed",
    reactions:[{emoji:"👍",count:6,reacted:false},{emoji:"✅",count:4,reacted:false}],
    comments:1, donVi:"Hội đồng TĐKT tỉnh",
  },
  {
    id:"a03", time:"2026-04-24T09:15:00", timeLabel:"09:15 hôm nay", kind:"ai",
    actor:"Trợ lý AI", actorRole:"Trợ lý AI", actorInitials:"AI",
    actorFrom:"#7c3aed", actorTo:"#6d28d9",
    title:"AI phát hiện trùng lặp",
    body:"NS-2026-0152 có 89% độ tương đồng với NS-2025-0234 (đã được trao CSTĐCS năm 2025). Cần kiểm tra lại điều kiện 2 năm liên tiếp.",
    tag:"Cảnh báo AI", tagColor:"#b45309", important:true,
    reactions:[{emoji:"⚠️",count:3,reacted:false},{emoji:"👁️",count:7,reacted:true}],
    comments:5, donVi:"Hệ thống AI",
  },
  {
    id:"a04", time:"2026-04-23T16:50:00", timeLabel:"16:50 hôm qua", kind:"submit",
    actor:"Lê Hồng Vân", actorRole:"Chuyên viên ĐV", actorInitials:"LV",
    actorFrom:"#166534", actorTo:"#14532d",
    title:"Nộp hồ sơ lên Hội đồng",
    body:"NS-2026-0153 của Vũ Đức Khoa (CSTĐCS – Sở TN&MT) đã được nộp đầy đủ 6 tài liệu đính kèm.",
    tag:"NS-2026-0153", tagColor:"#1C5FBE",
    reactions:[{emoji:"👍",count:2,reacted:false}],
    comments:0, donVi:"Sở TN&MT",
  },
  {
    id:"a05", time:"2026-04-23T14:00:00", timeLabel:"14:00 hôm qua", kind:"phong_trao",
    actor:"Nguyễn Văn Lộc", actorRole:"Trưởng phòng TĐKT", actorInitials:"NL",
    actorFrom:"#8a6400", actorTo:"#b45309",
    title:"Phát động Phong trào 'Đổi mới sáng tạo 2026'",
    body:"Phong trào thi đua 2026–2027 chính thức được phát động với 24 đơn vị đăng ký. Thời hạn đăng ký kết quả: 30/11/2026.",
    tag:"PT-2026-02", tagColor:"#8a6400",
    reactions:[{emoji:"🚀",count:15,reacted:true},{emoji:"👍",count:22,reacted:false},{emoji:"🎉",count:8,reacted:false}],
    comments:7, donVi:"Sở Nội vụ",
  },
  {
    id:"a06", time:"2026-04-23T11:30:00", timeLabel:"11:30 hôm qua", kind:"sla",
    actor:"Hệ thống SLA", actorRole:"Monitor tự động", actorInitials:"SL",
    actorFrom:"#c8102e", actorTo:"#9b1c1c",
    title:"⚠ Vi phạm SLA nghiêm trọng",
    body:"NS-2026-0147 vượt deadline ký số 0 ngày. Đã escalate lên Lãnh đạo và gửi cảnh báo SMS.",
    tag:"SLA Khẩn", tagColor:"#c8102e", important:true,
    reactions:[{emoji:"⚠️",count:4,reacted:false}],
    comments:2, donVi:"Hệ thống",
  },
  {
    id:"a07", time:"2026-04-22T08:30:00", timeLabel:"08:30 Thứ Tư", kind:"award",
    actor:"Hội đồng TĐKT tỉnh", actorRole:"Ban Thư ký HĐ", actorInitials:"HĐ",
    actorFrom:"#1C5FBE", actorTo:"#1752a8",
    title:"Ban hành Quyết định khen thưởng tập thể",
    body:"QĐ-2026-0140: Tặng cờ thi đua của UBND tỉnh cho Trường THPT Nguyễn Đình Chiểu — đơn vị dẫn đầu phong trào giáo dục năm 2025.",
    tag:"QĐ-2026-0140", tagColor:"#8a6400",
    reactions:[{emoji:"🎊",count:28,reacted:false},{emoji:"🏆",count:16,reacted:true},{emoji:"👏",count:34,reacted:false}],
    comments:12, donVi:"UBND tỉnh",
  },
  {
    id:"a08", time:"2026-04-21T15:45:00", timeLabel:"15:45 Thứ Ba", kind:"submit",
    actor:"Phạm Văn Hoàng", actorRole:"Cán bộ", actorInitials:"PH",
    actorFrom:"#1C5FBE", actorTo:"#7c3aed",
    title:"Tạo hồ sơ đề nghị khen thưởng",
    body:"NS-2026-0160 của Nguyễn Đình Hùng (CSTĐCS – Sở Công Thương) vừa được khởi tạo. AI Score: 89/100.",
    tag:"NS-2026-0160", tagColor:"#1C5FBE",
    reactions:[{emoji:"👍",count:1,reacted:false}],
    comments:0, donVi:"Sở Công Thương",
  },
];

/* ─── Kind config ─────────────────────────────────────────── */
const KIND_CFG: Record<EventKind, { label: string; icon: typeof Activity; color: string; bg: string }> = {
  submit:     { label:"Nộp hồ sơ",  icon:Award,         color:"#1C5FBE", bg:"#f0f4ff" },
  vote:       { label:"Bỏ phiếu",   icon:Gavel,         color:"#7c3aed", bg:"#faf5ff" },
  sign:       { label:"Ký số",      icon:FileSignature, color:"#166534", bg:"#dcfce7" },
  phong_trao: { label:"Phong trào", icon:Megaphone,     color:"#8a6400", bg:"#fdf9ec" },
  ai:         { label:"AI",         icon:Sparkles,      color:"#7c3aed", bg:"#f5f3ff" },
  sla:        { label:"SLA",        icon:AlertTriangle, color:"#c8102e", bg:"#fff1f0" },
  award:      { label:"Ban hành QĐ",icon:Star,          color:"#8a6400", bg:"#fdf9ec" },
};

/* ═══════════════════════════════════════════════════════════════
   EVENT CARD
═══════════════════════════════════════════════════════════════ */
function EventCard({ ev, onReact }: { ev: ActivityEvent; onReact: (id: string, emoji: string) => void }) {
  const cfg = KIND_CFG[ev.kind];
  const Icon = cfg.icon;

  return (
    <div className="flex gap-4 relative group">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-0 shrink-0">
        <div className="size-10 rounded-full flex items-center justify-center text-white text-[13px] z-10"
          style={{ background: `linear-gradient(135deg,${ev.actorFrom},${ev.actorTo})`, fontFamily: "var(--font-sans)", fontWeight: 700, boxShadow: "0 0 0 3px white" }}>
          {ev.actorInitials}
        </div>
        <div className="w-px flex-1 mt-1" style={{ background: "#e2e8f0", minHeight: 24 }} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{ev.actor}</span>
              <span className="text-[13px] px-2 py-0.5 rounded-full bg-[#eef2f8] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>{ev.actorRole}</span>
              <div className="flex items-center gap-1 text-[13px]" style={{ background: cfg.bg, color: cfg.color, padding: "1px 8px", borderRadius: 999, fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                <Icon className="size-3" />{cfg.label}
              </div>
              {ev.important && <span className="size-2 rounded-full bg-[#c8102e] animate-pulse" />}
            </div>
            <h3 className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{ev.title}</h3>
          </div>
          <span className="text-[13px] text-[#6b5e47] shrink-0 mt-0.5" style={{ fontFamily: "JetBrains Mono,monospace" }}>{ev.timeLabel}</span>
        </div>

        {/* Body */}
        <div className="rounded-[10px] p-3.5 mb-3"
          style={{ background: ev.important ? "#fff9f9" : "#ffffff", border: `1px solid ${ev.important ? "#fca5a5" : "#e2e8f0"}` }}>
          <p className="text-[13px] text-[#5a5040] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>{ev.body}</p>
          {ev.tag && (
            <div className="flex items-center gap-2 mt-2">
              {ev.donVi && <span className="flex items-center gap-1 text-[13px] text-[#635647]"><Building2 className="size-3"/>{ev.donVi}</span>}
              <code className="text-[13px] px-2 py-0.5 rounded"
                style={{ background: `${ev.tagColor}15`, color: ev.tagColor, fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}>
                {ev.tag}
              </code>
            </div>
          )}
        </div>

        {/* Reactions + actions */}
        <div className="flex items-center gap-3">
          {/* Reactions */}
          <div className="flex items-center gap-1.5">
            {ev.reactions.map(r => (
              <button key={r.emoji} onClick={() => onReact(ev.id, r.emoji)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[13px] transition-all hover:scale-110"
                style={{
                  background: r.reacted ? "#f0f4ff" : "#f4f7fb",
                  border: `1px solid ${r.reacted ? "#bfdbfe" : "#e2e8f0"}`,
                  fontFamily: "JetBrains Mono,monospace",
                }}>
                {r.emoji}
                <span className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>{r.count}</span>
              </button>
            ))}
            <button className="flex items-center gap-1 px-2 py-1 rounded-full text-[13px] text-[#635647] hover:text-[#1C5FBE] hover:bg-[#f0f4ff] transition-all"
              style={{ border: "1px solid #e2e8f0" }}>
              + Thêm
            </button>
          </div>
          {/* Comment */}
          <button className="flex items-center gap-1 text-[13px] text-[#635647] hover:text-[#1C5FBE] transition-colors ml-2">
            <MessageSquare className="size-3.5" />
            {ev.comments > 0 ? `${ev.comments} bình luận` : "Bình luận"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function ActivityFeedPage({ user }: { user: LoginUser }) {
  const [events, setEvents]     = useState<ActivityEvent[]>(MOCK_EVENTS);
  const [filterKind, setFilterKind] = useState<EventKind | "all">("all");
  const [filterUnit, setFilterUnit] = useState("all");
  const [isLive, setIsLive]     = useState(true);
  const [newCount, setNewCount] = useState(0);
  const liveRef = useRef(isLive);
  liveRef.current = isLive;

  // Simulate new events
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      if (!liveRef.current) return;
      setNewCount(n => n + 1);
    }, 18000); // every 18s
    return () => clearInterval(interval);
  }, [isLive]);

  const applyNewEvents = () => {
    setNewCount(0);
    // Add a simulated new event
    const simEv: ActivityEvent = {
      id:`a-live-${Date.now()}`,
      time: new Date().toISOString(),
      timeLabel: "Vừa xong",
      kind: "submit", actor:"Hệ thống",
      actorRole:"Realtime update", actorInitials:"RT",
      actorFrom:"#1C5FBE", actorTo:"#7c3aed",
      title:"Cập nhật hệ thống",
      body:"Có hoạt động mới trên hệ thống. Đây là sự kiện mô phỏng realtime.",
      tag:"Live", tagColor:"#1C5FBE",
      reactions:[{emoji:"👍",count:0,reacted:false}],
      comments:0,
    };
    setEvents(prev => [simEv, ...prev]);
  };

  const onReact = (id: string, emoji: string) => {
    setEvents(prev => prev.map(ev => ev.id !== id ? ev : {
      ...ev,
      reactions: ev.reactions.map(r => r.emoji === emoji ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted } : r),
    }));
  };

  const filteredEvents = events.filter(ev => {
    if (filterKind !== "all" && ev.kind !== filterKind) return false;
    if (filterUnit !== "all" && ev.donVi && !ev.donVi.includes(filterUnit)) return false;
    return true;
  });

  // Group by date label
  const groups: { label: string; events: ActivityEvent[] }[] = [];
  filteredEvents.forEach(ev => {
    const dateStr = ev.timeLabel.includes("hôm nay") ? "Hôm nay · 24/04/2026"
      : ev.timeLabel.includes("hôm qua")            ? "Hôm qua · 23/04/2026"
      : ev.timeLabel.includes("Thứ Tư")             ? "Thứ Tư · 22/04/2026"
      : "Thứ Ba · 21/04/2026";
    const g = groups.find(x => x.label === dateStr);
    if (g) g.events.push(ev);
    else groups.push({ label: dateStr, events: [ev] });
  });

  const units = Array.from(new Set(events.filter(e => e.donVi).map(e => e.donVi!)));

  // Stats
  const todayCount  = events.filter(e => e.timeLabel.includes("hôm nay")).length;
  const urgentCount = events.filter(e => e.kind === "sla" || e.important).length;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between shrink-0" style={{ background: "white" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Dòng thời gian Hoạt động
            </h1>
            <button onClick={() => setIsLive(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] transition-all"
              style={{
                background: isLive ? "#dcfce7" : "#eef2f8",
                color: isLive ? "#166534" : "#635647",
                fontFamily: "var(--font-sans)", fontWeight: 700,
                border: `1px solid ${isLive ? "#86efac" : "#e2e8f0"}`,
              }}>
              <span className={`size-2 rounded-full ${isLive ? "animate-pulse bg-[#166534]" : "bg-[#d1d5db]"}`} />
              {isLive ? "Live" : "Tạm dừng"}
            </button>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-[#635647]">
            <span><span style={{ fontWeight: 700, color: "#0b1426" }}>{todayCount}</span> hoạt động hôm nay</span>
            <span><span style={{ fontWeight: 700, color: "#c8102e" }}>{urgentCount}</span> khẩn cấp</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* New events banner */}
          {newCount > 0 && (
            <button onClick={applyNewEvents}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[13px] text-white animate-bounce"
              style={{ background: "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              <Radio className="size-3.5" />{newCount} hoạt động mới
            </button>
          )}

          {/* Kind filter */}
          <div className="flex items-center gap-1 p-1 rounded-[8px] border border-[#e2e8f0]" style={{ background: "#ffffff" }}>
            <button onClick={() => setFilterKind("all")}
              className="px-2.5 py-1.5 rounded-[6px] text-[13px] transition-all"
              style={{ background: filterKind === "all" ? "white" : "transparent", color: "#0b1426", fontFamily: "var(--font-sans)", fontWeight: filterKind === "all" ? 700 : 400 }}>
              Tất cả
            </button>
            {(Object.keys(KIND_CFG) as EventKind[]).slice(0, 5).map(k => {
              const cfg = KIND_CFG[k];
              const Icon = cfg.icon;
              return (
                <button key={k} onClick={() => setFilterKind(k)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-[13px] transition-all"
                  style={{
                    background: filterKind === k ? cfg.bg : "transparent",
                    color: filterKind === k ? cfg.color : "#635647",
                    fontFamily: "var(--font-sans)", fontWeight: filterKind === k ? 700 : 400,
                  }}>
                  <Icon className="size-3" />{cfg.label}
                </button>
              );
            })}
          </div>

          <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)}
            className="border border-[#e2e8f0] rounded-[8px] px-3 py-2 text-[13px] text-[#0b1426] bg-white outline-none focus:border-[#1C5FBE] transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}>
            <option value="all">Tất cả đơn vị</option>
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>

          <button className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border border-[#e2e8f0] text-[13px] text-[#5a5040] hover:bg-white transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}>
            <Download className="size-4" />Xuất
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {groups.map(group => (
          <div key={group.label} className="mb-6">
            {/* Date divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-[#e2e8f0]" />
              <span className="text-[13px] uppercase tracking-widest text-[#6b5e47] px-3 py-1.5 rounded-full"
                style={{ background: "#ffffff", border: "1px solid #e2e8f0", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                {group.label}
              </span>
              <div className="h-px flex-1 bg-[#e2e8f0]" />
            </div>

            {/* Events */}
            <div>
              {group.events.map(ev => (
                <EventCard key={ev.id} ev={ev} onReact={onReact} />
              ))}
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Activity className="size-16 text-[#d1d5db]" />
            <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Không có hoạt động
            </h3>
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              Thử thay đổi bộ lọc để xem thêm sự kiện.
            </p>
          </div>
        )}

        {/* Load more */}
        {filteredEvents.length > 0 && (
          <div className="text-center py-4">
            <button className="px-5 py-2.5 rounded-[8px] border border-[#e2e8f0] text-[13px] text-[#5a5040] hover:bg-white transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}>
              Tải thêm hoạt động cũ hơn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
