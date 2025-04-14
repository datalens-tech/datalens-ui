import type React from 'react';

import type {MarkupItem} from 'shared';

export type TemplateItem = {
    children: (TemplateItem | string)[];
    element?:
        | string
        | React.ComponentClass
        | React.ExoticComponent
        | React.FC
        | ((props: any) => JSX.Element);
    props?: {[key: string]: string | Record<string, unknown> | JSX.Element | MarkupItem};
};
