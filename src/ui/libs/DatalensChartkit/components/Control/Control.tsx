import React from 'react';

import {TriangleExclamationFill} from '@gravity-ui/icons';
import {Icon, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import type {StringParams} from 'shared';
import {isValidRequiredValue} from 'ui/components/DashKit/plugins/Control/utils';
import {DL} from 'ui/constants/common';
import {addOperationForValue, unwrapFromArrayAndSkipOperation} from 'units/dash/modules/helpers';

import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../ChartKit/helpers/constants';
import {wrapToArray} from '../../helpers/helpers';
import {CLICK_ACTION_TYPE, CONTROL_TYPE} from '../../modules/constants/constants';
import type {
    ActiveControl,
    Control as TControl,
    ControlRangeDatepicker as TControlRangeDatepicker,
    ValidatedControl,
} from '../../types';

import {
    ControlButton,
    ControlCheckbox,
    ControlDatepicker,
    ControlInput,
    ControlRangeDatepicker,
    ControlSelect,
    ControlTextArea,
} from './Items/Items';
import type {
    ControlItemProps,
    ControlProps,
    ControlState,
    ControlValue,
    SimpleControlValue,
} from './types';

import './Control.scss';

function isNotSingleParam(control: TControl): control is TControlRangeDatepicker {
    return 'paramFrom' in control && 'paramTo' in control;
}

const STATUS = {
    LOADING: 'loading',
    DONE: 'done',
    ERROR: 'error',
} as const;

const b = block('chartkit-control');

const dashI18n = I18n.keyset('dash.dashkit-plugin-control.view');
const controlI18n = I18n.keyset('chartkit.control');

class Control<TProviderData> extends React.PureComponent<
    ControlProps<TProviderData>,
    ControlState
> {
    static getDerivedStateFromProps(nextProps: ControlProps, prevState: ControlState) {
        const resultState = {
            ...prevState,
            savedData: nextProps.data,
            statePriority: false,
        };

        const propsDataEqual = isEqual(nextProps.data, prevState.savedData);

        if (!prevState.statePriority && !propsDataEqual) {
            return {
                ...resultState,
                data: nextProps.data,
                params: nextProps.data.params,
            };
        }

        return resultState;
    }

    static getDerivedStateFromError() {
        return {status: STATUS.ERROR};
    }

    get params() {
        return {...this.props.data.params, ...this.state.params};
    }

    state: ControlState = {
        status: STATUS.LOADING,
        data: this.props.data,
        savedData: this.props.data,
        params: this.props.data.params,
        statePriority: false,
        validationErrors: {},
    };

    componentDidMount() {
        this.setStatePriority({status: STATUS.DONE});
        if (this.isStandalone) {
            this.props.onLoad();
        }
    }

    get isStandalone() {
        return this.props.data.type === 'control';
    }

    setStatePriority(state: Partial<ControlState>, callback?: () => void) {
        this.setState(Object.assign({statePriority: true}, state as ControlState), callback);
    }

    async run(prevParams: StringParams, callOnChange?: boolean) {
        this.setStatePriority({status: STATUS.LOADING});

        let loadedData: ControlProps['data'] | null;

        try {
            loadedData = await this.props.getControls(prevParams);
        } catch (error) {
            console.error('CHARTKIT_CONTROL_RUN_FAILED', error);

            this.setStatePriority({status: STATUS.ERROR});

            return;
        }

        if (!loadedData) {
            return;
        }

        const newParams = loadedData.params;

        this.setStatePriority(
            {
                status: STATUS.DONE,
                data: loadedData,
                params: newParams,
            },
            () => {
                if (callOnChange) {
                    // for a selector with postUpdateOnChange, forceUpdate is not needed
                    // forceUpdate is also used by the DashKit control plugin in order to prevent loading the control from postUpdateOnChange.
                    // loadedData is only for the DashKit control plugin
                    this.props.onChange(
                        {type: 'PARAMS_CHANGED', data: {params: newParams}},
                        {forceUpdate: !this.isStandalone},
                        callOnChange,
                    );
                }
            },
        );
    }

    async runAction(args: StringParams) {
        if (!this.props.runAction || !this.props.onAction) {
            return;
        }

        const responseData = await this.props.runAction({...this.state.params, ...args});
        this.props.onAction({data: get(responseData, 'data')});
    }

    onChange(control: ActiveControl, value: SimpleControlValue, index: number) {
        const {type, updateControlsOnChange, updateOnChange, postUpdateOnChange} = control;

        const {newParams, callExternalOnChange, callChangeByClick} = this.getChangedParams(
            control,
            value,
        );

        const hasError =
            'required' in control
                ? isValidRequiredValue({
                      required: control.required,
                      value,
                      index: String(index),
                  })
                : false;
        this.setValidationError(String(index), hasError);

        if (hasError) {
            return;
        }

        if (type === 'button' && control.onClick?.action === CLICK_ACTION_TYPE.RUN_ACTION) {
            this.runAction(control.onClick.args);
            return;
        }

        if (!isEqual(newParams, this.params) || type === CONTROL_TYPE.BUTTON) {
            if (postUpdateOnChange) {
                this.run(newParams, true);
            } else if (updateOnChange) {
                // to prevent value selection delay
                // for example, in the list of select values, and when it is displayed as selected
                this.setStatePriority({params: newParams}, () => {
                    // forceUpdate actually makes sense not only for a button
                    // because at the ChartKit level, changing parameters in state is not checked
                    this.props.onChange(
                        {type: 'PARAMS_CHANGED', data: {params: newParams}},
                        {forceUpdate: true},
                        callExternalOnChange,
                        callChangeByClick,
                    );
                });
            } else if (updateControlsOnChange) {
                this.run(newParams);
            } else {
                this.setStatePriority({params: newParams}, () => {
                    this.props.onUpdate?.({type: 'PARAMS_CHANGED', data: {params: newParams}});
                });
            }
        }
    }

    renderControl = (control: TControl, index: number) => {
        if (!control) {
            return null;
        }

        if (control.type === 'line-break') {
            return <br key={index} />;
        }

        const {label, param} = control;

        const notSingleParam = isNotSingleParam(control);
        const value = isNotSingleParam(control)
            ? {
                  from: unwrapFromArrayAndSkipOperation(this.params[control.paramFrom]),
                  to: unwrapFromArrayAndSkipOperation(this.params[control.paramTo]),
              }
            : unwrapFromArrayAndSkipOperation(this.params[param]);

        let props: ControlItemProps = {
            ...control,
            className: b('item'),
            key: index + (param || (isNotSingleParam(control) && control.paramFrom) || label),
            value,
            onChange: (value: SimpleControlValue) => this.onChange(control, value, index),
        };

        if ('required' in control) {
            props = {...props, ...this.getValidationProps(control, value, index)};
        }

        switch (control.type) {
            case CONTROL_TYPE.SELECT:
                return <ControlSelect {...props} />;
            case CONTROL_TYPE.INPUT:
                return <ControlInput {...props} />;
            case CONTROL_TYPE.TEXTAREA:
                return <ControlTextArea {...props} className={b('item', {button: true})} />;
            case CONTROL_TYPE.DATEPICKER:
                return <ControlDatepicker {...props} />;
            case CONTROL_TYPE.RANGE_DATEPICKER:
                return <ControlRangeDatepicker returnInterval={!notSingleParam} {...props} />;
            case CONTROL_TYPE.CHECKBOX:
                return <ControlCheckbox {...props} className={b('item', {checkbox: true})} />;
            case CONTROL_TYPE.BUTTON:
                return <ControlButton {...props} className={b('item', {button: true})} />;
        }

        return null;
    };

    renderBody() {
        const {status} = this.state;

        if (status === STATUS.ERROR) {
            return (
                <div className={b('error')}>
                    {controlI18n('label_error')}
                    <Icon data={TriangleExclamationFill} className={b('error-icon')} />
                </div>
            );
        }

        return (
            <div className={b('controls', {hidden: status === STATUS.LOADING})}>
                {this.state.data.controls?.controls.map(this.renderControl)}
            </div>
        );
    }

    renderLoader() {
        return this.state.status === STATUS.LOADING ? (
            <div className={b('loader')}>
                <Loader size="s" />
            </div>
        ) : null;
    }

    render() {
        if (this.state.data.controls) {
            const {lineBreaks = 'nowrap'} = this.state.data.controls;

            const standalone = this.isStandalone;

            const classNameMix = standalone ? CHARTKIT_SCROLLABLE_NODE_CLASSNAME : '';

            return (
                <div
                    className={b(
                        {'line-breaks': lineBreaks, standalone, mobile: DL.IS_MOBILE},
                        classNameMix,
                    )}
                >
                    {this.renderLoader()}
                    {this.renderBody()}
                </div>
            );
        }

        return null;
    }

    private getChangedParams = (
        control: ActiveControl,
        value: string | string[] | {from: string; to: string},
    ) => {
        let newParams = {...this.params};
        let callExternalOnChange = this.isStandalone;
        let callChangeByClick = false;

        // checks for type, to disable possible use in other controls
        if (
            control.type === 'range-datepicker' &&
            control.paramFrom &&
            control.paramTo &&
            typeof value === 'object' &&
            !Array.isArray(value)
        ) {
            newParams[control.paramFrom] = [value.from];
            newParams[control.paramTo] = [value.to];
        } else if (
            control.type === 'button' &&
            control.onClick &&
            control.onClick.action === CLICK_ACTION_TYPE.SET_PARAMS &&
            control.onClick.args
        ) {
            newParams = control.onClick.args;
            callExternalOnChange = true;
            callChangeByClick = true;
        } else if (
            control.type === 'button' &&
            control.onClick &&
            control.onClick.action === CLICK_ACTION_TYPE.SET_INITIAL_PARAMS &&
            this.props.initialParams?.params
        ) {
            newParams = this.props.initialParams?.params;
            callExternalOnChange = true;
            callChangeByClick = true;
        } else {
            newParams[control.param] = wrapToArray(value as string).map(
                (value: string) =>
                    addOperationForValue({value, operation: control.operation}) as string,
            );
        }

        return {newParams, callExternalOnChange, callChangeByClick};
    };

    private getValidationProps = (
        control: ValidatedControl,
        value: ControlValue,
        index: number,
    ) => {
        const validationProps: {
            required?: boolean;
            hasValidationError?: boolean;
            placeholder?: string;
            label?: string;
            innerLabel?: string;
        } = {};

        // for first initialization of control
        const initialValidationError = isValidRequiredValue({
            required: control.required,
            value,
        })
            ? dashI18n('value_required')
            : null;
        const validationError = initialValidationError || this.state.validationErrors[index];

        validationProps.required = control.required;
        validationProps.hasValidationError = Boolean(validationError);

        if (control.label && control.required) {
            validationProps.label = `${control.label}*`;
        }
        // if only innerLabel is visible in required selector we add '*' to it
        if ('innerLabel' in control && !control.label && control.innerLabel && control.required) {
            validationProps.innerLabel = `${control.innerLabel}*`;
        }

        if (control.type === 'input' || control.type === 'select') {
            validationProps.placeholder = validationError || control.placeholder;
        }

        return validationProps;
    };

    private setValidationError(index: string, hasError?: boolean) {
        if (hasError) {
            this.setState({
                validationErrors: {
                    ...this.state.validationErrors,
                    [index]: dashI18n('value_required'),
                },
            });
            return;
        }

        if (this.state.validationErrors[index]) {
            this.setState({
                validationErrors: {
                    ...this.state.validationErrors,
                    [index]: null,
                },
            });
        }
    }
}

export default Control;
