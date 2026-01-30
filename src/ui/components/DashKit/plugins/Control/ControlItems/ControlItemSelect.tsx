import React from 'react';

import type {ConfigItem} from '@gravity-ui/dashkit';
import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {
    DashTabItemControlDataset,
    DashTabItemControlElementSelect,
    DashTabItemControlSingle,
    StringParams,
} from 'shared';
import {DashTabItemControlSourceType} from 'shared';
import {DL} from 'ui/constants/common';
import type {ChartKitCustomError} from 'ui/libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import {ControlSelect} from 'ui/libs/DatalensChartkit/components/Control/Items/Items';
import type {ResponseSuccessSingleControl} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import type {ControlSelect as ControlSelectType} from 'ui/libs/DatalensChartkit/types';
import {openDialogErrorWithTabs} from 'ui/store/actions/dialog';
import {addOperationForValue, unwrapFromArrayAndSkipOperation} from 'ui/units/dash/modules/helpers';
import {selectDashWorkbookId} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import logger from '../../../../../libs/logger';
import {getControlHint} from '../../../utils';
import {LIMIT, LOAD_STATUS, TYPE} from '../constants';
import type {
    ControlSettings,
    ErrorData,
    LoadStatus,
    SelectControlProps,
    ValidationErrorData,
} from '../types';
import {
    getDatasetSourceInfo,
    getErrorText,
    isValidRequiredValue,
    prepareSelectorError,
    processParamsForGetDistincts,
} from '../utils';

import './ControlItemSelect.scss';

type ControlItemSelectProps = {
    id: string;
    data: DashTabItemControlSingle;
    defaults: ConfigItem['defaults'];
    status: LoadStatus;
    loadedData: null | ResponseSuccessSingleControl;
    loadingItems: boolean;
    actualParams: StringParams;
    onChange: ({param, value}: {param: string; value: string | string[]}) => void;
    init: () => void;
    setItemsLoader: (loadingItems: boolean) => void;
    getDistincts?: ControlSettings['getDistincts'];
    validationError: string | null;
    errorData: null | ErrorData;
    validateValue: (args: ValidationErrorData) => boolean | undefined;
    classMixin?: string;
    labelMixin?: string;
    renderOverlay?: () => React.ReactNode;
    selectProps: Pick<
        SelectControlProps,
        'style' | 'innerLabel' | 'label' | 'limitLabel' | 'labelPlacement' | 'accentType'
    >;
};

const b = block('control-item-select');
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
    setItemsLoader,
    validateValue,
    classMixin,
    selectProps,
    renderOverlay,
    labelMixin,
}: ControlItemSelectProps) => {
    const dispatch = useDispatch();
    let _loadingItemsTimer: NodeJS.Timeout | undefined;

    const workbookId = useSelector(selectDashWorkbookId);

    // TODO: seems like this function should be in shared/ui
    const getSelectDistincts = React.useCallback(
        async ({searchPattern, nextPageToken}: {searchPattern: string; nextPageToken: number}) => {
            try {
                const datasetData = data as DashTabItemControlDataset;
                const datasetSourceInfo = getDatasetSourceInfo({
                    actualLoadedData: loadedData,
                    data: datasetData,
                });
                const {datasetId, datasetFieldId} = datasetSourceInfo;

                const {filters, parameter_values} = processParamsForGetDistincts({
                    params: actualParams,
                    datasetSourceInfo,
                    searchPattern,
                });

                const {result} = await getDistincts!(
                    {
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
                    },
                    undefined,
                    {datasetSourceInfo, searchPattern},
                );

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
        const errorMessage = errorTitle || errorText;

        const showButtons = !errorData?.extra?.hideErrorDetails;

        const buttonsSize = DL.IS_MOBILE ? MOBILE_SIZE.BUTTON : 's';
        const buttonsWidth = DL.IS_MOBILE ? 'max' : 'auto';

        return (
            <div className={b('error', {inside: true, mobile: DL.IS_MOBILE})}>
                <span className={b('error-text')} title={errorMessage}>
                    {errorMessage}
                </span>
                {showButtons && (
                    <div className={b('buttons')}>
                        <Button
                            size={buttonsSize}
                            onClick={() => {
                                setItemsLoader(true);
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
                                        error: prepareSelectorError(
                                            data || {},
                                        ) as ChartKitCustomError,
                                        title: errorTitle,
                                    }),
                                )
                            }
                            width={buttonsWidth}
                        >
                            {i18n('button_details')}
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const onOpenChange = ({open}: {open: boolean}) => {
        clearTimeout(_loadingItemsTimer);

        // can be time lag in group controls because of timeout
        if (status !== LOAD_STATUS.PENDING && loadingItems) {
            setItemsLoader(false);
        }

        if (status === LOAD_STATUS.PENDING) {
            if (open) {
                setItemsLoader(true);
            } else {
                // A delay for displaying the Loader in the Popup, to prevent loading blinking while closing.
                _loadingItemsTimer = setTimeout(() => {
                    if (status === LOAD_STATUS.PENDING) {
                        setItemsLoader(true);
                    }
                });
            }
        }
    };

    const {source, sourceType} = data;
    const fieldId =
        sourceType === DashTabItemControlSourceType.Dataset
            ? source.datasetFieldId
            : source.fieldName;
    const selectedValue = unwrapFromArrayAndSkipOperation(defaults![fieldId]);
    const preselectedContent = [{title: selectedValue, value: selectedValue}];

    const content = loadedData
        ? (loadedData.uiScheme?.controls[0] as ControlSelectType).content
        : null;
    const disabled = loadedData?.uiScheme?.controls[0].disabled;

    const emptyPaceholder = i18n('placeholder_empty');

    const preparedValue = unwrapFromArrayAndSkipOperation(actualParams[fieldId]);

    // for first initialization of control
    const initialValidationError = isValidRequiredValue({
        required: source.required,
        value: preparedValue,
    })
        ? i18n('value_required')
        : null;
    const selectValidationError = validationError || initialValidationError;

    const placeholder = selectValidationError || emptyPaceholder;

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

    // The value may not be relevant before loadedData is loaded.
    const value = disabled || !loadedData ? '' : (preparedValue as string);

    const props: SelectControlProps = {
        widgetId: id,
        content: content || preselectedContent,
        param: fieldId,
        multiselect: (source as DashTabItemControlElementSelect).multiselectable,
        type: TYPE.SELECT,
        className: b(null, classMixin),
        labelClassName: b(null, labelMixin),
        key: fieldId,
        value,
        onChange: onSelectChange,
        onOpenChange,
        loadingItems,
        placeholder,
        required: source.required,
        hint: getControlHint(source),
        hasValidationError: Boolean(selectValidationError),
        renderOverlay,
        disabled,
        ...selectProps,
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
