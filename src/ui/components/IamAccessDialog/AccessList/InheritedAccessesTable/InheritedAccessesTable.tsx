import React from 'react';

import type {TableColumnConfig} from '@gravity-ui/uikit';
import {Label, Table} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Link} from 'react-router-dom';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import type {SubjectDetails} from '../../../../../shared/schema/extensions/types';
import {ClaimsSubjectType} from '../../../../../shared/schema/extensions/types';
import {DL} from '../../../../constants/common';
import {registry} from '../../../../registry';
import {CollectionIcon} from '../../../CollectionIcon/CollectionIcon';
import {filterByUser} from '../../utils';
import {Filters} from '../Filters/Filters';

import './InheritedAccessesTable.scss';

const b = block('dl-iam-access-dialog-access-list-inherited-accesses-table');

const i18n = I18n.keyset('component.iam-access-dialog');

export type InheritedAccessesTableRow = {
    user?: SubjectDetails;
    object: {
        id: string;
        title: string;
    };
    role: string;
};

export type Props = {
    data: InheritedAccessesTableRow[];
};

export const InheritedAccessesTable = ({data}: Props) => {
    const {AclSubject} = registry.common.components.getAll();

    const columns = React.useMemo<TableColumnConfig<InheritedAccessesTableRow>[]>(
        () => [
            {
                id: 'user',
                name: i18n('label_user'),
                width: '45%',
                template: ({user}) =>
                    user ? <AclSubject subjectClaims={user.subjectClaims} /> : null,
            },
            {
                id: 'object',
                name: i18n('label_object'),
                width: '20%',
                template: ({object}) => {
                    return (
                        <Link
                            className={b('collection')}
                            target="_blank"
                            to={`/collections/${object.id}`}
                        >
                            <div className={b('collection-icon')}>
                                <CollectionIcon size={16} />
                            </div>

                            <span className={b('collection-title')}>{object.title}</span>
                        </Link>
                    );
                },
            },
            {
                id: 'role',
                name: i18n('label_role'),
                width: '35%',
                template: ({role}) => {
                    const iamResources = DL.IAM_RESOURCES;

                    if (!iamResources) {
                        return role;
                    }

                    const {collection, workbook, sharedEntry} = iamResources;

                    switch (role) {
                        case collection.roles.admin:
                        case workbook.roles.admin:
                            return <Label theme="normal">{i18n('role_admin')}</Label>;
                        case collection.roles.editor:
                        case workbook.roles.editor:
                            return <Label theme="normal">{i18n('role_editor')}</Label>;
                        case collection.roles.viewer:
                        case workbook.roles.viewer:
                            return <Label theme="normal">{i18n('role_viewer')}</Label>;
                        case collection.roles.limitedViewer:
                        case workbook.roles.limitedViewer:
                            return <Label theme="normal">{i18n('role_limited-viewer')}</Label>;
                        case collection.roles.entryBindingCreator:
                        case sharedEntry.roles.entryBindingCreator:
                            return (
                                <Label theme="normal">
                                    {getSharedEntryMockText('iam-dialog-role-entryBindingCreator')}
                                </Label>
                            );
                        case collection.roles.limitedEntryBindingCreator:
                        case sharedEntry.roles.limitedEntryBindingCreator:
                            return (
                                <Label theme="normal">
                                    {getSharedEntryMockText(
                                        'iam-dialog-role-limitedEntryBindingCreator',
                                    )}
                                </Label>
                            );
                        default:
                            return role;
                    }
                },
            },
        ],
        [],
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
                <Table className={b('table')} columns={columns} data={preparedData} />
            ) : (
                <div className={b('empty')}>{i18n('label_no-data')}</div>
            )}
        </div>
    );
};
