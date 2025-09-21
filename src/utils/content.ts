import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentBaseDir = 'content';

// Helper to generate a URL-friendly path from a file path
function fileToUrlPath(file: string): string {
    return ('/' + file.replace(/\\/g, '/'))
        .replace(/^\/pages/, '')
        .replace(/\.md$/, '')
        .replace(/\/index$/, '') || '/';
}

// Gets all content objects with their correct URL paths and frontmatter
function getAllContentObjects() {
    const contentDir = path.join(process.cwd(), contentBaseDir);
    const files = glob.sync('**/*.md', { cwd: contentDir });

    return files.map(file => {
        const filePath = path.join(contentDir, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContents); 

        return {
            ...data,
            __metadata: {
                id: file,
                urlPath: fileToUrlPath(file)
            }
        };
    });
}

// This function provides all possible page URLs to Next.js
export function getAllPagePaths(): string[] {
    const allContent = getAllContentObjects();
    return allContent.map(content => content.__metadata.urlPath);
}

// Gets the data for a single page at build time
export async function getPageProps(urlPath: string) {
    const allContent = getAllContentObjects();
    const pageMetaData = allContent.find(p => p.__metadata.urlPath === urlPath);

    if (!pageMetaData) {
        return { notFound: true };
    }

    const filePath = path.join(process.cwd(), contentBaseDir, pageMetaData.__metadata.id);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);
    const pageData = matterResult.data as any;

    // Convert the main markdown content to HTML
    if (matterResult.content) {
        const processedContent = await remark().use(html).process(matterResult.content);
        pageData.contentHtml = processedContent.toString();
    }
    
    // Convert markdown for any sections
    if (pageData.sections) {
        for (const section of pageData.sections) {
            if (section.type === 'HeroSection' && section.subtitle) {
                const processed = await remark().use(html).process(section.subtitle);
                section.subtitleHtml = processed.toString();
                delete section.subtitle;
            }
            if (section.type === 'TextSection' && section.content) {
                const processed = await remark().use(html).process(section.content);
                section.contentHtml = processed.toString();
                delete section.content;
            }
        }
    }

    // Return all data needed by the page
    return {
        props: {
            page: { ...pageData, __metadata: pageMetaData.__metadata },
            global: {
                site: { title: 'Andrew Hayles' },
                pages: allContent.filter(p => p.__metadata.id.startsWith('pages')),
                posts: allContent.filter(p => p.__metadata.id.startsWith('posts')),
                projects: allContent.filter(p => p.__metadata.id.startsWith('projects'))
            }
        }
    };
}