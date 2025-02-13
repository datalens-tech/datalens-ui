import React from 'react';

import {AdaptiveTabs} from '@gravity-ui/components';
import {Loader, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Redirect, Route, Switch, useHistory, useParams} from 'react-router-dom';
import {DL} from 'ui/constants';

import './MainPage.scss';

const b = block('service-settings');
// const i18n = I18n.keyset('service-settings.main.view');
const i18n = I18n.keyset('main.service-settings.view');

const ColorPaintsPage = React.lazy(
    () => import('../../components/SectionColorPalettes/SectionColorPalettes'),
);
const UsersList = React.lazy(() => import('../../components/UsersList/UsersList'));

const MainPage = () => {
    const history = useHistory();
    const {tab} = useParams<{tab: string}>();

    const [activeTab, setActiveTab] = React.useState('palettes');

    React.useEffect(() => {
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [activeTab, tab]);

    if (!DL.AUTH_ENABLED || !DL.IS_NATIVE_AUTH_ADMIN) {
        return (
            <div className={b()}>
                <Text as={'h3' as React.ElementType} variant="subheader-3" className={b('header')}>
                    {i18n('label_header')}
                </Text>
                <main className={b('sections')}>
                    <ColorPaintsPage />
                </main>
            </div>
        );
    }

    const handleSelectTab = (tabId: string, event?: React.MouseEvent) => {
        // clicking on the tab with the meta-key pressed - opening the tab in a new window, and not switching to it
        if (event && event.metaKey) {
            return;
        }

        setActiveTab(tabId);

        history.push(`/settings/${tabId}`);
    };

    return (
        <div className={b()}>
            <Text as={'h3' as React.ElementType} variant="subheader-3" className={b('header')}>
                {i18n('label_header')}
            </Text>
            <div role="tablist" className={b('tabs')}>
                <AdaptiveTabs
                    items={[
                        {
                            id: 'palettes',
                            title: i18n('section_color-palettes'),
                        },
                        {id: 'users', title: 'Users'},
                    ]}
                    size="l"
                    onSelectTab={handleSelectTab}
                    activeTab={activeTab}
                />
            </div>
            <main className={b('tabs-content')}>
                <React.Suspense fallback={<Loader size="m" className={b('loader')} />}>
                    <Switch>
                        <Route exact path={'/settings/palettes'} component={ColorPaintsPage} />
                        <Route exact path={'/settings/users'} component={UsersList} />
                        <Redirect to="/settings/palettes" />
                    </Switch>
                </React.Suspense>
            </main>
        </div>
    );
};

export default MainPage;
