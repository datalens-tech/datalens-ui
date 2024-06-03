import type {AppEnvironment, AppInstallation} from '../../constants';

import {opensourceSources} from './opensource';

export const resolveSource = (
    _appInstallation: AppInstallation,
    appEnvironment: AppEnvironment,
) => {
    return opensourceSources[appEnvironment]!;
};
