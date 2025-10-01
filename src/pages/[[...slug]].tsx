import Head from 'next/head';
import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps } from '@/types';
import { getAllPagePaths, getPageProps } from '@/utils/content';
import { seoGenerateMetaDescription, seoGenerateMetaTags, seoGenerateTitle } from '@/utils/seo-utils';

const Page: React.FC<PageComponentProps> = (props) => {
    const { global, page } = props;
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
            
            {/* FIX: Pass the entire props object, not just page */}
            <DynamicComponent {...props} />
        </>
    );
};

/**
 * Use the new lightweight getAllPagePaths() function.
 * This is much faster as it doesn't read file contents.
 */
export function getStaticPaths() {
    const paths = getAllPagePaths();
    return { paths, fallback: false };
}

/**
 * Use the new getPageProps() function.
 * This fetches data for only the current page, not the entire site.
 */
export function getStaticProps({ params }) {
    const urlPath = '/' + (params.slug || []).join('/');
    const props = getPageProps(urlPath);

    if (!props) {
        return { notFound: true };
    }

    return { props };
}

export default Page;