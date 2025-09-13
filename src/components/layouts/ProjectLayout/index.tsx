import classNames from 'classnames';
import dayjs from 'dayjs';
import Markdown from 'markdown-to-jsx';
import * as React from 'react';
import { useState } from 'react';

import { Annotated } from '@/components/Annotated';
import Link from '@/components/atoms/Link';
import { DynamicComponent } from '@/components/components-registry';
import ImageBlock from '@/components/molecules/ImageBlock';
import { PageComponentProps, ProjectLayout } from '@/types';
import { highlightCode } from '@/utils/shiki';
import HighlightedMarkdown from '@/utils/highlighted-markdown';
import BaseLayout from '../BaseLayout';

type Metadata = { urlPath?: string } | Record<string, any>;

type ComponentProps = PageComponentProps &
    ProjectLayout & {
        prevProject?: ProjectLayout;
        nextProject?: ProjectLayout;
        __metadata?: Metadata;
        bottomSections?: any[];
    };

const Component: React.FC<ComponentProps> = (props) => {
    const {
        title,
        description,
        markdownContent = '',
        highlightedCode,
        client,
        __metadata,
        prevProject,
        nextProject,
        bottomSections = [],
    } = props;

    const [isCodeVisible, setIsCodeVisible] = useState(false);
    const [codeContent, setCodeContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Date logic kept as requested (uses now if no date prop)
    const dateTimeAttr = dayjs(props.date ?? new Date()).format('YYYY-MM-DD HH:mm:ss');
    const formattedDate = dayjs(props.date ?? new Date()).format('YYYY-MM-DD');

    // Fetch code on demand
    const handleShowCodeClick = async () => {
        try {
            setIsLoading(true);

            // prefer slug from metadata, fallback to URL path or undefined
            const urlPath: string | undefined =
                (__metadata && (typeof __metadata === 'object' ? __metadata.urlPath : undefined)) ||
                (typeof window !== 'undefined' ? window.location.pathname : undefined);

            if (!urlPath) {
                throw new Error('Cannot determine slug/urlPath for code fetch');
            }

            const slug = String(urlPath).split('/').filter(Boolean).pop();
            if (!slug) throw new Error('Could not extract slug from urlPath');

            const res = await fetch(`/api/code/${encodeURIComponent(slug)}`);
            if (!res.ok) {
                throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            setCodeContent(String(data?.code ?? ''));
            setIsCodeVisible(true);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch code for project:', err);
            // Keep UI usable: open the code block but show failure message
            setCodeContent('// failed to load code — see console for details');
            setIsCodeVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    // split markdown at marker [CODE_HERE]; graceful fallback if marker missing
    const [mdBefore, mdAfter] = React.useMemo(() => {
        if (!markdownContent) return ['', ''];
        const parts = markdownContent.split('[CODE_HERE]');
        return [parts[0] ?? '', parts.slice(1).join('[CODE_HERE]') ?? ''];
    }, [markdownContent]);

    return (
        <BaseLayout {...props}>
            <article className="px-4 py-14 lg:py-20">
                <header className="max-w-5xl mx-auto mb-10 sm:mb-14">
                    {client && <div className="text-lg uppercase md:mb-6">{client}</div>}
                    <div className="flex flex-col gap-6 md:flex-row md:justify-between">
                        <time className="text-lg md:order-last" dateTime={dateTimeAttr}>
                            {formattedDate}
                        </time>
                        <h1 className="text-5xl sm:text-6xl md:max-w-2xl md:grow">{title}</h1>
                    </div>
                </header>

                <div className="max-w-3xl mx-auto prose sm:prose-lg">
                    <Markdown options={{ forceBlock: true, overrides: { pre: { component: PreHighlight } } }}>
                        {mdBefore}
                    </Markdown>

                    {/* Code area (fetched on demand) */}
                    {isCodeVisible ? (
                        <div className="my-8">
                            {/* Use your existing HighlightedMarkdown utility to render the fetched code.
                                If you know the language for the fetched code, pass it as the `language` prop.
                                Here we default to 'javascript' but you can adjust as needed. */}
                            <HighlightedMarkdown language="javascript">{codeContent}</HighlightedMarkdown>
                        </div>
                    ) : (
                        <p className="text-lg">
                            {"If you&rsquo;d like to view the code for this project, "}
                            <button
                                onClick={handleShowCodeClick}
                                disabled={isLoading}
                                className="text-blue-500 hover:underline focus:outline-none"
                            >
                                {isLoading ? 'loading...' : 'please click here'}
                            </button>
                            .
                        </p>
                    )}

                    <Markdown options={{ forceBlock: true, overrides: { pre: { component: PreHighlight } } }}>
                        {mdAfter}
                    </Markdown>

                    {/* Optional pre-highlighted HTML passed in the `highlightedCode` prop */}
                    {highlightedCode && (
                        <div className="mt-8">
                            {isCodeVisible ? (
                                // If code area is already visible we prefer the fetched codeContent above;
                                // but if you prefer to render highlightedCode as well, you can adjust.
                                <div
                                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                                    aria-hidden
                                />
                            ) : (
                                <p className="text-lg">
                                    {"If you&rsquo;d like to view the code for this project, "}
                                    <button
                                        onClick={() => setIsCodeVisible(true)}
                                        className="text-blue-500 hover:underline focus:outline-none"
                                    >
                                        please click here
                                    </button>
                                    .
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {(prevProject || nextProject) && (
                    <nav className="px-4 mt-12 mb-20">
                        <div className="grid max-w-5xl mx-auto gap-x-6 gap-y-12 sm:grid-cols-2 lg:gap-x-8">
                            {prevProject && <ProjectNavItem project={prevProject} />}
                            {nextProject && <ProjectNavItem project={nextProject} className="sm:items-end sm:col-start-2" />}
                        </div>
                    </nav>
                )}

                {bottomSections?.map((section, index) => {
                    return <DynamicComponent key={index} {...section} />;
                })}
            </article>
        </BaseLayout>
    );
};
export default Component;

/**
 * PreHighlight
 *
 * A markdown-to-jsx override component for `<pre>` blocks.
 * It extracts inner code text and (if present) the language from className like "language-js" or "lang-js",
 * and then renders your HighlightedMarkdown component (which should handle producing highlighted HTML).
 *
 * This avoids passing a raw async function as an override and keeps TypeScript happy.
 */
type PreProps = React.HTMLAttributes<HTMLElement> & {
    children?: React.ReactNode;
    className?: string;
};

const PreHighlight: React.FC<PreProps> = ({ className = '', children, ...rest }) => {
    const code = React.useMemo(() => {
        // markdown-to-jsx often passes: <pre class="lang-js"><code>...</code></pre>
        if (typeof children === 'string') return children;
        if (Array.isArray(children)) return children.join('');
        if (React.isValidElement(children)) {
            const inner = (children.props as any)?.children;
            if (typeof inner === 'string') return inner;
            if (Array.isArray(inner)) return inner.join('');
        }
        return String(children ?? '');
    }, [children]);

    const langMatch = (className || '').match(/(?:lang|language)-?([a-zA-Z0-9-]+)/);
    const lang = langMatch ? langMatch[1] : 'text';

    // You can choose to perform client-side async highlighting here using highlightCode,
    // or delegate to your HighlightedMarkdown utility which might already do server-side rendering.
    // We'll use HighlightedMarkdown directly.
    return (
        <div {...rest}>
            <HighlightedMarkdown language={lang}>{code}</HighlightedMarkdown>
        </div>
    );
};

function ProjectMedia({ media }: { media: any }) {
    return <DynamicComponent {...media} className={classNames({ 'w-full': media.type === 'ImageBlock' })} />;
}

function ProjectNavItem({ project, className }: { project: ProjectLayout; className?: string }) {
    return (
        <Annotated content={p
