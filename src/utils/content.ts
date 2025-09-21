import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentBaseDir = 'content';

// Helper to get all markdown file paths
function getContentFiles(dir: string): string[] {
    const contentDir = path.join(process.cwd(), contentBaseDir, dir);
    if (!fs.existsSync(contentDir)) return [];
    return glob.sync('**/*.md', { cwd: contentDir });
}

// Main function to read, parse, and prepare all content
function getAllContent() {
    const pageFiles = getContentPaths('pages');
    const postFiles = getContentPaths('posts');
    const projectFiles = getContentPaths('projects');

    const allPages = pageFiles.map(file => ({ ...matter(fs.readFileSync(path.join(process.cwd(), contentBaseDir, 'pages', file), 'utf8')).data, __metadata: { id: `pages/${file}` } }));
    const allPosts = postFiles.map(file => ({ ...matter(fs.readFileSync(path.join(process.cwd(), contentBaseDir, 'posts', file), 'utf8')).data, __metadata: { id: `posts/${file}` } }));
    const allProjects = projectFiles.map(file => ({ ...matter(fs.readFileSync(path.join(process.cwd(), contentBaseDir, 'projects', file), 'utf8')).data, __metadata: { id: `projects/${file}` } }));

    return { allPages, allPosts, allProjects };
}

// Derives a URL path from a file ID
function urlPathFromFileId(id: string): string {
    return ('/' + id)
        .replace(/^\/pages/, '')
        .replace(/\.md$/, '')
        .replace(/\/index$/, '') || '/';
}

// This function provides all possible page URLs to Next.js
export function getAllPagePaths(): string[] {
    const { allPages, allPosts, allProjects } = getAllContent();
    const allContent = [...allPages, ...allPosts, ...allProjects];
    return allContent.map(content => urlPathFromFileId(content.__metadata.id));
}

// Gets the data for a single page at build time
export async function getPageProps(urlPath: string) {
    const { allPages, allPosts, allProjects } = getAllContent();
    const allContent = [...allPages, ...allPosts, ...allProjects];

    const page = allContent.find(p => urlPathFromFileId(p.__metadata.id) === urlPath);

    if (!page) {
        return { notFound: true };
    }

    const filePath = path.join(process.cwd(), contentBaseDir, page.__metadata.id);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);
    const pageData = matterResult.data as any;

    if (matterResult.content) {
        const processedContent = await remark().use(html).process(matterResult.content);
        pageData.contentHtml = processedContent.toString();
    }

    // Process markdown for any sections
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

    return {
        props: {
            page: { ...pageData, __metadata: page.__metadata },
            global: {
                site: { title: 'Andrew Hayles' },
                pages: allPages,
                posts: allPosts,
                projects: allProjects,
            }
        }
    };
}