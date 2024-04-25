import React from 'react';

import {Shapes4} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {
    Field,
    PlaceholderId,
    SectionVisualizationAddItemQa,
    WizardVisualizationId,
    isFieldHierarchy,
} from 'shared';
import {DatalensGlobalState} from 'ui';
import {selectDataset} from 'units/wizard/selectors/dataset';
import {
    selectFilters,
    selectShapes,
    selectShapesConfig,
} from 'units/wizard/selectors/visualization';

import {PaletteTypes} from '../../../../../../../components/Palette/constants';
import {openDialogShapes} from '../../../../../actions/dialog';
import {updateShapes} from '../../../../../actions/placeholder';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import {getDialogItem} from '../../../../../utils/helpers';
import {AddableField} from '../../AddField/AddField';
import PlaceholderComponent from '../Placeholder/Placeholder';
import {CommonPlaceholderProps} from '../PlaceholdersContainer';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = CommonPlaceholderProps & StateProps & DispatchProps;

class ShapesPlaceholder extends React.Component<Props> {
    render() {
        const {addFieldItems, visualization, shapes, wrapTo, datasetError, onBeforeRemoveItem} =
            this.props;
        const placeholders = visualization.placeholders;

        const hasSettings = Boolean(
            shapes.length ||
                (placeholders[1] &&
                    (placeholders[1].id === PlaceholderId.Y ||
                        placeholders[1].id === PlaceholderId.X) &&
                    placeholders[1].items.length),
        );

        const shapesContainsHierarchies = shapes.some(isFieldHierarchy);

        const disabledText = shapesContainsHierarchies
            ? i18n('wizard', 'label_no-shapes-setup-for-hierarchy')
            : undefined;

        const onActionIconClick = shapesContainsHierarchies
            ? undefined
            : () => this.openShapesDialog(getDialogItem(shapes, placeholders));

        return (
            <PlaceholderComponent
                key="shapes"
                id="shapes"
                qa="placeholder-shapes"
                iconProps={{data: Shapes4}}
                title="section_shapes"
                hasSettings={hasSettings}
                onActionIconClick={onActionIconClick}
                actionIconQa="shapes-action-icon"
                items={shapes}
                capacity={visualization.shapesCapacity}
                capacityError="label_shapes-overflow"
                capacityErrorQa={SectionVisualizationAddItemQa.ShapesOverflowErrorTooltip}
                checkAllowed={this.checkAllowedShapes}
                onUpdate={this.onUpdate}
                wrapTo={wrapTo}
                disabled={Boolean(datasetError)}
                onBeforeRemoveItem={onBeforeRemoveItem}
                disabledText={disabledText}
                addFieldItems={addFieldItems}
                onAfterUpdate={this.props.onUpdate}
            />
        );
    }

    private checkAllowedShapes = (item: AddableField) => {
        const {visualization, shapes} = this.props;
        return Boolean(
            visualization.checkAllowedShapes &&
                visualization.checkAllowedShapes({
                    item,
                    visualization,
                    designItems: shapes,
                }),
        );
    };

    private onUpdate = (items: Field[]) => {
        this.props.updateShapes({items});
        this.props.updatePreviewAndClientChartsConfig({});

        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    };

    private openShapesDialog = (item?: Field | Field[]) => {
        const {visualization} = this.props;
        const paletteType =
            visualization.id === WizardVisualizationId.Scatter ||
            visualization.id === WizardVisualizationId.ScatterD3
                ? PaletteTypes.Points
                : PaletteTypes.Lines;
        this.props.openDialogShapes({
            item,
            paletteType,
            onApply: () => {
                if (this.props.onUpdate) {
                    this.props.onUpdate();
                }
            },
        });
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            updateShapes,
            updatePreviewAndClientChartsConfig,
            openDialogShapes,
        },
        dispatch,
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        shapes: selectShapes(state),
        filters: selectFilters(state),
        dataset: selectDataset(state),
        shapesConfig: selectShapesConfig(state),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShapesPlaceholder);
