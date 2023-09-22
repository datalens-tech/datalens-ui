export interface CollapseProps {
    className?: string;
    headerClassName?: string;
    arrowPosition?: 'left' | 'right';
    children?: React.ReactNode;
    toolbar?: React.ReactNode;
    toolbarClassName?: string;
    title: string | JSX.Element;
    titleClassName?: string;
    contentClassName?: string;
    titleSize?: 's' | 'm' | 'l';
    defaultIsExpand?: boolean;
    emptyState?: string | JSX.Element;
    arrowView?: 'icon' | 'button';
    contentMarginTop?: string | number;
    isSecondary?: boolean;
    beforeExpandChange?: (isExpand: boolean) => void;
    isExpand?: boolean;
    cacheContent?: boolean;
    arrowQa?: string;
    arrowClassName?: string;
}
