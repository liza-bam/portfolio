// Preserve section links and expose subsection navigation with expanded detail.
(() => {
 const sections=[...document.querySelectorAll('.original-study > details.portfolio-accordion')];
 function openAt(heading){
  const section=heading.closest('details.portfolio-accordion');
  if(section)section.open=true;
  heading.setAttribute('tabindex','-1');
  heading.focus({preventScroll:true});
  heading.scrollIntoView({block:'start',behavior:'instant'});
 }
 sections.forEach((section,index)=>{
  const summary=section.querySelector(':scope > summary');
  const title=section.querySelector('h2');
  const headings=[...section.querySelectorAll('.portfolio-accordion-body h3')];
  if(!headings.length)return;
  const nav=document.createElement('nav');nav.className='portfolio-accordion-pills portfolio-filter-pills';nav.setAttribute('aria-label',title.textContent+' subsections');
  headings.forEach((heading,i)=>{
   if(!heading.id)heading.id='portfolio-subsection-'+index+'-'+i;
   const button=document.createElement('button');button.type='button';button.className='figure-button portfolio-filter-pill';button.textContent=heading.textContent;button.dataset.accordionTarget=heading.id;button.setAttribute('aria-controls',heading.id);
   button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();openAt(heading);});
   nav.append(button);
  });
  summary.append(nav);
 });
 document.querySelectorAll('[data-section-target]').forEach(button=>{
  const heading=document.getElementById(button.dataset.sectionTarget);
  button.addEventListener('click',()=>{document.dispatchEvent(new Event('portfolio:reset-contribution'));openAt(heading);});
 });
 document.addEventListener('portfolio:contribution-changed',()=>{
  document.querySelectorAll('[data-accordion-target]').forEach(button=>{button.hidden=!!document.getElementById(button.dataset.accordionTarget).closest('.portfolio-contribution-hidden');});
 });
})();
