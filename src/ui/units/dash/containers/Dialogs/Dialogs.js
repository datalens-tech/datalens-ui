import React from 'react';

import {DEFAULT_NAMESPACE} from '@gravity-ui/dashkit/helpers';
import {useDispatch, useSelector} from 'react-redux';
import {EntryScope} from 'shared';
import {useEffectOnce} from 'ui';
import {DialogEditItem, isDialogEditItemType} from 'ui/components/DialogEditItem/DialogEditItem';
import {registry} from 'ui/registry';

import {DIALOG_TYPE} from '../../../../constants/dialogs';
import {changeNavigationPath, setItemData} from '../../store/actions/dashTyped';
import {closeDialog} from '../../store/actions/dialogs/actions';
import {
    selectCurrentTabId,
    selectDashWorkbookId,
    selectEntryId,
    selectNavigationPath,
    selectOpenedItem,
    selectOpenedItemData,
    selectWidgetsCurrentTab,
} from '../../store/selectors/dashTypedSelectors';

import Connections from './Connections/Connections';
import Settings from './Settings/Settings';
import Tabs from './Tabs/Tabs';

// TODO: to see if dialogs with complex content will slow down due to the fact that mount/unmount is happening
// TODO: if there are noticeable lags, it will be possible to render the contents of the dialogs as available
// TODO: however, this content is not really needed by those who are not going to edit the dashboard
export function Dialogs() {
    const dispatch = useDispatch();

    const entryId = useSelector(selectEntryId);
    const openedDialog = useSelector((state) => state.dash.openedDialog);
    const widgetType = useSelector((state) => state.dash.openedItemWidgetType);
    const openedItemId = useSelector((state) => state.dash.openedItemId);
    const openedItemData = useSelector(selectOpenedItemData);
    const openedItem = useSelector(selectOpenedItem);
    const currentTabId = useSelector(selectCurrentTabId);
    const workbookId = useSelector(selectDashWorkbookId);
    const widgetsCurrentTab = useSelector(selectWidgetsCurrentTab);
    const navigationPath = useSelector(selectNavigationPath);

    useEffectOnce(() => {
        return () => {
            dispatch(closeDialog());
        };
    });

    const setItemDataHandle = React.useCallback(
        (newItemData) => {
            dispatch(setItemData(newItemData));
        },
        [dispatch],
    );

    const closeDialogHandle = React.useCallback(() => {
        dispatch(closeDialog());
    }, [dispatch]);

    const changeNavigationPathHandle = React.useCallback(
        (newNavigationPath) => {
            dispatch(changeNavigationPath(newNavigationPath));
        },
        [dispatch],
    );

    if (openedDialog && isDialogEditItemType(openedDialog)) {
        return (
            <DialogEditItem
                scope={EntryScope.Dash}
                entryId={entryId}
                type={openedDialog}
                openedItemId={openedItemId}
                openedItemNamespace={openedItem?.namespace ?? DEFAULT_NAMESPACE}
                openedItemDefaults={openedItem?.defaults ?? null}
                openedItemData={openedItemData}
                widgetType={widgetType}
                currentTabId={currentTabId}
                workbookId={workbookId}
                widgetsCurrentTab={widgetsCurrentTab}
                closeDialog={closeDialogHandle}
                setItemData={setItemDataHandle}
                navigationPath={navigationPath}
                changeNavigationPath={changeNavigationPathHandle}
            />
        );
    }

    switch (openedDialog) {
        case DIALOG_TYPE.CONNECTIONS:
            return <Connections />;
        case DIALOG_TYPE.TABS:
            return <Tabs />;
        case DIALOG_TYPE.SETTINGS:
            return <Settings />;
        case DIALOG_TYPE.SELECT_STATE: {
            const DashSelectStateDialog = registry.dash.components.get('DashSelectStateDialog');
            return <DashSelectStateDialog />;
        }
    }
    return null;
}

export default Dialogs;
