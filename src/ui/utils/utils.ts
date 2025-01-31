import {settings as settingsChartKit} from '@gravity-ui/chartkit';
import {settings as settingsDateUtils} from '@gravity-ui/date-utils';
import type {ThemeSettings} from '@gravity-ui/uikit';
import {configure as configureUikit} from '@gravity-ui/uikit';
import {I18N} from 'i18n';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _mapKeys from 'lodash/mapKeys';
import _snakeCase from 'lodash/snakeCase';
import moment from 'moment';
import type {StringParams} from 'shared';
import {ENABLE, SHARED_URL_OPTIONS, SUPERUSER_SWITCH_MODE_COOKIE_NAME, SYSTEM_THEME} from 'shared';

import {DL, URL_OPTIONS} from '../constants';
import {getSdk} from '../libs/schematic-sdk';
import type {DataLensApiError} from '../typings';

import {parseError} from './errors/parse';

let isSuperUser: undefined | boolean;
export default class Utils {
    static parseErrorResponse = parseError;

    static getPathBefore({path}: {path: string}) {
        let pathBefore = '/';
        if (path && typeof path === 'string') {
            let pathSplit = path.split('/');
            pathSplit = pathSplit.filter((nameStr) => nameStr);
            pathSplit.splice(-1, 1);
            if (pathSplit.length !== 0) {
                pathBefore = pathSplit.join('/');
            }
        }
        return pathBefore === '/' ? '/' : pathBefore + '/';
    }

    static getEntryNameFromKey(key: string, withFolders = false) {
        if (!key) {
            return '';
        }
        if (withFolders) {
            const match = key.match(/([^/]+)\/?$/);
            return match ? match[1] : '';
        }
        const match = key.match(/[^/]*$/);
        return match ? match[0] : key;
    }

    static getEntryKey(path: string, name: string, defaultName = '') {
        const entryName = name === '' ? defaultName : name;
        return path === '/' ? entryName : path + entryName;
    }

    static getNavigationPathFromKey(key: string) {
        // an empty string is considered a valid value, but it does not pass Boolean verification, so we replace it with '/'
        return key.replace(/\/?[^/]*$/g, '') || '/';
    }

    static getCookie(name: string) {
        const cookie = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return cookie ? cookie.pop() || '' : '';
    }

    static isSuperUser() {
        if (typeof isSuperUser === 'undefined') {
            isSuperUser =
                DL.DISPLAY_SUPERUSER_SWITCH &&
                Utils.getCookie(SUPERUSER_SWITCH_MODE_COOKIE_NAME) === ENABLE;
        }
        return isSuperUser;
    }

    static setCookie({
        domain,
        name,
        value,
        path = '/',
        maxAge = 365 * 24 * 60 * 60,
    }: {
        domain?: string;
        name: string;
        value: string;
        path?: string;
        maxAge?: number;
    }) {
        let cookie = `${name}=${value}; path=${path}; max-age=${maxAge}`;

        if (domain) {
            cookie += `; domain=${domain}`;
        }

        document.cookie = cookie;
    }

    static deleteCookie({name}: {name: string}) {
        if (name) {
            this.setCookie({name, value: '', maxAge: -1});
        }
    }

    static restore<T = any>(key: string): T | null {
        try {
            const data = window.localStorage.getItem(key);
            if (data === null) {
                return null;
            }
            return JSON.parse(data);
        } catch (err) {
            return null;
        }
    }

    static store<T = unknown>(key: string, data: T) {
        try {
            window.localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
            console.error(`data not saved in localeStorage: ${err}`);
        }
    }

    // TODO@types
    static isRetina() {
        let devicePixelRatio = 1;
        if ('deviceXDPI' in window.screen && 'logicalXDPI' in window.screen) {
            devicePixelRatio =
                (window.screen as any).deviceXDPI / (window.screen as any).logicalXDPI;
        } else if ('devicePixelRatio' in window) {
            devicePixelRatio = window.devicePixelRatio;
        }
        return devicePixelRatio >= 1.3;
    }

    static getCurrentTheme() {
        return DL.USER_SETTINGS.theme || SYSTEM_THEME;
    }

    static getCurrentThemeSettings(): Partial<ThemeSettings> {
        return DL.USER_SETTINGS.themeSettings || {};
    }

    static setBodyFeatures() {
        const body = window.document.body;

        if (this.isRetina()) {
            body.classList.add('i-ua_retina_yes');
        }
    }

    static setLang() {
        const lang = DL.USER_LANG;

        I18N.setLang(lang);
        settingsChartKit.set({lang});
        configureUikit({lang});

        moment.locale(lang);
        moment.updateLocale(lang, {week: {dow: 1, doy: 7}});

        settingsDateUtils.loadLocale(lang).then(() => {
            settingsDateUtils.setLocale(lang);
        });
    }

    static addBodyClass(...className: string[]) {
        window.document.body.classList.add(...className);
    }

    static removeBodyClass(...className: string[]) {
        window.document.body.classList.remove(...className);
    }

    static setSdk() {
        window.sdk = getSdk().sdk;
    }

    static setRpcAuthorization() {
        var loc:any = document.location;
        let params = (new URL(loc)).searchParams;
        let token:any = params.get("x-rpc-authorization");
        if(token && loc.search.indexOf('_embedded=1') == -1) {
            window.localStorage.setItem('x-rpc-authorization', token);
        }
    }

    static getRpcAuthorization() {
        var loc:any = document.location;
        let params = (new URL(loc)).searchParams;
        let token:any = params.get("x-rpc-authorization");
        
        return window.localStorage.getItem('x-rpc-authorization') || token;
    }

    static setup() {
        Utils.setBodyFeatures();
        Utils.setLang();
        Utils.setSdk();
        Utils.setRpcAuthorization();
    }

    static setMobileMetaViewport() {
        const viewportContent = 'width=device-width,minimum-scale=1,initial-scale=1';
        const viewportMetaTag = document.querySelector('meta[name=viewport]')!;

        viewportMetaTag.setAttribute('content', viewportContent);
    }

    static getErrorDetails(
        error: DataLensApiError,
    ): {message?: string; details?: object; code?: string} | null {
        const {message, details, code} = Utils.parseErrorResponse(error);
        let detailsMessage: object = {};
        if (message) {
            detailsMessage = {...detailsMessage, message};
        }
        if (code) {
            detailsMessage = {...detailsMessage, code};
        }
        if (details && !_isEmpty(details)) {
            detailsMessage = {...detailsMessage, details};
        }
        if (_isEmpty(detailsMessage)) {
            return null;
        }
        return detailsMessage;
    }

    static getCSRFToken() {
        const csrfMetaTag: HTMLMetaElement | null = document.querySelector('meta[name=csrf-token]');
        return csrfMetaTag ? csrfMetaTag.content : null;
    }

    static isEnabledFeature(featureName: string) {
        const featureDynamicStatus = _get(DL.DYNAMIC_FEATURES, featureName);

        if (typeof featureDynamicStatus !== 'undefined') {
            return featureDynamicStatus;
        }

        return Boolean(_get(DL.FEATURES, featureName));
    }

    static getOptionsFromSearch(search: string) {
        const searchParams = new URLSearchParams(search);

        return {
            theme: searchParams.get(URL_OPTIONS.THEME),
            embedded: searchParams.get(URL_OPTIONS.EMBEDDED) === '1',
            noControls:
                searchParams.get(URL_OPTIONS.NO_CONTROLS) === '1' ||
                searchParams.get(URL_OPTIONS.NO_CONTROLS) === 'true', // deprecated
            actionParamsEnabled: searchParams.get(URL_OPTIONS.ACTION_PARAMS_ENABLED) === '1',
            autoupdateInterval: Number(searchParams.get(URL_OPTIONS.AUTOUPDATE)),
            showSafeChartInfo: searchParams.get(SHARED_URL_OPTIONS.SAFE_CHART) === '1',
        };
    }

    static getParamsFromSearch(search: string) {
        const searchParams = new URLSearchParams(search);
        const params: StringParams = {};
        for (const [key, value] of searchParams.entries()) {
            if (!Object.values(URL_OPTIONS).includes(key)) {
                const existed = params[key];
                if (existed) {
                    if (Array.isArray(existed)) {
                        existed.push(value);
                    } else {
                        params[key] = [existed, value];
                    }
                } else {
                    params[key] = value;
                }
            }
        }
        return params;
    }

    static filterVirtual({virtual}: {virtual: boolean}) {
        return !virtual;
    }

    static downloadFile(data: Blob, fileName: string) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(data);
        a.download = fileName;
        a.click();
        a.remove();
    }

    static convertToSnakeCase(data: {[key: string]: unknown}) {
        return _mapKeys(data, (_value, key) => _snakeCase(key));
    }

    static getAuthToken = async (propsData: any) => {
        var result = await getSdk().us.getAuth({login: propsData.login, password: propsData.password});

        return result;
    }

    static getEmbedToken = async (propsData: any) => {

        var workbookId = await this.decodeId({id: propsData.workbookId || propsData.id});
        var entryId = await this.decodeId({id: propsData.entryId || propsData.id});
        
        var result = await this.universalService({"action": "datalens", "method": "embed", "data": [{workbookId: workbookId, entryId: entryId, reject: propsData.reject}]});

        return result.data && result.data.length > 0 ? result.data[0].embed : '';
    }

    static getRoles = async (propsData: any) => {
        var result = await this.universalService({"action": "datalens", "method": "roles", "data": [propsData]});

        return result.data && result.data.length > 0 ? result.data : [];
    }

    static getAccesses = async (propsData: any) => {
        var result = await this.universalService({"action": "datalens", "method": "accesses", "data": [propsData]});

        return result.data && result.data.length > 0 ? result.data : [];
    }

    static encodeId = async (propsData: any) => {
        var result = await getSdk().us.encodeId({ id: propsData.id});

        return result.id;
    }

    static decodeId = async (propsData: any) => {
        var result = await getSdk().us.decodeId({ id: propsData.id});

        return result.id;
    }

    static setAccesses = async (propsData: any) => {
        var result = await this.universalService({"action": "datalens", "method": "updateAccesses", "data": Array.isArray(propsData) ? propsData : [propsData]});

        return result.data && result.data.length > 0 ? result.data : [];
    }

    /**
     * Создание пользователя
     * @param propsData {"login": "user04", "password": "qwe-123", "email": "", "claims": ["datalens"]}
     * @returns 
     */
    static createUser = async (propsData: any) => {
        return await this.universalService({"action": "datalens", "method": "create_user", "data": [propsData]});
    }

    /**
     * Обновление пользователя
     * @param propsData {"id": 12, "c_login": "user04", "с_email": ""}
     * @returns 
     */
    static updateUser = async (propsData: any) => {
        return await this.universalService({"action": "datalens", "method": "update_user", "data": [propsData]});
    }

    /**
     * Сброс пароля пользователя
     * @param propsData {"c_login": "user04", "c_password": ""}
     * @returns 
     */
    static passwordReset = async (propsData: any) => {
        return await this.universalService({"action": "datalens", "method": "password_reset", "data": [propsData]});
    }

    /**
     * Обновление привязки к ролям
     * @param propsData {"id": 12, "c_claims": "['datalens']"}
     * @returns 
     */
    static updateRoles = async (propsData: any) => {
        return await this.universalService({"action": "datalens", "method": "update_roles", "data": [propsData]});
    }

    /**
     * Получение списка пользователей
     * @param propsData {}
     * @returns 
     */
    static users = async (propsData: any) => {
        var result = await this.universalService({"action": "datalens", "method": "users", "data": [propsData]});

        return result.data && result.data.length > 0 ? result.data : [];
    }

    /**
     * Универсальный метод для запросов RPC через frontend UI
     * 
     * @param propsData данные в формате RPC {action:string, method:string, data:any[], tid: number}
     * @returns объект {err:any, data:any}, если err заполнен, то ошибка
     */
    static universalService = async (propsData: any) => {
        var result = await getSdk().us.universalService(propsData);

        return result;
    }

    /**
     * Получение списка проектов
     * @param propsData {}
     * @returns 
     */
    static projects = async (propsData: any) => {
        var result = await this.universalService({"action": "datalens", "method": "projects", "data": [propsData]});

        return result.data && result.data.length > 0 ? result.data : [];
    }
}
