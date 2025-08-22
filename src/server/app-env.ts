import {AppInstallation, AppMode} from '../shared';

const mode = process.env.APP_MODE;
export const appInstallation = process.env.APP_INSTALLATION;
export const appEnv = process.env.APP_ENV;
export const releaseVersion = process.env.RELEASE_VERSION;
export const docsUrl = process.env.DOCS_URL;

export const isFullMode = false; //mode === AppMode.Full;
export const isDatalensMode = mode === AppMode.Datalens;
export const isChartsMode = mode === AppMode.Charts;
export const isApiMode = true; //mode === AppMode.Api;
export const isOpensourceInstallation = appInstallation === AppInstallation.Opensource;
