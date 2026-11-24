(() => {
  const group = document.querySelector('.case-reading-switch');
  if (!group) return;

  const buttons = [...group.querySelectorAll('[data-case-read]')];
  const sections = [...document.querySelectorAll('main details[data-case-detail]')];

  function updateView() {
    const openCount = sections.filter(section => section.open).length;
    buttons.forEach(button => {
      const selected = button.dataset.caseRead === 'full' ? openCount === sections.length : openCount === 0;
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    document.dispatchEvent(new Event('portfolio:reset-contribution'));
    const showFull = button.dataset.caseRead === 'full';
    sections.forEach(section => { section.open = showFull; });
    updateView();
  }));

  sections.forEach(section => section.addEventListener('toggle', updateView));
  updateView();
  group.hidden = sections.length === 0;
})();
