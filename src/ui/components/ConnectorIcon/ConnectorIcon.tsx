import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import type {IconData, IconProps} from '@gravity-ui/uikit';
import isObject from 'lodash/isObject';
import type {ConnectorIconData, ConnectorIconView} from 'shared/schema/types';

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

export const ConnectorIcon = (props: ConnectorIconViewProps) => {
    const {data, className, size, qa, view = 'standard'} = props;
    const height = props.height || size;
    const width = props.width || size;

    if (isBIConnectorIconData(data)) {
        const src = ('data' in data ? data.data : data.url)[view];
        return <img className={className} height={height} width={width} src={src} data-qa={qa} />;
    }

    return <Icon className={className} data={data} height={height} width={width} qa={qa} />;
};
