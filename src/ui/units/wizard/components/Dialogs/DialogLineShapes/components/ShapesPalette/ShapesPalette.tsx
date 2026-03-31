import React from 'react';

import block from 'bem-cn-lite';
import type {LineShapeType} from 'shared';
import {SHAPES_PALETTE_ORDER} from 'shared';
import {selectClientAvailableLineShapes} from 'ui';
import IconRenderer from 'ui/libs/DatalensChartkit/ChartKit/components/IconRenderer/IconRenderer';

import {i18n} from '../../i18n';
import type {ShapesState} from '../../types';

import './ShapesPalette.scss';

const DEFAULT_SHAPE = 'auto';

const b = block('dialog-line-shapes');

export const ShapesPalette = ({
    shapesState,
    onPaletteItemClick,
}: {
    onPaletteItemClick: (shape: string) => void;
    shapesState: ShapesState;
}) => {
    const {mountedShapes, selected: selectedValue} = shapesState;

    const options = React.useMemo(() => {
        const availableLineShapes = selectClientAvailableLineShapes();
        const sorted = availableLineShapes.sort(
            (shape1, shape2) => SHAPES_PALETTE_ORDER[shape1] - SHAPES_PALETTE_ORDER[shape2],
        );
        return sorted.map((item) => {
            const icon =
                item === DEFAULT_SHAPE ? (
                    i18n('label_auto')
                ) : (
                    <IconRenderer iconType={item as LineShapeType} width="100%" height="5px" />
                );
            return {
                content: <div className={b('palette-item-icon')}>{icon}</div>,
                value: item,
            };
        });
    }, []);

    const selected = React.useMemo(() => {
        if (selectedValue && mountedShapes[selectedValue]) {
            return mountedShapes[selectedValue];
        }

        return DEFAULT_SHAPE;
    }, [mountedShapes, selectedValue]);

    return (
        <div className={b('palette')}>
            {options.map((option) => (
                <div
                    key={option.value}
                    className={b('palette-item', {selected: option.value === selected})}
                    onClick={() => onPaletteItemClick(option.value)}
                    data-qa={option.value}
                >
                    {option.content}
                </div>
            ))}
        </div>
    );
};
