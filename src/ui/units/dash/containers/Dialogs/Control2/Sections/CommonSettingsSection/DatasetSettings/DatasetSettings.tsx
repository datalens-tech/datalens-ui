import React from 'react';

import {useSelector} from 'react-redux';
import {DATASET_FIELD_TYPES, DashTabItemControlSourceType, DatasetFieldType} from 'shared';

import {VIEW_MODES} from '../../../../../../../../components/Select/hooks/useSelectRenderFilter/useSelectRenderFilter';
import type {SelectFeaturedAsyncProps} from '../../../../../../../../components/Select/wrappers/SelectFeaturedAsync';
import {selectWorkbookId} from '../../../../../../../workbooks/store/selectors';
import {
    selectSelectorControlType,
    selectSelectorDialog,
} from '../../../../../../store/selectors/dashTypedSelectors';
import {ELEMENT_TYPE} from '../../../../Control/constants';
import {OperationSelector} from '../../OperationSelector/OperationSelector';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import type {ValueSelectorControlProps} from '../../ValueSelector/types';
import {DatasetSelector} from '../DatasetSelector/DatasetSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';
import {getElementOptions} from '../helpers/input-type-select';

import {
    DEFAULT_PAGE_SIZE,
    getDistinctsByDatasetField,
} from './helpers/get-distincts-by-dataset-field';

const DatasetSettings = () => {
    const {datasetFieldType, datasetId, datasetFieldId, sourceType, fieldType} =
        useSelector(selectSelectorDialog);
    const controlType = useSelector(selectSelectorControlType);
    const workbookId = useSelector(selectWorkbookId);

    const [searchPattern, setSearchPattern] = React.useState('');

    const options = React.useMemo(() => {
        const disabledOptions: Record<string, boolean> = {
            [ELEMENT_TYPE.DATE]:
                sourceType === DashTabItemControlSourceType.Dataset &&
                ((controlType !== ELEMENT_TYPE.DATE &&
                    fieldType !== DATASET_FIELD_TYPES.DATE &&
                    fieldType !== DATASET_FIELD_TYPES.GENERICDATETIME) ||
                    datasetFieldType === DatasetFieldType.Measure),
            [ELEMENT_TYPE.SELECT]: datasetFieldType === DatasetFieldType.Measure,
            [ELEMENT_TYPE.CHECKBOX]:
                sourceType === DashTabItemControlSourceType.Dataset &&
                fieldType !== DATASET_FIELD_TYPES.BOOLEAN,
        };
        return getElementOptions().map((option) => ({
            ...option,
            disabled: disabledOptions[option.value],
        }));
    }, [sourceType, fieldType, controlType, datasetFieldType]);

    const onFilterChange = React.useCallback<
        NonNullable<SelectFeaturedAsyncProps['onFilterChange']>
    >((pattern, mode) => {
        if (mode === VIEW_MODES.ALL) {
            setSearchPattern(pattern);
        }
    }, []);

    const fetcher = React.useCallback(
        ({pageNumber, pageSize} = {pageNumber: 0, pageSize: DEFAULT_PAGE_SIZE}) =>
            getDistinctsByDatasetField({
                datasetId,
                workbookId,
                datasetFieldId,
                nextPageToken: pageNumber,
                searchPattern,
                pageSize,
            }),
        [datasetId, workbookId, datasetFieldId, searchPattern],
    );

    const controlProps: ValueSelectorControlProps = React.useMemo(() => {
        return {
            select: {
                type: 'dynamic',
                custom: {fetcher, onFilterChange, disabled: !datasetId || !datasetFieldId},
            },
        };
    }, [datasetFieldId, datasetId, fetcher, onFilterChange]);

    return (
        <React.Fragment>
            <DatasetSelector />
            <InputTypeSelector options={options} />
            <OperationSelector />
            <ValueSelector controlProps={controlProps} />
        </React.Fragment>
    );
};

export {DatasetSettings};
