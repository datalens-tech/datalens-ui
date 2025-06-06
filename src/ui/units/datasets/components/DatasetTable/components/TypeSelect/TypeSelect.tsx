import React from 'react';

import {Button, Select} from '@gravity-ui/uikit';
import type {SelectOption, SelectRenderControlProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {DATASET_FIELD_TYPES, DatasetField} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {DataTypeIcon} from 'ui';

import {getDatasetLabelValue, getSelectedValueForSelect} from '../../../../../../utils/helpers';
import {datasetValidationSelector} from '../../../../store/selectors/dataset';

import './TypeSelect.scss';

const b = block('type-select');

type StateProps = ReturnType<typeof mapStateToProps>;

interface Props extends StateProps {
    selectedType: string;
    types: DATASET_FIELD_TYPES[];
    field: DatasetField;
    onSelect: (row: DatasetField, value: DATASET_FIELD_TYPES) => void;
}

class TypeSelectComponent extends React.Component<Props> {
    render() {
        const {selectedType} = this.props;

        const selectedOption: string[] = [selectedType];

        return (
            <Select
                value={selectedOption}
                onUpdate={(values) => this.onSelect(values as [DATASET_FIELD_TYPES])}
                options={this.typeList}
                renderControl={this.renderSelectControl}
                renderOption={(options) => {
                    return this.renderSelectOption(options, true);
                }}
            />
        );
    }

    get typeList(): SelectOption[] {
        const {types, validation} = this.props;

        return types
            .map((type): SelectOption => {
                return {
                    value: type,
                    content: getDatasetLabelValue(type),
                    disabled: validation.isLoading,
                };
            })
            .sort((current, next) => {
                const content = current.content as string;
                const contentNext = next.content as string;

                return content.localeCompare(contentNext, undefined, {numeric: true});
            });
    }

    private onSelect = (values: [DATASET_FIELD_TYPES]) => {
        const value = values[0];
        this.props.onSelect(this.props.field, value);
    };

    private renderSelectOption = (option: SelectOption, isOption?: boolean) => {
        const type = option.value as DATASET_FIELD_TYPES;
        const typeName = option.content;

        const modifiers = {
            option: isOption,
            disabled: option.disabled,
        };

        return (
            <span className={b('select-item', modifiers)}>
                <DataTypeIcon className={b('type')} dataType={type} />
                {typeName}
            </span>
        );
    };

    private renderSelectControl = ({ref, triggerProps}: SelectRenderControlProps) => {
        const {selectedType} = this.props;
        const selectedValue = getSelectedValueForSelect([selectedType], this.props.types);

        const value = selectedValue[0];

        return (
            <Button
                onClick={triggerProps.onClick}
                onKeyDown={triggerProps.onKeyDown}
                ref={ref as React.Ref<HTMLButtonElement>}
                view="flat"
                className={b('select-control')}
            >
                {this.renderSelectOption({value, content: getDatasetLabelValue(value)})}
            </Button>
        );
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        validation: datasetValidationSelector(state),
    };
};

export const TypeSelect = connect(mapStateToProps)(TypeSelectComponent);
