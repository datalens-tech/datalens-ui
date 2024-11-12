import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Gear} from '@gravity-ui/icons';
import {Button, Checkbox, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DashTabItemGroupControlData} from 'shared';
import {
    DashTabItemControlSourceType,
    DashTabItemType,
    DialogGroupControlQa,
    TitlePlacementOption,
} from 'shared';
import type {CopiedConfigData} from 'ui/units/dash/modules/helpers';
import {isItemPasteAllowed} from 'ui/units/dash/modules/helpers';
import type {SelectorsGroupDialogState} from 'ui/units/dash/store/actions/controls/types';

import type {
    SelectorDialogState,
    SetSelectorDialogItemArgs,
} from '../../../units/dash/store/actions/dashTyped';
import {TabMenu} from '../../DialogChartWidget/TabMenu/TabMenu';
import type {TabMenuItemData, UpdateState} from '../../DialogChartWidget/TabMenu/types';
import {TabActionType} from '../../DialogChartWidget/TabMenu/types';
import {getSelectorDialogFromData, getSelectorGroupDialogFromData} from '../useGroupControlState';

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
        : [getSelectorDialogFromData(pasteConfig.data, pasteConfig.defaults)];

    return pasteItems as TabMenuItemData<SelectorDialogState>[];
};

type Props = {
    selectorsGroup: SelectorsGroupDialogState;
    activeSelectorIndex: number;
    openSelectorsPlacementDialog: () => void;
    addSelectorToGroup: (selectorArgs: SetSelectorDialogItemArgs) => void;
    copyControlToStorage: (index: number) => void;
    setSelectorDialogItem: (title: string) => void;
    setActiveSelectorIndex: (index: number) => void;
    updateSelectorsGroup: (selectorState: SelectorsGroupDialogState) => void;
};

export const GroupControlSidebar = ({
    selectorsGroup,
    activeSelectorIndex,
    openSelectorsPlacementDialog,
    addSelectorToGroup,
    copyControlToStorage,
    setSelectorDialogItem,
    setActiveSelectorIndex,
    updateSelectorsGroup,
}: Props) => {
    const initialTabIndex =
        selectorsGroup.group?.[0]?.title === i18n('label_default-tab', {index: 1}) ? 2 : 1;
    const [defaultTabIndex, setDefaultTabIndex] = React.useState(initialTabIndex);

    const isMultipleSelectors = selectorsGroup.group?.length > 1;

    const updateSelectorsList = React.useCallback(
        ({items, selectedItemIndex, action}: UpdateState<SelectorDialogState>) => {
            if (action === TabActionType.Skipped) {
                return;
            } else if (action === TabActionType.Add) {
                const newSelector = items[items.length - 1];
                addSelectorToGroup(newSelector);
            } else if (action !== TabActionType.ChangeChosen) {
                updateSelectorsGroup({
                    ...selectorsGroup,
                    group: items,
                    ...(items.length === 1 ? SINGLE_SELECTOR_SETTINGS : {}),
                });
            }

            setActiveSelectorIndex(selectedItemIndex);
        },
        [setActiveSelectorIndex, addSelectorToGroup, updateSelectorsGroup, selectorsGroup],
    );

    const getDefaultTabText = React.useCallback(() => {
        setDefaultTabIndex((currentTabIndex) => currentTabIndex + 1);
        return i18n('label_default-tab', {index: defaultTabIndex});
    }, [defaultTabIndex]);

    const handleChangeAutoHeight = React.useCallback(
        (value) => {
            updateSelectorsGroup({
                ...selectorsGroup,
                autoHeight: value,
            });
        },
        [updateSelectorsGroup, selectorsGroup],
    );

    const handleChangeButtonApply = React.useCallback(
        (value) => {
            updateSelectorsGroup({
                ...selectorsGroup,
                buttonApply: value,
            });
        },
        [updateSelectorsGroup, selectorsGroup],
    );

    const handleChangeButtonReset = React.useCallback(
        (value) => {
            updateSelectorsGroup({
                ...selectorsGroup,
                buttonReset: value,
            });
        },
        [updateSelectorsGroup, selectorsGroup],
    );

    const handleChangeUpdateControls = React.useCallback(
        (value: boolean) => {
            updateSelectorsGroup({
                ...selectorsGroup,
                updateControlsOnChange: value,
            });
        },
        [selectorsGroup, updateSelectorsGroup],
    );

    const showAutoHeight =
        isMultipleSelectors ||
        selectorsGroup.buttonApply ||
        selectorsGroup.buttonReset ||
        // until we have supported automatic height adjustment for case with top title placement,
        // we allow to enable autoheight
        selectorsGroup.group[0].titlePlacement === TitlePlacementOption.Top;
    const showUpdateControlsOnChange = selectorsGroup.buttonApply && isMultipleSelectors;

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
                    addButtonView="outlined"
                    onCopyItem={copyControlToStorage}
                    onUpdateItem={setSelectorDialogItem}
                />
            </div>
            <div className={b('settings')}>
                {showUpdateControlsOnChange && (
                    <div className={b('settings-container')}>
                        <div>
                            <span>{i18n('label_update-controls-on-change')}</span>
                            <HelpPopover
                                className={b('help-icon')}
                                htmlContent={i18n('context_update-controls-on-change')}
                            />
                        </div>
                        <Checkbox
                            checked={selectorsGroup.updateControlsOnChange}
                            onUpdate={handleChangeUpdateControls}
                            size="l"
                            qa={DialogGroupControlQa.updateControlOnChangeCheckbox}
                        />
                    </div>
                )}
                {showAutoHeight && (
                    <div className={b('settings-container')}>
                        <div>
                            <span>{i18n('label_autoheight-checkbox')}</span>
                        </div>
                        <Checkbox
                            checked={selectorsGroup.autoHeight}
                            onUpdate={handleChangeAutoHeight}
                            size="l"
                            qa={DialogGroupControlQa.autoHeightCheckbox}
                        />
                    </div>
                )}
                <div className={b('settings-container')}>
                    <div>
                        <span>{i18n('label_apply-button-checkbox')}</span>
                        <HelpPopover
                            className={b('help-icon')}
                            htmlContent={i18n('context_apply-button')}
                        />
                    </div>
                    <Checkbox
                        checked={selectorsGroup.buttonApply}
                        onUpdate={handleChangeButtonApply}
                        size="l"
                        qa={DialogGroupControlQa.applyButtonCheckbox}
                    />
                </div>
                <div className={b('settings-container')}>
                    <div>
                        <span>{i18n('label_reset-button-checkbox')}</span>
                        <HelpPopover
                            className={b('help-icon')}
                            htmlContent={i18n('context_reset-button')}
                        />
                    </div>
                    <Checkbox
                        checked={selectorsGroup.buttonReset}
                        onUpdate={handleChangeButtonReset}
                        size="l"
                        qa={DialogGroupControlQa.resetButtonCheckbox}
                    />
                </div>

                {isMultipleSelectors && (
                    <Button
                        view="outlined"
                        width="max"
                        className={b('order-selectors-button')}
                        onClick={openSelectorsPlacementDialog}
                        qa={DialogGroupControlQa.placementButton}
                    >
                        <Icon data={Gear} height={16} width={16} />
                        {i18n('button_selectors-placement')}
                    </Button>
                )}
            </div>
        </div>
    );
};