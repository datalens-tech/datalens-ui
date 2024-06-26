import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import type {ConfigItemGroup, PreparedCopyItemOptions} from '@gravity-ui/dashkit';
import {Gear} from '@gravity-ui/icons';
import {Button, Checkbox, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DashTabItemControlData} from 'shared';
import {DashTabItemControlSourceType, DashTabItemType, DialogGroupControlQa} from 'shared';
import {defaultControlLayout} from 'ui/components/DashKit/constants';
import {COPIED_WIDGET_STORAGE_KEY} from 'ui/constants';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import type {CopiedConfigContext, CopiedConfigData} from 'ui/units/dash/modules/helpers';
import {getPreparedCopyItemOptions, isItemPasteAllowed} from 'ui/units/dash/modules/helpers';
import {
    addSelectorToGroup,
    setActiveSelectorIndex,
    updateSelectorsGroup,
} from 'ui/units/dash/store/actions/controls/actions';
import {
    getControlDefaultsForField,
    getItemDataSource,
} from 'ui/units/dash/store/actions/controls/helpers';
import type {SelectorsGroupDialogState} from 'ui/units/dash/store/actions/controls/types';
import {
    getGroupSelectorDialogInitialState,
    getSelectorDialogFromData,
    getSelectorGroupDialogFromData,
} from 'ui/units/dash/store/reducers/dash';
import {
    selectDashWorkbookId,
    selectOpenedItem,
} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import {
    selectActiveSelectorIndex,
    selectSelectorsGroup,
} from 'units/dash/store/selectors/controls/selectors';

import type {SelectorDialogState} from '../../../../store/actions/dashTyped';
import {TabMenu} from '../../Widget/TabMenu/TabMenu';
import type {TabMenuItemData, UpdateState} from '../../Widget/TabMenu/types';
import {TabActionType} from '../../Widget/TabMenu/types';
import {CONTROLS_PLACEMENT_MODE} from '../../constants';
import {DIALOG_SELECTORS_PLACEMENT} from '../ControlsPlacementDialog/ControlsPlacementDialog';

import './../GroupControl.scss';

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
        ? getSelectorGroupDialogFromData(pasteConfig?.data).group
        : [getSelectorDialogFromData(pasteConfig.data, pasteConfig.defaults)];

    return pasteItems as TabMenuItemData<SelectorDialogState>[];
};

export const GroupControlSidebar = () => {
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const activeSelectorIndex = useSelector(selectActiveSelectorIndex);
    const openedItem = useSelector(selectOpenedItem);
    const workbookId = useSelector(selectDashWorkbookId);

    const dispatch = useDispatch();

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

    const handleSelectorsPlacementClick = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_SELECTORS_PLACEMENT,
                props: {
                    onClose: handleClosePlacementDialog,
                },
            }),
        );
    }, [dispatch, handleClosePlacementDialog]);

    const handleChangeAutoHeight = React.useCallback(
        (value) => {
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    autoHeight: value,
                }),
            );
        },
        [dispatch, selectorsGroup],
    );

    const handleChangeButtonApply = React.useCallback(
        (value) => {
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    buttonApply: value,
                }),
            );
        },
        [dispatch, selectorsGroup],
    );

    const handleChangeButtonReset = React.useCallback(
        (value) => {
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    buttonReset: value,
                }),
            );
        },
        [dispatch, selectorsGroup],
    );

    const handleChangeUpdateControls = (value: boolean) => {
        dispatch(
            updateSelectorsGroup({
                ...selectorsGroup,
                updateControlsOnChange: value,
            }),
        );
    };

    // logic is copied from dashkit
    const handleCopyItem = (itemIndex: number) => {
        if (!openedItem) {
            return;
        }

        const selectorToCopy = selectorsGroup.group[itemIndex];

        const copiedItem = {
            title: selectorToCopy.title,
            sourceType: selectorToCopy.sourceType,
            source: getItemDataSource(selectorToCopy) as DashTabItemControlData['source'],
            defaults: getControlDefaultsForField(selectorToCopy),
            namespace: openedItem.namespace,
            width: '',
            placementMode: CONTROLS_PLACEMENT_MODE.AUTO,
        };

        const options: PreparedCopyItemOptions<CopiedConfigContext> = {
            timestamp: Date.now(),
            data: {
                ...getGroupSelectorDialogInitialState(),
                group: [copiedItem as unknown as ConfigItemGroup],
            },
            type: DashTabItemType.GroupControl,
            defaults: copiedItem.defaults,
            namespace: copiedItem.namespace,
            layout: defaultControlLayout,
        };

        const preparedOptions = getPreparedCopyItemOptions(options, null, {
            workbookId: workbookId ?? null,
        });

        localStorage.setItem(COPIED_WIDGET_STORAGE_KEY, JSON.stringify(preparedOptions));
        // https://stackoverflow.com/questions/35865481/storage-event-not-firing
        window.dispatchEvent(new Event('storage'));
    };

    const showAutoHeight =
        isMultipleSelectors || selectorsGroup.buttonApply || selectorsGroup.buttonReset;
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
                    onCopyItem={handleCopyItem}
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
                        onClick={handleSelectorsPlacementClick}
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
