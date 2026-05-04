import { useState } from "react";
import {
  Search, Sparkles, Star, CheckCircle2, XCircle, ChevronRight,
  X, Users, Award, TrendingUp, AlertCircle, Plus, Download,
  Brain, BarChart2, Clock, Trophy, ThumbsUp,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface NamThanhTich {
  nam: number;
  xepLoai: "Xuất sắc" | "Tốt" | "Hoàn thành";
  coSangKien: boolean;
  viPham: boolean;
}
interface GoiY {
  id: string;
  ten: string;
  chucVu: string;
  donVi: string;
  danhHieuGoiY: string;
  mucDoTinCay: number; // 0-100
  lyDo: string;
  tieuChiDat: string[];
  tieuChiChuaDat: string[];
  lichSu5Nam: NamThanhTich[];
  loai: "ca-nhan" | "tap-the";
  trangThai: "chua-xu-ly" | "da-tao-ho-so" | "bo-qua";
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const GOI_Y_LIST: GoiY[] = [
  {
    id: "gy1", ten: "Lê Thị Thanh Xuân", chucVu: "Phó Giám đốc", donVi: "Sở GD&ĐT",
    danhHieuGoiY: "Chiến sĩ thi đua cấp Tỉnh", mucDoTinCay: 96, loai: "ca-nhan",
    lyDo: "5 năm liên tục đạt CSTĐ cơ sở, có sáng kiến được xếp loại A năm 2024",
    tieuChiDat: ["CSTĐ cơ sở 5 năm liên tục","Sáng kiến cấp tỉnh được công nhận","Không vi phạm kỷ luật","Được tập thể bình bầu"],
    tieuChiChuaDat: [],
    lichSu5Nam: [
      { nam: 2021, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
      { nam: 2022, xepLoai: "Xuất sắc", coSangKien: true,  viPham: false },
      { nam: 2023, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
      { nam: 2024, xepLoai: "Xuất sắc", coSangKien: true,  viPham: false },
      { nam: 2025, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
    ],
    trangThai: "chua-xu-ly",
  },
  {
    id: "gy2", ten: "Phạm Hoàng Liêm", chucVu: "Trưởng phòng KH&TĐ", donVi: "Sở KH&ĐT",
    danhHieuGoiY: "Huân chương Lao động hạng Ba", mucDoTinCay: 88, loai: "ca-nhan",
    lyDo: "Đã có Huân chương LĐ hạng Ba từ 2024, đủ tiêu chí thời gian để đề nghị hạng Nhì",
    tieuChiDat: ["Huân chương hạng Ba đủ 5 năm","Thành tích xuất sắc liên tục","Không vi phạm","Được cơ quan đề nghị"],
    tieuChiChuaDat: ["Cần thêm 1 sáng kiến cấp Bộ"],
    lichSu5Nam: [
      { nam: 2021, xepLoai: "Xuất sắc", coSangKien: true,  viPham: false },
      { nam: 2022, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
      { nam: 2023, xepLoai: "Xuất sắc", coSangKien: true,  viPham: false },
      { nam: 2024, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
      { nam: 2025, xepLoai: "Tốt",      coSangKien: false, viPham: false },
    ],
    trangThai: "chua-xu-ly",
  },
  {
    id: "gy3", ten: "Phòng Tổ chức – Cán bộ", chucVu: "Phòng", donVi: "Văn phòng TU",
    danhHieuGoiY: "Cờ thi đua cấp Tỉnh", mucDoTinCay: 91, loai: "tap-the",
    lyDo: "Tập thể LĐXS 4 năm liên tiếp, dẫn đầu cụm thi đua số 1 năm 2024-2025",
    tieuChiDat: ["LĐXS liên tục ≥ 4 năm","Dẫn đầu cụm thi đua","Hoàn thành 100% chỉ tiêu","Không có cá nhân vi phạm"],
    tieuChiChuaDat: [],
    lichSu5Nam: [
      { nam: 2021, xepLoai: "Tốt",      coSangKien: false, viPham: false },
      { nam: 2022, xepLoai: "Xuất sắc", coSangKien: true,  viPham: false },
      { nam: 2023, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
      { nam: 2024, xepLoai: "Xuất sắc", coSangKien: true,  viPham: false },
      { nam: 2025, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
    ],
    trangThai: "da-tao-ho-so",
  },
  {
    id: "gy4", ten: "Nguyễn Phú Trọng Khoa", chucVu: "Bác sĩ CKI", donVi: "BV Đa khoa ĐN",
    danhHieuGoiY: "Chiến sĩ thi đua cơ sở", mucDoTinCay: 84, loai: "ca-nhan",
    lyDo: "3 năm liên tiếp hoàn thành xuất sắc, có 1 sáng kiến kỹ thuật y tế được công nhận",
    tieuChiDat: ["Hoàn thành xuất sắc 3 năm","Sáng kiến được công nhận","Không vi phạm"],
    tieuChiChuaDat: ["Cần xác nhận của Hội đồng đơn vị"],
    lichSu5Nam: [
      { nam: 2021, xepLoai: "Hoàn thành", coSangKien: false, viPham: false },
      { nam: 2022, xepLoai: "Tốt",        coSangKien: false, viPham: false },
      { nam: 2023, xepLoai: "Xuất sắc",   coSangKien: false, viPham: false },
      { nam: 2024, xepLoai: "Xuất sắc",   coSangKien: true,  viPham: false },
      { nam: 2025, xepLoai: "Xuất sắc",   coSangKien: false, viPham: false },
    ],
    trangThai: "chua-xu-ly",
  },
  {
    id: "gy5", ten: "Nguyễn Thị Bích Liên", chucVu: "Trưởng ban", donVi: "Ban Dân vận",
    danhHieuGoiY: "Bằng khen UBND Tỉnh", mucDoTinCay: 79, loai: "ca-nhan",
    lyDo: "Hoàn thành xuất sắc nhiệm vụ 2 năm liên tiếp, được tập thể bình bầu 100%",
    tieuChiDat: ["Hoàn thành xuất sắc 2 năm liên tiếp","Được bình bầu 100%"],
    tieuChiChuaDat: ["Chưa có sáng kiến cấp tỉnh","Cần xác nhận đóng góp xuất sắc đột xuất"],
    lichSu5Nam: [
      { nam: 2021, xepLoai: "Tốt",      coSangKien: false, viPham: false },
      { nam: 2022, xepLoai: "Tốt",      coSangKien: false, viPham: false },
      { nam: 2023, xepLoai: "Tốt",      coSangKien: false, viPham: false },
      { nam: 2024, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
      { nam: 2025, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
    ],
    trangThai: "chua-xu-ly",
  },
  {
    id: "gy6", ten: "Ban Tuyên giáo", chucVu: "Ban", donVi: "Tỉnh ủy Đồng Nai",
    danhHieuGoiY: "Huân chương Lao động hạng Ba", mucDoTinCay: 93, loai: "tap-the",
    lyDo: "Liên tục đạt Cờ thi đua cấp Tỉnh 3 năm gần nhất, dẫn đầu khối cơ quan Đảng",
    tieuChiDat: ["Cờ thi đua cấp Tỉnh ≥ 3 năm liên tiếp","Dẫn đầu khối","Tổ chức Đảng hoàn thành xuất sắc","Không có vi phạm tập thể"],
    tieuChiChuaDat: [],
    lichSu5Nam: [
      { nam: 2021, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
      { nam: 2022, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
      { nam: 2023, xepLoai: "Xuất sắc", coSangKien: true,  viPham: false },
      { nam: 2024, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
      { nam: 2025, xepLoai: "Xuất sắc", coSangKien: false, viPham: false },
    ],
    trangThai: "bo-qua",
  },
];

const STATUS_MAP = {
  "chua-xu-ly":   { label: "Chưa xử lý",       color: "#d97706", bg: "#fef3c7" },
  "da-tao-ho-so": { label: "Đã tạo hồ sơ",     color: "#16a34a", bg: "#dcfce7" },
  "bo-qua":       { label: "Bỏ qua",             color: "#64748b", bg: "#f1f5f9" },
};

function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 90 ? "#16a34a" : score >= 75 ? "#d97706" : "#dc2626";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[12px] font-semibold" style={{ color }}>{score}%</span>
    </div>
  );
}

function GoiYDetail({ gy, onClose, onAction }: {
  gy: GoiY; onClose: () => void;
  onAction: (id: string, action: "da-tao-ho-so" | "bo-qua") => void;
}) {
  const xepLoaiColor = { "Xuất sắc": "#16a34a", "Tốt": "#d97706", "Hoàn thành": "#64748b" };
  return (
    <div className="fixed inset-0 z-[80] flex justify-end" style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-[560px] h-full bg-white flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-[#e2e8f0]"
          style={{ background: "linear-gradient(135deg,#0f1a2e,#7c3aed)" }}>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded"
                  style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                  <Brain className="size-3" />AI Gợi ý
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded font-medium"
                  style={{ background: STATUS_MAP[gy.trangThai].bg, color: STATUS_MAP[gy.trangThai].color }}>
                  {STATUS_MAP[gy.trangThai].label}
                </span>
              </div>
              <h2 className="text-[17px] font-bold text-white">{gy.ten}</h2>
              <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                {gy.chucVu} · {gy.donVi}
              </p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white"><X className="size-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Danh hiệu + độ tin cậy */}
          <div className="rounded-xl border-2 border-[#ede9fe] bg-[#faf5ff] p-4">
            <div className="text-[12px] text-[#7c3aed] font-semibold mb-1 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />Danh hiệu được gợi ý
            </div>
            <div className="text-[20px] font-bold text-slate-900 mb-2">{gy.danhHieuGoiY}</div>
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[#64748b]">Độ tin cậy:</span>
              <ConfidenceBadge score={gy.mucDoTinCay} />
            </div>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-slate-900 mb-2">Lý do gợi ý</h3>
            <p className="text-[13px] text-[#475569] leading-relaxed">{gy.lyDo}</p>
          </div>

          {/* Tiêu chí */}
          <div>
            <h3 className="text-[13px] font-semibold text-slate-900 mb-3">Tiêu chí đánh giá</h3>
            <div className="space-y-2">
              {gy.tieuChiDat.map(tc => (
                <div key={tc} className="flex items-start gap-2 text-[13px]">
                  <CheckCircle2 className="size-4 shrink-0 text-[#16a34a] mt-0.5" />
                  <span className="text-slate-900">{tc}</span>
                </div>
              ))}
              {gy.tieuChiChuaDat.map(tc => (
                <div key={tc} className="flex items-start gap-2 text-[13px]">
                  <AlertCircle className="size-4 shrink-0 text-[#d97706] mt-0.5" />
                  <span className="text-[#92400e]">{tc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5 năm thành tích */}
          <div>
            <h3 className="text-[13px] font-semibold text-slate-900 mb-3">Thành tích 5 năm liền kề</h3>
            <div className="space-y-2">
              {gy.lichSu5Nam.map(n => (
                <div key={n.nam} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[13px] font-semibold text-slate-900 w-12">{n.nam}</span>
                  <span className="text-[12px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: (xepLoaiColor[n.xepLoai] ?? "#64748b") + "20", color: xepLoaiColor[n.xepLoai] ?? "#64748b" }}>
                    {n.xepLoai}
                  </span>
                  {n.coSangKien && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#f5f3ff] text-[#7c3aed]">★ Sáng kiến</span>
                  )}
                  {n.viPham && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#fee2e2] text-[#dc2626]">⚠ Vi phạm</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#e2e8f0] flex gap-2">
          {gy.trangThai === "chua-xu-ly" && (
            <>
              <button onClick={() => { onAction(gy.id, "bo-qua"); onClose(); }}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] transition-colors">
                Bỏ qua
              </button>
              <button onClick={() => { onAction(gy.id, "da-tao-ho-so"); onClose(); }}
                className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5">
                <Plus className="size-3.5" />Tạo hồ sơ đề xuất
              </button>
            </>
          )}
          {gy.trangThai !== "chua-xu-ly" && (
            <button className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-1.5">
              <Download className="size-3.5" />Xuất báo cáo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function GoiYDanhHieuPage({ user }: { user: LoginUser }) {
  const { primary } = useTheme();
  const [list, setList] = useState<GoiY[]>(GOI_Y_LIST);
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [detail, setDetail] = useState<GoiY | null>(null);

  const handleAction = (id: string, action: "da-tao-ho-so" | "bo-qua") => {
    setList(prev => prev.map(g => g.id === id ? { ...g, trangThai: action } : g));
  };

  const filtered = list.filter(g => {
    const q = search.toLowerCase();
    const matchQ = !q || g.ten.toLowerCase().includes(q) || g.donVi.toLowerCase().includes(q) || g.danhHieuGoiY.toLowerCase().includes(q);
    const matchLoai = filterLoai === "all" || g.loai === filterLoai;
    const matchSt = filterStatus === "all" || g.trangThai === filterStatus;
    return matchQ && matchLoai && matchSt;
  });

  const pending = list.filter(g => g.trangThai === "chua-xu-ly").length;

  return (
    <div className="px-6 py-6 space-y-5 max-w-screen-xl">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2">
            <Brain className="size-6 text-[#7c3aed]" />
            Gợi ý Đề xuất Danh hiệu
            <span className="badge badge-primary text-[11px]">AI</span>
          </h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Tự động phân tích thành tích 5 năm và gợi ý danh hiệu phù hợp</p>
        </div>
        <button className="btn btn-secondary btn-sm flex items-center gap-1.5">
          <Download className="size-3.5" />Xuất Excel
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng gợi ý", value: list.length, color: "#7c3aed", bg: "#f5f3ff", icon: Sparkles },
          { label: "Chưa xử lý", value: pending, color: "#d97706", bg: "#fef3c7", icon: Clock },
          { label: "Đã tạo hồ sơ", value: list.filter(g => g.trangThai === "da-tao-ho-so").length, color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
          { label: "Độ tin cậy TB", value: `${Math.round(list.reduce((a,g) => a+g.mucDoTinCay,0)/list.length)}%`, color: "#1C5FBE", bg: "#f0f4ff", icon: BarChart2 },
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
      <div className="flex items-center gap-3 overflow-x-auto">
        <div className="relative shrink-0 w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]" />
          <input className="ds-input ds-input-sm w-full pl-9" placeholder="Tìm tên, đơn vị, danh hiệu…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ds-input ds-input-sm" value={filterLoai} onChange={e => setFilterLoai(e.target.value)}>
          <option value="all">Cá nhân & Tập thể</option>
          <option value="ca-nhan">Cá nhân</option>
          <option value="tap-the">Tập thể</option>
        </select>
        <select className="ds-input ds-input-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="chua-xu-ly">Chưa xử lý</option>
          <option value="da-tao-ho-so">Đã tạo hồ sơ</option>
          <option value="bo-qua">Bỏ qua</option>
        </select>
        <span className="ml-auto shrink-0 whitespace-nowrap text-[13px] text-[#64748b]">{filtered.length} gợi ý</span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(gy => {
          const st = STATUS_MAP[gy.trangThai];
          return (
            <div key={gy.id}
              className="ds-card ds-card-default rounded-xl p-5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
              onClick={() => setDetail(gy)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "#f5f3ff" }}>
                    {gy.loai === "ca-nhan"
                      ? <Users className="size-5 text-[#7c3aed]" />
                      : <Trophy className="size-5 text-[#7c3aed]" />}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-slate-900">{gy.ten}</div>
                    <div className="text-[12px] text-[#64748b]">{gy.donVi}</div>
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: st.bg, color: st.color }}>{st.label}</span>
              </div>

              <div className="mb-3 p-3 rounded-lg bg-[#faf5ff] border border-[#ede9fe]">
                <div className="text-[11px] text-[#7c3aed] font-semibold mb-0.5 flex items-center gap-1">
                  <Sparkles className="size-3" />Gợi ý AI
                </div>
                <div className="text-[13px] font-semibold text-slate-900">{gy.danhHieuGoiY}</div>
              </div>

              <div className="flex items-center justify-between">
                <ConfidenceBadge score={gy.mucDoTinCay} />
                <div className="flex items-center gap-1">
                  {gy.tieuChiChuaDat.length === 0
                    ? <span className="text-[11px] text-[#16a34a] flex items-center gap-1"><CheckCircle2 className="size-3" />Đủ tiêu chí</span>
                    : <span className="text-[11px] text-[#d97706] flex items-center gap-1"><AlertCircle className="size-3" />{gy.tieuChiChuaDat.length} tiêu chí còn thiếu</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#64748b]">
          <Brain className="size-10 mx-auto mb-3 text-[#cbd5e1]" />
          <p className="text-[14px]">Không có gợi ý phù hợp</p>
        </div>
      )}

      {detail && (
        <GoiYDetail gy={detail} onClose={() => setDetail(null)} onAction={handleAction} />
      )}
    </div>
  );
}
