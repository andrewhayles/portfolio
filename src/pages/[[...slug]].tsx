import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import ErrorPage from 'next/error';
import { DynamicComponent } from '@/components/components-registry';
import { PageLayout as PageLayoutProps } from '@/types';
import { getPage, getPagePaths } from '@/lib/pages'; // Assuming these functions exist
import { getGlobalProps } from '@/lib/global'; // Assuming this function exists
import PageLayout from '@/components/layouts/PageLayout'; // Assuming this component exists

// This defines the structure of your page's data
type Props = InferGetStaticPropsType<typeof getStaticProps>;

// This is the main component for your pages
export default function Page({ page, global, notFound }: Props) {
    // ✅ THIS IS THE IMPORTANT SAFETY CHECK
    // If the page was not found, it shows a 404 error page and stops.
    if (notFound || !page) {
        return <ErrorPage statusCode={404} />;
    }

    // If the page IS found, it renders your layout with the page data.
    return <PageLayout {...page} global={global} />;
}

// This function fetches the data for a single page during the build
export const getStaticProps: GetStaticProps<{
    page?: PageLayoutProps;
    global?: any;
    notFound?: boolean;
}> = async (context) => {
    const slug = '/' + ((context.params?.slug as string[]) ?? []).join('/');
    const page = await getPage(slug);

    if (!page) {
        return { notFound: true };
    }

    // ✨ FIX IS HERE: Create a mutable copy of the 'sections' array.
    // This solves the "readonly" type error by ensuring the array
    // passed to the component is modifiable.
    const pageWithMutableSections = {
        ...page,
        sections: page.sections ? [...page.sections] : []
    };

    const globalProps = await getGlobalProps();
    return {
        props: {
            page: pageWithMutableSections, // Use the modified page object
            global: globalProps
        }
    };
};

// This function tells Next.js which pages to build
export const getStaticPaths: GetStaticPaths = async () => {
    const paths = await getPagePaths();
    return {
        paths,
        fallback: false
    };
};