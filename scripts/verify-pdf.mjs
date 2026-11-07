import fs from 'node:fs';
import {demoPlan,reportData} from '../lib/engine.js';
import {createReportPDF} from '../lib/report.js';
fs.mkdirSync('qa',{recursive:true});
const p=demoPlan();
for(let i=0;i<7;i++){p.sources.push({id:'extra-'+i,name:'Seasonal project '+i+' with a deliberately very long descriptive source name'});p.months.forEach(m=>m.amounts['extra-'+i]=1000);}
for(const format of ['a4','letter']){
 createReportPDF(reportData(p),'Fictional example with many income sources',format).save(`qa/report-many-${format}.pdf`);
 const limited={...p,months:p.months.slice(0,2)};
 createReportPDF(reportData(limited),'Fictional example with limited history',format).save(`qa/report-limited-${format}.pdf`);
}
console.log('Created four QA reports from the application PDF renderer.');
