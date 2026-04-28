import { useState } from "react";
import { Eye, EyeOff, LogIn, ChevronRight, CheckCircle2, Star, Sparkles,
  Settings, Crown, Gavel, Users, User, Shield, Megaphone } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
export interface LoginUser {
  id: number;
  name: string;
  initials: string;
  title: string;
  unit: string;
  email: string;
  role: "quản trị hệ thống" | "lãnh đạo cấp cao" | "hội đồng" | "lãnh đạo đơn vị" | "cá nhân";
  roleLabel: string;
  roleColor: string;
  roleBg: string;
  avatarFrom: string;
  avatarTo: string;
}

interface DemoAccount extends LoginUser {
  password: string;
  desc: string;
  perms: string[];
  roleIcon: typeof User;
}

/* ─── Role visual config ─────────────────────────────────────────── */
const ROLE_VISUAL = {
  admin:                  { icon:Settings, color:"#0b1426", bg:"#e8ecf3", border:"#c5cdd9", from:"#1a2744", to:"#0b1426" },
  leader:                 { icon:Crown,    color:"#92400e", bg:"#fef3c7", border:"#fcd34d", from:"#b45309", to:"#92400e" },
  council:                { icon:Gavel,    color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd", from:"#8b5cf6", to:"#7c3aed" },
  manager:                { icon:Users,    color:"#166534", bg:"#dcfce7", border:"#86efac", from:"#15803d", to:"#166534" },
  user:                   { icon:User,     color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd", from:"#2563eb", to:"#1C5FBE" },
  "quản trị hệ thống":   { icon:Settings, color:"#0b1426", bg:"#e8ecf3", border:"#c5cdd9", from:"#1a2744", to:"#0b1426" },
  "lãnh đạo cấp cao":    { icon:Crown,    color:"#92400e", bg:"#fef3c7", border:"#fcd34d", from:"#b45309", to:"#92400e" },
  "hội đồng":            { icon:Gavel,    color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd", from:"#8b5cf6", to:"#7c3aed" },
  "lãnh đạo đơn vị":     { icon:Users,    color:"#166534", bg:"#dcfce7", border:"#86efac", from:"#15803d", to:"#166534" },
  "cá nhân":             { icon:User,     color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd", from:"#2563eb", to:"#1C5FBE" },
} as Record<string, { icon: typeof User; color: string; bg: string; border: string; from: string; to: string }>;

/* ─── Demo accounts (5 vai trò chuẩn) ───────────────────────────── */
const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 14, name: "Hệ thống (Admin)", initials: "AD",
    title: "Quản trị viên hệ thống", unit: "Trung tâm CNTT – VP UBND Tỉnh",
    email: "admin@dongnai.gov.vn", password: "demo123",
    role: "quản trị hệ thống", roleLabel: "Quản trị hệ thống",
    roleColor: ROLE_VISUAL.admin.color, roleBg: ROLE_VISUAL.admin.bg,
    avatarFrom: ROLE_VISUAL.admin.from, avatarTo: ROLE_VISUAL.admin.to,
    roleIcon: ROLE_VISUAL.admin.icon,
    desc: "Toàn quyền hệ thống — phân quyền, cấu hình, audit log",
    perms: ["Phân quyền", "Danh mục", "Sao lưu", "Toàn bộ nghiệp vụ"],
  },
  {
    id: 1, name: "Nguyễn Văn Thắng", initials: "NT",
    title: "Phó Chánh VP UBND Tỉnh", unit: "Văn phòng UBND Tỉnh Đồng Nai",
    email: "nvthang@dongnai.gov.vn", password: "demo123",
    role: "lãnh đạo cấp cao", roleLabel: "Lãnh đạo cấp cao",
    roleColor: ROLE_VISUAL.leader.color, roleBg: ROLE_VISUAL.leader.bg,
    avatarFrom: ROLE_VISUAL.leader.from, avatarTo: ROLE_VISUAL.leader.to,
    roleIcon: ROLE_VISUAL.leader.icon,
    desc: "Phê duyệt phong trào, ký số CA, ban hành quyết định cấp tỉnh",
    perms: ["Ký số CA", "Phê duyệt", "Ban hành QĐ", "Báo cáo"],
  },
  {
    id: 5, name: "Võ Minh Tuấn", initials: "MT",
    title: "Chuyên viên TĐKT (Thư ký HĐ)", unit: "Sở Nội vụ – Phòng TĐKT",
    email: "vmtuan@dongnai.gov.vn", password: "demo123",
    role: "hội đồng", roleLabel: "Hội đồng",
    roleColor: ROLE_VISUAL.council.color, roleBg: ROLE_VISUAL.council.bg,
    avatarFrom: ROLE_VISUAL.council.from, avatarTo: ROLE_VISUAL.council.to,
    roleIcon: ROLE_VISUAL.council.icon,
    desc: "Tạo phong trào, chấm điểm HĐ xét duyệt, kiểm tra COI tự động",
    perms: ["Phong trào", "Chấm điểm HĐ", "Thẩm định", "Biên bản"],
  },
  {
    id: 9, name: "Trần Bá Thành", initials: "BT",
    title: "Phụ trách TĐKT", unit: "Sở Nội vụ Đồng Nai",
    email: "tbthanh@dongnai.gov.vn", password: "demo123",
    role: "lãnh đạo đơn vị", roleLabel: "Lãnh đạo đơn vị",
    roleColor: ROLE_VISUAL.manager.color, roleBg: ROLE_VISUAL.manager.bg,
    avatarFrom: ROLE_VISUAL.manager.from, avatarTo: ROLE_VISUAL.manager.to,
    roleIcon: ROLE_VISUAL.manager.icon,
    desc: "Tạo hồ sơ đề nghị đơn vị, tham gia lấy ý kiến, trình cấp trên",
    perms: ["Tạo hồ sơ", "Đề nghị KT", "Lấy ý kiến", "Báo cáo đơn vị"],
  },
  {
    id: 11, name: "Lê Thị Thanh Xuân", initials: "TX",
    title: "Phó Giám đốc Sở", unit: "Sở Giáo dục & Đào tạo Đồng Nai",
    email: "ltxuan@soe.dongnai.gov.vn", password: "demo123",
    role: "cá nhân", roleLabel: "Cá nhân",
    roleColor: ROLE_VISUAL.user.color, roleBg: ROLE_VISUAL.user.bg,
    avatarFrom: ROLE_VISUAL.user.from, avatarTo: ROLE_VISUAL.user.to,
    roleIcon: ROLE_VISUAL.user.icon,
    desc: "Đăng ký tham gia phong trào, nộp hồ sơ, gửi ý kiến, theo dõi kết quả",
    perms: ["Đăng ký PT", "Nộp hồ sơ", "Gửi ý kiến", "Xem QĐ"],
  },
];

/* ─── Stars decoration ───────────────────────────────────────────── */
function StarRow({ n, opacity = 0.35 }: { n: number; opacity?: number }) {
  return (
    <div className="flex items-center gap-2" style={{ opacity }}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="fill-[#ffd27a] text-[#ffd27a]" style={{ width: i === Math.floor(n / 2) ? 18 : 13, height: i === Math.floor(n / 2) ? 18 : 13 }} />
      ))}
    </div>
  );
}

/* ─── Main Login Page ────────────────────────────────────────────── */
export function LoginPage({ onLogin, onPublicLYK }: { onLogin: (user: LoginUser) => void; onPublicLYK?: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const pickDemo = (acc: DemoAccount) => {
    setSelected(acc.id);
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
    setLoading(true);
    setTimeout(() => {
      const { password: _p, desc: _d, perms: _pr, roleIcon: _ri, ...user } = acc;
      onLogin(user);
      setLoading(false);
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const acc = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
      if (acc) {
        const { password: _p, desc: _d, perms: _pr, roleIcon: _ri, ...user } = acc;
        onLogin(user);
      } else {
        setError("Sai tài khoản hoặc mật khẩu. Vui lòng chọn tài khoản demo bên dưới.");
        setSelected(null);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── Left: Branding panel ──────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[420px] shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#0d1b35 0%,#0b1426 60%,#0a1020 100%)" }}>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle,#c8102e,transparent 70%)" }}/>
          <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full opacity-8"
            style={{ background: "radial-gradient(circle,#1C5FBE,transparent 70%)" }}/>
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#ffd27a"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full px-10 py-12">
          {/* Emblem */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
              <div className="absolute inset-0 rounded-full border-2 opacity-40" style={{ borderColor:"#ffd27a" }}/>
              <div className="absolute inset-[6px] rounded-full border opacity-25" style={{ borderColor:"#ffd27a" }}/>
              <div className="relative w-16 h-16 rounded-full grid place-items-center"
                style={{ background: "linear-gradient(135deg,#c8102e,#7a0a1c)" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 18, fontWeight:700, color:"#ffd27a", letterSpacing:2 }}>VQ</span>
              </div>
            </div>
            <StarRow n={5} opacity={0.55}/>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <p className="text-[13px] tracking-[0.25em] uppercase mb-2" style={{ color:"#8a9abc" }}>
              Tỉnh ủy Đồng Nai
            </p>
            <h1 className="text-[24px] leading-tight mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight:700, color:"#ffd27a" }}>
              VPTU Đồng Nai
            </h1>
            <p className="text-[14px]" style={{ color:"#b0bcd4" }}>
              Hệ thống Thi đua – Khen thưởng
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-px" style={{ background:"linear-gradient(to right,transparent,rgba(255,210,122,0.3))" }}/>
            <Star className="size-3 fill-[#ffd27a] text-[#ffd27a] opacity-50"/>
            <div className="flex-1 h-px" style={{ background:"linear-gradient(to left,transparent,rgba(255,210,122,0.3))" }}/>
          </div>

          {/* 5 role chips */}
          <div className="mb-7">
            <p className="text-[13px] uppercase tracking-widest mb-3 text-center" style={{ color:"#4a5878" }}>
              5 Vai trò hệ thống
            </p>
            <div className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map(acc => {
                const Icon = acc.roleIcon;
                return (
                  <div key={acc.role} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg"
                    style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div className="size-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background:acc.roleColor }}>
                      <Icon className="size-2.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px]" style={{ color:acc.roleBg, fontWeight:600 }}>
                        {acc.roleLabel}
                      </span>
                      <span className="text-[13px] ml-1.5 opacity-50" style={{ color:"#b0bcd4" }}>
                        {acc.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {[
              "AI gợi ý hồ sơ đủ điều kiện",
              "Bảng xếp hạng thi đua realtime",
              "Ký số tích hợp CA – PKI",
              "Phát hiện hồ sơ trùng lặp tự động",
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <span className="text-[13px]" style={{ color:"#ffd27a" }}></span>
                <span className="text-[13px]" style={{ color:"#b0bcd4" }}>{f}</span>
              </div>
            ))}
          </div>

          {/* AI badge */}
          <div className="mt-auto flex items-center gap-2 p-3 rounded-xl"
            style={{ background:"rgba(200,16,46,0.12)", border:"1px solid rgba(200,16,46,0.25)" }}>
            <Sparkles className="size-4 shrink-0" style={{ color:"#ff6b8a" }}/>
            <div>
              <p className="text-[13px]" style={{ color:"#ff8fa3", fontWeight:600 }}>Trợ lý AI Tố Nga</p>
              <p className="text-[13px]" style={{ color:"#8a9abc" }}>Tư vấn hồ sơ thông minh 24/7</p>
            </div>
          </div>

          <p className="mt-5 text-center text-[13px]" style={{ color:"#4a5878" }}>
            © 2026 VPTU Đồng Nai · Phiên bản 1.0.0
          </p>
        </div>
      </div>

      {/* ── Right: Login + Demo cards ─────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ background:"#fbf8f2" }}>
        <div className="max-w-[680px] mx-auto px-8 py-12">

          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full grid place-items-center shrink-0"
              style={{ background:"linear-gradient(135deg,#c8102e,#7a0a1c)" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize:14, fontWeight:700, color:"#ffd27a" }}>VQ</span>
            </div>
            <div>
              <p className="text-[14px]" style={{ fontFamily: "var(--font-sans)", fontWeight:700, color:"#0b1426" }}>VPTU Đồng Nai</p>
              <p className="text-[13px]" style={{ color:"#635647" }}>Thi đua – Khen thưởng Tỉnh Đồng Nai</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-[24px]" style={{ fontFamily: "var(--font-sans)", fontWeight:700, color:"#0b1426" }}>
              Đăng nhập
            </h2>
            <p className="text-[14px] mt-1" style={{ color:"#635647" }}>
              Nhập thông tin tài khoản hoặc chọn nhanh bên dưới để trải nghiệm hệ thống
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="ds-input-root">
              <label className="ds-input-label">Email / Tài khoản</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ten@dongnai.gov.vn" className="ds-input ds-input-md w-full"
                autoComplete="username" required />
            </div>
            <div className="ds-input-root">
              <label className="ds-input-label">Mật khẩu</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="ds-input ds-input-md w-full pr-11"
                  autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#635647] hover:text-[#0b1426] transition-colors outline-none focus-visible:text-[#1C5FBE]">
                  {showPass ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg text-[13px]"
                style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#991b1b" }}>
                <span className="shrink-0 mt-0.5">⚠</span><span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn btn-md btn-primary w-full justify-center gap-2"
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin"/>
                    Đang xác thực…
                  </span>
                : <><LogIn className="size-4"/> Đăng nhập</>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background:"#e8e2d4" }}/>
            <span className="text-[13px] px-2 flex items-center gap-1.5"
              style={{ color:"#635647", background:"#fbf8f2" }}>
              <Shield className="size-3.5" />
              Chọn nhanh theo vai trò (5 roles)
            </span>
            <div className="flex-1 h-px" style={{ background:"#e8e2d4" }}/>
          </div>

          {/* Demo accounts — 5 role cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_ACCOUNTS.map(acc => {
              const isSel = selected === acc.id;
              const rv    = ROLE_VISUAL[acc.role];
              const Icon  = acc.roleIcon;
              return (
                <button
                  key={acc.id}
                  onClick={() => !loading && pickDemo(acc)}
                  disabled={loading}
                  className="text-left rounded-xl border-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#1C5FBE] group relative overflow-hidden"
                  style={{
                    borderColor: isSel ? rv.color : rv.border,
                    background: isSel ? rv.bg : "white",
                    boxShadow: isSel ? `0 0 0 3px ${rv.color}18, 0 4px 12px ${rv.color}15` : "0 1px 3px rgba(0,0,0,0.06)",
                    cursor: loading ? "not-allowed" : "pointer",
                    transform: isSel ? "translateY(-1px)" : "none",
                  }}>

                  {/* Top color band */}
                  <div className="h-0.5" style={{ background:`linear-gradient(to right, ${rv.from}, ${rv.to})` }} />

                  <div className="p-3.5">
                    <div className="flex items-start gap-3">
                      {/* Avatar with role gradient */}
                      <div className="size-10 rounded-full shrink-0 grid place-items-center text-white text-[13px] relative"
                        style={{ background:`linear-gradient(135deg,${rv.from},${rv.to})`,
                          fontFamily: "var(--font-sans)", fontWeight:700,
                          boxShadow: isSel ? `0 2px 8px ${rv.color}40` : "none" }}>
                        {isSel && loading
                          ? <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin"/>
                          : acc.initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Role badge + check */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] border"
                            style={{ background:rv.bg, color:rv.color, borderColor:rv.border,
                              fontWeight:600, letterSpacing:"0.04em" }}>
                            <Icon className="size-2.5" />
                            {acc.roleLabel}
                          </span>
                          {isSel && !loading && <CheckCircle2 className="size-4 shrink-0" style={{ color:rv.color }}/>}
                          {!isSel && <ChevronRight className="size-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color:rv.color }}/>}
                        </div>

                        {/* Name */}
                        <div className="text-[13px] mb-0.5" style={{ color:"#0b1426", fontWeight:isSel?600:500 }}>
                          {acc.name}
                        </div>

                        {/* Title + unit */}
                        <p className="text-[13px] truncate" style={{ color:"#635647" }}>
                          {acc.title} · {acc.unit}
                        </p>
                      </div>
                    </div>

                    {/* Desc */}
                    <p className="text-[13px] mt-2.5 leading-relaxed" style={{ color:"#5a5040" }}>
                      {acc.desc}
                    </p>

                    {/* Permission chips */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {acc.perms.map(p => (
                        <span key={p} className="text-[13px] px-1.5 py-0.5 rounded border"
                          style={{ background:rv.bg, color:rv.color, borderColor:rv.border }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-center text-[13px] mt-8" style={{ color:"#6b5e47" }}>
            Môi trường demo — mật khẩu mặc định:{" "}
            <code className="px-1.5 py-0.5 rounded" style={{ background:"#f0ece3", color:"#5a5040" }}>demo123</code>
          </p>

          {/* Public LYK link */}
          {onPublicLYK && (
            <div className="mt-5 text-center">
              <button onClick={onPublicLYK}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border-2 text-[13px] transition-all hover:shadow-md"
                style={{ borderColor:"#1C5FBE", color:"#1C5FBE", background:"white", fontFamily: "var(--font-sans)", fontWeight:600 }}>
                <Megaphone className="size-4"/>
                Góp ý Hồ sơ Khen thưởng Công khai
                <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:"#dcfce7",color:"#166534",fontFamily: "var(--font-sans)" }}>Không cần đăng nhập</span>
              </button>
              <p className="text-[13px] mt-1.5" style={{ color:"#635647", fontFamily: "var(--font-sans)" }}>
                Dành cho cán bộ, nhân dân góp ý về các hồ sơ khen thưởng công khai
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}