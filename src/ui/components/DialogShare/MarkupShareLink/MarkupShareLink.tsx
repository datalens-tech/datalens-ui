import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {ShareLink} from '../ShareLink/ShareLink';

import '../DialogShare.scss';

const i18n = I18n.keyset('component.dialog-share.view');

const b = block('dialog-share');

type MarkupShareLinkProps = {
    getLink: () => string;
    showDescription?: boolean;
    defaultSize?: string;
};

const EDITOR_MODE = {
    OLD: 'old',
    NEW: 'new',
};

export const MarkupShareLink: React.FC<MarkupShareLinkProps> = ({
    getLink,
    showDescription,
    defaultSize,
}) => {
    const [editorMode, setEditorMode] = React.useState(EDITOR_MODE.NEW);

    const getOldMarkup = React.useCallback(
        () => `{{iframe frameborder="0" src="${getLink()}"${defaultSize}}}`,
        [getLink, defaultSize],
    );
    const getNewMarkup = React.useCallback(
        () =>
            `/iframe/(src=${getLink()} frameborder=0 scrolling=no allowfullscreen=true${defaultSize})`,
        [getLink, defaultSize],
    );

    const renderMarkupSwitcher = () => {
        return (
            <div className={b('markup-switcher')}>
                <RadioButton onUpdate={setEditorMode} value={editorMode}>
                    <RadioButton.Option value={EDITOR_MODE.NEW}>
                        {i18n('label_new-editor')}
                    </RadioButton.Option>
                    <RadioButton.Option value={EDITOR_MODE.OLD}>
                        {i18n('label_old-editor')}
                    </RadioButton.Option>
                </RadioButton>
                <HelpPopover htmlContent={i18n('label_editors-hint')} />
            </div>
        );
    };

    const markupText = editorMode === EDITOR_MODE.OLD ? getOldMarkup() : getNewMarkup();

    return (
        <ShareLink
            title={i18n('label_markup')}
            description={i18n('label_markup-description')}
            text={markupText}
            textToCopy={markupText}
            showDescription={showDescription}
            additionalContent={renderMarkupSwitcher()}
        />
    );
};
