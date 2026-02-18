import React from 'react';

import {POINT_SHAPES_IN_ORDER, SHAPES_PALETTE_ORDER} from 'shared';
import {selectClientAvailableLineShapes} from 'ui/constants';

import {PaletteTypes} from '../../../../constants';

export function useShapesPalette(paletteType: PaletteTypes): string[] {
    return React.useMemo(() => {
        if (paletteType === PaletteTypes.Points) {
            return [...POINT_SHAPES_IN_ORDER, 'auto'];
        }

        const availableLineShapes = selectClientAvailableLineShapes();
        return availableLineShapes.sort(
            (shape1, shape2) => SHAPES_PALETTE_ORDER[shape1] - SHAPES_PALETTE_ORDER[shape2],
        );
    }, [paletteType]);
}
