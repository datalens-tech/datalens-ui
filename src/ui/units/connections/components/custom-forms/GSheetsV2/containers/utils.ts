import {ConnectorType} from 'shared';

import type {GSheetItem} from '../../../../store';
import {api} from '../../../../store';
import type {GSheetListItem} from '../types';

const prepareItem = (item: GSheetItem): GSheetListItem => {
    const preparedItem: GSheetListItem = {...item};
    return preparedItem;
};

export const getListItems = (args: {items: GSheetItem[]}) => {
    const {items} = args;
    return [...items.map(prepareItem)];
};

const openNewWindow = (url: string, target: string): Promise<Window | null> => {
    return new Promise((resolve) => {
        // https://stackoverflow.com/a/70463940
        setTimeout(() => {
            const oauthPageWindow = window.open(url, target);
            resolve(oauthPageWindow);
        }, 0);
    });
};

export const getGoogleOAuth2Code = async (): Promise<string> => {
    const {uri} = await api.getOAuthUrl({
        conn_type: ConnectorType.GsheetsV2,
        scope: 'google',
    });

    const oauthPageWindow = await openNewWindow(uri, 'authPage');

    if (!oauthPageWindow) {
        throw new Error('Failed to open oauth page');
    }

    return new Promise((resolve) => {
        const intervalId = setInterval(async () => {
            let confirmationCode;

            try {
                const url = new URL(oauthPageWindow.location.href);
                confirmationCode = url.searchParams.get('code');

                if (confirmationCode) {
                    clearInterval(intervalId);
                    oauthPageWindow.close();
                    resolve(confirmationCode);
                }
            } catch (error) {
                if (confirmationCode || !oauthPageWindow.window) {
                    clearInterval(intervalId);
                    oauthPageWindow.close();
                }
            }
        }, 500);
    });
};
