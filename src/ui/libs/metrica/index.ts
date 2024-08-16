import {DL} from '../../constants';

export * from './utils';

export enum CounterName {
    Cross = 'cross',
    Main = 'main',
}

export enum GoalId {
    ShowHiddenFieldsFirstClick = 'DL_DS_SHOW-HIDDEN-FIELDS-FIRST_CLICK',
    ShowHiddenFieldsSecondClick = 'DL_DS_SHOW-HIDDEN-FIELDS-SECOND_CLICK',
    ChartInsightsIconShow = 'CHART_INSIGHTS_ICON_SHOW',
    ChartsInsightsIconClck = 'CHARTS_INSIGHTS_ICON_CLCK',
    CreatingCloudScreen = 'CREATINGCLOUD_SCREEN',
    ChooseFolderScreen = 'CHOOSEFOLDER_SCREEN',
    FederationUserWithoutSources = 'FEDERATION_USER_WITHOUT_SOURCES',
}

const getCounterConfigByName = (counterName?: string) => {
    return DL.METRICA_COUNTERS?.find(({name}) => name === counterName);
};

export const reachMetricaGoalGeneric = <T extends string>(
    counterName: CounterName,
    goalId: T,
    params?: Record<string, unknown>,
) => {
    const counter = getCounterConfigByName(counterName);

    if (counter) {
        window.ym?.(counter.id, 'reachGoal', goalId, params);
    }
};

export const reachMetricaGoal = reachMetricaGoalGeneric<GoalId>;

export const fireMetricaHit = (counterName: CounterName, url: string) => {
    const counter = getCounterConfigByName(counterName);

    if (counter) {
        window.ym?.(counter.id, 'hit', url);
    }
};
