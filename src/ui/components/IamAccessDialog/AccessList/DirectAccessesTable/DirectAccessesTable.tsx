import React from 'react';

import type {TableColumnConfig} from '@gravity-ui/uikit';
import {Dialog, Table} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';

import type {SubjectDetails} from '../../../../../shared/schema/extensions/types';
import {
    AccessBindingAction,
    ClaimsSubjectType,
} from '../../../../../shared/schema/extensions/types';
import {registry} from '../../../../registry';
import type {IamAccessDialogDispatch} from '../../../../store/actions/iamAccessDialog';
import {updateAccessBindings} from '../../../../store/actions/iamAccessDialog';
import {CLOSE_DELETE_TIMEOUT} from '../../constants';
import {filterByUser, getAccessSubjectType, getResourceRoles} from '../../utils';
import {Filters} from '../Filters/Filters';

import {Controls} from './Controls/Controls';
import {getSubjectName} from './utils';

import './DirectAccessesTable.scss';
const b = block('dl-iam-access-dialog-access-list-direct-accesses-table');

const i18n = I18n.keyset('component.iam-access-dialog');

const UNKNOWN = 'unknown';

export type DirectAccessesTableRow = {
    user?: SubjectDetails;
    object: {
        id: string;
        type: ResourceType;
        title: string;
    };
    role: string;
};

export type Props = {
    data: DirectAccessesTableRow[];
    canUpdate: boolean;
    refetch: () => void;
};

export const DirectAccessesTable = ({data, canUpdate, refetch}: Props) => {
    const {AclSubject} = registry.common.components.getAll();

    const dispatch = useDispatch<IamAccessDialogDispatch>();

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [deletedRow, setDeletedRow] = React.useState<DirectAccessesTableRow | null>(null);
    const [deletingIsLoading, setDeletingIsLoading] = React.useState(false);

    const handleOpenDeleteDialog = React.useCallback((row: DirectAccessesTableRow) => {
        setDeletedRow(row);
        setDeleteDialogOpen(true);
    }, []);

    const closeTimer = React.useRef<number | null>(null);

    const handleCloseDeleteDialog = React.useCallback(() => {
        setDeleteDialogOpen(false);
        closeTimer.current = window.setTimeout(() => {
            setDeletedRow(null);
        }, CLOSE_DELETE_TIMEOUT);
    }, []);

    React.useEffect(() => {
        return () => {
            if (closeTimer.current) {
                window.clearTimeout(closeTimer.current);
            }
        };
    }, []);

    const columns = React.useMemo<TableColumnConfig<DirectAccessesTableRow>[]>(
        () => [
            {
                id: 'user',
                name: i18n('label_user'),
                width: '45%',
                template: ({user}) =>
                    user ? <AclSubject subjectClaims={user.subjectClaims} /> : null,
            },
            {
                id: 'role',
                name: i18n('label_role'),
                width: '55%',
                template: (row) => {
                    const {user, object, role} = row;

                    if (user?.subjectClaims) {
                        const options = getResourceRoles(object.type);

                        return (
                            <Controls
                                subject={user?.subjectClaims}
                                resourceId={object.id}
                                resourceType={object.type}
                                role={role}
                                options={options}
                                canUpdate={canUpdate}
                                onDeleteButtonClick={() => {
                                    handleOpenDeleteDialog(row);
                                }}
                            />
                        );
                    }

                    return null;
                },
            },
        ],
        [canUpdate, handleOpenDeleteDialog],
    );

    const subjectTypeOptions = React.useMemo(() => {
        return [
            {
                title: i18n('label_all'),
                value: 'all',
            },
            {
                title: i18n('label_user-accounts'),
                value: 'user-accounts',
            },
            {
                title: i18n('label_groups'),
                value: 'groups',
            },
        ];
    }, []);

    const [searchString, setSearchString] = React.useState('');
    const [subjectType, setSubjectType] = React.useState<string>(subjectTypeOptions[0].value);

    const preparedData = React.useMemo(() => {
        let filteredData = data.filter(filterByUser(searchString));

        if (subjectType !== 'all') {
            filteredData = filteredData.filter((item) => {
                switch (subjectType) {
                    case 'user-accounts':
                        return (
                            item.user?.subjectClaims.subType === ClaimsSubjectType.UserAccount ||
                            item.user?.subjectClaims.subType === ClaimsSubjectType.Invitee
                        );
                    case 'groups':
                        return item.user?.subjectClaims.subType === ClaimsSubjectType.Group;
                    default:
                        return true;
                }
            });
        }

        return filteredData;
    }, [data, searchString, subjectType]);

    return (
        <div className={b()}>
            <div className={b('filters')}>
                <Filters
                    searchString={searchString}
                    subjectType={subjectType}
                    subjectTypeOptions={subjectTypeOptions}
                    setSearchString={setSearchString}
                    setSubjectType={setSubjectType}
                />
            </div>

            {preparedData.length > 0 ? (
                <React.Fragment>
                    <Table className={b('table')} columns={columns} data={preparedData} />

                    <Dialog size="s" open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                        <Dialog.Header caption={i18n('label_revoke-access')} />
                        <Dialog.Body className={b('revoke-dialog')}>
                            {i18n('section_revoke-access', {
                                userName: deletedRow?.user?.subjectClaims
                                    ? getSubjectName(deletedRow?.user?.subjectClaims)
                                    : UNKNOWN,
                                objectName: deletedRow?.object.title ?? UNKNOWN,
                            })}
                        </Dialog.Body>
                        <Dialog.Footer
                            textButtonCancel={i18n('action_cancel')}
                            onClickButtonCancel={handleCloseDeleteDialog}
                            propsButtonCancel={{
                                disabled: deletingIsLoading,
                            }}
                            textButtonApply={i18n('action_revoke-access')}
                            onClickButtonApply={() => {
                                if (deletedRow && deletedRow.user?.subjectClaims) {
                                    setDeletingIsLoading(true);
                                    dispatch(
                                        updateAccessBindings({
                                            resourceId: deletedRow.object.id,
                                            resourceType: deletedRow.object.type,
                                            deltas: [
                                                {
                                                    action: AccessBindingAction.Remove,
                                                    accessBinding: {
                                                        roleId: deletedRow.role,
                                                        subject: {
                                                            id: deletedRow.user.subjectClaims.sub,
                                                            type: getAccessSubjectType(
                                                                deletedRow.user.subjectClaims,
                                                            ),
                                                        },
                                                    },
                                                },
                                            ],
                                        }),
                                    ).then((res) => {
                                        if (res) {
                                            refetch();
                                            handleCloseDeleteDialog();
                                        }
                                        setDeletingIsLoading(false);
                                    });
                                }
                            }}
                            propsButtonApply={{
                                view: 'outlined-danger',
                                disabled: deletingIsLoading,
                                loading: deletingIsLoading,
                            }}
                        />
                    </Dialog>
                </React.Fragment>
            ) : (
                <div className={b('empty')}>{i18n('label_no-data')}</div>
            )}
        </div>
    );
};
