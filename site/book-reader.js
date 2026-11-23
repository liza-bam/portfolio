/* The original Panic page-turning book, reused inside both illustration cases. */
(() => {
  const config = JSON.parse(document.getElementById('book-config').textContent);
  config.selections.sort((a, b) => a.page - b.page);
  const reader = document.getElementById('reader'), stage = document.getElementById('stage'), book = document.getElementById('book');
  const prev = document.getElementById('prev'), next = document.getElementById('next'), scrub = document.getElementById('scrub');
  const where = document.getElementById('where'), hint = document.getElementById('hint'), strip = document.getElementById('illustration-strip');
  const tabs = [...reader.querySelectorAll('[data-mode]')], expand = reader.querySelector('[data-expand]');
  const leaves = new Map();
  let mode = config.mode || 'illustrations', L = mode === 'full' ? 0 : 1, side = 'L', single = false, expanded = false, previousOverflow = '', illustrationPosition = 1, illustrationSide = 'L', selectedArt = 0;
  const backdrop = document.createElement('div'); backdrop.className = 'book-backdrop'; backdrop.hidden = true; document.body.append(backdrop);
  const outside = [...document.querySelectorAll('.case-header,.case-intro,.skip')];
  const count = () => mode === 'full' ? config.pages : config.selections.length;
  const totalLeaves = () => mode === 'full' ? Math.ceil(config.pages / 2) + 2 : Math.ceil(count() / 2) + 1;
  const pad = n => String(n).padStart(3, '0');
  function art(i, back) {
    if (i === 0) return back && mode === 'illustrations' ? config.selections[0].src : back ? config.endpaper || null : config.dir + 'front.webp';
    if (i === totalLeaves() - 1) return back ? config.dir + 'back.webp' : mode === 'illustrations' && count() % 2 === 0 ? config.selections.at(-1).src : config.endpaper || null;
    if (mode === 'illustrations') return config.selections[back ? 2 * i : 2 * i - 1]?.src || null;
    const p = back ? 2 * i : 2 * i - 1;
    return p <= config.pages ? config.dir + 'pages/' + pad(p) + '.webp' : null;
  }
  function face(i, back) {
    const el = document.createElement('div'), src = art(i, back);
    const cover = (i === 0 && !back) || (i === totalLeaves() - 1 && back);
    el.className = 'face ' + (back ? 'back' : 'front') + (cover ? ' cover' : '');
    if (src) {
      const img = new Image(); img.decoding = 'async'; img.draggable = false;
      const selection = config.selections.find(s => s.src === src);
      img.alt = cover ? (i === 0 ? 'Front cover' : 'Back cover') : mode === 'illustrations' ? selection?.title || 'Book illustration' : 'Book page ' + (back ? 2 * i : 2 * i - 1);
      img.src = src; el.append(img);
    }
    return el;
  }
  function place(el, i) {
    const turned = i < L, depth = turned ? L - 1 - i : i - L;
    el.style.transform = `translateZ(${-depth * .6}px) rotateY(${turned ? -180 : 0}deg)`;
  }
  function visiblePages() {
    if (L === 0 || L === totalLeaves()) return [];
    const l = mode === 'illustrations' ? 2 * L - 1 : 2 * (L - 1), r = l + 1;
    return (single ? [side === 'L' ? l : r] : [l, r]).filter(p => p > 0 && p <= count());
  }
  function view() {
    reader.dataset.mode = mode;
    const N = totalLeaves(), open = L > 0 && L < N;
    if (single && open && side === 'R' && (mode === 'illustrations' ? 2 * L : 2 * L - 1) > count()) side = 'L';
    book.classList.toggle('open', open); if (L > 0) reader.querySelector('[data-look-inside]')?.setAttribute('hidden', ''); book.classList.toggle('at-front', L === 0); book.classList.toggle('at-back', L === N);
    book.style.setProperty('--tl', `calc(var(--t)*${L / N})`); book.style.setProperty('--tr', `calc(var(--t)*${(N - L) / N})`);
    let x = 0, ry = 0, rx = config.tilt ?? 12;
    if (L === 0) { x = -25; ry = single ? 0 : config.coverTurn ?? 24; rx = config.tilt ?? 4; }
    else if (L === N) { x = 25; ry = single ? 0 : -(config.coverTurn ?? 24); rx = config.tilt ?? 4; }
    else if (single) { x = side === 'R' ? -25 : 25; rx = 0; }
    book.style.transformOrigin = `${50 - x * 2 * (open ? 0 : 1) / 2}% 50%`;
    book.style.transform = `translateX(${x}%) rotateX(${rx}deg) rotateY(${ry}deg)`;
    for (const [i, el] of leaves) {
      const leftVisible = open && i === L - 1 && (!single || side === 'L');
      const rightVisible = open && i === L && (!single || side === 'R');
      el.children[0].setAttribute('aria-hidden', String(!(rightVisible || L === 0 && i === 0)));
      el.children[1].setAttribute('aria-hidden', String(!(leftVisible || L === N && i === N - 1)));
    }
    const pages = visiblePages(), unit = mode === 'full' ? 'Page' : 'Illustration';
    where.textContent = L === 0 ? 'Cover' : L === N ? 'Back cover' : pages.length > 1 ? `${unit}s ${pages[0]}–${pages[1]} of ${count()}` : `${unit} ${pages[0] || count()} of ${count()}`;
    if(mode === 'illustrations' && !pages.includes(selectedArt+1)) selectedArt = Math.max(0,(pages[0] || 1)-1);
    scrub.min = 0; scrub.max = mode === 'illustrations' ? count() - 1 : N; scrub.value = mode === 'illustrations' ? selectedArt : L;
    scrub.setAttribute('aria-label', mode === 'illustrations' ? 'Illustration position' : 'Book position');
    prev.disabled = mode === 'illustrations' ? pages[0] === 1 : L === 0; next.disabled = mode === 'illustrations' ? pages.at(-1) === count() : L === N;
    hint.textContent = L === 0 ? 'Click the cover to open.' : 'Turn the pages or choose an illustration below.';
    for (const [i, button] of [...strip.children].entries()) {
      const p = mode === 'illustrations' ? i + 1 : config.selections[i].page;
      button.setAttribute('aria-pressed', String(pages.includes(p)));
    }
  }
  function render() {
    const N = totalLeaves(), lo = Math.max(0, L - 4), hi = Math.min(N - 1, L + 3);
    for (const [i, el] of leaves) if (i < lo || i > hi) { el.remove(); leaves.delete(i); }
    for (let i = lo; i <= hi; i++) {
      let el = leaves.get(i);
      if (!el) {
        el = document.createElement('div'); el.className = 'leaf'; el.append(face(i, false), face(i, true));
        el.addEventListener('transitionend', () => el.classList.remove('turning'));
        leaves.set(i, el); book.append(el); place(el, i); el.getBoundingClientRect();
      } else place(el, i);
    }
    view();
  }
  function go(to, requestedSide = 'R') {
    to = mode === 'illustrations' ? Math.max(1,Math.min(totalLeaves()-1,to)) : Math.max(0, Math.min(totalLeaves(), to));
    const d = to - L;
    if (Math.abs(d) === 1) { leaves.get(d > 0 ? L : to)?.classList.add('turning'); book.classList.remove('jump'); }
    else if (d) book.classList.add('jump');
    L = to; side = requestedSide; render();
  }
  function step(d) {
    if(mode === 'illustrations' && (d < 0 && visiblePages()[0] === 1 || d > 0 && visiblePages().at(-1) === count())) return;
    const N = totalLeaves();
    if (!single) return go(L + d);
    if (d > 0) {
      if (L === 0) go(1, mode === 'illustrations' ? 'L' : 'R');
      else if (L === N) return;
      else if (side === 'L') { side = 'R'; visiblePages().length ? view() : go(N); }
      else go(L + 1, L + 1 === N ? 'R' : 'L');
    } else {
      if (L === N) go(N - 1, 'L');
      else if (L === 0) return;
      else if (side === 'R') {
        if (L === 1 && mode === 'full') go(0); else { side = 'L'; view(); }
      } else if (L === 1) go(0); else go(L - 1, 'R');
    }
  }
  function size() {
    const w = stage.clientWidth, h = stage.clientHeight, aspect = mode === 'illustrations' ? 1 : config.aspect;
    single = w < 700;
    const mobile = matchMedia('(max-width:700px)').matches;
    book.classList.toggle('single-page', single && mobile);
    const widthRatio = single ? (mobile ? .96 : .86) : config.fit ?? .43;
    const verticalPadding = mobile ? 12 : expanded ? 42 : config.pad ?? 20;
    const pw = Math.max(80, Math.floor(Math.min(w * widthRatio, (h - verticalPadding) * aspect)));
    book.style.setProperty('--pw', pw + 'px'); book.style.setProperty('--ph', pw / aspect + 'px');
    book.style.setProperty('--t', Math.round(pw * config.thickness) + 'px'); book.classList.add('jump'); view();
  }
  function choose(index) {
    selectedArt = index;
    if (mode === 'illustrations') go(Math.floor(index / 2) + 1, index % 2 ? 'R' : 'L');
    else { const p = config.selections[index].page; go(Math.floor(p / 2) + 1, p % 2 ? 'R' : 'L'); }
  }
  config.selections.forEach((selection, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.title = selection.title;
    button.setAttribute('aria-label', 'View ' + selection.title); button.setAttribute('aria-pressed', 'false');
    const img = new Image(); img.src = selection.thumb; img.alt = ''; img.loading = 'lazy'; button.append(img);
    button.addEventListener('click', () => choose(i)); strip.append(button);
  });
  tabs.forEach(button => button.addEventListener('click', () => {
    if (mode === button.dataset.mode) return;
    mode = button.dataset.mode; L = mode === 'illustrations' ? 1 : 0; side = mode === 'illustrations' ? 'L' : 'R';
    for (const el of leaves.values()) el.remove(); leaves.clear();
    tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
    size(); render();
  }));
  book.addEventListener('click', ev => {
    if (L === 0) step(1); else if (L === totalLeaves()) step(-1);
    else if (single) step(1); else { const r = stage.getBoundingClientRect(); step(ev.clientX > r.left + r.width / 2 ? 1 : -1); }
  });
  prev.addEventListener('click', () => step(-1)); next.addEventListener('click', () => step(1));
  scrub.addEventListener('input', () => mode === 'illustrations' ? choose(+scrub.value) : go(+scrub.value));
  reader.querySelector('[data-shuffle]')?.addEventListener('click', () => {
    const current = visiblePages(), candidates = config.selections.map((s, i) => i).filter(i => !current.includes(mode === 'illustrations' ? i + 1 : config.selections[i].page));
    choose(candidates[Math.floor(Math.random() * candidates.length)] ?? 0);
  });
  function expandReader(value) {
    if (value === expanded) return;
    expanded = value;
    if (expanded) {
      illustrationPosition = L; illustrationSide = side;
      const selected = config.selections[selectedArt] || config.selections[0];
      mode = 'full'; L = Math.floor(selected.page / 2) + 1; side = selected.page % 2 ? 'R' : 'L';
    } else { mode = 'illustrations'; L = illustrationPosition; side = illustrationSide; }
    for (const el of leaves.values()) el.remove(); leaves.clear();
    reader.classList.toggle('expanded', expanded); backdrop.hidden = !expanded;
    expand.textContent = expanded ? 'Close' : 'Expand'; expand.title = expanded ? 'Close large book' : 'Open large book'; expand.setAttribute('aria-expanded', String(expanded));
    if (expanded) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; reader.setAttribute('role', 'dialog'); reader.setAttribute('aria-modal', 'true'); outside.forEach(el => el.inert = true); }
    else { document.body.style.overflow = previousOverflow; reader.removeAttribute('role'); reader.removeAttribute('aria-modal'); outside.forEach(el => el.inert = false); }
    size(); render(); expand.focus();
  }
  backdrop.addEventListener('click', () => expandReader(false));
  if (expand) { expand.setAttribute('aria-expanded', 'false'); expand.addEventListener('click', () => expandReader(!expanded)); }
  const look = reader.querySelector('[data-look-inside]');
  if (look) look.addEventListener('click', () => go(2));
  reader.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && expanded) { expandReader(false); return; }
    if (expanded && ev.key === 'Tab') {
      const items = [...reader.querySelectorAll('button:not(:disabled),input,[tabindex="0"]')].filter(el => el.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
    if (ev.target.closest('button,input')) return;
    if (ev.key === 'ArrowRight' || ev.key === ' ') { ev.preventDefault(); step(1); }
    if (ev.key === 'ArrowLeft') { ev.preventDefault(); step(-1); }
    if (ev.key === 'Home') { ev.preventDefault(); mode === 'illustrations' ? choose(0) : go(0); }
    if (ev.key === 'End') { ev.preventDefault(); mode === 'illustrations' ? choose(count()-1) : go(totalLeaves()); }
  });
  let touch = null;
  stage.addEventListener('touchstart', ev => { touch = { x: ev.touches[0].clientX, y: ev.touches[0].clientY }; }, { passive: true });
  stage.addEventListener('touchend', ev => {
    if (!touch) return; const dx = ev.changedTouches[0].clientX - touch.x, dy = ev.changedTouches[0].clientY - touch.y; touch = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { ev.preventDefault(); step(dx < 0 ? 1 : -1); }
  });
  new ResizeObserver(size).observe(stage);
  document.fonts.ready.then(size); size(); render();
})();
