// WebMCP: the portfolio's read-only actions, offered to an AI agent working in this browser tab.
// https://webmachinelearning.github.io/webmcp/  — the API is new: document.modelContext, or
// navigator.modelContext in older Chrome builds. Where neither exists this does nothing.
(() => {
  const mc = document.modelContext || navigator.modelContext;
  if (!mc || typeof mc.registerTool !== 'function') return;

  const origin = location.origin;
  const text = r => { if (!r.ok) throw new Error(`HTTP ${r.status} for ${r.url}`); return r.text(); };
  const reply = s => ({ content: [{ type: 'text', text: s }] });
  // A sitemap page path -> its Markdown copy (page.html -> page.md, dir/ -> dir/index.md).
  const mdPath = p => (p === '' || p.endsWith('/') ? p + 'index.md' : p.replace(/\.html$/, '.md'));
  const pagePath = input => new URL(String(input || '/'), origin + '/').pathname.replace(/^\//, '');

  const tools = [
    {
      name: 'list_pages',
      description: "List every page of Sandy Tayts's portfolio, with a one-line description of each project.",
      inputSchema: { type: 'object', properties: {} },
      execute: async () => reply(await fetch('/llms.txt').then(text)),
    },
    {
      name: 'read_page',
      description: 'Read one portfolio page as Markdown. Accepts a path or URL from list_pages, e.g. "lazy.html" or "/dwellers/".',
      inputSchema: {
        type: 'object',
        properties: { page: { type: 'string', description: 'Page path or URL on sandy.tayts.com' } },
        required: ['page'],
      },
      execute: async ({ page }) => reply(await fetch('/' + mdPath(pagePath(page))).then(text)),
    },
    {
      name: 'open_page',
      description: 'Navigate this tab to a portfolio page so the person can see it.',
      inputSchema: {
        type: 'object',
        properties: { page: { type: 'string', description: 'Page path or URL on sandy.tayts.com' } },
        required: ['page'],
      },
      execute: async ({ page }) => { location.assign('/' + pagePath(page)); return reply('Opening ' + page); },
    },
    {
      name: 'get_resume',
      description: "Sandy Tayts's résumé as JSON Resume (roles, dates, skills).",
      inputSchema: { type: 'object', properties: {} },
      execute: async () => reply(await fetch('/resume/resume.json').then(text)),
    },
    {
      name: 'get_contact',
      description: 'How to contact Sandy Tayts: email, phone, WhatsApp, LinkedIn.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => reply(await fetch('/contact.md').then(text)),
    },
  ];

  for (const tool of tools) {
    try { Promise.resolve(mc.registerTool(tool)).catch(() => {}); } catch (_) { /* one bad tool must not stop the rest */ }
  }
})();
