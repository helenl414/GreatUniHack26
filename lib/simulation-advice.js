import { fmt, dateLabel } from './engine.js';

// Every numerical claim is inserted from the current deterministic result.
// No model response or external service is involved.
export function simulationAdvice(result,plan){
  if(result.revision!==plan.revision)throw Error('Refresh the simulation after changing your plan.');
  const f=n=>fmt(n,result.currency),scenario=result.scenario,withSavings=result.with,ordinary=result.ordinary;
  const activity=scenario.type==='activity';
  const extraGap=Math.max(0,withSavings.peakGap-ordinary.peakGap);
  const closing=n=>n<0?`a ${f(-n)} gap`:`${f(n)} left after all modelled costs`;
  let summary;
  if(activity){
    const cost=scenario.activity;
    summary=`Spending ${f(cost.amount)} on ${cost.name} on ${dateLabel(cost.date)} gives ${closing(withSavings.closing)} at the end of this view, compared with ${closing(ordinary.closing)} without that extra purchase. Both figures include your current savings.`;
  }else{
    const source=plan.sources.find(s=>s.id===scenario.sourceId)?.name||'the selected source';
    summary=`This pause in ${source} gives ${closing(withSavings.closing)} at the end of this view when your current savings are included. Without using those savings, the same scenario ends with ${closing(result.without.closing)}.`;
  }
  let impact;
  if(withSavings.first){
    impact=ordinary.first?`Your ordinary forecast already has a gap on ${dateLabel(ordinary.first)}. This scenario's peak funding gap is ${f(withSavings.peakGap)}, ${f(extraGap)} more than the ordinary forecast.`:`With current savings included, the first projected shortfall is ${dateLabel(withSavings.first)}. The peak funding gap is ${f(withSavings.peakGap)}.`;
  }else impact=`No projected shortfall appears with current savings within ${dateLabel(result.horizon[0])} to ${dateLabel(result.horizon[1])}. That covers only this period and the costs included in your plan.`;
  const firstBill=withSavings.firstBill,firstUnpaid=withSavings.firstUnpaid;
  if(firstBill)impact+=` ${firstBill.name} is the first bill that cannot be paid in full: ${f(firstBill.remaining)} is unpaid on ${dateLabel(firstBill.date)}.`;
  else if(firstUnpaid)impact+=` The first underfunded item is ${firstUnpaid.name} on ${dateLabel(firstUnpaid.date)}; no fixed bill is flagged within this view.`;
  const uncertainty=plan.defaults?.variableCosts?`Living costs use an editable UK one-adult average-based estimate. Your actual spending may be different. Confirm those costs and expected payment dates before relying on this projection.`:'Expected payments may arrive late and costs may change. The forecast keeps all entered spending unchanged and does not move any money.';
  const nextSteps=[
    withSavings.first?{title:'Look at the first gap',text:`Review ${firstUnpaid?.name||'the costs due'} around ${dateLabel(withSavings.first)}. Check the amounts and dates before making a decision.`}:{title:'Check the money you are counting on',text:'Confirm the expected payment dates, accessible savings and everyday opening money. A later receipt can change the result.'},
    activity?{title:withSavings.first?'Try a smaller amount or a later date':'Compare another version of the activity',text:'Rerun this activity with a different cost or date and compare the first shortfall and lowest balance. Keep recurring bills and living costs included.'}:{title:'Try another interruption length',text:'Adjust the resume date to see how a shorter or longer pause changes the gap. This does not change your historical income records.'},
    plan.defaults?.variableCosts?{title:'Replace the living-cost estimate',text:'Use your own food, travel and other everyday spending when you know it. Remove anything already counted as a recurring cost.'}:{title:'Keep the next bills in view',text:'Review the weekly table and money needed for upcoming bills before treating the closing balance as money available to spend.'}
  ];
  return {revision:result.revision,summary,impact,uncertainty,nextSteps};
}
