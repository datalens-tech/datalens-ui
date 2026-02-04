import React from 'react';

import type {RealTheme} from '@gravity-ui/uikit';
import {Button, Popup, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {DashCommonQa} from 'shared';
import {CustomPaletteBgColors} from 'shared/constants/widgets';

import {ColorItem} from '../ColorPalette/ColorItem/ColorItem';
import {ColorPalette} from '../ColorPalette/ColorPalette';

import './ColorPicker.scss';

const b = block('dl-color-picker');

type ColorPickerProps = {
    color?: string;
    onSelect: (color: string) => void;
    onBlur?: () => void;
    enableCustomColorSelector?: boolean;
    mainPresetOptions: string[];
    paletteOptions: string[];
    theme?: RealTheme;
    paletteColumns?: number;
};

export function ColorPicker({
    onSelect,
    onBlur,
    color,
    enableCustomColorSelector,
    mainPresetOptions,
    paletteOptions,
    theme,
    paletteColumns,
}: ColorPickerProps) {
    const [selectedColor, setSelectedColor] = React.useState<string>(
        color || CustomPaletteBgColors.NONE,
    );

    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const [openPopup, setOpenPopup] = React.useState(false);

    const handleClosePopup = React.useCallback(() => {
        setOpenPopup((prevOpen) => !prevOpen);

        onSelect(selectedColor);
    }, [onSelect, selectedColor]);

    const previewColorWithSlideTheme = selectedColor !== CustomPaletteBgColors.NONE;

    return (
        <div className={b()}>
            <Tooltip content={i18n('dash.palette-background', 'tooltip_click-to-select')}>
                <Button
                    className={b('palette-trigger')}
                    view="outlined"
                    ref={anchorRef}
                    onClick={handleClosePopup}
                >
                    <ColorItem
                        className={b('color-item')}
                        color={selectedColor}
                        qa={DashCommonQa.WidgetSelectBackgroundButton}
                        theme={previewColorWithSlideTheme ? theme : undefined}
                    />
                </Button>
            </Tooltip>
            <Popup
                open={openPopup}
                anchorElement={anchorRef.current}
                hasArrow
                onOpenChange={(open, _event, reason) => {
                    if (!open && reason === 'outside-press') {
                        handleClosePopup();
                    }
                }}
                className={b('popup')}
            >
                <ColorPalette
                    onSelect={setSelectedColor}
                    onBlur={onBlur}
                    selectedColor={selectedColor}
                    enableCustomBgColorSelector={enableCustomColorSelector}
                    mainPresetOptions={mainPresetOptions}
                    paletteOptions={paletteOptions}
                    theme={theme}
                    paletteColumns={paletteColumns}
                />
            </Popup>
        </div>
    );
}
