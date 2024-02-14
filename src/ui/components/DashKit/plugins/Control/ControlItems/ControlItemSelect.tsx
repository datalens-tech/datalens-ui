import React from 'react';

import {ConfigItem} from '@gravity-ui/dashkit';
import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {
    ApiV2Filter,
    ApiV2Parameter,
    DashTabItemControlDataset,
    DashTabItemControlElementSelect,
    DashTabItemControlSingle,
    DashTabItemControlSourceType,
    DatasetFieldType,
    Feature,
    Operations,
    StringParams,
    resolveIntervalDate,
    resolveOperation,
    resolveRelativeDate,
    splitParamsToParametersAndFilters,
    transformParamsToUrlParams,
    transformUrlParamsToParams,
} from 'shared';
import {ChartKitCustomError} from 'ui/libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import {ControlSelect} from 'ui/libs/DatalensChartkit/components/Control/Items/Items';
import {ResponseSuccessControls} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import {openDialogErrorWithTabs} from 'ui/store/actions/dialog';
import {addOperationForValue, unwrapFromArrayAndSkipOperation} from 'ui/units/dash/modules/helpers';
import {selectDashWorkbookId} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import {MOBILE_SIZE, isMobileView} from 'ui/utils/mobile';
import Utils from 'ui/utils/utils';

import logger from '../../../../../libs/logger';
import {LIMIT, LOAD_STATUS, TYPE} from '../constants';
import {
    ErrorData,
    GetDistincts,
    LoadStatus,
    SelectControlProps,
    ValidationErrorData,
} from '../types';
import {
    getDatasetSourceInfo,
    getErrorText,
    getLabels,
    isValidRequiredValue,
    prepareSelectorError,
} from '../utils';

type ControlItemSelectProps = {
    id: string;
    data: DashTabItemControlSingle;
    defaults: ConfigItem['defaults'];
    status: LoadStatus;
    loadedData: null | ResponseSuccessControls;
    loadingItems: boolean;
    actualParams: StringParams;
    onChange: ({param, value}: {param: string; value: string | string[]}) => void;
    init: () => void;
    showItemsLoader: () => void;
    getDistincts?: GetDistincts;
    validationError: string | null;
    errorData: null | ErrorData;
    validateValue: (args: ValidationErrorData) => boolean | undefined;
    classMixin?: string;
    width?: string;
};

const b = block('dashkit-plugin-control');
const i18n = I18n.keyset('dash.dashkit-plugin-control.view');

export const ControlItemSelect = ({
    defaults,
    data,
    id,
    loadedData,
    status,
    actualParams,
    onChange,
    getDistincts,
    loadingItems,
    errorData,
    validationError,
    init,
    showItemsLoader,
    validateValue,
    classMixin,
    width,
}: ControlItemSelectProps) => {
    const dispatch = useDispatch();
    let _loadingItemsTimer: NodeJS.Timeout | undefined;

    const workbookId = useSelector(selectDashWorkbookId);

    // TODO: seems like this function should be in shared/ui
    const getSelectDistincts = React.useCallback(
        async ({searchPattern, nextPageToken}: {searchPattern: string; nextPageToken: number}) => {
            try {
                const datasetData = data as DashTabItemControlDataset;
                const {datasetId, datasetFieldId, datasetFields, datasetFieldsMap} =
                    getDatasetSourceInfo({actualLoadedData: loadedData, data: datasetData});

                const splitParams = splitParamsToParametersAndFilters(
                    transformParamsToUrlParams(actualParams),
                    datasetFields,
                );

                const filtersParams = transformUrlParamsToParams(splitParams.filtersParams);

                const where = Object.entries(filtersParams).reduce(
                    (result, [key, rawValue]) => {
                        // ignoring the values of the current field when filtering,
                        // because it is enabled by default with operation: 'ICONTAINS',
                        // otherwise, we will search among the selected
                        if (key === datasetFieldId) {
                            return result;
                        }

                        const valuesWithOperation = (
                            Array.isArray(rawValue) ? rawValue : [rawValue]
                        ).map((item) => resolveOperation(item));

                        if (valuesWithOperation.length > 0 && valuesWithOperation[0]?.value) {
                            const value = valuesWithOperation[0]?.value;
                            let operation = valuesWithOperation[0]?.operation;
                            let values = valuesWithOperation.map((item) => item?.value!);

                            if (
                                valuesWithOperation.length === 1 &&
                                value.indexOf('__interval_') === 0
                            ) {
                                const resolvedInterval = resolveIntervalDate(value);

                                if (resolvedInterval) {
                                    values = [resolvedInterval.from, resolvedInterval.to];
                                    operation = Operations.BETWEEN;
                                }
                            }

                            if (
                                valuesWithOperation.length === 1 &&
                                value.indexOf('__relative_') === 0
                            ) {
                                const resolvedRelative = resolveRelativeDate(value);

                                if (resolvedRelative) {
                                    values = [resolvedRelative];
                                }
                            }

                            result.push({
                                column: key,
                                operation,
                                values,
                            });
                        }

                        return result;
                    },
                    [
                        {
                            column: datasetFieldId,
                            operation: 'ICONTAINS',
                            values: [searchPattern],
                        },
                    ],
                );

                const filters: ApiV2Filter[] = where
                    .filter((el) => {
                        return datasetFieldsMap[el.column]?.fieldType !== DatasetFieldType.Measure;
                    })
                    .map<ApiV2Filter>((filter) => {
                        return {
                            ref: {type: 'id', id: filter.column},
                            operation: filter.operation,
                            values: filter.values,
                        };
                    });

                const parameter_values: ApiV2Parameter[] =
                    splitParams.parametersParams.map<ApiV2Parameter>(([key, value]) => {
                        return {
                            ref: {type: 'id', id: key},
                            value,
                        };
                    });

                const {result} = await getDistincts!({
                    datasetId,
                    workbookId,
                    fields: [
                        {
                            ref: {type: 'id', id: datasetFieldId},
                            role_spec: {role: 'distinct'},
                        },
                    ],
                    limit: LIMIT,
                    offset: LIMIT * nextPageToken,
                    filters,
                    parameter_values,
                });

                return {
                    items: result.data.Data.map(([value]) => ({value, title: value})),
                    nextPageToken: result.data.Data.length < LIMIT ? undefined : nextPageToken + 1,
                };
            } catch (error) {
                logger.logError('DashKit: Control getDistincts failed', error);
                console.error('SELECT_GET_ITEMS_FAILED', error);
                throw error;
            }
        },
        [actualParams, data, getDistincts, loadedData, workbookId],
    );

    const getItems = async ({
        searchPattern,
        exactKeys,
        nextPageToken = 0,
    }: {
        searchPattern: string;
        exactKeys: string[];
        nextPageToken?: number;
    }) => {
        if (searchPattern || (!searchPattern && nextPageToken)) {
            return getSelectDistincts({searchPattern, nextPageToken});
        } else if (exactKeys) {
            return {
                items: exactKeys.map((value) => ({value, title: value})),
                nextPageToken: nextPageToken + 1,
            };
        }

        return {items: []};
    };

    const getErrorContent = () => {
        const data = errorData?.data;
        const errorText = getErrorText(data || {});
        const errorTitle = data?.title;

        const buttonsSize = isMobileView ? MOBILE_SIZE.BUTTON : 's';
        const buttonsWidth = isMobileView ? 'max' : 'auto';

        return (
            <div className={b('error', {inside: true, mobile: isMobileView})}>
                <span className={b('error-text')} title={errorText}>
                    {errorTitle || errorText}
                </span>
                <div className={b('buttons')}>
                    <Button
                        size={buttonsSize}
                        onClick={() => {
                            showItemsLoader();
                            init();
                        }}
                        width={buttonsWidth}
                    >
                        {i18n('button_retry')}
                    </Button>
                    <Button
                        size={buttonsSize}
                        view="flat"
                        onClick={() =>
                            dispatch(
                                openDialogErrorWithTabs({
                                    error: prepareSelectorError(data || {}) as ChartKitCustomError,
                                    title: errorTitle,
                                }),
                            )
                        }
                        width={buttonsWidth}
                    >
                        {i18n('button_details')}
                    </Button>
                </div>
            </div>
        );
    };

    const onOpenChange = ({open}: {open: boolean}) => {
        clearTimeout(_loadingItemsTimer);

        if (status === LOAD_STATUS.PENDING) {
            if (open) {
                showItemsLoader();
            } else {
                // A delay for displaying the Loader in the Popup, to prevent loading blinking while closing.
                _loadingItemsTimer = setTimeout(() => {
                    if (status === LOAD_STATUS.PENDING) {
                        showItemsLoader();
                    }
                }, 150);
            }
        }
    };

    const {source, sourceType} = data;
    const fieldId =
        sourceType === DashTabItemControlSourceType.Dataset
            ? source.datasetFieldId
            : source.fieldName;
    const selectedValue = defaults![fieldId];
    const preselectedContent = [{title: selectedValue, value: selectedValue}];
    // @ts-ignore
    const content = loadedData?.uiScheme?.controls[0].content;
    const emptyPaceholder = Utils.isEnabledFeature(Feature.EmptySelector)
        ? i18n('placeholder_empty')
        : undefined;

    const preparedValue = unwrapFromArrayAndSkipOperation(actualParams[fieldId]);

    // for first initialization of control
    const initialValidationError = isValidRequiredValue({
        required: source.required,
        value: preparedValue,
    })
        ? i18n('value_required')
        : null;
    const selectValidationError = validationError || initialValidationError;

    const placeholder =
        Utils.isEnabledFeature(Feature.SelectorRequiredValue) && selectValidationError
            ? selectValidationError
            : emptyPaceholder;

    const onSelectChange = (value: string | string[]) => {
        const hasError = validateValue({
            required: source.required,
            value,
        });

        if (hasError) {
            return;
        }

        const valueWithOperation = addOperationForValue({
            value,
            operation: source.operation,
        });

        onChange({param: fieldId, value: valueWithOperation});
    };

    const {label, innerLabel} = getLabels({controlData: data});

    const props: SelectControlProps = {
        widgetId: id,
        content: content || preselectedContent,
        label,
        innerLabel,
        param: fieldId,
        multiselect: (source as DashTabItemControlElementSelect).multiselectable,
        type: TYPE.SELECT,
        className: b('item', classMixin),
        key: fieldId,
        value: preparedValue as string,
        onChange: onSelectChange,
        onOpenChange,
        loadingItems,
        placeholder,
        required: source.required,
        hasValidationError: Boolean(validationError),
        width,
    };

    if (status === LOAD_STATUS.FAIL) {
        props.errorContent = getErrorContent();
        props.itemsLoaderClassName = b('select-loader');
    }

    if (props.content.length >= LIMIT && sourceType === DashTabItemControlSourceType.Dataset) {
        props.getItems = getItems;
    }

    return <ControlSelect {...props} />;
};
