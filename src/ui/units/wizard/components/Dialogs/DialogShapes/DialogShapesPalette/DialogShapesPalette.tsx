import React from 'react';

import block from 'bem-cn-lite';

import type {PaletteTypes} from '../../../../constants';
import Palette from '../../../Palette/Palette';
import type {ShapesState} from '../DialogShapes';
import {useShapesPalette} from '../hooks/useShapesPalette';

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

    const palette = useShapesPalette(paletteType);

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
        <Palette
            className={b('palette', {type: paletteType})}
            itemClassName={b('palette-item', {type: paletteType})}
            paletteType={paletteType}
            palette={palette}
            onPaletteItemClick={onPaletteItemClick}
            isSelectedItem={isSelectedItem}
            isDefaultItem={isDefaultItem}
        />
    );
};

export default DialogShapesPalette;
