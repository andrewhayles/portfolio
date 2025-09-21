// src/utils/shiki.ts
import { getHighlighterCore } from 'shiki/core';
import getWasm from 'shiki/wasm';
import theme from 'shiki/themes/github-dark.mjs';

// Import ONLY the languages you need: Python and SQL
import langPython from 'shiki/langs/python.mjs';
import langSql from 'shiki/langs/sql.mjs';

let highlighter: any;

export async function highlightCode(code: string, lang: string) {
  if (!highlighter) {
    highlighter = await getHighlighterCore({
      themes: [theme],
      langs: [
        // Register the imported languages
        langPython,
        langSql
      ],
      loadWasm: getWasm,
    });
  }

  const html = highlighter.codeToHtml(code, {
    lang: lang,
    theme: 'github-dark'
  });

  return html;
}