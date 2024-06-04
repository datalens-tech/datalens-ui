import React from 'react';

import {DatePicker as BaseDatepicker} from '@gravity-ui/date-components';
import type {DatePickerProps} from '@gravity-ui/date-components';
import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import block from 'bem-cn-lite';
import {get} from 'lodash';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {DatepickerItem} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import {changeForm, changeInnerForm} from '../../../../store';
import {withControlWrap} from '../withControlWrap/withControlWrap';

import './Datepicker.scss';

const b = block('conn-form-datepicker');

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type DatepickerProps = DispatchState & DispatchProps & Omit<DatepickerItem, 'id'>;

const DatepickerComponent = (props: DatepickerProps) => {
    const {actions, form, innerForm, name, placeholder, inner = false} = props;
    const controlProps = get(props, 'controlProps', {} as Partial<DatePickerProps>);
    const size = get(controlProps, 'size', 'm');
    const formValue = inner ? innerForm[name] : form[name];
    const date = dateTime({input: (formValue ?? '') as string});
    const value = date.isValid() ? date : null;

    const updateHandler = React.useCallback(
        (nextDate: DateTime | null) => {
            if (inner) {
                actions.changeInnerForm({[name]: nextDate?.format()});
            } else {
                actions.changeForm({[name]: nextDate?.format()});
            }
        },
        [actions, name, inner],
    );

    return (
        <BaseDatepicker
            {...controlProps}
            className={b()}
            size={size}
            placeholder={placeholder}
            value={value}
            onUpdate={updateHandler}
        />
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        form: state.connections.form,
        innerForm: state.connections.innerForm,
        validationErrors: state.connections.validationErrors,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                changeForm,
                changeInnerForm,
            },
            dispatch,
        ),
    };
};

export const Datepicker = connect(
    mapStateToProps,
    mapDispatchToProps,
)(withControlWrap(DatepickerComponent));
