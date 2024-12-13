import React from 'react';

import {ChartColumn} from '@gravity-ui/icons';
import type {PaletteOption} from '@gravity-ui/uikit';
import {ActionTooltip, Icon, Palette, Popover, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {ValueOf} from 'shared';
import {DashCommonQa} from 'shared';

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

const PaletteList = (props: {onSelect: (val: string[]) => void; selectedColor: string}) => {
    const options: PaletteOption[] = colors.map((colorItem) => {
        return {
            content: <ColorItem color={colorItem} isSelected={colorItem === props.selectedColor} />,
            value: colorItem,
        };
    });

    return (
        <Palette
            columns={6}
            options={options}
            onUpdate={props.onSelect}
            multiple={false}
            optionClassName={b('palette-list-btn')}
            qa={DashCommonQa.WidgetSelectBackgroundPalleteContainer}
        />
    );
};

type PaletteBackgroundProps = {
    color?: string;
    onSelect: (color: string) => void;
};

export const PaletteBackground = (props: PaletteBackgroundProps) => {
    const [selectedColor, setSelectedColor] = React.useState(
        props.color || CustomPaletteColors.NONE,
    );

    const handleSelectColor = React.useCallback(
        (val) => {
            setSelectedColor(val[0]);
            props.onSelect(val[0]);
        },
        [props],
    );

    return (
        <Popover
            className={b()}
            openOnHover={false}
            content={<PaletteList onSelect={handleSelectColor} selectedColor={selectedColor} />}
        >
            <Tooltip content={i18n('dash.palette-background', 'tooltip_click-to-select')}>
                <ColorItem
                    color={selectedColor}
                    isPreview={true}
                    qa={DashCommonQa.WidgetSelectBackgroundButton}
                />
            </Tooltip>
        </Popover>
    );
};
