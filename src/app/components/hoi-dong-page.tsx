import { useState, useMemo } from "react";
import {
  Gavel, Users, User, Building2, CheckCircle2, XCircle, Clock,
  AlertTriangle, Shield, ShieldAlert, ShieldCheck, Star, BarChart2,
  FileText, ChevronLeft, ChevronRight, X, Info, Scale, BookOpen,
  Check, Columns, Trophy, Lock, Unlock, MessageSquare, Send, Download,
  PenLine, ArrowUpDown, Eye, Layers, Flag, ArrowRight, Hash, Medal,
  ThumbsUp, ThumbsDown, Minus, Sparkles, Calendar, MapPin, Plus,
  AlertCircle, CheckCheck,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import type { Campaign } from "./phong-trao-page";
import { useTheme } from "./theme-context";
import { DsButton } from "./ds-button";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */
type CoiLevel   = "none" | "soft" | "hard";
type VoteChoice = "pass" | "reject" | "defer";
type SessionStatus = "upcoming" | "in_progress" | "completed" | "minutes_issued";
type NomStatus  = "pending" | "in_review" | "voted" | "passed" | "rejected" | "deferred";

interface ScoreCriteria {
  id: string; name: string; maxScore: number;
  shortName: string; canCu: string;
  color: string;
}

interface CouncilMember {
  id: string; name: string;
  title: string; donVi: string;
  isChair: boolean; isSecretary: boolean;
  present: boolean; avatarColor: string;
}

interface Nomination {
  id: string; code: string;
  tenDoiTuong: string; loai: "ca_nhan" | "tap_the";
  donVi: string; chucVu?: string;
  hinhThuc: string; capKT: string;
  tomTatThanhTich: string;
  namCongTac?: number;
  documents: string[];
  status: NomStatus;
}

interface MemberScoreEntry {
  memberId: string; nominationId: string;
  scores: Record<string, number>;
  comment: string; submittedAt: string;
  abstained: boolean; coiReason?: string;
}

interface NomDecision {
  nominationId: string;
  votes: Record<VoteChoice, string[]>; // memberId[]
  decision: "pass" | "reject" | "defer" | "pending";
  chairNote: string;
}

export interface CouncilSession {
  id: string; code: string;
  phienSo: number;
  campaignName: string; campaignId: string;
  date: string; time: string; location: string;
  status: SessionStatus;
  members: CouncilMember[];
  nominations: Nomination[];
  memberScores: MemberScoreEntry[];
  decisions: NomDecision[];
  canCuPhapLy: string[];
  ghiChu: string;
}

/* ═══════════════════════════════════════════════════════════════════
   CRITERIA CONFIG
═══════════════════════════════════════════════════════════════════ */
const CRITERIA: ScoreCriteria[] = [
  { id:"c1", name:"Hoàn thành nhiệm vụ chuyên môn",    shortName:"Chuyên môn",    maxScore:40, canCu:"Điều 10 NĐ 152/2025/NĐ-CP", color:"#1C5FBE" },
  { id:"c2", name:"Phong trào thi đua nội bộ",          shortName:"Phong trào",   maxScore:20, canCu:"Điều 12 Luật TĐKT",  color:"#0f7a3e" },
  { id:"c3", name:"Sáng kiến & cải tiến quy trình",     shortName:"Sáng kiến",    maxScore:20, canCu:"Luật TĐKT 2022",     color:"#7c3aed" },
  { id:"c4", name:"Đạo đức, lối sống, tác phong",       shortName:"Đạo đức",      maxScore:10, canCu:"Điều 20 Luật CB",    color:"#b45309" },
  { id:"c5", name:"Công tác Đảng & đoàn thể",          shortName:"Đảng, đoàn",   maxScore:10, canCu:"Quy định TW Đảng",   color:"#9f1239" },
];
const MAX_TOTAL = CRITERIA.reduce((s, c) => s + c.maxScore, 0);

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════════ */
const MEMBERS: CouncilMember[] = [
  { id:"m1", name:"Nguyễn Văn Thắng",  title:"Phó Chánh VP UBND Tỉnh (Chủ tịch HĐ)", donVi:"VP UBND Tỉnh",         isChair:true,  isSecretary:false, present:true,  avatarColor:"#1C5FBE" },
  { id:"m2", name:"Lê Hoàng Nam",      title:"Trưởng phòng TĐKT",                      donVi:"Sở Nội vụ",            isChair:false, isSecretary:false, present:true,  avatarColor:"#0f7a3e" },
  { id:"m3", name:"Võ Minh Tuấn",      title:"Chuyên viên TĐKT (Thư ký HĐ)",          donVi:"Sở Nội vụ",            isChair:false, isSecretary:true,  present:true,  avatarColor:"#7c3aed" },
  { id:"m4", name:"Phạm Thu Hiền",     title:"Đại diện Sở GD&ĐT",                     donVi:"Sở GD&ĐT",             isChair:false, isSecretary:false, present:true,  avatarColor:"#b45309" },
  { id:"m5", name:"Đại tá Trần Bình",  title:"Đại diện Công an Tỉnh",                 donVi:"Công an Tỉnh",         isChair:false, isSecretary:false, present:true,  avatarColor:"#9f1239" },
  { id:"m6", name:"Bùi Quang Minh",    title:"Đại diện Sở Y tế",                      donVi:"Sở Y tế",              isChair:false, isSecretary:false, present:true,  avatarColor:"#0e7490" },
  { id:"m7", name:"Lý Thị Lan",        title:"Đại diện Liên đoàn Lao động",           donVi:"Liên đoàn Lao động",   isChair:false, isSecretary:false, present:false, avatarColor:"#6b7280" },
];

const NOMINATIONS: Nomination[] = [
  { id:"n1", code:"HS-047", tenDoiTuong:"Lê Thị Thanh Xuân", loai:"ca_nhan", donVi:"Sở GD&ĐT", chucVu:"Phó Giám đốc", hinhThuc:"Bằng khen Chủ tịch UBND Tỉnh", capKT:"Cấp tỉnh", tomTatThanhTich:"Xuất sắc trong công tác quản lý, phát triển giáo dục toàn diện; hoàn thành 100% chỉ tiêu năm học 2025–2026. Không có khiếu nại tố cáo. Được tập thể tín nhiệm cao.", namCongTac:18, documents:["Tờ trình 45.pdf","Báo cáo thành tích.docx","Xác nhận BGH.pdf"], status:"in_review" },
  { id:"n2", code:"HS-046", tenDoiTuong:"Phòng CSGT CA Tỉnh", loai:"tap_the", donVi:"Công an Tỉnh", hinhThuc:"Cờ thi đua Chính phủ", capKT:"Cấp nhà nước", tomTatThanhTich:"Tập thể xuất sắc đảm bảo trật tự ATGT, giảm 18% tai nạn so với 2025. Xử lý nghiêm 100% vi phạm nồng độ cồn.", documents:["Tờ trình 46.pdf","Biên bản HĐ.pdf"], status:"in_review" },
  { id:"n3", code:"HS-045", tenDoiTuong:"Nguyễn Phú Trọng Khoa", loai:"ca_nhan", donVi:"BV Đa khoa Đồng Nai", chucVu:"Bác sĩ CKI", hinhThuc:"Chiến sĩ thi đua cấp Tỉnh", capKT:"Cấp tỉnh", tomTatThanhTich:"Hoàn thành xuất sắc nhiệm vụ khám chữa bệnh, đạt danh hiệu CSTĐ 5 năm liên tục. Có 2 sáng kiến được ứng dụng thực tiễn.", namCongTac:12, documents:["Tờ trình.pdf","Báo cáo.pdf","Danh hiệu CSTĐ 5 năm.pdf"], status:"in_review" },
  { id:"n4", code:"HS-044", tenDoiTuong:"Chi bộ Sở Tài chính", loai:"tap_the", donVi:"Sở Tài chính", hinhThuc:"Cờ thi đua UBND Tỉnh", capKT:"Cấp tỉnh", tomTatThanhTich:"Chi bộ trong sạch vững mạnh xuất sắc 5 năm liên tiếp; hoàn thành tốt công tác thu ngân sách.", documents:["Tờ trình 44.pdf","Biên bản Chi bộ.pdf"], status:"in_review" },
  { id:"n5", code:"HS-043", tenDoiTuong:"Trần Thị Kim Oanh", loai:"ca_nhan", donVi:"Sở GD&ĐT", chucVu:"Giáo viên THPT", hinhThuc:"Bằng khen Bộ GD&ĐT", capKT:"Cấp Bộ", tomTatThanhTich:"Giáo viên tiêu biểu, học sinh đạt giải quốc gia và quốc tế 3 năm liên tục. Có 1 sáng kiến cải tiến phương pháp giảng dạy được áp dụng toàn tỉnh.", namCongTac:15, documents:["Tờ trình.pdf","Thành tích HS.pdf"], status:"in_review" },
];

// Pre-seeded scores from other members (all except m3 = current user = Võ Minh Tuấn)
const SEED_SCORES: MemberScoreEntry[] = [
  // n1 - Lê Thị Thanh Xuân (donVi = Sở GD&ĐT → m4 has COI)
  { memberId:"m1", nominationId:"n1", scores:{c1:36,c2:17,c3:16,c4:9,c5:9}, comment:"Hồ sơ đầy đủ, thành tích rõ ràng, xứng đáng.", submittedAt:"09:15", abstained:false },
  { memberId:"m2", nominationId:"n1", scores:{c1:37,c2:18,c3:17,c4:9,c5:9}, comment:"Nhất trí tán thành. Thành tích được xác nhận nhiều nguồn.", submittedAt:"09:22", abstained:false },
  { memberId:"m4", nominationId:"n1", scores:{}, comment:"", submittedAt:"", abstained:true, coiReason:"Thành viên thuộc Sở GD&ĐT — đơn vị của người được đề nghị" },
  { memberId:"m5", nominationId:"n1", scores:{c1:35,c2:16,c3:15,c4:9,c5:9}, comment:"Đồng ý. Có thể cân nhắc phần sáng kiến.", submittedAt:"09:31", abstained:false },
  { memberId:"m6", nominationId:"n1", scores:{c1:36,c2:17,c3:16,c4:10,c5:9}, comment:"Tán thành.", submittedAt:"09:38", abstained:false },

  // n2 - Phòng CSGT CA Tỉnh (donVi = Công an Tỉnh → m5 has COI)
  { memberId:"m1", nominationId:"n2", scores:{c1:38,c2:18,c3:18,c4:10,c5:10}, comment:"Tập thể xuất sắc, số liệu giảm tai nạn ấn tượng.", submittedAt:"10:05", abstained:false },
  { memberId:"m2", nominationId:"n2", scores:{c1:37,c2:18,c3:17,c4:10,c5:9},  comment:"Nhất trí. Đây là tập thể tiêu biểu nhất phong trào.", submittedAt:"10:12", abstained:false },
  { memberId:"m4", nominationId:"n2", scores:{c1:38,c2:19,c3:17,c4:10,c5:9},  comment:"Đồng ý.", submittedAt:"10:18", abstained:false },
  { memberId:"m5", nominationId:"n2", scores:{}, comment:"", submittedAt:"", abstained:true, coiReason:"Thành viên thuộc Công an Tỉnh — đơn vị của tập thể được đề nghị" },
  { memberId:"m6", nominationId:"n2", scores:{c1:36,c2:17,c3:17,c4:10,c5:9},  comment:"Tán thành.", submittedAt:"10:25", abstained:false },

  // n3 - BV Đa khoa (no COI for any member)
  { memberId:"m1", nominationId:"n3", scores:{c1:35,c2:15,c3:17,c4:9,c5:9},  comment:"Thành tích 5 năm liên tục đáng ghi nhận.", submittedAt:"10:50", abstained:false },
  { memberId:"m2", nominationId:"n3", scores:{c1:34,c2:16,c3:16,c4:9,c5:9},  comment:"Đồng ý. Cần xem xét thêm số lượng sáng kiến.", submittedAt:"10:58", abstained:false },
  { memberId:"m4", nominationId:"n3", scores:{c1:35,c2:15,c3:17,c4:10,c5:9}, comment:"Tán thành.", submittedAt:"11:05", abstained:false },
  { memberId:"m5", nominationId:"n3", scores:{c1:33,c2:15,c3:16,c4:9,c5:9},  comment:"Nhất trí.", submittedAt:"11:12", abstained:false },
  { memberId:"m6", nominationId:"n3", scores:{c1:36,c2:16,c3:17,c4:10,c5:9}, comment:"Y tế – tôi xác nhận thành tích chuyên môn xuất sắc.", submittedAt:"11:18", abstained:false },
];

const INIT_SESSION: CouncilSession = {
  id:"HD-2026-001", code:"HD-2026-001",
  phienSo:1, campaignName:"Thi đua Chào mừng 50 năm Giải phóng miền Nam",
  campaignId:"PT-001",
  date:"2026-04-23", time:"08:30", location:"Hội trường UBND Tỉnh Đồng Nai – Phòng họp số 2",
  status:"in_progress",
  members:MEMBERS, nominations:NOMINATIONS,
  memberScores:SEED_SCORES,
  decisions:[
    { nominationId:"n2", votes:{ pass:["m1","m2","m4","m6"], reject:[], defer:[] }, decision:"pass", chairNote:"Nhất trí thông qua. Kết quả 4/4 tán thành." },
  ],
  canCuPhapLy:["Điều 56 Luật TĐKT 2022","Điều 38 NĐ 152/2025/NĐ-CP","Khoản 4 Điều 8 TT 15/2025/TT-BNV","TT 03/2018/TT-BNV"],
  ghiChu:"Phiên họp thứ nhất. Xét duyệt 5 hồ sơ.",
};

export const INIT_SESSIONS: CouncilSession[] = [INIT_SESSION];

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */
function checkCOI(member: CouncilMember, nom: Nomination): { level: CoiLevel; reason: string } {
  if (member.donVi === nom.donVi)
    return { level:"hard", reason:`Thành viên thuộc ${member.donVi} — đơn vị của người/tập thể được đề nghị` };
  if (nom.loai === "ca_nhan" && nom.tenDoiTuong.split(" ").some(w => member.name.includes(w) && w.length > 1))
    return { level:"soft", reason:"Có thể có quan hệ cá nhân với người được đề nghị" };
  return { level:"none", reason:"" };
}

function calcTotal(scores: Record<string, number>): number {
  return CRITERIA.reduce((s, c) => s + (scores[c.id] ?? 0), 0);
}

function calcAvgForNom(
  nominationId: string,
  memberScores: MemberScoreEntry[],
  members: CouncilMember[]
): { avg: number; count: number; byMember: Array<{ memberId: string; total: number; abstained: boolean }> } {
  const entries = memberScores.filter(e => e.nominationId === nominationId);
  const valid   = entries.filter(e => !e.abstained && Object.keys(e.scores).length > 0);
  const avg     = valid.length ? Math.round(valid.reduce((s, e) => s + calcTotal(e.scores), 0) / valid.length) : 0;
  const byMember = members.map(m => {
    const e = entries.find(x => x.memberId === m.id);
    return { memberId:m.id, total: e && !e.abstained ? calcTotal(e.scores) : 0, abstained: e?.abstained ?? false };
  });
  return { avg, count:valid.length, byMember };
}

function fmtDate(s: string) { const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; }
function scoreColor(pct: number) {
  if (pct >= 0.85) return "#0f7a3e";
  if (pct >= 0.70) return "#b45309";
  return "#c8102e";
}

/* ═══════════════════════════════════════════════════════════════════
   SCORE INPUT COMPONENT
═══════════════════════════════════════════════════════════════════ */
function ScoreInput({
  criterion, value, onChange, disabled,
}: { criterion: ScoreCriteria; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const pct = value / criterion.maxScore;
  const col = scoreColor(pct);
  return (
    <div className={`rounded-[8px] border p-3 transition-all ${disabled ? "opacity-50" : ""}`}
      style={{ borderColor: value > 0 ? criterion.color + "40" : "var(--color-line)", background:"#fff" }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[13px] text-[#0b1426]"
            style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>{criterion.name}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <BookOpen className="size-2.5 text-[#635647]" />
            <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              {criterion.canCu}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            disabled={disabled || value <= 0}
            onClick={() => onChange(Math.max(0, value - 1))}
            className="size-6 rounded border flex items-center justify-center transition-colors hover:bg-[#eef2f8] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor:"var(--color-line)" }}>
            <span className="text-[14px] leading-none text-[#4a5568]">−</span>
          </button>
          <input
            type="number" min={0} max={criterion.maxScore}
            disabled={disabled}
            value={value}
            onChange={e => {
              const v = Math.min(criterion.maxScore, Math.max(0, Number(e.target.value) || 0));
              onChange(v);
            }}
            className="w-12 h-7 text-center rounded border text-[14px] outline-none"
            style={{
              borderColor: value > 0 ? criterion.color : "var(--color-line)",
              fontFamily: "var(--font-sans)", fontWeight:700, color:col,
              background:"#fafafa",
            }}
          />
          <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>/{criterion.maxScore}</span>
          <button
            disabled={disabled || value >= criterion.maxScore}
            onClick={() => onChange(Math.min(criterion.maxScore, value + 1))}
            className="size-6 rounded border flex items-center justify-center transition-colors hover:bg-[#eef2f8] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor:"var(--color-line)" }}>
            <span className="text-[14px] leading-none text-[#4a5568]">+</span>
          </button>
        </div>
      </div>
      {/* Progress */}
      <div className="h-1.5 rounded-full bg-[#eef2f8] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width:`${pct*100}%`, background:criterion.color }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MEMBER AVATAR
═══════════════════════════════════════════════════════════════════ */
function Avatar({ m, size=32 }: { m: CouncilMember; size?: number }) {
  const initials = m.name.split(" ").slice(-2).map(w => w[0]).join("");
  return (
    <div className="rounded-full flex items-center justify-center shrink-0 text-white"
      style={{
        width:size, height:size, background:m.present ? m.avatarColor : "#4f5d6e",
        fontFamily: "var(--font-sans)", fontWeight:700,
        fontSize: size > 28 ? 12 : 10,
        opacity: m.present ? 1 : 0.6,
      }}>
      {initials}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SESSION CARD (list view)
═══════════════════════════════════════════════════════════════════ */
function SessionCard({ s, onOpen }: { s: CouncilSession; onOpen: () => void }) {
  const { theme } = useTheme();
  const statusCfg: Record<SessionStatus, { label:string;color:string;bg:string;border:string }> = {
    upcoming:       { label:"Sắp diễn ra",   color:"#0e7490", bg:"#e0f2fe", border:"#67e8f9" },
    in_progress:    { label:"Đang họp",       color:"#166534", bg:"#dcfce7", border:"#86efac" },
    completed:      { label:"Đã kết thúc",    color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd" },
    minutes_issued: { label:"Đã ban hành BB", color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd" },
  };
  const sc   = statusCfg[s.status];
  const done = s.memberScores.filter(e => !e.abstained && Object.keys(e.scores).length > 0).length;
  const total= s.members.filter(m=>m.present).length * s.nominations.length;

  return (
    <div onClick={onOpen}
      className="ds-card ds-card-default ds-card-hoverable cursor-pointer rounded-[10px] overflow-hidden">
      <div className="h-1" style={{ background:
        s.status==="in_progress"?"linear-gradient(to right,#16a34a,#22c55e)":
        s.status==="completed"?"linear-gradient(to right,#1C5FBE,#3b82f6)":"#e2e8f0" }} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="size-10 rounded-[8px] flex items-center justify-center shrink-0"
            style={{ background:theme.tint }}>
            <Gavel className="size-5" style={{ color:theme.primary }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[13px]"
                style={{ color:sc.color, background:sc.bg, borderColor:sc.border, fontFamily: "var(--font-sans)", fontWeight:500 }}>
                {sc.label}
              </span>
              <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                {s.code} · Phiên {s.phienSo}
              </span>
            </div>
            <h3 className="text-[14px] text-[#0b1426] leading-snug"
              style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
              {s.campaignName}
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon:Calendar, label:"Ngày họp", v:fmtDate(s.date) },
            { icon:Users,    label:"Thành viên", v:`${s.members.filter(m=>m.present).length}/${s.members.length}` },
            { icon:FileText, label:"Hồ sơ xét", v:`${s.nominations.length} hồ sơ` },
          ].map(st => {
            const Icon = st.icon;
            return (
              <div key={st.label} className="rounded-[6px] p-2 border text-center"
                style={{ borderColor:"var(--color-line)", background:"#ffffff" }}>
                <Icon className="size-3.5 mx-auto mb-1 text-[#635647]" />
                <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{st.v}</div>
                <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{st.label}</div>
              </div>
            );
          })}
        </div>
        {/* Scoring progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Tiến độ chấm điểm</span>
            <span style={{ color:theme.primary, fontFamily: "var(--font-sans)", fontWeight:600 }}>{done}/{total}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#eef2f8] overflow-hidden">
            <div className="h-full rounded-full" style={{ width:`${total?done/total*100:0}%`, background:theme.primary }} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between pt-2 border-t" style={{ borderColor:"var(--color-line)" }}>
          <div className="flex items-center gap-1.5 text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            <MapPin className="size-3" />{s.location.split("–")[0].trim()}
          </div>
          <span className="flex items-center gap-1 text-[13px]"
            style={{ color:theme.primary, fontFamily: "var(--font-sans)", fontWeight:500 }}>
            Vào phòng họp <ChevronRight className="size-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCORING TAB — main workspace
═══════════════════════════════════════════════════════════════════ */
function ScoringTab({
  session, currentMemberId, selectedNomId, setSelectedNomId,
  onSubmitScore, onVote, onUpdateDecision,
}: {
  session: CouncilSession;
  currentMemberId: string;
  selectedNomId: string | null;
  setSelectedNomId: (id: string | null) => void;
  onSubmitScore: (entry: MemberScoreEntry) => void;
  onVote: (nomId: string, vote: VoteChoice) => void;
  onUpdateDecision: (nomId: string, decision: NomDecision) => void;
}) {
  const { theme } = useTheme();
  const [localScores, setLocalScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [chairNotes, setChairNotes] = useState<Record<string, string>>({});

  const currentMember = session.members.find(m => m.id === currentMemberId)!;
  const nomination    = session.nominations.find(n => n.id === selectedNomId);
  const coi           = nomination ? checkCOI(currentMember, nomination) : { level:"none" as CoiLevel, reason:"" };

  const existingScore = session.memberScores.find(
    e => e.memberId === currentMemberId && e.nominationId === selectedNomId
  );
  const alreadyScored = existingScore && !existingScore.abstained && Object.keys(existingScore.scores).length > 0;

  // Others' scores for this nomination
  const othersScores = nomination
    ? session.memberScores.filter(e => e.nominationId === nomination.id && e.memberId !== currentMemberId)
    : [];
  const { avg, count } = nomination
    ? calcAvgForNom(nomination.id, session.memberScores, session.members)
    : { avg:0, count:0 };

  const localTotal = calcTotal(localScores);
  const localPct   = localTotal / MAX_TOTAL;
  const scoreReady = CRITERIA.every(c => localScores[c.id] !== undefined) && comment.trim().length > 0;

  const handleSubmit = () => {
    if (!nomination || !scoreReady) return;
    const entry: MemberScoreEntry = {
      memberId:currentMemberId, nominationId:nomination.id,
      scores:{...localScores}, comment,
      submittedAt:new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}),
      abstained:false,
    };
    onSubmitScore(entry);
    setSubmitted(true);
  };

  if (!nomination) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
      <div className="size-16 rounded-full flex items-center justify-center" style={{ background:theme.tint }}>
        <Gavel className="size-7" style={{ color:theme.primary }} />
      </div>
      <div>
        <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
          Chọn hồ sơ để chấm điểm
        </h3>
        <p className="text-[13px] text-[#635647] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
          Nhấn vào hồ sơ ở cột bên trái để bắt đầu
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 h-full overflow-hidden">
      {/* LEFT: Nomination detail + scoring */}
      <div className="flex-1 min-w-0 overflow-y-auto space-y-4 pr-1">

        {/* Nomination info card */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          <div className="p-4 border-b" style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-[6px] flex items-center justify-center shrink-0"
                style={{ background:nomination.loai==="ca_nhan"?"#ddeafc":"#fde8cc" }}>
                {nomination.loai==="ca_nhan"
                  ? <User className="size-4 text-[#1a4fa0]" />
                  : <Users className="size-4 text-[#92400e]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{nomination.code}</span>
                  <span className="text-[13px] px-1.5 py-0.5 rounded bg-[#fdf3d9] text-[#7d4a00] border border-[#f0dba0]"
                    style={{ fontFamily: "var(--font-sans)" }}>
                    <Star className="size-2.5 inline mr-0.5" style={{ fill:"#8a6400",color:"#8a6400" }} />
                    {nomination.hinhThuc}
                  </span>
                </div>
                <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
                  {nomination.tenDoiTuong}
                </h3>
                <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                  {nomination.chucVu ? `${nomination.chucVu} · ` : ""}{nomination.donVi}
                  {nomination.namCongTac ? ` · ${nomination.namCongTac} năm công tác` : ""}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="rounded-[6px] p-3 bg-[#ffffff]" style={{ border:"1px solid var(--color-line)" }}>
              <div className="text-[13px] uppercase tracking-wide text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                Tóm tắt thành tích
              </div>
              <p className="text-[13px] text-[#0b1426] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                {nomination.tomTatThanhTich}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {nomination.documents.map(d => (
                <button key={d} className="flex items-center gap-1 px-2 py-1 rounded border text-[13px]"
                  style={{ borderColor:"var(--color-line)", color:"#1a4fa0", fontFamily: "var(--font-sans)" }}>
                  <FileText className="size-3" />{d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COI Warning */}
        {coi.level !== "none" && (
          <div className={`rounded-[8px] border-l-4 p-4 flex items-start gap-3`}
            style={{
              background: coi.level==="hard" ? "#fee2e2" : "#fef3c7",
              borderLeftColor: coi.level==="hard" ? "#c8102e" : "#b45309",
            }}>
            <ShieldAlert className={`size-5 shrink-0 mt-0.5 ${coi.level==="hard"?"text-[#c8102e]":"text-[#b45309]"}`} />
            <div>
              <div className="text-[13px]" style={{
                color: coi.level==="hard"?"#9f1239":"#92400e",
                fontFamily: "var(--font-sans)", fontWeight:700
              }}>
                {coi.level==="hard" ? "⛔ XUNG ĐỘT LỢI ÍCH — Không thể chấm điểm" : "⚠️ Cảnh báo xung đột tiềm năng"}
              </div>
              <p className="text-[13px] mt-0.5" style={{ color:coi.level==="hard"?"#9f1239":"#92400e", fontFamily: "var(--font-sans)" }}>
                {coi.reason}
              </p>
              <p className="text-[13px] mt-1.5 opacity-80" style={{ color:coi.level==="hard"?"#9f1239":"#92400e", fontFamily: "var(--font-sans)" }}>
                Căn cứ: Khoản 4 Điều 56 Luật TĐKT 2022 — Thành viên HĐ không xét hồ sơ của đơn vị mình
              </p>
            </div>
          </div>
        )}

        {/* Scoring Form */}
        {coi.level === "none" && (
          <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
            <div className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
              <div className="flex items-center gap-2">
                <Gavel className="size-4" style={{ color:theme.primary }} />
                <span className="text-[13px] text-[#0b1426]"
                  style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
                  {alreadyScored ? "Điểm đã nộp" : "Phiếu chấm điểm"}
                </span>
                <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                  {currentMember.name}
                </span>
              </div>
              {alreadyScored && (
                <span className="flex items-center gap-1 text-[13px] text-[#0f7a3e]"
                  style={{ fontFamily: "var(--font-sans)" }}>
                  <CheckCircle2 className="size-3.5" />Đã nộp lúc {existingScore?.submittedAt}
                </span>
              )}
            </div>

            <div className="p-4 space-y-2">
              {CRITERIA.map(c => (
                <ScoreInput
                  key={c.id}
                  criterion={c}
                  value={alreadyScored ? (existingScore?.scores[c.id] ?? 0) : (localScores[c.id] ?? 0)}
                  onChange={v => !alreadyScored && setLocalScores(p => ({ ...p, [c.id]:v }))}
                  disabled={!!alreadyScored}
                />
              ))}

              {/* Total */}
              <div className="rounded-[8px] p-4 border-2 flex items-center justify-between"
                style={{
                  borderColor: alreadyScored
                    ? scoreColor(calcTotal(existingScore?.scores||{}) / MAX_TOTAL) + "60"
                    : scoreColor(localPct) + "60",
                  background: "#ffffff",
                }}>
                <div>
                  <div className="text-[13px] uppercase tracking-wide text-[#635647]"
                    style={{ fontFamily: "var(--font-sans)" }}>Tổng điểm</div>
                  <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                    Tối đa: {MAX_TOTAL} điểm
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[24px] leading-none"
                    style={{
                      fontFamily: "var(--font-sans)", fontWeight:700,
                      color: alreadyScored
                        ? scoreColor(calcTotal(existingScore?.scores||{})/MAX_TOTAL)
                        : scoreColor(localPct),
                    }}>
                    {alreadyScored ? calcTotal(existingScore?.scores||{}) : localTotal}
                  </div>
                  <div className="text-[13px]"
                    style={{ color:scoreColor(alreadyScored ? calcTotal(existingScore?.scores||{})/MAX_TOTAL : localPct), fontFamily: "var(--font-sans)" }}>
                    {alreadyScored
                      ? `${Math.round(calcTotal(existingScore?.scores||{})/MAX_TOTAL*100)}%`
                      : `${Math.round(localPct*100)}%`}
                  </div>
                </div>
              </div>

              {/* Comment */}
              {!alreadyScored ? (
                <div className="space-y-1.5">
                  <label className="text-[13px] text-[#0b1426]"
                    style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>
                    Ý kiến nhận xét <span className="text-[#c8102e]">*</span>
                  </label>
                  <textarea className="ds-input w-full" rows={3}
                    style={{ padding:"10px 12px", resize:"vertical" }}
                    placeholder="Nêu nhận xét tổng quát về hồ sơ, thành tích và đề xuất..."
                    value={comment}
                    onChange={e => setComment(e.target.value)} />
                </div>
              ) : (
                <div className="rounded-[6px] p-3 bg-[#ffffff] border" style={{ borderColor:"var(--color-line)" }}>
                  <div className="text-[13px] text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)" }}>Nhận xét đã nộp</div>
                  <p className="text-[13px] text-[#0b1426] italic" style={{ fontFamily: "var(--font-sans)" }}>
                    "{existingScore?.comment}"
                  </p>
                </div>
              )}

              {!alreadyScored && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1">
                    {!scoreReady && (
                      <div className="flex items-center gap-1.5 text-[13px] text-[#635647]"
                        style={{ fontFamily: "var(--font-sans)" }}>
                        <AlertCircle className="size-3.5" />
                        {Object.keys(localScores).length < CRITERIA.length
                          ? "Vui lòng chấm điểm tất cả tiêu chí"
                          : "Vui lòng nhập nhận xét"}
                      </div>
                    )}
                  </div>
                  <DsButton variant="primary" size="md" disabled={!scoreReady || submitted} onClick={handleSubmit}>
                    {submitted ? <><CheckCircle2 className="size-4" />Đã nộp</> : <><Send className="size-4" />Nộp điểm</>}
                  </DsButton>
                </div>
              )}
            </div>
          </div>
        )}
        {coi.level === "hard" && (
          <div className="rounded-[8px] p-4 bg-[#f4f7fb] border border-[#e2e8f0] text-center">
            <Lock className="size-8 mx-auto mb-2 text-[#e2e8f0]" />
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              Bạn không thể chấm điểm hồ sơ này do xung đột lợi ích.<br/>
              Điểm sẽ được ghi nhận là "Vắng / Kiêng kỵ" trong biên bản.
            </p>
          </div>
        )}

        {/* ── VOTING SECTION ── */}
        {(() => {
          const dec = session.decisions.find(d => d.nominationId === nomination.id) ?? null;
          const myCoi = checkCOI(currentMember, nomination);
          const eligibleVoters = session.members.filter(m => m.present && checkCOI(m, nomination).level !== "hard");
          const passCount   = dec?.votes.pass.length   ?? 0;
          const rejectCount = dec?.votes.reject.length ?? 0;
          const deferCount  = dec?.votes.defer.length  ?? 0;
          const totalCast   = passCount + rejectCount + deferCount;
          const allVoted    = eligibleVoters.length > 0 && totalCast >= eligibleVoters.length;
          const myVote: VoteChoice | null = !dec ? null
            : dec.votes.pass.includes(currentMemberId) ? "pass"
            : dec.votes.reject.includes(currentMemberId) ? "reject"
            : dec.votes.defer.includes(currentMemberId) ? "defer"
            : null;
          const finalized = !!dec && dec.decision !== "pending";
          const suggestedDecision: VoteChoice =
            passCount > rejectCount && passCount > deferCount ? "pass"
            : rejectCount > deferCount ? "reject" : "defer";
          const decBadge = DEC_BADGE[finalized ? dec!.decision : "pending"];
          const borderColor = finalized
            ? (dec!.decision === "pass" ? "#86efac" : dec!.decision === "reject" ? "#fca5a5" : "#fcd34d")
            : "var(--color-line)";

          return (
            <div className="rounded-[10px] border overflow-hidden" style={{ borderColor }}>
              {/* Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between shrink-0"
                style={{
                  borderColor: "var(--color-line)",
                  background: finalized
                    ? (dec!.decision === "pass" ? "#f0fdf4" : dec!.decision === "reject" ? "#fff1f2" : "#fffbeb")
                    : "var(--color-paper)",
                }}>
                <div className="flex items-center gap-2">
                  <Gavel className="size-4" style={{ color: theme.primary }} />
                  <span className="text-[13px] text-[#0b1426]"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Biểu quyết</span>
                  {myCoi.level === "hard" && (
                    <span className="text-[12px] px-1.5 py-0.5 rounded border flex items-center gap-1"
                      style={{ color:"#374151", background:"#f3f4f6", borderColor:"#d1d5db", fontFamily:"var(--font-sans)" }}>
                      <ShieldAlert className="size-3" />Bạn kiêng kỵ (COI)
                    </span>
                  )}
                </div>
                {dec && (
                  <span className="text-[12px] px-2 py-0.5 rounded-full border"
                    style={{ color:decBadge.color, background:decBadge.bg, borderColor:decBadge.border, fontFamily:"var(--font-sans)", fontWeight:500 }}>
                    {decBadge.label}
                  </span>
                )}
              </div>

              {/* Tally bar */}
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex-1 h-2.5 rounded-full overflow-hidden flex gap-px" style={{ background:"#f1f5f9" }}>
                    {passCount > 0 && <div style={{ width:`${passCount/eligibleVoters.length*100}%`, background:VOTE_CFG.pass.barColor, transition:"width 0.3s" }} />}
                    {rejectCount > 0 && <div style={{ width:`${rejectCount/eligibleVoters.length*100}%`, background:VOTE_CFG.reject.barColor, transition:"width 0.3s" }} />}
                    {deferCount > 0 && <div style={{ width:`${deferCount/eligibleVoters.length*100}%`, background:VOTE_CFG.defer.barColor, transition:"width 0.3s" }} />}
                  </div>
                  <span className="text-[12px] shrink-0"
                    style={{ color:allVoted?"#166534":"#635647", fontFamily:"var(--font-sans)", fontWeight:allVoted?600:400 }}>
                    {totalCast}/{eligibleVoters.length}{allVoted ? " ✓" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[12px]" style={{ fontFamily:"var(--font-sans)" }}>
                  <span style={{ color:VOTE_CFG.pass.color   }}>✓ {passCount} tán thành</span>
                  <span style={{ color:VOTE_CFG.reject.color }}>✗ {rejectCount} phản đối</span>
                  <span style={{ color:VOTE_CFG.defer.color  }}>– {deferCount} hoãn</span>
                  {eligibleVoters.length - totalCast > 0 && (
                    <span style={{ color:"#9ca3af" }}>? {eligibleVoters.length - totalCast} chưa bỏ</span>
                  )}
                </div>
              </div>

              {/* Member chips */}
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {session.members.filter(m => m.present).map(m => {
                  const mCoi = checkCOI(m, nomination);
                  const vote: VoteChoice | null = !dec ? null
                    : dec.votes.pass.includes(m.id) ? "pass"
                    : dec.votes.reject.includes(m.id) ? "reject"
                    : dec.votes.defer.includes(m.id) ? "defer"
                    : null;
                  const isMe = m.id === currentMemberId;
                  const vcfg = vote ? VOTE_CFG[vote] : null;
                  return (
                    <div key={m.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[12px]"
                      style={{
                        background:   mCoi.level==="hard" ? "#f3f4f6" : vcfg ? vcfg.activeBg : "#fafafa",
                        borderColor:  mCoi.level==="hard" ? "#d1d5db" : vcfg ? vcfg.border : "#e5e7eb",
                        color:        mCoi.level==="hard" ? "#6b7280" : vcfg ? vcfg.color : "#374151",
                        fontFamily:  "var(--font-sans)", fontWeight: isMe ? 600 : 400,
                        outline:      isMe ? `2px solid ${vcfg?.color ?? "#94a3b8"}` : "none",
                        outlineOffset:"1px",
                      }}>
                      <span className="size-4 rounded-full flex items-center justify-center text-white text-[10px] shrink-0"
                        style={{ background:m.avatarColor }}>{m.name.charAt(0)}</span>
                      <span>{m.name.split(" ").slice(-1)[0]}{isMe ? " (bạn)" : ""}</span>
                      <span className="font-bold">
                        {mCoi.level==="hard" ? "COI" : vote==="pass" ? "✓" : vote==="reject" ? "✗" : vote==="defer" ? "–" : "?"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* My vote buttons */}
              {!finalized && myCoi.level !== "hard" && (
                <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor:"var(--color-line)" }}>
                  <div className="text-[12px] text-[#635647] mb-2"
                    style={{ fontFamily:"var(--font-sans)", fontWeight:500 }}>
                    Phiếu của bạn{myVote ? " — click lại để thay đổi" : ""}:
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(Object.entries(VOTE_CFG) as [VoteChoice, typeof VOTE_CFG[VoteChoice]][]).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      const isActive = myVote === key;
                      return (
                        <button key={key}
                          onClick={() => onVote(nomination.id, key)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border text-[13px] transition-all"
                          style={{
                            borderColor: isActive ? cfg.color : cfg.border,
                            background:  isActive ? cfg.activeBg : cfg.bg,
                            color:       cfg.color,
                            fontFamily: "var(--font-sans)", fontWeight: isActive ? 600 : 500,
                            boxShadow:   isActive ? `0 0 0 2px ${cfg.color}30` : "none",
                          }}>
                          <Icon className="size-3.5" />{cfg.label}
                          {isActive && <CheckCircle2 className="size-3.5 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chair finalization */}
              {!finalized && currentMember.isChair && allVoted && (
                <div className="px-4 pb-4 pt-3 border-t"
                  style={{ borderColor:"var(--color-line)", background:"linear-gradient(to right,#f8faff,#fdf4ff)" }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Gavel className="size-3.5 text-[#1C5FBE]" />
                    <span className="text-[13px] text-[#1C5FBE]"
                      style={{ fontFamily:"var(--font-sans)", fontWeight:600 }}>Kết luận của Chủ tịch Hội đồng</span>
                    <span className="text-[12px] px-2 py-0.5 rounded-full"
                      style={{ background:"#ddeafc", color:"#1C5FBE", fontFamily:"var(--font-sans)" }}>
                      Đề xuất: {VOTE_CFG[suggestedDecision].label}
                    </span>
                  </div>
                  <input className="ds-input ds-input-sm w-full mb-2.5"
                    placeholder="Nhập kết luận / ghi chú của Chủ tịch HĐ..."
                    value={chairNotes[nomination.id] ?? ""}
                    onChange={e => setChairNotes(p => ({ ...p, [nomination.id]: e.target.value }))} />
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#635647]" style={{ fontFamily:"var(--font-sans)" }}>Xác nhận:</span>
                    {(["pass", "reject", "defer"] as VoteChoice[]).map(choice => {
                      const cfg = VOTE_CFG[choice];
                      const Icon = cfg.icon;
                      const isSuggested = suggestedDecision === choice;
                      return (
                        <button key={choice}
                          onClick={() => onUpdateDecision(nomination.id, { ...dec!, decision: choice, chairNote: chairNotes[nomination.id] ?? "" })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-[13px] transition-all"
                          style={{
                            borderColor: cfg.border,
                            background:  isSuggested ? cfg.activeBg : cfg.bg,
                            color:       cfg.color,
                            fontFamily: "var(--font-sans)", fontWeight: isSuggested ? 600 : 500,
                            boxShadow:   isSuggested ? `0 0 0 2px ${cfg.color}25` : "none",
                          }}>
                          <Icon className="size-3.5" />
                          {choice === "pass" ? "Thông qua" : choice === "reject" ? "Bác" : "Hoãn"}
                          {isSuggested && <Star className="size-3 ml-0.5 opacity-70" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Finalized note */}
              {finalized && dec!.chairNote && (
                <div className="px-4 pb-3 pt-2.5 border-t flex items-start gap-2"
                  style={{ borderColor:"var(--color-line)", background:"#fafafa" }}>
                  <Gavel className="size-3.5 text-[#635647] shrink-0 mt-0.5" />
                  <span className="text-[13px] text-[#635647] italic" style={{ fontFamily:"var(--font-sans)" }}>
                    Kết luận Chủ tịch: {dec!.chairNote}
                  </span>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* RIGHT: All members' scores */}
      <div className="w-[280px] shrink-0 overflow-y-auto space-y-3">
        <div className="text-[13px] text-[#635647] uppercase tracking-wide"
          style={{ fontFamily: "var(--font-sans)" }}>
          Điểm các thành viên HĐ
        </div>

        {/* Average box */}
        <div className="rounded-[8px] p-4 border-2 text-center"
          style={{ borderColor:theme.primary+"40", background:theme.tint }}>
          <div className="text-[13px] text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)" }}>Điểm trung bình ({count} thành viên)</div>
          <div className="text-[36px]"
            style={{ fontFamily: "var(--font-sans)", fontWeight:700, color:scoreColor(avg/MAX_TOTAL), lineHeight:1 }}>
            {avg}
          </div>
          <div className="text-[13px] mt-1" style={{ color:scoreColor(avg/MAX_TOTAL), fontFamily: "var(--font-sans)" }}>
            / {MAX_TOTAL} điểm · {Math.round(avg/MAX_TOTAL*100)}%
          </div>
        </div>

        {/* Per-member scores */}
        <div className="space-y-2">
          {session.members.filter(m => m.present).map(m => {
            const entry = othersScores.find(e => e.memberId === m.id)
              || (m.id === currentMemberId ? existingScore : undefined);
            const nomCoi = nomination ? checkCOI(m, nomination) : { level:"none" as CoiLevel, reason:"" };
            const isCurrentUser = m.id === currentMemberId;
            const total  = entry && !entry.abstained ? calcTotal(entry.scores) : null;

            return (
              <div key={m.id} className="rounded-[8px] p-3 border"
                style={{
                  borderColor: isCurrentUser ? theme.primary+"40" : "var(--color-line)",
                  background: isCurrentUser ? theme.tint : "#fff",
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar m={m} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#0b1426] truncate"
                      style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>
                      {m.name}
                      {isCurrentUser && <span className="text-[13px] ml-1 opacity-70">(bạn)</span>}
                      {m.isChair && <span className="text-[13px] ml-1 text-[#b45309]">Chủ tịch</span>}
                    </div>
                    <div className="text-[13px] text-[#635647] truncate" style={{ fontFamily: "var(--font-sans)" }}>
                      {m.donVi}
                    </div>
                  </div>
                  {/* Score or COI badge */}
                  {nomCoi.level === "hard" ? (
                    <span className="flex items-center gap-0.5 text-[13px] px-1.5 py-0.5 rounded bg-[#fee2e2] text-[#9f1239] border border-[#fca5a5]"
                      style={{ fontFamily: "var(--font-sans)" }}>
                      <ShieldAlert className="size-2.5" />COI
                    </span>
                  ) : total !== null ? (
                    <div className="text-[14px]"
                      style={{ fontFamily: "var(--font-sans)", fontWeight:700, color:scoreColor(total/MAX_TOTAL) }}>
                      {total}
                    </div>
                  ) : (
                    <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                      Chờ...
                    </span>
                  )}
                </div>
                {/* Criteria breakdown bar */}
                {total !== null && (
                  <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
                    {CRITERIA.map(c => {
                      const v = entry?.scores[c.id] ?? 0;
                      return (
                        <div key={c.id} className="h-full"
                          title={`${c.shortName}: ${v}/${c.maxScore}`}
                          style={{ width:`${(c.maxScore/MAX_TOTAL)*100}%`, background:c.color, opacity: v/c.maxScore*0.7+0.3 }} />
                      );
                    })}
                  </div>
                )}
                {entry?.comment && (
                  <p className="text-[13px] text-[#635647] mt-1.5 italic leading-relaxed line-clamp-2"
                    style={{ fontFamily: "var(--font-sans)" }}>"{entry.comment}"</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPARE TAB
═══════════════════════════════════════════════════════════════════ */
function CompareTab({ session }: { session: CouncilSession }) {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(p => p.filter(x => x !== id));
    else if (selected.length < 3) setSelected(p => [...p, id]);
  };

  const compared = session.nominations.filter(n => selected.includes(n.id));
  const avgs = compared.map(n => ({
    nom: n,
    ...calcAvgForNom(n.id, session.memberScores, session.members),
    byCriteria: CRITERIA.map(c => {
      const valids = session.memberScores
        .filter(e => e.nominationId === n.id && !e.abstained && e.scores[c.id] !== undefined);
      const avg = valids.length ? Math.round(valids.reduce((s,e) => s + e.scores[c.id], 0) / valids.length) : 0;
      return { criteriaId:c.id, avg };
    }),
  }));

  return (
    <div className="space-y-4">
      {/* Selection */}
      <div>
        <div className="text-[13px] text-[#635647] mb-2 flex items-center gap-1.5"
          style={{ fontFamily: "var(--font-sans)" }}>
          <Columns className="size-3.5" />
          Chọn tối đa 3 hồ sơ để so sánh
        </div>
        <div className="flex flex-wrap gap-2">
          {session.nominations.map(n => (
            <button key={n.id} onClick={() => toggle(n.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[13px] transition-all"
              style={{
                borderColor: selected.includes(n.id) ? theme.primary : "var(--color-line)",
                background: selected.includes(n.id) ? theme.tint : "#fff",
                color: selected.includes(n.id) ? theme.primary : "#4a5568",
                fontFamily: "var(--font-sans)", fontWeight: selected.includes(n.id)?600:400,
              }}>
              {selected.includes(n.id) && <Check className="size-3" />}
              {n.tenDoiTuong}
              <span className="text-[13px] opacity-70">{n.code}</span>
            </button>
          ))}
        </div>
      </div>

      {compared.length < 2 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Columns className="size-10 text-[#e2e8f0]" />
          <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Chọn ít nhất 2 hồ sơ để so sánh
          </p>
        </div>
      ) : (
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
          {/* Header row */}
          <div className="grid border-b" style={{
            gridTemplateColumns:`160px repeat(${compared.length}, 1fr)`,
            borderColor:"var(--color-line)", background:"var(--color-paper)"
          }}>
            <div className="px-4 py-3 text-[13px] text-[#635647] uppercase tracking-wide"
              style={{ fontFamily: "var(--font-sans)" }}>Tiêu chí</div>
            {avgs.map(a => (
              <div key={a.nom.id} className="px-4 py-3 border-l" style={{ borderColor:"var(--color-line)" }}>
                <div className="text-[13px] text-[#0b1426]"
                  style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>{a.nom.tenDoiTuong}</div>
                <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                  {a.nom.hinhThuc} · {a.nom.code}
                </div>
              </div>
            ))}
          </div>

          {/* Criteria rows */}
          {CRITERIA.map(c => {
            const maxVal = Math.max(...avgs.map(a => a.byCriteria.find(x=>x.criteriaId===c.id)?.avg ?? 0));
            return (
              <div key={c.id} className="grid border-b hover:bg-[#ffffff] transition-colors"
                style={{ gridTemplateColumns:`160px repeat(${compared.length}, 1fr)`, borderColor:"var(--color-line)" }}>
                <div className="px-4 py-3 flex items-center gap-1.5">
                  <div className="size-2 rounded-full shrink-0" style={{ background:c.color }} />
                  <div>
                    <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>
                      {c.shortName}
                    </div>
                    <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                      /{c.maxScore}đ
                    </div>
                  </div>
                </div>
                {avgs.map(a => {
                  const val = a.byCriteria.find(x=>x.criteriaId===c.id)?.avg ?? 0;
                  const isMax = val === maxVal && maxVal > 0;
                  return (
                    <div key={a.nom.id} className="px-4 py-3 border-l flex items-center gap-2"
                      style={{ borderColor:"var(--color-line)", background:isMax?"rgba(22,163,74,0.06)":"transparent" }}>
                      <div className="text-[18px]"
                        style={{ fontFamily: "var(--font-sans)", fontWeight:700, color:scoreColor(val/c.maxScore) }}>
                        {val}
                      </div>
                      {isMax && <Trophy className="size-3.5 text-[#8a6400]" />}
                      <div className="flex-1 h-1.5 rounded-full bg-[#eef2f8] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${(val/c.maxScore)*100}%`, background:c.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Total row */}
          <div className="grid" style={{
            gridTemplateColumns:`160px repeat(${compared.length}, 1fr)`,
            background:"var(--color-paper)"
          }}>
            <div className="px-4 py-4">
              <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>TỔNG ĐIỂM</div>
              <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Trung bình HĐ</div>
            </div>
            {avgs.sort((a,b) => 0).map((a, rank) => {
              const isFirst = a.avg === Math.max(...avgs.map(x=>x.avg));
              return (
                <div key={a.nom.id} className="px-4 py-4 border-l"
                  style={{ borderColor:"var(--color-line)", background:isFirst?"rgba(22,163,74,0.08)":"transparent" }}>
                  <div className="flex items-center gap-2">
                    <div className="text-[24px]"
                      style={{ fontFamily: "var(--font-sans)", fontWeight:700, color:scoreColor(a.avg/MAX_TOTAL) }}>
                      {a.avg}
                    </div>
                    {isFirst && (
                      <div className="flex flex-col">
                        <Medal className="size-4 text-[#8a6400]" />
                        <span className="text-[13px] text-[#0f7a3e]" style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>Cao nhất</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[13px]"
                    style={{ color:scoreColor(a.avg/MAX_TOTAL), fontFamily: "var(--font-sans)" }}>
                    {Math.round(a.avg/MAX_TOTAL*100)}% · {a.count} thành viên chấm
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RESULTS & VOTING TAB
═══════════════════════════════════════════════════════════════════ */
const VOTE_CFG: Record<VoteChoice, { label: string; short: string; icon: typeof ThumbsUp; color: string; bg: string; border: string; activeBg: string; barColor: string }> = {
  pass:   { label:"Tán thành",    short:"Tán thành", icon:ThumbsUp,   color:"#166534", bg:"#f0fdf4", border:"#86efac", activeBg:"#dcfce7", barColor:"#16a34a" },
  reject: { label:"Phản đối",     short:"Phản đối",  icon:ThumbsDown, color:"#9f1239", bg:"#fff1f2", border:"#fca5a5", activeBg:"#fee2e2", barColor:"#dc2626" },
  defer:  { label:"Hoãn xem xét", short:"Hoãn",      icon:Minus,      color:"#92400e", bg:"#fffbeb", border:"#fcd34d", activeBg:"#fef3c7", barColor:"#b45309" },
};

const DEC_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pass:    { label:"Đã thông qua",    color:"#166534", bg:"#dcfce7", border:"#86efac" },
  reject:  { label:"Không thông qua", color:"#9f1239", bg:"#fee2e2", border:"#fca5a5" },
  defer:   { label:"Hoãn",            color:"#92400e", bg:"#fef3c7", border:"#fcd34d" },
  pending: { label:"Đang biểu quyết", color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd" },
};

function ResultsTab({
  session, currentMemberId, onVote, onUpdateDecision,
}: {
  session: CouncilSession;
  currentMemberId: string;
  onVote: (nomId: string, vote: VoteChoice) => void;
  onUpdateDecision: (nomId: string, decision: NomDecision) => void;
}) {
  const currentMember = session.members.find(m => m.id === currentMemberId)!;
  const isChair = currentMember?.isChair;
  const [chairNotes, setChairNotes] = useState<Record<string, string>>({});

  const items = [...session.nominations]
    .map(nom => {
      const { avg } = calcAvgForNom(nom.id, session.memberScores, session.members);
      const dec = session.decisions.find(d => d.nominationId === nom.id) ?? null;
      const myCoi = checkCOI(currentMember, nom);
      const eligibleVoters = session.members.filter(m => m.present && checkCOI(m, nom).level !== "hard");
      const passCount   = dec?.votes.pass.length   ?? 0;
      const rejectCount = dec?.votes.reject.length ?? 0;
      const deferCount  = dec?.votes.defer.length  ?? 0;
      const totalCast   = passCount + rejectCount + deferCount;
      const allVoted    = eligibleVoters.length > 0 && totalCast >= eligibleVoters.length;
      const myVote: VoteChoice | null = !dec ? null
        : dec.votes.pass.includes(currentMemberId) ? "pass"
        : dec.votes.reject.includes(currentMemberId) ? "reject"
        : dec.votes.defer.includes(currentMemberId) ? "defer"
        : null;
      const finalized = !!dec && dec.decision !== "pending";
      const suggestedDecision: VoteChoice =
        passCount > rejectCount && passCount > deferCount ? "pass"
        : rejectCount > deferCount ? "reject" : "defer";
      return { nom, avg, dec, myCoi, eligibleVoters, passCount, rejectCount, deferCount, totalCast, allVoted, myVote, finalized, suggestedDecision };
    })
    .sort((a, b) => b.avg - a.avg);

  const passedCount   = session.decisions.filter(d => d.decision === "pass").length;
  const rejectedCount = session.decisions.filter(d => d.decision === "reject").length;
  const finalizedCount = passedCount + rejectedCount + session.decisions.filter(d => d.decision === "defer").length;
  const pendingCount  = session.nominations.length - finalizedCount;

  return (
    <div className="space-y-4">
      {/* ── Summary strip ── */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { label:"Tổng hồ sơ",      v:session.nominations.length,  color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd" },
          { label:"Đã thông qua",    v:passedCount,                  color:"#166534", bg:"#dcfce7", border:"#86efac" },
          { label:"Không thông qua", v:rejectedCount,                color:"#9f1239", bg:"#fee2e2", border:"#fca5a5" },
          { label:"Chờ biểu quyết",  v:pendingCount,                 color:"#92400e", bg:"#fef3c7", border:"#fcd34d" },
        ] as const).map(s => (
          <div key={s.label} className="rounded-[10px] p-3 border text-center"
            style={{ borderColor:s.border, background:s.bg }}>
            <div className="text-[28px] leading-tight"
              style={{ fontFamily:"var(--font-sans)", fontWeight:700, color:s.color }}>{s.v}</div>
            <div className="text-[12px] mt-0.5"
              style={{ color:s.color, fontFamily:"var(--font-sans)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Per-nomination cards ── */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const { nom, avg, dec, myCoi, eligibleVoters, passCount, rejectCount, deferCount, totalCast, allVoted, myVote, finalized, suggestedDecision } = item;
          const decBadge = DEC_BADGE[finalized ? dec!.decision : (totalCast > 0 ? "pending" : "pending")];
          const coiMembers = session.members.filter(m => m.present && checkCOI(m, nom).level === "hard");
          const borderColor = finalized
            ? (dec!.decision === "pass" ? "#86efac" : dec!.decision === "reject" ? "#fca5a5" : "#fcd34d")
            : "var(--color-line)";

          return (
            <div key={nom.id} className="rounded-[12px] border overflow-hidden"
              style={{ borderColor }}>

              {/* ── Header ── */}
              <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <div className="size-8 rounded-full flex items-center justify-center shrink-0 text-[13px]"
                  style={{
                    background: idx===0?"#fdf3d9":idx===1?"#f1f5f9":idx===2?"#fff7ed":"#f3f4f6",
                    color:      idx===0?"#7d4a00":idx===1?"#374151":idx===2?"#92400e":"#6b7280",
                    fontFamily:"var(--font-sans)", fontWeight:700,
                  }}>{idx + 1}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-[14px] text-[#0b1426]"
                      style={{ fontFamily:"var(--font-sans)", fontWeight:600 }}>{nom.tenDoiTuong}</span>
                    <span className="text-[12px] px-2 py-0.5 rounded-full border"
                      style={{ color:decBadge.color, background:decBadge.bg, borderColor:decBadge.border, fontFamily:"var(--font-sans)", fontWeight:500 }}>
                      {decBadge.label}
                    </span>
                    {myCoi.level === "hard" && (
                      <span className="text-[12px] px-2 py-0.5 rounded-full border flex items-center gap-1"
                        style={{ color:"#374151", background:"#f3f4f6", borderColor:"#d1d5db", fontFamily:"var(--font-sans)" }}>
                        <ShieldAlert className="size-3" />Bạn kiêng kỵ (COI)
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-[#635647]" style={{ fontFamily:"var(--font-sans)" }}>
                    {nom.hinhThuc} · {nom.donVi}
                    {coiMembers.length > 0 && ` · ${coiMembers.length} thành viên COI`}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[24px] leading-tight"
                    style={{ fontFamily:"var(--font-sans)", fontWeight:700, color:scoreColor(avg/MAX_TOTAL) }}>{avg}</div>
                  <div className="text-[12px] text-[#635647]" style={{ fontFamily:"var(--font-sans)" }}>/{MAX_TOTAL} đ</div>
                </div>
              </div>

              {/* ── Tally bar ── */}
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2.5 rounded-full overflow-hidden flex gap-px"
                    style={{ background:"#f1f5f9" }}>
                    {passCount > 0 && (
                      <div style={{ width:`${passCount/eligibleVoters.length*100}%`, background:VOTE_CFG.pass.barColor, transition:"width 0.3s" }} />
                    )}
                    {rejectCount > 0 && (
                      <div style={{ width:`${rejectCount/eligibleVoters.length*100}%`, background:VOTE_CFG.reject.barColor, transition:"width 0.3s" }} />
                    )}
                    {deferCount > 0 && (
                      <div style={{ width:`${deferCount/eligibleVoters.length*100}%`, background:VOTE_CFG.defer.barColor, transition:"width 0.3s" }} />
                    )}
                  </div>
                  <span className="text-[12px] shrink-0"
                    style={{ color: allVoted ? "#166534" : "#635647", fontFamily:"var(--font-sans)", fontWeight: allVoted ? 600 : 400 }}>
                    {totalCast}/{eligibleVoters.length} phiếu{allVoted ? " ✓" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[12px]" style={{ fontFamily:"var(--font-sans)" }}>
                  <span style={{ color:VOTE_CFG.pass.color }}>✓ {passCount} tán thành</span>
                  <span style={{ color:VOTE_CFG.reject.color }}>✗ {rejectCount} phản đối</span>
                  <span style={{ color:VOTE_CFG.defer.color }}>– {deferCount} hoãn</span>
                  {eligibleVoters.length - totalCast > 0 && (
                    <span style={{ color:"#9ca3af" }}>? {eligibleVoters.length - totalCast} chưa bỏ phiếu</span>
                  )}
                </div>
              </div>

              {/* ── Member vote chips ── */}
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {session.members.filter(m => m.present).map(m => {
                  const mCoi = checkCOI(m, nom);
                  const vote: VoteChoice | null = !dec ? null
                    : dec.votes.pass.includes(m.id) ? "pass"
                    : dec.votes.reject.includes(m.id) ? "reject"
                    : dec.votes.defer.includes(m.id) ? "defer"
                    : null;
                  const isMe = m.id === currentMemberId;
                  const vcfg = vote ? VOTE_CFG[vote] : null;
                  const lastName = m.name.split(" ").slice(-1)[0];
                  return (
                    <div key={m.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[12px]"
                      style={{
                        background:   mCoi.level==="hard" ? "#f3f4f6" : vcfg ? vcfg.activeBg : "#fafafa",
                        borderColor:  mCoi.level==="hard" ? "#d1d5db" : vcfg ? vcfg.border : "#e5e7eb",
                        color:        mCoi.level==="hard" ? "#6b7280" : vcfg ? vcfg.color : "#374151",
                        fontFamily:  "var(--font-sans)",
                        fontWeight:   isMe ? 600 : 400,
                        outline:      isMe ? `2px solid ${vcfg?.color ?? "#94a3b8"}` : "none",
                        outlineOffset: "1px",
                      }}>
                      <span className="size-4 rounded-full flex items-center justify-center text-white text-[10px] shrink-0"
                        style={{ background:m.avatarColor }}>
                        {m.name.charAt(0)}
                      </span>
                      <span>{lastName}{isMe ? " (bạn)" : ""}</span>
                      <span className="font-bold">
                        {mCoi.level==="hard" ? "COI" : vote==="pass" ? "✓" : vote==="reject" ? "✗" : vote==="defer" ? "–" : "?"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ── My vote panel ── */}
              {!finalized && myCoi.level !== "hard" && (
                <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor:"var(--color-line)" }}>
                  <div className="text-[12px] text-[#635647] mb-2" style={{ fontFamily:"var(--font-sans)", fontWeight:500 }}>
                    Phiếu của bạn{myVote ? " — click lại để thay đổi" : ""}:
                  </div>
                  <div className="flex items-center gap-2">
                    {(Object.entries(VOTE_CFG) as [VoteChoice, typeof VOTE_CFG[VoteChoice]][]).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      const isActive = myVote === key;
                      return (
                        <button key={key}
                          onClick={() => onVote(nom.id, key)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border text-[13px] transition-all"
                          style={{
                            borderColor:  isActive ? cfg.color : cfg.border,
                            background:   isActive ? cfg.activeBg : cfg.bg,
                            color:        cfg.color,
                            fontFamily:  "var(--font-sans)", fontWeight: isActive ? 600 : 500,
                            boxShadow:    isActive ? `0 0 0 2px ${cfg.color}30` : "none",
                          }}>
                          <Icon className="size-3.5" />
                          {cfg.label}
                          {isActive && <CheckCircle2 className="size-3.5 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Chair finalization panel ── */}
              {!finalized && isChair && allVoted && (
                <div className="px-4 pb-4 pt-3 border-t"
                  style={{ borderColor:"var(--color-line)", background:"linear-gradient(to right,#f8faff,#fdf4ff)" }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Gavel className="size-3.5 text-[#1C5FBE]" />
                    <span className="text-[13px] text-[#1C5FBE]"
                      style={{ fontFamily:"var(--font-sans)", fontWeight:600 }}>Kết luận của Chủ tịch Hội đồng</span>
                    <span className="text-[12px] px-2 py-0.5 rounded-full"
                      style={{ background:"#ddeafc", color:"#1C5FBE", fontFamily:"var(--font-sans)" }}>
                      Đề xuất: {VOTE_CFG[suggestedDecision].label}
                    </span>
                  </div>
                  <input className="ds-input ds-input-sm w-full mb-2.5"
                    placeholder="Nhập kết luận / ghi chú của Chủ tịch HĐ..."
                    value={chairNotes[nom.id] ?? ""}
                    onChange={e => setChairNotes(p => ({ ...p, [nom.id]: e.target.value }))} />
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#635647]" style={{ fontFamily:"var(--font-sans)" }}>Xác nhận quyết định:</span>
                    {(["pass", "reject", "defer"] as VoteChoice[]).map(choice => {
                      const cfg = VOTE_CFG[choice];
                      const Icon = cfg.icon;
                      const isSuggested = suggestedDecision === choice;
                      return (
                        <button key={choice}
                          onClick={() => onUpdateDecision(nom.id, { ...dec!, decision: choice, chairNote: chairNotes[nom.id] ?? "" })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-[13px] transition-all"
                          style={{
                            borderColor: cfg.border,
                            background:  isSuggested ? cfg.activeBg : cfg.bg,
                            color:       cfg.color,
                            fontFamily: "var(--font-sans)", fontWeight: isSuggested ? 600 : 500,
                            boxShadow:   isSuggested ? `0 0 0 2px ${cfg.color}25` : "none",
                          }}>
                          <Icon className="size-3.5" />
                          {choice === "pass" ? "Thông qua" : choice === "reject" ? "Bác" : "Hoãn"}
                          {isSuggested && <Star className="size-3 ml-0.5 opacity-70" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Chair note (finalized) ── */}
              {finalized && dec!.chairNote && (
                <div className="px-4 pb-3 pt-2.5 border-t flex items-start gap-2"
                  style={{ borderColor:"var(--color-line)", background:"#fafafa" }}>
                  <Gavel className="size-3.5 text-[#635647] shrink-0 mt-0.5" />
                  <span className="text-[13px] text-[#635647] italic"
                    style={{ fontFamily:"var(--font-sans)" }}>
                    Kết luận Chủ tịch: {dec!.chairNote}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MINUTES TAB
═══════════════════════════════════════════════════════════════════ */
function MinutesTab({ session }: { session: CouncilSession }) {
  const { theme } = useTheme();
  const passed  = session.decisions.filter(d => d.decision==="pass");
  const present = session.members.filter(m => m.present);
  const absent  = session.members.filter(m => !m.present);
  const chair   = session.members.find(m => m.isChair)!;
  const secy    = session.members.find(m => m.isSecretary)!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="size-4" style={{ color:theme.primary }} />
          <span className="text-[13px] text-[#0b1426]"
            style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
            Dự thảo Biên bản họp Hội đồng TĐKT
          </span>
        </div>
        <DsButton variant="secondary" size="sm">
          <Download className="size-3.5" />Xuất PDF
        </DsButton>
      </div>

      {/* Minutes document */}
      <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"var(--color-line)" }}>
        <div className="px-8 py-6 space-y-5 bg-white" style={{ fontFamily: "var(--font-sans)" }}>
          {/* Header */}
          <div className="text-center space-y-1 border-b pb-5" style={{ borderColor:"var(--color-line)" }}>
            <div className="text-[13px] uppercase tracking-widest text-[#635647]">
              ỦY BAN NHÂN DÂN TỈNH ĐỒNG NAI
            </div>
            <div className="text-[13px] uppercase tracking-widest text-[#635647]">
              HỘI ĐỒNG THI ĐUA – KHEN THƯỞNG
            </div>
            <div className="h-px bg-[#e2e8f0] my-2" />
            <h2 className="text-[18px] text-[#0b1426]"
              style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
              BIÊN BẢN HỌP HỘI ĐỒNG XÉT DUYỆT
            </h2>
            <p className="text-[14px] text-[#0b1426]">Phong trào: <strong>{session.campaignName}</strong></p>
            <p className="text-[13px] text-[#635647]">
              Phiên họp số {session.phienSo} · {session.time} ngày {fmtDate(session.date)}
            </p>
            <p className="text-[13px] text-[#635647]">{session.location}</p>
          </div>

          {/* Section 1: Thành phần */}
          <div>
            <div className="text-[13px] text-[#0b1426] mb-2"
              style={{ fontWeight:700 }}>I. THÀNH PHẦN THAM DỰ</div>
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr style={{ background:"var(--color-paper)" }}>
                  {["STT","Họ và tên","Chức danh trong HĐ","Đơn vị","Có mặt"].map(h => (
                    <th key={h} className="text-left px-3 py-2 border text-[13px] text-[#635647] uppercase tracking-wide"
                      style={{ borderColor:"var(--color-line)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {session.members.map((m, i) => (
                  <tr key={m.id} className="hover:bg-[#ffffff]">
                    <td className="px-3 py-2 border text-center" style={{ borderColor:"var(--color-line)" }}>{i+1}</td>
                    <td className="px-3 py-2 border" style={{ borderColor:"var(--color-line)", fontWeight:m.isChair||m.isSecretary?600:400 }}>
                      {m.name}</td>
                    <td className="px-3 py-2 border" style={{ borderColor:"var(--color-line)" }}>
                      {m.isChair?"Chủ tịch":m.isSecretary?"Thư ký":"Ủy viên"}
                    </td>
                    <td className="px-3 py-2 border" style={{ borderColor:"var(--color-line)" }}>{m.donVi}</td>
                    <td className="px-3 py-2 border text-center" style={{ borderColor:"var(--color-line)" }}>
                      {m.present
                        ? <CheckCircle2 className="size-3.5 inline text-[#0f7a3e]" />
                        : <XCircle className="size-3.5 inline text-[#c8102e]" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[13px] text-[#635647] mt-2">
              Có mặt: <strong>{present.length}</strong> thành viên.
              Vắng mặt: <strong>{absent.length}</strong> ({absent.map(m=>m.name).join(", ") || "Không có"}).
            </p>
          </div>

          {/* Section 2: Nội dung xét duyệt */}
          <div>
            <div className="text-[13px] text-[#0b1426] mb-3" style={{ fontWeight:700 }}>
              II. KẾT QUẢ CHẤM ĐIỂM VÀ BIỂU QUYẾT
            </div>
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr style={{ background:"var(--color-paper)" }}>
                  {["STT","Tên cá nhân/tập thể","Đơn vị","Hình thức KT","Điểm TB","Kết quả"].map(h => (
                    <th key={h} className="text-left px-3 py-2 border text-[13px] text-[#635647] uppercase tracking-wide"
                      style={{ borderColor:"var(--color-line)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {session.nominations.map((n, i) => {
                  const { avg } = calcAvgForNom(n.id, session.memberScores, session.members);
                  const dec = session.decisions.find(d => d.nominationId === n.id);
                  const decLabel = dec?.decision==="pass"?"✓ Thông qua":dec?.decision==="reject"?"✗ Không thông qua":dec?.decision==="defer"?"Hoãn":"Chờ biểu quyết";
                  return (
                    <tr key={n.id} className="hover:bg-[#ffffff]">
                      <td className="px-3 py-2 border text-center" style={{ borderColor:"var(--color-line)" }}>{i+1}</td>
                      <td className="px-3 py-2 border" style={{ borderColor:"var(--color-line)", fontWeight:600 }}>{n.tenDoiTuong}</td>
                      <td className="px-3 py-2 border" style={{ borderColor:"var(--color-line)" }}>{n.donVi}</td>
                      <td className="px-3 py-2 border" style={{ borderColor:"var(--color-line)" }}>{n.hinhThuc}</td>
                      <td className="px-3 py-2 border text-center" style={{ borderColor:"var(--color-line)", fontWeight:700, color:scoreColor(avg/MAX_TOTAL) }}>
                        {avg}/{MAX_TOTAL}
                      </td>
                      <td className="px-3 py-2 border" style={{ borderColor:"var(--color-line)", color:dec?.decision==="pass"?"#166534":dec?.decision==="reject"?"#9f1239":"#92400e", fontWeight:600 }}>
                        {decLabel}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 3: Kết luận */}
          <div>
            <div className="text-[13px] text-[#0b1426] mb-2" style={{ fontWeight:700 }}>
              III. KẾT LUẬN VÀ KIẾN NGHỊ
            </div>
            <p className="text-[13px] text-[#4a5568] leading-relaxed">
              Hội đồng TĐKT nhất trí đề nghị tặng khen thưởng cho <strong>{passed.length}</strong> cá nhân/tập thể
              có thành tích xuất sắc tại phong trào "<em>{session.campaignName}</em>".
              Hồ sơ được chuyển cho Văn phòng UBND Tỉnh trình cấp có thẩm quyền ký ban hành Quyết định khen thưởng.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t" style={{ borderColor:"var(--color-line)" }}>
            <div className="text-center space-y-12">
              <div>
                <div className="text-[13px] text-[#635647] uppercase tracking-wide">Thư ký Hội đồng</div>
                <div className="text-[13px] text-[#0b1426] mt-8" style={{ fontWeight:600 }}>{secy?.name}</div>
                <div className="text-[13px] text-[#635647]">{secy?.title}</div>
              </div>
            </div>
            <div className="text-center space-y-12">
              <div>
                <div className="text-[13px] text-[#635647] uppercase tracking-wide">Chủ tịch Hội đồng</div>
                <div className="text-[13px] text-[#0b1426] mt-8" style={{ fontWeight:600 }}>{chair?.name}</div>
                <div className="text-[13px] text-[#635647]">{chair?.title}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WORKSPACE (full session view)
═══════════════════════════════════════════════════════════════════ */
function Workspace({ session: initSession, user, onBack }: {
  session: CouncilSession; user: LoginUser; onBack: () => void;
}) {
  const { theme } = useTheme();
  const [session, setSession] = useState<CouncilSession>(initSession);
  const [selectedNomId, setSelectedNomId] = useState<string | null>(session.nominations[0]?.id ?? null);
  const [tab, setTab] = useState<"scoring" | "compare" | "minutes">("scoring");

  // Derive current member (match by name or default to secretary)
  const currentMember = useMemo(() => {
    const byName = session.members.find(m => m.name === user.name);
    return byName ?? session.members.find(m => m.isSecretary) ?? session.members[0];
  }, [session.members, user.name]);

  const handleSubmitScore = (entry: MemberScoreEntry) => {
    setSession(prev => ({
      ...prev,
      memberScores: [...prev.memberScores.filter(
        e => !(e.memberId === entry.memberId && e.nominationId === entry.nominationId)
      ), entry],
    }));
  };

  const handleVote = (nomId: string, vote: VoteChoice) => {
    setSession(prev => {
      const existing = prev.decisions.find(d => d.nominationId === nomId);
      // Don't allow re-voting on finalized decisions
      if (existing && existing.decision !== "pending") return prev;
      const baseVotes = existing?.votes ?? { pass: [], reject: [], defer: [] };
      // Remove member from all arrays (handle re-vote / toggle)
      const cleaned = {
        pass:   baseVotes.pass.filter(id => id !== currentMember.id),
        reject: baseVotes.reject.filter(id => id !== currentMember.id),
        defer:  baseVotes.defer.filter(id => id !== currentMember.id),
      };
      const wasVoting = baseVotes[vote].includes(currentMember.id);
      const newVotes = wasVoting ? cleaned : { ...cleaned, [vote]: [...cleaned[vote], currentMember.id] };
      const updated: NomDecision = {
        nominationId: nomId,
        votes: newVotes,
        decision: "pending",
        chairNote: existing?.chairNote ?? "",
      };
      return { ...prev, decisions: [...prev.decisions.filter(d => d.nominationId !== nomId), updated] };
    });
  };

  const scoredCount = session.nominations.filter(n => {
    const coi = checkCOI(currentMember, n);
    if (coi.level === "hard") return true;
    return session.memberScores.some(e => e.memberId === currentMember.id && e.nominationId === n.id && !e.abstained && Object.keys(e.scores).length > 0);
  }).length;
  const finalizedCount = session.decisions.filter(d => d.decision !== "pending").length;

  const TABS = [
    { key:"scoring" as const, label:"Chấm điểm & Biểu quyết", icon:PenLine,   badge:`${scoredCount}/${session.nominations.length} · ${finalizedCount} BQ` },
    { key:"compare" as const, label:"So sánh",                  icon:Columns,   badge:null },
    { key:"minutes" as const, label:"Biên bản",                  icon:FileText,  badge:null },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background:"var(--color-paper)" }}>
      {/* ── Top bar ── */}
      <div className="px-6 py-4 border-b flex items-center gap-4"
        style={{ borderColor:"var(--color-line)", background:"var(--color-paper)" }}>
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] transition-colors"
          style={{ color:"#635647", fontFamily: "var(--font-sans)" }}
          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=theme.primary}
          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color="#635647"}>
          <ChevronLeft className="size-4" />Danh sách phiên họp
        </button>
        <div className="h-4 w-px bg-[#e2e8f0]" />
        <div className="flex items-center gap-2">
          <Gavel className="size-4" style={{ color:theme.primary }} />
          <div>
            <span className="text-[14px] text-[#0b1426]"
              style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
              {session.campaignName}
            </span>
            <span className="text-[13px] text-[#635647] ml-2" style={{ fontFamily: "var(--font-sans)" }}>
              · {session.code} · Phiên {session.phienSo} · {fmtDate(session.date)} {session.time}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <div className="size-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span className="text-[#166534]">Đang họp</span>
          </div>
          {/* Legal refs */}
          <div className="flex items-center gap-1">
            {session.canCuPhapLy.slice(0,1).map(p => (
              <span key={p} className="text-[13px] px-2 py-0.5 rounded bg-[#ddeafc] text-[#1a4fa0] border border-[#1C5FBE30]"
                style={{ fontFamily: "var(--font-sans)" }}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* ── LEFT PANEL: Members + Queue ── */}
        <div className="w-[260px] shrink-0 border-r flex flex-col overflow-hidden"
          style={{ borderColor:"var(--color-line)" }}>

          {/* Members */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] uppercase tracking-wide text-[#635647]"
                style={{ fontFamily: "var(--font-sans)" }}>
                Thành viên HĐ ({session.members.filter(m=>m.present).length}/{session.members.length})
              </span>
              <Shield className="size-3.5 text-[#1C5FBE]" />
            </div>
            <div className="space-y-1.5">
              {session.members.map(m => {
                const isCurrentUser = m.id === currentMember.id;
                const coiForSelected = selectedNomId
                  ? checkCOI(m, session.nominations.find(n=>n.id===selectedNomId)!)
                  : { level:"none" as CoiLevel, reason:"" };
                const scoredThisNom = selectedNomId && session.memberScores.some(
                  e => e.memberId===m.id && e.nominationId===selectedNomId && !e.abstained && Object.keys(e.scores).length>0
                );

                return (
                  <div key={m.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] transition-colors"
                    style={{
                      background: isCurrentUser ? theme.tint : "#fff",
                      border: `1px solid ${isCurrentUser ? theme.primary+"40" : "var(--color-line)"}`,
                      opacity: m.present ? 1 : 0.5,
                    }}>
                    <Avatar m={m} size={26} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-[#0b1426] truncate"
                        style={{ fontFamily: "var(--font-sans)", fontWeight:isCurrentUser?600:400 }}>
                        {m.name}
                        {isCurrentUser && <span className="text-[13px] opacity-60 ml-1">(bạn)</span>}
                        {m.isChair && <span className="text-[13px] text-[#b45309] ml-1">Chủ tịch</span>}
                      </div>
                      <div className="text-[13px] text-[#635647] truncate" style={{ fontFamily: "var(--font-sans)" }}>
                        {m.donVi}
                      </div>
                    </div>
                    {/* Status for selected nom */}
                    {selectedNomId && (
                      coiForSelected.level==="hard" ? (
                        <ShieldAlert className="size-3.5 shrink-0 text-[#c8102e]" title="Xung đột lợi ích" />
                      ) : scoredThisNom ? (
                        <CheckCircle2 className="size-3.5 shrink-0 text-[#0f7a3e]" />
                      ) : m.present ? (
                        <Clock className="size-3.5 shrink-0 text-[#635647]" />
                      ) : null
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COI legend */}
          <div className="px-4 py-2">
            <div className="rounded-[6px] p-2 bg-[#ffffff] border" style={{ borderColor:"var(--color-line)" }}>
              <div className="text-[13px] text-[#635647] uppercase tracking-wide mb-1.5"
                style={{ fontFamily: "var(--font-sans)" }}>Chú thích</div>
              {[
                { icon:CheckCircle2, color:"#0f7a3e", label:"Đã chấm" },
                { icon:Clock,        color:"#635647", label:"Chờ chấm" },
                { icon:ShieldAlert,  color:"#c8102e", label:"Xung đột lợi ích (COI)" },
              ].map(it => {
                const Icon = it.icon;
                return (
                  <div key={it.label} className="flex items-center gap-1.5 mb-1">
                    <Icon className="size-3" style={{ color:it.color }} />
                    <span className="text-[13px]" style={{ color:it.color, fontFamily: "var(--font-sans)" }}>{it.label}</span>
                  </div>
                );
              })}
              <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor:"var(--color-line)" }}>
                <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                  Căn cứ: Khoản 4 Điều 56 Luật TĐKT 2022
                </div>
              </div>
            </div>
          </div>

          <div className="h-px" style={{ background:"var(--color-line)" }} />

          {/* Nomination queue */}
          <div className="px-4 pt-3 pb-1">
            <span className="text-[13px] uppercase tracking-wide text-[#635647]"
              style={{ fontFamily: "var(--font-sans)" }}>
              Hồ sơ xét duyệt ({session.nominations.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
            {session.nominations.map(n => {
              const isSelected = n.id === selectedNomId;
              const coi = checkCOI(currentMember, n);
              const { avg } = calcAvgForNom(n.id, session.memberScores, session.members);
              const myScore = session.memberScores.find(e=>e.memberId===currentMember.id && e.nominationId===n.id);
              const myDone  = myScore && !myScore.abstained && Object.keys(myScore.scores).length > 0;
              const dec = session.decisions.find(d => d.nominationId === n.id);
              const finalized = !!dec && dec.decision !== "pending";
              const voteDecCfg = finalized ? DEC_BADGE[dec!.decision] : null;

              return (
                <button key={n.id}
                  onClick={() => setSelectedNomId(n.id)}
                  className="w-full text-left rounded-[8px] px-3 py-2.5 border transition-all"
                  style={{
                    borderColor: isSelected ? theme.primary : finalized ? (voteDecCfg!.border) : "var(--color-line)",
                    background: isSelected ? theme.tint : "#fff",
                    boxShadow: isSelected ? `0 0 0 2px ${theme.primary}20` : "none",
                  }}>
                  <div className="flex items-center gap-2 mb-1">
                    {coi.level === "hard"
                      ? <ShieldAlert className="size-3 text-[#c8102e] shrink-0" />
                      : myDone
                      ? <CheckCircle2 className="size-3 text-[#0f7a3e] shrink-0" />
                      : <Clock className="size-3 text-[#635647] shrink-0" />}
                    <span className="text-[13px] text-[#0b1426] flex-1 truncate"
                      style={{ fontFamily:"var(--font-sans)", fontWeight:isSelected?600:500 }}>
                      {n.tenDoiTuong}
                    </span>
                    {avg > 0 && (
                      <span className="text-[13px] shrink-0"
                        style={{ color:scoreColor(avg/MAX_TOTAL), fontFamily:"var(--font-sans)", fontWeight:700 }}>
                        {avg}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] text-[#635647] truncate flex-1" style={{ fontFamily:"var(--font-sans)" }}>
                      {n.hinhThuc} · {n.code}
                    </span>
                    {voteDecCfg && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background:voteDecCfg.bg, color:voteDecCfg.color, fontFamily:"var(--font-sans)", fontWeight:600 }}>
                        {dec!.decision === "pass" ? "✓ TQ" : dec!.decision === "reject" ? "✗ Bác" : "– Hoãn"}
                      </span>
                    )}
                    {!finalized && dec && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background:"#ddeafc", color:"#1C5FBE", fontFamily:"var(--font-sans)" }}>
                        {dec.votes.pass.length + dec.votes.reject.length + dec.votes.defer.length}/{
                          session.members.filter(m => m.present && checkCOI(m, n).level !== "hard").length} phiếu
                      </span>
                    )}
                  </div>
                  {coi.level === "hard" && (
                    <div className="mt-1 text-[13px] text-[#c8102e]" style={{ fontFamily:"var(--font-sans)" }}>
                      COI — Không thể chấm
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MAIN PANEL ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-0 border-b px-6 shrink-0"
            style={{ borderColor:"var(--color-line)" }}>
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex items-center gap-1.5 px-4 py-3 text-[13px] border-b-2 transition-colors"
                  style={{
                    fontFamily: "var(--font-sans)",
                    borderBottomColor: tab===t.key ? theme.primary : "transparent",
                    color: tab===t.key ? theme.primary : "#635647",
                    fontWeight: tab===t.key ? 600 : 400,
                    background:"transparent",
                  }}>
                  <Icon className="size-3.5" />
                  {t.label}
                  {t.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[13px]"
                      style={{
                        background: tab===t.key ? theme.tint : "#eef2f8",
                        color: tab===t.key ? theme.primary : "#635647",
                      }}>{t.badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5">
            {tab === "scoring" && (
              <ScoringTab
                session={session}
                currentMemberId={currentMember.id}
                selectedNomId={selectedNomId}
                setSelectedNomId={setSelectedNomId}
                onSubmitScore={handleSubmitScore}
                onVote={handleVote}
                onUpdateDecision={(id, dec) => {
                  setSession(prev => ({
                    ...prev,
                    decisions: [...prev.decisions.filter(d => d.nominationId !== id), dec],
                  }));
                }}
              />
            )}
            {tab === "compare" && <CompareTab session={session} />}
            {tab === "minutes" && <MinutesTab session={session} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
function CreateSessionModal({ sessions, campaigns, onClose, onCreate }: {
  sessions: CouncilSession[];
  campaigns: Campaign[];
  onClose: () => void;
  onCreate: (s: CouncilSession) => void;
}) {
  const councilCampaigns = campaigns.filter(c => c.state === "council_review");
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    campaignId: "",
    campaignName: "",
    date: today,
    time: "08:30",
    location: "Hội trường UBND Tỉnh Đồng Nai – Phòng họp số 2",
    ghiChu: "",
  });
  const [memberPresence, setMemberPresence] = useState<Record<string, boolean>>(
    Object.fromEntries(MEMBERS.map(m => [m.id, m.present]))
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const errs = {
    campaignId: !form.campaignId ? "Chọn phong trào đang ở giai đoạn Họp hội đồng" : null,
    date: !form.date ? "Chọn ngày họp" : null,
    location: form.location.trim().length < 5 ? "Nhập địa điểm họp" : null,
  };
  const valid = !errs.campaignId && !errs.date && !errs.location;
  const presentCount = Object.values(memberPresence).filter(Boolean).length;
  const quorum = Math.ceil(MEMBERS.length * 2 / 3);

  const selectedCampaign = campaigns.find(c => c.id === form.campaignId) ?? null;
  const eligibleParticipants = selectedCampaign
    ? selectedCampaign.participants.filter(p => p.hoSoStatus === "da_duyet")
    : [];

  const handleSubmit = () => {
    setTouched({ campaignId: true, date: true, location: true });
    if (!valid) return;
    const newId = `HD-${new Date().getFullYear()}-${String(sessions.length + 1).padStart(3, "0")}`;
    const nominations: Nomination[] = eligibleParticipants.map((p, idx) => ({
      id: p.id,
      code: `HS-${String(idx + 1).padStart(3, "0")}`,
      tenDoiTuong: p.name,
      loai: p.type,
      donVi: p.donVi,
      chucVu: p.position,
      hinhThuc: p.hinhThucDeNghi ?? "Chưa xác định",
      capKT: selectedCampaign!.level,
      tomTatThanhTich: p.baoHoaThanhTich ?? "",
      documents: (p.minhChung ?? []).filter(m => m.daNop).map(m => m.ten),
      status: "in_review",
    }));
    const newSession: CouncilSession = {
      id: newId, code: newId,
      phienSo: sessions.length + 1,
      campaignName: form.campaignName,
      campaignId: form.campaignId,
      date: form.date, time: form.time,
      location: form.location.trim(),
      status: "upcoming",
      members: MEMBERS.map(m => ({ ...m, present: memberPresence[m.id] ?? m.present })),
      nominations,
      memberScores: [],
      decisions: [],
      canCuPhapLy: ["Điều 56 Luật TĐKT 2022", "Điều 38 NĐ 152/2025/NĐ-CP", "TT 03/2018/TT-BNV"],
      ghiChu: form.ghiChu.trim(),
    };
    onCreate(newSession);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="w-[560px] max-h-[90vh] rounded-[16px] border shadow-2xl bg-white flex flex-col overflow-hidden"
        style={{ borderColor: "var(--color-line)", fontFamily: "var(--font-sans)" }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center gap-3 shrink-0"
          style={{ borderColor: "var(--color-line)", background: "linear-gradient(to right,#eff6ff,#f5f3ff)" }}>
          <div className="size-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "#1C5FBE" }}>
            <Gavel className="size-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#0b1426]">Tạo phiên họp Hội đồng mới</p>
            <p className="text-[13px] text-[#635647]">Phiên số {sessions.length + 1} · Điều 56 Luật TĐKT 2022</p>
          </div>
          <button type="button" onClick={onClose} className="size-8 rounded-full flex items-center justify-center hover:bg-[#f1f5f9] transition-colors">
            <X className="size-4 text-[#635647]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Campaign select */}
          <div className="ds-input-root">
            <label className="ds-input-label ds-input-label-required">Tên phong trào / chiến dịch</label>
            {councilCampaigns.length === 0 ? (
              <div className="rounded-[8px] border px-4 py-3 flex items-center gap-2 text-[13px]"
                style={{ borderColor: "#fca5a5", background: "#fff1f2", color: "#c8102e" }}>
                <AlertCircle className="size-4 shrink-0" />
                Không có phong trào nào đang ở giai đoạn Họp hội đồng xét duyệt.
              </div>
            ) : (
              <>
                <select className="ds-input ds-input-md"
                  value={form.campaignId}
                  onChange={e => {
                    const c = councilCampaigns.find(x => x.id === e.target.value);
                    setForm(f => ({ ...f, campaignId: e.target.value, campaignName: c?.name ?? "" }));
                  }}
                  onBlur={() => touch("campaignId")}
                  style={touched.campaignId && errs.campaignId ? { borderColor: "#f87171" } : {}}>
                  <option value="">-- Chọn phong trào --</option>
                  {councilCampaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {touched.campaignId && errs.campaignId && (
                  <p className="text-[13px] text-[#c8102e] mt-1">{errs.campaignId}</p>
                )}
                {form.campaignId && (
                  <div className="mt-2 rounded-[8px] border overflow-hidden" style={{ borderColor: "#86efac" }}>
                    <div className="px-3 py-2 flex items-center gap-2 text-[13px]"
                      style={{ background: "#f0fdf4", color: "#166534" }}>
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      Phong trào đang ở giai đoạn <strong className="ml-1">Họp hội đồng xét duyệt</strong>
                    </div>
                    <div className="px-3 py-2.5 border-t flex items-center gap-6"
                      style={{ borderColor: "#86efac", background: "#fff" }}>
                      <div className="flex items-center gap-1.5">
                        <FileText className="size-3.5 text-[#1C5FBE]" />
                        <span className="text-[13px] text-[#0b1426]">
                          <strong>{eligibleParticipants.length}</strong> hồ sơ đủ điều kiện
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5 text-[#7c3aed]" />
                        <span className="text-[13px] text-[#0b1426]">
                          <strong>{eligibleParticipants.filter(p => p.type === "ca_nhan").length}</strong> cá nhân
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-[#b45309]" />
                        <span className="text-[13px] text-[#0b1426]">
                          <strong>{eligibleParticipants.filter(p => p.type === "tap_the").length}</strong> tập thể
                        </span>
                      </div>
                    </div>
                    {eligibleParticipants.length === 0 && (
                      <div className="px-3 py-2 border-t text-[13px] flex items-center gap-2"
                        style={{ borderColor: "#86efac", background: "#fffbeb", color: "#92400e" }}>
                        <AlertCircle className="size-3.5 shrink-0" />
                        Chưa có hồ sơ nào được duyệt ở giai đoạn thẩm định cơ sở.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="ds-input-root">
              <label className="ds-input-label ds-input-label-required">
                <Calendar className="size-3.5 inline mr-1" />Ngày họp
              </label>
              <input type="date" className="ds-input ds-input-md" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                onBlur={() => touch("date")}
                style={touched.date && errs.date ? { borderColor: "#f87171" } : {}} />
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label">
                <Clock className="size-3.5 inline mr-1" />Giờ họp
              </label>
              <input type="time" className="ds-input ds-input-md" value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
          </div>

          {/* Location */}
          <div className="ds-input-root">
            <label className="ds-input-label ds-input-label-required">
              <MapPin className="size-3.5 inline mr-1" />Địa điểm
            </label>
            <input className="ds-input ds-input-md" value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              onBlur={() => touch("location")}
              style={touched.location && errs.location ? { borderColor: "#f87171" } : {}} />
            {touched.location && errs.location && (
              <p className="text-[13px] text-[#c8102e] mt-1">{errs.location}</p>
            )}
          </div>

          {/* Member attendance */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="ds-input-label mb-0">
                <Users className="size-3.5 inline mr-1" />Thành viên tham dự
              </label>
              <span className="text-[13px]" style={{ color: presentCount >= quorum ? "#166534" : "#c8102e" }}>
                {presentCount}/{MEMBERS.length} · {presentCount >= quorum ? "✅ Đủ túc số" : `❌ Cần thêm ${quorum - presentCount}`}
              </span>
            </div>
            <div className="rounded-[10px] border overflow-hidden" style={{ borderColor: "var(--color-line)" }}>
              {MEMBERS.map((m, i) => (
                <div key={m.id}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid var(--color-line)" : undefined }}
                  onClick={() => setMemberPresence(p => ({ ...p, [m.id]: !p[m.id] }))}>
                  <input type="checkbox" readOnly checked={memberPresence[m.id] ?? false}
                    className="size-4 rounded accent-[#1C5FBE] cursor-pointer" />
                  <div className="size-7 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
                    style={{ background: memberPresence[m.id] ? m.avatarColor : "#d1d5db" }}>
                    {m.name.split(" ").pop()?.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: memberPresence[m.id] ? "#0b1426" : "#9ca3af" }}>{m.name}</div>
                    <div className="text-[12px] truncate" style={{ color: memberPresence[m.id] ? "#635647" : "#d1d5db" }}>{m.title}</div>
                  </div>
                  {m.isChair && <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "#ddeafc", color: "#1a4fa0" }}>Chủ tịch</span>}
                  {m.isSecretary && <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "#f5f3ff", color: "#7c3aed" }}>Thư ký</span>}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#9ca3af] mt-1">Túc số tối thiểu: ≥ {quorum}/{MEMBERS.length} thành viên (2/3) · Điều 56 Luật TĐKT 2022</p>
          </div>

          {/* Notes */}
          <div className="ds-input-root">
            <label className="ds-input-label">Ghi chú</label>
            <textarea className="ds-input" rows={2} style={{ padding: "8px 12px", resize: "vertical" }}
              placeholder="Nội dung dự kiến xét duyệt, lưu ý đặc biệt..."
              value={form.ghiChu}
              onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between shrink-0" style={{ borderColor: "var(--color-line)" }}>
          <p className="text-[13px] text-[#635647]">
            {presentCount < quorum && <span className="text-[#c8102e] font-semibold">Chưa đủ túc số · </span>}
            Phiên số {sessions.length + 1}
          </p>
          <div className="flex gap-2">
            <DsButton variant="secondary" size="md" onClick={onClose}>Hủy</DsButton>
            <DsButton variant="primary" size="md" onClick={handleSubmit} style={!valid ? { opacity: 0.65 } : {}}>
              <CheckCircle2 className="size-4" />Tạo phiên họp
            </DsButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HoiDongPage({ user, campaigns, sessions, onSessionsChange }: {
  user: LoginUser;
  campaigns: Campaign[];
  sessions: CouncilSession[];
  onSessionsChange: React.Dispatch<React.SetStateAction<CouncilSession[]>>;
}) {
  const { theme } = useTheme();
  const [openSession, setOpenSession] = useState<CouncilSession | null>(null);
  const setSessions = onSessionsChange;
  const [showCreate, setShowCreate] = useState(false);

  if (openSession) {
    return (
      <Workspace
        session={openSession}
        user={user}
        onBack={() => setOpenSession(null)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background:"var(--color-paper)" }}>
      {/* Header */}
      <div className="px-8 pt-6 pb-5 border-b" style={{ borderColor:"var(--color-line)" }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="size-8 rounded-[6px] flex items-center justify-center" style={{ background:theme.tint }}>
                <Gavel className="size-4" style={{ color:theme.primary }} />
              </div>
              <h1 className="text-[18px] text-[#0b1426]"
                style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
                Hội đồng Xét duyệt
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[13px] bg-[#ddeafc] text-[#1a4fa0] border border-[#1C5FBE30]"
                style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>
                <ShieldCheck className="size-3" />COI realtime · Scoring engine
              </span>
            </div>
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              Chấm điểm theo tiêu chí, kiểm tra xung đột lợi ích tự động — Điều 56 Luật TĐKT 2022
            </p>
          </div>
          <DsButton variant="primary" size="md" onClick={() => setShowCreate(true)}>
            <Plus className="size-4" />Tạo phiên họp mới
          </DsButton>
        </div>

        {/* Legal banner */}
        <div className="rounded-[8px] p-3 border flex items-start gap-3"
          style={{ borderColor:"#1C5FBE30", background:"linear-gradient(to right,#ddeafc,#f0f6ff)" }}>
          <Scale className="size-4 text-[#1C5FBE] shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] text-[#1a4fa0]"
              style={{ fontFamily: "var(--font-sans)", fontWeight:600 }}>
              Nguyên tắc pháp lý bắt buộc — Hội đồng Thi đua Khen thưởng
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
              {[
                "Điều 56 Luật TĐKT 2022: Thành phần và thẩm quyền Hội đồng",
                "Khoản 4 Điều 56: Không xét hồ sơ của đơn vị mình (COI)",
                "Điều 38 NĐ 152/2025/NĐ-CP: Quy trình họp và biểu quyết",
                "TT 03/2018/TT-BNV: Điều kiện họp hợp lệ ≥2/3 thành viên có mặt",
                "TT 15/2025/TT-BNV: Biên bản họp phải có chữ ký đầy đủ",
              ].map(r => (
                <span key={r} className="text-[13px] text-[#1a4fa0]" style={{ fontFamily: "var(--font-sans)" }}>
                  · {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sessions grid */}
      <div className="flex-1 overflow-y-auto px-8 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map(s => (
            <SessionCard key={s.id} s={s} onOpen={() => setOpenSession(s)} />
          ))}
          {/* Empty placeholder */}
          <div className="ds-card ds-card-flat rounded-[10px] border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 cursor-pointer hover:border-[#1C5FBE60] transition-colors"
            style={{ borderColor:"var(--color-line)", minHeight:200 }}
            onClick={() => setShowCreate(true)}>
            <div className="size-12 rounded-full flex items-center justify-center" style={{ background:theme.tint }}>
              <Plus className="size-5" style={{ color:theme.primary }} />
            </div>
            <div className="text-center">
              <div className="text-[13px] text-[#0b1426]"
                style={{ fontFamily: "var(--font-sans)", fontWeight:500 }}>Tạo phiên họp mới</div>
              <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                Theo kế hoạch hoặc đột xuất
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateSessionModal
          sessions={sessions}
          campaigns={campaigns}
          onClose={() => setShowCreate(false)}
          onCreate={s => { setSessions(prev => [...prev, s]); setShowCreate(false); }}
        />
      )}
    </div>
  );
}
