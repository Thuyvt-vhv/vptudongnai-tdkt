import { useState } from "react";
import {
  FileText, Download, Eye, Search, Filter, CheckCircle2,
  Printer, Copy, Star, Info, ChevronRight, Award, Gavel,
  FileSignature, ScrollText, ClipboardList, Users, X,
  BookOpen, AlertCircle, Clock, Building2,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface MauBieu {
  id: string;
  so: string;        // Mẫu số
  ten: string;       // Tên mẫu biểu
  canCu: string;     // Căn cứ pháp lý
  moTa: string;
  nhom: "de_nghi"|"hoi_dong"|"quyet_dinh"|"bao_cao"|"bien_ban"|"to_trinh";
  doiTuong: "ca_nhan"|"tap_the"|"ca_hai";
  bando: string[];   // Fields bắt buộc
  icon: typeof FileText;
  color: string;
  usageCount: number;
  lastUpdated: string;
  binhAn: boolean;   // Bình thường / Đặc biệt
}

const MAUS: MauBieu[] = [
  {
    id:"m01", so:"Mẫu 01/TT15", ten:"Tờ khai Thành tích đề nghị Khen thưởng (Cá nhân)",
    canCu:"Phụ lục I, TT 15/2025/TT-BNV",
    moTa:"Dùng cho cá nhân tự lập hồ sơ đề nghị khen thưởng các danh hiệu từ CSTĐCS đến Bằng khen Chính phủ",
    nhom:"de_nghi", doiTuong:"ca_nhan", color:"#1C5FBE",
    bando:["Họ và tên","CCCD/CMND","Chức vụ","Đơn vị","Thành tích năm 1","Thành tích năm 2","Danh hiệu đề nghị","Kỳ xét","Xác nhận thủ trưởng"],
    icon:FileText, usageCount:312, lastUpdated:"05/08/2025", binhAn:true,
  },
  {
    id:"m02", so:"Mẫu 02/TT15", ten:"Tờ khai Thành tích đề nghị Khen thưởng (Tập thể)",
    canCu:"Phụ lục II, TT 15/2025/TT-BNV",
    moTa:"Dùng cho tập thể lập hồ sơ đề nghị Tập thể LĐXS, Bằng khen UBND tỉnh và tương đương",
    nhom:"de_nghi", doiTuong:"tap_the", color:"#0891b2",
    bando:["Tên tập thể","Đơn vị","Số CBCC","Thủ trưởng","Thành tích tập thể","Danh hiệu đề nghị","Xác nhận"],
    icon:Users, usageCount:203, lastUpdated:"05/08/2025", binhAn:true,
  },
  {
    id:"m03", so:"Mẫu 03/TT15", ten:"Tờ trình đề nghị Khen thưởng (Đơn vị → Cấp trên)",
    canCu:"Phụ lục III, TT 15/2025/TT-BNV",
    moTa:"Văn bản tờ trình của Thủ trưởng đơn vị gửi lên cấp trên để đề ngh�� xét khen thưởng",
    nhom:"to_trinh", doiTuong:"ca_hai", color:"#7c3aed",
    bando:["Đơn vị đề nghị","Số hiệu văn bản","Ngày lập","Danh sách cá nhân/tập thể","Danh hiệu đề nghị","Căn cứ pháp lý","Chữ ký thủ trưởng"],
    icon:ScrollText, usageCount:87, lastUpdated:"05/08/2025", binhAn:true,
  },
  {
    id:"m04", so:"Mẫu 04/TT15", ten:"Biên bản họp Hội đồng TĐKT xét duyệt hồ sơ",
    canCu:"Phụ lục IV, TT 15/2025/TT-BNV",
    moTa:"Biên bản chính thức ghi nhận kết quả phiên họp Hội đồng TĐKT xét duyệt hồ sơ khen thưởng",
    nhom:"bien_ban", doiTuong:"ca_hai", color:"#92400e",
    bando:["Số biên bản","Ngày họp","Địa điểm","Thành phần tham dự","Chủ tọa","Thư ký","Nội dung xét","Kết quả biểu quyết","Kết luận","Chữ ký"],
    icon:Gavel, usageCount:45, lastUpdated:"05/08/2025", binhAn:true,
  },
  {
    id:"m05", so:"Mẫu 05/TT15", ten:"Danh sách tổng hợp đề nghị Khen thưởng",
    canCu:"Phụ lục V, TT 15/2025/TT-BNV",
    moTa:"Bảng tổng hợp danh sách toàn bộ cá nhân/tập thể được đề nghị khen thưởng trong một đợt xét",
    nhom:"bao_cao", doiTuong:"ca_hai", color:"#166534",
    bando:["STT","Họ tên/Tên tập thể","Đơn vị","Danh hiệu","Điểm xét","Ghi chú","Người đề nghị"],
    icon:ClipboardList, usageCount:156, lastUpdated:"05/08/2025", binhAn:true,
  },
  {
    id:"m06", so:"Mẫu 06/TT15", ten:"Phiếu bỏ phiếu kín (Hội đồng TĐKT)",
    canCu:"Phụ lục VI, TT 15/2025/TT-BNV",
    moTa:"Phiếu bỏ phiếu kín dùng trong phiên họp Hội đồng, đảm bảo tính bí mật và khách quan",
    nhom:"hoi_dong", doiTuong:"ca_hai", color:"#c8102e",
    bando:["Kỳ xét","Tên ứng viên","Danh hiệu","Ô: Tán thành","Ô: Không tán thành","Ô: Không có ý kiến"],
    icon:ClipboardList, usageCount:892, lastUpdated:"05/08/2025", binhAn:true,
  },
  {
    id:"m07", so:"Mẫu 07/TT15", ten:"Biên bản kiểm phiếu (Hội đồng TĐKT)",
    canCu:"Phụ lục VII, TT 15/2025/TT-BNV",
    moTa:"Ghi nhận kết quả kiểm phiếu tại phiên họp bỏ phiếu kín của Hội đồng TĐKT",
    nhom:"bien_ban", doiTuong:"ca_hai", color:"#b45309",
    bando:["Ngày kiểm","Ban kiểm phiếu","Tổng phiếu phát","Tổng phiếu thu","Tán thành","Không tán thành","Không có ý kiến","Hợp lệ","Không hợp lệ"],
    icon:CheckCircle2, usageCount:45, lastUpdated:"05/08/2025", binhAn:true,
  },
  {
    id:"m08", so:"Mẫu 08/TT15", ten:"Quyết định khen thưởng (Cá nhân)",
    canCu:"Phụ lục VIII, TT 15/2025/TT-BNV",
    moTa:"Quyết định chính thức do Lãnh đạo có thẩm quyền ký tặng danh hiệu/bằng khen cho cá nhân",
    nhom:"quyet_dinh", doiTuong:"ca_nhan", color:"#0b1426",
    bando:["Số QĐ","Ngày ký","Lãnh đạo ký","Căn cứ pháp lý","Họ tên","Chức vụ","Đơn vị","Danh hiệu/Hình thức KT","Thành tích","Tiền thưởng/Kỷ niệm chương"],
    icon:Award, usageCount:979, lastUpdated:"05/08/2025", binhAn:false,
  },
  {
    id:"m09", so:"Mẫu 09/TT15", ten:"Quyết định khen thưởng (Tập thể)",
    canCu:"Phụ lục IX, TT 15/2025/TT-BNV",
    moTa:"Quyết định chính thức tặng danh hiệu/bằng khen cho tập thể",
    nhom:"quyet_dinh", doiTuong:"tap_the", color:"#0b1426",
    bando:["Số QĐ","Ngày ký","Tên tập thể","Đơn vị","Danh hiệu/Hình thức KT","Thành tích tập thể","Tiền thưởng"],
    icon:Award, usageCount:203, lastUpdated:"05/08/2025", binhAn:false,
  },
  {
    id:"m10", so:"Mẫu 10/TT15", ten:"Báo cáo kết quả bình xét Thi đua – Khen thưởng",
    canCu:"Phụ lục X, TT 15/2025/TT-BNV",
    moTa:"Báo cáo tổng kết quả hoạt động thi đua, khen thưởng hàng năm gửi cơ quan cấp trên",
    nhom:"bao_cao", doiTuong:"ca_hai", color:"#0891b2",
    bando:["Đơn vị báo cáo","Kỳ báo cáo","Tổng số CBCC","Số đạt HTXSNV","Số đề nghị KT","Số được KT","Số bị kỷ luật","Nhận xét đánh giá","Kiến nghị"],
    icon:FileText, usageCount:28, lastUpdated:"05/08/2025", binhAn:true,
  },
  {
    id:"m11", so:"Mẫu 11/TT15", ten:"Thông báo kết quả xét duyệt (gửi đơn vị)",
    canCu:"Phụ lục XI, TT 15/2025/TT-BNV",
    moTa:"Văn bản thông báo kết quả xét duyệt hồ sơ khen thưởng gửi về đơn vị đề nghị",
    nhom:"bao_cao", doiTuong:"ca_hai", color:"#166534",
    bando:["Số văn bản","Đơn vị gửi","Đơn vị nhận","Kết quả từng hồ sơ","Lý do không được xét"],
    icon:FileSignature, usageCount:187, lastUpdated:"05/08/2025", binhAn:true,
  },
];

const NHOM_CFG = {
  de_nghi:    { l:"Đề nghị KT",   c:"#1C5FBE", bg:"#ddeafc" },
  hoi_dong:   { l:"Hội đồng",     c:"#7c3aed", bg:"#f5f3ff" },
  quyet_dinh: { l:"Quyết định",   c:"#0b1426", bg:"#e8ecf3" },
  bao_cao:    { l:"Báo cáo",      c:"#166534", bg:"#dcfce7" },
  bien_ban:   { l:"Biên bản",     c:"#92400e", bg:"#fef3c7" },
  to_trinh:   { l:"Tờ trình",     c:"#b45309", bg:"#fef9c3" },
};

/* ══��════════════════════════════════════════════════════════════
   PDF PREVIEW MOCK
═══════════════════════════════════════════════════════════════ */
function PDFPreview({ mau, onClose }: { mau: MauBieu; onClose: () => void }) {
  const SAMPLE_DATA: Record<string,string> = {
    "Họ và tên": "Nguyễn Văn An",
    "CCCD/CMND": "261 234 567",
    "Chức vụ": "Phó trưởng phòng Tổng hợp",
    "Đơn vị": "Văn phòng Tỉnh ủy Đồng Nai",
    "Danh hiệu đề nghị": "Chiến sĩ Thi đua cấp Tỉnh",
    "Kỳ xét": "Năm 2026",
    "Số QĐ": "001/QĐ-UBND-2026",
    "Ngày ký": "15/01/2026",
    "Lãnh đạo ký": "Chủ tịch UBND tỉnh Đồng Nai",
    "Thành tích năm 1": "Hoàn thành xuất sắc nhiệm vụ, đạt 94.2/100 điểm",
    "Thành tích năm 2": "Sáng kiến cải tiến quy trình hành chính, tiết kiệm 120 giờ/năm",
    "Xác nhận thủ trưởng": "Đã xác nhận ngày 10/01/2026",
    "Số biên bản": "03/BB-HĐTĐKT-2026",
    "Ngày họp": "12/01/2026",
    "Địa điểm": "Phòng họp A, VP Tỉnh ủy",
    "Chủ tọa": "Đ/c Lê Minh Trí — Chánh Văn phòng",
    "Thư ký": "Đ/c Phạm Thị Lan",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background:"rgba(0,0,0,0.7)" }}>
      <div className="w-[720px] max-h-[90vh] rounded-[14px] overflow-hidden shadow-2xl flex flex-col" style={{ background:"white" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
          <div className="size-9 rounded-[8px] flex items-center justify-center" style={{ background:mau.color+"20" }}>
            <FileText className="size-5" style={{ color:mau.color }}/>
          </div>
          <div className="flex-1">
            <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{mau.so} — {mau.ten}</div>
            <div className="text-[13px] text-slate-700">{mau.canCu}</div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] border border-[#d1d5db] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
              <Printer className="size-3.5"/>In
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] text-white" style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>
              <Download className="size-3.5"/>Tải PDF
            </button>
            <button onClick={onClose} className="size-8 rounded-[6px] flex items-center justify-center border border-[#e2e8f0] hover:bg-[#fee2e2]">
              <X className="size-4 text-[#c8102e]"/>
            </button>
          </div>
        </div>
        {/* A4 Paper */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#e2e8f0]">
          <div className="bg-white mx-auto shadow-lg" style={{ width:595,minHeight:842,padding:"48px 56px",fontFamily: "var(--font-sans)" }}>
            {/* Letterhead */}
            <div className="flex items-start justify-between mb-8">
              <div className="text-[13px] text-slate-900 leading-relaxed">
                <div style={{ fontWeight:700 }}>UBND TỈNH ĐỒNG NAI</div>
                <div style={{ fontWeight:700 }}>VP TỈNH ỦY ĐỒNG NAI</div>
                <div className="mt-1">Số: {SAMPLE_DATA["Số QĐ"]||"___/20__"}</div>
              </div>
              <div className="text-center">
                <div className="text-[13px]" style={{ fontWeight:700,color:"#c8102e" }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="text-[13px]" style={{ fontWeight:700,color:"#c8102e" }}>Độc lập – Tự do – Hạnh phúc</div>
                <div className="w-full h-px mt-1" style={{ background:"#c8102e" }}/>
                <div className="text-[13px] mt-1 italic">Đồng Nai, ngày {SAMPLE_DATA["Ngày ký"]||"___ tháng ___ năm 20__"}</div>
              </div>
            </div>
            {/* Title */}
            <div className="text-center mb-6">
              <div className="text-[14px] text-slate-900 mb-1" style={{ fontFamily: "var(--font-sans)",fontWeight:700,textTransform:"uppercase" }}>
                {mau.ten.toUpperCase().split("(")[0].trim()}
              </div>
              <div className="text-[13px] text-slate-700 italic">({mau.canCu})</div>
            </div>
            {/* Body */}
            <div className="space-y-3 text-[13px] text-slate-900">
              {mau.nhom==="quyet_dinh"&&(
                <>
                  <p className="leading-relaxed">Căn cứ Luật Thi đua, Khen thưởng năm 2022; Nghị định số 98/2023/NĐ-CP ngày 16/12/2023; Thông tư số 01/2024/TT-BNV ngày 01/02/2024 của Bộ Nội vụ;</p>
                  <p className="leading-relaxed">Căn cứ Biên bản họp Hội đồng TĐKT số 03/BB-HĐTĐKT-2026 ngày 12/01/2026;</p>
                  <p className="leading-relaxed">Theo đề nghị của Chánh Văn phòng,</p>
                  <p className="mt-4" style={{ fontWeight:700 }}>QUYẾT ĐỊNH:</p>
                  <p><span style={{ fontWeight:700 }}>Điều 1.</span> Tặng danh hiệu <span style={{ fontWeight:700,color:"#c8102e" }}>"{SAMPLE_DATA["Danh hiệu đề nghị"]}"</span> cho:</p>
                  <div className="ml-6 space-y-1">
                    <p>- Họ tên: <span style={{ fontWeight:700 }}>{SAMPLE_DATA["Họ và tên"]}</span></p>
                    <p>- Chức vụ: {SAMPLE_DATA["Chức vụ"]}</p>
                    <p>- Đơn vị: {SAMPLE_DATA["Đơn vị"]}</p>
                  </div>
                  <p>Do có thành tích xuất sắc trong phong trào thi đua yêu nước, góp phần xây dựng và phát triển Tỉnh Đồng Nai.</p>
                  <p><span style={{ fontWeight:700 }}>Điều 2.</span> Kèm theo Quyết định này là Bằng công nhận danh hiệu và tiền thưởng theo quy định.</p>
                  <p><span style={{ fontWeight:700 }}>Điều 3.</span> Chánh Văn phòng, Thủ trưởng đơn vị liên quan và cá nhân có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này.</p>
                </>
              )}
              {mau.nhom!=="quyet_dinh"&&(
                <>
                  {mau.bando.map((f,i)=>(
                    <div key={i} className="flex items-start gap-3 pb-2 border-b border-dashed border-[#e2e8f0]">
                      <span className="w-[160px] shrink-0 text-slate-700">{f}:</span>
                      <span style={{ fontWeight:SAMPLE_DATA[f]?400:400,color:SAMPLE_DATA[f]?"#0b1426":"#d1d5db",fontStyle:SAMPLE_DATA[f]?"normal":"italic" }}>
                        {SAMPLE_DATA[f]||".........................................................................."}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
            {/* Signature block */}
            <div className="mt-12 flex justify-end">
              <div className="text-center text-[13px]">
                <div className="italic text-slate-700">Đồng Nai, ngày {SAMPLE_DATA["Ngày ký"]||"___ tháng ___ năm 20__"}</div>
                <div className="mt-1" style={{ fontWeight:700 }}>{SAMPLE_DATA["Lãnh đạo ký"]||"THỦ TRƯỞNG ĐƠN VỊ"}</div>
                <div className="text-[13px] italic text-slate-700">(Ký, đóng dấu)</div>
                <div className="mt-8 pt-2 border-t border-[#d1d5db]" style={{ fontWeight:700 }}>[Chữ ký số CA]</div>
              </div>
            </div>
            {/* TT15 compliance note */}
            <div className="mt-6 pt-4 border-t border-[#e2e8f0] text-[13px] text-slate-700 text-center italic">
              Mẫu biểu chuẩn theo {mau.canCu} · Hệ thống VPTU Đồng Nai v2.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function MauBieuPage({ user }: { user: LoginUser }) {
  const [search,setSearch]=useState("");
  const [nhomFilter,setNhomFilter]=useState("all");
  const [preview,setPreview]=useState<MauBieu|null>(null);
  const filtered=MAUS.filter(m=>{
    const ms=m.ten.toLowerCase().includes(search.toLowerCase())||m.so.toLowerCase().includes(search.toLowerCase());
    const mn=nhomFilter==="all"||m.nhom===nhomFilter;
    return ms&&mn;
  });
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:"#ffffff",fontFamily: "var(--font-sans)" }}>
      {preview&&<PDFPreview mau={preview} onClose={()=>setPreview(null)}/>}
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0]" style={{ background:"white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background:"linear-gradient(135deg,#92400e,#8a6400)" }}>
            <BookOpen className="size-5 text-white"/>
          </div>
          <div>
            <h1 className="text-[18px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Mẫu biểu TT 15/2025/TT-BNV</h1>
            <p className="text-[13px] text-slate-700">{MAUS.length} mẫu biểu chuẩn · Hiệu lực từ 05/08/2025 · Export PDF đúng form</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px]" style={{ background:"#dcfce7",border:"1px solid #86efac" }}>
              <CheckCircle2 className="size-4 text-[#166534]"/>
              <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>Đã cập nhật TT 15/2025</span>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="flex gap-3 mb-4">
          {[
            { l:"Tổng mẫu biểu",  v:MAUS.length,                                   c:"#0b1426",bg:"#f4f7fb" },
            { l:"Đề nghị KT",     v:MAUS.filter(m=>m.nhom==="de_nghi").length,     c:"#1C5FBE",bg:"#ddeafc" },
            { l:"Hội đồng",       v:MAUS.filter(m=>m.nhom==="hoi_dong").length,     c:"#7c3aed",bg:"#f5f3ff" },
            { l:"Quyết định",     v:MAUS.filter(m=>m.nhom==="quyet_dinh").length,   c:"#0b1426",bg:"#e8ecf3" },
            { l:"Biên bản",       v:MAUS.filter(m=>m.nhom==="bien_ban").length,     c:"#92400e",bg:"#fef3c7" },
            { l:"Báo cáo",        v:MAUS.filter(m=>m.nhom==="bao_cao").length,      c:"#166534",bg:"#dcfce7" },
          ].map(s=>(
            <div key={s.l} className="flex items-center gap-2 px-3 py-1.5 rounded-[8px]" style={{ background:s.bg }}>
              <span className="text-[18px] leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:s.c }}>{s.v}</span>
              <span className="text-[13px]" style={{ color:s.c,fontFamily: "var(--font-sans)" }}>{s.l}</span>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-700"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mẫu biểu..."
              className="pl-9 pr-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none" style={{ height:36,width:240,fontFamily: "var(--font-sans)" }}/>
          </div>
          <div className="flex gap-1">
            {[["all","Tất cả nhóm"],...Object.entries(NHOM_CFG).map(([k,v])=>[k,v.l])].map(([k,l])=>(
              <button key={k} onClick={()=>setNhomFilter(k)} className="px-3 py-1.5 rounded-[6px] border text-[13px] transition-all" style={{ background:nhomFilter===k?NHOM_CFG[k as keyof typeof NHOM_CFG]?.c||"#0b1426":"white",color:nhomFilter===k?"white":"#5a5040",borderColor:nhomFilter===k?NHOM_CFG[k as keyof typeof NHOM_CFG]?.c||"#0b1426":"#e2e8f0",fontFamily: "var(--font-sans)",fontWeight:nhomFilter===k?700:400 }}>{l}</button>
            ))}
          </div>
          <span className="ml-auto text-[13px] text-slate-700">{filtered.length} mẫu biểu</span>
        </div>
      </div>
      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(m=>{
            const Icon=m.icon;
            const nc=NHOM_CFG[m.nhom];
            return (
              <div key={m.id} className="rounded-[12px] border border-[#e2e8f0] overflow-hidden hover:shadow-md transition-all" style={{ background:"white" }}>
                {/* Top band */}
                <div className="h-2" style={{ background:m.color }}/>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="size-10 rounded-[8px] flex items-center justify-center shrink-0" style={{ background:m.color+"18" }}>
                      <Icon className="size-5" style={{ color:m.color }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <code className="text-[13px] block mb-0.5" style={{ color:m.color,fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{m.so}</code>
                      <h3 className="text-[13px] text-slate-900 leading-snug" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{m.ten}</h3>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed mb-3">{m.moTa}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:nc.bg,color:nc.c,fontFamily: "var(--font-sans)",fontWeight:700 }}>{nc.l}</span>
                    <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#f4f7fb",color:"#5a5040",fontFamily: "var(--font-sans)" }}>
                      {m.doiTuong==="ca_nhan"?"Cá nhân":m.doiTuong==="tap_the"?"Tập thể":"Cả hai"}
                    </span>
                    <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#fdf3d9",color:"#7d5a10",fontFamily: "var(--font-sans)" }}>
                      {m.usageCount} lần dùng
                    </span>
                  </div>
                  <div className="text-[13px] text-slate-700 mb-3">
                    <span className="font-semibold">{m.bando.length} trường bắt buộc:</span>{" "}
                    {m.bando.slice(0,3).join(", ")}{m.bando.length>3&&`... +${m.bando.length-3} nữa`}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>setPreview(m)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[6px] border border-[#e2e8f0] text-[13px] text-slate-700 hover:bg-[#f4f7fb] transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
                      <Eye className="size-3.5"/>Xem trước
                    </button>
                    <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-[13px] text-white" style={{ background:m.color,fontFamily: "var(--font-sans)",fontWeight:600 }}>
                      <Download className="size-3.5"/>Tải
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Legal footer */}
        <div className="mt-6 p-4 rounded-[10px] border border-[#e2e8f0] flex items-start gap-3" style={{ background:"#ffffff" }}>
          <AlertCircle className="size-5 text-[#b45309] shrink-0 mt-0.5"/>
          <div className="text-[13px] text-slate-700 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
            <span style={{ fontWeight:700,color:"#0b1426" }}>Lưu ý pháp lý:</span>{" "}
            Tất cả mẫu biểu trên đây được ban hành theo{" "}
            <span style={{ fontWeight:700 }}>Thông tư 01/2024/TT-BNV</span> ngày 01/02/2024 của Bộ Nội vụ, có hiệu lực từ ngày 01/02/2024, thay thế các mẫu biểu của TT 12/2019/TT-BNV.
            Phải sử dụng đúng mẫu biểu hiện hành. Không được tự ý sửa đổi nội dung, bố cục mẫu biểu.
          </div>
        </div>
      </div>
    </div>
  );
}