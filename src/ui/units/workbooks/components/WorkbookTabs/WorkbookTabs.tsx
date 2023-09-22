import React from 'react';

import {NavigationTabs} from 'components/NavigationTabs/NavigationTabs';
import {EntryScope} from 'shared';
import {WorkbookWithPermissions} from 'shared/schema';
import {DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG} from 'ui/constants/misc';

import {registry} from '../../../../registry';

type Props = {
    workbook: WorkbookWithPermissions;
};

export const WorkbookTabs = ({workbook}: Props) => {
    const {getWorkbookTabs} = registry.workbooks.functions.getAll();
    const items = React.useMemo(() => {
        return getWorkbookTabs(workbook);
    }, [getWorkbookTabs, workbook]);

    return (
        <NavigationTabs
            items={items}
            defaultTab={EntryScope.Dash}
            breakpointsConfig={DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG}
        />
    );
};
