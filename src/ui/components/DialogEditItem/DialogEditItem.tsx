import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import type {
    DashTabItem,
    DashTabItemGroupControl,
    DashTabItemImage,
    DashTabItemText,
    DashTabItemTitle,
    DashTabItemWidget,
    EntryScope,
    StringParams,
    WidgetType,
} from 'shared';
import {DashTabItemType} from 'shared';
import {ITEM_TYPE} from 'ui/constants/dialogs';
import {useEffectOnce} from 'ui/hooks';
import {initControlDialog, resetControlDialog} from 'ui/store/actions/controlDialog';
import {selectOpenedDialogType} from 'ui/store/selectors/controlDialog';

import type {DialogChartWidgetFeatureProps} from '../DialogChartWidget/DialogChartWidget';
import DialogChartWidget from '../DialogChartWidget/DialogChartWidget';
import type {DialogExternalControlFeaturesProps} from '../DialogExternalControl/DialogExternalControl';
import DialogExternalControl from '../DialogExternalControl/DialogExternalControl';
import type {DialogGroupControlFeaturesProps} from '../DialogGroupControl/DialogGroupControl';
import {DialogGroupControl} from '../DialogGroupControl/DialogGroupControl';
import {DialogImageWidget} from '../DialogImageWidget';
import {DialogTextWidgetWrapper} from '../DialogTextWidget';
import type {DialogTextWidgetFeatureProps} from '../DialogTextWidget/DialogTextWidget';
import type {DialogTitleWidgetFeatureProps} from '../DialogTitleWidget/DialogTitleWidget';
import DialogTitleWidget from '../DialogTitleWidget/DialogTitleWidget';

type DialogEditTitleProps = {
    type: typeof ITEM_TYPE.TITLE;
    openedItemData: React.ComponentProps<typeof DialogTitleWidget>['openedItemData'];
    setItemData: React.ComponentProps<typeof DialogTitleWidget>['setItemData'];
    widgetType: any;
    widgetsCurrentTab: any;
    openedItemDefaults: any;
};

type DialogEditTextProps = {
    type: typeof ITEM_TYPE.TEXT;
    openedItemData: React.ComponentProps<typeof DialogTextWidgetWrapper>['openedItemData'];
    setItemData: React.ComponentProps<typeof DialogTextWidgetWrapper>['setItemData'];
    widgetType: any;
    widgetsCurrentTab: any;
    openedItemDefaults: any;
};

type DialogEditChartProps = {
    type: typeof ITEM_TYPE.WIDGET;
    openedItemData: React.ComponentProps<typeof DialogChartWidget>['openedItemData'];
    widgetType: WidgetType;
    setItemData: React.ComponentProps<typeof DialogChartWidget>['setItemData'];
    widgetsCurrentTab: {
        [key: string]: string;
    };
    openedItemDefaults: any;
};

type DialogEditGroupControlProps = {
    type: typeof ITEM_TYPE.GROUP_CONTROL;
    openedItemData: React.ComponentProps<typeof DialogGroupControl>['openedItemData'];
    setItemData: React.ComponentProps<typeof DialogGroupControl>['setItemData'];
    widgetType: any;
    widgetsCurrentTab: any;
    openedItemDefaults: any;
};

type DialogEditExternalControlProps = {
    type: typeof ITEM_TYPE.CONTROL;
    setItemData: React.ComponentProps<typeof DialogExternalControl>['setItemData'];
    openedItemData: any;
    widgetType: any;
    widgetsCurrentTab: any;
    openedItemDefaults: StringParams;
};

type DialogEditImageProps = {
    type: typeof ITEM_TYPE.IMAGE;
    openedItemData: React.ComponentProps<typeof DialogImageWidget>['openedItemData'];
    setItemData: React.ComponentProps<typeof DialogImageWidget>['onApply'];
    widgetType: any;
    widgetsCurrentTab: any;
    openedItemDefaults: any;
};

export type DialogEditItemFeaturesProp = {
    [DashTabItemType.Title]?: DialogTitleWidgetFeatureProps;
    [DashTabItemType.Text]?: DialogTextWidgetFeatureProps;
    [DashTabItemType.Widget]?: DialogChartWidgetFeatureProps;
    [DashTabItemType.GroupControl]?: DialogGroupControlFeaturesProps;
    [DashTabItemType.Control]?: DialogExternalControlFeaturesProps;
};

export type DialogEditItemProps = {
    entryId: string | null;
    scope: EntryScope;
    openedItemId: string | null;
    currentTabId: string | null;
    workbookId: string | null;
    closeDialog: () => void;
    navigationPath: string | null;
    openedItemNamespace: string;
    changeNavigationPath: (newNavigationPath: string) => void;
    features?: DialogEditItemFeaturesProp;
    openedItemData: DashTabItem['data'];
} & (
    | DialogEditTitleProps
    | DialogEditTextProps
    | DialogEditChartProps
    | DialogEditGroupControlProps
    | DialogEditExternalControlProps
    | DialogEditImageProps
);

export const isDialogEditItemType = (type: string): type is DashTabItemType =>
    Object.values(ITEM_TYPE).includes(type as DashTabItemType);

export const DialogEditItem: React.FC<DialogEditItemProps> = (props) => {
    const {
        features,
        scope,
        entryId,
        type,
        openedItemId,
        openedItemNamespace,
        openedItemDefaults,
        currentTabId,
        openedItemData,
        widgetType,
        widgetsCurrentTab,
        workbookId,
        navigationPath,
        changeNavigationPath,
        closeDialog,
        setItemData,
    } = props;

    const dispatch = useDispatch();
    const openedDialog = useSelector(selectOpenedDialogType);

    const [isOpenedDialog, setOpenedDialog] = React.useState(false);

    useEffectOnce(() => {
        dispatch(
            initControlDialog({
                type,
                id: openedItemId,
                data: openedItemData,
                defaults: openedItemDefaults,
                openedItemMeta: {
                    scope,
                    entryId,
                    namespace: openedItemNamespace,
                    currentTabId,
                    workbookId,
                },
            }),
        );

        return () => {
            dispatch(resetControlDialog());
        };
    });

    React.useEffect(() => {
        setOpenedDialog(Boolean(openedDialog));
    }, [dispatch, openedDialog]);

    switch (openedDialog) {
        case ITEM_TYPE.TITLE:
            return (
                <DialogTitleWidget
                    openedItemId={openedItemId}
                    openedItemData={openedItemData as DashTabItemTitle['data']}
                    dialogIsVisible={isOpenedDialog}
                    closeDialog={closeDialog}
                    setItemData={setItemData}
                    {...features?.[DashTabItemType.Title]}
                />
            );
        case ITEM_TYPE.TEXT: {
            return (
                <DialogTextWidgetWrapper
                    openedItemId={openedItemId}
                    openedItemData={openedItemData as DashTabItemText['data']}
                    dialogIsVisible={isOpenedDialog}
                    closeDialog={closeDialog}
                    setItemData={setItemData}
                    {...features?.[DashTabItemType.Text]}
                />
            );
        }
        case ITEM_TYPE.WIDGET:
            return (
                <DialogChartWidget
                    openedItemId={openedItemId}
                    openedItemData={openedItemData as DashTabItemWidget['data']}
                    widgetType={widgetType}
                    currentTabId={currentTabId}
                    dialogIsVisible={isOpenedDialog}
                    workbookId={workbookId}
                    widgetsCurrentTab={widgetsCurrentTab}
                    closeDialog={closeDialog}
                    setItemData={setItemData}
                    navigationPath={navigationPath}
                    changeNavigationPath={changeNavigationPath}
                    {...features?.[DashTabItemType.Widget]}
                />
            );
        case ITEM_TYPE.CONTROL:
            return (
                <DialogExternalControl
                    dialogIsVisible={isOpenedDialog}
                    closeDialog={closeDialog}
                    setItemData={setItemData}
                    navigationPath={navigationPath}
                    changeNavigationPath={changeNavigationPath}
                    {...features?.[DashTabItemType.Control]}
                />
            );
        case ITEM_TYPE.GROUP_CONTROL:
            return (
                <DialogGroupControl
                    openedItemData={openedItemData as DashTabItemGroupControl['data']}
                    dialogIsVisible={isOpenedDialog}
                    closeDialog={closeDialog}
                    setItemData={setItemData}
                    navigationPath={navigationPath}
                    changeNavigationPath={changeNavigationPath}
                    {...features?.[DashTabItemType.GroupControl]}
                />
            );

        case ITEM_TYPE.IMAGE:
            return (
                <DialogImageWidget
                    scope={scope}
                    openedItemId={openedItemId}
                    openedItemData={openedItemData as DashTabItemImage['data']}
                    dialogIsVisible={isOpenedDialog}
                    onClose={closeDialog}
                    onApply={setItemData}
                />
            );
        default: {
            return null;
        }
    }
};
