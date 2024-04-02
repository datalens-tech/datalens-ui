import React, {ChangeEvent} from 'react';

import {BucketPaint} from '@gravity-ui/icons';
import {Button, Dialog, Icon, RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import {useDispatch, useSelector} from 'react-redux';
import {ColorMode, ColorsConfig, DEFAULT_PALETTE, Feature} from 'shared';
import {Utils} from 'ui';
import {fetchColorPalettes} from 'ui/store/actions/colorPaletteEditor';
import {selectColorPalettes} from 'ui/store/selectors/colorPaletteEditor';

import {ColorSettingsContainer} from './ColorSettingsContainer/ColorSettingsContainer';

import './DialogColor.scss';

const SHOW = 'show';
const HIDE = 'hide';

const b = block('dialog-color');

interface Props {
    colorsConfig: ColorsConfig;
    colorModes: ColorMode[];
    values: string[];
    loading?: boolean;
    onApply: (colorsConfig: ColorsConfig) => void;
    onClose: () => void;
    usePolygonBorders?: boolean;
}

function getColorMode(colorMode: ColorMode | undefined, modes: ColorMode[]) {
    if (typeof colorMode !== 'undefined' && modes.includes(colorMode)) {
        return colorMode;
    }
    return modes[0];
}

function getInitialConfig(args: {config: ColorsConfig; modes: ColorMode[]}) {
    const {config, modes} = args;
    const result = cloneDeep(config);
    result.colorMode = getColorMode(config.colorMode, modes);
    result.palette = config.palette || DEFAULT_PALETTE.id;

    return result;
}

export const DialogColor = (props: Props) => {
    const {onClose, onApply, colorsConfig, colorModes, values, loading, usePolygonBorders} = props;
    const [isValid, setIsValid] = React.useState<boolean>(true);

    const dispatch = useDispatch();
    const colorPalettes = useSelector(selectColorPalettes);
    const [updatedConfig, setUpdatedConfig] = React.useState<ColorsConfig>(
        getInitialConfig({config: colorsConfig, modes: colorModes}),
    );

    React.useEffect(() => {
        if (Utils.isEnabledFeature(Feature.CustomColorPalettes)) {
            dispatch(fetchColorPalettes());
        }
    }, [dispatch]);

    const updateConfig = (updates: Partial<ColorsConfig>) => {
        setUpdatedConfig({...updatedConfig, ...updates});
        // TODO: validate config
        setIsValid(true);
    };

    const handleChangeColorMode = (event: ChangeEvent<HTMLInputElement>) => {
        updateConfig({colorMode: event.target.value as ColorMode});
    };

    const handlePolygonBorders = (event: ChangeEvent<HTMLInputElement>) => {
        updateConfig({polygonBorders: event.target.value});
    };

    const applyChanges = () => {
        onApply(updatedConfig);
        onClose();
    };

    const resetChanges = () => {
        setUpdatedConfig(cloneDeep(colorsConfig));
    };

    return (
        <Dialog open={true} onClose={onClose} disableFocusTrap={true}>
            <div className={b({[`${updatedConfig.colorMode}-mode`]: true})}>
                <Dialog.Header
                    insertBefore={
                        <div className={b('title-icon')}>
                            <Icon data={BucketPaint} size={18} />
                        </div>
                    }
                    caption={i18n('wizard', 'label_colors-settings')}
                />
                <Dialog.Body className={b('body')}>
                    {colorModes.length > 1 && (
                        <div className={b('row')}>
                            <span className={b('label')}>{i18n('wizard', 'label_color-mode')}</span>
                            <RadioButton
                                size="m"
                                value={updatedConfig.colorMode}
                                onChange={handleChangeColorMode}
                            >
                                <RadioButton.Option value={ColorMode.PALETTE}>
                                    {i18n('wizard', 'label_palette')}
                                </RadioButton.Option>
                                <RadioButton.Option value={ColorMode.GRADIENT}>
                                    {i18n('wizard', 'label_gradient')}
                                </RadioButton.Option>
                            </RadioButton>
                        </div>
                    )}
                    {usePolygonBorders && (
                        <div className={b('row')}>
                            <span className={b('label')}>{i18n('wizard', 'label_borders')}</span>
                            <RadioButton
                                size="m"
                                value={colorsConfig.polygonBorders ? SHOW : HIDE}
                                onChange={handlePolygonBorders}
                            >
                                <RadioButton.Option value={SHOW}>
                                    {i18n('wizard', 'label_show')}
                                </RadioButton.Option>
                                <RadioButton.Option value={HIDE}>
                                    {i18n('wizard', 'label_hide')}
                                </RadioButton.Option>
                            </RadioButton>
                        </div>
                    )}
                    <ColorSettingsContainer
                        colorsConfig={updatedConfig}
                        onChange={updateConfig}
                        colorPalettes={colorPalettes}
                        values={values}
                        loading={loading}
                    />
                </Dialog.Body>
                <Dialog.Footer
                    preset="default"
                    onClickButtonCancel={onClose}
                    onClickButtonApply={applyChanges}
                    textButtonApply={i18n('wizard', 'button_apply')}
                    textButtonCancel={i18n('wizard', 'button_cancel')}
                    propsButtonApply={{
                        disabled: !isValid,
                        qa: 'color-dialog-apply-button',
                    }}
                >
                    <Button
                        view="outlined"
                        size="l"
                        disabled={!isEqual(colorsConfig, updatedConfig)}
                        onClick={resetChanges}
                    >
                        {i18n('wizard', 'button_reset')}
                    </Button>
                </Dialog.Footer>
            </div>
        </Dialog>
    );
};
