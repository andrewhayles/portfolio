import * as React from 'react';
import Markdown from 'markdown-to-jsx';

import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps, PageLayout } from '@/types';
import BaseLayout from '../BaseLayout';

type ComponentProps = PageComponentProps & PageLayout;

const Component: React.FC<ComponentProps> = (props) => {
    const { sections = [], markdownContent } = props;

    return (
        <BaseLayout {...props}>
            {/* Render the sections (including the title) FIRST */}
            {sections.map((section, index) => {
                return <DynamicComponent key={index} {...section} />;
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