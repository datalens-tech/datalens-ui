import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {EntryUpdateMode, SaveChartControlsQa} from 'shared';

import iconLock from 'ui/assets/icons/lock.svg';

import './SaveButton.scss';

type SaveButtonProps = {
    onClick: (entry?: EntryUpdateMode) => void;
    canEdit: boolean;
    disabled: boolean;
    isSaveAsDraft: boolean;
};

const b = block('action-panel-save-button');

export const SaveButton: React.FC<SaveButtonProps> = (props: SaveButtonProps) => {
    const {disabled, canEdit, isSaveAsDraft} = props;

    let buttonText;

    if (disabled) {
        buttonText = 'button_saved';
    } else {
        buttonText = isSaveAsDraft ? 'button_save-as-draft' : 'button_save';
    }

    return (
        <Button
            view="action"
            size="m"
            onClick={() => {
                if (isSaveAsDraft) {
                    props.onClick(EntryUpdateMode.Save);
                    return;
                }

                props.onClick(EntryUpdateMode.Publish);
            }}
            disabled={disabled}
            key="button-save"
            className={b('save-btn')}
            qa={SaveChartControlsQa.SaveButton}
        >
            {canEdit ? null : <Icon data={iconLock} />}
            {i18n('component.chart-save-controls', buttonText)}
        </Button>
    );
};
