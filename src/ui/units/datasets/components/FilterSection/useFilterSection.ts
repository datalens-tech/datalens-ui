import React from 'react';

import without from 'lodash/without';
import {useDispatch, useSelector} from 'react-redux';
import type {DatasetField, DatasetOptions} from 'shared';
import type {ApplyData} from 'ui';

import {openDialogFilter} from '../../../../store/actions/dialog';
import {useDatasetPageContext} from '../../containers/DatasetPage/DatasetPage';
import {filteredDatasetParametersSelector, workbookIdSelector} from '../../store/selectors';
import type {ObligatoryFilter} from '../../typings/dataset';
import type {
    FieldColumn,
    FieldListColumn,
    FieldRowControlSettings,
} from '../DatasetTabFieldList/types';

import {
    getFieldsByFilters,
    getFilterByField,
    getFilterRowColumns,
    getHeaderColumns,
    prepareFilter,
} from './helpers';

type UseFilterSectionArgs = {
    filters: ObligatoryFilter[];
    options: DatasetOptions;
    fields: DatasetField[];
    updateFilter: (data: ApplyData) => void;
    addFilter: (data: ApplyData) => void;
    deleteFilter: (filterId: string) => void;
    readonly: boolean;
};

type UseFilterSection = {
    onFilterItemClick: (field: DatasetField) => void;
    onOpenDialogFilterClick: () => void;
    headerColumns: FieldColumn[];
    columns: FieldListColumn[];
    preparedFields: DatasetField[];
    controlSettings: FieldRowControlSettings;
    checkIsRowValid: (item: DatasetField) => boolean;
};

export const useFilterSection = (args: UseFilterSectionArgs): UseFilterSection => {
    const dispatch = useDispatch();
    const {datasetId} = useDatasetPageContext();
    const parameters = useSelector(filteredDatasetParametersSelector);
    const workbookId = useSelector(workbookIdSelector);

    const {filters, options, fields, updateFilter, addFilter, deleteFilter, readonly} = args;

    const headerColumns = getHeaderColumns();
    const preparedFields = getFieldsByFilters(fields, filters);
    const dialogFilterFields = without(fields, ...preparedFields);

    const onFilterItemClick = React.useCallback(
        (field: DatasetField) => {
            const filter = getFilterByField(field, filters);
            const preparedFilter = prepareFilter(filter);
            dispatch(
                openDialogFilter({
                    field,
                    filter: preparedFilter,
                    options,
                    datasetId,
                    workbookId,
                    fields: dialogFilterFields,
                    parameters,
                    onApply: updateFilter,
                }),
            );
        },
        [updateFilter, datasetId, workbookId, fields, filters, options, parameters],
    );

    const onOpenDialogFilterClick = React.useCallback(() => {
        dispatch(
            openDialogFilter({
                fields: dialogFilterFields,
                datasetId,
                workbookId,
                options,
                parameters,
                onApply: addFilter,
            }),
        );
    }, [addFilter, datasetId, workbookId, fields, options, parameters]);

    const columns = React.useMemo(() => {
        return headerColumns
            .map((column) => {
                const columnType = column.columnType;
                const width = column.width;
                return getFilterRowColumns(columnType, filters, width);
            })
            .filter((column): column is FieldListColumn => Boolean(column));
    }, [filters, headerColumns]);

    const controlSettings: FieldRowControlSettings = React.useMemo(() => {
        return {
            type: 'button',
            onButtonClick: (item: DatasetField) => {
                const filter = getFilterByField(item, filters);
                deleteFilter(filter.id);
            },
            readonly,
        };
    }, [deleteFilter, filters, readonly]);

    const checkIsRowValid = React.useCallback(
        (item: DatasetField) => {
            const filter = getFilterByField(item, filters);
            return Boolean(filter?.valid);
        },
        [filters],
    );

    return {
        onFilterItemClick,
        headerColumns,
        onOpenDialogFilterClick,
        columns,
        preparedFields,
        controlSettings,
        checkIsRowValid,
    };
};
