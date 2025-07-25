import type {MouseEventHandler} from 'react';

export type BreadcrumbItem = {
    text: string;
    href?: string;
    path?: string;
    action?: MouseEventHandler<HTMLAnchorElement>;
};
