import { Search, Mail, Lock, Eye, User, CheckCircle2, AlertCircle, Info, FileText, Award, Clock, Sparkles, ArrowRight, Plus, Download } from "lucide-react";
import { DsButton } from "./ds-button";
import { DsInput } from "./ds-input";
import { DsBadge } from "./ds-badge";
import { DsCard } from "./ds-card";

/* ─── Section wrapper ────────────────────────────────────────────────────── */
function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="pb-3 border-b border-[#e2e8f0]">
        <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 18 }} className="text-[#0b1426]">
          {title}
        </h3>
        {sub && <p className="text-[13px] text-[#635647] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] text-[#635647] tracking-[0.06em] uppercase" style={{ fontFamily: "var(--font-sans)" }}>{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/* ─── Showcase ───────────────────────────────────────────────────────────── */
export function DsShowcase() {
  return (
    <div className="p-8 max-w-[1400px] space-y-12">

      {/* ── Header ── */}
      <div className="relative rounded-[10px] overflow-hidden bg-[#0b1426] text-white px-8 py-7">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "repeating-linear-gradient(45deg, #ffd27a 0, #ffd27a 1px, transparent 1px, transparent 20px)"
        }} />
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-3.5 text-[#ffd27a]" />
            <span className="text-[13px] tracking-[0.2em] text-[#ffd27a] uppercase" style={{ fontFamily: "var(--font-sans)" }}>VPTU Đồng Nai · Design System</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 24 }} className="leading-tight">
            Component Library
          </h1>
          <p className="mt-2 text-[14px] text-white/65 leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
            Bộ thư viện giao diện chuẩn hoá: <code className="text-[#ffd27a] bg-white/8 px-1 py-0.5 rounded text-[13px]">DsButton</code>,
            <code className="text-[#ffd27a] bg-white/8 px-1 py-0.5 rounded text-[13px] mx-1">DsInput</code>,
            <code className="text-[#ffd27a] bg-white/8 px-1 py-0.5 rounded text-[13px]">DsBadge</code>,
            <code className="text-[#ffd27a] bg-white/8 px-1 py-0.5 rounded text-[13px] mx-1">DsCard</code> —
            dùng token thiết kế nhất quán, hỗ trợ đầy đủ trạng thái.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <DsBadge variant="gold" size="md" dot>Spacing scale 4→64px</DsBadge>
            <DsBadge variant="info" size="md" dot>Shadow xs→modal</DsBadge>
            <DsBadge variant="success" size="md" dot>Playfair + Google Sans</DsBadge>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/*  1. BUTTON                              */}
      {/* ═══════════════════════════════════════ */}
      <Section title="DsButton" sub="4 biến thể · sm 32px / md 40px / lg 48px · đầy đủ trạng thái default/hover/active/focus/disabled">

        <Row label="Biến thể (size md)">
          <DsButton variant="primary">Primary</DsButton>
          <DsButton variant="secondary">Secondary</DsButton>
          <DsButton variant="ghost">Ghost</DsButton>
          <DsButton variant="dark">Dark</DsButton>
        </Row>

        <Row label="Kích thước · primary">
          <DsButton variant="primary" size="sm">Small · 32px</DsButton>
          <DsButton variant="primary" size="md">Medium · 40px</DsButton>
          <DsButton variant="primary" size="lg">Large · 48px</DsButton>
        </Row>

        <Row label="Với icon">
          <DsButton variant="primary" size="md"><Plus className="size-3.5" /> Tạo hồ sơ</DsButton>
          <DsButton variant="secondary" size="md"><Download className="size-3.5" /> Xuất Excel</DsButton>
          <DsButton variant="ghost" size="md">Xem toàn bộ <ArrowRight className="size-3.5" /></DsButton>
          <DsButton variant="dark" size="md"><Award className="size-3.5" /> Khen thưởng</DsButton>
        </Row>

        <Row label="Trạng thái disabled">
          <DsButton variant="primary" disabled>Primary</DsButton>
          <DsButton variant="secondary" disabled>Secondary</DsButton>
          <DsButton variant="ghost" disabled>Ghost</DsButton>
          <DsButton variant="dark" disabled>Dark</DsButton>
        </Row>
      </Section>

      {/* ═══════════════════════════════════════ */}
      {/*  2. INPUT                               */}
      {/* ═══════════════════════════════════════ */}
      <Section title="DsInput" sub="3 kích thước · sm 32px / md 40px / lg 48px · không đổ bóng · prefix & suffix icon">

        <Row label="Kích thước">
          <div className="w-[200px]">
            <DsInput size="sm" placeholder="Small · 32px" />
          </div>
          <div className="w-[220px]">
            <DsInput size="md" placeholder="Medium · 40px" />
          </div>
          <div className="w-[240px]">
            <DsInput size="lg" placeholder="Large · 48px" />
          </div>
        </Row>

        <Row label="Với label & hint">
          <div className="w-[260px]">
            <DsInput
              label="Tên đơn vị"
              placeholder="Nhập tên đơn vị đề nghị"
              hint="Tên chính xác theo quyết định thành lập"
            />
          </div>
          <div className="w-[260px]">
            <DsInput
              label="Email liên hệ"
              required
              placeholder="vd: vanphong@sogd.gov.vn"
              prefix={<Mail className="size-3.5" />}
            />
          </div>
          <div className="w-[260px]">
            <DsInput
              label="Mật khẩu"
              required
              type="password"
              placeholder="••••••••"
              prefix={<Lock className="size-3.5" />}
              suffix={<Eye className="size-3.5" />}
            />
          </div>
        </Row>

        <Row label="Trạng thái">
          <div className="w-[240px]">
            <DsInput
              label="Tên cán bộ"
              error="Trường này không được để trống"
              placeholder="Nguyễn Văn A"
              prefix={<User className="size-3.5" />}
            />
          </div>
          <div className="w-[240px]">
            <DsInput
              label="Mã định danh"
              successMsg="Mã hợp lệ, đã xác thực"
              defaultValue="CB-2024-00847"
              prefix={<CheckCircle2 className="size-3.5" />}
            />
          </div>
          <div className="w-[240px]">
            <DsInput
              label="Tên đăng nhập"
              placeholder="Đã vô hiệu hoá"
              disabled
              prefix={<User className="size-3.5" />}
            />
          </div>
        </Row>

        <Row label="Input không label (inline)">
          <DsInput
            size="sm"
            placeholder="Tìm kiếm hồ sơ..."
            prefix={<Search className="size-3.5" />}
            rootClassName="w-[220px]"
          />
          <DsInput
            size="md"
            placeholder="Số quyết định..."
            prefix={<FileText className="size-3.5" />}
            rootClassName="w-[240px]"
          />
        </Row>
      </Section>

      {/* ═══════════════════════════════════════ */}
      {/*  3. BADGE                               */}
      {/* ═══════════════════════════════════════ */}
      <Section title="DsBadge" sub="10 biến thể màu · 2 kích thước · tùy chọn dot indicator">

        <Row label="Tất cả biến thể (size md)">
          <DsBadge variant="neutral">Neutral</DsBadge>
          <DsBadge variant="primary">Primary</DsBadge>
          <DsBadge variant="success">Thành công</DsBadge>
          <DsBadge variant="warning">Chờ xử lý</DsBadge>
          <DsBadge variant="error">Lỗi</DsBadge>
          <DsBadge variant="gold">Huân chương</DsBadge>
          <DsBadge variant="info">Thông tin</DsBadge>
          <DsBadge variant="outline">Outline</DsBadge>
          <DsBadge variant="dark">Dark</DsBadge>
          <DsBadge variant="gold-solid">Vàng đặc</DsBadge>
        </Row>

        <Row label="Size sm">
          <DsBadge variant="primary" size="sm">Đề nghị mới</DsBadge>
          <DsBadge variant="success" size="sm">Đã phê duyệt</DsBadge>
          <DsBadge variant="warning" size="sm">Đang duyệt</DsBadge>
          <DsBadge variant="error" size="sm">Bị từ chối</DsBadge>
          <DsBadge variant="gold" size="sm">Cấp Tỉnh</DsBadge>
          <DsBadge variant="info" size="sm">AI</DsBadge>
          <DsBadge variant="dark" size="sm">Beta</DsBadge>
        </Row>

        <Row label="Với dot indicator (trạng thái realtime)">
          <DsBadge variant="success" dot>Đang hoạt động</DsBadge>
          <DsBadge variant="warning" dot>Đang xử lý</DsBadge>
          <DsBadge variant="error" dot>Cần xử lý gấp</DsBadge>
          <DsBadge variant="info" dot>Chờ xác thực</DsBadge>
          <DsBadge variant="neutral" dot>Không hoạt động</DsBadge>
        </Row>

        <Row label="Use case thực tế">
          <div className="flex items-center gap-2 px-3 py-2 rounded-[6px] border border-[#e2e8f0] bg-white">
            <Award className="size-4 text-[#8a6400]" />
            <span className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>Huân chương Lao động hạng Ba</span>
            <DsBadge variant="gold" size="sm">Cấp Nhà nước</DsBadge>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-[6px] border border-[#e2e8f0] bg-white">
            <Clock className="size-4 text-[#635647]" />
            <span className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)" }}>Hồ sơ #CB-2024-00847</span>
            <DsBadge variant="warning" size="sm" dot>Thẩm định</DsBadge>
          </div>
        </Row>
      </Section>

      {/* ═══════════════════════════════════════ */}
      {/*  4. CARD                                */}
      {/* ═══════════════════════════════════════ */}
      <Section title="DsCard" sub="4 biến thể · padding scale · compound Header/Body/Footer · hoverable">

        <Row label="Biến thể">
          <DsCard variant="default" padding="md" className="w-[180px]">
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>variant="default"</p>
            <p className="text-[14px] text-[#0b1426] mt-1" style={{ fontFamily: "var(--font-sans)" }}>Shadow nhẹ + viền</p>
          </DsCard>
          <DsCard variant="elevated" padding="md" className="w-[180px]">
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>variant="elevated"</p>
            <p className="text-[14px] text-[#0b1426] mt-1" style={{ fontFamily: "var(--font-sans)" }}>Shadow rõ hơn</p>
          </DsCard>
          <DsCard variant="flat" padding="md" className="w-[180px]">
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>variant="flat"</p>
            <p className="text-[14px] text-[#0b1426] mt-1" style={{ fontFamily: "var(--font-sans)" }}>Chỉ viền, không shadow</p>
          </DsCard>
          <DsCard variant="paper" padding="md" className="w-[180px]">
            <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>variant="paper"</p>
            <p className="text-[14px] text-[#0b1426] mt-1" style={{ fontFamily: "var(--font-sans)" }}>Nền vàng nhạt</p>
          </DsCard>
        </Row>

        <Row label="Hoverable">
          <DsCard variant="default" padding="md" hoverable className="w-[200px]">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-[#8a6400]" />
              <span className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}>Hover để thấy</span>
            </div>
            <p className="text-[13px] text-[#635647] mt-1.5" style={{ fontFamily: "var(--font-sans)" }}>Shadow & border nổi lên</p>
          </DsCard>
          <DsCard variant="elevated" padding="md" hoverable className="w-[200px]">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#c8102e]" />
              <span className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}>AI gợi ý</span>
            </div>
            <p className="text-[13px] text-[#635647] mt-1.5" style={{ fontFamily: "var(--font-sans)" }}>3 hồ sơ đủ điều kiện</p>
          </DsCard>
        </Row>

        <Row label="Compound Header / Body / Footer">
          <DsCard variant="default" className="w-[340px]">
            <DsCard.Header>
              <DsCard.Title>Hồ sơ khen thưởng</DsCard.Title>
              <DsBadge variant="warning" size="sm" dot>Đang xét duyệt</DsBadge>
            </DsCard.Header>
            <DsCard.Body>
              <dl className="space-y-2">
                {[
                  ["Cán bộ", "Trần Thị Minh Hà"],
                  ["Đơn vị", "THPT Chuyên Lam Sơn"],
                  ["Danh hiệu", "Chiến sĩ thi đua cấp Tỉnh"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2">
                    <dt className="text-[13px] text-[#635647] w-20 shrink-0" style={{ fontFamily: "var(--font-sans)" }}>{k}</dt>
                    <dd className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </DsCard.Body>
            <DsCard.Footer>
              <DsCard.Actions>
                <DsButton variant="primary" size="sm">Phê duyệt</DsButton>
                <DsButton variant="ghost" size="sm">Trả lại</DsButton>
              </DsCard.Actions>
            </DsCard.Footer>
          </DsCard>

          <DsCard variant="default" className="w-[300px]">
            <DsCard.Header compact>
              <DsCard.Title style={{ fontSize: 14 }}>Thống kê nhanh</DsCard.Title>
              <DsButton variant="ghost" size="sm">Xem tất cả →</DsButton>
            </DsCard.Header>
            <DsCard.Body compact>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Hồ sơ chờ", val: "47", badge: <DsBadge variant="warning" size="sm">Mới</DsBadge> },
                  { label: "Đã duyệt", val: "1.284", badge: <DsBadge variant="success" size="sm">↑18%</DsBadge> },
                  { label: "Từ chối", val: "12", badge: <DsBadge variant="error" size="sm">3 mới</DsBadge> },
                  { label: "Đang ký số", val: "8", badge: <DsBadge variant="info" size="sm" dot>Live</DsBadge> },
                ].map((item) => (
                  <div key={item.label} className="rounded-[6px] bg-[#f4f7fb] p-3">
                    <div className="text-[13px] text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)" }}>{item.label}</div>
                    <div className="flex items-end justify-between">
                      <span style={{ fontFamily: "JetBrains Mono", fontWeight: 500, fontSize: 18 }} className="text-[#0b1426] leading-none">{item.val}</span>
                      {item.badge}
                    </div>
                  </div>
                ))}
              </div>
            </DsCard.Body>
          </DsCard>
        </Row>

        <Row label="Padding scale">
          {(["sm", "md", "lg"] as const).map((p) => (
            <DsCard key={p} variant="flat" padding={p} className="w-[150px]">
              <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>padding="{p}"</p>
              <p className="text-[14px] text-[#0b1426] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                {p === "sm" ? "16px" : p === "md" ? "24px" : "32px"}
              </p>
            </DsCard>
          ))}
        </Row>
      </Section>

      {/* ═══════════════════════════════════════ */}
      {/*  5. TOKEN REFERENCE                     */}
      {/* ═══════════════════════════════════════ */}
      <Section title="Design Tokens" sub="Spacing scale, Shadow scale, Color palette">
        <div className="grid grid-cols-3 gap-6">

          {/* Spacing */}
          <DsCard variant="flat" padding="md">
            <p className="text-[13px] tracking-[0.1em] text-[#635647] uppercase mb-3" style={{ fontFamily: "var(--font-sans)" }}>Spacing scale</p>
            <div className="space-y-2">
              {[
                ["--space-1","4px"],["--space-2","8px"],["--space-3","12px"],["--space-4","16px"],
                ["--space-5","20px"],["--space-6","24px"],["--space-8","32px"],["--space-10","40px"],
              ].map(([token, val]) => (
                <div key={token} className="flex items-center gap-3">
                  <div className="bg-[#c8102e]/20 rounded" style={{ width: val, height: 10, minWidth: 4 }} />
                  <span className="text-[13px] text-[#635647]" style={{ fontFamily: "JetBrains Mono" }}>{token}</span>
                  <span className="text-[13px] text-[#0b1426] ml-auto" style={{ fontFamily: "JetBrains Mono" }}>{val}</span>
                </div>
              ))}
            </div>
          </DsCard>

          {/* Shadow */}
          <DsCard variant="flat" padding="md">
            <p className="text-[13px] tracking-[0.1em] text-[#635647] uppercase mb-3" style={{ fontFamily: "var(--font-sans)" }}>Shadow scale</p>
            <div className="space-y-3">
              {[
                ["xs","0 1px 2px ..."],
                ["sm","0 1px 3px ..."],
                ["md","0 4px 6px ..."],
                ["lg","0 10px 15px ..."],
                ["xl","0 20px 25px ..."],
                ["card","card surface"],
                ["modal","24px blur"],
              ].map(([name, desc]) => (
                <div key={name} className="flex items-center gap-3">
                  <div
                    className="w-10 h-7 rounded bg-white"
                    style={{ boxShadow: `var(--shadow-${name})` }}
                  />
                  <div>
                    <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "JetBrains Mono" }}>--shadow-{name}</span>
                    <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </DsCard>

          {/* Color palette */}
          <DsCard variant="flat" padding="md">
            <p className="text-[13px] tracking-[0.1em] text-[#635647] uppercase mb-3" style={{ fontFamily: "var(--font-sans)" }}>Color palette</p>
            <div className="space-y-2">
              {[
                ["Ink (Navy)", "#0b1426"],
                ["Ink Soft", "#4a5568"],
                ["Muted Ink", "#635647"],
                ["Paper", "#f4f7fb"],
                ["Line", "#e2e8f0"],
                ["Crimson", "#c8102e"],
                ["Crimson Hover", "#a60d25"],
                ["Gold", "#8a6400"],
                ["Success", "#0f7a3e"],
              ].map(([name, hex]) => (
                <div key={name} className="flex items-center gap-2.5">
                  <div className="w-7 h-5 rounded border border-black/8 shrink-0" style={{ background: hex }} />
                  <span className="text-[13px] text-[#0b1426] flex-1" style={{ fontFamily: "var(--font-sans)" }}>{name}</span>
                  <span className="text-[13px] text-[#635647]" style={{ fontFamily: "JetBrains Mono" }}>{hex}</span>
                </div>
              ))}
            </div>
          </DsCard>
        </div>
      </Section>

      {/* ── Usage example ── */}
      <Section title="Ví dụ tích hợp thực tế" sub="Form đề nghị khen thưởng dùng toàn bộ components">
        <DsCard variant="elevated" className="max-w-[680px]">
          <DsCard.Header>
            <div>
              <DsCard.Title>Đề nghị khen thưởng cá nhân</DsCard.Title>
              <p className="text-[13px] text-[#635647] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>Điền đầy đủ thông tin để gửi trình Hội đồng</p>
            </div>
            <DsBadge variant="info" dot>Bản nháp</DsBadge>
          </DsCard.Header>
          <DsCard.Body>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DsInput label="Họ và tên" required placeholder="Nguyễn Thị Thu Hương" prefix={<User className="size-3.5" />} />
                <DsInput label="Chức vụ" placeholder="Giáo viên, Bác sĩ, ..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DsInput label="Đơn vị công tác" required placeholder="Sở Giáo dục & Đào tạo" />
                <DsInput label="Năm công tác" placeholder="2006 – nay" />
              </div>
              <DsInput
                label="Email liên hệ"
                required
                placeholder="canbo@sogd.gov.vn"
                prefix={<Mail className="size-3.5" />}
                hint="Email sẽ nhận thông báo tiến độ hồ sơ"
              />
              <div>
                <p className="ds-input-label mb-1.5">Danh hiệu đề nghị</p>
                <div className="flex flex-wrap gap-2">
                  {["Chiến sĩ thi đua cơ sở","Chiến sĩ thi đua cấp Tỉnh","Bằng khen UBND Tỉnh","Huân chương Lao động hạng Ba"].map((d) => (
                    <button key={d} className="px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] text-[13px] text-[#0b1426] hover:border-[#c8102e] hover:bg-[#c8102e]/5 transition-colors" style={{ fontFamily: "var(--font-sans)" }}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-[6px] border border-[#ffd27a]/40 bg-[#fffbf0] p-3 flex items-start gap-2.5">
                <Info className="size-4 text-[#8a6400] mt-0.5 shrink-0" />
                <p className="text-[13px] text-[#7d5a10] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                  AI Tố Nga đã xác minh cán bộ này đủ điều kiện đề nghị <strong>Chiến sĩ thi đua cấp Tỉnh</strong> dựa trên 3 năm đạt danh hiệu cơ sở liên tiếp.
                </p>
              </div>
            </div>
          </DsCard.Body>
          <DsCard.Footer>
            <DsCard.Actions>
              <DsButton variant="primary" size="md"><CheckCircle2 className="size-3.5" /> Nộp hồ sơ</DsButton>
              <DsButton variant="secondary" size="md">Lưu bản nháp</DsButton>
              <DsButton variant="ghost" size="md">Huỷ</DsButton>
            </DsCard.Actions>
            <span className="ml-auto text-[13px] text-[#635647]" style={{ fontFamily: "JetBrains Mono" }}>
              <AlertCircle className="size-3 inline mr-1" />Chưa lưu
            </span>
          </DsCard.Footer>
        </DsCard>
      </Section>

    </div>
  );
}