import React from 'react';

import {BucketPaint} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {Field, PlaceholderActionQa, Shared, isFieldHierarchy, isMeasureField} from 'shared';
import {DatalensGlobalState} from 'ui';
import {selectDataset} from 'units/wizard/selectors/dataset';
import {
    selectColors,
    selectColorsConfig,
    selectFilters,
} from 'units/wizard/selectors/visualization';

import {openDialogColors} from '../../../../../actions/dialog';
import {updateColors} from '../../../../../actions/placeholder';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import {PRIMITIVE_DATA_TYPES_AND_HIERARCHY} from '../../../../../constants';
import {getDialogItem} from '../../../../../utils/helpers';
import PlaceholderComponent from '../Placeholder/Placeholder';
import {CommonPlaceholderProps} from '../PlaceholdersContainer';

const COLORS_PLACEHOLDER_TYPES = new Set([...PRIMITIVE_DATA_TYPES_AND_HIERARCHY, 'geopoint']);

type PropsState = ReturnType<typeof mapStateToProps>;
type PropsDispatch = ReturnType<typeof mapDispatchToProps>;

type Props = {
    globalVisualization?: Shared['visualization'];
} & CommonPlaceholderProps &
    PropsState &
    PropsDispatch;

class ColorsPlaceholder extends React.Component<Props> {
    render() {
        const {addFieldItems, colors, visualization, wrapTo, datasetError, onBeforeRemoveItem} =
            this.props;

        const colorsContainsHierarchies = colors.some(isFieldHierarchy);

        const onActionIconClick = colorsContainsHierarchies ? undefined : this.openDialogColor;
        const disabledText = colorsContainsHierarchies
            ? i18n('wizard', 'label_no-colors-setup-for-hierarchy')
            : undefined;

        return (
            <PlaceholderComponent
                key="colors"
                qa="placeholder-colors"
                id="colors"
                iconProps={{data: BucketPaint}}
                title="section_colors"
                hasSettings={this.shouldRenderSettings()}
                onActionIconClick={onActionIconClick}
                actionIconQa={PlaceholderActionQa.OpenColorDialogIcon}
                items={colors}
                capacity={visualization.colorsCapacity || 1}
                checkAllowed={this.checkAllowedColors}
                onUpdate={this.onColorsUpdate}
                wrapTo={wrapTo}
                disabled={Boolean(datasetError)}
                onBeforeRemoveItem={onBeforeRemoveItem}
                capacityError="label_colors-overflow"
                disabledText={disabledText}
                addFieldItems={addFieldItems}
                onAfterUpdate={this.props.onUpdate}
            />
        );
    }

    private onColorsUpdate = (items: Field[]) => {
        this.props.updateColors({items});
        this.props.updatePreviewAndClientChartsConfig({});

        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    };

    private checkAllowedColors = (item: Field) => {
        if (!COLORS_PLACEHOLDER_TYPES.has(item.data_type) && item.data_type !== 'geopoint') {
            return false;
        }

        const {globalVisualization, visualization, colors} = this.props;

        if (globalVisualization?.id === 'combined-chart' && isMeasureField(item)) {
            return false;
        }

        return Boolean(
            visualization.checkAllowedDesignItems &&
                visualization.checkAllowedDesignItems({
                    item,
                    visualization,
                    designItems: colors,
                }),
        );
    };

    private openDialogColor = () => {
        const {colors, visualization} = this.props;
        const {placeholders} = visualization;
        const item = getDialogItem(colors, placeholders);

        this.props.openDialogColors({
            item,
            onApply: () => {
                if (this.props.onUpdate) {
                    this.props.onUpdate();
                }
            },
        });
    };

    private shouldRenderSettings() {
        const {colors, visualization} = this.props;

        const {placeholders} = visualization;
        const isHeatmapNotEmpty =
            colors.length &&
            placeholders[0] &&
            placeholders[0].id === 'heatmap' &&
            placeholders[0].items.length;
        const isXNotEmpty =
            placeholders[1] && placeholders[1].id === 'x' && placeholders[1].items.length;
        const isYNotEmpty =
            placeholders[1] && placeholders[1].id === 'y' && placeholders[1].items.length;
        const isY2NotEmpty =
            placeholders[2] && placeholders[2].id === 'y2' && placeholders[2].items.length;

        return Boolean(
            (colors.length && (colors[0].type === 'DIMENSION' || colors[0].type === 'MEASURE')) ||
                isHeatmapNotEmpty ||
                isXNotEmpty ||
                isYNotEmpty ||
                isY2NotEmpty,
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            updatePreviewAndClientChartsConfig,
            updateColors,
            openDialogColors,
        },
        dispatch,
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        colors: selectColors(state),
        dataset: selectDataset(state),
        colorsConfig: selectColorsConfig(state),
        filters: selectFilters(state),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ColorsPlaceholder);
