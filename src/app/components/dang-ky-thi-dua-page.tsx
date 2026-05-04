import { useState } from "react";
import {
  Search, Plus, Download, Filter, CheckCircle2, Clock,
  XCircle, ChevronRight, X, User, Building2, Star,
  CalendarDays, FileText, Edit3, Copy, Send, Award,
  Users, AlertCircle,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type LoaiDK = "ca-nhan" | "tap-the";
type TrangThai = "du-thao" | "da-nop" | "da-duyet" | "tu-choi";
interface DangKy {
  id: string;
  loai: LoaiDK;
  tenDangKy: string;          // tên cá nhân hoặc tập thể
  donVi: string;
  danhHieu: string;
  namDangKy: number;
  ngayNop?: string;
  nguoiNop: string;
  trangThai: TrangThai;
  lyDoTuChoi?: string;
  ghiChu?: string;
  // năm trước
  daDangKyNamTruoc: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const DANG_KY_LIST: DangKy[] = [
  {
    id: "dk1", loai: "ca-nhan", tenDangKy: "Nguyễn Thị Bích Vân",
    donVi: "Phòng Tổ chức – Cán bộ", danhHieu: "Chiến sĩ thi đua cơ sở",
    namDangKy: 2026, ngayNop: "05/01/2026", nguoiNop: "Nguyễn Thị Bích Vân",
    trangThai: "da-duyet", daDangKyNamTruoc: true,
  },
  {
    id: "dk2", loai: "ca-nhan", tenDangKy: "Trần Minh Quân",
    donVi: "Ban Tuyên giáo", danhHieu: "Lao động tiên tiến",
    namDangKy: 2026, ngayNop: "06/01/2026", nguoiNop: "Trần Minh Quân",
    trangThai: "da-duyet", daDangKyNamTruoc: true,
  },
  {
    id: "dk3", loai: "tap-the", tenDangKy: "Phòng Tài chính – Kế toán",
    donVi: "Sở Tài chính", danhHieu: "Tập thể Lao động xuất sắc",
    namDangKy: 2026, ngayNop: "07/01/2026", nguoiNop: "Phạm Quốc Bảo",
    trangThai: "da-duyet", daDangKyNamTruoc: true,
  },
  {
    id: "dk4", loai: "ca-nhan", tenDangKy: "Lê Hoàng Nam",
    donVi: "Trung tâm CNTT", danhHieu: "Chiến sĩ thi đua cơ sở",
    namDangKy: 2026, ngayNop: "08/01/2026", nguoiNop: "Lê Hoàng Nam",
    trangThai: "da-nop", daDangKyNamTruoc: false,
  },
  {
    id: "dk5", loai: "tap-the", tenDangKy: "Ban Dân vận",
    donVi: "Tỉnh ủy Đồng Nai", danhHieu: "Cờ thi đua cấp Tỉnh",
    namDangKy: 2026, ngayNop: "09/01/2026", nguoiNop: "Nguyễn Thị Bích Liên",
    trangThai: "da-nop", daDangKyNamTruoc: true,
  },
  {
    id: "dk6", loai: "ca-nhan", tenDangKy: "Hoàng Thị Thu Thảo",
    donVi: "Phòng Quản lý Đô thị", danhHieu: "Lao động tiên tiến",
    namDangKy: 2026, nguoiNop: "Hoàng Thị Thu Thảo",
    trangThai: "du-thao", daDangKyNamTruoc: false,
    ghiChu: "Cần bổ sung minh chứng sáng kiến",
  },
  {
    id: "dk7", loai: "ca-nhan", tenDangKy: "Võ Văn Tùng",
    donVi: "Đơn vị Thanh tra Xây dựng", danhHieu: "Chiến sĩ thi đua cơ sở",
    namDangKy: 2026, ngayNop: "10/01/2026", nguoiNop: "Võ Văn Tùng",
    trangThai: "tu-choi", lyDoTuChoi: "Chưa đạt tiêu chí về thời gian công tác liên tục",
    daDangKyNamTruoc: false,
  },
  {
    id: "dk8", loai: "tap-the", tenDangKy: "Trung tâm Lưu trữ tỉnh",
    donVi: "Văn phòng TU", danhHieu: "Tập thể Lao động tiên tiến",
    namDangKy: 2026, ngayNop: "11/01/2026", nguoiNop: "Lê Minh Tuấn",
    trangThai: "da-nop", daDangKyNamTruoc: true,
  },
  {
    id: "dk9", loai: "ca-nhan", tenDangKy: "Phan Thị Hồng Nhung",
    donVi: "Ban Tuyên giáo", danhHieu: "Chiến sĩ thi đua cấp Tỉnh",
    namDangKy: 2026, ngayNop: "04/01/2026", nguoiNop: "Phan Thị Hồng Nhung",
    trangThai: "da-duyet", daDangKyNamTruoc: true,
  },
  {
    id: "dk10", loai: "tap-the", tenDangKy: "Phòng Tổ chức – Cán bộ",
    donVi: "Văn phòng TU Đồng Nai", danhHieu: "Cờ thi đua cấp Tỉnh",
    namDangKy: 2026, ngayNop: "05/01/2026", nguoiNop: "Nguyễn Văn Hùng",
    trangThai: "da-duyet", daDangKyNamTruoc: true,
  },
];

const STATUS_MAP: Record<TrangThai, { label: string; color: string; bg: string; icon: React.FC<{ className?: string }> }> = {
  "du-thao":  { label: "Dự thảo",   color: "#64748b", bg: "#f1f5f9", icon: ({ className }) => <Edit3 className={className} /> },
  "da-nop":   { label: "Đã nộp",    color: "#d97706", bg: "#fef3c7", icon: ({ className }) => <Clock className={className} /> },
  "da-duyet": { label: "Đã duyệt",  color: "#16a34a", bg: "#dcfce7", icon: ({ className }) => <CheckCircle2 className={className} /> },
  "tu-choi":  { label: "Từ chối",   color: "#dc2626", bg: "#fee2e2", icon: ({ className }) => <XCircle className={className} /> },
};

const DANH_HIEU_LIST = [
  "Lao động tiên tiến",
  "Chiến sĩ thi đua cơ sở",
  "Chiến sĩ thi đua cấp Tỉnh",
  "Tập thể Lao động tiên tiến",
  "Tập thể Lao động xuất sắc",
  "Cờ thi đua cấp Tỉnh",
];

/* ═══════════════════════════════════════════════════════════════
   ADD FORM MODAL
═══════════════════════════════════════════════════════════════ */
function AddFormModal({ user, onClose, onSave }: {
  user: LoginUser;
  onClose: () => void;
  onSave: (dk: DangKy) => void;
}) {
  const [loai, setLoai] = useState<LoaiDK>("ca-nhan");
  const [tenDangKy, setTenDangKy] = useState(user.role === "cá nhân" ? user.name : "");
  const [donVi, setDonVi] = useState("");
  const [danhHieu, setDanhHieu] = useState(DANH_HIEU_LIST[0]);
  const [ghiChu, setGhiChu] = useState("");

  const handleSave = () => {
    onSave({
      id: `dk${Date.now()}`, loai, tenDangKy, donVi, danhHieu,
      namDangKy: 2026, nguoiNop: user.name,
      trangThai: "du-thao", daDangKyNamTruoc: false, ghiChu,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={() => onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-[540px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-slate-900">Đăng ký thi đua năm 2026</h2>
          <button onClick={onClose} className="text-[#64748b] hover:text-slate-900"><X className="size-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Loại đăng ký */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-2">Loại đăng ký</label>
            <div className="flex gap-3">
              {([["ca-nhan","Cá nhân"],["tap-the","Tập thể"]] as const).map(([v,l]) => (
                <button key={v} onClick={() => setLoai(v)}
                  className="flex-1 py-2.5 rounded-lg border-2 text-[13px] font-medium transition-all"
                  style={{ borderColor: loai === v ? "#1C5FBE" : "#e2e8f0", background: loai === v ? "#f0f4ff" : "white", color: loai === v ? "#1C5FBE" : "#374151" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              {loai === "ca-nhan" ? "Họ và tên" : "Tên tập thể"} <span className="text-red-500">*</span>
            </label>
            <input className="ds-input w-full" value={tenDangKy} onChange={e => setTenDangKy(e.target.value)}
              placeholder={loai === "ca-nhan" ? "Nhập họ và tên" : "Nhập tên phòng/ban/đơn vị"} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Đơn vị <span className="text-red-500">*</span></label>
            <input className="ds-input w-full" value={donVi} onChange={e => setDonVi(e.target.value)}
              placeholder="Đơn vị công tác" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Danh hiệu đăng ký <span className="text-red-500">*</span></label>
            <select className="ds-input w-full" value={danhHieu} onChange={e => setDanhHieu(e.target.value)}>
              {DANH_HIEU_LIST.filter(d => loai === "ca-nhan"
                ? !d.includes("Tập thể") && !d.includes("Cờ")
                : d.includes("Tập thể") || d.includes("Cờ")
              ).map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Ghi chú</label>
            <textarea className="ds-input w-full resize-none" rows={3} value={ghiChu} onChange={e => setGhiChu(e.target.value)}
              placeholder="Ghi chú thêm (nếu có)" />
          </div>
          <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3 text-[13px] text-[#1e40af] flex gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>Sau khi lưu dự thảo, cần bổ sung minh chứng và nộp trước <strong>31/01/2026</strong>.</span>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#e2e8f0] flex gap-3">
          <button onClick={onClose} className="btn btn-secondary btn-md flex-1">Hủy</button>
          <button onClick={handleSave} disabled={!tenDangKy || !donVi}
            className="btn btn-primary btn-md flex-1 flex items-center justify-center gap-1.5">
            <FileText className="size-4" />Lưu dự thảo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function DangKyThiDuaPage({ user }: { user: LoginUser }) {
  const { primary } = useTheme();
  const [list, setList] = useState<DangKy[]>(DANG_KY_LIST);
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterNam, setFilterNam] = useState("2026");
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState<DangKy | null>(null);

  const isManager = ["quản trị hệ thống","lãnh đạo cấp cao","lãnh đạo đơn vị","hội đồng"].includes(user.role);

  const myItems = user.role === "cá nhân"
    ? list.filter(d => d.nguoiNop === user.name)
    : list;

  const filtered = myItems.filter(d => {
    const q = search.toLowerCase();
    const matchQ = !q || d.tenDangKy.toLowerCase().includes(q) || d.donVi.toLowerCase().includes(q);
    const matchLoai = filterLoai === "all" || d.loai === filterLoai;
    const matchSt = filterStatus === "all" || d.trangThai === filterStatus;
    const matchNam = d.namDangKy.toString() === filterNam;
    return matchQ && matchLoai && matchSt && matchNam;
  });

  const stats = {
    total: myItems.length,
    daDuyet: myItems.filter(d => d.trangThai === "da-duyet").length,
    daNop: myItems.filter(d => d.trangThai === "da-nop").length,
    duThao: myItems.filter(d => d.trangThai === "du-thao").length,
    tuChoi: myItems.filter(d => d.trangThai === "tu-choi").length,
  };

  return (
    <div className="px-6 py-6 space-y-5 max-w-screen-xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">Đăng ký Thi đua</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            {user.role === "cá nhân" ? "Đăng ký danh hiệu thi đua của bạn" : "Quản lý đăng ký thi đua toàn đơn vị"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isManager && (
            <button className="btn btn-secondary btn-sm flex items-center gap-1.5">
              <Download className="size-3.5" />Xuất Excel
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Plus className="size-3.5" />Đăng ký mới
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng đăng ký", value: stats.total, color: "#1C5FBE", bg: "#f0f4ff", icon: Star },
          { label: "Đã duyệt", value: stats.daDuyet, color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
          { label: "Chờ xét duyệt", value: stats.daNop, color: "#d97706", bg: "#fef3c7", icon: Clock },
          { label: "Dự thảo / Từ chối", value: stats.duThao + stats.tuChoi, color: "#64748b", bg: "#f1f5f9", icon: FileText },
        ].map(kpi => {
          const KIcon = kpi.icon;
          return (
            <div key={kpi.label} className="ds-card ds-card-default rounded-xl p-4 flex items-center gap-4">
              <div className="size-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: kpi.bg }}>
                <KIcon className="size-5" style={{ color: kpi.color }} />
              </div>
              <div>
                <div className="text-[24px] font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-[12px] text-[#64748b]">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]" />
          <input className="ds-input ds-input-sm w-full pl-9" placeholder="Tìm tên, đơn vị…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ds-input ds-input-sm" value={filterNam} onChange={e => setFilterNam(e.target.value)}>
          <option value="2026">Năm 2026</option>
          <option value="2025">Năm 2025</option>
        </select>
        <select className="ds-input ds-input-sm" value={filterLoai} onChange={e => setFilterLoai(e.target.value)}>
          <option value="all">Cá nhân & Tập thể</option>
          <option value="ca-nhan">Cá nhân</option>
          <option value="tap-the">Tập thể</option>
        </select>
        <select className="ds-input ds-input-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="du-thao">Dự thảo</option>
          <option value="da-nop">Đã nộp</option>
          <option value="da-duyet">Đã duyệt</option>
          <option value="tu-choi">Từ chối</option>
        </select>
        <span className="ml-auto text-[13px] text-[#64748b]">{filtered.length} đăng ký</span>
      </div>

      {/* Table */}
      <div className="ds-card ds-card-default rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Người/Tập thể","Loại","Đơn vị","Danh hiệu đăng ký","Ngày nộp","Đăng ký lần đầu","Trạng thái",""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(dk => {
              const st = STATUS_MAP[dk.trangThai];
              const StIcon = st.icon;
              return (
                <tr key={dk.id} className="border-t border-[#e2e8f0] cursor-pointer transition-colors row-clickable"
                  onClick={() => setDetail(dk)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: dk.loai === "ca-nhan" ? "#f0f4ff" : "#f0fdf4" }}>
                        {dk.loai === "ca-nhan"
                          ? <User className="size-3.5" style={{ color: "#1C5FBE" }} />
                          : <Building2 className="size-3.5" style={{ color: "#16a34a" }} />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{dk.tenDangKy}</div>
                        {dk.ghiChu && <div className="text-[11px] text-[#f59e0b]">⚠ {dk.ghiChu}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-[11px] ${dk.loai === "ca-nhan" ? "badge-primary" : "badge-success"}`}>
                      {dk.loai === "ca-nhan" ? "Cá nhân" : "Tập thể"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#475569] max-w-[180px] truncate">{dk.donVi}</td>
                  <td className="px-4 py-3 text-[#475569]">{dk.danhHieu}</td>
                  <td className="px-4 py-3 text-[#475569]">{dk.ngayNop ?? "—"}</td>
                  <td className="px-4 py-3">
                    {dk.daDangKyNamTruoc
                      ? <span className="text-[#16a34a] text-[12px] flex items-center gap-1"><Copy className="size-3" />Tái đăng ký</span>
                      : <span className="text-[#64748b] text-[12px]">Lần đầu</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-[12px] font-medium w-fit px-2 py-1 rounded-full"
                      style={{ background: st.bg, color: st.color }}>
                      <StIcon className="size-3" />{st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-[#64748b] hover:text-[#1C5FBE] transition-colors">
                      <ChevronRight className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#64748b] text-[14px]">Không có đăng ký nào phù hợp</div>
        )}
      </div>

      {/* Detail side panel */}
      {detail && (
        <div className="fixed inset-0 z-[80] flex justify-end" style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setDetail(null)}>
          <div className="w-[440px] h-full bg-white flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-start justify-between"
              style={{ background: "linear-gradient(135deg,#0f2040,#1C5FBE)" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] px-2 py-0.5 rounded font-medium"
                    style={{ background: "rgba(255,255,255,0.18)", color: "white" }}>
                    {detail.loai === "ca-nhan" ? "Cá nhân" : "Tập thể"}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded font-medium"
                    style={{ background: STATUS_MAP[detail.trangThai].bg, color: STATUS_MAP[detail.trangThai].color }}>
                    {STATUS_MAP[detail.trangThai].label}
                  </span>
                </div>
                <h2 className="text-[18px] font-bold text-white">{detail.tenDangKy}</h2>
                <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{detail.donVi}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-white/60 hover:text-white"><X className="size-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-3">
                {[
                  { label: "Danh hiệu đăng ký", value: detail.danhHieu },
                  { label: "Năm đăng ký", value: detail.namDangKy.toString() },
                  { label: "Người nộp", value: detail.nguoiNop },
                  { label: "Ngày nộp", value: detail.ngayNop ?? "Chưa nộp" },
                  { label: "Loại đăng ký", value: detail.daDangKyNamTruoc ? "Tái đăng ký (năm trước đã đăng ký)" : "Đăng ký lần đầu" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-[13px] py-2 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b]">{row.label}</span>
                    <span className="font-medium text-slate-900 text-right max-w-[220px]">{row.value}</span>
                  </div>
                ))}
              </div>
              {detail.ghiChu && (
                <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 text-[13px] text-[#92400e]">
                  <strong>Ghi chú:</strong> {detail.ghiChu}
                </div>
              )}
              {detail.lyDoTuChoi && (
                <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-3 text-[13px] text-[#dc2626]">
                  <strong>Lý do từ chối:</strong> {detail.lyDoTuChoi}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#e2e8f0] flex gap-2">
              {detail.trangThai === "du-thao" && (
                <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5">
                  <Send className="size-3.5" />Nộp đăng ký
                </button>
              )}
              {detail.trangThai === "da-nop" && isManager && (
                <>
                  <button className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors"
                    style={{ background: "#dcfce7", color: "#16a34a" }}>
                    ✓ Phê duyệt
                  </button>
                  <button className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors"
                    style={{ background: "#fee2e2", color: "#dc2626" }}>
                    ✗ Từ chối
                  </button>
                </>
              )}
              {detail.trangThai === "tu-choi" && (
                <button className="btn btn-primary btn-sm flex-1">Điều chỉnh & Nộp lại</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <AddFormModal user={user} onClose={() => setShowAdd(false)}
          onSave={(dk) => setList(prev => [...prev, dk])} />
      )}
    </div>
  );
}
