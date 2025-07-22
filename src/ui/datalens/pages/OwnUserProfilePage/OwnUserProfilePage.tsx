import {Breadcrumbs, Flex} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import React from 'react';
import block from 'bem-cn-lite';
import {UserProfile} from 'ui/units/auth/containers/UserProfile/UserProfile';

import {DL} from 'ui/constants';
import {PageTitle} from 'ui/components/PageTitle';
import {ActionPanel} from 'ui/components/ActionPanel';

import './OwnUserProfilePage.scss';

const b = block('dl-own-user-profile-page');

const i18n = I18n.keyset('auth.user-profile.view');

function OwnUserProfilePage() {
    const pageTitle = i18n('title_profile');
    const {uid} = DL.USER;

    return (
        <main className={b()}>
            <PageTitle entry={{key: pageTitle}} />
            <ActionPanel
                leftItems={
                    <Breadcrumbs>
                        <Breadcrumbs.Item disabled>{pageTitle}</Breadcrumbs.Item>
                    </Breadcrumbs>
                }
            />
            <Flex justifyContent="center" className={b('content')}>
                <UserProfile userId={uid} currentUserProfile />
            </Flex>
        </main>
    );
}

export default OwnUserProfilePage;
