import React from 'react';

import {get} from 'lodash';
import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import type {DatepickerItem} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';
import {SimpleDatepickerOutput, SimpleDatepickerProps} from 'ui/components/common/SimpleDatepicker';
import {registry} from 'ui/registry';

import {changeForm, changeInnerForm} from '../../../../store';
import {withControlWrap} from '../withControlWrap/withControlWrap';

const {SimpleDatepicker} = registry.common.components.getAll();
type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type DatepickerProps = DispatchState & DispatchProps & Omit<DatepickerItem, 'id'>;

const DatepickerComponent = (props: DatepickerProps) => {
    const {actions, form, innerForm, name, placeholder, inner = false} = props;
    const controlProps = get(props, 'controlProps', {} as Partial<SimpleDatepickerProps>);
    const size = get(controlProps, 'size', 'm');
    const formValue = inner ? innerForm[name] : form[name];
    const value = (formValue ?? '') as string;

    const updateHandler = React.useCallback(
        ({date}: SimpleDatepickerOutput) => {
            if (inner) {
                actions.changeInnerForm({[name]: date});
            } else {
                actions.changeForm({[name]: date});
            }
        },
        [actions, name, inner],
    );

    return (
        <SimpleDatepicker
            {...controlProps}
            size={size}
            datePlaceholder={placeholder}
            date={value}
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
