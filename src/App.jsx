import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, PieChart, Pie, Cell, Legend, ReferenceLine } from "recharts";

/* ================================================================ THEME ================================================================ */
const T={bg:"#f5f6f8",white:"#fff",bg3:"#f9fafb",border:"#e2e5ea",borderL:"#edf0f4",text:"#1a1f2e",body:"#374151",tm:"#6b7280",td:"#9ca3af",blue:"#2563eb",blueL:"#3b82f6",blueBg:"#eff6ff",blueBd:"#bfdbfe",green:"#059669",greenL:"#10b981",greenBg:"#ecfdf5",greenBd:"#a7f3d0",red:"#dc2626",redBg:"#fef2f2",amber:"#d97706",amberBg:"#fffbeb",purple:"#7c3aed",coral:"#ea580c",teal:"#0d9488",sidebar:"#1a1f2e",sideT:"#a0a8be",sideA:"#fff"};
const font='"Noto Sans SC","DM Sans",-apple-system,sans-serif';const mono='"DM Sans","SF Mono",monospace';

/* ================================================================ DATA ================================================================ */
const surnames=["张","李","王","刘","陈","杨","赵","黄","周","吴","徐","孙","胡","朱","高","林","何","郭","马","罗"];const gn=["伟","芳","娜","秀英","敏","静","丽","强","磊","军","洋","勇","艳","杰","娟","涛","明","超","秀兰","霞"];const cities=["北京市","上海市","广州市","深圳市","杭州市","成都市","武汉市","南京市","重庆市","天津市"];const sList=["未触达","协商中","承诺还款","已回款","失联","诉讼中"];const rn=a=>a[Math.floor(Math.random()*a.length)];const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

function genLoans(id,n){const a=[];for(let i=0;i<n;i++){const nm=rn(surnames)+rn(gn)+(Math.random()>.5?rn(gn):"");const g=Math.random()>.45?"男":"女";const o=ri(5,800)*100;const od=Math.round(o*(.8+Math.random()*.2));const oi=Math.round(o*(.05+Math.random()*.3));const td=od+oi;const st=rn(sList);const rec=st==="已回款"?Math.round(td*(.2+Math.random()*.6)):st==="承诺还款"?Math.round(td*Math.random()*.2):st==="协商中"?Math.round(td*Math.random()*.1):0;a.push({id:`${id}-L${String(i+1).padStart(4,"0")}`,name:nm,gender:g,idNumber:`${ri(110000,650000)}${ri(1970,2005)}${String(ri(1,12)).padStart(2,"0")}${String(ri(1,28)).padStart(2,"0")}${ri(1000,9999)}`,phone:`1${ri(3,8)}${ri(100000000,999999999)}`,city:rn(cities),address:`${rn(cities)}某区某路${ri(1,200)}号`,originalAmount:o,overduePrincipal:od,overdueInterest:oi,totalDue:td,recovered:rec,recoveryRate:td>0?rec/td:0,status:st,lastContact:`2025-${String(ri(4,9)).padStart(2,"0")}-${String(ri(1,28)).padStart(2,"0")}`,nextFollowup:`2025-${String(ri(10,12)).padStart(2,"0")}-${String(ri(1,28)).padStart(2,"0")}`});}return a;}
function genWeekly(loans,w=28){const tot=loans.reduce((s,l)=>s+l.recovered,0);let c=0;const a=[];for(let i=1;i<=w;i++){const f=Math.max(.01,1-(i/w)*.7);const amt=Math.round(Math.max(0,Math.min((tot/w)*f*(1+(Math.random()-.3)*.5)*2,tot-c)));c+=amt;if(c>tot)c=tot;a.push({week:i,weekLabel:`第${i}周`,amount:amt,cumulative:c,date:`2025-${String(3+Math.floor((i-1)/4)).padStart(2,"0")}-${String(((i-1)%4)*7+1).padStart(2,"0")}`});}if(a.length&&a[a.length-1].cumulative<tot){a[a.length-1].amount+=tot-a[a.length-1].cumulative;a[a.length-1].cumulative=tot;}return a;}

const initPkgs=[
  {id:"PKG-2025-001",name:"华东个贷不良资产包A",source:"东方资产管理",purchaseDate:"2025-03-15",faceValue:8500000,purchasePrice:500000,status:"处置中",feeRates:{disposal:.08,platform:.03,gp:.02},loans:genLoans("PKG001",86)},
  {id:"PKG-2025-002",name:"华南消费贷不良资产包B",source:"长城资产管理",purchaseDate:"2025-06-01",faceValue:12000000,purchasePrice:480000,status:"处置中",feeRates:{disposal:.07,platform:.03,gp:.025},loans:genLoans("PKG002",120)},
];
initPkgs.forEach(p=>{p.loanCount=p.loans.length;p.discountRate=p.purchasePrice/p.faceValue;p.payments=genWeekly(p.loans);});

const initInv=[
  {id:"inv1",name:"张伟",share:{"PKG-2025-001":.45,"PKG-2025-002":.55},capital:{"PKG-2025-001":225000,"PKG-2025-002":264000},phone:"138****5678",contractDate:"2025-03-01",password:"zhang123"},
  {id:"inv2",name:"李芳",share:{"PKG-2025-001":.35,"PKG-2025-002":.45},capital:{"PKG-2025-001":175000,"PKG-2025-002":216000},phone:"139****4321",contractDate:"2025-03-05",password:"li123"},
  {id:"inv3",name:"王强",share:{"PKG-2025-001":.20},capital:{"PKG-2025-001":100000},phone:"136****2222",contractDate:"2025-03-10",password:"wang123"},
];
const initBm={industry3m:.15,industry6m:.32,industry12m:.55};

/* ================================================================ UTILS ================================================================ */
const maskN=n=>n?n[0]+"**":"**";const maskAddr=a=>{const m=a?.match(/(.*?市)/);return m?m[1]:"";};
const fmt=n=>n>=10000?(n/10000).toFixed(2)+"万":n.toLocaleString("zh-CN");const fmtF=n=>Math.round(n).toLocaleString("zh-CN");const pct=n=>(n*100).toFixed(2)+"%";
function calcR(pkg,inv){const sh=inv.share[pkg.id];if(!sh)return null;const cap=inv.capital[pkg.id]||pkg.purchasePrice*sh;const tot=pkg.loans.reduce((s,l)=>s+l.recovered,0);const fr=pkg.feeRates;const fees=tot*(fr.disposal+fr.platform+fr.gp);const net=tot-fees;const my=net*sh;const r=cap>0?my/cap:0;return{cap,tot,fees,net,my,r,profit:my-cap,pb:r>=1,gap:r>=1?0:cap-my,sh,nav:cap>0?my/cap:0,moic:cap>0?my/cap:0,yieldRate:cap>0?(my-cap)/cap:0,dFee:tot*fr.disposal*sh,pFee:tot*fr.platform*sh,gFee:tot*fr.gp*sh};}

/* ================================================================ STYLES ================================================================ */
const S={
  btn:c=>({padding:"8px 20px",borderRadius:8,border:"none",background:c||T.blue,color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:font}),
  btnSm:c=>({padding:"5px 14px",borderRadius:6,border:"none",background:c||T.blue,color:"#fff",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:font}),
  btnG:{padding:"5px 14px",borderRadius:6,border:`1px solid ${T.border}`,background:T.white,color:T.body,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:font},
  input:{background:T.white,border:`1px solid ${T.border}`,color:T.text,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:font,outline:"none",width:"100%",boxSizing:"border-box"},
  select:{background:T.white,border:`1px solid ${T.border}`,color:T.text,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:font,outline:"none",cursor:"pointer"},
  card:{background:T.white,borderRadius:12,border:`1px solid ${T.border}`,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.04)"},
  th:{padding:"10px 14px",textAlign:"left",fontWeight:600,color:T.tm,borderBottom:`1px solid ${T.border}`,fontSize:11,letterSpacing:".04em",background:T.bg3},
  td:{padding:"10px 14px",borderBottom:`1px solid ${T.borderL}`,color:T.body,fontSize:13},
  badge:c=>({display:"inline-block",padding:"3px 12px",borderRadius:50,fontSize:11,fontWeight:600,background:c+"12",color:c}),
  tag:c=>({display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:500,background:c+"10",color:c}),
  big:(c=T.text)=>({fontSize:28,fontWeight:700,color:c,fontFamily:mono,letterSpacing:"-.02em"}),
  modal:{position:"fixed",inset:0,background:"rgba(0,0,0,.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000},
  mInner:{background:T.white,borderRadius:16,border:`1px solid ${T.border}`,padding:32,width:560,maxWidth:"92vw",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.12)"},
  pt:{fontSize:20,fontWeight:700,color:T.text},ps:{fontSize:13,color:T.tm,marginTop:3,marginBottom:22},
};
const tooltipStyle={background:T.white,border:`1px solid ${T.border}`,borderRadius:10,fontSize:12,color:T.text,boxShadow:"0 4px 12px rgba(0,0,0,.08)"};
const Badge=({s})=>{const c={"未触达":T.td,"协商中":T.amber,"承诺还款":T.purple,"已回款":T.green,"失联":T.red,"诉讼中":T.coral};return<span style={S.badge(c[s]||T.td)}>{s}</span>;};
const Modal=({open,onClose,title,children})=>open?<div style={S.modal} onClick={onClose}><div style={S.mInner} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><div style={{fontSize:17,fontWeight:700}}>{title}</div><button onClick={onClose} style={{background:"none",border:"none",color:T.td,fontSize:22,cursor:"pointer",fontFamily:font}}>✕</button></div>{children}</div></div>:null;
const Field=({label,children})=><div style={{marginBottom:16}}><label style={{fontSize:12,color:T.tm,display:"block",marginBottom:5,fontWeight:500}}>{label}</label>{children}</div>;

/* ================================================================ EXCEL IMPORT ================================================================ */
const ExcelImport=({onImport,pkgId})=>{
  const[drag,setDrag]=useState(false);const[preview,setPreview]=useState(null);const[mapping,setMapping]=useState({});const ref=useRef();
  const FIELDS=[["name","姓名"],["gender","性别"],["idNumber","身份证号"],["phone","手机号"],["city","城市"],["address","地址"],["originalAmount","原始贷款金额"],["overduePrincipal","逾期本金"],["overdueInterest","逾期利息"],["status","催收状态"]];

  const parseCSV=(text)=>{
    const lines=text.split(/\r?\n/).filter(l=>l.trim());if(lines.length<2)return;
    const headers=lines[0].split(/[,\t]/).map(h=>h.replace(/["']/g,"").trim());
    const rows=lines.slice(1).map(l=>{const vals=l.split(/[,\t]/).map(v=>v.replace(/["']/g,"").trim());const obj={};headers.forEach((h,i)=>obj[h]=vals[i]||"");return obj;});
    const autoMap={};
    FIELDS.forEach(([k,cn])=>{const found=headers.find(h=>h.includes(cn)||h.toLowerCase().includes(k.toLowerCase()));if(found)autoMap[k]=found;});
    setMapping(autoMap);setPreview({headers,rows,count:rows.length});
  };

  const handleFile=(file)=>{
    if(!file)return;const reader=new FileReader();
    if(file.name.endsWith(".csv")||file.name.endsWith(".tsv")||file.name.endsWith(".txt")){reader.onload=e=>parseCSV(e.target.result);reader.readAsText(file,"utf-8");}
    else{reader.onload=e=>{
      import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm").then(XLSX=>{
        const wb=XLSX.read(new Uint8Array(e.target.result),{type:"array"});const ws=wb.Sheets[wb.SheetNames[0]];const csv=XLSX.utils.sheet_to_csv(ws);parseCSV(csv);
      }).catch(()=>{parseCSV(e.target.result);});
    };reader.readAsArrayBuffer(file);}
  };

  const doImport=()=>{
    if(!preview)return;
    const loans=preview.rows.map((row,i)=>{
      const g=k=>row[mapping[k]]||"";
      const od=parseFloat(g("overduePrincipal"))||0;const oi=parseFloat(g("overdueInterest"))||0;const td=od+oi;const rec=0;
      return{id:`${pkgId}-L${String(i+1).padStart(4,"0")}`,name:g("name"),gender:g("gender")||"男",idNumber:g("idNumber"),phone:g("phone"),city:g("city"),address:g("address"),originalAmount:parseFloat(g("originalAmount"))||0,overduePrincipal:od,overdueInterest:oi,totalDue:td,recovered:rec,recoveryRate:0,status:g("status")||"未触达",lastContact:"",nextFollowup:""};
    }).filter(l=>l.name);
    onImport(loans);setPreview(null);
  };

  return<div>
    <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}} onClick={()=>ref.current?.click()}
      style={{border:`2px dashed ${drag?T.blue:T.border}`,borderRadius:12,padding:"40px 20px",textAlign:"center",cursor:"pointer",background:drag?T.blueBg:T.bg3,transition:"all .2s"}}>
      <input ref={ref} type="file" accept=".xlsx,.xls,.csv,.tsv" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>
      <div style={{fontSize:32,marginBottom:8}}>📄</div>
      <div style={{fontSize:14,fontWeight:600,color:T.text}}>拖拽 Excel/CSV 文件到这里</div>
      <div style={{fontSize:12,color:T.tm,marginTop:4}}>支持 .xlsx .xls .csv 格式</div>
    </div>
    {preview&&<div style={{marginTop:20}}>
      <div style={{padding:14,background:T.greenBg,borderRadius:8,border:`1px solid ${T.greenBd}`,marginBottom:16}}>
        <span style={{fontWeight:600,color:T.green}}>识别到 {preview.count} 条记录</span>
        <span style={{color:T.tm,marginLeft:8}}>| 表头: {preview.headers.slice(0,5).join(", ")}{preview.headers.length>5?"...":""}</span>
      </div>
      <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>列映射（自动匹配，可手动调整）</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {FIELDS.map(([k,cn])=><div key={k} style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,color:T.tm,width:100}}>{cn}</span>
          <select value={mapping[k]||""} onChange={e=>setMapping({...mapping,[k]:e.target.value})} style={{...S.select,flex:1,fontSize:12,padding:"5px 8px"}}>
            <option value="">-- 选择列 --</option>
            {preview.headers.map(h=><option key={h} value={h}>{h}</option>)}
          </select>
        </div>)}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:18}}>
        <button onClick={()=>setPreview(null)} style={{...S.btnG}}>取消</button>
        <button onClick={doImport} style={S.btn(T.green)}>确认导入 {preview.count} 条</button>
      </div>
    </div>}
  </div>;
};

/* ================================================================ COMPANY VIEWS ================================================================ */
const CompanyDash=({pkgs,inv})=>{const tr=pkgs.reduce((s,p)=>s+p.loans.reduce((ss,l)=>ss+l.recovered,0),0);const td=pkgs.reduce((s,p)=>s+p.loans.reduce((ss,l)=>ss+l.totalDue,0),0);
  const stats=[["资产包",pkgs.length+"个",T.blue],["信贷笔数",pkgs.reduce((s,p)=>s+p.loanCount,0)+"笔",T.teal],["投资者",inv.length+"人",T.purple],["累计回款","¥"+fmt(tr),T.green],["原始面值","¥"+fmt(pkgs.reduce((s,p)=>s+p.faceValue,0)),T.text],["购入成本","¥"+fmt(pkgs.reduce((s,p)=>s+p.purchasePrice,0)),T.coral],["整体回收率",pct(td>0?tr/td:0),T.amber]];
  return<div><div style={S.pt}>运营概览</div><div style={S.ps}>全局经营数据汇总</div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>{stats.map(([l,v,c],i)=><div key={i} style={S.card}><div style={{fontSize:11,color:T.td,marginBottom:6,fontWeight:500}}>{l}</div><div style={{...S.big(c),fontSize:22}}>{v}</div></div>)}</div></div>;
};

const CompanyPkgs=({pkgs,setPkgs})=>{const[ep,setEp]=useState(null);const[sn,setSn]=useState(false);
  const empty={id:"PKG-2025-"+ri(100,999),name:"",source:"",purchaseDate:"2025-10-01",faceValue:0,purchasePrice:0,status:"处置中",feeRates:{disposal:.08,platform:.03,gp:.02},loans:[],payments:[],loanCount:0,discountRate:0};
  const save=(p,n)=>{p.loanCount=p.loans.length;p.discountRate=p.faceValue>0?p.purchasePrice/p.faceValue:0;if(n)setPkgs(v=>[...v,p]);else setPkgs(v=>v.map(x=>x.id===p.id?p:x));setEp(null);setSn(false);};
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><div><div style={S.pt}>资产包管理</div><div style={S.ps}>新增、编辑、删除资产包</div></div><button onClick={()=>setSn(true)} style={S.btn()}>+ 新增资产包</button></div>
    {pkgs.map(p=>{const rec=p.loans.reduce((s,l)=>s+l.recovered,0);const due=p.loans.reduce((s,l)=>s+l.totalDue,0);return<div key={p.id} style={{...S.card,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:16,fontWeight:600,marginBottom:4}}>{p.name}</div><div style={{fontSize:12,color:T.tm}}>来源: {p.source} | 购入: {p.purchaseDate} | {p.loanCount}笔</div></div>
      <div style={{display:"flex",gap:8}}><button onClick={()=>setEp({...p,feeRates:{...p.feeRates}})} style={S.btnSm()}>编辑</button><button onClick={()=>{if(confirm("确认删除？"))setPkgs(v=>v.filter(x=>x.id!==p.id));}} style={S.btnSm(T.red)}>删除</button></div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginTop:14,paddingTop:14,borderTop:`1px solid ${T.borderL}`}}>
        {[["面值","¥"+fmtF(p.faceValue),T.text],["购入价","¥"+fmtF(p.purchasePrice),T.text],["已回款","¥"+fmtF(rec),T.green],["回收率",pct(due>0?rec/due:0),T.amber],["费率",`${(p.feeRates.disposal*100).toFixed(0)}%/${(p.feeRates.platform*100).toFixed(0)}%/${(p.feeRates.gp*100).toFixed(0)}%`,T.purple]].map(([l,v,c],i)=><div key={i}><div style={{fontSize:11,color:T.td}}>{l}</div><div style={{fontSize:15,fontWeight:600,color:c,fontFamily:mono,marginTop:2}}>{v}</div></div>)}
      </div></div>;})}
    <PkgEd open={!!ep} pkg={ep} onClose={()=>setEp(null)} onSave={p=>save(p,false)} t="编辑资产包"/>
    <PkgEd open={sn} pkg={empty} onClose={()=>setSn(false)} onSave={p=>save(p,true)} t="新增资产包"/>
  </div>;
};
const PkgEd=({open,pkg,onClose,onSave,t})=>{const[d,setD]=useState(pkg);useEffect(()=>{if(pkg)setD({...pkg,feeRates:{...pkg.feeRates}});},[pkg]);if(!d)return null;const u=(k,v)=>setD(p=>({...p,[k]:v}));const uf=(k,v)=>setD(p=>({...p,feeRates:{...p.feeRates,[k]:v}}));
  return<Modal open={open} onClose={onClose} title={t}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
    <Field label="资产包名称"><input value={d.name} onChange={e=>u("name",e.target.value)} style={S.input}/></Field>
    <Field label="来源AMC"><input value={d.source} onChange={e=>u("source",e.target.value)} style={S.input}/></Field>
    <Field label="购入日期"><input type="date" value={d.purchaseDate} onChange={e=>u("purchaseDate",e.target.value)} style={S.input}/></Field>
    <Field label="状态"><select value={d.status} onChange={e=>u("status",e.target.value)} style={{...S.select,width:"100%"}}>{["处置中","已结案","部分结案"].map(s=><option key={s}>{s}</option>)}</select></Field>
    <Field label="原始面值"><input type="number" value={d.faceValue} onChange={e=>u("faceValue",+e.target.value)} style={S.input}/></Field>
    <Field label="购入价格"><input type="number" value={d.purchasePrice} onChange={e=>u("purchasePrice",+e.target.value)} style={S.input}/></Field>
  </div>
  <div style={{fontSize:14,fontWeight:600,margin:"18px 0 10px",paddingTop:16,borderTop:`1px solid ${T.borderL}`}}>合同锁定费率</div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
    <Field label="处置服务费"><input type="number" step=".01" value={d.feeRates.disposal} onChange={e=>uf("disposal",+e.target.value)} style={S.input}/></Field>
    <Field label="平台服务费"><input type="number" step=".01" value={d.feeRates.platform} onChange={e=>uf("platform",+e.target.value)} style={S.input}/></Field>
    <Field label="GP管理费"><input type="number" step=".01" value={d.feeRates.gp} onChange={e=>uf("gp",+e.target.value)} style={S.input}/></Field>
  </div>
  <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:24}}><button onClick={onClose} style={S.btnG}>取消</button><button onClick={()=>onSave(d)} style={S.btn()}>保存</button></div></Modal>;
};

/* Company Loans with Excel Import */
const CompanyLoans=({pkgs,setPkgs})=>{const[pi,setPi]=useState(0);const[el,setEl]=useState(null);const[sn,setSn]=useState(false);const[pay,setPay]=useState(null);const[pa,setPa]=useState("");const[ft,setFt]=useState("全部");const[q,setQ]=useState("");const[pg,setPg]=useState(0);const[showImport,setShowImport]=useState(false);const PS=15;
  const pkg=pkgs[pi];const fl=pkg.loans.filter(l=>(ft==="全部"||l.status===ft)&&(!q||l.name.includes(q)||l.id.includes(q)));const pgs=Math.ceil(fl.length/PS);const pd=fl.slice(pg*PS,(pg+1)*PS);
  const saveLoan=(l,n)=>{setPkgs(v=>v.map((p,i)=>{if(i!==pi)return p;const loans=n?[...p.loans,l]:p.loans.map(x=>x.id===l.id?l:x);return{...p,loans,loanCount:loans.length};}));setEl(null);setSn(false);};
  const delLoan=id=>{if(!confirm("确认删除？"))return;setPkgs(v=>v.map((p,i)=>{if(i!==pi)return p;const loans=p.loans.filter(l=>l.id!==id);return{...p,loans,loanCount:loans.length};}));};
  const recPay=()=>{const amt=parseFloat(pa);if(!amt)return;setPkgs(v=>v.map((p,i)=>{if(i!==pi)return p;const loans=p.loans.map(l=>{if(l.id!==pay.id)return l;const r=l.recovered+amt;return{...l,recovered:r,recoveryRate:l.totalDue>0?r/l.totalDue:0,status:r>=l.totalDue?"已回款":"承诺还款"};});const payments=[...p.payments];if(payments.length){const last=payments[payments.length-1];payments[payments.length-1]={...last,amount:last.amount+amt,cumulative:last.cumulative+amt};}return{...p,loans,payments};}));setPay(null);setPa("");};
  const handleImport=(loans)=>{setPkgs(v=>v.map((p,i)=>{if(i!==pi)return p;const all=[...p.loans,...loans];return{...p,loans:all,loanCount:all.length,payments:genWeekly(all)};}));setShowImport(false);};
  const emptyL={id:`${pkg.id}-L${String(pkg.loans.length+1).padStart(4,"0")}`,name:"",gender:"男",idNumber:"",phone:"",city:"",address:"",originalAmount:0,overduePrincipal:0,overdueInterest:0,totalDue:0,recovered:0,recoveryRate:0,status:"未触达",lastContact:"",nextFollowup:""};

  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><div style={S.pt}>信贷明细管理</div><div style={S.ps}>支持 Excel 批量导入或单条新增</div></div>
      <div style={{display:"flex",gap:10}}><select value={pi} onChange={e=>{setPi(+e.target.value);setPg(0);}} style={S.select}>{pkgs.map((p,i)=><option key={i} value={i}>{p.name}</option>)}</select>
      <button onClick={()=>setShowImport(true)} style={S.btn(T.teal)}>📄 Excel导入</button><button onClick={()=>setSn(true)} style={S.btn()}>+ 单条新增</button></div>
    </div>
    {/* Import panel */}
    {showImport&&<div style={{...S.card,marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:15,fontWeight:600}}>批量导入信贷数据</span><button onClick={()=>setShowImport(false)} style={S.btnG}>收起</button></div><ExcelImport onImport={handleImport} pkgId={pkg.id}/></div>}
    {/* Filters */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["全部",...sList].map(s=><button key={s} onClick={()=>{setFt(s);setPg(0);}} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${ft===s?T.blue:T.border}`,background:ft===s?T.blueBg:T.white,color:ft===s?T.blue:T.tm,fontSize:12,cursor:"pointer",fontFamily:font,fontWeight:ft===s?600:400}}>{s}</button>)}</div>
      <input placeholder="搜索姓名/编号..." value={q} onChange={e=>{setQ(e.target.value);setPg(0);}} style={{...S.input,width:180}}/>
    </div>
    {/* Table */}
    <div style={{...S.card,padding:0,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:0}}>
      <thead><tr>{["编号","姓名","性别","身份证","手机","城市","待收","已收","回收率","状态","操作"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pd.map(l=><tr key={l.id} onMouseEnter={e=>e.currentTarget.style.background=T.bg3} onMouseLeave={e=>e.currentTarget.style.background=""}>
        <td style={{...S.td,fontFamily:mono,fontSize:12,color:T.td}}>{l.id}</td><td style={{...S.td,color:T.text,fontWeight:600}}>{l.name}</td><td style={S.td}>{l.gender}</td>
        <td style={{...S.td,fontFamily:mono,fontSize:12}}>{l.idNumber}</td><td style={{...S.td,fontFamily:mono,fontSize:12}}>{l.phone}</td><td style={S.td}>{l.city}</td>
        <td style={{...S.td,fontFamily:mono}}>¥{fmtF(l.totalDue)}</td><td style={{...S.td,fontFamily:mono,color:l.recovered>0?T.green:T.td}}>¥{fmtF(l.recovered)}</td>
        <td style={S.td}>{pct(l.recoveryRate)}</td><td style={S.td}><Badge s={l.status}/></td>
        <td style={S.td}><div style={{display:"flex",gap:4}}><button onClick={()=>setEl({...l})} style={S.btnSm()}>编辑</button><button onClick={()=>{setPay(l);setPa("");}} style={S.btnSm(T.green)}>回款</button><button onClick={()=>delLoan(l.id)} style={S.btnSm(T.red)}>删</button></div></td>
      </tr>)}</tbody></table></div>
      <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",borderTop:`1px solid ${T.border}`,fontSize:13,color:T.tm}}><span>共 {fl.length} 条</span>
        <div style={{display:"flex",gap:6,alignItems:"center"}}><button onClick={()=>setPg(Math.max(0,pg-1))} disabled={pg===0} style={{...S.btnG,opacity:pg===0?.4:1}}>上一页</button><span style={{padding:"0 6px",fontSize:12}}>{pg+1}/{pgs||1}</span><button onClick={()=>setPg(Math.min(pgs-1,pg+1))} disabled={pg>=pgs-1} style={{...S.btnG,opacity:pg>=pgs-1?.4:1}}>下一页</button></div>
      </div>
    </div>
    <LoanEd open={!!el} loan={el} onClose={()=>setEl(null)} onSave={l=>saveLoan(l,false)} t="编辑信贷信息"/>
    <LoanEd open={sn} loan={emptyL} onClose={()=>setSn(false)} onSave={l=>saveLoan(l,true)} t="新增信贷"/>
    <Modal open={!!pay} onClose={()=>setPay(null)} title={`录入回款 — ${pay?.name||""}`}>{pay&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20,padding:16,background:T.bg3,borderRadius:10}}>
        {[["待收总额","¥"+fmtF(pay.totalDue),T.text],["已收回","¥"+fmtF(pay.recovered),T.green],["剩余","¥"+fmtF(pay.totalDue-pay.recovered),T.amber]].map(([l,v,c],i)=><div key={i}><div style={{fontSize:11,color:T.td}}>{l}</div><div style={{fontWeight:600,fontFamily:mono,color:c,marginTop:2}}>{v}</div></div>)}
      </div>
      <Field label="本次回款金额"><input type="number" value={pa} onChange={e=>setPa(e.target.value)} placeholder="输入金额" style={S.input}/></Field>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:18}}><button onClick={()=>setPay(null)} style={S.btnG}>取消</button><button onClick={recPay} style={S.btn(T.green)}>确认录入</button></div>
    </div>}</Modal>
  </div>;
};
const LoanEd=({open,loan,onClose,onSave,t})=>{const[d,setD]=useState(loan);useEffect(()=>{if(loan)setD({...loan});},[loan]);if(!d)return null;const u=(k,v)=>setD(p=>({...p,[k]:v}));
  const save=()=>{const od=+d.overduePrincipal,oi=+d.overdueInterest;onSave({...d,overduePrincipal:od,overdueInterest:oi,totalDue:od+oi,originalAmount:+d.originalAmount,recovered:+d.recovered,recoveryRate:(od+oi)>0?(+d.recovered)/(od+oi):0});};
  return<Modal open={open} onClose={onClose} title={t}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
    <Field label="姓名"><input value={d.name} onChange={e=>u("name",e.target.value)} style={S.input}/></Field>
    <Field label="性别"><select value={d.gender} onChange={e=>u("gender",e.target.value)} style={{...S.select,width:"100%"}}><option>男</option><option>女</option></select></Field>
    <Field label="身份证号"><input value={d.idNumber} onChange={e=>u("idNumber",e.target.value)} style={S.input}/></Field>
    <Field label="手机号"><input value={d.phone} onChange={e=>u("phone",e.target.value)} style={S.input}/></Field>
    <Field label="城市"><input value={d.city} onChange={e=>u("city",e.target.value)} style={S.input}/></Field>
    <Field label="地址"><input value={d.address} onChange={e=>u("address",e.target.value)} style={S.input}/></Field>
    <Field label="逾期本金"><input type="number" value={d.overduePrincipal} onChange={e=>u("overduePrincipal",e.target.value)} style={S.input}/></Field>
    <Field label="逾期利息"><input type="number" value={d.overdueInterest} onChange={e=>u("overdueInterest",e.target.value)} style={S.input}/></Field>
  </div><div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20}}><button onClick={onClose} style={S.btnG}>取消</button><button onClick={save} style={S.btn()}>保存</button></div></Modal>;
};

/* Company Investors & Benchmark */
const CompanyInvs=({inv,setInv,pkgs})=>{const[ei,setEi]=useState(null);const[sn,setSn]=useState(false);
  const empty={id:"inv"+Date.now(),name:"",phone:"",contractDate:"2025-10-01",share:{},capital:{}};
  const save=(v,n)=>{if(n)setInv(p=>[...p,v]);else setInv(p=>p.map(x=>x.id===v.id?v:x));setEi(null);setSn(false);};
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:22}}><div><div style={S.pt}>投资者管理</div><div style={S.ps}>管理投资者账户与份额</div></div><button onClick={()=>setSn(true)} style={S.btn()}>+ 新增投资者</button></div>
    {inv.map(v=><div key={v.id} style={{...S.card,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${T.blue}20,${T.purple}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,color:T.blue}}>{v.name[0]}</div>
        <div><div style={{fontSize:15,fontWeight:600}}>{v.name}</div><div style={{fontSize:12,color:T.tm}}>签约: {v.contractDate} | {v.phone}</div></div></div>
        <div style={{display:"flex",gap:8}}><button onClick={()=>setEi({...v,share:{...v.share},capital:{...v.capital}})} style={S.btnSm()}>编辑</button><button onClick={()=>{if(confirm("确认删除？"))setInv(p=>p.filter(x=>x.id!==v.id));}} style={S.btnSm(T.red)}>删除</button></div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{pkgs.filter(p=>v.share[p.id]).map(p=>{const r=calcR(p,v);return<div key={p.id} style={{padding:"10px 14px",background:T.bg3,borderRadius:8,flex:1,minWidth:200}}><div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{p.name}</div><div style={{display:"flex",gap:14,fontSize:12}}><span style={{color:T.tm}}>份额: <b style={{color:T.blue}}>{pct(v.share[p.id])}</b></span><span style={{color:T.tm}}>投入: <b>¥{fmtF(r?.cap||0)}</b></span><span style={{color:T.tm}}>净回: <b style={{color:T.green}}>¥{fmtF(Math.round(r?.my||0))}</b></span></div></div>;})}</div>
    </div>)}
    <InvEd open={!!ei} inv={ei} pkgs={pkgs} onClose={()=>setEi(null)} onSave={v=>save(v,false)} t="编辑投资者"/>
    <InvEd open={sn} inv={empty} pkgs={pkgs} onClose={()=>setSn(false)} onSave={v=>save(v,true)} t="新增投资者"/>
  </div>;
};
const InvEd=({open,inv,pkgs,onClose,onSave,t})=>{const[d,setD]=useState(inv);useEffect(()=>{if(inv)setD({...inv,share:{...inv.share},capital:{...inv.capital}});},[inv]);if(!d)return null;const u=(k,v)=>setD(p=>({...p,[k]:v}));
  return<Modal open={open} onClose={onClose} title={t}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><Field label="姓名"><input value={d.name} onChange={e=>u("name",e.target.value)} style={S.input}/></Field><Field label="手机"><input value={d.phone} onChange={e=>u("phone",e.target.value)} style={S.input}/></Field><Field label="签约日期"><input type="date" value={d.contractDate} onChange={e=>u("contractDate",e.target.value)} style={S.input}/></Field></div>
    <div style={{fontSize:14,fontWeight:600,margin:"18px 0 10px",paddingTop:16,borderTop:`1px solid ${T.borderL}`}}>份额分配</div>
    {pkgs.map(p=><div key={p.id} style={{display:"flex",gap:14,alignItems:"center",marginBottom:10,padding:"10px 14px",background:T.bg3,borderRadius:8}}>
      <span style={{fontSize:13,fontWeight:500,minWidth:180}}>{p.name}</span>
      <input type="number" step=".01" placeholder="份额(0~1)" value={d.share[p.id]||""} onChange={e=>{const v=+e.target.value;setD(prev=>({...prev,share:{...prev.share,[p.id]:v},capital:{...prev.capital,[p.id]:Math.round(p.purchasePrice*v)}}));}} style={{...S.input,width:100}}/>
      <span style={{fontSize:12,color:T.tm}}>= ¥{fmtF(Math.round(p.purchasePrice*(d.share[p.id]||0)))}</span>
    </div>)}
    <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20}}><button onClick={onClose} style={S.btnG}>取消</button><button onClick={()=>onSave(d)} style={S.btn()}>保存</button></div>
  </Modal>;
};
const CompanyBm=({bm,setBm})=><div><div style={S.pt}>行业基准设定</div><div style={S.ps}>投资者端回收曲线的行业对比基准线</div><div style={{...S.card,maxWidth:440}}>
  {[["industry3m","3个月行业平均回收率"],["industry6m","6个月行业平均回收率"],["industry12m","12个月行业平均回收率"]].map(([k,l])=><Field key={k} label={l}><div style={{display:"flex",gap:10,alignItems:"center"}}><input type="number" step=".01" value={bm[k]} onChange={e=>setBm({...bm,[k]:+e.target.value})} style={{...S.input,width:130}}/><span style={{fontSize:13,color:T.tm,fontWeight:500}}>{pct(bm[k])}</span></div></Field>)}
  <button style={{...S.btn(),marginTop:8}}>保存</button></div></div>;

/* ================================================================ INVESTOR VIEWS (FUND STYLE, READ-ONLY) ================================================================ */
const InvOverview=({pkg,inv,allInv,bm})=>{
  const r=calcR(pkg,inv);if(!r)return<div style={{textAlign:"center",padding:50,color:T.td}}>未参与此资产包</div>;
  const navVal=r.nav.toFixed(4);const yld=r.yieldRate;const color=r.pb?T.green:T.blue;
  const totalDue=pkg.loans.reduce((s,l)=>s+l.totalDue,0);const totalRec=pkg.loans.reduce((s,l)=>s+l.recovered,0);
  const statusCounts={};pkg.loans.forEach(l=>{statusCounts[l.status]=(statusCounts[l.status]||0)+1;});
  const pieData=Object.entries(statusCounts).map(([k,v])=>({name:k,value:v}));
  const pieColors={"已回款":T.green,"协商中":T.amber,"承诺还款":T.purple,"未触达":"#94a3b8","失联":T.red,"诉讼中":T.coral};
  const tfr=pkg.feeRates.disposal+pkg.feeRates.platform+pkg.feeRates.gp;
  const curveData=pkg.payments.map((p,i)=>({week:p.weekLabel,累计净回款:Math.round(p.cumulative*r.sh*(1-tfr)),本金线:Math.round(r.cap),行业基准:Math.round(r.cap*(bm.industry12m*(i+1)/pkg.payments.length)*(1-tfr))}));
  const others=allInv.filter(x=>x.id!==inv.id&&x.share[pkg.id]);

  return<div>
    <div style={S.pt}>我的投资</div><div style={S.ps}>{pkg.name} · {pkg.source}</div>

    {/* NAV + Payback Row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      {/* Payback */}
      <div style={{...S.card,background:r.pb?T.greenBg:T.blueBg,border:`1px solid ${r.pb?T.greenBd:T.blueBd}`}}>
        <div style={{fontSize:12,color:T.tm,fontWeight:500,marginBottom:6}}>回本进度</div>
        <div style={{display:"flex",alignItems:"baseline",gap:8}}><span style={S.big(color)}>{pct(Math.min(r.r,9.99))}</span>{r.pb&&<span style={S.tag(T.green)}>已回本</span>}</div>
        <div style={{fontSize:13,color:T.body,marginTop:4}}>{r.pb?<>已盈利 <b style={{color:T.green}}>¥{fmtF(Math.round(r.profit))}</b></>:<>距回本还差 <b style={{color:T.amber}}>¥{fmtF(Math.round(r.gap))}</b></>}</div>
        <div style={{width:"100%",height:10,background:r.pb?"#a7f3d050":"#bfdbfe50",borderRadius:10,marginTop:12}}><div style={{width:`${Math.min(r.r*100,100)}%`,height:"100%",background:color,borderRadius:10,transition:"width .5s"}}/></div>
      </div>
      {/* NAV */}
      <div style={S.card}>
        <div style={{fontSize:12,color:T.tm,fontWeight:500,marginBottom:6}}>单位净值</div>
        <div style={{...S.big(parseFloat(navVal)>=1?T.green:T.red),fontSize:32}}>{navVal}</div>
        <div style={{fontSize:13,color:T.body,marginTop:6}}>累计收益率 <b style={{color:yld>=0?T.green:T.red}}>{yld>=0?"+":""}{pct(yld)}</b></div>
        <div style={{fontSize:12,color:T.td,marginTop:4}}>投入 ¥{fmtF(Math.round(r.cap))} · 净回款 ¥{fmtF(Math.round(r.my))}</div>
      </div>
    </div>

    {/* Asset Overview */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:16}}>
      {[["原始面值","¥"+fmt(pkg.faceValue),T.text],["购入折扣",pct(pkg.discountRate),T.blue],["信贷笔数",pkg.loanCount+"笔",T.teal],["整体回收率",pct(totalDue>0?totalRec/totalDue:0),T.amber],["投资倍数",r.moic.toFixed(2)+"x",T.purple]].map(([l,v,c],i)=><div key={i} style={S.card}><div style={{fontSize:11,color:T.td,marginBottom:4}}>{l}</div><div style={{fontSize:16,fontWeight:700,color:c,fontFamily:mono}}>{v}</div></div>)}
    </div>

    {/* Fee (read-only) */}
    <div style={{...S.card,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:14,fontWeight:600}}>费用扣除</span><span style={S.tag(T.td)}>合同锁定</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {[["回款总额(我的份额)","¥"+fmtF(Math.round(r.tot*r.sh)),T.text],["处置服务费("+pct(pkg.feeRates.disposal)+")","-¥"+fmtF(Math.round(r.dFee)),T.coral],["平台费("+pct(pkg.feeRates.platform)+")","-¥"+fmtF(Math.round(r.pFee)),T.amber],["GP管理费("+pct(pkg.feeRates.gp)+")","-¥"+fmtF(Math.round(r.gFee)),T.purple]].map(([l,v,c],i)=><div key={i}><div style={{fontSize:11,color:T.td}}>{l}</div><div style={{fontSize:15,fontWeight:600,color:c,fontFamily:mono,marginTop:2}}>{v}</div></div>)}
      </div>
    </div>

    {/* Charts row */}
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16}}>
      {/* Recovery curve */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontSize:14,fontWeight:600}}>回款趋势</span>
          <div style={{display:"flex",gap:12,fontSize:11}}><span style={{color:T.blue}}>● 累计净回款</span><span style={{color:T.amber}}>● 行业基准</span><span style={{color:T.red,opacity:.6}}>--- 本金</span></div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={curveData} margin={{top:5,right:5,left:5,bottom:0}}>
            <defs><linearGradient id="gB2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.blue} stopOpacity={.15}/><stop offset="95%" stopColor={T.blue} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.borderL}/><XAxis dataKey="week" tick={{fontSize:10,fill:T.td}} interval={3}/><YAxis tick={{fontSize:10,fill:T.td}} tickFormatter={v=>fmt(v)}/>
            <Tooltip contentStyle={tooltipStyle} formatter={v=>`¥${fmtF(v)}`}/>
            <ReferenceLine y={r.cap} stroke={T.red} strokeDasharray="6 4" strokeOpacity={.4}/>
            <Area type="monotone" dataKey="累计净回款" stroke={T.blue} fill="url(#gB2)" strokeWidth={2.5}/>
            <Area type="monotone" dataKey="行业基准" stroke={T.amber} fill="transparent" strokeWidth={1.5} strokeDasharray="4 4"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Status pie */}
      <div style={S.card}>
        <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>催收状态分布</div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={70} innerRadius={38} paddingAngle={2} strokeWidth={0}>
            {pieData.map((d,i)=><Cell key={i} fill={pieColors[d.name]||T.td}/>)}
          </Pie><Legend wrapperStyle={{fontSize:11}} formatter={v=><span style={{color:T.body}}>{v}</span>}/><Tooltip contentStyle={tooltipStyle}/></PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Other investors (subtle) */}
    {others.length>0&&<div style={{padding:"10px 16px",background:T.bg3,borderRadius:8,fontSize:12,color:T.tm}}>
      同包其他投资者：{others.map((o,i)=><span key={o.id}>{o.name}（{pct(o.share[pkg.id])}）{i<others.length-1?" · ":""}</span>)}
    </div>}
  </div>;
};

const InvLoans=({pkg})=>{const[ft,setFt]=useState("全部");const[q,setQ]=useState("");const[pg,setPg]=useState(0);const PS=15;
  const fl=pkg.loans.filter(l=>(ft==="全部"||l.status===ft)&&(!q||l.id.includes(q)));const pgs=Math.ceil(fl.length/PS);const pd=fl.slice(pg*PS,(pg+1)*PS);
  return<div><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={S.pt}>信贷明细</span><span style={S.tag(T.td)}>脱敏</span></div><div style={S.ps}>个人信息已脱敏</div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["全部",...sList].map(s=><button key={s} onClick={()=>{setFt(s);setPg(0);}} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${ft===s?T.blue:T.border}`,background:ft===s?T.blueBg:T.white,color:ft===s?T.blue:T.tm,fontSize:12,cursor:"pointer",fontFamily:font,fontWeight:ft===s?600:400}}>{s}</button>)}</div><input placeholder="搜索编号..." value={q} onChange={e=>{setQ(e.target.value);setPg(0);}} style={{...S.input,width:160}}/></div>
    <div style={{...S.card,padding:0,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:0}}><thead><tr>{["编号","姓名","性别","城市","待收","已收","回收率","状态"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pd.map(l=><tr key={l.id} onMouseEnter={e=>e.currentTarget.style.background=T.bg3} onMouseLeave={e=>e.currentTarget.style.background=""}><td style={{...S.td,fontFamily:mono,fontSize:12,color:T.td}}>{l.id}</td><td style={{...S.td,fontWeight:600}}>{maskN(l.name)}</td><td style={S.td}>{l.gender}</td><td style={S.td}>{maskAddr(l.address)}</td><td style={{...S.td,fontFamily:mono}}>¥{fmtF(l.totalDue)}</td><td style={{...S.td,fontFamily:mono,color:l.recovered>0?T.green:T.td}}>¥{fmtF(l.recovered)}</td><td style={S.td}>{pct(l.recoveryRate)}</td><td style={S.td}><Badge s={l.status}/></td></tr>)}</tbody>
    </table></div>
    <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",borderTop:`1px solid ${T.border}`,fontSize:13,color:T.tm}}><span>共 {fl.length} 条</span><div style={{display:"flex",gap:6,alignItems:"center"}}><button onClick={()=>setPg(Math.max(0,pg-1))} disabled={pg===0} style={{...S.btnG,opacity:pg===0?.4:1}}>上一页</button><span style={{padding:"0 6px",fontSize:12}}>{pg+1}/{pgs||1}</span><button onClick={()=>setPg(Math.min(pgs-1,pg+1))} disabled={pg>=pgs-1} style={{...S.btnG,opacity:pg>=pgs-1?.4:1}}>下一页</button></div></div></div>
  </div>;
};

const InvFlow=({pkg,inv})=>{const sh=inv.share[pkg.id];if(!sh)return null;const tfr=pkg.feeRates.disposal+pkg.feeRates.platform+pkg.feeRates.gp;let cum=0;
  return<div><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={S.pt}>回款流水</span></div><div style={S.ps}>每周扣费与净回款明细</div>
    <div style={{...S.card,padding:0,overflow:"hidden"}}><div style={{maxHeight:500,overflowY:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:0}}>
      <thead><tr>{["周次","日期","周回款","扣费","净回款","累计净回款"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pkg.payments.map((p,i)=>{const g=Math.round(p.amount*sh);const f=Math.round(p.amount*sh*tfr);const n=g-f;cum+=n;
        return<tr key={i} onMouseEnter={e=>e.currentTarget.style.background=T.bg3} onMouseLeave={e=>e.currentTarget.style.background=""}><td style={{...S.td,fontWeight:600}}>{p.weekLabel}</td><td style={{...S.td,fontSize:12,color:T.tm}}>{p.date}</td><td style={{...S.td,fontFamily:mono}}>¥{fmtF(g)}</td><td style={{...S.td,fontFamily:mono,color:T.red}}>-¥{fmtF(f)}</td><td style={{...S.td,fontFamily:mono,color:T.green}}>¥{fmtF(n)}</td><td style={{...S.td,fontFamily:mono,fontWeight:600,color:T.blue}}>¥{fmtF(Math.round(cum))}</td></tr>;})}</tbody>
    </table></div></div>
  </div>;
};

/* ================================================================ MAIN ================================================================ */
const CTABS=[["dash","运营概览"],["pkgs","资产包管理"],["loans","信贷明细"],["invs","投资者管理"],["bm","行业基准"]];
const ITABS=[["overview","我的投资"],["loans","信贷明细"],["flow","回款流水"]];

export default function App(){
  useEffect(()=>{if(!document.getElementById("nf")){const l=document.createElement("link");l.id="nf";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap";document.head.appendChild(l);}},[]);
  const[role,setRole]=useState(null);// "company"|"investor"
  const[invId,setInvId]=useState("inv1");
  const[pkgs,setPkgs]=useState(initPkgs);const[inv,setInv]=useState(initInv);const[bm,setBm]=useState(initBm);
  const[ct,setCt]=useState("dash");const[it,setIt]=useState("overview");const[sp,setSp]=useState(0);
  const[loginTab,setLoginTab]=useState("company");const[pw,setPw]=useState("");const[invPw,setInvPw]=useState("");const[loginInvId,setLoginInvId]=useState("inv1");const[err,setErr]=useState("");const[showForgot,setShowForgot]=useState(false);

  const handleLogin=()=>{
    if(loginTab==="company"){if(pw==="admin888"){setRole("company");setErr("");setPw("");}else setErr("管理密码错误");}
    else{const found=inv.find(i=>i.id===loginInvId);if(found&&invPw===found.password){setRole("investor");setInvId(loginInvId);setErr("");setInvPw("");}else setErr("密码错误");}
  };

  if(!role)return<div style={{minHeight:"100vh",background:T.white,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font,color:T.text}}>
    <div style={{width:420,maxWidth:"90vw"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:56,height:56,borderRadius:14,background:`linear-gradient(135deg,${T.blue},${T.purple})`,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <div style={{fontSize:24,fontWeight:700,letterSpacing:"-.02em"}}>NPL Asset Tracker</div>
        <div style={{fontSize:14,color:T.tm,marginTop:4}}>不良资产投资管理平台</div>
      </div>
      <div style={{background:T.white,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",borderBottom:`1px solid ${T.border}`}}>
          {[["company","公司管理端"],["investor","投资者端"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setLoginTab(k);setErr("");}} style={{flex:1,padding:"14px 0",background:"transparent",color:loginTab===k?T.blue:T.td,border:"none",fontSize:14,fontWeight:loginTab===k?600:400,cursor:"pointer",fontFamily:font,borderBottom:loginTab===k?`2px solid ${T.blue}`:"2px solid transparent",transition:"all .15s"}}>{l}</button>
          ))}
        </div>
        <div style={{padding:32}}>
          {loginTab==="company"?<>
            <Field label="管理密码"><input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="请输入管理密码" style={S.input}/></Field>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:11,color:T.td,padding:"6px 10px",background:T.bg3,borderRadius:6}}>演示密码: admin888</div>
              <button onClick={()=>setShowForgot(true)} style={{background:"none",border:"none",color:T.blue,fontSize:12,cursor:"pointer",fontFamily:font}}>忘记密码？</button>
            </div>
            <button onClick={handleLogin} style={{...S.btn(),width:"100%",padding:"11px 0",fontSize:14}}>登录管理后台</button>
          </>:<>
            <Field label="选择账户"><select value={loginInvId} onChange={e=>setLoginInvId(e.target.value)} style={{...S.select,width:"100%"}}>{inv.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></Field>
            <Field label="密码"><input type="password" value={invPw} onChange={e=>setInvPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="请输入密码" style={S.input}/></Field>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:11,color:T.td,padding:"6px 10px",background:T.bg3,borderRadius:6}}>演示密码: zhang123 / li123 / wang123</div>
              <button onClick={()=>setShowForgot(true)} style={{background:"none",border:"none",color:T.blue,fontSize:12,cursor:"pointer",fontFamily:font}}>忘记密码？</button>
            </div>
            <button onClick={handleLogin} style={{...S.btn(T.teal),width:"100%",padding:"11px 0",fontSize:14}}>登录投资者端</button>
          </>}
          {err&&<div style={{marginTop:14,fontSize:13,color:T.red,textAlign:"center",padding:"8px",background:T.redBg,borderRadius:8}}>{err}</div>}
        </div>
      </div>
      <div style={{textAlign:"center",marginTop:20,fontSize:12,color:T.td}}>© 2025 NPL Asset Tracker</div>
      <Modal open={showForgot} onClose={()=>setShowForgot(false)} title="忘记密码">
        <div style={{padding:"16px 0",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🔒</div>
          <div style={{fontSize:14,color:T.body,marginBottom:8}}>请联系管理员重置密码</div>
          <div style={{fontSize:13,color:T.tm}}>电话：400-XXX-XXXX</div>
          <div style={{fontSize:13,color:T.tm}}>邮箱：admin@npltracker.com</div>
          <button onClick={()=>setShowForgot(false)} style={{...S.btn(),marginTop:20}}>知道了</button>
        </div>
      </Modal>
    </div>
  </div>;

  const isC=role==="company";const tabs=isC?CTABS:ITABS;const at=isC?ct:it;const setAt=isC?setCt:setIt;
  const curInv=inv.find(i=>i.id===invId);
  const invPkgs=curInv?pkgs.filter(p=>curInv.share[p.id]):pkgs;const curPkg=invPkgs[sp]||invPkgs[0];

  const content=()=>{if(isC){switch(ct){case"dash":return<CompanyDash pkgs={pkgs} inv={inv}/>;case"pkgs":return<CompanyPkgs pkgs={pkgs} setPkgs={setPkgs}/>;case"loans":return<CompanyLoans pkgs={pkgs} setPkgs={setPkgs}/>;case"invs":return<CompanyInvs inv={inv} setInv={setInv} pkgs={pkgs}/>;case"bm":return<CompanyBm bm={bm} setBm={setBm}/>;}}
    else{if(!curPkg)return<div style={{textAlign:"center",padding:60,color:T.td}}>暂无参与的资产包</div>;switch(it){case"overview":return<InvOverview pkg={curPkg} inv={curInv} allInv={inv} bm={bm}/>;case"loans":return<InvLoans pkg={curPkg}/>;case"flow":return<InvFlow pkg={curPkg} inv={curInv}/>;}}
  };

  return<div style={{fontFamily:font,background:T.bg,color:T.text,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${T.blue},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
        <span style={{fontSize:16,fontWeight:700}}>NPL Asset Tracker</span>
        <span style={{fontSize:11,fontWeight:600,color:isC?T.blue:T.teal,padding:"3px 10px",background:isC?T.blueBg:T.greenBg,borderRadius:6}}>{isC?"管理端":"投资者端"}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {!isC&&<>{invPkgs.length>1&&<select value={sp} onChange={e=>setSp(+e.target.value)} style={S.select}>{invPkgs.map((p,i)=><option key={i} value={i}>{p.name}</option>)}</select>}
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",background:T.bg3,borderRadius:8}}><div style={{width:24,height:24,borderRadius:6,background:`linear-gradient(135deg,${T.blue}20,${T.purple}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:T.blue}}>{curInv?.name[0]}</div><span style={{fontSize:13,color:T.body,fontWeight:500}}>{curInv?.name}</span></div></>}
        <button onClick={()=>{setRole(null);setCt("dash");setIt("overview");setSp(0);}} style={S.btnG}>退出</button>
      </div>
    </div>
    <div style={{display:"flex",flex:1}}>
      <div style={{width:200,background:T.sidebar,padding:"16px 0",flexShrink:0}}>
        <div style={{padding:"0 22px 14px",fontSize:11,color:T.sideT,letterSpacing:".08em",fontWeight:500}}>{isC?"管理菜单":"投资者菜单"}</div>
        {tabs.map(([k,l])=><div key={k} onClick={()=>setAt(k)} style={{padding:"10px 22px",fontSize:13,cursor:"pointer",color:at===k?T.sideA:T.sideT,background:at===k?"rgba(255,255,255,.08)":"transparent",borderLeft:at===k?`3px solid ${isC?T.blueL:T.teal}`:"3px solid transparent",fontWeight:at===k?600:400,transition:"all .15s"}}>{l}</div>)}
      </div>
      <div style={{flex:1,padding:28,overflowY:"auto",maxHeight:"calc(100vh - 56px)"}}>{content()}</div>
    </div>
  </div>;
}
