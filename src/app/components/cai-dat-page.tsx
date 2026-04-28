import { useState } from "react";
import {
  User, Lock, Bell, Palette, Shield, Globe, Camera,
  Eye, EyeOff, CheckCircle2, Save, RefreshCw, Smartphone,
  Mail, Phone, Building2, KeyRound, LogOut, Trash2,
  ToggleLeft, ToggleRight, ChevronRight, AlertTriangle,
  Fingerprint, Download, Upload, Star, Sun, Moon,
} from "lucide-react";
import type { LoginUser } from "./login-page";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type TabId = "profile" | "security" | "notifications" | "display" | "data";

/* ═══════════════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════════════ */
const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "profile",       label: "Hồ sơ cá nhân",  icon: User      },
  { id: "security",      label: "Bảo mật",         icon: Shield    },
  { id: "notifications", label: "Thông báo",       icon: Bell      },
  { id: "display",       label: "Giao diện",       icon: Palette   },
  { id: "data",          label: "Dữ liệu",         icon: Download  },
];

/* ═══════════════════════════════════════════════════════════════
   PROFILE TAB
═══════════════════════════════════════════════════════════════ */
function ProfileTab({ user }: { user: LoginUser }) {
  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title);
  const [unit, setUnit] = useState(user.unit);
  const [email, setEmail] = useState("nguyen.van.an@dongnai.gov.vn");
  const [phone, setPhone] = useState("0251.3822.046");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-6 p-5 rounded-[12px] border border-[#e2e8f0]" style={{ background: "#ffffff" }}>
        <div className="relative">
          <div className="size-20 rounded-full flex items-center justify-center text-white text-[24px] shadow-lg"
            style={{ background: `linear-gradient(135deg,${user.avatarFrom},${user.avatarTo})`, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            {user.initials}
          </div>
          <button className="absolute -bottom-1 -right-1 size-7 rounded-full bg-[#1C5FBE] flex items-center justify-center shadow border-2 border-white hover:bg-[#1752a8] transition-colors">
            <Camera className="size-3.5 text-white" />
          </button>
        </div>
        <div>
          <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{user.name}</h3>
          <p className="text-[13px] text-[#635647] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>{user.title}</p>
          <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[13px]"
            style={{ background: user.roleBg, color: user.roleColor, fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            {user.roleLabel}
          </span>
        </div>
        <div className="ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#e2e8f0] text-[13px] text-[#5a5040] hover:bg-white transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}>
            <Upload className="size-3.5" />Tải ảnh lên
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { label: "Họ và tên", value: name, setter: setName, icon: User },
          { label: "Chức vụ", value: title, setter: setTitle, icon: Star },
          { label: "Đơn vị công tác", value: unit, setter: setUnit, icon: Building2, full: true },
          { label: "Email công vụ", value: email, setter: setEmail, icon: Mail },
          { label: "Điện thoại", value: phone, setter: setPhone, icon: Phone },
        ].map(f => {
          const Icon = f.icon;
          return (
            <div key={f.label} className={f.full ? "col-span-2" : ""}>
              <label className="block text-[13px] text-[#5a5040] mb-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                {f.label}
              </label>
              <div className="relative">
                <Icon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#635647]" />
                <input
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  className="w-full pl-9 pr-3 border border-[#d1d5db] rounded-[8px] text-[13px] text-[#0b1426] outline-none focus:border-[#1C5FBE] transition-colors"
                  style={{ height: 40, fontFamily: "var(--font-sans)", background: "white" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal note */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-[8px]" style={{ background: "#fdf9f0", border: "1px solid #f0dba0" }}>
        <AlertTriangle className="size-4 text-[#b45309] shrink-0 mt-0.5" />
        <p className="text-[13px] text-[#7d4a00]" style={{ fontFamily: "var(--font-sans)" }}>
          Thông tin cá nhân được bảo vệ theo Luật An ninh mạng 2018 và NĐ 13/2023/NĐ-CP. Mọi thay đổi đều được ghi nhận vào Audit Log.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[13px] text-white transition-all"
          style={{ background: saved ? "#166534" : "linear-gradient(135deg,#1C5FBE,#1752a8)", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          {saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
          {saved ? "Đã lưu!" : "Lưu thay đổi"}
        </button>
        <button className="px-4 py-2.5 rounded-[8px] border border-[#e2e8f0] text-[13px] text-[#5a5040] hover:bg-[#f4f7fb] transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}>
          Huỷ
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECURITY TAB
═══════════════════════════════════════════════════════════════ */
function SecurityTab() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionAlert, setSessionAlert] = useState(true);

  const sessions = [
    { device: "Chrome 124 · Windows 11", ip: "203.113.4.82", location: "Biên Hòa, Đồng Nai", time: "Hiện tại", current: true },
    { device: "Chrome 122 · macOS 14",   ip: "118.68.91.23", location: "TP.HCM",              time: "2 ngày trước", current: false },
    { device: "Safari · iOS 17",          ip: "27.65.144.12", location: "Biên Hòa, Đồng Nai", time: "5 ngày trước", current: false },
  ];

  return (
    <div className="space-y-6">
      {/* Change password */}
      <div className="rounded-[12px] border border-[#e2e8f0] p-5">
        <h3 className="text-[14px] text-[#0b1426] mb-4" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Đổi mật khẩu</h3>
        <div className="space-y-3 max-w-sm">
          {[
            { label: "Mật khẩu hiện tại", show: showOld, toggle: () => setShowOld(v => !v) },
            { label: "Mật khẩu mới",      show: showNew, toggle: () => setShowNew(v => !v) },
            { label: "Xác nhận mật khẩu mới", show: showNew, toggle: () => setShowNew(v => !v) },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[13px] text-[#5a5040] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{f.label}</label>
              <div className="relative">
                <KeyRound className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#635647]" />
                <input type={f.show ? "text" : "password"} placeholder="••••••••"
                  className="w-full pl-9 pr-10 border border-[#d1d5db] rounded-[8px] text-[13px] outline-none focus:border-[#1C5FBE]"
                  style={{ height: 40, fontFamily: "var(--font-sans)" }} />
                <button onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#635647] hover:text-[#0b1426]">
                  {f.show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          ))}
          {/* Password strength */}
          <div className="flex items-center gap-2 mt-1">
            {["bg-[#c8102e]","bg-[#b45309]","bg-[#8a6400]","bg-[#4ade80]"].map((c, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${i < 3 ? c : "bg-[#e2e8f0]"}`} />
            ))}
            <span className="text-[13px] text-[#b45309]" style={{ fontFamily: "var(--font-sans)" }}>Trung bình</span>
          </div>
          <button className="px-4 py-2.5 rounded-[8px] text-[13px] text-white"
            style={{ background: "linear-gradient(135deg,#1C5FBE,#1752a8)", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            Cập nhật mật khẩu
          </button>
        </div>
      </div>

      {/* MFA */}
      <div className="rounded-[12px] border border-[#e2e8f0] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-[8px] flex items-center justify-center" style={{ background: "#dcfce7" }}>
              <Fingerprint className="size-5 text-[#166534]" />
            </div>
            <div>
              <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Xác thực 2 yếu tố (MFA)</h3>
              <p className="text-[13px] text-[#635647]">Bảo vệ tài khoản bằng OTP</p>
            </div>
          </div>
          <button onClick={() => setMfaEnabled(v => !v)}>
            {mfaEnabled
              ? <ToggleRight className="size-9 text-[#166534]" />
              : <ToggleLeft className="size-9 text-[#d1d5db]" />}
          </button>
        </div>
        {mfaEnabled && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-[8px]" style={{ background: "#dcfce7", border: "1px solid #86efac" }}>
            <CheckCircle2 className="size-4 text-[#166534]" />
            <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)" }}>MFA đang hoạt động · Phương thức: TOTP (Google Authenticator)</span>
          </div>
        )}
      </div>

      {/* Active sessions */}
      <div className="rounded-[12px] border border-[#e2e8f0] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Phiên đăng nhập đang hoạt động</h3>
          <button className="text-[13px] text-[#c8102e] hover:underline" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Đăng xuất tất cả</button>
        </div>
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-[8px]"
              style={{ background: s.current ? "#f0f4ff" : "#ffffff", border: `1px solid ${s.current ? "#bfdbfe" : "#e2e8f0"}` }}>
              <Smartphone className="size-5 shrink-0" style={{ color: s.current ? "#1C5FBE" : "#635647" }} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-[#0b1426] truncate" style={{ fontFamily: "var(--font-sans)", fontWeight: s.current ? 700 : 500 }}>
                  {s.device} {s.current && <span className="ml-1 text-[13px] text-[#1C5FBE] bg-[#ddeafc] px-1.5 py-0.5 rounded">Hiện tại</span>}
                </div>
                <div className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
                  {s.ip} · {s.location} · {s.time}
                </div>
              </div>
              {!s.current && (
                <button className="text-[13px] text-[#c8102e] hover:underline shrink-0" style={{ fontFamily: "var(--font-sans)" }}>Đăng xuất</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATIONS TAB
═══════════════════════════════════════════════════════════════ */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    sla_email: true, sla_browser: true, sla_sms: false,
    approval_email: true, approval_browser: true, approval_sms: false,
    ai_email: false, ai_browser: true, ai_sms: false,
    system_email: true, system_browser: false, system_sms: false,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const rows = [
    { key: "sla",      label: "Cảnh báo SLA",       sublabel: "Hạn xử lý sắp đến hoặc vi phạm", color: "#c8102e" },
    { key: "approval", label: "Phê duyệt & Ký số",  sublabel: "Hồ sơ chờ ký, kết quả bỏ phiếu",  color: "#1C5FBE" },
    { key: "ai",       label: "Gợi ý AI",            sublabel: "Cán bộ đủ điều kiện, trùng lặp",   color: "#7c3aed" },
    { key: "system",   label: "Hệ thống",            sublabel: "Backup, bảo mật, bảo trì",         color: "#b45309" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
        Cài đặt kênh nhận thông báo cho từng loại sự kiện.
      </p>
      <div className="rounded-[12px] border border-[#e2e8f0] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_80px_80px] gap-0 px-4 py-2.5 border-b border-[#eef2f8]" style={{ background: "#ffffff" }}>
          <span className="text-[13px] uppercase tracking-wider text-[#635647]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Loại thông báo</span>
          {["Email", "Trình duyệt", "SMS"].map(h => (
            <span key={h} className="text-[13px] uppercase tracking-wider text-[#635647] text-center" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{h}</span>
          ))}
        </div>
        {rows.map((r, ri) => (
          <div key={r.key} className={`grid grid-cols-[1fr_80px_80px_80px] gap-0 px-4 py-3.5 items-center ${ri < rows.length - 1 ? "border-b border-[#f4f7fb]" : ""}`}>
            <div className="flex items-center gap-2.5">
              <div className="size-2 rounded-full" style={{ background: r.color }} />
              <div>
                <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{r.label}</div>
                <div className="text-[13px] text-[#635647]">{r.sublabel}</div>
              </div>
            </div>
            {(["email", "browser", "sms"] as const).map(ch => {
              const k = `${r.key}_${ch}` as keyof typeof prefs;
              const on = prefs[k];
              return (
                <div key={ch} className="flex justify-center">
                  <button onClick={() => toggle(k)}>
                    {on
                      ? <ToggleRight className="size-8 text-[#1C5FBE]" />
                      : <ToggleLeft className="size-8 text-[#d1d5db]" />}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* Quiet hours */}
      <div className="rounded-[12px] border border-[#e2e8f0] p-5">
        <h3 className="text-[13px] text-[#0b1426] mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Giờ im lặng (Quiet Hours)</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Moon className="size-4 text-[#635647]" />
            <span className="text-[13px] text-[#5a5040]">Từ</span>
            <input type="time" defaultValue="22:00" className="border border-[#d1d5db] rounded-[6px] px-2 text-[13px]" style={{ height: 32 }} />
          </div>
          <div className="flex items-center gap-2">
            <Sun className="size-4 text-[#635647]" />
            <span className="text-[13px] text-[#5a5040]">đến</span>
            <input type="time" defaultValue="07:00" className="border border-[#d1d5db] rounded-[6px] px-2 text-[13px]" style={{ height: 32 }} />
          </div>
          <span className="text-[13px] text-[#635647]">(trừ SLA khẩn cấp)</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DISPLAY TAB
═══════════════════════════════════════════════════════════════ */
function DisplayTab() {
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [lang, setLang] = useState("vi");
  const [dateFormat, setDateFormat] = useState("dd/MM/yyyy");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="space-y-5">
      {/* Language */}
      <div className="rounded-[12px] border border-[#e2e8f0] p-5">
        <h3 className="text-[13px] text-[#0b1426] mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Ngôn ngữ & Định dạng</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] text-[#5a5040] mb-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Ngôn ngữ giao diện</label>
            <select value={lang} onChange={e => setLang(e.target.value)}
              className="w-full border border-[#d1d5db] rounded-[8px] px-3 text-[13px] text-[#0b1426] outline-none focus:border-[#1C5FBE]"
              style={{ height: 40, fontFamily: "var(--font-sans)" }}>
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-[#5a5040] mb-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Định dạng ngày tháng</label>
            <select value={dateFormat} onChange={e => setDateFormat(e.target.value)}
              className="w-full border border-[#d1d5db] rounded-[8px] px-3 text-[13px] text-[#0b1426] outline-none focus:border-[#1C5FBE]"
              style={{ height: 40, fontFamily: "var(--font-sans)" }}>
              <option value="dd/MM/yyyy">25/04/2026</option>
              <option value="yyyy-MM-dd">2026-04-25</option>
            </select>
          </div>
        </div>
      </div>

      {/* Density */}
      <div className="rounded-[12px] border border-[#e2e8f0] p-5">
        <h3 className="text-[13px] text-[#0b1426] mb-3" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Mật độ hiển thị</h3>
        <div className="flex gap-3">
          {([["comfortable", "Thoải mái", "Nhiều khoảng trắng hơn, dễ đọc"], ["compact", "Gọn", "Hiển thị nhiều dữ liệu hơn trên màn hình"]] as const).map(([v, l, d]) => (
            <button key={v} onClick={() => setDensity(v)}
              className="flex-1 px-4 py-3 rounded-[10px] border text-left transition-all"
              style={{ borderColor: density === v ? "#1C5FBE" : "#e2e8f0", background: density === v ? "#f0f4ff" : "white" }}>
              <div className="text-[13px] text-[#0b1426] mb-0.5" style={{ fontFamily: "var(--font-sans)", fontWeight: density === v ? 700 : 500 }}>{l}</div>
              <div className="text-[13px] text-[#635647]">{d}</div>
              {density === v && <CheckCircle2 className="size-4 text-[#1C5FBE] mt-1.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="rounded-[12px] border border-[#e2e8f0] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Sidebar thu gọn mặc định</h3>
            <p className="text-[13px] text-[#635647] mt-0.5">Chỉ hiển thị icon khi mở ứng dụng</p>
          </div>
          <button onClick={() => setSidebarCollapsed(v => !v)}>
            {sidebarCollapsed
              ? <ToggleRight className="size-9 text-[#1C5FBE]" />
              : <ToggleLeft className="size-9 text-[#d1d5db]" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DATA TAB
═══════════════════════════════════════════════════════════════ */
function DataTab({ user }: { user: LoginUser }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[12px] border border-[#e2e8f0] p-5">
        <h3 className="text-[13px] text-[#0b1426] mb-4" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Xuất dữ liệu cá nhân</h3>
        <p className="text-[13px] text-[#5a5040] mb-4 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
          Theo Điều 11 NĐ 13/2023/NĐ-CP, bạn có quyền nhận một bản sao dữ liệu cá nhân của mình đang được xử l�� trong hệ thống VPTU Đồng Nai.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            ["Hồ sơ cá nhân", "JSON / PDF", "User.json"],
            ["Lịch sử hoạt động", "CSV / Excel", "Activity.csv"],
            ["Lịch sử khen thưởng", "PDF", "Awards.pdf"],
          ].map(([label, fmt, file]) => (
            <div key={label} className="p-3 rounded-[8px] border border-[#e2e8f0] text-center" style={{ background: "#ffffff" }}>
              <Download className="size-5 text-[#635647] mx-auto mb-1.5" />
              <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{label}</div>
              <div className="text-[13px] text-[#635647] mb-2">{fmt}</div>
              <button className="text-[13px] text-[#1C5FBE] hover:underline" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Tải về</button>
            </div>
          ))}
        </div>
      </div>

      {/* Delete account – danger zone */}
      <div className="rounded-[12px] border border-[#fca5a5] p-5" style={{ background: "#fff5f5" }}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="size-5 text-[#c8102e]" />
          <h3 className="text-[13px] text-[#c8102e]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Vùng nguy hiểm</h3>
        </div>
        <p className="text-[13px] text-[#5a5040] mb-4 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
          Yêu cầu xóa tài khoản sẽ được gửi tới Quản trị viên để xét duyệt. Dữ liệu nghiệp vụ (hồ sơ, quyết định) sẽ được giữ lại theo quy định lưu trữ nhà nước (10 năm).
        </p>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] border border-[#fca5a5] text-[13px] text-[#c8102e] hover:bg-[#fee2e2] transition-colors"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          <Trash2 className="size-4" />Yêu cầu xóa tài khoản
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export function CaiDatPage({ user }: { user: LoginUser }) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const renderTab = () => {
    switch (activeTab) {
      case "profile":       return <ProfileTab user={user} />;
      case "security":      return <SecurityTab />;
      case "notifications": return <NotificationsTab />;
      case "display":       return <DisplayTab />;
      case "data":          return <DataTab user={user} />;
    }
  };

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#ffffff", fontFamily: "var(--font-sans)" }}>
      {/* Left nav */}
      <div className="w-64 shrink-0 border-r border-[#e2e8f0] p-4 space-y-1" style={{ background: "white" }}>
        <div className="px-3 py-3 mb-2">
          <div className="size-12 rounded-full flex items-center justify-center text-white text-[14px] mb-2"
            style={{ background: `linear-gradient(135deg,${user.avatarFrom},${user.avatarTo})`, fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            {user.initials}
          </div>
          <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>{user.name}</div>
          <div className="text-[13px] text-[#635647]">{user.title}</div>
        </div>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-left transition-all"
              style={{ background: active ? "#f0f4ff" : "transparent", color: active ? "#1C5FBE" : "#5a5040" }}>
              <Icon className="size-4 shrink-0" />
              <span className="text-[13px]" style={{ fontFamily: "var(--font-sans)", fontWeight: active ? 700 : 500 }}>{t.label}</span>
              {active && <ChevronRight className="size-4 ml-auto" />}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          <div className="mb-6">
            <h1 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-[13px] text-[#635647] mt-0.5">Quản lý tài khoản và tuỳ chỉnh hệ thống VPTU Đồng Nai</p>
          </div>
          {renderTab()}
        </div>
      </div>
    </div>
  );
}