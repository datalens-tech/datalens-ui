import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DashTabItemControlData, DashTabItemGroupControlData} from 'shared';
import {DashTabItemControlSourceType, DashTabItemType} from 'shared';
import {TabMenu} from 'ui/components/TabMenu/TabMenu';
import type {UpdateState} from 'ui/components/TabMenu/types';
import {TabActionType} from 'ui/components/TabMenu/types';
import {
    addSelectorToGroup,
    setActiveSelectorIndex,
    setSelectorDialogItem,
    updateSelectorsGroup,
} from 'ui/store/actions/controlDialog/controlDialog';
import {
    getSelectorDialogFromData,
    getSelectorGroupDialogFromData,
} from 'ui/store/reducers/controlDialog/controlDialog';
import {selectActiveSelectorIndex, selectSelectorsGroup} from 'ui/store/selectors/controlDialog';
import type {SelectorDialogState} from 'ui/store/typings/controlDialog';
import type {CopiedConfigData} from 'ui/units/dash/modules/helpers';
import {isItemPasteAllowed} from 'ui/units/dash/modules/helpers';
import {selectCurrentTabId} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import {isGroupItemVisibleOnTab, isItemGlobal} from 'ui/units/dash/utils/selectors';

import {TabItemWrapper} from './TabItemWrapper/TabItemWrapper';

import '../DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

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

    const pasteItemsList = pasteConfig?.data.group
        ? getSelectorGroupDialogFromData(
              pasteConfig?.data as unknown as DashTabItemGroupControlData,
          ).group
        : [
              getSelectorDialogFromData(
                  pasteConfig.data as unknown as DashTabItemControlData,
                  pasteConfig.defaults,
              ),
          ];

    if (!pasteConfig.copyContext?.targetDashTabId || !pasteConfig.copyContext?.targetEntryId) {
        return pasteItemsList;
    }

    // Saving the context for copying connections later in dash setItemData action
    const preparedPasteItems = pasteItemsList.map((item) => {
        return {
            ...item,
            originalId: item.id,
            targetDashTabId: pasteConfig.copyContext?.targetDashTabId,
            targetEntryId: pasteConfig.copyContext?.targetEntryId,
        };
    });

    return preparedPasteItems;
};

type GroupControlSidebarProps = {
    handleCopyItem: (itemIndex: number) => void;
};

export const GroupControlSidebar: React.FC<GroupControlSidebarProps> = ({handleCopyItem}) => {
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const activeSelectorIndex = useSelector(selectActiveSelectorIndex);
    const currentTabId = useSelector(selectCurrentTabId);

    const dispatch = useDispatch();

    const [defaultTabIndex, setDefaultTabIndex] = React.useState(selectorsGroup.group.length + 1);

    const isGlobal = React.useMemo(() => {
        return isItemGlobal({
            type: DashTabItemType.GroupControl,
            data: {
                group: selectorsGroup.group,
                impactType: selectorsGroup.impactType,
                impactTabsIds: selectorsGroup.impactTabsIds,
            },
        });
    }, [selectorsGroup.group, selectorsGroup.impactType, selectorsGroup.impactTabsIds]);

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

    const renderControlWrapper = React.useCallback(
        (item: SelectorDialogState, children: React.ReactNode) => {
            const isVisible = isGroupItemVisibleOnTab({
                item,
                tabId: currentTabId,
                groupImpactType: selectorsGroup.impactType,
                groupImpactTabsIds: selectorsGroup.impactTabsIds,
                isGlobal,
            });
            const impactType =
                item.impactType === undefined || item.impactType === 'asGroup'
                    ? selectorsGroup.impactType
                    : item.impactType;

            return (
                <TabItemWrapper isVisible={isVisible} impactType={impactType}>
                    {children}
                </TabItemWrapper>
            );
        },
        [currentTabId, selectorsGroup.impactType, selectorsGroup.impactTabsIds, isGlobal],
    );

    return (
        <TabMenu
            className={b('selectors-list')}
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
            renderWrapper={renderControlWrapper}
        />
    );
};
