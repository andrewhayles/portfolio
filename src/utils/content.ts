import * as fs from 'fs';
import path from 'path';
import glob from 'glob';
import frontmatter from 'front-matter';
import { allModels } from '.stackbit/models';
import * as types from '@/types';
import { isDev } from './common';
import { PAGE_MODEL_NAMES, PageComponentProps } from '@/types';

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
    // FIX: Changed 'model.name' to the correct 'modelName' variable
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

// --- EFFICIENT DATA FETCHING FUNCTIONS ---

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

export function getPageProps(urlPath: string): PageComponentProps | null {
    const pageFilePath = urlPathToFilePath(urlPath);
    if (!pageFilePath) {
        return null;
    }

    const pageContent = readContent(pageFilePath);
    pageContent.__metadata.urlPath = urlPath;

    // Load global site configuration
    const globalConfigPath = 'content/data/config.json';
    const siteContent = readContent(globalConfigPath);

    // Load global theme configuration
    // IMPORTANT: Make sure this file exists at 'content/data/theme.json'
    const themeConfigPath = 'content/data/theme.json';
    const themeContent = readContent(themeConfigPath);
    
    const cache = {};
    resolveOnDemand(pageContent, cache);
    resolveOnDemand(siteContent, cache);
    resolveOnDemand(themeContent, cache);
    
    const props = {
        page: deepClone(pageContent),
        global: {
            site: deepClone(siteContent),
            theme: deepClone(themeContent)
        }
    };

    annotateContentObject(props.page);
    annotateContentObject(props.global.site);
    annotateContentObject(props.global.theme);

    return props as PageComponentProps;
}

function urlPathToFilePath(urlPath: string): string | null {
    if (urlPath === '/') {
        for (const ext of supportedFileTypes) {
            const filePath = path.join(pagesBaseDir, `index.${ext}`);
            if (fs.existsSync(filePath)) return filePath;
        }
    }
    const requestPath = urlPath.substring(1);
    for (const ext of supportedFileTypes) {
        const filePath = path.join(pagesBaseDir, `${requestPath}.${ext}`);
        if (fs.existsSync(filePath)) return filePath;
        const indexFilePath = path.join(pagesBaseDir, requestPath, `index.${ext}`);
        if (fs.existsSync(indexFilePath)) return indexFilePath;
    }
    return null;
}

function resolveOnDemand(content: types.ContentObject, cache: Record<string, types.ContentObject>) {
    if (!content || !content.type) return;
    for (const fieldName in content) {
        let fieldValue = content[fieldName];
        if (!fieldValue) continue;
        const isRef = isRefField(content.type, fieldName);
        if (isRef && typeof fieldValue === 'string') {
            if (!cache[fieldValue]) cache[fieldValue] = readContent(fieldValue);
            content[fieldName] = cache[fieldValue];
            resolveOnDemand(content[fieldName], cache);
        } else if (isRef && Array.isArray(fieldValue)) {
            content[fieldName] = fieldValue.map((fileRef: string) => {
                if (!cache[fileRef]) cache[fileRef] = readContent(fileRef);
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