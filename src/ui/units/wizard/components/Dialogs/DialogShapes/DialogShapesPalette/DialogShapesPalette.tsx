import React from 'react';

import {Flex, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {
    DatasetOptions,
    Field,
    FilterField,
    LineShapeType,
    PointsShapeType,
    Update,
} from 'shared';
import {POINT_SHAPES_IN_ORDER, SHAPES_PALETTE_ORDER} from 'shared';
import {selectClientAvailableLineShapes} from 'ui';

import IconRenderer from '../../../../../../libs/DatalensChartkit/ChartKit/components/IconRenderer/IconRenderer';
import {PaletteTypes} from '../../../../constants';
import Palette from '../../../Palette/Palette';
import ValuesList from '../../../ValuesList/ValuesList';
import type {ShapesState} from '../DialogShapes';

import './DialogShapesPalette.scss';
import { LineWidthSelect } from '../../../LineWidthSelect/LineWidthSelect';
import NumberInput from 'ui/components/NumberFormatSettings/NumberInput/NumberInput';
import { DialogLineWidth } from '../DialogLineWidth/DialogLineWidth';

type Props = {
    onPaletteItemClick: (shape: string) => void;
    shapesState: ShapesState;
    parameters: Field[];
    dashboardParameters: Field[];
    setShapesState: (state: Partial<ShapesState>) => void;
    distincts?: Record<string, string[]>;
    items?: Field[];
    item: Field;
    datasetId: string;
    options: DatasetOptions;
    updates: Update[];
    filters: FilterField[];
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

    // CHARTS-10226: refactor into seprate components?
    return (
        <React.Fragment>
            
            <Flex direction="column">
                <DialogLineWidth />
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
        </React.Fragment>
    );
};

export default DialogShapesPalette;
