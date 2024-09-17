import React from 'react';

import {SquareLetterT} from '@gravity-ui/icons';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {Field} from 'shared';
import type {DatalensGlobalState} from 'ui';

import {updateTooltips} from '../../../../../actions/placeholder';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import {applyTooltipSettings, openTooltipSettingsDialog} from '../../../../../actions/tooltip';
import {selectTooltipConfig, selectTooltips} from '../../../../../selectors/visualization';
import PlaceholderComponent from '../Placeholder/Placeholder';
import type {CommonPlaceholderProps} from '../PlaceholdersContainer';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = CommonPlaceholderProps & StateProps & DispatchProps;

class TooltipsPlaceholder extends React.Component<Props> {
    render() {
        const {addFieldItems, tooltips, wrapTo, onBeforeRemoveItem, datasetError} = this.props;
        const hasSettings = tooltips?.length > 0;

        return (
            <PlaceholderComponent
                key="tooltips"
                id="tooltips"
                qa="placeholder-tooltips"
                iconProps={{data: SquareLetterT}}
                items={tooltips}
                checkAllowed={this.checkAllowedTooltips}
                onUpdate={this.onUpdate}
                title="section_tooltips"
                hasSettings={hasSettings}
                onActionIconClick={this.handleActionIconClick}
                wrapTo={wrapTo}
                onBeforeRemoveItem={onBeforeRemoveItem}
                disabled={Boolean(datasetError)}
                addFieldItems={addFieldItems}
                onAfterUpdate={this.props.onUpdate}
            />
        );
    }

    private handleActionIconClick = () => {
        const tooltipConfig = this.props.tooltipConfig;
        this.props.openTooltipSettingsDialog({
            tooltipConfig,
            onApply: (config) => {
                this.props.applyTooltipSettings(config);

                if (this.props.onUpdate) {
                    this.props.onUpdate();
                }
            },
        });
    };

    private onUpdate = (items: Field[]) => {
        this.props.updateTooltips({items});
        this.props.updatePreviewAndClientChartsConfig({});

        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    };

    private checkAllowedTooltips = (item: Field) => {
        const visualization = this.props.visualization as any;

        return Boolean(
            visualization.checkAllowedTooltips && visualization.checkAllowedTooltips(item),
        );
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            updateTooltips,
            updatePreviewAndClientChartsConfig,
            openTooltipSettingsDialog,
            applyTooltipSettings,
        },
        dispatch,
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        tooltips: selectTooltips(state),
        tooltipConfig: selectTooltipConfig(state),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TooltipsPlaceholder);
