(() => {
  const group = document.querySelector('.case-reading-switch');
  if (!group) return;

  const buttons = [...group.querySelectorAll('[data-case-read]')];
  const sections = [...document.querySelectorAll('main [data-case-detail]')];
  if (!sections.length) return;

  let view = 'brief';
  let filtered = false;

  function render() {
    sections.forEach(section => { section.hidden = view === 'brief' && !filtered; });
    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(!filtered && button.dataset.caseRead === view));
    });
  }

  function revealHashTarget() {
    const targetId = decodeURIComponent(location.hash.slice(1));
    const target = document.getElementById(targetId);
    if (!target?.closest('[data-case-detail]')) return;

    document.dispatchEvent(new Event('portfolio:reset-contribution'));
    view = 'full';
    render();
    requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    document.dispatchEvent(new Event('portfolio:reset-contribution'));
    view = button.dataset.caseRead;
    render();
  }));

  document.addEventListener('portfolio:contribution-changed', event => {
    filtered = Boolean(event.detail);
    render();
  });
  window.addEventListener('hashchange', revealHashTarget);
  render();
  revealHashTarget();
  group.hidden = false;
})();
