import * as htmlToImage from 'html-to-image';

/**
 * Visora Browser Overlay
 * Premium visual component inspector with inline AI chat.
 * Injected into the browser by the Vite plugin (dev-only).
 */
(function visoraOverlay() {
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .visora-highlight {
      position: fixed; pointer-events: none; z-index: 999997;
      border: 2px solid rgba(139, 92, 246, 0.8);
      background: rgba(139, 92, 246, 0.06);
      border-radius: 6px;
      transition: all 0.12s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.15), inset 0 0 20px rgba(139, 92, 246, 0.03);
    }
    .visora-highlight.visora-selected {
      border-color: rgba(168, 85, 247, 0.95);
      background: rgba(168, 85, 247, 0.08);
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.15), 0 0 0 1px rgba(168, 85, 247, 0.3);
    }

    .visora-badge {
      position: fixed; pointer-events: none; z-index: 999998;
      background: linear-gradient(135deg, #7c3aed, #6366f1);
      color: white; font: 500 11px/1.4 'Inter', system-ui, sans-serif;
      padding: 3px 8px; border-radius: 5px;
      transform: translateY(-100%); margin-top: -4px;
      white-space: nowrap; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
      letter-spacing: 0.01em; max-width: 400px; overflow: hidden; text-overflow: ellipsis;
    }

    .visora-panel {
      position: fixed; z-index: 1000000; width: 360px;
      background: rgba(15, 15, 25, 0.92);
      backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 14px;
      padding: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.08);
      font-family: 'Inter', system-ui, sans-serif; color: #e2e8f0;
      animation: visora-panel-in 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes visora-panel-in {
      from { opacity: 0; transform: translateY(8px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .visora-panel-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .visora-panel-logo { width: 22px; height: 22px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white; flex-shrink: 0; }
    .visora-panel-title { font-size: 13px; font-weight: 600; color: #c4b5fd; letter-spacing: 0.02em; }
    .visora-panel-close { margin-left: auto; background: none; border: none; color: #64748b; cursor: pointer; font-size: 16px; padding: 2px 6px; border-radius: 4px; transition: all 0.15s; }
    .visora-panel-close:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }

    .visora-panel-info { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.15); border-radius: 8px; padding: 8px 10px; margin-bottom: 12px; font-size: 11px; color: #a5b4fc; line-height: 1.5; word-break: break-all; }
    .visora-panel-info strong { color: #c4b5fd; }
    .visora-panel textarea { width: 100%; box-sizing: border-box; min-height: 80px; resize: vertical; background: rgba(15,23,42,0.6); color: #e2e8f0; border: 1px solid rgba(139,92,246,0.2); border-radius: 10px; padding: 10px 12px; font: 400 13px/1.5 'Inter', system-ui, sans-serif; outline: none; }
    .visora-panel textarea:focus { border-color: rgba(139,92,246,0.5); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
    .visora-panel-actions { display: flex; gap: 8px; margin-top: 10px; }

    .visora-btn { cursor: pointer; border: none; border-radius: 8px; padding: 8px 14px; font: 500 12px/1 'Inter', system-ui, sans-serif; transition: all 0.15s; }
    .visora-btn-primary { background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; flex: 1; box-shadow: 0 2px 10px rgba(99,102,241,0.3); }
    .visora-btn-primary:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.45); transform: translateY(-1px); }
    .visora-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .visora-btn-secondary { background: rgba(255,255,255,0.06); color: #94a3b8; border: 1px solid rgba(255,255,255,0.08); }

    .visora-toast { position: fixed; bottom: 20px; right: 20px; z-index: 1000001; padding: 10px 16px; border-radius: 10px; font: 500 13px/1.4 'Inter', system-ui, sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,0.3); animation: visora-toast-in 0.3s cubic-bezier(0.22, 1, 0.36, 1); display: flex; align-items: center; gap: 8px; backdrop-filter: blur(12px); color: white; }
    .visora-toast-success { background: rgba(16,185,129,0.9); }
    .visora-toast-error { background: rgba(239,68,68,0.9); }
    @keyframes visora-toast-in { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

    .visora-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: visora-spin 0.6s linear infinite; display: inline-block; }
    @keyframes visora-spin { to { transform: rotate(360deg); } }

    .visora-watermark { position: fixed; bottom: 12px; left: 12px; z-index: 999990; background: rgba(15,15,25,0.7); backdrop-filter: blur(8px); color: #7c3aed; font: 600 10px/1 'Inter', system-ui, sans-serif; padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(139,92,246,0.15); letter-spacing: 0.05em; text-transform: uppercase; pointer-events: none; opacity: 0.7; }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'visora-overlay-styles';
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  const highlightEl = document.createElement('div');
  highlightEl.className = 'visora-highlight';
  highlightEl.style.display = 'none';

  const badgeEl = document.createElement('div');
  badgeEl.className = 'visora-badge';
  badgeEl.style.display = 'none';

  const watermarkEl = document.createElement('div');
  watermarkEl.className = 'visora-watermark';
  watermarkEl.textContent = '🔮 Visora';

  document.body.appendChild(highlightEl);
  document.body.appendChild(badgeEl);
  document.body.appendChild(watermarkEl);

  let currentTarget: HTMLElement | null = null;
  let panelEl: HTMLElement | null = null;
  let isSending = false;

  function findSourceEl(el: Element | null): HTMLElement | null {
    while (el && el !== document.body) {
      if (el instanceof HTMLElement && el.hasAttribute('data-visora-src')) return el;
      el = el.parentElement;
    }
    return null;
  }

  function positionHighlight(el: HTMLElement): void {
    const r = el.getBoundingClientRect();
    highlightEl.style.display = 'block';
    highlightEl.style.left = r.left - 2 + 'px';
    highlightEl.style.top = r.top - 2 + 'px';
    highlightEl.style.width = r.width + 4 + 'px';
    highlightEl.style.height = r.height + 4 + 'px';

    const vsrc = el.getAttribute('data-visora-src') || '';
    const fiberData = extractFiberData(el);
    const displayName = fiberData?.componentName ? `<\${fiberData.componentName}> — \${vsrc}` : vsrc;

    badgeEl.style.display = 'block';
    badgeEl.style.left = r.left + 'px';
    badgeEl.style.top = Math.max(r.top, 20) + 'px';
    badgeEl.textContent = displayName;
  }

  function getFiberNode(el: HTMLElement): any | null {
    const keys = Object.keys(el);
    for (const key of keys) {
      if (key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) {
        return (el as any)[key];
      }
    }
    return null;
  }

  function extractFiberData(el: HTMLElement) {
    const fiber = getFiberNode(el);
    if (!fiber) return null;

    let componentName: string | null = null;
    let componentProps: Record<string, unknown> = {};

    if (fiber.return) {
      let parent = fiber.return;
      let depth = 0;
      while (parent && depth < 10) {
        if (typeof parent.type === 'function' || typeof parent.type === 'object') {
          const type = parent.type;
          componentName = type.displayName || type.name || null;
          if (parent.memoizedProps) {
            componentProps = {};
            try {
              for (const [k, v] of Object.entries(parent.memoizedProps)) {
                if (k === 'children') continue;
                if (typeof v === 'function') componentProps[k] = '[Function]';
                else if (typeof v === 'object' && v !== null) componentProps[k] = '[Object]';
                else componentProps[k] = v;
              }
            } catch {}
          }
          break;
        }
        parent = parent.return;
        depth++;
      }
    }

    const stateKeys: string[] = [];
    const hooks: string[] = [];
    try {
      if (fiber.return?.memoizedState) {
        let state = fiber.return.memoizedState;
        let i = 0;
        while (state && i < 20) {
          if (state.queue) hooks.push(`useState_\${i}`);
          else if (state.deps !== undefined) hooks.push(`useEffect_\${i}`);
          else hooks.push(`hook_\${i}`);
          state = state.next;
          i++;
        }
      }
    } catch {}

    return { componentName, props: componentProps, stateKeys, hooks };
  }

  function getAncestorChain(el: HTMLElement): string[] {
    const chain: string[] = [];
    let node = el.parentElement;
    let depth = 0;
    while (node && node !== document.body && depth < 8) {
      if (node.hasAttribute('data-visora-src')) {
        chain.push(node.getAttribute('data-visora-src')!);
      }
      node = node.parentElement;
      depth++;
    }
    return chain;
  }

  function getChildSources(el: HTMLElement): string[] {
    return Array.from(el.querySelectorAll('[data-visora-src]')).slice(0, 15).map(n => n.getAttribute('data-visora-src')!);
  }

  function extractTailwindClasses(el: HTMLElement): string[] {
    const cls = el.className;
    if (!cls || typeof cls !== 'string') return [];
    return cls.split(/\\s+/).filter(c => /^(bg-|text-|p-|px-|py-|pt-|pb-|pl-|pr-|m-|mx-|my-|mt-|mb-|ml-|mr-|flex|grid|block|inline|hidden|w-|h-|min-|max-|rounded|border|shadow|opacity-|z-|gap-|space-|items-|justify-|font-|leading-|tracking-|overflow-|transition|duration-|ease-|animate-|hover:|focus:|dark:|sm:|md:|lg:|xl:)/.test(c));
  }

  function detectFramework() {
    if ((window as any).__NEXT_DATA__) return 'nextjs';
    const rootEl = document.getElementById('root') || document.getElementById('__next');
    if (rootEl) {
      const keys = Object.keys(rootEl);
      if (keys.some(k => k.startsWith('__reactContainer') || k.startsWith('__reactFiber'))) return 'react';
    }
    return 'unknown';
  }

  function buildContext(el: HTMLElement, instruction: string): Record<string, unknown> {
    const computed = window.getComputedStyle(el);
    const stylesOfInterest = [
      'display', 'position', 'width', 'height', 'padding', 'margin', 'font-family', 'font-size', 'font-weight',
      'background-color', 'color', 'flex-direction', 'gap', 'border', 'border-radius', 'opacity'
    ];
    const styleSubset: Record<string, string> = {};
    stylesOfInterest.forEach(p => styleSubset[p] = computed.getPropertyValue(p));

    const vsrc = el.getAttribute('data-visora-src') || '';
    const [sourceFile, sourceLine] = vsrc.split(':');
    const fiber = extractFiberData(el);

    let boundingRect = null;
    try {
      const r = el.getBoundingClientRect();
      boundingRect = { x: r.x, y: r.y, width: r.width, height: r.height };
    } catch {}

    return {
      instruction,
      sourceFile: sourceFile || null,
      sourceLine: Number(sourceLine) || null,
      tagName: el.tagName.toLowerCase(),
      className: typeof el.className === 'string' ? el.className : '',
      id: el.id || null,
      outerHTML: el.outerHTML.slice(0, 5000),
      computedStyles: styleSubset,
      boundingRect,
      ancestorComponents: getAncestorChain(el),
      childComponents: getChildSources(el),
      fiber,
      tailwindClasses: extractTailwindClasses(el),
      framework: detectFramework(),
      url: window.location.href,
      capturedAt: new Date().toISOString(),
    };
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    const t = document.createElement('div');
    t.className = `visora-toast visora-toast-\${type}`;
    t.innerHTML = `\${type === 'success' ? '✓' : '✗'} \${msg}`;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(12px)';
      t.style.transition = 'all 0.3s';
      setTimeout(() => t.remove(), 300);
    }, 3000);
  }

  function openPanel(el: HTMLElement): void {
    closePanel();
    highlightEl.classList.add('visora-selected');
    positionHighlight(el);

    const r = el.getBoundingClientRect();
    const vsrc = el.getAttribute('data-visora-src') || '';
    const fiber = extractFiberData(el);
    const compDisplay = fiber?.componentName ? `<strong>&lt;\${fiber.componentName}&gt;</strong>` : `<strong>\${el.tagName.toLowerCase()}</strong>`;

    panelEl = document.createElement('div');
    panelEl.className = 'visora-panel';

    let panelLeft = r.right + 12;
    let panelTop = r.top;
    if (panelLeft + 370 > window.innerWidth) panelLeft = r.left - 372;
    if (panelLeft < 10) { panelLeft = Math.min(r.left, window.innerWidth - 380); panelTop = r.bottom + 12; }
    panelTop = Math.max(10, Math.min(panelTop, window.innerHeight - 280));

    panelEl.style.left = panelLeft + 'px';
    panelEl.style.top = panelTop + 'px';

    const propsInfo = fiber?.props && Object.keys(fiber.props).length > 0 ? `<br>Props: \${Object.keys(fiber.props).join(', ')}` : '';

    panelEl.innerHTML = `
      <div class="visora-panel-header">
        <div class="visora-panel-logo">V</div>
        <span class="visora-panel-title">Visora</span>
        <button class="visora-panel-close" data-action="close" title="Close (Esc)">✕</button>
      </div>
      <div class="visora-panel-info">\${compDisplay}<br>📁 \${vsrc}\${propsInfo}</div>
      <textarea id="visora-prompt" placeholder="Describe the change...\ne.g. Make this button rounded with glassmorphism"></textarea>
      <div class="visora-panel-actions">
        <button class="visora-btn visora-btn-secondary" data-action="cancel">Cancel</button>
        <button class="visora-btn visora-btn-primary" data-action="send" id="visora-send-btn">🚀 Send to Agent</button>
      </div>
    `;

    document.body.appendChild(panelEl);
    const textarea = panelEl.querySelector('#visora-prompt') as HTMLTextAreaElement;
    textarea.focus();

    textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        (panelEl?.querySelector('[data-action="send"]') as HTMLButtonElement)?.click();
      }
    });

    panelEl.addEventListener('click', async (e: Event) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute('data-action');
      if (action === 'close' || action === 'cancel') return closePanel();
      if (action === 'send' && !isSending) {
        const instruction = textarea.value.trim();
        if (!instruction) { textarea.style.borderColor = 'rgba(239, 68, 68, 0.5)'; return; }

        isSending = true;
        const sendBtn = panelEl?.querySelector('#visora-send-btn') as HTMLButtonElement;
        if (sendBtn) { sendBtn.disabled = true; sendBtn.innerHTML = '<span class="visora-spinner"></span> Sending...'; }

        try {
          // Temporarily hide highlight to get a clean screenshot
          highlightEl.style.display = 'none';
          badgeEl.style.display = 'none';
          panelEl!.style.display = 'none';

          const screenshotBase64 = await htmlToImage.toPng(el, { backgroundColor: '#0a0a0f' });

          highlightEl.style.display = 'block';
          badgeEl.style.display = 'block';
          panelEl!.style.display = 'block';

          const ctx = buildContext(el, instruction);
          (ctx as any).screenshotBase64 = screenshotBase64;

          const res = await fetch('/@visora/context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ctx),
          });

          if (res.ok || res.status === 204) showToast('Context sent! Ask your AI agent to apply it.', 'success');
          else showToast(`Server error (\${res.status})`, 'error');
        } catch (err) {
          console.error(err);
          showToast('Failed to reach dev server', 'error');
        }

        isSending = false;
        closePanel();
      }
    });
  }

  function closePanel(): void {
    if (panelEl) { panelEl.remove(); panelEl = null; }
    highlightEl.classList.remove('visora-selected');
    isSending = false;
  }

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (panelEl) return;
    const el = findSourceEl(e.target as Element);
    if (el) { currentTarget = el; positionHighlight(el); }
    else { highlightEl.style.display = 'none'; badgeEl.style.display = 'none'; currentTarget = null; }
  });

  document.addEventListener('click', (e: MouseEvent) => {
    if (!e.altKey) return;
    const el = findSourceEl(e.target as Element);
    if (!el) return;
    e.preventDefault(); e.stopPropagation();
    openPanel(el);
  }, true);

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') closePanel();
  });

  console.log('%c🔮 Visora%c overlay loaded — Alt+Click any element to edit it with AI', 'color: #8b5cf6; font-weight: bold; font-size: 13px;', 'color: #94a3b8; font-size: 12px;');
})();

