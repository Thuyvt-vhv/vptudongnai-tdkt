import { useState } from "react";
import {
  Search, BookOpen, Scale, Sparkles, HelpCircle, Video,
  ChevronRight, ChevronDown, ExternalLink, MessageSquare,
  Phone, Mail, FileText, Shield, Award, Users, Settings,
  Clock, CheckCircle2, Star, ArrowRight, Bookmark,
  PlayCircle, X, GitBranch, Zap,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { LuongNghiepVuPage } from "./luong-nghiep-vu-page";

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
interface HelpCategory {
  id: string; icon: typeof BookOpen; label: string;
  desc: string; count: number; color: string; bg: string;
}

const CATEGORIES: HelpCategory[] = [
  { id:"start",  icon:Zap,         label:"Bắt đầu nhanh",        desc:"Hướng dẫn cho người dùng mới",      count:8,  color:"#8a6400", bg:"#fdf9ec" },
  { id:"nghiep", icon:Award,       label:"Nghiệp vụ TĐKT",       desc:"Quy trình thi đua, khen thưởng",    count:24, color:"#1C5FBE", bg:"#f0f4ff" },
  { id:"law",    icon:Scale,       label:"Pháp lý & Căn cứ",     desc:"Luật TĐKT 2022, NĐ 98, TT 01",     count:16, color:"#7c3aed", bg:"#faf5ff" },
  { id:"ai",     icon:Sparkles,    label:"Trợ lý AI",             desc:"Hướng dẫn sử dụng trợ lý AI",      count:10, color:"#7c3aed", bg:"#f5f3ff" },
  { id:"kyso",   icon:Shield,      label:"Ký số & Bảo mật",      desc:"Chữ ký CA, bảo mật hệ thống",      count:12, color:"#166534", bg:"#dcfce7" },
  { id:"system", icon:Settings,    label:"Quản trị hệ thống",     desc:"Cấu hình, phân quyền, audit",      count:9,  color:"#5a5040", bg:"#ffffff" },
];

interface FAQItem { q: string; a: string; category: string; }
const FAQ_ITEMS: FAQItem[] = [
  { category:"nghiep", q:"Hồ sơ CSTĐT cần bao nhiêu năm CSTĐCS liên tiếp?", a:"Theo Điều 23 Luật TĐKT 2022 và Điều 11 NĐ 152/2025/NĐ-CP: Cá nhân phải đạt danh hiệu Chiến sĩ thi đua cơ sở 5 năm liên tiếp, có công trình sáng kiến, đề tài NCKH được xét công nhận ở cấp tỉnh trở lên, hoặc có nhân tố mới, điển hình tiên tiến được cấp có thẩm quyền công nhận." },
  { category:"nghiep", q:"Thời hạn xử lý hồ sơ khen thưởng là bao lâu?", a:"Theo TT 15/2025/TT-BNV: Hồ sơ khen thưởng thường xuyên: 30 ngày làm việc kể từ ngày nhận đủ hồ sơ. Hồ sơ khen thưởng đột xuất: 15 ngày làm việc. Hồ sơ khen thưởng cấp Nhà nước: 45 ngày làm việc. Hệ thống SLA Monitor sẽ cảnh báo tự động khi sắp đến hạn." },
  { category:"ai",     q:"Trợ lý AI phân tích hồ sơ dựa trên tiêu chí nào?", a:"Trợ lý AI đối chiếu hồ sơ với 3 văn bản pháp lý: (1) Luật TĐKT 2022 — điều kiện từng danh hiệu; (2) NĐ 152/2025/NĐ-CP — hướng dẫn chi tiết; (3) TT 15/2025/TT-BNV — mẫu biểu và quy trình. AI cho điểm từ 0–100 và gắn flag cảnh báo khi phát hiện thiếu sót hoặc trùng lặp với hồ sơ đã xét." },
  { category:"kyso",   q:"Chữ ký số CA có giá trị pháp lý không?", a:"Có. Theo Nghị định 130/2018/NĐ-CP và Luật Giao dịch điện tử 2023, chữ ký số CA do tổ chức cung cấp dịch vụ chứng thực chữ ký số cấp có giá trị pháp lý tương đương chữ ký tay và con dấu. Hệ thống VPTU Đồng Nai tích hợp với nhà cung cấp CA được Bộ TT&TT cấp phép." },
  { category:"start",  q:"Làm thế nào để tạo hồ sơ đề nghị khen thưởng?", a:"Bước 1: Đăng nhập và vào mục 'Đề nghị khen thưởng'. Bước 2: Click 'Tạo hồ sơ mới' và chọn loại danh hiệu. Bước 3: Trợ lý AI sẽ kiểm tra điều kiện tự động. Bước 4: Điền đầy đủ thông tin theo mẫu TT 15/2025. Bước 5: Đính kèm minh chứng. Bước 6: Nộp hồ sơ lên Hội đồng." },
  { category:"nghiep", q:"Quy trình bỏ phiếu của Hội đồng diễn ra như thế nào?", a:"Hội đồng TĐKT họp theo phiên (số hóa hoàn toàn trên VPTU Đồng Nai). Mỗi thành viên bỏ phiếu kín điện tử. Kết quả được thống kê tự động. Hồ sơ đạt khi tỷ lệ đồng ý ≥ 2/3 tổng số thành viên HĐ. Biên bản họp được tạo tự động và ký số tập thể." },
  { category:"law",    q:"Danh hiệu LĐTT cấp tỉnh và cấp cơ sở khác nhau như thế nào?", a:"LĐTT cấp cơ sở (Điều 22): do Thủ trưởng đơn vị tặng, yêu cầu hoàn thành xuất sắc nhiệm vụ năm. LĐTT cấp tỉnh (Điều 22): do UBND tỉnh tặng, yêu cầu LĐTT cơ sở 3 năm liên tiếp, có sáng kiến được ứng dụng rộng. Hệ thống tự động đề xuất danh hiệu phù hợp dựa trên lịch sử khen thưởng của cá nhân." },
  { category:"system", q:"Cách phân quyền cho người dùng mới?", a:"Admin vào 'Phân quyền' > 'Thêm người dùng'. Chọn vai trò phù hợp: user (cá nhân nộp hồ sơ), manager (lãnh đạo đơn vị duyệt), council (thành viên HĐ xét duyệt), leader (lãnh đạo ký quyết định), admin (quản trị toàn hệ thống). Mỗi vai trò có bộ quyền truy cập riêng theo NĐ 13/2023/NĐ-CP Điều 8." },
];

interface LegalRef {
  code: string; title: string; tag: string; year: number; color: string;
}
const LEGAL_REFS: LegalRef[] = [
  { code:"Luật TĐKT 2022",     title:"Luật Thi đua, Khen thưởng",             tag:"Quốc hội", year:2022, color:"#c8102e" },
  { code:"NĐ 152/2025/NĐ-CP",  title:"Quy định chi tiết Luật TĐKT",           tag:"Chính phủ",year:2023, color:"#1C5FBE" },
  { code:"TT 15/2025/TT-BNV",  title:"Mẫu biểu hồ sơ & Quy trình xử lý",    tag:"Bộ Nội vụ",year:2024, color:"#166534" },
  { code:"NĐ 13/2023/NĐ-CP",  title:"Bảo vệ dữ liệu cá nhân",               tag:"Chính phủ",year:2023, color:"#7c3aed" },
  { code:"NĐ 130/2018/NĐ-CP", title:"Chữ ký số & Chứng thực điện tử",       tag:"Chính phủ",year:2018, color:"#b45309" },
  { code:"Luật GDĐT 2023",     title:"Giao dịch điện tử – sửa đổi bổ sung",  tag:"Quốc hội", year:2023, color:"#c8102e" },
];

interface VideoItem { title: string; duration: string; level: string; views: number; }
const VIDEOS: VideoItem[] = [
  { title:"Tổng quan hệ thống VPTU Đồng Nai (dành cho Admin)",  duration:"12:30", level:"Cơ bản",   views:1240 },
  { title:"Hướng dẫn tạo hồ sơ đề nghị khen thưởng",       duration:"08:15", level:"Cơ bản",   views:3412 },
  { title:"Trợ lý AI – Kiểm tra điều kiện tự động",          duration:"06:45", level:"Trung cấp",views:892  },
  { title:"Quy trình Hội đồng số – Bỏ phiếu & Biên bản",    duration:"15:20", level:"Trung cấp",views:654  },
];

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */
function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-[10px] border overflow-hidden transition-all"
          style={{ borderColor: open === i ? "#bfdbfe" : "#e2e8f0", background: open === i ? "#f8fbff" : "white" }}>
          <button className="w-full flex items-center justify-between px-5 py-4 text-left"
            onClick={() => setOpen(open === i ? null : i)}>
            <span className="text-[13px] text-[#0b1426] flex-1 pr-4" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{item.q}</span>
            <ChevronDown className={`size-4 text-[#635647] shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && (
            <div className="px-5 pb-4 border-t border-[#eef2f8]">
              <p className="text-[13px] text-[#5a5040] leading-relaxed mt-3" style={{ fontFamily: "var(--font-sans)" }}>{item.a}</p>
              <div className="mt-3 flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-[13px] text-[#1C5FBE] hover:text-[#1752a8]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                  <BookOpen className="size-3.5" />Xem điều khoản liên quan
                </button>
                <button className="flex items-center gap-1.5 text-[13px] text-[#7c3aed] hover:text-[#5b21b6]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                  <Sparkles className="size-3.5" />Hỏi Trợ lý AI
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function HelpCenterPage({ user }: { user: LoginUser }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"faq" | "legal" | "videos" | "contact" | "workflow">("faq");

  const filteredFAQ = FAQ_ITEMS.filter(f => {
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    const matchQ   = search === "" || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>

      {/* Hero */}
      <div className="relative overflow-hidden px-8 py-14 text-center"
        style={{ background: "linear-gradient(135deg,#0b1426 0%,#1a2744 50%,#1C5FBE 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 size-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#8a6400,transparent)", transform: "translate(-30%,-30%)" }} />
        <div className="absolute bottom-0 right-0 size-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#7c3aed,transparent)", transform: "translate(20%,30%)" }} />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <HelpCircle className="size-6 text-[#8a6400]" />
            <span className="text-[13px] uppercase tracking-widest text-[#8a6400]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Trung tâm Hỗ trợ</span>
          </div>
          <h1 className="text-[24px] text-white mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            VPTU Đồng Nai Help Center
          </h1>
          <p className="text-[14px] text-white/70 mb-8" style={{ fontFamily: "var(--font-sans)" }}>
            Tìm kiếm hướng dẫn, căn cứ pháp lý và giải đáp thắc mắc
          </p>
          {/* Search bar */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#635647]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm hướng dẫn, điều khoản, quy trình…"
              className="w-full pl-11 pr-4 py-3.5 rounded-[12px] text-[14px] text-[#0b1426] outline-none shadow-xl"
              style={{ fontFamily: "var(--font-sans)", border: "none" }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="size-4 text-[#635647]" />
              </button>
            )}
          </div>
          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {["Tạo hồ sơ", "Quy trình HĐ", "Trợ lý AI", "Ký số CA", "Luật TĐKT 2022"].map(t => (
              <button key={t} onClick={() => setSearch(t)}
                className="px-3 py-1.5 rounded-full text-[13px] text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.25)", fontFamily: "var(--font-sans)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <button onClick={() => setActiveCategory("all")}
            className="flex flex-col items-center gap-2 p-4 rounded-[12px] border text-center transition-all hover:shadow-md"
            style={{ background: activeCategory === "all" ? "#0b1426" : "white", borderColor: activeCategory === "all" ? "#0b1426" : "#e2e8f0" }}>
            <BookOpen className="size-6" style={{ color: activeCategory === "all" ? "#8a6400" : "#635647" }} />
            <span className="text-[13px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: activeCategory === "all" ? "white" : "#0b1426" }}>Tất cả</span>
            <span className="text-[13px]" style={{ color: activeCategory === "all" ? "rgba(255,255,255,0.6)" : "#635647", fontFamily: "var(--font-sans)" }}>{FAQ_ITEMS.length} bài</span>
          </button>
          {CATEGORIES.map(cat => {
            const CatIcon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-[12px] border text-center transition-all hover:shadow-md"
                style={{ background: active ? cat.color : "white", borderColor: active ? cat.color : "#e2e8f0" }}>
                <CatIcon className="size-6" style={{ color: active ? "white" : cat.color }} />
                <span className="text-[13px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: active ? "white" : "#0b1426" }}>{cat.label}</span>
                <span className="text-[13px]" style={{ color: active ? "rgba(255,255,255,0.7)" : "#635647", fontFamily: "var(--font-sans)" }}>{cat.count} bài</span>
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#e2e8f0] mb-6">
          {([["faq","Câu hỏi thường gặp",HelpCircle],["workflow","Luồng nghiệp vụ",GitBranch],["legal","Pháp lý & Văn bản",Scale],["videos","Video hướng dẫn",PlayCircle],["contact","Liên hệ hỗ trợ",MessageSquare]] as const).map(([id,label,Icon]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-5 py-3 text-[13px] border-b-2 transition-all"
              style={{
                fontFamily: "var(--font-sans)", fontWeight: activeTab === id ? 700 : 400,
                borderColor: activeTab === id ? "#1C5FBE" : "transparent",
                color: activeTab === id ? "#1C5FBE" : "#635647",
              }}>
              <Icon className="size-4" />{label}
            </button>
          ))}
        </div>

        {/* FAQ */}
        {activeTab === "faq" && (
          <div className="max-w-3xl">
            {search && <p className="text-[13px] text-[#635647] mb-4">{filteredFAQ.length} kết quả cho "{search}"</p>}
            {filteredFAQ.length === 0
              ? <div className="text-center py-16 text-[#635647]">Không tìm thấy kết quả phù hợp.</div>
              : <FAQAccordion items={filteredFAQ} />}
          </div>
        )}

        {/* Workflow */}
        {activeTab === "workflow" && (
          <div className="-mx-8 -mb-8">
            <LuongNghiepVuPage user={user} />
          </div>
        )}

        {/* Legal */}
        {activeTab === "legal" && (
          <div className="max-w-3xl space-y-4">
            <p className="text-[13px] text-[#635647] mb-5" style={{ fontFamily: "var(--font-sans)" }}>
              Tất cả văn bản pháp lý mà VPTU Đồng Nai đối chiếu trong quá trình xét duyệt hồ sơ.
            </p>
            {LEGAL_REFS.map((ref, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-[12px] border bg-white hover:shadow-md transition-all"
                style={{ borderColor: "#e2e8f0", borderLeft: `4px solid ${ref.color}` }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-[13px] px-2 py-0.5 rounded" style={{ background: `${ref.color}15`, color: ref.color, fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}>
                      {ref.code}
                    </code>
                    <span className="text-[13px] px-2 py-0.5 rounded-full bg-[#eef2f8] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>{ref.tag}</span>
                    <span className="text-[13px] text-[#6b5e47]">{ref.year}</span>
                  </div>
                  <p className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{ref.title}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[13px] border border-[#e2e8f0] hover:bg-[#f4f7fb] transition-colors" style={{ fontFamily: "var(--font-sans)", color: "#5a5040" }}>
                    <BookOpen className="size-3.5" />Xem
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[13px] border border-[#e2e8f0] hover:bg-[#f4f7fb] transition-colors" style={{ fontFamily: "var(--font-sans)", color: "#5a5040" }}>
                    <Sparkles className="size-3.5" />Hỏi AI
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Videos */}
        {activeTab === "videos" && (
          <div className="grid grid-cols-2 gap-5 max-w-3xl">
            {VIDEOS.map((v, i) => (
              <div key={i} className="rounded-[12px] border bg-white overflow-hidden hover:shadow-lg transition-all"
                style={{ borderColor: "#e2e8f0" }}>
                {/* Thumbnail */}
                <div className="relative h-36 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg,#0b1426,#1a2744)` }}>
                  <PlayCircle className="size-12 text-white/80" />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[13px] text-white bg-black/60"
                    style={{ fontFamily: "JetBrains Mono,monospace" }}>{v.duration}</div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[13px]"
                    style={{ background: "#8a6400", color: "white", fontFamily: "var(--font-sans)", fontWeight: 700 }}>{v.level}</div>
                </div>
                <div className="p-4">
                  <p className="text-[13px] text-[#0b1426] leading-snug mb-2" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{v.title}</p>
                  <div className="flex items-center justify-between text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                    <span>{v.views.toLocaleString("vi-VN")} lượt xem</span>
                    <button className="flex items-center gap-1 text-[#1C5FBE]" style={{ fontWeight: 600 }}>
                      Xem ngay <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact */}
        {activeTab === "contact" && (
          <div className="max-w-2xl grid grid-cols-2 gap-4">
            {[
              { icon:MessageSquare, title:"Chat trực tiếp",     desc:"Hỗ trợ ngay trong giờ làm việc\n7:30–17:00, thứ 2–6",           action:"Mở chat",      color:"#1C5FBE" },
              { icon:Mail,         title:"Gửi yêu cầu hỗ trợ",desc:"Phản hồi trong vòng 1 ngày\nlàm việc",                           action:"Gửi email",    color:"#166534" },
              { icon:Phone,        title:"Hotline hỗ trợ",      desc:"(0251) 3824 000 — Tổng đài\nSở Nội vụ Đồng Nai",               action:"Gọi ngay",     color:"#7c3aed" },
              { icon:Bookmark,     title:"Đào tạo & Hướng dẫn", desc:"Đặt lịch tập huấn cho đơn vị,\nhội thảo trực tuyến",           action:"Đặt lịch",     color:"#8a6400" },
            ].map((c,i) => {
              const CIcon = c.icon;
              return (
                <div key={i} className="rounded-[12px] border p-5 bg-white hover:shadow-md transition-all"
                  style={{ borderColor: "#e2e8f0" }}>
                  <div className="size-10 rounded-[10px] flex items-center justify-center mb-3" style={{ background: `${c.color}15` }}>
                    <CIcon className="size-5" style={{ color: c.color }} />
                  </div>
                  <h3 className="text-[14px] text-[#0b1426] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{c.title}</h3>
                  <p className="text-[13px] text-[#635647] mb-4 whitespace-pre-line" style={{ fontFamily: "var(--font-sans)" }}>{c.desc}</p>
                  <button className="flex items-center gap-1.5 text-[13px]" style={{ color: c.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                    {c.action} <ArrowRight className="size-3.5" />
                  </button>
                </div>
              );
            })}
            <div className="col-span-2 rounded-[12px] border p-5" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)", borderColor: "#1a2744" }}>
              <div className="flex items-center gap-3">
                <Sparkles className="size-6 text-[#8a6400]" />
                <div className="flex-1">
                  <h3 className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Trợ lý AI hỗ trợ 24/7</h3>
                  <p className="text-[13px] text-white/60" style={{ fontFamily: "var(--font-sans)" }}>Trả lời tức thì mọi câu hỏi về nghiệp vụ TĐKT, pháp lý, quy trình</p>
                </div>
                <button className="px-5 py-2.5 rounded-[8px] text-[13px]" style={{ background: "#8a6400", color: "white", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                  Hỏi AI ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}