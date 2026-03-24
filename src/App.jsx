import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, PieChart, Pie, Cell, Legend, ReferenceLine } from "recharts";

/* ================================================================
   THEME
   ================================================================ */
const T = {
  bg: "#f4f5f7", white: "#ffffff", bg3: "#f9fafb", hover: "#f0f2f5",
  border: "#e5e7eb", borderL: "#f0f1f3",
  text: "#111827", body: "#374151", tm: "#6b7280", td: "#9ca3af",
  blue: "#2563eb", blueL: "#3b82f6", blueBg: "#eff6ff", blueBd: "#bfdbfe",
  green: "#059669", greenL: "#10b981", greenBg: "#ecfdf5", greenBd: "#a7f3d0",
  red: "#dc2626", redBg: "#fef2f2",
  amber: "#d97706", amberBg: "#fffbeb", amberBd: "#fde68a",
  purple: "#7c3aed", coral: "#ea580c", teal: "#0d9488",
  sidebar: "#111827", sideT: "#9ca3af", sideA: "#ffffff",
};
const font = '"Noto Sans SC","DM Sans",-apple-system,sans-serif';
const mono = '"DM Sans",monospace';

/* ================================================================
   DATA GENERATION
   ================================================================ */
const surnames = ["张","李","王","刘","陈","杨","赵","黄","周","吴","徐","孙","胡","朱","高","林","何","郭","马","罗"];
const gnames = ["伟","芳","娜","秀英","敏","静","丽","强","磊","军","洋","勇","艳","杰","娟","涛","明","超","秀兰","霞"];
const cities = ["北京市","上海市","广州市","深圳市","杭州市","成都市","武汉市","南京市","重庆市","天津市"];
const statusOpts = ["未触达","协商中","承诺还款","已回款","失联","诉讼中"];
const rn = a => a[Math.floor(Math.random() * a.length)];
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function genLoans(pid, n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const nm = rn(surnames) + rn(gnames) + (Math.random() > .5 ? rn(gnames) : "");
    const g = Math.random() > .45 ? "男" : "女";
    const o = ri(5, 800) * 100, od = Math.round(o * (.8 + Math.random() * .2)), oi = Math.round(o * (.05 + Math.random() * .3)), td = od + oi;
    const st = rn(statusOpts);
    const rec = st === "已回款" ? Math.round(td * (.2 + Math.random() * .6)) : st === "承诺还款" ? Math.round(td * Math.random() * .2) : st === "协商中" ? Math.round(td * Math.random() * .1) : 0;
    arr.push({ id: `${pid}-L${String(i + 1).padStart(4, "0")}`, name: nm, gender: g, idNumber: `${ri(110000, 650000)}${ri(1970, 2005)}${String(ri(1, 12)).padStart(2, "0")}${String(ri(1, 28)).padStart(2, "0")}${ri(1000, 9999)}`, phone: `1${ri(3, 8)}${ri(100000000, 999999999)}`, city: rn(cities), address: `${rn(cities)}某区某路${ri(1, 200)}号`, originalAmount: o, overduePrincipal: od, overdueInterest: oi, totalDue: td, recovered: rec, recoveryRate: td > 0 ? rec / td : 0, status: st, lastContact: `2025-${String(ri(4, 9)).padStart(2, "0")}-${String(ri(1, 28)).padStart(2, "0")}` });
  }
  return arr;
}

function genWeekly(loans, w = 28) {
  const tot = loans.reduce((s, l) => s + l.recovered, 0);
  let c = 0; const arr = [];
  for (let i = 1; i <= w; i++) {
    const f = Math.max(.01, 1 - (i / w) * .7);
    const amt = Math.round(Math.max(0, Math.min((tot / w) * f * (1 + (Math.random() - .3) * .5) * 2, tot - c)));
    c += amt; if (c > tot) c = tot;
    arr.push({ week: i, weekLabel: `第${i}周`, amount: amt, cumulative: c, date: `2025-${String(3 + Math.floor((i - 1) / 4)).padStart(2, "0")}-${String(((i - 1) % 4) * 7 + 1).padStart(2, "0")}` });
  }
  if (arr.length && arr[arr.length - 1].cumulative < tot) { arr[arr.length - 1].amount += tot - arr[arr.length - 1].cumulative; arr[arr.length - 1].cumulative = tot; }
  return arr;
}

const initPkgs = [
  { id: "PKG-2025-001", name: "华东个贷不良资产包A", source: "东方资产管理", purchaseDate: "2025-03-15", faceValue: 8500000, purchasePrice: 500000, status: "处置中", feeRates: { disposal: .08, platform: .03, gp: .02 }, loans: genLoans("PKG001", 86) },
  { id: "PKG-2025-002", name: "华南消费贷不良资产包B", source: "长城资产管理", purchaseDate: "2025-06-01", faceValue: 12000000, purchasePrice: 480000, status: "处置中", feeRates: { disposal: .07, platform: .03, gp: .025 }, loans: genLoans("PKG002", 120) },
];
initPkgs.forEach(p => { p.loanCount = p.loans.length; p.discountRate = p.purchasePrice / p.faceValue; p.payments = genWeekly(p.loans); });

const initInvestors = [
  { id: "inv1", name: "张伟", share: { "PKG-2025-001": .45, "PKG-2025-002": .55 }, capital: { "PKG-2025-001": 225000, "PKG-2025-002": 264000 }, phone: "13812345678", contractDate: "2025-03-01", password: "zhang123" },
  { id: "inv2", name: "李芳", share: { "PKG-2025-001": .35, "PKG-2025-002": .45 }, capital: { "PKG-2025-001": 175000, "PKG-2025-002": 216000 }, phone: "13987654321", contractDate: "2025-03-05", password: "li123" },
  { id: "inv3", name: "王强", share: { "PKG-2025-001": .20 }, capital: { "PKG-2025-001": 100000 }, phone: "13611112222", contractDate: "2025-03-10", password: "wang123" },
];
const initBm = { industry3m: .15, industry6m: .32, industry12m: .55 };

/* ================================================================
   UTILS
   ================================================================ */
const maskN = n => n ? n[0] + "**" : "**";
const maskAddr = a => { const m = a?.match(/(.*?市)/); return m ? m[1] : ""; };
const fmt = n => n >= 10000 ? (n / 10000).toFixed(2) + "万" : n.toLocaleString("zh-CN");
const fmtF = n => Math.round(n).toLocaleString("zh-CN");
const pct = n => (n * 100).toFixed(2) + "%";

function calcR(pkg, inv) {
  const sh = inv.share[pkg.id]; if (!sh) return null;
  const cap = inv.capital[pkg.id] || pkg.purchasePrice * sh;
  const tot = pkg.loans.reduce((s, l) => s + l.recovered, 0);
  const fr = pkg.feeRates, tfr = fr.disposal + fr.platform + fr.gp;
  const net = tot * (1 - tfr), my = net * sh;
  const ratio = cap > 0 ? my / cap : 0;
  return { cap, tot, tfr, net, my, ratio: Math.min(ratio, 10), profit: my - cap, pb: ratio >= 1, gap: Math.max(0, cap - my), sh, dFee: tot * fr.disposal * sh, pFee: tot * fr.platform * sh, gFee: tot * fr.gp * sh };
}

/* ================================================================
   RESPONSIVE HOOK
   ================================================================ */
function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => { const h = () => setM(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return m;
}

/* ================================================================
   STYLES
   ================================================================ */
const tooltipStyle = { background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 12, color: T.text, boxShadow: "0 4px 12px rgba(0,0,0,.08)" };

const S = {
  btn: c => ({ padding: "8px 20px", borderRadius: 8, border: "none", background: c || T.blue, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: font }),
  btnSm: c => ({ padding: "5px 14px", borderRadius: 6, border: "none", background: c || T.blue, color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: font }),
  btnG: { padding: "5px 14px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.white, color: T.body, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: font },
  input: { background: T.white, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: font, outline: "none", width: "100%", boxSizing: "border-box" },
  select: { background: T.white, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: font, outline: "none", cursor: "pointer" },
  card: { background: T.white, borderRadius: 12, border: `1px solid ${T.border}`, padding: 20, boxShadow: "0 1px 2px rgba(0,0,0,.03)" },
  th: { padding: "10px 14px", textAlign: "left", fontWeight: 600, color: T.tm, borderBottom: `1px solid ${T.border}`, fontSize: 11, letterSpacing: ".04em", background: T.bg3 },
  td: { padding: "10px 14px", borderBottom: `1px solid ${T.borderL}`, color: T.body, fontSize: 13 },
  badge: c => ({ display: "inline-block", padding: "3px 12px", borderRadius: 50, fontSize: 11, fontWeight: 600, background: c + "12", color: c }),
  tag: c => ({ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: c + "10", color: c }),
  big: (c = T.text) => ({ fontSize: 28, fontWeight: 700, color: c, fontFamily: mono, letterSpacing: "-.02em" }),
};

/* ================================================================
   MICRO COMPONENTS
   ================================================================ */
const Badge = ({ s }) => { const c = { "未触达": T.td, "协商中": T.amber, "承诺还款": T.purple, "已回款": T.green, "失联": T.red, "诉讼中": T.coral }; return <span style={S.badge(c[s] || T.td)}>{s}</span>; };

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
    <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: "28px 24px", width: 560, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.12)" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>{title}</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.td, fontSize: 22, cursor: "pointer", fontFamily: font }}>✕</button>
      </div>{children}
    </div>
  </div>;
};

const Field = ({ label, children }) => <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: T.tm, display: "block", marginBottom: 5, fontWeight: 500 }}>{label}</label>{children}</div>;

/* ================================================================
   EXCEL IMPORT
   ================================================================ */
const ExcelImport = ({ onImport, pkgId }) => {
  const [drag, setDrag] = useState(false); const [preview, setPreview] = useState(null); const [mapping, setMapping] = useState({}); const ref = useRef();
  const FIELDS = [["name", "姓名"], ["gender", "性别"], ["idNumber", "身份证号"], ["phone", "手机号"], ["city", "城市"], ["address", "地址"], ["overduePrincipal", "逾期本金"], ["overdueInterest", "逾期利息"], ["status", "催收状态"]];

  const parseCSV = text => {
    const lines = text.split(/\r?\n/).filter(l => l.trim()); if (lines.length < 2) return;
    const headers = lines[0].split(/[,\t]/).map(h => h.replace(/["']/g, "").trim());
    const rows = lines.slice(1).map(l => { const vals = l.split(/[,\t]/).map(v => v.replace(/["']/g, "").trim()); const obj = {}; headers.forEach((h, i) => obj[h] = vals[i] || ""); return obj; });
    const autoMap = {};
    FIELDS.forEach(([k, cn]) => { const found = headers.find(h => h.includes(cn) || h.toLowerCase().includes(k.toLowerCase())); if (found) autoMap[k] = found; });
    setMapping(autoMap); setPreview({ headers, rows, count: rows.length });
  };

  const handleFile = file => {
    if (!file) return; const reader = new FileReader();
    if (file.name.endsWith(".csv") || file.name.endsWith(".tsv") || file.name.endsWith(".txt")) { reader.onload = e => parseCSV(e.target.result); reader.readAsText(file, "utf-8"); }
    else { reader.onload = e => { import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm").then(XLSX => { const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" }); const ws = wb.Sheets[wb.SheetNames[0]]; parseCSV(XLSX.utils.sheet_to_csv(ws)); }).catch(() => parseCSV(e.target.result)); }; reader.readAsArrayBuffer(file); }
  };

  const doImport = () => {
    if (!preview) return;
    const loans = preview.rows.map((row, i) => {
      const g = k => row[mapping[k]] || "";
      const od = parseFloat(g("overduePrincipal")) || 0, oi = parseFloat(g("overdueInterest")) || 0;
      return { id: `${pkgId}-L${String(i + 1).padStart(4, "0")}`, name: g("name"), gender: g("gender") || "男", idNumber: g("idNumber"), phone: g("phone"), city: g("city"), address: g("address"), originalAmount: 0, overduePrincipal: od, overdueInterest: oi, totalDue: od + oi, recovered: 0, recoveryRate: 0, status: g("status") || "未触达", lastContact: "" };
    }).filter(l => l.name);
    onImport(loans); setPreview(null);
  };

  return <div>
    <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}
      style={{ border: `2px dashed ${drag ? T.blue : T.border}`, borderRadius: 12, padding: "36px 20px", textAlign: "center", cursor: "pointer", background: drag ? T.blueBg : T.bg3, transition: "all .2s" }}>
      <input ref={ref} type="file" accept=".xlsx,.xls,.csv,.tsv" onChange={e => handleFile(e.target.files[0])} style={{ display: "none" }} />
      <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>拖拽 Excel/CSV 文件到这里</div>
      <div style={{ fontSize: 12, color: T.tm, marginTop: 4 }}>支持 .xlsx .xls .csv</div>
    </div>
    {preview && <div style={{ marginTop: 20 }}>
      <div style={{ padding: 12, background: T.greenBg, borderRadius: 8, border: `1px solid ${T.greenBd}`, marginBottom: 16 }}>
        <b style={{ color: T.green }}>识别到 {preview.count} 条记录</b>
        <span style={{ color: T.tm, marginLeft: 8 }}>| {preview.headers.slice(0, 5).join(", ")}{preview.headers.length > 5 ? "..." : ""}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>列映射</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {FIELDS.map(([k, cn]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: T.tm, width: 80 }}>{cn}</span>
          <select value={mapping[k] || ""} onChange={e => setMapping({ ...mapping, [k]: e.target.value })} style={{ ...S.select, flex: 1, fontSize: 12, padding: "5px 8px" }}>
            <option value="">-- 选择 --</option>{preview.headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <button onClick={() => setPreview(null)} style={S.btnG}>取消</button>
        <button onClick={doImport} style={S.btn(T.green)}>确认导入 {preview.count} 条</button>
      </div>
    </div>}
  </div>;
};

/* ================================================================
   COMPANY VIEWS
   ================================================================ */
const CompanyDash = ({ pkgs, investors }) => {
  const mobile = useIsMobile();
  const tr = pkgs.reduce((s, p) => s + p.loans.reduce((ss, l) => ss + l.recovered, 0), 0);
  const td2 = pkgs.reduce((s, p) => s + p.loans.reduce((ss, l) => ss + l.totalDue, 0), 0);
  const stats = [["资产包", pkgs.length + "个", T.blue], ["信贷笔数", pkgs.reduce((s, p) => s + p.loanCount, 0) + "笔", T.teal], ["投资者", investors.length + "人", T.purple], ["累计回款", "¥" + fmt(tr), T.green], ["购入成本", "¥" + fmt(pkgs.reduce((s, p) => s + p.purchasePrice, 0)), T.coral], ["回收率", pct(td2 > 0 ? tr / td2 : 0), T.amber]];
  return <div>
    <div style={{ fontSize: 20, fontWeight: 700 }}>运营概览</div>
    <div style={{ fontSize: 13, color: T.tm, marginTop: 3, marginBottom: 20 }}>全局经营数据</div>
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 12 }}>
      {stats.map(([l, v, c], i) => <div key={i} style={S.card}><div style={{ fontSize: 11, color: T.td, marginBottom: 6, fontWeight: 500 }}>{l}</div><div style={{ ...S.big(c), fontSize: mobile ? 18 : 22 }}>{v}</div></div>)}
    </div>
  </div>;
};

const CompanyPkgs = ({ pkgs, setPkgs }) => {
  const mobile = useIsMobile();
  const [ep, setEp] = useState(null); const [sn, setSn] = useState(false);
  const empty = { id: "PKG-2025-" + ri(100, 999), name: "", source: "", purchaseDate: "2025-10-01", faceValue: 0, purchasePrice: 0, status: "处置中", feeRates: { disposal: .08, platform: .03, gp: .02 }, loans: [], payments: [], loanCount: 0, discountRate: 0 };
  const save = (p, n) => { p.loanCount = p.loans.length; p.discountRate = p.faceValue > 0 ? p.purchasePrice / p.faceValue : 0; if (n) setPkgs(v => [...v, p]); else setPkgs(v => v.map(x => x.id === p.id ? p : x)); setEp(null); setSn(false); };
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
      <div><div style={{ fontSize: 20, fontWeight: 700 }}>资产包管理</div><div style={{ fontSize: 13, color: T.tm, marginTop: 3 }}>新增、编辑、删除</div></div>
      <button onClick={() => setSn(true)} style={S.btn()}>+ 新增</button>
    </div>
    {pkgs.map(p => { const rec = p.loans.reduce((s, l) => s + l.recovered, 0); const due = p.loans.reduce((s, l) => s + l.totalDue, 0); return <div key={p.id} style={{ ...S.card, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div><div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p.name}</div><div style={{ fontSize: 12, color: T.tm }}>{p.source} | {p.purchaseDate} | {p.loanCount}笔</div></div>
        <div style={{ display: "flex", gap: 8 }}><button onClick={() => setEp({ ...p, feeRates: { ...p.feeRates } })} style={S.btnSm()}>编辑</button><button onClick={() => { if (confirm("确认删除？")) setPkgs(v => v.filter(x => x.id !== p.id)); }} style={S.btnSm(T.red)}>删除</button></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.borderL}` }}>
        {[["面值", "¥" + fmtF(p.faceValue), T.text], ["购入价", "¥" + fmtF(p.purchasePrice), T.text], ["已回款", "¥" + fmtF(rec), T.green], ["回收率", pct(due > 0 ? rec / due : 0), T.amber]].map(([l, v, c], i) => <div key={i}><div style={{ fontSize: 11, color: T.td }}>{l}</div><div style={{ fontSize: 14, fontWeight: 600, color: c, fontFamily: mono, marginTop: 2 }}>{v}</div></div>)}
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
      <Field label="名称"><input value={d.name} onChange={e => u("name", e.target.value)} style={S.input} /></Field>
      <Field label="来源AMC"><input value={d.source} onChange={e => u("source", e.target.value)} style={S.input} /></Field>
      <Field label="购入日期"><input type="date" value={d.purchaseDate} onChange={e => u("purchaseDate", e.target.value)} style={S.input} /></Field>
      <Field label="状态"><select value={d.status} onChange={e => u("status", e.target.value)} style={{ ...S.select, width: "100%" }}>{["处置中", "已结案", "部分结案"].map(s => <option key={s}>{s}</option>)}</select></Field>
      <Field label="面值"><input type="number" value={d.faceValue} onChange={e => u("faceValue", +e.target.value)} style={S.input} /></Field>
      <Field label="购入价"><input type="number" value={d.purchasePrice} onChange={e => u("purchasePrice", +e.target.value)} style={S.input} /></Field>
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, margin: "18px 0 10px", paddingTop: 16, borderTop: `1px solid ${T.borderL}` }}>合同费率</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
      <Field label="处置服务费"><input type="number" step=".01" value={d.feeRates.disposal} onChange={e => uf("disposal", +e.target.value)} style={S.input} /></Field>
      <Field label="平台服务费"><input type="number" step=".01" value={d.feeRates.platform} onChange={e => uf("platform", +e.target.value)} style={S.input} /></Field>
      <Field label="GP管理费"><input type="number" step=".01" value={d.feeRates.gp} onChange={e => uf("gp", +e.target.value)} style={S.input} /></Field>
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}><button onClick={onClose} style={S.btnG}>取消</button><button onClick={() => onSave(d)} style={S.btn()}>保存</button></div>
  </Modal>;
};

const CompanyLoans = ({ pkgs, setPkgs }) => {
  const mobile = useIsMobile();
  const [pi, setPi] = useState(0); const [el, setEl] = useState(null); const [sn, setSn] = useState(false);
  const [pay, setPay] = useState(null); const [pa, setPa] = useState("");
  const [ft, setFt] = useState("全部"); const [q, setQ] = useState(""); const [pg, setPg] = useState(0); const [showImp, setShowImp] = useState(false);
  const PS = 15; const pkg = pkgs[pi];
  const fl = pkg.loans.filter(l => (ft === "全部" || l.status === ft) && (!q || l.name.includes(q) || l.id.includes(q)));
  const pgs = Math.ceil(fl.length / PS); const pd = fl.slice(pg * PS, (pg + 1) * PS);
  const saveLoan = (l, n) => { setPkgs(v => v.map((p, i) => { if (i !== pi) return p; const loans = n ? [...p.loans, l] : p.loans.map(x => x.id === l.id ? l : x); return { ...p, loans, loanCount: loans.length }; })); setEl(null); setSn(false); };
  const recPay = () => { const amt = parseFloat(pa); if (!amt) return; setPkgs(v => v.map((p, i) => { if (i !== pi) return p; const loans = p.loans.map(l => { if (l.id !== pay.id) return l; const r = l.recovered + amt; return { ...l, recovered: r, recoveryRate: l.totalDue > 0 ? r / l.totalDue : 0, status: r >= l.totalDue ? "已回款" : "承诺还款" }; }); const payments = [...p.payments]; if (payments.length) { const last = payments[payments.length - 1]; payments[payments.length - 1] = { ...last, amount: last.amount + amt, cumulative: last.cumulative + amt }; } return { ...p, loans, payments }; })); setPay(null); setPa(""); };
  const handleImport = loans => { setPkgs(v => v.map((p, i) => { if (i !== pi) return p; const all = [...p.loans, ...loans]; return { ...p, loans: all, loanCount: all.length, payments: genWeekly(all) }; })); setShowImp(false); };
  const emptyL = { id: `${pkg.id}-L${String(pkg.loans.length + 1).padStart(4, "0")}`, name: "", gender: "男", idNumber: "", phone: "", city: "", address: "", originalAmount: 0, overduePrincipal: 0, overdueInterest: 0, totalDue: 0, recovered: 0, recoveryRate: 0, status: "未触达", lastContact: "" };

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
      <div><div style={{ fontSize: 20, fontWeight: 700 }}>信贷明细管理</div><div style={{ fontSize: 13, color: T.tm, marginTop: 3 }}>支持 Excel 批量导入</div></div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={pi} onChange={e => { setPi(+e.target.value); setPg(0); }} style={S.select}>{pkgs.map((p, i) => <option key={i} value={i}>{p.name}</option>)}</select>
        <button onClick={() => setShowImp(true)} style={S.btn(T.teal)}>📄 导入</button>
        <button onClick={() => setSn(true)} style={S.btn()}>+ 新增</button>
      </div>
    </div>
    {showImp && <div style={{ ...S.card, marginBottom: 18 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><b>批量导入</b><button onClick={() => setShowImp(false)} style={S.btnG}>收起</button></div><ExcelImport onImport={handleImport} pkgId={pkg.id} /></div>}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{["全部", ...statusOpts].map(s => <button key={s} onClick={() => { setFt(s); setPg(0); }} style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${ft === s ? T.blue : T.border}`, background: ft === s ? T.blueBg : T.white, color: ft === s ? T.blue : T.tm, fontSize: 12, cursor: "pointer", fontFamily: font, fontWeight: ft === s ? 600 : 400 }}>{s}</button>)}</div>
      <input placeholder="搜索..." value={q} onChange={e => { setQ(e.target.value); setPg(0); }} style={{ ...S.input, width: 160 }} />
    </div>
    <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead><tr>{(mobile ? ["姓名", "待收", "已收", "状态", "操作"] : ["编号", "姓名", "性别", "身份证", "手机", "城市", "待收", "已收", "状态", "操作"]).map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{pd.map(l => <tr key={l.id} onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = ""}>
          {!mobile && <td style={{ ...S.td, fontFamily: mono, fontSize: 11, color: T.td }}>{l.id}</td>}
          <td style={{ ...S.td, fontWeight: 600 }}>{l.name}</td>
          {!mobile && <><td style={S.td}>{l.gender}</td><td style={{ ...S.td, fontFamily: mono, fontSize: 11 }}>{l.idNumber}</td><td style={{ ...S.td, fontFamily: mono, fontSize: 11 }}>{l.phone}</td><td style={S.td}>{l.city}</td></>}
          <td style={{ ...S.td, fontFamily: mono }}>¥{fmtF(l.totalDue)}</td>
          <td style={{ ...S.td, fontFamily: mono, color: l.recovered > 0 ? T.green : T.td }}>¥{fmtF(l.recovered)}</td>
          <td style={S.td}><Badge s={l.status} /></td>
          <td style={S.td}><div style={{ display: "flex", gap: 4 }}><button onClick={() => setEl({ ...l })} style={S.btnSm()}>编辑</button><button onClick={() => { setPay(l); setPa(""); }} style={S.btnSm(T.green)}>回款</button></div></td>
        </tr>)}</tbody>
      </table></div>
      <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, fontSize: 13, color: T.tm }}>
        <span>共 {fl.length} 条</span>
        <div style={{ display: "flex", gap: 6 }}><button onClick={() => setPg(Math.max(0, pg - 1))} disabled={pg === 0} style={{ ...S.btnG, opacity: pg === 0 ? .4 : 1 }}>上页</button><span style={{ padding: "2px 8px", fontSize: 12 }}>{pg + 1}/{pgs || 1}</span><button onClick={() => setPg(Math.min(pgs - 1, pg + 1))} disabled={pg >= pgs - 1} style={{ ...S.btnG, opacity: pg >= pgs - 1 ? .4 : 1 }}>下页</button></div>
      </div>
    </div>
    <LoanEd open={!!el} loan={el} onClose={() => setEl(null)} onSave={l => saveLoan(l, false)} title="编辑信贷" />
    <LoanEd open={sn} loan={emptyL} onClose={() => setSn(false)} onSave={l => saveLoan(l, true)} title="新增信贷" />
    <Modal open={!!pay} onClose={() => setPay(null)} title={`录入回款 — ${pay?.name || ""}`}>{pay && <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20, padding: 14, background: T.bg3, borderRadius: 10 }}>
        {[["待收", "¥" + fmtF(pay.totalDue), T.text], ["已收", "¥" + fmtF(pay.recovered), T.green], ["剩余", "¥" + fmtF(pay.totalDue - pay.recovered), T.amber]].map(([l, v, c], i) => <div key={i}><div style={{ fontSize: 11, color: T.td }}>{l}</div><div style={{ fontWeight: 600, fontFamily: mono, color: c, marginTop: 2 }}>{v}</div></div>)}
      </div>
      <Field label="回款金额"><input type="number" value={pa} onChange={e => setPa(e.target.value)} placeholder="输入金额" style={S.input} /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}><button onClick={() => setPay(null)} style={S.btnG}>取消</button><button onClick={recPay} style={S.btn(T.green)}>确认</button></div>
    </div>}</Modal>
  </div>;
};

const LoanEd = ({ open, loan, onClose, onSave, title }) => {
  const [d, setD] = useState(loan); useEffect(() => { if (loan) setD({ ...loan }); }, [loan]); if (!d) return null;
  const u = (k, v) => setD(p => ({ ...p, [k]: v }));
  const save = () => { const od = +d.overduePrincipal, oi = +d.overdueInterest; onSave({ ...d, overduePrincipal: od, overdueInterest: oi, totalDue: od + oi, originalAmount: +d.originalAmount, recovered: +d.recovered, recoveryRate: (od + oi) > 0 ? (+d.recovered) / (od + oi) : 0 }); };
  return <Modal open={open} onClose={onClose} title={title}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
    <Field label="姓名"><input value={d.name} onChange={e => u("name", e.target.value)} style={S.input} /></Field>
    <Field label="性别"><select value={d.gender} onChange={e => u("gender", e.target.value)} style={{ ...S.select, width: "100%" }}><option>男</option><option>女</option></select></Field>
    <Field label="身份证"><input value={d.idNumber} onChange={e => u("idNumber", e.target.value)} style={S.input} /></Field>
    <Field label="手机"><input value={d.phone} onChange={e => u("phone", e.target.value)} style={S.input} /></Field>
    <Field label="逾期本金"><input type="number" value={d.overduePrincipal} onChange={e => u("overduePrincipal", e.target.value)} style={S.input} /></Field>
    <Field label="逾期利息"><input type="number" value={d.overdueInterest} onChange={e => u("overdueInterest", e.target.value)} style={S.input} /></Field>
  </div><div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}><button onClick={onClose} style={S.btnG}>取消</button><button onClick={save} style={S.btn()}>保存</button></div></Modal>;
};

const CompanyInvs = ({ investors, setInvestors, pkgs }) => {
  const [ei, setEi] = useState(null); const [sn, setSn] = useState(false);
  const empty = { id: "inv" + Date.now(), name: "", phone: "", contractDate: "2025-10-01", password: "", share: {}, capital: {} };
  const save = (v, n) => { if (n) setInvestors(p => [...p, v]); else setInvestors(p => p.map(x => x.id === v.id ? v : x)); setEi(null); setSn(false); };
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div><div style={{ fontSize: 20, fontWeight: 700 }}>投资者管理</div></div>
      <button onClick={() => setSn(true)} style={S.btn()}>+ 新增</button>
    </div>
    {investors.map(v => <div key={v.id} style={{ ...S.card, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${T.blue}15,${T.purple}15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: T.blue }}>{v.name[0]}</div>
          <div><div style={{ fontWeight: 600 }}>{v.name}</div><div style={{ fontSize: 12, color: T.tm }}>签约 {v.contractDate}</div></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}><button onClick={() => setEi({ ...v, share: { ...v.share }, capital: { ...v.capital } })} style={S.btnSm()}>编辑</button><button onClick={() => { if (confirm("删除？")) setInvestors(p => p.filter(x => x.id !== v.id)); }} style={S.btnSm(T.red)}>删除</button></div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{pkgs.filter(p => v.share[p.id]).map(p => { const r = calcR(p, v); return <div key={p.id} style={{ padding: "8px 12px", background: T.bg3, borderRadius: 8, flex: 1, minWidth: 180, fontSize: 12 }}><div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div><span style={{ color: T.tm }}>份额 <b style={{ color: T.blue }}>{pct(v.share[p.id])}</b></span><span style={{ color: T.tm, marginLeft: 12 }}>净回款 <b style={{ color: T.green }}>¥{fmtF(Math.round(r?.my || 0))}</b></span></div>; })}</div>
    </div>)}
    <InvEd open={!!ei} inv={ei} pkgs={pkgs} onClose={() => setEi(null)} onSave={v => save(v, false)} title="编辑投资者" />
    <InvEd open={sn} inv={empty} pkgs={pkgs} onClose={() => setSn(false)} onSave={v => save(v, true)} title="新增投资者" />
  </div>;
};

const InvEd = ({ open, inv, pkgs, onClose, onSave, title }) => {
  const [d, setD] = useState(inv); useEffect(() => { if (inv) setD({ ...inv, share: { ...inv.share }, capital: { ...inv.capital } }); }, [inv]); if (!d) return null;
  return <Modal open={open} onClose={onClose} title={title}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Field label="姓名"><input value={d.name} onChange={e => setD(p => ({ ...p, name: e.target.value }))} style={S.input} /></Field>
      <Field label="手机"><input value={d.phone} onChange={e => setD(p => ({ ...p, phone: e.target.value }))} style={S.input} /></Field>
      <Field label="签约日期"><input type="date" value={d.contractDate} onChange={e => setD(p => ({ ...p, contractDate: e.target.value }))} style={S.input} /></Field>
      <Field label="登录密码"><input value={d.password} onChange={e => setD(p => ({ ...p, password: e.target.value }))} style={S.input} /></Field>
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, margin: "18px 0 10px", paddingTop: 16, borderTop: `1px solid ${T.borderL}` }}>份额分配</div>
    {pkgs.map(p => <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10, padding: "8px 12px", background: T.bg3, borderRadius: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 500, minWidth: 160 }}>{p.name}</span>
      <input type="number" step=".01" placeholder="份额" value={d.share[p.id] || ""} onChange={e => { const v = +e.target.value; setD(prev => ({ ...prev, share: { ...prev.share, [p.id]: v }, capital: { ...prev.capital, [p.id]: Math.round(p.purchasePrice * v) } })); }} style={{ ...S.input, width: 90 }} />
      <span style={{ fontSize: 12, color: T.tm }}>= ¥{fmtF(Math.round(p.purchasePrice * (d.share[p.id] || 0)))}</span>
    </div>)}
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}><button onClick={onClose} style={S.btnG}>取消</button><button onClick={() => onSave(d)} style={S.btn()}>保存</button></div>
  </Modal>;
};

const CompanyBm = ({ bm, setBm }) => <div>
  <div style={{ fontSize: 20, fontWeight: 700 }}>行业基准设定</div>
  <div style={{ fontSize: 13, color: T.tm, marginTop: 3, marginBottom: 20 }}>投资者端回收曲线的对比基准</div>
  <div style={{ ...S.card, maxWidth: 420 }}>
    {[["industry3m", "3个月"], ["industry6m", "6个月"], ["industry12m", "12个月"]].map(([k, l]) => <Field key={k} label={l + "行业平均回收率"}><div style={{ display: "flex", gap: 10, alignItems: "center" }}><input type="number" step=".01" value={bm[k]} onChange={e => setBm({ ...bm, [k]: +e.target.value })} style={{ ...S.input, width: 120 }} /><span style={{ fontSize: 13, color: T.tm }}>{pct(bm[k])}</span></div></Field>)}
    <button style={{ ...S.btn(), marginTop: 8 }}>保存</button>
  </div>
</div>;

/* ================================================================
   INVESTOR VIEWS — CLEAN, POSITIVE, PROGRESS-FOCUSED
   ================================================================ */
const InvOverview = ({ pkg, inv, allInv, bm }) => {
  const mobile = useIsMobile();
  const r = calcR(pkg, inv); if (!r) return <div style={{ textAlign: "center", padding: 60, color: T.td }}>未参与此资产包</div>;
  const totalDue = pkg.loans.reduce((s, l) => s + l.totalDue, 0);
  const totalRec = pkg.loans.reduce((s, l) => s + l.recovered, 0);
  const statusCounts = {}; pkg.loans.forEach(l => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([k, v]) => ({ name: k, value: v }));
  const pieColors = { "已回款": T.green, "协商中": T.amber, "承诺还款": T.purple, "未触达": "#94a3b8", "失联": T.red, "诉讼中": T.coral };
  const curveData = pkg.payments.map((p, i) => ({ w: p.weekLabel, 已回款: Math.round(p.cumulative * r.sh * (1 - r.tfr)), 行业基准: Math.round(r.cap * (bm.industry12m * (i + 1) / pkg.payments.length) * (1 - r.tfr)) }));
  const others = allInv.filter(x => x.id !== inv.id && x.share[pkg.id]);

  return <div>
    {/* Header */}
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{pkg.name}</div>
      <div style={{ fontSize: 13, color: T.tm, marginTop: 3 }}>来源 {pkg.source} · 购入 {pkg.purchaseDate} · 共{pkg.loanCount}笔信贷</div>
    </div>

    {/* Big progress card */}
    <div style={{ ...S.card, padding: mobile ? 20 : 28, marginBottom: 20, background: `linear-gradient(135deg, ${T.blueBg} 0%, ${T.white} 100%)`, border: `1px solid ${T.blueBd}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, color: T.tm, fontWeight: 500, marginBottom: 10 }}>我的回款进度</div>
          <div style={{ ...S.big(T.blue), fontSize: mobile ? 32 : 40 }}>{pct(r.ratio)}</div>
          <div style={{ width: "100%", height: 12, background: "#bfdbfe40", borderRadius: 12, marginTop: 14 }}>
            <div style={{ width: `${Math.min(r.ratio * 100, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${T.blue}, ${T.blueL})`, borderRadius: 12, transition: "width .6s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: T.tm }}>
            <span>投入 ¥{fmtF(Math.round(r.cap))}</span>
            <span>已回款 ¥{fmtF(Math.round(r.my))}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: mobile ? "flex-start" : "flex-end", gap: 6 }}>
          {r.pb ? <div style={{ ...S.tag(T.green), fontSize: 13, padding: "6px 16px" }}>已回本</div> : <div style={{ ...S.tag(T.amber), fontSize: 13, padding: "6px 16px" }}>回本中</div>}
          <div style={{ fontSize: 14, color: T.body, marginTop: 4 }}>
            {r.pb ? <>回本后已额外收回 <b style={{ color: T.green }}>¥{fmtF(Math.round(r.profit))}</b></> : <>距离回本还需 <b style={{ color: T.amber }}>¥{fmtF(Math.round(r.gap))}</b></>}
          </div>
        </div>
      </div>
    </div>

    {/* Key numbers */}
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
      {[["我的投入", "¥" + fmtF(Math.round(r.cap)), T.text], ["累计回款（扣费后）", "¥" + fmtF(Math.round(r.my)), T.green], ["我的份额", pct(r.sh), T.blue], ["资产包回收率", pct(totalDue > 0 ? totalRec / totalDue : 0), T.amber]].map(([l, v, c], i) =>
        <div key={i} style={S.card}><div style={{ fontSize: 11, color: T.td, marginBottom: 6, fontWeight: 500 }}>{l}</div><div style={{ fontSize: mobile ? 18 : 22, fontWeight: 700, color: c, fontFamily: mono }}>{v}</div></div>
      )}
    </div>

    {/* Fee detail */}
    <div style={{ ...S.card, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><span style={{ fontSize: 15, fontWeight: 600 }}>费用明细</span><span style={S.tag(T.td)}>合同锁定</span></div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
        {[["回款总额(我的份额)", "¥" + fmtF(Math.round(r.tot * r.sh)), T.text], ["处置服务费 " + pct(pkg.feeRates.disposal), "-¥" + fmtF(Math.round(r.dFee)), T.coral], ["平台费 " + pct(pkg.feeRates.platform), "-¥" + fmtF(Math.round(r.pFee)), T.amber], ["GP管理费 " + pct(pkg.feeRates.gp), "-¥" + fmtF(Math.round(r.gFee)), T.purple]].map(([l, v, c], i) =>
          <div key={i}><div style={{ fontSize: 11, color: T.td }}>{l}</div><div style={{ fontSize: 15, fontWeight: 600, color: c, fontFamily: mono, marginTop: 3 }}>{v}</div></div>
        )}
      </div>
    </div>

    {/* Charts */}
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "3fr 2fr", gap: 16, marginBottom: 20 }}>
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>回款趋势</span>
          <div style={{ display: "flex", gap: 12, fontSize: 11 }}><span style={{ color: T.blue }}>● 我的净回款</span><span style={{ color: T.amber }}>● 行业基准</span></div>
        </div>
        <ResponsiveContainer width="100%" height={mobile ? 200 : 240}>
          <AreaChart data={curveData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.blue} stopOpacity={.15} /><stop offset="95%" stopColor={T.blue} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.borderL} />
            <XAxis dataKey="w" tick={{ fontSize: 10, fill: T.td }} interval={3} />
            <YAxis tick={{ fontSize: 10, fill: T.td }} tickFormatter={v => fmt(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => `¥${fmtF(v)}`} />
            <ReferenceLine y={r.cap} stroke={T.red} strokeDasharray="6 4" strokeOpacity={.35} label={{ value: "本金", position: "right", fontSize: 10, fill: T.red }} />
            <Area type="monotone" dataKey="已回款" stroke={T.blue} fill="url(#gB)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="行业基准" stroke={T.amber} fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={S.card}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>催收状态</div>
        <ResponsiveContainer width="100%" height={mobile ? 200 : 240}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={mobile ? 60 : 70} innerRadius={mobile ? 30 : 38} paddingAngle={2} strokeWidth={0}>
              {pieData.map((d, i) => <Cell key={i} fill={pieColors[d.name] || T.td} />)}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 11 }} formatter={v => <span style={{ color: T.body }}>{v}</span>} />
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Other investors */}
    {others.length > 0 && <div style={{ padding: "10px 16px", background: T.bg3, borderRadius: 8, fontSize: 12, color: T.tm }}>
      同包其他投资者：{others.map((o, i) => <span key={o.id}>{o.name}（{pct(o.share[pkg.id])}）{i < others.length - 1 ? " · " : ""}</span>)}
    </div>}
  </div>;
};

const InvLoans = ({ pkg }) => {
  const mobile = useIsMobile();
  const [ft, setFt] = useState("全部"); const [q, setQ] = useState(""); const [pg, setPg] = useState(0); const PS = 15;
  const fl = pkg.loans.filter(l => (ft === "全部" || l.status === ft) && (!q || l.id.includes(q)));
  const pgs = Math.ceil(fl.length / PS); const pd = fl.slice(pg * PS, (pg + 1) * PS);
  return <div>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}><span style={{ fontSize: 20, fontWeight: 700 }}>信贷明细</span><span style={S.tag(T.td)}>脱敏</span></div>
    <div style={{ fontSize: 13, color: T.tm, marginTop: 3, marginBottom: 18 }}>个人信息已脱敏</div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{["全部", ...statusOpts].map(s => <button key={s} onClick={() => { setFt(s); setPg(0); }} style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${ft === s ? T.blue : T.border}`, background: ft === s ? T.blueBg : T.white, color: ft === s ? T.blue : T.tm, fontSize: 12, cursor: "pointer", fontFamily: font, fontWeight: ft === s ? 600 : 400 }}>{s}</button>)}</div>
      <input placeholder="搜索编号..." value={q} onChange={e => { setQ(e.target.value); setPg(0); }} style={{ ...S.input, width: 140 }} />
    </div>
    <div style={{ ...S.card, padding: 0, overflow: "hidden" }}><div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
      <thead><tr>{(mobile ? ["姓名", "待收", "已收", "状态"] : ["编号", "姓名", "性别", "城市", "待收", "已收", "回收率", "状态"]).map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pd.map(l => <tr key={l.id} onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = ""}>
        {!mobile && <td style={{ ...S.td, fontFamily: mono, fontSize: 11, color: T.td }}>{l.id}</td>}
        <td style={{ ...S.td, fontWeight: 600 }}>{maskN(l.name)}</td>
        {!mobile && <><td style={S.td}>{l.gender}</td><td style={S.td}>{maskAddr(l.address)}</td></>}
        <td style={{ ...S.td, fontFamily: mono }}>¥{fmtF(l.totalDue)}</td>
        <td style={{ ...S.td, fontFamily: mono, color: l.recovered > 0 ? T.green : T.td }}>¥{fmtF(l.recovered)}</td>
        {!mobile && <td style={S.td}>{pct(l.recoveryRate)}</td>}
        <td style={S.td}><Badge s={l.status} /></td>
      </tr>)}</tbody>
    </table></div>
    <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, fontSize: 13, color: T.tm }}>
      <span>共 {fl.length} 条</span>
      <div style={{ display: "flex", gap: 6 }}><button onClick={() => setPg(Math.max(0, pg - 1))} disabled={pg === 0} style={{ ...S.btnG, opacity: pg === 0 ? .4 : 1 }}>上页</button><span style={{ padding: "2px 8px", fontSize: 12 }}>{pg + 1}/{pgs || 1}</span><button onClick={() => setPg(Math.min(pgs - 1, pg + 1))} disabled={pg >= pgs - 1} style={{ ...S.btnG, opacity: pg >= pgs - 1 ? .4 : 1 }}>下页</button></div>
    </div></div>
  </div>;
};

const InvFlow = ({ pkg, inv }) => {
  const mobile = useIsMobile();
  const sh = inv.share[pkg.id]; if (!sh) return null;
  const tfr = pkg.feeRates.disposal + pkg.feeRates.platform + pkg.feeRates.gp; let cum = 0;
  return <div>
    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>回款流水</div>
    <div style={{ fontSize: 13, color: T.tm, marginTop: 3, marginBottom: 18 }}>每周扣费与净回款明细</div>
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

/* ================================================================
   MAIN APP
   ================================================================ */
const CTABS = [["dash", "运营概览"], ["pkgs", "资产包管理"], ["loans", "信贷明细"], ["invs", "投资者管理"], ["bm", "行业基准"]];
const ITABS = [["overview", "我的投资"], ["loans", "信贷明细"], ["flow", "回款流水"]];

export default function App() {
  useEffect(() => { if (!document.getElementById("nf")) { const l = document.createElement("link"); l.id = "nf"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"; document.head.appendChild(l); } }, []);
  const mobile = useIsMobile();
  const [role, setRole] = useState(null);
  const [invId, setInvId] = useState("inv1");
  const [pkgs, setPkgs] = useState(initPkgs); const [investors, setInvestors] = useState(initInvestors); const [bm, setBm] = useState(initBm);
  const [ct, setCt] = useState("dash"); const [it, setIt] = useState("overview"); const [sp, setSp] = useState(0);
  const [loginTab, setLoginTab] = useState("company"); const [pw, setPw] = useState(""); const [invPw, setInvPw] = useState(""); const [loginInvId, setLoginInvId] = useState("inv1"); const [err, setErr] = useState(""); const [showForgot, setShowForgot] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  const handleLogin = () => {
    if (loginTab === "company") { if (pw === "admin888") { setRole("company"); setErr(""); setPw(""); } else setErr("管理密码错误"); }
    else { const found = investors.find(i => i.id === loginInvId); if (found && invPw === found.password) { setRole("investor"); setInvId(loginInvId); setErr(""); setInvPw(""); } else setErr("密码错误"); }
  };

  /* Login screen */
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
            <button key={k} onClick={() => { setLoginTab(k); setErr(""); }} style={{ flex: 1, padding: "13px 0", background: "transparent", color: loginTab === k ? T.blue : T.td, border: "none", fontSize: 14, fontWeight: loginTab === k ? 600 : 400, cursor: "pointer", fontFamily: font, borderBottom: loginTab === k ? `2px solid ${T.blue}` : "2px solid transparent" }}>{l}</button>
          )}
        </div>
        <div style={{ padding: "28px 24px" }}>
          {loginTab === "company" ? <>
            <Field label="管理密码"><input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="请输入管理密码" style={S.input} /></Field>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: T.td, padding: "5px 8px", background: T.bg3, borderRadius: 6 }}>演示: admin888</div>
              <button onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: T.blue, fontSize: 12, cursor: "pointer", fontFamily: font }}>忘记密码？</button>
            </div>
            <button onClick={handleLogin} style={{ ...S.btn(), width: "100%", padding: "10px 0", fontSize: 14 }}>登录管理后台</button>
          </> : <>
            <Field label="选择账户"><select value={loginInvId} onChange={e => setLoginInvId(e.target.value)} style={{ ...S.select, width: "100%" }}>{investors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></Field>
            <Field label="密码"><input type="password" value={invPw} onChange={e => setInvPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="请输入密码" style={S.input} /></Field>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: T.td, padding: "5px 8px", background: T.bg3, borderRadius: 6 }}>演示: zhang123 / li123 / wang123</div>
              <button onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: T.blue, fontSize: 12, cursor: "pointer", fontFamily: font }}>忘记密码？</button>
            </div>
            <button onClick={handleLogin} style={{ ...S.btn(T.teal), width: "100%", padding: "10px 0", fontSize: 14 }}>登录投资者端</button>
          </>}
          {err && <div style={{ marginTop: 12, fontSize: 13, color: T.red, textAlign: "center", padding: "8px", background: T.redBg, borderRadius: 8 }}>{err}</div>}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: T.td }}>© 2025 NPL Asset Tracker</div>
      <Modal open={showForgot} onClose={() => setShowForgot(false)} title="忘记密码">
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 14, color: T.body, marginBottom: 6 }}>请联系管理员重置密码</div>
          <div style={{ fontSize: 13, color: T.tm }}>电话：400-XXX-XXXX</div>
          <div style={{ fontSize: 13, color: T.tm }}>邮箱：admin@npltracker.com</div>
          <button onClick={() => setShowForgot(false)} style={{ ...S.btn(), marginTop: 18 }}>知道了</button>
        </div>
      </Modal>
    </div>
  </div>;

  /* Main app */
  const isC = role === "company"; const tabs = isC ? CTABS : ITABS; const at = isC ? ct : it; const setAt = isC ? setCt : setIt;
  const curInv = investors.find(i => i.id === invId);
  const invPkgs = curInv ? pkgs.filter(p => curInv.share[p.id]) : pkgs; const curPkg = invPkgs[sp] || invPkgs[0];

  const content = () => {
    if (isC) { switch (ct) { case "dash": return <CompanyDash pkgs={pkgs} investors={investors} />; case "pkgs": return <CompanyPkgs pkgs={pkgs} setPkgs={setPkgs} />; case "loans": return <CompanyLoans pkgs={pkgs} setPkgs={setPkgs} />; case "invs": return <CompanyInvs investors={investors} setInvestors={setInvestors} pkgs={pkgs} />; case "bm": return <CompanyBm bm={bm} setBm={setBm} />; } }
    else { if (!curPkg) return <div style={{ textAlign: "center", padding: 60, color: T.td }}>暂无资产包</div>; switch (it) { case "overview": return <InvOverview pkg={curPkg} inv={curInv} allInv={investors} bm={bm} />; case "loans": return <InvLoans pkg={curPkg} />; case "flow": return <InvFlow pkg={curPkg} inv={curInv} />; } }
  };

  /* Sidebar overlay for mobile */
  const sidebarContent = <>
    <div style={{ padding: "0 20px 14px", fontSize: 11, color: T.sideT, letterSpacing: ".06em", fontWeight: 500 }}>{isC ? "管理菜单" : "投资者菜单"}</div>
    {tabs.map(([k, l]) => <div key={k} onClick={() => { setAt(k); setSideOpen(false); }} style={{ padding: "11px 20px", fontSize: 13, cursor: "pointer", color: at === k ? T.sideA : T.sideT, background: at === k ? "rgba(255,255,255,.08)" : "transparent", borderLeft: at === k ? `3px solid ${isC ? T.blueL : T.teal}` : "3px solid transparent", fontWeight: at === k ? 600 : 400, transition: "all .15s" }}>{l}</div>)}
    {!isC && curInv && <div style={{ margin: "20px 20px 0", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,.1)" }}>
      <div style={{ fontSize: 11, color: T.sideT, marginBottom: 4 }}>当前身份</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.sideA }}>{curInv.name}</div>
      {curPkg && <div style={{ fontSize: 12, color: T.sideT, marginTop: 2 }}>份额 {pct(curInv.share[curPkg.id] || 0)}</div>}
    </div>}
  </>;

  return <div style={{ fontFamily: font, background: T.bg, color: T.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    {/* Header */}
    <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {mobile && <button onClick={() => setSideOpen(!sideOpen)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "4px 8px" }}>☰</button>}
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${T.blue},${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg></div>
        {!mobile && <span style={{ fontSize: 15, fontWeight: 700 }}>NPL Asset Tracker</span>}
        <span style={{ fontSize: 11, fontWeight: 600, color: isC ? T.blue : T.teal, padding: "2px 8px", background: isC ? T.blueBg : T.greenBg, borderRadius: 6 }}>{isC ? "管理端" : "投资者"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {!isC && invPkgs.length > 1 && <select value={sp} onChange={e => setSp(+e.target.value)} style={{ ...S.select, fontSize: 12, padding: "6px 8px" }}>{invPkgs.map((p, i) => <option key={i} value={i}>{mobile ? p.name.slice(0, 6) + "..." : p.name}</option>)}</select>}
        {!isC && <span style={{ fontSize: 13, fontWeight: 500, color: T.body }}>{curInv?.name}</span>}
        <button onClick={() => { setRole(null); setCt("dash"); setIt("overview"); setSp(0); setSideOpen(false); }} style={{ ...S.btnG, fontSize: 12, padding: "4px 12px" }}>退出</button>
      </div>
    </div>
    {/* Body */}
    <div style={{ display: "flex", flex: 1, position: "relative" }}>
      {/* Sidebar */}
      {mobile ? (sideOpen && <><div onClick={() => setSideOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 200 }} /><div style={{ position: "fixed", left: 0, top: 52, bottom: 0, width: 220, background: T.sidebar, zIndex: 201, padding: "16px 0", overflowY: "auto" }}>{sidebarContent}</div></>)
        : <div style={{ width: 200, background: T.sidebar, padding: "16px 0", flexShrink: 0, minHeight: "calc(100vh - 52px)" }}>{sidebarContent}</div>}
      {/* Main */}
      <div style={{ flex: 1, padding: mobile ? 16 : 28, overflowY: "auto", maxHeight: "calc(100vh - 52px)" }}>{content()}</div>
    </div>
  </div>;
}
