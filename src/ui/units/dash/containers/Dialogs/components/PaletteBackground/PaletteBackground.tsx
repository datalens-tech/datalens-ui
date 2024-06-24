import React from 'react';

import {ChartColumn} from '@gravity-ui/icons';
import type {PaletteOption} from '@gravity-ui/uikit';
import {ActionTooltip, Icon, Palette, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import './PaletteBackground.scss';

const b = block('widget-palette-background');

export enum CustomPaletteColors {
    LIKE_CHART = 'like-chart-bg',
    NONE = 'transparent',
}

const PALETTE_HINTS = {
    [CustomPaletteColors.LIKE_CHART]: i18n('dash.palette-background', 'value_default'),
    [CustomPaletteColors.NONE]: i18n('dash.palette-background', 'value_transparent'),
} as const;

const ColorItem = ({
    color,
    isSelected,
    classNameMod,
    isPreview,
}: {
    color: string;
    classNameMod?: string;
    isSelected?: boolean;
    isPreview?: boolean;
}) => {
    const isTransparent = color === CustomPaletteColors.NONE;
    const isLikeChartBg = color === CustomPaletteColors.LIKE_CHART;
    const mod = classNameMod ? {[classNameMod]: Boolean(classNameMod)} : {};

    return (
        <span
            style={{backgroundColor: isLikeChartBg ? '' : `${color}`}}
            className={b('color-item', {
                transparent: isTransparent,
                selected: isSelected,
                'widget-bg': isLikeChartBg,
                ...mod,
            })}
        >
            {isLikeChartBg && <Icon data={ChartColumn} className={b('color-icon')} />}
            {!isPreview && color in PALETTE_HINTS && (
                <ActionTooltip title={PALETTE_HINTS[color as CustomPaletteColors]}>
                    <span className={b('tooltip-trigger')} />
                </ActionTooltip>
            )}
        </span>
    );
};

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
            content={<PaletteList onSelect={handleSelectColor} selectedColor={selectedColor} />}
        >
            <ColorItem
                color={selectedColor}
                isSelected={true}
                classNameMod={'small'}
                isPreview={true}
            />
        </Popover>
    );
};
