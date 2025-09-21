// src/lib/pages.ts

// This is a list of pages to build. We'll just build the homepage for now.
export const getPagePaths = async () => {
    return [{ params: { slug: [] } }]; // Represents the homepage URL "/"
};

// This function provides sample data for a page.
export const getPage = async (slug: string) => {
    // For the homepage, return some sample content.
    if (slug === '/') {
        return {
            type: 'PageLayout',
            title: 'Home',
            sections: [],
            __metadata: {
                id: 'content/pages/index.md',
                modelName: 'PageLayout'
            }
        } as const; // ✅ THIS SMALL ADDITION FIXES THE ERROR
    }
    // For any other page, return null (not found).
    return null;
};