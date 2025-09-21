
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Annotated } from './Annotated';
import { ContentObject, GlobalProps } from '@/types';

// Statically import HeroSection to optimize LCP.
import { HeroSection } from './sections/HeroSection';

// LOADER 1: For critical components that must be server-rendered (SSR).
const dyn = (importer: () => Promise<any>) =>
  dynamic(importer, {loading: () => null });

// LOADER 2: For non-critical components deferred to the client-side (CSR).
const dynSsrFalse = (importer: () => Promise<any>) =>
  dynamic(importer, { ssr: false, loading: () => null });

const dynamicComponents = {
  // --- CRITICAL & LAYOUT COMPONENTS (Server-Rendered) ---

  TextSection: dyn(() => import('./sections/TextSection')),
  PageLayout: dyn(() => import('./layouts/PageLayout')),
  PostLayout: dyn(() => import('./layouts/PostLayout')),
  PostFeedLayout: dyn(() => import('./layouts/PostFeedLayout')),

  // --- DEFERRED COMPONENTS (Client-Side Rendered) ---
  FeaturedProjectsSection: dynSsrFalse(() => import('./sections/FeaturedProjectsSection')),
  ImageBlock: dynSsrFalse(() => import('./molecules/ImageBlock')),
  ProjectFeedSection: dynSsrFalse(() => import('./sections/ProjectFeedSection')),
  ContactSection: dynSsrFalse(() => import('./sections/ContactSection')),
  CtaSection: dynSsrFalse(() => import('./sections/CtaSection')),
  DividerSection: dynSsrFalse(() => import('./sections/DividerSection')),
  FormBlock: dynSsrFalse(() => import('./molecules/FormBlock')),
  EmailFormControl: dynSsrFalse(() => import('./molecules/FormBlock/EmailFormControl')),
  LabelsSection: dynSsrFalse(() => import('./sections/LabelsSection')),
  ProjectLayout: dynSsrFalse(() => import('./layouts/ProjectLayout')),
  ProjectFeedLayout: dynSsrFalse(() => import('./layouts/ProjectFeedLayout')),
};

type DynamicComponentProps = ContentObject & {
  global?: GlobalProps;
  className?: string;
};

const components = {
  HeroSection,
  ...dynamicComponents
};


export const DynamicComponent: React.FC<DynamicComponentProps> = (props) => {
    // Keep this for now, it's very helpful!
    console.log('DynamicComponent props:', props); 

    const modelName = props.type;
    if (!modelName) {
        // Fallback for when type is missing, to prevent crash
        return <div>Error: Component type missing!</div>; 
    }

    const Component = components[modelName];
    if (!Component) {
        // Fallback for when component is not registered
        return <div>Error: Component '{modelName}' not found in registry.</div>;
    }

    // THIS IS THE CRITICAL CHANGE: Pass ALL props
    return <Component {...props} />;
};


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