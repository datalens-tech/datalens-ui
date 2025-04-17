import React from 'react';

import {Switch} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import type {RawSQLLevelRowItem} from 'shared/schema/types';

import {changeForm, formSelector} from '../../../../store';
import {Label} from '../../components/Label/Label';
import {RadioGroup} from '../../components/RadioGroup/RadioGroup';

import './RawSQLLevelRow.scss';

const b = block('conn-form-raw-sql-level');

type Props = Omit<RawSQLLevelRowItem, 'type'>;

export function RawSQLLevelRow(props: Props) {
    const {name, label, switchOffValue, radioGroup, disabled} = props;
    const dispatch = useDispatch();
    const form = useSelector(formSelector);
    const value = (form[name] || '') as string;
    const switchChecked = Boolean(value && value !== switchOffValue);

    const handleSwitchUpdate = (checked: boolean) => {
        const nextValue =
            checked && radioGroup?.options[0]?.value ? radioGroup.options[0].value : switchOffValue;
        dispatch(changeForm({[name]: nextValue}));
    };

    return (
        <React.Fragment>
            <Label {...label} />
            <div className={b('control')}>
                <Switch checked={switchChecked} onUpdate={handleSwitchUpdate} disabled={disabled} />
                {switchChecked && (
                    <RadioGroup
                        name={name}
                        options={radioGroup?.options}
                        controlProps={{
                            ...radioGroup?.controlProps,
                            disabled: disabled || radioGroup?.controlProps?.disabled,
                        }}
                    />
                )}
            </div>
        </React.Fragment>
    );
}
