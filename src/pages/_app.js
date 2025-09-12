// pages/_app.js

import { generateGlobalCssVariables } from '@/utils/theme-style-utils';
import { useEffect, useState } from 'react';
import '../css/main.css';
import { DM_Mono, Azeret_Mono } from 'next/font/google';

// 1. CONFIGURE THE FONTS HERE
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono', // Creates a CSS variable
});

const azeretMono = Azeret_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-azeret-mono', // Creates another CSS variable
});


export default function MyApp({ Component, pageProps }) {
    const { global, ...page } = pageProps;
    const { theme } = global || {};
    const [isMounted, setIsMounted] = useState(false);

    const cssVars = generateGlobalCssVariables(theme);

    useEffect(() => {
        setIsMounted(true);
        document.body.setAttribute('data-theme', page.colors || 'colors-a');
    }, [page.colors]);

    return (
        // 2. APPLY THE FONT VARIABLES TO A WRAPPING ELEMENT
        <div className={`${dmMono.variable} ${azeretMono.variable}`}>
            <style jsx global>{`
                :root {
                    ${cssVars}
                }
            `}</style>
            {isMounted ? <Component {...pageProps} /> : null}
        </div>
    );
}