import { useState, useEffect } from "react";
import {
  Bell, Clock, FileSignature, Award, AlertTriangle, Sparkles,
  CheckCircle2, X, Filter, Eye, ChevronRight, Trash2,
  RefreshCw, Settings, ArrowRight, Zap, Shield, Building2,
  Users, BarChart2, Star, Flag, Archive, Search,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type NotifType = "sla" | "approval" | "submit" | "ai" | "system" | "result";
type NotifPriority = "urgent" | "high" | "normal" | "low";

interface Notif {
  id: string;
  type: NotifType;
  priority: NotifPriority;
  title: string;
  body: string;
  time: string;
  timestamp: number; // ms ago for sorting
  read: boolean;
  action?: { label: string; target: string };
  meta?: string; // e.g. hồ sơ number
}

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const ALL_NOTIFS_BY_ROLE: Record<string, Notif[]> = {
  "lãnh đạo cấp cao": [
    { id:"l1", type:"sla", priority:"urgent", title:"SLA khẩn cấp: NS-2026-0147", body:"Hồ sơ CSTĐT Nguyễn Văn An đã vượt hạn ký số. SLA vi phạm: 0 ngày còn lại. Cần ký ngay để tránh escalate lên cấp trên.", time:"5 phút trước", timestamp:5*60*1000, read:false, meta:"NS-2026-0147", action:{ label:"Ký số ngay", target:"Ký số & Phê duyệt" } },
    { id:"l2", type:"sla", priority:"urgent", title:"SLA sắp trễ: NS-2026-0142", body:"Bằng khen UBND Tỉnh – Trần Thị Bích còn 1 ngày ký số. Hạn chót: 25/04/2026.", time:"18 phút trước", timestamp:18*60*1000, read:false, meta:"NS-2026-0142", action:{ label:"Xem hồ sơ", target:"Ký số & Phê duyệt" } },
    { id:"l3", type:"approval", priority:"high", title:"8 hồ sơ chờ ký số trong inbox", body:"Trong đó: 3 hồ sơ Huân chương, 2 CSTĐT, 3 Bằng khen UBND. Tổng giá trị phê duyệt: 8 quyết định.", time:"1 giờ trước", timestamp:60*60*1000, read:false, action:{ label:"Vào ký số", target:"Ký số & Phê duyệt" } },
    { id:"l4", type:"submit", priority:"normal", title:"Hội đồng HD-2026-03 kết thúc phiên", body:"Biên bản phiên họp ngày 22/04/2026 đã sẵn sàng. Danh sách 12 cá nhân được đề nghị khen thưởng.", time:"2 giờ trước", timestamp:2*60*60*1000, read:true, action:{ label:"Xem biên bản", target:"Hội đồng xét duyệt" } },
    { id:"l5", type:"ai", priority:"normal", title:"AI: 3 hồ sơ ưu tiên đề nghị HuânC LĐ hạng Ba", body:"Trợ lý AI Tố Nga đã phân tích và gợi ý 3 cá nhân đủ điều kiện đề nghị Huân chương Lao động hạng Ba trong kỳ xét năm 2026.", time:"5 giờ trước", timestamp:5*60*60*1000, read:true, action:{ label:"Xem gợi ý AI", target:"Trợ lý AI Tố Nga" } },
    { id:"l6", type:"system", priority:"low", title:"Báo cáo tháng 4/2026 đã tạo tự động", body:"Hệ thống đã tự động tổng hợp báo cáo TĐKT tháng 4. Tỷ lệ SLA đạt: 97.2%. Hồ sơ xử lý: 124.", time:"1 ngày trước", timestamp:24*60*60*1000, read:true },
  ],
  "hội đồng": [
    { id:"c1", type:"sla", priority:"urgent", title:"SLA thẩm định: 3 hồ sơ sắp trễ", body:"NS-2026-0153, NS-2026-0155, NS-2026-0158 đều đến hạn thẩm định trong 24h tới. Hội đồng cần hoàn thành đánh giá.", time:"10 phút trước", timestamp:10*60*1000, read:false, action:{ label:"Vào thẩm định", target:"Chấm điểm & Bình xét" } },
    { id:"c2", type:"submit", priority:"high", title:"Hồ sơ mới: NS-2026-0153 phân công cho bạn", body:"CSTĐCS Vũ Đức Khoa (Sở TN&MT) đã được phân công cho bạn thẩm định. Deadline: 27/04/2026.", time:"45 phút trước", timestamp:45*60*1000, read:false, meta:"NS-2026-0153", action:{ label:"Mở hồ sơ", target:"Chấm điểm & Bình xét" } },
    { id:"c3", type:"ai", priority:"high", title:"AI phát hiện trùng lặp 89%: NS-2026-0152", body:"Hồ sơ NS-2026-0152 tương đồng 89% với NS-2025-0234 đã được duyệt năm ngoái. Cần đối chiếu thủ công.", time:"1 giờ trước", timestamp:60*60*1000, read:false, meta:"NS-2026-0152", action:{ label:"Đối chiếu ngay", target:"Đề nghị khen thưởng" } },
    { id:"c4", type:"system", priority:"normal", title:"Phiên họp HD-2026-04 ngày 28/04", body:"Lịch họp: 28/04/2026 lúc 9:00 tại Phòng Họp A, Tầng 3. Nội dung: Xét duyệt 15 hồ sơ Huân chương. Xác nhận tham dự trước 26/04.", time:"3 giờ trước", timestamp:3*60*60*1000, read:false, action:{ label:"Xác nhận tham dự", target:"Hội đồng xét duyệt" } },
    { id:"c5", type:"result", priority:"normal", title:"Kết quả bỏ phiếu NS-2026-0141 thông qua", body:"Bằng khen UBND Tỉnh – Lê Văn Minh: 7/9 phiếu đồng ý. Đã gửi kết quả lên lãnh đạo ký duyệt.", time:"6 giờ trước", timestamp:6*60*60*1000, read:true },
  ],
  "lãnh đạo đơn vị": [
    { id:"m1", type:"submit", priority:"high", title:"NS-2026-0150 được HĐ tiếp nhận", body:"Hồ sơ CSTĐCS Nguyễn Hoàng Nam của đơn vị đã được Hội đồng tiếp nhận và phân công thẩm định. Dự kiến kết quả: 30/04/2026.", time:"30 phút trước", timestamp:30*60*1000, read:false, meta:"NS-2026-0150", action:{ label:"Theo dõi hồ sơ", target:"Đề nghị khen thưởng" } },
    { id:"m2", type:"ai", priority:"high", title:"AI gợi ý: 3 cán bộ đủ ĐK CSTĐCS 2026", body:"Lê Thị Hoa, Trần Văn Bình, Nguyễn Minh Quang đều đủ điều kiện đề nghị CSTĐCS năm 2026. Xem chi tiết và bắt đầu làm hồ sơ.", time:"2 giờ trước", timestamp:2*60*60*1000, read:false, action:{ label:"Xem gợi ý", target:"Hồ sơ cán bộ" } },
    { id:"m3", type:"approval", priority:"normal", title:"Yêu cầu bổ sung hồ sơ: NS-2026-0145", body:"Hội đồng yêu cầu bổ sung minh chứng thành tích công trình NCKH. Hạn bổ sung: 28/04/2026.", time:"5 giờ trước", timestamp:5*60*60*1000, read:false, meta:"NS-2026-0145", action:{ label:"Bổ sung hồ sơ", target:"Đề nghị khen thưởng" } },
    { id:"m4", type:"system", priority:"low", title:"Bảng xếp hạng đơn vị cập nhật", body:"Đơn vị bạn đứng thứ 3/18 trong bảng xếp hạng phong trào Lao động giỏi 2026. Tiếp tục duy trì!", time:"1 ngày trước", timestamp:24*60*60*1000, read:true, action:{ label:"Xem bảng XH", target:"Bảng xếp hạng" } },
  ],
  "cá nhân": [
    { id:"u1", type:"submit", priority:"high", title:"Hồ sơ NS-2026-0148 tiến một bước", body:"Hồ sơ của bạn vừa được Hội đồng hoàn thành thẩm định. Kết quả bỏ phiếu đang diễn ra.", time:"1 giờ trước", timestamp:60*60*1000, read:false, meta:"NS-2026-0148", action:{ label:"Theo dõi tiến độ", target:"Đề nghị khen thưởng" } },
    { id:"u2", type:"system", priority:"normal", title:"Dự kiến kết quả hồ sơ", body:"Hồ sơ CSTĐCS của bạn dự kiến có kết quả chính thức vào ngày 15/05/2026. Hệ thống sẽ thông báo ngay khi có quyết định.", time:"1 ngày trước", timestamp:24*60*60*1000, read:true },
    { id:"u3", type:"ai", priority:"low", title:"Trợ lý AI nhắc: cập nhật tiến độ thi đua", body:"Bạn chưa cập nhật tiến độ phong trào Lao động giỏi 2026 trong 15 ngày. Hãy cập nhật để giữ điểm.", time:"2 ngày trước", timestamp:48*60*60*1000, read:true, action:{ label:"Cập nhật tiến độ", target:"Phong trào thi đua" } },
  ],
  "quản trị hệ thống": [
    { id:"a1", type:"sla", priority:"urgent", title:"⚠ 2 vi phạm SLA nghiêm trọng", body:"NS-2026-0147 (Lãnh đạo chưa ký 2 ngày) và NS-2026-0142 (1 ngày) đã escalate. Cần xử lý ngay hoặc gửi cảnh báo tự động.", time:"5 phút trước", timestamp:5*60*1000, read:false, action:{ label:"Vào SLA Monitor", target:"SLA Monitor" } },
    { id:"a2", type:"system", priority:"urgent", title:"🔒 Cảnh báo bảo mật", body:"5 lần đăng nhập thất bại liên tiếp từ IP: 203.0.1.55 (VN). Hệ thống đã tạm khóa IP này. Kiểm tra audit log.", time:"2 giờ trước", timestamp:2*60*60*1000, read:false, action:{ label:"Xem Audit Log", target:"Audit Log" } },
    { id:"a3", type:"system", priority:"high", title:"Rate limit: 247 req/min từ IP nghi ngờ", body:"IP: 192.168.0.45 – Hành vi scraping API phát hiện lúc 14:23. Đã chặn tự động. Rule #47 áp dụng.", time:"4 giờ trước", timestamp:4*60*60*1000, read:false, action:{ label:"Xem hệ thống", target:"Hệ thống" } },
    { id:"a4", type:"system", priority:"normal", title:"Backup thành công: 2.4GB", body:"Backup tự động lúc 02:00 hoàn thành. Destination: S3 Asia-Pacific Singapore. Integrity check: SHA-256 OK.", time:"7 giờ trước", timestamp:7*60*60*1000, read:true },
    { id:"a5", type:"ai", priority:"normal", title:"AI Tố Nga: 127 phiên hỏi đáp hôm nay", body:"Trợ lý AI xử lý 127 câu hỏi, độ chính xác trung bình 94.2%. Top 3 chủ đề: điều kiện khen thưởng, mẫu biểu, SLA.", time:"8 giờ trước", timestamp:8*60*60*1000, read:true },
    { id:"a6", type:"system", priority:"low", title:"Người dùng mới đăng ký: 3 tài khoản", body:"Sở TN&MT: 2 manager account. Sở NN&PTNT: 1 user account. Đang chờ phê duyệt và phân quyền.", time:"1 ngày trước", timestamp:24*60*60*1000, read:true, action:{ label:"Phân quyền", target:"Phân quyền" } },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const TYPE_CFG: Record<NotifType, { label: string; color: string; bg: string; icon: typeof Bell }> = {
  sla:      { label:"SLA",        color:"#c8102e", bg:"#fee2e2", icon:Clock         },
  approval: { label:"Phê duyệt", color:"#1C5FBE", bg:"#ddeafc", icon:FileSignature  },
  submit:   { label:"Hồ sơ",     color:"#166534", bg:"#dcfce7", icon:Award          },
  ai:       { label:"AI",         color:"#7c3aed", bg:"#f5f3ff", icon:Sparkles       },
  system:   { label:"Hệ thống",  color:"#b45309", bg:"#fef3c7", icon:AlertTriangle   },
  result:   { label:"Kết quả",   color:"#8a6400", bg:"#fdf9f0", icon:Star            },
};

const PRIORITY_CFG: Record<NotifPriority, { label: string; dot: string }> = {
  urgent: { label:"Khẩn cấp", dot:"#c8102e" },
  high:   { label:"Cao",      dot:"#b45309" },
  normal: { label:"Bình thường", dot:"#1C5FBE" },
  low:    { label:"Thấp",     dot:"#4f5d6e" },
};

function timeGroup(ts: number): string {
  if (ts < 60 * 60 * 1000) return "Vừa xong (< 1 giờ)";
  if (ts < 24 * 60 * 60 * 1000) return "Hôm nay";
  if (ts < 48 * 60 * 60 * 1000) return "Hôm qua";
  return "Cũ hơn";
}

/* ═══════════════════════════════════════════════════════════════
   NOTIF ITEM
═══════════════════════════════════════════════════════════════ */
function NotifItem({
  n, onRead, onDelete, onAction,
}: {
  n: Notif;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (target: string) => void;
}) {
  const cfg = TYPE_CFG[n.type];
  const pri = PRIORITY_CFG[n.priority];
  const Icon = cfg.icon;
  const isUrgent = n.priority === "urgent";

  return (
    <div
      className="flex gap-4 p-4 rounded-[12px] border transition-all hover:shadow-sm cursor-pointer group"
      style={{
        background: n.read ? "white" : isUrgent ? "#fff5f5" : "#fdfcf9",
        borderColor: n.read ? "#e8e2d4" : isUrgent ? "#fca5a5" : "#e8e2d4",
        borderLeftWidth: n.read ? 1 : 3,
        borderLeftColor: n.read ? "#e8e2d4" : cfg.color,
      }}
      onClick={() => !n.read && onRead(n.id)}
    >
      {/* Icon */}
      <div className="size-11 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: cfg.bg }}>
        <Icon className="size-5" style={{ color: cfg.color }} />
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[13px] text-[#0b1426]"
                style={{ fontFamily: "var(--font-sans)", fontWeight: n.read ? 500 : 700 }}>
                {n.title}
              </span>
              {!n.read && <span className="size-2 rounded-full shrink-0" style={{ background: cfg.color }} />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] px-1.5 py-0.5 rounded"
                style={{ background: cfg.bg, color: cfg.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                {cfg.label}
              </span>
              <span className="flex items-center gap-1 text-[13px]" style={{ color: pri.dot }}>
                <span className="size-1.5 rounded-full inline-block" style={{ background: pri.dot }} />
                {pri.label}
              </span>
              {n.meta && (
                <code className="text-[13px] text-[#635647]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {n.meta}
                </code>
              )}
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {!n.read && (
              <button onClick={e => { e.stopPropagation(); onRead(n.id); }}
                className="size-7 rounded-[6px] flex items-center justify-center hover:bg-[#f0ece3]" title="Đánh dấu đã đọc">
                <Eye className="size-3.5 text-[#635647]" />
              </button>
            )}
            <button onClick={e => { e.stopPropagation(); onDelete(n.id); }}
              className="size-7 rounded-[6px] flex items-center justify-center hover:bg-[#fee2e2]" title="Xóa">
              <Trash2 className="size-3.5 text-[#c8102e]" />
            </button>
          </div>
        </div>
        <p className="text-[13px] text-[#5a5040] leading-relaxed mb-2" style={{ fontFamily: "var(--font-sans)" }}>
          {n.body}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>
            {n.time}
          </span>
          {n.action && (
            <button
              onClick={e => { e.stopPropagation(); onAction(n.action!.target); }}
              className="flex items-center gap-1.5 text-[13px] transition-colors hover:underline"
              style={{ color: cfg.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {n.action.label} <ArrowRight className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function ThongBaoPage({ user, onNavigate }: { user: LoginUser; onNavigate: (s: string) => void }) {
  const [notifs, setNotifs] = useState<Notif[]>(() =>
    (ALL_NOTIFS_BY_ROLE[user.role] ?? ALL_NOTIFS_BY_ROLE["cá nhân"]).sort((a, b) => a.timestamp - b.timestamp)
  );
  const [filterType, setFilterType] = useState<NotifType | "all">("all");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");

  const unread = notifs.filter(n => !n.read).length;

  const onRead = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const onDelete = (id: string) => setNotifs(p => p.filter(n => n.id !== id));
  const markAll = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const deleteRead = () => setNotifs(p => p.filter(n => !n.read));

  const filtered = notifs.filter(n => {
    if (filterType !== "all" && n.type !== filterType) return false;
    if (filterRead === "unread" && n.read) return false;
    if (filterRead === "read" && !n.read) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.body.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by time
  const groups: Record<string, Notif[]> = {};
  for (const n of filtered) {
    const g = timeGroup(n.timestamp);
    if (!groups[g]) groups[g] = [];
    groups[g].push(n);
  }
  const groupOrder = ["Vừa xong (< 1 giờ)", "Hôm nay", "Hôm qua", "Cũ hơn"];

  // Stats
  const urgentCount = notifs.filter(n => !n.read && n.priority === "urgent").length;
  const typeCounts = Object.keys(TYPE_CFG).map(t => ({
    type: t as NotifType,
    count: notifs.filter(n => n.type === t).length,
    unread: notifs.filter(n => n.type === t && !n.read).length,
  }));

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#faf7f2", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e8e2d4] shrink-0" style={{ background: "white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <Bell className="size-5 text-[#8a6400]" />
          </div>
          <div>
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Trung tâm Thông báo
            </h1>
            <p className="text-[13px] text-[#635647]">
              {unread} chưa đọc · {notifs.length} tổng · Tự động cập nhật realtime
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {urgentCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] animate-pulse"
                style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
                <Zap className="size-3.5 text-[#c8102e]" />
                <span className="text-[13px] text-[#c8102e]" style={{ fontWeight: 700 }}>{urgentCount} khẩn cấp</span>
              </div>
            )}
            {unread > 0 && (
              <button onClick={markAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#e8e2d4] text-[13px] text-[#5a5040] hover:bg-[#f5f2ec] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}>
                <CheckCircle2 className="size-3.5" />Đọc tất cả
              </button>
            )}
            {notifs.some(n => n.read) && (
              <button onClick={deleteRead}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#e8e2d4] text-[13px] text-[#635647] hover:bg-[#f5f2ec] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}>
                <Archive className="size-3.5" />Xóa đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Type stats bar */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {typeCounts.map(tc => {
            const cfg = TYPE_CFG[tc.type];
            const Icon = cfg.icon;
            return (
              <button key={tc.type} onClick={() => setFilterType(filterType === tc.type ? "all" : tc.type)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] border text-[13px] transition-all"
                style={{
                  background: filterType === tc.type ? cfg.bg : "white",
                  borderColor: filterType === tc.type ? cfg.color : "#e8e2d4",
                  color: filterType === tc.type ? cfg.color : "#5a5040",
                  fontWeight: filterType === tc.type ? 700 : 400,
                }}>
                <Icon className="size-3.5" />
                {cfg.label}
                {tc.count > 0 && (
                  <span className="px-1 rounded text-[13px]"
                    style={{ background: tc.unread > 0 ? cfg.color : "#e8e2d4", color: tc.unread > 0 ? "white" : "#635647", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
                    {tc.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + filter row */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#635647]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm trong thông báo..."
              className="w-full pl-8 pr-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none focus:border-[#1C5FBE]"
              style={{ height: 34, fontFamily: "var(--font-sans)" }} />
          </div>
          <div className="flex rounded-[6px] overflow-hidden border border-[#e8e2d4]">
            {([["all", "Tất cả"], ["unread", "Chưa đọc"], ["read", "Đã đọc"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilterRead(k)}
                className="px-3 py-1.5 text-[13px] transition-colors"
                style={{ background: filterRead === k ? "#0b1426" : "white", color: filterRead === k ? "white" : "#5a5040", fontFamily: "var(--font-sans)", fontWeight: filterRead === k ? 700 : 400 }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <CheckCircle2 className="size-12 text-[#d1ccc0]" />
            <p className="text-[14px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Không có thông báo nào</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {groupOrder.map(g => {
              const items = groups[g];
              if (!items || items.length === 0) return null;
              return (
                <div key={g}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[13px] uppercase tracking-widest text-[#635647]"
                      style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{g}</span>
                    <div className="flex-1 h-px" style={{ background: "#e8e2d4" }} />
                    <span className="text-[13px] text-[#6b5e47]">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(n => (
                      <NotifItem key={n.id} n={n} onRead={onRead} onDelete={onDelete} onAction={onNavigate} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#e8e2d4] flex items-center gap-2" style={{ background: "white" }}>
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-[#4ade80]" style={{ boxShadow: "0 0 6px #4ade80" }} />
          <span className="text-[13px] text-[#635647]">Kết nối realtime · Cập nhật tức thì</span>
        </div>
        <div className="ml-auto text-[13px] text-[#6b5e47]">
          {filtered.length} / {notifs.length} thông báo hiển thị
        </div>
      </div>
    </div>
  );
}
