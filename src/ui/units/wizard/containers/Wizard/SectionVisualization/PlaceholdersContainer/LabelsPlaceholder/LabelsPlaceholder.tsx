import React from 'react';

import {Font} from '@gravity-ui/icons';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {Field, WizardVisualizationId} from 'shared';
import {
    DATASET_FIELD_TYPES,
    SectionVisualizationAddItemQa,
    VISUALIZATIONS_WITH_LABELS,
} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {openDialogLabelSettings} from 'ui/units/wizard/actions/dialog';
import {updateLabels} from 'units/wizard/actions/placeholder';
import {selectLabels} from 'units/wizard/selectors/visualization';

import {transformVisualizationItem} from '../../../../../actions';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import {prepareFieldToMeasureTransformation} from '../../../../../utils/visualization';
import PlaceholderComponent from '../Placeholder/Placeholder';
import type {CommonPlaceholderProps} from '../PlaceholdersContainer';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = CommonPlaceholderProps & StateProps & DispatchProps & {qlMode?: boolean};

const LABELS_CAPACITY = 1;

class LabelsPlaceholder extends React.Component<Props> {
    render() {
        const {addFieldItems, labels, wrapTo, datasetError, onBeforeRemoveItem, visualization} =
            this.props;
        const hasSettings = VISUALIZATIONS_WITH_LABELS.has(visualization.id);

        return (
            <PlaceholderComponent
                key="labels"
                id="labels"
                hasSettings={hasSettings}
                onActionIconClick={this.openDialogLabelSettings}
                actionIconQa="placeholder-labels-action-icon"
                iconProps={{data: Font}}
                items={labels}
                capacity={LABELS_CAPACITY}
                capacityError="label_labels-overflow"
                capacityErrorQa={SectionVisualizationAddItemQa.LabelsOverflowErrorTooltip}
                checkAllowed={this.checkAllowedLabels}
                onUpdate={this.onLabelsUpdate}
                title="section_labels"
                qa="placeholder-labels"
                wrapTo={wrapTo}
                disabled={Boolean(datasetError)}
                onBeforeRemoveItem={onBeforeRemoveItem}
                addFieldItems={addFieldItems}
                onAfterUpdate={this.props.onUpdate}
                {...(this.props.qlMode ? {} : {transform: this.transformLabelItems})}
            />
        );
    }

    private openDialogLabelSettings = () => {
        const {visualization} = this.props;
        this.props.openDialogLabelSettings({
            visualizationId: visualization.id as WizardVisualizationId,
        });
    };

    private checkAllowedLabels = (item: Field) => {
        const {visualization} = this.props;

        if (item.data_type === DATASET_FIELD_TYPES.HIERARCHY) {
            return false;
        }

        if (!visualization) {
            return false;
        }

        return (visualization as any).checkAllowedLabels?.(item);
    };

    private onLabelsUpdate = (items: Field[]) => {
        this.props.updateLabels({items});
        this.props.updatePreviewAndClientChartsConfig({});

        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    };

    private transformLabelItems = (item: Field, action?: 'replace') => {
        const needUpdate = action === 'replace';
        return this.props.transformVisualizationItem({
            transformField: prepareFieldToMeasureTransformation,
            item,
            needUpdate,
        }) as unknown as Promise<Field>;
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        labels: selectLabels(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            updateLabels,
            updatePreviewAndClientChartsConfig,
            transformVisualizationItem,
            openDialogLabelSettings,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(LabelsPlaceholder);
