import type {FeatureConfig} from '../../../shared';
import {Feature} from '../../../shared';

import FEATURES_LIST from './features-list';

const FEATURES: FeatureConfig = {};

export function getFeaturesConfig(appEnvironment?: string) {
    if (!appEnvironment) {
        throw new Error('Environment must be specified');
    }

    FEATURES_LIST.forEach(({name, state}) => {
        // @ts-ignore
        registerFeature(name, state[appEnvironment]);
    });

    let featureConfigMissed = false;

    Object.values(Feature).forEach((feature) => {
        if (typeof FEATURES[feature] === 'undefined') {
            featureConfigMissed = true;
            console.error(`Missed config for feature: ${feature}`);
        }
    });

    if (featureConfigMissed) {
        console.error('Missed config for some feature, see output above');
    }

    return FEATURES;
}

const registerFeature = (featureName: Feature, FeatureStatus: boolean) => {
    if (typeof FEATURES[featureName] !== 'undefined') {
        throw new Error(`Feature ${featureName} is already registered!`);
    }

    FEATURES[featureName] = FeatureStatus;
};
