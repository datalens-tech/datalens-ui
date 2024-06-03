import type {PreviewState} from '../../preview';
import {getInitialState as getInitialPreviewState} from '../../preview';
export const defaultPreviewState: PreviewState = {
    ...getInitialPreviewState(),
} as const;
