import React from 'react';

import {useSelector} from 'react-redux';
import {isEmbeddedMode} from 'ui/utils/embedded';

import {
    selectCurrentTabId,
    selectDashWorkbookId,
    selectSettings,
} from '../../../../../store/selectors/dashTypedSelectors';

type MemoContext = {
    fixedHeaderCollapsed?: boolean;
    isEmbeddedMode?: boolean;
    isPublicMode?: boolean;
    workbookId?: string | null;
    enableAssistant?: boolean;
    // used in group selectors plugin
    currentTabId?: string | null;
};

type Args = {
    isFixedHeaderCollapsed: boolean;
    isPublicMode?: boolean;
};

export const useDashKitContext = ({isFixedHeaderCollapsed, isPublicMode}: Args): MemoContext => {
    const {enableAssistant = true} = useSelector(selectSettings);
    const workbookId = useSelector(selectDashWorkbookId);
    const tabId = useSelector(selectCurrentTabId);

    const context = React.useMemo(() => {
        return {
            workbookId,
            fixedHeaderCollapsed: isFixedHeaderCollapsed,
            isEmbeddedMode: isEmbeddedMode(),
            isPublicMode: Boolean(isPublicMode),
            enableAssistant,
            currentTabId: tabId,
        };
    }, [enableAssistant, isFixedHeaderCollapsed, isPublicMode, tabId, workbookId]);

    return context;
};
