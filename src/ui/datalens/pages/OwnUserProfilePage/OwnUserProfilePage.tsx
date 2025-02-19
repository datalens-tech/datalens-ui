import {unstable_Breadcrumbs as Breadcrumbs} from '@gravity-ui/uikit/unstable';
/* import {I18n} from 'i18n'; */
import React from 'react';
import block from 'bem-cn-lite';
import {UserProfile} from 'ui/units/auth/containers/UserProfile/UserProfile';
import {reducer} from '../../../units/auth/store/reducers';

import {reducerRegistry} from 'ui/store';
import {Flex} from '@gravity-ui/uikit';
import {DL} from 'ui/constants';
import {PageTitle} from 'ui/components/PageTitle';
import {ActionPanel} from 'ui/components/ActionPanel';

import './OwnUserProfilePage.scss';

reducerRegistry.register({auth: reducer});

const b = block('dl-own-user-profile-page');

// TODO: add title to translations
// const i18n = I18n.keyset('auth.user-profile.view');
const i18n = (key: string) => {
    switch (key) {
        case 'title_profile':
            return 'Profile';
        default:
            return key;
    }
};

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
                <UserProfile userId={uid} />
            </Flex>
        </main>
    );
}

export default OwnUserProfilePage;
