import React from 'react';

import {BucketPaint} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {CommonSharedExtraSettings} from 'shared';
import {PlaceholderActionQa} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {fetchColorPalettes} from 'ui/store/actions/colorPaletteEditor';
import {selectColorPalettes} from 'ui/store/selectors/colorPaletteEditor';

import {openDialogMetricColors} from '../../../../../actions/dialog';
import {selectExtraSettings} from '../../../../../selectors/widget';
import PlaceholderComponent from '../Placeholder/Placeholder';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type OwnProps = {
    onUpdate?: () => void;
};

type Props = StateProps & DispatchProps & OwnProps;

// TODO: convert to function component
class MetricColorsPlaceholder extends React.Component<Props> {
    componentDidMount() {
        if (!this.props.colorPalettes.length) {
            this.props.fetchColorPalettes();
        }
    }

    render() {
        return (
            <PlaceholderComponent
                key="metric-colors"
                qa="placeholder-metric-colors"
                id="metric-colors"
                iconProps={{data: BucketPaint}}
                title="section_colors"
                hasSettings={true}
                onActionIconClick={this.openDialogMetricColors}
                actionIconQa={PlaceholderActionQa.OpenColorDialogIcon}
                items={[]}
                checkAllowed={() => false}
                onUpdate={() => {}}
                wrapTo={() => null}
                disabled={false}
                addFieldDisableText={i18n('wizard', 'label_metric-colors-add-field-disabled')}
            />
        );
    }

    private openDialogMetricColors = () => {
        const {extraSettings, onUpdate} = this.props;

        this.props.openDialogMetricColors({
            extraSettings,
            onApply: onUpdate,
        });
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    const extraSettings = selectExtraSettings(state) as CommonSharedExtraSettings;

    return {
        extraSettings,
        colorPalettes: selectColorPalettes(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            openDialogMetricColors,
            fetchColorPalettes,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(MetricColorsPlaceholder);
