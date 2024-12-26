import React from 'react';

import {Gear} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DashTabItemControlData, DashTabItemGroupControlData} from 'shared';
import {DashTabItemControlSourceType, DashTabItemType, DialogGroupControlQa} from 'shared';
import {TabMenu} from 'ui/components/TabMenu/TabMenu';
import type {TabMenuItemData, UpdateState} from 'ui/components/TabMenu/types';
import {TabActionType} from 'ui/components/TabMenu/types';
import {
    addSelectorToGroup,
    setActiveSelectorIndex,
    setSelectorDialogItem,
    updateSelectorsGroup,
} from 'ui/store/actions/controlDialog';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {
    getSelectorDialogFromData,
    getSelectorGroupDialogFromData,
} from 'ui/store/reducers/controlDialog';
import {selectActiveSelectorIndex, selectSelectorsGroup} from 'ui/store/selectors/controlDialog';
import type {SelectorDialogState, SelectorsGroupDialogState} from 'ui/store/typings/controlDialog';
import type {CopiedConfigData} from 'ui/units/dash/modules/helpers';
import {isItemPasteAllowed} from 'ui/units/dash/modules/helpers';

import {DIALOG_EXTENDED_SETTINGS} from '../../DialogExtendedSettings/DialogExtendedSettings';

import '../DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

const SINGLE_SELECTOR_SETTINGS: Partial<SelectorsGroupDialogState> = {
    buttonApply: false,
    buttonReset: false,
    autoHeight: false,
};

const canPasteItems = (pasteConfig: CopiedConfigData | null, workbookId?: string | null) => {
    if (
        pasteConfig &&
        isItemPasteAllowed(pasteConfig, workbookId) &&
        (pasteConfig.type === DashTabItemType.Control ||
            pasteConfig.type === DashTabItemType.GroupControl) &&
        pasteConfig.data.sourceType !== DashTabItemControlSourceType.External
    ) {
        return true;
    }

    return false;
};

const handlePasteItems = (pasteConfig: CopiedConfigData | null) => {
    if (!pasteConfig) {
        return null;
    }

    const pasteItems = pasteConfig?.data.group
        ? getSelectorGroupDialogFromData(
              pasteConfig?.data as unknown as DashTabItemGroupControlData,
          ).group
        : [
              getSelectorDialogFromData(
                  pasteConfig.data as unknown as DashTabItemControlData,
                  pasteConfig.defaults,
              ),
          ];

    return pasteItems as TabMenuItemData<SelectorDialogState>[];
};

export const GroupControlSidebar: React.FC<{
    handleCopyItem: (itemIndex: number) => void;
    enableAutoheightDefault?: boolean;
    showSelectorsGroupTitle?: boolean;
}> = ({enableAutoheightDefault, handleCopyItem, showSelectorsGroupTitle}) => {
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const activeSelectorIndex = useSelector(selectActiveSelectorIndex);

    const dispatch = useDispatch();

    const initialTabIndex =
        selectorsGroup.group?.[0]?.title === i18n('label_default-tab', {index: 1}) ? 2 : 1;
    const [defaultTabIndex, setDefaultTabIndex] = React.useState(initialTabIndex);

    const updateSelectorsList = React.useCallback(
        ({items, selectedItemIndex, action}: UpdateState<SelectorDialogState>) => {
            if (action === TabActionType.Skipped) {
                return;
            } else if (action === TabActionType.Add) {
                const newSelector = items[items.length - 1];
                dispatch(addSelectorToGroup(newSelector));
            } else if (action !== TabActionType.ChangeChosen) {
                dispatch(
                    updateSelectorsGroup({
                        ...selectorsGroup,
                        group: items,
                        ...(items.length === 1 ? SINGLE_SELECTOR_SETTINGS : {}),
                    }),
                );
            }

            dispatch(
                setActiveSelectorIndex({
                    activeSelectorIndex: selectedItemIndex,
                }),
            );
        },
        [dispatch, selectorsGroup],
    );

    const getDefaultTabText = React.useCallback(() => {
        setDefaultTabIndex((currentTabIndex) => currentTabIndex + 1);
        return i18n('label_default-tab', {index: defaultTabIndex});
    }, [defaultTabIndex]);

    const handleClosePlacementDialog = React.useCallback(() => {
        dispatch(closeDialog());
    }, [dispatch]);

    const handleExtendedSettingsClick = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_EXTENDED_SETTINGS,
                props: {
                    onClose: handleClosePlacementDialog,
                    enableAutoheightDefault,
                    showSelectorsGroupTitle,
                },
            }),
        );
    }, [dispatch, handleClosePlacementDialog, enableAutoheightDefault]);

    const handleUpdateItem = React.useCallback(
        (title: string) => {
            dispatch(
                setSelectorDialogItem({
                    title,
                }),
            );
        },
        [dispatch],
    );

    return (
        <div className={b('sidebar')}>
            <div className={b('selectors-list')}>
                <TabMenu
                    items={selectorsGroup.group}
                    selectedItemIndex={activeSelectorIndex}
                    onUpdate={updateSelectorsList}
                    addButtonText={i18n('button_add-selector')}
                    pasteButtonText={i18n('button_paste-selector')}
                    defaultTabText={getDefaultTabText}
                    enableActionMenu={true}
                    onPasteItems={handlePasteItems}
                    canPasteItems={canPasteItems}
                    onCopyItem={handleCopyItem}
                    onUpdateItem={handleUpdateItem}
                />
            </div>
            <div className={b('settings')}>
                <Button
                    className={b('extended-settings-button')}
                    width="max"
                    onClick={handleExtendedSettingsClick}
                    qa={DialogGroupControlQa.extendedSettingsButton}
                >
                    <Icon data={Gear} height={16} width={16} />
                    {i18n('button_extended-settings')}
                </Button>
            </div>
        </div>
    );
};
