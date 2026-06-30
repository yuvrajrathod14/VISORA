import * as htmlToImage from 'html-to-image';

/**
 * Visora Browser Overlay
 * Premium visual component inspector with inline AI chat.
 * Injected into the browser by the Vite plugin (dev-only).
 */
(function visoraOverlay() {
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* ── Selection Highlight ── */
    .visora-highlight {
      position: fixed; pointer-events: none; z-index: 999997;
      border: 1.5px solid #6366f1;
      background: rgba(99, 102, 241, 0.04);
      border-radius: 6px;
      transition: all 0.12s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .visora-highlight.visora-selected {
      border: 2px solid #6366f1;
      background: rgba(99, 102, 241, 0.06);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
    }

    /* ── Hover Badge ── */
    .visora-badge {
      position: fixed; pointer-events: none; z-index: 999998;
      background: #18181b;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #e4e4e7; font: 500 11px/1.4 'Inter', system-ui, sans-serif;
      padding: 3px 8px; border-radius: 5px;
      transform: translateY(-100%); margin-top: -4px;
      white-space: nowrap; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      letter-spacing: 0.01em; max-width: 400px; overflow: hidden; text-overflow: ellipsis;
    }

    /* ── Panel (Instruction Modal) ── */
    .visora-panel {
      position: fixed; z-index: 1000000; width: 360px;
      background: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 16px;
      padding: 0;
      box-shadow: 0 16px 48px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.04);
      font-family: 'Inter', system-ui, sans-serif; color: #18181b;
      animation: visora-panel-in 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      overflow: hidden;
    }
    @keyframes visora-panel-in {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .visora-loading-bar { position: absolute; top: 0; left: 0; height: 2px; width: 100%; background: #f4f4f5; overflow: hidden; display: none; }
    .visora-loading-bar::after { content: ''; position: absolute; top: 0; left: 0; height: 100%; width: 40%; background: linear-gradient(90deg, transparent, #6366f1, #818cf8, transparent); animation: visora-loading 1.5s infinite ease-in-out; }
    @keyframes visora-loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }

    .visora-panel-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px 0 20px; }
    .visora-panel-logo { width: 24px; height: 24px; background: #6366f1; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .visora-panel-logo svg { width: 14px; height: 14px; color: white; }
    .visora-panel-title { font-size: 14px; font-weight: 600; color: #18181b; letter-spacing: -0.01em; }
    .visora-panel-close { margin-left: auto; background: none; border: none; color: #a1a1aa; cursor: pointer; width: 28px; height: 28px; border-radius: 6px; transition: all 0.15s; display: flex; align-items: center; justify-content: center; font-size: 0; }
    .visora-panel-close svg { width: 16px; height: 16px; }
    .visora-panel-close:hover { background: #f4f4f5; color: #18181b; }

    .visora-panel-info { margin: 12px 20px; background: #fafafa; border: 1px solid #f4f4f5; border-radius: 10px; padding: 10px 12px; font-size: 12px; color: #71717a; line-height: 1.5; word-break: break-all; }
    .visora-panel-info strong { color: #18181b; font-weight: 600; }
    .visora-panel-info .info-file { color: #6366f1; font-weight: 500; }

    .visora-panel-body { padding: 0 20px 20px 20px; }
    .visora-panel textarea { width: 100%; box-sizing: border-box; min-height: 80px; resize: none; background: #fafafa; color: #18181b; border: 1px solid #e4e4e7; border-radius: 10px; padding: 12px; font: 400 13px/1.6 'Inter', system-ui, sans-serif; outline: none; transition: all 0.15s; }
    .visora-panel textarea:focus { border-color: #6366f1; background: #ffffff; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .visora-panel textarea::placeholder { color: #a1a1aa; }
    .visora-panel-actions { display: flex; gap: 8px; margin-top: 12px; }

    .visora-btn { cursor: pointer; border: none; border-radius: 8px; padding: 9px 16px; font: 500 13px/1 'Inter', system-ui, sans-serif; transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1); letter-spacing: 0; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .visora-btn-primary { background: #18181b; color: #ffffff; flex: 1; }
    .visora-btn-primary:hover { background: #27272a; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .visora-btn-primary:active { transform: translateY(0); box-shadow: none; }
    .visora-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .visora-btn-secondary { background: #ffffff; color: #52525b; border: 1px solid #e4e4e7; }
    .visora-btn-secondary:hover { background: #fafafa; color: #18181b; border-color: #d4d4d8; }

    /* ── Toast ── */
    .visora-toast { position: fixed; bottom: 24px; right: 24px; z-index: 1000001; padding: 10px 16px; border-radius: 10px; font: 500 13px/1.4 'Inter', system-ui, sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.12); animation: visora-toast-in 0.3s cubic-bezier(0.22, 1, 0.36, 1); display: flex; align-items: center; gap: 8px; color: white; }
    .visora-toast-success { background: #18181b; }
    .visora-toast-error { background: #dc2626; }
    @keyframes visora-toast-in { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

    .visora-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: visora-spin 0.6s linear infinite; display: inline-block; }
    @keyframes visora-spin { to { transform: rotate(360deg); } }

    /* ── Toggle Button ── */
    .visora-toggle { position: fixed; bottom: 20px; right: 20px; z-index: 999990; background: #ffffff; color: #71717a; font: 600 12px/1 'Inter', system-ui, sans-serif; padding: 9px 14px; border-radius: 100px; border: 1px solid #e4e4e7; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 7px; }
    .visora-toggle:hover { border-color: #d4d4d8; color: #18181b; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .visora-toggle.active { background: #18181b; color: #ffffff; border-color: #18181b; box-shadow: 0 4px 16px rgba(0,0,0,0.16); }
    .visora-toggle-dot { width: 7px; height: 7px; border-radius: 50%; background: #a1a1aa; transition: all 0.2s; }
    .visora-toggle.active .visora-toggle-dot { background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.6); }
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

  const toggleEl = document.createElement('button');
  toggleEl.className = 'visora-toggle';
  toggleEl.innerHTML = '<div class="visora-toggle-dot"></div> Visora Inspector';

  document.body.appendChild(highlightEl);
  document.body.appendChild(badgeEl);
  document.body.appendChild(toggleEl);

  let isVisoraActive = false;
  let currentTarget: HTMLElement | null = null;
  let panelEl: HTMLElement | null = null;
  let isSending = false;

  toggleEl.addEventListener('click', () => {
    isVisoraActive = !isVisoraActive;
    if (isVisoraActive) {
      toggleEl.classList.add('active');
    } else {
      toggleEl.classList.remove('active');
      closePanel();
      highlightEl.style.display = 'none';
      badgeEl.style.display = 'none';
      currentTarget = null;
    }
  });

  function getReactFiberSource(el: HTMLElement): string | null {
    // Find the property that starts with __reactFiber$
    const fiberKey = Object.keys(el).find(key => key.startsWith('__reactFiber$'));
    if (!fiberKey) return null;
    
    let fiber = (el as any)[fiberKey];
    
    // Traverse up the fiber tree until we find a component with source code
    while (fiber) {
      if (fiber._debugSource && fiber._debugSource.fileName) {
        let componentName = 'Component';
        if (fiber.type && typeof fiber.type === 'function' && fiber.type.name) {
          componentName = fiber.type.name;
        } else if (fiber.elementType && typeof fiber.elementType === 'function' && fiber.elementType.name) {
          componentName = fiber.elementType.name;
        }
        return `${fiber._debugSource.fileName}:${fiber._debugSource.lineNumber}:${componentName}`;
      }
      fiber = fiber.return;
    }
    return null;
  }

  function getVueSource(el: HTMLElement): string | null {
    // In Vue 3 development mode, elements have __vueParentComponent or __vnode attached
    const instance = (el as any).__vueParentComponent || (el as any).__vnode?.ctx;
    if (!instance) return null;

    let comp = instance;
    while (comp) {
      if (comp.type && comp.type.__file) {
        const name = comp.type.name || comp.type.__name || 'Component';
        return `${comp.type.__file}:1:${name}`;
      }
      comp = comp.parent;
    }
    return null;
  }

  function findSourceEl(el: Element | null): { element: HTMLElement, src: string } | null {
    while (el && el !== document.body) {
      if (el instanceof HTMLElement) {
        // 1. Try Vite AST Plugin Injection
        const attr = el.getAttribute('data-visora-src');
        if (attr) return { element: el, src: attr };
        
        // 2. Try Universal React Fiber Extraction (Next.js, CRA, Turbopack)
        const fiberSrc = getReactFiberSource(el);
        if (fiberSrc) return { element: el, src: fiberSrc };

        // 3. Try Universal Vue 3 / Nuxt 3 Extraction
        const vueSrc = getVueSource(el);
        if (vueSrc) return { element: el, src: vueSrc };
      }
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
    const displayName = fiberData?.componentName ? `<${fiberData.componentName}> — ${vsrc}` : vsrc;

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
            } catch { }
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
          if (state.queue) hooks.push(`useState_${i}`);
          else if (state.deps !== undefined) hooks.push(`useEffect_${i}`);
          else hooks.push(`hook_${i}`);
          state = state.next;
          i++;
        }
      }
    } catch { }

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

    const sourceData = findSourceEl(el);
    const vsrc = sourceData ? sourceData.src : '';
    const [sourceFile, sourceLine] = vsrc.split(':');
    const fiber = extractFiberData(el);

    let boundingRect = null;
    try {
      const r = el.getBoundingClientRect();
      boundingRect = { x: r.x, y: r.y, width: r.width, height: r.height };
    } catch { }

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
    t.className = `visora-toast visora-toast-${type}`;
    t.innerHTML = `${type === 'success' ? '✓' : '✗'} ${msg}`;
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
    const sourceData = findSourceEl(el);
    const vsrc = sourceData ? sourceData.src : '';
    const fiber = extractFiberData(el);
    const compDisplay = fiber?.componentName ? `<strong>&lt;${fiber.componentName}&gt;</strong>` : `<strong>${el.tagName.toLowerCase()}</strong>`;

    panelEl = document.createElement('div');
    panelEl.className = 'visora-panel';

    let panelLeft = r.right + 12;
    let panelTop = r.top;
    if (panelLeft + 370 > window.innerWidth) panelLeft = r.left - 372;
    if (panelLeft < 10) { panelLeft = Math.min(r.left, window.innerWidth - 380); panelTop = r.bottom + 12; }
    panelTop = Math.max(10, Math.min(panelTop, window.innerHeight - 280));

    panelEl.style.left = panelLeft + 'px';
    panelEl.style.top = panelTop + 'px';

    const propsInfo = fiber?.props && Object.keys(fiber.props).length > 0 ? `<br>Props: ${Object.keys(fiber.props).join(', ')}` : '';

    panelEl.innerHTML = `
      <div class="visora-loading-bar" id="visora-loading-bar"></div>
      <div class="visora-panel-header">
        <div class="visora-panel-logo">V</div>
        <span class="visora-panel-title">Visora</span>
        <button class="visora-panel-close" data-action="close" title="Close (Esc)">✕</button>
      </div>
      <div class="visora-panel-info">${compDisplay}<br>📁 ${vsrc}${propsInfo}</div>
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
        const loadingBar = panelEl?.querySelector('#visora-loading-bar') as HTMLElement;
        if (sendBtn) { sendBtn.disabled = true; sendBtn.innerHTML = '<span class="visora-spinner"></span> Sending...'; }
        if (loadingBar) { loadingBar.style.display = 'block'; }

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
          else showToast(`Server error (${res.status})`, 'error');
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
    if (!isVisoraActive || panelEl) return;
    const sourceData = findSourceEl(e.target as Element);
    if (sourceData) { 
        currentTarget = sourceData.element; 
        positionHighlight(currentTarget); 
    }
    else { highlightEl.style.display = 'none'; badgeEl.style.display = 'none'; currentTarget = null; }
  });

  document.addEventListener('click', (e: MouseEvent) => {
    if (!isVisoraActive || !e.altKey) return;
    const elData = findSourceEl(e.target as Element);
    if (!elData) return;
    e.preventDefault(); e.stopPropagation();
    openPanel(elData.element);
  }, true);

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') closePanel();
  });

  window.addEventListener('scroll', () => {
    if (!isVisoraActive) return;
    if (currentTarget) {
      positionHighlight(currentTarget);
      if (panelEl) {
        const r = currentTarget.getBoundingClientRect();
        let panelLeft = r.right + 12;
        let panelTop = r.top;
        if (panelLeft + 370 > window.innerWidth) panelLeft = r.left - 372;
        if (panelLeft < 10) { panelLeft = Math.min(r.left, window.innerWidth - 380); panelTop = r.bottom + 12; }
        panelTop = Math.max(10, Math.min(panelTop, window.innerHeight - 280));
        panelEl.style.left = panelLeft + 'px';
        panelEl.style.top = panelTop + 'px';
      }
    }
  }, true); // Use capture phase to catch scrolls on any overflow container

  console.log('%c🔮 Visora%c overlay loaded — Alt+Click any element to edit it with AI', 'color: #3b82f6; font-weight: bold; font-size: 13px;', 'color: #94a3b8; font-size: 12px;');
})();
