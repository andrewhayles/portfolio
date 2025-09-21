import * as fs from 'fs';
import path from 'path';
import glob from 'glob';
import frontmatter from 'front-matter';
import slugify from 'slugify';
import { allModels } from '.stackbit/models';
import * as types from '@/types';
import { isDev } from './common';
import { PAGE_MODEL_NAMES, PageModelType } from '@/types/generated';
import { resolveStaticProps } from './static-props-resolvers';


const contentBaseDir = 'content';
const pagesBaseDir = contentBaseDir + '/pages';

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

const supportedFileTypes = ['md', 'json'];
function contentFilesInPath(dir: string) {
    const globPattern = `${dir}/**/*.{${supportedFileTypes.join(',')}}`;
    return glob.sync(globPattern);
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

    content.__metadata = {
        id: file,
        modelName: content.type
    };

    return content;
}

function resolveReferences(content: types.ContentObject, fileToContent: Record<string, types.ContentObject>) {
    if (!content || !content.type) return;

    const modelName = content.type;
    if (!content.__metadata) content.__metadata = { modelName };

    for (const fieldName in content) {
        let fieldValue = content[fieldName];
        if (!fieldValue) continue;

        const isRef = isRefField(modelName, fieldName);
        if (Array.isArray(fieldValue)) {
            if (fieldValue.length === 0) continue;
            if (isRef && typeof fieldValue[0] === 'string') {
                fieldValue = fieldValue.map((filename) => fileToContent[filename]);
                content[fieldName] = fieldValue;
            }
            if (typeof fieldValue[0] === 'object') {
                fieldValue.forEach((o) => resolveReferences(o, fileToContent));
            }
        } else {
            if (isRef && typeof fieldValue === 'string') {
                fieldValue = fileToContent[fieldValue];
                content[fieldName] = fieldValue;
            }
            if (typeof fieldValue === 'object') {
                resolveReferences(fieldValue, fileToContent);
            }
        }
    }
}

function contentUrl(obj: types.ContentObject): string | undefined {
    const pagesBaseDir = 'content/pages';
    const fileName = obj.__metadata.id;

    if (!fileName.startsWith(pagesBaseDir)) {
        console.warn('Content file', fileName, 'expected to be a page, but is not under', pagesBaseDir);
        return undefined;
    }

    // remove the base directory and the file extension
    let url = fileName.slice(pagesBaseDir.length).split('.')[0];

    // if the url ends with '/index', remove it
    if (url.endsWith('/index')) {
        url = url.slice(0, -6) || '/';
    }

    return url;
}

export function getAllPagePaths() {
    const allData = allContent(); // You can keep using allContent here for simplicity
    return allData.map((obj) => obj.__metadata.urlPath).filter(Boolean);
}

export async function getPageProps(urlPath: string) {
    // 1. Get all content data ONCE.
    const allData = allContent();
    const props = resolveStaticProps(urlPath, allData) as any;

    if (!props) {
        return null;
    }

    // 2. Create a safe, deep copy to work with.
    const leanProps = JSON.parse(JSON.stringify(props));

    // 3. TARGETED PRUNING:
    //    Find the oversized 'FeaturedProjectsSection' and replace its heavy projects
    //    with the lightweight previews from your getProjectPreviews function.
    if (leanProps.sections) {
        // We get the complete list of previews once.
        const allProjectPreviews = getProjectPreviews(allData);

        leanProps.sections.forEach((section: any) => {
            if (section.type === 'FeaturedProjectsSection' && section.projects) {
                // For each full project in the section, find its matching lightweight preview.
                section.projects = section.projects.map((project: any) => 
                    allProjectPreviews.find(p => p.__metadata.id === project.__metadata.id) || project
                );
            }
        });
    }

    // 4. Handle code highlighting for single-page content.

    // 5. Return the final, fixed props object.
    return leanProps;
}

export function getProjectPreviews(allData: types.ContentObject[]) {
    const allProjects = allData.filter(
        (content) => content.type === 'ProjectLayout'
    );

    // Create a new, smaller object for each project with only the fields you need
    return allProjects.map((project: any) => {
        return {
            __metadata: project.__metadata,
            type: project.type,
            title: project.title,
            description: project.description?.substring(0, 150) + '...' || '', // Create an excerpt
            featuredImage: project.featuredImage
        };
    });
}

export function allContentLight() {
    const allData = allContent();
    const cleanData = JSON.parse(JSON.stringify(allData));
    cleanData.forEach((item: any) => {
        if (item.code) {
            delete item.code;
        }
    });
    return cleanData;
}

export function allContent(): types.ContentObject[] {
    let objects = contentFilesInPath(contentBaseDir).map((file) => readContent(file));

    allPages(objects).forEach((obj) => {
        obj.__metadata.urlPath = contentUrl(obj);
    });

    const fileToContent: Record<string, types.ContentObject> = Object.fromEntries(objects.map((e) => [e.__metadata.id, e]));
    objects.forEach((e) => resolveReferences(e, fileToContent));

    objects = objects.map((e) => deepClone(e));
    objects.forEach((e) => annotateContentObject(e));

    return objects;
}

export function allPages(allData: types.ContentObject[]): PageModelType[] {
    return allData.filter((obj) => {
        return PAGE_MODEL_NAMES.includes(obj.__metadata.modelName);
    }) as PageModelType[];
}

/*
Add annotation data to a content object and its nested children.
*/
const skipList = ['__metadata'];
const logAnnotations = false;

function annotateContentObject(o: any, prefix = '', depth = 0) {
    if (!isDev || !o || typeof o !== 'object' || !o.type || skipList.includes(prefix)) return;

    const depthPrefix = '--'.repeat(depth);
    if (depth === 0) {
        if (o.__metadata?.id) {
            o[types.objectIdAttr] = o.__metadata.id;
            if (logAnnotations) console.log('[annotateContentObject] added object ID:', depthPrefix, o[types.objectIdAttr]);
        } else {
            if (logAnnotations) console.warn('[annotateContentObject] NO object ID:', o);
        }
    } else {
        o[types.fieldPathAttr] = prefix;
        if (logAnnotations) console.log('[annotateContentObject] added field path:', depthPrefix, o[types.fieldPathAttr]);
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

function deepClone(o: object) {
    return JSON.parse(JSON.stringify(o));
}
