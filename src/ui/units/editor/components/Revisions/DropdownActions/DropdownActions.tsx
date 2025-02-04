import React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import {RevisionAction} from '../../../types/revisions';

interface DropdownActionsProps {
    onClick: (action: RevisionAction) => void;
    published: boolean;
    current: boolean;
    disabled: boolean;
    latest: boolean;
    editable: boolean;
}

const i18n = I18n.keyset('component.dialog-revisions.view');

export const DropdownActions: React.FC<DropdownActionsProps> = ({
    onClick,
    published,
    current,
    disabled,
    latest,
    editable,
}: DropdownActionsProps) => {
    function isHidden(action: RevisionAction) {
        switch (action) {
            case RevisionAction.Open:
                return current;
            case RevisionAction.Publish:
                return published || !editable;
            default:
                return false;
        }
    }

    const items = [
        {
            action: () => onClick(RevisionAction.Open),
            text: i18n('value_open-revision'),
            hidden: isHidden(RevisionAction.Open),
        },
        {
            action: () => onClick(RevisionAction.Publish),
            text: i18n('value_publish-revision'),
            hidden: isHidden(RevisionAction.Publish),
        },
    ];

    const isButtonDisabled = disabled || (current && published && latest) || (current && !editable);

    return (
        <DropdownMenu
            size="s"
            items={items}
            switcher={
                <Button view="flat" size="s" disabled={isButtonDisabled}>
                    <Icon data={Ellipsis} />
                </Button>
            }
        />
    );
};
