import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon, Toaster} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import NavigationPrompt from 'components/NavigationPrompt/NavigationPrompt';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import {
    EntryDialogName,
    EntryDialogResolveStatus,
    EntryDialogues,
    Utils,
    navigateHelper,
    sdk,
} from 'ui';
import {selectIsRenameWithoutReload} from 'ui/store/selectors/entryContent';

import {ENTRY_ACTION, TOASTER_TYPE, UPDATE_ENTRY_MODE} from '../../constants/common';
import Dialogs from '../Dialogs/Dialogs';

import iconLock from 'ui/assets/icons/lock.svg';

import './ButtonSave.scss';

const toaster = new Toaster();

const b = block('editor-btn-save');
const ACTIONS = {
    SAVE: UPDATE_ENTRY_MODE.SAVE,
    PUBLISH: UPDATE_ENTRY_MODE.PUBLISH,
    SAVE_AS_COPY: ENTRY_ACTION.SAVE_AS_COPY,
    NO_EDIT_RIGHTS: Dialogs.DIALOG.NO_EDIT_RIGHTS,
};

function ButtonSave({
    entry,
    onCreateEditorChart,
    onUpdateEditorChart,
    isScriptsChanged,
    componentStoreState,
    defaultPath,
    workbookId,
}) {
    const history = useHistory();
    const location = useLocation();
    const scriptsValues = useSelector((state) => state.editor.scriptsValues || {});
    const isRenameWithoutReload = useSelector(selectIsRenameWithoutReload);
    const entryDialoguesRef = React.useRef(null);
    const dialogsRef = React.useRef(null);

    const locked = !entry.permissions.edit;
    const {progress} = componentStoreState;
    const disabledSave = !(entry.fake || isScriptsChanged) || locked;
    const isCurrentRevisionActual = entry.revId && entry.revId === entry.publishedId;
    const disabledPublish = !isScriptsChanged && entry.publishedId === entry.revId;
    const saveAs = React.useCallback(async () => {
        const initName =
            entry && !entry.fake
                ? i18n('wizard', 'label_widget-name-copy', {
                      name: Utils.getEntryNameFromKey(entry.key, true),
                  })
                : i18n('component.dialog-create-editor-chart.view', 'label_default-name');

        const response = await entryDialoguesRef.current.open({
            dialog: EntryDialogName.CreateEditorChart,
            dialogProps: {
                initDestination: Utils.getPathBefore({path: entry.key}),
                data: scriptsValues,
                type: entry.type,
                workbookId,
                initName,
            },
        });
        if (response.status === EntryDialogResolveStatus.Success) {
            const url = navigateHelper.redirectUrlSwitcher(response.data);
            toaster.add({
                name: 'success_save_as_copy_chart_editor',
                theme: TOASTER_TYPE.SUCCESS,
                title: i18n('editor.notifications.view', 'toast_save-as-editor-chart-success'),
                actions: [
                    {
                        label: i18n('editor.notifications.view', 'label_link'),
                        onClick() {
                            window.open(url, '_blank');
                        },
                    },
                ],
            });
            window.open(url, '_blank');
        }
    }, [entry, scriptsValues, workbookId]);

    const onClick = React.useCallback(
        async (action) => {
            if (entry.fake) {
                const response = await entryDialoguesRef.current.open({
                    dialog: EntryDialogName.CreateEditorChart,
                    dialogProps: {
                        initDestination: defaultPath,
                        data: scriptsValues,
                        type: entry.type,
                        workbookId,
                    },
                });
                if (response.status === EntryDialogResolveStatus.Success) {
                    onCreateEditorChart(response.data, history);
                }
            } else if (action === ACTIONS.SAVE_AS_COPY) {
                await saveAs();
            } else if (action === ACTIONS.NO_EDIT_RIGHTS) {
                await dialogsRef.current.open({
                    dialog: Dialogs.DIALOG.NO_EDIT_RIGHTS,
                    dialogProps: {
                        async onAccessRights() {
                            await entryDialoguesRef.current.open({
                                dialog: EntryDialogName.Unlock,
                                dialogProps: {
                                    entry,
                                },
                            });
                        },
                        async onSaveAs() {
                            await saveAs();
                        },
                    },
                });
            } else if (entry.revId === entry.savedId) {
                onUpdateEditorChart({
                    mode: action,
                    history,
                    location,
                });
            } else {
                onUpdateEditorChart({
                    mode: action,
                    history,
                    location,
                });
            }
        },
        [
            defaultPath,
            entry,
            history,
            location,
            onCreateEditorChart,
            onUpdateEditorChart,
            saveAs,
            scriptsValues,
            workbookId,
        ],
    );

    function getBtnSaveText() {
        if (locked) {
            return i18n('editor.button-save.view', 'button_save');
        }
        if (!isCurrentRevisionActual) {
            return i18n(
                'editor.button-save.view',
                disabledSave ? 'button_saved' : 'button_save-as-draft',
            );
        }
        return i18n('editor.button-save.view', disabledSave ? 'button_saved' : 'button_save');
    }

    const dropdownItems = React.useMemo(() => {
        const items = [
            {
                text: i18n('editor.button-save.view', 'button_save-as'),
                action: () => onClick(ACTIONS.SAVE_AS_COPY),
                hidden: false,
            },
        ];

        const saveAsDraftItem = {
            action: () => onClick(ACTIONS.SAVE),
            text: i18n('component.chart-save-controls', 'button_save-as-draft'),
            hidden: entry.fake,
        };

        const saveAndPublishItem = {
            action: () => onClick(ACTIONS.PUBLISH),
            text: i18n('editor.button-save.view', 'button_save-as-published'),
            hidden: entry.fake || locked || disabledPublish,
        };

        items.push(isCurrentRevisionActual ? saveAsDraftItem : saveAndPublishItem);

        return items;
    }, [disabledPublish, entry, isCurrentRevisionActual, locked, onClick]);

    const handleClick = () => {
        if (isCurrentRevisionActual) {
            onClick(ACTIONS.PUBLISH);
            return;
        }

        onClick(ACTIONS.SAVE);
    };

    return (
        <div className={b()}>
            <NavigationPrompt when={!disabledSave && !isRenameWithoutReload} />
            <Button
                view={'action'}
                size="m"
                disabled={disabledSave}
                onClick={handleClick}
                loading={progress && !disabledSave}
            >
                {locked && (
                    <Icon data={iconLock} className={b('icon-lock')} width="16" height="16" />
                )}
                {getBtnSaveText()}
            </Button>
            {locked && (
                <div
                    className={b('btn-pseudosave')}
                    onClick={() => onClick(ACTIONS.NO_EDIT_RIGHTS)}
                />
            )}
            {!entry.fake && (
                <DropdownMenu
                    size="s"
                    items={dropdownItems}
                    renderSwitcher={(props) => (
                        <Button
                            className={b('btn-switcher')}
                            view="action"
                            size="m"
                            loading={progress}
                            {...props}
                        >
                            <Icon data={ChevronDown} height={16} width={16} />
                        </Button>
                    )}
                />
            )}
            <EntryDialogues ref={entryDialoguesRef} sdk={sdk} />
            <Dialogs ref={dialogsRef} />
        </div>
    );
}

ButtonSave.propTypes = {
    entry: PropTypes.shape({
        revId: PropTypes.string,
        savedId: PropTypes.string,
        publishedId: PropTypes.string,
        type: PropTypes.string.isRequired,
        fake: PropTypes.bool,
        key: PropTypes.string,
        permissions: PropTypes.shape({
            read: PropTypes.bool,
            edit: PropTypes.bool,
            admin: PropTypes.bool,
        }),
    }),
    onCreateEditorChart: PropTypes.func.isRequired,
    onUpdateEditorChart: PropTypes.func.isRequired,
    isScriptsChanged: PropTypes.bool.isRequired,
    componentStoreState: PropTypes.shape({
        progress: PropTypes.bool.isRequired,
    }).isRequired,
    defaultPath: PropTypes.string.isRequired,
    workbookId: PropTypes.string,
};

export default ButtonSave;
