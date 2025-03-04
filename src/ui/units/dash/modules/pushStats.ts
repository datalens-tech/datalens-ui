import {Feature} from 'shared';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import type {Optional} from 'utility-types';

import type {DashStats} from '../../../../shared';
import {DL} from '../../../constants';

const dashStatsVisitedTabs: Set<string> = new Set();

function collectDashStats(data: Optional<DashStats, 'login' | 'userId' | 'tenantId'>) {
    const uniqTab = `${data.dashId}_${data.dashTabId}`;
    if (isEnabledFeature(Feature.EnableDashChartStat) && !dashStatsVisitedTabs.has(uniqTab)) {
        const dashStats = {
            userId: DL.USER_ID,
            tenantId: DL.CURRENT_TENANT_ID || '',
            ...data,
        };
        if (DL.CURRENT_TENANT_ID === 'common') {
            dashStats.login = DL.USER_LOGIN;
        }

        const requestCollectDashStats = registry.common.functions.get('requestCollectDashStats');
        requestCollectDashStats(dashStats);

        dashStatsVisitedTabs.add(uniqTab);
    }
}

export {collectDashStats};
