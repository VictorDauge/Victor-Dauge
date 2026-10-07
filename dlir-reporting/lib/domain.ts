// @ts-nocheck
export const fail=x=>{throw Error(x)};
const err=fail;
export const id=()=>crypto.randomUUID().replaceAll("-", "");
export const stamp=()=>new Date().toISOString();
export const recordKinds=["case","event","expense","budget","note","document","workplan","alignment","kpi","staff_return","snapshot","audit"];
export function dateCheck(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||new Date(d+'T00:00:00Z').toISOString().slice(0,10)!==d)err('Enter a valid date.');return d}
export function period(y,q){y=Number(y);q=Number(q);if(!Number.isInteger(y)||y<2000||y>2100||![0,1,2,3,4].includes(q))err('Select a valid year and quarter.');const s=`${y}-${String(q?3*q-2:1).padStart(2,'0')}-01`,end=new Date(Date.UTC(q===0||q===4?y+1:y,q===0||q===4?0:3*q,1));return [s,end.toISOString().slice(0,10)]}
const inside=(d,s,e)=>!!d&&d>=s&&d<e;
const sum=(xs,k)=>xs.reduce((n,x)=>n+Number(x[k]||0),0);
const temporal=(xs)=>xs.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.at.localeCompare(b.at));
export function calculateReport(CONFIG, records, unit,y,q){
 const list=k=>records[k]||[];
 y=Number(y);q=Number(q);const [s,e]=period(y,q),cut=new Date(new Date(e).getTime()-86400000).toISOString().slice(0,10),scoped=x=>unit==='ALL'||x.unit===unit;
 const cases=list('case').filter(x=>scoped(x)&&x.registered<e),events=list('event').filter(x=>scoped(x)&&x.date<e),stateAt=(c,at)=>{let state='Registered';for(const ev of temporal(events.filter(x=>x.case_id===c.id&&x.date<at)))if(ev.status)state=ev.status;return state};
 const opening=cases.filter(x=>x.registered<s&&stateAt(x,s)!=='Closed'),intake=cases.filter(x=>inside(x.registered,s,e)),closing=cases.filter(x=>stateAt(x,e)!=='Closed'),pe=events.filter(x=>inside(x.date,s,e)),closures=pe.filter(x=>x.type==='Closed'),reopens=pe.filter(x=>x.type==='Reopened'),activities=pe.filter(x=>x.approved&&x.workplan_id);
 const notes=list('note').filter(x=>scoped(x)&&x.year===y&&x.quarter===q),workplan=list('workplan').filter(x=>scoped(x)&&x.year===y).map(w=>{
  const a=activities.filter(x=>x.workplan_id===w.id&&x.unit===w.unit),n=notes.find(x=>x.workplan_id===w.id&&x.unit===w.unit)||{},measure=w.id==='1.1.1'?'Compulsory conference completed':w.id==='1.2.1'?'EBA review completed':null,actual=measure?sum(a.filter(x=>x.type===measure),'quantity'):null,target=q?w.quarter_target:w.annual_target;
  return {...w,actual,target,achievement:target&&actual!==null?actual/target:null,achieved:n.achieved||a.map(x=>x.narrative).filter(Boolean).join('\n'),issues:n.issues||'',strategy:n.strategy||'',comments:n.comments||'',progress:n.progress||'',ontrack:n.ontrack||'',justification:n.justification||''};
 });
 const expense=list('expense').filter(x=>scoped(x)&&x.approved&&inside(x.date,s,e)),ytd=list('expense').filter(x=>scoped(x)&&x.approved&&inside(x.date,`${y}-01-01`,e)),budget=list('budget').filter(x=>scoped(x)&&x.year===y&&x.quarter===q).map(b=>{const actual=sum(ytd.filter(x=>x.unit===b.unit&&x.budget_line===b.budget_line),'amount');return {...b,actual,quarter_actual:sum(expense.filter(x=>x.unit===b.unit&&x.budget_line===b.budget_line),'amount'),unreleased:b.appropriation-b.released,available:b.released-actual}});
 const officers={};for(const c of closing){let officer='Unassigned';for(const ev of temporal(events.filter(x=>x.case_id===c.id&&x.type==='Assignment')))officer=ev.officer;officers[officer]=(officers[officer]||0)+1}
 const staff={};for(const x of temporal(list('staff_return').filter(x=>scoped(x)&&x.date<e)))staff[x.unit+':'+x.division]=x;
 return {unit,year:y,quarter:q,start:s,end:cut,period:q?'Q'+q:'Annual',registered:intake.length,industrial_matters:intake.filter(x=>x.nature==='Industrial matter').length,industrial_disputes:intake.filter(x=>x.nature==='Industrial dispute').length,opening:opening.length,closing:closing.length,closures:closures.length,unique_closed_cases:new Set(closures.map(x=>x.case_id)).size,reopened:reopens.length,reconciliation:opening.length+intake.length+reopens.length-closures.length-closing.length,conferences:sum(activities.filter(x=>x.type==='Compulsory conference completed'),'quantity'),activities:activities.length,quarter_expenditure:sum(expense,'amount'),ytd_expenditure:sum(ytd,'amount'),budget,workplan,categories:Object.fromEntries(CONFIG.categories.map(k=>[k,intake.filter(x=>x.category===k).length])),officers,staff:Object.values(staff),alignment:list('alignment').filter(x=>scoped(x)&&(!x.effective_start||x.effective_start<e)&&(!x.effective_end||x.effective_end>=s)),notes:notes.find(x=>!x.workplan_id&&x.unit===unit)||{},coverage:'Entered records only. Reconcile registry totals and finance returns before approving this report.'};
}
export function reportTokens(CONFIG,r){
 const d=Object.fromEntries(Object.entries(r).filter(([k,v])=>['string','number'].includes(typeof v)).map(([k,v])=>[k.toUpperCase(),String(v)]));d.UNIT=CONFIG.units.find(x=>x.id===r.unit)?.name||'Department consolidation';
 d.STATISTICS=`${r.registered} new registrations (${r.industrial_matters} industrial matters and ${r.industrial_disputes} industrial disputes); ${r.opening} open at period start; ${r.closures} closure events affecting ${r.unique_closed_cases} distinct cases; ${r.reopened} reopenings; ${r.closing} open at period end. ${r.conferences} approved completed compulsory conferences.`;
 d.CATEGORY_STATISTICS=Object.entries(r.categories).filter(([k,v])=>v).map(([k,v])=>`${k}: ${v}`).join('; ')||'No new registrations entered for this period.';
 d.OFFICER_STATISTICS=Object.entries(r.officers).map(([k,v])=>`${k}: ${v} active`).join('; ')||'No active matters entered at period end.';
 d.POLICY_ALIGNMENT=r.alignment.map(x=>`${x.unit} ${x.workplan_id}: ${x.priority} (source ${x.document_id}, ${x.clause})`).join('; ')||'[Approved policy and mandate mappings to be entered]';
 d.EXPENDITURE=`Period expenditure PGK ${money(r.quarter_expenditure)}; year-to-date PGK ${money(r.ytd_expenditure)}.`;
 for(const k of ['achievements','nonachievements','challenges','evaluation','recommendations','conclusion','headcount','vehicles'])d[k.toUpperCase()]=r.notes[k]||'[To be completed]';
 d.BUDGET_NARRATIVE=r.budget.map(x=>`${x.unit} ${x.budget_line}: appropriation PGK ${money(x.appropriation)}; YTD released PGK ${money(x.released)}; YTD unreleased PGK ${money(x.unreleased)}; YTD actual PGK ${money(x.actual)}; available PGK ${money(x.available)}.`).join('\n')||'[Finance return not entered]';
 for(const [key,line] of [['PE','Personnel Emoluments'],['GS','Goods & Services'],['PIP','Development / PIP'],['OTHER','Other'],['TOTAL',null]]){const bs=r.budget.filter(x=>line===null||x.budget_line===line);for(const field of ['appropriation','released','unreleased','actual','available'])d['B_'+key+'_'+field.toUpperCase()]=bs.length?money(sum(bs,field)):'[Not entered]'}
 if(r.unit==='P3'&&!['Personnel Emoluments','Goods & Services'].every(line=>r.budget.some(x=>x.budget_line===line)))for(const field of ['APPROPRIATION','RELEASED','UNRELEASED','ACTUAL','AVAILABLE'])d['B_TOTAL_'+field]='[Incomplete return]';
 for(const [key,division] of [['EXEC','IR Exec'],['HQ','IRHQ'],['PROV','IRP'],['TOTAL',null]]){const ss=r.staff.filter(x=>division===null||x.division===division);for(const field of ['ceiling','strength','vacant','casual','unattached','vehicles'])d['S_'+key+'_'+field.toUpperCase()]=ss.length?String(sum(ss,field)):'[Not entered]'}
 if(r.unit==='P3'&&!['IR Exec','IRHQ','IRP'].every(v=>r.staff.some(x=>x.division===v)))for(const field of ['CEILING','STRENGTH','VACANT','CASUAL','UNATTACHED','VEHICLES'])d['S_TOTAL_'+field]='[Incomplete return]';
 for(const w of r.workplan){const pre='WP'+w.id.replaceAll('.','_')+'_';for(const k of ['achieved','issues','strategy','comments','progress','ontrack','justification','owner'])d[pre+k.toUpperCase()]=w[k]||'[To be completed]';if(w.actual!==null)d[pre+'ACHIEVED']=`${w.actual} completed; target ${w.target??'not specified for this period'}.\n`+d[pre+'ACHIEVED'];for(const [k,v] of Object.entries(d))if(k.startsWith(pre))d[w.unit+'_'+k]=v}
 return d;
}
const money=n=>Number(n).toLocaleString('en-PG',{minimumFractionDigits:2,maximumFractionDigits:2});
