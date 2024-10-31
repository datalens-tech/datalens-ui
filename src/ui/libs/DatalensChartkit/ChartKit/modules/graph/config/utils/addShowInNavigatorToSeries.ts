import {NavigatorLinesMode} from 'shared';

import {getXAxisThresholdValue} from './getXAxisThresholdValue';

type AddShowInNavigatorToSeriesArgs = {
    linesMode: NavigatorLinesMode;
    graphs: Record<string, any>[];
    baseSeriesName: string;
    params: Record<string, any>;
    selectedLines: string[];
};

export const addShowInNavigatorToSeries = ({
    linesMode,
    graphs,
    baseSeriesName,
    params,
    selectedLines,
}: AddShowInNavigatorToSeriesArgs) => {
    if (linesMode === NavigatorLinesMode.All) {
        graphs.forEach((item) => {
            item.showInNavigator = true;
        });
    } else {
        const mergedLines = [...selectedLines];

        // Adding the selected base_series_name from the old charts
        if (baseSeriesName) {
            mergedLines.push(baseSeriesName);
        }

        if (mergedLines.length) {
            graphs.forEach((item) => {
                const itemName = item.sname || item.name || item.title;
                if (typeof item.showInNavigator === 'undefined') {
                    item.showInNavigator = mergedLines.includes(itemName);
                }
            });
        } else {
            graphs.forEach((item) => {
                item.showInNavigator = false;
            });

            const xMinValue = getXAxisThresholdValue(graphs, 'min');
            const xMaxValue = getXAxisThresholdValue(graphs, 'max');

            const navigatorParams = {...params.navigator};

            if (navigatorParams.xAxis) {
                navigatorParams.xAxis.min = xMinValue;
                navigatorParams.xAxis.max = xMaxValue;
            } else {
                navigatorParams.xAxis = {
                    min: xMinValue,
                    max: xMaxValue,
                };
            }

            params.navigator = navigatorParams;
        }
    }
};
