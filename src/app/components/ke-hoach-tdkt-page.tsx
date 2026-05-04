import { useState } from "react";
import {
  Search, Plus, Download, CalendarDays, CheckCircle2, Clock,
  AlertCircle, ChevronRight, X, Edit3, Trash2, Users,
  BarChart2, Target, TrendingUp, FileText, Building2,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type TrangThaiHD = "chua-bat-dau" | "dang-thuc-hien" | "hoan-thanh" | "tre-han";
interface HoatDong {
  id: string;
  tieuDe: string;
  phanLoai: string;
  nguoiPhuTrach: string;
  donVi: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  trangThai: TrangThaiHD;
  tienDo: number;
  ghiChu?: string;
}
interface KeHoach {
  id: string;
  tenKeHoach: string;
  nam: number;
  moTa: string;
  nguoiPhuTrach: string;
  ngayTao: string;
  tongHoatDong: number;
  hoatDongHoanThanh: number;
  hoatDong: HoatDong[];
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const KE_HOACH_LIST: KeHoach[] = [
  {
    id: "kh1", tenKeHoach: "Kế hoạch TĐKT năm 2026 – Toàn tỉnh",
    nam: 2026, nguoiPhuTrach: "Nguyễn Văn Hùng", ngayTao: "02/01/2026",
    moTa: "Kế hoạch triển khai phong trào thi đua khen thưởng toàn tỉnh Đồng Nai năm 2026 theo Nghị quyết số 01/NQ-TU",
    tongHoatDong: 8, hoatDongHoanThanh: 3,
    hoatDong: [
      { id: "hd1", tieuDe: "Tổ chức Lễ phát động phong trào thi đua đầu năm", phanLoai: "Phát động", nguoiPhuTrach: "VP Tỉnh ủy", donVi: "Văn phòng TU", thoiGianBatDau: "05/01/2026", thoiGianKetThuc: "20/01/2026", trangThai: "hoan-thanh", tienDo: 100 },
      { id: "hd2", tieuDe: "Thu thập đăng ký thi đua cá nhân & tập thể", phanLoai: "Đăng ký", nguoiPhuTrach: "Phòng TC-CB", donVi: "Tất cả đơn vị", thoiGianBatDau: "05/01/2026", thoiGianKetThuc: "31/01/2026", trangThai: "hoan-thanh", tienDo: 100 },
      { id: "hd3", tieuDe: "Tổng hợp đăng ký sáng kiến cải tiến", phanLoai: "Sáng kiến", nguoiPhuTrach: "Hội đồng KH", donVi: "Hội đồng TĐKT", thoiGianBatDau: "01/02/2026", thoiGianKetThuc: "28/02/2026", trangThai: "hoan-thanh", tienDo: 100 },
      { id: "hd4", tieuDe: "Tổ chức hội nghị sơ kết 6 tháng đầu năm", phanLoai: "Hội nghị", nguoiPhuTrach: "Ban TĐKT", donVi: "Văn phòng TU", thoiGianBatDau: "01/07/2026", thoiGianKetThuc: "15/07/2026", trangThai: "dang-thuc-hien", tienDo: 45 },
      { id: "hd5", tieuDe: "Thẩm định hồ sơ khen thưởng đợt 1", phanLoai: "Thẩm định", nguoiPhuTrach: "Hội đồng TĐKT", donVi: "Hội đồng TĐKT", thoiGianBatDau: "15/08/2026", thoiGianKetThuc: "15/09/2026", trangThai: "chua-bat-dau", tienDo: 0 },
      { id: "hd6", tieuDe: "Tổ chức bỏ phiếu kín Hội đồng xét duyệt", phanLoai: "Bỏ phiếu", nguoiPhuTrach: "Hội đồng TĐKT", donVi: "Hội đồng TĐKT", thoiGianBatDau: "20/09/2026", thoiGianKetThuc: "30/09/2026", trangThai: "chua-bat-dau", tienDo: 0 },
      { id: "hd7", tieuDe: "Trình ký và ban hành Quyết định khen thưởng", phanLoai: "Ban hành QĐ", nguoiPhuTrach: "Lãnh đạo TU", donVi: "Văn phòng TU", thoiGianBatDau: "01/10/2026", thoiGianKetThuc: "31/10/2026", trangThai: "chua-bat-dau", tienDo: 0 },
      { id: "hd8", tieuDe: "Tổ chức Lễ trao thưởng cuối năm", phanLoai: "Trao thưởng", nguoiPhuTrach: "Ban TĐKT", donVi: "Văn phòng TU", thoiGianBatDau: "15/12/2026", thoiGianKetThuc: "25/12/2026", trangThai: "chua-bat-dau", tienDo: 0 },
    ],
  },
  {
    id: "kh2", tenKeHoach: "Kế hoạch TĐKT năm 2025 – Toàn tỉnh",
    nam: 2025, nguoiPhuTrach: "Nguyễn Văn Hùng", ngayTao: "03/01/2025",
    moTa: "Kế hoạch triển khai phong trào thi đua khen thưởng toàn tỉnh Đồng Nai năm 2025",
    tongHoatDong: 8, hoatDongHoanThanh: 8,
    hoatDong: [],
  },
];

const STATUS_MAP: Record<TrangThaiHD, { label: string; color: string; bg: string }> = {
  "chua-bat-dau":    { label: "Chưa bắt đầu",     color: "#64748b", bg: "#f1f5f9" },
  "dang-thuc-hien":  { label: "Đang thực hiện",   color: "#1C5FBE", bg: "#f0f4ff" },
  "hoan-thanh":      { label: "Hoàn thành",        color: "#16a34a", bg: "#dcfce7" },
  "tre-han":         { label: "Trễ hạn",           color: "#dc2626", bg: "#fee2e2" },
};

const PHAN_LOAI_COLORS: Record<string, string> = {
  "Phát động": "#1C5FBE", "Đăng ký": "#16a34a", "Sáng kiến": "#7c3aed",
  "Hội nghị": "#0891b2", "Thẩm định": "#d97706", "Bỏ phiếu": "#7c3aed",
  "Ban hành QĐ": "#b45309", "Trao thưởng": "#d4a84b",
};

export function KeHoachTDKTPage({ user }: { user: LoginUser }) {
  const { primary } = useTheme();
  const [list] = useState<KeHoach[]>(KE_HOACH_LIST);
  const [selectedKH, setSelectedKH] = useState<KeHoach>(KE_HOACH_LIST[0]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);

  const canEdit = ["quản trị hệ thống","lãnh đạo cấp cao","lãnh đạo đơn vị"].includes(user.role);

  const filtered = selectedKH.hoatDong.filter(hd => {
    const q = search.toLowerCase();
    const matchQ = !q || hd.tieuDe.toLowerCase().includes(q) || hd.nguoiPhuTrach.toLowerCase().includes(q);
    const matchSt = filterStatus === "all" || hd.trangThai === filterStatus;
    return matchQ && matchSt;
  });

  const progress = Math.round((selectedKH.hoatDongHoanThanh / selectedKH.tongHoatDong) * 100);

  return (
    <div className="px-6 py-6 space-y-5 max-w-screen-xl">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">Kế hoạch TĐKT</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Lập và theo dõi kế hoạch triển khai thi đua khen thưởng hàng năm</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <Download className="size-3.5" />Xuất Excel
          </button>
          {canEdit && (
            <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm flex items-center gap-1.5">
              <Plus className="size-3.5" />Tạo kế hoạch
            </button>
          )}
        </div>
      </div>

      {/* Chọn kế hoạch */}
      <div className="flex gap-3">
        {list.map(kh => (
          <button key={kh.id} onClick={() => setSelectedKH(kh)}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border transition-all"
            style={{
              borderColor: selectedKH.id === kh.id ? primary : "#e2e8f0",
              background: selectedKH.id === kh.id ? primary + "15" : "white",
              color: selectedKH.id === kh.id ? primary : "#475569",
            }}>
            {kh.tenKeHoach.split("–")[0].trim()}
          </button>
        ))}
      </div>

      {/* KH overview */}
      <div className="ds-card ds-card-default rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-bold text-slate-900">{selectedKH.tenKeHoach}</h2>
            <p className="text-[13px] text-[#64748b] mt-0.5">{selectedKH.moTa}</p>
          </div>
          <span className="text-[13px] text-[#64748b]">Người phụ trách: <span className="font-medium text-slate-900">{selectedKH.nguoiPhuTrach}</span></span>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[
            { label: "Tổng hoạt động", value: selectedKH.tongHoatDong, icon: Target, color: "#1C5FBE" },
            { label: "Hoàn thành", value: selectedKH.hoatDong.filter(h => h.trangThai === "hoan-thanh").length, icon: CheckCircle2, color: "#16a34a" },
            { label: "Đang thực hiện", value: selectedKH.hoatDong.filter(h => h.trangThai === "dang-thuc-hien").length, icon: Clock, color: "#d97706" },
            { label: "Chưa bắt đầu", value: selectedKH.hoatDong.filter(h => h.trangThai === "chua-bat-dau").length, icon: AlertCircle, color: "#64748b" },
          ].map(kpi => {
            const KIcon = kpi.icon;
            return (
              <div key={kpi.label} className="flex items-center gap-3 p-3 rounded-lg bg-[#f8fafc]">
                <KIcon className="size-5 shrink-0" style={{ color: kpi.color }} />
                <div>
                  <div className="text-[20px] font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className="text-[11px] text-[#64748b]">{kpi.label}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-[#64748b]">Tiến độ tổng thể</span>
            <span className="font-semibold text-slate-900">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#e2e8f0] overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: primary }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]" />
          <input className="ds-input ds-input-sm w-full pl-9" placeholder="Tìm hoạt động…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ds-input ds-input-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(STATUS_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="ml-auto text-[13px] text-[#64748b]">{filtered.length} hoạt động</span>
      </div>

      {/* Timeline table */}
      <div className="ds-card ds-card-default rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Hoạt động","Phân loại","Phụ trách","Thời gian","Tiến độ","Trạng thái"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(hd => {
              const st = STATUS_MAP[hd.trangThai];
              return (
                <tr key={hd.id} className="border-t border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{hd.tieuDe}</div>
                    {hd.ghiChu && <div className="text-[11px] text-[#d97706]">{hd.ghiChu}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded"
                      style={{ background: (PHAN_LOAI_COLORS[hd.phanLoai] ?? "#64748b") + "20", color: PHAN_LOAI_COLORS[hd.phanLoai] ?? "#64748b" }}>
                      {hd.phanLoai}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#475569]">
                    <div>{hd.nguoiPhuTrach}</div>
                    <div className="text-[11px] text-[#94a3b8]">{hd.donVi}</div>
                  </td>
                  <td className="px-4 py-3 text-[#475569]">
                    <div className="text-[12px]">{hd.thoiGianBatDau}</div>
                    <div className="text-[11px] text-[#94a3b8]">→ {hd.thoiGianKetThuc}</div>
                  </td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${hd.tienDo}%`, background: primary }} />
                      </div>
                      <span className="text-[12px] font-medium text-slate-900 w-8 text-right">{hd.tienDo}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-medium px-2 py-1 rounded-full"
                      style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#64748b] text-[14px]">Không có hoạt động nào</div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[520px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-slate-900">Tạo kế hoạch TĐKT mới</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#64748b] hover:text-slate-900"><X className="size-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Tên kế hoạch</label>
                <input className="ds-input w-full" placeholder="VD: Kế hoạch TĐKT năm 2027 – Toàn tỉnh" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Năm</label>
                  <input type="number" className="ds-input w-full" defaultValue={2027} />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Người phụ trách</label>
                  <input className="ds-input w-full" placeholder="Tên người phụ trách" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Mô tả</label>
                <textarea className="ds-input w-full resize-none" rows={3} placeholder="Mô tả tóm tắt kế hoạch" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn btn-secondary btn-md flex-1">Hủy</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-primary btn-md flex-1">Tạo kế hoạch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
