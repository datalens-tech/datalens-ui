import React from 'react';

import {LayoutRows} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {DatalensGlobalState} from 'ui';

import type {Field} from '../../../../../../../../shared';
import {isDimensionField, isMarkupField} from '../../../../../../../../shared';
import {BetaMark} from '../../../../../../../components/BetaMark/BetaMark';
import {updateSegments} from '../../../../../actions/placeholder';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import {selectSegments} from '../../../../../selectors/visualization';
import PlaceholderComponent from '../Placeholder/Placeholder';
import type {CommonPlaceholderProps} from '../PlaceholdersContainer';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = CommonPlaceholderProps & StateProps & DispatchProps;

class SegmentsPlaceholder extends React.Component<Props> {
    render() {
        const {addFieldItems, wrapTo, datasetError, onBeforeRemoveItem, segments} = this.props;
        return (
            <PlaceholderComponent
                key="segments"
                id="segments"
                qa="placeholder-segments"
                iconProps={{data: LayoutRows}}
                title={() => {
                    return (
                        <>
                            <span style={{marginRight: 5}}>
                                {i18n('wizard', 'section_segments')}
                            </span>
                            <BetaMark />
                        </>
                    );
                }}
                items={segments}
                capacity={1}
                capacityError="label_segments-overflow"
                hasSettings={false}
                checkAllowed={this.handleCheckAllowed}
                onUpdate={this.handleUpdate}
                wrapTo={wrapTo}
                onBeforeRemoveItem={onBeforeRemoveItem}
                disabled={Boolean(datasetError)}
                addFieldItems={addFieldItems}
                onAfterUpdate={this.props.onUpdate}
            />
        );
    }

    handleCheckAllowed = (item: Field) => {
        return isDimensionField(item) && !isMarkupField(item);
    };

    handleUpdate = (segments: Field[]) => {
        this.props.actions.updateSegments({items: segments});
        this.props.actions.updatePreviewAndClientChartsConfig({});

        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                updateSegments,
                updatePreviewAndClientChartsConfig,
            },
            dispatch,
        ),
    };
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        segments: selectSegments(state),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SegmentsPlaceholder);
