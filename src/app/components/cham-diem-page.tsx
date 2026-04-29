import { useState } from "react";
import React from "react";
import { BarChart3, CheckCircle2, AlertCircle, ChevronDown, Download, Star, Users, TrendingUp, CalendarDays, Filter } from "lucide-react";
import type { LoginUser } from "./login-page";
import { useTheme } from "./theme-context";

interface UnitScore {
  id: string; name: string; type: string;
  scores: { criteria: string; max: number; score: number }[];
  total: number; rank?: number;
  submitted: boolean; lastUpdate: string;
}

const CRITERIA = [
  { key: "c1", label: "Phong trào thi đua", max: 30 },
  { key: "c2", label: "Kết quả thực hiện nhiệm vụ", max: 25 },
  { key: "c3", label: "Cải cách hành chính", max: 15 },
  { key: "c4", label: "Xây dựng tổ chức Đảng", max: 15 },
  { key: "c5", label: "An toàn PCCC & ANTT", max: 10 },
  { key: "c6", label: "Ý thức chấp hành kỷ luật", max: 5 },
];

const UNITS: UnitScore[] = [
  { id:"1", name:"Sở Giáo dục & Đào tạo", type:"Cơ quan chuyên môn", submitted:true, lastUpdate:"2026-04-15", rank:1,
    scores:[{criteria:"Phong trào thi đua",max:30,score:28},{criteria:"Kết quả thực hiện nhiệm vụ",max:25,score:24},{criteria:"Cải cách hành chính",max:15,score:14},{criteria:"Xây dựng tổ chức Đảng",max:15,score:14},{criteria:"An toàn PCCC & ANTT",max:10,score:9},{criteria:"Ý thức chấp hành kỷ luật",max:5,score:5}],
    total:94 },
  { id:"2", name:"Sở Y tế", type:"Cơ quan chuyên môn", submitted:true, lastUpdate:"2026-04-14", rank:2,
    scores:[{criteria:"Phong trào thi đua",max:30,score:27},{criteria:"Kết quả thực hiện nhiệm vụ",max:25,score:24},{criteria:"Cải cách hành chính",max:15,score:13},{criteria:"Xây dựng tổ chức Đảng",max:15,score:14},{criteria:"An toàn PCCC & ANTT",max:10,score:9},{criteria:"Ý thức chấp hành kỷ luật",max:5,score:5}],
    total:92 },
  { id:"3", name:"Sở Giao thông Vận tải", type:"Cơ quan chuyên môn", submitted:true, lastUpdate:"2026-04-16", rank:3,
    scores:[{criteria:"Phong trào thi đua",max:30,score:25},{criteria:"Kết quả thực hiện nhiệm vụ",max:25,score:23},{criteria:"Cải cách hành chính",max:15,score:14},{criteria:"Xây dựng tổ chức Đảng",max:15,score:13},{criteria:"An toàn PCCC & ANTT",max:10,score:9},{criteria:"Ý thức chấp hành kỷ luật",max:5,score:5}],
    total:89 },
  { id:"4", name:"Sở Tài chính", type:"Cơ quan chuyên môn", submitted:true, lastUpdate:"2026-04-12", rank:4,
    scores:[{criteria:"Phong trào thi đua",max:30,score:26},{criteria:"Kết quả thực hiện nhiệm vụ",max:25,score:22},{criteria:"Cải cách hành chính",max:15,score:13},{criteria:"Xây dựng tổ chức Đảng",max:15,score:13},{criteria:"An toàn PCCC & ANTT",max:10,score:8},{criteria:"Ý thức chấp hành kỷ luật",max:5,score:5}],
    total:87 },
  { id:"5", name:"Sở Nông nghiệp & PTNT", type:"Cơ quan chuyên môn", submitted:true, lastUpdate:"2026-04-18", rank:5,
    scores:[{criteria:"Phong trào thi đua",max:30,score:24},{criteria:"Kết quả thực hiện nhiệm vụ",max:25,score:22},{criteria:"Cải cách hành chính",max:15,score:13},{criteria:"Xây dựng tổ chức Đảng",max:15,score:13},{criteria:"An toàn PCCC & ANTT",max:10,score:8},{criteria:"Ý thức chấp hành kỷ luật",max:5,score:5}],
    total:85 },
  { id:"6", name:"Sở Công Thương", type:"Cơ quan chuyên môn", submitted:true, lastUpdate:"2026-04-20",
    scores:[{criteria:"Phong trào thi đua",max:30,score:22},{criteria:"Kết quả thực hiện nhiệm vụ",max:25,score:21},{criteria:"Cải cách hành chính",max:15,score:12},{criteria:"Xây dựng tổ chức Đảng",max:15,score:12},{criteria:"An toàn PCCC & ANTT",max:10,score:8},{criteria:"Ý thức chấp hành kỷ luật",max:5,score:5}],
    total:80 },
  { id:"7", name:"Sở Nội vụ", type:"Cơ quan chuyên môn", submitted:false, lastUpdate:"—",
    scores:[{criteria:"Phong trào thi đua",max:30,score:0},{criteria:"Kết quả thực hiện nhiệm vụ",max:25,score:0},{criteria:"Cải cách hành chính",max:15,score:0},{criteria:"Xây dựng tổ chức Đảng",max:15,score:0},{criteria:"An toàn PCCC & ANTT",max:10,score:0},{criteria:"Ý thức chấp hành kỷ luật",max:5,score:0}],
    total:0 },
];

function medalIcon(rank?: number) {
  if (rank === 1) return <Star className="size-4 fill-[#8a6400] text-[#8a6400]" />;
  if (rank === 2) return <Star className="size-4 fill-[#b0b5bd] text-[#b0b5bd]" />;
  if (rank === 3) return <Star className="size-4 fill-[#b07849] text-[#b07849]" />;
  return null;
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const { theme } = useTheme();
  const pct = max > 0 ? (score / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#eef2f8] overflow-hidden">
        <div className="h-full rounded-full transition-all"
          style={{ width:`${pct}%`, background: pct >= 90 ? "#166534" : pct >= 70 ? theme.primary : "#b45309" }} />
      </div>
      <span className="text-[13px] font-mono text-[#0b1426] w-10 text-right">{score}/{max}</span>
    </div>
  );
}

export function ChamDiemPage({ user }: { user: LoginUser }) {
  const { theme } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editId, setEditId]         = useState<string | null>(null);
  const [editScores, setEditScores] = useState<Record<string, number>>({});
  const [toast, setToast]           = useState("");

  const submitted = UNITS.filter(u => u.submitted).length;
  const total     = UNITS.length;

  const canEdit = user.role === "hội đồng" || user.role === "quản trị hệ thống";

  const startEdit = (u: UnitScore) => {
    setEditId(u.id);
    const m: Record<string, number> = {};
    u.scores.forEach((s, i) => { m[`c${i+1}`] = s.score; });
    setEditScores(m);
  };

  const saveEdit = () => {
    setEditId(null);
    setToast("Đã lưu điểm chấm thành công ✓");
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="p-8 space-y-6 max-w-[1400px]" style={{ background: "var(--color-paper)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Chấm điểm & Bình xét</h2>
          <p className="text-[13px] text-[#635647] mt-0.5">Năm công tác 2026 · Đợt bình xét 01/2026</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-secondary"><Download className="size-3.5" /> Xuất Excel</button>
          {(user.role === "hội đồng" || user.role === "lãnh đạo cấp cao" || user.role === "quản trị hệ thống") && (
            <button className="btn btn-sm btn-primary">Chốt kết quả bình xét</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon:Users, label:"Đơn vị đã nộp", v:`${submitted}/${total}`, color: theme.primary, bg: theme.tint },
          { icon:TrendingUp, label:"Điểm TB toàn tỉnh", v:"85.2", color:"#166534", bg:"#dcfce7" },
          { icon:Star, label:"Đủ điều kiện khen", v:"5 đơn vị", color:"#b45309", bg:"#fef3c7" },
          { icon:AlertCircle, label:"Chưa nộp báo cáo", v:`${total-submitted} đơn vị`, color:"#9f1239", bg:"#fee2e2" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: s.bg }}>
              <s.icon className="size-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-[18px] font-bold" style={{ fontFamily: "var(--font-sans)", color: s.color }}>{s.v}</div>
              <div className="text-[13px] text-[#635647]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#eef2f8] bg-[#ffffff] flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-[#0b1426]">Bảng chấm điểm thi đua</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-secondary"><Filter className="size-3.5" /> Lọc</button>
            <span className="text-[13px] text-[#635647]">{UNITS.length} đơn vị</span>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#eef2f8] bg-[#ffffff]">
              <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#635647] uppercase tracking-wider w-8">#</th>
              <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#635647] uppercase tracking-wider">Đơn vị</th>
              {CRITERIA.map(c => (
                <th key={c.key} className="px-3 py-3 text-center text-[13px] font-semibold text-[#635647] uppercase tracking-wider hidden lg:table-cell" style={{ maxWidth:80 }}>
                  {c.label.split(" ").slice(0,2).join(" ")}
                  <div className="text-[13px] font-normal">/{c.max}đ</div>
                </th>
              ))}
              <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#635647] uppercase tracking-wider">Tổng</th>
              <th className="px-4 py-3 text-center text-[13px] font-semibold text-[#635647] uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {UNITS.map((u, idx) => (
              <React.Fragment key={u.id}>
                <tr
                  className={`border-b border-[#f4f7fb] transition-colors cursor-pointer hover:bg-[#ffffff]
                    ${expandedId === u.id ? "bg-[var(--color-primary-tint)]" : ""}`}
                  onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      {u.rank ? medalIcon(u.rank) : <span className="text-[13px] text-[#635647]">{idx + 1}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-[#0b1426]">{u.name}</p>
                    <p className="text-[13px] text-[#635647]">{u.type}</p>
                  </td>
                  {u.scores.map((s, si) => (
                    <td key={si} className="px-3 py-3 text-center hidden lg:table-cell">
                      {u.submitted ? (
                        <span className={`text-[13px] font-semibold
                          ${s.score / s.max >= 0.9 ? "text-[#166534]" : s.score / s.max >= 0.7 ? "" : "text-[#b45309]"}`}
                          style={s.score / s.max >= 0.7 && s.score / s.max < 0.9 ? { color: theme.primary } : undefined}>
                          {s.score}
                        </span>
                      ) : <span className="text-[#c9bfa6]">—</span>}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <div className={`text-[14px] font-bold ${u.total >= 90 ? "text-[#166534]" : u.total >= 70 ? "" : u.total > 0 ? "text-[#b45309]" : "text-[#c9bfa6]"}`}
                      style={u.total >= 70 && u.total < 90 ? { color: theme.primary, fontFamily: "var(--font-sans)" } : { fontFamily: "var(--font-sans)" }}>
                      {u.submitted ? u.total : "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.submitted ? (
                      <span className="inline-flex items-center gap-1 text-[13px] text-[#166534] bg-[#dcfce7] px-2 py-0.5 rounded">
                        <CheckCircle2 className="size-3" /> Đã nộp
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[13px] text-[#c8102e] bg-[#fee2e2] px-2 py-0.5 rounded">
                        <AlertCircle className="size-3" /> Chưa nộp
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronDown className={`size-4 text-[#635647] transition-transform ${expandedId === u.id ? "rotate-180" : ""}`} />
                  </td>
                </tr>
                {expandedId === u.id && (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 bg-[#ffffff] border-b border-[#eef2f8]">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[13px] font-semibold text-[#0b1426]">Chi tiết điểm từng tiêu chí</p>
                          {canEdit && (
                            editId === u.id
                              ? <div className="flex gap-2">
                                  <button onClick={e => { e.stopPropagation(); saveEdit(); }} className="btn btn-sm btn-primary">Lưu điểm</button>
                                  <button onClick={e => { e.stopPropagation(); setEditId(null); }} className="btn btn-sm btn-secondary">Huỷ</button>
                                </div>
                              : <button onClick={e => { e.stopPropagation(); startEdit(u); }} className="btn btn-sm btn-secondary">Chỉnh sửa điểm</button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                          {u.scores.map((s, si) => (
                            <div key={si} className="flex items-center gap-3">
                              <span className="text-[13px] text-[#635647] w-44 shrink-0">{s.criteria}</span>
                              {editId === u.id ? (
                                <input type="number" min={0} max={s.max}
                                  value={editScores[`c${si+1}`] ?? s.score}
                                  onChange={e => setEditScores(prev => ({ ...prev, [`c${si+1}`]: +e.target.value }))}
                                  className="w-16 text-center ds-input ds-input-sm"
                                  onClick={e => e.stopPropagation()} />
                              ) : (
                                <ScoreBar score={s.score} max={s.max} />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[13px] text-[#635647]">
                          <CalendarDays className="size-3.5" />
                          Cập nhật lần cuối: {u.lastUpdate}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-xl text-white text-[13px] font-medium flex items-center gap-2"
          style={{ background: theme.primary }}>
          <CheckCircle2 className="size-4" /> {toast}
        </div>
      )}
    </div>
  );
}