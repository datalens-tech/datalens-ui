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

import {
    DIALOG_RESOLVE_STATUS,
    ENTRY_ACTION,
    TOASTER_TYPE,
    UPDATE_ENTRY_MODE,
} from '../../constants/common';
import Dialogs from '../Dialogs/Dialogs';

import iconLock from 'ui/assets/icons/lock.svg';

import './ButtonSave.scss';

const toaster = new Toaster();

const b = block('editor-btn-save');
const ACTIONS = {
    SAVE: UPDATE_ENTRY_MODE.SAVE,
    PUBLISH: UPDATE_ENTRY_MODE.PUBLISH,
    SAVE_AS: ENTRY_ACTION.SAVE_AS,
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
    const disabledPublish = !isScriptsChanged && entry.publishedId === entry.revId;
    async function saveAs() {
        const response = await entryDialoguesRef.current.open({
            dialog: EntryDialogName.CreateEditorChart,
            dialogProps: {
                initDestination: Utils.getPathBefore({path: entry.key}),
                data: scriptsValues,
                type: entry.type,
                workbookId,
            },
        });
        if (response.status === EntryDialogResolveStatus.Success) {
            const url = navigateHelper.redirectUrlSwitcher(response.data);
            toaster.add({
                name: 'success_save_as_chart_editor',
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
    }
    async function onClick(action) {
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
        } else if (action === ACTIONS.SAVE_AS) {
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
                release: action === ACTIONS.PUBLISH,
                history,
                location,
            });
        } else {
            const response = await dialogsRef.current.open({
                dialog: Dialogs.DIALOG.CONFIRM_WARNING,
                dialogProps: {
                    message: i18n('editor.button-save.view', 'toast_warning-not-latest-version'),
                },
            });
            if (response.status === DIALOG_RESOLVE_STATUS.SUCCESS) {
                onUpdateEditorChart({
                    mode: action,
                    release: action === ACTIONS.PUBLISH,
                    history,
                    location,
                });
            }
        }
    }

    function getBtnSaveTheme() {
        if (entry.fake) {
            return 'action';
        }
        return disabledSave ? 'action' : 'outlined';
    }

    function getBtnSaveText() {
        if (locked) {
            return i18n('editor.button-save.view', 'button_save');
        }
        return i18n('editor.button-save.view', disabledSave ? 'button_saved' : 'button_save');
    }

    return (
        <div className={b()}>
            <NavigationPrompt when={!disabledSave && !isRenameWithoutReload} />
            <Button
                view={getBtnSaveTheme()}
                size="m"
                disabled={disabledSave}
                onClick={() => onClick(ACTIONS.SAVE)}
                loading={progress && !disabledSave}
                pin={entry.fake || locked ? undefined : 'round-brick'}
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
                <React.Fragment>
                    {!locked && (
                        <Button
                            className={b('btn-publish')}
                            view="action"
                            size="m"
                            pin="brick-round"
                            disabled={disabledPublish}
                            onClick={() => onClick(ACTIONS.PUBLISH)}
                            loading={progress && !disabledPublish}
                        >
                            {i18n(
                                'editor.button-save.view',
                                disabledPublish ? 'button_published' : 'button_publish',
                            )}
                        </Button>
                    )}
                    <DropdownMenu
                        size="s"
                        items={[
                            {
                                action: () => onClick(ACTIONS.SAVE_AS),
                                text: i18n('editor.button-save.view', 'button_save-as'),
                            },
                        ]}
                        switcher={
                            <Button
                                className={b('btn-switcher')}
                                view="action"
                                size="m"
                                loading={progress}
                            >
                                <Icon data={ChevronDown} height={16} width={16} />
                            </Button>
                        }
                    />
                </React.Fragment>
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
