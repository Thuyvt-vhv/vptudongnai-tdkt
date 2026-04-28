/**
 * phong-trao-workflow.tsx
 * Full workflow modals & panels for Phong trào thi đua:
 *   1. DangKyModal      — Đăng ký tham gia (user / manager)
 *   2. NopHoSoModal     — Nộp hồ sơ đề nghị khen thưởng
 *   3. ThamDinhPanel    — Thẩm định cấp cơ sở (manager)
 *   4. HoiDongVotePanel — Hội đồng bỏ phiếu (council)
 *   5. KyDuyetPanel     — Lãnh đạo ký duyệt & ban hành QĐ (leader)
 *   6. KetQuaPanel      — Công bố kết quả (all)
 */
import { useState, useRef } from "react";
import {
  X, CheckCircle2, XCircle, ChevronRight, ChevronLeft, AlertCircle,
  Upload, FileText, User, Building2, Award, Sparkles, Loader2,
  ThumbsUp, ThumbsDown, Minus, FileSignature, Trophy, Star,
  MessageSquare, CheckCheck, Clock, ArrowRight, BookOpen, Send,
  Shield, Hash, PenLine, Download, Eye, Flag, Stamp, Users,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES (re-exported for consumers)
═══════════════════════════════════════════════════════════════ */
export type HoSoStatus = "chua_nop" | "dang_soan" | "da_nop" | "da_duyet" | "tra_lai" | "bo_phieu" | "da_ky";
export type VoteResult = "dong_y" | "khong_dong_y" | "kien_nghi" | "chua_bo_phieu";

export interface MinhChung {
  id: string; loai: string; ten: string; mo_ta: string; uploaded: boolean;
}
export interface HoSoThamGia {
  id: string;
  campaignId: string;
  ten: string;
  position: string;
  donVi: string;
  type: "ca_nhan" | "tap_the";
  danhHieuDeNghi: string;
  namCongTac: number;
  tomTatThanhTich: string;
  minhChung: MinhChung[];
  status: HoSoStatus;
  nopLuc: string;
  score?: number;
  rank?: number;
  thamDinhNote?: string;
  voteCount?: { dongY: number; khongDongY: number; kienNghi: number; tong: number };
  myVote?: VoteResult;
  quyetDinhSo?: string;
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
const DANH_HIEU_OPTIONS = [
  "Chiến sĩ thi đua cơ sở (CSTĐCS)",
  "Chiến sĩ thi đua cấp Tỉnh (CSTĐT)",
  "Lao động tiên tiến cấp cơ sở (LĐTTCS)",
  "Lao động tiên tiến cấp Tỉnh (LĐTTT)",
  "Bằng khen UBND Tỉnh (BKCT)",
  "Bằng khen Chủ tịch UBND Tỉnh",
  "Bằng khen Bộ chủ quản",
  "Cờ thi đua Chính phủ",
  "Huân chương Lao động hạng Ba",
];

const MINH_CHUNG_TEMPLATE: MinhChung[] = [
  { id:"mc1", loai:"Bắt buộc", ten:"Lý lịch trích ngang (mẫu 06-BNV)",      mo_ta:"Theo TT 15/2025/TT-BNV Phụ lục 3",  uploaded:false },
  { id:"mc2", loai:"Bắt buộc", ten:"Bảng chấm điểm thi đua 3 năm gần nhất", mo_ta:"Có xác nhận của đơn vị",              uploaded:false },
  { id:"mc3", loai:"Bắt buộc", ten:"Nhận xét đánh giá của lãnh đạo đơn vị",  mo_ta:"Ký và đóng dấu đơn vị",             uploaded:false },
  { id:"mc4", loai:"Tùy chọn", ten:"Sáng kiến / Đề tài NCKH được công nhận", mo_ta:"Bản sao có chứng thực",              uploaded:false },
  { id:"mc5", loai:"Tùy chọn", ten:"Quyết định khen thưởng các năm trước",   mo_ta:"Bản sao có chứng thực",              uploaded:false },
];

function StepDot({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className="size-7 rounded-full flex items-center justify-center text-[13px] transition-all"
              style={{
                background: i < current ? "#16a34a" : i === current ? "#1C5FBE" : "#eef2f8",
                color: i <= current ? "white" : "#635647",
                fontFamily: "var(--font-sans)", fontWeight: 700,
                boxShadow: i === current ? "0 0 0 3px #1C5FBE30" : "none",
              }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className="text-[13px] text-center" style={{
              fontFamily: "var(--font-sans)", fontWeight: i === current ? 700 : 400,
              color: i === current ? "#1C5FBE" : "#635647", maxWidth: 72,
            }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px mt-[-12px]"
              style={{ background: i < current ? "#16a34a" : "#e5e7eb", minWidth: 8 }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   1. ĐĂNG KÝ THAM GIA MODAL
════════════════════════════════════════════════════════════════ */
interface DangKyModalProps {
  campaignName: string;
  campaignId: string;
  user: LoginUser;
  onClose: () => void;
  onSubmit: (hs: HoSoThamGia) => void;
}

export function DangKyModal({ campaignName, campaignId, user, onClose, onSubmit }: DangKyModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    ten: "Nguyễn Văn An",
    position: "Chuyên viên",
    donVi: "Sở GDĐT Đồng Nai",
    type: "ca_nhan" as "ca_nhan" | "tap_the",
    danhHieuDeNghi: DANH_HIEU_OPTIONS[0],
    namCongTac: 8,
    tomTatThanhTich: "",
  });
  const [loading, setLoading] = useState(false);
  const STEPS = ["Thông tin cơ bản", "Danh hiệu đề nghị", "Xác nhận"];

  const handleFinal = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const hs: HoSoThamGia = {
      id: `HS-${Date.now()}`,
      campaignId,
      ten: form.ten, position: form.position,
      donVi: form.donVi, type: form.type,
      danhHieuDeNghi: form.danhHieuDeNghi,
      namCongTac: form.namCongTac,
      tomTatThanhTich: form.tomTatThanhTich,
      minhChung: MINH_CHUNG_TEMPLATE.map(m => ({ ...m })),
      status: "dang_soan",
      nopLuc: "",
    };
    setLoading(false);
    onSubmit(hs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(11,20,38,0.6)" }}>
      <div className="w-full max-w-lg rounded-[14px] bg-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "#e2e8f0", background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="size-9 rounded-[8px] flex items-center justify-center" style={{ background: "rgba(200,150,12,0.25)" }}>
            <Flag className="size-5 text-[#8a6400]" />
          </div>
          <div className="flex-1">
            <h2 className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Đăng ký tham gia Phong trào
            </h2>
            <p className="text-[13px] text-white/50 truncate" style={{ fontFamily: "var(--font-sans)" }}>{campaignName}</p>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-white/10">
            <X className="size-4 text-white/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <StepDot steps={STEPS} current={step} />

          {step === 0 && (
            <div className="space-y-4">
              <p className="text-[13px] text-[#635647] mb-4" style={{ fontFamily: "var(--font-sans)" }}>
                Điền thông tin cá nhân/tập thể đăng ký. Căn cứ NĐ 152/2025/NĐ-CP Điều 6.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {([
                  ["ten", "Họ tên / Tên tập thể *", "text"],
                  ["position", "Chức vụ", "text"],
                  ["donVi", "Đơn vị công tác *", "text"],
                  ["namCongTac", "Số năm công tác", "number"],
                ] as const).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-[13px] uppercase tracking-wide text-[#5a5040] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{label}</label>
                    <input
                      value={String(form[field as keyof typeof form])}
                      onChange={e => setForm(p => ({ ...p, [field]: field === "namCongTac" ? +e.target.value : e.target.value }))}
                      className="w-full px-3 border border-[#d1d5db] rounded-[8px] text-[13px] outline-none focus:border-[#1C5FBE] transition-colors"
                      style={{ height: 40, fontFamily: "var(--font-sans)" }} />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-[13px] uppercase tracking-wide text-[#5a5040] mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Đối tượng *</label>
                <div className="flex gap-3">
                  {(["ca_nhan", "tap_the"] as const).map(t => (
                    <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                      className="flex-1 flex items-center gap-2 px-4 py-3 rounded-[8px] border transition-all"
                      style={{ borderColor: form.type === t ? "#1C5FBE" : "#e2e8f0", background: form.type === t ? "#f0f4ff" : "white" }}>
                      {form.type === t
                        ? <CheckCircle2 className="size-4 text-[#1C5FBE]" />
                        : <div className="size-4 rounded-full border-2 border-[#d1d5db]" />}
                      <span className="text-[13px]" style={{ color: form.type === t ? "#1C5FBE" : "#0b1426", fontFamily: "var(--font-sans)", fontWeight: form.type === t ? 700 : 400 }}>
                        {t === "ca_nhan" ? "Cá nhân" : "Tập thể"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 rounded-[8px] flex items-start gap-2" style={{ background: "#f0f4ff", border: "1px solid #bfdbfe" }}>
                <Sparkles className="size-4 text-[#1C5FBE] shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#1a4fa0]" style={{ fontFamily: "var(--font-sans)" }}>
                  AI Tố Nga sẽ kiểm tra điều kiện sau khi đăng ký. Vui lòng chọn đúng danh hiệu phù hợp với thành tích thực tế.
                </p>
              </div>
              <div>
                <label className="block text-[13px] uppercase tracking-wide text-[#5a5040] mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  Danh hiệu đề nghị *
                </label>
                <div className="space-y-2">
                  {DANH_HIEU_OPTIONS.map(d => (
                    <button key={d} onClick={() => setForm(p => ({ ...p, danhHieuDeNghi: d }))}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-[8px] border text-left transition-all"
                      style={{ borderColor: form.danhHieuDeNghi === d ? "#1C5FBE" : "#e2e8f0", background: form.danhHieuDeNghi === d ? "#f0f4ff" : "white" }}>
                      {form.danhHieuDeNghi === d
                        ? <CheckCircle2 className="size-4 text-[#1C5FBE] shrink-0" />
                        : <div className="size-4 rounded-full border-2 border-[#d1d5db] shrink-0" />}
                      <span className="text-[13px]" style={{ color: form.danhHieuDeNghi === d ? "#1C5FBE" : "#0b1426", fontFamily: "var(--font-sans)", fontWeight: form.danhHieuDeNghi === d ? 600 : 400 }}>
                        {d}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13px] uppercase tracking-wide text-[#5a5040] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  Tóm tắt thành tích nổi bật (tối đa 300 chữ)
                </label>
                <textarea value={form.tomTatThanhTich}
                  onChange={e => setForm(p => ({ ...p, tomTatThanhTich: e.target.value }))}
                  rows={4}
                  placeholder="Mô tả ngắn gọn các thành tích nổi bật trong kỳ xét…"
                  className="w-full px-3 py-2 border border-[#d1d5db] rounded-[8px] text-[13px] resize-none outline-none focus:border-[#1C5FBE]"
                  style={{ fontFamily: "var(--font-sans)" }} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-[10px] border p-4 space-y-3" style={{ borderColor: "#e2e8f0" }}>
                {[
                  ["Họ tên", form.ten], ["Chức vụ", form.position],
                  ["Đơn vị", form.donVi], ["Năm công tác", `${form.namCongTac} năm`],
                  ["Loại đối tượng", form.type === "ca_nhan" ? "Cá nhân" : "Tập thể"],
                  ["Danh hiệu đề nghị", form.danhHieuDeNghi],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start gap-3">
                    <span className="text-[13px] text-[#635647] w-32 shrink-0" style={{ fontFamily: "var(--font-sans)" }}>{k}</span>
                    <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-[8px] border" style={{ background: "#fef9ec", borderColor: "#fde68a" }}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 text-[#b45309] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#92400e]" style={{ fontFamily: "var(--font-sans)" }}>
                    Sau khi đăng ký, bạn sẽ cần <strong>nộp đầy đủ hồ sơ minh chứng</strong> trước hạn quy định.
                    Hồ sơ thiếu tài liệu sẽ bị trả lại.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: "#e2e8f0" }}>
          <button onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border text-[13px] hover:bg-[#f4f7fb] transition-colors"
            style={{ borderColor: "#e2e8f0", color: "#5a5040", fontFamily: "var(--font-sans)" }}>
            <ChevronLeft className="size-4" />{step === 0 ? "Hủy" : "Quay lại"}
          </button>
          {step < 2 ? (
            <button onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && (!form.ten || !form.donVi)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-[8px] text-[13px] text-white transition-all disabled:opacity-40"
              style={{ background: "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Tiếp theo <ChevronRight className="size-4" />
            </button>
          ) : (
            <button onClick={handleFinal} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-[8px] text-[13px] text-white transition-all"
              style={{ background: "#166534", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              {loading ? "Đang xử lý…" : "Xác nhận đăng ký"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   2. NỘP HỒ SƠ MODAL
════════════════════════════════════════════════════════════════ */
interface NopHoSoModalProps {
  hoSo: HoSoThamGia;
  deadline: string;
  onClose: () => void;
  onSubmit: (hs: HoSoThamGia) => void;
}

export function NopHoSoModal({ hoSo, deadline, onClose, onSubmit }: NopHoSoModalProps) {
  const [step, setStep] = useState(0);
  const [minhChung, setMinhChung] = useState<MinhChung[]>(hoSo.minhChung);
  const [loading, setLoading] = useState(false);
  const [aiChecking, setAiChecking] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const STEPS = ["Kiểm tra thông tin", "Tài liệu đính kèm", "Kiểm tra AI", "Nộp hồ sơ"];

  const allRequired = minhChung.filter(m => m.loai === "Bắt buộc").every(m => m.uploaded);

  const toggleUpload = (id: string) =>
    setMinhChung(prev => prev.map(m => m.id === id ? { ...m, uploaded: !m.uploaded } : m));

  const runAiCheck = async () => {
    setAiChecking(true);
    await new Promise(r => setTimeout(r, 2000));
    setAiScore(82 + Math.floor(Math.random() * 15));
    setAiChecking(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    onSubmit({ ...hoSo, minhChung, status: "da_nop", nopLuc: "2026-04-24" });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(11,20,38,0.6)" }}>
      <div className="w-full max-w-2xl rounded-[14px] bg-white shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "#e2e8f0", background: "linear-gradient(135deg,#0b1426,#1752a8)" }}>
          <div className="size-9 rounded-[8px] flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <Send className="size-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Nộp Hồ sơ đề nghị khen thưởng
            </h2>
            <p className="text-[13px] text-white/50" style={{ fontFamily: "var(--font-sans)" }}>
              {hoSo.ten} · {hoSo.danhHieuDeNghi} · Hạn: {deadline}
            </p>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-white/10">
            <X className="size-4 text-white/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <StepDot steps={STEPS} current={step} />

          {/* Step 0: Xem lại thông tin */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="rounded-[10px] border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
                  <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                    Thông tin cơ bản hồ sơ
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-y-3">
                  {[
                    ["Họ tên", hoSo.ten],
                    ["Chức vụ", hoSo.position],
                    ["Đơn vị", hoSo.donVi],
                    ["Năm công tác", `${hoSo.namCongTac} năm`],
                    ["Đối tượng", hoSo.type === "ca_nhan" ? "Cá nhân" : "Tập thể"],
                    ["Danh hiệu đề nghị", hoSo.danhHieuDeNghi],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[13px] uppercase tracking-wider text-[#635647] mb-0.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{k}</div>
                      <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {hoSo.tomTatThanhTich && (
                <div className="rounded-[10px] border p-4" style={{ borderColor: "#e2e8f0" }}>
                  <div className="text-[13px] uppercase tracking-wider text-[#635647] mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Tóm tắt thành tích</div>
                  <p className="text-[13px] text-[#0b1426] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>{hoSo.tomTatThanhTich}</p>
                </div>
              )}
              <div className="p-3 rounded-[8px] border flex items-start gap-2" style={{ background: "#f0f4ff", borderColor: "#bfdbfe" }}>
                <BookOpen className="size-4 text-[#1C5FBE] shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#1a4fa0]" style={{ fontFamily: "var(--font-sans)" }}>
                  Căn cứ pháp lý: <strong>Điều 22–24 Luật TĐKT 2022</strong>, <strong>NĐ 152/2025/NĐ-CP Điều 10–12</strong>, 
                  mẫu biểu theo <strong>TT 15/2025/TT-BNV</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Tài liệu đính kèm */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  Danh sách tài liệu theo TT 15/2025/TT-BNV
                </span>
                <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                  {minhChung.filter(m => m.uploaded).length}/{minhChung.length} đã tải lên
                </span>
              </div>
              {minhChung.map(mc => (
                <div key={mc.id} className="flex items-start gap-3 p-4 rounded-[10px] border transition-all"
                  style={{ borderColor: mc.uploaded ? "#86efac" : mc.loai === "Bắt buộc" ? "#fca5a5" : "#e2e8f0", background: mc.uploaded ? "#f0fdf4" : "white" }}>
                  <div className="size-9 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{ background: mc.uploaded ? "#dcfce7" : mc.loai === "Bắt buộc" ? "#fee2e2" : "#eef2f8" }}>
                    {mc.uploaded
                      ? <CheckCircle2 className="size-5 text-[#166534]" />
                      : <FileText className="size-5" style={{ color: mc.loai === "Bắt buộc" ? "#c8102e" : "#635647" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{mc.ten}</span>
                      <span className="text-[13px] px-1.5 py-0.5 rounded" style={{
                        background: mc.loai === "Bắt buộc" ? "#fee2e2" : "#eef2f8",
                        color: mc.loai === "Bắt buộc" ? "#c8102e" : "#5a5040",
                        fontFamily: "var(--font-sans)", fontWeight: 700,
                      }}>{mc.loai}</span>
                    </div>
                    <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{mc.mo_ta}</p>
                  </div>
                  <button onClick={() => toggleUpload(mc.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] border transition-all shrink-0"
                    style={{
                      background: mc.uploaded ? "white" : "#1C5FBE",
                      borderColor: mc.uploaded ? "#86efac" : "#1C5FBE",
                      color: mc.uploaded ? "#166534" : "white",
                      fontFamily: "var(--font-sans)", fontWeight: 600,
                    }}>
                    {mc.uploaded ? <><CheckCheck className="size-3.5" />Đã tải</> : <><Upload className="size-3.5" />Tải lên</>}
                  </button>
                </div>
              ))}
              {!allRequired && (
                <div className="p-3 rounded-[8px] border flex items-center gap-2" style={{ background: "#fff5f5", borderColor: "#fca5a5" }}>
                  <AlertCircle className="size-4 text-[#c8102e] shrink-0" />
                  <p className="text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)" }}>
                    Vui lòng tải lên đầy đủ tài liệu <strong>Bắt buộc</strong> trước khi tiếp tục.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Kiểm tra AI */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-[10px] border overflow-hidden" style={{ borderColor: "#e2e8f0", background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
                <div className="p-6 text-center">
                  <Sparkles className="size-10 text-[#8a6400] mx-auto mb-3" />
                  <h3 className="text-[14px] text-white mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                    AI Tố Nga kiểm tra điều kiện
                  </h3>
                  <p className="text-[13px] text-white/60" style={{ fontFamily: "var(--font-sans)" }}>
                    Đối chiếu với Luật TĐKT 2022, NĐ 152/2025/NĐ-CP, TT 15/2025/TT-BNV
                  </p>
                </div>
              </div>

              {!aiScore && !aiChecking && (
                <button onClick={runAiCheck}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] text-[14px] text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  <Sparkles className="size-5" />Chạy kiểm tra AI ngay
                </button>
              )}

              {aiChecking && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2 className="size-8 text-[#7c3aed] animate-spin" />
                  <p className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>Đang phân tích hồ sơ…</p>
                </div>
              )}

              {aiScore !== null && !aiChecking && (
                <div className="space-y-3">
                  <div className="rounded-[10px] p-4 flex items-center gap-4"
                    style={{ background: aiScore >= 85 ? "#dcfce7" : aiScore >= 70 ? "#fef9ec" : "#fff5f5", border: `1px solid ${aiScore >= 85 ? "#86efac" : aiScore >= 70 ? "#fde68a" : "#fca5a5"}` }}>
                    <div className="text-[48px] leading-none" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: aiScore >= 85 ? "#166534" : aiScore >= 70 ? "#b45309" : "#c8102e" }}>
                      {aiScore}
                    </div>
                    <div>
                      <div className="text-[14px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: "#0b1426" }}>
                        {aiScore >= 85 ? "Hồ sơ đủ điều kiện ✅" : aiScore >= 70 ? "Đủ điều kiện, có lưu ý ⚠️" : "Cần bổ sung hồ sơ ❌"}
                      </div>
                      <div className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>Điểm AI · Tài liệu: {minhChung.filter(m => m.uploaded).length}/{minhChung.length}</div>
                    </div>
                  </div>
                  {[
                    { ok: hoSo.namCongTac >= 5, label: "Thâm niên công tác đủ (≥ 5 năm)" },
                    { ok: true, label: "Không có vi phạm kỷ luật trong kỳ xét" },
                    { ok: minhChung.filter(m => m.loai === "Bắt buộc").every(m => m.uploaded), label: "Tài liệu bắt buộc đầy đủ" },
                    { ok: !!hoSo.tomTatThanhTich, label: "Có mô tả thành tích nổi bật" },
                    { ok: aiScore >= 75, label: "Điểm AI đạt ngưỡng tối thiểu (≥ 75)" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-[8px]" style={{ background: c.ok ? "#f0fdf4" : "#fff5f5" }}>
                      {c.ok ? <CheckCircle2 className="size-4 text-[#166534] shrink-0" /> : <XCircle className="size-4 text-[#c8102e] shrink-0" />}
                      <span className="text-[13px]" style={{ color: c.ok ? "#166534" : "#c8102e", fontFamily: "var(--font-sans)" }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Xác nhận nộp */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-[10px] p-5 text-center" style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "2px solid #86efac" }}>
                <CheckCircle2 className="size-12 text-[#166534] mx-auto mb-3" />
                <h3 className="text-[18px] text-[#166534] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  Sẵn sàng nộp hồ sơ
                </h3>
                <p className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>
                  {minhChung.filter(m => m.uploaded).length}/{minhChung.length} tài liệu đã chuẩn bị
                  {aiScore ? ` · Điểm AI: ${aiScore}/100` : ""}
                </p>
              </div>
              <div className="p-3 rounded-[8px] border" style={{ background: "#fef9ec", borderColor: "#fde68a" }}>
                <p className="text-[13px] text-[#92400e]" style={{ fontFamily: "var(--font-sans)" }}>
                  <strong>Lưu ý:</strong> Sau khi nộp, hồ sơ sẽ được chuyển đến Hội đồng cơ sở thẩm định.
                  Bạn sẽ không thể chỉnh sửa. Hồ sơ bị trả lại sẽ được thông báo qua hệ thống.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: "#e2e8f0" }}>
          <button onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border text-[13px] hover:bg-[#f4f7fb]"
            style={{ borderColor: "#e2e8f0", color: "#5a5040", fontFamily: "var(--font-sans)" }}>
            <ChevronLeft className="size-4" />{step === 0 ? "Hủy" : "Quay lại"}
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !allRequired}
              className="flex items-center gap-1.5 px-5 py-2 rounded-[8px] text-[13px] text-white disabled:opacity-40"
              style={{ background: "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Tiếp theo <ChevronRight className="size-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-[8px] text-[13px] text-white"
              style={{ background: "#166534", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {loading ? "Đang nộp…" : "Nộp hồ sơ chính thức"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   3. THẨM ĐỊNH CƠ SỞ PANEL (manager / council)
════════════════════════════════════════════════════════════════ */
interface ThamDinhPanelProps {
  hoSoList: HoSoThamGia[];
  user: LoginUser;
  onApprove: (id: string, note: string) => void;
  onReturn: (id: string, reason: string) => void;
}

export function ThamDinhPanel({ hoSoList, user, onApprove, onReturn }: ThamDinhPanelProps) {
  const [expandId, setExpandId] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [reason, setReason] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState<{ id: string; action: "approve" | "return" } | null>(null);

  const pending = hoSoList.filter(h => h.status === "da_nop");
  const reviewed = hoSoList.filter(h => h.status === "da_duyet" || h.status === "tra_lai");

  const statusCfg: Record<string, { label: string; color: string; bg: string; border: string }> = {
    da_nop:  { label: "Chờ thẩm định", color: "#1a4fa0", bg: "#dbeafe", border: "#93c5fd" },
    da_duyet:{ label: "Đã duyệt",       color: "#166534", bg: "#dcfce7", border: "#86efac" },
    tra_lai: { label: "Trả lại",         color: "#9f1239", bg: "#fee2e2", border: "#fca5a5" },
    dang_soan:{ label: "Đang soạn",     color: "#635647", bg: "#eef2f8", border: "#d9d1bd" },
  };

  const renderCard = (h: HoSoThamGia, showActions: boolean) => {
    const sc = statusCfg[h.status] ?? statusCfg.dang_soan;
    const isOpen = expandId === h.id;

    return (
      <div key={h.id} className="rounded-[10px] border overflow-hidden transition-all"
        style={{ borderColor: isOpen ? "#1C5FBE" : "#e2e8f0" }}>
        <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#f8fafc] transition-colors"
          onClick={() => setExpandId(isOpen ? null : h.id)}>
          <div className="size-10 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: "linear-gradient(135deg,#1C5FBE,#0b1426)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            {h.ten.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{h.ten}</span>
              <span className="text-[13px] px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontFamily: "var(--font-sans)", fontWeight: 600 }}>{sc.label}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              <span>{h.position}</span><span>·</span><span>{h.donVi}</span>
              <span>·</span><span className="text-[#1C5FBE]">{h.danhHieuDeNghi}</span>
            </div>
          </div>
          {h.nopLuc && <span className="text-[13px] text-[#6b5e47] shrink-0" style={{ fontFamily: "var(--font-sans)" }}>Nộp: {h.nopLuc}</span>}
        </button>

        {isOpen && (
          <div className="px-5 pb-5 border-t" style={{ borderColor: "#eef2f8" }}>
            {/* Documents */}
            <div className="mt-4 mb-4">
              <div className="text-[13px] text-[#0b1426] mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                Tài liệu đính kèm
              </div>
              <div className="grid grid-cols-2 gap-2">
                {h.minhChung.map(mc => (
                  <div key={mc.id} className="flex items-center gap-2 px-3 py-2 rounded-[6px]"
                    style={{ background: mc.uploaded ? "#f0fdf4" : "#fff5f5", border: `1px solid ${mc.uploaded ? "#86efac" : "#fca5a5"}` }}>
                    {mc.uploaded ? <CheckCircle2 className="size-3.5 text-[#166534] shrink-0" /> : <AlertCircle className="size-3.5 text-[#c8102e] shrink-0" />}
                    <span className="text-[13px] truncate" style={{ color: mc.uploaded ? "#166534" : "#c8102e", fontFamily: "var(--font-sans)" }}>{mc.ten.split("(")[0].trim()}</span>
                    {mc.uploaded && <Eye className="size-3 text-[#1C5FBE] ml-auto shrink-0 cursor-pointer" />}
                  </div>
                ))}
              </div>
            </div>

            {h.tomTatThanhTich && (
              <div className="mb-4 p-3 rounded-[8px]" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="text-[13px] uppercase tracking-wider text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Tóm tắt thành tích</div>
                <p className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{h.tomTatThanhTich}</p>
              </div>
            )}

            {showActions && h.status === "da_nop" && (
              <>
                {confirming?.id === h.id ? (
                  <div className="space-y-3">
                    {confirming.action === "approve" && (
                      <div>
                        <label className="block text-[13px] uppercase tracking-wide text-[#5a5040] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Nhận xét thẩm định (tùy chọn)</label>
                        <textarea value={note[h.id] ?? ""} onChange={e => setNote(p => ({ ...p, [h.id]: e.target.value }))}
                          rows={2} placeholder="Đủ điều kiện, hồ sơ đầy đủ…"
                          className="w-full px-3 py-2 border border-[#d1d5db] rounded-[8px] text-[13px] resize-none outline-none focus:border-[#166534]"
                          style={{ fontFamily: "var(--font-sans)" }} />
                      </div>
                    )}
                    {confirming.action === "return" && (
                      <div>
                        <label className="block text-[13px] uppercase tracking-wide text-[#5a5040] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Lý do trả lại *</label>
                        <textarea value={reason[h.id] ?? ""} onChange={e => setReason(p => ({ ...p, [h.id]: e.target.value }))}
                          rows={2} placeholder="Thiếu minh chứng X, cần bổ sung Y…"
                          className="w-full px-3 py-2 border border-[#d1d5db] rounded-[8px] text-[13px] resize-none outline-none focus:border-[#c8102e]"
                          style={{ fontFamily: "var(--font-sans)" }} />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => setConfirming(null)} className="flex-1 py-2 rounded-[8px] border text-[13px]" style={{ borderColor: "#e2e8f0", color: "#5a5040", fontFamily: "var(--font-sans)" }}>Hủy</button>
                      <button
                        onClick={() => {
                          if (confirming.action === "approve") onApprove(h.id, note[h.id] ?? "");
                          else onReturn(h.id, reason[h.id] ?? "");
                          setConfirming(null);
                        }}
                        disabled={confirming.action === "return" && !reason[h.id]}
                        className="flex-1 py-2 rounded-[8px] text-[13px] text-white disabled:opacity-40"
                        style={{ background: confirming.action === "approve" ? "#166534" : "#c8102e", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                        {confirming.action === "approve" ? "✅ Xác nhận duyệt" : "↩ Xác nhận trả lại"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => setConfirming({ id: h.id, action: "return" })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] border text-[13px] hover:bg-[#fff5f5] transition-colors"
                      style={{ borderColor: "#fca5a5", color: "#c8102e", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                      <XCircle className="size-4" />Trả lại hồ sơ
                    </button>
                    <button onClick={() => setConfirming({ id: h.id, action: "approve" })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] text-white transition-colors hover:opacity-90"
                      style={{ background: "#166534", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                      <CheckCircle2 className="size-4" />Duyệt hồ sơ
                    </button>
                  </div>
                )}
              </>
            )}

            {(h.status === "da_duyet" || h.status === "tra_lai") && h.thamDinhNote && (
              <div className="mt-3 p-3 rounded-[8px]" style={{ background: h.status === "da_duyet" ? "#f0fdf4" : "#fff5f5", border: `1px solid ${h.status === "da_duyet" ? "#86efac" : "#fca5a5"}` }}>
                <div className="flex items-center gap-1.5 mb-1 text-[13px]" style={{ color: h.status === "da_duyet" ? "#166534" : "#c8102e", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  <MessageSquare className="size-3.5" />
                  {h.status === "da_duyet" ? "Nhận xét thẩm định" : "Lý do trả lại"}
                </div>
                <p className="text-[13px]" style={{ color: h.status === "da_duyet" ? "#166534" : "#c8102e", fontFamily: "var(--font-sans)" }}>{h.thamDinhNote}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-[10px]" style={{ background: "#f0f4ff", border: "1px solid #bfdbfe" }}>
        <Shield className="size-5 text-[#1C5FBE] shrink-0" />
        <p className="text-[13px] text-[#1a4fa0]" style={{ fontFamily: "var(--font-sans)" }}>
          <strong>Thẩm định cấp cơ sở</strong> theo Khoản 2 Điều 55 Luật TĐKT 2022. Thời hạn xử lý: <strong>7 ngày</strong> kể từ ngày nhận hồ sơ.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tổng hồ sơ", v: hoSoList.length, c: "#0b1426", bg: "#f4f7fb" },
          { label: "Chờ thẩm định", v: pending.length, c: "#1a4fa0", bg: "#dbeafe" },
          { label: "Đã duyệt", v: hoSoList.filter(h => h.status === "da_duyet").length, c: "#166534", bg: "#dcfce7" },
          { label: "Trả lại", v: hoSoList.filter(h => h.status === "tra_lai").length, c: "#9f1239", bg: "#fee2e2" },
        ].map(s => (
          <div key={s.label} className="rounded-[8px] p-3 text-center" style={{ background: s.bg }}>
            <div className="text-[24px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div className="text-[13px]" style={{ color: s.c, fontFamily: "var(--font-sans)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-4 text-[#1a4fa0]" />
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Chờ thẩm định ({pending.length})</span>
          </div>
          <div className="space-y-2">{pending.map(h => renderCard(h, true))}</div>
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCheck className="size-4 text-[#166534]" />
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Đã xử lý ({reviewed.length})</span>
          </div>
          <div className="space-y-2">{reviewed.map(h => renderCard(h, false))}</div>
        </div>
      )}

      {hoSoList.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3">
          <FileText className="size-12 text-[#d1ccc0]" />
          <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Chưa có hồ sơ nào được nộp.</p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   4. HỘI ĐỒNG BỎ PHIẾU PANEL
════════════════════════════════════════════════════════════════ */
interface HoiDongVotePanelProps {
  hoSoList: HoSoThamGia[];
  user: LoginUser;
  onVote: (hoSoId: string, vote: VoteResult) => void;
}

export function HoiDongVotePanel({ hoSoList, user, onVote }: HoiDongVotePanelProps) {
  const [expandId, setExpandId] = useState<string | null>(null);
  const approved = hoSoList.filter(h => h.status === "da_duyet" || h.status === "bo_phieu");

  const totalMembers = 9; // mock HĐ 9 người

  const voteCfg: Record<VoteResult, { label: string; icon: typeof ThumbsUp; color: string; bg: string }> = {
    dong_y:        { label: "Đồng ý",    icon: ThumbsUp,  color: "#166534", bg: "#dcfce7" },
    khong_dong_y:  { label: "Không đồng ý", icon: ThumbsDown, color: "#c8102e", bg: "#fee2e2" },
    kien_nghi:     { label: "Kiến nghị", icon: MessageSquare, color: "#b45309", bg: "#fef9ec" },
    chua_bo_phieu: { label: "Chưa bỏ phiếu", icon: Clock, color: "#635647", bg: "#eef2f8" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-[10px]" style={{ background: "#faf5ff", border: "1px solid #ddd6fe" }}>
        <Award className="size-5 text-[#7c3aed] shrink-0" />
        <p className="text-[13px] text-[#5b21b6]" style={{ fontFamily: "var(--font-sans)" }}>
          <strong>Phiên bỏ phiếu Hội đồng TĐKT</strong> — Điều 56 Luật TĐKT 2022. Hồ sơ được thông qua khi tỷ lệ đồng ý ≥ <strong>2/3</strong> ({Math.ceil(totalMembers * 2 / 3)}/{totalMembers} phiếu).
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tổng hồ sơ", v: approved.length, c: "#5b21b6", bg: "#faf5ff" },
          { label: "Đã bỏ phiếu", v: approved.filter(h => h.myVote && h.myVote !== "chua_bo_phieu").length, c: "#166534", bg: "#dcfce7" },
          { label: "Chưa bỏ phiếu", v: approved.filter(h => !h.myVote || h.myVote === "chua_bo_phieu").length, c: "#b45309", bg: "#fef9ec" },
        ].map(s => (
          <div key={s.label} className="rounded-[8px] p-3 text-center" style={{ background: s.bg }}>
            <div className="text-[24px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div className="text-[13px]" style={{ color: s.c, fontFamily: "var(--font-sans)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {approved.map(h => {
          const isOpen = expandId === h.id;
          const myVote = h.myVote ?? "chua_bo_phieu";
          const vc = voteCfg[myVote];
          const VoteIcon = vc.icon;
          const dongY = h.voteCount?.dongY ?? 0;
          const tong = h.voteCount?.tong ?? totalMembers;
          const passThreshold = Math.ceil(tong * 2 / 3);
          const passed = dongY >= passThreshold;

          return (
            <div key={h.id} className="rounded-[10px] border overflow-hidden"
              style={{ borderColor: isOpen ? "#7c3aed" : "#e2e8f0" }}>
              <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#f8fafc]"
                onClick={() => setExpandId(isOpen ? null : h.id)}>
                <div className="size-10 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  {h.ten.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-[#0b1426] mb-0.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{h.ten}</div>
                  <div className="text-[13px] text-[#7c3aed]" style={{ fontFamily: "var(--font-sans)" }}>{h.danhHieuDeNghi}</div>
                </div>

                {/* Vote progress */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{dongY}/{tong} đồng ý</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-20 h-1.5 rounded-full overflow-hidden bg-[#eef2f8]">
                        <div className="h-full rounded-full" style={{ width: `${(dongY / tong) * 100}%`, background: passed ? "#166534" : "#b45309" }} />
                      </div>
                      <span className="text-[13px]" style={{ color: passed ? "#166534" : "#b45309", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                        {passed ? "✓ Đạt" : `Cần ${passThreshold - dongY}`}
                      </span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[13px]"
                    style={{ background: vc.bg, color: vc.color, fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                    <VoteIcon className="size-3" />{vc.label}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: "#eef2f8" }}>
                  <div className="mt-4 mb-5 grid grid-cols-3 gap-3">
                    {[
                      { v: dongY, label: "Đồng ý", color: "#166534", bg: "#dcfce7" },
                      { v: h.voteCount?.khongDongY ?? 0, label: "Không đồng ý", color: "#c8102e", bg: "#fee2e2" },
                      { v: h.voteCount?.kienNghi ?? 0, label: "Kiến nghị", color: "#b45309", bg: "#fef9ec" },
                    ].map(s => (
                      <div key={s.label} className="rounded-[8px] p-3 text-center" style={{ background: s.bg }}>
                        <div className="text-[24px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: s.color }}>{s.v}</div>
                        <div className="text-[13px]" style={{ color: s.color, fontFamily: "var(--font-sans)" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[13px] text-[#0b1426] mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                    Phiếu của bạn ({user.name}):
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["dong_y", "khong_dong_y", "kien_nghi"] as VoteResult[]).map(v => {
                      const cfg = voteCfg[v];
                      const Icon = cfg.icon;
                      const isSelected = myVote === v;
                      return (
                        <button key={v} onClick={() => onVote(h.id, v)}
                          className="flex items-center justify-center gap-2 py-3 rounded-[8px] border transition-all"
                          style={{
                            borderColor: isSelected ? cfg.color : "#e2e8f0",
                            background: isSelected ? cfg.bg : "white",
                            boxShadow: isSelected ? `0 0 0 2px ${cfg.color}40` : "none",
                          }}>
                          <Icon className="size-4" style={{ color: cfg.color }} />
                          <span className="text-[13px]" style={{ color: cfg.color, fontFamily: "var(--font-sans)", fontWeight: isSelected ? 700 : 400 }}>
                            {cfg.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {approved.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3">
          <Award className="size-12 text-[#d1ccc0]" />
          <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Chưa có hồ sơ nào được thẩm định để đưa vào phiên bỏ phiếu.
          </p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   5. KÝ DUYỆT & BAN HÀNH QĐ PANEL (leader / admin)
════════════════════════════════════════════════════════════════ */
interface KyDuyetPanelProps {
  hoSoList: HoSoThamGia[];
  campaignName: string;
  user: LoginUser;
  onSign: (quyetDinhSo: string, ids: string[]) => void;
}

export function KyDuyetPanel({ hoSoList, campaignName, user, onSign }: KyDuyetPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [qdSo, setQdSo] = useState(`QĐ-2026-${Math.floor(Math.random() * 900 + 100)}`);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  const passed = hoSoList.filter(h =>
    h.voteCount && h.voteCount.dongY >= Math.ceil(h.voteCount.tong * 2 / 3)
  );

  const toggleAll = () => {
    if (selected.size === passed.length) setSelected(new Set());
    else setSelected(new Set(passed.map(h => h.id)));
  };

  const handleSign = async () => {
    setSigning(true);
    await new Promise(r => setTimeout(r, 2000));
    onSign(qdSo, Array.from(selected));
    setSigning(false);
    setSigned(true);
  };

  if (signed) return (
    <div className="flex flex-col items-center py-16 gap-4">
      <div className="size-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#166534,#14532d)" }}>
        <CheckCheck className="size-10 text-white" />
      </div>
      <h3 className="text-[18px] text-[#166534]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
        Quyết định đã được ký!
      </h3>
      <p className="text-[14px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
        {qdSo} — {selected.size} cá nhân/tập thể được khen thưởng
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-[10px]" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
        <div className="flex items-center gap-3 mb-3">
          <Stamp className="size-6 text-[#8a6400]" />
          <div>
            <h3 className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              Ký số & Ban hành Quyết định khen thưởng
            </h3>
            <p className="text-[13px] text-white/50" style={{ fontFamily: "var(--font-sans)" }}>{campaignName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[13px] uppercase tracking-wide text-white/50 mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Số Quyết định</label>
            <input value={qdSo} onChange={e => setQdSo(e.target.value)}
              className="w-full px-3 rounded-[8px] text-[14px] bg-white/10 border border-white/20 text-white outline-none focus:border-[#8a6400]"
              style={{ height: 40, fontFamily: "var(--font-sans)", fontWeight: 700 }} />
          </div>
          <div className="flex-1">
            <label className="block text-[13px] uppercase tracking-wide text-white/50 mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Người ký</label>
            <div className="px-3 h-10 rounded-[8px] flex items-center text-white text-[13px] bg-white/10 border border-white/20" style={{ fontFamily: "var(--font-sans)" }}>
              {user.name} — {user.role === "lãnh đạo cấp cao" ? "Lãnh đạo phê duyệt" : "Quản trị"}
            </div>
          </div>
        </div>
      </div>

      {/* Select all */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={selected.size === passed.length} onChange={toggleAll}
            className="size-4 rounded cursor-pointer" />
          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            Chọn tất cả hồ sơ đủ điều kiện ({passed.length})
          </span>
        </div>
        <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
          Đã chọn: {selected.size}
        </span>
      </div>

      {/* Hồ sơ list */}
      <div className="space-y-2">
        {passed.map(h => {
          const isSelected = selected.has(h.id);
          const pct = h.voteCount ? Math.round(h.voteCount.dongY / h.voteCount.tong * 100) : 0;
          return (
            <div key={h.id} className="flex items-center gap-4 p-4 rounded-[10px] border transition-all cursor-pointer"
              style={{ borderColor: isSelected ? "#8a6400" : "#e2e8f0", background: isSelected ? "#fdf9ec" : "white" }}
              onClick={() => setSelected(prev => { const s = new Set(prev); isSelected ? s.delete(h.id) : s.add(h.id); return s; })}>
              <input type="checkbox" checked={isSelected} onChange={() => {}} className="size-4 rounded shrink-0 cursor-pointer" />
              <div className="size-10 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ background: "linear-gradient(135deg,#8a6400,#b45309)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                {h.ten.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{h.ten}</div>
                <div className="text-[13px] text-[#8a6400]" style={{ fontFamily: "var(--font-sans)" }}>{h.danhHieuDeNghi}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{pct}% đồng ý</div>
                <div className="text-[13px] text-[#635647]">{h.donVi}</div>
              </div>
              {isSelected && (
                <div className="size-6 rounded-full flex items-center justify-center" style={{ background: "#8a6400" }}>
                  <CheckCheck className="size-3.5 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {passed.length === 0 && (
        <div className="text-center py-10 text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
          Chưa có hồ sơ nào hoàn thành vòng bỏ phiếu.
        </div>
      )}

      {/* Sign button */}
      <button onClick={handleSign} disabled={selected.size === 0 || signing}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-[12px] text-[14px] text-white transition-all disabled:opacity-40"
        style={{ background: selected.size > 0 ? "linear-gradient(135deg,#0b1426,#1C5FBE)" : "#d1d5db", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
        {signing ? <Loader2 className="size-5 animate-spin" /> : <FileSignature className="size-5" />}
        {signing ? "Đang ký số CA…" : `Ký số & Ban hành ${qdSo} (${selected.size} trường hợp)`}
      </button>

      <p className="text-center text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>
        Chữ ký số CA có giá trị pháp lý theo NĐ 130/2018/NĐ-CP và Luật GDĐT 2023
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   6. KẾT QUẢ PANEL
════════════════════════════════════════════════════════════════ */
interface KetQuaPanelProps {
  hoSoList: HoSoThamGia[];
  campaignName: string;
}

export function KetQuaPanel({ hoSoList, campaignName }: KetQuaPanelProps) {
  const awarded = hoSoList.filter(h => h.status === "da_ky");
  const sorted = [...awarded].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const medalColors = ["#8a6400", "#4f5d6e", "#cd7c3b"];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[12px] p-6 text-center"
        style={{ background: "linear-gradient(135deg,#0b1426 0%,#1a2744 50%,#1C5FBE 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <Trophy className="size-12 text-[#8a6400] mx-auto mb-3 relative z-10" />
        <h3 className="text-[18px] text-white relative z-10" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
          Kết quả Khen thưởng
        </h3>
        <p className="text-[13px] text-white/60 relative z-10" style={{ fontFamily: "var(--font-sans)" }}>{campaignName}</p>
        <div className="flex justify-center gap-6 mt-4 relative z-10">
          <div><div className="text-[24px] text-[#8a6400]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{awarded.length}</div>
            <div className="text-[13px] text-white/50">Được khen thưởng</div></div>
          <div><div className="text-[24px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{hoSoList.length}</div>
            <div className="text-[13px] text-white/50">Tổng hồ sơ</div></div>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((h, idx) => (
          <div key={h.id} className="flex items-center gap-4 p-4 rounded-[10px] border"
            style={{ borderColor: idx < 3 ? "#f0dba0" : "#e2e8f0", background: idx < 3 ? "#fdf9ec" : "white" }}>
            <div className="size-10 rounded-full flex items-center justify-center text-white shrink-0 text-[14px]"
              style={{ background: idx < 3 ? `linear-gradient(135deg,${medalColors[idx]},${medalColors[idx]}90)` : "#e5e7eb", fontFamily: "var(--font-sans)", fontWeight: 700, color: idx < 3 ? "white" : "#6b7280" }}>
              {idx + 1}
            </div>
            <div className="flex-1">
              <div className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{h.ten}</div>
              <div className="text-[13px] text-[#8a6400]" style={{ fontFamily: "var(--font-sans)" }}>{h.danhHieuDeNghi}</div>
              <div className="text-[13px] text-[#635647]">{h.donVi}</div>
            </div>
            {h.quyetDinhSo && (
              <code className="text-[13px] px-2 py-1 rounded" style={{ background: "#f0f4ff", color: "#1C5FBE", fontFamily: "JetBrains Mono,monospace" }}>
                {h.quyetDinhSo}
              </code>
            )}
            <CheckCircle2 className="size-5 text-[#166534] shrink-0" />
          </div>
        ))}
        {awarded.length === 0 && (
          <div className="text-center py-12 text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Chưa có quyết định khen thưởng nào được ban hành.
          </div>
        )}
      </div>

      {awarded.length > 0 && (
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] border text-[14px]"
          style={{ borderColor: "#e2e8f0", color: "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
          <Download className="size-5" />Tải xuống Danh sách khen thưởng (.PDF)
        </button>
      )}
    </div>
  );
}
