import React from 'react';

import {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DatalensGlobalState} from 'index';
import debounce from 'lodash/debounce';
import {ResolveThunks, connect} from 'react-redux';
import {
    DashTabItemControlDataset,
    DashTabItemControlExternal,
    DashTabItemControlManual,
    ServerFilter,
    StringParams,
} from 'shared';
import {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import type {ChartsChartKit} from 'ui/libs/DatalensChartkit/types/charts';
import {isMobileView} from 'ui/utils/mobile';

import {ResponseSuccessControls} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import logger from '../../../../libs/logger';
import {selectSkipReload} from '../../../../units/dash/store/selectors/dashTypedSelectors';
import {adjustWidgetLayout} from '../../utils';
// control plugin import
import {LOAD_STATUS} from '../Control/Control';
import {Error} from '../Control/Error/Error';
// debug tool import
import DebugInfoTool from '../DebugInfoTool/DebugInfoTool';

import './GroupControl.scss';

type LoadStatus = 'pending' | 'success' | 'fail';

const GROUP_CONTROL_LAYOUT_DEBOUNCE_TIME = 20;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type ErrorData = {
    data: {
        error?: SelectorError;
        title?: string;
        message?: string;
    };
    requestId?: string;
};

type SelectorError = {
    code: string;
    debug: string | {requestId?: string};
    details?: {
        sources?: {
            distincts?: {
                body?: {
                    debug: Record<string, string>;
                    message: string;
                    details: Record<string, string>;
                    code: string;
                };
                data?: {
                    ignore_nonexistent_filters: boolean;
                    fuild_guid: string;
                    where: ServerFilter[];
                };
                message?: string;
                sourceType?: string;
                status?: number;
                uiUrl?: string;
                url?: string;
            };
        };
    };
};

interface PluginGroupControlProps extends PluginWidgetProps, StateProps, DispatchProps {}

interface PluginGroupControlState {
    status: LoadStatus;
    loadedData: null | ResponseSuccessControls;
    errorData: null | ErrorData;
    silentLoading: boolean;
    showSilentLoader: boolean;
    forceUpdate: boolean;
    dialogVisible: boolean;
    loadingItems: boolean;
    initialParams?: StringParams;
    isInit: boolean;
}

export interface PluginGroupControl extends Plugin<PluginGroupControlProps> {
    // pass
}

const b = block('dashkit-plugin-group-control');

class GroupControl extends React.PureComponent<PluginGroupControlProps, PluginGroupControlState> {
    static getStatus(status: LoadStatus) {
        let res = '';
        for (const [key, val] of Object.entries(LOAD_STATUS)) {
            if (status === val) {
                res = key;
            }
        }
        return LOAD_STATUS[res];
    }

    chartKitRef: React.RefObject<ChartsChartKit> = React.createRef<ChartsChartKit>();
    rootNode: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

    _isUnmounted = false;
    _silentLoaderTimer: NodeJS.Timeout | undefined = undefined;
    _loadingItemsTimer: NodeJS.Timeout | undefined = undefined;

    adjustWidgetLayout = debounce(this.setAdjustWidgetLayout, GROUP_CONTROL_LAYOUT_DEBOUNCE_TIME);

    resolve: ((value: unknown) => void) | null = null;

    /**
     * can't use it in state because of doubling requests
     */
    initialParams: ChartInitialParams = {
        params: {} as StringParams,
    };

    constructor(props: PluginGroupControlProps) {
        super(props);
        this.state = {
            status: LOAD_STATUS.PENDING,
            loadedData: null,
            errorData: null,
            silentLoading: false,
            // loader with a vail that is not shown immediately
            showSilentLoader: false,
            // ChartKit parameter that equals false in case selector-chart has postUpdateOnChange param.
            // Its mean, you do not need to do this.init, because the request has already been executed on the ChartKit side
            forceUpdate: true,
            dialogVisible: false,
            loadingItems: true,
            isInit: false,
        };
    }

    componentDidMount() {
        this.init();
    }

    componentWillUnmount() {
        this._isUnmounted = true;
    }

    render() {
        const {data} = this.props;
        const controlData = data as unknown as {
            items: Record<
                string,
                DashTabItemControlExternal | DashTabItemControlManual | DashTabItemControlDataset
            >;
        };

        const source = (
            Object.values(controlData.items)[0] as unknown as
                | DashTabItemControlManual
                | DashTabItemControlDataset
        ).source;

        const paramIdDebug = ((source as DashTabItemControlDataset['source']).datasetFieldId ||
            (source as DashTabItemControlManual['source']).fieldName ||
            data.param ||
            '') as string;

        return (
            <div ref={this.rootNode} className={b({mobile: isMobileView})}>
                {this.renderSilentLoader()}
                <DebugInfoTool label={'paramId'} value={paramIdDebug} modType={'corner'} />
                {this.renderError()}
            </div>
        );
    }

    renderSilentLoader() {
        if (this.state.showSilentLoader) {
            return (
                <div className={b('loader', {silent: true})}>
                    <Loader size="s" />
                </div>
            );
        }

        return null;
    }

    renderError() {
        return (
            <div className={b('error')}>
                <Error onClick={() => {}} />
                <div>Render not implemented</div>
            </div>
        );
    }

    // public
    getMeta() {
        if (this.chartKitRef && this.chartKitRef.current) {
            this.chartKitRef.current.undeferred();
        }
        return Promise.resolve({});
    }

    get actualParams(): StringParams {
        return this.props.params;
    }

    async init() {
        try {
            // const {data} = this.props;

            if (this.state.isInit === false) {
                this.setState({isInit: true});
            }
        } catch (error) {
            if (this.state.isInit === false) {
                this.setState({isInit: true});
            }
            logger.logError('DashKit: GroupControl init failed', error);
            // eslint-disable-next-line no-console
            console.error('DASHKIT_CONTROL_RUN', error);

            let errorData = null;

            if (this._isUnmounted) {
                return;
            }

            if (error.response && error.response.data) {
                errorData = {
                    data: {error: error.response.data?.error},
                    requestId: error.response.headers['x-request-id'],
                };
            } else {
                errorData = {data: {message: error.message}};
            }

            this.setErrorData(errorData, LOAD_STATUS.FAIL);
        }
    }

    reload = () => {
        this.init();
    };

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

    private setErrorData(errorData: ErrorData, status: LoadStatus) {
        if (this._isUnmounted) {
            return;
        }

        const statusResponse = GroupControl.getStatus(status);
        if (statusResponse) {
            this.setState({
                status: statusResponse as LoadStatus,
                errorData,
                silentLoading: false,
                showSilentLoader: false,
                loadingItems: false,
            });
        }
    }
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    skipReload: selectSkipReload(state),
});

const mapDispatchToProps = {};

const GroupControlWithStore = connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true,
})(GroupControl);

const plugin: PluginGroupControl = {
    type: 'group_control',
    defaultLayout: {w: 8, h: 2},
    renderer(props: PluginWidgetProps, forwardedRef) {
        return <GroupControlWithStore {...props} ref={forwardedRef} />;
    },
};

export default plugin;
