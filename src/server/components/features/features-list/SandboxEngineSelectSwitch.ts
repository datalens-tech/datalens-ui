import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.SandboxEngineSelectSwitch,
    state: {
        development: false,
        production: false
    },
});
