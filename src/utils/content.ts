import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentBaseDir = 'content';

function getAllContentFiles() {
    const contentDir = path.join(process.cwd(), contentBaseDir);
    return glob.sync('**/*.md', { cwd: contentDir });
}

export function getAllPagePaths() {
    const files = getAllContentFiles();
    return files.map(file => {
        const urlPath = '/' + file.replace(/\.md$/, '').replace(/\/index$/, '') || '/';
        return urlPath.startsWith('/pages') ? urlPath.substring('/pages'.length) : urlPath;
    });
}

export async function getPageProps(urlPath: string) {
    const allFiles = getAllContentFiles();
    
    // Find the correct file path matching the URL
    const matchedPath = allFiles.find(file => {
        let checkPath = '/' + file.replace(/\.md$/, '').replace(/\/index$/, '') || '/';
        if (checkPath.startsWith('/pages')) {
            checkPath = checkPath.substring('/pages'.length);
        }
        return checkPath === urlPath;
    });

    if (!matchedPath) {
        return { notFound: true };
    }

    const filePath = path.join(process.cwd(), contentBaseDir, matchedPath);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);
    const pageData = matterResult.data as any;

    if (matterResult.content) {
        const processedContent = await remark().use(html).process(matterResult.content);
        pageData.contentHtml = processedContent.toString();
    }
    
    if (pageData.sections) {
        for (const section of pageData.sections) {
            // Your existing logic for sections can go here if needed
        }
    }

    // This is a simplified props structure
    return {
        props: {
            page: {
                ...pageData,
                 __metadata: { urlPath }
            },
            global: {} // Add global props if needed
        }
    };
}