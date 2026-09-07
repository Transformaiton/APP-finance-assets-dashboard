'use client';

import { useEffect, useMemo, useState } from 'react';

const defaultCategories = ['Restaurants','Groceries','Utilities','Housing','Kids','Travel','Shopping','Income','Transfer','Interest','Other'];

const seedAccounts = [
  {id:'chase-personal-1788', name:'Chase Personal 1788', type:'bank', balance:0, apy:0},
  {id:'chase-high-school-1185', name:'Chase High School 1185', type:'bank', balance:0, apy:0},
  {id:'chase-savings-5068', name:'Chase Savings 5068', type:'bank', balance:0, apy:0},
  {id:'chase-business-9496', name:'Chase Business 9496', type:'bank', balance:0, apy:0},
  {id:'cash-safe', name:'Cash in Safe', type:'cash', balance:0, apy:0},
  {id:'gemini-card', name:'Gemini', type:'credit', balance:-500, apy:0},
  {id:'apple-wallet', name:'Apple Wallet', type:'credit', balance:-500, apy:0},
  {id:'samsung-card', name:'Samsung Card', type:'credit', balance:-500, apy:0},
  {id:'bofa-personal', name:'Bank of America Personal', type:'bank', balance:500, apy:0},
  {id:'chase-business-dnt', name:'Chase Business DNT Investment', type:'bank', balance:500, apy:0},
  {id:'robinhood', name:'Robinhood', type:'crypto', balance:500, apy:0},
  {id:'coinbase', name:'Coinbase', type:'crypto', balance:500, apy:0},
  {id:'uphold', name:'Uphold', type:'crypto', balance:500, apy:0},
  {id:'crypto-com', name:'Crypto.com', type:'crypto', balance:500, apy:0},
  {id:'kraken', name:'Kraken', type:'crypto', balance:500, apy:0},
  {id:'bitrue', name:'Bitrue', type:'crypto', balance:500, apy:0},
  {id:'binance', name:'Binance', type:'crypto', balance:500, apy:0}
];

const typeLabel = {bank:'Banks', credit:'Credit Cards', crypto:'Crypto', cash:'Cash', investment:'Investments', gift:'Gift Cards', metal:'Gold & Silver', other:'Other'};

function money(v){
  const n = Number(v || 0);
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
}

function load(key, fallback){
  if (typeof window === 'undefined') return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export default function Page(){
  const [accounts, setAccounts] = useState(seedAccounts);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [columns, setColumns] = useState(3);
  const [modal, setModal] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [reportRange, setReportRange] = useState('month');
  const [reportCategory, setReportCategory] = useState('all');

  useEffect(()=>{
    setAccounts(load('mmd_accounts', seedAccounts));
    setActivities(load('mmd_activities', []));
    setCategories(load('mmd_categories', defaultCategories));
    setColumns(load('mmd_columns', 3));
  },[]);

  useEffect(()=>{ if(typeof window!=='undefined') localStorage.setItem('mmd_accounts', JSON.stringify(accounts)); },[accounts]);
  useEffect(()=>{ if(typeof window!=='undefined') localStorage.setItem('mmd_activities', JSON.stringify(activities)); },[activities]);
  useEffect(()=>{ if(typeof window!=='undefined') localStorage.setItem('mmd_categories', JSON.stringify(categories)); },[categories]);
  useEffect(()=>{ if(typeof window!=='undefined') localStorage.setItem('mmd_columns', JSON.stringify(columns)); },[columns]);

  const filtered = useMemo(()=>{
    let list = accounts.filter(a => filter==='all' || a.type===filter);
    if(selected.length) list = list.filter(a=>selected.includes(a.id));
    return list;
  },[accounts, filter, selected]);

  const filteredTotal = filtered.reduce((s,a)=>s+a.balance,0);
  const assets = accounts.filter(a=>a.balance>0).reduce((s,a)=>s+a.balance,0);
  const debt = Math.abs(accounts.filter(a=>a.balance<0).reduce((s,a)=>s+a.balance,0));
  const net = assets - debt;

  const groups = useMemo(()=>{
    const out = {};
    accounts.forEach(a=>{ out[a.type]=(out[a.type]||0)+Math.max(a.balance,0); });
    out.debt = debt;
    return out;
  },[accounts, debt]);

  const donut = useMemo(()=>{
    const entries = Object.entries(groups).filter(([,v])=>v>0);
    const total = entries.reduce((s,[,v])=>s+v,0) || 1;
    const palette = ['#6d5dfc','#2eb67d','#f5a623','#0ea5e9','#f43f5e','#8b5cf6','#14b8a6','#64748b'];
    let start=0;
    const stops=[];
    entries.forEach(([k,v],i)=>{ const end=start+(v/total)*360; stops.push(`${palette[i%palette.length]} ${start}deg ${end}deg`); start=end; });
    return {bg:`conic-gradient(${stops.join(',')})`, entries, palette, total};
  },[groups]);

  function openAccount(a=null){ setModal({kind:'account', account:a ? {...a} : {id:'',name:'',type:'bank',balance:0,apy:0}}); }
  function saveAccount(form){
    if(!form.name.trim()) return;
    if(form.id){ setAccounts(prev=>prev.map(a=>a.id===form.id?{...form,balance:Number(form.balance||0),apy:Number(form.apy||0)}:a)); }
    else { const id=(form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'account')+'-'+Date.now(); setAccounts(prev=>[...prev,{...form,id,balance:Number(form.balance||0),apy:Number(form.apy||0)}]); }
    setModal(null);
  }
  function addActivity(account){ setModal({kind:'activity', account, sign:1, amount:'', category:'Other', note:''}); }
  function saveActivity(m){
    const amount=Math.abs(Number(m.amount||0)); if(!amount) return;
    const delta = m.sign===1 ? amount : -amount;
    const activity={id:String(Date.now()),accountId:m.account.id,accountName:m.account.name,delta,category:m.category,note:m.note||'',createdAt:new Date().toISOString()};
    setActivities(prev=>[activity,...prev]);
    setAccounts(prev=>prev.map(a=>a.id===m.account.id?{...a,balance:Number((a.balance+delta).toFixed(2))}:a));
    setModal(null);
  }
  function addInterest(account){
    const monthly = Math.max(account.balance,0) * (Number(account.apy||0)/100) / 12;
    if(monthly<=0) return;
    const activity={id:String(Date.now()),accountId:account.id,accountName:account.name,delta:Number(monthly.toFixed(2)),category:'Interest',note:`Estimated monthly interest at ${account.apy}% APY`,createdAt:new Date().toISOString()};
    setActivities(prev=>[activity,...prev]);
    setAccounts(prev=>prev.map(a=>a.id===account.id?{...a,balance:Number((a.balance+activity.delta).toFixed(2))}:a));
  }
  function removeAccount(id){ if(confirm('Delete this account?')) setAccounts(prev=>prev.filter(a=>a.id!==id)); }
  function toggleSelect(id){ setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]); }
  function dropOn(targetId){
    if(!dragId||dragId===targetId) return;
    setAccounts(prev=>{ const from=prev.findIndex(a=>a.id===dragId), to=prev.findIndex(a=>a.id===targetId); if(from<0||to<0)return prev; const copy=[...prev]; const [item]=copy.splice(from,1); copy.splice(to,0,item); return copy; });
    setDragId(null);
  }

  const reportActivities = useMemo(()=>{
    const now=Date.now();
    const days = reportRange==='day'?1:reportRange==='week'?7:reportRange==='month'?30:36500;
    const allowed = selected.length ? new Set(selected) : null;
    return activities.filter(x=>{
      const within=(now-new Date(x.createdAt).getTime())<=days*86400000;
      const categoryOk=reportCategory==='all'||x.category===reportCategory;
      const accountOk=!allowed||allowed.has(x.accountId);
      return within && categoryOk && accountOk;
    });
  },[activities, reportRange, reportCategory, selected]);
  const spendTotal = Math.abs(reportActivities.filter(x=>x.delta<0).reduce((s,x)=>s+x.delta,0));

  return <main className="app-shell">
    <header className="topbar">
      <div><h1>My Money Dashboard</h1><p>One view for balances, debt, crypto, cash, investments and manual activity.</p></div>
      <button className="primary" onClick={()=>openAccount()}>+ Add Account</button>
    </header>

    <section className="stats-grid">
      <Stat title="Net Worth" value={money(net)} accent="net" />
      <Stat title="Assets" value={money(assets)} accent="asset" />
      <Stat title="Debt" value={money(-debt)} accent="debt" />
      <Stat title="Filtered / Selected Total" value={money(filteredTotal)} accent="focus" />
    </section>

    <section className="panel overview-panel">
      <div className="donut-wrap"><div className="donut" style={{background:donut.bg}}><div className="donut-hole"><strong>{money(net)}</strong><span>net</span></div></div></div>
      <div className="legend">
        <h3>Portfolio mix</h3>
        {donut.entries.map(([k,v],i)=><div className="legend-row" key={k}><span className="dot" style={{background:donut.palette[i%donut.palette.length]}}></span><span>{k==='debt'?'Debt':(typeLabel[k]||k)}</span><strong>{money(k==='debt'?-v:v)}</strong></div>)}
      </div>
    </section>

    <section className="toolbar panel">
      <div className="filters">
        {['all','bank','credit','crypto','cash','investment','gift','metal','other'].map(f=><button key={f} className={filter===f?'chip active':'chip'} onClick={()=>setFilter(f)}>{f==='all'?'All':typeLabel[f]}</button>)}
      </div>
      <div className="density">Tiles <input type="range" min="1" max="6" value={columns} onChange={e=>setColumns(Number(e.target.value))}/><strong>{columns}/row</strong></div>
    </section>

    <section className="accounts-grid" style={{gridTemplateColumns:`repeat(${columns}, minmax(0,1fr))`}}>
      {filtered.map(a=><article key={a.id} className={`account-card ${selected.includes(a.id)?'selected':''}`} draggable onDragStart={()=>setDragId(a.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>dropOn(a.id)}>
        <div className="card-head"><label className="select-box"><input type="checkbox" checked={selected.includes(a.id)} onChange={()=>toggleSelect(a.id)}/><span></span></label><span className="type-pill">{typeLabel[a.type]||a.type}</span><button className="icon-btn" onClick={()=>removeAccount(a.id)}>×</button></div>
        <h3>{a.name}</h3>
        <div className={a.balance<0?'balance negative':'balance positive'}>{money(a.balance)}</div>
        {Number(a.apy)>0 && <div className="apy">{a.apy}% APY · est. {money(Math.max(a.balance,0)*(a.apy/100)/12)}/mo</div>}
        <div className="card-actions"><button onClick={()=>addActivity(a)}>+ Activity</button><button onClick={()=>setModal({kind:'history',account:a})}>History</button><button onClick={()=>openAccount(a)}>Edit</button></div>
        {Number(a.apy)>0 && <button className="interest-btn" onClick={()=>addInterest(a)}>Add estimated monthly interest</button>}
      </article>)}
    </section>

    <section className="panel report-panel">
      <div className="report-head"><div><h2>Spending report</h2><p>Negative manual activities across all or selected accounts.</p></div><div className="report-total"><span>Spent</span><strong>{money(spendTotal)}</strong></div></div>
      <div className="report-controls">
        <select value={reportRange} onChange={e=>setReportRange(e.target.value)}><option value="day">Last day</option><option value="week">Last week</option><option value="month">Last 30 days</option><option value="all">All time</option></select>
        <select value={reportCategory} onChange={e=>setReportCategory(e.target.value)}><option value="all">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select>
        <button onClick={()=>setModal({kind:'categories'})}>Manage categories</button>
      </div>
      <div className="report-list">{reportActivities.slice(0,12).map(x=><div className="activity-row" key={x.id}><div><strong>{x.accountName}</strong><span>{x.category}{x.note?` · ${x.note}`:''}</span></div><b className={x.delta<0?'negative':'positive'}>{money(x.delta)}</b></div>)}{!reportActivities.length&&<p className="muted">No matching activities yet.</p>}</div>
    </section>

    {modal && <Modal modal={modal} setModal={setModal} saveAccount={saveAccount} saveActivity={saveActivity} categories={categories} setCategories={setCategories} activities={activities}/>}    
  </main>
}

function Stat({title,value,accent}){return <div className={`stat ${accent}`}><span>{title}</span><strong>{value}</strong></div>}

function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}

function Modal({modal,setModal,saveAccount,saveActivity,categories,setCategories,activities}){
  const [form,setForm]=useState(modal.kind==='account'?{...modal.account}:modal.kind==='activity'?{...modal}:{});
  const [newCategory,setNewCategory]=useState('');
  const history=modal.kind==='history'?activities.filter(x=>x.accountId===modal.account.id):[];
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="modal">
    <button className="close" onClick={()=>setModal(null)}>×</button>
    {modal.kind==='account' && <>
      <h2>{form.id?'Edit account':'Add account'}</h2>
      <Field label="Account name"><div className="input-clear"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><button onClick={()=>setForm({...form,name:''})}>×</button></div></Field>
      <Field label="Type"><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{Object.keys(typeLabel).map(k=><option value={k} key={k}>{typeLabel[k]}</option>)}</select></Field>
      <Field label="Current balance (credit card debt should be negative)"><div className="input-clear"><input type="number" step="0.01" value={form.balance} onChange={e=>setForm({...form,balance:e.target.value})}/><button onClick={()=>setForm({...form,balance:''})}>×</button></div></Field>
      <Field label="APY / annual yield % (optional)"><input type="number" step="0.01" value={form.apy} onChange={e=>setForm({...form,apy:e.target.value})}/></Field>
      <button className="primary wide" onClick={()=>saveAccount(form)}>Save Account</button>
    </>}
    {modal.kind==='activity' && <>
      <h2>Add activity</h2><p className="muted">{modal.account.name}</p>
      <div className="sign-toggle"><button className={form.sign===1?'active':''} onClick={()=>setForm({...form,sign:1})}>+</button><button className={form.sign===-1?'active minus':''} onClick={()=>setForm({...form,sign:-1})}>−</button></div>
      <Field label="Amount"><input type="number" step="0.01" autoFocus value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></Field>
      <Field label="Category"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></Field>
      <Field label="Note (optional)"><input value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></Field>
      <button className="primary wide" onClick={()=>saveActivity(form)}>Save Activity</button>
    </>}
    {modal.kind==='history' && <><h2>{modal.account.name} history</h2><div className="history-list">{history.map(x=><div className="activity-row" key={x.id}><div><strong>{new Date(x.createdAt).toLocaleString()}</strong><span>{x.category}{x.note?` · ${x.note}`:''}</span></div><b className={x.delta<0?'negative':'positive'}>{money(x.delta)}</b></div>)}{!history.length&&<p className="muted">No manual activities logged yet.</p>}</div></>}
    {modal.kind==='categories' && <><h2>Categories</h2><div className="category-list">{categories.map(c=><div key={c}><span>{c}</span><button onClick={()=>setCategories(categories.filter(x=>x!==c))}>×</button></div>)}</div><div className="category-add"><input placeholder="New category" value={newCategory} onChange={e=>setNewCategory(e.target.value)}/><button className="primary" onClick={()=>{const v=newCategory.trim(); if(v&&!categories.includes(v)){setCategories([...categories,v]);setNewCategory('')}}}>Add</button></div></>}
  </div></div>
}
