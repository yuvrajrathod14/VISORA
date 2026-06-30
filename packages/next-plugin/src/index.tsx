'use client';

import React, { useEffect } from 'react';
// We will auto-generate this file during build to contain the massive overlay script
import { OVERLAY_SCRIPT } from './overlay-script';

export function VisoraTracker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Only inject once
    if (document.getElementById('visora-overlay-script')) return;

    const script = document.createElement('script');
    script.id = 'visora-overlay-script';
    script.type = 'text/javascript';
    script.innerHTML = OVERLAY_SCRIPT;
    document.head.appendChild(script);
    
  }, []);

  return null;
}
