import { getPage } from '@/utils/get-page'; // Adjust import to your data-fetching util

export default async function handler(req, res) {
    const slug = req.query.slug;
    const page = await getPage(slug); // This function must get the content for one page
    
    if (!page || !page.code) {
        return res.status(404).json({ error: 'Code not found' });
    }
    
    // Return only the code
    res.status(200).json({ code: page.code });
}