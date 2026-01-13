import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import type {PaletteOption, RealTheme} from '@gravity-ui/uikit';
import {ActionTooltip, Button, Icon, Palette} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {color as d3Color} from 'd3-color';
import {i18n} from 'i18n';
import {DashCommonQa} from 'shared';
import {
    BASE_GREY_BACKGROUND_COLOR,
    CustomPaletteBgColors,
    CustomPaletteTextColors,
} from 'shared/constants/widgets';
import {ColorPickerInput} from 'ui/components/ColorPickerInput/ColorPickerInput';

import {ColorItem} from './ColorItem/ColorItem';

import './ColorPalette.scss';

const b = block('dl-color-palette');

const PALETTE_HINTS = {
    [CustomPaletteBgColors.LIKE_CHART]: i18n('dash.palette-background', 'value_default'),
    [CustomPaletteBgColors.NONE]: i18n('dash.palette-background', 'value_transparent'),
    [BASE_GREY_BACKGROUND_COLOR]: i18n('dash.palette-background', 'value_base_gray'),
    'custom-btn': i18n('dash.palette-background', 'button_custom_value'),
} as const;

const COLORS_WITH_VISIBLE_BORDER: string[] = [
    CustomPaletteBgColors.NONE,
    CustomPaletteBgColors.LIKE_CHART,
    CustomPaletteTextColors.INVERTED_PRIMARY,
];

function colorStringToHex(color: string) {
    return d3Color(color)?.formatHex8() ?? '';
}

type ColorPaletteProps = {
    onSelect: (val: string) => void;
    onBlur?: () => void;
    selectedColor: string;
    enableCustomBgColorSelector?: boolean;
    mainPresetOptions: string[];
    paletteOptions: string[];
    theme?: RealTheme;
    paletteColumns?: number;
    showItemBorder?: boolean;
};

export function ColorPalette(props: ColorPaletteProps) {
    const {
        selectedColor,
        onSelect,
        onBlur,
        enableCustomBgColorSelector,
        mainPresetOptions,
        paletteOptions,
        theme,
        paletteColumns = 7,
        showItemBorder: externalShowItemBorder,
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

    const shouldShowItemBorder = React.useCallback(
        (colorItem: string) => {
            return (
                Boolean(externalShowItemBorder) || COLORS_WITH_VISIBLE_BORDER.includes(colorItem)
            );
        },
        [externalShowItemBorder],
    );

    const options: PaletteOption[] = React.useMemo(
        () =>
            paletteOptions.map((colorItem) => {
                const selected = colorItem === selectedColor;
                const showItemBorder = shouldShowItemBorder(colorItem);
                return {
                    content: (
                        <div
                            className={b('highlight-wrapper', {
                                selected,
                                'with-border': showItemBorder,
                            })}
                        >
                            <ColorItem
                                className={b('color-item')}
                                size="max"
                                color={colorItem}
                                ref={selected ? previewRef : undefined}
                                theme={theme}
                            />
                        </div>
                    ),
                    value: colorItem,
                };
            }),
        [paletteOptions, selectedColor, previewRef, theme, shouldShowItemBorder],
    );

    const handleSelectColor = React.useCallback(
        (val) => {
            onSelect(val[0] ?? '');
            setCustomColorInputEnabled(false);
        },
        [onSelect],
    );

    return (
        <div className={b()}>
            <div className={b('preset')}>
                {mainPresetOptions.map((colorItem) => {
                    const previewColorWithSlideTheme = colorItem !== CustomPaletteBgColors.NONE;
                    const selected = colorItem === selectedColor;
                    const showItemBorder = shouldShowItemBorder(colorItem);
                    const colorContent = (
                        <div
                            className={b('highlight-wrapper', {
                                selected,
                                'with-border': showItemBorder,
                            })}
                        >
                            <ColorItem
                                className={b('color-item')}
                                size="max"
                                color={colorItem}
                                ref={selected ? previewRef : undefined}
                                theme={previewColorWithSlideTheme ? theme : undefined}
                            />
                        </div>
                    );
                    return (
                        <Button
                            key={colorItem}
                            view="flat"
                            className={b('custom-palette-bg-btn')}
                            onClick={() => {
                                onSelect(colorItem);

                                setCustomColorInputEnabled(false);
                            }}
                        >
                            {colorItem in PALETTE_HINTS ? (
                                <ActionTooltip
                                    title={PALETTE_HINTS[colorItem as keyof typeof PALETTE_HINTS]}
                                >
                                    {colorContent}
                                </ActionTooltip>
                            ) : (
                                colorContent
                            )}
                        </Button>
                    );
                })}
                {enableCustomBgColorSelector && (
                    <div
                        className={b('highlight-wrapper', {
                            selected: customColorInputEnabled,
                            'with-border': true,
                        })}
                    >
                        <ActionTooltip title={PALETTE_HINTS['custom-btn']}>
                            <Button
                                view="flat"
                                className={b('custom-palette-bg-btn')}
                                onClick={() => setCustomColorInputEnabled(true)}
                            >
                                <Icon data={PencilToLine} size={16} />
                            </Button>
                        </ActionTooltip>
                    </div>
                )}
            </div>
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
                    onBlur={onBlur}
                    theme={theme}
                />
            )}
            <Palette
                className={b('palette')}
                columns={paletteColumns}
                options={options}
                onUpdate={handleSelectColor}
                multiple={false}
                optionClassName={b('palette-list-btn')}
                qa={DashCommonQa.WidgetSelectBackgroundPalleteContainer}
            />
        </div>
    );
}
