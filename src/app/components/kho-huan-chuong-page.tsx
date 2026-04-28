import { useState } from "react";
import {
  Award, Search, Filter, ChevronRight, Star, Clock, Users,
  CheckCircle2, Info, X, Download, Shield, Trophy, Medal,
  BookOpen, AlertCircle, ChevronDown, BarChart2,
} from "lucide-react";
import type { LoginUser } from "./login-page";

interface HuanChuong {
  id:string; name:string; shortName:string; emoji:string;
  level:"nha_nuoc"|"tinh"|"huyen"|"co_so";
  type:"individual"|"collective"|"both";
  category:"huan_chuong"|"huy_chuong"|"bang_khen"|"giay_khen"|"danh_hieu";
  conditions:string[]; canCu:string; signingAuth:string;
  minYears:number; minScore:number; totalAwarded:number;
  lastYear:number; color:string; gradient:string;
  description:string;
}

const AWARDS: HuanChuong[] = [
  {
    id:"hc-ld1", name:"Huân chương Lao động Hạng Nhất", shortName:"HCLD1", emoji:"🎖️",
    level:"nha_nuoc", type:"both", category:"huan_chuong",
    conditions:["Đạt Huân chương hạng Nhì 5+ năm","≥3 lần CSTĐ Toàn quốc","Thành tích đặc biệt xuất sắc cấp quốc gia","Không vi phạm trong 10 năm gần nhất"],
    canCu:"Điều 44 NĐ 152/2025/NĐ-CP", signingAuth:"Chủ tịch nước",
    minYears:10, minScore:95, totalAwarded:8, lastYear:2, color:"#8a6400",
    gradient:"linear-gradient(135deg,#8a6400,#f0c040)", description:"Danh hiệu cao quý nhất trong hệ thống huân chương lao động, dành cho cá nhân/tập thể có thành tích xuất sắc đặc biệt trên mặt trận kinh tế-xã hội ở cấp quốc gia.",
  },
  {
    id:"hc-ld2", name:"Huân chương Lao động Hạng Nhì", shortName:"HCLD2", emoji:"🎖️",
    level:"nha_nuoc", type:"both", category:"huan_chuong",
    conditions:["Đạt Huân chương hạng Ba 5+ năm","≥2 lần CSTĐ Toàn quốc","Thành tích xuất sắc cấp quốc gia"],
    canCu:"Điều 43 NĐ 152/2025/NĐ-CP", signingAuth:"Chủ tịch nước",
    minYears:7, minScore:90, totalAwarded:15, lastYear:3, color:"#8a6400",
    gradient:"linear-gradient(135deg,#92400e,#8a6400)", description:"Tặng cho cá nhân/tập thể có thành tích xuất sắc trong công cuộc lao động sáng tạo, đóng góp cho sự nghiệp xây dựng và bảo vệ Tổ quốc.",
  },
  {
    id:"hc-ld3", name:"Huân chương Lao động Hạng Ba", shortName:"HCLD3", emoji:"🎖️",
    level:"nha_nuoc", type:"both", category:"huan_chuong",
    conditions:["≥3 lần CSTĐ cấp Tỉnh hoặc 1 lần CSTĐ Toàn quốc","Thành tích xuất sắc cấp tỉnh/ngành","Bằng khen Chính phủ hoặc cơ quan ngang bộ"],
    canCu:"Điều 42 NĐ 152/2025/NĐ-CP", signingAuth:"Chủ tịch nước",
    minYears:5, minScore:90, totalAwarded:32, lastYear:7, color:"#92400e",
    gradient:"linear-gradient(135deg,#78350f,#92400e)", description:"Huân chương lao động bậc thấp nhất, tặng cho thành tích xuất sắc trong lao động sản xuất, công tác và học tập.",
  },
  {
    id:"hc-ddkt", name:"Huân chương Đại đoàn kết dân tộc", shortName:"HCĐĐKT", emoji:"🏅",
    level:"nha_nuoc", type:"both", category:"huan_chuong",
    conditions:["Đóng góp đặc biệt cho đoàn kết dân tộc","Được Mặt trận Tổ quốc đề nghị","Thành tích đặc biệt trong công tác dân vận"],
    canCu:"Điều 49 NĐ 152/2025/NĐ-CP", signingAuth:"Chủ tịch nước",
    minYears:5, minScore:90, totalAwarded:5, lastYear:1, color:"#7c3aed",
    gradient:"linear-gradient(135deg,#5b21b6,#7c3aed)", description:"Tặng cho cá nhân/tập thể có đóng góp xuất sắc trong sự nghiệp đại đoàn kết toàn dân tộc Việt Nam.",
  },
  {
    id:"cstd-tq", name:"Chiến sĩ Thi đua Toàn quốc", shortName:"CSTĐTQ", emoji:"⭐",
    level:"nha_nuoc", type:"individual", category:"danh_hieu",
    conditions:["≥3 lần liên tục CSTĐ cấp tỉnh/bộ/ngành","Có sáng kiến được Hội đồng cấp quốc gia công nhận","Không bị kỷ luật trong 5 năm gần nhất"],
    canCu:"Điều 24 NĐ 152/2025/NĐ-CP", signingAuth:"Thủ tướng Chính phủ",
    minYears:5, minScore:90, totalAwarded:18, lastYear:4, color:"#c8102e",
    gradient:"linear-gradient(135deg,#991b1b,#c8102e)", description:"Danh hiệu thi đua cao nhất cấp toàn quốc, tặng cho cá nhân có thành tích xuất sắc tiêu biểu trong phong trào thi đua yêu nước.",
  },
  {
    id:"bk-cp", name:"Bằng khen Chính phủ", shortName:"BKCP", emoji:"📜",
    level:"nha_nuoc", type:"both", category:"bang_khen",
    conditions:["≥2 lần CSTĐ cấp tỉnh hoặc Bộ","Thành tích đặc biệt ảnh hưởng toàn quốc","Được Thủ tướng đặc cách xem xét"],
    canCu:"Điều 28 NĐ 152/2025/NĐ-CP", signingAuth:"Thủ tướng Chính phủ",
    minYears:3, minScore:90, totalAwarded:45, lastYear:12, color:"#0b1426",
    gradient:"linear-gradient(135deg,#0b1426,#1a2744)", description:"Bằng khen cao nhất của Chính phủ, tặng cho cá nhân/tập thể có thành tích xuất sắc trong xây dựng và bảo vệ Tổ quốc.",
  },
  {
    id:"cstd-t", name:"Chiến sĩ Thi đua cấp Tỉnh", shortName:"CSTĐT", emoji:"🌟",
    level:"tinh", type:"individual", category:"danh_hieu",
    conditions:["≥2 lần liên tiếp CSTĐ cơ sở","Sáng kiến kinh nghiệm cấp tỉnh được công nhận","Xếp loại Hoàn thành xuất sắc nhiệm vụ"],
    canCu:"Điều 23 NĐ 152/2025/NĐ-CP", signingAuth:"Chủ tịch UBND tỉnh",
    minYears:3, minScore:90, totalAwarded:87, lastYear:28, color:"#7c3aed",
    gradient:"linear-gradient(135deg,#5b21b6,#7c3aed)", description:"Danh hiệu thi đua cấp tỉnh, dành cho cá nhân tiêu biểu xuất sắc nhất trong các phong trào thi đua.",
  },
  {
    id:"bk-t", name:"Bằng khen UBND tỉnh Đồng Nai", shortName:"BKT", emoji:"📋",
    level:"tinh", type:"both", category:"bang_khen",
    conditions:["Hoàn thành xuất sắc nhiệm vụ 2 năm liên tiếp","Có thành tích tiêu biểu trong phong trào thi đua cấp tỉnh","Không vi phạm kỷ luật"],
    canCu:"Điều 29 NĐ 152/2025/NĐ-CP", signingAuth:"Chủ tịch UBND tỉnh Đồng Nai",
    minYears:2, minScore:85, totalAwarded:156, lastYear:48, color:"#1C5FBE",
    gradient:"linear-gradient(135deg,#1e3a8a,#1C5FBE)", description:"Bằng khen của UBND tỉnh Đồng Nai tặng cho cá nhân/tập thể có thành tích xuất sắc trong các lĩnh vực kinh tế-xã hội của tỉnh.",
  },
  {
    id:"cstd-cs", name:"Chiến sĩ Thi đua Cơ sở", shortName:"CSTĐCS", emoji:"✨",
    level:"co_so", type:"individual", category:"danh_hieu",
    conditions:["Xếp loại Hoàn thành xuất sắc nhiệm vụ trong năm","Được bình xét từ cơ sở, tỷ lệ không quá 15% CBCC","Không vi phạm kỷ luật trong năm"],
    canCu:"Điều 22 NĐ 152/2025/NĐ-CP", signingRole:"Manager hoặc Leader", signingAuth:"Lãnh đạo đơn vị cơ sở",
    minYears:1, minScore:90, totalAwarded:312, lastYear:98, color:"#1C5FBE",
    gradient:"linear-gradient(135deg,#0284c7,#1C5FBE)", description:"Danh hiệu thi đua cơ bản nhất, tặng cho cá nhân tiêu biểu xuất sắc tại đơn vị, cơ quan, tổ chức cơ sở.",
  },
  {
    id:"ttldxs", name:"Tập thể Lao động Xuất sắc", shortName:"TTLĐXS", emoji:"🏆",
    level:"co_so", type:"collective", category:"danh_hieu",
    conditions:["100% thành viên hoàn thành nhiệm vụ, ≥70% hoàn thành xuất sắc","Có cá nhân đạt CSTĐCS","Không có vi phạm tập thể trong năm"],
    canCu:"Điều 27 NĐ 152/2025/NĐ-CP", signingAuth:"Lãnh đạo đơn vị cấp trên",
    minYears:1, minScore:85, totalAwarded:203, lastYear:62, color:"#0891b2",
    gradient:"linear-gradient(135deg,#0e7490,#0891b2)", description:"Danh hiệu thi đua cho tập thể xuất sắc toàn diện, dành cho đơn vị/phòng ban/tổ công tác.",
  },
  {
    id:"gk-cs", name:"Giấy khen cơ sở", shortName:"GK", emoji:"📄",
    level:"co_so", type:"both", category:"giay_khen",
    conditions:["Hoàn thành tốt nhiệm vụ trong năm","Có đóng góp thiết thực cho đơn vị","Do Thủ trưởng đơn vị quyết định"],
    canCu:"Điều 30 NĐ 152/2025/NĐ-CP", signingAuth:"Thủ trưởng đơn vị cơ sở",
    minYears:1, minScore:80, totalAwarded:428, lastYear:145, color:"#166534",
    gradient:"linear-gradient(135deg,#14532d,#166534)", description:"Hình thức khen thưởng phổ biến nhất ở cơ sở, do Thủ trưởng đơn vị trao tặng.",
  },
];

const LEVEL_CFG = {
  nha_nuoc:{ label:"Nhà nước",   color:"#c8102e", bg:"#fee2e2"  },
  tinh:     { label:"Cấp Tỉnh",  color:"#1C5FBE", bg:"#ddeafc"  },
  huyen:    { label:"Cấp Huyện", color:"#7c3aed", bg:"#f5f3ff"  },
  co_so:    { label:"Cơ sở",     color:"#166534", bg:"#dcfce7"  },
};
const CAT_CFG = {
  huan_chuong:{ label:"Huân chương", emoji:"🎖️" },
  huy_chuong: { label:"Huy chương",  emoji:"🏅" },
  bang_khen:  { label:"Bằng khen",   emoji:"📜" },
  giay_khen:  { label:"Giấy khen",   emoji:"📄" },
  danh_hieu:  { label:"Danh hiệu",   emoji:"⭐" },
};

export function KhoHuanChuongPage({ user }: { user: LoginUser }) {
  const [search,setSearch]=useState("");
  const [levelFilter,setLevelFilter]=useState("all");
  const [catFilter,setCatFilter]=useState("all");
  const [selected,setSelected]=useState<HuanChuong|null>(null);
  const filtered=AWARDS.filter(a=>{
    const ms=a.name.toLowerCase().includes(search.toLowerCase())||a.shortName.toLowerCase().includes(search.toLowerCase());
    const ml=levelFilter==="all"||a.level===levelFilter;
    const mc=catFilter==="all"||a.category===catFilter;
    return ms&&ml&&mc;
  });
  const totalAwarded=AWARDS.reduce((s,a)=>s+a.totalAwarded,0);
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:"#ffffff",fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0]" style={{ background:"white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background:"linear-gradient(135deg,#8a6400,#f0c040)" }}>
            <Medal className="size-5 text-white"/>
          </div>
          <div>
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Kho Huân – Huy chương</h1>
            <p className="text-[13px] text-[#635647]">{AWARDS.length} loại danh hiệu · {totalAwarded} lần trao tặng · Căn cứ NĐ 152/2025/NĐ-CP</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#d1d5db] text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
              <Download className="size-3.5"/>Xuất danh mục
            </button>
          </div>
        </div>
        {/* Stats row */}
        <div className="flex gap-3 mb-4">
          {[
            { l:"Tổng danh hiệu", v:AWARDS.length,bg:"#f4f7fb",c:"#0b1426" },
            { l:"Cấp Nhà nước",   v:AWARDS.filter(a=>a.level==="nha_nuoc").length,bg:"#fee2e2",c:"#c8102e" },
            { l:"Cấp Tỉnh",       v:AWARDS.filter(a=>a.level==="tinh").length,bg:"#ddeafc",c:"#1C5FBE" },
            { l:"Cơ sở",          v:AWARDS.filter(a=>a.level==="co_so").length,bg:"#dcfce7",c:"#166534" },
            { l:"Đã trao tặng",   v:totalAwarded,bg:"#ffffff",c:"#8a6400" },
          ].map(s=>(
            <div key={s.l} className="flex items-center gap-2 px-3 py-2 rounded-[8px]" style={{ background:s.bg }}>
              <span className="text-[18px]" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:s.c }}>{s.v}</span>
              <span className="text-[13px]" style={{ color:s.c,fontFamily: "var(--font-sans)" }}>{s.l}</span>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#635647]"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm danh hiệu..."
              className="w-full pl-9 pr-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none" style={{ height:36,fontFamily: "var(--font-sans)" }}/>
          </div>
          <div className="flex gap-1">
            {[["all","Tất cả"],["nha_nuoc","Nhà nước"],["tinh","Cấp Tỉnh"],["co_so","Cơ sở"]].map(([k,l])=>(
              <button key={k} onClick={()=>setLevelFilter(k)} className="px-3 py-1.5 rounded-[6px] border text-[13px] transition-all" style={{ background:levelFilter===k?"#0b1426":"white",color:levelFilter===k?"white":"#5a5040",borderColor:levelFilter===k?"#0b1426":"#e2e8f0",fontFamily: "var(--font-sans)",fontWeight:levelFilter===k?700:400 }}>{l}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {Object.entries(CAT_CFG).concat([["all",{label:"Tất cả loại",emoji:""}] as any]).reverse().map(([k,v]:any)=>(
              <button key={k} onClick={()=>setCatFilter(k)} className="px-3 py-1.5 rounded-[6px] border text-[13px] transition-all" style={{ background:catFilter===k?"#1C5FBE":"white",color:catFilter===k?"white":"#5a5040",borderColor:catFilter===k?"#1C5FBE":"#e2e8f0",fontFamily: "var(--font-sans)",fontWeight:catFilter===k?700:400 }}>{v.emoji} {v.label}</button>
            ))}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          /* Detail view */
          <div>
            <button onClick={()=>setSelected(null)} className="flex items-center gap-1.5 text-[13px] text-[#1C5FBE] mb-4" style={{ fontFamily: "var(--font-sans)" }}>
              ← Quay lại danh sách
            </button>
            <div className="rounded-[14px] overflow-hidden border border-[#e2e8f0]">
              {/* Hero */}
              <div className="p-8 flex items-center gap-6" style={{ background:selected.gradient }}>
                <div className="text-[72px] leading-none filter drop-shadow-lg">{selected.emoji}</div>
                <div>
                  <div className="text-[13px] text-white/70 uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                    {CAT_CFG[selected.category].label} · {LEVEL_CFG[selected.level].label}
                  </div>
                  <h2 className="text-[24px] text-white leading-tight" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{selected.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[13px] text-white/80 px-2.5 py-1 rounded" style={{ background:"rgba(255,255,255,0.15)" }}>{selected.shortName}</span>
                    <span className="text-[13px] text-white/80">{selected.canCu}</span>
                  </div>
                </div>
                <div className="ml-auto grid grid-cols-2 gap-3">
                  {[["Tổng trao tặng",selected.totalAwarded,"lần"],["Năm ngoái",selected.lastYear,"lần"],["Năm TD min",selected.minYears,"năm"],["Điểm min",selected.minScore,"/100"]].map(([l,v,u])=>(
                    <div key={l as string} className="text-center p-3 rounded-[8px]" style={{ background:"rgba(255,255,255,0.15)" }}>
                      <div className="text-[24px] leading-none text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{v}</div>
                      <div className="text-[13px] text-white/60">{l as string} ({u as string})</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-0 divide-x divide-[#e2e8f0]" style={{ background:"white" }}>
                <div className="p-6">
                  <h3 className="text-[14px] text-[#0b1426] mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Điều kiện xét tặng</h3>
                  <ul className="space-y-2">
                    {selected.conditions.map((c,i)=>(
                      <li key={i} className="flex items-start gap-2 text-[13px] text-[#5a5040]">
                        <CheckCircle2 className="size-4 shrink-0 mt-0.5" style={{ color:selected.color }}/>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[13px] text-[#635647] mt-4 leading-relaxed">{selected.description}</p>
                </div>
                <div className="p-6">
                  <h3 className="text-[14px] text-[#0b1426] mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Thẩm quyền & Căn cứ</h3>
                  <div className="space-y-3">
                    {[["Thẩm quyền ký",selected.signingAuth,"🖊️"],["Căn cứ pháp lý",selected.canCu,"⚖️"],["Đối tượng",selected.type==="individual"?"Cá nhân":selected.type==="collective"?"Tập thể":"Cá nhân & Tập thể","👤"],["Số năm thi đua",`Tối thiểu ${selected.minYears} năm liên tục`,"📅"],["Điểm xếp loại",`Tối thiểu ${selected.minScore}/100 điểm`,"⭐"]].map(([k,v,ic])=>(
                      <div key={k as string} className="flex items-start gap-2.5 p-3 rounded-[8px]" style={{ background:"#f4f7fb" }}>
                        <span className="text-[14px] shrink-0">{ic as string}</span>
                        <div>
                          <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{k as string}</div>
                          <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>{v as string}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {user.role==="cá nhân"||user.role==="lãnh đạo đơn vị" ? (
                    <button className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] text-white" style={{ background:selected.color,fontFamily: "var(--font-sans)",fontWeight:600 }}>
                      <Award className="size-4"/>Lập hồ sơ đề nghị
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid view */
          <>
            <p className="text-[13px] text-[#635647] mb-4" style={{ fontFamily: "var(--font-sans)" }}>Hiển thị {filtered.length}/{AWARDS.length} danh hiệu</p>
            <div className="grid grid-cols-3 gap-4">
              {filtered.map(a=>{
                const lc=LEVEL_CFG[a.level];
                return (
                  <button key={a.id} onClick={()=>setSelected(a)} className="rounded-[12px] border border-[#e2e8f0] overflow-hidden text-left hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer" style={{ background:"white" }}>
                    <div className="h-20 flex items-center justify-between px-4" style={{ background:a.gradient }}>
                      <div className="text-[44px] leading-none">{a.emoji}</div>
                      <div className="text-right">
                        <div className="text-[18px] text-white leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{a.totalAwarded}</div>
                        <div className="text-[13px] text-white/70">lần trao</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:lc.bg,color:lc.color,fontFamily: "var(--font-sans)",fontWeight:700 }}>{lc.label}</span>
                        <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#f4f7fb",color:"#5a5040",fontFamily: "var(--font-sans)" }}>{CAT_CFG[a.category].label}</span>
                      </div>
                      <h3 className="text-[13px] text-[#0b1426] leading-snug mb-1" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{a.name}</h3>
                      <p className="text-[13px] text-[#635647] line-clamp-2">{a.description.slice(0,90)}...</p>
                      <div className="flex items-center gap-3 mt-3 text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                        <span>≥{a.minYears} năm TD</span>
                        <span>≥{a.minScore} điểm</span>
                        <span className="ml-auto">{a.canCu.split(" ").slice(-1)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filtered.length===0&&(
                <div className="col-span-3 flex flex-col items-center justify-center py-16 gap-3">
                  <Search className="size-12 text-[#d1d5db]"/>
                  <p className="text-[14px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Không tìm thấy danh hiệu nào</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
