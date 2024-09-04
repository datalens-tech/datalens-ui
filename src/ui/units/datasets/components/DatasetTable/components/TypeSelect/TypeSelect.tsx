import React from 'react';

import {Button, Select} from '@gravity-ui/uikit';
import type {SelectOption, SelectRenderControlProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import type {DATASET_FIELD_TYPES} from 'shared';
import {DataTypeIcon} from 'ui';
import {datasetValidationSelector} from 'ui/units/datasets/store/selectors';

import {getSelectedValueForSelect} from '../../../../../../utils/helpers';
import {getLabelValue} from '../../utils';

import './TypeSelect.scss';

const b = block('type-select');

interface TypeSelectProps {
    selectedType: DATASET_FIELD_TYPES;
    types: DATASET_FIELD_TYPES[];
    onSelect: (value: DATASET_FIELD_TYPES) => void;
}

export const TypeSelect: React.FC<TypeSelectProps> = ({
    selectedType: initSelectedType,
    onSelect,
    types,
}) => {
    const [selectedType, setSelectedType] = React.useState([initSelectedType]);
    const datasetValidation = useSelector(datasetValidationSelector);

    React.useEffect(() => {
        setSelectedType([initSelectedType]);
    }, [initSelectedType]);

    const handleUpdate = (type: string[]) => {
        setSelectedType(type as DATASET_FIELD_TYPES[]);
        onSelect(type[0] as DATASET_FIELD_TYPES);
    };

    const getTypesList = (): SelectOption[] => {
        return types
            .map((type): SelectOption => {
                return {
                    value: type,
                    content: getLabelValue(type),
                    disabled: datasetValidation.isLoading,
                };
            })
            .sort((current, next) => {
                const content = current.content as string;
                const contentNext = next.content as string;

                return content.localeCompare(contentNext, undefined, {numeric: true});
            });
    };

    const renderSelectOption = (option: SelectOption, isOption?: boolean) => {
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

    const renderSelectControl = ({onClick, ref, onKeyDown}: SelectRenderControlProps) => {
        const selectedValue = getSelectedValueForSelect(selectedType, types);

        const value = selectedValue[0];

        return (
            <Button
                onClick={onClick}
                ref={ref}
                extraProps={{onKeyDown}}
                view="flat"
                className={b('select-control')}
            >
                {renderSelectOption({value, content: getLabelValue(value)})}
            </Button>
        );
    };

    return (
        <Select
            value={selectedType}
            onUpdate={handleUpdate}
            options={getTypesList()}
            renderControl={renderSelectControl}
            renderOption={(options) => {
                return renderSelectOption(options, true);
            }}
        />
    );
};
