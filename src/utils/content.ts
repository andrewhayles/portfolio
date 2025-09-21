import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentBaseDir = 'content';

// Helper to get all content file paths
function getContentPaths(dir: string): string[] {
    const contentDir = path.join(process.cwd(), contentBaseDir, dir);
    return glob.sync('**/*.md', { cwd: contentDir });
}

// Helper to generate metadata for a piece of content
function getContentMetadata(filePath: string, dir: string) {
    const id = path.join(dir, filePath);
    const urlPath = '/' + id.replace(/\.md$/, '').replace(/\/index$/, '');
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

// Provides all possible page URLs to Next.js for static generation
export function getAllPagePaths(): string[] {
    const { allPages, allPosts, allProjects } = getAllContent();
    return [
        ...allPages.map(p => p.__metadata.urlPath),
        ...allPosts.map(p => p.__metadata.urlPath),
        ...allProjects.map(p => p.__metadata.urlPath)
    ];
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
    const pageData = matterResult.data as any; // Cast as any to add properties

    // Convert markdown to HTML for the main content
    if (matterResult.content) {
        const processedContent = await remark().use(html).process(matterResult.content);
        pageData.contentHtml = processedContent.toString();
    }
    
    // Convert markdown for sections (Hero, Text, etc.)
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
            page: {
                ...contentObject,
                ...pageData,
            },
            global: {
                site: { title: 'Andrew Hayles' },
                pages: allPages,
                posts: allPosts,
                projects: allProjects,
            }
        }
    };
}