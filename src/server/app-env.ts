import {AppInstallation, AppMode} from '../shared';

const mode = process.env.APP_MODE;
export const appInstallation = process.env.APP_INSTALLATION;
export const appEnv = process.env.APP_ENV;

export const isFullMode = mode === AppMode.Full;
export const isDatalensMode = mode === AppMode.Datalens;
export const isChartsMode = mode === AppMode.Charts;
export const isOpensourceInstallation = appInstallation === AppInstallation.Opensource;

export const unitedStorageConfigLoadedTimeout = parseInt(process.env.UNITED_STORAGE_CONFIG_LOADED_TIMEOUT || '10000'); 
