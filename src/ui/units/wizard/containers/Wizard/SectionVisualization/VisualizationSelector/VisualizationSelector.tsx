import React from 'react';

import {Gear} from '@gravity-ui/icons';
import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {IconById} from 'components/IconById/IconById';
import {i18n} from 'i18n';
import cloneDeep from 'lodash/cloneDeep';
import {batch, connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {Shared, VisualizationIconProps, VisualizationWithLayersShared} from 'shared';
import {WizardPageQa} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {registry} from 'ui/registry';
import {selectDataset, selectDatasets} from 'units/wizard/selectors/dataset';
import {selectUpdates} from 'units/wizard/selectors/preview';
import {selectExtraSettings, selectWidget} from 'units/wizard/selectors/widget';
import {
    getDefaultExtraSettings,
    getDefaultVisualisationExtraSettings,
} from 'units/wizard/utils/wizard';

import {setVisualization} from '../../../../actions';
import {openDialogChartSettings} from '../../../../actions/dialog';
import {
    actualizeAndSetUpdates,
    updatePreviewAndClientChartsConfig,
} from '../../../../actions/preview';
import {forceEnablePivotFallback, setExtraSettings} from '../../../../actions/widget';

import iconVisualization from 'ui/assets/icons/visualization.svg';

import './VisualizationSelector.scss';

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export type VisualizationSelectorOwnProps = {
    visualization: Shared['visualization'] | VisualizationWithLayersShared['visualization'];
    visibleVisualizations: (
        | VisualizationWithLayersShared['visualization']
        | Shared['visualization']
    )[];
    onUpdate?: () => void;
    qlMode?: boolean;
};

interface Props extends StateProps, DispatchProps, VisualizationSelectorOwnProps {}

const b = block('visualization-selector');

class VisualizationSelector extends React.Component<Props> {
    private actionContainerRef = React.createRef<HTMLDivElement>();

    render() {
        const {visualization} = this.props;
        let buttonText, visualizationIcon;

        if (visualization) {
            const buttonTextKey = visualization.name || '';
            buttonText = i18n('wizard', buttonTextKey);
            visualizationIcon = <IconById {...visualization.iconProps} />;
        } else {
            buttonText = i18n('wizard', 'button_choose-visualization');
            visualizationIcon = <Icon data={iconVisualization} width="24" />;
        }

        return (
            <div ref={this.actionContainerRef} className={b()}>
                <DropdownMenu
                    size="s"
                    switcherWrapperClassName={b('dropdown')}
                    items={this.getItems()}
                    renderSwitcher={(args) => (
                        <React.Fragment>
                            <Button
                                className={b('dropdown-btn')}
                                view="flat"
                                pin="brick-brick"
                                width="max"
                                onClick={args.onClick}
                            >
                                <div
                                    className={b('dropdown-btn-content')}
                                    data-qa={'visualization-select-btn'}
                                >
                                    <div className="icon">{visualizationIcon}</div>
                                    <div
                                        className={b('dropdown-btn-text')}
                                        data-qa={`visualization-item-${visualization.id}`}
                                    >
                                        {buttonText}
                                    </div>
                                </div>
                            </Button>
                            <div
                                className={b('wrapper-settings-btn')}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Button
                                    qa="visualization-select-settings-btn"
                                    className={b('settings-btn')}
                                    view="flat"
                                    onClick={this.onSettingsIconClick}
                                >
                                    <Icon data={Gear} width="18" height="18" />
                                </Button>
                            </div>
                        </React.Fragment>
                    )}
                    popupProps={{
                        placement: ['bottom-start', 'top-start'],
                    }}
                    menuProps={{
                        className: b('popup-content'),
                        qa: WizardPageQa.VisualizationSelectPopup,
                    }}
                />
            </div>
        );
    }

    private getItems(): DropdownMenuItemMixed<unknown>[] {
        const {visualization, visibleVisualizations} = this.props;
        const {getVisualSelectorBottomPlaceholder} = registry.chart.functions.getAll();
        const bottomPlaceholder = getVisualSelectorBottomPlaceholder();
        const res = visibleVisualizations.map((item, index) => {
            return {
                action: () => this.onItemClick(index),
                text: this.renderItem(item),
                active: item.id === visualization.id,
            };
        });

        if (bottomPlaceholder) {
            return [res, [bottomPlaceholder]];
        } else {
            return res;
        }
    }

    private onItemClick = async (index: number) => {
        const {onUpdate, visualization, dataset, updates, visibleVisualizations} = this.props;

        // TODO: think about returning visualization configs via functions
        // otherwise, it turns out that config objects lying in constants are mutated,
        // which leads to various side effects
        const visualizationItem = cloneDeep(visibleVisualizations[index]) as
            | Shared['visualization']
            | VisualizationWithLayersShared['visualization'];

        // @ts-ignore
        visualizationItem.allowLayerFilters = false;

        if (visualization.id === visualizationItem.id) {
            return;
        }

        const extraSettings = this.getExtraSettings(visualizationItem.id);

        if (extraSettings) {
            this.props.setExtraSettings(extraSettings);

            if (
                this.props.datasets &&
                this.props.datasets.length > 1 &&
                visualizationItem.id === 'pivotTable'
            ) {
                this.props.forceEnablePivotFallback();
            }
        }

        batch(() => {
            this.props.setVisualization({
                qlMode: this.props.qlMode,
                visualization: visualizationItem,
            });

            if (dataset) {
                this.props.actualizeAndSetUpdates({updates});
                this.props.updatePreviewAndClientChartsConfig({});
            }
        });

        if (onUpdate) {
            onUpdate();
        }
    };

    private renderItem = (item: {id: string; iconProps: VisualizationIconProps; name: string}) => {
        const {visualization} = this.props;

        return (
            <div
                key={`visualization-item-${item.id}`}
                className={`visualization-item${visualization.id === item.id ? ' active' : ''}`}
                data-qa={`visualization-item-${item.id}`}
            >
                <IconById {...item.iconProps} />
                {i18n('wizard', item.name)}
            </div>
        );
    };

    private getExtraSettings = (visualizationId: string) => {
        const {widget, extraSettings: prevExtraSettings} = this.props;

        if (widget && widget.fake) {
            return getDefaultExtraSettings(visualizationId, prevExtraSettings);
        }

        const defaultExtraSettings = getDefaultVisualisationExtraSettings(visualizationId);
        if (defaultExtraSettings) {
            return {...defaultExtraSettings, ...prevExtraSettings};
        }

        return undefined;
    };

    private onSettingsIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        this.props.openDialogChartSettings({
            qlMode: this.props.qlMode,
            onUpdate: this.props.onUpdate,
        });
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        widget: selectWidget(state),
        extraSettings: selectExtraSettings(state),
        dataset: selectDataset(state),
        datasets: selectDatasets(state),
        updates: selectUpdates(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            updatePreviewAndClientChartsConfig,
            setExtraSettings,
            setVisualization,
            openDialogChartSettings,
            actualizeAndSetUpdates,
            forceEnablePivotFallback,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(VisualizationSelector);
