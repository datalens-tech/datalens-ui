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
import {useHistory, useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import type {ListUser} from 'shared/schema/auth/types/users';
import {DL} from 'ui/constants';
import {registry} from 'ui/registry';
import {ChangePasswordDialog} from 'ui/units/auth/components/ChangePasswordDialog/ChangePasswordDialog';
import {ChangeUserRoleDialog} from 'ui/units/auth/components/ChangeUserRoleDialog/ChangeUserRoleDialog';
import {DeleteUserDialog} from 'ui/units/auth/components/DeleteUserDialog/DeleteUserDialog';
import {EditUserProfileDialog} from 'ui/units/auth/components/EditUserProfileDialog/EditUserProfileDialog';

import type {ServiceSettingsDispatch} from '../../store/actions/serviceSettings';
import {
    getUsersList,
    resetServiceUsersList,
    restoreUsersStateAfterFilter,
    saveUsersStateBeforeFilter,
} from '../../store/actions/serviceSettings';
import {
    selectServiceUsersListIsLoading,
    selectServiceUsersListPageToken,
    selectServiceUsersListUsers,
} from '../../store/selectors/serviceSettings';

import {UsersFilter} from './UsersFilters/UsersFilters';
import type {BaseFiltersNames} from './constants';

import './UsersList.scss';

const b = block('service-settings-users-list');
const i18nMain = I18n.keyset('service-settings.main.view');
const i18n = I18n.keyset('service-settings.users-list.view');

const USERS_PAGE_SIZE = 15;

const TableWithCopy = withTableCopy<ListUser>(Table);
const TableWithActions = withTableActions<ListUser>(TableWithCopy);

const TableComponent = DL.AUTH_MANAGE_LOCAL_USERS_DISABLED ? TableWithCopy : TableWithActions;

const prepareFilterValue = (filterValue: string | string[]) => {
    if (typeof filterValue === 'string' || filterValue === undefined) {
        return filterValue || undefined;
    }

    return filterValue.length ? filterValue : undefined;
};

const hasActiveFilters = (filters: Record<string, string | string[]>) => {
    return Object.values(filters).some((value) => {
        if (typeof value === 'string') {
            return Boolean(value);
        }
        return Array.isArray(value) && value.length;
    });
};

const UsersList = () => {
    const history = useHistory();
    const location = useLocation();

    const [filters, setFilters] = React.useState<
        Record<BaseFiltersNames | string, string | string[]>
    >({});

    const isDataLoading = useSelector(selectServiceUsersListIsLoading);
    const nextPageToken = useSelector(selectServiceUsersListPageToken);
    const displayedUsers = useSelector(selectServiceUsersListUsers);

    const dispatch = useDispatch<ServiceSettingsDispatch>();

    const {getUsersListColumns} = registry.auth.functions.getAll();

    const columns: TableColumnConfig<ListUser>[] = React.useMemo(
        () => getUsersListColumns(),
        [getUsersListColumns],
    );

    const [assignRoleDialogOpenForUser, setAssignRoleDialogOpenForUser] = React.useState<
        ListUser | undefined
    >();
    const [deleteUserDialogOpenForUser, setDeleteUserDialogOpenForUser] = React.useState<
        ListUser | undefined
    >();
    const [editProfileDialogOpenForUser, setEditProfileDialogOpenForUser] = React.useState<
        ListUser | undefined
    >();
    const [changePasswordDialogOpenForUser, setChangePasswordUserDialogOpenForUser] =
        React.useState<ListUser | undefined>();

    React.useEffect(() => {
        dispatch(getUsersList({pageSize: USERS_PAGE_SIZE}));

        return () => {
            dispatch(resetServiceUsersList());
        };
    }, [dispatch]);

    const handleFilterChange = React.useCallback(
        (filterName, filterValue) => {
            setFilters((oldFilters) => {
                const hadActiveFilters = hasActiveFilters(oldFilters);
                const validatedFilterValue = prepareFilterValue(filterValue);
                const updatedFilters = {...oldFilters, [filterName]: validatedFilterValue};
                const willHaveActiveFilters = hasActiveFilters(updatedFilters);

                // Save state before first filter
                if (!hadActiveFilters && willHaveActiveFilters) {
                    dispatch(saveUsersStateBeforeFilter());
                }

                // Restore state when clearing all filters
                if (hadActiveFilters && !willHaveActiveFilters) {
                    dispatch(restoreUsersStateAfterFilter());
                    return updatedFilters;
                }

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

    const resetTable = React.useCallback(() => {
        dispatch(resetServiceUsersList());
        dispatch(
            getUsersList({
                pageSize: USERS_PAGE_SIZE,
                ...filters,
            }),
        );
    }, [dispatch, filters]);

    const getRowActions = React.useCallback((item: ListUser): TableAction<ListUser>[] => {
        if (item.idpType) {
            return [];
        }

        const menuItems: TableAction<ListUser>[] = [
            {
                text: i18n('label_menu-edit-profile'),
                handler: () => setEditProfileDialogOpenForUser(item),
            },
            {
                text: i18n('label_menu-change-role'),
                handler: () => setAssignRoleDialogOpenForUser(item),
            },
            {
                text: i18n('label_menu-change-password'),
                handler: () => setChangePasswordUserDialogOpenForUser(item),
            },
        ];

        if (DL.USER_ID !== item.userId) {
            menuItems.push({
                text: i18n('label_menu-delete'),
                handler: () => setDeleteUserDialogOpenForUser(item),
                theme: 'danger',
            });
        }

        return menuItems;
    }, []);

    const renderTable = () => {
        if (isDataLoading && !displayedUsers.length) {
            return <Loader className={b('data-loader')} size="m" />;
        }

        return (
            <React.Fragment>
                {assignRoleDialogOpenForUser && (
                    <ChangeUserRoleDialog
                        open
                        onClose={() => setAssignRoleDialogOpenForUser(undefined)}
                        userId={assignRoleDialogOpenForUser.userId}
                        userRoles={assignRoleDialogOpenForUser.roles}
                        onSuccess={resetTable}
                    />
                )}
                {deleteUserDialogOpenForUser && (
                    <DeleteUserDialog
                        open
                        onClose={() => setDeleteUserDialogOpenForUser(undefined)}
                        onSuccess={resetTable}
                        userId={deleteUserDialogOpenForUser.userId}
                    />
                )}
                {changePasswordDialogOpenForUser && (
                    <ChangePasswordDialog
                        open
                        onClose={() => setChangePasswordUserDialogOpenForUser(undefined)}
                        userId={changePasswordDialogOpenForUser.userId}
                        onSuccess={resetTable}
                        isOwnProfile={changePasswordDialogOpenForUser.userId === DL.USER_ID}
                    />
                )}
                {editProfileDialogOpenForUser && (
                    <EditUserProfileDialog
                        open
                        onClose={() => setEditProfileDialogOpenForUser(undefined)}
                        userId={editProfileDialogOpenForUser.userId}
                        email={editProfileDialogOpenForUser.email}
                        firstName={editProfileDialogOpenForUser.firstName}
                        lastName={editProfileDialogOpenForUser.lastName}
                        onSuccess={resetTable}
                    />
                )}
                <TableComponent
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

    const showAddUser = !DL.AUTH_MANAGE_LOCAL_USERS_DISABLED;

    return (
        <div className={b()}>
            <Text variant="subheader-3">{i18nMain('section_users')}</Text>
            <div className={b('content')}>
                <Flex justifyContent="space-between" wrap gap={2}>
                    <UsersFilter onChange={handleFilterChange} />
                    {showAddUser && (
                        <Link
                            to={{pathname: '/settings/users/new', state: {from: location.pathname}}}
                        >
                            <Button view="action">
                                <Icon data={Plus} />
                                {i18n('button_add-user')}
                            </Button>
                        </Link>
                    )}
                </Flex>

                {renderTable()}
            </div>
        </div>
    );
};

export default UsersList;
