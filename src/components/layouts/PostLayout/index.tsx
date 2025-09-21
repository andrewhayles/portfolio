import classNames from 'classnames';
import dayjs from 'dayjs';
import Markdown from 'markdown-to-jsx';
import * as React from 'react';

import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps, PostLayout } from '@/types';
import { highlightCode } from '@/utils/shiki';
import BaseLayout from '../BaseLayout';


function PostMedia({ media }: { media: any }) {
    return <DynamicComponent {...media} className={classNames({ 'w-full': media.type === 'ImageBlock' })} />;
}


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
                            overrides: { 
                                pre: { 
                                    component: PreHighlight, 
                                    props: { 'data-sb-field-path': '.markdownContent' } 
                                } 
                            },
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
	'data-sb-field-path'?: string;
};

const PreHighlight: React.FC<PreProps> = ({ children, 'data-sb-field-path': fieldPath, ...rest }) => {
    const codeProps = (children as React.ReactElement)?.props as { children?: React.ReactNode, highlightedCode?: string };
    const highlightedHtml = codeProps?.highlightedCode;
    const rawCode = codeProps?.children;

    if (highlightedHtml) {
        return <div data-sb-field-path={fieldPath} dangerouslySetInnerHTML={{ __html: highlightedHtml }} />;
    }

    return (
        <pre {...rest} data-sb-field-path={fieldPath}>
            <code>{rawCode}</code>
        </pre>
    );
}