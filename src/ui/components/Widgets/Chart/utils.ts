import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

import {Feature, type StringParams} from '../../../../shared';
import {ChartsProps} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

export function cleanUpConflictingParameters(args: {
    prev: StringParams | undefined | null;
    current: StringParams | undefined;
}) {
    const {prev, current} = args;

    // When changing the parameters, the data in the table may also change,
    // and the sorting by rows (linked to the data) becomes incorrect.
    // Therefore, reset the sorting if there are parameters that potentially affect data
    const tableRowSortKey = '_sortRowMeta';
    if (prev && current && tableRowSortKey in current) {
        if (!isEqual(omit(prev, tableRowSortKey), omit(current, tableRowSortKey))) {
            delete current[tableRowSortKey];
        }
    }
}

export async function removeInternalMargin() {
    if (!isEnabledFeature(Feature.OutsideMargin)) {
        return;
    }

    await import('./outside-margin');
}

export function getChartPadding(args: {widgetType?: ChartsProps['widgetType']}) {
    const {widgetType} = args;

    switch(widgetType) {
        case 'graph': {
            return '10px 10px 15px 10px';
        }
        case 'metric2': {
            return '15px';
        }
        default: {
            return '';
        }
    }
}
