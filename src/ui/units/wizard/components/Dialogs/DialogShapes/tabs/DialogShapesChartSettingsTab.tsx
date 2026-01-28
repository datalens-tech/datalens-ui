import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import {Feature} from 'shared';
import {PaletteTypes} from 'ui/units/wizard/constants';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {DialogLineCapAndJoinValue} from '../DialogLineCapAndJoin/DialogLineCapAndJoin';
import {DialogLineCapAndJoin} from '../DialogLineCapAndJoin/DialogLineCapAndJoin';
import {DialogLineWidth} from '../DialogLineWidth/DialogLineWidth';
import type {ShapesState} from '../DialogShapes';

type Props = {
    shapesState: ShapesState;
    paletteType: PaletteTypes;
    onChartLineWidthChange: (nextLineWidth: string) => void;
    onLineCapAndJoinChange: (nextLineCapAndJoin: DialogLineCapAndJoinValue) => void;
};

export const DialogShapesChartSettingsTab: React.FC<Props> = ({
    shapesState,
    paletteType,
    onChartLineWidthChange,
    onLineCapAndJoinChange,
}) => {
    const isLineShape = paletteType === PaletteTypes.Lines;
    const isGravityChartsEnabled = isEnabledFeature(Feature.GravityChartsForLineAreaAndBarX);

    return (
        <Flex
            direction="column"
            spacing={{pt: 5, px: 8}}
            style={{width: '292px', boxSizing: 'content-box'}}
            gap={2}
        >
            <DialogLineWidth value={shapesState.chartLineWidth} onChange={onChartLineWidthChange} />
            {isGravityChartsEnabled && isLineShape && (
                <DialogLineCapAndJoin
                    value={shapesState.capAndJoin}
                    onChange={onLineCapAndJoinChange}
                />
            )}
            )
        </Flex>
    );
};
