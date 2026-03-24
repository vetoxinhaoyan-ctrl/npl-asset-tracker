import { useState, useMemo, useCallback, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, PieChart, Pie, Cell, Legend, ReferenceLine } from "recharts";

/* ================================================================
   THEME — LIGHT PROFESSIONAL
   ================================================================ */
const T = {
  bg: "#f5f6f8",
  white: "#ffffff",
  bg2: "#ffffff",
  bg3: "#f9fafb",
  bg4: "#f0f2f5",
  bgHover: "#f5f7fa",
  sidebar: "#1a1f2e",
  sidebarHover: "#252b3d",
  sidebarText: "#a0a8be",
  sidebarActive: "#ffffff",
  border: "#e2e5ea",
  borderLight: "#edf0f4",
  text: "#1a1f2e",
  textBody: "#374151",
  tm: "#6b7280",
  td: "#9ca3af",
  blue: "#2563eb",
  blueL: "#3b82f6",
  blueBg: "#eff6ff",
  blueBorder: "#bfdbfe",
  green: "#059669",
  greenL: "#10b981",
  greenBg: "#ecfdf5",
  greenBorder: "#a7f3d0",
  red: "#dc2626",
  redL: "#ef4444",
  redBg: "#fef2f2",
  amber: "#d97706",
  amberL: "#f59e0b",
  amberBg: "#fffbeb",
  purple: "#7c3aed",
  purpleL: "#8b5cf6",
  coral: "#ea580c",
  teal: "#0d9488",
  pink: "#db2777",
  accent: "#2563eb",
};

const font = '"Noto Sans SC","DM Sans",-apple-system,system-ui,sans-serif';
const mono = '"DM Sans","SF Mono",monospace';

/* ================================================================
   DATA GENERATION
   ================================================================ */
const surnames=["张","李","王","刘","陈","杨","赵","黄","周","吴","徐","孙","胡","朱","高","林","何","郭","马","罗"];
const givenNames=["伟","芳","娜","秀英","敏","静","丽","强","磊","军","洋","勇","艳","杰","娟","涛","明","超","秀兰","霞"];
const cities=["北京市","上海市","广州市","深圳市","杭州市","成都市","武汉市","南京市","重庆市","天津市"];
const statusList=["未触达","协商中","承诺还款","已回款","失联","诉讼中"];
const rn=a=>a[Math.floor(Math.random()*a.length)];
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

function genLoans(pkgId,n){
  const arr=[];
  for(let i=0;i<n;i++){
    const nm=rn(surnames)+rn(givenNames)+(Math.random()>.5?rn(givenNames):"");
    const gender=Math.random()>.45?"男":"女";
    const orig=ri(5,800)*100;
    const od=Math.round(orig*(.8+Math.random()*.2));
    const oi=Math.round(orig*(.05+Math.random()*.3));
    const td2=od+oi;
    const st=rn(statusList);
    const rec=st==="已回款"?Math.round(td2*(.2+Math.random()*.6)):st==="承诺还款"?Math.round(td2*Math.random()*.2):st==="协商中"?Math.round(td2*Math.random()*.1):0;
    arr.push({id:`${pkgId}-L${String(i+1).padStart(4,"0")}`,name:nm,gender,idNumber:`${ri(110000,650000)}${ri(1970,2005)}${String(ri(1,12)).padStart(2,"0")}${String(ri(1,28)).padStart(2,"0")}${ri(1000,9999)}`,phone:`1${ri(3,8)}${ri(100000000,999999999)}`,city:rn(cities),address:`${rn(cities)}某区某路${ri(1,200)}号`,originalAmount:orig,overduePrincipal:od,overdueInterest:oi,totalDue:td2,recovered:rec,recoveryRate:td2>0?rec/td2:0,status:st,lastContact:`2025-${String(ri(4,9)).padStart(2,"0")}-${String(ri(1,28)).padStart(2,"0")}`,nextFollowup:`2025-${String(ri(10,12)).padStart(2,"0")}-${String(ri(1,28)).padStart(2,"0")}`});
  }
  return arr;
}
function genWeekly(loans,weeks=28){
  const tot=loans.reduce((s,l)=>s+l.recovered,0);let cum=0;const arr=[];
  for(let i=1;i<=weeks;i++){const f=Math.max(.01,1-(i/weeks)*.7);const a=Math.round(Math.max(0,Math.min((tot/weeks)*f*(1+(Math.random()-.3)*.5)*2,tot-cum)));cum+=a;if(cum>tot)cum=tot;arr.push({week:i,weekLabel:`第${i}周`,amount:a,cumulative:cum,date:`2025-${String(3+Math.floor((i-1)/4)).padStart(2,"0")}-${String(((i-1)%4)*7+1).padStart(2,"0")}`});}
  if(arr.length&&arr[arr.length-1].cumulative<tot){arr[arr.length-1].amount+=tot-arr[arr.length-1].cumulative;arr[arr.length-1].cumulative=tot;}
  return arr;
}

const initPkgs=[
  {id:"PKG-2025-001",name:"华东个贷不良资产包A",source:"东方资产管理",purchaseDate:"2025-03-15",faceValue:8500000,purchasePrice:500000,status:"处置中",feeRates:{disposal:.08,platform:.03,gp:.02},loans:genLoans("PKG001",86)},
  {id:"PKG-2025-002",name:"华南消费贷不良资产包B",source:"长城资产管理",purchaseDate:"2025-06-01",faceValue:12000000,purchasePrice:480000,status:"处置中",feeRates:{disposal:.07,platform:.03,gp:.025},loans:genLoans("PKG002",120)},
];
initPkgs.forEach(p=>{p.loanCount=p.loans.length;p.discountRate=p.purchasePrice/p.faceValue;p.payments=genWeekly(p.loans);});

const initInvestors=[
  {id:"inv1",name:"张伟",share:{"PKG-2025-001":.45,"PKG-2025-002":.55},capital:{"PKG-2025-001":225000,"PKG-2025-002":264000},phone:"13812345678",contractDate:"2025-03-01",password:"zhang123"},
  {id:"inv2",name:"李芳",share:{"PKG-2025-001":.35,"PKG-2025-002":.45},capital:{"PKG-2025-001":175000,"PKG-2025-002":216000},phone:"13987654321",contractDate:"2025-03-05",password:"li123"},
  {id:"inv3",name:"王强",share:{"PKG-2025-001":.20},capital:{"PKG-2025-001":100000},phone:"13611112222",contractDate:"2025-03-10",password:"wang123"},
];
const initBenchmark={industry3m:.15,industry6m:.32,industry12m:.55};

/* ================================================================
   UTILS
   ================================================================ */
const maskN=n=>n?n[0]+"**":"**";
const maskAddr=a=>{if(!a)return"";const m=a.match(/(.*?市)/);return m?m[1]:a.slice(0,3)+"...";};
const fmt=n=>n>=10000?(n/10000).toFixed(2)+"万":n.toLocaleString("zh-CN");
const fmtF=n=>Math.round(n).toLocaleString("zh-CN");
const pct=n=>(n*100).toFixed(2)+"%";

function calcReturns(pkg,inv){
  const sh=inv.share[pkg.id];if(!sh)return null;
  const cap=inv.capital[pkg.id]||pkg.purchasePrice*sh;
  const totRec=pkg.loans.reduce((s,l)=>s+l.recovered,0);
  const fr=pkg.feeRates;const tf=totRec*(fr.disposal+fr.platform+fr.gp);
  const net=totRec-tf;const myNet=net*sh;const ratio=cap>0?myNet/cap:0;const profit=myNet-cap;
  return{cap,totRec,disposalFee:totRec*fr.disposal,platformFee:totRec*fr.platform,gpFee:totRec*fr.gp,totalFees:tf,net,myNet,ratio,profit,paidBack:ratio>=1,marginal:ratio>=1?profit:0,gap:ratio>=1?0:cap-myNet,share:sh,moic:cap>0?myNet/cap:0};
}

/* ================================================================
   STYLES
   ================================================================ */
const S = {
  btn:(c=T.blue)=>({padding:"8px 20px",borderRadius:8,border:"none",background:c,color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:font,transition:"all .15s"}),
  btnO:(c=T.blue)=>({padding:"8px 20px",borderRadius:8,border:`1px solid ${c}`,background:"transparent",color:c,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:font}),
  btnSm:(c=T.blue)=>({padding:"5px 14px",borderRadius:6,border:"none",background:c,color:"#fff",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:font}),
  btnGhost:{padding:"5px 14px",borderRadius:6,border:`1px solid ${T.border}`,background:T.white,color:T.textBody,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:font},
  input:{background:T.white,border:`1px solid ${T.border}`,color:T.text,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:font,outline:"none",width:"100%",boxSizing:"border-box",transition:"border-color .15s"},
  select:{background:T.white,border:`1px solid ${T.border}`,color:T.text,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:font,outline:"none",cursor:"pointer"},
  label:{fontSize:12,color:T.tm,display:"block",marginBottom:5,fontWeight:500},
  card:{background:T.white,borderRadius:12,border:`1px solid ${T.border}`,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.04)"},
  th:{padding:"10px 14px",textAlign:"left",fontWeight:600,color:T.tm,borderBottom:`1px solid ${T.border}`,fontSize:11,letterSpacing:".04em",background:T.bg3},
  td:{padding:"10px 14px",borderBottom:`1px solid ${T.borderLight}`,color:T.textBody,fontSize:13},
  badge:c=>({display:"inline-block",padding:"3px 12px",borderRadius:50,fontSize:11,fontWeight:600,background:c+"12",color:c}),
  tag:c=>({display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:500,background:c+"10",color:c}),
  bigNum:(c=T.text)=>({fontSize:28,fontWeight:700,color:c,fontFamily:mono,letterSpacing:"-.02em"}),
  modal:{position:"fixed",inset:0,background:"rgba(0,0,0,.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000},
  modalInner:{background:T.white,borderRadius:16,border:`1px solid ${T.border}`,padding:32,width:540,maxWidth:"92vw",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.12)"},
  pageTitle:{fontSize:20,fontWeight:700,color:T.text,letterSpacing:"-.01em"},
  pageSub:{fontSize:13,color:T.tm,marginTop:3,marginBottom:22},
};

/* ================================================================
   MICRO COMPONENTS
   ================================================================ */
const Badge=({s})=>{const c={"未触达":T.td,"协商中":T.amber,"承诺还款":T.purple,"已回款":T.green,"失联":T.red,"诉讼中":T.coral,"核销":T.td};return<span style={S.badge(c[s]||T.td)}>{s}</span>;};

const Modal=({open,onClose,title,children})=>{
  if(!open)return null;
  return<div style={S.modal} onClick={onClose}><div style={S.modalInner} onClick={e=>e.stopPropagation()}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
      <div style={{fontSize:17,fontWeight:700,color:T.text}}>{title}</div>
      <button onClick={onClose} style={{background:"none",border:"none",color:T.td,fontSize:22,cursor:"pointer",fontFamily:font,lineHeight:1}}>✕</button>
    </div>{children}
  </div></div>;
};

const Field=({label,children})=><div style={{marginBottom:16}}><label style={S.label}>{label}</label>{children}</div>;

const StatCard=({label,value,color,sub,icon})=>(
  <div style={S.card}>
    <div style={{fontSize:12,color:T.tm,fontWeight:500,marginBottom:8}}>{label}</div>
    <div style={{...S.bigNum(color||T.text),fontSize:24}}>{value}</div>
    {sub&&<div style={{fontSize:12,color:T.td,marginTop:4}}>{sub}</div>}
  </div>
);

const tooltipStyle={background:T.white,border:`1px solid ${T.border}`,borderRadius:10,fontSize:12,color:T.text,boxShadow:"0 4px 12px rgba(0,0,0,.08)"};

/* ================================================================
   LOGIN SCREEN
   ================================================================ */
const LoginScreen=({onLogin,investors})=>{
  const[tab,setTab]=useState("company");
  const[pw,setPw]=useState("");const[invId,setInvId]=useState(investors[0]?.id||"");const[invPw,setInvPw]=useState("");const[err,setErr]=useState("");
  const go=()=>{if(tab==="company"){if(pw==="admin888"){onLogin("company",null);setErr("");}else setErr("管理密码错误");}else{const inv=investors.find(i=>i.id===invId);if(inv&&invPw===inv.password){onLogin("investor",invId);setErr("");}else setErr("密码错误");}};
  return(
    <div style={{minHeight:"100vh",background:T.white,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font,color:T.text}}>
      <div style={{width:420,maxWidth:"90vw"}}>
        {/* Brand */}
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:56,height:56,borderRadius:14,background:`linear-gradient(135deg,${T.blue},${T.purple})`,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div style={{fontSize:24,fontWeight:700,color:T.text,letterSpacing:"-.02em"}}>NPL Asset Tracker</div>
          <div style={{fontSize:14,color:T.tm,marginTop:4}}>不良资产投资管理平台</div>
        </div>
        {/* Card */}
        <div style={{background:T.white,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,.06)"}}>
          <div style={{display:"flex",borderBottom:`1px solid ${T.border}`}}>
            {[["company","公司管理端"],["investor","投资者端"]].map(([k,l])=>(
              <button key={k} onClick={()=>{setTab(k);setErr("");}} style={{flex:1,padding:"14px 0",background:"transparent",color:tab===k?T.blue:T.td,border:"none",fontSize:14,fontWeight:tab===k?600:400,cursor:"pointer",fontFamily:font,borderBottom:tab===k?`2px solid ${T.blue}`:"2px solid transparent",transition:"all .15s"}}>{l}</button>
            ))}
          </div>
          <div style={{padding:32}}>
            {tab==="company"?<>
              <Field label="管理密码"><input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="请输入管理密码" style={S.input}/></Field>
              <div style={{fontSize:11,color:T.td,marginBottom:20,padding:"6px 10px",background:T.bg3,borderRadius:6}}>演示密码: admin888</div>
              <button onClick={go} style={{...S.btn(),width:"100%",padding:"11px 0",fontSize:14}}>登录管理后台</button>
            </>:<>
              <Field label="选择投资者"><select value={invId} onChange={e=>setInvId(e.target.value)} style={{...S.select,width:"100%"}}>{investors.map(inv=><option key={inv.id} value={inv.id}>{inv.name}</option>)}</select></Field>
              <Field label="密码"><input type="password" value={invPw} onChange={e=>setInvPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="请输入密码" style={S.input}/></Field>
              <div style={{fontSize:11,color:T.td,marginBottom:20,padding:"6px 10px",background:T.bg3,borderRadius:6}}>演示密码: zhang123 / li123 / wang123</div>
              <button onClick={go} style={{...S.btn(T.teal),width:"100%",padding:"11px 0",fontSize:14}}>登录投资者端</button>
            </>}
            {err&&<div style={{marginTop:14,fontSize:13,color:T.red,textAlign:"center",padding:"8px",background:T.redBg,borderRadius:8}}>{err}</div>}
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:24,fontSize:12,color:T.td}}>© 2025 NPL Asset Tracker · Prototype v1.0</div>
      </div>
    </div>
  );
};

/* ================================================================
   COMPANY: PACKAGE MANAGEMENT
   ================================================================ */
const CompanyPackages=({pkgs,setPkgs})=>{
  const[editPkg,setEditPkg]=useState(null);const[showNew,setShowNew]=useState(false);
  const emptyPkg={id:"PKG-2025-"+String(ri(100,999)),name:"",source:"",purchaseDate:"2025-10-01",faceValue:0,purchasePrice:0,status:"处置中",feeRates:{disposal:.08,platform:.03,gp:.02},loans:[],payments:[],loanCount:0,discountRate:0};
  const save=(p,isNew)=>{p.loanCount=p.loans.length;p.discountRate=p.faceValue>0?p.purchasePrice/p.faceValue:0;if(isNew)setPkgs(prev=>[...prev,p]);else setPkgs(prev=>prev.map(x=>x.id===p.id?p:x));setEditPkg(null);setShowNew(false);};
  const remove=id=>{if(confirm("确认删除该资产包？"))setPkgs(prev=>prev.filter(x=>x.id!==id));};
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
      <div><div style={S.pageTitle}>资产包管理</div><div style={S.pageSub}>新增、编辑、删除资产包信息</div></div>
      <button onClick={()=>setShowNew(true)} style={S.btn()}>+ 新增资产包</button>
    </div>
    {pkgs.map(p=>{const rec=p.loans.reduce((s,l)=>s+l.recovered,0);const due=p.loans.reduce((s,l)=>s+l.totalDue,0);return(
      <div key={p.id} style={{...S.card,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:16,fontWeight:600,color:T.text,marginBottom:4}}>{p.name}</div><div style={{fontSize:12,color:T.tm}}>来源: {p.source} | 购入: {p.purchaseDate} | {p.loanCount}笔 | 折扣率: {pct(p.discountRate)}</div></div>
          <div style={{display:"flex",gap:8}}><button onClick={()=>setEditPkg({...p,feeRates:{...p.feeRates}})} style={S.btnSm()}>编辑</button><button onClick={()=>remove(p.id)} style={S.btnSm(T.red)}>删除</button></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginTop:16,padding:"14px 0 0",borderTop:`1px solid ${T.borderLight}`}}>
          {[["面值",`¥${fmtF(p.faceValue)}`,T.text],["购入价",`¥${fmtF(p.purchasePrice)}`,T.text],["已回款",`¥${fmtF(rec)}`,T.green],["回收率",pct(due>0?rec/due:0),T.amber],["费率(处/平/GP)",`${(p.feeRates.disposal*100).toFixed(0)}%/${(p.feeRates.platform*100).toFixed(0)}%/${(p.feeRates.gp*100).toFixed(0)}%`,T.purple]].map(([l,v,c],i)=>(
            <div key={i}><div style={{fontSize:11,color:T.td,marginBottom:3}}>{l}</div><div style={{fontSize:15,fontWeight:600,color:c,fontFamily:mono}}>{v}</div></div>))}
        </div>
      </div>);
    })}
    <PkgEditor open={!!editPkg} pkg={editPkg} onClose={()=>setEditPkg(null)} onSave={p=>save(p,false)} title="编辑资产包"/>
    <PkgEditor open={showNew} pkg={emptyPkg} onClose={()=>setShowNew(false)} onSave={p=>save(p,true)} title="新增资产包"/>
  </div>);
};

const PkgEditor=({open,pkg,onClose,onSave,title})=>{
  const[d,setD]=useState(pkg);useEffect(()=>{if(pkg)setD({...pkg,feeRates:{...pkg.feeRates}});},[pkg]);if(!d)return null;
  const u=(k,v)=>setD(p=>({...p,[k]:v}));const uf=(k,v)=>setD(p=>({...p,feeRates:{...p.feeRates,[k]:v}}));
  return<Modal open={open} onClose={onClose} title={title}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Field label="资产包名称"><input value={d.name} onChange={e=>u("name",e.target.value)} style={S.input}/></Field>
      <Field label="来源AMC"><input value={d.source} onChange={e=>u("source",e.target.value)} style={S.input}/></Field>
      <Field label="购入日期"><input type="date" value={d.purchaseDate} onChange={e=>u("purchaseDate",e.target.value)} style={S.input}/></Field>
      <Field label="状态"><select value={d.status} onChange={e=>u("status",e.target.value)} style={{...S.select,width:"100%"}}>
        {["处置中","已结案","部分结案"].map(s=><option key={s}>{s}</option>)}</select></Field>
      <Field label="原始债权面值"><input type="number" value={d.faceValue} onChange={e=>u("faceValue",+e.target.value)} style={S.input}/></Field>
      <Field label="购入价格"><input type="number" value={d.purchasePrice} onChange={e=>u("purchasePrice",+e.target.value)} style={S.input}/></Field>
    </div>
    <div style={{fontSize:14,fontWeight:600,color:T.text,margin:"20px 0 12px",paddingTop:16,borderTop:`1px solid ${T.borderLight}`}}>合同锁定费率</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
      <Field label="处置服务费率"><input type="number" step=".01" value={d.feeRates.disposal} onChange={e=>uf("disposal",+e.target.value)} style={S.input}/></Field>
      <Field label="平台服务费率"><input type="number" step=".01" value={d.feeRates.platform} onChange={e=>uf("platform",+e.target.value)} style={S.input}/></Field>
      <Field label="GP管理费率"><input type="number" step=".01" value={d.feeRates.gp} onChange={e=>uf("gp",+e.target.value)} style={S.input}/></Field>
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:24}}>
      <button onClick={onClose} style={S.btnO()}>取消</button><button onClick={()=>onSave(d)} style={S.btn()}>保存</button>
    </div>
  </Modal>;
};

/* ================================================================
   COMPANY: LOANS
   ================================================================ */
const CompanyLoans=({pkgs,setPkgs})=>{
  const[pkgIdx,setPkgIdx]=useState(0);const[editLoan,setEditLoan]=useState(null);const[showNew,setShowNew]=useState(false);
  const[payLoan,setPayLoan]=useState(null);const[payAmt,setPayAmt]=useState("");
  const[filter,setFilter]=useState("全部");const[search,setSearch]=useState("");const[page,setPage]=useState(0);const PS=15;
  const pkg=pkgs[pkgIdx];
  const fl=pkg.loans.filter(l=>{if(filter!=="全部"&&l.status!==filter)return false;if(search&&!l.name.includes(search)&&!l.id.includes(search))return false;return true;});
  const pages=Math.ceil(fl.length/PS);const pd=fl.slice(page*PS,(page+1)*PS);
  const saveLoan=(loan,isNew)=>{setPkgs(prev=>prev.map((p,i)=>{if(i!==pkgIdx)return p;const loans=isNew?[...p.loans,loan]:p.loans.map(l=>l.id===loan.id?loan:l);return{...p,loans,loanCount:loans.length};}));setEditLoan(null);setShowNew(false);};
  const removeLoan=id=>{if(!confirm("确认删除？"))return;setPkgs(prev=>prev.map((p,i)=>{if(i!==pkgIdx)return p;const loans=p.loans.filter(l=>l.id!==id);return{...p,loans,loanCount:loans.length};}));};
  const recordPay=()=>{const amt=parseFloat(payAmt);if(!amt||amt<=0)return;setPkgs(prev=>prev.map((p,i)=>{if(i!==pkgIdx)return p;const loans=p.loans.map(l=>{if(l.id!==payLoan.id)return l;const rec=l.recovered+amt;return{...l,recovered:rec,recoveryRate:l.totalDue>0?rec/l.totalDue:0,status:rec>=l.totalDue?"已回款":"承诺还款"};});const payments=[...p.payments];if(payments.length){const last=payments[payments.length-1];payments[payments.length-1]={...last,amount:last.amount+amt,cumulative:last.cumulative+amt};}return{...p,loans,payments};}));setPayLoan(null);setPayAmt("");};
  const emptyLoan={id:`${pkg.id}-L${String(pkg.loans.length+1).padStart(4,"0")}`,name:"",gender:"男",idNumber:"",phone:"",city:"",address:"",originalAmount:0,overduePrincipal:0,overdueInterest:0,totalDue:0,recovered:0,recoveryRate:0,status:"未触达",lastContact:"",nextFollowup:""};

  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><div style={S.pageTitle}>信贷明细管理</div><div style={S.pageSub}>编辑信贷人信息、录入回款</div></div>
      <div style={{display:"flex",gap:10}}><select value={pkgIdx} onChange={e=>{setPkgIdx(+e.target.value);setPage(0);}} style={S.select}>{pkgs.map((p,i)=><option key={i} value={i}>{p.name}</option>)}</select><button onClick={()=>setShowNew(true)} style={S.btn()}>+ 新增信贷</button></div>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["全部",...statusList].map(s=><button key={s} onClick={()=>{setFilter(s);setPage(0);}} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${filter===s?T.blue:T.border}`,background:filter===s?T.blueBg:T.white,color:filter===s?T.blue:T.tm,fontSize:12,cursor:"pointer",fontFamily:font,fontWeight:filter===s?600:400}}>{s}</button>)}</div>
      <input placeholder="搜索姓名/编号..." value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} style={{...S.input,width:180}}/>
    </div>
    <div style={{...S.card,padding:0,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:0}}>
        <thead><tr>{["编号","姓名","性别","身份证","手机","城市","待收","已收","回收率","状态","操作"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{pd.map(l=><tr key={l.id} style={{transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=T.bg3} onMouseLeave={e=>e.currentTarget.style.background=""}>
          <td style={{...S.td,fontFamily:mono,fontSize:12,color:T.td}}>{l.id}</td>
          <td style={{...S.td,color:T.text,fontWeight:600}}>{l.name}</td>
          <td style={S.td}>{l.gender}</td>
          <td style={{...S.td,fontFamily:mono,fontSize:12}}>{l.idNumber}</td>
          <td style={{...S.td,fontFamily:mono,fontSize:12}}>{l.phone}</td>
          <td style={S.td}>{l.city}</td>
          <td style={{...S.td,fontFamily:mono,fontWeight:500}}>¥{fmtF(l.totalDue)}</td>
          <td style={{...S.td,fontFamily:mono,fontWeight:500,color:l.recovered>0?T.green:T.td}}>¥{fmtF(l.recovered)}</td>
          <td style={S.td}>{pct(l.recoveryRate)}</td>
          <td style={S.td}><Badge s={l.status}/></td>
          <td style={S.td}><div style={{display:"flex",gap:4}}><button onClick={()=>setEditLoan({...l})} style={S.btnSm()}>编辑</button><button onClick={()=>{setPayLoan(l);setPayAmt("");}} style={S.btnSm(T.green)}>回款</button><button onClick={()=>removeLoan(l.id)} style={S.btnSm(T.red)}>删</button></div></td>
        </tr>)}</tbody>
      </table></div>
      <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${T.border}`,fontSize:13,color:T.tm}}>
        <span>共 {fl.length} 条</span>
        <div style={{display:"flex",gap:6,alignItems:"center"}}><button onClick={()=>setPage(Math.max(0,page-1))} disabled={page===0} style={{...S.btnGhost,opacity:page===0?.4:1}}>上一页</button><span style={{padding:"0 6px",fontSize:12}}>{page+1}/{pages||1}</span><button onClick={()=>setPage(Math.min(pages-1,page+1))} disabled={page>=pages-1} style={{...S.btnGhost,opacity:page>=pages-1?.4:1}}>下一页</button></div>
      </div>
    </div>
    <LoanEditor open={!!editLoan} loan={editLoan} onClose={()=>setEditLoan(null)} onSave={l=>saveLoan(l,false)} title="编辑信贷信息"/>
    <LoanEditor open={showNew} loan={emptyLoan} onClose={()=>setShowNew(false)} onSave={l=>saveLoan(l,true)} title="新增信贷"/>
    <Modal open={!!payLoan} onClose={()=>setPayLoan(null)} title={`录入回款 — ${payLoan?.name||""}`}>
      {payLoan&&<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20,padding:16,background:T.bg3,borderRadius:10}}>
          <div><div style={{fontSize:11,color:T.td}}>待收总额</div><div style={{fontWeight:600,fontFamily:mono,marginTop:2}}>¥{fmtF(payLoan.totalDue)}</div></div>
          <div><div style={{fontSize:11,color:T.td}}>已收回</div><div style={{fontWeight:600,fontFamily:mono,color:T.green,marginTop:2}}>¥{fmtF(payLoan.recovered)}</div></div>
          <div><div style={{fontSize:11,color:T.td}}>剩余</div><div style={{fontWeight:600,fontFamily:mono,color:T.amber,marginTop:2}}>¥{fmtF(payLoan.totalDue-payLoan.recovered)}</div></div>
        </div>
        <Field label="本次回款金额"><input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder="输入金额" style={S.input}/></Field>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:18}}><button onClick={()=>setPayLoan(null)} style={S.btnO()}>取消</button><button onClick={recordPay} style={S.btn(T.green)}>确认录入</button></div>
      </div>}
    </Modal>
  </div>;
};

const LoanEditor=({open,loan,onClose,onSave,title})=>{
  const[d,setD]=useState(loan);useEffect(()=>{if(loan)setD({...loan});},[loan]);if(!d)return null;
  const u=(k,v)=>setD(p=>({...p,[k]:v}));
  const save=()=>{const od=+d.overduePrincipal,oi=+d.overdueInterest;onSave({...d,overduePrincipal:od,overdueInterest:oi,totalDue:od+oi,originalAmount:+d.originalAmount,recovered:+d.recovered,recoveryRate:(od+oi)>0?(+d.recovered)/(od+oi):0});};
  return<Modal open={open} onClose={onClose} title={title}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Field label="姓名"><input value={d.name} onChange={e=>u("name",e.target.value)} style={S.input}/></Field>
      <Field label="性别"><select value={d.gender} onChange={e=>u("gender",e.target.value)} style={{...S.select,width:"100%"}}><option>男</option><option>女</option></select></Field>
      <Field label="身份证号"><input value={d.idNumber} onChange={e=>u("idNumber",e.target.value)} style={S.input}/></Field>
      <Field label="手机号"><input value={d.phone} onChange={e=>u("phone",e.target.value)} style={S.input}/></Field>
      <Field label="城市"><input value={d.city} onChange={e=>u("city",e.target.value)} style={S.input}/></Field>
      <Field label="详细地址"><input value={d.address} onChange={e=>u("address",e.target.value)} style={S.input}/></Field>
      <Field label="原始贷款金额"><input type="number" value={d.originalAmount} onChange={e=>u("originalAmount",e.target.value)} style={S.input}/></Field>
      <Field label="逾期本金"><input type="number" value={d.overduePrincipal} onChange={e=>u("overduePrincipal",e.target.value)} style={S.input}/></Field>
      <Field label="逾期利息"><input type="number" value={d.overdueInterest} onChange={e=>u("overdueInterest",e.target.value)} style={S.input}/></Field>
      <Field label="催收状态"><select value={d.status} onChange={e=>u("status",e.target.value)} style={{...S.select,width:"100%"}}>{statusList.map(s=><option key={s}>{s}</option>)}</select></Field>
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20}}><button onClick={onClose} style={S.btnO()}>取消</button><button onClick={save} style={S.btn()}>保存</button></div>
  </Modal>;
};

/* ================================================================
   COMPANY: INVESTORS
   ================================================================ */
const CompanyInvestors=({investors,setInvestors,pkgs})=>{
  const[editInv,setEditInv]=useState(null);const[showNew,setShowNew]=useState(false);
  const emptyInv={id:"inv"+Date.now(),name:"",phone:"",contractDate:"2025-10-01",password:"",share:{},capital:{}};
  const save=(inv,isNew)=>{if(isNew)setInvestors(p=>[...p,inv]);else setInvestors(p=>p.map(x=>x.id===inv.id?inv:x));setEditInv(null);setShowNew(false);};
  const remove=id=>{if(confirm("确认删除？"))setInvestors(p=>p.filter(x=>x.id!==id));};
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
      <div><div style={S.pageTitle}>投资者管理</div><div style={S.pageSub}>管理投资者账户、分配份额</div></div>
      <button onClick={()=>setShowNew(true)} style={S.btn()}>+ 新增投资者</button>
    </div>
    {investors.map(inv=><div key={inv.id} style={{...S.card,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${T.blue}20,${T.purple}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,color:T.blue}}>{inv.name[0]}</div>
          <div><div style={{fontSize:15,fontWeight:600,color:T.text}}>{inv.name}</div><div style={{fontSize:12,color:T.tm}}>签约: {inv.contractDate} | 手机: {inv.phone}</div></div>
        </div>
        <div style={{display:"flex",gap:8}}><button onClick={()=>setEditInv({...inv,share:{...inv.share},capital:{...inv.capital}})} style={S.btnSm()}>编辑</button><button onClick={()=>remove(inv.id)} style={S.btnSm(T.red)}>删除</button></div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {pkgs.filter(p=>inv.share[p.id]).map(p=>{const ret=calcReturns(p,inv);return<div key={p.id} style={{padding:"12px 16px",background:T.bg3,borderRadius:10,border:`1px solid ${T.borderLight}`,flex:1,minWidth:220}}>
          <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>{p.name}</div>
          <div style={{display:"flex",gap:16,fontSize:12}}>
            <span style={{color:T.tm}}>份额: <b style={{color:T.blue}}>{pct(inv.share[p.id])}</b></span>
            <span style={{color:T.tm}}>投入: <b style={{color:T.text}}>¥{fmtF(ret?.cap||0)}</b></span>
            <span style={{color:T.tm}}>净回: <b style={{color:T.green}}>¥{fmtF(Math.round(ret?.myNet||0))}</b></span>
          </div>
        </div>;})}
        {!pkgs.some(p=>inv.share[p.id])&&<div style={{fontSize:12,color:T.td,padding:8}}>暂未分配资产包</div>}
      </div>
    </div>)}
    <InvEditor open={!!editInv} inv={editInv} pkgs={pkgs} onClose={()=>setEditInv(null)} onSave={inv=>save(inv,false)} title="编辑投资者"/>
    <InvEditor open={showNew} inv={emptyInv} pkgs={pkgs} onClose={()=>setShowNew(false)} onSave={inv=>save(inv,true)} title="新增投资者"/>
  </div>;
};

const InvEditor=({open,inv,pkgs,onClose,onSave,title})=>{
  const[d,setD]=useState(inv);useEffect(()=>{if(inv)setD({...inv,share:{...inv.share},capital:{...inv.capital}});},[inv]);if(!d)return null;
  const u=(k,v)=>setD(p=>({...p,[k]:v}));
  return<Modal open={open} onClose={onClose} title={title}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Field label="姓名"><input value={d.name} onChange={e=>u("name",e.target.value)} style={S.input}/></Field>
      <Field label="手机号"><input value={d.phone} onChange={e=>u("phone",e.target.value)} style={S.input}/></Field>
      <Field label="签约日期"><input type="date" value={d.contractDate} onChange={e=>u("contractDate",e.target.value)} style={S.input}/></Field>
      <Field label="登录密码"><input value={d.password} onChange={e=>u("password",e.target.value)} placeholder="设置密码" style={S.input}/></Field>
    </div>
    <div style={{fontSize:14,fontWeight:600,color:T.text,margin:"20px 0 12px",paddingTop:16,borderTop:`1px solid ${T.borderLight}`}}>资产包份额分配</div>
    {pkgs.map(p=><div key={p.id} style={{display:"flex",gap:14,alignItems:"center",marginBottom:12,padding:"10px 14px",background:T.bg3,borderRadius:8}}>
      <span style={{fontSize:13,color:T.textBody,minWidth:180,fontWeight:500}}>{p.name}</span>
      <input type="number" step=".01" placeholder="份额(0~1)" value={d.share[p.id]||""} onChange={e=>{const v=+e.target.value;setD(prev=>({...prev,share:{...prev.share,[p.id]:v},capital:{...prev.capital,[p.id]:Math.round(p.purchasePrice*v)}}));}} style={{...S.input,width:100}}/>
      <span style={{fontSize:12,color:T.tm}}>= ¥{fmtF(Math.round(p.purchasePrice*(d.share[p.id]||0)))}</span>
    </div>)}
    <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20}}><button onClick={onClose} style={S.btnO()}>取消</button><button onClick={()=>onSave(d)} style={S.btn()}>保存</button></div>
  </Modal>;
};

/* ================================================================
   COMPANY: BENCHMARK & DASHBOARD
   ================================================================ */
const CompanyBenchmark=({bm,setBm})=><div>
  <div style={S.pageTitle}>行业基准设定</div><div style={S.pageSub}>手动录入行业平均回收数据，用于投资者端对比</div>
  <div style={{...S.card,maxWidth:440}}>
    {[["industry3m","3个月行业平均回收率"],["industry6m","6个月行业平均回收率"],["industry12m","12个月行业平均回收率"]].map(([k,l])=><Field key={k} label={l}><div style={{display:"flex",gap:10,alignItems:"center"}}><input type="number" step=".01" value={bm[k]} onChange={e=>setBm({...bm,[k]:+e.target.value})} style={{...S.input,width:130}}/><span style={{fontSize:13,color:T.tm,fontWeight:500}}>{pct(bm[k])}</span></div></Field>)}
    <button style={{...S.btn(),marginTop:8}}>保存基准值</button>
  </div>
</div>;

const CompanyDashboard=({pkgs,investors})=>{
  const tr2=pkgs.reduce((s,p)=>s+p.loans.reduce((ss,l)=>ss+l.recovered,0),0);
  const td2=pkgs.reduce((s,p)=>s+p.loans.reduce((ss,l)=>ss+l.totalDue,0),0);
  return<div>
    <div style={S.pageTitle}>运营概览</div><div style={S.pageSub}>全局经营数据汇总</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
      <StatCard label="资产包" value={pkgs.length+"个"} color={T.blue}/>
      <StatCard label="信贷总笔数" value={pkgs.reduce((s,p)=>s+p.loanCount,0)+"笔"} color={T.teal}/>
      <StatCard label="投资者" value={investors.length+"人"} color={T.purple}/>
      <StatCard label="累计回款" value={"¥"+fmt(tr2)} color={T.green}/>
      <StatCard label="原始面值" value={"¥"+fmt(pkgs.reduce((s,p)=>s+p.faceValue,0))} color={T.text}/>
      <StatCard label="购入成本" value={"¥"+fmt(pkgs.reduce((s,p)=>s+p.purchasePrice,0))} color={T.coral}/>
      <StatCard label="整体回收率" value={pct(td2>0?tr2/td2:0)} color={T.amber}/>
    </div>
  </div>;
};

/* ================================================================
   INVESTOR VIEWS (READ-ONLY)
   ================================================================ */
let INVESTORS_G=initInvestors;

const InvDashboard=({pkg,inv})=>{
  const r=calcReturns(pkg,inv);if(!r)return<div style={{textAlign:"center",padding:50,color:T.td}}>您未参与此资产包</div>;
  const color=r.paidBack?T.green:T.blue;
  return<div>
    <div style={S.pageTitle}>投资概览</div><div style={S.pageSub}>{pkg.name}</div>
    {/* Payback */}
    <div style={{...S.card,background:r.paidBack?T.greenBg:T.blueBg,border:`1px solid ${r.paidBack?T.greenBorder:T.blueBorder}`,marginBottom:20}}>
      <div style={{fontSize:12,color:T.tm,fontWeight:500,marginBottom:8}}>回本进度</div>
      <div style={{display:"flex",alignItems:"baseline",gap:10}}><span style={S.bigNum(color)}>{pct(Math.min(r.ratio,9.99))}</span>{r.paidBack&&<span style={S.tag(T.green)}>已回本</span>}</div>
      <div style={{fontSize:14,color:T.textBody,marginTop:6}}>{r.paidBack?<>已盈利 <b style={{color:T.green}}>¥{fmtF(Math.round(r.profit))}</b></>:<>距回本还差 <b style={{color:T.amber}}>¥{fmtF(Math.round(r.gap))}</b></>}</div>
      <div style={{width:"100%",height:10,background:r.paidBack?"#a7f3d050":"#bfdbfe50",borderRadius:10,marginTop:14}}><div style={{width:`${Math.min(r.ratio*100,100)}%`,height:"100%",background:color,borderRadius:10,transition:"width .5s"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:10,fontSize:12,color:T.tm}}><span>投入 ¥{fmtF(Math.round(r.cap))}</span><span>净回款 ¥{fmtF(Math.round(r.myNet))}</span></div>
    </div>
    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      {[["投入本金",`¥${fmtF(Math.round(r.cap))}`,T.text],["累计净回款",`¥${fmtF(Math.round(r.myNet))}`,T.blue],["盈亏",`${r.profit>=0?"+":""}¥${fmtF(Math.round(r.profit))}`,r.profit>=0?T.green:T.red],["投资倍数",r.moic.toFixed(2)+"x",T.purple]].map(([l,v,c],i)=><div key={i} style={S.card}><div style={{fontSize:11,color:T.td,marginBottom:6,fontWeight:500}}>{l}</div><div style={{...S.bigNum(c),fontSize:22}}>{v}</div></div>)}
    </div>
    {/* Fee */}
    <div style={{...S.card,marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{fontSize:14,fontWeight:600,color:T.text}}>费用扣除明细</span><span style={S.tag(T.td)}>合同锁定 · 只读</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {[["回款总额(我的份额)",`¥${fmtF(Math.round(r.totRec*r.share))}`,T.text],["处置服务费("+pct(pkg.feeRates.disposal)+")",`-¥${fmtF(Math.round(r.disposalFee*r.share))}`,T.coral],["平台服务费("+pct(pkg.feeRates.platform)+")",`-¥${fmtF(Math.round(r.platformFee*r.share))}`,T.amber],["GP管理费("+pct(pkg.feeRates.gp)+")",`-¥${fmtF(Math.round(r.gpFee*r.share))}`,T.purple]].map(([l,v,c],i)=><div key={i}><div style={{fontSize:11,color:T.td}}>{l}</div><div style={{fontSize:16,fontWeight:600,color:c,fontFamily:mono,marginTop:3}}>{v}</div></div>)}
      </div>
    </div>
    {/* Shares */}
    <div style={S.card}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>投资者份额分布</div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart><Pie data={INVESTORS_G.filter(x=>x.share[pkg.id]).map(x=>({name:x.name,value:x.share[pkg.id]}))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={38} paddingAngle={3} strokeWidth={0}>
          {INVESTORS_G.filter(x=>x.share[pkg.id]).map((_,i)=><Cell key={i} fill={[T.blue,T.teal,T.coral,T.purple][i%4]}/>)}
        </Pie><Legend formatter={(v,e)=><span style={{color:T.textBody,fontSize:12}}>{v} ({pct(e.payload.value)})</span>}/><Tooltip contentStyle={tooltipStyle} formatter={v=>pct(v)}/></PieChart>
      </ResponsiveContainer>
    </div>
  </div>;
};

const InvCharts=({pkg,inv,bm})=>{
  const sh=inv.share[pkg.id];if(!sh)return null;const cap=inv.capital[pkg.id]||pkg.purchasePrice*sh;
  const tfr=pkg.feeRates.disposal+pkg.feeRates.platform+pkg.feeRates.gp;
  const data=pkg.payments.map((p,i)=>({week:p.weekLabel,累计回款:Math.round(p.cumulative*sh*(1-tfr)),本金线:Math.round(cap),行业基准:Math.round(cap*(bm.industry12m*(i+1)/pkg.payments.length)*(1-tfr))}));
  const mData={};pkg.payments.forEach((p,i)=>{const m=`M${Math.floor(i/4)+1}`;mData[m]=(mData[m]||0)+p.amount*sh*(1-tfr);});
  const monthData=Object.entries(mData).map(([m,v])=>({month:m,月回款:Math.round(v)}));
  return<div>
    <div style={S.pageTitle}>回收曲线</div><div style={S.pageSub}>累计净回款趋势与行业基准对比</div>
    <div style={{...S.card,marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:15,fontWeight:600}}>累计净回款</span>
        <div style={{display:"flex",gap:14,fontSize:11}}><span style={{color:T.blue}}>● 累计净回款</span><span style={{color:T.amber}}>● 行业基准</span><span style={{color:T.red,opacity:.6}}>--- 本金线</span></div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{top:10,right:10,left:10,bottom:0}}>
          <defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.blue} stopOpacity={.15}/><stop offset="95%" stopColor={T.blue} stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/><XAxis dataKey="week" tick={{fontSize:10,fill:T.td}} interval={3}/><YAxis tick={{fontSize:10,fill:T.td}} tickFormatter={v=>fmt(v)}/>
          <Tooltip contentStyle={tooltipStyle} formatter={v=>`¥${fmtF(v)}`}/>
          <ReferenceLine y={cap} stroke={T.red} strokeDasharray="6 4" strokeOpacity={.5}/>
          <Area type="monotone" dataKey="累计回款" stroke={T.blue} fill="url(#gB)" strokeWidth={2.5}/>
          <Line type="monotone" dataKey="行业基准" stroke={T.amber} strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div style={S.card}><div style={{fontSize:15,fontWeight:600,marginBottom:16}}>每月回款分布</div>
      <ResponsiveContainer width="100%" height={220}><BarChart data={monthData} margin={{top:10,right:10,left:10,bottom:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/><XAxis dataKey="month" tick={{fontSize:11,fill:T.td}}/><YAxis tick={{fontSize:10,fill:T.td}} tickFormatter={v=>fmt(v)}/>
        <Tooltip contentStyle={tooltipStyle} formatter={v=>`¥${fmtF(v)}`}/><Bar dataKey="月回款" fill={T.purple} radius={[6,6,0,0]}/>
      </BarChart></ResponsiveContainer>
    </div>
  </div>;
};

const InvMarginal=({pkg,inv})=>{
  const sh=inv.share[pkg.id];if(!sh)return null;const cap=inv.capital[pkg.id]||pkg.purchasePrice*sh;
  const tfr=pkg.feeRates.disposal+pkg.feeRates.platform+pkg.feeRates.gp;let cum=0,pb=false;
  const data=pkg.payments.map(p=>{const wn=p.amount*sh*(1-tfr);cum+=wn;let mg=0;if(pb)mg=wn;else if(cum>=cap){mg=cum-cap;pb=true;}return{week:p.weekLabel,边际收益:Math.round(mg)};});
  return<div>
    <div style={S.pageTitle}>边际收益追踪</div><div style={S.pageSub}>回本后每周新增利润 — 每一分回款都是净赚</div>
    <div style={S.card}><ResponsiveContainer width="100%" height={260}><BarChart data={data} margin={{top:10,right:10,left:10,bottom:0}}>
      <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight}/><XAxis dataKey="week" tick={{fontSize:10,fill:T.td}} interval={3}/><YAxis tick={{fontSize:10,fill:T.td}} tickFormatter={v=>fmt(v)}/>
      <Tooltip contentStyle={tooltipStyle} formatter={v=>`¥${fmtF(v)}`}/><Bar dataKey="边际收益" fill={T.green} radius={[5,5,0,0]}/>
    </BarChart></ResponsiveContainer></div>
  </div>;
};

const InvLoans=({pkg})=>{
  const[filter,setFilter]=useState("全部");const[search,setSearch]=useState("");const[page,setPage]=useState(0);const PS=15;
  const fl=pkg.loans.filter(l=>{if(filter!=="全部"&&l.status!==filter)return false;if(search&&!l.id.includes(search))return false;return true;});
  const pages=Math.ceil(fl.length/PS);const pd=fl.slice(page*PS,(page+1)*PS);
  return<div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={S.pageTitle}>信贷明细</span><span style={S.tag(T.td)}>脱敏 · 只读</span></div>
    <div style={S.pageSub}>个人信息已脱敏处理</div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["全部",...statusList].map(s=><button key={s} onClick={()=>{setFilter(s);setPage(0);}} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${filter===s?T.blue:T.border}`,background:filter===s?T.blueBg:T.white,color:filter===s?T.blue:T.tm,fontSize:12,cursor:"pointer",fontFamily:font,fontWeight:filter===s?600:400}}>{s}</button>)}</div>
      <input placeholder="搜索编号..." value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} style={{...S.input,width:160}}/>
    </div>
    <div style={{...S.card,padding:0,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:0}}>
      <thead><tr>{["编号","姓名","性别","城市","待收","已收","回收率","状态"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pd.map(l=><tr key={l.id} onMouseEnter={e=>e.currentTarget.style.background=T.bg3} onMouseLeave={e=>e.currentTarget.style.background=""}>
        <td style={{...S.td,fontFamily:mono,fontSize:12,color:T.td}}>{l.id}</td><td style={{...S.td,color:T.text,fontWeight:600}}>{maskN(l.name)}</td>
        <td style={S.td}>{l.gender}</td><td style={S.td}>{maskAddr(l.address)}</td>
        <td style={{...S.td,fontFamily:mono,fontWeight:500}}>¥{fmtF(l.totalDue)}</td>
        <td style={{...S.td,fontFamily:mono,fontWeight:500,color:l.recovered>0?T.green:T.td}}>¥{fmtF(l.recovered)}</td>
        <td style={S.td}>{pct(l.recoveryRate)}</td><td style={S.td}><Badge s={l.status}/></td>
      </tr>)}</tbody>
    </table></div>
    <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",borderTop:`1px solid ${T.border}`,fontSize:13,color:T.tm}}>
      <span>共 {fl.length} 条</span><div style={{display:"flex",gap:6,alignItems:"center"}}><button onClick={()=>setPage(Math.max(0,page-1))} disabled={page===0} style={{...S.btnGhost,opacity:page===0?.4:1}}>上一页</button><span style={{padding:"0 6px",fontSize:12}}>{page+1}/{pages||1}</span><button onClick={()=>setPage(Math.min(pages-1,page+1))} disabled={page>=pages-1} style={{...S.btnGhost,opacity:page>=pages-1?.4:1}}>下一页</button></div>
    </div></div>
  </div>;
};

const InvFlow=({pkg,inv})=>{
  const sh=inv.share[pkg.id];if(!sh)return null;const tfr=pkg.feeRates.disposal+pkg.feeRates.platform+pkg.feeRates.gp;let cum=0;
  return<div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={S.pageTitle}>回款流水</span><span style={S.tag(T.td)}>只读</span></div>
    <div style={S.pageSub}>每周回款扣费与净回款明细</div>
    <div style={{...S.card,padding:0,overflow:"hidden"}}><div style={{maxHeight:500,overflowY:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:0}}>
      <thead><tr>{["周次","日期","周回款(我的份额)","扣费合计","净回款","累计净回款"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pkg.payments.map((p,i)=>{const g=Math.round(p.amount*sh);const f=Math.round(p.amount*sh*tfr);const n=g-f;cum+=n;
        return<tr key={i} onMouseEnter={e=>e.currentTarget.style.background=T.bg3} onMouseLeave={e=>e.currentTarget.style.background=""}>
          <td style={{...S.td,fontWeight:600,color:T.text}}>{p.weekLabel}</td><td style={{...S.td,fontSize:12,color:T.tm}}>{p.date}</td>
          <td style={{...S.td,fontFamily:mono}}>¥{fmtF(g)}</td><td style={{...S.td,fontFamily:mono,color:T.red}}>-¥{fmtF(f)}</td>
          <td style={{...S.td,fontFamily:mono,color:T.green}}>¥{fmtF(n)}</td><td style={{...S.td,fontFamily:mono,fontWeight:600,color:T.blue}}>¥{fmtF(Math.round(cum))}</td>
        </tr>;})}</tbody>
    </table></div></div>
  </div>;
};

/* ================================================================
   MAIN APP
   ================================================================ */
const CTABS=[["dashboard","运营概览"],["packages","资产包管理"],["loans","信贷明细"],["investors","投资者管理"],["benchmark","行业基准"]];
const ITABS=[["overview","投资概览"],["charts","回收曲线"],["marginal","边际收益"],["loans","信贷明细"],["flow","回款流水"]];

export default function App(){
  useEffect(()=>{if(!document.getElementById("npl-f")){const l=document.createElement("link");l.id="npl-f";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap";document.head.appendChild(l);}},[]);
  const[user,setUser]=useState(null);
  const[pkgs,setPkgs]=useState(initPkgs);const[investors,setInvestors]=useState(initInvestors);const[bm,setBm]=useState(initBenchmark);
  const[cTab,setCTab]=useState("dashboard");const[iTab,setITab]=useState("overview");const[selPkg,setSelPkg]=useState(0);
  INVESTORS_G=investors;
  if(!user)return<LoginScreen onLogin={(r,id)=>setUser({role:r,investorId:id})} investors={investors}/>;
  const isC=user.role==="company";const tabs=isC?CTABS:ITABS;const at=isC?cTab:iTab;const setAt=isC?setCTab:setITab;
  const curInv=!isC?investors.find(i=>i.id===user.investorId):null;
  const invPkgs=curInv?pkgs.filter(p=>curInv.share[p.id]):pkgs;const curPkg=invPkgs[selPkg]||invPkgs[0];

  const content=()=>{
    if(isC){switch(cTab){case"dashboard":return<CompanyDashboard pkgs={pkgs} investors={investors}/>;case"packages":return<CompanyPackages pkgs={pkgs} setPkgs={setPkgs}/>;case"loans":return<CompanyLoans pkgs={pkgs} setPkgs={setPkgs}/>;case"investors":return<CompanyInvestors investors={investors} setInvestors={setInvestors} pkgs={pkgs}/>;case"benchmark":return<CompanyBenchmark bm={bm} setBm={setBm}/>;}}
    else{if(!curPkg)return<div style={{textAlign:"center",padding:60,color:T.td}}>暂无参与的资产包</div>;switch(iTab){case"overview":return<InvDashboard pkg={curPkg} inv={curInv}/>;case"charts":return<InvCharts pkg={curPkg} inv={curInv} bm={bm}/>;case"marginal":return<InvMarginal pkg={curPkg} inv={curInv}/>;case"loans":return<InvLoans pkg={curPkg}/>;case"flow":return<InvFlow pkg={curPkg} inv={curInv}/>;}}
  };

  return<div style={{fontFamily:font,background:T.bg,color:T.text,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
    {/* Header */}
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${T.blue},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <span style={{fontSize:16,fontWeight:700,color:T.text}}>NPL Asset Tracker</span>
        <span style={{fontSize:11,fontWeight:600,color:isC?T.blue:T.teal,padding:"3px 10px",background:isC?T.blueBg:T.greenBg,borderRadius:6}}>{isC?"管理端":"投资者端"}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {!isC&&invPkgs.length>1&&<select value={selPkg} onChange={e=>setSelPkg(+e.target.value)} style={S.select}>{invPkgs.map((p,i)=><option key={i} value={i}>{p.name}</option>)}</select>}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px",background:T.bg3,borderRadius:8}}>
          <div style={{width:26,height:26,borderRadius:8,background:`linear-gradient(135deg,${T.blue}20,${T.purple}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:T.blue}}>{isC?"管":curInv?.name[0]}</div>
          <span style={{fontSize:13,color:T.textBody,fontWeight:500}}>{isC?"管理员":curInv?.name}</span>
        </div>
        <button onClick={()=>{setUser(null);setCTab("dashboard");setITab("overview");setSelPkg(0);}} style={{...S.btnGhost,fontSize:12}}>退出</button>
      </div>
    </div>
    {/* Body */}
    <div style={{display:"flex",flex:1}}>
      <div style={{width:210,background:T.sidebar,padding:"16px 0",flexShrink:0}}>
        <div style={{padding:"0 22px 16px",fontSize:11,color:T.sidebarText,letterSpacing:".08em",fontWeight:500}}>{isC?"管理菜单":"投资者菜单"}</div>
        {tabs.map(([k,l])=><div key={k} onClick={()=>setAt(k)} style={{padding:"10px 22px",fontSize:13,cursor:"pointer",color:at===k?T.sidebarActive:T.sidebarText,background:at===k?"rgba(255,255,255,.08)":"transparent",borderLeft:at===k?`3px solid ${isC?T.blueL:T.teal}`:"3px solid transparent",fontWeight:at===k?600:400,transition:"all .15s"}}>{l}</div>)}
        {!isC&&curInv&&<div style={{margin:"24px 22px 0",padding:"14px 0",borderTop:"1px solid rgba(255,255,255,.1)"}}>
          <div style={{fontSize:11,color:T.sidebarText,marginBottom:5}}>当前身份</div>
          <div style={{fontSize:14,fontWeight:600,color:T.sidebarActive}}>{curInv.name}</div>
          {curPkg&&<div style={{fontSize:12,color:T.sidebarText,marginTop:3}}>份额: {pct(curInv.share[curPkg.id]||0)}</div>}
        </div>}
      </div>
      <div style={{flex:1,padding:28,overflowY:"auto",maxHeight:"calc(100vh - 56px)"}}>{content()}</div>
    </div>
  </div>;
}
