import { useState } from "react";
import {
  Clock, AlertTriangle, CheckCircle2, XCircle, Bell,
  RefreshCw, Filter, ChevronRight, User, Building2,
  Award, Zap, TrendingUp, Target, Eye, ArrowRight,
  AlertCircle, Flag, Activity, BarChart2,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES & MOCK DATA
═══════════════════════════════════════════════════════════════ */
type SLAStatus = "on_time"|"warning"|"overdue"|"critical";
interface SLAItem {
  id:string; hoSoId:string; tenNguoi:string; donVi:string;
  danhHieu:string; stage:string; stageRole:string;
  deadline:string; daysLeft:number; status:SLAStatus;
  responsible:string; escalated:boolean;
}

const ITEMS: SLAItem[] = [
  { id:"1",  hoSoId:"NS-2026-0147", tenNguoi:"Nguyễn Văn An",     donVi:"VP Tỉnh ủy",       danhHieu:"CSTĐT",    stage:"Lãnh đạo ký số",           stageRole:"leader",  deadline:"24/04/2026", daysLeft:0,  status:"critical",  responsible:"Lê Thị Hương",   escalated:true  },
  { id:"2",  hoSoId:"NS-2026-0142", tenNguoi:"Trần Thị Bích",     donVi:"Sở Y tế",           danhHieu:"BKCP",     stage:"Lãnh đạo ký số",           stageRole:"leader",  deadline:"25/04/2026", daysLeft:1,  status:"critical",  responsible:"Lê Thị Hương",   escalated:true  },
  { id:"3",  hoSoId:"NS-2026-0139", tenNguoi:"Lê Minh Cường",     donVi:"Sở GTVT",           danhHieu:"HCLD3",    stage:"HĐ thẩm định hồ sơ",       stageRole:"council", deadline:"26/04/2026", daysLeft:2,  status:"warning",   responsible:"Trần Minh Đức",  escalated:false },
  { id:"4",  hoSoId:"NS-2026-0136", tenNguoi:"Phạm Thị Dung",     donVi:"Sở Tài chính",      danhHieu:"CSTĐCS",   stage:"Lấy ý kiến công khai",     stageRole:"council", deadline:"27/04/2026", daysLeft:3,  status:"warning",   responsible:"Phạm Văn Minh",  escalated:false },
  { id:"5",  hoSoId:"NS-2026-0131", tenNguoi:"Vũ Đức Hùng",       donVi:"Ban TC Tỉnh ủy",   danhHieu:"CSTĐT",    stage:"Trình ký Lãnh đạo",        stageRole:"council", deadline:"28/04/2026", daysLeft:4,  status:"warning",   responsible:"Trần Minh Đức",  escalated:false },
  { id:"6",  hoSoId:"NS-2026-0128", tenNguoi:"Đặng Quốc Khánh",   donVi:"VP Tỉnh ủy",       danhHieu:"HCLD2",    stage:"Bỏ phiếu tại HĐ",          stageRole:"council", deadline:"29/04/2026", daysLeft:5,  status:"on_time",   responsible:"Trần Thị Bích",  escalated:false },
  { id:"7",  hoSoId:"NS-2026-0125", tenNguoi:"Ngô Thị Hoa",       donVi:"Sở NN&PTNT",        danhHieu:"BKT",      stage:"ĐV đề nghị → HĐ tiếp nhận",stageRole:"manager", deadline:"30/04/2026", daysLeft:6,  status:"on_time",   responsible:"Nguyễn Thị Lan", escalated:false },
  { id:"8",  hoSoId:"NS-2026-0122", tenNguoi:"Trương Văn Minh",   donVi:"Sở Công Thương",    danhHieu:"CSTĐCS",   stage:"HĐ thẩm định hồ sơ",       stageRole:"council", deadline:"02/05/2026", daysLeft:8,  status:"on_time",   responsible:"Phạm Văn Minh",  escalated:false },
  { id:"9",  hoSoId:"NS-2026-0119", tenNguoi:"Lương Thị Ngọc",    donVi:"Sở Tư pháp",        danhHieu:"CSTĐCS",   stage:"HĐ thẩm định hồ sơ",       stageRole:"council", deadline:"05/05/2026", daysLeft:11, status:"on_time",   responsible:"Trần Minh Đức",  escalated:false },
  { id:"10", hoSoId:"NS-2026-0116", tenNguoi:"Hoàng Văn Tùng",    donVi:"Huyện Long Khánh",  danhHieu:"GK",       stage:"ĐV đề nghị → HĐ tiếp nhận",stageRole:"manager", deadline:"10/05/2026", daysLeft:16, status:"on_time",   responsible:"Nguyễn Thị Lan", escalated:false },
  { id:"11", hoSoId:"NS-2026-0113", tenNguoi:"Đinh Thị Thủy",     donVi:"TP Biên Hòa",       danhHieu:"TTLĐXS",   stage:"Lấy ý kiến công khai",     stageRole:"council", deadline:"23/04/2026", daysLeft:-1, status:"overdue",   responsible:"Phạm Văn Minh",  escalated:true  },
  { id:"12", hoSoId:"NS-2026-0110", tenNguoi:"Mai Xuân Hưng",      donVi:"Huyện Tân Phú",     danhHieu:"BKT",      stage:"Trình ký Lãnh đạo",        stageRole:"council", deadline:"22/04/2026", daysLeft:-2, status:"overdue",   responsible:"Trần Minh Đức",  escalated:true  },
];

const STATUS_CFG: Record<SLAStatus,{label:string;color:string;bg:string;icon:typeof Clock;border:string}> = {
  on_time:  { label:"Đúng hạn",    color:"#166534", bg:"#dcfce7", icon:CheckCircle2, border:"#86efac" },
  warning:  { label:"Sắp trễ",     color:"#b45309", bg:"#fef3c7", icon:AlertTriangle, border:"#fde68a" },
  overdue:  { label:"Quá hạn",     color:"#c8102e", bg:"#fee2e2", icon:XCircle,       border:"#fca5a5" },
  critical: { label:"Khẩn cấp",    color:"#7c2d12", bg:"#fff7ed", icon:Zap,           border:"#fed7aa" },
};

function SLAGauge({ pct, color }:{ pct:number; color:string }) {
  const r=28; const circ=2*Math.PI*r; const dash=circ*(1-pct/100);
  return (
    <svg width={72} height={72} viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f4f7fb" strokeWidth={7}/>
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
        transform="rotate(-90 36 36)" style={{ transition:"stroke-dashoffset 0.6s ease" }}/>
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central" style={{ fontSize:14,fontFamily:"JetBrains Mono, monospace",fontWeight:700,fill:color }}>{pct}%</text>
    </svg>
  );
}

export function SLAMonitorPage({ user }: { user: LoginUser }) {
  const [statusFilter,setStatusFilter]=useState<SLAStatus|"all">("all");
  const [stageFilter,setStageFilter]=useState("all");
  const [now]=useState(new Date());

  const filtered=ITEMS.filter(i=>(statusFilter==="all"||i.status===statusFilter)&&(stageFilter==="all"||i.stage===stageFilter));
  const stages=[...new Set(ITEMS.map(i=>i.stage))];
  const counts={ critical:ITEMS.filter(i=>i.status==="critical").length, overdue:ITEMS.filter(i=>i.status==="overdue").length, warning:ITEMS.filter(i=>i.status==="warning").length, on_time:ITEMS.filter(i=>i.status==="on_time").length };
  const slaRate=Math.round((counts.on_time/(ITEMS.length))*100);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:"#ffffff",fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0]" style={{ background:"white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background:"linear-gradient(135deg,#b45309,#c8102e)" }}>
            <Activity className="size-5 text-white"/>
          </div>
          <div>
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>SLA Monitor</h1>
            <p className="text-[13px] text-[#635647]">Theo dõi deadline real-time · TT 15/2025/TT-BNV · {ITEMS.length} hồ sơ đang xử lý</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {counts.critical+counts.overdue>0&&(
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] animate-pulse" style={{ background:"#fee2e2",border:"1px solid #fca5a5" }}>
                <AlertTriangle className="size-4 text-[#c8102e]"/>
                <span className="text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{counts.critical+counts.overdue} vi phạm SLA cần xử lý</span>
              </div>
            )}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#d1d5db] text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
              <RefreshCw className="size-3.5"/>Làm mới
            </button>
          </div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className="rounded-[10px] border-2 border-[#fde68a] p-3 flex items-center gap-3" style={{ background:"white" }}>
            <SLAGauge pct={slaRate} color="#166534"/>
            <div>
              <div className="text-[13px] text-[#635647]">SLA Compliance</div>
              <div className="text-[18px] text-[#166534]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{slaRate}%</div>
            </div>
          </div>
          {([["critical",counts.critical,"Khẩn cấp"],["overdue",counts.overdue,"Quá hạn"],["warning",counts.warning,"Sắp trễ"],["on_time",counts.on_time,"Đúng hạn"]] as [SLAStatus,number,string][]).map(([s,v,l])=>{
            const cfg=STATUS_CFG[s]; const Icon=cfg.icon;
            return (
              <button key={s} onClick={()=>setStatusFilter(statusFilter===s?"all":s)}
                className="rounded-[10px] border-2 p-4 flex flex-col items-center justify-center gap-1 transition-all"
                style={{ background:statusFilter===s?cfg.bg:"white",borderColor:statusFilter===s?cfg.border:"#e2e8f0" }}>
                <Icon className="size-5" style={{ color:cfg.color }}/>
                <div className="text-[24px] leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:cfg.color }}>{v}</div>
                <div className="text-[13px]" style={{ color:cfg.color,fontFamily: "var(--font-sans)" }}>{l}</div>
              </button>
            );
          })}
        </div>
        {/* Filters */}
        <div className="flex gap-2 items-center flex-wrap">
          <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)} className="px-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none" style={{ height:36,fontFamily: "var(--font-sans)" }}>
            <option value="all">Tất cả giai đoạn</option>
            {stages.map(s=><option key={s}>{s}</option>)}
          </select>
          <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{filtered.length} hồ sơ</span>
        </div>
      </div>
      {/* Table */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Critical & Overdue alert bar */}
        {filtered.some(i=>i.status==="critical"||i.status==="overdue")&&(
          <div className="mb-4 p-4 rounded-[10px] border-2 border-[#fca5a5] flex items-start gap-3 animate-pulse" style={{ background:"#fff5f5" }}>
            <Zap className="size-5 text-[#c8102e] shrink-0"/>
            <div className="text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>
              Cảnh báo vi phạm SLA: {filtered.filter(i=>i.status==="critical"||i.status==="overdue").length} hồ sơ cần xử lý ngay.
              Theo TT 15/2025/TT-BNV, vi phạm SLA phải được báo cáo lên Lãnh đạo trong vòng 24 giờ.
            </div>
          </div>
        )}
        <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
          <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <thead><tr style={{ background:"linear-gradient(to right,#0b1426,#1a2744)" }}>
              {["Hồ sơ","Cá nhân / Đơn vị","Danh hiệu","Giai đoạn hiện tại","Deadline","Còn lại","Người phụ trách","Trạng thái",""].map(h=><th key={h} className="text-left px-3 py-3 text-white" style={{ fontWeight:700 }}>{h}</th>)}
            </tr></thead>
            <tbody>{filtered.map((item,i)=>{
              const cfg=STATUS_CFG[item.status]; const SIcon=cfg.icon;
              const daysColor=item.daysLeft<0?"#c8102e":item.daysLeft<=1?"#c8102e":item.daysLeft<=3?"#b45309":"#166534";
              return (
                <tr key={item.id} className="border-t border-[#e2e8f0] hover:bg-[#f4f7fb] transition-colors" style={{ background:item.status==="critical"||item.status==="overdue"?"#fff8f8":i%2===0?"white":"#fdfcfa" }}>
                  <td className="px-3 py-3"><code className="text-[13px] text-[#1C5FBE]" style={{ fontFamily:"JetBrains Mono, monospace" }}>{item.hoSoId}</code></td>
                  <td className="px-3 py-3">
                    <div className="text-[13px] text-[#0b1426]" style={{ fontWeight:600 }}>{item.tenNguoi}</div>
                    <div className="text-[13px] text-[#635647]">{item.donVi}</div>
                  </td>
                  <td className="px-3 py-3"><span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#ddeafc",color:"#1C5FBE",fontFamily: "var(--font-sans)" }}>{item.danhHieu}</span></td>
                  <td className="px-3 py-3 text-[#5a5040]">{item.stage}</td>
                  <td className="px-3 py-3"><code className="text-[13px]" style={{ fontFamily:"JetBrains Mono, monospace",color:daysColor }}>{item.deadline}</code></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[14px]" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700,color:daysColor }}>
                        {item.daysLeft<0?`-${Math.abs(item.daysLeft)}`:item.daysLeft}
                      </span>
                      <span className="text-[13px]" style={{ color:daysColor }}>{item.daysLeft<0?"ngày trễ":"ngày còn"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[13px] text-[#5a5040]">{item.responsible}</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1 text-[13px] px-2 py-0.5 rounded" style={{ background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`,fontFamily: "var(--font-sans)",fontWeight:700 }}>
                      <SIcon className="size-3"/>{cfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {item.escalated&&<span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#fee2e2",color:"#c8102e",fontFamily: "var(--font-sans)" }}>Escalated</span>}
                      <button className="size-7 rounded flex items-center justify-center hover:bg-[#ddeafc] transition-colors">
                        <Eye className="size-3.5 text-[#1C5FBE]"/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
        {/* SLA rules reminder */}
        <div className="mt-4 p-4 rounded-[10px] border border-[#e2e8f0]" style={{ background:"#ffffff" }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4 text-[#b45309]"/>
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Quy định SLA theo TT 15/2025/TT-BNV</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[["ĐV → HĐ tiếp nhận","7 ngày LV","Manager","#1C5FBE"],["HĐ thẩm định","15 ngày LV","Council","#7c3aed"],["LYK công khai (tối thiểu)","5 ngày LV","Council","#c8102e"],["Bỏ phiếu HĐ","3 ngày LV","Council","#92400e"],].map(([gd,t,r,c])=>(
              <div key={gd as string} className="p-2.5 rounded-[6px] border" style={{ borderColor:`${c as string}30`,background:`${c as string}08` }}>
                <div className="text-[13px] text-[#5a5040] mb-0.5">{gd as string}</div>
                <div className="text-[14px]" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700,color:c as string }}>{t as string}</div>
                <div className="text-[13px] text-[#635647]">{r as string}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
