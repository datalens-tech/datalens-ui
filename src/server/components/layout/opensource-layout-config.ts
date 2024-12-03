import type {RenderParams} from '@gravity-ui/app-layout';

import type {AppEnvironment, AppInstallation, DLGlobalData, DLUser} from '../../../shared';
import {FALLBACK_LANGUAGES, Language, USER_SETTINGS_KEY} from '../../../shared';
import type {AppLayoutSettings, GetLayoutConfig} from '../../types/app-layout';
import {addTranslationsScript} from '../../utils/language';
import {getUserInfo} from '../zitadel/utils';

import {getChartkitLayoutSettings, getPlatform} from './utils';

export const getOpensourceLayoutConfig: GetLayoutConfig = async (args) => {
    const {req, res, settingsId} = args;

    const config = req.ctx.config;
    const requestId = req.id || '';

    const getAppLayoutSettings = req.ctx.get('getAppLayoutSettings');

    const appLayoutSettings: AppLayoutSettings = getAppLayoutSettings(req, res, settingsId);

    const regionalEnvConfig = req.ctx.config.regionalEnvConfig;

    const allowLanguages = (regionalEnvConfig?.allowLanguages || FALLBACK_LANGUAGES) as Language[];

    const cookie = req.cookies[USER_SETTINGS_KEY];
    let lang = Language.En;
    let theme;
    try {
        const preparedCookie = JSON.parse(cookie);
        lang = preparedCookie.language;
        theme = preparedCookie.theme;
    } catch {
        console.warn('no userSettings in cookie');
    }

    const isAllowed = allowLanguages.includes(lang || '');
    if (!isAllowed) {
        lang = Language.En;
    }

    const isZitadelEnabled = req.ctx.config.isZitadelEnabled;

    // TODO: check and remove optional props;
    let user: DLUser = {lang} as DLUser;
    const userSettings = {};
    let iamUserId = '';
    const {scripts: chartkitScripts, inlineScripts: chartkitInlineScripts} =
        getChartkitLayoutSettings(config.chartkitSettings);

    if (isZitadelEnabled) {
        const userInfo = getUserInfo(req, res);
        iamUserId = userInfo.uid as string;
        user = {...user, ...userInfo};
    }

    const DL: DLGlobalData = {
        user,
        userSettings,
        iamUserId,
        deviceType: getPlatform(req.headers['user-agent']),
        requestId,
        env: config.appEnv as AppEnvironment,
        installationType: config.appInstallation as AppInstallation,
        serviceName: config.serviceName,
        endpoints: config.endpoints.ui,
        features: config.features,
        meta: req.ctx.getMetadata(),
        chartkitSettings: config.chartkitSettings,
        allowLanguages,
        headersMap: req.ctx.config.headersMap,
        isZitadelEnabled,
        ymapApiKey: config.chartkitSettings?.yandexMap?.token,
        connectorIcons: res.locals.connectorIcons,
        apiPrefix: config.apiPrefix,
        ...appLayoutSettings.DL,
    };
    const renderConfig: RenderParams<{DL: DLGlobalData}> = {
        nonce: req.nonce,
        data: {DL},
        lang,
        icon: {
            type: 'image/ico',
            href: config.faviconUrl,
            sizes: '32x32',
        },
        inlineScripts: ['window.DL = window.__DATA__.DL', ...chartkitInlineScripts],
        scripts: [addTranslationsScript({allowLanguages, lang}), ...chartkitScripts],
        links: [
            {
                href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
                rel: 'stylesheet',
            },
        ],
        pluginsOptions: {
            layout: {name: appLayoutSettings.bundleName},
            ...(theme ? {uikit: {theme}} : {}),
        },
        ...appLayoutSettings.renderConfig,
    };

    return renderConfig;
};
