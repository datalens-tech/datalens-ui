import React from 'react';

import type {DatasetOptions, Field, FilterField, Update} from 'shared';

import {PaletteTypes} from '../../../../constants';
import ValuesList from '../../../ValuesList/ValuesList';
import type {ShapesState} from '../DialogShapes';

interface DialogValueListProps {
    setShapesState: (state: Partial<ShapesState>) => void;
    item: Field;
    items?: Field[];
    shapesState: ShapesState;
    distincts?: Record<string, string[]>;
    datasetId: string;
    options: DatasetOptions;
    updates: Update[];
    filters: FilterField[];
    parameters: Field[];
    dashboardParameters: Field[];
}

export const DialogValueList = React.memo(
    ({
        setShapesState,
        item,
        items,
        distincts,
        datasetId,
        options,
        updates,
        filters,
        parameters,
        shapesState,
        dashboardParameters,
    }: DialogValueListProps) => {
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
                                <IconRenderer
                                    iconType={currentShape as LineShapeType}
                                    width="40px"
                                />
                            );
                            break;
                        }

                        case PaletteTypes.Points: {
                            content = (
                                <IconRenderer
                                    iconType={currentShape as PointsShapeType}
                                    width="12px"
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
            [mountedShapes, paletteType],
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
    },
);

DialogValueList.displayName = 'DialogValueList';
