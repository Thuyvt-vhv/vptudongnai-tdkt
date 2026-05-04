import { useState } from "react";
import {
  Building2, ChevronRight, ChevronDown, Plus, Edit3, Trash2,
  Check, X, Save, Award, Shield, Clock, Settings2, ToggleLeft,
  ToggleRight, AlertTriangle, CheckCircle2, Info, Users, Lock,
  FileText, Calendar, Loader2, GripVertical, Copy, Wallet, DollarSign,
  Megaphone, Zap, ArrowRight,
} from "lucide-react";
import type { LoginUser } from "./login-page";
import { REWARD_CATALOG, formatTienThuong, getNguonKinhPhiLabel } from "@/app/data/reward-catalog";
import type { NguonKinhPhi, RewardForm } from "@/app/data/reward-catalog";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface OrgUnit { id:string; name:string; code:string; level:"tinh"|"so"|"huyen"|"xa"; headCount:number; children?:OrgUnit[]; parent?:string }
interface AwardType { id:string; name:string; shortName:string; level:"co_so"|"tinh"|"toan_quoc"; type:"individual"|"collective"|"both"; minYears:number; minScore:number; canCu:string; signingRole:string[]; active:boolean; color:string }
interface SLAStage { id:string; name:string; role:string; days:number; businessDays:boolean; alertAt:number }
interface SigningRule { awardId:string; roles:string[]; note:string }

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const MOCK_ORG: OrgUnit = {
  id:"0", name:"Tỉnh ủy Đồng Nai", code:"TU-DNI", level:"tinh", headCount:0,
  children:[
    { id:"1", name:"VP. Tỉnh ủy Đồng Nai", code:"VPT-DNI", level:"so", headCount:320,
      children:[
        { id:"1-1", name:"Phòng Tổng hợp", code:"P-TH", level:"xa", headCount:45, parent:"1" },
        { id:"1-2", name:"Phòng Hành chính", code:"P-HC", level:"xa", headCount:38, parent:"1" },
        { id:"1-3", name:"Phòng Nội chính", code:"P-NC", level:"xa", headCount:52, parent:"1" },
      ],
      parent:"0"
    },
    { id:"2", name:"Ban Tổ chức Tỉnh ủy", code:"BTC-DNI", level:"so", headCount:85,
      children:[
        { id:"2-1", name:"Phòng Cán bộ", code:"P-CB", level:"xa", headCount:28, parent:"2" },
        { id:"2-2", name:"Phòng Đảng viên", code:"P-DV", level:"xa", headCount:25, parent:"2" },
      ],
      parent:"0"
    },
    { id:"3", name:"Ban Tuyên giáo Tỉnh ủy", code:"BTG-DNI", level:"so", headCount:67, parent:"0" },
    { id:"4", name:"Ban Dân vận Tỉnh ủy", code:"BDV-DNI", level:"so", headCount:54, parent:"0" },
    { id:"5", name:"Ban Nội chính Tỉnh ủy", code:"BNC-DNI", level:"so", headCount:48, parent:"0" },
    { id:"6", name:"Ủy ban Kiểm tra Tỉnh ủy", code:"UBKT-DNI", level:"so", headCount:61, parent:"0" },
    { id:"7", name:"TP. Biên Hòa", code:"BH", level:"huyen", headCount:1240,
      children:[
        { id:"7-1", name:"UBND P. Trung Dũng", code:"TD-BH", level:"xa", headCount:62, parent:"7" },
        { id:"7-2", name:"UBND P. Quyết Thắng", code:"QT-BH", level:"xa", headCount:58, parent:"7" },
      ],
      parent:"0"
    },
    { id:"8", name:"Huyện Long Khánh", code:"LK", level:"huyen", headCount:890, parent:"0" },
    { id:"9", name:"Huyện Tân Phú", code:"TP", level:"huyen", headCount:754, parent:"0" },
  ],
};

const MOCK_AWARDS: AwardType[] = [
  { id:"cstd-cs",  name:"Chiến sĩ Thi đua Cơ sở",        shortName:"CSTĐCS",  level:"co_so",    type:"individual", minYears:1, minScore:90, canCu:"Điều 22 NĐ 152/2025/NĐ-CP",   signingRole:["manager","leader"], active:true,  color:"#1C5FBE" },
  { id:"cstd-t",   name:"Chiến sĩ Thi đua cấp Tỉnh",     shortName:"CSTĐT",   level:"tinh",     type:"individual", minYears:2, minScore:90, canCu:"Điều 23 NĐ 152/2025/NĐ-CP",   signingRole:["leader"],          active:true,  color:"#7c3aed" },
  { id:"cstd-tq",  name:"Chiến sĩ Thi đua Toàn quốc",   shortName:"CSTĐTQ",  level:"toan_quoc",type:"individual", minYears:3, minScore:90, canCu:"Điều 24 NĐ 152/2025/NĐ-CP",   signingRole:["leader"],          active:true,  color:"#c8102e" },
  { id:"bk-t",     name:"Bằng khen cấp Tỉnh",             shortName:"BKT",     level:"tinh",     type:"both",       minYears:2, minScore:85, canCu:"Điều 29 NĐ 152/2025/NĐ-CP",   signingRole:["leader"],          active:true,  color:"#8a6400" },
  { id:"bk-cp",    name:"Bằng khen Chính phủ",            shortName:"BKCP",    level:"toan_quoc",type:"both",       minYears:3, minScore:90, canCu:"Điều 28 NĐ 152/2025/NĐ-CP",   signingRole:["leader"],          active:true,  color:"#0b1426" },
  { id:"hc-ld3",   name:"Huân chương Lao động Hạng 3",   shortName:"HCLD3",   level:"toan_quoc",type:"both",       minYears:3, minScore:90, canCu:"Điều 42 NĐ 152/2025/NĐ-CP",   signingRole:["leader"],          active:true,  color:"#92400e" },
  { id:"hc-ld2",   name:"Huân chương Lao động Hạng 2",   shortName:"HCLD2",   level:"toan_quoc",type:"both",       minYears:3, minScore:90, canCu:"Điều 43 NĐ 152/2025/NĐ-CP",   signingRole:["leader"],          active:true,  color:"#92400e" },
  { id:"hc-ld1",   name:"Huân chương Lao động Hạng 1",   shortName:"HCLD1",   level:"toan_quoc",type:"both",       minYears:3, minScore:90, canCu:"Điều 44 NĐ 152/2025/NĐ-CP",   signingRole:["leader"],          active:true,  color:"#8a6400" },
  { id:"gk-cs",    name:"Giấy khen cấp cơ sở",           shortName:"GK",      level:"co_so",    type:"both",       minYears:1, minScore:80, canCu:"Điều 30 NĐ 152/2025/NĐ-CP",   signingRole:["manager"],         active:true,  color:"#166534" },
  { id:"tdlx",     name:"Tập thể Lao động Xuất sắc",     shortName:"TTLĐXS",  level:"co_so",    type:"collective", minYears:1, minScore:85, canCu:"Điều 27 NĐ 152/2025/NĐ-CP",   signingRole:["manager","leader"],active:true,  color:"#0891b2" },
  { id:"ah-ld",    name:"Anh hùng Lao động",              shortName:"AHLĐ",    level:"toan_quoc",type:"individual", minYears:5, minScore:95, canCu:"Điều 38 NĐ 152/2025/NĐ-CP",   signingRole:["leader"],          active:false, color:"#c8102e" },
];

const SLA_STAGES: SLAStage[] = [
  { id:"s1", name:"Đơn vị đề nghị → Hội đồng tiếp nhận",  role:"Manager",  days:7,  businessDays:true,  alertAt:2 },
  { id:"s2", name:"Hội đồng thẩm định hồ sơ",              role:"Council",  days:15, businessDays:true,  alertAt:3 },
  { id:"s3", name:"Lấy ý kiến công khai (tối thiểu)",      role:"Council",  days:5,  businessDays:true,  alertAt:1 },
  { id:"s4", name:"Bỏ phiếu tại Hội đồng",                 role:"Council",  days:3,  businessDays:true,  alertAt:1 },
  { id:"s5", name:"Trình ký Lãnh đạo",                     role:"Council",  days:3,  businessDays:true,  alertAt:1 },
  { id:"s6", name:"Lãnh đạo ký số",                        role:"Leader",   days:2,  businessDays:true,  alertAt:1 },
  { id:"s7", name:"Ban hành & Phát hành QĐ",               role:"Admin",    days:2,  businessDays:false, alertAt:1 },
];

/* ═══════════════════════════════════════════════════════════════
   ORG TREE COMPONENT
═══════════════════════════════════════════════════════════════ */
const LEVEL_CFG = {
  tinh:    { color:"#0b1426", bg:"#e8ecf3", label:"Tỉnh/TW" },
  so:      { color:"#1C5FBE", bg:"#ddeafc", label:"Sở/Ban" },
  huyen:   { color:"#7c3aed", bg:"#f5f3ff", label:"Huyện/TP" },
  xa:      { color:"#166534", bg:"#dcfce7", label:"Xã/Phường" },
};

function OrgNode({ unit, depth=0, onSelect, selected }: { unit:OrgUnit; depth?:number; onSelect:(u:OrgUnit)=>void; selected:string|null }) {
  const [open,setOpen]=useState(depth<2);
  const hasChildren=unit.children&&unit.children.length>0;
  const cfg=LEVEL_CFG[unit.level];
  const isSel=selected===unit.id;
  return (
    <div>
      <div className="flex items-center gap-1.5 group" style={{ paddingLeft:`${depth*20}px` }}>
        <button className="size-5 flex items-center justify-center rounded shrink-0" onClick={()=>setOpen(!open)} style={{ visibility:hasChildren?"visible":"hidden" }}>
          {open?<ChevronDown className="size-3.5 text-[#635647]"/>:<ChevronRight className="size-3.5 text-[#635647]"/>}
        </button>
        <button onClick={()=>onSelect(unit)} className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-left transition-colors"
          style={{ background:isSel?cfg.bg:"transparent",border:isSel?`1.5px solid ${cfg.color}40`:"1.5px solid transparent" }}>
          <div className="size-5 rounded flex items-center justify-center shrink-0" style={{ background:cfg.bg }}>
            <Building2 className="size-3" style={{ color:cfg.color }}/>
          </div>
          <span className="text-[13px] text-[#0b1426] flex-1 truncate" style={{ fontFamily: "var(--font-sans)",fontWeight:isSel?700:400 }}>{unit.name}</span>
          <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:cfg.bg,color:cfg.color,fontFamily: "var(--font-sans)" }}>{unit.code}</span>
          {unit.headCount>0&&<span className="text-[13px] text-[#635647]">{unit.headCount}</span>}
        </button>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="size-6 rounded flex items-center justify-center hover:bg-[#ddeafc]"><Plus className="size-3 text-[#1C5FBE]"/></button>
          <button className="size-6 rounded flex items-center justify-center hover:bg-[#fef3c7]"><Edit3 className="size-3 text-[#92400e]"/></button>
          {depth>0&&<button className="size-6 rounded flex items-center justify-center hover:bg-[#fee2e2]"><Trash2 className="size-3 text-[#c8102e]"/></button>}
        </div>
      </div>
      {open&&hasChildren&&(
        <div>{unit.children!.map(c=><OrgNode key={c.id} unit={c} depth={depth+1} onSelect={onSelect} selected={selected}/>)}</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════════════ */
type Tab = "org"|"awards"|"signing"|"sla"|"kinh_phi"|"general"|"phong_trao";

function OrgTab() {
  const [selected,setSelected]=useState<string|null>("1");
  const [adding,setAdding]=useState(false);
  const [newName,setNewName]=useState("");
  const total=(function count(u:OrgUnit):number{ return 1+(u.children?.reduce((s,c)=>s+count(c),0)||0); })(MOCK_ORG);
  return (
    <div className="grid grid-cols-5 gap-4 h-full">
      {/* Tree panel */}
      <div className="col-span-3 rounded-[10px] border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
          <Building2 className="size-4 text-[#1C5FBE]"/>
          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Cây tổ chức · {total} đơn vị</span>
          <div className="ml-auto flex gap-2">
            <button onClick={()=>setAdding(!adding)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] text-white" style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>
              <Plus className="size-3.5"/>Thêm đơn vị
            </button>
          </div>
        </div>
        {adding&&(
          <div className="px-4 py-2.5 border-b border-[#e2e8f0] flex flex-col gap-1.5" style={{ background:"#ddeafc20" }}>
            <div className="flex gap-2">
              <div className="flex-1">
                <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Tên đơn vị mới..."
                  className="w-full px-3 border rounded-[6px] text-[13px] outline-none" style={{ height:32,fontFamily: "var(--font-sans)",borderColor:newName.trim().length>0&&newName.trim().length<2?"#f87171":"#93c5fd" }}/>
              </div>
              <button
                onClick={()=>{ if(newName.trim().length>=2) setAdding(false); }}
                disabled={newName.trim().length<2}
                className="size-8 rounded-[6px] flex items-center justify-center border transition-opacity"
                style={{ background:newName.trim().length>=2?"#dcfce7":"#f3f4f6",borderColor:newName.trim().length>=2?"#86efac":"#d1d5db",opacity:newName.trim().length>=2?1:0.5,cursor:newName.trim().length>=2?"pointer":"not-allowed" }}>
                <Check className="size-4" style={{ color:newName.trim().length>=2?"#166534":"#4f5d6e" }}/>
              </button>
              <button onClick={()=>{ setAdding(false); setNewName(""); }} className="size-8 rounded-[6px] flex items-center justify-center border border-[#fca5a5]" style={{ background:"#fee2e2" }}><X className="size-4 text-[#c8102e]"/></button>
            </div>
            {newName.trim().length>0&&newName.trim().length<2&&(
              <p className="text-[13px] text-[#c8102e] px-1" style={{ fontFamily: "var(--font-sans)" }}>Tên đơn vị phải có ít nhất 2 ký tự</p>
            )}
          </div>
        )}
        <div className="p-3 overflow-y-auto flex-1">
          <OrgNode unit={MOCK_ORG} onSelect={u=>setSelected(u.id)} selected={selected}/>
        </div>
        <div className="flex px-4 py-2 border-t border-[#e2e8f0] gap-3" style={{ background:"#f4f7fb" }}>
          {Object.entries(LEVEL_CFG).map(([k,v])=>(
            <span key={k} className="flex items-center gap-1 text-[13px]" style={{ color:v.color,fontFamily: "var(--font-sans)" }}>
              <span className="size-2 rounded-full" style={{ background:v.color }}/>
              {v.label}
            </span>
          ))}
        </div>
      </div>
      {/* Detail panel */}
      <div className="col-span-2 rounded-[10px] border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Chi tiết Đơn vị</span>
        </div>
        {selected ? (
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {[["Tên đơn vị","Văn phòng Tỉnh ủy Đồng Nai"],["Mã đơn vị","VPT-DNI"],["Cấp đơn vị","Sở/Ban"],["Đơn vị cha","Tỉnh ủy Đồng Nai"],["Số CBCC","320 người"],["Trạng thái","Hoạt động"],["Ngày thành lập","01/01/1975"],["Địa chỉ","Số 2 Nguyễn Văn Trị, TP. Biên Hòa"]].map(([k,v])=>(
              <div key={k} className="flex gap-2">
                <span className="text-[13px] text-[#635647] w-[100px] shrink-0" style={{ fontFamily: "var(--font-sans)" }}>{k}</span>
                <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:k==="Mã đơn vị"?700:400 }}>{v}</span>
              </div>
            ))}
            <div className="pt-3 flex gap-2 border-t border-[#e2e8f0]">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-[13px] border border-[#d1d5db] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
                <Edit3 className="size-3.5"/>Sửa thông tin
              </button>
              <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-[13px] border border-[#93c5fd] text-[#1C5FBE]" style={{ fontFamily: "var(--font-sans)" }}>
                <Copy className="size-3.5"/>Sao chép
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#635647] text-[13px]">Chọn đơn vị để xem chi tiết</div>
        )}
      </div>
    </div>
  );
}

function AwardsTab() {
  const [sel,setSel]=useState<AwardType|null>(null);
  const [editField,setEditField]=useState<string|null>(null);
  const LEVEL_LABEL:Record<string,{l:string;c:string;bg:string}> = {
    co_so:    {l:"Cơ sở",     c:"#166534",bg:"#dcfce7"},
    tinh:     {l:"Cấp Tỉnh",  c:"#1C5FBE",bg:"#ddeafc"},
    toan_quoc:{l:"Toàn quốc", c:"#c8102e",bg:"#fee2e2"},
  };
  return (
    <div className="grid grid-cols-5 gap-4 h-full">
      <div className="col-span-3 rounded-[10px] border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-3 border-b border-[#e2e8f0] gap-2" style={{ background:"#f4f7fb" }}>
          <Award className="size-4 text-[#8a6400]"/>
          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Danh hiệu Thi đua ({MOCK_AWARDS.length})</span>
          <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] text-white" style={{ background:"#8a6400",fontFamily: "var(--font-sans)",fontWeight:600 }}>
            <Plus className="size-3.5"/>Thêm danh hiệu
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <thead><tr style={{ background:"#f4f7fb" }}>
              {["Danh hiệu","Cấp","Loại","Năm TD min","Điểm min","Căn cứ","Trạng thái"].map(h=><th key={h} className="text-left px-3 py-2 text-[#0b1426]" style={{ fontWeight:700 }}>{h}</th>)}
            </tr></thead>
            <tbody>{MOCK_AWARDS.map((a,i)=>{
              const lc=LEVEL_LABEL[a.level]; const isSel=sel?.id===a.id;
              return (
                <tr key={a.id} onClick={()=>setSel(a)} className="border-t border-[#e2e8f0] cursor-pointer transition-colors row-clickable"
                  style={{ background:isSel?"#ffffff":i%2===0?"white":"#f4f7fb" }}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background:a.color }}/>
                      <span style={{ fontWeight:isSel?700:400,color:"#0b1426" }}>{a.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2"><span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:lc.bg,color:lc.c }}>{lc.l}</span></td>
                  <td className="px-3 py-2 text-[#5a5040]">{a.type==="individual"?"Cá nhân":a.type==="collective"?"Tập thể":"Cả hai"}</td>
                  <td className="px-3 py-2 text-center"><span className="text-[13px] px-2 py-0.5 rounded" style={{ background:"#f4f7fb",color:"#5a5040",fontFamily:"JetBrains Mono, monospace" }}>{a.minYears} năm</span></td>
                  <td className="px-3 py-2 text-center"><span className="text-[13px] px-2 py-0.5 rounded" style={{ background:"#f4f7fb",color:"#5a5040",fontFamily:"JetBrains Mono, monospace" }}>{a.minScore}</span></td>
                  <td className="px-3 py-2 text-[13px] text-[#635647]">{a.canCu}</td>
                  <td className="px-3 py-2">
                    {a.active
                      ? <span className="flex items-center gap-1 text-[13px] text-[#166534]"><CheckCircle2 className="size-3"/>Hoạt động</span>
                      : <span className="flex items-center gap-1 text-[13px] text-[#635647]"><X className="size-3"/>Tạm dừng</span>
                    }
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>
      <div className="col-span-2 rounded-[10px] border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Cấu hình Điều kiện</span>
        </div>
        {sel ? (
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full shrink-0" style={{ background:sel.color }}/>
              <span className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{sel.name}</span>
              <code className="text-[13px] px-1.5 py-0.5 rounded" style={{ background:sel.color+"20",color:sel.color,fontFamily:"JetBrains Mono, monospace" }}>{sel.shortName}</code>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:"Năm thi đua tối thiểu", value:`${sel.minYears} năm liên tục`, key:"minYears" },
                { label:"Điểm xếp loại tối thiểu", value:`${sel.minScore}/100`, key:"minScore" },
                { label:"Đối tượng áp dụng", value:sel.type==="individual"?"Cá nhân":sel.type==="collective"?"Tập thể":"Cá nhân & Tập thể", key:"type" },
                { label:"Căn cứ pháp lý", value:sel.canCu, key:"canCu" },
              ].map(f=>(
                <div key={f.key} className="p-3 rounded-[8px] border border-[#e2e8f0] relative group" style={{ background:"#f4f7fb" }}>
                  <div className="text-[13px] uppercase tracking-wider text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{f.label}</div>
                  <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>{f.value}</div>
                  <button onClick={()=>setEditField(f.key)} className="absolute top-1.5 right-1.5 size-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background:"#fef3c7" }}>
                    <Edit3 className="size-3 text-[#92400e]"/>
                  </button>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[13px] uppercase tracking-wider text-[#635647] mb-2" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Điều kiện bổ sung (NĐ 152/2025/NĐ-CP)</div>
              {[
                "Không bị kỷ luật hoặc vi phạm pháp luật trong kỳ xét",
                "Hoàn thành xuất sắc nhiệm vụ được giao",
                "Đơn vị trực tiếp quản lý đề nghị bằng văn bản",
                "Có minh chứng thành tích cụ thể, có số liệu kiểm chứng",
                sel.minYears>=3?"Đã được tặng danh hiệu bậc thấp hơn":null,
              ].filter(Boolean).map((c,i)=>(
                <div key={i} className="flex items-start gap-2 text-[13px] text-[#5a5040] mb-1.5">
                  <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" style={{ color:"#166534" }}/>
                  <span>{c}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#e2e8f0]">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-[13px] text-white" style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>
                <Save className="size-3.5"/>Lưu thay đổi
              </button>
              <button onClick={()=>setSel(null)} className="px-3 py-2 rounded-[6px] text-[13px] border border-[#e2e8f0] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
                Hủy
              </button>
            </div>
          </div>
        ) : <div className="flex-1 flex items-center justify-center text-[#635647] text-[13px]">Chọn danh hiệu để cấu hình</div>}
      </div>
    </div>
  );
}

function SigningTab() {
  const ROLES = [
    { id:"manager", label:"Manager",  color:"#166534", desc:"Lãnh đạo đơn vị cơ sở" },
    { id:"leader",  label:"Leader",   color:"#92400e", desc:"Lãnh đạo cấp cao (Tỉnh ủy)" },
    { id:"admin",   label:"Admin",    color:"#0b1426", desc:"Quản trị hệ thống" },
  ];
  const [matrix,setMatrix]=useState<Record<string,string[]>>(() => {
    const m:Record<string,string[]>={};
    MOCK_AWARDS.forEach(a=>{ m[a.id]=[...a.signingRole]; });
    return m;
  });
  const toggle=(awardId:string,role:string)=>{
    setMatrix(prev=>({...prev,[awardId]:prev[awardId].includes(role)?prev[awardId].filter(r=>r!==role):[...prev[awardId],role]}));
  };
  return (
    <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
        <Lock className="size-4 text-[#92400e]"/>
        <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Thẩm quyền Ký số — theo QĐ 34/2021 + NĐ 152/2025/NĐ-CP</span>
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] text-white" style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600 }}>
            <Save className="size-3.5"/>Lưu cấu hình
          </button>
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
          <thead><tr style={{ background:"linear-gradient(to right,#0b1426,#1a2744)" }}>
            <th className="text-left px-4 py-3 text-white sticky left-0 z-10" style={{ fontWeight:700,background:"#0b1426",minWidth:260 }}>Danh hiệu</th>
            <th className="text-center px-3 py-3 text-white" style={{ fontWeight:700 }}>Căn cứ</th>
            {ROLES.map(r=>(
              <th key={r.id} className="text-center px-4 py-3 min-w-[120px]">
                <div className="text-[13px] text-white" style={{ fontWeight:700 }}>{r.label}</div>
                <div className="text-[13px] text-white/60">{r.desc}</div>
              </th>
            ))}
          </tr></thead>
          <tbody>{MOCK_AWARDS.map((a,i)=>(
            <tr key={a.id} className="border-t border-[#e2e8f0]" style={{ background:i%2===0?"white":"#f4f7fb" }}>
              <td className="px-4 py-3 sticky left-0" style={{ background:i%2===0?"white":"#f4f7fb" }}>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full shrink-0" style={{ background:a.color }}/>
                  <div>
                    <div className="text-[13px] text-[#0b1426]" style={{ fontWeight:600 }}>{a.name}</div>
                    <div className="text-[13px] text-[#635647]">{a.canCu}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-center">
                <code className="text-[13px] text-[#7c3aed]" style={{ fontFamily:"JetBrains Mono, monospace" }}>{a.canCu.split(" ").slice(-1)}</code>
              </td>
              {ROLES.map(r=>{
                const has=matrix[a.id]?.includes(r.id);
                return (
                  <td key={r.id} className="text-center px-4 py-3">
                    <button onClick={()=>toggle(a.id,r.id)} className="mx-auto flex items-center justify-center size-7 rounded-[6px] border-2 transition-all" style={{ background:has?r.color:"white",borderColor:has?r.color:"#d1d5db" }}>
                      {has&&<Check className="size-4 text-white"/>}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-[#e2e8f0] flex items-center gap-3" style={{ background:"#f4f7fb" }}>
        <Info className="size-4 text-[#1C5FBE]"/>
        <span className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>Căn cứ: QĐ 34/2021/QĐ-TTg và NĐ 152/2025/NĐ-CP/NĐ-CP. Thẩm quyền ký phải được Lãnh đạo Tỉnh ủy phê duyệt.</span>
      </div>
    </div>
  );
}

function SLATab() {
  const [stages,setStages]=useState(SLA_STAGES);
  const [editing,setEditing]=useState<string|null>(null);
  const [tempDays,setTempDays]=useState(0);
  const total=stages.reduce((s,st)=>s+st.days,0);
  const tempDaysValid = tempDays >= 1 && tempDays <= 90;
  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
          <Clock className="size-4 text-[#b45309]"/>
          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Cấu hình SLA theo TT 15/2025/TT-BNV</span>
          <span className="ml-auto text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>Tổng: <strong>{total}</strong> ngày làm việc</span>
        </div>
        <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
          <thead><tr style={{ background:"#f4f7fb" }}>
            {["#","Giai đoạn","Vai trò","Thời gian (ngày LV)","Cảnh báo trước","Loại ngày"].map(h=><th key={h} className="text-left px-3 py-2 text-[#0b1426]" style={{ fontWeight:700 }}>{h}</th>)}
          </tr></thead>
          <tbody>{stages.map((s,i)=>(
            <tr key={s.id} className="border-t border-[#e2e8f0]" style={{ background:i%2===0?"white":"#f4f7fb" }}>
              <td className="px-3 py-3 text-[#635647]" style={{ fontFamily:"JetBrains Mono, monospace" }}>{i+1}</td>
              <td className="px-3 py-3 text-[#0b1426]">{s.name}</td>
              <td className="px-3 py-3"><span className="text-[13px] px-2 py-0.5 rounded" style={{ background:"#f5f3ff",color:"#7c3aed",fontFamily: "var(--font-sans)" }}>{s.role}</span></td>
              <td className="px-3 py-3">
                {editing===s.id ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <input type="number" min={1} max={90} value={tempDays} onChange={e=>setTempDays(Number(e.target.value))}
                        className="w-16 px-2 border rounded text-center outline-none" style={{ height:28,fontFamily:"JetBrains Mono, monospace",borderColor:tempDaysValid?"#93c5fd":"#f87171" }}/>
                      <button
                        onClick={()=>{ if(tempDaysValid){ setStages(prev=>prev.map(st=>st.id===s.id?{...st,days:tempDays}:st)); setEditing(null); }}}
                        disabled={!tempDaysValid}
                        className="size-6 rounded flex items-center justify-center transition-opacity"
                        style={{ background:tempDaysValid?"#dcfce7":"#f3f4f6",opacity:tempDaysValid?1:0.5,cursor:tempDaysValid?"pointer":"not-allowed" }}>
                        <Check className="size-3" style={{ color:tempDaysValid?"#166534":"#4f5d6e" }}/>
                      </button>
                      <button onClick={()=>setEditing(null)} className="size-6 rounded flex items-center justify-center" style={{ background:"#fee2e2" }}><X className="size-3 text-[#c8102e]"/></button>
                    </div>
                    {!tempDaysValid&&<p className="text-[13px] text-[#c8102e]" style={{fontFamily: "var(--font-sans)"}}>Từ 1–90 ngày</p>}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]" style={{ fontFamily:"JetBrains Mono, monospace",fontWeight:700,color:s.days<=3?"#c8102e":s.days<=7?"#b45309":"#166534" }}>{s.days}</span>
                    <span className="text-[13px] text-[#635647]">ngày</span>
                    <button onClick={()=>{ setEditing(s.id); setTempDays(s.days); }} className="size-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity" style={{ background:"#fef3c7" }}>
                      <Edit3 className="size-3 text-[#92400e]"/>
                    </button>
                  </div>
                )}
              </td>
              <td className="px-3 py-3"><span className="text-[13px]" style={{ fontFamily:"JetBrains Mono, monospace",color:"#b45309" }}>⚠ {s.alertAt}n</span></td>
              <td className="px-3 py-3"><span className="text-[13px] px-2 py-0.5 rounded" style={{ background:s.businessDays?"#dcfce7":"#f4f7fb",color:s.businessDays?"#166534":"#5a5040" }}>{s.businessDays?"Ngày làm việc":"Ngày lịch"}</span></td>
            </tr>
          ))}</tbody>
        </table>
        <div className="px-4 py-2.5 border-t border-[#e2e8f0] flex items-center gap-2" style={{ background:"#f4f7fb" }}>
          <AlertTriangle className="size-4 text-[#b45309]"/>
          <span className="text-[13px] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>Giai đoạn LYK công khai phải tối thiểu 5 ngày làm việc theo Điều 15 TT 15/2025/TT-BNV</span>
        </div>
      </div>
      {/* Kỳ xét config */}
      <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
          <Calendar className="size-4 text-[#1C5FBE]"/>
          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Kỳ xét tặng năm 2026</span>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {[
            { label:"Kỳ xét chính", open:"01/09/2026", close:"30/09/2026", status:"Sắp mở" },
            { label:"Kỳ xét bổ sung", open:"01/12/2026", close:"20/12/2026", status:"Chưa mở" },
            { label:"Kỳ xét đột xuất", open:"Linh hoạt", close:"Linh hoạt", status:"Theo QĐ" },
          ].map(k=>(
            <div key={k.label} className="p-3 rounded-[8px] border border-[#e2e8f0]" style={{ background:"white" }}>
              <div className="text-[13px] text-[#0b1426] mb-2" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>{k.label}</div>
              <div className="text-[13px] text-[#5a5040] space-y-1">
                <div>Mở hồ sơ: <strong>{k.open}</strong></div>
                <div>Đóng hồ sơ: <strong>{k.close}</strong></div>
              </div>
              <div className="mt-2 text-[13px] px-2 py-0.5 rounded w-fit" style={{ background:"#ddeafc",color:"#1C5FBE",fontFamily: "var(--font-sans)" }}>{k.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── nguon labels & colors ─────────────────────────────────── */
const NGUON_CFG: Record<NguonKinhPhi, { label: string; color: string; bg: string }> = {
  ngan_sach_nn:  { label: "NSNN",            color: "#1C5FBE", bg: "#ddeafc" },
  quy_thi_dua:   { label: "Quỹ Thi đua",     color: "#166534", bg: "#dcfce7" },
  don_vi_tu_chi: { label: "Đơn vị tự chi",   color: "#92400e", bg: "#fef3c7" },
};
const LEVEL_CFG2: Record<string, { label: string; color: string; bg: string }> = {
  nha_nuoc:   { label: "Nhà nước",   color: "#c8102e", bg: "#fee2e2" },
  chinh_phu:  { label: "Chính phủ",  color: "#0b1426", bg: "#e8ecf3" },
  bo_nganh:   { label: "Bộ/Ngành",   color: "#7c3aed", bg: "#f5f3ff" },
  tinh:       { label: "Cấp Tỉnh",   color: "#1C5FBE", bg: "#ddeafc" },
  so_huyen:   { label: "Sở/Huyện",   color: "#b45309", bg: "#fef3c7" },
  co_so:      { label: "Cơ sở",      color: "#166534", bg: "#dcfce7" },
};

function KinhPhiTab() {
  /* local overrides — in real app this would be persisted */
  const [overrides, setOverrides] = useState<Record<string, { tienThuong: number; nguonKinhPhi: NguonKinhPhi }>>({});
  const [sel, setSel] = useState<RewardForm | null>(null);
  const [editTien, setEditTien] = useState("");
  const [editNguon, setEditNguon] = useState<NguonKinhPhi>("quy_thi_dua");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const getEffective = (r: RewardForm) => ({
    tienThuong:   overrides[r.id]?.tienThuong   ?? r.tienThuong,
    nguonKinhPhi: overrides[r.id]?.nguonKinhPhi ?? r.nguonKinhPhi,
  });

  const openEdit = (r: RewardForm) => {
    setSel(r);
    const eff = getEffective(r);
    setEditTien(String(eff.tienThuong));
    setEditNguon(eff.nguonKinhPhi);
    setSaved(p => ({ ...p, [r.id]: false }));
  };

  const tienVal = parseInt(editTien.replace(/\D/g, ""), 10) || 0;
  const tienError = sel && tienVal <= 0 ? "Vui lòng nhập mức tiền thưởng hợp lệ (> 0)" : null;

  const saveEdit = () => {
    if (!sel || tienVal <= 0) return;
    setOverrides(p => ({ ...p, [sel.id]: { tienThuong: tienVal, nguonKinhPhi: editNguon } }));
    setSaved(p => ({ ...p, [sel.id]: true }));
  };

  /* summary totals by nguon */
  const totals = REWARD_CATALOG.reduce<Record<NguonKinhPhi, number>>(
    (acc, r) => {
      const eff = getEffective(r);
      if (eff.tienThuong > 0) acc[eff.nguonKinhPhi] = (acc[eff.nguonKinhPhi] || 0) + eff.tienThuong;
      return acc;
    },
    {} as Record<NguonKinhPhi, number>
  );

  return (
    <div className="grid grid-cols-5 gap-4 h-full">
      {/* ── Left: catalog table ─────────────────────────────────── */}
      <div className="col-span-3 rounded-[10px] border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0]" style={{ background: "#f4f7fb" }}>
          <Wallet className="size-4 text-[#1C5FBE]" />
          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            Mức tiền thưởng — TT 28/2025/TT-BTC &amp; NĐ 152/2025/NĐ-CP
          </span>
          <span className="ml-auto text-[13px] text-[#635647]" style={{ fontFamily: "var(--font-sans)" }}>
            {REWARD_CATALOG.length} hình thức
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
            <thead>
              <tr style={{ background: "#f4f7fb" }}>
                {["Hình thức khen thưởng", "Cấp", "Tiền thưởng", "Nguồn KP", "Căn cứ tiền"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[#0b1426]" style={{ fontWeight: 700 }}>{h}</th>
                ))}
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {REWARD_CATALOG.map((r, i) => {
                const eff = getEffective(r);
                const lc  = LEVEL_CFG2[r.level];
                const nc  = NGUON_CFG[eff.nguonKinhPhi];
                const isSel = sel?.id === r.id;
                const isChanged = !!overrides[r.id];
                return (
                  <tr
                    key={r.id}
                    onClick={() => openEdit(r)}
                    className="border-t border-[#e2e8f0] cursor-pointer transition-colors row-clickable"
                    style={{ background: isSel ? "#ffffff" : i % 2 === 0 ? "white" : "#f4f7fb" }}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {isChanged && <span className="size-1.5 rounded-full bg-[#b45309] shrink-0" title="Đã thay đổi" />}
                        <span className="text-[13px] text-[#0b1426]" style={{ fontWeight: isSel ? 700 : 400 }}>{r.ten}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background: lc.bg, color: lc.color }}>{lc.label}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {eff.tienThuong > 0
                        ? <span className="text-[13px] font-mono" style={{ color: "#1C5FBE", fontWeight: 700 }}>
                            {formatTienThuong(eff.tienThuong)}
                          </span>
                        : <span className="text-[13px] text-[#6b5e47]">Không có</span>
                      }
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[13px] px-1.5 py-0.5 rounded" style={{ background: nc.bg, color: nc.color }}>{nc.label}</span>
                    </td>
                    <td className="px-3 py-2.5 text-[13px] text-[#635647] max-w-[150px] truncate">{r.canCuTien}</td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={e => { e.stopPropagation(); openEdit(r); }}
                        className="size-6 flex items-center justify-center rounded hover:bg-[#fef3c7] transition-colors"
                      >
                        <Edit3 className="size-3 text-[#92400e]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Footer — nguon totals */}
        <div className="px-4 py-3 border-t border-[#e2e8f0] flex items-center gap-4" style={{ background: "#f4f7fb" }}>
          {(Object.entries(totals) as [NguonKinhPhi, number][]).map(([nguon, amt]) => {
            const nc = NGUON_CFG[nguon];
            return (
              <div key={nguon} className="flex items-center gap-1.5 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
                <span className="size-2 rounded-full" style={{ background: nc.color }} />
                <span style={{ color: "#635647" }}>{nc.label}:</span>
                <span style={{ color: nc.color, fontWeight: 700 }}>{formatTienThuong(amt)}</span>
              </div>
            );
          })}
          <span className="ml-auto text-[13px] text-[#6b5e47]">* Hiển thị tổng tiền thưởng/người theo từng nguồn</span>
        </div>
      </div>

      {/* ── Right: edit panel ────────────────────────────────────── */}
      <div className="col-span-2 rounded-[10px] border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[#e2e8f0]" style={{ background: "#f4f7fb" }}>
          <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
            Cấu hình Kinh phí
          </span>
        </div>
        {sel ? (
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {/* title */}
            <div>
              <p className="text-[14px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                {sel.ten}
              </p>
              <p className="text-[13px] text-[#635647] mt-0.5">{sel.canCuThuong}</p>
            </div>

            {/* tiền thưởng */}
            <div>
              <label className="block text-[13px] uppercase tracking-wider text-[#635647] mb-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                Mức tiền thưởng (VNĐ/người)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTien}
                  onChange={e => setEditTien(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 px-3 border rounded-[6px] text-[13px] outline-none focus:border-[#1C5FBE]"
                  style={{ height: 36, fontFamily: "JetBrains Mono, monospace", color: "#1C5FBE", borderColor: tienError ? "#f87171" : "#93c5fd" }}
                  placeholder="0"
                />
                <span className="text-[13px] text-[#635647] shrink-0">đồng</span>
              </div>
              {tienError && <p className="text-[13px] text-[#c8102e] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{tienError}</p>}
              {!tienError && tienVal > 0 && (
                <p className="text-[13px] text-[#166534] mt-1">
                  ≈ {formatTienThuong(tienVal)}
                </p>
              )}
            </div>

            {/* nguon kinh phi */}
            <div>
              <label className="block text-[13px] uppercase tracking-wider text-[#635647] mb-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
                Nguồn kinh phí
              </label>
              <div className="space-y-2">
                {(Object.entries(NGUON_CFG) as [NguonKinhPhi, typeof NGUON_CFG[NguonKinhPhi]][]).map(([k, v]) => (
                  <label key={k} className="flex items-center gap-3 p-2.5 rounded-[8px] cursor-pointer border transition-all" style={{
                    background: editNguon === k ? v.bg : "white",
                    borderColor: editNguon === k ? v.color + "40" : "#e2e8f0",
                  }}>
                    <input
                      type="radio"
                      name="nguon"
                      value={k}
                      checked={editNguon === k}
                      onChange={() => setEditNguon(k)}
                      className="accent-[#1C5FBE]"
                    />
                    <div>
                      <span className="text-[13px]" style={{ color: v.color, fontFamily: "var(--font-sans)", fontWeight: 600 }}>{v.label}</span>
                      <p className="text-[13px] text-[#635647]">
                        {k === "ngan_sach_nn"   && "Từ Ngân sách Nhà nước — TT 28/2025/TT-BTC"}
                        {k === "quy_thi_dua"    && "Từ Quỹ Thi đua Khen thưởng đơn vị"}
                        {k === "don_vi_tu_chi"  && "Đơn vị tự chi từ kinh phí hoạt động"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* can cu */}
            <div className="p-3 rounded-[8px] border border-[#e2e8f0]" style={{ background: "#f4f7fb" }}>
              <div className="text-[13px] uppercase tracking-wider text-[#635647] mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Căn cứ tiền thưởng</div>
              <p className="text-[13px] text-[#5a5040]">{sel.canCuTien}</p>
            </div>

            {/* default value notice */}
            {overrides[sel.id] && (
              <div className="flex items-start gap-2 p-3 rounded-[8px] border border-[#fde68a]" style={{ background: "#fffbeb" }}>
                <AlertTriangle className="size-3.5 text-[#b45309] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] text-[#92400e]" style={{ fontWeight: 600 }}>Đã thay đổi so với mặc định</p>
                  <p className="text-[13px] text-[#635647]">Mặc định: {formatTienThuong(sel.tienThuong)} · {NGUON_CFG[sel.nguonKinhPhi].label}</p>
                </div>
              </div>
            )}

            {/* actions */}
            <div className="flex gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                onClick={saveEdit}
                disabled={!!tienError}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-[13px] text-white transition-opacity"
                style={{ background: "#1C5FBE", fontFamily: "var(--font-sans)", fontWeight: 600, opacity: tienError ? 0.5 : 1, cursor: tienError ? "not-allowed" : "pointer" }}
              >
                {saved[sel.id] ? <><CheckCircle2 className="size-3.5" />Đã lưu</> : <><Save className="size-3.5" />Lưu thay đổi</>}
              </button>
              {overrides[sel.id] && (
                <button
                  onClick={() => {
                    setOverrides(p => { const n = { ...p }; delete n[sel.id]; return n; });
                    setEditTien(String(sel.tienThuong));
                    setEditNguon(sel.nguonKinhPhi);
                    setSaved(p => ({ ...p, [sel.id]: false }));
                  }}
                  className="px-3 py-2 rounded-[6px] text-[13px] border border-[#fca5a5] text-[#c8102e]"
                  style={{ fontFamily: "var(--font-sans)" }}
                  title="Đặt lại về giá trị mặc định theo TT 28/2025"
                >
                  Đặt lại
                </button>
              )}
              <button onClick={() => setSel(null)} className="px-3 py-2 rounded-[6px] text-[13px] border border-[#e2e8f0] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <div className="size-12 rounded-full flex items-center justify-center" style={{ background: "#ddeafc" }}>
              <DollarSign className="size-6 text-[#1C5FBE]" />
            </div>
            <p className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>Chọn hình thức khen để cấu hình</p>
            <p className="text-[13px] text-[#635647]">Mức tiền thưởng và nguồn kinh phí theo TT 28/2025/TT-BTC</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GeneralTab() {
  const [settings,setSettings]=useState({
    aiEnabled:true, duplicateCheck:true, publicLYK:true,
    enforce2FA:false, auditRetention:"5", backupFreq:"daily",
    maxFileSize:"10", sessionTimeout:"60", brandName:"VPTU Đồng Nai",
    brandColor:"#1C5FBE",
  });
  const toggle=(k:string)=>setSettings(p=>({...p,[k]:!p[k as keyof typeof p]}));
  const fieldErrors: Record<string, string | null> = {
    brandName:      settings.brandName.trim().length < 2 ? "Tên hệ thống phải có ít nhất 2 ký tự" : null,
    maxFileSize:    (!settings.maxFileSize || Number(settings.maxFileSize) < 1 || Number(settings.maxFileSize) > 100) ? "Từ 1–100 MB" : null,
    sessionTimeout: (!settings.sessionTimeout || Number(settings.sessionTimeout) < 5 || Number(settings.sessionTimeout) > 480) ? "Từ 5–480 phút" : null,
    auditRetention: (!settings.auditRetention || Number(settings.auditRetention) < 1 || Number(settings.auditRetention) > 50) ? "Từ 1–50 năm" : null,
    backupFreq:     settings.backupFreq.trim().length === 0 ? "Tần suất không được để trống" : null,
  };
  const canSave = Object.values(fieldErrors).every(e => e === null);
  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        {/* Feature toggles */}
        <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Tính năng Hệ thống</span>
          </div>
          <div className="p-4 space-y-3">
            {[
              { key:"aiEnabled",      label:"AI Gợi ý & Kiểm tra điều kiện", desc:"PhoBERT pre-check + scoring suggest" },
              { key:"duplicateCheck", label:"Phát hiện Trùng lặp (AI)",       desc:"Embedding similarity search" },
              { key:"publicLYK",      label:"LYK Portal công khai",            desc:"Trang không cần đăng nhập" },
              { key:"enforce2FA",     label:"Bắt buộc 2FA (Leader/Admin)",    desc:"TOTP 30s, SMS fallback" },
            ].map(f=>{
              const on=settings[f.key as keyof typeof settings] as boolean;
              return (
                <div key={f.key} className="flex items-center gap-3 p-3 rounded-[8px] border border-[#e2e8f0]">
                  <div className="flex-1">
                    <div className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>{f.label}</div>
                    <div className="text-[13px] text-[#635647]">{f.desc}</div>
                  </div>
                  <button onClick={()=>toggle(f.key)} className="shrink-0">
                    {on ? <ToggleRight className="size-6 text-[#1C5FBE]"/> : <ToggleLeft className="size-6 text-[#d1d5db]"/>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        {/* System params */}
        <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
            <span className="text-[13px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Thông số Hệ thống</span>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label:"Tên hệ thống",           key:"brandName",       type:"text",   suffix:"" },
              { label:"File tối đa (MB)",        key:"maxFileSize",     type:"number", suffix:"MB" },
              { label:"Session timeout (phút)",  key:"sessionTimeout",  type:"number", suffix:"phút" },
              { label:"Lưu trữ audit (năm)",     key:"auditRetention",  type:"number", suffix:"năm" },
              { label:"Tần suất backup",         key:"backupFreq",      type:"text",   suffix:"" },
            ].map(f=>{
              const err = fieldErrors[f.key];
              return (
                <div key={f.key} className="flex items-start gap-3">
                  <span className="text-[13px] text-[#5a5040] w-[160px] shrink-0 pt-[10px]" style={{ fontFamily: "var(--font-sans)" }}>
                    {f.label}<span style={{ color:"#c8102e" }}> *</span>
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input type={f.type} value={settings[f.key as keyof typeof settings] as string}
                        onChange={e=>setSettings(p=>({...p,[f.key]:e.target.value}))}
                        className="flex-1 px-3 border rounded-[6px] text-[13px] outline-none focus:border-[#1C5FBE]"
                        style={{ height:36,fontFamily: "var(--font-sans)",borderColor:err?"#f87171":"#d1d5db" }}/>
                      {f.suffix&&<span className="text-[13px] text-[#635647]">{f.suffix}</span>}
                    </div>
                    {err&&<p className="text-[13px] text-[#c8102e] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>{err}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          disabled={!canSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[13px] text-white transition-opacity"
          style={{ background:"#1C5FBE",fontFamily: "var(--font-sans)",fontWeight:600,opacity:canSave?1:0.5,cursor:canSave?"pointer":"not-allowed" }}>
          <Save className="size-4"/>Lưu tất cả thay đổi
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[13px] border border-[#e2e8f0] text-[#5a5040]" style={{ fontFamily: "var(--font-sans)" }}>
          Khôi phục mặc định
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHONG TRAO BYPASS TAB
═══════════════════════════════════════════════════════════════ */
const PT_PHASES = [
  { id:0, label:"Giai đoạn 0 — Phát động",          color:"#1C5FBE", bg:"#ddeafc" },
  { id:1, label:"Giai đoạn 1 — Triển khai",         color:"#166534", bg:"#dcfce7" },
  { id:2, label:"Giai đoạn 2 — Xét duyệt",          color:"#7c3aed", bg:"#f5f3ff" },
  { id:3, label:"Giai đoạn 3 — Ban hành & Lưu trữ", color:"#b45309", bg:"#fef3c7" },
];

interface PTState {
  id:string; label:string; phase:number;
  bypassable:boolean; reason?:string; roles?:string[]; canCu?:string;
}

const PT_STATES: PTState[] = [
  { id:"draft",             label:"Soạn thảo",              phase:0, bypassable:false, canCu:"Quy trình nội bộ" },
  { id:"submitted",         label:"Trình phê duyệt",        phase:0, bypassable:true,  reason:"Bỏ qua bước thẩm tra ban đầu của Hội đồng TĐKT",                      roles:["Quản trị hệ thống","Lãnh đạo cấp cao"] },
  { id:"approved",          label:"Chờ ban hành",           phase:0, bypassable:true,  reason:"Bỏ qua bước chuẩn bị nội dung trước khi công bố",                     roles:["Quản trị hệ thống","Lãnh đạo cấp cao"] },
  { id:"published",         label:"Ban hành / Công bố",    phase:0, bypassable:false, canCu:"Điều 18 Luật TĐKT" },
  { id:"active",            label:"Đang triển khai",        phase:1, bypassable:false },
  { id:"submission_closed", label:"Hết hạn nộp hồ sơ",     phase:1, bypassable:true,  reason:"Hệ thống tự động đóng nhận hồ sơ theo ngày kết thúc, không cần thao tác thủ công", roles:["Quản trị hệ thống","Lãnh đạo cấp cao","Lãnh đạo đơn vị"] },
  { id:"unit_review",       label:"Thẩm định cấp cơ sở",   phase:2, bypassable:true,  reason:"Bỏ qua thẩm định cấp cơ sở — chỉ áp dụng cho danh hiệu cấp cơ sở",   roles:["Quản trị hệ thống","Lãnh đạo cấp cao"] },
  { id:"council_review",    label:"Hội đồng xét duyệt",    phase:2, bypassable:false, canCu:"Điều 56–57 Luật TĐKT" },
  { id:"final_approval",    label:"Trình lãnh đạo ký",     phase:2, bypassable:true,  reason:"Bỏ qua bước trình ký theo ủy quyền đặc biệt",                         roles:["Quản trị hệ thống"] },
  { id:"decision_issued",   label:"Ban hành Quyết định",   phase:3, bypassable:false, canCu:"NĐ 130/2018/NĐ-CP" },
  { id:"public",            label:"Công bố kết quả",       phase:3, bypassable:true,  reason:"Lưu trữ nội bộ, không cần công bố rộng rãi",                          roles:["Quản trị hệ thống","Lãnh đạo cấp cao"] },
  { id:"archived",          label:"Lưu trữ hồ sơ",         phase:3, bypassable:false, canCu:"NĐ 30/2020/NĐ-CP" },
];

const PT_BYPASS_KEYS = ["submitted","approved","submission_closed","unit_review","final_approval","public"];

const PT_PRESETS = [
  {
    id:"full",  label:"Quy trình đầy đủ",  color:"#166534",
    desc:"Thực hiện đầy đủ 12 bước theo NĐ 152/2025/NĐ-CP",
    bypasses:{} as Record<string,boolean>,
  },
  {
    id:"quick", label:"Phát động nhanh",   color:"#1C5FBE",
    desc:"Bỏ qua Trình phê duyệt và Chờ ban hành (Giai đoạn 0)",
    bypasses:{ submitted:true, approved:true } as Record<string,boolean>,
  },
  {
    id:"co_so", label:"Danh hiệu cơ sở",  color:"#7c3aed",
    desc:"Bỏ qua Trình phê duyệt và Thẩm định cấp cơ sở",
    bypasses:{ submitted:true, unit_review:true } as Record<string,boolean>,
  },
  {
    id:"min",   label:"Rút gọn tối đa",   color:"#b45309",
    desc:"Chỉ thực hiện các bước bắt buộc theo pháp lý",
    bypasses:{ submitted:true, approved:true, submission_closed:true, unit_review:true, public:true } as Record<string,boolean>,
  },
];

function PhongTraoBypassTab() {
  const [bypasses, setBypasses] = useState<Record<string,boolean>>(
    Object.fromEntries(PT_BYPASS_KEYS.map(k => [k, false]))
  );
  const [savedAt, setSavedAt] = useState<string|null>(null);

  const toggle = (id:string) => { setBypasses(p => ({ ...p, [id]: !p[id] })); setSavedAt(null); };
  const applyPreset = (p: typeof PT_PRESETS[0]) => {
    setBypasses(Object.fromEntries(PT_BYPASS_KEYS.map(k => [k, p.bypasses[k] ?? false])));
    setSavedAt(null);
  };

  const soBoQua = Object.values(bypasses).filter(Boolean).length;
  const effective = PT_STATES.filter(s => !bypasses[s.id]);
  const currentPresetId = PT_PRESETS.find(p =>
    PT_BYPASS_KEYS.every(k => (bypasses[k] ?? false) === (p.bypasses[k] ?? false))
  )?.id;

  return (
    <div className="h-full overflow-y-auto pb-6" style={{ fontFamily:"var(--font-sans)" }}>
      <div className="space-y-5">

        {/* ── Giới thiệu ──────────────────────────────────────── */}
        <div className="flex items-start gap-3 p-4 rounded-[10px] border border-[#93c5fd]" style={{ background:"#eff6ff" }}>
          <Zap className="size-5 text-[#1C5FBE] shrink-0 mt-0.5"/>
          <div>
            <p className="text-[14px] font-bold text-[#1e3a8a]">Cấu hình Bỏ qua bước — Quy trình Phát động Phong trào Thi đua</p>
            <p className="text-[13px] text-[#3b82f6] mt-1 leading-relaxed">
              Tính năng này cho phép bỏ qua các bước <strong>không bắt buộc</strong> theo pháp lý, giúp rút ngắn thời gian triển khai.
              Bước có nhãn <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded mx-0.5 text-[12px] font-bold" style={{ background:"#fee2e2", color:"#c8102e" }}>
                🔒 Bắt buộc
              </span> không được phép bỏ qua theo Luật TĐKT 2022 và NĐ 152/2025/NĐ-CP.
            </p>
          </div>
        </div>

        {/* ── Mẫu cấu hình nhanh (2×2) ───────────────────────── */}
        <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
            <Settings2 className="size-4 text-[#1C5FBE]"/>
            <span className="text-[13px] font-bold text-[#0b1426]">Mẫu cấu hình nhanh</span>
            <span className="ml-auto text-[13px] font-semibold" style={{ color: soBoQua > 0 ? "#b45309" : "#166534" }}>
              {soBoQua > 0
                ? `Đang bỏ qua ${soBoQua} bước · Còn lại ${12 - soBoQua} bước`
                : "Quy trình đầy đủ — 12 bước"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            {PT_PRESETS.map(p => {
              const isActive = currentPresetId === p.id;
              const soBoQuaMau = Object.values(p.bypasses).filter(Boolean).length;
              return (
                <button key={p.id} onClick={() => applyPreset(p)}
                  className="flex items-start gap-3 p-4 rounded-[10px] text-left transition-all"
                  style={{
                    background: isActive ? p.color + "12" : "white",
                    border: `${isActive ? 2 : 1}px solid ${isActive ? p.color : "#e2e8f0"}`,
                  }}>
                  <div className="size-10 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: p.color + "18" }}>
                    <Megaphone className="size-5" style={{ color: p.color }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[14px] font-bold" style={{ color: isActive ? p.color : "#0b1426" }}>
                        {p.label}
                      </span>
                      {isActive && (
                        <span className="text-[12px] px-1.5 py-0.5 rounded font-bold" style={{ background:p.color+"18", color:p.color }}>
                          Đang áp dụng
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#635647] leading-snug mb-2">{p.desc}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] px-2 py-0.5 rounded font-semibold" style={{ background:"#dcfce7", color:"#166534" }}>
                        Thực hiện {12 - soBoQuaMau} bước
                      </span>
                      {soBoQuaMau > 0 && (
                        <span className="text-[12px] px-2 py-0.5 rounded font-semibold" style={{ background:"#fef3c7", color:"#b45309" }}>
                          Bỏ qua {soBoQuaMau} bước
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cấu hình chi tiết từng bước ─────────────────────── */}
        <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
            <Zap className="size-4 text-[#7c3aed]"/>
            <span className="text-[13px] font-bold text-[#0b1426]">Cấu hình chi tiết từng bước</span>
            <span className="ml-auto text-[13px] text-[#635647]">Bật/tắt để cho phép bỏ qua từng bước</span>
          </div>

          {PT_PHASES.map(phase => {
            const states = PT_STATES.filter(s => s.phase === phase.id);
            const soBoQuaPhase = states.filter(s => s.bypassable && bypasses[s.id]).length;
            return (
              <div key={phase.id} className="border-b border-[#e2e8f0] last:border-0">
                {/* Tiêu đề giai đoạn */}
                <div className="flex items-center gap-2.5 px-5 py-2.5" style={{ background: phase.bg + "80" }}>
                  <span className="size-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ background: phase.color }}>
                    {phase.id}
                  </span>
                  <span className="text-[13px] font-bold" style={{ color: phase.color }}>{phase.label}</span>
                  {soBoQuaPhase > 0 && (
                    <span className="ml-auto text-[12px] font-bold px-2 py-0.5 rounded" style={{ background:"#fef3c7", color:"#b45309" }}>
                      Đang bỏ qua {soBoQuaPhase} bước
                    </span>
                  )}
                </div>

                {/* Danh sách bước */}
                <div className="divide-y divide-[#f1f5f9]">
                  {states.map(s => {
                    const dangBoQua = Boolean(s.bypassable && bypasses[s.id]);
                    const soBuoc = PT_STATES.findIndex(x => x.id === s.id) + 1;
                    return (
                      <div key={s.id}
                        className="flex items-start gap-4 px-5 py-3.5 transition-colors"
                        style={{ background: dangBoQua ? "#fafbfc" : "white" }}>

                        {/* Số bước */}
                        <div className="flex flex-col items-center shrink-0 mt-0.5">
                          <span className="size-7 rounded-full flex items-center justify-center text-[12px] font-bold" style={{
                            background: dangBoQua ? "#f1f5f9" : s.bypassable ? phase.bg : "#f4f7fb",
                            color: dangBoQua ? "#94a3b8" : s.bypassable ? phase.color : "#94a3b8",
                          }}>
                            {soBuoc}
                          </span>
                        </div>

                        {/* Nội dung bước */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-[14px] font-semibold" style={{
                              color: dangBoQua ? "#94a3b8" : "#0b1426",
                              textDecoration: dangBoQua ? "line-through" : "none",
                            }}>
                              {s.label}
                            </span>
                            {dangBoQua && (
                              <span className="text-[12px] font-bold px-1.5 py-0.5 rounded" style={{ background:"#fef3c7", color:"#b45309" }}>
                                Đang bỏ qua
                              </span>
                            )}
                            {!s.bypassable && (
                              <span className="text-[12px] font-bold px-1.5 py-0.5 rounded" style={{ background:"#fee2e2", color:"#c8102e" }}>
                                🔒 Bắt buộc
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] text-[#635647] leading-snug">
                            {s.bypassable ? s.reason : (s.canCu ?? "Bắt buộc theo quy định pháp luật")}
                          </p>
                          {!dangBoQua && s.bypassable && s.roles && (
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[12px] text-[#635647]">Vai trò được phép bỏ qua:</span>
                              {s.roles.map(r => (
                                <span key={r} className="text-[12px] font-semibold px-2 py-0.5 rounded" style={{ background:"#f4f7fb", color:"#0b1426" }}>
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Toggle hoặc khóa */}
                        <div className="shrink-0 flex items-center gap-2 mt-0.5">
                          {s.bypassable ? (
                            <button onClick={() => toggle(s.id)} className="flex items-center gap-1.5">
                              <span className="text-[13px] font-semibold w-16 text-right" style={{ color: bypasses[s.id] ? "#b45309" : "#94a3b8" }}>
                                {bypasses[s.id] ? "Bỏ qua" : "Thực hiện"}
                              </span>
                              {bypasses[s.id]
                                ? <ToggleRight className="size-6" style={{ color: phase.color }}/>
                                : <ToggleLeft className="size-6 text-[#d1d5db]"/>
                              }
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] text-[#d1d5db] w-16 text-right">Bắt buộc</span>
                              <Lock className="size-5 text-[#d1d5db]"/>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Quy trình hiệu lực ──────────────────────────────── */}
        <div className="rounded-[10px] border border-[#e2e8f0] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e2e8f0]" style={{ background:"#f4f7fb" }}>
            <CheckCircle2 className="size-4 text-[#166534]"/>
            <span className="text-[13px] font-bold text-[#0b1426]">Quy trình hiệu lực sau khi áp dụng cấu hình</span>
            <span className="ml-auto text-[13px] text-[#635647]">{effective.length} / {PT_STATES.length} bước</span>
          </div>
          <div className="px-5 py-4 flex items-center flex-wrap gap-y-2 gap-x-0.5">
            {effective.map((s, idx) => {
              const pCfg = PT_PHASES.find(p => p.id === s.phase)!;
              return (
                <div key={s.id} className="flex items-center gap-0.5">
                  {idx > 0 && <ArrowRight className="size-3.5 text-[#94a3b8] shrink-0 mx-0.5"/>}
                  <span className="text-[13px] font-semibold px-2.5 py-1 rounded-[6px]" style={{ background:pCfg.bg, color:pCfg.color }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Nút hành động ───────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSavedAt(new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[13px] text-white font-semibold"
            style={{ background:"#1C5FBE" }}>
            <Save className="size-4"/>Áp dụng cấu hình
          </button>
          <button
            onClick={() => { setBypasses(Object.fromEntries(PT_BYPASS_KEYS.map(k=>[k,false]))); setSavedAt(null); }}
            className="px-4 py-2.5 rounded-[8px] text-[13px] border border-[#e2e8f0] text-[#5a5040]">
            Đặt lại mặc định
          </button>
          {savedAt && (
            <div className="flex items-center gap-2 ml-auto">
              <CheckCircle2 className="size-4 text-[#166534]"/>
              <span className="text-[13px] font-semibold text-[#166534]">Đã áp dụng lúc {savedAt}</span>
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
export function CauHinhDonViPage({ user }: { user: LoginUser }) {
  const [tab,setTab]=useState<Tab>("org");
  const TABS: { id:Tab; label:string; icon:typeof Building2; color:string }[] = [
    { id:"org",       label:"Cây tổ chức",          icon:Building2,  color:"#1C5FBE" },
    { id:"awards",    label:"Danh hiệu & Điều kiện", icon:Award,      color:"#8a6400" },
    { id:"signing",   label:"Thẩm quyền Ký",         icon:Lock,       color:"#92400e" },
    { id:"sla",       label:"Kỳ xét & SLA",          icon:Clock,      color:"#b45309" },
    { id:"kinh_phi",  label:"Kinh phí Khen thưởng",  icon:Wallet,     color:"#1C5FBE" },
    { id:"general",    label:"Cài đặt chung",           icon:Settings2,  color:"#7c3aed" },
    { id:"phong_trao", label:"Cấu hình phong trào thi đua", icon:Megaphone,  color:"#1C5FBE" },
  ];
  if(!["quản trị hệ thống","lãnh đạo cấp cao","lãnh đạo đơn vị"].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-16 text-center" style={{ background:"#ffffff" }}>
        <Shield className="size-16 text-[#d1d5db]"/>
        <h2 className="text-[18px] text-[#0b1426]" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Không có quyền truy cập</h2>
        <p className="text-[14px] text-[#635647]">Trang Cấu hình hệ thống yêu cầu vai trò Admin, Lãnh đạo cấp cao hoặc Lãnh đạo đơn vị.</p>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:"#ffffff",fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#e2e8f0] shrink-0" style={{ background:"white" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background:"linear-gradient(135deg,#0b1426,#1a2744)" }}>
            <Settings2 className="size-5 text-[#8a6400]"/>
          </div>
          <div>
            <h1 className="text-[18px] text-[#0b1426] leading-tight" style={{ fontFamily: "var(--font-sans)",fontWeight:700 }}>Cấu hình Hệ thống</h1>
            <p className="text-[13px] text-[#635647]">Multi-tenant · Danh hiệu & Thẩm quyền theo QĐ 34/2021 + NĐ 152/2025/NĐ-CP · SLA theo TT 15/2025</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-[8px]" style={{ background:"#dcfce7",border:"1px solid #86efac" }}>
            <CheckCircle2 className="size-4 text-[#166534]"/>
            <span className="text-[13px] text-[#166534]" style={{ fontFamily: "var(--font-sans)",fontWeight:600 }}>Đã lưu lần cuối 09:42 hôm nay</span>
          </div>
        </div>
        <div className="flex gap-1">
          {TABS.map(t=>{ const I=t.icon; const a=tab===t.id; return (
            <button key={t.id} onClick={()=>setTab(t.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] transition-all" style={{ background:a?t.color:"transparent",color:a?"white":"#5a5040",fontFamily: "var(--font-sans)",fontWeight:a?700:400 }}>
              <I className="size-3.5"/>{t.label}
            </button>
          );})}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        {tab==="org"      && <OrgTab/>}
        {tab==="awards"   && <AwardsTab/>}
        {tab==="signing"  && <SigningTab/>}
        {tab==="sla"      && <SLATab/>}
        {tab==="kinh_phi" && <KinhPhiTab/>}
        {tab==="general"    && <GeneralTab/>}
        {tab==="phong_trao" && <PhongTraoBypassTab/>}
      </div>
    </div>
  );
}