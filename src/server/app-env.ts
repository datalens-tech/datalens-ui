import {AppInstallation, AppMode} from '../shared';

const mode = process.env.APP_MODE;
export const appInstallation = process.env.APP_INSTALLATION;
export const appEnv = process.env.APP_ENV;
export const releaseVersion = process.env.RELEASE_VERSION;

export const isFullMode = mode === AppMode.Full;
export const isDatalensMode = mode === AppMode.Datalens;
export const isChartsMode = mode === AppMode.Charts;
export const isOpensourceInstallation = appInstallation === AppInstallation.Opensource;
