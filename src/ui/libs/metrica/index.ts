import {DL} from '../../constants';

export * from './utils';

export enum CounterName {
    Cross = 'cross',
    Main = 'main',
}

export enum GoalId {
    ActivateDL = 'ACTIVATEDATALENS',
    OpenMpProductFromMain = 'DLGOTOPRODUCT_MAINDL',
    OpenMpProductFromMarketplace = 'DLGOTOPRODUCT_MPDL',
    DeployMpProduct = 'DLPRODUCT_DEPLOY_CLCK',
    ChartInsightsIconShow = 'CHART_INSIGHTS_ICON_SHOW',
    ChartsInsightsIconClck = 'CHARTS_INSIGHTS_ICON_CLCK',
    CreatingCloudScreen = 'CREATINGCLOUD_SCREEN',
    ChooseFolderScreen = 'CHOOSEFOLDER_SCREEN',
    FederationUserWithoutSources = 'FEDERATION_USER_WITHOUT_SOURCES',
    ShowHiddenFieldsFirstClick = 'DL_DS_SHOW-HIDDEN-FIELDS-FIRST_CLICK',
    ShowHiddenFieldsSecondClick = 'DL_DS_SHOW-HIDDEN-FIELDS-SECOND_CLICK',
    PromoShow = 'DL_PROMO_SHOW',
    InitEnterNewUserShow = 'DL_INIT_ENTER-NEW-USER_SHOW',
    InitOpenDataLens = 'DL_INIT_OPEN-DL_CLICK',
    InitCreateInstanceClick = 'DL_INIT_CREATE-INSTANCE_CLICK',
    InitCreateAndActivateClick = 'DL_INIT-CREATE-AND-ACTIVATE_CLICK',
    InitWoAccessShow = 'DL_INIT_WO-ACCESS_SHOW',
    InitWelcomeShow = 'DL_INIT_WELCOME_SHOW',
    InitFederationUserWoOrgShow = 'DL_INIT_FEDERATION-USER-WO-ORG_SHOW',
    ExtOnboardingPopupShow = 'DL_EXT_ONBOARDING_POPUP_SHOW',
    ExtOnboardingPopupClose = 'DL_EXT_ONBOARDING_POPUP_CLOSE',
    ExtOnboardingPopupWatch = 'DL_EXT_ONBOARDING_POPUP_WATCH',
    ExtOnboardingVideoClose = 'DL_EXT_ONBOARDING_VIDEO_CLOSE',
    TenantMigrationSettingsClick = 'DL_EXT_SETTINGS_START-MIGRATION_CLCK',
    TenantMigrationDialogClick = 'DL_EXT_MIGRATION-POPUP_START-MIGRATION_CLCK',
    TenantMigrationFinished = 'DL_EXT_MIGRATION_FINISHED',
    OpenStartInDataLens = 'DL_HELP-CENTER_START-DL_CLCK',
    MainPageBusinessBannerTryButtonClick = 'DL_MAIN-PAGE_BUSINESS-BANNER_TRY-BUTTON_CLICK',
    MainPageBusinessBannerLearnMoreButtonClick = 'DL_MAIN-PAGE_BUSINESS-BANNER_LEARN-MORE-BUTTON_CLICK',
    MainPageBusinessBannerShow = 'DL_MAIN-PAGE_BUSINESS-BANNER_SHOW',
    ServicePlanChangeToCommunityPlan = 'DL_SERVICE-PLAN_CHANGE-TO-COMMUNITY-PLAN',
    BillingRatesSwitchToBusinessButtonClick = 'DL_BILLING-RATES_SWITCH-TO-BUSINESS-BUTTON_CLICK',
    BACreateNew = 'DL_BA_CREATE-NEW',
    BacrossConnectSelectOld = 'BACROSS_CONNECT_SELECT_OLD',
}

const getCounterConfigByName = (counterName?: string) => {
    return DL.METRICA_COUNTERS?.find(({name}) => name === counterName);
};

export const reachMetricaGoal = (
    counterName: CounterName,
    goalId: GoalId,
    params?: Record<string, unknown>,
) => {
    const counter = getCounterConfigByName(counterName);

    if (counter) {
        window.ym?.(counter.id, 'reachGoal', goalId, params);
    }
};

export const fireMetricaHit = (counterName: CounterName, url: string) => {
    const counter = getCounterConfigByName(counterName);

    if (counter) {
        window.ym?.(counter.id, 'hit', url);
    }
};
