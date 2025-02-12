import React from 'react';

import type {RealTheme} from '@gravity-ui/uikit';
import {useDispatch} from 'react-redux';
import type {EntryScope, StringParams, WidgetType} from 'shared';
import {DashTabItemType} from 'shared';
import {ITEM_TYPE} from 'ui/constants/dialogs';
import {useEffectOnce} from 'ui/hooks';
import {initControlDialog, resetControlDialog} from 'ui/store/actions/controlDialog';
import type {DialogEditItemFeaturesProp} from 'ui/store/typings/controlDialog';

import DialogChartWidget from '../DialogChartWidget/DialogChartWidget';
import DialogExternalControl from '../DialogExternalControl/DialogExternalControl';
import {DialogGroupControl} from '../DialogGroupControl/DialogGroupControl';
import {DialogImageWidget} from '../DialogImageWidget';
import {DialogTextWidgetWrapper} from '../DialogTextWidget';
import DialogTitleWidget from '../DialogTitleWidget/DialogTitleWidget';

type DialogEditProperties =
    | 'type'
    | 'openedItemData'
    | 'setItemData'
    | 'widgetType'
    | 'widgetsCurrentTab'
    | 'openedItemDefaults'
    | 'selectorsGroupTitlePlaceholder';

type ValidPartialProps = Partial<Record<Exclude<DialogEditProperties, 'type'>, unknown>> & {
    type: DashTabItemType;
};

type ExtendAny<
    P extends ValidPartialProps,
    AnyProps extends PropertyKey = Exclude<DialogEditProperties, keyof P>,
> = Pick<P & Pick<{[key: PropertyKey]: any}, AnyProps>, DialogEditProperties>;

type DialogEditTitleProps = ExtendAny<{
    type: DashTabItemType.Title;
    openedItemData: React.ComponentProps<typeof DialogTitleWidget>['openedItemData'];
    setItemData: React.ComponentProps<typeof DialogTitleWidget>['setItemData'];
}>;

type DialogEditTextProps = ExtendAny<{
    type: DashTabItemType.Text;
    openedItemData: React.ComponentProps<typeof DialogTextWidgetWrapper>['openedItemData'];
    setItemData: React.ComponentProps<typeof DialogTextWidgetWrapper>['setItemData'];
}>;

type DialogEditChartProps = ExtendAny<{
    type: DashTabItemType.Widget;
    openedItemData: React.ComponentProps<typeof DialogChartWidget>['openedItemData'];
    widgetType: WidgetType;
    setItemData: React.ComponentProps<typeof DialogChartWidget>['setItemData'];
    widgetsCurrentTab: {
        [key: string]: string;
    };
}>;

type DialogEditGroupControlProps = ExtendAny<{
    type: DashTabItemType.GroupControl;
    openedItemData: React.ComponentProps<typeof DialogGroupControl>['openedItemData'];
    setItemData: React.ComponentProps<typeof DialogGroupControl>['setItemData'];
    selectorsGroupTitlePlaceholder?: string;
}>;

type DialogEditExternalControlProps = ExtendAny<{
    type: DashTabItemType.Control;
    setItemData: React.ComponentProps<typeof DialogExternalControl>['setItemData'];
    openedItemDefaults: StringParams;
}>;

type DialogEditImageProps = ExtendAny<{
    type: DashTabItemType.Image;
    openedItemData: React.ComponentProps<typeof DialogImageWidget>['openedItemData'];
    setItemData: React.ComponentProps<typeof DialogImageWidget>['onApply'];
}>;

type DialogEditSpecificProps =
    | DialogEditTitleProps
    | DialogEditTextProps
    | DialogEditChartProps
    | DialogEditGroupControlProps
    | DialogEditExternalControlProps
    | DialogEditImageProps;

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
    theme?: RealTheme;
} & DialogEditSpecificProps;

export const isDialogEditItemType = (type: string): type is DashTabItemType =>
    Object.values(ITEM_TYPE).includes(type as DashTabItemType);

export const DialogEditItem: React.FC<DialogEditItemProps> = (props) => {
    const {
        features,
        theme,
        scope,
        entryId,
        type: openedDialog,
        openedItemId,
        openedItemNamespace,
        openedItemDefaults,
        currentTabId,
        openedItemData,
        widgetType,
        widgetsCurrentTab,
        workbookId,
        navigationPath,
        selectorsGroupTitlePlaceholder,
        changeNavigationPath,
        closeDialog,
        setItemData,
    } = props;

    const dispatch = useDispatch();
    const [isOpenedDialog, setOpenedDialog] = React.useState(false);

    useEffectOnce(() => {
        dispatch(
            initControlDialog({
                type: openedDialog,
                id: openedItemId,
                data: openedItemData,
                defaults: openedItemDefaults,
                features,
                theme,
                titlePlaceholder: selectorsGroupTitlePlaceholder,
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
        case DashTabItemType.Title:
            return (
                <DialogTitleWidget
                    openedItemId={openedItemId}
                    openedItemData={openedItemData}
                    setItemData={setItemData}
                    closeDialog={closeDialog}
                    dialogIsVisible={isOpenedDialog}
                    theme={theme}
                    {...features?.[openedDialog]}
                />
            );
        case DashTabItemType.Text: {
            return (
                <DialogTextWidgetWrapper
                    openedItemId={openedItemId}
                    openedItemData={openedItemData}
                    setItemData={setItemData}
                    closeDialog={closeDialog}
                    dialogIsVisible={isOpenedDialog}
                    theme={theme}
                    {...features?.[openedDialog]}
                />
            );
        }
        case DashTabItemType.Widget:
            return (
                <DialogChartWidget
                    openedItemId={openedItemId}
                    openedItemData={openedItemData}
                    widgetType={widgetType}
                    currentTabId={currentTabId}
                    widgetsCurrentTab={widgetsCurrentTab}
                    setItemData={setItemData}
                    closeDialog={closeDialog}
                    navigationPath={navigationPath}
                    changeNavigationPath={changeNavigationPath}
                    workbookId={workbookId}
                    dialogIsVisible={isOpenedDialog}
                    theme={theme}
                    {...features?.[openedDialog]}
                />
            );
        case DashTabItemType.Control:
            return (
                <DialogExternalControl
                    setItemData={setItemData}
                    closeDialog={closeDialog}
                    navigationPath={navigationPath}
                    changeNavigationPath={changeNavigationPath}
                    dialogIsVisible={isOpenedDialog}
                    theme={theme}
                    {...features?.[openedDialog]}
                />
            );
        case DashTabItemType.GroupControl:
            return (
                <DialogGroupControl
                    openedItemData={openedItemData}
                    setItemData={setItemData}
                    closeDialog={closeDialog}
                    navigationPath={navigationPath}
                    changeNavigationPath={changeNavigationPath}
                    selectorsGroupTitlePlaceholder={selectorsGroupTitlePlaceholder}
                    dialogIsVisible={isOpenedDialog}
                    theme={theme}
                    {...features?.[openedDialog]}
                />
            );

        case DashTabItemType.Image:
            return (
                <DialogImageWidget
                    scope={scope}
                    openedItemData={openedItemData}
                    onApply={props.setItemData}
                    onClose={closeDialog}
                    openedItemId={openedItemId}
                    dialogIsVisible={isOpenedDialog}
                    theme={theme}
                    {...features?.[openedDialog]}
                />
            );
        default: {
            return null;
        }
    }
};
