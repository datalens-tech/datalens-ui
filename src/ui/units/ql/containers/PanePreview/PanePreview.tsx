import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import _ from 'lodash';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import type {QlConfig} from 'shared';
import {EntryUpdateMode, MenuItemsIds} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {Utils} from 'ui';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import type {
    ChartProviderPropsWithRefProps,
    ChartWithWrapRefProps,
} from 'ui/components/Widgets/Chart/types';
import {openDialogSaveChartConfirm} from 'ui/store/actions/dialog';
import {getCustomExportActionWrapperWithSave} from 'ui/utils/custom-export-menu-item';

import {ChartWrapper} from '../../../../components/Widgets/Chart/ChartWidgetWithProvider';
import type {ChartKitWrapperOnLoadProps} from '../../../../libs/DatalensChartkit/components/ChartKitBase/types';
import {VisualizationStatus} from '../../constants';
import {prepareChartDataBeforeSave} from '../../modules/helpers';
import type {SetQueryMetadataProps} from '../../store/actions/ql';
import {
    setQueryMetadata,
    setTablePreviewData,
    setVisualizationStatus,
    updateChart,
} from '../../store/actions/ql';
import {
    getChart,
    getConnection,
    getEntry,
    getEntryCanBeSaved,
    getPreviewData,
} from '../../store/reducers/ql';
import type {
    QLChart,
    QLChartConfig,
    QLConnectionEntry,
    QLEntry,
    QLState,
} from '../../store/typings/ql';

import './PanePreview.scss';

const b = block('ql-pane-preview');

interface PreviewProps {
    chartData: QLChart | null;

    setWidgetRef: (ref: ChartWithWrapRefProps | null) => void;

    mode: 'preview' | 'chart';
    entry: QLEntry | null;
    connection: QLConnectionEntry | null;
    entryCanBeSaved: boolean;
    previewData: QlConfig | null;

    setQueryMetadata: typeof setQueryMetadata;
    setTablePreviewData: typeof setTablePreviewData;
    setVisualizationStatus: typeof setVisualizationStatus;
    openDialogSaveChartConfirm: typeof openDialogSaveChartConfirm;
    updateChart: typeof updateChart;
}

interface PreviewState {
    previewConfig: QLChartConfig | null;
}

class Preview extends React.PureComponent<PreviewProps, PreviewState> {
    chartKitRef = React.createRef<ChartWithWrapRefProps>();

    constructor(props: PreviewProps) {
        super(props);

        this.state = {
            previewConfig: null,
        };
    }

    componentDidMount() {
        const {chartData} = this.props;

        if (chartData) {
            this.setPreviewConfig(chartData);
        }
    }

    componentDidUpdate(prevProps: PreviewProps) {
        const {chartData} = this.props;

        if (chartData && chartData !== prevProps.chartData) {
            this.setPreviewConfig(chartData);
        }
    }

    render() {
        const {mode, entry} = this.props;
        const {previewConfig} = this.state;

        if (!previewConfig) {
            if (mode === 'chart') {
                return (
                    <div className={b('empty-chart')}>
                        <PlaceholderIllustration
                            description={i18n('sql', 'label_empty-chart')}
                            name="template"
                            direction="column"
                            className={b('empty-illustration')}
                            size="m"
                        />
                    </div>
                );
            }

            return null;
        }

        const params = Utils.getParamsFromSearch(window.location.search);

        return (
            <div className={b()}>
                <ChartWrapper
                    usageType="chart"
                    id={entry?.entryId}
                    config={previewConfig}
                    params={params}
                    onChartLoad={this.onChartLoad}
                    disableChartLoader={true}
                    noVeil={true}
                    menuType={this.getMenuType()}
                    forwardedRef={this.chartKitRef}
                    workbookId={entry?.workbookId}
                    customMenuOptions={this.getCustomMenuOptions()}
                    transformLoadedData={(loadedData: any) => {
                        if (
                            loadedData?.data &&
                            isEmpty(omit(loadedData.data, 'metadata', 'tablePreviewData'))
                        ) {
                            return {
                                ...loadedData,
                                data: undefined,
                            };
                        }

                        return loadedData;
                    }}
                />
            </div>
        );
    }

    getCustomMenuOptions() {
        return {
            [MenuItemsIds.EXPORT]: {
                actionWrapper: getCustomExportActionWrapperWithSave.bind(null, {
                    message: i18n('wizard', 'confirm_chart-save_message'),
                    canBeSaved: this.props.entryCanBeSaved,
                    onApply: async () => {
                        const {previewData} = this.props;

                        if (!previewData) {
                            return;
                        }

                        const preparedChartData = prepareChartDataBeforeSave(previewData);
                        await this.props.updateChart(preparedChartData, EntryUpdateMode.Publish);
                    },
                }),
            },
        } as unknown as ChartProviderPropsWithRefProps['customMenuOptions'];
    }

    onChartLoad = ({data}: ChartKitWrapperOnLoadProps) => {
        if (data.loadedData && data.loadedData.data && !_.isEmpty(data.loadedData.data)) {
            if (Array.isArray(data.loadedData.data)) {
                // This is a case about drawing an indicator: there comes an array
                const {metadata, tablePreviewData} = data.loadedData.data[0];

                if (metadata) {
                    this.props.setQueryMetadata({metadata});
                }

                if (tablePreviewData) {
                    this.props.setTablePreviewData({tablePreviewData});
                }
            } else {
                // These are all the other cases, there comes an object
                const {metadata, tablePreviewData} = data.loadedData.data as Pick<
                    QLState,
                    'tablePreviewData'
                > &
                    SetQueryMetadataProps;

                if (metadata) {
                    this.props.setQueryMetadata({metadata});
                }

                if (tablePreviewData) {
                    this.props.setTablePreviewData({tablePreviewData});
                }
            }
        } else {
            // Case when chart execution errored or has empty result
            this.props.setTablePreviewData({tablePreviewData: {}});
        }

        // There is a problem with yagr widget - it does not call onRender callback every time it is rendered, only once
        // Therefore, for now we are artificially calling callback to remove the loader
        setTimeout(this.onChartRender);
    };

    onChartRender = () => {
        this.props.setWidgetRef(this.chartKitRef.current);
        this.props.setVisualizationStatus(VisualizationStatus.Ready);
    };

    private getMenuType() {
        const {entry} = this.props;
        return entry?.entryId ? 'wizard' : 'panePreview';
    }

    private setPreviewConfig(chartData: QLChart) {
        if (this.props.mode === 'preview' && chartData.withoutTable) {
            return;
        }

        const previewConfig = _.cloneDeep(chartData.preview);

        if (this.props.mode === 'preview') {
            previewConfig.data.shared.preview = true;
        }

        this.setState({
            previewConfig,
        });
    }
}

type PanePreviewDispatchProps = typeof mapDispatchToProps;
type PanePreviewStateProps = ReturnType<typeof makeMapStateToProps>;

interface PanePreviewOuterProps {
    entry: QLEntry | null;
    paneSize: number;
    chartData: QLChart | null;
    mode: 'preview' | 'chart';
    connection: QLConnectionEntry | null;
}

type PanePreviewInnerProps = PanePreviewStateProps & PanePreviewDispatchProps;

type PanePreviewProps = PanePreviewInnerProps & PanePreviewOuterProps;

class PanePreview extends React.PureComponent<PanePreviewProps> {
    widgetRef: React.RefObject<ChartWithWrapRefProps>;

    constructor(props: PanePreviewProps) {
        super(props);

        this.widgetRef = React.createRef();
    }

    componentDidUpdate(prevProps: PanePreviewProps) {
        if (prevProps.paneSize !== this.props.paneSize) {
            if (this.widgetRef.current && typeof this.widgetRef.current.reflow === 'function') {
                this.widgetRef.current.reflow();
            }
        }
    }

    render() {
        const {...restProps} = this.props;

        return <Preview key={this.props.mode} {...restProps} setWidgetRef={this.setWidgetRef} />;
    }

    private setWidgetRef = (widget: ChartWithWrapRefProps | null) => {
        // TODO: to use mutable type the component needs to be functional, not class-based
        (this.widgetRef as React.MutableRefObject<ChartWithWrapRefProps | null>).current = widget;
    };
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        chartData: getChart(state),
        connection: getConnection(state),
        entry: getEntry(state),
        entryCanBeSaved: getEntryCanBeSaved(state),
        previewData: getPreviewData(state),
    };
};

const mapDispatchToProps = {
    setQueryMetadata,
    setTablePreviewData,
    setVisualizationStatus,
    openDialogSaveChartConfirm,
    updateChart,
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<PanePreviewProps, PanePreviewOuterProps>()(PanePreview));
