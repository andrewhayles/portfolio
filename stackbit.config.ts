import { defineStackbitConfig } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';
import { allModels } from './.stackbit/models';

export default defineStackbitConfig({
    stackbitVersion: '~0.7.0',
    ssgName: 'nextjs',
    nodeVersion: '18',
    // ✅ This section properly defines where to find your content
    contentSources: [
        new GitContentSource({
            rootPath: __dirname,
            models: allModels,
            documents: [
                {
                    name: 'pages',
                    type: 'page',
                    dir: 'content/pages',
                    // This is the crucial part that includes both file types
                    matcher: ['**/*.md', '**/*.mdx']
                },
                {
                    name: 'data',
                    type: 'data',
                    dir: 'content/data'
                }
            ]
        })
    ],
    presetSource: {
        type: 'files',
        presetDirs: ['./.stackbit/presets']
    },
    styleObjectModelName: 'ThemeStyle'
});