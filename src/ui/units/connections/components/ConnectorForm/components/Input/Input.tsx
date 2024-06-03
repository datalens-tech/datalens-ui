import React from 'react';

import {TextArea, TextInput} from '@gravity-ui/uikit';
import {get} from 'lodash';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import {getConnectorFormItemQa} from 'shared';
import type {InputItem, InputItemControlProps} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import {changeForm, changeInnerForm, setValidationErrors} from '../../../../store';
import {getValidationError} from '../../../../utils';
import {withControlWrap} from '../withControlWrap/withControlWrap';

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type InputProps = DispatchState & DispatchProps & Omit<InputItem, 'id'>;

const InputComponent = (props: InputProps) => {
    const {
        actions,
        form,
        innerForm,
        name,
        fakeValue,
        validationErrors,
        placeholder,
        inner = false,
        prepareValue,
    } = props;
    const controlProps = get(props, 'controlProps', {} as InputItemControlProps);
    const size = get(controlProps, 'size', 'm');
    const hasClear = get(controlProps, 'hasClear', true);
    const formValue = inner ? innerForm[name] : form[name];
    const value = (formValue ?? fakeValue ?? '') as string;
    const error = getValidationError(name, validationErrors);
    const qa = controlProps.qa || getConnectorFormItemQa({id: 'input', name});

    const inputHandler = React.useCallback(
        (nextValue: string) => {
            const preparedValue = prepareValue ? prepareValue(nextValue) : nextValue;

            if (inner) {
                actions.changeInnerForm({[name]: preparedValue});
            } else {
                actions.changeForm({[name]: preparedValue});
            }

            if (error) {
                const errors = validationErrors.filter((err) => err.name !== error.name);
                actions.setValidationErrors({errors});
            }
        },
        [actions, name, inner, validationErrors, error, prepareValue],
    );

    if (controlProps?.multiline) {
        return (
            <TextArea
                {...controlProps}
                qa={qa}
                size={size}
                placeholder={placeholder}
                value={value}
                hasClear={hasClear}
                onUpdate={inputHandler}
            />
        );
    }

    return (
        <TextInput
            {...controlProps}
            qa={qa}
            size={size}
            placeholder={placeholder}
            value={value}
            hasClear={hasClear}
            onUpdate={inputHandler}
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
                setValidationErrors,
            },
            dispatch,
        ),
    };
};

export const Input = connect(mapStateToProps, mapDispatchToProps)(withControlWrap(InputComponent));
