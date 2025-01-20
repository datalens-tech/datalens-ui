import React from 'react';

import {ChartColumn} from '@gravity-ui/icons';
import type {PaletteOption} from '@gravity-ui/uikit';
import {ActionTooltip, Button, Icon, Palette, Popup, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {ValueOf} from 'shared';
import {DashCommonQa} from 'shared';
import {ColorPicker} from 'ui/components/ColorPicker/ColorPicker';

import './PaletteBackground.scss';

const b = block('widget-palette-background');

export const CustomPaletteColors = {
    LIKE_CHART: 'like-chart-bg',
    NONE: 'transparent',
} as const;

type CustomPaletteColor = ValueOf<typeof CustomPaletteColors>;

function isCustomPaletteColor(color: string): color is CustomPaletteColor {
    return Object.keys(CustomPaletteColors).includes(color as CustomPaletteColor);
}

const PALETTE_HINTS = {
    [CustomPaletteColors.LIKE_CHART]: i18n('dash.palette-background', 'value_default'),
    [CustomPaletteColors.NONE]: i18n('dash.palette-background', 'value_transparent'),
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
    const isTransparent = color === CustomPaletteColors.NONE;
    const isLikeChartBg = color === CustomPaletteColors.LIKE_CHART;
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

const colors = [
    'var(--g-color-base-info-light)',
    'var(--g-color-base-info-light-hover)',
    'var(--g-color-base-positive-light)',
    'var(--g-color-base-positive-light-hover)',
    'var(--g-color-base-warning-light)',
    'var(--g-color-base-warning-light-hover)',
    'var(--g-color-base-danger-light)',
    'var(--g-color-base-danger-light-hover)',
    'var(--g-color-base-utility-light)',
    'var(--g-color-base-utility-light-hover)',
    'var(--g-color-base-misc-light)',
    'var(--g-color-base-misc-light-hover)',
    'var(--g-color-base-neutral-light)',
    'var(--g-color-base-neutral-light-hover)',
    'var(--g-color-base-info-medium)',
    'var(--g-color-base-info-medium-hover)',
    'var(--g-color-base-positive-medium)',
    'var(--g-color-base-positive-medium-hover)',
    'var(--g-color-base-warning-medium)',
    'var(--g-color-base-warning-medium-hover)',
    'var(--g-color-base-danger-medium)',
    'var(--g-color-base-danger-medium-hover)',
    'var(--g-color-base-utility-medium)',
    'var(--g-color-base-utility-medium-hover)',
    'var(--g-color-base-misc-medium)',
    'var(--g-color-base-misc-medium-hover)',
    'var(--g-color-base-neutral-medium)',
    'var(--g-color-base-neutral-medium-hover)',
    CustomPaletteColors.NONE,
    CustomPaletteColors.LIKE_CHART,
];

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
    const options: PaletteOption[] = colors.map((colorItem) => {
        return {
            content: <ColorItem color={colorItem} isSelected={colorItem === selectedColor} />,
            value: colorItem,
        };
    });

    return (
        <div className={b('palette-popup-content')}>
            <Palette
                columns={6}
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
                            [CustomPaletteColors.NONE, CustomPaletteColors.LIKE_CHART] as string[]
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
            ? CustomPaletteColors.NONE
            : props.color || CustomPaletteColors.NONE,
    );

    const [customColor, setCustomColor] = React.useState<string>(
        props.color?.startsWith('#') ? props.color : '',
    );
    const [customError, setCustomError] = React.useState<string | undefined>();

    const handleSelectColor = React.useCallback((val) => {
        setSelectedColor(val[0]);
        setCustomColor('');
    }, []);

    const anchorRef = React.useRef<HTMLElement>(null);
    const [openPopup, setOpenPopup] = React.useState(false);

    const handleClosePopup = React.useCallback(() => {
        setOpenPopup((prevOpen) => !prevOpen);

        if (!customError && customColor) {
            props.onSelect(customColor);
        } else {
            props.onSelect(selectedColor ?? props.color ?? CustomPaletteColors.NONE);
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
                        color={props.color || CustomPaletteColors.NONE}
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
                    onCustomColorUpdate={setCustomColor}
                    customError={customError}
                    setCustomError={setCustomError}
                />
            </Popup>
        </div>
    );
};
