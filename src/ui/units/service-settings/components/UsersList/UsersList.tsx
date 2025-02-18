import React from 'react';

import {Plus} from '@gravity-ui/icons';
import type {TableAction, TableColumnConfig} from '@gravity-ui/uikit';
import {
    Button,
    Flex,
    Icon,
    Loader,
    Table,
    Text,
    withTableActions,
    withTableCopy,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {Link} from 'react-router-dom';
import type {ListUser} from 'shared/schema/auth/types/users';

import type {ServiceSettingsDispatch} from '../../store/actions/serviceSettings';
import {getUsersList, resetServiceUsersList} from '../../store/actions/serviceSettings';
import {
    selectServiceUsersListPageToken,
    selectServiceUsersListUsers,
    selectServiceUsersisLoading,
} from '../../store/selectors/serviceSettings';

import {LabelsList} from './LabelsList/LabelsList';
import {UsersFilter} from './UsersFilters/UsersFilters';
import type {BaseFiltersNames} from './constants';

import './UsersList.scss';

const b = block('service-settings-users-list');
const i18nMain = I18n.keyset('service-settings.main.view');
const i18n = I18n.keyset('service-settings.users-list.view');

const USERS_PAGE_SIZE = 3;

const TableWithActions = withTableCopy(withTableActions<ListUser>(Table));

const columns: TableColumnConfig<ListUser>[] = [
    {
        id: 'name',
        name: i18n('label_field-name'),
        template: ({firstName, lastName}) => `${firstName || ''} ${lastName || ''}`.trim() || '—',
    },
    {
        id: 'userId',
        name: i18n('label_field-id'),
        template: ({userId}) => userId,
        meta: {copy: ({userId}: ListUser) => userId},
    },
    {
        id: 'email',
        name: i18n('label_field-email'),
        template: ({email}) => email,
        meta: {copy: ({email}: ListUser) => email},
    },
    {
        id: 'role',
        name: i18n('label_field-roles'),
        template: ({roles}) => <LabelsList items={roles} countVisibleElements={1} />,
    },
    {
        id: 'login',
        name: i18n('label_field-login'),
        template: ({login}) => login,
        meta: {copy: ({login}: ListUser) => login},
    },
];

const prepareFilterValue = (filterValue: string | string[]) => {
    if (typeof filterValue === 'string') {
        return filterValue || undefined;
    }

    return filterValue.length ? filterValue : undefined;
};

const UsersList = () => {
    const history = useHistory();

    const [filters, setFilters] = React.useState<
        Record<BaseFiltersNames | string, string | string[]>
    >({});

    const isDataLoading = useSelector(selectServiceUsersisLoading);
    const nextPageToken = useSelector(selectServiceUsersListPageToken);
    const displayedUsers = useSelector(selectServiceUsersListUsers);

    const dispatch = useDispatch<ServiceSettingsDispatch>();

    React.useEffect(() => {
        dispatch(resetServiceUsersList());
        dispatch(getUsersList({pageSize: USERS_PAGE_SIZE}));
    }, [dispatch]);

    const handleFilterChange = React.useCallback(
        (filternName, filterValue) => {
            dispatch(resetServiceUsersList());
            setFilters((oldFilters) => {
                const validatedFilterValue = prepareFilterValue(filterValue);
                const updatedFilters = {...oldFilters, [filternName]: validatedFilterValue};
                dispatch(
                    getUsersList({
                        pageSize: USERS_PAGE_SIZE,
                        ...updatedFilters,
                    }),
                );

                return updatedFilters;
            });
        },
        [dispatch],
    );

    const handleLoadMoreClick = React.useCallback(() => {
        dispatch(
            getUsersList({
                pageSize: USERS_PAGE_SIZE,
                nextPageToken,
                isLoadMore: true,
                ...filters,
            }),
        );
    }, [dispatch, filters, nextPageToken]);

    const handleRowClick = React.useCallback(
        (item: ListUser) => {
            // prevent row click when text is selected
            if (!getSelection()?.isCollapsed) {
                return;
            }

            history.push(`/settings/users/${item.userId}`);
        },
        [history],
    );

    const getRowActions = React.useCallback((_item: ListUser): TableAction<ListUser>[] => {
        return [
            {
                text: i18n('label_menu-edit-profile'),
                handler: () => null,
            },
            {
                text: i18n('label_menu-change-role'),
                handler: () => null,
            },
            {
                text: i18n('label_menu-change-password'),
                handler: () => null,
            },
            {
                text: i18n('label_menu-delete'),
                handler: () => null,
                theme: 'danger',
            },
        ];
    }, []);

    const renderTable = () => {
        if (isDataLoading && !displayedUsers.length) {
            return <Loader className={b('data-loader')} size="m" />;
        }

        return (
            <React.Fragment>
                <TableWithActions
                    className={b('table')}
                    data={displayedUsers}
                    columns={columns}
                    getRowActions={getRowActions}
                    emptyMessage={i18n('label_users-empty-message')}
                    onRowClick={handleRowClick}
                />

                {nextPageToken && (
                    <Button
                        className={b('load-button')}
                        loading={isDataLoading}
                        onClick={handleLoadMoreClick}
                    >
                        {i18n('button_load-more')}
                    </Button>
                )}
            </React.Fragment>
        );
    };

    return (
        <div className={b()}>
            <Text variant="subheader-3">{i18nMain('section_users')}</Text>
            <div className={b('content')}>
                <Flex justifyContent="space-between">
                    <UsersFilter onChange={handleFilterChange} />
                    <Link to="/settings/users/new">
                        <Button view="action">
                            <Icon data={Plus} />
                            {i18n('button_add-user')}
                        </Button>
                    </Link>
                </Flex>

                {renderTable()}
            </div>
        </div>
    );
};

export default UsersList;
