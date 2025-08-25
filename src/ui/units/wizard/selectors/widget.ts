import {i18n} from 'i18n';
import type {DatalensGlobalState} from 'ui';
import {DL, URL_QUERY} from 'ui';

export const selectWidget = (state: DatalensGlobalState) => {
    if (state.wizard.widget.widget?.key) {
        return state.wizard.widget.widget;
    } else {
        const fakeWidget = {
            fake: true,
            entryId: null,
            fakeName: i18n('wizard', 'label_new-widget'),
        };

        const searchParams = new URLSearchParams(location.search);

        const searchCurrentPath = searchParams.get(URL_QUERY.CURRENT_PATH);

        let path = searchCurrentPath || DL.USER_FOLDER;

        path = path.endsWith('/') ? path : `${path}/`;

        Object.assign(fakeWidget, {
            key: `${path}${i18n('wizard', 'label_new-widget')}`,
        });

        return fakeWidget;
    }
};

export const selectIsWidgetLoading = (state: DatalensGlobalState) => state.wizard.widget.isLoading;

export const selectWidgetError = (state: DatalensGlobalState) => state.wizard.widget.error;

export const selectWidgetHash = (state: DatalensGlobalState) => state.wizard.widget.hash;

export const selectExtraSettings = (state: DatalensGlobalState) =>
    state.wizard.widget.extraSettings;

export const selectInitialDescription = (state: DatalensGlobalState) =>
    state.wizard.widget.widget?.annotation?.description;
