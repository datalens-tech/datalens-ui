import type React from 'react';

import type {LineShapeType} from 'shared';

import {DEFAULT_ICON_HEIGHT, DEFAULT_ICON_WIDTH} from './constants';
import {useIconRenderer} from './hooks';

type Props = {
    iconType: LineShapeType | undefined;
    width?: number;
    height?: number;
};

const DynamicLineIconRenderer: React.FC<Props> = ({
    iconType,
    width = DEFAULT_ICON_WIDTH,
    height = DEFAULT_ICON_HEIGHT,
}: Props) => {
    const renderIcon = useIconRenderer<LineShapeType>({
        iconType,
        width,
        height,
        additionalProps: {lineWidth: height},
    });

    return renderIcon();
};

export default DynamicLineIconRenderer;
