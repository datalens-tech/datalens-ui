import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import type {PaletteOption, RealTheme} from '@gravity-ui/uikit';
import {
    ActionTooltip,
    Button,
    Flex,
    Icon,
    Palette,
    Popup,
    ThemeProvider,
    Tooltip,
} from '@gravity-ui/uikit';
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

import './ColorPalette.scss';

const b = block('widget-color-palette');

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

const ColorItem = React.forwardRef(function ColorItemWithRef(
    {
        color,
        isSelected,
        classNameMod,
        theme,
        qa,
    }: {
        color: string;
        classNameMod?: string;
        isSelected?: boolean;
        isPreview?: boolean;
        theme?: RealTheme;
        qa?: string;
    },
    ref: React.ForwardedRef<HTMLSpanElement>,
) {
    const isTransparent = color === CustomPaletteBgColors.NONE;
    const isLikeChartBg = color === CustomPaletteBgColors.LIKE_CHART;
    const mod = classNameMod ? {[classNameMod]: Boolean(classNameMod)} : {};

    const itemContent = (
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

    return theme ? (
        <ThemeProvider theme={theme} scoped rootClassName={b('theme')}>
            {itemContent}
        </ThemeProvider>
    ) : (
        itemContent
    );
});

type PaleteListProps = {
    onSelect: (val: string) => void;
    selectedColor: string;
    enableCustomBgColorSelector?: boolean;
    mainPresetOptions: string[];
    paletteOptions: string[];
    theme?: RealTheme;
    paletteColumns?: number;
};

function PaletteList(props: PaleteListProps) {
    const {
        selectedColor,
        onSelect,
        enableCustomBgColorSelector,
        mainPresetOptions,
        paletteOptions,
        theme,
        paletteColumns = 7,
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
        const showItemBorder = COLORS_WITH_VISIBLE_BORDER.includes(colorItem);
        return {
            content: (
                <div
                    className={b('highlight-wrapper', {
                        selected,
                        'with-border': showItemBorder,
                    })}
                >
                    <ColorItem
                        color={colorItem}
                        isSelected={selected}
                        ref={selected ? previewRef : undefined}
                        theme={theme}
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
                    const previewColorWithSlideTheme = colorItem !== CustomPaletteBgColors.NONE;
                    const selected = colorItem === selectedColor;
                    const showItemBorder = COLORS_WITH_VISIBLE_BORDER.includes(colorItem);
                    const colorContent = (
                        <div
                            className={b('highlight-wrapper', {
                                selected,
                                'with-border': showItemBorder,
                            })}
                        >
                            <ColorItem
                                color={colorItem}
                                isSelected={selected}
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

type ColorPaletteProps = {
    color?: string;
    onSelect: (color: string) => void;
    enableCustomColorSelector?: boolean;
    mainPresetOptions: string[];
    paletteOptions: string[];
    theme?: RealTheme;
    paletteColumns?: number;
};

export function ColorPalette({
    onSelect,
    color,
    enableCustomColorSelector,
    mainPresetOptions,
    paletteOptions,
    theme,
    paletteColumns,
}: ColorPaletteProps) {
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
                        color={selectedColor}
                        isPreview={true}
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
                <PaletteList
                    onSelect={setSelectedColor}
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
