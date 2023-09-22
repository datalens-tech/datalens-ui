import React from 'react';

import {I18n} from 'i18n';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {DL} from 'ui/constants';

import {MODE_MINIMAL} from '../../constants';

const i18n = I18n.keyset('component.navigation.view');

export type EmptyStateProps = {
    isEmptyFolder?: boolean;
    className?: string;
    mode: string;
};

export const EmptyState = ({isEmptyFolder, className, mode}: EmptyStateProps) => {
    const emptyText = isEmptyFolder ? i18n('label_empty-folder') : i18n('label_not-found');
    const name = isEmptyFolder ? 'emptyDirectory' : 'notFound';
    const illustrationSize = mode === MODE_MINIMAL && !DL.IS_MOBILE ? 'm' : 'l';

    return (
        <div className={className}>
            <PlaceholderIllustration
                name={name}
                title={emptyText}
                direction="column"
                size={illustrationSize}
            />
        </div>
    );
};
