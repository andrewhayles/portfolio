// pages/_app.js

import Head from 'next/head'; // Import the Head component
import { generateGlobalCssVariables } from '@/utils/theme-style-utils';
import { useEffect, useState } from 'react';
import '../css/main.css';
import { DM_Mono, Azeret_Mono } from 'next/font/google';

// --- FONT OPTIMIZATION ---
// Added 'display: optional' to prevent font-related layout shift (CLS)
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono',
  display: 'optional',
});

const azeretMono = Azeret_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-azeret-mono',
  display: 'optional',
});


// All of your idle helper functions remain unchanged
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

function createLoadScriptLazy(runWhenIdleFn) {
  return function loadScriptLazy(src, opts = {}) {
    if (typeof window === 'undefined') return Promise.reject(new Error('window is undefined'));
    if (!src) return Promise.reject(new Error('script src required'));

    const { id, async = true, defer = true, attrs = {}, timeout } = opts;

    if (id) {
      const existing = document.getElementById(id);
      if (existing) {
        if (existing.getAttribute('data-loaded') === 'true') {
          return Promise.resolve();
        }
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
          Object.keys(attrs || {}).forEach((k) => {
            try {
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
          (document.body || document.head || document.documentElement).appendChild(s);
        } catch (e) {
          reject(e);
        }
      };

      if (typeof runWhenIdleFn === 'function') {
        try {
          runWhenIdleFn(doInsert, { timeout });
        } catch (e) {
          setTimeout(doInsert, 0);
        }
      } else {
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
      // ignore
    }

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
              importFn().then(resolve).catch(reject);
            }
          });
        };
      }
      if (!window.loadScriptLazy) {
        window.loadScriptLazy = createLoadScriptLazy(window.runWhenIdle);
      }
    }
  }, []);

  return (
    <div className={`${dmMono.variable} ${azeretMono.variable} font-sans`}>
      {/* --- PRELOAD THE FONT --- */}
      {/* This tells the browser to download the heading font with high priority */}
      <Head>
        <link
          rel="preload"
          href="/fonts/AzeretMono-VariableFont_wght.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </Head>
      
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