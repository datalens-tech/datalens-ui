import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Gear} from '@gravity-ui/icons';
import {Button, Checkbox, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {
    addSelectorToGroup,
    setActiveSelectorIndex,
    updateSelectorsGroup,
} from 'ui/units/dash/store/actions/controls/actions';
import {SelectorsGroupDialogState} from 'ui/units/dash/store/actions/controls/types';
import {
    selectActiveSelectorIndex,
    selectSelectorsGroup,
} from 'units/dash/store/selectors/controls/selectors';

import {SelectorDialogState} from '../../../../store/actions/dashTyped';
import {ListState, TabMenu} from '../../Widget/TabMenu/TabMenu';
import {DIALOG_SELECTORS_PLACEMENT} from '../ControlsPlacementDialog/ControlsPlacementDialog';

import './../GroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

const SINGLE_SELECTOR_SETTINGS: Partial<SelectorsGroupDialogState> = {
    buttonApply: false,
    buttonReset: false,
    autoHeight: false,
};

export const GroupControlSidebar = () => {
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const activeSelectorIndex = useSelector(selectActiveSelectorIndex);
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
            } else {
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

    const showAutoHeight =
        isMultipleSelectors || selectorsGroup.buttonApply || selectorsGroup.buttonReset;

    return (
        <div className={b('sidebar')}>
            <div className={b('selectors-list')}>
                <TabMenu
                    items={selectorsGroup.group}
                    selectedItemIndex={activeSelectorIndex}
                    update={updateSelectorsList}
                    addButtonText={i18n('button_add-selector')}
                    defaultTabText={getDefaultTabText}
                    enableActionMenu={true}
                />
            </div>
            <div className={b('settings')}>
                {showAutoHeight && (
                    <div className={b('settings-container')}>
                        <div>
                            <span>{i18n('label_autoheight-checkbox')}</span>
                        </div>
                        <Checkbox
                            checked={selectorsGroup.autoHeight}
                            onUpdate={handleChangeAutoHeight}
                            size="l"
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
                    />
                </div>

                <Button
                    view="outlined"
                    width="max"
                    className={b('order-selectors-button')}
                    onClick={handleSelectorsPlacementClick}
                >
                    <Icon data={Gear} height={16} width={16} />
                    {i18n('button_selectors-placement')}
                </Button>
            </div>
        </div>
    );
};
