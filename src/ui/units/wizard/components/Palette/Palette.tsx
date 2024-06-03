import React from 'react';

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
}

class Palette extends React.Component<Props> {
    render() {
        const {palette, className} = this.props;
        return <div className={b(null, className)}>{palette.map(this.renderPaletteItem)}</div>;
    }

    renderPaletteItem = (item: string, index: number) => {
        const {isSelectedItem, onPaletteItemClick, isDefaultItem, paletteType, itemClassName} =
            this.props;

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
}

export default Palette;
