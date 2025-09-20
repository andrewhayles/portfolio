import * as React from 'react';
import Markdown from 'markdown-to-jsx';
import LazyHydrate from 'react-lazy-hydration'; // Import the library

import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps, PageLayout } from '@/types';
import BaseLayout from '../BaseLayout';

type ComponentProps = PageComponentProps & PageLayout;

const Component: React.FC<ComponentProps> = (props) => {
    const { sections = [], markdownContent } = props;

    return (
        <BaseLayout {...props}>
            {sections.map((section, index) => {
                // The first section (index 0) is critical and above the fold.
                // We hydrate it immediately.
                if (index === 0) {
                    return <DynamicComponent key={section['data-sb-object-id']} {...section} />;
                }
                
                // For all other sections, we defer hydration until they are visible.
                return (
                    <LazyHydrate whenVisible key={section['data-sb-object-id']}>
                        <DynamicComponent {...section} />
                    </LazyHydrate>
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