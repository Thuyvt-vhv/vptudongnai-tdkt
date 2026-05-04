import { useState } from "react";
import {
  Search, Download, Plus, Medal, Star, Award, Trophy,
  ChevronRight, X, CalendarDays, Building2, User,
  Filter, TrendingUp, FileText, Upload,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type LoaiTT = "huan-chuong" | "bang-khen" | "giai-thuong" | "danh-hieu" | "co-thi-dua";
interface ThanhTich {
  id: string;
  ten: string;             // tên cán bộ hoặc tập thể
  loaiDoiTuong: "ca-nhan" | "tap-the";
  donVi: string;
  loaiThanhTich: LoaiTT;
  tenThanhTich: string;
  capKhen: "nha-nuoc" | "bo" | "tinh" | "co-so";
  nam: number;
  soQD: string;
  coQuanRaQD: string;
  moTa?: string;
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const THANH_TICH_LIST: ThanhTich[] = [
  { id: "tt1", ten: "Lê Thị Thanh Xuân",    loaiDoiTuong: "ca-nhan", donVi: "Sở GD&ĐT",         loaiThanhTich: "danh-hieu",   tenThanhTich: "CSTĐ cấp Tỉnh",         capKhen: "tinh",     nam: 2023, soQD: "001/QĐ-TU-2023",         coQuanRaQD: "Tỉnh ủy Đồng Nai" },
  { id: "tt2", ten: "Phạm Hoàng Liêm",       loaiDoiTuong: "ca-nhan", donVi: "Sở KH&ĐT",         loaiThanhTich: "huan-chuong", tenThanhTich: "Huân chương LĐ hạng Ba", capKhen: "nha-nuoc", nam: 2024, soQD: "200/QĐ-CTN-2024",        coQuanRaQD: "Chủ tịch nước" },
  { id: "tt3", ten: "Nguyễn Phú Trọng Khoa", loaiDoiTuong: "ca-nhan", donVi: "BV Đa khoa ĐN",    loaiThanhTich: "bang-khen",   tenThanhTich: "Bằng khen Bộ Y tế",     capKhen: "bo",       nam: 2022, soQD: "BK-YT-2022-233",         coQuanRaQD: "Bộ Y tế" },
  { id: "tt4", ten: "Phòng Tổ chức – CB",    loaiDoiTuong: "tap-the", donVi: "VP Tỉnh ủy",       loaiThanhTich: "co-thi-dua",  tenThanhTich: "Cờ thi đua UBND Tỉnh",  capKhen: "tinh",     nam: 2023, soQD: "188/QĐ-UBND-2023",       coQuanRaQD: "UBND Tỉnh Đồng Nai" },
  { id: "tt5", ten: "Ban Tuyên giáo",        loaiDoiTuong: "tap-the", donVi: "Tỉnh ủy ĐN",       loaiThanhTich: "huan-chuong", tenThanhTich: "Huân chương LĐ hạng Ba", capKhen: "nha-nuoc", nam: 2024, soQD: "155/QĐ-CTN-2024",        coQuanRaQD: "Chủ tịch nước" },
  { id: "tt6", ten: "Trần Thị Mai Hương",    loaiDoiTuong: "ca-nhan", donVi: "Ban Tuyên giáo",   loaiThanhTich: "bang-khen",   tenThanhTich: "Bằng khen UBND Tỉnh",   capKhen: "tinh",     nam: 2023, soQD: "045/QĐ-TU-2023",         coQuanRaQD: "UBND Tỉnh Đồng Nai" },
  { id: "tt7", ten: "Đinh Xuân Long",        loaiDoiTuong: "ca-nhan", donVi: "TT CNTT",           loaiThanhTich: "giai-thuong", tenThanhTich: "Giải thưởng CĐS QG",     capKhen: "nha-nuoc", nam: 2024, soQD: "GT-CDS-2024-07",          coQuanRaQD: "Bộ TT&TT" },
  { id: "tt8", ten: "Nguyễn Thị Bích Liên",  loaiDoiTuong: "ca-nhan", donVi: "Ban Dân vận",      loaiThanhTich: "co-thi-dua",  tenThanhTich: "Cờ thi đua UBND Tỉnh",  capKhen: "tinh",     nam: 2024, soQD: "210/QĐ-UBND-2024",       coQuanRaQD: "UBND Tỉnh Đồng Nai" },
  { id: "tt9", ten: "Ban Dân vận",           loaiDoiTuong: "tap-the", donVi: "Tỉnh ủy ĐN",       loaiThanhTich: "co-thi-dua",  tenThanhTich: "Cờ thi đua UBND Tỉnh",  capKhen: "tinh",     nam: 2021, soQD: "195/QĐ-UBND-2021",       coQuanRaQD: "UBND Tỉnh Đồng Nai" },
  { id: "tt10",ten: "Phan Thị Hồng Nhung",   loaiDoiTuong: "ca-nhan", donVi: "Ban Tuyên giáo",   loaiThanhTich: "danh-hieu",   tenThanhTich: "CSTĐ cấp Tỉnh",         capKhen: "tinh",     nam: 2024, soQD: "047/QĐ-TU-2024",         coQuanRaQD: "Tỉnh ủy Đồng Nai" },
  { id: "tt11",ten: "Trần Quang Vinh",       loaiDoiTuong: "ca-nhan", donVi: "Sở Xây dựng",      loaiThanhTich: "bang-khen",   tenThanhTich: "Bằng khen Bộ Xây dựng", capKhen: "bo",       nam: 2022, soQD: "BK-XD-2022-057",         coQuanRaQD: "Bộ Xây dựng" },
  { id: "tt12",ten: "Phòng Quản lý Đô thị",  loaiDoiTuong: "tap-the", donVi: "Sở Xây dựng",      loaiThanhTich: "danh-hieu",   tenThanhTich: "Tập thể LĐXS",           capKhen: "tinh",     nam: 2023, soQD: "091/QĐ-XD-2023",         coQuanRaQD: "Sở Xây dựng" },
];

const LOAI_TT_MAP: Record<LoaiTT, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  "huan-chuong": { label: "Huân chương",       color: "#b45309", icon: ({ className }) => <Medal className={className} /> },
  "bang-khen":   { label: "Bằng khen",         color: "#1C5FBE", icon: ({ className }) => <FileText className={className} /> },
  "giai-thuong": { label: "Giải thưởng",       color: "#7c3aed", icon: ({ className }) => <Trophy className={className} /> },
  "danh-hieu":   { label: "Danh hiệu TĐKT",    color: "#16a34a", icon: ({ className }) => <Star className={className} /> },
  "co-thi-dua":  { label: "Cờ thi đua",        color: "#c8102e", icon: ({ className }) => <Award className={className} /> },
};

const CAP_MAP: Record<string, { label: string; color: string }> = {
  "nha-nuoc": { label: "Nhà nước", color: "#7c3aed" },
  "bo":       { label: "Cấp Bộ",  color: "#1C5FBE" },
  "tinh":     { label: "Cấp Tỉnh",color: "#16a34a" },
  "co-so":    { label: "Cơ sở",   color: "#64748b" },
};

export function ThanhTichPage({ user }: { user: LoginUser }) {
  const { primary } = useTheme();
  const [list] = useState<ThanhTich[]>(THANH_TICH_LIST);
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState<string>("all");
  const [filterCap, setFilterCap] = useState<string>("all");
  const [filterNam, setFilterNam] = useState<string>("all");
  const [filterDT, setFilterDT] = useState<string>("all");

  const filtered = list.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.ten.toLowerCase().includes(q) || t.donVi.toLowerCase().includes(q) || t.tenThanhTich.toLowerCase().includes(q);
    const matchLoai = filterLoai === "all" || t.loaiThanhTich === filterLoai;
    const matchCap = filterCap === "all" || t.capKhen === filterCap;
    const matchNam = filterNam === "all" || t.nam.toString() === filterNam;
    const matchDT = filterDT === "all" || t.loaiDoiTuong === filterDT;
    return matchQ && matchLoai && matchCap && matchNam && matchDT;
  });

  const stats = {
    total: list.length,
    huanChuong: list.filter(t => t.loaiThanhTich === "huan-chuong").length,
    bangKhen: list.filter(t => t.loaiThanhTich === "bang-khen" || t.loaiThanhTich === "co-thi-dua").length,
    danhHieu: list.filter(t => t.loaiThanhTich === "danh-hieu").length,
    nhaNuoc: list.filter(t => t.capKhen === "nha-nuoc").length,
  };

  const canEdit = ["quản trị hệ thống","lãnh đạo cấp cao","lãnh đạo đơn vị"].includes(user.role);

  return (
    <div className="px-6 py-6 space-y-5 max-w-screen-xl">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">Thành tích Khen thưởng</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Kho lưu trữ toàn bộ thành tích khen thưởng cá nhân và tập thể</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm flex items-center gap-1.5"><Upload className="size-3.5" />Nhập Excel</button>
          <button className="btn btn-secondary btn-sm flex items-center gap-1.5"><Download className="size-3.5" />Xuất Excel</button>
          {canEdit && (
            <button className="btn btn-primary btn-sm flex items-center gap-1.5"><Plus className="size-3.5" />Thêm mới</button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Tổng thành tích", value: stats.total,      color: "#1C5FBE", icon: Award },
          { label: "Huân chương",     value: stats.huanChuong, color: "#b45309", icon: Medal },
          { label: "Bằng khen / Cờ",  value: stats.bangKhen,   color: "#1C5FBE", icon: FileText },
          { label: "Danh hiệu TĐKT",  value: stats.danhHieu,   color: "#16a34a", icon: Star },
          { label: "Cấp Nhà nước",    value: stats.nhaNuoc,    color: "#7c3aed", icon: Trophy },
        ].map(kpi => {
          const KIcon = kpi.icon;
          return (
            <div key={kpi.label} className="ds-card ds-card-default rounded-xl p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: kpi.color + "20" }}>
                <KIcon className="size-5" style={{ color: kpi.color }} />
              </div>
              <div>
                <div className="text-[22px] font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-[11px] text-[#64748b]">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]" />
          <input className="ds-input ds-input-sm w-full pl-9" placeholder="Tìm tên, đơn vị, thành tích…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ds-input ds-input-sm" value={filterDT} onChange={e => setFilterDT(e.target.value)}>
          <option value="all">Cá nhân & Tập thể</option>
          <option value="ca-nhan">Cá nhân</option>
          <option value="tap-the">Tập thể</option>
        </select>
        <select className="ds-input ds-input-sm" value={filterLoai} onChange={e => setFilterLoai(e.target.value)}>
          <option value="all">Tất cả loại</option>
          {Object.entries(LOAI_TT_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="ds-input ds-input-sm" value={filterCap} onChange={e => setFilterCap(e.target.value)}>
          <option value="all">Tất cả cấp</option>
          {Object.entries(CAP_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="ds-input ds-input-sm" value={filterNam} onChange={e => setFilterNam(e.target.value)}>
          <option value="all">Tất cả năm</option>
          {[2024,2023,2022,2021].map(y => <option key={y}>{y}</option>)}
        </select>
        <span className="ml-auto text-[13px] text-[#64748b]">{filtered.length} thành tích</span>
      </div>

      {/* Table */}
      <div className="ds-card ds-card-default rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Người/Tập thể","Loại","Thành tích","Cấp khen","Năm","Số QĐ","Cơ quan ban hành"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const lt = LOAI_TT_MAP[t.loaiThanhTich];
              const cap = CAP_MAP[t.capKhen];
              const LIcon = lt.icon;
              return (
                <tr key={t.id} className="border-t border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: t.loaiDoiTuong === "ca-nhan" ? "#f0f4ff" : "#f0fdf4" }}>
                        {t.loaiDoiTuong === "ca-nhan"
                          ? <User className="size-3.5 text-[#1C5FBE]" />
                          : <Building2 className="size-3.5 text-[#16a34a]" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{t.ten}</div>
                        <div className="text-[11px] text-[#64748b]">{t.donVi}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-[11px] font-medium">
                      <LIcon className="size-3.5" style={{ color: lt.color }} />
                      <span style={{ color: lt.color }}>{lt.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{t.tenThanhTich}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: cap.color + "20", color: cap.color }}>{cap.label}</span>
                  </td>
                  <td className="px-4 py-3 text-[#475569] font-mono">{t.nam}</td>
                  <td className="px-4 py-3 text-[#475569] text-[12px]">{t.soQD}</td>
                  <td className="px-4 py-3 text-[#64748b] max-w-[160px] truncate">{t.coQuanRaQD}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#64748b] text-[14px]">Không tìm thấy thành tích nào</div>
        )}
      </div>
    </div>
  );
}
