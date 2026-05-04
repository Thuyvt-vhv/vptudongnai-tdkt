import { useState } from "react";
import {
  Search, Plus, Download, FileText, CalendarDays, Tag,
  ChevronRight, X, Eye, Edit3, Trash2, ExternalLink,
  BookOpen, Filter, Building2,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type LoaiVB = "nghi-quyet" | "quyet-dinh" | "chi-thi" | "thong-tu" | "cong-van" | "ke-hoach";
interface VanBan {
  id: string;
  soHieu: string;
  tenVanBan: string;
  loai: LoaiVB;
  coQuanBanHanh: string;
  ngayBanHanh: string;
  ngayHieuLuc: string;
  noidungTomTat: string;
  linhVuc: string;
  fileDinhKem?: string;
  tags: string[];
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const VAN_BAN_LIST: VanBan[] = [
  {
    id: "vb1", soHieu: "NĐ 98/2023/NĐ-CP",
    tenVanBan: "Nghị định quy định về xét tặng danh hiệu thi đua và hình thức khen thưởng",
    loai: "nghi-quyet", coQuanBanHanh: "Chính phủ", ngayBanHanh: "15/12/2023", ngayHieuLuc: "01/01/2024",
    noidungTomTat: "Quy định chi tiết về tiêu chuẩn, quy trình xét tặng các danh hiệu thi đua và hình thức khen thưởng theo Luật TĐKT 2022.",
    linhVuc: "Thi đua – Khen thưởng", tags: ["Danh hiệu", "Khen thưởng", "Tiêu chuẩn"],
    fileDinhKem: "ND_98_2023.pdf",
  },
  {
    id: "vb2", soHieu: "NĐ 152/2025/NĐ-CP",
    tenVanBan: "Nghị định sửa đổi, bổ sung NĐ 98/2023/NĐ-CP về thi đua khen thưởng",
    loai: "nghi-quyet", coQuanBanHanh: "Chính phủ", ngayBanHanh: "14/06/2025", ngayHieuLuc: "01/07/2025",
    noidungTomTat: "Sửa đổi một số điều về quy trình bỏ phiếu Hội đồng, tiêu chí xét tặng Huân chương và điều kiện xét CSTĐ cơ sở.",
    linhVuc: "Thi đua – Khen thưởng", tags: ["Sửa đổi", "Hội đồng", "Huân chương"],
    fileDinhKem: "ND_152_2025.pdf",
  },
  {
    id: "vb3", soHieu: "TT 01/2024/TT-BNV",
    tenVanBan: "Thông tư hướng dẫn thực hiện một số điều của Luật Thi đua, Khen thưởng",
    loai: "thong-tu", coQuanBanHanh: "Bộ Nội vụ", ngayBanHanh: "20/03/2024", ngayHieuLuc: "05/05/2024",
    noidungTomTat: "Hướng dẫn chi tiết về biểu mẫu, hồ sơ đề nghị khen thưởng, thời hạn và quy trình trình khen.",
    linhVuc: "Thi đua – Khen thưởng", tags: ["Biểu mẫu", "Hướng dẫn", "Quy trình"],
    fileDinhKem: "TT_01_2024_BNV.pdf",
  },
  {
    id: "vb4", soHieu: "Luật TĐKT số 35/2022/QH15",
    tenVanBan: "Luật Thi đua, Khen thưởng năm 2022",
    loai: "quyet-dinh", coQuanBanHanh: "Quốc hội", ngayBanHanh: "15/06/2022", ngayHieuLuc: "01/01/2024",
    noidungTomTat: "Luật mới nhất quy định về phong trào thi đua, danh hiệu thi đua, hình thức khen thưởng và thủ tục xét khen.",
    linhVuc: "Thi đua – Khen thưởng", tags: ["Luật", "Cơ sở pháp lý"],
    fileDinhKem: "Luat_TDKT_2022.pdf",
  },
  {
    id: "vb5", soHieu: "KH 01/KH-TU/2026",
    tenVanBan: "Kế hoạch triển khai phong trào thi đua năm 2026 của Tỉnh ủy Đồng Nai",
    loai: "ke-hoach", coQuanBanHanh: "Tỉnh ủy Đồng Nai", ngayBanHanh: "02/01/2026", ngayHieuLuc: "02/01/2026",
    noidungTomTat: "Kế hoạch chi tiết triển khai các phong trào thi đua theo chủ đề năm 2026, phân công trách nhiệm từng đơn vị.",
    linhVuc: "Thi đua cơ sở", tags: ["Kế hoạch", "2026", "Phong trào"],
    fileDinhKem: "KH_01_2026_TU.pdf",
  },
  {
    id: "vb6", soHieu: "CT 02/CT-UBND/2026",
    tenVanBan: "Chỉ thị về tăng cường công tác thi đua khen thưởng trên địa bàn tỉnh Đồng Nai",
    loai: "chi-thi", coQuanBanHanh: "UBND Tỉnh Đồng Nai", ngayBanHanh: "15/01/2026", ngayHieuLuc: "15/01/2026",
    noidungTomTat: "Chỉ đạo các sở, ban, ngành, UBND huyện/thành phố tăng cường công tác tổ chức phong trào thi đua thiết thực, hiệu quả.",
    linhVuc: "Thi đua – Khen thưởng", tags: ["Chỉ đạo", "Tăng cường", "Địa phương"],
    fileDinhKem: "CT_02_2026_UBND.pdf",
  },
  {
    id: "vb7", soHieu: "CV 123/VP-TU/2025",
    tenVanBan: "Công văn hướng dẫn thu thập hồ sơ khen thưởng đợt cuối năm 2025",
    loai: "cong-van", coQuanBanHanh: "Văn phòng Tỉnh ủy", ngayBanHanh: "01/10/2025", ngayHieuLuc: "01/10/2025",
    noidungTomTat: "Hướng dẫn các đơn vị về quy trình, thủ tục, biểu mẫu thu thập hồ sơ đề nghị khen thưởng đợt cuối năm.",
    linhVuc: "Hành chính", tags: ["Cuối năm", "Hồ sơ", "Hướng dẫn"],
    fileDinhKem: "CV_123_2025_VPTU.pdf",
  },
];

const LOAI_VB_MAP: Record<LoaiVB, { label: string; color: string }> = {
  "nghi-quyet": { label: "Nghị định",   color: "#7c3aed" },
  "quyet-dinh": { label: "Quyết định",  color: "#1C5FBE" },
  "chi-thi":    { label: "Chỉ thị",     color: "#c8102e" },
  "thong-tu":   { label: "Thông tư",    color: "#0891b2" },
  "cong-van":   { label: "Công văn",    color: "#64748b" },
  "ke-hoach":   { label: "Kế hoạch",    color: "#16a34a" },
};

export function ChiDaoTDKTPage({ user }: { user: LoginUser }) {
  const { primary } = useTheme();
  const [list] = useState<VanBan[]>(VAN_BAN_LIST);
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState<string>("all");
  const [detail, setDetail] = useState<VanBan | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const canEdit = ["quản trị hệ thống","lãnh đạo cấp cao"].includes(user.role);

  const filtered = list.filter(vb => {
    const q = search.toLowerCase();
    const matchQ = !q || vb.tenVanBan.toLowerCase().includes(q) || vb.soHieu.toLowerCase().includes(q) || vb.coQuanBanHanh.toLowerCase().includes(q);
    const matchLoai = filterLoai === "all" || vb.loai === filterLoai;
    return matchQ && matchLoai;
  });

  return (
    <div className="px-6 py-6 space-y-5 max-w-screen-xl">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">Chỉ đạo TĐKT</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Văn bản chỉ đạo, pháp lý về thi đua khen thưởng</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <Download className="size-3.5" />Xuất Excel
          </button>
          {canEdit && (
            <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm flex items-center gap-1.5">
              <Plus className="size-3.5" />Thêm văn bản
            </button>
          )}
        </div>
      </div>

      {/* Filters — one horizontal bar */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <div className="relative shrink-0 w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]" />
          <input className="ds-input ds-input-sm w-full pl-9" placeholder="Tìm số hiệu, tên văn bản…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="w-px h-5 bg-[#e2e8f0] shrink-0" />
        <button onClick={() => setFilterLoai("all")}
          className="shrink-0 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all"
          style={{ borderColor: filterLoai === "all" ? primary : "#e2e8f0", background: filterLoai === "all" ? primary + "15" : "white", color: filterLoai === "all" ? primary : "#475569" }}>
          Tất cả ({list.length})
        </button>
        {Object.entries(LOAI_VB_MAP).map(([k, v]) => {
          const count = list.filter(vb => vb.loai === k).length;
          if (!count) return null;
          return (
            <button key={k} onClick={() => setFilterLoai(k)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all"
              style={{ borderColor: filterLoai === k ? v.color : "#e2e8f0", background: filterLoai === k ? v.color + "15" : "white", color: filterLoai === k ? v.color : "#475569" }}>
              {v.label} ({count})
            </button>
          );
        })}
        <span className="ml-auto shrink-0 text-[13px] text-[#64748b]">{filtered.length} văn bản</span>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(vb => {
          const lt = LOAI_VB_MAP[vb.loai];
          return (
            <div key={vb.id}
              className="ds-card ds-card-default rounded-xl p-5 cursor-pointer transition-all hover:shadow-md"
              onClick={() => setDetail(vb)}>
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: lt.color + "18" }}>
                  <BookOpen className="size-5" style={{ color: lt.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-[12px] font-bold" style={{ color: lt.color }}>{vb.soHieu}</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded"
                      style={{ background: lt.color + "18", color: lt.color }}>{lt.label}</span>
                    {vb.tags.map(tag => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-[#f1f5f9] text-[#64748b]">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-1 leading-snug">{vb.tenVanBan}</h3>
                  <p className="text-[13px] text-[#64748b] line-clamp-2 mb-2">{vb.noidungTomTat}</p>
                  <div className="flex items-center gap-4 text-[12px] text-[#94a3b8]">
                    <span className="flex items-center gap-1"><Building2 className="size-3" />{vb.coQuanBanHanh}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="size-3" />Ban hành: {vb.ngayBanHanh}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="size-3" />Hiệu lực: {vb.ngayHieuLuc}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {vb.fileDinhKem && (
                    <button className="flex items-center gap-1 text-[12px] text-[#1C5FBE] hover:underline"
                      onClick={e => e.stopPropagation()}>
                      <Download className="size-3.5" />Tải về
                    </button>
                  )}
                  <ChevronRight className="size-4 text-[#94a3b8] mt-2" />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#64748b]">
            <BookOpen className="size-10 mx-auto mb-3 text-[#cbd5e1]" />
            <p className="text-[14px]">Không tìm thấy văn bản nào</p>
          </div>
        )}
      </div>

      {/* Detail */}
      {detail && (
        <div className="fixed inset-0 z-[80] flex justify-end" style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setDetail(null)}>
          <div className="w-[520px] h-full bg-white flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[#e2e8f0]"
              style={{ background: "linear-gradient(135deg,#0f2040,#1C5FBE)" }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[12px] font-bold px-2 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>{detail.soHieu}</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded"
                      style={{ background: LOAI_VB_MAP[detail.loai].color + "40", color: "white" }}>
                      {LOAI_VB_MAP[detail.loai].label}
                    </span>
                  </div>
                  <h2 className="text-[15px] font-bold text-white leading-snug">{detail.tenVanBan}</h2>
                </div>
                <button onClick={() => setDetail(null)} className="text-white/60 hover:text-white"><X className="size-5" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-3">
                {[
                  { label: "Cơ quan ban hành", value: detail.coQuanBanHanh },
                  { label: "Ngày ban hành", value: detail.ngayBanHanh },
                  { label: "Ngày hiệu lực", value: detail.ngayHieuLuc },
                  { label: "Lĩnh vực", value: detail.linhVuc },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-[13px] py-2 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b]">{row.label}</span>
                    <span className="font-medium text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900 mb-2">Tóm tắt nội dung</h3>
                <p className="text-[13px] text-[#475569] leading-relaxed">{detail.noidungTomTat}</p>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900 mb-2">Từ khóa</h3>
                <div className="flex flex-wrap gap-2">
                  {detail.tags.map(tag => (
                    <span key={tag} className="text-[12px] px-3 py-1 rounded-full bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#e2e8f0] flex gap-2">
              {detail.fileDinhKem && (
                <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5">
                  <Download className="size-3.5" />Tải file đính kèm
                </button>
              )}
              {canEdit && (
                <button className="btn btn-secondary btn-sm flex items-center justify-center gap-1.5 px-4">
                  <Edit3 className="size-3.5" />Sửa
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-slate-900">Thêm văn bản chỉ đạo</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#64748b] hover:text-slate-900"><X className="size-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Số hiệu</label>
                  <input className="ds-input w-full" placeholder="VD: NĐ 01/2027/NĐ-CP" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Loại văn bản</label>
                  <select className="ds-input w-full">
                    {Object.entries(LOAI_VB_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Tên văn bản <span className="text-red-500">*</span></label>
                <input className="ds-input w-full" placeholder="Tên đầy đủ của văn bản" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Cơ quan ban hành</label>
                <input className="ds-input w-full" placeholder="VD: Chính phủ, Bộ Nội vụ…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Ngày ban hành</label>
                  <input type="date" className="ds-input w-full" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Ngày hiệu lực</label>
                  <input type="date" className="ds-input w-full" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Tóm tắt nội dung</label>
                <textarea className="ds-input w-full resize-none" rows={3} placeholder="Tóm tắt ngắn gọn nội dung chính" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] flex gap-3">
              <button onClick={() => setShowAdd(false)} className="btn btn-secondary btn-md flex-1">Hủy</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-primary btn-md flex-1">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
