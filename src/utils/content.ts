import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getAllPosts, getAllProjects, getPages, getPostBySlug, getProjectBySlug } from './static-props-resolvers';

const contentBaseDir = 'content';

// This function now does everything: finds the right markdown file,
// parses its metadata, and converts its content to HTML.
export async function getPageProps(urlPath: string) {
    const contentDir = path.join(process.cwd(), contentBaseDir);
    const allPages = getPages(contentDir);
    const allPosts = getAllPosts(contentDir);
    const allProjects = getAllProjects(contentDir);

    const props: any = {
        page: null,
        global: {
            site: {
                title: 'Andrew Hayles' 
            },
            pages: allPages,
            posts: allPosts,
            projects: allProjects
        }
    };
    
    // Find the matching page or post for the given URL
    const page = allPages.find((p) => p.__metadata.urlPath === urlPath);
    const post = getPostBySlug(urlPath, allPosts);
    const project = getProjectBySlug(urlPath, allProjects);

    const contentObject = page || post || project;

    if (!contentObject) {
        return props;
    }
    
    const filePath = path.join(contentDir, contentObject.__metadata.id);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into an HTML string
    const processedContent = await remark().use(html).process(matterResult.content);
    const contentHtml = processedContent.toString();

    props.page = {
        ...contentObject,
        ...matterResult.data,
        contentHtml: contentHtml
    };
    
    return props;
}

export function getAllPagePaths(): string[] {
    const contentDir = path.join(process.cwd(), contentBaseDir);
    const allPages = getPages(contentDir);
    const allPosts = getAllPosts(contentDir);
    const allProjects = getAllProjects(contentDir);
    return [
        ...allPages.map((p) => p.__metadata.urlPath),
        ...allPosts.map((p) => p.__metadata.urlPath),
        ...allProjects.map((p) => p.__metadata.urlPath)
    ];
}