import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { LoginUser } from "./login-page";

const DIAGRAM = `
flowchart TD
    classDef ldcc fill:#ddeafc,stroke:#1C5FBE,color:#0b1426
    classDef hd   fill:#f5f3ff,stroke:#7c3aed,color:#0b1426
    classDef lddv fill:#dcfce7,stroke:#166534,color:#0b1426
    classDef cn   fill:#fef9ec,stroke:#b45309,color:#0b1426
    classDef qtht fill:#f3f4f6,stroke:#374151,color:#0b1426
    classDef gw   fill:#fef3c7,stroke:#b45309,color:#0b1426
    classDef gwp  fill:#e0f2fe,stroke:#0e7490,color:#0b1426
    classDef se   fill:#1C5FBE,stroke:#0d3d8a,color:white
    classDef rej  fill:#fee2e2,stroke:#c8102e,color:#9f1239

    START(["▶ Bắt đầu"]):::se

    subgraph P0["📣  Giai đoạn 0 — Phát động"]
        B1["B1 · Soạn thảo phong trào\n👤 LĐCC"]:::ldcc
        B2["B2 · Trình phê duyệt\n👤 LĐCC"]:::ldcc
        B3["B3 · Phê duyệt kế hoạch\n👥 Hội đồng TĐKT"]:::hd
        GW1{Phê duyệt?}:::gw
        B4["B4 · Phê duyệt nguồn kinh phí\n👤 LĐCC"]:::ldcc
        B5["B5 · Ban hành & Công bố\n👤 LĐCC"]:::ldcc
    end

    subgraph P1["⚙️  Giai đoạn 1 — Triển khai & Đăng ký"]
        GW_F{{"◆ Luồng song song"}}:::gwp
        B6["B6 · Đăng ký đơn vị\n🏢 LĐDV"]:::lddv
        B7["B7 · Đăng ký cá nhân\n👤 Cá nhân"]:::cn
        B8["B8 · Nộp hồ sơ\n👤 Cá nhân"]:::cn
        GW_J{{"◆ Hội tụ"}}:::gwp
        B9["B9 · Duyệt hồ sơ cơ sở\n🏢 LĐDV"]:::lddv
        GW2{Đạt?}:::gw
    end

    subgraph P2["🔍  Giai đoạn 2 — Thẩm định & Xét duyệt"]
        B10["B10 · Tiếp nhận & Phân loại\n👥 HĐ Thư ký"]:::hd
        GW3{Đủ HT?}:::gw
        B11["B11 · Thẩm định nội dung\n👥 Hội đồng TĐKT"]:::hd
        GW4{Đủ TC?}:::gw
        B12["B12 · Lấy ý kiến công khai\n👤 LĐCC  ⏱ tối thiểu 30 ngày"]:::ldcc
        GW5{Phản ánh hợp lệ?}:::gw
        B13["B13 · Bình xét Hội đồng\n👥 HĐ TĐKT  📊 ≥ 2/3 phiếu"]:::hd
        GW6{≥ 2/3 phiếu?}:::gw
        RUT(["✕ Rút hồ sơ"]):::rej
    end

    subgraph P3["🏆  Giai đoạn 3 — Ban hành & Lưu trữ"]
        B14["B14 · Trình ký lãnh đạo\n👤 LĐCC"]:::ldcc
        B15["B15 · Ký số CA Token\n👤 LĐCC"]:::ldcc
        B16["B16 · Công bố kết quả\n👤 LĐCC"]:::ldcc
        B17["B17 · Nhận kết quả\n👤 Cá nhân / Tập thể"]:::cn
        B18["B18 · Lưu trữ hồ sơ\n🔧 QTHT  · 20 năm"]:::qtht
    end

    END(["⏹ Kết thúc"]):::se

    START --> B1 --> B2 --> B3 --> GW1
    GW1 -->|"✗ Yêu cầu chỉnh sửa"| B1
    GW1 -->|"✓ Phê duyệt"| B4 --> B5 --> GW_F

    GW_F -->|"Luồng đơn vị"| B6
    GW_F -->|"Luồng cá nhân"| B7 --> B8

    B6 --> GW_J
    B8 --> GW_J
    GW_J --> B9 --> GW2

    GW2 -->|"✗ Trả lại hồ sơ"| B8
    GW2 -->|"✓ Đạt yêu cầu"| B10 --> GW3

    GW3 -->|"✗ Thiếu ĐK hình thức"| B9
    GW3 -->|"✓ Đủ điều kiện"| B11 --> GW4

    GW4 -->|"✗ Không đủ tiêu chí"| B9
    GW4 -->|"✓ Đủ tiêu chí"| B12 --> GW5

    GW5 -->|"✗ Có phản ánh hợp lệ"| B11
    GW5 -->|"✓ Không có phản ánh"| B13 --> GW6

    GW6 -->|"✗ Không đủ 2/3 phiếu"| RUT
    GW6 -->|"✓ Đủ phiếu thông qua"| B14 --> B15 --> B16 --> B17 --> B18 --> END
`;

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  flowchart: { htmlLabels: true, curve: "basis", padding: 20 },
  themeVariables: {
    fontFamily: "Be Vietnam Pro, sans-serif",
    fontSize: "13px",
  },
});

export function BpmnPhongTraoPage({ user: _user }: { user: LoginUser }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState("");
  const [scale, setScale] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    mermaid
      .render("bpmn-phong-trao", DIAGRAM)
      .then(({ svg }) => setSvgContent(svg))
      .catch(e => setError(String(e)));
  }, []);

  const downloadSvg = () => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bpmn-phat-dong-phong-trao.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPng = () => {
    const img = new Image();
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth  * 2;
      canvas.height = img.naturalHeight * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "bpmn-phat-dong-phong-trao.png";
      a.click();
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col h-full min-h-screen" style={{ background: "#f4f7fb", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-8 py-5 border-b flex items-center justify-between" style={{ background: "white", borderColor: "#e2e8f0" }}>
        <div>
          <h1 className="text-[18px] font-bold text-[#0b1426]">Sơ đồ BPMN — Luồng Phát động Phong trào</h1>
          <p className="text-[13px] text-[#635647] mt-0.5">
            VPTU Đồng Nai · 18 bước · 4 giai đoạn · 5 vai trò · BPMN 2.0
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
            className="size-8 rounded-[6px] border flex items-center justify-center text-[#635647] hover:bg-[#f4f7fb] transition-colors"
            style={{ borderColor: "#e2e8f0" }}>
            <ZoomOut className="size-4" />
          </button>
          <span className="text-[13px] text-[#635647] w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))}
            className="size-8 rounded-[6px] border flex items-center justify-center text-[#635647] hover:bg-[#f4f7fb] transition-colors"
            style={{ borderColor: "#e2e8f0" }}>
            <ZoomIn className="size-4" />
          </button>
          <button onClick={() => setScale(1)}
            className="size-8 rounded-[6px] border flex items-center justify-center text-[#635647] hover:bg-[#f4f7fb] transition-colors"
            style={{ borderColor: "#e2e8f0" }}>
            <RotateCcw className="size-3.5" />
          </button>

          <div className="w-px h-6 mx-1" style={{ background: "#e2e8f0" }} />

          <button onClick={downloadSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[13px] font-medium transition-colors hover:bg-[#f4f7fb]"
            style={{ borderColor: "#e2e8f0", color: "#1C5FBE" }}>
            <Download className="size-3.5" />SVG
          </button>
          <button onClick={downloadPng}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium text-white transition-colors"
            style={{ background: "#1C5FBE" }}>
            <Download className="size-3.5" />PNG
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-8 py-3 border-b flex items-center gap-6" style={{ background: "white", borderColor: "#e2e8f0" }}>
        <span className="text-[12px] font-semibold text-[#635647] uppercase tracking-wider">Vai trò:</span>
        {[
          { color: "#ddeafc", border: "#1C5FBE", label: "Lãnh đạo cấp cao" },
          { color: "#f5f3ff", border: "#7c3aed", label: "Hội đồng TĐKT" },
          { color: "#dcfce7", border: "#166534", label: "Lãnh đạo đơn vị" },
          { color: "#fef9ec", border: "#b45309", label: "Cá nhân / Tập thể" },
          { color: "#f3f4f6", border: "#374151", label: "Quản trị hệ thống" },
        ].map(r => (
          <div key={r.label} className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-[3px] shrink-0" style={{ background: r.color, border: `1.5px solid ${r.border}` }} />
            <span className="text-[12px] text-[#374151]">{r.label}</span>
          </div>
        ))}
        <div className="ml-4 flex items-center gap-4" style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }}>
          <span className="text-[12px] text-[#635647]">◆ = Parallel gateway</span>
          <span className="text-[12px] text-[#635647]">◇ = Exclusive gateway (XOR)</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-8">
        <div style={{ transformOrigin: "top left", transform: `scale(${scale})` }}>
          {error ? (
            <div className="p-8 rounded-[12px] border" style={{ borderColor: "#fca5a5", background: "#fee2e2" }}>
              <p className="text-[13px] text-[#c8102e]">Lỗi render diagram: {error}</p>
            </div>
          ) : svgContent ? (
            <div
              ref={containerRef}
              className="rounded-[16px] overflow-hidden"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(11,20,38,0.08)", display: "inline-block", minWidth: 800 }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-[14px] text-[#635647] animate-pulse">Đang render sơ đồ BPMN…</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
