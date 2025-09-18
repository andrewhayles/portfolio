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

// Minimal idle helpers (no-op on server)
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

/**
 * Create and append a <script> element lazily (when browser is idle or immediately on demand).
 *
 * Usage:
 *   // lazy-load an external lib when idle:
 *   window.loadScriptLazy && window.loadScriptLazy('https://example.com/widget.js', { id: 'widget', async: true })
 *     .then(() => { /* loaded *\/ })
 *     .catch(() => { /* failed to load *\/ });
 *
 * Options:
 *  - id: optional id attribute for the script element (prevents double-insert)
 *  - async: boolean (default true)
 *  - defer: boolean (default true)
 *  - attrs: object of additional attributes to set on the script element
 *  - timeout: number (ms) passed to runWhenIdle as timeout
 *
 * Returns: Promise that resolves on script load, rejects on error.
 */
function createLoadScriptLazy(runWhenIdleFn) {
  return function loadScriptLazy(src, opts = {}) {
    if (typeof window === 'undefined') return Promise.reject(new Error('window is undefined'));
    if (!src) return Promise.reject(new Error('script src required'));

    const { id, async = true, defer = true, attrs = {}, timeout } = opts;

    // If id provided and element already exists, resolve immediately (or wait for it to load)
    if (id) {
      const existing = document.getElementById(id);
      if (existing) {
        // If the script tag already finished loading, resolve immediately
        // --- FIX IS HERE: Removed "as HTMLScriptElement" ---
        if (existing.getAttribute('data-loaded') === 'true') {
          return Promise.resolve();
        }
        // --------------------------------------------------
        // Otherwise attach to load/error (rare)
        return new Promise((resolve, reject) => {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', () => reject(new Error('failed to load script')), { once: true });
        });
      }
    }

    return new Promise((resolve, reject) => {
      const doInsert = () => {
        try {
          const s = document.createElement('script');
          s.src = src;
          if (id) s.id = id;
          if (async) s.async = true;
          if (defer) s.defer = true;
          // allow passing other attributes (crossorigin, type, etc.)
          Object.keys(attrs || {}).forEach((k) => {
            try {
              // @ts-ignore
              s.setAttribute(k, String(attrs[k]));
            } catch (e) {}
          });
          s.addEventListener(
            'load',
            () => {
              try {
                s.setAttribute('data-loaded', 'true');
              } catch (e) {}
              resolve();
            },
            { once: true }
          );
          s.addEventListener(
            'error',
            () => {
              reject(new Error('failed to load script'));
            },
            { once: true }
          );
          // append to body so it doesn't block head parsing
          (document.body || document.head || document.documentElement).appendChild(s);
        } catch (e) {
          reject(e);
        }
      };

      if (typeof runWhenIdleFn === 'function') {
        try {
          runWhenIdleFn(doInsert, { timeout });
        } catch (e) {
          // fallback to immediate insert
          setTimeout(doInsert, 0);
        }
      } else {
        // immediate fallback
        setTimeout(doInsert, 0);
      }
    });
  };
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

    // Expose small helpers once on window (idempotent)
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

      // Expose the lazy script loader (behaves like Next's lazyOnload — waits for idle)
      if (!window.loadScriptLazy) {
        window.loadScriptLazy = createLoadScriptLazy(window.runWhenIdle);
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
