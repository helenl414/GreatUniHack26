import { jsPDF } from 'jspdf';
import { fmt, monthLabel, dateLabel } from './engine.js';
export function createReportPDF(r,name='',format='a4'){
  if(!r.complete)throw Error('Complete at least one recorded month to create a report.');
  const doc=new jsPDF({unit:'mm',format});const width=doc.internal.pageSize.getWidth(),height=doc.internal.pageSize.getHeight(),pad=18,w=width-pad*2;
  const text=(s,x,y,size=10,color='#233e37')=>{doc.setFontSize(size);doc.setTextColor(color);doc.text(String(s),x,y);};
  const line=y=>{doc.setDrawColor('#dce4de');doc.line(pad,y,width-pad,y);};
  doc.setFillColor('#1d4b3f');doc.rect(0,0,width,40,'F');text('steady',pad,18,20,'#ffffff');text('SELF-REPORTED INCOME SUMMARY',pad,29,10,'#e3efde');
  text(r.demo?'DEMO DATA · Fictional example':'Self-reported. Not independently verified.',pad,48,10);if(r.demo)text('Self-reported. Not independently verified.',pad,54,9);
  text(name.trim().slice(0,70)||'Income summary',pad,64,16);
  text(`${monthLabel(r.period[0])} – ${monthLabel(r.period[1])}`,pad,72,10);text(`Currency: ${r.currency}  |  Generated: ${dateLabel(r.generated)}`,pad,78,9);
  if(r.limited)text('LIMITED HISTORY · Fewer than three complete months',pad,85,9,'#93611b');
  line(90);const labels=['Total recorded income','Mean monthly income','Lowest complete month','Highest complete month'],values=[r.total,r.mean,r.min,r.max];
  labels.forEach((l,i)=>{const x=pad+(i%2)*(w/2),y=101+Math.floor(i/2)*22;text(l,x,y,9,'#67746f');text(fmt(values[i],r.currency),x,y+9,17);});
  text('MONTHLY RECORDED INCOME',pad,149,9);const max=Math.max(1,...r.months.map(m=>m.total));const bw=w/r.months.length;
  r.months.forEach((m,i)=>{const bar=m.total/max*23;doc.setFillColor('#91b9a1');doc.rect(pad+i*bw+2,180-bar,Math.max(1,bw-4),bar,'F');text(monthLabel(m.month,true).slice(0,3),pad+i*bw+2,186,7);});
  text('INCOME BY SOURCE',pad,198,9);r.sources.forEach((s,i)=>{const y=206+i*5;text(doc.splitTextToSize(s.name,w-48)[0],pad,y,9);text(fmt(s.total,r.currency),width-pad-38,y,9);});
  const y=243;line(y);text(`Income recorded in ${r.complete} of ${r.expected} complete months. Confirmed zero-income months: ${r.zero}.`,pad,y+7,8);
  const note=`Coverage: ${r.excluded} incomplete or unknown month(s) excluded. Complete months, including confirmed zeros, are included in statistics. Actual receipts only; no forecasts.`;
  doc.setFontSize(8);doc.text(doc.splitTextToSize(note,w),pad,y+13);
  const footer='This summary is self-reported, not independent verification. It does not guarantee future earnings or acceptance by a landlord or lender.';
  doc.setTextColor('#67746f');doc.text(doc.splitTextToSize(footer,w),pad,height-13);
  doc.setProperties({title:'Self-reported income summary',subject:r.demo?'Demo data':'Self-reported income',creator:'Steady'});return doc;
}
