// src/pages/api/getCode.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { highlightCode } from '@/utils/shiki';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter'; // A library to parse markdown frontmatter

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const slug = req.query.slug as string;

    if (!slug) {
        return res.status(400).json({ error: 'Project slug is required.' });
    }

    try {
        // 1. Construct the full path to the project's markdown file
        const projectsDir = path.join(process.cwd(), '_projects');
        const fullPath = path.join(projectsDir, `${slug}.md`);

        // 2. Read the file from the filesystem
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // 3. Parse the file content and frontmatter using gray-matter
        const { data: frontmatter } = matter(fileContents);
        
        const rawCode = frontmatter.code;
        const language = frontmatter.language || 'typescript'; // Set a default language

        if (!rawCode) {
            return res.status(404).json({ error: 'Code not found in the frontmatter of this project.' });
        }

        // 4. Use your utility to highlight the code on the server
        const highlightedCodeHtml = await highlightCode(rawCode, language);

        // 5. Send back the resulting HTML
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(highlightedCodeHtml);

    } catch (error) {
        console.error('Error in getCode API:', error);
        // Provide a more specific error if the file is not found
        if (error.code === 'ENOENT') {
             return res.status(404).json({ error: 'Project file not found.' });
        }
        res.status(500).json({ error: 'Failed to retrieve or highlight code.' });
    }
}