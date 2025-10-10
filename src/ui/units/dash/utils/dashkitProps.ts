import type {DashKitGroup, ReactGridLayoutProps} from '@gravity-ui/dashkit';
import {
    DEFAULT_DASH_MARGINS,
    MIN_AUTO_HEIGHT_PX,
    MIN_AUTO_HEIGHT_ROWS,
} from 'ui/components/DashKit/constants';

export const calculateRowHeight = (props: ReactGridLayoutProps) => {
    if (props.margin && props.margin[1] !== DEFAULT_DASH_MARGINS[1]) {
        props.rowHeight =
            (MIN_AUTO_HEIGHT_PX - props.margin[1] * (MIN_AUTO_HEIGHT_ROWS - 1)) /
            MIN_AUTO_HEIGHT_ROWS;
    }

    return props;
};

export const getCustomizedProperties = (
    props: ReactGridLayoutProps,
    extendedProps: Partial<DashKitGroup['gridProperties']> | undefined = {},
) =>
    calculateRowHeight({
        ...props,
        ...extendedProps,
        resizeHandles: ['sw', 'se'],
    });
