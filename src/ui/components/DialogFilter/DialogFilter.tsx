import React from 'react';

import type {SelectOption, SelectProps} from '@gravity-ui/uikit';
import {Button, Dialog, Icon, Loader, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {I18n} from 'i18n';
import _ from 'lodash';
import type {
    ApiV2Filter,
    DatasetField,
    DatasetOptions,
    DatasetUpdate,
    Field,
    WorkbookId,
} from 'shared';
import {
    Feature,
    Operations,
    TIMEOUT_90_SEC,
    getFieldsApiV2RequestSection,
    getParametersApiV2RequestSection,
} from 'shared';
import type {GetDistinctsApiV2TransformedResponse} from 'shared/schema';

import {NO_SELECTED_VALUES_OPERATION} from '../../constants/operations';
import {withHiddenUnmount} from '../../hoc';
import {Utils} from '../../index';
import {getFilterOperations, getWhereOperation} from '../../libs/datasetHelper';
import logger from '../../libs/logger';
import {getSdk} from '../../libs/schematic-sdk';
import DataTypeIcon from '../DataTypeIcon/DataTypeIcon';
import DatasetFieldList from '../DatasetFieldList/DatasetFieldList';

import BooleanFilter from './BooleanFilter/BooleanFilter';
import DateFilter from './DateFilter/DateFilter';
import InputFilter from './InputFilter/InputFilter';
import SelectFilter from './SelectFilter/SelectFilter';
import type {Operation} from './constants';
import {LIST_ITEM_HEIGHT} from './constants';
import type {ChangeValue} from './typings';
import {ViewMode} from './typings';
import {CommonDataType, getAvailableOperations, getCommonDataType} from './utils';

import iconArrow from '../../assets/icons/arrow-left.svg';

import './DialogFilter.scss';

export const DIALOG_FILTER = Symbol('DIALOG_FILTER');

const b = block('dl-dialog-filter');
const i18n = I18n.keyset('component.dl-dialog-filter.view');
const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
const VALUES_LOAD_LIMIT = 1000;
const DEBOUNCE_DELAY = 250;
const OPERATIONS_WITHOUT_VALUE = [
    Operations.ISNULL,
    Operations.ISNOTNULL,
    Operations.NO_SELECTED_VALUES,
];
const SELECTABLE_OPERATIONS = [Operations.IN, Operations.NIN];

export interface ApplyData {
    values: string[];
    operation: string;
    fieldGuid: string;
    filterId?: string;
}

export interface Filter {
    filterId: string;
    operation: string;
    values: string[];
}

export interface DialogFilterProps {
    onApply: (data: ApplyData) => void;
    onClose: () => void;
    datasetId: string;
    workbookId: WorkbookId;
    visible: boolean;
    options: DatasetOptions;
    fields?: DatasetField[];
    field?: DatasetField | Field | null;
    filter?: Filter;
    updates?: DatasetUpdate[];
    hideApplyButton?: boolean;
    parameters?: (Field | DatasetField)[];
    dashboardParameters?: (Field | DatasetField)[];
}

interface DialogFilterState {
    viewMode: ViewMode;
    availableOperations: Operation[];
    // null can appear in user data (from getDistincts), but it cannot be selected as a filter value,
    // therefore, further in the code there will be casts of the type "values as string[]"
    values: (string | null)[];
    selectableValues: (string | null)[];
    dimensions: string[];
    field: DatasetField | null;
    operation: Operation | null;
    whereOperation: string | null;
    valid: boolean;
    prepared: boolean;
    useSuggest: boolean;
    useManualInput: boolean;
    fetching: boolean;
    suggestFetching: boolean;
}

export type OpenDialogFilterArgs = {
    id: typeof DIALOG_FILTER;
    props: DialogFilterProps;
};

class DialogFilter extends React.Component<DialogFilterProps, DialogFilterState> {
    debounced: any;
    debouncedApply: any;

    isUnmounted = false;

    constructor(props: DialogFilterProps) {
        super(props);

        this.debouncedApply = _.debounce(this.onApply, 60);

        this.state = {
            viewMode: ViewMode.Fields,
            availableOperations: [],
            values: [],
            selectableValues: [],
            dimensions: [],
            field: null,
            operation: null,
            whereOperation: null,
            valid: true,
            prepared: false,
            useSuggest: false,
            useManualInput: false,
            fetching: false,
            suggestFetching: false,
        };
    }

    componentDidMount() {
        const {field, filter, options} = this.props;

        if (!field) {
            return;
        }

        const filterOperations = getFilterOperations(field, options);
        let availableOperations = getAvailableOperations(field, filterOperations);

        if (
            Utils.isEnabledFeature(Feature.EmptySelector) &&
            'unsaved' in field &&
            field.unsaved &&
            filter?.operation === Operations.NO_SELECTED_VALUES
        ) {
            availableOperations = [NO_SELECTED_VALUES_OPERATION, ...availableOperations];
        }
        const operation = filter
            ? availableOperations.find((op) => op.value === filter.operation) ||
              availableOperations[0]
            : availableOperations[0];
        const values = filter ? filter.values : [];

        this.prepareFilter(field, operation);

        this.setState({
            availableOperations,
            operation,
            values,
            selectableValues: values,
            viewMode: ViewMode.Filters,
        });
    }

    componentDidUpdate(_prevProps: DialogFilterProps, prevState: DialogFilterState) {
        const {operation, selectableValues} = this.state;

        const prevOperation = prevState.operation?.value;
        const currentOperation = operation?.value;

        if (!prevOperation || !currentOperation) {
            return;
        }

        if (
            prevOperation !== currentOperation &&
            !SELECTABLE_OPERATIONS.includes(prevOperation) &&
            SELECTABLE_OPERATIONS.includes(currentOperation)
        ) {
            this.onChangeSuggest('');
            this.setState({values: selectableValues});
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    render() {
        const {visible} = this.props;

        return (
            <Dialog
                open={visible}
                onClose={this.onClose}
                onEnterKeyDown={() => {
                    if (this.isApplyButtonDisabled()) {
                        return;
                    }
                    this.onApply();
                }}
            >
                <div className={b()}>
                    {this.renderHeader()}
                    {this.renderBody()}
                    <Dialog.Divider className={b('divider')} />
                    {this.renderFooter()}
                </div>
            </Dialog>
        );
    }

    get field() {
        return this.props.field || this.state.field;
    }

    renderHeader() {
        const {viewMode} = this.state;

        if (viewMode === ViewMode.Fields || !this.field) {
            return <Dialog.Header caption={i18n('label_header-title')} />;
        }

        const {title, type, data_type: dataType} = this.field;

        return (
            <Dialog.Header
                caption={title}
                insertBefore={
                    <React.Fragment>
                        {!this.props.field && (
                            <Button
                                className={b('arrow-back-button')}
                                size="s"
                                view="flat"
                                onClick={this.onArrowBackClick}
                            >
                                <Icon data={iconArrow} size={20} />
                            </Button>
                        )}
                        <DataTypeIcon
                            fieldType={type}
                            dataType={dataType}
                            className={b('header-title-icon')}
                        />
                    </React.Fragment>
                }
            />
        );
    }

    renderBody() {
        const {fields = []} = this.props;
        const {viewMode, operation, useManualInput, fetching} = this.state;

        const mods = {
            'without-paddings':
                viewMode === ViewMode.Filters && operation?.selectable && !useManualInput,
            'without-horizontal-paddings': viewMode === ViewMode.Fields,
            mode: ViewMode.Fields,
        };

        if (viewMode === ViewMode.Fields || !operation) {
            return (
                <Dialog.Body className={b('body', mods)}>
                    <DatasetFieldList
                        fields={fields}
                        itemHeight={LIST_ITEM_HEIGHT}
                        onFiledItemClick={this.onFiledItemClick}
                    />
                </Dialog.Body>
            );
        }

        return (
            <React.Fragment>
                {this.renderOperationSection()}
                <Dialog.Divider />
                <Dialog.Body className={b('body', mods)}>
                    {fetching && operation.selectable ? (
                        <div className={b('loader')}>
                            <Loader size="m" />
                        </div>
                    ) : (
                        this.renderFilterSection()
                    )}
                </Dialog.Body>
            </React.Fragment>
        );
    }

    renderOperationSection() {
        const {availableOperations, operation} = this.state;
        const options: SelectOption[] = availableOperations.map(
            (item: Operation): SelectOption => ({
                value: item.value,
                content: item.title,
                qa: item.value,
            }),
        );

        const value = operation?.value ? [operation.value] : [];

        return (
            <div className={b('operation')}>
                <span className={b('operation-label')}>{i18n('label_operation')}</span>
                <div className={b('operation-select')}>
                    <Select
                        value={value}
                        options={options}
                        onUpdate={this.onChangeOperation}
                        qa="operation-select"
                    />
                </div>
            </div>
        );
    }

    renderFilterSection() {
        const {values, operation, dimensions, useSuggest, useManualInput, suggestFetching} =
            this.state;
        const operationValue = operation?.value || ('' as Operation['value']);

        if (!operation || !this.field || OPERATIONS_WITHOUT_VALUE.includes(operationValue)) {
            return null;
        }

        if (operation.selectable && !useManualInput) {
            return (
                <SelectFilter
                    values={values}
                    dimensions={dimensions}
                    useSuggest={useSuggest}
                    suggestFetching={suggestFetching}
                    changeValue={this.onChangeValue}
                    onChangeSuggest={this.debouncedChangeSuggest}
                />
            );
        }

        const commonDataType = getCommonDataType(this.field);

        switch (commonDataType) {
            case CommonDataType.Boolean: {
                return (
                    <BooleanFilter values={values as string[]} changeValue={this.onChangeValue} />
                );
            }

            case CommonDataType.Date: {
                return (
                    <DateFilter
                        values={values as string[]}
                        field={this.field}
                        operation={operation}
                        changeValue={this.onChangeValue}
                    />
                );
            }

            default: {
                return (
                    <InputFilter
                        values={values as string[]}
                        selectable={operation.selectable}
                        changeValue={this.onChangeValue}
                    />
                );
            }
        }
    }

    renderFooter() {
        const {dimensions, viewMode, useSuggest} = this.state;
        const {hideApplyButton} = this.props;

        if (viewMode === ViewMode.Fields) {
            return null;
        }

        let textButtonApply;
        let onClickButtonApply;

        if (!hideApplyButton) {
            textButtonApply = i18n('button_apply');
            onClickButtonApply = this.debouncedApply;
        }

        return (
            <Dialog.Footer
                onClickButtonCancel={this.onClose}
                onClickButtonApply={onClickButtonApply}
                textButtonApply={textButtonApply}
                textButtonCancel={i18n('button_cancel')}
                propsButtonApply={{
                    disabled: this.isApplyButtonDisabled(),
                }}
            >
                {useSuggest && dimensions.length === VALUES_LOAD_LIMIT && (
                    <span className={b('load-limit-reached-warn')}>
                        {i18n('label_load-limit-reached-warn')}
                    </span>
                )}
            </Dialog.Footer>
        );
    }

    // eslint-disable-next-line complexity
    isApplyButtonDisabled = () => {
        if (!this.state.valid) {
            return true;
        }

        const {filter} = this.props;
        const {values, dimensions, useSuggest} = this.state;
        const operation = this.state.operation as Operation;
        const isSameOperation = Boolean(filter && operation.value === filter.operation);
        const isValuesEmpty = !values.length;

        switch (operation.value) {
            case Operations.IN:
            case Operations.NIN: {
                const isOnlyOneValueAndEmpty = values.length === 1 && values[0] === '';
                const hasMissingValue =
                    values.length === 1 &&
                    dimensions.length > 0 &&
                    !dimensions.includes(values[0] || '') &&
                    !useSuggest;

                if (filter) {
                    const isValuesEqual = _.isEqual(values, filter.values);
                    return isValuesEmpty || (isValuesEqual && isSameOperation) || hasMissingValue;
                }

                return isValuesEmpty || hasMissingValue || isOnlyOneValueAndEmpty;
            }
            case Operations.ISNULL:
            case Operations.ISNOTNULL: {
                if (filter) {
                    return isSameOperation;
                }

                return false;
            }

            default: {
                if (filter) {
                    const isValuesEqual = operation.selectable
                        ? _.isEqual(values, filter.values)
                        : values[0] === filter.values[0];

                    return isValuesEmpty || (isValuesEqual && isSameOperation);
                }

                return isValuesEmpty;
            }
        }
    };

    getDistincts = (
        datasetId: string,
        field: DatasetField | Field,
        filters: ApiV2Filter[] = [],
    ): Promise<GetDistinctsApiV2TransformedResponse> => {
        const {updates = [], parameters = [], dashboardParameters = [], workbookId} = this.props;

        const fields = getFieldsApiV2RequestSection([field], 'distinct');
        const parameter_values = getParametersApiV2RequestSection({
            parameters,
            dashboardParameters,
        });

        getSdk().cancelRequest('getDistincts');

        return getSdk().bi.getDistinctsApiV2(
            {
                datasetId,
                workbookId,
                fields,
                limit: VALUES_LOAD_LIMIT,
                updates,
                filters,
                parameter_values,
            },
            {concurrentId: 'getDistincts', timeout: TIMEOUT_90_SEC},
        );
    };

    fetchDistincts = async (field: DatasetField) => {
        const {datasetId, options} = this.props;

        try {
            this.setState({fetching: true});

            const whereOperation = getWhereOperation(field, options);
            const data = await this.getDistincts(datasetId, field);
            const dimensions: string[] = data.result.data.Data.map((row: string[]) => row[0]).sort(
                collator.compare,
            );
            const useSuggest = Boolean(dimensions.length === VALUES_LOAD_LIMIT && whereOperation);

            if (this.isUnmounted) {
                return;
            }

            this.setState({
                dimensions,
                whereOperation,
                useSuggest,
                prepared: true,
                fetching: false,
            });
        } catch (error) {
            if (this.isUnmounted || getSdk().isCancel(error)) {
                return;
            }

            logger.logError('DialogFilter: fetchDistincts failed', error);
            this.setState({
                /* prepared and useManualInput flags are fallbacks for sources,
                for which the query of distinkts does not work, as well as for fallen queries*/
                prepared: true,
                useManualInput: true,
                fetching: false,
            });
        }
    };

    prepareFilter = (field: DatasetField, operation: Operation) => {
        if (operation.selectable) {
            this.fetchDistincts(field);
        }
    };

    onArrowBackClick = () => {
        this.setState({
            field: null,
            viewMode: ViewMode.Fields,
        });
    };

    onFiledItemClick = (field: DatasetField) => {
        const {options} = this.props;
        const filterOperations = getFilterOperations(field, options);
        const availableOperations = getAvailableOperations(field, filterOperations);
        const operation = availableOperations[0];

        this.prepareFilter(field, operation);

        this.setState({
            field,
            availableOperations,
            operation,
            values: [],
            viewMode: ViewMode.Filters,
        });
    };

    onChangeValue: ChangeValue = (values, meta) => {
        const {operation} = this.state;

        const {needSort = true, valid = true} = meta || {};
        const isSelectable = SELECTABLE_OPERATIONS.includes(operation?.value as Operations);
        let newValues = [...values];

        if (needSort) {
            newValues = newValues.sort(collator.compare);
        }

        const updatedState:
            | Pick<DialogFilterState, 'valid' | 'values'>
            | Pick<DialogFilterState, 'valid' | 'values' | 'selectableValues'> = {
            valid,
            values: newValues,
            ...(isSelectable && {selectableValues: newValues}),
        };

        this.setState(updatedState);
    };

    onChangeOperation: SelectProps['onUpdate'] = ([value]) => {
        const prevOperation = this.state.operation;

        if (
            prevOperation?.value === Operations.NO_SELECTED_VALUES &&
            value !== Operations.NO_SELECTED_VALUES
        ) {
            const filteredAvailableOperations = this.state.availableOperations.filter(
                (op) => op.value !== Operations.NO_SELECTED_VALUES,
            );
            this.setState({availableOperations: filteredAvailableOperations});
        }

        const {availableOperations, prepared, fetching} = this.state;

        const operation = availableOperations.find((op) => op.value === value) as Operation;

        if (!prepared && operation.selectable && !fetching) {
            // If the interface has an operations selector, this.field cannot be null
            this.prepareFilter(this.field as DatasetField, operation);
        }

        this.setState({operation});
    };

    onChangeSuggest = async (search: string) => {
        if (!this.field || this.state.fetching) {
            return;
        }

        try {
            const {datasetId} = this.props;
            const {whereOperation} = this.state;

            let where: ApiV2Filter[] | undefined;

            this.setState({suggestFetching: true});

            if (search && whereOperation) {
                where = [
                    {
                        values: [search],
                        operation: whereOperation,
                        ref: {type: 'id', id: this.field.guid},
                    },
                ];
            }

            const data = await this.getDistincts(datasetId, this.field, where);
            const dimensions: string[] = data.result.data.Data.map((row: string[]) => row[0]).sort(
                collator.compare,
            );

            if (this.isUnmounted) {
                return;
            }

            this.setState({
                dimensions,
                suggestFetching: false,
            });
        } catch (error) {
            if (this.isUnmounted || getSdk().isCancel(error)) {
                return;
            }
            logger.logError('DialogFilter: onChangeSuggest failed', error);
            this.setState({suggestFetching: false});
        }
    };

    onApply = () => {
        const {filter} = this.props;
        const {useManualInput} = this.state;
        const {guid: fieldGuid} = this.field as DatasetField;
        const {selectable, value: operationValue} = this.state.operation as Operation;

        let values = [...this.state.values];
        let filterId;

        if (OPERATIONS_WITHOUT_VALUE.includes(operationValue)) {
            /* Send an empty array when ISNULL, ISNOTNULL */
            values = [];
        } else if (useManualInput && selectable) {
            /* Case when user added a bunch of empty input
            when setting multiple values manually */
            values = values.filter(Boolean);
        } else if (!selectable) {
            /* Not take any other possible values that may be added
            to the list when working with selectable operations */
            values = values.slice(0, 1);
        }

        if (filter) {
            filterId = filter.filterId;
        }

        this.props.onApply({
            values: values as string[],
            fieldGuid,
            filterId,
            operation: operationValue,
        });
    };

    onClose = () => {
        this.props.onClose();
    };

    debouncedChangeSuggest = (search: string) => {
        if (this.debounced) {
            this.debounced.cancel();
        }

        this.debounced = _.debounce(this.onChangeSuggest, DEBOUNCE_DELAY);
        this.debounced(search);
    };
}

const DialogFilterComponent = withHiddenUnmount(DialogFilter);

DialogManager.registerDialog(DIALOG_FILTER, DialogFilterComponent);

export default DialogFilterComponent;
