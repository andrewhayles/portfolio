import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Annotated } from './Annotated';
import { ContentObject, GlobalProps } from '@/types';

/**
 * Note: The HeroSection is imported statically because it's critical for the
 * initial page view ("above the fold"). This improves the Largest Contentful Paint (LCP) metric.
 * All other components are loaded dynamically to reduce the initial JavaScript bundle size,
 * which improves Total Blocking Time (TBT).
 */
import HeroSection from './sections/HeroSection';

const dynamicComponents = {
    CheckboxFormControl: dynamic(() => import('./molecules/FormBlock/CheckboxFormControl')),
    ContactSection: dynamic(() => import('./sections/ContactSection')),
    CtaSection: dynamic(() => import('./sections/CtaSection')),
    DividerSection: dynamic(() => import('./sections/DividerSection')),
    EmailFormControl: dynamic(() => import('./molecules/FormBlock/EmailFormControl')),
    FeaturedItem: dynamic(() => import('./sections/FeaturedItemsSection/FeaturedItem')),
    FeaturedItemsSection: dynamic(() => import('./sections/FeaturedItemsSection')),
    FeaturedPostsSection: dynamic(() => import('./sections/FeaturedPostsSection')),
    FeaturedProjectsSection: dynamic(() => import('./sections/FeaturedProjectsSection')),
    FormBlock: dynamic(() => import('./molecules/FormBlock')),
    ImageBlock: dynamic(() => import('./molecules/ImageBlock')),
    MediaGallerySection: dynamic(() => import('./sections/MediaGallerySection')),
    PostFeedSection: dynamic(() => import('./sections/PostFeedSection')),
    ProjectFeedSection: dynamic(() => import('./sections/ProjectFeedSection')),
    RecentPostsSection: dynamic(() => import('./sections/RecentPostsSection')),
    RecentProjectsSection: dynamic(() => import('./sections/RecentProjectsSection')),
    QuoteSection: dynamic(() => import('./sections/QuoteSection')),
    SelectFormControl: dynamic(() => import('./molecules/FormBlock/SelectFormControl')),
    LabelsSection: dynamic(() => import('./sections/LabelsSection')),
    TestimonialsSection: dynamic(() => import('./sections/TestimonialsSection')),
    TextareaFormControl: dynamic(() => import('./molecules/FormBlock/TextareaFormControl')),
    TextFormControl: dynamic(() => import('./molecules/FormBlock/TextFormControl')),
    TextSection: dynamic(() => import('./sections/TextSection')),
    PageLayout: dynamic(() => import('./layouts/PageLayout')),
    PostLayout: dynamic(() => import('./layouts/PostLayout')),
    PostFeedLayout: dynamic(() => import('./layouts/PostFeedLayout')),
    ProjectLayout: dynamic(() => import('./layouts/ProjectLayout')),
    ProjectFeedLayout: dynamic(() => import('./layouts/ProjectFeedLayout'))
};

type DynamicComponentProps = ContentObject & {
    global?: GlobalProps;
};

// Combine the statically imported HeroSection with the rest of the dynamic components
const components = {
    HeroSection: HeroSection,
    ...dynamicComponents
};

export const DynamicComponent: React.FC<DynamicComponentProps> = (props) => {
    const modelName = props.type;

    if (!modelName) {
        throw new Error(`Object does not have a 'type' property: ${JSON.stringify(props, null, 2)}`);
    }

    const Component = components[modelName] as ComponentType;
    if (!Component) {
        throw new Error(`No component matches type: '${modelName}'`);
    }

    return (
        <Annotated content={props}>
            <Component {...props} />
        </Annotated>
    );
};