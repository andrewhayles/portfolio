// src/pages/[[...slug]].tsx
import React from 'react';
import Head from 'next/head';
import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps } from '@/types';
import { getAllPagePaths, getPageProps } from '@/utils/content';
import {
  seoGenerateMetaDescription,
  seoGenerateMetaTags,
  seoGenerateTitle,
} from '@/utils/seo-utils';

type StaticPropsShape = {
  global: any; // Or a more specific GlobalProps type
  page: PageComponentProps;
  title?: string;
  metaTags?: Array<{ property: string; content: string; format?: string }>;
  metaDescription?: string;
};

const Page: React.FC<StaticPropsShape> = (props) => {
  const { global, page } = props; // We expect 'page' and 'global' props
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
      {/* Pass the correct props down to the component registry */}
      <DynamicComponent {...props} />
    </>
  );
};

// This function provides all the possible page URLs to Next.js at build time.
export function getStaticPaths() {
  const paths = getAllPagePaths();
  return { paths, fallback: false };
}

// This function runs for EACH page at build time.
export async function getStaticProps({ params }: { params?: { slug?: string[] } }) {
  const urlPath = '/' + (params?.slug || []).join('/');

  // 1. Fetch the data for ONLY this specific page.
  //    This assumes your getPageProps function in 'utils/content.js' is now fixed
  //    to only return the data for the given urlPath.
  const props = await getPageProps(urlPath);
  
  // 2. Separate the global data from the specific page data.
  const { global, ...pageData } = props || {};
  
  // 3. Generate SEO metadata from the fetched data.
  const site = global?.site || {};
  const title = seoGenerateTitle(pageData, site) || '';
  const metaTags = seoGenerateMetaTags(pageData, site) || [];
  const metaDescription = seoGenerateMetaDescription(pageData, site) || '';

  // 4. Return a clean, lean props object to the Page component.
  return {
    props: {
      global,
      page: pageData, // The data for this specific page
      title,
      metaTags,
      metaDescription,
    },
  };
}

export default Page;