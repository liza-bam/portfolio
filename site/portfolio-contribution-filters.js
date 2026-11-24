// Contribution pills filter existing page content without duplicating or rewriting it.
(() => {
 const buttons=[...document.querySelectorAll('[data-contribution]')];
 const header=document.querySelector('.masthead');
 const study=document.querySelector('.original-study');
 if(!buttons.length||!study)return;
 const pick=selector=>[...document.querySelectorAll(selector)];
 const following=selector=>{const e=document.querySelector(selector);return e?[e,e.nextElementSibling].filter(Boolean):[];};
 const relevance={
  alignment:()=>[...following('#business-findings'),...pick('.business-findings,#workshop-results,#ecosystem,#lesson-alignment,#lesson-handoff')],
  design:()=>[...pick('#situation-description,#primary-blueprint,#workshop-results,#ecosystem,#ideate > .source-body > p,#future-blueprint,#salesforce-docusign-schema,#functional-design,#docusign-design,#lesson-documents,#lesson-sequence'),...following('#ideate > .source-body > h3'),...following('#ux-focused-development')],
  planning:()=>[...pick('#delivery-plan,#action-description,#lesson-sequence,#lesson-handoff'),...following('#plan h3')],
  testing:()=>pick('#develop'),
  education:()=>pick('#adopt')
 };
 let active=null,originalOpen=null;
 const roots=[...study.children].filter(e=>e.matches('details.portfolio-accordion, .case-story-step'));
 const accordionFor=root=>root.matches('details')?root:root.querySelector(':scope > details');
 const openingResults=document.querySelector('.opening > .portfolio-card-grid');
 function apply(key){
  if(!originalOpen)originalOpen=new Map(roots.map(accordionFor).filter(Boolean).map(e=>[e,e.open]));
  study.querySelectorAll('.portfolio-contribution-hidden').forEach(e=>e.classList.remove('portfolio-contribution-hidden'));
  roots.forEach(e=>e.classList.remove('portfolio-contribution-hidden'));
  active=active===key?null:key;
  buttons.forEach(button=>{if(button.dataset.contribution==='reset'){button.title='Show all content';return;}const selected=button.dataset.contribution===active;button.setAttribute('aria-pressed',String(selected));button.title=selected?'Show all content':'Show only '+button.textContent.trim();});
  openingResults?.classList.toggle('portfolio-contribution-hidden',!!active);
  if(!active){originalOpen.forEach((open,e)=>e.open=open);originalOpen=null;document.dispatchEvent(new Event('portfolio:contribution-changed'));return;}
  const selected=relevance[active]();
  function visit(node){
   if(selected.includes(node))return;
   if(!selected.some(item=>node.contains(item))){node.classList.add('portfolio-contribution-hidden');return;}
   for(const child of node.children){if(child.matches('summary, .case-story-heading'))continue;visit(child);}
  }
  roots.forEach(root=>{
   visit(root);
   const accordion=accordionFor(root);
   if(accordion&&!root.classList.contains('portfolio-contribution-hidden'))accordion.open=true;
  });
  document.dispatchEvent(new Event('portfolio:contribution-changed'));
  const first=roots.find(root=>!root.classList.contains('portfolio-contribution-hidden'));
  requestAnimationFrame(()=>{first?.scrollIntoView({block:'start',behavior:'instant'});});
 }
 buttons.forEach(button=>button.addEventListener('click',()=>apply(button.dataset.contribution==='reset'?null:button.dataset.contribution)));
 document.addEventListener('portfolio:reset-contribution',()=>apply(null));
 new ResizeObserver(()=>document.documentElement.style.setProperty('--portfolio-header-height',header.getBoundingClientRect().height+'px')).observe(header);
})();

(()=>{const mq=matchMedia('(max-width:700px) and (pointer:coarse)');const pills=[...document.querySelectorAll('.portfolio-filter-pill[data-short]')];const swap=()=>pills.forEach(p=>{p.textContent=mq.matches?p.dataset.short:p.dataset.full;});swap();mq.addEventListener('change',swap);})();
