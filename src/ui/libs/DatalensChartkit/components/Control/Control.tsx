import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import isEqual from 'lodash/isEqual';
import {StringParams} from 'shared';
import {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {isMobileView} from 'ui/utils/mobile';
import {addOperationForValue, unwrapFromArrayAndSkipOperation} from 'units/dash/modules/helpers';

import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../ChartKit/helpers/constants';
import {i18n} from '../../ChartKit/modules/i18n/i18n';
import {wrapToArray} from '../../helpers/helpers';
import {CLICK_ACTION_TYPE, CONTROL_TYPE} from '../../modules/constants/constants';
import {
    ActiveControl,
    ControlsOnlyWidget,
    OnChangeData,
    OnLoadData,
    Control as TControl,
    ControlRangeDatepicker as TControlRangeDatepicker,
    WidgetProps,
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

import './Control.scss';

type ControlProps<TProviderData = unknown> = {
    data: ControlsOnlyWidget & TProviderData;
    getControls: (params: StringParams) => Promise<(ControlsOnlyWidget & TProviderData) | null>;
    onLoad: (data?: OnLoadData) => void;
    onChange: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    initialParams?: ChartInitialParams;
} & Omit<WidgetProps, 'data'>;

interface ControlState {
    status: 'loading' | 'done' | 'error';
    data: ControlProps['data'];
    // TODO: think about to move logic to componentDidUpdate
    // TODO: think about to move logic to ChartKit by calling onChange in onLoad, and not immediately
    savedData: ControlProps['data'];
    params: StringParams;
    statePriority: boolean;
}

function isNotSingleParam(control: TControl): control is TControlRangeDatepicker {
    return 'paramFrom' in control && 'paramTo' in control;
}

const STATUS = {
    LOADING: 'loading',
    DONE: 'done',
    ERROR: 'error',
} as const;

const b = block('chartkit-control');

class Control<TProviderData> extends React.PureComponent<
    ControlProps<TProviderData>,
    ControlState
> {
    // TODO: static propTypes = {};

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

    onChange(control: ActiveControl, value: string | string[] | {from: string; to: string}) {
        let newParams = {...this.params};
        let callExternalOnChange = this.isStandalone;
        let callChangeByClick = false;
        const {type, param, updateControlsOnChange, updateOnChange, postUpdateOnChange, operation} =
            control;

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
            newParams[param] = wrapToArray(value as string).map(
                (value: string) => addOperationForValue({value, operation}) as string,
            );
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
                this.setStatePriority({params: newParams});
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

        const props = {
            ...control,
            className: b('item'),
            key: index + (param || (isNotSingleParam(control) && control.paramFrom) || label),
            value: isNotSingleParam(control)
                ? {
                      from: unwrapFromArrayAndSkipOperation(this.params[control.paramFrom]),
                      to: unwrapFromArrayAndSkipOperation(this.params[control.paramTo]),
                  }
                : unwrapFromArrayAndSkipOperation(this.params[param]),
            onChange: (value: string | string[] | {from: string; to: string}) =>
                this.onChange(control, value),
        };

        switch (control.type) {
            case CONTROL_TYPE.SELECT:
                return <ControlSelect {...props} />;
            case CONTROL_TYPE.INPUT:
                return <ControlInput {...props} />;
            case CONTROL_TYPE.TEXTAREA:
                return <ControlTextArea {...props} />;
            case CONTROL_TYPE.DATEPICKER:
                return <ControlDatepicker {...props} />;
            case CONTROL_TYPE.RANGE_DATEPICKER:
                return <ControlRangeDatepicker returnInterval={!notSingleParam} {...props} />;
            case CONTROL_TYPE.CHECKBOX:
                return <ControlCheckbox {...props} />;
            case CONTROL_TYPE.BUTTON:
                return <ControlButton {...props} />;
        }

        return null;
    };

    renderBody() {
        const {status} = this.state;

        if (status === STATUS.ERROR) {
            return <div className={b('error')}>{i18n('charkit', 'label-control-error')}</div>;
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
                        {'line-breaks': lineBreaks, standalone, mobile: isMobileView},
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
}

export default Control;
