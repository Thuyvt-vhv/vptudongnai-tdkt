import { useState } from "react";
import {
  Search, Download, Upload, Star, CheckCircle2, AlertCircle,
  X, Filter, BarChart2, Users, Trophy, TrendingDown, Plus,
  ChevronDown, ArrowRight, Award,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type XepLoai = "xuat-sac" | "tot" | "hoan-thanh" | "khong-hoan-thanh";
interface VienChuc {
  id: string;
  ten: string;
  chucVu: string;
  donVi: string;
  nam: number;
  xepLoai: XepLoai;
  diemChi: number;   // điểm chấm
  viPham: boolean;
  ghiChu?: string;
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const VIEN_CHUC_LIST: VienChuc[] = [
  { id: "vc1",  ten: "Lê Thị Thanh Xuân",    chucVu: "Phó Giám đốc",         donVi: "Sở GD&ĐT",         nam: 2025, xepLoai: "xuat-sac",        diemChi: 94, viPham: false },
  { id: "vc2",  ten: "Phạm Hoàng Liêm",       chucVu: "Trưởng phòng",          donVi: "Sở KH&ĐT",         nam: 2025, xepLoai: "xuat-sac",        diemChi: 92, viPham: false },
  { id: "vc3",  ten: "Nguyễn Phú Trọng Khoa", chucVu: "Bác sĩ CKI",           donVi: "BV Đa khoa ĐN",    nam: 2025, xepLoai: "xuat-sac",        diemChi: 91, viPham: false },
  { id: "vc4",  ten: "Trần Thị Mai Hương",    chucVu: "Phó Trưởng ban",        donVi: "Ban Tuyên giáo",   nam: 2025, xepLoai: "tot",             diemChi: 85, viPham: false },
  { id: "vc5",  ten: "Nguyễn Văn Hùng",       chucVu: "Trưởng phòng",          donVi: "VP Tỉnh ủy",       nam: 2025, xepLoai: "tot",             diemChi: 83, viPham: false },
  { id: "vc6",  ten: "Lê Minh Tuấn",          chucVu: "Giám đốc",              donVi: "TT Lưu trữ",       nam: 2025, xepLoai: "tot",             diemChi: 81, viPham: false },
  { id: "vc7",  ten: "Phạm Quốc Bảo",         chucVu: "Trưởng phòng",          donVi: "Sở Tài chính",     nam: 2025, xepLoai: "tot",             diemChi: 80, viPham: false },
  { id: "vc8",  ten: "Lê Hoàng Nam",          chucVu: "Chuyên viên",           donVi: "TT CNTT",          nam: 2025, xepLoai: "hoan-thanh",      diemChi: 73, viPham: false },
  { id: "vc9",  ten: "Hoàng Thị Thu Thảo",    chucVu: "Chuyên viên",           donVi: "Phòng QLĐT",       nam: 2025, xepLoai: "hoan-thanh",      diemChi: 71, viPham: false },
  { id: "vc10", ten: "Võ Thanh Phong",         chucVu: "Phó Chánh Thanh tra",   donVi: "Sở Xây dựng",     nam: 2025, xepLoai: "hoan-thanh",      diemChi: 68, viPham: false, ghiChu: "Cần cải thiện kỹ năng báo cáo" },
  { id: "vc11", ten: "Đinh Xuân Long",         chucVu: "Giám đốc",              donVi: "TT CNTT",          nam: 2025, xepLoai: "xuat-sac",        diemChi: 90, viPham: false },
  { id: "vc12", ten: "Nguyễn Thị Bích Liên",  chucVu: "Trưởng ban",            donVi: "Ban Dân vận",      nam: 2025, xepLoai: "xuat-sac",        diemChi: 93, viPham: false },
  { id: "vc13", ten: "Trần Quang Vinh",        chucVu: "Trưởng phòng",          donVi: "Sở Xây dựng",     nam: 2025, xepLoai: "tot",             diemChi: 82, viPham: false },
  { id: "vc14", ten: "Phan Thị Hồng Nhung",   chucVu: "Chuyên viên chính",     donVi: "Ban Tuyên giáo",   nam: 2025, xepLoai: "xuat-sac",        diemChi: 89, viPham: false },
  { id: "vc15", ten: "Võ Văn Tùng",           chucVu: "Thanh tra viên",        donVi: "Sở Xây dựng",     nam: 2025, xepLoai: "khong-hoan-thanh", diemChi: 41, viPham: true, ghiChu: "Bị xử lý kỷ luật tháng 8/2025" },
];

const XEP_LOAI_MAP: Record<XepLoai, { label: string; color: string; bg: string; short: string }> = {
  "xuat-sac":         { label: "Hoàn thành xuất sắc", short: "Xuất sắc",  color: "#16a34a", bg: "#dcfce7" },
  "tot":              { label: "Hoàn thành tốt",       short: "Tốt",       color: "#1C5FBE", bg: "#f0f4ff" },
  "hoan-thanh":       { label: "Hoàn thành",            short: "Hoàn thành",color: "#d97706", bg: "#fef3c7" },
  "khong-hoan-thanh": { label: "Không hoàn thành",      short: "KHT",       color: "#dc2626", bg: "#fee2e2" },
};

/* ═══════════════════════════════════════════════════════════════
   ADD XEPLOAI DRAWER
═══════════════════════════════════════════════════════════════ */
function inferXepLoai(diem: number, viPham: boolean): XepLoai {
  if (viPham) return "khong-hoan-thanh";
  if (diem >= 90) return "xuat-sac";
  if (diem >= 80) return "tot";
  if (diem >= 60) return "hoan-thanh";
  return "khong-hoan-thanh";
}

interface AddXepLoaiForm {
  vcId: string;         // selected vc id, hoặc "__new__" để nhập thủ công
  tenManual: string;
  chucVuManual: string;
  donViManual: string;
  nam: string; diem: string; viPham: boolean; ghiChu: string;
  overrideXL: boolean; xepLoaiOverride: XepLoai;
}
type AddXepLoaiErrors = Partial<Record<"vcId"|"tenManual"|"chucVuManual"|"donViManual"|"diem", string>>;

function AddXepLoaiDrawer({
  vcList, donViList, onClose, onSave,
}: {
  vcList: VienChuc[];
  donViList: string[];
  onClose: () => void;
  onSave: (vc: VienChuc) => void;
}) {
  // Deduplicate người có thể chọn: unique theo tên+chứcvụ+đơn vị
  const uniquePersons = vcList.filter(
    (v, i, arr) => arr.findIndex(x => x.ten === v.ten && x.donVi === v.donVi) === i
  );

  const [form, setForm] = useState<AddXepLoaiForm>({
    vcId: "", tenManual: "", chucVuManual: "", donViManual: donViList[0] ?? "",
    nam: "2025", diem: "", viPham: false, ghiChu: "",
    overrideXL: false, xepLoaiOverride: "tot",
  });
  const [errors, setErrors] = useState<AddXepLoaiErrors>({});
  const [saved, setSaved]   = useState(false);

  const isNew    = form.vcId === "__new__";
  const selected = uniquePersons.find(v => v.id === form.vcId);

  const diem  = parseFloat(form.diem);
  const valid = !isNaN(diem) && diem >= 0 && diem <= 100;
  const autoXL: XepLoai  = valid ? inferXepLoai(diem, form.viPham) : "hoan-thanh";
  const finalXL: XepLoai = form.overrideXL ? form.xepLoaiOverride : autoXL;
  const xlCfg = XEP_LOAI_MAP[finalXL];

  function setF<K extends keyof AddXepLoaiForm>(k: K, v: AddXepLoaiForm[K]) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  }

  function handleSelectVC(id: string) {
    const vc = uniquePersons.find(v => v.id === id);
    setForm(f => ({
      ...f, vcId: id,
      tenManual: "", chucVuManual: "", donViManual: vc?.donVi ?? donViList[0] ?? "",
    }));
    setErrors({});
  }

  function validate(): boolean {
    const errs: AddXepLoaiErrors = {};
    if (!form.vcId) errs.vcId = "Chọn viên chức";
    if (isNew) {
      if (!form.tenManual.trim())    errs.tenManual    = "Bắt buộc";
      if (!form.chucVuManual.trim()) errs.chucVuManual = "Bắt buộc";
      if (!form.donViManual.trim())  errs.donViManual  = "Bắt buộc";
    }
    if (!valid) errs.diem = "Nhập số 0–100";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const ten    = isNew ? form.tenManual.trim()    : (selected?.ten    ?? "");
    const chucVu = isNew ? form.chucVuManual.trim() : (selected?.chucVu ?? "");
    const donVi  = isNew ? form.donViManual.trim()  : (selected?.donVi  ?? "");
    onSave({
      id: `xl-${Date.now()}`,
      ten, chucVu, donVi,
      nam:     Number(form.nam),
      diemChi: Math.round(diem),
      xepLoai: finalXL,
      viPham:  form.viPham,
      ghiChu:  form.ghiChu.trim() || undefined,
    });
    setSaved(true);
    setTimeout(onClose, 700);
  }

  const fieldStyle = (err?: string): React.CSSProperties => ({
    height: 36, border: `1px solid ${err ? "#f87171" : "#e2e8f0"}`,
    borderRadius: 8, fontSize: 13, fontFamily: "var(--font-sans)",
    background: err ? "#fff5f5" : "white", color: "#0f172a",
    width: "100%", padding: "0 12px", outline: "none",
  });

  return (
    <div className="fixed inset-0 z-[80] flex" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="ml-auto h-full w-[480px] flex flex-col shadow-2xl overflow-hidden" style={{ background: "white" }}>

        {/* Header */}
        <div className="p-5 shrink-0 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="size-9 rounded-[9px] flex items-center justify-center" style={{ background: "rgba(22,163,74,0.25)" }}>
            <Plus className="size-4 text-[#4ade80]" />
          </div>
          <div className="flex-1">
            <h2 className="text-[15px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Thêm kết quả xếp loại</h2>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans)" }}>Nhập kết quả xếp loại chất lượng viên chức</p>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-white/10">
            <X className="size-4 text-white/50" />
          </button>
        </div>

        {/* Live preview badge */}
        {form.diem !== "" && (
          <div className="px-5 py-3 shrink-0 flex items-center gap-3"
            style={{ background: xlCfg.bg, borderBottom: `2px solid ${xlCfg.color}20` }}>
            <Star className="size-4 shrink-0" style={{ color: xlCfg.color }} />
            <div className="flex-1">
              <span className="text-[12px] font-semibold" style={{ color: xlCfg.color, fontFamily: "var(--font-sans)" }}>
                {valid ? `Điểm ${Math.round(diem)} → ` : ""}
              </span>
              <span className="text-[13px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: xlCfg.color, color: "white", fontFamily: "var(--font-sans)" }}>
                {xlCfg.label}
              </span>
              {form.overrideXL && (
                <span className="ml-2 text-[11px]" style={{ color: xlCfg.color, opacity: 0.7 }}>(ghi đè thủ công)</span>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ background: "#f8fafc" }}>

          {/* Chọn viên chức */}
          <div>
            <label className="block mb-1 text-[12px] font-semibold"
              style={{ color: errors.vcId ? "#c8102e" : "#5a6474", fontFamily: "var(--font-sans)" }}>
              Viên chức *
            </label>
            <select
              value={form.vcId}
              onChange={e => handleSelectVC(e.target.value)}
              style={{ ...fieldStyle(errors.vcId), appearance: "auto" as const }}>
              <option value="">— Chọn viên chức…</option>
              {uniquePersons.map(v => (
                <option key={v.id} value={v.id}>{v.ten} · {v.donVi}</option>
              ))}
              <option value="__new__">— Thêm người mới (nhập thủ công)…</option>
            </select>
            {errors.vcId && <p className="mt-0.5 text-[11px]" style={{ color: "#c8102e" }}>{errors.vcId}</p>}
          </div>

          {/* Auto-fill preview khi đã chọn */}
          {selected && (
            <div className="rounded-[10px] border border-[#c4d4f0] p-3 space-y-2" style={{ background: "#f0f6ff" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1C5FBE]"
                style={{ fontFamily: "var(--font-sans)" }}>Thông tin tự động điền</p>
              {[
                ["Chức vụ", selected.chucVu],
                ["Đơn vị",  selected.donVi],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="text-[12px] text-slate-600 w-16 shrink-0" style={{ fontFamily: "var(--font-sans)" }}>{k}</span>
                  <span className="text-[13px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-sans)" }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Nhập thủ công nếu chọn "người mới" */}
          {isNew && (
            <>
              <div>
                <label className="block mb-1 text-[12px] font-semibold"
                  style={{ color: errors.tenManual ? "#c8102e" : "#5a6474", fontFamily: "var(--font-sans)" }}>
                  Họ và tên *
                </label>
                <input value={form.tenManual} onChange={e => setF("tenManual", e.target.value)}
                  placeholder="Nguyễn Văn A" style={fieldStyle(errors.tenManual)} />
                {errors.tenManual && <p className="mt-0.5 text-[11px]" style={{ color: "#c8102e" }}>{errors.tenManual}</p>}
              </div>
              <div>
                <label className="block mb-1 text-[12px] font-semibold"
                  style={{ color: errors.chucVuManual ? "#c8102e" : "#5a6474", fontFamily: "var(--font-sans)" }}>
                  Chức vụ *
                </label>
                <input value={form.chucVuManual} onChange={e => setF("chucVuManual", e.target.value)}
                  placeholder="Chuyên viên" style={fieldStyle(errors.chucVuManual)} />
                {errors.chucVuManual && <p className="mt-0.5 text-[11px]" style={{ color: "#c8102e" }}>{errors.chucVuManual}</p>}
              </div>
              <div>
                <label className="block mb-1 text-[12px] font-semibold"
                  style={{ color: errors.donViManual ? "#c8102e" : "#5a6474", fontFamily: "var(--font-sans)" }}>
                  Đơn vị *
                </label>
                <select value={form.donViManual} onChange={e => setF("donViManual", e.target.value)}
                  style={{ ...fieldStyle(errors.donViManual), appearance: "auto" as const }}>
                  {donViList.map(dv => <option key={dv} value={dv}>{dv}</option>)}
                  <option value="">— Nhập tên đơn vị khác</option>
                </select>
                {form.donViManual === "" && (
                  <input value={form.donViManual} onChange={e => setF("donViManual", e.target.value)}
                    placeholder="Tên đơn vị" style={{ ...fieldStyle(errors.donViManual), marginTop: 6 }} />
                )}
                {errors.donViManual && <p className="mt-0.5 text-[11px]" style={{ color: "#c8102e" }}>{errors.donViManual}</p>}
              </div>
            </>
          )}

          {/* Năm + Điểm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[12px] font-semibold" style={{ color: "#475569", fontFamily: "var(--font-sans)" }}>Năm xếp loại *</label>
              <select value={form.nam} onChange={e => setF("nam", e.target.value)}
                style={{ ...fieldStyle(), appearance: "auto" as const }}>
                {["2026","2025","2024","2023"].map(y => <option key={y} value={y}>Năm {y}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[12px] font-semibold" style={{ color: errors.diem ? "#c8102e" : "#5a6474", fontFamily: "var(--font-sans)" }}>Điểm chấm (0–100) *</label>
              <input value={form.diem} onChange={e => setF("diem", e.target.value)}
                placeholder="85" type="number" min="0" max="100"
                style={fieldStyle(errors.diem)} />
              {errors.diem && <p className="mt-0.5 text-[11px]" style={{ color: "#c8102e" }}>{errors.diem}</p>}
            </div>
          </div>

          {/* Vi phạm kỷ luật */}
          <div className="flex items-center justify-between p-3 rounded-[10px] border border-[#e2e8f0]" style={{ background: "white" }}>
            <div>
              <p className="text-[13px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-sans)" }}>Vi phạm kỷ luật</p>
              <p className="text-[11.5px] text-[#94a3b8]" style={{ fontFamily: "var(--font-sans)" }}>Nếu có → tự động xếp loại Không hoàn thành</p>
            </div>
            <button onClick={() => setF("viPham", !form.viPham)}
              className="w-11 h-6 rounded-full transition-colors relative"
              style={{ background: form.viPham ? "#dc2626" : "#e2e8f0" }}>
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                style={{ left: form.viPham ? "calc(100% - 22px)" : 2 }} />
            </button>
          </div>

          {/* Ghi đè xếp loại thủ công */}
          <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden" style={{ background: "white" }}>
            <button
              onClick={() => setF("overrideXL", !form.overrideXL)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left"
              style={{ background: "white" }}>
              <span className="text-[13px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-sans)" }}>Ghi đè xếp loại thủ công</span>
              <ChevronDown className="size-4 text-[#94a3b8] transition-transform" style={{ transform: form.overrideXL ? "rotate(180deg)" : "" }} />
            </button>
            {form.overrideXL && (
              <div className="px-3 pb-3 grid grid-cols-2 gap-2 border-t border-[#e2e8f0] pt-3">
                {(Object.entries(XEP_LOAI_MAP) as [XepLoai, typeof XEP_LOAI_MAP[XepLoai]][]).map(([k, v]) => (
                  <button key={k} onClick={() => setF("xepLoaiOverride", k)}
                    className="py-2 rounded-[8px] text-[12px] border transition-colors"
                    style={{
                      fontFamily: "var(--font-sans)", fontWeight: form.xepLoaiOverride === k ? 700 : 400,
                      background: form.xepLoaiOverride === k ? v.bg : "white",
                      borderColor: form.xepLoaiOverride === k ? v.color : "#e2e8f0",
                      color: form.xepLoaiOverride === k ? v.color : "#5a6474",
                    }}>
                    {v.short}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block mb-1 text-[12px] font-semibold" style={{ color: "#475569", fontFamily: "var(--font-sans)" }}>Ghi chú (tùy chọn)</label>
            <textarea value={form.ghiChu} onChange={e => setF("ghiChu", e.target.value)}
              rows={3} placeholder="Lý do, nhận xét thêm…"
              className="w-full px-3 py-2 outline-none resize-none"
              style={{ border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-sans)", background: "white", color: "#0f172a" }} />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 flex gap-2" style={{ background: "white", borderTop: "1px solid #e8ecf3" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-[8px] border text-[13px]"
            style={{ fontFamily: "var(--font-sans)", borderColor: "#e2e8f0", color: "#475569", background: "white" }}>
            Hủy
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-[8px] text-[13px] text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: saved ? "#166534" : "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            {saved
              ? <><CheckCircle2 className="size-4" />Đã lưu!</>
              : <><Star className="size-4" />Lưu kết quả</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export function XepLoaiVienChucPage({ user, onNavigate }: { user: LoginUser; onNavigate: (label: string) => void }) {
  const { primary } = useTheme();
  const [list, setList] = useState<VienChuc[]>(VIEN_CHUC_LIST);
  const [search, setSearch]         = useState("");
  const [filterXL, setFilterXL]     = useState<string>("all");
  const [filterNam, setFilterNam]   = useState("2025");
  const [filterDonVi, setFilterDonVi] = useState("all");
  const [showAdd, setShowAdd]       = useState(false);

  const donViList = [...new Set(list.map(v => v.donVi))].sort();

  const filtered = list.filter(v => {
    const q = search.toLowerCase();
    const matchQ = !q || v.ten.toLowerCase().includes(q) || v.donVi.toLowerCase().includes(q) || v.chucVu.toLowerCase().includes(q);
    const matchXL = filterXL === "all" || v.xepLoai === filterXL;
    const matchNam = v.nam.toString() === filterNam;
    const matchDV = filterDonVi === "all" || v.donVi === filterDonVi;
    return matchQ && matchXL && matchNam && matchDV;
  });

  const stats = {
    total: list.filter(v => v.nam.toString() === filterNam).length,
    xuatSac: list.filter(v => v.xepLoai === "xuat-sac" && v.nam.toString() === filterNam).length,
    tot: list.filter(v => v.xepLoai === "tot" && v.nam.toString() === filterNam).length,
    hoanThanh: list.filter(v => v.xepLoai === "hoan-thanh" && v.nam.toString() === filterNam).length,
    khongHT: list.filter(v => v.xepLoai === "khong-hoan-thanh" && v.nam.toString() === filterNam).length,
  };

  const canEdit = ["quản trị hệ thống","lãnh đạo cấp cao","lãnh đạo đơn vị"].includes(user.role);

  function handleAddSave(vc: VienChuc) {
    setList(l => [vc, ...l]);
    setFilterNam(String(vc.nam));
  }

  const eligibleCount = list.filter(v =>
    v.nam.toString() === filterNam && v.xepLoai === "xuat-sac" && !v.viPham
  ).length;

  return (
    <div className="px-6 py-6 space-y-5 max-w-screen-xl">
      {showAdd && (
        <AddXepLoaiDrawer
          vcList={list}
          donViList={donViList}
          onClose={() => setShowAdd(false)}
          onSave={handleAddSave} />
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">Xếp loại Viên chức</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Kết quả xếp loại chất lượng viên chức cuối năm theo Nghị định 90/2020/NĐ-CP</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <Upload className="size-3.5" />Nhập Excel
          </button>
          <button className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <Download className="size-3.5" />Xuất Excel
          </button>
          {canEdit && (
            <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm flex items-center gap-1.5">
              <Plus className="size-3.5" />Thêm mới
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Tổng viên chức", value: stats.total, color: "#1C5FBE", bg: "#f0f4ff" },
          { label: "Xuất sắc", value: stats.xuatSac, color: "#16a34a", bg: "#dcfce7" },
          { label: "Hoàn thành tốt", value: stats.tot, color: "#1C5FBE", bg: "#f0f4ff" },
          { label: "Hoàn thành", value: stats.hoanThanh, color: "#d97706", bg: "#fef3c7" },
          { label: "Không hoàn thành", value: stats.khongHT, color: "#dc2626", bg: "#fee2e2" },
        ].map(kpi => (
          <div key={kpi.label} className="ds-card ds-card-default rounded-xl p-4 text-center">
            <div className="text-[28px] font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-[11px] text-[#64748b] mt-0.5">{kpi.label}</div>
            <div className="mt-2 h-1 rounded-full" style={{ background: kpi.bg }}>
              <div className="h-full rounded-full" style={{ width: `${stats.total ? Math.round((kpi.value/stats.total)*100) : 0}%`, background: kpi.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Callout — đủ điều kiện khen thưởng */}
      {eligibleCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#86efac]" style={{ background: "#f0fdf4" }}>
          <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#dcfce7" }}>
            <Award className="size-4" style={{ color: "#16a34a" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: "#166534", fontFamily: "var(--font-sans)" }}>
              {eligibleCount} viên chức xếp loại Xuất sắc đủ điều kiện đề xuất khen thưởng
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#166534", opacity: 0.7, fontFamily: "var(--font-sans)" }}>
              Nhấn "Đề xuất KT" ở từng dòng hoặc chuyển thẳng sang Đề nghị khen thưởng
            </p>
          </div>
          <button
            onClick={() => onNavigate("Đề nghị khen thưởng")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[13px] text-white shrink-0"
            style={{ background: "#16a34a", fontFamily: "var(--font-sans)", fontWeight: 600 }}
          >
            Đề nghị khen thưởng
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto">
        <div className="relative shrink-0 w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]" />
          <input className="ds-input ds-input-sm w-full pl-9" placeholder="Tìm tên, chức vụ…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ds-input ds-input-sm" value={filterNam} onChange={e => setFilterNam(e.target.value)}>
          <option value="2025">Năm 2025</option>
          <option value="2024">Năm 2024</option>
          <option value="2023">Năm 2023</option>
        </select>
        <select className="ds-input ds-input-sm" value={filterDonVi} onChange={e => setFilterDonVi(e.target.value)}>
          <option value="all">Tất cả đơn vị</option>
          {donViList.map(dv => <option key={dv}>{dv}</option>)}
        </select>
        <select className="ds-input ds-input-sm" value={filterXL} onChange={e => setFilterXL(e.target.value)}>
          <option value="all">Tất cả xếp loại</option>
          {Object.entries(XEP_LOAI_MAP).map(([k,v]) => <option key={k} value={k}>{v.short}</option>)}
        </select>
        <span className="ml-auto shrink-0 whitespace-nowrap text-[13px] text-[#64748b]">{filtered.length} kết quả</span>
      </div>

      {/* Table */}
      <div className="ds-card ds-card-default rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["STT","Họ và tên","Chức vụ","Đơn vị","Điểm","Xếp loại","Vi phạm","Ghi chú",""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((vc, idx) => {
              const xl = XEP_LOAI_MAP[vc.xepLoai];
              return (
                <tr key={vc.id} className="border-t border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
                  <td className="px-4 py-3 text-[#94a3b8] font-mono text-[12px]">{idx+1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{vc.ten}</td>
                  <td className="px-4 py-3 text-[#475569]">{vc.chucVu}</td>
                  <td className="px-4 py-3 text-[#475569]">{vc.donVi}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold" style={{ color: vc.diemChi >= 90 ? "#16a34a" : vc.diemChi >= 70 ? "#d97706" : "#dc2626" }}>
                      {vc.diemChi}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-medium px-2 py-1 rounded-full"
                      style={{ background: xl.bg, color: xl.color }}>{xl.short}</span>
                  </td>
                  <td className="px-4 py-3">
                    {vc.viPham
                      ? <span className="text-[#dc2626] flex items-center gap-1 text-[12px]"><AlertCircle className="size-3.5" />Có</span>
                      : <span className="text-[#16a34a] flex items-center gap-1 text-[12px]"><CheckCircle2 className="size-3.5" />Không</span>}
                  </td>
                  <td className="px-4 py-3 text-[#64748b] max-w-[180px] truncate">{vc.ghiChu ?? "—"}</td>
                  <td className="px-4 py-3">
                    {vc.xepLoai === "xuat-sac" && !vc.viPham && (
                      <button
                        onClick={() => onNavigate("Đề nghị khen thưởng")}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-[12px] whitespace-nowrap transition-opacity hover:opacity-80"
                        style={{ background: "#dcfce7", color: "#166534", fontFamily: "var(--font-sans)", fontWeight: 600 }}
                      >
                        Đề xuất KT
                        <ArrowRight className="size-3" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#64748b] text-[14px]">Không tìm thấy kết quả</div>
        )}
      </div>
    </div>
  );
}
