import { z } from 'zod';

export const VERSION = '1.0.0';
export const currencies = ['GBP', 'USD', 'EUR', 'CAD', 'AUD'];
const int = z.number().int().min(0).max(1000000000);
export function money(value) {
  const s = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new Error('Use a positive amount or zero, with at most 2 decimal places.');
  const [a,b=''] = s.split('.'); const n = Number(a)*100 + Number(b.padEnd(2,'0'));
  return int.parse(n);
}
export const major = n => (n / 100).toFixed(2);
export const fmt = (n,c='GBP',digits=2) => new Intl.NumberFormat('en-GB',{style:'currency',currency:c,minimumFractionDigits:digits,maximumFractionDigits:digits}).format(n/100);
export const id = () => globalThis.crypto.randomUUID();
export function today(tz='Europe/London') { const p = new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()); return ['year','month','day'].map(k=>p.find(x=>x.type===k).value).join('-'); }
export function validDate(s) { if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false; const d = new Date(s+'T12:00:00Z'); return !isNaN(d) && d.toISOString().slice(0,10)===s; }
export const addDays = (s,n) => { const d = new Date(s+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); };
export const daysInMonth = m => new Date(Date.UTC(Number(m.slice(0,4)),Number(m.slice(5,7)),0)).getUTCDate();
export function addMonths(s,n) { const y=Number(s.slice(0,4)),m=Number(s.slice(5,7))-1,day=Number(s.slice(8,10)); const a=new Date(Date.UTC(y,m+n,1)); const month=a.toISOString().slice(0,7); return month+'-'+String(Math.min(day,daysInMonth(month))).padStart(2,'0'); }
export const monthLabel = (m,short=false) => new Date(m+'-15T12:00:00Z').toLocaleDateString('en-GB',{month:short?'short':'long',year:short?undefined:'numeric',timeZone:'UTC'});
export const dateLabel = d => validDate(d)?new Date(d+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'Not set';
const dateSchema=z.string().refine(validDate,'Enter an exact calendar date.');
const monthSchema=z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const freq=z.enum(['weekly','fortnightly','monthly','annual','once']);
export const planSchema=z.object({
  id:z.string(),schemaVersion:z.literal(1),revision:z.number().int().min(0),currency:z.enum(currencies),timezone:z.string().refine(v=>{try{new Intl.DateTimeFormat('en',{timeZone:v});return true;}catch{return false;}}),demo:z.boolean(),
  sources:z.array(z.object({id:z.string(),name:z.string().trim().min(1).max(80),note:z.string().max(300).optional(),ended:z.boolean().optional()})).min(1).max(30),
  months:z.array(z.object({month:monthSchema,coverage:z.enum(['complete','incomplete','unknown']),mode:z.enum(['totals','receipts']),amounts:z.record(int)})).max(120),
  receipts:z.array(z.object({id:z.string(),sourceId:z.string(),date:dateSchema,amount:int})),
  savings:int,savingsDate:dateSchema,savingsAccessible:z.literal(true),survivalMonths:z.number().finite().int().positive().max(1200),
  costs:z.array(z.object({id:z.string(),name:z.string().trim().min(1).max(80),amount:int,frequency:freq,priority:z.number().int().min(0).max(100)})).max(100),
  variableCosts:int,budgetComplete:z.literal(true),allocation:z.number().int().min(0).max(100),analysisStart:monthSchema,analysisEnd:monthSchema
}).superRefine((p,ctx)=>{
  const fail=message=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
  const src=new Set(p.sources.map(s=>s.id));
  if(src.size!==p.sources.length)fail('Duplicate source IDs.');
  if(new Set(p.months.map(m=>m.month)).size!==p.months.length)fail('Duplicate calendar month.');
  if(new Set([...p.costs,...p.receipts].map(x=>x.id)).size!==p.costs.length+p.receipts.length)fail('Duplicate record IDs.');
  if(p.analysisStart>p.analysisEnd)fail('Analysis start must precede its end.');
  for(const m of p.months){
    if(m.month>=today(p.timezone).slice(0,7)&&m.coverage==='complete')fail('Only completed calendar months can be marked complete.');
    if(Object.keys(m.amounts).some(k=>!src.has(k)))fail('Income belongs to a missing source.');
    if(m.mode==='totals'&&m.coverage==='complete'&&p.sources.some(s=>m.amounts[s.id]===undefined))fail('Complete months need an amount for every source, including confirmed zeros.');
    if(m.mode==='totals'&&p.receipts.some(r=>r.date.slice(0,7)===m.month))fail('A month cannot contain both receipts and monthly totals.');
    if(m.mode==='receipts'&&Object.keys(m.amounts).length)fail('Replace monthly totals before recording receipts.');
  }
  for(const r of p.receipts)if(!src.has(r.sourceId)||!p.months.some(m=>m.month===r.date.slice(0,7)&&m.mode==='receipts'))fail('Receipt needs a matching source and receipt-mode month.');
});
export function completeMonths(p,start=p.analysisStart,end=p.analysisEnd){return p.months.filter(m=>m.coverage==='complete'&&m.month>=start&&m.month<=end).sort((a,b)=>a.month.localeCompare(b.month)).map(m=>({...m,total:m.mode==='receipts'?p.receipts.filter(r=>r.date.startsWith(m.month)).reduce((s,r)=>s+r.amount,0):Object.values(m.amounts).reduce((a,b)=>a+b,0)}));}
export function baseline(values){if(values.length<3)return null; const a=[...values].sort((a,b)=>a-b),h=(a.length-1)*.25,j=Math.floor(h);return Math.floor(a[j]+(h-j)*(a[Math.min(j+1,a.length-1)]-a[j]));}
export function metadata(p){return {currency:p.currency,period:[p.analysisStart,p.analysisEnd],revision:p.revision,calculationVersion:VERSION,assumptions:['Recorded take-home income only.','Costs remain unchanged.','No future income in savings-only figures.']};}
export function calculate(p){
  planSchema.parse(p); const months=completeMonths(p),values=months.map(m=>m.total),B=baseline(values);
  const fixedNumerator=p.costs.reduce((s,c)=>s+c.amount*({weekly:52,fortnightly:26,monthly:12,annual:1,once:12}[c.frequency]),0);
  const F=Math.ceil(fixedNumerator/12),P=F+p.variableCosts,S=p.savings,M=p.survivalMonths,target=P*M,goalMet=S>=target;
  const surplus=B===null?null:Math.max(0,B-P),contribution=B===null?null:goalMet?0:Math.floor(surplus*p.allocation/100);
  const weekly=B===null?null:Math.floor((surplus-contribution)*12/52);
  let buffer=0;const illustrations=months.map(m=>{const outflow=P+Math.floor((weekly??0)*52/12),surplus=Math.max(0,m.total-outflow),gap=Math.max(0,outflow-m.total),draw=Math.min(buffer,gap),save=Math.min(surplus,Math.max(0,target-buffer));buffer+=save-draw;return {...m,regularCosts:P,flexible:Math.floor((weekly??0)*52/12),save,draw,uncovered:gap-draw,excess:surplus-save,buffer};});
  return {...metadata(p),months,baseline:B,mean:values.length?Math.floor(values.reduce((a,b)=>a+b,0)/values.length):null,fixed:F,costs:P,savings:S,target,gap:Math.max(0,target-S),bufferSurplus:Math.max(0,S-target),goalMet,contribution,weekly,structuralGap:B===null?null:Math.max(0,P-B),runway:P?Math.floor(S*10/P)/10:null,cap:Math.floor(S/M),reduction:Math.max(0,P-Math.floor(S/M)),illustrations};
}
export function emptyPlan(currency='GBP',timezone=Intl.DateTimeFormat().resolvedOptions().timeZone){const now=today(timezone),last=addMonths(now.slice(0,7)+'-01',-1).slice(0,7);return {id:id(),schemaVersion:1,revision:0,currency,timezone,demo:false,sources:[{id:'source-1',name:''}],months:Array.from({length:6},(_,i)=>({month:addMonths(last+'-01',i-5).slice(0,7),coverage:'unknown',mode:'totals',amounts:{}})),receipts:[],savings:0,savingsDate:now,savingsAccessible:false,survivalMonths:null,costs:[{id:'rent',name:'Rent',amount:0,frequency:'monthly',priority:0}],variableCosts:0,budgetComplete:false,allocation:25,analysisStart:addMonths(last+'-01',-5).slice(0,7),analysisEnd:last};}
export function demoPlan(){const p=emptyPlan('GBP','Europe/London');p.demo=true;p.revision=1;p.sources=[{id:'cafe',name:'Café shifts'},{id:'design',name:'Freelance design'},{id:'delivery',name:'Delivery work'}];const totals=[[135000,42000,18000],[142000,68000,15000],[128000,24000,21000],[150000,78000,19000],[138000,39000,22000],[145000,55000,18000]];p.months=p.months.map((m,i)=>({...m,coverage:'complete',amounts:Object.fromEntries(p.sources.map((s,j)=>[s.id,totals[i][j]]))}));p.savings=240000;p.savingsAccessible=true;p.survivalMonths=3;p.costs=[{id:'rent',name:'Rent',amount:75000,frequency:'monthly',priority:0},{id:'bills',name:'Utilities & internet',amount:14500,frequency:'monthly',priority:0},{id:'phone',name:'Phone',amount:2500,frequency:'monthly',priority:0}];p.variableCosts=35000;p.budgetComplete=true;return p;}
export const scheduleSchema=z.object({id:z.string(),sourceId:z.string(),amount:int,nextDate:dateSchema,frequency:freq,endDate:z.union([dateSchema,z.literal('')]).optional()});
export const forecastSchema=z.object({start:dateSchema,weeks:z.number().int().min(4).max(52),everyday:int,confirmed:z.literal(true),savingsAccessible:z.literal(true),payments:z.array(scheduleSchema),billDates:z.record(dateSchema),sourceId:z.string(),interruptionStart:dateSchema,interruptionEnd:dateSchema}).superRefine((f,ctx)=>{if(f.interruptionEnd<=f.interruptionStart)ctx.addIssue({code:'custom',message:'Interruption must end after its start.'});});
export function occurrences(rule,start,end){
  const dates=[];let d=rule.nextDate,step=0;
  while(d<end&&step<25000){if(d>=start&&(!rule.endDate||d<=rule.endDate))dates.push(d);if(rule.frequency==='once')break;step++;d=rule.frequency==='weekly'?addDays(rule.nextDate,7*step):rule.frequency==='fortnightly'?addDays(rule.nextDate,14*step):addMonths(rule.nextDate,(rule.frequency==='annual'?12:1)*step);if(rule.endDate&&d>rule.endDate)break;}return dates;
}
export function allocate(total,index,count){return Math.floor(total/count)+(index<total%count?1:0);}
export function buildEvents(p,f,interrupted=false){
  forecastSchema.parse(f); const end=addDays(f.start,7*f.weeks),events=[];
  for(const rule of f.payments){if(!p.sources.some(s=>s.id===rule.sourceId))throw Error('Expected payment has an unknown income source.');for(const date of occurrences(rule,f.start,end)){if(interrupted&&rule.sourceId===f.sourceId&&date>=f.interruptionStart&&date<f.interruptionEnd)continue;events.push({id:rule.id+'-'+date,date,kind:'income',name:p.sources.find(s=>s.id===rule.sourceId).name,amount:rule.amount,priority:0});}}
  for(const c of p.costs){if(!validDate(f.billDates[c.id]))throw Error('Confirm a next due date for every fixed cost.');for(const date of occurrences({...c,nextDate:f.billDates[c.id]},f.start,end))events.push({id:c.id+'-'+date,date,kind:'bill',name:c.name,amount:c.amount,priority:c.priority});}
  const weekly=calculate(p).weekly??0;
  for(let i=0;i<7*f.weeks;i++){const date=addDays(f.start,i);events.push({id:'living-'+date,date,kind:'variable',name:'Budgeted living costs',amount:allocate(p.variableCosts,Number(date.slice(8))-1,daysInMonth(date.slice(0,7))),priority:0});events.push({id:'flexible-'+date,date,kind:'flexible',name:'Additional flexible spending',amount:allocate(weekly,i%7,7),priority:0});}
  const order={income:0,bill:1,variable:2,flexible:3};return events.sort((a,b)=>a.date.localeCompare(b.date)||order[a.kind]-order[b.kind]||a.priority-b.priority||a.id.localeCompare(b.id));
}
export function ledger(events,opening,start,weeks){
  let required=opening,cash=opening,min=opening,first=null,firstUnpaid=null,firstBill=null;const unpaid=[],trace=[],weekly=[];
  for(let week=0;week<weeks;week++){const from=addDays(start,week*7),to=addDays(from,7);let income=0,costs=0;
    for(const e of events.filter(e=>e.date>=from&&e.date<to)){
      if(e.kind==='income'){required+=e.amount;cash+=e.amount;income+=e.amount;for(const u of unpaid){const pay=Math.min(cash,u.remaining);cash-=pay;u.remaining-=pay;}}
      else{required-=e.amount;costs+=e.amount;const paid=Math.min(cash,e.amount);cash-=paid;if(paid<e.amount){const u={...e,remaining:e.amount-paid};unpaid.push(u);if(!firstUnpaid)firstUnpaid={...u};if(e.kind==='bill'&&!firstBill)firstBill={...u};}}
      if(required<0&&!first)first=e.date;min=Math.min(min,required);const outstanding=unpaid.reduce((s,u)=>s+u.remaining,0);if(required!==cash-outstanding)throw Error('Ledger reconciliation failed.');trace.push({...e,required,cash,outstanding});
    }weekly.push({week:week+1,from,to:addDays(to,-1),income,costs,balance:required,cash,unpaid:unpaid.reduce((s,u)=>s+u.remaining,0)});
  }return {weekly,trace,first,firstUnpaid,firstBill,peakGap:Math.max(0,-min),closing:required};
}
export function simulate(p,f){forecastSchema.parse(f);if(!p.sources.some(s=>s.id===f.sourceId))throw Error('Choose an existing source.');const ordinary=buildEvents(p,f),interrupted=buildEvents(p,f,true);return {...metadata(p),horizon:[f.start,addDays(f.start,f.weeks*7-1)],ordinary:ledger(ordinary,f.everyday+p.savings,f.start,f.weeks),without:ledger(interrupted,f.everyday,f.start,f.weeks),with:ledger(interrupted,f.everyday+p.savings,f.start,f.weeks)};}
export function reportData(p,start=p.analysisStart,end=p.analysisEnd){
  const months=completeMonths(p,start,end),total=months.reduce((s,m)=>s+m.total,0),sources=p.sources.map(s=>({...s,total:months.reduce((sum,m)=>sum+(m.mode==='receipts'?p.receipts.filter(r=>r.sourceId===s.id&&r.date.startsWith(m.month)).reduce((a,r)=>a+r.amount,0):m.amounts[s.id]??0),0)})).sort((a,b)=>b.total-a.total);
  const grouped=sources.length>6?[...sources.slice(0,6),{id:'other',name:'Other sources',total:sources.slice(6).reduce((a,s)=>a+s.total,0)}]:sources;
  let expected=0;for(let m=start;m<=end&&expected<120;m=addMonths(m+'-01',1).slice(0,7))if(m<today(p.timezone).slice(0,7))expected++;
  return {...metadata(p),period:[start,end],generated:today(p.timezone),demo:p.demo,months,total,sources:grouped,complete:months.length,expected,zero:months.filter(m=>m.total===0).length,mean:months.length?Math.floor(total/months.length):null,min:months.length?Math.min(...months.map(m=>m.total)):null,max:months.length?Math.max(...months.map(m=>m.total)):null,excluded:expected-months.length,limited:months.length<3};
}
