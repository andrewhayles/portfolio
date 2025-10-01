import * as fs from 'fs';
import path from 'path';
import glob from 'glob';
import frontmatter from 'front-matter';
import { allModels } from '.stackbit/models';
import * as types from '@/types';
import { isDev } from './common';
import { PAGE_MODEL_NAMES, PageModelType } from '@/types/generated';

const contentBaseDir = 'content';
const pagesBaseDir = path.join(contentBaseDir, 'pages');
const supportedFileTypes = ['md', 'json'];

// --- UNCHANGED HELPER FUNCTIONS ---

const allReferenceFields = {};
allModels.forEach((model) => {
    model.fields.forEach((field) => {
        if (field.type === 'reference' || (field.type === 'list' && field.items?.type === 'reference')) {
            allReferenceFields[model.name + ':' + field.name] = true;
        }
    });
});

function isRefField(modelName: string, fieldName: string) {
    return !!allReferenceFields[modelName + ':' + fieldName];
}

function readContent(file: string): types.ContentObject {
    const rawContent = fs.readFileSync(file, 'utf8');
    let content = null;
    switch (path.extname(file).substring(1)) {
        case 'md':
            const parsedMd = frontmatter<Record<string, any>>(rawContent);
            content = {
                ...parsedMd.attributes,
                markdownContent: parsedMd.body
            };
            break;
        case 'json':
            content = JSON.parse(rawContent);
            break;
        default:
            throw Error(`Unhandled file type: ${file}`);
    }
    content.__metadata = { id: file, modelName: content.type };
    return content;
}

function deepClone(o: object) {
    return JSON.parse(JSON.stringify(o));
}

const skipList = ['__metadata'];
function annotateContentObject(o: any, prefix = '', depth = 0) {
    if (!isDev || !o || typeof o !== 'object' || !o.type || skipList.includes(prefix)) return;

    if (depth === 0) {
        if (o.__metadata?.id) {
            o[types.objectIdAttr] = o.__metadata.id;
        }
    } else {
        o[types.fieldPathAttr] = prefix;
    }

    Object.entries(o).forEach(([k, v]) => {
        if (v && typeof v === 'object') {
            const fieldPrefix = (prefix ? prefix + '.' : '') + k;

            if (Array.isArray(v)) {
                v.forEach((e, idx) => {
                    const elementPrefix = fieldPrefix + '.' + idx;
                    annotateContentObject(e, elementPrefix, depth + 1);
                });
            } else {
                annotateContentObject(v, fieldPrefix, depth + 1);
            }
        }
    });
}

// --- NEW EFFICIENT FUNCTIONS ---

/**
 * NEW: A lightweight function that only gets the URL paths for all pages.
 * It does NOT read or parse file content. Used by getStaticPaths.
 */
export function getAllPagePaths(): string[] {
    const globPattern = `${pagesBaseDir}/**/*.{${supportedFileTypes.join(',')}}`;
    const files = glob.sync(globPattern);

    return files.map((file) => {
        let url = file.slice(pagesBaseDir.length).split('.')[0];
        if (url.endsWith('/index')) {
            url = url.slice(0, -6) || '/';
        }
        return url;
    });
}

/**
 * NEW: Gets the props for a single page based on its URL path.
 * This is the main function to be used by getStaticProps.
 */
export function getPageProps(urlPath: string): PageComponentProps | null {
    const pageFilePath = urlPathToFilePath(urlPath);
    if (!pageFilePath) {
        return null;
    }

    // 1. Read the specific page file
    const pageContent = readContent(pageFilePath);
    pageContent.__metadata.urlPath = urlPath;

    // 2. Read global site configuration.
    //    Adjust the path if your global config is located elsewhere.
    const globalConfigPath = 'content/data/config.json';
    const globalContent = readContent(globalConfigPath);

    // 3. Resolve references only for the loaded content
    const cache = {}; // Cache to avoid reading the same file multiple times
    resolveOnDemand(pageContent, cache);
    resolveOnDemand(globalContent, cache);
    
    // 4. Annotate for Stackbit visual editor (if in dev mode)
    const props = {
        page: deepClone(pageContent),
        // BEFORE:
        // global: deepClone(globalContent)
        // AFTER: Wrap globalContent in a 'site' property to match the expected type
        global: {
            site: deepClone(globalContent)
        }
    };
    annotateContentObject(props.page);
    annotateContentObject(props.global.site); // Also update this line

    return props as PageComponentProps;
}

/**
 * NEW: Converts a URL path to a filesystem path.
 * e.g., '/about' => 'content/pages/about.md'
 * e.g., '/' => 'content/pages/index.md'
 */
function urlPathToFilePath(urlPath: string): string | null {
    // Handle the root path
    if (urlPath === '/') {
        for (const ext of supportedFileTypes) {
            const filePath = path.join(pagesBaseDir, `index.${ext}`);
            if (fs.existsSync(filePath)) {
                return filePath;
            }
        }
    }

    // Handle other paths
    const requestPath = urlPath.substring(1); // remove leading '/'
    for (const ext of supportedFileTypes) {
        // Check for file like 'about.md'
        const filePath = path.join(pagesBaseDir, `${requestPath}.${ext}`);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
        // Check for directory with index file like 'about/index.md'
        const indexFilePath = path.join(pagesBaseDir, requestPath, `index.${ext}`);
        if (fs.existsSync(indexFilePath)) {
            return indexFilePath;
        }
    }

    return null;
}

/**
 * NEW: A recursive function to resolve references on-demand.
 * It reads referenced files as it finds them.
 */
function resolveOnDemand(content: types.ContentObject, cache: Record<string, types.ContentObject>) {
    if (!content || !content.type) return;

    for (const fieldName in content) {
        let fieldValue = content[fieldName];
        if (!fieldValue) continue;
        
        const isRef = isRefField(content.type, fieldName);

        if (isRef && typeof fieldValue === 'string') { // Single reference
            if (!cache[fieldValue]) {
                cache[fieldValue] = readContent(fieldValue);
            }
            content[fieldName] = cache[fieldValue];
            resolveOnDemand(content[fieldName], cache); // Recurse into the resolved object
        } else if (isRef && Array.isArray(fieldValue)) { // List of references
            content[fieldName] = fieldValue.map((fileRef: string) => {
                if (!cache[fileRef]) {
                    cache[fileRef] = readContent(fileRef);
                }
                const resolvedRef = cache[fileRef];
                resolveOnDemand(resolvedRef, cache);
                return resolvedRef;
            });
        } else if (typeof fieldValue === 'object') {
            if (Array.isArray(fieldValue)) {
                fieldValue.forEach(item => resolveOnDemand(item, cache));
            } else {
                resolveOnDemand(fieldValue, cache);
            }
        }
    }
}