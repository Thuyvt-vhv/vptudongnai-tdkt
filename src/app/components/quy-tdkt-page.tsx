import { useState } from "react";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Search,
  Download, ChevronRight, X, Check, AlertCircle, Clock,
  CheckCircle2, XCircle, FileText, Building2, CalendarDays,
  BarChart3, ArrowUpCircle, ArrowDownCircle, Eye, Edit3,
  Printer, RefreshCw, Filter, ChevronDown, BadgeDollarSign,
  Receipt, BookOpen, Info,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type TabId = "nguon" | "kehoach" | "giaingan" | "quyettoan";
type LoaiNguon = "trich-luong" | "ngan-sach" | "dong-gop" | "khac";
type TrangThaiThu = "da-ghi-nhan" | "cho-xac-nhan";
type TrangThaiKH = "cho-duyet" | "da-duyet" | "dang-thuc-hien" | "hoan-thanh";
export type TrangThaiGN = "cho-giai-ngan" | "da-giai-ngan" | "hoan-tra";

interface ThuQuy {
  id: string;
  ngay: string;
  loaiNguon: LoaiNguon;
  donVi: string;
  soTien: number; // triệu VND
  nguoiNhap: string;
  ghiChu: string;
  trangThai: TrangThaiThu;
}

interface HangMucDuToan {
  ten: string;
  duToan: number;
  daThucChi: number;
}

interface KeHoachQuy {
  id: string;
  ky: string;
  moTa: string;
  namTaiChinh: number;
  tongDuToan: number;
  daThucChi: number;
  hangMucs: HangMucDuToan[];
  trangThai: TrangThaiKH;
  nguoiLap: string;
  ngayLap: string;
  nguoiDuyet?: string;
  ngayDuyet?: string;
  ghiChu?: string;
}

export interface PhieuChi {
  id: string;
  soPhieu: string;
  ngay: string;
  quyetDinhSo: string;
  nguoiNhan: string;
  donVi: string;
  danhHieu: string;
  soTien: number;
  trangThai: TrangThaiGN;
  nguoiXacNhan?: string;
  ngayXacNhan?: string;
  lyDoHoanTra?: string;
}

interface PeriodQT {
  ky: string;
  tongThu: number;
  tongChi: number;
  tonDau: number;
  tonCuoi: number;
  chiTietThu: { loai: string; soTien: number }[];
  chiTietChi: { loai: string; soTien: number }[];
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const MOCK_THU_QUY: ThuQuy[] = [
  { id:"t1", ngay:"05/01/2025", loaiNguon:"trich-luong", donVi:"Văn phòng UBND tỉnh", soTien:85, nguoiNhap:"Lê Thị Mai", ghiChu:"Trích 10% quỹ lương tháng 1/2025", trangThai:"da-ghi-nhan" },
  { id:"t2", ngay:"05/02/2025", loaiNguon:"trich-luong", donVi:"Văn phòng UBND tỉnh", soTien:85, nguoiNhap:"Lê Thị Mai", ghiChu:"Trích 10% quỹ lương tháng 2/2025", trangThai:"da-ghi-nhan" },
  { id:"t3", ngay:"10/02/2025", loaiNguon:"ngan-sach", donVi:"Sở Tài chính Đồng Nai", soTien:200, nguoiNhap:"Nguyễn Văn An", ghiChu:"Ngân sách tỉnh cấp bổ sung quỹ TĐKT năm 2025", trangThai:"da-ghi-nhan" },
  { id:"t4", ngay:"05/03/2025", loaiNguon:"trich-luong", donVi:"Văn phòng UBND tỉnh", soTien:85, nguoiNhap:"Lê Thị Mai", ghiChu:"Trích 10% quỹ lương tháng 3/2025", trangThai:"da-ghi-nhan" },
  { id:"t5", ngay:"15/03/2025", loaiNguon:"dong-gop", donVi:"Công đoàn cơ sở", soTien:30, nguoiNhap:"Trần Thị Hoa", ghiChu:"Đóng góp tự nguyện Q1/2025", trangThai:"da-ghi-nhan" },
  { id:"t6", ngay:"05/04/2025", loaiNguon:"trich-luong", donVi:"Văn phòng UBND tỉnh", soTien:85, nguoiNhap:"Lê Thị Mai", ghiChu:"Trích 10% quỹ lương tháng 4/2025", trangThai:"da-ghi-nhan" },
  { id:"t7", ngay:"20/04/2025", loaiNguon:"ngan-sach", donVi:"UBND tỉnh Đồng Nai", soTien:150, nguoiNhap:"Nguyễn Văn An", ghiChu:"Phân bổ thêm đợt 2 — Nghị quyết 45/NQ-HĐND", trangThai:"da-ghi-nhan" },
  { id:"t8", ngay:"05/05/2025", loaiNguon:"trich-luong", donVi:"Văn phòng UBND tỉnh", soTien:88, nguoiNhap:"Lê Thị Mai", ghiChu:"Trích 10% quỹ lương tháng 5/2025", trangThai:"cho-xac-nhan" },
  { id:"t9", ngay:"12/05/2025", loaiNguon:"dong-gop", donVi:"Hội Cựu chiến binh", soTien:20, nguoiNhap:"Phạm Quốc Hùng", ghiChu:"Đóng góp quỹ khen thưởng thành tích chiến sĩ thi đua", trangThai:"cho-xac-nhan" },
  { id:"t10",ngay:"02/05/2025", loaiNguon:"khac", donVi:"Các đơn vị trực thuộc", soTien:22, nguoiNhap:"Trần Thị Hoa", ghiChu:"Thu lãi tiền gửi ngân hàng tháng 4/2025", trangThai:"cho-xac-nhan" },
];

const MOCK_KE_HOACH: KeHoachQuy[] = [
  {
    id:"kh1", ky:"Quý I/2025", moTa:"Khen thưởng đợt 1 – Phong trào Thi đua chào mừng 26/3", namTaiChinh:2025,
    tongDuToan:120, daThucChi:115,
    hangMucs:[
      { ten:"Tiền thưởng cá nhân xuất sắc", duToan:60, daThucChi:58 },
      { ten:"Tiền thưởng tập thể", duToan:40, daThucChi:40 },
      { ten:"Chi phí tổ chức lễ khen thưởng", duToan:15, daThucChi:14 },
      { ten:"Mua sắm hiện vật khen thưởng", duToan:5, daThucChi:3 },
    ],
    trangThai:"hoan-thanh", nguoiLap:"Lê Thị Mai", ngayLap:"05/01/2025",
    nguoiDuyet:"Nguyễn Văn An", ngayDuyet:"10/01/2025",
    ghiChu:"Hoàn thành đúng tiến độ, tiết kiệm 5M so với dự toán.",
  },
  {
    id:"kh2", ky:"Quý II/2025", moTa:"Khen thưởng đợt 2 – Sơ kết 6 tháng đầu năm", namTaiChinh:2025,
    tongDuToan:180, daThucChi:120,
    hangMucs:[
      { ten:"Tiền thưởng cá nhân", duToan:90, daThucChi:65 },
      { ten:"Tiền thưởng tập thể", duToan:55, daThucChi:40 },
      { ten:"Chi phí tổ chức", duToan:25, daThucChi:12 },
      { ten:"Hiện vật khen thưởng", duToan:10, daThucChi:3 },
    ],
    trangThai:"dang-thuc-hien", nguoiLap:"Lê Thị Mai", ngayLap:"02/04/2025",
    nguoiDuyet:"Nguyễn Văn An", ngayDuyet:"08/04/2025",
  },
  {
    id:"kh3", ky:"Quý III/2025", moTa:"Khen thưởng đợt 3 – Phong trào thi đua chào mừng 2/9", namTaiChinh:2025,
    tongDuToan:200, daThucChi:0,
    hangMucs:[
      { ten:"Tiền thưởng cá nhân", duToan:100, daThucChi:0 },
      { ten:"Tiền thưởng tập thể", duToan:65, daThucChi:0 },
      { ten:"Chi phí tổ chức", duToan:25, daThucChi:0 },
      { ten:"Hiện vật khen thưởng", duToan:10, daThucChi:0 },
    ],
    trangThai:"cho-duyet", nguoiLap:"Lê Thị Mai", ngayLap:"01/05/2025",
  },
  {
    id:"kh4", ky:"Quý IV/2025", moTa:"Tổng kết năm – Khen thưởng cá nhân và tập thể tiêu biểu năm 2025", namTaiChinh:2025,
    tongDuToan:280, daThucChi:0,
    hangMucs:[
      { ten:"Tiền thưởng chiến sĩ thi đua các cấp", duToan:130, daThucChi:0 },
      { ten:"Tiền thưởng Bằng khen UBND tỉnh", duToan:80, daThucChi:0 },
      { ten:"Chi phí tổ chức Hội nghị Thi đua", duToan:50, daThucChi:0 },
      { ten:"Hiện vật, quà tặng khen thưởng", duToan:20, daThucChi:0 },
    ],
    trangThai:"cho-duyet", nguoiLap:"Lê Thị Mai", ngayLap:"01/05/2025",
  },
];

export const INIT_PHIEU_CHI: PhieuChi[] = [
  { id:"pc1", soPhieu:"PC-001/2025", ngay:"28/01/2025", quyetDinhSo:"QĐ-012/VPUBND", nguoiNhan:"Trần Thị Hoa", donVi:"Phòng TĐKT", danhHieu:"Chiến sĩ thi đua cơ sở", soTien:4, trangThai:"da-giai-ngan", nguoiXacNhan:"Lê Thị Mai", ngayXacNhan:"29/01/2025" },
  { id:"pc2", soPhieu:"PC-002/2025", ngay:"28/01/2025", quyetDinhSo:"QĐ-012/VPUBND", nguoiNhan:"Nguyễn Bá Thanh", donVi:"Phòng Hành chính", danhHieu:"Lao động tiên tiến", soTien:2, trangThai:"da-giai-ngan", nguoiXacNhan:"Lê Thị Mai", ngayXacNhan:"29/01/2025" },
  { id:"pc3", soPhieu:"PC-003/2025", ngay:"28/01/2025", quyetDinhSo:"QĐ-012/VPUBND", nguoiNhan:"Lê Văn Hải", donVi:"Văn phòng", danhHieu:"Lao động tiên tiến", soTien:2, trangThai:"da-giai-ngan", nguoiXacNhan:"Lê Thị Mai", ngayXacNhan:"29/01/2025" },
  { id:"pc4", soPhieu:"PC-004/2025", ngay:"28/01/2025", quyetDinhSo:"QĐ-012/VPUBND", nguoiNhan:"Tổ CNTT", donVi:"Trung tâm CNTT", danhHieu:"Tập thể Lao động xuất sắc", soTien:10, trangThai:"da-giai-ngan", nguoiXacNhan:"Lê Thị Mai", ngayXacNhan:"29/01/2025" },
  { id:"pc5", soPhieu:"PC-005/2025", ngay:"15/03/2025", quyetDinhSo:"QĐ-028/VPUBND", nguoiNhan:"Phạm Quốc Hùng", donVi:"Ban Tổ chức", danhHieu:"Bằng khen UBND tỉnh", soTien:6, trangThai:"da-giai-ngan", nguoiXacNhan:"Nguyễn Văn An", ngayXacNhan:"17/03/2025" },
  { id:"pc6", soPhieu:"PC-006/2025", ngay:"15/03/2025", quyetDinhSo:"QĐ-028/VPUBND", nguoiNhan:"Phòng Kế hoạch", donVi:"Phòng Kế hoạch", danhHieu:"Cờ thi đua của UBND tỉnh", soTien:15, trangThai:"da-giai-ngan", nguoiXacNhan:"Nguyễn Văn An", ngayXacNhan:"17/03/2025" },
  { id:"pc7", soPhieu:"PC-007/2025", ngay:"20/04/2025", quyetDinhSo:"QĐ-045/VPUBND", nguoiNhan:"Đinh Xuân Long", donVi:"Trung tâm CNTT", danhHieu:"Chiến sĩ thi đua cơ sở", soTien:4, trangThai:"da-giai-ngan", nguoiXacNhan:"Lê Thị Mai", ngayXacNhan:"22/04/2025" },
  { id:"pc8", soPhieu:"PC-008/2025", ngay:"20/04/2025", quyetDinhSo:"QĐ-045/VPUBND", nguoiNhan:"Nguyễn Thị Lan", donVi:"Phòng Nội vụ", danhHieu:"Lao động tiên tiến", soTien:2, trangThai:"hoan-tra", lyDoHoanTra:"Người nhận đã nghỉ việc — hoàn trả quỹ" },
  { id:"pc9", soPhieu:"PC-009/2025", ngay:"05/05/2025", quyetDinhSo:"QĐ-061/VPUBND", nguoiNhan:"Võ Thị Bích", donVi:"Phòng TĐKT", danhHieu:"Chiến sĩ thi đua cơ sở", soTien:4, trangThai:"cho-giai-ngan" },
  { id:"pc10",soPhieu:"PC-010/2025", ngay:"05/05/2025", quyetDinhSo:"QĐ-061/VPUBND", nguoiNhan:"Tổ văn thư", donVi:"Văn phòng", danhHieu:"Tập thể Lao động xuất sắc", soTien:10, trangThai:"cho-giai-ngan" },
  { id:"pc11",soPhieu:"PC-011/2025", ngay:"05/05/2025", quyetDinhSo:"QĐ-061/VPUBND", nguoiNhan:"Hoàng Anh Tuấn", donVi:"Ban TĐKT", danhHieu:"Bằng khen UBND tỉnh", soTien:6, trangThai:"cho-giai-ngan" },
  { id:"pc12",soPhieu:"PC-012/2025", ngay:"05/05/2025", quyetDinhSo:"QĐ-061/VPUBND", nguoiNhan:"Phòng Tài chính", donVi:"Sở Tài chính", danhHieu:"Cờ thi đua của UBND tỉnh", soTien:15, trangThai:"cho-giai-ngan" },
];

const MOCK_QUYET_TOAN: PeriodQT[] = [
  {
    ky:"Quý I/2025", tongThu:400, tongChi:115, tonDau:0, tonCuoi:285,
    chiTietThu:[
      { loai:"Trích quỹ lương (3 tháng)", soTien:255 },
      { loai:"Ngân sách tỉnh cấp", soTien:115 },
      { loai:"Đóng góp tự nguyện", soTien:30 },
    ],
    chiTietChi:[
      { loai:"Tiền thưởng cá nhân", soTien:58 },
      { loai:"Tiền thưởng tập thể", soTien:40 },
      { loai:"Chi phí tổ chức", soTien:14 },
      { loai:"Hiện vật khen thưởng", soTien:3 },
    ],
  },
  {
    ky:"Quý II/2025 (tạm tính)", tongThu:453, tongChi:205, tonDau:285, tonCuoi:533,
    chiTietThu:[
      { loai:"Trích quỹ lương (tháng 4, 5)", soTien:173 },
      { loai:"Ngân sách bổ sung", soTien:150 },
      { loai:"Đóng góp & lãi tiền gửi", soTien:130 },
    ],
    chiTietChi:[
      { loai:"Tiền thưởng cá nhân", soTien:65 },
      { loai:"Tiền thưởng tập thể", soTien:40 },
      { loai:"Chi phí tổ chức", soTien:12 },
      { loai:"Hiện vật khen thưởng", soTien:3 },
      { loai:"Phiếu chi chờ giải ngân", soTien:85 },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const fmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(2)} tỷ` : `${n.toLocaleString("vi-VN")}M`;

const fmtShort = (n: number) => `${n.toLocaleString("vi-VN")}M`;

function loaiNguonLabel(l: LoaiNguon) {
  return { "trich-luong":"Trích quỹ lương", "ngan-sach":"Ngân sách", "dong-gop":"Đóng góp", "khac":"Khác" }[l];
}
function loaiNguonColor(l: LoaiNguon) {
  return { "trich-luong":"badge-primary", "ngan-sach":"badge-success", "dong-gop":"badge-info", "khac":"badge-neutral" }[l];
}
function trangThaiKHLabel(t: TrangThaiKH) {
  return { "cho-duyet":"Chờ duyệt", "da-duyet":"Đã duyệt", "dang-thuc-hien":"Đang thực hiện", "hoan-thanh":"Hoàn thành" }[t];
}
function trangThaiKHColor(t: TrangThaiKH) {
  return { "cho-duyet":"badge-warning", "da-duyet":"badge-primary", "dang-thuc-hien":"badge-info", "hoan-thanh":"badge-success" }[t];
}
function trangThaiGNColor(t: TrangThaiGN) {
  return { "cho-giai-ngan":"badge-warning", "da-giai-ngan":"badge-success", "hoan-tra":"badge-error" }[t];
}
function trangThaiGNLabel(t: TrangThaiGN) {
  return { "cho-giai-ngan":"Chờ giải ngân", "da-giai-ngan":"Đã giải ngân", "hoan-tra":"Hoàn trả" }[t];
}

function ProgressBar({ value, max, color = "#1a7f4e" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-semibold text-[#475569] w-8 text-right">{pct}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

/* ── Tab: Nguồn quỹ ─────────────────────────────────────────── */
function NguonQuyTab({ user, data }: { user: LoginUser; data: ThuQuy[] }) {
  const [search, setSearch] = useState("");
  const [loaiFilter, setLoaiFilter] = useState<"" | LoaiNguon>("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ngay:"", loaiNguon:"trich-luong" as LoaiNguon, soTien:"", donVi:"", ghiChu:"" });
  const canEdit = ["quản trị hệ thống","lãnh đạo cấp cao","hội đồng"].includes(user.role);

  const filtered = data.filter(t =>
    (!search || t.donVi.toLowerCase().includes(search.toLowerCase()) || t.ghiChu.toLowerCase().includes(search.toLowerCase())) &&
    (!loaiFilter || t.loaiNguon === loaiFilter)
  );

  const tongThu = data.filter(t => t.trangThai === "da-ghi-nhan").reduce((s, t) => s + t.soTien, 0);
  const choXN   = data.filter(t => t.trangThai === "cho-xac-nhan").reduce((s, t) => s + t.soTien, 0);

  // Monthly aggregation for mini chart
  const byMonth: Record<string, number> = {};
  data.filter(t => t.trangThai === "da-ghi-nhan").forEach(t => {
    const m = t.ngay.substring(3, 10); // "MM/YYYY"
    byMonth[m] = (byMonth[m] || 0) + t.soTien;
  });
  const months = Object.entries(byMonth).sort(([a], [b]) => {
    const [ma, ya] = a.split("/").map(Number);
    const [mb, yb] = b.split("/").map(Number);
    return ya !== yb ? ya - yb : ma - mb;
  });
  const maxVal = Math.max(...months.map(([,v]) => v), 1);

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Tổng thu đã ghi nhận", value:tongThu, icon:ArrowUpCircle, color:"#1a7f4e", bg:"#f0fdf4" },
          { label:"Chờ xác nhận", value:choXN, icon:Clock, color:"#b45309", bg:"#fffbeb" },
          { label:"Trích quỹ lương", value:data.filter(t=>t.loaiNguon==="trich-luong"&&t.trangThai==="da-ghi-nhan").reduce((s,t)=>s+t.soTien,0), icon:BadgeDollarSign, color:"#1e40af", bg:"#eff6ff" },
          { label:"Ngân sách & khác", value:data.filter(t=>t.loaiNguon!=="trich-luong"&&t.trangThai==="da-ghi-nhan").reduce((s,t)=>s+t.soTien,0), icon:Building2, color:"#7c3aed", bg:"#faf5ff" },
        ].map(c => (
          <div key={c.label} className="ds-card ds-card-default ds-card-p-md flex items-center gap-3">
            <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.bg }}>
              <c.icon className="size-5" style={{ color: c.color }} />
            </div>
            <div>
              <p className="text-[11px] text-[#64748b]">{c.label}</p>
              <p className="text-[18px] font-bold" style={{ color: c.color }}>{fmtShort(c.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mini chart */}
      <div className="ds-card ds-card-default ds-card-p-md">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold text-[#334155]">Thu quỹ lũy kế theo tháng (triệu VND)</p>
          <span className="text-[11px] text-[#94a3b8]">Chỉ tính nguồn đã xác nhận</span>
        </div>
        <div className="flex items-end gap-2 h-24">
          {months.map(([month, val]) => (
            <div key={month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <span className="text-[10px] text-[#64748b] font-medium">{val}</span>
              <div
                className="w-full rounded-t-sm transition-all"
                style={{ height: `${Math.round((val / maxVal) * 72)}px`, background:"var(--color-primary-btn)", opacity:0.8 }}
              />
              <span className="text-[10px] text-[#94a3b8] whitespace-nowrap">{month.replace("/2025","")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + action bar */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <div className="relative shrink-0 w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]" />
          <input className="ds-input ds-input-sm pl-9 w-full" placeholder="Tìm đơn vị, ghi chú…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="ds-input ds-input-sm shrink-0" value={loaiFilter} onChange={e=>setLoaiFilter(e.target.value as any)}>
          <option value="">Tất cả nguồn</option>
          <option value="trich-luong">Trích quỹ lương</option>
          <option value="ngan-sach">Ngân sách</option>
          <option value="dong-gop">Đóng góp</option>
          <option value="khac">Khác</option>
        </select>
        <span className="ml-auto shrink-0 text-[12px] text-[#64748b]">{filtered.length} giao dịch</span>
        {canEdit && (
          <button className="btn btn-primary btn-sm shrink-0 flex items-center gap-1.5" onClick={()=>setShowForm(true)}>
            <Plus className="size-3.5" /> Thêm thu quỹ
          </button>
        )}
        <button className="btn btn-secondary btn-sm shrink-0 flex items-center gap-1.5">
          <Download className="size-3.5" /> Xuất Excel
        </button>
      </div>

      {/* Table */}
      <div className="ds-card ds-card-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]" style={{ minWidth:780 }}>
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                {["STT","Ngày","Loại nguồn","Đơn vị","Số tiền (M)","Người nhập","Ghi chú","Trạng thái"].map(h=>(
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors ${i%2===0?"":"bg-[#fafafa]"}`}>
                  <td className="px-3 py-2.5 text-[#94a3b8]">{i+1}</td>
                  <td className="px-3 py-2.5 text-[#334155] font-medium whitespace-nowrap">{t.ngay}</td>
                  <td className="px-3 py-2.5"><span className={`badge ${loaiNguonColor(t.loaiNguon)}`}>{loaiNguonLabel(t.loaiNguon)}</span></td>
                  <td className="px-3 py-2.5 text-[#475569]">{t.donVi}</td>
                  <td className="px-3 py-2.5 font-bold text-[#1a7f4e] text-right">{t.soTien.toLocaleString("vi-VN")}</td>
                  <td className="px-3 py-2.5 text-[#64748b]">{t.nguoiNhap}</td>
                  <td className="px-3 py-2.5 text-[#475569] max-w-[200px] truncate">{t.ghiChu}</td>
                  <td className="px-3 py-2.5">
                    {t.trangThai === "da-ghi-nhan"
                      ? <span className="flex items-center gap-1 text-[#1a7f4e] text-[12px]"><CheckCircle2 className="size-3.5"/>Đã ghi nhận</span>
                      : <span className="flex items-center gap-1 text-[#b45309] text-[12px]"><Clock className="size-3.5"/>Chờ xác nhận</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#f0fdf4] border-t-2 border-[#86efac]">
                <td colSpan={4} className="px-3 py-2.5 font-bold text-[#1a7f4e] text-[13px]">TỔNG CỘNG (đã ghi nhận)</td>
                <td className="px-3 py-2.5 font-bold text-[#1a7f4e] text-right text-[14px]">{tongThu.toLocaleString("vi-VN")}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-w-[95vw]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h3 className="font-bold text-[15px] text-[#1e293b]">Thêm khoản thu quỹ mới</h3>
              <button onClick={()=>setShowForm(false)} className="btn btn-ghost btn-sm size-8 p-0"><X className="size-4"/></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-[#475569] mb-1 block">Ngày thu *</label>
                  <input type="date" className="ds-input ds-input-sm w-full" value={form.ngay} onChange={e=>setForm({...form,ngay:e.target.value})}/>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#475569] mb-1 block">Loại nguồn *</label>
                  <select className="ds-input ds-input-sm w-full" value={form.loaiNguon} onChange={e=>setForm({...form,loaiNguon:e.target.value as LoaiNguon})}>
                    <option value="trich-luong">Trích quỹ lương</option>
                    <option value="ngan-sach">Ngân sách</option>
                    <option value="dong-gop">Đóng góp</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-[#475569] mb-1 block">Số tiền (triệu VND) *</label>
                  <input type="number" min="0" className="ds-input ds-input-sm w-full" placeholder="0" value={form.soTien} onChange={e=>setForm({...form,soTien:e.target.value})}/>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#475569] mb-1 block">Đơn vị nộp *</label>
                  <input className="ds-input ds-input-sm w-full" placeholder="Tên đơn vị" value={form.donVi} onChange={e=>setForm({...form,donVi:e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#475569] mb-1 block">Ghi chú / Căn cứ</label>
                <textarea className="ds-input ds-input-sm w-full resize-none" rows={2} placeholder="Ví dụ: Trích 10% quỹ lương tháng 6/2025" value={form.ghiChu} onChange={e=>setForm({...form,ghiChu:e.target.value})}/>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button className="btn btn-secondary btn-sm" onClick={()=>setShowForm(false)}>Huỷ</button>
                <button className="btn btn-primary btn-sm flex items-center gap-1.5" onClick={()=>setShowForm(false)}>
                  <Check className="size-3.5"/> Lưu khoản thu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tab: Kế hoạch ──────────────────────────────────────────── */
function KeHoachTab({ user, data }: { user: LoginUser; data: KeHoachQuy[] }) {
  const [selected, setSelected] = useState<KeHoachQuy | null>(null);
  const canEdit = ["quản trị hệ thống","lãnh đạo cấp cao","hội đồng"].includes(user.role);
  const canApprove = ["quản trị hệ thống","lãnh đạo cấp cao"].includes(user.role);

  const tongDuToan = data.reduce((s,k) => s+k.tongDuToan, 0);
  const tongThucChi = data.reduce((s,k) => s+k.daThucChi, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"Tổng dự toán năm 2025", value:tongDuToan, color:"#1e40af", bg:"#eff6ff", icon:BarChart3 },
          { label:"Đã thực chi", value:tongThucChi, color:"#b45309", bg:"#fffbeb", icon:ArrowDownCircle },
          { label:"Còn lại trong kế hoạch", value:tongDuToan-tongThucChi, color:"#1a7f4e", bg:"#f0fdf4", icon:PiggyBank },
        ].map(c=>(
          <div key={c.label} className="ds-card ds-card-default ds-card-p-md flex items-center gap-3">
            <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:c.bg }}>
              <c.icon className="size-5" style={{ color:c.color }}/>
            </div>
            <div>
              <p className="text-[11px] text-[#64748b]">{c.label}</p>
              <p className="text-[18px] font-bold" style={{ color:c.color }}>{fmtShort(c.value)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#1e293b]">Danh sách kế hoạch sử dụng quỹ — Năm 2025</h3>
        {canEdit && (
          <button className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Plus className="size-3.5"/> Tạo kế hoạch mới
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {data.map(kh => {
          const pct = kh.tongDuToan > 0 ? Math.round((kh.daThucChi/kh.tongDuToan)*100) : 0;
          const isOpen = selected?.id === kh.id;
          return (
            <div key={kh.id} className="ds-card ds-card-default overflow-hidden">
              {/* Header row */}
              <div
                className="ds-card-p-md flex items-center gap-3 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                onClick={()=>setSelected(isOpen ? null : kh)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-[14px] text-[#1e293b]">{kh.ky}</span>
                    <span className={`badge ${trangThaiKHColor(kh.trangThai)}`}>{trangThaiKHLabel(kh.trangThai)}</span>
                  </div>
                  <p className="text-[12px] text-[#64748b] truncate">{kh.moTa}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[11px] text-[#94a3b8]">Dự toán</p>
                    <p className="font-bold text-[14px] text-[#1e40af]">{fmtShort(kh.tongDuToan)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-[#94a3b8]">Thực chi</p>
                    <p className="font-bold text-[14px] text-[#b45309]">{fmtShort(kh.daThucChi)}</p>
                  </div>
                  <div className="w-28">
                    <p className="text-[11px] text-[#94a3b8] mb-1">Tiến độ</p>
                    <ProgressBar value={kh.daThucChi} max={kh.tongDuToan}
                      color={pct >= 90 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#1a7f4e"}
                    />
                  </div>
                  <ChevronDown className={`size-4 text-[#94a3b8] transition-transform ${isOpen?"rotate-180":""}`}/>
                </div>
              </div>

              {/* Detail panel */}
              {isOpen && (
                <div className="border-t border-[#e2e8f0] ds-card-p-md bg-[#fafafa]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Hạng mục */}
                    <div>
                      <p className="text-[12px] font-semibold text-[#475569] mb-2">Phân bổ dự toán theo hạng mục</p>
                      <div className="flex flex-col gap-2">
                        {kh.hangMucs.map(hm => (
                          <div key={hm.ten} className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[12px] text-[#334155]">{hm.ten}</span>
                              <span className="text-[12px] font-semibold text-[#475569]">
                                {fmtShort(hm.daThucChi)} / {fmtShort(hm.duToan)}
                              </span>
                            </div>
                            <ProgressBar value={hm.daThucChi} max={hm.duToan}/>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Metadata */}
                    <div className="flex flex-col gap-3">
                      <div className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
                        <p className="text-[11px] font-semibold text-[#94a3b8] uppercase mb-2">Thông tin phê duyệt</p>
                        <dl className="flex flex-col gap-1.5 text-[12px]">
                          <div className="flex justify-between"><dt className="text-[#64748b]">Người lập:</dt><dd className="font-medium text-[#334155]">{kh.nguoiLap}</dd></div>
                          <div className="flex justify-between"><dt className="text-[#64748b]">Ngày lập:</dt><dd className="font-medium text-[#334155]">{kh.ngayLap}</dd></div>
                          {kh.nguoiDuyet && <div className="flex justify-between"><dt className="text-[#64748b]">Người duyệt:</dt><dd className="font-medium text-[#1a7f4e]">{kh.nguoiDuyet}</dd></div>}
                          {kh.ngayDuyet && <div className="flex justify-between"><dt className="text-[#64748b]">Ngày duyệt:</dt><dd className="font-medium text-[#334155]">{kh.ngayDuyet}</dd></div>}
                        </dl>
                      </div>
                      {kh.ghiChu && (
                        <div className="bg-[#fffbeb] rounded-lg p-3 border border-[#fde68a] flex gap-2">
                          <Info className="size-4 text-[#b45309] shrink-0 mt-0.5"/>
                          <p className="text-[12px] text-[#92400e]">{kh.ghiChu}</p>
                        </div>
                      )}
                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        {canApprove && kh.trangThai === "cho-duyet" && (
                          <>
                            <button className="btn btn-primary btn-sm flex items-center gap-1"><CheckCircle2 className="size-3.5"/> Phê duyệt</button>
                            <button className="btn btn-ghost btn-sm flex items-center gap-1 text-[#ef4444]"><XCircle className="size-3.5"/> Yêu cầu điều chỉnh</button>
                          </>
                        )}
                        <button className="btn btn-secondary btn-sm flex items-center gap-1"><Download className="size-3.5"/> Xuất PDF</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tab: Giải ngân ─────────────────────────────────────────── */
function GiaiNganTab({ user, data, onUpdate }: {
  user: LoginUser;
  data: PhieuChi[];
  onUpdate?: (updated: PhieuChi[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | TrangThaiGN>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const canConfirm = ["quản trị hệ thống","lãnh đạo cấp cao","hội đồng"].includes(user.role);

  // Phiếu chi tự động từ phong trào (id bắt đầu bằng "pc-auto-")
  const autoCreated = data.filter(p => p.id.startsWith("pc-auto-") && p.trangThai === "cho-giai-ngan");

  const today = new Date().toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" }).replace(/\//g,"/");

  const confirmSelected = () => {
    if (!onUpdate || selected.size === 0) return;
    const updated = data.map(p =>
      selected.has(p.id)
        ? { ...p, trangThai:"da-giai-ngan" as TrangThaiGN, nguoiXacNhan: user.name, ngayXacNhan: today }
        : p
    );
    onUpdate(updated);
    setSelected(new Set());
  };

  const confirmOne = (id: string) => {
    if (!onUpdate) return;
    const updated = data.map(p =>
      p.id === id
        ? { ...p, trangThai:"da-giai-ngan" as TrangThaiGN, nguoiXacNhan: user.name, ngayXacNhan: today }
        : p
    );
    onUpdate(updated);
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const filtered = data.filter(p =>
    (!search || p.nguoiNhan.toLowerCase().includes(search.toLowerCase()) || p.quyetDinhSo.toLowerCase().includes(search.toLowerCase()) || p.soPhieu.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || p.trangThai === statusFilter)
  );

  const tongCho = data.filter(p=>p.trangThai==="cho-giai-ngan").reduce((s,p)=>s+p.soTien,0);
  const tongDa  = data.filter(p=>p.trangThai==="da-giai-ngan").reduce((s,p)=>s+p.soTien,0);
  const tongHoan= data.filter(p=>p.trangThai==="hoan-tra").reduce((s,p)=>s+p.soTien,0);

  const choItems = filtered.filter(p=>p.trangThai==="cho-giai-ngan");
  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const toggleAll = () => {
    if (choItems.every(p=>selected.has(p.id))) setSelected(new Set());
    else setSelected(new Set(choItems.map(p=>p.id)));
  };

  const selectedTotal = [...selected].reduce((s,id)=>{ const p=data.find(x=>x.id===id); return s+(p?.soTien||0); },0);

  return (
    <div className="flex flex-col gap-5">
      {/* Banner: phiếu tự động từ phong trào */}
      {autoCreated.length > 0 && (
        <div className="flex items-start gap-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-3">
          <Info className="size-4 text-[#1e40af] shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#1e40af]">
              {autoCreated.length} phiếu chi mới được tạo tự động từ Phong trào thi đua
            </p>
            <p className="text-[12px] text-[#3b82f6] mt-0.5">
              Tổng: {fmtShort(autoCreated.reduce((s,p)=>s+p.soTien,0))} — Đang chờ kế toán xác nhận giải ngân
            </p>
          </div>
          {canConfirm && (
            <button
              className="btn btn-primary btn-sm shrink-0 flex items-center gap-1.5"
              onClick={() => {
                setStatusFilter("cho-giai-ngan");
                setSelected(new Set(autoCreated.map(p=>p.id)));
              }}
            >
              <Check className="size-3.5"/> Xem & xác nhận
            </button>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"Chờ giải ngân", value:tongCho, count:data.filter(p=>p.trangThai==="cho-giai-ngan").length, color:"#b45309", bg:"#fffbeb", icon:Clock },
          { label:"Đã giải ngân", value:tongDa, count:data.filter(p=>p.trangThai==="da-giai-ngan").length, color:"#1a7f4e", bg:"#f0fdf4", icon:CheckCircle2 },
          { label:"Hoàn trả quỹ", value:tongHoan, count:data.filter(p=>p.trangThai==="hoan-tra").length, color:"#dc2626", bg:"#fef2f2", icon:RefreshCw },
        ].map(c=>(
          <div key={c.label} className="ds-card ds-card-default ds-card-p-md flex items-center gap-3">
            <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:c.bg }}>
              <c.icon className="size-5" style={{ color:c.color }}/>
            </div>
            <div>
              <p className="text-[11px] text-[#64748b]">{c.label}</p>
              <p className="text-[18px] font-bold" style={{ color:c.color }}>{fmtShort(c.value)}</p>
              <p className="text-[10px] text-[#94a3b8]">{c.count} phiếu chi</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk confirm bar */}
      {canConfirm && selected.size > 0 && (
        <div className="bg-[#f0fdf4] border border-[#86efac] rounded-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="size-4 text-[#1a7f4e] shrink-0"/>
          <span className="text-[13px] text-[#1a7f4e]">
            Đã chọn <strong>{selected.size}</strong> phiếu · Tổng <strong>{fmtShort(selectedTotal)}</strong>
          </span>
          <div className="ml-auto flex gap-2">
            <button className="btn btn-primary btn-sm flex items-center gap-1.5" onClick={confirmSelected}>
              <Check className="size-3.5"/> Xác nhận {selected.size} phiếu
            </button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSelected(new Set())}>Bỏ chọn</button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <div className="relative shrink-0 w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]"/>
          <input className="ds-input ds-input-sm pl-9 w-full" placeholder="Tìm phiếu, người nhận, QĐ…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        {(["","cho-giai-ngan","da-giai-ngan","hoan-tra"] as const).map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)}
            className={`btn btn-sm shrink-0 ${statusFilter===s?"btn-primary":"btn-secondary"}`}>
            {s===""?"Tất cả":trangThaiGNLabel(s as TrangThaiGN)}
            {s==="cho-giai-ngan" && data.filter(p=>p.trangThai==="cho-giai-ngan").length > 0 && (
              <span className="ml-1 bg-white/30 rounded-full text-[10px] px-1.5 font-bold">
                {data.filter(p=>p.trangThai==="cho-giai-ngan").length}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto shrink-0 text-[12px] text-[#64748b]">{filtered.length} phiếu</span>
        <button className="btn btn-secondary btn-sm shrink-0 flex items-center gap-1.5"><Printer className="size-3.5"/> Xuất bảng kê</button>
      </div>

      {/* Table */}
      <div className="ds-card ds-card-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]" style={{ minWidth:940 }}>
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                {canConfirm && (
                  <th className="px-3 py-2.5 w-8">
                    <input type="checkbox" className="rounded" checked={choItems.length>0&&choItems.every(p=>selected.has(p.id))} onChange={toggleAll}/>
                  </th>
                )}
                {["Số phiếu","Ngày","QĐ khen thưởng","Người / Tập thể nhận","Đơn vị","Danh hiệu","Số tiền (M)","Trạng thái","Thao tác"].map(h=>(
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p,i)=>(
                <tr key={p.id} className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors ${selected.has(p.id)?"!bg-[#f0fdf4]":i%2===0?"":"bg-[#fafafa]"}`}>
                  {canConfirm && (
                    <td className="px-3 py-2.5">
                      {p.trangThai==="cho-giai-ngan" && <input type="checkbox" className="rounded" checked={selected.has(p.id)} onChange={()=>toggleSelect(p.id)}/>}
                    </td>
                  )}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-[#334155]">{p.soPhieu}</span>
                      {p.id.startsWith("pc-auto-") && (
                        <span className="text-[10px] bg-[#eff6ff] text-[#3b82f6] border border-[#bfdbfe] rounded px-1 font-medium">Tự động</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[#64748b] whitespace-nowrap">{p.ngay}</td>
                  <td className="px-3 py-2.5 text-[#475569] whitespace-nowrap">{p.quyetDinhSo}</td>
                  <td className="px-3 py-2.5 font-medium text-[#1e293b]">{p.nguoiNhan}</td>
                  <td className="px-3 py-2.5 text-[#64748b]">{p.donVi}</td>
                  <td className="px-3 py-2.5 text-[#475569] max-w-[140px] truncate">{p.danhHieu}</td>
                  <td className="px-3 py-2.5 font-bold text-[#b45309] text-right">{p.soTien.toLocaleString("vi-VN")}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className={`badge ${trangThaiGNColor(p.trangThai)} text-[11px]`}>{trangThaiGNLabel(p.trangThai)}</span>
                      {p.ngayXacNhan && <span className="text-[10px] text-[#94a3b8]">{p.nguoiXacNhan} · {p.ngayXacNhan}</span>}
                      {p.lyDoHoanTra && <span className="text-[10px] text-[#ef4444] max-w-[120px] truncate">{p.lyDoHoanTra}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {canConfirm && p.trangThai === "cho-giai-ngan" && (
                      <button
                        className="btn btn-sm btn-ghost text-[#1a7f4e] flex items-center gap-1 border border-[#bbf7d0] hover:bg-[#f0fdf4]"
                        onClick={() => confirmOne(p.id)}
                      >
                        <Check className="size-3"/> Xác nhận
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#fafafa] border-t-2 border-[#e2e8f0]">
                {canConfirm && <td/>}
                <td colSpan={6} className="px-3 py-2.5 font-bold text-[#334155] text-[13px]">
                  TỔNG CỘNG ({filtered.length} phiếu)
                </td>
                <td className="px-3 py-2.5 font-bold text-[#b45309] text-right text-[14px]">
                  {filtered.reduce((s,p)=>s+p.soTien,0).toLocaleString("vi-VN")}
                </td>
                <td colSpan={2}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Tab: Quyết toán ────────────────────────────────────────── */
function QuyetToanTab({ user, data }: { user: LoginUser; data: PeriodQT[] }) {
  const [selectedKy, setSelectedKy] = useState(data[data.length-1]?.ky ?? "");
  const canApprove = ["quản trị hệ thống","lãnh đạo cấp cao"].includes(user.role);
  const period = data.find(p=>p.ky===selectedKy) ?? data[0];

  if (!period) return null;

  const canDo = period.tonCuoi > 0;
  const totalChi = period.chiTietChi.reduce((s,c)=>s+c.soTien,0);
  const maxVal = Math.max(...period.chiTietThu.map(c=>c.soTien), ...period.chiTietChi.map(c=>c.soTien), 1);

  return (
    <div className="flex flex-col gap-5">
      {/* Kỳ selector */}
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-medium text-[#475569]">Kỳ quyết toán:</span>
        <div className="flex gap-2">
          {data.map(p=>(
            <button key={p.ky} onClick={()=>setSelectedKy(p.ky)}
              className={`btn btn-sm ${selectedKy===p.ky?"btn-primary":"btn-secondary"}`}>
              {p.ky}
            </button>
          ))}
        </div>
      </div>

      {/* Balance summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Tồn đầu kỳ", value:period.tonDau, color:"#6b7280", bg:"#f9fafb", icon:PiggyBank },
          { label:"Tổng thu trong kỳ", value:period.tongThu, color:"#1e40af", bg:"#eff6ff", icon:TrendingUp },
          { label:"Tổng chi trong kỳ", value:period.tongChi, color:"#b45309", bg:"#fffbeb", icon:TrendingDown },
          { label:"Tồn cuối kỳ", value:period.tonCuoi, color:"#1a7f4e", bg:"#f0fdf4", icon:Wallet },
        ].map(c=>(
          <div key={c.label} className="ds-card ds-card-default ds-card-p-md flex items-center gap-3">
            <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:c.bg }}>
              <c.icon className="size-5" style={{ color:c.color }}/>
            </div>
            <div>
              <p className="text-[11px] text-[#64748b]">{c.label}</p>
              <p className="text-[18px] font-bold" style={{ color:c.color }}>{fmtShort(c.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Thu */}
        <div className="ds-card ds-card-default overflow-hidden">
          <div className="ds-card-header flex items-center gap-2">
            <TrendingUp className="size-4 text-[#1e40af]"/>
            <span className="font-semibold text-[14px] text-[#1e293b]">Chi tiết thu quỹ</span>
            <span className="ml-auto font-bold text-[#1e40af]">{fmtShort(period.tongThu)}</span>
          </div>
          <div className="ds-card-body flex flex-col gap-3">
            {period.chiTietThu.map(c=>(
              <div key={c.loai}>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-[#334155]">{c.loai}</span>
                  <span className="text-[12px] font-semibold text-[#1e40af]">{fmtShort(c.soTien)}</span>
                </div>
                <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#3b82f6]" style={{ width:`${Math.round(c.soTien/maxVal*100)}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chi */}
        <div className="ds-card ds-card-default overflow-hidden">
          <div className="ds-card-header flex items-center gap-2">
            <TrendingDown className="size-4 text-[#b45309]"/>
            <span className="font-semibold text-[14px] text-[#1e293b]">Chi tiết chi quỹ</span>
            <span className="ml-auto font-bold text-[#b45309]">{fmtShort(totalChi)}</span>
          </div>
          <div className="ds-card-body flex flex-col gap-3">
            {period.chiTietChi.map(c=>(
              <div key={c.loai}>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-[#334155]">{c.loai}</span>
                  <span className="text-[12px] font-semibold text-[#b45309]">{fmtShort(c.soTien)}</span>
                </div>
                <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#f97316]" style={{ width:`${Math.round(c.soTien/maxVal*100)}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Đối chiếu table */}
      <div className="ds-card ds-card-default overflow-hidden">
        <div className="ds-card-header">
          <span className="font-semibold text-[14px] text-[#1e293b]">Bảng đối chiếu thu – chi – tồn quỹ</span>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              {["Chỉ tiêu","Số tiền (triệu VND)","Ghi chú"].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#64748b] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label:"I. TỒN ĐẦU KỲ", value:period.tonDau, note:"Số dư chuyển từ kỳ trước", bold:true },
              { label:"II. TỔNG THU TRONG KỲ", value:period.tongThu, note:"Từ tất cả các nguồn đã ghi nhận", bold:true },
              { label:"III. TỔNG CHI TRONG KỲ", value:period.tongChi, note:"Bao gồm phiếu chi đã xác nhận", bold:true },
              { label:"IV. TỒN CUỐI KỲ (I + II – III)", value:period.tonCuoi, note:"Chuyển sang kỳ tiếp theo", bold:true },
            ].map((r,i)=>(
              <tr key={r.label} className={`border-b border-[#f1f5f9] ${i%2===0?"":"bg-[#fafafa]"}`}>
                <td className={`px-4 py-2.5 ${r.bold?"font-bold text-[#1e293b]":"text-[#475569]"}`}>{r.label}</td>
                <td className={`px-4 py-2.5 text-right font-bold ${r.value<0?"text-[#ef4444]":i===3?"text-[#1a7f4e] text-[15px]":"text-[#334155]"}`}>
                  {r.value.toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-2.5 text-[#94a3b8] text-[12px]">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {canApprove && canDo && (
          <button className="btn btn-primary btn-sm flex items-center gap-1.5"><FileText className="size-3.5"/> Lập báo cáo quyết toán</button>
        )}
        <button className="btn btn-secondary btn-sm flex items-center gap-1.5"><Download className="size-3.5"/> Xuất Excel</button>
        <button className="btn btn-secondary btn-sm flex items-center gap-1.5"><Printer className="size-3.5"/> In báo cáo</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function QuyTDKTPage({ user, phieuChiList, onPhieuChiUpdate }: {
  user: LoginUser;
  phieuChiList?: PhieuChi[];
  onPhieuChiUpdate?: (updated: PhieuChi[]) => void;
}) {
  const { theme } = useTheme();
  const [tab, setTab] = useState<TabId>("nguon");

  const activePhieuChi = phieuChiList ?? INIT_PHIEU_CHI;

  // Tính tồn quỹ động: tổng thu đã ghi nhận - tổng phiếu chi đã giải ngân
  const tongDaThu = MOCK_THU_QUY.filter(t => t.trangThai === "da-ghi-nhan").reduce((s,t) => s+t.soTien, 0);
  const tongDaChi = activePhieuChi.filter(p => p.trangThai === "da-giai-ngan").reduce((s,p) => s+p.soTien, 0);
  const tongChoGN  = activePhieuChi.filter(p => p.trangThai === "cho-giai-ngan").reduce((s,p) => s+p.soTien, 0);
  const tonQuy    = tongDaThu - tongDaChi;
  const NGUONG    = 200; // cảnh báo khi tồn < 200M

  // Badge counts cho tab nav
  const pendingThu    = MOCK_THU_QUY.filter(t => t.trangThai === "cho-xac-nhan").length;
  const pendingKH     = MOCK_KE_HOACH.filter(k => k.trangThai === "cho-duyet").length;
  const pendingGN     = activePhieuChi.filter(p => p.trangThai === "cho-giai-ngan").length;

  const TABS: { id: TabId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id:"nguon",    label:"Nguồn quỹ",  icon:ArrowUpCircle, badge: pendingThu || undefined },
    { id:"kehoach",  label:"Kế hoạch",   icon:BarChart3,     badge: pendingKH  || undefined },
    { id:"giaingan", label:"Giải ngân",  icon:Receipt,       badge: pendingGN  || undefined },
    { id:"quyettoan",label:"Quyết toán", icon:BookOpen },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0] bg-white shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="size-5" style={{ color:"var(--color-primary-btn)" }}/>
              <h1 className="text-[20px] font-bold text-[#1e293b]">Quỹ Thi đua Khen thưởng</h1>
            </div>
            <p className="text-[13px] text-[#64748b]">Theo dõi thu – chi, kế hoạch và quyết toán quỹ TĐKT — Năm tài chính 2025</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {tonQuy < NGUONG && (
              <div className="flex items-center gap-1.5 bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3 py-1.5">
                <AlertCircle className="size-4 text-[#dc2626]"/>
                <span className="text-[12px] font-medium text-[#dc2626]">Tồn quỹ thấp</span>
              </div>
            )}
            {tongChoGN > 0 && (
              <div className="text-right">
                <p className="text-[11px] text-[#94a3b8]">Chờ giải ngân</p>
                <p className="text-[16px] font-bold text-[#b45309]">−{fmtShort(tongChoGN)}</p>
              </div>
            )}
            <div className="text-right border-l border-[#e2e8f0] pl-3">
              <p className="text-[11px] text-[#94a3b8]">Tồn quỹ khả dụng</p>
              <p className="text-[22px] font-extrabold" style={{ color:"var(--color-primary-btn)" }}>{fmtShort(tonQuy)}</p>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mt-4 border-b border-transparent">
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-[13px] font-medium transition-all border-b-2 ${
                  active
                    ? "border-[var(--color-primary-btn)] text-[var(--color-primary-btn)] bg-[#f8fafc]"
                    : "border-transparent text-[#64748b] hover:text-[#334155] hover:bg-[#f1f5f9]"
                }`}
              >
                <t.icon className="size-4"/>
                {t.label}
                {t.badge && (
                  <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${active ? "bg-[var(--color-primary-btn)] text-white" : "bg-[#ef4444] text-white"}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "nguon"     && <NguonQuyTab  user={user} data={MOCK_THU_QUY} />}
        {tab === "kehoach"   && <KeHoachTab   user={user} data={MOCK_KE_HOACH} />}
        {tab === "giaingan"  && <GiaiNganTab  user={user} data={activePhieuChi} onUpdate={onPhieuChiUpdate} />}
        {tab === "quyettoan" && <QuyetToanTab user={user} data={MOCK_QUYET_TOAN} />}
      </div>
    </div>
  );
}
