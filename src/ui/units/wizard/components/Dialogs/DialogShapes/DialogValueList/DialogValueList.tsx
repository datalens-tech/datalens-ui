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
import IconRenderer from 'ui/libs/DatalensChartkit/ChartKit/components/IconRenderer/IconRenderer';
import {PaletteTypes} from 'ui/units/wizard/constants';

import ValuesList from '../../../ValuesList/ValuesList';
import type {ShapesState} from '../DialogShapes';
import {useShapesPalette} from '../hooks/useShapesPalette';

import './DialogValueList.scss';

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
    const palette = useShapesPalette(paletteType);

    const renderValueIcon = React.useCallback(
        (value) => {
            const {mountedShapes} = shapesState;
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
