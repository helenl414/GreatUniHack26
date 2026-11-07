import { z } from 'zod';
import { money, validDate } from './engine.js';
const amount=z.string().regex(/^\d+(\.\d{1,2})?$/);
export function assertCurrency(text,currency){
  const named=[...text.matchAll(/\b(GBP|USD|EUR|CAD|AUD)\b/g)].map(m=>m[1]);
  if(named.some(c=>c!==currency)||(text.includes('£')&&currency!=='GBP')||(text.includes('€')&&currency!=='EUR')||(text.includes('$')&&!['USD','CAD','AUD'].includes(currency)))throw Error('Use one currency per plan. The description contains a different currency; review or convert amounts yourself before entering them.');
}
export const extractionSchema=z.object({
  sources:z.array(z.object({name:z.string().min(1).max(80),note:z.string().max(300)})).max(30),
  monthly:z.array(z.object({source:z.string().min(1).max(80),month:z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),amount})).max(360),
  receipts:z.array(z.object({source:z.string().min(1).max(80),date:z.string().refine(validDate),amount})).max(100),
  savings:amount.nullable(),survivalMonths:z.number().int().positive().max(1200).nullable(),
  costs:z.array(z.object({name:z.string().min(1).max(80),amount,frequency:z.enum(['weekly','fortnightly','monthly','annual','once'])})).max(50),
  variableCosts:amount.nullable(),questions:z.array(z.string().max(300)).max(15)
}).strict().superRefine((d,ctx)=>{for(const x of [...d.monthly,...d.receipts,...d.costs])try{money(x.amount);}catch{ctx.addIssue({code:'custom',message:'Invalid amount.'});}});

// An explicitly labelled, limited offline parser. It never guesses a year,
// payment date, pay rate, completeness, or income from hours worked.
export function offlineDraft(text,currency){
  if(currency)assertCurrency(text,currency);
  const out={sources:[],monthly:[],receipts:[],savings:null,survivalMonths:null,costs:[],variableCosts:null,questions:[]};
  const source=name=>{name=name.trim().replace(/^(?:from\s+)?(?:the\s+)?/i,'');if(name&&!out.sources.some(s=>s.name.toLowerCase()===name.toLowerCase()))out.sources.push({name,note:''});return name;};
  for(const m of text.matchAll(/\bat\s+([\p{L}][\p{L}\d '&-]{1,50}?)(?=,|\.|\s+and\s|\s+on\s|$)/giu)){const name=source(m[1]);const note=text.match(/\b(?:about\s+)?\d+\s+hours[^.]{0,120}/i);if(note)out.sources.find(s=>s.name===name).note=note[0];}
  if(/\bDeliveroo\b/i.test(text))source('Deliveroo');
  const logging=text.match(/\b(?:got|received)\s+[£$€]?\s*(\d+(?:\.\d{1,2})?)\s+from\s+(?:the\s+)?([\p{L}][\p{L} '&-]{1,60}?)(?=\s+(?:on|this|last|today|yesterday)\b|[.!]|$)/iu);
  if(logging){const name=source(logging[2]);const exact=text.match(/\bon\s+(\d{4}-\d{2}-\d{2})\b/);if(exact&&validDate(exact[1]))out.receipts.push({source:name,date:exact[1],amount:logging[1]});else out.questions.push('What was the actual payment date, including day, month and year? This receipt remains a draft until its exact date is supplied.');}
  // Explicit conversational lines: "Café: 2026-07 800, 2026-08 1000".
  for(const line of text.split(/[\n;]/)){
    const h=line.match(/^\s*([^:]{1,80}):\s*(.+)$/);if(!h)continue;
    const matches=[...h[2].matchAll(/(\d{4}-\d{2})\s+[£$€]?\s*(\d+(?:\.\d{1,2})?)(?![\d.])/g)];
    if(matches.length){const name=source(h[1]);for(const m of matches)out.monthly.push({source:name,month:m[1],amount:m[2]});}
  }
  const monthNames=['january','february','march','april','may','june','july','august','september','october','november','december'];
  const yearMatches=[...text.matchAll(/\b(20\d{2})\b/g)].map(x=>x[1]);const years=[...new Set(yearMatches)];
  for(const sentence of text.split(/(?:[\n;!]|\.(?=\s|$))/)){
    const head=sentence.match(/(?:from\s+(?:the\s+)?(.+?)\s+I\s+received|^\s*(.+?)\s+(?:paid|received))/i);if(!head)continue;
    const name=source(head[1]||head[2]);
    const re=/(?:[£$€]\s*)?(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s+in\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(20\d{2}))?/gi;
    for(const m of sentence.matchAll(re)){const y=m[3]||(years.length===1?years[0]:null);if(y)out.monthly.push({source:name,month:y+'-'+String(monthNames.indexOf(m[2].toLowerCase())+1).padStart(2,'0'),amount:m[1].replaceAll(',','')});else out.questions.push('Which year do these named months refer to? Enter the year before confirming.');}
  }
  const savings=text.match(/(?:I\s+have|savings(?:\s+are)?|saved)\s*[£$€]?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:saved|in\s+savings)?/i);if(savings)out.savings=savings[1].replaceAll(',','');
  const goal=text.match(/(?:cover|last|goal(?:\s+is)?)\s+(\d+)\s+months?/i);if(goal)out.survivalMonths=Number(goal[1]);
  for(const m of text.matchAll(/\b(rent|bills|phone|internet|utilities)\s+(?:is|are|of)?\s*[£$€]?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/gi))out.costs.push({name:m[1],amount:m[2].replaceAll(',',''),frequency:'monthly'});
  const variable=text.match(/(?:other\s+monthly\s+spending|living\s+costs|variable\s+costs)\s+(?:is|are)?\s*[£$€]?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);if(variable)out.variableCosts=variable[1].replaceAll(',','');
  if(!out.monthly.length&&!out.receipts.length)out.questions.push('What take-home amounts did you actually receive from each source, and in which exact calendar months?');
  if(out.savings===null)out.questions.push('How much accessible savings do you have?');
  if(out.survivalMonths===null)out.questions.push('How many whole months should savings cover if no new income arrives?');
  if(!out.costs.length||out.variableCosts===null)out.questions.push('What are your current recurring bills and monthly living costs?');
  out.questions.push('Review all amounts and confirm which months and costs are complete.');
  return extractionSchema.parse(out);
}
