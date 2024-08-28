import React from 'react';

import type {SelectOption, SelectProps} from '@gravity-ui/uikit';
import {Button, Select as UiKitSelect} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {get} from 'lodash';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {SelectItem} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import {changeForm, changeInnerForm, setValidationErrors} from '../../../../store';
import {getValidationError} from '../../../../utils';
import {withControlWrap} from '../withControlWrap/withControlWrap';

import './Select.scss';

export const VALUES_DELIMITER = ',';

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type SelectComponentProps = DispatchState & DispatchProps & Omit<SelectItem, 'id'>;

const getPreparedValue = (value = ''): SelectProps['value'] => {
    return value.split(VALUES_DELIMITER).filter(Boolean);
};

const b = block('conn-form-select');

const OPTION_WITH_META_HEIGHT = 48;
const DEFAULT_OPTION_HEIGHT = 28;

const SelectComponent = (props: SelectComponentProps) => {
    const {
        actions,
        form,
        innerForm,
        name,
        validationErrors,
        availableValues = [],
        inner = false,
        loading,
        beforeUpdate,
        prepareValue,
    } = props;
    const disabled = get(props.controlProps, 'disabled');
    const controlProps = get(props, 'controlProps', {} as Partial<SelectProps>);

    const size = get(controlProps, 'size', 'm');
    const formValue = inner ? innerForm[name] : form[name];
    const value = getPreparedValue((formValue ?? '') as string);
    const error = getValidationError(name, validationErrors);

    const selectHandler = React.useCallback(
        (nextValue: string[]) => {
            const resultValue = nextValue.join(VALUES_DELIMITER);
            const preparedValue = prepareValue ? prepareValue(resultValue) : resultValue;

            beforeUpdate?.(nextValue);

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
        [actions, name, inner, validationErrors, error, beforeUpdate, prepareValue],
    );

    const renderLoadingControl = React.useCallback(() => {
        return <Button loading={true} width="max" disabled={true} />;
    }, []);

    const renderOptionWithDescription = React.useCallback((option: SelectOption) => {
        return (
            <div className={b('option', {disabled: option.disabled})}>
                <div>{option.content}</div>
                {option.data?.description && (
                    <div className={b('description')}>{option.data?.description}</div>
                )}
            </div>
        );
    }, []);

    return (
        <UiKitSelect
            {...controlProps}
            width="max"
            size={size}
            disabled={disabled || !availableValues.length}
            options={availableValues}
            value={value}
            onUpdate={selectHandler}
            renderControl={loading ? renderLoadingControl : undefined}
            renderOption={renderOptionWithDescription}
            getOptionHeight={(option) => {
                return option.data?.description ? OPTION_WITH_META_HEIGHT : DEFAULT_OPTION_HEIGHT;
            }}
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

export const Select = connect(
    mapStateToProps,
    mapDispatchToProps,
)(withControlWrap(SelectComponent));
