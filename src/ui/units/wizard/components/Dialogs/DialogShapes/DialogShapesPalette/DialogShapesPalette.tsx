import React from 'react';

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
    setShapesState,
    item,
    items,
    distincts,
    datasetId,
    options,
    updates,
    filters,
    onPaletteItemClick,
    parameters,
    dashboardParameters,
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
    const renderValueIcon = React.useCallback(
        (value) => {
            const currentShape = mountedShapes[value];

            const isDefault = !palette.includes(currentShape);
            let content;
            if (isDefault) {
                content = 'A';
            } else {
                switch (paletteType) {
                    case PaletteTypes.Lines: {
                        content = (
                            <IconRenderer iconType={currentShape as LineShapeType} width="40px" />
                        );
                        break;
                    }

                    case PaletteTypes.Points: {
                        content = (
                            <IconRenderer iconType={currentShape as PointsShapeType} width="12px" />
                        );
                        break;
                    }
                }
            }

            return (
                <div className={b('value-shape', {default: isDefault, type: paletteType})}>
                    {content}
                </div>
            );
        },
        [mountedShapes, paletteType],
    );

    return (
        <React.Fragment>
            <ValuesList
                item={item}
                items={items}
                distincts={distincts}
                filters={filters}
                parameters={parameters}
                dashboardParameters={dashboardParameters}
                updates={updates}
                options={options}
                datasetId={datasetId}
                selectedValue={shapesState.selectedValue}
                renderValueIcon={renderValueIcon}
                onChangeSelectedValue={(value, shouldResetShapes) => {
                    const state: Partial<ShapesState> = {selectedValue: value};

                    if (shouldResetShapes) {
                        state.mountedShapes = {};
                    }

                    setShapesState(state);
                }}
            />
            <Palette
                className={b('palette', {type: paletteType})}
                itemClassName={b('palette-item', {type: paletteType})}
                paletteType={paletteType}
                palette={palette}
                onPaletteItemClick={onPaletteItemClick}
                isSelectedItem={isSelectedItem}
                isDefaultItem={isDefaultItem}
            />
        </React.Fragment>
    );
};

export default DialogShapesPalette;
