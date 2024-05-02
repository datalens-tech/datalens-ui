import fs from 'fs';
import path from 'path';

import {Feature} from '../../../../src/shared';

const featuresListPath = path.resolve(
    process.cwd(),
    'src/server/components/features/features-list',
);

const FEATURES_LIST: any = [];

fs.readdirSync(featuresListPath).forEach((file: string) => {
    if (file === 'index.ts') {
        return;
    }

    FEATURES_LIST.push(require(path.resolve(featuresListPath, file)).default);
});

const FEATURES = FEATURES_LIST.reduce(
    (acc: Record<string, boolean>, {name}: {name: string}) => {
        acc[name] = true;
        return acc;
    },
    {} as Record<string, boolean>,
);

const missedFeatures: string[] = [];

Object.values(Feature).forEach((feature) => {
    if (typeof FEATURES[feature] === 'undefined') {
        missedFeatures.push(feature);
        console.error(`Missed config for feature: ${feature}`);
    }
});

if (missedFeatures.length) {
    throw new Error('Missed config for some feature, see output above');
}
