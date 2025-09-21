import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentBaseDir = 'content';

// Helper to get all markdown file paths
function getContentFiles(): string[] {
    const contentDir = path.join(process.cwd(), contentBaseDir);
    return glob.sync('**/*.md', { cwd: contentDir });
}

// Derives a URL path from a file path
function fileToUrlPath(file: string): string {
    return ('/' + file.replace(/\\/g, '/'))
        .replace(/^\/pages/, '')
        .replace(/\.md$/, '')
        .replace(/\/index$/, '') || '/';
}

// This function provides all possible page URLs to Next.js
export function getAllPagePaths(): string[] {
    return getContentFiles().map(file => fileToUrlPath(file));
}

// Gets the data for a single page at build time
export async function getPageProps(urlPath: string) {
    const allFiles = getContentFiles();
    const allContent = allFiles.map(file => ({
        ...matter(fs.readFileSync(path.join(process.cwd(), contentBaseDir, file), 'utf8')).data,
        __metadata: {
            id: file,
            urlPath: fileToUrlPath(file)
        }
    }));
    
    const page = allContent.find(p => p.__metadata.urlPath === urlPath);

    if (!page) {
        return { notFound: true };
    }

    const filePath = path.join(process.cwd(), contentBaseDir, page.__metadata.id);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data: pageData, content: markdownContent } = matter(fileContents);

    if (markdownContent) {
        const processedContent = await remark().use(html).process(markdownContent);
        (pageData as any).contentHtml = processedContent.toString();
    }
    
    // Convert markdown for sections if they exist
    if ((pageData as any).sections) {
        for (const section of (pageData as any).sections) {
            if (section.type === 'HeroSection' && section.subtitle) {
                const processed = await remark().use(html).process(section.subtitle);
                section.subtitleHtml = processed.toString();
                delete section.subtitle;
            }
        }
    }

    return {
        props: {
            page: { ...pageData, __metadata: page.__metadata },
            global: {
                site: { title: 'Andrew Hayles' },
                // You can add global data here if needed later
            }
        }
    };
}