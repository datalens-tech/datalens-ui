import _unionBy from 'lodash/unionBy';

import type {
    ServerCommonSharedExtraSettings,
    ServerField,
    ServerVisualization,
    StringParams,
} from '../../../../../../../shared';
import {PlaceholderId, WizardVisualizationId} from '../../../../../../../shared';
import {
    getCurrentPage,
    getSortParams,
} from '../../../../../../components/charts-engine/components/processor/paramsUtils';
import type {BaseUrlPayload} from '../../types';
import {SORT_ORDER} from '../../utils/constants';
import {getSortData} from '../../utils/misc-helpers';

type GetOrderByItemForColumnSortClickArgs = {
    params: StringParams;
    isPivotTable: boolean;
    allItemsIds: Record<string, boolean>;
    visualization: ServerVisualization;
};
const getOrderByItemForColumnClickSort = ({
    params,
    allItemsIds,
    isPivotTable,
    visualization,
}: GetOrderByItemForColumnSortClickArgs) => {
    const {columnId, order} = getSortData(getSortParams(params), isPivotTable);

    // If the data for sorting and the column exist, then
    // We process tabular sorting, it is in priority
    const isSortColumnExists = columnId && order && allItemsIds[columnId];
    const sortItem = isSortColumnExists
        ? {
              direction: order,
              column: columnId,
          }
        : undefined;

    if (isPivotTable && columnId && sortItem) {
        const columnsPlaceholder = (visualization.placeholders || []).find(
            (p) => p.id === PlaceholderId.PivotTableRows,
        );
        const fields = columnsPlaceholder?.items || [];
        const guids = fields.reduce(
            (acc, field) => ({...acc, [field.guid]: true}),
            {} as Record<string, boolean>,
        );

        // sorting by dimensions only for the pivot table is handled here
        // this can only be if sorted by field from the row section
        // therefore, we do not add to order_by if the field is from another section
        return guids[columnId] ? sortItem : undefined;
    }

    return sortItem;
};

type GetUpdatedOrderByForColumnClickSortArgs = {
    params: StringParams;
    isPivotTable: boolean;
    allItemsIds: Record<string, boolean>;
    orderBy: BaseUrlPayload['order_by'];
    dimensionsFromCurrentDataset: BaseUrlPayload['order_by'];
    visualization: ServerVisualization;
};
const getUpdatedOrderByForColumnClickSort = ({
    params,
    allItemsIds,
    isPivotTable,
    orderBy,
    dimensionsFromCurrentDataset,
    visualization,
}: GetUpdatedOrderByForColumnClickSortArgs) => {
    const columnSort = getOrderByItemForColumnClickSort({
        params,
        allItemsIds,
        isPivotTable,
        visualization,
    });

    let updatedOrderBy = orderBy ? [...orderBy] : [];

    if (columnSort) {
        updatedOrderBy.unshift(columnSort);
    }

    // Adding all dimensions to order_by, excluding those that are in sort
    // CHARTS-3421#5fda2052b806202d36837f7f
    updatedOrderBy = _unionBy(
        updatedOrderBy || [],
        dimensionsFromCurrentDataset,
        ({column}) => column,
    );

    return updatedOrderBy;
};

export const getPayloadWithCommonTableSettings = (
    payload: BaseUrlPayload,
    options: {
        extraSettings: ServerCommonSharedExtraSettings | undefined;
        fields: ServerField[];
        params: StringParams;
        allItemsIds: Record<string, boolean>;
        datasetId: string;
        visualization: ServerVisualization;
    },
): BaseUrlPayload => {
    const {fields, extraSettings, params, allItemsIds, datasetId, visualization} = options;

    const visualizationId = visualization.id;

    const isPivotTable = visualizationId === WizardVisualizationId.PivotTable;
    const isFlatTable = visualizationId === WizardVisualizationId.FlatTable;

    const dimensionsFromCurrentDataset = fields
        .filter((item) => item.type === 'DIMENSION' && item.datasetId === datasetId)
        .map(({guid}) => ({
            direction: SORT_ORDER.ASCENDING.STR,
            column: guid,
        }));

    const updatedPayload: BaseUrlPayload = {
        ...payload,
    };

    const isPivotFallbackEnabled = extraSettings?.pivotFallback === 'on';
    const isBackendPivotTable = isPivotTable && !isPivotFallbackEnabled;
    const isPaginationAvailable = isBackendPivotTable || isFlatTable;
    const isPaginationEnabled = Boolean(
        isPaginationAvailable && extraSettings?.pagination === 'on',
    );

    // This check for length is used to be sure that user uses dimensions in graph
    // without dimensions pagination makes no sense because offset will always be 0
    // and backend will be failed to process it
    if (dimensionsFromCurrentDataset.length && isPaginationEnabled && extraSettings?.limit) {
        updatedPayload.limit = extraSettings?.limit;
        const page = getCurrentPage(params);
        updatedPayload.offset = (page - 1) * extraSettings.limit;
    }

    if (isBackendPivotTable || isPaginationEnabled) {
        updatedPayload.order_by = getUpdatedOrderByForColumnClickSort({
            params,
            allItemsIds,
            isPivotTable,
            orderBy: payload.order_by,
            dimensionsFromCurrentDataset,
            visualization,
        });
    }

    return updatedPayload;
};
