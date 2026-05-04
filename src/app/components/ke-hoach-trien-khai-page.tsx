import { useState, useMemo } from "react";
import {
  CheckCircle2, Circle, Clock, AlertTriangle,
  Crown, Gavel, Users, User, Settings,
  ChevronDown, ChevronRight, ChevronUp,
  Layers, Shield, Sparkles, GitBranch,
  LayoutDashboard, Trophy, Award, FileSignature,
  ClipboardList, ScrollText, Megaphone, Archive,
  Building2, ListChecks, Code2, TestTube2, BookOpen,
  BarChart3, Zap, Bell, Upload, FileText, Lock,
  CheckSquare, Square, Tag, Server, Database,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   CORE TYPES
═══════════════════════════════════════════════════════════════ */
type RoleId   = LoginUser["role"];
type Priority = "P0" | "P1" | "P2" | "P3";
type Status   = "done" | "in_progress" | "planned" | "blocked";
type Effort   = "S" | "M" | "L" | "XL";

interface SubTask  { title: string; done: boolean }
interface Feature  {
  id:              string;
  title:           string;
  description:     string;
  priority:        Priority;
  status:          Status;
  sprint:          number;
  effort:          Effort;
  subTasks:        SubTask[];
  uiComponents?:   string[];
  businessRules?:  string[];
  acceptanceCriteria?: string[];
  apiNote?:        string;
  legalRef?:       string;
  note?:           string;
}
interface Module {
  id:          string;
  title:       string;
  icon:        typeof LayoutDashboard;
  description: string;
  sprint:      string;
  features:    Feature[];
}
interface RoleSpec {
  role:    RoleId;
  modules: Module[];
}

/* ═══════════════════════════════════════════════════════════════
   STATIC META
═══════════════════════════════════════════════════════════════ */
const ROLE_META: Record<RoleId, {
  label: string; labelVi: string; desc: string;
  color: string; bg: string; border: string;
  gradient: string; icon: typeof User;
}> = {
  user:    { label:"User",    labelVi:"Cá nhân / Tập thể",  desc:"Đăng ký phong trào, nộp hồ sơ, theo dõi kết quả cá nhân",                   color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd", gradient:"from-[#1C5FBE] to-[#1752a8]",  icon:User    },
  manager: { label:"Manager", labelVi:"Lãnh đạo đơn vị",   desc:"Lập hồ sơ đề nghị đơn vị, lấy ý kiến, báo cáo thi đua cơ sở",              color:"#166534", bg:"#dcfce7", border:"#86efac", gradient:"from-[#166534] to-[#14532d]",  icon:Users   },
  council: { label:"Council", labelVi:"Thành viên HĐ",      desc:"Thẩm định hồ sơ, chủ trì phiên họp, chấm điểm, lấy ý kiến",                color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd", gradient:"from-[#7c3aed] to-[#6d28d9]",  icon:Gavel   },
  leader:  { label:"Leader",  labelVi:"Lãnh đạo cấp cao",  desc:"Phê duyệt phong trào, ký số CA, ban hành quyết định cấp tỉnh",              color:"#92400e", bg:"#fef3c7", border:"#fcd34d", gradient:"from-[#92400e] to-[#78350f]",  icon:Crown   },
  admin:   { label:"Admin",   labelVi:"Quản trị hệ thống", desc:"Cấu hình đơn vị, phân quyền, config danh hiệu, giám sát vận hành",          color:"#0b1426", bg:"#e8ecf3", border:"#c5cdd9", gradient:"from-[#0b1426] to-[#1a2744]",  icon:Settings },
};

const PRIORITY_CFG: Record<Priority,{ color:string; bg:string; border:string; label:string }> = {
  P0: { color:"#991b1b", bg:"#fee2e2", border:"#fca5a5", label:"Thiết yếu"  },
  P1: { color:"#92400e", bg:"#fef3c7", border:"#fcd34d", label:"Quan trọng" },
  P2: { color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd", label:"Nên có"     },
  P3: { color:"#5a5040", bg:"#f4f7fb", border:"#d6cfc3", label:"Tương lai"  },
};

const STATUS_CFG: Record<Status,{ label:string; color:string; bg:string; icon:typeof Circle }> = {
  done:        { label:"Hoàn thành",    color:"#166534", bg:"#dcfce7", icon:CheckCircle2  },
  in_progress: { label:"Đang làm",      color:"#92400e", bg:"#fef3c7", icon:Clock         },
  planned:     { label:"Kế hoạch",      color:"#1C5FBE", bg:"#ddeafc", icon:Circle        },
  blocked:     { label:"Bị chặn",       color:"#991b1b", bg:"#fee2e2", icon:AlertTriangle  },
};

const EFFORT_MAP: Record<Effort,{ label:string; days:string; dots:number }> = {
  S:  { label:"S",  days:"1–2 ngày",  dots:1 },
  M:  { label:"M",  days:"3–5 ngày",  dots:2 },
  L:  { label:"L",  days:"1–2 tuần",  dots:3 },
  XL: { label:"XL", days:"2–4 tuần",  dots:4 },
};

/* ═══════════════════════════════════════════════════════════════
   FULL ROLE SPEC DATA
═══════════════════════════════════════════════════════════════ */
const ROLE_SPECS: RoleSpec[] = [
  /* ──────────────────────── USER ──────────────────────────── */
  {
    role: "user",
    modules: [
      {
        id: "u-dashboard", title: "Dashboard Cá nhân", icon: LayoutDashboard, sprint: "Sprint 1–2",
        description: "Màn hình chính sau đăng nhập: tóm tắt hồ sơ, thông báo, truy cập nhanh.",
        features: [
          {
            id:"u-d1", title:"Tóm tắt trạng thái hồ sơ cá nhân", description:"Widget hiển thị số hồ sơ đang xử lý, đã hoàn thành, bị trả lại — với màu status chip rõ ràng.",
            priority:"P0", status:"done", sprint:1, effort:"M",
            subTasks:[
              { title:"Thiết kế layout widget 3-stat (đang xử lý / xong / trả lại)", done:true },
              { title:"Kết nối dữ liệu từ API /api/me/nominations", done:true },
              { title:"Hiển thị badge màu sắc theo status", done:true },
              { title:"Link nhanh vào trang Đề nghị KT", done:true },
            ],
            uiComponents:["StatCard","StatusBadge","QuickLinkButton"],
            businessRules:["Chỉ hiển thị hồ sơ có roles.includes(currentUser.id)","Trạng thái 'trả lại' đánh dấu đỏ + icon cảnh báo"],
            acceptanceCriteria:["User đăng nhập → thấy ngay số hồ sơ của mình","Click stat card → chuyển sang Đề nghị KT tab tương ứng"],
          },
          {
            id:"u-d2", title:"Timeline khen thưởng cá nhân", description:"Vertical timeline liệt kê toàn bộ lần khen thưởng trước đây, có thể expand xem chi tiết quyết định.",
            priority:"P1", status:"planned", sprint:4, effort:"M",
            subTasks:[
              { title:"Component VerticalTimeline với icon danh hiệu", done:false },
              { title:"API /api/me/awards trả về danh sách khen thưởng", done:false },
              { title:"Expand card xem chi tiết QĐ + download PDF", done:false },
              { title:"Empty state khi chưa có khen thưởng", done:false },
            ],
            uiComponents:["VerticalTimeline","AwardBadge","PDFDownloadButton"],
            businessRules:["Chỉ hiển thị QĐ đã được phát hành chính thức","Sắp xếp giảm dần theo năm"],
            acceptanceCriteria:["Hiển thị đúng danh sách từ DB","Click Download → file PDF QĐ chính xác"],
            legalRef:"Luật TĐKT 2022 Điều 8",
          },
          {
            id:"u-d3", title:"Notification bell & feed", description:"Bell icon trên topbar, dropdown feed thông báo: hồ sơ được duyệt, kết quả bỏ phiếu, nhắc SLA.",
            priority:"P1", status:"planned", sprint:5, effort:"M",
            subTasks:[
              { title:"Bell icon với unread count badge (đỏ)", done:false },
              { title:"Dropdown feed với mark-as-read", done:false },
              { title:"Persistent storage (localStorage / DB)", done:false },
              { title:"Push notification khi tab không active", done:false },
            ],
            uiComponents:["NotificationBell","NotificationFeed","NotificationItem"],
            businessRules:["Thông báo quan trọng (P0) không tự dismiss","Max hiển thị 50 items, có 'Xem tất cả'"],
            acceptanceCriteria:["Khi hồ sơ được duyệt → user nhận notification","Mark-as-read hoạt động đúng"],
            apiNote:"WebSocket event: notification.push | REST: GET /api/notifications",
          },
        ],
      },
      {
        id: "u-phongTrao", title: "Đăng ký Phong trào", icon: Trophy, sprint: "Sprint 2–3",
        description: "User xem danh sách phong trào đang mở, đăng ký tham gia kèm cam kết chỉ tiêu.",
        features: [
          {
            id:"u-p1", title:"Xem danh sách phong trào đang mở", description:"Grid / list các phong trào đang trong trạng thái mở đăng ký, có filter theo cấp, loại hình.",
            priority:"P0", status:"done", sprint:2, effort:"S",
            subTasks:[
              { title:"CampaignCard component với badge trạng thái", done:true },
              { title:"Filter: cấp tỉnh / cơ sở, loại hình thi đua", done:true },
              { title:"Hiển thị hạn đăng ký + countdown", done:true },
              { title:"Nút 'Đăng ký' nếu chưa tham gia", done:true },
            ],
            uiComponents:["CampaignCard","FilterBar","CountdownTimer"],
            businessRules:["Chỉ hiển thị phong trào status='open'","Phong trào quá hạn → disable nút Đăng ký"],
            acceptanceCriteria:["User thấy đúng danh sách phong trào mở","Hạn đăng ký hiển thị đúng timezone"],
          },
          {
            id:"u-p2", title:"Form đăng ký tham gia + cam kết chỉ tiêu", description:"Wizard 3 bước: Xác nhận tham gia → Nhập chỉ tiêu cam kết → Upload kế hoạch hành động.",
            priority:"P0", status:"in_progress", sprint:3, effort:"L",
            subTasks:[
              { title:"Step 1: Chọn phong trào & xem thể lệ", done:true },
              { title:"Step 2: Form nhập chỉ tiêu cụ thể (số liệu)", done:false },
              { title:"Step 3: Upload file kế hoạch (PDF/DOCX ≤5MB)", done:false },
              { title:"Submit → backend lưu + gửi notification tới Manager", done:false },
            ],
            uiComponents:["MultiStepWizard","GoalInputForm","FileUploader","ConfirmDialog"],
            businessRules:["Mỗi user chỉ đăng ký 1 lần/phong trào","Chỉ tiêu phải > 0 và <= giới hạn phong trào quy định"],
            acceptanceCriteria:["Submit thành công → trạng thái 'Đã đăng ký'","Manager nhận notification mới","Validation lỗi hiển thị đúng field"],
            legalRef:"NĐ 91/2017 Điều 7",
          },
          {
            id:"u-p3", title:"Theo dõi tiến độ thực hiện phong trào", description:"Dashboard mini hiển thị tiến độ thực hiện so với chỉ tiêu cam kết, cho phép cập nhật định kỳ.",
            priority:"P1", status:"planned", sprint:4, effort:"M",
            subTasks:[
              { title:"Progress bar % so với chỉ tiêu cam kết", done:false },
              { title:"Form cập nhật tiến độ hàng tháng", done:false },
              { title:"Lịch sử cập nhật (audit trail)", done:false },
              { title:"Alert khi tiến độ dưới 50% & hạn còn 30 ngày", done:false },
            ],
            uiComponents:["ProgressTracker","MonthlyUpdateForm","AuditTrail"],
            businessRules:["Cập nhật tiến độ tối đa 1 lần/tháng","Không thể khai báo vượt 150% chỉ tiêu cam kết"],
            acceptanceCriteria:["Progress bar cập nhật realtime sau submit","Alert hiển thị đúng ngưỡng"],
          },
        ],
      },
      {
        id: "u-denghikt", title: "Nộp Hồ sơ Đề nghị KT", icon: Award, sprint: "Sprint 3–4",
        description: "Wizard đầy đủ nộp hồ sơ đề nghị khen thưởng cá nhân hoặc tập thể.",
        features: [
          {
            id:"u-k1", title:"Wizard 4 bước nộp hồ sơ mới", description:"Step-by-step form: Thông tin cơ bản → Quá trình & thành tích → Upload minh chứng → Xem lại & Nộp.",
            priority:"P0", status:"in_progress", sprint:3, effort:"XL",
            subTasks:[
              { title:"Step 1: Thông tin cá nhân/tập thể + chọn danh hiệu", done:true },
              { title:"Step 2: Form thành tích 5 năm liên tục (rich text)", done:false },
              { title:"Step 3: Multi-file upload minh chứng (ảnh/PDF)", done:false },
              { title:"Step 4: Preview toàn bộ + nút Nộp + Lưu nháp", done:false },
            ],
            uiComponents:["FormWizard","RichTextEditor","FileUploader","FormPreview","DraftSaver"],
            businessRules:["Validate điều kiện tối thiểu theo danh hiệu trước khi nộp","Lưu nháp auto mỗi 60 giây","Không được nộp 2 hồ sơ cùng danh hiệu trong cùng kỳ"],
            acceptanceCriteria:["Nộp thành công → trạng thái 'Chờ xét duyệt'","Manager đơn vị nhận notification","Validate đầy đủ trước submit"],
            legalRef:"TT 15/2025 Điều 10",
          },
          {
            id:"u-k2", title:"Pre-check AI điều kiện hồ sơ", description:"Trước khi nộp, AI kiểm tra tự động các điều kiện (số năm CSTĐ, tỷ lệ phiếu, tiêu chí con) và hiển thị checklist.",
            priority:"P0", status:"planned", sprint:4, effort:"L",
            subTasks:[
              { title:"Engine rule check theo từng danh hiệu", done:false },
              { title:"UI checklist: pass (xanh) / warning (vàng) / fail (đỏ)", done:false },
              { title:"Explain lý do fail với link điều khoản liên quan", done:false },
              { title:"Không block submit nếu chỉ warning", done:false },
            ],
            uiComponents:["EligibilityChecker","ChecklistPanel","RuleExplainTooltip"],
            businessRules:["Block submit nếu có lỗi P0 (điều kiện bắt buộc)","Warning P1 chỉ nhắc, không block"],
            acceptanceCriteria:["Hồ sơ thiếu điều kiện cứng → block submit + giải thích","Hồ sơ đủ điều kiện → submit button active"],
            legalRef:"NĐ 152/2025/NĐ-CP Chương III",
          },
          {
            id:"u-k3", title:"Theo dõi trạng thái hồ sơ (visual stepper)", description:"Stepper ngang 8 bước hiển thị vị trí hồ sơ trong quy trình, kèm thời gian ở mỗi bước và SLA.",
            priority:"P1", status:"planned", sprint:4, effort:"M",
            subTasks:[
              { title:"HorizontalStepper 8 bước với icon + label", done:false },
              { title:"Thời gian vào/ra mỗi bước (timestamp)", done:false },
              { title:"SLA countdown cho bước hiện tại", done:false },
              { title:"Tooltip xem chi tiết mỗi bước", done:false },
            ],
            uiComponents:["HorizontalStepper","StepTooltip","SLACountdown"],
            businessRules:["Hiển thị bước hiện tại highlight","Bước quá SLA → màu đỏ cảnh báo"],
            acceptanceCriteria:["Stepper sync với trạng thái DB realtime","SLA đếm ngược chính xác theo TT 15/2025"],
            legalRef:"TT 15/2025 Điều 12 (SLA timeline)",
          },
        ],
      },
      {
        id: "u-ketqua", title: "Nhận & Tra cứu Kết quả", icon: ScrollText, sprint: "Sprint 5–6",
        description: "Nhận quyết định khen thưởng, download PDF, tra cứu bằng QR code.",
        features: [
          {
            id:"u-r1", title:"Download Quyết định khen thưởng", description:"Khi QĐ được phát hành, user nhận thông báo và có thể download file PDF QĐ chính thức có chữ ký số.",
            priority:"P1", status:"planned", sprint:5, effort:"S",
            subTasks:[
              { title:"Nút Download PDF trên trang chi tiết hồ sơ", done:false },
              { title:"Verify chữ ký số trước khi download (badge 'Đã ký')", done:false },
              { title:"Log download action vào audit trail", done:false },
            ],
            uiComponents:["PDFDownloadButton","SignatureVerifyBadge"],
            businessRules:["Chỉ download khi QĐ status='published'","Log mọi hành động download"],
            acceptanceCriteria:["PDF download đúng, có chữ ký số hợp lệ","Audit log ghi nhận đúng user/time"],
          },
          {
            id:"u-r2", title:"QR code tra cứu QĐ công khai", description:"Mỗi QĐ sinh QR code, quét → trang xác thực công khai không cần đăng nhập, hiển thị thông tin QĐ và tình trạng chữ ký.",
            priority:"P2", status:"planned", sprint:6, effort:"S",
            subTasks:[
              { title:"Generate QR code từ QĐ ID + hash", done:false },
              { title:"Public verification page (no auth)", done:false },
              { title:"Hiển thị: số QĐ, ngày ký, cá nhân được khen, chữ ký CA", done:false },
            ],
            uiComponents:["QRCodeGenerator","PublicVerifyPage"],
            businessRules:["URL verify không expiry","Hash bảo vệ chống giả mạo QR"],
            acceptanceCriteria:["Quét QR → trang verify hiển thị đúng thông tin QĐ","URL không chứa thông tin nhạy cảm"],
          },
        ],
      },
    ],
  },

  /* ──────────────────────── MANAGER ───────────────────────── */
  {
    role: "manager",
    modules: [
      {
        id:"m-dashboard", title:"Dashboard Đơn vị", icon:LayoutDashboard, sprint:"Sprint 1–2",
        description:"KPI thi đua đơn vị, danh sách cán bộ, lịch hạn nộp hồ sơ.",
        features:[
          {
            id:"m-d1", title:"KPI thi đua đơn vị vs. chỉ tiêu năm", description:"Panel so sánh thực hiện vs. chỉ tiêu: CSTĐ, danh hiệu các hạng, tỷ lệ hoàn thành phong trào.",
            priority:"P0", status:"done", sprint:2, effort:"M",
            subTasks:[
              { title:"3 KPI widgets: CSTĐ / Danh hiệu / Phong trào", done:true },
              { title:"Progress ring + % so với chỉ tiêu năm", done:true },
              { title:"So sánh cùng kỳ năm trước", done:false },
              { title:"Drill-down xem chi tiết từng cán bộ", done:false },
            ],
            uiComponents:["KPIWidget","ProgressRing","ComparisonChart"],
            businessRules:["Chỉ tiêu năm được cấu hình bởi Admin","Tính tỷ lệ: done/target × 100%"],
            acceptanceCriteria:["KPI hiển thị đúng số liệu từ DB","Drill-down mở đúng danh sách"],
          },
          {
            id:"m-d2", title:"Lịch hạn nộp hồ sơ sắp đến", description:"Bảng danh sách các mốc thời gian quan trọng: đợt xét tặng, hạn nộp hồ sơ lên HĐ, ngày phiên họp.",
            priority:"P1", status:"planned", sprint:3, effort:"S",
            subTasks:[
              { title:"Timeline calendar widget (mini)", done:false },
              { title:"Fetch deadline từ config kỳ xét tặng", done:false },
              { title:"Highlight 'sắp đến' (≤7 ngày) màu cam", done:false },
            ],
            uiComponents:["DeadlineTimeline","CalendarWidget"],
            businessRules:["Deadline lấy từ AdminConfig, không hardcode","Màu đỏ nếu hôm nay là ngày hạn"],
            acceptanceCriteria:["Hiển thị đúng deadline từ config","Highlight đúng ngày sắp đến"],
          },
        ],
      },
      {
        id:"m-hosokt", title:"Hồ sơ Đề nghị KT Đơn vị", icon:Award, sprint:"Sprint 2–4",
        description:"Tạo, phê duyệt nội bộ, gửi lên HĐ hồ sơ đề nghị toàn đơn vị.",
        features:[
          {
            id:"m-k1", title:"Tạo hồ sơ mới (đơn vị / cá nhân thuộc đơn vị)", description:"Manager tạo hồ sơ đề nghị KT thay mặt cán bộ hoặc cho tập thể đơn vị — wizard tương tự User nhưng có thêm trường 'thay mặt'.",
            priority:"P0", status:"done", sprint:2, effort:"L",
            subTasks:[
              { title:"Field 'Người được đề nghị' với autocomplete từ Hồ sơ cán bộ", done:true },
              { title:"Pre-fill thông tin từ hồ sơ cán bộ", done:true },
              { title:"Toggle: cá nhân / tập thể đơn vị", done:true },
              { title:"Gửi notification xác nhận tới cán bộ liên quan", done:false },
            ],
            uiComponents:["NominationForm","PersonAutocomplete","UnitSelector"],
            businessRules:["Manager chỉ tạo hồ sơ cho đơn vị mình quản lý","Cần xác nhận của cán bộ nếu hồ sơ cá nhân"],
            acceptanceCriteria:["Tạo hồ sơ thành công → HĐ thấy trong queue","Validation đầy đủ theo danh hiệu"],
            legalRef:"TT 15/2025 Điều 9",
          },
          {
            id:"m-k2", title:"Phê duyệt nội bộ đơn vị", description:"Trước khi gửi lên HĐ, Manager ký xác nhận (chữ ký tay số hóa hoặc click Xác nhận). Hồ sơ phải qua bước n��y.",
            priority:"P0", status:"in_progress", sprint:3, effort:"M",
            subTasks:[
              { title:"Nút 'Xác nhận & Gửi lên HĐ' với confirmation dialog", done:true },
              { title:"Timestamp & IP log khi xác nhận", done:false },
              { title:"Trả lại hồ sơ cho cán bộ bổ sung (với comment)", done:false },
              { title:"Status transition: draft → pending_unit → pending_council", done:false },
            ],
            uiComponents:["ApprovalDialog","CommentBox","StatusTransitionButton"],
            businessRules:["Chỉ Manager của đơn vị được phê duyệt","Hồ sơ phải đầy đủ trường bắt buộc trước khi xác nhận"],
            acceptanceCriteria:["Sau xác nhận → hồ sơ chuyển sang HĐ queue","Trả lại → cán bộ nhận notification bổ sung"],
            legalRef:"TT 15/2025 Điều 11",
          },
          {
            id:"m-k3", title:"Gửi hàng loạt nhiều hồ sơ cùng lúc", description:"Checkbox chọn nhiều hồ sơ, gửi tất cả lên HĐ trong 1 thao tác — tiết kiệm thời gian cuối đợt xét tặng.",
            priority:"P1", status:"planned", sprint:4, effort:"M",
            subTasks:[
              { title:"Checkbox select-all / individual trên danh sách", done:false },
              { title:"Batch action toolbar (Gửi / Xoá / Export)", done:false },
              { title:"Progress toast khi đang xử lý batch", done:false },
              { title:"Báo cáo kết quả: X thành công / Y thất bại", done:false },
            ],
            uiComponents:["DataTableWithCheckbox","BatchActionBar","ProgressToast","BatchResultDialog"],
            businessRules:["Tối đa 50 hồ sơ/batch","Chỉ gửi hồ sơ đang ở trạng thái 'đơn vị xác nhận'"],
            acceptanceCriteria:["Batch 10 hồ sơ → tất cả chuyển trạng thái đúng","Error handling: hồ sơ lỗi không ảnh hưởng hồ sơ còn lại"],
          },
          {
            id:"m-k4", title:"Export tờ trình PDF (Mẫu 02/TT 15/2025)", description:"Xuất file PDF tờ trình đề nghị theo đúng mẫu TT 15/2025 Mẫu số 02 — auto-fill từ dữ liệu hồ sơ.",
            priority:"P0", status:"planned", sprint:4, effort:"L",
            subTasks:[
              { title:"HTML template Mẫu 02 chuẩn font Times New Roman 13pt", done:false },
              { title:"Auto-fill tên, chức vụ, đơn vị, danh hiệu đề nghị", done:false },
              { title:"Render PDF bằng @react-pdf/renderer hoặc puppeteer", done:false },
              { title:"Preview PDF trước khi download", done:false },
            ],
            uiComponents:["PDFPreviewModal","PDFDownloadButton"],
            businessRules:["Font & layout phải đúng theo quy định","Tên đơn vị lấy từ cấu hình Admin","Không chỉnh sửa sau khi xuất (readonly)"],
            acceptanceCriteria:["PDF xuất đúng mẫu TT 15/2025 Mẫu 02","Auto-fill đúng 100% dữ liệu hồ sơ"],
            legalRef:"TT 15/2025 Phụ lục Mẫu số 02",
          },
        ],
      },
      {
        id:"m-layyKien", title:"Lấy ý kiến & Báo cáo", icon:Megaphone, sprint:"Sprint 3–5",
        description:"Tổ chức lấy ý kiến công khai, tổng hợp kết quả, báo cáo thi đua đơn vị.",
        features:[
          {
            id:"m-y1", title:"Tạo đợt lấy ý kiến cho hồ sơ đơn vị", description:"Manager khởi tạo đợt lấy ý kiến cho hồ sơ cụ thể, chọn đối tượng được hỏi, đặt thời hạn.",
            priority:"P0", status:"done", sprint:3, effort:"M",
            subTasks:[
              { title:"Form tạo đợt: chọn hồ sơ, đối tượng hỏi, thời hạn", done:true },
              { title:"Gửi link khảo sát tới đối tượng qua email/hệ thống", done:false },
              { title:"Dashboard tổng hợp: số ý kiến nhận được, tỷ lệ phản hồi", done:false },
            ],
            uiComponents:["SurveyCreateForm","RecipientSelector","SurveyDashboard"],
            businessRules:["Thời hạn lấy ý kiến tối thiểu 5 ngày làm việc","Đủ 2/3 số người tham gia mới tính kết quả"],
            acceptanceCriteria:["Đợt tạo thành công → đối tượng nhận notification","Dashboard tổng hợp cập nhật realtime"],
            legalRef:"TT 15/2025 Điều 15",
          },
          {
            id:"m-y2", title:"Báo cáo tổng hợp thi đua đơn vị (Excel)", description:"Xuất báo cáo tổng hợp tháng/quý/năm theo biểu mẫu BNV, filter theo loại hình đơn vị, danh hiệu.",
            priority:"P1", status:"planned", sprint:5, effort:"L",
            subTasks:[
              { title:"Filter: kỳ báo cáo, loại danh hiệu, trạng thái", done:false },
              { title:"Export Excel với sheet tổng hợp + sheet chi tiết", done:false },
              { title:"Biểu đồ cột so sánh năm/kỳ (trong file Excel)", done:false },
              { title:"Gửi báo cáo lên Council trong hệ thống", done:false },
            ],
            uiComponents:["ReportFilterPanel","ExcelExportButton","SendReportDialog"],
            businessRules:["Dữ liệu tính đến ngày xuất báo cáo (snapshot)","Chữ ký số của Manager xác nhận báo cáo"],
            acceptanceCriteria:["Excel đúng định dạng BNV","Số liệu khớp với DB","Gửi báo cáo → Council nhận notification"],
            legalRef:"TT 15/2025 Điều 22",
          },
        ],
      },
    ],
  },

  /* ──────────────────────── COUNCIL ───────────────────────── */
  {
    role: "council",
    modules: [
      {
        id:"c-thamdinh", title:"Thẩm định Hồ sơ", icon:ClipboardList, sprint:"Sprint 2–3",
        description:"Queue thẩm định cá nhân, form 5 tiêu chí, kiểm tra điều kiện pháp lý, COI.",
        features:[
          {
            id:"c-t1", title:"Queue thẩm định & phân công tự động", description:"Danh sách hồ sơ được phân công cho từng thành viên HĐ, có SLA countdown, filter theo đơn vị/danh hiệu.",
            priority:"P0", status:"done", sprint:2, effort:"M",
            subTasks:[
              { title:"Danh sách hồ sơ với cột: tên, đơn vị, danh hiệu, SLA còn", done:true },
              { title:"Thuật toán phân công round-robin theo workload", done:false },
              { title:"Highlight hồ sơ SLA < 3 ngày màu đỏ", done:false },
              { title:"Filter: đơn vị / danh hiệu / trạng thái", done:true },
            ],
            uiComponents:["ReviewQueue","SLACountdown","FilterBar","AssignmentBadge"],
            businessRules:["SLA tính theo ngày làm việc (trừ T7, CN, lễ)","Thành viên không được thẩm định hồ sơ đơn vị mình"],
            acceptanceCriteria:["Queue hiển thị đúng hồ sơ được phân công","SLA countdown chính xác theo TT 15/2025"],
            legalRef:"TT 15/2025 Điều 12 — Thời hạn xử lý",
          },
          {
            id:"c-t2", title:"Form thẩm định 5 tiêu chí scoring", description:"Form chấm điểm 5 tiêu chí theo rubric, inline calculation tổng điểm, ô nhận xét tự do, ký tắt điện tử.",
            priority:"P0", status:"done", sprint:2, effort:"L",
            subTasks:[
              { title:"5 tiêu chí slider + số (0–20 điểm mỗi tiêu chí)", done:true },
              { title:"Auto-calculate tổng điểm realtime", done:true },
              { title:"Ô nhận xét tự do (rich text, max 500 từ)", done:true },
              { title:"Nút 'Ký tắt' (mock): lưu timestamp + userId", done:true },
            ],
            uiComponents:["ScoringForm","CriteriaSlider","RichTextComment","ApproveButton"],
            businessRules:["Phải điền đủ 5 tiêu chí trước khi submit","Tổng điểm ≥ 80/100 → đủ điều kiện trình HĐ"],
            acceptanceCriteria:["Submit form → score lưu DB","Tổng điểm tính đúng","Không submit được nếu thiếu tiêu chí"],
            legalRef:"NĐ 152/2025/NĐ-CP Phụ lục I — Tiêu chuẩn",
          },
          {
            id:"c-t3", title:"Kiểm tra điều kiện pháp lý auto (NĐ 98)", description:"Engine tự động đối chiếu hồ sơ với điều kiện NĐ 152/2025/NĐ-CP: số năm CSTĐ, tỷ lệ % phiếu, tuổi nghề, không vi phạm.",
            priority:"P0", status:"planned", sprint:3, effort:"L",
            subTasks:[
              { title:"Rule engine cho 8 danh hiệu chính theo NĐ 98", done:false },
              { title:"Checklist UI: ✓ Đủ / ✗ Thiếu / ⚠ Cần xác minh", done:false },
              { title:"Link tới điều khoản pháp lý liên quan", done:false },
              { title:"Flag hồ sơ cần xác minh bổ sung", done:false },
            ],
            uiComponents:["LegalCheckPanel","RuleResultItem","LegalLinkTooltip","FlagButton"],
            businessRules:["Dùng data từ Hồ sơ cán bộ để check","Hồ sơ fail bắt buộc → không đưa vào phiên họp","Kết quả check lưu kèm hồ sơ dưới dạng JSON"],
            acceptanceCriteria:["Hồ sơ đủ điều kiện → checklist xanh","Hồ sơ thiếu → chi tiết điều kiện thiếu","Rule engine coverage 100% NĐ 152/2025/NĐ-CP"],
            legalRef:"NĐ 152/2025/NĐ-CP Điều 11–25",
          },
          {
            id:"c-t4", title:"COI auto-detection (Conflict of Interest)", description:"Hệ thống tự động phát hiện thành viên HĐ có quan hệ (hôn nhân/huyết thống/đồng đơn vị) với ứng viên, yêu cầu hồi tị.",
            priority:"P0", status:"planned", sprint:3, effort:"L",
            subTasks:[
              { title:"Bảng dữ liệu quan hệ nhân sự (relationship graph)", done:false },
              { title:"Auto-match khi phiên họp được tạo", done:false },
              { title:"Cảnh báo + ẩn phiếu bầu cho thành viên COI", done:false },
              { title:"Log tất cả trường hợp COI vào biên bản", done:false },
            ],
            uiComponents:["COIAlertBanner","RecusalDialog","COILogEntry"],
            businessRules:["COI gồm: vợ/chồng, bố/mẹ/con, anh/chị/em, cùng đơn vị trực tiếp","Thành viên COI không được bỏ phiếu, vẫn được dự họp"],
            acceptanceCriteria:["Phát hiện đúng 100% trường hợp COI trong test data","Biên bản ghi rõ thành viên hồi tị và lý do"],
            legalRef:"Luật TĐKT 2022 Điều 27 — Nguyên tắc hồi tị",
          },
        ],
      },
      {
        id:"c-hoiDong", title:"Phiên họp Hội đồng", icon:Gavel, sprint:"Sprint 2–4",
        description:"Tạo phiên họp, agenda, bỏ phiếu điện tử, auto-generate biên bản PDF.",
        features:[
          {
            id:"c-h1", title:"Tạo & quản lý phiên họp", description:"CRUD phiên họp: ngày giờ, địa điểm/online, thành phần, danh sách hồ sơ đưa vào chương trình.",
            priority:"P0", status:"done", sprint:2, effort:"M",
            subTasks:[
              { title:"Form tạo phiên: ngày, địa điểm, thành phần tham dự", done:true },
              { title:"Chọn hồ sơ vào chương trình (drag-drop từ queue)", done:false },
              { title:"Gửi thư mời/nhắc nhở tới thành viên", done:false },
              { title:"Confirm tham dự (click link hoặc trong app)", done:false },
            ],
            uiComponents:["MeetingForm","AgendaBuilder","AttendanceConfirm"],
            businessRules:["Số lượng thành viên >= 2/3 tổng HĐ mới đủ điều kiện họp","Thông báo trước tối thiểu 3 ngày làm việc"],
            acceptanceCriteria:["Tạo phiên thành công → thành viên nhận notification","Agenda hiển thị đúng hồ sơ được chọn"],
            legalRef:"NĐ 152/2025/NĐ-CP Điều 30 — Điều kiện họp HĐ",
          },
          {
            id:"c-h2", title:"Bỏ phiếu điện tử + COI mask", description:"Mỗi thành viên bỏ phiếu (Tán thành / Không / Vắng mặt) cho từng hồ sơ. Thành viên COI tự động bị ẩn phiếu bầu.",
            priority:"P0", status:"planned", sprint:4, effort:"L",
            subTasks:[
              { title:"UI bỏ phiếu: 3 nút lớn (tán thành/không tán thành/vắng mặt)", done:false },
              { title:"Tổng hợp kết quả real-time khi từng phiếu submit", done:false },
              { title:"Ẩn/disable phiếu bầu cho thành viên COI", done:false },
              { title:"Kết quả chốt khi đủ 2/3 thành viên đã bỏ phiếu", done:false },
            ],
            uiComponents:["VotingPanel","VoteButton","VoteTallyCard","COIRecusalNote"],
            businessRules:["Phiếu bầu là bí mật (không hiển thị ai bỏ phiếu gì realtime)","Kết quả tổng hợp (số tán thành) hiển thị sau khi chốt"],
            acceptanceCriteria:["COI member không thấy nút bỏ phiếu","Kết quả tổng hợp chính xác","Biên bản ghi đúng số phiếu"],
            legalRef:"NĐ 152/2025/NĐ-CP Điều 32 — Biểu quyết HĐ",
          },
          {
            id:"c-h3", title:"Auto-generate biên bản & Export PDF (Mẫu 01)", description:"Sau khi phiên họp kết thúc, hệ thống tự tổng hợp biên bản: thành phần, chương trình, kết quả bỏ phiếu, kết luận.",
            priority:"P0", status:"planned", sprint:4, effort:"L",
            subTasks:[
              { title:"Template biên bản Mẫu 01/TT 15/2025", done:false },
              { title:"Auto-fill: ngày, thành phần, kết quả phiếu, kết luận", done:false },
              { title:"Cho phép edit tay phần 'Kết luận' trước khi xuất", done:false },
              { title:"Export PDF + chữ ký số mock của Chủ tịch HĐ", done:false },
            ],
            uiComponents:["MinutesPreview","PDFExportButton","ConclusionEditor"],
            businessRules:["Biên bản tự động, không được xóa dữ liệu phiếu bầu","Chỉ Chủ tịch HĐ được ký biên bản","Một phiên họp = một biên bản, immutable sau khi ký"],
            acceptanceCriteria:["Biên bản đúng Mẫu 01/TT 15/2025","Kết quả phiếu bầu khớp với dữ liệu","PDF có chữ ký điện tử"],
            legalRef:"TT 15/2025 Phụ lục Mẫu số 01 — Biên bản HĐ",
          },
        ],
      },
      {
        id:"c-chamDiem", title:"Chấm điểm & Bình xét", icon:BarChart3, sprint:"Sprint 2–5",
        description:"Scoring tập thể, AI gợi ý, so sánh giữa thành viên, phê duyệt kết quả cuối.",
        features:[
          {
            id:"c-c1", title:"Batch scoring bình xét tập thể", description:"Nhập điểm nhiều hồ sơ cùng lúc trong bảng, realtime highlight theo threshold danh hiệu.",
            priority:"P0", status:"done", sprint:2, effort:"M",
            subTasks:[
              { title:"DataGrid với inline edit các ô điểm", done:true },
              { title:"Row highlight: xanh (≥80) / vàng (60–79) / đỏ (<60)", done:true },
              { title:"Sort theo tổng điểm / theo đơn vị", done:true },
              { title:"Lock row sau khi Chủ tịch HĐ xác nhận", done:false },
            ],
            uiComponents:["ScoreDataGrid","ThresholdHighlight","LockRowButton"],
            businessRules:["Điểm từng tiêu chí: 0–20, tổng tối đa 100","Chỉ thành viên được phân công mới chỉnh sửa hàng của mình"],
            acceptanceCriteria:["Inline edit lưu realtime","Highlight đúng theo threshold","Lock hoạt động sau khi Chủ tịch confirm"],
          },
          {
            id:"c-c2", title:"AI scoring assistant gợi ý điểm", description:"AI phân tích thành tích, so sánh với pool hồ sơ tương tự đã được xét trong quá khứ, đề xuất điểm từng tiêu chí.",
            priority:"P1", status:"planned", sprint:5, effort:"XL",
            subTasks:[
              { title:"NLP pipeline phân tích nội dung thành tích (Vietnamese)", done:false },
              { title:"Vector database lưu embedding hồ sơ lịch sử", done:false },
              { title:"API endpoint: POST /api/ai/scoring-suggest", done:false },
              { title:"UI: panel 'Gợi ý AI' có nút 'Áp dụng' / 'Bỏ qua'", done:false },
            ],
            uiComponents:["AISuggestPanel","ScoreApplyButton","ConfidenceBar"],
            businessRules:["AI chỉ gợi ý, thành viên tự quyết định","Confidence < 60% → hiển thị warning","Mọi gợi ý AI được log (explainability)"],
            acceptanceCriteria:["AI trả về gợi ý trong < 3 giây","Accuracy ≥ 75% so với ground truth","Thành viên có thể override bất kỳ lúc nào"],
          },
        ],
      },
    ],
  },

  /* ──────────────────────── LEADER ───────────────────────── */
  {
    role: "leader",
    modules: [
      {
        id:"l-kyso", title:"Inbox Ký số & Phê duyệt", icon:FileSignature, sprint:"Sprint 2–4",
        description:"Queue hồ sơ chờ ký, SLA priority, ký CA thực, batch sign, từ chối.",
        features:[
          {
            id:"l-k1", title:"Inbox ký số với SLA countdown", description:"Danh sách hồ sơ chờ ký sắp xếp theo SLA còn lại, màu đỏ/vàng/xanh. Preview nhanh không cần mở trang mới.",
            priority:"P0", status:"done", sprint:2, effort:"M",
            subTasks:[
              { title:"Inbox list với cột: tên hồ sơ, đơn vị, danh hiệu, SLA còn, trạng thái", done:true },
              { title:"Sort auto: SLA ngắn nhất lên đầu", done:true },
              { title:"Preview panel bên phải (split view)", done:true },
              { title:"Filter: theo đơn vị / danh hiệu / độ ưu tiên", done:false },
            ],
            uiComponents:["SignInbox","SLABadge","SplitPreviewPanel","FilterToolbar"],
            businessRules:["SLA < 1 ngày → đỏ, < 3 ngày → vàng, > 3 ngày → xanh","Hồ sơ quá SLA gửi alert email tự động"],
            acceptanceCriteria:["Inbox load < 1s","SLA countdown chính xác","Sort theo SLA đúng thứ tự"],
            legalRef:"TT 15/2025 Điều 12 — SLA xử lý hồ sơ",
          },
          {
            id:"l-k2", title:"Ký số CA tích hợp PKI (SAVIS / VNPT-CA)", description:"Kết nối API CA thực: gọi eSign SDK, sign document hash, trả về chứng thư, verify certificate chain.",
            priority:"P0", status:"planned", sprint:4, effort:"XL",
            subTasks:[
              { title:"Tích hợp SAVIS eSign SDK (hoặc VNPT-CA)", done:false },
              { title:"Generate document hash SHA-256 trước ký", done:false },
              { title:"Call CA API: sign(hash, cert) → signature bytes", done:false },
              { title:"Verify chain: cert → intermediate → root CA", done:false },
              { title:"Embed signature vào PDF + timestamp server (TSA)", done:false },
            ],
            uiComponents:["CASignButton","CertificatePicker","SignatureProgressModal"],
            businessRules:["Chứng thư số phải còn hạn và do NEAC cấp phép","Ký phải kèm timestamp server (không chấp nhận local time)","Một lần ký = không thể chỉnh sửa document"],
            acceptanceCriteria:["PDF sau ký verify thành công bằng Adobe Reader","Timestamp server response time < 2s","Chứng thư hết hạn → block ký + hiển thị cảnh báo"],
            legalRef:"NĐ 130/2018/NĐ-CP — Chữ ký số & Dịch vụ chứng thực",
            apiNote:"POST /api/signing/ca-sign { documentId, certSerial } → { signedPdfUrl, timestamp }",
          },
          {
            id:"l-k3", title:"Ký số hàng loạt (Batch Sign ≤ 20 hồ sơ)", description:"Chọn nhiều hồ sơ, ký tất cả trong 1 phiên CA auth — tiết kiệm thời gian Leader cuối đợt xét tặng.",
            priority:"P1", status:"planned", sprint:5, effort:"L",
            subTasks:[
              { title:"Checkbox select trong Inbox", done:false },
              { title:"'Ký tất cả được chọn' button với confirm dialog", done:false },
              { title:"Progress bar: X/20 đã ký", done:false },
              { title:"Báo cáo kết quả batch: thành công / thất bại chi tiết", done:false },
            ],
            uiComponents:["BatchSignButton","BatchProgressModal","BatchResultReport"],
            businessRules:["Tối đa 20 hồ sơ/lần batch","1 lần xác thực CA cho toàn batch","Nếu 1 hồ sơ lỗi → tiếp tục hồ sơ tiếp theo, log lỗi"],
            acceptanceCriteria:["Batch 10 hồ sơ hoàn thành < 30 giây","Kết quả báo cáo chi tiết từng hồ sơ","Rollback không xảy ra (mỗi hồ sơ độc lập)"],
            deps:["l-k2"],
          },
          {
            id:"l-k4", title:"Từ chối + Trả lại có lý do", description:"Leader từ chối ký hoặc trả lại cho HĐ xem xét lại, kèm comment chi tiết. Hồ sơ quay về queue HĐ.",
            priority:"P0", status:"done", sprint:2, effort:"S",
            subTasks:[
              { title:"Dialog từ chối với dropdown lý do + textarea", done:true },
              { title:"Status transition: pending_sign → rejected / returned_to_council", done:true },
              { title:"Notification tới Council + Manager khi trả lại", done:false },
              { title:"Comment gắn vào hồ sơ history (immutable)", done:false },
            ],
            uiComponents:["RejectDialog","ReasonDropdown","ReturnButton"],
            businessRules:["Lý do từ chối là bắt buộc, tối thiểu 20 ký tự","Comment immutable sau khi submit"],
            acceptanceCriteria:["Từ chối → hồ sơ về Council queue","Council nhận notification với lý do đầy đủ"],
          },
        ],
      },
      {
        id:"l-quyetDinh", title:"Ban hành Quyết định", icon:ScrollText, sprint:"Sprint 4–5",
        description:"Dự thảo QĐ, đánh số tự động, ký số CA, phát hành chính thức.",
        features:[
          {
            id:"l-q1", title:"Dự thảo QĐ từ template chuẩn", description:"Chọn template QĐ (tặng CSTĐ / HCL / BK...), auto-fill thông tin từ hồ sơ, cho phép edit phần tự do.",
            priority:"P0", status:"planned", sprint:4, effort:"L",
            subTasks:[
              { title:"Thư viện template QĐ theo loại danh hiệu", done:false },
              { title:"Auto-fill: số QĐ, ngày, tên cá nhân/đơn vị, danh hiệu, lý do", done:false },
              { title:"Rich text editor cho phần 'xét thấy' + 'quyết định'", done:false },
              { title:"Version history dự thảo (v1, v2, v3...)", done:false },
            ],
            uiComponents:["TemplateSelector","DecisionDraftEditor","VersionHistory"],
            businessRules:["Template do Admin quản lý, Leader không thể sửa cấu trúc","Số QĐ tự động theo series năm (VD: 123/QĐ-UBND-2026)"],
            acceptanceCriteria:["Auto-fill đúng 100% dữ liệu","Số QĐ không trùng lặp","Version history lưu đúng"],
            legalRef:"TT 15/2025 Điều 18 — Quyết định khen thưởng",
          },
          {
            id:"l-q2", title:"Phát hành QĐ & Notify", description:"Sau khi ký số, QĐ chuyển trạng thái 'published', hệ thống tự gửi notification tới Manager, cán bộ liên quan.",
            priority:"P1", status:"planned", sprint:5, effort:"M",
            subTasks:[
              { title:"Status transition: draft → signed → published", done:false },
              { title:"Notify email + in-app tới cán bộ được khen", done:false },
              { title:"Notify Manager đơn vị để tổ chức trao tặng", done:false },
              { title:"QĐ xuất hiện trong mục 'Lịch sử khen thưởng' của cá nhân", done:false },
            ],
            uiComponents:["PublishButton","NotificationDispatcher"],
            businessRules:["QĐ đã publish → immutable","Thông báo gửi trong 1 phút sau publish"],
            acceptanceCriteria:["Publish → cán bộ nhận notification < 1 phút","QĐ hiển thị trong lịch sử cá nhân đúng"],
          },
        ],
      },
      {
        id:"l-tonghop", title:"Tổng quan Lãnh đạo", icon:BarChart3, sprint:"Sprint 5–6",
        description:"Dashboard multi-unit cấp tỉnh, SLA monitoring, báo cáo gửi BNV.",
        features:[
          {
            id:"l-t1", title:"SLA monitoring — cảnh báo quá hạn toàn hệ thống", description:"Dashboard hiển thị tất cả hồ sơ quá SLA, phân loại theo đơn vị, stage, trách nhiệm xử lý.",
            priority:"P0", status:"planned", sprint:3, effort:"M",
            subTasks:[
              { title:"SLA breach table: hồ sơ, stage, quá hạn X ngày, người xử lý", done:false },
              { title:"Filter theo đơn vị / stage / mức độ nghiêm trọng", done:false },
              { title:"Click row → navigate tới hồ sơ để xử lý", done:false },
              { title:"Export Excel danh sách vi phạm SLA", done:false },
            ],
            uiComponents:["SLABreachTable","SeverityFilter","BreachExportButton"],
            businessRules:["SLA tính theo TT 15/2025 Điều 12","Hồ sơ quá 2× SLA → alert tới Leader qua email"],
            acceptanceCriteria:["Hiển thị đúng danh sách vi phạm SLA","Click row → đến đúng hồ sơ"],
            legalRef:"TT 15/2025 Điều 12 — Thời hạn tối đa xử lý",
          },
          {
            id:"l-t2", title:"Dashboard tổng hợp multi-unit cấp tỉnh", description:"Bản đồ nhiệt (heatmap) tỉnh — đơn vị nào tốt/kém, tổng số hồ sơ, top 10 cá nhân thi đua xuất sắc.",
            priority:"P1", status:"planned", sprint:6, effort:"XL",
            subTasks:[
              { title:"Heatmap theo đơn vị: màu dựa trên điểm thi đua tổng hợp", done:false },
              { title:"Top 10 ranking với trend arrow", done:false },
              { title:"Drill-down: click đơn vị → xem chi tiết", done:false },
              { title:"Snapshot so sánh với cùng kỳ năm trước", done:false },
            ],
            uiComponents:["UnitHeatmap","RankingTable","TrendArrow","DrillDownPanel"],
            businessRules:["Chỉ Leader và Admin thấy view toàn tỉnh","Không hiển thị thông tin cá nhân trong view này"],
            acceptanceCriteria:["Heatmap load < 2s","Drill-down hiển thị đúng đơn vị","Ranking cập nhật daily"],
          },
        ],
      },
    ],
  },

  /* ──────────────────────── ADMIN ─────────────────────────── */
  {
    role: "admin",
    modules: [
      {
        id:"a-donvi", title:"Cấu hình Đơn vị Multi-tenant", icon:Building2, sprint:"Sprint 4",
        description:"CRUD cơ cấu tổ chức cây phân cấp, thông tin pháp nhân, năm công tác.",
        features:[
          {
            id:"a-d1", title:"CRUD cơ cấu tổ chức cây phân cấp", description:"Tree editor tạo/sửa/xóa đơn vị: Tỉnh ủy → Sở/Ngành → Phòng ban. Mỗi node có tên, mã số, cấp.",
            priority:"P0", status:"planned", sprint:4, effort:"XL",
            subTasks:[
              { title:"TreeView component có drag-drop reorder", done:false },
              { title:"CRUD modal: thêm/sửa/xóa node với validation", done:false },
              { title:"Kiểm tra constraint: không xóa đơn vị có user/hồ sơ", done:false },
              { title:"Export cơ cấu ra Excel / Import ngược lại", done:false },
            ],
            uiComponents:["OrgTreeEditor","UnitModal","ImportExcelDialog"],
            businessRules:["Cây tối đa 5 tầng","Xóa đơn vị yêu cầu di chuyển tất cả user về đơn vị cha","Tên đơn vị unique trong cùng cấp"],
            acceptanceCriteria:["Tạo cây 50 đơn vị hoạt động bình thường","Xóa đơn vị có user → hệ thống từ chối + hiển thị cảnh báo"],
          },
          {
            id:"a-d2", title:"Cấu hình kỳ xét tặng & deadline", description:"Admin cấu hình năm công tác, các đợt xét tặng, deadline nộp hồ sơ từng cấp — data source cho SLA toàn hệ thống.",
            priority:"P0", status:"planned", sprint:4, effort:"M",
            subTasks:[
              { title:"Form cấu hình năm công tác (bắt đầu/kết thúc)", done:false },
              { title:"CRUD đợt xét tặng với deadline từng bước", done:false },
              { title:"Preview SLA calendar cho từng role", done:false },
              { title:"Publish config → notify toàn hệ thống", done:false },
            ],
            uiComponents:["PeriodConfigForm","DeadlineCalendar","PublishConfigButton"],
            businessRules:["Phải có ít nhất 1 kỳ xét tặng active","Deadline không được trùng nhau","Thay đổi config chỉ áp dụng cho đợt mới, không ảnh hưởng hồ sơ đang xử lý"],
            acceptanceCriteria:["Config publish → tất cả deadline trong hệ thống cập nhật","Preview SLA calendar đúng cho từng role"],
            legalRef:"TT 15/2025 Điều 4 — Kỳ xét tặng",
          },
          {
            id:"a-d3", title:"Import cơ cấu tổ chức từ Excel", description:"Upload file Excel template cơ cấu đơn vị, hệ thống parse & validate → tạo cây tổ chức trong 1 thao tác.",
            priority:"P1", status:"planned", sprint:4, effort:"M",
            subTasks:[
              { title:"Download template Excel mẫu", done:false },
              { title:"Upload & parse Excel (xlsx) → preview cây", done:false },
              { title:"Validate: check trùng lặp, cấp, quan hệ cha-con", done:false },
              { title:"Commit import sau khi xác nhận preview", done:false },
            ],
            uiComponents:["TemplateDownloadButton","ExcelUploader","ImportPreviewTree","CommitButton"],
            businessRules:["Template Excel bắt buộc dùng đúng cột header","Lỗi validation dừng import, báo dòng lỗi cụ thể"],
            acceptanceCriteria:["Import 200 đơn vị thành công","Error report chỉ đúng dòng lỗi","Preview tree hiển thị đúng trước commit"],
          },
        ],
      },
      {
        id:"a-phanquyen", title:"Phân quyền & Tài khoản", icon:Lock, sprint:"Sprint 1–3",
        description:"CRUD user, gán/thu hồi roles, 2FA, audit log toàn hệ thống.",
        features:[
          {
            id:"a-p1", title:"CRUD tài khoản người dùng", description:"Danh sách user với search/filter, tạo/sửa/khoá tài khoản, reset mật khẩu, gán vào đơn vị.",
            priority:"P0", status:"done", sprint:1, effort:"L",
            subTasks:[
              { title:"DataTable user với search, filter theo đơn vị/role/trạng thái", done:true },
              { title:"Modal tạo/sửa user: tên, email, đơn vị, role", done:true },
              { title:"Khoá tài khoản (soft-delete với reason)", done:true },
              { title:"Reset password → gửi email link", done:false },
            ],
            uiComponents:["UserDataTable","UserModal","LockUserDialog","ResetPasswordButton"],
            businessRules:["Email là unique key","Không thể xóa cứng user có audit log","Admin không thể khoá chính mình"],
            acceptanceCriteria:["Search/filter hoạt động < 300ms","Lock user → user bị logout ngay lập tức"],
          },
          {
            id:"a-p2", title:"2FA enforcement cho Leader & Admin", description:"Bắt buộc bật 2FA với TOTP (Google Auth) hoặc SMS OTP cho role Leader và Admin. Recovery codes.",
            priority:"P1", status:"planned", sprint:6, effort:"M",
            subTasks:[
              { title:"TOTP setup wizard (QR code scan)", done:false },
              { title:"SMS OTP fallback", done:false },
              { title:"Recovery codes (8 codes one-time use)", done:false },
              { title:"Enforce 2FA: nếu chưa bật → redirect setup sau login", done:false },
            ],
            uiComponents:["TOTPSetupWizard","QRCodeDisplay","RecoveryCodesPanel","SMSOTPInput"],
            businessRules:["Leader & Admin bắt buộc 2FA sau 7 ngày kể từ khi enforce","Mỗi TOTP window 30s","Recovery codes mã hóa bcrypt"],
            acceptanceCriteria:["TOTP setup → login thành công với code","Enforce redirect hoạt động đúng role"],
          },
          {
            id:"a-p3", title:"Audit log dashboard toàn hệ thống", description:"Timeline tất cả hành động quan trọng (login, create/update/delete, approve, sign) — filter, search, export.",
            priority:"P1", status:"planned", sprint:6, effort:"M",
            subTasks:[
              { title:"Table audit log: timestamp, user, action, entity, IP", done:false },
              { title:"Filter: date range, user, action type, entity", done:false },
              { title:"Detail panel xem payload thay đổi (diff view)", done:false },
              { title:"Export CSV cho compliance report", done:false },
            ],
            uiComponents:["AuditLogTable","DiffViewer","ExportCSVButton"],
            businessRules:["Audit log immutable — không ai được xóa","Retention 5 năm theo quy định nhà nước","Log phải ghi đủ: who, what, when, where (IP)"],
            acceptanceCriteria:["Mọi thao tác quan trọng đều có log","Filter + export hoạt động chính xác"],
            legalRef:"NĐ 13/2023 Điều 8 — Lưu trữ & Bảo vệ dữ liệu",
          },
        ],
      },
      {
        id:"a-danhHieu", title:"Config Danh hiệu & Thẩm quyền", icon:Award, sprint:"Sprint 4",
        description:"CRUD danh hiệu, điều kiện xét tặng, thẩm quyền ký, chu kỳ theo NĐ 98.",
        features:[
          {
            id:"a-dh1", title:"CRUD danh hiệu thi đua & khen thưởng", description:"Quản lý toàn bộ danh mục: Huân chương (5 loại × 3 hạng), Bằng khen, CSTĐ, Giấy khen... theo NĐ 152/2025/NĐ-CP.",
            priority:"P0", status:"planned", sprint:4, effort:"L",
            subTasks:[
              { title:"DataTable danh hiệu với sort/filter", done:false },
              { title:"Modal CRUD: tên, mã danh hiệu, loại, cấp xét tặng", done:false },
              { title:"Nhập điều kiện xét tặng (dynamic form, nhiều tiêu chí)", done:false },
              { title:"Kích hoạt/vô hiệu hóa danh hiệu (không xóa cứng)", done:false },
            ],
            uiComponents:["AwardCatalogTable","AwardModal","CriteriaBuilder"],
            businessRules:["Mã danh hiệu unique, không thay đổi sau tạo","Không xóa danh hiệu đã có hồ sơ/QĐ liên quan","Điều kiện xét tặng version-controlled (thay đổi → version mới)"],
            acceptanceCriteria:["CRUD đầy đủ 45 danh hiệu NĐ 152/2025/NĐ-CP","Điều kiện change log hiển thị đúng version"],
            legalRef:"NĐ 152/2025/NĐ-CP Điều 11–61 — Các hình thức khen thưởng",
          },
          {
            id:"a-dh2", title:"Mapping thẩm quyền ký theo cấp", description:"Cấu hình ai được ký QĐ danh hiệu nào: Tỉnh ủy ký HCL, UBND Tỉnh ký Bằng khen tỉnh, BNV trình Chính phủ.",
            priority:"P0", status:"planned", sprint:4, effort:"M",
            subTasks:[
              { title:"Matrix thẩm quyền: hàng = danh hiệu, cột = cấp ký", done:false },
              { title:"Gán user (Leader role) vào vị trí thẩm quyền", done:false },
              { title:"Validate khi ký: kiểm tra user có thẩm quyền không", done:false },
              { title:"Cảnh báo nếu danh hiệu không có ai được phân công thẩm quyền", done:false },
            ],
            uiComponents:["AuthorityMatrix","UserAssignmentCell","AuthorityWarningBanner"],
            businessRules:["1 vị trí thẩm quyền có thể có nhiều người (ký thay)","Thay đổi thẩm quyền có hiệu lực ngay lập tức","Audit log mọi thay đổi thẩm quyền"],
            acceptanceCriteria:["Matrix hiển thị đúng 45 danh hiệu × N cấp ký","Validate ký đúng: reject nếu không có thẩm quyền"],
            legalRef:"QĐ 34/2021 + NĐ 152/2025/NĐ-CP — Phân cấp thẩm quyền",
          },
          {
            id:"a-dh3", title:"Chu kỳ & hạn mức tỷ lệ xét tặng", description:"Cấu hình chu kỳ xét tặng (hàng năm/5 năm) và hạn mức tỷ lệ % theo NĐ 98 (CSTĐ ≤ 20%, Nhân dân ≤ 1%).",
            priority:"P0", status:"planned", sprint:4, effort:"M",
            subTasks:[
              { title:"Form chu kỳ: hàng năm / 5 năm / 10 năm / đặc biệt", done:false },
              { title:"Form hạn mức %: per đơn vị/cấp xét tặng", done:false },
              { title:"Cảnh báo khi số lượng đề nghị vượt hạn mức", done:false },
              { title:"Báo cáo tổng hợp: đã cấp / còn lại theo danh hiệu/năm", done:false },
            ],
            uiComponents:["CycleCriteriaForm","QuotaForm","QuotaWarningAlert","QuotaReport"],
            businessRules:["Vượt hạn mức → warning, không block (HĐ quyết định)","Hạn mức tính trên tổng biên chế đơn vị"],
            acceptanceCriteria:["Cảnh báo đúng khi vượt hạn mức","Báo cáo tổng hợp khớp số liệu DB"],
            legalRef:"NĐ 152/2025/NĐ-CP Điều 8 — Tỷ lệ & Hạn mức",
          },
        ],
      },
      {
        id:"a-system", title:"Giám sát & Vận hành Hệ thống", icon:Server, sprint:"Sprint 5–6",
        description:"Monitoring dashboard, error logs, backup/restore, SLA config.",
        features:[
          {
            id:"a-s1", title:"System monitoring dashboard", description:"Uptime, response time, error rate, active sessions, queue length — realtime với charts 24h.",
            priority:"P1", status:"planned", sprint:6, effort:"L",
            subTasks:[
              { title:"Uptime widget (99.9% target) với downtime incidents list", done:false },
              { title:"Response time chart (p50/p90/p99) 24h rolling", done:false },
              { title:"Active session count + peak", done:false },
              { title:"Queue depth: signing queue, notification queue", done:false },
            ],
            uiComponents:["UptimeWidget","ResponseTimeChart","SessionCounter","QueueDepthGauge"],
            businessRules:["Alert nếu uptime < 99% trong 7 ngày","Response time p99 > 3s → alert"],
            acceptanceCriteria:["Dashboard refresh mỗi 30s","Alert fires đúng threshold"],
          },
          {
            id:"a-s2", title:"Backup & Restore dữ liệu", description:"Schedule backup tự động hàng ngày, manual trigger, restore từ snapshot với preview dữ liệu trước khi apply.",
            priority:"P1", status:"planned", sprint:6, effort:"L",
            subTasks:[
              { title:"Schedule cấu hình: daily 2AM, retain 30 snapshots", done:false },
              { title:"Manual backup trigger với tag ghi chú", done:false },
              { title:"Restore wizard: chọn snapshot → preview → xác nhận → apply", done:false },
              { title:"Encrypt backup at rest (AES-256)", done:false },
            ],
            uiComponents:["BackupScheduleForm","BackupList","RestoreWizard","EncryptionStatusBadge"],
            businessRules:["Restore yêu cầu xác nhận 2 Admin (4-eyes principle)","Backup stored tối thiểu 2 location","Không backup PII không cần thiết"],
            acceptanceCriteria:["Schedule backup chạy đúng giờ","Restore thành công từ snapshot","Encryption verify pass"],
          },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function pct(a:number,b:number){ return b===0?0:Math.round(a/b*100) }

function moduleStats(mod: Module) {
  const total = mod.features.length;
  const done  = mod.features.filter(f=>f.status==="done").length;
  const p0    = mod.features.filter(f=>f.priority==="P0" && f.status!=="done").length;
  return { total, done, p0 };
}

function roleStats(spec: RoleSpec) {
  const allF = spec.modules.flatMap(m=>m.features);
  return {
    total: allF.length,
    done:  allF.filter(f=>f.status==="done").length,
    p0:    allF.filter(f=>f.priority==="P0"&&f.status!=="done").length,
  };
}

/* ═══════════════════════════════════════════════════════════════
   MINI COMPONENTS
═══════════════════════════════════════════════════════════════ */
function PriorityPill({ p }:{ p:Priority }) {
  const c = PRIORITY_CFG[p];
  return (
    <span className="text-[13px] px-1.5 py-0.5 rounded border"
      style={{ background:c.bg,color:c.color,borderColor:c.border,fontFamily: "var(--font-sans)",fontWeight:700,letterSpacing:"0.05em" }}>
      {p}
    </span>
  );
}

function StatusPill({ s }:{ s:Status }) {
  const c = STATUS_CFG[s]; const Icon=c.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[13px] px-2 py-0.5 rounded-full"
      style={{ background:c.bg,color:c.color,fontFamily: "var(--font-sans)" }}>
      <Icon className="size-3"/>{c.label}
    </span>
  );
}

function EffortChip({ e }:{ e:Effort }) {
  const m = EFFORT_MAP[e];
  return (
    <span className="inline-flex items-center gap-1 text-[13px] px-2 py-0.5 rounded"
      style={{ background:"#f4f7fb",color:"#5a5040",fontFamily:"JetBrains Mono, monospace" }}
      title={m.days}>
      {[1,2,3,4].map(i=>(
        <span key={i} className="inline-block size-1.5 rounded-full"
          style={{ background:i<=m.dots?"#0b1426":"#e2e8f0" }}/>
      ))}
      <span>{m.days}</span>
    </span>
  );
}

function SprintChip({ n }:{ n:number }) {
  const clr = n<=2?"#166534":n<=4?"#92400e":"#1C5FBE";
  const bg  = n<=2?"#dcfce7":n<=4?"#fef3c7":"#ddeafc";
  return (
    <span className="text-[13px] px-1.5 py-0.5 rounded"
      style={{ background:bg,color:clr,fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>
      S{n}
    </span>
  );
}

function ProgressRing({ pct: p, size=44, stroke=3, color }:{pct:number;size?:number;stroke?:number;color:string}) {
  const r = (size-stroke*2)/2;
  const circ = 2*Math.PI*r;
  const offset = circ*(1-p/100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} stroke="rgba(255,255,255,0.12)"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} stroke={color}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.6s ease" }}/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURE CARD
═══════════════════════════════════════════════════════════════ */
type TabKey = "tasks"|"tech"|"criteria"|"legal";

const TABS: { key:TabKey; label:string; icon:typeof ListChecks }[] = [
  { key:"tasks",    label:"Danh sách việc",  icon:ListChecks   },
  { key:"tech",     label:"Kỹ thuật",        icon:Code2        },
  { key:"criteria", label:"Nghiệm thu",      icon:TestTube2    },
  { key:"legal",    label:"Pháp lý / Ghi chú", icon:BookOpen  },
];

function FeatureCard({ feature, defaultOpen=false, roleColor }:{
  feature:Feature; defaultOpen?:boolean; roleColor:string;
}) {
  const [open, setOpen]     = useState(defaultOpen);
  const [tab, setTab]       = useState<TabKey>("tasks");
  const isP0  = feature.priority==="P0";
  const isDone= feature.status==="done";
  const doneSubs = feature.subTasks.filter(t=>t.done).length;

  return (
    <div className="rounded-[10px] border transition-all duration-200"
      style={{
        background: isDone?"#fafaf8":"white",
        borderColor: isP0&&!isDone?"#fca5a5":"#e2e8f0",
        borderLeft: `3px solid ${isP0&&!isDone?"#dc2626":isDone?"#86efac":"#e2e8f0"}`,
        opacity: isDone ? 0.82 : 1,
      }}>

      {/* ── Card header ── */}
      <button className="w-full px-4 py-3.5 flex items-start gap-3 text-left" onClick={()=>setOpen(v=>!v)}>
        {/* Status icon */}
        <div className="mt-0.5 shrink-0">
          {feature.status==="done"    && <CheckCircle2 className="size-[18px]" style={{ color:"#166534" }}/>}
          {feature.status==="in_progress" && <Clock   className="size-[18px]" style={{ color:"#b45309" }}/>}
          {feature.status==="planned" && <Circle      className="size-[18px]" style={{ color:"#4f5d6e" }}/>}
          {feature.status==="blocked" && <AlertTriangle className="size-[18px]" style={{ color:"#dc2626" }}/>}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + chips */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[13px]"
              style={{ fontFamily: "var(--font-sans)",fontWeight:600,
                color:isDone?"#635647":"#0b1426",
                textDecoration:isDone?"line-through":"none" }}>
              {feature.title}
            </span>
            <PriorityPill p={feature.priority}/>
            <StatusPill s={feature.status}/>
          </div>
          {/* Description (collapsed) */}
          {!open && (
            <p className="text-[13px] text-slate-700 leading-snug line-clamp-1">
              {feature.description}
            </p>
          )}
          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <SprintChip n={feature.sprint}/>
            <EffortChip e={feature.effort}/>
            {/* Sub-task progress */}
            <span className="text-[13px] text-slate-700 flex items-center gap-1">
              <ListChecks className="size-3"/>
              {doneSubs}/{feature.subTasks.length} việc
            </span>
            {feature.legalRef && (
              <span className="inline-flex items-center gap-1 text-[13px] px-1.5 py-0.5 rounded"
                style={{ background:"#fdf3d9",color:"#7d5a10",fontFamily: "var(--font-sans)" }}>
                <Shield className="size-2.5"/>
                {feature.legalRef}
              </span>
            )}
          </div>
        </div>

        {/* Expand icon */}
        <div className="shrink-0 mt-0.5">
          {open ? <ChevronUp className="size-4 text-slate-700"/> : <ChevronDown className="size-4 text-slate-700"/>}
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {open && (
        <div className="border-t border-[#f0ece5]">
          {/* Full description */}
          <div className="px-4 py-3" style={{ background:"#ffffff" }}>
            <p className="text-[13px] text-slate-700 leading-relaxed">{feature.description}</p>
          </div>

          {/* Tab bar */}
          <div className="flex items-center border-b border-[#e2e8f0] px-4 gap-1 pt-2">
            {TABS.map(t=>{
              const Icon=t.icon;
              const active=tab===t.key;
              // Hide tab if no content
              const hasContent =
                (t.key==="tasks"    && feature.subTasks.length>0)||
                (t.key==="tech"     && (feature.uiComponents||feature.businessRules||feature.apiNote))||
                (t.key==="criteria" && feature.acceptanceCriteria)||
                (t.key==="legal"    && (feature.legalRef||feature.note));
              if(!hasContent) return null;
              return (
                <button key={t.key}
                  onClick={()=>setTab(t.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] border-b-2 transition-all"
                  style={{
                    borderColor: active ? roleColor : "transparent",
                    color: active ? roleColor : "#635647",
                    fontFamily: "var(--font-sans)",
                    fontWeight: active ? 700 : 400,
                    marginBottom: -1,
                  }}>
                  <Icon className="size-3.5"/>
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="px-4 py-3">
            {/* Tasks */}
            {tab==="tasks" && (
              <div className="space-y-1.5">
                {feature.subTasks.map((st,i)=>(
                  <div key={i} className="flex items-start gap-2">
                    {st.done
                      ? <CheckSquare className="size-4 shrink-0 mt-0.5" style={{ color:"#166534" }}/>
                      : <Square      className="size-4 shrink-0 mt-0.5" style={{ color:"#d1d5db" }}/>}
                    <span className="text-[13px] leading-snug"
                      style={{ fontFamily: "var(--font-sans)",
                        color:st.done?"#635647":"#0b1426",
                        textDecoration:st.done?"line-through":"none" }}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tech */}
            {tab==="tech" && (
              <div className="space-y-3">
                {feature.uiComponents && feature.uiComponents.length>0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Layers className="size-3.5" style={{ color:roleColor }}/>
                      <span className="text-[13px] uppercase tracking-wider" style={{ color:roleColor,fontFamily: "var(--font-sans)",fontWeight:700 }}>
                        UI Components
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {feature.uiComponents.map(c=>(
                        <code key={c} className="text-[13px] px-2 py-0.5 rounded"
                          style={{ background:"#f4f7fb",color:"#5a5040",fontFamily:"JetBrains Mono, monospace" }}>
                          {c}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
                {feature.businessRules && feature.businessRules.length>0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Database className="size-3.5" style={{ color:roleColor }}/>
                      <span className="text-[13px] uppercase tracking-wider" style={{ color:roleColor,fontFamily: "var(--font-sans)",fontWeight:700 }}>
                        Business Rules
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {feature.businessRules.map((r,i)=>(
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#b45309] mt-0.5 shrink-0">▸</span>
                          <span className="text-[13px] text-slate-700 leading-snug">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {feature.apiNote && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Server className="size-3.5" style={{ color:roleColor }}/>
                      <span className="text-[13px] uppercase tracking-wider" style={{ color:roleColor,fontFamily: "var(--font-sans)",fontWeight:700 }}>
                        API / Note
                      </span>
                    </div>
                    <code className="block text-[13px] p-2 rounded bg-[#0b1426] text-[#93c5fd] leading-relaxed"
                      style={{ fontFamily:"JetBrains Mono, monospace" }}>
                      {feature.apiNote}
                    </code>
                  </div>
                )}
              </div>
            )}

            {/* Criteria */}
            {tab==="criteria" && feature.acceptanceCriteria && (
              <ul className="space-y-1.5">
                {feature.acceptanceCriteria.map((c,i)=>(
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#166534] shrink-0 mt-0.5">✓</span>
                    <span className="text-[13px] text-slate-900 leading-snug">{c}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Legal */}
            {tab==="legal" && (
              <div className="space-y-2">
                {feature.legalRef && (
                  <div className="flex items-start gap-2 p-2.5 rounded-[6px]"
                    style={{ background:"#fdf3d9",border:"1px solid #f0dba0" }}>
                    <Shield className="size-4 shrink-0 mt-0.5" style={{ color:"#7d5a10" }}/>
                    <div>
                      <p className="text-[13px] uppercase tracking-wider mb-0.5"
                        style={{ color:"#7d5a10",fontFamily: "var(--font-sans)",fontWeight:700 }}>
                        Căn cứ pháp lý
                      </p>
                      <p className="text-[13px] text-[#7d4a00]">{feature.legalRef}</p>
                    </div>
                  </div>
                )}
                {feature.note && (
                  <div className="flex items-start gap-2 p-2.5 rounded-[6px]"
                    style={{ background:"#ddeafc",border:"1px solid #93c5fd" }}>
                    <GitBranch className="size-4 shrink-0 mt-0.5" style={{ color:"#1C5FBE" }}/>
                    <p className="text-[13px] text-[#1a3a6e]">{feature.note}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEFT PANEL — Role Selector
═══════════════════════════════════════════════════════════════ */
function LeftPanel({ selected, onSelect }:{ selected:RoleId; onSelect:(r:RoleId)=>void }) {
  return (
    <aside className="w-[240px] shrink-0 border-r border-[#e2e8f0] flex flex-col overflow-y-auto"
      style={{ background:"#f4f7fb" }}>

      <div className="px-4 pt-5 pb-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2 mb-0.5">
          <Layers className="size-4" style={{ color:"#c8102e" }}/>
          <span className="text-[13px] uppercase tracking-widest text-slate-700">
            VPTU Đồng Nai
          </span>
        </div>
        <h2 className="text-[14px] text-slate-900"
          style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>
          Lộ trình triển khai
        </h2>
        <p className="text-[13px] text-slate-700 mt-0.5">Chi tiết theo vai trò · v1.0</p>
      </div>

      <div className="p-3 space-y-2">
        {(["user","manager","council","leader","admin"] as RoleId[]).map(role=>{
          const m    = ROLE_META[role];
          const spec = ROLE_SPECS.find(r=>r.role===role)!;
          const st   = roleStats(spec);
          const Icon = m.icon;
          const active = selected===role;
          const p = pct(st.done,st.total);

          return (
            <button key={role}
              onClick={()=>onSelect(role)}
              className="w-full rounded-[10px] p-3 border text-left transition-all"
              style={{
                background: active ? m.bg : "white",
                borderColor: active ? m.border : "#e2e8f0",
                boxShadow: active ? `0 0 0 2px ${m.border}55` : "none",
              }}>

              <div className="flex items-center gap-2.5 mb-2">
                {/* Progress ring */}
                <div className="relative shrink-0">
                  <ProgressRing pct={p} size={38} stroke={3} color={m.color}/>
                  <div className="absolute inset-0 grid place-items-center">
                    <Icon className="size-4" style={{ color:m.color }}/>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[13px]" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:m.color }}>
                    {m.label}
                  </div>
                  <div className="text-[13px] text-slate-700 truncate">{m.labelVi}</div>
                </div>

                {/* P0 gap badge */}
                {st.p0>0 && (
                  <span className="shrink-0 size-5 rounded-full bg-[#dc2626] text-white text-[13px] grid place-items-center">
                    {st.p0}
                  </span>
                )}
              </div>

              {/* Mini progress bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background:`${m.color}22` }}>
                  <div className="h-full rounded-full transition-all" style={{ width:`${p}%`,background:m.color }}/>
                </div>
                <span className="text-[13px] shrink-0"
                  style={{ color:m.color,fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>
                  {p}%
                </span>
              </div>
              <div className="text-[13px] text-slate-700 mt-0.5">
                {st.done}/{st.total} features
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-auto p-4 border-t border-[#e2e8f0] space-y-1.5">
        {(["P0","P1","P2"] as Priority[]).map(p=>{
          const c=PRIORITY_CFG[p];
          return (
            <div key={p} className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ background:c.border }}/>
              <span className="text-[13px] text-slate-700"><strong>{p}</strong> {c.label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function KeHoachTrienKhaiPage({ user }: { user: LoginUser }) {
  const [selectedRole, setSelectedRole] = useState<RoleId>("user");
  const [selectedMod,  setSelectedMod ] = useState<string|null>(null);

  const spec      = ROLE_SPECS.find(r=>r.role===selectedRole)!;
  const meta      = ROLE_META[selectedRole];
  const RoleIcon  = meta.icon;
  const st        = roleStats(spec);
  const currentMod= selectedMod
    ? spec.modules.find(m=>m.id===selectedMod) ?? spec.modules[0]
    : spec.modules[0];

  // Reset module when role changes
  const handleRoleSelect = (role: RoleId) => {
    setSelectedRole(role);
    setSelectedMod(null);
  };

  const mStat = moduleStats(currentMod);

  return (
    <div className="h-full flex overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── Left panel ── */}
      <LeftPanel selected={selectedRole} onSelect={handleRoleSelect}/>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Role header banner */}
        <div className="shrink-0 px-6 py-4 border-b border-[#e2e8f0]"
          style={{ background:`linear-gradient(to right, ${meta.bg}, white)` }}>
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl flex items-center justify-center"
              style={{ background:`linear-gradient(135deg,${meta.color},${meta.color}bb)` }}>
              <RoleIcon className="size-6 text-white"/>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-[18px]" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:meta.color }}>
                  {meta.labelVi}
                </h2>
                <span className="text-[13px] px-2 py-0.5 rounded border"
                  style={{ background:"white",borderColor:meta.border,color:meta.color,fontFamily: "var(--font-sans)",fontWeight:700 }}>
                  {meta.label}
                </span>
              </div>
              <p className="text-[13px] text-slate-700">{meta.desc}</p>
            </div>
            {/* Role stats */}
            <div className="flex items-center gap-5 shrink-0">
              {[
                { v:st.total, label:"Features",    color:"#0b1426" },
                { v:st.done,  label:"Hoàn thành",  color:"#166534" },
                { v:st.total-st.done, label:"Còn lại", color:"#b45309" },
                { v:st.p0,    label:"P0 Gap",       color:"#dc2626" },
              ].map(({ v,label,color })=>(
                <div key={label} className="text-center">
                  <div className="text-[18px] leading-none"
                    style={{ fontFamily: "var(--font-sans)",fontWeight:700,color }}>{v}</div>
                  <div className="text-[13px] mt-0.5 text-slate-700">{label}</div>
                </div>
              ))}
              {/* Overall progress */}
              <div className="relative">
                <ProgressRing pct={pct(st.done,st.total)} size={52} stroke={4} color={meta.color}/>
                <div className="absolute inset-0 grid place-items-center">
                  <span className="text-[13px]" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700,color:meta.color }}>
                    {pct(st.done,st.total)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module tabs */}
        <div className="shrink-0 border-b border-[#e2e8f0] px-6 flex items-end gap-1 overflow-x-auto"
          style={{ background:"rgba(255,255,255,0.95)" }}>
          {spec.modules.map(mod=>{
            const Icon = mod.icon;
            const ms   = moduleStats(mod);
            const active = currentMod.id===mod.id;
            return (
              <button key={mod.id}
                onClick={()=>setSelectedMod(mod.id)}
                className="shrink-0 flex items-center gap-2 px-4 py-3 border-b-2 text-[13px] transition-all"
                style={{
                  borderColor: active ? meta.color : "transparent",
                  color: active ? meta.color : "#635647",
                  fontFamily: "var(--font-sans)",
                  fontWeight: active ? 700 : 400,
                }}>
                <Icon className="size-3.5"/>
                <span>{mod.title}</span>
                {/* Sprint chip */}
                <span className="text-[13px] px-1.5 py-0.5 rounded"
                  style={{ background:active?meta.bg:"#f4f7fb",color:active?meta.color:"#635647" }}>
                  {mod.sprint}
                </span>
                {/* P0 warning */}
                {ms.p0>0 && (
                  <span className="size-4 rounded-full bg-[#dc2626] text-white text-[13px] grid place-items-center">
                    {ms.p0}
                  </span>
                )}
                {/* Done all checkmark */}
                {ms.done===ms.total && ms.total>0 && (
                  <CheckCircle2 className="size-3.5" style={{ color:"#166534" }}/>
                )}
              </button>
            );
          })}
        </div>

        {/* Module body */}
        <div className="flex-1 overflow-y-auto">
          {/* Module header */}
          <div className="px-6 py-4 border-b border-[#e2e8f0]"
            style={{ background:"#f4f7fb" }}>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg flex items-center justify-center"
                style={{ background:`${meta.color}15` }}>
                {(() => { const MI = currentMod.icon; return <MI className="size-5" style={{ color:meta.color }}/>; })()}
              </div>
              <div className="flex-1">
                <h3 className="text-[14px]"
                  style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:"#0b1426" }}>
                  {currentMod.title}
                </h3>
                <p className="text-[13px] text-slate-700 mt-0.5">{currentMod.description}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[13px] px-3 py-1 rounded-full"
                  style={{ background:meta.bg,color:meta.color,border:`1px solid ${meta.border}`,fontFamily: "var(--font-sans)" }}>
                  {currentMod.sprint}
                </span>
                {/* Module progress */}
                <div className="text-right">
                  <div className="text-[14px] leading-none"
                    style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:meta.color }}>
                    {pct(mStat.done,mStat.total)}<span className="text-[13px]">%</span>
                  </div>
                  <div className="h-1 w-16 rounded-full overflow-hidden mt-1" style={{ background:`${meta.color}25` }}>
                    <div className="h-full rounded-full" style={{ width:`${pct(mStat.done,mStat.total)}%`,background:meta.color }}/>
                  </div>
                  <div className="text-[13px] mt-0.5 text-slate-700">
                    {mStat.done}/{mStat.total} done
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature cards */}
          <div className="px-6 py-5 space-y-3">
            {currentMod.features.map(f=>(
              <FeatureCard key={f.id} feature={f} roleColor={meta.color}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
