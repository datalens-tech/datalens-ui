import React from 'react';

import {LineShapeType, PointsShapeType} from 'shared';

import CirclePointIcon from './Icons/CirclePointIcon';
import DashDotLineIcon from './Icons/DashDotLineIcon';
import DashLineIcon from './Icons/DashLineIcon';
import DiamondPointIcon from './Icons/DiamondPointIcon';
import DotLineIcon from './Icons/DotLineIcon';
import LongDashDotDotLineIcon from './Icons/LongDashDotDotLineIcon';
import LongDashDotLineIcon from './Icons/LongDashDotLineIcon';
import LongDashLineIcon from './Icons/LongDashLineIcon';
import ShortDashDotDotLineIcon from './Icons/ShortDashDotDotLineIcon';
import ShortDashDotLineIcon from './Icons/ShortDashDotLineIcon';
import ShortDashLineIcon from './Icons/ShortDashLineIcon';
import ShortDotLineIcon from './Icons/ShortDotLineIcon';
import SolidLineIcon from './Icons/SolidLineIcon';
import SquarePointIcon from './Icons/SquarePointIcon';
import TriangleDownPointIcon from './Icons/TriangleDownPointIcon';
import TrianglePointIcon from './Icons/TrianglePointIcon';
import {DEFAULT_ICON_HEIGHT, DEFAULT_ICON_WIDTH} from './constants';
import type {CommonIconProps} from './types';

type Props = {
    iconType: LineShapeType | PointsShapeType | undefined;
    width?: string;
    height?: string;
};

const ICONS = {
    [LineShapeType.Solid.toLowerCase()]: SolidLineIcon,
    [LineShapeType.Dash.toLowerCase()]: DashLineIcon,
    [LineShapeType.Dot.toLowerCase()]: DotLineIcon,
    [LineShapeType.DashDot.toLowerCase()]: DashDotLineIcon,
    [LineShapeType.ShortDot.toLowerCase()]: ShortDotLineIcon,
    [LineShapeType.ShortDash.toLowerCase()]: ShortDashLineIcon,
    [LineShapeType.ShortDashDot.toLowerCase()]: ShortDashDotLineIcon,
    [LineShapeType.ShortDashDotDot.toLowerCase()]: ShortDashDotDotLineIcon,
    [LineShapeType.LongDashDotDot.toLowerCase()]: LongDashDotDotLineIcon,
    [LineShapeType.LongDashDot.toLowerCase()]: LongDashDotLineIcon,
    [LineShapeType.LongDash.toLowerCase()]: LongDashLineIcon,
    [LineShapeType.LongDash.toLowerCase()]: LongDashLineIcon,

    [PointsShapeType.Circle]: CirclePointIcon,
    [PointsShapeType.Diamond]: DiamondPointIcon,
    [PointsShapeType.Square]: SquarePointIcon,
    [PointsShapeType.Triangle]: TrianglePointIcon,
    [PointsShapeType.TriangleDown]: TriangleDownPointIcon,
};

const IconRenderer: React.FC<Props> = ({
    iconType,
    width = DEFAULT_ICON_WIDTH,
    height = DEFAULT_ICON_HEIGHT,
}: Props) => {
    if (!iconType) {
        return null;
    }
    const iconForRender = ICONS[iconType.toLowerCase()];
    const iconProps: CommonIconProps = {
        height,
        width,
    };

    return React.createElement<CommonIconProps>(iconForRender, iconProps);
};

export default IconRenderer;
