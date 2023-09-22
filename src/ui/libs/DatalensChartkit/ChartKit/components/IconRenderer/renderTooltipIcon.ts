import {LineShapeType} from 'shared';

import {DEFAULT_ICON_HEIGHT, DEFAULT_ICON_WIDTH} from './constants';
import {
    DashDotLineIcon,
    DashLineIcon,
    DotLineIcon,
    LongDashDotDotLineIcon,
    LongDashDotLineIcon,
    LongDashLineIcon,
    ShortDashDotDotLineIcon,
    ShortDashDotLineIcon,
    ShortDashLineIcon,
    ShortDotLineIcon,
    SolidLineIcon,
} from './template-icons';

const TEMPLATE_ICONS = {
    [LineShapeType.DashDot]: DashDotLineIcon,
    [LineShapeType.Dash]: DashLineIcon,
    [LineShapeType.Dot]: DotLineIcon,
    [LineShapeType.LongDashDotDot]: LongDashDotDotLineIcon,
    [LineShapeType.LongDashDot]: LongDashDotLineIcon,
    [LineShapeType.LongDash]: LongDashLineIcon,
    [LineShapeType.ShortDashDotDot]: ShortDashDotDotLineIcon,
    [LineShapeType.ShortDashDot]: ShortDashDotLineIcon,
    [LineShapeType.ShortDash]: ShortDashLineIcon,
    [LineShapeType.ShortDot]: ShortDotLineIcon,
    [LineShapeType.Solid]: SolidLineIcon,
};

export const renderTooltipIcon = (args: {
    type?: LineShapeType;
    width?: string;
    height?: string;
}) => {
    const {type, width = DEFAULT_ICON_WIDTH, height = DEFAULT_ICON_HEIGHT} = args;
    const templateIcon = type && TEMPLATE_ICONS[type];

    return templateIcon ? templateIcon({width, height}) : '';
};
