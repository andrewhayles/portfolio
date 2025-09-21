import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentBaseDir = 'content';

// Helper function to read and parse all markdown files from a directory
function getContent(dirPath: string) {
    const absDirPath = path.join(process.cwd(), contentBaseDir, dirPath);
    const fileNames = glob.sync('**/*.md', { cwd: absDirPath });
    return fileNames.map(fileName => {
        const id = path.join(dirPath, fileName);
        const urlPath = '/' + id.replace(/\\/g, '/').replace(/\.md$/, '').replace(/\/index$/, '') || '/';
        return {
            __metadata: { id, urlPath }
        };
    });
}

// Helper functions to get specific content types
const getPages = () => getContent('pages');
const getAllPosts = () => getContent('posts');
const getAllProjects = () => getContent('projects');

// *** THIS IS THE MISSING FUNCTION THAT IS NOW ADDED ***
function getAllContent() {
    return {
        allPages: getPages(),
        allPosts: getAllPosts(),
        allProjects: getAllProjects()
    };
}

// Helper function to find a post by its URL path (slug)
function getPostBySlug(urlPath: string, allPosts: any[]) {
    return allPosts.find(post => post.__metadata.urlPath === urlPath);
}

// Helper function to find a project by its URL path (slug)
function getProjectBySlug(urlPath: string, allProjects: any[]) {
    return allProjects.find(project => project.__metadata.urlPath === urlPath);
}

// This function gets the props for a single page during the build
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
                site: { title: 'Andrew Hayles' },
                pages: allPages,
                posts: allPosts,
                projects: allProjects,
            }
        }
    };
}

// This function provides all possible page URLs to Next.js
export function getAllPagePaths(): string[] {
    const { allPages, allPosts, allProjects } = getAllContent();
    return [
        ...allPages.map(p => p.__metadata.urlPath),
        ...allPosts.map(p => p.__metadata.urlPath),
        ...allProjects.map(p => p.__metadata.urlPath)
    ];
}