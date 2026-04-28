import { useState } from "react";
import {
  FileSignature, Shield, CheckCircle2, Clock, ChevronRight,
  Download, Eye, RotateCcw, Lock, Fingerprint, AlertTriangle,
  Building2, CalendarDays, User, CheckCheck, X
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

interface DocItem {
  id: string; code: string; title: string; type: string;
  submittedBy: string; submittedDate: string; unit: string;
  status: "cho_ky" | "da_ky" | "hoan_tra";
  content: string; signedDate?: string;
}

const DOCS: DocItem[] = [
  { id:"1", code:"QĐ-TĐKT-2026-047", title:"QĐ tặng Bằng khen cho bà Lê Thị Thanh Xuân", type:"Quyết định khen thưởng cá nhân", submittedBy:"Lê Hoàng Nam – Trưởng phòng TĐKT", submittedDate:"2026-04-22", unit:"Sở Giáo dục & Đào tạo", status:"cho_ky", content:"QUYẾT ĐỊNH\nVề việc tặng Bằng khen của Chủ tịch UBND Tỉnh Đồng Nai\n\nCHỦ TỊCH UBND TỈNH ĐỒNG NAI\n\nCăn cứ Luật Tổ chức chính quyền địa phương ngày 19/6/2015;\nCăn cứ Luật Thi đua, Khen thưởng ngày 12/11/2003, các Luật sửa đổi, bổ sung;\nXét đề nghị của Giám đốc Sở Giáo dục và Đào tạo tại Tờ trình số 45/TTr-SGDĐT ngày 15/03/2026 và đề nghị của Trưởng Ban Thi đua - Khen thưởng tỉnh,\n\nQUYẾT ĐỊNH:\n\nĐiều 1. Tặng Bằng khen của Chủ tịch UBND tỉnh cho bà Lê Thị Thanh Xuân, Phó Giám đốc Sở Giáo dục và Đào tạo tỉnh Đồng Nai vì đã có thành tích xuất sắc trong phong trào thi đua \"Đổi mới, sáng tạo trong dạy và học\" giai đoạn 2021–2025.\n\nĐiều 2. Giao Ban Thi đua - Khen thưởng tỉnh thực hiện các thủ tục trao tặng theo quy định.\n\nĐiều 3. Chánh Văn phòng UBND tỉnh, Trưởng Ban Thi đua - Khen thưởng tỉnh, Giám đốc Sở Giáo dục và Đào tạo và bà Lê Thị Thanh Xuân chịu trách nhiệm thi hành Quyết định này.\n\nNơi nhận:\n– Như Điều 3;\n– UBND tỉnh (b/c);\n– Lưu VT, BTĐKT." },
  { id:"2", code:"QĐ-TĐKT-2026-046", title:"QĐ tặng Cờ thi đua Chính phủ cho Phòng CSGT", type:"Quyết định khen thưởng tập thể", submittedBy:"Lê Hoàng Nam – Trưởng phòng TĐKT", submittedDate:"2026-04-21", unit:"Công an Tỉnh Đồng Nai", status:"cho_ky", content:"QUYẾT ĐỊNH\nVề việc tặng Cờ thi đua của Chính phủ cho Phòng Cảnh sát Giao thông Công an tỉnh Đồng Nai...", },
  { id:"3", code:"QĐ-TĐKT-2026-041", title:"QĐ tặng Giấy khen cho Đội CSND CA Biên Hòa", type:"Quyết định khen thưởng tập thể", submittedBy:"Lê Hoàng Nam – Trưởng phòng TĐKT", submittedDate:"2026-02-20", unit:"Công an TP. Biên Hòa", status:"da_ky", signedDate:"2026-02-28", content:"QUYẾT ĐỊNH ban hành kèm theo..." },
];

const CA_CERTS = [
  { id:"cert1", name:"Chứng thư số CA - Chánh VP Tỉnh ủy", issuer:"VNPT-CA", valid:"2024–2027", serial:"01:2A:B4:FF:..." },
  { id:"cert2", name:"Chứng thư số CA - Văn phòng UBND Tỉnh", issuer:"VGCA", valid:"2025–2028", serial:"08:CF:3A:D1:..." },
];

function DocStatusBadge({ status }: { status: DocItem["status"] }) {
  const cfg = {
    cho_ky:   { label: "Chờ ký số",    color: "#92400e", bg: "#fef3c7" },
    da_ky:    { label: "Đã ký & ban hành", color: "#166534", bg: "#dcfce7" },
    hoan_tra: { label: "Đã hoàn trả",  color: "#9f1239", bg: "#fee2e2" },
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[13px] font-medium"
      style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
  );
}

export function KySoPage({ user }: { user: LoginUser }) {
  const { theme } = useTheme();
  const [docs, setDocs]         = useState<DocItem[]>(DOCS);
  const [selectedId, setSelectedId] = useState<string>("1");
  const [signing, setSigning]   = useState(false);
  const [selectedCert, setSelectedCert] = useState(CA_CERTS[0].id);
  const [pin, setPin]           = useState("");
  const [toast, setToast]       = useState("");
  const [tab, setTab]           = useState<"preview"|"chain">("preview");

  const selected = docs.find(d => d.id === selectedId)!;
  const pending  = docs.filter(d => d.status === "cho_ky");
  const signed   = docs.filter(d => d.status === "da_ky");

  const handleSign = () => {
    if (pin.length < 4) return;
    setDocs(prev => prev.map(d => d.id === selectedId
      ? { ...d, status: "da_ky", signedDate: "2026-04-23" } : d));
    setSigning(false);
    setPin("");
    setToast("🎉 Ký số thành công! Quyết định đã được ban hành.");
    setTimeout(() => setToast(""), 3000);
  };

  // Non-signing roles see read-only
  const canSign = user.role === "lãnh đạo cấp cao" || user.role === "quản trị hệ thống";

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--color-paper)" }}>

      {/* Left: document list */}
      <div className="w-[300px] shrink-0 border-r border-[#e2e8f0] bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-[#eef2f8] bg-[#ffffff]">
          <h2 className="text-[14px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>
            Ký số & Phê duyệt
          </h2>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 text-center">
              <div className="text-[18px] font-bold" style={{ color: theme.primary, fontFamily: "var(--font-sans)" }}>{pending.length}</div>
              <div className="text-[13px] text-[#635647]">Chờ ký</div>
            </div>
            <div className="w-px h-8 bg-[#e2e8f0]" />
            <div className="flex-1 text-center">
              <div className="text-[18px] font-bold text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>{signed.length}</div>
              <div className="text-[13px] text-[#635647]">Đã ký</div>
            </div>
          </div>
        </div>

        {/* CA cert info */}
        <div className="px-4 py-3 border-b border-[#eef2f8] bg-[#f0f7ff]">
          <div className="flex items-center gap-2">
            <Shield className="size-4 shrink-0" style={{ color: theme.primary }} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold" style={{ color: theme.primary }}>Chứng thư số CA hợp lệ</p>
              <p className="text-[13px] text-[#635647] truncate">VNPT-CA · Hết hạn 2027</p>
            </div>
          </div>
        </div>

        {/* Doc list */}
        <div className="flex-1 overflow-y-auto">
          {docs.map(doc => (
            <button key={doc.id}
              onClick={() => setSelectedId(doc.id)}
              className={`w-full text-left px-4 py-3 border-b border-[#f4f7fb] transition-colors
                ${doc.id === selectedId ? "bg-[var(--color-primary-tint)]" : "hover:bg-[#ffffff]"}`}>
              <div className="flex items-start gap-2.5">
                <div className="size-8 rounded-lg grid place-items-center shrink-0 mt-0.5"
                  style={{ background: doc.status === "da_ky" ? "#dcfce7" : theme.tint }}>
                  {doc.status === "da_ky"
                    ? <CheckCheck className="size-4 text-[#166534]" />
                    : <FileSignature className="size-4" style={{ color: theme.primary }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0b1426] leading-tight truncate">{doc.title}</p>
                  <p className="text-[13px] text-[#635647] mt-0.5">{doc.code}</p>
                  <div className="mt-1"><DocStatusBadge status={doc.status} /></div>
                </div>
                {doc.id === selectedId && <ChevronRight className="size-4 shrink-0 mt-1" style={{ color: theme.primary }} />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: document viewer + actions */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Doc header */}
        <div className="px-6 py-4 border-b border-[#eef2f8] bg-white flex items-center justify-between">
          <div>
            <p className="text-[13px] font-mono text-[#635647]">{selected.code}</p>
            <h3 className="text-[14px] font-semibold text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{selected.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <DocStatusBadge status={selected.status} />
              <span className="text-[13px] text-[#635647]">{selected.type}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-secondary"><Eye className="size-3.5" /> Xem toàn màn hình</button>
            <button className="btn btn-sm btn-secondary"><Download className="size-3.5" /> Tải về</button>
          </div>
        </div>

        {/* Doc tabs */}
        <div className="px-6 flex gap-4 border-b border-[#eef2f8] bg-white">
          {(["preview","chain"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-2.5 text-[13px] border-b-2 transition-colors
                ${tab === t ? "font-semibold" : "border-transparent text-[#635647] hover:text-[#0b1426]"}`}
              style={tab === t ? { color: theme.primary, borderColor: theme.primary } : undefined}>
              {t === "preview" ? "Nội dung văn bản" : "Chuỗi phê duyệt"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "preview" && (
            <div className="max-w-2xl mx-auto">
              {/* Document paper */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                {/* Letterhead */}
                <div className="bg-[#0b1426] text-white px-8 py-4 text-center">
                  <p className="text-[13px] tracking-[0.2em] text-white/60 uppercase">Tỉnh Đồng Nai · UBND Tỉnh</p>
                  <p className="text-[13px] font-semibold mt-1">ỦY BAN NHÂN DÂN TỈNH ĐỒNG NAI</p>
                </div>
                <div className="px-8 py-6">
                  <pre className="text-[13px] text-[#0b1426] leading-relaxed whitespace-pre-wrap font-sans">{selected.content}</pre>
                </div>
                {/* Signature area */}
                <div className="px-8 pb-8">
                  <div className="mt-6 flex justify-end">
                    <div className="text-center w-56">
                      <p className="text-[13px] text-[#635647]">Đồng Nai, ngày {selected.signedDate ?? "___"}/04/2026</p>
                      <p className="text-[13px] font-semibold text-[#0b1426] mt-1">CHỦ TỊCH UBND TỈNH</p>
                      {selected.status === "da_ky" ? (
                        <div className="mt-4 border-2 border-[#166534] rounded-lg p-3 bg-[#f0fdf4]">
                          <div className="flex items-center justify-center gap-2 text-[#166534]">
                            <CheckCircle2 className="size-4" />
                            <span className="text-[13px] font-bold">ĐÃ KÝ SỐ</span>
                          </div>
                          <p className="text-[13px] text-[#166534] mt-1">Nguyễn Văn Hùng · {selected.signedDate}</p>
                          <p className="text-[13px] text-[#635647] font-mono mt-1">SHA256: 3a4f2b...d9e1</p>
                        </div>
                      ) : (
                        <div className="mt-4 border-2 border-dashed border-[#e2e8f0] rounded-lg p-4 bg-[#ffffff]">
                          <FileSignature className="size-6 text-[#c9bfa6] mx-auto" />
                          <p className="text-[13px] text-[#c9bfa6] mt-1">Chờ chữ ký số</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "chain" && (
            <div className="max-w-lg mx-auto space-y-4">
              <h4 className="text-[14px] font-semibold text-[#0b1426]">Chuỗi phê duyệt</h4>
              {[
                { role:"Chuyên viên TĐKT", name:"Võ Minh Tuấn", action:"Thẩm định & trình", date:"18/04/2026", done:true },
                { role:"Trưởng phòng TĐKT", name:"Lê Hoàng Nam", action:"Phê duyệt & trình ký", date:"22/04/2026", done:true },
                { role:"Chánh VP Tỉnh ủy", name:"Nguyễn Văn Hùng", action:"Ký số & ban hành", date: selected.signedDate ?? "—", done: selected.status === "da_ky" },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`size-8 rounded-full grid place-items-center text-white text-[13px] font-bold ${step.done ? "bg-[#166534]" : ""}`}
                      style={!step.done ? { background: theme.primary, opacity: 0.4 } : undefined}>
                      {step.done ? <CheckCheck className="size-4" /> : i + 1}
                    </div>
                    {i < 2 && <div className={`w-px flex-1 mt-1 ${step.done ? "bg-[#166534]" : "bg-[#e2e8f0]"}`} style={{ minHeight: 32 }} />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] text-[#635647] uppercase tracking-wide">{step.role}</span>
                        {step.done && <span className="text-[13px] text-[#166534] font-semibold flex items-center gap-1"><CheckCircle2 className="size-3" /> {step.date}</span>}
                      </div>
                      <p className="text-[13px] font-semibold text-[#0b1426]">{step.name}</p>
                      <p className="text-[13px] text-[#635647] mt-0.5">{step.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action footer */}
        {canSign && selected.status === "cho_ky" && (
          <div className="px-6 py-4 border-t border-[#eef2f8] bg-white">
            {!signing ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-lg bg-[#fef3c7] border border-[#fde68a] px-4 py-2.5 flex items-center gap-2">
                  <Clock className="size-4 text-[#b45309]" />
                  <span className="text-[13px] text-[#92400e]">Văn bản này cần chữ ký số của bạn để ban hành chính thức</span>
                </div>
                <button onClick={() => setSigning(true)} className="btn btn-md btn-primary">
                  <FileSignature className="size-4" /> Ký số văn bản
                </button>
                <button className="btn btn-md btn-secondary">
                  <RotateCcw className="size-4" /> Hoàn trả
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-6">
                <div className="flex-1 space-y-3">
                  <p className="text-[13px] font-semibold text-[#0b1426]">Chọn chứng thư số & xác thực PIN</p>
                  <div className="space-y-2">
                    {CA_CERTS.map(cert => (
                      <label key={cert.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors
                          ${selectedCert === cert.id ? "" : "border-[#e2e8f0] hover:border-[#c9bfa6]"}`}
                        style={selectedCert === cert.id ? { borderColor: theme.primary, background: theme.tint } : undefined}>
                        <input type="radio" name="cert" value={cert.id}
                          checked={selectedCert === cert.id} onChange={() => setSelectedCert(cert.id)}
                          className="accent-[var(--color-primary-btn)]" />
                        <Shield className="size-5 shrink-0" style={{ color: theme.primary }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#0b1426] truncate">{cert.name}</p>
                          <p className="text-[13px] text-[#635647]">{cert.issuer} · Hết hạn: {cert.valid}</p>
                        </div>
                        {selectedCert === cert.id && <CheckCircle2 className="size-4 shrink-0" style={{ color: theme.primary }} />}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="w-52 space-y-3">
                  <div className="ds-input-root">
                    <label className="ds-input-label flex items-center gap-1.5">
                      <Lock className="size-3.5" /> Mã PIN xác thực
                    </label>
                    <input type="password" className="ds-input ds-input-md font-mono"
                      placeholder="••••••" maxLength={8}
                      value={pin} onChange={e => setPin(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSigning(false); setPin(""); }} className="btn btn-sm btn-secondary flex-1">
                      <X className="size-3.5" /> Huỷ
                    </button>
                    <button onClick={handleSign}
                      className="btn btn-sm flex-1 text-white"
                      style={{ background: pin.length >= 4 ? theme.primary : "#c9bfa6" }}
                      disabled={pin.length < 4}>
                      <Fingerprint className="size-3.5" /> Ký
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {!canSign && (
          <div className="px-6 py-3 border-t border-[#eef2f8] bg-[#ffffff] flex items-center gap-2">
            <AlertTriangle className="size-4 text-[#b45309]" />
            <span className="text-[13px] text-[#635647]">Chỉ Lãnh đạo VP Tỉnh ủy mới có quyền ký số văn bản này.</span>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-[13px] font-medium"
          style={{ background: "#166534" }}>
          <CheckCircle2 className="size-4" /> {toast}
        </div>
      )}
    </div>
  );
}
