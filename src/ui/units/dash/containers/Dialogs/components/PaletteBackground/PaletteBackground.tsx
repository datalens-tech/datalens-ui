import React from 'react';

import {ChartColumn} from '@gravity-ui/icons';
import type {PaletteOption} from '@gravity-ui/uikit';
import {ActionTooltip, Button, Icon, Palette, Popup, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {DashCommonQa} from 'shared';
import {ColorPicker} from 'ui/components/ColorPicker/ColorPicker';
import {
    CustomPaletteBgColors,
    WIDGET_BG_COLORS_PRESET,
    isCustomPaletteColor,
} from 'ui/constants/widgets';

import './PaletteBackground.scss';

const b = block('widget-palette-background');

/** @deprecated  */
export const CustomPaletteColors = CustomPaletteBgColors;

const PALETTE_HINTS = {
    [CustomPaletteBgColors.LIKE_CHART]: i18n('dash.palette-background', 'value_default'),
    [CustomPaletteBgColors.NONE]: i18n('dash.palette-background', 'value_transparent'),
} as const;

const ColorItem = React.forwardRef(function ColorItem(
    {
        color,
        isSelected,
        classNameMod,
        isPreview,
        qa,
    }: {
        color: string;
        classNameMod?: string;
        isSelected?: boolean;
        isPreview?: boolean;
        qa?: string;
    },
    ref: React.ForwardedRef<HTMLSpanElement>,
) {
    const isTransparent = color === CustomPaletteBgColors.NONE;
    const isLikeChartBg = color === CustomPaletteBgColors.LIKE_CHART;
    const mod = classNameMod ? {[classNameMod]: Boolean(classNameMod)} : {};

    return (
        <span
            ref={ref}
            style={{backgroundColor: isLikeChartBg || isTransparent ? '' : `${color}`}}
            className={b('color-item', {
                transparent: isTransparent,
                selected: isSelected,
                'widget-bg': isLikeChartBg,
                ...mod,
            })}
            data-qa={qa}
        >
            {isLikeChartBg && <Icon data={ChartColumn} className={b('color-icon')} />}
            {!isPreview && isCustomPaletteColor(color) && (
                <ActionTooltip title={PALETTE_HINTS[color]}>
                    <span className={b('tooltip-trigger')} />
                </ActionTooltip>
            )}
        </span>
    );
});

type PaleteListProps = {
    onSelect: (val: string[]) => void;
    selectedColor?: string;
    enableCustomBgColorSelector?: boolean;

    customColor?: string;
    onCustomColorUpdate: (color: string) => void;
    customError?: string;
    setCustomError?: (error: string | undefined) => void;
};

const PaletteList = (props: PaleteListProps) => {
    const {selectedColor, onSelect, customColor, onCustomColorUpdate, customError, setCustomError} =
        props;
    const options: PaletteOption[] = WIDGET_BG_COLORS_PRESET.map((colorItem) => {
        return {
            content: <ColorItem color={colorItem} isSelected={colorItem === selectedColor} />,
            value: colorItem,
        };
    });

    return (
        <div className={b('palette-popup-content')}>
            <Palette
                columns={7}
                options={options}
                onUpdate={onSelect}
                multiple={false}
                optionClassName={b('palette-list-btn')}
                qa={DashCommonQa.WidgetSelectBackgroundPalleteContainer}
            />
            {props.enableCustomBgColorSelector && (
                <ColorPicker
                    color={customColor}
                    onColorUpdate={onCustomColorUpdate}
                    error={customError}
                    setError={setCustomError}
                    className={b('color-picker')}
                    selectedPresetColor={
                        !selectedColor ||
                        (
                            [
                                CustomPaletteBgColors.NONE,
                                CustomPaletteBgColors.LIKE_CHART,
                            ] as string[]
                        ).includes(selectedColor)
                            ? undefined
                            : selectedColor
                    }
                />
            )}
        </div>
    );
};

type PaletteBackgroundProps = {
    color?: string;
    onSelect: (color: string) => void;
    enableCustomBgColorSelector?: boolean;
};

export const PaletteBackground = (props: PaletteBackgroundProps) => {
    const [selectedColor, setSelectedColor] = React.useState<string | undefined>(
        props.color?.startsWith('#')
            ? CustomPaletteBgColors.NONE
            : props.color || CustomPaletteBgColors.NONE,
    );

    const [customColor, setCustomColor] = React.useState<string>(
        props.color?.startsWith('#') ? props.color : '',
    );
    const [customError, setCustomError] = React.useState<string | undefined>();

    const handleSelectColor = React.useCallback((val) => {
        setSelectedColor(val[0]);
        setCustomColor('');
    }, []);

    const handleCustomColorChange = React.useCallback((newColor: string) => {
        setCustomColor(newColor);
        setSelectedColor(undefined);
    }, []);

    const anchorRef = React.useRef<HTMLElement>(null);
    const [openPopup, setOpenPopup] = React.useState(false);

    const handleClosePopup = React.useCallback(() => {
        setOpenPopup((prevOpen) => !prevOpen);

        if (!customError && customColor) {
            props.onSelect(customColor);
        } else {
            props.onSelect(selectedColor ?? props.color ?? CustomPaletteBgColors.NONE);
        }
    }, [customColor, customError, props, selectedColor]);

    return (
        <div className={b()}>
            <Tooltip content={i18n('dash.palette-background', 'tooltip_click-to-select')}>
                <Button
                    className={b('palette-trigger')}
                    view="flat"
                    ref={anchorRef}
                    onClick={handleClosePopup}
                >
                    <ColorItem
                        color={
                            (customError || customColor.length <= 1 ? undefined : customColor) ||
                            selectedColor ||
                            props.color ||
                            CustomPaletteBgColors.NONE
                        }
                        isPreview={true}
                        qa={DashCommonQa.WidgetSelectBackgroundButton}
                    />
                </Button>
            </Tooltip>
            <Popup
                open={openPopup}
                anchorRef={anchorRef}
                hasArrow
                onOutsideClick={handleClosePopup}
            >
                <PaletteList
                    onSelect={handleSelectColor}
                    selectedColor={selectedColor}
                    enableCustomBgColorSelector={props.enableCustomBgColorSelector}
                    customColor={customColor}
                    onCustomColorUpdate={handleCustomColorChange}
                    customError={customError}
                    setCustomError={setCustomError}
                />
            </Popup>
        </div>
    );
};
