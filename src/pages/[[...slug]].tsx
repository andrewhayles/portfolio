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

// Fetch page data at build time and compute SEO fields there to avoid client work
export async function getStaticProps({ params }: { params?: { slug?: string[] } }) {
  const urlPath = '/' + (params?.slug || []).join('/');
  // getPageProps should already be optimized for single-page fetch and omit heavy 'code' fields
  const props = await getPageProps(urlPath);

  // safety: ensure props is an object
  const safeProps = props || {};

  // Compute SEO metadata at build time (removes work from the client)
  try {
    const site = (safeProps.global && safeProps.global.site) || {};
    const page = safeProps || {};
    const title = seoGenerateTitle(page, site) || '';
    const metaTags = seoGenerateMetaTags(page, site) || [];
    const metaDescription = seoGenerateMetaDescription(page, site) || '';

    // Attach computed SEO fields directly to the props object
    return {
      props: {
        ...safeProps,
        title,
        metaTags,
        metaDescription,
      },
    };
  } catch (err) {
    // If SEO generation fails for some reason, still return the base props so the page builds
    return {
      props: {
        ...safeProps,
        title: '',
        metaTags: [],
        metaDescription: '',
      },
    };
  }
}

export default Page;
