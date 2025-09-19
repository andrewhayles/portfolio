// components-registry.tsx
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Annotated } from './Annotated';
import { ContentObject, GlobalProps } from '@/types';

/**
 * HeroSection is statically imported to be part of the initial chunk, optimizing LCP.
 */
import HeroSection from './sections/HeroSection';

// LOADER 1: For critical components that should be server-rendered (SSR).
// This helps TBT and ensures important content is in the initial HTML.
const dyn = (importer: () => Promise<any>) =>
  dynamic(importer, {loading: () => null });

// LOADER 2 (NEW): For non-critical, "below-the-fold" components.
// Using ssr: false defers their rendering to the client, speeding up the initial server response.
const dynSsrFalse = (importer: () => Promise<any>) =>
  dynamic(importer, { ssr: false, loading: () => null });

const dynamicComponents = {
  // --- CRITICAL & LAYOUT COMPONENTS (Server-Rendered) ---
  // These are essential for the page structure and initial view.
  FeaturedProjectsSection: dyn(() => import('./sections/FeaturedProjectsSection')),
  ImageBlock: dyn(() => import('./molecules/ImageBlock')),
  ProjectFeedSection: dyn(() => import('./sections/ProjectFeedSection')),
  TextSection: dyn(() => import('./sections/TextSection')),
  PageLayout: dyn(() => import('./layouts/PageLayout')),
  PostLayout: dyn(() => import('./layouts/PostLayout')),
  PostFeedLayout: dyn(() => import('./layouts/PostFeedLayout')),
  ProjectLayout: dyn(() => import('./layouts/ProjectLayout')),
  ProjectFeedLayout: dyn(() => import('./layouts/ProjectFeedLayout')),

  // --- DEFERRED COMPONENTS (Client-Side Rendered) ---
  // These components are typically "below the fold" and not needed immediately.
  // Deferring them makes the initial page load faster.
  ContactSection: dynSsrFalse(() => import('./sections/ContactSection')),
  CtaSection: dynSsrFalse(() => import('./sections/CtaSection')),
  DividerSection: dynSsrFalse(() => import('./sections/DividerSection')),
  FormBlock: dynSsrFalse(() => import('./molecules/FormBlock')),
  EmailFormControl: dynSsrFalse(() => import('./molecules/FormBlock/EmailFormControl')),
  LabelsSection: dynSsrFalse(() => import('./sections/LabelsSection')),
};

type DynamicComponentProps = ContentObject & {
  global?: GlobalProps;
};

// This part of the logic remains the same
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