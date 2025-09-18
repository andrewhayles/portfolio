// src/components/sections/ContactSection/index.tsx
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import dynamic from 'next/dynamic';

import { DynamicComponent } from '@/components/components-registry';
// FormBlock is now dynamically imported to avoid bundling it into the initial client bundle
const FormBlockLazy = dynamic(() => import('@/components/molecules/FormBlock'), {
  ssr: false,
  loading: () => null
});

import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import Section from '../Section';

export default function ContactSection(props) {
  const { elementId, colors, backgroundSize, title, text, form, media, styles = {} } = props;
  const sectionAlign = styles.self?.textAlign ?? 'left';

  // track whether the user explicitly requested the form (click) or it entered viewport
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLElement | null>(null);

  // for lazy-mounting media
  const [showMedia, setShowMedia] = useState(false);
  const mediaRef = useRef<HTMLDivElement | null>(null);

  // local in-view hook usage
  useInView(formRef, () => {
    // when the form container becomes visible, mount the form
    setShowForm(true);
  });

  useInView(mediaRef, () => {
    setShowMedia(true);
  });

  // also allow quick user-trigger to load the form (fast path)
  function handleShowForm() {
    setShowForm(true);
    // scroll into view if desired (optional)
    try {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {}
  }

  return (
    <Section elementId={elementId} colors={colors} backgroundSize={backgroundSize} styles={styles.self}>
      <div className={classNames('flex gap-8', mapFlexDirectionStyles(styles.self?.flexDirection ?? 'row'))}>
        <div className="flex-1 w-full">
          {title && (
            <h2 className={classNames('text-4xl sm:text-5xl', mapStyles({ textAlign: sectionAlign }))}>
              {title}
            </h2>
          )}

          {text && (
            <Markdown
              options={{ forceBlock: true, forceWrapper: true }}
              className={classNames(
                'max-w-none prose sm:prose-lg',
                mapStyles({ textAlign: sectionAlign }),
                {
                  'mt-4': title
                }
              )}
            >
              {text}
            </Markdown>
          )}

          {/* Form area: placeholder button (quick) + viewport-triggered mount */}
          <div ref={(el) => (formRef.current = el)}>
            {!showForm ? (
              <div className={classNames({ 'mt-12': title || text })}>
                <button
                  onClick={handleShowForm}
                  className="inline-block px-4 py-2 rounded border"
                  aria-expanded="false"
                >
                  Contact us
                </button>
              </div>
            ) : (
              <div className={classNames({ 'mt-12': title || text })}>
                {/* now mount the (lazy) FormBlock */}
                <FormBlockLazy {...form} />
              </div>
            )}
          </div>
        </div>

        {media && (
          <div
            ref={(el) => (mediaRef.current = el)}
            className={classNames('flex flex-1 w-full', {
              'justify-center': sectionAlign === 'center',
              'justify-end': sectionAlign === 'right'
            })}
          >
            {/* only mount the heavy media component when in view */}
            {showMedia ? <ContactMedia media={media} /> : null}
          </div>
        )}
      </div>
    </Section>
  );
}

function ContactMedia({ media }) {
  return <DynamicComponent {...media} />;
}

/**
 * Small hook: calls callback once when the given ref's element intersects viewport.
 * Uses IntersectionObserver if available, otherwise triggers immediately (safe fallback).
 */
function useInView<T extends HTMLElement = HTMLElement>(ref: { current: T | null }, cb: () => void, options = { rootMargin: '200px' }) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver is unsupported, behave conservatively and trigger mount
    if (!('IntersectionObserver' in window)) {
      cb();
      return;
    }

    let didTrigger = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !didTrigger) {
            didTrigger = true;
            cb();
            io.disconnect();
          }
        });
      },
      { rootMargin: options.rootMargin }
    );

    io.observe(el);
    return () => {
      try {
        io.disconnect();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current]);
}

function mapFlexDirectionStyles(flexDirection?: 'row' | 'row-reverse' | 'col' | 'col-reverse') {
  switch (flexDirection) {
    case 'row-reverse':
      return 'flex-col-reverse lg:flex-row-reverse lg:items-center';
    case 'col':
      return 'flex-col';
    case 'col-reverse':
      return 'flex-col-reverse';
    default:
      return 'flex-col lg:flex-row lg:items-center';
  }
}
