/**
 * tao-ho-so-wizard.tsx
 * 6-step full-screen wizard for users to create & submit a nomination
 * Steps: Chọn danh hiệu → Thông tin → Thành tích → Minh chứng → AI review → Xác nhận & Nộp
 */
import { useState, useEffect, useRef } from "react";
import {
  X, ChevronRight, ChevronLeft, Check, Sparkles, Loader2,
  Upload, FileText, Trash2, AlertTriangle, CheckCircle2,
  XCircle, Award, User, Building2, Calendar, Clock,
  Star, ArrowRight, Info, PenLine, Hash, Shield,
  Plus, Eye, Edit3,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface DanhHieuOption {
  id: string;
  ten: string;
  capBac: string;
  color: string;
  bg: string;
  moTa: string;
  dieuKien: string;
  aiScore: number;
  aiOk: boolean;
  aiNote?: string;
  canCu: string;
}

interface MinhChungItem {
  id: string;
  ten: string;
  loai: string;
  batBuoc: boolean;
  uploaded: boolean;
  fileName?: string;
}

interface WizardData {
  danhHieu: DanhHieuOption | null;
  ten: string;
  ngaySinh: string;
  gioiTinh: string;
  chucVu: string;
  donVi: string;
  namCongTac: string;
  sdt: string;
  email: string;
  thanhTich: string;
  sinhKien: string;
  mucTieu: string;
  minhChung: MinhChungItem[];
}

/* ═══════════════════════════════════════════════════════════════
   DANH HIỆU OPTIONS
═══════════════════════════════════════════════════════════════ */
const DANH_HIEU_OPTIONS: DanhHieuOption[] = [
  {
    id: "cstdcs",
    ten: "Chiến sĩ thi đua cơ sở",
    capBac: "Cấp cơ sở",
    color: "#166534", bg: "#dcfce7",
    moTa: "Dành cho cá nhân hoàn thành xuất sắc nhiệm vụ, đạt danh hiệu Lao động tiên tiến, có sáng kiến áp dụng thực tiễn.",
    dieuKien: "Hoàn thành xuất sắc nhiệm vụ, đạt LĐTT; có sáng kiến, đề tài được cấp cơ sở công nhận",
    aiScore: 91, aiOk: true,
    canCu: "Điều 22 Luật TĐKT 2022 · NĐ 152/2025/NĐ-CP Điều 10",
  },
  {
    id: "cstdt",
    ten: "Chiến sĩ thi đua cấp Tỉnh",
    capBac: "Cấp tỉnh",
    color: "#1C5FBE", bg: "#ddeafc",
    moTa: "Dành cho cá nhân đạt CSTĐ cơ sở 3 năm liên tiếp, có sáng kiến, đề tài NCKH được cấp tỉnh công nhận.",
    dieuKien: "Đạt CSTĐ cơ sở ≥ 3 năm liên tiếp; sáng kiến cấp tỉnh trở lên",
    aiScore: 68, aiOk: false, aiNote: "Cần thêm 1 năm CSTĐ cơ sở",
    canCu: "Điều 22 Luật TĐKT 2022 · NĐ 152/2025/NĐ-CP Điều 11",
  },
  {
    id: "bkubnd",
    ten: "Bằng khen UBND Tỉnh",
    capBac: "Cấp tỉnh",
    color: "#8a6400", bg: "#fef9ec",
    moTa: "Tặng cho cá nhân có thành tích xuất sắc trong thực hiện nhiệm vụ, đóng góp cho phong trào thi đua cấp tỉnh.",
    dieuKien: "Hoàn thành xuất sắc nhiệm vụ ≥ 2 năm; đóng góp rõ rệt cho phong trào địa phương",
    aiScore: 85, aiOk: true,
    canCu: "Điều 73 Luật TĐKT 2022 · TT 15/2025/TT-BNV",
  },
  {
    id: "bkcp",
    ten: "Bằng khen Chủ tịch UBND Tỉnh",
    capBac: "Cấp tỉnh",
    color: "#7c3aed", bg: "#f5f3ff",
    moTa: "Hình thức khen thưởng đột xuất hoặc theo đợt cho cá nhân có thành tích tiêu biểu.",
    dieuKien: "Thành tích tiêu biểu, đột xuất hoặc đạt giải thưởng cấp tỉnh trở lên",
    aiScore: 79, aiOk: true,
    canCu: "Điều 74 Luật TĐKT 2022",
  },
  {
    id: "ldtt",
    ten: "Lao động tiên tiến",
    capBac: "Cấp cơ sở",
    color: "#0891b2", bg: "#e0f2fe",
    moTa: "Dành cho cán bộ hoàn thành tốt nhiệm vụ được giao, tích cực tham gia phong trào thi đua trong năm.",
    dieuKien: "Hoàn thành tốt nhiệm vụ trong năm; không vi phạm kỷ luật; tham gia ≥ 1 phong trào",
    aiScore: 97, aiOk: true,
    canCu: "Điều 24 Luật TĐKT 2022 · NĐ 152/2025/NĐ-CP Điều 9",
  },
  {
    id: "hclhba",
    ten: "Huân chương Lao động hạng Ba",
    capBac: "Cấp Nhà nước",
    color: "#92400e", bg: "#fef3c7",
    moTa: "Tặng cho cá nhân có ≥ 20 năm công tác, đạt CSTĐ cấp Tỉnh ≥ 2 lần, đóng góp lớn cho sự nghiệp phát triển đất nước.",
    dieuKien: "≥ 20 năm công tác; CSTĐ cấp Tỉnh ≥ 2 lần; không vi phạm pháp luật",
    aiScore: 44, aiOk: false, aiNote: "Chưa đủ 20 năm công tác",
    canCu: "Điều 39–41 Luật TĐKT 2022 · NĐ 152/2025/NĐ-CP Chương III",
  },
];

/* ─── Minh chứng template per danh hiệu ────────────────────── */
const MINH_CHUNG_TEMPLATE: Record<string, { ten: string; loai: string; batBuoc: boolean }[]> = {
  default: [
    { ten: "Sơ yếu lý lịch tự thuật (Mẫu 2-BNV)", loai: "PDF", batBuoc: true },
    { ten: "Báo cáo thành tích cá nhân", loai: "DOCX/PDF", batBuoc: true },
    { ten: "Bảng điểm thi đua 2 năm gần nhất", loai: "PDF", batBuoc: true },
    { ten: "Tờ trình đề nghị (Mẫu 12-BNV)", loai: "PDF", batBuoc: true },
    { ten: "Quyết định bổ nhiệm/chức vụ hiện tại", loai: "PDF", batBuoc: false },
    { ten: "Sáng kiến/đề tài đã được công nhận", loai: "PDF/SCAN", batBuoc: false },
  ],
  hclhba: [
    { ten: "Sơ yếu lý lịch tự thuật (Mẫu 2-BNV)", loai: "PDF", batBuoc: true },
    { ten: "Báo cáo thành tích toàn diện (≥ 20 năm)", loai: "DOCX/PDF", batBuoc: true },
    { ten: "Quyết định khen thưởng CSTĐT lần 1 & 2", loai: "PDF/SCAN", batBuoc: true },
    { ten: "Xác nhận thời gian công tác của đơn vị", loai: "PDF", batBuoc: true },
    { ten: "Bảng điểm thi đua 5 năm gần nhất", loai: "PDF", batBuoc: true },
    { ten: "Xác nhận không vi phạm pháp luật", loai: "PDF", batBuoc: true },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   STEP CONFIGS
═══════════════════════════════════════════════════════════════ */
const STEPS = [
  { id: 1, label: "Chọn danh hiệu",    short: "Danh hiệu" },
  { id: 2, label: "Thông tin cá nhân", short: "Thông tin" },
  { id: 3, label: "Thành tích",         short: "Thành tích" },
  { id: 4, label: "Minh chứng",         short: "Minh chứng" },
  { id: 5, label: "AI kiểm tra",        short: "AI Review" },
  { id: 6, label: "Xác nhận & Nộp",    short: "Nộp HS" },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((s, i) => {
        const done    = step > s.id;
        const current = step === s.id;
        return (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div
                className="size-8 rounded-full flex items-center justify-center text-[13px] transition-all"
                style={{
                  background: done    ? "#166534" : current ? "#1C5FBE" : "#eef2f8",
                  color:      done    ? "white"   : current ? "white"   : "#635647",
                  border:     current ? "2px solid #1C5FBE" : "none",
                  fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
                  boxShadow:  current ? "0 0 0 4px #1C5FBE20" : "none",
                }}>
                {done ? <Check className="size-4" /> : s.id}
              </div>
              <span className="text-[13px] whitespace-nowrap"
                style={{ fontFamily: "var(--font-sans)", fontWeight: current ? 700 : 400, color: done || current ? "#0b1426" : "#6b5e47" }}>
                {s.short}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mt-[-16px] mx-1" style={{ background: done ? "#166534" : "#e2e8f0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 1 – Chọn danh hiệu
═══════════════════════════════════════════════════════════════ */
function Step1({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="size-4 text-[#7c3aed]" />
        <span className="text-[13px] text-[#7c3aed]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
          Trợ lý AI gợi ý dựa trên hồ sơ của bạn
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {DANH_HIEU_OPTIONS.map(dh => {
          const sel = data.danhHieu?.id === dh.id;
          return (
            <button key={dh.id} onClick={() => onChange({ danhHieu: dh })}
              className="text-left p-4 rounded-[12px] border transition-all hover:shadow-md"
              style={{
                borderColor: sel ? dh.color : "#e2e8f0",
                borderWidth: sel ? 2 : 1,
                background: sel ? dh.bg : "white",
                boxShadow: sel ? `0 0 0 3px ${dh.color}20` : "none",
              }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[13px] px-2 py-0.5 rounded-full"
                      style={{ background: dh.color, color: "white", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                      {dh.capBac}
                    </span>
                    {dh.aiOk
                      ? <span className="flex items-center gap-0.5 text-[13px] text-[#166534]"><CheckCircle2 className="size-3" />Đủ ĐK</span>
                      : <span className="flex items-center gap-0.5 text-[13px] text-[#b45309]"><AlertTriangle className="size-3" />Cần bổ sung</span>}
                  </div>
                  <h3 className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{dh.ten}</h3>
                </div>
                {/* AI score ring */}
                <div className="relative size-10 shrink-0">
                  <svg viewBox="0 0 40 40" className="size-10 -rotate-90">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#eef2f8" strokeWidth="4" />
                    <circle cx="20" cy="20" r="16" fill="none"
                      stroke={dh.aiScore >= 80 ? "#166534" : dh.aiScore >= 60 ? "#b45309" : "#c8102e"}
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - dh.aiScore / 100)}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[13px]"
                      style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
                        color: dh.aiScore >= 80 ? "#166534" : dh.aiScore >= 60 ? "#b45309" : "#c8102e" }}>
                      {dh.aiScore}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed mb-2" style={{ fontFamily: "var(--font-sans)" }}>{dh.moTa}</p>
              {dh.aiNote && (
                <div className="flex items-center gap-1 text-[13px] text-[#b45309] mt-1">
                  <AlertTriangle className="size-3" />{dh.aiNote}
                </div>
              )}
              <div className="text-[13px] text-slate-600 mt-2" style={{ fontFamily: "JetBrains Mono, monospace" }}>{dh.canCu}</div>
              {sel && (
                <div className="mt-2 flex items-center justify-end">
                  <div className="size-5 rounded-full bg-[#1C5FBE] flex items-center justify-center">
                    <Check className="size-3 text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2 – Thông tin cá nhân
═══════════════════════════════════════════════════════════════ */
function Step2({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  const Field = ({ label, id, value, onChange: oc, type = "text", required = false, half = false }:
    { label: string; id: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; half?: boolean }) => (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-[13px] mb-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 600, color: "#0f172a" }}>
        {label}{required && <span className="text-[#c8102e] ml-0.5">*</span>}
      </label>
      <input value={value} onChange={e => oc(e.target.value)} type={type}
        className="w-full px-3 border border-[#e2e8f0] rounded-[8px] text-[13px] text-slate-900 outline-none focus:border-[#1C5FBE] transition-colors"
        style={{ height: 40, fontFamily: "var(--font-sans)", background: "#fafaf9" }} />
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 p-3 rounded-[10px] flex items-center gap-2" style={{ background: "#f0f4ff", border: "1px solid #bfdbfe" }}>
        <Info className="size-4 text-[#1C5FBE]" />
        <span className="text-[13px] text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)" }}>
          Thông tin được điền sẵn từ hồ sơ của bạn. Vui lòng kiểm tra và cập nhật nếu cần.
        </span>
      </div>
      <Field label="Họ và tên" id="ten" value={data.ten} onChange={v => onChange({ ten: v })} required />
      <Field label="Ngày sinh" id="ns" value={data.ngaySinh} onChange={v => onChange({ ngaySinh: v })} type="date" half required />
      <div className="col-span-1">
        <label className="block text-[13px] mb-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 600, color: "#0f172a" }}>
          Giới tính<span className="text-[#c8102e] ml-0.5">*</span>
        </label>
        <select value={data.gioiTinh} onChange={e => onChange({ gioiTinh: e.target.value })}
          className="w-full px-3 border border-[#e2e8f0] rounded-[8px] text-[13px] text-slate-900 outline-none focus:border-[#1C5FBE]"
          style={{ height: 40, fontFamily: "var(--font-sans)", background: "#fafaf9" }}>
          <option value="nam">Nam</option>
          <option value="nu">Nữ</option>
        </select>
      </div>
      <Field label="Chức vụ" id="cv" value={data.chucVu} onChange={v => onChange({ chucVu: v })} half required />
      <Field label="Đơn vị công tác" id="dv" value={data.donVi} onChange={v => onChange({ donVi: v })} required />
      <Field label="Năm vào công tác" id="nc" value={data.namCongTac} onChange={v => onChange({ namCongTac: v })} type="number" half required />
      <div className="col-span-1" />
      <Field label="Số điện thoại" id="sdt" value={data.sdt} onChange={v => onChange({ sdt: v })} half />
      <Field label="Email công vụ" id="email" value={data.email} onChange={v => onChange({ email: v })} type="email" half />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3 – Thành tích
═══════════════════════════════════════════════════════════════ */
function Step3({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  const ttLen = data.thanhTich.length;
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[13px] mb-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: "#0f172a" }}>
          Tóm tắt thành tích nổi bật <span className="text-[#c8102e]">*</span>
        </label>
        <p className="text-[13px] text-slate-700 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
          Mô tả thành tích theo đúng quy định TT 15/2025/TT-BNV: nêu rõ thời gian, phạm vi ảnh hưởng, kết quả định lượng.
        </p>
        <div className="relative">
          <textarea value={data.thanhTich} onChange={e => onChange({ thanhTich: e.target.value })}
            rows={7}
            placeholder="Ví dụ: Hoàn thành xuất sắc nhiệm vụ được giao trong 3 năm 2023–2025; đạt danh hiệu CSTĐ cơ sở 2 năm liên tiếp; chủ trì sáng kiến 'Số hóa quy trình tiếp nhận hồ sơ TĐKT' giảm 40% thời gian xử lý..."
            className="w-full px-4 py-3 border border-[#e2e8f0] rounded-[10px] text-[13px] text-slate-900 outline-none focus:border-[#1C5FBE] resize-none"
            style={{ fontFamily: "var(--font-sans)", background: "#fafaf9", lineHeight: 1.7 }} />
          <span className="absolute bottom-3 right-3 text-[13px]"
            style={{ color: ttLen < 200 ? "#b45309" : ttLen < 500 ? "#1C5FBE" : "#166534", fontFamily: "JetBrains Mono, monospace" }}>
            {ttLen}/1000
          </span>
        </div>
        {ttLen < 200 && ttLen > 0 && (
          <p className="text-[13px] text-[#b45309] mt-1" style={{ fontFamily: "var(--font-sans)" }}>Nên viết ít nhất 200 ký tự để đảm bảo đủ thông tin.</p>
        )}
      </div>

      <div>
        <label className="block text-[13px] mb-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: "#0f172a" }}>
          Sáng kiến / Đề tài đã được công nhận
        </label>
        <textarea value={data.sinhKien} onChange={e => onChange({ sinhKien: e.target.value })}
          rows={3}
          placeholder="Tên sáng kiến, cấp được công nhận, năm công nhận, phạm vi áp dụng..."
          className="w-full px-4 py-3 border border-[#e2e8f0] rounded-[10px] text-[13px] text-slate-900 outline-none focus:border-[#1C5FBE] resize-none"
          style={{ fontFamily: "var(--font-sans)", background: "#fafaf9", lineHeight: 1.7 }} />
      </div>

      <div>
        <label className="block text-[13px] mb-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: "#0f172a" }}>
          Mục tiêu kế hoạch năm tiếp theo
        </label>
        <textarea value={data.mucTieu} onChange={e => onChange({ mucTieu: e.target.value })}
          rows={3}
          placeholder="Cam kết, mục tiêu thi đua năm 2027..."
          className="w-full px-4 py-3 border border-[#e2e8f0] rounded-[10px] text-[13px] text-slate-900 outline-none focus:border-[#1C5FBE] resize-none"
          style={{ fontFamily: "var(--font-sans)", background: "#fafaf9", lineHeight: 1.7 }} />
      </div>

      {/* AI tips */}
      <div className="p-4 rounded-[10px]" style={{ background: "linear-gradient(135deg,#faf5ff,#f5f3ff)", border: "1px solid #ddd6fe" }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-4 text-[#7c3aed]" />
          <span className="text-[13px] text-[#7c3aed]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>AI gợi ý nội dung</span>
        </div>
        <div className="space-y-1.5">
          {["Nêu rõ số liệu cụ thể: %, số lượng, thời gian thực hiện", "Đề cập phong trào thi đua đã tham gia trong kỳ", "Nhấn mạnh tác động lan tỏa, phạm vi ảnh hưởng"].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-[13px] text-[#5b21b6]" style={{ fontFamily: "var(--font-sans)" }}>
              <div className="size-4 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[13px] shrink-0 mt-0.5" style={{ fontWeight: 700 }}>{i+1}</div>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 4 – Minh chứng
═══════════════════════════════════════════════════════════════ */
function Step4({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  const toggle = (id: string, fileName: string) => {
    onChange({
      minhChung: data.minhChung.map(m => m.id === id ? { ...m, uploaded: !m.uploaded, fileName: !m.uploaded ? fileName : undefined } : m),
    });
  };

  const required  = data.minhChung.filter(m => m.batBuoc);
  const optional  = data.minhChung.filter(m => !m.batBuoc);
  const doneReq   = required.filter(m => m.uploaded).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Tài liệu đính kèm</h3>
          <p className="text-[13px] text-slate-700">Theo Mẫu biểu TT 15/2025/TT-BNV</p>
        </div>
        <div className="px-3 py-1.5 rounded-[8px]"
          style={{ background: doneReq === required.length ? "#dcfce7" : "#fef9ec", color: doneReq === required.length ? "#166534" : "#b45309", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 13 }}>
          {doneReq}/{required.length} bắt buộc
        </div>
      </div>

      {/* Required docs */}
      <div className="space-y-2">
        <p className="text-[13px] uppercase tracking-widest text-slate-600" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Bắt buộc</p>
        {required.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3.5 rounded-[10px] border transition-all"
            style={{ borderColor: m.uploaded ? "#86efac" : "#e2e8f0", background: m.uploaded ? "#f0fdf4" : "white" }}>
            <div className="size-9 rounded-[8px] flex items-center justify-center shrink-0"
              style={{ background: m.uploaded ? "#dcfce7" : "#eef2f8" }}>
              <FileText className="size-4" style={{ color: m.uploaded ? "#166534" : "#635647" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{m.ten}</div>
              <div className="text-[13px] text-slate-700">{m.loai}{m.fileName ? ` · ${m.fileName}` : ""}</div>
            </div>
            <button
              onClick={() => toggle(m.id, `${m.ten.split(" ").slice(0,2).join("_")}.pdf`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[13px] transition-all"
              style={{
                background: m.uploaded ? "#dcfce7" : "#1C5FBE",
                color: m.uploaded ? "#166534" : "white",
                fontFamily: "var(--font-sans)", fontWeight: 700,
              }}>
              {m.uploaded ? <><CheckCircle2 className="size-3" />Đã tải</> : <><Upload className="size-3" />Tải lên</>}
            </button>
          </div>
        ))}
      </div>

      {/* Optional docs */}
      <div className="space-y-2">
        <p className="text-[13px] uppercase tracking-widest text-slate-600" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Tùy chọn (khuyến nghị)</p>
        {optional.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3.5 rounded-[10px] border transition-all"
            style={{ borderColor: m.uploaded ? "#86efac" : "#e2e8f0", background: m.uploaded ? "#f0fdf4" : "#ffffff" }}>
            <div className="size-9 rounded-[8px] flex items-center justify-center shrink-0"
              style={{ background: m.uploaded ? "#dcfce7" : "#eef2f8" }}>
              <FileText className="size-4" style={{ color: m.uploaded ? "#166534" : "#635647" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)" }}>{m.ten}</div>
              <div className="text-[13px] text-slate-700">{m.loai}</div>
            </div>
            <button
              onClick={() => toggle(m.id, `${m.ten.split(" ").slice(0,2).join("_")}.pdf`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[13px] transition-all border"
              style={{
                borderColor: m.uploaded ? "#86efac" : "#e2e8f0",
                background: m.uploaded ? "#dcfce7" : "white",
                color: m.uploaded ? "#166534" : "#5a5040",
                fontFamily: "var(--font-sans)",
              }}>
              {m.uploaded ? <><CheckCircle2 className="size-3" />Đã tải</> : <><Upload className="size-3" />Thêm</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 5 – AI Review
═══════════════════════════════════════════════════════════════ */
function Step5({ data }: { data: WizardData }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) { p = 100; clearInterval(t); setLoading(false); }
      setProgress(p);
    }, 250);
    return () => clearInterval(t);
  }, []);

  const dh = data.danhHieu!;
  const reqUploaded = data.minhChung.filter(m => m.batBuoc && m.uploaded).length;
  const reqTotal    = data.minhChung.filter(m => m.batBuoc).length;
  const ttOk = data.thanhTich.length >= 200;

  const checks = [
    { label: "Thông tin cá nhân đầy đủ", ok: !!(data.ten && data.chucVu && data.donVi), detail: "Họ tên, chức vụ, đơn vị công tác" },
    { label: "Thành tích đủ nội dung", ok: ttOk, detail: `${data.thanhTich.length} ký tự (khuyến nghị ≥ 200)` },
    { label: "Tài liệu bắt buộc đã tải lên", ok: reqUploaded === reqTotal, detail: `${reqUploaded}/${reqTotal} tài liệu` },
    { label: "Đủ điều kiện danh hiệu (AI)", ok: dh.aiOk, detail: dh.aiNote ?? "Đáp ứng điều kiện theo Luật TĐKT 2022" },
    { label: "Không trùng lặp hồ sơ đã xét", ok: true, detail: "Đã đối chiếu cơ sở dữ liệu 2023–2025" },
    { label: "Đúng quy định TT 15/2025/TT-BNV", ok: true, detail: "Mẫu biểu và quy trình phù hợp" },
  ];
  const passCount = checks.filter(c => c.ok).length;
  const overallScore = Math.round((passCount / checks.length) * 100 * 0.4 + dh.aiScore * 0.6);

  return (
    <div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-5">
          <div className="relative size-20">
            <svg viewBox="0 0 80 80" className="size-20 animate-spin" style={{ animationDuration: "2s" }}>
              <circle cx="40" cy="40" r="34" fill="none" stroke="#eef2f8" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#7c3aed" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="size-7 text-[#7c3aed]" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[14px] text-slate-900 mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Trợ lý AI đang phân tích…</p>
            <p className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>Đối chiếu Luật TĐKT 2022 · NĐ 152/2025/NĐ-CP · TT 15/2025</p>
          </div>
          <div className="w-64 h-2 rounded-full overflow-hidden" style={{ background: "#eef2f8" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "linear-gradient(to right,#7c3aed,#1C5FBE)" }} />
          </div>
          <span className="text-[13px] text-[#7c3aed]" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>{Math.round(progress)}%</span>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Score summary */}
          <div className="flex items-center gap-6 p-5 rounded-[12px]"
            style={{ background: overallScore >= 80 ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "linear-gradient(135deg,#fef9ec,#fef3c7)", border: `1px solid ${overallScore >= 80 ? "#86efac" : "#fde68a"}` }}>
            <div className="relative size-20 shrink-0">
              <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none"
                  stroke={overallScore >= 80 ? "#166534" : "#b45309"}
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - overallScore / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[18px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: overallScore >= 80 ? "#166534" : "#b45309" }}>{overallScore}</span>
              </div>
            </div>
            <div>
              <div className="text-[18px] text-slate-900 mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                {overallScore >= 85 ? "Hồ sơ đạt chuẩn — Sẵn sàng nộp" : overallScore >= 70 ? "Hồ sơ tốt — Có thể nộp" : "Hồ sơ cần bổ sung"}
              </div>
              <div className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
                {passCount}/{checks.length} tiêu chí đạt · Danh hiệu: {dh.ten}
              </div>
              <div className="text-[13px] text-slate-600 mt-1">Phân tích bởi Trợ lý AI · {new Date().toLocaleDateString("vi-VN")}</div>
            </div>
          </div>

          {/* Check list */}
          <div className="space-y-2">
            {checks.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-[8px]"
                style={{ background: c.ok ? "#f0fdf4" : "#fff8f0", border: `1px solid ${c.ok ? "#86efac" : "#fde68a"}` }}>
                {c.ok ? <CheckCircle2 className="size-4 text-[#166534] shrink-0 mt-0.5" /> : <AlertTriangle className="size-4 text-[#b45309] shrink-0 mt-0.5" />}
                <div>
                  <div className="text-[13px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: c.ok ? "#166534" : "#b45309" }}>{c.label}</div>
                  <div className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>{c.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 6 – Xác nhận & Nộp
═══════════════════════════════════════════════════════════════ */
function Step6({ data, onSubmit, submitting, done }: { data: WizardData; onSubmit: () => void; submitting: boolean; done: boolean }) {
  const dh = data.danhHieu!;
  if (done) return (
    <div className="flex flex-col items-center justify-center py-12 gap-5">
      <div className="size-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#166534,#14532d)" }}>
        <CheckCircle2 className="size-10 text-white" />
      </div>
      <div className="text-center">
        <h3 className="text-[18px] text-slate-900 mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Hồ sơ đã được nộp thành công!</h3>
        <p className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
          Mã hồ sơ: <code style={{ fontFamily: "JetBrains Mono, monospace", background: "#eef2f8", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>TĐKT-2026-{String(Math.floor(Math.random()*100)+160).padStart(3,"0")}</code>
        </p>
        <p className="text-[13px] text-slate-700 mt-2" style={{ fontFamily: "var(--font-sans)" }}>
          Hội đồng cơ sở sẽ xem xét hồ sơ trong vòng <strong>15 ngày làm việc</strong>. Bạn sẽ nhận thông báo qua email và hệ thống.
        </p>
      </div>
      <div className="flex items-center gap-2 text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
        <Shield className="size-3.5" />Audit log đã ghi nhận · Chữ ký điện tử hợp lệ theo Luật GDĐT 2023
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-[12px]" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
        <h3 className="text-[14px] text-white mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Xác nhận thông tin hồ sơ</h3>
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          {[
            ["Danh hiệu đề nghị", dh.ten],
            ["Cấp xét duyệt", dh.capBac],
            ["Cán bộ đề nghị", data.ten],
            ["Chức vụ", data.chucVu],
            ["Đơn vị", data.donVi],
            ["Tài liệu đính kèm", `${data.minhChung.filter(m => m.uploaded).length} tài liệu`],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-white/50 mb-0.5" style={{ fontFamily: "var(--font-sans)" }}>{k}</div>
              <div className="text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-[10px]" style={{ background: "#fdf9ec", border: "1px solid #fde68a" }}>
        <div className="flex items-start gap-2">
          <Info className="size-4 text-[#b45309] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#92400e]" style={{ fontFamily: "var(--font-sans)", lineHeight: 1.6 }}>
            Bằng cách nộp hồ sơ, bạn xác nhận rằng tất cả thông tin trong hồ sơ là đúng sự thật theo quy định tại Điều 87 Luật TĐKT 2022. Khai báo sai sự thật có thể dẫn đến thu hồi danh hiệu và xử lý kỷ luật theo NĐ 152/2025/NĐ-CP Điều 72.
          </p>
        </div>
      </div>

      <button onClick={onSubmit} disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] text-[14px] text-white transition-all"
        style={{
          background: submitting ? "#4f5d6e" : "linear-gradient(135deg,#166534,#14532d)",
          fontFamily: "var(--font-sans)", fontWeight: 700,
          cursor: submitting ? "not-allowed" : "pointer",
        }}>
        {submitting ? <><Loader2 className="size-5 animate-spin" />Đang nộp hồ sơ…</> : <><ArrowRight className="size-5" />Xác nhận Nộp hồ sơ chính thức</>}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WIZARD SHELL
═══════════════════════════════════════════════════════════════ */
export function TaoHoSoWizard({ user, onClose, onDone }: { user: LoginUser; onClose: () => void; onDone: (code: string) => void }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const mcTemplate = MINH_CHUNG_TEMPLATE["default"].map((m, i) => ({ id: `mc${i}`, ...m, uploaded: false }));

  const [data, setData] = useState<WizardData>({
    danhHieu: null,
    ten: user.name,
    ngaySinh: "1985-06-15",
    gioiTinh: "nam",
    chucVu: "Chuyên viên",
    donVi: "Sở Nội vụ Đồng Nai",
    namCongTac: "2010",
    sdt: "0912 345 678",
    email: `${user.name.toLowerCase().replace(/\s/g,".")}@sononvu.dongnai.gov.vn`,
    thanhTich: "",
    sinhKien: "",
    mucTieu: "",
    minhChung: mcTemplate,
  });

  const change = (partial: Partial<WizardData>) => setData(prev => ({ ...prev, ...partial }));

  // When danh hiệu changes, update minh chứng template
  useEffect(() => {
    if (!data.danhHieu) return;
    const tmpl = MINH_CHUNG_TEMPLATE[data.danhHieu.id] ?? MINH_CHUNG_TEMPLATE["default"];
    setData(prev => ({ ...prev, minhChung: tmpl.map((m, i) => ({ id: `mc${i}`, ...m, uploaded: false })) }));
  }, [data.danhHieu?.id]);

  const canNext = () => {
    if (step === 1) return !!data.danhHieu;
    if (step === 2) return !!(data.ten && data.chucVu && data.donVi);
    if (step === 3) return data.thanhTich.length >= 50;
    return true;
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      const code = `TĐKT-2026-${String(Math.floor(Math.random()*100)+160).padStart(3,"0")}`;
      setTimeout(() => onDone(code), 3000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[16px] overflow-hidden shadow-2xl" style={{ background: "white" }}>
        {/* Header */}
        <div className="px-7 py-5 shrink-0" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[18px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                Tạo Hồ sơ Đề nghị Khen thưởng
              </h2>
              <p className="text-[13px] text-white/50 mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                Theo TT 15/2025/TT-BNV · Bước {step}/6
              </p>
            </div>
            <button onClick={onClose} className="size-9 rounded-[8px] flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="size-5 text-white/60" />
            </button>
          </div>
          <ProgressBar step={step} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6" style={{ background: "#ffffff" }}>
          <div className="mb-4">
            <h3 className="text-[18px] text-slate-900" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {STEPS[step - 1].label}
            </h3>
          </div>
          {step === 1 && <Step1 data={data} onChange={change} />}
          {step === 2 && <Step2 data={data} onChange={change} />}
          {step === 3 && <Step3 data={data} onChange={change} />}
          {step === 4 && <Step4 data={data} onChange={change} />}
          {step === 5 && <Step5 data={data} />}
          {step === 6 && <Step6 data={data} onSubmit={handleSubmit} submitting={submitting} done={done} />}
        </div>

        {/* Footer */}
        {!done && (
          <div className="px-7 py-4 border-t border-[#e2e8f0] flex items-center justify-between shrink-0" style={{ background: "white" }}>
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-[8px] border text-[13px] transition-all disabled:opacity-40"
              style={{ borderColor: "#e2e8f0", color: "#334155", fontFamily: "var(--font-sans)" }}>
              <ChevronLeft className="size-4" />Quay lại
            </button>

            <div className="flex items-center gap-2">
              {step < 6 && (
                <button
                  onClick={() => setStep(s => Math.min(6, s + 1))}
                  disabled={!canNext()}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-[8px] text-[13px] text-white transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#1C5FBE,#1752a8)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  Tiếp theo<ChevronRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
