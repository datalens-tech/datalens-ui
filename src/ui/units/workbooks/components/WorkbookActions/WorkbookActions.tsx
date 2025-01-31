import React from 'react';

import {ArrowRight, Copy, LockOpen, TrashBin} from '@gravity-ui/icons';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {
    DIALOG_COPY_WORKBOOK,
    DIALOG_DELETE_WORKBOOK,
    DIALOG_MOVE_WORKBOOK,
} from 'components/CollectionsStructure';
import {I18N} from 'i18n';
import {useDispatch} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import {DropdownAction} from 'ui/components/DropdownAction/DropdownAction';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {COLLECTIONS_PATH} from 'ui/units/collections-navigation/constants';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {Feature} from '../../../../../shared';
import type {WorkbookWithPermissions} from '../../../../../shared/schema';
import {IamAccessDialog} from '../../../../components/IamAccessDialog/IamAccessDialog';
import {registry} from '../../../../registry';
import {ResourceType} from '../../../../registry/units/common/types/components/IamAccessDialog';
import {CreateEntry} from '../CreateEntry/CreateEntry';

import './WorkbookActions.scss';

const b = block('dl-workbook-actions');

const i18n = I18N.keyset('new-workbooks');

const DIALOG_QUERY_PARAM_NAME = 'dialog';

type Props = {
    workbook: WorkbookWithPermissions;
    refreshWorkbookInfo: () => void;
};

export const WorkbookActions: React.FC<Props> = ({workbook, refreshWorkbookInfo}) => {
    const history = useHistory();
    const {search} = useLocation();
    const dispatch = useDispatch();
    const preopenedAccessDialog =
        new URLSearchParams(search).get(DIALOG_QUERY_PARAM_NAME) === 'access';

    const [iamAccessDialogIsOpen, setIamAccessDialogIsOpen] = React.useState(preopenedAccessDialog);

    React.useEffect(() => {
        setIamAccessDialogIsOpen(preopenedAccessDialog);
    }, [preopenedAccessDialog]);

    const handleCloseIamAccessDialog = React.useCallback(() => {
        const queryParams = new URLSearchParams(search);

        if (queryParams.has(DIALOG_QUERY_PARAM_NAME)) {
            queryParams.delete(DIALOG_QUERY_PARAM_NAME);
            history.replace({
                search: queryParams.toString(),
            });
        }

        setIamAccessDialogIsOpen(false);
    }, [search, history]);

    const collectionsAccessEnabled = isEnabledFeature(Feature.CollectionsAccessEnabled);

    const onApplyCopy = (workbookId: string | undefined) => {
        if (workbookId) {
            history.push(`/workbooks/${workbookId}`);
        }
    };

    const {useAdditionalWorkbookActions} = registry.workbooks.functions.getAll();
    const {CustomActionPanelWorkbookActions} = registry.workbooks.components.getAll();

    const additionalActions = useAdditionalWorkbookActions(workbook);

    const dropdownActions = [...additionalActions];

    if (workbook.permissions.move) {
        dropdownActions.push({
            action: () => {
                dispatch(
                    openDialog({
                        id: DIALOG_MOVE_WORKBOOK,
                        props: {
                            open: true,
                            workbookId: workbook.workbookId,
                            workbookTitle: workbook.title,
                            initialCollectionId: workbook.collectionId,
                            onApply: refreshWorkbookInfo,
                            onClose: () => {
                                dispatch(closeDialog());
                            },
                        },
                    }),
                );
            },
            text: <DropdownAction icon={ArrowRight} text={i18n('action_move')} />,
        });
    }

    if (workbook.permissions.copy) {
        dropdownActions.push({
            action: () => {
                dispatch(
                    openDialog({
                        id: DIALOG_COPY_WORKBOOK,
                        props: {
                            open: true,
                            workbookId: workbook.workbookId,
                            workbookTitle: workbook.title,
                            initialCollectionId: workbook.collectionId,
                            onApply: onApplyCopy,
                            onClose: () => {
                                dispatch(closeDialog());
                            },
                        },
                    }),
                );
            },
            text: <DropdownAction icon={Copy} text={i18n('action_copy')} />,
        });
    }

    const otherActions: DropdownMenuItem[] = [];

    if (workbook.permissions.delete) {
        otherActions.push({
            text: <DropdownAction icon={TrashBin} text={i18n('action_delete')} />,
            action: () => {
                dispatch(
                    openDialog({
                        id: DIALOG_DELETE_WORKBOOK,
                        props: {
                            open: true,
                            workbookId: workbook.workbookId,
                            workbookTitle: workbook.title,
                            onSuccessApply: () => {
                                if (workbook.collectionId) {
                                    history.push(`${COLLECTIONS_PATH}/${workbook.collectionId}`);
                                } else {
                                    history.push(COLLECTIONS_PATH);
                                }
                            },
                            onClose: () => {
                                dispatch(closeDialog());
                            },
                        },
                    }),
                );
            },
            theme: 'danger',
        });
    }

    if (otherActions.length > 0) {
        dropdownActions.push([...otherActions]);
    }

    return (
        <div className={b()}>
            {Boolean(dropdownActions.length) && (
                <DropdownMenu
                    defaultSwitcherProps={{view: 'normal'}}
                    switcherWrapperClassName={b('item')}
                    items={dropdownActions}
                />
            )}

            <CustomActionPanelWorkbookActions />

            {collectionsAccessEnabled && workbook.permissions.listAccessBindings && (
                <Tooltip content={i18n('action_access')}>
                    <div className={b('item')}>
                        <Button
                            onClick={() => {
                                setIamAccessDialogIsOpen(true);
                            }}
                        >
                            <Icon data={LockOpen} />
                        </Button>
                    </div>
                </Tooltip>
            )}

            {workbook.permissions.update && (
                <div className={b('item')}>
                    <CreateEntry view="action" />
                </div>
            )}

            {collectionsAccessEnabled && workbook.permissions.listAccessBindings && (
                <IamAccessDialog
                    open={iamAccessDialogIsOpen}
                    resourceId={workbook.workbookId}
                    resourceType={ResourceType.Workbook}
                    resourceTitle={workbook.title}
                    parentId={workbook.collectionId}
                    canUpdate={workbook.permissions.updateAccessBindings}
                    onClose={handleCloseIamAccessDialog}
                />
            )}
        </div>
    );
};
