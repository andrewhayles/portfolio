// src/components/sections/Footer/index.tsx
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
// NOTE: markdown-to-jsx removed from top-level import to avoid shipping it in the initial bundle
import { Action } from '@/components/atoms';

/**
 * Footer: lazy-loads markdown renderer only when (a) copyrightText looks like it needs markdown
 * and (b) the footer is in/near the viewport. Otherwise renders a plain-text fallback.
 */

export default function Footer(props) {
  const { primaryLinks = [], contacts, copyrightText = '', styles = {} } = props;
  const footerWidth = styles.self?.width ?? 'narrow';

  // Track whether to render the markdown renderer
  const [MarkdownComp, setMarkdownComp] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Simple heuristic to detect if copyrightText contains markdown/HTML that needs the renderer.
  // If it's plain text (no '<' or '[' or '**' or '['), we just render it as plain text.
  const needsRenderer = /<[^>]+>|\[.+\]\(.+\)|\*\*|__|`/.test(copyrightText);

  useEffect(() => {
    if (!needsRenderer) return;

    const el = wrapperRef.current;
    if (!el) {
      // try to import right away as a fallback
      importMarkdown();
      return;
    }

    // If IntersectionObserver unsupported, just import immediately (conservative)
    if (!('IntersectionObserver' in window)) {
      importMarkdown();
      return;
    }

    let io: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            importMarkdown();
            if (io) {
              io.disconnect();
              io = null;
            }
            break;
          }
        }
      },
      {
        rootMargin: '300px'
      }
    );

    io.observe(el);

    return () => {
      try {
        if (io) io.disconnect();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsRenderer, wrapperRef.current]);

  async function importMarkdown() {
    if (MarkdownComp) return;
    try {
      // Prefer window.deferImport if your _app.js exposed it — it schedules the import for idle time.
      if (typeof window !== 'undefined' && (window as any).deferImport) {
        const mod = await (window as any).deferImport(() => import('markdown-to-jsx'), { timeout: 1500 });
        setMarkdownComp(() => mod.default || mod);
      } else {
        const mod = await import('markdown-to-jsx');
        setMarkdownComp(() => mod.default || mod);
      }
    } catch (e) {
      // If import fails, we just keep the plain-text fallback
      // eslint-disable-next-line no-console
      console.warn('Failed to load markdown renderer:', e);
    }
  }

  return (
    <footer
      className={classNames(
        'relative',
        styles.self?.padding ?? 'py-16 px-4',
        // keep min-height but avoid forcing big layout shifts; you can keep or remove this line:
        'min-h-[222px]'
      )}
    >
      <div
        className={classNames('border-t-2 border-current pt-8', {
          'max-w-7xl mx-auto': footerWidth === 'narrow',
          'max-w-8xl mx-auto': footerWidth === 'wide'
        })}
      >
        <div className="flex flex-col gap-x-12 gap-y-12 md:gap-y-32 md:flex-row md:flex-wrap md:justify-between">
          {primaryLinks.length > 0 && (
            <div className={classNames(contacts ? 'w-full' : 'md:mr-auto')}>
              <ul className="flex flex-wrap max-w-5xl text-lg gap-x-8 gap-y-2">
                {primaryLinks.map((link, index) => (
                  <li key={index}>
                    <Action {...link} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {contacts && <Contacts {...contacts} />}

          {/* Keep attribution if present */}
          {copyrightText && (
            <div
              ref={wrapperRef}
              className={classNames(primaryLinks.length > 0 || contacts ? 'md:self-end' : null)}
            >
              {needsRenderer && MarkdownComp ? (
                <MarkdownComp
                  options={{ forceInline: true, forceWrapper: true, wrapper: 'p' }}
                  className="tracking-widest prose-sm prose uppercase"
                >
                  {copyrightText}
                </MarkdownComp>
              ) : (
                // Plain text fallback (very cheap)
                <p className="tracking-widest prose-sm prose uppercase">{stripTags(copyrightText)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function Contacts(props) {
  const { phoneNumber, phoneAltText, email, emailAltText, address, addressAltText, elementId } = props;
  return (
    <div id={elementId || null} className="max-w-3xl prose sm:prose-lg">
      {phoneNumber && (
        <p>
          <a href={`tel:${phoneNumber}`} aria-label={phoneAltText}>
            {phoneNumber}
          </a>
        </p>
      )}
      {email && (
        <p>
          <a href={`mailto:${email}`} aria-label={emailAltText}>
            {email}
          </a>
        </p>
      )}
      {address && (
        <p>
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
            aria-label={addressAltText}
            target="_blank"
            rel="noopener noreferrer"
          >
            {address}
          </a>
        </p>
      )}
    </div>
  );
}

// Utility: simple tag stripper for the plain-text fallback
function stripTags(input = '') {
  try {
    return String(input).replace(/<[^>]*>/g, '');
  } catch (e) {
    return input;
  }
}
