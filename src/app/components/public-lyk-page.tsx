import { useState, useRef, useEffect } from "react";
import {
  Megaphone, Phone, Shield, Clock, CheckCircle2, XCircle,
  ThumbsUp, ThumbsDown, MessageSquare, Eye, EyeOff,
  ChevronRight, ChevronLeft, Send, AlertCircle, RefreshCw,
  Calendar, Building2, Award, User, X, Info, Lock,
  BarChart2, Star, Loader2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TYPES & DATA
═══════════════════════════════════════════════════════════════ */
type OTPState = "idle"|"sending"|"sent"|"verifying"|"verified"|"error";
type OpinionType = "tan_thanh"|"co_y_kien"|"phan_doi";
type LYKStatus = "dang_lay"|"sap_het_han"|"da_ket_thuc";

interface PublicCase {
  id:string; maHoSo:string; tenNguoi:string; chucVu:string; donVi:string;
  danhHieu:string; namTD:number; diem:number; tomTat:string;
  deadLine:string; daysLeft:number; status:LYKStatus;
  tanThanh:number; coYKien:number; phanDoi:number;
  canCu:string; publicOpinions:PublicOpinion[];
}
interface PublicOpinion {
  id:string; loai:OpinionType; noiDung:string; thoiGian:string;
  donVi:string; anonymous:boolean;
}

const MOCK_CASES: PublicCase[] = [
  {
    id:"lyk-01", maHoSo:"NS-2026-0147", tenNguoi:"Nguyễn Văn An",
    chucVu:"Phó Trưởng phòng Tổng hợp", donVi:"Văn phòng Tỉnh ủy Đồng Nai",
    danhHieu:"Chiến sĩ Thi đua cấp Tỉnh", namTD:2, diem:94.2,
    tomTat:"Anh Nguyễn Văn An đề nghị danh hiệu Chiến sĩ Thi đua cấp Tỉnh năm 2026, sau 2 năm liên tục đạt CSTĐ cơ sở. Thành tích nổi bật: cải tiến quy trình hành chính, tiết kiệm 120 giờ/năm; hoàn thành 100% nhiệm vụ được giao.",
    deadLine:"29/04/2026", daysLeft:5, status:"dang_lay",
    tanThanh:18, coYKien:4, phanDoi:1,
    canCu:"Điều 23 NĐ 152/2025/NĐ-CP + Điều 15 TT 15/2025",
    publicOpinions:[
      { id:"o1", loai:"tan_thanh", noiDung:"Đồng chí An là người nhiệt tình, trách nhiệm cao trong công việc. Xứng đáng được khen thưởng.", thoiGian:"2 ngày trước", donVi:"Phòng Tổng hợp", anonymous:false },
      { id:"o2", loai:"co_y_kien", noiDung:"Đề nghị bổ sung thêm minh chứng về sáng kiến kinh nghiệm được công nhận cấp tỉnh.", thoiGian:"3 ngày trước", donVi:"Ủy ban Kiểm tra TU", anonymous:true },
      { id:"o3", loai:"tan_thanh", noiDung:"Thành tích 2 năm liên tục đáp ứng đủ tiêu chuẩn. Ủng hộ.", thoiGian:"3 ngày trước", donVi:"Ban Tuyên giáo TU", anonymous:false },
    ],
  },
  {
    id:"lyk-02", maHoSo:"NS-2026-0142", tenNguoi:"Trần Thị Bích",
    chucVu:"Trưởng Khoa Nội", donVi:"Sở Y tế Đồng Nai",
    danhHieu:"Bằng khen Chính phủ", namTD:3, diem:91.5,
    tomTat:"Chị Trần Thị Bích đề nghị Bằng khen Chính phủ do có thành tích đặc biệt xuất sắc trong công tác phòng chống dịch bệnh và cải tiến quy trình điều trị, giảm tỷ lệ tử vong 12%.",
    deadLine:"01/05/2026", daysLeft:7, status:"dang_lay",
    tanThanh:32, coYKien:2, phanDoi:0,
    canCu:"Điều 28 NĐ 152/2025/NĐ-CP + Điều 15 TT 15/2025",
    publicOpinions:[
      { id:"o4", loai:"tan_thanh", noiDung:"Chị Bích rất xứng đáng. Tận tâm với bệnh nhân và có nhiều đóng góp thiết thực.", thoiGian:"1 ngày trước", donVi:"Bệnh viện Đa khoa ĐN", anonymous:false },
      { id:"o5", loai:"tan_thanh", noiDung:"Nhất trí ủng hộ đề nghị khen thưởng.", thoiGian:"2 ngày trước", donVi:"Sở Y tế", anonymous:false },
    ],
  },
  {
    id:"lyk-03", maHoSo:"NS-2026-0136", tenNguoi:"Phòng Hành chính VP",
    chucVu:"Tập thể", donVi:"Văn phòng Tỉnh ủy Đồng Nai",
    danhHieu:"Tập thể Lao động Xuất sắc", namTD:1, diem:88.7,
    tomTat:"Phòng Hành chính VP Tỉnh ủy đề nghị danh hiệu Tập thể Lao động Xuất sắc năm 2026. 100% thành viên hoàn thành nhiệm vụ, trong đó 75% đạt HTXSNV.",
    deadLine:"20/04/2026", daysLeft:-4, status:"da_ket_thuc",
    tanThanh:12, coYKien:6, phanDoi:2,
    canCu:"Điều 27 NĐ 152/2025/NĐ-CP + Điều 15 TT 15/2025",
    publicOpinions:[
      { id:"o6", loai:"co_y_kien", noiDung:"Đề nghị làm rõ tỷ lệ thành viên đạt HTXSNV so với yêu cầu 70%.", thoiGian:"5 ngày trước", donVi:"Ban TC TU", anonymous:true },
      { id:"o7", loai:"tan_thanh", noiDung:"Phòng HC có nhiều đổi mới trong cải cách hành chính. Ủng hộ.", thoiGian:"6 ngày trước", donVi:"Phòng TH", anonymous:false },
    ],
  },
];

const STATUS_CFG: Record<LYKStatus,{label:string;color:string;bg:string;border:string}> = {
  dang_lay:     { label:"Đang lấy ý kiến", color:"#166534", bg:"#dcfce7", border:"#86efac" },
  sap_het_han:  { label:"Sắp hết hạn",    color:"#b45309", bg:"#fef3c7", border:"#fde68a" },
  da_ket_thuc:  { label:"Đã kết thúc",    color:"#5a5040", bg:"#eef2f8", border:"#d1ccc0" },
};
const OPINION_CFG: Record<OpinionType,{label:string;icon:typeof ThumbsUp;color:string;bg:string}> = {
  tan_thanh: { label:"Tán thành",   icon:ThumbsUp,     color:"#166534", bg:"#dcfce7" },
  co_y_kien: { label:"Có ý kiến",   icon:MessageSquare,color:"#b45309", bg:"#fef3c7" },
  phan_doi:  { label:"Phản đối",    icon:ThumbsDown,   color:"#c8102e", bg:"#fee2e2" },
};

/* ═══════════════════════════════════════════════════════════════
   OTP PHONE MODAL
═══════════════════════════════════════════════════════════════ */
function OTPModal({ onVerified, onClose }: { onVerified:(phone:string)=>void; onClose:()=>void }) {
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState(["","","","","",""]);
  const [state,setState]=useState<OTPState>("idle");
  const [timer,setTimer]=useState(0);
  const refs=Array.from({length:6},()=>useRef<HTMLInputElement>(null));

  const sendOTP=async()=>{
    if(phone.replace(/\D/g,"").length<9) return;
    setState("sending");
    await new Promise(r=>setTimeout(r,1200));
    setState("sent");
    setTimer(120);
  };
  useEffect(()=>{
    if(timer>0){ const t=setInterval(()=>setTimer(p=>p-1),1000); return ()=>clearInterval(t); }
  },[timer]);

  const verifyOTP=async()=>{
    const code=otp.join("");
    if(code.length<6) return;
    setState("verifying");
    await new Promise(r=>setTimeout(r,1000));
    // Accept any 6-digit OTP as valid (mock)
    if(code==="000000"){ setState("error"); return; }
    setState("verified");
    await new Promise(r=>setTimeout(r,800));
    onVerified(phone);
  };

  const handleOtpInput=(i:number,v:string)=>{
    if(!/^\d?$/.test(v)) return;
    const next=[...otp]; next[i]=v;
    setOtp(next);
    if(v&&i<5) refs[i+1].current?.focus();
    if(!v&&i>0) refs[i-1].current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background:"rgba(11,20,38,0.85)" }}>
      <div className="w-[400px] rounded-[16px] overflow-hidden shadow-2xl" style={{ background:"white" }}>
        <div className="p-6" style={{ background:"linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="size-12 rounded-xl flex items-center justify-center mb-3" style={{ background:"rgba(200,150,12,0.2)" }}>
            <Lock className="size-6 text-[#8a6400]"/>
          </div>
          <h2 className="text-[18px] text-white leading-tight" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Xác thực để gửi ý kiến</h2>
          <p className="text-[13px] mt-1" style={{ color:"rgba(255,255,255,0.6)",fontFamily: "var(--font-sans)" }}>
            Bảo vệ tính khách quan — chỉ mỗi số điện thoại được gửi 1 lần/hồ sơ
          </p>
        </div>
        <div className="p-6">
          {state==="idle"||state==="sending" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] uppercase tracking-wider text-slate-700 mb-1.5" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Số điện thoại</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 border border-[#d1d5db] rounded-[6px] text-[13px] text-slate-700" style={{ background:"#f4f7fb",fontFamily: "var(--font-sans)" }}>
                    🇻🇳 +84
                  </div>
                  <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="9xx xxx xxx"
                    className="flex-1 px-3 border border-[#d1d5db] rounded-[6px] text-[14px] outline-none focus:border-[#1C5FBE]"
                    style={{ height:40,fontFamily:"JetBrains Mono, monospace" }}/>
                </div>
              </div>
              <div className="p-3 rounded-[8px] flex items-start gap-2" style={{ background:"#ffffff",border:"1px solid #f0dba0" }}>
                <Info className="size-4 text-[#b45309] shrink-0 mt-0.5"/>
                <p className="text-[13px] text-[#7d5a10]" style={{ fontFamily: "var(--font-sans)" }}>
                  Ý kiến của bạn sẽ được ghi nhận ẩn danh hoặc có tên tùy lựa chọn. Chỉ sử dụng để xác thực 1 lần.
                </p>
              </div>
              <button onClick={sendOTP} disabled={phone.length<9||state==="sending"} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] text-white"
                style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600,opacity:phone.length<9?0.5:1 }}>
                {state==="sending"?<Loader2 className="size-4 animate-spin"/>:<Phone className="size-4"/>}
                {state==="sending"?"Đang gửi OTP...":"Gửi mã OTP"}
              </button>
            </div>
          ) : state==="sent"||state==="verifying"||state==="error" ? (
            <div className="space-y-4">
              <p className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
                Nhập mã 6 số đã gửi đến <strong className="text-slate-900">{phone}</strong>
              </p>
              <div className="flex gap-2 justify-center">
                {otp.map((v,i)=>(
                  <input key={i} ref={refs[i]} value={v} onChange={e=>handleOtpInput(i,e.target.value)}
                    maxLength={1} className="size-11 text-center text-[18px] border-2 rounded-[8px] outline-none transition-colors"
                    style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700,borderColor:state==="error"?"#fca5a5":v?"#1C5FBE":"#d1d5db" }}/>
                ))}
              </div>
              {state==="error"&&<p className="text-[13px] text-[#c8102e] text-center" style={{ fontFamily: "var(--font-sans)" }}>Mã OTP không đúng. Thử lại.</p>}
              <button onClick={verifyOTP} disabled={otp.join("").length<6||state==="verifying"} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] text-white"
                style={{ background:"#166534",fontFamily: "var(--font-sans)",fontWeight:600 }}>
                {state==="verifying"?<Loader2 className="size-4 animate-spin"/>:<CheckCircle2 className="size-4"/>}
                {state==="verifying"?"Đang xác thực...":"Xác nhận OTP"}
              </button>
              <div className="text-center text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
                {timer>0?`Gửi lại sau ${timer}s`:<button onClick={()=>{setState("idle");setOtp(["","","","","",""]);}} className="text-[#1C5FBE]">Gửi lại mã</button>}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="size-12 text-[#166534]"/>
              <p className="text-[14px] text-[#166534]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Xác thực thành công!</p>
            </div>
          )}
          <button onClick={onClose} className="w-full mt-3 py-2 text-[13px] text-slate-700 hover:text-slate-700 transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OPINION FORM
═══════════════════════════════════════════════════════════════ */
function OpinionForm({ caseItem, phone, onSubmit, onCancel }:{ caseItem:PublicCase; phone:string; onSubmit:()=>void; onCancel:()=>void }) {
  const [loai,setLoai]=useState<OpinionType>("tan_thanh");
  const [content,setContent]=useState("");
  const [anon,setAnon]=useState(true);
  const [donVi,setDonVi]=useState("");
  const [sending,setSending]=useState(false);
  const handleSubmit=async()=>{
    if(!content.trim()) return;
    setSending(true);
    await new Promise(r=>setTimeout(r,1200));
    onSubmit();
  };
  return (
    <div className="rounded-[12px] border-2 border-[#1C5FBE] p-5" style={{ background:"#f8fbff" }}>
      <h3 className="text-[14px] text-slate-900 mb-4" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>
        Gửi ý kiến về hồ sơ {caseItem.maHoSo}
      </h3>
      {/* Loại ý kiến */}
      <div className="mb-4">
        <label className="block text-[13px] uppercase tracking-wider text-slate-700 mb-2" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Loại ý kiến</label>
        <div className="flex gap-2">
          {(Object.entries(OPINION_CFG) as [OpinionType,typeof OPINION_CFG[OpinionType]][]).map(([k,cfg])=>{
            const Icon=cfg.icon; const a=loai===k;
            return (
              <button key={k} onClick={()=>setLoai(k)} className="flex items-center gap-2 px-4 py-2 rounded-[8px] border-2 text-[13px] transition-all flex-1 justify-center"
                style={{ background:a?cfg.bg:"white",borderColor:a?cfg.color:"#e2e8f0",color:a?cfg.color:"#5a5040",fontFamily: "var(--font-sans)",fontWeight:a?700:400 }}>
                <Icon className="size-4"/>{cfg.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Nội dung */}
      <div className="mb-4">
        <label className="block text-[13px] uppercase tracking-wider text-slate-700 mb-1.5" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Nội dung ý kiến</label>
        <textarea value={content} onChange={e=>setContent(e.target.value)} rows={4}
          placeholder="Trình bày ý kiến của bạn về hồ sơ khen thưởng này một cách khách quan, trung thực..."
          className="w-full px-3 py-2.5 border border-[#d1d5db] rounded-[8px] text-[13px] outline-none focus:border-[#1C5FBE] resize-none"
          style={{ fontFamily: "var(--font-sans)" }}/>
        <div className="flex justify-between mt-1">
          <span className="text-[13px] text-slate-700">Tối thiểu 20 ký tự</span>
          <span className="text-[13px] text-slate-700">{content.length}/500</span>
        </div>
      </div>
      {/* Đơn vị (nếu không ẩn danh) */}
      {!anon&&(
        <div className="mb-4">
          <label className="block text-[13px] uppercase tracking-wider text-slate-700 mb-1.5" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Đơn vị công tác</label>
          <input value={donVi} onChange={e=>setDonVi(e.target.value)} placeholder="VD: Phòng Tổng hợp, VP Tỉnh ủy"
            className="w-full px-3 border border-[#d1d5db] rounded-[6px] text-[13px] outline-none" style={{ height:40,fontFamily: "var(--font-sans)" }}/>
        </div>
      )}
      {/* Ẩn danh toggle */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-[8px]" style={{ background:"white",border:"1px solid #e2e8f0" }}>
        <button onClick={()=>setAnon(!anon)} className="flex items-center gap-2 flex-1 text-left">
          {anon?<EyeOff className="size-4 text-slate-700"/>:<Eye className="size-4 text-[#1C5FBE]"/>}
          <div>
            <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>
              {anon?"Gửi ẩn danh (số điện thoại sẽ được mã hóa)":"Gửi có tên đơn vị"}
            </div>
            <div className="text-[13px] text-slate-700">
              {anon?"Họ tên và số điện thoại sẽ không hiển thị công khai":"Đơn vị công tác sẽ được hiển thị công khai"}
            </div>
          </div>
        </button>
        <div className="size-5 rounded border-2 flex items-center justify-center" style={{ borderColor:anon?"#1C5FBE":"#d1d5db",background:anon?"#1C5FBE":"white" }}>
          {anon&&<CheckCircle2 className="size-3.5 text-white"/>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={content.length<20||sending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] text-white transition-all"
          style={{ background:content.length<20?"#4f5d6e":"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>
          {sending?<Loader2 className="size-4 animate-spin"/>:<Send className="size-4"/>}
          {sending?"Đang gửi...":"Gửi ý kiến"}
        </button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-[8px] border border-[#e2e8f0] text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
          Hủy
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function PublicLYKPage({ onBack }:{ onBack:()=>void }) {
  const [phone,setPhone]=useState<string|null>(null);
  const [showOTP,setShowOTP]=useState(false);
  const [selected,setSelected]=useState<PublicCase|null>(null);
  const [formCase,setFormCase]=useState<string|null>(null);
  const [submitted,setSubmitted]=useState<Set<string>>(new Set());
  const [showAll,setShowAll]=useState<Record<string,boolean>>({});

  const handleOpenForm=(caseId:string)=>{
    if(!phone){ setShowOTP(true); return; }
    setFormCase(caseId);
  };
  const handleSubmitted=(caseId:string)=>{
    setSubmitted(prev=>new Set([...prev,caseId]));
    setFormCase(null);
  };

  return (
    <div className="min-h-screen" style={{ background:"#f4f7fb",fontFamily: "var(--font-sans)" }}>
      {showOTP&&<OTPModal onVerified={p=>{ setPhone(p); setShowOTP(false); }} onClose={()=>setShowOTP(false)}/>}
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0b1426 0%,#1a2744 60%,#0b1426 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-white/60 hover:text-white transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
              <ChevronLeft className="size-4"/>Quay lại hệ thống
            </button>
          </div>
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-[14px] flex items-center justify-center shrink-0" style={{ background:"rgba(200,150,12,0.2)" }}>
              <Megaphone className="size-7 text-[#8a6400]"/>
            </div>
            <div>
              <div className="text-[13px] uppercase tracking-widest text-[#8a6400] mb-1" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Cổng Thông tin Công khai</div>
              <h1 className="text-[24px] text-white leading-tight" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>
                Lấy ý kiến Khen thưởng
              </h1>
              <p className="text-[13px] mt-1.5" style={{ color:"rgba(255,255,255,0.6)",fontFamily: "var(--font-sans)" }}>
                Tỉnh ủy Đồng Nai · Theo Điều 15 TT 15/2025/TT-BNV · Không cần đăng nhập
              </p>
            </div>
            {!phone ? (
              <button onClick={()=>setShowOTP(true)} className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-[13px]"
                style={{ background:"#8a6400",color:"white",fontFamily: "var(--font-sans)",fontWeight:600 }}>
                <Phone className="size-4"/>Xác thực để gửi ý kiến
              </button>
            ) : (
              <div className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-[8px]" style={{ background:"rgba(22,101,52,0.3)",border:"1px solid #166534" }}>
                <CheckCircle2 className="size-4 text-[#4ade80]"/>
                <span className="text-[13px] text-[#4ade80]" style={{ fontFamily: "var(--font-sans)" }}>Đã xác thực · {phone.slice(0,4)}***{phone.slice(-3)}</span>
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-6">
            {[["📋","3 hồ sơ","đang xin ý kiến"],["💬","47 ý kiến","đã nhận"],["⏱","5 ngày","hạn tối thiểu TT 15/2025"],["🔒","Bảo mật","SĐT mã hóa SHA-256"]].map(([ic,v,l])=>(
              <div key={l as string} className="flex items-center gap-2 px-3 py-2 rounded-[8px]" style={{ background:"rgba(255,255,255,0.08)" }}>
                <span className="text-[14px]">{ic as string}</span>
                <div>
                  <div className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{v as string}</div>
                  <div className="text-[13px]" style={{ color:"rgba(255,255,255,0.5)" }}>{l as string}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Cases */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        {MOCK_CASES.map(c=>{
          const sc=STATUS_CFG[c.status]; const total=c.tanThanh+c.coYKien+c.phanDoi;
          const ttPct=total?Math.round(c.tanThanh/total*100):0;
          const isDone=submitted.has(c.id); const isForm=formCase===c.id;
          const isOpen=showAll[c.id]; const ops=c.publicOpinions;
          return (
            <div key={c.id} className="rounded-[14px] border border-[#e2e8f0] overflow-hidden" style={{ background:"white" }}>
              {/* Header */}
              <div className="p-5 border-b border-[#e2e8f0]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="size-12 rounded-[10px] flex items-center justify-center shrink-0" style={{ background:"#f4f7fb" }}>
                      <Award className="size-6 text-[#8a6400]"/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <code className="text-[13px] text-[#1C5FBE]" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{c.maHoSo}</code>
                        <span className="text-[13px] px-2 py-0.5 rounded-full border" style={{ background:sc.bg,color:sc.color,borderColor:sc.border,fontFamily: "var(--font-sans)",fontWeight:700 }}>{sc.label}</span>
                      </div>
                      <h2 className="text-[14px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{c.tenNguoi}</h2>
                      <div className="flex items-center gap-2 text-[13px] text-slate-700 mt-0.5">
                        <Building2 className="size-3.5"/><span>{c.donVi}</span>
                        <span>·</span>
                        <span>{c.chucVu}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[24px] text-[#8a6400]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{c.diem}</div>
                    <div className="text-[13px] text-slate-700">điểm/100</div>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-[8px]" style={{ background:"#f4f7fb" }}>
                  <div className="text-[13px] text-slate-700 leading-relaxed">{c.tomTat}</div>
                  <div className="flex items-center gap-3 mt-2 text-[13px] text-slate-700">
                    <span className="flex items-center gap-1"><Award className="size-3"/>Đề nghị: <strong className="text-slate-900">{c.danhHieu}</strong></span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Calendar className="size-3"/>Hạn: <strong className="text-slate-900">{c.deadLine}</strong></span>
                    <span>·</span>
                    <span>{c.namTD} năm TD liên tục</span>
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div className="px-5 py-3 flex items-center gap-4 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background:"#eef2f8" }}>
                  <div className="h-full rounded-full" style={{ width:`${ttPct}%`,background:"#166534" }}/>
                </div>
                {([["tan_thanh",c.tanThanh,ThumbsUp,"#166534"],["co_y_kien",c.coYKien,MessageSquare,"#b45309"],["phan_doi",c.phanDoi,ThumbsDown,"#c8102e"]] as any[]).map(([k,v,Icon,col])=>(
                  <div key={k} className="flex items-center gap-1.5 text-[13px]" style={{ color:col }}>
                    <Icon className="size-3.5"/><strong>{v}</strong>
                  </div>
                ))}
                <span className="text-[13px] text-slate-700">{total} ý kiến</span>
              </div>
              {/* Opinions preview */}
              <div className="px-5 py-3 space-y-2">
                {(isOpen?ops:ops.slice(0,2)).map(op=>{
                  const oc=OPINION_CFG[op.loai]; const OIcon=oc.icon;
                  return (
                    <div key={op.id} className="flex items-start gap-2.5 p-3 rounded-[8px]" style={{ background:"#f4f7fb" }}>
                      <div className="size-7 rounded-full flex items-center justify-center shrink-0" style={{ background:oc.bg }}>
                        <OIcon className="size-3.5" style={{ color:oc.color }}/>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px]" style={{ color:oc.color,fontFamily: "var(--font-sans)",fontWeight:700 }}>{oc.label}</span>
                          {!op.anonymous&&<span className="text-[13px] text-slate-700">· {op.donVi}</span>}
                          {op.anonymous&&<span className="text-[13px] text-slate-700 italic">· Ẩn danh</span>}
                        </div>
                        <p className="text-[13px] text-slate-700">{op.noiDung}</p>
                        <span className="text-[13px] text-slate-600">{op.thoiGian}</span>
                      </div>
                    </div>
                  );
                })}
                {ops.length>2&&(
                  <button onClick={()=>setShowAll(p=>({...p,[c.id]:!p[c.id]}))} className="text-[13px] text-[#1C5FBE] flex items-center gap-1" style={{ fontFamily: "var(--font-sans)" }}>
                    {isOpen?<><ChevronLeft className="size-3"/>Ẩn bớt</>:<><ChevronRight className="size-3"/>Xem tất cả {ops.length} ý kiến</>}
                  </button>
                )}
              </div>
              {/* Actions */}
              <div className="px-5 py-3 border-t border-[#e2e8f0]">
                {isDone ? (
                  <div className="flex items-center gap-2 text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>
                    <CheckCircle2 className="size-4"/>Đã gửi ý kiến thành công. Cảm ơn bạn!
                  </div>
                ) : c.status==="da_ket_thuc" ? (
                  <div className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>Thời hạn lấy ý kiến đã kết thúc.</div>
                ) : isForm ? (
                  <OpinionForm caseItem={c} phone={phone||""} onSubmit={()=>handleSubmitted(c.id)} onCancel={()=>setFormCase(null)}/>
                ) : (
                  <button onClick={()=>handleOpenForm(c.id)} className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[13px] text-white"
                    style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>
                    <MessageSquare className="size-4"/>Gửi ý kiến về hồ sơ này
                    {!phone&&<span className="text-[13px] text-white/70 ml-1">(Cần xác thực SĐT)</span>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="p-4 rounded-[10px] border border-[#e2e8f0] text-center" style={{ background:"white" }}>
          <p className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
            Hệ thống VPTU Đồng Nai · Tỉnh ủy Đồng Nai · Thực hiện theo Điều 15 Thông tư 01/2024/TT-BNV<br/>
            Mọi thông tin cá nhân được bảo mật và chỉ dùng để xác thực. Không chia sẻ cho bên thứ ba.
          </p>
        </div>
      </div>
    </div>
  );
}