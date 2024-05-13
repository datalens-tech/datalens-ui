import {AppInstallation, AppMode, isTrueArg} from '../shared';

const mode = process.env.APP_MODE;
export const appInstallation = process.env.APP_INSTALLATION;
export const appEnv = process.env.APP_ENV;

export const isFullMode = mode === AppMode.Full;
export const isDatalensMode = mode === AppMode.Datalens;
export const isChartsMode = mode === AppMode.Charts;
export const isOpensourceInstallation = appInstallation === AppInstallation.Opensource;

export const isZitadelEnabled = isTrueArg(process.env.ZITADEL);

export const clientId = process.env.CLIENT_ID || '';
export const clientSecret = process.env.CLIENT_SECRET || '';

export const zitadelProjectId = process.env.ZITADEL_PROJECT_ID || '';

export const zitadelUri = process.env.ZITADEL_URI || '';
export const appHostUri = process.env.APP_HOST_URI || '';
export const cookieSecret = process.env.COOKIE_SECRET || '';

export const serviceClientId = process.env.SERVICE_CLIENT_ID || '';
export const serviceClientSecret = process.env.SERVICE_CLIENT_SECRET || '';
