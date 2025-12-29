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
import {selectClientAvailableLineShapes} from 'ui/constants';
import IconRenderer from 'ui/libs/DatalensChartkit/ChartKit/components/IconRenderer/IconRenderer';
import {PaletteTypes} from 'ui/units/wizard/constants';

import ValuesList from '../../../ValuesList/ValuesList';
import type {ShapesState} from '../DialogShapes';

import './DialogValueList.scss';
import DynamicLineIconRenderer from 'ui/libs/DatalensChartkit/ChartKit/components/IconRenderer/DynamicLineIconRenderer';

type Props = {
    item: Field;
    items?: Field[];
    distincts?: Record<string, string[]>;
    filters: FilterField[];
    parameters: Field[];
    dashboardParameters: Field[];
    updates: Update[];
    options: DatasetOptions;
    datasetId: string;
    shapesState: ShapesState;
    paletteType: PaletteTypes;
    // renderValueIcon: (value: string) => React.ReactNode;
    setShapesState: (state: Partial<ShapesState>) => void;
};

const b = block('dl-dialog-value-list');

export const DialogValueList: React.FC<Props> = ({
    item,
    items,
    distincts,
    filters,
    parameters,
    dashboardParameters,
    updates,
    options,
    datasetId,
    shapesState,
    paletteType,
    setShapesState,
}: Props) => {
    // CHARTS-10226: duplication, should not know about any palettes -> move renderValueIcon up the tree
    const palette = React.useMemo(() => {
        if (paletteType === PaletteTypes.Points) {
            return [...POINT_SHAPES_IN_ORDER, 'auto'];
        }

        const availableLineShapes = selectClientAvailableLineShapes();
        return availableLineShapes.sort(
            (shape1, shape2) => SHAPES_PALETTE_ORDER[shape1] - SHAPES_PALETTE_ORDER[shape2],
        );
    }, [paletteType]);

    const renderValueIcon = React.useCallback(
        (value) => {
            const {mountedShapes, lineWidth} = shapesState;
            const currentShape = mountedShapes[value];

            const isDefault = !palette.includes(currentShape);
            let content;
            if (isDefault) {
                content = 'A';
            } else {
                switch (paletteType) {
                    case PaletteTypes.Lines: {
                        content = (
                            <DynamicLineIconRenderer
                                iconType={currentShape as LineShapeType}
                                width={40}
                                height={lineWidth}
                            />
                        );
                        break;
                    }

                    case PaletteTypes.Points: {
                        content = (
                            <IconRenderer
                                iconType={currentShape as PointsShapeType}
                                width={12}
                                height={lineWidth}
                            />
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
        [palette, paletteType, shapesState],
    );

    return (
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
    );
};
