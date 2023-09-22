import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.MailWelcomeNewUser,
    state: {
        development: true,
        production: true,
    },
});
