import React from 'react';

import {Funnel, TrashBin} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {Field} from 'shared';
import {DatalensGlobalState} from 'ui';
import {selectFilters} from 'units/wizard/selectors/visualization';

import {PlaceholderAction} from '../../../../../actions/dndItems';
import {updateFilters} from '../../../../../actions/placeholder';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import {onFilterItemClick, setFilters} from '../../../../../actions/visualization';
import {ITEM_TYPES, PRIMITIVE_DATA_TYPES, VISUALIZATION_IDS} from '../../../../../constants';
import PlaceholderComponent, {CustomPlaceholderAction} from '../Placeholder/Placeholder';
import {CommonPlaceholderProps} from '../PlaceholdersContainer';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = CommonPlaceholderProps & StateProps & DispatchProps;

class FiltersPlaceholder extends React.Component<Props> {
    render() {
        const {visualization, wrapTo, datasetError, onBeforeRemoveItem} = this.props;

        const title =
            visualization.id === VISUALIZATION_IDS.GEOLAYER
                ? 'section_common-filters'
                : 'section_filters';

        return (
            <PlaceholderComponent
                id="filters"
                key="filters"
                qa="placeholder-filters"
                noSwap={true}
                hasSettings={false}
                iconProps={{data: Funnel}}
                items={this.filters as unknown as Field[]}
                checkAllowed={this.checkAllowedFilters}
                title={title}
                allowedTypes={ITEM_TYPES.DIMENSIONS_AND_MEASURES}
                allowedDataTypes={PRIMITIVE_DATA_TYPES}
                wrapTo={wrapTo}
                onBeforeRemoveItem={onBeforeRemoveItem}
                disabled={Boolean(datasetError)}
                onUpdate={this.onUpdate}
                onItemClick={this.onItemClick}
                customPlaceholderActions={this.customDashboardFiltersActions}
                qlMode={this.props.qlMode}
                onAfterUpdate={this.props.onUpdate}
            />
        );
    }

    get filters() {
        return this.props.filters.filter((filter) => !filter.unsaved);
    }

    get filtersFromDashboard() {
        return this.props.filters.filter((filter) => filter.unsaved);
    }

    get customDashboardFiltersActions(): CustomPlaceholderAction[] {
        return [
            {
                id: 'delete-all-filters',
                qa: 'delete-all-filters-action',
                icon: TrashBin,
                styles: {marginTop: 4},
                hidden: this.filters.length === 0,
                hoverText: i18n('wizard', 'label_delete-all-filters-action'),
                onClick: () => {
                    const newFilters = this.props.filters.filter((filter) => {
                        return filter.unsaved;
                    });
                    this.props.setFilters({filters: newFilters});
                    this.props.updatePreviewAndClientChartsConfig({});
                },
            },
        ];
    }

    private onUpdate = (
        items: Field[],
        item?: Field,
        action?: string,
        onUndoInsert?: () => void,
    ) => {
        this.props.updateFilters({
            items,
            options: {item, action: action as PlaceholderAction, onUndoInsert},
        });
        if (action === 'remove' || (item && item.filter)) {
            this.props.updatePreviewAndClientChartsConfig({});
        }
    };

    private onItemClick = (_e: any, item: Field) => {
        this.props.onFilterItemClick({filterItem: item});
    };

    private checkAllowedFilters = (item: Field) => {
        return ITEM_TYPES.ALL.has(item.type) && PRIMITIVE_DATA_TYPES.has(item.data_type);
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        filters: selectFilters(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            updateFilters,
            setFilters,
            updatePreviewAndClientChartsConfig,
            onFilterItemClick,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(FiltersPlaceholder);
