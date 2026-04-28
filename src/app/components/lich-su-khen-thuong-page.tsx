import { useState } from "react";
import {
  ScrollText, Search, Filter, Download, Calendar, Building2,
  Award, ChevronRight, CheckCircle2, User, Users, Eye,
  FileText, BarChart2, QrCode, ExternalLink, Clock,
} from "lucide-react";
import type { LoginUser } from "./login-page";

interface HistoryRecord {
  id:string; soQD:string; ngayKy:string; nam:number;
  tenNguoi:string; donVi:string; danhHieu:string; loai:"ca_nhan"|"tap_the";
  nguoiKy:string; diem:number; lyDo:string; level:"nha_nuoc"|"tinh"|"co_so";
  color:string;
}

const MOCK_HISTORY: HistoryRecord[] = [
  { id:"1",  soQD:"001/QĐ-UBND-2026", ngayKy:"15/01/2026", nam:2026, tenNguoi:"Nguyễn Văn An",       donVi:"Sở GD&ĐT",          danhHieu:"Chiến sĩ TĐ cấp Tỉnh",      loai:"ca_nhan",  nguoiKy:"Chủ tịch UBND tỉnh", diem:94.2, lyDo:"Thành tích xuất sắc nhiều năm", level:"tinh",  color:"#7c3aed" },
  { id:"2",  soQD:"002/QĐ-UBND-2026", ngayKy:"15/01/2026", nam:2026, tenNguoi:"Trần Thị Bích",       donVi:"Sở Y tế",            danhHieu:"Bằng khen UBND tỉnh",       loai:"ca_nhan",  nguoiKy:"Chủ tịch UBND tỉnh", diem:91.5, lyDo:"Đóng góp trong phòng chống dịch", level:"tinh", color:"#1C5FBE" },
  { id:"3",  soQD:"003/QĐ-UBND-2026", ngayKy:"20/01/2026", nam:2026, tenNguoi:"Phòng Hành chính VP", donVi:"VP Tỉnh ủy",         danhHieu:"Tập thể LĐXS",              loai:"tap_the",  nguoiKy:"Chánh Văn phòng",    diem:88.7, lyDo:"Hoàn thành xuất sắc nhiệm vụ",  level:"co_so", color:"#0891b2" },
  { id:"4",  soQD:"128/QĐ-CP-2025",   ngayKy:"30/12/2025", nam:2025, tenNguoi:"Lê Minh Cường",       donVi:"Sở GTVT",            danhHieu:"Bằng khen Chính phủ",       loai:"ca_nhan",  nguoiKy:"Thủ tướng Chính phủ",diem:92.8, lyDo:"Sáng kiến cải tiến giao thông",  level:"nha_nuoc",color:"#0b1426" },
  { id:"5",  soQD:"045/QĐ-UBND-2025", ngayKy:"25/12/2025", nam:2025, tenNguoi:"Phạm Thị Dung",       donVi:"Sở Tài chính",       danhHieu:"Chiến sĩ TĐ cơ sở",         loai:"ca_nhan",  nguoiKy:"Giám đốc Sở TC",     diem:90.1, lyDo:"Hoàn thành xuất sắc nhiệm vụ",  level:"co_so", color:"#1C5FBE" },
  { id:"6",  soQD:"046/QĐ-UBND-2025", ngayKy:"25/12/2025", nam:2025, tenNguoi:"Vũ Đức Hùng",         donVi:"Ban TC Tỉnh ủy",     danhHieu:"Chiến sĩ TĐ cấp Tỉnh",      loai:"ca_nhan",  nguoiKy:"Chủ tịch UBND tỉnh", diem:93.4, lyDo:"Cải cách hành chính xuất sắc",   level:"tinh",  color:"#7c3aed" },
  { id:"7",  soQD:"200/QĐ-CTN-2025",  ngayKy:"01/09/2025", nam:2025, tenNguoi:"Đặng Quốc Khánh",     donVi:"VP Tỉnh ủy",         danhHieu:"Huân chương LĐ Hạng 3",     loai:"ca_nhan",  nguoiKy:"Chủ tịch nước",      diem:96.5, lyDo:"Cống hiến lâu dài cho Tỉnh",    level:"nha_nuoc",color:"#92400e" },
  { id:"8",  soQD:"201/QĐ-CTN-2025",  ngayKy:"01/09/2025", nam:2025, tenNguoi:"Sở Giáo dục ĐT",      donVi:"Sở GD&ĐT",          danhHieu:"Huân chương LĐ Hạng 3",     loai:"tap_the",  nguoiKy:"Chủ tịch nước",      diem:95.2, lyDo:"Thành tích giáo dục xuất sắc",  level:"nha_nuoc",color:"#92400e" },
  { id:"9",  soQD:"089/QĐ-UBND-2025", ngayKy:"15/03/2025", nam:2025, tenNguoi:"Ngô Thị Hoa",         donVi:"Sở NN&PTNT",         danhHieu:"Bằng khen UBND tỉnh",       loai:"ca_nhan",  nguoiKy:"Chủ tịch UBND tỉnh", diem:87.3, lyDo:"Đóng góp phát triển nông nghiệp", level:"tinh", color:"#1C5FBE" },
  { id:"10", soQD:"090/QĐ-UBND-2025", ngayKy:"15/03/2025", nam:2025, tenNguoi:"Trương Văn Minh",      donVi:"Sở Công Thương",     danhHieu:"Chiến sĩ TĐ cơ sở",         loai:"ca_nhan",  nguoiKy:"Giám đốc Sở CT",     diem:89.6, lyDo:"Vượt chỉ tiêu kế hoạch",        level:"co_so", color:"#1C5FBE" },
  { id:"11", soQD:"156/QĐ-UBND-2024", ngayKy:"30/12/2024", nam:2024, tenNguoi:"Lương Thị Ngọc",       donVi:"Sở Tư pháp",         danhHieu:"Chiến sĩ TĐ cấp Tỉnh",      loai:"ca_nhan",  nguoiKy:"Chủ tịch UBND tỉnh", diem:91.8, lyDo:"Cải cách tư pháp xuất sắc",     level:"tinh",  color:"#7c3aed" },
  { id:"12", soQD:"157/QĐ-UBND-2024", ngayKy:"30/12/2024", nam:2024, tenNguoi:"Ban Nội chính TU",     donVi:"Ban Nội chính TU",   danhHieu:"Tập thể LĐXS",              loai:"tap_the",  nguoiKy:"Chánh VP TU",        diem:87.9, lyDo:"Hoàn thành xuất sắc nhiệm vụ",  level:"co_so", color:"#0891b2" },
];

const LEVEL_CFG={ nha_nuoc:{l:"Nhà nước",c:"#c8102e",bg:"#fee2e2"}, tinh:{l:"Cấp Tỉnh",c:"#1C5FBE",bg:"#ddeafc"}, co_so:{l:"Cơ sở",c:"#166534",bg:"#dcfce7"} };

export function LichSuKhenThuongPage({ user }: { user: LoginUser }) {
  const [search,setSearch]=useState("");
  const [yearFilter,setYearFilter]=useState("all");
  const [levelFilter,setLevelFilter]=useState("all");
  const [loaiFilter,setLoaiFilter]=useState("all");
  const [view,setView]=useState<"timeline"|"table">("timeline");
  const [detail,setDetail]=useState<HistoryRecord|null>(null);

  const years=[...new Set(MOCK_HISTORY.map(r=>r.nam))].sort((a,b)=>b-a);
  const filtered=MOCK_HISTORY.filter(r=>{
    const ms=r.tenNguoi.toLowerCase().includes(search.toLowerCase())||r.donVi.toLowerCase().includes(search.toLowerCase())||r.soQD.includes(search)||r.danhHieu.toLowerCase().includes(search.toLowerCase());
    const my=yearFilter==="all"||r.nam===Number(yearFilter);
    const ml=levelFilter==="all"||r.level===levelFilter;
    const mk=loaiFilter==="all"||r.loai===loaiFilter;
    return ms&&my&&ml&&mk;
  });

  // Group by year for timeline
  const byYear=years.reduce((acc,y)=>{ acc[y]=filtered.filter(r=>r.nam===y); return acc; },{} as Record<number,HistoryRecord[]>);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:"#faf7f2",fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e8e2d4]" style={{ background:"white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background:"linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <ScrollText className="size-5 text-[#8a6400]"/>
          </div>
          <div>
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Lịch sử Khen thưởng</h1>
            <p className="text-[13px] text-[#635647]">{MOCK_HISTORY.length} quyết định · {years[0]}-{years[years.length-1]} · Lưu trữ bất biến theo NĐ 13/2023</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={()=>setView(v=>v==="timeline"?"table":"timeline")} className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#d1d5db] text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
              {view==="timeline"?<BarChart2 className="size-3.5"/>:<Clock className="size-3.5"/>}
              {view==="timeline"?"Bảng dữ liệu":"Dòng thời gian"}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-[13px] text-white" style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>
              <Download className="size-3.5"/>Xuất Excel
            </button>
          </div>
        </div>
        {/* Stats */}
        <div className="flex gap-3 mb-4">
          {[
            { l:"Tổng QĐ",       v:MOCK_HISTORY.length,                                   c:"#0b1426",bg:"#f5f2ec" },
            { l:"Nhà nước",      v:MOCK_HISTORY.filter(r=>r.level==="nha_nuoc").length,   c:"#c8102e",bg:"#fee2e2" },
            { l:"Cấp Tỉnh",      v:MOCK_HISTORY.filter(r=>r.level==="tinh").length,       c:"#1C5FBE",bg:"#ddeafc" },
            { l:"Cơ sở",         v:MOCK_HISTORY.filter(r=>r.level==="co_so").length,      c:"#166534",bg:"#dcfce7" },
            { l:"Cá nhân",       v:MOCK_HISTORY.filter(r=>r.loai==="ca_nhan").length,     c:"#7c3aed",bg:"#f5f3ff" },
            { l:"Tập thể",       v:MOCK_HISTORY.filter(r=>r.loai==="tap_the").length,     c:"#0891b2",bg:"#e0f2fe" },
          ].map(s=>(
            <div key={s.l} className="flex items-center gap-2 px-3 py-1.5 rounded-[8px]" style={{ background:s.bg }}>
              <span className="text-[18px] leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:s.c }}>{s.v}</span>
              <span className="text-[13px]" style={{ color:s.c,fontFamily: "var(--font-sans)" }}>{s.l}</span>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#635647]"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tên, đơn vị, số QĐ..."
              className="pl-9 pr-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none" style={{ height:36,width:260,fontFamily: "var(--font-sans)" }}/>
          </div>
          <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} className="px-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none" style={{ height:36,fontFamily: "var(--font-sans)" }}>
            <option value="all">Tất cả năm</option>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none" style={{ height:36,fontFamily: "var(--font-sans)" }}>
            <option value="all">Tất cả cấp</option>
            <option value="nha_nuoc">Nhà nước</option>
            <option value="tinh">Cấp Tỉnh</option>
            <option value="co_so">Cơ sở</option>
          </select>
          <select value={loaiFilter} onChange={e=>setLoaiFilter(e.target.value)} className="px-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none" style={{ height:36,fontFamily: "var(--font-sans)" }}>
            <option value="all">Cá nhân & Tập thể</option>
            <option value="ca_nhan">Cá nhân</option>
            <option value="tap_the">Tập thể</option>
          </select>
          {(search||yearFilter!=="all"||levelFilter!=="all"||loaiFilter!=="all")&&
            <button onClick={()=>{ setSearch("");setYearFilter("all");setLevelFilter("all");setLoaiFilter("all"); }} className="px-3 py-1.5 rounded-[6px] border border-[#fca5a5] text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)" }}>
              Xóa bộ lọc
            </button>
          }
          <span className="ml-auto text-[13px] text-[#635647] flex items-center" style={{ fontFamily: "var(--font-sans)" }}>
            {filtered.length} kết quả
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {detail ? (
          /* Detail view */
          <div className="max-w-2xl mx-auto">
            <button onClick={()=>setDetail(null)} className="flex items-center gap-1.5 text-[13px] text-[#1C5FBE] mb-4" style={{ fontFamily: "var(--font-sans)" }}>← Quay lại</button>
            <div className="rounded-[14px] border border-[#e8e2d4] overflow-hidden">
              <div className="p-6" style={{ background:detail.color }}>
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-xl flex items-center justify-center" style={{ background:"rgba(255,255,255,0.15)" }}>
                    {detail.loai==="tap_the"?<Users className="size-8 text-white"/>:<User className="size-8 text-white"/>}
                  </div>
                  <div className="flex-1">
                    <div className="text-[18px] text-white leading-tight" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{detail.tenNguoi}</div>
                    <div className="text-[13px] text-white/80 mt-1">{detail.donVi}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[13px] text-white px-2.5 py-1 rounded" style={{ background:"rgba(255,255,255,0.2)",fontFamily: "var(--font-sans)",fontWeight:600 }}>{detail.danhHieu}</span>
                      <span className="text-[13px] text-white/70">{LEVEL_CFG[detail.level].l}</span>
                    </div>
                  </div>
                  <div className="text-center px-4 py-3 rounded-[8px]" style={{ background:"rgba(255,255,255,0.15)" }}>
                    <div className="text-[24px] text-white leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{detail.diem}</div>
                    <div className="text-[13px] text-white/70">điểm</div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3" style={{ background:"white" }}>
                {[["Số Quyết định",detail.soQD],["Ngày ký",detail.ngayKy],["Người ký",detail.nguoiKy],["Lý do khen thưởng",detail.lyDo],["Đối tượng",detail.loai==="ca_nhan"?"Cá nhân":"Tập thể"]].map(([k,v])=>(
                  <div key={k as string} className="flex gap-3">
                    <span className="text-[13px] text-[#635647] w-[150px] shrink-0" style={{ fontFamily: "var(--font-sans)" }}>{k as string}</span>
                    <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:k==="Số Quyết định"?700:400 }}>{v as string}</span>
                  </div>
                ))}
                <div className="flex gap-3 pt-3 border-t border-[#e8e2d4]">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] border border-[#d1d5db] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
                    <Eye className="size-4"/>Xem QĐ PDF
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-[13px] border border-[#d1d5db] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
                    <QrCode className="size-4"/>QR Verify
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-[13px] border border-[#d1d5db] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
                    <Download className="size-4"/>Tải về
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : view==="timeline" ? (
          /* Timeline view */
          <div className="max-w-3xl mx-auto">
            {years.filter(y=>byYear[y]?.length>0).map(year=>(
              <div key={year} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background:"#0b1426" }}>
                    <Calendar className="size-3.5 text-[#8a6400]"/>
                    <span className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{year}</span>
                  </div>
                  <div className="flex-1 h-px" style={{ background:"#e8e2d4" }}/>
                  <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{(byYear[year]||[]).length} quyết định</span>
                </div>
                <div className="relative pl-5">
                  <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background:"#e8e2d4" }}/>
                  <div className="space-y-3">
                    {(byYear[year]||[]).map(r=>{
                      const lc=LEVEL_CFG[r.level];
                      return (
                        <div key={r.id} className="relative">
                          <div className="absolute -left-3 top-4 size-2 rounded-full" style={{ background:r.color }}/>
                          <button onClick={()=>setDetail(r)} className="w-full rounded-[10px] border border-[#e8e2d4] p-4 text-left hover:bg-[#faf8f4] hover:border-[#d1ccc0] transition-all" style={{ background:"white" }}>
                            <div className="flex items-start gap-3">
                              <div className="size-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background:`${r.color}18` }}>
                                {r.loai==="tap_the"?<Users className="size-5" style={{ color:r.color }}/>:<User className="size-5" style={{ color:r.color }}/>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{r.tenNguoi}</span>
                                  <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:lc.bg,color:lc.c,fontFamily: "var(--font-sans)" }}>{r.danhHieu}</span>
                                  <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#f5f2ec",color:"#5a5040",fontFamily: "var(--font-sans)" }}>{r.loai==="ca_nhan"?"Cá nhân":"Tập thể"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[13px] text-[#635647]">
                                  <span>{r.donVi}</span>
                                  <span>·</span>
                                  <span style={{ fontFamily:"JetBrains Mono, monospace" }}>{r.soQD}</span>
                                  <span>·</span>
                                  <span>{r.ngayKy}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-[18px] leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:r.color }}>{r.diem}</div>
                                <div className="text-[13px] text-[#635647]">điểm</div>
                              </div>
                              <ChevronRight className="size-4 text-[#635647] shrink-0 mt-2"/>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length===0&&(
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Search className="size-12 text-[#d1d5db]"/>
                <p className="text-[14px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Không tìm thấy kết quả phù hợp</p>
              </div>
            )}
          </div>
        ) : (
          /* Table view */
          <div className="rounded-[10px] border border-[#e8e2d4] overflow-hidden">
            <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
              <thead><tr style={{ background:"linear-gradient(to right,#0b1426,#1a2744)" }}>
                {["Số QĐ","Ngày ký","Tên / Đơn vị","Danh hiệu","Cấp","Điểm","Người ký",""].map(h=><th key={h} className="text-left px-3 py-3 text-white" style={{ fontWeight:700 }}>{h}</th>)}
              </tr></thead>
              <tbody>{filtered.map((r,i)=>{
                const lc=LEVEL_CFG[r.level];
                return (
                  <tr key={r.id} className="border-t border-[#e8e2d4] hover:bg-[#faf8f4] transition-colors" style={{ background:i%2===0?"white":"#fdfcfa" }}>
                    <td className="px-3 py-2.5"><code className="text-[13px]" style={{ color:"#1C5FBE",fontFamily:"JetBrains Mono, monospace" }}>{r.soQD}</code></td>
                    <td className="px-3 py-2.5 text-[#635647]">{r.ngayKy}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-[#0b1426]">{r.tenNguoi}</div>
                      <div className="text-[13px] text-[#635647]">{r.donVi}</div>
                    </td>
                    <td className="px-3 py-2.5"><span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:`${r.color}18`,color:r.color,fontFamily: "var(--font-sans)" }}>{r.danhHieu}</span></td>
                    <td className="px-3 py-2.5"><span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:lc.bg,color:lc.c }}>{lc.l}</span></td>
                    <td className="px-3 py-2.5 text-center"><span style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700,color:r.color }}>{r.diem}</span></td>
                    <td className="px-3 py-2.5 text-[13px] text-[#5a5040]">{r.nguoiKy}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={()=>setDetail(r)} className="size-7 rounded flex items-center justify-center hover:bg-[#ddeafc] transition-colors">
                        <Eye className="size-4 text-[#1C5FBE]"/>
                      </button>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
            {filtered.length===0&&<div className="text-center py-10 text-[#635647] text-[13px]">Không có kết quả</div>}
          </div>
        )}
      </div>
    </div>
  );
}
