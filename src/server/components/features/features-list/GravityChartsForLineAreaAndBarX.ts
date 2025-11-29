import {Feature, isTrueArg} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.GravityChartsForLineAreaAndBarX,
    state: {
        development: !isTrueArg(process.env.HC),
        production: !isTrueArg(process.env.HC),
    },
});
