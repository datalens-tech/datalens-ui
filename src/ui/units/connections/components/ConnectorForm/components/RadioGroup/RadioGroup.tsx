import React from 'react';

import {CircleExclamation} from '@gravity-ui/icons';
import type {RadioGroupProps} from '@gravity-ui/uikit';
import {RadioGroup as CommonRadioGroup, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {get} from 'lodash';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {RadioGroupItem, RadioGroupItemOption} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import {MarkdownItem} from '../';
import {changeForm, changeInnerForm} from '../../../../store';

import './RadioGroup.scss';

const b = block('conn-form-radio-group');

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type RadioGroupComponentProps = DispatchState & DispatchProps & Omit<RadioGroupItem, 'id'>;

function mapIconNameToIconData(textEndIcon: RadioGroupItemOption['content']['textEndIcon']) {
    switch (textEndIcon?.name) {
        case 'CircleExclamation': {
            return CircleExclamation;
        }
        default: {
            return undefined;
        }
    }
}

const RadioGroupOption = ({content, value}: RadioGroupItemOption) => {
    const {text, textEndIcon, hintText} = content;
    const textEndIconData = mapIconNameToIconData(textEndIcon);
    return (
        <CommonRadioGroup.Option
            key={value}
            content={
                <React.Fragment>
                    <div className={b('text-container')}>
                        <span className={b('text')}>
                            {text}
                            {textEndIconData && (
                                <Icon
                                    className={b('icon', {end: true, view: textEndIcon?.view})}
                                    data={textEndIconData}
                                />
                            )}
                        </span>
                    </div>
                    {hintText && (
                        <div className={b('hint')}>
                            <MarkdownItem text={hintText} />
                        </div>
                    )}
                </React.Fragment>
            }
            value={value}
        />
    );
};

const RadioGroupComponent = (props: RadioGroupComponentProps) => {
    const {actions, form, innerForm, name, options = [], inner = false} = props;
    const controlProps = get(props, 'controlProps', {} as Partial<RadioGroupProps>);
    const direction = get(controlProps, 'direction', 'vertical');
    const size = get(controlProps, 'size', 'm');
    const formValue = inner ? innerForm[name] : form[name];
    const value = (formValue ?? '') as string;

    const updateHandler = React.useCallback(
        (nextValue: string) => {
            if (inner) {
                actions.changeInnerForm({[name]: nextValue});
            } else {
                actions.changeForm({[name]: nextValue});
            }
        },
        [actions, name, inner],
    );

    return (
        <CommonRadioGroup
            {...controlProps}
            direction={direction}
            size={size}
            value={value}
            onUpdate={updateHandler}
        >
            {options.map(RadioGroupOption)}
        </CommonRadioGroup>
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

export const RadioGroup = connect(mapStateToProps, mapDispatchToProps)(RadioGroupComponent);
