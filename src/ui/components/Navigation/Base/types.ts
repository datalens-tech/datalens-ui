import type React from 'react';

export type NavigationQuickItem = {
    icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    iconClassName: string;
    text: string;
    scope: string;
    key: string;
};
