import * as React from 'react';
import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps, PageLayout } from '@/types';
import BaseLayout from '../BaseLayout';

type ComponentProps = PageComponentProps & PageLayout & { contentHtml?: string };

const Component: React.FC<ComponentProps> = (props) => {
    const { topSections = [], bottomSections = [], contentHtml } = props;

    return (
        <BaseLayout {...props}>
            {topSections.length > 0 && (
                <div>
                    {topSections.map((section, index) => (
                        <DynamicComponent key={index} {...section} />
                    ))}
                </div>
            )}

            {contentHtml && (
                <div className="px-4 py-14 lg:py-20">
                    <div
                        className="max-w-3xl mx-auto prose sm:prose-lg"
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                    />
                </div>
            )}

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