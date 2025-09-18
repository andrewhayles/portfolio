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
    CheckboxFormControl: dynamic(() => import('./molecules/FormBlock/CheckboxFormControl'), {ssr: false,}),
    ContactSection: dynamic(() => import('./sections/ContactSection'), {ssr: false,}),
    CtaSection: dynamic(() => import('./sections/CtaSection'), {ssr: false,}),
    DividerSection: dynamic(() => import('./sections/DividerSection'), {ssr: false,}),
    EmailFormControl: dynamic(() => import('./molecules/FormBlock/EmailFormControl'), {ssr: false,}),
    FeaturedItem: dynamic(() => import('./sections/FeaturedItemsSection/FeaturedItem'), {ssr: false,}),
    FeaturedItemsSection: dynamic(() => import('./sections/FeaturedItemsSection'), {ssr: false,}),
    FeaturedPostsSection: dynamic(() => import('./sections/FeaturedPostsSection'), {ssr: false,}),
    FeaturedProjectsSection: dynamic(() => import('./sections/FeaturedProjectsSection'), {ssr: false,}),
    FormBlock: dynamic(() => import('./molecules/FormBlock'), {ssr: false,}),
    ImageBlock: dynamic(() => import('./molecules/ImageBlock'), {ssr: false,}),
    MediaGallerySection: dynamic(() => import('./sections/MediaGallerySection'), {ssr: false,}),
    PostFeedSection: dynamic(() => import('./sections/PostFeedSection'), {ssr: false,}),
    ProjectFeedSection: dynamic(() => import('./sections/ProjectFeedSection'), {ssr: false,}),
    RecentPostsSection: dynamic(() => import('./sections/RecentPostsSection'), {ssr: false,}),
    RecentProjectsSection: dynamic(() => import('./sections/RecentProjectsSection'), {ssr: false,}),
    QuoteSection: dynamic(() => import('./sections/QuoteSection'), {ssr: false,}),
    SelectFormControl: dynamic(() => import('./molecules/FormBlock/SelectFormControl'), {ssr: false,}),
    LabelsSection: dynamic(() => import('./sections/LabelsSection'), {ssr: false,}),
    TestimonialsSection: dynamic(() => import('./sections/TestimonialsSection'), {ssr: false,}),
    TextareaFormControl: dynamic(() => import('./molecules/FormBlock/TextareaFormControl'), {ssr: false,}),
    TextFormControl: dynamic(() => import('./molecules/FormBlock/TextFormControl'), {ssr: false,}),
    TextSection: dynamic(() => import('./sections/TextSection'), {ssr: false,}),
    PageLayout: dynamic(() => import('./layouts/PageLayout'), {ssr: false,}),
    PostLayout: dynamic(() => import('./layouts/PostLayout'), {ssr: false,}),
    PostFeedLayout: dynamic(() => import('./layouts/PostFeedLayout'), {ssr: false,}),
    ProjectLayout: dynamic(() => import('./layouts/ProjectLayout'), {ssr: false,}),
    ProjectFeedLayout: dynamic(() => import('./layouts/ProjectFeedLayout'), {ssr: false,})
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