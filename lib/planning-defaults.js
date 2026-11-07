export const DEFAULT_SURVIVAL_MONTHS=3;
export const LIVING_COST_SOURCE={
  title:'ONS Family spending, FYE 2025 · Table A23',
  url:'https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure/datasets/familyspendingworkbook2expenditurebyincome',
  group:'UK, one non-retired adult',period:'April 2024–March 2025',published:'11 June 2026'
};
// Weekly amounts in pence, column K of Table A23. This is a selected
// expenditure basket, not total household expenditure or a minimum budget.
export const LIVING_COST_CATEGORIES=[
  {id:'food',label:'Food & non-alcoholic drinks',weekly:4030},
  {id:'clothing',label:'Clothing & footwear',weekly:1050},
  {id:'household',label:'Household goods & services',weekly:2810},
  {id:'transport',label:'Transport',weekly:5430},
  {id:'recreation',label:'Recreation & culture',weekly:4040},
  {id:'eatingout',label:'Restaurants & hotels',weekly:2710}
];
export const DEFAULT_LIVING_CATEGORIES=LIVING_COST_CATEGORIES.map(c=>c.id);
export const isOmitted=v=>v===undefined||v===null||(typeof v==='string'&&v.trim()==='');
export function livingCostDefault(currency='GBP',categories=DEFAULT_LIVING_CATEGORIES){
  if(currency!=='GBP')return 0;
  const included=new Set(categories);
  return Math.ceil(LIVING_COST_CATEGORIES.filter(c=>included.has(c.id)).reduce((s,c)=>s+c.weekly,0)*52/12);
}
export function resolvePlanDefaults(input){
  if(!input||typeof input!=='object')return input;
  const p={...input},goalMissing=isOmitted(p.survivalMonths),costMissing=isOmitted(p.variableCosts);
  p.livingCostCategories=p.livingCostCategories??[...DEFAULT_LIVING_CATEGORIES];
  // Unknown category IDs are left for schema validation, never silently used.
  if(goalMissing)p.survivalMonths=DEFAULT_SURVIVAL_MONTHS;
  if(costMissing&&Array.isArray(p.livingCostCategories))p.variableCosts=livingCostDefault(p.currency,p.livingCostCategories);
  p.defaults={survivalMonths:goalMissing||p.defaults?.survivalMonths===true,variableCosts:costMissing||p.defaults?.variableCosts===true};
  return p;
}
