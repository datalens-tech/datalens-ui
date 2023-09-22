import React from 'react';

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {ColorsConfig, Feature, Field} from 'shared';
import {fetchColorPalettes} from 'store/actions/colorPaletteEditor';
import {selectColorPalettes} from 'store/selectors/colorPaletteEditor';
import {DatalensGlobalState, Utils} from 'ui';
import {
    GradientState,
    PaletteState,
    prepareDialogColorState,
    resetDialogColorState,
    setDialogColorGradientState,
    setDialogColorPaletteState,
} from 'units/wizard/actions/dialogColor';
import {selectDataset, selectParameters} from 'units/wizard/selectors/dataset';
import {selectUpdates} from 'units/wizard/selectors/preview';
import {
    selectDashboardParameters,
    selectDistincts,
    selectFilters,
} from 'units/wizard/selectors/visualization';

import {
    selectClientPaletteColors,
    selectDialogColorGradientState,
    selectDialogColorPaletteState,
} from '../../../../selectors/dialogColor';
import {ExtraSettings} from '../DialogColor';
import DialogColorGradientBody from '../DialogColorGradient/DialogColorGradient';
import DialogColorPalette, {DEFAULT_COLOR} from '../DialogColorPalette/DialogColorPalette';

type OwnProps = {
    colorsConfig: ColorsConfig | undefined;
    item: Field;
    items?: Field[];
    extra?: ExtraSettings;
    isGradient: boolean;
};

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface Props extends OwnProps, StateProps, DispatchProps {}

class ColorSettingsContainer extends React.Component<Props> {
    componentDidMount() {
        const {colorsConfig, items} = this.props;

        this.props.actions.prepareDialogColorState({colorsConfig, items});

        if (Utils.isEnabledFeature(Feature.CustomColorPalettes)) {
            this.props.actions.fetchColorPalettes();
        }
    }

    componentWillUnmount() {
        this.props.actions.resetDialogColorState();
    }

    render() {
        const {isGradient} = this.props;

        if (isGradient) {
            return this.renderGradientBody();
        }

        return this.renderPaletteBody();
    }

    private renderPaletteBody = () => {
        return (
            <DialogColorPalette
                onPaletteItemClick={this.onPaletteItemClick}
                paletteState={this.props.paletteState}
                setPaletteState={(paletteState: Partial<PaletteState>) => {
                    this.props.actions.setDialogColorPaletteState({
                        ...this.props.paletteState,
                        ...paletteState,
                    });
                }}
                parameters={this.props.parameters}
                dashboardParameters={this.props.dashboardParameters}
                extra={this.props.extra || {}}
                items={this.props.items}
                distincts={this.props.distincts}
                item={this.props.item}
                datasetId={this.props.dataset!.id}
                options={this.props.dataset!.options}
                updates={this.props.updates}
                filters={this.props.filters}
                colorPalettes={this.props.colorPalettes}
                colorsList={this.props.colorsList}
            />
        );
    };

    private renderGradientBody = () => {
        return (
            <DialogColorGradientBody
                {...this.props}
                gradientState={this.props.gradientState}
                setGradientState={(gradientState: Partial<GradientState>) => {
                    this.props.actions.setDialogColorGradientState({
                        ...this.props.gradientState,
                        ...gradientState,
                    });
                }}
            />
        );
    };

    private onPaletteItemClick = (_color: string, colorIndex: number) => {
        const {selectedValue} = this.props.paletteState;
        const {colorsList} = this.props;

        if (!selectedValue) {
            return;
        }

        const mountedColors = {...this.props.paletteState.mountedColors};
        const isDefaultColor = !colorsList[colorIndex] || colorsList[colorIndex] === 'auto';

        if (mountedColors[selectedValue] && isDefaultColor) {
            delete mountedColors[selectedValue];
            this.props.actions.setDialogColorPaletteState({
                ...this.props.paletteState,
                mountedColors,
            });
        } else if (mountedColors[selectedValue] !== String(colorIndex) && !isDefaultColor) {
            mountedColors[selectedValue] = String(colorIndex);
            this.props.actions.setDialogColorPaletteState({
                ...this.props.paletteState,
                mountedColors,
            });
        }
    };
}

const mapStateToProps = (state: DatalensGlobalState, ownProps: OwnProps) => {
    return {
        parameters: selectParameters(state),
        updates: selectUpdates(state),
        filters: selectFilters(state),
        dashboardParameters: selectDashboardParameters(state),
        dataset: selectDataset(state),
        distincts: selectDistincts(state),
        paletteState: selectDialogColorPaletteState(state),
        gradientState: selectDialogColorGradientState(state),
        colorPalettes: selectColorPalettes(state).filter(
            (item) => item.isGradient === ownProps.isGradient,
        ),
        colorsList: selectClientPaletteColors(state).concat([DEFAULT_COLOR]),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                setDialogColorPaletteState,
                setDialogColorGradientState,
                resetDialogColorState,
                prepareDialogColorState,
                fetchColorPalettes,
            },
            dispatch,
        ),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ColorSettingsContainer);
