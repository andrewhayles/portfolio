// src/pages/api/getCode.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getPage } from '@/utils/content'; // Adjust this import to your project's function for fetching page data
import { highlightCode } from '@/utils/shiki'; // We'll use your existing function
import { Lang } from 'shiki';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const slug = req.query.slug as string;

    if (!slug) {
        return res.status(400).json({ error: 'Project slug is required.' });
    }

    try {
        // 1. Fetch the raw data for the specific project page
        const page = await getPage(`_projects/${slug}.md`); // Adjust path as needed

        // 2. Extract the raw code and language from your page's data
        const rawCode: string = page.frontmatter.code;
        const language: Lang = page.frontmatter.language || 'typescript'; // Set a default language

        if (!rawCode) {
            return res.status(404).json({ error: 'Code not found for this project.' });
        }

        // 3. Use your utility to highlight the code on the server
        const highlightedCodeHtml = await highlightCode(rawCode, language);

        // 4. Send back the resulting HTML
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(highlightCodeHtml);

    } catch (error) {
        console.error('Error in getCode API:', error);
        res.status(500).json({ error: 'Failed to retrieve or highlight code.' });
    }
}