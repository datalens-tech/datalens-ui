import React from 'react';

import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import type {UserProfile as UserProfileType} from 'shared/schema/auth/types/users';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {SmartLoader} from 'ui/components/SmartLoader/SmartLoader';
import type {AppDispatch} from 'ui/store';

import {UserProfile as Profile} from '../../components/UserProfile/UserProfile';
import {getUserProfile, resetUserProfileState} from '../../store/actions/userProfile';
import {
    selectUserProfile,
    selectUserProfileError,
    selectUserProfileIsLoading,
} from '../../store/selectors/userProfile';

export function UserProfile() {
    const {userId} = useParams<{userId?: string}>();

    const dispatch = useDispatch<AppDispatch>();

    const userProfile = useSelector(selectUserProfile);
    const isUserProfileLoading = useSelector(selectUserProfileIsLoading);
    const error = useSelector(selectUserProfileError);

    React.useEffect(() => {
        if (userId) {
            dispatch(getUserProfile({userId}));
        }
    }, [dispatch, userId]);

    React.useEffect(() => {
        if (!userId || userId !== userProfile?.userId) {
            dispatch(resetUserProfileState);
        }
    }, [dispatch, userId, userProfile]);

    if (isUserProfileLoading) {
        return <SmartLoader />;
    }

    if (error) {
        return (
            <PlaceholderIllustration
                name="badRequest"
                /* TODO: add title translations */
                /* @ts-ignore */
                title={i18n('auth.user-profile.view', 'label_failed-to-load-user')}
                direction="column"
            />
        );
    }
    if (userProfile) {
        return (
            <Profile
                displayName={getDisplayName(userProfile)}
                login={userProfile.login}
                email={userProfile.email}
                id={userProfile.userId}
                roles={userProfile.roles}
            />
        );
    }

    return null;
}

function getDisplayName(user: UserProfileType) {
    const firstAndLastName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return firstAndLastName || user.login || user.userId;
}
