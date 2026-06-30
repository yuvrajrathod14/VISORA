import * as htmlToImage from 'html-to-image';

/**
 * Visora Browser Overlay
 * Premium visual component inspector with inline AI chat.
 * Injected into the browser by the Vite plugin (dev-only).
 */
(function visoraOverlay() {
  if ((window as any).__VISORA_INJECTED) return;
  (window as any).__VISORA_INJECTED = true;

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* ── Selection Highlight ── */
    .visora-highlight {
      position: fixed; pointer-events: none; z-index: 999997;
      border: 1px solid rgba(59, 130, 246, 0.6);
      background: rgba(59, 130, 246, 0.08);
      border-radius: 8px;
      transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.15), inset 0 0 10px rgba(59, 130, 246, 0.1);
    }
    .visora-highlight.visora-selected {
      border: 1.5px solid #3b82f6;
      background: rgba(59, 130, 246, 0.15);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    /* ── Hover Badge ── */
    .visora-badge {
      position: fixed; pointer-events: none; z-index: 999998;
      background: rgba(15, 17, 26, 0.85);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e4e4e7; font: 500 11px/1.4 'Inter', system-ui, sans-serif;
      padding: 4px 10px; border-radius: 6px;
      transform: translateY(-100%); margin-top: -6px;
      white-space: nowrap; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      letter-spacing: 0.02em; max-width: 400px; overflow: hidden; text-overflow: ellipsis;
    }

    /* ── Panel (Instruction Modal) ── */
    .visora-panel {
      position: fixed; z-index: 1000000; width: 400px;
      background: rgba(15, 17, 26, 0.75);
      backdrop-filter: blur(32px) saturate(150%); -webkit-backdrop-filter: blur(32px) saturate(150%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 0;
      box-shadow: 0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
      font-family: 'Inter', system-ui, sans-serif; color: #e4e4e7;
      animation: visora-panel-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    @keyframes visora-panel-in {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .visora-loading-bar { position: absolute; top: 0; left: 0; height: 2px; width: 100%; background: rgba(255,255,255,0.05); overflow: hidden; display: none; }
    .visora-loading-bar::after { content: ''; position: absolute; top: 0; left: 0; height: 100%; width: 40%; background: linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, transparent); animation: visora-loading 1.2s infinite ease-in-out; }
    @keyframes visora-loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }

    .visora-panel-header { display: flex; align-items: center; gap: 12px; padding: 20px 24px 0 24px; }
    .visora-panel-logo { width: 28px; height: 28px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 1px 1px rgba(255,255,255,0.4); }
    .visora-panel-logo svg { width: 15px; height: 15px; color: white; }
    .visora-panel-title { font-size: 15px; font-weight: 600; color: #fff; letter-spacing: -0.01em; }
    .visora-panel-close { margin-left: auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); color: #a1a1aa; cursor: pointer; width: 28px; height: 28px; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 0; }
    .visora-panel-close svg { width: 14px; height: 14px; }
    .visora-panel-close:hover { background: rgba(255,255,255,0.1); color: #fff; transform: scale(1.05); }
    .visora-panel-close:active { transform: scale(0.95); }

    .visora-panel-info { margin: 16px 24px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; padding: 12px 14px; font-size: 12px; color: #a1a1aa; line-height: 1.5; word-break: break-all; }
    .visora-panel-info strong { color: #fff; font-weight: 600; }
    .visora-panel-info .info-file { color: #3b82f6; font-weight: 500; }

    .visora-panel-body { padding: 0 24px 24px 24px; }
    
    .visora-chat-box { position: relative; display: flex; flex-direction: column; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 4px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s; }
    .visora-chat-box:focus-within { border-color: rgba(59, 130, 246, 0.5); background: rgba(0,0,0,0.4); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(0,0,0,0.1); }
    
    .visora-panel textarea { width: 100%; box-sizing: border-box; min-height: 80px; max-height: 150px; resize: none; background: transparent; color: #fff; border: none; padding: 12px 14px; font: 400 14px/1.5 'Inter', system-ui, sans-serif; outline: none; }
    .visora-panel textarea::placeholder { color: #71717a; }
    
    .visora-panel-actions { display: flex; justify-content: flex-end; padding: 4px 8px 8px 8px; gap: 8px; }

    .visora-btn { cursor: pointer; border: none; border-radius: 10px; padding: 8px 16px; font: 500 13px/1 'Inter', system-ui, sans-serif; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); letter-spacing: 0.01em; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .visora-btn-primary { background: linear-gradient(135deg, #3b82f6, #4f46e5); color: #ffffff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3), inset 0 1px 1px rgba(255,255,255,0.2); text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
    .visora-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4), inset 0 1px 1px rgba(255,255,255,0.2); }
    .visora-btn-primary:active { transform: translateY(1px); box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); }
    .visora-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(50%); transform: none; box-shadow: none; }
    .visora-btn-secondary { background: transparent; color: #a1a1aa; padding: 8px 12px; }
    .visora-btn-secondary:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .visora-btn-secondary:active { transform: translateY(1px); }

    /* ── Toast ── */
    .visora-toast { position: fixed; bottom: 24px; right: 24px; z-index: 1000001; padding: 12px 18px; border-radius: 12px; font: 500 13px/1.4 'Inter', system-ui, sans-serif; box-shadow: 0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1); animation: visora-toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; align-items: center; gap: 10px; color: white; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
    .visora-toast-success { background: rgba(15, 17, 26, 0.8); border-top: 1px solid rgba(34, 197, 94, 0.3); border-bottom: 1px solid rgba(34, 197, 94, 0.1); }
    .visora-toast-error { background: rgba(15, 17, 26, 0.8); border-top: 1px solid rgba(239, 68, 68, 0.3); }
    @keyframes visora-toast-in { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

    .visora-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: visora-spin 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite; display: inline-block; }
    @keyframes visora-spin { to { transform: rotate(360deg); } }

    /* ── Toggle Button ── */
    .visora-toggle { position: fixed; bottom: 24px; right: 24px; z-index: 999990; background: rgba(15, 17, 26, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #a1a1aa; font: 600 12px/1 'Inter', system-ui, sans-serif; padding: 10px 16px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 16px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 8px; }
    .visora-toggle:hover { border-color: rgba(255,255,255,0.2); color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.3); transform: translateY(-2px); }
    .visora-toggle.active { background: rgba(15, 17, 26, 0.85); color: #ffffff; border-color: rgba(59, 130, 246, 0.4); box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2); }
    .visora-toggle-dot { width: 8px; height: 8px; border-radius: 50%; background: #52525b; transition: all 0.3s; }
    .visora-toggle.active .visora-toggle-dot { background: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'visora-overlay-styles';
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  const toggleEl = document.createElement('button');
  toggleEl.className = 'visora-toggle';
  toggleEl.innerHTML = '<div class="visora-toggle-dot"></div> Visora Inspector';

  document.body.appendChild(toggleEl);

  let isVisoraActive = false;
  let hoveredTarget: HTMLElement | null = null;
  let selectedEls: HTMLElement[] = [];
  let highlightElements: { box: HTMLElement, badge: HTMLElement }[] = [];
  let panelEl: HTMLElement | null = null;
  let isSending = false;

  toggleEl.addEventListener('click', () => {
    isVisoraActive = !isVisoraActive;
    if (isVisoraActive) {
      toggleEl.classList.add('active');
    } else {
      toggleEl.classList.remove('active');
      closePanel();
      hoveredTarget = null;
      renderHighlights();
    }
  });

  function getReactFiberSource(el: HTMLElement): string | null {
    // Find the property that starts with __reactFiber$
    const fiberKey = Object.keys(el).find(key => key.startsWith('__reactFiber$'));
    if (!fiberKey) return null;

    let fiber = (el as any)[fiberKey];

    // Traverse up the fiber tree until we find a component with source code
    while (fiber) {
      // Best case: _debugSource is available (Babel/Vite dev builds)
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

    // Fallback for Next.js SWC builds where _debugSource is not available:
    // Walk up the fiber tree and find the nearest named function component
    fiber = (el as any)[fiberKey];
    while (fiber) {
      if (fiber.type && typeof fiber.type === 'function' && fiber.type.name) {
        const name = fiber.type.name;
        // Skip React internals and very short generic names
        if (name.length > 1 && name[0] === name[0].toUpperCase() && !['Fragment', 'Suspense', 'StrictMode', 'Profiler'].includes(name)) {
          return `component:${name}:0:${name}`;
        }
      } else if (fiber.type && typeof fiber.type === 'object' && fiber.type.displayName) {
        return `component:${fiber.type.displayName}:0:${fiber.type.displayName}`;
      }
      fiber = fiber.return;
    }

    // Last resort: if this element has a React fiber at all, allow selection with a generic label
    return `element:${el.tagName.toLowerCase()}:0:UnknownComponent`;
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

  function renderHighlights(): void {
    // Determine the set of elements to highlight: selectedEls + hoveredTarget (if not already selected)
    const elementsToHighlight = [...selectedEls];
    if (hoveredTarget && !elementsToHighlight.includes(hoveredTarget)) {
      elementsToHighlight.push(hoveredTarget);
    }

    // Ensure we have enough highlight DOM elements
    while (highlightElements.length < elementsToHighlight.length) {
      const box = document.createElement('div');
      box.className = 'visora-highlight';

      const badge = document.createElement('div');
      badge.className = 'visora-badge';

      document.body.appendChild(box);
      document.body.appendChild(badge);
      highlightElements.push({ box, badge });
    }

    // Hide extras
    for (let i = elementsToHighlight.length; i < highlightElements.length; i++) {
      highlightElements[i].box.style.display = 'none';
      highlightElements[i].badge.style.display = 'none';
    }

    // Position active highlights
    elementsToHighlight.forEach((el, index) => {
      if (!el || !el.getBoundingClientRect) return;
      const isSelected = selectedEls.includes(el);
      const dom = highlightElements[index];
      if (!dom) return;
      const r = el.getBoundingClientRect();

      dom.box.style.display = 'block';
      dom.box.style.left = r.left - 2 + 'px';
      dom.box.style.top = r.top - 2 + 'px';
      dom.box.style.width = r.width + 4 + 'px';
      dom.box.style.height = r.height + 4 + 'px';

      if (isSelected) dom.box.classList.add('visora-selected');
      else dom.box.classList.remove('visora-selected');

      const sourceData = findSourceEl(el);
      const vsrc = sourceData ? sourceData.src : '';
      const fiberData = extractFiberData(el);
      const displayName = fiberData?.componentName ? `<${fiberData.componentName}> — ${vsrc}` : vsrc;

      dom.badge.style.display = 'block';
      dom.badge.style.left = r.left + 'px';
      dom.badge.style.top = Math.max(r.top, 20) + 'px';
      dom.badge.textContent = displayName;
    });
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
    // Next.js Pages Router
    if ((window as any).__NEXT_DATA__) return 'nextjs';
    // Next.js App Router (RSC) — check for __next div or __next_f script chunks
    if (document.getElementById('__next')) return 'nextjs';
    if (document.querySelector('script[src*="/_next/"]')) return 'nextjs';
    if (document.querySelector('script#__NEXT_DATA__')) return 'nextjs';
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

  function openPanel(): void {
    if (!selectedEls || selectedEls.length === 0) return;

    if (panelEl) {
      panelEl.remove();
      panelEl = null;
    }

    renderHighlights();

    // Position panel relative to the last selected element
    const lastEl = selectedEls[selectedEls.length - 1];
    if (!lastEl || typeof lastEl.getBoundingClientRect !== 'function') return;
    const r = lastEl.getBoundingClientRect();

    panelEl = document.createElement('div');
    panelEl.className = 'visora-panel';

    let panelLeft = r.right + 12;
    let panelTop = r.top;
    if (panelLeft + 370 > window.innerWidth) panelLeft = r.left - 372;
    if (panelLeft < 10) { panelLeft = Math.min(r.left, window.innerWidth - 380); panelTop = r.bottom + 12; }
    panelTop = Math.max(10, Math.min(panelTop, window.innerHeight - 280));

    panelEl.style.left = panelLeft + 'px';
    panelEl.style.top = panelTop + 'px';

    const count = selectedEls.length;
    const compDisplay = count === 1 ? '1 Component Selected' : `${count} Components Selected`;

    panelEl.innerHTML = `
      <div class="visora-loading-bar" id="visora-loading-bar"></div>
      <div class="visora-panel-header">
        <div class="visora-panel-logo">V</div>
        <span class="visora-panel-title">Visora</span>
        <button class="visora-panel-close" data-action="close" title="Close (Esc)">✕</button>
      </div>
      <div class="visora-panel-info"><strong>${compDisplay}</strong><br>Use Shift+Alt+Click to select multiple.</div>
      <div class="visora-panel-body">
        <div class="visora-chat-box">
          <textarea id="visora-prompt" placeholder="Describe the change...\ne.g. Make this button rounded with glassmorphism"></textarea>
          <div class="visora-panel-actions">
            <button class="visora-btn visora-btn-secondary" data-action="cancel">Cancel</button>
            <button class="visora-btn visora-btn-primary" data-action="send" id="visora-send-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              Patch
            </button>
          </div>
        </div>
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
          // Temporarily hide highlights to get a clean screenshot of the whole screen
          highlightElements.forEach(h => { h.box.style.display = 'none'; h.badge.style.display = 'none'; });
          panelEl!.style.display = 'none';

          const screenshotBase64 = await htmlToImage.toPng(document.body, { backgroundColor: '#0a0a0f' });

          panelEl!.style.display = 'block';
          renderHighlights();

          const selections = selectedEls.map(el => buildContext(el, instruction));
          const endpoint = detectFramework() === 'nextjs' ? '/api/visora' : '/@visora/context';

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selections, instruction, screenshotBase64 }),
          });

          if (res.ok || res.status === 204) showToast('Context sent! AI is processing...', 'success');
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
    selectedEls = [];
    isSending = false;
    renderHighlights();
  }

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isVisoraActive || panelEl) return;
    const sourceData = findSourceEl(e.target as Element);
    if (sourceData) {
      hoveredTarget = sourceData.element;
    }
    else { hoveredTarget = null; }
    renderHighlights();
  });

  document.addEventListener('click', (e: MouseEvent) => {
    // Only intercept if holding Alt
    if (!e.altKey) return;
    console.log('[Visora] Alt+Click detected on:', e.target);

    const elData = findSourceEl(e.target as Element);
    if (!elData) {
      console.warn('[Visora] Could not find source code for element');
      return;
    }
    console.log('[Visora] Source found:', elData.src);

    e.preventDefault();
    e.stopPropagation();

    // Auto-activate Visora if not already active
    if (!isVisoraActive) {
      isVisoraActive = true;
      const toggleBtn = document.querySelector('.visora-toggle');
      if (toggleBtn) toggleBtn.classList.add('active');
    }

    if (e.shiftKey) {
      // Toggle selection
      if (selectedEls.includes(elData.element)) {
        selectedEls = selectedEls.filter(el => el !== elData.element);
      } else {
        selectedEls.push(elData.element);
      }
    } else {
      // Replace selection
      selectedEls = [elData.element];
    }

    if (!panelEl) {
      openPanel();
    } else {
      // Update UI with new selection count
      const count = selectedEls.length;
      const infoEl = panelEl.querySelector('.visora-panel-info strong');
      if (infoEl) infoEl.textContent = count === 1 ? '1 Component Selected' : `${count} Components Selected`;
      renderHighlights();
    }
  }, true);

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') closePanel();
  });

  window.addEventListener('scroll', () => {
    if (!isVisoraActive) return;
    renderHighlights();
    if (panelEl && selectedEls.length > 0) {
      const lastEl = selectedEls[selectedEls.length - 1];
      if (!lastEl || typeof lastEl.getBoundingClientRect !== 'function') return;
      const r = lastEl.getBoundingClientRect();
      let panelLeft = r.right + 12;
      let panelTop = r.top;
      if (panelLeft + 370 > window.innerWidth) panelLeft = r.left - 372;
      if (panelLeft < 10) { panelLeft = Math.min(r.left, window.innerWidth - 380); panelTop = r.bottom + 12; }
      panelTop = Math.max(10, Math.min(panelTop, window.innerHeight - 280));
      panelEl.style.left = panelLeft + 'px';
      panelEl.style.top = panelTop + 'px';
    }
  }, true); // Use capture phase to catch scrolls on any overflow container

  console.log('%c🔮 Visora%c overlay loaded — Alt+Click any element to edit it with AI', 'color: #3b82f6; font-weight: bold; font-size: 13px;', 'color: #94a3b8; font-size: 12px;');
})();
