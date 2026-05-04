import { useState } from "react";
import {
  Search, Plus, Download, Lightbulb, CheckCircle2, Clock,
  XCircle, ChevronRight, X, Send, Eye, Edit3, Star,
  FileText, Users, CalendarDays, Tag, ThumbsUp, ThumbsDown,
  AlertCircle, BookOpen, Zap,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type TrangThai = "draft" | "submitted" | "reviewing" | "approved" | "rejected";
type PhanLoai = "quy-trinh" | "cong-nghe" | "quan-ly" | "san-pham";

interface SangKien {
  id: string;
  tieuDe: string;
  moTa: string;
  phanLoai: PhanLoai;
  tacGia: string;
  donVi: string;
  ngayTao: string;
  ngayNop?: string;
  ngayDuyet?: string;
  trangThai: TrangThai;
  diemSo?: number;
  nguoiThamDinh?: string;
  nhanXet?: string;
  lyDoTuChoi?: string;
  nhungNguoiThamGia: string[];
  capApDung: "co-so" | "tinh" | "toan-quoc";
  loiIch: string;
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const SANG_KIEN_LIST: SangKien[] = [
  {
    id: "sk1", tieuDe: "Ứng dụng AI để tự động phân loại hồ sơ khen thưởng",
    moTa: "Xây dựng mô hình machine learning giúp phân loại và ưu tiên hồ sơ khen thưởng dựa trên tiêu chí đánh giá, giảm 70% thời gian xử lý thủ công.",
    phanLoai: "cong-nghe", tacGia: "Đinh Xuân Long", donVi: "Trung tâm CNTT",
    ngayTao: "10/11/2025", ngayNop: "15/11/2025", ngayDuyet: "05/12/2025",
    trangThai: "approved", diemSo: 92,
    nguoiThamDinh: "Hội đồng Khoa học Sở TT&TT",
    nhanXet: "Sáng kiến có tính ứng dụng cao, đề xuất triển khai thí điểm năm 2026.",
    nhungNguoiThamGia: ["Lê Văn Hải", "Nguyễn Bá Thanh"],
    capApDung: "tinh", loiIch: "Tiết kiệm ~200 giờ/năm, tăng độ chính xác phân loại lên 95%",
  },
  {
    id: "sk2", tieuDe: "Quy trình số hóa biên bản họp Hội đồng xét duyệt",
    moTa: "Thay thế biên bản giấy bằng hệ thống ghi chép điện tử tích hợp chữ ký số, đảm bảo tính pháp lý và tra cứu nhanh.",
    phanLoai: "quy-trinh", tacGia: "Trần Thị Mai Hương", donVi: "Ban Tuyên giáo",
    ngayTao: "05/10/2025", ngayNop: "12/10/2025", ngayDuyet: "28/10/2025",
    trangThai: "approved", diemSo: 88,
    nguoiThamDinh: "Văn phòng Tỉnh ủy",
    nhanXet: "Phù hợp với định hướng chuyển đổi số của tỉnh.",
    nhungNguoiThamGia: ["Nguyễn Hữu Phúc"],
    capApDung: "tinh", loiIch: "Giảm 80% chi phí in ấn, tra cứu biên bản trong vòng 30 giây",
  },
  {
    id: "sk3", tieuDe: "Hệ thống nhắc nhở tự động deadline nộp hồ sơ",
    moTa: "Tích hợp module gửi email/SMS tự động nhắc nhở cán bộ về các mốc thời hạn nộp hồ sơ khen thưởng theo từng giai đoạn.",
    phanLoai: "cong-nghe", tacGia: "Lê Hoàng Nam", donVi: "Trung tâm CNTT",
    ngayTao: "20/11/2025", ngayNop: "01/12/2025",
    trangThai: "reviewing",
    nguoiThamDinh: "Hội đồng KH Sở TT&TT",
    nhungNguoiThamGia: ["Phạm Trung Hiếu", "Võ Thị Lan"],
    capApDung: "co-so", loiIch: "Giảm tỷ lệ nộp trễ từ 23% xuống dưới 5%",
  },
  {
    id: "sk4", tieuDe: "Bộ mẫu biểu thống nhất TT 01/2024 toàn tỉnh",
    moTa: "Xây dựng bộ biểu mẫu điện tử theo đúng quy định TT 01/2024 áp dụng thống nhất trong toàn bộ 11 huyện/thành phố của tỉnh.",
    phanLoai: "quan-ly", tacGia: "Nguyễn Văn Hùng", donVi: "Phòng Tổ chức – Cán bộ",
    ngayTao: "15/11/2025", ngayNop: "22/11/2025",
    trangThai: "reviewing",
    nguoiThamDinh: "Sở Nội vụ Đồng Nai",
    nhungNguoiThamGia: [],
    capApDung: "tinh", loiIch: "Chuẩn hóa 100% biểu mẫu, giảm sai sót pháp lý",
  },
  {
    id: "sk5", tieuDe: "Ứng dụng mã QR tra cứu quyết định khen thưởng",
    moTa: "Tích hợp mã QR lên quyết định khen thưởng để cán bộ có thể tra cứu xác thực nhanh chóng qua điện thoại.",
    phanLoai: "cong-nghe", tacGia: "Phạm Quốc Bảo", donVi: "Phòng Tài chính – Kế toán",
    ngayTao: "01/12/2025",
    trangThai: "submitted",
    nhungNguoiThamGia: ["Lê Thị Hoa"],
    capApDung: "tinh", loiIch: "Xác thực tính pháp lý QĐ trong 5 giây",
  },
  {
    id: "sk6", tieuDe: "Phần mềm quản lý kho huân huy chương vật lý",
    moTa: "Hệ thống mã vạch quản lý kho lưu trữ huân/huy chương vật lý, giúp kiểm kê nhanh và tránh thất lạc.",
    phanLoai: "quan-ly", tacGia: "Lê Minh Tuấn", donVi: "Trung tâm Lưu trữ tỉnh",
    ngayTao: "10/12/2025",
    trangThai: "draft",
    nhungNguoiThamGia: [],
    capApDung: "co-so", loiIch: "Kiểm kê chính xác 100%, tiết kiệm 40 giờ/năm",
  },
  {
    id: "sk7", tieuDe: "Dashboard realtime theo dõi tiến độ phong trào thi đua",
    moTa: "Xây dựng màn hình hiển thị trực quan realtime tỷ lệ hoàn thành tiêu chí theo từng đơn vị trong phong trào.",
    phanLoai: "cong-nghe", tacGia: "Nguyễn Thị Bích Liên", donVi: "Ban Dân vận",
    ngayTao: "25/10/2025", ngayNop: "02/11/2025",
    trangThai: "rejected",
    lyDoTuChoi: "Chức năng đã được tích hợp trong hệ thống phong trào hiện tại, không cần sáng kiến riêng.",
    nhungNguoiThamGia: ["Trần Hùng Dũng"],
    capApDung: "co-so", loiIch: "Tăng minh bạch theo dõi tiến độ",
  },
];

const STATUS_MAP: Record<TrangThai, { label: string; color: string; bg: string; icon: React.FC<{ className?: string }> }> = {
  draft:     { label: "Dự thảo",       color: "#64748b", bg: "#f1f5f9", icon: ({ className }) => <Edit3 className={className} /> },
  submitted: { label: "Đã nộp",        color: "#d97706", bg: "#fef3c7", icon: ({ className }) => <Send className={className} /> },
  reviewing: { label: "Đang thẩm định",color: "#7c3aed", bg: "#f5f3ff", icon: ({ className }) => <Eye className={className} /> },
  approved:  { label: "Được chấp thuận",color: "#16a34a", bg: "#dcfce7", icon: ({ className }) => <CheckCircle2 className={className} /> },
  rejected:  { label: "Không chấp thuận",color: "#dc2626", bg: "#fee2e2", icon: ({ className }) => <XCircle className={className} /> },
};

const PHAN_LOAI_MAP: Record<PhanLoai, { label: string; color: string }> = {
  "quy-trinh": { label: "Quy trình",    color: "#1C5FBE" },
  "cong-nghe": { label: "Công nghệ",    color: "#7c3aed" },
  "quan-ly":   { label: "Quản lý",      color: "#0891b2" },
  "san-pham":  { label: "Sản phẩm",     color: "#d97706" },
};

const CAP_MAP: Record<string, string> = {
  "co-so": "Cơ sở", "tinh": "Cấp Tỉnh", "toan-quoc": "Toàn quốc",
};

/* ═══════════════════════════════════════════════════════════════
   DETAIL DRAWER
═══════════════════════════════════════════════════════════════ */
function SangKienDetail({ sk, user, onClose, onStatusChange }: {
  sk: SangKien;
  user: LoginUser;
  onClose: () => void;
  onStatusChange: (id: string, status: TrangThai, note?: string) => void;
}) {
  const st = STATUS_MAP[sk.trangThai];
  const pl = PHAN_LOAI_MAP[sk.phanLoai];
  const StIcon = st.icon;
  const canReview = ["quản trị hệ thống","lãnh đạo cấp cao","hội đồng"].includes(user.role);
  return (
    <div className="fixed inset-0 z-[80] flex justify-end" style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-[560px] h-full bg-white flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-[#e2e8f0]"
          style={{ background: "linear-gradient(135deg,#0f2040,#1C5FBE)" }}>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
                  style={{ background: pl.color + "30", color: pl.color === "#1C5FBE" ? "white" : pl.color, border: `1px solid ${pl.color}60` }}>
                  {pl.label}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded"
                  style={{ background: st.bg, color: st.color }}>{st.label}</span>
                <span className="text-[11px] px-2 py-0.5 rounded"
                  style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
                  {CAP_MAP[sk.capApDung]}
                </span>
              </div>
              <h2 className="text-[16px] font-bold text-white leading-snug">{sk.tieuDe}</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white shrink-0"><X className="size-5" /></button>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[12px]" style={{ color: "rgba(255,255,255,0.65)" }}>
            <span className="flex items-center gap-1"><Users className="size-3" />{sk.tacGia}</span>
            <span className="flex items-center gap-1"><Tag className="size-3" />{sk.donVi}</span>
            <span className="flex items-center gap-1"><CalendarDays className="size-3" />{sk.ngayTao}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {sk.diemSo !== undefined && (
            <div className="rounded-xl border-2 border-[#dcfce7] bg-[#f0fdf4] p-4 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-[#16a34a] flex items-center justify-center">
                <Star className="size-6 text-white" />
              </div>
              <div>
                <div className="text-[28px] font-bold text-[#16a34a]">{sk.diemSo}<span className="text-[16px] font-normal text-[#64748b]">/100</span></div>
                <div className="text-[13px] text-[#64748b]">Điểm thẩm định</div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-[13px] font-semibold text-slate-900 mb-2">Mô tả sáng kiến</h3>
            <p className="text-[13px] text-[#475569] leading-relaxed">{sk.moTa}</p>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
            <h3 className="text-[13px] font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Zap className="size-4 text-[#d97706]" />Lợi ích dự kiến
            </h3>
            <p className="text-[13px] text-[#475569]">{sk.loiIch}</p>
          </div>

          {sk.nhungNguoiThamGia.length > 0 && (
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900 mb-2">Người tham gia</h3>
              <div className="flex flex-wrap gap-2">
                {sk.nhungNguoiThamGia.map(p => (
                  <span key={p} className="text-[12px] px-3 py-1 rounded-full bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">{p}</span>
                ))}
              </div>
            </div>
          )}

          {sk.nguoiThamDinh && (
            <div className="space-y-2">
              <h3 className="text-[13px] font-semibold text-slate-900">Thẩm định</h3>
              <div className="text-[13px] text-[#64748b]">Đơn vị thẩm định: <span className="font-medium text-slate-900">{sk.nguoiThamDinh}</span></div>
              {sk.nhanXet && (
                <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-[13px] text-[#166534]">
                  <strong>Nhận xét:</strong> {sk.nhanXet}
                </div>
              )}
              {sk.lyDoTuChoi && (
                <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-3 text-[13px] text-[#dc2626]">
                  <strong>Lý do không chấp thuận:</strong> {sk.lyDoTuChoi}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#e2e8f0] flex gap-2">
          {sk.trangThai === "draft" && (
            <button onClick={() => onStatusChange(sk.id, "submitted")}
              className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5">
              <Send className="size-3.5" />Gửi thẩm định
            </button>
          )}
          {sk.trangThai === "submitted" && canReview && (
            <button onClick={() => onStatusChange(sk.id, "reviewing")}
              className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5">
              <Eye className="size-3.5" />Bắt đầu thẩm định
            </button>
          )}
          {sk.trangThai === "reviewing" && canReview && (
            <>
              <button onClick={() => onStatusChange(sk.id, "approved")}
                className="flex-1 py-2 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5"
                style={{ background: "#dcfce7", color: "#16a34a" }}>
                <ThumbsUp className="size-3.5" />Chấp thuận
              </button>
              <button onClick={() => onStatusChange(sk.id, "rejected")}
                className="flex-1 py-2 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5"
                style={{ background: "#fee2e2", color: "#dc2626" }}>
                <ThumbsDown className="size-3.5" />Từ chối
              </button>
            </>
          )}
          {(sk.trangThai === "approved" || sk.trangThai === "rejected") && (
            <button className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-1.5">
              <Download className="size-3.5" />Xuất PDF
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
export function SangKienPage({ user }: { user: LoginUser }) {
  const { primary } = useTheme();
  const [list, setList] = useState<SangKien[]>(SANG_KIEN_LIST);
  const [search, setSearch] = useState("");
  const [filterPL, setFilterPL] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [detail, setDetail] = useState<SangKien | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const handleStatusChange = (id: string, status: TrangThai) => {
    setList(prev => prev.map(sk => sk.id === id ? { ...sk, trangThai: status } : sk));
    setDetail(prev => prev?.id === id ? { ...prev, trangThai: status } : prev);
  };

  const isManager = ["quản trị hệ thống","lãnh đạo cấp cao","hội đồng","lãnh đạo đơn vị"].includes(user.role);
  const displayList = user.role === "cá nhân" ? list.filter(sk => sk.tacGia === user.name) : list;

  const filtered = displayList.filter(sk => {
    const q = search.toLowerCase();
    const matchQ = !q || sk.tieuDe.toLowerCase().includes(q) || sk.tacGia.toLowerCase().includes(q) || sk.donVi.toLowerCase().includes(q);
    const matchPL = filterPL === "all" || sk.phanLoai === filterPL;
    const matchSt = filterStatus === "all" || sk.trangThai === filterStatus;
    return matchQ && matchPL && matchSt;
  });

  const stats = {
    total: displayList.length,
    approved: displayList.filter(s => s.trangThai === "approved").length,
    reviewing: displayList.filter(s => s.trangThai === "reviewing").length,
    avgScore: displayList.filter(s => s.diemSo).length
      ? Math.round(displayList.filter(s => s.diemSo).reduce((a, s) => a + (s.diemSo ?? 0), 0) / displayList.filter(s => s.diemSo).length)
      : 0,
  };

  return (
    <div className="px-6 py-6 space-y-5 max-w-screen-xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">Sáng kiến</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Quản lý sáng kiến cải tiến – gửi thẩm định – theo dõi kết quả</p>
        </div>
        <div className="flex items-center gap-2">
          {isManager && (
            <button className="btn btn-secondary btn-sm flex items-center gap-1.5">
              <Download className="size-3.5" />Xuất Excel
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Plus className="size-3.5" />Thêm sáng kiến
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng sáng kiến", value: stats.total, color: "#7c3aed", bg: "#f5f3ff", icon: Lightbulb },
          { label: "Được chấp thuận", value: stats.approved, color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
          { label: "Đang thẩm định", value: stats.reviewing, color: "#7c3aed", bg: "#f5f3ff", icon: Eye },
          { label: "Điểm trung bình", value: stats.avgScore || "—", color: "#d97706", bg: "#fef3c7", icon: Star },
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
          <input className="ds-input ds-input-sm w-full pl-9" placeholder="Tìm tiêu đề, tác giả, đơn vị…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ds-input ds-input-sm" value={filterPL} onChange={e => setFilterPL(e.target.value)}>
          <option value="all">Tất cả phân loại</option>
          {Object.entries(PHAN_LOAI_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="ds-input ds-input-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(STATUS_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="ml-auto shrink-0 whitespace-nowrap text-[13px] text-[#64748b]">{filtered.length} sáng kiến</span>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(sk => {
          const st = STATUS_MAP[sk.trangThai];
          const pl = PHAN_LOAI_MAP[sk.phanLoai];
          const StIcon = st.icon;
          return (
            <div key={sk.id}
              className="ds-card ds-card-default rounded-xl p-5 cursor-pointer transition-all hover:shadow-md"
              onClick={() => setDetail(sk)}>
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#f5f3ff" }}>
                  <Lightbulb className="size-5" style={{ color: "#7c3aed" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
                      style={{ background: pl.color + "20", color: pl.color }}>{pl.label}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded font-medium"
                      style={{ background: st.bg, color: st.color }}>
                      <StIcon className="size-3 inline mr-1" />{st.label}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#f1f5f9] text-[#64748b]">
                      {CAP_MAP[sk.capApDung]}
                    </span>
                    {sk.diemSo !== undefined && (
                      <span className="text-[11px] px-2 py-0.5 rounded font-bold"
                        style={{ background: "#f0fdf4", color: "#16a34a" }}>
                        ★ {sk.diemSo}/100
                      </span>
                    )}
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-1 leading-snug">{sk.tieuDe}</h3>
                  <p className="text-[13px] text-[#64748b] line-clamp-2 mb-2">{sk.moTa}</p>
                  <div className="flex items-center gap-4 text-[12px] text-[#94a3b8]">
                    <span className="flex items-center gap-1"><Users className="size-3" />{sk.tacGia}</span>
                    <span className="flex items-center gap-1"><Tag className="size-3" />{sk.donVi}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="size-3" />{sk.ngayTao}</span>
                  </div>
                </div>
                <ChevronRight className="size-5 text-[#94a3b8] shrink-0 mt-2" />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#64748b]">
            <Lightbulb className="size-10 mx-auto mb-3 text-[#cbd5e1]" />
            <p className="text-[14px]">Không tìm thấy sáng kiến nào</p>
          </div>
        )}
      </div>

      {detail && (
        <SangKienDetail sk={detail} user={user} onClose={() => setDetail(null)} onStatusChange={handleStatusChange} />
      )}

      {showAdd && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-slate-900">Thêm sáng kiến mới</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#64748b] hover:text-slate-900"><X className="size-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Tiêu đề sáng kiến <span className="text-red-500">*</span></label>
                <input className="ds-input w-full" placeholder="Nhập tên sáng kiến" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Phân loại</label>
                <select className="ds-input w-full">
                  {Object.entries(PHAN_LOAI_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Cấp áp dụng</label>
                <select className="ds-input w-full">
                  {Object.entries(CAP_MAP).map(([k,v]) => <option key={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Mô tả <span className="text-red-500">*</span></label>
                <textarea className="ds-input w-full resize-none" rows={4} placeholder="Mô tả chi tiết sáng kiến và cách thức thực hiện" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Lợi ích dự kiến</label>
                <input className="ds-input w-full" placeholder="VD: Tiết kiệm 50 giờ/năm, tăng độ chính xác 20%" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] flex gap-3">
              <button onClick={() => setShowAdd(false)} className="btn btn-secondary btn-md flex-1">Hủy</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-primary btn-md flex-1">Lưu dự thảo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
