import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';

import iconDescription from 'assets/icons/info.svg';

type Props = {
    description?: string;
    isEditMode: boolean;
    onClick: () => void;
    size?: number;
};

const DEFAILT_SIZE = 20;

export const EntryDescriptionButton = (props: Props) => {
    const {description, isEditMode, onClick, size = DEFAILT_SIZE} = props;

    if (!isEditMode && !description) {
        return null;
    }

    return (
        <Button view="flat" size="m" onClick={onClick} qa="action-button-description">
            <Icon data={iconDescription} size={size} />
        </Button>
    );
};
