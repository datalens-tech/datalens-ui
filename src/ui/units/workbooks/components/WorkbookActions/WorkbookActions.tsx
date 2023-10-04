import React from 'react';

import {ArrowRight, Copy, LockOpen} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DIALOG_COPY_WORKBOOK, DIALOG_MOVE_WORKBOOK} from 'components/CollectionsStructure';
import {I18N} from 'i18n';
import {useDispatch} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';

import {Feature} from '../../../../../shared';
import {WorkbookWithPermissions} from '../../../../../shared/schema';
import {IamAccessDialog} from '../../../../components/IamAccessDialog/IamAccessDialog';
import {registry} from '../../../../registry';
import {ResourceType} from '../../../../registry/units/common/types/components/IamAccessDialog';
import Utils from '../../../../utils';
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

    const collectionsAccessEnabled = Utils.isEnabledFeature(Feature.CollectionsAccessEnabled);

    const onApplyCopy = (workbookId: string | undefined) => {
        if (workbookId) {
            history.push(`/workbooks/${workbookId}`);
        }
    };

    const {useAdditionalWorkbookActions} = registry.workbooks.functions.getAll();
    const classNameIconAction = b('icon-action');

    const additionalActions = useAdditionalWorkbookActions(workbook, classNameIconAction);

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
            text: (
                <>
                    <Icon data={ArrowRight} className={classNameIconAction} />
                    {i18n('action_move')}
                </>
            ),
        });

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
                text: (
                    <>
                        <Icon data={Copy} className={classNameIconAction} />
                        {i18n('action_copy')}
                    </>
                ),
            });
        }
    }

    return (
        <div className={b()}>
            {workbook.permissions.update && (
                <div className={b('item')}>
                    <CreateEntry view="action" />
                </div>
            )}

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

            {Boolean(dropdownActions.length) && (
                <DropdownMenu
                    defaultSwitcherProps={{view: 'normal'}}
                    switcherWrapperClassName={b('item')}
                    items={dropdownActions}
                />
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
