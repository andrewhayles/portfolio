import { PageComponentProps } from '@/types';
import { PageLayout } from '@/components/layouts/PageLayout';
import { PostLayout } from '@/components/layouts/PostLayout';
import { ProjectLayout } from '@/components/layouts/ProjectLayout';
import { CtaSection } from '@/components/sections/CtaSection';
import { FeaturedItemsSection } from '@/components/sections/FeaturedItemsSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { TextSection } from '@/components/sections/TextSection';
import { ProjectFeedSection } from '@/components/sections/ProjectFeedSection';
import { PostFeedSection } from '@/components/sections/PostFeedSection';
import { ContactSection } from '@/components/sections/ContactSection';

// Map of component types to their actual components
const components = {
    PageLayout: PageLayout,
    PostLayout: PostLayout,
    ProjectLayout: ProjectLayout,
    CtaSection: CtaSection,
    FeaturedItemsSection: FeaturedItemsSection,
    HeroSection: HeroSection,
    TextSection: TextSection,
    ProjectFeedSection: ProjectFeedSection,
    PostFeedSection: PostFeedSection,
    ContactSection: ContactSection
};

export type DynamicComponentProps = PageComponentProps & {
    className?: string;
};

export const DynamicComponent: React.FC<DynamicComponentProps> = (props) => {
    const modelName = props.type;
    if (!modelName) {
        // Return an error message if the component type is missing
        return <div>Error: Component type missing from page data.</div>;
    }

    const Component = components[modelName];
    if (!Component) {
        // Return an error message if the component is not found in the registry
        return <div>Error: Component '{modelName}' not found in registry.</div>;
    }

    return <Component {...props} />;
};