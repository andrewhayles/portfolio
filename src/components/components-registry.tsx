// src/components/components-registry.tsx
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Annotated } from './Annotated';
import { ContentObject, GlobalProps } from '@/types';

// Statically import HeroSection to optimize LCP.
import HeroSection from './sections/HeroSection';

// LOADER 1: For critical components that must be server-rendered (SSR).
const dyn = (importer: () => Promise<any>) =>
  dynamic(importer, {loading: () => null });

// LOADER 2: For non-critical components deferred to the client-side (CSR).
const dynSsrFalse = (importer: () => Promise<any>) =>
  dynamic(importer, { ssr: false, loading: () => null });

const dynamicComponents = {
  // --- CRITICAL & LAYOUT COMPONENTS (Server-Rendered) ---
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