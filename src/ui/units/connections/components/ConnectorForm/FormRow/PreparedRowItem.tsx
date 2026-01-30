import React from 'react';

import type {PreparedRow} from 'shared/schema/types';
import type {PreparedRowItemProps} from 'ui/registry/units/connections/types/PreparedRowItem';

import logger from '../../../../../libs/logger';
import {CacheTtlRow, CollapseRow, RawSQLLevelRow} from '../preparedRows';

export const PreparedRowItem = (props: PreparedRowItemProps) => {
    switch (props.type) {
        case 'cache_ttl_sec': {
            const {type: _type, ...rowProps} = props;
            return <CacheTtlRow {...rowProps} />;
        }
        case 'collapse': {
            const {type: _type, ...rowProps} = props;
            return <CollapseRow {...rowProps} />;
        }
        case 'raw_sql_level': {
            const {type: _type, ...rowProps} = props;
            return <RawSQLLevelRow {...rowProps} />;
        }
        default: {
            logger.logError(`FormItem (conn): unknown row type "${(props as PreparedRow).type}"`);
            return null;
        }
    }
};
