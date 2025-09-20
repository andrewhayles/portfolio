// src/pages/[[...slug]].tsx
import React from 'react';
import Head from 'next/head';
import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps } from '@/types';
// Import more efficient server-side helpers
import { getAllPagePaths, getPageProps } from '@/utils/content';
import {
  seoGenerateMetaDescription,
  seoGenerateMetaTags,
  seoGenerateTitle,
} from '@/utils/seo-utils';

type StaticPropsShape = PageComponentProps & {
  title?: string;
  metaTags?: Array<{ property: string; content: string; format?: string }>;
  metaDescription?: string;
};

const Page: React.FC<StaticPropsShape> = (props) => {
  // The heavy SEO work was moved into getStaticProps, so the client just renders values.
  const { global, ...page } = props;
  const { site } = global || {};

  const title = props.title ?? '';
  const metaTags = props.metaTags ?? [];
  const metaDescription = props.metaDescription ?? '';

  return (
    <>
      <Head>
        <title>{title}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        {metaTags.map((metaTag) => {
          if (metaTag.format === 'property') {
            return (
              <meta
                key={metaTag.property}
                property={metaTag.property}
                content={metaTag.content}
              />
            );
          }
          return (
            <meta key={metaTag.property} name={metaTag.property} content={metaTag.content} />
          );
        })}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {site?.favicon && <link rel="icon" href={site.favicon} />}
      </Head>
      <DynamicComponent {...props} />
    </>
  );
};

// Build-time generation of paths (unchanged)
export function getStaticPaths() {
  const paths = getAllPagePaths();
  return { paths, fallback: false };
}

import { pick } from 'lodash'; // A helpful utility, or you can write your own

export async function getStaticProps({ params }: { params?: { slug?: string[] } }) {
    const urlPath = '/' + (params?.slug || []).join('/');
    const props = await getPageProps(urlPath); // This fetches all the data (e.g., 254 kB)

    const safeProps = props || {};

    // Destructure the full page object to work with its parts
    const { global, ...pageData } = safeProps;

    // *** THE SOLUTION ***
    // Create a new, lean page object with ONLY the essential props.
    // Customize this list based on the actual props your layouts and sections use.
    const pageProps = pick(pageData, [
        'type',
        'title',
        'sections',
        'date',
        'author'
        // Add any other top-level fields your page layouts need here
    ]);

    // Compute SEO metadata using the full data object
    try {
        const site = global?.site || {};
        const title = seoGenerateTitle(pageData, site) || '';
        const metaTags = seoGenerateMetaTags(pageData, site) || [];
        const metaDescription = seoGenerateMetaDescription(pageData, site) || '';

        // Finally, return the LEAN data to the client
        return {
            props: {
        ...safeProps, // Temporarily return everything
        title,
        metaTags,
        metaDescription
        };
    } catch (err) {
        // ... your existing catch block
        return {
            props: {
                global,
                page: pageProps,
                title: '',
                metaTags: [],
                metaDescription: '',
            },
        };
    }
}
export default Page;
