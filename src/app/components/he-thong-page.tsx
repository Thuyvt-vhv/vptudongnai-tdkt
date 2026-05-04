import { useState, useEffect } from "react";
import {
  Activity, Server, Database, Wifi, Clock, Users,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Cpu, HardDrive, BarChart2, Zap, Globe, Shield,
  ArrowUp, ArrowDown, TrendingUp, Trash2,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { clearPersistedData } from "@/app/hooks/use-persisted-state";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface ServiceStatus { name:string; status:"up"|"degraded"|"down"; latency:number; uptime:number; endpoint:string }
interface MetricPoint { t:string; v:number }

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA (simulates real-time fluctuation)
═══════════════════════════════════════════════════════════════ */
const SERVICES: ServiceStatus[] = [
  { name:"API Gateway",         status:"up",       latency:42,  uptime:99.97, endpoint:"/health" },
  { name:"Auth Service (JWT)",  status:"up",       latency:18,  uptime:99.99, endpoint:"/auth/health" },
  { name:"File Storage (S3)",   status:"up",       latency:85,  uptime:99.95, endpoint:"/storage/ping" },
  { name:"CA Signing Service",  status:"degraded", latency:312, uptime:98.42, endpoint:"/ca/health" },
  { name:"AI/NLP Service",      status:"up",       latency:124, uptime:99.81, endpoint:"/ai/health" },
  { name:"Email/SMS Gateway",   status:"up",       latency:67,  uptime:99.88, endpoint:"/notify/health" },
  { name:"PostgreSQL Primary",  status:"up",       latency:8,   uptime:99.99, endpoint:"/db/health" },
  { name:"Redis Cache",         status:"up",       latency:3,   uptime:100,   endpoint:"/cache/health" },
  { name:"PDF Renderer",        status:"up",       latency:245, uptime:99.72, endpoint:"/pdf/health" },
  { name:"Audit Log Writer",    status:"up",       latency:12,  uptime:99.99, endpoint:"/audit/health" },
];

/* ═══════════════════════════════════════════════════════════════
   SPARKLINE COMPONENT
═══════════════════════════════════════════════════════════════ */
function Sparkline({ data, color, height=32 }:{ data:number[]; color:string; height?:number }) {
  if(!data.length) return null;
  const w=120; const h=height;
  const min=Math.min(...data); const max=Math.max(...data)||1;
  const xStep=w/(data.length-1||1);
  const yFor=(v:number)=>h-4-((v-min)/(max-min||1))*(h-8);
  const pts=data.map((v,i)=>`${i===0?"M":"L"}${i*xStep},${yFor(v)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3}/>
          <stop offset="100%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <path d={`${pts} L${(data.length-1)*xStep},${h} L0,${h} Z`} fill={`url(#sg-${color.replace("#","")})`}/>
      <path d={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GAUGE COMPONENT
═══════════════════════════════════════════════════════════════ */
function Gauge({ value, max=100, color, size=80 }:{ value:number; max?:number; color:string; size?:number }) {
  const r=(size/2)-8; const circ=2*Math.PI*r;
  const dash=circ*(value/max); const gap=circ-dash;
  const danger=value/max>0.85; const warn=value/max>0.7;
  const c=danger?"#c8102e":warn?"#b45309":color;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eef2f8" strokeWidth={8}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={8}
        strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:"stroke-dasharray 1s ease, stroke 0.5s ease" }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{ fontSize:14,fontFamily:"JetBrains Mono, monospace",fontWeight:700,fill:c }}>{Math.round(value)}%</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function HeThongPage({ user }: { user: LoginUser }) {
  const [tick,setTick]=useState(0);
  useEffect(()=>{ const t=setInterval(()=>setTick(p=>p+1),3000); return ()=>clearInterval(t); },[]);

  // Simulated fluctuating metrics
  const cpu=Math.round(38+Math.sin(tick*0.7)*12);
  const ram=Math.round(62+Math.sin(tick*0.4)*8);
  const disk=71;
  const conn=Math.round(124+Math.sin(tick*0.5)*18);
  const rps=Math.round(284+Math.sin(tick*0.9)*56);
  const p95=Math.round(68+Math.sin(tick*0.6)*22);
  const activeSessions=Math.round(31+Math.sin(tick*0.3)*7);

  // Sparkline history
  const genHist=(base:number,amp:number,len=12)=>Array.from({length:len},(_,i)=>Math.max(0,Math.min(100,base+Math.sin((tick+i)*0.5)*amp+Math.random()*5)));
  const cpuHist=genHist(38,12); const ramHist=genHist(62,6); const rpsHist=genHist(280,50,12).map(v=>v*3);

  const up=SERVICES.filter(s=>s.status==="up").length;
  const down=SERVICES.filter(s=>s.status==="down").length;
  const deg=SERVICES.filter(s=>s.status==="degraded").length;
  const overallOk=down===0&&deg===0;

  if(user.role!=="quản trị hệ thống") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4" style={{ background:"#ffffff" }}>
        <Shield className="size-14 text-[#d1d5db]"/>
        <p className="text-[14px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>Chỉ Admin mới có quyền xem System Health</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:"#0b1426",fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b shrink-0" style={{ borderColor:"rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.03)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background:"linear-gradient(135deg,#166534,#0891b2)" }}>
            <Activity className="size-5 text-white"/>
          </div>
          <div>
            <h1 className="text-[18px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>
              System Health <span style={{ color:"#8a6400" }}>Monitor</span>
            </h1>
            <p className="text-[13px]" style={{ color:"rgba(255,255,255,0.4)",fontFamily: "var(--font-sans)" }}>
              VPTU Đồng Nai v2.0 · {SERVICES.length} services · Production Environment · Auto-refresh 3s
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] border`} style={{ background:overallOk?"rgba(22,101,52,0.2)":"rgba(217,119,6,0.2)",borderColor:overallOk?"#166534":"#b45309" }}>
              {overallOk?<CheckCircle2 className="size-4 text-[#4ade80]"/>:<AlertTriangle className="size-4 text-[#fde68a]"/>}
              <span className="text-[13px]" style={{ color:overallOk?"#4ade80":"#fde68a",fontFamily: "var(--font-sans)",fontWeight:700 }}>
                {overallOk?"All Systems Operational":`${deg} degraded · ${down} down`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px]" style={{ color:"rgba(255,255,255,0.35)",fontFamily: "var(--font-sans)" }}>
              <RefreshCw className="size-3.5 animate-spin" style={{ animationDuration:"3s" }}/>
              Live
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Top metrics */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:"Uptime",           value:"99.94%", sub:"30 ngày gần nhất",   icon:Activity,  color:"#4ade80",  trend:"+0.02%" },
            { label:"Active Sessions",  value:activeSessions, sub:"người dùng hiện tại",icon:Users,  color:"#60a5fa",  trend:`+${Math.floor(activeSessions/10)}` },
            { label:"Requests/s",       value:rps,      sub:"API calls/giây TB",  icon:Zap,       color:"#8a6400",  trend:`${rps>300?"+":"-"}5%` },
            { label:"P95 Latency",      value:`${p95}ms`, sub:"percentile 95",     icon:Clock,     color:p95>100?"#fca5a5":"#4ade80", trend:p95>100?"⬆":"⬇" },
          ].map(m=>{ const Icon=m.icon; return (
            <div key={m.label} className="rounded-[10px] border p-4" style={{ background:"rgba(255,255,255,0.04)",borderColor:"rgba(255,255,255,0.1)" }}>
              <div className="flex items-center justify-between mb-2">
                <Icon className="size-4" style={{ color:m.color }}/>
                <span className="text-[13px]" style={{ color:m.color,fontFamily:"JetBrains Mono, monospace" }}>{m.trend}</span>
              </div>
              <div className="text-[24px] leading-none mb-1" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:m.color }}>{m.value}</div>
              <div className="text-[13px]" style={{ color:"rgba(255,255,255,0.4)",fontFamily: "var(--font-sans)" }}>{m.label}</div>
              <div className="text-[13px]" style={{ color:"rgba(255,255,255,0.25)" }}>{m.sub}</div>
            </div>
          );})}
        </div>

        {/* Server resources + sparklines */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:"CPU Usage",   value:cpu,  hist:cpuHist,  color:"#60a5fa",  icon:Cpu,       detail:`${conn} db connections` },
            { label:"RAM Usage",   value:ram,  hist:ramHist,  color:"#a78bfa",  icon:Server,    detail:"8.4 / 16 GB used" },
            { label:"Disk Usage",  value:disk, hist:genHist(71,2), color:"#34d399",icon:HardDrive,detail:"142 / 200 GB used" },
          ].map(r=>{ const Icon=r.icon; const warn=r.value>70; const danger=r.value>85; const c=danger?"#f87171":warn?"#fbbf24":r.color; return (
            <div key={r.label} className="rounded-[10px] border p-4 flex items-center gap-4" style={{ background:"rgba(255,255,255,0.04)",borderColor:"rgba(255,255,255,0.1)" }}>
              <Gauge value={r.value} color={r.color} size={80}/>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="size-4" style={{ color:c }}/>
                  <span className="text-[13px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{r.label}</span>
                </div>
                <div className="text-[13px] mb-2" style={{ color:"rgba(255,255,255,0.4)" }}>{r.detail}</div>
                <Sparkline data={r.hist} color={c}/>
              </div>
            </div>
          );})}
        </div>

        {/* Service health table */}
        <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background:"rgba(255,255,255,0.04)",borderColor:"rgba(255,255,255,0.1)" }}>
            <Globe className="size-4 text-[#60a5fa]"/>
            <span className="text-[13px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Service Health</span>
            <div className="ml-auto flex items-center gap-3 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
              <span className="flex items-center gap-1 text-[#4ade80]"><CheckCircle2 className="size-3"/>{up} Up</span>
              {deg>0&&<span className="flex items-center gap-1 text-[#fbbf24]"><AlertTriangle className="size-3"/>{deg} Degraded</span>}
              {down>0&&<span className="flex items-center gap-1 text-[#f87171]"><XCircle className="size-3"/>{down} Down</span>}
            </div>
          </div>
          <table className="w-full text-[13px]">
            <thead><tr style={{ background:"rgba(255,255,255,0.03)" }}>
              {["Service","Status","Latency","Uptime (30d)","Endpoint"].map(h=><th key={h} className="text-left px-4 py-2.5" style={{ color:"rgba(255,255,255,0.35)",fontFamily: "var(--font-sans)",fontWeight:700 }}>{h}</th>)}
            </tr></thead>
            <tbody>{SERVICES.map((s,i)=>{
              const color=s.status==="up"?"#4ade80":s.status==="degraded"?"#fbbf24":"#f87171";
              const Icon=s.status==="up"?CheckCircle2:s.status==="degraded"?AlertTriangle:XCircle;
              return (
                <tr key={s.name} className="border-t" style={{ borderColor:"rgba(255,255,255,0.05)",background:i%2===0?"rgba(255,255,255,0.02)":"transparent" }}>
                  <td className="px-4 py-2.5 text-white">{s.name}</td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-[13px]" style={{ color,fontFamily: "var(--font-sans)",fontWeight:700 }}>
                      <Icon className="size-3.5"/>
                      {s.status==="up"?"Operational":s.status==="degraded"?"Degraded":"Down"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span style={{ fontFamily:"JetBrains Mono, monospace",color:s.latency>200?"#fbbf24":s.latency>100?"#60a5fa":"#4ade80" }}>{s.latency}ms</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.1)",maxWidth:80 }}>
                        <div className="h-full rounded-full" style={{ width:`${s.uptime}%`,background:s.uptime>99?"#4ade80":s.uptime>98?"#fbbf24":"#f87171" }}/>
                      </div>
                      <span style={{ fontFamily:"JetBrains Mono, monospace",color:s.uptime>99?"#4ade80":s.uptime>98?"#fbbf24":"#f87171" }}>{s.uptime}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><code style={{ color:"rgba(255,255,255,0.3)",fontFamily:"JetBrains Mono, monospace",fontSize: 13 }}>{s.endpoint}</code></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>

        {/* Recent events */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"rgba(255,255,255,0.1)" }}>
            <div className="px-4 py-3 border-b" style={{ background:"rgba(255,255,255,0.04)",borderColor:"rgba(255,255,255,0.1)" }}>
              <span className="text-[13px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Database Stats</span>
            </div>
            <div className="p-4 space-y-3">
              {[["Tổng bản ghi","4,287,391","records"],["Nominations (active)","124","hồ sơ"],["QĐ đã ban hành","1,162","quyết định"],["Audit events (30d)","48,391","sự kiện"],["DB Size","14.2 GB","on-disk"],["Connections (pool)","38/100","active"],].map(([k,v,u])=>(
                <div key={k as string} className="flex items-center justify-between">
                  <span className="text-[13px]" style={{ color:"rgba(255,255,255,0.4)",fontFamily: "var(--font-sans)" }}>{k as string}</span>
                  <div className="flex items-baseline gap-1">
                    <span style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700,color:"rgba(255,255,255,0.8)" }}>{v as string}</span>
                    <span className="text-[13px]" style={{ color:"rgba(255,255,255,0.3)" }}>{u as string}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:"rgba(255,255,255,0.1)" }}>
            <div className="px-4 py-3 border-b" style={{ background:"rgba(255,255,255,0.04)",borderColor:"rgba(255,255,255,0.1)" }}>
              <span className="text-[13px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Recent Events</span>
            </div>
            <div className="p-4 space-y-2">
              {[
                { l:"CA signing degraded (latency 312ms)",t:"5 phút",c:"#fbbf24",ic:AlertTriangle },
                { l:"Auto backup completed (2.4GB → S3)",t:"7 giờ",c:"#4ade80",ic:CheckCircle2 },
                { l:"Rate limit breach: 247 req/min",t:"12 giờ",c:"#f87171",ic:XCircle },
                { l:"AI service restarted (planned)",t:"1 ngày",c:"#60a5fa",ic:RefreshCw },
                { l:"PostgreSQL vacuum completed",t:"2 ngày",c:"#4ade80",ic:CheckCircle2 },
                { l:"SSL cert renewed (expires 2027)",t:"7 ngày",c:"#4ade80",ic:CheckCircle2 },
              ].map((e,i)=>{ const EIcon=e.ic; return (
                <div key={i} className="flex items-center gap-2 text-[13px]">
                  <EIcon className="size-3.5 shrink-0" style={{ color:e.c }}/>
                  <span className="flex-1 truncate" style={{ color:"rgba(255,255,255,0.6)",fontFamily: "var(--font-sans)" }}>{e.l}</span>
                  <span style={{ color:"rgba(255,255,255,0.25)",fontFamily:"JetBrains Mono, monospace" }}>{e.t}</span>
                </div>
              );})}
            </div>
          </div>
        </div>

        {/* Demo data management */}
        <div className="mt-4 mx-6 mb-6 rounded-xl p-4 flex items-center gap-4"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(239,68,68,0.25)" }}>
          <Trash2 className="size-5 shrink-0" style={{ color:"#f87171" }}/>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-white">Reset dữ liệu Demo</div>
            <div className="text-[12px] mt-0.5" style={{ color:"rgba(255,255,255,0.45)" }}>
              Xóa toàn bộ dữ liệu lưu trong trình duyệt và khôi phục về dữ liệu gốc.
              Tải lại trang sau khi reset.
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Reset toàn bộ dữ liệu demo về trạng thái ban đầu?")) {
                clearPersistedData();
                window.location.reload();
              }
            }}
            className="shrink-0 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
            style={{ background:"rgba(239,68,68,0.2)", color:"#f87171", border:"1px solid rgba(239,68,68,0.3)" }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}