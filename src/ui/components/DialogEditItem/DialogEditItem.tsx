import React from 'react';

import type {RealTheme} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import type {EntryScope, StringParams, WidgetType} from 'shared';
import {DashTabItemType} from 'shared';
import {ITEM_TYPE} from 'ui/constants/dialogs';
import {useEffectOnce} from 'ui/hooks';
import {initControlDialog, resetControlDialog} from 'ui/store/actions/controlDialog/controlDialog';
import {selectOpenedDialogType} from 'ui/store/selectors/controlDialog';
import type {DialogEditItemFeaturesProp} from 'ui/store/typings/controlDialog';
import type {SetItemDataArgs, SetItemDataPayload} from 'ui/units/dash/store/actions/dashTyped';

import type {CommonVisualSettings} from '../DashKit/DashKit';
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
}>;

type DialogEditTextProps = ExtendAny<{
    type: DashTabItemType.Text;
    openedItemData: React.ComponentProps<typeof DialogTextWidgetWrapper>['openedItemData'];
}>;

type DialogEditChartProps = ExtendAny<{
    type: DashTabItemType.Widget;
    openedItemData: React.ComponentProps<typeof DialogChartWidget>['openedItemData'];
    widgetType: WidgetType;
    widgetsCurrentTab: {
        [key: string]: string;
    };
}>;

type DialogEditGroupControlProps = ExtendAny<{
    type: DashTabItemType.GroupControl;
    openedItemData: React.ComponentProps<typeof DialogGroupControl>['openedItemData'];
    selectorsGroupTitlePlaceholder?: string;
}>;

type DialogEditExternalControlProps = ExtendAny<{
    type: DashTabItemType.Control;
    openedItemDefaults: StringParams;
}>;

type DialogEditImageProps = ExtendAny<{
    type: DashTabItemType.Image;
    openedItemData: React.ComponentProps<typeof DialogImageWidget>['openedItemData'];
}>;

type DialogEditSpecificProps =
    | DialogEditTitleProps
    | DialogEditTextProps
    | DialogEditChartProps
    | DialogEditGroupControlProps
    | DialogEditExternalControlProps
    | DialogEditImageProps;

export type DialogEditItemProps = {
    commonVisualSettings: CommonVisualSettings;
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
    setItemData: (args: SetItemDataPayload | SetItemDataArgs) => void;
} & DialogEditSpecificProps;

export const isDialogEditItemType = (type: string): type is DashTabItemType =>
    Object.values(ITEM_TYPE).includes(type as DashTabItemType);

// TypeGuard hook
function useNormalizedOpenedDialogData(props: DialogEditItemProps): DialogEditSpecificProps {
    const openedDialog = useSelector(selectOpenedDialogType);

    const {
        type,
        openedItemData,
        setItemData,
        widgetType,
        widgetsCurrentTab,
        openedItemDefaults,
        selectorsGroupTitlePlaceholder,
    } = props;

    return {
        type: openedDialog || type,
        openedItemData,
        setItemData,
        widgetType,
        widgetsCurrentTab,
        openedItemDefaults,
        selectorsGroupTitlePlaceholder,
    };
}

export const DialogEditItem: React.FC<DialogEditItemProps> = (props) => {
    const {
        features,
        theme,
        scope,
        entryId,
        openedItemId,
        openedItemNamespace,
        currentTabId,
        workbookId,
        navigationPath,
        changeNavigationPath,
        closeDialog,
        commonVisualSettings,
    } = props;

    const dispatch = useDispatch();
    const [isOpenedDialog, setOpenedDialog] = React.useState(false);
    const {
        type: openedDialog,
        openedItemData,
        setItemData,
        widgetType,
        widgetsCurrentTab,
        openedItemDefaults,
        selectorsGroupTitlePlaceholder,
    } = useNormalizedOpenedDialogData(props);

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
                    commonVisualSettings={commonVisualSettings}
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
                    commonVisualSettings={commonVisualSettings}
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
                    commonVisualSettings={commonVisualSettings}
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
                    commonVisualSettings={commonVisualSettings}
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
