import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp, TrendingDown, Award, Users, Clock,
  BarChart3, Download, Filter, RefreshCw, Calendar,
  Trophy, ChevronUp, ChevronDown, Target, AlertTriangle,
  CheckCircle2, Building2, FileText,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const monthlyData = [
  { month:"T1", hoSo:42, duyet:30, tuChoi:5, pending:7 },
  { month:"T2", hoSo:58, duyet:41, tuChoi:8, pending:9 },
  { month:"T3", hoSo:71, duyet:55, tuChoi:10,pending:6 },
  { month:"T4", hoSo:63, duyet:52, tuChoi:6, pending:5 },
  { month:"T5", hoSo:89, duyet:72, tuChoi:11,pending:6 },
  { month:"T6", hoSo:104,duyet:88, tuChoi:9, pending:7 },
  { month:"T7", hoSo:97, duyet:81, tuChoi:8, pending:8 },
  { month:"T8", hoSo:118,duyet:99, tuChoi:12,pending:7 },
  { month:"T9", hoSo:134,duyet:110,tuChoi:14,pending:10},
  { month:"T10",hoSo:142,duyet:121,tuChoi:13,pending:8 },
  { month:"T11",hoSo:156,duyet:131,tuChoi:16,pending:9 },
  { month:"T12",hoSo:88, duyet:76, tuChoi:8, pending:4 },
];

const unitData = [
  { name:"Sở GD&ĐT",     hoSo:48, duyet:43, diem:94.2, change:+2.4 },
  { name:"Sở Y tế",      hoSo:41, duyet:38, diem:92.6, change:+0.5 },
  { name:"Sở GTVT",      hoSo:35, duyet:31, diem:89.4, change:+2.7 },
  { name:"Sở Tài chính", hoSo:32, duyet:28, diem:87.1, change:-1.2 },
  { name:"Sở NN&PTNT",   hoSo:29, duyet:25, diem:84.8, change:+2.6 },
  { name:"Sở Công Thương",hoSo:27,duyet:22, diem:81.3, change:+1.8 },
  { name:"Sở Tư pháp",   hoSo:24, duyet:19, diem:79.5, change:-0.3 },
  { name:"Sở KH&ĐT",     hoSo:22, duyet:18, diem:77.2, change:+1.1 },
  { name:"VP Tỉnh ủy",   hoSo:20, duyet:17, diem:75.8, change:+3.2 },
  { name:"Ban TC TU",     hoSo:18, duyet:15, diem:73.4, change:-0.8 },
];

const awardTypeData = [
  { name:"CSTĐCS",    value:312, color:"#1C5FBE" },
  { name:"CSTĐT",     value:87,  color:"#7c3aed" },
  { name:"Bằng khen T",value:156, color:"#8a6400" },
  { name:"CSTĐTQ",    value:24,  color:"#c8102e" },
  { name:"Bằng khen CP",value:18, color:"#0b1426" },
  { name:"Giấy khen", value:428, color:"#166534" },
  { name:"TTLĐXS",    value:203, color:"#0891b2" },
];

const radarData = [
  { subject:"Thành tích", A:90, B:75, fullMark:100 },
  { subject:"Đóng góp TT",A:88, B:72, fullMark:100 },
  { subject:"Thi đua LT", A:85, B:80, fullMark:100 },
  { subject:"Đổi mới ST", A:76, B:68, fullMark:100 },
  { subject:"Đạo đức",    A:92, B:85, fullMark:100 },
];

const slaData = [
  { stage:"ĐV → HĐ",    target:7,  actual:5.2,  ontime:94 },
  { stage:"HĐ thẩm định",target:15, actual:12.8, ontime:88 },
  { stage:"LYK công khai",target:5, actual:5.8,  ontime:96 },
  { stage:"Bỏ phiếu",    target:3,  actual:2.1,  ontime:98 },
  { stage:"Trình ký",    target:3,  actual:4.2,  ontime:71 },
  { stage:"Ký số",       target:2,  actual:1.8,  ontime:97 },
];

/* ═══════════════════════════════════════════════════════════════
   CUSTOM TOOLTIP
═══════════════════════════════════════════════════════════════ */
const CustomTooltip = ({ active,payload,label }:any) => {
  if(!active||!payload?.length) return null;
  return (
    <div className="rounded-[8px] border border-[#e2e8f0] p-3 shadow-lg text-[13px]" style={{ background:"white",fontFamily: "var(--font-sans)" }}>
      <p className="text-[#0b1426] mb-2" style={{ fontWeight:700 }}>{label}</p>
      {payload.map((p:any,i:number)=>(
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="size-2 rounded-full shrink-0" style={{ background:p.color }}/>
          <span className="text-[#5a5040]">{p.name}:</span>
          <span style={{ color:p.color,fontWeight:700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════════════════════════ */
function KpiCard({ title, value, sub, trend, icon:Icon, color }:{ title:string; value:string|number; sub:string; trend:number; icon:typeof Trophy; color:string }) {
  return (
    <div className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background:"white" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="size-10 rounded-[8px] flex items-center justify-center" style={{ background:`${color}18` }}>
          <Icon className="size-5" style={{ color }}/>
        </div>
        <div className={`flex items-center gap-1 text-[13px] px-2 py-0.5 rounded`} style={{ background:trend>=0?"#dcfce7":"#fee2e2",color:trend>=0?"#166534":"#c8102e" }}>
          {trend>=0?<ChevronUp className="size-3"/>:<ChevronDown className="size-3"/>}
          <span style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{Math.abs(trend)}%</span>
        </div>
      </div>
      <div className="text-[24px] leading-none text-[#0b1426] mb-1" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{value}</div>
      <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>{title}</div>
      <div className="text-[13px] text-[#635647] mt-0.5">{sub}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEADERBOARD
═══════════════════════════════════════════════════════════════ */
function Leaderboard() {
  return (
    <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"linear-gradient(to right,#0b1426,#1a2744)" }}>
        <Trophy className="size-4 text-[#8a6400]"/>
        <span className="text-[13px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Bảng xếp hạng Thi đua 2026</span>
        <span className="ml-auto text-[13px] text-white/60">Cập nhật realtime</span>
      </div>
      <div className="divide-y divide-[#e2e8f0]">
        {unitData.map((u,i)=>{
          const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
          const pct = u.diem;
          const barColor = pct>=90?"#8a6400":pct>=85?"#7c3aed":pct>=80?"#1C5FBE":"#166534";
          return (
            <div key={u.name} className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf8f4] transition-colors">
              <div className="w-7 text-center shrink-0">
                {medal ? <span className="text-[18px]">{medal}</span>
                       : <span className="text-[13px] text-[#635647]" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>#{i+1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>{u.name}</span>
                  <span className="text-[13px]" style={{ color:u.change>=0?"#166534":"#c8102e",fontFamily: "var(--font-sans)" }}>
                    {u.change>=0?"+":""}{u.change}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"#f4f7fb" }}>
                  <div className="h-full rounded-full" style={{ width:`${pct}%`,background:barColor }}/>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[14px] leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:barColor }}>{u.diem}</div>
                <div className="text-[13px] text-[#635647]">{u.hoSo} hồ sơ</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SLA COMPLIANCE
═══════════════════════════════════════════════════════════════ */
function SLACompliance() {
  return (
    <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"#faf8f4" }}>
        <Clock className="size-4 text-[#b45309]"/>
        <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>SLA Compliance theo Giai đoạn</span>
      </div>
      <div className="p-4 space-y-3">
        {slaData.map(s=>{
          const ok=s.ontime>=90; const warn=s.ontime>=75&&s.ontime<90;
          const color=ok?"#166534":warn?"#b45309":"#c8102e";
          const bg=ok?"#dcfce7":warn?"#fef3c7":"#fee2e2";
          return (
            <div key={s.stage}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{s.stage}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-[#635647]">TB: {s.actual}n / {s.target}n</span>
                  <span className="text-[13px] px-2 py-0.5 rounded" style={{ background:bg,color,fontFamily: "var(--font-sans)",fontWeight:700 }}>{s.ontime}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background:"#f4f7fb" }}>
                <div className="h-full rounded-full transition-all" style={{ width:`${s.ontime}%`,background:color }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
type ViewMode = "overview"|"units"|"awards"|"sla";
export function PhanTichPage({ user }: { user: LoginUser }) {
  const [view,setView]=useState<ViewMode>("overview");
  const [year,setYear]=useState("2026");
  const [loading,setLoading]=useState(false);
  const refresh=()=>{ setLoading(true); setTimeout(()=>setLoading(false),1200); };
  const VIEWS:[ViewMode,string,typeof BarChart3][]=[["overview","Tổng quan",BarChart3],["units","Theo đơn vị",Building2],["awards","Theo danh hiệu",Award],["sla","SLA & Tiến độ",Clock]];
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:"#f8fafc",fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0] shrink-0" style={{ background:"white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background:"linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <BarChart3 className="size-5 text-[#8a6400]"/>
          </div>
          <div>
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Phân tích Thi đua</h1>
            <p className="text-[13px] text-[#635647]">BI Analytics · Bảng xếp hạng realtime · SLA monitor</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select value={year} onChange={e=>setYear(e.target.value)} className="px-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none" style={{ height:36,fontFamily: "var(--font-sans)" }}>
              {["2026","2025","2024","2023"].map(y=><option key={y}>{y}</option>)}
            </select>
            <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#d1d5db] text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
              <RefreshCw className={`size-3.5 ${loading?"animate-spin":""}`}/>Làm mới
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-[13px] text-white" style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>
              <Download className="size-3.5"/>Xuất báo cáo
            </button>
          </div>
        </div>
        <div className="flex gap-1">
          {VIEWS.map(([id,label,Icon])=>{
            const a=view===id;
            return (
              <button key={id} onClick={()=>setView(id)} className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] transition-all" style={{ background:a?"#0b1426":"transparent",color:a?"white":"#5a5040",fontFamily: "var(--font-sans)",fontWeight:a?700:400 }}>
                <Icon className="size-3.5"/>{label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-5 gap-4">
          <KpiCard title="Tổng hồ sơ" value="1,162" sub="Năm 2026 lũy kế" trend={+18} icon={FileText} color="#1C5FBE"/>
          <KpiCard title="Đã phê duyệt" value="979" sub="Tỷ lệ 84.2%" trend={+5} icon={CheckCircle2} color="#166534"/>
          <KpiCard title="Đang xử lý" value="124" sub="Trung bình 8.4n" trend={-12} icon={Clock} color="#b45309"/>
          <KpiCard title="Tổng điểm TB" value="86.4" sub="Tăng 2.1 điểm" trend={+2.1} icon={Target} color="#7c3aed"/>
          <KpiCard title="SLA đúng hạn" value="91%" sub="+3% so với 2025" trend={+3} icon={Award} color="#8a6400"/>
        </div>

        {view==="overview"&&(
          <>
            <div className="grid grid-cols-3 gap-5">
              {/* Monthly trend */}
              <div className="col-span-2 rounded-[10px] border border-[#e2e8f0] p-4" style={{ background:"white" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Xu hướng Hồ sơ theo Tháng</span>
                  <span className="text-[13px] text-[#635647]">Năm {year}</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="gHoSo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1C5FBE" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#1C5FBE" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gDuyet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#166534" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#166534" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f8"/>
                    <XAxis dataKey="month" tick={{ fontSize: 13,fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 13,fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend wrapperStyle={{ fontSize: 13,fontFamily: "var(--font-sans)" }}/>
                    <Area type="monotone" dataKey="hoSo" name="Hồ sơ" stroke="#1C5FBE" fill="url(#gHoSo)" strokeWidth={2}/>
                    <Area type="monotone" dataKey="duyet" name="Phê duyệt" stroke="#166534" fill="url(#gDuyet)" strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Award type pie */}
              <div className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background:"white" }}>
                <div className="text-[14px] text-[#0b1426] mb-4" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Phân bố Danh hiệu</div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={awardTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {awardTypeData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip formatter={(v:any,n:any)=>[v+" hồ sơ",n]}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {awardTypeData.map(a=>(
                    <div key={a.name} className="flex items-center gap-1.5 text-[13px] text-[#5a5040]">
                      <span className="size-2 rounded-full shrink-0" style={{ background:a.color }}/>
                      <span style={{ fontFamily: "var(--font-sans)" }}>{a.name}: {a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <Leaderboard/>
              <SLACompliance/>
            </div>
          </>
        )}

        {view==="units"&&(
          <div className="grid grid-cols-2 gap-5">
            <div className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background:"white" }}>
              <div className="text-[14px] text-[#0b1426] mb-4" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Hồ sơ đề nghị theo Đơn vị</div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={unitData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f8" horizontal={false}/>
                  <XAxis type="number" tick={{ fontSize: 13,fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 13,fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false} width={100}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="hoSo" name="Tổng hồ sơ" fill="#1C5FBE" radius={[0,4,4,0]} barSize={12}/>
                  <Bar dataKey="duyet" name="Phê duyệt" fill="#166534" radius={[0,4,4,0]} barSize={12}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background:"white" }}>
              <div className="text-[14px] text-[#0b1426] mb-4" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Radar Đánh giá 5 Tiêu chí</div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#eef2f8"/>
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13,fontFamily: "var(--font-sans)" }}/>
                  <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fontSize: 13 }}/>
                  <Radar name="Điểm cao nhất" dataKey="A" stroke="#8a6400" fill="#8a6400" fillOpacity={0.2}/>
                  <Radar name="Điểm trung bình" dataKey="B" stroke="#1C5FBE" fill="#1C5FBE" fillOpacity={0.2}/>
                  <Legend wrapperStyle={{ fontSize: 13,fontFamily: "var(--font-sans)" }}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view==="awards"&&(
          <div className="grid grid-cols-2 gap-5">
            <div className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background:"white" }}>
              <div className="text-[14px] text-[#0b1426] mb-4" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Số lượng trao tặng theo Danh hiệu</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={awardTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f8"/>
                  <XAxis dataKey="name" tick={{ fontSize: 13,fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 13,fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="value" name="Số lượng" radius={[4,4,0,0]} barSize={32}>
                    {awardTypeData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden" style={{ background:"white" }}>
              <div className="px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"#faf8f4" }}>
                <span className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Chi tiết Thống kê Danh hiệu</span>
              </div>
              <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                <thead><tr style={{ background:"#f4f7fb" }}>
                  {["Danh hiệu","Số lượng","Tỷ lệ","So sánh 2025"].map(h=><th key={h} className="text-left px-3 py-2 text-[#0b1426]" style={{ fontWeight:700 }}>{h}</th>)}
                </tr></thead>
                <tbody>{awardTypeData.map((a,i)=>{
                  const total=awardTypeData.reduce((s,x)=>s+x.value,0);
                  const pct=((a.value/total)*100).toFixed(1);
                  const chg=["+12%","+8%","+15%","+5%","+3%","+22%","+18%"][i];
                  return (
                    <tr key={a.name} className="border-t border-[#e2e8f0]" style={{ background:i%2===0?"white":"#faf8f4" }}>
                      <td className="px-3 py-2.5"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background:a.color }}/>{a.name}</div></td>
                      <td className="px-3 py-2.5 text-center" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700,color:a.color }}>{a.value}</td>
                      <td className="px-3 py-2.5">{pct}%</td>
                      <td className="px-3 py-2.5 text-[#166534]">{chg}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
        )}

        {view==="sla"&&(
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label:"Vi phạm SLA hiện tại", value:7, color:"#c8102e", bg:"#fee2e2", icon:AlertTriangle },
                { label:"SLA compliance rate", value:"91%", color:"#166534", bg:"#dcfce7", icon:CheckCircle2 },
                { label:"Thời gian TB toàn quy trình", value:"28.9n", color:"#1C5FBE", bg:"#ddeafc", icon:Clock },
              ].map(c=>{
                const I=c.icon;
                return (
                  <div key={c.label} className="rounded-[10px] border p-4 flex items-center gap-3" style={{ background:c.bg,borderColor:`${c.color}40` }}>
                    <I className="size-8" style={{ color:c.color }}/>
                    <div>
                      <div className="text-[24px] leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:c.color }}>{c.value}</div>
                      <div className="text-[13px] mt-1" style={{ color:c.color,fontFamily: "var(--font-sans)" }}>{c.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background:"white" }}>
              <div className="text-[14px] text-[#0b1426] mb-4" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Thời gian xử lý thực tế vs SLA target</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={slaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f8"/>
                  <XAxis dataKey="stage" tick={{ fontSize: 13,fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 13,fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false} unit="n"/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{ fontSize: 13,fontFamily: "var(--font-sans)" }}/>
                  <Bar dataKey="target" name="SLA target" fill="#e2e8f0" radius={[4,4,0,0]} barSize={20}/>
                  <Bar dataKey="actual" name="Thực tế" fill="#1C5FBE" radius={[4,4,0,0]} barSize={20}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <SLACompliance/>
          </div>
        )}
      </div>
    </div>
  );
}
