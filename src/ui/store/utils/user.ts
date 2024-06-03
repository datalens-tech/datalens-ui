import type {DLUserSettings} from 'shared';
import {USER_SETTINGS_KEY} from 'shared';
import Utils from 'ui/utils';

export const getUpdatedUserSettings = async (
    newSettings: Partial<DLUserSettings>,
): Promise<Partial<DLUserSettings> | undefined> => {
    const rawOldUserSettings = localStorage.getItem(USER_SETTINGS_KEY) || '{}';
    const parsedOldUserSettings = JSON.parse(rawOldUserSettings);

    const updatedSettings: Partial<DLUserSettings> = {
        ...parsedOldUserSettings,
        ...newSettings,
    };

    localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(updatedSettings));
    Utils.setCookie({name: USER_SETTINGS_KEY, value: JSON.stringify(updatedSettings)});

    return updatedSettings;
};

export const getCurrentUserSettings = () => {
    return localStorage.getItem(USER_SETTINGS_KEY) || '{}';
};
