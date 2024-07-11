import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {useEffectOnce} from 'ui';
import {registry} from 'ui/registry';

import DialogChartWidget from '../../../../components/DialogChartWidget/DialogChartWidget';
import {DialogTextWidgetWrapper} from '../../../../components/DialogTextWidget';
import {DIALOG_TYPE} from '../../../../constants/dialogs';
import {changeNavigationPath, setItemData} from '../../store/actions/dashTyped';
import {closeDialog} from '../../store/actions/dialogs/actions';
import {
    selectCurrentTabId,
    selectDashWorkbookId,
    selectIsDialogVisible,
    selectOpenedItemData,
    selectWidgetsCurrentTab,
} from '../../store/selectors/dashTypedSelectors';

import Connections from './Connections/Connections';
import Control2 from './Control2/Control2';
import {GroupControl} from './GroupControl/GroupControl';
import Settings from './Settings/Settings';
import Tabs from './Tabs/Tabs';
import {Title} from './Title/Title';

// TODO: to see if dialogs with complex content will slow down due to the fact that mount/unmount is happening
// TODO: if there are noticeable lags, it will be possible to render the contents of the dialogs as available
// TODO: however, this content is not really needed by those who are not going to edit the dashboard
export function Dialogs() {
    const dispatch = useDispatch();

    const openedDialog = useSelector((state) => state.dash.openedDialog);
    const widgetType = useSelector((state) => state.dash.openedItemWidgetType);
    const openedItemId = useSelector((state) => state.dash.openedItemId);
    const openedItemData = useSelector((state) => selectOpenedItemData(state));
    const currentTabId = useSelector((state) => selectCurrentTabId(state));
    const workbookId = useSelector((state) => selectDashWorkbookId(state));
    const widgetsCurrentTab = useSelector((state) => selectWidgetsCurrentTab(state));
    const navigationPath = useSelector((state) => state.dash.navigationPath);

    const dialogTextIsVisible = useSelector((state) =>
        selectIsDialogVisible(state, DIALOG_TYPE.TEXT),
    );
    const dialogChartIsVisible = useSelector((state) =>
        selectIsDialogVisible(state, DIALOG_TYPE.WIDGET),
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
            return <Title />;
        case DIALOG_TYPE.TEXT: {
            return (
                <DialogTextWidgetWrapper
                    openedItemId={openedItemId}
                    openedItemData={openedItemData}
                    dialogIsVisible={dialogTextIsVisible}
                    closeDialog={() => dispatch(closeDialog())}
                    setItemData={(newItemData) => {
                        dispatch(setItemData(newItemData));
                    }}
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
                    dialogIsVisible={dialogChartIsVisible}
                    workbookId={workbookId}
                    widgetsCurrentTab={widgetsCurrentTab}
                    closeDialog={() => dispatch(closeDialog())}
                    setItemData={(newItemData) => {
                        dispatch(setItemData(newItemData));
                    }}
                    navigationPath={navigationPath}
                    changeNavigationPath={(newNavigationPath) => {
                        dispatch(changeNavigationPath(newNavigationPath));
                    }}
                />
            );
        case DIALOG_TYPE.CONTROL:
            return <Control2 />;
        case DIALOG_TYPE.GROUP_CONTROL:
            return <GroupControl />;
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
