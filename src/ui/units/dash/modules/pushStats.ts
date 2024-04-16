import {Feature} from 'shared';
import Utils from 'ui/utils';
import {Optional} from 'utility-types';

import {DashStats} from '../../../../shared';
import {DL} from '../../../constants';
import {getSdk} from '../../../libs/schematic-sdk';

const dashStatsVisitedTabs: Set<string> = new Set();

function collectDashStats(data: Optional<DashStats, 'userId' | 'tenantId'>) {
    const uniqTab = `${data.dashId}_${data.dashTabId}`;
    if (Utils.isEnabledFeature(Feature.EnableDashChartStat) && !dashStatsVisitedTabs.has(uniqTab)) {
        getSdk().mix.collectDashStats({
            userId: DL.USER_ID,
            tenantId: DL.CURRENT_TENANT_ID || '',
            ...data,
        });
        dashStatsVisitedTabs.add(uniqTab);
    }
}

export {collectDashStats};
