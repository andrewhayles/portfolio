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
            {/* This new section renders the main page content */}
            {markdownContent && (
                <div className="prose max-w-4xl mx-auto px-4 py-12">
                    <Markdown>{markdownContent}</Markdown>
                </div>
            )}

            {sections.map((section, index) => {
                return <DynamicComponent key={index} {...section} />;
            })}
        </BaseLayout>
    );
};

export default Component;