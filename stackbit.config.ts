import { defineStackbitConfig } from '@stackbit/types';
import { allModels } from './.stackbit/models';

const config = defineStackbitConfig({
    stackbitVersion: '~0.7.0',
    ssgName: 'nextjs',
    nodeVersion: '18',
    contentSources: [],
    presetSource: {
        type: 'files',
        presetDirs: ['./.stackbit/presets']
    },
    styleObjectModelName: 'ThemeStyle'
});
export default config;
