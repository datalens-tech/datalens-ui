import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import {unstable_Breadcrumbs as Breadcrumbs} from '@gravity-ui/uikit/unstable';
import block from 'bem-cn-lite';
import {/* I18n, */ i18n as i18nGlobal} from 'i18n';
import {useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router';
import {ActionPanel} from 'ui/components/ActionPanel';
import {PageTitle} from 'ui/components/PageTitle';
import {DL} from 'ui/constants/common';
import {reducerRegistry} from 'ui/store';
import {UserProfile} from 'ui/units/auth/containers/UserProfile/UserProfile';
import {selectUserProfile} from 'ui/units/auth/store/selectors/userProfile';
import {getUserDisplayName} from 'ui/units/auth/utils/userProfile';

import {reducer} from '../../../../units/auth/store/reducers';
import AccessErrorPage from '../AccessErrorPage/AccessErrorPage';

import './UserProfilePage.scss';

reducerRegistry.register({auth: reducer});

// TODO: add title to translations
// const i18n = I18n.keyset('auth.user-profile.view');
const i18n = (key: string) => {
    switch (key) {
        case 'title_profile':
            return 'Profile';
        case 'title_users':
            return 'Users';

        default:
            return key;
    }
};

const b = block('dl-user-profile-page');

const UserProfilePage = () => {
    const history = useHistory();
    const {userId} = useParams<{userId?: string}>();
    const userProfile = useSelector(selectUserProfile);

    if (!DL.IS_NATIVE_AUTH_ADMIN || !userId) {
        return <AccessErrorPage />;
    }

    return (
        <main className={b()}>
            <PageTitle entry={{key: i18n('title_profile')}} />

            <ActionPanel
                leftItems={
                    <Breadcrumbs
                        navigate={(href) => {
                            history.push(href);
                        }}
                    >
                        <Breadcrumbs.Item href="/settings">
                            {i18nGlobal('main.service-settings.view', 'label_header')}
                        </Breadcrumbs.Item>
                        <Breadcrumbs.Item href="/settings/users">
                            {i18n('title_users')}
                        </Breadcrumbs.Item>
                        <Breadcrumbs.Item disabled>
                            {userProfile ? getUserDisplayName(userProfile) : userId}
                        </Breadcrumbs.Item>
                    </Breadcrumbs>
                }
            />
            <Flex justifyContent="center" className={b('content')}>
                <UserProfile userId={userId} />
            </Flex>
        </main>
    );
};

export default UserProfilePage;
