import classNames from 'classnames';
import dayjs from 'dayjs';
import * as React from 'react';

import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps, ProjectLayout } from '@/types';
import BaseLayout from '../BaseLayout';

type ComponentProps = PageComponentProps & ProjectLayout & { contentHtml?: string };

const Component: React.FC<ComponentProps> = (props) => {
    const { title, date, client, description, media, contentHtml, bottomSections = [] } = props;
    const dateTimeAttr = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    const formattedDate = dayjs(date).format('YYYY-MM-DD');

    return (
        <BaseLayout {...props}>
            <article className="px-4 py-14 lg:py-20">
                <header className="max-w-5xl mx-auto mb-10 sm:mb-14">
                    <div className="mb-6 uppercase">
                        <time dateTime={dateTimeAttr}>{formattedDate}</time>
                        {client && (
                            <>
                                {' | '}
                                {client}
                            </>
                        )}
                    </div>
                    <h1 className="text-5xl sm:text-6xl">{title}</h1>
                    {description && <p className="text-xl sm:text-2xl mt-4">{description}</p>}
                </header>

                {media && (
                    <figure className="max-w-5xl mx-auto mb-10 sm:mb-14">
                        <DynamicComponent {...media} className={classNames({ 'w-full': media.type === 'ImageBlock' })} />
                    </figure>
                )}

                {contentHtml && (
                    <div className="max-w-3xl mx-auto prose sm:prose-lg" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                )}
            </article>

            {bottomSections.length > 0 && (
                <div>
                    {bottomSections.map((section, index) => (
                        <DynamicComponent key={index} {...section} />
                    ))}
                </div>
            )}
        </BaseLayout>
    );
};

export default Component;