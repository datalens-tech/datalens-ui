import 'i18n';
import {MobileProvider, ThemeProvider} from '@gravity-ui/uikit';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router} from 'react-router-dom';
import {Provider, useSelector} from 'react-redux';
import {HotkeysProvider} from 'react-hotkeys-hook';

import DialogManager from 'components/DialogManager/DialogManagerContainer';
import {registerSDKDispatch} from 'libs/schematic-sdk/parse-error';
import {Utils, DL} from 'ui';

import DatalensPage from '../datalens';
import {renderDatalens} from '../datalens/render';
import {getStore} from '../store/configure';
import {selectTheme, selectThemeSettings} from '../store/selectors/user';
import history from '../utils/history';
import {getOverridedTheme} from 'ui/utils/getOverridedTheme';

import {HOTKEYS_SCOPES} from '../constants/misc';

import '@gravity-ui/uikit/styles/styles.scss';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'katex/dist/katex.min.css';
import 'ui/styles/base.scss';
import 'ui/styles/variables.scss';
import 'ui/styles/split-pane-resizer.scss';
import 'ui/styles/theme.scss';
import 'ui/styles/rebranding-theme.scss';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {Feature} from 'shared';

const Content = () => {
    const userTheme = useSelector(selectTheme);
    const theme = getOverridedTheme(userTheme);
    const themeSettings = useSelector(selectThemeSettings);

    if (isEnabledFeature(Feature.EnableDLRebranding)) {
        Utils.addBodyClass('dl-root', 'dl-root_rebranding');
    }

    return (
        <ThemeProvider
            theme={theme}
            systemLightTheme={themeSettings?.systemLightTheme}
            systemDarkTheme={themeSettings?.systemDarkTheme}
        >
            <MobileProvider mobile={DL.IS_MOBILE}>
                <HotkeysProvider initiallyActiveScopes={[HOTKEYS_SCOPES.GLOBAL]}>
                    <React.Fragment>
                        <DialogManager />
                        <DatalensPage />
                    </React.Fragment>
                </HotkeysProvider>
            </MobileProvider>
        </ThemeProvider>
    );
};

function renderApp() {
    Utils.setup();

    const store = getStore();

    registerSDKDispatch(store.dispatch);

    ReactDOM.render(
        <Router history={history}>
            <Provider store={store}>
                <Content />
            </Provider>
        </Router>,
        document.getElementById('root'),
    );
}

renderDatalens(renderApp, {});
