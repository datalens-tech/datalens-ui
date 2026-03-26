import React from 'react';

import block from 'bem-cn-lite';
import type {DatasetOptions, Field, FilterField, PointsShapeType, Update} from 'shared';
import {POINT_SHAPES_IN_ORDER} from 'shared';

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
}: Props) => {
    const {mountedShapes, selectedValue} = shapesState;

    const palette = React.useMemo(() => {
        return [...POINT_SHAPES_IN_ORDER, 'auto'];
    }, []);

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
                content = <IconRenderer iconType={currentShape as PointsShapeType} width="12px" />;
            }

            return <div className={b('value-shape', {default: isDefault})}>{content}</div>;
        },
        [mountedShapes, palette],
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
                className={b('palette')}
                itemClassName={b('palette-item')}
                paletteType={PaletteTypes.Points}
                palette={palette}
                onPaletteItemClick={onPaletteItemClick}
                isSelectedItem={isSelectedItem}
                isDefaultItem={isDefaultItem}
            />
        </React.Fragment>
    );
};

export default DialogShapesPalette;
