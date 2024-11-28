import type {RenderParams} from '@gravity-ui/app-layout';
import type {TableSettingsData, Theme, ThemeSettings} from '@gravity-ui/uikit';

import type {AppEnvironment, AppInstallation, DeviceType, Language} from '../constants';
import type {Palette} from '../constants/colors';
import type {Endpoints} from '../endpoints';
import type {ConnectorIconData} from '../schema/types';

import type {ChartkitGlobalSettings} from './chartkit';
import type {DashData, DashStateData} from './dash';
import type {EntryPublicAuthor} from './entry';
import type {FeatureConfig} from './feature';
import type {MenuItemsIds} from './menu';
import type {MetricaCounterConfig} from './metrica';
import type {PushServiceConfig} from './notification';
import type {WidgetType} from './widget';

export type Dictionary<T = unknown> = Record<string, T>;

export interface StringParams extends Dictionary<string | string[]> {}

export type Lang = 'en' | 'ru';

export interface LandingLayoutPageError {
    errorType: string;
    title?: string;
    isHtmlInTitle?: boolean;
    isHtmlInDescription?: boolean;
    description?: string;
    pageTitle?: RenderParams<{DL: DLGlobalData}>['title'];
    pageMeta?: RenderParams<{DL: DLGlobalData}>['meta'];
    pageLinks?: RenderParams<{DL: DLGlobalData}>['links'];
}

export interface LandingPageEntryMeta {
    entryId: string;
    key: string;
    scope: string;
    type: string;
    accessDescription?: string;
    supportDescription?: string;
}

export interface LandingPageSettings extends LandingLayoutPageError {
    entryMeta?: LandingPageEntryMeta;
}

export interface DLUserSettings {
    email?: string;
    emailConfirmed?: boolean;
    phone?: string;
    cloudId?: string;
    folderId?: string;
    language?: Language;
    isDefaultLanguage?: boolean;
    theme?: Theme;
    themeSettings?: ThemeSettings;
    isCompact?: boolean;
    orgId?: string;
    chartsInsightsLocators?: string;
    projectId?: string;
    dateFormat?: string | 'auto';
    timeFormat?: '12' | '24';

    dlNavFilterOrderByField?: 'name' | 'createdAt';
    dlNavFilterOrderByDirection?: 'asc' | 'desc';
    dlNavFilterCreatedBy?: string;
    dlDebugMode?: boolean;
    dlStartInDataLens?: boolean; // CHARTS-6086
    dlStartInDataLensExt?: boolean; // CHARTS-6146
    dlFieldEditorDocShown?: boolean; // CHARTS-6168
    dlGsheetAuthHintShown?: boolean; // CHARTS-6811

    // DC specific user settings
    crmContactCreated?: boolean;

    mail_tech?: boolean;
    mail_billing?: boolean;
    mail_info?: boolean;
    mail_feature?: boolean;
    mail_event?: boolean;
    mail_promo?: boolean;
    mail_testing?: boolean;

    signupInfo?: {
        name?: string;
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
        country: string;
        currency: string;
        countryName?: string;
        company: string;
        jobtitle: string;
    };

    tableSettings?: {
        [tableId: string]: TableSettingsData;
    };

    communicationsCheck?: {
        lastPhoneShowDate: number;
        lastEmailShowDate: number;
        lastAnyShowDate: number;
    };

    awsMpData?: null | {
        token: string;
        createdAt: string;
    };
}

export interface DLUserAccount {
    avatarId: string;
    displayName: string;
    email: string;
    federationId: string;
    lang: Lang;
    login: string;
    id: string;
    uid: string;
    avatarHost: string;
    formattedLogin: string;
}

export interface DLUser extends DLUserAccount {
    accounts: DLUserAccount[];
    passportHost: string;
    formattedLogin: string;
    staffLogin?: string;
    canCreateClouds?: boolean;
    isFederationUser?: boolean;
    isGlobalFederationUser?: boolean;
    isLocalFederationUser?: boolean;
    withNavigation?: boolean;
}

export type MainLayoutConfigData = {
    intLandingConfigEntryId?: string;
};

type DocPathNameKey = 'datasetSubsql' | 'qlCreateChart' | 'functionsPath';
export type DocPathName = Partial<Record<DocPathNameKey, string>>;

export type DLGlobalData = {
    deviceType: DeviceType;
    requestId: string;
    env: AppEnvironment;
    installationType: AppInstallation;
    serviceName: string;
    user: DLUser;
    userSettings: DLUserSettings;
    iamUserId: string;
    currentTenantId?: string;
    clouds?: any[]; // TODO@types
    endpoints: Endpoints['ui'];
    features: FeatureConfig;
    dynamicFeatures?: FeatureConfig;
    displaySuperuserSwitch?: boolean;
    intLandingConfigEntryId?: string;
    meta?: Record<string, any>;
    landingPageSettings?: LandingPageSettings;
    push?: PushServiceConfig;
    metricaCounters?: MetricaCounterConfig[];
    templateWorkbookId?: string;
    learningMaterialsWorkbookId?: string;
    isLanding?: boolean;
    publicScope?: 'dash' | 'widget';
    ymapApiKey?: string;
    oauthEndpoint?: string;
    tenantMode?: {
        foldersEnabled: boolean;
        workbooksEnabled: boolean;
        collectionsEnabled: boolean;
    };
    userIsOrgAdmin?: boolean;
    allowLanguages?: Language[];
    langRegion?: string;
    widgetMenuGroupConfig?: Array<Array<MenuItemsIds>>;
    title?: string;
    publicAuthor?: EntryPublicAuthor;
    iamResources?: {
        collection: {
            roles: {
                admin: string;
                editor: string;
                viewer: string;
                limitedViewer?: string;
            };
        };
        workbook: {
            roles: {
                admin: string;
                editor: string;
                viewer: string;
                limitedViewer?: string;
            };
        };
    };
    embed?:
        | {
              mode: 'chart';
          }
        | boolean;
    apiPrefix?: string;
    docPathName?: DocPathName;
    chartkitSettings?: ChartkitGlobalSettings;
    extraPalettes?: Record<string, Palette>;
    headersMap?: Record<string, string>;
    isZitadelEnabled?: boolean;
    hideNavigation?: boolean;
    connectorIcons?: ConnectorIconData[];
} & MainLayoutConfigData;

export type ContactDialogSettings = {
    inputPhoneImageUrl?: string;
    phoneVerifyCodeImageUrl?: string;
    inputEmailImageUrl?: string;
    emailVerifyCodeImageUrl?: string;
    telegramCodeImageUrl?: string;
};

export type DSAPIErrorCode =
    | 'ERR.UNKNOWN'
    | 'ERR.DS_API.US.ACCESS_DENIED'
    | 'ERR.DS_API.FIELD.NOT_FOUND'
    | 'ERR.DS_API.DB'
    | 'ERR.DS_API.DATABASE_UNAVAILABLE'
    | 'ERR.DS_API'
    | 'ERR.DS_API.DB.COLUMN_DOES_NOT_EXIST'
    | 'ERR.DS_API.DB.METRICA'
    | 'ERR.DS_API.FILTER.INVALID_VALUE'
    | 'ERR.DS_API.DB.SOURCE_DOES_NOT_EXIST'
    | 'ERR.DS_API.DB.SOURCE_ERROR.TIMEOUT'
    | 'ERR.DS_API.SOURCE_CONFIG.TABLE_NOT_CONFIGURED'
    | 'ERR.DS_API.ROW_COUNT_LIMIT'
    | 'ERR.DS_API.US.OBJ_NOT_FOUND'
    | 'ERR.DS_API.CLIQUE_STOPPED'
    | 'ERR.DS_API.TABLE_NOT_READY'
    | 'ERR.DS_API.FORMULA'
    | 'ERR.DS_API.DB.CHYT.INVALID_SORTED_JOIN'
    | 'ERR.DS_API.US.BAD_REQUEST';

/** @deprecated use StringParams from datalens-shared*/
export interface Params extends Dictionary<string | string[]> {}

export enum EntryScope {
    Dash = 'dash',
    Widget = 'widget',
    Dataset = 'dataset',
    Folder = 'folder',
    Connection = 'connection',
}

export interface Entry {
    entryId: string;
    key: string;
    scope: EntryScope;
    type: EntryType;
    data: EntryData;
    links: Dictionary<string>;
    meta: object;
    workbookId?: string;
    mode?: EntryUpdateMode;
}

export type CreateEntryRequest<T = Entry> = Partial<Omit<T, 'entryId'>> &
    Required<{key: string; data: EntryData}>;

export type UpdateEntryRequest<T = Entry> = Omit<T, 'entryId' | 'scope' | 'type'>;

export type EntryData = DashData; // | WidgetData | DatasetData | ConnectionData | FolderData

// WidgetType when scope=widget
export type EntryType = '' | WidgetType;

export interface EntryReadParams {
    revId?: string;
    includePermissions: string;
    includeLinks: string;
    branch?: string;
}

export enum EntryUpdateMode {
    Save = 'save',
    Publish = 'publish',
}

export interface State {
    entryId: string;
    hash: string;
    data: StateData;
}

export type StateData = DashStateData;

export interface Lock {
    lockId: string;
    entryId: string;
    lockToken: string;
    expiryDate: string;
    login: string;
}

export enum DeveloperModeCheckStatus {
    Allowed = 'allowed',
    Forbidden = 'forbidden',
}
