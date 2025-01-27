import type React from 'react';

export type TemplateItem = {
    children: (TemplateItem | string)[];
    element?:
        | string
        | React.ComponentClass
        | React.ExoticComponent
        | React.FC
        | ((props: any) => JSX.Element);
    props?: {[key: string]: string | Record<string, unknown> | JSX.Element};
};
