import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {ColorPalette} from 'shared';
import {
    DEFAULT_PALETTE,
    GradientType,
    ServiceSettingsQA,
    selectAvailableGradientsColors,
} from 'shared';
import {
    deleteColorPalette,
    fetchColorPalettes,
    openDeletePaletteConfirm,
    saveCurrentPalette,
    setCurrentColorPalette,
} from 'store/actions/colorPaletteEditor';
import {selectColorPalettes, selectCurrentColorPalette} from 'store/selectors/colorPaletteEditor';
import type {DatalensGlobalState} from 'ui';
import {selectDefaultClientGradient} from 'ui';

import ColorPalettesCard from './ColorPalettesCard/ColorPalettesCard';
import GradientColorPaletteEditor from './GradientPaletteEditor/GradientPaletteEditor';
import ColorPaletteEditor from './PaletteEditor/PaletteEditor';

import './ColorPaletteEditorContainer.scss';

const IS_FAVORITES_ENABLED = false;

const b = block('color-palette-editor-container');

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type ColorPaletteEditorProps = StateProps &
    DispatchProps & {
        condensed?: boolean;
        hasEditRights?: boolean;
    };

class ColorPaletteEditorContainer extends React.Component<ColorPaletteEditorProps> {
    componentDidMount() {
        this.props.fetchColorPalettes();
    }

    componentWillUnmount() {
        this.props.setCurrentColorPalette(undefined);
    }

    render() {
        const {colorPalettes, condensed, hasEditRights = true} = this.props;

        return (
            <div className={b()}>
                <ColorPalettesCard
                    isFavoritesEnabled={IS_FAVORITES_ENABLED}
                    title={i18n('component.color-palette-editor', 'label_gradient-palette-title')}
                    description={i18n(
                        'component.color-palette-editor',
                        'label_gradient-palette-description',
                    )}
                    handleCreateColorPalette={this.handleCreateGradientColorPalette}
                    handleItemClick={this.handleItemClick}
                    handleRemoveColorPaletteClick={this.handlDeleteColorPalette}
                    className={b('color-palettes-card')}
                    colorPalettes={colorPalettes.filter((item) => item.isGradient)}
                    condensed={condensed}
                    hasEditRights={hasEditRights}
                />
                <ColorPalettesCard
                    isFavoritesEnabled={IS_FAVORITES_ENABLED}
                    title={i18n('component.color-palette-editor', 'label_palette-title')}
                    description={i18n(
                        'component.color-palette-editor',
                        'label_palette-description',
                    )}
                    handleCreateColorPalette={this.handleCreateColorPalette}
                    handleItemClick={this.handleItemClick}
                    handleRemoveColorPaletteClick={this.handlDeleteColorPalette}
                    className={b('color-palettes-card')}
                    colorPalettes={colorPalettes.filter((item) => !item.isGradient)}
                    condensed={condensed}
                    qa={ServiceSettingsQA.ColorPalettes}
                    hasEditRights={hasEditRights}
                />
                <ColorPaletteEditor
                    isFavoritesEnabled={IS_FAVORITES_ENABLED}
                    hasEditRights={hasEditRights}
                />
                <GradientColorPaletteEditor
                    isFavoritesEnabled={IS_FAVORITES_ENABLED}
                    hasEditRights={hasEditRights}
                />
            </div>
        );
    }

    private handleCreateGradientColorPalette = () => {
        const gradientId = selectDefaultClientGradient(GradientType.TWO_POINT);

        const colors = selectAvailableGradientsColors(GradientType.TWO_POINT, gradientId);

        const newGradientColorPalette: ColorPalette = {
            colorPaletteId: '',
            displayName: '',
            colors,
            isGradient: true,
            isDefault: false,
        };

        this.props.setCurrentColorPalette(newGradientColorPalette);
    };

    private handleCreateColorPalette = () => {
        const colors = DEFAULT_PALETTE.scheme;

        const colorPalette: ColorPalette = {
            colorPaletteId: '',
            displayName: '',
            colors,
            isGradient: false,
            isDefault: false,
        };

        this.props.setCurrentColorPalette(colorPalette);
    };

    private handleItemClick = (colorPalette: ColorPalette) => {
        this.props.setCurrentColorPalette(colorPalette);
    };

    private handlDeleteColorPalette = (colorPalette: ColorPalette) => {
        this.props.openDeletePaletteConfirm({
            onApply: () => {
                this.props.deleteColorPalette(colorPalette);
            },
        });
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        currentColorPalette: selectCurrentColorPalette(state),
        colorPalettes: selectColorPalettes(state),
    };
};

const mapDispatchToProps = {
    fetchColorPalettes,
    setCurrentColorPalette,
    saveCurrentPalette,
    deleteColorPalette,
    openDeletePaletteConfirm,
};

export default connect(mapStateToProps, mapDispatchToProps)(ColorPaletteEditorContainer);
