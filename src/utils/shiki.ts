// src/utils/shiki.ts
import * as shiki from 'shiki';

let highlighter: shiki.Highlighter;

export async function highlightCode(code: string, lang: string) {
    if (!highlighter) {
        highlighter = await shiki.createHighlighter({
            themes: ['github-dark'], // Use 'themes' (plural) here
            
            // Customize this list to only include the languages you need
            langs: [
                'javascript', 
                'typescript', 
                'tsx',
                'css', 
                'html', 
                'json', 
                'markdown'
            ], 
        });
    }

    const html = highlighter.codeToHtml(code, {
        lang: lang,
        theme: 'github-dark' // Use 'theme' (singular) here
    });

    return html;
}