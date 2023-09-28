import React from 'react';

import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useHistory, useLocation} from 'react-router-dom';

import {Feature} from '../../../../../shared';
import {WorkbookWithPermissions} from '../../../../../shared/schema';
import {IamAccessDialog} from '../../../../components/IamAccessDialog/IamAccessDialog';
import {registry} from '../../../../registry';
import {ResourceType} from '../../../../registry/units/common/types/components/IamAccessDialog';
import Utils from '../../../../utils';
import {CreateEntry} from '../CreateEntry/CreateEntry';

import LockOpenIcon from '@gravity-ui/icons/svgs/lock-open.svg';

import './WorkbookActions.scss';

const b = block('dl-workbook-actions');

const DIALOG_QUERY_PARAM_NAME = 'dialog';

type Props = {
    workbook: WorkbookWithPermissions;
    refreshWorkbookInfo: () => void;
};

export const WorkbookActions: React.FC<Props> = ({workbook, refreshWorkbookInfo}) => {
    const history = useHistory();
    const {search} = useLocation();
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
    const additionalActions = useAdditionalWorkbookActions(
        workbook,
        refreshWorkbookInfo,
        onApplyCopy,
    );

    return (
        <div className={b()}>
            {workbook.permissions.update && (
                <div className={b('item')}>
                    <CreateEntry view="action" />
                </div>
            )}

            {Boolean(additionalActions.length) && (
                <DropdownMenu
                    defaultSwitcherProps={{view: 'normal'}}
                    switcherWrapperClassName={b('item')}
                    items={additionalActions}
                />
            )}

            {collectionsAccessEnabled && workbook.permissions.listAccessBindings && (
                <div className={b('item')}>
                    <Button
                        onClick={() => {
                            setIamAccessDialogIsOpen(true);
                        }}
                    >
                        <Icon data={LockOpenIcon} />
                    </Button>
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
