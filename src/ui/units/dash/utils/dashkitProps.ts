import type {DashKitGroup, ReactGridLayoutProps} from '@gravity-ui/dashkit';
import {
    DEFAULT_DASH_MARGINS,
    FIXED_HEADER_GROUP_COLS,
    FIXED_HEADER_GROUP_LINE_MAX_ROWS,
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

export const fixedHeaderGridProperties =
    (extendedProps: ReactGridLayoutProps = {}) =>
    (props: ReactGridLayoutProps) =>
        calculateRowHeight({
            ...props,
            ...extendedProps,
            cols: FIXED_HEADER_GROUP_COLS,
            maxRows: FIXED_HEADER_GROUP_LINE_MAX_ROWS,
            autoSize: false,
            compactType: 'horizontal-nowrap',
        });

export const getPropertiesWithResizeHandles =
    (extendedProps: Partial<DashKitGroup['gridProperties']> | undefined = {}) =>
    (props: ReactGridLayoutProps): ReactGridLayoutProps =>
        calculateRowHeight({
            ...props,
            ...extendedProps,
            resizeHandles: ['sw', 'se'],
        });
