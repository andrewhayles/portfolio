// components-registry.tsx
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Annotated } from './Annotated';
import { ContentObject, GlobalProps } from '@/types';

/**
 * HeroSection remains static for LCP. Other components are dynamic/client-only where appropriate.
 */
import HeroSection from './sections/HeroSection';

const dyn = (importer: () => Promise<any>) =>
  dynamic(importer, { ssr: false, loading: () => null });

const dynamicComponents = {
  CheckboxFormControl: dyn(() => import('./molecules/FormBlock/CheckboxFormControl')),
  ContactSection: dyn(() => import('./sections/ContactSection')),
  CtaSection: dyn(() => import('./sections/CtaSection')),
  DividerSection: dyn(() => import('./sections/DividerSection')),
  EmailFormControl: dyn(() => import('./molecules/FormBlock/EmailFormControl')),
  FeaturedItem: dyn(() => import('./sections/FeaturedItemsSection/FeaturedItem')),
  FeaturedItemsSection: dyn(() => import('./sections/FeaturedItemsSection')),
  FeaturedPostsSection: dyn(() => import('./sections/FeaturedPostsSection')),
  FeaturedProjectsSection: dyn(() => import('./sections/FeaturedProjectsSection')),
  FormBlock: dyn(() => import('./molecules/FormBlock')),
  ImageBlock: dyn(() => import('./molecules/ImageBlock')),
  MediaGallerySection: dyn(() => import('./sections/MediaGallerySection')),
  PostFeedSection: dyn(() => import('./sections/PostFeedSection')),
  ProjectFeedSection: dyn(() => import('./sections/ProjectFeedSection')),
  RecentPostsSection: dyn(() => import('./sections/RecentPostsSection')),
  RecentProjectsSection: dyn(() => import('./sections/RecentProjectsSection')),
  QuoteSection: dyn(() => import('./sections/QuoteSection')),
  SelectFormControl: dyn(() => import('./molecules/FormBlock/SelectFormControl')),
  LabelsSection: dyn(() => import('./sections/LabelsSection')),
  // TestimonialsSection removed because you don't use it.
  TextareaFormControl: dyn(() => import('./molecules/FormBlock/TextareaFormControl')),
  TextFormControl: dyn(() => import('./molecules/FormBlock/TextFormControl')),
  TextSection: dyn(() => import('./sections/TextSection')),
  PageLayout: dyn(() => import('./layouts/PageLayout')),
  PostLayout: dyn(() => import('./layouts/PostLayout')),
  PostFeedLayout: dyn(() => import('./layouts/PostFeedLayout')),
  ProjectLayout: dyn(() => import('./layouts/ProjectLayout')),
  ProjectFeedLayout: dyn(() => import('./layouts/ProjectFeedLayout'))
};

type DynamicComponentProps = ContentObject & {
  global?: GlobalProps;
};

const components = {
  HeroSection,
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
