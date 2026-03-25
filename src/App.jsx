import { useState, useEffect, useRef, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, PieChart, Pie, Cell, Legend, ReferenceLine } from "recharts";

/* ================================================================
   THEME
   ================================================================ */
const T = {
  bg: "#f4f5f7", white: "#fff", bg3: "#f9fafb", hover: "#f0f2f5",
  border: "#e5e7eb", borderL: "#f0f1f3",
  text: "#111827", body: "#374151", tm: "#6b7280", td: "#9ca3af",
  blue: "#2563eb", blueL: "#3b82f6", blueBg: "#eff6ff", blueBd: "#bfdbfe",
  green: "#059669", greenL: "#10b981", greenBg: "#ecfdf5", greenBd: "#a7f3d0",
  red: "#dc2626", redBg: "#fef2f2",
  amber: "#d97706", amberBg: "#fffbeb", amberBd: "#fde68a",
  purple: "#7c3aed", coral: "#ea580c", teal: "#0d9488",
  sidebar: "#111827", sideT: "#9ca3af", sideA: "#fff",
};
const font = '"Noto Sans SC","DM Sans",-apple-system,sans-serif';
const mono = '"DM Sans",monospace';
const tipS = { background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 12, color: T.text, boxShadow: "0 4px 12px rgba(0,0,0,.08)" };

/* ================================================================
   DATA
   ================================================================ */
const SN = ["张","李","王","刘","陈","杨","赵","黄","周","吴","徐","孙","胡","朱","高","林","何","郭","马","罗"];
const GN = ["伟","芳","娜","秀英","敏","静","丽","强","磊","军","洋","勇","艳","杰","娟","涛","明","超","秀兰","霞"];
const CT = ["北京市","上海市","广州市","深圳市","杭州市","成都市","武汉市","南京市","重庆市","天津市"];
const STS = ["未触达","协商中","承诺还款","已回款","失联","诉讼中"];
const rn = a => a[Math.floor(Math.random() * a.length)];
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function genLoans(pid, n) {
  return Array.from({ length: n }, (_, i) => {
    const nm = rn(SN) + rn(GN) + (Math.random() > .5 ? rn(GN) : ""), g = Math.random() > .45 ? "男" : "女";
    const o = ri(5, 800) * 100, od = Math.round(o * (.8 + Math.random() * .2)), oi = Math.round(o * (.05 + Math.random() * .3)), td = od + oi;
    const st = rn(STS), rec = st === "已回款" ? Math.round(td * (.2 + Math.random() * .6)) : st === "承诺还款" ? Math.round(td * Math.random() * .2) : st === "协商中" ? Math.round(td * Math.random() * .1) : 0;
    return { id: `${pid}-L${String(i + 1).padStart(4, "0")}`, name: nm, gender: g, idNumber: `${ri(110000, 650000)}${ri(1970, 2005)}${String(ri(1, 12)).padStart(2, "0")}${String(ri(1, 28)).padStart(2, "0")}${ri(1000, 9999)}`, phone: `1${ri(3, 8)}${ri(100000000, 999999999)}`, city: rn(CT), address: `${rn(CT)}某区某路${ri(1, 200)}号`, originalAmount: o, overduePrincipal: od, overdueInterest: oi, totalDue: td, recovered: rec, recoveryRate: td > 0 ? rec / td : 0, status: st, lastContact: `2025-${String(ri(4, 9)).padStart(2, "0")}-${String(ri(1, 28)).padStart(2, "0")}` };
  });
}

function genWeekly(loans, w = 28) {
  const tot = loans.reduce((s, l) => s + l.recovered, 0); let c = 0;
  const a = Array.from({ length: w }, (_, i) => {
    const f = Math.max(.01, 1 - ((i + 1) / w) * .7), amt = Math.round(Math.max(0, Math.min((tot / w) * f * (1 + (Math.random() - .3) * .5) * 2, tot - c)));
    c += amt; if (c > tot) c = tot;
    return { week: i + 1, weekLabel: `第${i + 1}周`, amount: amt, cumulative: c, date: `2025-${String(3 + Math.floor(i / 4)).padStart(2, "0")}-${String((i % 4) * 7 + 1).padStart(2, "0")}` };
  });
  if (a.length && a[a.length - 1].cumulative < tot) { a[a.length - 1].amount += tot - a[a.length - 1].cumulative; a[a.length - 1].cumulative = tot; }
  return a;
}

const initPkgs = [
  { id: "PKG-2025-001", name: "华东个贷不良资产包A", source: "东方资产管理", purchaseDate: "2025-03-15", faceValue: 8500000, purchasePrice: 500000, status: "处置中", feeRates: { disposal: .08, platform: .03, gp: .02 }, loans: genLoans("PKG001", 86) },
  { id: "PKG-2025-002", name: "华南消费贷不良资产包B", source: "长城资产管理", purchaseDate: "2025-06-01", faceValue: 12000000, purchasePrice: 480000, status: "处置中", feeRates: { disposal: .07, platform: .03, gp: .025 }, loans: genLoans("PKG002", 120) },
];
initPkgs.forEach(p => { p.loanCount = p.loans.length; p.discountRate = p.purchasePrice / p.faceValue; p.payments = genWeekly(p.loans); });

const initInvestors = [
  { id: "inv1", name: "鼎信一号合伙企业(SPV)", type: "SPV", share: { "PKG-2025-001": .45, "PKG-2025-002": .55 }, capital: { "PKG-2025-001": 225000, "PKG-2025-002": 264000 }, phone: "021-88886666", contractDate: "2025-03-01", password: "dingxin123" },
  { id: "inv2", name: "恒达投资合伙企业(SPV)", type: "SPV", share: { "PKG-2025-001": .35, "PKG-2025-002": .45 }, capital: { "PKG-2025-001": 175000, "PKG-2025-002": 216000 }, phone: "010-66665555", contractDate: "2025-03-05", password: "hengda123" },
  { id: "inv3", name: "王强", type: "个人", share: { "PKG-2025-001": .20 }, capital: { "PKG-2025-001": 100000 }, phone: "13611112222", contractDate: "2025-03-10", password: "wang123" },
];
const initBm = { industry3m: .15, industry6m: .32, industry12m: .55 };

const initAnnouncements = [
  { id: 1, date: "2025-10-14", title: "华东资产包A本周回款简报", content: "本周新增回款 ¥38,200，累计回收率较上周提升0.8%。催收团队已对12名承诺还款人进行跟进确认。", type: "回款通报" },
  { id: 2, date: "2025-10-07", title: "华南资产包B新增诉讼批次", content: "本批次已对35名失联借款人提起民事诉讼，预计3个月内进入执行阶段。", type: "处置进展" },
  { id: 3, date: "2025-09-30", title: "Q3季度投资报告已发布", content: "2025年第三季度投资报告已上传至文档中心，请各位投资者查阅。", type: "季度报告" },
];

const initDocs = [
  { id: 1, name: "2025Q3季度投资报告.pdf", date: "2025-09-30", type: "季度报告", size: "2.4MB", forAll: true },
  { id: 2, name: "华东资产包A-尽调报告.pdf", date: "2025-03-10", type: "尽调报告", size: "5.1MB", forPkg: "PKG-2025-001" },
  { id: 3, name: "华南资产包B-尽调报告.pdf", date: "2025-05-25", type: "尽调报告", size: "4.8MB", forPkg: "PKG-2025-002" },
  { id: 4, name: "合伙协议-鼎信一号.pdf", date: "2025-03-01", type: "合同文件", size: "1.2MB", forInv: "inv1" },
  { id: 5, name: "合伙协议-恒达投资.pdf", date: "2025-03-05", type: "合同文件", size: "1.1MB", forInv: "inv2" },
  { id: 6, name: "投资合同-王强.pdf", date: "2025-03-10", type: "合同文件", size: "1.0MB", forInv: "inv3" },
  { id: 7, name: "鼎信一号-份额确认书.pdf", date: "2025-03-15", type: "份额文件", size: "0.5MB", forInv: "inv1" },
  { id: 8, name: "恒达投资-份额确认书.pdf", date: "2025-03-15", type: "份额文件", size: "0.5MB", forInv: "inv2" },
];

/* ================================================================
   UTILS
   ================================================================ */
const maskN = n => n ? n[0] + "**" : "**";
const maskId = id => id ? id.slice(0, 6) + "********" + id.slice(-4) : "";
const maskAddr = a => { const m = a?.match(/(.*?市)/); return m ? m[1] : ""; };
const fmt = n => n >= 10000 ? (n / 10000).toFixed(2) + "万" : n.toLocaleString("zh-CN");
const fmtF = n => Math.round(n).toLocaleString("zh-CN");
const pct = n => (n * 100).toFixed(2) + "%";
const today = () => new Date().toISOString().slice(0, 10);

function calcR(pkg, inv) {
  const sh = inv.share[pkg.id]; if (!sh) return null;
  const cap = inv.capital[pkg.id] || pkg.purchasePrice * sh;
  const tot = pkg.loans.reduce((s, l) => s + l.recovered, 0);
  const fr = pkg.feeRates, tfr = fr.disposal + fr.platform + fr.gp;
  const net = tot * (1 - tfr), my = net * sh;
  const dpi = cap > 0 ? my / cap : 0;
  const weeklyAvg = pkg.payments.length > 0 ? (my / pkg.payments.length) : 0;
  const weeksToPayback = (dpi >= 1 || weeklyAvg <= 0) ? 0 : Math.ceil((cap - my) / weeklyAvg);
  return { cap, tot, tfr, net, my, dpi, profit: my - cap, pb: dpi >= 1, gap: Math.max(0, cap - my), sh, dFee: tot * fr.disposal * sh, pFee: tot * fr.platform * sh, gFee: tot * fr.gp * sh, weeksToPayback };
}

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => { const h = () => setM(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return m;
}

/* ================================================================
   STYLES
   ================================================================ */
const S = {
  btn: c => ({ padding: "8px 20px", borderRadius: 8, border: "none", background: c || T.blue, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: font }),
  btnSm: c => ({ padding: "5px 14px", borderRadius: 6, border: "none", background: c || T.blue, color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: font }),
  btnG: { padding: "5px 14px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.white, color: T.body, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: font },
  input: { background: T.white, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: font, outline: "none", width: "100%", boxSizing: "border-box" },
  select: { background: T.white, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: font, outline: "none" },
  card: { background: T.white, borderRadius: 12, border: `1px solid ${T.border}`, padding: 20, boxShadow: "0 1px 2px rgba(0,0,0,.03)" },
  th: { padding: "10px 14px", textAlign: "left", fontWeight: 600, color: T.tm, borderBottom: `1px solid ${T.border}`, fontSize: 11, letterSpacing: ".04em", background: T.bg3 },
  td: { padding: "10px 14px", borderBottom: `1px solid ${T.borderL}`, color: T.body, fontSize: 13 },
  badge: c => ({ display: "inline-block", padding: "3px 12px", borderRadius: 50, fontSize: 11, fontWeight: 600, background: c + "12", color: c }),
  tag: c => ({ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: c + "10", color: c }),
  big: (c = T.text) => ({ fontSize: 28, fontWeight: 700, color: c, fontFamily: mono, letterSpacing: "-.02em" }),
  stamp: { fontSize: 11, color: T.td, textAlign: "right", marginBottom: 12 },
};

/* ================================================================
   SHARED COMPONENTS
   ================================================================ */
const Badge = ({ s }) => { const c = { "未触达": T.td, "协商中": T.amber, "承诺还款": T.purple, "已回款": T.green, "失联": T.red, "处置中": T.coral, "诉讼中": T.coral }; return <span style={S.badge(c[s] || T.td)}>{s}</span>; };

const Modal = ({ open, onClose, title, children }) => open ? <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
  <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: "28px 24px", width: 560, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.12)" }} onClick={e => e.stopPropagation()}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <div style={{ fontSize: 17, fontWeight: 700 }}>{title}</div>
      <button onClick={onClose} style={{ background: "none", border: "none", color: T.td, fontSize: 22, cursor: "pointer" }}>✕</button>
    </div>{children}
  </div>
</div> : null;

const Field = ({ label, children }) => <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: T.tm, display: "block", marginBottom: 5, fontWeight: 500 }}>{label}</label>{children}</div>;

const Stamp = ({ label }) => <div style={S.stamp}>数据截至 {label || today()}</div>;

const Pager = ({ total, page, setPage, ps = 15 }) => { const pgs = Math.ceil(total / ps); return <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, fontSize: 13, color: T.tm }}>
  <span>共 {total} 条</span>
  <div style={{ display: "flex", gap: 6 }}><button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={{ ...S.btnG, opacity: page === 0 ? .4 : 1 }}>上页</button><span style={{ padding: "2px 8px", fontSize: 12 }}>{page + 1}/{pgs || 1}</span><button onClick={() => setPage(Math.min(pgs - 1, page + 1))} disabled={page >= pgs - 1} style={{ ...S.btnG, opacity: page >= pgs - 1 ? .4 : 1 }}>下页</button></div>
</div>; };

/* ================================================================
   EXCEL IMPORT COMPONENT
   ================================================================ */
const ExcelImport = ({ onImport, pkgId, fields }) => {
  const [drag, setDrag] = useState(false); const [preview, setPreview] = useState(null); const [mapping, setMapping] = useState({}); const ref = useRef();
  const FIELDS = fields || [["name", "姓名"], ["gender", "性别"], ["idNumber", "身份证号"], ["phone", "手机号"], ["city", "城市"], ["overduePrincipal", "逾期本金"], ["overdueInterest", "逾期利息"], ["status", "催收状态"]];
  const parseCSV = text => {
    const lines = text.split(/\r?\n/).filter(l => l.trim()); if (lines.length < 2) return;
    const headers = lines[0].split(/[,\t]/).map(h => h.replace(/["']/g, "").trim());
    const rows = lines.slice(1).map(l => { const vals = l.split(/[,\t]/).map(v => v.replace(/["']/g, "").trim()); const obj = {}; headers.forEach((h, i) => obj[h] = vals[i] || ""); return obj; });
    const autoMap = {}; FIELDS.forEach(([k, cn]) => { const found = headers.find(h => h.includes(cn)); if (found) autoMap[k] = found; });
    setMapping(autoMap); setPreview({ headers, rows, count: rows.length });
  };
  const handleFile = file => {
    if (!file) return; const reader = new FileReader();
    if (/\.(csv|tsv|txt)$/i.test(file.name)) { reader.onload = e => parseCSV(e.target.result); reader.readAsText(file, "utf-8"); }
    else { reader.onload = e => { import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm").then(X => { const wb = X.read(new Uint8Array(e.target.result), { type: "array" }); parseCSV(X.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])); }).catch(() => parseCSV(e.target.result)); }; reader.readAsArrayBuffer(file); }
  };
  const doImport = () => {
    if (!preview) return;
    const loans = preview.rows.map((row, i) => { const g = k => row[mapping[k]] || ""; const od = parseFloat(g("overduePrincipal")) || 0, oi = parseFloat(g("overdueInterest")) || 0;
      return { id: `${pkgId}-L${String(i + 1).padStart(4, "0")}`, name: g("name"), gender: g("gender") || "男", idNumber: g("idNumber"), phone: g("phone"), city: g("city"), address: g("city"), originalAmount: 0, overduePrincipal: od, overdueInterest: oi, totalDue: od + oi, recovered: 0, recoveryRate: 0, status: g("status") || "未触达", lastContact: "" };
    }).filter(l => l.name); onImport(loans); setPreview(null);
  };
  return <div>
    <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}
      style={{ border: `2px dashed ${drag ? T.blue : T.border}`, borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: drag ? T.blueBg : T.bg3 }}>
      <input ref={ref} type="file" accept=".xlsx,.xls,.csv" onChange={e => handleFile(e.target.files[0])} style={{ display: "none" }} />
      <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>拖拽 Excel/CSV 到这里</div>
      <div style={{ fontSize: 12, color: T.tm, marginTop: 4 }}>支持 .xlsx .csv</div>
    </div>
    {preview && <div style={{ marginTop: 16 }}>
      <div style={{ padding: 10, background: T.greenBg, borderRadius: 8, marginBottom: 14 }}><b style={{ color: T.green }}>识别 {preview.count} 条</b></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {FIELDS.map(([k, cn]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: T.tm, width: 70 }}>{cn}</span>
          <select value={mapping[k] || ""} onChange={e => setMapping({ ...mapping, [k]: e.target.value })} style={{ ...S.select, flex: 1, fontSize: 12, padding: "4px 6px" }}>
            <option value="">--</option>{preview.headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}><button onClick={() => setPreview(null)} style={S.btnG}>取消</button><button onClick={doImport} style={S.btn(T.green)}>导入 {preview.count} 条</button></div>
    </div>}
  </div>;
};

/* ================================================================
   COMPANY VIEWS
   ================================================================ */

/* Dashboard with weekly summary */
const CompanyDash = ({ pkgs, investors, logs }) => {
  const mobile = useIsMobile();
  const tr = pkgs.reduce((s, p) => s + p.loans.reduce((ss, l) => ss + l.recovered, 0), 0);
  const td2 = pkgs.reduce((s, p) => s + p.loans.reduce((ss, l) => ss + l.totalDue, 0), 0);
  const tl = pkgs.reduce((s, p) => s + p.loanCount, 0);
  const paidCount = pkgs.reduce((s, p) => s + p.loans.filter(l => l.status === "已回款").length, 0);
  const stats = [["资产包", pkgs.length + "个", T.blue], ["信贷笔数", tl + "笔", T.teal], ["投资者", investors.length + "人", T.purple], ["累计回款", "¥" + fmt(tr), T.green], ["已回款笔数", paidCount + "笔", T.greenL], ["整体回收率", pct(td2 > 0 ? tr / td2 : 0), T.amber]];
  return <div>
    <div style={{ fontSize: 20, fontWeight: 700 }}>运营概览</div>
    <Stamp />
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
      {stats.map(([l, v, c], i) => <div key={i} style={S.card}><div style={{ fontSize: 11, color: T.td, marginBottom: 6, fontWeight: 500 }}>{l}</div><div style={{ ...S.big(c), fontSize: mobile ? 18 : 22 }}>{v}</div></div>)}
    </div>
    {/* Recent logs */}
    <div style={{ ...S.card }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>最近操作记录</div>
      {logs.slice(-8).reverse().map((log, i) => <div key={i} style={{ padding: "8px 0", borderBottom: i < 7 ? `1px solid ${T.borderL}` : "none", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: T.body }}>{log.action}</span>
        <span style={{ color: T.td, fontSize: 12 }}>{log.time}</span>
      </div>)}
      {logs.length === 0 && <div style={{ color: T.td, fontSize: 13 }}>暂无操作记录</div>}
    </div>
  </div>;
};

/* Package management */
const CompanyPkgs = ({ pkgs, setPkgs, addLog }) => {
  const mobile = useIsMobile();
  const [ep, setEp] = useState(null); const [sn, setSn] = useState(false);
  const empty = { id: "PKG-2025-" + ri(100, 999), name: "", source: "", purchaseDate: "2025-10-01", faceValue: 0, purchasePrice: 0, status: "处置中", feeRates: { disposal: .08, platform: .03, gp: .02 }, loans: [], payments: [], loanCount: 0, discountRate: 0 };
  const save = (p, n) => { p.loanCount = p.loans.length; p.discountRate = p.faceValue > 0 ? p.purchasePrice / p.faceValue : 0; if (n) setPkgs(v => [...v, p]); else setPkgs(v => v.map(x => x.id === p.id ? p : x)); addLog(n ? `新增资产包: ${p.name}` : `编辑资产包: ${p.name}`); setEp(null); setSn(false); };
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
      <div><div style={{ fontSize: 20, fontWeight: 700 }}>资产包管理</div></div>
      <button onClick={() => setSn(true)} style={S.btn()}>+ 新增</button>
    </div>
    {pkgs.map(p => { const rec = p.loans.reduce((s, l) => s + l.recovered, 0); const due = p.loans.reduce((s, l) => s + l.totalDue, 0); return <div key={p.id} style={{ ...S.card, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div><div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p.name}</div><div style={{ fontSize: 12, color: T.tm }}>{p.source} | {p.purchaseDate} | {p.loanCount}笔</div></div>
        <div style={{ display: "flex", gap: 8 }}><button onClick={() => setEp({ ...p, feeRates: { ...p.feeRates } })} style={S.btnSm()}>编辑</button><button onClick={() => { if (confirm("确认删除？")) { setPkgs(v => v.filter(x => x.id !== p.id)); addLog(`删除资产包: ${p.name}`); } }} style={S.btnSm(T.red)}>删除</button></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.borderL}` }}>
        {[["面值", "¥" + fmtF(p.faceValue)], ["购入价", "¥" + fmtF(p.purchasePrice)], ["已回款", "¥" + fmtF(rec), T.green], ["回收率", pct(due > 0 ? rec / due : 0), T.amber]].map(([l, v, c], i) => <div key={i}><div style={{ fontSize: 11, color: T.td }}>{l}</div><div style={{ fontSize: 14, fontWeight: 600, color: c || T.text, fontFamily: mono, marginTop: 2 }}>{v}</div></div>)}
      </div>
    </div>; })}
    <PkgEd open={!!ep} pkg={ep} onClose={() => setEp(null)} onSave={p => save(p, false)} title="编辑资产包" />
    <PkgEd open={sn} pkg={empty} onClose={() => setSn(false)} onSave={p => save(p, true)} title="新增资产包" />
  </div>;
};

const PkgEd = ({ open, pkg, onClose, onSave, title }) => {
  const [d, setD] = useState(pkg); useEffect(() => { if (pkg) setD({ ...pkg, feeRates: { ...pkg.feeRates } }); }, [pkg]); if (!d) return null;
  const u = (k, v) => setD(p => ({ ...p, [k]: v })); const uf = (k, v) => setD(p => ({ ...p, feeRates: { ...p.feeRates, [k]: v } }));
  return <Modal open={open} onClose={onClose} title={title}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {[["名称", "name", "text"], ["来源", "source", "text"], ["购入日期", "purchaseDate", "date"], ["面值", "faceValue", "number"], ["购入价", "purchasePrice", "number"]].map(([l, k, t]) =>
        <Field key={k} label={l}><input type={t} value={d[k]} onChange={e => u(k, t === "number" ? +e.target.value : e.target.value)} style={S.input} /></Field>)}
      <Field label="状态"><select value={d.status} onChange={e => u("status", e.target.value)} style={{ ...S.select, width: "100%" }}>{["处置中", "已结案", "部分结案"].map(s => <option key={s}>{s}</option>)}</select></Field>
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 10px", paddingTop: 14, borderTop: `1px solid ${T.borderL}` }}>合同费率</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
      {[["处置服务费", "disposal"], ["平台费", "platform"], ["GP管理费", "gp"]].map(([l, k]) => <Field key={k} label={l}><input type="number" step=".01" value={d.feeRates[k]} onChange={e => uf(k, +e.target.value)} style={S.input} /></Field>)}
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}><button onClick={onClose} style={S.btnG}>取消</button><button onClick={() => onSave(d)} style={S.btn()}>保存</button></div>
  </Modal>;
};

/* Loans with Excel import + batch payment */
const CompanyLoans = ({ pkgs, setPkgs, addLog }) => {
  const mobile = useIsMobile();
  const [pi, setPi] = useState(0); const [el, setEl] = useState(null); const [sn, setSn] = useState(false);
  const [pay, setPay] = useState(null); const [pa, setPa] = useState("");
  const [ft, setFt] = useState("全部"); const [q, setQ] = useState(""); const [pg, setPg] = useState(0);
  const [showImp, setShowImp] = useState(false); const [showBatchPay, setShowBatchPay] = useState(false);
  const PS = 15; const pkg = pkgs[pi];
  const fl = pkg.loans.filter(l => (ft === "全部" || l.status === ft) && (!q || l.name.includes(q) || l.id.includes(q)));
  const pd = fl.slice(pg * PS, (pg + 1) * PS);

  const saveLoan = (l, n) => { setPkgs(v => v.map((p, i) => { if (i !== pi) return p; const loans = n ? [...p.loans, l] : p.loans.map(x => x.id === l.id ? l : x); return { ...p, loans, loanCount: loans.length }; })); addLog(n ? `新增信贷: ${l.name}` : `编辑信贷: ${l.name}`); setEl(null); setSn(false); };
  const recPay = () => { const amt = parseFloat(pa); if (!amt) return; setPkgs(v => v.map((p, i) => { if (i !== pi) return p; const loans = p.loans.map(l => { if (l.id !== pay.id) return l; const r = l.recovered + amt; return { ...l, recovered: r, recoveryRate: l.totalDue > 0 ? r / l.totalDue : 0, status: r >= l.totalDue ? "已回款" : "承诺还款" }; }); const payments = [...p.payments]; if (payments.length) { const last = { ...payments[payments.length - 1] }; last.amount += amt; last.cumulative += amt; payments[payments.length - 1] = last; } return { ...p, loans, payments }; })); addLog(`录入回款: ${pay.name} ¥${amt}`); setPay(null); setPa(""); };
  const handleImport = loans => { setPkgs(v => v.map((p, i) => { if (i !== pi) return p; const all = [...p.loans, ...loans]; return { ...p, loans: all, loanCount: all.length, payments: genWeekly(all) }; })); addLog(`批量导入 ${loans.length} 条信贷`); setShowImp(false); };
  const handleBatchPay = data => {
    setPkgs(v => v.map((p, i) => {
      if (i !== pi) return p;
      const loans = p.loans.map(l => {
        const match = data.find(d => d.id === l.id || d.name === l.name);
        if (!match) return l;
        const amt = parseFloat(match.amount) || 0; if (amt <= 0) return l;
        const r = l.recovered + amt;
        return { ...l, recovered: r, recoveryRate: l.totalDue > 0 ? r / l.totalDue : 0, status: r >= l.totalDue ? "已回款" : l.status === "未触达" ? "承诺还款" : l.status };
      });
      return { ...p, loans, payments: genWeekly(loans) };
    }));
    addLog(`批量录入回款 ${data.length} 条`);
    setShowBatchPay(false);
  };
  const emptyL = { id: `${pkg.id}-L${String(pkg.loans.length + 1).padStart(4, "0")}`, name: "", gender: "男", idNumber: "", phone: "", city: "", address: "", originalAmount: 0, overduePrincipal: 0, overdueInterest: 0, totalDue: 0, recovered: 0, recoveryRate: 0, status: "未触达", lastContact: "" };

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>信贷明细管理</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <select value={pi} onChange={e => { setPi(+e.target.value); setPg(0); }} style={S.select}>{pkgs.map((p, i) => <option key={i} value={i}>{p.name}</option>)}</select>
        <button onClick={() => setShowImp(!showImp)} style={S.btn(T.teal)}>📄 导入信贷</button>
        <button onClick={() => setShowBatchPay(!showBatchPay)} style={S.btn(T.green)}>📄 批量回款</button>
        <button onClick={() => setSn(true)} style={S.btn()}>+ 新增</button>
      </div>
    </div>
    {showImp && <div style={{ ...S.card, marginBottom: 16 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><b>批量导入信贷</b><button onClick={() => setShowImp(false)} style={S.btnG}>收起</button></div><ExcelImport onImport={handleImport} pkgId={pkg.id} /></div>}
    {showBatchPay && <div style={{ ...S.card, marginBottom: 16 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><b>批量录入回款</b><button onClick={() => setShowBatchPay(false)} style={S.btnG}>收起</button></div>
      <ExcelImport onImport={data => handleBatchPay(data.map(d => ({ id: d.id, name: d.name, amount: d.overduePrincipal || d.recovered || 0 })))} pkgId={pkg.id} fields={[["name", "姓名"], ["id", "编号"], ["overduePrincipal", "回款金额"]]} />
      <div style={{ fontSize: 12, color: T.tm, marginTop: 8 }}>Excel需包含"姓名"或"编号"列用于匹配，以及"回款金额"列</div>
    </div>}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{["全部", ...STS].map(s => <button key={s} onClick={() => { setFt(s); setPg(0); }} style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${ft === s ? T.blue : T.border}`, background: ft === s ? T.blueBg : T.white, color: ft === s ? T.blue : T.tm, fontSize: 12, cursor: "pointer", fontFamily: font, fontWeight: ft === s ? 600 : 400 }}>{s}</button>)}</div>
      <input placeholder="搜索..." value={q} onChange={e => { setQ(e.target.value); setPg(0); }} style={{ ...S.input, width: 160 }} />
    </div>
    <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead><tr>{(mobile ? ["姓名", "待收", "已收", "状态", "操作"] : ["编号", "姓名", "性别", "城市", "待收", "已收", "状态", "操作"]).map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{pd.map(l => <tr key={l.id} onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = ""}>
          {!mobile && <td style={{ ...S.td, fontFamily: mono, fontSize: 11, color: T.td }}>{l.id}</td>}
          <td style={{ ...S.td, fontWeight: 600 }}>{l.name}</td>
          {!mobile && <><td style={S.td}>{l.gender}</td><td style={S.td}>{l.city}</td></>}
          <td style={{ ...S.td, fontFamily: mono }}>¥{fmtF(l.totalDue)}</td>
          <td style={{ ...S.td, fontFamily: mono, color: l.recovered > 0 ? T.green : T.td }}>¥{fmtF(l.recovered)}</td>
          <td style={S.td}><Badge s={l.status} /></td>
          <td style={S.td}><div style={{ display: "flex", gap: 4 }}><button onClick={() => setEl({ ...l })} style={S.btnSm()}>编辑</button><button onClick={() => { setPay(l); setPa(""); }} style={S.btnSm(T.green)}>回款</button></div></td>
        </tr>)}</tbody>
      </table></div>
      <Pager total={fl.length} page={pg} setPage={setPg} />
    </div>
    <LoanEd open={!!el} loan={el} onClose={() => setEl(null)} onSave={l => saveLoan(l, false)} title="编辑信贷" />
    <LoanEd open={sn} loan={emptyL} onClose={() => setSn(false)} onSave={l => saveLoan(l, true)} title="新增信贷" />
    <Modal open={!!pay} onClose={() => setPay(null)} title={`录入回款 — ${pay?.name || ""}`}>{pay && <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18, padding: 14, background: T.bg3, borderRadius: 10 }}>
        {[["待收", fmtF(pay.totalDue), T.text], ["已收", fmtF(pay.recovered), T.green], ["剩余", fmtF(pay.totalDue - pay.recovered), T.amber]].map(([l, v, c], i) => <div key={i}><div style={{ fontSize: 11, color: T.td }}>{l}</div><div style={{ fontWeight: 600, fontFamily: mono, color: c, marginTop: 2 }}>¥{v}</div></div>)}
      </div>
      <Field label="金额"><input type="number" value={pa} onChange={e => setPa(e.target.value)} style={S.input} /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}><button onClick={() => setPay(null)} style={S.btnG}>取消</button><button onClick={recPay} style={S.btn(T.green)}>确认</button></div>
    </div>}</Modal>
  </div>;
};

const LoanEd = ({ open, loan, onClose, onSave, title }) => {
  const [d, setD] = useState(loan); useEffect(() => { if (loan) setD({ ...loan }); }, [loan]); if (!d) return null;
  const u = (k, v) => setD(p => ({ ...p, [k]: v }));
  const save = () => { const od = +d.overduePrincipal, oi = +d.overdueInterest; onSave({ ...d, overduePrincipal: od, overdueInterest: oi, totalDue: od + oi, originalAmount: +d.originalAmount, recovered: +d.recovered, recoveryRate: (od + oi) > 0 ? (+d.recovered) / (od + oi) : 0 }); };
  return <Modal open={open} onClose={onClose} title={title}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
    {[["姓名", "name"], ["身份证", "idNumber"], ["手机", "phone"], ["城市", "city"], ["逾期本金", "overduePrincipal", "number"], ["逾期利息", "overdueInterest", "number"]].map(([l, k, t]) =>
      <Field key={k} label={l}><input type={t || "text"} value={d[k]} onChange={e => u(k, e.target.value)} style={S.input} /></Field>)}
  </div><div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}><button onClick={onClose} style={S.btnG}>取消</button><button onClick={save} style={S.btn()}>保存</button></div></Modal>;
};

/* Investor management */
const CompanyInvs = ({ investors, setInvestors, pkgs, addLog }) => {
  const [ei, setEi] = useState(null); const [sn, setSn] = useState(false);
  const empty = { id: "inv" + Date.now(), name: "", phone: "", contractDate: "2025-10-01", password: "", share: {}, capital: {} };
  const save = (v, n) => { if (n) setInvestors(p => [...p, v]); else setInvestors(p => p.map(x => x.id === v.id ? v : x)); addLog(n ? `新增投资者: ${v.name}` : `编辑投资者: ${v.name}`); setEi(null); setSn(false); };
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}><div style={{ fontSize: 20, fontWeight: 700 }}>投资者管理</div><button onClick={() => setSn(true)} style={S.btn()}>+ 新增</button></div>
    {investors.map(v => <div key={v.id} style={{ ...S.card, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${T.blue}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: T.blue }}>{v.name[0]}</div>
          <div><div style={{ fontWeight: 600 }}>{v.name}</div><div style={{ fontSize: 12, color: T.tm }}>签约 {v.contractDate}</div></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}><button onClick={() => setEi({ ...v, share: { ...v.share }, capital: { ...v.capital } })} style={S.btnSm()}>编辑</button><button onClick={() => { if (confirm("删除？")) { setInvestors(p => p.filter(x => x.id !== v.id)); addLog(`删除投资者: ${v.name}`); } }} style={S.btnSm(T.red)}>删除</button></div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{pkgs.filter(p => v.share[p.id]).map(p => { const r = calcR(p, v); return <div key={p.id} style={{ padding: "8px 12px", background: T.bg3, borderRadius: 8, flex: 1, minWidth: 180, fontSize: 12 }}><b>{p.name}</b><br /><span style={{ color: T.tm }}>份额 <b style={{ color: T.blue }}>{pct(v.share[p.id])}</b></span> <span style={{ color: T.tm, marginLeft: 8 }}>DPI <b style={{ color: T.green }}>{r ? r.dpi.toFixed(2) + "x" : "-"}</b></span></div>; })}</div>
    </div>)}
    <InvEd open={!!ei} inv={ei} pkgs={pkgs} onClose={() => setEi(null)} onSave={v => save(v, false)} title="编辑投资者" />
    <InvEd open={sn} inv={empty} pkgs={pkgs} onClose={() => setSn(false)} onSave={v => save(v, true)} title="新增投资者" />
  </div>;
};

const InvEd = ({ open, inv, pkgs, onClose, onSave, title }) => {
  const [d, setD] = useState(inv); useEffect(() => { if (inv) setD({ ...inv, share: { ...inv.share }, capital: { ...inv.capital } }); }, [inv]); if (!d) return null;
  return <Modal open={open} onClose={onClose} title={title}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {[["姓名", "name"], ["手机", "phone"], ["签约日期", "contractDate", "date"], ["密码", "password"]].map(([l, k, t]) =>
        <Field key={k} label={l}><input type={t || "text"} value={d[k]} onChange={e => setD(p => ({ ...p, [k]: e.target.value }))} style={S.input} /></Field>)}
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 10px", paddingTop: 14, borderTop: `1px solid ${T.borderL}` }}>份额分配</div>
    {pkgs.map(p => <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, padding: "8px 12px", background: T.bg3, borderRadius: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 500, minWidth: 140 }}>{p.name}</span>
      <input type="number" step=".01" placeholder="份额" value={d.share[p.id] || ""} onChange={e => { const v = +e.target.value; setD(prev => ({ ...prev, share: { ...prev.share, [p.id]: v }, capital: { ...prev.capital, [p.id]: Math.round(p.purchasePrice * v) } })); }} style={{ ...S.input, width: 80 }} />
      <span style={{ fontSize: 12, color: T.tm }}>= ¥{fmtF(Math.round(p.purchasePrice * (d.share[p.id] || 0)))}</span>
    </div>)}
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}><button onClick={onClose} style={S.btnG}>取消</button><button onClick={() => onSave(d)} style={S.btn()}>保存</button></div>
  </Modal>;
};

/* Announcements management */
const CompanyAnnouncements = ({ ann, setAnn, addLog }) => {
  const [show, setShow] = useState(false); const [title, setTitle] = useState(""); const [content, setContent] = useState(""); const [type, setType] = useState("回款通报");
  const post = () => { if (!title.trim()) return; const n = { id: Date.now(), date: today(), title, content, type }; setAnn(v => [n, ...v]); addLog(`发布公告: ${title}`); setTitle(""); setContent(""); setShow(false); };
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}><div style={{ fontSize: 20, fontWeight: 700 }}>公告管理</div><button onClick={() => setShow(true)} style={S.btn()}>+ 发布公告</button></div>
    {ann.map(a => <div key={a.id} style={{ ...S.card, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={S.tag(T.blue)}>{a.type}</span><b style={{ fontSize: 14 }}>{a.title}</b></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12, color: T.td }}>{a.date}</span><button onClick={() => { setAnn(v => v.filter(x => x.id !== a.id)); addLog(`删除公告: ${a.title}`); }} style={{ ...S.btnSm(T.red), padding: "3px 10px" }}>删除</button></div>
      </div>
      <div style={{ fontSize: 13, color: T.body }}>{a.content}</div>
    </div>)}
    <Modal open={show} onClose={() => setShow(false)} title="发布新公告">
      <Field label="标题"><input value={title} onChange={e => setTitle(e.target.value)} style={S.input} /></Field>
      <Field label="类型"><select value={type} onChange={e => setType(e.target.value)} style={{ ...S.select, width: "100%" }}>{["回款通报", "处置进展", "季度报告", "其他"].map(s => <option key={s}>{s}</option>)}</select></Field>
      <Field label="内容"><textarea value={content} onChange={e => setContent(e.target.value)} rows={4} style={{ ...S.input, resize: "vertical" }} /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}><button onClick={() => setShow(false)} style={S.btnG}>取消</button><button onClick={post} style={S.btn()}>发布</button></div>
    </Modal>
  </div>;
};

/* Benchmark */
const CompanyBm = ({ bm, setBm }) => <div>
  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>行业基准设定</div>
  <div style={{ ...S.card, maxWidth: 420 }}>
    {[["industry3m", "3个月"], ["industry6m", "6个月"], ["industry12m", "12个月"]].map(([k, l]) =>
      <Field key={k} label={l + "行业平均回收率"}><div style={{ display: "flex", gap: 10, alignItems: "center" }}><input type="number" step=".01" value={bm[k]} onChange={e => setBm({ ...bm, [k]: +e.target.value })} style={{ ...S.input, width: 120 }} /><span style={{ fontSize: 13, color: T.tm }}>{pct(bm[k])}</span></div></Field>)}
    <button style={{ ...S.btn(), marginTop: 8 }}>保存</button>
  </div>
</div>;

/* ================================================================
   INVESTOR VIEWS
   ================================================================ */

/* Multi-package summary */
const InvSummary = ({ pkgs, inv, allInv }) => {
  const mobile = useIsMobile();
  const myPkgs = pkgs.filter(p => inv.share[p.id]);
  const totals = myPkgs.reduce((acc, p) => { const r = calcR(p, inv); if (!r) return acc; return { cap: acc.cap + r.cap, my: acc.my + r.my, tot: acc.tot + r.tot * r.sh, gap: acc.gap + r.gap, profit: acc.profit + r.profit }; }, { cap: 0, my: 0, tot: 0, gap: 0, profit: 0 });
  const overallDpi = totals.cap > 0 ? totals.my / totals.cap : 0;
  const overallPb = overallDpi >= 1;
  const weeklyAvg = myPkgs.reduce((s, p) => { const r = calcR(p, inv); return s + (r && p.payments.length ? r.my / p.payments.length : 0); }, 0);
  const estWeeks = overallPb || weeklyAvg <= 0 ? 0 : Math.ceil(totals.gap / weeklyAvg);

  return <div>
    <div style={{ fontSize: 20, fontWeight: 700 }}>投资总览</div>
    <Stamp />

    {/* Big card */}
    <div style={{ ...S.card, padding: mobile ? 20 : 28, marginBottom: 16, background: `linear-gradient(135deg, ${T.blueBg}, ${T.white})`, border: `1px solid ${T.blueBd}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, color: T.tm, fontWeight: 500, marginBottom: 8 }}>综合回款进度</div>
          <div style={{ ...S.big(T.blue), fontSize: mobile ? 32 : 40 }}>{pct(overallDpi)}</div>
          <div style={{ width: "100%", height: 12, background: "#bfdbfe40", borderRadius: 12, marginTop: 12 }}>
            <div style={{ width: `${Math.min(overallDpi * 100, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${T.blue}, ${T.blueL})`, borderRadius: 12, transition: "width .6s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: T.tm }}><span>总投入 ¥{fmtF(Math.round(totals.cap))}</span><span>总回款 ¥{fmtF(Math.round(totals.my))}</span></div>
        </div>
        <div style={{ textAlign: mobile ? "left" : "right" }}>
          {overallPb ? <div style={S.tag(T.green)}>已回本</div> : <div style={S.tag(T.amber)}>回本中</div>}
          <div style={{ fontSize: 14, color: T.body, marginTop: 6 }}>
            {overallPb ? <>已额外收回 <b style={{ color: T.green }}>¥{fmtF(Math.round(totals.profit))}</b></> : <>距回本还需 <b style={{ color: T.amber }}>¥{fmtF(Math.round(totals.gap))}</b></>}
          </div>
          {!overallPb && estWeeks > 0 && <div style={{ fontSize: 12, color: T.td, marginTop: 4 }}>按当前速率预计约 <b style={{ color: T.blue }}>{estWeeks}周</b> 回本</div>}
        </div>
      </div>
    </div>

    {/* Key metrics */}
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
      {[["DPI（分配倍数）", overallDpi.toFixed(2) + "x", overallDpi >= 1 ? T.green : T.blue], ["总投入", "¥" + fmtF(Math.round(totals.cap)), T.text], ["累计净回款", "¥" + fmtF(Math.round(totals.my)), T.green], ["参与资产包", myPkgs.length + "个", T.purple]].map(([l, v, c], i) =>
        <div key={i} style={S.card}><div style={{ fontSize: 11, color: T.td, marginBottom: 6, fontWeight: 500 }}>{l}</div><div style={{ fontSize: mobile ? 18 : 22, fontWeight: 700, color: c, fontFamily: mono }}>{v}</div></div>
      )}
    </div>

    {/* Per-package breakdown */}
    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>各资产包明细</div>
    {myPkgs.map(p => { const r = calcR(p, inv); if (!r) return null; const due = p.loans.reduce((s, l) => s + l.totalDue, 0); const rec = p.loans.reduce((s, l) => s + l.recovered, 0);
      return <div key={p.id} style={{ ...S.card, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <div><b>{p.name}</b><span style={{ fontSize: 12, color: T.tm, marginLeft: 8 }}>{p.source}</span></div>
          {r.pb ? <span style={S.tag(T.green)}>已回本</span> : <span style={S.tag(T.amber)}>回本中 {pct(r.dpi)}</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: 10 }}>
          {[["我的投入", "¥" + fmtF(Math.round(r.cap))], ["净回款", "¥" + fmtF(Math.round(r.my)), T.green], ["DPI", r.dpi.toFixed(2) + "x", r.pb ? T.green : T.blue], ["份额", pct(r.sh), T.blue], ["包回收率", pct(due > 0 ? rec / due : 0), T.amber]].map(([l, v, c], i) =>
            <div key={i}><div style={{ fontSize: 11, color: T.td }}>{l}</div><div style={{ fontSize: 14, fontWeight: 600, color: c || T.text, fontFamily: mono, marginTop: 2 }}>{v}</div></div>)}
        </div>
        {!r.pb && r.weeksToPayback > 0 && <div style={{ fontSize: 12, color: T.td, marginTop: 8 }}>预计约 {r.weeksToPayback} 周回本 · 还需 ¥{fmtF(Math.round(r.gap))}</div>}
      </div>;
    })}

    {/* Other investors */}
    {(() => { const others = allInv.filter(x => x.id !== inv.id); return others.length > 0 ? <div style={{ padding: "10px 14px", background: T.bg3, borderRadius: 8, fontSize: 12, color: T.tm, marginTop: 12 }}>其他投资者：{others.map((o, i) => <span key={o.id}>{o.name}{i < others.length - 1 ? " · " : ""}</span>)}</div> : null; })()}
  </div>;
};

/* Single package detail */
const InvDetail = ({ pkg, inv }) => {
  const mobile = useIsMobile();
  const r = calcR(pkg, inv); if (!r) return null;
  const rawCounts = {}; pkg.loans.forEach(l => { const s = l.status === "失联" ? "处置中" : l.status; rawCounts[s] = (rawCounts[s] || 0) + 1; });
  const pieData = Object.entries(rawCounts).map(([k, v]) => ({ name: k, value: v }));
  const pieColors = { "已回款": T.green, "协商中": T.amber, "承诺还款": T.purple, "未触达": "#94a3b8", "处置中": T.coral, "诉讼中": T.coral };
  const pieLabel = ({ name, value, cx, x, y }) => <text x={x} y={y} fill={T.body} fontSize={11} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">{name} {value}笔</text>;
  const curveData = pkg.payments.map((p) => ({ w: p.weekLabel, 已回款: Math.round(p.cumulative * r.sh * (1 - r.tfr)) }));

  return <div>
    <div style={{ fontSize: 20, fontWeight: 700 }}>{pkg.name}</div>
    <Stamp />

    {/* Fee */}
    <div style={{ ...S.card, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><span style={{ fontSize: 14, fontWeight: 600 }}>费用明细</span><span style={S.tag(T.td)}>合同锁定</span></div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
        {[["回款总额(我的份额)", "¥" + fmtF(Math.round(r.tot * r.sh)), T.text], ["处置费 " + pct(pkg.feeRates.disposal), "-¥" + fmtF(Math.round(r.dFee)), T.coral], ["平台费 " + pct(pkg.feeRates.platform), "-¥" + fmtF(Math.round(r.pFee)), T.amber], ["GP费 " + pct(pkg.feeRates.gp), "-¥" + fmtF(Math.round(r.gFee)), T.purple]].map(([l, v, c], i) =>
          <div key={i}><div style={{ fontSize: 11, color: T.td }}>{l}</div><div style={{ fontSize: 15, fontWeight: 600, color: c, fontFamily: mono, marginTop: 3 }}>{v}</div></div>)}
      </div>
    </div>

    {/* Charts */}
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "3fr 2fr", gap: 16, marginBottom: 16 }}>
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>回款趋势</div>
        <ResponsiveContainer width="100%" height={mobile ? 200 : 240}>
          <AreaChart data={curveData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.blue} stopOpacity={.15} /><stop offset="95%" stopColor={T.blue} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.borderL} /><XAxis dataKey="w" tick={{ fontSize: 10, fill: T.td }} interval={3} /><YAxis tick={{ fontSize: 10, fill: T.td }} tickFormatter={v => fmt(v)} />
            <Tooltip contentStyle={tipS} formatter={v => `¥${fmtF(v)}`} />
            <ReferenceLine y={r.cap} stroke={T.red} strokeDasharray="6 4" strokeOpacity={.35} label={{ value: "本金", position: "right", fontSize: 10, fill: T.red }} />
            <Area type="monotone" dataKey="已回款" stroke={T.blue} fill="url(#gB)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>催收状态</div>
        <ResponsiveContainer width="100%" height={mobile ? 200 : 240}>
          <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={mobile ? 60 : 70} innerRadius={0} paddingAngle={2} strokeWidth={1} stroke={T.white} label={pieLabel} labelLine={{ stroke: T.td, strokeWidth: 0.5 }}>
            {pieData.map((d, i) => <Cell key={i} fill={pieColors[d.name] || T.td} />)}
          </Pie><Tooltip contentStyle={tipS} /></PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>;
};

/* Capital account + flow */
const InvFlow = ({ pkg, inv }) => {
  const mobile = useIsMobile();
  const sh = inv.share[pkg.id]; if (!sh) return null;
  const cap = inv.capital[pkg.id] || pkg.purchasePrice * sh;
  const tfr = pkg.feeRates.disposal + pkg.feeRates.platform + pkg.feeRates.gp; let cum = 0;
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>资本账户</div>
      <button onClick={() => window.print()} style={S.btn(T.purple)}>📄 导出PDF</button>
    </div>
    <Stamp />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
      {[["投入本金", "¥" + fmtF(Math.round(cap)), T.text], ["累计净回款", "¥" + fmtF(Math.round(pkg.payments.reduce((s, p) => s + p.amount * sh * (1 - tfr), 0))), T.green], ["期末余额", "¥" + fmtF(Math.round(pkg.payments.reduce((s, p) => s + p.amount * sh * (1 - tfr), 0) - cap)), (() => { const v = pkg.payments.reduce((s, p) => s + p.amount * sh * (1 - tfr), 0) - cap; return v >= 0 ? T.green : T.amber; })()]].map(([l, v, c], i) =>
        <div key={i} style={S.card}><div style={{ fontSize: 11, color: T.td, marginBottom: 4 }}>{l}</div><div style={{ fontSize: 18, fontWeight: 700, color: c, fontFamily: mono }}>{v}</div></div>)}
    </div>
    <div style={{ ...S.card, padding: 0, overflow: "hidden" }}><div style={{ maxHeight: 500, overflowY: "auto" }}><table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
      <thead><tr>{(mobile ? ["周次", "净回款", "累计"] : ["周次", "日期", "周回款", "扣费", "净回款", "累计净回款"]).map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pkg.payments.map((p, i) => { const g = Math.round(p.amount * sh), f = Math.round(p.amount * sh * tfr), n = g - f; cum += n;
        return <tr key={i} onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = ""}>
          <td style={{ ...S.td, fontWeight: 600 }}>{p.weekLabel}</td>
          {!mobile && <><td style={{ ...S.td, fontSize: 12, color: T.tm }}>{p.date}</td><td style={{ ...S.td, fontFamily: mono }}>¥{fmtF(g)}</td><td style={{ ...S.td, fontFamily: mono, color: T.red }}>-¥{fmtF(f)}</td></>}
          <td style={{ ...S.td, fontFamily: mono, color: T.green }}>¥{fmtF(n)}</td>
          <td style={{ ...S.td, fontFamily: mono, fontWeight: 600, color: T.blue }}>¥{fmtF(Math.round(cum))}</td>
        </tr>; })}</tbody>
    </table></div></div>
  </div>;
};

/* Loans (masked) */
const invStatusDisplay = s => s === "失联" ? "处置中" : s;
const INV_STS = ["未触达", "协商中", "承诺还款", "已回款", "处置中", "诉讼中"];
const InvLoans = ({ pkg }) => {
  const mobile = useIsMobile();
  const [ft, setFt] = useState("全部"); const [q, setQ] = useState(""); const [pg, setPg] = useState(0); const PS = 15;
  const fl = pkg.loans.filter(l => { const ds = invStatusDisplay(l.status); return (ft === "全部" || ds === ft) && (!q || l.id.includes(q)); });
  const pd = fl.slice(pg * PS, (pg + 1) * PS);
  return <div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><span style={{ fontSize: 20, fontWeight: 700 }}>信贷明细</span><span style={S.tag(T.td)}>脱敏</span></div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{["全部", ...INV_STS].map(s => <button key={s} onClick={() => { setFt(s); setPg(0); }} style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${ft === s ? T.blue : T.border}`, background: ft === s ? T.blueBg : T.white, color: ft === s ? T.blue : T.tm, fontSize: 12, cursor: "pointer", fontFamily: font, fontWeight: ft === s ? 600 : 400 }}>{s}</button>)}</div>
      <input placeholder="搜索编号" value={q} onChange={e => { setQ(e.target.value); setPg(0); }} style={{ ...S.input, width: 140 }} />
    </div>
    <div style={{ ...S.card, padding: 0, overflow: "hidden" }}><div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
      <thead><tr>{(mobile ? ["姓名", "待收", "已收", "状态"] : ["编号", "姓名", "证件号", "城市", "待收", "已收", "回收率", "状态"]).map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pd.map(l => <tr key={l.id} onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = ""}>
        {!mobile && <td style={{ ...S.td, fontFamily: mono, fontSize: 11, color: T.td }}>{l.id}</td>}
        <td style={{ ...S.td, fontWeight: 600 }}>{maskN(l.name)}</td>
        {!mobile && <><td style={{ ...S.td, fontFamily: mono, fontSize: 11 }}>{maskId(l.idNumber)}</td><td style={S.td}>{maskAddr(l.address)}</td></>}
        <td style={{ ...S.td, fontFamily: mono }}>¥{fmtF(l.totalDue)}</td>
        <td style={{ ...S.td, fontFamily: mono, color: l.recovered > 0 ? T.green : T.td }}>¥{fmtF(l.recovered)}</td>
        {!mobile && <td style={S.td}>{pct(l.recoveryRate)}</td>}
        <td style={S.td}><Badge s={invStatusDisplay(l.status)} /></td>
      </tr>)}</tbody>
    </table></div>
    <Pager total={fl.length} page={pg} setPage={setPg} /></div>
  </div>;
};

/* Announcements (read-only) */
const InvAnnouncements = ({ ann }) => <div>
  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>公告通知</div>
  {ann.map(a => <div key={a.id} style={{ ...S.card, marginBottom: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={S.tag(T.blue)}>{a.type}</span><b style={{ fontSize: 14 }}>{a.title}</b><span style={{ fontSize: 12, color: T.td, marginLeft: "auto" }}>{a.date}</span></div>
    <div style={{ fontSize: 13, color: T.body, lineHeight: 1.7 }}>{a.content}</div>
  </div>)}
  {ann.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.td }}>暂无公告</div>}
</div>;

/* Document center (filtered by investor) */
const InvDocs = ({ docs, invId, inv }) => {
  const myPkgs = inv ? Object.keys(inv.share) : [];
  const myDocs = docs.filter(d => d.forAll || d.forInv === invId || (d.forPkg && myPkgs.includes(d.forPkg)));
  return <div>
    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>文档中心</div>
    {myDocs.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.td }}>暂无相关文档</div>}
    {myDocs.length > 0 && <div style={{ ...S.card, padding: 0 }}>
      {myDocs.map((d, i) => <div key={d.id} style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < myDocs.length - 1 ? `1px solid ${T.borderL}` : "none" }} onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = ""}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>📄</span>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 12, color: T.td }}>{d.type} · {d.date} · {d.size}</div></div>
        </div>
        <button style={S.btnSm(T.blue)}>下载</button>
      </div>)}
    </div>}
  </div>;
};

/* ================================================================
   MAIN APP
   ================================================================ */
const CTABS = [["dash", "运营概览"], ["pkgs", "资产包管理"], ["loans", "信贷明细"], ["invs", "投资者管理"], ["ann", "公告管理"], ["bm", "行业基准"]];
const ITABS = [["summary", "投资总览"], ["detail", "资产包详情"], ["flow", "资本账户"], ["loans", "信贷明细"], ["ann", "公告通知"], ["docs", "文档中心"]];

export default function App() {
  useEffect(() => { if (!document.getElementById("nf")) { const l = document.createElement("link"); l.id = "nf"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"; document.head.appendChild(l); } }, []);
  const mobile = useIsMobile();
  const [role, setRole] = useState(null); const [invId, setInvId] = useState("inv1");
  const [pkgs, setPkgs] = useState(initPkgs); const [investors, setInvestors] = useState(initInvestors); const [bm, setBm] = useState(initBm);
  const [ann, setAnn] = useState(initAnnouncements); const [docs] = useState(initDocs);
  const [logs, setLogs] = useState([]);
  const [ct, setCt] = useState("dash"); const [it, setIt] = useState("summary"); const [sp, setSp] = useState(0);
  const [loginTab, setLoginTab] = useState("company"); const [pw, setPw] = useState(""); const [invPw, setInvPw] = useState(""); const [loginInvId, setLoginInvId] = useState("inv1"); const [err, setErr] = useState(""); const [showForgot, setShowForgot] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);

  const addLog = action => setLogs(v => [...v, { action, time: new Date().toLocaleString("zh-CN") }]);

  const handleLogin = () => {
    if (loginTab === "company") { if (pw === "admin888") { setRole("company"); setErr(""); setPw(""); } else setErr("管理密码错误"); }
    else { const f = investors.find(i => i.id === loginInvId); if (f && invPw === f.password) { setRole("investor"); setInvId(loginInvId); setErr(""); setInvPw(""); } else setErr("密码错误"); }
  };

  /* Login */
  if (!role) return <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, color: T.text, padding: 16 }}>
    <div style={{ width: 400, maxWidth: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${T.blue},${T.purple})`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>NPL Asset Tracker</div>
        <div style={{ fontSize: 13, color: T.tm, marginTop: 4 }}>不良资产投资管理平台</div>
      </div>
      <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.05)" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
          {[["company", "公司管理端"], ["investor", "投资者端"]].map(([k, l]) =>
            <button key={k} onClick={() => { setLoginTab(k); setErr(""); }} style={{ flex: 1, padding: "13px 0", background: "transparent", color: loginTab === k ? T.blue : T.td, border: "none", fontSize: 14, fontWeight: loginTab === k ? 600 : 400, cursor: "pointer", fontFamily: font, borderBottom: loginTab === k ? `2px solid ${T.blue}` : "2px solid transparent" }}>{l}</button>)}
        </div>
        <div style={{ padding: "28px 24px" }}>
          {loginTab === "company" ? <>
            <Field label="管理密码"><input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="请输入管理密码" style={S.input} /></Field>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}><div style={{ fontSize: 11, color: T.td, padding: "4px 8px", background: T.bg3, borderRadius: 6 }}>演示: admin888</div><button onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: T.blue, fontSize: 12, cursor: "pointer", fontFamily: font }}>忘记密码？</button></div>
            <button onClick={handleLogin} style={{ ...S.btn(), width: "100%", padding: "10px 0", fontSize: 14 }}>登录</button>
          </> : <>
            <Field label="选择账户"><select value={loginInvId} onChange={e => setLoginInvId(e.target.value)} style={{ ...S.select, width: "100%" }}>{investors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></Field>
            <Field label="密码"><input type="password" value={invPw} onChange={e => setInvPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="请输入密码" style={S.input} /></Field>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}><div style={{ fontSize: 11, color: T.td, padding: "4px 8px", background: T.bg3, borderRadius: 6 }}>演示: dingxin123 / hengda123 / wang123</div><button onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: T.blue, fontSize: 12, cursor: "pointer", fontFamily: font }}>忘记密码？</button></div>
            <button onClick={handleLogin} style={{ ...S.btn(T.teal), width: "100%", padding: "10px 0", fontSize: 14 }}>登录</button>
          </>}
          {err && <div style={{ marginTop: 12, fontSize: 13, color: T.red, textAlign: "center", padding: 8, background: T.redBg, borderRadius: 8 }}>{err}</div>}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: T.td }}>© 2025 NPL Asset Tracker</div>
      <Modal open={showForgot} onClose={() => setShowForgot(false)} title="忘记密码">
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 14, color: T.body }}>请联系管理员重置密码</div>
          <div style={{ fontSize: 13, color: T.tm, marginTop: 4 }}>电话：400-XXX-XXXX</div>
          <div style={{ fontSize: 13, color: T.tm }}>邮箱：admin@npltracker.com</div>
          <button onClick={() => setShowForgot(false)} style={{ ...S.btn(), marginTop: 16 }}>知道了</button>
        </div>
      </Modal>
    </div>
  </div>;

  /* Main */
  const isC = role === "company"; const tabs = isC ? CTABS : ITABS; const at = isC ? ct : it; const setAt = isC ? setCt : setIt;
  const curInv = investors.find(i => i.id === invId);
  const invPkgs = curInv ? pkgs.filter(p => curInv.share[p.id]) : pkgs; const curPkg = invPkgs[sp] || invPkgs[0];

  const content = () => {
    if (isC) { switch (ct) { case "dash": return <CompanyDash pkgs={pkgs} investors={investors} logs={logs} />; case "pkgs": return <CompanyPkgs pkgs={pkgs} setPkgs={setPkgs} addLog={addLog} />; case "loans": return <CompanyLoans pkgs={pkgs} setPkgs={setPkgs} addLog={addLog} />; case "invs": return <CompanyInvs investors={investors} setInvestors={setInvestors} pkgs={pkgs} addLog={addLog} />; case "ann": return <CompanyAnnouncements ann={ann} setAnn={setAnn} addLog={addLog} />; case "bm": return <CompanyBm bm={bm} setBm={setBm} />; } }
    else { if (!curPkg && it !== "summary" && it !== "ann" && it !== "docs") return <div style={{ textAlign: "center", padding: 60, color: T.td }}>暂无资产包</div>; switch (it) { case "summary": return <InvSummary pkgs={pkgs} inv={curInv} allInv={investors} />; case "detail": return <InvDetail pkg={curPkg} inv={curInv} />; case "flow": return <InvFlow pkg={curPkg} inv={curInv} />; case "loans": return <InvLoans pkg={curPkg} />; case "ann": return <InvAnnouncements ann={ann} />; case "docs": return <InvDocs docs={docs} invId={invId} inv={curInv} />; } }
  };

  const sidebarContent = <>
    <div style={{ padding: "0 20px 14px", fontSize: 11, color: T.sideT, letterSpacing: ".06em", fontWeight: 500 }}>{isC ? "管理菜单" : "投资者菜单"}</div>
    {tabs.map(([k, l]) => <div key={k} onClick={() => { setAt(k); setSideOpen(false); }} style={{ padding: "11px 20px", fontSize: 13, cursor: "pointer", color: at === k ? T.sideA : T.sideT, background: at === k ? "rgba(255,255,255,.08)" : "transparent", borderLeft: at === k ? `3px solid ${isC ? T.blueL : T.teal}` : "3px solid transparent", fontWeight: at === k ? 600 : 400 }}>{l}</div>)}
    {!isC && curInv && <div style={{ margin: "20px 20px 0", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,.1)" }}>
      <div style={{ fontSize: 11, color: T.sideT, marginBottom: 4 }}>当前身份</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.sideA }}>{curInv.name}</div>
    </div>}
  </>;

  return <div style={{ fontFamily: font, background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div onClick={() => setSideOpen(!sideOpen)} style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${T.blue},${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "opacity .15s" }} onMouseEnter={e => e.currentTarget.style.opacity = ".8"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg></div>
        {!mobile && <span style={{ fontSize: 15, fontWeight: 700 }}>NPL Asset Tracker</span>}
        <span style={{ fontSize: 11, fontWeight: 600, color: isC ? T.blue : T.teal, padding: "2px 8px", background: isC ? T.blueBg : T.greenBg, borderRadius: 6 }}>{isC ? "管理端" : "投资者"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {!isC && invPkgs.length > 1 && (it === "detail" || it === "flow" || it === "loans") && <select value={sp} onChange={e => setSp(+e.target.value)} style={{ ...S.select, fontSize: 12, padding: "6px 8px" }}>{invPkgs.map((p, i) => <option key={i} value={i}>{mobile ? p.name.slice(0, 6) + ".." : p.name}</option>)}</select>}
        {!isC && <span style={{ fontSize: 13, fontWeight: 500, color: T.body }}>{curInv?.name}</span>}
        <button onClick={() => { setRole(null); setCt("dash"); setIt("summary"); setSp(0); setSideOpen(false); }} style={{ ...S.btnG, fontSize: 12, padding: "4px 12px" }}>退出</button>
      </div>
    </div>
    <div style={{ display: "flex", flex: 1, position: "relative" }}>
      {mobile ? (sideOpen && <><div onClick={() => setSideOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 200 }} /><div style={{ position: "fixed", left: 0, top: 52, bottom: 0, width: 220, background: T.sidebar, zIndex: 201, padding: "16px 0", overflowY: "auto" }}>{sidebarContent}</div></>)
        : (sideOpen && <div style={{ width: 200, background: T.sidebar, padding: "16px 0", flexShrink: 0, minHeight: "calc(100vh - 52px)", transition: "width .2s" }}>{sidebarContent}</div>)}
      <div style={{ flex: 1, padding: mobile ? 16 : 28, overflowY: "auto", maxHeight: "calc(100vh - 52px)" }}>{content()}</div>
    </div>
  </div>;
}
