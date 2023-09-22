import fs from 'fs';
import path from 'path';

import type {FeatureConfig} from '../utils';

const normalizedPath = path.join(__dirname);

const FEATURES_LIST: FeatureConfig[] = [];

const isBuildMetaFile = (file: string) => {
    return file.endsWith('d.ts') || file.endsWith('js.map');
};

fs.readdirSync(normalizedPath).forEach(function (file: string) {
    if (file !== 'index.js' && file !== 'index.ts' && !isBuildMetaFile(file)) {
        // eslint-disable-next-line security/detect-non-literal-require
        FEATURES_LIST.push(require(`./${file}`).default);
    }
});

export default FEATURES_LIST;
