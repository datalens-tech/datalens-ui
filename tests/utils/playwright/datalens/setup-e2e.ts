import {FullConfig} from '@playwright/test';

import {datalensTestSetup} from './datalens-test-setup';

import {AUTH_SETTINGS} from '../constants';

export default async function (config: FullConfig) {
    await datalensTestSetup({config, authSettings: AUTH_SETTINGS});
}
