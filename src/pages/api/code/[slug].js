import { allContent } from '@/utils/content';

export default function handler(req, res) {
    const { slug } = req.query;
    const allData = allContent();

    // Find the project where the end of its URL path matches the slug
    const page = allData.find((p) => p.__metadata.urlPath.endsWith(`/${slug}`));

    // If the page or its code doesn't exist, return an error
    if (!page || !page.code) {
        return res.status(404).json({ error: 'Code not found' });
    }

    // Otherwise, return just the code
    res.status(200).json({ code: page.code });
}