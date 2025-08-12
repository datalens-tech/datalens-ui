import React from 'react';

import type {SegmentedRadioGroupProps as RadioButtonProps} from '@gravity-ui/uikit';
import {SegmentedRadioGroup as CommonRadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {get} from 'lodash';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {RadioButtonItem, RadioButtonItemOption} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import {changeForm, changeInnerForm} from '../../../../store';
import {withControlWrap} from '../withControlWrap/withControlWrap';

import './RadioButton.scss';

const b = block('conn-form-radio-button');

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type RadioButtonComponentProps = DispatchState & DispatchProps & Omit<RadioButtonItem, 'id'>;

const RadioButtonOption = ({value, text}: RadioButtonItemOption) => {
    return <CommonRadioButton.Option key={value} content={text} value={value} />;
};

const RadioButtonComponent = (props: RadioButtonComponentProps) => {
    const {actions, form, innerForm, name, options = [], inner = false, beforeUpdate} = props;
    const controlProps = get(props, 'controlProps', {} as Partial<RadioButtonProps>);
    const size = get(controlProps, 'size', 'm');
    const formValue = inner ? innerForm[name] : form[name];
    const value = (formValue ?? '') as string;

    const updateHandler = React.useCallback(
        (nextValue: string) => {
            beforeUpdate?.(nextValue);

            if (inner) {
                actions.changeInnerForm({[name]: nextValue});
            } else {
                actions.changeForm({[name]: nextValue});
            }
        },
        [actions, name, inner, beforeUpdate],
    );

    return (
        <CommonRadioButton
            {...controlProps}
            className={b({[`size-${size}`]: true})}
            size={size}
            value={value}
            onUpdate={updateHandler}
        >
            {options.map(RadioButtonOption)}
        </CommonRadioButton>
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

export const RadioButton = connect(
    mapStateToProps,
    mapDispatchToProps,
)(withControlWrap(RadioButtonComponent));
