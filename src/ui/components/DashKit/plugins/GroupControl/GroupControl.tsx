import React from 'react';

import {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DatalensGlobalState, Utils} from 'index';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import {connect} from 'react-redux';
import {
    DashTabItemControlDataset,
    DashTabItemControlManual,
    DashTabItemControlSingle,
    DashTabItemGroupControlData,
    Feature,
    StringParams,
} from 'shared';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from 'ui/libs/DatalensChartkit/ChartKit/helpers/constants';
import {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {ControlButton} from 'ui/libs/DatalensChartkit/components/Control/Items/Items';
import {
    CLICK_ACTION_TYPE,
    CONTROL_TYPE,
} from 'ui/libs/DatalensChartkit/modules/constants/constants';
import type {ChartsChartKit} from 'ui/libs/DatalensChartkit/types/charts';
import {isMobileView} from 'ui/utils/mobile';

import {selectSkipReload} from '../../../../units/dash/store/selectors/dashTypedSelectors';
import {adjustWidgetLayout} from '../../utils';
import {Error} from '../Control/Error/Error';
import {LOAD_STATUS} from '../Control/constants';
import {ControlSettings, GetDistincts, LoadStatus} from '../Control/types';
import DebugInfoTool from '../DebugInfoTool/DebugInfoTool';

import {Control} from './Control/Control';

import './GroupControl.scss';

const GROUP_CONTROL_LAYOUT_DEBOUNCE_TIME = 20;

type StateProps = ReturnType<typeof mapStateToProps>;

interface PluginGroupControlProps extends PluginWidgetProps, ControlSettings, StateProps {}

interface PluginGroupControlState {
    status: LoadStatus;
    silentLoading: boolean;
    initialParams?: StringParams;
    isInit: boolean;
    stateParams: StringParams;
    needReload: boolean;
    forceUpdate: boolean;
}

export interface PluginGroupControl extends Plugin<PluginGroupControlProps> {
    setSettings: (settings: ControlSettings) => Plugin;
    getDistincts?: GetDistincts;
}

const b = block('dashkit-plugin-group-control');

class GroupControl extends React.PureComponent<PluginGroupControlProps, PluginGroupControlState> {
    chartKitRef: React.RefObject<ChartsChartKit> = React.createRef<ChartsChartKit>();
    rootNode: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

    _isUnmounted = false;
    _cancelSource: any = null;

    adjustWidgetLayout = debounce(this.setAdjustWidgetLayout, GROUP_CONTROL_LAYOUT_DEBOUNCE_TIME);

    resolve: ((value: unknown) => void) | null = null;

    controlsCount = 0;
    controlsLoadedCount = 0;
    controlsStatus: Record<string, LoadStatus> = {};

    /**
     * can't use it in state because of doubling requests
     */
    initialParams: ChartInitialParams = {
        params: {} as StringParams,
    };

    constructor(props: PluginGroupControlProps) {
        super(props);
        const {data} = this.props;
        const controlData = data as unknown as DashTabItemGroupControlData;

        this.controlsCount = controlData.items.length;
        controlData.items.forEach((item) => {
            this.controlsStatus[item.id] = LOAD_STATUS.INITIAL;
        });

        this.state = {
            status: LOAD_STATUS.PENDING,
            silentLoading: false,
            isInit: false,
            stateParams: {},
            needReload: false,
            forceUpdate: true,
        };
    }

    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prevProps: Readonly<PluginGroupControlProps>) {
        if (this.rootNode.current) {
            if (this.props.data.autoHeight) {
                // if the "Auto-height" flag is set
                this.adjustWidgetLayout(false);
            } else if (prevProps.data.autoHeight) {
                // if the "Auto-height" flag was set and then removed
                this.adjustWidgetLayout(true);
            }
        }
        const hasDataChanged = !isEqual(this.props.data, prevProps.data);
        const hasParamsChanged = !isEqual(this.props.params, prevProps.params);
        const hasParamsUpdatedFromState = isEqual(this.props.params, this.state.stateParams);

        const hasDefaultsChanged = !isEqual(this.props.defaults, prevProps.defaults);

        if (hasDefaultsChanged) {
            this.initialParams = {
                params: {...this.initialParams.params, ...this.props.defaults},
            } as ChartInitialParams;
        }

        const hasChanged = hasDataChanged || hasParamsChanged || hasDefaultsChanged;

        if (hasParamsChanged && !hasParamsUpdatedFromState) {
            // in case of change defaults of controls we find the different fields in actual params
            // and update stateParams with them
            const paramsDiff: StringParams = {};
            Object.keys(this.props.params).forEach((param) => {
                if (this.props.params[param] !== prevProps.params[param]) {
                    paramsDiff[param] = this.props.params[param];
                }
            });

            this.setState({stateParams: {...this.state.stateParams, ...paramsDiff}});
        }

        if (this.state.forceUpdate && hasChanged) {
            this.setState({
                status: LOAD_STATUS.PENDING,
                needReload: true,
                silentLoading: true,
            });
            this.init();
        }
    }

    componentWillUnmount() {
        this._isUnmounted = true;
    }

    render() {
        const {data} = this.props;
        const controlData = data as unknown as DashTabItemGroupControlData;

        const paramIdDebug = controlData.items
            .filter((item) => 'source' in item)
            .map(
                ({source}) =>
                    (source as DashTabItemControlDataset['source']).datasetFieldId ||
                    (source as DashTabItemControlManual['source']).fieldName ||
                    data.param ||
                    '',
            )
            .join(', ');

        const isLoading = this.state.status === LOAD_STATUS.PENDING && !this.state.silentLoading;

        return (
            <div ref={this.rootNode} className={b({mobile: isMobileView})}>
                <div className={b('container', CHARTKIT_SCROLLABLE_NODE_CLASSNAME)}>
                    <DebugInfoTool label={'paramId'} value={paramIdDebug} modType={'corner'} />
                    {isLoading && (
                        <div className={b('loader')}>
                            <Loader size="s" />
                        </div>
                    )}
                    {Utils.isEnabledFeature(Feature.GroupControls)
                        ? this.renderControls()
                        : this.renderError()}
                </div>
            </div>
        );
    }

    private onChange = (params: StringParams, callChangeByClick?: boolean) => {
        const controlData = this.props.data as unknown as DashTabItemGroupControlData;
        if (!controlData.buttonApply || callChangeByClick) {
            this.props.onStateAndParamsChange({params});
        }
        this.setState({stateParams: params});
    };

    private filterSignificantParams(loadedData?: any) {
        const params = loadedData.usedParams;

        if (!params) {
            return {};
        }

        // @ts-ignore
        const dependentSelectors = this.props.settings.dependentSelectors;

        if (loadedData && loadedData.usedParams && dependentSelectors) {
            return pick(params, Object.keys(loadedData.usedParams));
        }

        return dependentSelectors ? params : pick(params, Object.keys(this.props.defaults!));
    }

    private resolveMeta = (loadedData?: any) => {
        // @ts-ignore
        if (this.resolve) {
            let result: any = {id: this.props.id};

            if (loadedData && loadedData.extra) {
                result = {
                    id: this.props.id,
                    usedParams: loadedData.usedParams
                        ? Object.keys(this.filterSignificantParams(loadedData.usedParams))
                        : null,
                    datasets: loadedData.extra.datasets,
                    // deprecated
                    datasetId: loadedData.extra.datasetId,
                    datasetFields: loadedData.extra.datasetFields,
                    type: 'control',
                    sourceType: this.props.data?.sourceType,
                };
            }

            // @ts-ignore
            this.resolve(result);
        }
    };

    private handleInitialParamsUpdate = (updatedInitialParams: ChartInitialParams) => {
        this.initialParams = updatedInitialParams;
    };

    private handleStatusChanged = (controlId: string, status: LoadStatus) => {
        const isLoaded = status === LOAD_STATUS.SUCCESS || status === LOAD_STATUS.ERROR;
        const isBeginPending =
            this.controlsStatus[controlId] !== LOAD_STATUS.INITIAL &&
            status === LOAD_STATUS.PENDING;

        if (isLoaded) {
            this.controlsLoadedCount++;
        }

        if (isBeginPending) {
            this.controlsLoadedCount--;
        }

        const isGroupLoaded = this.controlsLoadedCount === this.controlsCount;

        if (isGroupLoaded) {
            if (this.props.data.autoHeight) {
                this.adjustWidgetLayout(false);
            }

            const newState = {
                needReload: this.state.needReload ? false : this.state.needReload,
                status: LOAD_STATUS.SUCCESS,
                silentLoading: false,
            };

            this.setState(newState);
        }

        this.controlsStatus[controlId] = status;
    };

    private renderControl(item: DashTabItemControlSingle) {
        const {getDistincts, defaults} = this.props;
        const {silentLoading} = this.state;

        return (
            <Control
                key={item.id}
                id={item.id}
                data={item}
                initialParams={this.initialParams}
                actualParams={this.state.stateParams}
                onStatusChanged={this.handleStatusChanged}
                silentLoading={silentLoading}
                resolveMeta={this.resolveMeta}
                defaults={defaults}
                getDistincts={getDistincts}
                onChange={this.onChange}
                needReload={this.state.needReload}
                onInitialParamsUpdate={this.handleInitialParamsUpdate}
                cancelSource={this._cancelSource}
            />
        );
    }

    private applyButtonAction(action: string) {
        let newParams = {};

        if (action === CLICK_ACTION_TYPE.SET_PARAMS) {
            newParams = this.state.stateParams;
        }
        if (action === CLICK_ACTION_TYPE.SET_INITIAL_PARAMS) {
            newParams = this.initialParams?.params;
        }

        if (!isEqual(newParams, this.actualParams) || !isEqual(newParams, this.state.stateParams)) {
            this.onChange(newParams, true);
        }
    }

    private handleApplyChange = () => {
        this.applyButtonAction(CLICK_ACTION_TYPE.SET_PARAMS);
    };

    private handleResetChange = () => {
        this.applyButtonAction(CLICK_ACTION_TYPE.SET_INITIAL_PARAMS);
    };

    private renderButtons() {
        const {data} = this.props;
        const controlData = data as unknown as DashTabItemGroupControlData;

        const resetAction = {action: CLICK_ACTION_TYPE.SET_INITIAL_PARAMS};

        return (
            <React.Fragment>
                {controlData.buttonApply && (
                    <ControlButton
                        type={CONTROL_TYPE.BUTTON}
                        label={'APPLY'}
                        updateOnChange={true}
                        theme="action"
                        className={b('item')}
                        onChange={this.handleApplyChange}
                    />
                )}
                {controlData.buttonReset && (
                    <ControlButton
                        type={CONTROL_TYPE.BUTTON}
                        className={b('item')}
                        label={'RESET'}
                        onClick={resetAction}
                        onChange={this.handleResetChange}
                    />
                )}
            </React.Fragment>
        );
    }

    private renderControls() {
        const {data} = this.props;
        const controlData = data as unknown as DashTabItemGroupControlData;

        return (
            <div>
                {controlData.items.map((item: DashTabItemControlSingle) =>
                    this.renderControl(item),
                )}
                {this.renderButtons()}
            </div>
        );
    }

    private renderError() {
        return (
            <div className={b('error')}>
                <Error />
                <div>Render not implemented</div>
            </div>
        );
    }

    // @ts-ignore
    // need for autoreload from dashkit
    private reload({silentLoading}: {silentLoading?: boolean}) {
        if (this.props.skipReload || !this.state.isInit) {
            return;
        }
        this.setState({needReload: true, silentLoading: Boolean(silentLoading)});
    }

    get actualParams(): StringParams {
        return this.props.params;
    }

    private async init() {
        if (this._isUnmounted) {
            return;
        }

        if (this.state.isInit === false) {
            this.setState({
                isInit: true,
                initialParams: this.props.defaults,
                stateParams: this.actualParams,
                status: LOAD_STATUS.PENDING,
            });
        }
    }

    private setAdjustWidgetLayout(needSetDefault: boolean) {
        adjustWidgetLayout({
            widgetId: this.props.id,
            needSetDefault,
            rootNode: this.rootNode,
            gridLayout: this.props.gridLayout,
            layout: this.props.layout,
            cb: this.props.adjustWidgetLayout,
        });
    }
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    skipReload: selectSkipReload(state),
});

const GroupControlWithStore = connect(mapStateToProps, null, null, {
    forwardRef: true,
})(GroupControl);

const plugin: PluginGroupControl = {
    type: 'group_control',
    defaultLayout: {w: 8, h: 2},
    setSettings(settings: ControlSettings) {
        const {getDistincts} = settings;

        // TODO: remove this. use basic ChartKit abilities
        plugin.getDistincts = getDistincts;

        return plugin;
    },
    renderer(props: PluginWidgetProps, forwardedRef) {
        return (
            <GroupControlWithStore
                {...props}
                getDistincts={plugin.getDistincts}
                ref={forwardedRef}
            />
        );
    },
};

export default plugin;
