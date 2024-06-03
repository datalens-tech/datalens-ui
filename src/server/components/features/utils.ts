import type {Feature} from '../../../shared';

export type FeatureState = {
    development: boolean;
    production: boolean;
};

export type FeatureConfig = {
    name: Feature;
    state: FeatureState;
};

type RawFeatureConfig = {
    name: Feature;
    state: Partial<FeatureState>;
};

export const createFeatureConfig = (featureConfig: RawFeatureConfig): FeatureConfig => {
    return {
        name: featureConfig.name,
        state: {
            development: featureConfig.state.development || false,
            production: featureConfig.state.production || false,
        },
    };
};
