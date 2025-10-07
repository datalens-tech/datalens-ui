import React from 'react';

import {Loader, Tab, TabList, TabProvider, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Redirect, Route, Switch, useHistory, useParams} from 'react-router-dom';
import {PageTitle} from 'ui/components/PageTitle';
import {DL} from 'ui/constants';

import './MainPage.scss';

const b = block('service-settings');
const i18n = I18n.keyset('service-settings.main.view');

const GeneralSettings = React.lazy(
    () => import('../../components/GeneralSettings/GeneralSettings'),
);
const UsersList = React.lazy(() => import('../../components/UsersList/UsersList'));

export type MainPageProps = {
    customGeneralSettings?: React.ReactNode;
    disablePalettesEdit?: boolean;
    customTabItems?: {
        id: string;
        title: string;
    }[];
    customTabRoutes?: React.ReactNode[];
};

const MainPage = ({
    customGeneralSettings,
    disablePalettesEdit,
    customTabItems = [],
    customTabRoutes,
}: MainPageProps) => {
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
                <Text as={'h3' as const} variant="subheader-3" className={b('header')}>
                    {i18n('label_header')}
                </Text>
                <main className={b('section')}>
                    <GeneralSettings
                        customSettings={customGeneralSettings}
                        disablePalettesEdit={disablePalettesEdit}
                    />
                </main>
            </div>
        );
    }

    const handleSelectTab = (tabId: string, event?: React.MouseEvent) => {
        // clicking on the tab with the meta-key or ctrl pressed - opening the tab in a new window, and not switching to it
        if (event && (event.metaKey || event.ctrlKey)) {
            return;
        }

        setActiveTab(tabId);

        history.push(`/settings/${tabId}`);
    };

    const tabs = [
        {
            id: 'general',
            title: i18n('section_general'),
        },
        {id: 'users', title: i18n('section_users')},
    ];

    return (
        <div className={b()}>
            <PageTitle title={i18n('label_header')} />
            <Text as={'h3' as const} variant="subheader-3" className={b('header')}>
                {i18n('label_header')}
            </Text>
            <div role="tablist" className={b('tabs')}>
                <TabProvider value={activeTab} onUpdate={handleSelectTab}>
                    <TabList size="m">
                        {[...tabs, ...customTabItems].map((item) => (
                            <Tab key={item.id} value={item.id}>
                                {item.title}
                            </Tab>
                        ))}
                    </TabList>
                </TabProvider>
            </div>
            <main className={b('tabs-content')}>
                <React.Suspense fallback={<Loader size="m" className={b('loader')} />}>
                    <Switch>
                        <Route
                            exact
                            path={'/settings/general'}
                            render={(routeProps) => (
                                <GeneralSettings
                                    customSettings={customGeneralSettings}
                                    disablePalettesEdit={disablePalettesEdit}
                                    {...routeProps}
                                />
                            )}
                        />
                        <Route exact path={'/settings/users'} component={UsersList} />
                        {customTabRoutes}
                        <Redirect to="/settings/general" />
                    </Switch>
                </React.Suspense>
            </main>
        </div>
    );
};

export default MainPage;
