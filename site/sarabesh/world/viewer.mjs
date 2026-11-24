import {periodForHour, assetState} from './time.mjs';
import {WorldLife} from './life.mjs?v=life-16';

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const storageKey = 'sarabesh-poc-v1';
const legacyStorageKey = 'zan-ha-adim-poc-v1';
const modes = ['auto', 'morning', 'day', 'evening', 'night'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let viewTimer, travelMotion;
let worldLife;
let saved = {};
try { saved = params.get('reset') === '1' ? {} : JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey) || '{}'); } catch {}
let mode = modes.includes(params.get('period')) ? params.get('period') : modes.includes(saved.mode) ? saved.mode : 'auto';
const lights = saved.lights && typeof saved.lights === 'object' ? saved.lights : {};
const visited = new Set(Array.isArray(saved.visited) ? saved.visited : []);
const described = new Set(Array.isArray(saved.described) ? saved.described : []);
let placeReturnFocus = null, journalSource = 'arrival', arrivalTimer;
let geography, manifest, viewer, sceneConfigs, current, period, entered = params.get('entered') === '1', ready = false;
const camera = {
  'rocket-exit': {yaw: 60, pitch: 0, hfov:110}, landing: {yaw: -45, pitch: 0}, town: {yaw: 45, pitch: 0},
  foyer: {yaw: 0, pitch: 0}, kitchen: {yaw: -70, pitch: 0}, apartment: {yaw: 85, pitch: 0},
  window: {yaw: -35, pitch: 0}, bar: {yaw: -65, pitch: 0}, grocery: {yaw: 0, pitch: 0}, hotel: {yaw: 0, pitch: 0},
};
const hotspots = {
  'rocket-exit': [{to: 'landing', yaw: 108.51, pitch: -3.52}],
  landing: [{to: 'rocket-exit', yaw: 136.08, pitch: 10.32}, {to: 'town', yaw: -34.49, pitch: -2.16}],
  town: [{to: 'landing', yaw: -29.94, pitch: -16.06}, {to: 'foyer', yaw: -104.44, pitch: -6.6}, {to: 'bar', yaw: -167.36, pitch: -4.57}, {to: 'grocery', yaw: -158.4, pitch: 0.13}, {to: 'hotel', yaw: 40.06, pitch: -8.6}],
  foyer: [{to: 'town', yaw: 90.14, pitch: 4.46}, {to: 'apartment', yaw: 26.51, pitch: 17.92}, {to: 'kitchen', yaw: -61.73, pitch: 8.43}],
  kitchen: [{to: 'foyer', yaw: -162.06, pitch: -8.66}],
  apartment: [{to: 'foyer', yaw: -146.02, pitch: -3.97}, {to: 'window', yaw: 90.06, pitch: -0.43}],
  window: [{to: 'apartment', yaw: 131.32, pitch: -8.68}],
  bar: [{to: 'town', yaw: 18.82, pitch: -3.44}], grocery: [{to: 'town', yaw: 131.09, pitch: -9.4}], hotel: [{to: 'town', yaw: -109.31, pitch: 0.04}],
};

function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify({mode, lights, visited: [...visited], described: [...described]})); } catch {}
}
function chosenPeriod() { return mode === 'auto' ? periodForHour(new Date().getHours()) : mode; }
function imageSource(asset, thumbnail = false) {
  const url = thumbnail ? asset.previewUrl || asset.url : asset.url;
  return asset.revision ? url + '?v=' + asset.revision : url;
}
function sceneInfo(id) { return geography.scenes.find((scene) => scene.id === id); }
function lightOn(id) { const source = manifest.scenes[id].linkedLightScene || id; return typeof lights[source] === 'boolean' ? lights[source] : true; }
function sceneKey(id) { return id + '--' + assetState(manifest.scenes[id], period, lightOn(id)); }
function viewHfov(id) {
  const standard = camera[id].hfov || 95;
  const {clientWidth: width, clientHeight: height} = $('#panorama');
  if (!width || !height || width > 760 || width >= height) return standard;
  // Limit vertical field of view to 78 degrees on narrow portrait screens.
  return Math.min(standard, 2 * Math.atan(width / height * Math.tan(39 * Math.PI / 180)) * 180 / Math.PI);
}
function syncViewHfov() {
  const hfov = viewHfov(current);
  viewer.setHfovBounds([hfov, hfov]);
  viewer.setHfov(hfov, false);
}
function showStatus(text) { $('#status').textContent = text; $('#status').hidden = !text; }

function finishArrival() {
  clearTimeout(arrivalTimer);
  $('#intro').classList.remove('arrival-playing');
  $('#intro').dataset.phase = 'ready';
  $('#welcome-card').inert = false;
  $('#skip-intro').hidden = true;
  $('#landing-caption').hidden = true;
}
function playArrival() {
  if (entered) return;
  if (reducedMotion.matches) { finishArrival(); return; }
  const rocket = $('#arrival-rocket');
  const start = () => {
    if ($('#intro').dataset.phase === 'ready') return;
    clearTimeout(arrivalTimer);
    $('#intro').classList.add('arrival-playing');
    // Let the rocket rest for 1.4 seconds after the 4.8-second landing.
    arrivalTimer = setTimeout(finishArrival, 6200);
  };
  if (rocket.complete) start();
  else { rocket.addEventListener('load', start, {once:true}); rocket.addEventListener('error', finishArrival, {once:true}); arrivalTimer=setTimeout(finishArrival,6500); }
}
function openPlace(id, {fromMap = false, firstVisit = false} = {}) {
  const scene = sceneInfo(id);
  if (!scene || !visited.has(id) || $('#place-dialog').open) return;
  placeReturnFocus = document.activeElement;
  journalSource = fromMap ? 'map' : 'arrival';
  const asset = manifest.scenes[id].states[assetState(manifest.scenes[id],period,lightOn(id))];
  $('#place-image').src = imageSource(asset,true);
  $('#place-image').style.objectPosition = (50 + camera[id].yaw / 3.6) + '% 50%';
  $('#place-title').textContent = scene.name;
  $('#place-description').textContent = scene.visitorDescription;
  $('#place-kicker').textContent = firstVisit ? 'A new page in your journey' : 'From your traveller’s journal';
  $('#place-continue').textContent = fromMap ? 'Back to the map' : 'Continue exploring';
  $('#place-dialog').dataset.place = id;
  $('#place-dialog').showModal();
  described.add(id); persist();
}
function discoverCurrent() {
  if (!entered) return;
  visited.add(current); persist();
  if (!described.has(current) && !$('#map-dialog').open && !$('#help-dialog').open) openPlace(current,{firstVisit:true});
}
function closePlace() {
  $('#place-dialog').close();
  if (placeReturnFocus?.isConnected && placeReturnFocus.getClientRects().length && (journalSource === 'map' || placeReturnFocus !== document.body)) placeReturnFocus.focus({preventScroll:true});
  else $('#map-toggle').focus({preventScroll:true});
}
function syncFullscreen() {
  const active = !!document.fullscreenElement;
  $('#fullscreen-toggle').setAttribute('aria-label',active ? 'Exit fullscreen' : 'Enter fullscreen');
  $('#fullscreen-toggle').title = active ? 'Exit fullscreen' : 'Fullscreen';
}
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { showStatus('Fullscreen is unavailable in this browser. You can still explore here.'); }
  syncFullscreen();
}

function syncControls() {
  const indoor = manifest.scenes[current].indoor;
  $('#light-toggle').hidden = !indoor;
  $('#light-toggle').setAttribute('aria-pressed', String(lightOn(current)));
  $('#light-toggle').setAttribute('aria-label', 'Switch indoor light ' + (lightOn(current) ? 'off' : 'on'));
  $('#light-toggle').title = 'Indoor light: ' + (lightOn(current) ? 'on' : 'off');
  $('#time-dial').title = mode === 'auto' ? 'Time: Auto (' + period + ')' : 'Time: ' + period;
  $('#time-label').textContent = mode === 'auto' ? 'Auto' : mode[0].toUpperCase() + mode.slice(1);
  document.documentElement.style.setProperty('--dial-angle', ({auto:-136, morning:-66, day:0, evening:66, night:138}[mode]) + 'deg');
  document.querySelectorAll('[name=time-mode]').forEach((input) => { input.checked = input.value === mode; });
  document.body.dataset.scene = current;
  document.body.dataset.period = period;
  document.body.dataset.light = indoor ? (lightOn(current) ? 'on' : 'off') : 'outside';
  document.body.dataset.assetState = assetState(manifest.scenes[current], period, lightOn(current));
  worldLife?.setScene(current,period,lightOn(current));
}

function failedView() {
  travelMotion?.cancel();travelMotion=null;
  clearTimeout(viewTimer);ready=false;document.body.dataset.ready='false';
  document.body.classList.remove('travelling');document.body.dataset.travelPhase='error';
  showStatus('This view could not load.');$('#retry-view').hidden=false;
}
function watchView() {
  clearTimeout(viewTimer);$('#retry-view').hidden=true;
  viewTimer=setTimeout(()=>{if(!ready)failedView();},15000);
}
function retryView() {
  const url=new URL(location.href);url.searchParams.set('scene',current);
  url.searchParams.set('period',mode);url.searchParams.set('light',lightOn(current)?'on':'off');
  if(entered)url.searchParams.set('entered','1');url.searchParams.set('revision','zoom-locked-16');
  url.searchParams.set('reload',String(Date.now()));location.replace(url.href);
}
function blockUserZoom() {
  document.addEventListener('wheel',event=>{if(event.ctrlKey)event.preventDefault();},{passive:false,capture:true});
  for(const type of ['gesturestart','gesturechange','gestureend'])document.addEventListener(type,event=>event.preventDefault(),{passive:false,capture:true});
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&['+','=','-','0'].includes(event.key))event.preventDefault();},{capture:true});
}

function loadCurrent({keepView = false, from, moving = false} = {}) {
  const key = sceneKey(current);
  const state = assetState(manifest.scenes[current], period, lightOn(current));
  if (!manifest.scenes[current].states[state]) {
    showStatus('This lighting state is still being prepared.');
    return;
  }
  ready = false;
  document.body.dataset.ready = 'false';
  showStatus('');watchView();
  let {yaw, pitch} = camera[current];
  if (keepView) { yaw = viewer.getYaw(); pitch = viewer.getPitch(); }
  else if (from && hotspots[current].some((spot) => spot.to === from)) {
    yaw = (hotspots[current].find((spot) => spot.to === from).yaw + 360) % 360 - 180;
  }
  syncControls();
  const fade = reducedMotion.matches ? 0 : moving ? 440 : 180;
  viewer.getConfig().sceneFadeDuration = fade;
  const hfov = viewHfov(current);
  viewer.addScene(key, {...sceneConfigs[key], hfov, minHfov: hfov, maxHfov: hfov, sceneFadeDuration: fade});
  viewer.loadScene(key,pitch,yaw,hfov);
}

function beginTravel(to, {fromMap = false} = {}) {
  if (!entered || !ready || to === current) {
    if (fromMap && to === current) $('#map-dialog').close();
    return;
  }
  const nextPeriod = chosenPeriod();
  if (!manifest.scenes[to].states[assetState(manifest.scenes[to], nextPeriod, lightOn(to))]) return;
  const from = current;
  const spot = hotspots[from].find((point) => point.to === to);
  ready = false;
  document.body.dataset.ready = 'false';
  document.body.classList.add('travelling');
  document.body.dataset.travelPhase = 'departing';
  if (fromMap) $('#map-dialog').close();
  function depart() {
    current = to; period = nextPeriod;
    document.body.dataset.travelPhase = 'arriving';
    loadCurrent({from, moving: true});
  }
  if (reducedMotion.matches) { depart(); return; }
  // Move the composited world, including residents, without unlocking panorama zoom.
  travelMotion?.cancel();
  travelMotion=$('#panorama').animate([
    {transform:'scale(1)',filter:'blur(0px)'},
    {transform:'scale(1.09)',filter:'blur(1.2px)'}
  ],{duration:340,easing:'cubic-bezier(.45,0,.75,.45)',fill:'forwards'});
  viewer.lookAt(spot && !fromMap ? spot.pitch : viewer.getPitch(), spot && !fromMap ? spot.yaw : viewer.getYaw(), undefined, 340);
  travelMotion.finished.then(depart,depart);
}

function travel(to) {
  if (hotspots[current].some((spot) => spot.to === to)) beginTravel(to);
}
function mapTravel(to) { beginTravel(to, {fromMap: true}); }

function renderMap() {
  const ns = 'http://www.w3.org/2000/svg', svg = $('#world-map');
  svg.replaceChildren();
  const positions = {'rocket-exit':[105,90],landing:[280,90],town:[460,210],foyer:[665,210],kitchen:[820,85],apartment:[810,340],window:[970,340],bar:[280,345],grocery:[480,355],hotel:[530,75]};
  const names = {'rocket-exit':'Rocket',landing:'Landing',town:'Sarabesh City Plaza',foyer:'Cogswash foyer',kitchen:'Kitchen',apartment:'Living quarters',window:'Valley window',bar:'Caravanserai',grocery:'Mechaniker',hotel:'Motel-404'};
  function element(tag, attributes, text, parent = svg) {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, value);
    if (text) el.textContent = text;
    parent.append(el); return el;
  }
  const defs = element('defs', {});
  for (const edge of geography.connections) {
    const [x1,y1] = positions[edge.from], [x2,y2] = positions[edge.to];
    const dx=x2-x1,dy=y2-y1, bend=Math.abs(dy)>80 ? 35 : -40;
    const d=`M${x1} ${y1} C${x1+dx*.4-bend} ${y1+dy*.15+bend},${x2-dx*.4-bend} ${y2-dy*.15+bend},${x2} ${y2}`;
    const walked=visited.has(edge.from)&&visited.has(edge.to);
    element('path',{d,class:'chart-route'+(walked?' walked':'')});
  }
  for (const scene of geography.scenes) {
    const [x,y] = positions[scene.id], here=scene.id===current, seen=visited.has(scene.id);
    const clip=element('clipPath',{id:'chart-'+scene.id},null,defs);
    element('circle',{cx:x,cy:y,r:31},null,clip);
    const group=element('g',{class:'chart-place'+(here?' here':'')+(seen?' visited':' undiscovered')});
    element('title',{},scene.name,group);
    element('circle',{cx:x,cy:y,r:39,class:'chart-halo'},null,group);
    const key=assetState(manifest.scenes[scene.id],period,lightOn(scene.id));
    const asset=manifest.scenes[scene.id].states[key];
    const url=imageSource(asset,true);
    const yaw=camera[scene.id].yaw;
    element('image',{href:url,x:x-216*(.5+yaw/360),y:y-54,width:216,height:108,'clip-path':'url(#chart-'+scene.id+')',class:'chart-view'},null,group);
    element('image',{href:'assets/ui/dwellers-bezel.png',x:x-40,y:y-43,width:80,height:86,class:'chart-porthole'},null,group);
    // The source bezel includes its recessed green face. A view above it exposes the window cleanly.
    element('image',{href:url,x:x-216*(.5+yaw/360),y:y-54,width:216,height:108,'clip-path':'url(#chart-'+scene.id+')',class:'chart-view'},null,group);
    if(!seen) element('circle',{cx:x,cy:y,r:31,class:'chart-unseen-shade'},null,group);
    element('circle',{cx:x,cy:y,r:31,class:'chart-glass'},null,group);
    element('text',{x,y:y+64,class:'chart-name'},names[scene.id],group);
    if(here) { element('path',{d:`M${x-5} ${y-52}l5 7 5-7Z`,class:'chart-location'},null,group); }
    else if(seen) { element('path',{d:`M${x+24} ${y+29}l4 4 7-9`,class:'chart-visited'},null,group); }
    const hit=element('rect',{x:x-65,y:y-45,width:130,height:116,rx:30,fill:'transparent',class:'chart-hit',role:'button',tabindex:'0','aria-label':'Travel to '+scene.name+(here?', current location':seen?', visited':', not yet visited')},null,group);
    hit.addEventListener('click',()=>mapTravel(scene.id));
    hit.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();mapTravel(scene.id);}});
    if (seen) {
      const info=element('g',{class:'chart-info',role:'button',tabindex:'0','aria-label':'Read about '+scene.name},null,group);
      element('circle',{cx:x+40,cy:y+33,r:24,fill:'transparent',stroke:'none'},null,info);
      element('image',{href:'assets/ui/dwellers-bezel.png',x:x+22,y:y+14,width:36,height:39},null,info);
      element('text',{x:x+40,y:y+41,class:'chart-info-letter','aria-hidden':'true'},'i',info);
      info.addEventListener('click',event=>{event.stopPropagation();openPlace(scene.id,{fromMap:true});});
      info.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();openPlace(scene.id,{fromMap:true});}});
    }
  }
  $('#map-current').textContent = sceneInfo(current).name;
}

async function initialize() {
  const responses = await Promise.all(['world/geography.json?v=sarabesh-life-17','world/assets.json?v=sarabesh-life-17'].map((url) => fetch(url)));
  if (responses.some((response) => !response.ok)) throw Error('World data failed to load');
  [geography, manifest] = await Promise.all(responses.map((response) => response.json()));
  current = sceneInfo(params.get('scene')) ? params.get('scene') : geography.startScene;
  if (params.get('light') === 'off') lights[manifest.scenes[current].linkedLightScene || current] = false;
  if (params.get('light') === 'on') lights[manifest.scenes[current].linkedLightScene || current] = true;
  period = chosenPeriod();
  const configs = {};
  for (const scene of geography.scenes) {
    const hfov = viewHfov(scene.id);
    for (const [state, asset] of Object.entries(manifest.scenes[scene.id].states)) {
      configs[scene.id+'--'+state] = {
        type:'equirectangular', panorama:imageSource(asset), haov:360, vaov:180, touchZoom:false, doubleClickZoom:false,
        ...camera[scene.id], hfov, minHfov:hfov, maxHfov:hfov,
        hotSpots:hotspots[scene.id].map((spot) => ({
          yaw:spot.yaw, pitch:spot.pitch, cssClass:'travel-dot',
          clickHandlerFunc:() => travel(spot.to),
          createTooltipFunc:(element) => {
            element.tabIndex=0; element.setAttribute('role','button');
            element.setAttribute('aria-label','Go to '+sceneInfo(spot.to).name);
            const text=document.createElement('span'); text.className='travel-tip';
            text.textContent=sceneInfo(spot.to).name; text.setAttribute('aria-hidden','true'); element.append(text);
            function positionTip() {
              element.style.setProperty('--tip-shift','0px'); element.classList.remove('tip-below');
              const frame=$('#panorama').getBoundingClientRect(), bounds=text.getBoundingClientRect();
              if(bounds.top < frame.top+12) element.classList.add('tip-below');
              const shift=Math.max(frame.left+12-bounds.left,Math.min(0,frame.right-12-bounds.right));
              element.style.setProperty('--tip-shift',shift+'px');
            }
            element.addEventListener('mouseenter',positionTip);
            element.addEventListener('focus',()=>requestAnimationFrame(positionTip));
            element.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();travel(spot.to);}});
          },
        })),
      };
    }
  }
  const first = sceneKey(current);
  if (!configs[first]) throw Error('The requested lighting state is still being prepared');
  sceneConfigs = configs;
  watchView();blockUserZoom();
  viewer = pannellum.viewer('panorama', {
    default:{firstScene:first, autoLoad:true, showControls:false, showFullscreenCtrl:false, showZoomCtrl:false, mouseZoom:false, touchZoom:false, doubleClickZoom:false, keyboardZoom:false, sceneFadeDuration:0, autoRotate:false, compass:false, friction:.12},
    scenes:configs,
  });
  worldLife = new WorldLife({viewer});
  viewer.on('load',()=>{
    syncViewHfov();
    showStatus('');
    $('#enter-world').disabled=false;
    $('#enter-world span').textContent='Start exploring';
    const finish = () => {
      ready=true; document.body.dataset.ready='true';
      document.body.classList.remove('travelling');
      document.body.dataset.travelPhase='idle';
      discoverCurrent();
    };
    clearTimeout(viewTimer);$('#retry-view').hidden=true;
    if(document.body.classList.contains('travelling')&&!reducedMotion.matches){
      travelMotion?.cancel();
      const arrival=$('#panorama').animate([
        {transform:'scale(1.09)',filter:'blur(1.2px)'},
        {transform:'scale(1)',filter:'blur(0px)'}
      ],{duration:460,easing:'cubic-bezier(.16,.8,.3,1)',fill:'forwards'});
      travelMotion=arrival;
      arrival.finished.then(()=>{arrival.cancel();travelMotion=null;finish();});
    }else{travelMotion?.cancel();travelMotion=null;finish();}
    if (params.has('pitch')) viewer.setPitch(Number(params.get('pitch')),false);
    if (params.has('yaw')) viewer.setYaw(Number(params.get('yaw')),false);
  });
  viewer.on('error',failedView);
  $('#retry-view').addEventListener('click',retryView);
  viewer.on('scenechange',()=>{document.body.dataset.ready='false';});
  window.addEventListener('resize', () => { if (ready) syncViewHfov(); });
  $('#light-toggle').addEventListener('click',()=>{if(!ready)return;lights[current]=!lightOn(current);persist();loadCurrent({keepView:true});});
  $('#map-toggle').addEventListener('click',()=>{ if(!ready)return; renderMap();$('#map-dialog').showModal();});
  $('#map-close').addEventListener('click',()=>$('#map-dialog').close());
  $('#map-dialog').addEventListener('click',(event)=>{if(event.target===$('#map-dialog'))$('#map-dialog').close();});
  document.querySelectorAll('[name=time-mode]').forEach((input)=>input.addEventListener('change',()=>{
    if(!ready)return;mode=input.value;period=chosenPeriod();persist();loadCurrent({keepView:true});
  }));
  $('#enter-world').addEventListener('click',()=>{if(!ready)return;entered=true;finishArrival();document.body.classList.add('entered');$('#intro').hidden=true;discoverCurrent();});
  $('#skip-intro').addEventListener('click',()=>{finishArrival();$('#enter-world').focus({preventScroll:true});});
  $('#place-close').addEventListener('click',closePlace);
  $('#place-continue').addEventListener('click',closePlace);
  $('#place-dialog').addEventListener('click',event=>{if(event.target===$('#place-dialog'))closePlace();});
  $('#help-toggle').addEventListener('click',()=>$('#help-dialog').showModal());
  $('#help-close').addEventListener('click',()=>$('#help-dialog').close());
  $('#help-continue').addEventListener('click',()=>$('#help-dialog').close());
  $('#help-dialog').addEventListener('click',event=>{if(event.target===$('#help-dialog'))$('#help-dialog').close();});
  $('#fullscreen-toggle').hidden = !document.documentElement.requestFullscreen;
  $('#fullscreen-toggle').addEventListener('click',toggleFullscreen);
  document.addEventListener('fullscreenchange',syncFullscreen);
  reducedMotion.addEventListener('change',event=>{if(event.matches)finishArrival();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshTime();});
  function refreshTime(){const next=chosenPeriod();if(next!==period&&ready){period=next;loadCurrent({keepView:true});}}
  setInterval(refreshTime,30000);
  if(entered){document.body.classList.add('entered');$('#intro').hidden=true;}
  syncControls();playArrival();
  window.worldPOC = {getState:()=>({scene:current, period, mode, lightOn:lightOn(current), visited:[...visited], ready, pitch:viewer.getPitch(), yaw:viewer.getYaw(), hfov:viewer.getHfov(), state:assetState(manifest.scenes[current],period,lightOn(current))})};
}

$('#skip-intro').addEventListener('click',finishArrival);
initialize().catch((error)=>{finishArrival();showStatus(error.message + '. Reload to try again.');});
