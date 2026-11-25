/* Fit the complete original diagrams at smaller breakpoints. No summaries. */
(() => {
 const small=matchMedia('(max-width:1100px)');
 document.querySelectorAll('.blueprint-recreated,.ecosystem-figure').forEach(figure=>{
  const svg=figure.querySelector('.blueprint-svg,.ecosystem-diagram');
  const frame=document.createElement('div');frame.className='fitted-diagram';
  const image=document.createElement('img');image.alt=svg.getAttribute('aria-label')||svg.querySelector('title')?.textContent||figureTitle(figure.querySelector('figcaption'));
  image.width=svg.viewBox.baseVal.width;image.height=svg.viewBox.baseVal.height;frame.append(image);figure.append(frame);
  if(figure.classList.contains('ecosystem-figure')){
   figure.querySelectorAll('.ecosystem-canvas .profile-info').forEach(original=>{
    const button=original.cloneNode(true);button.hidden=false;bindProfileInfo(button);frame.append(button);
   });
  }
  let rendering;
  function render(){
   if(!small.matches||rendering)return;
   rendering=diagramStill(figure,svg,svg.cloneNode(true)).then(async url=>{image.src=url;await image.decode();figure.classList.add('has-fitted-diagram');window.dispatchEvent(new Event('resize'));}).catch(error=>{rendering=null;console.error('Unable to fit the original diagram',error);});
  }
  render();small.addEventListener('change',render);
 });
 const figure=document.querySelector('#future-blueprint');
 const trigger=figure.querySelector('.blueprint-open');
 const notes=[...figure.querySelectorAll('.bp-solved')];
 const drawer=document.createElement('aside');drawer.hidden=true;drawer.className='painpoints-drawer fitted-notes-drawer';drawer.id='solved-painpoints-drawer';drawer.setAttribute('aria-labelledby','solved-painpoints-title');
 drawer.innerHTML='<header class="painpoints-header"><p class="figure-title" id="solved-painpoints-title">Solved pain points</p><button class="painpoints-close" type="button" aria-label="Close solved pain points"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18"/></svg></button></header><div class="figure-note-content"><select class="figure-note-select" id="solved-painpoint-select" aria-label="Solved pain points"></select><p class="figure-note-description"></p></div>';
 const select=drawer.querySelector('select'),description=drawer.querySelector('.figure-note-description');
 notes.forEach((note,i)=>{const option=document.createElement('option');option.value=i;option.textContent=note.getAttribute('aria-label').replace(/^Solved pain point: /,'');select.append(option);});
 const update=()=>description.textContent=notes[select.value]?.dataset.explanation||'';
 select.addEventListener('change',update);update();figure.append(drawer);
 const close=()=>setFigureDrawer(drawer,trigger,false);
 drawer.querySelector('button').addEventListener('click',close);
 figure.addEventListener('show-fitted-notes',()=>setFigureDrawer(drawer,trigger,drawer.hidden));
 figure.addEventListener('keydown',event=>{if(event.key==='Escape'&&!drawer.hidden){event.preventDefault();close();}});
 function syncTrigger(){
  if(!small.matches&&!drawer.hidden)setFigureDrawer(drawer,trigger,false,false);
  trigger.setAttribute('aria-controls',small.matches?drawer.id:'blueprint-dialog');
  if(small.matches){trigger.removeAttribute('aria-haspopup');trigger.setAttribute('aria-expanded',String(!drawer.hidden));}
  else{trigger.setAttribute('aria-haspopup','dialog');trigger.removeAttribute('aria-expanded');}
 }
 syncTrigger();small.addEventListener('change',syncTrigger);
})();
