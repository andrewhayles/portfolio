import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentBaseDir = 'content';

function urlPathFromFileId(id: string): string {
    return ('/' + id)
        .replace(/^\/pages/, '')
        .replace(/\.md$/, '')
        .replace(/\/index$/, '') || '/';
}

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
                urlPath: urlPathFromFileId(file)
            }
        };
    });
}

export function getAllPagePaths(): string[] {
    return getAllContentObjects().map(content => content.__metadata.urlPath);
}

export async function getPageProps(urlPath: string) {
    const allContent = getAllContentObjects();
    const pageMetaData = allContent.find(p => p.__metadata.urlPath === urlPath);

    if (!pageMetaData) {
        return { notFound: true };
    }

    const filePath = path.join(process.cwd(), contentBaseDir, pageMetaData.__metadata.id);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data: pageData, content: markdownContent } = matter(fileContents);

    if (markdownContent) {
        const processedContent = await remark().use(html).process(markdownContent);
        (pageData as any).contentHtml = processedContent.toString();
    }
    
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