import {unstable_Breadcrumbs as Breadcrumbs} from '@gravity-ui/uikit/unstable';
import {/* I18n, */ i18n as i18nGlobal} from 'i18n';
import React from 'react';
import block from 'bem-cn-lite';
import {UserProfile as SelfProfile} from 'ui/units/auth/components/UserProfile/UserProfile';
import {UserProfile} from 'ui/units/auth/containers/UserProfile/UserProfile';
import {reducer} from '../../../units/auth/store/reducers';

import {reducerRegistry} from 'ui/store';
import './UserProfilePage.scss';
import {Flex} from '@gravity-ui/uikit';
import {DL} from 'ui/constants';
import {PageTitle} from 'ui/components/PageTitle';
import {ActionPanel} from 'ui/components/ActionPanel';
import {useHistory} from 'react-router-dom';

reducerRegistry.register({auth: reducer});

const b = block('dl-user-profile-page');

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

const staticPageParams = {
    self: {
        pageTitle: i18n('title_profile'),
        breadCrumbs: [{text: i18n('title_profile'), href: undefined}],
    },
    another: {
        pageTitle: i18n('title_profile'),
        breadCrumbs: [
            {
                href: '/settings',
                text: i18nGlobal('main.service-settings.view', 'label_header'),
            },
            {
                href: '/settings/users',
                text: i18n('title_users'),
            },
            {text: i18n('title_profile')},
        ],
    },
};

function UserProfilePage({context = 'self'}: {context?: 'self' | 'another'}) {
    const {pageTitle, breadCrumbs} = staticPageParams[context];
    const history = useHistory();

    return (
        <main className={b()}>
            <PageTitle entry={{key: pageTitle}} />
            <ActionPanel
                leftItems={
                    <Breadcrumbs
                        navigate={(href) => {
                            history.push(href);
                        }}
                    >
                        {breadCrumbs.map(({text, href}) => (
                            <Breadcrumbs.Item key={text} href={href} disabled={!href}>
                                {text}
                            </Breadcrumbs.Item>
                        ))}
                    </Breadcrumbs>
                }
            />
            <Flex justifyContent="center" className={b('content')}>
                {context === 'another' ? <UserProfile /> : <SelfProfileAdapter />}
            </Flex>
        </main>
    );
}

function SelfProfileAdapter() {
    const {displayName, login, email, uid, roles} = DL.USER;
    return (
        <SelfProfile displayName={displayName} login={login} email={email} id={uid} roles={roles} />
    );
}

export default UserProfilePage;
