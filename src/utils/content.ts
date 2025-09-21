import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentBaseDir = 'content';

// Helper to get all content file paths from a directory
function getContentPaths(dir: string): string[] {
    const contentDir = path.join(process.cwd(), contentBaseDir, dir);
    if (!fs.existsSync(contentDir)) {
        return [];
    }
    return glob.sync('**/*.md', { cwd: contentDir });
}

// Helper to generate metadata for a piece of content
function getContentMetadata(filePath: string, dir: string) {
    const id = path.join(dir, filePath);
    let urlPath = '/' + id.replace(/\\/g, '/').replace(/\.md$/, '');
    if (urlPath.endsWith('/index')) {
        urlPath = urlPath.slice(0, -'/index'.length) || '/';
    }
     if (urlPath.startsWith('/pages')) {
        urlPath = urlPath.substring('/pages'.length) || '/';
    }
    return { id, urlPath };
}

// Main function to get all data for your site pages, posts, and projects
function getAllContent() {
    const pageFiles = getContentPaths('pages');
    const postFiles = getContentPaths('posts');
    const projectFiles = getContentPaths('projects');

    const allPages = pageFiles.map(file => ({ __metadata: getContentMetadata(file, 'pages') }));
    const allPosts = postFiles.map(file => ({ __metadata: getContentMetadata(file, 'posts') }));
    const allProjects = projectFiles.map(file => ({ __metadata: getContentMetadata(file, 'projects') }));

    return { allPages, allPosts, allProjects };
}

// Gets the data for a single page at build time
export async function getPageProps(urlPath: string) {
    const { allPages, allPosts, allProjects } = getAllContent();
    const allContent = [...allPages, ...allPosts, ...allProjects];
    
    const contentObject = allContent.find(p => p.__metadata.urlPath === urlPath);

    if (!contentObject) {
        return { notFound: true };
    }

    const filePath = path.join(process.cwd(), contentBaseDir, contentObject.__metadata.id);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);
    const pageData = matterResult.data as any;

    if (matterResult.content) {
        const processedContent = await remark().use(html).process(matterResult.content);
        pageData.contentHtml = processedContent.toString();
    }
    
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
             if (section.type === 'FeaturedItemsSection' && section.items) {
                for (const item of section.items) {
                    if (item.text) {
                        const processed = await remark().use(html).process(item.text);
                        item.textHtml = processed.toString();
                        delete item.text;
                    }
                }
            }
        }
    }

    return {
        props: {
            page: {
                ...contentObject,
                ...pageData,
            },
            global: {
                site: { title: 'Andrew Hayles' }, // This was the missing part
                pages: allPages,
                posts: allPosts,
                projects: allProjects,
            }
        }
    };
}

// This function provides all possible page URLs to Next.js for static generation
export function getAllPagePaths(): string[] {
    const { allPages, allPosts, allProjects } = getAllContent();
    return [
        ...allPages.map(p => p.__metadata.urlPath),
        ...allPosts.map(p => p.__metadata.urlPath),
        ...allProjects.map(p => p.__metadata.urlPath)
    ];
}