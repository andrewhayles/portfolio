import * as React from 'react';
import Markdown from 'markdown-to-jsx';

import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps, PageLayout } from '@/types';
import BaseLayout from '../BaseLayout';
import { ViewportAware } from '@/components/ViewportAware';

type ComponentProps = PageComponentProps & PageLayout;

const Component: React.FC<ComponentProps> = (props) => {
    const { sections = [], markdownContent } = props;

    return (
        <BaseLayout {...props}>
            {sections.map((section) => {
                // Change the key from section._id to the Stackbit object ID
                return (
                    <ViewportAware key={section['data-sb-object-id']}>
                        <DynamicComponent {...section} />
                    </ViewportAware>
                );
            })}

            {markdownContent && (
                <div className="prose max-w-4xl mx-auto px-4 py-12">
                    <Markdown>{markdownContent}</Markdown>
                </div>
            )}
        </BaseLayout>
    );
};

export default Component;