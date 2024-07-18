import type {LineShapeType} from '../../shared';
import {
    AppEnvironment,
    DeviceType,
    DlsAcl,
    EntryScope,
    ErrorContentTypes,
    FALLBACK_LANGUAGES,
    GRADIENT_PALETTES,
    GradientType,
    THREE_POINT_DEFAULT_ID,
    TWO_POINT_DEFAULT_ID,
    getAvailablePalettesMap,
    selectAvailableGradients,
    selectAvailablePalettes,
    selectGradient,
    selectPaletteById,
    selectShapes,
} from '../../shared';
import type {Gradient, GradientPalettes} from '../../shared/constants';
import type {ColorPalette} from '../../shared/types/color-palettes';
import type {DatalensGlobalState} from '../index';

import blueGrayRedIcon from '../assets/icons/gradients/blue-gray-red.svg';
import blueYellowRedIcon from '../assets/icons/gradients/blue-yellow-red.svg';
import blueIcon from '../assets/icons/gradients/blue.svg';
import cyanIcon from '../assets/icons/gradients/cyan.svg';
import goldenIcon from '../assets/icons/gradients/golden.svg';
import grayIcon from '../assets/icons/gradients/gray.svg';
import greenBlueIcon from '../assets/icons/gradients/green-blue.svg';
import greenIcon from '../assets/icons/gradients/green.svg';
import oceanicIcon from '../assets/icons/gradients/oceanic.svg';
import orangeBlueGreenIcon from '../assets/icons/gradients/orange-blue-green.svg';
import orangeGrayBlueIcon from '../assets/icons/gradients/orange-gray-blue.svg';
import orangeVioletBlueIcon from '../assets/icons/gradients/orange-violet-blue.svg';
import orangeYellowIcon from '../assets/icons/gradients/orange-yellow.svg';
import pinkGrayGreenIcon from '../assets/icons/gradients/pink-gray-green.svg';
import redBlueIcon from '../assets/icons/gradients/red-blue.svg';
import redOrangeGreenIcon from '../assets/icons/gradients/red-orange-green.svg';
import redIcon from '../assets/icons/gradients/red.svg';
import trafficLightIcon from '../assets/icons/gradients/traffic-light.svg';
import violetBlueGreenIcon from '../assets/icons/gradients/violet-blue-green.svg';
import violetOrangeIcon from '../assets/icons/gradients/violet-orange.svg';
import violetIcon from '../assets/icons/gradients/violet.svg';
import yellowGreenBlue from '../assets/icons/gradients/yellow-green-blue.svg';
import yellowIcon from '../assets/icons/gradients/yellow.svg';

export const KeyCodes = {
    ARROW_UP: 38,
    ARROW_DOWN: 40,
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    CAPS_LOCK: 20,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    INSERT: 45,
    DELETE: 46,
};

//
// in theory, here and in CHARTS-2366 in DL should not hide things like window.DL.UserSettings.theme for individual constants,
// In other words, here should be methods that check something in DL, for example, window.DL.env === AppEnvironment.Production,
// and a DL structure with default values must be guaranteed to access, for example, DL.UserSettings.theme,
// and not DL.USER_THEME (nevertheless, with frequent access, such a thing may be justified)
export const DL = {
    get SERVICE_NAME() {
        return window.DL.serviceName;
    },
    get IS_PRODUCTION() {
        return window.DL.env === AppEnvironment.Production || window.DL.env === AppEnvironment.Prod;
    },
    get IS_STAGING() {
        return window.DL.env === AppEnvironment.Staging;
    },
    get IS_PREPROD() {
        return window.DL.env === AppEnvironment.Preprod;
    },
    get IS_DEVELOPMENT() {
        return window.DL.env === AppEnvironment.Development;
    },
    get ENV() {
        return window.DL.env;
    },
    get IS_MOBILE() {
        return window.DL.deviceType === DeviceType.Phone;
    },
    get ENDPOINTS() {
        return window.DL.endpoints;
    },
    get NAVIGATION_ENDPOINT() {
        return window.DL.endpoints.navigation;
    },
    get REQUEST_ID() {
        return window.DL.requestId;
    },
    get REQUEST_ID_PREFIX() {
        return `dl.${this.REQUEST_ID.slice(0, 5)}`;
    },
    // Utils.isEnabledFeature - check if the feature is enabled
    get FEATURES() {
        return window.DL.features;
    },
    get DYNAMIC_FEATURES() {
        return window.DL.dynamicFeatures;
    },
    get USER() {
        return window.DL.user;
    },
    get USER_ID() {
        return window.DL.iamUserId || this.USER.uid;
    },
    get DLS_USER_ID() {
        return `user:${this.USER_ID}`;
    },
    get USER_LOGIN() {
        return window.DL.user.formattedLogin;
    },
    get USER_DISPLAY_NAME() {
        return window.DL.user.displayName;
    },
    get USER_FOLDER() {
        return `Users/${this.USER_LOGIN}/`;
    },
    get USER_FEDERATION() {
        return this.USER.federationId;
    },
    // There is a global and local federation:
    // global - in fact, this is an basic user.
    // local - such users cannot start new organizations, etc.
    get IS_LOCAL_FEDERATION_USER() {
        return Boolean(this.USER.isLocalFederationUser);
    },
    // it is better to use technotes/user-settings.md, because the data may change
    get USER_SETTINGS() {
        return window.DL.userSettings;
    },
    get USER_LANG() {
        return window.DL.user.lang || 'en';
    },
    get REGION_LANG() {
        return window.DL.langRegion;
    },
    get INT_LANDING_CONFIG_ENTRY_ID() {
        return window.DL.intLandingConfigEntryId;
    },
    get CURRENT_TENANT_ID() {
        return window.DL.currentTenantId;
    },
    get DISPLAY_SUPERUSER_SWITCH() {
        return Boolean(window.DL.displaySuperuserSwitch);
    },
    get META() {
        return window.DL.meta;
    },
    get LANDING_PAGE_ENTRY_META() {
        return window.DL.landingPageSettings?.entryMeta;
    },
    get LANDING_PAGE_ERROR_TYPE() {
        return window.DL.landingPageSettings?.errorType;
    },
    get LANDING_PAGE_SETTINGS() {
        return window.DL.landingPageSettings;
    },
    get IS_NOT_AUTHENTICATED() {
        return this.LANDING_PAGE_ERROR_TYPE === ErrorContentTypes.NOT_AUTHENTICATED;
    },
    get PUSH_SERVICE_CONFIG() {
        return window.DL.push;
    },
    get METRICA_COUNTERS() {
        return window.DL.metricaCounters;
    },
    get IS_LANDING() {
        return window.DL.isLanding;
    },
    get OAUTH_ENDPOINT() {
        return window.DL.oauthEndpoint!;
    },
    get YAMAP_API_KEY() {
        return window.DL.ymapApiKey;
    },
    get ALLOW_LANGUAGES() {
        return window.DL.allowLanguages ?? FALLBACK_LANGUAGES;
    },
    get WIDGET_MENU_GROUP_CONFIG() {
        return window.DL.widgetMenuGroupConfig ?? undefined;
    },
    get IAM_RESOURCES() {
        return window.DL.iamResources ?? undefined;
    },
    get TEMPLATE_WORKBOOK_ID() {
        return window.DL.templateWorkbookId;
    },
    get LEARNING_MATERIALS_WORKBOOK_ID() {
        return window.DL.learningMaterialsWorkbookId;
    },
    get TITLE() {
        return window.DL.title || '';
    },
    get PUBLIC_AUTHOR() {
        return window.DL.publicAuthor;
    },
    get EMBED() {
        return window.DL.embed;
    },
    get DOC_PATH_NAME() {
        return window.DL.docPathName;
    },
    get CHARTKIT_SETTINGS() {
        return window.DL.chartkitSettings || {};
    },
    get EXTRA_PALETTES() {
        return window.DL.extraPalettes || {};
    },
    get HEADERS_MAP() {
        return window.DL.headersMap || {};
    },
    get ZITADEL_ENABLED() {
        return window.DL.isZitadelEnabled === true;
    },
    get HIDE_NAVIGATION() {
        return window.DL.hideNavigation;
    },
    get RUN_ENDPOINT() {
        return window.DL.runEndpoint || '/api/run';
    },
};

export const LIGHT_THEME = 'light';
export const DARK_THEME = 'dark';
export const SYSTEM_THEME = 'system';

// monaco-editor common themes:
// https://github.com/microsoft/vscode/blob/main/src/vs/editor/standalone/common/themes.ts
export const LIGHT_THEME_MONACO = 'vs';
export const LIGHT_HC_THEME_MONACO = 'hc-light';
export const DARK_THEME_MONACO = 'vs-dark';
export const DARK_HC_THEME_MONACO = 'hc-black';

export const DATALENS_LIGHT_THEME_MONACO = 'vs-datalens';
export const DATALENS_LIGHT_HC_THEME_MONACO = 'vs-hc-datalens';
export const DATALENS_DARK_THEME_MONACO = 'vs-dark-datalens';
export const DATALENS_DARK_HC_THEME_MONACO = 'vs-dark-hc-datalens';

export const PRODUCT_NAME = 'DataLens';

export const PERMISSION = {
    READ: DlsAcl.View,
    WRITE: DlsAcl.Edit,
    ADMIN: DlsAcl.Adm,
    EXECUTE: DlsAcl.Execute,
};

export const URL_OPTIONS = {
    THEME: '_theme',
    EMBEDDED: '_embedded',
    NO_CONTROLS: '_no_controls',
    LANGUAGE: '_lang',
    ACTION_PARAMS_ENABLED: '_action_params',
    NO_SCROLL: '_no_scroll',
    AUTOUPDATE: '_autoupdate',
};

export const MIN_AUTOUPDATE_CHART_INTERVAL = 15;

export const DLS_SUBJECT = {
    ALL_ACTIVE_USERS: 'system_group:all_active_users',
};

/** @deprecated use EntryScope from shared */
export enum Scope {
    Dataset = 'dataset',
    Folder = 'folder',
    Dash = 'dash',
    Connection = 'connection',
    Widget = 'widget',
    Config = 'config',
}

export const ALL_SCOPES: string[] = Object.values(Scope);

export const SCOPE_WITH_EXECUTE: string[] = [Scope.Connection, Scope.Dataset];

export const OBJECT_SCOPES = [
    EntryScope.Widget,
    EntryScope.Dataset,
    EntryScope.Dash,
    EntryScope.Connection,
];

export const COPIED_WIDGET_STORAGE_KEY = 'dashCopiedItem';

export const CURRENT_CLOUD_STORE_KEY = 'dl_current_cloud';

export const RUBLE = '₽';

export const FORMULA_LANGUAGE_ID = 'datalens-formula';

export const QL_LANGUAGE_ID = 'datalens-ql';

export const SPLIT_PANE_RESIZER_CLASSNAME = 'dl-resizer';

export const BI_ERRORS = {
    MATERIALIZATION_NOT_FINISHED: 'ERR.DS_API.DB.MATERIALIZATION_NOT_FINISHED',
    NO_AVAILABLE_SUBPRODUCTS: 'ERR.DS_API.NO_AVAILABLE_SUBPRODUCTS',
    DATASET_REVISION_MISMATCH: 'ERR.DS_API.DATASET_REVISION_MISMATCH',
};

export const MODULE_TYPE = 'module';

export const URL_QUERY = {
    REV_ID_OLD: 'rev_id',
    REV_ID: 'revId',
    HIGHLIGHT_LINES: '_l',
    ACTIVE_TAB: '_t',
    CURRENT_PATH: 'currentPath',
    CHART_TYPE: 'chartType',
    TAB_ID: 'tab',
    CONNECTION_FORM: '_form',
    DEBUG: '_debug',
    OPEN_DASH_INFO: '_opened_info',
};

const GRADIENT_ICONS = {
    [GRADIENT_PALETTES.blueGradient.id]: blueIcon,
    [GRADIENT_PALETTES.blueGrayRedGradient.id]: blueGrayRedIcon,
    [GRADIENT_PALETTES.blueYellowRedGradient.id]: blueYellowRedIcon,
    [GRADIENT_PALETTES.cyanGradient.id]: cyanIcon,
    [GRADIENT_PALETTES.grayGradient.id]: grayIcon,
    [GRADIENT_PALETTES.orangeBlueGreenGradient.id]: orangeBlueGreenIcon,
    [GRADIENT_PALETTES.orangeGrayBlueGradient.id]: orangeGrayBlueIcon,
    [GRADIENT_PALETTES.orangeVioletBlueGradient.id]: orangeVioletBlueIcon,
    [GRADIENT_PALETTES.orangeYellowGradient.id]: orangeYellowIcon,
    [GRADIENT_PALETTES.pinkGrayGreenGradient.id]: pinkGrayGreenIcon,
    [GRADIENT_PALETTES.redGradient.id]: redIcon,
    [GRADIENT_PALETTES.redBlueGradient.id]: redBlueIcon,
    [GRADIENT_PALETTES.redOrangeGreenGradient.id]: redOrangeGreenIcon,
    [GRADIENT_PALETTES.violetGradient.id]: violetIcon,
    [GRADIENT_PALETTES.violetBlueGreenGradient.id]: violetBlueGreenIcon,
    [GRADIENT_PALETTES.violetOrangeGradient.id]: violetOrangeIcon,
    [GRADIENT_PALETTES.yellowGradient.id]: yellowIcon,
    [GRADIENT_PALETTES.yellowGreenBlueGradient.id]: yellowGreenBlue,
    [GRADIENT_PALETTES.greenGradient.id]: greenIcon,
    [GRADIENT_PALETTES.greenBlueGradient.id]: greenBlueIcon,
    [GRADIENT_PALETTES.goldenGradient.id]: goldenIcon,
    [GRADIENT_PALETTES.oceanicGradient.id]: oceanicIcon,
    [GRADIENT_PALETTES.trafficLightGradient.id]: trafficLightIcon,
};

export const getAvailableClientPalettesMap = () => {
    return {
        ...getAvailablePalettesMap(),
        ...DL.EXTRA_PALETTES,
    };
};

export const selectAvailableClientPalettes = () =>
    selectAvailablePalettes(getAvailableClientPalettesMap());

export const selectPalette = (paletteId: string) =>
    selectPaletteById(paletteId, getAvailableClientPalettesMap());

export const selectAvailableClientGradients = (
    state: DatalensGlobalState,
    gradientType: GradientType,
): GradientPalettes => {
    const colorsLength = gradientType === GradientType.TWO_POINT ? 2 : 3;

    const gradientPalletes = state.colorPaletteEditor.colorPalettes
        .filter((colorPalette) => {
            return colorPalette.isGradient && colorPalette.colors.length === colorsLength;
        })
        .reduce(
            (acc: GradientPalettes, colorPalette: ColorPalette) => ({
                ...acc,
                [colorPalette.colorPaletteId]: {
                    id: colorPalette.colorPaletteId,
                    title: colorPalette.displayName,
                    colors: colorPalette.colors,
                } as Gradient,
            }),
            {},
        );

    return {
        ...selectAvailableGradients(gradientType),
        ...gradientPalletes,
    };
};
export const selectDefaultClientGradient = (gradientType: GradientType) => {
    const gradientId =
        gradientType === GradientType.TWO_POINT ? TWO_POINT_DEFAULT_ID : THREE_POINT_DEFAULT_ID;
    return selectGradient(gradientType, gradientId);
};
export const selectGradientIcon = (gradientId: string) => GRADIENT_ICONS[gradientId];
export const selectClientAvailableLineShapes = (): Array<LineShapeType | 'auto'> => [
    ...Object.values(selectShapes()),
    'auto',
];

export const TIMESTAMP_FORMAT = 'DD.MM.YYYY HH:mm:ss';

export const EMBEDDED_CHART_MESSAGE_NAME = 'subscribe-for-embed-height';
export const EMBEDDED_DASH_MESSAGE_NAME = 'subscribe-for-embed-height-dash';

export const SYSTEM_GROUP_IDS = ['allUsers', 'allAuthenticatedUsers'];

export const CLIPBOARD_TIMEOUT = 1000;
