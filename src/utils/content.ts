import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { glob } from 'glob';

const contentBaseDir = 'content';

// Helper function to read and parse all markdown files from a directory
function getContent(dirPath: string) {
    const absDirPath = path.join(process.cwd(), contentBaseDir, dirPath);
    const fileNames = glob.sync('**/*.md', { cwd: absDirPath });
    return fileNames.map(fileName => {
        const id = path.join(dirPath, fileName);
        const urlPath = '/' + id.replace(/\.md$/, '').replace(/\/index$/, '');
        return {
            __metadata: { id, urlPath }
        };
    });
}

// Helper functions to get specific content types
const getPages = () => getContent('pages');
const getAllPosts = () => getContent('posts');
const getAllProjects = () => getContent('projects');

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
    const allPages = getPages();
    const allPosts = getAllPosts();
    const allProjects = getAllProjects();

    const contentObject = allPages.find(p => p.__metadata.urlPath === urlPath) || 
                          getPostBySlug(urlPath, allPosts) || 
                          getProjectBySlug(urlPath, allProjects);

    if (!contentObject) {
        const page = allPages.find((p) => p.__metadata.urlPath === '/'); // Fallback to homepage
        props.page = page;
        return props;
    }
    
    const filePath = path.join(process.cwd(), contentBaseDir, contentObject.__metadata.id);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);

    const processedContent = await remark().use(html).process(matterResult.content);
    const contentHtml = processedContent.toString();

    const props = {
        page: {
            ...contentObject,
            ...matterResult.data,
            contentHtml: contentHtml,
        },
        global: {
            site: { title: 'Andrew Hayles' },
            pages: allPages,
            posts: allPosts,
            projects: allProjects,
        }
    };
    
    return props;
}

// This function provides all possible page URLs to Next.js
export function getAllPagePaths(): string[] {
    const allPages = getPages();
    const allPosts = getAllPosts();
    const allProjects = getAllProjects();
    
    return [
        ...allPages.map(p => p.__metadata.urlPath),
        ...allPosts.map(p => p.__metadata.urlPath),
        ...allProjects.map(p => p.__metadata.urlPath)
    ];
}