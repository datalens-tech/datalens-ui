import Highcharts from 'highcharts';

import ErrorComponent from '../../components/Error/Error';
import {getRandomCKId} from '../../helpers/helpers';

const _isDevelopment = process.env.NODE_ENV === 'development';

const _settings = {
    lang: 'ru',
    theme: 'common',
    config: null,
    menuItems: null,
    requestIdGenerator: null,
    requestIdPrefix: null,
    ErrorComponent,
    onError: null,
};

class Settings {
    static get needShowUndeterminedSettingsWarning() {
        return (
            !_settings._settingsWereDetermined && !_settings._undeterminedSettingsWarningWasShown
        );
    }

    static showUndeterminedSettingsWarning() {
        console.warn(
            'Warning: ChartKit.setGeneralSettings was not called before ChartKit component render,' +
                ' default settings will be used',
        );

        Object.defineProperty(_settings, '_undeterminedSettingsWarningWasShown', {
            value: true,
            writable: false,
            configurable: false,
            enumerable: false,
        });
    }

    static set(newSettings) {
        if (!_settings._settingsWereDetermined) {
            Object.defineProperty(_settings, '_settingsWereDetermined', {
                value: true,
                writable: false,
                configurable: false,
                enumerable: false,
            });
        }

        Object.assign(_settings, newSettings);
        // to prevent unnecessary eventListeners on touch event
        Highcharts.hasTouch = Boolean(_settings.isMobile);
    }

    /**
     * @param {string|null|undefined} requestIdPrefix
     */
    static requestIdGenerator(requestIdPrefix = _settings.requestIdPrefix) {
        if (typeof _settings.requestIdGenerator === 'function') {
            return _settings.requestIdGenerator(requestIdPrefix);
        }
        const ckId = getRandomCKId();
        return requestIdPrefix ? `${requestIdPrefix}_${ckId}` : ckId;
    }

    static get lang() {
        return _settings.lang;
    }

    static get config() {
        return _settings.config || {};
    }

    static get theme() {
        return _settings.theme;
    }

    static get themeClassName() {
        return `chartkit-theme_${_settings.theme}`;
    }

    static get isMobile() {
        return _settings.isMobile;
    }

    static get isProd() {
        return !_isDevelopment;
    }

    static get menu() {
        return _settings.menu;
    }

    static get ErrorComponent() {
        return _settings.ErrorComponent;
    }

    static get onError() {
        return _settings.onError;
    }
}

export default Settings;
