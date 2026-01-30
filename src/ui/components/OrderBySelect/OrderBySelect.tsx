import React from 'react';

import type {SelectProps, SelectSize} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';

import type {OrderBy, OrderByOptions} from './types';

type Props<OrderByField, OrderByDirection> = {
    className?: string;
    size?: SelectSize;
    orderBy: OrderBy<OrderByField, OrderByDirection>;
    orderByOptions: OrderByOptions<string, OrderByField, OrderByDirection>;
    onChange: (orderBy: OrderBy<OrderByField, OrderByDirection>) => void;
    disabled?: boolean;
};

export const OrderBySelect = <OrderByField, OrderByDirection>({
    className,
    size,
    orderBy,
    orderByOptions,
    onChange,
    disabled,
}: Props<OrderByField, OrderByDirection>) => {
    const options = React.useMemo(() => {
        return Object.entries(orderByOptions).map(([key, option]) => ({
            value: key,
            content: option.content,
        }));
    }, [orderByOptions]);

    const value = React.useMemo(() => {
        return (
            Object.entries(orderByOptions).find(
                ([_, option]) =>
                    option.field === orderBy.field && option.direction === orderBy.direction,
            )?.[0] ?? ''
        );
    }, [orderBy, orderByOptions]);

    const handleUpdate: SelectProps['onUpdate'] = ([key]) => {
        const {field, direction} = orderByOptions[key];

        onChange({
            field,
            direction,
        });
    };

    return (
        <Select
            className={className}
            size={size}
            options={options}
            value={[value]}
            onUpdate={handleUpdate}
            disabled={disabled}
        />
    );
};
