import React from 'react';

import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {ChangeValue} from '../typings';

import iconCross from '../../../assets/icons/cross.svg';
import iconPlus from '../../../assets/icons/plus.svg';

import './InputFilter.scss';

const b = block('dl-dialog-filter');
const i18n = I18n.keyset('component.dl-dialog-filter.view');

interface DateFilterProps {
    values: string[];
    changeValue: ChangeValue;
    selectable?: boolean;
}

const InputFilter: React.FC<DateFilterProps> = (props) => {
    const {values, selectable, changeValue} = props;

    const onAddButtonClick = React.useCallback(() => {
        changeValue([...values, ''], {needSort: false});
    }, [values, changeValue]);

    const onDeleteButtonClick = React.useCallback(
        (index: number) => {
            const newValues = [...values];
            newValues.splice(index, 1);
            changeValue(newValues, {needSort: false});
        },
        [values, changeValue],
    );

    const onChange = React.useCallback(
        (newValue: string, index: number) => {
            let newValues = [...values];

            if (selectable && values.length > 1) {
                // Do not remove empty lines with multiple manual input
                newValues[index] = newValue;
            } else if (newValue) {
                newValues = [newValue];
            } else {
                newValues = [];
            }

            changeValue(newValues, {needSort: false});
        },
        [values, selectable, changeValue],
    );

    const renderInput = React.useCallback(
        (value: string, index = 0) => (
            <div className={b('row')}>
                <div className={b('label')}>
                    <span>{`${i18n('label_value')} ${selectable ? index + 1 : ''}`}</span>
                </div>
                <TextInput
                    className={b('filter-input-item')}
                    value={value}
                    onUpdate={(newValue) => onChange(newValue, index)}
                />
                {selectable && values.length > 1 && (
                    <Button
                        className={b('delete-button')}
                        view="flat"
                        onClick={() => onDeleteButtonClick(index)}
                    >
                        <Icon data={iconCross} size={16} />
                    </Button>
                )}
            </div>
        ),
        [values, onChange, onDeleteButtonClick, selectable],
    );

    return (
        <div className={b('filter-input')}>
            {selectable ? (
                <React.Fragment>
                    {values.map(renderInput)}
                    <Button onClick={onAddButtonClick}>
                        <Icon data={iconPlus} width="16" />
                        {i18n('button_add')}
                    </Button>
                </React.Fragment>
            ) : (
                renderInput(values[0])
            )}
        </div>
    );
};

export default InputFilter;
