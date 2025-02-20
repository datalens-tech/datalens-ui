import React from 'react';

// import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
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

/* TODO: add title translations */
const i18n = (_: string, _key: string) => {
    return 'Failed to load user';
};

export function UserProfile({userId}: {userId: string}) {
    const dispatch = useDispatch<AppDispatch>();

    const userProfile = useSelector(selectUserProfile);
    const isUserProfileLoading = useSelector(selectUserProfileIsLoading);
    const error = useSelector(selectUserProfileError);

    const shouldReloadUser =
        userId && userProfile?.userId !== userId && !isUserProfileLoading && !error;

    React.useEffect(() => {
        return () => {
            dispatch(resetUserProfileState());
        };
    }, [dispatch, userId]);

    const reloadUserProfile = React.useCallback(() => {
        dispatch(getUserProfile({userId}));
    }, [dispatch, userId]);

    React.useEffect(() => {
        if (shouldReloadUser) {
            reloadUserProfile();
        }
    }, [dispatch, shouldReloadUser, reloadUserProfile]);

    if (isUserProfileLoading) {
        return <SmartLoader size="l" disableStretch />;
    }

    if (error) {
        return (
            <PlaceholderIllustration
                name="badRequest"
                title={i18n('auth.user-profile.view', 'label_failed-to-load-user')}
                direction="column"
            />
        );
    }
    if (!userProfile) {
        return null;
    }

    return (
        <Profile
            firstName={userProfile.firstName || undefined}
            lastName={userProfile.lastName || undefined}
            login={userProfile.login}
            email={userProfile.email}
            id={userProfile.userId}
            roles={userProfile.roles}
            onUserDataChange={reloadUserProfile}
        />
    );
}
