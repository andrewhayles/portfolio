import classNames from 'classnames';
import dayjs from 'dayjs';
import Markdown from 'markdown-to-jsx';
import * as React from 'react';

import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps, PostLayout } from '@/types';
import { highlightCode } from '@/utils/shiki';
import BaseLayout from '../BaseLayout';

type ComponentProps = PageComponentProps & PostLayout;

const Component: React.FC<ComponentProps> = (props) => {
    const { title, date, author, markdownContent, media, bottomSections = [] } = props;
    const dateTimeAttr = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    const formattedDate = dayjs(date).format('YYYY-MM-DD');

    return (
        <BaseLayout {...props}>
            <article className="px-4 py-14 lg:py-20">
                <header className="max-w-5xl mx-auto mb-10 sm:mb-14">
                    <div className="mb-6 uppercase">
                        <time dateTime={dateTimeAttr}>{formattedDate}</time>
                        {author && (
                            <>
                                {' | '}
                                {author.firstName} {author.lastName}
                            </>
                        )}
                    </div>
                    <h1 className="text-5xl sm:text-6xl">{title}</h1>
                </header>
                {media && (
                    <figure className="max-w-5xl mx-auto mb-10 sm:mb-14">
                        <PostMedia media={media} />
                    </figure>
                )}
                {markdownContent && (
                    <Markdown
                        options={{
                            forceBlock: true,
                            // NOTE: use the component override shape expected by markdown-to-jsx
                            overrides: { pre: { component: PreHighlight } },
                        }}
                        className="max-w-3xl mx-auto prose sm:prose-lg"
                    >
                        {markdownContent}
                    </Markdown>
                )}
            </article>
            {bottomSections?.map((section, index) => {
                return <DynamicComponent key={index} {...section} />;
            })}
        </BaseLayout>
    );
};
export default Component;

/**
 * PreHighlight
 *
 * A wrapper component that accepts the same props markdown-to-jsx passes to a `pre` override.
 * It calls your async `highlightCode(code, lang)` and inserts the returned HTML.
 *
 * Note: This does client-side highlighting via useEffect. If you prefer server-side/build-time
 * highlighting (recommended for performance/SEO), use a remark/rehype plugin instead.
 */
type PreProps = React.HTMLAttributes<HTMLElement> & {
    children?: React.ReactNode;
    className?: string;
};

const PreHighlight: React.FC<PreProps> = ({ className = '', children, ...rest }) => {
    // Attempt to extract raw code text robustly from common markdown-to-jsx shapes:
    const code = React.useMemo(() => {
        if (typeof children === 'string') return children;
        if (Array.isArray(children)) return children.join('');
        if (React.isValidElement(children)) {
            const inner = (children.props as any)?.children;
            if (typeof inner === 'string') return inner;
            if (Array.isArray(inner)) return inner.join('');
        }
        return String(children ?? '');
    }, [children]);

    // className may be "language-js" or "lang-js"
    const langMatch = (className || '').match(/(?:lang|language)-?([a-zA-Z0-9-]+)/);
    const lang = langMatch ? langMatch[1] : 'text';

    const [html, setHtml] = React.useState<string | null>(null);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const highlighted = await highlightCode(code, lang);
                if (mounted) setHtml(highlighted);
            } catch (err) {
                // fallback to plain code if highlighting fails
                // keep console.error to aid debugging on CI/build logs or client console
                // (server builds won't run this effect; it runs on client.)
                // If you want build-time highlighting, convert to remark/rehype pipeline.
                // eslint-disable-next-line no-console
                console.error('highlightCode error', err);
                if (mounted) setHtml(null);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [code, lang]);

    if (!html) {
        // initial/fallback render (prevents SSR/client mismatch because we render plain code)
        return (
            <pre className={className} {...rest}>
                <code>{code}</code>
            </pre>
        );
    }

    // Insert highlighted HTML (assumed to be safe — your highlighter should produce sanitized markup)
    return (
        <pre className={className} {...rest}>
            <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
    );
};

function PostMedia({ media }: { media: any }) {
    return <DynamicComponent {...media} className={classNames({ 'w-full': media.type === 'ImageBlock' })} />;
}
