import { useState } from "react";
import { Eye, EyeOff, LogIn, CheckCircle2, Settings, Crown, Gavel,
  Users, User, Shield, Megaphone, ArrowRight, Sparkles, ChevronRight } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
export interface LoginUser {
  id: number; name: string; initials: string; title: string; unit: string;
  email: string; role: "quản trị hệ thống"|"lãnh đạo cấp cao"|"hội đồng"|"lãnh đạo đơn vị"|"cá nhân";
  roleLabel: string; roleColor: string; roleBg: string; avatarFrom: string; avatarTo: string;
}

interface DemoAccount extends LoginUser {
  password: string; desc: string; perms: string[]; roleIcon: typeof User;
}

const ROLE_VISUAL = {
  admin:   { icon:Settings, color:"#0b1426", bg:"#e8ecf3", border:"#c5cdd9", from:"#1a2744", to:"#0b1426", label:"Quản trị" },
  leader:  { icon:Crown,    color:"#92400e", bg:"#fef3c7", border:"#fcd34d", from:"#b45309", to:"#92400e", label:"Lãnh đạo" },
  council: { icon:Gavel,    color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd", from:"#8b5cf6", to:"#7c3aed", label:"Hội đồng" },
  manager: { icon:Users,    color:"#166534", bg:"#dcfce7", border:"#86efac", from:"#15803d", to:"#166534", label:"Đơn vị" },
  user:    { icon:User,     color:"#1C5FBE", bg:"#ddeafc", border:"#93c5fd", from:"#2563eb", to:"#1C5FBE", label:"Cá nhân" },
} as const;

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id:14, name:"Hệ thống (Admin)", initials:"AD",
    title:"Quản trị viên hệ thống", unit:"Trung tâm CNTT – VP UBND Tỉnh",
    email:"admin@dongnai.gov.vn", password:"demo123",
    role:"quản trị hệ thống", roleLabel:"Quản trị hệ thống",
    roleColor:ROLE_VISUAL.admin.color, roleBg:ROLE_VISUAL.admin.bg,
    avatarFrom:ROLE_VISUAL.admin.from, avatarTo:ROLE_VISUAL.admin.to,
    roleIcon:ROLE_VISUAL.admin.icon,
    desc:"Quản lý user / role / permission, cấu hình workflow, cấu hình danh mục, toàn quyền hệ thống",
    perms:["User/Role","Cấu hình workflow","Danh mục","Toàn quyền"],
  },
  {
    id:1, name:"Nguyễn Văn Thắng", initials:"NT",
    title:"Phó Chánh VP UBND Tỉnh", unit:"Văn phòng UBND Tỉnh Đồng Nai",
    email:"nvthang@dongnai.gov.vn", password:"demo123",
    role:"lãnh đạo cấp cao", roleLabel:"Lãnh đạo cấp cao",
    roleColor:ROLE_VISUAL.leader.color, roleBg:ROLE_VISUAL.leader.bg,
    avatarFrom:ROLE_VISUAL.leader.from, avatarTo:ROLE_VISUAL.leader.to,
    roleIcon:ROLE_VISUAL.leader.icon,
    desc:"Phát động phong trào (bỏ qua bước phê duyệt), phê duyệt phong trào, ký số CA, phê duyệt kết quả cuối, ban hành quyết định khen thưởng",
    perms:["Phát động PT","Phê duyệt","Ký số CA","Ban hành QĐ"],
  },
  {
    id:5, name:"Võ Minh Tuấn", initials:"MT",
    title:"Chuyên viên TĐKT (Thư ký HĐ)", unit:"Sở Nội vụ – Phòng TĐKT",
    email:"vmtuan@dongnai.gov.vn", password:"demo123",
    role:"hội đồng", roleLabel:"Hội đồng",
    roleColor:ROLE_VISUAL.council.color, roleBg:ROLE_VISUAL.council.bg,
    avatarFrom:ROLE_VISUAL.council.from, avatarTo:ROLE_VISUAL.council.to,
    roleIcon:ROLE_VISUAL.council.icon,
    desc:"Xem danh sách hồ sơ, xem phản hồi công khai, chấm điểm, đề xuất đạt / không đạt",
    perms:["Xem hồ sơ","Phản hồi CK","Chấm điểm","Đề xuất KQ"],
  },
  {
    id:9, name:"Trần Bá Thành", initials:"BT",
    title:"Phụ trách TĐKT", unit:"Sở Nội vụ Đồng Nai",
    email:"tbthanh@dongnai.gov.vn", password:"demo123",
    role:"lãnh đạo đơn vị", roleLabel:"Lãnh đạo đơn vị",
    roleColor:ROLE_VISUAL.manager.color, roleBg:ROLE_VISUAL.manager.bg,
    avatarFrom:ROLE_VISUAL.manager.from, avatarTo:ROLE_VISUAL.manager.to,
    roleIcon:ROLE_VISUAL.manager.icon,
    desc:"Phát động phong trào (nếu được phân quyền), duyệt hồ sơ cấp đơn vị, trình cấp trên, theo dõi tiến độ đơn vị",
    perms:["Phát động PT","Duyệt hồ sơ","Trình cấp trên","Theo dõi TD"],
  },
  {
    id:11, name:"Lê Thị Thanh Xuân", initials:"TX",
    title:"Phó Giám đốc Sở", unit:"Sở Giáo dục & Đào tạo Đồng Nai",
    email:"ltxuan@soe.dongnai.gov.vn", password:"demo123",
    role:"cá nhân", roleLabel:"Cá nhân",
    roleColor:ROLE_VISUAL.user.color, roleBg:ROLE_VISUAL.user.bg,
    avatarFrom:ROLE_VISUAL.user.from, avatarTo:ROLE_VISUAL.user.to,
    roleIcon:ROLE_VISUAL.user.icon,
    desc:"Đăng ký tham gia phong trào, nộp hồ sơ, theo dõi trạng thái, gửi ý kiến công khai",
    perms:["Đăng ký PT","Nộp hồ sơ","Theo dõi TT","Ý kiến CK"],
  },
];

const FEATURES = [
  { icon:"🏆", text:"Quản lý Phong trào thi đua toàn tỉnh" },
  { icon:"✍️", text:"Ký số CA/PKI tích hợp sẵn" },
  { icon:"🤖", text:"Trợ lý AI hỗ trợ 24/7" },
  { icon:"📊", text:"Bảng xếp hạng & Phân tích realtime" },
];

export function LoginPage({ onLogin, onPublicLYK }: { onLogin: (u: LoginUser) => void; onPublicLYK?: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<number|null>(null);
  const [activeRoleId, setActiveRoleId] = useState<number>(14);

  const pickDemo = (acc: DemoAccount) => {
    if (loading) return;
    setSelected(acc.id); setEmail(acc.email); setPassword(acc.password); setError("");
    setLoading(true);
    setTimeout(() => {
      const { password:_p, desc:_d, perms:_pr, roleIcon:_ri, ...user } = acc;
      onLogin(user); setLoading(false);
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    setTimeout(() => {
      const acc = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
      if (acc) {
        const { password:_p, desc:_d, perms:_pr, roleIcon:_ri, ...user } = acc;
        onLogin(user);
      } else {
        setError("Sai tài khoản hoặc mật khẩu."); setSelected(null);
      }
      setLoading(false);
    }, 800);
  };

  const activeAccount = DEMO_ACCOUNTS.find(a => a.id === activeRoleId)!;

  const getRv = (role: LoginUser["role"]) => ROLE_VISUAL[
    role === "quản trị hệ thống" ? "admin"
    : role === "lãnh đạo cấp cao" ? "leader"
    : role === "hội đồng" ? "council"
    : role === "lãnh đạo đơn vị" ? "manager" : "user"
  ];

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ fontFamily:"var(--font-sans)", background:"#0a0f1e" }}>

      {/* ══════════════════════════════════════════
          LEFT — Visual Brand Panel
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 relative overflow-hidden">

        {/* Animated gradient background */}
        <div className="absolute inset-0" style={{
          background:"linear-gradient(135deg, #0d1b3e 0%, #0b1426 40%, #0f0a1e 100%)",
        }}/>

        {/* Glow blobs */}
        <div className="absolute" style={{ top:-80, left:-80, width:400, height:400,
          background:"radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 70%)", borderRadius:"50%" }}/>
        <div className="absolute" style={{ bottom:-100, right:-60, width:360, height:360,
          background:"radial-gradient(circle, rgba(28,95,190,0.15) 0%, transparent 70%)", borderRadius:"50%" }}/>
        <div className="absolute" style={{ top:"40%", right:40, width:200, height:200,
          background:"radial-gradient(circle, rgba(212,168,75,0.08) 0%, transparent 70%)", borderRadius:"50%" }}/>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage:"linear-gradient(rgba(255,210,122,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,210,122,0.6) 1px, transparent 1px)",
          backgroundSize:"48px 48px",
        }}/>

        {/* Top border accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background:"linear-gradient(to right, transparent, #c8102e, #d4a84b, transparent)" }}/>

        <div className="relative z-10 flex flex-col h-full px-12 py-14">

          {/* Emblem */}
          <div className="flex items-center gap-4 mb-16">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl opacity-40 blur-sm"
                style={{ background:"linear-gradient(135deg,#c8102e,#d4a84b)" }}/>
              <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background:"linear-gradient(135deg,#c8102e 0%,#7a0a1c 100%)",
                  border:"1.5px solid rgba(255,210,122,0.3)",
                  boxShadow:"0 8px 24px rgba(200,16,46,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                <span style={{ fontSize:18, fontWeight:800, color:"#ffd27a", letterSpacing:2 }}>VQ</span>
              </div>
            </div>
            <div>
              <div className="text-[13px] tracking-[0.2em] uppercase mb-0.5" style={{ color:"rgba(176,188,212,0.6)" }}>
                Tỉnh ủy Đồng Nai
              </div>
              <div className="text-[18px] font-bold" style={{ color:"#ffd27a" }}>VPTU Đồng Nai</div>
            </div>
          </div>

          {/* Big headline */}
          <div className="mb-12">
            <h1 className="leading-tight mb-4" style={{ fontSize:38, fontWeight:800, color:"#ffffff", lineHeight:1.15 }}>
              Hệ thống<br/>
              <span style={{ background:"linear-gradient(90deg,#ffd27a,#f59e0b)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Thi đua
              </span>{" "}
              <span style={{ color:"rgba(255,255,255,0.9)" }}>Khen thưởng</span>
            </h1>
            <p className="text-[14px] leading-relaxed" style={{ color:"rgba(176,188,212,0.75)", maxWidth:300 }}>
              Nền tảng số hóa toàn diện công tác thi đua khen thưởng Tỉnh Đồng Nai
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 mb-12">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ fontSize:16 }}>{f.icon}</span>
                </div>
                <span className="text-[14px]" style={{ color:"rgba(200,212,235,0.85)" }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* AI badge */}
          <div className="rounded-2xl p-4 mb-auto" style={{
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",
            backdropFilter:"blur(8px)",
          }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background:"linear-gradient(135deg,#7c3aed,#c026d3)" }}>
                <Sparkles className="size-4 text-white"/>
              </div>
              <div>
                <div className="text-[14px] font-semibold" style={{ color:"#e2d9f3" }}>Trợ lý AI</div>
                <div className="text-[13px]" style={{ color:"rgba(176,160,220,0.65)" }}>Tư vấn hồ sơ thông minh 24/7</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                <span className="text-[12px] text-green-400">Online</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-[13px]" style={{ color:"rgba(74,88,120,0.8)" }}>
            © 2026 VPTU Đồng Nai · Phiên bản 1.0.0
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Login Panel
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto py-10"
        style={{ background:"#ffffff" }}>

        <div className="w-full max-w-[480px] px-6">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background:"linear-gradient(135deg,#c8102e,#7a0a1c)" }}>
              <span style={{ fontSize:13, fontWeight:800, color:"#ffd27a" }}>VQ</span>
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#0b1426]">VPTU Đồng Nai</div>
              <div className="text-[13px] text-[#635647]">Hệ thống Thi đua – Khen thưởng</div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ background:"#1C5FBE14", border:"1px solid #1C5FBE22" }}>
              <Shield className="size-3.5" style={{ color:"#1C5FBE" }}/>
              <span className="text-[13px] font-semibold" style={{ color:"#1C5FBE" }}>Cổng đăng nhập bảo mật</span>
            </div>
            <h2 className="text-[24px] font-bold text-[#0b1426] mb-1">Chào mừng trở lại</h2>
            <p className="text-[14px] text-[#635647]">Đăng nhập để truy cập hệ thống Thi đua Khen thưởng</p>
          </div>

          {/* Login form card */}
          <div className="rounded-2xl p-6 mb-5" style={{
            background:"#ffffff",
            border:"1px solid #e2e8f0",
            boxShadow:"0 4px 24px rgba(11,20,38,0.07), 0 1px 3px rgba(11,20,38,0.04)",
          }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[13px] font-semibold text-[#0b1426] mb-1.5">
                  Email / Tài khoản
                </label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ten@dongnai.gov.vn"
                  autoComplete="username" required
                  className="w-full h-11 px-4 rounded-xl border text-[14px] outline-none transition-all"
                  style={{
                    borderColor:"#e2e8f0", background:"#f4f7fb",
                    color:"#0b1426",
                  }}
                  onFocus={e => { e.target.style.borderColor="#1C5FBE"; e.target.style.boxShadow="0 0 0 3px rgba(28,95,190,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-semibold text-[#0b1426] mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password" required
                    className="w-full h-11 pl-4 pr-12 rounded-xl border text-[14px] outline-none transition-all"
                    style={{ borderColor:"#e2e8f0", background:"#f4f7fb", color:"#0b1426" }}
                    onFocus={e => { e.target.style.borderColor="#1C5FBE"; e.target.style.boxShadow="0 0 0 3px rgba(28,95,190,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color:"#74654a" }}>
                    {showPass ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px]"
                  style={{ background:"#fff1f2", border:"1px solid #fecdd3", color:"#9f1239" }}>
                  <span className="shrink-0">⚠</span><span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[14px] font-semibold transition-all"
                style={{
                  background: loading ? "#6b9fd4" : "linear-gradient(135deg,#1C5FBE,#1752a8)",
                  color:"#ffffff",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(28,95,190,0.35)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}>
                {loading
                  ? <><span className="size-4 rounded-full border-2 border-white/50 border-t-white animate-spin"/>Đang xác thực…</>
                  : <><LogIn className="size-4"/>Đăng nhập<ArrowRight className="size-4"/></>}
              </button>
            </form>
          </div>

          {/* Quick-access role section */}
          <div className="rounded-2xl overflow-hidden" style={{
            border:"1px solid #e2e8f0",
            boxShadow:"0 2px 12px rgba(11,20,38,0.05)",
          }}>
            {/* Header */}
            <div className="px-5 py-3 flex items-center gap-2"
              style={{ background:"#ffffff", borderBottom:"1px solid #e2e8f0" }}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background:"#0b1426" }}>
                <User className="size-3 text-white"/>
              </div>
              <span className="text-[13px] font-semibold text-[#0b1426]">Đăng nhập nhanh theo vai trò</span>
              <span className="ml-auto text-[12px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background:"#eef2f8", color:"#635647" }}>Demo</span>
            </div>

            {/* Role tabs */}
            <div className="flex" style={{ background:"#f4f7fb", borderBottom:"1px solid #e2e8f0" }}>
              {DEMO_ACCOUNTS.map(acc => {
                const rv = getRv(acc.role);
                const Icon = rv.icon;
                const isActive = activeRoleId === acc.id;
                return (
                  <button key={acc.id}
                    onClick={() => setActiveRoleId(acc.id)}
                    disabled={loading}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 px-1 text-[12px] font-medium transition-all"
                    style={{
                      background: isActive ? "#ffffff" : "transparent",
                      color: isActive ? rv.color : "#74654a",
                      borderBottom: `2px solid ${isActive ? rv.color : "transparent"}`,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}>
                    <div className="size-7 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg,${rv.from},${rv.to})`
                          : rv.bg,
                      }}>
                      <Icon className="size-3.5" style={{ color: isActive ? "#fff" : rv.color }} />
                    </div>
                    <span>{rv.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Description panel */}
            {(() => {
              const rv = getRv(activeAccount.role);
              const isLoggingIn = loading && selected === activeAccount.id;
              return (
                <div style={{ background:"#ffffff" }}>
                  {/* Role info */}
                  <div className="px-5 pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[13px] font-bold text-[#0b1426]">{activeAccount.roleLabel}</span>
                      <span className="text-[12px] px-2 py-0.5 rounded-full"
                        style={{ background:rv.bg, color:rv.color, border:`1px solid ${rv.border}` }}>
                        {activeAccount.title}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color:"#4a5568" }}>
                      {activeAccount.desc}
                    </p>
                    {/* Perms */}
                    <div className="flex gap-1.5 flex-wrap mt-2.5">
                      {activeAccount.perms.map(p => (
                        <span key={p} className="flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full"
                          style={{ background:rv.bg, color:rv.color, border:`1px solid ${rv.border}` }}>
                          <CheckCircle2 className="size-2.5" />{p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Account card */}
                  <div className="px-5 pb-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background:"#f8fafc", border:`1px solid ${rv.border}` }}>
                      <div className="size-10 rounded-xl shrink-0 flex items-center justify-center text-[13px] font-bold text-white"
                        style={{ background:`linear-gradient(135deg,${activeAccount.avatarFrom},${activeAccount.avatarTo})` }}>
                        {activeAccount.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[#0b1426]">{activeAccount.name}</div>
                        <div className="text-[12px] truncate" style={{ color:"#635647" }}>{activeAccount.unit}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <code className="text-[11px] px-1.5 py-px rounded"
                            style={{ background:"#eef2f8", color:"#5a5040" }}>{activeAccount.email}</code>
                          <code className="text-[11px] px-1.5 py-px rounded"
                            style={{ background:"#eef2f8", color:"#5a5040" }}>demo123</code>
                        </div>
                      </div>
                      <button
                        onClick={() => pickDemo(activeAccount)}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-white shrink-0 transition-opacity"
                        style={{
                          background: `linear-gradient(135deg,${rv.from},${rv.to})`,
                          opacity: loading ? 0.7 : 1,
                          cursor: loading ? "not-allowed" : "pointer",
                        }}>
                        {isLoggingIn
                          ? <span className="size-3.5 rounded-full border border-white border-t-transparent animate-spin"/>
                          : <ArrowRight className="size-3.5"/>}
                        {isLoggingIn ? "Đang vào…" : "Đăng nhập"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Public LYK */}
          {onPublicLYK && (
            <button onClick={onPublicLYK}
              className="w-full mt-4 h-11 rounded-xl flex items-center justify-center gap-2 text-[13px] font-medium transition-all"
              style={{
                background:"#ffffff", border:"1.5px solid #e2e8f0", color:"#635647",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#1C5FBE"; (e.currentTarget as HTMLElement).style.color="#1C5FBE"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="#e2e8f0"; (e.currentTarget as HTMLElement).style.color="#635647"; }}>
              <Megaphone className="size-4"/>
              Góp ý Hồ sơ Khen thưởng Công khai
              <span className="px-2 py-0.5 rounded-full text-[12px]"
                style={{ background:"#dcfce7", color:"#166534" }}>Không cần đăng nhập</span>
            </button>
          )}

          <p className="text-center text-[13px] mt-5 text-[#74654a]">
            © 2026 VPTU Đồng Nai · Hệ thống Thi đua Khen thưởng
          </p>
        </div>
      </div>
    </div>
  );
}
