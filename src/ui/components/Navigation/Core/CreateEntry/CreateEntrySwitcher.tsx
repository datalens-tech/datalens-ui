import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CreateEntityButton} from 'shared';

import {registry} from '../../../../registry';

import type {CreateMenuValue} from './CreateEntry';

const b = block('dl-navigation-create-entry');

export const CreateEntrySwitcher = ({
    place,
    onClick,
    withMenu,
}: {
    place: string;
    onClick: (value: CreateMenuValue, options?: Record<string, unknown>) => void;
    withMenu: boolean;
}) => {
    const {getNavigationPlacesConfig} = registry.common.functions.getAll();

    const placesConfig = getNavigationPlacesConfig();

    const targetPlace = placesConfig.find((placeConfig) => {
        return placeConfig.place === place;
    });

    if (!targetPlace) {
        return null;
    }

    return (
        <Button
            view="action"
            qa={CreateEntityButton.Button}
            className={b('button-create')}
            onClick={
                withMenu
                    ? undefined
                    : () => {
                          onClick(targetPlace.value);
                      }
            }
        >
            {targetPlace.buttonText}
        </Button>
    );
};
