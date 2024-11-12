import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {useEffectOnce} from 'ui';
import {registry} from 'ui/registry';

import DialogChartWidget from '../../../../components/DialogChartWidget/DialogChartWidget';
import {DialogGroupControl} from '../../../../components/DialogGroupControl/DialogGroupControl';
import {DialogTextWidgetWrapper} from '../../../../components/DialogTextWidget';
import DialogTitleWidget from '../../../../components/DialogTitleWidget/DialogTitleWidget';
import {DIALOG_TYPE} from '../../../../constants/dialogs';
import {changeNavigationPath, setItemData} from '../../store/actions/dashTyped';
import {closeDialog} from '../../store/actions/dialogs/actions';
import {
    selectCurrentTabId,
    selectDashWorkbookId,
    selectOpenedDialogType,
    selectOpenedItemData,
    selectWidgetsCurrentTab,
} from '../../store/selectors/dashTypedSelectors';

import Connections from './Connections/Connections';
import Control2 from './Control2/Control2';
import Settings from './Settings/Settings';
import Tabs from './Tabs/Tabs';

// TODO: to see if dialogs with complex content will slow down due to the fact that mount/unmount is happening
// TODO: if there are noticeable lags, it will be possible to render the contents of the dialogs as available
// TODO: however, this content is not really needed by those who are not going to edit the dashboard
export function Dialogs() {
    const dispatch = useDispatch();

    const openedDialog = useSelector(selectOpenedDialogType);
    const widgetType = useSelector((state) => state.dash.openedItemWidgetType);
    const openedItemId = useSelector((state) => state.dash.openedItemId);
    const openedItemData = useSelector(selectOpenedItemData);
    const currentTabId = useSelector(selectCurrentTabId);
    const workbookId = useSelector(selectDashWorkbookId);
    const widgetsCurrentTab = useSelector(selectWidgetsCurrentTab);
    const navigationPath = useSelector((state) => state.dash.navigationPath);

    const handleCloseDialog = React.useCallback(() => {
        dispatch(closeDialog());
    }, [dispatch]);

    const handleSetItemData = React.useCallback(
        (newItemData) => {
            dispatch(setItemData(newItemData));
        },
        [dispatch],
    );

    const handleChangeNavigationPath = React.useCallback(
        (newNavigationPath) => {
            dispatch(changeNavigationPath(newNavigationPath));
        },
        [dispatch],
    );

    useEffectOnce(() => {
        return () => {
            dispatch(closeDialog());
        };
    });

    switch (openedDialog) {
        case DIALOG_TYPE.CONNECTIONS:
            return <Connections />;
        case DIALOG_TYPE.TABS:
            return <Tabs />;
        case DIALOG_TYPE.TITLE:
            return (
                <DialogTitleWidget
                    openedItemId={openedItemId}
                    openedItemData={openedItemData}
                    dialogIsVisible={true}
                    closeDialog={handleCloseDialog}
                    setItemData={handleSetItemData}
                />
            );
        case DIALOG_TYPE.TEXT: {
            return (
                <DialogTextWidgetWrapper
                    openedItemId={openedItemId}
                    openedItemData={openedItemData}
                    dialogIsVisible={true}
                    closeDialog={handleCloseDialog}
                    setItemData={handleSetItemData}
                />
            );
        }
        case DIALOG_TYPE.WIDGET:
            return (
                <DialogChartWidget
                    openedItemId={openedItemId}
                    openedItemData={openedItemData}
                    widgetType={widgetType}
                    currentTabId={currentTabId}
                    dialogIsVisible={true}
                    workbookId={workbookId}
                    widgetsCurrentTab={widgetsCurrentTab}
                    closeDialog={handleCloseDialog}
                    setItemData={handleSetItemData}
                    navigationPath={navigationPath}
                    changeNavigationPath={handleChangeNavigationPath}
                />
            );
        case DIALOG_TYPE.CONTROL:
            return <Control2 />;
        case DIALOG_TYPE.GROUP_CONTROL:
            return (
                <DialogGroupControl
                    openedItemId={openedItemId}
                    openedItemData={openedItemData}
                    dialogIsVisible={true}
                    closeDialog={handleCloseDialog}
                    setItemData={handleSetItemData}
                />
            );
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
