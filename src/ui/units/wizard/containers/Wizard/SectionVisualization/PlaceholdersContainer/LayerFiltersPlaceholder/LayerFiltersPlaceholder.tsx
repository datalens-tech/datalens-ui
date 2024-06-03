import React from 'react';

import {Funnel} from '@gravity-ui/icons';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {Field, FilterField, VisualizationLayerShared} from 'shared';
import type {ApplyData, DatalensGlobalState} from 'ui';
import {selectFilters} from 'units/wizard/selectors/visualization';

import {openWizardDialogFilter} from '../../../../../actions/dialog';
import type {PlaceholderAction} from '../../../../../actions/dndItems';
import {updateLayerFilters} from '../../../../../actions/placeholder';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import {setLayerFilters} from '../../../../../actions/visualization';
import {ITEM_TYPES, PRIMITIVE_DATA_TYPES} from '../../../../../constants';
import PlaceholderComponent from '../Placeholder/Placeholder';
import type {CommonPlaceholderProps} from '../PlaceholdersContainer';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = CommonPlaceholderProps & StateProps & DispatchProps;

class LayerFiltersPlaceholder extends React.Component<Props> {
    render() {
        const {wrapTo, datasetError, onBeforeRemoveItem} = this.props;

        return (
            <PlaceholderComponent
                qa="placeholder-layer-filters"
                id="layer-filters"
                key="layer-filters"
                title="section_layer-filters"
                iconProps={{data: Funnel}}
                allowedTypes={ITEM_TYPES.ALL}
                allowedDataTypes={PRIMITIVE_DATA_TYPES}
                hasSettings={false}
                items={this.layerFilters}
                checkAllowed={this.checkAllowedFilters}
                wrapTo={wrapTo}
                disabled={Boolean(datasetError)}
                onBeforeRemoveItem={onBeforeRemoveItem}
                onUpdate={this.onUpdate}
                noSwap={true}
                onItemClick={this.onItemClick}
            />
        );
    }

    get layerFilters() {
        const visualization = this.props.visualization as VisualizationLayerShared['visualization'];
        const filters = visualization.commonPlaceholders.filters;
        return filters.filter((item) => !item.unsaved) as unknown as Field[];
    }

    get filtersFromDashboard() {
        return this.props.filters.filter((filter) => filter.unsaved);
    }

    private checkAllowedFilters = (item: Field) => {
        return ITEM_TYPES.ALL.has(item.type) && PRIMITIVE_DATA_TYPES.has(item.data_type);
    };

    private onItemClick = (_e: any, filterItem: Field) => {
        const visualization = this.props.visualization as VisualizationLayerShared['visualization'];
        const filters = visualization.commonPlaceholders.filters;

        const onDialogFilterAction = (data?: ApplyData) => {
            if (data) {
                const result = {
                    ...filterItem,
                    filter: {
                        value: data.values,
                        operation: {code: data.operation},
                    },
                };
                let newFilters = filters.map((filter: any) =>
                    filter === filterItem ? result : filter,
                );

                if (filterItem.disabled) {
                    newFilters = filters.filter((filter: any) => {
                        return !(filter === filterItem && filter.unsaved);
                    });

                    delete filterItem.disabled;
                }

                this.setLayerFiltersAndUpdatePreview(newFilters);
            }
        };

        this.props.openWizardDialogFilter({
            filterItem,
            onDialogFilterApply: onDialogFilterAction,
        });
    };

    private onUpdate = (
        items: Field[],
        item?: Field,
        action?: string,
        onUndoInsert?: () => void,
    ) => {
        this.props.updateLayerFilters({
            items,
            options: {item, action: action as PlaceholderAction, onUndoInsert},
        });

        if (action === 'remove' || item?.filter) {
            this.props.updatePreviewAndClientChartsConfig({});
        }
    };

    private setLayerFiltersAndUpdatePreview(filters: FilterField[]) {
        this.props.setLayerFilters({filters});
        this.props.updatePreviewAndClientChartsConfig({});
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        filters: selectFilters(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            setLayerFilters,
            updatePreviewAndClientChartsConfig,
            openWizardDialogFilter,
            updateLayerFilters,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(LayerFiltersPlaceholder);
