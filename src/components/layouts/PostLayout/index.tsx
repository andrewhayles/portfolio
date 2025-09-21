import classNames from 'classnames';
import dayjs from 'dayjs';
import * as React from 'react';

import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps, PostLayout } from '@/types';
import BaseLayout from '../BaseLayout';

// ADD THIS FUNCTION BACK
function PostMedia({ media }: { media: any }) {
    return <DynamicComponent {...media} className={classNames({ 'w-full': media.type === 'ImageBlock' })} />;
}

type ComponentProps = PageComponentProps & PostLayout & { contentHtml?: string };

const Component: React.FC<ComponentProps> = (props) => {
    const { title, date, author, contentHtml, media, bottomSections = [] } = props;
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
                {contentHtml && (
                    <div className="max-w-3xl mx-auto prose sm:prose-lg" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                )}
            </article>
            {bottomSections?.map((section, index) => {
                return <DynamicComponent key={index} {...section} global={props.global} />;
            })}
        </BaseLayout>
    );
};

export default Component;