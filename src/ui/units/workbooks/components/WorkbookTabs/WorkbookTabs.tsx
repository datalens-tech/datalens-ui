import React from 'react';

import {NavigationTabs} from 'components/NavigationTabs/NavigationTabs';
import type {WorkbookWithPermissions} from 'shared/schema';
import {DL} from 'ui/constants/common';
import {DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG} from 'ui/constants/misc';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import {registry} from '../../../../registry';

import {TAB_ALL} from './constants';

type Props = {
    workbook: WorkbookWithPermissions;
};

export const WorkbookTabs = ({workbook}: Props) => {
    const {getWorkbookTabs} = registry.workbooks.functions.getAll();
    const items = React.useMemo(() => {
        return getWorkbookTabs(workbook);
    }, [getWorkbookTabs, workbook]);

    const size = DL.IS_MOBILE ? MOBILE_SIZE.TABS : undefined;

    return (
        <NavigationTabs
            items={items}
            defaultTab={TAB_ALL}
            breakpointsConfig={DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG}
            size={size}
        />
    );
};
