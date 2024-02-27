import React from 'react';

import {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DatalensGlobalState, Utils} from 'index';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import {connect} from 'react-redux';
import {DashTabItemControlSingle, DashTabItemGroupControlData, Feature, StringParams} from 'shared';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from 'ui/libs/DatalensChartkit/ChartKit/helpers/constants';
import {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {ControlButton} from 'ui/libs/DatalensChartkit/components/Control/Items/Items';
import {
    CLICK_ACTION_TYPE,
    CONTROL_TYPE,
} from 'ui/libs/DatalensChartkit/modules/constants/constants';
import {ActiveControl} from 'ui/libs/DatalensChartkit/types';
import {isMobileView} from 'ui/utils/mobile';

import {
    selectIsNewRelations,
    selectSkipReload,
} from '../../../../units/dash/store/selectors/dashTypedSelectors';
import {adjustWidgetLayout} from '../../utils';
import {LOAD_STATUS} from '../Control/constants';
import {ControlSettings, GetDistincts, LoadStatus} from '../Control/types';
import DebugInfoTool from '../DebugInfoTool/DebugInfoTool';

import {Control} from './Control/Control';
import {
    ContextProps,
    ExtendedLoadedData,
    PluginGroupControlState,
    ResolveMetaResult,
} from './types';

import './GroupControl.scss';

const GROUP_CONTROL_LAYOUT_DEBOUNCE_TIME = 20;

type StateProps = ReturnType<typeof mapStateToProps>;

interface PluginGroupControlProps
    extends PluginWidgetProps,
        ControlSettings,
        StateProps,
        ContextProps {}

interface PluginGroupControl extends Plugin<PluginGroupControlProps> {
    setSettings: (settings: ControlSettings) => Plugin;
    getDistincts?: GetDistincts;
}

const b = block('dashkit-plugin-group-control');
const i18n = I18n.keyset('dash.dashkit-plugin-control.view');

class GroupControl extends React.PureComponent<PluginGroupControlProps, PluginGroupControlState> {
    rootNode: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

    _isUnmounted = false;
    _cancelSource: any = null;

    adjustWidgetLayout = debounce(this.setAdjustWidgetLayout, GROUP_CONTROL_LAYOUT_DEBOUNCE_TIME);

    resolve: ((value: unknown) => void) | null = null;

    controlsLoadedCount = 0;
    controlsProgressCount = 0;
    controlsStatus: Record<string, LoadStatus> = {};
    controlsData: Record<string, ExtendedLoadedData | null> = {};

    // a quick loader for click on apply button
    applyLoader = false;

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

        this.controlsProgressCount = controlData?.group?.length || 0;
        controlData.group?.forEach((item) => {
            this.controlsStatus[item.id] = LOAD_STATUS.INITIAL;
        });

        this.state = {
            status: LOAD_STATUS.INITIAL,
            silentLoading: false,
            isInit: false,
            stateParams: {},
            needReload: false,
            needMeta: false,
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

        const hasChanged = hasDataChanged || hasParamsChanged;

        // need to check unused ids
        if (
            hasDataChanged &&
            this.props.data.group &&
            prevProps.data.group &&
            this.props.data.group?.length < prevProps.data.group?.length
        ) {
            this.props.onStateAndParamsChange({}, {action: 'removeGroupItems'});
        }

        // if (!hasParamsUpdatedFromState) {
        //     this.setState({
        //         stateParams: this.props.params as unknown as Record<string, StringParams>,
        //     });
        // }

        if (this.state.forceUpdate && hasChanged) {
            this.setState({
                status: LOAD_STATUS.PENDING,
                needReload: true,
                silentLoading: true,
            });
        }
    }

    componentWillUnmount() {
        this._isUnmounted = true;
    }

    render() {
        const isLoading =
            (this.state.status === LOAD_STATUS.PENDING && !this.state.silentLoading) ||
            this.applyLoader;

        return (
            <div ref={this.rootNode} className={b({mobile: isMobileView})}>
                <div className={b('container', CHARTKIT_SCROLLABLE_NODE_CLASSNAME)}>
                    <DebugInfoTool
                        label="widgetId"
                        value={this.props.id}
                        modType="bottom-right-corner"
                    />
                    {isLoading && (
                        <div className={b('loader', {silent: this.applyLoader})}>
                            <Loader size="s" />
                        </div>
                    )}
                    {this.renderControls()}
                </div>
            </div>
        );
    }

    private onChange = ({
        params,
        callChangeByClick,
        controlId,
    }: {
        params: StringParams | Record<string, StringParams>;
        callChangeByClick?: boolean;
        controlId?: string;
    }) => {
        const controlData = this.props.data as unknown as DashTabItemGroupControlData;

        if (!controlData.buttonApply || callChangeByClick) {
            this.props.onStateAndParamsChange({params}, {groupItemId: controlId});
        }

        if (controlId) {
            this.setState({
                stateParams: {...this.state.stateParams, [controlId]: params as StringParams},
            });
            return;
        }
        this.setState({stateParams: params as Record<string, StringParams>});
    };

    private filterSignificantParams(params: StringParams) {
        if (!params) {
            return {};
        }

        if (this.controlsProgressCount) {
            return pick(params, Object.keys(this.props.defaults!));
        }

        const usedParams = Object.values(this.controlsData).reduce((params, data) => {
            return {...params, ...(data?.usedParams || {})};
        }, {});

        return pick(params, Object.keys(usedParams));
    }

    // public
    // @ts-ignore
    private getMeta() {
        this.setState({needMeta: true});

        return new Promise((resolve) => {
            this.resolve = resolve;

            if (this.state.status === LOAD_STATUS.SUCCESS) {
                this.resolveMetaInControl(Object.values(this.controlsData));
            }
        });
    }

    private getCurrentWidgetResolvedMetaInfo = (loadedData: ExtendedLoadedData | null) => {
        let label = '';
        if (loadedData?.uiScheme && 'controls' in loadedData.uiScheme) {
            const controls = loadedData.uiScheme.controls as ActiveControl[];
            label = controls[0].label;
        }

        const widgetMetaInfo = {
            layoutId: this.props.id,
            widgetId: this.props.id,
            title: label,
            label,
            params: loadedData?.params,
            defaultParams: loadedData?.defaultParams,
            loaded: Boolean(loadedData),
            itemId: loadedData?.id,
            usedParams: loadedData?.usedParams
                ? Object.keys(this.filterSignificantParams(loadedData.usedParams))
                : null,
            datasets: loadedData?.extra?.datasets || null,
            datasetId: loadedData?.sources?.fields?.datasetId || '',
            type: 'control',
            sourceType: loadedData?.sourceType,
            loadError: !loadedData,
        };

        return widgetMetaInfo;
    };

    private resolveMeta = (loadedData: ExtendedLoadedData | null) => {
        if (!loadedData) {
            return null;
        }

        const {id, extra, usedParams, sourceType} = loadedData;
        let result: ResolveMetaResult = {id};
        if (extra) {
            result = {
                id,
                usedParams: usedParams
                    ? Object.keys(this.filterSignificantParams(usedParams))
                    : null,
                datasets: extra.datasets,
                // deprecated
                datasetId: extra.datasetId,
                datasetFields: extra.datasetFields,
                type: 'control',
                sourceType,
            };
        }

        return result;
    };

    private resolveMetaInControl = (loadedData: (ExtendedLoadedData | null)[]) => {
        if (!this.resolve) {
            return;
        }

        const result = loadedData.reduce(
            (
                acc: (
                    | ReturnType<typeof this.getCurrentWidgetResolvedMetaInfo>
                    | ResolveMetaResult
                    | null
                )[],
                dataItem,
            ) => {
                if (Utils.isEnabledFeature(Feature.ShowNewRelations) && this.props.isNewRelations) {
                    acc.push(this.getCurrentWidgetResolvedMetaInfo(dataItem));
                } else {
                    acc.push(this.resolveMeta(dataItem));
                }
                return acc;
            },
            [],
        );

        this.resolve(result);
    };

    private handleStatusChanged = (
        controlId: string,
        status: LoadStatus,
        loadedData?: ExtendedLoadedData | null,
    ) => {
        if (this._isUnmounted) {
            return;
        }

        if (status === LOAD_STATUS.DESTROYED) {
            delete this.controlsData[controlId];
            delete this.controlsStatus[controlId];

            if (
                this.controlsStatus[controlId] === LOAD_STATUS.PENDING ||
                this.controlsStatus[controlId] === LOAD_STATUS.INITIAL
            ) {
                this.controlsProgressCount--;
                return;
            }

            this.controlsLoadedCount--;
            return;
        }

        const isLoaded = status === LOAD_STATUS.SUCCESS || status === LOAD_STATUS.ERROR;
        // for adding new control to existing group control
        const isInitialPending = !this.controlsStatus[controlId] && status === LOAD_STATUS.PENDING;
        const isReloadPending =
            this.controlsStatus[controlId] !== LOAD_STATUS.INITIAL &&
            status === LOAD_STATUS.PENDING;

        if (isLoaded) {
            this.controlsLoadedCount++;
            this.controlsProgressCount--;
            if (loadedData) {
                this.controlsData[controlId] = loadedData;
            }
        } else if (isInitialPending) {
            this.controlsProgressCount++;
        } else if (isReloadPending) {
            this.controlsLoadedCount--;
            this.controlsProgressCount++;
        }

        if (!this.controlsProgressCount) {
            // adjust widget layout only for the first loading of widget
            if (this.props.data.autoHeight && !this.state.isInit) {
                this.adjustWidgetLayout(false);
            }

            this.resolveMetaInControl(Object.values(this.controlsData));

            this.setState({
                needReload: false,
                status: LOAD_STATUS.SUCCESS,
                silentLoading: false,
                isInit: true,
                stateParams: this.props.params as Record<string, StringParams>,
            });
        }

        this.controlsStatus[controlId] = status;
    };

    private renderControl(item: DashTabItemControlSingle) {
        const {getDistincts, workbookId} = this.props;
        const {silentLoading} = this.state;

        const loadedData = this.controlsData[item.id];
        const usedParams = loadedData?.usedParams || item.defaults || {};
        const significantParams = pick(this.state.stateParams[item.id], Object.keys(usedParams));

        return (
            <Control
                key={item.id}
                id={item.id}
                data={item}
                params={significantParams}
                onStatusChanged={this.handleStatusChanged}
                silentLoading={silentLoading}
                getDistincts={getDistincts}
                onChange={this.onChange}
                needReload={this.state.needReload}
                cancelSource={this._cancelSource}
                workbookId={workbookId}
            />
        );
    }

    private applyButtonAction(action: string) {
        let newParams = {};
        let callChangeByClick = true;

        switch (action) {
            case CLICK_ACTION_TYPE.SET_PARAMS:
                newParams = this.state.stateParams;
                break;
            case CLICK_ACTION_TYPE.SET_INITIAL_PARAMS:
                if (this.props.data.group) {
                    newParams = this.props.data.group.reduce(
                        (initialParams: Record<string, StringParams>, data) => {
                            initialParams[data.id] = data.defaults || {};
                            return initialParams;
                        },
                        {},
                    );
                }

                // if apply button is enabled, we apply new params only via click on 'Apply'
                if (this.props.data.buttonApply) {
                    callChangeByClick = false;
                }
                break;
        }

        if (!isEqual(newParams, this.props.params) || !isEqual(newParams, this.state.stateParams)) {
            if (action === CLICK_ACTION_TYPE.SET_PARAMS) {
                this.applyLoader = true;
                setTimeout(() => {
                    this.applyLoader = false;
                });
            }
            this.onChange({params: newParams, callChangeByClick});
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
                        label={i18n('button_apply')}
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
                        label={i18n('button_reset')}
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
            <div className={b('controls')}>
                {controlData.group?.map((item: DashTabItemControlSingle) =>
                    this.renderControl(item),
                )}
                {this.renderButtons()}
            </div>
        );
    }

    // @ts-ignore
    // need for autoreload from dashkit
    private reload({silentLoading}: {silentLoading?: boolean}) {
        if (this.props.skipReload || !this.state.isInit || this._isUnmounted) {
            return;
        }

        this.setState({
            needReload: true,
            status: LOAD_STATUS.PENDING,
            silentLoading: Boolean(silentLoading),
        });
    }

    private async init() {
        if (this._isUnmounted) {
            return;
        }

        this.setState({
            stateParams: this.props.params as unknown as Record<string, StringParams>,
            status: LOAD_STATUS.PENDING,
        });
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
    isNewRelations: selectIsNewRelations(state),
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
        const workbookId = props.context.workbookId;

        return (
            <GroupControlWithStore
                {...props}
                getDistincts={plugin.getDistincts}
                workbookId={workbookId}
                ref={forwardedRef}
            />
        );
    },
};

export default plugin;
