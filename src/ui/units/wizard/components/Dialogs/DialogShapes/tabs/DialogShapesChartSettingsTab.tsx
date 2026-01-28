import React from 'react';

import {Flex} from '@gravity-ui/uikit';

import {DialogLineWidth} from '../DialogLineWidth/DialogLineWidth';
import type {ShapesState} from '../DialogShapes';

type Props = {
    shapesState: ShapesState;
    onChartLineWidthChange: (nextLineWidth: string) => void;
};

export const DialogShapesChartSettingsTab: React.FC<Props> = ({
    shapesState,
    onChartLineWidthChange,
}) => {
    return (
        <Flex spacing={{pt: 5, px: 8}}>
            <DialogLineWidth
                value={shapesState.chartLineWidth}
                onChange={onChartLineWidthChange}
                style={{width: '292px'}}
            />
        </Flex>
    );
};
