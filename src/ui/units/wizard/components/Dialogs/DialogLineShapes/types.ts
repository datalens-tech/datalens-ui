import type {LineShapeSettings} from 'shared';

export type ShapesState = {
    mountedShapes: Record<string, string>;
    lineSettings: Record<string, LineShapeSettings>;
    commonLineSettings: LineShapeSettings;
    selected: string | null;
};
