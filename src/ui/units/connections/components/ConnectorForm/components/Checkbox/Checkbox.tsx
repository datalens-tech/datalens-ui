import React from 'react';

import type {CheckboxProps} from '@gravity-ui/uikit';
import {Checkbox as CommonCheckbox} from '@gravity-ui/uikit';
import {get} from 'lodash';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {CheckboxItem} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import {changeForm, changeInnerForm} from '../../../../store';

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type CheckboxComponentProps = DispatchState & DispatchProps & Omit<CheckboxItem, 'id'>;

const CheckboxComponent = (props: CheckboxComponentProps) => {
    const {actions, form, innerForm, name, text, inner = false} = props;
    const controlProps = get(props, 'controlProps', {} as Partial<CheckboxProps>);
    const size = get(controlProps, 'size', 'm');
    const formValue = inner ? innerForm[name] : form[name];
    const value = (formValue ?? false) as boolean;

    const updateHandler = React.useCallback(() => {
        if (inner) {
            actions.changeInnerForm({[name]: !value});
        } else {
            actions.changeForm({[name]: !value});
        }
    }, [actions, name, inner, value]);

    return (
        <CommonCheckbox
            {...controlProps}
            size={size}
            content={text}
            checked={value}
            onChange={updateHandler}
        />
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        form: state.connections.form,
        innerForm: state.connections.innerForm,
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

export const Checkbox = connect(mapStateToProps, mapDispatchToProps)(CheckboxComponent);
