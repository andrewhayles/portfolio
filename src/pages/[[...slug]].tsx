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
      <DynamicComponent {...page} global={global} />
    </>
  );
};

// This function provides all the possible page URLs to Next.js at build time.
export function getStaticPaths() {
  const paths = getAllPagePaths();
  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params?: { slug?: string[] } }) {
  const urlPath = '/' + (params?.slug || []).join('/');
  const props = await getPageProps(urlPath);

  // Add this check to handle pages that are not found
  if (!props || (props as any).notFound) {
    return { notFound: true };
  }
  
  // Now we know we have the correct props structure
  const { global, page } = props;
  
  // Generate SEO metadata from the fetched data
  const site = global?.site || {};
  const title = seoGenerateTitle(page, site) || '';
  const metaTags = seoGenerateMetaTags(page, site) || [];
  const metaDescription = seoGenerateMetaDescription(page, site) || '';

  // Return a clean props object to the Page component
  return {
    props: {
      global,
      page,
      title,
      metaTags,
      metaDescription,
    },
  };
}

export default Page;