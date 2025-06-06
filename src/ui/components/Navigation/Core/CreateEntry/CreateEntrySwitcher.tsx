import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import type {ButtonView} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CreateEntityButton} from 'shared';

import {registry} from '../../../../registry';

const b = block('dl-navigation-create-entry');

export const CreateEntrySwitcher = ({
    place,
    onClick,
    withMenu,
    buttonView,
}: {
    place: string;
    onClick: React.MouseEventHandler<HTMLElement>;
    withMenu: boolean;
    buttonView?: ButtonView;
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
            view={buttonView}
            qa={CreateEntityButton.Button}
            className={b('button-create', {
                'with-menu': withMenu,
                action: buttonView === 'action',
            })}
            onClick={onClick}
        >
            {targetPlace.buttonText} {withMenu && <Icon data={ChevronDown} />}
        </Button>
    );
};
