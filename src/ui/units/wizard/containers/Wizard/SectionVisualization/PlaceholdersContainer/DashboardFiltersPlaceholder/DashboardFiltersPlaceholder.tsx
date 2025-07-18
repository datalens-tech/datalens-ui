import React from 'react';

import {Funnel, TrashBin} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {Field} from 'shared';
import {isVisualizationWithLayers} from 'shared';
import type {ApplyData, DatalensGlobalState} from 'ui';
import {selectFilters} from 'units/wizard/selectors/visualization';

import type {PlaceholderAction} from '../../../../../actions/dndItems';
import {updateDashboardFilters} from '../../../../../actions/placeholder';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import {onFilterItemClick, setFilters, updateLayers} from '../../../../../actions/visualization';
import {ITEM_TYPES} from '../../../../../constants';
import {
    appendUrlParameters,
    getExistedParameterKeys,
    removeUrlParameters,
} from '../../../../../utils/wizard';
import type {CustomPlaceholderAction} from '../Placeholder/Placeholder';
import PlaceholderComponent from '../Placeholder/Placeholder';
import type {CommonPlaceholderProps} from '../PlaceholdersContainer';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = CommonPlaceholderProps & StateProps & DispatchProps;

class DashboardFiltersPlaceholder extends React.Component<Props> {
    render() {
        const {wrapTo, datasetError, onBeforeRemoveItem} = this.props;

        return (
            <PlaceholderComponent
                id="dashboard-filters"
                key="dashboard-filters"
                qa="placeholder-dashboard-filters"
                title="section_filters_from_dashboard"
                placeholderTooltipText={i18n('wizard', 'tooltip_filters_from_dashboard')}
                iconProps={{data: Funnel}}
                noSwap={true}
                items={this.filtersFromDashboard}
                allowedTypes={ITEM_TYPES.NIL}
                wrapTo={wrapTo}
                disabled={Boolean(datasetError)}
                onBeforeRemoveItem={onBeforeRemoveItem}
                onUpdate={this.onUpdate}
                hasSettings={false}
                onItemClick={this.onFilterItemClick}
                checkAllowed={() => false}
                customPlaceholderActions={this.customDashboardFiltersActions}
            />
        );
    }

    get filtersFromDashboard() {
        return this.props.filters.filter((filter) => filter.unsaved) as unknown as Field[];
    }

    get customDashboardFiltersActions(): CustomPlaceholderAction[] {
        return [
            {
                id: 'delete-all-dashboard-filters',
                qa: 'delete-all-dashboard-filters-action',
                icon: TrashBin,
                hidden: this.filtersFromDashboard.length === 0,
                hoverText: i18n('wizard', 'label_delete-all-filters-action'),
                isFirst: true,
                onClick: () => {
                    const newFilters = this.props.filters.filter((filter) => {
                        if (filter.unsaved) {
                            const keys = getExistedParameterKeys({
                                possibleKeys: [filter.guid, filter.title],
                            });
                            removeUrlParameters(keys);

                            return false;
                        }

                        if (filter.disabled) {
                            delete filter.disabled;
                        }

                        return true;
                    });

                    if (isVisualizationWithLayers(this.props.visualization)) {
                        const updatedLayers = [...this.props.visualization.layers];
                        updatedLayers.forEach((layer) => {
                            layer.commonPlaceholders.filters =
                                layer.commonPlaceholders.filters.filter((filter) => {
                                    if (filter.unsaved) {
                                        return false;
                                    }

                                    if (filter.disabled) {
                                        delete filter.disabled;
                                    }

                                    return true;
                                });
                        });

                        this.props.updateLayers({layers: updatedLayers});
                    }

                    this.props.setFilters({filters: newFilters});
                    this.props.updatePreviewAndClientChartsConfig({});
                },
            },
        ];
    }

    private onUpdate = (items: Field[], filterItem: Field, action?: string) => {
        this.props.updateDashboardFilters({
            items,
            options: {item: filterItem, action: action as PlaceholderAction},
        });
        this.props.updatePreviewAndClientChartsConfig({});
    };

    private onFilterItemClick = (_e: any, item: Field) => {
        this.props.onFilterItemClick({filterItem: item, onApplyCallback: this.onApplyCallback});
    };

    private onApplyCallback(filterItem: Field, data: ApplyData) {
        if (!filterItem.unsaved) {
            return;
        }

        const keys = getExistedParameterKeys({possibleKeys: [filterItem.guid, filterItem.title]});

        if (!keys.length) {
            return;
        }

        const {operation, values} = data;

        if (values.length === 0) {
            return;
        }

        const updatedParameterKey = keys.find((key: string) => key === filterItem.guid) || keys[0];

        removeUrlParameters(keys);

        const preparedValues = values.map((value) => `__${operation}_${value}`);

        appendUrlParameters({key: updatedParameterKey, values: preparedValues});
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        filters: selectFilters(state),
    };
};

const mapDispatchToProps = {
    setFilters,
    updateDashboardFilters,
    updatePreviewAndClientChartsConfig,
    updateLayers,
    onFilterItemClick,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardFiltersPlaceholder);
