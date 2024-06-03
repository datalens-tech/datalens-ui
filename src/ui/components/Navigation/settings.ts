import {UserSettings} from '../../libs/userSettings';

import {ORDER_DIRECTION, ORDER_FIELD} from './constants';
import type {FilterCreatedBy, FilterOrderByDirection, FilterOrderByField} from './types';

export class NavigationSettings {
    private instance = UserSettings.getInstance();

    setOrderBy(field: FilterOrderByField, direction: FilterOrderByDirection) {
        this.instance.updateUserSettings({
            dlNavFilterOrderByField: field,
            dlNavFilterOrderByDirection: direction,
        });
    }

    getOrderBy(): {field: FilterOrderByField; direction: FilterOrderByDirection} {
        const {dlNavFilterOrderByField, dlNavFilterOrderByDirection} = this.instance.getSettings();
        let field = dlNavFilterOrderByField;
        let direction = dlNavFilterOrderByDirection;
        if (!(field && direction)) {
            field = ORDER_FIELD.CREATED_AT;
            direction = ORDER_DIRECTION.DESC;
        }
        return {field, direction};
    }

    setCreatedBy(createdBy: FilterCreatedBy) {
        this.instance.updateUserSettings({
            dlNavFilterCreatedBy: createdBy,
        });
    }

    getCreatedBy(): FilterCreatedBy {
        return this.instance.getSettings().dlNavFilterCreatedBy || '';
    }
}
