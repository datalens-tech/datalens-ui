import {PreviewState, getInitialState as getInitialPreviewState} from '../../preview';
export const defaultPreviewState: PreviewState = {
    ...getInitialPreviewState(),
} as const;
