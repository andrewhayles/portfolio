import * as React from 'react';
import Markdown from 'markdown-to-jsx';

import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps, PageLayout } from '@/types';
import BaseLayout from '../BaseLayout';
import { ViewportAware } from '@/components/ViewportAware'; // 1. Import the wrapper

type ComponentProps = PageComponentProps & PageLayout;

const Component: React.FC<ComponentProps> = (props) => {
    const { sections = [], markdownContent } = props;

    return (
        <BaseLayout {...props}>
            {/* Render the sections */}
            {sections.map((section) => {
                // 2. Wrap the DynamicComponent in ViewportAware
                // Note: Using a unique ID like section._id for the key is better than index.
                return (
                    <ViewportAware key={section._id}>
                        <DynamicComponent {...section} />
                    </ViewportAware>
                );
            })}

            {/* Render the main markdown content AFTER */}
            {markdownContent && (
                <div className="prose max-w-4xl mx-auto px-4 py-12">
                    <Markdown>{markdownContent}</Markdown>
                </div>
            )}
        </BaseLayout>
    );
};

export default Component;