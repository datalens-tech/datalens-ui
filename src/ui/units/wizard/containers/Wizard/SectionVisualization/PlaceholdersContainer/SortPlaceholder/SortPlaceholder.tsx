import React from 'react';

import {BarsDescendingAlignLeft} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {Field} from 'shared';
import {
    DatasetFieldType,
    PlaceholderId,
    WizardVisualizationId,
    isFieldHierarchy,
    isMeasureField,
    isMeasureName,
    isMeasureValue,
    isVisualizationWithLayers,
} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {
    selectColors,
    selectSegments,
    selectSort,
    selectVisualization,
} from 'units/wizard/selectors/visualization';
import {getSelectedLayer} from 'units/wizard/utils/helpers';

import {updateSort} from '../../../../../actions/placeholder';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import PlaceholderComponent from '../Placeholder/Placeholder';
import type {CommonPlaceholderProps} from '../PlaceholdersContainer';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = CommonPlaceholderProps & StateProps & DispatchProps & {multipleDatasets: boolean};

const SORT_CAPACITY = 10;

class SortPlaceholder extends React.Component<Props> {
    render() {
        const {sort, visualization, wrapTo, datasetError, onBeforeRemoveItem, multipleDatasets} =
            this.props;
        const sortTitle = visualization.id === 'polyline' ? 'section_order' : 'section_sort';
        const sortCapacityError =
            visualization.id === 'polyline' ? 'label_order-overflow' : 'label_order-overflow';
        const items = sort.map((field) => {
            const shouldShowTooltip =
                visualization.id === 'pivotTable' &&
                (field.type === DatasetFieldType.Measure || isMeasureValue(field));

            if (shouldShowTooltip) {
                return {
                    ...field,
                    disabled: i18n('wizard', 'label_pivot-measure-sort'),
                };
            }

            return field;
        });

        return (
            <PlaceholderComponent
                key="sort"
                id="sort"
                qa="placeholder-sort"
                hasSettings={false}
                title={sortTitle}
                iconProps={{
                    data: BarsDescendingAlignLeft,
                }}
                items={multipleDatasets ? [] : items}
                capacity={SORT_CAPACITY}
                capacityError={sortCapacityError}
                checkAllowed={this.checkAllowedSort}
                onUpdate={this.onSortUpdate}
                additionalItemsClassName="sort-item"
                wrapTo={wrapTo}
                disabled={Boolean(datasetError) || multipleDatasets}
                onBeforeRemoveItem={onBeforeRemoveItem}
                onAfterUpdate={this.props.onUpdate}
                placeholderTooltipText={
                    multipleDatasets ? i18n('wizard', 'tooltip_sort_unavailable') : undefined
                }
                disableAddField={multipleDatasets}
            />
        );
    }

    private checkAllowedSort = (item: Field) => {
        const {colors, visualization, segments, globalVisualization, multipleDatasets} = this.props;

        if (multipleDatasets) {
            return false;
        }

        if (isMeasureName(item)) {
            return false;
        }

        if (isFieldHierarchy(item)) {
            return false;
        }

        if (globalVisualization.id === WizardVisualizationId.CombinedChart) {
            if (isMeasureField(item)) {
                return true;
            }

            const availableDimensionsMap: Record<string, boolean> = {};

            globalVisualization.layers.forEach((layer) => {
                const xPlaceholder = layer.placeholders.find(
                    (placeholder) => placeholder.id === PlaceholderId.X,
                );

                xPlaceholder?.items?.forEach((item) => {
                    availableDimensionsMap[item.guid] = true;
                });

                const dimensionsAffectGroupping = [
                    ...(layer.commonPlaceholders?.colors || []),
                    ...(layer.commonPlaceholders?.shapes || []),
                ];

                dimensionsAffectGroupping.forEach((item) => {
                    availableDimensionsMap[item.guid] = true;
                });
            });

            return availableDimensionsMap[item.guid];
        }

        return (
            visualization &&
            (visualization as any).checkAllowedSort(item, visualization, colors, segments)
        );
    };

    private onSortUpdate = (items: Field[]) => {
        this.props.updateSort({items});
        this.props.updatePreviewAndClientChartsConfig({});

        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            updateSort,
            updatePreviewAndClientChartsConfig,
        },
        dispatch,
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    const globalVisualization = selectVisualization(state);
    let sort = selectSort(state);

    if (isVisualizationWithLayers(globalVisualization)) {
        const layer = getSelectedLayer(globalVisualization);
        sort = layer?.commonPlaceholders.sort || [];
    }

    return {
        sort,
        colors: selectColors(state),
        segments: selectSegments(state),
        globalVisualization,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SortPlaceholder);
