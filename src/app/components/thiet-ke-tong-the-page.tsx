import { useState, useEffect, useRef } from "react";
import {
  Trophy, Award, Megaphone, ClipboardList, Gavel,
  FileSignature, ScrollText, BarChart3, LayoutDashboard,
  Crown, Users, User, Settings, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Circle, AlertTriangle, Clock,
  Shield, Database, Code2, Layers, Palette, GitBranch,
  BookOpen, ArrowRight, Info, Sparkles, Zap, Server,
  Lock, FileText, Bell, Upload, Eye, Edit3, Trash2,
  Building2, Download, RefreshCw, Plus, Minus, Check,
  Play, Loader2, AlertCircle, ChevronUp, RotateCcw,
  Globe, Cpu, HardDrive, Activity, BarChart2, Target,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type RoleId = LoginUser["role"];
interface Screen { code:string; title:string; desc:string; roles:RoleId[]; actions:string[]; uxNotes?:string[] }
interface WFState { id:string; label:string; color:string; desc:string }
interface DataField { name:string; type:string; req:boolean; note:string }
interface PermRow { action:string; user:"✓"|"○"|"✗"; manager:"✓"|"○"|"✗"; council:"✓"|"○"|"✗"; leader:"✓"|"○"|"✗"; admin:"✓"|"○"|"✗" }
interface ModuleSpec { id:string; title:string; icon:typeof Trophy; color:string; bg:string; border:string; desc:string; screens:Screen[]; workflow:WFState[]; fields:DataField[]; perms:PermRow[] }

/* ═══════════════════════════════════════════════════════════════
   MODULE DATA — 8 × 9 screens = 72 screens total
═══════════════════════════════════════════════════════════════ */
const MODULES: ModuleSpec[] = [
  {
    id:"phong-trao", title:"Phong trào Thi đua", icon:Trophy,
    color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd",
    desc:"Quản lý toàn bộ lifecycle phong trào: khởi tạo → duyệt → mở đăng ký → triển khai → tổng kết → lưu trữ.",
    screens:[
      { code:"PTD-001", title:"Danh sách Phong trào", desc:"Grid/list các phong trào với badge trạng thái, filter 6 chiều, search nhanh, sort.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Filter: trạng thái/cấp/loại/năm/đơn vị","Search full-text theo tên","Sort: ngày tạo/hạn/số tham gia","Card/Table view toggle","Export danh sách Excel","Tạo phong trào mới (Leader/Admin)"],
        uxNotes:["Empty state khi không có kết quả filter","Skeleton loader khi fetch","Badge count mỗi trạng thái trên tab"] },
      { code:"PTD-002", title:"Chi tiết Phong trào", desc:"Full detail: nội dung, chỉ tiêu, thành phần tham gia, timeline, documents.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Xem nội dung đầy đủ","Download tài liệu phong trào","Xem danh sách đơn vị/cá nhân tham gia","Đăng ký (nếu đang mở)","Phê duyệt/Trả lại (Leader)","Kết thúc sớm (có lý do)","Chia sẻ link phong trào"],
        uxNotes:["Sticky header với status badge khi scroll","Tab: Tổng quan | Chỉ tiêu | Thành phần | Tài liệu | Lịch sử"] },
      { code:"PTD-003", title:"Tạo / Sửa Phong trào", desc:"Wizard 3 bước + auto-save draft mỗi 60s. Validation inline theo từng field.", roles:["lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Bước 1: Thông tin cơ bản + thời gian","Bước 2: Chỉ tiêu thi đua (dynamic list)","Bước 3: Đơn vị + khen thưởng dự kiến","Upload tài liệu kế hoạch","Preview trước xuất bản","Lưu nháp / Xuất bản ngay"],
        uxNotes:["Auto-save badge 'Đã lưu nháp lúc HH:MM'","Step indicator top với % hoàn thành","Prevent navigate-away khi chưa lưu (dirty form)"] },
      { code:"PTD-004", title:"Form Đăng ký Tham gia", desc:"User/Manager đăng ký kèm cam kết chỉ tiêu + upload kế hoạch hành động.", roles:["cá nhân","lãnh đạo đơn vị"],
        actions:["Chọn phong trào (nếu từ trang khác vào)","Nhập chỉ tiêu cam kết (theo template phong trào)","Upload kế hoạch hành động (PDF/DOCX)","Xem lại trước submit","Submit / Rút đăng ký (trong hạn)"],
        uxNotes:["Confirm dialog trước khi rút đăng ký","File upload progress bar"] },
      { code:"PTD-005", title:"Theo dõi Tiến độ", desc:"Dashboard tiến độ per phong trào: % hoàn thành, so sánh chỉ tiêu, trend.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","quản trị hệ thống"],
        actions:["Xem progress % theo từng chỉ tiêu","Cập nhật tiến độ hàng tháng (form)","Xem lịch sử cập nhật (audit trail)","Alert khi dưới ngưỡng","So sánh với đơn vị tương đương"] },
      { code:"PTD-006", title:"Tổng kết Phong trào", desc:"Bảng xếp hạng cuối kỳ, khen thưởng đề xuất, export báo cáo.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Xem bảng xếp hạng (có sort/filter)","Đề xuất khen thưởng từ top performers","Duyệt kết quả tổng kết","Export PDF báo cáo tổng kết","Chuyển trạng thái → Lưu trữ"] },
      { code:"PTD-007", title:"Analytics Phong trào", desc:"Biểu đồ phân tích: tỷ lệ tham gia, tiến độ theo thời gian, heat map đơn vị.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Line chart: tiến độ theo tuần/tháng","Bar chart: so sánh đơn vị","Heatmap: mức độ hoàn thành theo đơn vị","Drill-down click vào đơn vị","Export chart PNG/SVG"] },
      { code:"PTD-008", title:"Lịch sử & Archive Phong trào", desc:"Tra cứu phong trào các năm trước: kết quả, người thắng, thống kê tổng hợp.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Filter theo năm/loại/cấp","Search tên phong trào lịch sử","Xem kết quả đầy đủ (read-only)","Compare với phong trào hiện tại","Export dữ liệu lịch sử"] },
      { code:"PTD-009", title:"Cấu hình Chỉ tiêu Template", desc:"Admin cấu hình template chỉ tiêu chuẩn cho từng loại phong trào, tái sử dụng.", roles:["quản trị hệ thống"],
        actions:["CRUD template chỉ tiêu","Gán template vào loại phong trào","Preview template","Import từ Excel","Version control template"] },
    ],
    workflow:[
      { id:"draft",    label:"Nháp",        color:"#4f5d6e", desc:"Đang soạn, chưa công bố" },
      { id:"pending",  label:"Chờ duyệt",   color:"#b45309", desc:"Chờ Leader phê duyệt" },
      { id:"open",     label:"Mở ĐK",       color:"#1C5FBE", desc:"Mở đăng ký tham gia" },
      { id:"active",   label:"Đang diễn ra",color:"#166534", desc:"Đang triển khai" },
      { id:"closing",  label:"Sắp kết thúc",color:"#7c3aed", desc:"30 ngày cuối" },
      { id:"closed",   label:"Kết thúc",    color:"#0b1426", desc:"Đang tổng kết" },
      { id:"archived", label:"Lưu trữ",     color:"#635647", desc:"Read-only archive" },
    ],
    fields:[
      { name:"Tên phong trào",        type:"text",           req:true,  note:"Max 200 ký tự, unique trong năm tài chính" },
      { name:"Loại hình thi đua",     type:"select",         req:true,  note:"Cá nhân / Tập thể / Cả hai" },
      { name:"Cấp tổ chức",           type:"select",         req:true,  note:"Tỉnh / Huyện / Cơ sở" },
      { name:"Thời gian bắt đầu",     type:"date",           req:true,  note:"Không được trước ngày hiện tại + 3 ngày" },
      { name:"Thời gian kết thúc",    type:"date",           req:true,  note:"Sau ngày BĐ ≥ 30 ngày làm việc" },
      { name:"Hạn đăng ký",           type:"date",           req:true,  note:"Trước thời gian kết thúc ≥ 14 ngày" },
      { name:"Mô tả nội dung",        type:"rich-text",      req:true,  note:"Min 100 ký tự, max 5000, hỗ trợ HTML basic" },
      { name:"Chỉ tiêu thi đua",      type:"dynamic-list",   req:true,  note:"Min 1, max 10 chỉ tiêu, mỗi tiêu có value + unit" },
      { name:"Đơn vị tham gia",       type:"multi-select",   req:false, note:"Multi-select từ org tree, optional" },
      { name:"Khen thưởng dự kiến",   type:"multi-select",   req:false, note:"Link với award catalog" },
      { name:"Tài liệu kế hoạch",     type:"file-upload",    req:false, note:"PDF/DOC ≤ 10MB/file, max 5" },
      { name:"Người phụ trách",       type:"user-select",    req:true,  note:"Role Admin/Leader" },
      { name:"Năm tài chính",         type:"select",         req:true,  note:"Tự động điền năm hiện tại" },
    ],
    perms:[
      { action:"Xem danh sách",       user:"✓", manager:"✓", council:"✓", leader:"✓", admin:"✓" },
      { action:"Tạo phong trào",      user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
      { action:"Sửa phong trào",      user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
      { action:"Phê duyệt",           user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
      { action:"Đăng ký tham gia",    user:"✓", manager:"✓", council:"✗", leader:"✗", admin:"✗" },
      { action:"Cập nhật tiến độ",    user:"✓", manager:"✓", council:"✗", leader:"✗", admin:"✗" },
      { action:"Xem analytics",       user:"✗", manager:"✗", council:"✓", leader:"✓", admin:"✓" },
      { action:"Kết thúc/Lưu trữ",   user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
    ],
  },
  {
    id:"de-nghi-kt", title:"Đề nghị Khen thưởng", icon:Award,
    color:"#c8102e", bg:"#fee2e2", border:"#fca5a5",
    desc:"10 trạng thái workflow, phân quyền scope theo đơn vị, AI pre-check, bulk import, duplicate detection.",
    screens:[
      { code:"DNKT-001", title:"Danh sách Hồ sơ (Scope-aware)", desc:"Table hồ sơ theo scope role: User thấy của mình, Manager thấy đơn vị, Council thấy được phân công.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Tab filter: Tất cả | Nháp | Đang xử lý | Hoàn thành | Trả lại","Search: tên/CCCD/mã hồ sơ","Filter: đơn vị/danh hiệu/năm/người xử lý","Sort: ngày/tên/điểm/trạng thái","Batch select → export/submit/delete","Tạo hồ sơ mới"] },
      { code:"DNKT-002", title:"Chi tiết Hồ sơ (Multi-tab)", desc:"6 tabs: Thông tin | Thành tích | Minh chứng | Thẩm định | LYK | Lịch sử. Actions theo role+state.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Tab Thông tin: thông tin cơ bản, chỉnh sửa (nếu draft)","Tab Thành tích: rich text 5 năm","Tab Minh chứng: gallery + download","Tab Thẩm định: điểm + nhận xét HĐ","Tab LYK: kết quả lấy ý kiến","Tab Lịch sử: audit trail đầy đủ"],
        uxNotes:["Sticky action bar bottom: Nộp / Xác nhận / Duyệt / Ký (context-aware)","Toast khi mỗi action thành công","Confirm dialog trước action không thể hoàn tác"] },
      { code:"DNKT-003", title:"Wizard Tạo Hồ sơ (4 bước)", desc:"Step wizard với auto-save, progress %, validation inline, pre-check AI trước submit.", roles:["cá nhân","lãnh đạo đơn vị"],
        actions:["Step 1: Chọn danh hiệu + TT cơ bản (tên, CCCD, chức vụ, đơn vị)","Step 2: Thành tích 5 năm (rich text + số liệu)","Step 3: Upload minh chứng (multi-file, drag-drop)","Step 4: AI pre-check + xem lại toàn bộ","Submit hoặc Lưu nháp","Previous/Next với validation"],
        uxNotes:["Auto-save mỗi 60s với badge timestamp","Prevent leave khi dirty form (beforeunload)","Progress ring với step label"] },
      { code:"DNKT-004", title:"AI Pre-check Điều kiện", desc:"Engine kiểm tra 8 điều kiện bắt buộc theo NĐ 98, hiển thị checklist pass/warn/fail với giải thích.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng"],
        actions:["Run auto-check → checklist kết quả","Click từng item → xem giải thích chi tiết + link điều khoản","Accept warning → submit với ghi chú","Fix lỗi → run lại check","Override admin (nếu có quyền)"] },
      { code:"DNKT-005", title:"Form Thẩm định (Council)", desc:"Scoring 5 tiêu chí, COI declaration, legal check results, ghi nhận xét, ký tắt.", roles:["hội đồng"],
        actions:["Scoring 5 tiêu chí (0–20 mỗi tiêu chí, realtime total)","COI auto-check + self-declaration nếu có","Xem kết quả legal check auto","Viết nhận xét chi tiết (rich text)","Submit thẩm định / Yêu cầu bổ sung","Ký tắt điện tử (timestamp + IP)"] },
      { code:"DNKT-006", title:"Yêu cầu & Bổ sung Hồ sơ", desc:"Thread comment per hồ sơ, upload bổ sung, deadline bổ sung, notification 2 chiều.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","quản trị hệ thống"],
        actions:["Council: ghi yêu cầu bổ sung + chọn deadline","User/Manager: đọc yêu cầu, upload bổ sung","Thread comments với @mention","Mark 'đã bổ sung xong'","Extend deadline (Council)","Archive thread"] },
      { code:"DNKT-007", title:"Bulk Import Hồ sơ (Excel)", desc:"Upload Excel template → parse → validate → preview → commit batch creation. Dùng cho cuối năm.", roles:["lãnh đạo đơn vị","quản trị hệ thống"],
        actions:["Download template Excel chuẩn","Upload file Excel","Parse + validate → show errors table","Preview danh sách sẽ tạo","Commit import (success/fail per row)","Export báo cáo import"] },
      { code:"DNKT-008", title:"Duplicate Detection", desc:"AI phát hiện hồ sơ trùng lặp: cùng người, cùng danh hiệu, cùng kỳ. Flag để xem xét.", roles:["hội đồng","quản trị hệ thống"],
        actions:["Xem danh sách hồ sơ flagged as duplicate","So sánh side-by-side 2 hồ sơ","Quyết định: merge/giữ 1/giữ cả 2","Ghi chú quyết định","Audit log decision"] },
      { code:"DNKT-009", title:"Audit Trail & Lịch sử Chi tiết", desc:"Timeline đầy đủ: ai/làm gì/khi nào/từ IP nào. Diff view giá trị cũ → mới.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Timeline chronological view","Filter: action type/user/date","Click event → xem diff payload","Export CSV audit log","Verify chữ ký từng timestamp"] },
    ],
    workflow:[
      { id:"draft",            label:"Nháp",              color:"#4f5d6e", desc:"User đang soạn thảo" },
      { id:"submitted",        label:"Đã nộp",            color:"#1C5FBE", desc:"Nộp, chờ đơn vị xác nhận" },
      { id:"unit_confirmed",   label:"ĐV Xác nhận",       color:"#0891b2", desc:"Manager đã xác nhận" },
      { id:"council_assigned", label:"HĐ Nhận",           color:"#7c3aed", desc:"Phân công thành viên" },
      { id:"under_review",     label:"Đang thẩm định",    color:"#b45309", desc:"Chấm điểm, kiểm tra" },
      { id:"pending_vote",     label:"Chờ bỏ phiếu",      color:"#7c3aed", desc:"Vào agenda phiên họp" },
      { id:"council_approved", label:"HĐ Thông qua",      color:"#166534", desc:"Đã bỏ phiếu thông qua" },
      { id:"pending_sign",     label:"Chờ ký số",         color:"#c8102e", desc:"Đến inbox Leader" },
      { id:"signed",           label:"Đã ký",             color:"#166534", desc:"Ký CA hợp lệ" },
      { id:"published",        label:"Phát hành",         color:"#0b1426", desc:"QĐ ban hành chính thức" },
    ],
    fields:[
      { name:"Mã hồ sơ",                type:"auto-generated", req:true,  note:"HS-YYYY-XXXXX, tự động sinh" },
      { name:"Người được đề nghị",       type:"user-ref",       req:true,  note:"Autocomplete từ HR database" },
      { name:"Danh hiệu đề nghị",        type:"award-select",   req:true,  note:"Từ danh mục Admin cấu hình, filter theo eligibility" },
      { name:"Năm xét tặng",             type:"number",         req:true,  note:"Năm hiện tại hoặc +1" },
      { name:"Đơn vị đề nghị",           type:"org-select",     req:true,  note:"Scope theo Manager" },
      { name:"Thành tích 5 năm",         type:"rich-text",      req:true,  note:"Min 200 ký tự, có số liệu cụ thể" },
      { name:"Số năm CSTĐ liên tục",     type:"number",         req:true,  note:"Validate với điều kiện danh hiệu" },
      { name:"Không vi phạm kỷ luật",    type:"boolean",        req:true,  note:"Xác nhận checkbox bắt buộc" },
      { name:"Minh chứng thành tích",    type:"file-upload",    req:true,  note:"PDF/JPG/PNG ≤ 10MB, min 1 file" },
      { name:"Bằng khen trước đây",      type:"file-upload",    req:false, note:"Scan QĐ cũ, optional" },
      { name:"Xác nhận của đơn vị",      type:"e-signature",    req:true,  note:"Manager ký điện tử" },
      { name:"Ghi chú hồ sơ",            type:"textarea",       req:false, note:"Max 500 ký tự" },
    ],
    perms:[
      { action:"Tạo hồ sơ",            user:"✓", manager:"✓", council:"✗", leader:"✗", admin:"✓" },
      { action:"Xem (scope)",           user:"○", manager:"○", council:"✓", leader:"✓", admin:"✓" },
      { action:"Sửa (draft only)",      user:"✓", manager:"✓", council:"✗", leader:"✗", admin:"✓" },
      { action:"Submit hồ sơ",          user:"✓", manager:"✓", council:"✗", leader:"✗", admin:"✗" },
      { action:"Xác nhận đơn vị",       user:"✗", manager:"✓", council:"✗", leader:"✗", admin:"✗" },
      { action:"Thẩm định",             user:"✗", manager:"✗", council:"✓", leader:"✗", admin:"✗" },
      { action:"Phê duyệt / Từ chối",   user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
      { action:"Ký số",                 user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✗" },
      { action:"Bulk import",           user:"✗", manager:"✓", council:"✗", leader:"✗", admin:"✓" },
    ],
  },
  {
    id:"lay-y-kien", title:"Lấy ý kiến Công khai", icon:Megaphone,
    color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd",
    desc:"Tổ chức lấy ý kiến đúng TT 15/2025 Điều 15: tối thiểu 5 ngày, tổng hợp, xử lý phản đối, public portal.",
    screens:[
      { code:"LYK-001", title:"Danh sách Đợt LYK", desc:"Table các đợt lấy ý kiến với trạng thái, tiến độ thu thập, filter.", roles:["lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Filter: trạng thái/đợt xét/phong trào","Tạo đợt mới (Manager/Admin)","Xem tiến độ % thu thập ý kiến","Click vào đợt → chi tiết"] },
      { code:"LYK-002", title:"Chi tiết Đợt LYK", desc:"Thông tin đợt, hồ sơ trong đợt, đối tượng lấy ý kiến, tiến độ realtime.", roles:["lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Xem progress bar tổng hợp","Danh sách người đã/chưa phản hồi","Nhắc nhở người chưa phản hồi","Đóng đợt sớm (có lý do)","Xem kết quả tổng hợp"] },
      { code:"LYK-003", title:"Form Gửi ý kiến (User)", desc:"Form đơn giản: 3 lựa chọn, nội dung optional, 1 lần submit per người per hồ sơ.", roles:["cá nhân","lãnh đạo đơn vị"],
        actions:["Chọn: Tán thành / Phản đối / Không ý kiến","Nhập nội dung ý kiến (optional, max 500 ký tự)","Upload bằng chứng (optional)","Submit (1 lần, không sửa được)","Xem đã gửi (read-only)"],
        uxNotes:["Confirm dialog: 'Ý kiến sẽ không thể thay đổi sau khi gửi'","Timer countdown đến hạn đóng đợt"] },
      { code:"LYK-004", title:"Tổng hợp & Phân tích Kết quả", desc:"Dashboard: donut chart tỷ lệ, word cloud ý kiến, danh sách phản đối có lý do.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Xem donut chart: Tán thành/Phản đối/Không ý kiến","Word cloud từ nội dung ý kiến","Danh sách ý kiến phản đối chi tiết","Filter/sort ý kiến","Đánh dấu ý kiến 'có giá trị'","Export báo cáo PDF"] },
      { code:"LYK-005", title:"Xử lý Phản đối & Khiếu nại", desc:"Luồng xử lý ý kiến phản đối: phản hồi chính thức, đưa vào biên bản, escalate.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Ghi phản hồi chính thức cho từng phản đối","Đánh dấu đã giải quyết","Chuyển vào biên bản HĐ","Escalate to Leader (nếu nghiêm trọng)","Yêu cầu thẩm tra bổ sung"] },
      { code:"LYK-006", title:"Public LYK Portal (No Auth)", desc:"Trang công khai không cần đăng nhập: gửi ý kiến về hồ sơ trong đợt mở.", roles:["cá nhân","lãnh đạo đơn vị"],
        actions:["Verify danh tính (CCCD + OTP SMS)","Xem thông tin hồ sơ được lấy ý kiến","Gửi ý kiến (anonymous option)","Nhận xác nhận đã ghi nhận","Xem kết quả tổng hợp sau khi đóng"] },
      { code:"LYK-007", title:"Cấu hình Mẫu Đợt LYK", desc:"Admin cấu hình template đợt: câu hỏi, thời gian default, notification template.", roles:["quản trị hệ thống"],
        actions:["CRUD template đợt LYK","Preview template","Set default deadline (ngày làm việc)","Cấu hình notification email/SMS template","Version control template"] },
      { code:"LYK-008", title:"Thống kê LYK Lịch sử", desc:"Analytics các đợt LYK qua các năm: tỷ lệ phản đối theo đơn vị, xu hướng.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Line chart: tỷ lệ tán thành theo thời gian","Heatmap: đơn vị hay bị phản đối","Compare kết quả giữa các đợt","Export data CSV"] },
    ],
    workflow:[
      { id:"draft",     label:"Chuẩn bị",    color:"#4f5d6e", desc:"Đang thiết lập" },
      { id:"open",      label:"Đang mở",     color:"#7c3aed", desc:"Thu thập ý kiến" },
      { id:"closed",    label:"Đã đóng",     color:"#b45309", desc:"Hết hạn thu thập" },
      { id:"processed", label:"Đã tổng hợp", color:"#166534", desc:"Kết quả sẵn sàng" },
    ],
    fields:[
      { name:"Hồ sơ đề nghị",        type:"multi-ref",   req:true,  note:"Link tới 1+ hồ sơ DNKT" },
      { name:"Đối tượng lấy ý kiến", type:"multi-select",req:true,  note:"Cá nhân/đơn vị từ org tree" },
      { name:"Thời gian mở",         type:"datetime",    req:true,  note:"Trong giờ hành chính" },
      { name:"Thời gian đóng",       type:"datetime",    req:true,  note:"Tối thiểu mở + 5 ngày làm việc (TT 01)" },
      { name:"Hình thức",            type:"select",      req:true,  note:"Trực tuyến / Giấy tờ / Cả hai" },
      { name:"Ẩn danh",              type:"boolean",     req:false, note:"Nếu bật: không lưu danh tính" },
      { name:"Ngưỡng kết quả",       type:"number",      req:false, note:"% tán thành tối thiểu để 'Đạt'" },
    ],
    perms:[
      { action:"Tạo đợt LYK",         user:"✗", manager:"✓", council:"✓", leader:"✗", admin:"✓" },
      { action:"Gửi ý kiến",          user:"✓", manager:"✓", council:"✗", leader:"✗", admin:"✗" },
      { action:"Xem tổng hợp",        user:"✗", manager:"○", council:"✓", leader:"✓", admin:"✓" },
      { action:"Xử lý phản đối",      user:"✗", manager:"✗", council:"✓", leader:"✓", admin:"✓" },
      { action:"Cấu hình template",   user:"✗", manager:"✗", council:"✗", leader:"✗", admin:"✓" },
    ],
  },
  {
    id:"cham-diem", title:"Chấm điểm & Bình xét", icon:ClipboardList,
    color:"#92400e", bg:"#fef3c7", border:"#fcd34d",
    desc:"Scoring 5 tiêu chí × thành viên HĐ, AI gợi ý, so sánh deviation, kháng nghị, benchmark lịch sử.",
    screens:[
      { code:"CDB-001", title:"Queue Chấm điểm (SLA-aware)", desc:"Danh sách hồ sơ phân công với SLA countdown đỏ/vàng/xanh, filter theo đơn vị/danh hiệu.", roles:["hội đồng"],
        actions:["Xem queue với SLA bars","Sort SLA còn lại","Filter đơn vị/danh hiệu","Mở form chấm","Request reassign (nếu có lý do)"] },
      { code:"CDB-002", title:"Form Chấm điểm 5 Tiêu chí", desc:"Slider + số input mỗi tiêu chí, realtime total, AI suggest panel, nhận xét chi tiết.", roles:["hội đồng"],
        actions:["Chấm từng tiêu chí (slider + số)","Xem AI gợi ý (confidence %)","Accept/Reject gợi ý AI","Viết nhận xét chi tiết (rich text)","Submit / Lưu nháp","Ký tắt điện tử"],
        uxNotes:["AI suggest hiển thị confidence bar","Nếu điểm khác AI > 20%: toast 'Bạn đang chấm khác AI đáng kể. Lý do?'"] },
      { code:"CDB-003", title:"Bảng So sánh Điểm HĐ", desc:"Side-by-side so sánh điểm từng thành viên, highlight deviation, tính điểm TB.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Xem bảng điểm all members","Highlight deviation > 20% (màu đỏ)","Mở discussion nếu lệch lớn","Tính điểm TB (exclude outliers option)","Lock bảng sau khi Chủ tịch chốt"] },
      { code:"CDB-004", title:"Kết quả Bình xét Tổng hợp", desc:"Ranking theo điểm, threshold xanh(≥80)/vàng(60-79)/đỏ(<60), bulk approve.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Xem rank với threshold color coding","Filter: chỉ 'đạt' / 'không đạt'","Bulk chốt kết quả (với confirm)","Export kết quả Excel","Chuyển sang bỏ phiếu HĐ"] },
      { code:"CDB-005", title:"AI Scoring Analytics", desc:"So sánh AI gợi ý vs điểm thực tế của HĐ: accuracy metrics, bias detection.", roles:["hội đồng","quản trị hệ thống"],
        actions:["Xem accuracy rate AI theo tiêu chí","Phát hiện bias theo đơn vị/loại hình","Heatmap: deviation map","Recommendations cải thiện AI model"] },
      { code:"CDB-006", title:"Export Scorecard", desc:"Xuất bảng điểm cá nhân per hồ sơ theo mẫu chuẩn để lưu trữ hồ sơ.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Preview scorecard","Select hồ sơ (batch)","Export PDF / Excel","Signed scorecard (có timestamp)","Gửi tới Manager đơn vị"] },
      { code:"CDB-007", title:"Kháng nghị Điểm", desc:"Cơ chế kháng nghị khi cá nhân/đơn vị không đồng ý với điểm số — với deadline.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao"],
        actions:["Nộp đơn kháng nghị (trong 7 ngày)","Upload bằng chứng bổ sung","Xét duyệt kháng nghị (Council)","Điều chỉnh điểm nếu có cơ sở","Thông báo kết quả xét kháng nghị"] },
      { code:"CDB-008", title:"Benchmark Lịch sử", desc:"So sánh điểm hiện tại với phân bố điểm lịch sử cùng danh hiệu, phát hiện anomaly.", roles:["hội đồng","quản trị hệ thống"],
        actions:["Histogram phân bố điểm lịch sử","Highlight hồ sơ outlier","Drill-down xem hồ sơ lịch sử tương tự","Statistical report"] },
    ],
    workflow:[
      { id:"assigned",   label:"Phân công",     color:"#b45309", desc:"Được phân công chấm điểm" },
      { id:"scoring",    label:"Đang chấm",     color:"#1C5FBE", desc:"Nhập điểm từng tiêu chí" },
      { id:"submitted",  label:"Đã nộp điểm",   color:"#7c3aed", desc:"Chờ tổng hợp" },
      { id:"comparing",  label:"Đối chiếu",     color:"#92400e", desc:"Check deviation" },
      { id:"finalized",  label:"Đã chốt",       color:"#166534", desc:"Lock, immutable" },
    ],
    fields:[
      { name:"Tiêu chí 1: Thành tích cá nhân",  type:"number(0–20)", req:true, note:"Thành tích xuất sắc vượt trội theo hồ sơ" },
      { name:"Tiêu chí 2: Đóng góp tập thể",    type:"number(0–20)", req:true, note:"Đóng góp cho đơn vị và phong trào chung" },
      { name:"Tiêu chí 3: Thi đua liên tục",    type:"number(0–20)", req:true, note:"Số năm CSTĐ liên tiếp, không vi phạm" },
      { name:"Tiêu chí 4: Đổi mới sáng tạo",   type:"number(0–20)", req:true, note:"Sáng kiến, cải tiến được công nhận chính thức" },
      { name:"Tiêu chí 5: Phẩm chất đạo đức",  type:"number(0–20)", req:true, note:"Đánh giá phẩm chất, đạo đức, lối sống" },
      { name:"Điểm tổng",                       type:"computed",     req:false,note:"Auto: sum(T1..T5), readonly" },
      { name:"Nhận xét tự do",                  type:"rich-text",    req:false,note:"Max 1000 ký tự" },
      { name:"Đề xuất kết quả",                 type:"select",       req:true, note:"Đạt / Không đạt / Cần xem xét" },
      { name:"AI gợi ý điểm",                   type:"computed",     req:false,note:"Auto-fill từ AI engine, có thể override" },
    ],
    perms:[
      { action:"Xem queue",            user:"✗", manager:"✗", council:"✓", leader:"✓", admin:"✓" },
      { action:"Nhập điểm",            user:"✗", manager:"✗", council:"✓", leader:"✗", admin:"✗" },
      { action:"Xem bảng so sánh",     user:"✗", manager:"✗", council:"✓", leader:"✓", admin:"✓" },
      { action:"Chốt điểm",           user:"✗", manager:"✗", council:"✓", leader:"✓", admin:"✓" },
      { action:"Kháng nghị điểm",      user:"✓", manager:"✓", council:"✗", leader:"✗", admin:"✗" },
      { action:"AI analytics",         user:"✗", manager:"✗", council:"✓", leader:"✗", admin:"✓" },
    ],
  },
  {
    id:"hoi-dong", title:"Hội đồng Xét duyệt", icon:Gavel,
    color:"#0891b2", bg:"#e0f2fe", border:"#7dd3fc",
    desc:"Phiên họp với quorum check, agenda builder, e-voting + COI mask, auto biên bản Mẫu 01/TT 01.",
    screens:[
      { code:"HD-001", title:"Danh sách Phiên họp", desc:"Table với filter ngày/trạng thái/thành phần, calendar view option.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Filter theo tháng/trạng thái","Calendar view / Table view toggle","Tạo phiên mới","Xem biên bản đã phát hành","Export lịch họp iCal"] },
      { code:"HD-002", title:"Tạo Phiên họp", desc:"Form setup: ngày/giờ/địa điểm, invite thành viên, quorum check tự động.", roles:["hội đồng","quản trị hệ thống"],
        actions:["Nhập ngày giờ + địa điểm (hoặc link online)","Invite thành viên HĐ","Quorum check realtime (2/3 tổng HĐ)","Set thư ký ghi biên bản","Save draft / Gửi thư mời"] },
      { code:"HD-003", title:"Agenda Builder", desc:"Drag-drop hồ sơ vào agenda, set thời gian ước tính, export PDF chương trình.", roles:["hội đồng","quản trị hệ thống"],
        actions:["Drag-drop hồ sơ từ queue vào agenda","Set thời gian ước tính mỗi hồ sơ","Reorder bằng drag-drop","Thêm mục 'Khác' (thảo luận tự do)","Preview + Export PDF chương trình","Publish agenda cho thành viên"] },
      { code:"HD-004", title:"Phiên họp Live (Voting)", desc:"Live voting interface: mỗi hồ sơ → 3 nút vote, COI mask auto, realtime tally.", roles:["hội đồng"],
        actions:["Điều hướng qua agenda items","Bỏ phiếu: Tán thành / Không / Vắng mặt","COI declaration → ẩn phiếu bầu","Ghi ý kiến trực tiếp tại họp","Xem realtime tally sau khi chốt item","Next item / End meeting"] },
      { code:"HD-005", title:"Biên bản Tự động (Mẫu 01)", desc:"Auto-generate từ dữ liệu họp: thành phần, kết quả phiếu, kết luận. Edit + ký.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Preview biên bản auto-generated","Edit phần Kết luận (free text)","Số hóa tham chiếu văn bản","Ký biên bản (Chủ tịch HĐ)","Export PDF Mẫu 01/TT 15/2025","Phát hành + notify"] },
      { code:"HD-006", title:"Quản lý Thành viên HĐ", desc:"CRUD thành viên HĐ, thẩm quyền, COI relationships database, history.", roles:["quản trị hệ thống"],
        actions:["CRUD thành viên HĐ","Gán thẩm quyền (chủ tịch/thư ký/thành viên)","Nhập quan hệ COI","View lịch sử tham dự phiên","Deactivate thành viên"] },
      { code:"HD-007", title:"Document Annotation", desc:"Thành viên HĐ annotate hồ sơ trong khi họp: highlight, comment, question mark.", roles:["hội đồng"],
        actions:["Highlight text trong hồ sơ","Thêm sticky note","@mention thành viên khác trong comment","Export annotated PDF","Xem annotations của thành viên khác"] },
      { code:"HD-008", title:"Archive Phiên họp", desc:"Tìm kiếm biên bản lịch sử, re-verify chữ ký, download.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Search biên bản theo ngày/chủ đề","Download biên bản đã ký","Verify chữ ký CA online","Export danh sách phiên họp lịch sử"] },
    ],
    workflow:[
      { id:"draft",       label:"Chuẩn bị",     color:"#4f5d6e", desc:"Đang setup phiên" },
      { id:"scheduled",   label:"Đã lên lịch",  color:"#1C5FBE", desc:"Thư mời đã gửi" },
      { id:"in_progress", label:"Đang họp",     color:"#b45309", desc:"Đang diễn ra" },
      { id:"closed",      label:"Kết thúc",     color:"#92400e", desc:"Đang lập biên bản" },
      { id:"published",   label:"Đã phát hành", color:"#166534", desc:"Biên bản ký xong" },
    ],
    fields:[
      { name:"Tên phiên họp",          type:"text",       req:true,  note:"VD: Họp HĐ KT lần 1 năm 2026" },
      { name:"Ngày giờ họp",           type:"datetime",   req:true,  note:"Phải sau hôm nay ≥ 3 ngày làm việc" },
      { name:"Địa điểm / Link online", type:"text",       req:true,  note:"Địa chỉ vật lý hoặc meeting URL" },
      { name:"Thành phần tham dự",     type:"multi-user", req:true,  note:"Min 2/3 tổng số thành viên HĐ" },
      { name:"Hồ sơ trong chương trình",type:"multi-ref", req:true,  note:"Hồ sơ ở status council_assigned" },
      { name:"Chủ tịch HĐ",           type:"user-select",req:true,  note:"Role Leader/Council cấp cao" },
      { name:"Thư ký",                 type:"user-select",req:true,  note:"Ghi biên bản, role Council/Admin" },
    ],
    perms:[
      { action:"Tạo phiên họp",        user:"✗", manager:"✗", council:"✓", leader:"✗", admin:"✓" },
      { action:"Mời thành viên",       user:"✗", manager:"✗", council:"✓", leader:"✗", admin:"✓" },
      { action:"Bỏ phiếu",            user:"✗", manager:"✗", council:"✓", leader:"✗", admin:"✗" },
      { action:"Ký biên bản",         user:"✗", manager:"✗", council:"○", leader:"✓", admin:"✗" },
      { action:"Phát hành biên bản",  user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
      { action:"Quản lý thành viên",  user:"✗", manager:"✗", council:"✗", leader:"✗", admin:"✓" },
    ],
  },
  {
    id:"ky-so", title:"Ký số & Phê duyệt", icon:FileSignature,
    color:"#166534", bg:"#dcfce7", border:"#86efac",
    desc:"PKI CA integration: inbox SLA, preview, ký đơn/batch, mobile OTP, từ chối, cert management.",
    screens:[
      { code:"KSO-001", title:"Inbox Ký số (SLA-sorted)", desc:"Queue hồ sơ chờ ký, màu SLA: đỏ(<1n)/vàng(<3n)/xanh(>3n). Split-view preview.", roles:["lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Sort tự động SLA ngắn nhất lên đầu","Preview split-view bên phải","Filter đơn vị/danh hiệu/SLA","Batch select (max 20)","View notification SLA breach"] },
      { code:"KSO-002", title:"Preview Chi tiết Hồ sơ", desc:"Full review: hồ sơ + điểm HĐ + kết quả LYK + biên bản. Decision panel.", roles:["lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Read hồ sơ đầy đủ (multi-tab)","Xem aggregate score từ HĐ","Xem kết quả LYK (tỷ lệ tán thành)","Xem biên bản phiên họp","3 actions: Ký / Từ chối / Trả lại HĐ"] },
      { code:"KSO-003", title:"Giao diện Ký số CA", desc:"CA auth → sign hash → embed PDF → verify. Support SAVIS/VNPT-CA/USB token.", roles:["lãnh đạo cấp cao"],
        actions:["Detect CA token/HSM tự động","Chọn chứng thư số (nếu nhiều)","Nhập PIN xác thực","Generate + sign document hash","Verify chain: cert → intermediate → root","Embed signature + timestamp vào PDF"],
        uxNotes:["Progress indicator: Generating hash → Sending to CA → Embedding → Verifying","Error states: Token not found / PIN wrong / Cert expired / Network timeout"] },
      { code:"KSO-004", title:"Batch Sign (≤ 20 hồ sơ)", desc:"Multi-select → 1 CA auth → sign all. Progress bar, partial success handling.", roles:["lãnh đạo cấp cao"],
        actions:["Checkbox select trong inbox","'Ký tất cả được chọn' + confirm","1 lần PIN CA cho toàn batch","Progress bar X/20 đã ký","Retry hồ sơ thất bại","Báo cáo kết quả chi tiết"] },
      { code:"KSO-005", title:"Từ chối & Trả lại", desc:"Dialog từ chối: dropdown lý do chuẩn + textarea chi tiết. Status transition + notify.", roles:["lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Chọn lý do từ chối (dropdown 8 lý do chuẩn)","Nhập chi tiết bổ sung (bắt buộc ≥ 20 ký tự)","Confirm dialog (irreversible)","Auto-notify HĐ + Manager + User","Audit log ghi nhận đầy đủ"] },
      { code:"KSO-006", title:"Lịch sử Ký số", desc:"Timeline tất cả văn bản đã ký/từ chối, verify CA online, download signed PDF.", roles:["lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Filter theo thời gian/loại văn bản","Download signed PDF","Verify chữ ký CA (online/offline)","Export lịch sử CSV","Xem analytics: thời gian ký TB"] },
      { code:"KSO-007", title:"Quản lý Chứng thư Số", desc:"Admin quản lý catalog cert của đơn vị: hạn dùng, cảnh báo expire, renewal.", roles:["quản trị hệ thống"],
        actions:["Xem danh sách cert theo đơn vị","Alert cert expiring trong 30 ngày","Renew / Revoke cert","Import cert mới","Log tất cả cert operations"] },
      { code:"KSO-008", title:"Signing Analytics Dashboard", desc:"Metrics: thời gian ký TB, bottleneck analysis, SLA compliance rate.", roles:["lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Avg signing time per month","SLA compliance rate (%)","Bottleneck: hồ sơ chờ lâu nhất","Top reasons from chối","Trend chart 12 tháng"] },
    ],
    workflow:[
      { id:"pending",    label:"Chờ ký",       color:"#c8102e", desc:"Trong inbox Leader" },
      { id:"previewing", label:"Đang xem xét", color:"#b45309", desc:"Leader đang review" },
      { id:"signing",    label:"Đang ký CA",   color:"#1C5FBE", desc:"Xử lý CA signing" },
      { id:"signed",     label:"Đã ký",        color:"#166534", desc:"Ký thành công" },
      { id:"rejected",   label:"Từ chối",      color:"#991b1b", desc:"Leader từ chối" },
      { id:"returned",   label:"Trả lại HĐ",  color:"#92400e", desc:"Để xem xét lại" },
    ],
    fields:[
      { name:"Hồ sơ đề nghị",      type:"ref",       req:true, note:"Link tới DNKT đã qua HĐ vote" },
      { name:"Loại văn bản",       type:"select",    req:true, note:"QĐ tặng danh hiệu / Bằng khen / Giấy khen" },
      { name:"Chứng thư số",       type:"cert-ref",  req:true, note:"Auto-detect từ USB token / HSM" },
      { name:"Lý do từ chối",     type:"text",      req:"if rejected", note:"Min 20 ký tự, dropdown+textarea" },
      { name:"Timestamp CA",       type:"auto",      req:true, note:"Từ TSA server, không thể sửa" },
    ],
    perms:[
      { action:"Xem inbox",          user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
      { action:"Ký số",              user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✗" },
      { action:"Batch sign",         user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✗" },
      { action:"Từ chối",            user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
      { action:"Quản lý cert",       user:"✗", manager:"✗", council:"✗", leader:"✗", admin:"✓" },
      { action:"Signing analytics",  user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
    ],
  },
  {
    id:"quyet-dinh", title:"Quyết định Khen thưởng", icon:ScrollText,
    color:"#0b1426", bg:"#e8ecf3", border:"#c5cdd9",
    desc:"Dự thảo QĐ từ template, số QĐ tự động, ký CA, phát hành, QR verify công khai, amendment.",
    screens:[
      { code:"QD-001", title:"Danh sách Quyết định", desc:"Table filter năm/loại/trạng thái, search số QĐ/tên, download, QR verify.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Filter năm/loại danh hiệu/trạng thái","Search số QĐ hoặc tên cá nhân","Download PDF signed","Copy QR link verify","View signing certificate info"] },
      { code:"QD-002", title:"Dự thảo Quyết định (Template Editor)", desc:"Chọn template → auto-fill → edit phần tự do → preview → version history.", roles:["lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Chọn template theo loại danh hiệu","Auto-fill: số QĐ, ngày, tên, danh hiệu, căn cứ","Edit phần 'xét thấy' + 'quyết định'","Số QĐ auto theo series đơn vị+năm","Version history (v1, v2, v3...)","Preview full-page trước ký"] },
      { code:"QD-003", title:"Chi tiết Quyết định (Published)", desc:"Full view QĐ published: văn bản, chữ ký CA, QR code, lịch sử phát hành.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Đọc toàn văn QĐ","Xem thông tin chữ ký CA (cert info, timestamp)","Copy/Download QR code","Download PDF gốc + signed","Chia sẻ link verify công khai"] },
      { code:"QD-004", title:"Public Verification Page (No Auth)", desc:"Trang công khai xác thực QĐ qua QR/URL. Badge hợp lệ/không hợp lệ/đã hủy.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Hiển thị: số QĐ, ngày, tên, danh hiệu","Verify chữ ký CA status realtime","Badge: ✓ Hợp lệ / ✗ Không hợp lệ / ⚠ Đã hủy","Không hiển thị PII nhạy cảm","QR link shareable"] },
      { code:"QD-005", title:"Template Quản lý Mẫu QĐ", desc:"Admin CRUD template QĐ theo loại danh hiệu, căn cứ pháp lý tự động, versioning.", roles:["quản trị hệ thống"],
        actions:["CRUD template per award type","Edit HTML template với variables","Preview populated template","Version control","Assign template → danh hiệu"] },
      { code:"QD-006", title:"QĐ Đính chính / Bổ sung", desc:"Quy trình ban hành QĐ đính chính cho QĐ có lỗi. Kèm QĐ gốc.", roles:["lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Tạo QĐ đính chính/bổ sung","Link tới QĐ gốc","Mô tả nội dung thay đổi","Ký CA QĐ đính chính","Cập nhật status QĐ gốc → 'Đã đính chính'"] },
      { code:"QD-007", title:"Danh sách Phát hành (Distribution)", desc:"Quản lý danh sách nhận QĐ: gửi email/notification tới các bên liên quan.", roles:["lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Xem distribution list per QĐ","Gửi lại QĐ (nếu người nhận báo chưa nhận)","Xác nhận đã nhận (digital)","Export danh sách xác nhận"] },
      { code:"QD-008", title:"QĐ Archive & Tìm kiếm Toàn văn", desc:"Full-text search trong nội dung QĐ, filter nâng cao, export batch.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Full-text search (tìm trong nội dung)","Filter: danh hiệu/năm/đơn vị/người ký","Sort: ngày/số QĐ/tên","Batch download multiple QĐ","Export danh sách Excel"] },
    ],
    workflow:[
      { id:"draft",     label:"Dự thảo",    color:"#4f5d6e", desc:"Đang soạn" },
      { id:"review",    label:"Chờ Leader", color:"#b45309", desc:"Chờ xem xét" },
      { id:"signed",    label:"Đã ký",     color:"#1C5FBE", desc:"Ký CA hợp lệ" },
      { id:"published", label:"Phát hành", color:"#166534", desc:"Ban hành chính thức" },
      { id:"amended",   label:"Đã đính chính",color:"#7c3aed",desc:"Có QĐ đính chính" },
      { id:"archived",  label:"Lưu trữ",   color:"#635647", desc:"Read-only" },
    ],
    fields:[
      { name:"Số Quyết định",       type:"auto-generated",req:true, note:"XXX/QĐ-UBND-YYYY, không sửa sau publish" },
      { name:"Ngày ký",             type:"date",          req:true, note:"Auto khi ký CA" },
      { name:"Căn cứ pháp lý",      type:"multi-select",  req:true, note:"Từ danh mục văn bản pháp quy" },
      { name:"Người được khen",     type:"person-ref",    req:true, note:"Link từ hồ sơ DNKT" },
      { name:"Danh hiệu",           type:"award-ref",     req:true, note:"Link từ award catalog" },
      { name:"Lý do khen",          type:"rich-text",     req:true, note:"Auto-fill từ tóm tắt hồ sơ" },
      { name:"Người ký",            type:"user-ref",      req:true, note:"Có thẩm quyền ký danh hiệu này" },
    ],
    perms:[
      { action:"Tạo dự thảo",       user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
      { action:"Ký & Phát hành",   user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✗" },
      { action:"Xem QĐ",           user:"○", manager:"○", council:"✓", leader:"✓", admin:"✓" },
      { action:"Download PDF",      user:"○", manager:"✓", council:"✓", leader:"✓", admin:"✓" },
      { action:"Verify public",     user:"✓", manager:"✓", council:"✓", leader:"✓", admin:"✓" },
      { action:"Quản lý template",  user:"✗", manager:"✗", council:"✗", leader:"✗", admin:"✓" },
    ],
  },
  {
    id:"dashboard", title:"Dashboard & Báo cáo", icon:BarChart3,
    color:"#635647", bg:"#f4f7fb", border:"#d6cfc3",
    desc:"KPI realtime, bảng xếp hạng, BI multi-dim, SLA monitor, scheduled reports, custom widgets.",
    screens:[
      { code:"DB-001", title:"Dashboard Chính (Role-adaptive)", desc:"Widgets thích ứng theo role: User thấy hồ sơ mình, Admin thấy toàn hệ thống.", roles:["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["KPI widgets (số hồ sơ/SLA/danh hiệu)","Pipeline hồ sơ (Kanban mini)","Bảng xếp hạng thi đua realtime","Notification feed","Quick actions theo role"],
        uxNotes:["Skeleton loader khi fetch","Refresh button với 'cập nhật lúc HH:MM'","Responsive: 2 col mobile / 4 col desktop"] },
      { code:"DB-002", title:"Phân tích Thi đua (BI)", desc:"Multi-dim analytics: bar/line/pie/heatmap, drill-down, compare cùng kỳ.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Chọn dimension: đơn vị/danh hiệu/năm/quý","Drill-down: click chart → filter","Toggle chart type (bar/line/pie/scatter)","Compare với cùng kỳ năm trước","Export chart PNG/SVG","Export data CSV"] },
      { code:"DB-003", title:"Báo cáo Định kỳ", desc:"Template báo cáo BNV theo kỳ: tháng/quý/năm. Preview + export chuẩn biểu mẫu.", roles:["lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Chọn template báo cáo","Set kỳ + scope đơn vị","Preview PDF trước export","Export PDF (chuẩn BNV) / Excel","Gửi báo cáo lên cấp trên","Scheduled auto-send"] },
      { code:"DB-004", title:"SLA Monitor Realtime", desc:"Hồ sơ vi phạm SLA: countdown, trách nhiệm, quick-action. Alert escalation.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Table hồ sơ SLA red/yellow/green","Filter theo đơn vị/stage/mức độ","Click row → navigate hồ sơ","Reassign người xử lý","Send escalation alert manual","Export danh sách vi phạm"] },
      { code:"DB-005", title:"Custom Dashboard Builder", desc:"Drag-drop widget builder: chọn metrics, layout, color theme, save preset.", roles:["lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Widget library (20+ widgets)","Drag-drop layout builder","Config widget: metric/filter/color","Save preset dashboard","Share preset với users khác","Reset to default"] },
      { code:"DB-006", title:"KPI & Alert Configuration", desc:"Config ngưỡng KPI alert: email/in-app khi vượt threshold.", roles:["quản trị hệ thống"],
        actions:["CRUD KPI thresholds","Set notification recipients","Test alert (send test email)","Alert history log","Enable/Disable per alert"] },
      { code:"DB-007", title:"Scheduled Reports", desc:"Config báo cáo tự động: schedule (daily/weekly/monthly), recipients, format.", roles:["lãnh đạo đơn vị","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Tạo report schedule","Set recipients (multi-user/email)","Set format PDF/Excel","Run now (test)","View history (sent/failed)","Pause/Resume schedule"] },
      { code:"DB-008", title:"Data Export Center", desc:"Bulk export bất kỳ dataset: hồ sơ/QĐ/phong trào theo filter nâng cao.", roles:["hội đồng","lãnh đạo cấp cao","quản trị hệ thống"],
        actions:["Select dataset: Hồ sơ/QĐ/Phong trào/Audit","Filter nâng cao multi-field","Preview record count","Export CSV/Excel/JSON","Encryption option (password-protected)","Download link valid 24h"] },
    ],
    workflow:[],
    fields:[
      { name:"Widget type",    type:"select",  req:true, note:"KPI / Chart / Table / Gauge / Timeline" },
      { name:"Data source",    type:"select",  req:true, note:"Module + entity + aggregation function" },
      { name:"Refresh rate",   type:"select",  req:true, note:"Realtime / 5m / 15m / 1h / Manual" },
      { name:"Filter preset",  type:"json",    req:false,note:"Predefined filter applied to data source" },
    ],
    perms:[
      { action:"Xem Dashboard",       user:"○", manager:"○", council:"✓", leader:"✓", admin:"✓" },
      { action:"BI Analytics",        user:"✗", manager:"✗", council:"✓", leader:"✓", admin:"✓" },
      { action:"Export báo cáo",      user:"✗", manager:"✓", council:"✓", leader:"✓", admin:"✓" },
      { action:"SLA Monitor",         user:"✗", manager:"✗", council:"✓", leader:"✓", admin:"✓" },
      { action:"Custom Dashboard",    user:"✗", manager:"✗", council:"✗", leader:"✓", admin:"✓" },
      { action:"Schedule Reports",    user:"✗", manager:"✓", council:"✗", leader:"✓", admin:"✓" },
      { action:"Data Export Center",  user:"✗", manager:"✗", council:"✓", leader:"✓", admin:"✓" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   BUSINESS RULES — 55 total
═══════════════════════════════════════════════════════════════ */
interface BRule { id:string; rule:string; module:string; prio:"P0"|"P1"; legal?:string }
const BUSINESS_RULES: BRule[] = [
  { id:"BR-01", rule:"Hồ sơ không thể sửa sau khi submit (status ≠ draft). Chỉ bổ sung qua luồng 'Yêu cầu bổ sung'.", module:"Đề nghị KT", prio:"P0" },
  { id:"BR-02", rule:"Manager chỉ xem/thao tác hồ sơ thuộc đơn vị mình quản lý trực tiếp hoặc cấp dưới.", module:"Đề nghị KT", prio:"P0" },
  { id:"BR-03", rule:"Một cá nhân không được có 2 hồ sơ cùng danh hiệu trong cùng kỳ xét tặng.", module:"Đề nghị KT", prio:"P0" },
  { id:"BR-04", rule:"Hồ sơ fail điều kiện 'cứng' theo NĐ 98 bị block tự động — không đưa vào HĐ.", module:"Đề nghị KT", prio:"P0", legal:"NĐ 152/2025/NĐ-CP Điều 11" },
  { id:"BR-05", rule:"Thời gian xử lý mỗi bước không vượt SLA trong TT 15/2025. Quá hạn → alert + escalate.", module:"Đề nghị KT", prio:"P0", legal:"TT 15/2025 Điều 12" },
  { id:"BR-06", rule:"Thời gian giữa 2 lần đề nghị cùng danh hiệu cho 1 cá nhân: tối thiểu 5 năm.", module:"Đề nghị KT", prio:"P0", legal:"NĐ 152/2025/NĐ-CP" },
  { id:"BR-07", rule:"Hồ sơ phải được Manager đơn vị xác nhận trước khi gửi HĐ — không skip bước này.", module:"Đề nghị KT", prio:"P0", legal:"TT 15/2025 Điều 9" },
  { id:"BR-08", rule:"Phiên họp HĐ hợp lệ khi ≥ 2/3 tổng thành viên HĐ tham dự (xác nhận online hoặc có mặt).", module:"Hội đồng", prio:"P0", legal:"NĐ 152/2025/NĐ-CP Điều 30" },
  { id:"BR-09", rule:"Thành viên có quan hệ hôn nhân/huyết thống bậc 1-2/cùng đơn vị trực tiếp với ứng viên phải hồi tị.", module:"Hội đồng", prio:"P0", legal:"Luật TĐKT 2022 Điều 27" },
  { id:"BR-10", rule:"Kết quả bỏ phiếu là bí mật trong quá trình họp. Tổng hợp công bố sau khi Chủ tịch chốt item.", module:"Hội đồng", prio:"P0", legal:"NĐ 152/2025/NĐ-CP Điều 32" },
  { id:"BR-11", rule:"Biên bản phiên họp là immutable sau khi Chủ tịch HĐ ký. Mọi thay đổi → tạo phiên mới.", module:"Hội đồng", prio:"P0" },
  { id:"BR-12", rule:"Điểm mỗi tiêu chí: 0–20. Tổng max 100. Computed field, không chỉnh sửa trực tiếp.", module:"Chấm điểm", prio:"P0" },
  { id:"BR-13", rule:"Thành viên HĐ chỉ chấm điểm hồ sơ được phân công — không chấm được hồ sơ không được giao.", module:"Chấm điểm", prio:"P0" },
  { id:"BR-14", rule:"Cần điểm của ít nhất 3 thành viên HĐ để tính điểm trung bình hợp lệ.", module:"Chấm điểm", prio:"P0" },
  { id:"BR-15", rule:"Deviation > 30% giữa 2 thành viên bất kỳ → bắt buộc discussion trước khi lock.", module:"Chấm điểm", prio:"P0" },
  { id:"BR-16", rule:"Điểm chấm sau khi Chủ tịch HĐ lock → immutable. Thay đổi phải qua quy trình kháng nghị.", module:"Chấm điểm", prio:"P0" },
  { id:"BR-17", rule:"Chứng thư số ký phải: (a) còn hạn, (b) CA được NEAC công nhận, (c) khớp người ký.", module:"Ký số", prio:"P0", legal:"NĐ 130/2018/NĐ-CP" },
  { id:"BR-18", rule:"Mọi văn bản ký phải kèm timestamp từ TSA. Không chấp nhận local time.", module:"Ký số", prio:"P0", legal:"NĐ 130/2018/NĐ-CP" },
  { id:"BR-19", rule:"Văn bản sau khi ký là immutable — bất kỳ thay đổi nào invalidate chữ ký.", module:"Ký số", prio:"P0" },
  { id:"BR-20", rule:"Leader chỉ ký danh hiệu trong thẩm quyền được Admin cấu hình theo QĐ 34 + NĐ 98.", module:"Ký số", prio:"P0", legal:"QĐ 34/2021 + NĐ 152/2025/NĐ-CP" },
  { id:"BR-21", rule:"Batch sign tối đa 20 hồ sơ/lần. 1 lần CA auth cho toàn batch. Lỗi 1 hồ sơ → tiếp tục hồ sơ khác.", module:"Ký số", prio:"P1" },
  { id:"BR-22", rule:"Thời gian LYK tối thiểu 5 ngày làm việc trước khi đưa vào HĐ xét duyệt.", module:"Lấy ý kiến", prio:"P0", legal:"TT 15/2025 Điều 15" },
  { id:"BR-23", rule:"Mỗi người chỉ gửi ý kiến 1 lần per hồ sơ per đợt. Không update sau submit.", module:"Lấy ý kiến", prio:"P0" },
  { id:"BR-24", rule:"Số QĐ sinh tự động theo series năm, không thay đổi thủ công sau phát hành.", module:"Quyết định", prio:"P0" },
  { id:"BR-25", rule:"QĐ đã phát hành là immutable. Hủy phải tạo QĐ hủy bỏ riêng theo quy trình.", module:"Quyết định", prio:"P0" },
  { id:"BR-26", rule:"Audit log là immutable và không thể xóa. Retention tối thiểu 5 năm.", module:"Hệ thống", prio:"P0", legal:"NĐ 13/2023" },
  { id:"BR-27", rule:"PII xử lý đúng NĐ 13/2023. Không lưu PII không cần thiết. Encrypt PII at rest.", module:"Hệ thống", prio:"P0", legal:"NĐ 13/2023/NĐ-CP" },
  { id:"BR-28", rule:"Mỗi cá nhân/đơn vị chỉ đăng ký 1 lần/phong trào. Rút + đăng ký lại → entry mới.", module:"Phong trào", prio:"P1" },
  { id:"BR-29", rule:"Phong trào status='open' không thể xóa, chỉ kết thúc sớm với lý do ghi rõ.", module:"Phong trào", prio:"P1" },
  { id:"BR-30", rule:"Hồ sơ không được xử lý sau 2 năm kể từ ngày nộp → auto-archive với notification.", module:"Đề nghị KT", prio:"P1" },
  { id:"BR-31", rule:"Password: min 8 ký tự, có hoa, thường, số, ký tự đặc biệt. Không trùng 3 password gần nhất.", module:"Hệ thống", prio:"P0" },
  { id:"BR-32", rule:"Session timeout: User/Manager 60 phút idle, Council/Leader 30 phút, Admin 15 phút.", module:"Hệ thống", prio:"P1" },
  { id:"BR-33", rule:"API rate limiting: 100 req/min/user. Burst: 200/min. DDoS protection tại API Gateway.", module:"Hệ thống", prio:"P1" },
  { id:"BR-34", rule:"File upload: validate MIME type thực tế (không chỉ extension). Max size per file: 10MB.", module:"Hệ thống", prio:"P0" },
  { id:"BR-35", rule:"Mọi action quan trọng (submit/approve/sign/reject) cần confirmation dialog với mô tả hậu quả.", module:"UX", prio:"P1" },
  { id:"BR-36", rule:"Form wizard không cho phép skip bước — phải hoàn thành bước hiện tại mới Next.", module:"UX", prio:"P1" },
  { id:"BR-37", rule:"Tất cả API call có timeout 30s. Quá timeout → toast error + retry button.", module:"UX", prio:"P1" },
  { id:"BR-38", rule:"Loading state hiển thị khi request > 300ms. Skeleton loader cho list/table.", module:"UX", prio:"P1" },
  { id:"BR-39", rule:"Toast notifications: max 3 toast cùng lúc. Auto-dismiss 4s. Error toast không auto-dismiss.", module:"UX", prio:"P1" },
  { id:"BR-40", rule:"Dirty form (có thay đổi chưa lưu) → cảnh báo khi navigate/close tab (beforeunload).", module:"UX", prio:"P1" },
  { id:"BR-41", rule:"Pagination: default 20 records/page. Cursor-based pagination cho list >10K records.", module:"Scalability", prio:"P1" },
  { id:"BR-42", rule:"Redis cache: session + hot data (30 min TTL). Invalidate on write.", module:"Scalability", prio:"P1" },
  { id:"BR-43", rule:"Database: Row-level security per org_id (multi-tenant isolation). Index trên org_id+status.", module:"Scalability", prio:"P0" },
  { id:"BR-44", rule:"File storage: S3-compatible với CDN. Signed URL cho download (expire 1h). AES-256 at rest.", module:"Scalability", prio:"P0" },
  { id:"BR-45", rule:"Background jobs: queue-based (BullMQ). Retry 3 lần với exponential backoff.", module:"Scalability", prio:"P1" },
  { id:"BR-46", rule:"Multi-tenant: tenant data isolated bằng org_id trong tất cả queries. No cross-tenant data leak.", module:"Scalability", prio:"P0" },
  { id:"BR-47", rule:"Admin không thể tự xóa chính mình khỏi hệ thống — phải có ít nhất 1 Admin active.", module:"Hệ thống", prio:"P0" },
  { id:"BR-48", rule:"2FA bắt buộc với Leader và Admin sau 7 ngày kể từ khi enforce. TOTP (30s window).", module:"Hệ thống", prio:"P0" },
  { id:"BR-49", rule:"Thành viên HĐ không được tham gia HĐ đồng thời là người đề nghị trong cùng đợt xét.", module:"Hội đồng", prio:"P0", legal:"Luật TĐKT 2022 Điều 27" },
  { id:"BR-50", rule:"Deployment: Blue-green deployment. Zero-downtime. DB migration với rollback script.", module:"Scalability", prio:"P1" },
  { id:"BR-51", rule:"Error monitoring: Sentry integration. Alert Slack khi error rate > 1% trong 5 phút.", module:"Scalability", prio:"P1" },
  { id:"BR-52", rule:"WCAG 2.1 AA: keyboard navigation đầy đủ, screen reader compatible, contrast ratio ≥ 4.5:1.", module:"UX", prio:"P1" },
  { id:"BR-53", rule:"Mobile responsive: breakpoints 360/768/1024/1280. Tất cả action khả thi trên mobile.", module:"UX", prio:"P1" },
  { id:"BR-54", rule:"Thông báo phải gửi trong 1 phút sau event. Hỗ trợ in-app + email (SMTP). SMS optional.", module:"Hệ thống", prio:"P1" },
  { id:"BR-55", rule:"Backup: daily 2AM, AES-256 encrypt, retain 30 snapshots, 2 location. Restore drill quarterly.", module:"Scalability", prio:"P0" },
];

/* ═══════════════════════════════════════════════════════════════
   USER FLOWS
═══════════════════════════════════════════════════════════════ */
type RoleId2 = LoginUser["role"];
interface FlowStep { step:number; label:string; desc:string; screen:string; actions:string[]; condition?:string }
interface RoleFlow { role:RoleId2; steps:FlowStep[] }
const ROLE_FLOWS: RoleFlow[] = [
  { role:"cá nhân", steps:[
    { step:1, label:"Đăng nhập & Onboard", desc:"Login → OTP xác thực → điền profile còn thiếu → xem onboarding tour", screen:"Login", actions:["Nhập email/password","Xác thực OTP/2FA","Điền thông tin thiếu","Xem onboarding tips"] },
    { step:2, label:"Xem Phong trào", desc:"Tìm và đọc thể lệ phong trào phù hợp", screen:"PTD-001/002", actions:["Filter loại hình phong trào","Đọc thể lệ chi tiết","Xem chỉ tiêu cam kết yêu cầu"] },
    { step:3, label:"Đăng ký Tham gia", desc:"Cam kết chỉ tiêu + upload kế hoạch hành động", screen:"PTD-004", actions:["Điền chỉ tiêu cụ thể","Upload kế hoạch","Submit đăng ký"] },
    { step:4, label:"Nộp Hồ sơ KT", desc:"Wizard 4 bước với AI pre-check trước submit", screen:"DNKT-003/004", actions:["Wizard TT cơ bản","Thành tích 5 năm","Upload minh chứng","AI pre-check → Submit"] },
    { step:5, label:"Theo dõi & Bổ sung", desc:"Xem stepper trạng thái, phản hồi yêu cầu bổ sung nếu có", screen:"DNKT-002", actions:["Stepper trạng thái realtime","Đọc nhận xét HĐ","Upload bổ sung (nếu được yêu cầu)"], condition:"Nếu Council yêu cầu bổ sung" },
    { step:6, label:"Gửi ý kiến LYK", desc:"Nhận link LYK → gửi ý kiến về hồ sơ của mình hoặc người khác", screen:"LYK-003", actions:["Chọn Tán thành/Phản đối","Nhập nội dung","Submit (1 lần)"], condition:"Nếu là đối tượng được lấy ý kiến" },
    { step:7, label:"Nhận Quyết định", desc:"Nhận notification → download QĐ → verify QR", screen:"QD-003", actions:["Nhận notification","Download QĐ PDF","Verify QR code công khai"] },
  ]},
  { role:"lãnh đạo đơn vị", steps:[
    { step:1, label:"Dashboard Đơn vị", desc:"Xem KPI thi đua, pipeline hồ sơ, hạn nộp sắp đến", screen:"DB-001", actions:["Xem KPI widgets","Alert hạn sắp đến","Pipeline hồ sơ"] },
    { step:2, label:"Lập Hồ sơ Đề nghị", desc:"Tạo hồ sơ cho cán bộ đơn vị hoặc bulk import Excel", screen:"DNKT-003/007", actions:["Chọn cán bộ đề nghị","Điền wizard","Hoặc: Bulk import từ Excel"] },
    { step:3, label:"Phê duyệt Nội bộ", desc:"Review và xác nhận hồ sơ trước khi gửi HĐ", screen:"DNKT-002", actions:["Review toàn bộ hồ sơ","Trả lại nếu thiếu","Xác nhận & gửi HĐ"] },
    { step:4, label:"Tổ chức LYK Đơn vị", desc:"Tạo đợt LYK, chọn đối tượng, set deadline", screen:"LYK-001/002", actions:["Tạo đợt","Set đối tượng + deadline","Gửi nhắc nhở"] },
    { step:5, label:"Báo cáo Thi đua", desc:"Xuất báo cáo tổng hợp tháng/quý theo biểu mẫu BNV", screen:"DB-003", actions:["Chọn kỳ + template","Preview","Export Excel/PDF","Gửi lên HĐ"] },
  ]},
  { role:"hội đồng", steps:[
    { step:1, label:"Queue Thẩm định", desc:"Xem danh sách phân công, ưu tiên SLA ngắn nhất", screen:"CDB-001", actions:["Xem queue","Sort SLA","Nhận hồ sơ phân công"] },
    { step:2, label:"Thẩm định Hồ sơ", desc:"Chấm điểm 5 tiêu chí, COI check, legal check, nhận xét", screen:"DNKT-004/005", actions:["Chấm điểm","COI check","Legal auto-check","Viết nhận xét","Submit"] },
    { step:3, label:"Tổng hợp LYK", desc:"Xem kết quả lấy ý kiến, xử lý phản đối", screen:"LYK-004/005", actions:["Xem donut chart","Review phản đối","Phản hồi chính thức"] },
    { step:4, label:"Tổ chức Phiên họp", desc:"Tạo phiên, invite, chuẩn bị agenda", screen:"HD-002/003", actions:["Tạo phiên","Drag-drop agenda","Gửi thư mời"] },
    { step:5, label:"Tiến hành Họp + Vote", desc:"Live voting, COI auto-mask, ghi kết quả", screen:"HD-004", actions:["Vote từng hồ sơ","COI declaration","Xem tally sau chốt"] },
    { step:6, label:"Lập Biên bản", desc:"Edit kết luận, ký biên bản, export PDF Mẫu 01", screen:"HD-005", actions:["Edit kết luận","Ký biên bản","Export PDF Mẫu 01"] },
  ]},
  { role:"lãnh đạo cấp cao", steps:[
    { step:1, label:"Inbox Ký số (SLA)", desc:"Xem queue ký, ưu tiên SLA ngắn nhất", screen:"KSO-001", actions:["SLA countdown màu sắc","Preview split-view","Filter đơn vị"] },
    { step:2, label:"Review Trước Ký", desc:"Đọc đầy đủ hồ sơ + điểm HĐ + kết quả LYK", screen:"KSO-002", actions:["Đọc hồ sơ multi-tab","Xem aggregate score","Xem biên bản HĐ"] },
    { step:3, label:"Ký số CA", desc:"Xác thực CA token, sign hash, verify timestamp", screen:"KSO-003", actions:["PIN xác thực","Sign document","Verify result"] },
    { step:4, label:"Ban hành QĐ", desc:"Dự thảo QĐ → số tự động → ký → phát hành", screen:"QD-002", actions:["Template auto-fill","Số QĐ tự động","Ký & Phát hành"] },
    { step:5, label:"Phê duyệt Phong trào", desc:"Review phong trào đề xuất từ cấp dưới", screen:"PTD-002", actions:["Đọc kế hoạch","Phê duyệt / Trả lại"] },
    { step:6, label:"SLA & KPI Monitor", desc:"Xem tổng quan vi phạm SLA, escalate", screen:"DB-004/001", actions:["Hồ sơ quá hạn","Escalate","Dashboard multi-unit"] },
  ]},
  { role:"quản trị hệ thống", steps:[
    { step:1, label:"Cấu hình Đơn vị", desc:"Build cây tổ chức, pháp nhân, import Excel", screen:"Config", actions:["Build org tree","Pháp nhân","Import Excel"] },
    { step:2, label:"Config Danh hiệu", desc:"CRUD danh hiệu, điều kiện NĐ 98, thẩm quyền ký", screen:"Config", actions:["CRUD danh hiệu","Điều kiện NĐ 98","Mapping thẩm quyền"] },
    { step:3, label:"Quản lý Người dùng", desc:"CRUD accounts, roles, 2FA enforcement", screen:"Phân quyền", actions:["Tạo/Sửa accounts","Gán roles","2FA enforce"] },
    { step:4, label:"Config Kỳ xét & SLA", desc:"Năm công tác, deadline, SLA per stage", screen:"Config", actions:["Kỳ xét tặng","Deadline per bước","SLA config"] },
    { step:5, label:"Monitor & Backup", desc:"System health, error logs, backup schedule", screen:"DB-001", actions:["System health","Error logs","Backup trigger","Audit trail review"] },
  ]},
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS + REUSED MICRO COMPONENTS
═══════════════════════════════════════════════════════════════ */
const ROLE_SIMPLE: Record<RoleId,{color:string;bg:string;label:string}> = {
  user:    { color:"#1C5FBE", bg:"#ddeafc", label:"User"    },
  manager: { color:"#166534", bg:"#dcfce7", label:"Manager" },
  council: { color:"#7c3aed", bg:"#f5f3ff", label:"Council" },
  leader:  { color:"#92400e", bg:"#fef3c7", label:"Leader"  },
  admin:   { color:"#0b1426", bg:"#e8ecf3", label:"Admin"   },
};

function RoleBadge({ role }:{ role:RoleId }) {
  const m=ROLE_SIMPLE[role];
  return <span className="text-[13px] px-1.5 py-0.5 rounded border" style={{ background:m.bg,color:m.color,borderColor:`${m.color}40`,fontFamily: "var(--font-sans)",fontWeight:700 }}>{m.label}</span>;
}

function PermCell({ v }:{ v:"✓"|"○"|"✗" }) {
  const c={"✓":{color:"#166534",bg:"#dcfce7"},"○":{color:"#92400e",bg:"#fef3c7"},"✗":{color:"#dc2626",bg:"#fee2e2"}}[v];
  return <td className="text-center py-2 px-3"><span className="text-[13px] px-2 py-0.5 rounded" style={{ background:c.bg,color:c.color,fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{v}</span></td>;
}

function SectionHeader({ id,icon:Icon,color,title,subtitle }:{ id:string;icon:typeof Trophy;color:string;title:string;subtitle:string }) {
  return (
    <div id={id} className="rounded-[12px] p-5 flex items-center gap-4 mb-5"
      style={{ background:`linear-gradient(135deg,${color},${color}cc)` }}>
      <div className="size-12 rounded-xl flex items-center justify-center shrink-0" style={{ background:"rgba(255,255,255,0.15)" }}>
        <Icon className="size-7 text-white"/>
      </div>
      <div>
        <h2 className="text-[18px] text-white leading-tight" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{title}</h2>
        <p className="text-[13px] mt-0.5" style={{ color:"rgba(255,255,255,0.75)",fontFamily: "var(--font-sans)" }}>{subtitle}</p>
      </div>
    </div>
  );
}

function WorkflowDiagram({ states }:{ states:WFState[] }) {
  if(!states.length) return null;
  return (
    <div className="overflow-x-auto pb-2 mb-4">
      <div className="flex items-center gap-0 min-w-max">
        {states.map((s,i)=>(
          <div key={s.id} className="flex items-center gap-0">
            <div className="flex flex-col items-center gap-1.5">
              <div className="size-2.5 rounded-full" style={{ background:s.color }}/>
              <div className="text-center px-3 py-2 rounded-[8px] border min-w-[90px]" style={{ background:"white",borderColor:`${s.color}50` }}>
                <div className="text-[13px]" style={{ color:s.color,fontFamily: "var(--font-sans)",fontWeight:700 }}>{s.label}</div>
                <div className="text-[13px] text-slate-700 mt-0.5 max-w-[90px] leading-tight">{s.desc}</div>
              </div>
            </div>
            {i<states.length-1&&<ArrowRight className="size-4 shrink-0 mx-1" style={{ color:"#d1d5db" }}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Module Section ── */
type ModTab="screens"|"workflow"|"fields"|"perms";
function ModuleSection({ mod }:{ mod:ModuleSpec }) {
  const [tab,setTab]=useState<ModTab>("screens");
  const [openSc,setOpenSc]=useState<string|null>(null);
  const TABS:[ModTab,string,typeof Layers][]=[["screens","Màn hình",Layers],["workflow","Luồng xử lý",GitBranch],["fields","Trường dữ liệu",Database],["perms","Phân quyền",Lock]];
  return (
    <section id={mod.id} className="mb-10">
      <SectionHeader id={`h-${mod.id}`} icon={mod.icon} color={mod.color} title={mod.title} subtitle={mod.desc}/>
      <div className="flex gap-1 border-b border-[#e2e8f0] mb-4">
        {TABS.map(([k,l,I])=>{const a=tab===k;return(
          <button key={k} onClick={()=>setTab(k)} className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] border-b-2 transition-all" style={{ borderColor:a?mod.color:"transparent",color:a?mod.color:"#635647",fontFamily: "var(--font-sans)",fontWeight:a?700:400,marginBottom:-1 }}>
            <I className="size-3.5"/>{l}
          </button>
        );})}
      </div>
      {tab==="screens"&&(
        <div className="space-y-2">
          {mod.screens.map(sc=>(
            <div key={sc.code} className="rounded-[8px] border border-[#e2e8f0] overflow-hidden">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f4f7fb] transition-colors" onClick={()=>setOpenSc(openSc===sc.code?null:sc.code)}>
                <code className="text-[13px] px-2 py-0.5 rounded shrink-0" style={{ background:mod.bg,color:mod.color,border:`1px solid ${mod.border}`,fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{sc.code}</code>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>{sc.title}</span>
                    {sc.roles.map(r=><RoleBadge key={r} role={r}/>)}
                  </div>
                  {openSc!==sc.code&&<p className="text-[13px] text-slate-700 mt-0.5 truncate">{sc.desc}</p>}
                </div>
                {openSc===sc.code?<ChevronDown className="size-4 shrink-0 text-slate-700"/>:<ChevronRight className="size-4 shrink-0 text-slate-700"/>}
              </button>
              {openSc===sc.code&&(
                <div className="border-t border-[#e2e8f0] px-4 py-3 grid grid-cols-2 gap-4" style={{ background:"#f4f7fb" }}>
                  <div>
                    <p className="text-[13px] text-slate-700 leading-relaxed mb-3">{sc.desc}</p>
                    <div className="flex flex-wrap gap-1 mb-3">{sc.roles.map(r=><RoleBadge key={r} role={r}/>)}</div>
                    {sc.uxNotes&&<div>
                      <div className="text-[13px] uppercase tracking-wider text-[#7c3aed] mb-1.5" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>UX Notes</div>
                      {sc.uxNotes.map((n,i)=><p key={i} className="text-[13px] text-[#7c3aed] flex gap-1.5 mb-1"><span>✦</span><span>{n}</span></p>)}
                    </div>}
                  </div>
                  <div>
                    <div className="text-[13px] uppercase tracking-wider text-slate-700 mb-2" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Actions & Chức năng</div>
                    <ul className="space-y-1">{sc.actions.map((a,i)=><li key={i} className="flex items-start gap-2 text-[13px] text-slate-700"><span style={{ color:mod.color }}>▸</span>{a}</li>)}</ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {tab==="workflow"&&(
        <>
          {mod.workflow.length>0?(<>
            <WorkflowDiagram states={mod.workflow}/>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {mod.workflow.map(s=>(
                <div key={s.id} className="flex items-start gap-2 p-2.5 rounded-[6px] border" style={{ borderColor:`${s.color}40` }}>
                  <div className="size-2.5 rounded-full shrink-0 mt-1" style={{ background:s.color }}/>
                  <div><div className="text-[13px]" style={{ color:s.color,fontFamily: "var(--font-sans)",fontWeight:700 }}>{s.label}</div><div className="text-[13px] text-slate-700">{s.desc}</div></div>
                </div>
              ))}
            </div>
          </>):<div className="text-center py-8 text-slate-700 text-[13px]">Module này không có workflow state riêng.</div>}
        </>
      )}
      {tab==="fields"&&(
        <div className="overflow-x-auto rounded-[8px] border border-[#e2e8f0]">
          <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <thead><tr style={{ background:"#f4f7fb" }}>
              {["Trường dữ liệu","Kiểu","Bắt buộc","Validation / Ghi chú"].map(h=><th key={h} className="text-left px-3 py-2 text-slate-900" style={{ fontWeight:700 }}>{h}</th>)}
            </tr></thead>
            <tbody>{mod.fields.map((f,i)=>(
              <tr key={i} className="border-t border-[#e2e8f0]" style={{ background:i%2===0?"white":"#f4f7fb" }}>
                <td className="px-3 py-2 text-slate-900" style={{ fontWeight:600 }}>{f.name}</td>
                <td className="px-3 py-2"><code className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#f4f7fb",color:"#5a5040",fontFamily:"JetBrains Mono, monospace" }}>{f.type}</code></td>
                <td className="text-center px-3 py-2">{f.req?<CheckCircle2 className="size-4 inline" style={{ color:"#166534" }}/>:<Circle className="size-4 inline" style={{ color:"#d1d5db" }}/>}</td>
                <td className="px-3 py-2 text-slate-700">{f.note}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {tab==="perms"&&(
        <div className="overflow-x-auto rounded-[8px] border border-[#e2e8f0]">
          <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <thead><tr style={{ background:"linear-gradient(to right,#0b1426,#1a2744)" }}>
              <th className="text-left px-4 py-2.5 text-white" style={{ fontWeight:700 }}>Hành động</th>
              {(["cá nhân","lãnh đạo đơn vị","hội đồng","lãnh đạo cấp cao","quản trị hệ thống"] as RoleId[]).map(r=><th key={r} className="text-center px-3 py-2.5"><RoleBadge role={r}/></th>)}
            </tr></thead>
            <tbody>{mod.perms.map((p,i)=>(
              <tr key={i} className="border-t border-[#e2e8f0]" style={{ background:i%2===0?"white":"#f4f7fb" }}>
                <td className="px-4 py-2 text-slate-900" style={{ fontWeight:500 }}>{p.action}</td>
                <PermCell v={p.user}/><PermCell v={p.manager}/><PermCell v={p.council}/><PermCell v={p.leader}/><PermCell v={p.admin}/>
              </tr>
            ))}</tbody>
          </table>
          <div className="px-4 py-2 flex gap-4 border-t border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
            {(["✓ Đầy đủ","○ Hạn chế","✗ Không có"] as const).map(s=><span key={s} className="text-[13px] text-slate-700">{s}</span>)}
          </div>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UX INTERACTION PATTERNS — LIVE DEMOS
═══════════════════════════════════════════════════════════════ */
function ButtonDemo() {
  const [loadingId,setLoadingId]=useState<string|null>(null);
  const simulate=(id:string)=>{ setLoadingId(id); setTimeout(()=>setLoadingId(null),1800); };
  const VARIANTS=[
    { id:"primary",  label:"Primary",   bg:"#1C5FBE", hoverBg:"#1752a8", text:"white" },
    { id:"secondary",label:"Secondary", bg:"transparent", border:"#1C5FBE", text:"#1C5FBE" },
    { id:"ghost",    label:"Ghost",     bg:"transparent", border:"#e2e8f0", text:"#5a5040" },
    { id:"dark",     label:"Dark",      bg:"#0b1426", hoverBg:"#1a2744", text:"white" },
    { id:"danger",   label:"Danger",    bg:"#c8102e", hoverBg:"#991b1b", text:"white" },
  ];
  return (
    <div className="p-4 rounded-[10px] border border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
      <p className="text-[13px] text-slate-700 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Click để thấy loading state (1.8s). Tất cả nút có height 40px, border-radius 8px.</p>
      <div className="flex flex-wrap gap-3">
        {VARIANTS.map(v=>{
          const isLoading=loadingId===v.id;
          return (
            <button key={v.id} onClick={()=>simulate(v.id)} disabled={isLoading}
              className="flex items-center gap-2 px-4 py-0 border rounded-[8px] transition-all text-[13px] cursor-pointer"
              style={{ height:40,fontFamily: "var(--font-sans)",fontWeight:600,background:v.bg||"transparent",color:v.text,borderColor:v.border||"transparent",opacity:isLoading?0.8:1 }}>
              {isLoading?<Loader2 className="size-4 animate-spin"/>:<span>{v.label}</span>}
              {isLoading&&<span className="text-[13px]">...</span>}
            </button>
          );
        })}
      </div>
      <p className="text-[13px] text-slate-700 mt-3" style={{ fontFamily: "var(--font-sans)" }}>States: Default · Hover (darken 8%) · Active (darken 15%) · Loading (spinner + opacity 0.8) · Disabled (opacity 0.4)</p>
    </div>
  );
}

function FormValidationDemo() {
  const [val,setVal]=useState(""); const [touched,setTouched]=useState(false);
  const err=touched&&val.length<5?"Tên phải có ít nhất 5 ký tự":touched&&val.length>50?"Tên không quá 50 ký tự":"";
  const ok=touched&&!err&&val.length>0;
  return (
    <div className="p-4 rounded-[10px] border border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
      <p className="text-[13px] text-slate-700 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Validation inline realtime — blur để trigger. Input height 40px.</p>
      <div className="space-y-1.5 max-w-xs">
        <label className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>
          Tên phong trào <span className="text-[#c8102e]">*</span>
        </label>
        <div className="relative">
          <input value={val} onChange={e=>setVal(e.target.value)} onBlur={()=>setTouched(true)}
            className="w-full px-3 border rounded-[8px] text-[13px] outline-none transition-all"
            style={{ height:40,fontFamily: "var(--font-sans)",borderColor:err?"#fca5a5":ok?"#86efac":"#d1d5db",background:"white",boxShadow:err?"0 0 0 2px #fee2e222":ok?"0 0 0 2px #dcfce722":"none" }}
            placeholder="Nhập tên phong trào thi đua..."/>
          {ok&&<CheckCircle2 className="size-4 absolute right-3 top-1/2 -translate-y-1/2" style={{ color:"#166534" }}/>}
          {err&&<AlertCircle className="size-4 absolute right-3 top-1/2 -translate-y-1/2" style={{ color:"#c8102e" }}/>}
        </div>
        {err&&<p className="text-[13px] flex items-center gap-1" style={{ color:"#c8102e",fontFamily: "var(--font-sans)" }}><AlertCircle className="size-3"/>{err}</p>}
        {ok&&<p className="text-[13px] flex items-center gap-1" style={{ color:"#166534",fontFamily: "var(--font-sans)" }}><CheckCircle2 className="size-3"/>Hợp lệ</p>}
        <p className="text-[13px] text-slate-700">{val.length}/50 ký tự</p>
      </div>
    </div>
  );
}

function LoadingStatesDemo() {
  const [mode,setMode]=useState<"skeleton"|"spinner"|"progress"|"none">("none");
  const [prog,setProg]=useState(0);
  useEffect(()=>{
    if(mode==="progress"){ const t=setInterval(()=>setProg(p=>{ if(p>=100){clearInterval(t);setMode("none");return 0;} return p+8; }),120); return ()=>clearInterval(t); }
  },[mode]);
  return (
    <div className="p-4 rounded-[10px] border border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["skeleton","spinner","progress"] as const).map(m=>(
          <button key={m} onClick={()=>{ setMode(m); if(m==="progress")setProg(0); }}
            className="px-3 py-1.5 rounded-[6px] border text-[13px] transition-all"
            style={{ background:mode===m?"#0b1426":"white",color:mode===m?"white":"#5a5040",borderColor:mode===m?"#0b1426":"#e2e8f0",fontFamily: "var(--font-sans)" }}>
            {m==="skeleton"?"Skeleton Loader":m==="spinner"?"Spinner":m==="progress"?"Progress Bar":""}
          </button>
        ))}
      </div>
      {mode==="skeleton"&&(
        <div className="space-y-2">
          {[1,2,3].map(i=>(
            <div key={i} className="flex gap-3 items-center">
              <div className="size-8 rounded-full bg-[#e2e8f0] animate-pulse shrink-0"/>
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded bg-[#e2e8f0] animate-pulse" style={{ width:`${60+i*15}%` }}/>
                <div className="h-2.5 rounded bg-[#e2e8f0] animate-pulse" style={{ width:`${40+i*10}%` }}/>
              </div>
            </div>
          ))}
        </div>
      )}
      {mode==="spinner"&&(
        <div className="flex items-center justify-center gap-3 py-4">
          <Loader2 className="size-6 animate-spin" style={{ color:"#1C5FBE" }}/>
          <span className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>Đang tải dữ liệu...</span>
        </div>
      )}
      {mode==="progress"&&(
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>
            <span>Đang xử lý ký số...</span><span style={{ fontFamily:"JetBrains Mono, monospace" }}>{prog}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background:"#e2e8f0" }}>
            <div className="h-full rounded-full transition-all" style={{ width:`${prog}%`,background:"linear-gradient(to right,#1C5FBE,#166534)" }}/>
          </div>
        </div>
      )}
      {mode==="none"&&<p className="text-[13px] text-slate-700 text-center py-4" style={{ fontFamily: "var(--font-sans)" }}>Click button để xem loading pattern</p>}
    </div>
  );
}

function ToastDemo() {
  const [toasts,setToasts]=useState<{id:number;type:"success"|"error"|"warning"|"info";msg:string}[]>([]);
  const add=(type:"success"|"error"|"warning"|"info")=>{
    const id=Date.now(); const msgs={"success":"Ký số hồ sơ thành công!","error":"Lỗi: Chứng thư số đã hết hạn","warning":"SLA còn 1 ngày — Cần xử lý gấp","info":"Hồ sơ đã được gửi lên Hội đồng"};
    setToasts(t=>[...t.slice(-2),{id,type,msg:msgs[type]}]);
    if(type!=="error") setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  };
  const cfgs={"success":{bg:"#dcfce7",border:"#86efac",color:"#166534",icon:CheckCircle2},"error":{bg:"#fee2e2",border:"#fca5a5",color:"#991b1b",icon:XCircle},"warning":{bg:"#fef3c7",border:"#fcd34d",color:"#92400e",icon:AlertTriangle},"info":{bg:"#ddeafc",border:"#93c5fd",color:"#1C5FBE",icon:Info}};
  return (
    <div className="p-4 rounded-[10px] border border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
      <p className="text-[13px] text-slate-700 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Max 3 toasts. Error không auto-dismiss. Click ✕ để đóng.</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["success","error","warning","info"] as const).map(t=>{
          const c=cfgs[t];
          return <button key={t} onClick={()=>add(t)} className="px-3 py-1.5 rounded-[6px] border text-[13px]" style={{ background:c.bg,color:c.color,borderColor:c.border,fontFamily: "var(--font-sans)",fontWeight:600 }}>{t}</button>;
        })}
      </div>
      <div className="space-y-2">
        {toasts.map(t=>{
          const c=cfgs[t.type]; const Icon=c.icon;
          return (
            <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] border" style={{ background:c.bg,borderColor:c.border }}>
              <Icon className="size-4 shrink-0" style={{ color:c.color }}/>
              <span className="flex-1 text-[13px]" style={{ color:c.color,fontFamily: "var(--font-sans)" }}>{t.msg}</span>
              <button onClick={()=>setToasts(ts=>ts.filter(x=>x.id!==t.id))} className="text-[14px] leading-none" style={{ color:c.color }}>✕</button>
            </div>
          );
        })}
        {toasts.length===0&&<p className="text-[13px] text-slate-700 text-center py-2" style={{ fontFamily: "var(--font-sans)" }}>Chưa có toast nào</p>}
      </div>
    </div>
  );
}

function EmptyStateDemo() {
  const STATES=[
    { icon:"📋", title:"Chưa có hồ sơ nào", desc:"Bắt đầu bằng cách tạo hồ sơ đề nghị khen thưởng đầu tiên", btn:"Tạo hồ sơ mới" },
    { icon:"🔍", title:"Không tìm thấy kết quả", desc:"Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác", btn:"Xóa bộ lọc" },
    { icon:"✅", title:"Tất cả đã xử lý xong!", desc:"Không còn hồ sơ nào trong queue. Làm tốt lắm!", btn:null },
  ];
  const [idx,setIdx]=useState(0);
  const s=STATES[idx];
  return (
    <div className="p-4 rounded-[10px] border border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
      <div className="flex gap-2 mb-4">
        {STATES.map((_,i)=><button key={i} onClick={()=>setIdx(i)} className="text-[13px] px-2.5 py-1 rounded border transition-all" style={{ background:idx===i?"#0b1426":"white",color:idx===i?"white":"#5a5040",borderColor:idx===i?"#0b1426":"#e2e8f0",fontFamily: "var(--font-sans)" }}>State {i+1}</button>)}
      </div>
      <div className="flex flex-col items-center justify-center py-6 gap-3">
        <div className="text-[40px]">{s.icon}</div>
        <h4 className="text-[14px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{s.title}</h4>
        <p className="text-[13px] text-slate-700 text-center max-w-xs">{s.desc}</p>
        {s.btn&&<button className="px-4 py-2 rounded-[8px] text-[13px] text-white mt-1" style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>{s.btn}</button>}
      </div>
    </div>
  );
}

function SLACountdownDemo() {
  const [secs,setSecs]=useState(3600*47+1800);
  useEffect(()=>{ const t=setInterval(()=>setSecs(s=>s>0?s-1:0),1000); return ()=>clearInterval(t); },[]);
  const h=Math.floor(secs/3600), m=Math.floor((secs%3600)/60), s=secs%60;
  const pct=secs/(3600*72)*100;
  const color=pct>50?"#166534":pct>25?"#b45309":"#c8102e";
  const bg=pct>50?"#dcfce7":pct>25?"#fef3c7":"#fee2e2";
  return (
    <div className="p-4 rounded-[10px] border border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
      <p className="text-[13px] text-slate-700 mb-3" style={{ fontFamily: "var(--font-sans)" }}>SLA countdown realtime — thay đổi màu theo mức độ còn lại (xanh→vàng→đỏ).</p>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background:"#e2e8f0" }}>
          <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`,background:color }}/>
        </div>
        <span className="px-3 py-1 rounded text-[13px]" style={{ background:bg,color,fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>
          {String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
        </span>
      </div>
      <p className="text-[13px] text-slate-700 mt-2" style={{ fontFamily: "var(--font-sans)" }}>
        {pct>50?"✓ SLA bình thường":pct>25?"⚠ Sắp đến hạn — cần xử lý":"✗ KHẨN CẤP — vi phạm SLA sắp xảy ra"}
      </p>
    </div>
  );
}

function UXPatternsSection() {
  const PATTERNS=[
    { id:"buttons",  title:"Button States & Variants", icon:Zap,       desc:"5 variants × loading/disabled states. H=40px, radius=8px.", demo:<ButtonDemo/> },
    { id:"form",     title:"Form Validation Pattern",  icon:Edit3,     desc:"Inline real-time validation: border color + icon + message.", demo:<FormValidationDemo/> },
    { id:"loading",  title:"Loading States",           icon:Loader2,   desc:"3 patterns: Skeleton (list), Spinner (action), Progress (signing).", demo:<LoadingStatesDemo/> },
    { id:"toast",    title:"Toast Notifications",      icon:Bell,      desc:"4 loại: success/error/warning/info. Max 3 cùng lúc. Error không auto-dismiss.", demo:<ToastDemo/> },
    { id:"empty",    title:"Empty State Patterns",     icon:Eye,       desc:"3 variants: no data / no results / all done. Với CTA button.", demo:<EmptyStateDemo/> },
    { id:"sla",      title:"SLA Countdown Widget",     icon:Clock,     desc:"Realtime countdown với color-coding theo mức độ ưu tiên.", demo:<SLACountdownDemo/> },
  ];
  const [open,setOpen]=useState<string|null>(null);
  return (
    <section id="ux-patterns" className="mb-10">
      <SectionHeader id="h-ux-patterns" icon={Sparkles} color="#7c3aed" title="UX Interaction Patterns" subtitle="Live interactive demos — click để xem từng pattern hoạt động thực tế"/>
      <div className="grid grid-cols-1 gap-3">
        {PATTERNS.map(p=>{
          const Icon=p.icon; const isOpen=open===p.id;
          return (
            <div key={p.id} className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#f4f7fb] transition-colors" onClick={()=>setOpen(isOpen?null:p.id)}>
                <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:"#f5f3ff" }}>
                  <Icon className="size-4" style={{ color:"#7c3aed" }}/>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{p.title}</div>
                  <div className="text-[13px] text-slate-700">{p.desc}</div>
                </div>
                {isOpen?<ChevronDown className="size-4 text-[#7c3aed]"/>:<ChevronRight className="size-4 text-slate-700"/>}
              </button>
              {isOpen&&<div className="border-t border-[#e2e8f0] p-4">{p.demo}</div>}
            </div>
          );
        })}
      </div>
      {/* Conditional UI table */}
      <div className="mt-6">
        <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Conditional UI — Hiển thị theo Context</h3>
        <div className="overflow-x-auto rounded-[8px] border border-[#e2e8f0]">
          <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <thead><tr style={{ background:"linear-gradient(to right,#7c3aed,#6d28d9)" }}>
              {["Điều kiện","UI Element","Hiển thị / Ẩn","Trạng thái"].map(h=><th key={h} className="text-left px-3 py-2.5 text-white" style={{ fontWeight:700 }}>{h}</th>)}
            </tr></thead>
            <tbody>{[
              ["role='user'","Nút 'Ký số'","Ẩn","N/A"],
              ["role='leader' & hồ sơ status='pending_sign'","Nút 'Ký số'","Hiển thị","Enabled"],
              ["hồ sơ status ≠ 'draft'","Nút 'Sửa hồ sơ'","Ẩn","N/A"],
              ["COI detected","Nút 'Bỏ phiếu' trong phiên họp","Ẩn (disabled)","Disabled"],
              ["AI confidence < 60%","AI Suggest Panel","Hiển thị warning badge","Warning"],
              ["SLA remaining < 24h","SLA badge","Màu đỏ + pulse animation","Critical"],
              ["File upload > 10MB","Upload button submit","Disabled","Error message"],
              ["Form có trường lỗi","Submit button","Disabled","Disabled"],
              ["Đợt LYK đã đóng","Form gửi ý kiến","Ẩn","N/A"],
              ["Chứng thư hết hạn","Nút ký CA","Disabled + tooltip","Error"],
            ].map((r,i)=>(
              <tr key={i} className="border-t border-[#e2e8f0]" style={{ background:i%2===0?"white":"#f4f7fb" }}>
                {r.map((c,j)=><td key={j} className="px-3 py-2 text-slate-700">{j===0?<code className="text-[13px]" style={{ fontFamily:"JetBrains Mono, monospace",color:"#7c3aed" }}>{c}</code>:c}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USER FLOWS SECTION
═══════════════════════════════════════════════════════════════ */
const ROLE_FULL: Record<RoleId2,{color:string;bg:string;label:string;icon:typeof User}> = {
  user:    { color:"#1C5FBE", bg:"#ddeafc", label:"User — Cá nhân / Tập thể",  icon:User     },
  manager: { color:"#166534", bg:"#dcfce7", label:"Manager — Lãnh đạo Đơn vị", icon:Users    },
  council: { color:"#7c3aed", bg:"#f5f3ff", label:"Council — Thành viên HĐ",   icon:Gavel    },
  leader:  { color:"#92400e", bg:"#fef3c7", label:"Leader — Lãnh đạo Cấp cao", icon:Crown    },
  admin:   { color:"#0b1426", bg:"#e8ecf3", label:"Admin — Quản trị Hệ thống", icon:Settings },
};
function UserFlowsSection() {
  const [sel,setSel]=useState<RoleId2>("cá nhân");
  const flow=ROLE_FLOWS.find(f=>f.role===sel)!;
  const meta=ROLE_FULL[sel]; const Icon=meta.icon;
  return (
    <section id="user-flows" className="mb-10">
      <SectionHeader id="h-user-flows" icon={GitBranch} color="#0f172a" title="User Flows theo Vai trò" subtitle="Hành trình đầy đủ mỗi role — từ login đến hoàn thành nhiệm vụ chính"/>
      <div className="flex gap-2 mb-5 flex-wrap">
        {(Object.keys(ROLE_FULL) as RoleId2[]).map(r=>{
          const m=ROLE_FULL[r]; const RI=m.icon; const a=sel===r;
          return <button key={r} onClick={()=>setSel(r)} className="flex items-center gap-2 px-3 py-2 rounded-[8px] border text-[13px] transition-all" style={{ background:a?m.bg:"white",borderColor:a?m.color:"#e2e8f0",color:a?m.color:"#635647",fontFamily: "var(--font-sans)",fontWeight:a?700:400 }}>
            <RI className="size-3.5"/>{m.label.split("—")[0].trim()}
          </button>;
        })}
      </div>
      <div className="p-4 rounded-[10px] border" style={{ background:meta.bg,borderColor:`${meta.color}40` }}>
        <div className="flex items-center gap-2 mb-4">
          <Icon className="size-5" style={{ color:meta.color }}/>
          <span className="text-[14px]" style={{ color:meta.color,fontFamily: "var(--font-sans)",fontWeight:700 }}>{meta.label}</span>
          <span className="text-[13px] text-slate-700">— {flow.steps.length} bước chính</span>
        </div>
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-0.5" style={{ background:`${meta.color}30` }}/>
          <div className="space-y-3">
            {flow.steps.map((step)=>(
              <div key={step.step} className="flex items-start gap-4">
                <div className="size-10 rounded-full flex items-center justify-center shrink-0 z-10" style={{ background:meta.color }}>
                  <span className="text-[13px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{step.step}</span>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{step.label}</span>
                    <code className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"rgba(0,0,0,0.08)",color:meta.color,fontFamily:"JetBrains Mono, monospace" }}>{step.screen}</code>
                    {step.condition&&<span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#fef3c7",color:"#92400e",border:"1px solid #fcd34d",fontFamily: "var(--font-sans)" }}>if: {step.condition}</span>}
                  </div>
                  <p className="text-[13px] text-slate-700 mb-2">{step.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.actions.map((a,ai)=><span key={ai} className="text-[13px] px-2 py-0.5 rounded" style={{ background:"rgba(255,255,255,0.7)",color:"#5a5040",border:"1px solid rgba(0,0,0,0.1)",fontFamily: "var(--font-sans)" }}>{a}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCALABILITY SECTION
═══════════════════════════════════════════════════════════════ */
function ScalabilitySection() {
  const ARCH=[
    { layer:"Load Balancer", tech:"Nginx / AWS ALB", notes:"Sticky session, SSL termination, DDoS protection", icon:Globe },
    { layer:"API Gateway",   tech:"Kong / AWS API Gateway", notes:"Rate limiting 100req/min/user, JWT validation, request logging", icon:Server },
    { layer:"App Servers",   tech:"Node.js NestJS (Horizontal)", notes:"Stateless, auto-scale 2–20 instances, health check /api/health", icon:Cpu },
    { layer:"Database",      tech:"PostgreSQL 16 (Primary + 2 Read Replicas)", notes:"Row-level security per org_id, partitioning theo năm, connection pool PgBouncer", icon:Database },
    { layer:"Cache",         tech:"Redis Cluster", notes:"Session store, hot data (TTL 30min), pub/sub cho realtime events", icon:Zap },
    { layer:"Queue",         tech:"BullMQ + Redis", notes:"Background jobs: notification, PDF gen, CA signing. Retry 3× exponential backoff", icon:Activity },
    { layer:"File Storage",  tech:"MinIO / AWS S3 + CloudFront CDN", notes:"Signed URL (1h expire), AES-256 at rest, versioning enabled", icon:HardDrive },
    { layer:"AI Engine",     tech:"PhoBERT (Vietnamese NLP) + pgvector", notes:"Embedding hồ sơ, similarity search, GPT-4 fallback cho complex queries", icon:Sparkles },
    { layer:"Monitoring",    tech:"Prometheus + Grafana + Sentry", notes:"Uptime 99.9%, alert Slack khi error rate > 1%, distributed tracing", icon:BarChart2 },
    { layer:"CDN",           tech:"CloudFront / Cloudflare", notes:"Static assets, PDF delivery, global edge caching < 50ms", icon:Globe },
  ];
  const PERF=[
    { metric:"API response time (p50)",  target:"< 200ms",  desc:"Measure at API Gateway" },
    { metric:"API response time (p99)",  target:"< 1s",     desc:"Excluding CA signing calls" },
    { metric:"CA signing time",          target:"< 5s",     desc:"Including TSA timestamp" },
    { metric:"Page load (FCP)",          target:"< 1.5s",   desc:"3G connection, gzip enabled" },
    { metric:"Concurrent users",         target:"500+",     desc:"Without degradation" },
    { metric:"Database query (p95)",     target:"< 100ms",  desc:"With proper indexes" },
    { metric:"File upload (10MB)",       target:"< 10s",    desc:"On 10Mbps connection" },
    { metric:"Uptime SLA",               target:"99.9%",    desc:"3.65 days/year max downtime" },
    { metric:"PDF generation",           target:"< 3s",     desc:"A4 single page document" },
    { metric:"Search response",          target:"< 500ms",  desc:"Full-text search over 100K records" },
  ];
  return (
    <section id="scalability" className="mb-10">
      <SectionHeader id="h-scalability" icon={Target} color="#1a2744" title="Kiến trúc & Khả năng Mở rộng" subtitle="Multi-tenant, horizontal scaling, 500+ concurrent users, 99.9% uptime SLA"/>
      <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Technology Stack & Architecture Layers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
        {ARCH.map((a,i)=>{
          const I=a.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-[8px] border border-[#e2e8f0]" style={{ background:"white" }}>
              <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:"#f4f7fb" }}>
                <I className="size-4" style={{ color:"#1C5FBE" }}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{a.layer}</span>
                  <code className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#ddeafc",color:"#1C5FBE",fontFamily:"JetBrains Mono, monospace" }}>{a.tech}</code>
                </div>
                <p className="text-[13px] text-slate-700">{a.notes}</p>
              </div>
            </div>
          );
        })}
      </div>
      <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Performance Targets</h3>
      <div className="overflow-x-auto rounded-[8px] border border-[#e2e8f0]">
        <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
          <thead><tr style={{ background:"linear-gradient(to right,#0b1426,#1a2744)" }}>
            {["Metric","Target","Ghi chú đo lường"].map(h=><th key={h} className="text-left px-4 py-2.5 text-white" style={{ fontWeight:700 }}>{h}</th>)}
          </tr></thead>
          <tbody>{PERF.map((p,i)=>(
            <tr key={i} className="border-t border-[#e2e8f0]" style={{ background:i%2===0?"white":"#f4f7fb" }}>
              <td className="px-4 py-2.5 text-slate-900" style={{ fontWeight:600 }}>{p.metric}</td>
              <td className="px-4 py-2.5"><span className="text-[13px] px-2 py-0.5 rounded" style={{ background:"#dcfce7",color:"#166534",fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{p.target}</span></td>
              <td className="px-4 py-2.5 text-slate-700">{p.desc}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BUSINESS RULES SECTION
═══════════════════════════════════════════════════════════════ */
function BusinessRulesSection() {
  const [filter,setFilter]=useState<"all"|"P0"|"P1"|string>("all");
  const MODS=["all",...Array.from(new Set(BUSINESS_RULES.map(r=>r.module)))];
  const visible=BUSINESS_RULES.filter(r=>(filter==="all"||r.prio===filter||r.module===filter));
  return (
    <section id="biz-rules" className="mb-10">
      <SectionHeader id="h-biz-rules" icon={Shield} color="#1a2744" title="Business Rules & Ràng buộc Nghiệp vụ" subtitle={`${BUSINESS_RULES.length} rules — phân loại theo module & mức độ ưu tiên`}/>
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all","P0","P1",...["Đề nghị KT","Hội đồng","Chấm điểm","Ký số","Lấy ý kiến","Quyết định","Hệ thống","UX","Scalability","Phong trào"]].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className="px-3 py-1.5 rounded-[6px] border text-[13px] transition-all" style={{ background:filter===f?"#0b1426":"white",color:filter===f?"white":"#5a5040",borderColor:filter===f?"#0b1426":"#e2e8f0",fontFamily: "var(--font-sans)",fontWeight:filter===f?700:400 }}>
            {f==="all"?`Tất cả (${BUSINESS_RULES.length})`:f==="P0"?`P0 Bắt buộc (${BUSINESS_RULES.filter(r=>r.prio==="P0").length})`:f==="P1"?`P1 Quan trọng (${BUSINESS_RULES.filter(r=>r.prio==="P1").length})`:f}
          </button>
        ))}
      </div>
      <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
        <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
          <thead><tr style={{ background:"linear-gradient(to right,#0b1426,#1a2744)" }}>
            <th className="text-left px-3 py-2.5 text-white" style={{ fontWeight:700,width:75 }}>Mã</th>
            <th className="text-left px-3 py-2.5 text-white" style={{ fontWeight:700 }}>Quy tắc</th>
            <th className="text-left px-3 py-2.5 text-white" style={{ fontWeight:700,width:120 }}>Module</th>
            <th className="text-center px-3 py-2.5 text-white" style={{ fontWeight:700,width:70 }}>Mức</th>
            <th className="text-left px-3 py-2.5 text-white" style={{ fontWeight:700,width:140 }}>Căn cứ</th>
          </tr></thead>
          <tbody>{visible.map((r,i)=>(
            <tr key={r.id} className="border-t border-[#e2e8f0]" style={{ background:i%2===0?"white":"#f4f7fb" }}>
              <td className="px-3 py-2.5"><code className="text-[13px]" style={{ fontFamily:"JetBrains Mono, monospace",color:"#1C5FBE" }}>{r.id}</code></td>
              <td className="px-3 py-2.5 text-slate-900 leading-snug">{r.rule}</td>
              <td className="px-3 py-2.5"><span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#f4f7fb",color:"#5a5040" }}>{r.module}</span></td>
              <td className="text-center px-3 py-2.5"><span className="text-[13px] px-1.5 py-0.5 rounded border" style={{ background:r.prio==="P0"?"#fee2e2":"#fef3c7",color:r.prio==="P0"?"#991b1b":"#92400e",borderColor:r.prio==="P0"?"#fca5a5":"#fcd34d",fontWeight:700 }}>{r.prio}</span></td>
              <td className="px-3 py-2.5 text-slate-700 text-[13px]">{r.legal||<span className="text-[#d1d5db]">—</span>}</td>
            </tr>
          ))}</tbody>
        </table>
        {visible.length===0&&<div className="text-center py-6 text-slate-700 text-[13px]">Không có rules nào cho filter này</div>}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM SECTION
═══════════════════════════════════════════════════════════════ */
function DesignSystemSection() {
  const COLORS=[
    { name:"Navy Primary",hex:"#0b1426",role:"Background, headings chính" },
    { name:"Blue Interactive",hex:"#1C5FBE",role:"Buttons, links, interactive" },
    { name:"Đỏ Son",hex:"#c8102e",role:"Alerts P0, destructive actions" },
    { name:"Vàng HHC",hex:"#8a6400",role:"Gold accents, awards, premium" },
    { name:"Xanh Lá",hex:"#166534",role:"Success, done, positive" },
    { name:"Cam Hổ Phách",hex:"#b45309",role:"Warning, in-progress, SLA" },
    { name:"Tím HĐ",hex:"#7c3aed",role:"Council, formal proceedings" },
    { name:"Xanh Cyan",hex:"#0891b2",role:"Info, secondary actions" },
    { name:"Paper",hex:"#ffffff",role:"Page background warm" },
    { name:"Border",hex:"#e2e8f0",role:"Borders, dividers" },
  ];
  const SPACING=["4px (xs)","8px (sm)","12px (md)","16px (base)","20px (lg)","24px (xl)","32px (2xl)","48px (3xl)"];
  const RADII=["4px (chip)","6px (tag)","8px (card/button)","10px (card)","12px (modal panel)","16px (hero card)","24px (feature card)","9999px (pill/badge)"];
  const COMPONENTS=[
    { name:"DsButton",     v:"primary|secondary|ghost|dark|danger", h:"40px", note:"5 variants, 4 sizes (sm/md/lg/xl)" },
    { name:"DsInput",      v:"text|select|date|file|rich-text",     h:"40px", note:"Inline validation, floating label option" },
    { name:"StatusBadge",  v:"done|in_progress|planned|blocked",    h:"24px", note:"Icon + label, rounded-full" },
    { name:"PriorityPill", v:"P0|P1|P2|P3",                        h:"20px", note:"Color-coded, 10px, border" },
    { name:"DataTable",    v:"default|compact|striped",             h:"auto", note:"Sort/filter/pagination/batch-select" },
    { name:"Modal",        v:"sm(400)|md(600)|lg(800)|xl(full)",    h:"auto", note:"Backdrop blur, ESC close, trap focus" },
    { name:"Toast",        v:"success|error|warning|info",          h:"48px", note:"Max 3, auto-dismiss 4s, error=manual" },
    { name:"Stepper",      v:"horizontal|vertical",                 h:"auto", note:"Step number+label+description" },
    { name:"WorkflowBadge",v:"per-module-states",                   h:"24px", note:"Dot + label, colored per state" },
    { name:"ProgressRing", v:"sm(32)|md(48)|lg(64)",                h:"auto", note:"SVG animated, strokeLinecap round" },
    { name:"FileUploader", v:"single|multi|drag-drop",              h:"120px",note:"MIME validate, progress bar, preview" },
    { name:"SLACountdown", v:"badge|bar|full",                      h:"auto", note:"Color: green>yellow>red auto-switch" },
    { name:"ApprovalPanel",v:"approve|reject|return",               h:"auto", note:"Sticky bottom bar in detail pages" },
    { name:"AuditTimeline",v:"compact|detailed",                    h:"auto", note:"Chronological, diff-view expandable" },
  ];
  return (
    <section id="design-sys" className="mb-10">
      <SectionHeader id="h-design-sys" icon={Palette} color="#8a6400" title="Design System" subtitle="Tokens · Typography · Spacing · Components — áp dụng xuyên suốt toàn bộ nền tảng VPTU Đồng Nai"/>
      <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Color Tokens</h3>
      <div className="grid grid-cols-5 gap-2 mb-6">
        {COLORS.map(c=>(
          <div key={c.hex} className="rounded-[8px] border border-[#e2e8f0] overflow-hidden">
            <div className="h-8" style={{ background:c.hex }}/>
            <div className="p-2">
              <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{c.name}</div>
              <code className="text-[13px] text-slate-700" style={{ fontFamily:"JetBrains Mono, monospace" }}>{c.hex}</code>
              <div className="text-[13px] text-slate-700 mt-0.5">{c.role}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Spacing Scale</h3>
          <div className="space-y-1.5">
            {SPACING.map((s,i)=>(
              <div key={s} className="flex items-center gap-3">
                <div className="rounded shrink-0" style={{ width:(i+1)*8,height:8,background:"#1C5FBE" }}/>
                <code className="text-[13px]" style={{ fontFamily:"JetBrains Mono, monospace",color:"#5a5040" }}>{s}</code>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Border Radius Scale</h3>
          <div className="space-y-1.5">
            {RADII.map((r,i)=>(
              <div key={r} className="flex items-center gap-3">
                <div className="size-7 border-2 shrink-0" style={{ borderColor:"#1C5FBE",borderRadius:r.split("px")[0]+"px" }}/>
                <code className="text-[13px]" style={{ fontFamily:"JetBrains Mono, monospace",color:"#5a5040" }}>{r}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
      <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Component Library ({COMPONENTS.length} components)</h3>
      <div className="grid grid-cols-2 gap-2">
        {COMPONENTS.map((c,i)=>(
          <div key={i} className="rounded-[8px] border border-[#e2e8f0] p-3">
            <div className="flex items-start gap-2">
              <code className="text-[13px] px-2 py-0.5 rounded shrink-0 mt-0.5" style={{ background:"#f4f7fb",color:"#0b1426",fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{c.name}</code>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1 mb-0.5">
                  {c.v.split("|").map(v=><span key={v} className="text-[13px] px-1 py-0.5 rounded" style={{ background:"#ddeafc",color:"#1C5FBE",fontFamily: "var(--font-sans)" }}>{v}</span>)}
                </div>
                <div className="text-[13px] text-slate-700">H: {c.h} · {c.note}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW SECTION
═══════════════════════════════════════════════════════════════ */
function OverviewSection() {
  const totalScreens=MODULES.reduce((s,m)=>s+m.screens.length,0);
  const totalFields=MODULES.reduce((s,m)=>s+m.fields.length,0);
  return (
    <section id="overview" className="mb-10">
      <div id="h-overview" className="rounded-[12px] p-6 mb-5" style={{ background:"linear-gradient(135deg,#0b1426,#1a2744)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="size-14 rounded-xl flex items-center justify-center" style={{ background:"rgba(255,255,255,0.12)" }}>
            <svg viewBox="0 0 24 24" className="size-8" fill="#8a6400"><path d="M12 2l2.39 6.95H22l-6.2 4.5 2.4 7.05L12 16l-6.2 4.5 2.4-7.05L2 8.95h7.61z"/></svg>
          </div>
          <div>
            <h1 className="text-[24px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>
              Nền tảng <span style={{ color:"#8a6400" }}>VPTU Đồng Nai</span>
            </h1>
            <p className="text-[13px] text-white/65" style={{ fontFamily: "var(--font-sans)" }}>
              Thi đua Khen thưởng · Văn phòng Tỉnh ủy Đồng Nai · Kế hoạch Thiết kế & Phát triển v2.0
            </p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[["8","Modules chính","#8a6400"],[`${totalScreens}`,"Screens","#93c5fd"],["5","Vai trò","#86efac"],[`${BUSINESS_RULES.length}`,"Business Rules","#fca5a5"],["500+","Concurrent Users","#c4b5fd"]].map(([v,l,c])=>(
            <div key={l} className="text-center p-3 rounded-[8px]" style={{ background:"rgba(255,255,255,0.07)" }}>
              <div className="text-[24px] leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700,color:c }}>{v}</div>
              <div className="text-[13px] mt-1 text-white/55" style={{ fontFamily: "var(--font-sans)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Bản đồ Module & Kết nối</h3>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {MODULES.map(m=>{ const I=m.icon; return (
          <div key={m.id} className="rounded-[8px] border p-3" style={{ background:m.bg,borderColor:m.border }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg flex items-center justify-center" style={{ background:m.color }}>
                <I className="size-4 text-white"/>
              </div>
              <span className="text-[13px]" style={{ color:m.color,fontFamily: "var(--font-sans)",fontWeight:700 }}>{m.title}</span>
            </div>
            <div className="text-[13px] text-slate-700">{m.screens.length} screens · {m.workflow.length} states · {m.fields.length} fields</div>
          </div>
        );})}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOC
═══════════════════════════════════════════════════════════════ */
const TOC_ITEMS=[
  { id:"overview",     label:"Tổng quan & Kiến trúc",   icon:LayoutDashboard },
  { id:"phong-trao",   label:"Module Phong trào",        icon:Trophy          },
  { id:"de-nghi-kt",   label:"Module Đề nghị KT",        icon:Award           },
  { id:"lay-y-kien",   label:"Module Lấy ý kiến",        icon:Megaphone       },
  { id:"cham-diem",    label:"Module Chấm điểm",         icon:ClipboardList   },
  { id:"hoi-dong",     label:"Module Hội đồng",          icon:Gavel           },
  { id:"ky-so",        label:"Module Ký số",              icon:FileSignature   },
  { id:"quyet-dinh",   label:"Module Quyết định",        icon:ScrollText      },
  { id:"dashboard",    label:"Module Dashboard",         icon:BarChart3       },
  { id:"user-flows",   label:"User Flows",                icon:GitBranch       },
  { id:"ux-patterns",  label:"UX Interaction Patterns",  icon:Sparkles        },
  { id:"scalability",  label:"Scalability Architecture", icon:Server          },
  { id:"biz-rules",    label:"Business Rules (55)",      icon:Shield          },
  { id:"design-sys",   label:"Design System",            icon:Palette         },
  { id:"sprint-plan",  label:"Sprint Roadmap (6 sprints)",icon:Target         },
  { id:"api-contract", label:"API Contract",             icon:Code2           },
  { id:"security",     label:"Security Architecture",    icon:Lock            },
  { id:"integrations", label:"Integration Points",       icon:Globe           },
  { id:"testing",      label:"Testing Strategy",         icon:CheckCircle2    },
];

/* ═══════════════════════════════════════════════════════════════
   SPRINT ROADMAP SECTION
═══════════════════════════════════════════════════════════════ */
interface SprintTask { code:string; title:string; module:string; effort:"S"|"M"|"L"|"XL"; type:"screen"|"infra"|"ai"|"integration" }
interface Sprint { n:number; name:string; weeks:string; focus:string; color:string; tasks:SprintTask[] }
const SPRINTS: Sprint[] = [
  {
    n:1, name:"Foundation", weeks:"Tuần 1–2", color:"#1C5FBE",
    focus:"Auth, Design System, Org Setup, Admin Config cơ bản",
    tasks:[
      { code:"INFRA-01", title:"Khởi tạo monorepo NestJS + React + PostgreSQL + Redis", module:"Infra", effort:"M", type:"infra" },
      { code:"INFRA-02", title:"CI/CD pipeline GitLab + Docker + Kubernetes staging", module:"Infra", effort:"M", type:"infra" },
      { code:"AUTH-01",  title:"JWT Auth: login, refresh token, logout, session Redis", module:"Auth", effort:"M", type:"infra" },
      { code:"AUTH-02",  title:"RBAC middleware: role + org_id row-level security", module:"Auth", effort:"M", type:"infra" },
      { code:"DS-01",    title:"Design System: DsButton (5 variants), DsInput, tokens CSS", module:"Design System", effort:"M", type:"screen" },
      { code:"DS-02",    title:"StatusBadge, PriorityPill, Toast, Modal, Stepper components", module:"Design System", effort:"M", type:"screen" },
      { code:"ADMIN-01", title:"Admin: CRUD cây tổ chức multi-tenant (org tree)", module:"Admin", effort:"L", type:"screen" },
      { code:"ADMIN-02", title:"Admin: CRUD tài khoản người dùng + gán roles", module:"Admin", effort:"M", type:"screen" },
      { code:"ADMIN-03", title:"Login page + onboarding flow + forgot password", module:"Auth", effort:"S", type:"screen" },
      { code:"ADMIN-04", title:"Sidebar RBAC-aware + Topbar + Layout shell", module:"UI", effort:"S", type:"screen" },
    ],
  },
  {
    n:2, name:"Core Workflow", weeks:"Tuần 3–5", color:"#166534",
    focus:"Phong trào, Đề nghị KT basic, Dashboard, Notifications",
    tasks:[
      { code:"PTD-S2-01", title:"PTD-001 Danh sách Phong trào (grid + filter + search)", module:"Phong trào", effort:"M", type:"screen" },
      { code:"PTD-S2-02", title:"PTD-002/003 Chi tiết + Tạo/Sửa phong trào (wizard 3 bước)", module:"Phong trào", effort:"L", type:"screen" },
      { code:"PTD-S2-03", title:"PTD-004/005 Đăng ký + Theo dõi tiến độ phong trào", module:"Phong trào", effort:"M", type:"screen" },
      { code:"DNKT-S2-01", title:"DNKT-001 Danh sách hồ sơ scope-aware", module:"Đề nghị KT", effort:"M", type:"screen" },
      { code:"DNKT-S2-02", title:"DNKT-002 Chi tiết hồ sơ multi-tab (6 tabs)", module:"Đề nghị KT", effort:"L", type:"screen" },
      { code:"DNKT-S2-03", title:"DNKT-003 Wizard 4 bước tạo hồ sơ + auto-save", module:"Đề nghị KT", effort:"XL", type:"screen" },
      { code:"DNKT-S2-04", title:"DNKT-007 Bulk import hồ sơ từ Excel", module:"Đề nghị KT", effort:"M", type:"screen" },
      { code:"DB-S2-01",   title:"DB-001 Dashboard role-adaptive (user/manager/council/leader/admin)", module:"Dashboard", effort:"L", type:"screen" },
      { code:"NOTIF-01",   title:"Notification system: in-app bell + email SMTP templates", module:"Infra", effort:"M", type:"infra" },
      { code:"FILE-01",    title:"File upload service: S3, MIME validation, signed URL 1h", module:"Infra", effort:"M", type:"infra" },
    ],
  },
  {
    n:3, name:"Council Workflow", weeks:"Tuần 6–8", color:"#7c3aed",
    focus:"Chấm điểm HĐ, Lấy ý kiến, Phiên họp, Biên bản PDF",
    tasks:[
      { code:"CDB-S3-01", title:"CDB-001/002 Queue thẩm định + Form chấm điểm 5 tiêu chí", module:"Chấm điểm", effort:"L", type:"screen" },
      { code:"CDB-S3-02", title:"CDB-003/004 Bảng so sánh điểm HĐ + Kết quả bình xét", module:"Chấm điểm", effort:"M", type:"screen" },
      { code:"LYK-S3-01", title:"LYK-001/002/003 Danh sách + Chi tiết + Form gửi ý kiến", module:"Lấy ý kiến", effort:"L", type:"screen" },
      { code:"LYK-S3-02", title:"LYK-004/005 Tổng hợp kết quả + Xử lý phản đối", module:"Lấy ý kiến", effort:"M", type:"screen" },
      { code:"LYK-S3-03", title:"LYK-006 Public LYK portal (no-auth) + OTP verify", module:"Lấy ý kiến", effort:"M", type:"screen" },
      { code:"HD-S3-01",  title:"HD-001/002/003 Danh sách + Tạo phiên + Agenda builder drag-drop", module:"Hội đồng", effort:"XL", type:"screen" },
      { code:"HD-S3-02",  title:"HD-004 Live voting interface + COI auto-mask + realtime tally", module:"Hội đồng", effort:"L", type:"screen" },
      { code:"HD-S3-03",  title:"HD-005 Auto-generate biên bản + ký + export PDF Mẫu 01/TT01", module:"Hội đồng", effort:"L", type:"screen" },
      { code:"PDF-01",    title:"PDF generation service: puppeteer + template engine + A4 format", module:"Infra", effort:"M", type:"infra" },
      { code:"COI-01",    title:"COI detection engine: relationship graph + auto-flag", module:"Infra", effort:"M", type:"infra" },
    ],
  },
  {
    n:4, name:"Signing & Decision", weeks:"Tuần 9–11", color:"#c8102e",
    focus:"Ký số CA PKI, Quyết định, SLA tracking, Export PDF",
    tasks:[
      { code:"KSO-S4-01", title:"KSO-001/002 Inbox ký số SLA-sorted + Preview chi tiết hồ sơ", module:"Ký số", effort:"M", type:"screen" },
      { code:"KSO-S4-02", title:"KSO-003 Tích hợp CA PKI: SAVIS/VNPT-CA SDK + TSA timestamp", module:"Ký số", effort:"XL", type:"integration" },
      { code:"KSO-S4-03", title:"KSO-004 Batch sign ≤20 hồ sơ + progress + partial-success", module:"Ký số", effort:"M", type:"screen" },
      { code:"KSO-S4-04", title:"KSO-005/006 Từ chối + lý do + lịch sử ký số", module:"Ký số", effort:"S", type:"screen" },
      { code:"QD-S4-01",  title:"QD-001/002 Danh sách QĐ + Dự thảo editor + số tự động", module:"Quyết định", effort:"L", type:"screen" },
      { code:"QD-S4-02",  title:"QD-003/004 Chi tiết QĐ + Public verification page (QR)", module:"Quyết định", effort:"M", type:"screen" },
      { code:"QD-S4-03",  title:"QD-005 Template quản lý mẫu QĐ (CRUD + versioning)", module:"Quyết định", effort:"M", type:"screen" },
      { code:"SLA-01",    title:"SLA tracking engine: deadline config + auto-alert + escalation", module:"Infra", effort:"L", type:"infra" },
      { code:"LEGAL-01",  title:"Legal check engine: 8 danh hiệu × NĐ 98 rules + checklist UI", module:"Infra", effort:"L", type:"infra" },
      { code:"AUDIT-01",  title:"Audit log service: immutable events + diff storage + query API", module:"Infra", effort:"M", type:"infra" },
    ],
  },
  {
    n:5, name:"AI & Analytics", weeks:"Tuần 12–14", color:"#92400e",
    focus:"AI pre-check, AI scoring, BI dashboard, SLA monitor, duplicate detection",
    tasks:[
      { code:"AI-S5-01", title:"AI pre-check engine: PhoBERT NLP + rule-based eligibility check", module:"AI", effort:"XL", type:"ai" },
      { code:"AI-S5-02", title:"AI scoring suggest: embedding hồ sơ + vector similarity + pgvector", module:"AI", effort:"XL", type:"ai" },
      { code:"AI-S5-03", title:"DNKT-008 Duplicate detection: similarity search + flag UI", module:"Đề nghị KT", effort:"M", type:"ai" },
      { code:"AI-S5-04", title:"CDB-005 AI scoring analytics: accuracy vs HĐ + bias detection", module:"Chấm điểm", effort:"M", type:"screen" },
      { code:"DB-S5-01", title:"DB-002 BI analytics: multi-dim charts + drill-down + compare kỳ", module:"Dashboard", effort:"L", type:"screen" },
      { code:"DB-S5-02", title:"DB-003/004 Báo cáo định kỳ + SLA monitor realtime", module:"Dashboard", effort:"M", type:"screen" },
      { code:"DB-S5-03", title:"DB-005/006 Custom dashboard builder + KPI alert config", module:"Dashboard", effort:"L", type:"screen" },
      { code:"PTD-S5-01", title:"PTD-006/007 Tổng kết phong trào + Analytics charts", module:"Phong trào", effort:"M", type:"screen" },
      { code:"RANK-01",  title:"Realtime leaderboard: WebSocket + Redis sorted set + ranking algo", module:"Infra", effort:"M", type:"infra" },
      { code:"SEARCH-01",title:"Full-text search: pg_trgm + Vietnamese tokenizer + indexed search", module:"Infra", effort:"M", type:"infra" },
    ],
  },
  {
    n:6, name:"Enterprise & Polish", weeks:"Tuần 15–16", color:"#0b1426",
    focus:"2FA, Security audit, Performance, Backup, UAT, Go-live prep",
    tasks:[
      { code:"SEC-S6-01", title:"2FA: TOTP (Google Auth) + SMS fallback + recovery codes + enforce", module:"Security", effort:"M", type:"infra" },
      { code:"SEC-S6-02", title:"Security audit: OWASP ZAP scan + penetration test + fix critical", module:"Security", effort:"L", type:"infra" },
      { code:"PERF-S6-01",title:"Performance: index tuning + query optimization + Redis cache layer", module:"Infra", effort:"M", type:"infra" },
      { code:"PERF-S6-02",title:"Load testing k6: 500 CCU + SLA compliance + bottleneck fix", module:"Infra", effort:"M", type:"infra" },
      { code:"BACKUP-01", title:"Backup/restore: daily schedule + AES-256 + 2-location + drill", module:"Infra", effort:"S", type:"infra" },
      { code:"MONITOR-01",title:"Prometheus + Grafana + Sentry + alert rules + on-call runbook", module:"Infra", effort:"M", type:"infra" },
      { code:"ADMIN-S6-01",title:"Admin: Config danh hiệu + thẩm quyền ký + chu kỳ + hạn mức", module:"Admin", effort:"L", type:"screen" },
      { code:"ADMIN-S6-02",title:"Admin: Audit log dashboard + system monitoring + backup UI", module:"Admin", effort:"M", type:"screen" },
      { code:"UAT-01",    title:"UAT với 10 người dùng thực tế (Admin/Manager/Council/Leader/User)", module:"QA", effort:"L", type:"infra" },
      { code:"DEPLOY-01", title:"Production deploy: blue-green + DNS cutover + smoke test + runbook", module:"Infra", effort:"M", type:"infra" },
    ],
  },
];

function SprintRoadmapSection() {
  const [activeSprint,setActiveSprint]=useState(1);
  const sp=SPRINTS.find(s=>s.n===activeSprint)!;
  const TYPE_CFG={screen:{color:"#1C5FBE",bg:"#ddeafc",label:"UI Screen"},infra:{color:"#0b1426",bg:"#e8ecf3",label:"Infra"},ai:{color:"#7c3aed",bg:"#f5f3ff",label:"AI/ML"},integration:{color:"#166534",bg:"#dcfce7",label:"Integration"}};
  const EFFORT_DAYS={S:"1–2n",M:"3–5n",L:"1–2w",XL:"2–4w"};
  const totalTasks=SPRINTS.reduce((s,sp)=>s+sp.tasks.length,0);
  const screenTasks=SPRINTS.flatMap(sp=>sp.tasks).filter(t=>t.type==="screen").length;
  return (
    <section id="sprint-plan" className="mb-10">
      <SectionHeader id="h-sprint-plan" icon={Target} color="#166534" title="Sprint Roadmap (6 Sprints · 16 Tuần)" subtitle={`${totalTasks} tasks · ${screenTasks} screens · ước tính 4 tháng từ kickoff đến go-live`}/>
      {/* Sprint overview bar */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {SPRINTS.map(s=>(
          <button key={s.n} onClick={()=>setActiveSprint(s.n)}
            className="shrink-0 rounded-[10px] border px-4 py-3 text-left transition-all min-w-[120px]"
            style={{ background:activeSprint===s.n?s.color:"white",borderColor:activeSprint===s.n?s.color:"#e2e8f0" }}>
            <div className="text-[13px]" style={{ color:activeSprint===s.n?"rgba(255,255,255,0.7)":"#635647",fontFamily: "var(--font-sans)" }}>Sprint {s.n}</div>
            <div className="text-[13px] leading-tight" style={{ color:activeSprint===s.n?"white":"#0b1426",fontFamily: "var(--font-sans)",fontWeight:700 }}>{s.name}</div>
            <div className="text-[13px] mt-1" style={{ color:activeSprint===s.n?"rgba(255,255,255,0.6)":"#635647",fontFamily:"JetBrains Mono, monospace" }}>{s.weeks}</div>
            <div className="text-[13px] mt-0.5" style={{ color:activeSprint===s.n?"rgba(255,255,255,0.6)":"#635647" }}>{s.tasks.length} tasks</div>
          </button>
        ))}
      </div>
      {/* Sprint detail */}
      <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3" style={{ background:`linear-gradient(to right,${sp.color},${sp.color}cc)` }}>
          <div>
            <div className="text-[13px] text-white/70" style={{ fontFamily: "var(--font-sans)" }}>Sprint {sp.n} · {sp.weeks}</div>
            <div className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{sp.name}</div>
            <div className="text-[13px] text-white/80 mt-0.5">{sp.focus}</div>
          </div>
          <div className="ml-auto flex items-center gap-3 shrink-0">
            {Object.entries(TYPE_CFG).map(([k,v])=>{
              const cnt=sp.tasks.filter(t=>t.type===k).length;
              if(!cnt) return null;
              return <div key={k} className="text-center px-3 py-1.5 rounded-[6px]" style={{ background:"rgba(255,255,255,0.15)" }}>
                <div className="text-[14px] text-white leading-none" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{cnt}</div>
                <div className="text-[13px] text-white/70">{v.label}</div>
              </div>;
            })}
          </div>
        </div>
        <div className="divide-y divide-[#e2e8f0]">
          {sp.tasks.map((t,i)=>{
            const tc=TYPE_CFG[t.type];
            return (
              <div key={t.code} className="flex items-center gap-3 px-5 py-3 hover:bg-[#f4f7fb] transition-colors" style={{ background:i%2===0?"white":"#fdfcfa" }}>
                <span className="text-[13px] w-5 text-slate-700" style={{ fontFamily:"JetBrains Mono, monospace" }}>{i+1}</span>
                <code className="text-[13px] px-1.5 py-0.5 rounded shrink-0" style={{ background:tc.bg,color:tc.color,border:`1px solid ${tc.color}40`,fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{t.code}</code>
                <span className="flex-1 text-[13px] text-slate-900 leading-snug" style={{ fontFamily: "var(--font-sans)" }}>{t.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#f4f7fb",color:"#5a5040",fontFamily: "var(--font-sans)" }}>{t.module}</span>
                  <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:tc.bg,color:tc.color,fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{EFFORT_DAYS[t.effort]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Gantt-lite visual */}
      <div className="mt-4">
        <h4 className="text-[13px] text-slate-900 mb-2" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Timeline tổng hợp</h4>
        <div className="space-y-1.5">
          {SPRINTS.map(s=>(
            <div key={s.n} className="flex items-center gap-3">
              <div className="text-[13px] w-[80px] shrink-0 text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>S{s.n}: {s.name}</div>
              <div className="flex-1 h-6 rounded-[4px] flex items-center px-2" style={{ background:s.color, marginLeft:`${(s.n-1)*8}%`, width:`${100-(s.n-1)*8}%` }}>
                <span className="text-[13px] text-white/80 truncate" style={{ fontFamily: "var(--font-sans)" }}>{s.weeks} · {s.tasks.length} tasks · {s.focus.split(",")[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   API CONTRACT SECTION
═══════════════════════════════════════════════════════════════ */
interface ApiEndpoint { method:"GET"|"POST"|"PATCH"|"DELETE"|"PUT"; path:string; auth:string; desc:string; body?:string; response?:string }
interface ApiGroup { module:string; color:string; base:string; endpoints:ApiEndpoint[] }
const API_GROUPS: ApiGroup[] = [
  {
    module:"Phong trào", color:"#1C5FBE", base:"/api/v1/campaigns",
    endpoints:[
      { method:"GET",    path:"/",                   auth:"JWT (all)",           desc:"Danh sách phong trào với pagination, filter, search", response:"{ data: Campaign[], meta: PaginationMeta }" },
      { method:"POST",   path:"/",                   auth:"JWT (leader, admin)", desc:"Tạo phong trào mới", body:"CreateCampaignDto",       response:"{ id, status: 'draft' }" },
      { method:"GET",    path:"/:id",                auth:"JWT (all)",           desc:"Chi tiết phong trào kèm stats tham gia" },
      { method:"PATCH",  path:"/:id",                auth:"JWT (leader, admin)", desc:"Cập nhật phong trào (chỉ khi status=draft/pending)" },
      { method:"POST",   path:"/:id/approve",        auth:"JWT (leader)",        desc:"Phê duyệt phong trào → status=open",        body:"{ note?: string }" },
      { method:"POST",   path:"/:id/register",       auth:"JWT (user, manager)", desc:"Đăng ký tham gia phong trào",                body:"RegisterCampaignDto" },
      { method:"PATCH",  path:"/:id/progress",       auth:"JWT (user, manager)", desc:"Cập nhật tiến độ hàng tháng",               body:"UpdateProgressDto" },
      { method:"POST",   path:"/:id/close",          auth:"JWT (leader, admin)", desc:"Kết thúc phong trào sớm",                   body:"{ reason: string }" },
    ],
  },
  {
    module:"Đề nghị KT", color:"#c8102e", base:"/api/v1/nominations",
    endpoints:[
      { method:"GET",    path:"/",           auth:"JWT (all, scope by role)",    desc:"Danh sách hồ sơ theo scope (org_id + role filter)", response:"{ data: Nomination[], meta }" },
      { method:"POST",   path:"/",           auth:"JWT (user, manager, admin)",  desc:"Tạo hồ sơ mới (status=draft)",             body:"CreateNominationDto" },
      { method:"GET",    path:"/:id",        auth:"JWT (scope check)",           desc:"Chi tiết hồ sơ + tabs data (scores, lyy, history)" },
      { method:"PATCH",  path:"/:id",        auth:"JWT (owner, status=draft)",   desc:"Sửa hồ sơ — chỉ khi status=draft" },
      { method:"POST",   path:"/:id/submit", auth:"JWT (user, manager)",         desc:"Nộp hồ sơ → status=submitted" },
      { method:"POST",   path:"/:id/confirm-unit", auth:"JWT (manager)",        desc:"Manager xác nhận đơn vị → status=unit_confirmed" },
      { method:"POST",   path:"/:id/supplement",   auth:"JWT (user, manager)", desc:"Upload bổ sung theo yêu cầu của Council",    body:"SupplementDto" },
      { method:"GET",    path:"/:id/audit",  auth:"JWT (council, leader, admin)", desc:"Audit trail đầy đủ với diff payload" },
      { method:"POST",   path:"/bulk-import",auth:"JWT (manager, admin)",        desc:"Import hàng loạt từ Excel",                body:"multipart/form-data (file xlsx)" },
    ],
  },
  {
    module:"Chấm điểm", color:"#92400e", base:"/api/v1/scoring",
    endpoints:[
      { method:"GET",    path:"/queue",           auth:"JWT (council)",           desc:"Queue hồ sơ được phân công + SLA countdown" },
      { method:"POST",   path:"/",                auth:"JWT (council)",           desc:"Submit điểm 5 tiêu chí",                   body:"ScoreSubmitDto { nominationId, scores: Score[5], comment, recommendation }" },
      { method:"GET",    path:"/comparison/:nominationId", auth:"JWT (council, leader, admin)", desc:"Bảng so sánh điểm tất cả thành viên" },
      { method:"POST",   path:"/finalize/:nominationId",   auth:"JWT (leader)",  desc:"Lock điểm cuối → immutable" },
      { method:"GET",    path:"/ai-suggest/:nominationId", auth:"JWT (council)", desc:"AI gợi ý điểm với confidence score" },
      { method:"POST",   path:"/appeal",          auth:"JWT (user, manager)",    desc:"Nộp đơn kháng nghị điểm",                 body:"AppealDto" },
    ],
  },
  {
    module:"Hội đồng", color:"#0891b2", base:"/api/v1/council",
    endpoints:[
      { method:"GET",    path:"/sessions",         auth:"JWT (council, leader, admin)", desc:"Danh sách phiên họp" },
      { method:"POST",   path:"/sessions",         auth:"JWT (council, admin)",         desc:"Tạo phiên họp mới",                body:"CreateSessionDto" },
      { method:"GET",    path:"/sessions/:id",     auth:"JWT (council, leader, admin)", desc:"Chi tiết phiên + agenda + votes" },
      { method:"POST",   path:"/sessions/:id/vote",auth:"JWT (council)",                desc:"Bỏ phiếu cho hồ sơ trong phiên",  body:"{ nominationId, vote: 'yes'|'no'|'absent' }" },
      { method:"POST",   path:"/sessions/:id/close",auth:"JWT (council, leader)",       desc:"Kết thúc phiên họp → gen biên bản" },
      { method:"GET",    path:"/sessions/:id/minutes", auth:"JWT (council, leader, admin)", desc:"Biên bản auto-generated" },
      { method:"POST",   path:"/sessions/:id/sign-minutes", auth:"JWT (leader)",        desc:"Chủ tịch HĐ ký biên bản" },
    ],
  },
  {
    module:"Ký số", color:"#166534", base:"/api/v1/signing",
    endpoints:[
      { method:"GET",    path:"/inbox",            auth:"JWT (leader, admin)",   desc:"Queue hồ sơ chờ ký, sorted by SLA" },
      { method:"POST",   path:"/ca-sign",          auth:"JWT (leader)",          desc:"Ký CA: hash → CA API → embed PDF → TSA",   body:"{ documentId, certSerial, pin_hash }", response:"{ signedPdfUrl, timestamp, certInfo }" },
      { method:"POST",   path:"/batch-sign",       auth:"JWT (leader)",          desc:"Batch ký ≤20 hồ sơ",                      body:"{ documentIds: string[], certSerial, pin_hash }" },
      { method:"POST",   path:"/reject/:documentId",auth:"JWT (leader, admin)",  desc:"Từ chối ký với lý do",                    body:"{ reason: string, details: string }" },
      { method:"GET",    path:"/verify/:documentId",auth:"public",               desc:"Verify chữ ký CA (public endpoint)" },
      { method:"GET",    path:"/history",          auth:"JWT (leader, admin)",   desc:"Lịch sử ký số + download links" },
    ],
  },
  {
    module:"Quyết định", color:"#0b1426", base:"/api/v1/decisions",
    endpoints:[
      { method:"GET",    path:"/",           auth:"JWT (all, scope)",       desc:"Danh sách QĐ theo scope role" },
      { method:"POST",   path:"/",           auth:"JWT (leader, admin)",    desc:"Tạo dự thảo QĐ từ template",       body:"CreateDecisionDto" },
      { method:"GET",    path:"/:id",        auth:"JWT (all, scope)",       desc:"Chi tiết QĐ + cert info + QR data" },
      { method:"POST",   path:"/:id/publish",auth:"JWT (leader)",           desc:"Ký CA + phát hành QĐ chính thức" },
      { method:"GET",    path:"/public/:qr", auth:"public",                 desc:"Public verify page — no auth required" },
      { method:"GET",    path:"/number/next",auth:"JWT (leader, admin)",    desc:"Số QĐ tiếp theo trong series năm" },
    ],
  },
  {
    module:"Auth & Admin", color:"#7c3aed", base:"/api/v1",
    endpoints:[
      { method:"POST",   path:"/auth/login",        auth:"public",           desc:"Login → JWT + Refresh token",          body:"{ email, password, totp? }" },
      { method:"POST",   path:"/auth/refresh",      auth:"Refresh token",    desc:"Refresh access token (15min TTL)" },
      { method:"POST",   path:"/auth/2fa/setup",    auth:"JWT",              desc:"Setup TOTP: gen secret + QR code" },
      { method:"POST",   path:"/auth/2fa/verify",   auth:"JWT",              desc:"Verify TOTP code" },
      { method:"GET",    path:"/admin/users",        auth:"JWT (admin)",      desc:"Danh sách users + pagination" },
      { method:"POST",   path:"/admin/users",        auth:"JWT (admin)",      desc:"Tạo tài khoản mới",                   body:"CreateUserDto" },
      { method:"GET",    path:"/admin/audit-log",    auth:"JWT (admin)",      desc:"Audit log với filter + export CSV" },
      { method:"GET",    path:"/admin/config/awards",auth:"JWT (admin)",      desc:"Config danh hiệu + điều kiện" },
      { method:"POST",   path:"/admin/config/awards",auth:"JWT (admin)",      desc:"CRUD danh hiệu + điều kiện xét tặng", body:"CreateAwardDto" },
    ],
  },
];

const METHOD_CFG={"GET":{bg:"#dcfce7",color:"#166534"},"POST":{bg:"#ddeafc",color:"#1C5FBE"},"PATCH":{bg:"#fef3c7",color:"#92400e"},"DELETE":{bg:"#fee2e2",color:"#991b1b"},"PUT":{bg:"#f5f3ff",color:"#7c3aed"}};

function ApiContractSection() {
  const [selModule,setSelModule]=useState("Phong trào");
  const grp=API_GROUPS.find(g=>g.module===selModule)!;
  return (
    <section id="api-contract" className="mb-10">
      <SectionHeader id="h-api-contract" icon={Code2} color="#1a2744" title="API Contract" subtitle={`${API_GROUPS.reduce((s,g)=>s+g.endpoints.length,0)} endpoints · RESTful JSON · JWT Bearer Auth · Versioned /api/v1/`}/>
      <div className="flex gap-2 mb-5 flex-wrap">
        {API_GROUPS.map(g=>(
          <button key={g.module} onClick={()=>setSelModule(g.module)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border text-[13px] transition-all"
            style={{ background:selModule===g.module?g.color:"white",color:selModule===g.module?"white":"#5a5040",borderColor:selModule===g.module?g.color:"#e2e8f0",fontFamily: "var(--font-sans)",fontWeight:selModule===g.module?700:400 }}>
            {g.module} <span className="text-[13px]">({g.endpoints.length})</span>
          </button>
        ))}
      </div>
      <div className="mb-3 flex items-center gap-2">
        <code className="text-[13px] px-3 py-1.5 rounded-[6px]" style={{ background:"#0b1426",color:"#93c5fd",fontFamily:"JetBrains Mono, monospace" }}>
          Base URL: {grp.base}
        </code>
        <span className="text-[13px] text-slate-700" style={{ fontFamily: "var(--font-sans)" }}>+ rate limit: 100 req/min/user</span>
      </div>
      <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
        <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
          <thead><tr style={{ background:"linear-gradient(to right,#0b1426,#1a2744)" }}>
            {["Method","Path","Auth","Mô tả","Body / Response"].map(h=><th key={h} className="text-left px-3 py-2.5 text-white" style={{ fontWeight:700 }}>{h}</th>)}
          </tr></thead>
          <tbody>{grp.endpoints.map((ep,i)=>{
            const mc=METHOD_CFG[ep.method];
            return (
              <tr key={i} className="border-t border-[#e2e8f0]" style={{ background:i%2===0?"white":"#f4f7fb" }}>
                <td className="px-3 py-2.5"><span className="text-[13px] px-2 py-0.5 rounded" style={{ background:mc.bg,color:mc.color,fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{ep.method}</span></td>
                <td className="px-3 py-2.5"><code className="text-[13px]" style={{ fontFamily:"JetBrains Mono, monospace",color:"#1C5FBE" }}>{grp.base}{ep.path}</code></td>
                <td className="px-3 py-2.5 text-[13px] text-slate-700">{ep.auth}</td>
                <td className="px-3 py-2.5 text-slate-900">{ep.desc}</td>
                <td className="px-3 py-2.5"><code className="text-[13px] text-[#7c3aed]" style={{ fontFamily:"JetBrains Mono, monospace" }}>{ep.body||ep.response||"—"}</code></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      {/* Common patterns */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { title:"Pagination standard", code:`GET /api/v1/...?page=1&limit=20&sortBy=createdAt&order=desc\n→ { data: T[], meta: { page, limit, total, totalPages } }` },
          { title:"Error response format", code:`{ statusCode: 400|401|403|404|422|500,\n  message: string | string[],\n  error: string, timestamp: ISO8601 }` },
          { title:"Auth header", code:`Authorization: Bearer <access_token>\nX-Refresh-Token: <refresh_token> (only /auth/refresh)` },
          { title:"Rate limit headers", code:`X-RateLimit-Limit: 100\nX-RateLimit-Remaining: 87\nX-RateLimit-Reset: 1745678400` },
        ].map(p=>(
          <div key={p.title} className="rounded-[8px] border border-[#e2e8f0] overflow-hidden">
            <div className="px-3 py-2 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
              <span className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{p.title}</span>
            </div>
            <pre className="px-3 py-2 text-[13px] overflow-x-auto" style={{ fontFamily:"JetBrains Mono, monospace",color:"#5a5040",background:"white" }}>{p.code}</pre>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECURITY ARCHITECTURE SECTION
═══════════════════════════════════════════════════════════════ */
function SecuritySection() {
  const AUTH_FLOWS=[
    { step:1, title:"Password Login", steps:["Client: POST /auth/login {email, pwd}","Server: bcrypt verify + check account status","Server: gen JWT (15min) + Refresh (7d) → Redis","Response: { accessToken, refreshToken, user }"] },
    { step:2, title:"2FA TOTP (Leader/Admin)", steps:["Client: POST /auth/login → 200 + { requires2FA: true }","Client: show TOTP input modal","Client: POST /auth/2fa/verify { code }","Server: verify TOTP (±1 window) → gen full JWT"] },
    { step:3, title:"Token Refresh", steps:["Access token expires → 401 Unauthorized","Client interceptor: auto POST /auth/refresh","Server: verify refresh token from Redis","Response: new accessToken (15min)"] },
    { step:4, title:"CA Signing Auth", steps:["User: cắm USB token CA","App: detect cert via browser crypto API","User: nhập PIN","Server: verify cert chain (CA → Intermediate → Root NEAC)"] },
  ];
  const SECURITY_LAYERS=[
    { layer:"Transport",      measure:"TLS 1.3 only, HSTS header, no HTTP", icon:Globe },
    { layer:"Authentication", measure:"JWT RS256 (asymmetric), refresh rotation, device binding", icon:Lock },
    { layer:"Authorization",  measure:"RBAC + org_id row-level security, scope check per request", icon:Shield },
    { layer:"Input Validation",measure:"DTO validation (class-validator), SQL parameterized queries only", icon:AlertTriangle },
    { layer:"File Security",  measure:"MIME type check (magic bytes), AV scan (optional), S3 signed URL", icon:Upload },
    { layer:"Rate Limiting",  measure:"100 req/min/user, 10 req/min /auth/login, 429 on breach", icon:Activity },
    { layer:"CORS",           measure:"Allowlist domain (no wildcard), credentials: true, preflight cache", icon:Globe },
    { layer:"Headers",        measure:"CSP, X-Frame-Options: DENY, X-XSS-Protection, Referrer-Policy", icon:Shield },
    { layer:"Secrets",        measure:"Vault / AWS Secrets Manager, no plaintext secrets in code/git", icon:Lock },
    { layer:"Audit",          measure:"Immutable event log: who/what/when/IP, retention 5 năm", icon:Database },
  ];
  return (
    <section id="security" className="mb-10">
      <SectionHeader id="h-security" icon={Lock} color="#991b1b" title="Security Architecture" subtitle="Defense-in-depth: Transport → Auth → RBAC → Input → Audit — OWASP Top 10 compliant"/>
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div>
          <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Authentication Flows</h3>
          <div className="space-y-3">
            {AUTH_FLOWS.map(f=>(
              <div key={f.step} className="rounded-[8px] border border-[#e2e8f0] overflow-hidden">
                <div className="px-3 py-2 flex items-center gap-2" style={{ background:"#fee2e2" }}>
                  <span className="size-5 rounded-full flex items-center justify-center text-[13px] text-white" style={{ background:"#c8102e",fontFamily:"JetBrains Mono, monospace",fontWeight:700 }}>{f.step}</span>
                  <span className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{f.title}</span>
                </div>
                <div className="p-2.5 space-y-1">
                  {f.steps.map((s,i)=>(
                    <div key={i} className="flex items-start gap-2 text-[13px] text-slate-700">
                      <span className="text-[#c8102e] shrink-0" style={{ fontFamily:"JetBrains Mono, monospace" }}>{i+1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Security Layers (Defense-in-Depth)</h3>
          <div className="space-y-2">
            {SECURITY_LAYERS.map(l=>{
              const Icon=l.icon;
              return (
                <div key={l.layer} className="flex items-start gap-2.5 p-2.5 rounded-[6px] border border-[#e2e8f0]">
                  <div className="size-7 rounded flex items-center justify-center shrink-0" style={{ background:"#fee2e2" }}>
                    <Icon className="size-4" style={{ color:"#c8102e" }}/>
                  </div>
                  <div>
                    <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{l.layer}</div>
                    <div className="text-[13px] text-slate-700">{l.measure}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INTEGRATION POINTS SECTION
═══════════════════════════════════════════════════════════════ */
function IntegrationsSection() {
  const INTEGRATIONS=[
    {
      name:"CA PKI Signing (SAVIS / VNPT-CA)", icon:FileSignature, color:"#166534",
      desc:"Ký số chứng thư số hợp lệ theo NĐ 130/2018. Tích hợp SDK hoặc REST API của nhà cung cấp CA được NEAC công nhận.",
      flows:["App gọi CA SDK: sign(documentHash, certSerial, pin)","CA trả về: signature bytes + cert chain","App verify chain: cert → intermediate → root CA NEAC","App gọi TSA: timestamp(hash) → trusted timestamp","App embed signature + timestamp vào PDF/A-3","Verify lại bằng Adobe Reader / tool của NEAC"],
      config:["CA_PROVIDER: SAVIS | VNPT-CA | BKAV | FPT-CA","CA_API_URL, CA_API_KEY","TSA_URL (Timestamp Authority Server)","ROOT_CA_CERT_PATH (NEAC root certificate)"],
      legal:"NĐ 130/2018/NĐ-CP — Chữ ký số & Dịch vụ chứng thực",
    },
    {
      name:"Email SMTP / SendGrid", icon:Bell, color:"#1C5FBE",
      desc:"Gửi notification email cho tất cả events quan trọng. Template HTML responsive. Attachment PDF QĐ.",
      flows:["Event trigger → Queue BullMQ job","Worker: render template Handlebars → HTML","Send via SMTP (primary) hoặc SendGrid API (fallback)","Track: delivered / bounced / opened","Retry 3× exponential backoff nếu fail"],
      config:["SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS","SENDGRID_API_KEY (fallback)","EMAIL_FROM: 'VPTU Đồng Nai <no-reply@vptu.dongnai.gov.vn>'","EMAIL_MAX_ATTACHMENT: 10MB"],
      legal:"",
    },
    {
      name:"SMS OTP (VNPT SMS / Twilio)", icon:Bell, color:"#7c3aed",
      desc:"SMS cho 2FA fallback và cảnh báo SLA quan trọng. Rate limit: 5 SMS/user/ngày.",
      flows:["Trigger: 2FA request hoặc SLA alert","Server: gen 6-digit OTP → Redis TTL 5 phút","Send via VNPT SMS API (primary, Twilio fallback)","Client: nhập OTP → verify → continue","Log: sent/failed/verified per number"],
      config:["VNPT_SMS_API_URL, VNPT_SMS_TOKEN","TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN (fallback)","SMS_OTP_TTL: 300s","SMS_RATE_LIMIT: 5/day/number"],
      legal:"",
    },
    {
      name:"LDAP / Active Directory (Optional)", icon:Building2, color:"#92400e",
      desc:"Đồng bộ tài khoản từ LDAP/AD của Tỉnh ủy. SSO cho cán bộ đã có tài khoản domain.",
      flows:["Login: user nhập domain account (username@dongnai.gov.vn)","Server: bind to LDAP → authenticate","Map LDAP groups → VPTU Đồng Nai roles","Sync cron: pull new users từ LDAP mỗi 6h","Local password disabled nếu LDAP enabled"],
      config:["LDAP_URL: ldaps://dc.dongnai.gov.vn","LDAP_BIND_DN, LDAP_BIND_PASSWORD","LDAP_BASE_DN: ou=users,dc=dongnai,dc=gov,dc=vn","LDAP_GROUP_MAP: { 'HoiDong': 'council', ... }"],
      legal:"",
    },
    {
      name:"Vietnamese eID / CCCD Verification (Optional)", icon:Shield, color:"#c8102e",
      desc:"Xác thực danh tính qua CCCD gắn chip (NFC) hoặc QR CCCD. Dùng cho LYK public portal và xác minh nộp hồ sơ.",
      flows:["User: scan QR trên CCCD hoặc tap NFC","Client: extract data → send to backend","Backend: verify via VNeID API / VNPT eKYC","Map CCCD number → existing user record","Session elevated (verified identity)"],
      config:["VNPT_EKYC_API_URL, VNPT_EKYC_API_KEY","CCCD_VERIFY_ENABLED: true/false","CCCD_REQUIRED_FOR_LYK: true/false"],
      legal:"NĐ 144/2021/NĐ-CP — Danh tính điện tử",
    },
    {
      name:"Webhook & Event Bus (Internal)", icon:Zap, color:"#0891b2",
      desc:"Internal event bus cho realtime notifications, SLA alerts, và dashboard updates.",
      flows:["Domain event emitted (NestJS EventEmitter)","Event handlers: send notification, update cache, send webhook","WebSocket broadcast (Socket.io) → client dashboard update","External webhooks: POST to configured URLs per event","Retry với delivery guarantee (BullMQ)"],
      config:["WEBHOOK_SECRET (HMAC-SHA256 signing)","SOCKET_CORS_ORIGIN","EVENT_BUS: in-memory | Redis pub/sub"],
      legal:"",
    },
  ];
  const [openInt,setOpenInt]=useState<string|null>(null);
  return (
    <section id="integrations" className="mb-10">
      <SectionHeader id="h-integrations" icon={Globe} color="#0891b2" title="Integration Points" subtitle="6 integrations: CA PKI, Email, SMS, LDAP/AD, eID, Webhook — click để xem chi tiết"/>
      <div className="grid grid-cols-1 gap-3">
        {INTEGRATIONS.map(intg=>{
          const Icon=intg.icon; const isOpen=openInt===intg.name;
          return (
            <div key={intg.name} className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#f4f7fb] transition-colors" onClick={()=>setOpenInt(isOpen?null:intg.name)}>
                <div className="size-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background:`${intg.color}20` }}>
                  <Icon className="size-5" style={{ color:intg.color }}/>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] text-slate-900" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{intg.name}</div>
                  <div className="text-[13px] text-slate-700">{intg.desc.slice(0,80)}...</div>
                </div>
                {intg.legal&&<span className="text-[13px] px-2 py-0.5 rounded shrink-0" style={{ background:"#fdf3d9",color:"#7d5a10",border:"1px solid #f0dba0",fontFamily: "var(--font-sans)" }}>{intg.legal.split("—")[0].trim()}</span>}
                {isOpen?<ChevronDown className="size-4 text-slate-700 shrink-0"/>:<ChevronRight className="size-4 text-slate-700 shrink-0"/>}
              </button>
              {isOpen&&(
                <div className="border-t border-[#e2e8f0] grid grid-cols-3 gap-4 px-4 py-4" style={{ background:"#f4f7fb" }}>
                  <div>
                    <p className="text-[13px] text-slate-700 leading-relaxed mb-3">{intg.desc}</p>
                    {intg.legal&&<div className="text-[13px] px-2.5 py-2 rounded" style={{ background:"#fdf3d9",color:"#7d5a10",fontFamily: "var(--font-sans)" }}>⚖ {intg.legal}</div>}
                  </div>
                  <div>
                    <div className="text-[13px] uppercase tracking-wider mb-2" style={{ color:intg.color,fontFamily: "var(--font-sans)",fontWeight:700 }}>Integration Flow</div>
                    <ol className="space-y-1.5">
                      {intg.flows.map((f,i)=>(
                        <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700">
                          <span className="size-4 rounded-full flex items-center justify-center shrink-0 text-[13px] text-white mt-0.5" style={{ background:intg.color,fontFamily:"JetBrains Mono, monospace" }}>{i+1}</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <div className="text-[13px] uppercase tracking-wider mb-2" style={{ color:intg.color,fontFamily: "var(--font-sans)",fontWeight:700 }}>Environment Config</div>
                    <div className="space-y-1">
                      {intg.config.map((c,i)=>(
                        <code key={i} className="block text-[13px] p-1.5 rounded" style={{ background:"#0b1426",color:"#93c5fd",fontFamily:"JetBrains Mono, monospace" }}>{c}</code>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TESTING STRATEGY SECTION
═══════════════════════════════════════════════════════════════ */
function TestingSection() {
  const TEST_PYRAMID=[
    {
      type:"Unit Tests", tool:"Jest + ts-jest", coverage:"≥ 80%", color:"#166534", bg:"#dcfce7",
      desc:"Test từng function/service/util độc lập. Mock dependencies.",
      cases:[
        "NominationService.create() → validate all DTO fields",
        "ScoringEngine.calculate() → correct aggregation formula",
        "RbacGuard.canActivate() → role + scope check",
        "SLAService.isBreached() → correct business day calculation",
        "PDFGenerator.render() → output matches template snapshot",
        "AIPreCheck.check() → all 8 eligibility conditions per award type",
        "COIDetection.detect() → relationship graph traversal",
        "JWTService.sign/verify() → token expiry + claims",
      ],
    },
    {
      type:"Integration Tests", tool:"Supertest + pg-test-db", coverage:"Key flows", color:"#1C5FBE", bg:"#ddeafc",
      desc:"Test API endpoints end-to-end với real DB (test schema).",
      cases:[
        "POST /nominations → status 201 + DB record created",
        "PATCH /nominations/:id (wrong status) → 403 Forbidden",
        "POST /auth/login → JWT returned + Redis session created",
        "Nomination workflow: draft→submit→unit_confirm→council_assign",
        "Council vote: quorum check + result aggregation",
        "File upload: MIME check + S3 storage + signed URL",
        "Rate limiting: 101st request → 429 Too Many Requests",
        "RBAC scope: manager can't see other org nominations",
      ],
    },
    {
      type:"E2E Tests", tool:"Playwright", coverage:"Critical paths", color:"#7c3aed", bg:"#f5f3ff",
      desc:"Browser automation cho critical user flows.",
      cases:[
        "User login → 2FA → dashboard load < 3s",
        "Manager: tạo hồ sơ wizard 4 bước → submit thành công",
        "Council: thẩm định + bỏ phiếu + ký biên bản",
        "Leader: review inbox → ký CA → QĐ phát hành",
        "Admin: tạo user → gán role → verify phân quyền",
        "Public LYK portal: verify CCCD → gửi ý kiến",
        "Mobile responsive: tất cả actions trên viewport 360px",
        "Keyboard nav: full workflow accessible bằng Tab + Enter",
      ],
    },
    {
      type:"Performance Tests", tool:"k6 + Grafana", coverage:"Load targets", color:"#92400e", bg:"#fef3c7",
      desc:"Load testing để verify SLA targets trước khi go-live.",
      cases:[
        "500 concurrent users → API p99 < 1s",
        "Batch sign 20 hồ sơ → complete < 30s",
        "Dashboard load 10K nominations → p95 < 2s",
        "Full-text search 100K records → p95 < 500ms",
        "PDF generation 50 concurrent → p95 < 5s",
        "File upload 10MB × 10 concurrent → success rate 100%",
        "WebSocket 500 connections → broadcast < 100ms",
        "Database: 1000 queries/s → p99 < 100ms",
      ],
    },
    {
      type:"Security Tests", tool:"OWASP ZAP + Manual", coverage:"OWASP Top 10", color:"#c8102e", bg:"#fee2e2",
      desc:"Security scanning và penetration testing trước go-live.",
      cases:[
        "SQL Injection: tất cả input parameters",
        "XSS: reflected + stored + DOM-based",
        "IDOR: access nomination của org khác → 403",
        "JWT: expired/tampered token → 401",
        "CSRF: cross-origin request → blocked",
        "File upload: .php/.exe file → rejected",
        "Rate limit bypass: IP rotation → 429",
        "2FA bypass: session fixation → blocked",
      ],
    },
  ];
  const [selType,setSelType]=useState("Unit Tests");
  const tst=TEST_PYRAMID.find(t=>t.type===selType)!;
  return (
    <section id="testing" className="mb-10">
      <SectionHeader id="h-testing" icon={CheckCircle2} color="#166534" title="Testing Strategy" subtitle="Test pyramid: Unit (80%) → Integration → E2E → Performance → Security — CI/CD tích hợp"/>
      {/* Visual pyramid */}
      <div className="flex flex-col items-center gap-1 mb-5 py-4">
        {TEST_PYRAMID.slice().reverse().map((t,i)=>{
          const width=40+i*12;
          return (
            <button key={t.type} onClick={()=>setSelType(t.type)}
              className="flex items-center justify-center text-[13px] rounded-[4px] transition-all cursor-pointer"
              style={{ width:`${width}%`,height:32,background:selType===t.type?t.color:t.bg,color:selType===t.type?"white":t.color,fontFamily: "var(--font-sans)",fontWeight:700,border:`2px solid ${t.color}50` }}>
              {t.type} ({t.tool})
            </button>
          );
        })}
        <div className="text-[13px] text-slate-700 mt-1" style={{ fontFamily: "var(--font-sans)" }}>← nhỏ hơn, chạy nhanh hơn | nhiều hơn, chạy chậm hơn →</div>
      </div>
      {/* Selected type detail */}
      <div className="rounded-[10px] border overflow-hidden" style={{ borderColor:tst.color+"60" }}>
        <div className="px-5 py-4" style={{ background:`linear-gradient(to right,${tst.color},${tst.color}cc)` }}>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{tst.type}</div>
              <div className="text-[13px] text-white/70">{tst.tool} · Coverage: {tst.coverage}</div>
            </div>
            <div className="ml-auto text-[13px] text-white/80">{tst.desc}</div>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2" style={{ background:tst.bg+"55" }}>
          {tst.cases.map((c,i)=>(
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-[6px] border" style={{ background:"white",borderColor:tst.color+"30" }}>
              <span className="size-5 rounded flex items-center justify-center shrink-0 text-[13px] text-white mt-0.5" style={{ background:tst.color,fontFamily:"JetBrains Mono, monospace" }}>{i+1}</span>
              <span className="text-[13px] text-slate-900 leading-snug" style={{ fontFamily: "var(--font-sans)" }}>{c}</span>
            </div>
          ))}
        </div>
      </div>
      {/* CI/CD integration note */}
      <div className="mt-4 p-4 rounded-[10px] border border-[#e2e8f0]" style={{ background:"#0b1426" }}>
        <div className="text-[13px] text-[#93c5fd] mb-2" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>CI/CD Pipeline (GitLab CI)</div>
        <pre className="text-[13px] text-white/80 overflow-x-auto" style={{ fontFamily:"JetBrains Mono, monospace" }}>{`stages: [lint, unit-test, build, integration-test, e2e-test, security-scan, deploy-staging, performance-test, deploy-prod]

lint:           ESLint + Prettier + TypeScript compile check  (< 2 min)
unit-test:      Jest --coverage → fail if < 80%               (< 5 min)
build:          Docker build + push to registry               (< 8 min)
integration:    Supertest against test-db docker container    (< 10 min)
e2e-test:       Playwright headless (staging env)             (< 20 min)
security-scan:  OWASP ZAP baseline scan                      (< 15 min)
performance:    k6 smoke test (50 CCU × 1 min)               (< 5 min)
deploy-prod:    Blue-green deploy on approval                 (< 5 min)`}</pre>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function ThietKeTongThePage({ user }: { user: LoginUser }) {
  const [active,setActive]=useState("overview");
  const scrollTo=(id:string)=>{
    setActive(id);
    const el=document.getElementById(`h-${id}`);
    if(el) el.scrollIntoView({ behavior:"smooth",block:"start" });
  };
  return (
    <div className="h-full flex overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      <aside className="w-[224px] shrink-0 border-r border-[#e2e8f0] overflow-y-auto flex flex-col" style={{ background:"#f4f7fb" }}>
        <div className="px-4 pt-5 pb-3 border-b border-[#e2e8f0]">
          <div className="text-[13px] uppercase tracking-widest text-slate-700 mb-0.5">VPTU Đồng Nai v2.0</div>
          <h2 className="text-[14px] text-slate-900 leading-snug" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Kế hoạch Thiết kế & Phát triển</h2>
          <p className="text-[13px] text-slate-700 mt-0.5">{TOC_ITEMS.length} sections · PRD toàn diện</p>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {TOC_ITEMS.map((item,i)=>{ const Icon=item.icon; const a=active===item.id; return (
            <button key={item.id} onClick={()=>scrollTo(item.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-[6px] text-left text-[13px] transition-colors" style={{ background:a?"rgba(28,95,190,0.12)":"transparent",color:a?"#1C5FBE":"#5a5040",fontFamily: "var(--font-sans)",fontWeight:a?700:400,borderLeft:a?"2px solid #1C5FBE":"2px solid transparent" }}>
              <span className="text-[13px] text-slate-700 w-4 shrink-0" style={{ fontFamily:"JetBrains Mono, monospace" }}>{String(i+1).padStart(2,"0")}</span>
              <Icon className="size-3.5 shrink-0"/>
              <span className="truncate">{item.label}</span>
            </button>
          );})}
        </nav>
        <div className="p-4 border-t border-[#e2e8f0] text-[13px] text-slate-600" style={{ fontFamily: "var(--font-sans)" }}>
          PRD v2.0 · Đồng Nai · 24/04/2026
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <OverviewSection/>
        {MODULES.map(m=><ModuleSection key={m.id} mod={m}/>)}
        <UserFlowsSection/>
        <UXPatternsSection/>
        <ScalabilitySection/>
        <BusinessRulesSection/>
        <DesignSystemSection/>
        <SprintRoadmapSection/>
        <ApiContractSection/>
        <SecuritySection/>
        <IntegrationsSection/>
        <TestingSection/>
        <div className="border-t border-[#e2e8f0] pt-6 pb-8 text-center">
          <div className="text-[13px] text-slate-700">Tài liệu PRD toàn diện · Nền tảng VPTU Đồng Nai v2.0</div>
          <div className="text-[13px] text-slate-700 mt-1">Văn phòng Tỉnh ủy Đồng Nai · {MODULES.reduce((s,m)=>s+m.screens.length,0)} screens · {BUSINESS_RULES.length} rules · {SPRINTS.reduce((s,sp)=>s+sp.tasks.length,0)} sprint tasks · {API_GROUPS.reduce((s,g)=>s+g.endpoints.length,0)} API endpoints · 5 roles</div>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {["Luật TĐKT 2022","NĐ 152/2025/NĐ-CP","TT 15/2025/TT-BNV","QĐ 34/2021","NĐ 130/2018","NĐ 13/2023"].map(d=>(
              <span key={d} className="text-[13px] px-2 py-0.5 rounded" style={{ background:"#fdf3d9",color:"#7d5a10",fontFamily: "var(--font-sans)" }}>{d}</span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
