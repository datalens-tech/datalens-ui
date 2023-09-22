import React from 'react';

export type AdditionalWorkbookAction = {
    id: string;
    action: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    text: string;
};
export type UseAdditionalWorkbookActions = Array<AdditionalWorkbookAction>;
