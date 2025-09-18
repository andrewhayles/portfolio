// src/components/sections/Header/index.tsx
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import { Link, Social } from '@/components/atoms';
import CloseIcon from '@/components/svgs/close';
import MenuIcon from '@/components/svgs/menu';
import HeaderLink from './HeaderLink';

// Lazy-load ImageBlock on client only — keeps initial SSR & hydration lighter.
const ImageBlock = dynamic(() => import('@/components/molecules/ImageBlock'), {
  ssr: false,
  loading: () => null
});

type LinkItem = any; // keep as any to match your existing link shapes
type SocialItem = any;

export default function Header(props: any) {
  const { isSticky, styles = {}, ...rest } = props;
  const headerWidth = styles.self?.width ?? 'narrow';
  return (
    <header className={classNames(isSticky ? 'sticky top-0 z-10' : 'relative', 'border-b border-current')}>
      <div
        className={classNames({
          'max-w-7xl mx-auto xl:border-x xl:border-current': headerWidth === 'narrow',
          'max-w-8xl mx-auto 2xl:border-x 2xl:border-current': headerWidth === 'wide',
          'w-full': headerWidth === 'full'
        })}
      >
        <Link href="#main" className="sr-only">
          Skip to main content
        </Link>
        <HeaderVariants {...rest} />
      </div>
    </header>
  );
}

function HeaderVariants(props: any) {
  const { headerVariant = 'variant-a', ...rest } = props;
  switch (headerVariant) {
    case 'variant-b':
      return <HeaderVariantB {...rest} />;
    case 'variant-c':
      return <HeaderVariantC {...rest} />;
    default:
      return <HeaderVariantA {...rest} />;
  }
}

function HeaderVariantA(props: any) {
  const { primaryLinks = [], socialLinks = [], ...logoProps } = props;
  return (
    <div className="relative flex items-stretch">
      <SiteLogoLink {...logoProps} />
      {primaryLinks.length > 0 && (
        <ul className="hidden border-r border-current divide-x divide-current lg:flex">
          <ListOfLinksMemo links={primaryLinks} inMobileMenu={false} />
        </ul>
      )}
      {socialLinks.length > 0 && (
        <ul className="hidden ml-auto border-l border-current lg:flex">
          <ListOfSocialLinksMemo links={socialLinks} inMobileMenu={false} />
        </ul>
      )}
      {(primaryLinks.length > 0 || socialLinks.length > 0) && <MobileMenu {...props} />}
    </div>
  );
}

function HeaderVariantB(props: any) {
  const { primaryLinks = [], socialLinks = [], ...logoProps } = props;
  return (
    <div className="relative flex items-stretch">
      <SiteLogoLink {...logoProps} />
      {primaryLinks.length > 0 && (
        <ul className="hidden ml-auto border-l border-current divide-x divide-current lg:flex">
          <ListOfLinksMemo links={primaryLinks} inMobileMenu={false} />
        </ul>
      )}
      {socialLinks.length > 0 && (
        <ul
          className={classNames('hidden border-l border-current lg:flex', {
            'ml-auto': primaryLinks.length === 0
          })}
        >
          <ListOfSocialLinksMemo links={socialLinks} inMobileMenu={false} />
        </ul>
      )}
      {(primaryLinks.length > 0 || socialLinks.length > 0) && <MobileMenu {...props} />}
    </div>
  );
}

function HeaderVariantC(props: any) {
  const { primaryLinks = [], socialLinks = [], ...logoProps } = props;
  return (
    <div className="relative flex items-stretch">
      <SiteLogoLink {...logoProps} />
      {socialLinks.length > 0 && (
        <ul className="hidden ml-auto border-l border-current lg:flex">
          <ListOfSocialLinksMemo links={socialLinks} inMobileMenu={false} />
        </ul>
      )}
      {primaryLinks.length > 0 && (
        <ul
          className={classNames('hidden border-l border-current divide-x divide-current lg:flex', {
            'ml-auto': primaryLinks.length === 0
          })}
        >
          <ListOfLinksMemo links={primaryLinks} inMobileMenu={false} />
        </ul>
      )}
      {(primaryLinks.length > 0 || socialLinks.length > 0) && <MobileMenu {...props} />}
    </div>
  );
}

function MobileMenu(props: any) {
  const { primaryLinks = [], socialLinks = [], ...logoProps } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // close menu on route change
  useEffect(() => {
    const handleRouteChange = () => setIsMenuOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  // render overlay only when open — avoids cost of hidden overlay DOM on mobile initial load
  return (
    <div className="ml-auto lg:hidden">
      <button
        aria-label="Open Menu"
        className="h-10 min-h-full p-4 text-lg border-l border-current focus:outline-hidden"
        onClick={() => setIsMenuOpen(true)}
      >
        <MenuIcon className="fill-current w-icon h-icon" />
      </button>

      {isMenuOpen && (
        <div className="fixed inset-0 z-20 overflow-y-auto bg-main">
          <div className="flex flex-col min-h-full">
            <div className="flex items-stretch justify-between border-b border-current">
              <SiteLogoLink {...logoProps} />
              <div className="border-l border-current">
                <button
                  aria-label="Close Menu"
                  className="h-10 min-h-full p-4 text-lg focus:outline-hidden"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CloseIcon className="fill-current w-icon h-icon" />
                </button>
              </div>
            </div>

            {(primaryLinks.length > 0 || socialLinks.length > 0) && (
              <div className="flex flex-col items-center justify-center px-4 py-20 space-y-12 grow">
                {primaryLinks.length > 0 && (
                  <ul className="space-y-6">
                    <ListOfLinksMemo links={primaryLinks} inMobileMenu={true} />
                  </ul>
                )}
                {socialLinks.length > 0 && (
                  <ul className="flex flex-wrap justify-center border border-current divide-x divide-current">
                    <ListOfSocialLinksMemo links={socialLinks} inMobileMenu={true} />
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SiteLogoLink({ title, isTitleVisible, logo }: { title?: string; isTitleVisible?: boolean; logo?: any }) {
  if (!(logo || (title && isTitleVisible))) {
    return null;
  }
  return (
    <div className="flex items-center border-r border-current">
      <Link href="/" className="flex items-center h-full gap-2 p-4 link-fill">
        {logo && <ImageBlock {...logo} className="max-h-12" />}
        {title && isTitleVisible && <span className="text-base tracking-widest uppercase">{title}</span>}
      </Link>
    </div>
  );
}

/* -----------------------
   ListOfLinks + ListOfSocialLinks
   explicit prop types so TS knows what they accept
   ----------------------- */

type ListOfLinksProps = {
  links: LinkItem[];
  inMobileMenu?: boolean;
};

function ListOfLinks({ links, inMobileMenu }: ListOfLinksProps) {
  return (
    <>
      {links.map((link: LinkItem, index: number) => (
        <li key={index} className={classNames(inMobileMenu ? 'text-center w-full' : 'inline-flex items-stretch')}>
          <HeaderLink
            {...link}
            className={classNames(inMobileMenu ? 'text-xl bottom-shadow-1 hover:bottom-shadow-5' : 'p-4 link-fill')}
          />
        </li>
      ))}
    </>
  );
}

const ListOfLinksMemo: React.NamedExoticComponent<ListOfLinksProps> = React.memo(ListOfLinks);

type ListOfSocialLinksProps = {
  links: SocialItem[];
  inMobileMenu?: boolean;
};

function ListOfSocialLinks({ links, inMobileMenu = false }: ListOfSocialLinksProps) {
  return (
    <>
      {links.map((link: SocialItem, index: number) => (
        <li key={index} className="inline-flex items-stretch">
          <Social {...link} className={classNames('text-lg link-fill', inMobileMenu ? 'p-5' : 'p-4')} />
        </li>
      ))}
    </>
  );
}

const ListOfSocialLinksMemo: React.NamedExoticComponent<ListOfSocialLinksProps> = React.memo(ListOfSocialLinks);
