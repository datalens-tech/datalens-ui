import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import type {PaletteOption} from '@gravity-ui/uikit';
import {ActionTooltip, Button, Flex, Icon, Palette, Popup, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {color as d3Color} from 'd3-color';
import {i18n} from 'i18n';
import {DashCommonQa} from 'shared';
import {ColorPickerInput} from 'ui/components/ColorPickerInput/ColorPickerInput';
import {CustomPaletteBgColors, isCustomPaletteBgColor} from 'ui/constants/widgets';

import './ColorPalette.scss';

const b = block('widget-color-palette');

const PALETTE_HINTS = {
    [CustomPaletteBgColors.LIKE_CHART]: i18n('dash.palette-background', 'value_default'),
    [CustomPaletteBgColors.NONE]: i18n('dash.palette-background', 'value_transparent'),
} as const;

function colorStringToHex(color: string) {
    return d3Color(color)?.formatHex() ?? '';
}

const ColorItem = React.forwardRef(function ColorItemWithRef(
    {
        color,
        isSelected,
        classNameMod,
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
        ></span>
    );
});

type PaleteListProps = {
    onSelect: (val: string) => void;
    selectedColor: string;
    enableCustomBgColorSelector?: boolean;
    mainPresetOptions: string[];
    paletteOptions: string[];
};

function PaletteList(props: PaleteListProps) {
    const {
        selectedColor,
        onSelect,
        enableCustomBgColorSelector,
        mainPresetOptions,
        paletteOptions,
    } = props;

    const [customColorInputEnabled, setCustomColorInputEnabled] = React.useState(
        selectedColor.startsWith('#'),
    );

    const previewRef = React.useCallback<React.RefCallback<HTMLDivElement>>(
        (previewEl) => {
            if (previewEl && customColorInputEnabled && !selectedColor.startsWith('#')) {
                const bgColor = getComputedStyle(previewEl).backgroundColor;
                onSelect(colorStringToHex(bgColor));
            }
        },
        [customColorInputEnabled, onSelect, selectedColor],
    );

    const options: PaletteOption[] = paletteOptions.map((colorItem) => {
        const selected = colorItem === selectedColor;
        return {
            content: (
                <div className={b('highlight-wrapper', {selected})}>
                    <ColorItem
                        color={colorItem}
                        isSelected={selected}
                        ref={selected ? previewRef : undefined}
                    />
                </div>
            ),
            value: colorItem,
        };
    });

    const handleSelectColor = React.useCallback(
        (val) => {
            onSelect(val[0] ?? '');
            setCustomColorInputEnabled(false);
        },
        [onSelect],
    );

    return (
        <div className={b('palette-list')}>
            <Flex gap={2} className={b('preset')}>
                {mainPresetOptions.map((colorItem) => {
                    const selected = colorItem === selectedColor;
                    return (
                        <div key={colorItem} className={b('highlight-wrapper', {selected})}>
                            <Button
                                className={b('custom-palette-bg-btn', {
                                    'with-border': isCustomPaletteBgColor(colorItem),
                                })}
                                onClick={() => {
                                    onSelect(colorItem);

                                    setCustomColorInputEnabled(false);
                                }}
                            >
                                <ColorItem
                                    color={colorItem}
                                    isSelected={selected}
                                    ref={selected ? previewRef : undefined}
                                />
                                {isCustomPaletteBgColor(colorItem) && (
                                    <ActionTooltip title={PALETTE_HINTS[colorItem]}>
                                        <span className={b('tooltip-trigger')} />
                                    </ActionTooltip>
                                )}
                            </Button>
                        </div>
                    );
                })}
                {enableCustomBgColorSelector && (
                    <div
                        className={b('highlight-wrapper', {
                            selected: customColorInputEnabled,
                        })}
                    >
                        <Button
                            view="flat"
                            className={b('custom-palette-bg-btn', {'with-border': true})}
                            onClick={() => setCustomColorInputEnabled(true)}
                        >
                            <Icon data={PencilToLine} size={16} />
                        </Button>
                    </div>
                )}
            </Flex>
            {enableCustomBgColorSelector && customColorInputEnabled && (
                <ColorPickerInput
                    className={b('color-picker')}
                    hasOpacityInput
                    value={selectedColor?.startsWith('#') ? selectedColor : ''}
                    onUpdate={(val) => {
                        if (val) {
                            onSelect(val);
                        }
                    }}
                />
            )}
            <Palette
                className={b('palette')}
                columns={7}
                options={options}
                onUpdate={handleSelectColor}
                multiple={false}
                optionClassName={b('palette-list-btn')}
                qa={DashCommonQa.WidgetSelectBackgroundPalleteContainer}
            />
        </div>
    );
}

type ColorPaletteProps = {
    color?: string;
    onSelect: (color: string) => void;
    enableCustomBgColorSelector?: boolean;
    mainPresetOptions: string[];
    paletteOptions: string[];
};

export function ColorPalette({
    onSelect,
    color,
    enableCustomBgColorSelector,
    mainPresetOptions,
    paletteOptions,
}: ColorPaletteProps) {
    const [selectedColor, setSelectedColor] = React.useState<string>(
        color || CustomPaletteBgColors.NONE,
    );

    const anchorRef = React.useRef<HTMLElement>(null);
    const [openPopup, setOpenPopup] = React.useState(false);

    const handleClosePopup = React.useCallback(() => {
        setOpenPopup((prevOpen) => !prevOpen);

        onSelect(selectedColor);
    }, [onSelect, selectedColor]);

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
                        color={selectedColor}
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
                className={b('popup')}
            >
                <PaletteList
                    onSelect={setSelectedColor}
                    selectedColor={selectedColor}
                    enableCustomBgColorSelector={enableCustomBgColorSelector}
                    mainPresetOptions={mainPresetOptions}
                    paletteOptions={paletteOptions}
                />
            </Popup>
        </div>
    );
}
