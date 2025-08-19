import React from 'react';

import {CircleInfo} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import type {AppDispatch} from 'ui/store';
import {openDialog} from 'ui/store/actions/dialog';

import {
    DIALOG_ENTRY_DESCRIPTION,
    type OpenDialogEntryDescriptionArgs,
} from './DialogEntryDescriptionWrapper';

type Props = {
    description?: string;
    isEditMode: boolean;
    onClick: () => void;
    size?: number;
};

const DEFAILT_SIZE = 20;
export const MAX_ENTRY_DESCRIPTION_LENGTH = 36_000;

export const EntryAnnotationDescriptionButton = (props: Props) => {
    const {description, isEditMode, onClick, size = DEFAILT_SIZE} = props;

    if (!isEditMode && !description) {
        return null;
    }

    return (
        <Button view="flat" size="m" onClick={onClick} qa="action-button-description">
            <Icon data={CircleInfo} size={size} />
        </Button>
    );
};

export const openDialogEntryAnnotationDescription = (
    args: OpenDialogEntryDescriptionArgs['props'],
) => {
    return function (dispatch: AppDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_ENTRY_DESCRIPTION,
                props: {maxLength: MAX_ENTRY_DESCRIPTION_LENGTH, ...args},
            }),
        );
    };
};
