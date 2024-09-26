export const Direction = {
    PARENT: 'parent',
    CHILD: 'child',
} as const;

export type DirectionValue = (typeof Direction)[keyof typeof Direction];
