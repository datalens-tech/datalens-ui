import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Gear} from '@gravity-ui/icons';
import {Button, Checkbox, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DashTabItemType, DialogGroupControlQa} from 'shared';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import type {CopiedConfigData} from 'ui/units/dash/modules/helpers';
import {getPastedWidgetData, isItemPasteAllowed} from 'ui/units/dash/modules/helpers';
import {
    addSelectorToGroup,
    setActiveSelectorIndex,
    updateSelectorsGroup,
} from 'ui/units/dash/store/actions/controls/actions';
import type {SelectorsGroupDialogState} from 'ui/units/dash/store/actions/controls/types';
import {getSelectorDialogSpecificFields} from 'ui/units/dash/store/reducers/dash';
import {selectWorkbookId} from 'ui/units/workbooks/store/selectors';
import {
    selectActiveSelectorIndex,
    selectSelectorsGroup,
} from 'units/dash/store/selectors/controls/selectors';

import type {SelectorDialogState} from '../../../../store/actions/dashTyped';
import type {ListState, TabMenuItemData} from '../../Widget/TabMenu/TabMenu';
import {TabMenu} from '../../Widget/TabMenu/TabMenu';
import {DIALOG_SELECTORS_PLACEMENT} from '../ControlsPlacementDialog/ControlsPlacementDialog';

import './../GroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

const SINGLE_SELECTOR_SETTINGS: Partial<SelectorsGroupDialogState> = {
    buttonApply: false,
    buttonReset: false,
    autoHeight: false,
};

const getPasteItemHandler = (workbookId: string | null) => {
    const pasteConfig = getPastedWidgetData() as CopiedConfigData;

    if (
        pasteConfig &&
        isItemPasteAllowed(pasteConfig, workbookId) &&
        (pasteConfig.type === DashTabItemType.Control ||
            pasteConfig.type === DashTabItemType.GroupControl)
    ) {
        return () => {
            // remove old ids, add specific for dialog fields, part of important fields is in config sources
            const pasteItems = pasteConfig?.data.group
                ? pasteConfig?.data.group.map((groupItem) => {
                      const controlSources =
                          typeof groupItem.source === 'object' ? groupItem.source : {};

                      return {
                          ...groupItem,
                          ...controlSources,
                          id: undefined,
                          ...getSelectorDialogSpecificFields(),
                      };
                  })
                : [{...pasteConfig, id: undefined, ...getSelectorDialogSpecificFields()}];

            return pasteItems as TabMenuItemData<SelectorDialogState>[];
        };
    }

    return null;
};

export const GroupControlSidebar = () => {
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const activeSelectorIndex = useSelector(selectActiveSelectorIndex);
    const workbookId = useSelector(selectWorkbookId);
    const dispatch = useDispatch();

    const initialTabIndex =
        selectorsGroup.group?.[0]?.title === i18n('label_default-tab', {index: 1}) ? 2 : 1;
    const [defaultTabIndex, setDefaultTabIndex] = React.useState(initialTabIndex);

    const isMultipleSelectors = selectorsGroup.group?.length > 1;

    const updateSelectorsList = React.useCallback(
        ({items, selectedItemIndex, action}: ListState<SelectorDialogState>) => {
            if (action === 'add') {
                const newSelector = items[items.length - 1];
                dispatch(addSelectorToGroup(newSelector));
            } else if (action !== 'changeChosen') {
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

    const showAutoHeight =
        isMultipleSelectors || selectorsGroup.buttonApply || selectorsGroup.buttonReset;
    const showUpdateControlsOnChange = selectorsGroup.buttonApply && isMultipleSelectors;

    const handlePasteItem = getPasteItemHandler(workbookId);

    return (
        <div className={b('sidebar')}>
            <div className={b('selectors-list')}>
                <TabMenu
                    items={selectorsGroup.group}
                    selectedItemIndex={activeSelectorIndex}
                    update={updateSelectorsList}
                    addButtonText={i18n('button_add-selector')}
                    pasteButtonText={i18n('button_paste-selector')}
                    defaultTabText={getDefaultTabText}
                    enableActionMenu={true}
                    onPasteItem={handlePasteItem}
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
