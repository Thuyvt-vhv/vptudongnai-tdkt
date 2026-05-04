import { useState } from "react";
import {
  FileText, Download, Search, Eye, Printer, CheckCircle2,
  Filter, Users, User, QrCode, Award, Calendar,
  ChevronRight, X, Shield, Stamp, ExternalLink, Copy,
  FileSignature, ScrollText, BarChart2, Building2,
  BookOpen, Clock, Sparkles, Star, Share2,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface Decision {
  id:string; code:string; title:string; type:"ca_nhan"|"tap_the";
  unit:string; awardType:string; awardLevel:"co_so"|"tinh"|"nha_nuoc";
  signedDate:string; signedBy:string; signingTitle:string;
  size:string; recipients:RecipientItem[]; canCu:string[];
  caSerial:string; qrHash:string; status:"draft"|"signed"|"published";
  year:number; batch:string;
}
interface RecipientItem { name:string; chucVu:string; donVi:string; diem:number }

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA (expanded)
═══════════════════════════════════════════════════════════════ */
const DECISIONS: Decision[] = [
  {
    id:"1", code:"001/QĐ-TU-2026", title:"Tặng danh hiệu CSTĐ cấp Tỉnh đợt 1 năm 2026",
    type:"ca_nhan", unit:"Nhiều đơn vị (8 cá nhân)", awardType:"Chiến sĩ Thi đua cấp Tỉnh", awardLevel:"tinh",
    signedDate:"2026-01-15", signedBy:"Nguyễn Văn Hùng", signingTitle:"Chủ tịch UBND tỉnh Đồng Nai",
    size:"2.1 MB", canCu:["Luật TĐKT 2022","NĐ 152/2025/NĐ-CP","TT 15/2025/TT-BNV","BB số 03/BB-HĐTĐKT-2026"],
    caSerial:"A1F3C2D8E4", qrHash:"VQ-2026-001-ABCD1234", status:"published", year:2026, batch:"Đợt 1/2026",
    recipients:[
      { name:"Nguyễn Văn An",  chucVu:"Phó Trưởng phòng", donVi:"VP Tỉnh ủy",     diem:94.2 },
      { name:"Trần Minh Đức",  chucVu:"Chuyên viên",       donVi:"Ban TC TU",       diem:92.8 },
      { name:"Phạm Thị Lan",   chucVu:"Phó Giám đốc",     donVi:"Sở GD&ĐT",       diem:91.5 },
      { name:"Lê Quốc Bảo",   chucVu:"Trưởng khoa",       donVi:"Sở Y tế",         diem:93.1 },
    ],
  },
  {
    id:"2", code:"002/QĐ-TU-2026", title:"Tặng Bằng khen UBND Tỉnh đợt 1/2026",
    type:"ca_nhan", unit:"Nhiều đơn vị (12 cá nhân)", awardType:"Bằng khen UBND Tỉnh", awardLevel:"tinh",
    signedDate:"2026-01-20", signedBy:"Nguyễn Văn Hùng", signingTitle:"Chủ tịch UBND tỉnh",
    size:"3.2 MB", canCu:["Luật TĐKT 2022","NĐ 152/2025/NĐ-CP","TT 15/2025"],
    caSerial:"B2G4D9F5E1", qrHash:"VQ-2026-002-EFGH5678", status:"published", year:2026, batch:"Đợt 1/2026",
    recipients:[
      { name:"Vũ Đức Hùng",   chucVu:"Trưởng phòng",    donVi:"Ban NC TU",        diem:93.4 },
      { name:"Hoàng Thị Mai",  chucVu:"Kỹ sư",           donVi:"Sở GTVT",          diem:87.2 },
      { name:"Đinh Văn Nam",   chucVu:"Chuyên viên",      donVi:"Sở KH&ĐT",        diem:85.8 },
    ],
  },
  {
    id:"3", code:"128/QĐ-CP-2025", title:"Tặng Bằng khen Chính phủ – Kỳ 9/2025",
    type:"ca_nhan", unit:"Sở Y tế Đồng Nai", awardType:"Bằng khen Chính phủ", awardLevel:"nha_nuoc",
    signedDate:"2025-09-02", signedBy:"Phạm Minh Chính", signingTitle:"Thủ tướng Chính phủ",
    size:"1.8 MB", canCu:["Luật TĐKT 2022","NĐ 152/2025/NĐ-CP","Tờ trình số 45/TTr-UBND-2025"],
    caSerial:"CP9F2E7A3B", qrHash:"VQ-2025-128-IJKL9012", status:"published", year:2025, batch:"Đợt 9/2025",
    recipients:[
      { name:"Trần Thị Bích",  chucVu:"Trưởng Khoa Nội",donVi:"Sở Y tế ĐN",        diem:91.5 },
    ],
  },
  {
    id:"4", code:"200/QĐ-CTN-2025", title:"Tặng Huân chương Lao động Hạng Ba",
    type:"ca_nhan", unit:"VP Tỉnh ủy Đồng Nai", awardType:"Huân chương LĐ Hạng Ba", awardLevel:"nha_nuoc",
    signedDate:"2025-09-01", signedBy:"Lương Cường", signingTitle:"Chủ tịch nước CHXHCN Việt Nam",
    size:"1.1 MB", canCu:["Luật TĐKT 2022","NĐ 152/2025/NĐ-CP Điều 42","QĐ 2854/QĐ-CTN"],
    caSerial:"CTN-F3C8A1D5", qrHash:"VQ-2025-200-MNOP3456", status:"published", year:2025, batch:"Đặc biệt",
    recipients:[
      { name:"Đặng Quốc Khánh",chucVu:"Chánh VP Tỉnh ủy",donVi:"VP Tỉnh ủy ĐN",   diem:96.5 },
    ],
  },
  {
    id:"5", code:"128/QĐ-TU-2025", title:"Tặng Cờ thi đua Chính phủ cho Sở GD&ĐT",
    type:"tap_the", unit:"Sở Giáo dục & Đào tạo Đồng Nai", awardType:"Cờ thi đua Chính phủ", awardLevel:"nha_nuoc",
    signedDate:"2025-12-20", signedBy:"Nguyễn Văn Hùng", signingTitle:"Chủ tịch UBND tỉnh",
    size:"0.9 MB", canCu:["Luật TĐKT 2022","NĐ 152/2025/NĐ-CP"],
    caSerial:"TU-A5E8F2C9", qrHash:"VQ-2025-128TU-QRST7890", status:"published", year:2025, batch:"Đợt cuối 2025",
    recipients:[{ name:"Sở GD&ĐT Đồng Nai",chucVu:"Tập thể",donVi:"Sở GD&ĐT",diem:95.2 }],
  },
  {
    id:"6", code:"DRAFT-2026-003", title:"Dự thảo QĐ tặng CSTĐT đợt 2 năm 2026",
    type:"ca_nhan", unit:"Đang xử lý", awardType:"Chiến sĩ Thi đua cấp Tỉnh", awardLevel:"tinh",
    signedDate:"—", signedBy:"—", signingTitle:"Chờ ký",
    size:"—", canCu:["NĐ 152/2025/NĐ-CP","TT 15/2025"],
    caSerial:"", qrHash:"", status:"draft", year:2026, batch:"Đợt 2/2026",
    recipients:[],
  },
];

const LEVEL_CFG = {
  nha_nuoc:{ l:"Nhà nước", c:"#c8102e", bg:"#fee2e2" },
  tinh:     { l:"Cấp Tỉnh",c:"#1C5FBE", bg:"#ddeafc" },
  co_so:    { l:"Cơ sở",   c:"#166534", bg:"#dcfce7" },
};
const STATUS_CFG = {
  draft:    { l:"Dự thảo",  c:"#635647", bg:"#eef2f8" },
  signed:   { l:"Đã ký",   c:"#b45309", bg:"#fef3c7" },
  published:{ l:"Đã ban hành",c:"#166534",bg:"#dcfce7" },
};

/* ═══════════════════════════════════════════════════════════════
   QD DETAIL VIEW
═══════════════════════════════════════════════════════════════ */
function QDDetail({ qd, onClose }:{ qd:Decision; onClose:()=>void }) {
  const lc=LEVEL_CFG[qd.awardLevel];
  const [copiedQR,setCopiedQR]=useState(false);
  const copyQR=()=>{ setCopiedQR(true); setTimeout(()=>setCopiedQR(false),2000); };
  return (
    <div className="fixed inset-0 z-50 flex" style={{ background:"rgba(0,0,0,0.6)" }}>
      <div className="ml-auto h-full w-[680px] flex flex-col shadow-2xl overflow-hidden" style={{ background:"white" }}>
        {/* Header */}
        <div className="p-5 border-b border-[#e2e8f0]" style={{ background:"linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background:"rgba(200,150,12,0.2)" }}>
              <Award className="size-5 text-[#8a6400]"/>
            </div>
            <div className="flex-1">
              <code className="text-[13px] text-[#8a6400]" style={{ fontFamily:"JetBrains Mono, monospace" }}>{qd.code}</code>
              <h2 className="text-[14px] text-white leading-tight" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{qd.title}</h2>
            </div>
            <button onClick={onClose} className="size-8 rounded-[6px] flex items-center justify-center hover:bg-white/10">
              <X className="size-4 text-white/60"/>
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] px-2 py-0.5 rounded" style={{ background:lc.bg,color:lc.c,fontFamily: "var(--font-sans)",fontWeight:700 }}>{lc.l}</span>
            <span className="text-[13px] px-2 py-0.5 rounded" style={{ background:STATUS_CFG[qd.status].bg,color:STATUS_CFG[qd.status].c,fontFamily: "var(--font-sans)",fontWeight:700 }}>{STATUS_CFG[qd.status].l}</span>
            <span className="text-[13px] text-white/50">{qd.batch}</span>
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5" style={{ background:"#ffffff" }}>
          {/* Meta info */}
          <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden" style={{ background:"white" }}>
            <div className="px-4 py-2.5 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
              <span className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Thông tin Quyết định</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                ["Số Quyết định", qd.code],["Ngày ký", qd.signedDate],
                ["Lãnh đạo ký", qd.signedBy],["Chức vụ", qd.signingTitle],
                ["Hình thức KT", qd.awardType],["Đơn vị", qd.unit],
              ].map(([k,v])=>(
                <div key={k}>
                  <div className="text-[13px] uppercase tracking-wider text-slate-700 mb-0.5" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{k}</div>
                  <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:k==="Số Quyết định"||k==="Hình thức KT"?700:400 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Recipients */}
          {qd.recipients.length>0&&(
            <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden" style={{ background:"white" }}>
              <div className="px-4 py-2.5 border-b border-[#e2e8f0] flex items-center gap-2" style={{ background:"#f4f7fb" }}>
                <Users className="size-4 text-[#1C5FBE]"/>
                <span className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Danh sách được khen thưởng ({qd.recipients.length})</span>
              </div>
              <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                <thead><tr style={{ background:"#f4f7fb" }}>
                  {["#","Họ tên","Chức vụ","Đơn vị","Điểm"].map(h=><th key={h} className="text-left px-3 py-2 text-slate-900" style={{ fontWeight:700 }}>{h}</th>)}
                </tr></thead>
                <tbody>{qd.recipients.map((r,i)=>(
                  <tr key={i} className="border-t border-[#e2e8f0]">
                    <td className="px-3 py-2 text-slate-700">{i+1}</td>
                    <td className="px-3 py-2" style={{ fontWeight:600,color:"#0b1426" }}>{r.name}</td>
                    <td className="px-3 py-2 text-slate-700">{r.chucVu}</td>
                    <td className="px-3 py-2 text-slate-700">{r.donVi}</td>
                    <td className="px-3 py-2 text-center" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700,color:"#8a6400" }}>{r.diem}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {/* Căn cứ pháp lý */}
          <div className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background:"white" }}>
            <div className="text-[13px] text-slate-900 mb-2" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Căn cứ pháp lý</div>
            {qd.canCu.map((c,i)=>(
              <div key={i} className="flex items-center gap-2 text-[13px] text-slate-700 mb-1">
                <BookOpen className="size-3.5 text-[#1C5FBE] shrink-0"/>
                {c}
              </div>
            ))}
          </div>
          {/* CA + QR */}
          {qd.status==="published"&&qd.caSerial&&(
            <div className="rounded-[10px] border-2 border-[#86efac] p-4" style={{ background:"#f0fdf4" }}>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="size-5 text-[#166534]"/>
                <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Chữ ký số CA đã xác thực</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[13px] text-slate-700 mb-1" style={{ fontFamily: "var(--font-sans)" }}>CA Certificate Serial</div>
                  <code className="text-[13px] text-[#166534]" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{qd.caSerial}</code>
                </div>
                <div>
                  <div className="text-[13px] text-slate-700 mb-1" style={{ fontFamily: "var(--font-sans)" }}>QR Verification Code</div>
                  <div className="flex items-center gap-2">
                    <code className="text-[13px] text-[#1C5FBE]" style={{ fontFamily:"JetBrains Mono, monospace" }}>{qd.qrHash}</code>
                    <button onClick={copyQR} className="size-6 rounded flex items-center justify-center hover:bg-[#dcfce7]">
                      {copiedQR?<CheckCircle2 className="size-3.5 text-[#166534]"/>:<Copy className="size-3.5 text-[#166534]"/>}
                    </button>
                  </div>
                </div>
              </div>
              {/* QR mock */}
              <div className="mt-3 flex items-center gap-3 p-3 rounded-[8px]" style={{ background:"white",border:"1px solid #86efac" }}>
                <div className="size-16 rounded-[6px] flex items-center justify-center" style={{ background:"#f0fdf4",border:"2px solid #166534" }}>
                  <QrCode className="size-10 text-[#166534]"/>
                </div>
                <div className="text-[13px] text-slate-700 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                  Quét QR code để xác minh tính xác thực của Quyết định.<br/>
                  <span className="text-slate-700">Hoặc truy cập: <span style={{ color:"#1C5FBE" }}>vinhquang.dongnai.gov.vn/verify/{qd.qrHash.slice(-8)}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Footer actions */}
        <div className="p-4 border-t border-[#e2e8f0] flex gap-2" style={{ background:"white" }}>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] text-white" style={{ background:"#0b1426",fontFamily: "var(--font-sans)",fontWeight:600 }}>
            <Eye className="size-4"/>Xem PDF
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-[13px] border border-[#d1d5db] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
            <Download className="size-4"/>Tải về
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-[13px] border border-[#d1d5db] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
            <Printer className="size-4"/>In
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-[13px] border border-[#d1d5db] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
            <Share2 className="size-4"/>Chia sẻ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function QuyetDinhPage({ user }: { user: LoginUser }) {
  const { theme } = useTheme();
  const [search,setSearch]=useState("");
  const [yearFilter,setYearFilter]=useState("all");
  const [levelFilter,setLevelFilter]=useState("all");
  const [detail,setDetail]=useState<Decision|null>(null);
  const [view,setView]=useState<"grid"|"table">("grid");

  const years=[...new Set(DECISIONS.map(d=>d.year))].sort((a,b)=>b-a);
  const visible=DECISIONS.filter(d=>{
    const ms=!search||d.title.toLowerCase().includes(search.toLowerCase())||d.code.toLowerCase().includes(search.toLowerCase())||d.unit.toLowerCase().includes(search.toLowerCase());
    const my=yearFilter==="all"||d.year===Number(yearFilter);
    const ml=levelFilter==="all"||d.awardLevel===levelFilter;
    return ms&&my&&ml;
  });
  const stats={ total:DECISIONS.length, published:DECISIONS.filter(d=>d.status==="published").length, nhanuoc:DECISIONS.filter(d=>d.awardLevel==="nha_nuoc").length, tinh:DECISIONS.filter(d=>d.awardLevel==="tinh").length };
  const totalRecipients=DECISIONS.flatMap(d=>d.recipients).length;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:"#ffffff",fontFamily: "var(--font-sans)" }}>
      {detail&&<QDDetail qd={detail} onClose={()=>setDetail(null)}/>}
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0]" style={{ background:"white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background:"linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <ScrollText className="size-5 text-[#8a6400]"/>
          </div>
          <div>
            <h1 className="text-[18px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Quyết định Khen thưởng</h1>
            <p className="text-[13px] text-slate-700">Kho lưu trữ bất biến · QR verify · CA signed · Căn cứ NĐ 152/2025/NĐ-CP</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={()=>setView(v=>v==="grid"?"table":"grid")} className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#d1d5db] text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
              {view==="grid"?<BarChart2 className="size-3.5"/>:<FileText className="size-3.5"/>}
              {view==="grid"?"Dạng bảng":"Dạng thẻ"}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-[13px] text-white" style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>
              <Download className="size-3.5"/>Xuất danh sách
            </button>
          </div>
        </div>
        {/* Stats */}
        <div className="flex gap-3 mb-4">
          {[
            { l:"Tổng QĐ",       v:stats.total,         c:"#0b1426",bg:"#f4f7fb" },
            { l:"Đã ban hành",   v:stats.published,     c:"#166534",bg:"#dcfce7" },
            { l:"Cấp Nhà nước",  v:stats.nhaduoc,        c:"#c8102e",bg:"#fee2e2" },
            { l:"Cấp Tỉnh",      v:stats.tinh,          c:"#1C5FBE",bg:"#ddeafc" },
            { l:"Tổng lượt KT",  v:totalRecipients,     c:"#8a6400",bg:"#ffffff" },
          ].map(s=>(
            <div key={s.l} className="flex items-center gap-2 px-3 py-1.5 rounded-[8px]" style={{ background:s.bg }}>
              <span className="text-[18px] leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:s.c }}>{s.v}</span>
              <span className="text-[13px]" style={{ color:s.c,fontFamily: "var(--font-sans)" }}>{s.l}</span>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-700"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mã QĐ, tiêu đề, đơn vị..."
              className="pl-9 pr-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none focus:border-[#1C5FBE]" style={{ height:36,width:260,fontFamily: "var(--font-sans)" }}/>
          </div>
          <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} className="px-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none" style={{ height:36,fontFamily: "var(--font-sans)" }}>
            <option value="all">Tất cả năm</option>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex gap-1">
            {[["all","Tất cả cấp"],["nha_nuoc","Nhà nước"],["tinh","Cấp Tỉnh"],["co_so","Cơ sở"]].map(([k,l])=>(
              <button key={k} onClick={()=>setLevelFilter(k)} className="px-3 py-1.5 rounded-[6px] border text-[13px] transition-all"
                style={{ background:levelFilter===k?"#0b1426":"white",color:levelFilter===k?"white":"#5a5040",borderColor:levelFilter===k?"#0b1426":"#e2e8f0",fontFamily: "var(--font-sans)",fontWeight:levelFilter===k?700:400 }}>{l}</button>
            ))}
          </div>
          <span className="ml-auto text-[13px] text-slate-700">{visible.length} quyết định</span>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {view==="grid" ? (
          <div className="grid grid-cols-3 gap-4">
            {visible.map(qd=>{
              const lc=LEVEL_CFG[qd.awardLevel]; const sc=STATUS_CFG[qd.status];
              return (
                <button key={qd.id} onClick={()=>setDetail(qd)} className="rounded-[12px] border border-[#e2e8f0] overflow-hidden text-left hover:shadow-md transition-all hover:border-[#8a6400]" style={{ background:"white" }}>
                  <div className="h-1.5" style={{ background:qd.status==="published"?"linear-gradient(to right,#8a6400,#f0c040)":"linear-gradient(to right,#d1d5db,#e5e7eb)" }}/>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <code className="text-[13px] text-[#1C5FBE] block mb-1" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{qd.code}</code>
                        <h3 className="text-[13px] text-slate-900 leading-snug" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{qd.title}</h3>
                      </div>
                      {qd.status==="published"&&qd.caSerial&&<Shield className="size-5 text-[#166534] shrink-0 mt-0.5"/>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:lc.bg,color:lc.c,fontFamily: "var(--font-sans)",fontWeight:700 }}>{lc.l}</span>
                      <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:sc.bg,color:sc.c,fontFamily: "var(--font-sans)" }}>{sc.l}</span>
                      {qd.recipients.length>0&&<span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#ffffff",color:"#8a6400",fontFamily: "var(--font-sans)" }}>{qd.recipients.length} người</span>}
                    </div>
                    <div className="text-[13px] text-slate-700 truncate">{qd.unit}</div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#eef2f8]">
                      <div className="flex items-center gap-1 text-[13px] text-slate-700">
                        <Calendar className="size-3.5"/>{qd.signedDate}
                      </div>
                      <ChevronRight className="size-4 text-slate-700"/>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
            <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
              <thead><tr style={{ background:"linear-gradient(to right,#0b1426,#1a2744)" }}>
                {["Mã QĐ","Nội dung","Đơn vị","Hình thức","Cấp","Ngày ký","Trạng thái",""].map(h=><th key={h} className="text-left px-3 py-3 text-white" style={{ fontWeight:700 }}>{h}</th>)}
              </tr></thead>
              <tbody>{visible.map((d,i)=>{
                const lc=LEVEL_CFG[d.awardLevel]; const sc=STATUS_CFG[d.status];
                return (
                  <tr key={d.id} className="border-t border-[#e2e8f0] hover:bg-[#f4f7fb] transition-colors" style={{ background:i%2===0?"white":"#fdfcfa" }}>
                    <td className="px-3 py-3"><code className="text-[13px] text-[#1C5FBE]" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{d.code}</code></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {d.type==="tap_the"?<Users className="size-3.5 text-slate-700 shrink-0"/>:<User className="size-3.5 text-slate-700 shrink-0"/>}
                        <span className="text-[13px] text-slate-900" style={{ fontWeight:500 }}>{d.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[13px] text-slate-700">{d.unit}</td>
                    <td className="px-3 py-3"><span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#ffffff",color:"#8a6400",fontFamily: "var(--font-sans)" }}>{d.awardType}</span></td>
                    <td className="px-3 py-3"><span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:lc.bg,color:lc.c }}>{lc.l}</span></td>
                    <td className="px-3 py-3 text-[13px] text-slate-700">{d.signedDate}</td>
                    <td className="px-3 py-3"><span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:sc.bg,color:sc.c }}>{sc.l}</span></td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <button onClick={()=>setDetail(d)} className="size-7 rounded flex items-center justify-center hover:bg-[#ddeafc]"><Eye className="size-3.5 text-[#1C5FBE]"/></button>
                        <button className="size-7 rounded flex items-center justify-center hover:bg-[#f4f7fb]"><Download className="size-3.5 text-slate-700"/></button>
                        {d.qrHash&&<button className="size-7 rounded flex items-center justify-center hover:bg-[#dcfce7]"><QrCode className="size-3.5 text-[#166534]"/></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
