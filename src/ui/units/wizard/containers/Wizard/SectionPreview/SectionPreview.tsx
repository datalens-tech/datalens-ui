import React, {Component} from 'react';

import {i18n} from 'i18n';
import omit from 'lodash/omit';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {StringParams} from 'shared';
import {MenuItemsIds, WizardPageQa} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {Utils} from 'ui';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {getCustomExportActionWrapperWithSave} from 'ui/utils/custom-export-menu-item';
import {setDrillDownLevel} from 'units/wizard/actions/visualization';
import {selectDatasetError} from 'units/wizard/selectors/dataset';
import {
    selectConfig,
    selectConfigForSaving,
    selectConfigType,
    selectIsChartSaved,
    selectPreviewEntryId,
} from 'units/wizard/selectors/preview';

import {ChartWrapper} from '../../../../../components/Widgets/Chart/ChartWidgetWithProvider';
import type {ChartProviderPropsWithRefProps} from '../../../../../components/Widgets/Chart/types';
import type {ChartKit} from '../../../../../libs/DatalensChartkit/ChartKit/ChartKit';
import type {
    ChartKitBaseOnLoadProps,
    ChartKitLoadSuccess,
} from '../../../../../libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import type {
    ChartKitWrapperLoadStatusUnknown,
    ChartKitWrapperLoadSuccess,
    ChartKitWrapperOnLoadProps,
} from '../../../../../libs/DatalensChartkit/components/ChartKitBase/types';
import type {ConfigNode} from '../../../../../libs/DatalensChartkit/modules/data-provider/charts';
import {openDialogSaveChartConfirm} from '../../../../../store/actions/dialog';
import {reloadRevisionsOnSave} from '../../../../../store/actions/entryContent';
import type {HighchartsWidget} from '../../../actions/preview';
import {setHighchartsWidget} from '../../../actions/preview';
import {updateWizardWidgetAndUpdateConfig} from '../../../actions/widget';
import {selectWizardWorkbookId} from '../../../selectors/settings';
import {selectWidget} from '../../../selectors/widget';
import {shouldComponentUpdateWithDeepComparison} from '../../../utils/helpers';

import './SectionPreview.scss';

const FORBIDDEN_PARAMS = [
    // it should not be possible to redefine the type of visualization
    '_chart_type',
];

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface Props extends StateProps, DispatchProps {
    chartKitRef: React.RefObject<ChartKit>;
}

class SectionPreview extends Component<Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return shouldComponentUpdateWithDeepComparison({
            nextProps,
            currentProps: this.props,
            deepComparePropKey: 'widget',
        });
    }

    getMenuType() {
        const widgetEntryId = this.props.widget ? this.props.widget.entryId : '';
        const entryId = this.props.previewEntryId ? this.props.previewEntryId : widgetEntryId;
        return entryId ? 'wizard' : 'panePreview';
    }

    getCustomMenuOptions() {
        const {isChartSaved, widget, configForSaving} = this.props;

        const args = {
            canBeSaved: !isChartSaved,
            onApply: async () => {
                if (configForSaving) {
                    await this.props.updateWizardWidgetAndUpdateConfig({
                        config: configForSaving,
                        entry: widget,
                    });

                    this.props.reloadRevisionsOnSave();
                }
            },
        };

        return {
            [MenuItemsIds.EXPORT]: {
                actionWrapper: getCustomExportActionWrapperWithSave.bind(null, {
                    message: i18n('wizard', 'confirm_chart-save_message'),
                    ...args,
                }),
            },
            [MenuItemsIds.ALERTS]: {
                actionWrapper: getCustomExportActionWrapperWithSave.bind(null, {
                    message: i18n('wizard', 'confirm_chart-save_message_alerts'),
                    ...args,
                }),
            },
        } as unknown as ChartProviderPropsWithRefProps['customMenuOptions'];
    }

    handleLoad = (
        result:
            | ChartKitBaseOnLoadProps<unknown>
            | ChartKitWrapperOnLoadProps
            | ChartKitWrapperLoadStatusUnknown,
    ) => {
        const widgetData =
            (result as ChartKitWrapperLoadSuccess).data?.widgetData ||
            (result as ChartKitLoadSuccess<unknown>).data?.widget;

        this.props.setHighchartsWidget({
            // TODO: probably highchartsWidget should be renamed to something like widgetData,
            // because now the map will be take here
            // the methods for setting the transparency and visibility of layers

            highchartsWidget: widgetData as unknown as HighchartsWidget,
        });
    };

    handleInnerParamsChanged = (params: StringParams) => {
        if ('drillDownLevel' in params && !isNaN(Number(params.drillDownLevel))) {
            this.props.setDrillDownLevel({drillDownLevel: Number(params.drillDownLevel)});
        }
    };

    renderChartkit() {
        const {configType, config, widget, previewEntryId, datasetError, chartKitRef, workbookId} =
            this.props;

        if (datasetError) {
            return (
                <div className="dataset-error-container">
                    <PlaceholderIllustration
                        title={i18n('wizard', 'label_preview-dataset-error')}
                        direction="column"
                        name="badRequest"
                    />
                </div>
            );
        }

        if (previewEntryId || (config && configType)) {
            let editMode: ConfigNode | undefined;

            if (config && configType) {
                editMode = {
                    data: config,
                    type: configType,
                } as unknown as ConfigNode;
            }

            const searchParams = Utils.getParamsFromSearch(window.location.search);
            const params = omit(searchParams, FORBIDDEN_PARAMS);
            const {actionParamsEnabled} = Utils.getOptionsFromSearch(window.location.search);

            return (
                <ChartWrapper
                    usageType="chart"
                    id={previewEntryId ? previewEntryId : widget ? widget.entryId : ''}
                    params={params}
                    config={editMode}
                    onChartRender={this.handleLoad}
                    menuType={this.getMenuType()}
                    customMenuOptions={this.getCustomMenuOptions()}
                    forwardedRef={chartKitRef}
                    onInnerParamsChanged={this.handleInnerParamsChanged}
                    workbookId={workbookId}
                    actionParamsEnabled={actionParamsEnabled}
                />
            );
        }

        return (
            <div className="dataset-stub-container">
                <PlaceholderIllustration
                    description={i18n('wizard', 'label_preview-dataset-stub')}
                    name="template"
                />
            </div>
        );
    }

    render() {
        return (
            <div className={'container preview-container'}>
                <div className="preview-chartkit" data-qa={WizardPageQa.SectionPreview}>
                    {this.renderChartkit()}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        datasetError: selectDatasetError(state),
        configType: selectConfigType(state),
        config: selectConfig(state),
        configForSaving: selectConfigForSaving(state),
        widget: selectWidget(state),
        previewEntryId: selectPreviewEntryId(state),
        isChartSaved: selectIsChartSaved(state),
        workbookId: selectWizardWorkbookId(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            setHighchartsWidget,
            openDialogSaveChartConfirm,
            updateWizardWidgetAndUpdateConfig,
            reloadRevisionsOnSave,
            setDrillDownLevel,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(SectionPreview);
