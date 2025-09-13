import { codeToHtml } from 'shiki';

export async function highlightCode(code: string, lang: string) {
    const html = await codeToHtml(code, {
        lang: lang,
        theme: 'github-dark' // A popular, high-contrast theme
    });
    return html;
}