import { useEffect } from "react";
import { X, Command, Keyboard } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
interface ShortcutItem {
  keys: string[];
  desc: string;
}
interface ShortcutGroup {
  group: string;
  items: ShortcutItem[];
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    group: "Điều hướng toàn cục",
    items: [
      { keys:["⌘","K"],       desc:"Mở Command Palette (tìm kiếm toàn cục)" },
      { keys:["?"],           desc:"Hiển thị bảng phím tắt này" },
      { keys:["Esc"],         desc:"Đóng modal / drawer đang mở" },
      { keys:["G","D"],       desc:"Đến Bảng điều hành" },
      { keys:["G","N"],       desc:"Đến Thông báo" },
      { keys:["G","A"],       desc:"Đến Trợ lý AI" },
      { keys:["G","B"],       desc:"Đến Bảng xếp hạng" },
      { keys:["G","H"],       desc:"Đến Hồ sơ cán bộ" },
      { keys:["G","S"],       desc:"Đến SLA Monitor" },
    ],
  },
  {
    group: "Hồ sơ & Nghiệp vụ",
    items: [
      { keys:["N"],           desc:"Tạo hồ sơ khen thưởng mới" },
      { keys:["⌘","Enter"],   desc:"Lưu / Gửi form đang điền" },
      { keys:["⌘","S"],       desc:"Lưu nháp" },
      { keys:["⌘","P"],       desc:"In hồ sơ / Quyết định" },
      { keys:["⌘","E"],       desc:"Xuất báo cáo (Excel / PDF)" },
    ],
  },
  {
    group: "Bảng dữ liệu",
    items: [
      { keys:["↑","↓"],       desc:"Điều hướng dòng trong bảng" },
      { keys:["Enter"],       desc:"Mở chi tiết hồ sơ đang chọn" },
      { keys:["⌘","F"],       desc:"Lọc / Tìm trong bảng hiện tại" },
      { keys:["⌘","⇧","F"],   desc:"Bộ lọc nâng cao" },
      { keys:["⌘","A"],       desc:"Chọn tất cả dòng" },
    ],
  },
  {
    group: "Trợ lý AI",
    items: [
      { keys:["⌘","⇧","A"],   desc:"Mở Trợ lý AI từ bất kỳ đâu" },
      { keys:["⌘","⇧","C"],   desc:"Sao chép nội dung AI cuối cùng" },
      { keys:["Tab"],         desc:"Chấp nhận gợi ý tự động điền" },
    ],
  },
  {
    group: "Giao diện",
    items: [
      { keys:["⌘","\\"],      desc:"Thu/Mở rộng sidebar" },
      { keys:["⌘","⇧","L"],   desc:"Chuyển Light/Dark mode" },
      { keys:["⌘","⇧","?"],   desc:"Mở Changelog (Có gì mới)" },
    ],
  },
];

function Key({ k }: { k: string }) {
  const isSpecial = k.length > 1 || k === "⌘" || k === "⇧" || k === "↑" || k === "↓";
  return (
    <kbd
      className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded border text-[13px]"
      style={{
        fontFamily:"JetBrains Mono, monospace",
        fontWeight:600,
        background:"white",
        borderColor:"#d1d5db",
        borderBottomWidth:"2px",
        color:"#0b1426",
        boxShadow:"0 1px 0 #d1d5db",
      }}
    >
      {k}
    </kbd>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export function ShortcutsOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background:"rgba(11,20,38,0.55)", backdropFilter:"blur(4px)" }}/>

      <div className="relative rounded-[16px] border shadow-2xl overflow-hidden"
        style={{ width:700, maxWidth:"92vw", maxHeight:"88vh", background:"white", borderColor:"#e2e8f0" }}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between" style={{ background:"var(--color-paper)" }}>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-[8px] flex items-center justify-center" style={{ background:"#0b1426" }}>
              <Keyboard className="size-5 text-[#8a6400]"/>
            </div>
            <div>
              <h2 className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>Phím tắt</h2>
              <p className="text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Tăng tốc làm việc với VPTU Đồng Nai</p>
            </div>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-[#f4f7fb] transition-colors">
            <X className="size-4 text-[#635647]"/>
          </button>
        </div>

        {/* Content: 2 columns */}
        <div className="overflow-y-auto" style={{ maxHeight:"calc(88vh - 120px)" }}>
          <div className="grid grid-cols-2 gap-0 divide-x divide-[#eef2f8]">
            {/* Left column */}
            <div className="p-6 space-y-6">
              {SHORTCUTS.slice(0, 3).map(g => (
                <div key={g.group}>
                  <div className="text-[13px] uppercase tracking-widest text-[#6b5e47] mb-2.5"
                    style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
                    {g.group}
                  </div>
                  <div className="space-y-2">
                    {g.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <span className="text-[13px] text-[#5a5040] flex-1" style={{ fontFamily: "var(--font-sans)" }}>
                          {item.desc}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((k, ki) => (
                            <span key={ki} className="flex items-center gap-1">
                              <Key k={k}/>
                              {ki < item.keys.length - 1 && (
                                <span className="text-[13px] text-[#6b5e47]">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Right column */}
            <div className="p-6 space-y-6">
              {SHORTCUTS.slice(3).map(g => (
                <div key={g.group}>
                  <div className="text-[13px] uppercase tracking-widest text-[#6b5e47] mb-2.5"
                    style={{ fontFamily: "var(--font-sans)", fontWeight:700 }}>
                    {g.group}
                  </div>
                  <div className="space-y-2">
                    {g.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <span className="text-[13px] text-[#5a5040] flex-1" style={{ fontFamily: "var(--font-sans)" }}>
                          {item.desc}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((k, ki) => (
                            <span key={ki} className="flex items-center gap-1">
                              <Key k={k}/>
                              {ki < item.keys.length - 1 && (
                                <span className="text-[13px] text-[#6b5e47]">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#eef2f8] flex items-center gap-4" style={{ background:"#ffffff" }}>
          <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>
            Nhấn <kbd className="px-1.5 py-0.5 rounded border border-[#e2e8f0] bg-white text-[13px]" style={{ fontFamily:"JetBrains Mono,monospace" }}>?</kbd> để mở bất kỳ lúc nào
          </span>
          <span className="text-[13px] text-[#6b5e47] mx-1">·</span>
          <span className="text-[13px] text-[#6b5e47]" style={{ fontFamily: "var(--font-sans)" }}>
            macOS: ⌘ = Command &nbsp;&nbsp; Windows: ⌘ = Ctrl
          </span>
        </div>
      </div>
    </div>
  );
}