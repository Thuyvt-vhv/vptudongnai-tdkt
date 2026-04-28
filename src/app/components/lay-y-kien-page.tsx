import { useState, useEffect } from "react";
import {
  MessageSquare, Plus, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Calendar, Users, ThumbsUp, ThumbsDown, MessageCircle,
  FileText, Download, Eye, Send, Search, Filter, Shield, Info,
  BarChart2, Megaphone, PenLine, X, ChevronDown, ChevronUp,
  Timer, Check, Star, Building2, User, ArrowRight, Loader2,
  ClipboardCheck, Scale, BookOpen, Bell
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";
import { DsButton } from "./ds-button";

/* ─── Types ─────────────────────────────────────────────────────── */
type YKStatus = "chua_bat_dau" | "dang_lay" | "sap_het_han" | "da_ket_thuc" | "da_tong_hop";
type YKienType = "tan_thanh" | "khong_tan_thanh" | "co_y_kien";

interface YKien {
  id: string;
  hoTen: string;
  donVi: string;
  chucVu: string;
  loai: YKienType;
  noiDung: string;
  thoiGian: string;
  anonymous: boolean;
}

interface ConsultationRecord {
  id: string;
  maHoSo: string;
  tenDoiTuong: string;
  loaiDoiTuong: "ca_nhan" | "tap_the";
  chucVu?: string;
  donVi: string;
  hinhThucKhenThuong: string;
  capKhenThuong: string;
  tomTatThanhTich: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  soNgayQuyDinh: number;
  status: YKStatus;
  tongYKien: number;
  tanThanh: number;
  khongTanThanh: number;
  coYKien: number;
  yKienList: YKien[];
  nguoiTaoId: string;
  nguoiTaoTen: string;
  nguoiTaoRole: string;
  ghiChu: string;
  canCuPhapLy: string[];
  daXuatBan: boolean; // public or internal
}

/* ─── Mock data ──────────────────────────────────────────────────── */
const today = new Date("2026-04-23");

function daysLeft(end: string): number {
  const d = new Date(end);
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  return diff;
}

function soNgayDaLay(start: string): number {
  const d = new Date(start);
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  return Math.max(0, diff);
}

const initRecords: ConsultationRecord[] = [
  {
    id: "YK-2026-012",
    maHoSo: "TĐKT-2026-047",
    tenDoiTuong: "Lê Thị Thanh Xuân",
    loaiDoiTuong: "ca_nhan",
    chucVu: "Phó Giám đốc",
    donVi: "Sở Giáo dục & Đào tạo",
    hinhThucKhenThuong: "Bằng khen Chủ tịch UBND Tỉnh",
    capKhenThuong: "Cấp tỉnh",
    tomTatThanhTich: "Xuất sắc trong công tác quản lý, phát triển giáo dục toàn diện; hoàn thành 100% chỉ tiêu năm học 2025–2026. Được tập thể tín nhiệm cao, không có khiếu nại, tố cáo.",
    ngayBatDau: "2026-04-14",
    ngayKetThuc: "2026-04-24",
    soNgayQuyDinh: 10,
    status: "sap_het_han",
    tongYKien: 18,
    tanThanh: 15,
    khongTanThanh: 1,
    coYKien: 2,
    nguoiTaoId: "cv001",
    nguoiTaoTen: "Võ Minh Tuấn",
    nguoiTaoRole: "Chuyên viên TĐKT",
    ghiChu: "Ưu tiên xử lý. Hạn trình ký 26/04/2026.",
    canCuPhapLy: ["Điều 17 Luật TĐKT 2022", "Điều 5 NĐ 152/2025/NĐ-CP", "Khoản 3 Điều 8 TT 15/2025/TT-BNV"],
    daXuatBan: true,
    yKienList: [
      { id:"yk1", hoTen:"Nguyễn Thị Mai", donVi:"Phòng GD Tiểu học", chucVu:"Chuyên viên", loai:"tan_thanh", noiDung:"Đồng chí Xuân có thành tích xuất sắc trong 5 năm liên tục, xứng đáng được khen thưởng.", thoiGian:"2026-04-15", anonymous:false },
      { id:"yk2", hoTen:"Trần Văn Long", donVi:"Phòng GD THPT", chucVu:"Trưởng phòng", loai:"tan_thanh", noiDung:"Tôi nhất trí đề nghị xét khen thưởng. Thành tích đã được kiểm chứng.", thoiGian:"2026-04-15", anonymous:false },
      { id:"yk3", hoTen:"Phạm Thị Hoa", donVi:"Văn phòng Sở", chucVu:"Chuyên viên", loai:"tan_thanh", noiDung:"Đồng ý. Đồng chí Xuân luôn gương mẫu trong công việc.", thoiGian:"2026-04-16", anonymous:false },
      { id:"yk4", hoTen:"Ẩn danh", donVi:"—", chucVu:"—", loai:"co_y_kien", noiDung:"Đề nghị xem xét lại thành tích năm 2023 – có thông tin chưa được xác minh đầy đủ.", thoiGian:"2026-04-17", anonymous:true },
      { id:"yk5", hoTen:"Lê Hoàng Đức", donVi:"Thanh tra Sở", chucVu:"Thanh tra viên", loai:"tan_thanh", noiDung:"Qua kiểm tra hồ sơ, không phát hiện vi phạm. Tán thành đề nghị.", thoiGian:"2026-04-18", anonymous:false },
      { id:"yk6", hoTen:"Ẩn danh", donVi:"—", chucVu:"—", loai:"khong_tan_thanh", noiDung:"Chưa đủ 5 năm giữ chức vụ Phó Giám đốc theo quy định của đơn vị.", thoiGian:"2026-04-19", anonymous:true },
      { id:"yk7", hoTen:"Bùi Thanh Nga", donVi:"Phòng Kế hoạch – Tài chính", chucVu:"Phó phòng", loai:"tan_thanh", noiDung:"Ủng hộ. Đồng chí có nhiều đóng góp trong cải cách hành chính.", thoiGian:"2026-04-20", anonymous:false },
      { id:"yk8", hoTen:"Đinh Văn Cường", donVi:"Trường THPT Lê Quý Đôn", chucVu:"Hiệu trưởng", loai:"tan_thanh", noiDung:"Tôi xác nhận thành tích của đồng chí Xuân trong công tác chỉ đạo chuyên môn.", thoiGian:"2026-04-20", anonymous:false },
      { id:"yk9", hoTen:"Trương Thị Kim", donVi:"Phòng GD Mầm non", chucVu:"Chuyên viên", loai:"co_y_kien", noiDung:"Xem xét bổ sung thêm thành tích 2022–2023 trước khi chốt hồ sơ.", thoiGian:"2026-04-21", anonymous:false },
      { id:"yk10", hoTen:"Ngô Minh Hiếu", donVi:"Văn phòng Sở", chucVu:"Chánh văn phòng", loai:"tan_thanh", noiDung:"Nhất trí tán thành. Hồ sơ đúng quy trình, thành tích rõ ràng.", thoiGian:"2026-04-22", anonymous:false },
    ],
  },
  {
    id: "YK-2026-011",
    maHoSo: "TĐKT-2026-046",
    tenDoiTuong: "Phòng CSGT – CA Tỉnh Đồng Nai",
    loaiDoiTuong: "tap_the",
    donVi: "Công an Tỉnh Đồng Nai",
    hinhThucKhenThuong: "Cờ thi đua Chính phủ",
    capKhenThuong: "Cấp nhà nước",
    tomTatThanhTich: "Tập thể xuất sắc, đảm bảo trật tự ATGT, giảm 18% tai nạn so với năm 2025. Xử lý nghiêm 100% vi phạm nồng độ cồn.",
    ngayBatDau: "2026-04-10",
    ngayKetThuc: "2026-04-20",
    soNgayQuyDinh: 10,
    status: "da_tong_hop",
    tongYKien: 24,
    tanThanh: 22,
    khongTanThanh: 0,
    coYKien: 2,
    nguoiTaoId: "cv001",
    nguoiTaoTen: "Võ Minh Tuấn",
    nguoiTaoRole: "Chuyên viên TĐKT",
    ghiChu: "Đã tổng hợp, chuyển sang bình xét HĐ.",
    canCuPhapLy: ["Điều 17 Luật TĐKT 2022", "Điều 5 NĐ 152/2025/NĐ-CP", "Khoản 3 Điều 8 TT 15/2025/TT-BNV"],
    daXuatBan: true,
    yKienList: [],
  },
  {
    id: "YK-2026-010",
    maHoSo: "TĐKT-2026-045",
    tenDoiTuong: "Nguyễn Phú Trọng Khoa",
    loaiDoiTuong: "ca_nhan",
    chucVu: "Bác sĩ CKI",
    donVi: "Bệnh viện Đa khoa Đồng Nai",
    hinhThucKhenThuong: "Chiến sĩ thi đua cấp Tỉnh",
    capKhenThuong: "Cấp tỉnh",
    tomTatThanhTich: "Hoàn thành xuất sắc nhiệm vụ khám chữa bệnh, đạt danh hiệu CSTĐ 5 năm liên tục.",
    ngayBatDau: "2026-04-23",
    ngayKetThuc: "2026-05-03",
    soNgayQuyDinh: 10,
    status: "dang_lay",
    tongYKien: 3,
    tanThanh: 3,
    khongTanThanh: 0,
    coYKien: 0,
    nguoiTaoId: "cv001",
    nguoiTaoTen: "Võ Minh Tuấn",
    nguoiTaoRole: "Chuyên viên TĐKT",
    ghiChu: "",
    canCuPhapLy: ["Điều 17 Luật TĐKT 2022", "Điều 5 NĐ 152/2025/NĐ-CP", "Khoản 3 Điều 8 TT 15/2025/TT-BNV"],
    daXuatBan: true,
    yKienList: [
      { id:"yk11", hoTen:"Trần Thị Hương", donVi:"Khoa Nội", chucVu:"Y tá trưởng", loai:"tan_thanh", noiDung:"Bác sĩ Khoa rất tận tâm, xứng đáng được khen thưởng.", thoiGian:"2026-04-23", anonymous:false },
      { id:"yk12", hoTen:"Lý Minh Đức", donVi:"Ban Giám đốc", chucVu:"Phó Giám đốc", loai:"tan_thanh", noiDung:"Nhất trí tán thành. Đồng chí có thành tích rõ ràng 5 năm liên tục.", thoiGian:"2026-04-23", anonymous:false },
      { id:"yk13", hoTen:"Võ Ngọc Linh", donVi:"Khoa Ngoại", chucVu:"Trưởng khoa", loai:"tan_thanh", noiDung:"Tôi xác nhận thành tích và ủng hộ đề nghị khen thưởng.", thoiGian:"2026-04-23", anonymous:false },
    ],
  },
  {
    id: "YK-2026-009",
    maHoSo: "TĐKT-2026-044",
    tenDoiTuong: "Chi bộ Sở Tài chính",
    loaiDoiTuong: "tap_the",
    donVi: "Sở Tài chính Đồng Nai",
    hinhThucKhenThuong: "Cờ thi đua UBND Tỉnh",
    capKhenThuong: "Cấp tỉnh",
    tomTatThanhTich: "Chi bộ trong sạch vững mạnh xuất sắc, hoàn thành tốt công tác thu ngân sách.",
    ngayBatDau: "2026-04-28",
    ngayKetThuc: "2026-05-07",
    soNgayQuyDinh: 7,
    status: "chua_bat_dau",
    tongYKien: 0,
    tanThanh: 0,
    khongTanThanh: 0,
    coYKien: 0,
    nguoiTaoId: "cv001",
    nguoiTaoTen: "Võ Minh Tuấn",
    nguoiTaoRole: "Chuyên viên TĐKT",
    ghiChu: "Lên lịch theo kế hoạch tháng 5.",
    canCuPhapLy: ["Điều 17 Luật TĐKT 2022", "Điều 5 NĐ 152/2025/NĐ-CP", "Khoản 3 Điều 8 TT 15/2025/TT-BNV"],
    daXuatBan: false,
    yKienList: [],
  },
];

/* ─── Status config ──────────────────────────────────────────────── */
const SC: Record<YKStatus, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  chua_bat_dau: { label: "Chưa bắt đầu", color: "#5a5040", bg: "#eef2f8", border: "#d9d1bd", icon: Clock },
  dang_lay:     { label: "Đang lấy ý kiến", color: "#1a6a2e", bg: "#d1fae5", border: "#6ee7b7", icon: Megaphone },
  sap_het_han:  { label: "Sắp hết hạn", color: "#92400e", bg: "#fef3c7", border: "#fcd34d", icon: AlertCircle },
  da_ket_thuc:  { label: "Đã kết thúc", color: "#1a4fa0", bg: "#dbeafe", border: "#93c5fd", icon: CheckCircle2 },
  da_tong_hop:  { label: "Đã tổng hợp", color: "#166534", bg: "#dcfce7", border: "#86efac", icon: ClipboardCheck },
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function fmtDate(s: string) {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

function getStatusColor(r: ConsultationRecord) {
  const left = daysLeft(r.ngayKetThuc);
  if (r.status === "da_tong_hop") return SC.da_tong_hop;
  if (left < 0) return SC.da_ket_thuc;
  if (left <= 2) return SC.sap_het_han;
  if (r.status === "dang_lay") return SC.dang_lay;
  return SC[r.status];
}

function pctTanThanh(r: ConsultationRecord) {
  if (!r.tongYKien) return 0;
  return Math.round((r.tanThanh / r.tongYKien) * 100);
}

/* ─── Subcomponents ─────────────────────────────────────────────── */
function LegalBanner() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[8px] border overflow-hidden"
      style={{ borderColor: "#1C5FBE30", background: "linear-gradient(to right, #ddeafc, #f0f6ff)" }}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setOpen(p => !p)}
      >
        <div className="size-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "#1C5FBE" }}>
          <Scale className="size-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-[#1a4fa0]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            Căn cứ pháp lý bắt buộc — Lấy ý kiến công khai
          </div>
          <div className="text-[13px] text-[#1a4fa0]/70 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
            Điều 17 Luật TĐKT 2022 · NĐ 152/2025/NĐ-CP · TT 15/2025/TT-BNV
          </div>
        </div>
        {open ? <ChevronUp className="size-4 text-[#1a4fa0] shrink-0" /> : <ChevronDown className="size-4 text-[#1a4fa0] shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: "#1C5FBE20" }}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              {
                law: "Luật TĐKT 2022",
                dieu: "Điều 17",
                noidung: "Tổ chức lấy ý kiến quần chúng tối thiểu 7 ngày làm việc trước khi lập hồ sơ trình cấp có thẩm quyền."
              },
              {
                law: "NĐ 152/2025/NĐ-CP",
                dieu: "Điều 5",
                noidung: "Công khai thông tin cá nhân, tập thể được đề nghị khen thưởng trên trang thông tin điện tử của đơn vị."
              },
              {
                law: "TT 15/2025/TT-BNV",
                dieu: "Khoản 3, Điều 8",
                noidung: "Biên bản lấy ý kiến phải thể hiện tỷ lệ tán thành, có chữ ký xác nhận của người chủ trì, kèm theo hồ sơ trình."
              },
            ].map(item => (
              <div key={item.law} className="rounded-[6px] p-3 bg-white/70 border"
                style={{ borderColor: "#1C5FBE20" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="size-3 text-[#1C5FBE]" />
                  <span className="text-[13px] text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                    {item.law} — {item.dieu}
                  </span>
                </div>
                <p className="text-[13px] text-[#4a5568] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                  {item.noidung}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusTag({ status }: { status: YKStatus; }) {
  const s = SC[status];
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[13px] border"
      style={{ color: s.color, background: s.bg, borderColor: s.border, fontFamily: "var(--font-sans)", fontWeight: 500 }}>
      <Icon className="size-3" />
      {s.label}
    </span>
  );
}

function CountdownBadge({ record }: { record: ConsultationRecord }) {
  const left = daysLeft(record.ngayKetThuc);
  const done = soNgayDaLay(record.ngayBatDau);
  const pct = Math.min(100, Math.round((done / record.soNgayQuyDinh) * 100));

  if (record.status === "da_tong_hop") {
    return (
      <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#166534", fontFamily: "var(--font-sans)" }}>
        <ClipboardCheck className="size-3.5" />
        <span>Đã tổng hợp biên bản</span>
      </div>
    );
  }

  if (left < 0) {
    return (
      <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#1a4fa0", fontFamily: "var(--font-sans)" }}>
        <CheckCircle2 className="size-3.5" />
        <span>Kết thúc {fmtDate(record.ngayKetThuc)}</span>
      </div>
    );
  }

  const color = left <= 2 ? "#c2410c" : left <= 4 ? "#b45309" : "#0f7a3e";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px]"
          style={{ color, fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          <Timer className="size-3.5" />
          <span>Còn {left} ngày</span>
        </div>
        <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
          {done}/{record.soNgayQuyDinh} ngày
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-[#e2e8f0]">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: left <= 2 ? "#c2410c" : left <= 4 ? "#b45309" : "#1C5FBE" }} />
      </div>
    </div>
  );
}

function OpinionBar({ record }: { record: ConsultationRecord }) {
  if (!record.tongYKien) return (
    <div className="text-[13px] text-[#635647] italic" style={{ fontFamily: "var(--font-sans)" }}>
      Chưa có ý kiến nào
    </div>
  );
  const pct = pctTanThanh(record);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[13px]" style={{ color: "#0f7a3e", fontFamily: "var(--font-sans)" }}>
          <ThumbsUp className="size-3" />
          <span className="font-semibold">{record.tanThanh}</span> tán thành
        </div>
        <div className="flex items-center gap-1 text-[13px]" style={{ color: "#c8102e", fontFamily: "var(--font-sans)" }}>
          <ThumbsDown className="size-3" />
          <span className="font-semibold">{record.khongTanThanh}</span> không
        </div>
        <div className="flex items-center gap-1 text-[13px]" style={{ color: "#b45309", fontFamily: "var(--font-sans)" }}>
          <MessageCircle className="size-3" />
          <span className="font-semibold">{record.coYKien}</span> bổ sung
        </div>
        <div className="ml-auto text-[13px] font-semibold" style={{ color: pct >= 75 ? "#0f7a3e" : "#c2410c", fontFamily: "var(--font-sans)" }}>
          {pct}%
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-[#e2e8f0] flex gap-0.5">
        <div className="h-full rounded-full" style={{ width: `${(record.tanThanh / record.tongYKien) * 100}%`, background: "#16a34a" }} />
        <div className="h-full rounded-full" style={{ width: `${(record.coYKien / record.tongYKien) * 100}%`, background: "#b45309" }} />
        <div className="h-full rounded-full" style={{ width: `${(record.khongTanThanh / record.tongYKien) * 100}%`, background: "#dc2626" }} />
      </div>
    </div>
  );
}

/* ─── Create Form ────────────────────────────────────────────────── */
function CreateForm({ onClose, onCreated }: { onClose: () => void; onCreated: (r: ConsultationRecord) => void }) {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    tenDoiTuong: "",
    loaiDoiTuong: "ca_nhan" as "ca_nhan" | "tap_the",
    chucVu: "",
    donVi: "",
    hinhThucKhenThuong: "",
    capKhenThuong: "Cấp tỉnh",
    maHoSo: "",
    tomTatThanhTich: "",
    ngayBatDau: "2026-04-28",
    soNgayQuyDinh: 10,
    ghiChu: "",
    daXuatBan: true,
  });

  const ngayKetThuc = new Date(form.ngayBatDau);
  ngayKetThuc.setDate(ngayKetThuc.getDate() + form.soNgayQuyDinh);
  const endStr = ngayKetThuc.toISOString().slice(0, 10);

  const handleSubmit = () => {
    if (!form.tenDoiTuong || !form.donVi || !form.hinhThucKhenThuong) return;
    const newR: ConsultationRecord = {
      id: `YK-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      maHoSo: form.maHoSo || `TĐKT-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      tenDoiTuong: form.tenDoiTuong,
      loaiDoiTuong: form.loaiDoiTuong,
      chucVu: form.chucVu,
      donVi: form.donVi,
      hinhThucKhenThuong: form.hinhThucKhenThuong,
      capKhenThuong: form.capKhenThuong,
      tomTatThanhTich: form.tomTatThanhTich,
      ngayBatDau: form.ngayBatDau,
      ngayKetThuc: endStr,
      soNgayQuyDinh: form.soNgayQuyDinh,
      status: "chua_bat_dau",
      tongYKien: 0,
      tanThanh: 0,
      khongTanThanh: 0,
      coYKien: 0,
      nguoiTaoId: "cv001",
      nguoiTaoTen: "Võ Minh Tuấn",
      nguoiTaoRole: "Chuyên viên TĐKT",
      ghiChu: form.ghiChu,
      canCuPhapLy: ["Điều 17 Luật TĐKT 2022", "Điều 5 NĐ 152/2025/NĐ-CP", "Khoản 3 Điều 8 TT 15/2025/TT-BNV"],
      daXuatBan: form.daXuatBan,
      yKienList: [],
    };
    onCreated(newR);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,20,38,0.55)" }}>
      <div className="w-full max-w-2xl rounded-[12px] bg-white shadow-[var(--shadow-modal)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b"
          style={{ borderColor: "var(--color-line)" }}>
          <div className="size-9 rounded-[6px] flex items-center justify-center"
            style={{ background: theme.tint }}>
            <Megaphone className="size-4" style={{ color: theme.primary }} />
          </div>
          <div className="flex-1">
            <h2 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
              Tạo đợt lấy ý kiến công khai mới
            </h2>
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              Bắt buộc theo Điều 17 Luật TĐKT 2022 — Tối thiểu 7 ngày làm việc
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X className="size-4" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Legal reminder */}
          <div className="flex items-start gap-2 p-3 rounded-[6px]" style={{ background: "#ddeafc", borderLeft: "3px solid #1C5FBE" }}>
            <Info className="size-3.5 mt-0.5 shrink-0 text-[#1C5FBE]" />
            <p className="text-[13px] text-[#1a4fa0] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
              Thời gian lấy ý kiến <strong>tối thiểu 7 ngày làm việc</strong>, kết quả phải lập thành biên bản có chữ ký kèm theo hồ sơ trình (TT 15/2025/TT-BNV).
            </p>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 ds-input-root">
              <label className="ds-input-label ds-input-label-required">Tên cá nhân / tập thể được đề nghị</label>
              <div className="ds-input-wrap">
                <input className="ds-input ds-input-md" placeholder="Nhập họ tên hoặc tên tập thể..."
                  value={form.tenDoiTuong} onChange={e => setForm(p => ({ ...p, tenDoiTuong: e.target.value }))} />
              </div>
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label">Loại đối tượng</label>
              <select className="ds-input ds-input-md"
                value={form.loaiDoiTuong}
                onChange={e => setForm(p => ({ ...p, loaiDoiTuong: e.target.value as "ca_nhan" | "tap_the" }))}>
                <option value="ca_nhan">Cá nhân</option>
                <option value="tap_the">Tập thể</option>
              </select>
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label">Chức vụ (cá nhân)</label>
              <div className="ds-input-wrap">
                <input className="ds-input ds-input-md" placeholder="VD: Trưởng phòng..."
                  value={form.chucVu} onChange={e => setForm(p => ({ ...p, chucVu: e.target.value }))} />
              </div>
            </div>
            <div className="col-span-2 ds-input-root">
              <label className="ds-input-label ds-input-label-required">Đơn vị</label>
              <div className="ds-input-wrap">
                <input className="ds-input ds-input-md" placeholder="Tên đơn vị công tác..."
                  value={form.donVi} onChange={e => setForm(p => ({ ...p, donVi: e.target.value }))} />
              </div>
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label ds-input-label-required">Hình thức khen thưởng</label>
              <select className="ds-input ds-input-md"
                value={form.hinhThucKhenThuong}
                onChange={e => setForm(p => ({ ...p, hinhThucKhenThuong: e.target.value }))}>
                <option value="">-- Chọn hình thức --</option>
                {["Huân chương Lao động hạng Nhất","Huân chương Lao động hạng Nhì","Huân chương Lao động hạng Ba",
                  "Bằng khen Thủ tướng Chính phủ","Bằng khen Bộ/Ban/Ngành TW","Bằng khen Chủ tịch UBND Tỉnh",
                  "Chiến sĩ thi đua Toàn quốc","Chiến sĩ thi đua cấp Bộ","Chiến sĩ thi đua cấp Tỉnh",
                  "Cờ thi đua Chính phủ","Cờ thi đua UBND Tỉnh","Giấy khen"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label">Cấp khen thưởng</label>
              <select className="ds-input ds-input-md"
                value={form.capKhenThuong}
                onChange={e => setForm(p => ({ ...p, capKhenThuong: e.target.value }))}>
                {["Cấp nhà nước","Cấp Bộ","Cấp tỉnh","Cấp đơn vị"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label">Mã hồ sơ liên kết</label>
              <div className="ds-input-wrap">
                <input className="ds-input ds-input-md" placeholder="VD: TĐKT-2026-050..."
                  value={form.maHoSo} onChange={e => setForm(p => ({ ...p, maHoSo: e.target.value }))} />
              </div>
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label ds-input-label-required">
                Số ngày lấy ý kiến
                <span className="ml-1 text-[13px] text-[#635647] font-normal">(min: 7)</span>
              </label>
              <select className="ds-input ds-input-md"
                value={form.soNgayQuyDinh}
                onChange={e => setForm(p => ({ ...p, soNgayQuyDinh: Number(e.target.value) }))}>
                {[7,8,9,10,14,15,20,30].map(v => (
                  <option key={v} value={v}>{v} ngày</option>
                ))}
              </select>
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label ds-input-label-required">Ngày bắt đầu công khai</label>
              <div className="ds-input-wrap">
                <input type="date" className="ds-input ds-input-md"
                  value={form.ngayBatDau}
                  onChange={e => setForm(p => ({ ...p, ngayBatDau: e.target.value }))} />
              </div>
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label">Ngày kết thúc (tự động)</label>
              <div className="h-10 flex items-center px-3 rounded-[6px] bg-[#f9f6f0] border"
                style={{ borderColor: "var(--color-line)", fontFamily: "var(--font-sans)" }}>
                <span className="text-[14px] text-[#0b1426]">{fmtDate(endStr)}</span>
                <span className="ml-2 text-[13px] text-[#635647]">(+{form.soNgayQuyDinh} ngày)</span>
              </div>
            </div>
            <div className="col-span-2 ds-input-root">
              <label className="ds-input-label">Tóm tắt thành tích đề nghị</label>
              <textarea className="ds-input" rows={3}
                style={{ padding: "10px 12px", resize: "vertical" }}
                placeholder="Ghi tóm tắt thành tích nổi bật của cá nhân/tập thể..."
                value={form.tomTatThanhTich}
                onChange={e => setForm(p => ({ ...p, tomTatThanhTich: e.target.value }))} />
            </div>
            <div className="col-span-2 ds-input-root">
              <label className="ds-input-label">Ghi chú nội bộ</label>
              <div className="ds-input-wrap">
                <input className="ds-input ds-input-md" placeholder="Ghi chú cho nội bộ..."
                  value={form.ghiChu} onChange={e => setForm(p => ({ ...p, ghiChu: e.target.value }))} />
              </div>
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="size-4 rounded"
                  style={{ accentColor: theme.primary }}
                  checked={form.daXuatBan}
                  onChange={e => setForm(p => ({ ...p, daXuatBan: e.target.checked }))} />
                <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>
                  Xuất bản công khai trên Cổng thông tin điện tử đơn vị
                  <span className="ml-1 text-[13px] text-[#635647] font-normal">(theo Điều 5 NĐ 152/2025/NĐ-CP)</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t"
          style={{ borderColor: "var(--color-line)", background: "#f8fafc" }}>
          <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            Sau khi tạo, hệ thống sẽ gửi thông báo tới các thành viên liên quan.
          </p>
          <div className="flex items-center gap-2">
            <DsButton variant="secondary" size="md" onClick={onClose}>Hủy bỏ</DsButton>
            <DsButton variant="primary" size="md" onClick={handleSubmit}
              disabled={!form.tenDoiTuong || !form.donVi || !form.hinhThucKhenThuong}>
              <Megaphone className="size-4" />
              Tạo đợt lấy ý kiến
            </DsButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Opinion Submit Form ────────────────────────────────────────── */
function OpinionForm({ record, onClose, onSubmitted }: {
  record: ConsultationRecord;
  onClose: () => void;
  onSubmitted: (yk: YKien) => void;
}) {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    hoTen: "", donVi: "", chucVu: "",
    loai: "tan_thanh" as YKienType,
    noiDung: "",
    anonymous: false,
    agreed: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    if (!form.noiDung || !form.agreed) return;
    setSubmitting(true);
    setTimeout(() => {
      const yk: YKien = {
        id: `yk-${Date.now()}`,
        hoTen: form.anonymous ? "Ẩn danh" : (form.hoTen || "Ẩn danh"),
        donVi: form.anonymous ? "—" : (form.donVi || "—"),
        chucVu: form.anonymous ? "—" : (form.chucVu || "—"),
        loai: form.loai,
        noiDung: form.noiDung,
        thoiGian: "2026-04-23",
        anonymous: form.anonymous,
      };
      onSubmitted(yk);
      setSubmitting(false);
      setDone(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,20,38,0.55)" }}>
      <div className="w-full max-w-xl rounded-[12px] bg-white shadow-[var(--shadow-modal)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b"
          style={{ borderColor: "var(--color-line)" }}>
          <div className="size-9 rounded-[6px] flex items-center justify-center"
            style={{ background: "#d1fae5" }}>
            <MessageSquare className="size-4 text-[#0f7a3e]" />
          </div>
          <div className="flex-1">
            <h2 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
              Gửi ý kiến
            </h2>
            <p className="text-[13px] text-[#635647] truncate max-w-xs" style={{ fontFamily: "var(--font-sans)" }}>
              {record.tenDoiTuong} — {record.hinhThucKhenThuong}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X className="size-4" /></button>
        </div>

        {!done ? (
          <>
            <div className="px-6 py-5 space-y-4">
              {/* Loại ý kiến */}
              <div>
                <label className="ds-input-label mb-2 block">Quan điểm của bạn</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { val: "tan_thanh" as YKienType, icon: ThumbsUp, label: "Tán thành", color: "#0f7a3e", bg: "#d1fae5", activeBorder: "#16a34a" },
                    { val: "khong_tan_thanh" as YKienType, icon: ThumbsDown, label: "Không tán thành", color: "#c8102e", bg: "#fee2e2", activeBorder: "#dc2626" },
                    { val: "co_y_kien" as YKienType, icon: MessageCircle, label: "Có ý kiến bổ sung", color: "#b45309", bg: "#fef3c7", activeBorder: "#b45309" },
                  ]).map(opt => {
                    const Icon = opt.icon;
                    const active = form.loai === opt.val;
                    return (
                      <button key={opt.val}
                        onClick={() => setForm(p => ({ ...p, loai: opt.val }))}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-[8px] border-2 transition-all duration-150"
                        style={{
                          background: active ? opt.bg : "#fff",
                          borderColor: active ? opt.activeBorder : "var(--color-line)",
                        }}>
                        <Icon className="size-4" style={{ color: opt.color }} />
                        <span className="text-[13px] text-center leading-tight"
                          style={{ color: opt.color, fontFamily: "var(--font-sans)", fontWeight: active ? 600 : 400 }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nội dung */}
              <div className="ds-input-root">
                <label className="ds-input-label ds-input-label-required">Nội dung ý kiến</label>
                <textarea className="ds-input" rows={4}
                  style={{ padding: "10px 12px", resize: "vertical" }}
                  placeholder="Trình bày ý kiến của bạn một cách cụ thể, khách quan..."
                  value={form.noiDung}
                  onChange={e => setForm(p => ({ ...p, noiDung: e.target.value }))} />
              </div>

              {/* Anonymous toggle */}
              <div className="rounded-[6px] p-3 border" style={{ borderColor: "var(--color-line)", background: "#f8fafc" }}>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" className="size-4 mt-0.5 rounded"
                    style={{ accentColor: theme.primary }}
                    checked={form.anonymous}
                    onChange={e => setForm(p => ({ ...p, anonymous: e.target.checked }))} />
                  <div>
                    <span className="text-[13px] text-[#0b1426] block" style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}>
                      Gửi ẩn danh
                    </span>
                    <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                      Tên và đơn vị của bạn sẽ được ẩn. Hệ thống vẫn lưu thông tin để phòng chống spam.
                    </span>
                  </div>
                </label>
              </div>

              {/* Thông tin người gửi */}
              {!form.anonymous && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="ds-input-root col-span-1">
                    <label className="ds-input-label">Họ và tên</label>
                    <input className="ds-input ds-input-md" placeholder="Nguyễn Văn A"
                      value={form.hoTen} onChange={e => setForm(p => ({ ...p, hoTen: e.target.value }))} />
                  </div>
                  <div className="ds-input-root col-span-1">
                    <label className="ds-input-label">Đơn vị</label>
                    <input className="ds-input ds-input-md" placeholder="Phòng/Ban..."
                      value={form.donVi} onChange={e => setForm(p => ({ ...p, donVi: e.target.value }))} />
                  </div>
                  <div className="ds-input-root col-span-1">
                    <label className="ds-input-label">Chức vụ</label>
                    <input className="ds-input ds-input-md" placeholder="Chuyên viên..."
                      value={form.chucVu} onChange={e => setForm(p => ({ ...p, chucVu: e.target.value }))} />
                  </div>
                </div>
              )}

              {/* Xác nhận */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" className="size-4 mt-0.5 rounded"
                  style={{ accentColor: theme.primary }}
                  checked={form.agreed}
                  onChange={e => setForm(p => ({ ...p, agreed: e.target.checked }))} />
                <span className="text-[13px] text-[#4a5568] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                  Tôi xác nhận ý kiến này là trung thực, khách quan và chịu trách nhiệm trước pháp luật về nội dung đã gửi.
                </span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t"
              style={{ borderColor: "var(--color-line)", background: "#f8fafc" }}>
              <DsButton variant="secondary" size="md" onClick={onClose}>Hủy</DsButton>
              <DsButton variant="primary" size="md"
                disabled={!form.noiDung || !form.agreed || submitting}
                onClick={handleSubmit}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Gửi ý kiến
              </DsButton>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="size-16 rounded-full flex items-center justify-center" style={{ background: "#d1fae5" }}>
              <CheckCircle2 className="size-8 text-[#0f7a3e]" />
            </div>
            <div>
              <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                Ý kiến đã được ghi nhận
              </h3>
              <p className="text-[13px] text-[#635647] mt-1 max-w-xs" style={{ fontFamily: "var(--font-sans)" }}>
                Cảm ơn bạn đã tham gia đóng góp ý kiến. Ý kiến sẽ được tổng hợp vào biên bản chính thức.
              </p>
            </div>
            <DsButton variant="primary" size="md" onClick={onClose}>Đóng</DsButton>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Detail Panel ───────────────────────────────────────────────── */
function DetailPanel({ record, onClose, onAddOpinion, user }: {
  record: ConsultationRecord;
  onClose: () => void;
  onAddOpinion: () => void;
  user: LoginUser;
}) {
  const { theme } = useTheme();
  const [filterLoai, setFilterLoai] = useState<"all" | YKienType>("all");
  const pct = pctTanThanh(record);
  const left = daysLeft(record.ngayKetThuc);
  const done = soNgayDaLay(record.ngayBatDau);
  const isActive = record.status === "dang_lay" || record.status === "sap_het_han";

  const filtered = record.yKienList.filter(y =>
    filterLoai === "all" || y.loai === filterLoai
  );

  return (
    <div className="fixed inset-0 z-40 flex justify-end"
      style={{ background: "rgba(11,20,38,0.4)" }}
      onClick={e => { if (e.currentTarget === e.target) onClose(); }}>
      <div className="w-full max-w-2xl bg-white h-full flex flex-col shadow-[-4px_0_32px_rgba(11,20,38,0.15)]">
        {/* Header */}
        <div className="flex items-start gap-4 px-6 py-5 border-b"
          style={{ borderColor: "var(--color-line)", background: "var(--color-paper)" }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                {record.id} · {record.maHoSo}
              </span>
              <StatusTag status={record.status} />
            </div>
            <h2 className="text-[18px] text-[#0b1426] leading-snug" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
              {record.tenDoiTuong}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-[13px] text-[#4a5568]" style={{ fontFamily: "var(--font-sans)" }}>
                {record.loaiDoiTuong === "ca_nhan" ? <User className="size-3" /> : <Users className="size-3" />}
                {record.loaiDoiTuong === "ca_nhan" ? record.chucVu : "Tập thể"}
              </span>
              <span className="text-[#e2e8f0]">·</span>
              <span className="flex items-center gap-1 text-[13px] text-[#4a5568]" style={{ fontFamily: "var(--font-sans)" }}>
                <Building2 className="size-3" />
                {record.donVi}
              </span>
              <span className="text-[#e2e8f0]">·</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[13px] bg-[#ddeafc] text-[#1a4fa0] border border-[#1C5FBE30]"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}>
                <Star className="size-2.5" />
                {record.hinhThucKhenThuong}
              </span>
            </div>
          </div>
          <button className="btn-icon shrink-0" onClick={onClose}><X className="size-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Timeline + stats */}
          <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--color-line)" }}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Countdown */}
              <div className="rounded-[8px] p-4 border" style={{ borderColor: "var(--color-line)", background: "#fff" }}>
                <div className="text-[13px] text-[#635647] mb-2" style={{ fontFamily: "var(--font-sans)" }}>
                  Tiến độ thời gian
                </div>
                <CountdownBadge record={record} />
                <div className="mt-2.5 flex items-center justify-between text-[13px] text-[#635647]"
                  style={{ fontFamily: "var(--font-sans)" }}>
                  <span>{fmtDate(record.ngayBatDau)}</span>
                  <span>{fmtDate(record.ngayKetThuc)}</span>
                </div>
              </div>
              {/* Opinion stats */}
              <div className="rounded-[8px] p-4 border" style={{ borderColor: "var(--color-line)", background: "#fff" }}>
                <div className="text-[13px] text-[#635647] mb-2" style={{ fontFamily: "var(--font-sans)" }}>
                  Kết quả ý kiến ({record.tongYKien} người)
                </div>
                <OpinionBar record={record} />
                {record.tongYKien > 0 && (
                  <div className="mt-2.5">
                    <div className={`text-[13px] font-semibold ${pct >= 75 ? "text-[#0f7a3e]" : "text-[#c2410c]"}`}
                      style={{ fontFamily: "var(--font-sans)" }}>
                      {pct >= 75 ? "✓ Đủ điều kiện tổng hợp" : "⚠ Tỷ lệ tán thành thấp"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thành tích */}
            <div className="rounded-[6px] p-3 bg-[#f8fafc] border" style={{ borderColor: "var(--color-line)" }}>
              <div className="text-[13px] text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                Tóm tắt thành tích
              </div>
              <p className="text-[13px] text-[#0b1426] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                {record.tomTatThanhTich}
              </p>
            </div>

            {/* Pháp lý */}
            <div className="mt-3 flex items-start gap-2">
              <Shield className="size-3.5 mt-0.5 shrink-0 text-[#1C5FBE]" />
              <div className="flex flex-wrap gap-1.5">
                {record.canCuPhapLy.map(p => (
                  <span key={p} className="text-[13px] px-2 py-0.5 rounded bg-[#ddeafc] text-[#1a4fa0] border border-[#1C5FBE30]"
                    style={{ fontFamily: "var(--font-sans)" }}>{p}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Opinion list */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] text-[#0b1426]"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                Danh sách ý kiến ({record.yKienList.length})
              </h3>
              {/* Filter */}
              <div className="flex items-center gap-1">
                {(["all","tan_thanh","khong_tan_thanh","co_y_kien"] as const).map(f => {
                  const labels: Record<string, string> = { all:"Tất cả", tan_thanh:"Tán thành", khong_tan_thanh:"Không tán thành", co_y_kien:"Bổ sung" };
                  return (
                    <button key={f}
                      className="px-2 py-0.5 rounded text-[13px] border transition-colors"
                      style={{
                        fontFamily: "var(--font-sans)",
                        background: filterLoai === f ? theme.primary : "#fff",
                        color: filterLoai === f ? "#fff" : "#4a5568",
                        borderColor: filterLoai === f ? theme.primary : "var(--color-line)",
                      }}
                      onClick={() => setFilterLoai(f)}>
                      {labels[f]}
                    </button>
                  );
                })}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-10 text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                Chưa có ý kiến nào trong danh mục này.
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(yk => {
                  const icons: Record<YKienType, { icon: typeof ThumbsUp; color: string; bg: string }> = {
                    tan_thanh: { icon: ThumbsUp, color: "#0f7a3e", bg: "#d1fae5" },
                    khong_tan_thanh: { icon: ThumbsDown, color: "#c8102e", bg: "#fee2e2" },
                    co_y_kien: { icon: MessageCircle, color: "#b45309", bg: "#fef3c7" },
                  };
                  const conf = icons[yk.loai];
                  const Icon = conf.icon;
                  return (
                    <div key={yk.id} className="flex gap-3 p-3 rounded-[8px] border"
                      style={{ borderColor: "var(--color-line)", background: "#fff" }}>
                      <div className="size-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: conf.bg }}>
                        <Icon className="size-3.5" style={{ color: conf.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] text-[#0b1426]"
                            style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}>
                            {yk.anonymous ? "Ẩn danh" : yk.hoTen}
                          </span>
                          {!yk.anonymous && (
                            <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                              {yk.chucVu} · {yk.donVi}
                            </span>
                          )}
                          <span className="ml-auto text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                            {fmtDate(yk.thoiGian)}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#4a5568] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                          {yk.noiDung}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t flex items-center gap-2"
          style={{ borderColor: "var(--color-line)", background: "#f8fafc" }}>
          {isActive && (
            <DsButton variant="primary" size="md" onClick={onAddOpinion}>
              <MessageSquare className="size-4" />
              Gửi ý kiến
            </DsButton>
          )}
          {(record.status === "da_ket_thuc" || record.status === "da_tong_hop") && (
            <DsButton variant="secondary" size="md">
              <FileText className="size-4" />
              Xem biên bản
            </DsButton>
          )}
          <DsButton variant="secondary" size="md">
            <Download className="size-4" />
            Xuất PDF
          </DsButton>
          {(user.role === "hội đồng" || user.role === "quản trị hệ thống") &&
           record.status === "da_ket_thuc" && (
            <DsButton variant="primary" size="md" className="ml-auto">
              <ClipboardCheck className="size-4" />
              Lập biên bản tổng hợp
            </DsButton>
          )}
          {record.status === "da_tong_hop" && (user.role === "hội đồng" || user.role === "lãnh đạo cấp cao" || user.role === "quản trị hệ thống") && (
            <DsButton variant="primary" size="md" className="ml-auto">
              <ArrowRight className="size-4" />
              Chuyển sang Bình xét HĐ
            </DsButton>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Card component ─────────────────────────────────────────────── */
function ConsultCard({ record, onOpen }: { record: ConsultationRecord; onOpen: () => void }) {
  const left = daysLeft(record.ngayKetThuc);
  const statusConf = getStatusColor(record);
  const pct = pctTanThanh(record);

  return (
    <div
      className="ds-card ds-card-default ds-card-hoverable cursor-pointer rounded-[10px] overflow-hidden flex flex-col"
      onClick={onOpen}>
      {/* Top stripe */}
      <div className="h-1" style={{
        background: record.status === "sap_het_han"
          ? "linear-gradient(to right, #b45309, #f59e0b)"
          : record.status === "dang_lay"
          ? "linear-gradient(to right, #16a34a, #22c55e)"
          : record.status === "da_tong_hop"
          ? "linear-gradient(to right, #1C5FBE, #3b82f6)"
          : "#e2e8f0"
      }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Row 1 */}
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-[6px] flex items-center justify-center shrink-0"
            style={{ background: record.loaiDoiTuong === "ca_nhan" ? "#ddeafc" : "#fde8cc" }}>
            {record.loaiDoiTuong === "ca_nhan"
              ? <User className="size-4 text-[#1a4fa0]" />
              : <Users className="size-4 text-[#92400e]" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                {record.id}
              </span>
              <StatusTag status={record.status} />
              {record.daXuatBan && (
                <span className="text-[13px] px-1.5 py-0.5 rounded bg-[#d1fae5] text-[#0f7a3e] border border-[#6ee7b7]"
                  style={{ fontFamily: "var(--font-sans)" }}>
                  Đã xuất bản
                </span>
              )}
            </div>
            <div className="text-[14px] text-[#0b1426] leading-snug truncate"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
              {record.tenDoiTuong}
            </div>
            <div className="text-[13px] text-[#635647] truncate" style={{ fontFamily: "var(--font-sans)" }}>
              {record.chucVu ? `${record.chucVu} · ` : ""}{record.donVi}
            </div>
          </div>
        </div>

        {/* Award */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px]"
          style={{ background: "#f8fafc", border: "1px solid var(--color-line)" }}>
          <Star className="size-3 shrink-0" style={{ color: "#8a6400" }} />
          <span className="text-[13px] text-[#0b1426] truncate"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}>
            {record.hinhThucKhenThuong}
          </span>
          <span className="ml-auto text-[13px] text-[#635647] shrink-0" style={{ fontFamily: "var(--font-sans)" }}>
            {record.capKhenThuong}
          </span>
        </div>

        {/* Timeline */}
        <CountdownBadge record={record} />

        {/* Opinion summary */}
        <OpinionBar record={record} />

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t"
          style={{ borderColor: "var(--color-line)" }}>
          <div className="flex items-center gap-1.5 text-[13px] text-[#635647]"
            style={{ fontFamily: "var(--font-sans)" }}>
            <Calendar className="size-3" />
            {fmtDate(record.ngayBatDau)} – {fmtDate(record.ngayKetThuc)}
          </div>
          <div className="flex items-center gap-1 text-[13px]"
            style={{ color: "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 500 }}>
            Chi tiết <ChevronRight className="size-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Summary stats bar ──────────────────────────────────────────── */
function StatsBar({ records }: { records: ConsultationRecord[] }) {
  const { theme } = useTheme();
  const dang = records.filter(r => r.status === "dang_lay" || r.status === "sap_het_han").length;
  const sapHet = records.filter(r => r.status === "sap_het_han").length;
  const tongYKien = records.reduce((s, r) => s + r.tongYKien, 0);
  const tongDot = records.length;

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Tổng đợt", value: tongDot, icon: Megaphone, color: theme.primary, bg: theme.tint },
        { label: "Đang lấy ý kiến", value: dang, icon: Clock, color: "#0f7a3e", bg: "#d1fae5" },
        { label: "Sắp hết hạn", value: sapHet, icon: AlertCircle, color: "#92400e", bg: "#fef3c7" },
        { label: "Tổng ý kiến", value: tongYKien, icon: MessageSquare, color: "#4338ca", bg: "#e0e7ff" },
      ].map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="ds-card ds-card-flat rounded-[8px] p-4 flex items-center gap-3">
            <div className="size-9 rounded-[6px] flex items-center justify-center shrink-0"
              style={{ background: s.bg }}>
              <Icon className="size-4" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-[18px] text-[#0b1426]"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 700, lineHeight: 1.2 }}>
                {s.value}
              </div>
              <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                {s.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export function LayYKienPage({ user }: { user: LoginUser }) {
  const { theme } = useTheme();
  const [records, setRecords] = useState<ConsultationRecord[]>(initRecords);
  const [tab, setTab] = useState<"dang_lay" | "da_ket_thuc" | "chua_bat_dau">("dang_lay");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showOpinionForm, setShowOpinionForm] = useState(false);

  const selectedRecord = records.find(r => r.id === selectedId) ?? null;

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.tenDoiTuong.toLowerCase().includes(q) ||
      r.donVi.toLowerCase().includes(q) ||
      r.hinhThucKhenThuong.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q);
    const matchTab =
      tab === "dang_lay"
        ? r.status === "dang_lay" || r.status === "sap_het_han"
        : tab === "da_ket_thuc"
        ? r.status === "da_ket_thuc" || r.status === "da_tong_hop"
        : r.status === "chua_bat_dau";
    return matchSearch && matchTab;
  });

  const handleCreated = (r: ConsultationRecord) => {
    setRecords(prev => [r, ...prev]);
    setShowCreate(false);
  };

  const handleOpinionSubmitted = (yk: YKien) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== selectedId) return r;
      const newTotal = r.tongYKien + 1;
      return {
        ...r,
        yKienList: [...r.yKienList, yk],
        tongYKien: newTotal,
        tanThanh: yk.loai === "tan_thanh" ? r.tanThanh + 1 : r.tanThanh,
        khongTanThanh: yk.loai === "khong_tan_thanh" ? r.khongTanThanh + 1 : r.khongTanThanh,
        coYKien: yk.loai === "co_y_kien" ? r.coYKien + 1 : r.coYKien,
      };
    }));
  };

  const canCreate = user.role === "hội đồng" || user.role === "quản trị hệ thống";

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--color-paper)" }}>
      {/* Page header */}
      <div className="px-8 pt-6 pb-4 border-b" style={{ borderColor: "var(--color-line)", background: "var(--color-paper)" }}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="size-8 rounded-[6px] flex items-center justify-center"
                style={{ background: theme.tint }}>
                <Megaphone className="size-4" style={{ color: theme.primary }} />
              </div>
              <h1 className="text-[18px] text-[#0b1426]"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                Lấy ý kiến công khai
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[13px] bg-[#fee2e2] text-[#9f1239] border border-[#fca5a5]"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                <Shield className="size-3" />
                Bắt buộc theo luật
              </span>
            </div>
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              Quản lý các đợt lấy ý kiến trước khi trình hồ sơ — tối thiểu 7 ngày làm việc (Điều 17 Luật TĐKT 2022)
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DsButton variant="secondary" size="md">
              <Download className="size-4" />
              Xuất báo cáo
            </DsButton>
            {canCreate && (
              <DsButton variant="primary" size="md" onClick={() => setShowCreate(true)}>
                <Plus className="size-4" />
                Tạo đợt mới
              </DsButton>
            )}
          </div>
        </div>

        {/* Legal banner */}
        <LegalBanner />
      </div>

      {/* Stats */}
      <div className="px-8 pt-5 pb-0">
        <StatsBar records={records} />
      </div>

      {/* Tabs + search */}
      <div className="px-8 pt-5 pb-0 flex items-center gap-4 border-b"
        style={{ borderColor: "var(--color-line)" }}>
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {([
            { key: "dang_lay", label: "Đang lấy ý kiến", count: records.filter(r => r.status === "dang_lay" || r.status === "sap_het_han").length },
            { key: "da_ket_thuc", label: "Đã kết thúc / Tổng hợp", count: records.filter(r => r.status === "da_ket_thuc" || r.status === "da_tong_hop").length },
            { key: "chua_bat_dau", label: "Chưa bắt đầu", count: records.filter(r => r.status === "chua_bat_dau").length },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-[13px] border-b-2 transition-colors"
              style={{
                fontFamily: "var(--font-sans)",
                borderBottomColor: tab === t.key ? theme.primary : "transparent",
                color: tab === t.key ? theme.primary : "#635647",
                fontWeight: tab === t.key ? 600 : 400,
                background: "transparent",
              }}>
              {t.label}
              <span className="px-1.5 py-0.5 rounded text-[13px]"
                style={{
                  background: tab === t.key ? theme.tint : "#eef2f8",
                  color: tab === t.key ? theme.primary : "#5a5040",
                }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ml-auto mb-2">
          <div className="search-bar w-64">
            <Search className="size-3.5 text-[#635647] shrink-0" />
            <input
              className="flex-1 bg-transparent outline-none text-[13px] text-[#0b1426] placeholder:text-[#b8b0a0]"
              style={{ fontFamily: "var(--font-sans)" }}
              placeholder="Tìm kiếm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 py-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="size-16 rounded-full flex items-center justify-center"
              style={{ background: theme.tint }}>
              <Megaphone className="size-7" style={{ color: theme.primary }} />
            </div>
            <div>
              <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                Chưa có đợt lấy ý kiến nào
              </h3>
              <p className="text-[13px] text-[#635647] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                {canCreate ? "Nhấn \"Tạo đợt mới\" để bắt đầu." : "Chưa có đợt nào trong danh mục này."}
              </p>
            </div>
            {canCreate && (
              <DsButton variant="primary" size="md" onClick={() => setShowCreate(true)}>
                <Plus className="size-4" /> Tạo đợt lấy ý kiến
              </DsButton>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(r => (
              <ConsultCard
                key={r.id}
                record={r}
                onOpen={() => setSelectedId(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateForm
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {selectedRecord && (
        <DetailPanel
          record={selectedRecord}
          onClose={() => setSelectedId(null)}
          onAddOpinion={() => setShowOpinionForm(true)}
          user={user}
        />
      )}

      {selectedRecord && showOpinionForm && (
        <OpinionForm
          record={selectedRecord}
          onClose={() => setShowOpinionForm(false)}
          onSubmitted={yk => {
            handleOpinionSubmitted(yk);
            setShowOpinionForm(false);
          }}
        />
      )}
    </div>
  );
}
