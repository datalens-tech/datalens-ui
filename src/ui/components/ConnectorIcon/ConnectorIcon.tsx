import React from 'react';

import {Icon, Skeleton} from '@gravity-ui/uikit';
import type {IconData, IconProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import isObject from 'lodash/isObject';
import type {ConnectorIconData, ConnectorIconView} from 'shared/schema/types';

import iconUndefined from 'ui/assets/icons/connections/undefined.svg';

import './ConnectorIcon.scss';

const b = block('dl-connector-icon');

export type ConnectorIconViewProps = Pick<
    IconProps,
    'className' | 'height' | 'size' | 'width' | 'qa'
> & {
    data: ConnectorIconData | IconData;
    view?: ConnectorIconView;
};

const isBIConnectorIconData = (value: unknown): value is ConnectorIconData => {
    return (
        isObject(value) &&
        'type' in value &&
        'conn_type' in value &&
        ('data' in value || 'url' in value)
    );
};

type BIConnectorIconProps = Pick<IconProps, 'className' | 'height' | 'width' | 'qa'> & {
    data: ConnectorIconData;
    view?: ConnectorIconView;
};

const BIConnectorIcon = (props: BIConnectorIconProps) => {
    const {data, className, height, width, qa, view = 'standard'} = props;
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const src = ('data' in data ? data.data : data.url)[view];

    if (error) {
        return (
            <Icon
                className={className}
                data={iconUndefined}
                height={height}
                width={width}
                qa={qa}
            />
        );
    }

    return (
        <React.Fragment>
            <img
                className={b({loading}, className)}
                data-qa={qa}
                height={height}
                width={width}
                src={src}
                onLoad={loading ? () => setLoading(false) : undefined}
                onError={() => setError(true)}
            />
            {loading && <Skeleton className={className} style={{width, height}} />}
        </React.Fragment>
    );
};

export const ConnectorIcon = (props: ConnectorIconViewProps) => {
    const {data, className, size, qa, view} = props;
    const height = props.height || size;
    const width = props.width || size;

    if (isBIConnectorIconData(data)) {
        return (
            <BIConnectorIcon
                className={className}
                data={data}
                height={height}
                width={width}
                qa={qa}
                view={view}
            />
        );
    }

    return <Icon className={className} data={data} height={height} width={width} qa={qa} />;
};
