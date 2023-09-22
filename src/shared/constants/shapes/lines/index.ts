export enum LineShapeType {
    Solid = 'Solid',
    ShortDash = 'ShortDash',
    ShortDot = 'ShortDot',
    ShortDashDot = 'ShortDashDot',
    ShortDashDotDot = 'ShortDashDotDot',
    Dot = 'Dot',
    Dash = 'Dash',
    LongDash = 'LongDash',
    DashDot = 'DashDot',
    LongDashDot = 'LongDashDot',
    LongDashDotDot = 'LongDashDotDot',
}
export const SHAPES_ORDER = {
    [LineShapeType.Solid]: 1,
    [LineShapeType.Dash]: 2,
    [LineShapeType.Dot]: 3,
    [LineShapeType.ShortDashDot]: 4,
    [LineShapeType.LongDash]: 5,
    [LineShapeType.LongDashDot]: 6,
    [LineShapeType.ShortDot]: 7,
    [LineShapeType.LongDashDotDot]: 8,
    [LineShapeType.ShortDash]: 9,
    [LineShapeType.DashDot]: 10,
    [LineShapeType.ShortDashDotDot]: 11,
};

export const SHAPES_PALETTE_ORDER = {
    ...SHAPES_ORDER,
    auto: Math.max.apply(null, Object.values(SHAPES_ORDER)) + 1,
};

export const selectShapes = (): LineShapeType[] => Object.values(LineShapeType);
export const getServerShapesOrder = () =>
    selectShapes().sort((a, b) => SHAPES_ORDER[a] - SHAPES_ORDER[b]);
