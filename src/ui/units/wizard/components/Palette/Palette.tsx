import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {LineShapeType, PointsShapeType} from 'shared';

import IconRenderer from '../../../../libs/DatalensChartkit/ChartKit/components/IconRenderer/IconRenderer';
import {PaletteTypes} from '../../constants';

import {PaletteItem} from './components/PaletteItem/PaletteItem';

import './Palette.scss';

const b = block('palette');

interface Props {
    paletteType: PaletteTypes;
    className?: string;
    itemClassName?: string;
    palette: string[];
    onPaletteItemClick: (color: string, index: number) => void;
    isSelectedItem: (item: string, index: number) => boolean;
    isDefaultItem?: (item: string) => boolean;
    customColor?: {
        enabled: boolean;
        selected: boolean;
        onSelect: () => void;
        qa?: string;
    };
}

export const Palette = (props: Props) => {
    const {
        palette,
        className,
        customColor,
        isSelectedItem,
        onPaletteItemClick,
        isDefaultItem,
        paletteType,
        itemClassName,
    } = props;

    const renderPaletteItem = (item: string, index: number) => {
        const isDefault = isDefaultItem?.(item);
        const isSelected = isSelectedItem(item, index);

        const paletteItemStyles: React.CSSProperties = {};
        let content;

        switch (paletteType) {
            case PaletteTypes.Colors: {
                paletteItemStyles.backgroundColor = isDefault ? item : undefined;
                content = isDefault ? 'auto' : null;
                break;
            }
            case PaletteTypes.Lines: {
                content = isDefault ? (
                    'auto'
                ) : (
                    <IconRenderer iconType={item as LineShapeType} width="80px" height="5px" />
                );
                break;
            }
            case PaletteTypes.Points: {
                content = isDefault ? (
                    'auto'
                ) : (
                    <IconRenderer iconType={item as PointsShapeType} width="20" />
                );
                break;
            }
            default:
                break;
        }

        return (
            <PaletteItem
                key={item}
                className={itemClassName}
                color={isDefault ? undefined : item}
                onClick={onPaletteItemClick.bind(null, item, index)}
                qa={item}
                isDefault={isDefault}
                isSelected={isSelected}
            >
                {content}
            </PaletteItem>
        );
    };

    return (
        <div className={b(null, className)}>
            {palette.map(renderPaletteItem)}
            {customColor?.enabled && (
                <PaletteItem
                    key={'custom-color'}
                    className={b('custom-color-btn', itemClassName)}
                    onClick={customColor.onSelect}
                    isSelected={customColor.selected}
                    qa={customColor.qa}
                >
                    <Button view="flat">
                        <Icon data={PencilToLine} />
                    </Button>
                </PaletteItem>
            )}
        </div>
    );
};

export default Palette;
