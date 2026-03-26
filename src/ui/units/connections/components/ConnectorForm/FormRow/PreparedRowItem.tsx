import React from 'react';

import {Feature} from 'shared';
import type {PreparedRow} from 'shared/schema/types';
import type {PreparedRowItemProps} from 'ui/registry/units/connections/types/PreparedRowItem';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import logger from '../../../../../libs/logger';
import {CacheTtlRow, CollapseRow, EarlyInvalidationCacheRow, RawSQLLevelRow} from '../preparedRows';

export const PreparedRowItem = (props: PreparedRowItemProps) => {
    switch (props.type) {
        case 'cache_ttl_sec': {
            const {type: _type, ...rowProps} = props;
            return <CacheTtlRow {...rowProps} />;
        }
        case 'cache_invalidation_throttling_interval_sec': {
            const {type: _type, ...rowProps} = props;
            if (isEnabledFeature(Feature.EnableDatasetEarlyInvalidationCache)) {
                return <EarlyInvalidationCacheRow {...rowProps} />;
            }
            return null;
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
