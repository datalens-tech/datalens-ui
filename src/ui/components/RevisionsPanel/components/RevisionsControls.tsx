import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import '../RevisionsPanel.scss';

type RevisionsControlsProps = {
    canEdit: boolean;
    isDraft?: boolean;
    isDeprecated?: boolean;
    onMakeActualClickCallback: () => void;
    onOpenActualClickCallback: () => void;
    onOpenRevisionsClickCallback?: () => void;
    onDeprecationConfirm?: () => void;
    onOpenDraftClickCallback?: () => void;
    isLoading: boolean;
    hideOpenButton?: boolean;
};

const b = block('revisions-panel');
const i18n = I18n.keyset('component.revisions-panel.view');

const RevisionsControls = ({
    canEdit,
    isDraft,
    isDeprecated,
    onDeprecationConfirm,
    onMakeActualClickCallback,
    onOpenActualClickCallback,
    onOpenRevisionsClickCallback,
    onOpenDraftClickCallback,
    isLoading,
    hideOpenButton,
}: RevisionsControlsProps) => {
    if (isDeprecated) {
        return (
            <div className={b('controls')}>
                {onDeprecationConfirm && (
                    <Button
                        view="outlined-contrast"
                        size="m"
                        className={b('button')}
                        onClick={onDeprecationConfirm}
                        qa="action-deprecation-confirm"
                        disabled={isLoading}
                    >
                        {i18n('button_confirm-deprecation')}
                    </Button>
                )}
            </div>
        );
    }

    if (isDraft) {
        return (
            <div className={b('controls')}>
                <Button
                    view="outlined-contrast"
                    size="m"
                    className={b('button')}
                    onClick={onOpenDraftClickCallback}
                    qa="action-open-draft"
                    disabled={isLoading}
                >
                    {i18n('button_open-draft')}
                </Button>
                {/* TODO: remove hideOpenButton when revisions panel will be supported
                everywhere */}
                {!hideOpenButton && (
                    <Button
                        view="outlined-contrast"
                        size="m"
                        className={b('button')}
                        onClick={onOpenRevisionsClickCallback}
                        qa="action-open-revisions"
                        disabled={isLoading}
                    >
                        {i18n('button_open-revisions')}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={b('controls')}>
            {canEdit && (
                <Button
                    view="outlined-contrast"
                    size="m"
                    className={b('button')}
                    onClick={onMakeActualClickCallback}
                    qa="action-make-actual"
                    loading={isLoading}
                >
                    {i18n('button_make-actual')}
                </Button>
            )}
            <Button
                view="outlined-contrast"
                size="m"
                className={b('button')}
                onClick={onOpenActualClickCallback}
                qa="action-open-actual"
                disabled={isLoading}
            >
                {i18n('button_open-actual')}
            </Button>
        </div>
    );
};

export default RevisionsControls;
