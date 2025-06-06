import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {getUserId, isUserId} from 'shared';
//import {DL} from 'ui/constants';

import {resolveUsers} from '../store/actions/usersByIds';
import {selectUsersByIds} from '../store/selectors/usersByIds';
import type {Subject} from '../store/typings/usersByIds';

type User = {
    status: 'skip-resolve' | 'resolved' | 'error' | 'loading';
    login: string | null;
    title: string;
    userId: string | null;
    data: Subject | null;
};

export function useUserById(loginOrId: string): User {
    const dispatch = useDispatch();
    const usersByIds = useSelector(selectUsersByIds);

    const user: User = React.useMemo(() => {
        if (!isUserId(loginOrId)) {
            return {
                status: 'skip-resolve',
                login: loginOrId,
                title: loginOrId,
                userId: null,
                data: null,
            };
        }
        const userId = getUserId(loginOrId);
        const userById = usersByIds[userId];
        if (!userById || userById.status === 'loading') {
            return {
                status: 'loading',
                login: null,
                title: loginOrId,
                userId,
                data: null,
            };
        }
        if (userById.status === 'error') {
            return {
                status: 'error',
                login: null,
                title: loginOrId,
                userId,
                data: null,
            };
        }
        return {
            status: 'resolved',
            login: userById.login,
            title: userById.login,
            userId,
            data: userById.data,
        };
    }, [usersByIds, loginOrId]);

    React.useEffect(() => {
        // if (!DL.AUTH_ENABLED) {
        //     return;
        // }
        const userId = user.userId;
        if (userId && !(userId in usersByIds)) {
            dispatch(resolveUsers([userId]));
        }
    }, [dispatch, user, usersByIds]);

    return user;
}
