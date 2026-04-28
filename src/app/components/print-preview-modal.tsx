import { useState } from "react";
import {
  X, Printer, Download, FileText, CheckCircle2, Shield,
  Building2, Hash, Award, User,
  Eye, FileCheck, Stamp, QrCode, Lock, BookOpen, BarChart2,
  Users, Vote, AlertCircle,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type DocType = "to_trinh" | "quyet_dinh" | "bien_ban" | "mau_bieu" | "bao_cao";
type Format  = "pdf" | "docx" | "xlsx";

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA — would be replaced by real campaign/participant data
═══════════════════════════════════════════════════════════════ */
const D = {
  soQuyetDinh:  "QĐ-2026-0147",
  soToTrinh:    "TT-HĐTĐKT-2026-04",
  soBienBan:    "BB-HĐTĐKT-2026-004",
  ngayKy:       "24/04/2026",
  ngayHop:      "22/04/2026",
  nguoiKy:      "Nguyễn Thanh Bình",
  chucVuNguoiKy:"Phó Chủ tịch UBND tỉnh Đồng Nai",
  chuToa:       "Nguyễn Thanh Bình — Phó Chủ tịch UBND tỉnh",
  thuKy:        "Trần Thị Lan — Chuyên viên VP Tỉnh ủy",
  canCu: [
    "Luật Thi đua, Khen thưởng năm 2022;",
    "Nghị định số 152/2025/NĐ-CP ngày 14/6/2025 của Chính phủ;",
    "Thông tư 15/2025/TT-BNV ngày 01/8/2025 của Bộ Nội vụ;",
    "Tờ trình số TT-HĐTĐKT-2026-04 ngày 22/04/2026 của Hội đồng TĐKT.",
  ],
  phongTrao:    "Thi đua hoàn thành xuất sắc nhiệm vụ năm 2026",
  soHieu:       "PT-2026-001",
  tongDonVi:    8,
  daDangKy:     6,
  tongHoSo:     12,
  soKhenThuong: 4,
  tongKinhPhi:  "20.000.000",
  nguonKP:      "Quỹ Thi đua Khen thưởng",
  winners: [
    { stt:1, ten:"Nguyễn Văn An",   donVi:"Phòng Tổng hợp",   danhHieu:"CSTĐCS", diem:95, tien:"3.000.000" },
    { stt:2, ten:"Trần Thị Bình",   donVi:"Phòng Hành chính", danhHieu:"CSTĐCS", diem:91, tien:"3.000.000" },
    { stt:3, ten:"Lê Minh Châu",    donVi:"Phòng Nội chính",  danhHieu:"CSTĐCS", diem:88, tien:"3.000.000" },
    { stt:4, ten:"Phạm Thị Dung",   donVi:"Phòng Tổng hợp",   danhHieu:"Giấy khen", diem:84, tien:"500.000" },
  ],
  thanhVienHD: [
    "Nguyễn Thanh Bình — Phó Chủ tịch UBND tỉnh — Chủ tịch HĐ",
    "Lê Văn Hùng — Giám đốc Sở Nội vụ — Phó Chủ tịch HĐ",
    "Trần Thị Mai — Phó Giám đốc Sở TC — Ủy viên",
    "Phạm Minh Tuấn — VP Tỉnh ủy — Ủy viên",
    "Nguyễn Thị Lan — Sở LĐ-TBXH — Ủy viên",
    "Võ Đình Nam — Sở GD-ĐT — Ủy viên",
    "Trần Thị Lan — VP Tỉnh ủy — Thư ký",
  ],
  ketQuaBoPieu: [
    { ten:"Nguyễn Văn An",   tanThanh:7, khongTanThanh:0 },
    { ten:"Trần Thị Bình",   tanThanh:6, khongTanThanh:1 },
    { ten:"Lê Minh Châu",    tanThanh:5, khongTanThanh:2 },
    { ten:"Phạm Thị Dung",   tanThanh:7, khongTanThanh:0 },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   DOC TYPE CONFIG
═══════════════════════════════════════════════════════════════ */
const DOC_TYPES: { id: DocType; label: string; icon: typeof FileText; desc: string; color: string }[] = [
  { id:"to_trinh",   label:"Tờ trình đề nghị",          icon:FileText,  desc:"Mẫu TT-HĐTĐKT theo TT 15/2025",   color:"#1C5FBE" },
  { id:"quyet_dinh", label:"Quyết định khen thưởng",    icon:FileCheck, desc:"QĐ chính thức có chữ ký số CA",     color:"#c8102e" },
  { id:"bien_ban",   label:"Biên bản Hội đồng",         icon:Stamp,     desc:"BB phiên họp HĐTĐKT xét duyệt",    color:"#7c3aed" },
  { id:"mau_bieu",   label:"Mẫu 01/TT15 — Tờ khai",    icon:BookOpen,  desc:"Tờ khai thành tích cá nhân chuẩn", color:"#92400e" },
  { id:"bao_cao",    label:"Báo cáo tổng kết PT",       icon:BarChart2, desc:"Tổng kết kết quả phong trào TĐKT",  color:"#0891b2" },
];

const FORMATS: { id: Format; label: string; color: string }[] = [
  { id:"pdf",  label:"PDF",  color:"#c8102e" },
  { id:"docx", label:"Word", color:"#1C5FBE" },
  { id:"xlsx", label:"Excel",color:"#166534" },
];

/* ─── Shared: document header ──────────────────────────────── */
function DocHeader({ left1, left2, soHieu, right1="CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", date }: {
  left1: string; left2: string; soHieu: string; right1?: string; date: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-0 mb-6" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="text-center border-r border-[#333] pr-4">
        <div className="text-[13px] uppercase tracking-wide font-bold text-[#0b1426]">{left1}</div>
        <div className="text-[13px] font-bold text-[#0b1426] mt-0.5 border-b-2 border-[#0b1426] pb-0.5 inline-block">{left2}</div>
        <div className="text-[13px] text-[#0b1426] mt-1">Số: {soHieu}</div>
      </div>
      <div className="text-center pl-4">
        <div className="text-[13px] uppercase font-bold text-[#0b1426]">{right1}</div>
        <div className="text-[13px] font-bold text-[#0b1426] mt-0.5 border-b-2 border-[#0b1426] pb-0.5 inline-block">Độc lập – Tự do – Hạnh phúc</div>
        <div className="text-[13px] text-[#0b1426] mt-1 italic">Đồng Nai, ngày {date}</div>
      </div>
    </div>
  );
}

/* ─── Shared: signature block ───────────────────────────────── */
function SignatureBlock({ role, name, isSigned }: { role: string; name: string; isSigned: boolean }) {
  return (
    <div className="text-center min-w-[180px]" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="text-[13px] font-bold uppercase text-[#0b1426] mb-4">{role}</div>
      {isSigned ? (
        <div className="flex flex-col items-center gap-1 mb-2">
          <div className="size-14 rounded-full border-4 border-[#c8102e] flex items-center justify-center opacity-80">
            <CheckCircle2 className="size-7 text-[#c8102e]" />
          </div>
          <span className="text-[13px] text-[#c8102e]" style={{ fontFamily: "JetBrains Mono,monospace" }}>ĐÃ KÝ SỐ CA</span>
        </div>
      ) : (
        <div className="h-12 flex items-center justify-center">
          <span className="text-[13px] text-[#d1d5db] italic">(chưa ký)</span>
        </div>
      )}
      <div className="text-[13px] font-bold text-[#0b1426]">{name}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT TEMPLATES
═══════════════════════════════════════════════════════════════ */

/* ── Tờ trình đề nghị khen thưởng ──────────────────────────── */
function ToTrinhDoc({ isSigned }: { isSigned: boolean }) {
  return (
    <div className="bg-white shadow-lg rounded-[4px] overflow-hidden relative" style={{ border: "1px solid #d1d5db" }}>
      {!isSigned && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.06]" style={{ transform: "rotate(-30deg)" }}>
          <span className="text-[72px] text-[#b45309] font-black" style={{ fontFamily: "var(--font-sans)" }}>BẢN NHÁP</span>
        </div>
      )}
      <div className="relative p-8 z-20" style={{ fontFamily: "var(--font-sans)" }}>
        <DocHeader
          left1="UBND TỈNH ĐỒNG NAI"
          left2="HỘI ĐỒNG TĐKT TỈNH"
          soHieu={D.soToTrinh}
          date={D.ngayHop}
        />

        <div className="text-center mb-5">
          <div className="text-[14px] font-black uppercase tracking-wide text-[#0b1426] mb-1">TỜ TRÌNH</div>
          <div className="text-[13px] text-[#0b1426]">V/v đề nghị khen thưởng kết quả</div>
          <div className="text-[13px] font-bold text-[#0b1426] mt-0.5">"{D.phongTrao}"</div>
        </div>

        <div className="mb-4 text-[13px] text-[#0b1426]">
          <span className="font-bold">Kính gửi:</span> Chủ tịch Ủy ban Nhân dân tỉnh Đồng Nai
        </div>

        <div className="mb-4 text-[13px] text-[#0b1426] leading-relaxed">
          Căn cứ Luật Thi đua, Khen thưởng năm 2022 và NĐ 152/2025/NĐ-CP ngày 14/6/2025; Hội đồng Thi đua Khen thưởng tỉnh Đồng Nai trân trọng báo cáo kết quả bình xét và đề nghị khen thưởng như sau:
        </div>

        <div className="mb-4">
          <div className="text-[13px] font-bold text-[#0b1426] uppercase mb-2">I. KẾT QUẢ PHONG TRÀO</div>
          <div className="pl-4 space-y-1.5 text-[13px] text-[#0b1426]">
            {[
              [`Phong trào:`, D.phongTrao],
              [`Mã phong trào:`, D.soHieu],
              [`Đơn vị tham gia:`, `${D.daDangKy}/${D.tongDonVi} đơn vị (${Math.round(D.daDangKy/D.tongDonVi*100)}%)`],
              [`Hồ sơ đề nghị:`, `${D.tongHoSo} hồ sơ`],
              [`Được đề nghị KT:`, `${D.soKhenThuong} cá nhân/tập thể`],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="font-semibold shrink-0" style={{ minWidth: 160 }}>– {k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <div className="text-[13px] font-bold text-[#0b1426] uppercase mb-2">II. DANH SÁCH ĐỀ NGHỊ KHEN THƯỞNG</div>
          <table className="w-full text-[13px] border-collapse" style={{ borderColor: "#d1d5db" }}>
            <thead>
              <tr style={{ background: "#f5f2ec" }}>
                {["STT", "Họ và tên", "Đơn vị", "Danh hiệu đề nghị", "Điểm"].map(h => (
                  <th key={h} className="border px-2 py-1.5 text-left font-bold text-[#0b1426]" style={{ borderColor: "#d1d5db" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {D.winners.map(w => (
                <tr key={w.stt}>
                  <td className="border px-2 py-1.5 text-center" style={{ borderColor: "#d1d5db" }}>{w.stt}</td>
                  <td className="border px-2 py-1.5 font-semibold" style={{ borderColor: "#d1d5db" }}>{w.ten}</td>
                  <td className="border px-2 py-1.5" style={{ borderColor: "#d1d5db" }}>{w.donVi}</td>
                  <td className="border px-2 py-1.5" style={{ borderColor: "#d1d5db" }}>{w.danhHieu}</td>
                  <td className="border px-2 py-1.5 text-center font-bold" style={{ borderColor: "#d1d5db", color: w.diem >= 90 ? "#166534" : "#b45309" }}>{w.diem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-5 text-[13px] text-[#0b1426] leading-relaxed">
          Hội đồng Thi đua Khen thưởng tỉnh kính trình Chủ tịch UBND tỉnh xem xét, phê duyệt danh sách trên và ban hành Quyết định khen thưởng theo quy định.
        </div>

        <div className="flex justify-between mt-6">
          <div className="text-center">
            <div className="text-[13px] text-[#0b1426] mb-1 italic">Nơi nhận:</div>
            <div className="text-[13px] text-[#5a5040] space-y-0.5 text-left">
              <div>– Như kính gửi;</div>
              <div>– Sở Nội vụ;</div>
              <div>– Lưu VP.</div>
            </div>
          </div>
          <SignatureBlock role="TM. HỘI ĐỒNG TĐKT TỈNH&#10;CHỦ TỊCH HỘI ĐỒNG" name={D.nguoiKy} isSigned={isSigned} />
        </div>
      </div>
    </div>
  );
}

/* ── Quyết định khen thưởng ─────────────────────────────────── */
function QuyetDinhDoc({ isSigned }: { isSigned: boolean }) {
  return (
    <div className="bg-white shadow-lg rounded-[4px] overflow-hidden relative" style={{ border: "1px solid #d1d5db" }}>
      {!isSigned && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.06]" style={{ transform: "rotate(-30deg)" }}>
          <span className="text-[80px] text-[#c8102e] font-black" style={{ fontFamily: "var(--font-sans)" }}>BẢN DỰ THẢO</span>
        </div>
      )}
      <div className="relative p-8 z-20" style={{ fontFamily: "var(--font-sans)" }}>
        <DocHeader
          left1="UBND TỈNH ĐỒNG NAI"
          left2="ĐẶC TRÁCH UBND TỈNH"
          soHieu={D.soQuyetDinh}
          date={D.ngayKy}
        />
        <div className="text-center mb-6">
          <div className="text-[14px] font-black uppercase tracking-wide text-[#0b1426] mb-1">QUYẾT ĐỊNH</div>
          <div className="text-[13px] text-[#0b1426]">Về việc tặng danh hiệu thi đua khen thưởng</div>
          <div className="text-[13px] font-bold text-[#0b1426] mt-0.5">kết quả {D.phongTrao}</div>
        </div>
        <div className="text-center mb-4">
          <span className="text-[13px] font-black uppercase text-[#0b1426]">CHỦ TỊCH UBND TỈNH ĐỒNG NAI</span>
        </div>
        <div className="mb-4">
          <div className="text-[13px] font-bold text-[#0b1426] mb-2">Căn cứ:</div>
          {D.canCu.map((c, i) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <span className="text-[13px] text-[#0b1426] shrink-0">–</span>
              <span className="text-[13px] text-[#0b1426] leading-relaxed italic">{c}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3 mb-5 text-[13px] text-[#0b1426]">
          <div>
            <span className="font-bold">Điều 1.</span>
            <span className="ml-2">Tặng danh hiệu thi đua và hình thức khen thưởng cho các cá nhân/tập thể có thành tích xuất sắc trong {D.phongTrao} theo danh sách đính kèm gồm {D.winners.length} người.</span>
          </div>
          <table className="w-full text-[13px] border-collapse mt-2">
            <thead>
              <tr style={{ background: "#f5f2ec" }}>
                {["STT", "Họ và tên", "Đơn vị", "Danh hiệu", "Tiền thưởng"].map(h => (
                  <th key={h} className="border px-2 py-1 text-left font-bold" style={{ borderColor: "#d1d5db" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {D.winners.map(w => (
                <tr key={w.stt}>
                  <td className="border px-2 py-1 text-center" style={{ borderColor: "#d1d5db" }}>{w.stt}</td>
                  <td className="border px-2 py-1 font-semibold" style={{ borderColor: "#d1d5db" }}>{w.ten}</td>
                  <td className="border px-2 py-1" style={{ borderColor: "#d1d5db" }}>{w.donVi}</td>
                  <td className="border px-2 py-1" style={{ borderColor: "#d1d5db" }}>{w.danhHieu}</td>
                  <td className="border px-2 py-1 text-right font-bold" style={{ borderColor: "#d1d5db", color: "#1C5FBE" }}>{w.tien} đ</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <span className="font-bold">Điều 2.</span>
            <span className="ml-2">Sở Nội vụ, Sở Tài chính và các cơ quan liên quan tổ chức chi trả tiền thưởng, hiện vật theo quy định tại TT 28/2025/TT-BTC.</span>
          </div>
          <div>
            <span className="font-bold">Điều 3.</span>
            <span className="ml-2">Quyết định có hiệu lực kể từ ngày ký. Chánh Văn phòng UBND tỉnh, Giám đốc Sở Nội vụ và các cá nhân có tên tại Điều 1 thi hành Quyết định này.</span>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <div className="text-[13px] text-[#5a5040] space-y-0.5">
            <div className="font-bold mb-1 text-[13px]">Nơi nhận:</div>
            <div>– Như Điều 3;</div>
            <div>– Sở Nội vụ, Sở Tài chính;</div>
            <div>– HĐTĐKT tỉnh;</div>
            <div>– Lưu VT.</div>
          </div>
          <SignatureBlock role={"TL. CHỦ TỊCH\n" + D.chucVuNguoiKy.toUpperCase()} name={D.nguoiKy} isSigned={isSigned} />
        </div>
        {isSigned && (
          <div className="mt-4 flex items-center gap-3 p-2.5 rounded-[8px]" style={{ background: "#f0f4ff", border: "1px solid #bfdbfe" }}>
            <QrCode className="size-8 text-[#1C5FBE] shrink-0" />
            <div>
              <div className="text-[13px] text-[#1C5FBE] font-bold">Xác thực điện tử — NĐ 130/2018/NĐ-CP</div>
              <div className="text-[13px] text-[#635647]" style={{ fontFamily: "JetBrains Mono,monospace" }}>VQ-2026-{D.soQuyetDinh} · RSA-2048 · SHA-256 verified</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Biên bản Hội đồng ──────────────────────────────────────── */
function BienBanDoc({ isSigned }: { isSigned: boolean }) {
  return (
    <div className="bg-white shadow-lg rounded-[4px] overflow-hidden relative" style={{ border: "1px solid #d1d5db" }}>
      {!isSigned && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.06]" style={{ transform: "rotate(-30deg)" }}>
          <span className="text-[72px] text-[#7c3aed] font-black" style={{ fontFamily: "var(--font-sans)" }}>BẢN NHÁP</span>
        </div>
      )}
      <div className="relative p-8 z-20" style={{ fontFamily: "var(--font-sans)" }}>
        <DocHeader
          left1="UBND TỈNH ĐỒNG NAI"
          left2="HỘI ĐỒNG TĐKT TỈNH"
          soHieu={D.soBienBan}
          date={D.ngayHop}
        />
        <div className="text-center mb-5">
          <div className="text-[14px] font-black uppercase tracking-wide text-[#0b1426] mb-1">BIÊN BẢN HỌP</div>
          <div className="text-[13px] font-bold text-[#0b1426]">Hội đồng Thi đua Khen thưởng tỉnh Đồng Nai</div>
          <div className="text-[13px] text-[#5a5040] mt-0.5 italic">
            Phiên xét duyệt kết quả {D.phongTrao}
          </div>
          <div className="text-[13px] text-[#5a5040]">
            Thời gian: 08h00 ngày {D.ngayHop} · Địa điểm: Phòng họp UBND tỉnh Đồng Nai
          </div>
        </div>

        {/* Thành phần dự họp */}
        <div className="mb-4">
          <div className="text-[13px] font-bold text-[#0b1426] uppercase mb-2">I. THÀNH PHẦN DỰ HỌP</div>
          <div className="pl-4 text-[13px] text-[#0b1426] space-y-1 mb-2">
            {D.thanhVienHD.map((tv, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="shrink-0 text-[#635647]">{i + 1}.</span>
                <span>{tv}</span>
              </div>
            ))}
          </div>
          <div className="pl-4 text-[13px] text-[#0b1426]">
            <span className="font-semibold">Số thành viên có mặt:</span> 7/7 ✅ <em>(đạt túc số 2/3 theo Điều 57 Luật TĐKT)</em>
          </div>
        </div>

        {/* Nội dung cuộc họp */}
        <div className="mb-4">
          <div className="text-[13px] font-bold text-[#0b1426] uppercase mb-2">II. NỘI DUNG CUỘC HỌP</div>
          <div className="pl-4 text-[13px] text-[#0b1426] leading-relaxed space-y-2">
            <p>Chủ tọa khai mạc phiên họp và thông báo danh sách {D.soKhenThuong} hồ sơ được đề nghị khen thưởng sau khi đã qua thẩm định cấp cơ sở.</p>
            <p>Thư ký đọc tóm tắt từng hồ sơ: thành tích nổi bật, điểm xếp loại, kết quả thẩm định cơ sở.</p>
            <p>Hội đồng thảo luận, đặt câu hỏi làm rõ với cán bộ phụ trách hồ sơ.</p>
            <p>Tiến hành bỏ phiếu kín theo từng cá nhân/tập thể (ngưỡng thông qua ≥ 5/7 phiếu tán thành).</p>
          </div>
        </div>

        {/* Kết quả bỏ phiếu */}
        <div className="mb-4">
          <div className="text-[13px] font-bold text-[#0b1426] uppercase mb-2">III. KẾT QUẢ BỎ PHIẾU KÍN</div>
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr style={{ background: "#f5f3ff" }}>
                {["STT", "Họ và tên", "Danh hiệu", "Tán thành", "Không TH", "Tỷ lệ", "Kết quả"].map(h => (
                  <th key={h} className="border px-2 py-1.5 text-left font-bold" style={{ borderColor: "#c4b5fd" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {D.ketQuaBoPieu.map((r, i) => {
                const total = r.tanThanh + r.khongTanThanh;
                const passed = r.tanThanh >= 5;
                return (
                  <tr key={i} style={{ background: passed ? "#f0fdf4" : "#fff1f2" }}>
                    <td className="border px-2 py-1.5 text-center" style={{ borderColor: "#d1d5db" }}>{i + 1}</td>
                    <td className="border px-2 py-1.5 font-semibold" style={{ borderColor: "#d1d5db" }}>{r.ten}</td>
                    <td className="border px-2 py-1.5" style={{ borderColor: "#d1d5db" }}>{D.winners[i]?.danhHieu}</td>
                    <td className="border px-2 py-1.5 text-center font-bold text-[#166534]" style={{ borderColor: "#d1d5db" }}>{r.tanThanh}</td>
                    <td className="border px-2 py-1.5 text-center font-bold text-[#c8102e]" style={{ borderColor: "#d1d5db" }}>{r.khongTanThanh}</td>
                    <td className="border px-2 py-1.5 text-center" style={{ borderColor: "#d1d5db" }}>{Math.round(r.tanThanh / total * 100)}%</td>
                    <td className="border px-2 py-1.5 text-center font-bold" style={{ borderColor: "#d1d5db", color: passed ? "#166534" : "#c8102e" }}>
                      {passed ? "✅ Thông qua" : "❌ Không đạt"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Kết luận */}
        <div className="mb-5">
          <div className="text-[13px] font-bold text-[#0b1426] uppercase mb-2">IV. KẾT LUẬN</div>
          <div className="pl-4 text-[13px] text-[#0b1426] leading-relaxed space-y-1.5">
            <p>Hội đồng thống nhất đề nghị khen thưởng <strong>{D.winners.filter((_, i) => D.ketQuaBoPieu[i]?.tanThanh >= 5).length}/{D.soKhenThuong}</strong> hồ sơ đã được bỏ phiếu thông qua.</p>
            <p>Giao Văn phòng Hội đồng tổng hợp, lập Tờ trình trình Chủ tịch UBND tỉnh ký ban hành Quyết định khen thưởng.</p>
            <p>Biên bản kết thúc vào lúc 10h30 ngày {D.ngayHop}, được toàn thể thành viên nhất trí thông qua.</p>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <SignatureBlock role="THƯ KÝ" name="Trần Thị Lan" isSigned={isSigned} />
          <SignatureBlock role={"CHỦ TỌA\n" + D.chuToa.split("—")[0].trim().toUpperCase()} name={D.nguoiKy} isSigned={isSigned} />
        </div>
      </div>
    </div>
  );
}

/* ── Mẫu 01/TT15 — Tờ khai thành tích cá nhân ──────────────── */
function MauBieuDoc({ isSigned }: { isSigned: boolean }) {
  const w = D.winners[0];
  return (
    <div className="bg-white shadow-lg rounded-[4px] relative" style={{ border: "1px solid #d1d5db" }}>
      {!isSigned && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.06]" style={{ transform: "rotate(-30deg)" }}>
          <span className="text-[72px] text-[#92400e] font-black" style={{ fontFamily: "var(--font-sans)" }}>BẢN NHÁP</span>
        </div>
      )}
      <div className="relative p-8 z-20" style={{ fontFamily: "var(--font-sans)" }}>
        {/* Form header */}
        <div className="text-right text-[13px] text-[#5a5040] mb-3 italic">
          Mẫu số 01/TT15 (Ban hành kèm theo Thông tư 15/2025/TT-BNV ngày 01/8/2025 của Bộ Nội vụ)
        </div>
        <div className="text-center mb-5">
          <div className="text-[14px] font-black uppercase text-[#0b1426] mb-1">TỜ KHAI THÀNH TÍCH CÁ NHÂN</div>
          <div className="text-[13px] text-[#0b1426]">(Đề nghị tặng danh hiệu thi đua, hình thức khen thưởng)</div>
        </div>

        {/* Section I */}
        <div className="mb-4">
          <div className="text-[13px] font-bold text-[#0b1426] uppercase bg-[#f5f2ec] px-3 py-1.5 mb-3">I. THÔNG TIN CÁ NHÂN</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 pl-2 text-[13px] text-[#0b1426]">
            {[
              ["Họ và tên:", w.ten],
              ["Ngày sinh:", "15/03/1985"],
              ["Giới tính:", "Nam"],
              ["Dân tộc:", "Kinh"],
              ["Đảng viên:", "Có · Ngày vào: 20/10/2010"],
              ["Trình độ học vấn:", "Đại học"],
              ["Chuyên môn:", "Quản lý nhà nước"],
              ["Chức vụ:", "Chuyên viên chính"],
              ["Đơn vị công tác:", w.donVi],
              ["Điện thoại:", "0912 345 678"],
              ["Email:", "nguyenvan.an@dongnai.gov.vn"],
              ["Năm thi đua liên tiếp:", "3 năm (2023–2025)"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="font-semibold shrink-0" style={{ minWidth: 150 }}>– {k}</span>
                <span className="border-b border-dashed border-[#d1d5db] flex-1 pb-0.5">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section II */}
        <div className="mb-4">
          <div className="text-[13px] font-bold text-[#0b1426] uppercase bg-[#f5f2ec] px-3 py-1.5 mb-3">II. THÀNH TÍCH NỔI BẬT (Căn cứ Điều 7 TT 12/2019/TT-BNV)</div>
          <div className="pl-2 space-y-2 text-[13px] text-[#0b1426]">
            <div className="p-2.5 rounded" style={{ background: "#faf7f2", border: "1px solid #e8e2d4" }}>
              Hoàn thành xuất sắc 100% nhiệm vụ được giao năm 2025. Chủ trì 02 đề tài nghiên cứu cấp tỉnh được nghiệm thu xếp loại Xuất sắc. Có 01 sáng kiến kinh nghiệm được Hội đồng sáng kiến tỉnh công nhận, tiết kiệm ngân sách ước tính 250 triệu đồng/năm.
            </div>
          </div>
        </div>

        {/* Section III */}
        <div className="mb-4">
          <div className="text-[13px] font-bold text-[#0b1426] uppercase bg-[#f5f2ec] px-3 py-1.5 mb-3">III. DANH HIỆU ĐÃ ĐƯỢC TẶNG</div>
          <table className="w-full text-[13px] border-collapse pl-2">
            <thead>
              <tr style={{ background: "#f5f2ec" }}>
                {["Năm", "Danh hiệu/Hình thức KT", "Cơ quan tặng"].map(h => (
                  <th key={h} className="border px-2 py-1 text-left font-bold" style={{ borderColor: "#d1d5db" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["2023", "Lao động tiên tiến",              "Sở GD-ĐT Đồng Nai"],
                ["2024", "Chiến sĩ Thi đua cơ sở",          "VP Tỉnh ủy Đồng Nai"],
                ["2025", "Bằng khen Giám đốc Sở",           "Sở GD-ĐT Đồng Nai"],
              ].map(([nam, dh, co]) => (
                <tr key={nam}>
                  <td className="border px-2 py-1" style={{ borderColor: "#d1d5db" }}>{nam}</td>
                  <td className="border px-2 py-1" style={{ borderColor: "#d1d5db" }}>{dh}</td>
                  <td className="border px-2 py-1" style={{ borderColor: "#d1d5db" }}>{co}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section IV — Hình thức đề nghị */}
        <div className="mb-5 text-[13px] text-[#0b1426]">
          <div className="text-[13px] font-bold uppercase bg-[#f5f2ec] px-3 py-1.5 mb-2">IV. ĐỀ NGHỊ XÉT TẶNG</div>
          <div className="pl-2">
            Đề nghị tặng danh hiệu: <strong className="text-[#1C5FBE]">{w.danhHieu}</strong> năm 2026
          </div>
        </div>

        {/* Signature block */}
        <div className="flex justify-between mt-6">
          <div className="text-center">
            <div className="text-[13px] font-bold uppercase text-[#0b1426] mb-6">XÁC NHẬN CỦA THỦ TRƯỞNG ĐƠN VỊ</div>
            <div className="h-10" />
            <div className="text-[13px] text-[#635647] italic">(Ký tên, đóng dấu)</div>
          </div>
          <div className="text-center">
            <div className="text-[13px] text-[#0b1426] italic mb-1">Đồng Nai, ngày {D.ngayKy}</div>
            <div className="text-[13px] font-bold uppercase text-[#0b1426] mb-6">NGƯỜI KHAI</div>
            {isSigned ? (
              <div className="flex flex-col items-center gap-1">
                <div className="size-12 rounded-full border-4 border-[#1C5FBE] flex items-center justify-center opacity-80">
                  <CheckCircle2 className="size-6 text-[#1C5FBE]" />
                </div>
              </div>
            ) : <div className="h-10" />}
            <div className="text-[13px] font-bold text-[#0b1426] mt-2">{w.ten}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Báo cáo tổng kết phong trào ────────────────────────────── */
function BaoCaoDoc({ isSigned }: { isSigned: boolean }) {
  return (
    <div className="bg-white shadow-lg rounded-[4px] relative" style={{ border: "1px solid #d1d5db" }}>
      {!isSigned && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.06]" style={{ transform: "rotate(-30deg)" }}>
          <span className="text-[72px] text-[#0891b2] font-black" style={{ fontFamily: "var(--font-sans)" }}>BẢN NHÁP</span>
        </div>
      )}
      <div className="relative p-8 z-20" style={{ fontFamily: "var(--font-sans)" }}>
        <DocHeader
          left1="UBND TỈNH ĐỒNG NAI"
          left2="HỘI ĐỒNG TĐKT TỈNH"
          soHieu={`BC-HĐTĐKT-2026-${D.soHieu}`}
          date={D.ngayKy}
        />
        <div className="text-center mb-5">
          <div className="text-[14px] font-black uppercase tracking-wide text-[#0b1426] mb-1">BÁO CÁO TỔNG KẾT</div>
          <div className="text-[13px] font-bold text-[#0b1426]">{D.phongTrao}</div>
          <div className="text-[13px] text-[#5a5040] italic mt-0.5">Mã: {D.soHieu} · Kỳ xét: 2026</div>
        </div>

        {/* KPI summary */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Đơn vị tham gia", val: `${D.daDangKy}/${D.tongDonVi}`, color: "#1C5FBE", bg: "#ddeafc" },
            { label: "Hồ sơ nộp",       val: `${D.tongHoSo}`,                color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Được khen",        val: `${D.soKhenThuong}`,            color: "#166534", bg: "#dcfce7" },
            { label: "Tổng kinh phí",    val: `${D.tongKinhPhi} đ`,           color: "#92400e", bg: "#fef3c7" },
          ].map(k => (
            <div key={k.label} className="text-center p-2.5 rounded-[8px]" style={{ background: k.bg }}>
              <div className="text-[14px] font-bold" style={{ color: k.color, fontFamily: "var(--font-sans)" }}>{k.val}</div>
              <div className="text-[13px] mt-0.5" style={{ color: k.color }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Section I */}
        <div className="mb-4">
          <div className="text-[13px] font-bold uppercase bg-[#e0f2fe] px-3 py-1.5 mb-3 text-[#0891b2]">I. KẾT QUẢ TRIỂN KHAI PHONG TRÀO</div>
          <div className="pl-2 text-[13px] text-[#0b1426] space-y-1.5">
            <p>Phong trào được phát động từ tháng 01/2026, có <strong>{D.daDangKy}/{D.tongDonVi}</strong> đơn vị tham gia đăng ký ({Math.round(D.daDangKy/D.tongDonVi*100)}% kế hoạch).</p>
            <p>Tổng số <strong>{D.tongHoSo}</strong> hồ sơ được nộp; qua thẩm định cấp cơ sở còn <strong>{D.soKhenThuong + 1}</strong> hồ sơ đủ điều kiện; Hội đồng phê duyệt <strong>{D.soKhenThuong}</strong> hồ sơ.</p>
            <p>Tỷ lệ hoàn thành kế hoạch: <strong style={{ color: "#0f7a3e" }}>đạt và vượt mức</strong> — tăng 15% so với năm 2025.</p>
          </div>
        </div>

        {/* Section II — Danh sách */}
        <div className="mb-4">
          <div className="text-[13px] font-bold uppercase bg-[#e0f2fe] px-3 py-1.5 mb-3 text-[#0891b2]">II. DANH SÁCH KHEN THƯỞNG</div>
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr style={{ background: "#e0f2fe" }}>
                {["STT", "Họ và tên", "Đơn vị", "Danh hiệu", "Điểm", "Tiền thưởng"].map(h => (
                  <th key={h} className="border px-2 py-1.5 text-left font-bold" style={{ borderColor: "#7dd3fc", color: "#0e7490" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {D.winners.map(w => (
                <tr key={w.stt}>
                  <td className="border px-2 py-1.5 text-center" style={{ borderColor: "#d1d5db" }}>{w.stt}</td>
                  <td className="border px-2 py-1.5 font-semibold" style={{ borderColor: "#d1d5db" }}>{w.ten}</td>
                  <td className="border px-2 py-1.5" style={{ borderColor: "#d1d5db" }}>{w.donVi}</td>
                  <td className="border px-2 py-1.5" style={{ borderColor: "#d1d5db" }}>{w.danhHieu}</td>
                  <td className="border px-2 py-1.5 text-center font-bold" style={{ borderColor: "#d1d5db", color: w.diem >= 90 ? "#166534" : "#b45309" }}>{w.diem}</td>
                  <td className="border px-2 py-1.5 text-right" style={{ borderColor: "#d1d5db", color: "#1C5FBE", fontWeight: 600 }}>{w.tien} đ</td>
                </tr>
              ))}
              <tr style={{ background: "#f0f9ff" }}>
                <td colSpan={5} className="border px-2 py-1.5 text-right font-bold" style={{ borderColor: "#d1d5db" }}>Tổng cộng:</td>
                <td className="border px-2 py-1.5 text-right font-bold text-[#1C5FBE]" style={{ borderColor: "#d1d5db" }}>{D.tongKinhPhi} đ</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section III — Kinh phí */}
        <div className="mb-4">
          <div className="text-[13px] font-bold uppercase bg-[#e0f2fe] px-3 py-1.5 mb-2 text-[#0891b2]">III. KINH PHÍ KHEN THƯỞNG</div>
          <div className="pl-2 text-[13px] text-[#0b1426] space-y-1">
            <div>– Tổng kinh phí khen thưởng: <strong>{D.tongKinhPhi} đồng</strong></div>
            <div>– Nguồn kinh phí: <strong>{D.nguonKP}</strong> (Điều 6 TT 28/2025/TT-BTC)</div>
            <div>– Hình thức chi: Chuyển khoản qua Kho bạc Nhà nước tỉnh Đồng Nai</div>
          </div>
        </div>

        {/* Section IV — Kiến nghị */}
        <div className="mb-5">
          <div className="text-[13px] font-bold uppercase bg-[#e0f2fe] px-3 py-1.5 mb-2 text-[#0891b2]">IV. KIẾN NGHỊ, ĐỀ XUẤT</div>
          <div className="pl-2 text-[13px] text-[#0b1426] space-y-1.5">
            <p>1. Tiếp tục duy trì phong trào thi đua hàng năm với tiêu chí chấm điểm được cập nhật theo TT 15/2025/TT-BNV.</p>
            <p>2. Tăng mức tiền thưởng phù hợp lạm phát; xem xét bổ sung nguồn NSNN hỗ trợ các đơn vị cấp cơ sở.</p>
            <p>3. Ứng dụng phần mềm quản lý TĐKT tỉnh để tự động hóa quy trình hồ sơ theo TT 15/2025/TT-BNV.</p>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <div className="text-[13px] text-[#5a5040] space-y-0.5">
            <div className="font-bold text-[13px] mb-1">Nơi nhận:</div>
            <div>– UBND tỉnh (để báo cáo);</div>
            <div>– Sở Nội vụ, Sở Tài chính;</div>
            <div>– Các đơn vị liên quan;</div>
            <div>– Lưu HĐ.</div>
          </div>
          <SignatureBlock role={"TM. HỘI ĐỒNG TĐKT TỈNH\nCHỦ TỊCH HỘI ĐỒNG"} name={D.nguoiKy} isSigned={isSigned} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT PREVIEW SWITCHER
═══════════════════════════════════════════════════════════════ */
function DocumentPreview({ docType, isSigned }: { docType: DocType; isSigned: boolean }) {
  if (docType === "to_trinh")   return <ToTrinhDoc   isSigned={isSigned} />;
  if (docType === "quyet_dinh") return <QuyetDinhDoc isSigned={isSigned} />;
  if (docType === "bien_ban")   return <BienBanDoc   isSigned={isSigned} />;
  if (docType === "mau_bieu")   return <MauBieuDoc   isSigned={isSigned} />;
  if (docType === "bao_cao")    return <BaoCaoDoc    isSigned={isSigned} />;
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN MODAL
═══════════════════════════════════════════════════════════════ */
export function PrintPreviewModal({ open, onClose, user }: { open: boolean; onClose: () => void; user: LoginUser }) {
  const [docType,     setDocType]     = useState<DocType>("quyet_dinh");
  const [format,      setFormat]      = useState<Format>("pdf");
  const [isSigned,    setIsSigned]    = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [printed,     setPrinted]     = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1800);
  };

  const handlePrint = () => {
    setPrinted(true);
    window.print();
    setTimeout(() => setPrinted(false), 2000);
  };

  if (!open) return null;

  const selectedDoc = DOC_TYPES.find(d => d.id === docType)!;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(11,20,38,0.55)", backdropFilter: "blur(4px)" }} />

      <div
        className="relative flex overflow-hidden rounded-[16px] border border-[#e8e2d4] shadow-2xl"
        style={{ width: 980, maxWidth: "96vw", maxHeight: "92vh", background: "white" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Left panel ── */}
        <div className="w-[270px] shrink-0 flex flex-col border-r border-[#e8e2d4]" style={{ background: "#faf7f2" }}>
          <div className="px-5 py-4 border-b border-[#e8e2d4]">
            <div className="flex items-center gap-2">
              <Printer className="size-4 text-[#1C5FBE]" />
              <span className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>In / Xuất tài liệu</span>
            </div>
            <p className="text-[13px] text-[#635647] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
              {D.soHieu} · {D.phongTrao.slice(0, 30)}…
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Doc type */}
            <div>
              <label className="block text-[13px] uppercase tracking-wider text-[#635647] mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Loại tài liệu</label>
              <div className="space-y-1.5">
                {DOC_TYPES.map(dt => {
                  const DTIcon = dt.icon;
                  const active = docType === dt.id;
                  return (
                    <button key={dt.id} onClick={() => setDocType(dt.id)}
                      className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-[8px] text-left transition-all"
                      style={{ background: active ? dt.color + "15" : "white", border: `1.5px solid ${active ? dt.color + "60" : "#e8e2d4"}` }}>
                      <DTIcon className="size-4 shrink-0 mt-0.5" style={{ color: active ? dt.color : "#635647" }} />
                      <div>
                        <div className="text-[13px]" style={{ fontFamily: "var(--font-sans)", fontWeight: active ? 700 : 500, color: active ? dt.color : "#0b1426" }}>{dt.label}</div>
                        <div className="text-[13px] text-[#635647]">{dt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="block text-[13px] uppercase tracking-wider text-[#635647] mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Định dạng xuất</label>
              <div className="flex gap-2">
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className="flex-1 py-2 rounded-[7px] text-[13px] text-center transition-all border"
                    style={{
                      background: format === f.id ? f.color : "white",
                      color: format === f.id ? "white" : f.color,
                      borderColor: f.color,
                      fontFamily: "var(--font-sans)", fontWeight: 700,
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-[13px] uppercase tracking-wider text-[#635647] mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Tùy chọn</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isSigned} onChange={() => setIsSigned(v => !v)} className="rounded border-[#d1d5db]" style={{ accentColor: "#1C5FBE" }} />
                  <span className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>Bao gồm chữ ký số CA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isSigned} onChange={() => setIsSigned(v => !v)} className="rounded border-[#d1d5db]" style={{ accentColor: "#1C5FBE" }} />
                  <span className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>Bao gồm QR xác thực</span>
                </label>
              </div>
            </div>

            {/* Metadata */}
            <div className="p-3 rounded-[8px] space-y-1.5" style={{ background: "#f0f4ff", border: "1px solid #bfdbfe" }}>
              <div className="flex items-start gap-2">
                <Shield className="size-3.5 text-[#1C5FBE] shrink-0 mt-0.5" />
                <div className="text-[13px] text-[#1C5FBE] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                  Tài liệu xuất được ghi Audit Log (người xuất, thời điểm, format).
                </div>
              </div>
              <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                Chuẩn: QCVN 01:2019/BNV · A4 · UTF-8
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-[#e8e2d4] space-y-2">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] text-white transition-all"
              style={{ background: downloading ? "#166534" : "linear-gradient(135deg,#1C5FBE,#1752a8)", fontFamily: "var(--font-sans)", fontWeight: 700 }}
            >
              {downloading ? <CheckCircle2 className="size-4" /> : <Download className="size-4" />}
              {downloading ? "Đang chuẩn bị…" : `Tải xuống ${format.toUpperCase()}`}
            </button>
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] border text-[13px] transition-colors"
              style={{
                borderColor: printed ? "#166534" : "#e8e2d4",
                color: printed ? "#166534" : "#5a5040",
                background: printed ? "#f0fdf4" : "white",
                fontFamily: "var(--font-sans)",
              }}
            >
              {printed ? <CheckCircle2 className="size-4" /> : <Printer className="size-4" />}
              {printed ? "Đã gửi máy in" : "In trực tiếp"}
            </button>
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview header */}
          <div className="px-6 py-3.5 border-b border-[#e8e2d4] flex items-center justify-between shrink-0" style={{ background: "white" }}>
            <div className="flex items-center gap-2 flex-wrap">
              <Eye className="size-4 text-[#635647]" />
              <span className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Xem trước</span>
              <span className="px-2 py-0.5 rounded text-[13px]" style={{ background: selectedDoc.color + "15", color: selectedDoc.color, fontFamily: "var(--font-sans)", border: `1px solid ${selectedDoc.color}30` }}>
                {selectedDoc.label}
              </span>
              {!isSigned && (
                <span className="px-2 py-0.5 rounded text-[13px]" style={{ background: "#fef9ec", color: "#b45309", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  ⚠ BẢN DỰ THẢO
                </span>
              )}
              {isSigned && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[13px]" style={{ background: "#dcfce7", color: "#166534", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  <Lock className="size-3" />ĐÃ KÝ SỐ
                </span>
              )}
            </div>
            <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-[#f5f2ec] transition-colors">
              <X className="size-4 text-[#635647]" />
            </button>
          </div>

          {/* Preview body */}
          <div className="flex-1 overflow-y-auto p-8" style={{ background: "#e8e4d8" }}>
            <div className="max-w-[640px] mx-auto relative">
              <DocumentPreview docType={docType} isSigned={isSigned} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-2.5 border-t border-[#f0ece3] flex items-center justify-between shrink-0" style={{ background: "#faf7f2" }}>
            <span className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
              Trang 1/1 · Khổ A4 · Chuẩn QCVN 01:2019/BNV
            </span>
            <span className="text-[13px] text-[#635647]" style={{ fontFamily: "JetBrains Mono,monospace" }}>
              {new Date().toLocaleTimeString("vi-VN")} · {user.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
