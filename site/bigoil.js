// Open accordion ancestors when following a link to content inside them.
function revealAccordionTarget() {
 const id=decodeURIComponent(location.hash.slice(1));
 const target=id&&document.getElementById(id);
 if(!target)return;
 let ancestor=target.parentElement,opened=false;
 while(ancestor){if(ancestor.matches('details.portfolio-accordion')&&!ancestor.open){ancestor.open=true;opened=true;}ancestor=ancestor.parentElement;}
 if(opened)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
}
window.addEventListener('hashchange',revealAccordionTarget);
revealAccordionTarget();

// Original artifacts remain in RGB and open at their native resolution.
document.querySelectorAll('.source-figure a').forEach(link => { link.title = 'Open original at full size'; });
const blueprintDialog = document.getElementById('blueprint-dialog');
const blueprintTrigger = document.querySelector('.blueprint-open');
blueprintTrigger.addEventListener('click', () => {if(matchMedia('(max-width:1100px)').matches){blueprintTrigger.closest('figure').dispatchEvent(new CustomEvent('show-fitted-notes'));}else blueprintDialog.showModal();});
blueprintDialog.querySelector('.blueprint-close').addEventListener('click', () => blueprintDialog.close());
blueprintDialog.addEventListener('click', event => {
  if (event.target !== blueprintDialog) return;
  const rect = blueprintDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) blueprintDialog.close();
});
blueprintDialog.addEventListener('close', () => blueprintTrigger.focus());


const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// Start each visual only when its drawing area reaches the visible viewport, once per page visit.
// A visual that is scrolled out of view, or scrolled past before it started, shows its finished state
// with no animation. Replay buttons still play it again on request.
function animateOnViewport(target,play,finish){
 let state='waiting';
 const set=next=>{state=next;target.dataset.viewportState=next;};
 set('waiting');
 const run=()=>{
  set('running');
  Promise.resolve(play()).then(()=>{if(state==='running')set('complete');});
 };
 const settle=()=>{if(state==='complete'||state==='static')return;set('static');if(finish)finish();};
 const observer=new IntersectionObserver(entries=>{
  const entry=entries[entries.length-1];
  if(target.matches('.bp-scroll,.ecosystem-diagram')&&matchMedia('(max-width:1100px)').matches)return;
  if(entry.intersectionRatio>=.15){if(state==='waiting')run();return;}
  if(entry.isIntersecting||!entry.boundingClientRect.height)return; // hidden (for example in a closed 'see more') waits
  const scrolledPast=entry.rootBounds&&entry.boundingClientRect.bottom<=entry.rootBounds.top;
  if(state==='running'||(state==='waiting'&&scrolledPast))settle();
 },{threshold:[0,.15],rootMargin:'-88px 0px 0px 0px'});
 observer.observe(target);
 return ()=>run();
}

const completeChartArtwork=new WeakMap();
document.querySelectorAll('.chart-panel').forEach(panel=>{
 const chart=panel.querySelector('.sales-chart');
 completeChartArtwork.set(chart,chart.cloneNode(true));
 const bars=[...chart.querySelectorAll('.chart-bar')].map((bar,index)=>({bar,label:bar.nextElementSibling,height:+bar.getAttribute('height'),value:+bar.nextElementSibling.textContent,stack:+(bar.dataset.stack||0),stacked:bar.hasAttribute('data-stack'),delay:Math.floor(index/3)*85}));
 let frame;
 function draw(time){bars.forEach(({bar,label,height,value,stack,stacked,delay})=>{
  const t=Math.max(0,Math.min(1,(time-delay)/1500)),ease=t*t*(3-2*t),h=height*ease,y=330-(height+stack)*ease;
  bar.setAttribute('height',h);bar.setAttribute('y',y);
  label.setAttribute('y',stacked?(height<14?324:Math.min(324,y+h/2+4)):y-10);label.textContent=value;label.style.opacity=t===1?1:0;
 });}
 function play(){cancelAnimationFrame(frame);if(reducedMotion.matches){draw(5000);return;}const start=performance.now();draw(0);return new Promise(resolve=>{function tick(now){draw(now-start);if(now-start<2000)frame=requestAnimationFrame(tick);else resolve();}frame=requestAnimationFrame(tick);});}
 draw(reducedMotion.matches?5000:0);
 animateOnViewport(chart,play,()=>{cancelAnimationFrame(frame);draw(5000);});

 panel.querySelectorAll('.series-control').forEach(button=>button.addEventListener('click',()=>{const selected=button.getAttribute('aria-pressed')!=='true';panel.querySelectorAll('.series-control').forEach(item=>item.setAttribute('aria-pressed',String(item===button&&selected)));bars.forEach(({bar})=>bar.classList.toggle('is-muted',selected&&bar.getAttribute('fill')!==button.dataset.series));}));
});

const processBlueprint = document.querySelector('.blueprint-recreated');
function initializeProcess(processBlueprint) {
const processViewport = processBlueprint.querySelector('.bp-scroll');
const processSvg = processBlueprint.querySelector('.blueprint-svg');
const frozenActors = document.createElementNS('http://www.w3.org/2000/svg','svg');
const canvas=processBlueprint.querySelector('.bp-canvas');
const diagramHeight=processSvg.viewBox.baseVal.height;
canvas.style.setProperty('--diagram-width',processSvg.viewBox.baseVal.width+'px');
canvas.style.setProperty('--diagram-height',diagramHeight+'px');
frozenActors.setAttribute('viewBox','0 0 112 '+diagramHeight);
frozenActors.classList.add('bp-frozen-actors');
frozenActors.setAttribute('aria-label','Process actors');
processSvg.querySelectorAll('.bp-actor').forEach(actor => frozenActors.append(actor));
processSvg.before(frozenActors);
const processSteps = new Map([...processSvg.querySelectorAll('.bp-step[data-step]')].map(el=>[el.dataset.step,el]));
const processEdges = [...processSvg.querySelectorAll('.bp-connector')];
let processRun = 0, processAnimations = [], followFrame;
const pace = Number(processBlueprint.dataset.pace) || 1; // data-pace="2" plays a long diagram twice as fast
const STEP_MS = 250 / pace, ARROW_MS = 325 / pace;
function followStep(step, duration, run) {
  const box=step.getBBox(), width=processViewport.clientWidth;
  const target=Math.max(0,Math.min(processViewport.scrollWidth-width,box.x+box.width/2-width*.6));
  const from=processViewport.scrollLeft, start=performance.now();
  cancelAnimationFrame(followFrame);
  function frame(now){
    if(run!==processRun)return;
    const t=Math.min(1,(now-start)/duration),ease=t*t*(3-2*t);
    processViewport.scrollLeft=from+(Math.max(from,target)-from)*ease;
    if(t<1)followFrame=requestAnimationFrame(frame);
  }
  followFrame=requestAnimationFrame(frame);
}
async function playProcess(){
  const run=++processRun;
  processAnimations.forEach(a=>a.cancel());processAnimations=[];
  cancelAnimationFrame(followFrame);
  processViewport.scrollLeft=0;
  processEdges.forEach(edge=>edge.removeAttribute('data-line-complete'));
  if(reducedMotion.matches){processBlueprint.classList.remove('bp-sequenced');return;}
  processBlueprint.classList.add('bp-sequenced','bp-running');
  const animate=async(el,keyframes,duration)=>{
    const animation=el.animate(keyframes,{duration,fill:'forwards',easing:'ease-in-out'});
    processAnimations.push(animation);
    try{await animation.finished;}catch{}
  };
  const shown=new Set();
  const reveal=async(id)=>{
    if(shown.has(id)||run!==processRun)return;
    const step=processSteps.get(id);shown.add(id);
    followStep(step,ARROW_MS,run);
    await animate(step,[{opacity:0},{opacity:1}],STEP_MS);
    if(run!==processRun)return;
    processBlueprint.querySelectorAll('.bp-pain[data-step="'+id+'"]').forEach(dot=>{
      const animation=dot.animate([{opacity:0},{opacity:1}],{duration:125/pace,fill:'forwards'});processAnimations.push(animation);
    });
  };
  await reveal(processBlueprint.dataset.start || 'call');
  const outgoing = new Map();
  processEdges.forEach(edge => {
    if (!outgoing.has(edge.dataset.from)) outgoing.set(edge.dataset.from, []);
    outgoing.get(edge.dataset.from).push(edge);
  });
  for(const [from, edges] of outgoing){
    if(run!==processRun)return;
    await reveal(from);
    if(run!==processRun)return;
    followStep(processSteps.get(edges[0].dataset.to),ARROW_MS,run);
    await Promise.all(edges.map(async edge=>{
      const branchSelector=edge.hasAttribute('data-branch')?'[data-branch="'+edge.dataset.branch+'"]':'';
      const label=processSvg.querySelector('.bp-edge-label[data-from="'+edge.dataset.from+'"][data-to="'+edge.dataset.to+'"]'+branchSelector);
      if(label){const a=label.animate([{opacity:0},{opacity:1}],{duration:ARROW_MS,fill:'forwards'});processAnimations.push(a);}
      await animate(edge,[{opacity:1,strokeDashoffset:1},{opacity:1,strokeDashoffset:0}],ARROW_MS);
      if(run===processRun)edge.setAttribute('data-line-complete','');
    }));
    if(run!==processRun)return;
    await new Promise(resolve=>setTimeout(resolve,45/pace));
    if(run!==processRun)return;
    await Promise.all(edges.map(edge=>reveal(edge.dataset.to)));
  }
}
if(!reducedMotion.matches)processBlueprint.classList.add('bp-sequenced');
function finishProcess(){processRun++;processAnimations.forEach(a=>a.cancel());processAnimations=[];cancelAnimationFrame(followFrame);processEdges.forEach(edge=>edge.setAttribute('data-line-complete',''));processBlueprint.classList.remove('bp-sequenced','bp-running');}
const replayProcess=animateOnViewport(processViewport,playProcess,finishProcess);
processBlueprint.querySelectorAll('.bp-pain').forEach(button => {
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    processBlueprint.querySelectorAll('.bp-pain').forEach(el => el.setAttribute('aria-expanded', String(el === button && open)));
  });
  button.addEventListener('keydown', event => {
    if (event.key === 'Escape') button.setAttribute('aria-expanded', 'false');
  });
});
document.addEventListener('click', event => {
  if (!event.target.closest('.bp-pain')) processBlueprint.querySelectorAll('.bp-pain').forEach(el => el.setAttribute('aria-expanded', 'false'));
});

processBlueprint.querySelector('.bp-replay').addEventListener('click', replayProcess);
}
document.querySelectorAll('.blueprint-recreated').forEach(initializeProcess);

const painpointsDrawer = document.getElementById('painpoints-drawer');
const painpointsListButton = document.querySelector('.bp-list-open');
const drawerWorkspace = painpointsDrawer.closest('figure').querySelector('.figure-workspace');
const drawerTransitions = new WeakMap();
function setFigureDrawer(drawer, trigger, open, restoreFocus=true) {
  drawerTransitions.get(drawer)?.cancel();
  trigger.setAttribute('aria-expanded', String(open));
  const workspace=drawer.closest('figure').querySelector('.figure-workspace');
  workspace.classList.toggle('has-open-drawer',open);
  if(open) drawer.hidden=false;
  const animation=drawer.animate([{transform:open?'translateX(100%)':'translateX(0)'},{transform:open?'translateX(0)':'translateX(100%)'}],{duration:reducedMotion.matches?0:250,easing:'ease-in-out',fill:'forwards'});
  drawerTransitions.set(drawer,animation);
  animation.finished.then(()=>{if(!open)drawer.hidden=true;animation.cancel();}).catch(()=>{});
  if(open)drawer.querySelector('button').focus({preventScroll:true});
  else if(restoreFocus)trigger.focus({preventScroll:true});
}
function setPainpointsOpen(open, restoreFocus=true) {
  setFigureDrawer(painpointsDrawer,painpointsListButton,open,restoreFocus);
}
painpointsListButton.addEventListener('click', () => setPainpointsOpen(painpointsDrawer.hidden));
painpointsDrawer.querySelector('.painpoints-close').addEventListener('click', () => setPainpointsOpen(false));
processBlueprint.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !painpointsDrawer.hidden) { event.preventDefault(); setPainpointsOpen(false); }
});

// Ecosystem: RAL → axes → axis labels → areas → populate and label each ring.
const ecosystem = document.querySelector('.ecosystem-diagram');
const ecosystemFigure=document.querySelector('.ecosystem-figure');
const ecosystemWorkspace=ecosystemFigure.querySelector('.ecosystem-workspace');
const infoButtons=[...ecosystemFigure.querySelectorAll('.profile-info')];
const profileTip=ecosystemFigure.querySelector('.profile-tip');
const profileDescriptions=new Map([...ecosystemFigure.querySelectorAll('.profile-summary')].map(card=>[card.dataset.profile,{name:card.querySelector('.profile-name').textContent,description:card.querySelector('.profile-description').textContent}]));
infoButtons.forEach(button=>{button.style.setProperty('--profile-x',button.dataset.x+'%');button.style.setProperty('--profile-y',button.dataset.y+'%');});
let ecoRun=0,ecoAnimations=[];
async function playEcosystem(){
  const run=++ecoRun;
  ecoAnimations.forEach(a=>a.cancel());ecoAnimations=[];
  profileTip.hidden=true;
  ecosystem.classList.remove('eco-finished');
  if(reducedMotion.matches){ecosystem.classList.remove('eco-ready');infoButtons.forEach(b=>b.hidden=false);return;}
  ecosystem.classList.add('eco-ready');infoButtons.forEach(b=>b.hidden=true);
  const animate=async(el,frames,duration,delay=0)=>{
    if(run!==ecoRun)return;
    const a=el.animate(frames,{duration:duration*.75,delay:delay*.75,fill:'forwards',easing:'ease-in-out'});ecoAnimations.push(a);
    try{await a.finished;}catch{}
  };
  const fade=(selector,duration,stagger=0)=>Promise.all([...ecosystem.querySelectorAll(selector)].map((el,i)=>animate(el,[{opacity:0},{opacity:1}],duration,i*stagger)));
  await animate(ecosystem.querySelector('.eco-center'),[{opacity:0},{opacity:1}],850);
  if(run!==ecoRun)return;const centralInfo=infoButtons.find(b=>b.dataset.actor==='15');if(centralInfo)centralInfo.hidden=false;
  await Promise.all([...ecosystem.querySelectorAll('.eco-axis-reveal')].map((el,i)=>animate(el,[{strokeDashoffset:1},{strokeDashoffset:0}],1200,i*170).then(()=>animate(ecosystem.querySelectorAll('.eco-axis-dot')[i],[{opacity:0},{opacity:1}],200))));
  await fade('.eco-axis-label',500,100);await fade('.eco-areas',1100);
  const people=[...ecosystem.querySelectorAll('.eco-person')],labels=[...ecosystem.querySelectorAll('.eco-area-label')];
  const populate=(start,end)=>Promise.all(people.slice(start,end).map((el,i)=>animate(el,[{opacity:0},{opacity:1}],550,i*110).then(()=>{if(run===ecoRun){const info=infoButtons.find(b=>Number(b.dataset.actor)===start+i);if(info)info.hidden=false;}})));
  await populate(0,5);await animate(labels[2],[{opacity:0},{opacity:1}],600);
  await populate(5,15);await animate(labels[1],[{opacity:0},{opacity:1}],600);
  await fade('.eco-system',550,140);await animate(labels[0],[{opacity:0},{opacity:1}],600);
  await fade('.eco-complete',180);
  if(run===ecoRun)ecosystem.classList.add('eco-finished');
}
if(!reducedMotion.matches){ecosystem.classList.add('eco-ready');infoButtons.forEach(b=>b.hidden=true);}
function finishEcosystem(){ecoRun++;ecoAnimations.forEach(a=>a.cancel());ecoAnimations=[];ecosystem.classList.remove('eco-ready');infoButtons.forEach(b=>b.hidden=false);ecosystem.classList.add('eco-finished');}
const replayEcosystem=animateOnViewport(ecosystem,playEcosystem,finishEcosystem);
ecosystemFigure.querySelector('.ecosystem-replay').addEventListener('click',replayEcosystem);
function showProfileTip(button){
  const data=profileDescriptions.get(button.dataset.profile);
  profileTip.replaceChildren();const name=document.createElement('strong');name.textContent=data.name;profileTip.append(name,document.createTextNode(data.description));profileTip.hidden=false;
  const surface=button.closest('.fitted-diagram')||ecosystemWorkspace;
  if(profileTip.parentElement!==surface)surface.append(profileTip);
  const base=surface.getBoundingClientRect(),anchor=button.getBoundingClientRect();
  const left=Math.max(8,Math.min(base.width-profileTip.offsetWidth-8,anchor.left-base.left+anchor.width/2-profileTip.offsetWidth/2));
  let top=anchor.top-base.top-profileTip.offsetHeight-12;if(top<0)top=anchor.bottom-base.top+12;
  top=Math.max(8,Math.min(top,base.height-profileTip.offsetHeight-8));
  profileTip.style.left=left+'px';profileTip.style.top=top+'px';
}
function bindProfileInfo(button){
 button.addEventListener('pointerenter',()=>showProfileTip(button));button.addEventListener('focus',()=>showProfileTip(button));
 button.addEventListener('pointerleave',()=>profileTip.hidden=true);button.addEventListener('blur',()=>profileTip.hidden=true);
 button.addEventListener('click',()=>showProfileTip(button));
}
infoButtons.forEach(bindProfileInfo);
window.addEventListener('resize',()=>profileTip.hidden=true);
const profilesDrawer=document.getElementById('profiles-drawer');
const profilesOpen=ecosystemFigure.querySelector('.profiles-open');
function setProfilesOpen(open, restoreFocus=true){profileTip.hidden=true;setFigureDrawer(profilesDrawer,profilesOpen,open,restoreFocus);ecosystemFigure.querySelectorAll('.ecosystem-scroll,.fitted-diagram').forEach(surface=>surface.inert=open);}
document.addEventListener('click',event=>{
 if(event.target.closest('dialog[open]'))return;
 for(const [drawer,trigger,close] of [[painpointsDrawer,painpointsListButton,setPainpointsOpen],[profilesDrawer,profilesOpen,setProfilesOpen]]){
  if(trigger.getAttribute('aria-expanded')==='true'&&!drawer.contains(event.target)&&!trigger.contains(event.target))close(false,false);
 }
});
profilesOpen.addEventListener('click',()=>setProfilesOpen(profilesDrawer.hidden));
profilesDrawer.querySelector('.profiles-close').addEventListener('click',()=>setProfilesOpen(false));
ecosystemFigure.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!profileTip.hidden)profileTip.hidden=true;else if(!profilesDrawer.hidden)setProfilesOpen(false);}});
const fullProfileDialog=document.getElementById('full-profile-dialog');
let fullProfileTrigger,profileRequest=0;
const profileLinks=[...ecosystemFigure.querySelectorAll('.profile-full')];
const profileNavigation=document.createElement('nav');
profileNavigation.className='profile-navigation';profileNavigation.setAttribute('role','tablist');profileNavigation.setAttribute('aria-label','Profiles');
const profilePanel=fullProfileDialog.querySelector('.blueprint-dialog-content');
profilePanel.id='full-profile-panel';profilePanel.setAttribute('role','tabpanel');
profilePanel.before(profileNavigation);
const profileTabs=profileLinks.map(link=>{
 const tab=document.createElement('button');tab.type='button';tab.id='profile-tab-'+link.dataset.profile;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',profilePanel.id);tab.textContent=profileDescriptions.get(link.dataset.profile).name;profileNavigation.append(tab);
 return tab;
});
async function viewProfile(index,open=false,focusTab=false){
 const request=++profileRequest,link=profileLinks[index],key=link.dataset.profile;
 const title=key==='sales'?'Sales Manager':profileDescriptions.get(key).name;
 const nextImage=new Image();nextImage.src=link.dataset.src;
 try{await nextImage.decode();}catch{return;}
 if(request!==profileRequest)return;
 fullProfileDialog.querySelector('#full-profile-title').textContent=title;
 const image=fullProfileDialog.querySelector('.profile-full-image');image.src=nextImage.src;image.alt=title+' full profile';
 fullProfileDialog.querySelector('.profile-original').href=link.href;
 profileTabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
 profilePanel.setAttribute('aria-labelledby',profileTabs[index].id);
 if(open&&!fullProfileDialog.open)fullProfileDialog.showModal();
 if(focusTab)profileTabs[index].focus();
}
profileLinks.forEach((link,index)=>link.addEventListener('click',event=>{
 if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();fullProfileTrigger=link;viewProfile(index,true);
}));
profileTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>viewProfile(index,false,true));
 tab.addEventListener('keydown',event=>{
  const next=event.key==='ArrowRight'?(index+1)%3:event.key==='ArrowLeft'?(index+2)%3:event.key==='Home'?0:event.key==='End'?2:null;
  if(next===null)return;event.preventDefault();viewProfile(next,false,true);
 });
});
fullProfileDialog.querySelector('.profile-dialog-close').addEventListener('click',()=>fullProfileDialog.close());
fullProfileDialog.addEventListener('close',()=>fullProfileTrigger?.focus({preventScroll:true}));
fullProfileDialog.addEventListener('click',e=>{if(e.target!==fullProfileDialog)return;const r=fullProfileDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)fullProfileDialog.close();});

// Solved painpoints: source-backed notes attached to their actual process steps.
document.querySelectorAll('.blueprint-recreated').forEach(figure=>{
 const dots=[...figure.querySelectorAll('.bp-solved')];if(!dots.length)return;
 const workspace=figure.querySelector('.figure-workspace'),canvas=figure.querySelector('.bp-canvas'),tip=figure.querySelector('.bp-solution-tooltip'),scroll=figure.querySelector('.bp-scroll');
 let active=null;
 tip.id=figure.id+'-solution-tip';
 const close=()=>{dots.forEach(dot=>dot.setAttribute('aria-expanded','false'));active=null;tip.hidden=true;};
 const position=()=>{
  if(!active)return;
  const base=workspace.getBoundingClientRect(),box=active.getBoundingClientRect(),viewport=scroll.getBoundingClientRect();
  if(box.right<viewport.left+112||box.left>viewport.right){close();return;}
  const left=Math.max(8,Math.min(box.left-base.left,base.width-tip.offsetWidth-8));
  const top=box.bottom-base.top+10;
  tip.style.setProperty('--tip-left',left+'px');
  tip.style.setProperty('--tip-top',Math.max(8,top+tip.offsetHeight>base.height?box.top-base.top-tip.offsetHeight-10:top)+'px');
 };
 const show=dot=>{active=dot;dots.forEach(d=>d.setAttribute('aria-expanded',String(d===dot)));tip.textContent=dot.dataset.explanation;tip.hidden=false;position();};
 dots.forEach(dot=>{
  dot.style.left=(+dot.dataset.x/+canvas.dataset.width*100)+'%';dot.style.top=(+dot.dataset.y/+canvas.dataset.height*100)+'%';
  dot.setAttribute('aria-describedby',tip.id);
  dot.addEventListener('pointerenter',()=>show(dot));dot.addEventListener('pointerleave',()=>{if(document.activeElement!==dot)close();});
  dot.addEventListener('focus',()=>show(dot));dot.addEventListener('blur',close);
  dot.addEventListener('click',()=>show(dot));dot.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
 });
 scroll.addEventListener('scroll',position);window.addEventListener('resize',position);
 figure.querySelector('.bp-replay').addEventListener('click',close);
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.bp-solved'))close();});
});

// Show all: a complete still image, independent of scroll and animation state.
const diagramImageDialog=document.createElement('dialog');
diagramImageDialog.className='diagram-image-dialog';
diagramImageDialog.setAttribute('aria-labelledby','diagram-image-title');
diagramImageDialog.innerHTML='<header class="diagram-image-header"><h3 class="figure-title" id="diagram-image-title"></h3><button class="bp-replay diagram-image-close" type="button">Close</button></header><img class="diagram-full-image" alt="">';
document.body.append(diagramImageDialog);
let imageTrigger=null,imageURL=null;
const closeDiagramImage=()=>diagramImageDialog.close();
diagramImageDialog.querySelector('button').addEventListener('click',closeDiagramImage);
diagramImageDialog.addEventListener('click',e=>{if(e.target!==diagramImageDialog)return;const r=diagramImageDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDiagramImage();});
diagramImageDialog.addEventListener('close',()=>{if(imageURL){URL.revokeObjectURL(imageURL);imageURL=null;}const target=imageTrigger?.hidden?imageTrigger.closest('details')?.querySelector('summary'):imageTrigger;target?.focus();});
const imageData=async url=>{const response=await fetch(url);if(!response.ok)throw new Error('Unable to load diagram artwork');const blob=await response.blob();return new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob);});};
function figureTitle(caption){return caption?.querySelector('.figure-title')?.textContent.trim()||(caption?.firstChild?.nodeType===3?caption.firstChild.textContent.trim():[...(caption?.firstElementChild?.childNodes||[])].filter(node=>node.nodeType===3).map(node=>node.textContent).join(' ').trim());}
async function diagramStill(figure,svg,original){
 if(svg&&completeChartArtwork.has(svg))original=completeChartArtwork.get(svg);
 if(figure.classList.contains('ecosystem-figure'))return 'assets/bigoil/4f2e0.png';
 if(!svg)return figure.querySelector('img')?.src||figure.querySelector('.workshop-viewport a').href;
 const copy=original.cloneNode(true),sourceElements=[svg,...svg.querySelectorAll('*')],copyElements=[copy,...copy.querySelectorAll('*')];
 const properties=['font-family','font-size','font-weight','fill','stroke','stroke-width','text-anchor','paint-order','stroke-linejoin','stroke-linecap'];
 copyElements.forEach((el,i)=>{const source=sourceElements[i];if(!source)return;const style=getComputedStyle(source);properties.forEach(p=>el.style.setProperty(p,style.getPropertyValue(p)));el.style.opacity='1';el.style.animation='none';el.style.transition='none';});
 copy.querySelectorAll('.bp-connector').forEach(el=>{el.style.strokeDasharray='none';el.style.strokeDashoffset='0';el.setAttribute('data-line-complete','');});
 const rail=figure.querySelector('.bp-frozen-actors');if(rail)rail.querySelectorAll('.bp-actor').forEach(actor=>{const clone=actor.cloneNode(true);const originals=[actor,...actor.querySelectorAll('*')];[clone,...clone.querySelectorAll('*')].forEach((el,i)=>{const st=getComputedStyle(originals[i]);properties.forEach(p=>el.style.setProperty(p,st.getPropertyValue(p)));el.style.opacity='1';el.style.transform='none';});copy.append(clone);});
 figure.querySelectorAll('.bp-pain').forEach(dot=>{const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');const x=dot.dataset.x||parseFloat(dot.style.left)/100*svg.viewBox.baseVal.width,y=dot.dataset.y||parseFloat(dot.style.top)/100*svg.viewBox.baseVal.height;circle.setAttribute('cx',x);circle.setAttribute('cy',y);circle.setAttribute('r','12');circle.setAttribute('fill',dot.classList.contains('bp-solved')?'#278454':'#e86470');circle.setAttribute('stroke','#fff');circle.setAttribute('stroke-width','2');copy.append(circle);if(!dot.classList.contains('bp-solved')){const text=document.createElementNS('http://www.w3.org/2000/svg','text');text.setAttribute('x',x);text.setAttribute('y',+y+5);text.setAttribute('text-anchor','middle');text.setAttribute('fill','#fff');text.setAttribute('font-size','14');text.textContent=dot.firstChild.textContent;copy.append(text);}});
 await Promise.all([...copy.querySelectorAll('image')].map(async img=>{const href=img.getAttribute('href');if(href&&!href.startsWith('data:')&&!href.startsWith('#'))img.setAttribute('href',await imageData(new URL(href,location.href)));}));
 copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.setAttribute('width',svg.viewBox.baseVal.width);copy.setAttribute('height',svg.viewBox.baseVal.height);copy.style.background='#fff';
 const legend=figure.querySelector('.chart-legend');
 if(legend){const ns='http://www.w3.org/2000/svg';const entries=[...legend.children];entries.forEach((entry,i)=>{const y=svg.viewBox.baseVal.height+24+i*27;const swatch=document.createElementNS(ns,'rect');swatch.setAttribute('x','46');swatch.setAttribute('y',y-12);swatch.setAttribute('width','10');swatch.setAttribute('height','10');swatch.setAttribute('rx','2');swatch.setAttribute('fill',getComputedStyle(entry.querySelector('i')).backgroundColor);copy.append(swatch);const label=document.createElementNS(ns,'text');label.setAttribute('x','65');label.setAttribute('y',y);label.setAttribute('font-family','Arial,sans-serif');label.setAttribute('font-size','14');label.setAttribute('fill','#263840');label.textContent=entry.textContent.trim();copy.append(label);});const height=svg.viewBox.baseVal.height+entries.length*27+30;copy.setAttribute('viewBox',`0 0 ${svg.viewBox.baseVal.width} ${height}`);copy.setAttribute('height',height);}

 return URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'}));
}
document.querySelectorAll('.figure-panel,.chart-panel,.blueprint-recreated,.workshop-results').forEach(figure=>{
 const svg=figure.querySelector('.blueprint-svg,.ecosystem-diagram,.sales-chart'),img=figure.querySelector('.workshop-viewport img,.workshop-viewport image,.figure-panorama-scroll img');if(!svg&&!img)return;
 const caption=figure.querySelector('figcaption,.figure-caption');if(!caption)return;
 const original=svg?.cloneNode(true);
 // Actors were moved into the frozen rail before this snapshot; add them only at export.
 const title=figureTitle(caption);
 let actions=caption.querySelector('.bp-actions');if(!actions){const text=document.createElement('div');while(caption.firstChild)text.append(caption.firstChild);caption.append(text);actions=document.createElement('div');actions.className='bp-actions';caption.append(actions);caption.classList.add('diagram-caption');}
 const button=document.createElement('button');button.type='button';button.className='bp-replay diagram-show-all';button.textContent='Show all';button.setAttribute('aria-haspopup','dialog');button.hidden=true;actions.insertBefore(button,actions.querySelector('.figure-button-primary,.bp-list-open'));
 // Offer the full view only when part of the visual is clipped or scrollable.
 const visual=svg||img?.closest('svg')||img;
 function updateFullViewControl(){
  if(figure.classList.contains('has-fitted-diagram')&&matchMedia('(max-width:1100px)').matches){button.hidden=true;actions.hidden=false;return;}
  if(!visual.getClientRects().length)return;
  if(getComputedStyle(visual).visibility==='hidden'){button.hidden=true;actions.hidden=[...actions.children].every(control=>control.hidden);return;}
  const visualBox=visual.getBoundingClientRect();
  let clipped=false,ancestor=visual.parentElement;
  while(ancestor&&ancestor!==figure){
   const style=getComputedStyle(ancestor),box=ancestor.getBoundingClientRect();
   const clipsX=/^(auto|scroll|hidden|clip)$/.test(style.overflowX);
   const clipsY=/^(auto|scroll|hidden|clip)$/.test(style.overflowY);
   if(clipsX&&(ancestor.scrollWidth>ancestor.clientWidth+1||visualBox.left<box.left-1||visualBox.right>box.right+1))clipped=true;
   if(clipsY&&(ancestor.scrollHeight>ancestor.clientHeight+1||visualBox.top<box.top-1||visualBox.bottom>box.bottom+1))clipped=true;
   ancestor=ancestor.parentElement;
  }
  button.hidden=!clipped;
  actions.hidden=[...actions.children].every(control=>control.hidden);
 }
 let layoutFrame;
 const scheduleFullViewControl=()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(updateFullViewControl);};
 const fitObserver=new ResizeObserver(scheduleFullViewControl);
 fitObserver.observe(figure);fitObserver.observe(visual);
 figure.querySelectorAll('.chart-viewport,.bp-scroll,.ecosystem-scroll,.ecosystem-workspace,.workshop-viewport,.figure-panorama-scroll').forEach(el=>fitObserver.observe(el));
 window.addEventListener('resize',scheduleFullViewControl);
 figure.closest('details')?.addEventListener('toggle',scheduleFullViewControl);
 img?.addEventListener('load',scheduleFullViewControl);
 scheduleFullViewControl();
 button.addEventListener('click',async()=>{
  button.disabled=true;
  try{const url=await diagramStill(figure,svg,original);imageTrigger=button;imageURL=url.startsWith('blob:')?url:null;diagramImageDialog.querySelector('h3').textContent=title;const image=diagramImageDialog.querySelector('img');image.alt=title;image.src=url;await image.decode();diagramImageDialog.showModal();}
  finally{button.disabled=false;}
 });
});

// Shared picture controls: compact icons retain their original accessible names.
document.querySelectorAll('.bp-actions button').forEach(button=>{
 const label=button.textContent.trim();
 const paths=button.matches('.diagram-show-all')
  ? '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>'
  : button.matches('.bp-list-open,.blueprint-open,.profiles-open')
  ? '<path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1"/>'
  : '<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>';
 button.classList.add('figure-icon-button');button.setAttribute('aria-label',label);button.title=label;
 button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths+'</svg>';
});

// References to figures open the shared full-view popup without navigating away.
document.querySelectorAll('a[href^="#"]').forEach(link=>{
 const target=document.getElementById(link.getAttribute('href').slice(1));
 if(!target?.matches('figure'))return;
 link.setAttribute('aria-haspopup','dialog');
 link.addEventListener('click',async event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  const svg=target.querySelector('.sales-chart,.blueprint-svg,.ecosystem-diagram')||target.querySelector(':scope > svg,.workshop-viewport svg');
  const url=await diagramStill(target,svg,svg?.cloneNode(true));
  imageTrigger=link;imageURL=url.startsWith('blob:')?url:null;
  const caption=target.querySelector('figcaption,.figure-caption');
  diagramImageDialog.querySelector('h3').textContent=figureTitle(caption)||link.textContent;
  const img=diagramImageDialog.querySelector('img');img.alt=diagramImageDialog.querySelector('h3').textContent;img.src=url;await img.decode();
  diagramImageDialog.showModal();
 });
});

// Static maps slide with touch, a trackpad, the scrollbar, keyboard or mouse drag.
document.querySelectorAll('.figure-panorama-scroll').forEach(viewport=>{
 let pointer=null,startX=0,startScroll=0;
 const finish=()=>{pointer=null;viewport.classList.remove('is-dragging');};
 viewport.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.button!==0)return;pointer=event.pointerId;startX=event.clientX;startScroll=viewport.scrollLeft;viewport.setPointerCapture(pointer);viewport.classList.add('is-dragging');event.preventDefault();viewport.focus({preventScroll:true});});
 viewport.addEventListener('pointermove',event=>{if(event.pointerId===pointer){viewport.scrollLeft=startScroll+startX-event.clientX;}});
 viewport.addEventListener('pointerup',finish);viewport.addEventListener('pointercancel',finish);viewport.addEventListener('lostpointercapture',finish);
});

// Case-study video story: open in a dialog, pause when closed.
(() => {
 const dialog=document.getElementById('case-video-dialog');
 const opener=document.querySelector('.video-open');
 if(!dialog||!opener)return;
 const video=dialog.querySelector('video');
 opener.addEventListener('click',()=>{dialog.showModal();video.play().catch(()=>{});});
 const stop=()=>{video.pause();};
 dialog.querySelector('.video-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',stop);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();
