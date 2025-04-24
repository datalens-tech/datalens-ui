import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {DL} from 'ui/constants';

import {MODE_MINIMAL, PLACE} from '../../constants';

import {getDescriptionByPlace, getTitleByPlace} from './utils';

import './EmptyState.scss';

const i18n = I18n.keyset('component.navigation.view');
const b = block('dl-navigation-empty-state');

export type EmptyStateProps = {
    isEmptyFolder?: boolean;
    className?: string;
    mode: string;
    place: string;
    renderAction: () => React.ReactNode;
};

const HIDE_ACTION_PLACES: string[] = [PLACE.FAVORITES];

export const EmptyState = ({
    isEmptyFolder,
    className,
    mode,
    place,
    renderAction,
}: EmptyStateProps) => {
    const emptyText = isEmptyFolder ? getTitleByPlace(place) : i18n('label_not-found');
    const emptyDescription = isEmptyFolder ? getDescriptionByPlace(place) : '';

    const isTemplatePlace = place !== PLACE.ROOT;

    const emptyFolderName = isTemplatePlace ? 'template' : 'emptyDirectory';
    const name = isEmptyFolder ? emptyFolderName : 'notFound';

    const illustrationSize = mode === MODE_MINIMAL && !DL.IS_MOBILE ? 'm' : 'l';

    const renderTemplateAction =
        isEmptyFolder && isTemplatePlace && !HIDE_ACTION_PLACES.includes(place)
            ? () => <div className={b('action')}>{renderAction()}</div>
            : undefined;

    return (
        <div className={className}>
            <PlaceholderIllustration
                name={name}
                title={emptyText}
                description={emptyDescription}
                direction="column"
                size={illustrationSize}
                renderAction={renderTemplateAction}
            />
        </div>
    );
};
