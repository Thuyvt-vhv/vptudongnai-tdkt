import { useState, useEffect } from "react";
import {
  Search, User, Users, Star, Award, CalendarDays, Building2,
  Filter, Eye, ChevronRight, Trophy, TrendingUp,
  Sparkles, CheckCircle2, XCircle, AlertCircle, Clock,
  FileText, Download, X, Plus, ChevronDown, Loader2,
  Shield, Brain, BarChart2, Edit3, Phone, Mail,
  BookOpen, Briefcase, Zap, LayoutGrid, LayoutList,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface AwardHistory {
  type: string; year: number; level: string; qd: string; status: "confirmed" | "pending";
}
interface WorkHistory {
  period: string; chucVu: string; donVi: string; phongTrao?: string;
}
interface CanBo {
  id: string; name: string; position: string; unit: string;
  dob: string; gender: "nam" | "nu"; joinYear: number;
  score: number; phone: string; email: string;
  awards: AwardHistory[];
  workHistory: WorkHistory[];
  eligibleFor: string[];
  aiScore: number;
  note?: string;
  completeness: number; // profile completeness %
}

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const CAN_BO_LIST: CanBo[] = [
  {
    id: "1", name: "Lê Thị Thanh Xuân", position: "Phó Giám đốc", unit: "Sở Giáo dục & Đào tạo",
    dob: "15/03/1975", gender: "nu", joinYear: 1997, score: 94, phone: "0912.345.678", email: "ltxuan@gddt.dongnai.gov.vn",
    awards: [
      { type: "CSTĐ cấp Tỉnh", year: 2023, level: "Tỉnh", qd: "001/QĐ-TU-2023", status: "confirmed" },
      { type: "Bằng khen UBND Tỉnh", year: 2021, level: "Tỉnh", qd: "108/QĐ-TU-2021", status: "confirmed" },
      { type: "Bằng khen Bộ GD&ĐT", year: 2019, level: "Bộ", qd: "BK-GD-2019-114", status: "confirmed" },
    ],
    workHistory: [
      { period: "2018 – nay", chucVu: "Phó Giám đốc", donVi: "Sở GD&ĐT Đồng Nai", phongTrao: "Lao động giỏi 2026" },
      { period: "2010 – 2018", chucVu: "Trưởng phòng GD Tiểu học", donVi: "Sở GD&ĐT" },
      { period: "1997 – 2010", chucVu: "Chuyên viên", donVi: "Sở GD&ĐT Đồng Nai" },
    ],
    eligibleFor: ["CSTĐ cấp Tỉnh (năm 3)", "Huân chương LĐ hạng Ba"],
    aiScore: 94.2, completeness: 98,
  },
  {
    id: "2", name: "Phạm Hoàng Liêm", position: "Trưởng phòng KH&TĐ", unit: "Sở Kế hoạch & Đầu tư",
    dob: "22/07/1970", gender: "nam", joinYear: 1993, score: 88, phone: "0987.654.321", email: "phliêm@khdt.dongnai.gov.vn",
    awards: [
      { type: "Huân chương LĐ hạng Ba", year: 2024, level: "Nhà nước", qd: "200/QĐ-CTN-2024", status: "confirmed" },
      { type: "CSTĐ cấp Tỉnh", year: 2022, level: "Tỉnh", qd: "085/QĐ-TU-2022", status: "confirmed" },
    ],
    workHistory: [
      { period: "2015 – nay", chucVu: "Trưởng phòng KH&TĐ", donVi: "Sở KH&ĐT Đồng Nai" },
      { period: "1993 – 2015", chucVu: "Chuyên viên → Phó phòng", donVi: "Sở KH&ĐT Đồng Nai" },
    ],
    eligibleFor: ["Bằng khen UBND Tỉnh"],
    aiScore: 88.4, completeness: 91,
  },
  {
    id: "3", name: "Nguyễn Phú Trọng Khoa", position: "Bác sĩ CKI", unit: "BV Đa khoa Đồng Nai",
    dob: "10/11/1980", gender: "nam", joinYear: 2005, score: 91, phone: "0939.111.222", email: "nptkhoa@bvdk.dongnai.gov.vn",
    awards: [
      { type: "CSTĐ cấp Tỉnh", year: 2024, level: "Tỉnh", qd: "047/QĐ-TU-2024", status: "confirmed" },
      { type: "Bằng khen UBND Tỉnh", year: 2022, level: "Tỉnh", qd: "109/QĐ-TU-2022", status: "confirmed" },
    ],
    workHistory: [
      { period: "2010 – nay", chucVu: "Bác sĩ CKI – Khoa Nội", donVi: "BV Đa khoa ĐN", phongTrao: "Lao động giỏi 2026" },
      { period: "2005 – 2010", chucVu: "Bác sĩ nội trú", donVi: "BV Đa khoa ĐN" },
    ],
    eligibleFor: ["CSTĐ cấp Tỉnh (năm 2)", "Bằng khen Bộ Y tế"],
    aiScore: 91.5, completeness: 95,
  },
  {
    id: "4", name: "Trần Thị Kim Oanh", position: "Giáo viên THPT", unit: "THPT Chuyên Lương Thế Vinh",
    dob: "05/09/1985", gender: "nu", joinYear: 2008, score: 87, phone: "0905.777.888", email: "ttkoanh@thptltv.edu.vn",
    awards: [
      { type: "GV dạy giỏi toàn quốc", year: 2023, level: "Quốc gia", qd: "GV-TQ-2023-041", status: "confirmed" },
      { type: "Bằng khen Bộ GD&ĐT", year: 2021, level: "Bộ", qd: "BK-GD-2021-088", status: "confirmed" },
    ],
    workHistory: [
      { period: "2014 – nay", chucVu: "GV THPT Chuyên Toán", donVi: "THPT Chuyên LTV" },
      { period: "2008 – 2014", chucVu: "Giáo viên THPT", donVi: "THPT Long Khánh" },
    ],
    eligibleFor: ["CSTĐ cơ sở (năm 3)", "CSTĐ cấp Tỉnh"],
    aiScore: 87.2, completeness: 85,
  },
  {
    id: "5", name: "Đinh Công Sơn", position: "Kỹ sư CNTT", unit: "Sở Thông tin & Truyền thông",
    dob: "14/04/1990", gender: "nam", joinYear: 2013, score: 80, phone: "0901.234.567", email: "dcson@stttt.dongnai.gov.vn",
    awards: [
      { type: "Bằng khen UBND Tỉnh", year: 2025, level: "Tỉnh", qd: "015/QĐ-TU-2025", status: "confirmed" },
    ],
    workHistory: [
      { period: "2017 – nay", chucVu: "Kỹ sư CNTT", donVi: "Sở TT&TT Đồng Nai" },
      { period: "2013 – 2017", chucVu: "Chuyên viên CNTT", donVi: "VP UBND Tỉnh" },
    ],
    eligibleFor: ["CSTĐ cơ sở"],
    aiScore: 80.3, completeness: 72,
  },
  {
    id: "6", name: "Võ Thị Ngọc Hà", position: "Điều dưỡng trưởng", unit: "BV Nhi Đồng Đồng Nai",
    dob: "30/01/1988", gender: "nu", joinYear: 2010, score: 76, phone: "0908.999.000", email: "vtnha@bvnhi.dongnai.gov.vn",
    awards: [],
    workHistory: [
      { period: "2015 – nay", chucVu: "Điều dưỡng trưởng Khoa A2", donVi: "BV Nhi ĐN" },
      { period: "2010 – 2015", chucVu: "Điều dưỡng viên", donVi: "BV Nhi ĐN" },
    ],
    eligibleFor: [],
    aiScore: 76.1, completeness: 61, note: "Cần thêm 1 năm hoàn thành xuất sắc liên tục.",
  },
  {
    id: "7", name: "Nguyễn Văn Hùng", position: "Giám đốc", unit: "Sở Tài chính",
    dob: "03/06/1968", gender: "nam", joinYear: 1990, score: 96, phone: "0913.456.789", email: "nvhung@stc.dongnai.gov.vn",
    awards: [
      { type: "Huân chương LĐ hạng Nhì", year: 2022, level: "Nhà nước", qd: "155/QĐ-CTN-2022", status: "confirmed" },
      { type: "CSTĐ cấp Tỉnh", year: 2020, level: "Tỉnh", qd: "072/QĐ-TU-2020", status: "confirmed" },
      { type: "Bằng khen Bộ Tài chính", year: 2017, level: "Bộ", qd: "BK-TC-2017-033", status: "confirmed" },
    ],
    workHistory: [
      { period: "2020 – nay", chucVu: "Giám đốc Sở Tài chính", donVi: "Sở Tài chính ĐN", phongTrao: "Lao động giỏi 2026" },
      { period: "2010 – 2020", chucVu: "Phó Giám đốc", donVi: "Sở Tài chính ĐN" },
      { period: "1990 – 2010", chucVu: "Chuyên viên → Trưởng phòng", donVi: "Sở Tài chính ĐN" },
    ],
    eligibleFor: ["Huân chương LĐ hạng Nhất", "CSTĐ toàn quốc"],
    aiScore: 96.8, completeness: 100,
  },
  {
    id: "8", name: "Bùi Thị Lan Hương", position: "Phó trưởng phòng", unit: "Sở Lao động TB&XH",
    dob: "17/11/1983", gender: "nu", joinYear: 2006, score: 83, phone: "0916.222.333", email: "btlhuong@sldtbxh.dongnai.gov.vn",
    awards: [
      { type: "CSTĐ cơ sở", year: 2024, level: "Tỉnh", qd: "021/QĐ-SLĐTBXH-2024", status: "confirmed" },
      { type: "Bằng khen UBND Tỉnh", year: 2022, level: "Tỉnh", qd: "130/QĐ-TU-2022", status: "confirmed" },
    ],
    workHistory: [
      { period: "2018 – nay", chucVu: "Phó trưởng phòng Việc làm", donVi: "Sở LĐTB&XH ĐN" },
      { period: "2006 – 2018", chucVu: "Chuyên viên", donVi: "Sở LĐTB&XH ĐN" },
    ],
    eligibleFor: ["CSTĐ cấp Tỉnh (năm 1)"],
    aiScore: 83.1, completeness: 88,
  },
  {
    id: "9", name: "Lý Minh Tuấn", position: "Thanh tra viên chính", unit: "Thanh tra tỉnh Đồng Nai",
    dob: "28/02/1977", gender: "nam", joinYear: 2001, score: 89, phone: "0918.333.444", email: "lmtuan@thanhtra.dongnai.gov.vn",
    awards: [
      { type: "CSTĐ cấp Tỉnh", year: 2023, level: "Tỉnh", qd: "056/QĐ-TU-2023", status: "confirmed" },
      { type: "Bằng khen Thanh tra Chính phủ", year: 2021, level: "Bộ", qd: "BK-TTCP-2021-044", status: "confirmed" },
      { type: "Bằng khen UBND Tỉnh", year: 2019, level: "Tỉnh", qd: "097/QĐ-TU-2019", status: "confirmed" },
    ],
    workHistory: [
      { period: "2015 – nay", chucVu: "Thanh tra viên chính", donVi: "Thanh tra tỉnh ĐN" },
      { period: "2001 – 2015", chucVu: "Chuyên viên → Thanh tra viên", donVi: "Thanh tra tỉnh ĐN" },
    ],
    eligibleFor: ["Bằng khen Chính phủ"],
    aiScore: 89.3, completeness: 93,
  },
  {
    id: "10", name: "Hoàng Thị Mỹ Linh", position: "Kế toán trưởng", unit: "VP UBND tỉnh Đồng Nai",
    dob: "09/05/1982", gender: "nu", joinYear: 2004, score: 85, phone: "0911.555.666", email: "htmlinh@vpubnd.dongnai.gov.vn",
    awards: [
      { type: "Bằng khen UBND Tỉnh", year: 2024, level: "Tỉnh", qd: "018/QĐ-TU-2024", status: "confirmed" },
      { type: "CSTĐ cơ sở", year: 2023, level: "Tỉnh", qd: "003/QĐ-VPUBND-2023", status: "confirmed" },
    ],
    workHistory: [
      { period: "2016 – nay", chucVu: "Kế toán trưởng", donVi: "VP UBND tỉnh ĐN", phongTrao: "Lao động giỏi 2026" },
      { period: "2004 – 2016", chucVu: "Chuyên viên kế toán", donVi: "VP UBND tỉnh ĐN" },
    ],
    eligibleFor: ["CSTĐ cấp Tỉnh (năm 2)"],
    aiScore: 85.6, completeness: 90,
  },
  {
    id: "11", name: "Đặng Quốc Bảo", position: "Phó Chánh Văn phòng", unit: "VP UBND tỉnh Đồng Nai",
    dob: "11/08/1979", gender: "nam", joinYear: 2003, score: 92, phone: "0903.444.555", email: "dqbao@vpubnd.dongnai.gov.vn",
    awards: [
      { type: "CSTĐ cấp Tỉnh", year: 2024, level: "Tỉnh", qd: "042/QĐ-TU-2024", status: "confirmed" },
      { type: "Bằng khen Chính phủ", year: 2022, level: "Nhà nước", qd: "320/QĐ-TTg-2022", status: "confirmed" },
      { type: "Bằng khen UBND Tỉnh", year: 2020, level: "Tỉnh", qd: "078/QĐ-TU-2020", status: "confirmed" },
    ],
    workHistory: [
      { period: "2019 – nay", chucVu: "Phó Chánh Văn phòng", donVi: "VP UBND tỉnh ĐN" },
      { period: "2003 – 2019", chucVu: "Chuyên viên → Trưởng phòng", donVi: "VP UBND tỉnh ĐN" },
    ],
    eligibleFor: ["Huân chương LĐ hạng Ba", "CSTĐ cấp Tỉnh (năm 3)"],
    aiScore: 92.4, completeness: 97,
  },
  {
    id: "12", name: "Phan Thị Thu Thảo", position: "Chuyên viên chính", unit: "Sở Nội vụ",
    dob: "25/12/1987", gender: "nu", joinYear: 2010, score: 78, phone: "0907.888.111", email: "ptthao@snv.dongnai.gov.vn",
    awards: [
      { type: "CSTĐ cơ sở", year: 2023, level: "Tỉnh", qd: "011/QĐ-SNV-2023", status: "confirmed" },
    ],
    workHistory: [
      { period: "2018 – nay", chucVu: "Chuyên viên chính Phòng CCVC", donVi: "Sở Nội vụ ĐN" },
      { period: "2010 – 2018", chucVu: "Chuyên viên", donVi: "Sở Nội vụ ĐN" },
    ],
    eligibleFor: [],
    aiScore: 78.5, completeness: 74, note: "Cần thêm 2 năm CSTĐ cơ sở liên tiếp để đủ điều kiện CSTĐ cấp Tỉnh.",
  },
  {
    id: "13", name: "Cao Văn Nghĩa", position: "Kỹ sư xây dựng", unit: "Sở Xây dựng",
    dob: "07/03/1984", gender: "nam", joinYear: 2009, score: 82, phone: "0919.777.222", email: "cvnghia@sxd.dongnai.gov.vn",
    awards: [
      { type: "Bằng khen UBND Tỉnh", year: 2023, level: "Tỉnh", qd: "091/QĐ-TU-2023", status: "confirmed" },
      { type: "CSTĐ cơ sở", year: 2022, level: "Tỉnh", qd: "007/QĐ-SXD-2022", status: "confirmed" },
    ],
    workHistory: [
      { period: "2016 – nay", chucVu: "Kỹ sư xây dựng chính", donVi: "Sở Xây dựng ĐN" },
      { period: "2009 – 2016", chucVu: "Kỹ sư tập sự → chính", donVi: "Sở Xây dựng ĐN" },
    ],
    eligibleFor: ["CSTĐ cơ sở (năm 3)"],
    aiScore: 82.0, completeness: 80,
  },
  {
    id: "14", name: "Trương Thị Bích Vân", position: "Dược sĩ chuyên khoa I", unit: "BV Đa khoa Đồng Nai",
    dob: "19/06/1986", gender: "nu", joinYear: 2011, score: 86, phone: "0906.123.456", email: "ttbvan@bvdk.dongnai.gov.vn",
    awards: [
      { type: "CSTĐ cấp Tỉnh", year: 2025, level: "Tỉnh", qd: "029/QĐ-TU-2025", status: "confirmed" },
      { type: "Bằng khen Bộ Y tế", year: 2023, level: "Bộ", qd: "BK-BYT-2023-088", status: "confirmed" },
    ],
    workHistory: [
      { period: "2017 – nay", chucVu: "Dược sĩ CKI – Khoa Dược", donVi: "BV Đa khoa ĐN", phongTrao: "Lao động giỏi 2026" },
      { period: "2011 – 2017", chucVu: "Dược sĩ", donVi: "BV Đa khoa ĐN" },
    ],
    eligibleFor: ["CSTĐ cấp Tỉnh (năm 2)"],
    aiScore: 86.9, completeness: 87,
  },
  {
    id: "15", name: "Lê Văn Phước", position: "Chuyên viên chính", unit: "Sở Tài nguyên & Môi trường",
    dob: "23/09/1981", gender: "nam", joinYear: 2005, score: 74, phone: "0909.321.654", email: "lvphuoc@stnmt.dongnai.gov.vn",
    awards: [],
    workHistory: [
      { period: "2015 – nay", chucVu: "Chuyên viên chính Phòng QLMT", donVi: "Sở TNMT ĐN" },
      { period: "2005 – 2015", chucVu: "Chuyên viên", donVi: "Sở TNMT ĐN" },
    ],
    eligibleFor: [],
    aiScore: 74.2, completeness: 55, note: "Hồ sơ thiếu minh chứng 3 năm gần nhất; chưa có thành tích khen thưởng.",
  },
  {
    id: "16", name: "Ngô Thị Hải Yến", position: "Phó Giám đốc", unit: "BV Nhi Đồng Đồng Nai",
    dob: "12/04/1974", gender: "nu", joinYear: 1998, score: 93, phone: "0914.888.999", email: "nthyen@bvnhi.dongnai.gov.vn",
    awards: [
      { type: "Thầy thuốc Ưu tú", year: 2023, level: "Nhà nước", qd: "450/QĐ-CTN-2023", status: "confirmed" },
      { type: "CSTĐ cấp Tỉnh", year: 2021, level: "Tỉnh", qd: "066/QĐ-TU-2021", status: "confirmed" },
      { type: "Bằng khen Bộ Y tế", year: 2018, level: "Bộ", qd: "BK-BYT-2018-055", status: "confirmed" },
    ],
    workHistory: [
      { period: "2017 – nay", chucVu: "Phó Giám đốc", donVi: "BV Nhi ĐN" },
      { period: "2010 – 2017", chucVu: "Trưởng Khoa Hô hấp", donVi: "BV Nhi ĐN" },
      { period: "1998 – 2010", chucVu: "Bác sĩ nội trú → CKI", donVi: "BV Nhi ĐN" },
    ],
    eligibleFor: ["Huân chương LĐ hạng Ba", "CSTĐ cấp Tỉnh (năm 3)"],
    aiScore: 93.7, completeness: 96,
  },
  {
    id: "17", name: "Vũ Đức Thắng", position: "Trưởng phòng QLĐT", unit: "Sở Giáo dục & Đào tạo",
    dob: "01/01/1976", gender: "nam", joinYear: 1999, score: 90, phone: "0915.111.222", email: "vdthang@gddt.dongnai.gov.vn",
    awards: [
      { type: "CSTĐ cấp Tỉnh", year: 2024, level: "Tỉnh", qd: "038/QĐ-TU-2024", status: "confirmed" },
      { type: "Bằng khen Bộ GD&ĐT", year: 2022, level: "Bộ", qd: "BK-GD-2022-121", status: "confirmed" },
    ],
    workHistory: [
      { period: "2016 – nay", chucVu: "Trưởng phòng QLĐT", donVi: "Sở GD&ĐT ĐN", phongTrao: "Lao động giỏi 2026" },
      { period: "1999 – 2016", chucVu: "GV → Chuyên viên → Phó phòng", donVi: "Sở GD&ĐT ĐN" },
    ],
    eligibleFor: ["Huân chương LĐ hạng Ba"],
    aiScore: 90.1, completeness: 94,
  },
  {
    id: "18", name: "Trịnh Thị Hồng Nhung", position: "Chuyên viên", unit: "Sở Lao động TB&XH",
    dob: "14/07/1993", gender: "nu", joinYear: 2016, score: 71, phone: "0921.444.555", email: "tthnhung@sldtbxh.dongnai.gov.vn",
    awards: [],
    workHistory: [
      { period: "2016 – nay", chucVu: "Chuyên viên Phòng Bảo vệ trẻ em", donVi: "Sở LĐTB&XH ĐN" },
    ],
    eligibleFor: [],
    aiScore: 71.0, completeness: 63,
  },
  {
    id: "19", name: "Hồ Quang Vinh", position: "Phó trưởng phòng", unit: "Sở Kế hoạch & Đầu tư",
    dob: "30/10/1980", gender: "nam", joinYear: 2004, score: 84, phone: "0922.666.777", email: "hqvinh@khdt.dongnai.gov.vn",
    awards: [
      { type: "Bằng khen UBND Tỉnh", year: 2025, level: "Tỉnh", qd: "022/QĐ-TU-2025", status: "confirmed" },
      { type: "CSTĐ cơ sở", year: 2024, level: "Tỉnh", qd: "005/QĐ-SKHDT-2024", status: "confirmed" },
    ],
    workHistory: [
      { period: "2018 – nay", chucVu: "Phó trưởng phòng Đăng ký kinh doanh", donVi: "Sở KH&ĐT ĐN" },
      { period: "2004 – 2018", chucVu: "Chuyên viên → Chuyên viên chính", donVi: "Sở KH&ĐT ĐN" },
    ],
    eligibleFor: ["CSTĐ cấp Tỉnh (năm 1)"],
    aiScore: 84.3, completeness: 82,
  },
  {
    id: "20", name: "Kiều Thanh Phương", position: "Kiểm soát viên chính", unit: "Thanh tra tỉnh Đồng Nai",
    dob: "05/03/1978", gender: "nu", joinYear: 2002, score: 88, phone: "0923.999.000", email: "ktphuong@thanhtra.dongnai.gov.vn",
    awards: [
      { type: "Bằng khen Thanh tra Chính phủ", year: 2024, level: "Bộ", qd: "BK-TTCP-2024-017", status: "confirmed" },
      { type: "CSTĐ cấp Tỉnh", year: 2022, level: "Tỉnh", qd: "079/QĐ-TU-2022", status: "confirmed" },
      { type: "Bằng khen UBND Tỉnh", year: 2020, level: "Tỉnh", qd: "105/QĐ-TU-2020", status: "confirmed" },
    ],
    workHistory: [
      { period: "2016 – nay", chucVu: "Kiểm soát viên chính", donVi: "Thanh tra tỉnh ĐN", phongTrao: "Lao động giỏi 2026" },
      { period: "2002 – 2016", chucVu: "Chuyên viên → Thanh tra viên", donVi: "Thanh tra tỉnh ĐN" },
    ],
    eligibleFor: ["Bằng khen Chính phủ", "Huân chương LĐ hạng Ba"],
    aiScore: 88.7, completeness: 92,
  },
];

const LEVEL_CFG: Record<string, { color: string; bg: string }> = {
  "Nhà nước": { color: "#7d5a10", bg: "#fdf3d9" },
  "Quốc gia": { color: "#6d28d9", bg: "#ede9fe" },
  "Bộ":       { color: "#1C5FBE", bg: "#ddeafc" },
  "Tỉnh":     { color: "#047857", bg: "#d1fae5" },
};

const PAGE_SIZE = 10;

const ALL_UNITS = Array.from(new Set(CAN_BO_LIST.map(c => c.unit))).sort();

type SortKey = "score" | "completeness" | "name" | "joinYear";

/* ═══════════════════════════════════════════════════════════════
   AI ELIGIBILITY PANEL
═══════════════════════════════════════════════════════════════ */
function AiEligibilityPanel({ cb, onClose }: { cb: CanBo; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1600); return () => clearTimeout(t); }, []);

  const checks = [
    { label: "Hoàn thành xuất sắc nhiệm vụ ≥ 2 năm liên tục", ok: cb.score >= 80 },
    { label: "Không vi phạm kỷ luật trong kỳ xét", ok: true },
    { label: "Có sáng kiến/đề tài khoa học được công nhận", ok: cb.score >= 85 },
    { label: "Thời gian công tác đủ theo quy định", ok: (2026 - cb.joinYear) >= 5 },
    { label: "Đã đạt danh hiệu CSTĐ cơ sở ≥ 2 năm (cho CSTĐ cấp Tỉnh)", ok: cb.awards.filter(a => a.level === "Tỉnh").length >= 2 || cb.awards.some(a => a.type.includes("CSTĐ")) },
    { label: "Hồ sơ đầy đủ, không trùng lặp với hệ thống", ok: cb.completeness >= 85 },
  ];
  const passCount = checks.filter(c => c.ok).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-[520px] rounded-[16px] overflow-hidden shadow-2xl" style={{ background: "white" }}>
        <div className="p-5" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background: "rgba(88,28,220,0.3)" }}>
              <Brain className="size-5 text-[#a78bfa]" />
            </div>
            <div>
              <h3 className="text-[14px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>AI kiểm tra điều kiện</h3>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }}>Đối chiếu Luật TĐKT 2022 + NĐ 152/2025/NĐ-CP</p>
            </div>
            <button onClick={onClose} className="ml-auto size-8 rounded-lg flex items-center justify-center hover:bg-white/10">
              <X className="size-4 text-white/50" />
            </button>
          </div>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="size-8 text-[#7c3aed] animate-spin" />
              <p className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>Trợ lý AI đang phân tích hồ sơ...</p>
            </div>
          ) : (
            <>
              {/* Score */}
              <div className="flex items-center gap-4 p-4 rounded-[10px] mb-4" style={{ background: cb.aiScore >= 85 ? "#dcfce7" : cb.aiScore >= 75 ? "#fef3c7" : "#fee2e2" }}>
                <div className="text-[40px] leading-none" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: cb.aiScore >= 85 ? "#166534" : cb.aiScore >= 75 ? "#b45309" : "#c8102e" }}>
                  {cb.aiScore}
                </div>
                <div>
                  <div className="text-[13px]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: "#0b1426" }}>
                    {cb.aiScore >= 90 ? "Rất cao — Ưu tiên đề nghị" : cb.aiScore >= 80 ? "Tốt — Đủ điều kiện" : "Trung bình — Cần bổ sung"}
                  </div>
                  <div className="text-[13px] text-[#635647]">Điểm AI đánh giá / 100 · {passCount}/{checks.length} điều kiện đạt</div>
                </div>
              </div>
              {/* Checks */}
              <div className="space-y-2 mb-4">
                {checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-[8px]" style={{ background: c.ok ? "#f0fdf4" : "#fff5f5" }}>
                    {c.ok ? <CheckCircle2 className="size-4 text-[#166534] shrink-0" /> : <XCircle className="size-4 text-[#c8102e] shrink-0" />}
                    <span className="text-[13px]" style={{ color: c.ok ? "#166534" : "#c8102e", fontFamily: "var(--font-sans)" }}>{c.label}</span>
                  </div>
                ))}
              </div>
              {/* Eligible for */}
              {cb.eligibleFor.length > 0 ? (
                <div className="p-3 rounded-[10px] border-2 border-[#86efac] mb-3" style={{ background: "#f0fdf4" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-[#166534]" />
                    <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Đủ điều kiện đề nghị</span>
                  </div>
                  {cb.eligibleFor.map(e => (
                    <div key={e} className="flex items-center gap-2 text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>
                      <ChevronRight className="size-3.5" />{e}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-[10px] border border-[#fca5a5] mb-3" style={{ background: "#fff5f5" }}>
                  <p className="text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)" }}>Chưa đủ điều kiện đề nghị danh hiệu thi đua.</p>
                </div>
              )}
              {cb.note && (
                <div className="p-3 rounded-[8px] flex items-start gap-2" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                  <AlertCircle className="size-3.5 text-[#8a6400] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>{cb.note}</p>
                </div>
              )}
              <button onClick={onClose} className="w-full mt-3 py-2.5 rounded-[8px] text-[13px] text-white"
                style={{ background: "#0b1426", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Đóng</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE DETAIL DRAWER
═══════════════════════════════════════════════════════════════ */
function ProfileDrawer({ cb, onClose, onAICheck }: { cb: CanBo; onClose: () => void; onAICheck: () => void }) {
  const [tab, setTab] = useState<"overview" | "awards" | "work" | "docs">("overview");
  const years = 2026 - cb.joinYear;

  return (
    <div className="fixed inset-0 z-40 flex" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="ml-auto h-full w-[600px] flex flex-col shadow-2xl overflow-hidden" style={{ background: "white" }}>
        {/* Header */}
        <div className="p-5 shrink-0" style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="size-14 rounded-full flex items-center justify-center text-[18px] text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#1C5FBE,#0b1426)", fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {cb.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-[18px] text-white" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{cb.name}</h2>
              <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)" }}>{cb.position} · {cb.unit}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans)" }}>{years} năm công tác</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <div className="h-full rounded-full" style={{ width: `${cb.completeness}%`, background: cb.completeness >= 90 ? "#4ade80" : cb.completeness >= 70 ? "#fbbf24" : "#f87171" }} />
                  </div>
                  <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>{cb.completeness}% hồ sơ</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-white/10 shrink-0">
              <X className="size-4 text-white/50" />
            </button>
          </div>
          {/* AI check button */}
          <button onClick={onAICheck}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] text-[13px] text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            <Brain className="size-4" /><Sparkles className="size-3.5" />
            Kiểm tra điều kiện khen thưởng (AI)
          </button>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-[#e2e8f0] shrink-0" style={{ background: "#ffffff" }}>
          {([["overview", "Tổng quan"], ["awards", `Thành tích (${cb.awards.length})`], ["work", "Quá trình"], ["docs", "Tài liệu"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className="flex-1 py-2.5 text-[13px] border-b-2 transition-colors"
              style={{ borderColor: tab === k ? "#1C5FBE" : "transparent", color: tab === k ? "#1C5FBE" : "#635647", fontFamily: "var(--font-sans)", fontWeight: tab === k ? 700 : 400 }}>
              {l}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5" style={{ background: "#ffffff" }}>
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden" style={{ background: "white" }}>
                <div className="px-4 py-2.5 border-b border-[#e2e8f0]" style={{ background: "#f4f7fb" }}>
                  <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Thông tin cơ bản</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3 text-[13px]">
                  {[
                    ["Họ và tên", cb.name], ["Chức vụ", cb.position],
                    ["Đơn vị", cb.unit], ["Ngày sinh", cb.dob],
                    ["Giới tính", cb.gender === "nam" ? "Nam" : "Nữ"], ["Năm vào ngành", String(cb.joinYear)],
                    ["Số điện thoại", cb.phone], ["Email", cb.email],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[13px] uppercase tracking-wider text-[#635647] mb-0.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{k}</div>
                      <div className="text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Eligible */}
              {cb.eligibleFor.length > 0 && (
                <div className="rounded-[10px] border-2 border-[#86efac] p-4" style={{ background: "#f0fdf4" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-[#166534]" />
                    <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>AI: Đủ điều kiện đề nghị</span>
                  </div>
                  {cb.eligibleFor.map(e => <div key={e} className="text-[13px] text-[#166534] flex items-center gap-1.5"><ChevronRight className="size-3.5" />{e}</div>)}
                </div>
              )}
              {/* Score */}
              <div className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background: "white" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Điểm thi đua năm 2026</span>
                  <span className="text-[24px] text-[#8a6400]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{cb.score}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#eef2f8" }}>
                  <div className="h-full rounded-full" style={{ width: `${cb.score}%`, background: `linear-gradient(to right,#8a6400,#f0c040)` }} />
                </div>
              </div>
            </div>
          )}
          {tab === "awards" && (
            <div className="space-y-3">
              {cb.awards.length === 0 && (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Award className="size-10 text-[#d1ccc0]" />
                  <p className="text-[13px] text-[#635647]">Chưa có thành tích được ghi nhận</p>
                </div>
              )}
              {cb.awards.map((a, i) => {
                const lc = LEVEL_CFG[a.level] ?? { color: "#635647", bg: "#eef2f8" };
                return (
                  <div key={i} className="rounded-[10px] border border-[#e2e8f0] p-4" style={{ background: "white" }}>
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: lc.bg }}>
                        <Award className="size-5" style={{ color: lc.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{a.type}</span>
                          <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background: lc.bg, color: lc.color, fontFamily: "var(--font-sans)", fontWeight: 700 }}>{a.level}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[13px] text-[#635647]">
                          <span>Năm {a.year}</span>
                          <span>·</span>
                          <code style={{ fontFamily: "JetBrains Mono, monospace" }}>{a.qd}</code>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-[#166534]"><CheckCircle2 className="size-3" />Đã xác nhận</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {tab === "work" && (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: "#e2e8f0" }} />
              <div className="space-y-4">
                {cb.workHistory.map((w, i) => (
                  <div key={i} className="flex gap-4 pl-11 relative">
                    <div className="absolute left-3.5 top-2 size-3 rounded-full border-2" style={{ background: i === 0 ? "#1C5FBE" : "white", borderColor: "#1C5FBE" }} />
                    <div className="flex-1 rounded-[10px] border border-[#e2e8f0] p-3" style={{ background: "white" }}>
                      <div className="text-[13px] text-[#0b1426] mb-0.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{w.chucVu}</div>
                      <div className="text-[13px] text-[#5a5040]">{w.donVi}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "JetBrains Mono, monospace" }}>{w.period}</span>
                        {w.phongTrao && (
                          <span className="text-[13px] text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)" }}>📌 {w.phongTrao}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "docs" && (
            <div className="space-y-2">
              {["Lý lịch trích ngang (06-BNV)", "Bằng khen gốc scan", "Quyết định bổ nhiệm", "Bảng điểm thi đua 3 năm gần nhất"].map(d => (
                <div key={d} className="flex items-center gap-3 p-3 rounded-[8px] border border-[#e2e8f0]" style={{ background: "white" }}>
                  <FileText className="size-4 text-[#1C5FBE]" />
                  <span className="flex-1 text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>{d}</span>
                  <button className="flex items-center gap-1 text-[13px] text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)" }}>
                    <Download className="size-3.5" />Tải
                  </button>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] border-2 border-dashed border-[#d1d5db] text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                <Plus className="size-4" />Tải lên tài liệu mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function HoSoCanBoPage({ user }: { user: LoginUser }) {
  const { theme } = useTheme();
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState<CanBo | null>(null);
  const [aiTarget, setAiTarget]         = useState<CanBo | null>(null);
  const [viewMode, setViewMode]         = useState<"list" | "grid">("list");
  const [page, setPage]                 = useState(1);
  const [showFilters, setShowFilters]   = useState(false);

  /* ── filters ───────────────────────────────────────────────── */
  const [fUnit,      setFUnit]      = useState("all");
  const [fStatus,    setFStatus]    = useState<"all" | "eligible" | "not">("all");
  const [fScore,     setFScore]     = useState<"all" | "90+" | "80-89" | "70-79" | "<70">("all");
  const [fComplete,  setFComplete]  = useState<"all" | "90+" | "<80">("all");
  const [sortKey,    setSortKey]    = useState<SortKey>("score");

  const activeFilterCount = [
    fUnit !== "all", fStatus !== "all", fScore !== "all", fComplete !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => { setFUnit("all"); setFStatus("all"); setFScore("all"); setFComplete("all"); setPage(1); };

  /* ── derived list ──────────────────────────────────────────── */
  const filtered = CAN_BO_LIST
    .filter(cb => {
      if (search) {
        const q = search.toLowerCase();
        if (!cb.name.toLowerCase().includes(q) && !cb.unit.toLowerCase().includes(q) && !cb.position.toLowerCase().includes(q)) return false;
      }
      if (fUnit !== "all" && cb.unit !== fUnit) return false;
      if (fStatus === "eligible" && cb.eligibleFor.length === 0) return false;
      if (fStatus === "not"      && cb.eligibleFor.length > 0)  return false;
      if (fScore === "90+"   && cb.score < 90)                  return false;
      if (fScore === "80-89" && (cb.score < 80 || cb.score >= 90)) return false;
      if (fScore === "70-79" && (cb.score < 70 || cb.score >= 80)) return false;
      if (fScore === "<70"   && cb.score >= 70)                  return false;
      if (fComplete === "90+" && cb.completeness < 90)           return false;
      if (fComplete === "<80" && cb.completeness >= 80)          return false;
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "score")       return b.score - a.score;
      if (sortKey === "completeness") return b.completeness - a.completeness;
      if (sortKey === "name")        return a.name.localeCompare(b.name, "vi");
      if (sortKey === "joinYear")    return a.joinYear - b.joinYear;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const visible    = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const STATS = [
    { l: "Tổng cán bộ",       v: CAN_BO_LIST.length,                                       icon: Users,        c: "#1C5FBE", bg: "#ddeafc" },
    { l: "Đủ điều kiện KT",   v: CAN_BO_LIST.filter(c => c.eligibleFor.length > 0).length, icon: Sparkles,     c: "#166534", bg: "#dcfce7" },
    { l: "Hồ sơ đầy đủ ≥90%", v: CAN_BO_LIST.filter(c => c.completeness >= 90).length,     icon: CheckCircle2, c: "#0891b2", bg: "#e0f2fe" },
    { l: "Cần bổ sung",       v: CAN_BO_LIST.filter(c => c.completeness < 80).length,       icon: AlertCircle,  c: "#b45309", bg: "#fef3c7" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#f8fafc", fontFamily: "var(--font-sans)" }}>
      {selected && <ProfileDrawer cb={selected} onClose={() => setSelected(null)} onAICheck={() => { setAiTarget(selected); }} />}
      {aiTarget && <AiEligibilityPanel cb={aiTarget} onClose={() => setAiTarget(null)} />}

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 shrink-0" style={{ background: "white", borderBottom: "1px solid #e8ecf3" }}>

        {/* Title row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="size-9 rounded-[9px] flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <Users className="size-4 text-[#c4a96a]" />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontFamily: "var(--font-sans)", fontWeight: 700, color: "#0b1426", lineHeight: 1.3 }}>Hồ sơ Cán bộ</h1>
            <p style={{ fontSize: 12, color: "#8a9ab5", fontFamily: "var(--font-sans)" }}>Thi đua · AI kiểm tra điều kiện · Lịch sử khen thưởng</p>
          </div>

          {/* Search */}
          <div className="relative ml-4 flex-1 max-w-xs">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên, đơn vị, chức vụ…"
              className="w-full pl-8 pr-3 outline-none"
              style={{ height: 34, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-sans)", background: "#f8fafc", color: "#0b1426" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#1C5FBE"; e.currentTarget.style.background = "white"; }}
              onBlur={e =>  { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Filter */}
            <button onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-1.5 h-[34px] px-3 rounded-[8px] border text-[12.5px] transition-all"
              style={{
                background: showFilters || activeFilterCount > 0 ? "#ddeafc" : "white",
                borderColor: showFilters || activeFilterCount > 0 ? "#93b4f0" : "#e2e8f0",
                color: showFilters || activeFilterCount > 0 ? "#1C5FBE" : "#5a5040",
                fontFamily: "var(--font-sans)", fontWeight: showFilters || activeFilterCount > 0 ? 600 : 400,
              }}>
              <Filter className="size-3.5" />
              Bộ lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>

            {/* View toggle */}
            <div className="flex rounded-[8px] p-0.5 gap-0.5" style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
              {([["list", LayoutList, "Danh sách"], ["grid", LayoutGrid, "Lưới"]] as const).map(([k, Icon, title]) => (
                <button key={k} onClick={() => setViewMode(k)} title={title}
                  className="flex items-center justify-center size-7 rounded-[6px] transition-all"
                  style={{
                    background: viewMode === k ? "white" : "transparent",
                    color: viewMode === k ? "#1C5FBE" : "#94a3b8",
                    boxShadow: viewMode === k ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}>
                  <Icon className="size-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.l} className="flex items-center gap-2 px-3 py-2 rounded-[9px]" style={{ background: s.bg }}>
                <Icon className="size-3.5 shrink-0" style={{ color: s.c }} />
                <span style={{ fontSize: 20, fontFamily: "var(--font-sans)", fontWeight: 700, color: s.c, lineHeight: 1 }}>{s.v}</span>
                <span style={{ fontSize: 12, color: s.c, fontFamily: "var(--font-sans)", opacity: 0.8 }}>{s.l}</span>
              </div>
            );
          })}
          {filtered.length < CAN_BO_LIST.length && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-[9px]" style={{ background: "#fef3c7" }}>
              <Filter className="size-3.5" style={{ color: "#b45309" }} />
              <span style={{ fontSize: 12, color: "#b45309", fontFamily: "var(--font-sans)", fontWeight: 600 }}>{filtered.length} / {CAN_BO_LIST.length} kết quả</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter panel ─────────────────────────────────────────── */}
      {showFilters && (
        <div className="px-6 py-3 shrink-0 flex items-center gap-3 flex-wrap"
          style={{ background: "#f8fafc", borderBottom: "1px solid #e8ecf3" }}>

          {/* Đơn vị */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 12, color: "#8a9ab5", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Đơn vị</span>
            <select value={fUnit} onChange={e => { setFUnit(e.target.value); setPage(1); }}
              className="outline-none"
              style={{ height: 30, paddingLeft: 8, paddingRight: 24, border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12.5, fontFamily: "var(--font-sans)", background: "white", color: "#0b1426", appearance: "auto" }}>
              <option value="all">Tất cả</option>
              {ALL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Trạng thái */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 12, color: "#8a9ab5", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Trạng thái</span>
            <div className="flex rounded-[7px] overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
              {([["all","Tất cả"],["eligible","Đủ ĐK"],["not","Chưa đủ"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => { setFStatus(v); setPage(1); }}
                  className="px-3 h-[30px] text-[12.5px] transition-colors"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: fStatus === v ? 600 : 400, background: fStatus === v ? "#ddeafc" : "white", color: fStatus === v ? "#1C5FBE" : "#5a6474" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Điểm */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 12, color: "#8a9ab5", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Điểm</span>
            <div className="flex rounded-[7px] overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
              {([["all","Tất cả"],["90+","≥90"],["80-89","80–89"],["70-79","70–79"],["<70","<70"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => { setFScore(v); setPage(1); }}
                  className="px-2.5 h-[30px] text-[12px] transition-colors"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: fScore === v ? 600 : 400, background: fScore === v ? "#dcfce7" : "white", color: fScore === v ? "#166534" : "#5a6474" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Hồ sơ */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 12, color: "#8a9ab5", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Hồ sơ</span>
            <div className="flex rounded-[7px] overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
              {([["all","Tất cả"],["90+","≥90%"],["<80","<80%"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => { setFComplete(v); setPage(1); }}
                  className="px-2.5 h-[30px] text-[12px] transition-colors"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: fComplete === v ? 600 : 400, background: fComplete === v ? "#e0f2fe" : "white", color: fComplete === v ? "#0891b2" : "#5a6474" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span style={{ fontSize: 12, color: "#8a9ab5", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Sắp xếp</span>
            <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
              className="outline-none"
              style={{ height: 30, paddingLeft: 8, paddingRight: 24, border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12.5, fontFamily: "var(--font-sans)", background: "white", color: "#0b1426", appearance: "auto" }}>
              <option value="score">Điểm cao nhất</option>
              <option value="completeness">Hồ sơ đầy đủ nhất</option>
              <option value="name">Tên A–Z</option>
              <option value="joinYear">Thâm niên cao nhất</option>
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 h-[30px] rounded-[7px] text-[12px] transition-colors"
              style={{ background: "#fee2e2", color: "#c8102e", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
              <X className="size-3" />Xóa lọc ({activeFilterCount})
            </button>
          )}
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── LIST VIEW ─────────────────────────────────────────── */}
        {viewMode === "list" && (
          <div style={{ background: "white" }}>
            {/* Column header */}
            <div className="flex items-center px-5 py-2.5 sticky top-0"
              style={{ background: "#f4f7fb", borderBottom: "1px solid #e8ecf3", zIndex: 1 }}>
              <div style={{ width: 32, flexShrink: 0 }} />
              <div style={{ flex: "0 0 220px" }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.07em" }}>Cán bộ</span>
              </div>
              <div style={{ flex: "0 0 180px" }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.07em" }}>Đơn vị</span>
              </div>
              <div style={{ flex: "0 0 90px" }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.07em" }}>Điểm TĐ</span>
              </div>
              <div style={{ flex: "0 0 130px" }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.07em" }}>Hoàn thiện HS</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.07em" }}>Thành tích nổi bật</span>
              </div>
              <div style={{ flex: "0 0 100px" }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.07em" }}>Trạng thái</span>
              </div>
              <div style={{ width: 72, flexShrink: 0 }} />
            </div>

            {/* Rows */}
            {visible.map((cb, idx) => {
              const hasEligible = cb.eligibleFor.length > 0;
              const complColor = cb.completeness >= 90 ? "#166534" : cb.completeness >= 70 ? "#b45309" : "#c8102e";
              const scoreColor = cb.score >= 90 ? "#166534" : cb.score >= 80 ? "#1C5FBE" : cb.score >= 70 ? "#b45309" : "#c8102e";
              const scoreBg    = cb.score >= 90 ? "#dcfce7" : cb.score >= 80 ? "#ddeafc" : cb.score >= 70 ? "#fef3c7" : "#fee2e2";

              return (
                <div key={cb.id}
                  className="flex items-center px-5 cursor-pointer group"
                  style={{
                    minHeight: 60,
                    borderBottom: idx < visible.length - 1 ? "1px solid #f0f4f8" : "none",
                    background: "white",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "white"; }}
                  onClick={() => setSelected(cb)}>

                  {/* Avatar */}
                  <div style={{ width: 32, flexShrink: 0, marginRight: 0 }}>
                    <div className="size-8 rounded-full flex items-center justify-center text-white"
                      style={{ background: hasEligible ? "linear-gradient(135deg,#166534,#16a34a)" : "linear-gradient(135deg,#1C5FBE,#0b1426)", fontSize: 13, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                      {cb.name.charAt(0)}
                    </div>
                  </div>

                  {/* Cán bộ */}
                  <div style={{ flex: "0 0 220px", paddingRight: 12 }}>
                    <div className="flex items-center gap-1.5">
                      <span className="truncate" style={{ fontSize: 13.5, fontFamily: "var(--font-sans)", fontWeight: 600, color: "#0b1426" }}>{cb.name}</span>
                      {hasEligible && <Sparkles className="size-3 text-[#166534] shrink-0" />}
                    </div>
                    <div className="truncate" style={{ fontSize: 11.5, color: "#8a9ab5", fontFamily: "var(--font-sans)", marginTop: 1 }}>{cb.position}</div>
                  </div>

                  {/* Đơn vị */}
                  <div style={{ flex: "0 0 180px", paddingRight: 12 }}>
                    <div className="truncate flex items-center gap-1">
                      <Building2 className="size-3 shrink-0" style={{ color: "#b0bbc9" }} />
                      <span className="truncate" style={{ fontSize: 12.5, color: "#5a6474", fontFamily: "var(--font-sans)" }}>{cb.unit}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "var(--font-sans)", marginTop: 2 }}>
                      {2026 - cb.joinYear} năm công tác
                    </div>
                  </div>

                  {/* Điểm TĐ */}
                  <div style={{ flex: "0 0 90px" }}>
                    <span className="inline-flex items-center justify-center rounded-[8px]"
                      style={{ width: 52, height: 30, fontSize: 15, fontFamily: "var(--font-sans)", fontWeight: 700, color: scoreColor, background: scoreBg }}>
                      {cb.score}
                    </span>
                  </div>

                  {/* Hoàn thiện HS */}
                  <div style={{ flex: "0 0 130px", paddingRight: 16 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: complColor }}>{cb.completeness}%</span>
                      {cb.completeness >= 90 && <CheckCircle2 className="size-3 shrink-0" style={{ color: "#166534" }} />}
                      {cb.completeness < 80 && <AlertCircle className="size-3 shrink-0" style={{ color: "#b45309" }} />}
                    </div>
                    <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "#e8ecf3" }}>
                      <div className="h-full rounded-full" style={{ width: `${cb.completeness}%`, background: complColor }} />
                    </div>
                  </div>

                  {/* Thành tích */}
                  <div className="flex items-center gap-1.5 flex-wrap" style={{ flex: 1, paddingRight: 8 }}>
                    {cb.awards.slice(0, 2).map((a, i) => {
                      const lc = LEVEL_CFG[a.level] ?? { color: "#635647", bg: "#eef2f8" };
                      return (
                        <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-[5px]"
                          style={{ fontSize: 11.5, background: lc.bg, color: lc.color, fontFamily: "var(--font-sans)", fontWeight: 600, whiteSpace: "nowrap" }}>
                          <Award className="size-3 shrink-0" style={{ color: lc.color }} />
                          {a.type.split(" ").slice(0, 3).join(" ")}
                          <span style={{ opacity: 0.6, fontFamily: "JetBrains Mono, monospace" }}>{a.year}</span>
                        </span>
                      );
                    })}
                    {cb.awards.length > 2 && (
                      <span style={{ fontSize: 11.5, color: "#94a3b8", fontFamily: "var(--font-sans)" }}>+{cb.awards.length - 2}</span>
                    )}
                    {cb.awards.length === 0 && (
                      <span style={{ fontSize: 12, color: "#d1ccc0", fontFamily: "var(--font-sans)" }}>Chưa có</span>
                    )}
                  </div>

                  {/* Trạng thái */}
                  <div style={{ flex: "0 0 100px" }}>
                    {hasEligible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{ fontSize: 11.5, fontFamily: "var(--font-sans)", fontWeight: 600, background: "#dcfce7", color: "#166534", whiteSpace: "nowrap" }}>
                        <Sparkles className="size-3" />Đủ ĐK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{ fontSize: 11.5, fontFamily: "var(--font-sans)", background: "#f1f5f9", color: "#94a3b8", whiteSpace: "nowrap" }}>
                        <Clock className="size-3" />Chưa đủ
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1" style={{ width: 72, flexShrink: 0, justifyContent: "flex-end" }}>
                    <button onClick={e => { e.stopPropagation(); setSelected(cb); }}
                      className="size-8 flex items-center justify-center rounded-[7px] transition-colors"
                      title="Xem hồ sơ"
                      style={{ color: "#94a3b8", background: "transparent" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#ddeafc"; (e.currentTarget as HTMLElement).style.color = "#1C5FBE"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                      <Eye className="size-4" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setAiTarget(cb); }}
                      className="size-8 flex items-center justify-center rounded-[7px] transition-colors"
                      title="AI kiểm tra"
                      style={{ color: "#94a3b8", background: "transparent" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#ede9fe"; (e.currentTarget as HTMLElement).style.color = "#7c3aed"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                      <Brain className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {visible.length === 0 && (
              <div className="flex flex-col items-center py-20 gap-3">
                <User className="size-12 text-[#d1ccc0]" />
                <p style={{ fontSize: 13, color: "#94a3b8", fontFamily: "var(--font-sans)" }}>Không tìm thấy cán bộ phù hợp</p>
              </div>
            )}

          </div>
        )}

        {/* ── GRID VIEW ─────────────────────────────────────────── */}
        {viewMode === "grid" && (
          <div className="p-5 grid grid-cols-3 gap-4">
            {visible.map(cb => {
              const hasEligible = cb.eligibleFor.length > 0;
              const complColor = cb.completeness >= 90 ? "#166534" : cb.completeness >= 70 ? "#b45309" : "#c8102e";
              const scoreColor = cb.score >= 90 ? "#166534" : cb.score >= 80 ? "#1C5FBE" : cb.score >= 70 ? "#b45309" : "#c8102e";
              const scoreBg    = cb.score >= 90 ? "#dcfce7" : cb.score >= 80 ? "#ddeafc" : cb.score >= 70 ? "#fef3c7" : "#fee2e2";
              return (
                <div key={cb.id}
                  className="rounded-[12px] border overflow-hidden cursor-pointer transition-all hover:shadow-md"
                  style={{ background: "white", borderColor: "#e8ecf3" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c4d4f0"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e8ecf3"; }}
                  onClick={() => setSelected(cb)}>
                  <div className="h-1" style={{ background: hasEligible ? "linear-gradient(90deg,#166534,#4ade80)" : "linear-gradient(90deg,#e2e8f0,#f0f4f8)" }} />
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="size-10 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{ background: hasEligible ? "linear-gradient(135deg,#166534,#16a34a)" : "linear-gradient(135deg,#1C5FBE,#0b1426)", fontSize: 14, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                        {cb.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate" style={{ fontSize: 13.5, fontFamily: "var(--font-sans)", fontWeight: 700, color: "#0b1426" }}>{cb.name}</span>
                          {hasEligible && <Sparkles className="size-3.5 text-[#166534] shrink-0" />}
                        </div>
                        <p className="truncate" style={{ fontSize: 12, color: "#8a9ab5", fontFamily: "var(--font-sans)" }}>{cb.position}</p>
                        <p className="truncate" style={{ fontSize: 12, color: "#5a6474", fontFamily: "var(--font-sans)" }}>{cb.unit}</p>
                      </div>
                    </div>
                    {/* Score + completeness */}
                    <div className="flex gap-2 mb-3">
                      <div className="flex items-center justify-center rounded-[8px] px-3 py-2" style={{ background: scoreBg }}>
                        <span style={{ fontSize: 22, fontFamily: "var(--font-sans)", fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{cb.score}</span>
                      </div>
                      <div className="flex-1 rounded-[8px] p-2.5" style={{ background: "#f4f7fb", border: "1px solid #e8ecf3" }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontSize: 11, color: "#8a9ab5", fontFamily: "var(--font-sans)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Hồ sơ</span>
                          <span style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: complColor }}>{cb.completeness}%</span>
                        </div>
                        <div className="h-[5px] rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                          <div className="h-full rounded-full" style={{ width: `${cb.completeness}%`, background: complColor }} />
                        </div>
                      </div>
                    </div>
                    {/* Awards */}
                    <div className="flex flex-wrap gap-1 mb-3 min-h-[22px]">
                      {cb.awards.slice(0, 2).map((a, i) => {
                        const lc = LEVEL_CFG[a.level] ?? { color: "#635647", bg: "#eef2f8" };
                        return (
                          <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px]"
                            style={{ fontSize: 11, background: lc.bg, color: lc.color, fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                            <Award className="size-3 shrink-0" style={{ color: lc.color }} />
                            {a.type.split(" ").slice(0, 2).join(" ")} {a.year}
                          </span>
                        );
                      })}
                      {cb.awards.length === 0 && <span style={{ fontSize: 11.5, color: "#d1ccc0", fontFamily: "var(--font-sans)" }}>Chưa có thành tích</span>}
                    </div>
                    <button onClick={e => { e.stopPropagation(); setAiTarget(cb); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[8px] border text-[12.5px] transition-colors"
                      style={{ borderColor: "#e8ecf3", color: "#6b5e47", fontFamily: "var(--font-sans)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#7c3aed"; (e.currentTarget as HTMLElement).style.color = "#7c3aed"; (e.currentTarget as HTMLElement).style.background = "#faf5ff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e8ecf3"; (e.currentTarget as HTMLElement).style.color = "#6b5e47"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      <Brain className="size-3.5" />Kiểm tra điều kiện AI
                    </button>
                  </div>
                </div>
              );
            })}
            {visible.length === 0 && (
              <div className="col-span-3 flex flex-col items-center py-20 gap-3">
                <User className="size-12 text-[#d1ccc0]" />
                <p style={{ fontSize: 13, color: "#94a3b8", fontFamily: "var(--font-sans)" }}>Không tìm thấy cán bộ phù hợp</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Pagination footer — cố định đáy trang ─────────────── */}
      {viewMode === "list" && filtered.length > PAGE_SIZE && (
        <div className="shrink-0 flex items-center justify-between px-6 py-3"
          style={{ background: "white", borderTop: "1px solid #e8ecf3", boxShadow: "0 -1px 0 rgba(0,0,0,0.03)" }}>
          <span style={{ fontSize: 12.5, color: "#8a9ab5", fontFamily: "var(--font-sans)" }}>
            Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} cán bộ
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              className="flex items-center gap-1 px-3 h-8 rounded-[7px] text-[12.5px] border transition-colors disabled:opacity-40"
              style={{ fontFamily: "var(--font-sans)", borderColor: "#e2e8f0", color: "#5a6474", background: "white" }}
              onMouseEnter={e => { if (safePage > 1) (e.currentTarget as HTMLElement).style.borderColor = "#1C5FBE"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}>
              ← Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…"
                  ? <span key={`e${i}`} style={{ fontSize: 13, color: "#94a3b8", padding: "0 4px" }}>…</span>
                  : <button key={p} onClick={() => setPage(p as number)}
                      className="size-8 rounded-[7px] text-[12.5px] border transition-colors"
                      style={{
                        fontFamily: "var(--font-sans)", fontWeight: safePage === p ? 700 : 400,
                        background: safePage === p ? "#1C5FBE" : "white",
                        color: safePage === p ? "white" : "#5a6474",
                        borderColor: safePage === p ? "#1C5FBE" : "#e2e8f0",
                      }}>
                      {p}
                    </button>
              )
            }

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="flex items-center gap-1 px-3 h-8 rounded-[7px] text-[12.5px] border transition-colors disabled:opacity-40"
              style={{ fontFamily: "var(--font-sans)", borderColor: "#e2e8f0", color: "#5a6474", background: "white" }}
              onMouseEnter={e => { if (safePage < totalPages) (e.currentTarget as HTMLElement).style.borderColor = "#1C5FBE"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}>
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}