import { useState } from "react";
import {
  Shield, Search, Filter, Download, Clock, User, Building2,
  FileText, AlertTriangle, CheckCircle2, Info, Eye,
  Lock, LogIn, LogOut, Edit3, Trash2, Upload, Award,
  Gavel, FileSignature, ChevronDown, RefreshCw, X,
  Settings2, Database,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface AuditEvent {
  id: string;
  ts: string;   // timestamp
  user: string;
  role: string;
  ip: string;
  module: string;
  action: string;
  entity: string;
  entityId: string;
  level: "info"|"warn"|"critical"|"success";
  detail: string;
  changed?: { field:string; from:string; to:string }[];
}

const EVENTS: AuditEvent[] = [
  { id:"e01", ts:"2026-04-24 09:42:11", user:"Admin Hệ thống",       role:"admin",   ip:"10.0.0.1",  module:"Cấu hình",     action:"UPDATE_SLA",     entity:"SLAConfig",   entityId:"stage-ky-so", level:"warn", detail:"Thay đổi SLA giai đoạn Ký số từ 3 → 2 ngày làm việc", changed:[{field:"days",from:"3",to:"2"}] },
  { id:"e02", ts:"2026-04-24 09:38:05", user:"Lê Thị Hương",         role:"leader",  ip:"10.0.0.45", module:"Ký số",         action:"CA_SIGN",        entity:"Nomination",  entityId:"NS-2026-0147",level:"success",detail:"Ký số CA thành công: CSTĐCS Nguyễn Văn An, cert SN: A1F3" },
  { id:"e03", ts:"2026-04-24 09:15:22", user:"Trần Minh Đức",        role:"council", ip:"10.0.0.78", module:"Hội đồng",      action:"VOTE",           entity:"Session",     entityId:"HD-2026-03",  level:"info", detail:"Bỏ phiếu phiên họp HD-2026-03: Tán thành (12/14)" },
  { id:"e04", ts:"2026-04-24 08:55:10", user:"Nguyễn Thị Lan",       role:"manager", ip:"10.0.0.23", module:"Đề nghị KT",   action:"SUBMIT_HS",      entity:"Nomination",  entityId:"NS-2026-0152",level:"info", detail:"Nộp hồ sơ đề nghị CSTĐCS cho: Phạm Thị Dung" },
  { id:"e05", ts:"2026-04-24 08:32:44", user:"Vũ Đức Khoa",          role:"user",    ip:"10.0.0.91", module:"Đề nghị KT",   action:"CREATE_HS",      entity:"Nomination",  entityId:"NS-2026-0153",level:"info", detail:"Tạo hồ sơ đề nghị Bằng khen UBND tỉnh (bản nháp)" },
  { id:"e06", ts:"2026-04-24 08:10:03", user:"Admin Hệ thống",       role:"admin",   ip:"10.0.0.1",  module:"Phân quyền",   action:"GRANT_ROLE",     entity:"User",        entityId:"user-045",    level:"warn", detail:"Cấp quyền Council cho tài khoản: nguyen.van.hoa@dongnai.gov.vn" },
  { id:"e07", ts:"2026-04-23 17:45:00", user:"Lê Thị Hương",         role:"leader",  ip:"10.0.0.45", module:"Auth",         action:"LOGOUT",         entity:"Session",     entityId:"sess-9a3f",   level:"info", detail:"Đăng xuất thành công" },
  { id:"e08", ts:"2026-04-23 17:20:38", user:"Unknown",              role:"-",       ip:"203.0.1.55",module:"Auth",         action:"LOGIN_FAILED",   entity:"Account",     entityId:"admin@system",level:"critical", detail:"⚠ 5 lần đăng nhập thất bại liên tiếp từ IP nước ngoài — đã tạm khóa 15 phút" },
  { id:"e09", ts:"2026-04-23 16:58:12", user:"Trần Minh Đức",        role:"council", ip:"10.0.0.78", module:"Chấm điểm",    action:"SUBMIT_SCORE",   entity:"Score",       entityId:"SC-2026-0041",level:"success",detail:"Nộp điểm thẩm định: NS-2026-0141, Tổng: 91.5/100" },
  { id:"e10", ts:"2026-04-23 16:22:05", user:"Admin Hệ thống",       role:"admin",   ip:"10.0.0.1",  module:"Cấu hình",     action:"UPDATE_AWARD",   entity:"AwardConfig", entityId:"cstd-t",      level:"warn", detail:"Sửa điều kiện CSTĐT: minScore từ 85 → 90",             changed:[{field:"minScore",from:"85",to:"90"}] },
  { id:"e11", ts:"2026-04-23 15:10:44", user:"Nguyễn Thị Lan",       role:"manager", ip:"10.0.0.23", module:"Đề nghị KT",   action:"UPLOAD_FILE",    entity:"Attachment",  entityId:"att-2026-0891",level:"info", detail:"Upload file: Báo cáo thành tích 2025.pdf (3.2MB)" },
  { id:"e12", ts:"2026-04-23 14:45:30", user:"Phạm Văn Minh",        role:"council", ip:"10.0.0.56", module:"Lấy ý kiến",   action:"VIEW_OPINIONS",  entity:"LYKCase",     entityId:"LYK-2026-012",level:"info", detail:"Xem kết quả lấy ý kiến: 48 phản hồi, 2 phản đối" },
  { id:"e13", ts:"2026-04-23 11:38:20", user:"Lê Thị Hương",         role:"leader",  ip:"10.0.0.45", module:"Quyết định",   action:"PUBLISH_QD",     entity:"Decision",    entityId:"QD-001/2026", level:"success",detail:"Phát hành QĐ chính thức: Số 001/QĐ-UBND-2026, 3 cá nhân" },
  { id:"e14", ts:"2026-04-23 09:20:15", user:"Admin Hệ thống",       role:"admin",   ip:"10.0.0.1",  module:"Hệ thống",     action:"BACKUP_COMPLETE",entity:"Database",    entityId:"backup-daily",level:"success",detail:"Backup tự động hoàn thành: 2.4GB, lưu S3 Asia-Pacific" },
  { id:"e15", ts:"2026-04-22 16:05:00", user:"Hoàng Văn Tùng",       role:"user",    ip:"10.0.0.112",module:"Auth",         action:"LOGIN_2FA",      entity:"Session",     entityId:"sess-7b2e",   level:"success",detail:"Đăng nhập xác thực 2FA thành công (TOTP)" },
  { id:"e16", ts:"2026-04-22 14:30:22", user:"Admin Hệ thống",       role:"admin",   ip:"10.0.0.1",  module:"Cấu hình",     action:"UPDATE_ORG",     entity:"OrgUnit",     entityId:"org-so-gd",   level:"warn", detail:"Sửa thông tin đơn vị: Sở GD&ĐT, headCount 320 → 325", changed:[{field:"headCount",from:"320",to:"325"}] },
  { id:"e17", ts:"2026-04-22 10:15:45", user:"Trần Thị Bích",        role:"council", ip:"10.0.0.67", module:"Hội đồng",     action:"CREATE_SESSION", entity:"Session",     entityId:"HD-2026-04",  level:"info", detail:"Tạo phiên họp HD-2026-04, dự kiến 28/04/2026, 9:00" },
  { id:"e18", ts:"2026-04-21 17:50:30", user:"Unknown",              role:"-",       ip:"118.69.1.22",module:"API",         action:"RATE_LIMIT",     entity:"Endpoint",    entityId:"/api/v1/auth",level:"critical",detail:"⚠ Rate limit breached: 247 requests/min từ IP Vietnam (nghi ngờ bot)" },
];

const LEVEL_CFG = {
  info:     { color:"#1C5FBE", bg:"#ddeafc", icon:Info },
  success:  { color:"#166534", bg:"#dcfce7", icon:CheckCircle2 },
  warn:     { color:"#b45309", bg:"#fef3c7", icon:AlertTriangle },
  critical: { color:"#c8102e", bg:"#fee2e2", icon:AlertTriangle },
};
const MODULE_ICONS: Record<string,typeof Shield> = {
  "Auth":Shield, "Đề nghị KT":Award, "Hội đồng":Gavel, "Ký số":FileSignature,
  "Chấm điểm":FileText, "Lấy ý kiến":Eye, "Quyết định":FileText,
  "Cấu hình":Settings2, "Phân quyền":Lock, "Hệ thống":Database,
  "API":Shield,
};
const ACTION_ICONS: Record<string,typeof Shield> = {
  "CA_SIGN":FileSignature, "LOGIN_FAILED":LogIn, "LOGIN_2FA":LogIn, "LOGOUT":LogOut,
  "SUBMIT_HS":Upload, "CREATE_HS":Edit3, "UPLOAD_FILE":Upload,
  "GRANT_ROLE":Lock, "UPDATE_SLA":Settings2, "UPDATE_AWARD":Award,
  "UPDATE_ORG":Building2, "VOTE":Gavel, "SUBMIT_SCORE":CheckCircle2,
  "PUBLISH_QD":Award, "BACKUP_COMPLETE":Database, "CREATE_SESSION":Gavel,
  "RATE_LIMIT":AlertTriangle, "VIEW_OPINIONS":Eye,
};

export function AuditLogPage({ user }: { user: LoginUser }) {
  const [search,setSearch]=useState("");
  const [levelFilter,setLevelFilter]=useState("all");
  const [modFilter,setModFilter]=useState("all");
  const [expanded,setExpanded]=useState<string|null>(null);

  const filtered=EVENTS.filter(e=>{
    const ms=e.user.toLowerCase().includes(search.toLowerCase())||e.action.toLowerCase().includes(search.toLowerCase())||e.detail.toLowerCase().includes(search.toLowerCase())||e.entityId.toLowerCase().includes(search.toLowerCase());
    const ml=levelFilter==="all"||e.level===levelFilter;
    const mm=modFilter==="all"||e.module===modFilter;
    return ms&&ml&&mm;
  });
  const modules=[...new Set(EVENTS.map(e=>e.module))].sort();
  const stats={ total:EVENTS.length, critical:EVENTS.filter(e=>e.level==="critical").length, warn:EVENTS.filter(e=>e.level==="warn").length, success:EVENTS.filter(e=>e.level==="success").length };

  if(user.role!=="quản trị hệ thống") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-16 text-center" style={{ background:"#faf7f2" }}>
        <Shield className="size-16 text-[#d1d5db]"/>
        <h2 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Chỉ Admin mới có quyền xem Audit Log</h2>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:"#0b1426",fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b shrink-0" style={{ borderColor:"rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background:"linear-gradient(135deg,#c8102e,#7c3aed)" }}>
            <Shield className="size-5 text-white"/>
          </div>
          <div>
            <h1 className="text-[18px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>
              Audit Log <span style={{ color:"#8a6400" }}>Hệ thống</span>
            </h1>
            <p className="text-[13px]" style={{ color:"rgba(255,255,255,0.5)",fontFamily: "var(--font-sans)" }}>
              Nhật ký bất biến · Lưu trữ 5 năm theo NĐ 13/2023 · {EVENTS.length} sự kiện
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-[13px]" style={{ background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.15)",fontFamily: "var(--font-sans)" }}>
              <RefreshCw className="size-3.5"/>Làm mới
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-[13px] text-white" style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>
              <Download className="size-3.5"/>Xuất CSV
            </button>
          </div>
        </div>
        {/* Stats */}
        <div className="flex gap-3 mb-4">
          {[
            { l:"Tổng sự kiện",   v:stats.total,    c:"rgba(255,255,255,0.7)", bg:"rgba(255,255,255,0.08)", border:"rgba(255,255,255,0.15)" },
            { l:"Critical",       v:stats.critical, c:"#fca5a5", bg:"rgba(200,16,46,0.2)", border:"rgba(200,16,46,0.4)" },
            { l:"Warning",        v:stats.warn,     c:"#fde68a", bg:"rgba(217,119,6,0.2)",  border:"rgba(217,119,6,0.4)"  },
            { l:"Success",        v:stats.success,  c:"#86efac", bg:"rgba(22,101,52,0.2)",  border:"rgba(22,101,52,0.4)"  },
          ].map(s=>(
            <div key={s.l} className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border" style={{ background:s.bg,borderColor:s.border }}>
              <span className="text-[18px] leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:s.c }}>{s.v}</span>
              <span className="text-[13px]" style={{ color:s.c,fontFamily: "var(--font-sans)" }}>{s.l}</span>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.4)" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm user, action, entity ID..."
              className="pl-9 pr-3 text-[13px] rounded-[6px] outline-none" style={{ height:36,width:260,fontFamily: "var(--font-sans)",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",color:"white" }}/>
          </div>
          <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-3 text-[13px] rounded-[6px] outline-none" style={{ height:36,fontFamily: "var(--font-sans)",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",color:"white" }}>
            <option value="all" style={{ background:"#1a2744" }}>Tất cả level</option>
            {["critical","warn","info","success"].map(l=><option key={l} value={l} style={{ background:"#1a2744" }}>{l.toUpperCase()}</option>)}
          </select>
          <select value={modFilter} onChange={e=>setModFilter(e.target.value)} className="px-3 text-[13px] rounded-[6px] outline-none" style={{ height:36,fontFamily: "var(--font-sans)",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",color:"white" }}>
            <option value="all" style={{ background:"#1a2744" }}>Tất cả module</option>
            {modules.map(m=><option key={m} value={m} style={{ background:"#1a2744" }}>{m}</option>)}
          </select>
          <span className="ml-auto text-[13px]" style={{ color:"rgba(255,255,255,0.4)",fontFamily: "var(--font-sans)" }}>{filtered.length} sự kiện</span>
        </div>
      </div>
      {/* Log entries */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1.5">
        {filtered.map(e=>{
          const lc=LEVEL_CFG[e.level];
          const LIcon=lc.icon;
          const ModIcon=MODULE_ICONS[e.module]||Shield;
          const ActIcon=ACTION_ICONS[e.action]||Info;
          const isExp=expanded===e.id;
          return (
            <div key={e.id} className="rounded-[8px] border overflow-hidden transition-all" style={{ borderColor:e.level==="critical"?"rgba(200,16,46,0.5)":e.level==="warn"?"rgba(217,119,6,0.3)":"rgba(255,255,255,0.1)",background:e.level==="critical"?"rgba(200,16,46,0.08)":e.level==="warn"?"rgba(217,119,6,0.05)":"rgba(255,255,255,0.03)" }}>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={()=>setExpanded(isExp?null:e.id)}>
                {/* Level icon */}
                <LIcon className="size-4 shrink-0" style={{ color:lc.color }}/>
                {/* Timestamp */}
                <code className="text-[13px] shrink-0 w-[120px]" style={{ color:"rgba(255,255,255,0.35)",fontFamily:"JetBrains Mono, monospace" }}>
                  {e.ts.split(" ")[0].slice(5)}{" "}{e.ts.split(" ")[1]}
                </code>
                {/* Module badge */}
                <span className="shrink-0 flex items-center gap-1 text-[13px] px-2 py-0.5 rounded" style={{ background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.12)" }}>
                  <ModIcon className="size-3"/>{e.module}
                </span>
                {/* Action */}
                <code className="shrink-0 text-[13px] px-2 py-0.5 rounded" style={{ background:lc.bg+"22",color:lc.color,fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{e.action}</code>
                {/* User */}
                <span className="text-[13px] shrink-0" style={{ color:"rgba(255,255,255,0.7)",fontFamily: "var(--font-sans)" }}>{e.user}</span>
                {/* Detail preview */}
                <span className="flex-1 text-[13px] truncate" style={{ color:"rgba(255,255,255,0.45)",fontFamily: "var(--font-sans)" }}>{e.detail}</span>
                {/* Entity ID */}
                <code className="text-[13px] shrink-0" style={{ color:"rgba(255,255,255,0.25)",fontFamily:"JetBrains Mono, monospace" }}>{e.entityId}</code>
                <ChevronDown className="size-3.5 shrink-0" style={{ color:"rgba(255,255,255,0.3)",transform:isExp?"rotate(180deg)":"none",transition:"transform 0.2s" }}/>
              </button>
              {isExp&&(
                <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor:"rgba(255,255,255,0.08)" }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      {[["Timestamp",e.ts],["User",e.user],["Role",e.role],["IP Address",e.ip],["Module",e.module],["Action",e.action],["Entity",e.entity],["Entity ID",e.entityId]].map(([k,v])=>(
                        <div key={k as string} className="flex gap-2 text-[13px]">
                          <span className="w-[80px] shrink-0" style={{ color:"rgba(255,255,255,0.35)",fontFamily: "var(--font-sans)" }}>{k as string}</span>
                          <span style={{ color:"rgba(255,255,255,0.75)",fontFamily:"JetBrains Mono, monospace" }}>{v as string}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[13px] mb-2" style={{ color:"rgba(255,255,255,0.35)",fontFamily: "var(--font-sans)" }}>Chi tiết sự kiện</div>
                      <div className="text-[13px] p-3 rounded-[6px]" style={{ background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.7)",fontFamily: "var(--font-sans)",lineHeight:1.6 }}>{e.detail}</div>
                      {e.changed&&(
                        <div className="mt-2">
                          <div className="text-[13px] mb-1.5" style={{ color:"rgba(255,255,255,0.35)",fontFamily: "var(--font-sans)" }}>Thay đổi dữ liệu (diff):</div>
                          {e.changed.map((c,i)=>(
                            <div key={i} className="flex items-center gap-2 text-[13px] p-2 rounded" style={{ background:"rgba(255,255,255,0.05)" }}>
                              <code style={{ fontFamily:"JetBrains Mono, monospace",color:"#8a6400" }}>{c.field}</code>
                              <span style={{ color:"#fca5a5",fontFamily:"JetBrains Mono, monospace" }}>"{c.from}"</span>
                              <span style={{ color:"rgba(255,255,255,0.4)" }}>→</span>
                              <span style={{ color:"#86efac",fontFamily:"JetBrains Mono, monospace" }}>"{c.to}"</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length===0&&(
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Search className="size-12" style={{ color:"rgba(255,255,255,0.15)" }}/>
            <p className="text-[14px]" style={{ color:"rgba(255,255,255,0.3)",fontFamily: "var(--font-sans)" }}>Không tìm thấy sự kiện nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
