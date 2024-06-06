import type {DLUserSettings} from 'shared';
import {getStore} from 'store';
import {updateUserSettings} from 'store/actions/user';
import {selectUserSettings} from 'store/selectors/user';

/** @deprecated use the user store */
export class UserSettings {
    private static instance: UserSettings;

    // It is recommended to create an instance via the static getInstance method.
    // Details in technotes/user-settings.md
    static getInstance() {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }

    async updateUserSettings(newSettings: Partial<DLUserSettings>) {
        await updateUserSettings({newSettings})(getStore().dispatch);
    }

    getSettings() {
        const state = getStore().getState();
        return selectUserSettings(state);
    }
}
