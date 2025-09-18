// pages/_app.js

import { generateGlobalCssVariables } from '@/utils/theme-style-utils';
import { useEffect, useState } from 'react';
import '../css/main.css';
import { DM_Mono, Azeret_Mono } from 'next/font/google';

// Font config (same as your original)
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono'
});

const azeretMono = Azeret_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-azeret-mono'
});

// Minimal idle helpers
function runWhenIdle(cb, opts = {}) {
  if (typeof window === 'undefined') return undefined;
  const timeout = typeof opts.timeout === 'number' ? opts.timeout : 2000;
  if ('requestIdleCallback' in window) {
    try {
      return window.requestIdleCallback(cb, { timeout });
    } catch (e) {
      // fall through to timeout fallback
    }
  }
  return window.setTimeout(cb, Math.min(timeout, 2000));
}

function cancelIdle(id) {
  if (typeof window === 'undefined' || id == null) return;
  if ('cancelIdleCallback' in window) {
    try {
      window.cancelIdleCallback(id);
      return;
    } catch (e) {
      // fallback
    }
  }
  clearTimeout(id);
}

function MyApp({ Component, pageProps }) {
  const { global, ...page } = pageProps || {};
  const { theme } = global || {};
  const [isMounted, setIsMounted] = useState(false);

  const cssVars = generateGlobalCssVariables(theme);

  useEffect(() => {
    setIsMounted(true);
    try {
      document.body.setAttribute('data-theme', page.colors || 'colors-a');
    } catch (e) {
      // ignore if DOM not available
    }

    // Expose small helpers once
    if (typeof window !== 'undefined') {
      if (!window.runWhenIdle) window.runWhenIdle = runWhenIdle;
      if (!window.cancelIdle) window.cancelIdle = cancelIdle;
      if (!window.deferImport) {
        window.deferImport = function (importFn, opts = {}) {
          return new Promise((resolve, reject) => {
            try {
              window.runWhenIdle(() => {
                importFn()
                  .then(resolve)
                  .catch(reject);
              }, opts);
            } catch (err) {
              // fallback: try immediate import
              importFn().then(resolve).catch(reject);
            }
          });
        };
      }
    }

    // intentionally no cleanup: keep helpers available across SPA navigations
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`${dmMono.variable} ${azeretMono.variable} font-sans`}>
      <style jsx global>{`
        :root {
          ${cssVars}
        }
      `}</style>
      {isMounted ? <Component {...pageProps} /> : null}
    </div>
  );
}

export default MyApp;
