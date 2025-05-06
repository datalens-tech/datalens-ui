import {I18n} from 'i18n';
import {getEntryNameByKey} from 'shared';
import type {EntryFields} from 'shared/schema';

import type {NavigationMinimalProps} from './NavigationMinimal';
import {PLACE, QUICK_ITEMS} from './constants';

const i18n = I18n.keyset('component.navigation.view');

export const isRootPlace = (place: string) => {
    return place === PLACE.ROOT;
};

type CheckActiveType = string | string[];

const isEntryActiveByType = (includeType: CheckActiveType, type: string) => {
    const emptyArray: string[] = [];
    return emptyArray.concat(includeType).includes(type);
};

export const checkEntryActivity = (
    clickableScope?: string,
    includeType?: CheckActiveType,
    excludeType?: CheckActiveType,
) => {
    return includeType || excludeType
        ? ({scope, type}: Pick<EntryFields, 'scope' | 'type'>) => {
              return (
                  scope === 'folder' ||
                  ((clickableScope ? clickableScope === scope : true) &&
                      ((Boolean(includeType) && isEntryActiveByType(includeType!, type)) ||
                          (Boolean(excludeType) && !isEntryActiveByType(excludeType!, type))))
              );
          }
        : undefined;
};

export const getPathDisplayName = ({path}: {path: string}) => {
    const name = getEntryNameByKey({key: path});
    return name === '' ? i18n('switch_root') : name;
};

export const getPlaceSelectParameters = (
    items: string[],
): NavigationMinimalProps['placeSelectParameters'] => {
    return {
        items,
        quickItems: [QUICK_ITEMS.USER_FOLDER],
    };
};
