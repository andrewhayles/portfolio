// src/pages/[[...slug]].js

import Head from 'next/head';
import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps } from '@/types';
// Import new, more efficient functions
import { getAllPagePaths, getPageProps } from '@/utils/content'; 
import { seoGenerateMetaDescription, seoGenerateMetaTags, seoGenerateTitle } from '@/utils/seo-utils';

const Page: React.FC<PageComponentProps> = (props) => {
    // ... your Page component remains exactly the same ...
    const { global, ...page } = props;
    const { site } = global;
    const title = seoGenerateTitle(page, site);
    const metaTags = seoGenerateMetaTags(page, site);
    const metaDescription = seoGenerateMetaDescription(page, site);

    return (
        <>
            <Head>
                <title>{title}</title>
                {metaDescription && <meta name="description" content={metaDescription} />}
                {metaTags.map((metaTag) => {
                    if (metaTag.format === 'property') {
                        return <meta key={metaTag.property} property={metaTag.property} content={metaTag.content} />;
                    }
                    return <meta key={metaTag.property} name={metaTag.property} content={metaTag.content} />;
                })}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {site.favicon && <link rel="icon" href={site.favicon} />}
            </Head>
            <DynamicComponent {...props} />
        </>
    );
};

// UPDATED: This now uses a more efficient function to get only the page paths
export function getStaticPaths() {
    const paths = getAllPagePaths();
    return { paths, fallback: false };
}

// UPDATED: This now fetches data for a single page and excludes the 'code' field
export function getStaticProps({ params }) {
    const urlPath = '/' + (params.slug || []).join('/');
    const props = getPageProps(urlPath);
    return { props };
}

export default Page;