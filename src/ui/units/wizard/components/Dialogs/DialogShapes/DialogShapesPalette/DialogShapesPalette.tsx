import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {POINT_SHAPES_IN_ORDER, SHAPES_PALETTE_ORDER} from 'shared';
import {selectClientAvailableLineShapes} from 'ui';

import {PaletteTypes} from '../../../../constants';
import Palette from '../../../Palette/Palette';
import type {ShapesState} from '../DialogShapes';

import './DialogShapesPalette.scss';

type Props = {
    onPaletteItemClick: (shape: string) => void;
    shapesState: ShapesState;
    paletteType: PaletteTypes;
};

const DEFAULT_SHAPE = 'auto';

const b = block('dialog-shapes-palette');

const DialogShapesPalette: React.FC<Props> = ({
    shapesState,
    onPaletteItemClick,
    paletteType,
}: Props) => {
    const {mountedShapes, selectedValue} = shapesState;

    // CHARTS-10226: duplication
    const palette = React.useMemo(() => {
        if (paletteType === PaletteTypes.Points) {
            return [...POINT_SHAPES_IN_ORDER, 'auto'];
        }

        const availableLineShapes = selectClientAvailableLineShapes();
        return availableLineShapes.sort(
            (shape1, shape2) => SHAPES_PALETTE_ORDER[shape1] - SHAPES_PALETTE_ORDER[shape2],
        );
    }, [paletteType]);

    const isDefaultItem = React.useCallback(
        (shape: string) => shape === DEFAULT_SHAPE || !shape,
        [],
    );
    const isSelectedItem = React.useCallback(
        (shape: string) => {
            let shapeValue;
            if (selectedValue && mountedShapes[selectedValue]) {
                shapeValue = mountedShapes[selectedValue];
            } else {
                shapeValue = DEFAULT_SHAPE;
            }

            return shape === shapeValue;
        },
        [mountedShapes, selectedValue],
    );
    return (
        <Flex direction="column">
            <Palette
                className={b('palette', {type: paletteType})}
                itemClassName={b('palette-item', {type: paletteType})}
                paletteType={paletteType}
                palette={palette}
                onPaletteItemClick={onPaletteItemClick}
                isSelectedItem={isSelectedItem}
                isDefaultItem={isDefaultItem}
            />
        </Flex>
    );
};

export default DialogShapesPalette;
