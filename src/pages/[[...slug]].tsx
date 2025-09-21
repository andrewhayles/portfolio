import React from 'react';
import Head from 'next/head';
import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps } from '@/types';
import { getAllPagePaths, getPageProps } from '@/utils/content';
import { seoGenerateMetaDescription, seoGenerateMetaTags, seoGenerateTitle } from '@/utils/seo-utils';

type StaticPropsShape = {
  global: any;
  page: PageComponentProps;
  title: string;
  metaTags: Array<{ property: string; content: string; format?: string }>;
  metaDescription: string;
};

const Page: React.FC<StaticPropsShape> = (props) => {
  const { global, page } = props;
  const { site } = global || {};

  return (
    <>
      <Head>
        <title>{props.title}</title>
        {props.metaDescription && <meta name="description" content={props.metaDescription} />}
        {props.metaTags.map((metaTag) => {
          if (metaTag.format === 'property') {
            return <meta key={metaTag.property} property={metaTag.property} content={metaTag.content} />;
          }
          return <meta key={metaTag.property} name={metaTag.property} content={metaTag.content} />;
        })}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {site?.favicon && <link rel="icon" href={site.favicon} />}
      </Head>
      <DynamicComponent {...page} global={global} />
    </>
  );
};

export async function getStaticProps({ params }: { params?: { slug?: string[] } }) {
  const urlPath = '/' + (params?.slug || []).join('/');
  const result = await getPageProps(urlPath);

  if ('notFound' in result && result.notFound) {
    return { notFound: true };
  }
  
  const { global, page } = result.props;
  
  const site = global?.site || {};
  const title = seoGenerateTitle(page, site) || '';
  const metaTags = seoGenerateMetaTags(page, site) || [];
  const metaDescription = seoGenerateMetaDescription(page, site) || '';

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

export function getStaticPaths() {
  const paths = getAllPagePaths();
  return { paths, fallback: false };
}

export default Page;