import {lazy} from 'react';

export const TooltipWithComments = lazy(() =>
    import('./TooltipWithComments').then((module) => ({
        default: module.TooltipWithComments,
    })),
);
