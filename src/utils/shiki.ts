import * as shiki from 'shiki';

let highlighter: shiki.Highlighter;

export async function highlightCode(code: string, lang: string): Promise<string> {
    if (!highlighter) {
        highlighter = await shiki.createHighlighter({
            themes: ['github-dark'],
            // This instructs Shiki to only prepare Python and SQL
            langs: ['python', 'sql'],
        });
    }

    const html = highlighter.codeToHtml(code, {
        lang: lang,
        theme: 'github-dark'
    });

    return html;
}