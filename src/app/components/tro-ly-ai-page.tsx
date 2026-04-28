import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Send, RefreshCw,
  CheckCircle2, AlertTriangle, XCircle, FileText,
  Award, Clock, Shield, Lightbulb, Copy, ThumbsUp,
  ThumbsDown, Loader2, BookOpen, Search,
  ChevronRight, Plus, Pin, Star, Zap, Hash,
  MessageSquare, LayoutPanelLeft, SlidersHorizontal,
  ArrowRight, Target, TrendingUp, Building2, AlertCircle,
  FileCheck, Gavel, PenLine,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */
interface CheckCard { label:string; status:"pass"|"warn"|"fail"; detail:string; legal?:string }
interface Message {
  id:string; role:"user"|"ai"; content:string;
  timestamp:Date; typing?:boolean;
  cards?:CheckCard[]; topic?:string;
}
interface ConvHistory { id:string; title:string; time:string; topic:string }
interface QuickAction { id:string; label:string; prompt:string; icon:typeof Shield; color:string }

/* ═══════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════ */
const TOPICS: { id:string; label:string; icon:typeof Shield; color:string; prompts:QuickAction[] }[] = [
  {
    id:"dieu_kien", label:"Điều kiện xét tặng", icon:Shield, color:"#1C5FBE",
    prompts:[
      { id:"cstdcs",  label:"CSTĐ Cơ sở",        prompt:"Kiểm tra điều kiện CSTĐCS theo NĐ 152/2025/NĐ-CP",                        icon:Shield,    color:"#1C5FBE" },
      { id:"cstdt",   label:"CSTĐ cấp Tỉnh",      prompt:"Điều kiện xét tặng CSTĐT — Chiến sĩ Thi đua cấp Tỉnh Đồng Nai",         icon:Award,     color:"#7c3aed" },
      { id:"cstdtq",  label:"CSTĐ Toàn quốc",     prompt:"Điều kiện Chiến sĩ Thi đua Toàn quốc theo Luật TĐKT 2022?",              icon:Star,      color:"#8a6400" },
      { id:"bangkhen",label:"Bằng khen UBND Tỉnh", prompt:"Điều kiện xét tặng Bằng khen của UBND tỉnh Đồng Nai là gì?",            icon:FileText,  color:"#166534" },
    ],
  },
  {
    id:"quy_trinh", label:"Quy trình & SLA", icon:Clock, color:"#b45309",
    prompts:[
      { id:"sla",     label:"SLA xử lý hồ sơ",    prompt:"Quy trình xét duyệt hồ sơ mất bao nhiêu ngày theo TT 15/2025?",          icon:Clock,     color:"#b45309" },
      { id:"ho_so",   label:"Thành phần hồ sơ",   prompt:"Hồ sơ đề nghị CSTĐCS gồm những gì theo TT 15/2025/TT-BNV?",            icon:FileCheck, color:"#0e7490" },
      { id:"hd_hop",  label:"Quy chế Hội đồng",   prompt:"Hội đồng TĐKT họp và biểu quyết như thế nào? Quy định túc số?",         icon:Gavel,     color:"#7c3aed" },
    ],
  },
  {
    id:"soan_thao", label:"Soạn thảo & Hồ sơ", icon:PenLine, color:"#166534",
    prompts:[
      { id:"thanh_tich", label:"Soạn thành tích",  prompt:"Giúp tôi soạn thảo phần thành tích cho hồ sơ Bằng khen UBND tỉnh",      icon:PenLine,   color:"#166534" },
      { id:"goi_y_dh",   label:"Gợi ý danh hiệu",  prompt:"Tôi đã có CSTĐCS 2 lần liên tiếp, điểm TB 91. Nên đề nghị danh hiệu gì?", icon:Lightbulb, color:"#8a6400" },
      { id:"kinhphi",    label:"Tiền thưởng & KP",  prompt:"Mức tiền thưởng cho các danh hiệu thi đua là bao nhiêu theo quy định?",  icon:Hash,      color:"#0f7a3e" },
    ],
  },
  {
    id:"phap_ly", label:"Tra cứu pháp lý", icon:BookOpen, color:"#7c3aed",
    prompts:[
      { id:"nd152",  label:"NĐ 152/2025/NĐ-CP", prompt:"Giải thích các điểm chính của NĐ 152/2025/NĐ-CP về Thi đua Khen thưởng",  icon:BookOpen,  color:"#7c3aed" },
      { id:"luat",   label:"Luật TĐKT 2022",     prompt:"Luật Thi đua Khen thưởng 2022 có điểm gì mới so với luật cũ?",           icon:Shield,    color:"#0e7490" },
      { id:"tt15",   label:"TT 15/2025/TT-BNV",  prompt:"Thông tư 15/2025/TT-BNV quy định gì về mẫu biểu và hồ sơ khen thưởng?", icon:FileText,  color:"#c8102e" },
    ],
  },
];

const CONV_HISTORY: ConvHistory[] = [
  { id:"h1", title:"Điều kiện CSTĐ cấp Tỉnh",          time:"Hôm nay",  topic:"dieu_kien" },
  { id:"h2", title:"Soạn thảo thành tích Bằng khen",    time:"Hôm nay",  topic:"soan_thao" },
  { id:"h3", title:"Hỏi về SLA quy trình 38 ngày",      time:"Hôm qua",  topic:"quy_trinh" },
  { id:"h4", title:"Tra cứu NĐ 152/2025",               time:"Hôm qua",  topic:"phap_ly"   },
  { id:"h5", title:"Gợi ý danh hiệu phù hợp",           time:"3 ngày trước", topic:"soan_thao" },
];

const CONTEXT_ACTIONS = [
  { label:"8 hồ sơ chờ ký số",          color:"#c8102e", bg:"#fee2e2", icon:AlertCircle, module:"Ký số & Phê duyệt" },
  { label:"3 hồ sơ sắp trễ SLA",        color:"#b45309", bg:"#fef3c7", icon:Clock,        module:"SLA Monitor" },
  { label:"Phiên HĐ ngày 28/04",         color:"#7c3aed", bg:"#f5f3ff", icon:Gavel,        module:"Hội đồng xét duyệt" },
  { label:"Kết quả phong trào PT-002",   color:"#166534", bg:"#dcfce7", icon:TrendingUp,   module:"Phong trào thi đua" },
];

const AI_RESPONSES: Record<string,{text:string;cards?:CheckCard[]}> = {
  default: { text:`Xin chào! Tôi là **Tố Nga** — trợ lý AI của hệ thống VPTU Đồng Nai.\n\nTôi có thể giúp bạn:\n• **Kiểm tra điều kiện** đủ chuẩn theo NĐ 152/2025/NĐ-CP\n• **Tra cứu quy định** từ TT 15/2025, Luật TĐKT 2022\n• **Soạn thảo nội dung** thành tích cho hồ sơ\n• **Gợi ý danh hiệu** phù hợp với hồ sơ của bạn\n• **Giải đáp nghiệp vụ** thi đua khen thưởng\n\nHãy đặt câu hỏi hoặc chọn một chủ đề bên trái!` },
  cstd_check: { text:`**Kiểm tra điều kiện CSTĐCS (Điều 22 NĐ 152/2025/NĐ-CP)**\n\nDưới đây là các điều kiện bắt buộc:`, cards:[
    { label:"Hoàn thành xuất sắc nhiệm vụ",     status:"pass", detail:"Xếp loại HTXSNV trong năm xét tặng",            legal:"Điều 22.1a" },
    { label:"Tỷ lệ không quá 15% CBCC",          status:"warn", detail:"Cần xác nhận tổng số CBCC đơn vị để tính tỷ lệ", legal:"Điều 22.1b" },
    { label:"Được bình xét từ cơ sở",            status:"pass", detail:"Thông qua hội nghị bình xét thi đua đơn vị",     legal:"Điều 22.2" },
    { label:"Không vi phạm kỷ luật trong năm",   status:"pass", detail:"Không bị kỷ luật từ khiển trách trở lên",       legal:"Điều 22.1c" },
    { label:"Có sáng kiến hoặc thành tích nổi bật",status:"warn",detail:"Nên có bằng chứng cụ thể: báo cáo, số liệu",   legal:"Điều 22.1a" },
  ]},
  cstd_tinh: { text:`**Điều kiện CSTĐT — Chiến sĩ Thi đua cấp Tỉnh (Điều 23 NĐ 152/2025/NĐ-CP)**\n\nĐây là danh hiệu thi đua cao nhất tại tỉnh Đồng Nai, cần:`, cards:[
    { label:"≥ 2 lần liên tiếp CSTĐCS",          status:"pass", detail:"Phải là 2 năm liên tục, không có năm nào bị gián đoạn", legal:"Điều 23.1a" },
    { label:"Sáng kiến cấp tỉnh được công nhận",  status:"warn", detail:"Cần Hội đồng sáng kiến cấp tỉnh xác nhận",           legal:"Điều 23.1b" },
    { label:"Xếp loại HTXSNV cả 2 năm",          status:"pass", detail:"Theo kết quả đánh giá CBCC theo NĐ 90/2020",           legal:"Điều 23.1a" },
    { label:"Không bị kỷ luật trong 2 năm",      status:"pass", detail:"Không có vi phạm từ khiển trách trở lên",              legal:"Điều 23.1c" },
    { label:"Được đề nghị từ cơ sở",             status:"pass", detail:"Hội nghị bình xét → đơn vị → HĐ cấp tỉnh",           legal:"Điều 23.2" },
  ]},
  cstd_toanquoc: { text:`**Điều kiện CSTĐ Toàn quốc (Điều 24 NĐ 152/2025/NĐ-CP)**\n\nDanh hiệu cao quý nhất trong hệ thống thi đua:`, cards:[
    { label:"≥ 2 lần CSTĐT liên tiếp",           status:"warn", detail:"Yêu cầu 2 lần CSTĐT liên tục (không cần liên kỳ)",    legal:"Điều 24.1a" },
    { label:"Thành tích xuất sắc cấp quốc gia",  status:"warn", detail:"Được Trung ương hoặc Bộ chủ quản xác nhận",          legal:"Điều 24.1b" },
    { label:"Sáng kiến tầm quốc gia",            status:"fail", detail:"Sáng kiến phải được công nhận ở cấp Bộ hoặc TW",     legal:"Điều 24.1c" },
    { label:"Không vi phạm kỷ luật 5 năm",       status:"pass", detail:"Không có bất kỳ vi phạm kỷ luật nào trong 5 năm",   legal:"Điều 24.1d" },
  ]},
  bangkhen: { text:`**Điều kiện Bằng khen UBND Tỉnh (Điều 74 NĐ 152/2025/NĐ-CP)**\n\nMột trong những hình thức khen thưởng phổ biến nhất:`, cards:[
    { label:"Hoàn thành xuất sắc nhiệm vụ",     status:"pass", detail:"Có thành tích tiêu biểu trong phong trào thi đua",    legal:"Điều 74.1" },
    { label:"Được bình xét và đề nghị hợp lệ",  status:"pass", detail:"Qua hội nghị bình xét → HĐ TĐKT → UBND Tỉnh",       legal:"Điều 74.2" },
    { label:"Không vi phạm kỷ luật trong năm",  status:"pass", detail:"Không bị hình thức kỷ luật nào trong năm xét",       legal:"Điều 74.3" },
    { label:"Có thể là tập thể hoặc cá nhân",   status:"pass", detail:"Áp dụng cho cả cá nhân lẫn tập thể đơn vị",         legal:"Điều 74.1" },
  ]},
  thanh_tich: { text:`**Hướng dẫn soạn thảo phần Thành tích**\n\nCấu trúc chuẩn cho hồ sơ Bằng khen UBND tỉnh:\n\n**1. Thành tích cá nhân nổi bật (Tiêu chí 1 — tối đa 20 điểm)**\nNêu cụ thể: "Trong [năm], [cá nhân] đã [hành động cụ thể], đạt kết quả [con số/%, vượt x% chỉ tiêu]..."\n\n**2. Đóng góp cho tập thể (Tiêu chí 2 — tối đa 20 điểm)**\n"Đã tham gia/chủ trì [x] đề án/dự án, đóng góp [cụ thể] cho phong trào thi đua..."\n\n**3. Sáng kiến/Đổi mới (Tiêu chí 4 — tối đa 20 điểm)**\n"Đề xuất sáng kiến [tên], được [cấp nào] công nhận ngày [dd/mm/yyyy], tiết kiệm [x đồng]/[x giờ]..."\n\n⚠️ **Lưu ý:** Tránh dùng từ chung chung như "tích cực", "nhiệt tình". Cần số liệu cụ thể có thể kiểm chứng.` },
  sla: { text:`**Quy trình xét duyệt theo TT 15/2025/TT-BNV**\n\nTổng thời gian chuẩn: **38 ngày làm việc**\n\n| Giai đoạn | Vai trò | Thời hạn |\n|---|---|---|\n| Đơn vị đề nghị → HĐ | Manager | 7 ngày LV |\n| HĐ thẩm định hồ sơ | Council | 15 ngày LV |\n| Lấy ý kiến công khai | Council | **5 ngày LV min** |\n| Bỏ phiếu phiên họp | Council | 3 ngày LV |\n| Trình ký Lãnh đạo | Council | 3 ngày LV |\n| Ký số & Ban hành | Leader | 2 ngày LV |\n\n⚠️ **Lưu ý:** Thời gian LYK 5 ngày là **bắt buộc** theo Điều 15 TT 15/2025. Vi phạm có thể làm vô hiệu kết quả xét duyệt.` },
  ho_so_tp: { text:`**Thành phần hồ sơ đề nghị CSTĐCS (TT 15/2025/TT-BNV)**\n\nHồ sơ gồm:\n\n• **Tờ khai thành tích cá nhân** — Mẫu 01/TT15 (bắt buộc)\n• **Báo cáo thành tích tóm tắt** — không quá 1000 từ (bắt buộc)\n• **Sơ yếu lý lịch** — Mẫu 2C, có xác nhận cơ quan (bắt buộc)\n• **Bản sao Quyết định bổ nhiệm/HĐ lao động** (bắt buộc)\n• **Giấy xác nhận không vi phạm kỷ luật** (bắt buộc)\n• **Minh chứng thành tích** — văn bản, sáng kiến, ảnh (nếu có)\n• **Biên bản họp bình xét nội bộ** (tập thể đề nghị)\n\n💡 Tất cả bản sao phải có chứng thực hoặc dấu xác nhận của cơ quan.` },
  hd_hop: { text:`**Quy chế Hội đồng TĐKT — Biểu quyết (Điều 56–57 Luật TĐKT 2022)**\n\n• **Túc số:** ≥ 2/3 tổng số thành viên (7 TV → cần ≥ 5 có mặt)\n• **Ngưỡng thông qua:** ≥ 2/3 số phiếu của thành viên có mặt\n• **Hình thức:** Bỏ phiếu kín (phiếu giấy hoặc hệ thống điện tử)\n• **Biên bản:** Lập ngay sau phiên họp, ký tên Chủ tọa + Thư ký\n\nNếu hồ sơ không đạt ngưỡng, HĐ có thể:\n→ Trả hồ sơ về bổ sung, hoàn chỉnh\n→ Chuyển xuống hình thức khen thưởng thấp hơn\n→ Loại ra khỏi danh sách đề nghị kỳ này` },
  nd152: { text:`**NĐ 152/2025/NĐ-CP — Các điểm chính**\n\nBan hành ngày 14/6/2025, thay thế NĐ 98/2023/NĐ-CP.\n\n**Thay đổi quan trọng:**\n\n• **Điều 22-24:** Tiêu chuẩn CSTĐCS/T/TQ nâng cao, yêu cầu sáng kiến bắt buộc với CSTĐT trở lên\n• **Điều 27:** Tập thể LĐXS: 100% thành viên HT, ≥70% HTXS (tăng từ 50%)\n• **Điều 30:** Giấy khen không cần Hội đồng TĐ-KT (đơn giản hóa)\n• **Điều 42-44:** Huân chương LĐ bắt buộc có CSTĐ bậc tương ứng\n• **Điều 79:** LYK công khai bắt buộc với tất cả danh hiệu từ cấp tỉnh trở lên\n\n**Lưu ý:** NĐ này thay thế NĐ 98/2023 từ tháng 6/2025, cần cập nhật mẫu biểu.` },
  luat2022: { text:`**Luật Thi đua Khen thưởng 2022 — Điểm mới**\n\nLuật số 06/2022/QH15, có hiệu lực từ 01/01/2024.\n\n**Những thay đổi nổi bật:**\n\n• **Điều 5:** Bổ sung nguyên tắc "thực chất, hiệu quả" — không khen thưởng theo tiêu chí hình thức\n• **Điều 18:** Phong trào thi đua phải có mục tiêu, chỉ tiêu rõ ràng và đánh giá kết quả\n• **Điều 44:** Công khai danh sách đề nghị khen thưởng trên cổng thông tin điện tử tối thiểu 5 ngày\n• **Điều 55:** Hội đồng TĐKT các cấp được quy định chặt chẽ hơn về thành phần, quy chế\n\nSo với Luật 2003/2004: Đơn giản hóa thủ tục GK, tăng cường vai trò giám sát xã hội.` },
  tt15: { text:`**TT 15/2025/TT-BNV — Quy định mẫu biểu và hồ sơ**\n\nThông tư 15/2025/TT-BNV ban hành 11 mẫu biểu chính thức:\n\n| Mẫu | Tên | Đối tượng |\n|---|---|---|\n| Mẫu 01 | Tờ khai thành tích cá nhân | Cá nhân |\n| Mẫu 02 | Tờ khai thành tích tập thể | Tập thể |\n| Mẫu 03 | Danh sách đề nghị | Manager |\n| Mẫu 04 | Biên bản họp HĐ | Hội đồng |\n| Mẫu 05 | Quyết định khen thưởng | Lãnh đạo |\n\n⚠️ Các mẫu cũ theo TT 12/2019 không còn hiệu lực từ 01/07/2025.` },
  goi_y: { text:`**Gợi ý Danh hiệu phù hợp**\n\nDựa trên thông tin bạn cung cấp:\n• ✅ Đã có **2 lần CSTĐCS liên tiếp**\n• ✅ Điểm TB **91/100** (đủ tiêu chuẩn)\n\n**Khuyến nghị của Tố Nga:**\n\n🥇 **Đề nghị ngay: CSTĐ cấp Tỉnh (Điều 23 NĐ 152/2025)**\n→ Đủ điều kiện 2 lần CSTĐCS. Cần bổ sung: Sáng kiến được Hội đồng cấp tỉnh công nhận.\n\n📋 **Chuẩn bị song song: Bằng khen UBND tỉnh**\n→ Điều kiện thấp hơn, có thể nộp cùng đợt.\n\n⏳ **5 năm tới:** Với đà này, có thể đủ điều kiện CSTĐ Toàn quốc (cần ≥3 lần CSTĐT).` },
  kinhphi: { text:`**Mức tiền thưởng theo NĐ 152/2025/NĐ-CP**\n\n| Danh hiệu/Hình thức | Mức thưởng | Nguồn KP |\n|---|---|---|\n| Huân chương LĐ hạng Nhất | 8.000.000 đ | NSNN |\n| Huân chương LĐ hạng Nhì | 5.000.000 đ | NSNN |\n| Huân chương LĐ hạng Ba | 3.500.000 đ | NSNN |\n| CSTĐ Toàn quốc | 3.000.000 đ | NSNN |\n| Bằng khen Thủ tướng | 2.000.000 đ | NSNN |\n| CSTĐ cấp Tỉnh | 1.500.000 đ | Quỹ TĐ |\n| Bằng khen UBND Tỉnh | 1.000.000 đ | Quỹ TĐ |\n| CSTĐ Cơ sở | 800.000 đ | Đơn vị |\n| Giấy khen | 300.000 đ | Đơn vị |\n\n💡 Mức thưởng trên là tối thiểu theo NĐ 152/2025. Đơn vị có thể chi thêm từ quỹ thi đua nội bộ.` },
};

function getResponse(msg:string): typeof AI_RESPONSES[string] {
  const lower = msg.toLowerCase();
  if (lower.includes("cstđcs")||lower.includes("cơ sở")||(lower.includes("chiến sĩ")&&lower.includes("cơ"))) return AI_RESPONSES.cstd_check;
  if (lower.includes("cstđt")||(lower.includes("cấp tỉnh")&&lower.includes("chiến sĩ"))) return AI_RESPONSES.cstd_tinh;
  if (lower.includes("toàn quốc")||lower.includes("cstđtq")) return AI_RESPONSES.cstd_toanquoc;
  if (lower.includes("bằng khen")||(lower.includes("ubnd")&&lower.includes("khen"))) return AI_RESPONSES.bangkhen;
  if (lower.includes("soạn")||lower.includes("thành tích")) return AI_RESPONSES.thanh_tich;
  if (lower.includes("sla")||lower.includes("quy trình")||(lower.includes("ngày")&&lower.includes("xét duyệt"))||lower.includes("tt 15")) return AI_RESPONSES.sla;
  if (lower.includes("thành phần")||lower.includes("hồ sơ gồm")||(lower.includes("hồ sơ")&&lower.includes("gì"))) return AI_RESPONSES.ho_so_tp;
  if (lower.includes("hội đồng")||lower.includes("biểu quyết")||lower.includes("túc số")) return AI_RESPONSES.hd_hop;
  if (lower.includes("152")||lower.includes("nĐ 98")||lower.includes("nghị định")) return AI_RESPONSES.nd152;
  if (lower.includes("luật 2022")||lower.includes("luật tđkt")||lower.includes("luật thi đua")) return AI_RESPONSES.luat2022;
  if (lower.includes("tt 15")||lower.includes("thông tư 15")||lower.includes("mẫu biểu")) return AI_RESPONSES.tt15;
  if (lower.includes("gợi ý")||lower.includes("nên đề nghị")||lower.includes("phù hợp")||lower.includes("đã được 2 lần")) return AI_RESPONSES.goi_y;
  if (lower.includes("tiền thưởng")||lower.includes("kinh phí")||lower.includes("mức thưởng")) return AI_RESPONSES.kinhphi;
  return AI_RESPONSES.default;
}

function renderMarkdown(text:string) {
  return text.split("\n").map((line,i)=>{
    if (line.startsWith("**")&&line.endsWith("**")) return <p key={i} className="text-[13px] text-[#e2e8f0] mb-2 mt-1" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{line.replace(/\*\*/g,"")}</p>;
    if (line.startsWith("• ")) return <p key={i} className="text-[13px] text-white/70 flex items-start gap-2 mb-1"><span style={{ color:"#8a6400" }}>•</span><span dangerouslySetInnerHTML={{ __html:line.slice(2).replace(/\*\*(.+?)\*\*/g,"<strong style='color:#e2e8f0'>$1</strong>") }}/></p>;
    if (line.startsWith("🥇")||line.startsWith("📋")||line.startsWith("⏳")||line.startsWith("⚠️")||line.startsWith("💡")) return <p key={i} className="text-[13px] text-white/80 mb-2 pl-1">{line}</p>;
    if (line.startsWith("→")) return <p key={i} className="text-[13px] text-white/50 pl-4 mb-1 italic">{line}</p>;
    if (line==="|---|---|---|"||line.startsWith("|---")) return null;
    if (line.startsWith("|")) {
      const cells=line.split("|").filter(Boolean).map(c=>c.trim());
      return (
        <div key={i} className="flex gap-2 text-[13px] text-white/70 border-b py-1.5" style={{ borderColor:"rgba(255,255,255,0.08)" }}>
          {cells.map((c,ci)=><span key={ci} className="flex-1" style={{ color:ci===0?"rgba(255,255,255,0.9)":ci===2?"#8a6400":"rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)" }}>{c}</span>)}
        </div>
      );
    }
    if (line.trim()==="") return <div key={i} className="h-2"/>;
    return <p key={i} className="text-[13px] text-white/70 mb-1 leading-relaxed" dangerouslySetInnerHTML={{ __html:line.replace(/\*\*(.+?)\*\*/g,"<strong style='color:#e2e8f0'>$1</strong>") }}/>;
  });
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export function TroLyAIPage({ user, onNavigate }: { user: LoginUser; onNavigate?: (m:string)=>void }) {
  const [messages, setMessages]       = useState<Message[]>([
    { id:"init", role:"ai", content:AI_RESPONSES.default.text, timestamp:new Date() }
  ]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [activeTopicId, setActiveTopicId] = useState<string|null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showContext, setShowContext] = useState(true);
  const [pinned, setPinned]           = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); },[messages]);

  const sendMessage = async(text:string) => {
    if (!text.trim()||loading) return;
    const userMsg:Message = { id:Date.now().toString(), role:"user", content:text, timestamp:new Date() };
    setMessages(prev=>[...prev,userMsg]);
    setInput("");
    setLoading(true);
    await new Promise(r=>setTimeout(r,700+Math.random()*500));
    const resp = getResponse(text);
    const aiMsg:Message = { id:(Date.now()+1).toString(), role:"ai", content:resp.text, cards:resp.cards, timestamp:new Date() };
    setMessages(prev=>[...prev,aiMsg]);
    setLoading(false);
  };

  const handleKey = (e:React.KeyboardEvent) => {
    if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const reset = () => {
    setMessages([{ id:"init", role:"ai", content:AI_RESPONSES.default.text, timestamp:new Date() }]);
    setActiveTopicId(null);
  };

  const togglePin = (id:string) => {
    setPinned(prev => prev.includes(id) ? prev.filter(p=>p!==id) : [...prev,id]);
  };

  const copyText = (text:string) => {
    navigator.clipboard.writeText(text).catch(()=>{});
  };

  const STATUS_CFG = {
    pass:{ color:"#4ade80", bg:"rgba(74,222,128,0.12)", border:"rgba(74,222,128,0.25)", Icon:CheckCircle2 },
    warn:{ color:"#fbbf24", bg:"rgba(251,191,36,0.12)",  border:"rgba(251,191,36,0.25)",  Icon:AlertTriangle },
    fail:{ color:"#f87171", bg:"rgba(248,113,113,0.12)", border:"rgba(248,113,113,0.25)", Icon:XCircle },
  };

  const activeTopic = TOPICS.find(t=>t.id===activeTopicId);

  return (
    <div className="h-full flex overflow-hidden" style={{ background:"#0a0f1e", fontFamily: "var(--font-sans)" }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
      {showSidebar && (
        <div className="w-[220px] shrink-0 flex flex-col border-r overflow-hidden"
          style={{ borderColor:"rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>

          {/* Sidebar header */}
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
            <div className="size-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background:"linear-gradient(135deg,#7c3aed,#8a6400)" }}>
              <Sparkles className="size-4 text-white"/>
            </div>
            <span className="text-[13px] text-white" style={{ fontWeight:700 }}>Tố Nga AI</span>
            <button onClick={()=>setShowSidebar(false)} className="ml-auto text-white/30 hover:text-white/60 transition-colors">
              <LayoutPanelLeft className="size-4"/>
            </button>
          </div>

          {/* New chat */}
          <div className="px-3 py-2">
            <button onClick={reset}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[13px] transition-colors hover:bg-white/8"
              style={{ color:"rgba(255,255,255,0.5)", border:"1px dashed rgba(255,255,255,0.15)" }}>
              <Plus className="size-3.5"/>Cuộc trò chuyện mới
            </button>
          </div>

          {/* Topics */}
          <div className="px-3 pb-2">
            <p className="text-[13px] text-white/30 mb-1.5 px-1 uppercase tracking-wider">Chủ đề</p>
            {TOPICS.map(t=>{
              const Icon=t.icon;
              return (
                <button key={t.id}
                  onClick={()=>setActiveTopicId(activeTopicId===t.id?null:t.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[7px] text-left transition-colors mb-0.5"
                  style={{
                    background:activeTopicId===t.id?`${t.color}20`:"transparent",
                    color:activeTopicId===t.id?t.color:"rgba(255,255,255,0.5)",
                  }}>
                  <Icon className="size-3.5 shrink-0"/>
                  <span className="text-[11.5px]">{t.label}</span>
                  {activeTopicId===t.id && <ChevronRight className="size-3 ml-auto"/>}
                </button>
              );
            })}
          </div>

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 border-t mt-1" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
            <p className="text-[13px] text-white/30 mb-1.5 px-1 uppercase tracking-wider mt-2">Lịch sử</p>
            {CONV_HISTORY.map(h=>{
              const isPinned = pinned.includes(h.id);
              return (
                <div key={h.id}
                  className="flex items-start gap-2 px-2.5 py-2 rounded-[7px] cursor-pointer group hover:bg-white/5 transition-colors mb-0.5">
                  <MessageSquare className="size-3 shrink-0 mt-0.5 text-white/20 group-hover:text-white/40"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white/50 group-hover:text-white/70 truncate leading-tight">{h.title}</p>
                    <p className="text-[13px] text-white/25">{h.time}</p>
                  </div>
                  <button onClick={e=>{e.stopPropagation();togglePin(h.id);}}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Pin className="size-3" style={{ color:isPinned?"#8a6400":"rgba(255,255,255,0.3)" }}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN CHAT AREA ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-3 border-b shrink-0 flex items-center gap-3"
          style={{ borderColor:"rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
          {!showSidebar && (
            <button onClick={()=>setShowSidebar(true)} className="text-white/30 hover:text-white/60 transition-colors mr-1">
              <LayoutPanelLeft className="size-4"/>
            </button>
          )}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/20"/>
            <input
              value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm trong cuộc trò chuyện..."
              className="w-full bg-transparent pl-8 pr-4 py-1.5 text-[13px] outline-none rounded-[7px]"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.25)" }}>
              <div className="size-1.5 rounded-full bg-[#4ade80] animate-pulse"/>
              <span className="text-[13px] text-[#4ade80]">Online</span>
            </div>
            <button onClick={reset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[13px] transition-colors hover:bg-white/8"
              style={{ color:"rgba(255,255,255,0.4)" }}>
              <RefreshCw className="size-3"/>Đặt lại
            </button>
            <button onClick={()=>setShowContext(v=>!v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[13px] transition-colors hover:bg-white/8"
              style={{ color:"rgba(255,255,255,0.4)" }}>
              <SlidersHorizontal className="size-3"/>
            </button>
          </div>
        </div>

        {/* Topic quick-actions */}
        {activeTopic && (
          <div className="px-5 py-2 border-b shrink-0" style={{ borderColor:"rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] text-white/40">Gợi ý:</span>
              {activeTopic.prompts.map(p=>{
                const Icon=p.icon;
                return (
                  <button key={p.id} onClick={()=>sendMessage(p.prompt)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] transition-all hover:opacity-90"
                    style={{ background:`${p.color}15`, border:`1px solid ${p.color}30`, color:p.color }}>
                    <Icon className="size-3"/>
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {messages.map(msg=>(
            <div key={msg.id} className={`flex gap-3 ${msg.role==="user"?"justify-end":""}`}>
              {msg.role==="ai" && (
                <div className="size-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:"linear-gradient(135deg,#7c3aed,#8a6400)" }}>
                  <Sparkles className="size-4 text-white"/>
                </div>
              )}
              <div className={`${msg.role==="user"?"max-w-[60%]":"max-w-[85%]"}`}>
                {msg.role==="ai" ? (
                  <div className="rounded-[14px] rounded-tl-sm p-4 group"
                    style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}>
                    <div className="text-[13px] mb-2.5 flex items-center gap-2"
                      style={{ color:"#8a6400", fontFamily: "var(--font-sans)", fontWeight:700 }}>
                      <Sparkles className="size-3"/>
                      Tố Nga · {msg.timestamp.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}
                    </div>
                    <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                    {msg.cards && (
                      <div className="mt-3 space-y-1.5">
                        {msg.cards.map((c,i)=>{
                          const cfg=STATUS_CFG[c.status]; const CIcon=cfg.Icon;
                          return (
                            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-[8px] border"
                              style={{ background:cfg.bg, borderColor:cfg.border }}>
                              <CIcon className="size-4 shrink-0 mt-0.5" style={{ color:cfg.color }}/>
                              <div className="flex-1">
                                <div className="text-[13px]" style={{ color:cfg.color, fontFamily: "var(--font-sans)", fontWeight:600 }}>{c.label}</div>
                                <div className="text-[13px] text-white/50 mt-0.5">{c.detail}</div>
                                {c.legal && (
                                  <code className="text-[13px] mt-0.5 block" style={{ color:"#8a6400", fontFamily:"JetBrains Mono, monospace" }}>{c.legal}</code>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                      <button onClick={()=>copyText(msg.content)}
                        className="flex items-center gap-1 text-[13px] px-2 py-0.5 rounded transition-colors hover:bg-white/10"
                        style={{ color:"rgba(255,255,255,0.3)" }}>
                        <Copy className="size-3"/>Sao chép
                      </button>
                      <button className="flex items-center gap-1 text-[13px] px-2 py-0.5 rounded transition-colors hover:bg-white/10" style={{ color:"rgba(255,255,255,0.3)" }}>
                        <ThumbsUp className="size-3"/>Hữu ích
                      </button>
                      <button className="flex items-center gap-1 text-[13px] px-2 py-0.5 rounded transition-colors hover:bg-white/10" style={{ color:"rgba(255,255,255,0.3)" }}>
                        <ThumbsDown className="size-3"/>Chưa đúng
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[14px] rounded-br-sm px-4 py-3"
                    style={{ background:"linear-gradient(135deg,#1C5FBE,#1752a8)" }}>
                    <div className="text-[13px] text-white/50 mb-1">{user.name} · {msg.timestamp.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}</div>
                    <p className="text-[13px] text-white leading-relaxed">{msg.content}</p>
                  </div>
                )}
              </div>
              {msg.role==="user" && (
                <div className="size-9 rounded-xl flex items-center justify-center shrink-0 text-[13px] text-white"
                  style={{ background:"linear-gradient(135deg,#1C5FBE,#2470d8)", fontFamily: "var(--font-sans)", fontWeight:700 }}>
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex gap-3">
              <div className="size-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:"linear-gradient(135deg,#7c3aed,#8a6400)" }}>
                <Sparkles className="size-4 text-white"/>
              </div>
              <div className="rounded-[14px] rounded-tl-sm px-4 py-3 flex items-center gap-2"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex gap-1">
                  {[0,1,2].map(i=>(
                    <div key={i} className="size-1.5 rounded-full bg-[#8a6400] animate-bounce"
                      style={{ animationDelay:`${i*0.15}s` }}/>
                  ))}
                </div>
                <span className="text-[13px] text-white/40">Tố Nga đang phân tích...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input area */}
        <div className="px-5 pb-5 pt-2 shrink-0 border-t" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
          <div className="flex gap-2 items-end p-3 rounded-[12px]"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Hỏi về điều kiện khen thưởng, quy trình xét duyệt, soạn thảo thành tích... (Enter để gửi)"
              rows={2}
              className="flex-1 bg-transparent text-[13px] outline-none resize-none"
              style={{ color:"rgba(255,255,255,0.85)", fontFamily: "var(--font-sans)", lineHeight:1.5 }}
            />
            <button onClick={()=>sendMessage(input)} disabled={!input.trim()||loading}
              className="size-10 rounded-[8px] flex items-center justify-center shrink-0 transition-all"
              style={{ background:input.trim()&&!loading?"linear-gradient(135deg,#7c3aed,#8a6400)":"rgba(255,255,255,0.08)", cursor:input.trim()&&!loading?"pointer":"not-allowed" }}>
              {loading ? <Loader2 className="size-5 animate-spin text-white"/> : <Send className="size-5 text-white"/>}
            </button>
          </div>
          <p className="text-[13px] text-center mt-1.5" style={{ color:"rgba(255,255,255,0.2)" }}>
            Tố Nga có thể mắc sai sót · Luôn đối chiếu với NĐ 152/2025/NĐ-CP và TT 15/2025/TT-BNV
          </p>
        </div>
      </div>

      {/* ── RIGHT CONTEXT PANEL ──────────────────────────────────── */}
      {showContext && (
        <div className="w-[220px] shrink-0 flex flex-col border-l overflow-y-auto"
          style={{ borderColor:"rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>

          {/* User card */}
          <div className="px-4 py-3 border-b" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="size-9 rounded-full flex items-center justify-center text-[13px] text-white shrink-0"
                style={{ background:`linear-gradient(135deg,${user.avatarFrom??'#1C5FBE'},${user.avatarTo??'#7c3aed'})`, fontFamily: "var(--font-sans)", fontWeight:700 }}>
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] text-white/80 truncate" style={{ fontWeight:600 }}>{user.name.split(" ").slice(-2).join(" ")}</p>
                <p className="text-[13px] text-white/30 truncate">{user.unit}</p>
              </div>
            </div>
            <div className="text-[13px] px-2 py-1 rounded-[5px] text-center"
              style={{ background:"rgba(200,150,12,0.15)", color:"#8a6400", border:"1px solid rgba(200,150,12,0.25)" }}>
              {user.roleLabel}
            </div>
          </div>

          {/* Pending actions */}
          <div className="px-4 py-3 border-b" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
            <p className="text-[13px] text-white/30 mb-2 uppercase tracking-wider">Việc cần làm</p>
            <div className="space-y-2">
              {CONTEXT_ACTIONS.map((a,i)=>{
                const Icon=a.icon;
                return (
                  <button key={i} onClick={()=>onNavigate?.(a.module)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-left transition-all hover:scale-[1.01]"
                    style={{ background:a.bg+"20", border:`1px solid ${a.color}25` }}>
                    <Icon className="size-3.5 shrink-0" style={{ color:a.color }}/>
                    <span className="text-[13px] truncate" style={{ color:a.color }}>{a.label}</span>
                    <ArrowRight className="size-3 shrink-0 ml-auto opacity-50" style={{ color:a.color }}/>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick stats */}
          <div className="px-4 py-3 border-b" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
            <p className="text-[13px] text-white/30 mb-2 uppercase tracking-wider">Tổng quan hôm nay</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:"Hồ sơ xử lý", v:"24", icon:FileText,    color:"#1C5FBE" },
                { label:"SLA đạt",      v:"97%", icon:Target,      color:"#166534" },
                { label:"Chờ ký số",    v:"8",   icon:Zap,         color:"#c8102e" },
                { label:"Hồ sơ xong",   v:"16",  icon:CheckCircle2,color:"#4ade80" },
              ].map((s,i)=>{
                const Icon=s.icon;
                return (
                  <div key={i} className="p-2 rounded-[8px] text-center" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <Icon className="size-3.5 mx-auto mb-1" style={{ color:s.color }}/>
                    <div className="text-[14px]" style={{ color:s.color, fontFamily: "var(--font-sans)", fontWeight:700 }}>{s.v}</div>
                    <div className="text-[13px] text-white/30 leading-tight mt-0.5">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Knowledge base links */}
          <div className="px-4 py-3">
            <p className="text-[13px] text-white/30 mb-2 uppercase tracking-wider">Tài liệu pháp lý</p>
            <div className="space-y-1.5">
              {[
                { label:"NĐ 152/2025/NĐ-CP", sub:"Nghị định chính" },
                { label:"TT 15/2025/TT-BNV", sub:"Mẫu biểu & quy trình" },
                { label:"Luật TĐKT 2022",    sub:"Luật cơ sở" },
                { label:"TT 28/2025/TT-BTC", sub:"Kinh phí khen thưởng" },
              ].map((d,i)=>(
                <button key={i} onClick={()=>sendMessage(`Giải thích ${d.label}`)}
                  className="w-full flex items-start gap-2 px-2.5 py-1.5 rounded-[7px] text-left transition-colors hover:bg-white/5">
                  <BookOpen className="size-3 shrink-0 mt-0.5 text-white/25"/>
                  <div>
                    <p className="text-[13px] text-white/50 leading-tight">{d.label}</p>
                    <p className="text-[13px] text-white/25">{d.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
