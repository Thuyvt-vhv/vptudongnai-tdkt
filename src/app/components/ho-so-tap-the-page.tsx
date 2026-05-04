import { useState } from "react";
import {
  Search, Building2, Star, Award, Filter, Eye, Plus,
  Download, ChevronRight, Users, CheckCircle2, Clock,
  XCircle, BarChart2, FileText, X, Trophy, CalendarDays,
  TrendingUp, Medal, LayoutGrid, LayoutList, Edit3,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface AwardRecord {
  type: string; year: number; level: string; qd: string;
}
interface TapThe {
  id: string;
  ten: string;
  loai: "phong" | "ban" | "trung-tam" | "don-vi";
  donViCha: string;
  soNhanSu: number;
  truongDon: string;
  namThanhLap: number;
  danhHieuHienTai: string;
  danhHieuDeXuat: string;
  diemTB: number;
  trangThai: "du-dieu-kien" | "dang-xet" | "chua-du";
  khenThuong: AwardRecord[];
  completeness: number;
  ghiChu?: string;
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const TAP_THE_LIST: TapThe[] = [
  {
    id: "tt1", ten: "Phòng Tổ chức – Cán bộ", loai: "phong",
    donViCha: "Văn phòng TU Đồng Nai", soNhanSu: 18, truongDon: "Nguyễn Văn Hùng",
    namThanhLap: 2005, danhHieuHienTai: "Tập thể Lao động xuất sắc",
    danhHieuDeXuat: "Cờ thi đua cấp Tỉnh", diemTB: 92.4,
    trangThai: "du-dieu-kien",
    khenThuong: [
      { type: "Cờ thi đua UBND Tỉnh", year: 2023, level: "Tỉnh", qd: "188/QĐ-UBND-2023" },
      { type: "Tập thể LĐXS", year: 2022, level: "Tỉnh", qd: "047/QĐ-TU-2022" },
    ],
    completeness: 96,
  },
  {
    id: "tt2", ten: "Ban Tuyên giáo", loai: "ban",
    donViCha: "Tỉnh ủy Đồng Nai", soNhanSu: 24, truongDon: "Trần Thị Mai Hương",
    namThanhLap: 1998, danhHieuHienTai: "Cờ thi đua cấp Tỉnh",
    danhHieuDeXuat: "Huân chương Lao động hạng Ba", diemTB: 95.1,
    trangThai: "du-dieu-kien",
    khenThuong: [
      { type: "Huân chương LĐ hạng Ba", year: 2024, level: "Nhà nước", qd: "155/QĐ-CTN-2024" },
      { type: "Cờ thi đua UBND Tỉnh", year: 2022, level: "Tỉnh", qd: "201/QĐ-UBND-2022" },
    ],
    completeness: 99,
  },
  {
    id: "tt3", ten: "Trung tâm Lưu trữ tỉnh", loai: "trung-tam",
    donViCha: "Văn phòng TU Đồng Nai", soNhanSu: 12, truongDon: "Lê Minh Tuấn",
    namThanhLap: 2012, danhHieuHienTai: "Tập thể Lao động tiên tiến",
    danhHieuDeXuat: "Tập thể Lao động xuất sắc", diemTB: 84.7,
    trangThai: "dang-xet",
    khenThuong: [
      { type: "Tập thể LĐTT", year: 2023, level: "Tỉnh", qd: "062/QĐ-TU-2023" },
    ],
    completeness: 88,
  },
  {
    id: "tt4", ten: "Phòng Tài chính – Kế toán", loai: "phong",
    donViCha: "Sở Tài chính", soNhanSu: 15, truongDon: "Phạm Quốc Bảo",
    namThanhLap: 2003, danhHieuHienTai: "Tập thể Lao động tiên tiến",
    danhHieuDeXuat: "Tập thể Lao động xuất sắc", diemTB: 87.3,
    trangThai: "dang-xet",
    khenThuong: [
      { type: "Tập thể LĐTT", year: 2024, level: "Tỉnh", qd: "078/QĐ-TC-2024" },
      { type: "Bằng khen UBND Tỉnh", year: 2021, level: "Tỉnh", qd: "123/QĐ-UBND-2021" },
    ],
    completeness: 91,
  },
  {
    id: "tt5", ten: "Đơn vị Thanh tra Xây dựng", loai: "don-vi",
    donViCha: "Sở Xây dựng", soNhanSu: 20, truongDon: "Võ Thanh Phong",
    namThanhLap: 2008, danhHieuHienTai: "Tập thể Lao động tiên tiến",
    danhHieuDeXuat: "Tập thể Lao động tiên tiến", diemTB: 76.2,
    trangThai: "chua-du",
    khenThuong: [],
    completeness: 72,
    ghiChu: "Cần bổ sung 2 tiêu chí còn thiếu trước 30/06",
  },
  {
    id: "tt6", ten: "Ban Dân vận", loai: "ban",
    donViCha: "Tỉnh ủy Đồng Nai", soNhanSu: 16, truongDon: "Nguyễn Thị Bích Liên",
    namThanhLap: 1995, danhHieuHienTai: "Cờ thi đua cấp Tỉnh",
    danhHieuDeXuat: "Cờ thi đua cấp Tỉnh (lần 2)", diemTB: 93.8,
    trangThai: "du-dieu-kien",
    khenThuong: [
      { type: "Cờ thi đua UBND Tỉnh", year: 2024, level: "Tỉnh", qd: "210/QĐ-UBND-2024" },
      { type: "Cờ thi đua UBND Tỉnh", year: 2021, level: "Tỉnh", qd: "195/QĐ-UBND-2021" },
    ],
    completeness: 97,
  },
  {
    id: "tt7", ten: "Phòng Quản lý Đô thị", loai: "phong",
    donViCha: "Sở Xây dựng", soNhanSu: 22, truongDon: "Trần Quang Vinh",
    namThanhLap: 2006, danhHieuHienTai: "Tập thể Lao động xuất sắc",
    danhHieuDeXuat: "Cờ thi đua cấp Tỉnh", diemTB: 89.5,
    trangThai: "du-dieu-kien",
    khenThuong: [
      { type: "Tập thể LĐXS", year: 2023, level: "Tỉnh", qd: "091/QĐ-XD-2023" },
      { type: "Bằng khen Bộ Xây dựng", year: 2022, level: "Bộ", qd: "BK-XD-2022-057" },
    ],
    completeness: 94,
  },
  {
    id: "tt8", ten: "Trung tâm Công nghệ thông tin", loai: "trung-tam",
    donViCha: "Sở TT&TT", soNhanSu: 30, truongDon: "Đinh Xuân Long",
    namThanhLap: 2015, danhHieuHienTai: "Tập thể Lao động tiên tiến",
    danhHieuDeXuat: "Tập thể Lao động xuất sắc", diemTB: 85.9,
    trangThai: "dang-xet",
    khenThuong: [
      { type: "Tập thể LĐTT", year: 2024, level: "Tỉnh", qd: "033/QĐ-TT-2024" },
    ],
    completeness: 85,
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const LOAI_MAP: Record<TapThe["loai"], string> = {
  phong: "Phòng", ban: "Ban", "trung-tam": "Trung tâm", "don-vi": "Đơn vị",
};
const STATUS_MAP = {
  "du-dieu-kien": { label: "Đủ điều kiện", color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
  "dang-xet":     { label: "Đang xét",     color: "#d97706", bg: "#fef3c7", icon: Clock },
  "chua-du":      { label: "Chưa đủ",      color: "#dc2626", bg: "#fee2e2", icon: XCircle },
};

/* ═══════════════════════════════════════════════════════════════
   DETAIL DRAWER
═══════════════════════════════════════════════════════════════ */
function DetailDrawer({ tapThe, onClose }: { tapThe: TapThe; onClose: () => void }) {
  const st = STATUS_MAP[tapThe.trangThai];
  const StIcon = st.icon;
  return (
    <div className="fixed inset-0 z-[80] flex justify-end" style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-[520px] h-full bg-white flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-start justify-between"
          style={{ background: "linear-gradient(135deg,#0f2040,#1C5FBE)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
                {LOAI_MAP[tapThe.loai]}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded font-semibold"
                style={{ background: st.bg, color: st.color }}>
                {st.label}
              </span>
            </div>
            <h2 className="text-[18px] font-bold text-white leading-snug">{tapThe.ten}</h2>
            <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{tapThe.donViCha}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors mt-0.5">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Nhân sự", value: tapThe.soNhanSu, unit: "người", icon: Users, color: "#1C5FBE" },
              { label: "Điểm TB", value: tapThe.diemTB, unit: "/100", icon: BarChart2, color: "#7c3aed" },
              { label: "Hoàn thiện", value: tapThe.completeness, unit: "%", icon: TrendingUp, color: "#16a34a" },
            ].map(kpi => {
              const KIcon = kpi.icon;
              return (
                <div key={kpi.label} className="rounded-xl border border-[#e2e8f0] p-3 text-center">
                  <KIcon className="size-4 mx-auto mb-1" style={{ color: kpi.color }} />
                  <div className="text-[20px] font-bold" style={{ color: kpi.color }}>{kpi.value}<span className="text-[13px] font-normal text-[#64748b]">{kpi.unit}</span></div>
                  <div className="text-[11px] text-[#64748b]">{kpi.label}</div>
                </div>
              );
            })}
          </div>

          {/* Info */}
          <div className="rounded-xl border border-[#e2e8f0] p-4 space-y-3">
            <h3 className="text-[13px] font-semibold text-slate-900">Thông tin chung</h3>
            {[
              { label: "Trưởng đơn vị", value: tapThe.truongDon },
              { label: "Năm thành lập", value: tapThe.namThanhLap.toString() },
              { label: "Danh hiệu hiện tại", value: tapThe.danhHieuHienTai },
              { label: "Danh hiệu đề xuất", value: tapThe.danhHieuDeXuat },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-[13px]">
                <span className="text-[#64748b]">{row.label}</span>
                <span className="font-medium text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Completeness bar */}
          <div>
            <div className="flex justify-between text-[12px] mb-1.5">
              <span className="text-[#64748b]">Mức độ hoàn thiện hồ sơ</span>
              <span className="font-semibold" style={{ color: tapThe.completeness >= 90 ? "#16a34a" : tapThe.completeness >= 75 ? "#d97706" : "#dc2626" }}>
                {tapThe.completeness}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#e2e8f0] overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${tapThe.completeness}%`, background: tapThe.completeness >= 90 ? "#16a34a" : tapThe.completeness >= 75 ? "#d97706" : "#dc2626" }} />
            </div>
          </div>

          {/* Awards */}
          <div>
            <h3 className="text-[13px] font-semibold text-slate-900 mb-3">
              Lịch sử khen thưởng <span className="text-[#64748b] font-normal">({tapThe.khenThuong.length})</span>
            </h3>
            {tapThe.khenThuong.length === 0 ? (
              <div className="text-center py-6 text-[#64748b] text-[13px] border border-dashed border-[#e2e8f0] rounded-xl">
                Chưa có khen thưởng
              </div>
            ) : (
              <div className="space-y-2">
                {tapThe.khenThuong.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#e2e8f0] bg-[#fafbfc]">
                    <Medal className="size-4 shrink-0 text-[#d4a84b]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-slate-900">{a.type}</div>
                      <div className="text-[12px] text-[#64748b]">{a.qd} · {a.year}</div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "#f0f4ff", color: "#1C5FBE" }}>{a.level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {tapThe.ghiChu && (
            <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 text-[13px] text-[#92400e]">
              <strong>Ghi chú:</strong> {tapThe.ghiChu}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#e2e8f0] flex gap-2">
          <button className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-1.5">
            <Edit3 className="size-3.5" />Chỉnh sửa
          </button>
          <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5">
            <FileText className="size-3.5" />Xuất hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function HoSoTapThePage({ user }: { user: LoginUser }) {
  const { primary } = useTheme();
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("list");
  const [detail, setDetail] = useState<TapThe | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = TAP_THE_LIST.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.ten.toLowerCase().includes(q) || t.donViCha.toLowerCase().includes(q) || t.truongDon.toLowerCase().includes(q);
    const matchLoai = filterLoai === "all" || t.loai === filterLoai;
    const matchSt = filterStatus === "all" || t.trangThai === filterStatus;
    return matchQ && matchLoai && matchSt;
  });

  const stats = {
    total: TAP_THE_LIST.length,
    duDK: TAP_THE_LIST.filter(t => t.trangThai === "du-dieu-kien").length,
    dangXet: TAP_THE_LIST.filter(t => t.trangThai === "dang-xet").length,
    chuaDu: TAP_THE_LIST.filter(t => t.trangThai === "chua-du").length,
  };

  const canEdit = ["quản trị hệ thống","lãnh đạo cấp cao","lãnh đạo đơn vị"].includes(user.role);

  return (
    <div className="px-6 py-6 space-y-5 max-w-screen-xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">Hồ sơ Tập thể</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Quản lý hồ sơ thi đua khen thưởng các phòng, ban, đơn vị</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng tập thể", value: stats.total, color: "#1C5FBE", bg: "#f0f4ff", icon: Building2 },
          { label: "Đủ điều kiện", value: stats.duDK, color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
          { label: "Đang xét duyệt", value: stats.dangXet, color: "#d97706", bg: "#fef3c7", icon: Clock },
          { label: "Chưa đủ điều kiện", value: stats.chuaDu, color: "#dc2626", bg: "#fee2e2", icon: XCircle },
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

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[340px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]" />
          <input className="ds-input ds-input-sm w-full pl-9" placeholder="Tìm tên, đơn vị, trưởng đơn vị…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ds-input ds-input-sm min-w-[140px]" value={filterLoai} onChange={e => setFilterLoai(e.target.value)}>
          <option value="all">Tất cả loại</option>
          <option value="phong">Phòng</option>
          <option value="ban">Ban</option>
          <option value="trung-tam">Trung tâm</option>
          <option value="don-vi">Đơn vị</option>
        </select>
        <select className="ds-input ds-input-sm min-w-[160px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="du-dieu-kien">Đủ điều kiện</option>
          <option value="dang-xet">Đang xét</option>
          <option value="chua-du">Chưa đủ</option>
        </select>
        <div className="ml-auto flex items-center gap-1 p-1 rounded-lg border border-[#e2e8f0] bg-white">
          {(["list","grid"] as const).map(v => {
            const Icon = v === "list" ? LayoutList : LayoutGrid;
            return (
              <button key={v} onClick={() => setView(v)}
                className="size-7 rounded flex items-center justify-center transition-colors"
                style={{ background: view === v ? primary : "transparent", color: view === v ? "white" : "#64748b" }}>
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
        <span className="text-[13px] text-[#64748b]">{filtered.length} kết quả</span>
      </div>

      {/* ── List / Grid ── */}
      {view === "list" ? (
        <div className="ds-card ds-card-default rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Tên tập thể","Loại","Đơn vị chủ quản","Nhân sự","Điểm TB","Danh hiệu đề xuất","Trạng thái",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const st = STATUS_MAP[t.trangThai];
                const StIcon = st.icon;
                return (
                  <tr key={t.id}
                    className="border-t border-[#e2e8f0] cursor-pointer transition-colors row-clickable"
                    onClick={() => setDetail(t)}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{t.ten}</div>
                      <div className="text-[12px] text-[#64748b]">{t.truongDon}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-neutral text-[11px]">{LOAI_MAP[t.loai]}</span>
                    </td>
                    <td className="px-4 py-3 text-[#475569]">{t.donViCha}</td>
                    <td className="px-4 py-3 text-[#475569]">{t.soNhanSu}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: t.diemTB >= 90 ? "#16a34a" : t.diemTB >= 80 ? "#d97706" : "#dc2626" }}>
                        {t.diemTB}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#475569] max-w-[200px] truncate">{t.danhHieuDeXuat}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[12px] font-medium w-fit px-2 py-1 rounded-full"
                        style={{ background: st.bg, color: st.color }}>
                        <StIcon className="size-3" />{st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-[#64748b] hover:text-[#1C5FBE] transition-colors" onClick={e => { e.stopPropagation(); setDetail(t); }}>
                        <ChevronRight className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#64748b] text-[14px]">Không tìm thấy tập thể nào</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(t => {
            const st = STATUS_MAP[t.trangThai];
            const StIcon = st.icon;
            return (
              <div key={t.id}
                className="ds-card ds-card-default rounded-xl p-5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                onClick={() => setDetail(t)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "#f0f4ff" }}>
                    <Building2 className="size-5" style={{ color: primary }} />
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: st.bg, color: st.color }}>
                    <StIcon className="size-3" />{st.label}
                  </span>
                </div>
                <h3 className="text-[14px] font-semibold text-slate-900 mb-1 leading-snug">{t.ten}</h3>
                <p className="text-[12px] text-[#64748b] mb-3">{t.donViCha}</p>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="bg-[#f8fafc] rounded-lg p-2 text-center">
                    <div className="font-bold text-[16px] text-slate-900">{t.soNhanSu}</div>
                    <div className="text-[#64748b]">nhân sự</div>
                  </div>
                  <div className="bg-[#f8fafc] rounded-lg p-2 text-center">
                    <div className="font-bold text-[16px]" style={{ color: t.diemTB >= 90 ? "#16a34a" : "#d97706" }}>{t.diemTB}</div>
                    <div className="text-[#64748b]">điểm TB</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#64748b]">Hoàn thiện hồ sơ</span>
                    <span className="font-semibold text-slate-900">{t.completeness}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${t.completeness}%`, background: primary }} />
                  </div>
                </div>
                {t.khenThuong.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[12px]" style={{ color: "#d4a84b" }}>
                    <Trophy className="size-3" />
                    <span className="text-[#64748b]">{t.khenThuong.length} khen thưởng</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail drawer */}
      {detail && <DetailDrawer tapThe={detail} onClose={() => setDetail(null)} />}

      {/* Add modal placeholder */}
      {showAdd && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[520px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-slate-900">Thêm hồ sơ tập thể</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#64748b] hover:text-slate-900"><X className="size-5" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Tên tập thể", placeholder: "VD: Phòng Tổ chức – Nhân sự" },
                { label: "Đơn vị chủ quản", placeholder: "VD: Sở Nội vụ" },
                { label: "Trưởng đơn vị", placeholder: "Họ và tên" },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">{f.label}</label>
                  <input className="ds-input w-full" placeholder={f.placeholder} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Loại</label>
                  <select className="ds-input w-full">
                    {Object.entries(LOAI_MAP).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Số nhân sự</label>
                  <input type="number" className="ds-input w-full" placeholder="0" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn btn-secondary btn-md flex-1">Hủy</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-primary btn-md flex-1">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
