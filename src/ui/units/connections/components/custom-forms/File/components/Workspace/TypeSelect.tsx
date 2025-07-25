import React from 'react';

import {
    Button,
    type ButtonView,
    Select,
    type SelectOption,
    type SelectProps,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {CommonFieldType, DATASET_FIELD_TYPES} from 'shared';
import {DataTypeIcon} from 'ui';

const b = block('conn-form-file');
const i18n = I18n.keyset('common.data-types');

type TypeSelectProps = {
    onUpdate: (type: DATASET_FIELD_TYPES) => void;
    types: DATASET_FIELD_TYPES[];
    value: DATASET_FIELD_TYPES;
};

const getOptions = (types: DATASET_FIELD_TYPES[]): SelectOption[] => {
    return types
        .map((type) => ({
            value: type,
            content: i18n(`label_${type as CommonFieldType}`),
        }))
        .sort((current, next) => {
            const {content} = current;
            const {content: contenteNext} = next;
            return content.localeCompare(contenteNext, undefined, {numeric: true});
        });
};

export const TypeSelect = ({onUpdate, types, value}: TypeSelectProps) => {
    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState([value]);

    const handleUpdate = (nextValues: string[]) => {
        setSelectedValue(nextValues as DATASET_FIELD_TYPES[]);
        onUpdate(nextValues[0] as DATASET_FIELD_TYPES);
    };

    const handleOpen = (nextOpen: boolean) => {
        setOpen(nextOpen);
    };

    const renderControl: NonNullable<SelectProps['renderControl']> = ({triggerProps}) => {
        const view: ButtonView = open ? 'normal' : 'outlined';
        return (
            <Button
                {...triggerProps}
                className={b('type-select')}
                view={view}
                size="s"
                selected={open}
            >
                <DataTypeIcon className={b('type-select-icon')} dataType={selectedValue[0]} />
            </Button>
        );
    };

    const renderOption: NonNullable<SelectProps['renderOption']> = (props) => {
        return (
            <React.Fragment>
                <DataTypeIcon
                    className={b('type-select-icon', {'with-mr': true})}
                    dataType={props.value as DATASET_FIELD_TYPES}
                />
                {props.content}
            </React.Fragment>
        );
    };

    React.useEffect(() => {
        setSelectedValue([value]);
    }, [value]);

    return (
        <Select
            value={selectedValue}
            options={getOptions(types)}
            onUpdate={handleUpdate}
            onOpenChange={handleOpen}
            renderControl={renderControl}
            renderOption={renderOption}
        />
    );
};
