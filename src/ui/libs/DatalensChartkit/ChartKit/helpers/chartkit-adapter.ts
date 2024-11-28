import type {ChartKitProps, ChartKitType} from '@gravity-ui/chartkit';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';

import {Feature} from '../../../../../shared';
import {DL} from '../../../../constants/common';
import Utils from '../../../../utils';
import type {GraphWidget, LoadedWidgetData} from '../../types';
import type {ChartKitAdapterProps} from '../types';

import {
    applyGoToEvents,
    applySetActionParamsEvents,
    applyTreemapLabelFormatter,
    fixPieTotals,
} from './apply-hc-handlers';
import {getD3ChartKitData} from './d3-chartkit-adapter';
import {extractHcTypeFromData, getNormalizedClickActions} from './utils';

export const extractWidgetType = (data?: LoadedWidgetData) => {
    return data && 'type' in data && data.type;
};

export const getChartkitType = (data?: LoadedWidgetData): ChartKitType | undefined => {
    const type = extractWidgetType(data);

    if (!type) {
        return undefined;
    }

    let chartkitType: ChartKitType | undefined;

    switch (type) {
        // for some reason, `yagr` charts inside DL have historically been called `timeseries`
        case 'timeseries': {
            chartkitType = 'yagr';

            break;
        }
        // historical background:
        // - initially, 'metric' was created, but it came out complicated and unsuitable for Wizard
        // - then, simple 'metric2' was created specifically for Wizard
        // - 'metric2' go to opensource with more common name for such charts in the BI community - 'indicator'
        case 'metric2': {
            chartkitType = 'indicator';

            break;
        }

        case 'metric': {
            chartkitType = 'metric';

            break;
        }

        case 'markup': {
            chartkitType = 'markup';

            break;
        }

        case 'map': {
            chartkitType = 'highchartsmap';

            break;
        }

        case 'ymap': {
            chartkitType = 'yandexmap';

            break;
        }

        case 'graph': {
            chartkitType = 'highcharts';

            break;
        }

        case 'd3': {
            chartkitType = 'd3';

            break;
        }

        case 'table': {
            const isWizardOrQl = get(data, 'isNewWizard') || get(data, 'isQL');

            if (isWizardOrQl || Utils.isEnabledFeature(Feature.NewTableWidgetForCE)) {
                chartkitType = 'table';
            }

            break;
        }

        case 'blank-chart': {
            chartkitType = 'blank-chart';

            break;
        }
    }

    return chartkitType;
};

export const getOpensourceChartKitData = <T extends ChartKitType>({
    type,
    loadedData,
    onChange,
}: {
    type: T;
    loadedData: ChartKitAdapterProps['loadedData'];
    onChange?: ChartKitAdapterProps['onChange'];
}) => {
    switch (type) {
        case 'indicator': {
            const data = {...(loadedData as ChartKitProps<'indicator'>['data'])};
            // CHARTS-5786
            // The value is taken here https://github.com/datalens-tech/ui/blob/217dca46745b184e25b3d9c3ac3f564397e06b61/src/shared/constants/colors/default.ts#L6
            data.defaultColor = '#4da2f1';

            return data;
        }
        case 'metric': {
            const data = {...(loadedData as ChartKitProps<'metric'>['data'])};

            return data;
        }
        case 'markup': {
            const data = {...(loadedData as ChartKitProps<'markup'>['data'])};

            return data;
        }
        case 'highchartsmap': {
            const data = {...(loadedData as ChartKitProps<'highchartsmap'>['data'])};

            return data;
        }
        case 'yandexmap': {
            const data = {...(loadedData as ChartKitProps<'yandexmap'>['data'])};

            return data;
        }
        case 'highcharts': {
            if (!DL.CHARTKIT_SETTINGS.highcharts?.enabled) {
                throw Error(
                    'This chart requires Highcharts to be enabled. See the documentation for more details.\n',
                );
            }

            const data = cloneDeep(loadedData) as GraphWidget;

            if (!data.config.tooltip) {
                data.config.tooltip = {};
            }

            // check data.config.tooltip because TS does not recognize that the field is initialized
            if (data.config.tooltip && typeof data.config.tooltip.pin === 'undefined') {
                data.config.tooltip.pin = {altKey: true};
            }

            const clickActions = getNormalizedClickActions(data);

            if (clickActions.length) {
                clickActions.forEach((action) => {
                    const handlers = Array.isArray(action.handler)
                        ? action.handler
                        : [action.handler];
                    handlers.forEach((handler) => {
                        switch (handler.type) {
                            case 'setActionParams': {
                                applySetActionParamsEvents({
                                    action: {
                                        type: handler.type,
                                        scope: action.scope,
                                    },
                                    data,
                                    onChange,
                                });
                                break;
                            }
                            case 'goTo': {
                                applyGoToEvents({data, target: handler.target});
                            }
                        }
                    });
                });
            }

            const chartType = extractHcTypeFromData(data);
            switch (chartType) {
                case 'pie': {
                    fixPieTotals({data});
                    break;
                }
                case 'treemap': {
                    applyTreemapLabelFormatter({data});
                    break;
                }
            }

            return data;
        }
        case 'd3': {
            const data = cloneDeep(loadedData) as GraphWidget;
            return getD3ChartKitData({
                loadedData: data,
                onChange,
            });
        }
        default: {
            return loadedData as ChartKitProps<T>['data'];
        }
    }
};

export const getAdditionalProps = <T extends ChartKitType>(type: T) => {
    switch (type) {
        case 'highcharts': {
            const props: Partial<ChartKitProps<'highcharts'>> = {
                hoistConfigError: false,
            };

            return props;
        }
        default: {
            return undefined;
        }
    }
};
