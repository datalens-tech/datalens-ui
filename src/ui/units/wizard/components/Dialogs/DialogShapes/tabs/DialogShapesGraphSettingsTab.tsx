import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import type {DatasetOptions, Field, FilterField, Update} from 'shared';
import {PaletteTypes} from 'ui/units/wizard/constants';
import {LINE_WIDTH_AUTO_VALUE} from 'ui/units/wizard/constants/shapes';

import {DialogLineWidth} from '../DialogLineWidth/DialogLineWidth';
import type {ShapesState} from '../DialogShapes';
import DialogShapesPalette from '../DialogShapesPalette/DialogShapesPalette';
import {DialogValueList} from '../DialogValueList/DialogValueList';

type Props = {
    item: Field;
    items?: Field[];
    distincts?: Record<string, string[]>;
    options: DatasetOptions;
    parameters: Field[];
    dashboardParameters: Field[];
    datasetId: string;
    updates: Update[];
    filters: FilterField[];
    shapesState: ShapesState;
    paletteType: PaletteTypes;
    setShapesState: (state: Partial<ShapesState>) => void;
    onPaletteItemClick: (shape: string) => void;
    onLineWidthChange: (nextLineWidth: string) => void;
};

export const DialogShapesGraphSettingsTab: React.FC<Props> = ({
    item,
    items,
    distincts,
    options,
    parameters,
    dashboardParameters,
    datasetId,
    updates,
    filters,
    shapesState,
    paletteType,
    setShapesState,
    onPaletteItemClick,
    onLineWidthChange,
}) => {
    const selectedShapeLineWidth =
        shapesState.selectedValue && shapesState.mountedShapesLineWidths[shapesState.selectedValue]
            ? shapesState.mountedShapesLineWidths[shapesState.selectedValue]
            : LINE_WIDTH_AUTO_VALUE;

    return (
        <Flex direction="row" style={{height: '100%'}}>
            <DialogValueList
                item={item}
                items={items}
                distincts={distincts}
                filters={filters}
                parameters={parameters}
                dashboardParameters={dashboardParameters}
                updates={updates}
                options={options}
                datasetId={datasetId}
                shapesState={shapesState}
                paletteType={paletteType}
                setShapesState={setShapesState}
            />
            <Flex direction="column" gap={4} spacing={{py: '5', px: '6'}}>
                {paletteType === PaletteTypes.Lines && (
                    <DialogLineWidth
                        allowDefault
                        value={selectedShapeLineWidth}
                        onChange={onLineWidthChange}
                    />
                )}
                <DialogShapesPalette
                    shapesState={shapesState}
                    onPaletteItemClick={onPaletteItemClick}
                    paletteType={paletteType}
                />
            </Flex>
        </Flex>
    );
};
