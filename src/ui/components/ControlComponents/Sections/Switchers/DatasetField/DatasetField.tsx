import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import sortBy from 'lodash/sortBy';
import type {DATASET_FIELD_TYPES, DatasetFieldCalcMode, WorkbookId} from 'shared';
import {DatasetFieldType, DialogControlQa, isParameter} from 'shared';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents';

import {DataTypeIcon} from '../../../../..';
import {i18n} from '../../../../../../i18n';
import logger from '../../../../../libs/logger';
import {getSdk} from '../../../../../libs/schematic-sdk';

import './DatasetField.scss';

const b = block('control-switcher-dataset-field');

type Props = {
    title?: string;
    datasetId?: string;
    workbookId: WorkbookId;
    fieldId?: string;
    ignoredFieldTypes?: DatasetFieldType[];
    ignoredDataTypes?: DATASET_FIELD_TYPES[];
    onChange?: (args: {
        fieldId: string;
        fieldType: DATASET_FIELD_TYPES;
        fieldName: string;
        datasetFieldType: DatasetFieldType;
    }) => void;
    hasValidationError: boolean;
};

type State = {
    datasetId?: string;
    items?: {
        data_type: string;
        guid: string;
        hidden: boolean;
        title: string;
        type: string;
    }[];
};

export class DatasetField extends React.PureComponent<Props, State> {
    static getDerivedStateFromProps(nextProps: Props, prevState: State): State | null {
        if (nextProps.datasetId === prevState.datasetId) {
            return null;
        }

        return {
            datasetId: nextProps.datasetId,
            items: undefined,
        };
    }

    constructor(props: Props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        if (this.props.datasetId) {
            this.getDatasetFields();
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.datasetId && this.props.datasetId !== prevProps.datasetId) {
            this.getDatasetFields();
        }
    }

    getDatasetFields() {
        const {
            ignoredFieldTypes = [DatasetFieldType.Measure],
            ignoredDataTypes = [],
            workbookId,
        } = this.props;

        getSdk()
            .bi.getDataSetFieldsById({
                dataSetId: this.props.datasetId!,
                workbookId,
            })
            .then(({fields}) =>
                this.setState(
                    {
                        items: sortBy(fields, 'title').filter(
                            (field: {
                                data_type: string;
                                guid: string;
                                hidden: boolean;
                                title: string;
                                type: string;
                                calc_mode: DatasetFieldCalcMode;
                            }) => {
                                return (
                                    !field.hidden &&
                                    !ignoredFieldTypes.includes(field.type as DatasetFieldType) &&
                                    !ignoredDataTypes.includes(
                                        field.data_type as DATASET_FIELD_TYPES,
                                    ) &&
                                    !isParameter(field)
                                );
                            },
                        ),
                    },
                    () => {
                        if (this.props.fieldId) {
                            this.handleChange([this.props.fieldId]);
                        }
                    },
                ),
            )
            .catch((error) => {
                logger.logError('Control: getDataSetFieldsById failed', error);
                console.error('DATASET_FIELDS', error);
            });
    }

    handleChange = (fieldId: string[]) => {
        const item = this.state.items?.find(({guid}) => guid === fieldId[0]);
        if (item) {
            this.props.onChange?.({
                fieldId: fieldId[0],
                datasetFieldType: item.type as DatasetFieldType,
                fieldType: item.data_type as DATASET_FIELD_TYPES,
                fieldName: item.title,
            });
        }
    };

    getOptions = (): SelectOption[] => {
        const {items} = this.state;
        if (!items) {
            return [];
        }
        return items.map(({title, guid, data_type: dataType, type}) => {
            return {
                value: guid,
                data: {
                    icon: (
                        <DataTypeIcon
                            dataType={dataType as DATASET_FIELD_TYPES}
                            className={b('icon', {
                                dimension: type === DatasetFieldType.Dimension,
                                measure: type === DatasetFieldType.Measure,
                            })}
                        />
                    ),
                },
                content: title,
            };
        });
    };

    renderOptions = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

    render() {
        const {fieldId, hasValidationError} = this.props;
        const {items} = this.state;

        return (
            <Select
                width="max"
                filterable={true}
                disabled={!items}
                placeholder={i18n('dash.control-dialog.edit', 'context_choose')}
                value={fieldId ? [fieldId] : []}
                onUpdate={this.handleChange}
                options={this.getOptions()}
                renderSelectedOption={this.renderOptions}
                renderOption={this.renderOptions}
                popupClassName={b('dataset-popup')}
                filterPlaceholder={i18n('dash.control-dialog.edit', 'placeholder_search')}
                qa={DialogControlQa.fieldSelect}
                error={hasValidationError}
            />
        );
    }
}
