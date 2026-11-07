'use client';
import {ArrowRight,ArrowUpRight,ChartNoAxesCombined,SlidersHorizontal,FileText,ShieldCheck,Info,Leaf,LockKeyhole} from 'lucide-react';
import {fmt,monthLabel} from '../lib/engine.js';

const introduction='Sothis is a finance app built for people whose income doesn’t arrive in a straight line: seasonal workers, part-time and short-term staff, and anyone who changes jobs often. It turns irregular earnings into a clear picture, with income visualisation, practical budgeting guidance, and “Prove my income” statements you can share with landlords, lenders and employers. Our aim is to help people with fluctuating pay manage their money with confidence and build lasting financial resilience.';
const features=[
 {icon:ChartNoAxesCombined,number:'01',tab:'Income Planner',href:'#income-planner',title:'Income Planner',text:'Bring your earnings and costs together. Find a cautious baseline and smooth out the uneven months.',action:'Build my plan'},
 {icon:SlidersHorizontal,number:'02',tab:'Simulator',href:'#simulator',title:'Simulator',text:'Explore an income pause or an extra activity expense. See what it could mean for the weeks ahead.',action:'Explore a what-if'},
 {icon:FileText,number:'03',tab:'Prove My Income',href:'#prove-my-income',title:'Prove My Income',text:'Turn your recorded earnings into a clear, downloadable self-reported income summary.',action:'View my income summary'}
];
const safety=[
 {icon:ShieldCheck,title:'What Sothis is, and isn’t',text:'Sothis is designed to support your financial education and planning. It does not provide regulated financial advice, and nothing in the app should be taken as a recommendation to buy, sell, or take out any financial product.'},
 {icon:ChartNoAxesCombined,title:'About estimates',text:'Projections and estimates are based on the information and assumptions you enter. Your actual future income and costs may differ.'},
 {icon:FileText,title:'About “Prove my income” statements',text:'These statements are self-reported. They are not independently verified, and we can’t guarantee that a landlord, lender, or employer will accept them.'},
 {icon:Leaf,title:'Our commitment',text:'Sothis is still growing, and we’re working to become more reliable and trustworthy over time. Your feedback helps us get there, so please tell us what’s working and what isn’t.'}
];

export default function Home({plan,results,start,demo,navigate}){
 const ready=plan&&results&&results.weekly!==null;
 const follow=(event,action)=>{event.preventDefault();action();};
 return <div className="sothis-home">
  <section className={`home-spending ${ready?'has-plan':'start-state'}`} aria-label={ready?'Your weekly spending estimate':'Start your planning journey'}>
   <div className="spending-main">
    <span className="home-card-kicker"><span className="home-card-icon"><ChartNoAxesCombined size={19}/></span>{ready?'BASED ON YOUR RECORDED INCOME':'A LITTLE CLARITY FOR WHATEVER COMES NEXT'}</span>
    {ready?<><h1>Estimated weekly spending limit</h1><div className="weekly-amount">{fmt(results.weekly,plan.currency)}<span> / week</span></div><p className="weekly-period">{monthLabel(plan.analysisStart)} – {monthLabel(plan.analysisEnd)} · {plan.currency}{plan.demo?' · DEMO DATA':''}</p></>:<><h1>{plan?'A little more history. A clearer estimate.':'Your next chapter starts with a clearer plan.'}</h1><p>{plan?'Record at least three complete months to see your income-based weekly spending estimate here. Your savings-only plan is already available.':'Bring your income and costs together to find an estimated weekly spending limit that fits your recorded earnings.'}</p></>}
   </div>
   <div className="spending-action">
    {ready&&<p>Additional spending after your entered costs and planned saving allocation. This is a planning estimate, not a guaranteed safe amount.</p>}
    <a className="home-primary-link" href="#income-planner" onClick={event=>follow(event,start)}>{ready?'Review my plan':plan?'Complete my income history':'Start your journey'}<ArrowRight size={18}/></a>
    {!plan&&<button className="home-demo-link" onClick={demo}>Try sample data <ArrowUpRight size={15}/></button>}
    <span className="home-card-trust"><LockKeyhole size={12}/> No bank connection or account needed</span>
   </div>
   {ready&&(results.structuralGap>0||plan.defaults?.variableCosts||plan.defaults?.survivalMonths)&&<div className="home-spending-assumptions"><Info size={15}/><div>{results.structuralGap>0&&<p>Current monthly costs exceed the cautious income baseline by {fmt(results.structuralGap,plan.currency)}. A zero additional allowance does not mean all costs are covered.</p>}{plan.defaults?.variableCosts&&<p>{plan.currency==='GBP'?`Living costs include an average-based estimate of ${fmt(plan.variableCosts,plan.currency)} per month. Review it against your own spending.`:'Living costs are not included. Enter them for a fuller spending estimate.'}</p>}{plan.defaults?.survivalMonths&&<p>Your savings goal uses the editable default of {plan.survivalMonths} months.</p>}</div></div>}
  </section>

  <section className="sothis-intro" aria-labelledby="sothis-intro-title"><span className="eyebrow">MADE FOR INCOME THAT MOVES</span><h2 id="sothis-intro-title">What is Sothis?</h2><p>{introduction}</p></section>

  <section className="sothis-paths" aria-label="Explore Sothis"><div className="feature-grid">{features.map(({icon:Icon,...feature})=><a className="feature-card" href={feature.href} key={feature.tab} onClick={event=>follow(event,()=>navigate(feature.tab))}><div className="feature-top"><span className="feature-icon"><Icon size={22}/></span><span>{feature.number}</span></div><h3>{feature.title}</h3><p>{feature.text}</p><span className="feature-link">{feature.action}<ArrowUpRight size={18}/></span></a>)}</div></section>

  <section className="sothis-safety" aria-labelledby="sothis-safety-title"><div className="safety-heading"><span className="eyebrow">A CLEAR PICTURE INCLUDES THE LIMITS</span><h2 id="sothis-safety-title">How to safely utilise Sothis?</h2></div><div className="safety-grid">{safety.map(({icon:Icon,title,text})=><article className="safety-item" key={title}><span className="safety-icon"><Icon size={20}/></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>

  <div className="sothis-data-note"><LockKeyhole size={16}/><p>Your entries stay in browser memory unless you choose to remember your plan on this device. AI assistance is optional; only descriptions you choose to send reach the configured AI provider.</p></div>
 </div>;
}
